'use client'

import { RefreshCw, AlertTriangle, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MetaDetalhe } from '@/lib/hooks/useAnalyticsDetalhes'

// Casca padrão das seções dos dashboards Analytics 2.0: título, skeleton,
// erro com "tentar de novo" e selo de cache desatualizado — cada seção vive
// e falha sozinha.

interface SecaoCardProps {
  titulo:     string
  carregando: boolean
  erro:       string | null
  meta?:      MetaDetalhe | null
  vazio?:     boolean
  aoTentarNovamente: () => void
  className?: string
  children:   React.ReactNode
}

export function SecaoCard({
  titulo, carregando, erro, meta, vazio, aoTentarNovamente, className, children,
}: SecaoCardProps) {
  return (
    <div className={cn('bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem]', className)}>
      <div className="flex items-center justify-between mb-[0.875rem]">
        <h4 className="text-[0.875rem] font-semibold text-ink-primary">{titulo}</h4>
        {meta?.cache === 'desatualizado' && (
          <span
            title={`Não foi possível atualizar agora — mostrando dado de ${new Date(meta.atualizadoEm).toLocaleString('pt-BR')}. ${meta.erro ?? ''}`}
            className="inline-flex items-center gap-[0.25rem] text-[0.6875rem] font-medium text-status-orange bg-status-orange/10 px-[0.5rem] py-[0.125rem] rounded-full"
          >
            <History className="w-[0.6875rem] h-[0.6875rem]" strokeWidth={2} />
            desatualizado
          </span>
        )}
      </div>

      {carregando ? (
        <div className="h-[10rem] rounded-xl skeleton-shimmer" />
      ) : erro ? (
        <div className="flex flex-col items-center justify-center h-[10rem] text-center gap-[0.625rem]">
          <AlertTriangle className="w-[1.25rem] h-[1.25rem] text-status-orange" strokeWidth={1.75} />
          <p className="text-[0.8125rem] text-ink-secondary max-w-[24rem]">{erro}</p>
          <button
            onClick={aoTentarNovamente}
            className="inline-flex items-center gap-[0.375rem] text-[0.75rem] font-medium text-ads-500 hover:underline"
          >
            <RefreshCw className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            Tentar de novo
          </button>
        </div>
      ) : vazio ? (
        <p className="text-ink-muted text-[0.8125rem] italic text-center py-[2.5rem]">
          Sem dados no período selecionado.
        </p>
      ) : (
        children
      )}
    </div>
  )
}
