'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface FonteTrafego {
  fonte: string
  midia: string
  sessoes: number
  conversoes: number
  taxa_conversao: number
}

interface GA4TrafficDetailProps {
  data: FonteTrafego[]
  loading?: boolean
}

const COLORS = ['#FFB100', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899']

export function GA4TrafficDetail({ data, loading }: GA4TrafficDetailProps) {
  if (loading) return <div className="h-[10rem] rounded-xl bg-surface-hover animate-pulse" />

  // Aggregate by fonte+midia
  const grouped = new Map<string, { sessoes: number; conversoes: number }>()
  for (const d of data) {
    const key = `${d.fonte} / ${d.midia}`
    const cur = grouped.get(key) ?? { sessoes: 0, conversoes: 0 }
    grouped.set(key, { sessoes: cur.sessoes + d.sessoes, conversoes: cur.conversoes + d.conversoes })
  }

  const chartData = Array.from(grouped.entries())
    .sort((a, b) => b[1].sessoes - a[1].sessoes)
    .slice(0, 8)
    .map(([name, vals]) => ({ name, ...vals }))

  const total = chartData.reduce((s, d) => s + d.sessoes, 0)

  return (
    <div className="flex flex-col gap-[0.75rem]">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="sessoes">
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            formatter={(v) => [`${Number(v).toLocaleString('pt-BR')} sessões`, '']}
            contentStyle={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[0.75rem]">
          <thead>
            <tr className="text-[0.625rem] text-ink-muted uppercase tracking-wide border-b border-surface-border">
              <th className="px-[0.5rem] py-[0.25rem] text-left">Fonte / Mídia</th>
              <th className="px-[0.5rem] py-[0.25rem] text-right">Sessões</th>
              <th className="px-[0.5rem] py-[0.25rem] text-right">%</th>
              <th className="px-[0.5rem] py-[0.25rem] text-right">Conv.</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, i) => (
              <tr key={i} className="border-b border-surface-border/40 last:border-0 hover:bg-surface-hover/40">
                <td className="px-[0.5rem] py-[0.25rem] flex items-center gap-[0.375rem]">
                  <span className="w-[0.5rem] h-[0.5rem] rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-ink-primary truncate max-w-[8rem]">{row.name}</span>
                </td>
                <td className="px-[0.5rem] py-[0.25rem] text-right text-ink-secondary">{row.sessoes.toLocaleString('pt-BR')}</td>
                <td className="px-[0.5rem] py-[0.25rem] text-right text-ink-secondary">{total > 0 ? ((row.sessoes / total) * 100).toFixed(1) : 0}%</td>
                <td className="px-[0.5rem] py-[0.25rem] text-right text-ink-secondary">{row.conversoes.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
