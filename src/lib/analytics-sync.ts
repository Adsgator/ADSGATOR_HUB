import type { SupabaseClient } from '@supabase/supabase-js'
import { obterDadosCampanhasAds } from '@/lib/google-ads'
import { obterDadosGA4 } from '@/lib/google-analytics'

/**
 * Sync de Analytics — popula a tabela `analytics_snapshots` com dados agregados
 * de Google Ads e GA4 por cliente.
 *
 * A página /analytics consome dados AO VIVO via /api/analytics/[id]/live; esta
 * função cuida do HISTÓRICO persistido, que alimenta NewsContainer,
 * AlertaSaldoGoogle e os insights de IA. Antes disso, a tabela só era lida,
 * nunca escrita — daí as métricas zeradas.
 *
 * Grava uma linha por fonte ('google_ads' e 'ga4') por período.
 */

export interface ResultadoSyncCliente {
  cliente_id: string
  nome: string
  google_ads: 'ok' | 'pulado' | 'erro'
  ga4: 'ok' | 'pulado' | 'erro'
  erro?: string
}

interface ClienteSync {
  id: string
  nome: string
  google_ads_customer_id: string | null
  ga4_property_id: string | null
  google_ads_enabled: boolean | null
  ga4_enabled: boolean | null
}

/** Retorna o intervalo (primeiro/último dia) do mês informado. */
function intervaloMes(mesAno: string): { inicio: string; fim: string } {
  const [ano, mes] = mesAno.split('-').map(Number)
  const ultimoDia = new Date(ano, mes, 0).getDate()
  return {
    inicio: `${ano}-${String(mes).padStart(2, '0')}-01`,
    fim: `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`,
  }
}

/** Mês corrente no formato YYYY-MM. */
export function mesAtual(): string {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Sincroniza um cliente: busca dados das fontes habilitadas e grava snapshots.
 * Usa upsert por (cliente_id, fonte, periodo_inicio, periodo_fim) para ser
 * idempotente — rodar de novo no mesmo período atualiza em vez de duplicar.
 */
export async function sincronizarCliente(
  supabase: SupabaseClient,
  cliente: ClienteSync,
  mesAno: string,
): Promise<ResultadoSyncCliente> {
  const { inicio, fim } = intervaloMes(mesAno)
  const resultado: ResultadoSyncCliente = {
    cliente_id: cliente.id,
    nome: cliente.nome,
    google_ads: 'pulado',
    ga4: 'pulado',
  }

  // ── Google Ads ──────────────────────────────────────────────
  if (cliente.google_ads_enabled && cliente.google_ads_customer_id) {
    try {
      const campanhas = await obterDadosCampanhasAds(cliente.google_ads_customer_id, mesAno)
      const investimento = campanhas.reduce((s, c) => s + c.custo_total, 0)
      const impressoes = campanhas.reduce((s, c) => s + c.impressoes, 0)
      const cliques = campanhas.reduce((s, c) => s + c.cliques, 0)
      const conversoes = campanhas.reduce((s, c) => s + c.conversoes, 0)

      await supabase.from('analytics_snapshots').upsert(
        {
          cliente_id: cliente.id,
          fonte: 'google_ads',
          periodo_inicio: inicio,
          periodo_fim: fim,
          investimento,
          impressoes,
          cliques,
          ctr: impressoes > 0 ? cliques / impressoes : 0,
          conversoes,
          cpa: conversoes > 0 ? investimento / conversoes : 0,
          roas: investimento > 0 ? conversoes / investimento : 0,
        },
        { onConflict: 'cliente_id,fonte,periodo_inicio,periodo_fim' },
      )
      resultado.google_ads = 'ok'
    } catch (err) {
      resultado.google_ads = 'erro'
      resultado.erro = err instanceof Error ? err.message : String(err)
    }
  }

  // ── GA4 ─────────────────────────────────────────────────────
  if (cliente.ga4_enabled && cliente.ga4_property_id) {
    try {
      const ga4 = await obterDadosGA4(cliente.ga4_property_id, mesAno)

      await supabase.from('analytics_snapshots').upsert(
        {
          cliente_id: cliente.id,
          fonte: 'ga4',
          periodo_inicio: inicio,
          periodo_fim: fim,
          usuarios: Math.round(ga4.usuarios_novos),
          sessoes: Math.round(ga4.sessoes),
          conversoes: ga4.conversoes,
          taxa_conversao: ga4.sessoes > 0 ? ga4.conversoes / ga4.sessoes : 0,
        },
        { onConflict: 'cliente_id,fonte,periodo_inicio,periodo_fim' },
      )
      resultado.ga4 = 'ok'
    } catch (err) {
      resultado.ga4 = 'erro'
      resultado.erro = err instanceof Error ? err.message : String(err)
    }
  }

  return resultado
}

/**
 * Sincroniza todos os clientes com alguma integração habilitada.
 * Sequencial de propósito — evita estourar rate limits das APIs Google.
 */
export async function sincronizarTodos(
  supabase: SupabaseClient,
  mesAno: string = mesAtual(),
): Promise<ResultadoSyncCliente[]> {
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome, google_ads_customer_id, ga4_property_id, google_ads_enabled, ga4_enabled')
    .or('google_ads_enabled.eq.true,ga4_enabled.eq.true')

  const resultados: ResultadoSyncCliente[] = []
  for (const cliente of (clientes ?? []) as ClienteSync[]) {
    resultados.push(await sincronizarCliente(supabase, cliente, mesAno))
  }
  return resultados
}
