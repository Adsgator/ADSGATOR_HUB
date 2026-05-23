'use client'

import {
  ArrowRight,
  PauseCircle,
  MessageCircle,
  MoreHorizontal,
  Clock,
} from 'lucide-react'
import { cn }       from '@/lib/utils'
import type { Cliente, Estagio } from '@/lib/types'

const STATUS_CONFIG: Record<string, {
  label: string
  dot:   string
  text:  string
}> = {
  recebido:     { label: 'Recebido',     dot: 'bg-status-blue',   text: 'text-status-blue'   },
  onboarding:   { label: 'Onboarding',   dot: 'bg-ads-500',       text: 'text-ads-500'       },
  setup_trafego:{ label: 'Setup Tráfego',dot: 'bg-status-orange', text: 'text-status-orange' },
  ativo:        { label: 'Ativo',        dot: 'bg-status-green',  text: 'text-status-green'  },
  congelado:    { label: 'Congelado',    dot: 'bg-ink-muted',     text: 'text-ink-muted'     },
  cancelado:    { label: 'Cancelado',    dot: 'bg-status-red',    text: 'text-status-red'    },
}

const NICHO_EMOJI: Record<string, string> = {
  adestramento: '🐕',
  nutricao:     '🥗',
  trafego:      '📊',
  psicoterapia: '🧠',
  servicos:     '🔧',
  ecommerce:    '🛒',
}

interface ClienteProgressCardProps {
  cliente:    Cliente
  estagio:    Estagio | null
  onCongelar: (id: string) => void
  isRetido?:  boolean
}

export function ClienteProgressCard({
  cliente,
  estagio,
  onCongelar,
  isRetido = false,
}: ClienteProgressCardProps) {
  const status = STATUS_CONFIG[cliente.status] ?? STATUS_CONFIG['ativo']
  const emoji  = NICHO_EMOJI[cliente.nicho?.toLowerCase() ?? ''] ?? '🏢'

  const iniciais = cliente.nome
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  return (
    <article
      className={cn(
        'group relative flex flex-col',
        'bg-surface-card rounded-xl border border-surface-border',
        'p-[1.25rem]',
        'hover:border-surface-border/60 hover:shadow-lg hover:shadow-black/20',
        'transition-all duration-200',
        isRetido && 'opacity-70 hover:opacity-100',
      )}
    >
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-[1rem]">
        <div className="flex items-center gap-[0.625rem]">
          <div className="w-[2.25rem] h-[2.25rem] rounded-full bg-ads-500/15 border border-ads-500/20 flex items-center justify-center shrink-0">
            <span className="text-ads-500 text-[0.8125rem] font-bold">{iniciais}</span>
          </div>
          <div>
            <p className="text-ink-primary text-[0.875rem] font-semibold leading-tight">
              {cliente.nome}
            </p>
            <p className="text-ink-muted text-[0.75rem]">
              {emoji} {cliente.nicho}
            </p>
          </div>
        </div>

        <button className="w-[1.75rem] h-[1.75rem] rounded-[0.25rem] flex items-center justify-center text-ink-muted opacity-0 group-hover:opacity-100 hover:bg-surface-hover transition-all">
          <MoreHorizontal className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        </button>
      </div>

      {/* ── STATUS BADGE ──────────────────────────────────── */}
      <div className="flex items-center gap-[0.375rem] mb-[0.875rem]">
        <span className={cn('w-[0.4375rem] h-[0.4375rem] rounded-full shrink-0', status.dot)} />
        <span className={cn('text-[0.75rem] font-medium', status.text)}>{status.label}</span>
      </div>

      {/* ── PRÓXIMA AÇÃO ──────────────────────────────────── */}
      <div className="flex-1 mb-[1rem]">
        {estagio ? (
          <div className="flex items-start gap-[0.375rem]">
            <ArrowRight className="w-[0.875rem] h-[0.875rem] text-ads-500 shrink-0 mt-[0.0625rem]" strokeWidth={2} />
            <p className="text-ink-secondary text-[0.8125rem] leading-snug">
              {estagio.acao_label ?? estagio.nome ?? 'Verificar próxima ação'}
            </p>
          </div>
        ) : (
          <p className="text-ink-muted text-[0.8125rem] italic">
            Sem ação definida
          </p>
        )}
      </div>

      {/* ── FOOTER — BOTÕES ───────────────────────────────── */}
      <div className="flex items-center gap-[0.375rem] pt-[0.875rem] border-t border-surface-border">
        <a
          href={`/clientes/${cliente.id}`}
          className="flex-1 flex items-center justify-center gap-[0.375rem] h-[1.875rem] rounded-[0.375rem] bg-ads-500/10 text-ads-500 text-[0.8125rem] font-medium hover:bg-ads-500/20 transition-colors"
        >
          Abrir
          <ArrowRight className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
        </a>

        {cliente.whatsapp && (
          <a
            href={`https://wa.me/${cliente.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-[#25D366] transition-colors"
          >
            <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          </a>
        )}

        <button
          onClick={() => onCongelar(cliente.id)}
          className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-status-orange transition-colors"
          title={isRetido ? 'Reativar' : 'Congelar'}
        >
          {isRetido ? (
            <Clock className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          ) : (
            <PauseCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </article>
  )
}
