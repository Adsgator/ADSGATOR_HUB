'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { criarCliente, criarAssinatura } from '@/lib/database';
import { MainLayout } from '@/components/layout/MainLayout';
import type { ClienteStatus } from '@/lib/types';

const NICHOS_SUGERIDOS = [
  'Psicologia', 'Odontologia', 'Estética', 'Advocacia', 'Medicina',
  'Fisioterapia', 'Nutrição', 'Academia', 'Imóveis', 'Adestramento',
  'Educação', 'Contabilidade', 'Engenharia', 'Outro',
];

export default function NovoClientePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: '', email: '', whatsapp: '',
    dominio: '', nicho: '', plano_nome: '', valor_mensal: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro,     setErro]     = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      const novoCliente = await criarCliente({
        nome:                   form.nome.trim(),
        email:                  form.email.trim().toLowerCase(),
        whatsapp:               form.whatsapp.replace(/\D/g, ''),
        dominio:                form.dominio.trim() || undefined,
        nicho:                  form.nicho.trim(),
        status:                 'recebido' as ClienteStatus,
        google_ads_customer_id: undefined,
        ga4_property_id:        undefined,
      });

      if (form.plano_nome && form.valor_mensal) {
        await criarAssinatura({
          cliente_id:   novoCliente.id,
          plano_nome:   form.plano_nome.trim(),
          valor_mensal: parseFloat(form.valor_mensal),
        });
      }

      router.push('/dashboard');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar cliente');
    } finally {
      setSalvando(false);
    }
  }

  const inputClass = 'w-full h-[2.5rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-primary placeholder:text-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors';

  const labelClass = 'block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]';

  return (
    <MainLayout title="Novo Cliente" subtitle="Preencha os dados básicos">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-[0.375rem] text-ink-muted hover:text-ink-secondary text-[0.875rem] mb-[1.5rem] transition-colors"
      >
        <ArrowLeft className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
        Voltar
      </button>

      <div className="max-w-[40rem]">

        {erro && (
          <div className="mb-[1.5rem] bg-status-red/10 border border-status-red/20 rounded-[0.375rem] px-[1rem] py-[0.75rem]">
            <p className="text-[0.8125rem] text-status-red">{erro}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem] flex flex-col gap-[1.25rem]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.25rem]">
            <div>
              <label className={labelClass}>Nome completo *</label>
              <input name="nome" value={form.nome} onChange={handleChange} required className={inputClass} placeholder="Ex.: Ana Paula Santos" />
            </div>
            <div>
              <label className={labelClass}>WhatsApp *</label>
              <input name="whatsapp" value={form.whatsapp} onChange={handleChange} required className={inputClass} placeholder="11999998888" />
            </div>
          </div>

          <div>
            <label className={labelClass}>E-mail *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="cliente@email.com" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.25rem]">
            <div>
              <label className={labelClass}>Nicho *</label>
              <select name="nicho" value={form.nicho} onChange={handleChange} required className={inputClass + ' cursor-pointer'}>
                <option value="">Selecione…</option>
                {NICHOS_SUGERIDOS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Domínio</label>
              <input name="dominio" value={form.dominio} onChange={handleChange} className={inputClass} placeholder="meusite.com.br" />
            </div>
          </div>

          <div className="border-t border-surface-border pt-[1.25rem]">
            <p className="text-[0.6875rem] text-ink-muted font-semibold uppercase tracking-wide mb-[1rem]">
              Assinatura (opcional)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.25rem]">
              <div>
                <label className={labelClass}>Nome do Plano</label>
                <input name="plano_nome" value={form.plano_nome} onChange={handleChange} className={inputClass} placeholder="Ex.: Plano Starter" />
              </div>
              <div>
                <label className={labelClass}>Valor Mensal (R$)</label>
                <input name="valor_mensal" type="number" min="0" step="0.01" value={form.valor_mensal} onChange={handleChange} className={inputClass} placeholder="0,00" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="flex items-center justify-center gap-[0.5rem] h-[2.5rem] rounded-[0.375rem] bg-ads-500 hover:bg-ads-600 text-white font-semibold text-[0.875rem] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {salvando
              ? <><div className="w-[1rem] h-[1rem] border-2 border-white border-t-transparent rounded-full animate-spin" /> Criando…</>
              : 'Criar Cliente'
            }
          </button>
        </form>
      </div>
    </MainLayout>
  );
}
