'use client'

import { useState } from 'react'
import { Send, Eye, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { EmailTemplateSelector } from './EmailTemplateSelector'
import type { EmailTemplateId } from '@/lib/types/email'

interface EmailComposerProps {
  clienteId?: string
  clienteNome?: string
  clienteEmail?: string
  defaultTemplate?: EmailTemplateId
  defaultVariables?: Record<string, string>
  onSent?: () => void
}

export function EmailComposer({
  clienteId,
  clienteNome,
  clienteEmail,
  defaultTemplate = 'report-google-ads',
  defaultVariables = {},
  onSent,
}: EmailComposerProps) {
  const [template, setTemplate] = useState<EmailTemplateId>(defaultTemplate)
  const [destinatario, setDestinatario] = useState(clienteEmail ?? '')
  const [cc, setCc] = useState('')
  const [assunto, setAssunto] = useState('')
  const [preview, setPreview] = useState<{ html: string; subject: string } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [sending, setSending] = useState(false)
  const [loadingPreview, setLoadingPreview] = useState(false)

  const variables: Record<string, string> = {
    nome_cliente: clienteNome ?? '',
    cliente_id: clienteId ?? '',
    ...defaultVariables,
  }

  const loadPreview = async () => {
    setLoadingPreview(true)
    try {
      const res = await fetch('/api/v1/relatorios/preview-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: template, variables }),
      })
      const json = await res.json()
      setPreview(json)
      if (!assunto) setAssunto(json.subject)
      setShowPreview(true)
    } catch {
      toast.error('Erro ao gerar preview')
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleSend = async () => {
    if (!destinatario) {
      toast.error('Informe o email de destino')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/v1/relatorios/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId,
          template_id: template,
          destinatario,
          assunto_override: assunto || undefined,
          variables,
          cc: cc ? cc.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast.success('Email enviado com sucesso!', { icon: '📧' })
      onSent?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-[1rem]">
      {/* Template selector */}
      <div>
        <label className="block text-[0.75rem] font-medium text-ink-secondary mb-[0.5rem]">Template</label>
        <EmailTemplateSelector value={template} onChange={setTemplate} />
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[0.75rem]">
        <div>
          <label className="block text-[0.6875rem] text-ink-secondary mb-[0.25rem] font-medium">
            Para <span className="text-status-red">*</span>
          </label>
          <input
            type="email"
            value={destinatario}
            onChange={e => setDestinatario(e.target.value)}
            placeholder="cliente@email.com"
            className="w-full bg-surface-hover border border-surface-border rounded-lg px-[0.75rem] py-[0.5rem] text-[0.8125rem] text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-ads-500/60 focus:ring-1 focus:ring-ads-500/30 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[0.6875rem] text-ink-secondary mb-[0.25rem] font-medium">CC (opcional)</label>
          <input
            type="text"
            value={cc}
            onChange={e => setCc(e.target.value)}
            placeholder="outro@email.com, ..."
            className="w-full bg-surface-hover border border-surface-border rounded-lg px-[0.75rem] py-[0.5rem] text-[0.8125rem] text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-ads-500/60 focus:ring-1 focus:ring-ads-500/30 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-[0.6875rem] text-ink-secondary mb-[0.25rem] font-medium">Assunto (deixe em branco para usar o padrão)</label>
        <input
          type="text"
          value={assunto}
          onChange={e => setAssunto(e.target.value)}
          placeholder="Assunto automático do template"
          className="w-full bg-surface-hover border border-surface-border rounded-lg px-[0.75rem] py-[0.5rem] text-[0.8125rem] text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-ads-500/60 focus:ring-1 focus:ring-ads-500/30 transition-colors"
        />
      </div>

      {/* Preview */}
      {showPreview && preview && (
        <div className="border border-surface-border rounded-xl overflow-hidden">
          <div className="bg-surface-hover px-[0.75rem] py-[0.5rem] flex items-center gap-[0.5rem] border-b border-surface-border">
            <Mail className="w-[0.75rem] h-[0.75rem] text-ink-muted" />
            <span className="text-[0.75rem] text-ink-secondary flex-1 truncate">{preview.subject}</span>
            <button onClick={() => setShowPreview(false)} className="text-[0.625rem] text-ink-muted hover:text-ink-primary">Fechar</button>
          </div>
          <iframe
            srcDoc={preview.html}
            className="w-full h-[20rem] border-0 bg-white"
            title="Preview do email"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-[0.5rem]">
        <button
          onClick={loadPreview}
          disabled={loadingPreview}
          className="flex items-center gap-[0.375rem] h-[2.25rem] px-[0.875rem] rounded-lg text-[0.8125rem] text-ink-secondary bg-surface-hover hover:bg-surface-elevated border border-surface-border transition-all active:scale-[0.97] disabled:opacity-50"
        >
          {loadingPreview ? <Loader2 className="w-[0.875rem] h-[0.875rem] animate-spin" /> : <Eye className="w-[0.875rem] h-[0.875rem]" />}
          Preview
        </button>
        <button
          onClick={handleSend}
          disabled={sending || !destinatario}
          className={cn(
            'flex-1 flex items-center justify-center gap-[0.375rem] h-[2.25rem] rounded-lg text-[0.8125rem] font-semibold',
            'bg-ads-500 text-black hover:bg-ads-400 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {sending ? <Loader2 className="w-[0.875rem] h-[0.875rem] animate-spin" /> : <Send className="w-[0.875rem] h-[0.875rem]" />}
          Enviar Email
        </button>
      </div>
    </div>
  )
}
