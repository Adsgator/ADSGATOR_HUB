'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import { supabase } from '@/lib/supabase'

interface DREData {
  mrr:         number
  custos:      number
  lucro:       number
  margem:      number
  spark:       { mes: string; lucro: number }[]
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export function DRESparkline() {
  const [dre,     setDre]     = useState<DREData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const [{ data: clientes }, { data: config }, { data: lancamentos }] = await Promise.all([
        supabase.from('clientes').select('mrr').eq('status', 'ativo'),
        supabase.from('configuracoes_financeiras').select('custos_fixos_mensais,custos_variaveis_percentual').eq('agencia_id', 'adsgator-main').single(),
        supabase.from('financeiro_lancamentos').select('valor, tipo, created_at').order('created_at', { ascending: false }).limit(120),
      ])

      const mrr    = (clientes ?? []).reduce((s, c) => s + (c.mrr ?? 0), 0)
      const fixos  = (config as { custos_fixos_mensais?: number } | null)?.custos_fixos_mensais  ?? 0
      const varPct = (config as { custos_variaveis_percentual?: number } | null)?.custos_variaveis_percentual ?? 0
      const custos = fixos + mrr * (varPct / 100)
      const lucro  = mrr - custos
      const margem = mrr > 0 ? (lucro / mrr) * 100 : 0

      // Agrupar por mês (últimos 6 meses)
      const porMes: Record<string, number> = {}
      for (const l of (lancamentos ?? []) as { valor: number; tipo: string; created_at: string }[]) {
        const mes = l.created_at.slice(0, 7)
        const sinal = l.tipo === 'receita' ? 1 : -1
        porMes[mes] = (porMes[mes] ?? 0) + sinal * l.valor
      }
      const spark = Object.entries(porMes)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([mes, lucro]) => ({ mes, lucro }))

      setDre({ mrr, custos, lucro, margem, spark })
      setLoading(false)
    }
    carregar()
  }, [])

  if (loading) {
    return <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] h-[10rem] animate-pulse" />
  }

  if (!dre) return null

  const positivo = dre.lucro >= 0

  return (
    <a href="/financeiro" className="group block bg-surface-card border border-surface-border rounded-xl p-[1.25rem] hover:border-ads-500/30 transition-colors">
      <div className="flex items-center justify-between mb-[1rem]">
        <p className="text-ink-primary font-semibold text-[0.875rem]">DRE Resumo</p>
        <ChevronRight className="w-[0.875rem] h-[0.875rem] text-ink-muted group-hover:text-ads-500 transition-colors" strokeWidth={1.5} />
      </div>

      {/* Árvore DRE */}
      <div className="flex flex-col gap-[0.375rem] mb-[1rem]">
        {[
          { label: 'MRR',            value: dre.mrr,     color: 'text-ink-primary'  },
          { label: 'Custos',         value: -dre.custos, color: 'text-status-red'   },
          { label: 'Lucro Líquido',  value: dre.lucro,   color: positivo ? 'text-status-green' : 'text-status-red' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-ink-muted text-[0.75rem]">{label}</span>
            <span className={`text-[0.875rem] font-semibold ${color}`}>{fmt(Math.abs(value))}</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-surface-border pt-[0.375rem]">
          <span className="text-ink-muted text-[0.75rem]">Margem</span>
          <div className={`flex items-center gap-[0.25rem] ${positivo ? 'text-status-green' : 'text-status-red'}`}>
            {positivo
              ? <TrendingUp  className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
              : <TrendingDown className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            }
            <span className="text-[0.875rem] font-semibold">{dre.margem.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Sparkline */}
      {dre.spark.length > 1 && (
        <div className="h-[3.5rem]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dre.spark}>
              <Line
                type="monotone"
                dataKey="lucro"
                stroke={positivo ? '#10B981' : '#EF4444'}
                strokeWidth={1.5}
                dot={false}
              />
              <Tooltip
                contentStyle={{ display: 'none' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </a>
  )
}
