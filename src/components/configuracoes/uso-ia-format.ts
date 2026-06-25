// Helpers de formatação compartilhados pelas seções do painel de Uso da IA
// (UsoIA / UsoAnalytics). Em arquivo próprio para evitar dependência circular
// entre os dois componentes.

const CONTEXTO_LABEL: Record<string, string> = {
  agente:    'Assistente (chat)',
  chat:      'Completion (analytics/memória)',
  hashtags:  'Hashtags',
  briefing:  'Briefing matinal',
  copy:      'Copy de landing',
  relatorio: 'Análise de relatório',
}

export const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export function rotuloContexto(c: string): string {
  return CONTEXTO_LABEL[c] ?? c
}
