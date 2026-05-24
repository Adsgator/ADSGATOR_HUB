'use client'

import { ArrowUpRight, ArrowDownLeft, Clock, User, DollarSign } from 'lucide-react'

// Mock data — transações recentes
const MOCK_TRANSACTIONS = [
  { id: 1, cliente: 'Tech Startup A', tipo: 'receita', valor: 15000, data: '2 horas atrás', icon: 'receita' },
  { id: 2, cliente: 'Pagamento Asaas', tipo: 'despesa', valor: 2500, data: '5 horas atrás', icon: 'despesa' },
  { id: 3, cliente: 'E-commerce B', tipo: 'receita', valor: 12300, data: '1 dia atrás', icon: 'receita' },
  { id: 4, cliente: 'Infraestrutura', tipo: 'despesa', valor: 800, data: '2 dias atrás', icon: 'despesa' },
  { id: 5, cliente: 'SaaS C', tipo: 'receita', valor: 9850, data: '3 dias atrás', icon: 'receita' },
  { id: 6, cliente: 'Google Ads', tipo: 'despesa', valor: 3200, data: '4 dias atrás', icon: 'despesa' },
]

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export function RecentTransactions() {
  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl card-shadow overflow-hidden">
      {/* Header */}
      <div className="p-[1.25rem] border-b border-surface-border/40">
        <h3 className="text-ink-primary font-bold text-base">Recent Transaction</h3>
        <p className="text-ink-muted text-xs mt-[0.25rem]">Últimas movimentações</p>
      </div>

      {/* Lista */}
      <div className="divide-y divide-surface-border/40 max-h-[20rem] overflow-y-auto">
        {MOCK_TRANSACTIONS.map((tx) => {
          const isReceita = tx.tipo === 'receita'
          const color = isReceita ? 'text-status-green' : 'text-status-red'
          const bgColor = isReceita ? 'bg-status-green/10' : 'bg-status-red/10'
          const borderColor = isReceita ? 'border-status-green/30' : 'border-status-red/30'

          return (
            <div key={tx.id} className="p-[1rem] flex items-center justify-between hover:bg-surface-hover/50 transition-colors">
              {/* Ícone + Info */}
              <div className="flex items-center gap-[0.75rem] flex-1 min-w-0">
                <div className={`w-[2.5rem] h-[2.5rem] rounded-lg flex items-center justify-center shrink-0 ${bgColor} border ${borderColor}`}>
                  {isReceita ? (
                    <ArrowDownLeft className={`w-[1.25rem] h-[1.25rem] ${color}`} strokeWidth={2} />
                  ) : (
                    <ArrowUpRight className={`w-[1.25rem] h-[1.25rem] ${color}`} strokeWidth={2} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-ink-primary text-sm font-semibold truncate">{tx.cliente}</p>
                  <p className="text-ink-muted text-xs flex items-center gap-[0.375rem] mt-[0.125rem]">
                    <Clock className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                    {tx.data}
                  </p>
                </div>
              </div>

              {/* Valor */}
              <div className="text-right shrink-0 ml-[0.5rem]">
                <p className={`text-sm font-bold ${color}`}>{isReceita ? '+' : '-'}{fmt(tx.valor)}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-[1.25rem] py-[0.75rem] border-t border-surface-border/40 bg-surface-hover/30">
        <button className="text-ads-500 text-xs font-semibold hover:text-ads-600 transition-colors">
          Ver histórico completo →
        </button>
      </div>
    </div>
  )
}
