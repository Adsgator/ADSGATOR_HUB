'use client'

import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { variacaoPercentual } from '@/lib/analytics-periodo'
import type { KpisAdsComparativo } from '@/lib/ads-detalhes'
import { fmtConv, fmtMoeda, fmtNum, fmtPct } from './labels'

// Tiles de KPI com delta vs período anterior — o layout de tiles do Looker
// no design system do Hub. Subida nem sempre é boa: CPC/CPA caindo é verde.

type Sentido = 'boa' | 'ruim' | 'neutra'

interface TileConfig {
  label:  string
  atual:  (k: KpisAdsComparativo) => number | null
  fmt:    (v: number) => string
  subida: Sentido
}

const TILES: TileConfig[] = [
  { label: 'Impressões',        atual: (k) => k.atual.impressoes,    fmt: fmtNum,   subida: 'boa' },
  { label: 'Cliques',           atual: (k) => k.atual.cliques,       fmt: fmtNum,   subida: 'boa' },
  { label: 'CTR',               atual: (k) => k.atual.ctr,           fmt: fmtPct,   subida: 'boa' },
  { label: 'Custo',             atual: (k) => k.atual.custo,         fmt: fmtMoeda, subida: 'neutra' },
  { label: 'CPC médio',         atual: (k) => k.atual.cpcMedio,      fmt: fmtMoeda, subida: 'ruim' },
  { label: 'Conversões',        atual: (k) => k.atual.conversoes,    fmt: fmtConv,  subida: 'boa' },
  { label: 'Custo/conv.',       atual: (k) => k.atual.cpa,           fmt: fmtMoeda, subida: 'ruim' },
  { label: 'Taxa de conversão', atual: (k) => k.atual.taxaConversao, fmt: fmtPct,   subida: 'boa' },
  {
    label: '1ª posição (parcela)',
    atual: (k) => k.atual.impressionShare.parcelaPrimeiraPosicao,
    fmt: fmtPct, subida: 'boa',
  },
  {
    label: 'Parcela de impressões',
    atual: (k) => k.atual.impressionShare.parcelaImpressao,
    fmt: fmtPct, subida: 'boa',
  },
]

function anteriorDe(tile: TileConfig, k: KpisAdsComparativo): number | null {
  // espelha o acesso do atual no período anterior
  return tile.atual({ ...k, atual: k.anterior })
}

function corDelta(delta: number, subida: Sentido): string {
  if (subida === 'neutra') return 'text-ink-muted'
  const melhorou = subida === 'boa' ? delta > 0 : delta < 0
  return melhorou ? 'text-status-green' : 'text-status-red'
}

export function KpiTilesAds({ dados }: { dados: KpisAdsComparativo }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-[0.75rem]">
      {TILES.map((tile) => {
        const atual = tile.atual(dados)
        const anterior = anteriorDe(tile, dados)
        const delta = atual !== null && anterior !== null ? variacaoPercentual(atual, anterior) : null
        return (
          <div key={tile.label} className="bg-surface-hover/60 border border-surface-border rounded-xl px-[0.875rem] py-[0.75rem]">
            <p className="text-ink-muted text-[0.625rem] uppercase tracking-wide font-semibold mb-[0.25rem]">
              {tile.label}
            </p>
            <p className="text-ink-primary text-[1.25rem] font-bold leading-none">
              {atual === null ? '—' : tile.fmt(atual)}
            </p>
            <p className="mt-[0.375rem] flex items-center gap-[0.25rem] text-[0.6875rem] font-medium">
              {delta === null ? (
                <span className="inline-flex items-center gap-[0.25rem] text-ink-muted">
                  <Minus className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                  sem comparativo
                </span>
              ) : (
                <span className={`inline-flex items-center gap-[0.125rem] ${corDelta(delta, tile.subida)}`}>
                  {delta >= 0
                    ? <ArrowUpRight className="w-[0.6875rem] h-[0.6875rem]" strokeWidth={2.25} />
                    : <ArrowDownRight className="w-[0.6875rem] h-[0.6875rem]" strokeWidth={2.25} />}
                  {Math.abs(delta).toFixed(1).replace('.', ',')}%
                  <span className="text-ink-muted font-normal ml-[0.125rem]">vs anterior</span>
                </span>
              )}
            </p>
          </div>
        )
      })}
    </div>
  )
}
