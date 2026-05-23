'use client'

import { Smartphone, Monitor, Tablet } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface DeviceData {
  device: string
  sistema_operacional?: string
  impressoes?: number
  cliques?: number
  sessoes?: number
  usuarios?: number
}

interface DeviceBreakdownProps {
  data: DeviceData[]
  loading?: boolean
}

const DEVICE_ICONS: Record<string, typeof Smartphone> = {
  MOBILE: Smartphone,
  DESKTOP: Monitor,
  TABLET: Tablet,
}

const COLORS = {
  MOBILE: '#FFB100',
  DESKTOP: '#10B981',
  TABLET: '#3B82F6',
  UNKNOWN: '#6B7280',
}

export function DeviceBreakdown({ data, loading }: DeviceBreakdownProps) {
  if (loading) {
    return (
      <div className="h-40 rounded-xl bg-surface-hover animate-pulse" />
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-ink-muted">
        <Smartphone className="w-8 h-8 mb-2 opacity-50" strokeWidth={1.5} />
        <p className="text-sm">Sem dados de dispositivos</p>
      </div>
    )
  }

  // Agrupar por tipo de device
  const agrupado = data.reduce((acc, item) => {
    const tipo = item.device?.toUpperCase() || 'UNKNOWN'
    const valor = item.sessoes || item.cliques || item.impressoes || 0
    acc[tipo] = (acc[tipo] || 0) + valor
    return acc
  }, {} as Record<string, number>)

  const total = Object.values(agrupado).reduce((a, b) => a + b, 0)

  const chartData = Object.entries(agrupado)
    .map(([name, value]) => ({ name, value, percent: total > 0 ? (value / total) * 100 : 0 }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={60}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell 
                  key={entry.name} 
                  fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.UNKNOWN} 
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#2A3527',
                border: '1px solid #44523F',
                borderRadius: '0.5rem',
              }}
              itemStyle={{ color: '#F0F3EF' }}
              formatter={(value, name) => [
                `${Number(value || 0).toLocaleString('pt-BR')} (${(Number(value || 0) / total * 100).toFixed(1)}%)`,
                String(name)
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {chartData.map((item) => {
          const Icon = DEVICE_ICONS[item.name] || Smartphone
          const color = COLORS[item.name as keyof typeof COLORS] || COLORS.UNKNOWN
          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
                </div>
                <span className="text-sm text-ink-secondary capitalize">{item.name.toLowerCase()}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{item.percent.toFixed(1)}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
