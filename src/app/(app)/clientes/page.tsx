'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Plus, Search, Users, AlertTriangle, Snowflake,
  LayoutGrid, List, MessageCircle, CheckSquare, Square,
  Download, Tag, X as XIcon,
} from 'lucide-react'
import { MainLayout }                from '@/components/layout/MainLayout'
import { Button }                    from '@/components/ui/Button'
import { ClienteProgressCard }       from '@/components/dashboard/ClienteProgressCard'
import { WhatsAppTemplateModal }     from '@/components/clientes/WhatsAppTemplateModal'
import { useClientes }               from '@/lib/hooks/useClientes'
import { supabase }                  from '@/lib/supabase'
import { toast }                     from 'sonner'
import type { Cliente }              from '@/lib/types'

const STATUS_OPCOES = [
  { value: '',                 label: 'Todos'          },
  { value: 'recebido',         label: 'Recebido'       },
  { value: 'onboarding',       label: 'Onboarding'     },
  { value: 'setup_trafego',    label: 'Setup Tráfego'  },
  { value: 'ativo',            label: 'Ativo'          },
  { value: 'congelado',        label: 'Congelado'      },
  { value: 'cancelado_debito', label: 'Cancelado D.'   },
  { value: 'cancelado',        label: 'Cancelado'      },
  { value: 'inativo',          label: 'Inativo'        },
] as const

type StatusValue = typeof STATUS_OPCOES[number]['value']

const STATUS_LABEL: Record<string, string> = {
  recebido:         'Recebido',
  onboarding:       'Onboarding',
  setup_trafego:    'Setup Tráfego',
  ativo:            'Ativo',
  congelado:        'Congelado',
  cancelado_debito: 'Cancelado D.',
  cancelado:        'Cancelado',
  inativo:          'Inativo',
}

const STATUS_COLOR: Record<string, string> = {
  ativo:            'bg-status-green/15 text-status-green',
  onboarding:       'bg-status-blue/15 text-status-blue',
  setup_trafego:    'bg-ads-500/15 text-ads-500',
  recebido:         'bg-status-purple/15 text-status-purple',
  congelado:        'bg-status-blue/15 text-status-blue',
  cancelado_debito: 'bg-status-orange/15 text-status-orange',
  cancelado:        'bg-status-red/15 text-status-red',
  inativo:          'bg-surface-hover text-ink-muted',
}

const STATUS_BATCH = STATUS_OPCOES.filter((s) => s.value !== '')

function exportarCSV(clientes: Cliente[]) {
  const header = ['Nome', 'E-mail', 'WhatsApp', 'Nicho', 'Status', 'MRR', 'Dias Atraso']
  const rows = clientes.map((c) => [
    `"${c.nome}"`,
    c.email ?? '',
    c.whatsapp ?? '',
    c.nicho ?? '',
    STATUS_LABEL[c.status] ?? c.status,
    (c.mrr ?? 0).toFixed(2).replace('.', ','),
    String(c.dias_atraso ?? 0),
  ])
  const csv  = [header, ...rows].map((r) => r.join(';')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `clientes_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ClientesPage() {
  const { dados, loading, metricas, recarregar } = useClientes()
  const [busca,        setBusca]        = useState('')
  const [filtro,       setFiltro]       = useState<StatusValue>('')
  const [filtroNicho,  setFiltroNicho]  = useState('')
  const [filtroPag,    setFiltroPag]    = useState<'' | 'adimplente' | 'inadimplente'>('')
  const [modoLista,    setModoLista]    = useState(false)
  const [whatsappCliente, setWhatsappCliente] = useState<Cliente | null>(null)

  // ── Batch select ──────────────────────────────────────────────────────────
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [batchStatus,  setBatchStatus]  = useState<StatusValue>('')
  const [salvandoBatch, setSalvandoBatch] = useState(false)

  async function handleCongelar(id: string) {
    await supabase.from('clientes').update({ status: 'congelado' }).eq('id', id)
    recarregar()
  }

  const nichos = useMemo(() => {
    const set = new Set<string>()
    dados.forEach(({ cliente: c }) => { if (c.nicho) set.add(c.nicho) })
    return Array.from(set).sort()
  }, [dados])

  const visiveis = useMemo(() =>
    dados.filter(({ cliente: c }) => {
      const matchStatus = filtro === '' || c.status === filtro
      const matchNicho  = filtroNicho === '' || c.nicho === filtroNicho
      const matchPag    = filtroPag === ''
        ? true
        : filtroPag === 'inadimplente'
          ? (c.dias_atraso ?? 0) > 0
          : (c.dias_atraso ?? 0) === 0
      const q = busca.toLowerCase()
      const matchBusca  = busca === '' ||
        c.nome.toLowerCase().includes(q) ||
        (c.email    ?? '').toLowerCase().includes(q) ||
        (c.whatsapp ?? '').includes(q) ||
        (c.nicho    ?? '').toLowerCase().includes(q)
      return matchStatus && matchNicho && matchPag && matchBusca
    }),
    [dados, filtro, filtroNicho, filtroPag, busca]
  )

  // ids visíveis para "selecionar todos"
  const idsVisiveis = useMemo(() => visiveis.map(({ cliente: c }) => c.id), [visiveis])
  const todosSelect = idsVisiveis.length > 0 && idsVisiveis.every((id) => selecionados.has(id))

  function toggleSelect(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleTodos() {
    if (todosSelect) {
      setSelecionados(new Set())
    } else {
      setSelecionados(new Set(idsVisiveis))
    }
  }

  function limparSelecao() {
    setSelecionados(new Set())
    setBatchStatus('')
  }

  function handleExportarCSV() {
    const clientesSel = dados
      .filter(({ cliente: c }) => selecionados.has(c.id))
      .map(({ cliente: c }) => c)
    exportarCSV(clientesSel)
    toast.success(`${clientesSel.length} clientes exportados`)
  }

  async function handleMudarStatusBatch() {
    if (!batchStatus) { toast.error('Selecione um status'); return }
    setSalvandoBatch(true)
    const ids = Array.from(selecionados)
    const { error } = await supabase
      .from('clientes')
      .update({ status: batchStatus })
      .in('id', ids)
    setSalvandoBatch(false)
    if (error) { toast.error('Erro ao atualizar status'); return }
    toast.success(`${ids.length} clientes atualizados para "${STATUS_LABEL[batchStatus]}"`)
    limparSelecao()
    recarregar()
  }

  // ── WhatsApp em lote — abre para o primeiro com whatsapp, em sequência ──
  const [batchWaIndex, setBatchWaIndex] = useState<number | null>(null)
  const clientesBatchWa = useMemo(() =>
    dados.filter(({ cliente: c }) => selecionados.has(c.id) && c.whatsapp).map(({ cliente: c }) => c),
    [dados, selecionados]
  )

  function handleWhatsAppBatch() {
    if (clientesBatchWa.length === 0) { toast.info('Nenhum cliente selecionado tem WhatsApp'); return }
    setBatchWaIndex(0)
    setWhatsappCliente(clientesBatchWa[0])
  }

  function handleWaClose() {
    setWhatsappCliente(null)
    if (batchWaIndex !== null && batchWaIndex + 1 < clientesBatchWa.length) {
      const next = batchWaIndex + 1
      setBatchWaIndex(next)
      setWhatsappCliente(clientesBatchWa[next])
    } else {
      setBatchWaIndex(null)
      limparSelecao()
    }
  }

  return (
    <MainLayout
      title="Clientes"
      subtitle={loading ? '…' : `${metricas.total} clientes · ${metricas.ativos} ativos · ${metricas.inadimplentes} inadimplentes`}
      actions={
        <Link href="/clientes/novo">
          <Button variant="primary" size="sm" icon={<Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}>
            Novo Cliente
          </Button>
        </Link>
      }
    >
      <div className="page-enter">
      {/* ── MINI KPIs ────────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[0.75rem] mb-[1.5rem]">
          <div className="bg-surface-card rounded-2xl card-shadow p-[1rem]">
            <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">Total</p>
            <p className="text-[1.5rem] font-bold text-ink-primary">{metricas.total}</p>
          </div>
          <div className="bg-surface-card rounded-2xl card-shadow p-[1rem]">
            <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">Ativos</p>
            <p className="text-[1.5rem] font-bold text-status-green">{metricas.ativos}</p>
          </div>
          <div className="bg-surface-card rounded-2xl card-shadow p-[1rem]">
            <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">MRR</p>
            <p className="text-[1.5rem] font-bold text-ads-500">R$ {(metricas.mrr / 1000).toFixed(1)}k</p>
          </div>
          <div className="bg-surface-card rounded-2xl card-shadow p-[1rem]">
            <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">Inadimplentes</p>
            <p className="text-[1.5rem] font-bold text-status-orange">{metricas.inadimplentes}</p>
          </div>
        </div>
      )}

      {/* ── ALERTAS RÁPIDOS ─────────────────────────────────────────── */}
      {metricas.inadimplentes > 0 && !loading && (
        <div className="flex items-center gap-[0.625rem] bg-status-orange/10 border border-status-orange/30 rounded-xl px-[1rem] py-[0.75rem] mb-[1.5rem]">
          <AlertTriangle className="w-[1rem] h-[1rem] text-status-orange shrink-0" strokeWidth={2} />
          <p className="text-status-orange text-[0.875rem] font-medium">
            {metricas.inadimplentes} cliente{metricas.inadimplentes > 1 ? 's' : ''} com pagamento em atraso
          </p>
          <Button variant="ghost" size="sm" onClick={() => setFiltro('cancelado_debito')} className="ml-auto text-status-orange hover:text-status-orange">
            Filtrar
          </Button>
        </div>
      )}

      {metricas.retidos > 0 && !loading && (
        <div className="flex items-center gap-[0.625rem] bg-status-blue/10 border border-status-blue/30 rounded-xl px-[1rem] py-[0.75rem] mb-[1.5rem]">
          <Snowflake className="w-[1rem] h-[1rem] text-status-blue shrink-0" strokeWidth={2} />
          <p className="text-status-blue text-[0.875rem] font-medium">
            {metricas.retidos} cliente{metricas.retidos > 1 ? 's' : ''} congelado{metricas.retidos > 1 ? 's' : ''} aguardando retorno
          </p>
          <Button variant="ghost" size="sm" onClick={() => setFiltro('congelado')} className="ml-auto text-status-blue hover:text-status-blue">
            Filtrar
          </Button>
        </div>
      )}

      {/* ── BARRA DE FILTROS ────────────────────────────────────────── */}
      <div className="flex flex-col gap-[0.75rem] mb-[1.5rem]">
        <div className="flex gap-[0.75rem]">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail, nicho, WhatsApp…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full h-[2.25rem] pl-[2.25rem] pr-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary placeholder:text-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
            />
          </div>
          {/* Toggle Grid/Lista */}
          <div className="flex bg-surface-hover border border-surface-border/40 rounded-lg overflow-hidden">
            <button
              onClick={() => setModoLista(false)}
              className={`w-[2.25rem] h-[2.25rem] flex items-center justify-center transition-colors ${!modoLista ? 'bg-surface-card text-ink-primary' : 'text-ink-muted hover:text-ink-secondary'}`}
              title="Grade"
            >
              <LayoutGrid className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setModoLista(true)}
              className={`w-[2.25rem] h-[2.25rem] flex items-center justify-center transition-colors ${modoLista ? 'bg-surface-card text-ink-primary' : 'text-ink-muted hover:text-ink-secondary'}`}
              title="Lista"
            >
              <List className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Filtros de status */}
        <div className="flex gap-[0.375rem] flex-wrap">
          {STATUS_OPCOES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFiltro(value)}
              className={`h-[2rem] px-[0.625rem] rounded-lg text-[0.8125rem] font-medium transition-colors ${
                filtro === value
                  ? 'bg-ads-500 text-white'
                  : 'bg-surface-hover text-ink-secondary hover:text-ink-primary border border-surface-border/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filtros avançados */}
        <div className="flex gap-[0.5rem] flex-wrap items-center">
          {nichos.length > 0 && (
            <select
              value={filtroNicho}
              onChange={(e) => setFiltroNicho(e.target.value)}
              className="h-[2rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-secondary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors"
            >
              <option value="">Todos os nichos</option>
              {nichos.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          )}

          <div className="flex bg-surface-hover border border-surface-border/40 rounded-lg overflow-hidden">
            {(['', 'adimplente', 'inadimplente'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setFiltroPag(v)}
                className={`h-[2rem] px-[0.625rem] text-[0.8125rem] font-medium transition-colors ${
                  filtroPag === v
                    ? v === 'inadimplente'
                      ? 'bg-status-orange/20 text-status-orange'
                      : 'bg-surface-card text-ink-primary'
                    : 'text-ink-muted hover:text-ink-secondary'
                }`}
              >
                {v === '' ? 'Todos' : v === 'adimplente' ? 'Adimplente' : 'Inadimplente'}
              </button>
            ))}
          </div>

          {(filtroNicho || filtroPag) && (
            <button
              onClick={() => { setFiltroNicho(''); setFiltroPag('') }}
              className="h-[2rem] px-[0.625rem] rounded-lg text-[0.8125rem] text-ink-muted hover:text-ink-primary transition-colors"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* ── BARRA DE BATCH ACTIONS ──────────────────────────────────── */}
      {selecionados.size > 0 && (
        <div className="flex items-center gap-[0.75rem] flex-wrap bg-ads-500/10 border border-ads-500/30 rounded-xl px-[1rem] py-[0.75rem] mb-[1rem] animate-fade-up">
          <span className="text-ads-500 text-[0.875rem] font-semibold shrink-0">
            {selecionados.size} selecionado{selecionados.size > 1 ? 's' : ''}
          </span>

          <div className="flex items-center gap-[0.5rem] flex-wrap">
            {/* Exportar CSV */}
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
              onClick={handleExportarCSV}
            >
              Exportar CSV
            </Button>

            {/* Mudar status em lote */}
            <div className="flex items-center gap-[0.375rem]">
              <select
                value={batchStatus}
                onChange={(e) => setBatchStatus(e.target.value as StatusValue)}
                className="h-[2rem] px-[0.5rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-secondary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 transition-colors"
              >
                <option value="">Mudar status…</option>
                {STATUS_BATCH.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {batchStatus && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Tag className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
                  loading={salvandoBatch}
                  onClick={handleMudarStatusBatch}
                >
                  Aplicar
                </Button>
              )}
            </div>

            {/* WhatsApp em lote */}
            <Button
              variant="ghost"
              size="sm"
              icon={<MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
              onClick={handleWhatsAppBatch}
            >
              WhatsApp
            </Button>
          </div>

          <button
            onClick={limparSelecao}
            className="ml-auto text-ink-muted hover:text-ink-primary transition-colors"
            title="Limpar seleção"
          >
            <XIcon className="w-[1rem] h-[1rem]" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* ── CONTAGEM + SELECIONAR TODOS ─────────────────────────────── */}
      {!loading && (
        <div className="flex items-center gap-[0.75rem] mb-[1rem]">
          <p className="text-ink-muted text-[0.8125rem]">
            {visiveis.length} de {dados.length} clientes
          </p>
          {visiveis.length > 0 && (
            <button
              onClick={toggleTodos}
              className="flex items-center gap-[0.375rem] text-[0.8125rem] text-ink-muted hover:text-ink-primary transition-colors"
            >
              {todosSelect
                ? <CheckSquare className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={2} />
                : <Square className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
              }
              {todosSelect ? 'Desselecionar todos' : 'Selecionar todos'}
            </button>
          )}
        </div>
      )}

      {/* ── CONTEÚDO ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1rem]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[10rem] rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : visiveis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[4rem] gap-[1rem] text-ink-muted">
          <Users className="w-[3rem] h-[3rem]" strokeWidth={1} />
          <p className="text-[0.9375rem]">
            {busca || filtro ? 'Nenhum cliente encontrado com esses filtros.' : 'Nenhum cliente cadastrado ainda.'}
          </p>
          {!busca && !filtro && (
            <Link href="/clientes/novo" className="text-ads-500 hover:underline text-[0.875rem] font-medium">
              Cadastrar primeiro cliente
            </Link>
          )}
        </div>
      ) : modoLista ? (
        /* ── MODO LISTA (tabular) ── */
        <div className="bg-surface-card rounded-2xl card-shadow overflow-hidden">
          <table className="w-full text-[0.875rem]">
            <thead>
              <tr className="border-b border-surface-border/30">
                <th className="px-[1rem] py-[0.75rem] w-[2.5rem]">
                  <button onClick={toggleTodos} className="flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors">
                    {todosSelect
                      ? <CheckSquare className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={2} />
                      : <Square className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                    }
                  </button>
                </th>
                {['Cliente', 'Nicho', 'Status', 'MRR', 'Atraso', 'Ações'].map((h) => (
                  <th key={h} className="text-left text-ink-muted text-[0.75rem] font-semibold uppercase tracking-wide px-[1rem] py-[0.75rem]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visiveis.map(({ cliente: c }) => {
                const temAlerta = (c.dias_atraso ?? 0) > 0
                const sel = selecionados.has(c.id)
                return (
                  <tr
                    key={c.id}
                    className={`border-b border-surface-border/30 last:border-0 hover:bg-surface-hover transition-colors ${sel ? 'bg-ads-500/5' : ''}`}
                  >
                    <td className="px-[1rem] py-[0.75rem]">
                      <button
                        onClick={() => toggleSelect(c.id)}
                        className="flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
                      >
                        {sel
                          ? <CheckSquare className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={2} />
                          : <Square className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                        }
                      </button>
                    </td>
                    <td className="px-[1rem] py-[0.75rem]">
                      <div className="flex items-center gap-[0.5rem]">
                        {temAlerta && <AlertTriangle className="w-[0.75rem] h-[0.75rem] text-status-orange shrink-0" strokeWidth={2} />}
                        <a href={`/clientes/${c.id}`} className="text-ink-primary font-medium hover:text-ads-500 transition-colors">{c.nome}</a>
                      </div>
                    </td>
                    <td className="px-[1rem] py-[0.75rem] text-ink-secondary">{c.nicho ?? '—'}</td>
                    <td className="px-[1rem] py-[0.75rem]">
                      <span className={`text-[0.75rem] font-medium px-[0.5rem] py-[0.125rem] rounded-full ${STATUS_COLOR[c.status] ?? 'bg-surface-hover text-ink-muted'}`}>
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-[1rem] py-[0.75rem] text-ink-secondary">
                      {c.mrr ? `R$ ${c.mrr.toLocaleString('pt-BR')}` : '—'}
                    </td>
                    <td className="px-[1rem] py-[0.75rem]">
                      {(c.dias_atraso ?? 0) > 0
                        ? <span className="text-status-orange font-semibold">D+{c.dias_atraso}</span>
                        : <span className="text-ink-muted">—</span>
                      }
                    </td>
                    <td className="px-[1rem] py-[0.75rem]">
                      <div className="flex items-center gap-[0.375rem]">
                        <a href={`/clientes/${c.id}`} className="h-[1.75rem] px-[0.5rem] rounded-lg bg-surface-hover text-ink-secondary text-[0.75rem] font-medium hover:text-ink-primary border border-surface-border/40 transition-colors flex items-center">
                          Ver
                        </a>
                        {c.whatsapp && (
                          <button
                            onClick={() => setWhatsappCliente(c)}
                            className="w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded-lg bg-status-green/10 text-status-green hover:bg-status-green/20 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── MODO GRID ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1rem]">
          {visiveis.map(({ cliente, estagio }) => (
            <div key={cliente.id} className="relative group">
              {/* Checkbox sobre o card */}
              <button
                onClick={() => toggleSelect(cliente.id)}
                className={`absolute top-[0.75rem] left-[0.75rem] z-10 flex items-center justify-center w-[1.5rem] h-[1.5rem] rounded transition-all ${
                  selecionados.has(cliente.id)
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                {selecionados.has(cliente.id)
                  ? <CheckSquare className="w-[1rem] h-[1rem] text-ads-500 drop-shadow" strokeWidth={2.5} />
                  : <Square className="w-[1rem] h-[1rem] text-ink-muted bg-surface-card rounded" strokeWidth={2} />
                }
              </button>
              <div className={selecionados.has(cliente.id) ? 'ring-2 ring-ads-500/40 rounded-2xl' : ''}>
                <ClienteProgressCard
                  cliente={cliente}
                  estagio={estagio}
                  onCongelar={handleCongelar}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL WHATSAPP ────────────────────────────────────────────── */}
      {whatsappCliente && (
        <WhatsAppTemplateModal
          cliente={whatsappCliente}
          onClose={batchWaIndex !== null ? handleWaClose : () => setWhatsappCliente(null)}
        />
      )}
      </div>
    </MainLayout>
  )
}
