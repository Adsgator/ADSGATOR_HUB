'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  BarChart2, TrendingUp, ArrowUpRight, RefreshCw,
  MousePointerClick, DollarSign, AlertTriangle,
  Users, Globe, Zap,
} from 'lucide-react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  BarChart,
} from 'recharts'
import { MainLayout }  from '@/components/layout/MainLayout'
import { supabase }    from '@/lib/supabase'
import type { AnalyticsSnapshot, Cliente } from '@/lib/types'

const fmt  = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
const fmtN = (v: number) => new Intl.NumberFormat('pt-BR').format(v)

function conv(v: number | null) {
  if (!v) return '0'
  return Number.isInteger(v) ? String(v) : `${v.toFixed(1)}*`
}

interface ClienteSnap {
  cliente:   Cliente
  snapshots: AnalyticsSnapshot[]
  ultimo:    AnalyticsSnapshot | null
}

export default function AnalyticsPage() {
  const [dados,    setDados]    = useState<ClienteSnap[]>([])
  const [loading,  setLoading]  = useState(true)
  const [clienteSel, setClienteSel] = useState<string>('')
  const [alertas,  setAlertas]  = useState<{ id: string; tipo: string; mensagem: string }[]>([])

  const carregar = useCallback(async () => {
    setLoading(true)
    const [{ data: clientes }, { data: snaps }, { data: alertasDb }] = await Promise.all([
      supabase.from('clientes').select('*').in('status', ['ativo', 'onboarding', 'setup_trafego']),
      supabase.from('analytics_snapshots').select('*').order('periodo_fim', { ascending: false }).limit(500),
      supabase.from('alertas').select('id, tipo, mensagem').eq('resolvido', false).order('created_at', { ascending: false }).limit(10),
    ])

    const cl    = (clientes ?? []) as Cliente[]
    const snAll = (snaps    ?? []) as AnalyticsSnapshot[]

    const resultado: ClienteSnap[] = cl.map((c) => {
      const csn = snAll.filter((s) => s.cliente_id === c.id).sort((a, b) => b.periodo_fim.localeCompare(a.periodo_fim))
      return { cliente: c, snapshots: csn, ultimo: csn[0] ?? null }
    })

    setDados(resultado)
    setAlertas((alertasDb ?? []) as { id: string; tipo: string; mensagem: string }[])
    if (!clienteSel && resultado.length > 0) setClienteSel(resultado[0].cliente.id)
    setLoading(false)
  }, [clienteSel])

  useEffect(() => { carregar() }, [carregar])

  // ── KPIs agregados ────────────────────────────────────────────────
  const totais = dados.reduce((acc, { ultimo: u }) => {
    if (!u) return acc
    return {
      invest:     acc.invest     + (u.investimento ?? 0),
      cliques:    acc.cliques    + (u.cliques      ?? 0),
      impressoes: acc.impressoes + (u.impressoes   ?? 0),
      conversoes: acc.conversoes + (u.conversoes   ?? 0),
      sessoes:    acc.sessoes    + (u.sessoes      ?? 0),
    }
  }, { invest: 0, cliques: 0, impressoes: 0, conversoes: 0, sessoes: 0 })

  const ctrMedio = totais.impressoes > 0 ? (totais.cliques / totais.impressoes) * 100 : 0
  const cpaMedio = totais.conversoes > 0 ? totais.invest / totais.conversoes : 0

  // ── Cliente selecionado ───────────────────────────────────────────
  const selData    = dados.find((d) => d.cliente.id === clienteSel)
  const chartData  = (selData?.snapshots ?? []).slice(0, 12).reverse().map((s) => ({
    mes:         s.periodo_fim.slice(0, 7),
    invest:      Math.round(s.investimento ?? 0),
    conversoes:  s.conversoes ?? 0,
    sessoes:     s.sessoes ?? 0,
  }))

  // ── GA4 — top tráfego por cliente ────────────────────────────────
  const ga4Data = dados
    .filter((d) => (d.ultimo?.sessoes ?? 0) > 0)
    .map((d) => ({ nome: d.cliente.nome.split(' ')[0], sessoes: d.ultimo?.sessoes ?? 0 }))
    .sort((a, b) => b.sessoes - a.sessoes)
    .slice(0, 6)

  return (
    <MainLayout
      title="Analytics"
      subtitle="Performance agregada de todas as contas"
      actions={
        <button
          onClick={carregar}
          disabled={loading}
          className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] hover:text-ink-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-[0.875rem] h-[0.875rem] ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
          Atualizar
        </button>
      }
    >
      {/* ══ SEÇÃO 1 — KPI RESUMO GERAL ════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1rem] mb-[2rem]">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[6rem] rounded-xl bg-surface-card border border-surface-border animate-pulse" />)
          : [
              { label: 'Investimento Total', valor: fmt(totais.invest),   icon: DollarSign,       cor: 'text-status-blue'   },
              { label: 'Conversões',         valor: conv(totais.conversoes), icon: ArrowUpRight,  cor: 'text-ads-500',       sub: '* fracionadas' },
              { label: 'CTR Médio',          valor: `${ctrMedio.toFixed(2)}%`, icon: MousePointerClick, cor: 'text-status-purple' },
              { label: 'CPA Médio',          valor: fmt(cpaMedio),         icon: TrendingUp,       cor: 'text-status-orange' },
            ].map(({ label, valor, icon: Icon, cor, sub }) => (
              <div key={label} className="bg-surface-card border border-surface-border rounded-xl px-[1.25rem] py-[1rem]">
                <div className="flex items-start justify-between mb-[0.375rem]">
                  <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">{label}</p>
                  <Icon className={`w-[0.875rem] h-[0.875rem] ${cor}`} strokeWidth={1.5} />
                </div>
                <p className={`text-[1.625rem] font-bold leading-none ${cor}`}>{valor}</p>
                {sub && <p className="text-ink-muted text-[0.625rem] mt-[0.25rem]">{sub}</p>}
              </div>
            ))
        }
      </div>

      {/* ══ SEÇÃO 2 — POR CLIENTE ══════════════════════════════════════ */}
      <h2 className="text-ink-primary font-semibold text-[0.9375rem] mb-[0.875rem]">Por Cliente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1rem] mb-[2rem]">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[9rem] rounded-xl bg-surface-card border border-surface-border animate-pulse" />)
          : dados.map(({ cliente: c, ultimo: u }) => {
              const cpa  = (u?.conversoes ?? 0) > 0 ? (u?.investimento ?? 0) / u!.conversoes! : null
              const ctr  = (u?.impressoes ?? 0) > 0 ? ((u?.cliques ?? 0) / u!.impressoes!) * 100 : null
              const ativo = (u?.investimento ?? 0) > 0
              return (
                <button
                  key={c.id}
                  onClick={() => setClienteSel(c.id)}
                  className={`text-left bg-surface-card border rounded-xl p-[1rem] transition-colors hover:border-ads-500/40 ${clienteSel === c.id ? 'border-ads-500' : 'border-surface-border'}`}
                >
                  <div className="flex items-center justify-between mb-[0.625rem]">
                    <p className="text-ink-primary font-semibold text-[0.875rem] truncate">{c.nome}</p>
                    <div className={`w-[0.5rem] h-[0.5rem] rounded-full shrink-0 ${ativo ? 'bg-status-green' : 'bg-ink-muted'}`} />
                  </div>
                  {u ? (
                    <div className="grid grid-cols-2 gap-x-[1rem] gap-y-[0.25rem] text-[0.75rem]">
                      <span className="text-ink-muted">Invest.</span>
                      <span className="text-ink-secondary font-medium">{fmt(u.investimento ?? 0)}</span>
                      <span className="text-ink-muted">Conversões</span>
                      <span className="text-ink-secondary font-medium">{conv(u.conversoes ?? 0)}</span>
                      <span className="text-ink-muted">CTR</span>
                      <span className="text-ink-secondary font-medium">{ctr !== null ? `${ctr.toFixed(2)}%` : '—'}</span>
                      <span className="text-ink-muted">CPA</span>
                      <span className={`font-medium ${cpa !== null && cpa > 200 ? 'text-status-orange' : 'text-ink-secondary'}`}>{cpa !== null ? fmt(cpa) : '—'}</span>
                    </div>
                  ) : (
                    <p className="text-ink-muted text-[0.75rem] italic">Sem snapshots ainda</p>
                  )}
                </button>
              )
            })
        }
      </div>

      {/* ══ SEÇÃO 3 — DETALHE POR CAMPANHA ════════════════════════════ */}
      {selData && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] mb-[2rem]">
          <div className="flex items-center justify-between mb-[1.25rem]">
            <h2 className="text-ink-primary font-semibold text-[0.9375rem]">
              Detalhe — {selData.cliente.nome}
            </h2>
            <a
              href={`/clientes/${selData.cliente.id}`}
              className="text-ads-500 text-[0.8125rem] hover:underline"
            >
              Ver cliente →
            </a>
          </div>

          {chartData.length > 1 ? (
            <div className="h-[14rem]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                    formatter={(v: unknown, name: unknown) => { const n = name as string; const val = Number(v); return [n === 'invest' ? fmt(val) : fmtN(val), n === 'invest' ? 'Investimento' : 'Conversões'] as [string, string] }}
                  />
                  <Legend formatter={(v) => v === 'invest' ? 'Investimento' : 'Conversões'} wrapperStyle={{ fontSize: '0.75rem' }} />
                  <Bar  yAxisId="left"  dataKey="invest"     fill="#3B82F6" opacity={0.7} radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" dataKey="conversoes" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-ink-muted text-[0.875rem] italic text-center py-[2rem]">Snapshots insuficientes para gerar gráfico.</p>
          )}
        </div>
      )}

      {/* ══ SEÇÃO 4 — GA4 TOP TRÁFEGO ═════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] mb-[2rem]">
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
          <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
            <Globe className="w-[0.875rem] h-[0.875rem] text-status-blue" strokeWidth={1.75} />
            <h3 className="text-ink-primary font-semibold text-[0.9375rem]">GA4 — Sessões por Cliente</h3>
          </div>
          {ga4Data.length > 0 ? (
            <div className="h-[10rem]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ga4Data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="nome" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                    formatter={(v: unknown) => [fmtN(Number(v)), 'Sessões'] as [string, string]}
                  />
                  <Bar dataKey="sessoes" fill="#3B82F6" opacity={0.75} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-ink-muted text-[0.875rem] italic">Sem dados GA4 disponíveis.</p>
          )}
        </div>

        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
          <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
            <Users className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={1.75} />
            <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Métricas GA4</h3>
          </div>
          <div className="flex flex-col gap-[0.625rem]">
            {dados.filter((d) => d.ultimo?.sessoes).slice(0, 5).map(({ cliente: c, ultimo: u }) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-ink-secondary text-[0.8125rem] truncate max-w-[10rem]">{c.nome}</span>
                <div className="flex items-center gap-[1rem] text-[0.75rem]">
                  <span className="text-ink-muted">{fmtN(u?.sessoes ?? 0)} sess.</span>
                  <span className="text-ink-muted">{((u?.taxa_conversao ?? 0) * 100).toFixed(1)}% conv.</span>
                  <span className="text-status-green font-medium">{fmtN(u?.usuarios ?? 0)} usr</span>
                </div>
              </div>
            ))}
            {dados.filter((d) => d.ultimo?.sessoes).length === 0 && (
              <p className="text-ink-muted text-[0.875rem] italic">Sem dados GA4 disponíveis.</p>
            )}
          </div>
        </div>
      </div>

      {/* ══ SEÇÃO 5 — ALERTAS EM TEMPO REAL ═══════════════════════════ */}
      {alertas.length > 0 && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
          <div className="flex items-center gap-[0.5rem] mb-[1rem]">
            <AlertTriangle className="w-[0.875rem] h-[0.875rem] text-status-orange" strokeWidth={2} />
            <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Alertas em Tempo Real</h3>
            <span className="ml-auto text-[0.6875rem] font-semibold bg-status-orange/15 text-status-orange px-[0.375rem] py-[0.0625rem] rounded-full">{alertas.length}</span>
          </div>
          <div className="flex flex-col gap-[0.5rem]">
            {alertas.map((a) => (
              <div key={a.id} className="flex items-start gap-[0.625rem] p-[0.625rem] rounded-lg bg-status-orange/10">
                <Zap className="w-[0.75rem] h-[0.75rem] text-status-orange mt-[0.125rem] shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[0.8125rem] font-semibold text-status-orange leading-tight">{a.tipo}</p>
                  <p className="text-[0.75rem] text-ink-secondary">{a.mensagem}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-ink-muted text-[0.625rem] mt-[0.75rem]">* Conversões fracionadas = data-driven attribution do Google Ads</p>
        </div>
      )}

      {dados.length === 0 && !loading && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-[4rem] text-center">
          <BarChart2 className="w-[3rem] h-[3rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
          <h3 className="text-ink-primary font-semibold text-[1rem] mb-[0.5rem]">Sem dados ainda</h3>
          <p className="text-ink-secondary text-[0.875rem] max-w-[24rem] mx-auto">
            Cadastre clientes e aguarde a sincronização dos snapshots de analytics.
          </p>
        </div>
      )}
    </MainLayout>
  )
}
