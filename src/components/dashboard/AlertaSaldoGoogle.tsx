'use client'

import { useEffect, useState } from 'react'
import { CreditCard, AlertTriangle, TrendingDown, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { EmptyStateConfig } from './EmptyStateConfig'

interface SaldoAlert {
  cliente_id: string
  cliente_nome: string
  google_ads_customer_id: string
  saldo_atual: number
  ultimo_gasto_dia: number
  dias_restantes: number
  status: 'normal' | 'alerta' | 'critico'
  atualizado_em: string
}

interface AlertaSaldoGoogleProps {
  limiteDias?: number
}

export function AlertaSaldoGoogle({ limiteDias = 7 }: AlertaSaldoGoogleProps) {
  const [alertas, setAlertas] = useState<SaldoAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const [temClientesAds, setTemClientesAds] = useState(true)

  const carregarSaldos = async () => {
    try {
      // Buscar clientes com Google Ads ativado
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('id, nome, google_ads_customer_id, google_ads_enabled, saldo_google')
        .eq('google_ads_enabled', true)
        .not('google_ads_customer_id', 'is', null)

      if (error) throw error

      setTemClientesAds((clientes ?? []).length > 0)
      if (!clientes || clientes.length === 0) {
        setAlertas([])
        setLoading(false)
        return
      }

      // Buscar últimos snapshots para calcular gasto diário
      const alertasCalculados: SaldoAlert[] = await Promise.all(
        clientes.map(async (cliente) => {
          // Buscar últimos 3 snapshots para calcular média de gasto
          const { data: snapshots } = await supabase
            .from('analytics_snapshots')
            .select('investimento, created_at')
            .eq('cliente_id', cliente.id)
            .eq('fonte', 'google_ads')
            .order('created_at', { ascending: false })
            .limit(3)

          const saldoAtual = cliente.saldo_google || 0
          
          // Calcular gasto médio diário baseado nos últimos snapshots
          let gastoMedioDia = 0
          if (snapshots && snapshots.length >= 2) {
            const investimentos = snapshots.map(s => s.investimento || 0)
            const mediaInvestimento = investimentos.reduce((a, b) => a + b, 0) / investimentos.length
            // Assumindo período de 30 dias entre snapshots
            gastoMedioDia = mediaInvestimento / 30
          } else {
            // Fallback: estimativa conservadora de R$ 50/dia
            gastoMedioDia = 50
          }

          const diasRestantes = gastoMedioDia > 0 ? Math.floor(saldoAtual / gastoMedioDia) : 999
          
          let status: 'normal' | 'alerta' | 'critico' = 'normal'
          if (diasRestantes <= 3) status = 'critico'
          else if (diasRestantes <= limiteDias) status = 'alerta'

          return {
            cliente_id: cliente.id,
            cliente_nome: cliente.nome,
            google_ads_customer_id: cliente.google_ads_customer_id!,
            saldo_atual: saldoAtual,
            ultimo_gasto_dia: gastoMedioDia,
            dias_restantes: diasRestantes,
            status,
            atualizado_em: new Date().toISOString(),
          }
        })
      )

      // Filtrar apenas alertas (não mostrar normais)
      const apenasAlertas = alertasCalculados.filter(
        a => a.status === 'alerta' || a.status === 'critico'
      )

      setAlertas(apenasAlertas)
    } catch (error) {
      console.error('Erro ao carregar saldos:', error)
      toast.error('Erro ao verificar saldos Google Ads')
    } finally {
      setLoading(false)
    }
  }

  const atualizarSaldos = async () => {
    setAtualizando(true)
    await carregarSaldos()
    toast.success('Saldos atualizados!')
    setAtualizando(false)
  }

  useEffect(() => {
    carregarSaldos()
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(carregarSaldos, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [limiteDias])

  if (loading) {
    return (
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-surface-hover rounded" />
          <div className="h-4 bg-surface-hover rounded w-32" />
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-surface-hover rounded" />
        </div>
      </div>
    )
  }

  // Sem nenhum cliente com Google Ads conectado = falta de config, não "tudo ok"
  if (!temClientesAds) {
    return (
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow h-full">
        <EmptyStateConfig
          icon={CreditCard}
          titulo="Saldo Google Ads"
          motivo="Nenhum cliente com Google Ads conectado — preencha o customer ID e habilite a integração nos clientes para monitorar o saldo."
          compacto
        />
      </div>
    )
  }

  if (alertas.length === 0) {
    return (
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-status-green" strokeWidth={2} />
            <h3 className="font-semibold text-ink-primary">Saldo Google Ads</h3>
          </div>
          <button
            onClick={atualizarSaldos}
            disabled={atualizando}
            className="p-1 hover:bg-surface-hover rounded transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4 text-ink-muted", atualizando && "animate-spin")} strokeWidth={2} />
          </button>
        </div>
        <p className="text-sm text-ink-muted">Todos os saldos estão em dia ✓</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-status-red" strokeWidth={2} />
          <h3 className="font-semibold text-ink-primary">
            Alerta Saldo Google Ads
            <span className="ml-2 text-xs px-2 py-0.5 bg-status-red/10 text-status-red rounded-full">
              {alertas.length} cliente{alertas.length > 1 ? 's' : ''}
            </span>
          </h3>
        </div>
        <button
          onClick={atualizarSaldos}
          disabled={atualizando}
          className="flex items-center gap-1 px-2 py-1 text-xs text-ink-muted hover:text-ink-primary hover:bg-surface-hover rounded transition-colors"
        >
          {atualizando ? (
            <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
          ) : (
            <RefreshCw className="w-3 h-3" strokeWidth={2} />
          )}
          Atualizar
        </button>
      </div>

      <div className="divide-y divide-surface-border">
        {alertas.map((alerta) => (
          <div
            key={alerta.cliente_id}
            className={cn(
              'p-3 flex items-center justify-between',
              alerta.status === 'critico' ? 'bg-status-red/5' : 'bg-status-orange/5'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                alerta.status === 'critico' ? 'bg-status-red/10' : 'bg-status-orange/10'
              )}>
                {alerta.status === 'critico' ? (
                  <TrendingDown className="w-4 h-4 text-status-red" strokeWidth={2} />
                ) : (
                  <CreditCard className="w-4 h-4 text-status-orange" strokeWidth={2} />
                )}
              </div>
              <div>
                <p className="font-medium text-ink-primary text-sm">{alerta.cliente_nome}</p>
                <p className="text-xs text-ink-muted">
                  Customer ID: {alerta.google_ads_customer_id}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className={cn(
                'text-lg font-bold',
                alerta.status === 'critico' ? 'text-status-red' : 'text-status-orange'
              )}>
                {alerta.dias_restantes} dias
              </p>
              <p className="text-xs text-ink-muted">
                R$ {alerta.saldo_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-surface-hover/50 text-center">
        <a
          href="/clientes?filtro=saldo_baixo"
          className="text-xs text-ads-500 hover:text-ads-600 font-medium"
        >
          Ver todos os clientes →
        </a>
      </div>
    </div>
  )
}
