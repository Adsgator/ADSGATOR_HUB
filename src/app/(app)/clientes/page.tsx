'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Users, AlertTriangle, Snowflake } from 'lucide-react'
import { MainLayout }          from '@/components/layout/MainLayout'
import { ClienteProgressCard } from '@/components/dashboard/ClienteProgressCard'
import { useClientes }         from '@/lib/hooks/useClientes'
import { supabase }            from '@/lib/supabase'

const STATUS_OPCOES = [
  { value: '',                label: 'Todos'          },
  { value: 'recebido',        label: 'Recebido'       },
  { value: 'onboarding',      label: 'Onboarding'     },
  { value: 'setup_trafego',   label: 'Setup Tráfego'  },
  { value: 'ativo',           label: 'Ativo'          },
  { value: 'congelado',       label: 'Congelado'      },
  { value: 'cancelado_debito',label: 'Cancelado D.'   },
  { value: 'cancelado',       label: 'Cancelado'      },
] as const

export default function ClientesPage() {
  const { dados, loading, metricas, recarregar } = useClientes()
  const [busca,  setBusca]  = useState('')
  const [filtro, setFiltro] = useState('')

  async function handleCongelar(id: string) {
    await supabase.from('clientes').update({ status: 'congelado' }).eq('id', id)
    recarregar()
  }

  const visiveis = useMemo(() =>
    dados.filter(({ cliente: c }) => {
      const matchStatus = filtro === '' || c.status === filtro
      const matchBusca  = busca  === '' ||
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (c.email ?? '').toLowerCase().includes(busca.toLowerCase())
      return matchStatus && matchBusca
    }),
    [dados, filtro, busca]
  )

  return (
    <MainLayout
      title="Clientes"
      subtitle={loading ? '...' : `${metricas.total} clientes · ${metricas.ativos} ativos · ${metricas.inadimplentes} inadimplentes`}
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

      {/* ── FILTROS ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-[0.75rem] mb-[1.5rem]">
        <div className="relative flex-1">
          <Search className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full h-[2.25rem] pl-[2.25rem] pr-[0.75rem] rounded-[0.375rem] bg-surface-input border border-surface-border text-ink-primary placeholder-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
          />
        </div>
        <div className="flex gap-[0.375rem] flex-wrap">
          {STATUS_OPCOES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFiltro(value)}
              className={`h-[2.25rem] px-[0.75rem] rounded-[0.375rem] text-[0.8125rem] font-medium transition-colors ${
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

      {/* ── GRID ────────────────────────────────────────────────────── */}
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
      ) : (
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
    </MainLayout>
  )
}
