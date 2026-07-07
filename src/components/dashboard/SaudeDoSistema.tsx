'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, Bot, RefreshCw, CheckCircle2, AlertTriangle, XCircle, CircleOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { CRON_LABELS, type CronTipo } from '@/lib/cron-settings'

/**
 * Saúde do Sistema — resposta permanente ao "o que está acontecendo e o que
 * está pendente", sem caçar em três telas:
 *  (a) Integrações por cliente — quem sincroniza OK, quem tem pendência de
 *      setup (ID faltando / toggle desligado / nunca sincronizou) e quem
 *      está com ERRO no último sync (clientes.ultimo_sync_*).
 *  (b) Rotinas do robô — os jobs do dispatcher com último run e status
 *      (cron_settings.ultimo_run via /api/v1/cron-settings).
 */

interface ClienteIntegra {
  id: string
  nome: string
  status: string
  google_ads_customer_id: string | null
  ga4_property_id: string | null
  google_ads_enabled: boolean | null
  ga4_enabled: boolean | null
  ultimo_sync_at: string | null
  ultimo_sync_status: string | null
  ultimo_sync_erro: string | null
}

interface CronRow {
  tipo: CronTipo
  nome: string | null
  ativo: boolean
  horario: string | null
  dia_semana: number | null
  ultimo_run: string | null
}

type SituacaoCliente = { cliente: ClienteIntegra; tipo: 'erro' | 'pendente'; motivo: string }

function classificar(c: ClienteIntegra): SituacaoCliente | null {
  if (c.ultimo_sync_status === 'erro' || c.ultimo_sync_status === 'parcial') {
    return { cliente: c, tipo: 'erro', motivo: c.ultimo_sync_erro ?? 'último sync falhou' }
  }
  const adsPend = !c.google_ads_customer_id || !c.google_ads_enabled
  const ga4Pend = !c.ga4_property_id || !c.ga4_enabled
  if (adsPend && ga4Pend) {
    return { cliente: c, tipo: 'pendente', motivo: 'integrações não configuradas' }
  }
  if (adsPend || ga4Pend) {
    const qual = adsPend ? 'Google Ads' : 'GA4'
    const causa = (adsPend ? c.google_ads_customer_id : c.ga4_property_id) ? 'desligado' : 'sem ID'
    return { cliente: c, tipo: 'pendente', motivo: `${qual} ${causa}` }
  }
  if (!c.ultimo_sync_at) {
    return { cliente: c, tipo: 'pendente', motivo: 'configurado, aguardando 1º sync' }
  }
  return null // sincronizando OK
}

/** "há 2h", "há 3d", "nunca" */
function idade(iso: string | null): string {
  if (!iso) return 'nunca'
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000)
  if (h < 1) return 'agora há pouco'
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)}d`
}

export function SaudeDoSistema() {
  const [clientes, setClientes] = useState<ClienteIntegra[]>([])
  const [crons, setCrons] = useState<CronRow[]>([])
  const [loading, setLoading] = useState(true)
  const [atualizando, setAtualizando] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const [{ data: cls }, cronRes] = await Promise.all([
        supabase
          .from('clientes')
          .select('id, nome, status, google_ads_customer_id, ga4_property_id, google_ads_enabled, ga4_enabled, ultimo_sync_at, ultimo_sync_status, ultimo_sync_erro')
          .in('status', ['ativo', 'onboarding', 'setup_trafego']),
        fetch('/api/v1/cron-settings').then((r) => (r.ok ? r.json() : { settings: [] })).catch(() => ({ settings: [] })),
      ])
      setClientes((cls ?? []) as ClienteIntegra[])
      setCrons(((cronRes as { settings?: CronRow[] }).settings ?? []) as CronRow[])
    } catch (error) {
      console.error('Erro ao carregar saúde do sistema:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
    const interval = setInterval(carregar, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [carregar])

  const atualizar = async () => {
    setAtualizando(true)
    await carregar()
    setAtualizando(false)
  }

  if (loading) {
    return (
      <div className="p-4 animate-pulse space-y-2">
        <div className="h-4 bg-surface-hover rounded w-40" />
        <div className="h-8 bg-surface-hover rounded" />
        <div className="h-8 bg-surface-hover rounded" />
      </div>
    )
  }

  const situacoes = clientes.map(classificar).filter(Boolean) as SituacaoCliente[]
  const comErro = situacoes.filter((s) => s.tipo === 'erro')
  const pendentes = situacoes.filter((s) => s.tipo === 'pendente')
  const oks = clientes.length - situacoes.length
  const problemas = [...comErro, ...pendentes].slice(0, 5)

  // Status de cada rotina: rodou dentro da janela esperada?
  const cronStatus = (c: CronRow): { cor: string; label: string } => {
    if (!c.ativo) return { cor: 'text-ink-muted', label: 'desligada' }
    if (!c.ultimo_run) return { cor: 'text-status-orange', label: 'nunca rodou' }
    const horas = (Date.now() - new Date(c.ultimo_run).getTime()) / 3_600_000
    const janela = c.dia_semana != null ? 8 * 24 : 26 // semanal: 8 dias; diário: 26h
    if (horas <= janela) return { cor: 'text-status-green', label: idade(c.ultimo_run) }
    return { cor: 'text-status-red', label: `atrasada (${idade(c.ultimo_run)})` }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-ads-500" strokeWidth={2} />
          <h3 className="font-semibold text-ink-primary">Saúde do Sistema</h3>
        </div>
        <button
          onClick={atualizar}
          disabled={atualizando}
          className="p-1 hover:bg-surface-hover rounded transition-colors"
        >
          <RefreshCw className={cn('w-4 h-4 text-ink-muted', atualizando && 'animate-spin')} strokeWidth={2} />
        </button>
      </div>

      <div className="px-4 pb-3 overflow-y-auto flex-1">
        {/* ── (a) Integrações por cliente ── */}
        <p className="text-2xs uppercase tracking-wider font-semibold text-ink-muted mb-1.5">Integrações Google</p>
        <div className="flex items-center gap-3 mb-2 text-sm">
          <span className="flex items-center gap-1 text-status-green">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} /> {oks} OK
          </span>
          <span className="flex items-center gap-1 text-status-orange">
            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} /> {pendentes.length} pendente{pendentes.length === 1 ? '' : 's'}
          </span>
          <span className="flex items-center gap-1 text-status-red">
            <XCircle className="w-3.5 h-3.5" strokeWidth={2} /> {comErro.length} com erro
          </span>
        </div>

        {problemas.length > 0 && (
          <div className="space-y-1 mb-3">
            {problemas.map(({ cliente, tipo, motivo }) => (
              <Link
                key={cliente.id}
                href={`/clientes/${cliente.id}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-hover transition-colors text-xs"
              >
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', tipo === 'erro' ? 'bg-status-red' : 'bg-status-orange')} />
                <span className="font-medium text-ink-primary truncate">{cliente.nome.split(' ').slice(0, 2).join(' ')}</span>
                <span className="text-ink-muted truncate flex-1">{motivo}</span>
              </Link>
            ))}
            {situacoes.length > problemas.length && (
              <p className="text-2xs text-ink-muted px-2">+ {situacoes.length - problemas.length} outro(s)</p>
            )}
          </div>
        )}

        {/* ── (b) Rotinas do robô ── */}
        <p className="text-2xs uppercase tracking-wider font-semibold text-ink-muted mb-1.5 flex items-center gap-1">
          <Bot className="w-3 h-3" strokeWidth={2} /> Rotinas do robô
        </p>
        {crons.length === 0 ? (
          <p className="text-xs text-ink-muted">Agendamentos não configurados (migration cron_settings pendente).</p>
        ) : (
          <div className="space-y-0.5">
            {crons.map((c) => {
              const st = cronStatus(c)
              return (
                <div key={c.tipo} className="flex items-center gap-2 text-xs py-0.5">
                  {c.ativo ? (
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0',
                      st.cor === 'text-status-green' ? 'bg-status-green'
                        : st.cor === 'text-status-red' ? 'bg-status-red' : 'bg-status-orange')} />
                  ) : (
                    <CircleOff className="w-2.5 h-2.5 text-ink-muted shrink-0" strokeWidth={2} />
                  )}
                  <span className="text-ink-secondary truncate flex-1">{c.nome ?? CRON_LABELS[c.tipo] ?? c.tipo}</span>
                  <span className={cn('shrink-0', st.cor)}>{st.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="p-3 bg-surface-hover/50 text-center border-t border-surface-border">
        <Link href="/configuracoes?tab=setup" className="text-xs text-ads-500 hover:text-ads-600 font-medium">
          Ver checklist de setup →
        </Link>
      </div>
    </div>
  )
}
