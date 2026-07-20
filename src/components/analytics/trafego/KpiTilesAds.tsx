'use client'

import { ArrowDownRight, ArrowUpRight, Minus, Megaphone, Gauge, Percent } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { variacaoPercentual } from '@/lib/analytics-periodo'
import type { KpisAdsComparativo, LinhaDispositivoAds } from '@/lib/ads-detalhes'
import { DISPOSITIVO_LABEL, fmtConv, fmtMoeda, fmtNum, fmtPct } from './labels'

// Painel de KPIs em 3 grupos, replicando o Looker (GADS-1): "Google Ads
// interações" (números absolutos), "Desempenho" (visitas site + 1ª posição +
// gráfico por dispositivo) e "Google Ads %" (taxas). Cada tile com delta vs
// período anterior — subida nem sempre é boa: CPC/CPA caindo é verde.

type Sentido = 'boa' | 'ruim' | 'neutra'

interface TileConfig {
  label:  string
  atual:  (k: KpisAdsComparativo) => number | null
  fmt:    (v: number) => string
  subida: Sentido
}

function anteriorDe(tile: TileConfig, k: KpisAdsComparativo): number | null {
  return tile.atual({ ...k, atual: k.anterior })
}

function corDelta(delta: number, subida: Sentido): string {
  if (subida === 'neutra') return 'text-ink-muted'
  const melhorou = subida === 'boa' ? delta > 0 : delta < 0
  return melhorou ? 'text-status-green' : 'text-status-red'
}

function KpiTile({ tile, dados }: { tile: TileConfig; dados: KpisAdsComparativo }) {
  const atual = tile.atual(dados)
  const anterior = anteriorDe(tile, dados)
  const delta = atual !== null && anterior !== null ? variacaoPercentual(atual, anterior) : null
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg px-[0.875rem] py-[0.75rem]">
      <p className="text-ink-muted text-[0.625rem] uppercase tracking-wide font-semibold mb-[0.25rem]">{tile.label}</p>
      <p className="text-ink-primary text-[1.25rem] font-bold leading-none">{atual === null ? '—' : tile.fmt(atual)}</p>
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
            <span className="text-ink-muted font-normal ml-[0.125rem]">vs período anterior</span>
          </span>
        )}
      </p>
    </div>
  )
}

function PainelKpis({
  titulo, icone: Icone, tiles, dados, extra,
}: {
  titulo: string
  icone:  typeof Megaphone
  tiles:  TileConfig[]
  dados:  KpisAdsComparativo
  extra?: React.ReactNode
}) {
  return (
    <div className="bg-surface-hover/40 border border-surface-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-[0.5rem] px-[0.875rem] py-[0.625rem] border-b border-surface-border bg-surface-hover/60">
        <Icone className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={2} />
        <p className="text-ink-primary text-[0.8125rem] font-semibold">{titulo}</p>
      </div>
      <div className="p-[0.875rem] space-y-[0.75rem]">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-[0.625rem]">
          {tiles.map((tile) => <KpiTile key={tile.label} tile={tile} dados={dados} />)}
        </div>
        {extra}
      </div>
    </div>
  )
}

const TILES_INTERACOES: TileConfig[] = [
  { label: 'Impressões',  atual: (k) => k.atual.impressoes, fmt: fmtNum,   subida: 'boa' },
  { label: 'Cliques',     atual: (k) => k.atual.cliques,    fmt: fmtNum,   subida: 'boa' },
  { label: 'CPC médio',   atual: (k) => k.atual.cpcMedio,   fmt: fmtMoeda, subida: 'ruim' },
  { label: 'Conversões',  atual: (k) => k.atual.conversoes, fmt: fmtConv,  subida: 'boa' },
  { label: 'Custo/conv.', atual: (k) => k.atual.cpa,        fmt: fmtMoeda, subida: 'ruim' },
  { label: 'Custo',       atual: (k) => k.atual.custo,      fmt: fmtMoeda, subida: 'neutra' },
]

const TILES_DESEMPENHO: TileConfig[] = [
  { label: 'Visitas no site', atual: (k) => k.atual.visitasSite, fmt: fmtConv, subida: 'boa' },
  {
    label: 'Impressões 1ª posição',
    atual: (k) => k.atual.impressionShare.parcelaPrimeiraPosicao,
    fmt: fmtPct, subida: 'boa',
  },
]

const TILES_PCT: TileConfig[] = [
  {
    label: 'Cliques por conversão',
    atual: (k) => (k.atual.conversoes > 0 ? k.atual.cliques / k.atual.conversoes : null),
    fmt: (v) => v.toFixed(1).replace('.', ','),
    subida: 'ruim',
  },
  { label: 'Taxa de conversão', atual: (k) => k.atual.taxaConversao, fmt: fmtPct, subida: 'boa' },
  { label: 'CTR',                atual: (k) => k.atual.ctr,           fmt: fmtPct, subida: 'boa' },
]

function GraficoDispositivo({ dispositivos }: { dispositivos: LinhaDispositivoAds[] }) {
  const dados = dispositivos.map((d) => ({
    nome: DISPOSITIVO_LABEL[d.dispositivo] ?? d.dispositivo,
    cliques: d.cliques,
    conversoes: d.conversoes,
  }))
  return (
    <div>
      <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.5rem]">Por dispositivo</p>
      <div className="h-[8rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="nome" tick={{ fontSize: 10, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} width={64} />
            <Tooltip
              cursor={{ fill: 'var(--surface-hover)' }}
              contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
              formatter={(v: unknown, nome: unknown) => [fmtNum(Number(v)), nome === 'cliques' ? 'Cliques' : 'Conversões'] as [string, string]}
            />
            <Legend formatter={(v: string) => (v === 'cliques' ? 'Cliques' : 'Conversões')} wrapperStyle={{ fontSize: '0.6875rem' }} />
            <Bar dataKey="cliques" fill="#3B82F6" radius={[0, 3, 3, 0]} />
            <Bar dataKey="conversoes" fill="#f59e0b" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function KpiTilesAds({ dados, dispositivos }: { dados: KpisAdsComparativo; dispositivos?: LinhaDispositivoAds[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[0.875rem]">
      <div className="space-y-[0.875rem]">
        <PainelKpis titulo="Google Ads interações" icone={Megaphone} tiles={TILES_INTERACOES} dados={dados} />
        <PainelKpis titulo="Google Ads %" icone={Percent} tiles={TILES_PCT} dados={dados} />
      </div>
      <PainelKpis
        titulo="Desempenho" icone={Gauge} tiles={TILES_DESEMPENHO} dados={dados}
        extra={dispositivos && dispositivos.length > 0 ? <GraficoDispositivo dispositivos={dispositivos} /> : undefined}
      />
    </div>
  )
}
