'use client'

import { useEffect, useState } from 'react'
import { User, Users, DollarSign, AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface StatusMetrics {
  userName: string
  mrr: number
  clientesAtivos: number
  alertas: number
  online: boolean
}

export function StatusBar() {
  const [metrics, setMetrics] = useState<StatusMetrics>({
    userName: '',
    mrr: 0,
    clientesAtivos: 0,
    alertas: 0,
    online: true,
  })

  useEffect(() => {
    async function fetchAll() {
      const [userRes, clientesRes, alertasRes, mrrRes] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('clientes')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'ativo'),
        supabase
          .from('clientes')
          .select('id', { count: 'exact', head: true })
          .gt('dias_atraso', 0),
        supabase
          .from('assinaturas')
          .select('valor_mensal')
          .eq('status', 'ativa'),
      ])

      const nome =
        userRes.data.user?.user_metadata?.nome ??
        userRes.data.user?.email?.split('@')[0] ??
        'Admin'

      const mrrTotal = (mrrRes.data ?? []).reduce(
        (sum, a) => sum + (a.valor_mensal ?? 0),
        0,
      )

      setMetrics({
        userName: nome,
        mrr: mrrTotal,
        clientesAtivos: clientesRes.count ?? 0,
        alertas: alertasRes.count ?? 0,
        online: true,
      })
    }

    fetchAll()

    function handleOnline() { setMetrics((m) => ({ ...m, online: true })) }
    function handleOffline() { setMetrics((m) => ({ ...m, online: false })) }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const fmtMrr = metrics.mrr.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  })

  return (
    <footer className="col-span-3 h-[var(--statusbar-h)] bg-surface-card border-t border-surface-border/20 flex items-center px-[1rem] gap-[0.75rem] text-[0.6875rem] select-none z-30">
      {/* ── ESQUERDA: Usuário ─────────────────────── */}
      <div className="flex items-center gap-[0.375rem] text-ink-secondary">
        <User className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
        <span>{metrics.userName}</span>
      </div>

      <div className="w-[1px] h-[0.75rem] bg-surface-border" />

      {/* ── CENTRO: Métricas ──────────────────────── */}
      <div className="flex-1 flex items-center justify-center gap-[1.25rem]">
        <div className="flex items-center gap-[0.375rem] text-ink-secondary">
          <DollarSign className="w-[0.75rem] h-[0.75rem] text-status-green" strokeWidth={1.75} />
          <span>MRR <strong className="text-ink-primary">{fmtMrr}</strong></span>
        </div>

        <div className="flex items-center gap-[0.375rem] text-ink-secondary">
          <Users className="w-[0.75rem] h-[0.75rem] text-status-blue" strokeWidth={1.75} />
          <span><strong className="text-ink-primary">{metrics.clientesAtivos}</strong> ativos</span>
        </div>

        {metrics.alertas > 0 && (
          <div className="flex items-center gap-[0.375rem] text-status-red">
            <AlertTriangle className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
            <span><strong>{metrics.alertas}</strong> alerta{metrics.alertas > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="w-[1px] h-[0.75rem] bg-surface-border" />

      {/* ── DIREITA: Status + Versão ──────────────── */}
      <div className="flex items-center gap-[0.75rem]">
        <div className="flex items-center gap-[0.25rem]">
          {metrics.online ? (
            <Wifi className="w-[0.75rem] h-[0.75rem] text-status-green" strokeWidth={1.75} />
          ) : (
            <WifiOff className="w-[0.75rem] h-[0.75rem] text-status-red" strokeWidth={1.75} />
          )}
          <span className={metrics.online ? 'text-status-green' : 'text-status-red'}>
            {metrics.online ? 'Online' : 'Offline'}
          </span>
        </div>
        <span className="text-ink-muted">v0.1.0</span>
      </div>
    </footer>
  )
}
