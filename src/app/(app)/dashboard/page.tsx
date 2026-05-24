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
} from 'lucide-react'
import { MainLayout }            from '@/components/layout/MainLayout'
import { BentoCard }             from '@/components/dashboard/BentoCard'
import { KpiCard }               from '@/components/dashboard/KpiCard'
import { AcoesDoDia }            from '@/components/dashboard/AcoesDoDia'
import { ClienteProgressCard }   from '@/components/dashboard/ClienteProgressCard'
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

const STORAGE_KEY = 'adsgator-bento-layouts-v2'
const BREAKPOINTS = { xl: 1400, lg: 1024, md: 768, sm: 480 }
const COLS        = { xl: 12,   lg: 10,   md: 6,   sm: 2   }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Layouts = Record<string, any[]>

const DEFAULT_LAYOUTS: Layouts = {
  xl: [
    { i: 'kpi-ativos',        x: 0,  y: 0,  w: 3,  h: 2, minW: 2, minH: 2 },
    { i: 'kpi-mrr',           x: 3,  y: 0,  w: 3,  h: 2, minW: 2, minH: 2 },
    { i: 'kpi-retencao',      x: 6,  y: 0,  w: 3,  h: 2, minW: 2, minH: 2 },
    { i: 'kpi-saldo',         x: 9,  y: 0,  w: 3,  h: 2, minW: 2, minH: 2 },
    { i: 'morning-briefing',  x: 0,  y: 2,  w: 8,  h: 3, minW: 4, minH: 2 },
    { i: 'weather-clock',     x: 8,  y: 2,  w: 4,  h: 3, minW: 3, minH: 2 },
    { i: 'acoes-dia',         x: 0,  y: 5,  w: 4,  h: 5, minW: 3, minH: 3 },
    { i: 'clientes-progresso',x: 4,  y: 5,  w: 8,  h: 5, minW: 4, minH: 3 },
    { i: 'dre-sparkline',     x: 0,  y: 10, w: 6,  h: 4, minW: 4, minH: 2 },
    { i: 'alertas-criticos',  x: 6,  y: 10, w: 6,  h: 4, minW: 4, minH: 2 },
    { i: 'gemini-chat',       x: 0,  y: 14, w: 12, h: 4, minW: 6, minH: 2 },
  ],
  lg: [
    { i: 'kpi-ativos',        x: 0,  y: 0,  w: 3,  h: 2 },
    { i: 'kpi-mrr',           x: 3,  y: 0,  w: 3,  h: 2 },
    { i: 'kpi-retencao',      x: 6,  y: 0,  w: 2,  h: 2 },
    { i: 'kpi-saldo',         x: 8,  y: 0,  w: 2,  h: 2 },
    { i: 'morning-briefing',  x: 0,  y: 2,  w: 7,  h: 3 },
    { i: 'weather-clock',     x: 7,  y: 2,  w: 3,  h: 3 },
    { i: 'acoes-dia',         x: 0,  y: 5,  w: 4,  h: 5 },
    { i: 'clientes-progresso',x: 4,  y: 5,  w: 6,  h: 5 },
    { i: 'dre-sparkline',     x: 0,  y: 10, w: 5,  h: 4 },
    { i: 'alertas-criticos',  x: 5,  y: 10, w: 5,  h: 4 },
    { i: 'gemini-chat',       x: 0,  y: 14, w: 10, h: 4 },
  ],
  md: [
    { i: 'kpi-ativos',        x: 0,  y: 0,  w: 3,  h: 2 },
    { i: 'kpi-mrr',           x: 3,  y: 0,  w: 3,  h: 2 },
    { i: 'kpi-retencao',      x: 0,  y: 2,  w: 3,  h: 2 },
    { i: 'kpi-saldo',         x: 3,  y: 2,  w: 3,  h: 2 },
    { i: 'morning-briefing',  x: 0,  y: 4,  w: 6,  h: 3 },
    { i: 'weather-clock',     x: 0,  y: 7,  w: 3,  h: 3 },
    { i: 'acoes-dia',         x: 3,  y: 7,  w: 3,  h: 3 },
    { i: 'clientes-progresso',x: 0,  y: 10, w: 6,  h: 5 },
    { i: 'dre-sparkline',     x: 0,  y: 15, w: 3,  h: 4 },
    { i: 'alertas-criticos',  x: 3,  y: 15, w: 3,  h: 4 },
    { i: 'gemini-chat',       x: 0,  y: 19, w: 6,  h: 4 },
  ],
  sm: [
    { i: 'kpi-ativos',        x: 0, y: 0,  w: 2, h: 2 },
    { i: 'kpi-mrr',           x: 0, y: 2,  w: 2, h: 2 },
    { i: 'kpi-retencao',      x: 0, y: 4,  w: 2, h: 2 },
    { i: 'kpi-saldo',         x: 0, y: 6,  w: 2, h: 2 },
    { i: 'morning-briefing',  x: 0, y: 8,  w: 2, h: 4 },
    { i: 'weather-clock',     x: 0, y: 12, w: 2, h: 3 },
    { i: 'acoes-dia',         x: 0, y: 15, w: 2, h: 5 },
    { i: 'clientes-progresso',x: 0, y: 20, w: 2, h: 6 },
    { i: 'dre-sparkline',     x: 0, y: 26, w: 2, h: 4 },
    { i: 'alertas-criticos',  x: 0, y: 30, w: 2, h: 4 },
    { i: 'gemini-chat',       x: 0, y: 34, w: 2, h: 4 },
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
                <div className="grid grid-cols-2 gap-[0.75rem]">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[8rem] rounded-lg skeleton-shimmer" />)}
                </div>
              ) : progresso.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-ink-muted gap-[0.5rem]">
                  <Users className="w-[2rem] h-[2rem]" strokeWidth={1} />
                  <p className="text-[0.8125rem]">Nenhum cliente em progresso</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-[0.75rem] overflow-y-auto h-full">
                  {progresso.slice(0, 4).map(({ cliente, estagio }) => (
                    <ClienteProgressCard key={cliente.id} cliente={cliente} estagio={estagio} onCongelar={handleCongelar} />
                  ))}
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
