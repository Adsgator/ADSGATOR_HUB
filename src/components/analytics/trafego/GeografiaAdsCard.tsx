'use client'

import { useMemo } from 'react'
import { MapPin } from 'lucide-react'
import type { LinhaLocalAds } from '@/lib/ads-detalhes'
import { fmtConv, fmtMoeda, fmtNum, fmtPct, nomeLocal } from './labels'
import { CelulaMetrica, faixaColuna } from '../shared/CelulaMetrica'

// Geografia — 5 tabelas ranqueadas: Cidade → Bairro → CEP → Estado → País.
// O Google resolve cada impressão na localização MAIS específica (cidade,
// bairro, distrito, CEP…); bairro/CEP ligam direto ao ESTADO (pulam a cidade),
// então drill-down "cidade → bairros" não é confiável — por isso tabelas
// próprias. Estado/País são AGREGADOS aqui a partir do canonical_name
// (regiao/pais em cada linha), somando TODAS as linhas antes de ranquear — o
// total bate com o KPI (validado por script read-only).

const COLUNAS = ['Impr.', 'Cliques', 'CPC médio', 'CTR', 'Conv.', 'Custo/conv.', 'Custo', 'Visitas site']

// Neighborhood + District + Municipality são todas granularidades "sub-cidade"
// (no Brasil o Google mistura os três) → entram juntas na tabela de Bairro.
const TIPOS_BAIRRO = new Set(['Neighborhood', 'District', 'Municipality'])

const porCliques = (a: LinhaLocalAds, b: LinhaLocalAds) => b.cliques - a.cliques

/** Agrega linhas por uma chave (estado ou país), somando métricas + visitas. */
function agregarPor(dados: LinhaLocalAds[], chave: (l: LinhaLocalAds) => string): LinhaLocalAds[] {
  const mapa = new Map<string, LinhaLocalAds>()
  for (const l of dados) {
    const k = chave(l).trim()
    if (!k) continue
    const cur = mapa.get(k)
    if (cur) {
      cur.impressoes += l.impressoes; cur.cliques += l.cliques; cur.custo += l.custo
      cur.conversoes += l.conversoes; cur.visitasSite += l.visitasSite
    } else {
      mapa.set(k, {
        local: k, regiao: '', pais: '', tipo: '',
        impressoes: l.impressoes, cliques: l.cliques, custo: l.custo,
        conversoes: l.conversoes, visitasSite: l.visitasSite,
      })
    }
  }
  return [...mapa.values()].sort(porCliques)
}

function TabelaGeo({ titulo, coluna, linhas }: { titulo: string; coluna: string; linhas: LinhaLocalAds[] }) {
  const total = useMemo(() => linhas.reduce((acc, l) => ({
    impressoes: acc.impressoes + l.impressoes, cliques: acc.cliques + l.cliques,
    custo: acc.custo + l.custo, conversoes: acc.conversoes + l.conversoes,
    visitasSite: acc.visitasSite + l.visitasSite,
  }), { impressoes: 0, cliques: 0, custo: 0, conversoes: 0, visitasSite: 0 }), [linhas])

  // Faixas por coluna (heatmap) sobre as linhas visíveis.
  const faixas = useMemo(() => ({
    impressoes:  faixaColuna(linhas, (l) => l.impressoes),
    cliques:     faixaColuna(linhas, (l) => l.cliques),
    cpc:         faixaColuna(linhas, (l) => (l.cliques > 0 ? l.custo / l.cliques : 0)),
    ctr:         faixaColuna(linhas, (l) => (l.impressoes > 0 ? (l.cliques / l.impressoes) * 100 : 0)),
    conversoes:  faixaColuna(linhas, (l) => l.conversoes),
    custoConv:   faixaColuna(linhas, (l) => (l.conversoes > 0 ? l.custo / l.conversoes : 0)),
    visitasSite: faixaColuna(linhas, (l) => l.visitasSite),
  }), [linhas])

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
                const custoConv = l.conversoes > 0 ? l.custo / l.conversoes : 0
                return (
                  <tr key={`${l.local}-${i}`} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover/50 transition-colors">
                    <td className="py-[0.5rem] pr-[1rem]">
                      <div className="flex items-center gap-[0.375rem] min-w-0">
                        <MapPin className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={2} />
                        <span className="text-ink-primary font-medium truncate max-w-[12rem]" title={nomeLocal(l.local, l.tipo)}>{nomeLocal(l.local, l.tipo)}</span>
                      </div>
                    </td>
                    <CelulaMetrica valor={l.impressoes} faixa={faixas.impressoes} tom="verde" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.impressoes)}</CelulaMetrica>
                    <CelulaMetrica valor={l.cliques} faixa={faixas.cliques} tom="verde" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.cliques)}</CelulaMetrica>
                    <CelulaMetrica valor={cpc} faixa={faixas.cpc} tom="azul" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{l.cliques > 0 ? fmtMoeda(cpc) : '—'}</CelulaMetrica>
                    <CelulaMetrica valor={ctr} faixa={faixas.ctr} tom="verde" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtPct(ctr)}</CelulaMetrica>
                    <CelulaMetrica valor={l.conversoes} faixa={faixas.conversoes} tom="verde" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtConv(l.conversoes)}</CelulaMetrica>
                    <CelulaMetrica valor={custoConv} faixa={faixas.custoConv} tom="azul" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{l.conversoes > 0 ? fmtMoeda(custoConv) : '—'}</CelulaMetrica>
                    <td className="py-[0.5rem] pr-[1rem] text-status-blue font-medium">{fmtMoeda(l.custo)}</td>
                    <CelulaMetrica valor={l.visitasSite} faixa={faixas.visitasSite} tom="verde" className="py-[0.5rem] text-ink-secondary">{fmtConv(l.visitasSite)}</CelulaMetrica>
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
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtMoeda(total.custo)}</td>
                <td className="py-[0.5rem] text-ink-primary">{fmtConv(total.visitasSite)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

export function GeografiaAdsCard({ dados }: { dados: LinhaLocalAds[] }) {
  const cidades = useMemo(() => dados.filter((l) => l.tipo === 'City').sort(porCliques), [dados])
  const bairros = useMemo(() => dados.filter((l) => TIPOS_BAIRRO.has(l.tipo)).sort(porCliques), [dados])
  const ceps    = useMemo(() => dados.filter((l) => l.tipo === 'Postal Code').sort(porCliques), [dados])
  const estados = useMemo(() => agregarPor(dados, (l) => l.regiao), [dados])
  const paises  = useMemo(() => agregarPor(dados, (l) => l.pais), [dados])

  return (
    <div className="space-y-[1.25rem]">
      <TabelaGeo titulo="Cidade" coluna="Cidade" linhas={cidades} />
      <TabelaGeo titulo="Bairro / distrito" coluna="Bairro" linhas={bairros} />
      <TabelaGeo titulo="CEP" coluna="CEP" linhas={ceps} />
      <TabelaGeo titulo="Estado" coluna="Estado" linhas={estados} />
      <TabelaGeo titulo="País" coluna="País" linhas={paises} />
    </div>
  )
}
