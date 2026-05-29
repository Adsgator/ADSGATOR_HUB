'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Cliente {
  id: string
  nome: string
  nicho: string
  mrr: number
  status: string
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function TopPerformers() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome, nicho, mrr, status')
      .eq('status', 'ativo')
      .order('mrr', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setClientes(data ?? [])
        setLoading(false)
      })
  }, [])

  const totalMRR = clientes.reduce((sum, c) => sum + c.mrr, 0)

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-[1.25rem] card-shadow h-full flex flex-col">
      <div className="flex items-center gap-[0.5rem] mb-[1rem]">
        <TrendingUp className="w-[1rem] h-[1rem] text-ads-500" />
        <span className="text-ink-primary font-semibold text-[0.9375rem]">
          Top Clientes
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-ink-muted text-[0.8125rem]">Carregando...</span>
        </div>
      ) : clientes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-ink-muted text-[0.8125rem]">Nenhum cliente ativo</span>
        </div>
      ) : (
        <ul className="flex-1 flex flex-col gap-[0.5rem] overflow-hidden">
          {clientes.map((c, i) => (
            <li
              key={c.id}
              onClick={() => router.push(`/clientes/${c.id}`)}
              className="flex items-center gap-[0.75rem] cursor-pointer rounded-lg px-[0.5rem] py-[0.375rem] hover:bg-surface-hover transition-colors"
            >
              <div className="w-[1.25rem] shrink-0 flex items-center justify-center">
                {i === 0 ? (
                  <Star
                    className="w-[1rem] h-[1rem]"
                    style={{ color: '#FFB100', fill: '#FFB100' }}
                  />
                ) : (
                  <span className="text-ink-muted text-[0.75rem] font-semibold">{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ink-primary text-[0.8125rem] truncate font-medium">
                  {c.nome}
                </p>
                <p className="text-ink-muted text-[0.75rem] truncate">{c.nicho}</p>
              </div>
              <span className="text-ink-secondary text-[0.8125rem] shrink-0 font-mono font-medium">
                {formatBRL(c.mrr)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {totalMRR > 0 && (
        <div className="mt-[0.75rem] pt-[0.75rem] border-t border-surface-border flex items-center justify-between">
          <span className="text-ink-muted text-[0.8125rem]">MRR total (top 5)</span>
          <span className="text-ads-500 font-semibold text-[0.8125rem] font-mono">
            {formatBRL(totalMRR)}
          </span>
        </div>
      )}
    </div>
  )
}
