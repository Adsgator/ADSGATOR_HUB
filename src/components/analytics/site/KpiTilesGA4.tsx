'use client'

import { ArrowDownRight, ArrowUpRight, Minus, BarChart3, Gauge } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { variacaoPercentual } from '@/lib/analytics-periodo'
import type { KpisGA4, KpisGA4Comparativo, LinhaDispositivoGA4 } from '@/lib/ga4-detalhes'
import { fmtNum, fmtPct } from '../trafego/labels'
import { DISPOSITIVO_GA4_LABEL, fmtDuracao } from './labelsGa4'

// Painel de KPIs em 2 grupos, replicando o Looker (GA4-1): "Informações
// gerais" (números absolutos) e "Desempenho" (taxas + gráfico por
// dispositivo) — mesma estrutura do painel de KPIs do Ads.

type Sentido = 'boa' | 'ruim' | 'neutra'

interface TileConfig {
  label:  string
  valor:  (k: KpisGA4) => number
  fmt:    (v: number) => string
  subida: Sentido
}

function corDelta(delta: number, subida: Sentido): string {
  if (subida === 'neutra') return 'text-ink-muted'
  const melhorou = subida === 'boa' ? delta > 0 : delta < 0
  return melhorou ? 'text-status-green' : 'text-status-red'
}

function KpiTile({ tile, dados, dias }: { tile: TileConfig; dados: KpisGA4Comparativo; dias: number }) {
  const atual = tile.valor(dados.atual)
  const anterior = tile.valor(dados.anterior)
  const delta = variacaoPercentual(atual, anterior)
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg px-[0.875rem] py-[0.75rem]">
      <p className="text-ink-muted text-[0.625rem] uppercase tracking-wide font-semibold mb-[0.25rem]">{tile.label}</p>
      <p className="text-ink-primary text-[1.25rem] font-bold leading-none">{tile.fmt(atual)}</p>
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
            <span className="text-ink-muted font-normal ml-[0.125rem]">de {dias} dias anteriores</span>
          </span>
        )}
      </p>
    </div>
  )
}

function PainelKpis({
  titulo, icone: Icone, tiles, dados, dias, extra,
}: {
  titulo: string
  icone:  typeof Gauge
  tiles:  TileConfig[]
  dados:  KpisGA4Comparativo
  dias:   number
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
          {tiles.map((tile) => <KpiTile key={tile.label} tile={tile} dados={dados} dias={dias} />)}
        </div>
        {extra}
      </div>
    </div>
  )
}

const TILES_GERAL: TileConfig[] = [
  { label: 'Visualizações',      valor: (k) => k.visualizacoes,      fmt: fmtNum,     subida: 'boa' },
  { label: 'Novos usuários',     valor: (k) => k.usuariosNovos,      fmt: fmtNum,     subida: 'boa' },
  { label: 'Usuários ativos',    valor: (k) => k.usuariosAtivos,     fmt: fmtNum,     subida: 'boa' },
  { label: 'Sessões',            valor: (k) => k.sessoes,            fmt: fmtNum,     subida: 'boa' },
  { label: 'Duração média',      valor: (k) => k.duracaoMediaSessao, fmt: fmtDuracao, subida: 'boa' },
  { label: 'Eventos por sessão', valor: (k) => k.eventosPorSessao,   fmt: (v) => v.toFixed(2).replace('.', ','), subida: 'boa' },
  { label: 'Rolaram até o fim',  valor: (k) => k.usuariosScrollFim,  fmt: fmtNum,     subida: 'boa' },
]

const TILES_DESEMPENHO: TileConfig[] = [
  { label: 'Taxa de engajamento', valor: (k) => k.taxaEngajamento, fmt: fmtPct, subida: 'boa' },
  { label: 'Taxa de rejeição',    valor: (k) => k.taxaRejeicao,    fmt: fmtPct, subida: 'ruim' },
]

const NOME_METRICA_DISPOSITIVO: Record<string, string> = {
  visualizacoes: 'Visualizações', usuariosNovos: 'Novos usuários', sessoes: 'Sessões',
}

function GraficoDispositivo({ dispositivos }: { dispositivos: LinhaDispositivoGA4[] }) {
  const dados = dispositivos.map((d) => ({
    nome: DISPOSITIVO_GA4_LABEL[d.dispositivo.toLowerCase()] ?? d.dispositivo,
    visualizacoes: d.visualizacoes,
    usuariosNovos: d.usuariosNovos,
    sessoes: d.sessoes,
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
              formatter={(v: unknown, nome: unknown) => [fmtNum(Number(v)), NOME_METRICA_DISPOSITIVO[String(nome)] ?? String(nome)] as [string, string]}
            />
            <Legend formatter={(v: string) => NOME_METRICA_DISPOSITIVO[v] ?? v} wrapperStyle={{ fontSize: '0.6875rem' }} />
            <Bar dataKey="visualizacoes" fill="#3B82F6" radius={[0, 3, 3, 0]} />
            <Bar dataKey="usuariosNovos" fill="#8b5cf6" radius={[0, 3, 3, 0]} />
            <Bar dataKey="sessoes" fill="#f59e0b" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function KpiTilesGA4({ dados, dispositivos, dias }: { dados: KpisGA4Comparativo; dispositivos?: LinhaDispositivoGA4[]; dias: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[0.875rem]">
      <PainelKpis titulo="Informações gerais" icone={BarChart3} tiles={TILES_GERAL} dados={dados} dias={dias} />
      <PainelKpis
        titulo="Desempenho" icone={Gauge} tiles={TILES_DESEMPENHO} dados={dados} dias={dias}
        extra={dispositivos && dispositivos.length > 0 ? <GraficoDispositivo dispositivos={dispositivos} /> : undefined}
      />
    </div>
  )
}
