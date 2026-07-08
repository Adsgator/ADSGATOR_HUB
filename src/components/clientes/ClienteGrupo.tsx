'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Users2, Plus, Unlink, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { calcularMRR, type AssinaturaMRR } from '@/lib/mrr'
import { ehSnapshotSemanal } from '@/lib/analytics-snapshots'
import type { Cliente } from '@/lib/types'

/**
 * Grupo de cliente — 1 cliente real com vários CNPJs (caso Paulo Alexandre).
 * Agrupa sem fundir: cada CNPJ mantém registro/cobrança/IDs próprios; aqui
 * fica a visão consolidada (MRR somado via lib/mrr, status por CNPJ e soma
 * do snapshot mensal de Ads mais recente de cada membro).
 */

interface ClienteGrupoProps {
  cliente: Cliente
  onUpdate: (cliente: Cliente) => void
}

interface Grupo { id: string; nome: string }

interface Membro {
  id: string
  nome: string
  status: string
  mrr: number | null
}

interface Consolidado {
  mrr: number
  investimento: number
  cliques: number
  conversoes: number
  temSnapshot: boolean
}

const STATUS_LABEL: Record<string, string> = {
  recebido: 'Recebido', onboarding: 'Onboarding', setup_trafego: 'Setup',
  ativo: 'Ativo', congelado: 'Congelado', inativo: 'Inativo',
}

export function ClienteGrupo({ cliente, onUpdate }: ClienteGrupoProps) {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [membros, setMembros] = useState<Membro[]>([])
  const [consolidado, setConsolidado] = useState<Consolidado | null>(null)
  const [tabelaExiste, setTabelaExiste] = useState(true)
  const [criando, setCriando] = useState(false)
  const [nomeNovo, setNomeNovo] = useState('')
  const [salvando, setSalvando] = useState(false)

  const grupoAtual = grupos.find((g) => g.id === cliente.grupo_id) ?? null

  const carregar = useCallback(async () => {
    const { data: gs, error } = await supabase.from('cliente_grupos').select('id, nome').order('nome')
    if (error) { setTabelaExiste(false); return } // migration ainda não aplicada
    setGrupos((gs ?? []) as Grupo[])

    if (!cliente.grupo_id) { setMembros([]); setConsolidado(null); return }

    const { data: ms } = await supabase
      .from('clientes')
      .select('id, nome, status, mrr')
      .eq('grupo_id', cliente.grupo_id)
      .order('nome')
    const lista = (ms ?? []) as Membro[]
    setMembros(lista)

    if (lista.length === 0) { setConsolidado(null); return }
    const ids = lista.map((m) => m.id)

    const [{ data: assinaturas }, { data: snaps }] = await Promise.all([
      supabase.from('assinaturas').select('valor_mensal, status').in('cliente_id', ids),
      supabase.from('analytics_snapshots')
        .select('cliente_id, fonte, periodo_inicio, periodo_fim, investimento, cliques, conversoes')
        .in('cliente_id', ids)
        .eq('fonte', 'google_ads')
        .order('periodo_fim', { ascending: false }),
    ])

    // Snapshot MENSAL mais recente de cada membro
    const vistos = new Set<string>()
    let investimento = 0, cliques = 0, conversoes = 0, temSnapshot = false
    for (const s of (snaps ?? []) as Array<{ cliente_id: string; periodo_inicio: string; periodo_fim: string; investimento: number | null; cliques: number | null; conversoes: number | null }>) {
      if (ehSnapshotSemanal(s.periodo_inicio, s.periodo_fim)) continue
      if (vistos.has(s.cliente_id)) continue
      vistos.add(s.cliente_id)
      temSnapshot = true
      investimento += s.investimento ?? 0
      cliques      += s.cliques ?? 0
      conversoes   += s.conversoes ?? 0
    }

    setConsolidado({
      mrr: calcularMRR((assinaturas ?? []) as AssinaturaMRR[]),
      investimento, cliques, conversoes, temSnapshot,
    })
  }, [cliente.grupo_id])

  useEffect(() => { carregar() }, [carregar])

  const vincular = async (grupoId: string | null) => {
    setSalvando(true)
    const { data, error } = await supabase
      .from('clientes')
      .update({ grupo_id: grupoId })
      .eq('id', cliente.id)
      .select()
      .single()
    setSalvando(false)
    if (error) { toast.error('Erro ao atualizar grupo'); return }
    onUpdate(data as Cliente)
    toast.success(grupoId ? 'Cliente vinculado ao grupo' : 'Cliente removido do grupo')
  }

  const criarGrupo = async () => {
    const nome = nomeNovo.trim()
    if (!nome) return
    setSalvando(true)
    const { data, error } = await supabase
      .from('cliente_grupos')
      .insert({ nome })
      .select()
      .single()
    if (error) { setSalvando(false); toast.error('Erro ao criar grupo'); return }
    setGrupos((prev) => [...prev, data as Grupo].sort((a, b) => a.nome.localeCompare(b.nome)))
    setCriando(false)
    setNomeNovo('')
    await vincular((data as Grupo).id)
  }

  if (!tabelaExiste) return null // migration pendente — seção some sem quebrar a página

  return (
    <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Users2 className="w-4 h-4 text-status-purple" strokeWidth={2} />
          <h3 className="font-semibold text-ink-primary">Grupo de cliente</h3>
          {grupoAtual && (
            <span className="px-[0.5rem] py-[0.125rem] rounded-full text-xs font-medium bg-status-purple/10 text-status-purple">
              {grupoAtual.nome}
            </span>
          )}
        </div>
        {grupoAtual && (
          <button
            onClick={() => vincular(null)}
            disabled={salvando}
            className="flex items-center gap-1 px-2 py-1 text-xs text-ink-muted hover:text-status-red hover:bg-surface-hover rounded transition-colors"
          >
            <Unlink className="w-3 h-3" strokeWidth={2} />
            Desvincular
          </button>
        )}
      </div>

      <div className="p-4">
        {!grupoAtual ? (
          <div className="space-y-2">
            <p className="text-sm text-ink-muted">
              Cliente com mais de um CNPJ? Agrupe os registros para ver o consolidado —
              cobrança e integrações continuam separadas por CNPJ.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {grupos.length > 0 && (
                <div className="relative">
                  <select
                    defaultValue=""
                    disabled={salvando}
                    onChange={(e) => { if (e.target.value) vincular(e.target.value) }}
                    className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-surface-base border border-surface-border rounded-md focus:outline-none focus:border-ads-500 text-ink-primary"
                  >
                    <option value="" disabled>Vincular a um grupo…</option>
                    {grupos.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" strokeWidth={2} />
                </div>
              )}
              {criando ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nomeNovo}
                    onChange={(e) => setNomeNovo(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') criarGrupo(); if (e.key === 'Escape') setCriando(false) }}
                    placeholder="Nome do grupo (ex: Paulo Alexandre)"
                    className="w-56 px-3 py-1.5 text-sm bg-surface-base border border-surface-border rounded-md focus:outline-none focus:border-ads-500 text-ink-primary"
                  />
                  <button
                    onClick={criarGrupo}
                    disabled={salvando || !nomeNovo.trim()}
                    className="px-3 py-1.5 text-sm bg-ads-500 hover:bg-ads-600 text-white rounded-md transition-colors disabled:opacity-50"
                  >
                    Criar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCriando(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-hover rounded-md border border-surface-border transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                  Novo grupo
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {consolidado && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: 'MRR do grupo', valor: `R$ ${consolidado.mrr.toLocaleString('pt-BR')}` },
                  { label: 'Investimento (mês)', valor: consolidado.temSnapshot ? `R$ ${consolidado.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—' },
                  { label: 'Cliques (mês)', valor: consolidado.temSnapshot ? consolidado.cliques.toLocaleString('pt-BR') : '—' },
                  { label: 'Conversões (mês)', valor: consolidado.temSnapshot ? consolidado.conversoes.toLocaleString('pt-BR') : '—' },
                ].map(({ label, valor }) => (
                  <div key={label} className="rounded-xl bg-surface-hover/50 border border-surface-border/50 p-2.5">
                    <p className="text-2xs uppercase tracking-wide text-ink-muted font-semibold">{label}</p>
                    <p className="text-sm font-bold text-ink-primary mt-0.5">{valor}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1">
              {membros.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-sm py-1">
                  {m.id === cliente.id ? (
                    <span className="font-medium text-ink-primary">{m.nome}</span>
                  ) : (
                    <Link href={`/clientes/${m.id}`} className="font-medium text-ink-primary hover:text-ads-500 transition-colors">
                      {m.nome}
                    </Link>
                  )}
                  <span className={cn(
                    'px-[0.5rem] py-[0.125rem] rounded-full text-2xs font-medium',
                    m.status === 'ativo' ? 'bg-status-green/10 text-status-green'
                      : m.status === 'inativo' ? 'bg-surface-hover text-ink-muted'
                      : 'bg-status-blue/10 text-status-blue'
                  )}>
                    {STATUS_LABEL[m.status] ?? m.status}
                  </span>
                  <span className="text-ink-muted text-xs ml-auto">
                    {m.mrr ? `R$ ${Number(m.mrr).toLocaleString('pt-BR')}` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
