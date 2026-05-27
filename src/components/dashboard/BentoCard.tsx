'use client'

import { useRef, useState } from 'react'
import { GripVertical, MoreVertical } from 'lucide-react'
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
  normal: 'Normal',
  large: 'Grande',
  max: 'Máximo',
}

function SizeMenu({ cardId, onSizeChange, onClose }: { cardId?: string; onSizeChange?: (preset: 'compact' | 'normal' | 'large' | 'max') => void; onClose: () => void }) {
  if (!cardId || !onSizeChange) return null

  return (
    <div className="absolute top-[2rem] right-[0.5rem] z-20 bg-surface-card border border-surface-border rounded-lg shadow-lg overflow-hidden min-w-[120px]">
      {(['compact', 'normal', 'large', 'max'] as const).map((preset) => (
        <button
          key={preset}
          onClick={() => {
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

export function BentoCard({ title, subtitle, actions, children, className, noPadding, cardId, onSizeChange, editMode }: BentoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleSizeSelect = (preset: 'compact' | 'normal' | 'large' | 'max') => {
    if (cardId && onSizeChange) {
      onSizeChange(preset)
    }
  }
  return (
    <div
      className={cn(
        'group relative',
        'bg-surface-card rounded-2xl h-full flex flex-col dark:border dark:border-surface-border',
        'card-shadow card-interactive',
        'overflow-hidden',
        editMode && 'ring-1 ring-ads-500/20',
        className,
      )}
    >
      {/* Menu de tamanhos */}
      <div ref={menuRef} className="relative">
        {menuOpen && editMode && <SizeMenu cardId={cardId} onSizeChange={handleSizeSelect} onClose={() => setMenuOpen(false)} />}
      </div>

      {/* Drag handle + Size menu button — visível apenas em editMode */}
      {editMode && (
        <div className="absolute top-[0.5rem] right-[0.5rem] z-10 flex items-center gap-[0.25rem]">
          {cardId && onSizeChange && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              title="Tamanho do card"
              className="p-[0.25rem] rounded-[0.25rem] hover:bg-surface-hover transition-colors"
            >
              <MoreVertical className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.75} />
            </button>
          )}
          <div
            className="bento-drag-handle cursor-grab active:cursor-grabbing p-[0.25rem] rounded-[0.25rem] hover:bg-surface-hover transition-colors"
            title="Arrastar"
          >
            <GripVertical className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.75} />
          </div>
        </div>
      )}

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
