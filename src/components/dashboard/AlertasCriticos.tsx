'use client'

import { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, Clock, CreditCard, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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
    inadimplente: <Clock       className="w-[0.875rem] h-[0.875rem] shrink-0" strokeWidth={2} />,
    saldo:        <CreditCard  className="w-[0.875rem] h-[0.875rem] shrink-0" strokeWidth={1.75} />,
    alerta:       <AlertTriangle className="w-[0.875rem] h-[0.875rem] shrink-0" strokeWidth={1.75} />,
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
      <div className="flex items-center gap-[0.5rem] mb-[1rem]">
        <AlertTriangle className="w-[0.875rem] h-[0.875rem] text-status-orange" strokeWidth={2} />
        <p className="text-ink-primary font-semibold text-[0.875rem]">Alertas Críticos</p>
        {alertas.length > 0 && (
          <span className="ml-auto text-[0.6875rem] font-semibold bg-status-red/15 text-status-red px-[0.375rem] py-[0.0625rem] rounded-full">
            {alertas.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-[0.625rem]">
          {[1, 2, 3].map((i) => <div key={i} className="h-[2.5rem] rounded bg-surface-hover animate-pulse" />)}
        </div>
      ) : alertas.length === 0 ? (
        <p className="text-ink-muted text-[0.8125rem] italic text-center py-[1rem]">Sem alertas no momento ✓</p>
      ) : (
        <ul className="flex flex-col gap-[0.5rem]">
          {alertas.map((a) => {
            const cor = a.urgente ? 'text-status-red bg-status-red/10' : 'text-status-orange bg-status-orange/10'
            const conteudo = (
              <div className={`flex items-start gap-[0.625rem] p-[0.625rem] rounded-lg ${cor}`}>
                <span className={a.urgente ? 'text-status-red' : 'text-status-orange'}>{ICONE[a.tipo]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.8125rem] font-semibold leading-tight truncate">{a.label}</p>
                  <p className="text-[0.75rem] opacity-80 leading-snug">{a.detalhe}</p>
                </div>
                {a.href && <ExternalLink className="w-[0.75rem] h-[0.75rem] shrink-0 opacity-60" strokeWidth={1.5} />}
              </div>
            )
            return (
              <li key={a.id}>
                {a.href ? <a href={a.href}>{conteudo}</a> : conteudo}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
