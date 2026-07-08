// Cards do monitoramento do dashboard (NewsContainer).
// UM CARD POR SERVIÇO: cliente de tráfego (Google Ads) e cliente de site (GA4)
// têm cards separados com as métricas do seu serviço — quem tem os dois
// serviços aparece nos dois.

export type NewsCardTipo = 'trafego' | 'site'

export interface NewsCardData {
  tipo: NewsCardTipo
  cliente_id: string
  nome: string
  status: string
  nicho?: string

  /** false = integração do serviço não configurada/ligada (card vira CTA de conexão) */
  conectado: boolean
  /** false = conectado mas ainda sem snapshot (aguardando 1ª sincronização) */
  tem_dados: boolean

  // Tráfego (Google Ads — snapshot mensal mais recente)
  investimento?: number
  impressoes?: number
  cliques?: number
  cpc_medio?: number
  conversoes?: number
  ctr?: number
  cpa?: number
  /** null = conta pós-paga sem saldo informado (não é R$ 0!) */
  saldo_google?: number | null
  saldo_atualizado_em?: string | null

  // Site (GA4 — snapshot mensal mais recente)
  sessoes?: number
  usuarios?: number
  taxa_conversao?: number

  // Links rápidos (from clientes.dominio / clientes.website)
  dominio?: string
  website?: string

  // Status financeiro
  dias_atraso: number
  data_vencimento?: string | null
  mrr: number

  // Metadata
  ultima_atualizacao?: string
}
