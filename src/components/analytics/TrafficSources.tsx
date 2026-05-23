'use client'

import { Globe, Share2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface TrafficSource {
  fonte: string
  midia: string
  sessoes: number
  conversoes: number
  taxa_conversao: number
}

interface TrafficSourcesProps {
  data: TrafficSource[]
  loading?: boolean
}

const COLORS = ['#FFB100', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B', '#EC4899']

export function TrafficSources({ data, loading }: TrafficSourcesProps) {
  if (loading) {
    return (
      <div className="h-48 rounded-xl bg-surface-hover animate-pulse" />
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-ink-muted">
        <Share2 className="w-8 h-8 mb-2 opacity-50" strokeWidth={1.5} />
        <p className="text-sm">Sem dados de fontes de tráfego</p>
      </div>
    )
  }

  const chartData = data
    .slice(0, 7)
    .map(item => ({
      name: item.fonte.length > 12 ? item.fonte.slice(0, 12) + '...' : item.fonte,
      fullName: item.fonte,
      sessoes: item.sessoes,
      conversoes: item.conversoes,
      taxa: item.taxa_conversao,
    }))

  return (
    <div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 60, right: 20 }}>
            <XAxis dataKey="name" hide />
            <YAxis 
              hide 
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#2A3527',
                border: '1px solid #44523F',
                borderRadius: '0.5rem',
              }}
              itemStyle={{ color: '#F0F3EF' }}
              formatter={(value, _name, props) => {
                const payload = props?.payload as { fullName: string; conversoes: number; taxa: number } | undefined
                return [
                  `${Number(value || 0).toLocaleString('pt-BR')} sessões | ${payload?.conversoes || 0} conv. (${(payload?.taxa || 0).toFixed(2)}%)`,
                  payload?.fullName || ''
                ]
              }}
            />
            <Bar dataKey="sessoes" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {chartData.slice(0, 6).map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-ink-secondary truncate" title={item.fullName}>
              {item.name}
            </span>
            <span className="text-ink-muted ml-auto">{item.sessoes}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
