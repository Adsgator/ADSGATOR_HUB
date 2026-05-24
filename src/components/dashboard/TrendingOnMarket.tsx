'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

// Mock data — "trending" clientes por MRR
const MOCK_TRENDING = [
  { nome: 'Tech Startup A', mrr: 15000, change: 12.5, status: 'up' },
  { nome: 'E-commerce B', mrr: 12300, change: 8.3, status: 'up' },
  { nome: 'SaaS C', mrr: 9850, change: -2.1, status: 'down' },
  { nome: 'Agência D', mrr: 8500, change: 5.7, status: 'up' },
  { nome: 'Retail E', mrr: 7200, change: -3.4, status: 'down' },
]

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export function TrendingOnMarket() {
  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl card-shadow overflow-hidden">
      {/* Header */}
      <div className="p-[1.25rem] border-b border-surface-border/40">
        <h3 className="text-ink-primary font-bold text-base">Trending on Market</h3>
        <p className="text-ink-muted text-xs mt-[0.25rem]">Top clientes por crescimento</p>
      </div>

      {/* Lista */}
      <div className="divide-y divide-surface-border/40">
        {MOCK_TRENDING.map((item, idx) => {
          const isPositive = item.status === 'up'
          const color = isPositive ? 'text-status-green' : 'text-status-red'
          const bgColor = isPositive ? 'bg-status-green/10' : 'bg-status-red/10'

          return (
            <div key={idx} className="p-[1rem] flex items-center justify-between hover:bg-surface-hover/50 transition-colors cursor-pointer group">
              <div className="flex-1 min-w-0">
                <p className="text-ink-primary text-sm font-semibold truncate group-hover:text-ads-500 transition-colors">{item.nome}</p>
                <p className="text-ink-muted text-xs mt-[0.125rem]">MRR: {fmt(item.mrr)}</p>
              </div>

              {/* % Change */}
              <div className={`flex items-center gap-[0.375rem] px-[0.625rem] py-[0.375rem] rounded-lg ${bgColor} shrink-0 ml-[1rem]`}>
                {isPositive ? (
                  <TrendingUp className={`w-[0.875rem] h-[0.875rem] ${color}`} strokeWidth={2} />
                ) : (
                  <TrendingDown className={`w-[0.875rem] h-[0.875rem] ${color}`} strokeWidth={2} />
                )}
                <span className={`text-xs font-bold ${color}`}>{isPositive ? '+' : ''}{item.change}%</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-[1.25rem] py-[0.75rem] border-t border-surface-border/40 bg-surface-hover/30">
        <button className="text-ads-500 text-xs font-semibold hover:text-ads-600 transition-colors">
          Ver todos os clientes →
        </button>
      </div>
    </div>
  )
}
