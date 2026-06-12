'use client'

// Banner de prontidão do sistema — renderizado ACIMA do grid do dashboard
// (não é widget react-grid-layout, então não interfere nos layouts salvos).
// Some quando o setup está 100% completo.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CircleDashed, Zap } from 'lucide-react'
import type { SetupChecklistResult } from '@/lib/setup-checklist'

export function SetupProgressCard() {
  const [data, setData] = useState<SetupChecklistResult | null>(null)

  useEffect(() => {
    fetch('/api/setup-checklist')
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => { /* banner é informativo — sem fallback de erro */ })
  }, [])

  if (!data || data.completo) return null

  const pendentes = data.itens.filter((i) => i.status === 'pendente')
  const proximos  = pendentes.slice(0, 2)

  return (
    <div className="bg-surface-card border border-ads-500/30 rounded-xl p-[1rem] card-shadow animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-[0.75rem]">
        <div className="flex items-center gap-[0.75rem] flex-1 min-w-0">
          <div className="w-[2.25rem] h-[2.25rem] rounded-lg bg-ads-500/10 flex items-center justify-center shrink-0">
            <Zap className="w-[1.125rem] h-[1.125rem] text-ads-500" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-ink-primary text-[0.875rem] font-semibold">
              Sistema pronto: {data.percent}% — {pendentes.length} pendência{pendentes.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-x-[1rem] gap-y-[0.125rem] mt-[0.125rem]">
              {proximos.map((i) => (
                <span key={i.id} className="flex items-center gap-[0.25rem] text-ink-muted text-[0.75rem]">
                  <CircleDashed className="w-[0.75rem] h-[0.75rem] text-status-orange shrink-0" strokeWidth={2} />
                  {i.label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <Link
          href="/configuracoes?tab=setup"
          className="flex items-center gap-[0.375rem] h-[2.25rem] px-[1rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white text-[0.8125rem] font-semibold transition-colors shrink-0 self-start sm:self-auto"
        >
          Completar setup
          <ArrowRight className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
        </Link>
      </div>
    </div>
  )
}
