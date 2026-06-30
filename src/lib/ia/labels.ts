// ─── RÓTULOS LEGÍVEIS DAS FERRAMENTAS DO AGENTE ──────────────────────────────
// Enquanto uma ferramenta está RODANDO, o painel mostra um gerúndio amigável
// ("Cruzando os riscos da agência…") em vez do nome técnico ("radar"). O estado
// final usa o resumo que o backend devolve (já legível). Nomes = lib/ia/tools.ts.

const LABELS: Record<string, string> = {
  listar_clientes:           'Consultando os clientes',
  detalhar_cliente:          'Abrindo o cliente',
  criar_cliente:             'Cadastrando o cliente',
  atualizar_cliente:         'Atualizando o cliente',
  listar_tarefas:            'Consultando as tarefas',
  criar_tarefa:              'Criando a tarefa',
  listar_templates_tarefa:   'Buscando os modelos de tarefa',
  criar_tarefa_de_template:  'Criando a tarefa pelo modelo',
  atualizar_tarefa:          'Atualizando a tarefa',
  excluir_tarefa:            'Excluindo a tarefa',
  financeiro_resumo:         'Levantando o financeiro',
  listar_lancamentos:        'Consultando os lançamentos',
  criar_lancamento:          'Registrando o lançamento',
  listar_alertas:            'Verificando os alertas',
  criar_notificacao:         'Criando a notificação',
  panorama_agencia:          'Lendo o panorama da agência',
  panorama_onboarding:       'Checando os onboardings',
  listar_posts_marketing:    'Consultando o calendário',
  criar_post_marketing:      'Criando o post',
  listar_prospects:          'Consultando os prospects',
  criar_prospect:            'Cadastrando o prospect',
  atualizar_prospect:        'Atualizando o prospect',
  analytics_cliente:         'Lendo os analytics',
  ads_ao_vivo:               'Puxando o Google Ads ao vivo',
  historico_cliente:         'Revendo o histórico',
  radar:                     'Cruzando os riscos da agência',
  salvar_memoria:            'Guardando na memória',
  esquecer_memoria:          'Esquecendo da memória',
  atualizar_memoria_cliente: 'Atualizando a memória do cliente',
  anotar_no_cliente:         'Anotando no cliente',
  listar_templates_email:    'Buscando os modelos de email',
  enviar_email:              'Enviando o email',
  status_sistema:            'Checando o status do sistema',
  prontidao_sistema:         'Verificando a prontidão do sistema',
  mapa_do_sistema:           'Consultando o mapa do sistema',
  listar_agendamentos:       'Consultando os agendamentos',
  buscar:                    'Buscando no sistema',
}

/** Gerúndio amigável p/ a ferramenta em execução; fallback = nome formatado. */
export function labelFerramenta(nome: string): string {
  return LABELS[nome] ?? nome.replace(/_/g, ' ')
}
