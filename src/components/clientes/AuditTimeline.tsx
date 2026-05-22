'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AuditLog {
  id:         string
  acao:       string
  descricao?: string
  created_at: string
}

export function AuditTimeline({ clienteId }: { clienteId: string }) {
  const supabase = createClient()
  const [logs, setLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    supabase
      .from('audit_logs')
      .select('id, acao, descricao, created_at')
      .eq('registro_id', clienteId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setLogs(data ?? []))
  }, [clienteId])

  if (logs.length === 0) return null

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
      <div className="flex items-center gap-[0.5rem] mb-[1rem]">
        <Clock className="w-[1rem] h-[1rem] text-ink-muted" strokeWidth={1.75} />
        <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Histórico</h3>
      </div>
      <div className="relative">
        <div className="absolute left-[0.4375rem] top-0 bottom-0 w-px bg-surface-border" />
        <ul className="space-y-[1rem]">
          {logs.map((log) => (
            <li key={log.id} className="flex gap-[1rem] pl-[1.25rem] relative">
              <div className="absolute left-0 top-[0.1875rem] w-[0.875rem] h-[0.875rem] rounded-full bg-surface-card border-2 border-surface-border" />
              <div>
                <p className="text-ink-secondary text-[0.875rem]">
                  {log.descricao ?? log.acao}
                </p>
                <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
