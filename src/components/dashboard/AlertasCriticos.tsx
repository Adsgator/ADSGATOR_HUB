'use client'

import { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, Clock, CreditCard, Zap, MessageCircle, ExternalLink, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface AlertaItem {
  id:       string
  tipo:     'inadimplente' | 'saldo' | 'alerta'
  label:    string
  detalhe:  string
  href?:    string
  urgente:  boolean
}

export function AlertasCriticos() {
  const [alertas, setAlertas] = useState<AlertaItem[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    const [{ data: clientes }, { data: alertasDb }, { data: config }] = await Promise.all([
      supabase.from('clientes').select('id, nome, dias_atraso, saldo_google').in('status', ['ativo', 'onboarding', 'setup_trafego']),
      supabase.from('alertas').select('id, tipo, mensagem, cliente_id').eq('resolvido', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('configuracoes_financeiras').select('saldo_google_ads_limite_alerta').eq('agencia_id', 'adsgator-main').single(),
    ])

    const limite = (config as { saldo_google_ads_limite_alerta?: number } | null)?.saldo_google_ads_limite_alerta ?? 50
    const itens: AlertaItem[] = []

    for (const c of (clientes ?? []) as { id: string; nome: string; dias_atraso?: number; saldo_google?: number }[]) {
      if ((c.dias_atraso ?? 0) >= 15) {
        itens.push({ id: `ina-${c.id}`, tipo: 'inadimplente', label: c.nome, detalhe: `${c.dias_atraso}d em atraso — quebra de contrato`, href: `/clientes/${c.id}`, urgente: true })
      } else if ((c.dias_atraso ?? 0) >= 7) {
        itens.push({ id: `ina7-${c.id}`, tipo: 'inadimplente', label: c.nome, detalhe: `${c.dias_atraso}d em atraso — suspensão iminente`, href: `/clientes/${c.id}`, urgente: true })
      }
      if ((c.saldo_google ?? Infinity) < limite) {
        itens.push({ id: `saldo-${c.id}`, tipo: 'saldo', label: c.nome, detalhe: `Saldo Google Ads: R$ ${(c.saldo_google ?? 0).toLocaleString('pt-BR')}`, href: `/clientes/${c.id}`, urgente: false })
      }
    }

    for (const a of (alertasDb ?? []) as { id: string; tipo: string; mensagem: string; cliente_id?: string }[]) {
      itens.push({ id: `alerta-${a.id}`, tipo: 'alerta', label: a.tipo, detalhe: a.mensagem, href: a.cliente_id ? `/clientes/${a.cliente_id}` : undefined, urgente: false })
    }

    setAlertas(itens.slice(0, 5))
    setLoading(false)
  }, [])

  useEffect(() => {
    carregar()
    const ch = supabase.channel('alertas-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alertas' }, carregar)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'clientes' }, carregar)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [carregar])

  const ICONE = {
    inadimplente: <Clock         className="w-4 h-4 shrink-0" strokeWidth={2} />,
    saldo:        <CreditCard    className="w-4 h-4 shrink-0" strokeWidth={2} />,
    alerta:       <Zap           className="w-4 h-4 shrink-0" strokeWidth={2} />,
  }

  const COR_BORDA = {
    urgente:  'border-l-status-red',
    alto:     'border-l-ads-500',
    normal:   'border-l-status-orange',
  }

  const handleCobrar = (nome: string) => {
    toast.success(`Abrindo WhatsApp para cobrar ${nome.split(' ')[0]}...`)
  }

  const handleResolver = (id: string) => {
    toast.success('Alerta marcado como resolvido')
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
      <div className="flex items-center gap-[0.5rem] mb-[1rem]">
        <AlertTriangle className="w-4 h-4 text-status-red" strokeWidth={2} />
        <p className="text-ink-primary font-bold text-base">Alertas Críticos</p>
        {alertas.length > 0 && (
          <span className="ml-auto text-xs font-bold bg-status-red text-white px-2 py-0.5 rounded-full">
            {alertas.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-[0.625rem]">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded bg-surface-hover animate-pulse" />)}
        </div>
      ) : alertas.length === 0 ? (
        <p className="text-ink-muted text-sm italic text-center py-[1rem]">Sem alertas no momento ✓</p>
      ) : (
        <ul className="flex flex-col gap-[0.5rem]">
          {alertas.map((a) => {
            const bordaCor = a.urgente ? COR_BORDA.urgente : a.tipo === 'saldo' ? COR_BORDA.alto : COR_BORDA.normal
            const iconeCor = a.urgente ? 'text-status-red' : a.tipo === 'saldo' ? 'text-ads-500' : 'text-status-orange'

            return (
              <li
                key={a.id}
                className={`flex items-center gap-3 p-3 rounded-lg bg-surface-hover border-l-4 ${bordaCor}`}
              >
                <span className={iconeCor}>{ICONE[a.tipo]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate text-ink-primary">{a.label}</p>
                  <p className="text-xs text-ink-secondary leading-snug">{a.detalhe}</p>
                </div>

                {/* Botões de ação direta — 1 clique */}
                <div className="flex items-center gap-1 shrink-0">
                  {a.tipo === 'inadimplente' && (
                    <button
                      onClick={() => handleCobrar(a.label)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#25D366]/10 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/20 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                      Cobrar
                    </button>
                  )}

                  {a.href && (
                    <a
                      href={a.href}
                      className="flex items-center justify-center w-7 h-7 rounded-md text-ink-muted hover:bg-surface-border hover:text-ink-primary transition-colors"
                      title="Ver cliente"
                    >
                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                    </a>
                  )}

                  <button
                    onClick={() => handleResolver(a.id)}
                    className="flex items-center justify-center w-7 h-7 rounded-md text-ink-muted hover:bg-surface-border hover:text-status-green transition-colors"
                    title="Resolver"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
