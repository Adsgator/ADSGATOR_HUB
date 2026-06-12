'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  TrendingUp, DollarSign, AlertCircle,
  MessageCircle, RefreshCw, Users, Download,
  Target, Clock, Zap, Plus, X as XIcon,
  Pencil, Copy, Trash2, CheckCircle, Clock3, Filter,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { MainLayout }  from '@/components/layout/MainLayout'
import { Button }      from '@/components/ui/Button'
import { ContextMenu } from '@/components/ui/ContextMenu'
import { supabase }    from '@/lib/supabase'
import { useRightSidebarStore } from '@/lib/store/right-sidebar-store'
import { useConfirmDialogStore } from '@/lib/hooks/useConfirmDialog'
import { estagioInadimplencia } from '@/lib/cobranca'
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
  imposto_estimado:  number
  tipo_tributacao:   string
  lucro_liquido:     number
  margem:            number
}

interface SaudeSaaS {
  ltv:           number
  cac:           number
  ltv_cac:       number
  payback_meses: number
  churn_rate:    number
  novos_mes:     number
}

interface SparkMes {
  mes:   string
  mrr:   number
  lucro: number
}

interface ProjecaoMes {
  mes:    string
  mrr:    number
  lucro:  number
}

function gerarCSV(lancamentos: FinanceiroLancamento[]): void {
  const header = ['Data', 'Descrição', 'Tipo', 'Valor', 'Status']
  const rows   = lancamentos.map((l) => [
    new Date(l.data).toLocaleDateString('pt-BR'),
    `"${l.descricao}"`,
    l.tipo,
    l.valor.toFixed(2).replace('.', ','),
    l.status ?? '',
  ])
  const csv  = [header, ...rows].map((r) => r.join(';')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `financeiro_${new Date().toISOString().slice(0, 7)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Modal de novo lançamento ─────────────────────────────────────────────────
interface NovoLancForm {
  descricao:  string
  valor:      string
  tipo:       'receita' | 'custo_fixo' | 'custo_variavel'
  data:       string
  status:     'confirmado' | 'pendente'
  categoria:  string
  cliente_id: string
}

export default function FinanceiroPage() {
  const hoje = new Date().toISOString().slice(0, 7)

  const [dre,          setDre]          = useState<DRE | null>(null)
  const [saude,        setSaude]        = useState<SaudeSaaS | null>(null)
  const [lancamentos,  setLancamentos]  = useState<FinanceiroLancamento[]>([])
  const [todosLancs,   setTodosLancs]   = useState<FinanceiroLancamento[]>([])
  const [atrasados,    setAtrasados]    = useState<Cliente[]>([])
  const [sparkData,    setSparkData]    = useState<SparkMes[]>([])
  const [projecao,     setProjecao]     = useState<ProjecaoMes[]>([])
  const [loading,      setLoading]      = useState(true)
  const [periodoSel,   setPeriodoSel]   = useState(hoje)
  const [modalLanc,    setModalLanc]    = useState(false)
  const [clientesLista, setClientesLista] = useState<{ id: string; nome: string }[]>([])
  const [novoLanc,     setNovoLanc]     = useState<NovoLancForm>({
    descricao: '', valor: '', tipo: 'receita', data: new Date().toISOString().slice(0, 10), status: 'confirmado', categoria: '', cliente_id: '',
  })
  const [salvandoLanc, setSalvandoLanc] = useState(false)
  const [erroLanc,     setErroLanc]     = useState('')
  const [editandoLanc, setEditandoLanc] = useState<FinanceiroLancamento | null>(null)
  const [deletandoId,  setDeletandoId]  = useState<string | null>(null)

  const { setContextActions, clearContextActions } = useRightSidebarStore()

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const [ano, mes] = periodoSel.split('-')
      const mesInicio  = new Date(Number(ano), Number(mes) - 1, 1)
      const mesInicioStr = mesInicio.toISOString().split('T')[0]

      const doze = new Date()
      doze.setMonth(doze.getMonth() - 12)
      const dozeStr = doze.toISOString().split('T')[0]

      const [{ data: lancs }, { data: todosL }, { data: atr }, { data: config }, { data: historico }, { data: clientesData }] = await Promise.all([
        supabase.from('financeiro_lancamentos').select('*').gte('data', mesInicioStr).order('data', { ascending: false }),
        supabase.from('financeiro_lancamentos').select('*').gte('data', dozeStr).order('data', { ascending: true }),
        supabase.from('clientes').select('*').gt('dias_atraso', 0).neq('status', 'cancelado'),
        supabase.from('configuracoes_financeiras').select('custos_fixos_mensais,custos_variaveis_percentual,tipo_tributacao,imposto_percentual').eq('agencia_id', 'adsgator-main').single(),
        supabase.from('historico_acoes').select('tipo:tipo_acao, created_at').in('tipo_acao', ['cliente_criado', 'cancelado']).order('created_at', { ascending: true }),
        supabase.from('clientes').select('id, nome').in('status', ['ativo', 'onboarding', 'setup_trafego']).order('nome'),
      ])
      setClientesLista((clientesData ?? []) as { id: string; nome: string }[])

      const lista = (lancs ?? []) as FinanceiroLancamento[]
      const todos = (todosL ?? []) as FinanceiroLancamento[]
      setLancamentos(lista)
      setTodosLancs(todos)
      setAtrasados((atr ?? []) as Cliente[])

      // ── DRE do mês ──────────────────────────────────────────────────
      const mrr       = lista.filter((l) => l.tipo === 'receita' && l.status === 'confirmado').reduce((s, l) => s + l.valor, 0)
      const fixos     = lista.filter((l) => l.tipo === 'custo_fixo').reduce((s, l) => s + l.valor, 0)
      const variav    = lista.filter((l) => l.tipo === 'custo_variavel').reduce((s, l) => s + l.valor, 0)
      const cfgTyped  = config as { custos_fixos_mensais?: number; custos_variaveis_percentual?: number; tipo_tributacao?: string; imposto_percentual?: number } | null
      const impostoP  = cfgTyped?.imposto_percentual ?? 11.0
      const tipoTrib  = cfgTyped?.tipo_tributacao ?? 'MEI'
      const imposto   = mrr * (impostoP / 100)
      const lucroB    = mrr - fixos
      const lucroL    = lucroB - variav - imposto
      setDre({ mrr, custos_fixos: fixos, custos_variaveis: variav, lucro_bruto: lucroB, imposto_estimado: imposto, tipo_tributacao: tipoTrib, lucro_liquido: lucroL, margem: mrr > 0 ? (lucroL / mrr) * 100 : 0 })

      // ── Sparkline 12 meses ──────────────────────────────────────────
      const porMes: Record<string, { receita: number; custo: number }> = {}
      for (const l of todos) {
        const mes = l.data.slice(0, 7)
        if (!porMes[mes]) porMes[mes] = { receita: 0, custo: 0 }
        if (l.tipo === 'receita') porMes[mes].receita += l.valor
        else porMes[mes].custo += l.valor
      }
      const spark = Object.entries(porMes).sort(([a], [b]) => a.localeCompare(b)).map(([mes, v]) => ({
        mes: new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        mrr: Math.round(v.receita),
        lucro: Math.round(v.receita - v.custo),
      }))
      setSparkData(spark)

      // ── Projeção 6 meses ────────────────────────────────────────────
      const ultimos3 = spark.slice(-3)
      const trendMrr = ultimos3.length >= 2
        ? (ultimos3[ultimos3.length - 1].mrr - ultimos3[0].mrr) / Math.max(ultimos3.length - 1, 1)
        : 0
      const mrrBase  = spark[spark.length - 1]?.mrr ?? mrr
      const fixosCfg = cfgTyped?.custos_fixos_mensais ?? fixos
      const varPct   = cfgTyped?.custos_variaveis_percentual ?? 0

      const proj: ProjecaoMes[] = Array.from({ length: 6 }, (_, i) => {
        const d    = new Date()
        d.setMonth(d.getMonth() + i + 1)
        const mrrP = Math.max(0, mrrBase + trendMrr * (i + 1))
        const custP = fixosCfg + mrrP * (varPct / 100)
        return {
          mes:   d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          mrr:   Math.round(mrrP),
          lucro: Math.round(mrrP - custP),
        }
      })
      setProjecao(proj)

      // ── Saúde SaaS ──────────────────────────────────────────────────
      const hist = (historico ?? []) as { tipo: string; created_at: string }[]
      const criados    = hist.filter((h) => h.tipo === 'cliente_criado')
      const cancelados = hist.filter((h) => h.tipo === 'cancelado')

      const vidaMedia = criados.length > 0 && cancelados.length > 0
        ? cancelados.reduce((sum, c) => {
            const criacao = criados.find((cr) => cr.created_at < c.created_at)
            if (!criacao) return sum
            return sum + (new Date(c.created_at).getTime() - new Date(criacao.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
          }, 0) / cancelados.length
        : 24

      const mrrMedio = mrr > 0 && criados.length > 0 ? mrr / criados.length : mrr
      const ltv      = mrrMedio * vidaMedia
      const cac      = fixos > 0 ? fixos * 0.3 : 500
      const novosMs  = criados.filter((c) => c.created_at >= mesInicioStr).length
      const churn    = criados.length > 0 ? (cancelados.filter((c) => c.created_at >= mesInicioStr).length / criados.length) * 100 : 0

      setSaude({
        ltv,
        cac,
        ltv_cac:       cac > 0 ? ltv / cac : 0,
        payback_meses: mrrMedio > 0 ? cac / mrrMedio : 0,
        churn_rate:    churn,
        novos_mes:     novosMs,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [periodoSel])

  useEffect(() => {
    setContextActions([
      {
        id: 'nova-transacao',
        icon: Plus,
        label: 'Nova Transação',
        onClick: () => setModalLanc(true),
      },
      {
        id: 'exportar-csv',
        icon: Download,
        label: 'Exportar CSV',
        onClick: () => gerarCSV(todosLancs),
      },
      {
        id: 'filtrar',
        icon: Filter,
        label: 'Filtrar',
        onClick: () => {},
      },
      {
        id: 'atualizar',
        icon: RefreshCw,
        label: 'Atualizar',
        onClick: () => carregar(),
      },
    ])
    return () => clearContextActions()
  }, [todosLancs, carregar, setContextActions, clearContextActions])

  useEffect(() => { carregar() }, [carregar])

  async function salvarLancamento() {
    if (!novoLanc.descricao.trim() || !novoLanc.valor || !novoLanc.data) {
      setErroLanc('Preencha descrição, valor e data.'); return
    }
    setSalvandoLanc(true); setErroLanc('')
    const { error } = await supabase.from('financeiro_lancamentos').insert({
      descricao:  novoLanc.descricao.trim(),
      valor:      parseFloat(novoLanc.valor),
      tipo:       novoLanc.tipo,
      data:       novoLanc.data,
      status:     novoLanc.status,
      ...(novoLanc.categoria  && { categoria:  novoLanc.categoria }),
      ...(novoLanc.cliente_id && { cliente_id: novoLanc.cliente_id }),
    })
    setSalvandoLanc(false)
    if (error) { setErroLanc(error.message); return }
    setModalLanc(false)
    setNovoLanc({ descricao: '', valor: '', tipo: 'receita', data: new Date().toISOString().slice(0, 10), status: 'confirmado', categoria: '', cliente_id: '' })
    carregar()
  }

  async function salvarEdicao() {
    if (!editandoLanc) return
    setSalvandoLanc(true); setErroLanc('')
    const { error } = await supabase
      .from('financeiro_lancamentos')
      .update({
        descricao:  editandoLanc.descricao,
        valor:      editandoLanc.valor,
        tipo:       editandoLanc.tipo,
        data:       editandoLanc.data,
        status:     editandoLanc.status,
        categoria:  (editandoLanc as unknown as Record<string, unknown>)['categoria'] as string | undefined ?? null,
        cliente_id: (editandoLanc as unknown as Record<string, unknown>)['cliente_id'] as string | undefined ?? null,
      })
      .eq('id', editandoLanc.id)
    setSalvandoLanc(false)
    if (error) { setErroLanc(error.message); return }
    setEditandoLanc(null)
    carregar()
  }

  async function duplicarLancamento(l: FinanceiroLancamento) {
    await supabase.from('financeiro_lancamentos').insert({
      descricao: `${l.descricao} (cópia)`,
      valor:     l.valor,
      tipo:      l.tipo,
      data:      new Date().toISOString().slice(0, 10),
      status:    'pendente',
    })
    carregar()
  }

  async function deletarLancamento(id: string) {
    setDeletandoId(id)
    await supabase.from('financeiro_lancamentos').delete().eq('id', id)
    setDeletandoId(null)
    carregar()
  }

  function confirmarDeletarLancamento(id: string, descricao: string) {
    const openConfirm = useConfirmDialogStore.getState().openConfirm
    openConfirm(
      'Deletar Lançamento',
      `Você está prestes a deletar "${descricao}". Esta ação não pode ser desfeita.`,
      () => deletarLancamento(id)
    )
  }

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
        <div className="flex items-center gap-[0.5rem]">
          <input
            type="month"
            value={periodoSel}
            onChange={(e) => setPeriodoSel(e.target.value)}
            className="h-[2rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-secondary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalLanc(true)}
            icon={<Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
          >
            Lançamento
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => gerarCSV(todosLancs)}
            disabled={todosLancs.length === 0}
            icon={<Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />}
          >
            CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={carregar}
            icon={<RefreshCw className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />}
          >
            Atualizar
          </Button>
        </div>
      }
    >
      <div className="page-enter">
      {/* ══ KPIs BENTO GRID ═══════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1rem] mb-[2rem]">
        {/* Card principal — MRR */}
        <div className="col-span-2 bg-gradient-to-br from-ads-500/20 to-ads-600/10 border border-ads-500/30 rounded-xl p-[1.25rem]">
          <div className="flex items-start justify-between mb-[0.5rem]">
            <p className="text-ads-400 text-[0.6875rem] uppercase tracking-wide font-semibold">MRR Mensal</p>
            <TrendingUp className="w-[1.25rem] h-[1.25rem] text-ads-500" strokeWidth={2} />
          </div>
          <p className="text-[2.5rem] font-bold leading-none text-ads-400 mb-[0.5rem]">{fmt(dre.mrr)}</p>
          <p className="text-ads-500/70 text-[0.8125rem]">Receita Recorrente Mensal</p>
        </div>
        
        {/* Lucro Bruto */}
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem]">
          <div className="flex items-start justify-between mb-[0.5rem]">
            <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">Lucro Bruto</p>
            <DollarSign className="w-[1rem] h-[1rem] text-status-green" strokeWidth={1.5} />
          </div>
          <p className="text-[1.75rem] font-bold leading-none text-status-green mb-[0.375rem]">{fmt(dre.lucro_bruto)}</p>
          <p className="text-ink-muted text-[0.75rem]">{pct(dre.lucro_bruto, dre.mrr)}% da receita</p>
        </div>
        
        {/* Lucro Líquido */}
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem]">
          <div className="flex items-start justify-between mb-[0.5rem]">
            <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">Lucro Líquido</p>
            <TrendingUp className={`w-[1rem] h-[1rem] ${dre.lucro_liquido >= 0 ? 'text-status-green' : 'text-status-red'}`} strokeWidth={1.5} />
          </div>
          <p className={`text-[1.75rem] font-bold leading-none mb-[0.375rem] ${dre.lucro_liquido >= 0 ? 'text-status-green' : 'text-status-red'}`}>{fmt(dre.lucro_liquido)}</p>
          <p className="text-ink-muted text-[0.75rem]">Margem {dre.margem.toFixed(1)}%</p>
        </div>
      </div>

      {/* ══ SAÚDE SAAS ════════════════════════════════════════════ */}
      {saude && (
        <div className="mb-[2rem]">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1rem]">Métricas de Saúde SaaS</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[0.75rem]">
            {[
              { label: 'LTV',          valor: fmt(saude.ltv),                          icon: DollarSign, cor: 'text-status-green',  tip: 'Valor vitalicio médio' },
              { label: 'CAC',          valor: fmt(saude.cac),                          icon: Target,     cor: 'text-status-orange', tip: 'Custo de aquisição' },
              { label: 'LTV/CAC',      valor: `${saude.ltv_cac.toFixed(1)}x`,          icon: Zap,        cor: saude.ltv_cac >= 30 ? 'text-status-green' : saude.ltv_cac >= 10 ? 'text-ads-500' : 'text-status-red', tip: 'Meta: > 30x' },
              { label: 'Payback',      valor: `${saude.payback_meses.toFixed(1)}m`,    icon: Clock,      cor: saude.payback_meses <= 12 ? 'text-status-green' : 'text-status-orange', tip: 'Meses para recuperar CAC' },
              { label: 'Churn Rate',   valor: `${saude.churn_rate.toFixed(1)}%`,       icon: AlertCircle,cor: saude.churn_rate <= 2 ? 'text-status-green' : 'text-status-red', tip: 'Taxa de cancelamento' },
              { label: 'Novos/Mês',   valor: String(saude.novos_mes),                 icon: Users,      cor: 'text-status-blue', tip: 'Novos clientes este mês' },
            ].map(({ label, valor, icon: Icon, cor, tip }) => (
              <div key={label} className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow px-[1rem] py-[0.875rem]" title={tip}>
                <div className="flex items-center justify-between mb-[0.375rem]">
                  <p className="text-ink-muted text-[0.625rem] uppercase tracking-wide font-semibold">{label}</p>
                  <Icon className={`w-[0.75rem] h-[0.75rem] ${cor}`} strokeWidth={1.5} />
                </div>
                <p className={`text-[1.25rem] font-bold leading-none ${cor}`}>{valor}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ DRE VISUAL — Demonstração de Resultado ══════════════════ */}
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem] mb-[2rem]">
        <div className="flex items-center justify-between mb-[1.25rem]">
          <div>
            <h3 className="text-ink-primary font-semibold text-[0.9375rem]">
              Demonstração do Resultado
            </h3>
            <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className={`text-[0.75rem] font-semibold px-[0.625rem] py-[0.25rem] rounded-full ${
            dre.margem >= 30 ? 'bg-status-green/10 text-status-green'
            : dre.margem >= 15 ? 'bg-ads-500/10 text-ads-400'
            : 'bg-status-red/10 text-status-red'
          }`}>
            Margem {dre.margem.toFixed(1)}%
          </span>
        </div>

        <div className="space-y-[0]">
          {/* Receita */}
          <div className="flex items-center justify-between py-[0.75rem] border-b border-surface-border">
            <div className="flex items-center gap-[0.75rem]">
              <div className="w-[0.1875rem] h-[2rem] rounded-full bg-ads-400" />
              <div>
                <p className="text-ink-primary font-semibold text-[0.9375rem]">Receita Operacional</p>
                <p className="text-ink-muted text-[0.6875rem]">MRR confirmado do período</p>
              </div>
            </div>
            <p className="text-ads-400 font-black text-[1.25rem] font-mono">{fmt(dre.mrr)}</p>
          </div>

          {/* Custos fixos */}
          <div className="flex items-center justify-between py-[0.625rem] pl-[1rem]">
            <div className="flex items-center gap-[0.5rem]">
              <div className="w-[0.125rem] h-[1.5rem] rounded-full bg-status-blue/40" />
              <p className="text-ink-secondary text-[0.875rem]">Custos Fixos</p>
            </div>
            <p className="text-status-blue font-semibold font-mono text-[0.9375rem]">({fmt(dre.custos_fixos)})</p>
          </div>

          {/* Custos variáveis */}
          <div className="flex items-center justify-between py-[0.625rem] pl-[1rem] border-b border-surface-border">
            <div className="flex items-center gap-[0.5rem]">
              <div className="w-[0.125rem] h-[1.5rem] rounded-full bg-status-orange/40" />
              <p className="text-ink-secondary text-[0.875rem]">Custos Variáveis</p>
            </div>
            <p className="text-status-orange font-semibold font-mono text-[0.9375rem]">({fmt(dre.custos_variaveis)})</p>
          </div>

          {/* = Lucro Bruto */}
          <div className="flex items-center justify-between py-[0.75rem] border-b border-surface-border bg-surface-hover/50 px-[0.5rem] rounded-[0.375rem] my-[0.25rem]">
            <div className="flex items-center gap-[0.75rem]">
              <div className="w-[0.1875rem] h-[2rem] rounded-full bg-status-green" />
              <div>
                <p className="text-ink-primary font-semibold text-[0.9375rem]">= Lucro Bruto</p>
                <p className="text-ink-muted text-[0.6875rem]">{pct(dre.lucro_bruto, dre.mrr)}% da receita</p>
              </div>
            </div>
            <p className="text-status-green font-black text-[1.125rem] font-mono">{fmt(dre.lucro_bruto)}</p>
          </div>

          {/* Imposto */}
          <div className="flex items-center justify-between py-[0.625rem] pl-[1rem] border-b border-surface-border">
            <div className="flex items-center gap-[0.5rem]">
              <div className="w-[0.125rem] h-[1.5rem] rounded-full bg-status-purple/40" />
              <p className="text-ink-secondary text-[0.875rem]">
                Imposto ({dre.tipo_tributacao} · {((dre.imposto_estimado / (dre.mrr || 1)) * 100).toFixed(0)}%)
              </p>
            </div>
            <p className="text-status-purple font-semibold font-mono text-[0.9375rem]">({fmt(dre.imposto_estimado)})</p>
          </div>

          {/* = Lucro Líquido */}
          <div className={`flex items-center justify-between py-[0.875rem] px-[0.75rem] rounded-[0.5rem] mt-[0.25rem] ${
            dre.lucro_liquido >= 0 ? 'bg-status-green/5 border border-status-green/20' : 'bg-status-red/5 border border-status-red/20'
          }`}>
            <div className="flex items-center gap-[0.75rem]">
              <div className={`w-[0.25rem] h-[2.5rem] rounded-full ${dre.lucro_liquido >= 0 ? 'bg-status-green' : 'bg-status-red'}`} />
              <div>
                <p className="text-ink-primary font-bold text-[1rem]">= Lucro Líquido</p>
                <p className="text-ink-muted text-[0.6875rem]">Após impostos e todos os custos</p>
              </div>
            </div>
            <p className={`font-black text-[1.5rem] font-mono ${dre.lucro_liquido >= 0 ? 'text-status-green' : 'text-status-red'}`}>
              {fmt(dre.lucro_liquido)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] mb-[2rem]">
        {/* ── DRE DISTRIBUIÇÃO ── */}
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1.25rem]">
            Distribuição da Receita
          </h3>
          {[
            { label: 'Custos Variáveis',                                 valor: dre.custos_variaveis,           cor: 'bg-status-orange' },
            { label: 'Custos Fixos',                                     valor: dre.custos_fixos,               cor: 'bg-status-blue'   },
            { label: `Imposto Est. (${dre.tipo_tributacao} ${((dre.imposto_estimado / (dre.mrr || 1)) * 100).toFixed(0)}%)`, valor: dre.imposto_estimado, cor: 'bg-status-purple' },
            { label: 'Lucro Líquido',                                    valor: Math.max(dre.lucro_liquido, 0), cor: 'bg-ads-500'       },
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

        {/* ── LANÇAMENTOS DO MÊS ── */}
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1.25rem]">
            Lançamentos do mês ({lancamentos.length})
          </h3>
          {lancamentos.length === 0 ? (
            <p className="text-ink-muted text-[0.875rem]">Nenhum lançamento este mês.</p>
          ) : (
            <div className="flex flex-col divide-y divide-surface-border">
              {lancamentos.map((l) => (
                <ContextMenu
                  key={l.id}
                  items={[
                    {
                      label: 'Editar',
                      icon: <Pencil className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,
                      onClick: () => { setEditandoLanc(l); setErroLanc('') },
                      shortcut: 'E',
                    },
                    {
                      label: 'Duplicar',
                      icon: <Copy className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,
                      onClick: () => duplicarLancamento(l),
                      shortcut: 'D',
                    },
                    {
                      label: l.status === 'pendente' ? 'Marcar como confirmado' : 'Marcar como pendente',
                      icon: l.status === 'pendente'
                        ? <CheckCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                        : <Clock3 className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,
                      onClick: async () => {
                        await supabase.from('financeiro_lancamentos')
                          .update({ status: l.status === 'pendente' ? 'confirmado' : 'pendente' })
                          .eq('id', l.id)
                        carregar()
                      },
                      separator: true,
                    },
                    {
                      label: 'Deletar',
                      icon: <Trash2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,
                      variant: 'danger',
                      onClick: () => confirmarDeletarLancamento(l.id, l.descricao),
                      separator: true,
                    },
                  ]}
                >
                  <div className="flex items-center gap-[0.75rem] py-[0.625rem] group">
                    <div className="flex-1 min-w-0">
                      <p className="text-ink-secondary text-[0.875rem] truncate">{l.descricao}</p>
                      <p className="text-ink-muted text-[0.6875rem] mt-[0.125rem]">
                        {new Date(l.data).toLocaleDateString('pt-BR')}
                        {' · '}
                        <span className="capitalize">{l.tipo.replace(/_/g, ' ')}</span>
                        {l.status === 'pendente' && (
                          <span className="ml-[0.375rem] text-status-orange font-medium">pendente</span>
                        )}
                      </p>
                    </div>
                    <p className={`text-[0.9375rem] font-semibold shrink-0 ${
                      l.tipo === 'receita' ? 'text-status-green' : 'text-status-red'
                    }`}>
                      {l.tipo === 'receita' ? '+' : '-'}{fmt(l.valor)}
                    </p>
                    {/* Ações — aparecem no hover */}
                    <div className="flex items-center gap-[0.25rem] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost" size="sm" className="w-[2rem] px-0"
                        title="Editar"
                        onClick={() => { setEditandoLanc(l); setErroLanc('') }}
                      >
                        <Pencil className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
                      </Button>
                      <Button
                        variant="ghost" size="sm" className="w-[2rem] px-0"
                        title="Duplicar"
                        onClick={() => duplicarLancamento(l)}
                      >
                        <Copy className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
                      </Button>
                      <Button
                        variant="ghost" size="sm" className="w-[2rem] px-0 text-status-red hover:text-status-red hover:bg-status-red/10"
                        title="Deletar"
                        loading={deletandoId === l.id}
                        onClick={() => confirmarDeletarLancamento(l.id, l.descricao)}
                      >
                        {deletandoId !== l.id && <Trash2 className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />}
                      </Button>
                    </div>
                  </div>
                </ContextMenu>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ RECHARTS MRR 12 MESES ═══════════════════════════════════ */}
      {sparkData.length > 1 && (
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem] mb-[2rem]">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1.25rem]">
            Evolução MRR — 12 meses
          </h3>
          <div className="h-[14rem]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                  formatter={(v: unknown, name: unknown) => [fmt(Number(v)), (name as string) === 'mrr' ? 'MRR' : 'Lucro'] as [string, string]}
                />
                <ReferenceLine y={0} stroke="var(--status-red)" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="mrr"   stroke="#FFA500" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="lucro" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-[1.5rem] mt-[0.75rem]">
            {[{ cor: '#FFA500', label: 'MRR' }, { cor: '#10B981', label: 'Lucro Líquido' }].map(({ cor, label }) => (
              <div key={label} className="flex items-center gap-[0.375rem]">
                <div className="w-[1.5rem] h-[0.125rem] rounded-full" style={{ background: cor }} />
                <span className="text-ink-muted text-[0.75rem]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ PROJEÇÃO 6 MESES ══════════════════════════════════════ */}
      {projecao.length > 0 && (
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem] mb-[2rem]">
          <div className="flex items-center justify-between mb-[1.25rem]">
            <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Projeção 6 meses</h3>
            <span className="text-ink-muted text-[0.75rem]">
              Baseado no trend dos últimos 3 meses
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.875rem]">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Mês', 'MRR Proj.', 'Lucro Proj.', 'Margem'].map((h) => (
                    <th key={h} className="text-left pb-[0.75rem] text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projecao.map((p) => (
                  <tr key={p.mes} className="border-b border-surface-border last:border-0">
                    <td className="py-[0.75rem] text-ink-secondary font-medium capitalize">{p.mes}</td>
                    <td className="py-[0.75rem] text-ads-500 font-semibold">{fmt(p.mrr)}</td>
                    <td className={`py-[0.75rem] font-semibold ${p.lucro >= 0 ? 'text-status-green' : 'text-status-red'}`}>{fmt(p.lucro)}</td>
                    <td className="py-[0.75rem] text-ink-muted">
                      {p.mrr > 0 ? `${((p.lucro / p.mrr) * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CLIENTES EM ATRASO ── */}
      {atrasados.length > 0 && (
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
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
                        estagioInadimplencia(c.dias_atraso) === 'critico' ? 'bg-status-red/15 text-status-red'
                        : estagioInadimplencia(c.dias_atraso) === 'grave' ? 'bg-status-red/15 text-status-red'
                        : estagioInadimplencia(c.dias_atraso) === 'suspensao' ? 'bg-status-orange/15 text-status-orange'
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
      </div>

      {/* ══ MODAL NOVO LANÇAMENTO ══════════════════════════════════ */}
      {modalLanc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-scale"
          onClick={(e) => { if (e.target === e.currentTarget) setModalLanc(false) }}
        >
          <div className="bg-surface-card border border-surface-border/40 rounded-2xl w-full max-w-md mx-[1rem] card-shadow">
            {/* Header */}
            <div className="flex items-center justify-between px-[1.5rem] py-[1.25rem] border-b border-surface-border/20">
              <div className="flex items-center gap-[0.625rem]">
                <div className="w-[2rem] h-[2rem] rounded-lg bg-ads-500/10 flex items-center justify-center">
                  <Plus className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={2} />
                </div>
                <h2 className="text-[1rem] font-semibold text-ink-primary">Novo Lançamento</h2>
              </div>
              <Button variant="ghost" size="sm" className="w-[2rem] px-0" onClick={() => setModalLanc(false)}>
                <XIcon className="w-[1rem] h-[1rem]" strokeWidth={1.75} />
              </Button>
            </div>

            {/* Form */}
            <form
              className="p-[1.5rem] space-y-[1rem]"
              onSubmit={(e) => { e.preventDefault(); salvarLancamento() }}
            >
              {erroLanc && (
                <p className="text-[0.8125rem] text-status-red bg-status-red/10 px-[0.75rem] py-[0.5rem] rounded-lg">
                  {erroLanc}
                </p>
              )}

              <div className="flex flex-col gap-[0.375rem]">
                <label className="text-[0.75rem] text-ink-secondary font-medium">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Mensalidade cliente XYZ"
                  value={novoLanc.descricao}
                  onChange={(e) => setNovoLanc((p) => ({ ...p, descricao: e.target.value }))}
                  className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-[0.75rem]">
                <div className="flex flex-col gap-[0.375rem]">
                  <label className="text-[0.75rem] text-ink-secondary font-medium">Valor (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={novoLanc.valor}
                    onChange={(e) => setNovoLanc((p) => ({ ...p, valor: e.target.value }))}
                    className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-[0.375rem]">
                  <label className="text-[0.75rem] text-ink-secondary font-medium">Data</label>
                  <input
                    type="date"
                    value={novoLanc.data}
                    onChange={(e) => setNovoLanc((p) => ({ ...p, data: e.target.value }))}
                    className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[0.75rem]">
                <div className="flex flex-col gap-[0.375rem]">
                  <label className="text-[0.75rem] text-ink-secondary font-medium">Tipo</label>
                  <select
                    value={novoLanc.tipo}
                    onChange={(e) => setNovoLanc((p) => ({ ...p, tipo: e.target.value as NovoLancForm['tipo'] }))}
                    className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                  >
                    <option value="receita">Receita</option>
                    <option value="custo_fixo">Custo Fixo</option>
                    <option value="custo_variavel">Custo Variável</option>
                  </select>
                </div>
                <div className="flex flex-col gap-[0.375rem]">
                  <label className="text-[0.75rem] text-ink-secondary font-medium">Status</label>
                  <select
                    value={novoLanc.status}
                    onChange={(e) => setNovoLanc((p) => ({ ...p, status: e.target.value as NovoLancForm['status'] }))}
                    className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                  >
                    <option value="confirmado">Confirmado</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[0.75rem]">
                <div className="flex flex-col gap-[0.375rem]">
                  <label className="text-[0.75rem] text-ink-secondary font-medium">Categoria</label>
                  <input
                    type="text"
                    placeholder="Ex: Tráfego, Ferramentas…"
                    value={novoLanc.categoria}
                    onChange={(e) => setNovoLanc((p) => ({ ...p, categoria: e.target.value }))}
                    className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-[0.375rem]">
                  <label className="text-[0.75rem] text-ink-secondary font-medium">Cliente (opcional)</label>
                  <select
                    value={novoLanc.cliente_id}
                    onChange={(e) => setNovoLanc((p) => ({ ...p, cliente_id: e.target.value }))}
                    className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                  >
                    <option value="">Nenhum</option>
                    {clientesLista.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-[0.5rem] pt-[0.5rem]">
                <Button variant="ghost" size="md" onClick={() => setModalLanc(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="md" loading={salvandoLanc}>
                  Salvar Lançamento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL EDITAR LANÇAMENTO ══════════════════════════════════ */}
      {editandoLanc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-scale"
          onClick={(e) => { if (e.target === e.currentTarget) setEditandoLanc(null) }}
        >
          <div className="bg-surface-card border border-surface-border/40 rounded-2xl w-full max-w-md mx-[1rem] card-shadow">
            <div className="flex items-center justify-between px-[1.5rem] py-[1.25rem] border-b border-surface-border/20">
              <div className="flex items-center gap-[0.625rem]">
                <div className="w-[2rem] h-[2rem] rounded-lg bg-ads-500/10 flex items-center justify-center">
                  <Pencil className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={2} />
                </div>
                <h2 className="text-[1rem] font-semibold text-ink-primary">Editar Lançamento</h2>
              </div>
              <Button variant="ghost" size="sm" className="w-[2rem] px-0" onClick={() => setEditandoLanc(null)}>
                <XIcon className="w-[1rem] h-[1rem]" strokeWidth={1.75} />
              </Button>
            </div>
            <form className="p-[1.5rem] space-y-[1rem]" onSubmit={(e) => { e.preventDefault(); salvarEdicao() }}>
              {erroLanc && (
                <p className="text-[0.8125rem] text-status-red bg-status-red/10 px-[0.75rem] py-[0.5rem] rounded-lg">{erroLanc}</p>
              )}
              <div className="flex flex-col gap-[0.375rem]">
                <label className="text-[0.75rem] text-ink-secondary font-medium">Descrição</label>
                <input
                  type="text"
                  value={editandoLanc.descricao}
                  onChange={(e) => setEditandoLanc((p) => p ? { ...p, descricao: e.target.value } : p)}
                  className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-[0.75rem]">
                <div className="flex flex-col gap-[0.375rem]">
                  <label className="text-[0.75rem] text-ink-secondary font-medium">Valor (R$)</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={editandoLanc.valor}
                    onChange={(e) => setEditandoLanc((p) => p ? { ...p, valor: parseFloat(e.target.value) || 0 } : p)}
                    className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-[0.375rem]">
                  <label className="text-[0.75rem] text-ink-secondary font-medium">Data</label>
                  <input
                    type="date"
                    value={editandoLanc.data.slice(0, 10)}
                    onChange={(e) => setEditandoLanc((p) => p ? { ...p, data: e.target.value } : p)}
                    className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-[0.75rem]">
                <div className="flex flex-col gap-[0.375rem]">
                  <label className="text-[0.75rem] text-ink-secondary font-medium">Tipo</label>
                  <select
                    value={editandoLanc.tipo}
                    onChange={(e) => setEditandoLanc((p) => p ? { ...p, tipo: e.target.value as FinanceiroLancamento['tipo'] } : p)}
                    className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                  >
                    <option value="receita">Receita</option>
                    <option value="custo_fixo">Custo Fixo</option>
                    <option value="custo_variavel">Custo Variável</option>
                  </select>
                </div>
                <div className="flex flex-col gap-[0.375rem]">
                  <label className="text-[0.75rem] text-ink-secondary font-medium">Status</label>
                  <select
                    value={editandoLanc.status ?? 'confirmado'}
                    onChange={(e) => setEditandoLanc((p) => p ? { ...p, status: e.target.value as FinanceiroLancamento['status'] } : p)}
                    className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                  >
                    <option value="confirmado">Confirmado</option>
                    <option value="pendente">Pendente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-[0.75rem]">
                <div className="flex flex-col gap-[0.375rem]">
                  <label className="text-[0.75rem] text-ink-secondary font-medium">Categoria</label>
                  <input
                    type="text"
                    placeholder="Ex: Tráfego, Ferramentas…"
                    value={(editandoLanc as unknown as Record<string, unknown>)['categoria'] as string ?? ''}
                    onChange={(e) => setEditandoLanc((p) => p ? { ...p, categoria: e.target.value } as FinanceiroLancamento : p)}
                    className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-[0.375rem]">
                  <label className="text-[0.75rem] text-ink-secondary font-medium">Cliente (opcional)</label>
                  <select
                    value={(editandoLanc as unknown as Record<string, unknown>)['cliente_id'] as string ?? ''}
                    onChange={(e) => setEditandoLanc((p) => p ? { ...p, cliente_id: e.target.value } as FinanceiroLancamento : p)}
                    className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                  >
                    <option value="">Nenhum</option>
                    {clientesLista.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-[0.5rem] pt-[0.5rem]">
                <Button variant="ghost" size="md" onClick={() => setEditandoLanc(null)}>Cancelar</Button>
                <Button type="submit" variant="primary" size="md" loading={salvandoLanc}>Salvar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
