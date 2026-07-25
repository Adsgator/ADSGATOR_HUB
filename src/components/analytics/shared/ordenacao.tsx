'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Ordenação de tabela por coluna (Ads + Site) ─────────────────────────────
// Replica a setinha "Visualizações ▾" do Looker: clicar no cabeçalho ordena.
// Hook + <ThOrdenavel> compartilhados; cada tabela passa os acessadores por
// coluna (defina-os FORA do render — objeto estável — pra o memo não recalcular
// à toa). Sem chave ativa = ordem original (que já vem ranqueada da fonte).

export type Ordem = 'asc' | 'desc'
export interface EstadoOrdem { chave: string | null; ordem: Ordem }
export type Acessadores<T> = Record<string, (l: T) => number | string>

export function useOrdenacao<T>(
  linhas: T[],
  acessadores: Acessadores<T>,
  inicial?: { chave: string; ordem?: Ordem },
) {
  const [estado, setEstado] = useState<EstadoOrdem>({
    chave: inicial?.chave ?? null,
    ordem: inicial?.ordem ?? 'desc',
  })

  const ordenadas = useMemo(() => {
    const acc = estado.chave ? acessadores[estado.chave] : undefined
    if (!acc) return linhas
    const dir = estado.ordem === 'asc' ? 1 : -1
    return [...linhas].sort((a, b) => {
      const va = acc(a), vb = acc(b)
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
      return String(va).localeCompare(String(vb), 'pt-BR') * dir
    })
  }, [linhas, acessadores, estado])

  // 1º clique = desc (maior→menor, o mais útil); 2º = asc; alterna daí.
  const alternar = (chave: string) => setEstado((e) =>
    e.chave === chave ? { chave, ordem: e.ordem === 'desc' ? 'asc' : 'desc' } : { chave, ordem: 'desc' })

  return { ordenadas, estado, alternar }
}

interface ThOrdenavelProps {
  label:     string
  chave:     string
  estado:    EstadoOrdem
  alternar:  (chave: string) => void
  className?: string
}

/** Cabeçalho clicável com indicador de ordenação (▲/▼; ⇅ quando inativo). */
export function ThOrdenavel({ label, chave, estado, alternar, className }: ThOrdenavelProps) {
  const ativo = estado.chave === chave
  return (
    <th
      onClick={() => alternar(chave)}
      title={`Ordenar por ${label}`}
      aria-sort={ativo ? (estado.ordem === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cn(
        'group text-left pb-[0.5rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0 cursor-pointer select-none hover:text-ink-secondary transition-colors',
        className,
      )}
    >
      <span className="inline-flex items-center gap-[0.1875rem]">
        {label}
        {ativo
          ? (estado.ordem === 'asc'
              ? <ChevronUp className="w-[0.75rem] h-[0.75rem] text-ads-500" strokeWidth={2.5} />
              : <ChevronDown className="w-[0.75rem] h-[0.75rem] text-ads-500" strokeWidth={2.5} />)
          : <ChevronsUpDown className="w-[0.75rem] h-[0.75rem] opacity-0 group-hover:opacity-40 transition-opacity" strokeWidth={2} />}
      </span>
    </th>
  )
}
