'use client'

import { useEffect, useState } from 'react'
import { Thermometer, CloudRain } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface WeatherData {
  temp:        number | null
  chuva:       number | null
  chuva2h:     number | null
  descricao?:  string
  condicao?:   string
}

// ── Relógio analógico SVG ────────────────────────────────────────────────────
function AnalogClock({ date }: { date: Date }) {
  const s = date.getSeconds()
  const m = date.getMinutes() + s / 60
  const h = (date.getHours() % 12) + m / 60

  const secDeg = s * 6
  const minDeg = m * 6
  const hrDeg  = h * 30

  const cx = 50
  const cy = 50
  const r  = 46

  // Marcadores de hora
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180)
    const inner = i % 3 === 0 ? r - 10 : r - 7
    return {
      x1: cx + inner * Math.cos(angle),
      y1: cy + inner * Math.sin(angle),
      x2: cx + r * Math.cos(angle),
      y2: cy + r * Math.sin(angle),
      major: i % 3 === 0,
    }
  })

  return (
    <svg viewBox="0 0 100 100" className="w-[5rem] h-[5rem] shrink-0">
      {/* Face */}
      <circle cx={cx} cy={cy} r={r} className="fill-surface-elevated stroke-surface-border" strokeWidth="1" />

      {/* Ticks */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          strokeWidth={t.major ? 2 : 1}
          className={t.major ? 'stroke-ink-secondary' : 'stroke-ink-muted'}
          strokeLinecap="round"
        />
      ))}

      {/* Ponteiro hora */}
      <line
        x1={cx} y1={cy}
        x2={cx + 24 * Math.cos((hrDeg - 90) * (Math.PI / 180))}
        y2={cy + 24 * Math.sin((hrDeg - 90) * (Math.PI / 180))}
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-ink-primary"
      />

      {/* Ponteiro minuto */}
      <line
        x1={cx} y1={cy}
        x2={cx + 34 * Math.cos((minDeg - 90) * (Math.PI / 180))}
        y2={cy + 34 * Math.sin((minDeg - 90) * (Math.PI / 180))}
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-ink-primary"
      />

      {/* Ponteiro segundo */}
      <line
        x1={cx} y1={cy}
        x2={cx + 38 * Math.cos((secDeg - 90) * (Math.PI / 180))}
        y2={cy + 38 * Math.sin((secDeg - 90) * (Math.PI / 180))}
        strokeWidth="1"
        strokeLinecap="round"
        className="stroke-ads-500"
      />

      {/* Centro */}
      <circle cx={cx} cy={cy} r="3" className="fill-ads-500" />
    </svg>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────
export function WeatherClock() {
  const [now,     setNow]     = useState(new Date())
  const [weather, setWeather] = useState<WeatherData>({ temp: null, chuva: null, chuva2h: null })

  // Tick a cada segundo para o analógico
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000)
    return () => clearInterval(id)
  }, [])

  // Clima
  useEffect(() => {
    fetch('/api/weather')
      .then((r) => r.json() as Promise<WeatherData>)
      .then(setWeather)
      .catch(() => {})
  }, [])


  const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const data = now.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className="p-[1.25rem] flex flex-col gap-[0.75rem] h-full">
      {/* Relógio — analógico + digital lado a lado */}
      <div className="flex items-center gap-[1rem]">
        <AnalogClock date={now} />
        <div>
          <p className="text-ink-primary text-[2rem] font-black tabular-nums leading-none tracking-tight">{hora}</p>
          <p className="text-ink-secondary text-[0.8125rem] capitalize mt-[0.25rem]">{data}</p>
        </div>
      </div>

      {/* Separador */}
      <div className="h-px bg-surface-border/40 my-[0.125rem]" />

      {/* Clima */}
      {weather.temp !== null && (
        <div className="flex flex-col gap-[0.375rem]">
          <div className="flex items-center gap-[0.5rem]">
            <div className="flex items-center gap-[0.375rem]">
              <Thermometer className="w-[1rem] h-[1rem] text-status-orange" strokeWidth={1.75} />
              <span className="text-ink-primary text-[1rem] font-semibold">{weather.temp}°C</span>
            </div>
            {weather.chuva2h !== null && weather.chuva2h > 0 && (
              <span className="inline-flex items-center gap-[0.25rem] px-[0.5rem] py-[0.125rem] rounded-full bg-status-blue/10 text-status-blue text-[0.75rem] font-medium">
                <CloudRain className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
                {weather.chuva2h}% chuva
              </span>
            )}
          </div>
          {weather.condicao && (
            <p className="text-ink-secondary text-[0.75rem] capitalize">{weather.condicao}</p>
          )}
        </div>
      )}
    </div>
  )
}
