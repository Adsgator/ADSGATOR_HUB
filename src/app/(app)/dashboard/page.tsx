'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, PauseCircle } from 'lucide-react';
import type { Cliente, Estagio } from '@/lib/types';
import { listarClientes, obterEstagioAtivo, congelarCliente } from '@/lib/database';
import { ClienteCard } from '@/components/clientes/ClienteCard';
import { MainLayout } from '@/components/layout/MainLayout';

type ClienteComEstagio = { cliente: Cliente; estagio: Estagio | null };

const FILTROS = [
  { key: null,            label: 'Todos'         },
  { key: 'recebido',      label: 'Recebidos'     },
  { key: 'onboarding',    label: 'Onboarding'    },
  { key: 'setup_trafego', label: 'Setup Tráfego' },
  { key: 'ativo',         label: 'Ativos'        },
] as const;

export default function DashboardPage() {
  const [dados,   setDados]   = useState<ClienteComEstagio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro,  setFiltro]  = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const clientes = await listarClientes();
      const comEstagio = await Promise.all(
        clientes.map(async (c) => ({
          cliente: c,
          estagio: await obterEstagioAtivo(c.id).catch(() => null),
        }))
      );
      setDados(comEstagio);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  async function handleCongelar(clienteId: string) {
    await congelarCliente(clienteId).catch(console.error);
    carregarDados();
  }

  const retidos   = dados.filter((d) => d.cliente.status === 'congelado');
  const ativos    = dados.filter((d) => d.cliente.status !== 'congelado' && d.cliente.status !== 'cancelado');
  const filtrados = filtro ? ativos.filter((d) => d.cliente.status === filtro) : ativos;

  const totalAtivos    = dados.filter((d) => d.cliente.status === 'ativo').length;
  const totalRetidos   = retidos.length;
  const totalRecebidos = dados.filter((d) => d.cliente.status === 'recebido').length;
  const totalGeral     = dados.length;
  const taxaRetencao   = totalGeral > 0 ? Math.round((totalAtivos / totalGeral) * 100) : 0;

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-[2rem]">
        <h1 className="dark:text-ink-primary text-gray-900 text-[1.875rem] font-bold tracking-tight mb-[0.25rem]">
          Central Operacional
        </h1>
        <p className="dark:text-ink-secondary text-gray-500 text-sm">
          Cada cliente tem uma ação clara. Siga o fluxo.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1rem] mb-[2rem]">
        {[
          { label: 'Total de Clientes', valor: totalGeral,         cor: 'dark:text-ink-primary text-gray-900'   },
          { label: 'Ativos',            valor: totalAtivos,        cor: 'text-brand'                             },
          { label: 'Retidos',           valor: totalRetidos,       cor: 'text-status-orange'                     },
          { label: 'Taxa de Retenção',  valor: `${taxaRetencao}%`, cor: 'dark:text-ink-primary text-gray-900'   },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 px-[1.25rem] py-[1rem]"
          >
            <p className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold mb-[0.375rem]">
              {kpi.label}
            </p>
            <p className={`text-[1.75rem] font-bold leading-none ${kpi.cor}`}>
              {kpi.valor}
            </p>
          </div>
        ))}
      </div>

      {/* Alerta: clientes recebidos precisam de ação imediata */}
      {totalRecebidos > 0 && (
        <div className="mb-[1.5rem] flex items-start gap-[0.75rem] dark:bg-status-blue/8 bg-blue-50 border dark:border-status-blue/20 border-blue-100 rounded-lg px-[1rem] py-[0.875rem]">
          <AlertCircle className="shrink-0 w-[1rem] h-[1rem] text-status-blue mt-[0.0625rem]" strokeWidth={2} />
          <p className="text-sm dark:text-status-blue text-blue-700 font-medium">
            {totalRecebidos} cliente{totalRecebidos > 1 ? 's' : ''} aguardando ação imediata — envie o #BOASVINDAS agora.
          </p>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-[0.375rem] mb-[1.5rem]">
        {FILTROS.map(({ key, label }) => (
          <button
            key={String(key)}
            onClick={() => setFiltro(key)}
            className={`
              text-xs font-semibold px-[0.75rem] h-[1.75rem] rounded-[0.25rem] transition-colors
              ${filtro === key
                ? 'dark:bg-brand/15 dark:text-brand bg-green-100 text-green-700'
                : 'dark:bg-surface-hover dark:text-ink-secondary dark:hover:text-ink-primary bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid de clientes ativos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 h-[14rem] animate-pulse" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[4rem] dark:text-ink-muted text-gray-400">
          <CheckCircle className="w-[3rem] h-[3rem] mb-[1rem]" strokeWidth={1} />
          <p className="text-base font-medium">Nenhum cliente nesta categoria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem] mb-[3rem]">
          {filtrados.map(({ cliente, estagio }) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              estagio={estagio}
              onCongelar={handleCongelar}
            />
          ))}
        </div>
      )}

      {/* Seção: Clientes Retidos */}
      {retidos.length > 0 && (
        <section>
          <div className="flex items-center gap-[0.5rem] mb-[1rem]">
            <PauseCircle className="w-[1rem] h-[1rem] text-status-orange" strokeWidth={2} />
            <h2 className="dark:text-ink-primary text-gray-800 font-semibold text-base">
              Clientes Retidos ({retidos.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
            {retidos.map(({ cliente, estagio }) => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                estagio={estagio}
                onCongelar={handleCongelar}
              />
            ))}
          </div>
        </section>
      )}
    </MainLayout>
  );
}
