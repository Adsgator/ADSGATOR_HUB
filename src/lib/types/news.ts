export interface NewsClienteData {
  cliente_id: string
  nome: string
  status: string
  nicho?: string

  // Google Ads
  investimento: number
  impressoes: number
  cliques: number
  cpc_medio: number
  conversoes: number
  ctr: number
  cpa: number
  saldo_google: number

  // GA4
  sessoes: number
  visualizacoes_pagina: number

  // Links rápidos (from clientes.dominio / clientes.website)
  dominio?: string
  website?: string

  // Status financeiro
  dias_atraso: number
  mrr: number

  // Metadata
  ultima_atualizacao?: string
}
