'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, CheckSquare, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TimelineContent } from './TimelineContent'
import type { TimelineInstance, TimelineType } from '@/lib/types/timeline'

interface TimelineCardProps {
  type: TimelineType
  clienteId?: string
}

const TYPE_CONFIG = {
  onboarding: {
    icon: CheckSquare,
    title: 'Onboarding',
    color: 'text-ads-500',
    bg: 'bg-ads-500/10',
  },
  recurring_task: {
    icon: Clock,
    title: 'Tarefas Recorrentes',
    color: 'text-status-blue',
    bg: 'bg-status-blue/10',
  },
  alert: {
    icon: AlertTriangle,
    title: 'Alertas',
    color: 'text-status-red',
    bg: 'bg-status-red/10',
  },
}

export function TimelineCard({ type, clienteId }: TimelineCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [instances, setInstances] = useState<TimelineInstance[]>([])
  const [activeInstanceIdx, setActiveInstanceIdx] = useState(0)
  const [loading, setLoading] = useState(false)

  const config = TYPE_CONFIG[type]
  const Icon = config.icon

  const fetchInstances = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type })
      if (clienteId) params.set('clienteId', clienteId)
      const res = await fetch(`/api/v1/timelines?${params}`)
      if (!res.ok) return
      const json = await res.json()
      setInstances(json.data ?? [])
    } catch {
      // non-critical
    } finally {
      setLoading(false)
    }
  }, [type, clienteId])

  useEffect(() => {
    if (expanded && instances.length === 0) {
      fetchInstances()
    }
  }, [expanded, fetchInstances, instances.length])

  const activeInstances = instances.filter(i => i.status === 'active')
  const activeInstance = activeInstances[activeInstanceIdx]
  const totalActive = activeInstances.length
  const totalCompleted = instances.filter(i => i.status === 'completed').length

  const handleStepComplete = async (stepId: string, data: Record<string, string>) => {
    if (!activeInstance) return
    const res = await fetch(`/api/v1/timelines/${activeInstance.id}/step/${stepId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    })
    if (!res.ok) throw new Error('Erro ao completar step')
    await fetchInstances()
  }

  const handleStepWait = async (stepId: string) => {
    if (!activeInstance) return
    await fetch(`/api/v1/timelines/${activeInstance.id}/step/${stepId}/wait`, {
      method: 'POST',
    })
    await fetchInstances()
  }

  return (
    <div className="h-full flex flex-col bg-surface-card rounded-2xl overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-[0.75rem] px-[1rem] py-[0.875rem] hover:bg-surface-hover/50 transition-colors w-full text-left"
      >
        <div className={cn('w-[2rem] h-[2rem] rounded-lg flex items-center justify-center flex-shrink-0', config.bg)}>
          <Icon className={cn('w-[1rem] h-[1rem]', config.color)} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[0.875rem] font-semibold text-ink-primary leading-tight">{config.title}</p>
          <p className="text-[0.6875rem] text-ink-muted">
            {totalActive > 0 ? `${totalActive} ativo${totalActive > 1 ? 's' : ''}` : 'Nenhum ativo'}
            {totalCompleted > 0 && ` · ${totalCompleted} concluído${totalCompleted > 1 ? 's' : ''}`}
          </p>
        </div>
        {totalActive > 0 && (
          <span className={cn(
            'px-[0.5rem] py-[0.125rem] rounded-full text-[0.625rem] font-bold flex-shrink-0',
            config.bg, config.color
          )}>
            {totalActive}
          </span>
        )}
        <ChevronDown
          className={cn(
            'w-[1rem] h-[1rem] text-ink-muted flex-shrink-0 transition-transform duration-300',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {/* Expandable content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          expanded ? 'flex-1' : 'max-h-0'
        )}
      >
        <div className="px-[1rem] pb-[1rem] h-full overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-[2rem]">
              <Loader2 className="w-[1.25rem] h-[1.25rem] animate-spin text-ads-500" />
            </div>
          ) : activeInstances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[1.5rem] gap-[0.5rem] text-ink-muted">
              <Icon className="w-[1.75rem] h-[1.75rem]" strokeWidth={1} />
              <p className="text-[0.8125rem]">Nenhuma instância ativa</p>
              <a href="/configuracoes/templates" className="text-[0.75rem] text-ads-500 hover:underline">
                Gerenciar templates →
              </a>
            </div>
          ) : (
            <>
              {/* Instance selector if multiple */}
              {activeInstances.length > 1 && (
                <div className="flex gap-[0.25rem] mb-[0.75rem] overflow-x-auto pb-[0.125rem]">
                  {activeInstances.map((inst, idx) => (
                    <button
                      key={inst.id}
                      onClick={() => setActiveInstanceIdx(idx)}
                      className={cn(
                        'px-[0.625rem] py-[0.25rem] rounded-lg text-[0.6875rem] font-medium whitespace-nowrap transition-colors',
                        idx === activeInstanceIdx
                          ? `${config.bg} ${config.color}`
                          : 'bg-surface-hover text-ink-muted hover:text-ink-primary'
                      )}
                    >
                      {inst.template?.name ?? `#${idx + 1}`}
                    </button>
                  ))}
                </div>
              )}

              {activeInstance && (
                <TimelineContent
                  instance={activeInstance}
                  onStepComplete={handleStepComplete}
                  onStepWait={handleStepWait}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
