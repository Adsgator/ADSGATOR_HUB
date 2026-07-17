'use client'

import { Smartphone, Monitor, Tablet, Tv, HelpCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { LinhaDispositivoAds } from '@/lib/ads-detalhes'
import { DISPOSITIVO_LABEL, fmtConv, fmtMoeda, fmtNum } from './labels'

const ICONES: Record<string, typeof Smartphone> = {
  MOBILE: Smartphone, DESKTOP: Monitor, TABLET: Tablet, CONNECTED_TV: Tv,
}

const CORES: Record<string, string> = {
  MOBILE: '#FFB100', DESKTOP: '#10B981', TABLET: '#3B82F6', CONNECTED_TV: '#8b5cf6', OTHER: '#6B7280', UNKNOWN: '#6B7280',
}

export function DispositivosAdsCard({ dados }: { dados: LinhaDispositivoAds[] }) {
  const totalCliques = dados.reduce((s, d) => s + d.cliques, 0)
  const chartData = dados.map((d) => ({ name: DISPOSITIVO_LABEL[d.dispositivo] ?? d.dispositivo, value: d.cliques, dispositivo: d.dispositivo }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-[1rem] items-center">
      <div className="h-[9rem]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={28} outerRadius={56} paddingAngle={3} dataKey="value">
              {chartData.map((entry) => (
                <Cell key={entry.dispositivo} fill={CORES[entry.dispositivo] ?? CORES.UNKNOWN} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
              formatter={(v: unknown, name: unknown) => [
                `${fmtNum(Number(v))} cliques (${totalCliques > 0 ? ((Number(v) / totalCliques) * 100).toFixed(1) : 0}%)`,
                String(name),
              ] as [string, string]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-[0.625rem]">
        {dados.map((d) => {
          const Icone = ICONES[d.dispositivo] ?? HelpCircle
          const cor = CORES[d.dispositivo] ?? CORES.UNKNOWN
          return (
            <div key={d.dispositivo} className="flex items-center justify-between gap-[0.75rem]">
              <div className="flex items-center gap-[0.5rem] min-w-0">
                <div className="p-[0.375rem] rounded-md shrink-0" style={{ backgroundColor: `${cor}20` }}>
                  <Icone className="w-[0.875rem] h-[0.875rem]" style={{ color: cor }} strokeWidth={2} />
                </div>
                <span className="text-[0.8125rem] text-ink-secondary truncate">
                  {DISPOSITIVO_LABEL[d.dispositivo] ?? d.dispositivo}
                </span>
              </div>
              <div className="text-right text-[0.75rem] shrink-0">
                <span className="text-ink-primary font-medium">{fmtNum(d.cliques)} cliques</span>
                <span className="text-ink-muted"> · {fmtMoeda(d.custo)} · {fmtConv(d.conversoes)} conv.</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
