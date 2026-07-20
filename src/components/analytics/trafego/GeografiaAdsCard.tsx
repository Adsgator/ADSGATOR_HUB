'use client'

import { useMemo } from 'react'
import { MapPin } from 'lucide-react'
import type { LinhaLocalAds } from '@/lib/ads-detalhes'
import { fmtConv, fmtMoeda, fmtNum, fmtPct } from './labels'

// Cidade / Estado / País — 3 tabelas separadas (não misturar granularidade),
// réplica do Looker (GADS-4) + País (que o Looker não tinha, útil pra flagar
// clique estrangeiro anômalo). "Cidade" mostra só o que resolveu exatamente
// nesse nível — linhas mais finas (bairro/CEP) ainda não entram aqui; contam
// nos totais gerais, só não aparecem detalhadas nesta tabela (drill-down é o
// próximo incremento, ver docs/DASHBOARD_GADS_SPEC.md).

const COLUNAS = ['Impr.', 'Cliques', 'CPC médio', 'CTR', 'Conv.', 'Custo/conv.', 'Custo']

function TabelaGeo({ titulo, coluna, linhas }: { titulo: string; coluna: string; linhas: LinhaLocalAds[] }) {
  const total = useMemo(() => linhas.reduce((acc, l) => ({
    impressoes: acc.impressoes + l.impressoes, cliques: acc.cliques + l.cliques,
    custo: acc.custo + l.custo, conversoes: acc.conversoes + l.conversoes,
  }), { impressoes: 0, cliques: 0, custo: 0, conversoes: 0 }), [linhas])

  return (
    <div>
      <p className="text-ink-secondary text-[0.8125rem] font-semibold mb-[0.5rem]">{titulo}</p>
      {linhas.length === 0 ? (
        <p className="text-ink-muted text-[0.75rem] italic py-[0.75rem]">Sem dados neste nível no período.</p>
      ) : (
        <div className="overflow-x-auto max-h-[16rem] overflow-y-auto">
          <table className="w-full text-[0.8125rem]">
            <thead className="sticky top-0 bg-surface-card">
              <tr className="border-b border-surface-border">
                <th className="text-left pb-[0.5rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem]">{coluna}</th>
                {COLUNAS.map((h) => (
                  <th key={h} className="text-left pb-[0.5rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map((l, i) => {
                const ctr = l.impressoes > 0 ? (l.cliques / l.impressoes) * 100 : 0
                const cpc = l.cliques > 0 ? l.custo / l.cliques : 0
                return (
                  <tr key={`${l.local}-${i}`} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover/50 transition-colors">
                    <td className="py-[0.5rem] pr-[1rem]">
                      <div className="flex items-center gap-[0.375rem] min-w-0">
                        <MapPin className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={2} />
                        <span className="text-ink-primary font-medium truncate max-w-[12rem]">{l.local}</span>
                      </div>
                    </td>
                    <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.impressoes)}</td>
                    <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.cliques)}</td>
                    <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{l.cliques > 0 ? fmtMoeda(cpc) : '—'}</td>
                    <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtPct(ctr)}</td>
                    <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtConv(l.conversoes)}</td>
                    <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{l.conversoes > 0 ? fmtMoeda(l.custo / l.conversoes) : '—'}</td>
                    <td className="py-[0.5rem] text-status-blue font-medium">{fmtMoeda(l.custo)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-surface-border font-semibold">
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">Total geral</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.impressoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.cliques)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{total.cliques > 0 ? fmtMoeda(total.custo / total.cliques) : '—'}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{total.impressoes > 0 ? fmtPct((total.cliques / total.impressoes) * 100) : '—'}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtConv(total.conversoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{total.conversoes > 0 ? fmtMoeda(total.custo / total.conversoes) : '—'}</td>
                <td className="py-[0.5rem] text-ink-primary">{fmtMoeda(total.custo)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

export function GeografiaAdsCard({ dados }: { dados: LinhaLocalAds[] }) {
  const cidades = dados.filter((l) => l.tipo === 'City')
  const estados = dados.filter((l) => l.tipo === 'State' || l.tipo === 'Region')
  const paises  = dados.filter((l) => l.tipo === 'Country')

  return (
    <div className="space-y-[1.25rem]">
      <TabelaGeo titulo="Cidade" coluna="Cidade" linhas={cidades} />
      <TabelaGeo titulo="Estado" coluna="Estado" linhas={estados} />
      <TabelaGeo titulo="País" coluna="País" linhas={paises} />
    </div>
  )
}
