import type { Cliente, Estagio } from './types'

export interface HealthScore {
  score:  number   // 0-100
  nivel:  'critico' | 'atencao' | 'saudavel'
  label:  string
  color:  string
  dot:    string
}

/**
 * Calcula o health score de um cliente (0–100).
 *
 * Critérios:
 *  +30 — Pagamento em dia (0 dias de atraso)
 *  +25 — CPA dentro do esperado (saldo_google > 0 como proxy)
 *  +20 — Checklist > 50% completo
 *  +15 — Atualizado nos últimos 7 dias (updated_at)
 *  +10 — Status ativo/onboarding (não congelado, cancelado ou inativo)
 */
export function calcularHealthScore(
  cliente: Cliente,
  estagio?: Estagio | null,
): HealthScore {
  let score = 0

  // +30 — pagamento em dia
  if ((cliente.dias_atraso ?? 0) === 0) score += 30

  // +25 — integração google ativa (proxy de saúde de campanhas)
  if (cliente.google_ads_enabled || (cliente.saldo_google ?? 0) > 0) score += 25

  // +20 — checklist > 50%
  if (estagio?.checklist && estagio.checklist.length > 0) {
    const done  = estagio.checklist.filter((i) => i.done).length
    const total = estagio.checklist.length
    if (done / total > 0.5) score += 20
  } else if (!estagio) {
    // sem estágio ativo — dá metade dos pontos (neutro)
    score += 10
  }

  // +15 — atualizado nos últimos 7 dias
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = cliente.data_atualizacao ?? (cliente as unknown as Record<string, unknown>)['updated_at'] as string | undefined
  if (updated) {
    const diffDias = (Date.now() - new Date(updated).getTime()) / (1000 * 60 * 60 * 24)
    if (diffDias <= 7) score += 15
  }

  // +10 — status positivo
  const statusPositivo = ['ativo', 'onboarding', 'setup_trafego', 'recebido']
  if (statusPositivo.includes(cliente.status)) score += 10

  const nivel: HealthScore['nivel'] = score >= 80 ? 'saudavel' : score >= 50 ? 'atencao' : 'critico'

  const NIVEIS = {
    saudavel: { label: `${score}`, color: 'text-status-green', dot: 'bg-status-green' },
    atencao:  { label: `${score}`, color: 'text-status-orange', dot: 'bg-status-orange' },
    critico:  { label: `${score}`, color: 'text-status-red',    dot: 'bg-status-red'    },
  }

  return { score, nivel, ...NIVEIS[nivel] }
}
