'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  BarChart2, TrendingUp, ArrowUpRight, RefreshCw,
  MousePointerClick, DollarSign, AlertTriangle,
  Users, Globe, Zap, Calendar, ChevronDown,
} from 'lucide-react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  BarChart,
} from 'recharts'
import { MainLayout }  from '@/components/layout/MainLayout'
import { supabase }    from '@/lib/supabase'
import { toast } from 'sonner'
import type { AnalyticsSnapshot, Cliente } from '@/lib/types'

// Novos componentes analytics
import { AdsOverviewKpis } from '@/components/analytics/AdsOverviewKpis'
import { SearchTermsTable } from '@/components/analytics/SearchTermsTable'
import { DemographicsCard } from '@/components/analytics/DemographicsCard'
import { GeographyBreakdown } from '@/components/analytics/GeographyBreakdown'
import { DeviceBreakdown } from '@/components/analytics/DeviceBreakdown'
import { GA4Panel } from '@/components/analytics/GA4Panel'
import { TrafficSources } from '@/components/analytics/TrafficSources'

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

type Periodo = '7d' | '30d' | '90d'

interface LiveAnalyticsData {
  googleAds: {
    enabled: boolean
    campanhas: Array<{
      campanha_id: string
      campanha_nome: string
      impressoes: number
      cliques: number
      ctr: number
      custo_total: number
      conversoes: number
      cpa: number
      roas: number
    }>
    termosPesquisa: Array<{
      termo: string
      impressoes: number
      cliques: number
      ctr: number
      conversoes: number
      custo: number
    }>
    demografia: Array<{
      faixa_etaria: string
      genero: string
      impressoes: number
      cliques: number
      conversoes: number
      custo: number
    }>
    geografia: Array<{
      pais: string
      estado: string
      cidade: string
      impressoes: number
      cliques: number
      conversoes: number
      custo: number
    }>
    device: Array<{
      device: string
      impressoes: number
      cliques: number
      ctr: number
      conversoes: number
      custo: number
    }>
  }
  ga4: {
    enabled: boolean
    dados: {
      sessoes: number
      usuarios_novos: number
      visualizacoes_pagina: number
      taxa_engajamento: number
      duracao_media_sessao: number
      taxa_rejeicao: number
      conversoes: number
      valor_conversao_total: number
    } | null
    paginasTop: Array<{
      pagina: string
      visualizacoes: number
      usuarios_unicos: number
      taxa_engajamento: number
      tempo_medio_segundos: number
    }>
    fontesTrafego: Array<{
      fonte: string
      midia: string
      sessoes: number
      conversoes: number
      taxa_conversao: number
    }>
    geografia: Array<{
      pais: string
      estado: string
      cidade: string
      sessoes: number
      usuarios: number
      taxa_engajamento: number
    }>
    device: Array<{
      device: string
      sistema_operacional: string
      sessoes: number
      usuarios: number
      taxa_engajamento: number
    }>
  }
}

export default function AnalyticsPage() {
  const [dados,    setDados]    = useState<ClienteSnap[]>([])
  const [loading,  setLoading]  = useState(true)
  const [clienteSel, setClienteSel] = useState<string>('')
  const [alertas,  setAlertas]  = useState<{ id: string; tipo: string; mensagem: string }[]>([])
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [liveData, setLiveData] = useState<LiveAnalyticsData | null>(null)
  const [loadingLive, setLoadingLive] = useState(false)

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

  // Buscar dados live quando cliente ou período mudar
  const carregarLive = useCallback(async () => {
    if (!clienteSel) return
    setLoadingLive(true)
    try {
      const res = await fetch(`/api/analytics/${clienteSel}/live?periodo=${periodo}`)
      if (res.ok) {
        const data = await res.json()
        setLiveData(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados live:', error)
      toast.error('Erro ao carregar dados em tempo real')
    } finally {
      setLoadingLive(false)
    }
  }, [clienteSel, periodo])

  useEffect(() => {
    carregarLive()
  }, [carregarLive])

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(carregarLive, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [carregarLive])

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

  // Agregar dados live para KPIs
  const liveKpiData = liveData?.googleAds?.campanhas?.reduce((acc, c) => ({
    impressoes: acc.impressoes + (c.impressoes || 0),
    cliques: acc.cliques + (c.cliques || 0),
    custo_total: acc.custo_total + (c.custo_total || 0),
    conversoes: acc.conversoes + (c.conversoes || 0),
  }), { impressoes: 0, cliques: 0, custo_total: 0, conversoes: 0 }) || { impressoes: 0, cliques: 0, custo_total: 0, conversoes: 0 }

  const liveCtr = liveKpiData.impressoes > 0 ? (liveKpiData.cliques / liveKpiData.impressoes) * 100 : 0
  const liveCpa = liveKpiData.conversoes > 0 ? liveKpiData.custo_total / liveKpiData.conversoes : 0

  const periodoLabel: Record<Periodo, string> = {
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    '90d': 'Últimos 90 dias',
  }

  return (
    <MainLayout
      title="Analytics"
      subtitle={selData ? `Cliente: ${selData.cliente.nome}` : 'Selecione um cliente para ver detalhes'}
      actions={
        <div className="flex items-center gap-[0.5rem]">
          {/* Seletor de período */}
          <div className="relative">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as Periodo)}
              className="appearance-none bg-surface-hover border border-surface-border rounded-[0.375rem] pl-[0.75rem] pr-[2rem] h-[2rem] text-[0.8125rem] text-ink-secondary focus:outline-none focus:border-ads-500 transition-colors"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
            <Calendar className="absolute right-[0.5rem] top-1/2 -translate-y-1/2 w-[0.875rem] h-[0.875rem] text-ink-muted pointer-events-none" strokeWidth={1.5} />
          </div>
          <button
            onClick={() => { carregar(); carregarLive(); }}
            disabled={loading || loadingLive}
            className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] hover:text-ink-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-[0.875rem] h-[0.875rem] ${loading || loadingLive ? 'animate-spin' : ''}`} strokeWidth={1.75} />
          </button>
        </div>
      }
    >
      {/* ══ SEÇÃO 1 — KPI RESUMO GERAL ════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1rem] mb-[2rem]">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[6rem] rounded-xl skeleton-shimmer border border-surface-border" />)
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
          ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[9rem] rounded-xl skeleton-shimmer border border-surface-border" />)
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

      {/* ══ SEÇÃO 4 — LIVE ANALYTICS PREMIUM ═════════════════════════ */}
      {selData && liveData && (
        <div className="mb-[2rem]">
          <div className="flex items-center justify-between mb-[1rem]">
            <h2 className="text-ink-primary font-bold text-base">
              Dados ao vivo — {periodoLabel[periodo]}
            </h2>
            {loadingLive && (
              <span className="text-xs text-ads-500 animate-pulse">Atualizando...</span>
            )}
          </div>

          {/* Google Ads KPIs */}
          {liveData.googleAds.enabled && (
            <div className="mb-[1rem]">
              <h3 className="text-[0.875rem] font-medium text-ink-muted mb-[0.75rem]">Google Ads</h3>
              <AdsOverviewKpis
                data={{
                  ...liveKpiData,
                  ctr: liveCtr,
                  cpa: liveCpa,
                  roas: liveKpiData.conversoes > 0 ? liveKpiData.custo_total / liveKpiData.conversoes : 0,
                }}
                loading={loadingLive}
              />
            </div>
          )}

          {/* GA4 KPIs */}
          {liveData.ga4.enabled && liveData.ga4.dados && (
            <div className="mb-[1rem]">
              <h3 className="text-[0.875rem] font-medium text-ink-muted mb-[0.75rem]">Google Analytics 4</h3>
              <GA4Panel data={liveData.ga4.dados} loading={loadingLive} />
            </div>
          )}

          {/* Grid de detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1rem]">
            {/* Termos de Pesquisa */}
            {liveData.googleAds.enabled && liveData.googleAds.termosPesquisa.length > 0 && (
              <div className="bg-surface-card border border-surface-border rounded-xl p-[1rem]">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Termos de Pesquisa</h4>
                <SearchTermsTable data={liveData.googleAds.termosPesquisa} loading={loadingLive} maxRows={5} />
              </div>
            )}

            {/* Demografia */}
            {liveData.googleAds.enabled && liveData.googleAds.demografia.length > 0 && (
              <div className="bg-surface-card border border-surface-border rounded-xl p-[1rem]">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Demografia</h4>
                <DemographicsCard data={liveData.googleAds.demografia} loading={loadingLive} />
              </div>
            )}

            {/* Geografia */}
            {(liveData.googleAds.geografia.length > 0 || liveData.ga4.geografia.length > 0) && (
              <div className="bg-surface-card border border-surface-border rounded-xl p-[1rem]">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Geografia</h4>
                <GeographyBreakdown
                  data={liveData.ga4.enabled ? liveData.ga4.geografia : liveData.googleAds.geografia}
                  loading={loadingLive}
                  title={liveData.ga4.enabled ? 'Sessões por região' : 'Cliques por região'}
                />
              </div>
            )}

            {/* Dispositivos */}
            {(liveData.googleAds.device.length > 0 || liveData.ga4.device.length > 0) && (
              <div className="bg-surface-card border border-surface-border rounded-xl p-[1rem]">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Dispositivos</h4>
                <DeviceBreakdown
                  data={liveData.ga4.enabled ? liveData.ga4.device : liveData.googleAds.device}
                  loading={loadingLive}
                />
              </div>
            )}

            {/* Fontes de Tráfego */}
            {liveData.ga4.enabled && liveData.ga4.fontesTrafego.length > 0 && (
              <div className="bg-surface-card border border-surface-border rounded-xl p-[1rem] lg:col-span-2">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Fontes de Tráfego</h4>
                <TrafficSources data={liveData.ga4.fontesTrafego} loading={loadingLive} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ SEÇÃO 5 — GA4 TOP TRÁFEGO ═════════════════════════════════ */}
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
