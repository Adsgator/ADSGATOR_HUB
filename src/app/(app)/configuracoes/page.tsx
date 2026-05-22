'use client';

import React, { useEffect, useState } from 'react';
import { Save, Settings } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';

interface ConfigFinanceira {
  custos_fixos_mensais:           number;
  custos_variaveis_percentual:    number;
  margem_lucro_minima:            number;
  saldo_google_ads_limite_alerta: number;
}

export default function ConfiguracoesPage() {
  const [config,   setConfig]   = useState<ConfigFinanceira>({
    custos_fixos_mensais:           0,
    custos_variaveis_percentual:    0,
    margem_lucro_minima:            30,
    saldo_google_ads_limite_alerta: 50,
  });
  const [loading,  setLoading]  = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo,    setSalvo]    = useState(false);
  const [erro,     setErro]     = useState('');

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('configuracoes_financeiras')
        .select('custos_fixos_mensais,custos_variaveis_percentual,margem_lucro_minima,saldo_google_ads_limite_alerta')
        .eq('agencia_id', 'adsgator-main')
        .single();
      if (data) setConfig(data as ConfigFinanceira);
      setLoading(false);
    }
    carregar();
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true); setErro(''); setSalvo(false);
    try {
      const { error } = await supabase
        .from('configuracoes_financeiras')
        .update(config)
        .eq('agencia_id', 'adsgator-main');
      if (error) throw error;
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  }

  const campos = [
    { key: 'custos_fixos_mensais',           label: 'Custos Fixos Mensais (R$)',       tipo: 'moeda'      },
    { key: 'custos_variaveis_percentual',     label: 'Custos Variáveis (%)',            tipo: 'percentual' },
    { key: 'margem_lucro_minima',             label: 'Margem de Lucro Mínima (%)',      tipo: 'percentual' },
    { key: 'saldo_google_ads_limite_alerta',  label: 'Alerta Saldo Google Ads (R$)',    tipo: 'moeda'      },
  ] as const;

  return (
    <MainLayout>
      <div className="mb-[2rem] flex items-center gap-[0.75rem]">
        <Settings className="w-[1.5rem] h-[1.5rem] dark:text-ink-muted text-gray-400" strokeWidth={1.5} />
        <div>
          <h1 className="dark:text-ink-primary text-gray-900 text-[1.875rem] font-bold tracking-tight">
            Configurações
          </h1>
          <p className="dark:text-ink-secondary text-gray-500 text-sm">Parâmetros financeiros da agência</p>
        </div>
      </div>

      <div className="max-w-[32rem]">
        <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem]">
          <h2 className="dark:text-ink-primary text-gray-900 font-semibold text-base mb-[1.25rem]">
            Parâmetros Financeiros
          </h2>

          {loading ? (
            <div className="flex flex-col gap-[1rem]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[4rem] rounded dark:bg-surface-hover bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <form onSubmit={salvar} className="flex flex-col gap-[1rem]">
              {campos.map(({ key, label, tipo }) => (
                <div key={key}>
                  <label className="block dark:text-ink-secondary text-gray-700 text-sm font-medium mb-[0.375rem]">
                    {label}
                  </label>
                  <div className="relative">
                    {tipo === 'moeda' && (
                      <span className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 dark:text-ink-muted text-gray-400 text-sm">R$</span>
                    )}
                    <input
                      type="number"
                      step={tipo === 'percentual' ? '0.1' : '0.01'}
                      min="0"
                      value={config[key]}
                      onChange={(e) => setConfig((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                      className={`w-full h-[2.5rem] pr-[0.75rem] rounded dark:bg-surface-input dark:border dark:border-surface-border dark:text-ink-primary bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors ${tipo === 'moeda' ? 'pl-[2.25rem]' : 'pl-[0.75rem]'}`}
                    />
                    {tipo === 'percentual' && (
                      <span className="absolute right-[0.75rem] top-1/2 -translate-y-1/2 dark:text-ink-muted text-gray-400 text-sm">%</span>
                    )}
                  </div>
                </div>
              ))}

              {erro && (
                <p className="text-sm dark:text-status-red text-red-600">{erro}</p>
              )}
              {salvo && (
                <p className="text-sm text-brand">Configurações salvas com sucesso.</p>
              )}

              <button
                type="submit"
                disabled={salvando}
                className="flex items-center justify-center gap-[0.5rem] h-[2.5rem] rounded bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-colors disabled:opacity-50 mt-[0.5rem]"
              >
                {salvando
                  ? <div className="w-[1rem] h-[1rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Save className="w-[1rem] h-[1rem]" strokeWidth={2} />
                }
                {salvando ? 'Salvando…' : 'Salvar Configurações'}
              </button>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
