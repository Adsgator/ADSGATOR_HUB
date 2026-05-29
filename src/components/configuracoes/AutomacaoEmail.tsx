'use client'

import React, { useEffect, useState } from 'react'
import { Check, Clock, AlertCircle, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface AutomacaoItem {
  id: string
  tipo: string
  ativa: boolean
  descricao: string
  ultimo_envio: string | null
}

interface EmailLog {
  id: string
  cliente_id: string
  destinatario: string
  template_tipo: string
  assunto: string
  status: 'enviado' | 'falha' | 'pendente'
  created_at: string
}

interface ClienteInfo {
  id: string
  nome: string
}

export function AutomacaoEmail() {
  const [automacoes, setAutomacoes] = useState<AutomacaoItem[]>([])
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [clienteMap, setClienteMap] = useState<Record<string, ClienteInfo>>({})
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState<string | null>(null)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)
    try {
      const [autRes, logRes, clientRes] = await Promise.all([
        supabase.from('automation_settings').select('*').order('created_at'),
        supabase.from('email_logs').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('clientes').select('id, nome'),
      ])

      if (autRes.data) setAutomacoes(autRes.data as AutomacaoItem[])
      if (logRes.data) setEmailLogs(logRes.data as EmailLog[])
      if (clientRes.data) {
        const map = Object.fromEntries(clientRes.data.map((c) => [c.id, c]))
        setClienteMap(map)
      }
    } catch (err) {
      console.error('Erro ao carregar automações:', err)
    } finally {
      setCarregando(false)
    }
  }

  async function toggleAutomacao(id: string, novoEstado: boolean) {
    setAtualizando(id)
    try {
      const { error } = await supabase
        .from('automation_settings')
        .update({ ativa: novoEstado })
        .eq('id', id)

      if (error) throw error

      setAutomacoes((prev) =>
        prev.map((aut) => (aut.id === id ? { ...aut, ativa: novoEstado } : aut))
      )
    } catch (err) {
      console.error('Erro ao atualizar automação:', err)
    } finally {
      setAtualizando(null)
    }
  }

  function formatarData(data: string | null): string {
    if (!data) return 'Nunca'
    const d = new Date(data)
    return d.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function statusColor(status: string): string {
    switch (status) {
      case 'enviado':
        return 'text-status-green'
      case 'falha':
        return 'text-status-red'
      case 'pendente':
        return 'text-status-orange'
      default:
        return 'text-ink-secondary'
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-[12rem]">
        <p className="text-ink-secondary text-[0.875rem]">Carregando automações...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[2rem]">
      {/* SEÇÃO 1: AUTOMAÇÕES */}
      <div>
        <h3 className="text-ink-primary text-[1rem] font-semibold mb-[1rem] flex items-center gap-[0.5rem]">
          <Mail className="w-[1.125rem] h-[1.125rem]" strokeWidth={2} />
          Automações de Email
        </h3>
        <div className="space-y-[0.75rem]">
          {automacoes.length === 0 ? (
            <p className="text-ink-secondary text-[0.875rem]">Nenhuma automação configurada.</p>
          ) : (
            automacoes.map((aut) => (
              <div
                key={aut.id}
                className="flex items-start justify-between p-[1rem] bg-surface-card border border-surface-border rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-ink-primary text-[0.875rem] font-medium">{aut.tipo.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className="text-ink-secondary text-[0.75rem] mt-[0.25rem]">{aut.descricao}</p>
                  <p className="text-ink-muted text-[0.75rem] mt-[0.5rem] flex items-center gap-[0.25rem]">
                    <Clock className="w-[0.625rem] h-[0.625rem]" />
                    Último envio: {formatarData(aut.ultimo_envio)}
                  </p>
                </div>
                <button
                  onClick={() => toggleAutomacao(aut.id, !aut.ativa)}
                  disabled={atualizando === aut.id}
                  className={cn(
                    'relative w-[2.75rem] h-[1.5rem] rounded-full transition-colors flex-shrink-0 ml-[1rem]',
                    aut.ativa ? 'bg-ads-500' : 'bg-surface-hover border border-surface-border',
                    atualizando === aut.id && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-[0.1875rem] left-[0.1875rem] w-[1.125rem] h-[1.125rem] rounded-full bg-white shadow transition-transform',
                      aut.ativa && 'translate-x-[1.25rem]'
                    )}
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SEÇÃO 2: LOG DE EMAILS */}
      <div>
        <h3 className="text-ink-primary text-[1rem] font-semibold mb-[1rem] flex items-center gap-[0.5rem]">
          <Mail className="w-[1.125rem] h-[1.125rem]" strokeWidth={2} />
          Log de Emails (Últimos 10)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.875rem]">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="px-[1rem] py-[0.75rem] text-left text-ink-secondary font-medium">Cliente</th>
                <th className="px-[1rem] py-[0.75rem] text-left text-ink-secondary font-medium">Tipo</th>
                <th className="px-[1rem] py-[0.75rem] text-left text-ink-secondary font-medium">Email</th>
                <th className="px-[1rem] py-[0.75rem] text-left text-ink-secondary font-medium">Status</th>
                <th className="px-[1rem] py-[0.75rem] text-left text-ink-secondary font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {emailLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-[1rem] py-[1.5rem] text-center text-ink-secondary text-[0.75rem]">
                    Nenhum email registrado
                  </td>
                </tr>
              ) : (
                emailLogs.map((log) => (
                  <tr key={log.id} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                    <td className="px-[1rem] py-[0.75rem] text-ink-primary">
                      {clienteMap[log.cliente_id]?.nome || 'N/A'}
                    </td>
                    <td className="px-[1rem] py-[0.75rem] text-ink-secondary text-[0.75rem]">
                      {log.template_tipo}
                    </td>
                    <td className="px-[1rem] py-[0.75rem] text-ink-secondary text-[0.75rem] truncate">
                      {log.destinatario}
                    </td>
                    <td className="px-[1rem] py-[0.75rem]">
                      <span
                        className={cn(
                          'inline-flex items-center gap-[0.25rem] text-[0.75rem] font-medium',
                          statusColor(log.status)
                        )}
                      >
                        {log.status === 'enviado' && <Check className="w-[0.625rem] h-[0.625rem]" />}
                        {log.status === 'falha' && <AlertCircle className="w-[0.625rem] h-[0.625rem]" />}
                        {log.status === 'pendente' && <Clock className="w-[0.625rem] h-[0.625rem]" />}
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-[1rem] py-[0.75rem] text-ink-secondary text-[0.75rem]">
                      {formatarData(log.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
