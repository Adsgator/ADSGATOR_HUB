'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { diasAtrasoCliente } from '@/lib/cobranca'

interface Cliente {
  id: string
  nome: string
  mrr: number
  dias_atraso: number
  data_vencimento: string | null
  status: string
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ProximasCobrancas() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome, mrr, dias_atraso, data_vencimento, status')
      .neq('status', 'cancelado')
      .neq('status', 'inativo')
      .gt('mrr', 0)
      .order('dias_atraso', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setClientes(data ?? [])
        setLoading(false)
      })
  }, [])

  const mrrAtrasado = clientes
    .filter((c) => diasAtrasoCliente(c) > 0)
    .reduce((sum, c) => sum + c.mrr, 0)

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-[1.25rem] card-shadow h-full flex flex-col">
      <div className="flex items-center gap-[0.5rem] mb-[1rem]">
        <Calendar className="w-[1rem] h-[1rem] text-ink-secondary" />
        <span className="text-ink-primary font-semibold text-[0.9375rem]">
          Próximas Cobranças
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-ink-muted text-[0.8125rem]">Carregando...</span>
        </div>
      ) : clientes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-ink-muted text-[0.8125rem]">Nenhuma cobrança encontrada</span>
        </div>
      ) : (
        <ul className="flex-1 flex flex-col gap-[0.5rem] overflow-hidden">
          {clientes.map((c) => {
            const dias = diasAtrasoCliente(c)
            return (
            <li
              key={c.id}
              onClick={() => router.push(`/clientes/${c.id}`)}
              className="flex items-center justify-between gap-[0.5rem] cursor-pointer rounded-lg px-[0.5rem] py-[0.375rem] hover:bg-surface-hover transition-colors"
            >
              <span className="text-ink-primary text-[0.8125rem] truncate flex-1 min-w-0">
                {c.nome}
              </span>
              <span className="text-ink-secondary text-[0.8125rem] shrink-0 font-medium font-mono">
                {formatBRL(c.mrr)}
              </span>
              <span
                className={cn(
                  'px-[0.5rem] py-[0.125rem] rounded-full text-[0.6875rem] font-semibold shrink-0',
                  dias > 0
                    ? 'bg-status-red/10 text-status-red'
                    : 'bg-status-green/10 text-status-green'
                )}
              >
                {dias > 0 ? `${dias}d atraso` : 'em dia'}
              </span>
            </li>
            )
          })}
        </ul>
      )}

      {mrrAtrasado > 0 && (
        <div className="mt-[0.75rem] pt-[0.75rem] border-t border-surface-border flex items-center justify-between">
          <span className="text-ink-muted text-[0.8125rem]">MRR em atraso</span>
          <span className="text-status-red font-semibold text-[0.8125rem] font-mono">
            {formatBRL(mrrAtrasado)}
          </span>
        </div>
      )}
    </div>
  )
}
