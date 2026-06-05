'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, MessageSquare, Bell, X, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fadeUp, slideInLeft } from '@/lib/motion'
import type { ChecklistItem } from '@/lib/types'

interface ChecklistCardProps {
  clienteId: string
  estagioId: string
  items:     ChecklistItem[]
}

interface ItemEditState {
  nota:          string
  lembrete_data: string
}

export function ChecklistCard({ clienteId: _clienteId, estagioId, items: itemsInicial }: ChecklistCardProps) {
  const [items,        setItems]        = useState(itemsInicial)
  const [editando,     setEditando]     = useState<number | null>(null)
  const [editState,    setEditState]    = useState<ItemEditState>({ nota: '', lembrete_data: '' })
  const [salvando,     setSalvando]     = useState(false)

  async function persistir(novosItems: ChecklistItem[]) {
    setItems(novosItems)
    await supabase.from('estagios').update({ checklist: novosItems }).eq('id', estagioId)
  }

  async function toggleItem(index: number) {
    const novos = items.map((it, i) => i === index ? { ...it, done: !it.done } : it)
    await persistir(novos)
  }

  function abrirEdicao(index: number) {
    const it = items[index]
    setEditState({ nota: it.nota ?? '', lembrete_data: it.lembrete_data ?? '' })
    setEditando(index)
  }

  function fecharEdicao() {
    setEditando(null)
    setEditState({ nota: '', lembrete_data: '' })
  }

  async function salvarEdicao(index: number) {
    setSalvando(true)

    const novos = items.map((it, i) =>
      i === index
        ? {
            ...it,
            nota:          editState.nota.trim() || undefined,
            lembrete_data: editState.lembrete_data || undefined,
          }
        : it
    )

    // Se há lembrete, cria notificação no Supabase
    if (editState.lembrete_data) {
      const item = items[index]
      await supabase.from('notificacoes').insert({
        titulo:   `Lembrete: ${item.item}`,
        mensagem: editState.nota.trim() || `Checklist — ${item.item}`,
        tipo:     'info',
        lida:     false,
      })
    }

    await persistir(novos)
    setSalvando(false)
    fecharEdicao()
  }

  async function limparNota(index: number) {
    const novos = items.map((it, i) =>
      i === index ? { ...it, nota: undefined, lembrete_data: undefined } : it
    )
    await persistir(novos)
  }

  const total     = items.length
  const feitos    = items.filter((i) => i.done).length
  const progresso = total > 0 ? (feitos / total) * 100 : 0

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl card-shadow p-[1.25rem]">
      <div className="flex items-center justify-between mb-[0.75rem]">
        <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Checklist</h3>
        <span className="text-ink-muted text-[0.8125rem]">{feitos}/{total}</span>
      </div>

      <div className="h-[0.25rem] bg-surface-hover rounded-full mb-[1rem] overflow-hidden">
        <div
          className="h-full bg-ads-500 rounded-full transition-all duration-500"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <ul className="space-y-[0.25rem]">
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.li key={i} variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="group rounded-lg">
            <div className="flex items-start gap-[0.5rem] px-[0.375rem] py-[0.375rem] rounded-lg hover:bg-surface-hover transition-colors">
              {/* Toggle done */}
              <button
                onClick={() => toggleItem(i)}
                className="shrink-0 mt-[0.0625rem] transition-opacity hover:opacity-70"
              >
                {item.done ? (
                  <CheckCircle className="w-[1rem] h-[1rem] text-status-green" strokeWidth={2} />
                ) : (
                  <Circle className="w-[1rem] h-[1rem] text-ink-muted" strokeWidth={1.75} />
                )}
              </button>

              {/* Label */}
              <span className={`flex-1 text-[0.875rem] leading-snug ${item.done ? 'text-ink-muted line-through' : 'text-ink-secondary'}`}>
                {item.item}

                {/* Badges inline */}
                <span className="inline-flex items-center gap-[0.25rem] ml-[0.375rem]">
                  {item.nota && (
                    <span className="inline-flex items-center gap-[0.125rem] px-[0.3125rem] py-[0.0625rem] rounded-full bg-surface-elevated border border-surface-border/60 text-ink-muted text-[0.625rem]">
                      <MessageSquare className="w-[0.5rem] h-[0.5rem]" strokeWidth={2} />
                      nota
                    </span>
                  )}
                  {item.lembrete_data && (
                    <span className="inline-flex items-center gap-[0.125rem] px-[0.3125rem] py-[0.0625rem] rounded-full bg-ads-500/10 text-ads-500 text-[0.625rem]">
                      <Bell className="w-[0.5rem] h-[0.5rem]" strokeWidth={2} />
                      {new Date(item.lembrete_data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  )}
                </span>
              </span>

              {/* Ação — abre painel inline */}
              <button
                onClick={() => editando === i ? fecharEdicao() : abrirEdicao(i)}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-[1.5rem] h-[1.5rem] rounded-lg flex items-center justify-center hover:bg-surface-elevated text-ink-muted hover:text-ink-secondary"
                title="Adicionar nota / lembrete"
              >
                <MessageSquare className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
              </button>

              {/* Limpar nota */}
              {(item.nota || item.lembrete_data) && editando !== i && (
                <button
                  onClick={() => limparNota(i)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-[1.5rem] h-[1.5rem] rounded-lg flex items-center justify-center hover:bg-status-red/10 text-ink-muted hover:text-status-red"
                  title="Remover nota e lembrete"
                >
                  <X className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Painel inline de edição */}
            <AnimatePresence>
              {editando === i && (
                <motion.div variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="mx-[0.375rem] mb-[0.25rem] p-[0.75rem] rounded-lg bg-surface-elevated border border-surface-border/60">
                <div className="flex flex-col gap-[0.5rem]">
                  <div>
                    <label className="block text-ink-muted text-[0.6875rem] font-medium mb-[0.25rem] uppercase tracking-wide">Nota</label>
                    <textarea
                      value={editState.nota}
                      onChange={(e) => setEditState((s) => ({ ...s, nota: e.target.value }))}
                      placeholder="Adicione uma observação sobre este item…"
                      rows={2}
                      className="w-full px-[0.625rem] py-[0.375rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.8125rem] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500/50 resize-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-muted text-[0.6875rem] font-medium mb-[0.25rem] uppercase tracking-wide">Lembrete</label>
                    <input
                      type="date"
                      value={editState.lembrete_data}
                      onChange={(e) => setEditState((s) => ({ ...s, lembrete_data: e.target.value }))}
                      className="h-[2rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500/50 transition-colors"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-[0.375rem]">
                    <button
                      onClick={fecharEdicao}
                      className="h-[1.75rem] px-[0.625rem] rounded-lg text-[0.75rem] text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => salvarEdicao(i)}
                      disabled={salvando}
                      className="inline-flex items-center gap-[0.25rem] h-[1.75rem] px-[0.625rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white text-[0.75rem] font-medium transition-colors disabled:opacity-50"
                    >
                      <Check className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} />
                      {salvando ? 'Salvando…' : 'Salvar'}
                    </button>
                  </div>
                </div>
              </motion.div>
              )}
            </AnimatePresence>

            {/* Nota existente (quando não está editando) */}
            <AnimatePresence>
              {item.nota && editando !== i && (
                <motion.p variants={slideInLeft} initial="hidden" animate="visible" exit="exit" className="mx-[0.375rem] mb-[0.25rem] px-[0.75rem] py-[0.375rem] rounded-lg bg-surface-elevated border border-surface-border/40 text-ink-muted text-[0.75rem] leading-relaxed italic">
                  {item.nota}
                </motion.p>
              )}
            </AnimatePresence>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
