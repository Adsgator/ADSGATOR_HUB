'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Target, TrendingUp, Users, DollarSign, Percent } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface Meta {
  id: string
  titulo: string
  descricao: string | null
  tipo: 'mrr' | 'clientes' | 'conversoes' | 'lucro'
  valor_alvo: number
  valor_atual: number
  periodo: 'mensal' | 'trimestral' | 'anual'
  data_inicio: string | null
  data_fim: string | null
  ativa: boolean
}

const TIPO_CONFIG = {
  mrr: {
    label: 'MRR',
    icon: DollarSign,
    badgeClass: 'bg-status-green/10 text-status-green',
  },
  clientes: {
    label: 'Clientes',
    icon: Users,
    badgeClass: 'bg-status-blue/10 text-status-blue',
  },
  conversoes: {
    label: 'Conversões',
    icon: Percent,
    badgeClass: 'bg-status-purple/10 text-status-purple',
  },
  lucro: {
    label: 'Lucro',
    icon: TrendingUp,
    badgeClass: 'bg-status-yellow/10 text-status-yellow',
  },
}

const PERIODO_LABEL: Record<string, string> = {
  mensal: 'Mensal',
  trimestral: 'Trimestral',
  anual: 'Anual',
}

function formatValor(tipo: Meta['tipo'], valor: number): string {
  if (tipo === 'mrr' || tipo === 'lucro') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(valor)
  }
  if (tipo === 'clientes') {
    return `${Math.round(valor)} clientes`
  }
  return `${Math.round(valor)}%`
}

function getDiasRestantes(dataFim: string): number | null {
  const fim = new Date(dataFim)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  fim.setHours(0, 0, 0, 0)
  const diff = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

function getProgressoColor(progresso: number): string {
  if (progresso >= 80) return 'bg-status-green'
  if (progresso >= 50) return 'bg-status-orange'
  return 'bg-status-red'
}

export function GoalsCard() {
  const [metas, setMetas] = useState<Meta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetas() {
      const { data } = await supabase
        .from('metas')
        .select('*')
        .eq('ativa', true)
        .order('data_fim', { ascending: true })

      setMetas((data as Meta[]) ?? [])
      setLoading(false)
    }

    fetchMetas()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-[0.75rem]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[4rem] rounded-xl skeleton-shimmer" />
        ))}
      </div>
    )
  }

  if (metas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-[0.75rem] py-[2rem] text-center">
        <Target className="w-[2rem] h-[2rem] text-ink-muted opacity-50" />
        <p className="text-sm text-ink-secondary">Nenhuma meta ativa</p>
        <Link
          href="/configuracoes"
          className="text-xs text-ads-500 hover:text-ads-400 transition-colors"
        >
          Configurar metas →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[0.875rem]">
      {metas.map((meta) => {
        const progresso = Math.min(100, Math.max(0, (meta.valor_atual / meta.valor_alvo) * 100))
        const progressoColor = getProgressoColor(progresso)
        const config = TIPO_CONFIG[meta.tipo] ?? TIPO_CONFIG.mrr
        const diasRestantes = meta.data_fim ? getDiasRestantes(meta.data_fim) : null
        const alertaDias = diasRestantes !== null && diasRestantes >= 0 && diasRestantes < 30

        return (
          <div key={meta.id} className="flex flex-col gap-[0.5rem]">
            {/* Header */}
            <div className="flex items-center justify-between gap-[0.5rem]">
              <div className="flex items-center gap-[0.375rem] min-w-0">
                <span className="text-[0.875rem] font-medium text-ink-primary truncate">
                  {meta.titulo}
                </span>
                <span
                  className={cn(
                    'shrink-0 px-[0.375rem] py-[0.0625rem] rounded-full text-[0.6875rem] font-medium',
                    config.badgeClass
                  )}
                >
                  {config.label}
                </span>
              </div>
              <span className="shrink-0 px-[0.375rem] py-[0.0625rem] rounded-full text-[0.6875rem] text-ink-muted bg-surface-hover">
                {PERIODO_LABEL[meta.periodo] ?? meta.periodo}
              </span>
            </div>

            {/* Barra de progresso */}
            <div className="w-full h-[0.375rem] bg-surface-hover rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-700', progressoColor)}
                style={{ width: `${progresso}%` }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[0.375rem]">
                <span className="text-[0.75rem] text-ink-secondary">
                  {formatValor(meta.tipo, meta.valor_atual)}
                  <span className="text-ink-muted mx-[0.25rem]">/</span>
                  {formatValor(meta.tipo, meta.valor_alvo)}
                </span>
                {alertaDias && (
                  <span className="text-[0.6875rem] text-status-orange font-medium">
                    {diasRestantes === 0 ? 'Hoje' : `${diasRestantes}d restantes`}
                  </span>
                )}
              </div>
              <span className="text-[0.75rem] font-medium text-ink-secondary">
                {progresso.toFixed(0)}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
