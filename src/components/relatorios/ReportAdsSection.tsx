'use client'

import { TrendingUp, MousePointerClick, Target, DollarSign, Zap, BarChart3 } from 'lucide-react'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportAdsSectionProps {
  dados: {
    impressoes: number
    cliques: number
    ctr: number
    cpc_medio: number
    conversoes: number
    cpa: number
    investimento: number
    keywords?: Array<{
      keyword: string
      cliques: number
      impressoes: number
      ctr: number
      cpc: number
      conversoes: number
    }>
    horario?: Array<{ hora: number; dia_semana: number; cliques: number; conversoes: number }>
  } | null
  loading?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtPct = (v: number) =>
  `${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton-shimmer rounded-[0.375rem] bg-surface-hover', className)} />
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ReportAdsSection({ dados, loading }: ReportAdsSectionProps) {
  if (loading) {
    return (
      <div className="space-y-[1.25rem]">
        <Skeleton className="h-[1.25rem] w-[12rem]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[0.875rem]">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-[5rem]" />
          ))}
        </div>
        <Skeleton className="h-[14rem]" />
      </div>
    )
  }

  if (!dados) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] text-center">
        <BarChart3 className="w-[2rem] h-[2rem] text-ink-muted mx-auto mb-[0.75rem]" strokeWidth={1} />
        <p className="text-ink-muted text-[0.875rem]">Dados do Google Ads não disponíveis para este período.</p>
      </div>
    )
  }

  const kpis = [
    { label: 'Impressões',   value: dados.impressoes.toLocaleString('pt-BR'),            icon: TrendingUp,         color: 'text-status-blue'   },
    { label: 'Cliques',      value: dados.cliques.toLocaleString('pt-BR'),               icon: MousePointerClick,  color: 'text-ads-500'       },
    { label: 'CTR',          value: fmtPct(dados.ctr),                                   icon: Target,             color: 'text-status-purple' },
    { label: 'CPC Médio',    value: `R$ ${fmtBRL(dados.cpc_medio)}`,                     icon: DollarSign,         color: 'text-status-green'  },
    { label: 'Conversões',   value: dados.conversoes.toLocaleString('pt-BR'),            icon: Zap,                color: 'text-status-orange' },
    { label: 'CPA',          value: `R$ ${fmtBRL(dados.cpa)}`,                           icon: Target,             color: 'text-status-red'    },
    { label: 'Custo Total',  value: `R$ ${fmtBRL(dados.investimento)}`,                  icon: DollarSign,         color: 'text-ads-500'       },
  ]

  // Build daily chart data from horario if available
  const chartData = dados.horario
    ? (() => {
        const grouped: Record<number, { hora: number; cliques: number; conversoes: number }> = {}
        for (const row of dados.horario) {
          if (!grouped[row.hora]) grouped[row.hora] = { hora: row.hora, cliques: 0, conversoes: 0 }
          grouped[row.hora].cliques += row.cliques
          grouped[row.hora].conversoes += row.conversoes
        }
        return Object.values(grouped).sort((a, b) => a.hora - b.hora)
      })()
    : null

  return (
    <div className="space-y-[1.5rem]">
      {/* Header */}
      <div className="flex items-center gap-[0.5rem]">
        <TrendingUp className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.5} />
        <h2 className="text-ads-500 font-semibold text-[1rem]">Google Ads</h2>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-[0.875rem]">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-surface-card border border-surface-border rounded-xl px-[1rem] py-[0.875rem] card-shadow"
          >
            <div className="flex items-center justify-between mb-[0.375rem]">
              <p className="text-ink-muted text-[0.625rem] uppercase tracking-wider font-semibold leading-tight">{label}</p>
              <Icon className={cn('w-[0.875rem] h-[0.875rem] shrink-0', color)} strokeWidth={1.5} />
            </div>
            <p className={cn('text-[1.125rem] font-bold leading-none', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData && chartData.length > 0 && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow">
          <p className="text-ink-secondary text-[0.8125rem] font-semibold mb-[1rem]">Performance por Hora do Dia</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
              <XAxis
                dataKey="hora"
                tickFormatter={(v) => `${v}h`}
                tick={{ fontSize: 10, fill: 'var(--ink-muted)' }}
              />
              <YAxis tick={{ fontSize: 10, fill: 'var(--ink-muted)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                labelFormatter={(v) => `${v}h`}
              />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              <Bar dataKey="cliques" name="Cliques" fill="#FFB100" opacity={0.8} radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="conversoes" name="Conversões" stroke="#22c55e" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Keywords table */}
      {dados.keywords && dados.keywords.length > 0 && (
        <div className="bg-surface-card border border-surface-border rounded-xl card-shadow overflow-hidden">
          <div className="px-[1.25rem] py-[0.875rem] border-b border-surface-border">
            <p className="text-ink-secondary text-[0.8125rem] font-semibold">Top Keywords</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.8125rem]">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Keyword', 'Cliques', 'Impressões', 'CTR', 'CPC', 'Conversões'].map((h) => (
                    <th key={h} className="text-left px-[1rem] py-[0.625rem] text-ink-muted font-semibold text-[0.6875rem] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dados.keywords.slice(0, 10).map((kw, i) => (
                  <tr key={i} className="border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors">
                    <td className="px-[1rem] py-[0.625rem] text-ink-primary font-medium max-w-[12rem] truncate">{kw.keyword}</td>
                    <td className="px-[1rem] py-[0.625rem] text-ink-secondary">{kw.cliques.toLocaleString('pt-BR')}</td>
                    <td className="px-[1rem] py-[0.625rem] text-ink-secondary">{kw.impressoes.toLocaleString('pt-BR')}</td>
                    <td className="px-[1rem] py-[0.625rem] text-ink-secondary">{fmtPct(kw.ctr)}</td>
                    <td className="px-[1rem] py-[0.625rem] text-ink-secondary">R$ {fmtBRL(kw.cpc)}</td>
                    <td className="px-[1rem] py-[0.625rem] text-ink-secondary">{kw.conversoes.toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
