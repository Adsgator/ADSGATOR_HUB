'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { RefreshCw, Megaphone, Link2 } from 'lucide-react'
import type {
  KpisAdsComparativo, LinhaDiaAds, LinhaTermoAds, DemografiaAds,
  LinhaLocalAds, DiasHorariosAds, LinhaDispositivoAds, CampanhaPeriodoAds,
  GrupoAnuncioPeriodoAds,
} from '@/lib/ads-detalhes'
import { useDetalheAnalytics } from '@/lib/hooks/useAnalyticsDetalhes'
import { SecaoCard } from './SecaoCard'
import { KpiTilesAds } from './KpiTilesAds'
import { SerieDiariaCard } from './SerieDiariaCard'
import { TabelaCompacta } from './TabelaCompacta'
import { TermosCard } from './TermosCard'
import { DemografiaAdsCard } from './DemografiaAdsCard'
import { DispositivosAdsCard } from './DispositivosAdsCard'
import { DiasHorariosCard } from './DiasHorariosCard'
import { GeografiaAdsCard } from './GeografiaAdsCard'
import { fmtMoeda } from './labels'
import {
  FiltroPeriodo, periodoEfetivo, estadoPeriodoPadrao, ehPeriodoPadrao,
  diasDoPeriodo, fmtDataExtensa, serializarPeriodo, parsePeriodo, paramInicial,
  type EstadoPeriodo,
} from '../shared/FiltroPeriodo'

// ─── Dashboard Tráfego (Google Ads) — réplica do Looker (Analytics 2.0) ─────
// Ordem das seções segue os 6 prints do Looker (docs/DASHBOARD_GADS_SPEC.md):
// KPIs em 3 grupos → gráfico diário (eixo único) + prévias compactas de
// termos/horário → tabela completa de termos → geografia (Cidade/Estado/País)
// → demografia (tabela + 4 gráficos) → dias/horário/dispositivo.

interface TrafegoDashboardProps {
  clienteId:    string
  adsConectado: boolean
}

export function TrafegoDashboard({ clienteId, adsConectado }: TrafegoDashboardProps) {
  // Estado inicial vem da URL (deep-link / refresh) — ver paramInicial().
  const [estadoPeriodo, setEstadoPeriodo] = useState<EstadoPeriodo>(
    () => parsePeriodo(paramInicial('periodo')) ?? estadoPeriodoPadrao(),
  )
  const [campanhaId, setCampanhaId] = useState(() => paramInicial('campanha'))
  const [grupoAnuncioId, setGrupoAnuncioId] = useState(() => paramInicial('grupo'))
  const [renovarTick, setRenovarTick] = useState(0)
  const periodo = useMemo(() => periodoEfetivo(estadoPeriodo), [estadoPeriodo])
  const dias = useMemo(() => diasDoPeriodo(periodo), [periodo])

  // trocar de cliente zera os filtros (ids são por conta) — pula a montagem
  // pra não apagar o filtro vindo da URL.
  const clienteMontado = useRef(false)
  useEffect(() => {
    if (!clienteMontado.current) { clienteMontado.current = true; return }
    setCampanhaId(''); setGrupoAnuncioId('')
  }, [clienteId])
  // trocar de campanha zera o grupo (grupo pertence a UMA campanha) — idem.
  const campanhaMontada = useRef(false)
  useEffect(() => {
    if (!campanhaMontada.current) { campanhaMontada.current = true; return }
    setGrupoAnuncioId('')
  }, [campanhaId])

  // Espelha período + campanha + grupo na URL (sem apagar aba/cliente, que a
  // página controla). Idempotente na montagem: reescreve o que já veio da URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const per = serializarPeriodo(estadoPeriodo)
    if (per) params.set('periodo', per); else params.delete('periodo')
    if (campanhaId) params.set('campanha', campanhaId); else params.delete('campanha')
    if (grupoAnuncioId) params.set('grupo', grupoAnuncioId); else params.delete('grupo')
    const q = params.toString()
    window.history.replaceState(null, '', q ? `?${q}` : window.location.pathname)
  }, [estadoPeriodo, campanhaId, grupoAnuncioId])

  const base = { clienteId, fonte: 'ads' as const, periodo, renovarTick, ativo: adsConectado }
  const comFiltro = { ...base, campanhaId: campanhaId || undefined, grupoAnuncioId: grupoAnuncioId || undefined }

  const campanhas    = useDetalheAnalytics<CampanhaPeriodoAds[]>({ ...base, dimensao: 'campanhas' })
  const grupos       = useDetalheAnalytics<GrupoAnuncioPeriodoAds[]>({ ...base, campanhaId: campanhaId || undefined, dimensao: 'grupos_anuncio' })
  const kpis         = useDetalheAnalytics<KpisAdsComparativo>({ ...comFiltro, dimensao: 'kpis' })
  const serie        = useDetalheAnalytics<LinhaDiaAds[]>({ ...comFiltro, dimensao: 'serie' })
  const termos       = useDetalheAnalytics<LinhaTermoAds[]>({ ...comFiltro, dimensao: 'termos' })
  const demografia   = useDetalheAnalytics<DemografiaAds>({ ...comFiltro, dimensao: 'demografia' })
  const geografia    = useDetalheAnalytics<LinhaLocalAds[]>({ ...comFiltro, dimensao: 'geografia' })
  const diasHorarios = useDetalheAnalytics<DiasHorariosAds>({ ...comFiltro, dimensao: 'dias_horarios' })
  const dispositivos = useDetalheAnalytics<LinhaDispositivoAds[]>({ ...comFiltro, dimensao: 'dispositivos' })

  if (!adsConectado) {
    return (
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[3rem] text-center">
        <Megaphone className="w-[2.5rem] h-[2.5rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1.25} />
        <h3 className="text-ink-primary font-semibold text-[1rem] mb-[0.5rem]">Google Ads não conectado</h3>
        <p className="text-ink-secondary text-[0.875rem] max-w-[26rem] mx-auto mb-[1rem]">
          Para ver o dashboard de tráfego deste cliente, preencha o customer ID e ligue o
          toggle do Google Ads na seção Integrações do cliente.
        </p>
        <a
          href={`/clientes/${clienteId}?foco=integracoes`}
          className="inline-flex items-center gap-[0.375rem] text-ads-500 text-[0.8125rem] font-medium hover:underline"
        >
          <Link2 className="w-[0.8125rem] h-[0.8125rem]" strokeWidth={2} />
          Abrir Integrações do cliente
        </a>
      </div>
    )
  }

  const atualizadoEm = kpis.meta?.atualizadoEm
  const campanhaSelecionada = campanhas.dados?.find((c) => c.id === campanhaId)
  const grupoSelecionado = grupos.dados?.find((g) => g.id === grupoAnuncioId)

  // Prévias compactas (GADS-2) reaproveitam dados já buscados — sem query extra.
  const termosCompactos = (termos.dados ?? []).slice(0, 10).map((t) => ({
    chave: t.termo, label: t.termo, impressoes: t.impressoes, cliques: t.cliques,
  }))
  const horariosCompactos = [...(diasHorarios.dados?.porHora ?? [])]
    .sort((a, b) => b.impressoes - a.impressoes)
    .slice(0, 8)
    .map((h) => ({ chave: String(h.hora), label: `${h.hora}h`, impressoes: h.impressoes, cliques: h.cliques }))

  return (
    <div className="space-y-[1rem]">
      {/* ── Controles: período + campanha + grupo de anúncios + atualizar ── */}
      <div className="flex items-center gap-[0.625rem] flex-wrap">
        <FiltroPeriodo estado={estadoPeriodo} onChange={setEstadoPeriodo} />

        <select
          value={campanhaId}
          onChange={(e) => setCampanhaId(e.target.value)}
          className="h-[2.125rem] px-[0.625rem] rounded-lg bg-surface-card border border-surface-border text-[0.8125rem] text-ink-primary focus-ring max-w-[16rem]"
        >
          <option value="">Todas as campanhas</option>
          {(campanhas.dados ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.nome} ({fmtMoeda(c.custo)})</option>
          ))}
        </select>

        <select
          value={grupoAnuncioId}
          onChange={(e) => setGrupoAnuncioId(e.target.value)}
          className="h-[2.125rem] px-[0.625rem] rounded-lg bg-surface-card border border-surface-border text-[0.8125rem] text-ink-primary focus-ring max-w-[16rem] disabled:opacity-50"
          disabled={(grupos.dados ?? []).length === 0}
        >
          <option value="">Todos os grupos de anúncios</option>
          {(grupos.dados ?? []).map((g) => (
            <option key={g.id} value={g.id}>{g.nome} ({fmtMoeda(g.custo)})</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-[0.625rem]">
          {(campanhaId || grupoAnuncioId || !ehPeriodoPadrao(estadoPeriodo)) && (
            <button
              onClick={() => { setCampanhaId(''); setGrupoAnuncioId(''); setEstadoPeriodo(estadoPeriodoPadrao()) }}
              className="text-[0.75rem] font-medium text-ads-500 hover:underline"
            >
              Limpar filtros
            </button>
          )}
          {atualizadoEm && (
            <span className="text-ink-muted text-[0.6875rem]">
              Atualizado {new Date(atualizadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => setRenovarTick((t) => t + 1)}
            className="inline-flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-[0.75rem] font-medium text-ink-secondary hover:text-ink-primary transition-colors"
            title="Buscar dados frescos agora (ignora o cache)"
          >
            <RefreshCw className={`w-[0.75rem] h-[0.75rem] ${kpis.carregando ? 'animate-spin' : ''}`} strokeWidth={2} />
            Atualizar
          </button>
        </div>
      </div>

      {(campanhaSelecionada || grupoSelecionado) && (
        <p className="text-[0.75rem] text-ink-muted -mt-[0.25rem]">
          Filtrando por {grupoSelecionado
            ? <>grupo de anúncios <span className="text-ink-secondary font-medium">{grupoSelecionado.nome}</span></>
            : <>campanha <span className="text-ink-secondary font-medium">{campanhaSelecionada?.nome}</span></>}
          {' '}— comparativo e todas as seções refletem só esse recorte.
        </p>
      )}

      <p className="text-ink-muted text-[0.75rem]">
        Período: <span className="text-ink-secondary font-medium">{fmtDataExtensa(periodo.inicio)} – {fmtDataExtensa(periodo.fim)}</span>
      </p>

      {/* ── KPIs em 3 grupos (Interações, Desempenho+dispositivo, %) ── */}
      <SecaoCard
        titulo="Visão geral"
        carregando={kpis.carregando}
        erro={kpis.erro}
        meta={kpis.meta}
        aoTentarNovamente={kpis.recarregar}
      >
        {kpis.dados && <KpiTilesAds dados={kpis.dados} dispositivos={dispositivos.dados ?? undefined} dias={dias} />}
      </SecaoCard>

      {/* ── Gráfico de acompanhamento + prévias compactas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-[1rem]">
        <SecaoCard
          titulo="Gráfico de acompanhamento"
          carregando={serie.carregando}
          erro={serie.erro}
          meta={serie.meta}
          vazio={(serie.dados ?? []).length === 0}
          aoTentarNovamente={serie.recarregar}
        >
          {serie.dados && <SerieDiariaCard dados={serie.dados} />}
        </SecaoCard>

        <div className="space-y-[1rem]">
          <TabelaCompacta titulo="Top pesquisas" linhas={termosCompactos} />
          <TabelaCompacta titulo="Resultados pelo horário" linhas={horariosCompactos} />
        </div>
      </div>

      {/* ── Tabela completa de termos ── */}
      <SecaoCard
        titulo="Principais termos e palavras nas pesquisas que mostraram seus anúncios"
        carregando={termos.carregando}
        erro={termos.erro}
        meta={termos.meta}
        vazio={(termos.dados ?? []).length === 0}
        aoTentarNovamente={termos.recarregar}
      >
        {termos.dados && <TermosCard dados={termos.dados} />}
      </SecaoCard>

      {/* ── Geografia: Cidade / Estado / País ── */}
      <SecaoCard
        titulo="Métricas de cidade, estado e país"
        carregando={geografia.carregando}
        erro={geografia.erro}
        meta={geografia.meta}
        aoTentarNovamente={geografia.recarregar}
      >
        {geografia.dados && <GeografiaAdsCard dados={geografia.dados} />}
      </SecaoCard>

      {/* ── Demografia ── */}
      <SecaoCard
        titulo="Dados demográficos"
        carregando={demografia.carregando}
        erro={demografia.erro}
        meta={demografia.meta}
        vazio={(demografia.dados?.faixasEtarias ?? []).length === 0 && (demografia.dados?.generos ?? []).length === 0}
        aoTentarNovamente={demografia.recarregar}
      >
        {demografia.dados && <DemografiaAdsCard dados={demografia.dados} />}
      </SecaoCard>

      {/* ── Dias da semana + horário ── */}
      <SecaoCard
        titulo="Dias da semana e horário do dia"
        carregando={diasHorarios.carregando}
        erro={diasHorarios.erro}
        meta={diasHorarios.meta}
        aoTentarNovamente={diasHorarios.recarregar}
      >
        {diasHorarios.dados && <DiasHorariosCard dados={diasHorarios.dados} />}
      </SecaoCard>

      {/* ── Dispositivos ── */}
      <SecaoCard
        titulo="Dispositivos"
        carregando={dispositivos.carregando}
        erro={dispositivos.erro}
        meta={dispositivos.meta}
        vazio={(dispositivos.dados ?? []).length === 0}
        aoTentarNovamente={dispositivos.recarregar}
      >
        {dispositivos.dados && <DispositivosAdsCard dados={dispositivos.dados} />}
      </SecaoCard>
    </div>
  )
}
