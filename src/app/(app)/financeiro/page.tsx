'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp, DollarSign, AlertCircle, CheckCircle,
  MessageCircle, Settings, ChevronDown, ChevronUp, Save,
} from 'lucide-react';
import {
  calcularDREMensal,
  projetarFinanceiro3Meses,
  validarMargemMinima,
  listarClientesAtrasados,
  obterConfigFinanceira,
  atualizarConfigFinanceira,
  type DREData,
  type ProjecaoMensal,
  type ValidacaoMargem,
  type ClienteAtrasado,
  type ConfigFinanceira,
} from '@/lib/financeiro';
import { MainLayout } from '@/components/layout/MainLayout';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const pct = (parte: number, total: number) =>
  total > 0 ? ((parte / total) * 100).toFixed(1) : '0.0';

export default function FinanceiroPage() {
  const [dre,       setDre]       = useState<DREData | null>(null);
  const [projecao,  setProjecao]  = useState<ProjecaoMensal[]>([]);
  const [validacao, setValidacao] = useState<ValidacaoMargem | null>(null);
  const [atrasados, setAtrasados] = useState<ClienteAtrasado[]>([]);
  const [config,    setConfig]    = useState<ConfigFinanceira | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [editando,  setEditando]  = useState(false);
  const [salvando,  setSalvando]  = useState(false);
  const [formConfig, setFormConfig] = useState({
    custos_fixos_mensais:        '',
    custos_variaveis_percentual: '',
  });

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [dreDados, proj, val, atr, cfg] = await Promise.all([
        calcularDREMensal(),
        projetarFinanceiro3Meses(),
        validarMargemMinima(),
        listarClientesAtrasados(),
        obterConfigFinanceira(),
      ]);
      setDre(dreDados);
      setProjecao(proj);
      setValidacao(val);
      setAtrasados(atr);
      setConfig(cfg);
      setFormConfig({
        custos_fixos_mensais:        String(cfg.custos_fixos_mensais),
        custos_variaveis_percentual: String(cfg.custos_variaveis_percentual),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function salvarConfig() {
    setSalvando(true);
    try {
      await atualizarConfigFinanceira({
        custos_fixos_mensais:        parseFloat(formConfig.custos_fixos_mensais)        || 0,
        custos_variaveis_percentual: parseFloat(formConfig.custos_variaveis_percentual) || 0,
      });
      setEditando(false);
      await carregar();
    } catch (e) {
      console.error(e);
    } finally {
      setSalvando(false);
    }
  }

  if (loading || !dre) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[20rem]">
          <div className="w-[1.5rem] h-[1.5rem] border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const kpis = [
    {
      label: 'MRR',
      valor: fmt(dre.mrr),
      sub:   'Receita recorrente mensal',
      icon:  TrendingUp,
      cor:   'text-brand',
    },
    {
      label: 'Lucro Bruto',
      valor: fmt(dre.lucro_bruto),
      sub:   `${pct(dre.lucro_bruto, dre.mrr)}% da receita`,
      icon:  DollarSign,
      cor:   'text-status-blue',
    },
    {
      label: 'Custos Totais',
      valor: fmt(dre.custos_fixos + dre.custos_variaveis),
      sub:   'Fixos + Variáveis',
      icon:  AlertCircle,
      cor:   'text-status-orange',
    },
    {
      label: 'Lucro Líquido',
      valor: fmt(dre.lucro_liquido),
      sub:   `Margem: ${dre.margem_liquida_percentual.toFixed(1)}%`,
      icon:  CheckCircle,
      cor:   dre.lucro_liquido >= 0 ? 'text-brand' : 'text-status-red',
    },
  ];

  return (
    <MainLayout>
      {/* ── HEADER ── */}
      <div className="mb-[2rem]">
        <h1 className="dark:text-ink-primary text-gray-900 text-[1.875rem] font-bold tracking-tight mb-[0.25rem]">
          Dashboard Financeiro
        </h1>
        <p className="dark:text-ink-secondary text-gray-500 text-sm">
          Saúde financeira da agência em tempo real
        </p>
      </div>

      {/* ── ALERTA DE MARGEM ── */}
      {validacao && !validacao.estaOk && (
        <div className="mb-[1.5rem] flex items-start gap-[0.75rem] dark:bg-status-orange/10 bg-orange-50 border dark:border-status-orange/20 border-orange-100 rounded-lg px-[1rem] py-[0.875rem]">
          <AlertCircle className="shrink-0 w-[1rem] h-[1rem] text-status-orange mt-[0.0625rem]" strokeWidth={2} />
          <div>
            <p className="text-sm font-semibold dark:text-status-orange text-orange-700">
              Margem abaixo do mínimo configurado
            </p>
            <p className="text-xs dark:text-ink-muted text-gray-500 mt-[0.125rem]">
              {validacao.alerta} — Revise os custos fixos ou renegocie planos.
            </p>
          </div>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1rem] mb-[2rem]">
        {kpis.map(({ label, valor, sub, icon: Icon, cor }) => (
          <div
            key={label}
            className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 px-[1.25rem] py-[1rem]"
          >
            <div className="flex items-start justify-between mb-[0.5rem]">
              <p className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold">
                {label}
              </p>
              <Icon className={`w-[1rem] h-[1rem] ${cor}`} strokeWidth={1.5} />
            </div>
            <p className={`text-[1.75rem] font-bold leading-none mb-[0.375rem] ${cor}`}>{valor}</p>
            <p className="dark:text-ink-muted text-gray-400 text-xs">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] mb-[2rem]">
        {/* ── DRE DISTRIBUIÇÃO ── */}
        <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem]">
          <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base mb-[1.25rem]">
            Distribuição da Receita
          </h3>
          {[
            { label: 'Custos Variáveis', valor: dre.custos_variaveis,             cor: 'bg-status-orange' },
            { label: 'Custos Fixos',     valor: dre.custos_fixos,                 cor: 'bg-status-blue'   },
            { label: 'Lucro Líquido',    valor: Math.max(dre.lucro_liquido, 0),   cor: 'bg-brand'         },
          ].map(({ label, valor, cor }) => (
            <div key={label} className="mb-[1rem]">
              <div className="flex justify-between items-center mb-[0.375rem]">
                <p className="dark:text-ink-secondary text-gray-600 text-sm">{label}</p>
                <p className="dark:text-ink-primary text-gray-900 text-sm font-semibold">
                  {pct(valor, dre.mrr)}% · {fmt(valor)}
                </p>
              </div>
              <div className="h-[0.375rem] dark:bg-surface-hover bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${cor} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(parseFloat(pct(valor, dre.mrr)), 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── PROJEÇÃO 3 MESES ── */}
        <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem]">
          <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base mb-[1.25rem]">
            Projeção — Próximos 3 Meses
          </h3>
          <div className="flex flex-col gap-[0.875rem]">
            {projecao.map((p, i) => (
              <div key={p.mes} className="flex items-center justify-between">
                <div className="flex items-center gap-[0.625rem]">
                  <div
                    className={`w-[0.375rem] h-[0.375rem] rounded-full ${
                      i === 0 ? 'bg-brand' : 'dark:bg-ink-muted bg-gray-300'
                    }`}
                  />
                  <p className="dark:text-ink-secondary text-gray-600 text-sm capitalize">
                    {p.mes_label}
                  </p>
                  {i === 0 && (
                    <span className="text-xs font-semibold bg-brand/15 text-brand px-[0.375rem] py-[0.0625rem] rounded">
                      Atual
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="dark:text-ink-primary text-gray-900 text-sm font-semibold">
                    {fmt(p.receita_projetada)}
                  </p>
                  <p className={`text-xs font-medium ${p.lucro_projetado >= 0 ? 'text-brand' : 'text-status-red'}`}>
                    {fmt(p.lucro_projetado)} líq.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONFIGURAÇÕES DE CUSTO ── */}
      <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem] mb-[2rem]">
        <div className="flex items-center justify-between mb-[1rem]">
          <div className="flex items-center gap-[0.5rem]">
            <Settings className="w-[1rem] h-[1rem] dark:text-ink-muted text-gray-400" strokeWidth={1.5} />
            <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base">
              Configurações de Custo
            </h3>
          </div>
          <button
            onClick={() => setEditando(!editando)}
            className="text-xs font-semibold dark:text-ink-secondary text-gray-500 dark:hover:text-ink-primary hover:text-gray-800 flex items-center gap-[0.25rem] transition-colors"
          >
            {editando
              ? <><ChevronUp className="w-[0.875rem] h-[0.875rem]" /> Fechar</>
              : <><ChevronDown className="w-[0.875rem] h-[0.875rem]" /> Editar</>
            }
          </button>
        </div>

        <div className="grid grid-cols-2 gap-[1.5rem]">
          {config && ([
            { label: 'Custos Fixos Mensais',    valor: fmt(config.custos_fixos_mensais),         key: 'custos_fixos_mensais'        as const },
            { label: 'Custos Variáveis (%MRR)', valor: `${config.custos_variaveis_percentual}%`, key: 'custos_variaveis_percentual' as const },
          ] as const).map(({ label, valor, key }) => (
            <div key={key}>
              <p className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold mb-[0.375rem]">
                {label}
              </p>
              {editando ? (
                <input
                  type="number"
                  value={formConfig[key]}
                  onChange={(e) => setFormConfig({ ...formConfig, [key]: e.target.value })}
                  className="w-full h-[2.25rem] px-[0.75rem] rounded dark:bg-surface-hover dark:border dark:border-surface-border dark:text-ink-primary bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
                />
              ) : (
                <p className="dark:text-ink-primary text-gray-900 font-semibold text-lg">{valor}</p>
              )}
            </div>
          ))}
        </div>

        {editando && (
          <div className="flex justify-end mt-[1rem]">
            <button
              onClick={salvarConfig}
              disabled={salvando}
              className="flex items-center gap-[0.5rem] dark:bg-brand dark:text-white bg-green-600 text-white text-sm font-semibold h-[2.25rem] px-[1rem] rounded transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {salvando
                ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Save className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
              }
              Salvar
            </button>
          </div>
        )}
      </div>

      {/* ── CLIENTES EM ATRASO ── */}
      {atrasados.length > 0 && (
        <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem]">
          <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base mb-[1.25rem]">
            Clientes com Atraso ({atrasados.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-surface-border border-gray-100">
                  {['Cliente', 'Atraso', 'Valor Devido', 'Ação'].map((h) => (
                    <th
                      key={h}
                      className="text-left pb-[0.75rem] dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {atrasados.map((item) => (
                  <tr
                    key={item.cliente.id}
                    className="border-b dark:border-surface-border border-gray-50 dark:hover:bg-surface-hover hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-[0.875rem]">
                      <p className="dark:text-ink-primary text-gray-900 font-medium text-sm">
                        {item.cliente.nome}
                      </p>
                      <p className="dark:text-ink-muted text-gray-400 text-xs">{item.cliente.email}</p>
                    </td>
                    <td className="py-[0.875rem]">
                      <span
                        className={`inline-flex items-center text-xs font-bold px-[0.5rem] py-[0.125rem] rounded ${
                          item.dias_atraso >= 30
                            ? 'bg-status-red/15 text-status-red'
                            : item.dias_atraso >= 15
                            ? 'bg-status-orange/15 text-status-orange'
                            : 'bg-status-yellow/15 text-status-yellow'
                        }`}
                      >
                        {item.dias_atraso}d
                      </span>
                    </td>
                    <td className="py-[0.875rem] dark:text-ink-primary text-gray-900 font-semibold text-sm">
                      {fmt(item.valor_devido)}
                    </td>
                    <td className="py-[0.875rem]">
                      <a
                        href={`https://wa.me/55${item.cliente.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-[0.375rem] dark:bg-brand/10 dark:hover:bg-brand/20 dark:text-brand bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold px-[0.625rem] h-[1.75rem] rounded transition-colors"
                      >
                        <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.5} />
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
