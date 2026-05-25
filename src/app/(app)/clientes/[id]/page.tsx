'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, User, CheckSquare, BarChart3, History,
  Phone, Mail, Globe, Calendar, DollarSign, AlertCircle,
  MessageCircle, Snowflake, Play, Pencil, Check, X as XIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { ChecklistCard } from '@/components/clientes/ChecklistCard'
import { ClienteIntegracoes } from '@/components/clientes/ClienteIntegracoes'
import { ClientePerformance } from '@/components/clientes/ClientePerformance'
import { AuditTimeline } from '@/components/clientes/AuditTimeline'
import { AcessoRapido } from '@/components/clientes/AcessoRapido'
import { WhatsAppTemplateModal } from '@/components/clientes/WhatsAppTemplateModal'
import { ClienteMemoria }        from '@/components/clientes/ClienteMemoria'
import {
  obterCliente,
  obterEstagioAtivo,
  obterHistoricoCliente,
  congelarCliente,
  descongelarCliente,
  atualizarCliente,
} from '@/lib/database'
import type { Cliente, Estagio, HistoricoAcao } from '@/lib/types'
import { toast } from 'sonner'

// ── Componente de edição inline ───────────────────────────────────────────────
function InlineEdit({
  value,
  onSave,
  placeholder = '—',
  type = 'text',
}: {
  value: string | null | undefined
  onSave: (v: string) => Promise<void>
  placeholder?: string
  type?: 'text' | 'email' | 'url' | 'tel'
}) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(value ?? '')
  const [saving,  setSaving]  = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setDraft(value ?? '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  async function commit() {
    if (draft === (value ?? '')) { setEditing(false); return }
    setSaving(true)
    try { await onSave(draft.trim()) }
    finally { setSaving(false); setEditing(false) }
  }

  function cancel() { setEditing(false); setDraft(value ?? '') }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-[0.375rem]">
        <input
          ref={inputRef}
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel() }}
          disabled={saving}
          className="h-[1.75rem] px-[0.5rem] rounded border border-ads-500/50 bg-surface-card text-ink-primary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 min-w-[10rem] transition-all"
        />
        <button onClick={commit} disabled={saving} title="Salvar" className="text-status-green hover:text-status-green/80 transition-colors">
          <Check className="w-[0.875rem] h-[0.875rem]" strokeWidth={2.5} />
        </button>
        <button onClick={cancel} title="Cancelar" className="text-ink-muted hover:text-ink-secondary transition-colors">
          <XIcon className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={startEdit}
      className="group inline-flex items-center gap-[0.375rem] text-inherit hover:text-ink-primary transition-colors"
      title="Clique para editar"
    >
      <span>{value || <span className="text-ink-muted italic">{placeholder}</span>}</span>
      <Pencil className="w-[0.75rem] h-[0.75rem] text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" strokeWidth={1.75} />
    </button>
  )
}

type AbaId = 'visao_geral' | 'checklist' | 'campanhas' | 'historico'

const ABAS: { id: AbaId; label: string; icon: typeof User }[] = [
  { id: 'visao_geral', label: 'Visão Geral',  icon: User       },
  { id: 'checklist',   label: 'Checklists',   icon: CheckSquare },
  { id: 'campanhas',   label: 'Campanhas',    icon: BarChart3   },
  { id: 'historico',   label: 'Histórico',    icon: History     },
]

const STATUS_LABELS: Record<string, string> = {
  recebido:         'Recebido',
  onboarding:       'Onboarding',
  setup_trafego:    'Setup Tráfego',
  ativo:            'Ativo',
  congelado:        'Congelado',
  cancelado_debito: 'Cancelado (débito)',
  cancelado:        'Cancelado',
  inativo:          'Inativo',
}

const STATUS_COLORS: Record<string, string> = {
  recebido:         'bg-status-blue/10 text-status-blue',
  onboarding:       'bg-status-purple/10 text-status-purple',
  setup_trafego:    'bg-status-cyan/10 text-status-cyan',
  ativo:            'bg-status-green/10 text-status-green',
  congelado:        'bg-status-blue/10 text-status-blue',
  cancelado_debito: 'bg-status-red/10 text-status-red',
  cancelado:        'bg-status-red/10 text-status-red',
  inativo:          'bg-ink-muted/10 text-ink-muted',
}

export default function ClienteDetalhePage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()

  const [cliente,   setCliente]   = useState<Cliente | null>(null)
  const [estagio,   setEstagio]   = useState<Estagio | null>(null)
  const [historico, setHistorico] = useState<HistoricoAcao[]>([])
  const [abaAtiva,  setAbaAtiva]  = useState<AbaId>('visao_geral')
  const [carregando, setCarregando] = useState(true)
  const [whatsappOpen, setWhatsappOpen] = useState(false)
  const [agindo, setAgindo] = useState(false)
  const [filtroHistorico, setFiltroHistorico] = useState('')

  async function salvarCampo(campo: keyof Cliente, valor: string) {
    if (!cliente) return
    await atualizarCliente(cliente.id, { [campo]: valor || null } as Partial<Cliente>)
    setCliente((prev) => prev ? { ...prev, [campo]: valor || null } : prev)
    toast.success('Campo atualizado')
  }

  useEffect(() => {
    if (!id) return
    setCarregando(true)
    Promise.all([
      obterCliente(id),
      obterEstagioAtivo(id),
      obterHistoricoCliente(id),
    ]).then(([c, e, h]) => {
      setCliente(c)
      setEstagio(e)
      setHistorico(h)
    }).catch(() => {
      toast.error('Erro ao carregar cliente')
    }).finally(() => setCarregando(false))
  }, [id])

  async function handleCongelar() {
    if (!cliente) return
    setAgindo(true)
    try {
      await congelarCliente(cliente.id)
      setCliente((prev) => prev ? { ...prev, status: 'congelado' } : prev)
      toast.success('Cliente congelado')
    } catch {
      toast.error('Erro ao congelar cliente')
    } finally {
      setAgindo(false)
    }
  }

  async function handleDescongelar() {
    if (!cliente) return
    setAgindo(true)
    try {
      await descongelarCliente(cliente.id, 'ativo', 'Retomar acompanhamento do cliente')
      const c = await obterCliente(cliente.id)
      setCliente(c)
      toast.success('Cliente descongelado')
    } catch {
      toast.error('Erro ao descongelar cliente')
    } finally {
      setAgindo(false)
    }
  }

  if (carregando) {
    return (
      <MainLayout title="Carregando…">
        <div className="flex items-center justify-center h-[12rem]">
          <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    )
  }

  if (!cliente) {
    return (
      <MainLayout title="Cliente não encontrado">
        <div className="flex flex-col items-center justify-center h-[12rem] gap-[1rem]">
          <AlertCircle className="w-[2rem] h-[2rem] text-ink-muted" strokeWidth={1.5} />
          <p className="text-ink-secondary text-[0.875rem]">Cliente não encontrado.</p>
          <button
            onClick={() => router.push('/clientes')}
            className="flex items-center gap-[0.375rem] text-ads-500 hover:text-ads-600 text-[0.875rem] transition-colors"
          >
            <ArrowLeft className="w-[0.875rem] h-[0.875rem]" />
            Voltar para clientes
          </button>
        </div>
      </MainLayout>
    )
  }

  const actions = (
    <div className="flex items-center gap-[0.5rem]">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setWhatsappOpen(true)}
        icon={<MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
        className="text-status-green bg-status-green/10 hover:bg-status-green/20 hover:text-status-green"
      >
        WhatsApp
      </Button>
      {cliente.status === 'congelado' ? (
        <Button
          variant="subtle"
          size="sm"
          onClick={handleDescongelar}
          disabled={agindo}
          icon={<Play className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
        >
          Descongelar
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCongelar}
          disabled={agindo || cliente.status === 'cancelado' || cliente.status === 'inativo'}
          icon={<Snowflake className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
        >
          Congelar
        </Button>
      )}
    </div>
  )

  return (
    <MainLayout title={cliente.nome} subtitle={cliente.nicho} actions={actions}>
      <div className="page-enter">

        {/* Voltar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/clientes')}
          icon={<ArrowLeft className="w-[1rem] h-[1rem]" strokeWidth={1.5} />}
          className="mb-[1.5rem]"
        >
          Clientes
        </Button>

        {/* Cabeçalho do cliente */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] card-shadow mb-[1.5rem]">
          <div className="flex items-start justify-between gap-[1rem] flex-wrap">
            <div className="flex items-center gap-[1rem]">
              <div className="w-[3rem] h-[3rem] rounded-full bg-ads-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-ads-600 text-[1.25rem] font-bold">
                  {cliente.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-ink-primary text-[1.125rem] font-semibold">
                  <InlineEdit value={cliente.nome} onSave={(v) => salvarCampo('nome', v)} placeholder="Nome do cliente" />
                </h2>
                <div className="flex items-center gap-[0.75rem] mt-[0.25rem] flex-wrap">
                  <span className={cn('px-[0.5rem] py-[0.125rem] rounded-full text-xs font-medium', STATUS_COLORS[cliente.status] ?? 'bg-ink-muted/10 text-ink-muted')}>
                    {STATUS_LABELS[cliente.status] ?? cliente.status}
                  </span>
                  {cliente.nicho && (
                    <span className="text-ink-muted text-[0.8125rem]">{cliente.nicho}</span>
                  )}
                  {estagio && (
                    <span className="text-ink-muted text-[0.8125rem]">Etapa: <span className="text-ink-secondary">{estagio.nome}</span></span>
                  )}
                </div>
              </div>
            </div>

            {/* KPIs rápidos */}
            <div className="flex items-center gap-[1.5rem] flex-wrap">
              {cliente.mrr != null && (
                <div className="text-right">
                  <div className="flex items-center gap-[0.25rem] text-ink-muted text-[0.75rem]">
                    <DollarSign className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                    MRR
                  </div>
                  <div className="text-ink-primary text-[1rem] font-semibold">
                    R$ {cliente.mrr.toLocaleString('pt-BR')}
                  </div>
                </div>
              )}
              {cliente.dias_atraso > 0 && (
                <div className="text-right">
                  <div className="flex items-center gap-[0.25rem] text-status-red text-[0.75rem]">
                    <AlertCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                    Atraso
                  </div>
                  <div className="text-status-red text-[1rem] font-semibold">
                    D+{cliente.dias_atraso}
                  </div>
                </div>
              )}
              {cliente.data_criacao && (
                <div className="text-right">
                  <div className="flex items-center gap-[0.25rem] text-ink-muted text-[0.75rem]">
                    <Calendar className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                    Desde
                  </div>
                  <div className="text-ink-secondary text-[0.875rem]">
                    {new Date(cliente.data_criacao).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contato — campos editáveis inline */}
          <div className="flex items-center gap-[1.25rem] mt-[1rem] flex-wrap text-[0.8125rem] text-ink-muted">
            <span className="flex items-center gap-[0.375rem]">
              <Mail className="w-[0.875rem] h-[0.875rem] shrink-0" strokeWidth={1.5} />
              <InlineEdit value={cliente.email} type="email" onSave={(v) => salvarCampo('email', v)} placeholder="e-mail" />
            </span>
            <span className="flex items-center gap-[0.375rem]">
              <Phone className="w-[0.875rem] h-[0.875rem] shrink-0" strokeWidth={1.5} />
              <InlineEdit value={cliente.whatsapp} type="tel" onSave={(v) => salvarCampo('whatsapp', v)} placeholder="WhatsApp" />
            </span>
            <span className="flex items-center gap-[0.375rem]">
              <Globe className="w-[0.875rem] h-[0.875rem] shrink-0" strokeWidth={1.5} />
              <InlineEdit value={cliente.dominio} type="url" onSave={(v) => salvarCampo('dominio', v)} placeholder="domínio" />
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-[0.25rem] mb-[1.5rem] border-b border-surface-border">
          {ABAS.map((aba) => {
            const Icon = aba.icon
            return (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={cn(
                  'flex items-center gap-[0.375rem] px-[1rem] py-[0.625rem] text-[0.875rem] font-medium border-b-2 -mb-px transition-colors',
                  abaAtiva === aba.id
                    ? 'border-ads-500 text-ads-500'
                    : 'border-transparent text-ink-muted hover:text-ink-secondary',
                )}
              >
                <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                {aba.label}
              </button>
            )
          })}
        </div>

        {/* Conteúdo das tabs */}
        {abaAtiva === 'visao_geral' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-[1.5rem]">
            <div className="space-y-[1.5rem]">
              {estagio && (
                <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow">
                  <h3 className="text-ink-primary text-[0.9375rem] font-semibold mb-[0.75rem]">Etapa Atual</h3>
                  <div className="flex items-start gap-[0.75rem]">
                    <div className="w-[2rem] h-[2rem] rounded-full bg-ads-500/10 flex items-center justify-center flex-shrink-0 mt-[0.125rem]">
                      <CheckSquare className="w-[0.875rem] h-[0.875rem] text-ads-600" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-ink-primary text-[0.875rem] font-medium capitalize">{estagio.nome.replace(/_/g, ' ')}</p>
                      {estagio.acao_label && (
                        <p className="text-ink-secondary text-[0.8125rem] mt-[0.25rem]">{estagio.acao_label}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <ClienteIntegracoes cliente={cliente} onUpdate={setCliente} />
            </div>
            <div className="space-y-[1.5rem]">
              <AcessoRapido links={{
                google_ads_customer_id: cliente.google_ads_customer_id ?? undefined,
                ga4_property_id:        cliente.ga4_property_id ?? undefined,
                gmb_id:                 cliente.gmb_id,
                looker_url:             cliente.looker_url,
                website:                cliente.website,
              }} />
              <ClienteMemoria clienteId={cliente.id} />
              {historico.length > 0 && (
                <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow">
                  <h3 className="text-ink-primary text-[0.9375rem] font-semibold mb-[0.75rem]">Últimas ações</h3>
                  <div className="space-y-[0.75rem]">
                    {historico.slice(0, 4).map((h) => (
                      <div key={h.id} className="flex items-start gap-[0.75rem]">
                        <div className="w-[0.375rem] h-[0.375rem] rounded-full bg-ads-500 mt-[0.4rem] flex-shrink-0" />
                        <div>
                          <p className="text-ink-secondary text-[0.8125rem]">{h.descricao}</p>
                          <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">
                            {new Date(h.data_acao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {abaAtiva === 'checklist' && (
          <div>
            {estagio?.checklist && estagio.checklist.length > 0 ? (
              <ChecklistCard
                clienteId={cliente.id}
                estagioId={estagio.id}
                items={estagio.checklist}
              />
            ) : (
              <div className="bg-surface-card border border-surface-border rounded-xl p-[2rem] card-shadow text-center">
                <CheckSquare className="w-[2rem] h-[2rem] text-ink-muted mx-auto mb-[0.75rem]" strokeWidth={1.5} />
                <p className="text-ink-secondary text-[0.875rem]">Nenhum checklist ativo para esta etapa.</p>
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'campanhas' && (
          <ClientePerformance
            clienteId={cliente.id}
            googleAdsEnabled={cliente.google_ads_enabled}
            ga4Enabled={cliente.ga4_enabled}
          />
        )}

        {abaAtiva === 'historico' && (() => {
          const tiposUnicos = Array.from(new Set(historico.map((h) => h.tipo_acao))).sort()
          const historicoFiltrado = filtroHistorico
            ? historico.filter((h) => h.tipo_acao === filtroHistorico)
            : historico
          return (
            <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow">
              <div className="flex items-center justify-between mb-[1rem] gap-[0.75rem] flex-wrap">
                <h3 className="text-ink-primary text-[0.9375rem] font-semibold">Histórico Completo</h3>
                {tiposUnicos.length > 0 && (
                  <select
                    value={filtroHistorico}
                    onChange={(e) => setFiltroHistorico(e.target.value)}
                    className="h-[2rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-secondary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
                  >
                    <option value="">Todos os tipos</option>
                    {tiposUnicos.map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                )}
              </div>
              {historicoFiltrado.length === 0 ? (
                <div className="text-center py-[2rem]">
                  <History className="w-[2rem] h-[2rem] text-ink-muted mx-auto mb-[0.75rem]" strokeWidth={1.5} />
                  <p className="text-ink-secondary text-[0.875rem]">Nenhuma ação registrada ainda.</p>
                </div>
              ) : (
                <div className="space-y-[0.875rem]">
                  {historicoFiltrado.map((h) => (
                    <div key={h.id} className="flex items-start gap-[0.875rem] pb-[0.875rem] border-b border-surface-border last:border-0 last:pb-0">
                      <div className="w-[0.5rem] h-[0.5rem] rounded-full bg-ads-500/60 mt-[0.3rem] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-ink-secondary text-[0.875rem]">{h.descricao}</p>
                        <p className="text-ink-muted text-[0.75rem] mt-[0.25rem]">
                          {new Date(h.data_acao).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span className="text-ink-muted text-[0.75rem] bg-surface-hover px-[0.5rem] py-[0.125rem] rounded-full flex-shrink-0">
                        {h.tipo_acao.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <AuditTimeline clienteId={cliente.id} />
            </div>
          )
        })()}

      </div>

      {whatsappOpen && (
        <WhatsAppTemplateModal
          cliente={cliente}
          onClose={() => setWhatsappOpen(false)}
        />
      )}
    </MainLayout>
  )
}
