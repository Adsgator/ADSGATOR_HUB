'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Plus, Search, Users, AlertTriangle, Snowflake,
  LayoutGrid, List, MessageCircle,
} from 'lucide-react'
import { MainLayout }                from '@/components/layout/MainLayout'
import { ClienteProgressCard }       from '@/components/dashboard/ClienteProgressCard'
import { WhatsAppTemplateModal }     from '@/components/clientes/WhatsAppTemplateModal'
import { useClientes }               from '@/lib/hooks/useClientes'
import { supabase }                  from '@/lib/supabase'
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

export default function ClientesPage() {
  const { dados, loading, metricas, recarregar } = useClientes()
  const [busca,        setBusca]        = useState('')
  const [filtro,       setFiltro]       = useState('')
  const [modoLista,    setModoLista]    = useState(false)
  const [whatsappCliente, setWhatsappCliente] = useState<Cliente | null>(null)

  async function handleCongelar(id: string) {
    await supabase.from('clientes').update({ status: 'congelado' }).eq('id', id)
    recarregar()
  }

  const visiveis = useMemo(() =>
    dados.filter(({ cliente: c }) => {
      const matchStatus = filtro === '' || c.status === filtro
      const q = busca.toLowerCase()
      const matchBusca  = busca === '' ||
        c.nome.toLowerCase().includes(q) ||
        (c.email    ?? '').toLowerCase().includes(q) ||
        (c.whatsapp ?? '').includes(q) ||
        (c.nicho    ?? '').toLowerCase().includes(q)
      return matchStatus && matchBusca
    }),
    [dados, filtro, busca]
  )

  return (
    <MainLayout
      title="Clientes"
      subtitle={loading ? '…' : `${metricas.total} clientes · ${metricas.ativos} ativos · ${metricas.inadimplentes} inadimplentes`}
      actions={
        <Link
          href="/clientes/novo"
          className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors"
        >
          <Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
          <span>Novo Cliente</span>
        </Link>
      }
    >
      {/* ── ALERTAS RÁPIDOS ─────────────────────────────────────────── */}
      {metricas.inadimplentes > 0 && !loading && (
        <div className="flex items-center gap-[0.625rem] bg-status-orange/10 border border-status-orange/30 rounded-xl px-[1rem] py-[0.75rem] mb-[1.5rem]">
          <AlertTriangle className="w-[1rem] h-[1rem] text-status-orange shrink-0" strokeWidth={2} />
          <p className="text-status-orange text-[0.875rem] font-medium">
            {metricas.inadimplentes} cliente{metricas.inadimplentes > 1 ? 's' : ''} com pagamento em atraso
          </p>
          <button onClick={() => setFiltro('cancelado_debito')} className="ml-auto text-status-orange text-[0.75rem] underline">
            Filtrar
          </button>
        </div>
      )}

      {metricas.retidos > 0 && !loading && (
        <div className="flex items-center gap-[0.625rem] bg-status-blue/10 border border-status-blue/30 rounded-xl px-[1rem] py-[0.75rem] mb-[1.5rem]">
          <Snowflake className="w-[1rem] h-[1rem] text-status-blue shrink-0" strokeWidth={2} />
          <p className="text-status-blue text-[0.875rem] font-medium">
            {metricas.retidos} cliente{metricas.retidos > 1 ? 's' : ''} congelado{metricas.retidos > 1 ? 's' : ''} aguardando retorno
          </p>
          <button onClick={() => setFiltro('congelado')} className="ml-auto text-status-blue text-[0.75rem] underline">
            Filtrar
          </button>
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
              className="w-full h-[2.25rem] pl-[2.25rem] pr-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-primary placeholder:text-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
            />
          </div>
          {/* Toggle Grid/Lista */}
          <div className="flex bg-surface-hover border border-surface-border rounded-[0.375rem] overflow-hidden">
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
              className={`h-[2rem] px-[0.625rem] rounded-[0.375rem] text-[0.8125rem] font-medium transition-colors ${
                filtro === value
                  ? 'bg-ads-500 text-white'
                  : 'bg-surface-hover text-ink-secondary hover:text-ink-primary border border-surface-border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTAGEM ─────────────────────────────────────────────────── */}
      {!loading && (
        <p className="text-ink-muted text-[0.8125rem] mb-[1rem]">
          {visiveis.length} de {dados.length} clientes
        </p>
      )}

      {/* ── CONTEÚDO ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1rem]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[10rem] rounded-xl bg-surface-card border border-surface-border animate-pulse" />
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
        <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
          <table className="w-full text-[0.875rem]">
            <thead>
              <tr className="border-b border-surface-border">
                {['Cliente', 'Nicho', 'Status', 'MRR', 'Atraso', 'Ações'].map((h) => (
                  <th key={h} className="text-left text-ink-muted text-[0.75rem] font-semibold uppercase tracking-wide px-[1rem] py-[0.75rem]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visiveis.map(({ cliente: c, estagio }) => {
                const temAlerta = (c.dias_atraso ?? 0) > 0
                return (
                  <tr key={c.id} className="border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors">
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
                        <a href={`/clientes/${c.id}`} className="h-[1.75rem] px-[0.5rem] rounded bg-surface-hover text-ink-secondary text-[0.75rem] font-medium hover:text-ink-primary border border-surface-border transition-colors flex items-center">
                          Ver
                        </a>
                        {c.whatsapp && (
                          <button
                            onClick={() => setWhatsappCliente(c)}
                            className="w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded bg-status-green/10 text-status-green hover:bg-status-green/20 transition-colors"
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
            <ClienteProgressCard
              key={cliente.id}
              cliente={cliente}
              estagio={estagio}
              onCongelar={handleCongelar}
            />
          ))}
        </div>
      )}

      {/* ── MODAL WHATSAPP ────────────────────────────────────────────── */}
      {whatsappCliente && (
        <WhatsAppTemplateModal
          cliente={whatsappCliente}
          onClose={() => setWhatsappCliente(null)}
        />
      )}
    </MainLayout>
  )
}
