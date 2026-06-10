/**
 * Espelho mínimo de src/lib/cobranca.ts para uso em Edge Functions Deno.
 * Deno não importa de src/ — mantenha em sync com a fonte de verdade.
 * Ao mudar a régua de cobrança, altere src/lib/cobranca.ts PRIMEIRO e replique aqui.
 */

export const LIMIARES_ATRASO = {
  atencao:  1,
  suspensao: 7,
  grave:    15,
  critico:  30,
} as const

export type EstagioInadimplencia = 'em_dia' | 'atencao' | 'suspensao' | 'grave' | 'critico'

export function estagioInadimplencia(diasAtraso: number | null | undefined): EstagioInadimplencia {
  const dias = diasAtraso ?? 0
  if (dias >= LIMIARES_ATRASO.critico)   return 'critico'
  if (dias >= LIMIARES_ATRASO.grave)     return 'grave'
  if (dias >= LIMIARES_ATRASO.suspensao) return 'suspensao'
  if (dias >= LIMIARES_ATRASO.atencao)   return 'atencao'
  return 'em_dia'
}
