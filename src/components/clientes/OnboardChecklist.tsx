'use client';

import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { FLUXO_OPERACIONAL } from '@/lib/fluxo-operacional';
import { obterProgressoOnboard, salvarProgressoOnboard } from '@/lib/database';

interface OnboardChecklistProps {
  clienteId: string;
  estagio:   string;
}

export function OnboardChecklist({ clienteId, estagio }: OnboardChecklistProps) {
  const [progresso, setProgresso] = useState<Record<string, boolean>>({});
  const [salvando,  setSalvando]  = useState(false);

  const etapa = FLUXO_OPERACIONAL[estagio];
  const itens = etapa?.checklist ?? [];

  useEffect(() => {
    obterProgressoOnboard(clienteId).then(setProgresso).catch(console.error);
  }, [clienteId]);

  async function toggleItem(itemId: string) {
    const novoProgresso = { ...progresso, [itemId]: !progresso[itemId] };
    setProgresso(novoProgresso);
    setSalvando(true);
    try {
      await salvarProgressoOnboard(clienteId, novoProgresso);
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  if (itens.length === 0) return null;

  const concluidos = itens.filter((i) => progresso[i.id]).length;
  const percentual = Math.round((concluidos / itens.length) * 100);

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
      <div className="flex items-center justify-between mb-[1rem]">
        <h3 className="text-ink-primary font-semibold text-[0.9375rem]">
          Checklist de {etapa?.label}
        </h3>
        <div className="flex items-center gap-[0.5rem]">
          {salvando && (
            <span className="text-[0.6875rem] text-ink-muted">Salvando…</span>
          )}
          <span className="text-[0.75rem] text-ink-secondary font-medium">
            {concluidos}/{itens.length}
          </span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-[0.25rem] bg-surface-hover rounded-full mb-[1rem] overflow-hidden">
        <div
          className="h-full bg-ads-500 rounded-full transition-all duration-700"
          style={{ width: `${percentual}%` }}
        />
      </div>

      {/* Itens */}
      <div className="flex flex-col gap-[0.375rem]">
        {itens.map((item) => {
          const feito = progresso[item.id] ?? false;
          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`flex items-start gap-[0.75rem] p-[0.75rem] rounded-[0.375rem] text-left transition-colors border ${feito ? 'bg-ads-500/8 border-ads-500/20' : 'hover:bg-surface-hover border-surface-border'}`}
            >
              <div className={`shrink-0 w-[1.125rem] h-[1.125rem] rounded-[0.25rem] border flex items-center justify-center mt-[0.0625rem] transition-all ${feito ? 'bg-ads-500 border-ads-500' : 'border-surface-border bg-surface-hover'}`}>
                {feito && <Check className="w-[0.625rem] h-[0.625rem] text-white" strokeWidth={3} />}
              </div>
              <span className={`text-[0.875rem] leading-snug ${feito ? 'text-ink-muted line-through' : 'text-ink-secondary'}`}>
                {item.texto}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
