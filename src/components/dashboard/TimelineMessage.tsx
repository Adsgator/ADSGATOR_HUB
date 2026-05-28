'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimelineMessage as TMessage } from '@/lib/types/timeline'

interface TimelineMessageProps {
  message: TMessage
}

export function TimelineMessage({ message }: TimelineMessageProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(message.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isLeft = message.role === 'instruction'
  const isTemplate = message.role === 'template'

  return (
    <div className={cn('flex gap-[0.5rem] group', isLeft ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'relative max-w-[85%] rounded-2xl px-[0.75rem] py-[0.5rem] text-[0.8125rem] leading-snug',
          isLeft
            ? 'bg-surface-hover text-ink-secondary rounded-tl-sm'
            : isTemplate
              ? 'bg-emerald-500/10 text-emerald-400 rounded-tr-sm border border-emerald-500/20'
              : 'bg-ads-500/10 text-ads-500 rounded-tr-sm border border-ads-500/20'
        )}
      >
        {message.text}

        {message.copyable && (
          <button
            onClick={copy}
            className={cn(
              'absolute -top-[0.5rem] right-[0.375rem] w-[1.25rem] h-[1.25rem] rounded-full',
              'flex items-center justify-center transition-all',
              copied
                ? 'bg-status-green text-white opacity-100'
                : 'bg-surface-elevated text-ink-muted opacity-0 group-hover:opacity-100 hover:text-ink-primary'
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
  )
}
