'use client'

import { useCallback, useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import {
  Plus, CheckSquare, Square, Clock, User,
  ChevronDown, Trash2, RefreshCw, AlarmClock,
  Zap, CheckCheck, AlertTriangle, ChevronRight,
  Tag,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { TaskModal }  from '@/components/ui/TaskModal'
import { Button }     from '@/components/ui/Button'
import { Tooltip }    from '@/components/ui/Tooltip'
import { ContextMenu } from '@/components/ui/ContextMenu'
import { cn }         from '@/lib/utils'
import { supabase }   from '@/lib/supabase'
import type { Tarefa, TarefaPrioridade } from '@/lib/types'

interface TarefaComCliente extends Tarefa {
  cliente_nome?: string
}

type Filtro = 'todas' | 'hoje' | 'semana' | 'criticas'

const PRIO_CONFIG: Record<TarefaPrioridade, { label: string; color: string; dot: string; border: string }> = {
  baixo:   { label: 'Baixo',   color: 'text-ink-muted',          dot: 'bg-ink-muted',          border: 'border-l-ink-muted'        },
  normal:  { label: 'Normal',  color: 'text-status-blue',        dot: 'bg-status-blue',        border: 'border-l-status-blue'      },
  alto:    { label: 'Alto',    color: 'text-status-orange',      dot: 'bg-status-orange',      border: 'border-l-status-orange'    },
  critico: { label: 'Crítico', color: 'text-status-red',         dot: 'bg-status-red',         border: 'border-l-status-red'       },
}

const GRUPO_CONFIG: Record<string, { icon: typeof Clock; color: string; glow: string }> = {
  'Hoje':            { icon: Zap,          color: 'text-ads-400',        glow: 'bg-ads-500/10'       },
  'Próxima Semana':  { icon: Clock,        color: 'text-status-blue',    glow: 'bg-status-blue/10'   },
  'Mais Tarde':      { icon: AlarmClock,   color: 'text-ink-secondary',  glow: 'bg-surface-hover'    },
  'Sem prazo':       { icon: Tag,          color: 'text-ink-muted',      glow: 'bg-surface-hover'    },
}

function hojeSt() { return new Date().toISOString().slice(0, 10) }
function semanaFim() {
  const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10)
}

function grupar(tarefas: TarefaComCliente[]): Record<string, TarefaComCliente[]> {
  const hoje = hojeSt()
  const semana = semanaFim()
  const grupos: Record<string, TarefaComCliente[]> = {
    'Hoje': [], 'Próxima Semana': [], 'Mais Tarde': [], 'Sem prazo': [],
  }
  for (const t of tarefas) {
    const d = t.data_prazo?.slice(0, 10)
    if (!d)           grupos['Sem prazo'].push(t)
    else if (d <= hoje)   grupos['Hoje'].push(t)
    else if (d <= semana) grupos['Próxima Semana'].push(t)
    else                  grupos['Mais Tarde'].push(t)
  }
  return grupos
}

/* ─── Energy bar ────────────────────────────────────────── */
function EnergyBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-[0.625rem]">
      <span className="text-[0.6875rem] text-ink-muted w-[4.5rem] shrink-0">{label}</span>
      <div className="flex-1 h-[0.25rem] rounded-full bg-surface-hover overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[0.6875rem] text-ink-muted w-[2rem] text-right">{pct}%</span>
    </div>
  )
}

/* ─── Accordion de tarefa ────────────────────────────────── */
function TarefaAccordion({
  t, expanded, onToggle, onConcluir, onAdiar, onDeletar, onEditar,
}: {
  t: TarefaComCliente
  expanded: boolean
  onToggle: () => void
  onConcluir: () => void
  onAdiar: (delta: number, unit: 'h' | 'd' | 'w') => void
  onDeletar: () => void
  onEditar: () => void
}) {
  const prio         = PRIO_CONFIG[t.prioridade]
  const atrasada     = (t.data_prazo?.slice(0, 10) ?? '') < hojeSt() && t.status !== 'feito'
  const subtasks     = t.checklist ?? []
  const subDone      = subtasks.filter((s) => s.done).length
  const subTotal     = subtasks.length
  const subPct       = subTotal > 0 ? (subDone / subTotal) * 100 : 0

  const ctxItems = [
    { label: 'Editar',    icon: <ChevronRight className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />, onClick: onEditar },
    { label: 'Adiar 1h',  icon: <AlarmClock className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,  onClick: () => onAdiar(1, 'h') },
    { label: 'Adiar 1d',  icon: <AlarmClock className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,  onClick: () => onAdiar(1, 'd'), separator: true },
    { label: 'Deletar',   icon: <Trash2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,       onClick: onDeletar, variant: 'danger' as const },
  ]

  return (
    <ContextMenu items={ctxItems}>
      <div className={cn(
        'bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow overflow-hidden',
        'border-l-[3px]', prio.border,
        'transition-all duration-200',
        expanded ? 'shadow-lg shadow-black/15' : 'hover:border-surface-elevated',
      )}>
        {/* ── HEADER (sempre visível) ── */}
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-[0.875rem] px-[1rem] py-[0.875rem] text-left"
        >
          {/* Checkbox */}
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onConcluir() }}
            className="shrink-0 text-ink-muted hover:text-status-green transition-colors"
          >
            <Square className="w-[1.25rem] h-[1.25rem]" strokeWidth={1.5} />
          </span>

          {/* Título + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[0.5rem] flex-wrap">
              <span className="text-ink-primary font-medium text-[0.9375rem] truncate">{t.titulo}</span>
              <span className={cn(
                'inline-flex items-center gap-[0.1875rem] text-[0.625rem] font-semibold px-[0.375rem] py-[0.0625rem] rounded-full',
                prio.color, 'bg-surface-hover',
              )}>
                <span className={cn('w-[0.3125rem] h-[0.3125rem] rounded-full', prio.dot)} />
                {prio.label}
              </span>
              {atrasada && (
                <span className="inline-flex items-center gap-[0.1875rem] text-[0.625rem] font-semibold px-[0.375rem] py-[0.0625rem] rounded-full bg-status-red/10 text-status-red">
                  <AlertTriangle className="w-[0.5rem] h-[0.5rem]" strokeWidth={2.5} />
                  Atrasada
                </span>
              )}
            </div>
            <div className="flex items-center gap-[0.625rem] mt-[0.1875rem] text-[0.6875rem] text-ink-muted flex-wrap">
              {t.cliente_nome && (
                <span className="flex items-center gap-[0.1875rem]">
                  <User className="w-[0.5625rem] h-[0.5625rem]" strokeWidth={2} />
                  {t.cliente_nome}
                </span>
              )}
              {t.data_prazo && (
                <span className={cn('flex items-center gap-[0.1875rem]', atrasada && 'text-status-red font-semibold')}>
                  <Clock className="w-[0.5625rem] h-[0.5625rem]" strokeWidth={2} />
                  {new Date(t.data_prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {subTotal > 0 && (
                <span className="flex items-center gap-[0.25rem]">
                  <span className="text-ink-muted">{subDone}/{subTotal}</span>
                  <span className="w-[2.5rem] h-[0.1875rem] rounded-full bg-surface-hover overflow-hidden">
                    <span
                      className={cn('block h-full rounded-full transition-all', subDone === subTotal ? 'bg-status-green' : 'bg-ads-500')}
                      style={{ width: `${subPct}%` }}
                    />
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Chevron */}
          <ChevronDown
            className={cn('w-[1rem] h-[1rem] text-ink-muted shrink-0 transition-transform duration-200', expanded && 'rotate-180')}
            strokeWidth={1.75}
          />
        </button>

        {/* ── EXPANDED BODY (accordion) ── */}
        {expanded && (
          <div className="px-[1rem] pb-[1rem] border-t border-surface-border animate-fade-up">
            {/* Descrição */}
            {t.descricao && (
              <div className="mt-[0.75rem] p-[0.75rem] rounded-[0.375rem] bg-surface-hover border-l-[2px] border-ads-500/30">
                <p className="text-[0.8125rem] text-ink-secondary leading-relaxed">{t.descricao}</p>
              </div>
            )}

            {/* Sub-tasks */}
            {subTotal > 0 && (
              <div className="mt-[0.75rem]">
                <p className="text-[0.625rem] text-ink-muted font-semibold uppercase tracking-wide mb-[0.375rem]">
                  Sub-tasks — {subDone}/{subTotal}
                </p>
                <ul className="space-y-[0.125rem]">
                  {subtasks.map((s, i) => (
                    <li key={i} className="flex items-center gap-[0.375rem] px-[0.375rem] py-[0.25rem] rounded-lg hover:bg-surface-hover transition-colors">
                      {s.done
                        ? <CheckCheck className="w-[0.75rem] h-[0.75rem] text-status-green shrink-0" strokeWidth={2} />
                        : <Square     className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0"    strokeWidth={1.75} />
                      }
                      <span className={cn('text-[0.8125rem]', s.done ? 'line-through text-ink-muted' : 'text-ink-secondary')}>
                        {s.item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Why it's here */}
            <div className="mt-[0.75rem] p-[0.75rem] rounded-[0.375rem] bg-surface-base border border-surface-border">
              <p className="text-[0.625rem] text-ink-muted font-semibold uppercase tracking-wide mb-[0.25rem]">Contexto</p>
              <p className="text-[0.75rem] text-ink-muted leading-relaxed">
                {t.prioridade === 'critico' && 'Tarefa crítica — requer atenção imediata para não afetar a operação do cliente.'}
                {t.prioridade === 'alto'    && 'Alta prioridade — impacta diretamente os resultados esperados.'}
                {t.prioridade === 'normal'  && 'Prioridade normal — parte do fluxo operacional padrão.'}
                {t.prioridade === 'baixo'   && 'Baixa prioridade — pode ser realizada quando houver disponibilidade.'}
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-[0.5rem] mt-[0.875rem]">
              <Tooltip content="Concluir" side="top">
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={onConcluir}
                  icon={<CheckCheck className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
                  className="text-status-green bg-status-green/10 hover:bg-status-green/20"
                >
                  Concluir
                </Button>
              </Tooltip>

              <div className="relative group/adiar">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<AlarmClock className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />}
                  iconPosition="left"
                >
                  Adiar
                  <ChevronDown className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                </Button>
                <div className="absolute left-0 top-full mt-[0.25rem] bg-surface-elevated border border-surface-border rounded-[0.5rem] shadow-xl z-20 min-w-[8rem] hidden group-hover/adiar:block animate-fade-scale">
                  {[
                    { label: '+1 hora',   delta: 1, unit: 'h' as const },
                    { label: '+1 dia',    delta: 1, unit: 'd' as const },
                    { label: '+1 semana', delta: 1, unit: 'w' as const },
                  ].map(({ label, delta, unit }) => (
                    <button
                      key={label}
                      onClick={() => onAdiar(delta, unit)}
                      className="w-full text-left px-[0.75rem] py-[0.4375rem] text-ink-secondary text-[0.8125rem] hover:bg-surface-hover hover:text-ink-primary transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1" />

              <Tooltip content="Deletar" side="top">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onDeletar}
                  icon={<Trash2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />}
                  className="w-[2rem] px-0"
                />
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </ContextMenu>
  )
}

/* ─── Page ──────────────────────────────────────────────── */
export default function TarefasPage() {
  const [tarefas,     setTarefas]     = useState<TarefaComCliente[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filtro,      setFiltro]      = useState<Filtro>('todas')
  const [expanded,    setExpanded]    = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [tarefaEdit,  setTarefaEdit]  = useState<Partial<Tarefa> | undefined>()

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('tarefas')
      .select('*, clientes(nome)')
      .neq('status', 'feito')
      .order('data_prazo', { ascending: true, nullsFirst: false })
      .order('posicao', { ascending: true })

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
        cliente_id: t.cliente_id,
        tipo:       'tarefa_concluida',
        descricao:  `Tarefa concluída: ${t.titulo}`,
      })
    }
    setExpanded(null)
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
    if (expanded === id) setExpanded(null)
    carregar()
  }

  const filtradas = tarefas.filter((t) => {
    if (filtro === 'hoje')     return (t.data_prazo?.slice(0, 10) ?? '') <= hojeSt()
    if (filtro === 'semana')   return (t.data_prazo?.slice(0, 10) ?? '9') <= semanaFim()
    if (filtro === 'criticas') return t.prioridade === 'critico' || t.prioridade === 'alto'
    return true
  })

  const grupos = grupar(filtradas)
  const urgentesHoje = tarefas.filter((t) => (t.data_prazo?.slice(0, 10) ?? '') <= hojeSt()).length
  const criticas = tarefas.filter((t) => t.prioridade === 'critico' || t.prioridade === 'alto').length

  /* Energy flow calculado pela distribuição */
  const totalHoje    = grupos['Hoje'].length
  const totalSemana  = grupos['Próxima Semana'].length
  const totalMais    = grupos['Mais Tarde'].length + grupos['Sem prazo'].length
  const totalGeral   = totalHoje + totalSemana + totalMais || 1
  const energyManha  = Math.round(Math.min(100, (totalHoje / totalGeral) * 150))
  const energyTarde  = Math.round(Math.min(100, (totalSemana / totalGeral) * 110))
  const energyNoite  = Math.round(Math.min(100, (totalMais / totalGeral) * 100))

  async function handleDragEnd(result: DropResult) {
    const { source, destination } = result
    if (!destination) return
    if (source.index === destination.index) return

    const lista = [...filtradas]
    const [moved] = lista.splice(source.index, 1)
    lista.splice(destination.index, 0, moved)

    setTarefas(lista)

    // Salvar novas posições no Supabase
    const updates = lista.map((t, idx) => ({
      id: t.id,
      posicao: idx,
    }))

    for (const upd of updates) {
      await supabase.from('tarefas').update({ posicao: upd.posicao }).eq('id', upd.id)
    }
  }

  return (
    <MainLayout
      title="Tarefas"
      subtitle={`${filtradas.length} pendente${filtradas.length !== 1 ? 's' : ''}`}
      actions={
        <div className="flex items-center gap-[0.5rem]">
          <Tooltip content="Atualizar" side="bottom">
            <Button variant="secondary" size="sm" onClick={carregar} icon={<RefreshCw className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />} className="w-[2rem] px-0" />
          </Tooltip>
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setTarefaEdit(undefined); setModalAberto(true) }}
            icon={<Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
          >
            Nova Tarefa
          </Button>
        </div>
      }
    >
      <div className="page-enter grid grid-cols-1 xl:grid-cols-[1fr_18rem] gap-[1.5rem] items-start">

        {/* ══ COLUNA PRINCIPAL — lista de tarefas ══════════════ */}
        <div className="min-w-0">

          {/* ── FILTROS ──────────────────────────────────────── */}
          <div className="flex items-center gap-[0.375rem] mb-[1.25rem] flex-wrap">
            {([
              { id: 'todas',     label: 'Todas' },
              { id: 'hoje',      label: `Hoje${urgentesHoje > 0 ? ` (${urgentesHoje})` : ''}` },
              { id: 'semana',    label: 'Esta semana' },
              { id: 'criticas',  label: `Críticas${criticas > 0 ? ` (${criticas})` : ''}` },
            ] as { id: Filtro; label: string }[]).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFiltro(id)}
                className={cn(
                  'h-[1.875rem] px-[0.875rem] rounded-full text-[0.8125rem] font-medium transition-colors',
                  filtro === id
                    ? 'bg-ads-500 text-white shadow-md shadow-ads-500/20'
                    : 'bg-surface-card border border-surface-border text-ink-secondary hover:text-ink-primary hover:border-surface-elevated',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── LISTA ──────────────────────────────────────── */}
          {loading ? (
            <div className="flex flex-col gap-[0.625rem]">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-[4.25rem] rounded-xl skeleton-shimmer dark:border dark:border-surface-border" />
              ))}
            </div>
          ) : filtradas.length === 0 ? (
            <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[4rem] text-center">
              <CheckSquare className="w-[2.5rem] h-[2.5rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
              <p className="text-ink-primary font-semibold">Tudo em dia!</p>
              <p className="text-ink-muted text-[0.875rem] mt-[0.25rem]">Nenhuma tarefa pendente com esse filtro.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex flex-col gap-[1.5rem]">
                {Object.entries(grupos).map(([grupo, items]) => {
                  if (items.length === 0) return null
                  const gcfg = GRUPO_CONFIG[grupo]
                  const GrupoIcon = gcfg.icon
                  return (
                    <div key={grupo}>
                      <div className="flex items-center gap-[0.5rem] mb-[0.625rem]">
                        <div className={cn('w-[1.5rem] h-[1.5rem] rounded-[0.375rem] flex items-center justify-center', gcfg.glow)}>
                          <GrupoIcon className={cn('w-[0.75rem] h-[0.75rem]', gcfg.color)} strokeWidth={2} />
                        </div>
                        <h3 className={cn('font-semibold text-[0.875rem]', gcfg.color)}>{grupo}</h3>
                        <span className="text-[0.6875rem] text-ink-muted bg-surface-hover border border-surface-border px-[0.375rem] py-[0.0625rem] rounded-full">
                          {items.length}
                        </span>
                        <div className="flex-1 h-[1px] bg-surface-border" />
                      </div>
                      <Droppable droppableId={grupo}>
                        {(provided, snapshot) => (
                          <div
                            className="flex flex-col gap-[0.5rem]"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                              backgroundColor: snapshot.isDraggingOver ? 'var(--surface-hover)' : 'transparent',
                              borderRadius: '0.5rem',
                              padding: snapshot.isDraggingOver ? '0.5rem' : '0',
                              transition: 'all 0.2s',
                            }}
                          >
                            {items.map((t, idx) => (
                              <Draggable key={t.id} draggableId={t.id} index={idx}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      opacity: snapshot.isDragging ? 0.5 : 1,
                                      ...provided.draggableProps.style,
                                    }}
                                  >
                                    <TarefaAccordion
                                      t={t}
                                      expanded={expanded === t.id}
                                      onToggle={() => setExpanded(expanded === t.id ? null : t.id)}
                                      onConcluir={() => concluir(t)}
                                      onAdiar={(d, u) => adiar(t, d, u)}
                                      onDeletar={() => deletar(t.id)}
                                      onEditar={() => { setTarefaEdit(t); setModalAberto(true) }}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )
                })}
              </div>
            </DragDropContext>
          )}
        </div>

        {/* ══ COLUNA LATERAL — Smart Schedule ═════════════════ */}
        <div className="flex flex-col gap-[1rem] sticky top-[1.5rem]">

          {/* Energy Flow */}
          <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem] card-shadow">
            <div className="flex items-center justify-between mb-[1rem]">
              <div>
                <p className="text-ink-primary font-semibold text-[0.875rem]">Fluxo de Energia</p>
                <p className="text-ink-muted text-[0.6875rem]">Distribuição por período</p>
              </div>
              <Zap className="w-[1.125rem] h-[1.125rem] text-ads-400" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col gap-[0.625rem]">
              <EnergyBar label="Urgente / Hoje"   pct={energyManha} color="bg-ads-400"        />
              <EnergyBar label="Próx. semana"      pct={energyTarde} color="bg-status-blue"    />
              <EnergyBar label="Mais tarde"        pct={energyNoite} color="bg-surface-border" />
            </div>
          </div>

          {/* Mini KPIs */}
          <div className="flex flex-col gap-[0.5rem]">
            {[
              { label: 'Urgentes hoje',    value: urgentesHoje,    color: 'text-ads-400',        icon: Zap           },
              { label: 'Críticas / Altas', value: criticas,        color: 'text-status-orange',  icon: AlertTriangle },
              { label: 'Total pendentes',  value: tarefas.length,  color: 'text-ink-primary',    icon: CheckSquare   },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow px-[1rem] py-[0.75rem] card-shadow">
                <div className="flex items-center gap-[0.5rem]">
                  <Icon className={cn('w-[0.875rem] h-[0.875rem]', color)} strokeWidth={1.75} />
                  <span className="text-ink-secondary text-[0.8125rem]">{label}</span>
                </div>
                <span className={cn('text-[1.125rem] font-black', color)}>{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

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
