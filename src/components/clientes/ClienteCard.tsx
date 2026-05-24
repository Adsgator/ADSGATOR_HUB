'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageCircle, PauseCircle, ChevronRight,
  Bell, ClipboardList, Settings2, TrendingUp, XCircle,
  Globe, BarChart2, Pencil, Trash2, Copy, Archive,
} from 'lucide-react';
import type { Cliente, Estagio } from '@/lib/types';
import { FLUXO_OPERACIONAL, gerarLinkWhatsApp } from '@/lib/fluxo-operacional';
import { Tooltip } from '@/components/ui/Tooltip';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { cn } from '@/lib/utils';

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

const STATUS_BORDER: Record<string, string> = {
  ativo:            'border-l-ads-400',
  recebido:         'border-l-status-blue',
  onboarding:       'border-l-status-purple',
  setup_trafego:    'border-l-ads-500',
  congelado:        'border-l-status-orange',
  cancelado:        'border-l-ink-muted',
  cancelado_debito: 'border-l-status-red',
  inativo:          'border-l-surface-border',
}

const BADGE_CORES: Record<string, string> = {
  recebido:              'bg-status-blue/10 text-status-blue',
  onboarding:            'bg-status-purple/10 text-status-purple',
  setup_trafego:         'bg-ads-500/10 text-ads-400',
  ativo:                 'bg-status-green/10 text-status-green',
  congelado:             'bg-status-orange/10 text-status-orange',
  cancelado:             'bg-status-red/10 text-status-red',
  cancelado_debito:      'bg-status-red/10 text-status-red',
  alerta_financeiro_7d:  'bg-status-orange/10 text-status-orange',
};

export function ClienteCard({ cliente, estagio, onCongelar }: ClienteCardProps) {
  const fluxoEtapa  = FLUXO_OPERACIONAL[cliente.status] ?? FLUXO_OPERACIONAL['ativo'];
  const IconeStatus = ICONES_ESTAGIO[cliente.status as keyof typeof ICONES_ESTAGIO] ?? TrendingUp;
  const badgeCor    = BADGE_CORES[cliente.status] ?? 'bg-surface-hover text-ink-secondary';
  const borderCor   = STATUS_BORDER[cliente.status] ?? 'border-l-surface-border';
  const temAtraso   = (cliente.dias_atraso ?? 0) > 0;

  const contextItems = [
    {
      label: 'Editar',
      icon: <Pencil className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,
      onClick: () => window.location.href = `/clientes/${cliente.id}`,
    },
    {
      label: 'Duplicar',
      icon: <Copy className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,
      onClick: () => {},
    },
    {
      label: 'Arquivar',
      icon: <Archive className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,
      onClick: () => onCongelar(cliente.id),
      separator: true,
    },
    {
      label: 'Deletar',
      icon: <Trash2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,
      onClick: () => {},
      variant: 'danger' as const,
    },
  ];

  return (
    <ContextMenu items={contextItems}>
      <div className={cn(
        'card-interactive group relative flex flex-col',
        'bg-surface-card border border-surface-border rounded-xl overflow-hidden',
        'border-l-[3px]',
        borderCor,
        'hover:border-surface-elevated hover:shadow-lg hover:shadow-black/20',
        'animate-fade-in',
      )}>
        {/* Alerta atraso */}
        {temAtraso && (
          <div className="absolute top-0 right-0 px-[0.5rem] py-[0.1875rem] bg-status-red/10 border-b border-l border-status-red/20 rounded-bl-lg">
            <span className="text-status-red text-[0.625rem] font-bold">D+{cliente.dias_atraso}</span>
          </div>
        )}

        {/* ── HEADER ──────────────────────────────────── */}
        <div className="flex items-start justify-between p-[1.125rem] pb-[0.75rem]">
          <div className="flex-1 min-w-0 pr-[0.5rem]">
            <div className="flex items-center gap-[0.375rem] mb-[0.25rem]">
              <span className={cn(
                'inline-flex items-center gap-[0.25rem]',
                'text-[0.625rem] font-semibold px-[0.375rem] py-[0.125rem] rounded-full',
                badgeCor,
              )}>
                <IconeStatus className="w-[0.5625rem] h-[0.5625rem]" strokeWidth={2.5} />
                {fluxoEtapa.label}
              </span>
            </div>
            <h3 className="text-ink-primary font-semibold text-[0.9375rem] truncate">
              {cliente.nome}
            </h3>
            <p className="text-ink-muted text-[0.75rem] truncate">{cliente.nicho}</p>
          </div>
          <Link
            href={`/clientes/${cliente.id}`}
            className="shrink-0 w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded-[0.375rem] hover:bg-surface-hover text-ink-muted hover:text-ink-primary transition-colors"
          >
            <ChevronRight className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={1.75} />
          </Link>
        </div>

        {/* ── PRÓXIMA AÇÃO ────────────────────────────── */}
        <div className="mx-[1.125rem] mb-[0.75rem] px-[0.625rem] py-[0.5rem] rounded-[0.375rem] bg-surface-hover border-l-[2px] border-ads-500/40">
          <p className="text-[0.625rem] text-ink-muted font-semibold uppercase tracking-wide mb-[0.125rem]">
            Próxima ação
          </p>
          <p className="text-[0.75rem] text-ink-secondary leading-snug">
            {estagio?.acao_label ?? fluxoEtapa.instrucao}
          </p>
        </div>

        {/* MRR */}
        {cliente.mrr && (
          <div className="px-[1.125rem] mb-[0.625rem]">
            <span className="text-[0.6875rem] text-ink-muted">MRR: </span>
            <span className="text-[0.8125rem] font-semibold text-ink-primary">
              R$ {cliente.mrr.toLocaleString('pt-BR')}
            </span>
          </div>
        )}

        {/* ── AÇÕES ICON-ONLY ─────────────────────────── */}
        <div className="px-[1.125rem] pb-[1rem] mt-auto flex items-center gap-[0.375rem] border-t border-surface-border pt-[0.75rem]">
          {cliente.whatsapp && (
            <Tooltip content="WhatsApp" side="top">
              <a
                href={gerarLinkWhatsApp('#CONTATO', cliente.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] bg-status-green/10 text-status-green hover:bg-status-green/20 transition-colors"
              >
                <MessageCircle className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={1.75} />
              </a>
            </Tooltip>
          )}

          {cliente.dominio && (
            <Tooltip content="Abrir site" side="top">
              <a
                href={`https://${cliente.dominio}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] bg-surface-hover text-ink-muted hover:text-ink-primary hover:bg-surface-elevated transition-colors"
              >
                <Globe className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={1.75} />
              </a>
            </Tooltip>
          )}

          <Tooltip content="Analytics" side="top">
            <Link
              href={`/analytics?cliente=${cliente.id}`}
              className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] bg-surface-hover text-ink-muted hover:text-ink-primary hover:bg-surface-elevated transition-colors"
            >
              <BarChart2 className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={1.75} />
            </Link>
          </Tooltip>

          <div className="flex-1" />

          {cliente.status !== 'congelado' && cliente.status !== 'cancelado' && (
            <Tooltip content="Congelar cliente" side="top">
              <button
                onClick={() => onCongelar(cliente.id)}
                className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] bg-status-orange/10 text-status-orange hover:bg-status-orange/20 transition-colors"
              >
                <PauseCircle className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={1.75} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </ContextMenu>
  );
}
