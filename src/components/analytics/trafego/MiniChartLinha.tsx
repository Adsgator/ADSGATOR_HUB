'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// Mini gráfico de linha, UMA métrica por eixo (small multiples) — usado na
// série diária pra evitar eixo duplo: cada métrica de escala diferente ganha
// seu próprio gráfico, em vez de forçar duas escalas arbitrárias juntas.

interface Serie {
  chave: string
  cor:   string
}

interface MiniChartLinhaProps<T extends Record<string, unknown>> {
  titulo:    string
  dados:     T[]
  eixoX:     string
  series:    Serie[]
  formatter: (v: number) => string
  legenda?:  Record<string, string> // rótulo por série, quando há mais de 1
}

export function MiniChartLinha<T extends Record<string, unknown>>({
  titulo, dados, eixoX, series, formatter, legenda,
}: MiniChartLinhaProps<T>) {
  return (
    <div className="bg-surface-hover/40 border border-surface-border rounded-xl p-[0.875rem]">
      <div className="flex items-center justify-between mb-[0.5rem]">
        <p className="text-ink-secondary text-[0.75rem] font-semibold">{titulo}</p>
        {series.length > 1 && (
          <div className="flex items-center gap-[0.625rem]">
            {series.map((s) => (
              <span key={s.chave} className="flex items-center gap-[0.25rem] text-[0.6875rem] text-ink-muted">
                <span className="w-[0.5rem] h-[0.5rem] rounded-full" style={{ backgroundColor: s.cor }} />
                {legenda?.[s.chave] ?? s.chave}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="h-[6.5rem]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dados} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey={eixoX} tick={{ fontSize: 9, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
              formatter={(v: unknown, nome: unknown) => [formatter(Number(v)), legenda?.[String(nome)] ?? String(nome)] as [string, string]}
              labelStyle={{ color: 'var(--ink-primary)', fontWeight: 600 }}
            />
            {series.map((s) => (
              <Line key={s.chave} dataKey={s.chave} stroke={s.cor} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
