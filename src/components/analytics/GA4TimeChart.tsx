'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface GA4DailyData {
  data: string
  visualizacoes: number
  usuarios: number
  sessoes: number
}

interface GA4TimeChartProps {
  data: GA4DailyData[]
  loading?: boolean
}

export function GA4TimeChart({ data, loading }: GA4TimeChartProps) {
  if (loading) return <div className="h-[12rem] rounded-xl bg-surface-hover animate-pulse" />

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[8rem] text-ink-muted text-sm">Sem dados de período</div>
  }

  const formatted = data.map(d => ({
    ...d,
    label: new Date(d.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={formatted} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
          labelStyle={{ color: 'var(--color-ink-primary)' }}
        />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '0.6875rem' }} />
        <Line type="monotone" dataKey="visualizacoes" name="Visualizações" stroke="#FFB100" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="usuarios" name="Usuários" stroke="#3B82F6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="sessoes" name="Sessões" stroke="#22C55E" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
