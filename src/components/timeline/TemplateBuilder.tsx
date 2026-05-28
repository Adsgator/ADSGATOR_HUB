'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TemplateStep {
  id?: string
  ordem: number
  titulo: string
  mensagem_count: number
  input_count: number
}

export interface TemplateData {
  id?: string
  nome: string
  tipo: 'onboarding' | 'recurring_task' | 'alert'
  descricao: string
  cor: string
  icone: string
  steps: TemplateStep[]
}

interface TemplateBuilderProps {
  initial?: TemplateData
  onSaved?: (template: TemplateData) => void
  onCancel?: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPO_OPTIONS: Array<{ value: TemplateData['tipo']; label: string }> = [
  { value: 'onboarding',      label: 'Onboarding'     },
  { value: 'recurring_task',  label: 'Tarefa Recorrente' },
  { value: 'alert',           label: 'Alerta'          },
]

const DEFAULT_STEP = (): TemplateStep => ({
  ordem:          1,
  titulo:         '',
  mensagem_count: 0,
  input_count:    0,
})

// ─── Component ───────────────────────────────────────────────────────────────

export function TemplateBuilder({ initial, onSaved, onCancel }: TemplateBuilderProps) {
  const [nome,     setNome]     = useState(initial?.nome     ?? '')
  const [tipo,     setTipo]     = useState<TemplateData['tipo']>(initial?.tipo ?? 'onboarding')
  const [descricao, setDescricao] = useState(initial?.descricao ?? '')
  const [cor,      setCor]      = useState(initial?.cor      ?? '#FFB100')
  const [icone,    setIcone]    = useState(initial?.icone    ?? 'CheckCircle2')
  const [steps,    setSteps]    = useState<TemplateStep[]>(initial?.steps ?? [{ ...DEFAULT_STEP() }])
  const [saving,   setSaving]   = useState(false)

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { ...DEFAULT_STEP(), ordem: prev.length + 1 },
    ])
  }

  function removeStep(index: number) {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, ordem: i + 1 }))
    )
  }

  function updateStep(index: number, field: keyof TemplateStep, value: string | number) {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  async function handleSave() {
    if (!nome.trim()) {
      toast.error('Informe o nome do template.')
      return
    }
    setSaving(true)
    try {
      const payload: TemplateData = { nome, tipo, descricao, cor, icone, steps }
      if (initial?.id) payload.id = initial.id

      const res = await fetch('/api/v1/timeline-templates', {
        method:  initial?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao salvar.')
      toast.success('Template salvo com sucesso.')
      onSaved?.(data.template ?? payload)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar template.'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl card-shadow">
      {/* Header */}
      <div className="px-[1.5rem] py-[1.25rem] border-b border-surface-border">
        <h3 className="text-ink-primary font-semibold text-[0.9375rem]">
          {initial?.id ? 'Editar Template' : 'Novo Template'}
        </h3>
      </div>

      <div className="p-[1.5rem] space-y-[1.25rem]">
        {/* Row 1: Nome + Tipo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1rem]">
          <div>
            <label className="block text-ink-secondary text-[0.75rem] font-semibold mb-[0.375rem]">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Onboarding Premium"
              className="w-full h-[2.25rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-ink-secondary text-[0.75rem] font-semibold mb-[0.375rem]">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TemplateData['tipo'])}
              className="w-full h-[2.25rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
            >
              {TIPO_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-ink-secondary text-[0.75rem] font-semibold mb-[0.375rem]">Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={2}
            placeholder="Descreva o objetivo deste template…"
            className="w-full px-[0.75rem] py-[0.5rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors resize-none"
          />
        </div>

        {/* Row: Cor + Ícone */}
        <div className="grid grid-cols-2 gap-[1rem]">
          <div>
            <label className="block text-ink-secondary text-[0.75rem] font-semibold mb-[0.375rem]">Cor</label>
            <div className="flex items-center gap-[0.5rem]">
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="w-[2.25rem] h-[2.25rem] rounded-[0.375rem] border border-surface-border bg-surface-hover cursor-pointer"
              />
              <input
                type="text"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="flex-1 h-[2.25rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] font-mono focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-ink-secondary text-[0.75rem] font-semibold mb-[0.375rem]">Ícone (lucide-react)</label>
            <input
              type="text"
              value={icone}
              onChange={(e) => setIcone(e.target.value)}
              placeholder="Ex: CheckCircle2"
              className="w-full h-[2.25rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] font-mono placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
            />
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-[0.75rem]">
            <label className="text-ink-secondary text-[0.75rem] font-semibold">
              Etapas ({steps.length})
            </label>
            <button
              onClick={addStep}
              className="flex items-center gap-[0.25rem] text-ads-500 text-[0.75rem] font-medium hover:text-ads-600 transition-colors"
            >
              <Plus className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} />
              Adicionar etapa
            </button>
          </div>

          <div className="space-y-[0.625rem]">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-[0.625rem] bg-surface-hover border border-surface-border rounded-[0.5rem] px-[0.875rem] py-[0.625rem]"
              >
                <span className="w-[1.5rem] h-[1.5rem] rounded-full bg-ads-500/20 text-ads-500 text-[0.6875rem] font-bold flex items-center justify-center shrink-0">
                  {step.ordem}
                </span>
                <input
                  type="text"
                  value={step.titulo}
                  onChange={(e) => updateStep(i, 'titulo', e.target.value)}
                  placeholder={`Título da etapa ${step.ordem}`}
                  className="flex-1 h-[1.875rem] px-[0.625rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
                />
                <div className="flex items-center gap-[0.25rem] shrink-0">
                  <span className="text-ink-muted text-[0.6875rem]">Msg:</span>
                  <input
                    type="number"
                    min={0}
                    value={step.mensagem_count}
                    onChange={(e) => updateStep(i, 'mensagem_count', Number(e.target.value))}
                    className="w-[3rem] h-[1.875rem] px-[0.375rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] text-center focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-[0.25rem] shrink-0">
                  <span className="text-ink-muted text-[0.6875rem]">In:</span>
                  <input
                    type="number"
                    min={0}
                    value={step.input_count}
                    onChange={(e) => updateStep(i, 'input_count', Number(e.target.value))}
                    className="w-[3rem] h-[1.875rem] px-[0.375rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] text-center focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
                  />
                </div>
                <button
                  onClick={() => removeStep(i)}
                  disabled={steps.length === 1}
                  className={cn(
                    'w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded-[0.375rem] transition-colors shrink-0',
                    steps.length === 1
                      ? 'text-ink-muted cursor-not-allowed'
                      : 'text-status-red hover:bg-status-red/10'
                  )}
                >
                  <Trash2 className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-[0.625rem] pt-[0.5rem] border-t border-surface-border">
          {onCancel && (
            <button
              onClick={onCancel}
              className="h-[2rem] px-[0.875rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] font-medium hover:border-surface-border/80 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-[0.375rem] h-[2rem] px-[0.875rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors disabled:opacity-50"
          >
            {saving
              ? <Loader2 className="w-[0.75rem] h-[0.75rem] animate-spin" strokeWidth={2} />
              : <Save className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            }
            Salvar Template
          </button>
        </div>
      </div>
    </div>
  )
}
