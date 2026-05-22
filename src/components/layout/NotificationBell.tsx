'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, X, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Notificacao } from '@/lib/types'

export function NotificationBell() {
  const supabase    = createClient()
  const ref         = useRef<HTMLDivElement>(null)
  const [notifs,  setNotifs]  = useState<Notificacao[]>([])
  const [aberto,  setAberto]  = useState(false)

  const naoLidas = notifs.filter((n) => !n.lida).length

  useEffect(() => {
    supabase
      .from('notificacoes')
      .select('*')
      .eq('lida', false)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setNotifs((data ?? []) as Notificacao[]))

    const channel = supabase
      .channel('notifs-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificacoes' }, () => {
        supabase
          .from('notificacoes')
          .select('*')
          .eq('lida', false)
          .order('created_at', { ascending: false })
          .limit(20)
          .then(({ data }) => setNotifs((data ?? []) as Notificacao[]))
      })
      .subscribe()

    function handleClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', handleClickFora)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('mousedown', handleClickFora)
    }
  }, [])

  async function marcarLida(id: string) {
    await supabase
      .from('notificacoes')
      .update({ lida: true, lida_em: new Date().toISOString() })
      .eq('id', id)
    setNotifs((prev) => prev.filter((n) => n.id !== id))
  }

  const TIPO_CORES: Record<string, string> = {
    urgente: 'text-status-red   bg-status-red/10',
    atencao: 'text-status-orange bg-status-orange/10',
    info:    'text-status-blue  bg-status-blue/10',
    sucesso: 'text-status-green bg-status-green/10',
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        className="relative w-[2rem] h-[2rem] rounded-[0.375rem] flex items-center justify-center text-ink-secondary hover:bg-surface-hover hover:text-ink-primary transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-[1rem] h-[1rem]" strokeWidth={1.75} />
        {naoLidas > 0 && (
          <span className="absolute top-[0.25rem] right-[0.25rem] min-w-[0.9375rem] h-[0.9375rem] rounded-full bg-status-red flex items-center justify-center text-[0.5625rem] font-bold text-white px-[0.1875rem]">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-[2.5rem] w-[22rem] bg-surface-card border border-surface-border rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden animate-fade-in">
          <div className="px-[1rem] py-[0.75rem] border-b border-surface-border flex items-center justify-between">
            <p className="text-ink-primary font-semibold text-[0.875rem]">Notificações</p>
            {naoLidas > 0 && (
              <button
                onClick={async () => {
                  await supabase.from('notificacoes').update({ lida: true }).eq('lida', false)
                  setNotifs([])
                }}
                className="text-ink-muted text-[0.75rem] hover:text-ink-secondary"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-[2.5rem] text-ink-muted">
                <Bell className="w-[2rem] h-[2rem] mb-[0.5rem]" strokeWidth={1} />
                <p className="text-[0.875rem]">Tudo em dia!</p>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  className={`px-[1rem] py-[0.875rem] border-b border-surface-border hover:bg-surface-hover transition-colors ${TIPO_CORES[n.tipo]?.split(' ')[1] ?? ''}`}
                >
                  <div className="flex items-start justify-between gap-[0.5rem]">
                    <div className="flex-1">
                      <p className={`text-[0.8125rem] font-semibold mb-[0.125rem] ${TIPO_CORES[n.tipo]?.split(' ')[0] ?? 'text-ink-primary'}`}>
                        {n.titulo}
                      </p>
                      {n.mensagem && (
                        <p className="text-ink-secondary text-[0.8125rem] leading-snug">{n.mensagem}</p>
                      )}
                      {n.acao_url && n.acao_label && (
                        <a
                          href={n.acao_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-[0.25rem] text-ads-500 text-[0.75rem] mt-[0.375rem] hover:underline"
                        >
                          {n.acao_label} <ExternalLink className="w-[0.625rem] h-[0.625rem]" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => marcarLida(n.id)}
                      className="text-ink-muted hover:text-ink-primary shrink-0"
                    >
                      <X className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                    </button>
                  </div>
                  <p className="text-ink-muted text-[0.6875rem] mt-[0.375rem]">
                    {new Date(n.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
