'use client'

import { MapPin } from 'lucide-react'
import type { LinhaLocalGA4 } from '@/lib/ga4-detalhes'
import { fmtNum, fmtPct } from '../trafego/labels'

// Cidade, estado e país — a seção que no Looker vivia em "erro de cota";
// aqui vem do cache da rota de detalhes.

export function GeografiaGA4Card({ dados }: { dados: LinhaLocalGA4[] }) {
  return (
    <div className="overflow-x-auto max-h-[22rem] overflow-y-auto">
      <table className="w-full text-[0.8125rem]">
        <thead className="sticky top-0 bg-surface-card">
          <tr className="border-b border-surface-border">
            {['Cidade', 'Estado', 'País', 'Sessões', 'Usuários', 'Novos', 'Engaj.'].map((h) => (
              <th key={h} className="text-left pb-[0.5rem] pt-[0.125rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((l, i) => (
            <tr key={`${l.cidade}-${l.estado}-${i}`} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover/50 transition-colors">
              <td className="py-[0.5rem] pr-[1rem]">
                <div className="flex items-center gap-[0.375rem]">
                  <MapPin className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={2} />
                  <span className="text-ink-primary font-medium truncate max-w-[10rem]">{l.cidade || '(não informado)'}</span>
                </div>
              </td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-secondary truncate max-w-[8rem]">{l.estado || '—'}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{l.pais || '—'}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.sessoes)}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.usuarios)}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.usuariosNovos)}</td>
              <td className="py-[0.5rem] text-status-green">{fmtPct(l.taxaEngajamento)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
