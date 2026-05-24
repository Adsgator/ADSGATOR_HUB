'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TrendingUp, BarChart3, Download, RefreshCw, Calendar, ArrowUpRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

interface RelatorioMensal {
  id:                    string;
  cliente_id:            string;
  mes_ano:               string;
  status_geracao:        'pendente' | 'processando' | 'gerado' | 'erro';
  investimento_ads?:     number;
  conversoes?:           number;
  roi?:                  number;
  sessoes_ga4?:          number;
  usuarios_novos?:       number;
  taxa_engajamento?:     number;
  conteudo_markdown?:    string;
  analise_ia?: {
    resumo_executivo: string;
    pontos_positivos: string[];
    pontos_atencao:   string[];
    recomendacoes:    string[];
    proximo_passo:    string;
  };
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtConversoes = (n: number): string =>
  n % 1 !== 0 ? `${n.toFixed(1)}*` : String(n);

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const [clientes,    setClientes]    = useState<{ id: string; nome: string }[]>([]);
  const [clienteSel,  setClienteSel]  = useState<string>('');
  const [relatorios,  setRelatorios]  = useState<RelatorioMensal[]>([]);
  const [selecionado, setSelecionado] = useState<RelatorioMensal | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [gerando,     setGerando]     = useState(false);

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome')
      .eq('status', 'ativo')
      .order('nome')
      .then(({ data }) => {
        const lista = data ?? [];
        setClientes(lista);
        if (lista.length > 0) setClienteSel(lista[0].id);
      });
  }, []);

  const carregar = useCallback(async () => {
    if (!clienteSel) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/analytics/${clienteSel}`);
      const json = await res.json() as { relatorios: RelatorioMensal[] };
      const lista = json.relatorios ?? [];
      setRelatorios(lista);
      setSelecionado(lista[0] ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clienteSel]);

  useEffect(() => { carregar(); }, [carregar]);

  async function solicitarRelatorio() {
    if (!clienteSel) return;
    setGerando(true);
    try {
      const hoje   = new Date();
      const mesRef = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const mesAno = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, '0')}`;
      await fetch(`/api/analytics/${clienteSel}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mesAno }),
      });
      await carregar();
    } finally {
      setGerando(false);
    }
  }

  function baixarMarkdown() {
    if (!selecionado?.conteudo_markdown) return;
    const blob = new Blob([selecionado.conteudo_markdown], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `relatorio_${selecionado.mes_ano}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const kpis = selecionado ? [
    { label: 'Investimento',  valor: fmt(selecionado.investimento_ads ?? 0),             sub: 'Google Ads',     icon: TrendingUp,  cor: 'text-status-blue'   },
    { label: 'Conversões',    valor: fmtConversoes(selecionado.conversoes ?? 0),           sub: 'Leads/vendas',   icon: ArrowUpRight, cor: 'text-ads-500'      },
    { label: 'ROI',           valor: `${(selecionado.roi ?? 0).toFixed(2)}x`,             sub: 'Retorno',        icon: BarChart3,   cor: 'text-status-purple' },
    { label: 'Sessões (GA4)', valor: (selecionado.sessoes_ga4 ?? 0).toLocaleString(),     sub: 'Visitas ao site', icon: Calendar,   cor: 'text-status-orange' },
  ] : [];

  return (
    <MainLayout
      title="Relatórios"
      subtitle="Google Ads + GA4 — histórico por cliente"
      actions={
        <div className="flex items-center gap-[0.625rem]">
          <select
            value={clienteSel}
            onChange={(e) => setClienteSel(e.target.value)}
            className="h-[2rem] pl-[0.625rem] pr-[1.75rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <button
            onClick={solicitarRelatorio}
            disabled={gerando || !clienteSel}
            className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors disabled:opacity-50"
          >
            {gerando
              ? <div className="w-[0.75rem] h-[0.75rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <RefreshCw className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            }
            Solicitar
          </button>
        </div>
      }
    >

      {/* SELETOR DE MÊS */}
      {relatorios.length > 0 && (
        <div className="flex gap-[0.5rem] flex-wrap mb-[1.5rem]">
          {relatorios.map((r) => {
            const [ano, mes] = r.mes_ano.split('-')
            const label = new Date(Number(ano), Number(mes) - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
            return (
              <button
                key={r.mes_ano}
                onClick={() => setSelecionado(r)}
                className={`px-[0.875rem] h-[2rem] rounded-[0.375rem] text-[0.8125rem] font-medium transition-colors ${
                  selecionado?.mes_ano === r.mes_ano
                    ? 'bg-ads-500 text-white'
                    : 'bg-surface-card border border-surface-border text-ink-secondary hover:border-ads-500/40'
                }`}
              >
                {label}
                {r.status_geracao === 'pendente' && (
                  <span className="ml-[0.375rem] font-bold text-status-orange">●</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center h-[16rem]">
          <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* EMPTY */}
      {!loading && relatorios.length === 0 && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-[3rem] text-center">
          <BarChart3 className="w-[2.5rem] h-[2.5rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
          <p className="text-ink-secondary text-[0.875rem]">
            Nenhum relatório encontrado. Clique em &quot;Solicitar&quot; para gerar o primeiro.
          </p>
        </div>
      )}

      {!loading && selecionado && (
        <>
          {/* STATUS PENDENTE */}
          {selecionado.status_geracao === 'pendente' && (
            <div className="mb-[1.5rem] flex items-start gap-[0.75rem] bg-status-orange/10 border border-status-orange/20 rounded-xl px-[1rem] py-[0.875rem]">
              <RefreshCw className="shrink-0 w-[0.875rem] h-[0.875rem] text-status-orange mt-[0.125rem]" strokeWidth={2} />
              <p className="text-[0.875rem] text-status-orange">
                Relatório em processamento. Recarregue em alguns instantes.
              </p>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[1rem] mb-[1.5rem]">
            {kpis.map(({ label, valor, sub, icon: Icon, cor }) => (
              <div key={label} className="bg-surface-card border border-surface-border rounded-xl px-[1.25rem] py-[1rem]">
                <div className="flex items-start justify-between mb-[0.5rem]">
                  <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">{label}</p>
                  <Icon className={`w-[1rem] h-[1rem] ${cor}`} strokeWidth={1.5} />
                </div>
                <p className={`text-[1.75rem] font-bold leading-none mb-[0.375rem] ${cor}`}>{valor}</p>
                <p className="text-ink-muted text-[0.75rem]">{sub}</p>
              </div>
            ))}
          </div>

          {/* DETALHE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] mb-[1.5rem]">
            <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
              <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
                <TrendingUp className="w-[1rem] h-[1rem] text-status-blue" strokeWidth={1.5} />
                <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Google Ads</h3>
              </div>
              {[
                { label: 'Investimento', valor: fmt(selecionado.investimento_ads ?? 0) },
                { label: 'Conversões',   valor: fmtConversoes(selecionado.conversoes ?? 0) },
                { label: 'ROI',          valor: `${(selecionado.roi ?? 0).toFixed(2)}x` },
              ].map(({ label, valor }) => (
                <div key={label} className="flex justify-between items-center py-[0.75rem] border-b border-surface-border last:border-0">
                  <p className="text-ink-secondary text-[0.875rem]">{label}</p>
                  <p className="text-ink-primary font-semibold text-[0.875rem]">{valor}</p>
                </div>
              ))}
              {(selecionado.conversoes ?? 0) % 1 !== 0 && (
                <p className="text-ink-muted text-[0.6875rem] mt-[0.5rem]">
                  * Conversões data-driven (atribuição fracionada pelo Google)
                </p>
              )}
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
              <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
                <BarChart3 className="w-[1rem] h-[1rem] text-status-orange" strokeWidth={1.5} />
                <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Google Analytics 4</h3>
              </div>
              {[
                { label: 'Sessões',          valor: (selecionado.sessoes_ga4 ?? 0).toLocaleString()      },
                { label: 'Novos Usuários',   valor: (selecionado.usuarios_novos ?? 0).toLocaleString()   },
                { label: 'Taxa Engajamento', valor: `${(selecionado.taxa_engajamento ?? 0).toFixed(1)}%` },
              ].map(({ label, valor }) => (
                <div key={label} className="flex justify-between items-center py-[0.75rem] border-b border-surface-border last:border-0">
                  <p className="text-ink-secondary text-[0.875rem]">{label}</p>
                  <p className="text-ink-primary font-semibold text-[0.875rem]">{valor}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ANÁLISE IA */}
          {selecionado.analise_ia && (
            <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] mb-[1.5rem]">
              <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
                <Sparkles className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.5} />
                <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Análise IA — Gemini</h3>
              </div>
              <p className="text-ink-secondary text-[0.875rem] mb-[1.25rem] leading-relaxed">
                {selecionado.analise_ia.resumo_executivo}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem] mb-[1.25rem]">
                {selecionado.analise_ia.pontos_positivos.length > 0 && (
                  <div>
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-status-green mb-[0.5rem]">Pontos Positivos</p>
                    <ul className="flex flex-col gap-[0.375rem]">
                      {selecionado.analise_ia.pontos_positivos.map((p, i) => (
                        <li key={i} className="flex items-start gap-[0.5rem]">
                          <CheckCircle2 className="w-[0.875rem] h-[0.875rem] text-status-green shrink-0 mt-[0.125rem]" strokeWidth={2} />
                          <span className="text-ink-secondary text-[0.875rem]">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selecionado.analise_ia.pontos_atencao.length > 0 && (
                  <div>
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-status-orange mb-[0.5rem]">Pontos de Atenção</p>
                    <ul className="flex flex-col gap-[0.375rem]">
                      {selecionado.analise_ia.pontos_atencao.map((p, i) => (
                        <li key={i} className="flex items-start gap-[0.5rem]">
                          <AlertCircle className="w-[0.875rem] h-[0.875rem] text-status-orange shrink-0 mt-[0.125rem]" strokeWidth={2} />
                          <span className="text-ink-secondary text-[0.875rem]">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {selecionado.analise_ia.recomendacoes.length > 0 && (
                <div className="mb-[1rem]">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted mb-[0.5rem]">Recomendações</p>
                  <ol className="flex flex-col gap-[0.375rem]">
                    {selecionado.analise_ia.recomendacoes.map((r, i) => (
                      <li key={i} className="flex items-start gap-[0.625rem]">
                        <span className="w-[1.25rem] h-[1.25rem] rounded-full bg-ads-500 flex items-center justify-center text-white text-[0.6875rem] font-bold shrink-0">{i + 1}</span>
                        <span className="text-ink-secondary text-[0.875rem]">{r}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {selecionado.analise_ia.proximo_passo && (
                <div className="bg-ads-500/10 border border-ads-500/20 rounded-[0.375rem] px-[0.875rem] py-[0.75rem]">
                  <p className="text-[0.6875rem] font-semibold text-ads-500 uppercase tracking-wide mb-[0.25rem]">Próximo Passo</p>
                  <p className="text-ink-primary text-[0.875rem]">{selecionado.analise_ia.proximo_passo}</p>
                </div>
              )}
            </div>
          )}

          {/* DOWNLOAD */}
          {selecionado.conteudo_markdown && (
            <div className="bg-surface-card border border-surface-border rounded-xl px-[1.5rem] py-[1.25rem] flex items-center justify-between">
              <div>
                <p className="text-ink-primary font-semibold text-[0.875rem]">Relatório completo em Markdown</p>
                <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">Pronto para compartilhar com o cliente</p>
              </div>
              <button
                onClick={baixarMarkdown}
                className="flex items-center gap-[0.5rem] bg-surface-hover border border-surface-border text-ink-primary text-[0.8125rem] font-semibold h-[2rem] px-[0.875rem] rounded-[0.375rem] hover:border-ads-500/40 transition-colors"
              >
                <Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                Baixar .md
              </button>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}
