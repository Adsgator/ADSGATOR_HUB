'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { LinhaOrigemGA4 } from '@/lib/ga4-detalhes'
import { fmtConv, fmtNum, fmtPct } from '../trafego/labels'

// De onde vem o tráfego (origem/mídia da sessão) — tabela + pizza, como no
// Looker. Cores estáveis por posição (top 6 + "outras").

const CORES = ['#FFB100', '#3B82F6', '#10B981', '#8b5cf6', '#06b6d4', '#f59e0b', '#6B7280']

export function AquisicaoCard({ dados }: { dados: LinhaOrigemGA4[] }) {
  const totalSessoes = dados.reduce((s, l) => s + l.sessoes, 0)
  const top = dados.slice(0, 6)
  const outras = dados.slice(6).reduce((s, l) => s + l.sessoes, 0)
  const chartData = [
    ...top.map((l, i) => ({ name: `${l.fonte} / ${l.midia}`, value: l.sessoes, cor: CORES[i] })),
    ...(outras > 0 ? [{ name: 'Outras origens', value: outras, cor: CORES[6] }] : []),
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[11rem_1fr] gap-[1rem] items-start">
      <div className="h-[10rem]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={30} outerRadius={62} paddingAngle={2} dataKey="value">
              {chartData.map((entry) => <Cell key={entry.name} fill={entry.cor} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
              formatter={(v: unknown, name: unknown) => [
                `${fmtNum(Number(v))} sessões (${totalSessoes > 0 ? ((Number(v) / totalSessoes) * 100).toFixed(1) : 0}%)`,
                String(name),
              ] as [string, string]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[0.8125rem]">
          <thead>
            <tr className="border-b border-surface-border">
              {['Origem / mídia', 'Sessões', 'Usuários', 'Conv.', 'Tx. conv.', 'Engaj.'].map((h) => (
                <th key={h} className="text-left pb-[0.5rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.map((l, i) => (
              <tr key={`${l.fonte}/${l.midia}`} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover/50 transition-colors">
                <td className="py-[0.5rem] pr-[1rem]">
                  <div className="flex items-center gap-[0.375rem] min-w-0">
                    <span className="w-[0.5rem] h-[0.5rem] rounded-full shrink-0" style={{ backgroundColor: CORES[Math.min(i, 6)] }} />
                    <span className="text-ink-primary font-medium truncate max-w-[12rem]" title={`${l.fonte} / ${l.midia}`}>
                      {l.fonte} <span className="text-ink-muted font-normal">/ {l.midia}</span>
                    </span>
                  </div>
                </td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.sessoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.usuarios)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtConv(l.conversoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtPct(l.taxaConversao)}</td>
                <td className="py-[0.5rem] text-ink-secondary">{fmtPct(l.taxaEngajamento)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
