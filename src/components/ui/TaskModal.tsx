'use client'

import { useEffect, useState } from 'react'
import { X, Save, Calendar, Flag, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Tarefa, TarefaPrioridade } from '@/lib/types'

interface Props {
  tarefa?:  Partial<Tarefa>
  onClose:  () => void
  onSaved:  () => void
}

interface ClienteOpcao { id: string; nome: string }

const PRIORIDADES: { value: TarefaPrioridade; label: string }[] = [
  { value: 'baixo',   label: 'Baixo'  },
  { value: 'normal',  label: 'Normal' },
  { value: 'alto',    label: 'Alto'   },
  { value: 'critico', label: 'Crítico'},
]

export function TaskModal({ tarefa, onClose, onSaved }: Props) {
  const [titulo,     setTitulo]     = useState(tarefa?.titulo    ?? '')
  const [descricao,  setDescricao]  = useState(tarefa?.descricao ?? '')
  const [clienteId,  setClienteId]  = useState(tarefa?.cliente_id ?? '')
  const [prioridade, setPrioridade] = useState<TarefaPrioridade>(tarefa?.prioridade ?? 'normal')
  const [dataPrazo,  setDataPrazo]  = useState(tarefa?.data_prazo?.slice(0, 16) ?? '')
  const [clientes,   setClientes]   = useState<ClienteOpcao[]>([])
  const [salvando,   setSalvando]   = useState(false)
  const [erro,       setErro]       = useState('')

  useEffect(() => {
    supabase.from('clientes').select('id, nome').in('status', ['ativo', 'onboarding', 'setup_trafego', 'recebido']).order('nome')
      .then(({ data }) => setClientes((data ?? []) as ClienteOpcao[]))
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) { setErro('Título obrigatório.'); return }
    setSalvando(true); setErro('')

    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      titulo,
      descricao:   descricao || null,
      cliente_id:  clienteId  || null,
      prioridade,
      data_prazo:  dataPrazo  || null,
      user_id:     user?.id,
      status:      tarefa?.status ?? 'pendente',
    }

    const { error } = tarefa?.id
      ? await supabase.from('tarefas').update(payload).eq('id', tarefa.id)
      : await supabase.from('tarefas').insert(payload)

    if (error) { setErro(error.message); setSalvando(false); return }
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow shadow-2xl w-full max-w-[28rem]">
        {/* Header */}
        <div className="flex items-center justify-between px-[1.5rem] py-[1rem] border-b border-surface-border">
          <p className="text-ink-primary font-semibold text-[0.9375rem]">
            {tarefa?.id ? 'Editar Tarefa' : 'Nova Tarefa'}
          </p>
          <button onClick={onClose} className="w-[2rem] h-[2rem] flex items-center justify-center rounded hover:bg-surface-hover text-ink-muted transition-colors">
            <X className="w-[1rem] h-[1rem]" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={salvar} className="p-[1.5rem] flex flex-col gap-[1rem]">
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
              rows={3} placeholder="Contexto adicional…"
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

          {/* Data prazo */}
          <div>
            <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">
              <Calendar className="inline w-[0.75rem] h-[0.75rem] mr-[0.25rem]" strokeWidth={1.75} />Data / Hora do prazo
            </label>
            <input
              type="datetime-local" value={dataPrazo} onChange={(e) => setDataPrazo(e.target.value)}
              className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
          </div>

          {erro && <p className="text-[0.8125rem] text-status-red">{erro}</p>}

          <div className="flex gap-[0.75rem] pt-[0.25rem]">
            <button type="button" onClick={onClose} className="flex-1 h-[2.5rem] rounded-lg border border-surface-border bg-surface-hover text-ink-secondary text-[0.875rem] font-medium hover:text-ink-primary transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={salvando} className="flex-1 flex items-center justify-center gap-[0.5rem] h-[2.5rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white text-[0.875rem] font-semibold transition-colors disabled:opacity-50">
              {salvando ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
