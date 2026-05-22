'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Users } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ClienteCard } from '@/components/clientes/ClienteCard';
import { supabase } from '@/lib/supabase';
import type { Cliente, Estagio } from '@/lib/types';

const STATUS_OPCOES = [
  { value: '',             label: 'Todos'         },
  { value: 'recebido',     label: 'Recebido'      },
  { value: 'onboarding',   label: 'Onboarding'    },
  { value: 'setup_trafego',label: 'Setup Tráfego' },
  { value: 'ativo',        label: 'Ativo'         },
  { value: 'congelado',    label: 'Congelado'     },
  { value: 'cancelado',    label: 'Cancelado'     },
] as const;

export default function ClientesPage() {
  const [clientes,  setClientes]  = useState<Cliente[]>([]);
  const [estagios,  setEstagios]  = useState<Record<string, Estagio | null>>({});
  const [busca,     setBusca]     = useState('');
  const [filtro,    setFiltro]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState('');

  const carregar = useCallback(async () => {
    setLoading(true); setErro('');
    try {
      let q = supabase
        .from('clientes')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (filtro) q = q.eq('status', filtro);

      const { data, error } = await q;
      if (error) throw error;
      const lista = (data ?? []) as Cliente[];
      setClientes(lista);

      if (lista.length > 0) {
        const ids = lista.map((c) => c.id);
        const { data: estData } = await supabase
          .from('estagios_operacionais')
          .select('*')
          .in('cliente_id', ids)
          .is('data_saida', null);
        const map: Record<string, Estagio | null> = {};
        lista.forEach((c) => {
          map[c.id] = (estData ?? []).find((e) => e.cliente_id === c.id) as Estagio ?? null;
        });
        setEstagios(map);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => { carregar(); }, [carregar]);

  const visiveis = clientes.filter((c) =>
    busca === '' ||
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <MainLayout>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-[2rem]">
        <div>
          <h1 className="dark:text-ink-primary text-gray-900 text-[1.875rem] font-bold tracking-tight mb-[0.25rem]">
            Clientes
          </h1>
          <p className="dark:text-ink-secondary text-gray-500 text-sm">
            {loading ? '...' : `${clientes.length} cliente${clientes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/clientes/novo"
          className="flex items-center gap-[0.5rem] h-[2.5rem] px-[1rem] rounded bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-[1rem] h-[1rem]" strokeWidth={2} />
          Novo Cliente
        </Link>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row gap-[0.75rem] mb-[1.5rem]">
        <div className="relative flex-1">
          <Search className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 w-[0.875rem] h-[0.875rem] dark:text-ink-muted text-gray-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full h-[2.5rem] pl-[2.25rem] pr-[0.75rem] rounded dark:bg-surface-input dark:border dark:border-surface-border dark:text-ink-primary dark:placeholder-ink-muted bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
          />
        </div>
        <div className="flex gap-[0.375rem] flex-wrap">
          {STATUS_OPCOES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFiltro(value)}
              className={`h-[2.5rem] px-[0.875rem] rounded text-sm font-medium transition-colors ${
                filtro === value
                  ? 'bg-brand text-white'
                  : 'dark:bg-surface-hover dark:text-ink-secondary dark:hover:text-ink-primary bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTEÚDO */}
      {erro && (
        <div className="dark:bg-status-red/10 bg-red-50 border dark:border-status-red/20 border-red-200 rounded px-[1rem] py-[0.75rem] mb-[1.5rem]">
          <p className="text-sm dark:text-status-red text-red-700">{erro}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1rem]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[10rem] rounded-lg dark:bg-surface-card bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : visiveis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[4rem] gap-[1rem]">
          <Users className="w-[3rem] h-[3rem] dark:text-ink-muted text-gray-300" strokeWidth={1} />
          <p className="dark:text-ink-secondary text-gray-500 text-sm">
            {busca || filtro ? 'Nenhum cliente encontrado com esses filtros.' : 'Nenhum cliente cadastrado ainda.'}
          </p>
          {!busca && !filtro && (
            <Link href="/clientes/novo" className="text-brand hover:underline text-sm font-medium">
              Cadastrar primeiro cliente
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1rem]">
          {visiveis.map((c) => (
            <ClienteCard
              key={c.id}
              cliente={c}
              estagio={estagios[c.id] ?? null}
              onCongelar={async (id) => {
                await supabase.from('clientes').update({ status: 'congelado' }).eq('id', id);
                carregar();
              }}
            />
          ))}
        </div>
      )}
    </MainLayout>
  );
}
