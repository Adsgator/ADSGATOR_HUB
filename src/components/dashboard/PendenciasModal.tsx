'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ListTodo, X, XCircle, AlertTriangle, Info, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import {
  pendenciasDaCarteira,
  filtrarIgnoradas,
  ignorarPendencia,
  CAMPOS_PENDENCIAS,
  STATUS_COM_PENDENCIAS,
  type Pendencia,
  type PendenciaSeveridade,
} from '@/lib/pendencias'

/**
 * Modal de pendências — abre sozinho na tela inicial (1x por dia) quando há
 * pendência de integração/sync em algum cliente. Cada item explica o impacto,
 * ensina o passo a passo e tem dois caminhos: "Resolver agora" (leva direto ao
 * lugar, já com a seção destacada) ou "Ignorar 7 dias" (soneca — volta depois).
 * A mesma régua aparece no detalhe de cada cliente (PendenciasCliente).
 */

const VISTO_KEY = 'adsgator-pendencias-modal-visto'

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10)
}

const SEV_ICON: Record<PendenciaSeveridade, { icon: typeof XCircle; cor: string }> = {
  erro:     { icon: XCircle,       cor: 'text-status-red' },
  pendente: { icon: AlertTriangle, cor: 'text-status-orange' },
  info:     { icon: Info,          cor: 'text-status-blue' },
}

export function PendenciasModal() {
  const router = useRouter()
  const [pendencias, setPendencias] = useState<Pendencia[]>([])
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: clientes } = await supabase
        .from('clientes')
        .select(CAMPOS_PENDENCIAS)
        .eq('user_id', user.id)
        .in('status', [...STATUS_COM_PENDENCIAS])
      if (!clientes) return

      const ativas = filtrarIgnoradas(pendenciasDaCarteira(clientes))
      setPendencias(ativas)

      // Abre sozinho no máximo 1x por dia — nos outros acessos as pendências
      // seguem visíveis no widget Saúde do Sistema e na página do cliente.
      let vistoHoje = false
      try { vistoHoje = localStorage.getItem(VISTO_KEY) === hojeISO() } catch {}
      if (ativas.length > 0 && !vistoHoje) setAberto(true)
    })()
  }, [])

  const fechar = useCallback(() => {
    setAberto(false)
    try { localStorage.setItem(VISTO_KEY, hojeISO()) } catch {}
  }, [])

  useEffect(() => {
    if (!aberto) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [aberto, fechar])

  const resolver = (p: Pendencia) => {
    fechar()
    router.push(p.href)
  }

  const ignorar = (p: Pendencia) => {
    ignorarPendencia(p.id)
    setPendencias((prev) => {
      const restantes = prev.filter((x) => x.id !== p.id)
      if (restantes.length === 0) fechar()
      return restantes
    })
  }

  if (!aberto || pendencias.length === 0) return null

  const erros = pendencias.filter((p) => p.severidade === 'erro').length

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-[1rem]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={fechar} />

      <div className="relative w-full max-w-[36rem] max-h-[85vh] flex flex-col bg-surface-card border border-surface-border rounded-2xl shadow-2xl animate-fade-scale overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-[0.75rem] px-[1.25rem] py-[1rem] border-b border-surface-border">
          <div className="w-[2.25rem] h-[2.25rem] rounded-xl bg-ads-500/10 flex items-center justify-center flex-shrink-0">
            <ListTodo className="w-[1.125rem] h-[1.125rem] text-ads-500" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-ink-primary text-[0.9375rem] font-semibold">
              Pendências do sistema
            </h2>
            <p className="text-ink-muted text-[0.75rem]">
              {pendencias.length} pendência{pendencias.length === 1 ? '' : 's'}
              {erros > 0 && <span className="text-status-red font-medium"> · {erros} com erro</span>}
              {' '}— resolva agora ou ignore por 7 dias
            </p>
          </div>
          <button
            onClick={fechar}
            className="p-[0.375rem] rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
            title="Fechar (volta amanhã se continuar pendente)"
          >
            <X className="w-[1rem] h-[1rem]" strokeWidth={2} />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-[1.25rem] py-[0.75rem] space-y-[0.75rem]">
          {pendencias.map((p) => {
            const { icon: Icon, cor } = SEV_ICON[p.severidade]
            return (
              <div key={p.id} className="border border-surface-border rounded-xl p-[0.875rem] bg-surface-elevated/50">
                <div className="flex items-start gap-[0.5rem]">
                  <Icon className={cn('w-[1rem] h-[1rem] mt-[0.125rem] flex-shrink-0', cor)} strokeWidth={2} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.8125rem] text-ink-primary">
                      <span className="font-semibold">{p.clienteNome}</span>
                      <span className="text-ink-muted"> — </span>
                      <span className="font-medium">{p.titulo}</span>
                    </p>
                    <p className="text-[0.75rem] text-ink-secondary mt-[0.25rem] leading-relaxed">{p.explicacao}</p>

                    <details className="mt-[0.5rem] group">
                      <summary className="cursor-pointer text-[0.75rem] text-ads-500 font-medium list-none flex items-center gap-[0.25rem] select-none">
                        <ChevronRight className="w-[0.75rem] h-[0.75rem] transition-transform group-open:rotate-90" strokeWidth={2} />
                        Como resolver
                      </summary>
                      <ol className="mt-[0.375rem] ml-[1rem] space-y-[0.25rem] list-decimal text-[0.75rem] text-ink-secondary leading-relaxed">
                        {p.passos.map((passo, i) => <li key={i}>{passo}</li>)}
                      </ol>
                    </details>

                    <div className="flex items-center gap-[0.5rem] mt-[0.625rem]">
                      <button
                        onClick={() => resolver(p)}
                        className="px-[0.75rem] py-[0.3125rem] rounded-lg bg-ads-500 text-white text-[0.75rem] font-medium hover:bg-ads-600 transition-colors"
                      >
                        Resolver agora →
                      </button>
                      <button
                        onClick={() => ignorar(p)}
                        className="px-[0.75rem] py-[0.3125rem] rounded-lg text-[0.75rem] text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
                      >
                        Ignorar 7 dias
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-[1.25rem] py-[0.75rem] border-t border-surface-border bg-surface-hover/40">
          <Link
            href="/configuracoes?tab=setup"
            onClick={fechar}
            className="text-[0.75rem] text-ads-500 hover:text-ads-600 font-medium"
          >
            Checklist completo do sistema →
          </Link>
          <button
            onClick={fechar}
            className="px-[0.875rem] py-[0.375rem] rounded-lg border border-surface-border text-[0.75rem] text-ink-secondary hover:text-ink-primary hover:bg-surface-hover transition-colors"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  )
}
