'use client'

import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import {
  ArrowDownRight, ArrowUpRight, Minus, Megaphone, Globe, Link2,
} from 'lucide-react'
import { useDetalheAnalytics } from '@/lib/hooks/useAnalyticsDetalhes'
import { variacaoPercentual, type Periodo } from '@/lib/analytics-periodo'
import type { KpisAdsComparativo, LinhaDiaAds } from '@/lib/ads-detalhes'
import type { KpisGA4Comparativo, LinhaDiaGA4 } from '@/lib/ga4-detalhes'
import { fmtConv, fmtMoeda, fmtNum, fmtPct } from '../trafego/labels'

// ─── Visão geral combinada (Ads + Site) — panorama de relance ────────────────
// Não é o dashboard detalhado: são os KPIs-chave de cada fonte com delta +
// mini-tendência, degradando por cliente (Ads-only, Site-only ou os dois; sem
// nenhum → CTA de conexão). Mesma fonte cacheada dos dashboards → números batem.

type Sentido = 'boa' | 'ruim' | 'neutra'

interface KpiSpec {
  label: string
  atual: number
  anterior: number
  fmt: (v: number) => string
  subida: Sentido
}

function corDelta(delta: number, subida: Sentido): string {
  if (subida === 'neutra') return 'text-ink-muted'
  const melhorou = subida === 'boa' ? delta > 0 : delta < 0
  return melhorou ? 'text-status-green' : 'text-status-red'
}

function MiniKpi({ spec, dias }: { spec: KpiSpec; dias: number }) {
  const delta = variacaoPercentual(spec.atual, spec.anterior)
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg px-[0.75rem] py-[0.625rem]">
      <p className="text-ink-muted text-[0.625rem] uppercase tracking-wide font-semibold mb-[0.25rem] truncate">{spec.label}</p>
      <p className="text-ink-primary text-[1.125rem] font-bold leading-none">{spec.fmt(spec.atual)}</p>
      <p className="mt-[0.3125rem] flex items-center gap-[0.25rem] text-[0.625rem] font-medium">
        {delta === null ? (
          <span className="inline-flex items-center gap-[0.1875rem] text-ink-muted">
            <Minus className="w-[0.5625rem] h-[0.5625rem]" strokeWidth={2} />sem base
          </span>
        ) : (
          <span className={`inline-flex items-center gap-[0.125rem] ${corDelta(delta, spec.subida)}`}>
            {delta >= 0
              ? <ArrowUpRight className="w-[0.625rem] h-[0.625rem]" strokeWidth={2.25} />
              : <ArrowDownRight className="w-[0.625rem] h-[0.625rem]" strokeWidth={2.25} />}
            {Math.abs(delta).toFixed(1).replace('.', ',')}%
            <span className="text-ink-muted font-normal ml-[0.125rem]">de {dias}d</span>
          </span>
        )}
      </p>
    </div>
  )
}

function Sparkline({ dados, cor, chave }: { dados: Array<Record<string, number | string>>; cor: string; chave: string }) {
  if (dados.length < 2) return null
  const id = `spark-${chave}`
  return (
    <div className="h-[3rem] mt-[0.25rem]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dados} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={cor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey={chave} stroke={cor} strokeWidth={1.75} fill={`url(#${id})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function BlocoCard({ titulo, icone: Icone, corIcone, children }: {
  titulo: string; icone: typeof Megaphone; corIcone: string; children: React.ReactNode
}) {
  return (
    <div className="bg-surface-hover/40 border border-surface-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-[0.5rem] px-[0.875rem] py-[0.625rem] border-b border-surface-border bg-surface-hover/60">
        <Icone className={`w-[0.9375rem] h-[0.9375rem] ${corIcone}`} strokeWidth={2} />
        <p className="text-ink-primary text-[0.875rem] font-semibold">{titulo}</p>
      </div>
      <div className="p-[0.875rem]">{children}</div>
    </div>
  )
}

function BlocoCta({ titulo, icone: Icone, texto, clienteId }: {
  titulo: string; icone: typeof Megaphone; texto: string; clienteId: string
}) {
  return (
    <BlocoCard titulo={titulo} icone={Icone} corIcone="text-ink-muted">
      <div className="text-center py-[1.25rem]">
        <p className="text-ink-secondary text-[0.8125rem] max-w-[22rem] mx-auto mb-[0.75rem]">{texto}</p>
        <a
          href={`/clientes/${clienteId}?foco=integracoes`}
          className="inline-flex items-center gap-[0.375rem] text-ads-500 text-[0.8125rem] font-medium hover:underline"
        >
          <Link2 className="w-[0.8125rem] h-[0.8125rem]" strokeWidth={2} />
          Conectar nas Integrações do cliente
        </a>
      </div>
    </BlocoCard>
  )
}

function EstadoSecao({ carregando, erro }: { carregando: boolean; erro: string | null }) {
  if (carregando) return <div className="h-[7rem] rounded-lg skeleton-shimmer" />
  if (erro) return <p className="text-status-red text-[0.75rem] py-[1rem]">Erro ao carregar: {erro}</p>
  return null
}

function BlocoAds({ clienteId, periodo, dias }: { clienteId: string; periodo: Periodo; dias: number }) {
  const kpis  = useDetalheAnalytics<KpisAdsComparativo>({ clienteId, fonte: 'ads', dimensao: 'kpis', periodo, ativo: true })
  const serie = useDetalheAnalytics<LinhaDiaAds[]>({ clienteId, fonte: 'ads', dimensao: 'serie', periodo, ativo: true })

  return (
    <BlocoCard titulo="Tráfego (Google Ads)" icone={Megaphone} corIcone="text-ads-500">
      {!kpis.dados ? (
        <EstadoSecao carregando={kpis.carregando} erro={kpis.erro} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-[0.5rem]">
            {([
              { label: 'Investimento', atual: kpis.dados.atual.custo,      anterior: kpis.dados.anterior.custo,      fmt: fmtMoeda, subida: 'neutra' },
              { label: 'Cliques',      atual: kpis.dados.atual.cliques,    anterior: kpis.dados.anterior.cliques,    fmt: fmtNum,   subida: 'boa' },
              { label: 'Conversões',   atual: kpis.dados.atual.conversoes, anterior: kpis.dados.anterior.conversoes, fmt: fmtConv,  subida: 'boa' },
              { label: 'CPA',          atual: kpis.dados.atual.cpa,        anterior: kpis.dados.anterior.cpa,        fmt: fmtMoeda, subida: 'ruim' },
              { label: 'CTR',          atual: kpis.dados.atual.ctr,        anterior: kpis.dados.anterior.ctr,        fmt: fmtPct,   subida: 'boa' },
            ] as KpiSpec[]).map((spec) => <MiniKpi key={spec.label} spec={spec} dias={dias} />)}
          </div>
          {serie.dados && <Sparkline dados={serie.dados as unknown as Array<Record<string, number>>} cor="#3B82F6" chave="custo" />}
        </>
      )}
    </BlocoCard>
  )
}

function BlocoSite({ clienteId, periodo, dias }: { clienteId: string; periodo: Periodo; dias: number }) {
  const kpis  = useDetalheAnalytics<KpisGA4Comparativo>({ clienteId, fonte: 'ga4', dimensao: 'kpis', periodo, ativo: true })
  const serie = useDetalheAnalytics<LinhaDiaGA4[]>({ clienteId, fonte: 'ga4', dimensao: 'serie', periodo, ativo: true })

  return (
    <BlocoCard titulo="Site (GA4)" icone={Globe} corIcone="text-status-blue">
      {!kpis.dados ? (
        <EstadoSecao carregando={kpis.carregando} erro={kpis.erro} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-[0.5rem]">
            {([
              { label: 'Sessões',    atual: kpis.dados.atual.sessoes,         anterior: kpis.dados.anterior.sessoes,         fmt: fmtNum, subida: 'boa' },
              { label: 'Usuários',   atual: kpis.dados.atual.usuariosAtivos,  anterior: kpis.dados.anterior.usuariosAtivos,  fmt: fmtNum, subida: 'boa' },
              { label: 'Engajamento', atual: kpis.dados.atual.taxaEngajamento, anterior: kpis.dados.anterior.taxaEngajamento, fmt: fmtPct, subida: 'boa' },
              { label: 'Rejeição',   atual: kpis.dados.atual.taxaRejeicao,    anterior: kpis.dados.anterior.taxaRejeicao,    fmt: fmtPct, subida: 'ruim' },
            ] as KpiSpec[]).map((spec) => <MiniKpi key={spec.label} spec={spec} dias={dias} />)}
          </div>
          {serie.dados && <Sparkline dados={serie.dados as unknown as Array<Record<string, number>>} cor="#22c55e" chave="sessoes" />}
        </>
      )}
    </BlocoCard>
  )
}

interface VisaoGeralCombinadaProps {
  clienteId: string
  adsAtivo:  boolean
  ga4Ativo:  boolean
  periodo:   Periodo
  dias:      number
}

export function VisaoGeralCombinada({ clienteId, adsAtivo, ga4Ativo, periodo, dias }: VisaoGeralCombinadaProps) {
  if (!adsAtivo && !ga4Ativo) {
    return (
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[2.5rem] text-center mb-[2rem]">
        <Globe className="w-[2.25rem] h-[2.25rem] text-ink-muted mx-auto mb-[0.75rem]" strokeWidth={1.25} />
        <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[0.375rem]">Sem analytics conectado</h3>
        <p className="text-ink-secondary text-[0.8125rem] max-w-[24rem] mx-auto mb-[0.75rem]">
          Conecte Google Ads e/ou GA4 nas Integrações do cliente para ver o panorama combinado aqui.
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1rem] mb-[2rem]">
      {adsAtivo
        ? <BlocoAds clienteId={clienteId} periodo={periodo} dias={dias} />
        : <BlocoCta titulo="Tráfego (Google Ads)" icone={Megaphone} clienteId={clienteId}
            texto="Google Ads ainda não conectado para este cliente." />}
      {ga4Ativo
        ? <BlocoSite clienteId={clienteId} periodo={periodo} dias={dias} />
        : <BlocoCta titulo="Site (GA4)" icone={Globe} clienteId={clienteId}
            texto="GA4 ainda não conectado para este cliente." />}
    </div>
  )
}
