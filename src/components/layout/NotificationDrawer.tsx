'use client'

import { useEffect, useState } from 'react'
import { X, MessageCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface ClienteAlerta {
  id: string
  nome: string
  dias_atraso: number
  whatsapp: string | null
}

interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const [clientes, setClientes] = useState<ClienteAlerta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    supabase
      .from('clientes')
      .select('id, nome, dias_atraso, whatsapp')
      .gt('dias_atraso', 0)
      .order('dias_atraso', { ascending: false })
      .then(({ data }) => {
        setClientes((data ?? []) as ClienteAlerta[])
        setLoading(false)
      })
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'panel-slide-in fixed right-[var(--right-sidebar-w)] top-0 bottom-0 z-60',
          'w-[20rem] flex flex-col',
          'bg-surface-card border-l border-surface-border',
          'shadow-2xl shadow-black/50',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[1.25rem] py-[1rem] border-b border-surface-border shrink-0">
          <div className="flex items-center gap-[0.5rem]">
            <AlertTriangle className="w-[1rem] h-[1rem] text-status-red" strokeWidth={2} />
            <h2 className="text-ink-primary font-semibold text-[0.9375rem]">Alertas</h2>
            {clientes.length > 0 && (
              <span className="min-w-[1.25rem] h-[1.25rem] px-[0.25rem] rounded-full bg-status-red text-white text-[0.6875rem] font-bold flex items-center justify-center">
                {clientes.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
          >
            <X className="w-[1rem] h-[1rem]" strokeWidth={1.75} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-[0.75rem] space-y-[0.375rem]">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[4rem] rounded-[0.5rem] skeleton-shimmer" />
            ))
          ) : clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[4rem] text-ink-muted gap-[0.75rem]">
              <CheckCircle className="w-[2.5rem] h-[2.5rem] text-status-green" strokeWidth={1.5} />
              <p className="text-[0.875rem] font-medium text-ink-secondary">Sem alertas no momento</p>
              <p className="text-[0.75rem] text-center">Todos os clientes estão em dia</p>
            </div>
          ) : (
            clientes.map((c) => {
              const urgencia = c.dias_atraso >= 15 ? 'critica' : c.dias_atraso >= 7 ? 'atencao' : 'leve'
              const corBadge =
                urgencia === 'critica' ? 'bg-status-red/10 text-status-red border-status-red/20' :
                urgencia === 'atencao' ? 'bg-status-orange/10 text-status-orange border-status-orange/20' :
                'bg-status-green/10 text-status-green border-status-green/20'

              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-[0.75rem] rounded-[0.5rem] bg-surface-hover border border-surface-border/50 hover:border-surface-border transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-ink-primary text-[0.8125rem] font-medium truncate">{c.nome}</p>
                    <span className={cn('inline-flex items-center gap-[0.25rem] text-[0.6875rem] font-medium px-[0.375rem] py-[0.125rem] rounded-full border mt-[0.25rem]', corBadge)}>
                      D+{c.dias_atraso}
                    </span>
                  </div>
                  {c.whatsapp && (
                    <a
                      href={`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(`Olá ${c.nome.split(' ')[0]}! Passando para verificar sobre o pagamento em atraso (${c.dias_atraso} dias).`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-[0.5rem] w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] bg-status-green/10 text-status-green hover:bg-status-green/20 transition-colors shrink-0"
                      title="Enviar WhatsApp"
                    >
                      <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                    </a>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-[0.75rem] border-t border-surface-border">
          <a
            href="/clientes"
            className="flex items-center justify-center w-full h-[2rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] hover:text-ink-primary hover:border-ads-500/30 transition-colors"
          >
            Ver todos os clientes
          </a>
        </div>
      </aside>
    </>
  )
}
