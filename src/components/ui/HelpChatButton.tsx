'use client'

import { useEffect, useRef, useState } from 'react'
import { HelpCircle, X, Send, Loader2 } from 'lucide-react'

interface Mensagem {
  role: 'user' | 'assistant'
  text: string
}

export function HelpChatButton() {
  const [aberto,    setAberto]    = useState(false)
  const [msgs,      setMsgs]      = useState<Mensagem[]>([])
  const [input,     setInput]     = useState('')
  const [carregando, setCarregando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aberto && msgs.length === 0) {
      setMsgs([{ role: 'assistant', text: 'Olá! Sou o assistente da Adsgator. Como posso ajudar você a usar o sistema?' }])
    }
  }, [aberto])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function enviar() {
    if (!input.trim() || carregando) return
    const pergunta = input.trim()
    setInput('')
    setMsgs((prev) => [...prev, { role: 'user', text: pergunta }])
    setCarregando(true)
    try {
      const histMessages = msgs.slice(-6).map((m) => ({ role: m.role, content: m.text }))
      histMessages.push({ role: 'user', content: pergunta })
      const res = await fetch('/api/ia/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: histMessages }),
      })
      const data = await res.json()
      setMsgs((prev) => [...prev, { role: 'assistant', text: data.content ?? 'Não foi possível obter resposta.' }])
    } catch {
      setMsgs((prev) => [...prev, { role: 'assistant', text: 'Erro ao conectar com a IA. Tente novamente.' }])
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      {/* Chat overlay */}
      {aberto && (
        <div className="fixed bottom-[5rem] right-[1.5rem] w-[22rem] h-[28rem] bg-surface-card border border-surface-border rounded-xl shadow-2xl shadow-black/50 z-50 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-[1rem] py-[0.75rem] border-b border-surface-border bg-surface-hover">
            <div className="flex items-center gap-[0.5rem]">
              <HelpCircle className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={2} />
              <p className="text-ink-primary font-semibold text-[0.875rem]">Ajuda — Adsgator IA</p>
            </div>
            <button onClick={() => setAberto(false)} className="text-ink-muted hover:text-ink-primary">
              <X className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-[0.875rem] py-[0.75rem] flex flex-col gap-[0.625rem]">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-[0.75rem] py-[0.5rem] rounded-xl text-[0.8125rem] leading-snug ${
                  m.role === 'user'
                    ? 'bg-ads-500 text-white rounded-br-none'
                    : 'bg-surface-hover text-ink-secondary rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {carregando && (
              <div className="flex justify-start">
                <div className="bg-surface-hover px-[0.75rem] py-[0.5rem] rounded-xl rounded-bl-none">
                  <Loader2 className="w-[0.875rem] h-[0.875rem] text-ink-muted animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-[0.5rem] px-[0.75rem] py-[0.625rem] border-t border-surface-border">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && enviar()}
              placeholder="Pergunte sobre o sistema…"
              className="flex-1 bg-surface-hover border border-surface-border rounded-lg px-[0.625rem] py-[0.375rem] text-ink-primary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500"
            />
            <button
              onClick={enviar}
              disabled={!input.trim() || carregando}
              className="w-[2rem] h-[2rem] rounded-lg bg-ads-500 hover:bg-ads-600 flex items-center justify-center text-white disabled:opacity-40 transition-colors"
            >
              <Send className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(!aberto)}
        className="fixed bottom-[1.5rem] right-[1.5rem] w-[3rem] h-[3rem] rounded-full bg-ads-500 hover:bg-ads-600 text-white shadow-lg shadow-ads-500/30 flex items-center justify-center z-50 transition-all duration-200 hover:scale-110"
        aria-label="Ajuda com IA"
      >
        {aberto
          ? <X className="w-[1.125rem] h-[1.125rem]" strokeWidth={2} />
          : <HelpCircle className="w-[1.125rem] h-[1.125rem]" strokeWidth={2} />
        }
      </button>
    </>
  )
}
