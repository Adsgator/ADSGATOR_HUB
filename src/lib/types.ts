export type ClienteStatus =
  | 'recebido'
  | 'onboarding'
  | 'setup_trafego'
  | 'ativo'
  | 'congelado'
  | 'cancelado';

export type AssinaturaStatus =
  | 'ativa'
  | 'atraso_7_dias'
  | 'atraso_15_dias'
  | 'cancelado_debito';

export interface Cliente {
  id:                    string;
  nome:                  string;
  email:                 string;
  whatsapp:              string;
  dominio:               string | null;
  nicho:                 string;
  status:                ClienteStatus;
  google_ads_customer_id: string | null;
  ga4_property_id:        string | null;
  cor_tema:              string;
  notas_internas:        string | null;
  metadata:              Record<string, unknown>;
  data_criacao:          string;
  data_atualizacao:      string;
}

export interface Estagio {
  id:               string;
  cliente_id:       string;
  estagio:          string;
  acao_proxima:     string;
  pendente_cliente: boolean;
  data_entrada:     string;
  data_saida:       string | null;
  created_at:       string;
}

export interface Assinatura {
  id:                     string;
  cliente_id:             string;
  plano_nome:             string;
  valor_mensal:           number;
  status:                 AssinaturaStatus;
  data_inicio:            string;
  data_proxima_cobranca:  string;
  asaas_subscription_id:  string | null;
  dias_atraso:            number;
  created_at:             string;
  updated_at:             string;
}

export interface HistoricoAcao {
  id:              string;
  cliente_id:      string;
  tipo_acao:       string;
  descricao:       string;
  valor_impactado: number | null;
  usuario_id:      string | null;
  data_acao:       string;
  metadata:        Record<string, unknown>;
}

export interface CustoDetalhe {
  id:        string;
  nome:      string;
  valor:     number;
  tipo:      'fixo' | 'variavel';
  descricao: string | null;
  ativo:     boolean;
}

export interface ConfigFinanceira {
  id:                             string;
  agencia_id:                     string;
  custos_fixos_mensais:           number;
  custos_variaveis_percentual:    number;
  margem_lucro_minima:            number;
  saldo_google_ads_limite_alerta: number;
}

export interface OnboardProgresso {
  cliente_id: string;
  progresso:  Record<string, boolean>;
  updated_at: string;
}

export interface RelatorioMensal {
  id:               string;
  cliente_id:       string;
  mes_ano:          string;
  mrr:              number | null;
  investimento_ads: number | null;
  conversoes:       number | null;
  cpa:              number | null;
  cliques:          number | null;
  impressoes:       number | null;
  ctr:              number | null;
  sessoes_ga4:      number | null;
  novos_usuarios:   number | null;
  taxa_engajamento: number | null;
  roi:              number | null;
  markdown_content: string | null;
  status_geracao:   'pendente' | 'processando' | 'completo' | 'erro';
  created_at:       string;
}
