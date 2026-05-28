'use client'

import { Trophy } from 'lucide-react'

interface LeilaoDados {
  dominio: string
  parcela_impressao: number
  posicao_superior: number
  primeira_posicao: number
  sobreposicao: number
}

interface AuctionInsightsProps {
  data: LeilaoDados[]
  loading?: boolean
}

function Bar({ value, color = 'bg-ads-500' }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-[0.375rem]">
      <div className="flex-1 h-[0.25rem] bg-surface-hover rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-[0.6875rem] text-ink-secondary w-[2.5rem] text-right">{value.toFixed(1)}%</span>
    </div>
  )
}

export function AuctionInsights({ data, loading }: AuctionInsightsProps) {
  if (loading) return <div className="h-[10rem] rounded-xl bg-surface-hover animate-pulse" />

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[8rem] text-ink-muted gap-[0.375rem]">
        <Trophy className="w-[1.5rem] h-[1.5rem]" strokeWidth={1} />
        <p className="text-[0.8125rem]">Sem dados de leilão</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[0.75rem] min-w-[28rem]">
        <thead>
          <tr className="text-[0.625rem] text-ink-muted uppercase tracking-wide border-b border-surface-border">
            <th className="px-[0.5rem] py-[0.375rem] text-left">Domínio</th>
            <th className="px-[0.5rem] py-[0.375rem] text-left w-[8rem]">Parcela Imp.</th>
            <th className="px-[0.5rem] py-[0.375rem] text-left w-[8rem]">1ª Posição</th>
            <th className="px-[0.5rem] py-[0.375rem] text-left w-[8rem]">Parte Sup.</th>
            <th className="px-[0.5rem] py-[0.375rem] text-right">Sobreposição</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-surface-border/40 last:border-0 hover:bg-surface-hover/40 transition-colors">
              <td className="px-[0.5rem] py-[0.5rem] text-ink-primary font-medium truncate max-w-[10rem]">
                {row.dominio || '—'}
              </td>
              <td className="px-[0.5rem] py-[0.5rem]"><Bar value={row.parcela_impressao} /></td>
              <td className="px-[0.5rem] py-[0.5rem]"><Bar value={row.primeira_posicao} color="bg-status-green" /></td>
              <td className="px-[0.5rem] py-[0.5rem]"><Bar value={row.posicao_superior} color="bg-status-blue" /></td>
              <td className="px-[0.5rem] py-[0.5rem] text-right text-ink-secondary">{row.sobreposicao.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
