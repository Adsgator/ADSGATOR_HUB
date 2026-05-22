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
    <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem]">
      <div className="flex items-center justify-between mb-[1rem]">
        <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base">
          Checklist de {etapa?.label}
        </h3>
        <div className="flex items-center gap-[0.5rem]">
          {salvando && (
            <span className="text-2xs dark:text-ink-muted text-gray-400">Salvando…</span>
          )}
          <span className="text-xs dark:text-ink-secondary text-gray-600 font-medium">
            {concluidos}/{itens.length}
          </span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-[0.25rem] dark:bg-surface-hover bg-gray-100 rounded-full mb-[1rem] overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-300"
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
              className={`
                flex items-start gap-[0.75rem] p-[0.75rem] rounded text-left
                transition-colors
                ${feito
                  ? 'dark:bg-brand/8 bg-green-50 dark:border dark:border-brand/20 border border-green-100'
                  : 'dark:hover:bg-surface-hover hover:bg-gray-50 dark:border dark:border-surface-border border border-gray-50'
                }
              `}
            >
              <div className={`
                shrink-0 w-[1.125rem] h-[1.125rem] rounded-[0.25rem] border flex items-center justify-center mt-[0.0625rem]
                transition-all
                ${feito
                  ? 'bg-brand border-brand'
                  : 'dark:border-surface-border border-gray-300 dark:bg-surface-hover bg-white'
                }
              `}>
                {feito && <Check className="w-[0.625rem] h-[0.625rem] text-white" strokeWidth={3} />}
              </div>
              <span className={`text-sm leading-snug ${feito ? 'dark:text-ink-muted text-gray-400 line-through' : 'dark:text-ink-secondary text-gray-700'}`}>
                {item.texto}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
