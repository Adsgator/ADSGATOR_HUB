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
  const corLinha = positivo ? '#10B981' : '#EF4444'

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
      <div className="flex items-center justify-between mb-[1rem]">
        <p className="text-ink-primary font-bold text-base">DRE Resumo</p>
      </div>

      {/* Árvore DRE com números premium */}
      <div className="flex flex-col gap-[0.5rem] mb-[1.25rem]">
        {/* MRR - destaque principal */}
        <div className="flex items-center justify-between">
          <span className="text-ink-muted text-sm">MRR</span>
          <span className="text-[2rem] font-black text-ink-primary">{fmt(dre.mrr)}</span>
        </div>

        {/* Custos */}
        <div className="flex items-center justify-between">
          <span className="text-ink-muted text-sm">Custos</span>
          <span className="text-lg font-semibold text-status-red">-{fmt(dre.custos)}</span>
        </div>

        {/* Lucro Líquido */}
        <div className="flex items-center justify-between border-t border-surface-border pt-2">
          <span className="text-ink-muted text-sm">Lucro Líquido</span>
          <span className={`text-[1.5rem] font-bold ${positivo ? 'text-status-green' : 'text-status-red'}`}>
            {fmt(dre.lucro)}
          </span>
        </div>

        {/* Margem como badge */}
        <div className="flex items-center justify-end">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${positivo ? 'bg-status-green/10 text-status-green' : 'bg-status-red/10 text-status-red'}`}>
            {positivo
              ? <TrendingUp className="w-3 h-3" strokeWidth={2} />
              : <TrendingDown className="w-3 h-3" strokeWidth={2} />
            }
            Margem {dre.margem.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Sparkline premium */}
      {dre.spark.length > 1 && (
        <div className="h-[3.5rem] mb-[1rem]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dre.spark}>
              <Line
                type="monotone"
                dataKey="lucro"
                stroke={corLinha}
                strokeWidth={2}
                dot={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#141A12',
                  border: '1px solid #44523F',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                }}
                labelStyle={{ color: '#F0F3EF', fontSize: '0.75rem', marginBottom: '0.25rem' }}
                itemStyle={{ color: '#F0F3EF', fontSize: '0.8125rem' }}
                formatter={(value) => [fmt(Number(value) || 0), 'Lucro']}
                labelFormatter={(label) => `Mês: ${label}`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Link rodapé */}
      <a
        href="/financeiro"
        className="group flex items-center justify-center gap-1 text-sm text-ads-500 hover:text-ads-400 transition-colors"
      >
        Ver DRE completo
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
      </a>
    </div>
  )
}
