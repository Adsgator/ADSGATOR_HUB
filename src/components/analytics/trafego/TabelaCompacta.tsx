'use client'

import { fmtNum } from './labels'

// Tabela compacta (Impressões + Cliques só) — o "bater o olho" antes de rolar
// pra tabela completa. Réplica das mini-tabelas "Top 50 Pesquisas" e
// "Resultados pelo horário" do Looker (GADS-2), ao lado do gráfico diário.
// A cor de fundo da tabela do Looker é gradiente completo por coluna; aqui é
// uma barra sutil — o gradiente fica pra rodada de refino, não é o essencial.

export interface LinhaCompacta {
  chave:      string
  label:      string
  impressoes: number
  cliques:    number
}

export function TabelaCompacta({ titulo, linhas }: { titulo: string; linhas: LinhaCompacta[] }) {
  const maxImpr = Math.max(1, ...linhas.map((l) => l.impressoes))
  return (
    <div className="bg-surface-hover/40 border border-surface-border rounded-xl p-[0.875rem]">
      <p className="text-ink-secondary text-[0.75rem] font-semibold mb-[0.625rem]">{titulo}</p>
      <div className="max-h-[15rem] overflow-y-auto">
        <table className="w-full text-[0.75rem]">
          <thead>
            <tr className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">
              <th className="text-left pb-[0.375rem] w-[1.5rem]">#</th>
              <th className="text-left pb-[0.375rem]">{titulo.includes('horário') ? 'Horário' : 'Termo'}</th>
              <th className="text-right pb-[0.375rem] pl-[0.5rem]">Impr.</th>
              <th className="text-right pb-[0.375rem] pl-[0.5rem]">Cliques</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l, i) => (
              <tr key={l.chave} className="border-t border-surface-border/50">
                <td className="py-[0.3125rem] text-ink-muted">{i + 1}.</td>
                <td className="py-[0.3125rem] pr-[0.5rem] text-ink-primary truncate max-w-[9rem]" title={l.label}>{l.label}</td>
                <td className="py-[0.3125rem] text-right relative">
                  <span
                    className="absolute inset-y-[0.125rem] right-0 rounded bg-status-red/10 -z-10"
                    style={{ width: `${(l.impressoes / maxImpr) * 100}%` }}
                  />
                  <span className="text-ink-secondary">{fmtNum(l.impressoes)}</span>
                </td>
                <td className="py-[0.3125rem] pl-[0.5rem] text-right text-status-blue font-medium">{fmtNum(l.cliques)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {linhas.length === 0 && <p className="text-ink-muted text-[0.75rem] italic py-[1rem]">Sem dados.</p>}
      </div>
    </div>
  )
}
