'use client'

import { useMemo } from 'react'
import type { DemografiaAds, MetricasAds } from '@/lib/ads-detalhes'
import { FAIXA_LABEL, GENERO_LABEL, fmtConv, fmtMoeda, fmtNum } from './labels'
import { MetricaBarraUnica } from './MetricaBarraUnica'
import { CelulaMetrica, faixaColuna } from '../shared/CelulaMetrica'

// Idade e gênero — réplica do Looker (GADS-5): tabela completa + 4 gráficos
// de barra SEPARADOS (Impressões, Cliques, Conversões, Custo), não um gráfico
// com várias métricas juntas — já é single-metric, não precisa de correção
// de eixo, só reorganizar em small multiples.

function ordenarPorImpressoes<T extends MetricasAds>(linhas: T[]): T[] {
  return [...linhas].sort((a, b) => b.impressoes - a.impressoes)
}

function Bloco({
  titulo, linhas,
}: {
  titulo: string
  linhas: Array<MetricasAds & { chave: string; label: string }>
}) {
  const ordenadas = useMemo(() => ordenarPorImpressoes(linhas), [linhas])
  const total = useMemo(() => linhas.reduce((acc, l) => ({
    impressoes: acc.impressoes + l.impressoes, cliques: acc.cliques + l.cliques,
    custo: acc.custo + l.custo, conversoes: acc.conversoes + l.conversoes,
  }), { impressoes: 0, cliques: 0, custo: 0, conversoes: 0 }), [linhas])
  // Faixas por coluna (heatmap) sobre as linhas visíveis.
  const faixasCol = useMemo(() => ({
    impressoes: faixaColuna(ordenadas, (l) => l.impressoes),
    cliques:    faixaColuna(ordenadas, (l) => l.cliques),
    conversoes: faixaColuna(ordenadas, (l) => l.conversoes),
  }), [ordenadas])

  return (
    <div>
      <p className="text-ink-secondary text-[0.8125rem] font-semibold mb-[0.5rem]">{titulo}</p>
      <div className="overflow-x-auto mb-[1rem]">
        <table className="w-full text-[0.8125rem]">
          <thead>
            <tr className="border-b border-surface-border">
              {[titulo, 'Impr.', 'Cliques', 'Conv.', 'Custo'].map((h) => (
                <th key={h} className="text-left pb-[0.375rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[0.75rem] last:pr-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((l) => (
              <tr key={l.chave} className="border-b border-surface-border/60 last:border-0">
                <td className="py-[0.375rem] pr-[0.75rem] text-ink-primary font-medium">{l.label}</td>
                <CelulaMetrica valor={l.impressoes} faixa={faixasCol.impressoes} tom="verde" className="py-[0.375rem] pr-[0.75rem] text-ink-secondary">{fmtNum(l.impressoes)}</CelulaMetrica>
                <CelulaMetrica valor={l.cliques} faixa={faixasCol.cliques} tom="verde" className="py-[0.375rem] pr-[0.75rem] text-ink-secondary">{fmtNum(l.cliques)}</CelulaMetrica>
                <CelulaMetrica valor={l.conversoes} faixa={faixasCol.conversoes} tom="verde" className="py-[0.375rem] pr-[0.75rem] text-ink-secondary">{fmtConv(l.conversoes)}</CelulaMetrica>
                <td className="py-[0.375rem] text-status-blue font-medium">{fmtMoeda(l.custo)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-surface-border font-semibold">
              <td className="py-[0.375rem] pr-[0.75rem] text-ink-primary">Total geral</td>
              <td className="py-[0.375rem] pr-[0.75rem] text-ink-primary">{fmtNum(total.impressoes)}</td>
              <td className="py-[0.375rem] pr-[0.75rem] text-ink-primary">{fmtNum(total.cliques)}</td>
              <td className="py-[0.375rem] pr-[0.75rem] text-ink-primary">{fmtConv(total.conversoes)}</td>
              <td className="py-[0.375rem] text-ink-primary">{fmtMoeda(total.custo)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-[0.75rem]">
        <MetricaBarraUnica titulo="Impressões" cor="#ef4444" formatter={fmtNum}
          linhas={ordenadas.map((l) => ({ chave: l.chave, label: l.label, valor: l.impressoes }))} />
        <MetricaBarraUnica titulo="Cliques" cor="#3B82F6" formatter={fmtNum}
          linhas={ordenadas.map((l) => ({ chave: l.chave, label: l.label, valor: l.cliques }))} />
        <MetricaBarraUnica titulo="Conversões" cor="#f59e0b" formatter={fmtConv}
          linhas={ordenadas.map((l) => ({ chave: l.chave, label: l.label, valor: l.conversoes }))} />
        <MetricaBarraUnica titulo="Custo" cor="#22c55e" formatter={fmtMoeda}
          linhas={ordenadas.map((l) => ({ chave: l.chave, label: l.label, valor: l.custo }))} />
      </div>
    </div>
  )
}

export function DemografiaAdsCard({ dados }: { dados: DemografiaAds }) {
  const faixas = dados.faixasEtarias.map((f) => ({ ...f, chave: f.faixa, label: FAIXA_LABEL[f.faixa] ?? f.faixa }))
  const generos = dados.generos.map((g) => ({ ...g, chave: g.genero, label: GENERO_LABEL[g.genero] ?? g.genero }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem]">
      <Bloco titulo="Idade" linhas={faixas} />
      <Bloco titulo="Gênero" linhas={generos} />
    </div>
  )
}
