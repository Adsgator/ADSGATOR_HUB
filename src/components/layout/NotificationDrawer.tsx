'use client'

import { useEffect, useState } from 'react'
import { X, MessageCircle, CheckCircle, Bell, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface ClienteAlerta {
  id: string
  nome: string
  dias_atraso: number
  whatsapp: string | null
}

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: string
  lida: boolean
  created_at: string
  link?: string
}

interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const [clientes,      setClientes]      = useState<ClienteAlerta[]>([])
  const [notificacoes,  setNotificacoes]  = useState<Notificacao[]>([])
  const [loading,       setLoading]       = useState(true)
  const [aba,           setAba]           = useState<'alertas' | 'notificacoes'>('alertas')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    Promise.all([
      supabase
        .from('clientes')
        .select('id, nome, dias_atraso, whatsapp')
        .gt('dias_atraso', 0)
        .order('dias_atraso', { ascending: false }),
      supabase
        .from('notificacoes')
        .select('id, titulo, mensagem, tipo, lida, created_at, link')
        .order('created_at', { ascending: false })
        .limit(20),
    ]).then(([{ data: cl }, { data: nt }]) => {
      setClientes((cl ?? []) as ClienteAlerta[])
      setNotificacoes((nt ?? []) as Notificacao[])
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
          <h2 className="text-ink-primary font-semibold text-[0.9375rem]">Notificações</h2>
          <button
            onClick={onClose}
            className="w-[2rem] h-[2rem] flex items-center justify-center rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
          >
            <X className="w-[1rem] h-[1rem]" strokeWidth={1.75} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-surface-border shrink-0">
          {([
            { id: 'alertas',       label: 'Alertas',       count: clientes.length,     cor: 'text-status-red'   },
            { id: 'notificacoes',  label: 'Notificações',  count: notificacoes.filter((n) => !n.lida).length, cor: 'text-ads-500' },
          ] as const).map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-[0.375rem] h-[2.25rem] text-[0.8125rem] font-medium transition-colors border-b-2',
                aba === a.id
                  ? 'text-ink-primary border-ads-500'
                  : 'text-ink-muted border-transparent hover:text-ink-secondary',
              )}
            >
              {a.label}
              {a.count > 0 && (
                <span className={cn('text-[0.625rem] font-bold px-[0.375rem] rounded-full bg-surface-hover', a.cor)}>
                  {a.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-[0.75rem] space-y-[0.375rem]">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[4rem] rounded-lg skeleton-shimmer" />
            ))
          ) : aba === 'alertas' ? (
            clientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-[4rem] gap-[0.75rem]">
                <CheckCircle className="w-[2.5rem] h-[2.5rem] text-status-green" strokeWidth={1.5} />
                <p className="text-[0.875rem] font-medium text-ink-secondary">Sem alertas no momento</p>
                <p className="text-ink-muted text-[0.75rem] text-center">Todos os clientes estão em dia</p>
              </div>
            ) : (
              clientes.map((c) => {
                const urgencia = c.dias_atraso >= 15 ? 'critica' : c.dias_atraso >= 7 ? 'atencao' : 'leve'
                const corBadge =
                  urgencia === 'critica' ? 'bg-status-red/10 text-status-red border-status-red/20' :
                  urgencia === 'atencao' ? 'bg-status-orange/10 text-status-orange border-status-orange/20' :
                  'bg-status-green/10 text-status-green border-status-green/20'
                return (
                  <div key={c.id} className="p-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40">
                    <div className="flex items-start justify-between gap-[0.5rem] mb-[0.5rem]">
                      <div className="flex-1 min-w-0">
                        <p className="text-ink-primary text-[0.8125rem] font-semibold truncate">{c.nome}</p>
                        <p className="text-ink-secondary text-[0.75rem] mt-[0.125rem]">
                          {c.dias_atraso} dias em atraso
                          {c.dias_atraso >= 15 ? ' — quebra de contrato iminente' : c.dias_atraso >= 7 ? ' — suspensão iminente' : ''}
                        </p>
                      </div>
                      <span className={cn('text-[0.625rem] font-semibold px-[0.375rem] py-[0.125rem] rounded-full border shrink-0', corBadge)}>
                        D+{c.dias_atraso}
                      </span>
                    </div>
                    <div className="flex gap-[0.375rem]">
                      {c.whatsapp && (
                        <a
                          href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${c.nome.split(' ')[0]}! Passando para verificar sobre o pagamento em atraso (${c.dias_atraso} dias).`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-[0.25rem] h-[1.75rem] rounded-lg bg-[#25D366]/10 text-[#25D366] text-[0.75rem] font-medium hover:bg-[#25D366]/20 transition-colors"
                        >
                          <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                          Cobrar
                        </a>
                      )}
                      <a
                        href={`/clientes/${c.id}`}
                        className="flex-1 flex items-center justify-center gap-[0.25rem] h-[1.75rem] rounded-lg bg-surface-elevated text-ink-secondary text-[0.75rem] font-medium hover:text-ink-primary transition-colors"
                      >
                        <ExternalLink className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                        Ver cliente
                      </a>
                    </div>
                  </div>
                )
              })
            )
          ) : (
            notificacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-[4rem] gap-[0.75rem]">
                <Bell className="w-[2.5rem] h-[2.5rem] text-ink-muted" strokeWidth={1.5} />
                <p className="text-[0.875rem] font-medium text-ink-secondary">Sem notificações</p>
              </div>
            ) : (
              notificacoes.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'p-[0.75rem] rounded-lg border transition-colors',
                    n.lida
                      ? 'bg-surface-hover border-surface-border/30 opacity-60'
                      : 'bg-surface-card border-surface-border/60',
                  )}
                >
                  <div className="flex items-start justify-between gap-[0.5rem]">
                    <div className="flex-1 min-w-0">
                      <p className="text-ink-primary text-[0.8125rem] font-medium leading-snug">{n.titulo}</p>
                      <p className="text-ink-secondary text-[0.75rem] mt-[0.25rem] leading-snug">{n.mensagem}</p>
                    </div>
                    {!n.lida && <span className="w-[0.5rem] h-[0.5rem] rounded-full bg-ads-500 shrink-0 mt-[0.25rem]" />}
                  </div>
                  {n.link && (
                    <a href={n.link} className="mt-[0.5rem] flex items-center gap-[0.25rem] text-ads-500 text-[0.75rem] hover:underline">
                      <ExternalLink className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                      Ver detalhes
                    </a>
                  )}
                  <p className="text-ink-muted text-[0.625rem] mt-[0.375rem]">
                    {new Date(n.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )
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
