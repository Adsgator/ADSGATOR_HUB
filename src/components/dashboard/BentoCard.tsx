'use client'

import { useState } from 'react'
import { GripHorizontal, MoreVertical, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BentoCardProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  noPadding?: boolean
  cardId?: string
  onSizeChange?: (preset: 'compact' | 'normal' | 'large' | 'max') => void
  editMode?: boolean
}

const SIZE_LABELS: Record<string, string> = {
  compact: 'Compacto',
  normal:  'Normal',
  large:   'Grande',
  max:     'Máximo',
}

function SizeMenu({
  cardId,
  onSizeChange,
  onClose,
}: {
  cardId?: string
  onSizeChange?: (preset: 'compact' | 'normal' | 'large' | 'max') => void
  onClose: () => void
}) {
  if (!cardId || !onSizeChange) return null

  return (
    <div className="absolute top-[2rem] right-0 z-30 bg-surface-elevated border border-surface-border rounded-lg shadow-xl overflow-hidden min-w-[130px]">
      {(['compact', 'normal', 'large', 'max'] as const).map((preset) => (
        <button
          key={preset}
          onMouseDown={(e) => {
            e.stopPropagation()
            onSizeChange(preset)
            onClose()
          }}
          className="w-full text-left px-[0.75rem] py-[0.5rem] text-[0.8125rem] hover:bg-surface-hover text-ink-secondary hover:text-ink-primary transition-colors border-b border-surface-border last:border-b-0"
        >
          {SIZE_LABELS[preset]}
        </button>
      ))}
    </div>
  )
}

export function BentoCard({
  title,
  subtitle,
  actions,
  children,
  className,
  noPadding,
  cardId,
  onSizeChange,
  editMode,
}: BentoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className={cn(
        'group/card relative',
        'bg-surface-card rounded-2xl h-full flex flex-col',
        'dark:border dark:border-surface-border card-shadow',
        // Em edit mode: sem hover lift, ring âmbar sutil
        editMode
          ? 'ring-1 ring-ads-500/30 cursor-default overflow-visible'
          : 'card-interactive overflow-hidden',
        className,
      )}
    >
      {/* ── FAIXA DE DRAG (edit mode) — ocupa o topo inteiro do card ── */}
      {editMode && (
        <div className="bento-drag-handle absolute inset-x-0 top-0 h-[2rem] z-10 cursor-grab active:cursor-grabbing flex items-center justify-between px-[0.5rem] bg-surface-card/80 backdrop-blur-sm border-b border-ads-500/20 rounded-t-2xl select-none">
          {/* Grip centralizado */}
          <GripHorizontal className="w-[1rem] h-[1rem] text-ads-500/60 mx-auto" strokeWidth={1.75} />

          {/* Botão de presets de tamanho — canto direito */}
          {cardId && onSizeChange && (
            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onMouseDown={(e) => {
                  e.stopPropagation()
                  setMenuOpen((v) => !v)
                }}
                title="Ajustar tamanho"
                className="p-[0.25rem] rounded-[0.25rem] hover:bg-ads-500/10 transition-colors"
              >
                <MoreVertical className="w-[0.875rem] h-[0.875rem] text-ads-500/70" strokeWidth={1.75} />
              </button>
              {menuOpen && (
                <SizeMenu
                  cardId={cardId}
                  onSizeChange={onSizeChange}
                  onClose={() => setMenuOpen(false)}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Header normal (title/subtitle/actions) ── */}
      {(title || actions) && (
        <div
          className={cn(
            'flex items-start justify-between px-[1.25rem] pb-[0.625rem] shrink-0',
            editMode ? 'pt-[2.25rem]' : 'pt-[1.125rem]',
          )}
        >
          {title && (
            <div className="min-w-0 pr-[1.5rem]">
              <h3 className="text-ink-primary font-semibold text-[0.875rem] leading-snug">{title}</h3>
              {subtitle && <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">{subtitle}</p>}
            </div>
          )}
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}

      {/* ── Conteúdo ── */}
      <div
        className={cn(
          'flex-1 min-h-0',
          noPadding ? '' : 'px-[1.25rem] pb-[1.25rem]',
          !title && !actions && !noPadding && (editMode ? 'pt-[2.5rem]' : 'pt-[1.25rem]'),
          !title && !actions && noPadding && editMode && 'pt-[2rem]',
        )}
      >
        {children}
      </div>
    </div>
  )
}
