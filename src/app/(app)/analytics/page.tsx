'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  BarChart2, TrendingUp, ArrowUpRight, RefreshCw,
  MousePointerClick, DollarSign, AlertTriangle,
  Users, Globe, Zap, Calendar, ChevronDown,
  Sparkles, X, DatabaseZap,
} from 'lucide-react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  BarChart,
} from 'recharts'
import { MainLayout }  from '@/components/layout/MainLayout'
import { Button }      from '@/components/ui/Button'
import { supabase }    from '@/lib/supabase'
import { toast } from 'sonner'
import type { AnalyticsSnapshot, Cliente } from '@/lib/types'
import { ehSnapshotSemanal } from '@/lib/analytics-snapshots'

// Novos componentes analytics
import { AdsOverviewKpis } from '@/components/analytics/AdsOverviewKpis'
import { SearchTermsTable } from '@/components/analytics/SearchTermsTable'
import { DemographicsCard } from '@/components/analytics/DemographicsCard'
import { GeographyBreakdown } from '@/components/analytics/GeographyBreakdown'
import { DeviceBreakdown } from '@/components/analytics/DeviceBreakdown'
import { GA4Panel } from '@/components/analytics/GA4Panel'
import { TrafficSources } from '@/components/analytics/TrafficSources'
import { AnalyticsMap } from '@/components/analytics/AnalyticsMap'
import { HourDayHeatmap } from '@/components/analytics/HourDayHeatmap'
import { GenderBreakdown } from '@/components/analytics/GenderBreakdown'
import { CityTable } from '@/components/analytics/CityTable'
import { AuctionInsights } from '@/components/analytics/AuctionInsights'
import { GA4PagesTable } from '@/components/analytics/GA4PagesTable'
import { GA4TrafficDetail } from '@/components/analytics/GA4TrafficDetail'
import { GA4EventsTable } from '@/components/analytics/GA4EventsTable'

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
  const [syncing, setSyncing] = useState(false)
  const [iaRecs,        setIaRecs]        = useState<string>('')
  const [loadingIaRecs, setLoadingIaRecs] = useState(false)
  const [mostrarIaRecs, setMostrarIaRecs] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    const [{ data: clientes }, { data: snaps }, { data: alertasDb }] = await Promise.all([
      supabase.from('clientes').select('*').in('status', ['ativo', 'onboarding', 'setup_trafego']),
      supabase.from('analytics_snapshots').select('*').order('periodo_fim', { ascending: false }).limit(500),
      supabase.from('alertas').select('id, tipo, mensagem').eq('resolvido', false).order('created_at', { ascending: false }).limit(10),
    ])

    const cl    = (clientes ?? []) as Cliente[]
    // Só snapshots mensais — os semanais (seg–dom) alimentam o relatório
    // semanal e poluiriam este histórico com números "menores".
    const snAll = ((snaps ?? []) as AnalyticsSnapshot[])
      .filter((s) => !ehSnapshotSemanal(s.periodo_inicio, s.periodo_fim))

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
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setLiveData(data)
    } catch (error) {
      console.error('Erro ao carregar dados live:', error)
      toast.error('Erro ao carregar dados em tempo real')
    } finally {
      setLoadingLive(false)
    }
  }, [clienteSel, periodo])

  useEffect(() => {
    if (clienteSel) {
      carregarLive()
    }
  }, [clienteSel, carregarLive])

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(carregarLive, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [carregarLive])

  // Sincroniza snapshots (popula analytics_snapshots) e recarrega a leitura.
  const sincronizar = useCallback(async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/v1/analytics/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteSel ? { clienteId: clienteSel } : {}),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(e.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      const oks = (data.resultados ?? []).filter(
        (r: { google_ads: string; ga4: string }) => r.google_ads === 'ok' || r.ga4 === 'ok',
      ).length
      toast.success(oks > 0 ? `Sincronizado: ${oks} cliente(s)` : 'Nada para sincronizar (sem integração ativa)')
      await carregar()
    } catch (error) {
      console.error('Erro ao sincronizar analytics:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao sincronizar')
    } finally {
      setSyncing(false)
    }
  }, [clienteSel, carregar])

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

  async function gerarRecomendacoes() {
    if (!selData) return
    setLoadingIaRecs(true)
    setMostrarIaRecs(true)
    try {
      const { investimento, conversoes, cpa, impressoes, cliques } = selData.ultimo ?? {}
      const res = await fetch('/api/ia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            id: 'rec',
            role: 'user',
            content: `Analise os dados de Google Ads para o cliente "${selData.cliente.nome}" (${selData.cliente.nicho}) e forneça 3 a 5 recomendações práticas:\n- Investimento: R$ ${investimento?.toFixed(0) ?? 0}\n- Conversões: ${conversoes ?? 0}\n- CPA: R$ ${cpa?.toFixed(0) ?? 0}\n- Impressões: ${impressoes ?? 0}\n- Cliques: ${cliques ?? 0}\n\nFoque em ações concretas para melhorar o CPA e o ROAS.`,
            created_at: new Date().toISOString(),
          }],
          contexto_cliente_id: selData.cliente.id,
        }),
      })
      const json = await res.json() as { content?: string }
      setIaRecs(json.content ?? 'Sem recomendações geradas.')
    } catch {
      toast.error('Erro ao gerar recomendações.')
    } finally {
      setLoadingIaRecs(false)
    }
  }

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
          {/* Pills de período */}
          <div className="flex bg-surface-hover border border-surface-border rounded-[0.5rem] p-[0.1875rem] gap-[0.125rem]">
            {(['7d', '30d', '90d'] as Periodo[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`h-[1.625rem] px-[0.625rem] rounded-[0.3125rem] text-[0.75rem] font-medium transition-all ${
                  periodo === p
                    ? 'bg-surface-card text-ink-primary shadow-sm'
                    : 'text-ink-muted hover:text-ink-secondary'
                }`}
              >
                {p === '7d' ? '7d' : p === '30d' ? '30d' : '90d'}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { carregar(); carregarLive(); }}
            disabled={loading || loadingLive}
            icon={<RefreshCw className={`w-[0.875rem] h-[0.875rem] ${loading || loadingLive ? 'animate-spin' : ''}`} strokeWidth={1.75} />}
            className="w-[2rem] px-0"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={sincronizar}
            disabled={syncing}
            icon={<DatabaseZap className={`w-[0.875rem] h-[0.875rem] ${syncing ? 'animate-pulse' : ''}`} strokeWidth={1.75} />}
          >
            {syncing ? 'Sincronizando…' : 'Sincronizar'}
          </Button>
        </div>
      }
    >
      <div className="page-enter">
      {/* ══ SEÇÃO 1 — KPI RESUMO GERAL ════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1rem] mb-[2rem]">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[6rem] rounded-xl skeleton-shimmer dark:border dark:border-surface-border" />)
          : [
              { label: 'Investimento Total', valor: fmt(totais.invest),   icon: DollarSign,       cor: 'text-status-blue'   },
              { label: 'Conversões',         valor: conv(totais.conversoes), icon: ArrowUpRight,  cor: 'text-ads-500',       sub: '* fracionadas' },
              { label: 'CTR Médio',          valor: `${ctrMedio.toFixed(2)}%`, icon: MousePointerClick, cor: 'text-status-purple' },
              { label: 'CPA Médio',          valor: fmt(cpaMedio),         icon: TrendingUp,       cor: 'text-status-orange' },
            ].map(({ label, valor, icon: Icon, cor, sub }) => (
              <div key={label} className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow px-[1.25rem] py-[1rem]">
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

      {/* ══ SEÇÃO 2 — SELETOR DE CLIENTE (pills) ═══════════════════ */}
      {!loading && dados.length > 0 && (
        <div className="flex items-center gap-[0.375rem] flex-wrap mb-[1.5rem]">
          <span className="text-ink-muted text-[0.75rem] font-medium mr-[0.25rem]">Cliente:</span>
          {dados.map(({ cliente: c, ultimo: u }) => {
            const ativo = (u?.investimento ?? 0) > 0
            return (
              <button
                key={c.id}
                onClick={() => setClienteSel(c.id)}
                className={`flex items-center gap-[0.375rem] h-[1.875rem] px-[0.75rem] rounded-full text-[0.8125rem] font-medium transition-all ${
                  clienteSel === c.id
                    ? 'bg-ads-500 text-white shadow-md shadow-ads-500/20'
                    : 'bg-surface-card border border-surface-border text-ink-secondary hover:border-ads-500/40 hover:text-ink-primary'
                }`}
              >
                <span className={`w-[0.375rem] h-[0.375rem] rounded-full shrink-0 ${ativo ? 'bg-status-green' : 'bg-ink-muted'}`} />
                {c.nome.split(' ')[0]}
              </button>
            )
          })}
        </div>
      )}
      {loading && <div className="h-[2rem] mb-[1.5rem] skeleton-shimmer rounded-full w-[60%]" />}

      {/* ══ SEÇÃO 3 — DETALHE POR CAMPANHA ════════════════════════════ */}
      {selData && (
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem] mb-[2rem]">
          <div className="flex items-center justify-between mb-[1.25rem]">
            <div>
              <h2 className="text-ink-primary font-semibold text-[0.9375rem]">
                Evolução — {selData.cliente.nome}
              </h2>
              <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">{periodoLabel[periodo]}</p>
            </div>
            <div className="flex items-center gap-[0.75rem]">
              <button
                onClick={gerarRecomendacoes}
                disabled={loadingIaRecs}
                className="inline-flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-lg bg-ads-500/10 hover:bg-ads-500/20 text-ads-500 text-[0.75rem] font-medium transition-colors disabled:opacity-50"
              >
                {loadingIaRecs
                  ? <><RefreshCw className="w-[0.75rem] h-[0.75rem] animate-spin" strokeWidth={2} />Gerando...</>
                  : <><Sparkles className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />Recomendações IA</>
                }
              </button>
              <a
                href={`/clientes/${selData.cliente.id}`}
                className="text-ads-500 text-[0.8125rem] hover:underline"
              >
                Ver cliente →
              </a>
            </div>
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
                    contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '0.625rem', fontSize: '0.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                    labelStyle={{ color: 'var(--ink-primary)', fontWeight: 600, marginBottom: '0.25rem' }}
                    formatter={(v: unknown, name: unknown) => { const n = name as string; const val = Number(v); return [n === 'invest' ? fmt(val) : fmtN(val), n === 'invest' ? 'Investimento' : 'Conversões'] as [string, string] }}
                  />
                  <Legend formatter={(v) => v === 'invest' ? 'Investimento' : 'Conversões'} wrapperStyle={{ fontSize: '0.75rem' }} />
                  <Bar  yAxisId="left"  dataKey="invest"     fill="#3B82F6" opacity={0.75} radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" dataKey="conversoes" stroke="#FFA500" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#FFA500' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-ink-muted text-[0.875rem] italic text-center py-[2rem]">Snapshots insuficientes para gerar gráfico.</p>
          )}

          {/* Tabela de campanhas live */}
          {liveData?.googleAds.enabled && liveData.googleAds.campanhas.length > 0 && (
            <div className="mt-[1.5rem]">
              <h3 className="text-ink-primary font-semibold text-[0.875rem] mb-[0.75rem]">Campanhas ativas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[0.8125rem]">
                  <thead>
                    <tr className="border-b border-surface-border">
                      {['Campanha', 'Impressões', 'Cliques', 'CTR', 'Custo', 'Conv.', 'CPA'].map((h) => (
                        <th key={h} className="text-left pb-[0.625rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {liveData.googleAds.campanhas.map((c) => (
                      <tr key={c.campanha_id} className="border-b border-surface-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                        <td className="py-[0.625rem] pr-[1rem] text-ink-primary font-medium max-w-[12rem] truncate">{c.campanha_nome}</td>
                        <td className="py-[0.625rem] pr-[1rem] text-ink-secondary">{fmtN(c.impressoes)}</td>
                        <td className="py-[0.625rem] pr-[1rem] text-ink-secondary">{fmtN(c.cliques)}</td>
                        <td className="py-[0.625rem] pr-[1rem]">
                          <span className={`font-semibold ${c.ctr > 5 ? 'text-status-green' : c.ctr > 2 ? 'text-ads-500' : 'text-ink-secondary'}`}>
                            {c.ctr.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-[0.625rem] pr-[1rem] text-status-blue font-medium">{fmt(c.custo_total)}</td>
                        <td className="py-[0.625rem] pr-[1rem] text-ink-secondary">{conv(c.conversoes)}</td>
                        <td className="py-[0.625rem]">
                          <span className={`font-semibold ${c.cpa > 200 ? 'text-status-orange' : 'text-status-green'}`}>
                            {c.conversoes > 0 ? fmt(c.cpa) : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recomendações IA */}
          {mostrarIaRecs && (
            <div className="mt-[1.5rem] border-t border-surface-border/30 pt-[1.25rem]">
              <div className="flex items-center justify-between mb-[0.75rem]">
                <div className="flex items-center gap-[0.375rem]">
                  <Sparkles className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={2} />
                  <p className="text-ink-primary text-[0.875rem] font-semibold">Recomendações da IA</p>
                </div>
                <button
                  onClick={() => setMostrarIaRecs(false)}
                  className="text-ink-muted hover:text-ink-primary transition-colors"
                >
                  <X className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                </button>
              </div>
              {loadingIaRecs ? (
                <div className="space-y-[0.5rem]">
                  {[85, 70, 60].map((w, i) => (
                    <div key={i} className="h-[0.875rem] rounded skeleton-shimmer" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : (
                <div className="bg-ads-500/5 border border-ads-500/15 rounded-xl p-[1rem]">
                  {iaRecs.split('\n').filter(Boolean).map((linha, i) => (
                    <p key={i} className="text-ink-secondary text-[0.8125rem] leading-relaxed">{linha}</p>
                  ))}
                </div>
              )}
            </div>
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
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Termos de Pesquisa</h4>
                <SearchTermsTable data={liveData.googleAds.termosPesquisa} loading={loadingLive} maxRows={5} />
              </div>
            )}

            {/* Demografia */}
            {liveData.googleAds.enabled && liveData.googleAds.demografia.length > 0 && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Demografia</h4>
                <DemographicsCard data={liveData.googleAds.demografia} loading={loadingLive} />
              </div>
            )}

            {/* Geografia — mapa + breakdown */}
            {(liveData.googleAds.geografia.length > 0 || liveData.ga4.geografia.length > 0) && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem] lg:col-span-2">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Geografia</h4>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_14rem] gap-[1rem]">
                  <AnalyticsMap
                    data={liveData.ga4.enabled ? liveData.ga4.geografia : liveData.googleAds.geografia}
                    loading={loadingLive}
                    metric={liveData.ga4.enabled ? 'sessoes' : 'cliques'}
                  />
                  <GeographyBreakdown
                    data={liveData.ga4.enabled ? liveData.ga4.geografia : liveData.googleAds.geografia}
                    loading={loadingLive}
                    title={liveData.ga4.enabled ? 'Top estados' : 'Cliques por estado'}
                  />
                </div>
              </div>
            )}

            {/* Dispositivos */}
            {(liveData.googleAds.device.length > 0 || liveData.ga4.device.length > 0) && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Dispositivos</h4>
                <DeviceBreakdown
                  data={liveData.ga4.enabled ? liveData.ga4.device : liveData.googleAds.device}
                  loading={loadingLive}
                />
              </div>
            )}

            {/* Fontes de Tráfego */}
            {liveData.ga4.enabled && liveData.ga4.fontesTrafego.length > 0 && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem] lg:col-span-2">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Fontes de Tráfego</h4>
                <TrafficSources data={liveData.ga4.fontesTrafego} loading={loadingLive} />
              </div>
            )}

            {/* Heatmap de horários */}
            {liveData.googleAds.enabled && (liveData.googleAds as any).horario?.length > 0 && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem] lg:col-span-2">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Performance por Horário</h4>
                <HourDayHeatmap data={(liveData.googleAds as any).horario} loading={loadingLive} />
              </div>
            )}

            {/* Gênero */}
            {liveData.googleAds.enabled && liveData.googleAds.demografia.length > 0 && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Gênero</h4>
                <GenderBreakdown data={liveData.googleAds.demografia} loading={loadingLive} />
              </div>
            )}

            {/* Tabela de cidades */}
            {liveData.googleAds.enabled && liveData.googleAds.geografia.length > 0 && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Cidades — Google Ads</h4>
                <CityTable data={liveData.googleAds.geografia} loading={loadingLive} />
              </div>
            )}

            {/* Leilão de concorrentes */}
            {liveData.googleAds.enabled && (liveData.googleAds as any).leilao?.length > 0 && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem] lg:col-span-2">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Leilão de Concorrentes</h4>
                <AuctionInsights data={(liveData.googleAds as any).leilao} loading={loadingLive} />
              </div>
            )}

            {/* GA4 — Páginas expandido */}
            {liveData.ga4.enabled && liveData.ga4.paginasTop.length > 0 && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem] lg:col-span-2">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Páginas Mais Acessadas</h4>
                <GA4PagesTable data={liveData.ga4.paginasTop as any} loading={loadingLive} />
              </div>
            )}

            {/* GA4 — Origem do tráfego detalhado */}
            {liveData.ga4.enabled && liveData.ga4.fontesTrafego.length > 0 && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Origem do Tráfego — Detalhado</h4>
                <GA4TrafficDetail data={liveData.ga4.fontesTrafego} loading={loadingLive} />
              </div>
            )}

            {/* GA4 — Eventos */}
            {liveData.ga4.enabled && (liveData.ga4 as any).eventos?.length > 0 && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Eventos Disparados</h4>
                <GA4EventsTable data={(liveData.ga4 as any).eventos} loading={loadingLive} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ SEÇÃO 5 — GA4 TOP TRÁFEGO ═════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] mb-[2rem]">
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
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

        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
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
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
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
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[4rem] text-center">
          <BarChart2 className="w-[3rem] h-[3rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
          <h3 className="text-ink-primary font-semibold text-[1rem] mb-[0.5rem]">Sem dados ainda</h3>
          <p className="text-ink-secondary text-[0.875rem] max-w-[24rem] mx-auto">
            Cadastre clientes e aguarde a sincronização dos snapshots de analytics.
          </p>
        </div>
      )}
      </div>
    </MainLayout>
  )
}
