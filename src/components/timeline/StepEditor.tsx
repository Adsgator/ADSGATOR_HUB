'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimelineStep, TimelineMessage, TimelineInputField } from '@/lib/types/timeline'

interface StepEditorProps {
  step: TimelineStep | null
  stepIndex: number
  totalSteps: number
  onSave: (step: TimelineStep) => void
  onClose: () => void
}

const STEP_TYPES: { value: TimelineStep['type']; label: string }[] = [
  { value: 'info',   label: 'Instrução' },
  { value: 'action', label: 'Ação' },
  { value: 'wait',   label: 'Aguardar' },
  { value: 'check',  label: 'Revisão' },
]

const MESSAGE_ROLES: { value: TimelineMessage['role']; label: string }[] = [
  { value: 'instruction',  label: 'Instrução' },
  { value: 'user_action',  label: 'Ação do usuário' },
  { value: 'template',     label: 'Template' },
]

const INPUT_TYPES: { value: TimelineInputField['type']; label: string }[] = [
  { value: 'text',     label: 'Texto' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select',   label: 'Seleção' },
  { value: 'email',    label: 'Email' },
  { value: 'url',      label: 'URL' },
  { value: 'number',   label: 'Número' },
]

function emptyMessage(): TimelineMessage {
  return {
    id: crypto.randomUUID(),
    role: 'instruction',
    text: '',
    copyable: false,
  }
}

function emptyInputField(): TimelineInputField {
  return {
    id: crypto.randomUUID(),
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
  }
}

export function StepEditor({ step, stepIndex, totalSteps, onSave, onClose }: StepEditorProps) {
  const isNew = step === null

  const [title,        setTitle]        = useState(step?.title ?? '')
  const [type,         setType]         = useState<TimelineStep['type']>(step?.type ?? 'action')
  const [durationDays, setDurationDays] = useState<number | ''>(step?.duration_days ?? '')
  const [prereq,       setPrereq]       = useState(step?.prerequisite ?? '')
  const [messages,     setMessages]     = useState<TimelineMessage[]>(step?.messages ?? [])
  const [inputFields,  setInputFields]  = useState<TimelineInputField[]>(step?.input_fields ?? [])

  function handleSave() {
    if (!title.trim()) return
    const saved: TimelineStep = {
      id:             step?.id ?? crypto.randomUUID(),
      order:          step?.order ?? stepIndex,
      title:          title.trim(),
      type,
      duration_days:  durationDays !== '' ? Number(durationDays) : undefined,
      prerequisite:   prereq || undefined,
      content:        step?.content,
      messages,
      input_fields:   inputFields.length > 0 ? inputFields : undefined,
    }
    onSave(saved)
  }

  // Messages helpers
  function addMessage() {
    setMessages((prev) => [...prev, emptyMessage()])
  }
  function updateMessage(idx: number, patch: Partial<TimelineMessage>) {
    setMessages((prev) => prev.map((m, i) => i === idx ? { ...m, ...patch } : m))
  }
  function removeMessage(idx: number) {
    setMessages((prev) => prev.filter((_, i) => i !== idx))
  }

  // Input fields helpers
  function addInputField() {
    setInputFields((prev) => [...prev, emptyInputField()])
  }
  function updateInputField(idx: number, patch: Partial<TimelineInputField>) {
    setInputFields((prev) => prev.map((f, i) => i === idx ? { ...f, ...patch } : f))
  }
  function removeInputField(idx: number) {
    setInputFields((prev) => prev.filter((_, i) => i !== idx))
  }

  const otherStepIndices = Array.from({ length: totalSteps }, (_, i) => i).filter((i) => i !== stepIndex)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-[1rem]">
      <div className="max-w-2xl w-full bg-surface-card border border-surface-border rounded-2xl flex flex-col max-h-[90vh] animate-fade-scale">

        {/* Header */}
        <div className="flex items-center justify-between px-[1.5rem] py-[1.125rem] border-b border-surface-border">
          <h2 className="text-ink-primary text-[1rem] font-semibold">
            {isNew ? 'Novo Step' : 'Editar Step'}
          </h2>
          <button
            onClick={onClose}
            className="w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded-lg text-ink-muted hover:text-ink-secondary hover:bg-surface-hover transition-colors"
          >
            <X className="w-[1rem] h-[1rem]" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-[1.5rem] py-[1.25rem] space-y-[1.25rem]">

          {/* Título */}
          <div className="space-y-[0.375rem]">
            <label className="text-ink-secondary text-[0.8125rem] font-medium">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do step"
              className="w-full h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] placeholder:text-ink-muted focus:outline-none focus:border-ads-500/60 focus:ring-2 focus:ring-ads-500/10 transition-colors"
            />
          </div>

          {/* Tipo + Duração */}
          <div className="grid grid-cols-2 gap-[0.75rem]">
            <div className="space-y-[0.375rem]">
              <label className="text-ink-secondary text-[0.8125rem] font-medium">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TimelineStep['type'])}
                className="w-full h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:border-ads-500/60 focus:ring-2 focus:ring-ads-500/10 transition-colors"
              >
                {STEP_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-[0.375rem]">
              <label className="text-ink-secondary text-[0.8125rem] font-medium">Duração estimada (dias)</label>
              <input
                type="number"
                min={0}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="—"
                className="w-full h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] placeholder:text-ink-muted focus:outline-none focus:border-ads-500/60 focus:ring-2 focus:ring-ads-500/10 transition-colors"
              />
            </div>
          </div>

          {/* Prerequisite */}
          <div className="space-y-[0.375rem]">
            <label className="text-ink-secondary text-[0.8125rem] font-medium">Pré-requisito (step anterior)</label>
            <select
              value={prereq}
              onChange={(e) => setPrereq(e.target.value)}
              className="w-full h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:border-ads-500/60 focus:ring-2 focus:ring-ads-500/10 transition-colors"
            >
              <option value="">Nenhum</option>
              {otherStepIndices.map((i) => (
                <option key={i} value={String(i)}>Step {i + 1}</option>
              ))}
            </select>
          </div>

          {/* Messages */}
          <div className="space-y-[0.5rem]">
            <div className="flex items-center justify-between">
              <label className="text-ink-secondary text-[0.8125rem] font-medium">Mensagens</label>
              <button
                type="button"
                onClick={addMessage}
                className="flex items-center gap-[0.25rem] text-ads-500 hover:text-ads-600 text-[0.8125rem] transition-colors"
              >
                <Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                Adicionar
              </button>
            </div>
            {messages.length === 0 && (
              <p className="text-ink-muted text-[0.8125rem] italic">Nenhuma mensagem.</p>
            )}
            <div className="space-y-[0.75rem]">
              {messages.map((msg, idx) => (
                <div key={msg.id} className="bg-surface-hover border border-surface-border rounded-xl p-[0.875rem] space-y-[0.625rem]">
                  <div className="flex items-center justify-between gap-[0.5rem]">
                    <select
                      value={msg.role}
                      onChange={(e) => updateMessage(idx, { role: e.target.value as TimelineMessage['role'] })}
                      className="h-[1.875rem] px-[0.5rem] rounded-lg bg-surface-card border border-surface-border text-ink-secondary text-[0.8125rem] focus:outline-none focus:border-ads-500/60 transition-colors"
                    >
                      {MESSAGE_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-[0.75rem]">
                      <label className="flex items-center gap-[0.375rem] text-ink-muted text-[0.75rem] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={msg.copyable ?? false}
                          onChange={(e) => updateMessage(idx, { copyable: e.target.checked })}
                          className="rounded border-surface-border accent-ads-500"
                        />
                        Copiável
                      </label>
                      <button
                        type="button"
                        onClick={() => removeMessage(idx)}
                        className="text-ink-muted hover:text-status-red transition-colors"
                      >
                        <Trash2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={msg.text}
                    onChange={(e) => updateMessage(idx, { text: e.target.value })}
                    placeholder="Texto da mensagem…"
                    rows={3}
                    className="w-full px-[0.75rem] py-[0.5rem] rounded-lg bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] placeholder:text-ink-muted focus:outline-none focus:border-ads-500/60 focus:ring-2 focus:ring-ads-500/10 transition-colors resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-[0.5rem]">
            <div className="flex items-center justify-between">
              <label className="text-ink-secondary text-[0.8125rem] font-medium">Campos de entrada</label>
              <button
                type="button"
                onClick={addInputField}
                className="flex items-center gap-[0.25rem] text-ads-500 hover:text-ads-600 text-[0.8125rem] transition-colors"
              >
                <Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                Adicionar
              </button>
            </div>
            {inputFields.length === 0 && (
              <p className="text-ink-muted text-[0.8125rem] italic">Nenhum campo de entrada.</p>
            )}
            <div className="space-y-[0.75rem]">
              {inputFields.map((field, idx) => (
                <div key={field.id} className="bg-surface-hover border border-surface-border rounded-xl p-[0.875rem] space-y-[0.625rem]">
                  <div className="flex items-center justify-between gap-[0.5rem]">
                    <span className="text-ink-muted text-[0.75rem]">Campo {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeInputField(idx)}
                      className="text-ink-muted hover:text-status-red transition-colors"
                    >
                      <Trash2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-[0.5rem]">
                    <div className="space-y-[0.25rem]">
                      <label className="text-ink-muted text-[0.75rem]">Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateInputField(idx, { label: e.target.value })}
                        placeholder="Nome do campo"
                        className="w-full h-[1.875rem] px-[0.5rem] rounded-lg bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] placeholder:text-ink-muted focus:outline-none focus:border-ads-500/60 transition-colors"
                      />
                    </div>
                    <div className="space-y-[0.25rem]">
                      <label className="text-ink-muted text-[0.75rem]">Tipo</label>
                      <select
                        value={field.type}
                        onChange={(e) => updateInputField(idx, { type: e.target.value as TimelineInputField['type'] })}
                        className="w-full h-[1.875rem] px-[0.5rem] rounded-lg bg-surface-card border border-surface-border text-ink-secondary text-[0.8125rem] focus:outline-none focus:border-ads-500/60 transition-colors"
                      >
                        {INPUT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-[0.25rem]">
                    <label className="text-ink-muted text-[0.75rem]">Placeholder</label>
                    <input
                      type="text"
                      value={field.placeholder ?? ''}
                      onChange={(e) => updateInputField(idx, { placeholder: e.target.value })}
                      placeholder="Texto de ajuda…"
                      className="w-full h-[1.875rem] px-[0.5rem] rounded-lg bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] placeholder:text-ink-muted focus:outline-none focus:border-ads-500/60 transition-colors"
                    />
                  </div>
                  <label className="flex items-center gap-[0.375rem] text-ink-muted text-[0.75rem] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={field.required ?? false}
                      onChange={(e) => updateInputField(idx, { required: e.target.checked })}
                      className="rounded border-surface-border accent-ads-500"
                    />
                    Obrigatório
                  </label>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[0.5rem] px-[1.5rem] py-[1rem] border-t border-surface-border">
          <button
            type="button"
            onClick={onClose}
            className="h-[2.25rem] px-[1rem] rounded-lg bg-surface-hover border border-surface-border text-ink-secondary text-[0.875rem] font-medium hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className={cn(
              'h-[2.25rem] px-[1.25rem] rounded-lg text-[0.875rem] font-semibold transition-colors',
              title.trim()
                ? 'bg-ads-500 hover:bg-ads-600 text-white'
                : 'bg-ads-500/30 text-ads-500/50 cursor-not-allowed',
            )}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
