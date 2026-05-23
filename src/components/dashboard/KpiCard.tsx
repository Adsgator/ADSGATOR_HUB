'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { cn } from '@/lib/utils'

type AccentColor = 'green' | 'amber' | 'red' | 'blue'

interface KpiCardProps {
  label:       string
  value:       string | number
  delta?:      string
  deltaDir?:   'up' | 'down' | 'neutral'
  deltaLabel?: string
  sparkData?:  number[]
  accentColor?: AccentColor
  alert?:      boolean
  alertLabel?: string
  icon?:       React.ReactNode
  href?:       string
}

const ACCENT_COLORS: Record<AccentColor, string> = {
  green: '#10B981',
  amber: '#FFB100',
  red:   '#EF4444',
  blue:  '#3B82F6',
}

const GRADIENT_ID = (label: string) =>
  `spark-gradient-${label.replace(/\s+/g, '-').toLowerCase()}`

export function KpiCard({
  label,
  value,
  delta,
  deltaDir = 'neutral',
  deltaLabel,
  sparkData,
  accentColor = 'amber',
  alert = false,
  alertLabel,
  icon,
  href,
}: KpiCardProps) {
  const chartData = sparkData?.map((v, i) => ({ i, v })) ?? []
  const colorHex = ACCENT_COLORS[accentColor]

  const deltaColors = {
    up:      'text-status-green',
    down:    'text-status-red',
    neutral: 'text-ink-muted',
  }

  const DeltaIcon = {
    up:      TrendingUp,
    down:    TrendingDown,
    neutral: Minus,
  }[deltaDir]

  const CardWrapper = href ? Link : 'div'

  return (
    <CardWrapper
      href={href || ''}
      className={cn(
        'relative flex flex-col justify-between',
        'bg-surface-card rounded-xl border',
        'p-[1.25rem] overflow-hidden',
        'border-t-4',
        'hover:-translate-y-[0.125rem] hover:shadow-xl hover:shadow-black/25',
        'transition-all duration-200',
        alert
          ? 'border-t-status-red border-status-red/40 hover:border-status-red/60'
          : 'border-t-' + accentColor + '-500 border-surface-border',
      )}
      style={{
        borderTopColor: alert ? undefined : colorHex,
      }}
    >
      {/* ── LABEL ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-[0.75rem]">
        <p className="text-ink-muted text-[0.75rem] font-semibold uppercase tracking-wide">
          {label}
        </p>
        {icon && (
          <div className="text-ink-muted">
            {icon}
          </div>
        )}
      </div>

      {/* ── VALOR PRINCIPAL ───────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-ink-primary text-[2.5rem] font-black leading-none tracking-tight mb-[0.375rem]">
            {value}
          </p>

          {delta && (
            <div className={cn('flex items-center gap-[0.25rem] text-[0.75rem] font-medium', deltaColors[deltaDir])}>
              <DeltaIcon className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} />
              <span>{delta}</span>
              {deltaLabel && (
                <span className="text-ink-muted font-normal">{deltaLabel}</span>
              )}
            </div>
          )}

          {alert && alertLabel && (
            <p className="text-status-red text-[0.75rem] font-medium mt-[0.25rem]">
              {alertLabel}
            </p>
          )}
        </div>

        {/* ── SPARKLINE ───────────────────────────────────── */}
        {chartData.length > 1 && (
          <div className="w-[5rem] h-[2.5rem] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={GRADIENT_ID(label)} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={colorHex} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colorHex} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={colorHex}
                  strokeWidth={2}
                  fill={`url(#${GRADIENT_ID(label)})`}
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── BORDA DE ALERTA (glow sutil) ─────────────────── */}
      {alert && (
        <div className="absolute inset-0 rounded-xl ring-1 ring-status-red/20 pointer-events-none" />
      )}
    </CardWrapper>
  )
}
