'use client'

import { Search, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchTerm {
  termo: string
  impressoes: number
  cliques: number
  ctr: number
  conversoes: number
  custo: number
}

interface SearchTermsTableProps {
  data: SearchTerm[]
  loading?: boolean
  maxRows?: number
}

export function SearchTermsTable({ data, loading, maxRows = 10 }: SearchTermsTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-surface-hover animate-pulse" />
        ))}
      </div>
    )
  }

  const sorted = [...data]
    .sort((a, b) => b.cliques - a.cliques)
    .slice(0, maxRows)

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-ink-muted">
        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" strokeWidth={1.5} />
        <p className="text-sm">Sem dados de termos de pesquisa</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border text-ink-muted">
            <th className="text-left py-2 px-2 font-medium">Termo de Pesquisa</th>
            <th className="text-right py-2 px-2 font-medium">Cliques</th>
            <th className="text-right py-2 px-2 font-medium">CTR</th>
            <th className="text-right py-2 px-2 font-medium">Conv.</th>
            <th className="text-right py-2 px-2 font-medium">Custo</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((term, i) => (
            <tr key={i} className="border-b border-surface-border/50 hover:bg-surface-hover/50 transition-colors">
              <td className="py-2 px-2">
                <span className="font-medium text-ink-primary truncate max-w-[200px] block" title={term.termo}>
                  {term.termo}
                </span>
              </td>
              <td className="text-right py-2 px-2">{term.cliques.toLocaleString('pt-BR')}</td>
              <td className="text-right py-2 px-2">
                <span className={cn(
                  'inline-flex items-center gap-0.5 text-xs',
                  term.ctr > 2 ? 'text-status-green' : term.ctr > 1 ? 'text-ads-500' : 'text-ink-muted'
                )}>
                  {term.ctr > 2 ? <ArrowUpRight className="w-3 h-3" /> : term.ctr < 1 ? <ArrowDownRight className="w-3 h-3" /> : null}
                  {term.ctr.toFixed(2)}%
                </span>
              </td>
              <td className="text-right py-2 px-2">{term.conversoes}</td>
              <td className="text-right py-2 px-2">R$ {term.custo.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
