'use client'

import { useEffect, useState } from 'react'
import {
  DollarSign, UserPlus, CheckSquare, AlertTriangle,
  TrendingDown, Activity,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface FeedItem {
  id:          string
  tipo:        string
  descricao:   string
  created_at:  string
}

const TIPO_CONFIG: Record<string, {
  icon:  typeof Activity
  color: string
  bg:    string
}> = {
  pagamento_recebido: { icon: DollarSign,   color: 'text-status-green',  bg: 'bg-status-green/10'  },
  cliente_criado:     { icon: UserPlus,     color: 'text-status-blue',   bg: 'bg-status-blue/10'   },
  task_concluida:     { icon: CheckSquare,  color: 'text-ads-500',       bg: 'bg-ads-500/10'       },
  alerta:             { icon: AlertTriangle,color: 'text-status-orange', bg: 'bg-status-orange/10' },
  cancelado:          { icon: TrendingDown, color: 'text-status-red',    bg: 'bg-status-red/10'    },
}

function tempoRelativo(data: string): string {
  const diff = Math.floor((Date.now() - new Date(data).getTime()) / 1000)
  if (diff < 60)   return 'agora'
  if (diff < 3600) return `há ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`
  return `ontem`
}

export function ActivityFeed() {
  const [items,    setItems]    = useState<FeedItem[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      const h24 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      const { data } = await supabase
        .from('historico_acoes')
        .select('id, tipo_acao, descricao, created_at')
        .gte('created_at', h24)
        .order('created_at', { ascending: false })
        .limit(8)

      const typed = (data ?? []) as { id: string; tipo_acao: string; descricao: string; created_at: string }[]
      setItems(typed.map((r) => ({
        id:         r.id,
        tipo:       r.tipo_acao,
        descricao:  r.descricao,
        created_at: r.created_at,
      })))
      setLoading(false)
    }

    carregar()

    // Atualiza a cada 2 minutos
    const id = setInterval(carregar, 2 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-[0.5rem] p-[0.25rem]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[2.5rem] rounded-lg skeleton-shimmer" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center gap-[0.5rem] h-full text-ink-muted py-[2rem]">
        <Activity className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
        <p className="text-[0.8125rem]">Nenhuma atividade nas últimas 24h</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[0.25rem] overflow-y-auto">
      {items.map((item) => {
        const cfg = TIPO_CONFIG[item.tipo] ?? { icon: Activity, color: 'text-ink-muted', bg: 'bg-surface-hover' }
        const Icon = cfg.icon
        return (
          <div key={item.id} className="flex items-start gap-[0.625rem] px-[0.25rem] py-[0.375rem] rounded-lg hover:bg-surface-hover/50 transition-colors group">
            <div className={cn('w-[1.5rem] h-[1.5rem] rounded-md flex items-center justify-center shrink-0 mt-[0.0625rem]', cfg.bg)}>
              <Icon className={cn('w-[0.75rem] h-[0.75rem]', cfg.color)} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ink-secondary text-[0.8125rem] leading-snug line-clamp-2">{item.descricao}</p>
            </div>
            <span className="text-ink-muted text-[0.625rem] shrink-0 mt-[0.125rem] opacity-60 group-hover:opacity-100 transition-opacity">
              {tempoRelativo(item.created_at)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
