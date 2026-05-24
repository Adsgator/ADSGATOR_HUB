'use client'

import {
  AlertTriangle,
  Clock,
  TrendingUp,
  MessageCircle,
  CheckCircle2,
  PauseCircle,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/EmptyState'
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
  label:      string
  icon:       typeof AlertTriangle
  bg:         string
  borderLeft: string
  text:       string
  badge:      string
}> = {
  critica: {
    label:      'URGENTE',
    icon:       AlertTriangle,
    bg:         'bg-status-red/5',
    borderLeft: 'bg-status-red',
    text:       'text-status-red',
    badge:      'bg-status-red/15 text-status-red',
  },
  atencao: {
    label:      'PENDENTE',
    icon:       Clock,
    bg:         'bg-status-orange/5',
    borderLeft: 'bg-ads-500',
    text:       'text-status-orange',
    badge:      'bg-status-orange/15 text-status-orange',
  },
  review: {
    label:      'REVISAR',
    icon:       TrendingUp,
    bg:         'bg-status-blue/5',
    borderLeft: 'bg-status-green',
    text:       'text-status-blue',
    badge:      'bg-status-blue/15 text-status-blue',
  },
}

interface AcoesDoDiaProps {
  items:       AcaoItem[]
  onCongelar:  (id: string) => void
  onFeito?:    (id: string) => void
}

export function AcoesDoDia({ items, onCongelar, onFeito }: AcoesDoDiaProps) {
  // Ordenação conforme arquivo mestre
  const ordenado = [...items].sort((a, b) => {
    const peso: Record<Urgencia, number> = { critica: 3, atencao: 2, review: 1 }
    return peso[b.urgencia] - peso[a.urgencia]
  })

  if (ordenado.length === 0) {
    return (
      <section className="mb-[2rem]">
        <EmptyState
          icon={<CheckCircle2 className="w-[1.5rem] h-[1.5rem] text-status-green" strokeWidth={1.5} />}
          title="Sem ações pendentes"
          description="Todos os clientes estão em dia. Boa semana!"
        />
      </section>
    )
  }

  return (
    <section className="mb-[2rem]">
      <div className="flex items-center justify-between mb-[0.75rem]">
        <div className="flex items-center gap-[0.5rem]">
          <AlertTriangle className="w-4 h-4 text-status-red" strokeWidth={2} />
          <h2 className="text-ink-primary font-bold text-base">
            Ações do Dia
            <span className="ml-[0.5rem] inline-flex items-center justify-center min-w-[1.25rem] h-[1.25rem] px-1 rounded-full bg-status-red/15 text-status-red text-xs font-bold">
              {items.length}
            </span>
          </h2>
        </div>
      </div>

      <div className="space-y-[0.5rem]">
        {ordenado.map(({ cliente, urgencia, descricao, acaoLabel, whatsapp }) => {
          const cfg  = urgenciaConfig[urgencia]
          const Icon = cfg.icon

          const handleWhatsApp = () => {
            const texto = `Olá ${cliente.nome.split(' ')[0]}, tudo bem? Aqui é da Adsgator. `
            window.open(`https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank')
          }

          const handleFeito = () => {
            toast.success(`Ação marcada como feita para ${cliente.nome.split(' ')[0]}`)
            onFeito?.(cliente.id)
          }

          // Determinar botão de ação principal baseado no tipo
          const getBotaoPrincipal = () => {
            if (whatsapp && urgencia === 'critica') {
              return (
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center gap-[0.375rem] h-[2rem] px-3 rounded-md bg-[#25D366]/10 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/20 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">Cobrar WhatsApp</span>
                </button>
              )
            }
            if (urgencia === 'review') {
              return (
                <a
                  href={`/analytics?cliente=${cliente.id}`}
                  className="flex items-center gap-[0.375rem] h-[2rem] px-3 rounded-md bg-surface-hover text-ink-secondary text-xs font-medium hover:bg-surface-border transition-colors"
                >
                  <BarChart3 className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">Ver Analytics</span>
                </a>
              )
            }
            return (
              <a
                href={`/clientes/${cliente.id}`}
                className="flex items-center gap-[0.375rem] h-[2rem] px-3 rounded-md bg-surface-hover text-ink-secondary text-xs font-medium hover:bg-surface-border transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">Ver checklist</span>
              </a>
            )
          }

          return (
            <div
              key={cliente.id}
              className={cn(
                'flex items-center gap-[1rem]',
                'rounded-xl dark:border dark:border-surface-border px-[1rem] py-[0.875rem]',
                'bg-surface-card card-shadow hover:shadow-md transition-all duration-200',
                'relative overflow-hidden',
              )}
            >
              {/* ── BORDA LATERAL COLORIDA ──────────────── */}
              <div className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-xl', cfg.borderLeft)} />

              {/* ── BADGE URGÊNCIA ────────────────────────── */}
              <div className={cn('shrink-0 flex items-center gap-[0.375rem] rounded-full px-2.5 h-6 text-xs font-bold tracking-wide ml-2', cfg.badge)}>
                <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                {cfg.label}
              </div>

              {/* ── INFO ──────────────────────────────────── */}
              <div className="flex-1 min-w-0">
                <p className="text-ink-primary text-sm font-semibold truncate">
                  {cliente.nome}
                  <span className="ml-2 text-ink-muted font-normal text-xs">
                    ({cliente.nicho})
                  </span>
                </p>
                <p className="text-ink-secondary text-sm mt-0.5 line-clamp-1">
                  {descricao}
                </p>
              </div>

              {/* ── AÇÕES SEMPRE VISÍVEIS ───────────────── */}
              <div className="shrink-0 flex items-center gap-2">
                {getBotaoPrincipal()}

                <button
                  onClick={() => onCongelar(cliente.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-ink-muted hover:bg-surface-hover hover:text-status-orange transition-colors"
                  title="Congelar cliente"
                >
                  <PauseCircle className="w-4 h-4" strokeWidth={2} />
                </button>

                <button
                  onClick={handleFeito}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-ink-muted hover:bg-surface-hover hover:text-status-green transition-colors"
                  title="Marcar como feito"
                >
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
