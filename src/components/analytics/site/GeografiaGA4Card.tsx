'use client'

import { useMemo } from 'react'
import { MapPin } from 'lucide-react'
import type { GeografiaGA4, LinhaGeoGA4 } from '@/lib/ga4-detalhes'
import { fmtNum, fmtPct } from '../trafego/labels'
import { fmtDuracao } from './labelsGa4'

// Cidade / Estado / País — 3 tabelas separadas (não misturar granularidade,
// mesma decisão do dashboard de Ads). Cada dimensão é uma agregação
// independente (não é a mesma população cortada 3 vezes).

const COLUNAS = ['Visualiz.', 'Usuários', 'Novos', 'Sessões', 'Engaj.', 'Rejeição', 'Duração']

function TabelaGeo({ titulo, coluna, linhas }: { titulo: string; coluna: string; linhas: LinhaGeoGA4[] }) {
  const total = useMemo(() => linhas.reduce((acc, l) => {
    const pesoTotal = acc.sessoes + l.sessoes
    const media = (a: number, b: number) => (pesoTotal > 0 ? (a * acc.sessoes + b * l.sessoes) / pesoTotal : 0)
    return {
      visualizacoes:      acc.visualizacoes + l.visualizacoes,
      usuarios:           acc.usuarios + l.usuarios,
      usuariosNovos:      acc.usuariosNovos + l.usuariosNovos,
      sessoes:            acc.sessoes + l.sessoes,
      taxaEngajamento:    media(acc.taxaEngajamento, l.taxaEngajamento),
      taxaRejeicao:       media(acc.taxaRejeicao, l.taxaRejeicao),
      duracaoMediaSessao: media(acc.duracaoMediaSessao, l.duracaoMediaSessao),
    }
  }, { visualizacoes: 0, usuarios: 0, usuariosNovos: 0, sessoes: 0, taxaEngajamento: 0, taxaRejeicao: 0, duracaoMediaSessao: 0 }), [linhas])

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
              {linhas.map((l, i) => (
                <tr key={`${l.local}-${i}`} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover/50 transition-colors">
                  <td className="py-[0.5rem] pr-[1rem]">
                    <div className="flex items-center gap-[0.375rem] min-w-0">
                      <MapPin className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={2} />
                      <span className="text-ink-primary font-medium truncate max-w-[12rem]">{l.local}</span>
                    </div>
                  </td>
                  <td className="py-[0.5rem] pr-[1rem] text-status-blue font-medium">{fmtNum(l.visualizacoes)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.usuarios)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.usuariosNovos)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.sessoes)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-status-green">{fmtPct(l.taxaEngajamento)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-status-orange">{fmtPct(l.taxaRejeicao)}</td>
                  <td className="py-[0.5rem] text-ink-secondary">{fmtDuracao(l.duracaoMediaSessao)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-surface-border font-semibold">
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">Total geral</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.visualizacoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.usuarios)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.usuariosNovos)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.sessoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtPct(total.taxaEngajamento)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtPct(total.taxaRejeicao)}</td>
                <td className="py-[0.5rem] text-ink-primary">{fmtDuracao(total.duracaoMediaSessao)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

export function GeografiaGA4Card({ dados }: { dados: GeografiaGA4 }) {
  return (
    <div className="space-y-[1.25rem]">
      <TabelaGeo titulo="Cidade" coluna="Cidade" linhas={dados.cidades} />
      <TabelaGeo titulo="Estado" coluna="Estado" linhas={dados.estados} />
      <TabelaGeo titulo="País" coluna="País" linhas={dados.paises} />
    </div>
  )
}
