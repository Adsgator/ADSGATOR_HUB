'use client'

import type { DemografiaAds, MetricasAds } from '@/lib/ads-detalhes'
import { FAIXA_LABEL, GENERO_LABEL, fmtConv, fmtNum } from './labels'

// Idade e gênero em barras horizontais por cliques (formato das tabelas +
// barras do Looker), com conversões ao lado.

const COR_GENERO: Record<string, string> = {
  MALE: '#3B82F6',
  FEMALE: '#8b5cf6',
  UNDETERMINED: '#6B7280',
}

function Barras({
  linhas, rotulo, cor,
}: {
  linhas: Array<MetricasAds & { chave: string; label: string }>
  rotulo: string
  cor?: (chave: string) => string
}) {
  const maxCliques = Math.max(1, ...linhas.map((l) => l.cliques))
  return (
    <div>
      <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.625rem]">{rotulo}</p>
      <div className="space-y-[0.5rem]">
        {linhas.map((l) => (
          <div key={l.chave}>
            <div className="flex items-center justify-between text-[0.75rem] mb-[0.1875rem]">
              <span className="text-ink-secondary">{l.label}</span>
              <span className="text-ink-primary font-medium">
                {fmtNum(l.cliques)} cliques
                <span className="text-ink-muted font-normal"> · {fmtConv(l.conversoes)} conv.</span>
              </span>
            </div>
            <div className="h-[0.375rem] rounded-full bg-surface-hover overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(l.cliques / maxCliques) * 100}%`,
                  backgroundColor: cor ? cor(l.chave) : '#FFB100',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DemografiaAdsCard({ dados }: { dados: DemografiaAds }) {
  const faixas = dados.faixasEtarias.map((f) => ({ ...f, chave: f.faixa, label: FAIXA_LABEL[f.faixa] ?? f.faixa }))
  const generos = dados.generos.map((g) => ({ ...g, chave: g.genero, label: GENERO_LABEL[g.genero] ?? g.genero }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.25rem]">
      <Barras linhas={faixas} rotulo="Idade" />
      <Barras linhas={generos} rotulo="Gênero" cor={(chave) => COR_GENERO[chave] ?? '#6B7280'} />
    </div>
  )
}
