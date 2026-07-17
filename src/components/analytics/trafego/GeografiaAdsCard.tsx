'use client'

import { MapPin } from 'lucide-react'
import type { LinhaLocalAds } from '@/lib/ads-detalhes'
import { TIPO_GEO_LABEL, fmtConv, fmtMoeda, fmtNum, nomeLocal } from './labels'

// Cidade/bairro/CEP onde o usuário estava (LOCATION_OF_PRESENCE), com nomes
// resolvidos no servidor — o Looker mostrava "Métricas de Cidade e Estado".

export function GeografiaAdsCard({ dados }: { dados: LinhaLocalAds[] }) {
  return (
    <div className="overflow-x-auto max-h-[22rem] overflow-y-auto">
      <table className="w-full text-[0.8125rem]">
        <thead className="sticky top-0 bg-surface-card">
          <tr className="border-b border-surface-border">
            {['Local', 'Tipo', 'Impr.', 'Cliques', 'Custo', 'Conv.'].map((h) => (
              <th key={h} className="text-left pb-[0.5rem] pt-[0.125rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((l, i) => (
            <tr key={`${l.local}-${l.tipo}-${i}`} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover/50 transition-colors">
              <td className="py-[0.5rem] pr-[1rem]">
                <div className="flex items-center gap-[0.375rem] min-w-0">
                  <MapPin className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={2} />
                  <div className="min-w-0">
                    <p className="text-ink-primary font-medium truncate max-w-[14rem]">{nomeLocal(l.local, l.tipo)}</p>
                    {l.regiao && <p className="text-ink-muted text-[0.6875rem] truncate">{l.regiao}</p>}
                  </div>
                </div>
              </td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-muted text-[0.75rem]">{TIPO_GEO_LABEL[l.tipo] ?? l.tipo}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.impressoes)}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.cliques)}</td>
              <td className="py-[0.5rem] pr-[1rem] text-status-blue font-medium">{fmtMoeda(l.custo)}</td>
              <td className="py-[0.5rem] text-ink-secondary">{fmtConv(l.conversoes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
