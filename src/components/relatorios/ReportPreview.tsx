'use client'

import { ReportAdsSection } from './ReportAdsSection'
import { ReportGA4Section } from './ReportGA4Section'
import { ReportAIAnalysis } from './ReportAIAnalysis'
import type { ReportAdsSectionProps } from './ReportAdsSection'
import type { ReportGA4SectionProps } from './ReportGA4Section'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportPreviewProps {
  clienteNome: string
  mesAno: string
  ads?: ReportAdsSectionProps['dados']
  ga4?: ReportGA4SectionProps['dados']
  analise?: {
    resumo?: string
    pontos_positivos?: string[]
    pontos_atencao?: string[]
    recomendacoes?: string[]
  } | null
  loading?: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ReportPreview({ clienteNome, mesAno, ads, ga4, analise, loading }: ReportPreviewProps) {
  const [ano, mes] = mesAno.split('-')
  const mesLabel = new Date(Number(ano), Number(mes) - 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-[2rem]">
      {/* Report header */}
      <div className="bg-surface-card border border-surface-border rounded-xl px-[1.5rem] py-[1.25rem] card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[0.5rem]">
          <div>
            <p className="text-ads-500 font-bold text-[1.25rem] tracking-tight">⚡ AdsGator</p>
            <p className="text-ink-secondary text-[0.8125rem] mt-[0.125rem]">Relatório de Performance</p>
          </div>
          <div className="text-right">
            <p className="text-ink-primary font-semibold text-[0.9375rem]">{clienteNome}</p>
            <p className="text-ink-muted text-[0.8125rem] capitalize">{mesLabel}</p>
          </div>
        </div>
      </div>

      {/* Google Ads section */}
      <ReportAdsSection dados={ads ?? null} loading={loading} />

      {/* Divider */}
      <div className="border-t border-surface-border" />

      {/* GA4 section */}
      <ReportGA4Section dados={ga4 ?? null} loading={loading} />

      {/* Divider */}
      {(analise || loading) && <div className="border-t border-surface-border" />}

      {/* AI Analysis */}
      {(analise || loading) && (
        <ReportAIAnalysis analise={analise ?? null} loading={loading} />
      )}
    </div>
  )
}
