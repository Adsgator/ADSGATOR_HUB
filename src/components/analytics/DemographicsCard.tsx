'use client'

import { Users } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface DemographicsData {
  faixa_etaria: string
  genero: string
  impressoes: number
  cliques: number
  conversoes: number
}

interface DemographicsCardProps {
  data: DemographicsData[]
  loading?: boolean
}

const COLORS = ['#FFB100', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B']

export function DemographicsCard({ data, loading }: DemographicsCardProps) {
  if (loading) {
    return (
      <div className="h-48 rounded-xl bg-surface-hover animate-pulse" />
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-ink-muted">
        <Users className="w-8 h-8 mb-2 opacity-50" strokeWidth={1.5} />
        <p className="text-sm">Sem dados demográficos</p>
      </div>
    )
  }

  // Agrupar por faixa etária
  const porIdade = data.reduce((acc, item) => {
    const chave = item.faixa_etaria.replace('AGE_RANGE_', '').replace('_', '-')
    acc[chave] = (acc[chave] || 0) + item.impressoes
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(porIdade)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#2A3527',
                border: '1px solid #44523F',
                borderRadius: '0.5rem',
              }}
              itemStyle={{ color: '#F0F3EF' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {chartData.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-ink-secondary">{item.name}</span>
            </div>
            <span className="font-medium">{item.value.toLocaleString('pt-BR')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
