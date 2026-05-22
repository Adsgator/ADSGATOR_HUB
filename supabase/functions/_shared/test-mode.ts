// MODO DE TESTE - CONFIGURAÇÃO GLOBAL
// ATENÇÃO: Quando TEST_MODE = true, nenhum dado real deve ser enviado a clientes

export const TEST_MODE = true; // ← ALTERAR PARA false PARA VOLTAR AO MODO PRODUÇÃO

// Configurações de teste
export const TEST_CONFIG = {
  // Email para testes (todos os emails vão para este endereço)
  testEmail: 'lucasapsimoes@gmail.com', // ← ALTERAR PARA SEU EMAIL
  
  // WhatsApp para testes (todos os links de WhatsApp usam este número)
  testWhatsApp: '5519998281506', // ← ALTERAR PARA SEU NÚMERO COM DDD
  
  // Nome do teste (aparece em notificações)
  testPrefixo: '[TESTE]',
  
  // Logs detalhados
  verboseLogging: true,
} as const;

// Helper para log de modo de teste
export function logTest(label: string, data?: unknown): void {
  if (TEST_MODE) {
    console.log(`[🧪 TEST_MODE] ${label}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

// Helper para verificar se deve processar em modo de teste
export function shouldProcessInTestMode(operation: 'webhook' | 'email' | 'whatsapp' | 'asaas'): boolean {
  if (!TEST_MODE) return true;
  
  // Em modo de teste, permitimos processar mas com dados mockados
  logTest(`Operação ${operation} executada em modo de teste`);
  return true;
}

// Helper para mascarar dados sensíveis em logs
export function maskSensitive(data: string): string {
  if (data.length <= 8) return '***';
  return data.slice(0, 4) + '****' + data.slice(-4);
}
