'use client'

import { useEffect, useState } from 'react'
import { Thermometer, CloudRain, Circle } from 'lucide-react'

interface WeatherData {
  temp:    number | null
  chuva:   number | null
  chuva2h: number | null
}

interface StatusAPI {
  label:  string
  status: 'ok' | 'warn' | 'error'
}

const API_STATUS: StatusAPI[] = [
  { label: 'Supabase',   status: 'ok'   },
  { label: 'Google Ads', status: 'ok'   },
  { label: 'Asaas',      status: 'warn' },
]

const STATUS_COLOR = {
  ok:    'text-status-green',
  warn:  'text-status-orange',
  error: 'text-status-red',
} as const

export function WeatherClock() {
  const [hora,    setHora]    = useState('')
  const [data,    setData]    = useState('')
  const [weather, setWeather] = useState<WeatherData>({ temp: null, chuva: null, chuva2h: null })

  useEffect(() => {
    function tick() {
      const now = new Date()
      setHora(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
      setData(now.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }))
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetch('/api/weather')
      .then((r) => r.json() as Promise<WeatherData>)
      .then(setWeather)
      .catch(() => {})
  }, [])

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] flex flex-col gap-[1rem]">
      {/* Relógio */}
      <div>
        <p className="text-ink-primary text-[2rem] font-bold tabular-nums leading-none">{hora}</p>
        <p className="text-ink-muted text-[0.75rem] capitalize mt-[0.25rem]">{data}</p>
      </div>

      {/* Clima */}
      {weather.temp !== null && (
        <div className="flex items-center gap-[1rem]">
          <div className="flex items-center gap-[0.375rem]">
            <Thermometer className="w-[0.875rem] h-[0.875rem] text-status-orange" strokeWidth={1.75} />
            <span className="text-ink-secondary text-[0.875rem] font-medium">{weather.temp}°C</span>
          </div>
          {weather.chuva2h !== null && (
            <div className="flex items-center gap-[0.375rem]">
              <CloudRain className="w-[0.875rem] h-[0.875rem] text-status-blue" strokeWidth={1.75} />
              <span className="text-ink-secondary text-[0.875rem]">{weather.chuva2h}% chuva/2h</span>
            </div>
          )}
        </div>
      )}

      {/* Status das APIs */}
      <div>
        <p className="text-ink-muted text-[0.625rem] uppercase tracking-wide font-semibold mb-[0.375rem]">Status APIs</p>
        <div className="flex flex-col gap-[0.25rem]">
          {API_STATUS.map(({ label, status }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-ink-secondary text-[0.75rem]">{label}</span>
              <Circle
                className={`w-[0.5rem] h-[0.5rem] fill-current ${STATUS_COLOR[status]}`}
                strokeWidth={0}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
