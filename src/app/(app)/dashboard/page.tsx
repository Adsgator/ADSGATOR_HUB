'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const { Responsive: RGLResponsive } = require('react-grid-layout') as { Responsive: React.ComponentType<any> }
import {
  Users,
  DollarSign,
  Percent,
  CreditCard,
  Download,
  RefreshCw,
  RotateCcw,
  MessageCircle,
  ExternalLink,
  PauseCircle,
} from 'lucide-react'
import { MainLayout }            from '@/components/layout/MainLayout'
import { BentoCard }             from '@/components/dashboard/BentoCard'
import { KpiCard }               from '@/components/dashboard/KpiCard'
import { AcoesDoDia }            from '@/components/dashboard/AcoesDoDia'

import { MorningBriefing }       from '@/components/dashboard/MorningBriefing'
import { WeatherClock }          from '@/components/dashboard/WeatherClock'
import { DRESparkline }          from '@/components/dashboard/DRESparkline'
import { AlertasCriticos }       from '@/components/dashboard/AlertasCriticos'
import { GeminiChat }            from '@/components/dashboard/GeminiChat'
import { useClientes }           from '@/lib/hooks/useClientes'
import { supabase }              from '@/lib/supabase'
import { toast } from 'sonner'
import type { Cliente, Estagio } from '@/lib/types'

type Urgencia = 'critica' | 'atencao' | 'review'

interface AcaoItem {
  cliente:   Cliente
  estagio:   Estagio | null
  urgencia:  Urgencia
  descricao: string
  acaoLabel: string
  whatsapp?: string
}

const STORAGE_KEY = 'adsgator-bento-layouts-v3'
const BREAKPOINTS = { xl: 1400, lg: 1024, md: 768, sm: 480 }
const COLS        = { xl: 12,   lg: 10,   md: 6,   sm: 2   }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Layouts = Record<string, any[]>

const DEFAULT_LAYOUTS: Layouts = {
  xl: [
    // ROW 0-5: Hero (DRE) + Lista (Clientes) — espelho da referência
    { i: 'dre-sparkline',     x: 0,  y: 0,  w: 7,  h: 6, minW: 4, minH: 4 },
    { i: 'clientes-progresso',x: 7,  y: 0,  w: 5,  h: 6, minW: 3, minH: 4 },
    // ROW 6-8: Morning Briefing + Ações + Weather
    { i: 'morning-briefing',  x: 0,  y: 6,  w: 5,  h: 4, minW: 3, minH: 3 },
    { i: 'acoes-dia',         x: 5,  y: 6,  w: 4,  h: 4, minW: 3, minH: 3 },
    { i: 'weather-clock',     x: 9,  y: 6,  w: 3,  h: 4, minW: 2, minH: 3 },
    // ROW 10-11: 4 KPI cards
    { i: 'kpi-ativos',        x: 0,  y: 10, w: 3,  h: 3, minW: 2, minH: 2 },
    { i: 'kpi-mrr',           x: 3,  y: 10, w: 3,  h: 3, minW: 2, minH: 2 },
    { i: 'kpi-retencao',      x: 6,  y: 10, w: 3,  h: 3, minW: 2, minH: 2 },
    { i: 'kpi-saldo',         x: 9,  y: 10, w: 3,  h: 3, minW: 2, minH: 2 },
    // ROW 13-15: Alertas + Gemini
    { i: 'alertas-criticos',  x: 0,  y: 13, w: 6,  h: 4, minW: 4, minH: 2 },
    { i: 'gemini-chat',       x: 6,  y: 13, w: 6,  h: 4, minW: 4, minH: 2 },
  ],
  lg: [
    { i: 'dre-sparkline',     x: 0,  y: 0,  w: 6,  h: 6 },
    { i: 'clientes-progresso',x: 6,  y: 0,  w: 4,  h: 6 },
    { i: 'morning-briefing',  x: 0,  y: 6,  w: 5,  h: 4 },
    { i: 'acoes-dia',         x: 5,  y: 6,  w: 3,  h: 4 },
    { i: 'weather-clock',     x: 8,  y: 6,  w: 2,  h: 4 },
    { i: 'kpi-ativos',        x: 0,  y: 10, w: 3,  h: 3 },
    { i: 'kpi-mrr',           x: 3,  y: 10, w: 3,  h: 3 },
    { i: 'kpi-retencao',      x: 6,  y: 10, w: 2,  h: 3 },
    { i: 'kpi-saldo',         x: 8,  y: 10, w: 2,  h: 3 },
    { i: 'alertas-criticos',  x: 0,  y: 13, w: 5,  h: 4 },
    { i: 'gemini-chat',       x: 5,  y: 13, w: 5,  h: 4 },
  ],
  md: [
    { i: 'dre-sparkline',     x: 0,  y: 0,  w: 6,  h: 5 },
    { i: 'clientes-progresso',x: 0,  y: 5,  w: 6,  h: 5 },
    { i: 'morning-briefing',  x: 0,  y: 10, w: 6,  h: 4 },
    { i: 'acoes-dia',         x: 0,  y: 14, w: 3,  h: 4 },
    { i: 'weather-clock',     x: 3,  y: 14, w: 3,  h: 4 },
    { i: 'kpi-ativos',        x: 0,  y: 18, w: 3,  h: 3 },
    { i: 'kpi-mrr',           x: 3,  y: 18, w: 3,  h: 3 },
    { i: 'kpi-retencao',      x: 0,  y: 21, w: 3,  h: 3 },
    { i: 'kpi-saldo',         x: 3,  y: 21, w: 3,  h: 3 },
    { i: 'alertas-criticos',  x: 0,  y: 24, w: 3,  h: 4 },
    { i: 'gemini-chat',       x: 3,  y: 24, w: 3,  h: 4 },
  ],
  sm: [
    { i: 'dre-sparkline',     x: 0, y: 0,  w: 2, h: 5 },
    { i: 'clientes-progresso',x: 0, y: 5,  w: 2, h: 6 },
    { i: 'morning-briefing',  x: 0, y: 11, w: 2, h: 4 },
    { i: 'acoes-dia',         x: 0, y: 15, w: 2, h: 5 },
    { i: 'weather-clock',     x: 0, y: 20, w: 2, h: 3 },
    { i: 'kpi-ativos',        x: 0, y: 23, w: 2, h: 3 },
    { i: 'kpi-mrr',           x: 0, y: 26, w: 2, h: 3 },
    { i: 'kpi-retencao',      x: 0, y: 29, w: 2, h: 3 },
    { i: 'kpi-saldo',         x: 0, y: 32, w: 2, h: 3 },
    { i: 'alertas-criticos',  x: 0, y: 35, w: 2, h: 4 },
    { i: 'gemini-chat',       x: 0, y: 39, w: 2, h: 4 },
  ],
}

export default function DashboardPage() {
  const { dados, loading, metricas, recarregar } = useClientes()
  const [saldoGoogle, setSaldoGoogle] = useState<number | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [layouts, setLayouts] = useState<Record<string, any[]>>(DEFAULT_LAYOUTS)
  const [containerWidth, setContainerWidth] = useState(1200)
  const containerRef = useRef<HTMLDivElement>(null)

  // Medir largura do container para passar ao RGL
  const measureWidth = useCallback(() => {
    if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth)
  }, [])

  useEffect(() => {
    measureWidth()
    const ro = new ResizeObserver(measureWidth)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [measureWidth])

  // Carregar layout salvo
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setLayouts(JSON.parse(saved) as Layouts)
    } catch {}
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLayoutChange = (_: any[], allLayouts: Record<string, any[]>) => {
    setLayouts(allLayouts)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts)) } catch {}
  }

  const handleReset = () => {
    setLayouts(DEFAULT_LAYOUTS)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    toast.success('Layout resetado')
  }

  useEffect(() => {
    supabase
      .from('clientes')
      .select('saldo_google')
      .eq('status', 'ativo')
      .then(({ data }) => {
        const total = ((data ?? []) as { saldo_google?: number }[]).reduce((s, c) => s + (c.saldo_google ?? 0), 0)
        setSaldoGoogle(total)
      })
  }, [])

  const progresso = dados.filter((d) =>
    d.cliente.status !== 'congelado' && d.cliente.status !== 'cancelado'
  )

  const acoesDoDia = useMemo(() => {
    const acoes: AcaoItem[] = []
    dados.forEach(({ cliente, estagio }) => {
      const dias = cliente.dias_atraso ?? 0
      if (dias >= 15) {
        acoes.push({ cliente, estagio, urgencia: 'critica', descricao: `${dias} dias sem pagamento — envie notificação de rescisão`, acaoLabel: '#COBRANÇA', whatsapp: cliente.whatsapp ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}. Em razão do atraso de ${dias} dias, comunicamos a rescisão contratual.`)}` : undefined })
      } else if (dias >= 7) {
        acoes.push({ cliente, estagio, urgencia: 'atencao', descricao: `${dias} dias em atraso — campanha em risco de suspensão`, acaoLabel: '#ALERTA D+7', whatsapp: cliente.whatsapp ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}! Seu pagamento está em atraso há ${dias} dias.`)}` : undefined })
      } else if (cliente.status === 'recebido') {
        acoes.push({ cliente, estagio, urgencia: 'atencao', descricao: 'Novo cliente — envie o #BOASVINDAS agora', acaoLabel: '#BOASVINDAS', whatsapp: cliente.whatsapp ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent('Olá! Seja bem-vindo(a) à Adsgator!')}` : undefined })
      } else if (cliente.status === 'congelado') {
        acoes.push({ cliente, estagio, urgencia: 'review', descricao: 'Cliente retido — envie lembrete de retorno', acaoLabel: 'Lembrete', whatsapp: cliente.whatsapp ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}! Ainda aguardamos seu retorno.`)}` : undefined })
      }
    })
    const ORDEM: Record<string, number> = { critica: 0, atencao: 1, review: 2 }
    return acoes.sort((a, b) => ORDEM[a.urgencia] - ORDEM[b.urgencia]).slice(0, 5)
  }, [dados])

  async function handleCongelar(clienteId: string) {
    await supabase.from('clientes').update({ status: 'congelado' }).eq('id', clienteId)
    recarregar()
  }

  const topBarActions = (
    <div className="flex items-center gap-[0.5rem]">
      <button
        onClick={handleReset}
        title="Resetar layout"
        className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary hover:text-ink-primary transition-colors"
      >
        <RotateCcw className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
      </button>
      <button
        onClick={recarregar}
        disabled={loading}
        className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary hover:text-ink-primary transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-[0.875rem] h-[0.875rem] ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
      </button>
      <button className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors">
        <Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        <span className="hidden sm:inline">Importar</span>
      </button>
    </div>
  )

  return (
    <MainLayout
      title="Dashboard"
      subtitle={`Semana de ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
      actions={topBarActions}
    >
      <div className="page-enter -mx-[2rem] px-[2rem]" ref={containerRef}>
        <RGLResponsive
          className="layout"
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={80}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          draggableHandle=".bento-drag-handle"
          onLayoutChange={handleLayoutChange}
          width={containerWidth}
          useCSSTransforms
          isResizable
          isDraggable
        >
          {/* ── KPIs ─────────────────────────────── */}
          <div key="kpi-ativos">
            <BentoCard noPadding>
              {loading
                ? <div className="h-full rounded-xl skeleton-shimmer" />
                : <KpiCard label="Clientes Ativos" value={metricas.ativos} accentColor="amber" icon={<Users className="w-[1rem] h-[1rem]" strokeWidth={1.75} />} href="/clientes" />
              }
            </BentoCard>
          </div>

          <div key="kpi-mrr">
            <BentoCard noPadding>
              {loading
                ? <div className="h-full rounded-xl skeleton-shimmer" />
                : <KpiCard label="MRR" value={`R$ ${metricas.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} accentColor="green" icon={<DollarSign className="w-[1rem] h-[1rem]" strokeWidth={1.75} />} href="/financeiro" />
              }
            </BentoCard>
          </div>

          <div key="kpi-retencao">
            <BentoCard noPadding>
              {loading
                ? <div className="h-full rounded-xl skeleton-shimmer" />
                : <KpiCard label="Taxa de Retenção" value={`${metricas.taxaRetencao}%`} accentColor="red" icon={<Percent className="w-[1rem] h-[1rem]" strokeWidth={1.75} />} />
              }
            </BentoCard>
          </div>

          <div key="kpi-saldo">
            <BentoCard noPadding>
              {loading
                ? <div className="h-full rounded-xl skeleton-shimmer" />
                : <KpiCard label="Saldo Google" value={saldoGoogle !== null ? `R$ ${saldoGoogle.toLocaleString('pt-BR')}` : '…'} delta={saldoGoogle !== null && saldoGoogle < 200 ? 'Baixo' : undefined} deltaDir={saldoGoogle !== null && saldoGoogle < 200 ? 'down' : undefined} accentColor="blue" alert={saldoGoogle !== null && saldoGoogle < 200} alertLabel="Envie #SALDOGOOGLE" icon={<CreditCard className="w-[1rem] h-[1rem]" strokeWidth={1.75} />} />
              }
            </BentoCard>
          </div>

          {/* ── MORNING BRIEFING ─────────────────── */}
          <div key="morning-briefing">
            <BentoCard noPadding>
              <MorningBriefing />
            </BentoCard>
          </div>

          {/* ── WEATHER CLOCK ────────────────────── */}
          <div key="weather-clock">
            <BentoCard noPadding>
              <WeatherClock />
            </BentoCard>
          </div>

          {/* ── AÇÕES DO DIA ─────────────────────── */}
          <div key="acoes-dia">
            <BentoCard title="Ações do Dia" subtitle="Prioridades de hoje">
              {loading || acoesDoDia.length === 0
                ? <div className="flex items-center justify-center h-full text-ink-muted text-[0.8125rem]">Nenhuma ação pendente</div>
                : <AcoesDoDia items={acoesDoDia} onCongelar={handleCongelar} />
              }
            </BentoCard>
          </div>

          {/* ── CLIENTES EM PROGRESSO ────────────── */}
          <div key="clientes-progresso">
            <BentoCard
              title="Clientes em Progresso"
              subtitle={`${progresso.length} de ${metricas.total} clientes`}
              actions={<a href="/clientes" className="text-ads-500 text-[0.75rem] hover:underline">Ver todos</a>}
            >
              {loading ? (
                <div className="flex flex-col gap-[0.5rem]">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[2.75rem] rounded-lg skeleton-shimmer" />)}
                </div>
              ) : progresso.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-ink-muted gap-[0.5rem]">
                  <Users className="w-[2rem] h-[2rem]" strokeWidth={1} />
                  <p className="text-[0.8125rem]">Nenhum cliente em progresso</p>
                </div>
              ) : (
                <div className="flex flex-col overflow-y-auto h-full">
                  {progresso.slice(0, 10).map(({ cliente }) => {
                    const iniciais = cliente.nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
                    const diasAtraso = cliente.dias_atraso ?? 0
                    const STATUS_DOT: Record<string, string> = {
                      ativo: 'bg-status-green', recebido: 'bg-status-blue',
                      onboarding: 'bg-ads-500',  setup_trafego: 'bg-status-orange',
                      congelado: 'bg-ink-muted',  cancelado: 'bg-status-red',
                    }
                    const STATUS_LABEL: Record<string, string> = {
                      ativo: 'Ativo', recebido: 'Recebido', onboarding: 'Onboarding',
                      setup_trafego: 'Setup Tráfego', congelado: 'Congelado', cancelado: 'Cancelado',
                    }
                    return (
                      <div key={cliente.id} className="flex items-center gap-[0.75rem] py-[0.625rem] border-b border-surface-border/40 last:border-0 group">
                        <div className="w-[2rem] h-[2rem] rounded-full bg-ads-500/15 flex items-center justify-center shrink-0">
                          <span className="text-ads-500 text-[0.6875rem] font-bold">{iniciais}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-ink-primary text-[0.8125rem] font-semibold truncate leading-tight">{cliente.nome}</p>
                          <div className="flex items-center gap-[0.375rem] mt-[0.125rem]">
                            <span className={`w-[0.375rem] h-[0.375rem] rounded-full shrink-0 ${STATUS_DOT[cliente.status] ?? 'bg-ink-muted'}`} />
                            <span className="text-ink-muted text-[0.6875rem]">{STATUS_LABEL[cliente.status] ?? cliente.status}</span>
                            {diasAtraso > 0 && <span className="text-status-red text-[0.6875rem] font-medium">{diasAtraso}d atraso</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-[0.25rem] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {cliente.whatsapp && (
                            <a href={`https://wa.me/${cliente.whatsapp}`} target="_blank" rel="noreferrer"
                              className="w-[1.625rem] h-[1.625rem] flex items-center justify-center rounded-md bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors">
                              <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                            </a>
                          )}
                          <a href={`/clientes/${cliente.id}`}
                            className="w-[1.625rem] h-[1.625rem] flex items-center justify-center rounded-md bg-surface-hover text-ink-secondary hover:text-ink-primary transition-colors">
                            <ExternalLink className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                          </a>
                          <button onClick={() => handleCongelar(cliente.id)}
                            className="w-[1.625rem] h-[1.625rem] flex items-center justify-center rounded-md bg-surface-hover text-ink-secondary hover:text-ink-primary transition-colors">
                            <PauseCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </BentoCard>
          </div>

          {/* ── DRE SPARKLINE ────────────────────── */}
          <div key="dre-sparkline">
            <BentoCard noPadding>
              <DRESparkline />
            </BentoCard>
          </div>

          {/* ── ALERTAS CRÍTICOS ─────────────────── */}
          <div key="alertas-criticos">
            <BentoCard noPadding>
              <AlertasCriticos />
            </BentoCard>
          </div>

          {/* ── GEMINI CHAT ──────────────────────── */}
          <div key="gemini-chat">
            <BentoCard noPadding>
              <GeminiChat />
            </BentoCard>
          </div>
        </RGLResponsive>
      </div>
    </MainLayout>
  )
}
