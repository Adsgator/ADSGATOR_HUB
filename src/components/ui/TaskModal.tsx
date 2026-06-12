'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Calendar, Flag, User, Plus, CheckSquare, Square, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fadeScale, backdropVariants } from '@/lib/motion'
import type { Tarefa, TarefaPrioridade } from '@/lib/types'

interface SubTask { id: string; texto: string; concluido: boolean }
import { Button } from '@/components/ui/Button'

interface Props {
  tarefa?:  Partial<Tarefa>
  onClose:  () => void
  onSaved:  () => void
}

interface ClienteOpcao { id: string; nome: string }

interface TemplateOpcao {
  id:         string
  nome:       string
  titulo:     string
  descricao:  string | null
  prioridade: TarefaPrioridade
  prazo_dias: number | null
  checklist:  string[]
}

const PRIORIDADES: { value: TarefaPrioridade; label: string }[] = [
  { value: 'baixo',   label: 'Baixo'  },
  { value: 'normal',  label: 'Normal' },
  { value: 'alto',    label: 'Alto'   },
  { value: 'critico', label: 'Crítico'},
]

export function TaskModal({ tarefa, onClose, onSaved }: Props) {
  const [titulo,        setTitulo]        = useState(tarefa?.titulo    ?? '')
  const [descricao,     setDescricao]     = useState(tarefa?.descricao ?? '')
  const [clienteId,     setClienteId]     = useState(tarefa?.cliente_id ?? '')
  const [prioridade,    setPrioridade]    = useState<TarefaPrioridade>(tarefa?.prioridade ?? 'normal')
  const [dataPrazo,     setDataPrazo]     = useState(tarefa?.data_prazo?.slice(0, 16) ?? '')
  const [responsavelId, setResponsavelId] = useState(tarefa?.responsavel_id ?? '')
  const [subtasks,      setSubtasks]      = useState<SubTask[]>(
    (tarefa?.checklist ?? []).map((s) => {
      const raw = s as unknown as Record<string, unknown>
      return {
        id:        (raw['id']        as string  | undefined) ?? crypto.randomUUID(),
        texto:     (raw['texto']     as string  | undefined) ?? (raw['item'] as string  | undefined) ?? '',
        concluido: (raw['concluido'] as boolean | undefined) ?? (raw['done'] as boolean | undefined) ?? false,
      }
    })
  )
  const [novaSubtask,   setNovaSubtask]   = useState('')
  const [clientes,      setClientes]      = useState<ClienteOpcao[]>([])
  const [membros,       setMembros]       = useState<{ id: string; nome: string }[]>([])
  const [templates,     setTemplates]     = useState<TemplateOpcao[]>([])
  const [salvando,      setSalvando]      = useState(false)
  const [erro,          setErro]          = useState('')

  useEffect(() => {
    supabase.from('clientes').select('id, nome').in('status', ['ativo', 'onboarding', 'setup_trafego', 'recebido']).order('nome')
      .then(({ data }) => setClientes((data ?? []) as ClienteOpcao[]))

    // Membros da equipe (tabela profiles ou auth.users via view)
    supabase.from('profiles').select('id, nome').order('nome')
      .then(({ data }) => {
        if (data?.length) setMembros(data as { id: string; nome: string }[])
      })

    // Templates de tarefa — só para criação (editar tarefa não aplica template)
    if (!tarefa?.id) {
      fetch('/api/v1/tarefa-templates')
        .then((r) => (r.ok ? r.json() : { data: [] }))
        .then((body) => setTemplates((body.data ?? []) as TemplateOpcao[]))
        .catch(() => { /* dropdown só não aparece */ })
    }
  }, [tarefa?.id])

  function aplicarTemplate(templateId: string) {
    const tpl = templates.find((t) => t.id === templateId)
    if (!tpl) return
    const nomeCliente = clientes.find((c) => c.id === clienteId)?.nome
    setTitulo(nomeCliente ? tpl.titulo.replace('{cliente}', nomeCliente) : tpl.titulo)
    setDescricao(tpl.descricao ?? '')
    setPrioridade(tpl.prioridade)
    setSubtasks(tpl.checklist.map((texto) => ({ id: crypto.randomUUID(), texto, concluido: false })))
    if (tpl.prazo_dias != null) {
      const prazo = new Date()
      prazo.setDate(prazo.getDate() + tpl.prazo_dias)
      prazo.setHours(18, 0, 0, 0)
      // formato datetime-local (YYYY-MM-DDTHH:mm) em hora local
      const pad = (n: number) => String(n).padStart(2, '0')
      setDataPrazo(`${prazo.getFullYear()}-${pad(prazo.getMonth() + 1)}-${pad(prazo.getDate())}T${pad(prazo.getHours())}:${pad(prazo.getMinutes())}`)
    }
  }

  function adicionarSubtask() {
    const texto = novaSubtask.trim()
    if (!texto) return
    setSubtasks((p) => [...p, { id: crypto.randomUUID(), texto, concluido: false }])
    setNovaSubtask('')
  }

  function toggleSubtask(i: number) {
    setSubtasks((p) => p.map((s, idx) => idx === i ? { ...s, concluido: !s.concluido } : s))
  }

  function removerSubtask(i: number) {
    setSubtasks((p) => p.filter((_, idx) => idx !== i))
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) { setErro('Título obrigatório.'); return }
    setSalvando(true); setErro('')

    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      titulo,
      descricao:      descricao || null,
      cliente_id:     clienteId  || null,
      prioridade,
      data_prazo:     dataPrazo  || null,
      responsavel_id: responsavelId || null,
      checklist:      subtasks.length > 0 ? subtasks : null,
      user_id:        user?.id,
      status:         tarefa?.status ?? 'pendente',
    }

    const { error } = tarefa?.id
      ? await supabase.from('tarefas').update(payload).eq('id', tarefa.id)
      : await supabase.from('tarefas').insert(payload)

    if (error) { setErro(error.message); setSalvando(false); return }
    onSaved()
    onClose()
  }

  const subtasksDone  = subtasks.filter((s) => s.concluido).length
  const subtasksTotal = subtasks.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem]">
      <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div variants={fadeScale} initial="hidden" animate="visible" exit="exit" className="relative bg-surface-card border border-surface-border rounded-2xl card-shadow shadow-2xl w-full max-w-[32rem] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-[1.5rem] py-[1rem] border-b border-surface-border shrink-0">
          <p className="text-ink-primary font-semibold text-[0.9375rem]">
            {tarefa?.id ? 'Editar Tarefa' : 'Nova Tarefa'}
          </p>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X className="w-[1rem] h-[1rem]" strokeWidth={2} />} className="w-[2rem] px-0" />
        </div>

        <form onSubmit={salvar} className="p-[1.5rem] flex flex-col gap-[1rem] overflow-y-auto flex-1">
          {/* Criar a partir de template (só em tarefa nova) */}
          {!tarefa?.id && templates.length > 0 && (
            <div>
              <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">Criar a partir de template</label>
              <select
                defaultValue=""
                onChange={(e) => { if (e.target.value) aplicarTemplate(e.target.value) }}
                className="w-full h-[2.5rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30"
              >
                <option value="">Sem template — começar do zero</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">Título *</label>
            <input
              type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}
              placeholder="Descreva a tarefa…"
              className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">Detalhes</label>
            <textarea
              value={descricao} onChange={(e) => setDescricao(e.target.value)}
              rows={2} placeholder="Contexto adicional…"
              className="w-full px-[0.75rem] py-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] resize-none focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-[0.75rem]">
            {/* Cliente */}
            <div>
              <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">
                <User className="inline w-[0.75rem] h-[0.75rem] mr-[0.25rem]" strokeWidth={1.75} />Cliente
              </label>
              <select
                value={clienteId} onChange={(e) => setClienteId(e.target.value)}
                className="w-full h-[2.5rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30"
              >
                <option value="">Sem cliente</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">
                <Flag className="inline w-[0.75rem] h-[0.75rem] mr-[0.25rem]" strokeWidth={1.75} />Prioridade
              </label>
              <select
                value={prioridade} onChange={(e) => setPrioridade(e.target.value as TarefaPrioridade)}
                className="w-full h-[2.5rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30"
              >
                {PRIORIDADES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[0.75rem]">
            {/* Data prazo */}
            <div>
              <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">
                <Calendar className="inline w-[0.75rem] h-[0.75rem] mr-[0.25rem]" strokeWidth={1.75} />Prazo
              </label>
              <input
                type="datetime-local" value={dataPrazo} onChange={(e) => setDataPrazo(e.target.value)}
                className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
              />
            </div>

            {/* Responsável */}
            <div>
              <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">
                <User className="inline w-[0.75rem] h-[0.75rem] mr-[0.25rem]" strokeWidth={1.75} />Responsável
              </label>
              {membros.length > 0 ? (
                <select
                  value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)}
                  className="w-full h-[2.5rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30"
                >
                  <option value="">Sem responsável</option>
                  {membros.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              ) : (
                <input
                  type="text" value={responsavelId}
                  onChange={(e) => setResponsavelId(e.target.value)}
                  placeholder="ID do usuário"
                  className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 transition-colors"
                />
              )}
            </div>
          </div>

          {/* Sub-tasks */}
          <div>
            <div className="flex items-center justify-between mb-[0.5rem]">
              <label className="text-ink-secondary text-[0.8125rem] font-medium">
                Sub-tasks
                {subtasksTotal > 0 && (
                  <span className="ml-[0.375rem] text-ink-muted text-[0.75rem]">
                    {subtasksDone}/{subtasksTotal}
                  </span>
                )}
              </label>
            </div>

            {/* Barra de progresso */}
            {subtasksTotal > 0 && (
              <div className="h-[0.1875rem] bg-surface-hover rounded-full mb-[0.625rem] overflow-hidden">
                <div
                  className="h-full bg-ads-500 rounded-full transition-all duration-300"
                  style={{ width: `${(subtasksDone / subtasksTotal) * 100}%` }}
                />
              </div>
            )}

            {/* Lista de sub-tasks */}
            {subtasks.length > 0 && (
              <ul className="space-y-[0.25rem] mb-[0.5rem]">
                {subtasks.map((s, i) => (
                  <li key={i} className="group flex items-center gap-[0.375rem] px-[0.5rem] py-[0.25rem] rounded-lg hover:bg-surface-hover transition-colors">
                    <button type="button" onClick={() => toggleSubtask(i)} className="shrink-0">
                      {s.concluido
                        ? <CheckSquare className="w-[0.875rem] h-[0.875rem] text-status-green" strokeWidth={2} />
                        : <Square      className="w-[0.875rem] h-[0.875rem] text-ink-muted"    strokeWidth={1.75} />
                      }
                    </button>
                    <span className={`flex-1 text-[0.8125rem] ${s.concluido ? 'line-through text-ink-muted' : 'text-ink-secondary'}`}>
                      {s.texto}
                    </span>
                    <button
                      type="button"
                      onClick={() => removerSubtask(i)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-[1.25rem] h-[1.25rem] rounded flex items-center justify-center hover:bg-status-red/10 text-ink-muted hover:text-status-red shrink-0"
                    >
                      <Trash2 className="w-[0.6875rem] h-[0.6875rem]" strokeWidth={2} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Input nova sub-task */}
            <div className="flex gap-[0.375rem]">
              <input
                type="text"
                value={novaSubtask}
                onChange={(e) => setNovaSubtask(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarSubtask() } }}
                placeholder="Adicionar sub-task… (Enter para confirmar)"
                className="flex-1 h-[2rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border/60 text-ink-primary text-[0.8125rem] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={adicionarSubtask}
                disabled={!novaSubtask.trim()}
                className="w-[2rem] h-[2rem] rounded-lg bg-surface-elevated border border-surface-border/60 flex items-center justify-center hover:bg-surface-hover text-ink-muted hover:text-ink-primary transition-colors disabled:opacity-40"
              >
                <Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
              </button>
            </div>
          </div>

          {erro && <p className="text-[0.8125rem] text-status-red">{erro}</p>}

          <div className="flex gap-[0.75rem] pt-[0.25rem]">
            <Button type="button" variant="secondary" size="lg" fullWidth onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={salvando} icon={<Save className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}>
              Salvar
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
