'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { LinhaTermoAds } from '@/lib/ads-detalhes'
import { fmtConv, fmtMoeda, fmtNum, fmtPct } from './labels'
import { CelulaMetrica, faixaColuna } from '../shared/CelulaMetrica'
import { useOrdenacao, ThOrdenavel, type Acessadores } from '../shared/ordenacao'

// Termos de pesquisa — top por cliques com busca local (padrão do Looker:
// tabela completa pesquisável).

// Ordem de colunas replica o Looker (GADS-3), incluindo Visitas site (ação
// view_content segmentada por termo, ver docs/DASHBOARD_GADS_SPEC.md).
const COLUNAS: Array<{ label: string; chave: string }> = [
  { label: 'Termo de pesquisa', chave: 'termo' },
  { label: 'Impr.', chave: 'impressoes' },
  { label: 'Cliques', chave: 'cliques' },
  { label: 'CPC médio', chave: 'cpc' },
  { label: 'CTR', chave: 'ctr' },
  { label: 'Conv.', chave: 'conversoes' },
  { label: 'Custo/conv.', chave: 'custoConv' },
  { label: 'Custo', chave: 'custo' },
  { label: 'Visitas site', chave: 'visitasSite' },
]

const ACESSADORES: Acessadores<LinhaTermoAds> = {
  termo:       (t) => t.termo,
  impressoes:  (t) => t.impressoes,
  cliques:     (t) => t.cliques,
  cpc:         (t) => (t.cliques > 0 ? t.custo / t.cliques : 0),
  ctr:         (t) => (t.impressoes > 0 ? (t.cliques / t.impressoes) * 100 : 0),
  conversoes:  (t) => t.conversoes,
  custoConv:   (t) => (t.conversoes > 0 ? t.custo / t.conversoes : 0),
  custo:       (t) => t.custo,
  visitasSite: (t) => t.visitasSite,
}

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

  // Faixas (min/max) por coluna, sobre as linhas visíveis — base do heatmap.
  const faixas = useMemo(() => ({
    impressoes:  faixaColuna(filtrados, (t) => t.impressoes),
    cliques:     faixaColuna(filtrados, (t) => t.cliques),
    cpc:         faixaColuna(filtrados, (t) => (t.cliques > 0 ? t.custo / t.cliques : 0)),
    ctr:         faixaColuna(filtrados, (t) => (t.impressoes > 0 ? (t.cliques / t.impressoes) * 100 : 0)),
    conversoes:  faixaColuna(filtrados, (t) => t.conversoes),
    custoConv:   faixaColuna(filtrados, (t) => (t.conversoes > 0 ? t.custo / t.conversoes : 0)),
    visitasSite: faixaColuna(filtrados, (t) => t.visitasSite),
  }), [filtrados])

  const { ordenadas, estado, alternar } = useOrdenacao(filtrados, ACESSADORES)

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
              {COLUNAS.map((c) => (
                <ThOrdenavel key={c.chave} label={c.label} chave={c.chave} estado={estado} alternar={alternar} className="pt-[0.125rem]" />
              ))}
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((t) => {
              const ctr = t.impressoes > 0 ? (t.cliques / t.impressoes) * 100 : 0
              const cpc = t.cliques > 0 ? t.custo / t.cliques : 0
              const custoConv = t.conversoes > 0 ? t.custo / t.conversoes : 0
              return (
                <tr key={t.termo} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover/50 transition-colors">
                  <td className="py-[0.5rem] pr-[1rem] text-ink-primary font-medium max-w-[16rem] truncate" title={t.termo}>{t.termo}</td>
                  <CelulaMetrica valor={t.impressoes} faixa={faixas.impressoes} tom="verde" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(t.impressoes)}</CelulaMetrica>
                  <CelulaMetrica valor={t.cliques} faixa={faixas.cliques} tom="verde" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(t.cliques)}</CelulaMetrica>
                  <CelulaMetrica valor={cpc} faixa={faixas.cpc} tom="azul" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{t.cliques > 0 ? fmtMoeda(cpc) : '—'}</CelulaMetrica>
                  <CelulaMetrica valor={ctr} faixa={faixas.ctr} tom="verde" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtPct(ctr)}</CelulaMetrica>
                  <CelulaMetrica valor={t.conversoes} faixa={faixas.conversoes} tom="verde" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtConv(t.conversoes)}</CelulaMetrica>
                  <CelulaMetrica valor={custoConv} faixa={faixas.custoConv} tom="azul" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{t.conversoes > 0 ? fmtMoeda(custoConv) : '—'}</CelulaMetrica>
                  <td className="py-[0.5rem] pr-[1rem] text-status-blue font-medium">{fmtMoeda(t.custo)}</td>
                  <CelulaMetrica valor={t.visitasSite} faixa={faixas.visitasSite} tom="verde" className="py-[0.5rem] text-ink-secondary">{fmtConv(t.visitasSite)}</CelulaMetrica>
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
