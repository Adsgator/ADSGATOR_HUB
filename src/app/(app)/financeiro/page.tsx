'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  TrendingUp, DollarSign, AlertCircle,
  MessageCircle, RefreshCw, Users,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { supabase }   from '@/lib/supabase'
import type { FinanceiroLancamento, Cliente } from '@/lib/types'

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const pct = (parte: number, total: number) =>
  total > 0 ? ((parte / total) * 100).toFixed(1) : '0.0'

interface DRE {
  mrr:               number
  custos_fixos:      number
  custos_variaveis:  number
  lucro_bruto:       number
  lucro_liquido:     number
  margem:            number
}

export default function FinanceiroPage() {
  const [dre,       setDre]       = useState<DRE | null>(null)
  const [lancamentos, setLancamentos] = useState<FinanceiroLancamento[]>([])
  const [atrasados, setAtrasados] = useState<Cliente[]>([])
  const [loading,   setLoading]   = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const mesInicio = new Date()
      mesInicio.setDate(1)
      const mesInicioStr = mesInicio.toISOString().split('T')[0]

      const [{ data: lancs }, { data: atr }] = await Promise.all([
        supabase
          .from('financeiro_lancamentos')
          .select('*')
          .gte('data', mesInicioStr)
          .order('data', { ascending: false }),
        supabase
          .from('clientes')
          .select('*')
          .gt('dias_atraso', 0)
          .neq('status', 'cancelado'),
      ])

      const lista = (lancs ?? []) as FinanceiroLancamento[]
      setLancamentos(lista)
      setAtrasados((atr ?? []) as Cliente[])

      const mrr     = lista.filter((l) => l.tipo === 'receita' && l.status === 'confirmado').reduce((s, l) => s + l.valor, 0)
      const fixos   = lista.filter((l) => l.tipo === 'custo_fixo').reduce((s, l) => s + l.valor, 0)
      const variav  = lista.filter((l) => l.tipo === 'custo_variavel').reduce((s, l) => s + l.valor, 0)
      const lucroB  = mrr - fixos
      const lucroL  = lucroB - variav
      setDre({ mrr, custos_fixos: fixos, custos_variaveis: variav, lucro_bruto: lucroB, lucro_liquido: lucroL, margem: mrr > 0 ? (lucroL / mrr) * 100 : 0 })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (loading || !dre) {
    return (
      <MainLayout title="Financeiro" subtitle="Saúde financeira em tempo real">
        <div className="flex items-center justify-center h-[20rem]">
          <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    )
  }

  const kpis = [
    { label: 'MRR',          valor: fmt(dre.mrr),          sub: 'Receita do mês',  icon: TrendingUp,   cor: 'text-ads-500'     },
    { label: 'Lucro Bruto',  valor: fmt(dre.lucro_bruto),  sub: `${pct(dre.lucro_bruto, dre.mrr)}% da receita`, icon: DollarSign, cor: 'text-status-green' },
    { label: 'Custos',       valor: fmt(dre.custos_fixos + dre.custos_variaveis), sub: 'Fixos + Variáveis', icon: AlertCircle, cor: 'text-status-orange' },
    { label: 'Lucro Líquido', valor: fmt(dre.lucro_liquido), sub: `Margem: ${dre.margem.toFixed(1)}%`, icon: TrendingUp, cor: dre.lucro_liquido >= 0 ? 'text-status-green' : 'text-status-red' },
  ]

  return (
    <MainLayout
      title="Financeiro"
      subtitle="Saúde financeira em tempo real"
      actions={
        <button onClick={carregar} className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] hover:text-ink-primary transition-colors">
          <RefreshCw className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          Atualizar
        </button>
      }
    >
      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1rem] mb-[2rem]">
        {kpis.map(({ label, valor, sub, icon: Icon, cor }) => (
          <div key={label} className="bg-surface-card border border-surface-border rounded-xl px-[1.25rem] py-[1rem]">
            <div className="flex items-start justify-between mb-[0.5rem]">
              <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">{label}</p>
              <Icon className={`w-[1rem] h-[1rem] ${cor}`} strokeWidth={1.5} />
            </div>
            <p className={`text-[1.75rem] font-bold leading-none mb-[0.375rem] ${cor}`}>{valor}</p>
            <p className="text-ink-muted text-[0.75rem]">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] mb-[2rem]">
        {/* ── DRE DISTRIBUIÇÃO ── */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1.25rem]">
            Distribuição da Receita
          </h3>
          {[
            { label: 'Custos Variáveis', valor: dre.custos_variaveis,           cor: 'bg-status-orange' },
            { label: 'Custos Fixos',     valor: dre.custos_fixos,               cor: 'bg-status-blue'   },
            { label: 'Lucro Líquido',    valor: Math.max(dre.lucro_liquido, 0), cor: 'bg-ads-500'       },
          ].map(({ label, valor, cor }) => (
            <div key={label} className="mb-[1rem]">
              <div className="flex justify-between items-center mb-[0.375rem]">
                <p className="text-ink-secondary text-[0.875rem]">{label}</p>
                <p className="text-ink-primary text-[0.875rem] font-semibold">
                  {pct(valor, dre.mrr)}% · {fmt(valor)}
                </p>
              </div>
              <div className="h-[0.25rem] bg-surface-hover rounded-full overflow-hidden">
                <div className={`h-full ${cor} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(parseFloat(pct(valor, dre.mrr)), 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── ÚMTIMOS LANÇAMENTOS ── */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1.25rem]">
            Últimos lançamentos do mês
          </h3>
          <div className="flex flex-col gap-[0.75rem]">
            {lancamentos.slice(0, 6).map((l) => (
              <div key={l.id} className="flex items-center justify-between">
                <div>
                  <p className="text-ink-secondary text-[0.875rem]">{l.descricao}</p>
                  <p className="text-ink-muted text-[0.6875rem]">{new Date(l.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <p className={`text-[0.9375rem] font-semibold ${
                  l.tipo === 'receita' ? 'text-status-green' : 'text-status-red'
                }`}>
                  {l.tipo === 'receita' ? '+' : '-'}{fmt(l.valor)}
                </p>
              </div>
            ))}
            {lancamentos.length === 0 && (
              <p className="text-ink-muted text-[0.875rem]">Nenhum lançamento este mês.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── CLIENTES EM ATRASO ── */}
      {atrasados.length > 0 && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
          <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
            <Users className="w-[1rem] h-[1rem] text-status-red" strokeWidth={1.75} />
            <h3 className="text-ink-primary font-semibold text-[0.9375rem]">
              Inadimplentes ({atrasados.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Cliente', 'Atraso', 'MRR', 'Ação'].map((h) => (
                    <th key={h} className="text-left pb-[0.75rem] text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {atrasados.map((c) => (
                  <tr key={c.id} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                    <td className="py-[0.875rem]">
                      <p className="text-ink-primary font-medium text-[0.875rem]">{c.nome}</p>
                      <p className="text-ink-muted text-[0.75rem]">{c.email}</p>
                    </td>
                    <td className="py-[0.875rem]">
                      <span className={`inline-flex items-center text-[0.75rem] font-bold px-[0.5rem] py-[0.125rem] rounded ${
                        (c.dias_atraso ?? 0) >= 30 ? 'bg-status-red/15 text-status-red'
                        : (c.dias_atraso ?? 0) >= 15 ? 'bg-status-orange/15 text-status-orange'
                        : 'bg-yellow-500/15 text-yellow-500'
                      }`}>
                        {c.dias_atraso}d
                      </span>
                    </td>
                    <td className="py-[0.875rem] text-ink-primary font-semibold text-[0.875rem]">
                      {fmt(c.mrr ?? 0)}
                    </td>
                    <td className="py-[0.875rem]">
                      {c.whatsapp && (
                        <a
                          href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-[0.375rem] bg-ads-500/10 hover:bg-ads-500/20 text-ads-500 text-[0.75rem] font-semibold px-[0.625rem] h-[1.75rem] rounded transition-colors"
                        >
                          <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.5} />
                          WhatsApp
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
