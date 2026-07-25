'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BarChart2, TrendingUp, ArrowUpRight, RefreshCw,
  MousePointerClick, DollarSign, AlertTriangle,
  Zap, Sparkles, X, DatabaseZap,
} from 'lucide-react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { MainLayout }  from '@/components/layout/MainLayout'
import { Button }      from '@/components/ui/Button'
import { supabase }    from '@/lib/supabase'
import { toast } from 'sonner'
import type { AnalyticsSnapshot, Cliente } from '@/lib/types'
import { ehSnapshotSemanal } from '@/lib/analytics-snapshots'

import { VisaoGeralCombinada } from '@/components/analytics/geral/VisaoGeralCombinada'
import { TrafegoDashboard } from '@/components/analytics/trafego/TrafegoDashboard'
import { SiteDashboard } from '@/components/analytics/site/SiteDashboard'
import { periodoDoPreset, diasDoPeriodo } from '@/components/analytics/shared/FiltroPeriodo'

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

// Status "operacionais" — clientes vivos que aparecem por padrão no seletor.
// Arquivados (inativo/cancelado) só entram com o toggle "incluir inativos".
const STATUS_OPERACIONAIS: ReadonlyArray<Cliente['status']> = [
  'recebido', 'onboarding', 'setup_trafego', 'ativo', 'congelado',
]

const ehOperacional = (c: Cliente) => STATUS_OPERACIONAIS.includes(c.status)
const temAnalyticsConectado = (c: Cliente) =>
  Boolean((c.google_ads_enabled && c.google_ads_customer_id) || (c.ga4_enabled && c.ga4_property_id))

export default function AnalyticsPage() {
  const [dados,    setDados]    = useState<ClienteSnap[]>([])
  const [loading,  setLoading]  = useState(true)
  const [clienteSel, setClienteSel] = useState<string>('')
  const [alertas,  setAlertas]  = useState<{ id: string; tipo: string; mensagem: string }[]>([])
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [syncing, setSyncing] = useState(false)
  const [iaRecs,        setIaRecs]        = useState<string>('')
  const [loadingIaRecs, setLoadingIaRecs] = useState(false)
  const [mostrarIaRecs, setMostrarIaRecs] = useState(false)
  const [aba, setAba] = useState<'geral' | 'trafego' | 'site'>('geral')
  // Revela clientes arquivados (inativo) que ainda têm analytics conectado —
  // desligado por padrão. Não afeta sync/alertas, só a visualização sob demanda.
  const [incluirInativos, setIncluirInativos] = useState(false)

  // Deep link: /analytics?cliente=<id>&aba=trafego|site (vindo do detalhe do cliente)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const abaUrl = params.get('aba')
    if (abaUrl === 'trafego' || abaUrl === 'site') setAba(abaUrl)
    const clienteUrl = params.get('cliente')
    if (clienteUrl) setClienteSel(clienteUrl)
  }, [])

  // Mantém a URL compartilhável ao navegar entre abas/clientes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (aba === 'geral') params.delete('aba'); else params.set('aba', aba)
    if (clienteSel) params.set('cliente', clienteSel); else params.delete('cliente')
    const q = params.toString()
    window.history.replaceState(null, '', q ? `?${q}` : window.location.pathname)
  }, [aba, clienteSel])

  const carregar = useCallback(async () => {
    setLoading(true)
    const [{ data: clientes }, { data: snaps }, { data: alertasDb }] = await Promise.all([
      // Traz operacionais (por status) + qualquer cliente com analytics conectado
      // (inclui arquivados com Ads/GA4). O toggle "incluir inativos" filtra o
      // display no client — o superset já vem carregado, sem re-fetch.
      supabase.from('clientes').select('*').or(
        `status.in.(${STATUS_OPERACIONAIS.join(',')}),google_ads_enabled.eq.true,ga4_enabled.eq.true`,
      ),
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
    // Seleção inicial: primeiro cliente operacional (o toggle de inativos vem
    // desligado). Só cai pro primeiro geral se não houver nenhum operacional.
    if (!clienteSel && resultado.length > 0) {
      const inicial = resultado.find((r) => ehOperacional(r.cliente)) ?? resultado[0]
      setClienteSel(inicial.cliente.id)
    }
    // Deep-link pra um cliente arquivado com analytics (ex.: vindo do detalhe
    // da Ana Ester) → revela automaticamente, senão ele ficaria escondido.
    if (clienteSel) {
      const alvo = resultado.find((r) => r.cliente.id === clienteSel)
      if (alvo && !ehOperacional(alvo.cliente) && temAnalyticsConectado(alvo.cliente)) {
        setIncluirInativos(true)
      }
    }
    setLoading(false)
  }, [clienteSel])

  useEffect(() => { carregar() }, [carregar])

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

  // ── Visibilidade (toggle "incluir inativos") ─────────────────────
  // Operacionais sempre; arquivados só com o toggle e se tiverem analytics.
  const dadosVisiveis = dados.filter(
    (d) => ehOperacional(d.cliente) || (incluirInativos && temAnalyticsConectado(d.cliente)),
  )
  // Arquivados com analytics conectado que o toggle revela (base do contador).
  const inativosComAnalytics = dados.filter(
    (d) => !ehOperacional(d.cliente) && temAnalyticsConectado(d.cliente),
  )

  // Toggle: ao DESLIGAR com um arquivado selecionado, volta pro primeiro
  // operacional (síncrono — evita o cliente sumir e a view ficar vazia).
  const alternarInativos = useCallback(() => {
    if (incluirInativos) {
      const sel = dados.find((d) => d.cliente.id === clienteSel)
      if (sel && !ehOperacional(sel.cliente)) {
        const op = dados.find((d) => ehOperacional(d.cliente))
        if (op) setClienteSel(op.cliente.id)
      }
    }
    setIncluirInativos((v) => !v)
  }, [incluirInativos, dados, clienteSel])

  // ── KPIs agregados ────────────────────────────────────────────────
  const totais = dadosVisiveis.reduce((acc, { ultimo: u }) => {
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

  // Período da Visão geral (pills 7/30/90d) como {inicio,fim} pra os blocos
  // combinados (mesma fonte cacheada dos dashboards).
  const periodoGeral = useMemo(() => periodoDoPreset(periodo), [periodo])
  const diasGeral    = useMemo(() => diasDoPeriodo(periodoGeral), [periodoGeral])

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

  return (
    <MainLayout
      title="Analytics"
      subtitle={selData ? `Cliente: ${selData.cliente.nome}` : 'Selecione um cliente para ver detalhes'}
      actions={
        <div className="flex items-center gap-[0.5rem]">
          {/* Pills de período (a aba Tráfego tem presets próprios) */}
          {aba === 'geral' && (
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
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => carregar()}
            disabled={loading}
            icon={<RefreshCw className={`w-[0.875rem] h-[0.875rem] ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />}
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
      {/* ══ ABAS — Visão geral | Tráfego (Ads) | Site (GA4) ══════════ */}
      <div className="flex items-center gap-[0.375rem] mb-[1.5rem] border-b border-surface-border">
        {([['geral', 'Visão geral'], ['trafego', 'Tráfego (Google Ads)'], ['site', 'Site (GA4)']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`h-[2.25rem] px-[0.875rem] text-[0.8125rem] font-medium border-b-2 -mb-[1px] transition-colors ${
              aba === id
                ? 'border-ads-500 text-ink-primary'
                : 'border-transparent text-ink-muted hover:text-ink-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ══ SEÇÃO 1 — KPI RESUMO GERAL ════════════════════════════════ */}
      {aba === 'geral' && (
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
      )}

      {/* ══ SEÇÃO 2 — SELETOR DE CLIENTE (pills) ═══════════════════ */}
      {!loading && dadosVisiveis.length > 0 && (
        <div className="flex items-center gap-[0.375rem] flex-wrap mb-[1.5rem]">
          <span className="text-ink-muted text-[0.75rem] font-medium mr-[0.25rem]">Cliente:</span>
          {dadosVisiveis.map(({ cliente: c, ultimo: u }) => {
            const ativo = (u?.investimento ?? 0) > 0
            const arquivado = !ehOperacional(c)
            return (
              <button
                key={c.id}
                onClick={() => setClienteSel(c.id)}
                title={arquivado ? `${c.nome} — arquivado (${c.status})` : c.nome}
                className={`flex items-center gap-[0.375rem] h-[1.875rem] px-[0.75rem] rounded-full text-[0.8125rem] font-medium transition-all ${
                  clienteSel === c.id
                    ? 'bg-ads-500 text-white shadow-md shadow-ads-500/20'
                    : 'bg-surface-card border border-surface-border text-ink-secondary hover:border-ads-500/40 hover:text-ink-primary'
                }`}
              >
                <span className={`w-[0.375rem] h-[0.375rem] rounded-full shrink-0 ${ativo ? 'bg-status-green' : 'bg-ink-muted'}`} />
                {c.nome.split(' ')[0]}
                {arquivado && (
                  <span className={`text-[0.5625rem] uppercase tracking-wide ${clienteSel === c.id ? 'text-white/70' : 'text-ink-muted'}`}>
                    arquivado
                  </span>
                )}
              </button>
            )
          })}
          {/* Toggle "incluir inativos" — só quando há arquivados com analytics */}
          {inativosComAnalytics.length > 0 && (
            <button
              onClick={alternarInativos}
              className={`ml-[0.25rem] inline-flex items-center gap-[0.375rem] h-[1.875rem] px-[0.75rem] rounded-full text-[0.75rem] font-medium border transition-all ${
                incluirInativos
                  ? 'bg-ads-500/10 border-ads-500/40 text-ads-600'
                  : 'bg-surface-card border-surface-border text-ink-muted hover:text-ink-secondary hover:border-ads-500/30'
              }`}
              title="Mostra clientes arquivados que ainda têm Google Ads ou GA4 conectado (para revisão/histórico). Não afeta sync nem alertas."
            >
              <span className={`w-[1.75rem] h-[0.875rem] rounded-full relative transition-colors shrink-0 ${incluirInativos ? 'bg-ads-500' : 'bg-surface-border'}`}>
                <span className={`absolute top-[0.0625rem] w-[0.75rem] h-[0.75rem] rounded-full bg-white transition-all ${incluirInativos ? 'left-[0.9375rem]' : 'left-[0.0625rem]'}`} />
              </span>
              Incluir inativos
              <span className="text-[0.625rem] text-ink-muted">({inativosComAnalytics.length})</span>
            </button>
          )}
        </div>
      )}
      {loading && <div className="h-[2rem] mb-[1.5rem] skeleton-shimmer rounded-full w-[60%]" />}

      {/* ══ ABA TRÁFEGO — dashboard completo Google Ads ═══════════════ */}
      {aba === 'trafego' && selData && (
        <TrafegoDashboard
          clienteId={selData.cliente.id}
          adsConectado={Boolean(selData.cliente.google_ads_enabled && selData.cliente.google_ads_customer_id)}
        />
      )}

      {/* ══ ABA SITE — dashboard completo GA4 ═════════════════════════ */}
      {aba === 'site' && selData && (
        <SiteDashboard
          clienteId={selData.cliente.id}
          ga4Conectado={Boolean(selData.cliente.ga4_enabled && selData.cliente.ga4_property_id)}
        />
      )}

      {aba === 'geral' && (<>
      {/* ══ VISÃO GERAL COMBINADA (Ads + Site, de relance) ═══════════ */}
      {selData && (
        <VisaoGeralCombinada
          clienteId={selData.cliente.id}
          adsAtivo={Boolean(selData.cliente.google_ads_enabled && selData.cliente.google_ads_customer_id)}
          ga4Ativo={Boolean(selData.cliente.ga4_enabled && selData.cliente.ga4_property_id)}
          periodo={periodoGeral}
          dias={diasGeral}
        />
      )}

      {/* ══ EVOLUÇÃO HISTÓRICA (snapshots mês a mês) ═════════════════ */}
      {selData && (
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem] mb-[2rem]">
          <div className="flex items-center justify-between mb-[1.25rem]">
            <div>
              <h2 className="text-ink-primary font-semibold text-[0.9375rem]">
                Evolução — {selData.cliente.nome}
              </h2>
              <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">Snapshots mês a mês</p>
              {(selData.cliente.google_ads_enabled || selData.cliente.ga4_enabled) && (
                <p className="text-[0.6875rem] mt-[0.25rem]">
                  {selData.cliente.ultimo_sync_at ? (
                    <span className={
                      selData.cliente.ultimo_sync_status === 'ok' ? 'text-status-green'
                        : selData.cliente.ultimo_sync_status === 'parcial' ? 'text-status-orange'
                        : 'text-status-red'
                    }>
                      Última sincronização: {new Date(selData.cliente.ultimo_sync_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}{' '}
                      {new Date(selData.cliente.ultimo_sync_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      {selData.cliente.ultimo_sync_status === 'ok' ? ' — OK' : ` — ERRO: ${selData.cliente.ultimo_sync_erro ?? 'falha desconhecida'}`}
                    </span>
                  ) : (
                    <span className="text-ink-muted">Snapshot ainda não sincronizado — use o botão Sincronizar</span>
                  )}
                </p>
              )}
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
      </>)}

      {dadosVisiveis.length === 0 && !loading && (
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
