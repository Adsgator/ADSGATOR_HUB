import type { SupabaseClient } from '@supabase/supabase-js'
import type { Cliente, Estagio } from './types'

export interface HealthScore {
  score:  number   // 0-100
  nivel:  'critico' | 'atencao' | 'saudavel'
  label:  string
  color:  string
  dot:    string
}

/**
 * Regras editáveis do health score (Configurações → Operacional).
 * Pesos de cada critério + limiares de nível. Editáveis pela tela; o código usa
 * os defaults abaixo como fallback (configuracoes_operacional.health_regras).
 */
export interface HealthRegras {
  peso_pagamento:  number  // pagamento em dia
  peso_google:     number  // integração Google ativa (proxy de campanhas)
  peso_checklist:  number  // checklist > 50%
  peso_atualizado: number  // atualizado nos últimos 7 dias
  peso_status:     number  // status positivo
  nivel_saudavel:  number  // score >= → saudável
  nivel_atencao:   number  // score >= → atenção (abaixo → crítico)
}

export const HEALTH_REGRAS_PADRAO: HealthRegras = {
  peso_pagamento:  30,
  peso_google:     25,
  peso_checklist:  20,
  peso_atualizado: 15,
  peso_status:     10,
  nivel_saudavel:  80,
  nivel_atencao:   50,
}

/** Carrega as regras editáveis, com fallback nos defaults (tolerante a falhas). */
export async function carregarHealthRegras(db: SupabaseClient): Promise<HealthRegras> {
  try {
    const { data } = await db
      .from('configuracoes_operacional')
      .select('health_regras')
      .eq('agencia_id', 'adsgator-main')
      .maybeSingle()
    const cfg = (data?.health_regras ?? {}) as Partial<HealthRegras>
    const num = (v: unknown, def: number) => (Number.isFinite(Number(v)) ? Number(v) : def)
    return {
      peso_pagamento:  num(cfg.peso_pagamento,  HEALTH_REGRAS_PADRAO.peso_pagamento),
      peso_google:     num(cfg.peso_google,     HEALTH_REGRAS_PADRAO.peso_google),
      peso_checklist:  num(cfg.peso_checklist,  HEALTH_REGRAS_PADRAO.peso_checklist),
      peso_atualizado: num(cfg.peso_atualizado, HEALTH_REGRAS_PADRAO.peso_atualizado),
      peso_status:     num(cfg.peso_status,     HEALTH_REGRAS_PADRAO.peso_status),
      nivel_saudavel:  num(cfg.nivel_saudavel,  HEALTH_REGRAS_PADRAO.nivel_saudavel),
      nivel_atencao:   num(cfg.nivel_atencao,   HEALTH_REGRAS_PADRAO.nivel_atencao),
    }
  } catch {
    return { ...HEALTH_REGRAS_PADRAO }
  }
}

/**
 * Calcula o health score de um cliente (0–100).
 *
 * Critérios (pesos editáveis via HealthRegras):
 *  pagamento  — Pagamento em dia (0 dias de atraso)
 *  google     — Integração Google ativa (saldo_google > 0 como proxy)
 *  checklist  — Checklist > 50% completo
 *  atualizado — Atualizado nos últimos 7 dias (updated_at)
 *  status     — Status ativo/onboarding (não congelado, cancelado ou inativo)
 */
export function calcularHealthScore(
  cliente: Cliente,
  estagio?: Estagio | null,
  regras: HealthRegras = HEALTH_REGRAS_PADRAO,
): HealthScore {
  let score = 0

  // pagamento em dia
  if ((cliente.dias_atraso ?? 0) === 0) score += regras.peso_pagamento

  // integração google ativa (proxy de saúde de campanhas)
  if (cliente.google_ads_enabled || (cliente.saldo_google ?? 0) > 0) score += regras.peso_google

  // checklist > 50%
  if (estagio?.checklist && estagio.checklist.length > 0) {
    const done  = estagio.checklist.filter((i) => i.done).length
    const total = estagio.checklist.length
    if (done / total > 0.5) score += regras.peso_checklist
  } else if (!estagio) {
    // sem estágio ativo — dá metade dos pontos do checklist (neutro)
    score += Math.round(regras.peso_checklist / 2)
  }

  // atualizado nos últimos 7 dias
  const updated = cliente.data_atualizacao ?? (cliente as unknown as Record<string, unknown>)['updated_at'] as string | undefined
  if (updated) {
    const diffDias = (Date.now() - new Date(updated).getTime()) / (1000 * 60 * 60 * 24)
    if (diffDias <= 7) score += regras.peso_atualizado
  }

  // status positivo
  const statusPositivo = ['ativo', 'onboarding', 'setup_trafego', 'recebido']
  if (statusPositivo.includes(cliente.status)) score += regras.peso_status

  const nivel: HealthScore['nivel'] = score >= regras.nivel_saudavel ? 'saudavel' : score >= regras.nivel_atencao ? 'atencao' : 'critico'

  const NIVEIS = {
    saudavel: { label: `${score}`, color: 'text-status-green', dot: 'bg-status-green' },
    atencao:  { label: `${score}`, color: 'text-status-orange', dot: 'bg-status-orange' },
    critico:  { label: `${score}`, color: 'text-status-red',    dot: 'bg-status-red'    },
  }

  return { score, nivel, ...NIVEIS[nivel] }
}
