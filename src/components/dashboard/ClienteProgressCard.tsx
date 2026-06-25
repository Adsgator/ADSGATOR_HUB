'use client'

import {
  ArrowRight,
  PauseCircle,
  MessageCircle,
  Clock,
  CheckSquare,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { calcularHealthScore, type HealthRegras } from '@/lib/health-score'
import { calcularCompletude } from '@/lib/cliente-completude'
import { toast } from 'sonner'
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
  cliente:    Cliente & { mrr?: number; dias_atraso?: number; updated_at?: string }
  estagio:    Estagio | null
  onCongelar: (id: string) => void
  isRetido?:  boolean
  healthRegras?: HealthRegras
}

function diasDesde(data?: string): string {
  if (!data) return '—'
  const diff = Math.floor((Date.now() - new Date(data).getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'ontem'
  return `há ${diff} dias`
}

export function ClienteProgressCard({
  cliente,
  estagio,
  onCongelar,
  isRetido = false,
  healthRegras,
}: ClienteProgressCardProps) {
  const status = STATUS_CONFIG[cliente.status] ?? STATUS_CONFIG['ativo']
  const emoji  = NICHO_EMOJI[cliente.nicho?.toLowerCase() ?? ''] ?? '🏢'

  const iniciais = cliente.nome
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  const mrr = cliente.mrr ?? 0
  const diasAtraso = cliente.dias_atraso ?? 0
  const ultimaInteracao = diasDesde(cliente.updated_at)
  const health = calcularHealthScore(cliente, estagio, healthRegras)
  const completude = calcularCompletude(cliente)

  const handleWhatsApp = () => {
    if (!cliente.whatsapp) {
      toast.error('Cliente sem WhatsApp cadastrado')
      return
    }
    const texto = `Olá ${cliente.nome.split(' ')[0]}, tudo bem? Aqui é da Adsgator. `
    window.open(`https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank')
  }

  const handleAdiar = () => {
    toast.success(`Ação adiada para ${cliente.nome.split(' ')[0]}`)
  }

  return (
    <article
      className={cn(
        'relative flex flex-col',
        'bg-surface-card rounded-2xl dark:border dark:border-surface-border card-shadow',
        'p-[1.25rem]',
        'hover:shadow-lg hover:shadow-black/15',
        'transition-all duration-200',
        isRetido && 'opacity-70 hover:opacity-100',
      )}
    >
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-[0.75rem]">
        <div className="flex items-center gap-[0.625rem] min-w-0">
          <div className="w-[2.25rem] h-[2.25rem] rounded-full bg-ads-500/15 border border-ads-500/20 flex items-center justify-center shrink-0">
            <span className="text-ads-500 text-[0.8125rem] font-bold">{iniciais}</span>
          </div>
          <div className="min-w-0">
            <p className="text-ink-primary text-[0.875rem] font-semibold leading-tight truncate">
              {cliente.nome}
            </p>
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full bg-ads-500/10 text-ads-500 text-xs font-medium">
              {emoji} {cliente.nicho}
            </span>
          </div>
        </div>

        {/* MRR badge */}
        {mrr > 0 && (
          <span className="text-status-green text-sm font-bold whitespace-nowrap ml-2">
            R$ {mrr.toLocaleString('pt-BR')}
          </span>
        )}
      </div>

      {/* ── SUB-HEADER: Status + Atraso ───────────────────── */}
      <div className="flex items-center gap-[0.5rem] mb-[0.75rem] flex-wrap">
        <span className={cn('inline-flex items-center gap-[0.375rem] text-xs font-medium px-2 py-0.5 rounded-full bg-surface-hover', status.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
          {status.label}
        </span>
        {diasAtraso > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-status-red/10 text-status-red text-xs font-medium">
            {diasAtraso}d atraso
          </span>
        )}
        {/* Health Score badge */}
        <span
          title={`Health Score: ${health.score}/100`}
          className={cn(
            'inline-flex items-center gap-[0.25rem] px-2 py-0.5 rounded-full text-xs font-bold',
            health.nivel === 'saudavel' ? 'bg-status-green/10' : health.nivel === 'atencao' ? 'bg-status-orange/10' : 'bg-status-red/10',
            health.color,
          )}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full', health.dot)} />
          {health.score}
        </span>
        {/* Completude — só aparece quando há pendências, para chamar atenção */}
        {!completude.completo && (
          <span
            title={`Cadastro ${completude.percent}% completo — ${completude.faltando.length} pendência(s)`}
            className="inline-flex items-center gap-[0.25rem] px-2 py-0.5 rounded-full bg-status-orange/10 text-status-orange text-xs font-bold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-status-orange" />
            {completude.percent}%
          </span>
        )}
      </div>

      {/* ── PRÓXIMA AÇÃO ──────────────────────────────────── */}
      <div className="flex-1 mb-[0.75rem]">
        {estagio ? (
          <div className="flex items-start gap-[0.375rem]">
            <ArrowRight className="w-4 h-4 text-ads-500 shrink-0 mt-[0.0625rem]" strokeWidth={2} />
            <p className="text-ink-secondary text-sm leading-snug">
              {estagio.acao_label ?? estagio.nome ?? 'Verificar próxima ação'}
            </p>
          </div>
        ) : (
          <p className="text-ink-muted text-sm italic">
            Sem ação definida
          </p>
        )}
        <p className="text-ink-muted text-xs mt-1">
          Última interação: {ultimaInteracao}
        </p>
      </div>

      {/* ── FOOTER — 4 BOTÕES SEMPRE VISÍVEIS ─────────────── */}
      <div className="flex items-center gap-[0.375rem] pt-[0.75rem] border-t border-surface-border">
        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-[0.375rem] h-[2rem] rounded-md bg-[#25D366]/10 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/20 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">WhatsApp</span>
        </button>

        {/* Ver cliente */}
        <a
          href={`/clientes/${cliente.id}`}
          className="flex-1 flex items-center justify-center gap-[0.375rem] h-[2rem] rounded-md bg-surface-hover text-ink-secondary text-xs font-medium hover:bg-surface-border transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Ver</span>
        </a>

        {/* Adiar ação */}
        <button
          onClick={handleAdiar}
          className="flex-1 flex items-center justify-center gap-[0.375rem] h-[2rem] rounded-md bg-surface-hover text-ink-secondary text-xs font-medium hover:bg-surface-border transition-colors"
        >
          <CheckSquare className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Adiar</span>
        </button>

        {/* Congelar/Reativar */}
        <button
          onClick={() => onCongelar(cliente.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-[0.375rem] h-[2rem] rounded-md text-xs font-medium transition-colors',
            isRetido
              ? 'bg-status-orange/10 text-status-orange hover:bg-status-orange/20'
              : 'bg-surface-hover text-ink-secondary hover:bg-surface-border'
          )}
          title={isRetido ? 'Reativar' : 'Congelar'}
        >
          {isRetido ? (
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
          ) : (
            <PauseCircle className="w-3.5 h-3.5" strokeWidth={2} />
          )}
          <span className="hidden sm:inline">{isRetido ? 'Reativar' : 'Congelar'}</span>
        </button>
      </div>
    </article>
  )
}
