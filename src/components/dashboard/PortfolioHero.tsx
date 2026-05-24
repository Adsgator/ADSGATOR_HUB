'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

// Mock data — últimos 12 meses de MRR
const MOCK_PORTFOLIO_DATA = [
  { mes: 'Jan', mrr: 45000, lucro: 12000 },
  { mes: 'Fev', mrr: 48000, lucro: 14500 },
  { mes: 'Mar', mrr: 52000, lucro: 16800 },
  { mes: 'Abr', mrr: 58000, lucro: 19200 },
  { mes: 'Mai', mrr: 62000, lucro: 21500 },
  { mes: 'Jun', mrr: 59000, lucro: 20100 },
  { mes: 'Jul', mrr: 65000, lucro: 23400 },
  { mes: 'Ago', mrr: 71000, lucro: 26200 },
  { mes: 'Set', mrr: 78000, lucro: 29100 },
  { mes: 'Out', mrr: 82000, lucro: 31800 },
  { mes: 'Nov', mrr: 88000, lucro: 35200 },
  { mes: 'Dez', mrr: 95000, lucro: 39500 },
]

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export function PortfolioHero() {
  const currentMRR = MOCK_PORTFOLIO_DATA[MOCK_PORTFOLIO_DATA.length - 1].mrr
  const previousMRR = MOCK_PORTFOLIO_DATA[MOCK_PORTFOLIO_DATA.length - 2].mrr
  const growth = ((currentMRR - previousMRR) / previousMRR) * 100

  const totalLucro = MOCK_PORTFOLIO_DATA.reduce((s, d) => s + d.lucro, 0)

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden card-shadow">
      {/* Header com título e badges */}
      <div className="p-[1.5rem] border-b border-surface-border/40">
        <div className="flex items-start justify-between mb-[1rem]">
          <div>
            <h2 className="text-ink-primary font-bold text-2xl mb-[0.25rem]">Portfolio Overview</h2>
            <p className="text-ink-muted text-sm">Receita e lucro dos últimos 12 meses</p>
          </div>
          <div className="flex items-center gap-[0.5rem] px-[0.75rem] py-[0.375rem] rounded-full bg-status-green/10">
            <TrendingUp className="w-[0.875rem] h-[0.875rem] text-status-green" strokeWidth={2} />
            <span className="text-status-green text-sm font-semibold">{growth.toFixed(1)}%</span>
          </div>
        </div>

        {/* Valores principais */}
        <div className="grid grid-cols-3 gap-[1rem]">
          <div>
            <p className="text-ink-muted text-xs font-medium uppercase tracking-wider mb-[0.25rem]">MRR Atual</p>
            <p className="text-ink-primary font-black text-2xl">{fmt(currentMRR)}</p>
          </div>
          <div>
            <p className="text-ink-muted text-xs font-medium uppercase tracking-wider mb-[0.25rem]">Lucro (12m)</p>
            <p className="text-ink-primary font-black text-2xl">{fmt(totalLucro)}</p>
          </div>
          <div>
            <p className="text-ink-muted text-xs font-medium uppercase tracking-wider mb-[0.25rem]">Margem Média</p>
            <p className="text-ink-primary font-black text-2xl">{((totalLucro / (MOCK_PORTFOLIO_DATA.length * 70000)) * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="p-[1.5rem] h-[18rem]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_PORTFOLIO_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFB100" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FFB100" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(206 208 222 / 0.4)" vertical={false} />
            <XAxis
              dataKey="mes"
              stroke="rgb(161 161 170)"
              style={{ fontSize: '0.75rem' }}
              tick={{ fill: 'rgb(161 161 170)' }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(249 249 253)',
                border: '1px solid rgb(206 208 222 / 0.4)',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
              labelFormatter={(label: unknown) => `Mês: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="mrr"
              stroke="#FFB100"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMrr)"
              name="MRR"
            />
            <Area
              type="monotone"
              dataKey="lucro"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLucro)"
              name="Lucro"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer com ação */}
      <div className="px-[1.5rem] py-[1rem] border-t border-surface-border/40 flex items-center justify-between">
        <p className="text-ink-muted text-xs">Atualizado em tempo real</p>
        <button className="text-ads-500 text-xs font-semibold hover:text-ads-600 transition-colors">
          Ver detalhes →
        </button>
      </div>
    </div>
  )
}
