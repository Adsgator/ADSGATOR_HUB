'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowDownLeft, ArrowUpRight, Receipt } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Lancamento {
  id:        string
  descricao: string
  valor:     number
  tipo:      'receita' | 'custo_fixo' | 'custo_variavel'
  categoria: string | null
  data:      string
  status:    string | null
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export function RecentTransactions() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    let ativo = true
    ;(async () => {
      const { data } = await supabase
        .from('financeiro_lancamentos')
        .select('id, descricao, valor, tipo, categoria, data, status')
        .order('data', { ascending: false })
        .limit(7)
      if (ativo) {
        setLancamentos((data ?? []) as Lancamento[])
        setLoading(false)
      }
    })()
    return () => { ativo = false }
  }, [])

  return (
    <div className="h-full flex flex-col p-[1.25rem]">
      <div className="flex items-center justify-between mb-[1rem]">
        <div className="flex items-center gap-[0.5rem]">
          <Receipt className="w-[1rem] h-[1rem] text-ink-secondary" strokeWidth={1.75} />
          <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Transações Recentes</h3>
        </div>
        <Link href="/financeiro" className="text-ads-500 text-[0.75rem] hover:underline">Ver todas</Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-[0.5rem]">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-[2.5rem] rounded-lg skeleton-shimmer" />)}
        </div>
      ) : lancamentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-ink-muted gap-[0.5rem]">
          <Receipt className="w-[2rem] h-[2rem]" strokeWidth={1} />
          <p className="text-[0.8125rem]">Nenhum lançamento registrado</p>
        </div>
      ) : (
        <div className="flex flex-col overflow-y-auto flex-1">
          {lancamentos.map((l) => {
            const receita = l.tipo === 'receita'
            return (
              <div key={l.id} className="flex items-center gap-[0.75rem] py-[0.625rem] border-b border-surface-border/40 last:border-0">
                <div className={`w-[2rem] h-[2rem] rounded-full flex items-center justify-center shrink-0 ${receita ? 'bg-status-green/15' : 'bg-status-red/15'}`}>
                  {receita
                    ? <ArrowDownLeft className="w-[0.875rem] h-[0.875rem] text-status-green" strokeWidth={2} />
                    : <ArrowUpRight className="w-[0.875rem] h-[0.875rem] text-status-red" strokeWidth={2} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ink-primary text-[0.8125rem] font-medium truncate leading-tight">{l.descricao || (receita ? 'Receita' : 'Despesa')}</p>
                  <p className="text-ink-muted text-[0.6875rem]">
                    {l.categoria ? `${l.categoria} · ` : ''}{new Date(l.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <span className={`text-[0.8125rem] font-semibold shrink-0 ${receita ? 'text-status-green' : 'text-status-red'}`}>
                  {receita ? '+' : '-'}{fmt(Math.abs(l.valor))}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
