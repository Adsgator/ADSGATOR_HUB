'use client'

import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BentoCardProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function BentoCard({ title, subtitle, actions, children, className, noPadding }: BentoCardProps) {
  return (
    <div
      className={cn(
        'group relative',
        'bg-surface-card rounded-2xl h-full flex flex-col dark:border dark:border-surface-border',
        'card-shadow card-interactive',
        'overflow-hidden',
        className,
      )}
    >
      {/* Drag handle — visível no hover */}
      <div
        className="bento-drag-handle absolute top-[0.5rem] right-[0.5rem] opacity-0 group-hover:opacity-60 cursor-grab active:cursor-grabbing z-10 p-[0.25rem] rounded-[0.25rem] hover:bg-surface-hover transition-opacity"
        title="Arrastar"
      >
        <GripVertical className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.75} />
      </div>

      {/* Header */}
      {(title || actions) && (
        <div className="flex items-start justify-between px-[1.25rem] pt-[1.125rem] pb-[0.625rem] shrink-0">
          {title && (
            <div className="min-w-0 pr-[1.5rem]">
              <h3 className="text-ink-primary font-semibold text-[0.875rem] leading-snug">{title}</h3>
              {subtitle && <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">{subtitle}</p>}
            </div>
          )}
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}

      {/* Conteúdo */}
      <div className={cn('flex-1 min-h-0', noPadding ? '' : 'px-[1.25rem] pb-[1.25rem]', !title && !actions && !noPadding && 'pt-[1.25rem]')}>
        {children}
      </div>
    </div>
  )
}
