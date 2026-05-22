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

export const ORDEM_ESTAGIOS = ['recebido', 'onboarding', 'setup_trafego', 'ativo'] as const;

export const WHATSAPP_TEMPLATES: Record<string, { titulo: string; mensagem: string }> = {
  '#BOASVINDAS': {
    titulo: 'Boas-vindas',
    mensagem: `Olá! 👋

Seja muito bem-vindo(a)! 🚀

Estamos super animados em tê-lo(a) como nosso cliente. A partir de agora, estamos juntos para colocar o seu negócio em outro nível no Google!

Nos próximos dias vou entrar em contato para alinharmos os próximos passos do nosso projeto.

Qualquer dúvida que surgir, pode chamar aqui! Estou à disposição.`,
  },

  '#CONVITE': {
    titulo: 'Convite para Call de Alinhamento',
    mensagem: `Oi! 👋

Tudo certo? Vim marcar nossa call inicial para a gente alinhar a estratégia e tirar todas as dúvidas antes de começar.

Tenho disponibilidade nos seguintes horários. Qual funciona melhor para você?

Por favor me informe a melhor opção e te mando o link da chamada. 😊`,
  },

  '#BRIEFINGGA': {
    titulo: 'Briefing Google Ads',
    mensagem: `Oi! 📋

Para montar a sua campanha de Google Ads da forma mais certeira possível, precisamos de algumas informações sobre o seu negócio.

Pode me responder as perguntas abaixo?

✅ Qual o seu principal produto/serviço?
✅ Qual o ticket médio?
✅ Qual a cidade/região de atuação?
✅ Qual o perfil do seu cliente ideal (idade, gênero, situação)?
✅ Quais são seus 3 principais diferenciais?
✅ Já teve experiências com Google Ads antes?

Com isso, já consigo estruturar tudo para você! 🙏`,
  },

  '#SALDOGOOGLE': {
    titulo: 'Alerta de Saldo Google Ads',
    mensagem: `Olá! ⚠️

Passando para avisar que o saldo da sua conta do Google Ads está próximo do limite mínimo.

Para garantir que suas campanhas não parem e você não perca leads, é importante fazer uma recarga o quanto antes.

Qualquer dúvida sobre como fazer a recarga, é só me chamar! 😊`,
  },
};

export function gerarLinkWhatsApp(template: keyof typeof WHATSAPP_TEMPLATES, numero: string): string {
  const t = WHATSAPP_TEMPLATES[template];
  if (!t) return '';
  const numeroLimpo = numero.replace(/\D/g, '');
  const mensagemCodificada = encodeURIComponent(t.mensagem);
  return `https://wa.me/55${numeroLimpo}?text=${mensagemCodificada}`;
}
