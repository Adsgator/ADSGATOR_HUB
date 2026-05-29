'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { contextMenuVariants } from '@/lib/motion'

export interface ContextMenuItem {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'danger'
  separator?: boolean
  shortcut?: string
  disabled?: boolean
  submenu?: ContextMenuItem[]
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  children: React.ReactNode
}

// ── Submenu ───────────────────────────────────────────────────────────────────
function Submenu({ items, onClose }: { items: ContextMenuItem[]; onClose: () => void }) {
  return (
    <motion.div
      variants={contextMenuVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        'absolute left-full top-0 -mt-[0.25rem] ml-[0.125rem]',
        'min-w-[11rem] rounded-[0.5rem] overflow-hidden',
        'bg-surface-elevated border border-surface-border',
        'shadow-xl shadow-black/40 py-[0.25rem]',
      )}
      style={{ zIndex: 10001 }}
    >
      {items.map((item, i) => (
        <div key={i}>
          {item.separator && i > 0 && (
            <div className="my-[0.25rem] border-t border-surface-border" />
          )}
          <button
            onClick={() => { if (!item.disabled && item.onClick) { item.onClick(); onClose() } }}
            disabled={item.disabled}
            className={cn(
              'w-full flex items-center gap-[0.5rem]',
              'px-[0.75rem] py-[0.4375rem]',
              'text-[0.8125rem] font-medium text-left',
              'transition-colors duration-150',
              item.disabled && 'opacity-40 cursor-not-allowed',
              !item.disabled && item.variant === 'danger'
                ? 'text-status-red hover:bg-status-red/10'
                : !item.disabled && 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary',
            )}
          >
            {item.icon && (
              <span className="w-[0.875rem] h-[0.875rem] shrink-0 flex items-center justify-center">
                {item.icon}
              </span>
            )}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-ink-muted text-[0.6875rem] ml-[0.5rem]">{item.shortcut}</span>
            )}
          </button>
        </div>
      ))}
    </motion.div>
  )
}

// ── ContextMenu ───────────────────────────────────────────────────────────────
export function ContextMenu({ items, children }: ContextMenuProps) {
  const [pos, setPos]               = useState<{ x: number; y: number } | null>(null)
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null)
  const [focusedIndex, setFocusedIndex]   = useState<number>(-1)
  const menuRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const open = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const viewH = window.innerHeight
    const viewW = window.innerWidth
    const menuH = items.length * 36 + 8
    const menuW = 192

    setPos({
      x: Math.min(e.clientX, viewW - menuW - 8),
      y: Math.min(e.clientY, viewH - menuH - 8),
    })
    setFocusedIndex(-1)
    setActiveSubmenu(null)
  }, [items.length])

  const close = useCallback(() => {
    setPos(null)
    setActiveSubmenu(null)
    setFocusedIndex(-1)
  }, [])

  useEffect(() => {
    if (!pos) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex((i) => Math.min(i + 1, items.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && focusedIndex >= 0) {
        const item = items[focusedIndex]
        if (!item.disabled) { item.onClick?.(); close() }
      }
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [pos, close, items, focusedIndex])

  const menu = (
    <AnimatePresence>
      {pos && (
        <motion.div
          ref={menuRef}
          variants={contextMenuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ position: 'fixed', top: pos.y, left: pos.x, zIndex: 9999 }}
          className={cn(
            'min-w-[12rem] rounded-[0.5rem] overflow-visible',
            'bg-surface-elevated border border-surface-border',
            'shadow-xl shadow-black/40 py-[0.25rem]',
          )}
        >
          {items.map((item, i) => (
            <div key={i} className="relative">
              {item.separator && i > 0 && (
                <div className="my-[0.25rem] border-t border-surface-border" />
              )}
              <button
                onClick={() => {
                  if (item.disabled) return
                  if (item.submenu) { setActiveSubmenu(activeSubmenu === i ? null : i); return }
                  item.onClick?.()
                  close()
                }}
                onMouseEnter={() => setActiveSubmenu(item.submenu ? i : null)}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-[0.5rem]',
                  'px-[0.75rem] py-[0.4375rem]',
                  'text-[0.8125rem] font-medium text-left',
                  'transition-colors duration-150',
                  focusedIndex === i && 'bg-surface-hover',
                  item.disabled && 'opacity-40 cursor-not-allowed',
                  !item.disabled && item.variant === 'danger'
                    ? 'text-status-red hover:bg-status-red/10'
                    : !item.disabled && 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary',
                )}
              >
                {item.icon && (
                  <span className="w-[0.875rem] h-[0.875rem] shrink-0 flex items-center justify-center">
                    {item.icon}
                  </span>
                )}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && !item.submenu && (
                  <span className="text-ink-muted text-[0.6875rem] ml-[0.5rem]">{item.shortcut}</span>
                )}
                {item.submenu && (
                  <ChevronRight className="w-[0.75rem] h-[0.75rem] text-ink-muted ml-[0.5rem]" strokeWidth={2} />
                )}
              </button>
              <AnimatePresence>
                {activeSubmenu === i && item.submenu && (
                  <Submenu items={item.submenu} onClose={close} />
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Clone the single child to inject onContextMenu without a wrapper element
  const child = children as React.ReactElement<{ onContextMenu?: (e: React.MouseEvent) => void }>
  const trigger = React.cloneElement(child, {
    onContextMenu: (e: React.MouseEvent) => {
      child.props.onContextMenu?.(e)
      open(e)
    },
  })

  return (
    <>
      {trigger}
      {mounted ? createPortal(menu, document.body) : null}
    </>
  )
}
