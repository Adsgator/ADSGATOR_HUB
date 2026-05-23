'use client'

import { TrendingUp, MousePointerClick, Eye, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdsKpiData {
  impressoes: number
  cliques: number
  ctr: number
  custo_total: number
  conversoes: number
  cpa: number
  roas: number
}

interface AdsOverviewKpisProps {
  data: AdsKpiData
  loading?: boolean
}

const KpiItem = ({ 
  label, 
  value, 
  icon: Icon, 
  accent = 'amber',
  prefix = '',
  suffix = '',
  decimals = 0
}: { 
  label: string
  value: number
  icon: typeof TrendingUp
  accent?: 'amber' | 'green' | 'blue'
  prefix?: string
  suffix?: string
  decimals?: number
}) => {
  const formatted = decimals > 0 
    ? value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(value).toLocaleString('pt-BR')

  const accentColors = {
    amber: 'bg-ads-500/10 text-ads-500 border-ads-500/20',
    green: 'bg-status-green/10 text-status-green border-status-green/20',
    blue: 'bg-status-blue/10 text-status-blue border-status-blue/20',
  }

  return (
    <div className={cn(
      'flex items-center gap-3 p-4 rounded-xl border',
      accentColors[accent]
    )}>
      <div className="p-2 rounded-lg bg-surface-card">
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
      <div>
        <p className="text-xs font-medium opacity-80">{label}</p>
        <p className="text-xl font-bold">
          {prefix}{formatted}{suffix}
        </p>
      </div>
    </div>
  )
}

export function AdsOverviewKpis({ data, loading }: AdsOverviewKpisProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-surface-hover animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiItem
        label="Impressões"
        value={data.impressoes}
        icon={Eye}
        accent="blue"
      />
      <KpiItem
        label="Cliques"
        value={data.cliques}
        icon={MousePointerClick}
        accent="amber"
      />
      <KpiItem
        label="CTR"
        value={data.ctr}
        icon={TrendingUp}
        accent="green"
        suffix="%"
        decimals={2}
      />
      <KpiItem
        label="Custo Total"
        value={data.custo_total}
        icon={DollarSign}
        accent="amber"
        prefix="R$ "
        decimals={2}
      />
    </div>
  )
}
