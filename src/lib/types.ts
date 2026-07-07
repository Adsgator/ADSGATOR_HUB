// ─── STATUS TYPES ─────────────────────────────────────────────────────────────

// Saída de cliente é estado único: 'inativo' + motivo_inativacao (lib/cliente-status.ts).
// 'cancelado'/'cancelado_debito' ficam só por compat com registros pré-migration —
// não escrever mais nesses status; usar 'inativo'.
export type ClienteStatus =
  | 'recebido'
  | 'onboarding'
  | 'setup_trafego'
  | 'ativo'
  | 'congelado'
  | 'cancelado_debito'
  | 'cancelado'
  | 'inativo'

export type AssinaturaStatus =
  | 'ativa'
  | 'atraso_7_dias'
  | 'atraso_15_dias'
  | 'cancelado_debito'
  | 'cancelada'          // SUBSCRIPTION_INACTIVATED no Asaas
  | 'deletada'           // SUBSCRIPTION_DELETED no Asaas
  | 'pausada'            // régua D+7: suspensão dos serviços (recorrência pausada)
  | 'cancelado_admin'    // régua D+15: cancelamento administrativo

// ─── CHECKLIST ────────────────────────────────────────────────────────────────

export interface ChecklistItem {
  item:           string
  done:           boolean
  nota?:          string
  lembrete_data?: string  // ISO date string
}

// ─── CLIENTE ──────────────────────────────────────────────────────────────────

export interface Cliente {
  id:              string
  user_id:         string
  nome:            string
  email?:          string
  whatsapp?:       string
  nicho?:          string
  dominio?:        string
  website?:        string
  status:          ClienteStatus
  /** Tipo de contratação — seleciona o template de onboarding (origem futura: checkout) */
  tipo_contratacao?: 'combo' | 'trafego' | 'lp' | null
  mrr?:            number
  plano?:          string
  asaas_id?:       string
  dias_atraso:     number
  data_vencimento?: string
  /** true = isento da régua automática de inadimplência (D+7/15/28) */
  regua_isento?:   boolean
  // Google Ads
  google_ads_id?:  string
  google_ads_customer_id?: string | null
  google_ads_enabled?:     boolean
  // GA4
  ga4_property_id?:        string | null
  ga4_enabled?:            boolean
  // Outras integrações
  gmb_id?:          string
  looker_url?:      string
  google_ads_perfil_url?: string | null  // link do perfil/conta Google Ads do cliente
  saldo_google?:    number
  saldo_google_atualizado_em?: string | null  // quando o saldo foi atualizado (sync automático ou manual)
  // Status da última sincronização de analytics (lib/analytics-sync.ts)
  ultimo_sync_at?:     string | null
  ultimo_sync_status?: 'ok' | 'parcial' | 'erro' | null
  ultimo_sync_erro?:   string | null
  // Alerta de saldo Google Ads (lib/saldo-ads.ts)
  saldo_minimo_alerta?:  number | null   // R$ abaixo do qual dispara "saldo baixo"; null = mínimo global
  saldo_alertas_ativos?: boolean         // false = não dispara nenhum alerta de saldo (a pedido / cancelamento)
  congelado_em?:    string
  // Inativação (ver lib/cliente-status.ts): motivo da saída + quando arquivou
  motivo_inativacao?: 'debito' | 'cancelado' | 'congelamento_expirado' | null
  inativado_em?:    string | null
  data_criacao?:    string
  data_atualizacao?: string
  // Portal do cliente
  portal_token?:    string
}

// ─── ESTAGIO ──────────────────────────────────────────────────────────────────

export interface Estagio {
  id:           string
  cliente_id:   string
  nome:         string
  descricao?:   string
  acao_label?:  string
  acao_url?:    string
  checklist?:   ChecklistItem[]
  ativo:        boolean
  concluido_em?: string
  created_at?:  string
}

// ─── NOTIFICACAO ──────────────────────────────────────────────────────────────

export interface Notificacao {
  id:           string
  user_id:      string
  cliente_id?:  string
  tipo:         'urgente' | 'atencao' | 'info' | 'sucesso' | 'alerta'
  titulo:       string
  mensagem?:    string
  acao_label?:  string
  acao_url?:    string
  lida:         boolean
  lida_em?:     string
  created_at:   string
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

export interface AnalyticsSnapshot {
  id:             string
  cliente_id:     string
  fonte:          'google_ads' | 'ga4'
  periodo_inicio: string
  periodo_fim:    string
  investimento?:  number
  impressoes?:    number
  cliques?:       number
  ctr?:           number
  conversoes?:    number  // aceita decimais: 0.5, 1.5 — CORRETO por data-driven
  cpa?:           number
  roas?:          number
  cpc_medio?:     number
  usuarios?:      number
  sessoes?:       number
  taxa_conversao?: number
  insight_ia?:    string
  created_at:     string
}

// ─── FINANCEIRO ───────────────────────────────────────────────────────────────

export interface FinanceiroLancamento {
  id:           string
  user_id:      string
  cliente_id?:  string
  tipo:         'receita' | 'custo_fixo' | 'custo_variavel'
  categoria?:   string
  descricao:    string
  valor:        number
  data:         string
  status:       'pendente' | 'confirmado' | 'cancelado'
  asaas_payment_id?: string
  created_at:   string
}

// ─── RELATORIO ────────────────────────────────────────────────────────────────

export interface Relatorio {
  id:          string
  user_id:     string
  cliente_id?: string
  tipo:        string
  titulo:      string
  conteudo_md: string
  created_at:  string
}

// ─── LEGACY TYPES (backward compat — páginas antigas) ─────────────────────────

export interface Assinatura {
  id:                     string
  cliente_id:             string
  plano_nome:             string
  valor_mensal:           number
  status:                 AssinaturaStatus
  data_inicio:            string
  data_proxima_cobranca:  string
  asaas_subscription_id:  string | null
  dias_atraso:            number
  created_at:             string
  updated_at:             string
}

export interface HistoricoAcao {
  id:              string
  cliente_id:      string
  tipo_acao:       string
  descricao:       string
  valor_impactado: number | null
  usuario_id:      string | null
  created_at:      string
  metadata:        Record<string, unknown>
}

export interface CustoDetalhe {
  id:        string
  nome:      string
  valor:     number
  tipo:      'fixo' | 'variavel'
  descricao: string | null
  ativo:     boolean
}

export interface ConfigFinanceira {
  id:                             string
  agencia_id:                     string
  custos_fixos_mensais:           number
  custos_variaveis_percentual:    number
  margem_lucro_minima:            number
  saldo_google_ads_limite_alerta: number
  tipo_tributacao?:               string
  imposto_percentual?:            number
}

export interface OnboardProgresso {
  cliente_id: string
  progresso:  Record<string, boolean>
  updated_at: string
}

// ─── TAREFA ───────────────────────────────────────────────────────────────────

export type TarefaPrioridade = 'critico' | 'alto' | 'normal' | 'baixo'
export type TarefaStatus     = 'pendente' | 'em_progresso' | 'feito' | 'adiado'

export interface Tarefa {
  id:              string
  user_id:         string
  cliente_id?:     string
  titulo:          string
  descricao?:      string
  prioridade:      TarefaPrioridade
  status:          TarefaStatus
  data_prazo?:     string
  responsavel_id?: string
  checklist?:      ChecklistItem[]
  posicao?:        number
  created_at:      string
  updated_at:      string
}

// ─── MEMÓRIA DE CLIENTES ──────────────────────────────────────────────────────

export interface MemoriaCliente {
  id:          string
  cliente_id:  string
  conteudo_md: string
  versao:      number
  updated_at:  string
}

// ─── CONFIGURAÇÃO DO USUÁRIO ──────────────────────────────────────────────────

export interface ConfiguracaoUsuario {
  id:           string
  user_id:      string
  preferencias: Record<string, unknown>
  notif_config: Record<string, unknown>
  created_at:   string
  updated_at:   string
}

// ─── API KEY ──────────────────────────────────────────────────────────────────

export interface ApiKey {
  id:         string
  user_id:    string
  nome:       string
  chave_hash: string
  ativo:      boolean
  ultimo_uso?: string
  created_at: string
}

// ─── CHAT MENSAGEM (IA Contextual) ────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMensagem {
  id:         string
  role:       ChatRole
  content:    string
  created_at: string
}

// ─────────────────────────────────────────────────────────────────────────────

export interface RelatorioMensal {
  id:               string
  cliente_id:       string
  mes_ano:          string
  mrr:              number | null
  investimento_ads: number | null
  conversoes:       number | null
  cpa:              number | null
  cliques:          number | null
  impressoes:       number | null
  ctr:              number | null
  sessoes_ga4:      number | null
  novos_usuarios:   number | null
  taxa_engajamento: number | null
  roi:              number | null
  markdown_content: string | null
  status_geracao:   'pendente' | 'processando' | 'gerado' | 'erro'
  created_at:       string
}
