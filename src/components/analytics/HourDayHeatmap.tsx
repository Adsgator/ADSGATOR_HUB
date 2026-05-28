'use client'

import { cn } from '@/lib/utils'

interface HorarioDados {
  dia_semana: string
  hora: number
  impressoes: number
  cliques: number
  conversoes: number
  custo: number
}

interface HourDayHeatmapProps {
  data: HorarioDados[]
  metric?: 'cliques' | 'conversoes' | 'custo'
  loading?: boolean
}

const DIAS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const DIAS_PT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const HORAS = Array.from({ length: 24 }, (_, i) => i)

function getIntensity(value: number, max: number): number {
  if (max === 0) return 0
  return Math.min(value / max, 1)
}

function intensityToColor(v: number): string {
  if (v === 0) return 'bg-surface-hover'
  if (v < 0.2) return 'bg-ads-500/15'
  if (v < 0.4) return 'bg-ads-500/30'
  if (v < 0.6) return 'bg-ads-500/50'
  if (v < 0.8) return 'bg-ads-500/70'
  return 'bg-ads-500'
}

export function HourDayHeatmap({ data, metric = 'cliques', loading }: HourDayHeatmapProps) {
  if (loading) {
    return <div className="h-[10rem] rounded-xl bg-surface-hover animate-pulse" />
  }

  // Build lookup: dia+hora → value
  const lookup = new Map<string, number>()
  let maxVal = 0
  for (const d of data) {
    const val = d[metric] ?? 0
    const key = `${d.dia_semana}-${d.hora}`
    lookup.set(key, val)
    if (val > maxVal) maxVal = val
  }

  const metricLabel = { cliques: 'Cliques', conversoes: 'Conversões', custo: 'Custo' }[metric]

  return (
    <div>
      <p className="text-[0.6875rem] text-ink-muted mb-[0.5rem]">Intensidade por: <strong>{metricLabel}</strong></p>
      <div className="overflow-x-auto">
        <div className="min-w-[36rem]">
          {/* Hour labels */}
          <div className="flex mb-[0.125rem] pl-[2.5rem]">
            {HORAS.map(h => (
              <div key={h} className="flex-1 text-center text-[0.5rem] text-ink-muted leading-none">
                {h % 3 === 0 ? `${h}h` : ''}
              </div>
            ))}
          </div>
          {/* Grid */}
          {DIAS.map((dia, dIdx) => (
            <div key={dia} className="flex items-center gap-[0.125rem] mb-[0.125rem]">
              <span className="w-[2.5rem] text-[0.625rem] text-ink-muted flex-shrink-0 text-right pr-[0.375rem]">
                {DIAS_PT[dIdx]}
              </span>
              {HORAS.map(h => {
                const val = lookup.get(`${dia}-${h}`) ?? 0
                const intensity = getIntensity(val, maxVal)
                return (
                  <div
                    key={h}
                    title={`${DIAS_PT[dIdx]} ${h}h: ${val.toLocaleString('pt-BR')}`}
                    className={cn(
                      'flex-1 h-[1rem] rounded-[0.125rem] transition-colors cursor-default',
                      intensityToColor(intensity)
                    )}
                  />
                )
              })}
            </div>
          ))}
          {/* Legend */}
          <div className="flex items-center gap-[0.25rem] mt-[0.5rem] justify-end">
            <span className="text-[0.55rem] text-ink-muted">Menos</span>
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
              <div key={v} className={cn('w-[0.875rem] h-[0.875rem] rounded-[0.125rem]', intensityToColor(v))} />
            ))}
            <span className="text-[0.55rem] text-ink-muted">Mais</span>
          </div>
        </div>
      </div>
    </div>
  )
}
