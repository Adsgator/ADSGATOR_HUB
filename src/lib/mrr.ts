/**
 * Cálculo de MRR (Monthly Recurring Revenue) — fonte única de verdade.
 *
 * Antes desta centralização, "MRR" significava 5 coisas diferentes no app:
 * o Briefing somava `clientes.mrr` por status; o Dashboard somava `clientes.mrr`
 * de quase todos; a StatusBar somava `assinaturas.valor_mensal`; a tool da IA
 * só contava `status='ativo'`; e o Financeiro lia `financeiro_lancamentos`.
 * Resultado: o mesmo número aparecia como R$ 2.635, R$ 1.967 e R$ 0 ao mesmo
 * tempo. Agora a definição vive aqui e todos importam.
 *
 * Fonte de verdade: a tabela `assinaturas`, governada pelo webhook do Asaas
 * (cria 'ativa', move para os estágios de atraso, marca cancelada/deletada
 * quando o cliente sai). `clientes.mrr` é apenas um espelho desnormalizado e
 * NÃO deve ser usado para agregar MRR total.
 *
 * Regra: MRR ativo = soma de `valor_mensal` das assinaturas com cobrança viva
 * (ativa ou em atraso). Cliente atrasado ainda é receita recorrente — só está
 * em atraso. Saem apenas as assinaturas sem recorrência futura (canceladas,
 * com débito encerrado ou deletadas).
 */

/** Status de assinatura que ainda representam receita recorrente real. */
export const STATUS_ASSINATURA_ATIVA = [
  'ativa',
  'atraso_7_dias',
  'atraso_15_dias',
] as const

export type StatusAssinaturaAtiva = (typeof STATUS_ASSINATURA_ATIVA)[number]

export interface AssinaturaMRR {
  valor_mensal: number | null
  status: string | null
}

/** Uma assinatura conta para o MRR? (cobrança viva, mesmo que em atraso) */
export function assinaturaContaMrr(status: string | null | undefined): boolean {
  return STATUS_ASSINATURA_ATIVA.includes(status as StatusAssinaturaAtiva)
}

/**
 * MRR total da agência: soma do valor_mensal das assinaturas com cobrança viva.
 * Passe TODAS as assinaturas do usuário — o filtro de status é feito aqui para
 * garantir a mesma regra em todo lugar.
 */
export function calcularMRR(assinaturas: AssinaturaMRR[]): number {
  return assinaturas
    .filter((a) => assinaturaContaMrr(a.status))
    .reduce((soma, a) => soma + (a.valor_mensal ?? 0), 0)
}
