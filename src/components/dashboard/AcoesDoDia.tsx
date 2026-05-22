'use client'

import {
  AlertTriangle,
  Clock,
  TrendingUp,
  MessageCircle,
  Mail,
  PauseCircle,
  Archive,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Cliente, Estagio } from '@/lib/types'

type Urgencia = 'critica' | 'atencao' | 'review'

interface AcaoItem {
  cliente:   Cliente
  estagio:   Estagio | null
  urgencia:  Urgencia
  descricao: string
  acaoLabel: string
  whatsapp?: string
}

const urgenciaConfig: Record<Urgencia, {
  label:  string
  icon:   typeof AlertTriangle
  bg:     string
  border: string
  text:   string
  badge:  string
}> = {
  critica: {
    label:  'URGENTE',
    icon:   AlertTriangle,
    bg:     'bg-status-red/5',
    border: 'border-status-red/25',
    text:   'text-status-red',
    badge:  'bg-status-red/15 text-status-red',
  },
  atencao: {
    label:  'PENDENTE',
    icon:   Clock,
    bg:     'bg-status-orange/5',
    border: 'border-status-orange/25',
    text:   'text-status-orange',
    badge:  'bg-status-orange/15 text-status-orange',
  },
  review: {
    label:  'REVISAR',
    icon:   TrendingUp,
    bg:     'bg-status-blue/5',
    border: 'border-status-blue/25',
    text:   'text-status-blue',
    badge:  'bg-status-blue/15 text-status-blue',
  },
}

interface AcoesDoDiaProps {
  items:       AcaoItem[]
  onCongelar:  (id: string) => void
  onArquivar?: (id: string) => void
}

export function AcoesDoDia({ items, onCongelar, onArquivar }: AcoesDoDiaProps) {
  if (items.length === 0) return null

  return (
    <section className="mb-[2rem]">
      <div className="flex items-center justify-between mb-[0.75rem]">
        <div className="flex items-center gap-[0.5rem]">
          <AlertTriangle className="w-[1rem] h-[1rem] text-status-red" strokeWidth={2} />
          <h2 className="text-ink-primary font-semibold text-[0.9375rem]">
            Ações do Dia
            <span className="ml-[0.5rem] inline-flex items-center justify-center w-[1.25rem] h-[1.25rem] rounded-full bg-status-red/15 text-status-red text-[0.6875rem] font-bold">
              {items.length}
            </span>
          </h2>
        </div>
      </div>

      <div className="space-y-[0.5rem]">
        {items.map(({ cliente, urgencia, descricao, acaoLabel, whatsapp }) => {
          const cfg  = urgenciaConfig[urgencia]
          const Icon = cfg.icon

          return (
            <div
              key={cliente.id}
              className={cn(
                'flex items-center gap-[1rem]',
                'rounded-xl border px-[1.25rem] py-[1rem]',
                'transition-all duration-150 hover:brightness-110',
                cfg.bg,
                cfg.border,
              )}
            >
              {/* ── BADGE URGÊNCIA ────────────────────────── */}
              <div className={cn('shrink-0 flex items-center gap-[0.375rem] rounded-full px-[0.625rem] h-[1.5rem] text-[0.6875rem] font-bold tracking-wide', cfg.badge)}>
                <Icon className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} />
                {cfg.label}
              </div>

              {/* ── INFO ──────────────────────────────────── */}
              <div className="flex-1 min-w-0">
                <p className="text-ink-primary text-[0.875rem] font-semibold truncate">
                  {cliente.nome}
                  <span className="ml-[0.375rem] text-ink-muted font-normal text-[0.8125rem]">
                    ({cliente.nicho})
                  </span>
                </p>
                <p className="text-ink-secondary text-[0.8125rem] mt-[0.0625rem] line-clamp-1">
                  {descricao}
                </p>
              </div>

              {/* ── AÇÕES ─────────────────────────────────── */}
              <div className="shrink-0 flex items-center gap-[0.375rem]">
                {whatsapp && (
                  <a
                    href={`https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-[0.375rem] h-[1.875rem] px-[0.75rem] rounded-[0.375rem] bg-[#25D366]/10 text-[#25D366] text-[0.8125rem] font-medium hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/20"
                  >
                    <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                    <span className="hidden sm:inline">{acaoLabel}</span>
                  </a>
                )}

                <button className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-ink-primary transition-colors">
                  <Mail className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                </button>

                <button
                  onClick={() => onCongelar(cliente.id)}
                  className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-status-orange transition-colors"
                >
                  <PauseCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                </button>

                {onArquivar && (
                  <button
                    onClick={() => onArquivar(cliente.id)}
                    className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-ink-primary transition-colors"
                  >
                    <Archive className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
