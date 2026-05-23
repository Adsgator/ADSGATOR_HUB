'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Bot, User, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ChatMensagem } from '@/lib/types'

interface ClienteOpcao {
  id:   string
  nome: string
}

function gerarId() {
  return Math.random().toString(36).slice(2, 10)
}

export function GeminiChat() {
  const [aberto,         setAberto]         = useState(false)
  const [mensagens,      setMensagens]      = useState<ChatMensagem[]>([])
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

  async function enviar() {
    const texto = input.trim()
    if (!texto || enviando) return

    const novaMensagem: ChatMensagem = {
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
          messages:              [...mensagens, novaMensagem],
          contexto_cliente_id:   clienteSel || undefined,
        }),
      })
      const json = await res.json() as { content?: string; error?: string }
      setMensagens((prev) => [
        ...prev,
        { id: gerarId(), role: 'assistant', content: json.content ?? json.error ?? 'Erro ao responder.', created_at: new Date().toISOString() },
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
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
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
          <div className="px-[1.25rem] pb-[0.75rem] border-b border-surface-border">
            <select
              value={clienteSel}
              onChange={(e) => setClienteSel(e.target.value)}
              className="w-full h-[2rem] px-[0.625rem] rounded bg-surface-hover border border-surface-border text-ink-secondary text-[0.75rem] focus:outline-none focus:ring-1 focus:ring-ads-500/40"
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
                Pergunte sobre clientes, campanhas ou operação.
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
              placeholder="Digite sua pergunta…"
              disabled={enviando}
              className="flex-1 h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors disabled:opacity-50"
            />
            <button
              onClick={enviar}
              disabled={!input.trim() || enviando}
              className="w-[2.25rem] h-[2.25rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <Send className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
