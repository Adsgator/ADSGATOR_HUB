'use client'

import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'

interface KpiCompactCardProps {
  label: string
  value: string | number
  delta?: string
  deltaDir?: 'up' | 'down'
  accentColor?: 'amber' | 'green' | 'blue' | 'red' | 'purple' | 'cyan'
  icon?: LucideIcon | React.ReactNode
  href?: string
  compact?: boolean
}

const ACCENT_MAP: Record<string, { bg: string; text: string; border: string }> = {
  amber:  { bg: '#FFC857',  text: 'text-[#FFB100]', border: 'border-[#FFB100]/30' },
  green:  { bg: '#10B981',  text: 'text-status-green', border: 'border-status-green/30' },
  blue:   { bg: '#3B82F6',  text: 'text-status-blue', border: 'border-status-blue/30' },
  red:    { bg: '#EF4444',  text: 'text-status-red', border: 'border-status-red/30' },
  purple: { bg: '#8B5CF6',  text: 'text-status-purple', border: 'border-status-purple/30' },
  cyan:   { bg: '#06B6D4',  text: 'text-status-cyan', border: 'border-status-cyan/30' },
}

export function KpiCompactCard({
  label,
  value,
  delta,
  deltaDir,
  accentColor = 'amber',
  icon,
  href,
  compact = false,
}: KpiCompactCardProps) {
  const accent = ACCENT_MAP[accentColor] || ACCENT_MAP.amber
  const isLink = !!href

  const Wrapper = isLink ? 'a' : 'div'

  return (
    <Wrapper
      href={href}
      className={`bg-surface-card border rounded-xl overflow-hidden transition-all ${
        isLink ? 'cursor-pointer hover:border-surface-border hover:shadow-lg' : ''
      } ${accent.border} border`}
    >
      <div className={`p-[1rem] ${compact ? '' : 'min-h-[8rem]'} flex flex-col justify-between`}>
        {/* Header com label e delta */}
        <div className="flex items-start justify-between mb-[0.5rem]">
          <p className="text-ink-muted text-xs font-medium uppercase tracking-wider">{label}</p>
          {delta && (
            <div className={`flex items-center gap-[0.25rem] px-[0.5rem] py-[0.25rem] rounded-full ${accent.text.replace('text-', 'bg-').replace('text-', 'bg-')}/10`}>
              {deltaDir === 'up' ? (
                <TrendingUp className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
              ) : (
                <TrendingDown className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
              )}
              <span className={`text-xs font-semibold ${accent.text}`}>{delta}</span>
            </div>
          )}
        </div>

        {/* Valor grande */}
        <div className="flex items-end justify-between gap-[1rem]">
          <p className="text-ink-primary font-black text-2xl leading-none">{value}</p>

          {/* Icon com acent color */}
          {icon && (
            <div
              className="w-[2.5rem] h-[2.5rem] rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accent.bg}15` }}
            >
              {typeof icon === 'function' ? icon({ className: 'w-[1.25rem] h-[1.25rem]', style: { color: accent.bg } }) : icon}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  )
}
