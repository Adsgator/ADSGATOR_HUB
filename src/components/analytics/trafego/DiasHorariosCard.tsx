'use client'

import { useMemo } from 'react'
import type { DiasHorariosAds } from '@/lib/ads-detalhes'
import { DIA_CURTO, fmtConv, fmtMoeda, fmtNum } from './labels'

// Dias da semana e horário do dia — réplica do Looker (GADS-6): tabelas, não
// gráfico (o gráfico de barras ficou só na versão anterior por engano —
// o Looker mostra tabela aqui, ordenada por Impressões desc, com Total geral).

interface Linha { chave: string; label: string; impressoes: number; cliques: number; conversoes: number; custo: number }

function Tabela({ titulo, coluna, linhas }: { titulo: string; coluna: string; linhas: Linha[] }) {
  const ordenadas = useMemo(
    () => [...linhas].filter((l) => l.impressoes > 0).sort((a, b) => b.impressoes - a.impressoes),
    [linhas],
  )
  const total = useMemo(() => linhas.reduce((acc, l) => ({
    impressoes: acc.impressoes + l.impressoes, cliques: acc.cliques + l.cliques,
    custo: acc.custo + l.custo, conversoes: acc.conversoes + l.conversoes,
  }), { impressoes: 0, cliques: 0, custo: 0, conversoes: 0 }), [linhas])

  return (
    <div>
      <p className="text-ink-secondary text-[0.8125rem] font-semibold mb-[0.5rem]">{titulo}</p>
      <div className="overflow-x-auto max-h-[18rem] overflow-y-auto">
        <table className="w-full text-[0.8125rem]">
          <thead className="sticky top-0 bg-surface-card">
            <tr className="border-b border-surface-border">
              {[coluna, 'Impr.', 'Cliques', 'Conv.', 'Custo'].map((h) => (
                <th key={h} className="text-left pb-[0.5rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((l) => (
              <tr key={l.chave} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover/50 transition-colors">
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary font-medium">{l.label}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.impressoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.cliques)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtConv(l.conversoes)}</td>
                <td className="py-[0.5rem] text-status-blue font-medium">{fmtMoeda(l.custo)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-surface-border font-semibold">
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">Total geral</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.impressoes)}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.cliques)}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtConv(total.conversoes)}</td>
              <td className="py-[0.5rem] text-ink-primary">{fmtMoeda(total.custo)}</td>
            </tr>
          </tfoot>
        </table>
        {ordenadas.length === 0 && (
          <p className="text-ink-muted text-[0.8125rem] italic text-center py-[1.5rem]">Sem dados no período.</p>
        )}
      </div>
    </div>
  )
}

export function DiasHorariosCard({ dados }: { dados: DiasHorariosAds }) {
  const dias: Linha[] = dados.porDiaSemana.map((d) => ({
    chave: d.dia, label: DIA_CURTO[d.dia] ?? d.dia,
    impressoes: d.impressoes, cliques: d.cliques, conversoes: d.conversoes, custo: d.custo,
  }))
  const horas: Linha[] = dados.porHora.map((h) => ({
    chave: String(h.hora), label: `${h.hora}h`,
    impressoes: h.impressoes, cliques: h.cliques, conversoes: h.conversoes, custo: h.custo,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.25rem]">
      <Tabela titulo="Dia da semana" coluna="Dia" linhas={dias} />
      <Tabela titulo="Horário do dia" coluna="Horário" linhas={horas} />
    </div>
  )
}
