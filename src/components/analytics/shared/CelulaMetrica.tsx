'use client'

import type { CSSProperties, ReactNode } from 'react'

// ─── Heatmap de coluna (Ads + Site) — réplica do gradiente do Looker ─────────
// O Looker pinta cada coluna numérica com um gradiente por magnitude. Aqui cada
// coluna usa UMA hue (nunca arco-íris): a cor é a hue em alpha crescente
// (0→ALPHA_MAX) composta SOBRE a superfície do card — vira uma ramp sequencial
// light→dark que funciona em light e dark sem ramp separada. O texto continua
// sempre em token de ink (contraste preservado; alpha teto baixo o garante).
// Tons: verde/azul pra métricas "boas" (volume, engajamento); vermelho pra
// "ruim-alto" (rejeição). Seguindo o skill dataviz (sequencial = 1 hue).

export type TomHeatmap = 'verde' | 'azul' | 'vermelho'

// Hues = tokens de status do design system (status-green/blue/red).
const HUE_RGB: Record<TomHeatmap, string> = {
  verde:    '34, 197, 94',   // #22c55e
  azul:     '59, 130, 246',  // #3b82f6
  vermelho: '239, 68, 68',   // #ef4444
}

const ALPHA_MAX = 0.28

/** Fundo sequencial da célula; undefined quando não há tint (sem variação ou
 *  magnitude ~0), pra não pintar a coluna inteira à toa. */
export function corHeatmap(valor: number, min: number, max: number, tom: TomHeatmap): string | undefined {
  if (!Number.isFinite(valor) || max <= min) return undefined
  const t = Math.max(0, Math.min(1, (valor - min) / (max - min)))
  const alpha = t * ALPHA_MAX
  if (alpha < 0.012) return undefined
  return `rgba(${HUE_RGB[tom]}, ${alpha.toFixed(3)})`
}

export interface FaixaColuna { min: number; max: number }

/** min/max de uma coluna sobre as linhas visíveis (base da normalização). */
export function faixaColuna<T>(linhas: T[], seletor: (l: T) => number): FaixaColuna {
  let min = Infinity, max = -Infinity
  for (const l of linhas) {
    const v = seletor(l)
    if (!Number.isFinite(v)) continue
    if (v < min) min = v
    if (v > max) max = v
  }
  return { min: min === Infinity ? 0 : min, max: max === -Infinity ? 0 : max }
}

interface CelulaMetricaProps {
  valor:      number
  faixa:      FaixaColuna
  tom?:       TomHeatmap
  children:   ReactNode
  className?: string
  style?:     CSSProperties
  title?:     string
}

/** <td> com fundo de heatmap por magnitude. O conteúdo (texto) vem em ink. */
export function CelulaMetrica({ valor, faixa, tom = 'verde', children, className, style, title }: CelulaMetricaProps) {
  const bg = corHeatmap(valor, faixa.min, faixa.max, tom)
  return (
    <td className={className} title={title} style={{ ...style, ...(bg ? { backgroundColor: bg } : null) }}>
      {children}
    </td>
  )
}
