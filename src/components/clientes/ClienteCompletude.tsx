'use client'

import { useMemo, useState } from 'react'
import { Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { calcularCompletude, type BlocoResultado } from '@/lib/cliente-completude'
import type { Cliente } from '@/lib/types'

interface Props {
  cliente: Cliente
  /** Fatos fora da tabela clientes (memória .md, assinatura, tipo) */
  extra?: {
    temMemoria?: boolean
    temAssinaturaVinculada?: boolean
    tipoContratacao?: string | null
  }
}

/**
 * Mostra, de forma proativa, o quão completo está o cliente e o que falta
 * preencher — para Lucas não ficar "no escuro". Consome a régua única em
 * lib/cliente-completude.ts. Colapsado quando completo; aberto quando há
 * pendências (o sistema chama atenção sozinho).
 */
export function ClienteCompletude({ cliente, extra }: Props) {
  const resultado = useMemo(() => calcularCompletude(cliente, extra), [cliente, extra])
  const [aberto, setAberto] = useState(!resultado.completo)

  const corBarra =
    resultado.percent === 100 ? 'bg-status-green'
    : resultado.percent >= 60 ? 'bg-ads-500'
    : 'bg-status-orange'

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow">
      <button
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center gap-[0.875rem] text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[0.5rem] mb-[0.5rem]">
            <h3 className="text-ink-primary text-[0.9375rem] font-semibold">Completude do cadastro</h3>
            {resultado.completo ? (
              <span className="inline-flex items-center gap-[0.25rem] text-status-green text-[0.75rem] font-medium">
                <Check className="w-[0.875rem] h-[0.875rem]" strokeWidth={2.5} /> Completo
              </span>
            ) : (
              <span className="inline-flex items-center gap-[0.25rem] text-status-orange text-[0.75rem] font-medium">
                <AlertCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                {resultado.faltando.length} pendência{resultado.faltando.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-[0.625rem]">
            <div className="flex-1 h-[0.4rem] bg-surface-hover rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all', corBarra)} style={{ width: `${resultado.percent}%` }} />
            </div>
            <span className="text-ink-secondary text-[0.8125rem] font-semibold w-[2.5rem] text-right">{resultado.percent}%</span>
          </div>
        </div>
        {aberto
          ? <ChevronUp className="w-[1rem] h-[1rem] text-ink-muted shrink-0" strokeWidth={2} />
          : <ChevronDown className="w-[1rem] h-[1rem] text-ink-muted shrink-0" strokeWidth={2} />}
      </button>

      {aberto && (
        <div className="mt-[1.25rem] grid grid-cols-1 sm:grid-cols-2 gap-[1rem]">
          {resultado.blocos.map((bloco) => (
            <BlocoCard key={bloco.bloco} bloco={bloco} />
          ))}
        </div>
      )}
    </div>
  )
}

function BlocoCard({ bloco }: { bloco: BlocoResultado }) {
  return (
    <div className="rounded-lg border border-surface-border/60 bg-surface-hover/40 p-[0.875rem]">
      <div className="flex items-center justify-between mb-[0.625rem]">
        <p className="text-ink-primary text-[0.8125rem] font-semibold">{bloco.label}</p>
        <span className={cn(
          'text-[0.6875rem] font-medium px-[0.375rem] py-[0.0625rem] rounded-full',
          bloco.completo ? 'bg-status-green/10 text-status-green' : 'bg-surface-hover text-ink-muted',
        )}>
          {bloco.preenchidos}/{bloco.total}
        </span>
      </div>
      <ul className="space-y-[0.375rem]">
        {bloco.itens.map((item) => (
          <li key={item.id} className="flex items-center gap-[0.5rem] text-[0.8125rem]">
            {item.ok ? (
              <Check className="w-[0.8125rem] h-[0.8125rem] text-status-green shrink-0" strokeWidth={2.5} />
            ) : (
              <span className="w-[0.8125rem] h-[0.8125rem] rounded-full border border-status-orange/50 shrink-0" />
            )}
            <span className={item.ok ? 'text-ink-secondary' : 'text-ink-primary font-medium'}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
