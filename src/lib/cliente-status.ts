import type { Cliente, ClienteStatus } from './types'

/**
 * Estados do cliente — fonte única de verdade.
 *
 * Antes, "cliente que saiu" não tinha definição única: havia 'cancelado',
 * 'cancelado_debito' e 'inativo' soltos, e cada tela inventava seu filtro
 * (useClientes escondia só 'cancelado', deixando os outros poluírem métricas).
 * Agora a saída é UM estado — 'inativo' — com o motivo guardado em
 * `clientes.motivo_inativacao`. Esta é a régua que todo filtro deve usar,
 * no mesmo espírito de lib/cobranca.ts e lib/mrr.ts.
 */

/** Cliente na operação do dia-a-dia — aparece em listas, métricas e MRR. */
export const STATUS_OPERACAO = [
  'recebido',
  'onboarding',
  'setup_trafego',
  'ativo',
  'congelado',
] as const

/** Cliente arquivado — sai das telas de gestão, fica só no histórico. */
export const STATUS_ARQUIVADO = ['inativo'] as const

export type MotivoInativacao =
  | 'debito'                 // perdido no D+30 (inadimplência)
  | 'cancelado'              // encerramento a pedido
  | 'congelamento_expirado'  // congelado por mais que o limite (default 60d)
  | 'nao_convertido'         // fechou no checkout mas nunca pagou o 1º pagamento

const MOTIVO_LABEL: Record<MotivoInativacao, string> = {
  debito:                'Cancelado por inadimplência',
  cancelado:             'Cancelado a pedido',
  congelamento_expirado: 'Congelamento expirado',
  nao_convertido:        'Fechou e não pagou',
}

/** Rótulo amigável do motivo de inativação, para badges/UI. */
export function labelMotivoInativacao(motivo: string | null | undefined): string {
  if (!motivo) return 'Inativo'
  return MOTIVO_LABEL[motivo as MotivoInativacao] ?? 'Inativo'
}

/** O cliente está arquivado (fora da operação)? */
export function isArquivado(cliente: Pick<Cliente, 'status'>): boolean {
  return (STATUS_ARQUIVADO as readonly string[]).includes(cliente.status ?? '')
}

/** O cliente está na operação do dia-a-dia? */
export function isOperacional(cliente: Pick<Cliente, 'status'>): boolean {
  return (STATUS_OPERACAO as readonly string[]).includes(cliente.status ?? '')
}

/** Status que NÃO devem aparecer nas telas de gestão (para filtros .not/.in). */
export const STATUS_OCULTOS: readonly ClienteStatus[] = STATUS_ARQUIVADO
