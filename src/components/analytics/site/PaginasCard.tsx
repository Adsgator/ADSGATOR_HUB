'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { LinhaPaginaGA4 } from '@/lib/ga4-detalhes'
import { fmtNum, fmtPct } from '../trafego/labels'
import { fmtDuracao } from './labelsGa4'

// Quais páginas são acessadas — caminhos normalizados (sem query string; o
// fbclid que poluía o Looker não chega aqui) + tabela secundária com o
// caminho + query string bruto (útil pra rastrear link/campanha exata,
// réplica do Looker GA4-3).

const COLUNAS = ['Página', 'Visualiz.', 'Usuários', 'Novos', 'Sessões', 'Engaj.', 'Rejeição', 'Duração']

function totalDe(dados: LinhaPaginaGA4[]) {
  return dados.reduce((acc, p) => {
    const pesoTotal = acc.sessoes + p.sessoes
    const media = (a: number, b: number) => (pesoTotal > 0 ? (a * acc.sessoes + b * p.sessoes) / pesoTotal : 0)
    return {
      visualizacoes:      acc.visualizacoes + p.visualizacoes,
      usuarios:           acc.usuarios + p.usuarios,
      usuariosNovos:      acc.usuariosNovos + p.usuariosNovos,
      sessoes:            acc.sessoes + p.sessoes,
      taxaEngajamento:    media(acc.taxaEngajamento, p.taxaEngajamento),
      taxaRejeicao:       media(acc.taxaRejeicao, p.taxaRejeicao),
      duracaoMediaSessao: media(acc.duracaoMediaSessao, p.duracaoMediaSessao),
    }
  }, { visualizacoes: 0, usuarios: 0, usuariosNovos: 0, sessoes: 0, taxaEngajamento: 0, taxaRejeicao: 0, duracaoMediaSessao: 0 })
}

function Tabela({ dados, buscaPlaceholder }: { dados: LinhaPaginaGA4[]; buscaPlaceholder: string }) {
  const [busca, setBusca] = useState('')

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return dados
    return dados.filter((p) => p.pagina.toLowerCase().includes(q))
  }, [dados, busca])

  const total = useMemo(() => totalDe(filtradas), [filtradas])

  return (
    <div>
      <div className="relative mb-[0.75rem]">
        <Search className="absolute left-[0.625rem] top-1/2 -translate-y-1/2 w-[0.8125rem] h-[0.8125rem] text-ink-muted" strokeWidth={2} />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={buscaPlaceholder}
          className="w-full h-[2rem] pl-[1.75rem] pr-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-[0.8125rem] text-ink-primary placeholder:text-ink-muted focus-ring"
        />
      </div>

      <div className="overflow-x-auto max-h-[22rem] overflow-y-auto">
        <table className="w-full text-[0.8125rem]">
          <thead className="sticky top-0 bg-surface-card">
            <tr className="border-b border-surface-border">
              {COLUNAS.map((h) => (
                <th key={h} className="text-left pb-[0.5rem] pt-[0.125rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtradas.map((p, i) => (
              <tr key={`${p.pagina}-${i}`} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover/50 transition-colors">
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary font-medium max-w-[16rem] truncate" title={p.pagina}>{p.pagina}</td>
                <td className="py-[0.5rem] pr-[1rem] text-status-blue font-medium">{fmtNum(p.visualizacoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(p.usuarios)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(p.usuariosNovos)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(p.sessoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-status-green">{fmtPct(p.taxaEngajamento)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-status-orange">{fmtPct(p.taxaRejeicao)}</td>
                <td className="py-[0.5rem] text-ink-secondary">{fmtDuracao(p.duracaoMediaSessao)}</td>
              </tr>
            ))}
          </tbody>
          {filtradas.length > 0 && (
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
          )}
        </table>
        {filtradas.length === 0 && (
          <p className="text-ink-muted text-[0.8125rem] italic text-center py-[1.5rem]">Nenhuma página encontrada.</p>
        )}
      </div>
    </div>
  )
}

export function PaginasCard({ dados, dadosBrutos }: { dados: LinhaPaginaGA4[]; dadosBrutos?: LinhaPaginaGA4[] }) {
  return (
    <div className="space-y-[1.25rem]">
      <Tabela dados={dados} buscaPlaceholder="Buscar página…" />
      {dadosBrutos && dadosBrutos.length > 0 && (
        <div>
          <p className="text-ink-secondary text-[0.8125rem] font-semibold mb-[0.5rem]">
            Caminho + parâmetros (com query string)
          </p>
          <p className="text-ink-muted text-[0.6875rem] mb-[0.75rem]">
            Granularidade mais fina — útil pra ver de qual link ou campanha exata veio o acesso.
          </p>
          <Tabela dados={dadosBrutos} buscaPlaceholder="Buscar caminho + parâmetros…" />
        </div>
      )}
    </div>
  )
}
