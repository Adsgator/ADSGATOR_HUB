'use client'

import { useEffect, useState } from 'react'
import { History, User, Building2, Calendar, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchAuditLogs, type AuditLogEntry } from '@/lib/audit'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

type AuditAction = AuditLogEntry['action']

const ACTION_LABELS: Record<AuditAction, { label: string; color: string }> = {
  'cliente_created': { label: 'Cliente Criado', color: 'text-status-green' },
  'cliente_updated': { label: 'Cliente Atualizado', color: 'text-ads-500' },
  'cliente_deleted': { label: 'Cliente Removido', color: 'text-status-red' },
  'cliente_status_changed': { label: 'Status Alterado', color: 'text-status-blue' },
  'estagio_advanced': { label: 'Estágio Avançado', color: 'text-status-purple' },
  'tarefa_created': { label: 'Tarefa Criada', color: 'text-status-green' },
  'tarefa_updated': { label: 'Tarefa Atualizada', color: 'text-ads-500' },
  'tarefa_completed': { label: 'Tarefa Concluída', color: 'text-status-green' },
  'financeiro_lancamento': { label: 'Lançamento Financeiro', color: 'text-status-orange' },
  'config_updated': { label: 'Configuração Alterada', color: 'text-ads-500' },
  'login': { label: 'Login', color: 'text-status-green' },
  'logout': { label: 'Logout', color: 'text-ink-muted' },
  'export_data': { label: 'Exportação de Dados', color: 'text-status-blue' },
  'integration_connected': { label: 'Integração Conectada', color: 'text-status-green' },
  'integration_disconnected': { label: 'Integração Desconectada', color: 'text-status-orange' },
}

interface Filters {
  action?: AuditAction
  clienteId?: string
  startDate?: string
  endDate?: string
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({})
  const [userRole, setUserRole] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const PAGE_SIZE = 20

  useEffect(() => {
    checkPermission()
  }, [])

  useEffect(() => {
    if (userRole && (userRole === 'admin' || userRole === 'manager')) {
      loadLogs()
    }
  }, [userRole, filters, page])

  const checkPermission = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    setUserRole(profile?.role || null)
  }

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await fetchAuditLogs({
        action: filters.action,
        clienteId: filters.clienteId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: PAGE_SIZE + 1,
      })

      setHasMore(data.length > PAGE_SIZE)
      setLogs(data.slice(0, PAGE_SIZE))
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
      toast.error('Erro ao carregar logs de auditoria')
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = ['Data', 'Usuário', 'Ação', 'Tipo', 'ID', 'Detalhes']
    const rows = logs.map(log => [
      new Date(log.created_at!).toLocaleString('pt-BR'),
      log.user_email || log.user_id,
      ACTION_LABELS[log.action]?.label || log.action,
      log.resource_type,
      log.resource_id || '-',
      JSON.stringify(log.details),
    ])

    const csv = [headers, ...rows].map(row => row.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (!userRole || (userRole !== 'admin' && userRole !== 'manager')) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-6">
        <div className="text-center">
          <History className="w-12 h-12 text-ink-muted mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-ink-primary mb-1">Acesso Restrito</h3>
          <p className="text-ink-muted text-sm">
            Apenas administradores e gerentes podem visualizar logs de auditoria.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-ads-500" strokeWidth={2} />
          <h3 className="font-semibold text-ink-primary">Logs de Auditoria</h3>
        </div>
        <button
          onClick={exportCSV}
          disabled={logs.length === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-hover rounded-md transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" strokeWidth={2} />
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="p-4 bg-surface-hover/30 border-b border-surface-border">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-ink-muted" strokeWidth={2} />
          <span className="text-sm text-ink-muted">Filtros</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.action || ''}
            onChange={(e) => setFilters({ ...filters, action: e.target.value as AuditAction || undefined })}
            className="px-3 py-1.5 text-sm bg-surface-base border border-surface-border rounded-md focus:outline-none focus:border-ads-500"
          >
            <option value="">Todas as ações</option>
            {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
            className="px-3 py-1.5 text-sm bg-surface-base border border-surface-border rounded-md focus:outline-none focus:border-ads-500"
            placeholder="Data início"
          />

          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
            className="px-3 py-1.5 text-sm bg-surface-base border border-surface-border rounded-md focus:outline-none focus:border-ads-500"
            placeholder="Data fim"
          />

          <button
            onClick={() => { setFilters({}); setPage(0) }}
            className="px-3 py-1.5 text-sm text-ink-muted hover:text-ink-primary transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Lista de logs */}
      <div className="divide-y divide-surface-border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-ads-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <History className="w-12 h-12 text-ink-muted mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-ink-muted">Nenhum log encontrado</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-surface-hover/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-ink-muted" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-primary">
                      <span className={cn('font-semibold', ACTION_LABELS[log.action]?.color || 'text-ink-primary')}>
                        {ACTION_LABELS[log.action]?.label || log.action}
                      </span>
                      {' '}por{' '}
                      <span className="text-ink-secondary">{log.user_email || log.user_id?.slice(0, 8)}</span>
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {log.resource_type}
                      {log.resource_id && ` · ${log.resource_id.slice(0, 8)}`}
                      {log.cliente_id && ` · Cliente: ${log.cliente_id.slice(0, 8)}`}
                    </p>
                    {Object.keys(log.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-ads-500 cursor-pointer hover:underline">
                          Ver detalhes
                        </summary>
                        <pre className="mt-2 p-2 bg-surface-hover rounded text-xs text-ink-secondary overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-ink-muted shrink-0">
                  <Calendar className="w-3 h-3" strokeWidth={2} />
                  {new Date(log.created_at!).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginação */}
      {!loading && logs.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t border-surface-border">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            Anterior
          </button>
          <span className="text-sm text-ink-muted">
            Página {page + 1}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!hasMore}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary disabled:opacity-50 transition-colors"
          >
            Próxima
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  )
}
