'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PeriodData {
  impressoes: number
  cliques: number
  ctr: number
  conversoes: number
  cpa: number
  custo: number
  roas: number
  sessoes?: number
  usuarios?: number
}

interface PeriodComparisonProps {
  current: PeriodData
  previous: PeriodData
  currentLabel?: string
  previousLabel?: string
  loading?: boolean
}

function calcDelta(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0
  return ((curr - prev) / prev) * 100
}

interface MetricRowProps {
  label: string
  current: number
  previous: number
  format: (v: number) => string
  invertPositive?: boolean // true for CPA (lower is better)
}

function MetricRow({ label, current, previous, format, invertPositive }: MetricRowProps) {
  const delta = calcDelta(current, previous)
  const isPositive = invertPositive ? delta < 0 : delta > 0
  const isNeutral = Math.abs(delta) < 0.5

  return (
    <div className="flex items-center py-[0.375rem] border-b border-surface-border/40 last:border-0">
      <span className="text-[0.75rem] text-ink-secondary w-[7rem] flex-shrink-0">{label}</span>
      <span className="text-[0.875rem] font-semibold text-ink-primary flex-1">{format(current)}</span>
      <span className="text-[0.75rem] text-ink-muted w-[5rem] text-right">{format(previous)}</span>
      <div className={cn(
        'flex items-center gap-[0.125rem] w-[4rem] justify-end text-[0.75rem] font-medium',
        isNeutral ? 'text-ink-muted' : isPositive ? 'text-status-green' : 'text-status-red'
      )}>
        {isNeutral
          ? <Minus className="w-[0.75rem] h-[0.75rem]" />
          : isPositive
            ? <TrendingUp className="w-[0.75rem] h-[0.75rem]" />
            : <TrendingDown className="w-[0.75rem] h-[0.75rem]" />
        }
        {Math.abs(delta).toFixed(1)}%
      </div>
    </div>
  )
}

function fmtBRL(v: number) { return `R$${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` }
function fmtNum(v: number) { return v.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) }
function fmtPct(v: number) { return `${(v * 100).toFixed(2)}%` }
function fmtDec(v: number) { return v.toFixed(2) }

export function PeriodComparison({ current, previous, currentLabel = 'Atual', previousLabel = 'Anterior', loading }: PeriodComparisonProps) {
  if (loading) return <div className="h-[12rem] rounded-xl bg-surface-hover animate-pulse" />

  return (
    <div>
      {/* Header */}
      <div className="flex items-center pb-[0.375rem] border-b border-surface-border text-[0.625rem] text-ink-muted uppercase tracking-wide">
        <span className="w-[7rem] flex-shrink-0">Métrica</span>
        <span className="flex-1">{currentLabel}</span>
        <span className="w-[5rem] text-right">{previousLabel}</span>
        <span className="w-[4rem] text-right">Var.</span>
      </div>
      <MetricRow label="Impressões" current={current.impressoes} previous={previous.impressoes} format={fmtNum} />
      <MetricRow label="Cliques" current={current.cliques} previous={previous.cliques} format={fmtNum} />
      <MetricRow label="CTR" current={current.ctr} previous={previous.ctr} format={fmtPct} />
      <MetricRow label="Conversões" current={current.conversoes} previous={previous.conversoes} format={fmtDec} />
      <MetricRow label="CPA" current={current.cpa} previous={previous.cpa} format={fmtBRL} invertPositive />
      <MetricRow label="Custo" current={current.custo} previous={previous.custo} format={fmtBRL} invertPositive />
      <MetricRow label="ROAS" current={current.roas} previous={previous.roas} format={fmtDec} />
      {current.sessoes !== undefined && (
        <MetricRow label="Sessões" current={current.sessoes} previous={previous.sessoes ?? 0} format={fmtNum} />
      )}
    </div>
  )
}
