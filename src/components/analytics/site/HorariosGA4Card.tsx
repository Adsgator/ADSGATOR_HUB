'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { LinhaHoraGA4 } from '@/lib/ga4-detalhes'
import { fmtNum } from '../trafego/labels'
import { fmtDuracao } from './labelsGa4'

// Acompanhamento por hora do dia (00–23) — condensa as três séries do Looker:
// acessos (barras), engajamento × rejeição (linhas, eixo %) e duração média
// no tooltip.

const NOMES: Record<string, string> = {
  sessoes: 'Sessões',
  taxaEngajamento: 'Engajamento',
  taxaRejeicao: 'Rejeição',
}

export function HorariosGA4Card({ dados }: { dados: LinhaHoraGA4[] }) {
  const chartData = dados.map((h) => ({ ...h, rotulo: `${h.hora}h` }))

  return (
    <div className="h-[13rem]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
          <XAxis dataKey="rotulo" tick={{ fontSize: 10, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} interval={1} />
          <YAxis yAxisId="sessoes" tick={{ fontSize: 10, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="pct" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
          <Tooltip
            contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '0.625rem', fontSize: '0.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
            labelStyle={{ color: 'var(--ink-primary)', fontWeight: 600, marginBottom: '0.25rem' }}
            formatter={(v: unknown, name: unknown) => {
              const n = String(name)
              const valor = Number(v)
              return [
                n === 'sessoes' ? fmtNum(valor) : `${valor.toFixed(1).replace('.', ',')}%`,
                NOMES[n] ?? n,
              ] as [string, string]
            }}
            labelFormatter={(rotulo) => {
              const p = chartData.find((x) => x.rotulo === String(rotulo))
              return p
                ? `${p.rotulo} — ${fmtNum(p.visualizacoes)} visualizações · duração média ${fmtDuracao(p.duracaoMediaSessao)}`
                : String(rotulo ?? '')
            }}
          />
          <Legend formatter={(v: string) => NOMES[v] ?? v} wrapperStyle={{ fontSize: '0.75rem' }} />
          <Bar  yAxisId="sessoes" dataKey="sessoes"         fill="#3B82F6" opacity={0.7} radius={[3, 3, 0, 0]} />
          <Line yAxisId="pct"     dataKey="taxaEngajamento" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
          <Line yAxisId="pct"     dataKey="taxaRejeicao"    stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
