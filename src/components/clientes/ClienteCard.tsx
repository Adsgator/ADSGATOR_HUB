'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageCircle, PauseCircle, ChevronRight,
  Bell, ClipboardList, Settings2, TrendingUp, XCircle,
} from 'lucide-react';
import type { Cliente, Estagio } from '@/lib/types';
import { FLUXO_OPERACIONAL, gerarLinkWhatsApp, WHATSAPP_TEMPLATES } from '@/lib/fluxo-operacional';

interface ClienteCardProps {
  cliente:    Cliente;
  estagio:    Estagio | null;
  onCongelar: (clienteId: string) => void;
}

const ICONES_ESTAGIO = {
  recebido:      Bell,
  onboarding:    ClipboardList,
  setup_trafego: Settings2,
  ativo:         TrendingUp,
  congelado:     PauseCircle,
  cancelado:     XCircle,
} as const;

const BADGE_CORES: Record<string, string> = {
  recebido:              'bg-status-blue/15 text-status-blue',
  onboarding:            'bg-status-purple/15 text-status-purple',
  setup_trafego:         'bg-status-yellow/15 text-status-yellow',
  ativo:                 'bg-brand/15 text-brand',
  congelado:             'bg-status-orange/15 text-status-orange',
  cancelado:             'bg-status-red/15 text-status-red',
  alerta_financeiro_7d:  'bg-status-orange/15 text-status-orange',
};

export function ClienteCard({ cliente, estagio, onCongelar }: ClienteCardProps) {
  const fluxoEtapa  = FLUXO_OPERACIONAL[cliente.status] ?? FLUXO_OPERACIONAL['ativo'];
  const IconeStatus = ICONES_ESTAGIO[cliente.status as keyof typeof ICONES_ESTAGIO] ?? TrendingUp;
  const badgeCor    = BADGE_CORES[cliente.status] ?? 'bg-surface-hover text-ink-secondary';

  const templatesDisponiveis = fluxoEtapa.whatsapp_templates ?? [];

  return (
    <div className="
      dark:bg-surface-card bg-white rounded-lg
      dark:border dark:border-surface-border border border-gray-100
      hover:dark:border-surface-border/70 hover:dark:bg-surface-hover
      hover:border-gray-200 hover:shadow-sm
      transition-all duration-150 flex flex-col
      animate-fade-in
    ">
      {/* Header */}
      <div className="flex items-start justify-between p-[1.25rem] pb-[0.875rem]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[0.5rem] mb-[0.25rem]">
            <span className={`inline-flex items-center gap-[0.25rem] text-2xs font-semibold px-[0.375rem] py-[0.0625rem] rounded-[0.1875rem] ${badgeCor}`}>
              <IconeStatus className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
              {fluxoEtapa.label}
            </span>
          </div>
          <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base truncate">
            {cliente.nome}
          </h3>
          <p className="dark:text-ink-muted text-gray-400 text-xs truncate">
            {cliente.nicho}
          </p>
        </div>
        <Link
          href={`/clientes/${cliente.id}`}
          className="shrink-0 w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded dark:hover:bg-surface-hover hover:bg-gray-100 dark:text-ink-muted text-gray-400 transition-colors"
        >
          <ChevronRight className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
        </Link>
      </div>

      {/* Instrução / Próxima Ação */}
      <div className="mx-[1.25rem] mb-[0.875rem] px-[0.75rem] py-[0.625rem] rounded dark:bg-brand/5 bg-green-50 border-l-2 border-brand">
        <p className="text-2xs dark:text-ink-muted text-gray-500 font-semibold uppercase tracking-wide mb-[0.25rem]">
          Próxima ação
        </p>
        <p className="text-xs dark:text-ink-secondary text-gray-700 leading-snug">
          {estagio?.acao_proxima ?? fluxoEtapa.instrucao}
        </p>
      </div>

      {/* Botões WhatsApp */}
      {templatesDisponiveis.length > 0 && (
        <div className="px-[1.25rem] pb-[0.875rem] flex flex-wrap gap-[0.5rem]">
          {templatesDisponiveis.map((tag) => (
            <a
              key={tag}
              href={gerarLinkWhatsApp(tag, cliente.whatsapp ?? '')}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-[0.375rem]
                dark:bg-brand/10 dark:hover:bg-brand/20 dark:text-brand
                bg-green-50 hover:bg-green-100 text-green-700
                text-xs font-semibold px-[0.625rem] py-[0.375rem] rounded
                transition-colors
              "
            >
              <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.5} />
              {WHATSAPP_TEMPLATES[tag]?.titulo ?? tag}
            </a>
          ))}
        </div>
      )}

      {/* Rodapé: ações secundárias */}
      <div className="px-[1.25rem] pb-[1rem] pt-[0.25rem] flex items-center gap-[0.5rem] border-t dark:border-surface-border border-gray-50 mt-auto">
        <a
          href={`https://wa.me/55${(cliente.whatsapp ?? '').replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex-1 flex items-center justify-center gap-[0.375rem]
            dark:bg-surface-hover dark:hover:bg-surface-border dark:text-ink-secondary
            bg-gray-50 hover:bg-gray-100 text-gray-600
            text-xs font-medium h-[2rem] rounded transition-colors
          "
        >
          <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.5} />
          WhatsApp
        </a>

        {cliente.status !== 'congelado' && cliente.status !== 'cancelado' && (
          <button
            onClick={() => onCongelar(cliente.id)}
            className="
              flex items-center justify-center gap-[0.375rem]
              dark:bg-status-orange/10 dark:hover:bg-status-orange/20 dark:text-status-orange
              bg-orange-50 hover:bg-orange-100 text-orange-600
              text-xs font-medium h-[2rem] px-[0.75rem] rounded transition-colors
            "
            title="Mover para Retidos"
          >
            <PauseCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.5} />
            Reter
          </button>
        )}
      </div>
    </div>
  );
}
