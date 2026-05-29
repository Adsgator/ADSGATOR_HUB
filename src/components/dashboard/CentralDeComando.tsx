'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare, DollarSign, Megaphone, Bell, ChevronDown, CheckCircle2, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tarefa {
  id: string
  titulo: string
  prioridade: string
  data_prazo: string
  status: string
}

interface Cliente {
  id: string
  nome: string
  dias_atraso: number
  whatsapp: string | null
}

interface PostMarketing {
  id: string
  titulo: string
  plataforma: string
}

interface Notificacao {
  id: string
  titulo: string
  tipo: string
  created_at: string
}

interface SectionState {
  tarefas: boolean
  cobrancas: boolean
  posts: boolean
  alertas: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function dataRelativa(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `há ${mins}min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `há ${hrs}h`
  return `há ${Math.floor(hrs / 24)}d`
}

function formatDataPrazo(iso: string): string {
  const today = todayISO()
  const d = iso.split('T')[0]
  if (d === today) return 'hoje'
  const diff = Math.floor((new Date(today).getTime() - new Date(d).getTime()) / 86400000)
  if (diff > 0) return `${diff}d atraso`
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function prioridadeBadge(p: string) {
  if (p === 'alto') return { label: 'Alto', className: 'bg-[color:var(--status-red)]/10 text-[color:var(--status-red)]' }
  if (p === 'médio' || p === 'medio') return { label: 'Médio', className: 'bg-[color:var(--status-orange)]/10 text-[color:var(--status-orange)]' }
  return { label: 'Baixo', className: 'bg-[color:var(--status-blue)]/10 text-[color:var(--status-blue)]' }
}

function plataformaBadge(p: string) {
  const map: Record<string, string> = {
    instagram: 'bg-[color:var(--status-purple)]/10 text-[color:var(--status-purple)]',
    facebook: 'bg-[color:var(--status-blue)]/10 text-[color:var(--status-blue)]',
    linkedin: 'bg-[color:var(--status-cyan)]/10 text-[color:var(--status-cyan)]',
    tiktok: 'bg-[color:var(--status-red)]/10 text-[color:var(--status-red)]',
  }
  return map[p?.toLowerCase()] ?? 'bg-[color:var(--ink-muted)]/10 text-[color:var(--ink-muted)]'
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-[0.75rem] py-[0.5rem] px-[0.25rem]">
      <div className="skeleton-shimmer h-[0.875rem] w-[60%] rounded" />
      <div className="skeleton-shimmer h-[0.875rem] w-[20%] rounded ml-auto" />
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: React.ReactNode
  title: string
  count: number
  open: boolean
  onToggle: () => void
  accentClass: string
}

function SectionHeader({ icon, title, count, open, onToggle, accentClass }: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-[0.5rem] py-[0.5rem] px-[0.25rem] hover:bg-[color:var(--surface-hover)] rounded-lg transition-colors"
    >
      <span className={cn('shrink-0', accentClass)}>{icon}</span>
      <span className="text-sm font-medium text-[color:var(--ink-primary)] flex-1 text-left">{title}</span>
      <span
        className={cn(
          'text-xs font-semibold px-[0.4rem] py-[0.1rem] rounded-full min-w-[1.25rem] text-center',
          count > 0
            ? 'bg-[color:var(--status-red)]/15 text-[color:var(--status-red)]'
            : 'bg-[color:var(--surface-elevated)] text-[color:var(--ink-muted)]'
        )}
      >
        {count}
      </span>
      <ChevronDown
        size={14}
        className={cn(
          'text-[color:var(--ink-muted)] transition-transform duration-200 shrink-0',
          open && 'rotate-180'
        )}
      />
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CentralDeComando() {
  const router = useRouter()

  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [posts, setPosts] = useState<PostMarketing[]>([])
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState<SectionState>({
    tarefas: true,
    cobrancas: false,
    posts: false,
    alertas: false,
  })

  const toggle = useCallback((key: keyof SectionState) => {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const today = todayISO()

      const [tarefasRes, clientesRes, postsRes, notifsRes] = await Promise.all([
        supabase
          .from('tarefas')
          .select('id, titulo, prioridade, data_prazo, status')
          .lte('data_prazo', today)
          .neq('status', 'feito'),
        supabase
          .from('clientes')
          .select('id, nome, dias_atraso, whatsapp')
          .gt('dias_atraso', 0),
        supabase
          .from('posts_marketing')
          .select('id, titulo, plataforma')
          .eq('data_publicacao', today)
          .eq('status', 'agendado'),
        supabase
          .from('notificacoes')
          .select('id, titulo, tipo, created_at')
          .eq('lida', false)
          .order('created_at', { ascending: false }),
      ])

      setTarefas(tarefasRes.data ?? [])
      setClientes(clientesRes.data ?? [])
      setPosts(postsRes.data ?? [])
      setNotificacoes(notifsRes.data ?? [])
      setLoading(false)
    }

    load()
  }, [])

  const totalCount = tarefas.length + clientes.length + posts.length + notificacoes.length
  const allClear = !loading && totalCount === 0

  // ─── All Clear ──────────────────────────────────────────────────────────────
  if (allClear) {
    return (
      <div className="flex flex-col items-center justify-center gap-[0.75rem] py-[2rem] px-[1rem] text-center animate-fade-scale">
        <CheckCircle2 size={48} className="text-[color:var(--status-green)]" />
        <p className="text-base font-semibold text-[color:var(--ink-primary)]">Tudo em dia! 🎉</p>
        <p className="text-sm text-[color:var(--ink-muted)]">Nenhuma ação necessária no momento</p>
      </div>
    )
  }

  const today = todayISO()

  return (
    <div className="flex flex-col overflow-y-auto">

      {/* ── Tarefas Urgentes ── */}
      <SectionHeader
        icon={<CheckSquare size={16} />}
        title="Tarefas Urgentes"
        count={tarefas.length}
        open={open.tarefas}
        onToggle={() => toggle('tarefas')}
        accentClass="text-[color:var(--status-red)]"
      />
      {open.tarefas && (
        <div className="mb-[0.25rem] animate-fade-in">
          {loading ? (
            [1, 2].map(i => <SkeletonRow key={i} />)
          ) : tarefas.length === 0 ? (
            <p className="text-xs text-[color:var(--ink-muted)] py-[0.5rem] px-[0.25rem]">Nenhuma tarefa urgente</p>
          ) : (
            tarefas.map(t => {
              const badge = prioridadeBadge(t.prioridade)
              const vencida = t.data_prazo.split('T')[0] < today
              return (
                <div
                  key={t.id}
                  onClick={() => router.push('/tarefas')}
                  className="flex items-center gap-[0.75rem] py-[0.5rem] px-[0.25rem] hover:bg-[color:var(--surface-hover)] rounded-lg transition-colors cursor-pointer"
                >
                  <span className="text-sm text-[color:var(--ink-primary)] truncate flex-1 min-w-0">{t.titulo}</span>
                  <span className={cn('text-xs font-medium px-[0.4rem] py-[0.1rem] rounded-full shrink-0', badge.className)}>
                    {badge.label}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium shrink-0',
                      vencida ? 'text-[color:var(--status-red)]' : 'text-[color:var(--status-orange)]'
                    )}
                  >
                    {formatDataPrazo(t.data_prazo)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── Cobranças em Atraso ── */}
      <SectionHeader
        icon={<DollarSign size={16} />}
        title="Cobranças em Atraso"
        count={clientes.length}
        open={open.cobrancas}
        onToggle={() => toggle('cobrancas')}
        accentClass="text-[color:var(--status-red)]"
      />
      {open.cobrancas && (
        <div className="mb-[0.25rem] animate-fade-in">
          {loading ? (
            [1, 2].map(i => <SkeletonRow key={i} />)
          ) : clientes.length === 0 ? (
            <p className="text-xs text-[color:var(--ink-muted)] py-[0.5rem] px-[0.25rem]">Nenhum cliente inadimplente</p>
          ) : (
            clientes.map(c => (
              <div
                key={c.id}
                className="flex items-center gap-[0.75rem] py-[0.5rem] px-[0.25rem] hover:bg-[color:var(--surface-hover)] rounded-lg transition-colors cursor-pointer"
              >
                <span
                  onClick={() => router.push('/clientes')}
                  className="text-sm text-[color:var(--ink-primary)] truncate flex-1 min-w-0"
                >
                  {c.nome}
                </span>
                <span
                  onClick={() => router.push('/clientes')}
                  className="text-xs font-medium px-[0.4rem] py-[0.1rem] rounded-full bg-[color:var(--status-red)]/10 text-[color:var(--status-red)] shrink-0"
                >
                  {c.dias_atraso}d atraso
                </span>
                {c.whatsapp && (
                  <a
                    href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-[color:var(--status-green)] hover:opacity-70 transition-opacity shrink-0"
                    title="Abrir WhatsApp"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Posts Para Publicar ── */}
      <SectionHeader
        icon={<Megaphone size={16} />}
        title="Posts Para Publicar"
        count={posts.length}
        open={open.posts}
        onToggle={() => toggle('posts')}
        accentClass="text-[color:var(--status-blue)]"
      />
      {open.posts && (
        <div className="mb-[0.25rem] animate-fade-in">
          {loading ? (
            [1].map(i => <SkeletonRow key={i} />)
          ) : posts.length === 0 ? (
            <p className="text-xs text-[color:var(--ink-muted)] py-[0.5rem] px-[0.25rem]">Nenhum post agendado para hoje</p>
          ) : (
            posts.map(p => (
              <div
                key={p.id}
                onClick={() => router.push('/marketing')}
                className="flex items-center gap-[0.75rem] py-[0.5rem] px-[0.25rem] hover:bg-[color:var(--surface-hover)] rounded-lg transition-colors cursor-pointer"
              >
                <span className="text-sm text-[color:var(--ink-primary)] truncate flex-1 min-w-0">{p.titulo}</span>
                <span className={cn('text-xs font-medium px-[0.4rem] py-[0.1rem] rounded-full capitalize shrink-0', plataformaBadge(p.plataforma))}>
                  {p.plataforma}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Alertas Não Lidos ── */}
      <SectionHeader
        icon={<Bell size={16} />}
        title="Alertas Não Lidos"
        count={notificacoes.length}
        open={open.alertas}
        onToggle={() => toggle('alertas')}
        accentClass="text-[color:var(--status-orange)]"
      />
      {open.alertas && (
        <div className="animate-fade-in">
          {loading ? (
            [1, 2].map(i => <SkeletonRow key={i} />)
          ) : notificacoes.length === 0 ? (
            <p className="text-xs text-[color:var(--ink-muted)] py-[0.5rem] px-[0.25rem]">Nenhum alerta pendente</p>
          ) : (
            notificacoes.map(n => (
              <div
                key={n.id}
                onClick={() => router.push('/configuracoes')}
                className="flex items-center gap-[0.75rem] py-[0.5rem] px-[0.25rem] hover:bg-[color:var(--surface-hover)] rounded-lg transition-colors cursor-pointer"
              >
                <span className="text-sm text-[color:var(--ink-primary)] truncate flex-1 min-w-0">{n.titulo}</span>
                <span className="text-xs text-[color:var(--ink-muted)] shrink-0">{dataRelativa(n.created_at)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
