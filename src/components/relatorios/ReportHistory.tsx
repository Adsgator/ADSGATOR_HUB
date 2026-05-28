'use client'

import { useEffect, useState } from 'react'
import { Mail, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EmailHistory } from '@/lib/types/email'

interface ReportHistoryProps {
  clienteId?: string
}

const STATUS_CONFIG = {
  sent: { icon: CheckCircle2, color: 'text-status-green', label: 'Enviado' },
  failed: { icon: XCircle, color: 'text-status-red', label: 'Falhou' },
  bounced: { icon: XCircle, color: 'text-status-orange', label: 'Bounced' },
  pending: { icon: Clock, color: 'text-ink-muted', label: 'Pendente' },
}

export function ReportHistory({ clienteId }: ReportHistoryProps) {
  const [history, setHistory] = useState<EmailHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ limit: '20' })
        if (clienteId) params.set('clienteId', clienteId)
        const res = await fetch(`/api/v1/relatorios/email-history?${params}`)
        const json = await res.json()
        setHistory(json.data ?? [])
      } catch {
        // non-critical
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [clienteId])

  if (loading) {
    return (
      <div className="flex flex-col gap-[0.5rem]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[3rem] rounded-lg skeleton-shimmer" />
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[2rem] text-ink-muted gap-[0.5rem]">
        <Mail className="w-[1.75rem] h-[1.75rem]" strokeWidth={1} />
        <p className="text-[0.8125rem]">Nenhum email enviado</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[0.25rem]">
      {history.map(item => {
        const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending
        const Icon = cfg.icon
        return (
          <div key={item.id} className="flex items-center gap-[0.625rem] p-[0.625rem] rounded-lg hover:bg-surface-hover/50 transition-colors">
            <Icon className={cn('w-[0.875rem] h-[0.875rem] flex-shrink-0', cfg.color)} strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="text-[0.8125rem] text-ink-primary font-medium truncate">{item.assunto}</p>
              <p className="text-[0.625rem] text-ink-muted truncate">{item.destinatario}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={cn('text-[0.625rem] font-semibold', cfg.color)}>{cfg.label}</p>
              <p className="text-[0.5625rem] text-ink-muted">
                {new Date(item.enviado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
