'use client'

import { useMemo } from 'react'
import {
  Users,
  DollarSign,
  Percent,
  CreditCard,
  Download,
  RefreshCw,
} from 'lucide-react'
import { MainLayout }            from '@/components/layout/MainLayout'
import { KpiCard }               from '@/components/dashboard/KpiCard'
import { AcoesDoDia }            from '@/components/dashboard/AcoesDoDia'
import { ClienteProgressCard }   from '@/components/dashboard/ClienteProgressCard'
import { useClientes }           from '@/lib/hooks/useClientes'
import { supabase }              from '@/lib/supabase'
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

// ── DADOS MOCK DE SPARKLINE (substitua com dados reais do Supabase) ────
const SPARK_ATIVOS   = [18, 20, 19, 21, 22, 21, 24]
const SPARK_MRR      = [38200, 39400, 41000, 42300, 43100, 44600, 45200]
const SPARK_RETENCAO = [88, 86, 85, 84, 83, 82, 82]
const SPARK_SALDO    = [2100, 1800, 2400, 1950, 1400, 1600, 1250]

export default function DashboardPage() {
  const { dados, loading, metricas, recarregar } = useClientes()

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

  return (
    <MainLayout
      title="Central Operacional"
      subtitle={`Semana de ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
      actions={topBarActions}
    >

      {/* ════════════════════════════════════════════════
          BLOCO 1 — KPI CARDS (BENTO ROW)
      ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[1rem] mb-[2rem]">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[8rem] rounded-xl bg-surface-card border border-surface-border animate-pulse" />
          ))
        ) : (
          <>
            <KpiCard
              label="Clientes Ativos"
              value={metricas.ativos}
              delta="+3 esta semana"
              deltaDir="up"
              sparkData={SPARK_ATIVOS}
              accentColor="#FFA500"
              icon={<Users className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
            />
            <KpiCard
              label="MRR"
              value={`R$ ${metricas.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
              delta="+12%"
              deltaDir="up"
              deltaLabel="vs mês passado"
              sparkData={SPARK_MRR}
              accentColor="#10B981"
              icon={<DollarSign className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
            />
            <KpiCard
              label="Taxa de Retenção"
              value={`${metricas.taxaRetencao}%`}
              delta="-5%"
              deltaDir="down"
              deltaLabel="vs semana"
              sparkData={SPARK_RETENCAO}
              accentColor="#EF4444"
              icon={<Percent className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
            />
            <KpiCard
              label="Saldo Google"
              value="R$ 1.250"
              delta="⚠️ Baixo"
              deltaDir="down"
              sparkData={SPARK_SALDO}
              accentColor="#F59E0B"
              alert={true}
              alertLabel="Envie #SALDOGOOGLE"
              icon={<CreditCard className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
            />
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════
          BLOCO 2 — AÇÕES DO DIA
      ════════════════════════════════════════════════ */}
      {!loading && acoesDoDia.length > 0 && (
        <AcoesDoDia
          items={acoesDoDia}
          onCongelar={handleCongelar}
        />
      )}

      {/* ════════════════════════════════════════════════
          BLOCO 3 — GRID DE PROGRESSO
      ════════════════════════════════════════════════ */}
      <section className="mb-[2rem]">
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

      {/* ════════════════════════════════════════════════
          BLOCO 4 — CLIENTES RETIDOS
      ════════════════════════════════════════════════ */}
      {retidos.length > 0 && (
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
      )}
    </MainLayout>
  )
}
