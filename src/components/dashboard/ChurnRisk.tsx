'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Cliente {
  id: string
  nome: string
  nicho: string
  status: string
  dias_atraso: number
  mrr: number
}

type RiskLevel = 'Alto' | 'Médio' | 'Baixo'

function getRisk(c: Cliente): RiskLevel {
  if (c.dias_atraso > 3) return 'Alto'
  if (c.status === 'congelado') return 'Médio'
  return 'Baixo'
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const riskStyle: Record<RiskLevel, string> = {
  Alto: 'bg-status-red/10 text-status-red',
  Médio: 'bg-status-orange/10 text-status-orange',
  Baixo: 'bg-status-yellow/10 text-status-yellow',
}

export function ChurnRisk() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome, nicho, status, dias_atraso, mrr')
      .or('dias_atraso.gt.0,status.eq.congelado')
      .neq('status', 'cancelado')
      .order('dias_atraso', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setClientes(data ?? [])
        setLoading(false)
      })
  }, [])

  const mrrAtRisk = clientes.reduce((sum, c) => sum + c.mrr, 0)

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-[1.25rem] card-shadow h-full flex flex-col">
      <div className="flex items-center gap-[0.5rem] mb-[1rem]">
        <AlertTriangle className="w-[1rem] h-[1rem] text-status-orange" />
        <span className="text-ink-primary font-semibold text-[0.9375rem]">
          Risco de Churn
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-ink-muted text-[0.8125rem]">Carregando...</span>
        </div>
      ) : clientes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-ink-muted text-[0.8125rem]">Nenhum cliente em risco</span>
        </div>
      ) : (
        <ul className="flex-1 flex flex-col gap-[0.5rem] overflow-hidden">
          {clientes.map((c) => {
            const risk = getRisk(c)
            return (
              <li
                key={c.id}
                onClick={() => router.push(`/clientes/${c.id}`)}
                className="flex items-center gap-[0.5rem] cursor-pointer rounded-lg px-[0.5rem] py-[0.375rem] hover:bg-surface-hover transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-ink-primary text-[0.8125rem] truncate font-medium">
                    {c.nome}
                  </p>
                  <p className="text-ink-muted text-[0.75rem] truncate">{c.nicho}</p>
                </div>
                <span
                  className={cn(
                    'px-[0.5rem] py-[0.125rem] rounded-full text-[0.6875rem] font-semibold shrink-0',
                    riskStyle[risk]
                  )}
                >
                  {risk}
                </span>
                <span className="text-ink-secondary text-[0.8125rem] shrink-0 font-mono">
                  {formatBRL(c.mrr)}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {mrrAtRisk > 0 && (
        <div className="mt-[0.75rem] pt-[0.75rem] border-t border-surface-border flex items-center justify-between">
          <span className="text-ink-muted text-[0.8125rem]">MRR em risco</span>
          <span className="text-status-orange font-semibold text-[0.8125rem] font-mono">
            {formatBRL(mrrAtRisk)}
          </span>
        </div>
      )}
    </div>
  )
}
