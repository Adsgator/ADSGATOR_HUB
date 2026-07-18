'use client'

import { Smartphone, Monitor, Tablet, Tv, HelpCircle } from 'lucide-react'
import type { LinhaDispositivoGA4, TecnologiaGA4 } from '@/lib/ga4-detalhes'
import { fmtNum, fmtPct } from '../trafego/labels'
import { DISPOSITIVO_GA4_LABEL } from './labelsGa4'

// Por dispositivo (mobile/desktop/tablet × visualizações, novos usuários,
// sessões) + informações técnicas (SO com versão, resolução de tela).

const ICONES: Record<string, typeof Smartphone> = {
  mobile: Smartphone, desktop: Monitor, tablet: Tablet, 'smart tv': Tv,
}

const CORES: Record<string, string> = {
  mobile: '#FFB100', desktop: '#10B981', tablet: '#3B82F6', 'smart tv': '#8b5cf6',
}

export function DispositivosGA4Card({ dados }: { dados: LinhaDispositivoGA4[] }) {
  const maxSessoes = Math.max(1, ...dados.map((d) => d.sessoes))
  return (
    <div className="space-y-[0.875rem]">
      {dados.map((d) => {
        const chave = d.dispositivo.toLowerCase()
        const Icone = ICONES[chave] ?? HelpCircle
        const cor = CORES[chave] ?? '#6B7280'
        return (
          <div key={d.dispositivo}>
            <div className="flex items-center justify-between mb-[0.25rem]">
              <div className="flex items-center gap-[0.5rem]">
                <div className="p-[0.375rem] rounded-md" style={{ backgroundColor: `${cor}20` }}>
                  <Icone className="w-[0.875rem] h-[0.875rem]" style={{ color: cor }} strokeWidth={2} />
                </div>
                <span className="text-[0.8125rem] text-ink-primary font-medium">
                  {DISPOSITIVO_GA4_LABEL[chave] ?? d.dispositivo}
                </span>
              </div>
              <span className="text-[0.75rem] text-ink-secondary">
                {fmtNum(d.sessoes)} sessões · {fmtNum(d.visualizacoes)} visualiz. · {fmtNum(d.usuariosNovos)} novos · {fmtPct(d.taxaEngajamento)} engaj.
              </span>
            </div>
            <div className="h-[0.375rem] rounded-full bg-surface-hover overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(d.sessoes / maxSessoes) * 100}%`, backgroundColor: cor }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function TecnologiaCard({ dados }: { dados: TecnologiaGA4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.25rem]">
      <div>
        <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.5rem]">Sistema operacional</p>
        <div className="space-y-[0.375rem]">
          {dados.sistemas.slice(0, 8).map((s, i) => (
            <div key={`${s.sistema}-${s.versao}-${i}`} className="flex items-center justify-between text-[0.8125rem]">
              <span className="text-ink-secondary truncate max-w-[10rem]" title={`${s.sistema} ${s.versao}`}>
                {s.sistema} <span className="text-ink-muted">{s.versao}</span>
              </span>
              <span className="text-ink-primary font-medium shrink-0">{fmtNum(s.sessoes)} sessões</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.5rem]">Resolução de tela</p>
        <div className="space-y-[0.375rem]">
          {dados.resolucoes.slice(0, 8).map((r) => (
            <div key={r.resolucao} className="flex items-center justify-between text-[0.8125rem]">
              <span className="text-ink-secondary">{r.resolucao}</span>
              <span className="text-ink-primary font-medium">{fmtNum(r.sessoes)} sessões</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
