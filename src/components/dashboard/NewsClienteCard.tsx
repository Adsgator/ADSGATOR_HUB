'use client'

import { useRouter } from 'next/navigation'
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NewsClienteData } from '@/lib/types/news'

interface NewsClienteCardProps {
  cliente: NewsClienteData
}

function formatBRL(value: number): string {
  if (value >= 1000) return `R$${(value / 1000).toFixed(1)}k`
  return `R$${value.toFixed(0)}`
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(Math.round(value))
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ativo: 'bg-status-green shadow-[0_0_6px_var(--color-status-green)]',
    onboarding: 'bg-status-orange shadow-[0_0_6px_var(--color-status-orange)]',
    inadimplente: 'bg-status-red shadow-[0_0_6px_var(--color-status-red)]',
    inativo: 'bg-ink-muted',
  }
  return (
    <span
      className={cn(
        'inline-block w-[0.5rem] h-[0.5rem] rounded-full flex-shrink-0',
        colors[status] ?? 'bg-ink-muted'
      )}
    />
  )
}

function SaldoBar({ saldo }: { saldo: number }) {
  const max = 2000
  const pct = Math.min((saldo / max) * 100, 100)
  const color =
    saldo > 500 ? 'bg-status-green' :
    saldo > 100 ? 'bg-status-orange' :
    'bg-status-red'

  return (
    <div className="flex items-center gap-[0.5rem]">
      <span className="text-[0.625rem] text-ink-muted whitespace-nowrap">Saldo Google</span>
      <div className="flex-1 h-[0.25rem] bg-surface-hover rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn(
        'text-[0.625rem] font-medium whitespace-nowrap',
        saldo > 500 ? 'text-status-green' : saldo > 100 ? 'text-status-orange' : 'text-status-red'
      )}>
        {formatBRL(saldo)}
      </span>
    </div>
  )
}

export function NewsClienteCard({ cliente }: NewsClienteCardProps) {
  const router = useRouter()

  const googleAdsUrl = cliente.dominio
    ? `https://ads.google.com/`
    : undefined
  const siteUrl = cliente.website || (cliente.dominio ? `https://${cliente.dominio}` : undefined)

  const metrics = [
    { label: 'Gasto', value: formatBRL(cliente.investimento) },
    { label: 'Conv.', value: formatNumber(cliente.conversoes) },
    { label: 'CPA', value: formatBRL(cliente.cpa) },
    { label: 'Imp.', value: formatNumber(cliente.impressoes) },
    { label: 'Cli.', value: formatNumber(cliente.cliques) },
    { label: 'CTR', value: `${(cliente.ctr * 100).toFixed(1)}%` },
  ]

  return (
    <div
      onClick={() => router.push(`/clientes/${cliente.cliente_id}`)}
      className="flex-shrink-0 w-[17rem] bg-surface-card border border-surface-border rounded-xl p-[0.875rem] cursor-pointer
        hover:border-ads-500/40 hover:shadow-[0_0_0_1px_var(--color-ads-500,#FFB100)20]
        transition-all duration-200 hover:-translate-y-[0.125rem] active:translate-y-0
        scroll-snap-align-start"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-[0.5rem] mb-[0.625rem]">
        <div className="flex items-center gap-[0.375rem] min-w-0">
          <StatusDot status={cliente.status} />
          <span className="text-sm font-semibold text-ink-primary truncate">{cliente.nome}</span>
        </div>
        <div className="flex items-center gap-[0.25rem] flex-shrink-0" onClick={e => e.stopPropagation()}>
          {googleAdsUrl && (
            <a
              href={googleAdsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Google Ads"
              className="p-[0.25rem] rounded-md text-ink-muted hover:text-ads-500 hover:bg-ads-500/10 transition-colors"
            >
              <ExternalLink className="w-[0.75rem] h-[0.75rem]" />
            </a>
          )}
          {siteUrl && (
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Site do cliente"
              className="p-[0.25rem] rounded-md text-ink-muted hover:text-status-blue hover:bg-status-blue/10 transition-colors"
            >
              <ExternalLink className="w-[0.75rem] h-[0.75rem]" />
            </a>
          )}
        </div>
      </div>

      {cliente.nicho && (
        <p className="text-[0.625rem] text-ink-muted mb-[0.625rem] -mt-[0.25rem]">{cliente.nicho}</p>
      )}

      {/* Metrics grid 3x2 */}
      <div className="grid grid-cols-3 gap-[0.25rem] mb-[0.5rem]">
        {metrics.map(m => (
          <div key={m.label} className="flex flex-col">
            <span className="text-[0.55rem] text-ink-muted uppercase tracking-wide leading-none mb-[0.125rem]">{m.label}</span>
            <span className="text-xs font-semibold text-ink-primary">{m.value}</span>
          </div>
        ))}
      </div>

      {/* Extra row: CPC + Sessões */}
      <div className="flex gap-[0.75rem] mb-[0.625rem]">
        <div className="flex flex-col">
          <span className="text-[0.55rem] text-ink-muted uppercase tracking-wide leading-none mb-[0.125rem]">CPC Médio</span>
          <span className="text-xs font-semibold text-ink-primary">{formatBRL(cliente.cpc_medio)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[0.55rem] text-ink-muted uppercase tracking-wide leading-none mb-[0.125rem]">Sessões</span>
          <span className="text-xs font-semibold text-ink-primary">{formatNumber(cliente.sessoes)}</span>
        </div>
        {cliente.dias_atraso > 0 && (
          <div className="flex flex-col ml-auto">
            <span className="text-[0.55rem] text-status-red uppercase tracking-wide leading-none mb-[0.125rem]">Atraso</span>
            <span className="text-xs font-semibold text-status-red">{cliente.dias_atraso}d</span>
          </div>
        )}
      </div>

      {/* Saldo bar */}
      <div className="pt-[0.5rem] border-t border-surface-border">
        <SaldoBar saldo={cliente.saldo_google} />
      </div>
    </div>
  )
}
