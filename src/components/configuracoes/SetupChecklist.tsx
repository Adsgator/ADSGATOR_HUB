'use client'

// Central de Prontidão — aba Setup em Configurações.
// Renderiza o checklist computado por /api/setup-checklist: o que falta
// configurar, como resolver (passos expandíveis) e ação direta por item.

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ChevronDown, CircleDashed, RefreshCw, Wrench, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { useConfirmDialogStore } from '@/lib/hooks/useConfirmDialog'
import type { SetupChecklistResult, SetupItem } from '@/lib/setup-checklist'

export function SetupChecklist({ onAbrirAba }: { onAbrirAba?: (aba: string) => void }) {
  const [data, setData]             = useState<SetupChecklistResult | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [reverificando, setReverificando] = useState(false)
  const [aberto, setAberto]         = useState<string | null>(null)
  const [provisionando, setProvisionando] = useState(false)

  const carregar = useCallback(async (fresh = false) => {
    try {
      const res = await fetch(`/api/setup-checklist${fresh ? '?fresh=1' : ''}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch {
      toast.error('Falha ao verificar a prontidão do sistema')
    } finally {
      setCarregando(false)
      setReverificando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function reverificar() {
    setReverificando(true)
    carregar(true)
  }

  function provisionarClientes() {
    const openConfirm = useConfirmDialogStore.getState().openConfirm
    openConfirm(
      'Gerar tarefas de setup',
      `Serão criadas tarefas "Setup do cliente" para os ${data?.clientes_sem_ids ?? 0} cliente(s) sem IDs Google. Clientes que já têm a tarefa são ignorados.`,
      async () => {
        setProvisionando(true)
        try {
          const res = await fetch('/api/v1/clientes/provisionar', { method: 'POST' })
          const body = await res.json()
          if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`)
          toast.success(`${body.criadas} tarefa(s) criada(s)${body.ja_existiam ? ` · ${body.ja_existiam} já existiam` : ''}`)
          carregar()
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Falha ao provisionar clientes')
        } finally {
          setProvisionando(false)
        }
      },
    )
  }

  if (carregando) {
    return (
      <div className="h-[12rem] flex items-center justify-center">
        <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return <p className="text-ink-muted text-[0.875rem]">Não foi possível carregar o checklist. Recarregue a página.</p>
  }

  return (
    <div className="flex flex-col gap-[1.5rem] max-w-[42rem]">
      {/* Barra de prontidão */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow">
        <div className="flex items-center justify-between mb-[0.75rem]">
          <div className="flex items-center gap-[0.5rem]">
            <Zap className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={2} />
            <p className="text-ink-primary font-semibold text-[0.9375rem]">
              Sistema pronto: {data.percent}%
            </p>
          </div>
          <Button
            variant="secondary" size="sm" loading={reverificando}
            icon={<RefreshCw className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />}
            onClick={reverificar}
          >
            Reverificar
          </Button>
        </div>
        <div className="h-[0.5rem] rounded-full bg-surface-hover overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${data.completo ? 'bg-status-green' : 'bg-ads-500'}`}
            style={{ width: `${data.percent}%` }}
          />
        </div>
        <p className="text-ink-muted text-[0.75rem] mt-[0.5rem]">
          {data.completo
            ? 'Tudo configurado — o Hub está operando com capacidade total.'
            : `${data.itens.filter((i) => i.status === 'pendente').length} pendência(s) impedem o Hub de operar 100% sozinho.`}
        </p>
      </div>

      {/* Itens */}
      <div className="flex flex-col gap-[0.75rem]">
        {data.itens.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            aberto={aberto === item.id}
            onToggle={() => setAberto(aberto === item.id ? null : item.id)}
            onProvisionar={provisionarClientes}
            provisionando={provisionando}
            onAbrirAba={onAbrirAba}
          />
        ))}
      </div>
    </div>
  )
}

function ItemCard({ item, aberto, onToggle, onProvisionar, provisionando, onAbrirAba }: {
  item: SetupItem
  aberto: boolean
  onToggle: () => void
  onProvisionar: () => void
  provisionando: boolean
  onAbrirAba?: (aba: string) => void
}) {
  const StatusIcon = item.status === 'ok' ? CheckCircle2 : item.status === 'manual' ? Wrench : CircleDashed
  const statusCls  = item.status === 'ok' ? 'text-status-green' : item.status === 'manual' ? 'text-status-blue' : 'text-status-orange'
  const badge      = item.status === 'ok'
    ? { cls: 'bg-status-green/10 text-status-green', label: 'Pronto' }
    : item.status === 'manual'
      ? { cls: 'bg-status-blue/10 text-status-blue', label: 'Manual' }
      : { cls: 'bg-status-orange/10 text-status-orange', label: 'Pendente' }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl card-shadow overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-[0.75rem] p-[1rem] text-left hover:bg-surface-hover/50 transition-colors"
      >
        <StatusIcon className={`w-[1.125rem] h-[1.125rem] shrink-0 mt-[0.0625rem] ${statusCls}`} strokeWidth={2} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[0.5rem]">
            <p className="text-ink-primary text-[0.875rem] font-semibold">{item.label}</p>
            <span className={`px-[0.5rem] py-[0.125rem] rounded-full text-2xs font-medium ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-ink-muted text-[0.75rem] mt-[0.25rem]">{item.detalhe}</p>
        </div>
        <ChevronDown
          className={`w-[1rem] h-[1rem] text-ink-muted shrink-0 mt-[0.125rem] transition-transform ${aberto ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {aberto && (
        <div className="px-[1rem] pb-[1rem] pl-[2.875rem] animate-fade-in">
          <p className="text-ink-secondary text-[0.75rem] font-semibold uppercase tracking-wide mb-[0.5rem]">Como resolver</p>
          <ol className="flex flex-col gap-[0.375rem] list-decimal list-inside">
            {item.passos.map((p, i) => (
              <li key={i} className="text-ink-secondary text-[0.8125rem] leading-relaxed">{p}</li>
            ))}
          </ol>
          {item.acao && (
            <div className="mt-[0.75rem]">
              {item.acao.tipo === 'provisionar' ? (
                <Button variant="primary" size="sm" loading={provisionando} onClick={onProvisionar}>
                  {item.acao.label}
                </Button>
              ) : (() => {
                // Links para outra aba de Configurações trocam a aba direto
                // (navegar para a mesma rota não re-renderiza a página).
                const abaDestino = item.acao.href?.match(/^\/configuracoes\?tab=(\w+)$/)?.[1]
                const cls = 'inline-flex items-center h-[2rem] px-[0.875rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.8125rem] font-medium hover:bg-surface-elevated transition-colors'
                return abaDestino && onAbrirAba ? (
                  <button type="button" className={cls} onClick={() => onAbrirAba(abaDestino)}>
                    {item.acao.label}
                  </button>
                ) : (
                  <Link href={item.acao.href ?? '/configuracoes'} className={cls}>
                    {item.acao.label}
                  </Link>
                )
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
