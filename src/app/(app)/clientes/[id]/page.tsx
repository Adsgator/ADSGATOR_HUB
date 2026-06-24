'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, User, CheckSquare, BarChart3, History, GitBranch,
  Phone, Mail, Globe, Calendar, DollarSign, AlertCircle,
  MessageCircle, Snowflake, Play, Pencil, Check, X as XIcon,
  FileText, Send, ChevronDown, ChevronUp, LogOut, Layout, Plus, Trash2, ExternalLink, Copy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { labelMotivoInativacao } from '@/lib/cliente-status'
import { useConfirmDialogStore } from '@/lib/hooks/useConfirmDialog'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { OnboardingTimeline } from '@/components/clientes/OnboardingTimeline'
import { EmailComposer } from '@/components/relatorios/EmailComposer'
import { ChecklistCard } from '@/components/clientes/ChecklistCard'
import { ClienteCompletude } from '@/components/clientes/ClienteCompletude'
import { ClienteIntegracoes } from '@/components/clientes/ClienteIntegracoes'
import { ClientePerformance } from '@/components/clientes/ClientePerformance'
import { AuditTimeline } from '@/components/clientes/AuditTimeline'
import { EmailsCliente } from '@/components/clientes/EmailsCliente'
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

interface TimelineInstanceSummary {
  id: string
  status: string
  completed_steps: string[]
  template?: { name: string; type: string; steps: { id: string; title: string }[] }
  current_step_id?: string
  data?: Record<string, unknown>
}

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

type AbaId = 'visao_geral' | 'checklist' | 'campanhas' | 'historico' | 'timeline' | 'sites' | 'emails'

const ABAS: { id: AbaId; label: string; icon: typeof User }[] = [
  { id: 'visao_geral', label: 'Visão Geral',  icon: User        },
  { id: 'checklist',   label: 'Checklists',   icon: CheckSquare },
  { id: 'campanhas',   label: 'Campanhas',    icon: BarChart3   },
  { id: 'historico',   label: 'Histórico',    icon: History     },
  { id: 'timeline',    label: 'Timeline',     icon: GitBranch   },
  { id: 'sites',       label: 'Sites',        icon: Layout      },
  { id: 'emails',      label: 'Emails',       icon: Mail        },
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
  const [whatsappOpen,   setWhatsappOpen]   = useState(false)
  const [agindo,         setAgindo]         = useState(false)
  const [filtroHistorico, setFiltroHistorico] = useState('')
  const [emailOpen,      setEmailOpen]      = useState(false)
  // Timeline tab state
  const [timelineInstances,  setTimelineInstances]  = useState<TimelineInstanceSummary[]>([])
  const [timelineTemplates,  setTimelineTemplates]  = useState<{ id: string; name: string }[]>([])
  const [timelineLoading,    setTimelineLoading]    = useState(false)
  const [timelineLoaded,     setTimelineLoaded]     = useState(false)
  const [expandedInstance,   setExpandedInstance]   = useState<string | null>(null)
  const [creatingTimeline,   setCreatingTimeline]   = useState(false)
  const [selectedTemplate,   setSelectedTemplate]   = useState('')
  // Sites tab state
  interface ProjetoWeb { id: string; nome: string; url: string | null; plataforma: string; status: string; data_entrega: string | null }
  const [projetos,       setProjetos]       = useState<ProjetoWeb[]>([])
  const [projetosLoaded, setProjetosLoaded] = useState(false)
  const [novoProjetoOpen, setNovoProjetoOpen] = useState(false)
  const [editandoProjeto, setEditandoProjeto] = useState<ProjetoWeb | null>(null)
  const [formProjeto, setFormProjeto] = useState({ nome: '', url: '', plataforma: 'astro', status: 'ativo', data_entrega: '' })

  async function salvarCampo(campo: keyof Cliente, valor: string) {
    if (!cliente) return
    await atualizarCliente(cliente.id, { [campo]: valor || null } as Partial<Cliente>)
    setCliente((prev) => prev ? { ...prev, [campo]: valor || null } : prev)
    toast.success('Campo atualizado')
  }

  async function carregarTimelines() {
    if (!id || timelineLoaded) return
    setTimelineLoading(true)
    try {
      const [instRes, tplRes] = await Promise.all([
        fetch(`/api/v1/timelines?clienteId=${id}`),
        fetch('/api/v1/timeline-templates'),
      ])
      if (instRes.ok) {
        const data = await instRes.json()
        setTimelineInstances(Array.isArray(data) ? data : (data.data ?? []))
      }
      if (tplRes.ok) {
        const data = await tplRes.json()
        setTimelineTemplates(Array.isArray(data) ? data : (data.data ?? []))
      }
      setTimelineLoaded(true)
    } catch {
      toast.error('Erro ao carregar timelines')
    } finally {
      setTimelineLoading(false)
    }
  }

  // Define o tipo de contratação do cliente (solução manual enquanto o checkout
  // próprio não envia automaticamente). Salva e atualiza o estado local.
  async function definirTipoContratacao(tipo: 'combo' | 'trafego' | 'lp') {
    if (!cliente) return
    try {
      await atualizarCliente(cliente.id, { tipo_contratacao: tipo } as Partial<Cliente>)
      setCliente((prev) => prev ? { ...prev, tipo_contratacao: tipo } : prev)
      toast.success('Tipo de contratação definido')
    } catch {
      toast.error('Erro ao salvar tipo')
    }
  }

  // Tipo de contratação → nome do template de onboarding correspondente
  const TEMPLATE_POR_TIPO: Record<string, string> = {
    combo:   'Onboarding — Combo (LP + Tráfego)',
    trafego: 'Onboarding — Só Tráfego',
    lp:      'Onboarding — Só Landing Page',
  }

  async function criarTimeline(templateIdArg?: string) {
    const templateId = templateIdArg ?? selectedTemplate
    if (!templateId || !id) return
    setCreatingTimeline(true)
    try {
      const res = await fetch('/api/v1/timelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: templateId, client_id: id }),
      })
      if (!res.ok) throw new Error('Falha ao criar timeline')
      const json = await res.json()
      const nova = json.data ?? json
      setTimelineInstances((prev) => [nova, ...prev])
      setSelectedTemplate('')
      toast.success('Timeline criada')
      // Criar onboarding pode ter movido o cliente para 'onboarding'
      obterCliente(id).then((c) => { if (c) setCliente(c) }).catch(() => {})
    } catch {
      toast.error('Erro ao criar timeline')
    } finally {
      setCreatingTimeline(false)
    }
  }

  // Concluir um step: persiste na API e atualiza a instância no estado local
  async function completarStep(instanceId: string, stepId: string, data: Record<string, string>) {
    const res = await fetch(`/api/v1/timelines/${instanceId}/step/${stepId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? 'Falha ao concluir step')
    }
    const json = await res.json()
    const atualizada = json.data ?? json
    setTimelineInstances((prev) => prev.map((i) => (i.id === instanceId ? { ...i, ...atualizada } : i)))
    // O complete pode ter atualizado o cliente (IDs, status) — recarrega para refletir
    obterCliente(id).then((c) => { if (c) setCliente(c) }).catch(() => {})
  }

  // Salvar variáveis da timeline (ex.: drive_url) sem concluir step — reflete na
  // mensagem na hora. Faz merge com o data atual da instância.
  async function salvarVarsTimeline(instanceId: string, vars: Record<string, string>) {
    const inst = timelineInstances.find((i) => i.id === instanceId)
    const merged = { ...(inst?.data ?? {}), ...vars }
    const res = await fetch(`/api/v1/timelines/${instanceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: merged }),
    })
    if (!res.ok) throw new Error('Falha ao salvar')
    const json = await res.json()
    const atualizada = json.data ?? json
    setTimelineInstances((prev) => prev.map((i) => (i.id === instanceId ? { ...i, ...atualizada } : i)))
  }

  // Reabrir uma etapa anterior (volta o current_step_id pra ela)
  async function reabrirStep(instanceId: string, stepId: string) {
    const res = await fetch(`/api/v1/timelines/${instanceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_step_id: stepId }),
    })
    if (!res.ok) throw new Error('Falha ao reabrir etapa')
    const json = await res.json()
    const atualizada = json.data ?? json
    setTimelineInstances((prev) => prev.map((i) => (i.id === instanceId ? { ...i, ...atualizada } : i)))
  }

  // Marcar step como "aguardando" (bola com o cliente)
  async function aguardarStep(instanceId: string, stepId: string) {
    const res = await fetch(`/api/v1/timelines/${instanceId}/step/${stepId}/wait`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error('Falha ao marcar como aguardando')
    const json = await res.json().catch(() => ({}))
    const atualizada = json.data ?? json
    if (atualizada && atualizada.id) {
      setTimelineInstances((prev) => prev.map((i) => (i.id === instanceId ? { ...i, ...atualizada } : i)))
    }
  }

  useEffect(() => {
    if (abaAtiva === 'timeline') carregarTimelines()
    if (abaAtiva === 'sites' && !projetosLoaded) carregarProjetos()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abaAtiva])

  async function carregarProjetos() {
    const { data } = await import('@/lib/supabase').then(m =>
      m.supabase.from('projetos_web').select('*').eq('cliente_id', id).order('created_at', { ascending: false })
    )
    setProjetos((data ?? []) as ProjetoWeb[])
    setProjetosLoaded(true)
  }

  async function salvarProjeto() {
    const payload = { ...formProjeto, cliente_id: id, url: formProjeto.url || null, data_entrega: formProjeto.data_entrega || null }
    if (editandoProjeto) {
      await import('@/lib/supabase').then(m => m.supabase.from('projetos_web').update(payload).eq('id', editandoProjeto.id))
    } else {
      await import('@/lib/supabase').then(m => m.supabase.from('projetos_web').insert(payload))
    }
    setNovoProjetoOpen(false)
    setEditandoProjeto(null)
    setFormProjeto({ nome: '', url: '', plataforma: 'astro', status: 'ativo', data_entrega: '' })
    carregarProjetos()
  }

  function deletarProjeto(projetoId: string) {
    const openConfirm = useConfirmDialogStore.getState().openConfirm
    openConfirm(
      'Deletar Projeto',
      'Este projeto será removido permanentemente. Esta ação não pode ser desfeita.',
      async () => {
        await import('@/lib/supabase').then(m => m.supabase.from('projetos_web').delete().eq('id', projetoId))
        carregarProjetos()
      }
    )
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

  function handleIniciarCancelamento() {
    if (!cliente) return
    const openConfirm = useConfirmDialogStore.getState().openConfirm
    openConfirm(
      'Iniciar Cancelamento',
      `Você está prestes a iniciar o fluxo de cancelamento para ${cliente.nome}. Esta ação não pode ser desfeita.`,
      async () => {
        setAgindo(true)
        try {
          // saída a pedido → arquiva como inativo + motivo (lib/cliente-status.ts)
          await atualizarCliente(cliente.id, { status: 'inativo' as Cliente['status'], motivo_inativacao: 'cancelado', inativado_em: new Date().toISOString() })
          setCliente((prev) => prev ? { ...prev, status: 'inativo', motivo_inativacao: 'cancelado' } : prev)
          toast.success('Fluxo de cancelamento iniciado')
        } catch {
          toast.error('Erro ao iniciar cancelamento')
        } finally {
          setAgindo(false)
        }
      }
    )
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
        onClick={() => router.push(`/relatorios?clienteId=${cliente.id}`)}
        icon={<FileText className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
        className="text-status-blue bg-status-blue/10 hover:bg-status-blue/20 hover:text-status-blue"
      >
        Gerar Relatório
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setEmailOpen(true)}
        icon={<Send className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
        className="text-status-purple bg-status-purple/10 hover:bg-status-purple/20 hover:text-status-purple"
      >
        Enviar Email
      </Button>
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
      {cliente.status !== 'cancelado' && cliente.status !== 'inativo' && (
        <Button
          variant="danger"
          size="sm"
          onClick={handleIniciarCancelamento}
          disabled={agindo}
          icon={<LogOut className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
        >
          Cancelar
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
                    {cliente.status === 'inativo'
                      ? labelMotivoInativacao(cliente.motivo_inativacao)
                      : (STATUS_LABELS[cliente.status] ?? cliente.status)}
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
            {'email_relatorio' in cliente && (
              <span className="flex items-center gap-[0.375rem]">
                <FileText className="w-[0.875rem] h-[0.875rem] shrink-0" strokeWidth={1.5} />
                <span className="text-ink-muted text-[0.75rem] mr-[0.25rem]">Email relatório:</span>
                <InlineEdit
                  value={(cliente as Cliente & { email_relatorio?: string }).email_relatorio}
                  type="email"
                  onSave={(v) => salvarCampo('email_relatorio' as keyof Cliente, v)}
                  placeholder="email para relatórios"
                />
              </span>
            )}
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
              {/* Completude do cadastro — mostra o que falta preencher */}
              <ClienteCompletude cliente={cliente} />

              {/* Portal do Cliente */}
              {cliente.portal_token && (
                <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow">
                  <h3 className="text-ink-primary text-[0.9375rem] font-semibold mb-[1rem]">Portal do Cliente</h3>
                  <div className="space-y-[0.75rem]">
                    <div>
                      <p className="text-ink-muted text-[0.75rem] mb-[0.375rem]">Token</p>
                      <div className="flex items-center gap-[0.5rem]">
                        <code className="flex-1 px-[0.75rem] py-[0.5rem] rounded-lg bg-surface-hover text-ink-primary text-[0.8125rem] font-mono border border-surface-border break-all">
                          {cliente.portal_token}
                        </code>
                        <button
                          onClick={async () => {
                            try {
                              if (cliente.portal_token) {
                                await navigator.clipboard.writeText(cliente.portal_token)
                                toast.success('Token copiado')
                              }
                            } catch {
                              toast.error('Erro ao copiar')
                            }
                          }}
                          title="Copiar token"
                          className="flex-shrink-0 p-[0.5rem] rounded-lg hover:bg-surface-hover transition-colors text-ink-muted hover:text-ink-secondary"
                        >
                          <Copy className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-ink-muted text-[0.75rem] mb-[0.375rem]">Link do Portal</p>
                      <div className="flex items-center gap-[0.5rem]">
                        <code className="flex-1 px-[0.75rem] py-[0.5rem] rounded-lg bg-surface-hover text-ink-primary text-[0.8125rem] font-mono border border-surface-border break-all">
                          seudominio.com/portal/{cliente.portal_token}
                        </code>
                        <button
                          onClick={async () => {
                            try {
                              if (cliente.portal_token) {
                                await navigator.clipboard.writeText(`https://seudominio.com/portal/${cliente.portal_token}`)
                                toast.success('Link copiado')
                              }
                            } catch {
                              toast.error('Erro ao copiar')
                            }
                          }}
                          title="Copiar link"
                          className="flex-shrink-0 p-[0.5rem] rounded-lg hover:bg-surface-hover transition-colors text-ink-muted hover:text-ink-secondary"
                        >
                          <Copy className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                            {new Date(h.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
                          {new Date(h.created_at).toLocaleDateString('pt-BR', {
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

        {abaAtiva === 'emails' && <EmailsCliente clienteId={cliente.id} />}

        {abaAtiva === 'timeline' && (() => {
          const temOnboardingAtivo = timelineInstances.some(
            (i) => i.template?.type === 'onboarding' && i.status !== 'completed' && i.status !== 'archived',
          )
          const tipo = cliente.tipo_contratacao
          const tplSugerido = tipo
            ? timelineTemplates.find((t) => t.name === TEMPLATE_POR_TIPO[tipo])
            : undefined
          return (
          <div className="space-y-[1rem]">
            {/* Atalho proativo: iniciar o onboarding do tipo certo em 1 clique */}
            {!temOnboardingAtivo && !timelineLoading && (
              <div className="bg-ads-500/5 border border-ads-500/30 rounded-xl p-[1.25rem]">
                {tplSugerido ? (
                  <div className="flex items-center gap-[0.875rem] flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="text-ink-primary text-[0.9375rem] font-semibold">Iniciar onboarding</p>
                      <p className="text-ink-muted text-[0.8125rem] mt-[0.125rem]">
                        Contratação <span className="text-ink-secondary font-medium">{tipo === 'combo' ? 'Combo (LP + Tráfego)' : tipo === 'trafego' ? 'Só Tráfego' : 'Só Landing Page'}</span> — usar o modelo correspondente.
                      </p>
                    </div>
                    <Button variant="primary" size="sm" loading={creatingTimeline}
                      onClick={() => criarTimeline(tplSugerido.id)}>
                      Iniciar “{tplSugerido.name.replace('Onboarding — ', '')}”
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-ink-primary text-[0.9375rem] font-semibold">Iniciar onboarding</p>
                    <p className="text-ink-muted text-[0.8125rem] mt-[0.125rem] mb-[0.75rem]">
                      Qual o tipo de contratação deste cliente? (define o modelo de onboarding)
                    </p>
                    <div className="flex items-center gap-[0.5rem] flex-wrap">
                      {([
                        { v: 'combo',   l: 'Combo (LP + Tráfego)' },
                        { v: 'trafego', l: 'Só Tráfego' },
                        { v: 'lp',      l: 'Só Landing Page' },
                      ] as const).map(({ v, l }) => (
                        <button
                          key={v}
                          onClick={() => definirTipoContratacao(v)}
                          className="h-[2rem] px-[0.75rem] rounded-lg text-[0.8125rem] font-medium bg-surface-hover border border-surface-border text-ink-secondary hover:text-ink-primary hover:border-ads-500/50 transition-colors"
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Create new timeline */}
            <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow">
              <h3 className="text-ink-primary text-[0.9375rem] font-semibold mb-[0.75rem]">Nova Timeline</h3>
              <div className="flex items-center gap-[0.75rem]">
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="flex-1 h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:border-ads-500/60 focus:ring-2 focus:ring-ads-500/10 transition-colors"
                >
                  <option value="">Selecionar template…</option>
                  {timelineTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => criarTimeline()}
                  disabled={!selectedTemplate || creatingTimeline}
                  className="h-[2.25rem] px-[1rem] rounded-lg bg-ads-500 hover:bg-ads-600 disabled:opacity-50 text-white text-[0.875rem] font-medium transition-colors"
                >
                  {creatingTimeline ? 'Criando…' : 'Criar'}
                </button>
              </div>
            </div>

            {/* Instances list */}
            {timelineLoading ? (
              <div className="flex items-center justify-center py-[3rem]">
                <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : timelineInstances.length === 0 ? (
              <div className="bg-surface-card border border-surface-border rounded-xl p-[2rem] card-shadow text-center">
                <GitBranch className="w-[2rem] h-[2rem] text-ink-muted mx-auto mb-[0.75rem]" strokeWidth={1.5} />
                <p className="text-ink-secondary text-[0.875rem]">Nenhuma timeline ativa para este cliente.</p>
              </div>
            ) : (
              <div className="space-y-[0.75rem]">
                {timelineInstances.map((inst) => {
                  const steps = inst.template?.steps ?? []
                  const total = steps.length
                  const done  = inst.completed_steps.length
                  const pct   = total > 0 ? Math.round((done / total) * 100) : 0
                  const currentStep = steps.find((s) => s.id === inst.current_step_id)
                  const isExpanded = expandedInstance === inst.id

                  return (
                    <div key={inst.id} className="bg-surface-card border border-surface-border rounded-xl card-shadow overflow-hidden">
                      <button
                        onClick={() => setExpandedInstance(isExpanded ? null : inst.id)}
                        className="w-full flex items-center justify-between px-[1.25rem] py-[1rem] hover:bg-surface-hover transition-colors"
                      >
                        <div className="flex items-center gap-[0.75rem] min-w-0">
                          <GitBranch className="w-[1rem] h-[1rem] text-ads-500 shrink-0" strokeWidth={2} />
                          <div className="text-left min-w-0">
                            <p className="text-ink-primary text-[0.875rem] font-medium truncate">
                              {inst.template?.name ?? 'Timeline'}
                            </p>
                            {currentStep && (
                              <p className="text-ink-muted text-[0.75rem] truncate">Step atual: {currentStep.title}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-[1rem] shrink-0 ml-[0.75rem]">
                          <div className="flex items-center gap-[0.5rem]">
                            <div className="w-[6rem] h-[0.375rem] bg-surface-hover rounded-full overflow-hidden">
                              <div className="h-full bg-ads-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-ink-muted text-[0.75rem] w-[2.5rem] text-right">{pct}%</span>
                          </div>
                          <span className={cn(
                            'px-[0.5rem] py-[0.125rem] rounded-full text-[0.75rem] font-medium',
                            inst.status === 'completed' ? 'bg-status-green/10 text-status-green'
                            : inst.status === 'paused'  ? 'bg-status-orange/10 text-status-orange'
                            : inst.status === 'archived' ? 'bg-ink-muted/10 text-ink-muted'
                            : 'bg-status-blue/10 text-status-blue',
                          )}>
                            {inst.status}
                          </span>
                          {isExpanded
                            ? <ChevronUp className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={2} />
                            : <ChevronDown className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={2} />
                          }
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-surface-border p-[1.25rem]">
                          <OnboardingTimeline
                            instance={inst as import('@/lib/types/timeline').TimelineInstance}
                            cliente={cliente}
                            onStepComplete={(stepId, data) => completarStep(inst.id, stepId, data)}
                            onStepWait={(stepId) => aguardarStep(inst.id, stepId)}
                            onSaveVars={(vars) => salvarVarsTimeline(inst.id, vars)}
                            onReopenStep={(stepId) => reabrirStep(inst.id, stepId)}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          )
        })()}

        {abaAtiva === 'sites' && (
          <div className="flex flex-col gap-[1rem]">
            <div className="flex items-center justify-between">
              <p className="text-ink-muted text-[0.875rem]">Sites e landing pages deste cliente.</p>
              <Button variant="primary" size="sm"
                icon={<Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
                onClick={() => { setEditandoProjeto(null); setFormProjeto({ nome: '', url: '', plataforma: 'astro', status: 'ativo', data_entrega: '' }); setNovoProjetoOpen(true) }}>
                Novo site
              </Button>
            </div>

            {projetos.length === 0 && projetosLoaded ? (
              <div className="bg-surface-card border border-surface-border rounded-xl p-[3rem] text-center card-shadow">
                <Layout className="w-[2rem] h-[2rem] text-ink-muted mx-auto mb-[0.75rem]" strokeWidth={1} />
                <p className="text-ink-secondary text-[0.875rem]">Nenhum site cadastrado.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-[0.75rem]">
                {projetos.map((p) => (
                  <div key={p.id} className="flex items-center gap-[1rem] bg-surface-card border border-surface-border rounded-xl px-[1.25rem] py-[0.875rem] card-shadow">
                    <Layout className="w-[1.125rem] h-[1.125rem] text-ink-muted shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-ink-primary text-[0.875rem] font-medium">{p.nome}</p>
                      <p className="text-ink-muted text-[0.75rem]">{p.plataforma}{p.data_entrega ? ` · entrega ${new Date(p.data_entrega).toLocaleDateString('pt-BR')}` : ''}</p>
                    </div>
                    <span className={cn('text-[0.6875rem] font-semibold px-[0.5rem] py-[0.125rem] rounded-full shrink-0',
                      p.status === 'ativo' ? 'bg-status-green/10 text-status-green' : p.status === 'pausado' ? 'bg-status-orange/10 text-status-orange' : 'bg-ink-muted/10 text-ink-muted'
                    )}>
                      {p.status}
                    </span>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer"
                        className="text-ink-muted hover:text-ads-500 transition-colors shrink-0">
                        <ExternalLink className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                      </a>
                    )}
                    <Button variant="ghost" size="sm" className="w-[2rem] px-0 shrink-0"
                      onClick={() => { setEditandoProjeto(p); setFormProjeto({ nome: p.nome, url: p.url ?? '', plataforma: p.plataforma, status: p.status, data_entrega: p.data_entrega ?? '' }); setNovoProjetoOpen(true) }}>
                      <Pencil className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
                    </Button>
                    <Button variant="ghost" size="sm" className="w-[2rem] px-0 shrink-0 text-status-red hover:text-status-red hover:bg-status-red/10"
                      onClick={() => deletarProjeto(p.id)}>
                      <Trash2 className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {novoProjetoOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-[1rem]">
                <div className="w-full max-w-[28rem] bg-surface-card border border-surface-border rounded-2xl p-[1.5rem] animate-fade-scale flex flex-col gap-[1rem]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-ink-primary text-[1rem] font-semibold">{editandoProjeto ? 'Editar site' : 'Novo site'}</h2>
                    <button onClick={() => setNovoProjetoOpen(false)} className="text-ink-muted hover:text-ink-secondary transition-colors">
                      <XIcon className="w-[1rem] h-[1rem]" strokeWidth={2} />
                    </button>
                  </div>
                  {(['nome', 'url'] as const).map((f) => (
                    <div key={f}>
                      <label className="block text-ink-secondary text-[0.75rem] font-medium mb-[0.25rem] capitalize">{f === 'url' ? 'URL do site' : 'Nome'}</label>
                      <input value={formProjeto[f]} onChange={(e) => setFormProjeto((fp) => ({ ...fp, [f]: e.target.value }))}
                        placeholder={f === 'url' ? 'https://...' : 'Ex: Landing Page Principal'}
                        className="w-full h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30" />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-[0.75rem]">
                    <div>
                      <label className="block text-ink-secondary text-[0.75rem] font-medium mb-[0.25rem]">Plataforma</label>
                      <select value={formProjeto.plataforma} onChange={(e) => setFormProjeto((fp) => ({ ...fp, plataforma: e.target.value }))}
                        className="w-full h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30">
                        {['astro','wordpress','webflow','outro'].map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-ink-secondary text-[0.75rem] font-medium mb-[0.25rem]">Status</label>
                      <select value={formProjeto.status} onChange={(e) => setFormProjeto((fp) => ({ ...fp, status: e.target.value }))}
                        className="w-full h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30">
                        {['ativo','pausado','encerrado'].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-ink-secondary text-[0.75rem] font-medium mb-[0.25rem]">Data de entrega</label>
                    <input type="date" value={formProjeto.data_entrega} onChange={(e) => setFormProjeto((fp) => ({ ...fp, data_entrega: e.target.value }))}
                      className="w-full h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30" />
                  </div>
                  <div className="flex items-center gap-[0.75rem] pt-[0.25rem]">
                    <Button variant="primary" size="sm" onClick={salvarProjeto} disabled={!formProjeto.nome.trim()}>Salvar</Button>
                    <Button variant="ghost" size="sm" onClick={() => setNovoProjetoOpen(false)}>Cancelar</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {whatsappOpen && (
        <WhatsAppTemplateModal
          cliente={cliente}
          onClose={() => setWhatsappOpen(false)}
        />
      )}

      {emailOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-[1rem]">
          <div className="max-w-2xl w-full bg-surface-card border border-surface-border rounded-2xl flex flex-col max-h-[90vh] animate-fade-scale">
            <div className="flex items-center justify-between px-[1.5rem] py-[1.125rem] border-b border-surface-border">
              <h2 className="text-ink-primary text-[1rem] font-semibold">Enviar Email</h2>
              <button
                onClick={() => setEmailOpen(false)}
                className="w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded-lg text-ink-muted hover:text-ink-secondary hover:bg-surface-hover transition-colors"
              >
                <XIcon className="w-[1rem] h-[1rem]" strokeWidth={2} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-[1.25rem]">
              <EmailComposer
                clienteId={cliente.id}
                clienteNome={cliente.nome}
                clienteEmail={cliente.email ?? undefined}
                onSent={() => setEmailOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
