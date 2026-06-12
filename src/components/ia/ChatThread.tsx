'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, FileText, User, Volume2, Wrench, Square } from 'lucide-react'
import { Markdown } from './Markdown'
import type { MensagemIA } from '@/lib/store/assistant-store'

interface ChatThreadProps {
  mensagens: MensagemIA[]
  enviando:  boolean
  /** Texto exibido quando a conversa está vazia */
  vazio?:    React.ReactNode
}

// Leitura em voz alta da resposta (speechSynthesis nativo, pt-BR)
function BotaoOuvir({ texto }: { texto: string }) {
  const [falando, setFalando] = useState(false)

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  function toggle() {
    if (!('speechSynthesis' in window)) return
    if (falando) {
      window.speechSynthesis.cancel()
      setFalando(false)
      return
    }
    window.speechSynthesis.cancel()
    const fala = new SpeechSynthesisUtterance(texto.replace(/[*#`_]/g, ''))
    fala.lang = 'pt-BR'
    fala.rate = 1.05
    fala.onend = () => setFalando(false)
    fala.onerror = () => setFalando(false)
    window.speechSynthesis.speak(fala)
    setFalando(true)
  }

  return (
    <button
      onClick={toggle}
      title={falando ? 'Parar leitura' : 'Ouvir resposta'}
      className="opacity-0 group-hover:opacity-100 transition-opacity w-[1.375rem] h-[1.375rem] rounded-md hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ads-500 shrink-0 self-end"
    >
      {falando
        ? <Square   className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
        : <Volume2  className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
      }
    </button>
  )
}

export function ChatThread({ mensagens, enviando, vazio }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, enviando])

  return (
    <div className="flex flex-col gap-[0.625rem] p-[0.875rem] flex-1 min-h-0 overflow-y-auto">
      {mensagens.length === 0 && !enviando && (
        <div className="flex flex-col items-center justify-center h-full text-center gap-[0.625rem] py-[1.5rem]">
          <div className="w-[2.75rem] h-[2.75rem] rounded-xl bg-ads-500/10 flex items-center justify-center">
            <Bot className="w-[1.375rem] h-[1.375rem] text-ads-500" strokeWidth={1.75} />
          </div>
          {vazio ?? (
            <p className="text-ink-muted text-[0.75rem] leading-relaxed max-w-[16rem]">
              Sou a Gator — vejo e opero tudo: clientes, tarefas, financeiro, marketing, APIs.
              Pergunte, peça ações, envie prints ou fale por voz.
            </p>
          )}
        </div>
      )}

      {mensagens.map((m) => (
        <div key={m.id} className={`group flex gap-[0.375rem] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
          <div className={`w-[1.375rem] h-[1.375rem] rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-ads-500/20' : 'bg-surface-hover'}`}>
            {m.role === 'user'
              ? <User className="w-[0.625rem] h-[0.625rem] text-ads-500" strokeWidth={2} />
              : <Bot  className="w-[0.625rem] h-[0.625rem] text-ink-muted" strokeWidth={1.75} />
            }
          </div>

          <div className={`rounded-xl px-[0.75rem] py-[0.5rem] max-w-[85%] text-[0.8125rem] ${
            m.role === 'user'
              ? 'bg-ads-500/15 text-ink-primary'
              : 'bg-surface-hover text-ink-secondary'
          }`}>
            {/* Anexos enviados */}
            {!!m.anexos?.length && (
              <div className="flex flex-wrap gap-[0.375rem] mb-[0.375rem]">
                {m.anexos.map((a, i) =>
                  a.tipo === 'imagem' && a.dataBase64 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={`data:${a.mimeType ?? 'image/jpeg'};base64,${a.dataBase64}`}
                      alt={a.nome}
                      className="max-h-[8rem] max-w-[12rem] rounded-lg border border-surface-border/40 object-cover"
                    />
                  ) : (
                    <span key={i} className="inline-flex items-center gap-[0.25rem] px-[0.5rem] py-[0.25rem] rounded-lg bg-surface-card border border-surface-border/40 text-[0.6875rem] text-ink-secondary">
                      <FileText className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                      {a.nome}
                    </span>
                  )
                )}
              </div>
            )}

            {m.role === 'assistant'
              ? <Markdown texto={m.content} />
              : <span className="whitespace-pre-wrap leading-relaxed">{m.content}</span>
            }

            {/* Ações que o agente executou */}
            {!!m.ferramentas?.length && (
              <div className="flex flex-wrap gap-[0.25rem] mt-[0.5rem] pt-[0.375rem] border-t border-surface-border/30">
                {m.ferramentas.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-[0.25rem] px-[0.375rem] py-[0.125rem] rounded-full bg-ads-500/10 text-ads-600 text-[0.625rem] font-medium">
                    <Wrench className="w-[0.5625rem] h-[0.5625rem]" strokeWidth={2.5} />
                    {f.resumo}
                  </span>
                ))}
              </div>
            )}
          </div>

          {m.role === 'assistant' && m.content && <BotaoOuvir texto={m.content} />}
        </div>
      ))}

      {enviando && (
        <div className="flex gap-[0.375rem]">
          <div className="w-[1.375rem] h-[1.375rem] rounded-full bg-surface-hover flex items-center justify-center shrink-0">
            <Bot className="w-[0.625rem] h-[0.625rem] text-ads-500 animate-pulse" strokeWidth={1.75} />
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
  )
}
