'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Globe, User, Calendar, ExternalLink, Layers } from 'lucide-react'

interface ProjetoWeb {
  id: string
  cliente_id: string
  nome: string
  url: string | null
  plataforma: string | null
  status: string | null
  data_entrega: string | null
  created_at: string
  clientes: {
    nome: string
    nicho: string | null
  } | null
}

function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function plataformaBadge(plataforma: string | null) {
  switch (plataforma?.toLowerCase()) {
    case 'astro':
      return 'bg-purple-500/10 text-purple-400'
    case 'wordpress':
      return 'bg-blue-500/10 text-blue-400'
    case 'next.js':
    case 'nextjs':
      return 'bg-surface-elevated text-ink-secondary border border-surface-border'
    default:
      return 'bg-surface-hover text-ink-muted'
  }
}

function statusBadge(status: string | null): { label: string; cls: string } {
  switch (status) {
    case 'ativo':
    case 'publicado':
      return { label: status === 'ativo' ? 'Ativo' : 'Publicado', cls: 'bg-status-green/10 text-status-green' }
    case 'em_desenvolvimento':
      return { label: 'Em desenvolvimento', cls: 'bg-status-orange/10 text-status-orange' }
    case 'revisao':
      return { label: 'Revisão', cls: 'bg-status-blue/10 text-status-blue' }
    case 'inativo':
      return { label: 'Inativo', cls: 'bg-surface-hover text-ink-muted' }
    default:
      return { label: status ?? 'Sem status', cls: 'bg-surface-hover text-ink-muted' }
  }
}

function SkeletonCard() {
  return (
    <div className="h-[10rem] rounded-2xl skeleton-shimmer bg-surface-card border border-surface-border" />
  )
}

export default function PortfolioPage() {
  const [projetos, setProjetos] = useState<ProjetoWeb[]>([])
  const [loading, setLoading] = useState(true)
  const [tableError, setTableError] = useState(false)

  useEffect(() => {
    async function fetchProjetos() {
      const { data, error } = await supabase
        .from('projetos_web')
        .select('*, clientes(nome, nicho)')
        .order('created_at', { ascending: false })

      if (error) {
        // table may not exist yet
        setTableError(true)
      } else {
        setProjetos((data as ProjetoWeb[]) ?? [])
      }
      setLoading(false)
    }

    fetchProjetos()
  }, [])

  const totalProjetos = projetos.length
  const plataformasUnicas = new Set(projetos.map((p) => p.plataforma).filter(Boolean)).size
  const projetosAtivos = projetos.filter(
    (p) => p.status === 'ativo' || p.status === 'publicado',
  ).length

  return (
    <MainLayout title="Portfolio" subtitle="Projetos publicados">
      <div className="page-enter space-y-[1.5rem]">

        {/* KPIs inline */}
        {!loading && !tableError && (
          <div className="flex items-center gap-[2rem] px-[0.25rem]">
            <div>
              <span className="text-[1.5rem] font-bold text-ink-primary">{totalProjetos}</span>
              <span className="ml-[0.375rem] text-[0.8125rem] text-ink-muted">projetos</span>
            </div>
            <div className="w-px h-[1.5rem] bg-surface-border" />
            <div>
              <span className="text-[1.5rem] font-bold text-ink-primary">{plataformasUnicas}</span>
              <span className="ml-[0.375rem] text-[0.8125rem] text-ink-muted">plataformas</span>
            </div>
            <div className="w-px h-[1.5rem] bg-surface-border" />
            <div>
              <span className="text-[1.5rem] font-bold text-status-green">{projetosAtivos}</span>
              <span className="ml-[0.375rem] text-[0.8125rem] text-ink-muted">ativos / publicados</span>
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1rem]">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Table error / empty */}
        {!loading && (tableError || projetos.length === 0) && (
          <div className="flex flex-col items-center justify-center py-[4rem] gap-[1rem] text-center">
            <Globe className="w-[3rem] h-[3rem] text-ink-muted" strokeWidth={1.25} />
            <div>
              <p className="text-ink-primary font-semibold text-[1rem]">
                {tableError ? 'Tabela não encontrada' : 'Nenhum projeto cadastrado'}
              </p>
              <p className="text-ink-muted text-[0.875rem] mt-[0.25rem]">
                {tableError
                  ? 'A tabela projetos_web ainda não existe no banco de dados.'
                  : 'Acesse um cliente e cadastre projetos na aba Sites.'}
              </p>
            </div>
            {!tableError && (
              <Link
                href="/clientes"
                className="mt-[0.5rem] h-[2rem] px-[1rem] rounded-lg bg-ads-500/10 text-ads-500 hover:bg-ads-500/20 text-[0.8125rem] font-medium flex items-center transition-colors"
              >
                Ir para Clientes
              </Link>
            )}
          </div>
        )}

        {/* Grid de projetos */}
        {!loading && !tableError && projetos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1rem]">
            {projetos.map((projeto) => {
              const { label: statusLabel, cls: statusCls } = statusBadge(projeto.status)
              return (
                <div
                  key={projeto.id}
                  className="bg-surface-card border border-surface-border rounded-2xl p-[1.25rem] card-shadow card-interactive flex flex-col gap-[0.75rem]"
                >
                  {/* Nome + status */}
                  <div className="flex items-start justify-between gap-[0.5rem]">
                    <p className="text-ink-primary font-semibold text-[0.9375rem] leading-snug">
                      {projeto.nome}
                    </p>
                    <span
                      className={cn(
                        'shrink-0 px-[0.5rem] py-[0.125rem] rounded-full text-[0.6875rem] font-medium whitespace-nowrap',
                        statusCls,
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Cliente */}
                  {projeto.clientes && (
                    <div className="flex items-center gap-[0.375rem]">
                      <User className="w-[0.875rem] h-[0.875rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                      <span className="text-ink-muted text-[0.8125rem] truncate">
                        {projeto.clientes.nome}
                      </span>
                      {projeto.clientes.nicho && (
                        <span className="px-[0.375rem] py-[0.0625rem] rounded-md text-[0.6875rem] bg-surface-hover text-ink-secondary">
                          {projeto.clientes.nicho}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Plataforma */}
                  {projeto.plataforma && (
                    <div>
                      <span
                        className={cn(
                          'inline-flex items-center px-[0.5rem] py-[0.125rem] rounded-md text-[0.6875rem] font-medium',
                          plataformaBadge(projeto.plataforma),
                        )}
                      >
                        <Layers className="w-[0.75rem] h-[0.75rem] mr-[0.25rem]" strokeWidth={1.75} />
                        {projeto.plataforma}
                      </span>
                    </div>
                  )}

                  {/* Data de entrega */}
                  {projeto.data_entrega && (
                    <div className="flex items-center gap-[0.375rem] text-ink-muted text-[0.8125rem]">
                      <Calendar className="w-[0.875rem] h-[0.875rem] shrink-0" strokeWidth={1.75} />
                      <span>{formatDate(projeto.data_entrega)}</span>
                    </div>
                  )}

                  {/* Botão abrir site */}
                  {projeto.url && (
                    <div className="mt-auto pt-[0.25rem]">
                      <a
                        href={projeto.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-[0.375rem] h-[1.75rem] px-[0.75rem] rounded-lg bg-ads-500/10 text-ads-500 hover:bg-ads-500/20 text-[0.75rem] font-medium transition-colors"
                      >
                        <ExternalLink className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                        Abrir site
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
