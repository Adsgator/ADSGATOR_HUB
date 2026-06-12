export interface ChangelogEntry {
  versao:   string
  data:     string  // YYYY-MM-DD
  novidades: string[]
}

// ⚠️ Mantenha em dia: toda feature visível ao usuário entra aqui no mesmo
// commit em que é entregue (nova entrada no topo; VERSAO_ATUAL deriva dela).
export const CHANGELOG: ChangelogEntry[] = [
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
