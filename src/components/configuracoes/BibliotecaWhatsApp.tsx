'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { MessageCircle, Pencil, Trash2, Plus, Search, RotateCcw } from 'lucide-react'
import { DrawerEditor } from '@/components/ui/DrawerEditor'
import { useConfirmDialogStore } from '@/lib/hooks/useConfirmDialog'
import { CATEGORIA_LABEL, CATEGORIA_ORDEM, WHATSAPP_VARIAVEIS } from '@/lib/whatsapp'
import { toast } from 'sonner'

interface SnippetInfo {
  id:            string
  titulo:        string
  mensagem:      string
  categoria:     string
  ordem:         number
  seed:          boolean
  editado:       boolean
  atualizado_em: string | null
}

const VAZIO = { id: '', titulo: '', mensagem: '', categoria: 'outros' }

// ─── Card de uma mensagem ──────────────────────────────────────────────────────
function SnippetCard({ s, onEditar, onRestaurar, onExcluir }: {
  s: SnippetInfo
  onEditar: () => void
  onRestaurar: () => void
  onExcluir: () => void
}) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl px-[1.25rem] py-[1rem] card-shadow card-interactive flex items-start justify-between gap-[1rem]">
      <div className="flex items-start gap-[0.875rem] min-w-0">
        <div className="w-[2.25rem] h-[2.25rem] rounded-[0.5rem] bg-status-green/10 flex items-center justify-center shrink-0">
          <MessageCircle className="w-[1rem] h-[1rem] text-status-green" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-[0.5rem] flex-wrap">
            <p className="text-ink-primary font-semibold text-[0.875rem]">{s.titulo}</p>
            {!s.seed ? (
              <span className="px-[0.5rem] py-[0.0625rem] rounded-full text-[0.625rem] font-medium bg-status-purple/10 text-status-purple">
                Personalizada
              </span>
            ) : s.editado && (
              <span className="px-[0.5rem] py-[0.0625rem] rounded-full text-[0.625rem] font-medium bg-ads-500/10 text-ads-600">
                Editada
              </span>
            )}
          </div>
          <p className="text-ink-secondary text-[0.8125rem] mt-[0.25rem] leading-snug line-clamp-2 whitespace-pre-line">{s.mensagem}</p>
        </div>
      </div>

      <div className="flex items-center gap-[0.375rem] shrink-0">
        {s.seed && s.editado && (
          <button
            onClick={onRestaurar}
            title="Restaurar padrão"
            className="flex items-center justify-center h-[2rem] w-[2rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-muted hover:text-status-orange hover:border-status-orange/40 transition-colors"
          >
            <RotateCcw className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
          </button>
        )}
        {!s.seed && (
          <button
            onClick={onExcluir}
            title="Excluir mensagem"
            className="flex items-center justify-center h-[2rem] w-[2rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-muted hover:text-status-red hover:border-status-red/40 transition-colors"
          >
            <Trash2 className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
          </button>
        )}
        <button
          onClick={onEditar}
          className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500/10 border border-ads-500/30 text-ads-600 text-[0.8125rem] font-medium hover:bg-ads-500/20 transition-colors"
        >
          <Pencil className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
          Editar
        </button>
      </div>
    </div>
  )
}

export function BibliotecaWhatsApp() {
  const [snippets, setSnippets] = useState<SnippetInfo[]>([])
  const [loading, setLoading]   = useState(true)
  const [busca, setBusca]       = useState('')

  // Editor (edição de existente OU criação — distinguido por `criando`)
  const [editing, setEditing]   = useState<SnippetInfo | null>(null)
  const [criando, setCriando]   = useState(false)
  const [form, setForm]         = useState(VAZIO)
  const [saving, setSaving]     = useState(false)
  const msgRef = useRef<HTMLTextAreaElement>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/whatsapp-snippets')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSnippets(data.snippets ?? [])
    } catch {
      toast.error('Erro ao carregar mensagens')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function abrirEdicao(s: SnippetInfo) {
    setCriando(false)
    setEditing(s)
    setForm({ id: s.id, titulo: s.titulo, mensagem: s.mensagem, categoria: s.categoria })
  }

  function abrirCriacao() {
    setEditing(null)
    setCriando(true)
    setForm(VAZIO)
  }

  function fecharEditor() { setEditing(null); setCriando(false) }

  // Insere {{variavel}} na posição do cursor da textarea de mensagem.
  function inserirVariavel(nome: string) {
    const token = `{{${nome}}}`
    const ta = msgRef.current
    if (!ta) { setForm((f) => ({ ...f, mensagem: f.mensagem + token })); return }
    const start = ta.selectionStart ?? form.mensagem.length
    const end   = ta.selectionEnd ?? form.mensagem.length
    const nova  = form.mensagem.slice(0, start) + token + form.mensagem.slice(end)
    setForm((f) => ({ ...f, mensagem: nova }))
    requestAnimationFrame(() => {
      ta.focus()
      const pos = start + token.length
      ta.setSelectionRange(pos, pos)
    })
  }

  const grupos = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const filtrados = termo
      ? snippets.filter((s) => [s.titulo, s.mensagem].some((c) => c.toLowerCase().includes(termo)))
      : snippets
    const porCat = new Map<string, SnippetInfo[]>()
    for (const s of filtrados) {
      const cat = CATEGORIA_LABEL[s.categoria] ? s.categoria : 'outros'
      if (!porCat.has(cat)) porCat.set(cat, [])
      porCat.get(cat)!.push(s)
    }
    return CATEGORIA_ORDEM
      .filter((c) => porCat.has(c))
      .map((c) => ({ categoria: c, label: CATEGORIA_LABEL[c], items: porCat.get(c)! }))
  }, [snippets, busca])

  async function salvar() {
    if (!form.titulo.trim() || !form.mensagem.trim()) {
      toast.error('Preencha título e mensagem')
      return
    }
    setSaving(true)
    try {
      const res = criando
        ? await fetch('/api/v1/whatsapp-snippets', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo: form.titulo, mensagem: form.mensagem, categoria: form.categoria }),
          })
        : await fetch('/api/v1/whatsapp-snippets', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: form.id, titulo: form.titulo, mensagem: form.mensagem, categoria: form.categoria }),
          })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(criando ? 'Mensagem criada' : 'Mensagem salva')
      fecharEditor()
      await carregar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  function excluir(s: SnippetInfo) {
    useConfirmDialogStore.getState().openConfirm(
      'Excluir mensagem',
      `A mensagem "${s.titulo}" será removida permanentemente.`,
      async () => {
        try {
          const res = await fetch(`/api/v1/whatsapp-snippets?id=${encodeURIComponent(s.id)}`, { method: 'DELETE' })
          if (!res.ok) throw new Error((await res.json()).error)
          toast.success('Mensagem excluída')
          await carregar()
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Erro ao excluir')
        }
      },
    )
  }

  async function restaurar(s: SnippetInfo) {
    try {
      const res = await fetch('/api/v1/whatsapp-snippets', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, restaurar: true }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Mensagem restaurada ao padrão')
      await carregar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao restaurar')
    }
  }

  return (
    <div className="space-y-[1.25rem]">
      <div className="flex items-center justify-between gap-[1rem] flex-wrap">
        <div className="min-w-0">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Mensagens de WhatsApp</h3>
          <p className="text-ink-secondary text-[0.8125rem] mt-[0.125rem]">
            Biblioteca de respostas rápidas usada ao enviar WhatsApp aos clientes. Use {'{{primeiro_nome}}'} para personalizar.
          </p>
        </div>
        <div className="flex items-center gap-[0.5rem]">
          <div className="relative">
            <Search className="absolute left-[0.625rem] top-1/2 -translate-y-1/2 w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={2} />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar mensagem…"
              className="h-[2rem] w-[12rem] pl-[2rem] pr-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-primary text-[0.8125rem] focus-ring"
            />
          </div>
          <button
            onClick={abrirCriacao}
            className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors shrink-0"
          >
            <Plus className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} />
            Nova mensagem
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-[1rem]">
          {[1, 2, 3].map((i) => <div key={i} className="h-[5rem] rounded-xl bg-surface-hover skeleton-shimmer" />)}
        </div>
      ) : grupos.length === 0 ? (
        <div className="text-center py-[3rem] text-ink-muted text-[0.875rem]">
          Nenhuma mensagem encontrada{busca ? ` para “${busca}”` : ''}.
        </div>
      ) : (
        <div className="space-y-[1.75rem]">
          {grupos.map((g) => (
            <div key={g.categoria} className="space-y-[0.625rem]">
              <div className="flex items-center gap-[0.5rem]">
                <h4 className="text-ink-secondary text-[0.75rem] font-semibold uppercase tracking-wider">{g.label}</h4>
                <span className="text-ink-muted text-[0.6875rem]">{g.items.length}</span>
                <div className="flex-1 h-px bg-surface-border" />
              </div>
              <div className="space-y-[0.75rem]">
                {g.items.map((s) => (
                  <SnippetCard
                    key={s.id}
                    s={s}
                    onEditar={() => abrirEdicao(s)}
                    onRestaurar={() => restaurar(s)}
                    onExcluir={() => excluir(s)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <DrawerEditor
        open={!!editing || criando}
        onClose={fecharEditor}
        onSave={salvar}
        saving={saving}
        title={criando ? 'Nova mensagem' : `Editar: ${editing?.titulo ?? ''}`}
        subtitle="Use {{primeiro_nome}} para personalizar com o nome do cliente"
        width="38rem"
      >
        <div className="space-y-[1rem]">
          <div>
            <label className="block text-[0.8125rem] font-medium text-ink-secondary mb-[0.375rem]">Título *</label>
            <input
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Ex.: Boas-vindas"
              className="w-full bg-surface-base border border-surface-border rounded-[0.5rem] px-[0.75rem] py-[0.5rem] text-[0.875rem] text-ink-primary focus-ring"
            />
          </div>
          <div>
            <label className="block text-[0.8125rem] font-medium text-ink-secondary mb-[0.375rem]">Categoria</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
              className="w-full bg-surface-base border border-surface-border rounded-[0.5rem] px-[0.75rem] py-[0.5rem] text-[0.875rem] text-ink-primary focus-ring"
            >
              {CATEGORIA_ORDEM.map((c) => (
                <option key={c} value={c}>{CATEGORIA_LABEL[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[0.8125rem] font-medium text-ink-secondary mb-[0.375rem]">
              Variáveis <span className="text-ink-muted font-normal">— clique para inserir</span>
            </label>
            <div className="flex flex-wrap gap-[0.375rem]">
              {WHATSAPP_VARIAVEIS.map((nome) => (
                <button
                  key={nome}
                  type="button"
                  onClick={() => inserirVariavel(nome)}
                  title={`Inserir {{${nome}}}`}
                  className="px-[0.5rem] h-[1.625rem] rounded-[0.375rem] bg-ads-500/10 border border-ads-500/30 text-ads-600 text-[0.75rem] font-mono hover:bg-ads-500/20 transition-colors"
                >
                  {`{{${nome}}}`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[0.8125rem] font-medium text-ink-secondary mb-[0.375rem]">Mensagem *</label>
            <textarea
              ref={msgRef}
              value={form.mensagem}
              onChange={(e) => setForm((f) => ({ ...f, mensagem: e.target.value }))}
              rows={12}
              placeholder="Oi {{primeiro_nome}}, tudo bem? …"
              className="w-full bg-surface-base border border-surface-border rounded-[0.5rem] px-[0.75rem] py-[0.5rem] text-[0.875rem] text-ink-primary leading-relaxed focus-ring resize-none"
            />
          </div>
        </div>
      </DrawerEditor>
    </div>
  )
}
