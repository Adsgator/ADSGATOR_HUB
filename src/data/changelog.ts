export interface ChangelogEntry {
  versao:   string
  data:     string  // YYYY-MM-DD
  novidades: string[]
}

// ⚠️ Mantenha em dia: toda feature visível ao usuário entra aqui no mesmo
// commit em que é entregue (nova entrada no topo; VERSAO_ATUAL deriva dela).
export const CHANGELOG: ChangelogEntry[] = [
  {
    versao: '0.11.3',
    data:   '2026-06-12',
    novidades: [
      'Correção: mais consultas ao histórico com coluna errada (tipo/acao em vez de tipo_acao) — timeline de auditoria do cliente, gráfico de churn no Financeiro e busca global voltaram a funcionar',
      'Correção: concluir tarefa vinculada a cliente agora registra no histórico (o insert falhava silencioso pela mesma coluna errada)',
    ],
  },
  {
    versao: '0.11.2',
    data:   '2026-06-12',
    novidades: [
      'Correção: detalhe do cliente não abria — o histórico era ordenado por uma coluna que não existe (data_acao); corrigido para created_at na página, na Gator e na API',
    ],
  },
  {
    versao: '0.11.1',
    data:   '2026-06-12',
    novidades: [
      'Correção: página Clientes quebrava ("checklist.filter is not a function") com clientes vindos do checkout Asaas — o webhook gravava o checklist do estágio como texto em vez de lista; corrigido o webhook, os registros existentes e a leitura agora tolera dados malformados',
    ],
  },
  {
    versao: '0.11.0',
    data:   '2026-06-12',
    novidades: [
      'Agendamentos configuráveis: horário (fuso de Brasília) e liga/desliga de cada job automático (sync analytics, briefing, import Asaas, alertas, cobrança) em Configurações → Automações → Agendamentos',
      'Dispatcher único de crons: roda a cada 30 min, executa cada job na primeira janela após o horário configurado, no máximo 1x por dia — sem precisar de deploy para mudar horário',
      'Gator sabe os horários: nova ferramenta listar_agendamentos responde quando e se cada job automático roda',
    ],
  },
  {
    versao: '0.10.0',
    data:   '2026-06-12',
    novidades: [
      'Central de Prontidão: aba Setup em Configurações mostra o que falta configurar (credenciais, crons, automações) com passo a passo e % de completude',
      'Banner "Sistema pronto: X%" no dashboard com atalho para completar o setup',
      'Gator sabe o que falta: nova ferramenta prontidao_sistema responde "o que falta configurar?" com o checklist ao vivo',
      'Templates de Tarefas e Processos: crie checklists reutilizáveis com prioridade e prazo em Configurações → Templates (setup-cliente e onboarding-cliente já vêm prontos e editáveis)',
      'Nova Tarefa a partir de template: dropdown no modal preenche título, checklist e prazo ({cliente} vira o nome do cliente)',
      'Gator cria tarefas de processo: ferramentas listar_templates_tarefa e criar_tarefa_de_template',
      'Provisionamento automático: cliente novo gera tarefa "Setup do cliente" com checklist de integrações nos 3 caminhos (formulário, importador e checkout Asaas)',
      'Retroativo: botão na aba Setup cria as tarefas de setup para clientes existentes sem IDs Google (idempotente)',
      'Empty states que guiam: widgets vazios por falta de configuração (Monitoramento, Saldo Google Ads, Timelines) agora explicam o motivo e linkam para o Setup',
      'Morning Briefing transparente: aviso discreto quando o texto vem do fallback por Vertex AI não configurado',
      'Briefing proativo: cron diário às 06:30 gera e salva o briefing antes de você acordar — o dashboard carrega instantâneo, com notificação "☀️ Briefing do dia pronto"',
      'Briefing mais rico: agora considera tarefas com prazo hoje e clientes com saldo Google baixo',
      'Templates de email personalizados: crie do zero (não só editar os 12 fixos), com preview e exclusão',
      'Gator envia emails: ferramentas listar_templates_email e enviar_email (com confirmação explícita), registradas em email_logs',
    ],
  },
  {
    versao: '0.9.0',
    data:   '2026-06-12',
    novidades: [
      'Gator: agente IA com acesso total — consulta e opera clientes, tarefas, financeiro, marketing e APIs por conversa (Ctrl+I em qualquer página)',
      'Conversas salvas: sessões com renomear, excluir e exportar .md',
      'Memória de longo prazo: ensine fatos ("lembre que…") e ela lembra para sempre',
      'Multimodal: envie prints e arquivos .md, dite por voz e ouça as respostas',
      'Autoconhecimento: a Gator conhece o próprio Hub, sugere melhorias e transforma ideias aprovadas em tasks',
    ],
  },
  {
    versao: '0.8.0',
    data:   '2026-06-11',
    novidades: [
      'Integração Asaas completa: cliente nasce automaticamente no checkout (assinatura ou compra única)',
      'Importador de clientes do Asaas com seleção individual',
      'Blindagem: verificação diária de inadimplência, webhook resiliente e monitoramento de eventos',
      'Auditoria de segurança e virada para produção: RLS owner-scoped e portal do cliente',
      'Status real das integrações: checks de Google Ads, Asaas, Vertex AI, GA4 e Resend',
    ],
  },
  {
    versao: '0.7.0',
    data:   '2026-06-06',
    novidades: [
      'Automações de email: relatório mensal, régua de cobrança e alertas críticos (toggles em Configurações)',
      'Templates de email editáveis',
      'Sync de Analytics: snapshots Google Ads + GA4 com cron diário às 06:00',
      'Política de inadimplência centralizada (D+7 / D+15 / D+30) em todo o sistema',
      'Auditoria geral: APIs destravadas, dados reais nos widgets e limpeza de código morto',
    ],
  },
  {
    versao: '0.6.0',
    data:   '2026-05-29',
    novidades: [
      'Dashboard com edit mode: arraste, redimensione e salve seu layout',
      'Novos módulos: Base de Conhecimento, Operacional, Portfólio e Prospectar (CRM)',
      'Autenticação SSR robusta com proteção automática de rotas',
      'AuditTimeline com filtros por tipo e ícones coloridos',
      'Design system unificado em todos os módulos',
    ],
  },
  {
    versao: '0.5.0',
    data:   '2026-05-25',
    novidades: [
      'Activity Feed: veja o que aconteceu nas últimas 24h no dashboard',
      'Health Score por cliente: score 0–100 visível nos cards',
      'Onboarding Wizard: guia de primeiro uso ao entrar no sistema',
      'Recomendações IA na Analytics: botão "Gerar Recomendações" por cliente',
      'Ações do Dia: botão "Criar Task" direto a partir das ações pendentes',
    ],
  },
  {
    versao: '0.4.0',
    data:   '2026-05-24',
    novidades: [
      'Memória do Cliente: arquivo .md editável com geração por IA',
      'FloatingChat: chat IA disponível em todas as páginas',
      'Middleware de autenticação: proteção automática de rotas',
      'TaskModal: sub-tasks com checklist e responsável por tarefa',
      'Modal de onboarding pós-criação de cliente com task automática',
    ],
  },
  {
    versao: '0.3.0',
    data:   '2026-05-20',
    novidades: [
      'ChecklistCard: comentários e lembretes por item de checklist',
      'Filtros avançados em Clientes: nicho, pagamento, batch select',
      'Financeiro: editar, duplicar e deletar lançamentos por linha',
      'Régua de cobrança: UI de configuração de triggers e templates',
      'Morning Briefing: filtros por modo (completo, urgências, resumido)',
    ],
  },
]

export const VERSAO_ATUAL = CHANGELOG[0].versao
