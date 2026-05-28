// Alert type definitions — used by alert-processor and UI components

export interface AlertTypeConfig {
  label: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  /** Suggested icon name from lucide-react */
  icon: string
  /** CSS color token */
  color: string
}

export const ALERT_TYPES: Record<string, AlertTypeConfig> = {
  ads_balance_low: {
    label:       'Saldo Google Ads Baixo',
    description: 'O saldo da conta Google Ads está abaixo do mínimo recomendado.',
    severity:    'critical',
    icon:        'AlertTriangle',
    color:       'text-status-red',
  },
  cpc_high: {
    label:       'CPC Elevado',
    description: 'O custo por clique médio superou o threshold configurado.',
    severity:    'warning',
    icon:        'TrendingUp',
    color:       'text-status-orange',
  },
  ctr_low: {
    label:       'CTR Baixo',
    description: 'A taxa de cliques está abaixo da média esperada.',
    severity:    'warning',
    icon:        'TrendingDown',
    color:       'text-status-orange',
  },
  payment_overdue: {
    label:       'Pagamento em Atraso',
    description: 'Cliente com mensalidade vencida há mais de X dias.',
    severity:    'critical',
    icon:        'CreditCard',
    color:       'text-status-red',
  },
  conversions_drop: {
    label:       'Queda em Conversões',
    description: 'Número de conversões caiu mais de 30% em relação ao período anterior.',
    severity:    'warning',
    icon:        'BarChart2',
    color:       'text-status-orange',
  },
  no_impressions: {
    label:       'Campanhas Sem Impressões',
    description: 'Uma ou mais campanhas ficaram sem impressões nas últimas 24h.',
    severity:    'critical',
    icon:        'EyeOff',
    color:       'text-status-red',
  },
  budget_exhausted: {
    label:       'Orçamento Esgotado',
    description: 'O orçamento diário foi totalmente consumido antes das 18h.',
    severity:    'warning',
    icon:        'DollarSign',
    color:       'text-status-orange',
  },
  report_ready: {
    label:       'Relatório Gerado',
    description: 'Relatório mensal do cliente foi processado com sucesso.',
    severity:    'info',
    icon:        'FileText',
    color:       'text-status-blue',
  },
  onboarding_pending: {
    label:       'Onboarding Pendente',
    description: 'Cliente com etapa de onboarding atrasada.',
    severity:    'info',
    icon:        'ClipboardList',
    color:       'text-status-purple',
  },
}

export type AlertTypeId = keyof typeof ALERT_TYPES
