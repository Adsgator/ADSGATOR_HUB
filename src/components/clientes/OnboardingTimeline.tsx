'use client'

import { useMemo, useState } from 'react'
import {
  Check, Clock, User, Building2, MessageCircle, Copy,
  ChevronRight, ChevronDown, Loader2, Bell, Pencil, RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { interpolar, montarVars } from '@/lib/timeline-vars'
import type { Cliente } from '@/lib/types'
import type { TimelineInstance, TimelineStep, TimelineMessage, TimelineInputField } from '@/lib/types/timeline'

interface Props {
  instance: TimelineInstance
  cliente: Cliente
  onStepComplete: (stepId: string, data: Record<string, string>) => Promise<void>
  onStepWait: (stepId: string) => Promise<void>
  /** Salva variáveis da timeline (drive_url…) sem concluir etapa */
  onSaveVars: (vars: Record<string, string>) => Promise<void>
  /** Reabre uma etapa anterior (volta o current_step_id) */
  onReopenStep: (stepId: string) => Promise<void>
}

type EstadoStep = 'concluido' | 'atual' | 'futuro'

/**
 * Tela de condução do onboarding — passo-a-passo vertical.
 * Mostra TODAS as fases; a atual já vem expandida, mas qualquer etapa pode ser
 * aberta (clicar) e etapas concluídas podem ser reabertas. Um bloco de variáveis
 * no topo permite preencher/editar links e IDs a qualquer momento, refletindo na
 * hora nas mensagens. Sinaliza de quem é a vez (cliente vs. agência) e oferece o
 * lembrete pronto quando a bola está com o cliente.
 */
export function OnboardingTimeline({ instance, cliente, onStepComplete, onStepWait, onSaveVars, onReopenStep }: Props) {
  const steps = useMemo(
    () => [...(instance.template?.steps ?? [])].sort((a, b) => a.order - b.order),
    [instance.template],
  )
  const vars = useMemo(
    () => montarVars(cliente, instance.data as Record<string, unknown> | undefined),
    [cliente, instance.data],
  )

  // Variáveis editáveis = todos os input_fields dos steps (drive_url, etc.)
  const camposVariaveis = useMemo(() => {
    const map = new Map<string, TimelineInputField>()
    for (const s of steps) for (const f of s.input_fields ?? []) if (!map.has(f.id)) map.set(f.id, f)
    return Array.from(map.values())
  }, [steps])

  const completed = new Set(instance.completed_steps ?? [])
  const currentId = instance.current_step_id
  const [expandido, setExpandido] = useState<string | null>(currentId ?? null)

  if (steps.length === 0) {
    return <p className="text-ink-muted text-[0.875rem] py-[2rem] text-center">Template sem etapas.</p>
  }

  return (
    <div className="space-y-[1.25rem]">
      {/* Bloco de variáveis editáveis a qualquer momento */}
      {camposVariaveis.length > 0 && (
        <VariaveisEditor
          campos={camposVariaveis}
          valores={(instance.data ?? {}) as Record<string, unknown>}
          onSave={onSaveVars}
        />
      )}

      {/* Passo-a-passo */}
      <div>
        {steps.map((step, idx) => {
          const estado: EstadoStep =
            completed.has(step.id) ? 'concluido'
            : step.id === currentId ? 'atual'
            : 'futuro'
          return (
            <StepRow
              key={step.id}
              step={step}
              estado={estado}
              aberto={expandido === step.id}
              onToggle={() => setExpandido((cur) => (cur === step.id ? null : step.id))}
              isLast={idx === steps.length - 1}
              vars={vars}
              cliente={cliente}
              onComplete={(data) => onStepComplete(step.id, data)}
              onWait={() => onStepWait(step.id)}
              onReopen={() => onReopenStep(step.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

function VariaveisEditor({
  campos, valores, onSave,
}: {
  campos: TimelineInputField[]
  valores: Record<string, unknown>
  onSave: (vars: Record<string, string>) => Promise<void>
}) {
  const [draft, setDraft] = useState<Record<string, string>>(
    Object.fromEntries(campos.map((c) => [c.id, String(valores[c.id] ?? '')])),
  )
  const [saving, setSaving] = useState(false)

  const sujo = campos.some((c) => (draft[c.id] ?? '') !== String(valores[c.id] ?? ''))

  async function salvar() {
    setSaving(true)
    try {
      await onSave(draft)
      toast.success('Informações salvas')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-surface-border bg-surface-hover/40 p-[1rem]">
      <div className="flex items-center gap-[0.375rem] mb-[0.75rem] text-ink-secondary">
        <Pencil className="w-[0.8125rem] h-[0.8125rem]" strokeWidth={2} />
        <span className="text-[0.75rem] font-semibold uppercase tracking-wide">Informações da timeline</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[0.75rem]">
        {campos.map((c) => (
          <div key={c.id}>
            <label className="block text-[0.75rem] text-ink-secondary mb-[0.25rem] font-medium">{c.label}</label>
            <input
              type={c.type === 'select' ? 'text' : c.type}
              value={draft[c.id] ?? ''}
              onChange={(e) => setDraft((p) => ({ ...p, [c.id]: e.target.value }))}
              placeholder={c.placeholder}
              className="w-full bg-surface-card border border-surface-border rounded-lg px-[0.75rem] py-[0.5rem] text-[0.8125rem] text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-ads-500/60 focus:ring-1 focus:ring-ads-500/30 transition-colors"
            />
          </div>
        ))}
      </div>
      {sujo && (
        <div className="mt-[0.75rem]">
          <button
            onClick={salvar}
            disabled={saving}
            className="inline-flex items-center gap-[0.375rem] h-[2rem] px-[0.875rem] rounded-lg text-[0.8125rem] font-semibold bg-ads-500 text-black hover:bg-ads-400 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-[0.8125rem] h-[0.8125rem] animate-spin" /> : <Check className="w-[0.8125rem] h-[0.8125rem]" strokeWidth={2.5} />}
            Salvar informações
          </button>
        </div>
      )}
    </div>
  )
}

function StepRow({
  step, estado, aberto, onToggle, isLast, vars, cliente, onComplete, onWait, onReopen,
}: {
  step: TimelineStep
  estado: EstadoStep
  aberto: boolean
  onToggle: () => void
  isLast: boolean
  vars: Record<string, string>
  cliente: Cliente
  onComplete: (data: Record<string, string>) => Promise<void>
  onWait: () => Promise<void>
  onReopen: () => Promise<void>
}) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const responsavel = step.responsavel ?? 'agencia'

  async function handleComplete() {
    setSubmitting(true)
    try {
      await onComplete(fieldValues)
      toast.success(`"${step.title}" concluída`)
      setFieldValues({})
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao concluir')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex gap-[0.875rem]">
      {/* Trilho + marcador */}
      <div className="flex flex-col items-center">
        <button
          onClick={onToggle}
          className={cn(
            'w-[1.75rem] h-[1.75rem] rounded-full flex items-center justify-center shrink-0 border-2 transition-colors',
            estado === 'concluido' ? 'bg-status-green border-status-green text-white'
            : estado === 'atual'   ? 'bg-ads-500 border-ads-500 text-black'
            : 'bg-surface-card border-surface-border text-ink-muted hover:border-ink-muted',
          )}
          title={aberto ? 'Recolher' : 'Expandir'}
        >
          {estado === 'concluido'
            ? <Check className="w-[0.875rem] h-[0.875rem]" strokeWidth={3} />
            : <span className="text-[0.75rem] font-bold">{step.order}</span>}
        </button>
        {!isLast && (
          <div className={cn(
            'w-[2px] flex-1 min-h-[1.25rem] my-[0.25rem]',
            estado === 'concluido' ? 'bg-status-green/40' : 'bg-surface-border',
          )} />
        )}
      </div>

      {/* Conteúdo */}
      <div className={cn('flex-1 pb-[1.25rem]', estado === 'futuro' && !aberto && 'opacity-55')}>
        <button onClick={onToggle} className="flex items-center gap-[0.5rem] flex-wrap text-left w-full">
          <h4 className={cn(
            'text-[0.9375rem] font-semibold',
            estado === 'atual' ? 'text-ink-primary' : 'text-ink-secondary',
          )}>
            {step.title}
          </h4>
          <ResponsavelBadge responsavel={responsavel} estado={estado} />
          {step.duration_days && estado !== 'concluido' && (
            <span className="inline-flex items-center gap-[0.25rem] text-ink-muted text-[0.6875rem]">
              <Clock className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} /> ~{step.duration_days}d
            </span>
          )}
          <ChevronDown className={cn('w-[0.875rem] h-[0.875rem] text-ink-muted ml-auto transition-transform', aberto && 'rotate-180')} strokeWidth={2} />
        </button>

        {aberto && (
          <div className="mt-[0.875rem] space-y-[0.875rem]">
            {step.content && (
              <p className="text-ink-muted text-[0.8125rem]">{step.content}</p>
            )}

            {/* Mensagens */}
            {step.messages?.length > 0 && (
              <div className="space-y-[0.5rem]">
                {step.messages.map((msg) => (
                  <MensagemCard key={msg.id} message={msg} vars={vars} whatsapp={cliente.whatsapp} />
                ))}
              </div>
            )}

            {/* Lembrete pronto (quando a bola é do cliente) */}
            {responsavel === 'cliente' && step.lembrete_mensagem && (
              <LembreteCard
                texto={step.lembrete_mensagem}
                horas={step.lembrete_horas}
                vars={vars}
                whatsapp={cliente.whatsapp}
              />
            )}

            {/* Campos específicos do step (anotar na conclusão) */}
            {step.input_fields && step.input_fields.length > 0 && estado !== 'concluido' && (
              <div className="space-y-[0.5rem]">
                {step.input_fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-[0.75rem] text-ink-secondary mb-[0.25rem] font-medium">
                      {field.label}{field.required && <span className="text-status-red ml-[0.125rem]">*</span>}
                    </label>
                    <input
                      type={field.type === 'select' ? 'text' : field.type}
                      value={fieldValues[field.id] ?? ''}
                      onChange={(e) => setFieldValues((p) => ({ ...p, [field.id]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-surface-hover border border-surface-border rounded-lg px-[0.75rem] py-[0.5rem] text-[0.8125rem] text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-ads-500/60 focus:ring-1 focus:ring-ads-500/30 transition-colors"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Ações */}
            {estado === 'concluido' ? (
              <button
                onClick={onReopen}
                className="inline-flex items-center gap-[0.375rem] h-[2rem] px-[0.875rem] rounded-lg text-[0.8125rem] text-ink-secondary bg-surface-hover hover:bg-surface-elevated border border-surface-border transition-all"
              >
                <RotateCcw className="w-[0.8125rem] h-[0.8125rem]" strokeWidth={2} /> Reabrir etapa
              </button>
            ) : (
              <div className="flex gap-[0.5rem]">
                <button
                  onClick={handleComplete}
                  disabled={submitting}
                  className="flex items-center justify-center gap-[0.375rem] h-[2.25rem] px-[1rem] rounded-lg text-[0.8125rem] font-semibold bg-ads-500 text-black hover:bg-ads-400 active:scale-[0.97] transition-all disabled:opacity-50"
                >
                  {submitting
                    ? <Loader2 className="w-[0.875rem] h-[0.875rem] animate-spin" />
                    : <Check className="w-[0.875rem] h-[0.875rem]" strokeWidth={2.5} />}
                  Concluir etapa
                </button>
                <button
                  onClick={onWait}
                  className="flex items-center gap-[0.375rem] h-[2.25rem] px-[0.875rem] rounded-lg text-[0.8125rem] text-ink-secondary bg-surface-hover hover:bg-surface-elevated border border-surface-border transition-all active:scale-[0.97]"
                >
                  <Clock className="w-[0.8125rem] h-[0.8125rem]" strokeWidth={2} /> Aguardando
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ResponsavelBadge({ responsavel, estado }: { responsavel: 'cliente' | 'agencia'; estado: EstadoStep }) {
  if (estado === 'concluido') return null
  const isCliente = responsavel === 'cliente'
  return (
    <span className={cn(
      'inline-flex items-center gap-[0.25rem] px-[0.5rem] py-[0.0625rem] rounded-full text-[0.6875rem] font-medium',
      isCliente ? 'bg-status-orange/10 text-status-orange' : 'bg-status-blue/10 text-status-blue',
    )}>
      {isCliente
        ? <><User className="w-[0.6875rem] h-[0.6875rem]" strokeWidth={2} /> Com o cliente</>
        : <><Building2 className="w-[0.6875rem] h-[0.6875rem]" strokeWidth={2} /> Comigo</>}
    </span>
  )
}

function MensagemCard({ message, vars, whatsapp }: { message: TimelineMessage; vars: Record<string, string>; whatsapp?: string | null }) {
  const [copied, setCopied] = useState(false)
  const { texto, faltando } = useMemo(() => interpolar(message.text, vars), [message.text, vars])
  const isInstruction = message.role === 'instruction'

  const copiar = async () => {
    await navigator.clipboard.writeText(texto)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  const abrirWa = () => {
    const num = (whatsapp ?? '').replace(/\D/g, '')
    if (!num) return
    window.open(`https://wa.me/${num.startsWith('55') ? num : `55${num}`}?text=${encodeURIComponent(texto)}`, '_blank')
  }

  if (isInstruction) {
    return (
      <div className="flex gap-[0.5rem] text-[0.8125rem] text-ink-muted bg-surface-hover/60 rounded-lg px-[0.75rem] py-[0.5rem] border border-surface-border/50">
        <ChevronRight className="w-[0.875rem] h-[0.875rem] shrink-0 mt-[0.125rem]" strokeWidth={2} />
        <p className="whitespace-pre-wrap">{texto}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-[0.875rem] py-[0.625rem]">
      <p className="text-[0.8125rem] text-ink-primary whitespace-pre-wrap leading-relaxed">{texto}</p>
      {faltando.length > 0 && (
        <p className="mt-[0.375rem] text-[0.6875rem] text-status-orange">
          Falta preencher: {faltando.map((f) => `{{${f}}}`).join(', ')} — preencha em &quot;Informações da timeline&quot; acima
        </p>
      )}
      <div className="flex items-center gap-[0.375rem] mt-[0.5rem]">
        {message.copyable !== false && (
          <button onClick={copiar} className="inline-flex items-center gap-[0.25rem] text-[0.6875rem] font-medium text-ink-secondary hover:text-ink-primary transition-colors">
            {copied ? <Check className="w-[0.75rem] h-[0.75rem] text-status-green" strokeWidth={2.5} /> : <Copy className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        )}
        {!!(whatsapp ?? '').replace(/\D/g, '') && (
          <button onClick={abrirWa} className="inline-flex items-center gap-[0.25rem] text-[0.6875rem] font-medium text-[#25D366] hover:brightness-110 transition-all">
            <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} /> WhatsApp
          </button>
        )}
      </div>
    </div>
  )
}

function LembreteCard({ texto, horas, vars, whatsapp }: { texto: string; horas?: number[]; vars: Record<string, string>; whatsapp?: string | null }) {
  const [copied, setCopied] = useState(false)
  const { texto: msg } = useMemo(() => interpolar(texto, vars), [texto, vars])
  const copiar = async () => { await navigator.clipboard.writeText(msg); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const abrirWa = () => {
    const num = (whatsapp ?? '').replace(/\D/g, '')
    if (!num) return
    window.open(`https://wa.me/${num.startsWith('55') ? num : `55${num}`}?text=${encodeURIComponent(msg)}`, '_blank')
  }
  return (
    <div className="rounded-lg border border-status-orange/25 bg-status-orange/[0.06] px-[0.875rem] py-[0.625rem]">
      <div className="flex items-center gap-[0.375rem] mb-[0.375rem] text-status-orange">
        <Bell className="w-[0.8125rem] h-[0.8125rem]" strokeWidth={2} />
        <span className="text-[0.6875rem] font-semibold uppercase tracking-wide">
          Lembrete{horas && horas.length > 0 ? ` (${horas.map((h) => `${h}h`).join(' / ')})` : ''}
        </span>
      </div>
      <p className="text-[0.8125rem] text-ink-secondary whitespace-pre-wrap leading-relaxed">{msg}</p>
      <div className="flex items-center gap-[0.375rem] mt-[0.5rem]">
        <button onClick={copiar} className="inline-flex items-center gap-[0.25rem] text-[0.6875rem] font-medium text-ink-secondary hover:text-ink-primary transition-colors">
          {copied ? <Check className="w-[0.75rem] h-[0.75rem] text-status-green" strokeWidth={2.5} /> : <Copy className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
        {!!(whatsapp ?? '').replace(/\D/g, '') && (
          <button onClick={abrirWa} className="inline-flex items-center gap-[0.25rem] text-[0.6875rem] font-medium text-[#25D366] hover:brightness-110 transition-all">
            <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} /> WhatsApp
          </button>
        )}
      </div>
    </div>
  )
}
