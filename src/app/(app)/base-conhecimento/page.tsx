'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Search, Plus, BookOpen, Tag, X, Trash2, Calendar,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button }     from '@/components/ui/Button'
import { supabase }   from '@/lib/supabase'
import { cn }         from '@/lib/utils'
import { useConfirmDialogStore } from '@/lib/hooks/useConfirmDialog'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Article {
  id: string
  titulo: string
  conteudo: string
  categoria: string | null
  tags: string[] | null
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function excerpt(text: string, len = 100) {
  if (!text) return ''
  return text.length > len ? text.slice(0, len).trimEnd() + '…' : text
}

// ─── New article modal ────────────────────────────────────────────────────────

interface NewArticleModalProps {
  onClose: () => void
  onSaved: () => void
}

function NewArticleModal({ onClose, onSaved }: NewArticleModalProps) {
  const [titulo,     setTitulo]     = useState('')
  const [categoria,  setCategoria]  = useState('')
  const [tagsInput,  setTagsInput]  = useState('')
  const [conteudo,   setConteudo]   = useState('')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  async function handleSave() {
    if (!titulo.trim()) { setError('Título obrigatório'); return }
    setSaving(true)
    setError(null)
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    const { error: err } = await supabase.from('knowledge_base').insert({
      titulo:    titulo.trim(),
      conteudo:  conteudo.trim(),
      categoria: categoria.trim() || null,
      tags:      tags.length > 0 ? tags : null,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-[40rem] bg-surface-card border border-surface-border rounded-2xl card-shadow animate-fade-scale flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-[1.5rem] py-[1rem] border-b border-surface-border">
          <h2 className="text-ink-primary font-semibold text-[0.9375rem]">Novo Artigo</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink-primary transition-colors">
            <X className="w-[1.125rem] h-[1.125rem]" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-[1rem] px-[1.5rem] py-[1.25rem] overflow-y-auto">
          {/* Título */}
          <div className="flex flex-col gap-[0.375rem]">
            <label className="text-ink-secondary text-[0.8125rem] font-medium">Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Como configurar UTMs no Google Ads"
              className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary placeholder:text-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
            />
          </div>

          {/* Categoria */}
          <div className="flex flex-col gap-[0.375rem]">
            <label className="text-ink-secondary text-[0.8125rem] font-medium">Categoria</label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ex: Google Ads, Onboarding, Relatórios…"
              className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary placeholder:text-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-[0.375rem]">
            <label className="text-ink-secondary text-[0.8125rem] font-medium">Tags</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="utm, campanha, conversão (separadas por vírgula)"
              className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary placeholder:text-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
            />
          </div>

          {/* Conteúdo */}
          <div className="flex flex-col gap-[0.375rem]">
            <label className="text-ink-secondary text-[0.8125rem] font-medium">Conteúdo</label>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreva o conteúdo do artigo…"
              rows={10}
              className="px-[0.75rem] py-[0.625rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary placeholder:text-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors resize-y min-h-[12rem]"
            />
          </div>

          {error && (
            <p className="text-status-red text-[0.8125rem]">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[0.5rem] px-[1.5rem] py-[1rem] border-t border-surface-border">
          <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="md" loading={saving} onClick={handleSave}>Salvar Artigo</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Read modal ───────────────────────────────────────────────────────────────

interface ReadModalProps {
  article: Article
  onClose: () => void
  onDeleted: () => void
}

function ReadModal({ article, onClose, onDeleted }: ReadModalProps) {
  const [deleting, setDeleting] = useState(false)

  function handleDelete() {
    const openConfirm = useConfirmDialogStore.getState().openConfirm
    openConfirm(
      'Deletar Artigo',
      `Você está prestes a excluir "${article.titulo}". Esta ação não pode ser desfeita.`,
      async () => {
        setDeleting(true)
        await supabase.from('knowledge_base').delete().eq('id', article.id)
        setDeleting(false)
        onDeleted()
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[48rem] bg-surface-card border border-surface-border rounded-2xl card-shadow animate-fade-scale flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-[1.5rem] py-[1rem] border-b border-surface-border gap-[1rem]">
          <div className="flex flex-col gap-[0.25rem]">
            <h2 className="text-ink-primary font-semibold text-[1rem] leading-snug">{article.titulo}</h2>
            <div className="flex items-center gap-[0.5rem] flex-wrap">
              {article.categoria && (
                <span className="text-[0.6875rem] font-medium text-ads-500 bg-ads-500/10 border border-ads-500/25 rounded-full px-[0.5rem] py-[0.0625rem]">
                  {article.categoria}
                </span>
              )}
              {article.tags?.map((tag) => (
                <span key={tag} className="text-[0.6875rem] font-medium text-ink-muted bg-surface-hover border border-surface-border/40 rounded-full px-[0.5rem] py-[0.0625rem]">
                  #{tag}
                </span>
              ))}
              <span className="flex items-center gap-[0.25rem] text-ink-muted text-[0.6875rem]">
                <Calendar className="w-[0.625rem] h-[0.625rem]" strokeWidth={1.75} />
                {formatDate(article.created_at)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink-primary transition-colors shrink-0 mt-[0.125rem]">
            <X className="w-[1.125rem] h-[1.125rem]" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-[1.5rem] py-[1.25rem] flex-1">
          {article.conteudo ? (
            <pre className="text-ink-secondary text-[0.875rem] leading-relaxed whitespace-pre-wrap font-[inherit]">
              {article.conteudo}
            </pre>
          ) : (
            <p className="text-ink-muted text-[0.875rem] italic">Sem conteúdo.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-[1.5rem] py-[1rem] border-t border-surface-border">
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
            loading={deleting}
            onClick={handleDelete}
          >
            Excluir
          </Button>
          <Button variant="ghost" size="md" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BaseConhecimentoPage() {
  const [articles,   setArticles]   = useState<Article[]>([])
  const [loading,    setLoading]    = useState(true)
  const [tableError, setTableError] = useState(false)
  const [busca,      setBusca]      = useState('')
  const [categoria,  setCategoria]  = useState('')
  const [showNew,    setShowNew]    = useState(false)
  const [readArt,    setReadArt]    = useState<Article | null>(null)

  async function carregar() {
    setLoading(true)
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false })
    setLoading(false)
    if (error) {
      setTableError(true)
      return
    }
    setTableError(false)
    setArticles((data as Article[]) ?? [])
  }

  useEffect(() => { carregar() }, [])

  // ── Derived ──────────────────────────────────────────────────────────────────
  const categorias = useMemo(() => {
    const set = new Set<string>()
    articles.forEach((a) => { if (a.categoria) set.add(a.categoria) })
    return Array.from(set).sort()
  }, [articles])

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase()
    return articles.filter((a) => {
      const matchCat = categoria === '' || a.categoria === categoria
      const matchBusca = busca === '' ||
        a.titulo.toLowerCase().includes(q) ||
        (a.categoria ?? '').toLowerCase().includes(q) ||
        (a.tags ?? []).some((t) => t.toLowerCase().includes(q))
      return matchCat && matchBusca
    })
  }, [articles, busca, categoria])

  return (
    <MainLayout
      title="Base de Conhecimento"
      subtitle={loading ? '…' : `${articles.length} artigo${articles.length !== 1 ? 's' : ''}`}
      actions={
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
          onClick={() => setShowNew(true)}
        >
          Novo Artigo
        </Button>
      }
    >
      <div className="page-enter">

        {/* ── FILTERS ────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-[0.75rem] mb-[1.5rem]">
          {/* Search */}
          <div className="relative max-w-[28rem]">
            <Search className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.5} />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título, categoria ou tag…"
              className="w-full h-[2.25rem] pl-[2.25rem] pr-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary placeholder:text-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
            />
          </div>

          {/* Category pills */}
          {categorias.length > 0 && (
            <div className="flex gap-[0.375rem] flex-wrap">
              <button
                onClick={() => setCategoria('')}
                className={cn(
                  'h-[2rem] px-[0.75rem] rounded-lg text-[0.8125rem] font-medium transition-colors',
                  categoria === ''
                    ? 'bg-ads-500 text-white'
                    : 'bg-surface-hover text-ink-secondary border border-surface-border/40 hover:text-ink-primary',
                )}
              >
                Todos
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat === categoria ? '' : cat)}
                  className={cn(
                    'h-[2rem] px-[0.75rem] rounded-lg text-[0.8125rem] font-medium transition-colors',
                    categoria === cat
                      ? 'bg-ads-500 text-white'
                      : 'bg-surface-hover text-ink-secondary border border-surface-border/40 hover:text-ink-primary',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── CONTENT ────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1rem]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[9rem] rounded-xl skeleton-shimmer" />
            ))}
          </div>
        ) : tableError ? (
          <div className="flex flex-col items-center justify-center py-[4rem] gap-[1rem] text-ink-muted">
            <BookOpen className="w-[3rem] h-[3rem]" strokeWidth={1} />
            <p className="text-[0.9375rem] font-medium text-ink-secondary">Tabela não encontrada</p>
            <p className="text-[0.875rem] text-center max-w-[22rem]">
              A tabela <code className="font-mono text-ads-500">knowledge_base</code> ainda não existe no banco de dados.
              Crie-a no Supabase para começar a usar a base de conhecimento.
            </p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[4rem] gap-[1rem] text-ink-muted">
            <BookOpen className="w-[3rem] h-[3rem]" strokeWidth={1} />
            <p className="text-[0.9375rem]">
              {busca || categoria ? 'Nenhum artigo encontrado com esses filtros.' : 'Nenhum artigo cadastrado ainda.'}
            </p>
            {!busca && !categoria && (
              <Button
                variant="subtle"
                size="sm"
                icon={<Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
                onClick={() => setShowNew(true)}
              >
                Criar primeiro artigo
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1rem]">
            {filtrados.map((art) => (
              <button
                key={art.id}
                onClick={() => setReadArt(art)}
                className="text-left bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow card-interactive group flex flex-col gap-[0.625rem]"
              >
                {/* Title + category */}
                <div className="flex items-start justify-between gap-[0.5rem]">
                  <p className="text-ink-primary font-semibold text-[0.875rem] leading-snug group-hover:text-ads-500 transition-colors line-clamp-2">
                    {art.titulo}
                  </p>
                  {art.categoria && (
                    <span className="shrink-0 text-[0.6875rem] font-medium text-ads-500 bg-ads-500/10 border border-ads-500/25 rounded-full px-[0.5rem] py-[0.0625rem] whitespace-nowrap">
                      {art.categoria}
                    </span>
                  )}
                </div>

                {/* Excerpt */}
                {art.conteudo && (
                  <p className="text-ink-muted text-[0.8125rem] leading-relaxed line-clamp-2">
                    {excerpt(art.conteudo)}
                  </p>
                )}

                {/* Tags + date */}
                <div className="flex items-center gap-[0.375rem] flex-wrap mt-auto pt-[0.25rem]">
                  {art.tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="flex items-center gap-[0.125rem] text-[0.625rem] font-medium text-ink-muted bg-surface-hover border border-surface-border/40 rounded-full px-[0.4375rem] py-[0.0625rem]">
                      <Tag className="w-[0.5rem] h-[0.5rem]" strokeWidth={2} />
                      {tag}
                    </span>
                  ))}
                  {(art.tags?.length ?? 0) > 3 && (
                    <span className="text-[0.625rem] text-ink-muted">+{(art.tags?.length ?? 0) - 3}</span>
                  )}
                  <span className="ml-auto flex items-center gap-[0.1875rem] text-ink-muted text-[0.625rem]">
                    <Calendar className="w-[0.5625rem] h-[0.5625rem]" strokeWidth={1.75} />
                    {formatDate(art.created_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── MODALS ─────────────────────────────────────────────────────────── */}
      {showNew && (
        <NewArticleModal
          onClose={() => setShowNew(false)}
          onSaved={() => { setShowNew(false); carregar() }}
        />
      )}

      {readArt && (
        <ReadModal
          article={readArt}
          onClose={() => setReadArt(null)}
          onDeleted={() => { setReadArt(null); carregar() }}
        />
      )}
    </MainLayout>
  )
}
