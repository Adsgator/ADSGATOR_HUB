'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, CheckSquare, Square, Mail, Phone, CalendarClock, Package, Users, AlertCircle } from 'lucide-react'
import { fadeScale, backdropVariants } from '@/lib/motion'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

interface ClienteImportavel {
  nome:                  string
  email:                 string
  whatsapp:              string
  valor_mensal:          number
  plano_nome:            string
  asaas_subscription_id: string
  data_proxima_cobranca: string | null
}

interface ItemPulado {
  motivo:   string
  nome:     string
  detalhe?: string
}

interface PreviewResponse {
  error?:    string
  plano?:    { criar: number; pular: number }
  detalhes?: { criar: ClienteImportavel[]; pular: ItemPulado[] }
}

interface Props {
  onClose:    () => void
  onImported: () => void
}

const MOTIVO_LABEL: Record<string, string> = {
  assinatura_ja_importada:  'Já importado',
  customer_nao_encontrado:  'Cadastro não encontrado no Asaas',
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtData(iso: string | null) {
  if (!iso) return null
  const d = new Date(`${iso}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('pt-BR')
}

export function ImportAsaasModal({ onClose, onImported }: Props) {
  const [carregando, setCarregando]   = useState(true)
  const [erro,       setErro]         = useState('')
  const [clientes,   setClientes]     = useState<ClienteImportavel[]>([])
  const [pulados,    setPulados]      = useState<ItemPulado[]>([])
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [importando, setImportando]   = useState(false)
  const [mostrarPulados, setMostrarPulados] = useState(false)

  useEffect(() => {
    fetch('/api/v1/asaas/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then((r) => r.json() as Promise<PreviewResponse>)
      .then((data) => {
        if (data.error) { setErro(data.error); return }
        const criar = data.detalhes?.criar ?? []
        setClientes(criar)
        setPulados(data.detalhes?.pular ?? [])
        // Todos selecionados por padrão
        setSelecionados(new Set(criar.map((c) => c.asaas_subscription_id)))
      })
      .catch(() => setErro('Falha ao consultar o Asaas.'))
      .finally(() => setCarregando(false))
  }, [])

  function toggle(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleTodos() {
    setSelecionados((prev) =>
      prev.size === clientes.length ? new Set() : new Set(clientes.map((c) => c.asaas_subscription_id))
    )
  }

  async function importar() {
    if (selecionados.size === 0) return
    setImportando(true)
    try {
      const res = await fetch('/api/v1/asaas/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmar: true, ids: [...selecionados] }),
      }).then((r) => r.json())

      if (res.error) {
        toast.error(res.error)
      } else if (res.falhas?.length) {
        toast.warning(`${res.importados} importados, ${res.falhas.length} falha(s): ${res.falhas[0]?.erro ?? ''}`)
        onImported()
        onClose()
      } else {
        toast.success(`${res.importados} cliente(s) importados do Asaas!`)
        onImported()
        onClose()
      }
    } catch {
      toast.error('Falha ao importar do Asaas.')
    } finally {
      setImportando(false)
    }
  }

  const mrrSelecionado = clientes
    .filter((c) => selecionados.has(c.asaas_subscription_id))
    .reduce((s, c) => s + c.valor_mensal, 0)

  const todosMarcados = clientes.length > 0 && selecionados.size === clientes.length

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-[1rem]">
      <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div variants={fadeScale} initial="hidden" animate="visible" exit="exit" className="relative bg-surface-card border border-surface-border rounded-2xl card-shadow shadow-2xl w-full max-w-[40rem] max-h-[90vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-[1.5rem] py-[1rem] border-b border-surface-border shrink-0">
          <div className="flex items-center gap-[0.625rem]">
            <div className="w-[2rem] h-[2rem] rounded-lg bg-ads-500/15 flex items-center justify-center">
              <Users className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-ink-primary font-semibold text-[0.9375rem] leading-tight">Importar clientes do Asaas</p>
              <p className="text-ink-muted text-[0.75rem]">Assinaturas ativas encontradas na sua conta</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X className="w-[1rem] h-[1rem]" strokeWidth={2} />} className="w-[2rem] px-0" />
        </div>

        {/* ── Corpo ── */}
        <div className="flex-1 min-h-0 overflow-y-auto p-[1.25rem] flex flex-col gap-[0.75rem]">

          {carregando && (
            <div className="flex flex-col items-center justify-center py-[3rem] gap-[0.75rem]">
              <div className="w-[1.75rem] h-[1.75rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-ink-muted text-[0.8125rem]">Consultando o Asaas…</p>
            </div>
          )}

          {!carregando && erro && (
            <div className="flex items-center gap-[0.625rem] bg-status-red/10 text-status-red rounded-xl p-[1rem] text-[0.8125rem]">
              <AlertCircle className="w-[1rem] h-[1rem] shrink-0" strokeWidth={1.75} />
              {erro}
            </div>
          )}

          {!carregando && !erro && clientes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-[3rem] gap-[0.5rem] text-center">
              <p className="text-ink-primary text-[0.875rem] font-medium">Nada novo para importar</p>
              <p className="text-ink-muted text-[0.8125rem]">
                {pulados.length > 0
                  ? `${pulados.length} assinatura(s) ativas já existem no Hub.`
                  : 'Nenhuma assinatura ativa encontrada no Asaas.'}
              </p>
            </div>
          )}

          {!carregando && !erro && clientes.length > 0 && (
            <>
              {/* Barra de seleção */}
              <button
                onClick={toggleTodos}
                className="flex items-center gap-[0.5rem] text-[0.8125rem] text-ink-secondary hover:text-ink-primary transition-colors self-start"
              >
                {todosMarcados
                  ? <CheckSquare className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.75} />
                  : <Square className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
                {todosMarcados ? 'Desmarcar todos' : 'Selecionar todos'}
                <span className="text-ink-muted">· {selecionados.size} de {clientes.length}</span>
              </button>

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[0.625rem] stagger">
                {clientes.map((c) => {
                  const marcado = selecionados.has(c.asaas_subscription_id)
                  const prazo = fmtData(c.data_proxima_cobranca)
                  return (
                    <button
                      key={c.asaas_subscription_id}
                      onClick={() => toggle(c.asaas_subscription_id)}
                      className={`text-left rounded-xl border p-[0.875rem] transition-all flex flex-col gap-[0.5rem] ${
                        marcado
                          ? 'border-ads-500/60 bg-ads-500/5 ring-1 ring-ads-500/20'
                          : 'border-surface-border bg-surface-hover/40 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-[0.5rem]">
                        <p className="text-ink-primary text-[0.875rem] font-semibold leading-snug">{c.nome}</p>
                        {marcado
                          ? <CheckSquare className="w-[1rem] h-[1rem] text-ads-500 shrink-0" strokeWidth={1.75} />
                          : <Square className="w-[1rem] h-[1rem] text-ink-muted shrink-0" strokeWidth={1.75} />}
                      </div>

                      <div className="flex flex-col gap-[0.25rem] text-[0.75rem] text-ink-secondary">
                        <span className="flex items-center gap-[0.375rem] min-w-0">
                          <Mail className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                          <span className="truncate">{c.email}</span>
                        </span>
                        {c.whatsapp && (
                          <span className="flex items-center gap-[0.375rem]">
                            <Phone className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                            {c.whatsapp}
                          </span>
                        )}
                        <span className="flex items-center gap-[0.375rem] min-w-0">
                          <Package className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                          <span className="truncate">{c.plano_nome}</span>
                        </span>
                        {prazo && (
                          <span className="flex items-center gap-[0.375rem]">
                            <CalendarClock className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                            Próx. cobrança {prazo}
                          </span>
                        )}
                      </div>

                      <span className="text-[0.875rem] font-semibold text-status-green mt-auto">
                        {fmtBRL(c.valor_mensal)}<span className="text-[0.6875rem] text-ink-muted font-normal">/mês</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Pulados */}
              {pulados.length > 0 && (
                <div className="mt-[0.25rem]">
                  <button
                    onClick={() => setMostrarPulados((v) => !v)}
                    className="text-[0.75rem] text-ink-muted hover:text-ink-secondary transition-colors"
                  >
                    {mostrarPulados ? '▾' : '▸'} {pulados.length} assinatura(s) puladas
                  </button>
                  {mostrarPulados && (
                    <div className="mt-[0.5rem] flex flex-col gap-[0.25rem]">
                      {pulados.map((p, i) => (
                        <p key={i} className="text-[0.75rem] text-ink-muted pl-[1rem]">
                          {p.nome} — {MOTIVO_LABEL[p.motivo] ?? p.motivo}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {!carregando && !erro && clientes.length > 0 && (
          <div className="flex items-center justify-between px-[1.5rem] py-[1rem] border-t border-surface-border shrink-0 gap-[1rem]">
            <div className="text-[0.8125rem] text-ink-secondary">
              MRR selecionado: <strong className="text-ink-primary">{fmtBRL(mrrSelecionado)}</strong>
              <span className="text-ink-muted text-[0.75rem] block">Nenhum email ou cobrança será disparado.</span>
            </div>
            <div className="flex items-center gap-[0.5rem] shrink-0">
              <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={importar} disabled={selecionados.size === 0 || importando}>
                {importando ? 'Importando…' : `Importar ${selecionados.size} cliente(s)`}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
