import type { SupabaseClient } from '@supabase/supabase-js'
import { Periodo, validarPeriodo } from './analytics-periodo'
import {
  kpisAdsComparativo, serieDiariaAds, termosPesquisaAds, demografiaAds,
  geografiaAds, diasHorariosAds, dispositivosAds, campanhasDoPeriodoAds,
  gruposAnuncioDoPeriodoAds, FiltroAds,
} from './ads-detalhes'
import {
  kpisGA4Comparativo, paginasGA4, paginasRawGA4, aquisicaoGA4, dispositivosGA4,
  novoVsRecorrenteGA4, eventosGA4, horariosGA4, tecnologiaGA4, geografiaGA4,
} from './ga4-detalhes'

// ─── ANALYTICS 2.0 (F3) — cache dos cortes detalhados ────────────────────────
// Une as camadas de dados (ads-detalhes/ga4-detalhes) à tabela
// analytics_detalhes: serve do cache dentro do TTL e renova on-demand.
// É o motor da rota GET /api/analytics/[id]/detalhes e, adiante, da Gator.
//
// Comportamento decidido (não regredir):
//   - Cache indisponível (tabela ainda sem migration, erro de leitura/escrita)
//     NUNCA bloqueia: busca fresco e avisa no log.
//   - Renovação que falha COM cache antigo disponível devolve o cache marcado
//     'desatualizado' + a mensagem do erro — dado real velho e sinalizado é
//     melhor que erro seco; sem cache nenhum, o erro LANÇA (nada de zeros).

export type FonteDetalhe = 'ads' | 'ga4'

export const DIMENSOES_DETALHE: Record<FonteDetalhe, readonly string[]> = {
  ads: [
    'kpis', 'serie', 'termos', 'demografia', 'geografia', 'dias_horarios',
    'dispositivos', 'campanhas', 'grupos_anuncio',
  ],
  ga4: ['kpis', 'paginas', 'paginas_raw', 'aquisicao', 'dispositivos', 'novo_recorrente', 'eventos', 'horarios', 'tecnologia', 'geografia'],
}

// Dimensões que ignoram o filtro de campanha/grupo — listam TODAS as opções
// pra alimentar os próprios seletores da UI (campanhasDoPeriodoAds não aceita
// filtro; grupos_anuncio aceita só campanhaId, pra escopar o dropdown).
const DIMENSOES_SEM_FILTRO_GRUPO = new Set(['campanhas'])

export interface DetalheAnalytics {
  fonte:          FonteDetalhe
  dimensao:       string
  periodo:        Periodo
  campanhaId:     string      // '' = sem filtro
  grupoAnuncioId: string      // '' = sem filtro
  payload:        unknown
  atualizadoEm:   string      // ISO
  cache:          'hit' | 'renovado' | 'desatualizado'
  erro?:          string      // presente quando 'desatualizado' (renovação falhou)
}

export interface ObterDetalheParams {
  supabase:        SupabaseClient
  userId:          string
  clienteId:       string
  contaAds?:       string | null // google_ads_customer_id
  propriedadeGa4?: string | null // ga4_property_id
  fonte:           FonteDetalhe
  dimensao:        string
  periodo:         Periodo
  campanhaId?:     string
  grupoAnuncioId?: string
  renovar?:        boolean       // força renovação mesmo dentro do TTL
}

// TTL: período que encosta nos últimos 3 dias ainda muda (conversões chegam
// atrasadas) → 6h; período encerrado há mais tempo é estável → 7 dias.
const TTL_RECENTE_MS = 6 * 60 * 60 * 1000
const TTL_FECHADO_MS = 7 * 24 * 60 * 60 * 1000

function ttlDoPeriodo(fim: string): number {
  const corte = new Date(Date.now() - 3 * 86_400_000).toISOString().slice(0, 10)
  return fim >= corte ? TTL_RECENTE_MS : TTL_FECHADO_MS
}

/** Busca o corte direto na fonte (BigQuery/GAQL/GA4) — sem cache. */
async function buscarFresco(p: ObterDetalheParams): Promise<unknown> {
  const filtro: FiltroAds | undefined = (p.campanhaId || p.grupoAnuncioId)
    ? { campanhaId: p.campanhaId, grupoAnuncioId: p.grupoAnuncioId }
    : undefined

  if (p.fonte === 'ads') {
    const conta = p.contaAds
    if (!conta) throw new Error('Cliente sem Google Ads conectado (customer ID ausente)')
    switch (p.dimensao) {
      case 'kpis':           return kpisAdsComparativo(conta, p.periodo, filtro)
      case 'serie':          return serieDiariaAds(conta, p.periodo, filtro)
      case 'termos':         return termosPesquisaAds(conta, p.periodo, filtro)
      case 'demografia':     return demografiaAds(conta, p.periodo, filtro)
      case 'geografia':      return geografiaAds(conta, p.periodo, filtro)
      case 'dias_horarios':  return diasHorariosAds(conta, p.periodo, filtro)
      case 'dispositivos':   return dispositivosAds(conta, p.periodo, filtro)
      case 'campanhas':      return campanhasDoPeriodoAds(conta, p.periodo)
      case 'grupos_anuncio': return gruposAnuncioDoPeriodoAds(conta, p.periodo, p.campanhaId)
    }
  } else {
    const prop = p.propriedadeGa4
    if (!prop) throw new Error('Cliente sem GA4 conectado (property ID ausente)')
    switch (p.dimensao) {
      case 'kpis':            return kpisGA4Comparativo(prop, p.periodo)
      case 'paginas':         return paginasGA4(prop, p.periodo)
      case 'paginas_raw':     return paginasRawGA4(prop, p.periodo)
      case 'aquisicao':       return aquisicaoGA4(prop, p.periodo)
      case 'dispositivos':    return dispositivosGA4(prop, p.periodo)
      case 'novo_recorrente': return novoVsRecorrenteGA4(prop, p.periodo)
      case 'eventos':         return eventosGA4(prop, p.periodo)
      case 'horarios':        return horariosGA4(prop, p.periodo)
      case 'tecnologia':      return tecnologiaGA4(prop, p.periodo)
      case 'geografia':       return geografiaGA4(prop, p.periodo)
    }
  }
  throw new Error(`Dimensão desconhecida: ${p.fonte}/${p.dimensao}`)
}

export async function obterDetalheAnalytics(p: ObterDetalheParams): Promise<DetalheAnalytics> {
  validarPeriodo(p.periodo)
  if (!DIMENSOES_DETALHE[p.fonte]?.includes(p.dimensao)) {
    throw new Error(`Dimensão inválida para ${p.fonte}: "${p.dimensao}" (aceitas: ${DIMENSOES_DETALHE[p.fonte].join(', ')})`)
  }
  const semFiltro = p.fonte !== 'ads' || DIMENSOES_SEM_FILTRO_GRUPO.has(p.dimensao)
  const campanhaId = semFiltro ? '' : (p.campanhaId ?? '')
  // grupos_anuncio usa campanhaId só pra ESCOPAR a lista, não é filtro de dado
  // (a dimensão em si já lista todos os grupos) — não entra na chave do grupo.
  const grupoAnuncioId = (semFiltro || p.dimensao === 'grupos_anuncio') ? '' : (p.grupoAnuncioId ?? '')

  const chave = {
    cliente_id:       p.clienteId,
    fonte:            p.fonte,
    dimensao:         p.dimensao,
    periodo_inicio:   p.periodo.inicio,
    periodo_fim:      p.periodo.fim,
    campanha_id:      campanhaId,
    grupo_anuncio_id: grupoAnuncioId,
  }

  // 1. cache — indisponível não bloqueia (ex.: migration ainda não aplicada)
  let emCache: { payload: unknown; atualizado_em: string } | null = null
  try {
    const { data, error } = await p.supabase
      .from('analytics_detalhes')
      .select('payload, atualizado_em')
      .match(chave)
      .eq('user_id', p.userId)
      .maybeSingle()
    if (error) throw error
    emCache = data
  } catch (err) {
    console.warn('[analytics-detalhes] cache indisponível (leitura):', err instanceof Error ? err.message : err)
  }

  const dentroDoTtl = emCache
    && Date.now() - new Date(emCache.atualizado_em).getTime() < ttlDoPeriodo(p.periodo.fim)
  if (emCache && dentroDoTtl && !p.renovar) {
    return {
      fonte: p.fonte, dimensao: p.dimensao, periodo: p.periodo, campanhaId, grupoAnuncioId,
      payload: emCache.payload, atualizadoEm: emCache.atualizado_em, cache: 'hit',
    }
  }

  // 2. renova na fonte
  let payload: unknown
  try {
    payload = await buscarFresco(p)
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : String(err)
    if (emCache) {
      // dado real velho e SINALIZADO é melhor que erro seco
      console.warn(`[analytics-detalhes] renovação falhou (${p.fonte}/${p.dimensao}) — servindo cache antigo:`, mensagem)
      return {
        fonte: p.fonte, dimensao: p.dimensao, periodo: p.periodo, campanhaId, grupoAnuncioId,
        payload: emCache.payload, atualizadoEm: emCache.atualizado_em,
        cache: 'desatualizado', erro: mensagem,
      }
    }
    throw err
  }

  // 3. grava — falha de escrita não derruba a resposta
  const atualizadoEm = new Date().toISOString()
  try {
    const { error } = await p.supabase
      .from('analytics_detalhes')
      .upsert(
        { ...chave, user_id: p.userId, payload, atualizado_em: atualizadoEm },
        { onConflict: 'cliente_id,fonte,dimensao,periodo_inicio,periodo_fim,campanha_id,grupo_anuncio_id' },
      )
    if (error) throw error
  } catch (err) {
    console.warn('[analytics-detalhes] cache indisponível (escrita):', err instanceof Error ? err.message : err)
  }

  return {
    fonte: p.fonte, dimensao: p.dimensao, periodo: p.periodo, campanhaId, grupoAnuncioId,
    payload, atualizadoEm, cache: 'renovado',
  }
}
