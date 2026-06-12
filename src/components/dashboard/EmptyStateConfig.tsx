'use client'

// Empty state para widgets vazios POR FALTA DE CONFIGURAÇÃO (não por falta de
// dados do dia). Explica o motivo e aponta para a Central de Prontidão —
// em vez de esconder o widget e deixar o operador sem saber o que falta.

import Link from 'next/link'
import { Settings2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateConfigProps {
  icon?:    LucideIcon
  titulo:   string
  /** Por que está vazio, em 1-2 linhas */
  motivo:   string
  ctaLabel?: string
  ctaHref?:  string
  /** Versão enxuta para caber em widgets pequenos do grid */
  compacto?: boolean
}

export function EmptyStateConfig({
  icon: Icon = Settings2,
  titulo,
  motivo,
  ctaLabel = 'Abrir Setup',
  ctaHref = '/configuracoes?tab=setup',
  compacto = false,
}: EmptyStateConfigProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center h-full ${compacto ? 'gap-[0.375rem] p-[0.75rem]' : 'gap-[0.5rem] p-[1.25rem]'}`}>
      <div className={`rounded-lg bg-surface-hover flex items-center justify-center ${compacto ? 'w-[1.75rem] h-[1.75rem]' : 'w-[2.25rem] h-[2.25rem]'}`}>
        <Icon className={`text-ink-muted ${compacto ? 'w-[0.875rem] h-[0.875rem]' : 'w-[1.125rem] h-[1.125rem]'}`} strokeWidth={1.75} />
      </div>
      <p className={`text-ink-primary font-semibold ${compacto ? 'text-[0.8125rem]' : 'text-[0.875rem]'}`}>{titulo}</p>
      <p className={`text-ink-muted leading-snug ${compacto ? 'text-[0.6875rem]' : 'text-[0.75rem]'} max-w-[18rem]`}>{motivo}</p>
      <Link
        href={ctaHref}
        className={`text-ads-500 hover:text-ads-600 font-medium transition-colors ${compacto ? 'text-[0.6875rem]' : 'text-[0.75rem]'}`}
      >
        {ctaLabel} →
      </Link>
    </div>
  )
}
