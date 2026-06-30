'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ChevronRight,
  MessageCircle,
  Phone,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { FLUXO_OPERACIONAL, ORDEM_ESTAGIOS_PREVENDA } from '@/lib/fluxo-operacional'

// ─── Types ────────────────────────────────────────────────────────────────────

type EstagioPreVenda = (typeof ORDEM_ESTAGIOS_PREVENDA)[number]

interface Prospect {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  nicho: string | null
  cidade: string | null
  origem: string | null
  valor_proposta: number | null
  observacoes: string | null
  estagio: EstagioPreVenda
  created_at: string
}

type FormData = Omit<Prospect, 'id' | 'created_at'>

const ORIGEM_OPTIONS = ['indicacao', 'inbound', 'outbound', 'ads'] as const

const EMPTY_FORM: FormData = {
  nome: '',
  telefone: '',
  email: '',
  nicho: '',
  cidade: '',
  origem: 'inbound',
  valor_proposta: null,
  observacoes: '',
  estagio: 'prospeccao',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(value: number | null): string {
  if (value == null) return ''
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function whatsappLink(telefone: string): string {
  const clean = telefone.replace(/\D/g, '')
  return `https://wa.me/55${clean}`
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  initial: FormData
  isEdit: boolean
  saving: boolean
  onSave: (data: FormData) => void
  onDelete?: () => void
  onClose: () => void
}

function ProspectModal({ initial, isEdit, saving, onSave, onDelete, onClose }: ModalProps) {
  const [form, setForm] = useState<FormData>(initial)

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const inputCls = 'w-full h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30'
  const labelCls = 'block text-[0.75rem] font-medium text-ink-secondary mb-[0.25rem]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-[32rem] bg-surface-card border border-surface-border rounded-xl card-shadow animate-fade-scale overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-[1.25rem] py-[1rem] border-b border-surface-border">
          <h2 className="text-[0.9375rem] font-semibold text-ink-primary">
            {isEdit ? 'Editar Prospect' : 'Novo Prospect'}
          </h2>
          <button
            onClick={onClose}
            className="w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-[1.25rem] grid grid-cols-2 gap-[0.875rem] max-h-[70vh] overflow-y-auto">
          {/* Nome */}
          <div className="col-span-2">
            <label className={labelCls}>Nome *</label>
            <input
              className={inputCls}
              value={form.nome}
              onChange={e => set('nome', e.target.value)}
              placeholder="Nome do prospect"
            />
          </div>

          {/* Telefone */}
          <div>
            <label className={labelCls}>Telefone (WhatsApp)</label>
            <input
              className={inputCls}
              value={form.telefone ?? ''}
              onChange={e => set('telefone', e.target.value || null)}
              placeholder="(11) 99999-9999"
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>E-mail</label>
            <input
              type="email"
              className={inputCls}
              value={form.email ?? ''}
              onChange={e => set('email', e.target.value || null)}
              placeholder="email@exemplo.com"
            />
          </div>

          {/* Nicho */}
          <div>
            <label className={labelCls}>Nicho</label>
            <input
              className={inputCls}
              value={form.nicho ?? ''}
              onChange={e => set('nicho', e.target.value || null)}
              placeholder="Ex: Clínica odontológica"
            />
          </div>

          {/* Cidade */}
          <div>
            <label className={labelCls}>Cidade</label>
            <input
              className={inputCls}
              value={form.cidade ?? ''}
              onChange={e => set('cidade', e.target.value || null)}
              placeholder="Ex: São Paulo - SP"
            />
          </div>

          {/* Origem */}
          <div>
            <label className={labelCls}>Origem</label>
            <select
              className={inputCls}
              value={form.origem ?? 'inbound'}
              onChange={e => set('origem', e.target.value)}
            >
              {ORIGEM_OPTIONS.map(o => (
                <option key={o} value={o}>
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Valor proposta */}
          <div>
            <label className={labelCls}>Valor da Proposta (R$)</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.valor_proposta ?? ''}
              onChange={e =>
                set('valor_proposta', e.target.value ? Number(e.target.value) : null)
              }
              placeholder="0,00"
            />
          </div>

          {/* Observações */}
          <div className="col-span-2">
            <label className={labelCls}>Observações</label>
            <textarea
              rows={3}
              className="w-full px-[0.75rem] py-[0.5rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 resize-none"
              value={form.observacoes ?? ''}
              onChange={e => set('observacoes', e.target.value || null)}
              placeholder="Anotações sobre o prospect..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-[1.25rem] py-[1rem] border-t border-surface-border">
          {isEdit && onDelete ? (
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={13} />}
              onClick={onDelete}
            >
              Excluir
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-[0.5rem]">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={() => onSave(form)}
            >
              {isEdit ? 'Salvar' : 'Criar Prospect'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  prospect: Prospect
  isLast: boolean
  onAdvance: (prospect: Prospect) => void
  onEdit: (prospect: Prospect) => void
}

function ProspectCard({ prospect, isLast, onAdvance, onEdit }: CardProps) {
  return (
    <div
      onClick={() => onEdit(prospect)}
      className="bg-surface-card border border-surface-border rounded-xl p-[1rem] card-shadow card-interactive cursor-pointer select-none"
    >
      {/* Nome */}
      <p className="text-[0.875rem] font-semibold text-ink-primary leading-snug mb-[0.375rem]">
        {prospect.nome}
      </p>

      {/* Nicho + Cidade */}
      <div className="flex flex-wrap gap-x-[0.5rem] gap-y-[0.125rem] mb-[0.625rem]">
        {prospect.nicho && (
          <span className="text-[0.75rem] text-ink-secondary">{prospect.nicho}</span>
        )}
        {prospect.nicho && prospect.cidade && (
          <span className="text-[0.75rem] text-ink-muted">·</span>
        )}
        {prospect.cidade && (
          <span className="text-[0.75rem] text-ink-muted">{prospect.cidade}</span>
        )}
      </div>

      {/* Valor */}
      {prospect.valor_proposta != null && (
        <p className="text-[0.8125rem] font-medium text-ads-500 mb-[0.625rem]">
          {fmtCurrency(prospect.valor_proposta)}
        </p>
      )}

      {/* Actions row */}
      <div
        className="flex items-center justify-between"
        onClick={e => e.stopPropagation()}
      >
        {/* WhatsApp link */}
        {prospect.telefone ? (
          <a
            href={whatsappLink(prospect.telefone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-[0.25rem] text-[0.75rem] text-status-green hover:underline"
          >
            <MessageCircle size={12} />
            WhatsApp
          </a>
        ) : (
          <span className="flex items-center gap-[0.25rem] text-[0.75rem] text-ink-muted">
            <Phone size={12} />
            Sem telefone
          </span>
        )}

        {/* Advance button */}
        {!isLast && (
          <button
            onClick={() => onAdvance(prospect)}
            className="flex items-center gap-[0.125rem] text-[0.75rem] text-ink-secondary hover:text-ink-primary transition-colors px-[0.375rem] py-[0.125rem] rounded-md hover:bg-surface-hover"
          >
            Avançar
            <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProspectarPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Prospect | null>(null)

  // ── Load ────────────────────────────────────────────────────────────────────

  const loadProspects = useCallback(async () => {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error && data) {
      setProspects(data as Prospect[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProspects()
  }, [loadProspects])

  // ── Save (create or update) ──────────────────────────────────────────────────

  async function handleSave(form: FormData) {
    if (!form.nome.trim()) return
    setSaving(true)

    const { error } = editing
      ? await supabase.from('prospects').update(form).eq('id', editing.id)
      : await supabase.from('prospects').insert(form)

    setSaving(false)
    if (error) { toast.error('Erro ao salvar prospect'); return }
    toast.success(editing ? 'Prospect atualizado' : 'Prospect criado')
    setModalOpen(false)
    setEditing(null)
    await loadProspects()
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!editing) return
    const { error } = await supabase.from('prospects').delete().eq('id', editing.id)
    if (error) { toast.error('Erro ao excluir prospect'); return }
    toast.success('Prospect excluído')
    setModalOpen(false)
    setEditing(null)
    await loadProspects()
  }

  // ── Advance stage ────────────────────────────────────────────────────────────

  async function handleAdvance(prospect: Prospect) {
    const currentIndex = ORDEM_ESTAGIOS_PREVENDA.indexOf(prospect.estagio)
    const nextEstagio = ORDEM_ESTAGIOS_PREVENDA[currentIndex + 1]
    if (!nextEstagio) return

    const { error } = await supabase
      .from('prospects')
      .update({ estagio: nextEstagio })
      .eq('id', prospect.id)

    if (error) { toast.error('Erro ao avançar estágio'); return }
    await loadProspects()
  }

  // ── Columns ──────────────────────────────────────────────────────────────────

  const columns = ORDEM_ESTAGIOS_PREVENDA.map(estagio => ({
    estagio,
    etapa: FLUXO_OPERACIONAL[estagio],
    items: prospects.filter(p => p.estagio === estagio),
  }))

  // ── Open modal ──────────────────────────────────────────────────────────────

  function openNew() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(prospect: Prospect) {
    setEditing(prospect)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <MainLayout
      title="Prospectar"
      subtitle="Pipeline de pré-venda"
      actions={
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={openNew}
        >
          Novo Prospect
        </Button>
      }
    >
      <div className="page-enter h-full flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-[0.875rem] text-ink-muted">
            Carregando...
          </div>
        ) : (
          <div className="flex gap-[1rem] overflow-x-auto pb-[1rem] h-full">
            {columns.map(({ estagio, etapa, items }) => {
              const isLastStage =
                ORDEM_ESTAGIOS_PREVENDA.indexOf(estagio as EstagioPreVenda) ===
                ORDEM_ESTAGIOS_PREVENDA.length - 1

              return (
                <div
                  key={estagio}
                  className="flex-shrink-0 w-[17rem] flex flex-col gap-[0.75rem]"
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[0.5rem]">
                      <span
                        className={cn(
                          'px-[0.5rem] py-[0.125rem] rounded-full text-[0.75rem] font-medium',
                          etapa.corBadge,
                        )}
                      >
                        {etapa.label}
                      </span>
                      <span className="text-[0.75rem] text-ink-muted font-medium tabular-nums">
                        {items.length}
                      </span>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-[0.625rem] flex-1 overflow-y-auto">
                    {items.length === 0 ? (
                      <div className="flex items-center justify-center py-[2rem] text-[0.8125rem] text-ink-muted text-center border border-dashed border-surface-border rounded-xl">
                        Nenhum prospect
                      </div>
                    ) : (
                      items.map(p => (
                        <ProspectCard
                          key={p.id}
                          prospect={p}
                          isLast={isLastStage}
                          onAdvance={handleAdvance}
                          onEdit={openEdit}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <ProspectModal
          initial={
            editing
              ? {
                  nome: editing.nome,
                  telefone: editing.telefone,
                  email: editing.email,
                  nicho: editing.nicho,
                  cidade: editing.cidade,
                  origem: editing.origem,
                  valor_proposta: editing.valor_proposta,
                  observacoes: editing.observacoes,
                  estagio: editing.estagio,
                }
              : EMPTY_FORM
          }
          isEdit={!!editing}
          saving={saving}
          onSave={handleSave}
          onDelete={editing ? handleDelete : undefined}
          onClose={closeModal}
        />
      )}
    </MainLayout>
  )
}
