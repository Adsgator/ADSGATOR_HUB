'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText, Mic, Paperclip, Send, X } from 'lucide-react'
import type { AnexoIA } from '@/lib/store/assistant-store'

// Tipagem mínima da Web Speech API (não existe em lib.dom para todos os targets)
interface ResultadoFala {
  resultIndex: number
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>
}
interface ReconhecimentoFala {
  lang:            string
  continuous:      boolean
  interimResults:  boolean
  onresult:        ((e: ResultadoFala) => void) | null
  onend:           (() => void) | null
  onerror:         (() => void) | null
  start:           () => void
  stop:            () => void
}

function criarReconhecimento(): ReconhecimentoFala | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as Record<string, unknown>
  const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as (new () => ReconhecimentoFala) | undefined
  return Ctor ? new Ctor() : null
}

interface ComposerProps {
  enviando:      boolean
  anexos:        AnexoIA[]
  onEnviar:      (texto: string) => void
  onAddArquivos: (files: File[]) => void
  onRemoverAnexo: (index: number) => void
  autoFocus?:    boolean
}

export function Composer({ enviando, anexos, onEnviar, onAddArquivos, onRemoverAnexo, autoFocus }: ComposerProps) {
  const [texto, setTexto] = useState('')
  const [ouvindo, setOuvindo] = useState(false)
  const [temVoz, setTemVoz] = useState(false)
  const areaRef  = useRef<HTMLTextAreaElement>(null)
  const fileRef  = useRef<HTMLInputElement>(null)
  const recRef   = useRef<ReconhecimentoFala | null>(null)
  const baseVoz  = useRef('') // texto que já estava digitado quando o mic ligou

  useEffect(() => {
    setTemVoz(!!criarReconhecimento())
    return () => recRef.current?.stop()
  }, [])

  // Autosize do textarea (até ~5 linhas)
  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [texto])

  function enviar() {
    const t = texto.trim()
    if ((!t && !anexos.length) || enviando) return
    pararVoz()
    setTexto('')
    onEnviar(t)
  }

  function pararVoz() {
    recRef.current?.stop()
    recRef.current = null
    setOuvindo(false)
  }

  function toggleVoz() {
    if (ouvindo) { pararVoz(); return }
    const rec = criarReconhecimento()
    if (!rec) return
    baseVoz.current = texto ? `${texto.trim()} ` : ''
    rec.lang = 'pt-BR'
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e) => {
      let transcrito = ''
      for (let i = 0; i < e.results.length; i++) transcrito += e.results[i][0].transcript
      setTexto(baseVoz.current + transcrito)
    }
    rec.onend = () => setOuvindo(false)
    rec.onerror = () => setOuvindo(false)
    recRef.current = rec
    rec.start()
    setOuvindo(true)
  }

  function onPaste(e: React.ClipboardEvent) {
    const imagens = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith('image/'))
    if (imagens.length) {
      e.preventDefault()
      onAddArquivos(imagens)
    }
  }

  return (
    <div className="px-[0.875rem] pb-[0.875rem]">
      {/* Chips de anexos pendentes */}
      {anexos.length > 0 && (
        <div className="flex flex-wrap gap-[0.375rem] mb-[0.5rem]">
          {anexos.map((a, i) => (
            <span key={i} className="relative inline-flex items-center gap-[0.375rem] pl-[0.375rem] pr-[1.5rem] py-[0.25rem] rounded-lg bg-surface-hover border border-surface-border/40 text-[0.6875rem] text-ink-secondary max-w-[12rem]">
              {a.tipo === 'imagem' && a.dataBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`data:${a.mimeType ?? 'image/jpeg'};base64,${a.dataBase64}`} alt={a.nome} className="w-[1.5rem] h-[1.5rem] rounded object-cover" />
              ) : (
                <FileText className="w-[0.75rem] h-[0.75rem] shrink-0" strokeWidth={2} />
              )}
              <span className="truncate">{a.nome}</span>
              <button
                onClick={() => onRemoverAnexo(i)}
                className="absolute right-[0.25rem] top-1/2 -translate-y-1/2 w-[1rem] h-[1rem] rounded-full hover:bg-surface-elevated flex items-center justify-center text-ink-muted hover:text-status-red"
              >
                <X className="w-[0.625rem] h-[0.625rem]" strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-[0.375rem]">
        {/* Anexar */}
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,.md,.txt,.csv,.json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onAddArquivos(Array.from(e.target.files))
            e.target.value = ''
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          title="Anexar imagem ou arquivo (.md, .txt, .csv, .json)"
          className="w-[2rem] h-[2rem] rounded-lg hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors shrink-0"
        >
          <Paperclip className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        </button>

        {/* Voz */}
        {temVoz && (
          <button
            onClick={toggleVoz}
            title={ouvindo ? 'Parar ditado' : 'Falar (ditado por voz)'}
            className={`w-[2rem] h-[2rem] rounded-lg flex items-center justify-center transition-colors shrink-0 ${
              ouvindo
                ? 'bg-status-red/15 text-status-red animate-pulse'
                : 'hover:bg-surface-hover text-ink-muted hover:text-ink-primary'
            }`}
          >
            <Mic className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          </button>
        )}

        <textarea
          ref={areaRef}
          rows={1}
          value={texto}
          autoFocus={autoFocus}
          onChange={(e) => setTexto(e.target.value)}
          onPaste={onPaste}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              enviar()
            }
          }}
          placeholder={ouvindo ? 'Ouvindo… fale agora' : 'Pergunte, peça uma ação ou cole um print…'}
          disabled={enviando}
          className="flex-1 min-h-[2rem] px-[0.625rem] py-[0.4375rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.8125rem] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500/50 transition-colors disabled:opacity-50 resize-none leading-snug"
        />

        <button
          onClick={enviar}
          disabled={(!texto.trim() && !anexos.length) || enviando}
          className="w-[2rem] h-[2rem] rounded-lg bg-ads-500 hover:bg-ads-600 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Send className="w-[0.75rem] h-[0.75rem] text-white" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
