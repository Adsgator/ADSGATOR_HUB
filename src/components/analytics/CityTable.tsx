'use client'

import { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GeografiaDados {
  pais: string
  estado: string
  cidade: string
  impressoes: number
  cliques: number
  conversoes: number
  custo: number
}

interface CityTableProps {
  data: GeografiaDados[]
  loading?: boolean
}

type SortKey = 'cidade' | 'impressoes' | 'cliques' | 'conversoes' | 'custo' | 'cpc' | 'ctr'

function fmtBRL(v: number) {
  return `R$${v.toFixed(2)}`
}

export function CityTable({ data, loading }: CityTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('cliques')
  const [sortAsc, setSortAsc] = useState(false)
  const [showAll, setShowAll] = useState(false)

  if (loading) return <div className="h-[12rem] rounded-xl bg-surface-hover animate-pulse" />

  const enriched = data.map(d => ({
    ...d,
    cpc: d.cliques > 0 ? d.custo / d.cliques : 0,
    ctr: d.impressoes > 0 ? (d.cliques / d.impressoes) * 100 : 0,
  }))

  const sorted = [...enriched].sort((a, b) => {
    const va = a[sortKey] as number | string
    const vb = b[sortKey] as number | string
    if (typeof va === 'string') return sortAsc ? va.localeCompare(vb as string) : (vb as string).localeCompare(va)
    return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number)
  })

  const visible = showAll ? sorted : sorted.slice(0, 15)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a)
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
              <Th k="cidade" label="Cidade" />
              <Th k="impressoes" label="Imp." />
              <Th k="cliques" label="Cli." />
              <Th k="ctr" label="CTR" />
              <Th k="conversoes" label="Conv." />
              <Th k="custo" label="Custo" />
              <Th k="cpc" label="CPC" />
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr key={i} className="border-b border-surface-border/40 last:border-0 hover:bg-surface-hover/40 transition-colors">
                <td className="px-[0.5rem] py-[0.375rem] text-ink-primary font-medium">
                  {row.cidade || row.estado || row.pais || '—'}
                </td>
                <td className="px-[0.5rem] py-[0.375rem] text-ink-secondary">{row.impressoes.toLocaleString('pt-BR')}</td>
                <td className="px-[0.5rem] py-[0.375rem] text-ink-secondary">{row.cliques.toLocaleString('pt-BR')}</td>
                <td className="px-[0.5rem] py-[0.375rem] text-ink-secondary">{row.ctr.toFixed(1)}%</td>
                <td className="px-[0.5rem] py-[0.375rem] text-ink-secondary">{row.conversoes.toFixed(1)}</td>
                <td className="px-[0.5rem] py-[0.375rem] text-ink-secondary">{fmtBRL(row.custo)}</td>
                <td className="px-[0.5rem] py-[0.375rem] text-ink-secondary">{fmtBRL(row.cpc)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > 15 && (
        <button
          onClick={() => setShowAll(s => !s)}
          className="mt-[0.5rem] text-[0.75rem] text-ads-500 hover:underline"
        >
          {showAll ? 'Ver menos' : `Ver todas (${sorted.length})`}
        </button>
      )}
    </div>
  )
}
