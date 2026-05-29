'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle, ChevronDown, ChevronRight, Users,
  TrendingUp, Clock, RefreshCw,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button }     from '@/components/ui/Button'
import { supabase }   from '@/lib/supabase'
import { cn }         from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClienteRow {
  id: string
  nome: string
  nicho: string | null
  mrr: number | null
  status: string
  dias_atraso: number | null
}

// ─── Column definitions ────────────────────────────────────────────────────────

type GroupKey = 'pre-venda' | 'principal' | 'pos-venda'

interface ColumnDef {
  status: string
  label: string
  color: string
  headerBg: string
  group: GroupKey
}

const COLUMNS: ColumnDef[] = [
  // Pré-venda
  { status: 'prospeccao',         label: 'Prospecção',      color: 'text-status-cyan',   headerBg: 'bg-status-cyan/10 border-status-cyan/25',   group: 'pre-venda' },
  { status: 'diagnostico',        label: 'Diagnóstico',     color: 'text-status-cyan',   headerBg: 'bg-status-cyan/10 border-status-cyan/25',   group: 'pre-venda' },
  { status: 'proposta',           label: 'Proposta',        color: 'text-status-cyan',   headerBg: 'bg-status-cyan/10 border-status-cyan/25',   group: 'pre-venda' },
  { status: 'negociacao',         label: 'Negociação',      color: 'text-status-cyan',   headerBg: 'bg-status-cyan/10 border-status-cyan/25',   group: 'pre-venda' },
  // Principal
  { status: 'recebido',           label: 'Recebido',        color: 'text-status-blue',   headerBg: 'bg-status-blue/10 border-status-blue/25',   group: 'principal' },
  { status: 'onboarding',         label: 'Onboarding',      color: 'text-status-purple', headerBg: 'bg-status-purple/10 border-status-purple/25', group: 'principal' },
  { status: 'setup_trafego',      label: 'Setup Tráfego',   color: 'text-status-cyan',   headerBg: 'bg-status-cyan/10 border-status-cyan/25',   group: 'principal' },
  { status: 'ativo',              label: 'Ativo',           color: 'text-status-green',  headerBg: 'bg-status-green/10 border-status-green/25',  group: 'principal' },
  // Pós-venda
  { status: 'congelado',          label: 'Congelado',       color: 'text-status-orange', headerBg: 'bg-status-orange/10 border-status-orange/25', group: 'pos-venda' },
  { status: 'aviso_cancelamento', label: 'Aviso Cancel.',   color: 'text-status-red',    headerBg: 'bg-status-red/10 border-status-red/25',     group: 'pos-venda' },
  { status: 'encerramento',       label: 'Encerramento',    color: 'text-status-red',    headerBg: 'bg-status-red/10 border-status-red/25',     group: 'pos-venda' },
  { status: 'cancelado',          label: 'Cancelado',       color: 'text-status-red',    headerBg: 'bg-status-red/10 border-status-red/25',     group: 'pos-venda' },
]

const GROUP_LABELS: Record<GroupKey, string> = {
  'pre-venda': 'Pré-venda',
  'principal': 'Pipeline Principal',
  'pos-venda': 'Pós-venda',
}

// ─── Client card ──────────────────────────────────────────────────────────────

function ClienteCard({
  cliente,
  color,
  onClick,
}: {
  cliente: ClienteRow
  color: string
  onClick: () => void
}) {
  const atrasado = (cliente.dias_atraso ?? 0) > 0

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface-card border border-surface-border rounded-xl p-[0.75rem] card-shadow card-interactive group"
    >
      <p className={cn('text-[0.8125rem] font-semibold text-ink-primary truncate group-hover:text-ads-500 transition-colors')}>
        {cliente.nome}
      </p>
      {cliente.nicho && (
        <p className="text-[0.6875rem] text-ink-muted mt-[0.125rem] truncate">{cliente.nicho}</p>
      )}
      <div className="flex items-center gap-[0.375rem] mt-[0.5rem] flex-wrap">
        {cliente.mrr != null && cliente.mrr > 0 && (
          <span className="text-[0.6875rem] font-medium text-ink-secondary bg-surface-hover border border-surface-border/40 rounded-full px-[0.5rem] py-[0.0625rem]">
            R$ {cliente.mrr.toLocaleString('pt-BR')}
          </span>
        )}
        {atrasado && (
          <span className="flex items-center gap-[0.1875rem] text-[0.6875rem] font-semibold text-status-orange bg-status-orange/10 border border-status-orange/25 rounded-full px-[0.5rem] py-[0.0625rem]">
            <AlertTriangle className="w-[0.625rem] h-[0.625rem]" strokeWidth={2.5} />
            D+{cliente.dias_atraso}
          </span>
        )}
      </div>
    </button>
  )
}

// ─── Column component ─────────────────────────────────────────────────────────

function PipelineColumn({
  col,
  clientes,
  onClienteClick,
  isPreVenda,
}: {
  col: ColumnDef
  clientes: ClienteRow[]
  onClienteClick: (id: string) => void
  isPreVenda: boolean
}) {
  // Pré-venda columns: only render if count > 0
  if (isPreVenda && clientes.length === 0) return null

  return (
    <div className="flex flex-col min-w-[13rem] w-[13rem] shrink-0">
      {/* Header */}
      <div className={cn('flex items-center justify-between px-[0.75rem] py-[0.5rem] rounded-xl border mb-[0.75rem]', col.headerBg)}>
        <span className={cn('text-[0.75rem] font-semibold', col.color)}>{col.label}</span>
        {clientes.length > 0 && (
          <span className={cn('text-[0.6875rem] font-bold tabular-nums', col.color)}>
            {clientes.length}
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-[0.5rem]">
        {clientes.length === 0 ? (
          <div className="border border-dashed border-surface-border rounded-xl h-[5rem] flex items-center justify-center">
            <span className="text-[0.75rem] text-ink-muted">Vazio</span>
          </div>
        ) : (
          clientes.map((c) => (
            <ClienteCard
              key={c.id}
              cliente={c}
              color={col.color}
              onClick={() => onClienteClick(c.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OperacionalPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<ClienteRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [posVendaOpen, setPosVendaOpen] = useState(false)

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('clientes')
      .select('id, nome, nicho, mrr, status, dias_atraso')
      .neq('status', 'inativo')
      .order('nome')
    setClientes((data as ClienteRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const totalAtivos = useMemo(
    () => clientes.filter((c) => c.status === 'ativo').length,
    [clientes],
  )

  const totalMRR = useMemo(
    () => clientes.filter((c) => c.status === 'ativo').reduce((sum, c) => sum + (c.mrr ?? 0), 0),
    [clientes],
  )

  const totalInadimplentes = useMemo(
    () => clientes.filter((c) => (c.dias_atraso ?? 0) > 0).length,
    [clientes],
  )

  // ── Group clients by status ──────────────────────────────────────────────────
  const byStatus = useMemo(() => {
    const map: Record<string, ClienteRow[]> = {}
    for (const col of COLUMNS) map[col.status] = []
    for (const c of clientes) {
      if (map[c.status]) map[c.status].push(c)
    }
    return map
  }, [clientes])

  const preVendaCols   = COLUMNS.filter((c) => c.group === 'pre-venda')
  const principalCols  = COLUMNS.filter((c) => c.group === 'principal')
  const posVendaCols   = COLUMNS.filter((c) => c.group === 'pos-venda')

  const posVendaCount = posVendaCols.reduce((sum, col) => sum + (byStatus[col.status]?.length ?? 0), 0)

  function handleClienteClick(id: string) {
    router.push(`/clientes/${id}`)
  }

  return (
    <MainLayout
      title="Operacional"
      subtitle="Pipeline de clientes por status"
      actions={
        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
          loading={loading}
          onClick={carregar}
        >
          Atualizar
        </Button>
      }
    >
      <div className="page-enter">

        {/* ── SUMMARY BAR ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-[0.75rem] mb-[1.5rem]">
          <div className="bg-surface-card border border-surface-border rounded-xl p-[1rem] card-shadow flex items-center gap-[0.75rem]">
            <div className="w-[2.25rem] h-[2.25rem] rounded-lg bg-status-green/10 flex items-center justify-center shrink-0">
              <Users className="w-[1rem] h-[1rem] text-status-green" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide">Ativos</p>
              <p className="text-[1.25rem] font-bold text-ink-primary tabular-nums">{loading ? '—' : totalAtivos}</p>
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-[1rem] card-shadow flex items-center gap-[0.75rem]">
            <div className="w-[2.25rem] h-[2.25rem] rounded-lg bg-ads-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide">MRR Ativos</p>
              <p className="text-[1.25rem] font-bold text-ads-500 tabular-nums">
                {loading ? '—' : `R$ ${(totalMRR / 1000).toFixed(1)}k`}
              </p>
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-[1rem] card-shadow flex items-center gap-[0.75rem]">
            <div className="w-[2.25rem] h-[2.25rem] rounded-lg bg-status-orange/10 flex items-center justify-center shrink-0">
              <Clock className="w-[1rem] h-[1rem] text-status-orange" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide">Inadimplentes</p>
              <p className="text-[1.25rem] font-bold text-status-orange tabular-nums">{loading ? '—' : totalInadimplentes}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-[0.75rem] overflow-x-auto pb-[1rem]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="min-w-[13rem] w-[13rem] shrink-0 h-[20rem] rounded-xl skeleton-shimmer" />
            ))}
          </div>
        ) : (
          <>
            {/* ── PRÉ-VENDA (only if any populated) ──────────────────────── */}
            {preVendaCols.some((col) => byStatus[col.status].length > 0) && (
              <div className="mb-[1.5rem]">
                <p className="text-ink-muted text-[0.75rem] font-semibold uppercase tracking-wide mb-[0.75rem]">
                  {GROUP_LABELS['pre-venda']}
                </p>
                <div className="flex gap-[0.75rem] overflow-x-auto pb-[0.5rem]">
                  {preVendaCols.map((col) => (
                    <PipelineColumn
                      key={col.status}
                      col={col}
                      clientes={byStatus[col.status]}
                      onClienteClick={handleClienteClick}
                      isPreVenda
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── PIPELINE PRINCIPAL ─────────────────────────────────────── */}
            <div className="mb-[1.5rem]">
              <p className="text-ink-muted text-[0.75rem] font-semibold uppercase tracking-wide mb-[0.75rem]">
                {GROUP_LABELS['principal']}
              </p>
              <div className="flex gap-[0.75rem] overflow-x-auto pb-[0.5rem]">
                {principalCols.map((col) => (
                  <PipelineColumn
                    key={col.status}
                    col={col}
                    clientes={byStatus[col.status]}
                    onClienteClick={handleClienteClick}
                    isPreVenda={false}
                  />
                ))}
              </div>
            </div>

            {/* ── PÓS-VENDA (collapsible) ────────────────────────────────── */}
            <div>
              <button
                onClick={() => setPosVendaOpen((v) => !v)}
                className="flex items-center gap-[0.5rem] text-ink-muted text-[0.75rem] font-semibold uppercase tracking-wide mb-[0.75rem] hover:text-ink-secondary transition-colors"
              >
                {posVendaOpen
                  ? <ChevronDown className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                  : <ChevronRight className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                }
                {GROUP_LABELS['pos-venda']}
                {posVendaCount > 0 && (
                  <span className="text-[0.6875rem] font-bold text-status-red bg-status-red/10 border border-status-red/25 rounded-full px-[0.5rem] py-[0.0625rem]">
                    {posVendaCount}
                  </span>
                )}
              </button>

              {posVendaOpen && (
                <div className="flex gap-[0.75rem] overflow-x-auto pb-[0.5rem] animate-fade-up">
                  {posVendaCols.map((col) => (
                    <PipelineColumn
                      key={col.status}
                      col={col}
                      clientes={byStatus[col.status]}
                      onClienteClick={handleClienteClick}
                      isPreVenda={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}
