'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { diasAtrasoCliente } from '@/lib/cobranca'
import type { Cliente, Assinatura } from '@/lib/types'

/**
 * Modal de cancelamento a pedido — fecha o ciclo em UM lugar: arquiva o
 * cliente no Hub e, se marcado, cancela recorrência + cobranças no Asaas
 * (POST /api/v1/regua/acao, acao cancelar_pedido). A opção de excluir as
 * cobranças VENCIDAS é separada e desmarcada por padrão: dívida real só se
 * apaga por decisão explícita do operador.
 */

interface CancelarClienteModalProps {
  cliente: Cliente
  assinatura: Assinatura | null
  aberto: boolean
  onFechar: () => void
  /** Chamado após sucesso — asaasCancelado indica se a recorrência foi removida lá */
  onCancelado: (info: { asaasCancelado: boolean }) => void
}

const STATUS_ASSINATURA_TERMINAL = ['cancelada', 'deletada', 'cancelado_debito']

export function CancelarClienteModal({ cliente, assinatura, aberto, onFechar, onCancelado }: CancelarClienteModalProps) {
  const assinaturaViva = !!assinatura && !STATUS_ASSINATURA_TERMINAL.includes(assinatura.status)
  const diasAtraso = diasAtrasoCliente(cliente)

  const [cancelarAsaas, setCancelarAsaas] = useState(assinaturaViva)
  const [excluirVencidas, setExcluirVencidas] = useState(false)
  const [enviando, setEnviando] = useState(false)

  // Reabre sempre com defaults seguros (Asaas marcado se há o que cancelar,
  // vencidas nunca marcadas por padrão)
  useEffect(() => {
    if (aberto) {
      setCancelarAsaas(assinaturaViva)
      setExcluirVencidas(false)
    }
  }, [aberto, assinaturaViva])

  if (!aberto) return null

  async function confirmar() {
    setEnviando(true)
    try {
      const res = await fetch('/api/v1/regua/acao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: cliente.id,
          acao: 'cancelar_pedido',
          opcoes: { cancelarAsaas, excluirVencidas: cancelarAsaas && excluirVencidas },
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error ?? 'Falha ao cancelar — nada foi alterado')
        return
      }
      const asaasCancelado = !!json.resultado?.assinaturaDeletada
      toast.success(asaasCancelado
        ? 'Cliente cancelado — recorrência e cobranças removidas no Asaas'
        : 'Cliente cancelado no Hub')
      onCancelado({ asaasCancelado })
    } catch {
      toast.error('Erro de rede ao cancelar — nada foi alterado')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-[1rem]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={enviando ? undefined : onFechar} />

      <div className="relative w-full max-w-[28rem] bg-surface-card border border-surface-border rounded-2xl shadow-2xl animate-fade-scale overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-[0.75rem] px-[1.25rem] py-[1rem] border-b border-surface-border">
          <div className="w-[2.25rem] h-[2.25rem] rounded-xl bg-status-red/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-[1.125rem] h-[1.125rem] text-status-red" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-ink-primary text-[0.9375rem] font-semibold truncate">Cancelar {cliente.nome}</h2>
            <p className="text-ink-muted text-[0.75rem]">Saída a pedido do cliente — não pode ser desfeito</p>
          </div>
          <button
            onClick={onFechar}
            disabled={enviando}
            className="p-[0.375rem] rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
          >
            <X className="w-[1rem] h-[1rem]" strokeWidth={2} />
          </button>
        </div>

        <div className="px-[1.25rem] py-[1rem] space-y-[0.875rem]">
          <p className="text-[0.8125rem] text-ink-secondary leading-relaxed">
            O cliente será arquivado como <span className="font-medium text-ink-primary">Cancelado a pedido</span> e
            sai automaticamente do MRR, do sync de analytics e dos alertas de verba.
          </p>

          {/* Opção Asaas */}
          <label className={cn(
            'flex items-start gap-[0.625rem] p-[0.75rem] rounded-xl border cursor-pointer transition-colors',
            !assinaturaViva && 'opacity-60 cursor-not-allowed',
            cancelarAsaas ? 'border-ads-500/40 bg-ads-500/5' : 'border-surface-border hover:bg-surface-hover'
          )}>
            <input
              type="checkbox"
              checked={cancelarAsaas}
              disabled={!assinaturaViva || enviando}
              onChange={(e) => setCancelarAsaas(e.target.checked)}
              className="mt-[0.125rem] accent-[#FFB100]"
            />
            <span className="text-[0.8125rem] leading-snug">
              <span className="font-medium text-ink-primary">Cancelar também no Asaas</span>
              <span className="block text-ink-muted text-[0.75rem] mt-[0.125rem]">
                {assinaturaViva
                  ? 'Remove a recorrência e as cobranças ainda não vencidas — sem risco de cobrança futura.'
                  : 'Sem assinatura ativa no Asaas — nada a cancelar lá.'}
              </span>
            </span>
          </label>

          {/* Opção vencidas — só faz sentido com a de cima marcada */}
          <label className={cn(
            'flex items-start gap-[0.625rem] p-[0.75rem] rounded-xl border cursor-pointer transition-colors ml-[1rem]',
            !cancelarAsaas && 'opacity-50 cursor-not-allowed',
            excluirVencidas && cancelarAsaas ? 'border-status-red/40 bg-status-red/5' : 'border-surface-border hover:bg-surface-hover'
          )}>
            <input
              type="checkbox"
              checked={cancelarAsaas && excluirVencidas}
              disabled={!cancelarAsaas || enviando}
              onChange={(e) => setExcluirVencidas(e.target.checked)}
              className="mt-[0.125rem] accent-[#ef4444]"
            />
            <span className="text-[0.8125rem] leading-snug">
              <span className="font-medium text-ink-primary">Excluir também as cobranças vencidas</span>
              <span className="block text-ink-muted text-[0.75rem] mt-[0.125rem]">
                Apaga dívida real. {diasAtraso > 0
                  ? `Este cliente está com ${diasAtraso}d de atraso — deixe desmarcado para manter a cobrança em aberto.`
                  : 'Deixe desmarcado se o cliente sair devendo.'}
              </span>
            </span>
          </label>

          <p className="text-[0.75rem] text-ink-muted leading-relaxed">
            Depois do cancelamento: desative o site (<code className="text-[0.6875rem]">/instalar-suspensao</code> no
            projeto) e pause as campanhas no Google Ads — essas etapas são manuais.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[0.5rem] px-[1.25rem] py-[0.75rem] border-t border-surface-border bg-surface-hover/40">
          <button
            onClick={onFechar}
            disabled={enviando}
            className="px-[0.875rem] py-[0.4375rem] rounded-lg border border-surface-border text-[0.8125rem] text-ink-secondary hover:text-ink-primary hover:bg-surface-hover transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={confirmar}
            disabled={enviando}
            className="flex items-center gap-[0.375rem] px-[0.875rem] py-[0.4375rem] rounded-lg bg-status-red text-white text-[0.8125rem] font-medium hover:bg-status-red/90 transition-colors disabled:opacity-60"
          >
            {enviando && <Loader2 className="w-[0.875rem] h-[0.875rem] animate-spin" strokeWidth={2} />}
            {enviando ? 'Cancelando…' : 'Confirmar cancelamento'}
          </button>
        </div>
      </div>
    </div>
  )
}
