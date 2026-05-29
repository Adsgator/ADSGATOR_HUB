'use client'

import { useConfirmDialogStore } from '@/lib/hooks/useConfirmDialog'
import { cn } from '@/lib/utils'

export function ConfirmDialog() {
  const { isOpen, title, message, confirm, cancel } = useConfirmDialogStore()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[999] bg-black/50 animate-fade-in"
        onClick={cancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-[1rem]">
        <div className="bg-surface-card border border-surface-border rounded-xl shadow-lg max-w-[28rem] w-full animate-fade-scale">
          {/* Header */}
          <div className="p-[1.5rem] border-b border-surface-border">
            <h2 className="text-ink-primary font-semibold text-[1rem]">{title}</h2>
          </div>

          {/* Message */}
          <div className="p-[1.5rem]">
            <p className="text-ink-secondary text-[0.875rem] leading-relaxed">{message}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-[0.75rem] justify-end p-[1rem] bg-surface-base rounded-b-xl">
            <button
              onClick={cancel}
              className={cn(
                'px-[1rem] py-[0.5rem] rounded-[0.375rem]',
                'text-ink-primary text-[0.875rem] font-medium',
                'bg-surface-hover hover:bg-surface-border/50',
                'transition-colors duration-150',
              )}
            >
              Cancelar
            </button>
            <button
              onClick={confirm}
              className={cn(
                'px-[1rem] py-[0.5rem] rounded-[0.375rem]',
                'text-white text-[0.875rem] font-medium',
                'bg-status-red hover:bg-status-red/90',
                'transition-colors duration-150',
              )}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
