import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Política de cobrança da agência — fonte única de verdade.
 *
 * Antes desta centralização, cada componente recalculava "inadimplência" com
 * limiares próprios e divergentes (>0, >3, >=7, >=15, >=30). Mudar a régua de
 * cobrança exigia caçar a regra em ~21 arquivos. Agora os estágios e os textos
 * vivem aqui; o resto do app importa.
 *
 * Os limiares são editáveis em Configurações → Financeiro
 * (configuracoes_financeiras.limiares_atraso). O código lê os defaults abaixo
 * como fallback; quem roda no servidor com config (cron de cobrança) carrega os
 * valores com `carregarLimiaresAtraso` e passa para as funções de classificação.
 */

export interface LimiaresAtraso {
  /** 1+ dias — lembrete amigável */
  atencao: number
  /** suspensão de campanha iminente (#ALERTA D+7) */
  suspensao: number
  /** quebra de contrato */
  grave: number
  /** situação crítica */
  critico: number
}

/** Limiares de dias em atraso (inclusivos no piso) — defaults da agência. */
export const LIMIARES_ATRASO: LimiaresAtraso = {
  atencao: 1,
  suspensao: 7,
  grave: 15,
  critico: 30,
}

/**
 * Carrega os limiares editáveis da config, com fallback nos defaults.
 * Tolerante: config ausente, coluna inexistente ou campos faltando caem no
 * default correspondente — nunca quebra a régua.
 */
export async function carregarLimiaresAtraso(
  db: SupabaseClient,
): Promise<LimiaresAtraso> {
  try {
    const { data } = await db
      .from('configuracoes_financeiras')
      .select('limiares_atraso')
      .eq('agencia_id', 'adsgator-main')
      .maybeSingle()
    const cfg = (data?.limiares_atraso ?? {}) as Partial<LimiaresAtraso>
    return {
      atencao:   Number(cfg.atencao)   || LIMIARES_ATRASO.atencao,
      suspensao: Number(cfg.suspensao) || LIMIARES_ATRASO.suspensao,
      grave:     Number(cfg.grave)     || LIMIARES_ATRASO.grave,
      critico:   Number(cfg.critico)   || LIMIARES_ATRASO.critico,
    }
  } catch {
    return { ...LIMIARES_ATRASO }
  }
}

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

/**
 * Classifica o estágio de inadimplência a partir dos dias em atraso.
 * `limiares` permite usar valores editados da config; omitido, usa os defaults.
 */
export function estagioInadimplencia(
  diasAtraso: number | null | undefined,
  limiares: LimiaresAtraso = LIMIARES_ATRASO,
): EstagioInadimplencia {
  const dias = diasAtraso ?? 0
  if (dias >= limiares.critico)   return 'critico'
  if (dias >= limiares.grave)     return 'grave'
  if (dias >= limiares.suspensao) return 'suspensao'
  if (dias >= limiares.atencao)   return 'atencao'
  return 'em_dia'
}

/**
 * Mínimo necessário para derivar a inadimplência de um cliente. Tolerante a
 * `null` porque ambos os campos podem vir nulos do banco (queries parciais,
 * cliente sem vencimento em aberto). Um `Cliente` completo satisfaz o tipo.
 */
export type ClienteAtraso = {
  dias_atraso?: number | null
  data_vencimento?: string | null
}

/**
 * Status completo de inadimplência de um cliente, com metadados de UI.
 * Usa o atraso ao vivo (`diasAtrasoCliente`): quando o cliente tem
 * `data_vencimento`, o número é derivado dela; senão cai no `dias_atraso`.
 */
export function statusInadimplencia(
  cliente: ClienteAtraso,
  limiares: LimiaresAtraso = LIMIARES_ATRASO,
): StatusInadimplencia {
  const dias = diasAtrasoCliente(cliente)
  const estagio = estagioInadimplencia(dias, limiares)
  return {
    estagio,
    dias,
    inadimplente: dias > 0,
    ...META[estagio],
  }
}

/** Atalho: o cliente tem qualquer atraso (ao vivo)? */
export function isInadimplente(cliente: ClienteAtraso): boolean {
  return diasAtrasoCliente(cliente) > 0
}

/**
 * Dias de atraso "ao vivo", calculados pela data de vencimento (hoje − venc.),
 * com fallback no `dias_atraso` gravado no banco.
 *
 * Motivação: `clientes.dias_atraso` é uma coluna fixa, atualizada só pelo
 * webhook do Asaas (1x no vencimento) e pelo cron diário de cobrança. Entre
 * uma atualização e outra — ou quando o cron não roda — o número congela e a
 * UI mostra um atraso menor do que o real. Quando temos a data de vencimento
 * em aberto, o atraso correto é sempre derivado dela.
 *
 * `vencimento`: data da cobrança vencida em aberto — em geral a
 * `data_proxima_cobranca` da assinatura (que, estando atrasada, aponta para a
 * fatura vencida) ou `clientes.data_vencimento`. Aceita `Date` ou ISO string.
 *
 * Sem data válida, retorna o `dias_atraso` gravado (`?? 0`).
 * O atraso por data nunca é negativo (vencimento no futuro ⇒ 0).
 */
export function diasAtrasoReais(
  cliente: ClienteAtraso,
  vencimento?: string | Date | null,
): number {
  if (vencimento) {
    // Datas só-data (`YYYY-MM-DD`, ex.: clientes.data_vencimento que é DATE no
    // banco) seriam parseadas como meia-noite UTC e, em BRT (-3), voltariam um
    // dia ao zerar as horas localmente → atraso +1. Ancorar ao meio-dia evita.
    const venc = vencimento instanceof Date
      ? vencimento
      : new Date(/^\d{4}-\d{2}-\d{2}$/.test(vencimento) ? `${vencimento}T12:00:00` : vencimento)
    if (!Number.isNaN(venc.getTime())) {
      // Compara só a parte de data (zera horas) para não contar fração de dia.
      const hoje0 = new Date()
      hoje0.setHours(0, 0, 0, 0)
      const venc0 = new Date(venc)
      venc0.setHours(0, 0, 0, 0)
      return Math.max(0, Math.floor((hoje0.getTime() - venc0.getTime()) / 86_400_000))
    }
  }
  return cliente.dias_atraso ?? 0
}

/**
 * Atraso ao vivo de um cliente, derivado de `clientes.data_vencimento` — o
 * espelho do vencimento em aberto, gravado pelo cron de cobrança e pelo
 * webhook do Asaas. É o atalho padrão da UI: substitui a leitura crua de
 * `cliente.dias_atraso` (coluna fixa que congela entre atualizações),
 * garantindo o mesmo D+N em todas as telas. Sem `data_vencimento`, cai no
 * `dias_atraso` gravado.
 */
export function diasAtrasoCliente(cliente: ClienteAtraso): number {
  return diasAtrasoReais(cliente, cliente.data_vencimento ?? null)
}
