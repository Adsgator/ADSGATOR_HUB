'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, MessageCircle, CheckCircle, Bell, ExternalLink, CreditCard, Clock, PauseCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { estagioInadimplencia, statusInadimplencia } from '@/lib/cobranca'

type Severidade = 'critica' | 'atencao' | 'leve'
type TipoAlerta = 'inadimplencia' | 'saldo_baixo' | 'onboarding_parado' | 'congelado'

interface AlertaItem {
  id:           string
  tipo:         TipoAlerta
  clienteId:    string
  clienteNome:  string
  whatsapp:     string | null
  severidade:   Severidade
  titulo:       string
  detalhe:      string
  msgWhatsapp?: string
}

interface ClienteRow {
  id:                 string
  nome:               string
  status:             string
  dias_atraso:        number | null
  whatsapp:           string | null
  saldo_google:       number | null
  google_ads_enabled: boolean | null
  data_atualizacao:   string | null
  updated_at?:        string | null
}

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: string
  lida: boolean
  created_at: string
  link?: string
}

interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
}

const SALDO_MINIMO       = 200   // R$ — abaixo disso, alerta de saldo
const ONBOARDING_PARADO  = 5     // dias sem atualização em fase de entrada

const META: Record<TipoAlerta, { Icon: typeof Bell; cor: string; bg: string }> = {
  inadimplencia:     { Icon: AlertTriangle, cor: 'text-status-red',    bg: 'bg-status-red/10' },
  saldo_baixo:       { Icon: CreditCard,    cor: 'text-status-orange', bg: 'bg-status-orange/10' },
  onboarding_parado: { Icon: Clock,         cor: 'text-status-blue',   bg: 'bg-status-blue/10' },
  congelado:         { Icon: PauseCircle,   cor: 'text-ink-secondary', bg: 'bg-surface-hover' },
}

const ORDEM_SEV: Record<Severidade, number> = { critica: 0, atencao: 1, leve: 2 }

function diasDesde(iso: string | null | undefined): number | null {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

function construirAlertas(clientes: ClienteRow[]): AlertaItem[] {
  const alertas: AlertaItem[] = []
  const primeiroNome = (n: string) => n.split(' ')[0]

  for (const c of clientes) {
    const dias = c.dias_atraso ?? 0

    // 1 — Inadimplência
    if (dias > 0) {
      const estagio = estagioInadimplencia(dias)
      const status  = statusInadimplencia({ dias_atraso: dias })
      const severidade: Severidade =
        estagio === 'critico' || estagio === 'grave' ? 'critica' :
        estagio === 'suspensao' ? 'atencao' : 'leve'
      alertas.push({
        id: `inad-${c.id}`, tipo: 'inadimplencia', clienteId: c.id, clienteNome: c.nome,
        whatsapp: c.whatsapp, severidade,
        titulo: `${c.nome} — ${dias} dias em atraso`,
        detalhe: status.detalhe,
        msgWhatsapp: `Olá ${primeiroNome(c.nome)}! Passando para verificar sobre o pagamento em atraso (${dias} dias).`,
      })
    }

    // 2 — Saldo Google baixo
    if (c.google_ads_enabled && c.saldo_google != null && c.saldo_google < SALDO_MINIMO && c.status === 'ativo') {
      alertas.push({
        id: `saldo-${c.id}`, tipo: 'saldo_baixo', clienteId: c.id, clienteNome: c.nome,
        whatsapp: c.whatsapp, severidade: c.saldo_google <= 50 ? 'critica' : 'atencao',
        titulo: `${c.nome} — saldo Google baixo`,
        detalhe: `R$ ${(c.saldo_google).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} restantes`,
        msgWhatsapp: `Olá ${primeiroNome(c.nome)}! O saldo da sua conta Google Ads está baixo. Para evitar a pausa das campanhas, recomendo adicionar crédito.`,
      })
    }

    // 3 — Onboarding / setup parado
    if (['recebido', 'onboarding', 'setup_trafego'].includes(c.status)) {
      const parado = diasDesde(c.data_atualizacao ?? c.updated_at)
      if (parado != null && parado >= ONBOARDING_PARADO) {
        alertas.push({
          id: `onb-${c.id}`, tipo: 'onboarding_parado', clienteId: c.id, clienteNome: c.nome,
          whatsapp: c.whatsapp, severidade: parado >= 10 ? 'atencao' : 'leve',
          titulo: `${c.nome} — entrada parada`,
          detalhe: `${parado} dias sem avançar no onboarding`,
          msgWhatsapp: `Olá ${primeiroNome(c.nome)}! Tudo bem? Vamos dar andamento no seu onboarding? Ficou faltando algum material?`,
        })
      }
    }

    // 4 — Congelado aguardando retorno
    if (c.status === 'congelado') {
      alertas.push({
        id: `cong-${c.id}`, tipo: 'congelado', clienteId: c.id, clienteNome: c.nome,
        whatsapp: c.whatsapp, severidade: 'leve',
        titulo: `${c.nome} — congelado`,
        detalhe: 'Aguardando retorno do cliente',
        msgWhatsapp: `Olá ${primeiroNome(c.nome)}! Ainda aguardamos seu retorno para retomarmos o trabalho. 😊`,
      })
    }
  }

  return alertas.sort((a, b) => ORDEM_SEV[a.severidade] - ORDEM_SEV[b.severidade])
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const [alertas,       setAlertas]       = useState<AlertaItem[]>([])
  const [notificacoes,  setNotificacoes]  = useState<Notificacao[]>([])
  const [loading,       setLoading]       = useState(true)
  const [aba,           setAba]           = useState<'alertas' | 'notificacoes'>('alertas')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    Promise.all([
      supabase
        .from('clientes')
        .select('id, nome, status, dias_atraso, whatsapp, saldo_google, google_ads_enabled, data_atualizacao')
        .not('status', 'in', '(cancelado,cancelado_debito,inativo)'),
      supabase
        .from('notificacoes')
        .select('id, titulo, mensagem, tipo, lida, created_at, link')
        .order('created_at', { ascending: false })
        .limit(20),
    ]).then(([{ data: cl }, { data: nt }]) => {
      setAlertas(construirAlertas((cl ?? []) as ClienteRow[]))
      setNotificacoes((nt ?? []) as Notificacao[])
      setLoading(false)
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'panel-slide-in fixed right-[var(--right-sidebar-w)] top-0 bottom-0 z-[60]',
          'w-[20rem] flex flex-col',
          'bg-surface-card border-l border-surface-border',
          'shadow-2xl shadow-black/50',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[1.25rem] py-[1rem] border-b border-surface-border shrink-0">
          <h2 className="text-ink-primary font-semibold text-[0.9375rem]">Notificações</h2>
          <button
            onClick={onClose}
            className="w-[2rem] h-[2rem] flex items-center justify-center rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
          >
            <X className="w-[1rem] h-[1rem]" strokeWidth={1.75} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-surface-border shrink-0">
          {([
            { id: 'alertas',       label: 'Alertas',       count: alertas.length,     cor: 'text-status-red'   },
            { id: 'notificacoes',  label: 'Notificações',  count: notificacoes.filter((n) => !n.lida).length, cor: 'text-ads-500' },
          ] as const).map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-[0.375rem] h-[2.25rem] text-[0.8125rem] font-medium transition-colors border-b-2',
                aba === a.id
                  ? 'text-ink-primary border-ads-500'
                  : 'text-ink-muted border-transparent hover:text-ink-secondary',
              )}
            >
              {a.label}
              {a.count > 0 && (
                <span className={cn('text-[0.625rem] font-bold px-[0.375rem] rounded-full bg-surface-hover', a.cor)}>
                  {a.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-[0.75rem] space-y-[0.375rem]">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[4rem] rounded-lg skeleton-shimmer" />
            ))
          ) : aba === 'alertas' ? (
            alertas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-[4rem] gap-[0.75rem]">
                <CheckCircle className="w-[2.5rem] h-[2.5rem] text-status-green" strokeWidth={1.5} />
                <p className="text-[0.875rem] font-medium text-ink-secondary">Sem alertas no momento</p>
                <p className="text-ink-muted text-[0.75rem] text-center">Tudo sob controle na operação</p>
              </div>
            ) : (
              alertas.map((al) => {
                const { Icon, cor, bg } = META[al.tipo]
                return (
                  <div key={al.id} className="p-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40">
                    <div className="flex items-start gap-[0.625rem] mb-[0.5rem]">
                      <div className={cn('w-[1.75rem] h-[1.75rem] rounded-lg flex items-center justify-center shrink-0', bg)}>
                        <Icon className={cn('w-[0.875rem] h-[0.875rem]', cor)} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ink-primary text-[0.8125rem] font-semibold leading-snug">{al.titulo}</p>
                        <p className="text-ink-secondary text-[0.75rem] mt-[0.125rem]">{al.detalhe}</p>
                      </div>
                    </div>
                    <div className="flex gap-[0.375rem]">
                      {al.whatsapp && al.msgWhatsapp && (
                        <a
                          href={`https://wa.me/${al.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(al.msgWhatsapp)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-[0.25rem] h-[1.75rem] rounded-lg bg-[#25D366]/10 text-[#25D366] text-[0.75rem] font-medium hover:bg-[#25D366]/20 transition-colors"
                        >
                          <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                          WhatsApp
                        </a>
                      )}
                      <a
                        href={`/clientes/${al.clienteId}`}
                        className="flex-1 flex items-center justify-center gap-[0.25rem] h-[1.75rem] rounded-lg bg-surface-elevated text-ink-secondary text-[0.75rem] font-medium hover:text-ink-primary transition-colors"
                      >
                        <ExternalLink className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                        Ver cliente
                      </a>
                    </div>
                  </div>
                )
              })
            )
          ) : (
            notificacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-[4rem] gap-[0.75rem]">
                <Bell className="w-[2.5rem] h-[2.5rem] text-ink-muted" strokeWidth={1.5} />
                <p className="text-[0.875rem] font-medium text-ink-secondary">Sem notificações</p>
              </div>
            ) : (
              notificacoes.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'p-[0.75rem] rounded-lg border transition-colors',
                    n.lida
                      ? 'bg-surface-hover border-surface-border/30 opacity-60'
                      : 'bg-surface-card border-surface-border/60',
                  )}
                >
                  <div className="flex items-start justify-between gap-[0.5rem]">
                    <div className="flex-1 min-w-0">
                      <p className="text-ink-primary text-[0.8125rem] font-medium leading-snug">{n.titulo}</p>
                      <p className="text-ink-secondary text-[0.75rem] mt-[0.25rem] leading-snug">{n.mensagem}</p>
                    </div>
                    {!n.lida && <span className="w-[0.5rem] h-[0.5rem] rounded-full bg-ads-500 shrink-0 mt-[0.25rem]" />}
                  </div>
                  {n.link && (
                    <a href={n.link} className="mt-[0.5rem] flex items-center gap-[0.25rem] text-ads-500 text-[0.75rem] hover:underline">
                      <ExternalLink className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                      Ver detalhes
                    </a>
                  )}
                  <p className="text-ink-muted text-[0.625rem] mt-[0.375rem]">
                    {new Date(n.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-[0.75rem] border-t border-surface-border">
          <Link
            href="/clientes"
            className="flex items-center justify-center w-full h-[2rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] hover:text-ink-primary hover:border-ads-500/30 transition-colors"
          >
            Ver todos os clientes
          </Link>
        </div>
      </aside>
    </>
  )
}
