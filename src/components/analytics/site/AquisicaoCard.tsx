'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { LinhaOrigemGA4 } from '@/lib/ga4-detalhes'
import { fmtConv, fmtNum, fmtPct } from '../trafego/labels'
import { fmtDuracao } from './labelsGa4'

// De onde vem o tráfego (origem/mídia da sessão) — tabela completa (6
// métricas padrão + Conversões/Tx. conversão como extra) + pizza. Cores
// estáveis por posição (top 6 + "outras").

const CORES = ['#FFB100', '#3B82F6', '#10B981', '#8b5cf6', '#06b6d4', '#f59e0b', '#6B7280']

export function AquisicaoCard({ dados }: { dados: LinhaOrigemGA4[] }) {
  const totalSessoes = dados.reduce((s, l) => s + l.sessoes, 0)
  const top = dados.slice(0, 6)
  const outras = dados.slice(6).reduce((s, l) => s + l.sessoes, 0)
  const chartData = [
    ...top.map((l, i) => ({ name: `${l.fonte} / ${l.midia}`, value: l.sessoes, cor: CORES[i] })),
    ...(outras > 0 ? [{ name: 'Outras origens', value: outras, cor: CORES[6] }] : []),
  ]

  const total = useMemo(() => dados.reduce((acc, l) => {
    const pesoTotal = acc.sessoes + l.sessoes
    const media = (a: number, b: number) => (pesoTotal > 0 ? (a * acc.sessoes + b * l.sessoes) / pesoTotal : 0)
    return {
      visualizacoes:      acc.visualizacoes + l.visualizacoes,
      usuarios:           acc.usuarios + l.usuarios,
      usuariosNovos:      acc.usuariosNovos + l.usuariosNovos,
      sessoes:            acc.sessoes + l.sessoes,
      conversoes:         acc.conversoes + l.conversoes,
      taxaEngajamento:    media(acc.taxaEngajamento, l.taxaEngajamento),
      taxaRejeicao:       media(acc.taxaRejeicao, l.taxaRejeicao),
      duracaoMediaSessao: media(acc.duracaoMediaSessao, l.duracaoMediaSessao),
    }
  }, { visualizacoes: 0, usuarios: 0, usuariosNovos: 0, sessoes: 0, conversoes: 0, taxaEngajamento: 0, taxaRejeicao: 0, duracaoMediaSessao: 0 }), [dados])

  return (
    <div className="space-y-[1rem]">
      <div className="h-[10rem] max-w-[16rem]">
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

      <div className="overflow-x-auto max-h-[18rem] overflow-y-auto">
        <table className="w-full text-[0.8125rem]">
          <thead className="sticky top-0 bg-surface-card">
            <tr className="border-b border-surface-border">
              {['Origem / mídia', 'Visualiz.', 'Usuários', 'Novos', 'Sessões', 'Engaj.', 'Rejeição', 'Duração', 'Conv.', 'Tx. conv.'].map((h) => (
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
                <td className="py-[0.5rem] pr-[1rem] text-status-blue font-medium">{fmtNum(l.visualizacoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.usuarios)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.usuariosNovos)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.sessoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-status-green">{fmtPct(l.taxaEngajamento)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-status-orange">{fmtPct(l.taxaRejeicao)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtDuracao(l.duracaoMediaSessao)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtConv(l.conversoes)}</td>
                <td className="py-[0.5rem] text-ink-secondary">{fmtPct(l.taxaConversao)}</td>
              </tr>
            ))}
          </tbody>
          {dados.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-surface-border font-semibold">
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">Total geral</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.visualizacoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.usuarios)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.usuariosNovos)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.sessoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtPct(total.taxaEngajamento)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtPct(total.taxaRejeicao)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtDuracao(total.duracaoMediaSessao)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtConv(total.conversoes)}</td>
                <td className="py-[0.5rem] text-ink-primary">{total.sessoes > 0 ? fmtPct((total.conversoes / total.sessoes) * 100) : '—'}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
