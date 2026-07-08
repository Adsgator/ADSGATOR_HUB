'use client'

import { useRouter } from 'next/navigation'
import { ExternalLink, PlugZap, Hourglass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { diasAtrasoCliente } from '@/lib/cobranca'
import type { NewsCardData } from '@/lib/types/news'

interface NewsClienteCardProps {
  cliente: NewsCardData
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
    setup_trafego: 'bg-status-blue shadow-[0_0_6px_var(--color-status-blue)]',
    recebido: 'bg-status-purple shadow-[0_0_6px_var(--color-status-purple)]',
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

/** Barra de saldo — null = pós-pago sem valor informado (não é R$ 0). */
function SaldoBar({ saldo }: { saldo: number | null | undefined }) {
  if (saldo == null) {
    return (
      <div className="flex items-center gap-[0.5rem]">
        <span className="text-[0.625rem] text-ink-muted whitespace-nowrap">Saldo Google</span>
        <span className="text-[0.625rem] text-ink-muted ml-auto">não informado (pós-pago?)</span>
      </div>
    )
  }
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

  const diasAtraso = diasAtrasoCliente(cliente)
  const siteUrl = cliente.website || (cliente.dominio ? `https://${cliente.dominio}` : undefined)
  const ehTrafego = cliente.tipo === 'trafego'

  const metrics = ehTrafego
    ? [
        { label: 'Gasto', value: formatBRL(cliente.investimento ?? 0) },
        { label: 'Conv.', value: formatNumber(cliente.conversoes ?? 0) },
        { label: 'CPA', value: formatBRL(cliente.cpa ?? 0) },
        { label: 'Imp.', value: formatNumber(cliente.impressoes ?? 0) },
        { label: 'Cli.', value: formatNumber(cliente.cliques ?? 0) },
        { label: 'CTR', value: `${((cliente.ctr ?? 0) * 100).toFixed(1)}%` },
      ]
    : [
        { label: 'Sessões', value: formatNumber(cliente.sessoes ?? 0) },
        { label: 'Usuários', value: formatNumber(cliente.usuarios ?? 0) },
        { label: 'Conv.', value: formatNumber(cliente.conversoes ?? 0) },
      ]

  return (
    <div
      onClick={() => router.push(`/clientes/${cliente.cliente_id}`)}
      className="flex-shrink-0 w-[17rem] bg-surface-card border border-surface-border rounded-xl p-[0.875rem] cursor-pointer
        hover:border-ads-500/40 hover:shadow-[0_0_0_1px_var(--color-ads-500,#FFB100)20]
        transition-all duration-200 hover:-translate-y-[0.125rem] active:translate-y-0
        scroll-snap-align-start"
    >
      {/* Header: status + nome + badge do serviço */}
      <div className="flex items-start justify-between gap-[0.5rem] mb-[0.375rem]">
        <div className="flex items-center gap-[0.375rem] min-w-0">
          <StatusDot status={cliente.status} />
          <span className="text-sm font-semibold text-ink-primary truncate">{cliente.nome}</span>
        </div>
        <div className="flex items-center gap-[0.25rem] flex-shrink-0" onClick={e => e.stopPropagation()}>
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

      {/* Badge do serviço + nicho */}
      <div className="flex items-center gap-[0.375rem] mb-[0.625rem]">
        <span className={cn(
          'px-[0.5rem] py-[0.0625rem] rounded-full text-[0.5625rem] font-bold uppercase tracking-wide',
          ehTrafego ? 'bg-ads-500/10 text-ads-500' : 'bg-status-blue/10 text-status-blue'
        )}>
          {ehTrafego ? 'Tráfego' : 'Site'}
        </span>
        {cliente.nicho && (
          <span className="text-[0.625rem] text-ink-muted truncate">{cliente.nicho}</span>
        )}
      </div>

      {!cliente.conectado ? (
        /* Não conectado — CTA em vez de zeros enganosos */
        <div className="flex flex-col items-center justify-center py-[1rem] gap-[0.375rem] text-center">
          <PlugZap className="w-[1.25rem] h-[1.25rem] text-ink-muted" strokeWidth={1.5} />
          <p className="text-[0.6875rem] text-ink-muted leading-snug">
            Integrações Google não configuradas
          </p>
          <span className="text-[0.6875rem] text-ads-500 font-medium">Conectar →</span>
        </div>
      ) : !cliente.tem_dados ? (
        /* Conectado, aguardando o primeiro sync */
        <div className="flex flex-col items-center justify-center py-[1rem] gap-[0.375rem] text-center">
          <Hourglass className="w-[1.25rem] h-[1.25rem] text-ink-muted" strokeWidth={1.5} />
          <p className="text-[0.6875rem] text-ink-muted leading-snug">
            Conectado — aguardando a 1ª sincronização
          </p>
        </div>
      ) : (
        <>
          {/* Métricas do serviço */}
          <div className="grid grid-cols-3 gap-[0.25rem] mb-[0.5rem]">
            {metrics.map(m => (
              <div key={m.label} className="flex flex-col">
                <span className="text-[0.55rem] text-ink-muted uppercase tracking-wide leading-none mb-[0.125rem]">{m.label}</span>
                <span className="text-xs font-semibold text-ink-primary">{m.value}</span>
              </div>
            ))}
          </div>

          {/* Linha extra por serviço + atraso */}
          <div className="flex gap-[0.75rem] mb-[0.625rem]">
            {ehTrafego ? (
              <div className="flex flex-col">
                <span className="text-[0.55rem] text-ink-muted uppercase tracking-wide leading-none mb-[0.125rem]">CPC Médio</span>
                <span className="text-xs font-semibold text-ink-primary">{formatBRL(cliente.cpc_medio ?? 0)}</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-[0.55rem] text-ink-muted uppercase tracking-wide leading-none mb-[0.125rem]">Taxa Conv.</span>
                <span className="text-xs font-semibold text-ink-primary">{((cliente.taxa_conversao ?? 0) * 100).toFixed(1)}%</span>
              </div>
            )}
            {diasAtraso > 0 && (
              <div className="flex flex-col ml-auto">
                <span className="text-[0.55rem] text-status-red uppercase tracking-wide leading-none mb-[0.125rem]">Atraso</span>
                <span className="text-xs font-semibold text-status-red">{diasAtraso}d</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Rodapé: saldo só no card de tráfego (é verba de mídia, não de site) */}
      {ehTrafego && cliente.conectado && (
        <div className="pt-[0.5rem] border-t border-surface-border">
          <SaldoBar saldo={cliente.saldo_google} />
        </div>
      )}
    </div>
  )
}
