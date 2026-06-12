'use client'

// Templates — hub de modelos reutilizáveis em duas seções:
// "Tarefas e Processos" (tarefa_templates, novo) e "Timelines" (timeline_templates,
// builder original). Templates de email têm página própria (/configuracoes/emails).

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Layers, CheckSquare, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { MainLayout } from '@/components/layout/MainLayout'
import { useConfirmDialogStore } from '@/lib/hooks/useConfirmDialog'
import { TemplateBuilder } from '@/components/timeline/TemplateBuilder'
import type { TemplateData } from '@/components/timeline/TemplateBuilder'
import { TarefaTemplates } from '@/components/configuracoes/TarefaTemplates'
import { cn } from '@/lib/utils'

// ─── Type badge ───────────────────────────────────────────────────────────────

const TIPO_BADGE: Record<string, { label: string; color: string }> = {
  onboarding:     { label: 'Onboarding',        color: 'bg-status-blue/10 text-status-blue'     },
  recurring_task: { label: 'Tarefa Recorrente', color: 'bg-status-purple/10 text-status-purple' },
  alert:          { label: 'Alerta',             color: 'bg-status-orange/10 text-status-orange' },
}

type Secao = 'tarefas' | 'timelines'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const [secao, setSecao] = useState<Secao>('tarefas')
  const [criandoTarefa, setCriandoTarefa] = useState(false)

  // — estado da seção Timelines (comportamento original) —
  const [templates, setTemplates]   = useState<TemplateData[]>([])
  const [loading,   setLoading]     = useState(true)
  const [editing,   setEditing]     = useState<TemplateData | null>(null)
  const [creating,  setCreating]    = useState(false)
  const [deleting,  setDeleting]    = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/v1/timeline-templates')
      const data = await res.json()
      setTemplates(data.templates ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function handleDelete(id: string) {
    const openConfirm = useConfirmDialogStore.getState().openConfirm
    openConfirm(
      'Deletar Template',
      'Este template será removido permanentemente. Esta ação não pode ser desfeita.',
      async () => {
        setDeleting(id)
    try {
      const res = await fetch(`/api/v1/timeline-templates/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Template removido.')
        setTemplates((prev) => prev.filter((t) => t.id !== id))
      } else {
        toast.error('Erro ao remover template.')
      }
    } finally {
      setDeleting(null)
    }
      }
    )
  }

  function handleSaved() {
    setCreating(false)
    setEditing(null)
    carregar()
  }

  return (
    <MainLayout
      title="Templates"
      subtitle="Modelos reutilizáveis de tarefas, processos e timelines"
      actions={
        <button
          onClick={() => {
            if (secao === 'tarefas') { setCriandoTarefa(true) }
            else { setCreating(true); setEditing(null) }
          }}
          className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors"
        >
          <Plus className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} />
          Novo Template
        </button>
      }
    >
      <div className="page-enter space-y-[1.25rem]">

        {/* Seções */}
        <div className="flex items-center gap-[0.25rem] flex-wrap border-b border-surface-border pb-[0.25rem]">
          {([
            { id: 'tarefas'   as Secao, label: 'Tarefas e Processos', icon: CheckSquare },
            { id: 'timelines' as Secao, label: 'Timelines',           icon: Layers      },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSecao(id)}
              className={`flex items-center gap-[0.375rem] h-[2.25rem] px-[0.875rem] rounded-t-lg text-[0.875rem] font-medium transition-colors ${
                secao === id
                  ? 'text-ads-500 border-b-2 border-ads-500 -mb-[0.3125rem]'
                  : 'text-ink-muted hover:text-ink-secondary'
              }`}
            >
              <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
              {label}
            </button>
          ))}
          <Link
            href="/configuracoes/emails"
            className="flex items-center gap-[0.375rem] h-[2.25rem] px-[0.875rem] text-[0.875rem] font-medium text-ink-muted hover:text-ink-secondary transition-colors ml-auto"
          >
            <Mail className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
            Emails →
          </Link>
        </div>

        {/* ── Tarefas e Processos ── */}
        {secao === 'tarefas' && (
          <TarefaTemplates criando={criandoTarefa} onFecharCriacao={() => setCriandoTarefa(false)} />
        )}

        {/* ── Timelines (original) ── */}
        {secao === 'timelines' && (
          <div className="space-y-[1.25rem]">
            {creating && (
              <TemplateBuilder
                onSaved={handleSaved}
                onCancel={() => setCreating(false)}
              />
            )}

            {loading && (
              <div className="flex items-center justify-center h-[12rem]">
                <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && templates.length === 0 && !creating && (
              <div className="bg-surface-card border border-surface-border rounded-xl p-[3rem] card-shadow text-center">
                <Layers className="w-[2.5rem] h-[2.5rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
                <p className="text-ink-secondary text-[0.875rem]">
                  Nenhum template cadastrado. Crie o primeiro clicando em &ldquo;Novo Template&rdquo;.
                </p>
              </div>
            )}

            {!loading && templates.map((tmpl) => (
              <div key={tmpl.id}>
                {editing?.id === tmpl.id ? (
                  <TemplateBuilder
                    initial={tmpl}
                    onSaved={handleSaved}
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <div className="bg-surface-card border border-surface-border rounded-xl px-[1.25rem] py-[1rem] card-shadow flex items-start justify-between gap-[1rem]">
                    <div className="flex items-start gap-[0.875rem] min-w-0">
                      <div
                        className="w-[2.25rem] h-[2.25rem] rounded-[0.5rem] flex items-center justify-center shrink-0"
                        style={{ background: `${tmpl.cor}20` }}
                      >
                        <div className="w-[0.75rem] h-[0.75rem] rounded-full" style={{ background: tmpl.cor }} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-[0.625rem] flex-wrap">
                          <p className="text-ink-primary font-semibold text-[0.875rem]">{tmpl.nome}</p>
                          {tmpl.tipo && TIPO_BADGE[tmpl.tipo] && (
                            <span className={cn('px-[0.5rem] py-[0.125rem] rounded-full text-[0.625rem] font-semibold', TIPO_BADGE[tmpl.tipo].color)}>
                              {TIPO_BADGE[tmpl.tipo].label}
                            </span>
                          )}
                        </div>
                        {tmpl.descricao && (
                          <p className="text-ink-muted text-[0.8125rem] mt-[0.25rem] leading-snug line-clamp-2">{tmpl.descricao}</p>
                        )}
                        {tmpl.steps && tmpl.steps.length > 0 && (
                          <p className="text-ink-muted text-[0.75rem] mt-[0.375rem]">
                            {tmpl.steps.length} etapa{tmpl.steps.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-[0.375rem] shrink-0">
                      <button
                        onClick={() => { setEditing(tmpl); setCreating(false) }}
                        className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] hover:bg-surface-hover text-ink-secondary hover:text-ads-500 transition-colors"
                      >
                        <Edit2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => tmpl.id && handleDelete(tmpl.id)}
                        disabled={deleting === tmpl.id}
                        className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] hover:bg-status-red/10 text-ink-muted hover:text-status-red transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
