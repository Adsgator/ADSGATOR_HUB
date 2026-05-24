'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

export interface ContextMenuItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  separator?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  children: React.ReactNode
}

export function ContextMenu({ items, children }: ContextMenuProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const open = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setPos({ x: e.clientX, y: e.clientY })
  }, [])

  const close = useCallback(() => setPos(null), [])

  useEffect(() => {
    if (!pos) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [pos, close])

  /* Ajuste para não sair da viewport */
  const menuStyle: React.CSSProperties = pos
    ? {
        position: 'fixed',
        top: Math.min(pos.y, window.innerHeight - 200),
        left: Math.min(pos.x, window.innerWidth - 180),
        zIndex: 9999,
      }
    : {}

  return (
    <>
      <div onContextMenu={open} className="contents">
        {children}
      </div>

      {pos && (
        <div
          ref={menuRef}
          style={menuStyle}
          className={cn(
            'min-w-[10rem] rounded-[0.5rem] overflow-hidden',
            'bg-surface-elevated border border-surface-border',
            'shadow-xl shadow-black/40',
            'animate-fade-scale py-[0.25rem]',
          )}
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.separator && i > 0 && (
                <div className="my-[0.25rem] border-t border-surface-border" />
              )}
              <button
                onClick={() => { item.onClick(); close() }}
                className={cn(
                  'w-full flex items-center gap-[0.5rem]',
                  'px-[0.75rem] py-[0.4375rem]',
                  'text-[0.8125rem] font-medium text-left',
                  'transition-colors duration-150',
                  item.variant === 'danger'
                    ? 'text-status-red hover:bg-status-red/10'
                    : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary',
                )}
              >
                {item.icon && (
                  <span className="w-[0.875rem] h-[0.875rem] shrink-0 flex items-center justify-center">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
