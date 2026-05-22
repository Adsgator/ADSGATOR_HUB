'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, MessageCircle, ExternalLink,
  Clock, CheckCircle, ChevronRight,
} from 'lucide-react';
import type { Cliente, Estagio, HistoricoAcao, Assinatura } from '@/lib/types';
import {
  obterCliente, obterEstagioAtivo, obterHistoricoCliente,
  obterAssinaturaCliente, avancarEstagio,
} from '@/lib/database';
import { FLUXO_OPERACIONAL, ORDEM_ESTAGIOS, gerarLinkWhatsApp, WHATSAPP_TEMPLATES } from '@/lib/fluxo-operacional';
import { OnboardChecklist } from '@/components/clientes/OnboardChecklist';
import { MainLayout } from '@/components/layout/MainLayout';

export default function ClienteDetalhe() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [cliente,    setCliente]    = useState<Cliente | null>(null);
  const [estagio,    setEstagio]    = useState<Estagio | null>(null);
  const [historico,  setHistorico]  = useState<HistoricoAcao[]>([]);
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [avancando,  setAvancando]  = useState(false);

  useEffect(() => {
    Promise.all([
      obterCliente(id),
      obterEstagioAtivo(id),
      obterHistoricoCliente(id),
      obterAssinaturaCliente(id),
    ]).then(([c, e, h, a]) => {
      setCliente(c);
      setEstagio(e);
      setHistorico(h);
      setAssinatura(a);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  async function handleAvancar() {
    if (!cliente) return;
    const etapa = FLUXO_OPERACIONAL[cliente.status];
    if (!etapa?.proximo_estagio) return;
    const proximo = FLUXO_OPERACIONAL[etapa.proximo_estagio];
    if (!proximo) return;

    setAvancando(true);
    try {
      await avancarEstagio(id, etapa.proximo_estagio, proximo.instrucao);
      const [c, e, h] = await Promise.all([
        obterCliente(id), obterEstagioAtivo(id), obterHistoricoCliente(id),
      ]);
      setCliente(c); setEstagio(e); setHistorico(h);
    } catch (err) {
      console.error(err);
    } finally {
      setAvancando(false);
    }
  }

  if (loading || !cliente) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[20rem]">
          <div className="w-[1.5rem] h-[1.5rem] border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const etapaAtual  = FLUXO_OPERACIONAL[cliente.status];
  const indiceAtual = ORDEM_ESTAGIOS.indexOf(cliente.status as typeof ORDEM_ESTAGIOS[number]);
  const templates   = etapaAtual?.whatsapp_templates ?? [];

  function formatarData(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <MainLayout>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-[0.375rem] dark:text-ink-muted text-gray-400 hover:dark:text-ink-secondary hover:text-gray-600 text-sm mb-[1.5rem] transition-colors"
      >
        <ArrowLeft className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
        Voltar
      </button>

      {/* Header do cliente */}
      <div className="flex items-start justify-between mb-[2rem]">
        <div>
          <h1 className="dark:text-ink-primary text-gray-900 text-[1.75rem] font-bold mb-[0.25rem]">
            {cliente.nome}
          </h1>
          <p className="dark:text-ink-secondary text-gray-500 text-sm">{cliente.email}</p>
          {cliente.dominio && (
            <a
              href={`https://${cliente.dominio}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[0.25rem] text-xs dark:text-brand text-green-600 mt-[0.25rem] hover:underline"
            >
              {cliente.dominio}
              <ExternalLink className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.5} />
            </a>
          )}
        </div>

        {/* Barra de progresso do fluxo */}
        <div className="hidden md:flex items-center gap-[0.25rem]">
          {ORDEM_ESTAGIOS.map((s, idx) => {
            const etapa   = FLUXO_OPERACIONAL[s];
            const passado = idx < indiceAtual;
            const atual   = idx === indiceAtual;
            return (
              <React.Fragment key={s}>
                <div className={`
                  flex items-center gap-[0.25rem] text-xs font-medium px-[0.625rem] h-[1.75rem] rounded-[0.25rem]
                  ${passado ? 'dark:bg-brand/15 dark:text-brand bg-green-50 text-green-700' : ''}
                  ${atual   ? 'dark:bg-brand dark:text-white bg-green-600 text-white' : ''}
                  ${!passado && !atual ? 'dark:bg-surface-hover dark:text-ink-muted bg-gray-100 text-gray-400' : ''}
                `}>
                  {passado && <CheckCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />}
                  {etapa?.label}
                </div>
                {idx < ORDEM_ESTAGIOS.length - 1 && (
                  <ChevronRight className="w-[0.75rem] h-[0.75rem] dark:text-ink-muted text-gray-300 shrink-0" strokeWidth={1.5} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1.5rem]">
        {/* Coluna principal */}
        <div className="lg:col-span-2 flex flex-col gap-[1.5rem]">

          {/* Card de instrução */}
          {etapaAtual && (
            <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem]">
              <h2 className="dark:text-ink-primary text-gray-900 font-semibold text-base mb-[0.75rem]">
                ▶ {etapaAtual.instrucao}
              </h2>

              {templates.length > 0 && (
                <div className="flex flex-wrap gap-[0.625rem] mb-[1rem]">
                  {templates.map((tag) => (
                    <a
                      key={tag}
                      href={gerarLinkWhatsApp(tag, cliente.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex items-center gap-[0.5rem]
                        dark:bg-brand/12 dark:hover:bg-brand/20 dark:text-brand dark:border dark:border-brand/20
                        bg-green-50 hover:bg-green-100 text-green-700 border border-green-200
                        text-sm font-semibold px-[0.875rem] h-[2.25rem] rounded transition-colors
                      "
                    >
                      <MessageCircle className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
                      {WHATSAPP_TEMPLATES[tag]?.titulo ?? tag}
                      <span className="text-2xs font-normal opacity-60">{tag}</span>
                    </a>
                  ))}
                </div>
              )}

              {etapaAtual.proximo_estagio && (
                <button
                  onClick={handleAvancar}
                  disabled={avancando}
                  className="
                    flex items-center gap-[0.5rem]
                    dark:bg-brand dark:hover:bg-brand-dark dark:text-white
                    bg-green-600 hover:bg-green-700 text-white
                    text-sm font-semibold px-[1rem] h-[2.25rem] rounded transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {avancando ? (
                    <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-[1rem] h-[1rem]" strokeWidth={2} />
                  )}
                  {etapaAtual.proxima_acao_label}
                </button>
              )}
            </div>
          )}

          {/* Checklist */}
          {['onboarding', 'setup_trafego'].includes(cliente.status) && (
            <OnboardChecklist clienteId={cliente.id} estagio={cliente.status} />
          )}

          {/* Histórico de ações */}
          <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem]">
            <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base mb-[1rem]">
              Histórico de Ações
            </h3>
            {historico.length === 0 ? (
              <p className="dark:text-ink-muted text-gray-400 text-sm">Nenhuma ação registrada ainda.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-[0.5rem] top-0 bottom-0 w-[0.0625rem] dark:bg-surface-border bg-gray-100" />
                <div className="flex flex-col gap-[1rem] pl-[1.75rem]">
                  {historico.map((acao) => (
                    <div key={acao.id} className="relative">
                      <div className="absolute left-[-1.25rem] top-[0.3125rem] w-[0.5rem] h-[0.5rem] rounded-full dark:bg-surface-border bg-gray-200 border-2 dark:border-surface-bg border-white" />
                      <p className="dark:text-ink-secondary text-gray-700 text-sm leading-snug">
                        {acao.descricao}
                      </p>
                      <p className="dark:text-ink-muted text-gray-400 text-xs mt-[0.125rem]">
                        {formatarData(acao.data_acao)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coluna lateral */}
        <div className="flex flex-col gap-[1rem]">
          <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.25rem]">
            <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-sm mb-[1rem]">
              Informações
            </h3>
            <div className="flex flex-col gap-[0.875rem]">
              {[
                { label: 'Nicho',         valor: cliente.nicho },
                { label: 'WhatsApp',      valor: cliente.whatsapp },
                { label: 'Domínio',       valor: cliente.dominio ?? '—' },
                { label: 'Google Ads ID', valor: cliente.google_ads_customer_id ?? 'Não configurado' },
                { label: 'GA4 ID',        valor: cliente.ga4_property_id ?? 'Não configurado' },
              ].map(({ label, valor }) => (
                <div key={label}>
                  <p className="dark:text-ink-muted text-gray-400 text-2xs uppercase tracking-wide font-semibold mb-[0.125rem]">
                    {label}
                  </p>
                  <p className="dark:text-ink-secondary text-gray-700 text-sm break-all">
                    {valor}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {assinatura && (
            <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.25rem]">
              <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-sm mb-[1rem]">
                Assinatura
              </h3>
              <div className="flex flex-col gap-[0.75rem]">
                <div>
                  <p className="dark:text-ink-muted text-gray-400 text-2xs uppercase tracking-wide font-semibold mb-[0.125rem]">Plano</p>
                  <p className="dark:text-ink-secondary text-gray-700 text-sm">{assinatura.plano_nome}</p>
                </div>
                <div>
                  <p className="dark:text-ink-muted text-gray-400 text-2xs uppercase tracking-wide font-semibold mb-[0.125rem]">Valor Mensal</p>
                  <p className="dark:text-ink-primary text-gray-900 text-lg font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(assinatura.valor_mensal)}
                  </p>
                </div>
                {assinatura.dias_atraso > 0 && (
                  <div className="flex items-center gap-[0.375rem] dark:bg-status-red/10 bg-red-50 dark:text-status-red text-red-700 text-xs font-semibold px-[0.625rem] py-[0.375rem] rounded">
                    <Clock className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                    {assinatura.dias_atraso} dias de atraso
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
