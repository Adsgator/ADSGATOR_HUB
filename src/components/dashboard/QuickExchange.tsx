'use client'

import { useState } from 'react'
import { ChevronDown, ArrowRightLeft } from 'lucide-react'

// Mock data — próximos pagamentos (mock)
const MOCK_UPCOMING = [
  { id: 1, cliente: 'Tech Startup A', vencimento: '2025-06-05', dias: 12, valor: 15000 },
  { id: 2, cliente: 'E-commerce B', vencimento: '2025-06-10', dias: 17, valor: 12300 },
  { id: 3, cliente: 'SaaS C', vencimento: '2025-06-08', dias: 15, valor: 9850 },
]

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export function QuickExchange() {
  const [fromCurrency, setFromCurrency] = useState('BRL')
  const [toCurrency, setToCurrency] = useState('USD')

  const totalRecebivelBRL = MOCK_UPCOMING.reduce((s, p) => s + p.valor, 0)
  const exchangeRate = 5.25 // Mock
  const totalRecebivelUSD = totalRecebivelBRL / exchangeRate

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl card-shadow overflow-hidden">
      {/* Header */}
      <div className="p-[1.25rem] border-b border-surface-border/40">
        <h3 className="text-ink-primary font-bold text-base">Quick Exchange</h3>
        <p className="text-ink-muted text-xs mt-[0.25rem]">Próximos pagamentos</p>
      </div>

      {/* Body */}
      <div className="p-[1.25rem] space-y-[1rem]">
        {/* Valores e conversão */}
        <div className="space-y-[0.75rem]">
          <div>
            <p className="text-ink-muted text-xs font-medium uppercase tracking-wider mb-[0.375rem]">Total a Receber</p>
            <div className="flex items-baseline gap-[0.5rem]">
              <p className="text-ink-primary font-black text-2xl">{fmt(totalRecebivelBRL)}</p>
              <span className="text-ink-muted text-xs">BRL</span>
            </div>
          </div>

          {/* Conversão */}
          <div className="flex items-center gap-[0.75rem] py-[0.75rem] px-[1rem] rounded-lg bg-surface-hover/50 border border-surface-border/40">
            <div className="flex-1">
              <p className="text-ink-muted text-xs mb-[0.25rem]">BRL → USD</p>
              <p className="text-ink-primary font-semibold">{totalRecebivelUSD.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} USD</p>
            </div>
            <ArrowRightLeft className="w-[1rem] h-[1rem] text-ink-muted shrink-0" strokeWidth={1.5} />
          </div>

          {/* Rate */}
          <p className="text-ink-muted text-xs">Taxa: 1 BRL = {exchangeRate} USD</p>
        </div>

        {/* Separator */}
        <div className="h-px bg-surface-border/40" />

        {/* Próximos pagamentos */}
        <div>
          <p className="text-ink-primary text-xs font-semibold uppercase tracking-wider mb-[0.625rem]">Vencimentos</p>
          <div className="space-y-[0.5rem]">
            {MOCK_UPCOMING.map((pagto) => (
              <div key={pagto.id} className="flex items-center justify-between p-[0.625rem] rounded-lg hover:bg-surface-hover/50 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="text-ink-primary text-xs font-medium truncate">{pagto.cliente}</p>
                  <p className="text-ink-muted text-[0.7rem] mt-[0.125rem]">em {pagto.dias} dias</p>
                </div>
                <p className="text-ink-primary text-xs font-bold shrink-0 ml-[0.5rem]">{fmt(pagto.valor)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-[1.25rem] py-[0.75rem] border-t border-surface-border/40 bg-surface-hover/30">
        <button className="text-ads-500 text-xs font-semibold hover:text-ads-600 transition-colors">
          Ver calendário de pagamentos →
        </button>
      </div>
    </div>
  )
}
