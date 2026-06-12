'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Clock, DollarSign, UserPlus, CheckSquare, AlertTriangle,
  Snowflake, Play, MessageCircle, Settings, Filter,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface AuditLog {
  id:          string
  acao:        string
  descricao?:  string
  created_at:  string
}

const TIPO_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pagamento:      { icon: DollarSign,     color: 'text-status-green  bg-status-green/15',  label: 'Pagamento'    },
  cliente_criado: { icon: UserPlus,       color: 'text-status-blue   bg-status-blue/15',   label: 'Criação'      },
  task:           { icon: CheckSquare,    color: 'text-ads-500        bg-ads-500/15',       label: 'Tarefa'       },
  alerta:         { icon: AlertTriangle,  color: 'text-status-orange  bg-status-orange/15', label: 'Alerta'       },
  congelado:      { icon: Snowflake,      color: 'text-status-blue   bg-status-blue/15',   label: 'Congelado'    },
  ativado:        { icon: Play,           color: 'text-status-green  bg-status-green/15',  label: 'Ativado'      },
  mensagem:       { icon: MessageCircle,  color: 'text-status-purple bg-status-purple/15', label: 'Mensagem'     },
  config:         { icon: Settings,       color: 'text-ink-muted     bg-surface-elevated', label: 'Configuração' },
}

const TIPOS_FILTRO = [
  { value: '',           label: 'Todos' },
  { value: 'pagamento',  label: 'Pagamentos' },
  { value: 'task',       label: 'Tarefas' },
  { value: 'alerta',     label: 'Alertas' },
  { value: 'mensagem',   label: 'Mensagens' },
]

function getTipoConfig(acao: string) {
  const key = Object.keys(TIPO_CONFIG).find((k) => acao.toLowerCase().includes(k))
  return TIPO_CONFIG[key ?? ''] ?? { icon: Clock, color: 'text-ink-muted bg-surface-elevated', label: 'Evento' }
}

function tempoRelativo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)  return 'agora'
  if (min < 60) return `há ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24)   return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1)  return 'ontem'
  if (d < 30)   return `há ${d} dias`
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function AuditTimeline({ clienteId }: { clienteId: string }) {
  const [logs,         setLogs]        = useState<AuditLog[]>([])
  const [loading,      setLoading]     = useState(true)
  const [filtroTipo,   setFiltroTipo]  = useState('')
  const [mostrarFiltro, setMostrarFiltro] = useState(false)

  useEffect(() => {
    setLoading(true)
    supabase
      .from('historico_acoes')
      .select('id, acao:tipo_acao, descricao, created_at')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setLogs(data ?? [])
        setLoading(false)
      })
  }, [clienteId])

  const filtrados = useMemo(() =>
    filtroTipo
      ? logs.filter((l) => l.acao.toLowerCase().includes(filtroTipo))
      : logs,
    [logs, filtroTipo]
  )

  if (!loading && logs.length === 0) return null

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl card-shadow p-[1.25rem]">
      {/* Header */}
      <div className="flex items-center justify-between mb-[1rem]">
        <div className="flex items-center gap-[0.5rem]">
          <Clock className="w-[1rem] h-[1rem] text-ink-muted" strokeWidth={1.75} />
          <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Histórico</h3>
          {logs.length > 0 && (
            <span className="text-[0.6875rem] font-medium px-[0.375rem] py-[0.0625rem] rounded-full bg-surface-elevated text-ink-muted">
              {filtrados.length}
            </span>
          )}
        </div>
        {logs.length > 0 && (
          <button
            onClick={() => setMostrarFiltro(!mostrarFiltro)}
            className={cn(
              'w-[1.75rem] h-[1.75rem] rounded-lg flex items-center justify-center transition-colors',
              mostrarFiltro || filtroTipo
                ? 'bg-ads-500/15 text-ads-500'
                : 'text-ink-muted hover:text-ink-primary hover:bg-surface-hover'
            )}
            title="Filtrar"
          >
            <Filter className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Filtros */}
      {mostrarFiltro && (
        <div className="flex gap-[0.375rem] flex-wrap mb-[1rem]">
          {TIPOS_FILTRO.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFiltroTipo(value)}
              className={cn(
                'h-[1.75rem] px-[0.5rem] rounded-lg text-[0.75rem] font-medium transition-colors',
                filtroTipo === value
                  ? 'bg-ads-500 text-white'
                  : 'bg-surface-hover text-ink-secondary hover:text-ink-primary border border-surface-border/40'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-[0.875rem]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-[0.75rem] items-start">
              <div className="w-[1.75rem] h-[1.75rem] rounded-full skeleton-shimmer shrink-0" />
              <div className="flex-1 space-y-[0.25rem]">
                <div className="h-[0.875rem] rounded skeleton-shimmer w-3/4" />
                <div className="h-[0.75rem] rounded skeleton-shimmer w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <p className="text-ink-muted text-[0.875rem] text-center py-[1.5rem]">
          Nenhum evento encontrado.
        </p>
      ) : (
        <div className="relative">
          <div className="absolute left-[0.875rem] top-0 bottom-0 w-px bg-surface-border" />
          <ul className="space-y-[0.875rem]">
            {filtrados.map((log) => {
              const cfg  = getTipoConfig(log.acao)
              const Icon = cfg.icon
              return (
                <li key={log.id} className="flex gap-[0.875rem] items-start pl-[1.75rem] relative">
                  <div className={cn(
                    'absolute left-0 top-[0.125rem] w-[1.75rem] h-[1.75rem] rounded-full flex items-center justify-center shrink-0',
                    cfg.color
                  )}>
                    <Icon className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink-secondary text-[0.875rem] leading-snug">
                      {log.descricao ?? log.acao}
                    </p>
                    <p className="text-ink-muted text-[0.6875rem] mt-[0.125rem]">
                      {tempoRelativo(log.created_at)}
                      <span className="mx-[0.25rem]">·</span>
                      {new Date(log.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
