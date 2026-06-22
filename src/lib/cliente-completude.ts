import type { Cliente } from './types'

/**
 * Completude do cliente — fonte única do "o que falta preencher".
 *
 * O Hub deve ser proativo: dizer o que falta em cada cliente, não esperar Lucas
 * caçar campo vazio. Esta é a régua (alinhada com Lucas em 22/06/2026) que a tela
 * de gestão e os avisos consomem. Mesma filosofia de lib/cliente-status.ts e
 * lib/cobranca.ts: cálculo puro, sem efeito colateral, sem persistência (nunca
 * defasa).
 *
 * Aplica-se a TODOS os clientes — inclusive os importados do Asaas, que nascem
 * só com nome/email/valor e precisam ser completados (sem passar por onboarding).
 *
 * Escopo desta versão: avalia apenas campos que JÁ existem na tabela `clientes`.
 * Itens que dependem do estado de onboarding (briefing recebido, assets
 * coletados, acesso GMN confirmado, número verificado) entram quando a Etapa 2
 * trouxer o modelo de onboarding — marcados abaixo com TODO(onboarding).
 */

export type BlocoCompletude =
  | 'marca'
  | 'google'
  | 'financeiro'
  | 'contexto'

export interface ItemCompletude {
  /** Identificador estável (para deep-link/ação futura) */
  id:       string
  /** Rótulo curto do que falta (ex.: "Nicho") */
  label:    string
  /** Está preenchido? */
  ok:       boolean
  /** Campo de `Cliente` correspondente, quando há um direto */
  campo?:   keyof Cliente
}

export interface BlocoResultado {
  bloco:    BlocoCompletude
  label:    string
  itens:    ItemCompletude[]
  /** itens.filter(ok).length */
  preenchidos: number
  total:    number
  completo: boolean
}

export interface CompletudeResultado {
  blocos:   BlocoResultado[]
  /** Todos os itens achatados (para listar "o que falta") */
  faltando: ItemCompletude[]
  preenchidos: number
  total:    number
  /** 0–100 */
  percent:  number
  completo: boolean
}

const BLOCO_LABEL: Record<BlocoCompletude, string> = {
  marca:      'Marca / negócio',
  google:     'Integrações Google',
  financeiro: 'Financeiro / contrato',
  contexto:   'Contexto para operação',
}

/** Preenchido = string não-vazia / número > 0 / booleano true. */
function preenchido(valor: unknown): boolean {
  if (typeof valor === 'string') return valor.trim().length > 0
  if (typeof valor === 'number') return valor > 0
  if (typeof valor === 'boolean') return valor
  return valor != null
}

/**
 * Calcula a completude de um cliente segundo a régua.
 * `extra` permite informar fatos que não estão na tabela `clientes` (ex.: se há
 * memória .md), sem acoplar este módulo a outras tabelas. Tudo opcional.
 */
export function calcularCompletude(
  cliente: Cliente,
  extra?: {
    temMemoria?:           boolean
    temAssinaturaVinculada?: boolean
    tipoContratacao?:      string | null   // combo | trafego | lp
  },
): CompletudeResultado {
  const blocosDef: { bloco: BlocoCompletude; itens: ItemCompletude[] }[] = [
    {
      bloco: 'marca',
      itens: [
        { id: 'nicho',   label: 'Nicho',   ok: preenchido(cliente.nicho),   campo: 'nicho' },
        { id: 'dominio', label: 'Domínio', ok: preenchido(cliente.dominio), campo: 'dominio' },
        { id: 'website', label: 'Site / LP no ar', ok: preenchido(cliente.website), campo: 'website' },
        // TODO(onboarding): briefing recebido, assets coletados
      ],
    },
    {
      bloco: 'google',
      itens: [
        { id: 'google_ads_customer_id', label: 'Google Ads customer ID', ok: preenchido(cliente.google_ads_customer_id), campo: 'google_ads_customer_id' },
        { id: 'google_ads_perfil_url',  label: 'Link do perfil Google Ads', ok: preenchido(cliente.google_ads_perfil_url), campo: 'google_ads_perfil_url' },
        { id: 'ga4_property_id',        label: 'GA4 property ID', ok: preenchido(cliente.ga4_property_id), campo: 'ga4_property_id' },
        { id: 'gmb_id',                 label: 'Google Meu Negócio', ok: preenchido(cliente.gmb_id), campo: 'gmb_id' },
        { id: 'google_ads_enabled',     label: 'Toggle Google Ads habilitado', ok: preenchido(cliente.google_ads_enabled), campo: 'google_ads_enabled' },
        { id: 'ga4_enabled',            label: 'Toggle GA4 habilitado', ok: preenchido(cliente.ga4_enabled), campo: 'ga4_enabled' },
        // TODO(onboarding): acesso GMN confirmado, número verificado
      ],
    },
    {
      bloco: 'financeiro',
      itens: [
        { id: 'plano', label: 'Plano cadastrado', ok: preenchido(cliente.plano), campo: 'plano' },
        { id: 'mrr',   label: 'MRR cadastrado',   ok: preenchido(cliente.mrr),   campo: 'mrr' },
        { id: 'assinatura', label: 'Assinatura Asaas vinculada', ok: extra?.temAssinaturaVinculada ?? preenchido(cliente.asaas_id) },
        { id: 'tipo_contratacao', label: 'Tipo de contratação definido', ok: preenchido(extra?.tipoContratacao) },
      ],
    },
    {
      bloco: 'contexto',
      itens: [
        { id: 'memoria',    label: 'Memória do cliente', ok: extra?.temMemoria ?? false },
        { id: 'portal',     label: 'Portal gerado', ok: preenchido(cliente.portal_token), campo: 'portal_token' },
        { id: 'email',      label: 'E-mail definido', ok: preenchido(cliente.email), campo: 'email' },
      ],
    },
  ]

  const blocos: BlocoResultado[] = blocosDef.map(({ bloco, itens }) => {
    const preenchidos = itens.filter((i) => i.ok).length
    return {
      bloco,
      label:    BLOCO_LABEL[bloco],
      itens,
      preenchidos,
      total:    itens.length,
      completo: preenchidos === itens.length,
    }
  })

  const todosItens = blocos.flatMap((b) => b.itens)
  const preenchidos = todosItens.filter((i) => i.ok).length
  const total = todosItens.length

  return {
    blocos,
    faltando: todosItens.filter((i) => !i.ok),
    preenchidos,
    total,
    percent:  total > 0 ? Math.round((preenchidos / total) * 100) : 100,
    completo: preenchidos === total,
  }
}
