'use client'

import { useEffect, useState, useCallback } from 'react'
import { Mail, Check, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface EmailLog {
  id: string
  destinatario: string
  template_tipo: string
  assunto: string | null
  status: 'enviado' | 'falha' | 'pendente'
  mensagem_erro: string | null
  modo_teste: boolean | null
  created_at: string
}

const STATUS_STYLE: Record<string, { cor: string; Icon: typeof Check }> = {
  enviado:  { cor: 'text-status-green',  Icon: Check },
  falha:    { cor: 'text-status-red',    Icon: AlertCircle },
  pendente: { cor: 'text-status-orange', Icon: Clock },
}

/** Histórico de emails recebidos por um cliente (lê email_logs por cliente_id). */
export function EmailsCliente({ clienteId }: { clienteId: string }) {
  const [logs, setLogs]       = useState<EmailLog[]>([])
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    const { data } = await supabase
      .from('email_logs')
      .select('id, destinatario, template_tipo, assunto, status, mensagem_erro, modo_teste, created_at')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false })
    setLogs((data ?? []) as EmailLog[])
    setCarregando(false)
  }, [clienteId])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow">
      <div className="flex items-center justify-between mb-[1rem]">
        <h3 className="text-ink-primary text-[0.9375rem] font-semibold">Emails enviados</h3>
        {logs.length > 0 && (
          <span className="text-ink-muted text-[0.75rem]">{logs.length} no total</span>
        )}
      </div>

      {carregando ? (
        <div className="space-y-[0.75rem]">
          {[1, 2, 3].map((i) => <div key={i} className="h-[3.5rem] rounded-lg bg-surface-hover skeleton-shimmer" />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-[2rem]">
          <Mail className="w-[2rem] h-[2rem] text-ink-muted mx-auto mb-[0.75rem]" strokeWidth={1.5} />
          <p className="text-ink-secondary text-[0.875rem]">Nenhum email enviado para este cliente ainda.</p>
        </div>
      ) : (
        <div className="space-y-[0.75rem]">
          {logs.map((log) => {
            const st = STATUS_STYLE[log.status] ?? STATUS_STYLE.pendente
            return (
              <div key={log.id} className="flex items-start gap-[0.875rem] pb-[0.75rem] border-b border-surface-border last:border-0 last:pb-0">
                <div className="w-[2rem] h-[2rem] rounded-[0.5rem] bg-ads-500/10 flex items-center justify-center shrink-0 mt-[0.125rem]">
                  <Mail className="w-[0.9375rem] h-[0.9375rem] text-ads-500" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[0.5rem] flex-wrap">
                    <p className="text-ink-primary text-[0.875rem] font-medium truncate">{log.assunto || log.template_tipo}</p>
                    {log.modo_teste && (
                      <span className="px-[0.375rem] py-[0.0625rem] rounded-full text-[0.5625rem] font-bold bg-status-orange/15 text-status-orange uppercase">
                        Teste
                      </span>
                    )}
                  </div>
                  <p className="text-ink-muted text-[0.75rem] mt-[0.1875rem]">
                    {log.template_tipo} · para {log.destinatario}
                  </p>
                  {log.status === 'falha' && log.mensagem_erro && (
                    <p className="text-status-red text-[0.75rem] mt-[0.1875rem] truncate">{log.mensagem_erro}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-[0.25rem] shrink-0">
                  <span className={cn('inline-flex items-center gap-[0.25rem] text-[0.75rem] font-medium', st.cor)}>
                    <st.Icon className="w-[0.6875rem] h-[0.6875rem]" strokeWidth={2.5} />
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </span>
                  <span className="text-ink-muted text-[0.6875rem]">
                    {new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
