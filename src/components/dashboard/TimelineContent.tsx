'use client'

import { useState, useCallback, KeyboardEvent } from 'react'
import { CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { TimelineMessage } from './TimelineMessage'
import type { TimelineInstance, TimelineStep } from '@/lib/types/timeline'

interface TimelineContentProps {
  instance: TimelineInstance
  onStepComplete: (stepId: string, data: Record<string, string>) => Promise<void>
  onStepWait: (stepId: string) => Promise<void>
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  return (
    <div className="mb-[0.875rem]">
      <div className="flex justify-between items-center mb-[0.25rem]">
        <span className="text-[0.6875rem] text-ink-muted">{completed}/{total} steps</span>
        <span className="text-[0.6875rem] font-semibold text-ads-500">{pct}%</span>
      </div>
      <div className="h-[0.1875rem] bg-surface-hover rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-ads-500 to-ads-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function TimelineContent({ instance, onStepComplete, onStepWait }: TimelineContentProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const template = instance.template
  if (!template) return null

  const steps: TimelineStep[] = template.steps
  const currentStep = steps.find(s => s.id === instance.current_step_id)
  const completedCount = instance.completed_steps.length
  const totalCount = steps.length

  if (instance.status === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center py-[1.5rem] gap-[0.5rem] text-status-green">
        <CheckCircle2 className="w-[2rem] h-[2rem]" strokeWidth={1.5} />
        <p className="text-[0.875rem] font-semibold">Concluído!</p>
        <p className="text-[0.75rem] text-ink-muted text-center">Todos os steps foram completados</p>
      </div>
    )
  }

  if (!currentStep) {
    return (
      <div className="flex items-center justify-center py-[1.5rem] text-ink-muted text-[0.8125rem]">
        Nenhum step ativo
      </div>
    )
  }

  const handleComplete = useCallback(async () => {
    setSubmitting(true)
    try {
      await onStepComplete(currentStep.id, fieldValues)
      toast.success(`Step "${currentStep.title}" concluído!`, { icon: '✅' })
      setFieldValues({})
    } catch {
      toast.error('Erro ao completar step')
    } finally {
      setSubmitting(false)
    }
  }, [currentStep, fieldValues, onStepComplete])

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleComplete()
    }
  }

  return (
    <div className="flex flex-col gap-[0.75rem]" onKeyDown={handleKeyDown}>
      <ProgressBar completed={completedCount} total={totalCount} />

      {/* Current step header */}
      <div>
        <p className="text-[0.6875rem] text-ink-muted uppercase tracking-wide mb-[0.25rem]">Step atual</p>
        <h4 className="text-[0.9375rem] font-semibold text-ink-primary leading-tight">{currentStep.title}</h4>
        {currentStep.duration_days && (
          <div className="flex items-center gap-[0.25rem] mt-[0.25rem] text-ink-muted">
            <Clock className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.5} />
            <span className="text-[0.6875rem]">~{currentStep.duration_days}d estimado</span>
          </div>
        )}
      </div>

      {/* Messages */}
      {currentStep.messages && currentStep.messages.length > 0 && (
        <div className="flex flex-col gap-[0.375rem]">
          {currentStep.messages.map(msg => (
            <TimelineMessage key={msg.id} message={msg} />
          ))}
        </div>
      )}

      {/* Input fields */}
      {currentStep.input_fields && currentStep.input_fields.length > 0 && (
        <div className="flex flex-col gap-[0.5rem]">
          {currentStep.input_fields.map(field => (
            <div key={field.id}>
              <label className="block text-[0.6875rem] text-ink-secondary mb-[0.25rem] font-medium">
                {field.label}
                {field.required && <span className="text-status-red ml-[0.125rem]">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={fieldValues[field.id] ?? ''}
                  onChange={e => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full bg-surface-hover border border-surface-border rounded-lg px-[0.75rem] py-[0.5rem] text-[0.8125rem] text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-ads-500/60 focus:ring-1 focus:ring-ads-500/30 transition-colors resize-none"
                />
              ) : (
                <input
                  type={field.type === 'select' ? 'text' : field.type}
                  value={fieldValues[field.id] ?? ''}
                  onChange={e => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full bg-surface-hover border border-surface-border rounded-lg px-[0.75rem] py-[0.5rem] text-[0.8125rem] text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-ads-500/60 focus:ring-1 focus:ring-ads-500/30 transition-colors"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-[0.5rem] mt-[0.25rem]">
        <button
          onClick={handleComplete}
          disabled={submitting}
          className={cn(
            'flex-1 flex items-center justify-center gap-[0.375rem] h-[2.25rem] rounded-lg text-[0.8125rem] font-semibold',
            'bg-ads-500 text-black hover:bg-ads-400 active:scale-[0.97]',
            'transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {submitting
            ? <Loader2 className="w-[0.875rem] h-[0.875rem] animate-spin" />
            : <CheckCircle2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
          }
          Marcar como feito
        </button>
        <button
          onClick={() => onStepWait(currentStep.id)}
          className="px-[0.875rem] h-[2.25rem] rounded-lg text-[0.8125rem] text-ink-secondary
            bg-surface-hover hover:bg-surface-elevated border border-surface-border
            transition-all duration-150 active:scale-[0.97]"
        >
          Aguardando
        </button>
      </div>
      <p className="text-[0.625rem] text-ink-muted text-center">
        Ctrl+Enter para completar
      </p>
    </div>
  )
}
