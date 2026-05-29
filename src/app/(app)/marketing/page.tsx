'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Megaphone, Plus, Calendar, Edit3, Instagram,
  Facebook, Image, Video, Layers, Film,
  Clock, CheckCircle, AlertCircle, RefreshCw,
  Sparkles, X, Save, Pencil, Copy, Trash2,
} from 'lucide-react'
import { MainLayout }  from '@/components/layout/MainLayout'
import { Button }      from '@/components/ui/Button'
import { ContextMenu } from '@/components/ui/ContextMenu'
import { supabase }    from '@/lib/supabase'
import { useConfirmDialogStore } from '@/lib/hooks/useConfirmDialog'

type Rede   = 'instagram' | 'facebook'
type Tipo   = 'foto' | 'video' | 'carrossel' | 'reels'
type Status = 'rascunho' | 'agendado' | 'publicado' | 'falhou'

interface Post {
  id:            string
  cliente_id:    string | null
  rede:          Rede
  tipo:          Tipo
  texto:         string | null
  midia_url:     string | null
  hashtags:      string[] | null
  status:        Status
  agendado_para: string | null
  created_at:    string
}

interface ClienteOpcao { id: string; nome: string }

const REDE_ICON: Record<Rede, React.ElementType> = {
  instagram: Instagram,
  facebook:  Facebook,
}

const REDE_COR: Record<Rede, string> = {
  instagram: 'text-status-purple',
  facebook:  'text-status-blue',
}

const TIPO_ICON: Record<Tipo, React.ElementType> = {
  foto:      Image,
  video:     Video,
  carrossel: Layers,
  reels:     Film,
}

const STATUS_COR: Record<Status, string> = {
  rascunho:  'bg-ink-muted/15 text-ink-muted',
  agendado:  'bg-status-blue/15 text-status-blue',
  publicado: 'bg-status-green/15 text-status-green',
  falhou:    'bg-status-red/15 text-status-red',
}

const STATUS_ICON: Record<Status, React.ElementType> = {
  rascunho:  Edit3,
  agendado:  Clock,
  publicado: CheckCircle,
  falhou:    AlertCircle,
}

// ── MODAL CRIAR/EDITAR POST ─────────────────────────────────────────────────
function PostModal({
  post, clientes, onClose, onSaved,
}: {
  post?: Partial<Post>; clientes: ClienteOpcao[]; onClose: () => void; onSaved: () => void
}) {
  const [rede,          setRede]         = useState<Rede>(post?.rede ?? 'instagram')
  const [tipo,          setTipo]         = useState<Tipo>(post?.tipo ?? 'foto')
  const [texto,         setTexto]        = useState(post?.texto ?? '')
  const [hashtags,      setHashtags]     = useState((post?.hashtags ?? []).join(' '))
  const [clienteId,     setClienteId]    = useState(post?.cliente_id ?? '')
  const [agendadoPara,  setAgendadoPara] = useState(post?.agendado_para?.slice(0, 16) ?? '')
  const [gerandoIA,     setGerandoIA]    = useState(false)
  const [salvando,      setSalvando]     = useState(false)
  const [erro,          setErro]         = useState('')

  async function gerarHashtagsIA() {
    if (!texto.trim()) return
    setGerandoIA(true)
    try {
      const res  = await fetch('/api/ia/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, rede }),
      })
      const data = await res.json() as { hashtags?: string[] }
      if (data.hashtags) setHashtags(data.hashtags.join(' '))
    } catch {
      setHashtags('#marketing #socialmedia #digital')
    } finally {
      setGerandoIA(false)
    }
  }

  async function salvar(statusPost: Status) {
    setSalvando(true); setErro('')
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      user_id:      user?.id,
      rede, tipo,
      texto:        texto  || null,
      hashtags:     hashtags.split(/\s+/).filter(Boolean),
      cliente_id:   clienteId || null,
      agendado_para: agendadoPara || null,
      status:       statusPost,
    }
    const { error } = post?.id
      ? await supabase.from('posts_agendados').update(payload).eq('id', post.id)
      : await supabase.from('posts_agendados').insert(payload)
    if (error) { setErro(error.message); setSalvando(false); return }
    onSaved(); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow shadow-2xl w-full max-w-[32rem] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-[1.5rem] py-[1rem] border-b border-surface-border shrink-0">
          <p className="text-ink-primary font-semibold">{post?.id ? 'Editar Post' : 'Criar Post'}</p>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X className="w-[1rem] h-[1rem]" strokeWidth={2} />} className="w-[2rem] px-0" />
        </div>

        <div className="flex-1 overflow-y-auto p-[1.5rem] flex flex-col gap-[1rem]">
          {/* Rede + Tipo */}
          <div className="grid grid-cols-2 gap-[0.75rem]">
            <div>
              <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">Rede Social</label>
              <div className="flex gap-[0.375rem]">
                {(['instagram', 'facebook'] as Rede[]).map((r) => {
                  const Icon = REDE_ICON[r]
                  return (
                    <button key={r} type="button" onClick={() => setRede(r)}
                      className={`flex-1 flex items-center justify-center gap-[0.375rem] h-[2.5rem] rounded-lg border text-[0.8125rem] font-medium transition-colors capitalize ${rede === r ? 'border-ads-500 bg-ads-500/10 text-ads-500' : 'border-surface-border bg-surface-hover text-ink-secondary'}`}
                    >
                      <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as Tipo)}
                className="w-full h-[2.5rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30">
                <option value="foto">Foto</option>
                <option value="video">Vídeo</option>
                <option value="carrossel">Carrossel</option>
                <option value="reels">Reels</option>
              </select>
            </div>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">Cliente</label>
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}
              className="w-full h-[2.5rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30">
              <option value="">Sem cliente</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          {/* Texto */}
          <div>
            <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">Texto / Legenda</label>
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4}
              placeholder="Escreva a legenda do post…"
              className="w-full px-[0.75rem] py-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] resize-none focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
          </div>

          {/* Hashtags */}
          <div>
            <div className="flex items-center justify-between mb-[0.375rem]">
              <label className="text-ink-secondary text-[0.8125rem] font-medium">Hashtags</label>
              <button type="button" onClick={gerarHashtagsIA} disabled={gerandoIA || !texto.trim()}
                className="flex items-center gap-[0.25rem] text-[0.75rem] text-ads-500 hover:text-ads-600 disabled:opacity-40 transition-colors">
                {gerandoIA
                  ? <div className="w-[0.75rem] h-[0.75rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
                  : <Sparkles className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
                }
                Gerar com IA
              </button>
            </div>
            <input type="text" value={hashtags} onChange={(e) => setHashtags(e.target.value)}
              placeholder="#marketing #digital #ads"
              className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
          </div>

          {/* Agendamento */}
          <div>
            <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">
              <Clock className="inline w-[0.75rem] h-[0.75rem] mr-[0.25rem]" strokeWidth={1.75} />Agendar para
            </label>
            <input type="datetime-local" value={agendadoPara} onChange={(e) => setAgendadoPara(e.target.value)}
              className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
          </div>

          {erro && <p className="text-[0.8125rem] text-status-red">{erro}</p>}
        </div>

        <div className="flex gap-[0.5rem] px-[1.5rem] py-[1rem] border-t border-surface-border shrink-0">
          <Button variant="secondary" size="md" onClick={() => salvar('rascunho')} disabled={salvando} icon={<Save className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />}>
            Rascunho
          </Button>
          {agendadoPara && (
            <Button variant="subtle" size="md" onClick={() => salvar('agendado')} disabled={salvando} icon={<Clock className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />}>
              Agendar
            </Button>
          )}
          <Button variant="primary" size="md" onClick={() => salvar('publicado')} disabled={salvando} loading={salvando} icon={<Megaphone className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />} className="ml-auto">
            Publicar Agora
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── CALENDÁRIO SEMANAL ──────────────────────────────────────────────────────
function Calendario({ posts, onEdit, onRefresh }: { posts: Post[]; onEdit: (p: Post) => void; onRefresh: () => void }) {
  const hoje      = new Date()
  const inicioSem = new Date(hoje)
  inicioSem.setDate(hoje.getDate() - hoje.getDay())

  const semanas = Array.from({ length: 4 }, (_, si) =>
    Array.from({ length: 7 }, (_, di) => {
      const d = new Date(inicioSem)
      d.setDate(inicioSem.getDate() + si * 7 + di)
      return d
    })
  )

  const postsPorDia = (dia: Date) => {
    const ds = dia.toISOString().slice(0, 10)
    return posts.filter((p) => p.agendado_para?.slice(0, 10) === ds)
  }

  const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div>
      <div className="grid grid-cols-7 gap-[0.25rem] mb-[0.5rem]">
        {DIAS.map((d) => (
          <p key={d} className="text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide text-center py-[0.25rem]">{d}</p>
        ))}
      </div>
      <div className="flex flex-col gap-[0.25rem]">
        {semanas.map((sem, si) => (
          <div key={si} className="grid grid-cols-7 gap-[0.25rem]">
            {sem.map((dia, di) => {
              const diasPosts = postsPorDia(dia)
              const eHoje     = dia.toISOString().slice(0, 10) === hoje.toISOString().slice(0, 10)
              return (
                <div
                  key={di}
                  className={`min-h-[5rem] rounded-lg p-[0.375rem] border transition-colors ${eHoje ? 'border-ads-500/40 bg-ads-500/5' : 'border-surface-border bg-surface-card'}`}
                >
                  <p className={`text-[0.6875rem] font-semibold mb-[0.25rem] ${eHoje ? 'text-ads-500' : 'text-ink-muted'}`}>
                    {dia.getDate()}
                  </p>
                  <div className="flex flex-col gap-[0.125rem]">
                    {diasPosts.map((p) => {
                      const RedeIcon = REDE_ICON[p.rede]
                      return (
                        <button
                          key={p.id} onClick={() => onEdit(p)}
                          className="w-full text-left flex items-center gap-[0.25rem] px-[0.25rem] py-[0.125rem] rounded bg-surface-hover hover:bg-ads-500/10 transition-colors"
                        >
                          <RedeIcon className={`w-[0.625rem] h-[0.625rem] shrink-0 ${REDE_COR[p.rede]}`} strokeWidth={2} />
                          <span className="text-ink-secondary text-[0.625rem] truncate">{p.texto?.slice(0, 15) ?? p.tipo}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      {posts.filter((p) => !p.agendado_para).length > 0 && (
        <div className="mt-[1.5rem]">
          <p className="text-ink-muted text-[0.75rem] font-semibold uppercase tracking-wide mb-[0.5rem]">Sem data</p>
          <div className="flex flex-col gap-[0.375rem]">
            {posts.filter((p) => !p.agendado_para).map((p) => {
              const RedeIcon = REDE_ICON[p.rede]
              const TipoIcon = TIPO_ICON[p.tipo]
              const StIcon   = STATUS_ICON[p.status]
              return (
                <button key={p.id} onClick={() => onEdit(p)}
                  className="flex items-center gap-[0.75rem] bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow px-[1rem] py-[0.625rem] hover:border-ads-500/30 transition-colors text-left">
                  <RedeIcon className={`w-[1rem] h-[1rem] shrink-0 ${REDE_COR[p.rede]}`} strokeWidth={1.75} />
                  <TipoIcon className="w-[0.875rem] h-[0.875rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                  <p className="flex-1 text-ink-primary text-[0.875rem] truncate">{p.texto ?? `(${p.tipo})`}</p>
                  <span className={`text-[0.6875rem] font-semibold px-[0.375rem] py-[0.125rem] rounded-full flex items-center gap-[0.25rem] ${STATUS_COR[p.status]}`}>
                    <StIcon className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                    {p.status}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function MarketingPage() {
  const [aba,       setAba]       = useState<'calendario' | 'criar'>('calendario')
  const [posts,     setPosts]     = useState<Post[]>([])
  const [clientes,  setClientes]  = useState<ClienteOpcao[]>([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [postEdit,  setPostEdit]  = useState<Partial<Post> | undefined>()

  const carregar = useCallback(async () => {
    setLoading(true)
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('posts_agendados').select('*').order('agendado_para', { ascending: true }),
      supabase.from('clientes').select('id, nome').in('status', ['ativo', 'onboarding']).order('nome'),
    ])
    setPosts((p ?? []) as Post[])
    setClientes((c ?? []) as ClienteOpcao[])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function abrirCriar() { setPostEdit(undefined); setModal(true); setAba('criar') }
  function abrirEditar(p: Post) { setPostEdit(p); setModal(true) }

  const agendados  = posts.filter((p) => p.status === 'agendado').length
  const publicados = posts.filter((p) => p.status === 'publicado').length
  const rascunhos  = posts.filter((p) => p.status === 'rascunho').length

  return (
    <MainLayout
      title="Marketing"
      subtitle="Calendário editorial e criação de posts"
      actions={
        <div className="flex items-center gap-[0.5rem]">
          <Button variant="secondary" size="sm" onClick={carregar} icon={<RefreshCw className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />} className="w-[2rem] px-0" />
          <Button variant="primary" size="sm" onClick={abrirCriar} icon={<Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}>
            Criar Post
          </Button>
        </div>
      }
    >
      {/* KPIs rápidos */}
      <div className="grid grid-cols-3 gap-[1rem] mb-[2rem]">
        {[
          { label: 'Agendados', value: agendados,  cor: 'text-status-blue'  },
          { label: 'Publicados',value: publicados, cor: 'text-status-green' },
          { label: 'Rascunhos', value: rascunhos,  cor: 'text-ink-muted'    },
        ].map(({ label, value, cor }) => (
          <div key={label} className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem] flex items-center gap-[0.75rem]">
            <p className={`text-[1.5rem] font-bold ${cor}`}>{value}</p>
            <p className="text-ink-secondary text-[0.875rem]">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-[0.25rem] border-b border-surface-border mb-[1.5rem]">
        {([
          { id: 'calendario', label: 'Calendário', icon: Calendar },
          { id: 'criar',      label: 'Lista',      icon: Edit3    },
        ] as { id: typeof aba; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setAba(id)}
            className={`flex items-center gap-[0.375rem] h-[2.25rem] px-[0.875rem] text-[0.875rem] font-medium transition-colors ${aba === id ? 'text-ads-500 border-b-2 border-ads-500 -mb-[0.3125rem]' : 'text-ink-muted hover:text-ink-secondary'}`}>
            <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-[0.25rem]">
          {[...Array(28)].map((_, i) => <div key={i} className="h-[5rem] rounded-lg bg-surface-card border border-surface-border animate-pulse" />)}
        </div>
      ) : aba === 'calendario' ? (
        <Calendario posts={posts} onEdit={abrirEditar} onRefresh={carregar} />
      ) : (
        <div className="flex flex-col gap-[0.5rem]">
          {posts.length === 0 ? (
            <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[4rem] text-center">
              <Megaphone className="w-[2.5rem] h-[2.5rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
              <p className="text-ink-primary font-semibold">Nenhum post ainda</p>
              <p className="text-ink-muted text-[0.875rem] mt-[0.25rem]">Crie seu primeiro post para começar.</p>
            </div>
          ) : posts.map((p) => {
            const RedeIcon = REDE_ICON[p.rede]
            const TipoIcon = TIPO_ICON[p.tipo]
            const StIcon   = STATUS_ICON[p.status]
            return (
              <ContextMenu
                key={p.id}
                items={[
                  {
                    label: 'Editar',
                    icon: <Pencil className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,
                    onClick: () => abrirEditar(p),
                    shortcut: 'E',
                  },
                  {
                    label: 'Duplicar',
                    icon: <Copy className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,
                    onClick: async () => {
                      await supabase.from('posts_agendados').insert({
                        rede:         p.rede,
                        tipo:         p.tipo,
                        texto:        p.texto,
                        status:       'rascunho',
                        cliente_id:   p.cliente_id,
                        agendado_para: null,
                      })
                      carregar()
                    },
                  },
                  {
                    label: 'Deletar',
                    icon: <Trash2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,
                    variant: 'danger',
                    separator: true,
                    onClick: () => {
                      const openConfirm = useConfirmDialogStore.getState().openConfirm
                      openConfirm(
                        'Deletar Post',
                        `Você está prestes a deletar este post. Esta ação não pode ser desfeita.`,
                        async () => {
                          await supabase.from('posts_agendados').delete().eq('id', p.id)
                          carregar()
                        }
                      )
                    },
                  },
                ]}
              >
                <button onClick={() => abrirEditar(p)}
                  className="flex items-center gap-[1rem] bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow px-[1.25rem] py-[0.875rem] hover:border-ads-500/30 transition-colors text-left w-full">
                  <RedeIcon className={`w-[1.25rem] h-[1.25rem] shrink-0 ${REDE_COR[p.rede]}`} strokeWidth={1.75} />
                  <TipoIcon className="w-[1rem] h-[1rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                  <p className="flex-1 text-ink-primary text-[0.875rem] truncate">{p.texto ?? `(${p.tipo})`}</p>
                  {p.agendado_para && (
                    <span className="text-ink-muted text-[0.75rem] shrink-0">
                      {new Date(p.agendado_para).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <span className={`text-[0.6875rem] font-semibold px-[0.5rem] py-[0.125rem] rounded-full flex items-center gap-[0.25rem] ${STATUS_COR[p.status]}`}>
                    <StIcon className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                    {p.status}
                  </span>
                </button>
              </ContextMenu>
            )
          })}
        </div>
      )}

      {modal && (
        <PostModal
          post={postEdit}
          clientes={clientes}
          onClose={() => setModal(false)}
          onSaved={carregar}
        />
      )}
    </MainLayout>
  )
}
