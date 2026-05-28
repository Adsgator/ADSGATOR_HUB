'use client'

import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'

interface AnaliseIA {
  resumo?: string
  pontos_positivos?: string[]
  pontos_atencao?: string[]
  recomendacoes?: string[]
}

interface ReportAIAnalysisProps {
  analise: AnaliseIA | null
  loading?: boolean
}

export function ReportAIAnalysis({ analise, loading }: ReportAIAnalysisProps) {
  if (loading) {
    return (
      <div className="space-y-[0.5rem]">
        {[90, 75, 60, 85, 70].map((w, i) => (
          <div key={i} className="h-[0.875rem] rounded skeleton-shimmer" style={{ width: `${w}%` }} />
        ))}
      </div>
    )
  }

  if (!analise) return null

  return (
    <div className="flex flex-col gap-[1rem]">
      {analise.resumo && (
        <div className="p-[0.875rem] bg-ads-500/5 border border-ads-500/15 rounded-xl">
          <div className="flex items-center gap-[0.375rem] mb-[0.5rem]">
            <Sparkles className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={2} />
            <span className="text-[0.8125rem] font-semibold text-ads-500">Resumo IA</span>
          </div>
          <p className="text-[0.8125rem] text-ink-secondary leading-relaxed">{analise.resumo}</p>
        </div>
      )}

      {analise.pontos_positivos && analise.pontos_positivos.length > 0 && (
        <div>
          <div className="flex items-center gap-[0.375rem] mb-[0.5rem]">
            <TrendingUp className="w-[0.875rem] h-[0.875rem] text-status-green" strokeWidth={2} />
            <span className="text-[0.8125rem] font-semibold text-status-green">Pontos Positivos</span>
          </div>
          <ul className="flex flex-col gap-[0.375rem]">
            {analise.pontos_positivos.map((p, i) => (
              <li key={i} className="flex items-start gap-[0.5rem] text-[0.8125rem] text-ink-secondary">
                <span className="text-status-green mt-[0.125rem] flex-shrink-0">+</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analise.pontos_atencao && analise.pontos_atencao.length > 0 && (
        <div>
          <div className="flex items-center gap-[0.375rem] mb-[0.5rem]">
            <AlertTriangle className="w-[0.875rem] h-[0.875rem] text-status-orange" strokeWidth={2} />
            <span className="text-[0.8125rem] font-semibold text-status-orange">Pontos de Atenção</span>
          </div>
          <ul className="flex flex-col gap-[0.375rem]">
            {analise.pontos_atencao.map((p, i) => (
              <li key={i} className="flex items-start gap-[0.5rem] text-[0.8125rem] text-ink-secondary">
                <span className="text-status-orange mt-[0.125rem] flex-shrink-0">!</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analise.recomendacoes && analise.recomendacoes.length > 0 && (
        <div>
          <div className="flex items-center gap-[0.375rem] mb-[0.5rem]">
            <Lightbulb className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={2} />
            <span className="text-[0.8125rem] font-semibold text-ink-primary">Recomendações</span>
          </div>
          <ul className="flex flex-col gap-[0.375rem]">
            {analise.recomendacoes.map((r, i) => (
              <li key={i} className="flex items-start gap-[0.5rem] text-[0.8125rem] text-ink-secondary">
                <span className="text-ads-500 font-bold mt-[0.125rem] flex-shrink-0">{i + 1}.</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
