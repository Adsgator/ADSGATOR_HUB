'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { drawerRight, backdropVariants } from '@/lib/motion'
import { Button } from '@/components/ui/Button'

interface DrawerEditorProps {
  open: boolean
  onClose: () => void
  onSave?: () => void | Promise<void>
  title: string
  subtitle?: string
  saving?: boolean
  width?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function DrawerEditor({
  open,
  onClose,
  onSave,
  title,
  subtitle,
  saving = false,
  width = '26rem',
  children,
  footer,
}: DrawerEditorProps) {
  const firstFocusRef = useRef<HTMLButtonElement>(null)

  // Fechar com Escape, salvar com Ctrl+S
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        onSave?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, onSave])

  // Foco no botão fechar ao abrir
  useEffect(() => {
    if (open) setTimeout(() => firstFocusRef.current?.focus(), 50)
  }, [open])

  const drawer = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[200]"
          />

          {/* Drawer */}
          <motion.div
            variants={drawerRight}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ width }}
            className={cn(
              'fixed top-0 right-0 h-full z-[201]',
              'bg-surface-card border-l border-surface-border',
              'flex flex-col shadow-2xl shadow-black/30',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-[1.5rem] py-[1.125rem] border-b border-surface-border flex-shrink-0">
              <div>
                <h2 className="text-ink-primary text-[1rem] font-semibold">{title}</h2>
                {subtitle && (
                  <p className="text-ink-muted text-[0.8125rem] mt-[0.125rem]">{subtitle}</p>
                )}
              </div>
              <button
                ref={firstFocusRef}
                onClick={onClose}
                className="w-[1.875rem] h-[1.875rem] flex items-center justify-center rounded-lg text-ink-muted hover:text-ink-secondary hover:bg-surface-hover transition-colors"
                title="Fechar (Esc)"
              >
                <X className="w-[1rem] h-[1rem]" strokeWidth={2} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-[1.5rem] py-[1.25rem]">
              {children}
            </div>

            {/* Footer */}
            {(onSave || footer) && (
              <div className="flex items-center justify-end gap-[0.75rem] px-[1.5rem] py-[1rem] border-t border-surface-border flex-shrink-0">
                {footer ?? (
                  <>
                    <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onSave}
                      disabled={saving}
                    >
                      {saving ? 'Salvando…' : 'Salvar'}
                    </Button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  if (typeof window === 'undefined') return null
  return createPortal(drawer, document.body)
}
