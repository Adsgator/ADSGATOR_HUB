'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { GripHorizontal, MoreVertical, Info, Pencil, X } from 'lucide-react'
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
  description?: string
  onEnterEdit?: () => void
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

// ── Painel de informações ──────────────────────────────────────────────────
function InfoPanel({ description, onClose }: { description: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className={cn(
        'absolute inset-x-0 bottom-0 z-40 rounded-b-2xl',
        'bg-surface-elevated/97 backdrop-blur-sm border-t border-surface-border',
        'px-[1.25rem] py-[1rem] animate-fade-up',
      )}
    >
      <div className="flex items-start justify-between gap-[0.75rem]">
        <div className="flex items-start gap-[0.5rem] min-w-0">
          <Info className="w-[0.875rem] h-[0.875rem] text-ads-500 shrink-0 mt-[0.125rem]" strokeWidth={1.75} />
          <p className="text-ink-secondary text-[0.8125rem] leading-relaxed">{description}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-[1.25rem] h-[1.25rem] flex items-center justify-center rounded text-ink-muted hover:text-ink-primary transition-colors"
        >
          <X className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

// ── Context menu (botão direito) ───────────────────────────────────────────
function CardContextMenu({
  pos,
  onEdit,
  onInfo,
  onClose,
}: {
  pos: { x: number; y: number }
  onEdit: () => void
  onInfo: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const style: React.CSSProperties = {
    position: 'fixed',
    top: Math.min(pos.y, window.innerHeight - 100),
    left: Math.min(pos.x, window.innerWidth - 180),
    zIndex: 9999,
  }

  return createPortal(
    <div
      ref={ref}
      style={style}
      className={cn(
        'min-w-[10.5rem] rounded-[0.5rem] overflow-hidden py-[0.25rem]',
        'bg-surface-elevated border border-surface-border',
        'shadow-xl shadow-black/40 animate-fade-scale',
      )}
    >
      <button
        onClick={() => { onEdit(); onClose() }}
        className="w-full flex items-center gap-[0.5rem] px-[0.75rem] py-[0.4375rem] text-[0.8125rem] font-medium text-ink-secondary hover:bg-surface-hover hover:text-ink-primary transition-colors"
      >
        <Pencil className="w-[0.875rem] h-[0.875rem] shrink-0" strokeWidth={1.75} />
        Editar layout
      </button>
      <button
        onClick={() => { onInfo(); onClose() }}
        className="w-full flex items-center gap-[0.5rem] px-[0.75rem] py-[0.4375rem] text-[0.8125rem] font-medium text-ink-secondary hover:bg-surface-hover hover:text-ink-primary transition-colors"
      >
        <Info className="w-[0.875rem] h-[0.875rem] shrink-0" strokeWidth={1.75} />
        Informações
      </button>
    </div>,
    document.body,
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
  description,
  onEnterEdit,
}: BentoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setShowInfo(false)
    setCtxMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const handleEnterEdit = useCallback(() => {
    onEnterEdit?.()
  }, [onEnterEdit])

  return (
    <>
      {ctxMenu && (
        <CardContextMenu
          pos={ctxMenu}
          onEdit={handleEnterEdit}
          onInfo={() => setShowInfo(true)}
          onClose={() => setCtxMenu(null)}
        />
      )}

      <div
        onContextMenu={handleContextMenu}
        className={cn(
          'group/card relative',
          'bg-surface-card rounded-2xl h-full flex flex-col',
          'dark:border dark:border-surface-border card-shadow',
          editMode
            ? 'ring-1 ring-ads-500/30 cursor-default overflow-visible'
            : 'card-interactive overflow-hidden',
          className,
        )}
      >
        {/* ── FAIXA DE DRAG (edit mode) — ocupa o topo inteiro do card ── */}
        {editMode && (
          <div className="bento-drag-handle absolute inset-x-0 top-0 h-[2rem] z-10 cursor-grab active:cursor-grabbing flex items-center justify-between px-[0.5rem] bg-surface-card/80 backdrop-blur-sm border-b border-ads-500/20 rounded-t-2xl select-none">
            <GripHorizontal className="w-[1rem] h-[1rem] text-ads-500/60 mx-auto" strokeWidth={1.75} />

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

        {/* ── Painel de informações ── */}
        {showInfo && description && (
          <InfoPanel description={description} onClose={() => setShowInfo(false)} />
        )}
      </div>
    </>
  )
}
