'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Plus, CheckSquare, Square, Clock, Flag,
  ChevronDown, Trash2, RefreshCw, User,
} from 'lucide-react'
import { MainLayout }  from '@/components/layout/MainLayout'
import { TaskModal }   from '@/components/ui/TaskModal'
import { supabase }    from '@/lib/supabase'
import type { Tarefa, TarefaPrioridade, TarefaStatus } from '@/lib/types'

interface TarefaComCliente extends Tarefa {
  cliente_nome?: string
}

type Filtro = 'todas' | 'hoje' | 'semana' | 'criticas'

const PRIO_COR: Record<TarefaPrioridade, string> = {
  baixo:   'bg-ink-muted/20 text-ink-muted',
  normal:  'bg-status-blue/15 text-status-blue',
  alto:    'bg-status-orange/15 text-status-orange',
  critico: 'bg-status-red/15 text-status-red',
}

const PRIO_LABEL: Record<TarefaPrioridade, string> = {
  baixo: 'Baixo', normal: 'Normal', alto: 'Alto', critico: 'Crítico',
}

function hojeSt() { return new Date().toISOString().slice(0, 10) }
function semanaFim() {
  const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10)
}

function grupar(tarefas: TarefaComCliente[]): Record<string, TarefaComCliente[]> {
  const hoje = hojeSt()
  const semana = semanaFim()
  const grupos: Record<string, TarefaComCliente[]> = { 'Hoje': [], 'Próxima Semana': [], 'Mais Tarde': [], 'Sem prazo': [] }
  for (const t of tarefas) {
    const d = t.data_prazo?.slice(0, 10)
    if (!d) grupos['Sem prazo'].push(t)
    else if (d <= hoje) grupos['Hoje'].push(t)
    else if (d <= semana) grupos['Próxima Semana'].push(t)
    else grupos['Mais Tarde'].push(t)
  }
  return grupos
}

export default function TarefasPage() {
  const [tarefas,    setTarefas]    = useState<TarefaComCliente[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filtro,     setFiltro]     = useState<Filtro>('todas')
  const [modalAberto,setModalAberto]= useState(false)
  const [tarefaEdit, setTarefaEdit] = useState<Partial<Tarefa> | undefined>()

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('tarefas')
      .select('*, clientes(nome)')
      .neq('status', 'feito')
      .order('data_prazo', { ascending: true, nullsFirst: false })

    const lista = (data ?? []).map((t: Tarefa & { clientes?: { nome: string } }) => ({
      ...t,
      cliente_nome: t.clientes?.nome,
    })) as TarefaComCliente[]
    setTarefas(lista)
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function concluir(t: TarefaComCliente) {
    await supabase.from('tarefas').update({ status: 'feito' }).eq('id', t.id)
    if (t.cliente_id) {
      await supabase.from('historico_acoes').insert({
        cliente_id:  t.cliente_id,
        tipo:        'tarefa_concluida',
        descricao:   `Tarefa concluída: ${t.titulo}`,
      })
    }
    carregar()
  }

  async function adiar(t: TarefaComCliente, delta: number, unit: 'h' | 'd' | 'w') {
    const base = t.data_prazo ? new Date(t.data_prazo) : new Date()
    const ms   = unit === 'h' ? delta * 3600000 : unit === 'd' ? delta * 86400000 : delta * 604800000
    base.setTime(base.getTime() + ms)
    await supabase.from('tarefas').update({ data_prazo: base.toISOString(), status: 'adiado' }).eq('id', t.id)
    carregar()
  }

  async function deletar(id: string) {
    if (!confirm('Deletar esta tarefa?')) return
    await supabase.from('tarefas').delete().eq('id', id)
    carregar()
  }

  const filtradas = tarefas.filter((t) => {
    if (filtro === 'hoje')    return (t.data_prazo?.slice(0, 10) ?? '') <= hojeSt()
    if (filtro === 'semana')  return (t.data_prazo?.slice(0, 10) ?? '9') <= semanaFim()
    if (filtro === 'criticas') return t.prioridade === 'critico' || t.prioridade === 'alto'
    return true
  })

  const grupos = grupar(filtradas)
  const urgentesHoje = tarefas.filter((t) => (t.data_prazo?.slice(0, 10) ?? '') <= hojeSt()).length

  return (
    <MainLayout
      title="Tarefas"
      subtitle="Organize sua operação"
      actions={
        <div className="flex items-center gap-[0.5rem]">
          <button onClick={carregar} className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] hover:text-ink-primary transition-colors">
            <RefreshCw className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          </button>
          <button
            onClick={() => { setTarefaEdit(undefined); setModalAberto(true) }}
            className="flex items-center gap-[0.375rem] h-[2rem] px-[0.875rem] rounded-[0.375rem] bg-ads-500 hover:bg-ads-600 text-white text-[0.8125rem] font-semibold transition-colors"
          >
            <Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
            Nova Tarefa
          </button>
        </div>
      }
    >
      {/* Filtros */}
      <div className="flex items-center gap-[0.375rem] mb-[1.5rem] flex-wrap">
        {([
          { id: 'todas',    label: 'Todas' },
          { id: 'hoje',     label: `Hoje${urgentesHoje > 0 ? ` (${urgentesHoje})` : ''}` },
          { id: 'semana',   label: 'Esta semana' },
          { id: 'criticas', label: 'Críticas' },
        ] as { id: Filtro; label: string }[]).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFiltro(id)}
            className={`h-[1.875rem] px-[0.875rem] rounded-full text-[0.8125rem] font-medium transition-colors ${
              filtro === id
                ? 'bg-ads-500 text-white'
                : 'bg-surface-card border border-surface-border text-ink-secondary hover:text-ink-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-[0.75rem]">
          {[...Array(4)].map((_, i) => <div key={i} className="h-[4rem] rounded-xl bg-surface-card border border-surface-border animate-pulse" />)}
        </div>
      ) : filtradas.length === 0 ? (
        <div className="bg-surface-card border border-surface-border rounded-xl p-[4rem] text-center">
          <CheckSquare className="w-[2.5rem] h-[2.5rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
          <p className="text-ink-primary font-semibold">Tudo em dia!</p>
          <p className="text-ink-muted text-[0.875rem] mt-[0.25rem]">Nenhuma tarefa pendente.</p>
        </div>
      ) : (
        Object.entries(grupos).map(([grupo, items]) => {
          if (items.length === 0) return null
          return (
            <div key={grupo} className="mb-[2rem]">
              <div className="flex items-center gap-[0.5rem] mb-[0.75rem]">
                <Clock className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.75} />
                <h3 className="text-ink-secondary font-semibold text-[0.875rem] uppercase tracking-wide">{grupo}</h3>
                <span className="text-[0.6875rem] text-ink-muted bg-surface-hover px-[0.375rem] py-[0.0625rem] rounded-full">{items.length}</span>
              </div>
              <div className="flex flex-col gap-[0.5rem]">
                {items.map((t) => (
                  <div
                    key={t.id}
                    className="bg-surface-card border border-surface-border rounded-xl px-[1rem] py-[0.875rem] flex items-center gap-[0.875rem] hover:border-ads-500/30 transition-colors group"
                  >
                    {/* Checkbox */}
                    <button onClick={() => concluir(t)} className="shrink-0 text-ink-muted hover:text-status-green transition-colors">
                      <Square className="w-[1.25rem] h-[1.25rem]" strokeWidth={1.5} />
                    </button>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-[0.5rem] flex-wrap">
                        <p
                          className="text-ink-primary font-medium text-[0.9375rem] cursor-pointer hover:text-ads-500 transition-colors"
                          onClick={() => { setTarefaEdit(t); setModalAberto(true) }}
                        >
                          {t.titulo}
                        </p>
                        <span className={`text-[0.6875rem] font-semibold px-[0.375rem] py-[0.0625rem] rounded-full ${PRIO_COR[t.prioridade]}`}>
                          {PRIO_LABEL[t.prioridade]}
                        </span>
                      </div>
                      <div className="flex items-center gap-[0.75rem] mt-[0.25rem] text-[0.75rem] text-ink-muted flex-wrap">
                        {t.cliente_nome && (
                          <span className="flex items-center gap-[0.25rem]">
                            <User className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                            {t.cliente_nome}
                          </span>
                        )}
                        {t.data_prazo && (
                          <span className={`flex items-center gap-[0.25rem] ${t.data_prazo.slice(0, 10) < hojeSt() ? 'text-status-red font-semibold' : ''}`}>
                            <Clock className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                            {new Date(t.data_prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {t.descricao && <span className="truncate max-w-[20rem] text-ink-muted italic">{t.descricao}</span>}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-[0.375rem] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <div className="relative group/adiar">
                        <button className="flex items-center gap-[0.25rem] h-[1.75rem] px-[0.5rem] rounded text-ink-muted hover:text-ink-secondary bg-surface-hover text-[0.75rem] transition-colors">
                          Adiar <ChevronDown className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                        </button>
                        <div className="absolute right-0 top-full mt-[0.25rem] bg-surface-card border border-surface-border rounded-lg shadow-lg z-10 min-w-[8rem] hidden group-hover/adiar:block">
                          {[
                            { label: '+1 hora',   delta: 1, unit: 'h' as const },
                            { label: '+1 dia',    delta: 1, unit: 'd' as const },
                            { label: '+1 semana', delta: 1, unit: 'w' as const },
                          ].map(({ label, delta, unit }) => (
                            <button
                              key={label}
                              onClick={() => adiar(t, delta, unit)}
                              className="w-full text-left px-[0.75rem] py-[0.5rem] text-ink-secondary text-[0.8125rem] hover:bg-surface-hover transition-colors"
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => deletar(t.id)} className="w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded text-ink-muted hover:text-status-red bg-surface-hover transition-colors">
                        <Trash2 className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}

      {modalAberto && (
        <TaskModal
          tarefa={tarefaEdit}
          onClose={() => setModalAberto(false)}
          onSaved={carregar}
        />
      )}
    </MainLayout>
  )
}
