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
    <div className="p-[1.25rem] flex flex-col gap-[0.75rem] h-full">
      {/* Relógio */}
      <div>
        <p className="text-ink-primary text-[3.5rem] font-black tabular-nums leading-none tracking-tight">{hora}</p>
        <p className="text-ink-secondary text-sm capitalize mt-[0.25rem]">{data}</p>
      </div>

      {/* Separador */}
      <div className="h-px bg-surface-border my-[0.25rem]" />

      {/* Clima */}
      {weather.temp !== null && (
        <div className="flex items-center gap-[1rem]">
          <div className="flex items-center gap-[0.5rem]">
            <Thermometer className="w-5 h-5 text-status-orange" strokeWidth={1.75} />
            <span className="text-ink-primary text-lg font-semibold">{weather.temp}°C</span>
          </div>
          {weather.chuva2h !== null && weather.chuva2h > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-status-blue/10 text-status-blue text-xs font-medium">
              <CloudRain className="w-3 h-3 mr-1" strokeWidth={1.75} />
              {weather.chuva2h}% chuva
            </span>
          )}
        </div>
      )}

      {/* Status das APIs */}
      <div>
        <p className="text-ink-muted text-[0.625rem] uppercase tracking-wide font-semibold mb-[0.5rem]">Status APIs</p>
        <div className="grid grid-cols-3 gap-2">
          {API_STATUS.map(({ label, status }) => (
            <div key={label} className="flex items-center gap-[0.375rem]" title={label}>
              <Circle
                className={`w-2 h-2 fill-current ${STATUS_COLOR[status]}`}
                strokeWidth={0}
              />
              <span className="text-ink-secondary text-[0.6875rem] truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
