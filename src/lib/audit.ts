// ─── Audit Logger ─────────────────────────────────────────────────────────

import { supabase } from './supabase'

export type AuditAction =
  | 'cliente_created'
  | 'cliente_updated'
  | 'cliente_deleted'
  | 'cliente_status_changed'
  | 'estagio_advanced'
  | 'tarefa_created'
  | 'tarefa_updated'
  | 'tarefa_completed'
  | 'financeiro_lancamento'
  | 'config_updated'
  | 'login'
  | 'logout'
  | 'export_data'
  | 'integration_connected'
  | 'integration_disconnected'

export interface AuditLogEntry {
  id?: string
  user_id: string
  user_email?: string
  action: AuditAction
  resource_type: string
  resource_id?: string
  cliente_id?: string
  details: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at?: string
}

// Registrar evento de audit
export async function logAudit(entry: Omit<AuditLogEntry, 'id' | 'created_at'>) {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        ...entry,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Erro ao registrar audit:', error)
    }
  } catch (e) {
    console.error('Erro crítico no audit logger:', e)
  }
}

// Helper para log de alteração de cliente
export async function logClienteChange(
  userId: string,
  clienteId: string,
  action: AuditAction,
  changes: Record<string, { old: unknown; new: unknown }>,
  metadata?: Record<string, unknown>
) {
  await logAudit({
    user_id: userId,
    action,
    resource_type: 'cliente',
    resource_id: clienteId,
    cliente_id: clienteId,
    details: {
      changes,
      ...metadata,
    },
  })
}

// Helper para log de estágio
export async function logEstagioChange(
  userId: string,
  clienteId: string,
  estagioAnterior: string,
  estagioNovo: string,
  acaoLabel: string
) {
  await logAudit({
    user_id: userId,
    action: 'estagio_advanced',
    resource_type: 'estagio',
    cliente_id: clienteId,
    details: {
      estagio_anterior: estagioAnterior,
      estagio_novo: estagioNovo,
      acao_label: acaoLabel,
    },
  })
}

// Helper para log financeiro
export async function logFinanceiro(
  userId: string,
  lancamentoId: string,
  tipo: 'receita' | 'custo',
  valor: number,
  clienteId?: string
) {
  await logAudit({
    user_id: userId,
    action: 'financeiro_lancamento',
    resource_type: 'lancamento',
    resource_id: lancamentoId,
    cliente_id: clienteId,
    details: {
      tipo,
      valor,
    },
  })
}

// Buscar logs de audit (com filtros)
export async function fetchAuditLogs(filters?: {
  userId?: string
  clienteId?: string
  action?: AuditAction
  startDate?: string
  endDate?: string
  limit?: number
}) {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.userId) query = query.eq('user_id', filters.userId)
  if (filters?.clienteId) query = query.eq('cliente_id', filters.clienteId)
  if (filters?.action) query = query.eq('action', filters.action)
  if (filters?.startDate) query = query.gte('created_at', filters.startDate)
  if (filters?.endDate) query = query.lte('created_at', filters.endDate)
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query

  if (error) throw error
  return data as AuditLogEntry[]
}
