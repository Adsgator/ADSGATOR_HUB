'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Bot, User, ChevronDown, ChevronUp, CheckSquare, Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ChatMensagem } from '@/lib/types'
import type { ChatAction } from '@/app/api/ia/chat/route'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

interface ClienteOpcao {
  id:   string
  nome: string
}

function gerarId() {
  return Math.random().toString(36).slice(2, 10)
}

// Ícone da ação executada inline na mensagem
function ActionTag({ action }: { action: ChatAction }) {
  if (action.type === 'create_task') {
    return (
      <span className="inline-flex items-center gap-[0.25rem] px-[0.375rem] py-[0.125rem] rounded-full bg-ads-500/10 text-ads-500 text-[0.6875rem] font-medium">
        <CheckSquare className="w-[0.625rem] h-[0.625rem]" strokeWidth={2.5} />
        Task criada
      </span>
    )
  }
  if (action.type === 'create_notification') {
    return (
      <span className="inline-flex items-center gap-[0.25rem] px-[0.375rem] py-[0.125rem] rounded-full bg-status-blue/10 text-status-blue text-[0.6875rem] font-medium">
        <Bell className="w-[0.625rem] h-[0.625rem]" strokeWidth={2.5} />
        Notificação criada
      </span>
    )
  }
  return null
}

interface MensagemComAcoes extends ChatMensagem {
  actions?: ChatAction[]
}

export function GeminiChat() {
  const [aberto,         setAberto]         = useState(false)
  const [mensagens,      setMensagens]      = useState<MensagemComAcoes[]>([])
  const [input,          setInput]          = useState('')
  const [enviando,       setEnviando]       = useState(false)
  const [clientes,       setClientes]       = useState<ClienteOpcao[]>([])
  const [clienteSel,     setClienteSel]     = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('clientes').select('id, nome').in('status', ['ativo', 'onboarding']).limit(20)
      .then(({ data }) => setClientes((data ?? []) as ClienteOpcao[]))
  }, [])

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
          cliente_id: d.cliente_id || (clienteSel || undefined),
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

    const novaMensagem: MensagemComAcoes = {
      id: gerarId(), role: 'user', content: texto, created_at: new Date().toISOString(),
    }
    setMensagens((prev) => [...prev, novaMensagem])
    setInput('')
    setEnviando(true)

    try {
      const res  = await fetch('/api/ia/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages:            [...mensagens, novaMensagem],
          contexto_cliente_id: clienteSel || undefined,
        }),
      })
      const json = await res.json() as { content?: string; actions?: ChatAction[]; error?: string }

      if (json.actions?.length) {
        await executarAcoes(json.actions)
        json.actions.forEach((a) => {
          if (a.type === 'create_task')         toast.success('Task criada pelo assistente!')
          if (a.type === 'create_notification') toast.success('Notificação criada!')
        })
      }

      setMensagens((prev) => [
        ...prev,
        {
          id: gerarId(),
          role: 'assistant',
          content: json.content ?? json.error ?? 'Erro ao responder.',
          created_at: new Date().toISOString(),
          actions: json.actions,
        },
      ])
    } catch {
      setMensagens((prev) => [
        ...prev,
        { id: gerarId(), role: 'assistant', content: 'Não foi possível conectar ao assistente.', created_at: new Date().toISOString() },
      ])
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="overflow-hidden h-full flex flex-col">
      {/* Header / toggle */}
      <button
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center justify-between px-[1.25rem] py-[0.875rem] hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-[0.5rem]">
          <Bot className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={1.75} />
          <p className="text-ink-primary font-semibold text-[0.875rem]">Assistente Adsgator</p>
          {mensagens.length > 0 && (
            <span className="text-[0.625rem] font-semibold bg-ads-500/15 text-ads-500 px-[0.375rem] py-[0.0625rem] rounded-full">
              {mensagens.length}
            </span>
          )}
        </div>
        {aberto
          ? <ChevronUp   className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.75} />
          : <ChevronDown className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.75} />
        }
      </button>

      {aberto && (
        <>
          {/* Seletor de contexto */}
          <div className="px-[1.25rem] pb-[0.75rem] border-b border-surface-border/30">
            <select
              value={clienteSel}
              onChange={(e) => setClienteSel(e.target.value)}
              className="w-full h-[2rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-secondary text-[0.75rem] focus:outline-none focus:ring-1 focus:ring-ads-500/30"
            >
              <option value="">Sem contexto de cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* Histórico */}
          <div className="flex flex-col gap-[0.625rem] p-[1rem] max-h-[18rem] overflow-y-auto">
            {mensagens.length === 0 && (
              <p className="text-ink-muted text-[0.8125rem] italic text-center py-[1.5rem]">
                Pergunte sobre clientes, campanhas ou operação.<br />
                <span className="text-[0.75rem]">Posso criar tasks e notificações para você.</span>
              </p>
            )}
            {mensagens.map((m) => (
              <div key={m.id} className={`flex gap-[0.5rem] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-[1.5rem] h-[1.5rem] rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-ads-500/20' : 'bg-surface-hover'}`}>
                  {m.role === 'user'
                    ? <User className="w-[0.75rem] h-[0.75rem] text-ads-500" strokeWidth={2} />
                    : <Bot  className="w-[0.75rem] h-[0.75rem] text-ink-muted" strokeWidth={1.75} />
                  }
                </div>
                <div className={`rounded-xl px-[0.75rem] py-[0.5rem] max-w-[80%] text-[0.8125rem] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-ads-500/15 text-ink-primary'
                    : 'bg-surface-hover text-ink-secondary'
                }`}>
                  {m.content}
                  {m.actions && m.actions.length > 0 && (
                    <div className="flex flex-wrap gap-[0.25rem] mt-[0.375rem]">
                      {m.actions.map((a, i) => <ActionTag key={i} action={a} />)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {enviando && (
              <div className="flex gap-[0.5rem]">
                <div className="w-[1.5rem] h-[1.5rem] rounded-full bg-surface-hover flex items-center justify-center">
                  <Bot className="w-[0.75rem] h-[0.75rem] text-ink-muted" strokeWidth={1.75} />
                </div>
                <div className="bg-surface-hover rounded-xl px-[0.75rem] py-[0.5rem]">
                  <div className="flex gap-[0.25rem] items-center h-[1rem]">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-[0.375rem] h-[0.375rem] rounded-full bg-ink-muted animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-[1rem] pb-[1rem] flex gap-[0.5rem]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && enviar()}
              placeholder="Pergunte ou peça para criar task…"
              disabled={enviando}
              className="flex-1 h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors disabled:opacity-50"
            />
            <Button
              variant="primary"
              size="md"
              onClick={enviar}
              disabled={!input.trim() || enviando}
              icon={<Send className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
              className="w-[2.25rem] px-0"
            />
          </div>
        </>
      )}
    </div>
  )
}
