// ─── PERÍODO E COMPARATIVO — helpers puros do Analytics 2.0 ──────────────────
// Compartilhados pelas camadas de dados Ads (ads-detalhes.ts) e GA4
// (ga4-detalhes.ts) e pela UI (cálculo de delta). Sem dependência de SDK —
// importável no client.

export interface Periodo {
  inicio: string // YYYY-MM-DD
  fim:    string // YYYY-MM-DD
}

const RE_DATA = /^\d{4}-\d{2}-\d{2}$/
const DIA_MS = 86_400_000

export function validarPeriodo(p: Periodo): void {
  if (!RE_DATA.test(p.inicio) || !RE_DATA.test(p.fim)) {
    throw new Error(`Período inválido: "${p.inicio}"–"${p.fim}" (esperado YYYY-MM-DD)`)
  }
  if (p.fim < p.inicio) throw new Error(`Período inválido: fim ${p.fim} antes do início ${p.inicio}`)
}

function diaUtc(data: string): number {
  const [ano, mes, dia] = data.split('-').map(Number)
  return Date.UTC(ano, mes - 1, dia)
}

function formatarDia(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

/** Período imediatamente anterior com a mesma duração (para o comparativo). */
export function periodoAnterior(p: Periodo): Periodo {
  validarPeriodo(p)
  const dias = (diaUtc(p.fim) - diaUtc(p.inicio)) / DIA_MS + 1
  const fim = diaUtc(p.inicio) - DIA_MS
  return { inicio: formatarDia(fim - (dias - 1) * DIA_MS), fim: formatarDia(fim) }
}

/** Variação % entre períodos; null quando não há base de comparação. */
export function variacaoPercentual(atual: number, anterior: number): number | null {
  if (!anterior) return null
  return Math.round(((atual - anterior) / anterior) * 10000) / 100
}
