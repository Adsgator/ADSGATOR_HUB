'use client'

import { useState } from 'react'
import { CheckCircle, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ChecklistItem } from '@/lib/types'

interface ChecklistCardProps {
  clienteId: string
  estagioId: string
  items:     ChecklistItem[]
}

export function ChecklistCard({ clienteId: _clienteId, estagioId, items: itemsInicial }: ChecklistCardProps) {
  const supabase = createClient()
  const [items, setItems] = useState(itemsInicial)

  async function toggleItem(index: number) {
    const novosItems = items.map((it, i) =>
      i === index ? { ...it, done: !it.done } : it
    )
    setItems(novosItems)
    await supabase
      .from('estagios')
      .update({ checklist: novosItems })
      .eq('id', estagioId)
  }

  const total    = items.length
  const feitos   = items.filter((i) => i.done).length
  const progresso = total > 0 ? (feitos / total) * 100 : 0

  return (
    <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem]">
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

      <ul className="space-y-[0.5rem]">
        {items.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => toggleItem(i)}
              className="flex items-start gap-[0.625rem] w-full text-left hover:opacity-80 transition-opacity"
            >
              {item.done ? (
                <CheckCircle className="w-[1rem] h-[1rem] text-status-green shrink-0 mt-[0.125rem]" strokeWidth={2} />
              ) : (
                <Circle className="w-[1rem] h-[1rem] text-ink-muted shrink-0 mt-[0.125rem]" strokeWidth={1.75} />
              )}
              <span className={`text-[0.875rem] ${item.done ? 'text-ink-muted line-through' : 'text-ink-secondary'}`}>
                {item.item}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
