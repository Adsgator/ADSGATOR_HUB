'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle, AlertTriangle, Info, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  pendenciasDoCliente,
  filtrarIgnoradas,
  ignorarPendencia,
  type Pendencia,
  type PendenciaSeveridade,
} from '@/lib/pendencias'
import type { Cliente } from '@/lib/types'

/**
 * Banner de pendências no detalhe do cliente — mesma régua do modal do
 * dashboard (lib/pendencias.ts), mas focada NESTE cliente. "Resolver agora"
 * rola até a seção Integrações da própria página e a destaca; "Ignorar"
 * soneca por 7 dias (compartilhada com o modal — ignorou lá, some aqui).
 */

interface PendenciasClienteProps {
  cliente: Cliente
  /** Rola até a seção Integrações (aba visão geral) e a destaca */
  onIrParaIntegracoes: () => void
}

const SEV_ICON: Record<PendenciaSeveridade, { icon: typeof XCircle; cor: string }> = {
  erro:     { icon: XCircle,       cor: 'text-status-red' },
  pendente: { icon: AlertTriangle, cor: 'text-status-orange' },
  info:     { icon: Info,          cor: 'text-status-blue' },
}

export function PendenciasCliente({ cliente, onIrParaIntegracoes }: PendenciasClienteProps) {
  const router = useRouter()
  const [pendencias, setPendencias] = useState<Pendencia[]>([])

  // filtrarIgnoradas lê localStorage — só roda no client, depois de montar
  useEffect(() => {
    setPendencias(filtrarIgnoradas(pendenciasDoCliente(cliente)))
  }, [cliente])

  if (pendencias.length === 0) return null

  const temErro = pendencias.some((p) => p.severidade === 'erro')

  const resolver = (p: Pendencia) => {
    if (p.href.includes('foco=integracoes')) onIrParaIntegracoes()
    else router.push(p.href)
  }

  const ignorar = (p: Pendencia) => {
    ignorarPendencia(p.id)
    setPendencias((prev) => prev.filter((x) => x.id !== p.id))
  }

  return (
    <div className={cn(
      'rounded-xl border p-[1rem] mb-[1.5rem] animate-fade-up',
      temErro
        ? 'border-status-red/30 bg-status-red/5'
        : 'border-status-orange/30 bg-status-orange/5'
    )}>
      <p className="text-[0.8125rem] font-semibold text-ink-primary mb-[0.625rem] flex items-center gap-[0.375rem]">
        {temErro
          ? <XCircle className="w-[0.875rem] h-[0.875rem] text-status-red" strokeWidth={2} />
          : <AlertTriangle className="w-[0.875rem] h-[0.875rem] text-status-orange" strokeWidth={2} />}
        Pendência{pendencias.length === 1 ? '' : 's'} deste cliente ({pendencias.length})
      </p>

      <div className="space-y-[0.625rem]">
        {pendencias.map((p) => {
          const { icon: Icon, cor } = SEV_ICON[p.severidade]
          return (
            <div key={p.id} className="flex items-start gap-[0.5rem]">
              <Icon className={cn('w-[0.875rem] h-[0.875rem] mt-[0.1875rem] flex-shrink-0', cor)} strokeWidth={2} />
              <div className="min-w-0 flex-1">
                <p className="text-[0.8125rem] font-medium text-ink-primary">{p.titulo}</p>
                <p className="text-[0.75rem] text-ink-secondary mt-[0.125rem] leading-relaxed">{p.explicacao}</p>

                <details className="mt-[0.375rem] group">
                  <summary className="cursor-pointer text-[0.75rem] text-ads-500 font-medium list-none flex items-center gap-[0.25rem] select-none">
                    <ChevronRight className="w-[0.75rem] h-[0.75rem] transition-transform group-open:rotate-90" strokeWidth={2} />
                    Como resolver
                  </summary>
                  <ol className="mt-[0.25rem] ml-[1rem] space-y-[0.125rem] list-decimal text-[0.75rem] text-ink-secondary leading-relaxed">
                    {p.passos.map((passo, i) => <li key={i}>{passo}</li>)}
                  </ol>
                </details>

                <div className="flex items-center gap-[0.5rem] mt-[0.5rem]">
                  <button
                    onClick={() => resolver(p)}
                    className="px-[0.625rem] py-[0.25rem] rounded-lg bg-ads-500 text-white text-[0.75rem] font-medium hover:bg-ads-600 transition-colors"
                  >
                    Resolver agora →
                  </button>
                  <button
                    onClick={() => ignorar(p)}
                    className="px-[0.625rem] py-[0.25rem] rounded-lg text-[0.75rem] text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
                  >
                    Ignorar 7 dias
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
