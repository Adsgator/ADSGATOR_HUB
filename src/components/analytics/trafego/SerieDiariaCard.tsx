'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { LinhaDiaAds } from '@/lib/ads-detalhes'
import { fmtConv, fmtMoeda, fmtNum } from './labels'

const NOMES: Record<string, string> = {
  custo: 'Custo', cliques: 'Cliques', conversoes: 'Conversões',
}

export function SerieDiariaCard({ dados }: { dados: LinhaDiaAds[] }) {
  const chartData = dados.map((l) => ({
    ...l,
    dia: `${l.data.slice(8, 10)}/${l.data.slice(5, 7)}`,
  }))

  return (
    <div className="h-[15rem]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
          <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis yAxisId="custo" tick={{ fontSize: 10, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}`} />
          <YAxis yAxisId="contagem" orientation="right" tick={{ fontSize: 10, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '0.625rem', fontSize: '0.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
            labelStyle={{ color: 'var(--ink-primary)', fontWeight: 600, marginBottom: '0.25rem' }}
            formatter={(v: unknown, name: unknown) => {
              const n = String(name)
              const valor = Number(v)
              return [
                n === 'custo' ? fmtMoeda(valor) : n === 'conversoes' ? fmtConv(valor) : fmtNum(valor),
                NOMES[n] ?? n,
              ] as [string, string]
            }}
          />
          <Legend formatter={(v: string) => NOMES[v] ?? v} wrapperStyle={{ fontSize: '0.75rem' }} />
          <Bar  yAxisId="custo"    dataKey="custo"      fill="#3B82F6" opacity={0.7} radius={[3, 3, 0, 0]} />
          <Line yAxisId="contagem" dataKey="cliques"    stroke="#FFB100" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
          <Line yAxisId="contagem" dataKey="conversoes" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
