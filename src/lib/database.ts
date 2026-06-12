import { supabase } from './supabase';
import type { Cliente, Estagio, HistoricoAcao, Assinatura, ChecklistItem } from './types';
import type { TimelineTemplate, TimelineInstance, TimelineAlert, TimelineAlertHistory } from './types/timeline';
import type { EmailHistory } from './types/email';

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

// Checklist é JSONB, mas já houve gravação dupla-encodada (string JSON) pelo
// webhook-asaas. Normaliza na leitura para nenhum consumidor quebrar com .filter/.map.
export function normalizarChecklistEstagio(estagio: Estagio | null): Estagio | null {
  if (!estagio || estagio.checklist == null) return estagio;
  if (Array.isArray(estagio.checklist)) return estagio;
  if (typeof estagio.checklist === 'string') {
    try {
      const parsed = JSON.parse(estagio.checklist);
      return { ...estagio, checklist: Array.isArray(parsed) ? parsed : undefined };
    } catch {
      return { ...estagio, checklist: undefined };
    }
  }
  return { ...estagio, checklist: undefined };
}

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
  return normalizarChecklistEstagio(data as Estagio | null);
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
    .order('created_at', { ascending: false })
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

// ============================================================
// DASHBOARD LAYOUTS
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Layouts = Record<string, any[]>

export async function carregarDashboardLayout(userId: string): Promise<Layouts | null> {
  const { data, error } = await supabase
    .from('configuracoes_usuario')
    .select('preferencias')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error(`[Dashboard] Erro ao carregar layout: ${error.message}`);
    return null;
  }

  return (data?.preferencias as any)?.dashboard_layouts ?? null;
}

export async function salvarDashboardLayout(userId: string, layouts: Layouts): Promise<void> {
  const { data } = await supabase
    .from('configuracoes_usuario')
    .select('preferencias')
    .eq('user_id', userId)
    .maybeSingle();

  const prefAtual = (data?.preferencias as Record<string, unknown>) ?? {};
  const { error } = await supabase
    .from('configuracoes_usuario')
    .upsert(
      { user_id: userId, preferencias: { ...prefAtual, dashboard_layouts: layouts } },
      { onConflict: 'user_id' }
    );

  if (error) throw new Error(`Erro ao salvar layout do dashboard: ${error.message}`);
}

// ============================================================
// TIMELINE TEMPLATES
// ============================================================

export async function listarTimelineTemplates(type?: string): Promise<TimelineTemplate[]> {
  let query = supabase.from('timeline_templates').select('*').eq('is_active', true);
  if (type) query = query.eq('type', type);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(`Erro ao listar templates: ${error.message}`);
  return (data ?? []) as TimelineTemplate[];
}

export async function obterTimelineTemplate(id: string): Promise<TimelineTemplate> {
  const { data, error } = await supabase
    .from('timeline_templates')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(`Erro ao obter template: ${error.message}`);
  return data as TimelineTemplate;
}

export async function criarTimelineTemplate(dados: Partial<TimelineTemplate>): Promise<TimelineTemplate> {
  const { data, error } = await supabase
    .from('timeline_templates')
    .insert([dados])
    .select()
    .single();
  if (error) throw new Error(`Erro ao criar template: ${error.message}`);
  return data as TimelineTemplate;
}

export async function atualizarTimelineTemplate(id: string, dados: Partial<TimelineTemplate>): Promise<void> {
  const { error } = await supabase
    .from('timeline_templates')
    .update(dados)
    .eq('id', id);
  if (error) throw new Error(`Erro ao atualizar template: ${error.message}`);
}

export async function deletarTimelineTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('timeline_templates')
    .delete()
    .eq('id', id);
  if (error) throw new Error(`Erro ao deletar template: ${error.message}`);
}

// ============================================================
// TIMELINE INSTANCES
// ============================================================

export async function listarTimelineInstances(clienteId?: string, type?: string): Promise<TimelineInstance[]> {
  let query = supabase
    .from('timeline_instances')
    .select('*, template:timeline_templates(*)')
    .neq('status', 'archived');

  if (clienteId) query = query.eq('client_id', clienteId);
  if (type) query = query.eq('type', type);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(`Erro ao listar instâncias: ${error.message}`);
  return (data ?? []) as TimelineInstance[];
}

export async function obterTimelineInstance(id: string): Promise<TimelineInstance> {
  const { data, error } = await supabase
    .from('timeline_instances')
    .select('*, template:timeline_templates(*)')
    .eq('id', id)
    .single();
  if (error) throw new Error(`Erro ao obter instância: ${error.message}`);
  return data as TimelineInstance;
}

export async function criarTimelineInstance(dados: Partial<TimelineInstance>): Promise<TimelineInstance> {
  const { data, error } = await supabase
    .from('timeline_instances')
    .insert([dados])
    .select()
    .single();
  if (error) throw new Error(`Erro ao criar instância: ${error.message}`);
  return data as TimelineInstance;
}

export async function atualizarTimelineInstance(id: string, dados: Partial<TimelineInstance>): Promise<TimelineInstance> {
  const { data, error } = await supabase
    .from('timeline_instances')
    .update(dados)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`Erro ao atualizar instância: ${error.message}`);
  return data as TimelineInstance;
}

// ============================================================
// TIMELINE ALERTS
// ============================================================

export async function listarTimelineAlerts(clienteId?: string): Promise<TimelineAlert[]> {
  let query = supabase.from('timeline_alerts').select('*').eq('enabled', true);
  if (clienteId) {
    query = query.or(`client_id.eq.${clienteId},client_id.is.null`);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(`Erro ao listar alertas: ${error.message}`);
  return (data ?? []) as TimelineAlert[];
}

export async function criarTimelineAlert(dados: Partial<TimelineAlert>): Promise<TimelineAlert> {
  const { data, error } = await supabase
    .from('timeline_alerts')
    .insert([dados])
    .select()
    .single();
  if (error) throw new Error(`Erro ao criar alerta: ${error.message}`);
  return data as TimelineAlert;
}

export async function listarAlertHistory(clienteId?: string, limit = 50): Promise<TimelineAlertHistory[]> {
  let query = supabase
    .from('timeline_alert_history')
    .select('*')
    .order('triggered_at', { ascending: false })
    .limit(limit);

  if (clienteId) query = query.eq('client_id', clienteId);

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao listar histórico de alertas: ${error.message}`);
  return (data ?? []) as TimelineAlertHistory[];
}

export async function acknowledgeAlert(historyId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('timeline_alert_history')
    .update({ acknowledged_at: new Date().toISOString(), acknowledged_by: userId })
    .eq('id', historyId);
  if (error) throw new Error(`Erro ao confirmar alerta: ${error.message}`);
}

// ============================================================
// EMAIL HISTORY
// ============================================================

export async function listarEmailHistory(clienteId?: string, limit = 50): Promise<EmailHistory[]> {
  let query = supabase
    .from('email_history')
    .select('*')
    .order('enviado_em', { ascending: false })
    .limit(limit);

  if (clienteId) query = query.eq('cliente_id', clienteId);

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao listar histórico de emails: ${error.message}`);
  return (data ?? []) as EmailHistory[];
}

export async function registrarEmailHistory(dados: Omit<EmailHistory, 'id' | 'enviado_em'>): Promise<EmailHistory> {
  const { data, error } = await supabase
    .from('email_history')
    .insert([dados])
    .select()
    .single();
  if (error) throw new Error(`Erro ao registrar email: ${error.message}`);
  return data as EmailHistory;
}
