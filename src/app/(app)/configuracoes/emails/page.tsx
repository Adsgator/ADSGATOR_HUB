'use client'

import { useEffect, useState, useCallback } from 'react'
import { Mail, Eye, X, Loader2, Pencil, RotateCcw, Plus, Trash2 } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { DrawerEditor } from '@/components/ui/DrawerEditor'
import { Button } from '@/components/ui/Button'
import { useConfirmDialogStore } from '@/lib/hooks/useConfirmDialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface TemplateInfo {
  id: string
  nome: string
  descricao: string | null
  subject_efetivo: string
  html_efetivo: string
  editado: boolean
  custom: boolean
  atualizado_em: string | null
}

// ─── Preview modal ────────────────────────────────────────────────────────────

function PreviewModal({
  templateId,
  htmlOverride,
  subjectOverride,
  onClose,
}: {
  templateId: string
  htmlOverride?: string
  subjectOverride?: string
  onClose: () => void
}) {
  const [html, setHtml]       = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/v1/relatorios/preview-html', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        templateId,
        variables: { nome_cliente: 'Cliente Exemplo', mes_ano: '2026-05' },
        ...(htmlOverride !== undefined ? { html_override: htmlOverride } : {}),
        ...(subjectOverride !== undefined ? { subject_override: subjectOverride } : {}),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.html) setHtml(data.html)
        else setError(data.error ?? 'Erro ao carregar preview.')
      })
      .catch(() => setError('Erro de rede.'))
      .finally(() => setLoading(false))
  }, [templateId, htmlOverride, subjectOverride])

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-scale">
      <div className="relative bg-surface-card border border-surface-border rounded-2xl w-[90vw] max-w-[48rem] h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-[1.25rem] py-[0.875rem] border-b border-surface-border shrink-0">
          <p className="text-ink-primary font-semibold text-[0.9375rem]">Preview do Template</p>
          <button
            onClick={onClose}
            className="w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded-[0.375rem] hover:bg-surface-hover transition-colors"
          >
            <X className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={2} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-[1.5rem] h-[1.5rem] text-ads-500 animate-spin" strokeWidth={2} />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full">
              <p className="text-status-red text-[0.875rem]">{error}</p>
            </div>
          )}
          {html && (
            <iframe
              srcDoc={html}
              className="w-full h-full border-0"
              title="Email preview"
              sandbox="allow-same-origin"
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [loading, setLoading]     = useState(true)
  const [preview, setPreview]     = useState<{ id: string; html?: string; subject?: string } | null>(null)

  // Editor state
  const [editing, setEditing] = useState<TemplateInfo | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editHtml, setEditHtml]       = useState('')
  const [saving, setSaving]           = useState(false)

  // Criação de template customizado
  const [criando, setCriando]       = useState(false)
  const [novoNome, setNovoNome]     = useState('')
  const [novaDescricao, setNovaDescricao] = useState('')
  const [novoSubject, setNovoSubject] = useState('')
  const [novoHtml, setNovoHtml]     = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/email-templates')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTemplates(data.templates ?? [])
    } catch {
      toast.error('Erro ao carregar templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function abrirEditor(t: TemplateInfo) {
    setEditing(t)
    setEditSubject(t.subject_efetivo)
    setEditHtml(t.html_efetivo)
  }

  async function salvar() {
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch('/api/v1/email-templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing.id,
          subject_override: editSubject,
          html_override: editHtml,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Template salvo')
      setEditing(null)
      await carregar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function criarTemplate() {
    setSaving(true)
    try {
      const res = await fetch('/api/v1/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoNome, descricao: novaDescricao, subject: novoSubject, html: novoHtml }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Template criado')
      setCriando(false)
      setNovoNome(''); setNovaDescricao(''); setNovoSubject(''); setNovoHtml('')
      await carregar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao criar template')
    } finally {
      setSaving(false)
    }
  }

  function excluirTemplate(t: TemplateInfo) {
    const openConfirm = useConfirmDialogStore.getState().openConfirm
    openConfirm(
      'Excluir Template',
      `O template personalizado "${t.nome}" será removido permanentemente.`,
      async () => {
        try {
          const res = await fetch(`/api/v1/email-templates?id=${encodeURIComponent(t.id)}`, { method: 'DELETE' })
          if (!res.ok) throw new Error((await res.json()).error)
          toast.success('Template excluído')
          await carregar()
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Erro ao excluir')
        }
      },
    )
  }

  async function restaurar(t: TemplateInfo) {
    try {
      const res = await fetch('/api/v1/email-templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: t.id, subject_override: null, html_override: null }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Template restaurado ao padrão')
      await carregar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao restaurar')
    }
  }

  return (
    <MainLayout
      title="Templates de Email"
      subtitle="Edite o assunto e o HTML de cada email. Sem edição, usa o template padrão."
      actions={
        <button
          onClick={() => setCriando(true)}
          className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors"
        >
          <Plus className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} />
          Novo template
        </button>
      }
    >
      <div className="page-enter space-y-[1rem]">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-[5rem] rounded-xl bg-surface-hover skeleton-shimmer" />)
        ) : (
          templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-surface-card border border-surface-border rounded-xl px-[1.25rem] py-[1rem] card-shadow flex items-start justify-between gap-[1rem]"
            >
              <div className="flex items-start gap-[0.875rem] min-w-0">
                <div className="w-[2.25rem] h-[2.25rem] rounded-[0.5rem] bg-ads-500/10 flex items-center justify-center shrink-0">
                  <Mail className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-[0.5rem]">
                    <p className="text-ink-primary font-semibold text-[0.875rem]">{tmpl.nome}</p>
                    {tmpl.custom ? (
                      <span className="px-[0.5rem] py-[0.0625rem] rounded-full text-[0.625rem] font-medium bg-status-purple/10 text-status-purple">
                        Personalizado
                      </span>
                    ) : tmpl.editado && (
                      <span className="px-[0.5rem] py-[0.0625rem] rounded-full text-[0.625rem] font-medium bg-ads-500/10 text-ads-600">
                        Editado
                      </span>
                    )}
                  </div>
                  <p className="text-ink-secondary text-[0.8125rem] mt-[0.125rem] leading-snug">{tmpl.descricao}</p>
                  <p className="text-ink-muted text-[0.75rem] mt-[0.375rem] font-mono truncate">{tmpl.subject_efetivo}</p>
                </div>
              </div>

              <div className="flex items-center gap-[0.375rem] shrink-0">
                {tmpl.editado && !tmpl.custom && (
                  <button
                    onClick={() => restaurar(tmpl)}
                    title="Restaurar padrão"
                    className="flex items-center gap-[0.375rem] h-[2rem] px-[0.625rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-muted text-[0.8125rem] hover:text-status-orange hover:border-status-orange/40 transition-colors"
                  >
                    <RotateCcw className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                  </button>
                )}
                {tmpl.custom && (
                  <button
                    onClick={() => excluirTemplate(tmpl)}
                    title="Excluir template"
                    className="flex items-center gap-[0.375rem] h-[2rem] px-[0.625rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-muted text-[0.8125rem] hover:text-status-red hover:border-status-red/40 transition-colors"
                  >
                    <Trash2 className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                  </button>
                )}
                <button
                  onClick={() => setPreview({ id: tmpl.id })}
                  className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] font-medium hover:border-ads-500/40 hover:text-ads-500 transition-colors"
                >
                  <Eye className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                  Preview
                </button>
                <button
                  onClick={() => abrirEditor(tmpl)}
                  className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500/10 border border-ads-500/30 text-ads-600 text-[0.8125rem] font-medium hover:bg-ads-500/20 transition-colors"
                >
                  <Pencil className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                  Editar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Editor drawer */}
      <DrawerEditor
        open={!!editing}
        onClose={() => setEditing(null)}
        onSave={salvar}
        saving={saving}
        title={editing ? `Editar: ${editing.nome}` : ''}
        subtitle="Use {{variavel}} para campos dinâmicos"
        width="40rem"
      >
        {editing && (
          <div className="space-y-[1rem]">
            <div>
              <label className="block text-[0.8125rem] font-medium text-ink-secondary mb-[0.375rem]">Assunto</label>
              <input
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full bg-surface-base border border-surface-border rounded-[0.5rem] px-[0.75rem] py-[0.5rem] text-[0.875rem] text-ink-primary focus-ring"
              />
            </div>
            <div>
              <label className="block text-[0.8125rem] font-medium text-ink-secondary mb-[0.375rem]">HTML do email</label>
              <textarea
                value={editHtml}
                onChange={(e) => setEditHtml(e.target.value)}
                spellCheck={false}
                className="w-full h-[24rem] bg-surface-base border border-surface-border rounded-[0.5rem] px-[0.75rem] py-[0.5rem] text-[0.75rem] font-mono text-ink-primary focus-ring resize-none"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<Eye className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />}
              onClick={() => setPreview({ id: editing.id, html: editHtml, subject: editSubject })}
            >
              Pré-visualizar edição
            </Button>
          </div>
        )}
      </DrawerEditor>

      {/* Drawer de criação de template customizado */}
      <DrawerEditor
        open={criando}
        onClose={() => setCriando(false)}
        onSave={criarTemplate}
        saving={saving}
        title="Novo template de email"
        subtitle="Use {{variavel}} para campos dinâmicos (ex.: {{nome_cliente}})"
        width="40rem"
      >
        <div className="space-y-[1rem]">
          <div>
            <label className="block text-[0.8125rem] font-medium text-ink-secondary mb-[0.375rem]">Nome *</label>
            <input
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex.: Proposta comercial"
              className="w-full bg-surface-base border border-surface-border rounded-[0.5rem] px-[0.75rem] py-[0.5rem] text-[0.875rem] text-ink-primary focus-ring"
            />
          </div>
          <div>
            <label className="block text-[0.8125rem] font-medium text-ink-secondary mb-[0.375rem]">Descrição</label>
            <input
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              placeholder="Quando este email é usado…"
              className="w-full bg-surface-base border border-surface-border rounded-[0.5rem] px-[0.75rem] py-[0.5rem] text-[0.875rem] text-ink-primary focus-ring"
            />
          </div>
          <div>
            <label className="block text-[0.8125rem] font-medium text-ink-secondary mb-[0.375rem]">Assunto *</label>
            <input
              value={novoSubject}
              onChange={(e) => setNovoSubject(e.target.value)}
              placeholder="Ex.: Proposta para {{nome_cliente}}"
              className="w-full bg-surface-base border border-surface-border rounded-[0.5rem] px-[0.75rem] py-[0.5rem] text-[0.875rem] text-ink-primary focus-ring"
            />
          </div>
          <div>
            <label className="block text-[0.8125rem] font-medium text-ink-secondary mb-[0.375rem]">HTML do email *</label>
            <textarea
              value={novoHtml}
              onChange={(e) => setNovoHtml(e.target.value)}
              spellCheck={false}
              placeholder="<p>Olá {{nome_cliente}}, …</p>"
              className="w-full h-[20rem] bg-surface-base border border-surface-border rounded-[0.5rem] px-[0.75rem] py-[0.5rem] text-[0.75rem] font-mono text-ink-primary focus-ring resize-none"
            />
          </div>
        </div>
      </DrawerEditor>

      {preview && (
        <PreviewModal
          templateId={preview.id}
          htmlOverride={preview.html}
          subjectOverride={preview.subject}
          onClose={() => setPreview(null)}
        />
      )}
    </MainLayout>
  )
}
