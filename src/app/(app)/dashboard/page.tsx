'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Users,
  DollarSign,
  Percent,
  CreditCard,
  Download,
  RefreshCw,
  GripVertical,
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { MainLayout }            from '@/components/layout/MainLayout'
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

type SectionId = 'kpis' | 'morning-briefing' | 'clientes-progresso' | 'acoes-dia' | 'clientes-retidos' | 'dre-alertas' | 'gemini-chat'

interface Section {
  id: SectionId
  label: string
}

const STORAGE_KEY = 'adsgator-dashboard-order'

const DEFAULT_SECTIONS: Section[] = [
  { id: 'kpis', label: 'KPIs' },
  { id: 'morning-briefing', label: 'Morning Briefing' },
  { id: 'clientes-progresso', label: 'Clientes em Progresso' },
  { id: 'acoes-dia', label: 'Ações do Dia' },
  { id: 'clientes-retidos', label: 'Clientes Retidos' },
  { id: 'dre-alertas', label: 'DRE + Alertas' },
  { id: 'gemini-chat', label: 'Gemini Chat' },
]

export default function DashboardPage() {
  const { dados, loading, metricas, recarregar } = useClientes()
  const [saldoGoogle, setSaldoGoogle] = useState<number | null>(null)
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS)
  const [isDragging, setIsDragging] = useState(false)

  // Carregar ordem salva
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Section[]
        setSections(parsed)
      }
    } catch {
      // Fallback para ordem padrão
    }
  }, [])

  // Salvar ordem quando mudar
  useEffect(() => {
    if (isDragging) return // Não salvar durante drag
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sections))
    } catch {}
  }, [sections, isDragging])

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false)
    if (!result.destination) return

    const items = Array.from(sections)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)

    setSections(items)
    toast.success('Dashboard reorganizado!')
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

  // ── SEPARAÇÕES ──────────────────────────────────────────────────────
  const retidos   = dados.filter((d) => d.cliente.status === 'congelado')
  const progresso = dados.filter((d) =>
    d.cliente.status !== 'congelado' && d.cliente.status !== 'cancelado'
  )

  // ── AÇÕES DO DIA ─────────────────────────────────────────────────────
  const acoesDoDia = useMemo(() => {
    const acoes: AcaoItem[] = []

    dados.forEach(({ cliente, estagio }) => {
      const dias = cliente.dias_atraso ?? 0

      // D+15 CRÍTICO: quebra de contrato
      if (dias >= 15) {
        acoes.push({
          cliente, estagio,
          urgencia:  'critica',
          descricao: `${dias} dias sem pagamento — envie notificação de rescisão`,
          acaoLabel: '#COBRANÇA',
          whatsapp:  cliente.whatsapp
            ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}. Em razão do atraso de ${dias} dias, comunicamos a rescisão contratual.`)}`
            : undefined,
        })
      // D+7 ATENÇÃO: suspensão iminente
      } else if (dias >= 7) {
        acoes.push({
          cliente, estagio,
          urgencia:  'atencao',
          descricao: `${dias} dias em atraso — campanha em risco de suspensão`,
          acaoLabel: '#ALERTA D+7',
          whatsapp:  cliente.whatsapp
            ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}! Seu pagamento está em atraso há ${dias} dias.`)}`
            : undefined,
        })
      // Novo cliente recebido
      } else if (cliente.status === 'recebido') {
        acoes.push({
          cliente, estagio,
          urgencia:  'atencao',
          descricao: 'Novo cliente — envie o #BOASVINDAS agora',
          acaoLabel: '#BOASVINDAS',
          whatsapp:  cliente.whatsapp
            ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent('Olá! Seja bem-vindo(a) à Adsgator! 🎉')}`
            : undefined,
        })
      // Congelado sem resposta
      } else if (cliente.status === 'congelado') {
        acoes.push({
          cliente, estagio,
          urgencia:  'review',
          descricao: 'Cliente retido — envie lembrete de retorno',
          acaoLabel: 'Lembrete',
          whatsapp:  cliente.whatsapp
            ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}! Ainda aguardamos seu retorno.`)}`
            : undefined,
        })
      }
    })

    // Ordenar: critica > atencao > review
    const ORDEM: Record<string, number> = { critica: 0, atencao: 1, review: 2 }
    return acoes.sort((a, b) => ORDEM[a.urgencia] - ORDEM[b.urgencia]).slice(0, 5)
  }, [dados])

  async function handleCongelar(clienteId: string) {
    await supabase
      .from('clientes')
      .update({ status: 'congelado' })
      .eq('id', clienteId)
    recarregar()
  }

  // ── ACTIONS DA TOPBAR ────────────────────────────────────────────────
  const topBarActions = (
    <div className="flex items-center gap-[0.5rem]">
      <button
        onClick={recarregar}
        disabled={loading}
        className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] hover:text-ink-primary transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-[0.875rem] h-[0.875rem] ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
        <span className="hidden sm:inline">Atualizar</span>
      </button>
      <button className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors">
        <Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        <span className="hidden sm:inline">Importar</span>
      </button>
    </div>
  )

  // Renderizar seção baseada no ID
  const renderSection = (section: Section) => {
    switch (section.id) {
      case 'kpis':
        return (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-[1rem]">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[8rem] rounded-xl bg-surface-card border border-surface-border animate-pulse" />
              ))
            ) : (
              <>
                <KpiCard
                  label="Clientes Ativos"
                  value={metricas.ativos}
                  accentColor="amber"
                  icon={<Users className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
                  href="/clientes"
                />
                <KpiCard
                  label="MRR"
                  value={`R$ ${metricas.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
                  accentColor="green"
                  icon={<DollarSign className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
                  href="/financeiro"
                />
                <KpiCard
                  label="Taxa de Retenção"
                  value={`${metricas.taxaRetencao}%`}
                  accentColor="red"
                  icon={<Percent className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
                />
                <KpiCard
                  label="Saldo Google"
                  value={saldoGoogle !== null ? `R$ ${saldoGoogle.toLocaleString('pt-BR')}` : '…'}
                  delta={saldoGoogle !== null && saldoGoogle < 200 ? '⚠️ Baixo' : undefined}
                  deltaDir={saldoGoogle !== null && saldoGoogle < 200 ? 'down' : undefined}
                  accentColor="blue"
                  alert={saldoGoogle !== null && saldoGoogle < 200}
                  alertLabel="Envie #SALDOGOOGLE"
                  icon={<CreditCard className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
                />
              </>
            )}
          </div>
        )

      case 'morning-briefing':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1rem]">
            <div className="md:col-span-2">
              <MorningBriefing />
            </div>
            <WeatherClock />
          </div>
        )

      case 'acoes-dia':
        if (loading || acoesDoDia.length === 0) return null
        return <AcoesDoDia items={acoesDoDia} onCongelar={handleCongelar} />

      case 'clientes-progresso':
        return (
          <section>
            <div className="flex items-center justify-between mb-[0.75rem]">
              <h2 className="text-ink-primary font-semibold text-[0.9375rem]">
                Clientes em Progresso
                <span className="ml-[0.5rem] text-ink-muted text-[0.8125rem] font-normal">
                  ({progresso.length}/{metricas.total})
                </span>
              </h2>
              <a href="/clientes" className="text-ads-500 text-[0.8125rem] hover:underline">
                Ver todos →
              </a>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[12rem] rounded-xl bg-surface-card border border-surface-border animate-pulse" />
                ))}
              </div>
            ) : progresso.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-[4rem] text-ink-muted">
                <Users className="w-[3rem] h-[3rem] mb-[1rem]" strokeWidth={1} />
                <p className="text-[0.9375rem] font-medium">Nenhum cliente em progresso</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
                {progresso.slice(0, 6).map(({ cliente, estagio }) => (
                  <ClienteProgressCard
                    key={cliente.id}
                    cliente={cliente}
                    estagio={estagio}
                    onCongelar={handleCongelar}
                  />
                ))}
              </div>
            )}
          </section>
        )

      case 'clientes-retidos':
        if (retidos.length === 0) return null
        return (
          <section>
            <div className="flex items-center gap-[0.5rem] mb-[0.75rem]">
              <div className="w-[0.5rem] h-[0.5rem] rounded-full bg-status-orange animate-pulse-slow" />
              <h2 className="text-ink-primary font-semibold text-[0.9375rem]">
                Clientes Retidos
                <span className="ml-[0.5rem] text-ink-muted text-[0.8125rem] font-normal">
                  ({retidos.length})
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
              {retidos.map(({ cliente, estagio }) => (
                <ClienteProgressCard
                  key={cliente.id}
                  cliente={cliente}
                  estagio={estagio}
                  onCongelar={handleCongelar}
                  isRetido
                />
              ))}
            </div>
          </section>
        )

      case 'dre-alertas':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem]">
            <DRESparkline />
            <AlertasCriticos />
          </div>
        )

      case 'gemini-chat':
        return <GeminiChat />

      default:
        return null
    }
  }

  return (
    <MainLayout
      title="Dashboard"
      subtitle={`Semana de ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
      actions={topBarActions}
    >

      {/* ════════════════════════════════════════════════
          DRAG-TO-REORDER DASHBOARD
      ════════════════════════════════════════════════ */}
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={() => setIsDragging(true)}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-[1.5rem]"
            >
              {sections.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`relative ${snapshot.isDragging ? 'opacity-80' : ''}`}
                    >
                      {/* Drag handle */}
                      <div
                        {...provided.dragHandleProps}
                        className="absolute -left-8 top-2 p-1.5 rounded hover:bg-surface-hover cursor-grab active:cursor-grabbing text-ink-muted hover:text-ink-secondary transition-colors"
                        title="Arraste para reordenar"
                      >
                        <GripVertical className="w-4 h-4" strokeWidth={2} />
                      </div>

                      {/* Conteúdo da seção */}
                      {renderSection(section)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </MainLayout>
  )
}
