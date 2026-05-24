import React from 'react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface KpiCardPremiumProps {
  label: string
  value: number | string
  format?: 'currency' | 'percentage' | 'number' | 'custom'
  change?: number // -5, +12, etc
  metric?: string // 'vs mês anterior', 'vs meta'
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'flat'
  loading?: boolean
}

export function KpiCardPremium({
  label,
  value,
  format = 'currency',
  change,
  metric,
  icon,
  trend,
  loading,
}: KpiCardPremiumProps) {
  const formatValue = (v: number | string) => {
    if (typeof v === 'string') return v
    if (format === 'currency') return `R$ ${v.toLocaleString('pt-BR')}`
    if (format === 'percentage') return `${v.toFixed(1)}%`
    return v.toLocaleString('pt-BR')
  }

  const getTrendColor = () => {
    if (!change) return 'text-ink-muted'
    if (change > 0) return 'text-emerald-400'
    if (change < 0) return 'text-red-400'
    return 'text-ink-muted'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp className="w-[1rem] h-[1rem]" strokeWidth={2} />
    if (trend === 'down') return <ArrowDown className="w-[1rem] h-[1rem]" strokeWidth={2} />
    return <Minus className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
  }

  return (
    <Card variant="default" size="md" loading={loading}>
      {/* Header com label + icon */}
      <div className="flex items-center justify-between mb-[1rem]">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-muted">
          {label}
        </span>
        {icon && <div className="text-ads-500">{icon}</div>}
      </div>

      {/* Valor grande */}
      <div className="mb-[1rem]">
        <div className="text-[2rem] font-bold text-ink-primary tabular-nums tracking-tight">
          {formatValue(value)}
        </div>
      </div>

      {/* Métrica + trend */}
      {(change !== undefined || metric) && (
        <div className="flex items-center gap-[0.5rem]">
          {change !== undefined && (
            <div className={`flex items-center gap-[0.25rem] ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-[0.75rem] font-medium">
                {Math.abs(change) > 0 ? `${change > 0 ? '+' : ''}${change}%` : 'Sem alteração'}
              </span>
            </div>
          )}
          {metric && <span className="text-[0.75rem] text-ink-muted">{metric}</span>}
        </div>
      )}
    </Card>
  )
}
