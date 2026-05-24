'use client'

import { Users, Eye, Clock, TrendingUp } from 'lucide-react'

interface GA4Data {
  sessoes: number
  usuarios_novos: number
  visualizacoes_pagina: number
  taxa_engajamento: number
  duracao_media_sessao: number
  taxa_rejeicao: number
  conversoes: number
  valor_conversao_total: number
}

interface GA4PanelProps {
  data: GA4Data | null
  loading?: boolean
}

const formatarTempo = (segundos: number) => {
  const min = Math.floor(segundos / 60)
  const seg = Math.floor(segundos % 60)
  return `${min}m ${seg}s`
}

export function GA4Panel({ data, loading }: GA4PanelProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-surface-hover animate-pulse" />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-ink-muted">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" strokeWidth={1.5} />
        <p className="text-sm">Dados do GA4 não disponíveis</p>
      </div>
    )
  }

  const kpis = [
    { label: 'Sessões', value: data.sessoes.toLocaleString('pt-BR'), icon: Eye },
    { label: 'Usuários', value: data.usuarios_novos.toLocaleString('pt-BR'), icon: Users },
    { label: 'Taxa Engajamento', value: `${data.taxa_engajamento.toFixed(1)}%`, icon: TrendingUp },
    { label: 'Duração Média', value: formatarTempo(data.duracao_media_sessao), icon: Clock },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <kpi.icon className="w-4 h-4 text-ads-500" strokeWidth={2} />
            <span className="text-xs text-ink-muted">{kpi.label}</span>
          </div>
          <p className="text-xl font-bold text-ink-primary">{kpi.value}</p>
        </div>
      ))}
    </div>
  )
}
