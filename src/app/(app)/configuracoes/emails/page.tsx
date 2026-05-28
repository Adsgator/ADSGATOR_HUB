'use client'

import { useState } from 'react'
import { Mail, Eye, X, Loader2 } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { cn } from '@/lib/utils'

// ─── Template metadata ────────────────────────────────────────────────────────

const TEMPLATE_LIST = [
  {
    id: 'report-google-ads',
    nome: 'Relatório Google Ads',
    descricao: 'Enviado mensalmente ao cliente com resumo das campanhas, KPIs e análise de desempenho.',
    variaveis: ['nome_cliente', 'mes_ano', 'impressoes', 'cliques', 'ctr', 'conversoes', 'cpa', 'investimento'],
  },
  {
    id: 'report-ga4',
    nome: 'Relatório Google Analytics 4',
    descricao: 'Resumo de sessões, usuários e comportamento do site no período selecionado.',
    variaveis: ['nome_cliente', 'mes_ano', 'sessoes', 'usuarios', 'visualizacoes', 'engajamento', 'duracao', 'rejeicao'],
  },
  {
    id: 'report-executive',
    nome: 'Relatório Executivo',
    descricao: 'Consolidado da agência — MRR, clientes ativos e total de conversões.',
    variaveis: ['mes_ano', 'total_clientes', 'mrr', 'total_conversoes', 'resumo'],
  },
  {
    id: 'welcome',
    nome: 'Boas-vindas',
    descricao: 'Enviado automaticamente ao cadastrar um novo cliente na plataforma.',
    variaveis: ['nome_cliente'],
  },
  {
    id: 'payment-reminder',
    nome: 'Lembrete de Pagamento',
    descricao: 'Alerta de inadimplência enviado após X dias de atraso.',
    variaveis: ['nome_cliente', 'dias_atraso', 'valor', 'pagamento_url'],
  },
  {
    id: 'alert-saldo-baixo',
    nome: 'Alerta: Saldo Google Ads Baixo',
    descricao: 'Notificação quando o saldo da conta Google Ads estiver abaixo do mínimo recomendado.',
    variaveis: ['nome_cliente', 'saldo_atual', 'saldo_minimo'],
  },
  {
    id: 'alert-performance',
    nome: 'Alerta de Performance',
    descricao: 'Disparo quando uma métrica ultrapassa o threshold configurado (CPC alto, CTR baixo, etc.).',
    variaveis: ['nome_cliente', 'metrica', 'valor_atual', 'valor_referencia'],
  },
]

// ─── Preview modal ────────────────────────────────────────────────────────────

function PreviewModal({ templateId, onClose }: { templateId: string; onClose: () => void }) {
  const [html, setHtml]       = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  // Fetch preview HTML on mount
  useState(() => {
    fetch('/api/v1/relatorios/preview-html', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ templateId, variables: { nome_cliente: 'Cliente Exemplo', mes_ano: '2025-04' } }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.html) setHtml(data.html)
        else setError(data.error ?? 'Erro ao carregar preview.')
      })
      .catch(() => setError('Erro de rede.'))
      .finally(() => setLoading(false))
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-scale">
      <div className="relative bg-surface-card border border-surface-border rounded-2xl w-[90vw] max-w-[48rem] h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-[1.25rem] py-[0.875rem] border-b border-surface-border shrink-0">
          <p className="text-ink-primary font-semibold text-[0.9375rem]">Preview do Template</p>
          <button
            onClick={onClose}
            className="w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded-[0.375rem] hover:bg-surface-hover transition-colors"
          >
            <X className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-[1.5rem] h-[1.5rem] text-ads-500 animate-spin" strokeWidth={2} />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full">
              <p className="text-status-red text-[0.875rem]">{error}</p>
            </div>
          )}
          {html && (
            <iframe
              srcDoc={html}
              className="w-full h-full border-0"
              title="Email preview"
              sandbox="allow-same-origin"
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmailTemplatesPage() {
  const [preview, setPreview] = useState<string | null>(null)

  return (
    <MainLayout
      title="Templates de Email"
      subtitle="7 templates disponíveis — edite variáveis e visualize antes de enviar"
    >
      <div className="page-enter space-y-[1rem]">
        {TEMPLATE_LIST.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-surface-card border border-surface-border rounded-xl px-[1.25rem] py-[1rem] card-shadow flex items-start justify-between gap-[1rem]"
          >
            <div className="flex items-start gap-[0.875rem] min-w-0">
              <div className="w-[2.25rem] h-[2.25rem] rounded-[0.5rem] bg-ads-500/10 flex items-center justify-center shrink-0">
                <Mail className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-ink-primary font-semibold text-[0.875rem]">{tmpl.nome}</p>
                <p className="text-ink-secondary text-[0.8125rem] mt-[0.125rem] leading-snug">{tmpl.descricao}</p>
                <div className="flex flex-wrap gap-[0.375rem] mt-[0.625rem]">
                  {tmpl.variaveis.map((v) => (
                    <span
                      key={v}
                      className="px-[0.5rem] py-[0.125rem] rounded-full text-[0.625rem] font-mono bg-surface-elevated border border-surface-border text-ink-muted"
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setPreview(tmpl.id)}
              className={cn(
                'flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] shrink-0',
                'bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] font-medium',
                'hover:border-ads-500/40 hover:text-ads-500 transition-colors'
              )}
            >
              <Eye className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
              Preview
            </button>
          </div>
        ))}
      </div>

      {preview && <PreviewModal templateId={preview} onClose={() => setPreview(null)} />}
    </MainLayout>
  )
}
