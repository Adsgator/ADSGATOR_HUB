'use client'

import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Globe, Link2 } from 'lucide-react'
import type {
  KpisGA4Comparativo, LinhaPaginaGA4, LinhaOrigemGA4, LinhaDispositivoGA4,
  LinhaTipoUsuarioGA4, LinhaEventoGA4, LinhaHoraGA4, TecnologiaGA4, GeografiaGA4,
} from '@/lib/ga4-detalhes'
import { useDetalheAnalytics } from '@/lib/hooks/useAnalyticsDetalhes'
import { SecaoCard } from '../trafego/SecaoCard'
import {
  FiltroPeriodo, periodoEfetivo, estadoPeriodoPadrao, ehPeriodoPadrao,
  diasDoPeriodo, serializarPeriodo, parsePeriodo, paramInicial,
  type EstadoPeriodo,
} from '../shared/FiltroPeriodo'
import { KpiTilesGA4 } from './KpiTilesGA4'
import { AquisicaoCard } from './AquisicaoCard'
import { PaginasCard } from './PaginasCard'
import { HorariosGA4Card } from './HorariosGA4Card'
import { DispositivosGA4Card, TecnologiaCard } from './DispositivosTechCards'
import { NovoRecorrenteCard, EventosCard } from './NovoRecorrenteEventosCards'
import { GeografiaGA4Card } from './GeografiaGA4Card'

// ─── Dashboard Site (GA4) — Analytics 2.0 F5 ─────────────────────────────────
// O dashboard SITE do Looker dentro do Hub: KPIs com delta, aquisição,
// páginas, dispositivos/tech, horários, novo×recorrente, eventos e geografia.

interface SiteDashboardProps {
  clienteId:    string
  ga4Conectado: boolean
}

export function SiteDashboard({ clienteId, ga4Conectado }: SiteDashboardProps) {
  // O período é deep-linkável e compartilha o param `periodo` com o Ads (só um
  // dashboard fica montado por vez). Campanha/grupo são exclusivos do Ads.
  const [estadoPeriodo, setEstadoPeriodo] = useState<EstadoPeriodo>(
    () => parsePeriodo(paramInicial('periodo')) ?? estadoPeriodoPadrao(),
  )
  const [renovarTick, setRenovarTick] = useState(0)
  const periodo = useMemo(() => periodoEfetivo(estadoPeriodo), [estadoPeriodo])
  const dias = useMemo(() => diasDoPeriodo(periodo), [periodo])

  // Espelha só o período na URL — não mexe em campanha/grupo (do Ads).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const per = serializarPeriodo(estadoPeriodo)
    if (per) params.set('periodo', per); else params.delete('periodo')
    const q = params.toString()
    window.history.replaceState(null, '', q ? `?${q}` : window.location.pathname)
  }, [estadoPeriodo])

  const base = { clienteId, fonte: 'ga4' as const, periodo, renovarTick, ativo: ga4Conectado }

  const kpis           = useDetalheAnalytics<KpisGA4Comparativo>({ ...base, dimensao: 'kpis' })
  const paginas        = useDetalheAnalytics<LinhaPaginaGA4[]>({ ...base, dimensao: 'paginas' })
  const paginasRaw     = useDetalheAnalytics<LinhaPaginaGA4[]>({ ...base, dimensao: 'paginas_raw' })
  const aquisicao      = useDetalheAnalytics<LinhaOrigemGA4[]>({ ...base, dimensao: 'aquisicao' })
  const dispositivos   = useDetalheAnalytics<LinhaDispositivoGA4[]>({ ...base, dimensao: 'dispositivos' })
  const novoRecorrente = useDetalheAnalytics<LinhaTipoUsuarioGA4[]>({ ...base, dimensao: 'novo_recorrente' })
  const eventos        = useDetalheAnalytics<LinhaEventoGA4[]>({ ...base, dimensao: 'eventos' })
  const horarios       = useDetalheAnalytics<LinhaHoraGA4[]>({ ...base, dimensao: 'horarios' })
  const tecnologia     = useDetalheAnalytics<TecnologiaGA4>({ ...base, dimensao: 'tecnologia' })
  const geografia      = useDetalheAnalytics<GeografiaGA4>({ ...base, dimensao: 'geografia' })

  if (!ga4Conectado) {
    return (
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[3rem] text-center">
        <Globe className="w-[2.5rem] h-[2.5rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1.25} />
        <h3 className="text-ink-primary font-semibold text-[1rem] mb-[0.5rem]">GA4 não conectado</h3>
        <p className="text-ink-secondary text-[0.875rem] max-w-[26rem] mx-auto mb-[1rem]">
          Para ver o dashboard do site deste cliente, preencha o property ID e ligue o
          toggle do GA4 na seção Integrações do cliente.
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

  return (
    <div className="space-y-[1rem]">
      {/* ── Controles ── */}
      <div className="flex items-center gap-[0.625rem] flex-wrap">
        <FiltroPeriodo estado={estadoPeriodo} onChange={setEstadoPeriodo} />

        <div className="ml-auto flex items-center gap-[0.625rem]">
          {!ehPeriodoPadrao(estadoPeriodo) && (
            <button
              onClick={() => setEstadoPeriodo(estadoPeriodoPadrao())}
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

      {/* ── KPIs ── */}
      <SecaoCard
        titulo={`Informações gerais (${periodo.inicio.slice(8, 10)}/${periodo.inicio.slice(5, 7)} – ${periodo.fim.slice(8, 10)}/${periodo.fim.slice(5, 7)}) vs período anterior`}
        carregando={kpis.carregando}
        erro={kpis.erro}
        meta={kpis.meta}
        aoTentarNovamente={kpis.recarregar}
      >
        {kpis.dados && <KpiTilesGA4 dados={kpis.dados} dispositivos={dispositivos.dados ?? undefined} dias={dias} />}
      </SecaoCard>

      {/* ── Aquisição ── */}
      <SecaoCard
        titulo="De onde vem o tráfego (origem / mídia)"
        carregando={aquisicao.carregando}
        erro={aquisicao.erro}
        meta={aquisicao.meta}
        vazio={(aquisicao.dados ?? []).length === 0}
        aoTentarNovamente={aquisicao.recarregar}
      >
        {aquisicao.dados && <AquisicaoCard dados={aquisicao.dados} />}
      </SecaoCard>

      {/* ── Páginas ── */}
      <SecaoCard
        titulo="Quais páginas são acessadas"
        carregando={paginas.carregando}
        erro={paginas.erro}
        meta={paginas.meta}
        vazio={(paginas.dados ?? []).length === 0}
        aoTentarNovamente={paginas.recarregar}
      >
        {paginas.dados && <PaginasCard dados={paginas.dados} dadosBrutos={paginasRaw.dados ?? undefined} />}
      </SecaoCard>

      {/* ── Horários ── */}
      <SecaoCard
        titulo="Acompanhamento por hora do dia"
        carregando={horarios.carregando}
        erro={horarios.erro}
        meta={horarios.meta}
        aoTentarNovamente={horarios.recarregar}
      >
        {horarios.dados && <HorariosGA4Card dados={horarios.dados} />}
      </SecaoCard>

      {/* ── Dispositivos ── */}
      <SecaoCard
        titulo="Por dispositivo"
        carregando={dispositivos.carregando}
        erro={dispositivos.erro}
        meta={dispositivos.meta}
        vazio={(dispositivos.dados ?? []).length === 0}
        aoTentarNovamente={dispositivos.recarregar}
      >
        {dispositivos.dados && <DispositivosGA4Card dados={dispositivos.dados} />}
      </SecaoCard>

      {/* ── Novo×Recorrente + Eventos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1rem]">
        <SecaoCard
          titulo="Visitante novo × recorrente"
          carregando={novoRecorrente.carregando}
          erro={novoRecorrente.erro}
          meta={novoRecorrente.meta}
          vazio={(novoRecorrente.dados ?? []).length === 0}
          aoTentarNovamente={novoRecorrente.recarregar}
        >
          {novoRecorrente.dados && <NovoRecorrenteCard dados={novoRecorrente.dados} />}
        </SecaoCard>

        <SecaoCard
          titulo="Eventos disparados"
          carregando={eventos.carregando}
          erro={eventos.erro}
          meta={eventos.meta}
          vazio={(eventos.dados ?? []).length === 0}
          aoTentarNovamente={eventos.recarregar}
        >
          {eventos.dados && <EventosCard dados={eventos.dados} />}
        </SecaoCard>
      </div>

      {/* ── Informações técnicas ── */}
      <SecaoCard
        titulo="Informações técnicas dos dispositivos"
        carregando={tecnologia.carregando}
        erro={tecnologia.erro}
        meta={tecnologia.meta}
        vazio={(tecnologia.dados?.sistemas ?? []).length === 0 && (tecnologia.dados?.resolucoes ?? []).length === 0}
        aoTentarNovamente={tecnologia.recarregar}
      >
        {tecnologia.dados && <TecnologiaCard dados={tecnologia.dados} />}
      </SecaoCard>

      {/* ── Geografia ── */}
      <SecaoCard
        titulo="Cidade, estado e país"
        carregando={geografia.carregando}
        erro={geografia.erro}
        meta={geografia.meta}
        vazio={!!geografia.dados && geografia.dados.cidades.length === 0 && geografia.dados.estados.length === 0 && geografia.dados.paises.length === 0}
        aoTentarNovamente={geografia.recarregar}
      >
        {geografia.dados && <GeografiaGA4Card dados={geografia.dados} />}
      </SecaoCard>

      {/* Rodapé (réplica do Looker GA4-8) */}
      <p className="text-ink-muted text-[0.6875rem] text-center pt-[0.25rem]">
        Os dados não são em tempo real. Fuso: (GMT-03:00) Horário de Brasília.
      </p>
    </div>
  )
}
