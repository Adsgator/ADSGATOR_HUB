'use client';

import { HelpCircle, BookOpen, MessageCircle, ExternalLink, Mail, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

// ─── PÁGINA DE AJUDA ──────────────────────────────────────────────────────────

export default function AjudaPage() {
  const recursos = [
    {
      icon: BookOpen,
      title: 'Documentação',
      description: 'Guia completo de uso da plataforma',
      href: '#',
    },
    {
      icon: MessageCircle,
      title: 'Suporte',
      description: 'Entre em contato com nossa equipe',
      href: '#',
    },
    {
      icon: FileText,
      title: 'FAQ',
      description: 'Perguntas frequentes respondidas',
      href: '#',
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'suporte@adsgator.com.br',
      href: 'mailto:suporte@adsgator.com.br',
    },
  ];

  return (
    <MainLayout
      title="Ajuda"
      subtitle="Central de suporte e recursos"
    >
      {/* HEADER INFO */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] mb-[1.5rem]">
        <div className="flex items-start gap-[1rem]">
          <div className="w-[2.5rem] h-[2.5rem] rounded-[0.5rem] bg-ads-500/10 flex items-center justify-center shrink-0">
            <HelpCircle className="w-[1.25rem] h-[1.25rem] text-ads-500" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-ink-primary font-semibold text-[1rem] mb-[0.25rem]">Como podemos ajudar?</h3>
            <p className="text-ink-secondary text-[0.875rem]">
              Encontre respostas, documentação e suporte para utilizar o ADSGATOR HUB.
            </p>
          </div>
        </div>
      </div>

      {/* RECURSOS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem]">
        {recursos.map(({ icon: Icon, title, description, href }) => (
          <a
            key={title}
            href={href}
            className="flex items-start gap-[1rem] bg-surface-card border border-surface-border rounded-xl p-[1.25rem] hover:border-ads-500/40 transition-colors group"
          >
            <div className="w-[2.25rem] h-[2.25rem] rounded-[0.375rem] bg-surface-hover flex items-center justify-center shrink-0 group-hover:bg-ads-500/10 transition-colors">
              <Icon className="w-[1.125rem] h-[1.125rem] text-ink-secondary group-hover:text-ads-500 transition-colors" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[0.375rem] mb-[0.25rem]">
                <h4 className="text-ink-primary font-medium text-[0.9375rem]">{title}</h4>
                <ExternalLink className="w-[0.75rem] h-[0.75rem] text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
              </div>
              <p className="text-ink-secondary text-[0.8125rem]">{description}</p>
            </div>
          </a>
        ))}
      </div>

      {/* VERSÃO */}
      <div className="mt-[2rem] pt-[1.5rem] border-t border-surface-border text-center">
        <p className="text-ink-muted text-[0.75rem]">
          ADSGATOR HUB v1.0.0
        </p>
      </div>
    </MainLayout>
  );
}
