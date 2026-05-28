'use client'

import { Users, Activity, Eye, Clock, ArrowUpRight, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportGA4SectionProps {
  dados: {
    usuarios: number
    sessoes: number
    visualizacoes_pagina: number
    duracao_media_sessao?: number
    taxa_rejeicao?: number
    novos_usuarios?: number
    paginas?: Array<{
      pagina: string
      visualizacoes: number
      sessoes?: number
      taxa_rejeicao?: number
    }>
    fontes?: Array<{
      fonte: string
      sessoes: number
      usuarios: number
    }>
  } | null
  loading?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}m ${s}s`
}

function fmtPct(v: number): string {
  return `${v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton-shimmer rounded-[0.375rem] bg-surface-hover', className)} />
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ReportGA4Section({ dados, loading }: ReportGA4SectionProps) {
  if (loading) {
    return (
      <div className="space-y-[1.25rem]">
        <Skeleton className="h-[1.25rem] w-[12rem]" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-[0.875rem]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[5rem]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.25rem]">
          <Skeleton className="h-[14rem]" />
          <Skeleton className="h-[14rem]" />
        </div>
      </div>
    )
  }

  if (!dados) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] text-center">
        <Globe className="w-[2rem] h-[2rem] text-ink-muted mx-auto mb-[0.75rem]" strokeWidth={1} />
        <p className="text-ink-muted text-[0.875rem]">Dados do Google Analytics não disponíveis para este período.</p>
      </div>
    )
  }

  const kpis = [
    { label: 'Usuários',       value: dados.usuarios.toLocaleString('pt-BR'),                               icon: Users,       color: 'text-status-blue'   },
    { label: 'Sessões',        value: dados.sessoes.toLocaleString('pt-BR'),                                icon: Activity,   color: 'text-status-purple' },
    { label: 'Visualizações',  value: dados.visualizacoes_pagina.toLocaleString('pt-BR'),                   icon: Eye,        color: 'text-ads-500'       },
    { label: 'Taxa Rejeição',  value: dados.taxa_rejeicao != null ? fmtPct(dados.taxa_rejeicao) : '—',     icon: ArrowUpRight, color: 'text-status-red'   },
    { label: 'Duração Média',  value: dados.duracao_media_sessao != null ? fmtDuration(dados.duracao_media_sessao) : '—', icon: Clock, color: 'text-status-green' },
  ]

  return (
    <div className="space-y-[1.5rem]">
      {/* Header */}
      <div className="flex items-center gap-[0.5rem]">
        <Globe className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.5} />
        <h2 className="text-ads-500 font-semibold text-[1rem]">Google Analytics 4</h2>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[0.875rem]">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-surface-card border border-surface-border rounded-xl px-[1rem] py-[0.875rem] card-shadow"
          >
            <div className="flex items-center justify-between mb-[0.375rem]">
              <p className="text-ink-muted text-[0.625rem] uppercase tracking-wider font-semibold leading-tight">{label}</p>
              <Icon className={cn('w-[0.875rem] h-[0.875rem] shrink-0', color)} strokeWidth={1.5} />
            </div>
            <p className={cn('text-[1.125rem] font-bold leading-none', color)}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.25rem]">
        {/* Top pages */}
        {dados.paginas && dados.paginas.length > 0 && (
          <div className="bg-surface-card border border-surface-border rounded-xl card-shadow overflow-hidden">
            <div className="px-[1.25rem] py-[0.875rem] border-b border-surface-border">
              <p className="text-ink-secondary text-[0.8125rem] font-semibold">Páginas Mais Visitadas</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[0.8125rem]">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['Página', 'Visualizações', 'Sessões', 'Rejeição'].map((h) => (
                      <th key={h} className="text-left px-[1rem] py-[0.625rem] text-ink-muted font-semibold text-[0.6875rem] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dados.paginas.slice(0, 10).map((pg, i) => (
                    <tr key={i} className="border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors">
                      <td className="px-[1rem] py-[0.625rem] text-ink-primary font-medium max-w-[10rem] truncate">{pg.pagina}</td>
                      <td className="px-[1rem] py-[0.625rem] text-ink-secondary">{pg.visualizacoes.toLocaleString('pt-BR')}</td>
                      <td className="px-[1rem] py-[0.625rem] text-ink-secondary">{pg.sessoes?.toLocaleString('pt-BR') ?? '—'}</td>
                      <td className="px-[1rem] py-[0.625rem] text-ink-secondary">{pg.taxa_rejeicao != null ? fmtPct(pg.taxa_rejeicao) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Traffic sources */}
        {dados.fontes && dados.fontes.length > 0 && (
          <div className="bg-surface-card border border-surface-border rounded-xl card-shadow overflow-hidden">
            <div className="px-[1.25rem] py-[0.875rem] border-b border-surface-border">
              <p className="text-ink-secondary text-[0.8125rem] font-semibold">Fontes de Tráfego</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[0.8125rem]">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['Fonte', 'Sessões', 'Usuários'].map((h) => (
                      <th key={h} className="text-left px-[1rem] py-[0.625rem] text-ink-muted font-semibold text-[0.6875rem] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dados.fontes.map((f, i) => (
                    <tr key={i} className="border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors">
                      <td className="px-[1rem] py-[0.625rem] text-ink-primary font-medium">{f.fonte}</td>
                      <td className="px-[1rem] py-[0.625rem] text-ink-secondary">{f.sessoes.toLocaleString('pt-BR')}</td>
                      <td className="px-[1rem] py-[0.625rem] text-ink-secondary">{f.usuarios.toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
