'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { cn } from '@/lib/utils'

type AccentColor = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'cyan'

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
  description?: string
}

const ACCENT: Record<AccentColor, { hex: string; glow: string; icon: string; border: string }> = {
  green:  { hex: '#22c55e', glow: 'rgba(34,197,94,0.12)',    icon: 'bg-status-green/10 text-status-green',   border: 'border-status-green/25'  },
  amber:  { hex: '#FFB100', glow: 'rgba(255,177,0,0.12)',    icon: 'bg-ads-500/10 text-ads-400',              border: 'border-ads-500/25'        },
  red:    { hex: '#ef4444', glow: 'rgba(239,68,68,0.12)',    icon: 'bg-status-red/10 text-status-red',        border: 'border-status-red/25'     },
  blue:   { hex: '#3b82f6', glow: 'rgba(59,130,246,0.12)',   icon: 'bg-status-blue/10 text-status-blue',      border: 'border-status-blue/25'    },
  purple: { hex: '#8b5cf6', glow: 'rgba(139,92,246,0.12)',   icon: 'bg-status-purple/10 text-status-purple',  border: 'border-status-purple/25'  },
  cyan:   { hex: '#06b6d4', glow: 'rgba(6,182,212,0.12)',    icon: 'bg-status-cyan/10 text-status-cyan',      border: 'border-status-cyan/25'    },
}

const GRADIENT_ID = (label: string) =>
  `kpi-grad-${label.replace(/\s+/g, '-').toLowerCase()}`

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
  description,
}: KpiCardProps) {
  const chartData = sparkData?.map((v, i) => ({ i, v })) ?? []
  const acc = ACCENT[accentColor]

  const DeltaIcon = { up: TrendingUp, down: TrendingDown, neutral: Minus }[deltaDir]
  const deltaColor = { up: 'text-status-green', down: 'text-status-red', neutral: 'text-ink-muted' }[deltaDir]

  const cardBase = cn(
    'card-interactive card-shadow group relative flex flex-col',
    'bg-surface-card rounded-2xl overflow-hidden',
    'p-[1.25rem]',
    alert ? 'dark:border dark:border-status-red/40 dark:hover:border-status-red/60' : 'dark:border dark:border-surface-border',
  )

  const content = (
    <>
      {/* Glow de fundo sutil */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 20% 0%, ${alert ? 'rgba(239,68,68,0.06)' : acc.glow} 0%, transparent 70%)` }}
      />

      {/* Linha accent no topo */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: alert ? '#ef4444' : acc.hex }}
      />

      {/* ── HEADER ─────────────────────────────────── */}
      <div className="flex items-start justify-between mb-[1rem]">
        <div>
          <p className="text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-[0.07em]">
            {label}
          </p>
          {description && (
            <p className="text-ink-muted text-[0.625rem] mt-[0.125rem] leading-tight">{description}</p>
          )}
        </div>
        {icon && (
          <div className={cn('w-[2rem] h-[2rem] rounded-[0.5rem] flex items-center justify-center shrink-0', acc.icon)}>
            {icon}
          </div>
        )}
      </div>

      {/* ── VALOR + SPARKLINE ─────────────────────── */}
      <div className="flex items-end justify-between gap-[0.5rem]">
        <div className="min-w-0">
          <p className="text-ink-primary text-[2.5rem] font-black leading-none tracking-tight mb-[0.375rem] truncate">
            {value}
          </p>

          {delta && (
            <div className={cn('flex items-center gap-[0.25rem] text-[0.75rem] font-medium', deltaColor)}>
              <DeltaIcon className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} />
              <span>{delta}</span>
              {deltaLabel && <span className="text-ink-muted font-normal">{deltaLabel}</span>}
            </div>
          )}

          {alert && alertLabel && (
            <p className="text-status-red text-[0.6875rem] font-semibold mt-[0.25rem] flex items-center gap-[0.25rem]">
              <span className="w-[0.375rem] h-[0.375rem] rounded-full bg-status-red animate-pulse-slow inline-block" />
              {alertLabel}
            </p>
          )}
        </div>

        {chartData.length > 1 && (
          <div className="w-[4.5rem] h-[2.25rem] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={GRADIENT_ID(label)} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={acc.hex} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={acc.hex} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={acc.hex}
                  strokeWidth={1.5}
                  fill={`url(#${GRADIENT_ID(label)})`}
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Anel de alerta */}
      {alert && (
        <div className="absolute inset-0 rounded-xl ring-1 ring-status-red/20 pointer-events-none" />
      )}
    </>
  )

  if (href) {
    return <Link href={href} className={cardBase}>{content}</Link>
  }
  return <div className={cardBase}>{content}</div>
}
