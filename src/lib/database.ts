import { supabase } from './supabase';
import type { Cliente, Estagio, HistoricoAcao, Assinatura, ChecklistItem } from './types';

// ============================================================
// CLIENTES
// ============================================================

export async function criarCliente(dados: Omit<Cliente, 'id' | 'user_id' | 'dias_atraso' | 'created_at' | 'updated_at' | 'data_criacao' | 'data_atualizacao'>) {
  const { data, error } = await supabase
    .from('clientes')
    .insert([{ ...dados, status: 'recebido' }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar cliente: ${error.message}`);

  // Criar estágio inicial
  await criarEstagio({
    cliente_id: data.id,
    nome:       'recebido',
    acao_label: 'Enviar mensagem de boas-vindas via WhatsApp com template #BOASVINDAS',
  });

  // Registrar no histórico
  await registrarHistorico(data.id, 'cliente_criado', `Cliente ${dados.nome} criado no sistema.`);

  return data as Cliente;
}

export async function obterCliente(clienteId: string): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', clienteId)
    .single();

  if (error) throw new Error(`Erro ao obter cliente: ${error.message}`);
  return data as Cliente;
}

export async function listarClientes(filtro?: { status?: string; nicho?: string }): Promise<Cliente[]> {
  let query = supabase.from('clientes').select('*');

  if (filtro?.status) query = query.eq('status', filtro.status);
  if (filtro?.nicho)  query = query.eq('nicho', filtro.nicho);

  const { data, error } = await query.order('data_criacao', { ascending: false });

  if (error) throw new Error(`Erro ao listar clientes: ${error.message}`);
  return (data ?? []) as Cliente[];
}

export async function atualizarCliente(clienteId: string, dados: Partial<Cliente>) {
  const { error } = await supabase
    .from('clientes')
    .update(dados)
    .eq('id', clienteId);

  if (error) throw new Error(`Erro ao atualizar cliente: ${error.message}`);
}

export async function avancarEstagio(clienteId: string, novoEstagio: string, acaoProxima: string) {
  // Finaliza o estágio atual
  const estagioAtivo = await obterEstagioAtivo(clienteId);
  if (estagioAtivo) {
    await supabase
      .from('estagios')
      .update({ ativo: false, concluido_em: new Date().toISOString() })
      .eq('id', estagioAtivo.id);
  }

  // Mapeia estágio → status do cliente
  const statusMap: Record<string, string> = {
    recebido:      'recebido',
    onboarding:    'onboarding',
    setup_trafego: 'setup_trafego',
    ativo:         'ativo',
    congelado:     'congelado',
    cancelado:     'cancelado',
    inativo:       'inativo',
  };

  const novoStatus = statusMap[novoEstagio] ?? novoEstagio;
  await atualizarCliente(clienteId, { status: novoStatus as Cliente['status'] });

  // Cria novo estágio
  const novoEsTagioData = await criarEstagio({
    cliente_id: clienteId,
    nome:       novoEstagio,
    acao_label: acaoProxima,
  });

  // Registra no histórico
  await registrarHistorico(
    clienteId,
    'avanco_estagio',
    `Cliente avançou para o estágio "${novoEstagio}". Próxima ação: ${acaoProxima}`,
  );

  return novoEsTagioData;
}

// ============================================================
// ESTAGIOS
// ============================================================

export async function criarEstagio(dados: {
  cliente_id:  string;
  nome:        string;
  acao_label?: string;
  descricao?:  string;
  acao_url?:   string;
  checklist?:  ChecklistItem[];
}): Promise<Estagio> {
  const { data, error } = await supabase
    .from('estagios')
    .insert([{ ...dados, ativo: true }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar estágio: ${error.message}`);
  return data as Estagio;
}

export async function obterEstagioAtivo(clienteId: string): Promise<Estagio | null> {
  const { data, error } = await supabase
    .from('estagios')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('ativo', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Erro ao obter estágio: ${error.message}`);
  return data as Estagio | null;
}

export async function congelarCliente(clienteId: string) {
  const estagioAtivo = await obterEstagioAtivo(clienteId);
  const estagioAnterior = estagioAtivo?.nome ?? 'desconhecido';

  await avancarEstagio(
    clienteId,
    'congelado',
    'Aguardando retorno do cliente. Alerta automático em 48h.',
  );

  // Registrar alerta de 48h na tabela alertas (sem setTimeout — processado por cron)
  const disparaEm = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await supabase.from('alertas').insert({
    cliente_id:   clienteId,
    tipo_alerta:  'pendencia_48h',
    mensagem:     `Cliente sem retorno há 48h. Estava no estágio "${estagioAnterior}". Reativar contato.`,
    dispara_em:   disparaEm.toISOString(),
    disparado:    false,
  });

  await registrarHistorico(
    clienteId,
    'cliente_congelado',
    'Cliente movido para "Retidos". Aguardando resposta. Alerta agendado para 48h.',
  );
}

export async function descongelarCliente(clienteId: string, estagioRetorno: string, acaoProxima: string) {
  // Cancelar alertas pendentes deste cliente
  await supabase
    .from('alertas')
    .update({ disparado: true, data_disparo: new Date().toISOString() })
    .eq('cliente_id', clienteId)
    .eq('tipo_alerta', 'pendencia_48h')
    .eq('disparado', false);

  await avancarEstagio(clienteId, estagioRetorno, acaoProxima);
  await registrarHistorico(clienteId, 'cliente_descongelado', `Cliente descongelado. Retornando ao estágio "${estagioRetorno}".`);
}

// ============================================================
// HISTORICO
// ============================================================

export async function registrarHistorico(
  clienteId:      string,
  tipoAcao:       string,
  descricao:      string,
  valorImpactado?: number,
  metadata?:       Record<string, unknown>,
) {
  const { error } = await supabase.from('historico_acoes').insert({
    cliente_id:      clienteId,
    tipo_acao:       tipoAcao,
    descricao,
    valor_impactado: valorImpactado ?? null,
    metadata:        metadata ?? {},
  });

  if (error) console.error(`[Histórico] Erro ao registrar: ${error.message}`);
}

export async function obterHistoricoCliente(clienteId: string): Promise<HistoricoAcao[]> {
  const { data, error } = await supabase
    .from('historico_acoes')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('data_acao', { ascending: false })
    .limit(50);

  if (error) throw new Error(`Erro ao obter histórico: ${error.message}`);
  return (data ?? []) as HistoricoAcao[];
}

// ============================================================
// ASSINATURAS
// ============================================================

export async function criarAssinatura(dados: {
  cliente_id:              string;
  plano_nome:              string;
  valor_mensal:            number;
  asaas_subscription_id?:  string;
}): Promise<Assinatura> {
  const dataProximaCobranca = new Date();
  dataProximaCobranca.setMonth(dataProximaCobranca.getMonth() + 1);

  const { data, error } = await supabase
    .from('assinaturas')
    .insert([{
      ...dados,
      status: 'ativa',
      dias_atraso: 0,
      data_inicio: new Date().toISOString(),
      data_proxima_cobranca: dataProximaCobranca.toISOString(),
    }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar assinatura: ${error.message}`);

  await registrarHistorico(
    dados.cliente_id,
    'assinatura_criada',
    `Assinatura "${dados.plano_nome}" criada. Valor: R$ ${dados.valor_mensal.toFixed(2)}/mês.`,
    dados.valor_mensal,
  );

  return data as Assinatura;
}

export async function obterAssinaturaCliente(clienteId: string): Promise<Assinatura | null> {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('*')
    .eq('cliente_id', clienteId)
    .maybeSingle();

  if (error) throw new Error(`Erro ao obter assinatura: ${error.message}`);
  return data as Assinatura | null;
}

// ============================================================
// ONBOARD PROGRESSO
// ============================================================

export async function obterProgressoOnboard(clienteId: string): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from('onboard_progresso')
    .select('progresso')
    .eq('cliente_id', clienteId)
    .maybeSingle();

  if (error) throw new Error(`Erro ao obter progresso: ${error.message}`);
  return (data?.progresso ?? {}) as Record<string, boolean>;
}

export async function salvarProgressoOnboard(
  clienteId: string,
  progresso: Record<string, boolean>,
) {
  const { error } = await supabase
    .from('onboard_progresso')
    .upsert({ cliente_id: clienteId, progresso })
    .eq('cliente_id', clienteId);

  if (error) throw new Error(`Erro ao salvar progresso: ${error.message}`);
}

// ============================================================
// ALERTAS
// ============================================================

export async function obterAlertasPendentes(clienteId?: string) {
  let query = supabase
    .from('alertas')
    .select('*, clientes(id, nome, whatsapp)')
    .eq('disparado', false)
    .lte('dispara_em', new Date().toISOString())
    .order('dispara_em', { ascending: true });

  if (clienteId) query = query.eq('cliente_id', clienteId);

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao obter alertas: ${error.message}`);
  return data ?? [];
}
