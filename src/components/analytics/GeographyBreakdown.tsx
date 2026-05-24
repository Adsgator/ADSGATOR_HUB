'use client'

import { MapPin } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export interface GeographyData {
  pais?: string
  estado: string
  cidade: string
  sessoes?: number
  usuarios?: number
  impressoes?: number
  cliques?: number
  conversoes?: number
  custo?: number
  taxa_engajamento?: number
}

interface GeographyBreakdownProps {
  data: GeographyData[]
  loading?: boolean
  title?: string
}

const COLORS = ['#FFB100', '#E6A000', '#CC8E00', '#B37B00', '#8C6200']

export function GeographyBreakdown({ data, loading, title = 'Geografia' }: GeographyBreakdownProps) {
  if (loading) {
    return (
      <div className="h-64 rounded-xl bg-surface-hover animate-pulse" />
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-ink-muted">
        <MapPin className="w-8 h-8 mb-2 opacity-50" strokeWidth={1.5} />
        <p className="text-sm">Sem dados geográficos</p>
      </div>
    )
  }

  // Agrupar por estado e pegar top 5
  const porEstado = data.reduce((acc, item) => {
    if (!item.estado) return acc
    acc[item.estado] = (acc[item.estado] || 0) + (item.sessoes || item.cliques || 0)
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(porEstado)
    .map(([name, value]) => ({ name: name.slice(0, 15), fullName: name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return (
    <div>
      <h4 className="text-sm font-medium text-ink-muted mb-4">{title}</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={70}
              tick={{ fill: '#A3A3A3', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
              }}
              itemStyle={{ color: 'var(--ink-primary)' }}
              labelStyle={{ color: 'var(--ink-secondary)', marginBottom: '0.125rem' }}
              formatter={(value, _name, props) => [
                `${Number(value || 0).toLocaleString('pt-BR')} sessões`,
                (props?.payload as { fullName: string })?.fullName || ''
              ]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
