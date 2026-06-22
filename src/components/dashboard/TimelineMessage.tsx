'use client'

import { useMemo, useState } from 'react'
import { Copy, Check, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { interpolar } from '@/lib/timeline-vars'
import type { TimelineMessage as TMessage } from '@/lib/types/timeline'

interface TimelineMessageProps {
  message: TMessage
  /** Variáveis para interpolar {{...}} no texto (primeiro_nome, drive_url, etc.) */
  vars?: Record<string, string>
  /** WhatsApp do cliente (só dígitos ou com máscara) — habilita o botão "enviar" */
  whatsapp?: string | null
}

export function TimelineMessage({ message, vars, whatsapp }: TimelineMessageProps) {
  const [copied, setCopied] = useState(false)

  // Texto final com variáveis resolvidas + chaves que ficaram sem valor
  const { texto, faltando } = useMemo(
    () => interpolar(message.text, vars ?? {}),
    [message.text, vars],
  )

  const copy = async () => {
    await navigator.clipboard.writeText(texto)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const abrirWhatsApp = () => {
    const num = (whatsapp ?? '').replace(/\D/g, '')
    if (!num) return
    const numComDDI = num.startsWith('55') ? num : `55${num}`
    window.open(`https://wa.me/${numComDDI}?text=${encodeURIComponent(texto)}`, '_blank')
  }

  const isLeft = message.role === 'instruction'
  const isTemplate = message.role === 'template'
  // Mensagens de template/ação são as que vão pro cliente → oferecem WhatsApp
  const podeEnviar = !isLeft && !!(whatsapp ?? '').replace(/\D/g, '')

  return (
    <div className={cn('flex gap-[0.5rem] group', isLeft ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'relative max-w-[85%] rounded-2xl px-[0.75rem] py-[0.5rem] text-[0.8125rem] leading-snug whitespace-pre-wrap',
          isLeft
            ? 'bg-surface-hover text-ink-secondary rounded-tl-sm'
            : isTemplate
              ? 'bg-emerald-500/10 text-emerald-400 rounded-tr-sm border border-emerald-500/20'
              : 'bg-ads-500/10 text-ads-500 rounded-tr-sm border border-ads-500/20'
        )}
      >
        {texto}

        {/* Aviso de variável não preenchida (ex.: link do Drive) */}
        {faltando.length > 0 && (
          <p className="mt-[0.375rem] text-[0.6875rem] text-status-orange">
            Falta preencher: {faltando.map((f) => `{{${f}}}`).join(', ')}
          </p>
        )}

        {/* Ações: copiar + enviar no WhatsApp */}
        <div className={cn(
          'absolute -top-[0.625rem] right-[0.375rem] flex items-center gap-[0.25rem]',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          copied && 'opacity-100',
        )}>
          {podeEnviar && (
            <button
              onClick={abrirWhatsApp}
              className="w-[1.375rem] h-[1.375rem] rounded-full flex items-center justify-center bg-[#25D366] text-white hover:brightness-110 transition-all shadow-sm"
              title="Abrir no WhatsApp"
            >
              <MessageCircle className="w-[0.6875rem] h-[0.6875rem]" strokeWidth={2.5} />
            </button>
          )}
          {message.copyable && (
            <button
              onClick={copy}
              className={cn(
                'w-[1.375rem] h-[1.375rem] rounded-full flex items-center justify-center transition-all shadow-sm',
                copied
                  ? 'bg-status-green text-white'
                  : 'bg-surface-elevated text-ink-muted hover:text-ink-primary',
              )}
              title="Copiar"
            >
              {copied
                ? <Check className="w-[0.625rem] h-[0.625rem]" />
                : <Copy className="w-[0.625rem] h-[0.625rem]" />
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
