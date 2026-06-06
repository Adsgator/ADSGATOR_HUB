import type { Cliente } from './types'

/**
 * Política de cobrança da agência — fonte única de verdade.
 *
 * Antes desta centralização, cada componente recalculava "inadimplência" com
 * limiares próprios e divergentes (>0, >3, >=7, >=15, >=30). Mudar a régua de
 * cobrança exigia caçar a regra em ~21 arquivos. Agora os estágios e os textos
 * vivem aqui; o resto do app importa.
 */

/** Limiares de dias em atraso (inclusivos no piso). */
export const LIMIARES_ATRASO = {
  /** 1–6 dias — lembrete amigável */
  atencao: 1,
  /** 7–14 dias — suspensão de campanha iminente (#ALERTA D+7) */
  suspensao: 7,
  /** 15–29 dias — quebra de contrato */
  grave: 15,
  /** 30+ dias — situação crítica */
  critico: 30,
} as const

export type EstagioInadimplencia =
  | 'em_dia'
  | 'atencao'
  | 'suspensao'
  | 'grave'
  | 'critico'

export interface StatusInadimplencia {
  estagio: EstagioInadimplencia
  dias: number
  /** true para qualquer atraso > 0 dias */
  inadimplente: boolean
  /** rótulo curto para badges/tags */
  label: string
  /** descrição da consequência, para alertas */
  detalhe: string
  /** token de cor do design system */
  color: string
}

const META: Record<EstagioInadimplencia, Pick<StatusInadimplencia, 'label' | 'detalhe' | 'color'>> = {
  em_dia:    { label: 'Em dia',        detalhe: 'Pagamento em dia',                          color: 'text-status-green' },
  atencao:   { label: 'Atenção',       detalhe: 'Pagamento em atraso',                       color: 'text-status-yellow' },
  suspensao: { label: 'Suspensão D+7', detalhe: 'Suspensão de campanha iminente',            color: 'text-status-orange' },
  grave:     { label: 'Grave D+15',    detalhe: 'Quebra de contrato',                        color: 'text-status-red' },
  critico:   { label: 'Crítico D+30',  detalhe: 'Situação crítica — risco de cancelamento',  color: 'text-status-red' },
}

/** Classifica o estágio de inadimplência a partir dos dias em atraso. */
export function estagioInadimplencia(diasAtraso: number | null | undefined): EstagioInadimplencia {
  const dias = diasAtraso ?? 0
  if (dias >= LIMIARES_ATRASO.critico)   return 'critico'
  if (dias >= LIMIARES_ATRASO.grave)     return 'grave'
  if (dias >= LIMIARES_ATRASO.suspensao) return 'suspensao'
  if (dias >= LIMIARES_ATRASO.atencao)   return 'atencao'
  return 'em_dia'
}

/** Status completo de inadimplência de um cliente, com metadados de UI. */
export function statusInadimplencia(cliente: Pick<Cliente, 'dias_atraso'>): StatusInadimplencia {
  const dias = cliente.dias_atraso ?? 0
  const estagio = estagioInadimplencia(dias)
  return {
    estagio,
    dias,
    inadimplente: dias > 0,
    ...META[estagio],
  }
}

/** Atalho: o cliente tem qualquer atraso? */
export function isInadimplente(cliente: Pick<Cliente, 'dias_atraso'>): boolean {
  return (cliente.dias_atraso ?? 0) > 0
}
