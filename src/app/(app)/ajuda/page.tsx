'use client';

import { useState } from 'react';
import {
  HelpCircle, BookOpen, MessageCircle, Mail, ChevronDown,
  Keyboard, Plug, CheckCircle2, XCircle, AlertCircle,
  Search, Zap, Users, BarChart3, DollarSign, FileText,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Como adicionar um novo cliente ao sistema?',
    a: 'Vá em Clientes → clique em "Novo Cliente" no canto superior direito. Preencha nome, WhatsApp, e-mail, nicho e opcionalmente o plano de assinatura. O cliente entra automaticamente no fluxo operacional no estágio "Recebido".',
  },
  {
    q: 'O que significa o estágio "Setup Tráfego"?',
    a: 'É o estágio em que as campanhas de Google Ads estão sendo criadas e configuradas pela equipe. Após a aprovação do cliente e ativação das campanhas, avança para "Ativo".',
  },
  {
    q: 'Como funciona a DRE na página Financeiro?',
    a: 'A DRE (Demonstração do Resultado) é calculada automaticamente a partir dos lançamentos do mês atual. Os custos fixos e variáveis são configuráveis em Configurações → Financeiro. O imposto é estimado com base no regime tributário selecionado.',
  },
  {
    q: 'Como conectar o Google Ads de um cliente?',
    a: 'Acesse o perfil do cliente (Clientes → nome do cliente) e informe o Customer ID do Google Ads no campo correspondente. O sistema buscará os dados automaticamente via API nas próximas 24h.',
  },
  {
    q: 'O que é o modo de teste?',
    a: 'No modo de teste, todas as mensagens de WhatsApp são redirecionadas para um número de teste e os webhooks do Asaas processam com flag de teste. Ative/desative em Configurações → Integrações.',
  },
  {
    q: 'Como gerar um relatório executivo para o cliente?',
    a: 'Vá em Relatórios, selecione o cliente no seletor da topbar e clique em "Solicitar". O sistema usa o Gemini para analisar os dados do Google Ads e GA4 e gera um relatório em Markdown para download.',
  },
  {
    q: 'Os dados do Analytics são em tempo real?',
    a: 'Sim. A seção "Dados ao vivo" busca diretamente da API do Google Ads e GA4 com o período selecionado (7, 30 ou 90 dias). Os dados são atualizados a cada clique em "Atualizar".',
  },
] as const;

// ─── ATALHOS ─────────────────────────────────────────────────────────────────

const ATALHOS = [
  { teclas: ['Ctrl', 'K'],        acao: 'Abrir busca rápida'           },
  { teclas: ['G', 'D'],           acao: 'Ir para Dashboard'            },
  { teclas: ['G', 'C'],           acao: 'Ir para Clientes'             },
  { teclas: ['G', 'T'],           acao: 'Ir para Tarefas'              },
  { teclas: ['G', 'F'],           acao: 'Ir para Financeiro'           },
  { teclas: ['G', 'A'],           acao: 'Ir para Analytics'            },
  { teclas: ['N', 'C'],           acao: 'Novo cliente'                 },
  { teclas: ['N', 'T'],           acao: 'Nova tarefa'                  },
  { teclas: ['?'],                acao: 'Abrir esta página de ajuda'   },
  { teclas: ['Esc'],              acao: 'Fechar modal / accordion'     },
] as const;

// ─── INTEGRAÇÕES ─────────────────────────────────────────────────────────────

const INTEGRACOES = [
  { icon: BarChart3,  label: 'Google Ads API',    desc: 'Métricas de campanhas em tempo real',   status: 'configured' as const },
  { icon: BarChart3,  label: 'Google Analytics 4', desc: 'Sessões, usuários, engajamento',        status: 'configured' as const },
  { icon: DollarSign, label: 'Asaas (Pagamentos)', desc: 'Webhook de cobranças e faturas',        status: 'test' as const      },
  { icon: MessageCircle, label: 'WhatsApp',        desc: 'Templates de mensagens automáticas',    status: 'test' as const      },
  { icon: Zap,        label: 'Gemini IA',          desc: 'Análise de relatórios e insights',      status: 'configured' as const },
] as const;

const STATUS_CONFIG = {
  configured: { icon: CheckCircle2, label: 'Ativo',        color: 'text-status-green' },
  test:        { icon: AlertCircle,  label: 'Modo Teste',   color: 'text-status-orange' },
  error:       { icon: XCircle,     label: 'Erro',          color: 'text-status-red'   },
} as const;

// ─── COMPONENTE FAQ ───────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-surface-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-[1rem] px-[1rem] py-[1rem] text-left hover:bg-surface-hover/50 transition-colors group"
      >
        <span className="text-ink-primary text-[0.9375rem] font-medium">{q}</span>
        <ChevronDown
          className={`w-[1rem] h-[1rem] text-ink-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div className="px-[1rem] pb-[1rem]">
          <p className="text-ink-secondary text-[0.875rem] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function AjudaPage() {
  return (
    <MainLayout
      title="Ajuda"
      subtitle="Central de suporte, FAQ e atalhos"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[1.5rem]">

        {/* ── COLUNA PRINCIPAL ── */}
        <div className="xl:col-span-2 flex flex-col gap-[1.5rem]">

          {/* Início rápido */}
          <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
            <div className="flex items-center gap-[0.75rem] mb-[1.25rem]">
              <div className="w-[2rem] h-[2rem] rounded-[0.375rem] bg-ads-500/10 flex items-center justify-center">
                <Zap className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.75} />
              </div>
              <h2 className="text-ink-primary font-semibold text-[0.9375rem]">Início Rápido</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[0.75rem]">
              {[
                { icon: Users,     label: 'Cadastrar cliente',  href: '/clientes/novo',  desc: 'Adicione o primeiro cliente ao fluxo' },
                { icon: BarChart3, label: 'Ver Analytics',      href: '/analytics',      desc: 'Dados de Google Ads e GA4 ao vivo' },
                { icon: DollarSign,label: 'Financeiro',         href: '/financeiro',     desc: 'DRE, MRR, LTV e projeções' },
                { icon: FileText,  label: 'Gerar Relatório',    href: '/relatorios',     desc: 'Análise mensal com IA' },
              ].map(({ icon: Icon, label, href, desc }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-start gap-[0.75rem] p-[0.875rem] rounded-[0.5rem] bg-surface-hover hover:border-ads-500/30 border border-surface-border transition-colors group"
                >
                  <Icon className="w-[1rem] h-[1rem] text-ink-muted group-hover:text-ads-500 mt-[0.125rem] shrink-0 transition-colors" strokeWidth={1.5} />
                  <div>
                    <p className="text-ink-primary text-[0.875rem] font-medium">{label}</p>
                    <p className="text-ink-muted text-[0.75rem]">{desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* FAQ com accordion */}
          <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow overflow-hidden">
            <div className="flex items-center gap-[0.75rem] px-[1rem] py-[1rem] border-b border-surface-border">
              <Search className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.75} />
              <h2 className="text-ink-primary font-semibold text-[0.9375rem]">Perguntas Frequentes</h2>
            </div>
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>

        </div>

        {/* ── COLUNA LATERAL ── */}
        <div className="flex flex-col gap-[1.5rem]">

          {/* Status das integrações */}
          <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow overflow-hidden">
            <div className="flex items-center gap-[0.75rem] px-[1rem] py-[1rem] border-b border-surface-border">
              <Plug className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.75} />
              <h2 className="text-ink-primary font-semibold text-[0.9375rem]">Integrações</h2>
            </div>
            <div className="divide-y divide-surface-border">
              {INTEGRACOES.map(({ icon: Icon, label, desc, status }) => {
                const cfg = STATUS_CONFIG[status];
                const StatusIcon = cfg.icon;
                return (
                  <div key={label} className="flex items-center gap-[0.75rem] px-[1rem] py-[0.875rem]">
                    <Icon className="w-[1rem] h-[1rem] text-ink-muted shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-ink-primary text-[0.875rem] font-medium">{label}</p>
                      <p className="text-ink-muted text-[0.75rem] truncate">{desc}</p>
                    </div>
                    <div className={`flex items-center gap-[0.25rem] shrink-0 ${cfg.color}`}>
                      <StatusIcon className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                      <span className="text-[0.75rem] font-medium">{cfg.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Atalhos de teclado */}
          <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow overflow-hidden">
            <div className="flex items-center gap-[0.75rem] px-[1rem] py-[1rem] border-b border-surface-border">
              <Keyboard className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.75} />
              <h2 className="text-ink-primary font-semibold text-[0.9375rem]">Atalhos</h2>
            </div>
            <div className="divide-y divide-surface-border">
              {ATALHOS.map(({ teclas, acao }) => (
                <div key={acao} className="flex items-center justify-between px-[1rem] py-[0.625rem]">
                  <span className="text-ink-secondary text-[0.8125rem]">{acao}</span>
                  <div className="flex items-center gap-[0.25rem]">
                    {teclas.map((t, i) => (
                      <span key={i} className="inline-flex items-center justify-center min-w-[1.5rem] h-[1.5rem] px-[0.375rem] rounded-[0.25rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.6875rem] font-mono font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contato */}
          <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem]">
            <div className="flex items-center gap-[0.75rem] mb-[1rem]">
              <HelpCircle className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.75} />
              <h2 className="text-ink-primary font-semibold text-[0.9375rem]">Suporte</h2>
            </div>
            <a
              href="mailto:suporte@adsgator.com.br"
              className="flex items-center gap-[0.625rem] p-[0.75rem] rounded-[0.375rem] bg-surface-hover hover:border-ads-500/30 border border-surface-border transition-colors group"
            >
              <Mail className="w-[1rem] h-[1rem] text-ink-muted group-hover:text-ads-500 transition-colors" strokeWidth={1.5} />
              <span className="text-ink-secondary text-[0.875rem] group-hover:text-ink-primary transition-colors">suporte@adsgator.com.br</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-[0.625rem] p-[0.75rem] rounded-[0.375rem] bg-surface-hover hover:border-ads-500/30 border border-surface-border transition-colors group mt-[0.5rem]"
            >
              <MessageCircle className="w-[1rem] h-[1rem] text-ink-muted group-hover:text-ads-500 transition-colors" strokeWidth={1.5} />
              <span className="text-ink-secondary text-[0.875rem] group-hover:text-ink-primary transition-colors">Chat de suporte</span>
            </a>
            <div className="mt-[1rem] pt-[1rem] border-t border-surface-border">
              <div className="flex items-center gap-[0.5rem]">
                <BookOpen className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.5} />
                <span className="text-ink-muted text-[0.75rem]">ADSGATOR HUB v1.0.0</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
