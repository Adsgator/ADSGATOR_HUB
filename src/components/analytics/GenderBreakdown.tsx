'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DemografiaDados {
  faixa_etaria: string
  genero: string
  impressoes: number
  cliques: number
  conversoes: number
  custo: number
}

interface GenderBreakdownProps {
  data: DemografiaDados[]
  loading?: boolean
}

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Masculino',
  FEMALE: 'Feminino',
  UNDETERMINED: 'Não definido',
}

const COLORS = ['#3B82F6', '#EC4899', '#71717A']

export function GenderBreakdown({ data, loading }: GenderBreakdownProps) {
  if (loading) return <div className="h-[10rem] rounded-xl bg-surface-hover animate-pulse" />

  // Aggregate by gender
  const grouped = new Map<string, { cliques: number; conversoes: number; custo: number }>()
  for (const d of data) {
    const g = d.genero || 'UNDETERMINED'
    const cur = grouped.get(g) ?? { cliques: 0, conversoes: 0, custo: 0 }
    grouped.set(g, {
      cliques: cur.cliques + d.cliques,
      conversoes: cur.conversoes + d.conversoes,
      custo: cur.custo + d.custo,
    })
  }

  const chartData = Array.from(grouped.entries()).map(([g, vals]) => ({
    name: GENDER_LABELS[g] ?? g,
    value: vals.cliques,
  }))

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-[8rem] text-ink-muted text-sm">Sem dados</div>
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={65}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => [Number(v).toLocaleString('pt-BR'), 'Cliques']}
          contentStyle={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.6875rem' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
