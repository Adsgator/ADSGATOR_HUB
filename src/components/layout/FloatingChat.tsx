'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Send, User, X, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRightSidebarStore } from '@/lib/store/right-sidebar-store'
import type { ChatMensagem } from '@/lib/types'
import type { ChatAction } from '@/app/api/ia/chat/route'
import { toast } from 'sonner'

function gerarId() {
  return Math.random().toString(36).slice(2, 10)
}

interface MensagemComAcoes extends ChatMensagem {
  actions?: ChatAction[]
}

// Aberto/fechado é controlado pelo botão "Assistente IA" da RightSidebar
// (via right-sidebar-store) — não há mais botão flutuante próprio.
export function FloatingChat() {
  const aberto      = useRightSidebarStore((s) => s.activeDrawer === 'chat')
  const closeDrawer = useRightSidebarStore((s) => s.closeDrawer)
  const [minimized, setMinimized] = useState(false)
  const [mensagens, setMensagens] = useState<MensagemComAcoes[]>([])
  const [input,     setInput]     = useState('')
  const [enviando,  setEnviando]  = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  async function executarAcoes(actions: ChatAction[]) {
    for (const action of actions) {
      if (action.type === 'create_task') {
        const d = action.data as { titulo?: string; descricao?: string; prioridade?: string; cliente_id?: string }
        await supabase.from('tarefas').insert({
          titulo:     d.titulo     ?? 'Task criada pelo assistente',
          descricao:  d.descricao  ?? '',
          prioridade: d.prioridade ?? 'normal',
          status:     'pendente',
          cliente_id: d.cliente_id || undefined,
        })
      } else if (action.type === 'create_notification') {
        const d = action.data as { titulo?: string; mensagem?: string }
        await supabase.from('notificacoes').insert({
          titulo:   d.titulo   ?? 'Lembrete do assistente',
          mensagem: d.mensagem ?? '',
          tipo:     'info',
          lida:     false,
        })
      }
    }
  }

  async function enviar() {
    const texto = input.trim()
    if (!texto || enviando) return

    const nova: MensagemComAcoes = {
      id: gerarId(), role: 'user', content: texto, created_at: new Date().toISOString(),
    }
    setMensagens((p) => [...p, nova])
    setInput('')
    setEnviando(true)
    if (minimized) setMinimized(false)

    try {
      const res  = await fetch('/api/ia/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: [...mensagens, nova] }),
      })
      const json = await res.json() as { content?: string; actions?: ChatAction[]; error?: string }

      if (json.actions?.length) {
        await executarAcoes(json.actions)
        json.actions.forEach((a) => {
          if (a.type === 'create_task')         toast.success('Task criada!')
          if (a.type === 'create_notification') toast.success('Notificação criada!')
        })
      }

      setMensagens((p) => [
        ...p,
        {
          id: gerarId(), role: 'assistant',
          content: json.content ?? json.error ?? 'Erro ao responder.',
          created_at: new Date().toISOString(),
          actions: json.actions,
        },
      ])
    } catch {
      setMensagens((p) => [
        ...p,
        { id: gerarId(), role: 'assistant', content: 'Sem conexão com o assistente.', created_at: new Date().toISOString() },
      ])
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      {/* Janela do chat */}
      {aberto && (
        <div className="fixed bottom-[3rem] right-[3.5rem] z-40 w-[22rem] rounded-2xl bg-surface-card border border-surface-border shadow-2xl flex flex-col overflow-hidden animate-fade-scale">
          {/* Header */}
          <div className="flex items-center justify-between px-[1rem] py-[0.75rem] border-b border-surface-border/50 bg-surface-elevated">
            <div className="flex items-center gap-[0.5rem]">
              <div className="w-[1.75rem] h-[1.75rem] rounded-lg bg-ads-500/15 flex items-center justify-center">
                <Bot className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-ink-primary text-[0.8125rem] font-semibold leading-none">Assistente</p>
                <p className="text-ink-muted text-[0.6875rem] mt-[0.125rem]">Adsgator IA</p>
              </div>
            </div>
            <div className="flex items-center gap-[0.25rem]">
              <button
                onClick={() => setMinimized((v) => !v)}
                className="w-[1.75rem] h-[1.75rem] rounded-lg hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
              >
                <Minus className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
              </button>
              <button
                onClick={() => { closeDrawer(); setMinimized(false) }}
                className="w-[1.75rem] h-[1.75rem] rounded-lg hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
              >
                <X className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Corpo — colapsa ao minimizar */}
          {!minimized && (
            <>
              {/* Histórico */}
              <div className="flex flex-col gap-[0.5rem] p-[0.875rem] h-[16rem] overflow-y-auto">
                {mensagens.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-[0.5rem]">
                    <div className="w-[2.5rem] h-[2.5rem] rounded-xl bg-ads-500/10 flex items-center justify-center">
                      <Bot className="w-[1.25rem] h-[1.25rem] text-ads-500" strokeWidth={1.75} />
                    </div>
                    <p className="text-ink-muted text-[0.75rem] leading-relaxed">
                      Pergunte sobre clientes, campanhas<br />ou peça para criar tasks.
                    </p>
                  </div>
                )}

                {mensagens.map((m) => (
                  <div key={m.id} className={`flex gap-[0.375rem] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-[1.375rem] h-[1.375rem] rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-ads-500/20' : 'bg-surface-hover'}`}>
                      {m.role === 'user'
                        ? <User className="w-[0.625rem] h-[0.625rem] text-ads-500" strokeWidth={2} />
                        : <Bot  className="w-[0.625rem] h-[0.625rem] text-ink-muted" strokeWidth={1.75} />
                      }
                    </div>
                    <div className={`rounded-xl px-[0.625rem] py-[0.4375rem] max-w-[82%] text-[0.75rem] leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-ads-500/15 text-ink-primary'
                        : 'bg-surface-hover text-ink-secondary'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}

                {enviando && (
                  <div className="flex gap-[0.375rem]">
                    <div className="w-[1.375rem] h-[1.375rem] rounded-full bg-surface-hover flex items-center justify-center shrink-0">
                      <Bot className="w-[0.625rem] h-[0.625rem] text-ink-muted" strokeWidth={1.75} />
                    </div>
                    <div className="bg-surface-hover rounded-xl px-[0.625rem] py-[0.5rem]">
                      <div className="flex gap-[0.25rem] items-center h-[0.875rem]">
                        {[0, 120, 240].map((d) => (
                          <div key={d} className="w-[0.3125rem] h-[0.3125rem] rounded-full bg-ink-muted animate-bounce" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="flex gap-[0.375rem] px-[0.875rem] pb-[0.875rem]">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && enviar()}
                  placeholder="Pergunte ou peça uma ação…"
                  disabled={enviando}
                  className="flex-1 h-[2rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.8125rem] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500/50 transition-colors disabled:opacity-50"
                />
                <button
                  onClick={enviar}
                  disabled={!input.trim() || enviando}
                  className="w-[2rem] h-[2rem] rounded-lg bg-ads-500 hover:bg-ads-600 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-[0.75rem] h-[0.75rem] text-white" strokeWidth={2} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
