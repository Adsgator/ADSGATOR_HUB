'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts'
import type { LinhaDispositivoAds } from '@/lib/ads-detalhes'
import { DISPOSITIVO_LABEL, fmtConv, fmtMoeda, fmtNum, fmtPct } from './labels'

// Dispositivo — réplica do Looker (GADS-6): tabela completa + donuts de
// participação por métrica (Impressões, Cliques, Visitas site, Conversões).

const CORES: Record<string, string> = {
  MOBILE: '#FFB100', DESKTOP: '#10B981', TABLET: '#3B82F6', CONNECTED_TV: '#8b5cf6', OTHER: '#6B7280', UNKNOWN: '#6B7280',
}

const COLUNAS = ['Impr.', 'Cliques', 'CPC médio', 'CTR', 'Conv.', 'Custo/conv.', 'Custo', 'Visitas site']

function Donut({ titulo, dados, metrica, formatter }: {
  titulo: string
  dados: LinhaDispositivoAds[]
  metrica: 'impressoes' | 'cliques' | 'conversoes' | 'visitasSite'
  formatter: (v: number) => string
}) {
  const total = dados.reduce((s, d) => s + d[metrica], 0)
  const dominante = [...dados].sort((a, b) => b[metrica] - a[metrica])[0]
  const pctDominante = total > 0 && dominante ? (dominante[metrica] / total) * 100 : 0

  return (
    <div className="text-center">
      <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.25rem]">{titulo}</p>
      <div className="h-[5.5rem]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dados} dataKey={metrica} nameKey="dispositivo"
              cx="50%" cy="50%" innerRadius={28} outerRadius={40} paddingAngle={2}
            >
              {dados.map((d) => <Cell key={d.dispositivo} fill={CORES[d.dispositivo] ?? CORES.UNKNOWN} />)}
              <Label
                position="center"
                content={() => (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-ink-primary text-[0.75rem] font-bold">
                    {pctDominante.toFixed(1)}%
                  </text>
                )}
              />
            </Pie>
            <Tooltip
              contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
              formatter={(v: unknown, nome: unknown) => [formatter(Number(v)), DISPOSITIVO_LABEL[String(nome)] ?? String(nome)] as [string, string]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-ink-muted text-[0.6875rem]">{DISPOSITIVO_LABEL[dominante?.dispositivo ?? ''] ?? '—'}</p>
    </div>
  )
}

export function DispositivosAdsCard({ dados }: { dados: LinhaDispositivoAds[] }) {
  const total = useMemo(() => dados.reduce((acc, d) => ({
    impressoes: acc.impressoes + d.impressoes, cliques: acc.cliques + d.cliques,
    custo: acc.custo + d.custo, conversoes: acc.conversoes + d.conversoes,
    visitasSite: acc.visitasSite + d.visitasSite,
  }), { impressoes: 0, cliques: 0, custo: 0, conversoes: 0, visitasSite: 0 }), [dados])

  return (
    <div>
      <div className="overflow-x-auto mb-[1.25rem]">
        <table className="w-full text-[0.8125rem]">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left pb-[0.5rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem]">Dispositivo</th>
              {COLUNAS.map((h) => (
                <th key={h} className="text-left pb-[0.5rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.map((d) => {
              const ctr = d.impressoes > 0 ? (d.cliques / d.impressoes) * 100 : 0
              const cpc = d.cliques > 0 ? d.custo / d.cliques : 0
              return (
                <tr key={d.dispositivo} className="border-b border-surface-border/60 last:border-0">
                  <td className="py-[0.5rem] pr-[1rem] text-ink-primary font-medium">{DISPOSITIVO_LABEL[d.dispositivo] ?? d.dispositivo}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(d.impressoes)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(d.cliques)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{d.cliques > 0 ? fmtMoeda(cpc) : '—'}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtPct(ctr)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtConv(d.conversoes)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{d.conversoes > 0 ? fmtMoeda(d.custo / d.conversoes) : '—'}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-status-blue font-medium">{fmtMoeda(d.custo)}</td>
                  <td className="py-[0.5rem] text-ink-secondary">{fmtConv(d.visitasSite)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-surface-border font-semibold">
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">Total geral</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.impressoes)}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.cliques)}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{total.cliques > 0 ? fmtMoeda(total.custo / total.cliques) : '—'}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{total.impressoes > 0 ? fmtPct((total.cliques / total.impressoes) * 100) : '—'}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtConv(total.conversoes)}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{total.conversoes > 0 ? fmtMoeda(total.custo / total.conversoes) : '—'}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtMoeda(total.custo)}</td>
              <td className="py-[0.5rem] text-ink-primary">{fmtConv(total.visitasSite)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-4 gap-[0.75rem]">
        <Donut titulo="Impressões" dados={dados} metrica="impressoes" formatter={fmtNum} />
        <Donut titulo="Cliques" dados={dados} metrica="cliques" formatter={fmtNum} />
        <Donut titulo="Visitas site" dados={dados} metrica="visitasSite" formatter={fmtConv} />
        <Donut titulo="Conversões" dados={dados} metrica="conversoes" formatter={fmtConv} />
      </div>
    </div>
  )
}
