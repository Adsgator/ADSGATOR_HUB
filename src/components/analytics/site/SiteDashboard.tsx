'use client'

import { useMemo, useState } from 'react'
import { RefreshCw, Globe, Link2 } from 'lucide-react'
import type {
  KpisGA4Comparativo, LinhaPaginaGA4, LinhaOrigemGA4, LinhaDispositivoGA4,
  LinhaTipoUsuarioGA4, LinhaEventoGA4, LinhaHoraGA4, TecnologiaGA4, LinhaLocalGA4,
} from '@/lib/ga4-detalhes'
import { useDetalheAnalytics } from '@/lib/hooks/useAnalyticsDetalhes'
import { SecaoCard } from '../trafego/SecaoCard'
import { periodoDoPreset } from '../trafego/TrafegoDashboard'
import type { PresetPeriodo } from '../trafego/TrafegoDashboard'
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

const PRESETS: Array<{ id: PresetPeriodo; label: string }> = [
  { id: 'mes_atual',  label: 'Mês atual' },
  { id: 'mes_passado', label: 'Mês passado' },
  { id: '30d', label: '30 dias' },
  { id: '90d', label: '90 dias' },
]

interface SiteDashboardProps {
  clienteId:    string
  ga4Conectado: boolean
}

export function SiteDashboard({ clienteId, ga4Conectado }: SiteDashboardProps) {
  const [preset, setPreset] = useState<PresetPeriodo>('mes_atual')
  const [renovarTick, setRenovarTick] = useState(0)
  const periodo = useMemo(() => periodoDoPreset(preset), [preset])

  const base = { clienteId, fonte: 'ga4' as const, periodo, renovarTick, ativo: ga4Conectado }

  const kpis           = useDetalheAnalytics<KpisGA4Comparativo>({ ...base, dimensao: 'kpis' })
  const paginas        = useDetalheAnalytics<LinhaPaginaGA4[]>({ ...base, dimensao: 'paginas' })
  const aquisicao      = useDetalheAnalytics<LinhaOrigemGA4[]>({ ...base, dimensao: 'aquisicao' })
  const dispositivos   = useDetalheAnalytics<LinhaDispositivoGA4[]>({ ...base, dimensao: 'dispositivos' })
  const novoRecorrente = useDetalheAnalytics<LinhaTipoUsuarioGA4[]>({ ...base, dimensao: 'novo_recorrente' })
  const eventos        = useDetalheAnalytics<LinhaEventoGA4[]>({ ...base, dimensao: 'eventos' })
  const horarios       = useDetalheAnalytics<LinhaHoraGA4[]>({ ...base, dimensao: 'horarios' })
  const tecnologia     = useDetalheAnalytics<TecnologiaGA4>({ ...base, dimensao: 'tecnologia' })
  const geografia      = useDetalheAnalytics<LinhaLocalGA4[]>({ ...base, dimensao: 'geografia' })

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
        <div className="flex bg-surface-hover border border-surface-border rounded-[0.5rem] p-[0.1875rem] gap-[0.125rem]">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`h-[1.75rem] px-[0.625rem] rounded-[0.3125rem] text-[0.75rem] font-medium transition-all ${
                preset === p.id
                  ? 'bg-surface-card text-ink-primary shadow-sm'
                  : 'text-ink-muted hover:text-ink-secondary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-[0.625rem]">
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
        {kpis.dados && <KpiTilesGA4 dados={kpis.dados} />}
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
        {paginas.dados && <PaginasCard dados={paginas.dados} />}
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

      {/* ── Dispositivos + Novo×Recorrente ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1rem]">
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
      </div>

      {/* ── Eventos + Tecnologia ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1rem]">
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

        <SecaoCard
          titulo="Informações técnicas"
          carregando={tecnologia.carregando}
          erro={tecnologia.erro}
          meta={tecnologia.meta}
          vazio={(tecnologia.dados?.sistemas ?? []).length === 0 && (tecnologia.dados?.resolucoes ?? []).length === 0}
          aoTentarNovamente={tecnologia.recarregar}
        >
          {tecnologia.dados && <TecnologiaCard dados={tecnologia.dados} />}
        </SecaoCard>
      </div>

      {/* ── Geografia ── */}
      <SecaoCard
        titulo="Cidade, estado e país"
        carregando={geografia.carregando}
        erro={geografia.erro}
        meta={geografia.meta}
        vazio={(geografia.dados ?? []).length === 0}
        aoTentarNovamente={geografia.recarregar}
      >
        {geografia.dados && <GeografiaGA4Card dados={geografia.dados} />}
      </SecaoCard>
    </div>
  )
}
