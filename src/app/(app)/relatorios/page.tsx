'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { BarChart3, RefreshCw, FileText, Globe, Sparkles, Mail, Send, Download, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { MainLayout } from '@/components/layout/MainLayout'
import { ReportPreview } from '@/components/relatorios/ReportPreview'
import { EmailComposer } from '@/components/relatorios/EmailComposer'
import { ReportHistory } from '@/components/relatorios/ReportHistory'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RelatorioMensal {
  id: string
  cliente_id: string
  mes_ano: string
  status_geracao: 'pendente' | 'processando' | 'gerado' | 'erro'
  investimento_ads?: number
  conversoes?: number
  roi?: number
  sessoes_ga4?: number
  usuarios_novos?: number
  taxa_engajamento?: number
  conteudo_markdown?: string
  analise_ia?: {
    resumo_executivo: string
    pontos_positivos: string[]
    pontos_atencao: string[]
    recomendacoes: string[]
    proximo_passo: string
  }
  dados_ads?: {
    impressoes: number
    cliques: number
    ctr: number
    cpc_medio: number
    conversoes: number
    cpa: number
    investimento: number
    keywords?: Array<{ keyword: string; cliques: number; impressoes: number; ctr: number; cpc: number; conversoes: number }>
    horario?: Array<{ hora: number; dia_semana: number; cliques: number; conversoes: number }>
  }
  dados_ga4?: {
    usuarios: number
    sessoes: number
    visualizacoes_pagina: number
    duracao_media_sessao?: number
    taxa_rejeicao?: number
    novos_usuarios?: number
    paginas?: Array<{ pagina: string; visualizacoes: number; sessoes?: number; taxa_rejeicao?: number }>
    fontes?: Array<{ fonte: string; sessoes: number; usuarios: number }>
  }
}

type TabId = 'ads' | 'ga4' | 'executivo' | 'email'

const TABS: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: 'ads',       label: 'Relatório Ads',   icon: BarChart3 },
  { id: 'ga4',       label: 'GA4',             icon: Globe     },
  { id: 'executivo', label: 'Executivo',        icon: Sparkles  },
  { id: 'email',     label: 'Enviar por Email', icon: Mail      },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const [clientes,     setClientes]     = useState<{ id: string; nome: string; email?: string }[]>([])
  const [clienteSel,   setClienteSel]   = useState<string>('')
  const [relatorios,   setRelatorios]   = useState<RelatorioMensal[]>([])
  const [selecionado,  setSelecionado]  = useState<RelatorioMensal | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [gerando,      setGerando]      = useState(false)
  const [gerandoTodos, setGerandoTodos] = useState(false)
  const [tab,          setTab]          = useState<TabId>('ads')
  const [mesAnoSel,    setMesAnoSel]    = useState<string>('')

  // Load clients
  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome, email')
      .eq('status', 'ativo')
      .order('nome')
      .then(({ data }) => {
        const lista = data ?? []
        setClientes(lista)
        if (lista.length > 0) setClienteSel(lista[0].id)
      })
  }, [])

  // Default mes/ano = last month
  useEffect(() => {
    const hoje   = new Date()
    const mesRef = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
    setMesAnoSel(`${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, '0')}`)
  }, [])

  const carregar = useCallback(async () => {
    if (!clienteSel) return
    setLoading(true)
    try {
      const res  = await fetch(`/api/analytics/${clienteSel}`)
      const json = await res.json() as { relatorios: RelatorioMensal[] }
      const lista = json.relatorios ?? []
      setRelatorios(lista)
      const match = lista.find((r) => r.mes_ano === mesAnoSel) ?? lista[0] ?? null
      setSelecionado(match)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [clienteSel, mesAnoSel])

  useEffect(() => { carregar() }, [carregar])

  async function gerarRelatorio() {
    if (!clienteSel || !mesAnoSel) return
    setGerando(true)
    try {
      const res = await fetch(`/api/analytics/${clienteSel}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mesAno: mesAnoSel }),
      })
      if (res.ok) {
        toast.success('Relatório solicitado! Aguarde o processamento.')
        await carregar()
      } else {
        toast.error('Erro ao solicitar relatório.')
      }
    } finally {
      setGerando(false)
    }
  }

  async function gerarTodos() {
    if (!mesAnoSel) return
    setGerandoTodos(true)
    try {
      let ok = 0
      for (const c of clientes) {
        await fetch(`/api/analytics/${c.id}`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ mesAno: mesAnoSel }),
        })
        ok++
      }
      toast.success(`${ok} relatórios solicitados.`)
      await carregar()
    } finally {
      setGerandoTodos(false)
    }
  }

  function baixarMarkdown() {
    if (!selecionado?.conteudo_markdown) return
    const blob = new Blob([selecionado.conteudo_markdown], { type: 'text/markdown' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `relatorio_${selecionado.mes_ano}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportarPDF() {
    if (!selecionado) {
      toast.error('Selecione um relatório para exportar.')
      return
    }
    window.print()
  }

  const geradosEsteMes = relatorios.filter((r) => r.status_geracao === 'gerado').length
  const clienteAtual   = clientes.find((c) => c.id === clienteSel)

  // Month/year options — last 12 months
  const mesAnoOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - 1 - i)
    const val   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    return { val, label }
  })

  return (
    <MainLayout
      title="Relatórios"
      subtitle="Google Ads + GA4 por cliente"
      actions={
        <div className="flex items-center gap-[0.5rem] flex-wrap">
          <select
            value={clienteSel}
            onChange={(e) => setClienteSel(e.target.value)}
            className="h-[2rem] pl-[0.625rem] pr-[1.75rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          <select
            value={mesAnoSel}
            onChange={(e) => {
              setMesAnoSel(e.target.value)
              const match = relatorios.find((r) => r.mes_ano === e.target.value) ?? null
              setSelecionado(match)
            }}
            className="h-[2rem] pl-[0.625rem] pr-[1.75rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
          >
            {mesAnoOptions.map(({ val, label }) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          <button
            onClick={exportarPDF}
            disabled={!selecionado}
            className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-secondary text-[0.8125rem] font-medium hover:border-ads-500/40 transition-colors disabled:opacity-50"
            title="Exportar relatório como PDF"
          >
            <FileDown className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            Exportar PDF
          </button>

          <button
            onClick={gerarRelatorio}
            disabled={gerando || !clienteSel}
            className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors disabled:opacity-50"
          >
            {gerando
              ? <div className="w-[0.75rem] h-[0.75rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <RefreshCw className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            }
            Gerar Relatório
          </button>

          <button
            onClick={gerarTodos}
            disabled={gerandoTodos}
            className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-secondary text-[0.8125rem] font-medium hover:border-ads-500/40 transition-colors disabled:opacity-50"
          >
            {gerandoTodos
              ? <div className="w-[0.75rem] h-[0.75rem] border-2 border-ink-secondary border-t-transparent rounded-full animate-spin" />
              : <Send className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            }
            Gerar Todos
          </button>
        </div>
      }
    >
      <div className="page-enter">

        {/* Status summary bar */}
        <div className="flex items-center gap-[1.5rem] bg-surface-card border border-surface-border rounded-xl px-[1.25rem] py-[0.875rem] mb-[1.5rem] card-shadow">
          <div className="flex items-center gap-[0.5rem]">
            <FileText className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.5} />
            <span className="text-ink-muted text-[0.8125rem]">Relatórios gerados:</span>
            <span className="text-ink-primary font-semibold text-[0.8125rem]">{geradosEsteMes} / {clientes.length}</span>
          </div>
          {selecionado?.status_geracao === 'pendente' && (
            <span className="flex items-center gap-[0.375rem] text-status-orange text-[0.75rem]">
              <div className="w-[0.5rem] h-[0.5rem] rounded-full bg-status-orange animate-pulse" />
              Processando…
            </span>
          )}
          {selecionado?.conteudo_markdown && (
            <button
              onClick={baixarMarkdown}
              className="ml-auto flex items-center gap-[0.375rem] text-ink-secondary text-[0.75rem] hover:text-ads-500 transition-colors"
            >
              <Download className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
              Baixar .md
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-[0.25rem] border-b border-surface-border mb-[1.5rem]">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-[0.375rem] px-[1rem] py-[0.625rem] text-[0.8125rem] font-medium border-b-2 -mb-px transition-colors',
                tab === id
                  ? 'border-ads-500 text-ads-500'
                  : 'border-transparent text-ink-muted hover:text-ink-secondary'
              )}
            >
              <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-[16rem]">
            <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && relatorios.length === 0 && tab !== 'email' && (
          <div className="bg-surface-card border border-surface-border rounded-xl card-shadow p-[3rem] text-center">
            <BarChart3 className="w-[2.5rem] h-[2.5rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
            <p className="text-ink-secondary text-[0.875rem]">
              Nenhum relatório encontrado. Clique em &ldquo;Gerar Relatório&rdquo; para criar o primeiro.
            </p>
          </div>
        )}

        {!loading && (
          <>
            {/* Tab: Ads */}
            {tab === 'ads' && (
              <ReportPreview
                clienteNome={clienteAtual?.nome ?? ''}
                mesAno={mesAnoSel}
                ads={selecionado?.dados_ads ?? (selecionado ? {
                  impressoes: 0,
                  cliques: 0,
                  ctr: 0,
                  cpc_medio: 0,
                  conversoes: selecionado.conversoes ?? 0,
                  cpa: 0,
                  investimento: selecionado.investimento_ads ?? 0,
                } : undefined)}
                analise={selecionado?.analise_ia ? {
                  resumo: selecionado.analise_ia.resumo_executivo,
                  pontos_positivos: selecionado.analise_ia.pontos_positivos,
                  pontos_atencao: selecionado.analise_ia.pontos_atencao,
                  recomendacoes: selecionado.analise_ia.recomendacoes,
                } : null}
              />
            )}

            {/* Tab: GA4 */}
            {tab === 'ga4' && (
              <ReportPreview
                clienteNome={clienteAtual?.nome ?? ''}
                mesAno={mesAnoSel}
                ga4={selecionado?.dados_ga4 ?? (selecionado ? {
                  usuarios: selecionado.usuarios_novos ?? 0,
                  sessoes: selecionado.sessoes_ga4 ?? 0,
                  visualizacoes_pagina: 0,
                  taxa_rejeicao: selecionado.taxa_engajamento,
                } : undefined)}
              />
            )}

            {/* Tab: Executivo */}
            {tab === 'executivo' && selecionado?.analise_ia && (
              <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] card-shadow space-y-[1.25rem]">
                <h3 className="text-ads-500 font-semibold text-[1rem] flex items-center gap-[0.5rem]">
                  <Sparkles className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
                  Análise Executiva — Gemini
                </h3>
                <p className="text-ink-secondary text-[0.875rem] leading-relaxed">{selecionado.analise_ia.resumo_executivo}</p>
                {selecionado.analise_ia.proximo_passo && (
                  <div className="bg-ads-500/10 border border-ads-500/20 rounded-[0.5rem] px-[1rem] py-[0.875rem]">
                    <p className="text-ads-500 text-[0.6875rem] font-semibold uppercase tracking-wide mb-[0.25rem]">Próximo Passo</p>
                    <p className="text-ink-primary text-[0.875rem]">{selecionado.analise_ia.proximo_passo}</p>
                  </div>
                )}
              </div>
            )}
            {tab === 'executivo' && !selecionado?.analise_ia && !loading && (
              <div className="bg-surface-card border border-surface-border rounded-xl p-[3rem] card-shadow text-center">
                <Sparkles className="w-[2.5rem] h-[2.5rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
                <p className="text-ink-secondary text-[0.875rem]">Nenhuma análise disponível. Gere o relatório para obter a análise IA.</p>
              </div>
            )}

            {/* Tab: Email */}
            {tab === 'email' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem]">
                <EmailComposer
                  clienteId={clienteSel}
                  clienteNome={clienteAtual?.nome}
                  clienteEmail={clienteAtual?.email}
                  defaultVariables={mesAnoSel ? { mes_ano: mesAnoSel, nome_cliente: clienteAtual?.nome ?? '' } : undefined}
                />
                <ReportHistory clienteId={clienteSel} />
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}
