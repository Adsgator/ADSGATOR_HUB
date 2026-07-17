'use client'

import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Megaphone, Link2 } from 'lucide-react'
import type {
  KpisAdsComparativo, LinhaDiaAds, LinhaTermoAds, DemografiaAds,
  LinhaLocalAds, DiasHorariosAds, LinhaDispositivoAds, CampanhaPeriodoAds,
} from '@/lib/ads-detalhes'
import type { Periodo } from '@/lib/analytics-periodo'
import { useDetalheAnalytics } from '@/lib/hooks/useAnalyticsDetalhes'
import { SecaoCard } from './SecaoCard'
import { KpiTilesAds } from './KpiTilesAds'
import { SerieDiariaCard } from './SerieDiariaCard'
import { TermosCard } from './TermosCard'
import { DemografiaAdsCard } from './DemografiaAdsCard'
import { DispositivosAdsCard } from './DispositivosAdsCard'
import { DiasHorariosCard } from './DiasHorariosCard'
import { GeografiaAdsCard } from './GeografiaAdsCard'
import { fmtMoeda } from './labels'

// ─── Dashboard Tráfego (Google Ads) — Analytics 2.0 F4 ──────────────────────
// Tudo que o dashboard Looker de Ads mostrava, por cliente: KPIs com delta,
// série diária, termos, demografia, geografia, dias/horários e dispositivos,
// com presets de período (comparativo automático no server) e filtro por
// campanha. Cada seção busca seu corte na rota de detalhes (cache 6h).

export type PresetPeriodo = 'mes_atual' | 'mes_passado' | '30d' | '90d'

const PRESETS: Array<{ id: PresetPeriodo; label: string }> = [
  { id: 'mes_atual',  label: 'Mês atual' },
  { id: 'mes_passado', label: 'Mês passado' },
  { id: '30d', label: '30 dias' },
  { id: '90d', label: '90 dias' },
]

const fmtLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function periodoDoPreset(preset: PresetPeriodo): Periodo {
  const hoje = new Date()
  switch (preset) {
    case 'mes_atual':
      return { inicio: fmtLocal(new Date(hoje.getFullYear(), hoje.getMonth(), 1)), fim: fmtLocal(hoje) }
    case 'mes_passado':
      return {
        inicio: fmtLocal(new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)),
        fim:    fmtLocal(new Date(hoje.getFullYear(), hoje.getMonth(), 0)),
      }
    case '30d':
      return { inicio: fmtLocal(new Date(hoje.getTime() - 29 * 86_400_000)), fim: fmtLocal(hoje) }
    case '90d':
      return { inicio: fmtLocal(new Date(hoje.getTime() - 89 * 86_400_000)), fim: fmtLocal(hoje) }
  }
}

interface TrafegoDashboardProps {
  clienteId:    string
  adsConectado: boolean
}

export function TrafegoDashboard({ clienteId, adsConectado }: TrafegoDashboardProps) {
  const [preset, setPreset] = useState<PresetPeriodo>('mes_atual')
  const [campanhaId, setCampanhaId] = useState('')
  const [renovarTick, setRenovarTick] = useState(0)
  const periodo = useMemo(() => periodoDoPreset(preset), [preset])

  // trocar de cliente zera o filtro de campanha (ids são por conta)
  useEffect(() => { setCampanhaId('') }, [clienteId])

  const base = { clienteId, fonte: 'ads' as const, periodo, renovarTick, ativo: adsConectado }
  const comFiltro = { ...base, campanhaId: campanhaId || undefined }

  const campanhas    = useDetalheAnalytics<CampanhaPeriodoAds[]>({ ...base, dimensao: 'campanhas' })
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

  return (
    <div className="space-y-[1rem]">
      {/* ── Controles: período + campanha + atualizar ── */}
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

        <select
          value={campanhaId}
          onChange={(e) => setCampanhaId(e.target.value)}
          className="h-[2.125rem] px-[0.625rem] rounded-lg bg-surface-card border border-surface-border text-[0.8125rem] text-ink-primary focus-ring max-w-[18rem]"
        >
          <option value="">Todas as campanhas</option>
          {(campanhas.dados ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} ({fmtMoeda(c.custo)})
            </option>
          ))}
        </select>

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

      {campanhaSelecionada && (
        <p className="text-[0.75rem] text-ink-muted -mt-[0.25rem]">
          Filtrando pela campanha <span className="text-ink-secondary font-medium">{campanhaSelecionada.nome}</span>
          {' '}— comparativo e todas as seções refletem só ela.
        </p>
      )}

      {/* ── KPIs com delta ── */}
      <SecaoCard
        titulo={`Resumo do período (${periodo.inicio.slice(8, 10)}/${periodo.inicio.slice(5, 7)} – ${periodo.fim.slice(8, 10)}/${periodo.fim.slice(5, 7)}) vs período anterior`}
        carregando={kpis.carregando}
        erro={kpis.erro}
        meta={kpis.meta}
        aoTentarNovamente={kpis.recarregar}
      >
        {kpis.dados && <KpiTilesAds dados={kpis.dados} />}
      </SecaoCard>

      {/* ── Série diária ── */}
      <SecaoCard
        titulo="Acompanhamento diário"
        carregando={serie.carregando}
        erro={serie.erro}
        meta={serie.meta}
        vazio={(serie.dados ?? []).length === 0}
        aoTentarNovamente={serie.recarregar}
      >
        {serie.dados && <SerieDiariaCard dados={serie.dados} />}
      </SecaoCard>

      {/* ── Termos de pesquisa ── */}
      <SecaoCard
        titulo="Termos de pesquisa"
        carregando={termos.carregando}
        erro={termos.erro}
        meta={termos.meta}
        vazio={(termos.dados ?? []).length === 0}
        aoTentarNovamente={termos.recarregar}
      >
        {termos.dados && <TermosCard dados={termos.dados} />}
      </SecaoCard>

      {/* ── Demografia + Dispositivos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1rem]">
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

      {/* ── Dias da semana + horários ── */}
      <SecaoCard
        titulo="Dias da semana e horários"
        carregando={diasHorarios.carregando}
        erro={diasHorarios.erro}
        meta={diasHorarios.meta}
        aoTentarNovamente={diasHorarios.recarregar}
      >
        {diasHorarios.dados && <DiasHorariosCard dados={diasHorarios.dados} />}
      </SecaoCard>

      {/* ── Geografia ── */}
      <SecaoCard
        titulo="Cidades e regiões (onde o usuário estava)"
        carregando={geografia.carregando}
        erro={geografia.erro}
        meta={geografia.meta}
        vazio={(geografia.dados ?? []).length === 0}
        aoTentarNovamente={geografia.recarregar}
      >
        {geografia.dados && <GeografiaAdsCard dados={geografia.dados} />}
      </SecaoCard>
    </div>
  )
}
