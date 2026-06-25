export interface EtapaFluxo {
  id:                 string;
  label:              string;
  descricao:          string;
  corBadge:           string;
  icone:              string;
  instrucao:          string;
  whatsapp_templates: string[];
  checklist?:         ChecklistItem[];
  proximo_estagio?:   string;
  proxima_acao_label: string;
}

export interface ChecklistItem {
  id:    string;
  texto: string;
}

export const FLUXO_OPERACIONAL: Record<string, EtapaFluxo> = {

  // ── PRÉ-VENDA ─────────────────────────────────────────────────────────────
  prospeccao: {
    id:                 'prospeccao',
    label:              'Prospecção',
    descricao:          'Lead identificado. Aguardando primeiro contato.',
    corBadge:           'bg-status-cyan/20 text-status-cyan',
    icone:              'Search',
    instrucao:          'Realize o primeiro contato apresentando a agência. Qualifique o lead com as perguntas do #QUALIFICACAO.',
    whatsapp_templates: ['#QUALIFICACAO'],
    proximo_estagio:    'diagnostico',
    proxima_acao_label: 'Contato realizado → Diagnóstico',
  },

  diagnostico: {
    id:                 'diagnostico',
    label:              'Diagnóstico',
    descricao:          'Entendendo a situação atual do lead.',
    corBadge:           'bg-status-blue/20 text-status-blue',
    icone:              'Stethoscope',
    instrucao:          'Realize a call de diagnóstico. Mapeie dores, orçamento, histórico em anúncios e expectativas.',
    whatsapp_templates: [],
    checklist: [
      { id: 'call-diag',       texto: 'Call de diagnóstico realizada' },
      { id: 'dores-mapeadas',  texto: 'Dores e objetivos mapeados' },
      { id: 'orcamento-ads',   texto: 'Orçamento disponível para anúncios confirmado' },
      { id: 'concorrentes',    texto: 'Concorrentes identificados' },
    ],
    proximo_estagio:    'proposta',
    proxima_acao_label: 'Diagnóstico concluído → Elaborar Proposta',
  },

  proposta: {
    id:                 'proposta',
    label:              'Proposta',
    descricao:          'Proposta elaborada e aguardando resposta do lead.',
    corBadge:           'bg-status-purple/20 text-status-purple',
    icone:              'FileText',
    instrucao:          'Envie a proposta comercial com o #PROPOSTA. Siga-up em 48h se não houver resposta.',
    whatsapp_templates: ['#PROPOSTA', '#FOLLOWUP'],
    checklist: [
      { id: 'proposta-enviada', texto: 'Proposta enviada ao lead' },
      { id: 'followup-1',      texto: 'Follow-up após 48h realizado' },
    ],
    proximo_estagio:    'negociacao',
    proxima_acao_label: 'Proposta aceita → Negociação',
  },

  negociacao: {
    id:                 'negociacao',
    label:              'Negociação',
    descricao:          'Ajustes finais antes do fechamento.',
    corBadge:           'bg-status-yellow/20 text-status-yellow',
    icone:              'Handshake',
    instrucao:          'Negocie condições finais, desconto e prazo. Ao fechar, envie o link de pagamento e avance para Recebido.',
    whatsapp_templates: ['#FECHAMENTO'],
    proximo_estagio:    'recebido',
    proxima_acao_label: 'Fechado e pago → Recebido',
  },

  // ── PRINCIPAL ──────────────────────────────────────────────────────────────
  recebido: {
    id:                 'recebido',
    label:              'Recebido',
    descricao:          'Pagamento confirmado. Cliente aguarda contato inicial.',
    corBadge:           'bg-status-blue text-white',
    icone:              'Bell',
    instrucao:          'Envie a mensagem de boas-vindas agora com o template #BOASVINDAS. O cliente acabou de pagar e está aguardando.',
    whatsapp_templates: ['#BOASVINDAS'],
    proximo_estagio:    'onboarding',
    proxima_acao_label: 'Boas-vindas enviadas → Ir para Onboarding',
  },

  onboarding: {
    id:                 'onboarding',
    label:              'Onboarding',
    descricao:          'Configuração inicial da conta e estrutura do projeto.',
    corBadge:           'bg-status-purple text-white',
    icone:              'ClipboardList',
    instrucao:          'Conclua o checklist de onboarding abaixo. Envie o #CONVITE para call e o #BRIEFINGGA para coletar informações do negócio.',
    whatsapp_templates: ['#CONVITE', '#BRIEFINGGA'],
    checklist: [
      { id: 'contrato',          texto: 'Contrato enviado e assinado' },
      { id: 'pix-setup',         texto: 'Pix do setup recebido' },
      { id: 'grupo-zap',         texto: 'Grupo criado no WhatsApp com o cliente' },
      { id: 'video-boas-vindas', texto: 'Vídeo de boas-vindas enviado' },
    ],
    proximo_estagio:    'setup_trafego',
    proxima_acao_label: 'Onboarding completo → Ir para Setup de Tráfego',
  },

  setup_trafego: {
    id:                 'setup_trafego',
    label:              'Setup de Tráfego',
    descricao:          'Configuração técnica da conta Google Ads, LP e campanhas.',
    corBadge:           'bg-status-yellow text-black',
    icone:              'Settings2',
    instrucao:          'Siga o checklist técnico abaixo. Conclua todos os itens antes de ativar as campanhas.',
    whatsapp_templates: [],
    checklist: [
      { id: 'acesso-ads',       texto: 'Acesso à conta Google Ads solicitado/concedido' },
      { id: 'pagamento-ads',    texto: 'Pagamento configurado na conta Google Ads' },
      { id: 'publico-alvo',     texto: 'Público-alvo criado e configurado' },
      { id: 'palavras-chave',   texto: 'Palavras-chave negativadas (nível de conta)' },
      { id: 'conversao-ads',    texto: 'Tag de conversão (WhatsApp) criada' },
      { id: 'dominio',          texto: 'Domínio comprado e configurado' },
      { id: 'lp-criada',        texto: 'Landing page criada e publicada' },
      { id: 'tag-geral',        texto: 'Tag geral do Google instalada na LP' },
      { id: 'tag-conversao',    texto: 'Tag de conversão instalada na LP' },
      { id: 'teste-fluxo',      texto: 'Fluxo completo (Anúncio → LP → WhatsApp) testado' },
      { id: 'campanha-criada',  texto: 'Campanha criada e estruturada' },
      { id: 'anuncios-criados', texto: 'Anúncios criados (mínimo 3 variações)' },
      { id: 'revisao-final',    texto: 'Revisão final de orçamento, locais e palavras-chave' },
      { id: 'campanha-ativa',   texto: '🚀 Campanha ATIVADA' },
    ],
    proximo_estagio:    'ativo',
    proxima_acao_label: 'Campanha no ar → Cliente Ativo',
  },

  ativo: {
    id:                 'ativo',
    label:              'Ativo',
    descricao:          'Campanha rodando. Gestão contínua e otimizações.',
    corBadge:           'bg-brand text-white',
    icone:              'TrendingUp',
    instrucao:          'Cliente ativo. Monitore o saldo, verifique as métricas semanalmente e otimize as campanhas. Use #SALDOGOOGLE quando o saldo estiver crítico.',
    whatsapp_templates: ['#SALDOGOOGLE'],
    proximo_estagio:    undefined,
    proxima_acao_label: '',
  },

  congelado: {
    id:                 'congelado',
    label:              'Retido',
    descricao:          'Aguardando retorno do cliente. Alerta automático em 48h.',
    corBadge:           'bg-status-orange text-white',
    icone:              'PauseCircle',
    instrucao:          'Este cliente está aguardando sua resposta. O sistema alertará automaticamente em 48h se não houver movimento.',
    whatsapp_templates: [],
    proximo_estagio:    undefined,
    proxima_acao_label: '',
  },

  // ── CANCELAMENTO ──────────────────────────────────────────────────────────
  aviso_cancelamento: {
    id:                 'aviso_cancelamento',
    label:              'Aviso de Cancelamento',
    descricao:          'Cliente sinalizou cancelamento. Tentativa de retenção em curso.',
    corBadge:           'bg-status-orange/20 text-status-orange',
    icone:              'AlertTriangle',
    instrucao:          'Contate o cliente para entender o motivo e tentar reverter. Envie o #RETENCAO. Se não for possível reter, avance para Encerramento.',
    whatsapp_templates: ['#RETENCAO'],
    checklist: [
      { id: 'motivo-levantado',  texto: 'Motivo do cancelamento levantado' },
      { id: 'retencao-tentada',  texto: 'Tentativa de retenção realizada' },
    ],
    proximo_estagio:    'encerramento',
    proxima_acao_label: 'Retenção não possível → Encerramento',
  },

  indisponibilidade: {
    id:                 'indisponibilidade',
    label:              'Indisponibilidade',
    descricao:          'Serviços pausados temporariamente por solicitação do cliente.',
    corBadge:           'bg-ink-muted/20 text-ink-muted',
    icone:              'PauseCircle',
    instrucao:          'Pause as campanhas no Google Ads. Envie o #AVISO_INDISPONIBILIDADE confirmando a pausa.',
    whatsapp_templates: ['#AVISO_INDISPONIBILIDADE'],
    checklist: [
      { id: 'campanhas-pausadas', texto: 'Campanhas pausadas no Google Ads' },
      { id: 'confirmacao-enviada', texto: 'Confirmação de pausa enviada ao cliente' },
    ],
    proximo_estagio:    'ativo',
    proxima_acao_label: 'Cliente retornou → Reativar',
  },

  encerramento: {
    id:                 'encerramento',
    label:              'Encerramento',
    descricao:          'Processo de offboarding em andamento.',
    corBadge:           'bg-status-red/20 text-status-red',
    icone:              'LogOut',
    instrucao:          'Siga o checklist de encerramento. Encerre campanhas, remova acessos e arquive o projeto.',
    whatsapp_templates: ['#ENCERRAMENTO'],
    checklist: [
      { id: 'campanhas-encerradas', texto: 'Campanhas encerradas no Google Ads' },
      { id: 'lp-removida',          texto: 'Landing page removida do ar' },
      { id: 'acessos-revogados',    texto: 'Acesso à conta Google Ads revogado' },
      { id: 'assets-arquivados',    texto: 'Assets arquivados no Storage' },
      { id: 'nps-solicitado',       texto: 'NPS/feedback solicitado ao cliente' },
    ],
    proximo_estagio:    'cancelado',
    proxima_acao_label: 'Offboarding concluído → Cancelado',
  },

  cancelado: {
    id:                 'cancelado',
    label:              'Cancelado',
    descricao:          'Contrato encerrado. Ações de desativação necessárias.',
    corBadge:           'bg-status-red text-white',
    icone:              'XCircle',
    instrucao:          'Cliente cancelado. Remova a Landing Page do ar, delete os assets do Storage e encerre as campanhas no Google Ads.',
    whatsapp_templates: [],
    proximo_estagio:    undefined,
    proxima_acao_label: '',
  },
};

export const ORDEM_ESTAGIOS_PREVENDA   = ['prospeccao', 'diagnostico', 'proposta', 'negociacao'] as const;
export const ORDEM_ESTAGIOS_PRINCIPAL  = ['recebido', 'onboarding', 'setup_trafego', 'ativo'] as const;
export const ORDEM_ESTAGIOS_CANCELAMENTO = ['aviso_cancelamento', 'indisponibilidade', 'encerramento', 'cancelado'] as const;
