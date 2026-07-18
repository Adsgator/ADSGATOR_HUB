'use client'

import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { variacaoPercentual } from '@/lib/analytics-periodo'
import type { KpisGA4, KpisGA4Comparativo } from '@/lib/ga4-detalhes'
import { fmtNum, fmtPct } from '../trafego/labels'
import { fmtDuracao } from './labelsGa4'

// Tiles do dashboard Site — os 8 KPIs do Looker (+ usuários ativos), com
// delta vs período anterior. Rejeição subindo é vermelho.

type Sentido = 'boa' | 'ruim' | 'neutra'

interface TileConfig {
  label:  string
  valor:  (k: KpisGA4) => number
  fmt:    (v: number) => string
  subida: Sentido
}

const TILES: TileConfig[] = [
  { label: 'Visualizações',        valor: (k) => k.visualizacoes,      fmt: fmtNum,     subida: 'boa' },
  { label: 'Novos usuários',       valor: (k) => k.usuariosNovos,      fmt: fmtNum,     subida: 'boa' },
  { label: 'Usuários ativos',      valor: (k) => k.usuariosAtivos,     fmt: fmtNum,     subida: 'boa' },
  { label: 'Sessões',              valor: (k) => k.sessoes,            fmt: fmtNum,     subida: 'boa' },
  { label: 'Duração média',        valor: (k) => k.duracaoMediaSessao, fmt: fmtDuracao, subida: 'boa' },
  { label: 'Eventos por sessão',   valor: (k) => k.eventosPorSessao,   fmt: (v) => v.toFixed(2).replace('.', ','), subida: 'boa' },
  { label: 'Rolaram até o fim',    valor: (k) => k.usuariosScrollFim,  fmt: fmtNum,     subida: 'boa' },
  { label: 'Taxa de engajamento',  valor: (k) => k.taxaEngajamento,    fmt: fmtPct,     subida: 'boa' },
  { label: 'Taxa de rejeição',     valor: (k) => k.taxaRejeicao,       fmt: fmtPct,     subida: 'ruim' },
]

function corDelta(delta: number, subida: Sentido): string {
  if (subida === 'neutra') return 'text-ink-muted'
  const melhorou = subida === 'boa' ? delta > 0 : delta < 0
  return melhorou ? 'text-status-green' : 'text-status-red'
}

export function KpiTilesGA4({ dados }: { dados: KpisGA4Comparativo }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-[0.75rem]">
      {TILES.map((tile) => {
        const atual = tile.valor(dados.atual)
        const anterior = tile.valor(dados.anterior)
        const delta = variacaoPercentual(atual, anterior)
        return (
          <div key={tile.label} className="bg-surface-hover/60 border border-surface-border rounded-xl px-[0.875rem] py-[0.75rem]">
            <p className="text-ink-muted text-[0.625rem] uppercase tracking-wide font-semibold mb-[0.25rem]">
              {tile.label}
            </p>
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
