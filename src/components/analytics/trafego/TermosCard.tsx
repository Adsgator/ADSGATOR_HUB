'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { LinhaTermoAds } from '@/lib/ads-detalhes'
import { fmtConv, fmtMoeda, fmtNum, fmtPct } from './labels'

// Termos de pesquisa — top por cliques com busca local (padrão do Looker:
// tabela completa pesquisável).

// Ordem de colunas replica o Looker (GADS-3), incluindo Visitas site (ação
// view_content segmentada por termo, ver docs/DASHBOARD_GADS_SPEC.md).
const COLUNAS = ['Termo de pesquisa', 'Impr.', 'Cliques', 'CPC médio', 'CTR', 'Conv.', 'Custo/conv.', 'Custo', 'Visitas site']

export function TermosCard({ dados }: { dados: LinhaTermoAds[] }) {
  const [busca, setBusca] = useState('')

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return dados
    return dados.filter((t) => t.termo.toLowerCase().includes(q))
  }, [dados, busca])

  const total = useMemo(() => dados.reduce((acc, t) => ({
    impressoes:  acc.impressoes + t.impressoes,
    cliques:     acc.cliques + t.cliques,
    custo:       acc.custo + t.custo,
    conversoes:  acc.conversoes + t.conversoes,
    visitasSite: acc.visitasSite + t.visitasSite,
  }), { impressoes: 0, cliques: 0, custo: 0, conversoes: 0, visitasSite: 0 }), [dados])

  return (
    <div>
      <div className="relative mb-[0.75rem]">
        <Search className="absolute left-[0.625rem] top-1/2 -translate-y-1/2 w-[0.8125rem] h-[0.8125rem] text-ink-muted" strokeWidth={2} />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar termo…"
          className="w-full h-[2rem] pl-[1.75rem] pr-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-[0.8125rem] text-ink-primary placeholder:text-ink-muted focus-ring"
        />
      </div>

      <div className="overflow-x-auto max-h-[22rem] overflow-y-auto">
        <table className="w-full text-[0.8125rem]">
          <thead className="sticky top-0 bg-surface-card">
            <tr className="border-b border-surface-border">
              {COLUNAS.map((h) => (
                <th key={h} className="text-left pb-[0.5rem] pt-[0.125rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((t) => {
              const ctr = t.impressoes > 0 ? (t.cliques / t.impressoes) * 100 : 0
              const cpc = t.cliques > 0 ? t.custo / t.cliques : 0
              return (
                <tr key={t.termo} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover/50 transition-colors">
                  <td className="py-[0.5rem] pr-[1rem] text-ink-primary font-medium max-w-[16rem] truncate" title={t.termo}>{t.termo}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(t.impressoes)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(t.cliques)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{t.cliques > 0 ? fmtMoeda(cpc) : '—'}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtPct(ctr)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtConv(t.conversoes)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{t.conversoes > 0 ? fmtMoeda(t.custo / t.conversoes) : '—'}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-status-blue font-medium">{fmtMoeda(t.custo)}</td>
                  <td className="py-[0.5rem] text-ink-secondary">{fmtConv(t.visitasSite)}</td>
                </tr>
              )
            })}
          </tbody>
          {filtrados.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-surface-border font-semibold">
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">Total geral</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.impressoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.cliques)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{total.cliques > 0 ? fmtMoeda(total.custo / total.cliques) : '—'}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{total.impressoes > 0 ? fmtPct((total.cliques / total.impressoes) * 100) : '—'}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtConv(total.conversoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{total.conversoes > 0 ? fmtMoeda(total.custo / total.conversoes) : '—'}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtMoeda(total.custo)}</td>
                <td className="py-[0.5rem] text-ink-primary">{fmtConv(total.visitasSite)}</td>
              </tr>
            </tfoot>
          )}
        </table>
        {filtrados.length === 0 && (
          <p className="text-ink-muted text-[0.8125rem] italic text-center py-[1.5rem]">Nenhum termo encontrado.</p>
        )}
      </div>
      <p className="text-ink-muted text-[0.6875rem] mt-[0.5rem]">
        {fmtNum(filtrados.length)} de {fmtNum(dados.length)} termos
      </p>
    </div>
  )
}
