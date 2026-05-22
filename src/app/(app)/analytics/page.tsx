'use client';

import { BarChart2, TrendingUp, ArrowUpRight, Calendar, Filter, RefreshCw } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

// ─── PLACEHOLDER ──────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  return (
    <MainLayout
      title="Analytics"
      subtitle="Visão geral de métricas e performance"
      actions={
        <div className="flex items-center gap-[0.625rem]">
          <button className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] font-medium hover:border-ads-500/40 transition-colors">
            <Calendar className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            Últimos 30 dias
          </button>
          <button className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] font-medium hover:border-ads-500/40 transition-colors">
            <Filter className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            Filtrar
          </button>
          <button className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors">
            <RefreshCw className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            Atualizar
          </button>
        </div>
      }
    >
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1rem] mb-[1.5rem]">
        {[
          { label: 'Investimento Total', valor: 'R$ 0,00', sub: 'Este mês', icon: TrendingUp, cor: 'text-status-blue' },
          { label: 'Conversões', valor: '0', sub: 'Leads/vendas', icon: ArrowUpRight, cor: 'text-brand' },
          { label: 'CTR Médio', valor: '0%', sub: 'Click-through rate', icon: BarChart2, cor: 'text-status-purple' },
          { label: 'CPA Médio', valor: 'R$ 0,00', sub: 'Custo por aquisição', icon: Calendar, cor: 'text-status-orange' },
        ].map(({ label, valor, sub, icon: Icon, cor }) => (
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

      {/* EMPTY STATE */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-[4rem] text-center">
        <BarChart2 className="w-[3rem] h-[3rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
        <h3 className="text-ink-primary font-semibold text-[1rem] mb-[0.5rem]">Analytics em desenvolvimento</h3>
        <p className="text-ink-secondary text-[0.875rem] max-w-[24rem] mx-auto">
          Esta página está sendo construída. Em breve você terá acesso a dashboards completos com dados de Google Ads e GA4.
        </p>
      </div>
    </MainLayout>
  );
}
