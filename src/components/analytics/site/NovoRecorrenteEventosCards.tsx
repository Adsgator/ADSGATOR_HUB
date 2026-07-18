'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { LinhaTipoUsuarioGA4, LinhaEventoGA4 } from '@/lib/ga4-detalhes'
import { fmtConv, fmtNum, fmtPct } from '../trafego/labels'
import { TIPO_USUARIO_LABEL } from './labelsGa4'

// Novo × recorrente (pizza + números) e eventos disparados (tabela).

const COR_TIPO: Record<string, string> = {
  'new': '#FFB100',
  'returning': '#3B82F6',
  '(not set)': '#6B7280',
}

export function NovoRecorrenteCard({ dados }: { dados: LinhaTipoUsuarioGA4[] }) {
  const totalUsuarios = dados.reduce((s, l) => s + l.usuarios, 0)
  const chartData = dados
    .filter((l) => l.usuarios > 0)
    .map((l) => ({ name: TIPO_USUARIO_LABEL[l.tipo] ?? l.tipo, value: l.usuarios, cor: COR_TIPO[l.tipo] ?? '#6B7280' }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-[1rem] items-center">
      <div className="h-[8.5rem]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={26} outerRadius={54} paddingAngle={3} dataKey="value">
              {chartData.map((entry) => <Cell key={entry.name} fill={entry.cor} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
              formatter={(v: unknown, name: unknown) => [
                `${fmtNum(Number(v))} usuários (${totalUsuarios > 0 ? ((Number(v) / totalUsuarios) * 100).toFixed(1) : 0}%)`,
                String(name),
              ] as [string, string]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-[0.5rem]">
        {dados.map((l) => (
          <div key={l.tipo} className="flex items-center justify-between text-[0.8125rem]">
            <div className="flex items-center gap-[0.375rem]">
              <span className="w-[0.5rem] h-[0.5rem] rounded-full" style={{ backgroundColor: COR_TIPO[l.tipo] ?? '#6B7280' }} />
              <span className="text-ink-secondary">{TIPO_USUARIO_LABEL[l.tipo] ?? l.tipo}</span>
            </div>
            <span className="text-ink-primary font-medium text-[0.75rem]">
              {fmtNum(l.usuarios)} usuários
              <span className="text-ink-muted font-normal"> · {fmtNum(l.sessoes)} sessões · {fmtConv(l.conversoes)} conv. · {fmtPct(l.taxaEngajamento)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EventosCard({ dados }: { dados: LinhaEventoGA4[] }) {
  const maxContagem = Math.max(1, ...dados.map((e) => e.contagem))
  return (
    <div className="space-y-[0.5rem] max-h-[18rem] overflow-y-auto pr-[0.25rem]">
      {dados.map((e) => (
        <div key={e.evento}>
          <div className="flex items-center justify-between text-[0.75rem] mb-[0.1875rem]">
            <span className="text-ink-secondary font-mono">{e.evento}</span>
            <span className="text-ink-primary font-medium">
              {fmtNum(e.contagem)}
              <span className="text-ink-muted font-normal"> · {fmtNum(e.usuarios)} usuários</span>
            </span>
          </div>
          <div className="h-[0.3125rem] rounded-full bg-surface-hover overflow-hidden">
            <div className="h-full rounded-full bg-status-cyan" style={{ width: `${(e.contagem / maxContagem) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
