'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { getCityCoords } from '@/lib/city-coords'
import type { GeographyData } from './GeographyBreakdown'

// Leaflet só roda no browser
const MapContainer  = dynamic(() => import('react-leaflet').then((m) => m.MapContainer),  { ssr: false })
const TileLayer     = dynamic(() => import('react-leaflet').then((m) => m.TileLayer),     { ssr: false })
const CircleMarker  = dynamic(() => import('react-leaflet').then((m) => m.CircleMarker),  { ssr: false })
const Tooltip       = dynamic(() => import('react-leaflet').then((m) => m.Tooltip),       { ssr: false })

interface AnalyticsMapProps {
  data: GeographyData[]
  loading?: boolean
  metric?: 'sessoes' | 'cliques' | 'conversoes'
}

interface MapPoint {
  cidade: string
  coords: [number, number]
  value: number
}

export function AnalyticsMap({ data, loading, metric = 'sessoes' }: AnalyticsMapProps) {
  const points = useMemo<MapPoint[]>(() => {
    if (!data.length) return []

    const agg: Record<string, number> = {}
    for (const item of data) {
      const key = item.cidade || item.estado || ''
      if (!key) continue
      const v = metric === 'sessoes'
        ? (item.sessoes ?? 0)
        : metric === 'cliques'
        ? (item.cliques ?? 0)
        : (item.conversoes ?? 0)
      agg[key] = (agg[key] ?? 0) + v
    }

    return Object.entries(agg)
      .map(([cidade, value]) => {
        const coords = getCityCoords(cidade)
        if (!coords) return null
        return { cidade, coords, value }
      })
      .filter(Boolean) as MapPoint[]
  }, [data, metric])

  if (loading) {
    return <div className="h-[14rem] rounded-xl skeleton-shimmer" />
  }

  if (points.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[14rem] text-ink-muted">
        <MapPin className="w-[2rem] h-[2rem] mb-[0.5rem] opacity-40" strokeWidth={1.5} />
        <p className="text-[0.875rem]">Sem dados geográficos para mapear</p>
      </div>
    )
  }

  const maxVal = Math.max(...points.map((p) => p.value), 1)

  return (
    <div className="h-[14rem] rounded-xl overflow-hidden border border-surface-border">
      <MapContainer
        center={[-15.0, -52.0]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />
        {points.map((p) => {
          const radius = 6 + (p.value / maxVal) * 18
          return (
            <CircleMarker
              key={p.cidade}
              center={p.coords}
              radius={radius}
              pathOptions={{
                color: '#FFA500',
                fillColor: '#FFA500',
                fillOpacity: 0.5,
                weight: 1.5,
              }}
            >
              <Tooltip sticky>
                <span className="text-[0.75rem] font-semibold">{p.cidade}</span>
                <br />
                <span className="text-[0.6875rem]">
                  {p.value.toLocaleString('pt-BR')}{' '}
                  {metric === 'sessoes' ? 'sessões' : metric === 'cliques' ? 'cliques' : 'conv.'}
                </span>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
