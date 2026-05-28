'use client'

import { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginaPerformance {
  pagina: string
  visualizacoes: number
  usuarios_unicos: number
  novas_sessoes: number
  sessoes: number
  taxa_engajamento: number
  taxa_rejeicao: number
  tempo_medio_segundos: number
}

interface GA4PagesTableProps {
  data: PaginaPerformance[]
  loading?: boolean
}

type SortKey = keyof Omit<PaginaPerformance, 'pagina'>

function fmtTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.round(s % 60)
  return m > 0 ? `${m}m${sec}s` : `${sec}s`
}

export function GA4PagesTable({ data, loading }: GA4PagesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('visualizacoes')
  const [sortAsc, setSortAsc] = useState(false)
  const [showAll, setShowAll] = useState(false)

  if (loading) return <div className="h-[12rem] rounded-xl bg-surface-hover animate-pulse" />

  const sorted = [...data].sort((a, b) => {
    const va = a[sortKey] as number
    const vb = b[sortKey] as number
    return sortAsc ? va - vb : vb - va
  })

  const visible = showAll ? sorted : sorted.slice(0, 15)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(s => !s)
    else { setSortKey(key); setSortAsc(false) }
  }

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      onClick={() => toggleSort(k)}
      className="px-[0.5rem] py-[0.375rem] text-left cursor-pointer select-none hover:text-ink-primary transition-colors whitespace-nowrap"
    >
      <div className="flex items-center gap-[0.25rem]">
        {label}
        <ArrowUpDown className={cn('w-[0.625rem] h-[0.625rem]', sortKey === k ? 'text-ads-500' : 'opacity-30')} />
      </div>
    </th>
  )

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-[0.75rem]">
          <thead>
            <tr className="text-[0.625rem] text-ink-muted uppercase tracking-wide border-b border-surface-border">
              <th className="px-[0.5rem] py-[0.375rem] text-left">Página</th>
              <Th k="visualizacoes" label="Views" />
              <Th k="usuarios_unicos" label="Usuários" />
              <Th k="sessoes" label="Sessões" />
              <Th k="taxa_engajamento" label="Eng.%" />
              <Th k="taxa_rejeicao" label="Rej.%" />
              <Th k="tempo_medio_segundos" label="Duração" />
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr key={i} className="border-b border-surface-border/40 last:border-0 hover:bg-surface-hover/40 transition-colors">
                <td className="px-[0.5rem] py-[0.375rem] text-ink-primary font-medium max-w-[12rem] truncate" title={row.pagina}>
                  {row.pagina}
                </td>
                <td className="px-[0.5rem] py-[0.375rem] text-ink-secondary">{row.visualizacoes.toLocaleString('pt-BR')}</td>
                <td className="px-[0.5rem] py-[0.375rem] text-ink-secondary">{row.usuarios_unicos.toLocaleString('pt-BR')}</td>
                <td className="px-[0.5rem] py-[0.375rem] text-ink-secondary">{row.sessoes.toLocaleString('pt-BR')}</td>
                <td className="px-[0.5rem] py-[0.375rem] text-status-green">{row.taxa_engajamento.toFixed(1)}%</td>
                <td className="px-[0.5rem] py-[0.375rem] text-ink-secondary">{row.taxa_rejeicao.toFixed(1)}%</td>
                <td className="px-[0.5rem] py-[0.375rem] text-ink-secondary">{fmtTime(row.tempo_medio_segundos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > 15 && (
        <button onClick={() => setShowAll(s => !s)} className="mt-[0.5rem] text-[0.75rem] text-ads-500 hover:underline">
          {showAll ? 'Ver menos' : `Ver todas (${sorted.length})`}
        </button>
      )}
    </div>
  )
}
