'use client'

import { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, Clock, CreditCard, Zap, MessageCircle, ExternalLink, CheckCircle2, ClipboardList } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { estagioInadimplencia, diasAtrasoCliente } from '@/lib/cobranca'
import { ALERT_TYPES } from '@/lib/alert-types'
import { TaskModal } from '@/components/ui/TaskModal'
import { toast } from 'sonner'

interface AlertaItem {
  id:          string
  tipo:        'inadimplente' | 'saldo' | 'alerta'
  label:       string
  detalhe:     string
  href?:       string
  urgente:     boolean
  whatsapp?:   string
  alertaDbId?: string   // id real na tabela alertas (para resolver)
}

export function AlertasCriticos() {
  const [alertas,    setAlertas]    = useState<AlertaItem[]>([])
  const [loading,    setLoading]    = useState(true)
  const [taskAlerta, setTaskAlerta] = useState<{ titulo: string; descricao: string; clienteId?: string } | null>(null)

  const carregar = useCallback(async () => {
    const [{ data: clientes }, { data: alertasDb }, { data: config }] = await Promise.all([
      supabase.from('clientes').select('id, nome, dias_atraso, data_vencimento, saldo_google, whatsapp').in('status', ['ativo', 'onboarding', 'setup_trafego']),
      supabase.from('alertas').select('id, tipo, mensagem, cliente_id').eq('resolvido', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('configuracoes_financeiras').select('saldo_google_ads_limite_alerta').eq('agencia_id', 'adsgator-main').single(),
    ])

    const limite = (config as { saldo_google_ads_limite_alerta?: number } | null)?.saldo_google_ads_limite_alerta ?? 50
    const itens: AlertaItem[] = []

    for (const c of (clientes ?? []) as { id: string; nome: string; dias_atraso?: number; data_vencimento?: string | null; saldo_google?: number; whatsapp?: string }[]) {
      const dias = diasAtrasoCliente(c)
      const estagio = estagioInadimplencia(dias)
      if (estagio === 'grave' || estagio === 'critico') {
        itens.push({ id: `ina-${c.id}`, tipo: 'inadimplente', label: c.nome, detalhe: `${dias}d em atraso — quebra de contrato`, href: `/clientes/${c.id}`, urgente: true, whatsapp: c.whatsapp })
      } else if (estagio === 'suspensao') {
        itens.push({ id: `ina7-${c.id}`, tipo: 'inadimplente', label: c.nome, detalhe: `${dias}d em atraso — suspensão iminente`, href: `/clientes/${c.id}`, urgente: true, whatsapp: c.whatsapp })
      }
      if ((c.saldo_google ?? Infinity) < limite) {
        itens.push({ id: `saldo-${c.id}`, tipo: 'saldo', label: c.nome, detalhe: `Saldo Google Ads: R$ ${(c.saldo_google ?? 0).toLocaleString('pt-BR')}`, href: `/clientes/${c.id}`, urgente: false })
      }
    }

    for (const a of (alertasDb ?? []) as { id: string; tipo: string; mensagem: string; cliente_id?: string }[]) {
      const cfg = ALERT_TYPES[a.tipo]
      itens.push({
        id: `alerta-${a.id}`,
        tipo: 'alerta',
        label: cfg?.label ?? a.tipo,
        detalhe: a.mensagem || cfg?.description || '',
        href: a.cliente_id ? `/clientes/${a.cliente_id}` : undefined,
        urgente: cfg?.severity === 'critical',
        alertaDbId: a.id,
      })
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
    inadimplente: <Clock      className="w-[1rem] h-[1rem] shrink-0" strokeWidth={2} />,
    saldo:        <CreditCard className="w-[1rem] h-[1rem] shrink-0" strokeWidth={2} />,
    alerta:       <Zap        className="w-[1rem] h-[1rem] shrink-0" strokeWidth={2} />,
  }

  const COR_BORDA = {
    urgente: 'border-l-status-red',
    alto:    'border-l-ads-500',
    normal:  'border-l-status-orange',
  }

  async function handleResolver(alerta: AlertaItem) {
    // Para alertas com ID real na tabela alertas, marcar como resolvido
    if (alerta.alertaDbId) {
      const { error } = await supabase
        .from('alertas')
        .update({ resolvido: true })
        .eq('id', alerta.alertaDbId)
      if (error) { toast.error('Erro ao resolver alerta'); return }
    }
    // Remove da lista local imediatamente
    setAlertas((prev) => prev.filter((a) => a.id !== alerta.id))
    toast.success('Alerta resolvido!')
  }

  function handleWhatsApp(alerta: AlertaItem) {
    const numero = alerta.whatsapp?.replace(/\D/g, '')
    if (!numero) { toast.info('WhatsApp não cadastrado para este cliente'); return }
    const msg = encodeURIComponent(`Olá ${alerta.label.split(' ')[0]}, tudo bem? Passando para falar sobre a sua mensalidade em atraso. Podemos conversar?`)
    window.open(`https://wa.me/55${numero}?text=${msg}`, '_blank')
  }

  function handleCriarTask(alerta: AlertaItem) {
    const clienteId = alerta.href?.split('/clientes/')?.[1]
    setTaskAlerta({
      titulo:    `${alerta.tipo === 'inadimplente' ? 'Cobrar' : 'Verificar'}: ${alerta.label}`,
      descricao: alerta.detalhe,
      clienteId,
    })
  }

  return (
    <>
      <div className="p-[1.25rem] h-full flex flex-col">
        <div className="flex items-center gap-[0.5rem] mb-[1rem]">
          <AlertTriangle className="w-[1rem] h-[1rem] text-status-red" strokeWidth={2} />
          <p className="text-ink-primary font-bold text-base">Alertas Críticos</p>
          {alertas.length > 0 && (
            <span className="ml-auto text-xs font-bold bg-status-red text-white px-2 py-0.5 rounded-full">
              {alertas.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-[0.625rem]">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-lg bg-surface-hover skeleton-shimmer" />)}
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
                  className={`flex items-center gap-[0.75rem] p-[0.75rem] rounded-lg bg-surface-hover border-l-4 ${bordaCor}`}
                >
                  <span className={`${iconeCor} ${a.urgente ? 'animate-pulse' : ''}`}>{ICONE[a.tipo]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight truncate text-ink-primary">{a.label}</p>
                    <p className="text-xs text-ink-secondary leading-snug">{a.detalhe}</p>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex items-center gap-[0.25rem] shrink-0">
                    {(a.tipo === 'inadimplente' || a.whatsapp) && (
                      <button
                        onClick={() => handleWhatsApp(a)}
                        className="flex items-center gap-[0.25rem] px-[0.5rem] py-[0.25rem] rounded-md bg-[#25D366]/10 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/20 transition-colors"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                        <span className="hidden xl:inline">Cobrar</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCriarTask(a)}
                      className="flex items-center justify-center w-[1.75rem] h-[1.75rem] rounded-md text-ink-muted hover:bg-surface-elevated hover:text-ink-primary transition-colors"
                      title="Criar task"
                    >
                      <ClipboardList className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                    </button>

                    {a.href && (
                      <a
                        href={a.href}
                        className="flex items-center justify-center w-[1.75rem] h-[1.75rem] rounded-md text-ink-muted hover:bg-surface-elevated hover:text-ink-primary transition-colors"
                        title="Ver cliente"
                      >
                        <ExternalLink className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                      </a>
                    )}

                    <button
                      onClick={() => handleResolver(a)}
                      className="flex items-center justify-center w-[1.75rem] h-[1.75rem] rounded-md text-ink-muted hover:bg-surface-elevated hover:text-status-green transition-colors"
                      title="Marcar como resolvido"
                    >
                      <CheckCircle2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* TaskModal pré-preenchido */}
      {taskAlerta && (
        <TaskModal
          tarefa={{
            titulo:     taskAlerta.titulo,
            descricao:  taskAlerta.descricao,
            prioridade: 'alto',
            cliente_id: taskAlerta.clienteId,
          }}
          onClose={() => setTaskAlerta(null)}
          onSaved={() => { setTaskAlerta(null); toast.success('Task criada!') }}
        />
      )}
    </>
  )
}
