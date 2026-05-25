export interface ChangelogEntry {
  versao:   string
  data:     string  // YYYY-MM-DD
  novidades: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
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
