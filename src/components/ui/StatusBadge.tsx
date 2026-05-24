import { cn } from '@/lib/utils'

type StatusType = 'active' | 'attention' | 'critical' | 'paused' | 'info' | 'purple' | 'neutral'

interface StatusBadgeProps {
  status: StatusType
  label: string
  dot?: boolean
  size?: 'sm' | 'md'
  variant?: 'solid' | 'subtle' | 'outline'
  className?: string
  icon?: React.ReactNode
}

const STATUS_CONFIG: Record<StatusType, { color: string; bg: string; border: string; dot: string }> = {
  active:    { color: 'text-status-green',  bg: 'bg-status-green/10',  border: 'border-status-green/20',  dot: 'bg-status-green'  },
  attention: { color: 'text-status-orange', bg: 'bg-status-orange/10', border: 'border-status-orange/20', dot: 'bg-status-orange' },
  critical:  { color: 'text-status-red',    bg: 'bg-status-red/10',    border: 'border-status-red/20',    dot: 'bg-status-red'    },
  paused:    { color: 'text-status-blue',   bg: 'bg-status-blue/10',   border: 'border-status-blue/20',   dot: 'bg-status-blue'   },
  info:      { color: 'text-status-cyan',   bg: 'bg-status-cyan/10',   border: 'border-status-cyan/20',   dot: 'bg-status-cyan'   },
  purple:    { color: 'text-status-purple', bg: 'bg-status-purple/10', border: 'border-status-purple/20', dot: 'bg-status-purple' },
  neutral:   { color: 'text-ink-muted',     bg: 'bg-surface-hover',    border: 'border-surface-border',   dot: 'bg-ink-muted'     },
}

export function StatusBadge({ status, label, dot = false, size = 'sm', variant = 'subtle', className, icon }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]

  const sizeClasses = {
    sm: 'text-[0.6875rem] px-[0.375rem] py-[0.0625rem] gap-[0.25rem]',
    md: 'text-[0.75rem]  px-[0.5rem]   py-[0.125rem]  gap-[0.3125rem]',
  }

  const variantClasses = {
    solid:   `${cfg.color} ${cfg.bg} border ${cfg.border}`,
    subtle:  `${cfg.color} ${cfg.bg}`,
    outline: `${cfg.color} bg-transparent border ${cfg.border}`,
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {dot && <span className={cn('w-[0.375rem] h-[0.375rem] rounded-full shrink-0', cfg.dot)} />}
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </span>
  )
}
