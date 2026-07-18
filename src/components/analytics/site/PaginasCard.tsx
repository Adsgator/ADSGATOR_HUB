'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { LinhaPaginaGA4 } from '@/lib/ga4-detalhes'
import { fmtNum, fmtPct } from '../trafego/labels'
import { fmtDuracao } from './labelsGa4'

// Quais páginas são acessadas — caminhos já normalizados no servidor
// (sem query string; o fbclid que poluía o Looker não chega aqui).

export function PaginasCard({ dados }: { dados: LinhaPaginaGA4[] }) {
  const [busca, setBusca] = useState('')

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return dados
    return dados.filter((p) => p.pagina.toLowerCase().includes(q))
  }, [dados, busca])

  return (
    <div>
      <div className="relative mb-[0.75rem]">
        <Search className="absolute left-[0.625rem] top-1/2 -translate-y-1/2 w-[0.8125rem] h-[0.8125rem] text-ink-muted" strokeWidth={2} />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar página…"
          className="w-full h-[2rem] pl-[1.75rem] pr-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-[0.8125rem] text-ink-primary placeholder:text-ink-muted focus-ring"
        />
      </div>

      <div className="overflow-x-auto max-h-[22rem] overflow-y-auto">
        <table className="w-full text-[0.8125rem]">
          <thead className="sticky top-0 bg-surface-card">
            <tr className="border-b border-surface-border">
              {['Página', 'Visualiz.', 'Usuários', 'Novos', 'Sessões', 'Engaj.', 'Rejeição', 'Duração'].map((h) => (
                <th key={h} className="text-left pb-[0.5rem] pt-[0.125rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtradas.map((p) => (
              <tr key={p.pagina} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover/50 transition-colors">
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary font-medium max-w-[16rem] truncate" title={p.pagina}>{p.pagina}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(p.visualizacoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(p.usuarios)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(p.usuariosNovos)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(p.sessoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-status-green">{fmtPct(p.taxaEngajamento)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-status-orange">{fmtPct(p.taxaRejeicao)}</td>
                <td className="py-[0.5rem] text-ink-secondary">{fmtDuracao(p.duracaoMediaSessao)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtradas.length === 0 && (
          <p className="text-ink-muted text-[0.8125rem] italic text-center py-[1.5rem]">Nenhuma página encontrada.</p>
        )}
      </div>
    </div>
  )
}
