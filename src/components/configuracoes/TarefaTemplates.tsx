'use client'

// Templates de tarefa/processo — builder e lista (seção "Tarefas e Processos"
// em Configurações → Templates). Templates com slug são de sistema (ex.:
// setup-cliente, usado pelo provisionamento automático): editáveis, não deletáveis.

import { useCallback, useEffect, useState } from 'react'
import { CheckSquare, Edit2, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { useConfirmDialogStore } from '@/lib/hooks/useConfirmDialog'

export interface TarefaTemplate {
  id:         string
  slug:       string | null
  nome:       string
  titulo:     string
  descricao:  string | null
  prioridade: string
  prazo_dias: number | null
  checklist:  string[]
}

const PRIORIDADES = [
  { value: 'baixo',   label: 'Baixo'   },
  { value: 'normal',  label: 'Normal'  },
  { value: 'alto',    label: 'Alto'    },
  { value: 'critico', label: 'Crítico' },
]

export function TarefaTemplates({ criando, onFecharCriacao }: {
  criando: boolean
  onFecharCriacao: () => void
}) {
  const [templates, setTemplates] = useState<TarefaTemplate[]>([])
  const [loading,   setLoading]   = useState(true)
  const [editando,  setEditando]  = useState<TarefaTemplate | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/v1/tarefa-templates')
      const body = await res.json()
      if (!res.ok) throw new Error(body.error)
      setTemplates(body.data ?? [])
    } catch {
      toast.error('Erro ao carregar templates de tarefa.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function excluir(tpl: TarefaTemplate) {
    const openConfirm = useConfirmDialogStore.getState().openConfirm
    openConfirm(
      'Excluir Template',
      `O template "${tpl.nome}" será removido permanentemente.`,
      async () => {
        const res = await fetch(`/api/v1/tarefa-templates/${tpl.id}`, { method: 'DELETE' })
        const body = await res.json()
        if (res.ok) {
          toast.success('Template removido.')
          setTemplates((prev) => prev.filter((t) => t.id !== tpl.id))
        } else {
          toast.error(body.error ?? 'Erro ao remover template.')
        }
      },
    )
  }

  function aoSalvar() {
    onFecharCriacao()
    setEditando(null)
    carregar()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[10rem]">
        <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-[1rem]">
      {criando && (
        <TarefaTemplateForm onSaved={aoSalvar} onCancel={onFecharCriacao} />
      )}

      {templates.length === 0 && !criando && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-[3rem] card-shadow text-center">
          <CheckSquare className="w-[2.5rem] h-[2.5rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
          <p className="text-ink-secondary text-[0.875rem]">
            Nenhum template de tarefa. Crie processos reutilizáveis com checklist pronto.
          </p>
        </div>
      )}

      {templates.map((tpl) => (
        <div key={tpl.id}>
          {editando?.id === tpl.id ? (
            <TarefaTemplateForm initial={tpl} onSaved={aoSalvar} onCancel={() => setEditando(null)} />
          ) : (
            <div className="bg-surface-card border border-surface-border rounded-xl px-[1.25rem] py-[1rem] card-shadow flex items-start justify-between gap-[1rem]">
              <div className="min-w-0">
                <div className="flex items-center gap-[0.625rem] flex-wrap">
                  <p className="text-ink-primary font-semibold text-[0.875rem]">{tpl.nome}</p>
                  {tpl.slug && (
                    <span className="px-[0.5rem] py-[0.125rem] rounded-full text-[0.625rem] font-semibold bg-ads-500/10 text-ads-600">
                      Sistema
                    </span>
                  )}
                  <span className="px-[0.5rem] py-[0.125rem] rounded-full text-[0.625rem] font-semibold bg-surface-hover text-ink-secondary capitalize">
                    {tpl.prioridade}
                  </span>
                </div>
                <p className="text-ink-muted text-[0.8125rem] mt-[0.25rem]">{tpl.titulo}</p>
                <p className="text-ink-muted text-[0.75rem] mt-[0.375rem]">
                  {tpl.checklist.length} {tpl.checklist.length === 1 ? 'item' : 'itens'} de checklist
                  {tpl.prazo_dias != null && ` · prazo D+${tpl.prazo_dias}`}
                </p>
              </div>
              <div className="flex items-center gap-[0.375rem] shrink-0">
                <button
                  onClick={() => setEditando(tpl)}
                  className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] hover:bg-surface-hover text-ink-secondary hover:text-ads-500 transition-colors"
                >
                  <Edit2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                </button>
                {!tpl.slug && (
                  <button
                    onClick={() => excluir(tpl)}
                    className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] hover:bg-status-red/10 text-ink-muted hover:text-status-red transition-colors"
                  >
                    <Trash2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Builder ───────────────────────────────────────────────────────────────────

function TarefaTemplateForm({ initial, onSaved, onCancel }: {
  initial?: TarefaTemplate
  onSaved:  () => void
  onCancel: () => void
}) {
  const [nome,       setNome]       = useState(initial?.nome ?? '')
  const [titulo,     setTitulo]     = useState(initial?.titulo ?? '')
  const [descricao,  setDescricao]  = useState(initial?.descricao ?? '')
  const [prioridade, setPrioridade] = useState(initial?.prioridade ?? 'normal')
  const [prazoDias,  setPrazoDias]  = useState<string>(initial?.prazo_dias != null ? String(initial.prazo_dias) : '')
  const [checklist,  setChecklist]  = useState<string[]>(initial?.checklist ?? [])
  const [novoItem,   setNovoItem]   = useState('')
  const [salvando,   setSalvando]   = useState(false)

  function adicionarItem() {
    const v = novoItem.trim()
    if (!v) return
    setChecklist((p) => [...p, v])
    setNovoItem('')
  }

  async function salvar() {
    if (!nome.trim() || !titulo.trim()) {
      toast.error('Nome e título são obrigatórios.')
      return
    }
    setSalvando(true)
    try {
      const payload = {
        nome, titulo,
        descricao:  descricao || null,
        prioridade,
        prazo_dias: prazoDias === '' ? null : Number(prazoDias),
        checklist,
      }
      const res = initial
        ? await fetch(`/api/v1/tarefa-templates/${initial.id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          })
        : await fetch('/api/v1/tarefa-templates', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error)
      toast.success(initial ? 'Template atualizado.' : 'Template criado.')
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar template.')
    } finally {
      setSalvando(false)
    }
  }

  const inputCls = 'w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors'

  return (
    <div className="bg-surface-elevated border border-ads-500/30 rounded-xl p-[1.25rem] flex flex-col gap-[1rem] animate-fade-scale">
      <p className="text-ink-primary font-semibold text-[0.9375rem]">
        {initial ? `Editar: ${initial.nome}` : 'Novo template de tarefa'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[0.75rem]">
        <div>
          <label className="block text-ink-secondary text-[0.75rem] font-medium mb-[0.25rem]">Nome do template</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Setup do cliente" className={inputCls} />
        </div>
        <div>
          <label className="block text-ink-secondary text-[0.75rem] font-medium mb-[0.25rem]">
            Título da tarefa <span className="text-ink-muted">(use {'{cliente}'})</span>
          </label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Setup do cliente — {cliente}" className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-ink-secondary text-[0.75rem] font-medium mb-[0.25rem]">Descrição</label>
        <textarea
          value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2}
          placeholder="Contexto da tarefa gerada…"
          className="w-full px-[0.75rem] py-[0.5rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] resize-none focus:outline-none focus:ring-2 focus:ring-ads-500/30 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-[0.75rem] max-w-[20rem]">
        <div>
          <label className="block text-ink-secondary text-[0.75rem] font-medium mb-[0.25rem]">Prioridade</label>
          <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)} className={inputCls}>
            {PRIORIDADES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-ink-secondary text-[0.75rem] font-medium mb-[0.25rem]">Prazo (dias)</label>
          <input
            type="number" min="0" value={prazoDias}
            onChange={(e) => setPrazoDias(e.target.value)}
            placeholder="Ex: 5"
            className={inputCls}
          />
        </div>
      </div>

      {/* Checklist item a item */}
      <div>
        <label className="block text-ink-secondary text-[0.75rem] font-medium mb-[0.375rem]">
          Checklist {checklist.length > 0 && <span className="text-ink-muted">({checklist.length})</span>}
        </label>
        {checklist.length > 0 && (
          <ul className="space-y-[0.25rem] mb-[0.5rem]">
            {checklist.map((item, i) => (
              <li key={i} className="group flex items-center gap-[0.5rem] px-[0.5rem] py-[0.25rem] rounded-lg bg-surface-hover/60">
                <span className="text-ink-muted text-[0.6875rem] font-mono w-[1.25rem] shrink-0">{i + 1}.</span>
                <span className="flex-1 text-ink-secondary text-[0.8125rem]">{item}</span>
                <button
                  type="button"
                  onClick={() => setChecklist((p) => p.filter((_, j) => j !== i))}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-muted hover:text-status-red"
                >
                  <X className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-[0.375rem]">
          <input
            value={novoItem} onChange={(e) => setNovoItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarItem() } }}
            placeholder="Adicionar item… (Enter para confirmar)"
            className="flex-1 h-[2rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border/60 text-ink-primary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 transition-colors"
          />
          <button
            type="button" onClick={adicionarItem} disabled={!novoItem.trim()}
            className="w-[2rem] h-[2rem] rounded-lg bg-surface-card border border-surface-border/60 flex items-center justify-center hover:bg-surface-hover text-ink-muted hover:text-ink-primary transition-colors disabled:opacity-40"
          >
            <Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-[0.75rem] pt-[0.25rem]">
        <Button variant="primary" size="sm" loading={salvando} onClick={salvar}>
          {initial ? 'Salvar alterações' : 'Criar template'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  )
}
