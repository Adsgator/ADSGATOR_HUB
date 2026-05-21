# ADSGATOR HUB — ARQUIVO 2: UX & CRM
> **Implementação:** Copie os arquivos para as pastas indicadas dentro do projeto Next.js.

---

## 1. `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── NUNCA use px. Apenas rem. ───────────────────────
      fontFamily: {
        sans:  ['Geist', 'system-ui', 'sans-serif'],
        mono:  ['Geist Mono', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#10b981',
          dark:    '#059669',
          light:   '#34d399',
          muted:   'rgba(16,185,129,0.12)',
        },
        surface: {
          bg:     '#0c0c0d',
          card:   '#141415',
          hover:  '#1a1a1c',
          border: '#242427',
          input:  '#1e1e21',
        },
        ink: {
          primary:   '#f0f0f1',
          secondary: '#8b8b96',
          muted:     '#52525e',
          disabled:  '#3a3a44',
        },
        status: {
          orange: '#f97316',
          red:    '#ef4444',
          blue:   '#3b82f6',
          purple: '#8b5cf6',
          yellow: '#eab308',
        },
      },
      fontSize: {
        '2xs': ['0.625rem',  { lineHeight: '0.875rem' }],
        xs:    ['0.75rem',   { lineHeight: '1rem'     }],
        sm:    ['0.875rem',  { lineHeight: '1.25rem'  }],
        base:  ['1rem',      { lineHeight: '1.5rem'   }],
        lg:    ['1.125rem',  { lineHeight: '1.75rem'  }],
        xl:    ['1.25rem',   { lineHeight: '1.75rem'  }],
        '2xl': ['1.5rem',    { lineHeight: '2rem'     }],
        '3xl': ['1.875rem',  { lineHeight: '2.25rem'  }],
        '4xl': ['2.25rem',   { lineHeight: '2.5rem'   }],
      },
      borderRadius: {
        none: '0',
        sm:   '0.1875rem',
        DEFAULT: '0.375rem',
        md:   '0.5rem',
        lg:   '0.75rem',
        xl:   '1rem',
        full: '9999rem',
      },
      animation: {
        'fade-in':      'fadeIn 0.2s ease-out',
        'slide-up':     'slideUp 0.25s ease-out',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(0.5rem)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSubtle: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 2. `src/lib/fluxo-operacional.ts`
> **Este é o coração do sistema "Mão com Açúcar".**
> Define cada estágio, a instrução exata, os templates de WhatsApp disponíveis
> e o checklist de tarefas. A UI lê este objeto e guia o operador sem ambiguidade.

```typescript
export interface EtapaFluxo {
  id:                string;
  label:             string;
  descricao:         string;
  corBadge:          string;        // classe Tailwind para a cor do badge
  icone:             string;        // nome do ícone Lucide
  instrucao:         string;        // instrução direta para o operador
  whatsapp_templates: string[];     // tags dos templates disponíveis neste estágio
  checklist?:        ChecklistItem[];
  proximo_estagio?:  string;        // id do próximo estágio
  proxima_acao_label: string;       // texto do botão "Avançar"
}

export interface ChecklistItem {
  id:    string;
  texto: string;
}

// Ordem do fluxo: recebido → onboarding → setup_trafego → ativo
export const FLUXO_OPERACIONAL: Record<string, EtapaFluxo> = {

  recebido: {
    id:                'recebido',
    label:             'Recebido',
    descricao:         'Pagamento confirmado. Cliente aguarda contato inicial.',
    corBadge:          'bg-status-blue text-white',
    icone:             'Bell',
    instrucao:         'Envie a mensagem de boas-vindas agora com o template #BOASVINDAS. O cliente acabou de pagar e está aguardando.',
    whatsapp_templates: ['#BOASVINDAS'],
    proximo_estagio:   'onboarding',
    proxima_acao_label: 'Boas-vindas enviadas → Ir para Onboarding',
  },

  onboarding: {
    id:                'onboarding',
    label:             'Onboarding',
    descricao:         'Configuração inicial da conta e estrutura do projeto.',
    corBadge:          'bg-status-purple text-white',
    icone:             'ClipboardList',
    instrucao:         'Conclua o checklist de onboarding abaixo. Envie o #CONVITE para call e o #BRIEFINGGA para coletar informações do negócio.',
    whatsapp_templates: ['#CONVITE', '#BRIEFINGGA'],
    checklist: [
      { id: 'contrato',        texto: 'Contrato enviado e assinado' },
      { id: 'pix-setup',       texto: 'Pix do setup recebido' },
      { id: 'grupo-zap',       texto: 'Grupo criado no WhatsApp com o cliente' },
      { id: 'video-boas-vindas', texto: 'Vídeo de boas-vindas enviado' },
    ],
    proximo_estagio:   'setup_trafego',
    proxima_acao_label: 'Onboarding completo → Ir para Setup de Tráfego',
  },

  setup_trafego: {
    id:                'setup_trafego',
    label:             'Setup de Tráfego',
    descricao:         'Configuração técnica da conta Google Ads, LP e campanhas.',
    corBadge:          'bg-status-yellow text-black',
    icone:             'Settings2',
    instrucao:         'Siga o checklist técnico abaixo. Conclua todos os itens antes de ativar as campanhas.',
    whatsapp_templates: [],
    checklist: [
      { id: 'acesso-ads',      texto: 'Acesso à conta Google Ads solicitado/concedido' },
      { id: 'pagamento-ads',   texto: 'Pagamento configurado na conta Google Ads' },
      { id: 'publico-alvo',    texto: 'Público-alvo criado e configurado' },
      { id: 'palavras-chave',  texto: 'Palavras-chave negativadas (nível de conta)' },
      { id: 'conversao-ads',   texto: 'Tag de conversão (WhatsApp) criada' },
      { id: 'dominio',         texto: 'Domínio comprado e configurado' },
      { id: 'lp-criada',       texto: 'Landing page criada e publicada' },
      { id: 'tag-geral',       texto: 'Tag geral do Google instalada na LP' },
      { id: 'tag-conversao',   texto: 'Tag de conversão instalada na LP' },
      { id: 'teste-fluxo',     texto: 'Fluxo completo (Anúncio → LP → WhatsApp) testado' },
      { id: 'campanha-criada', texto: 'Campanha criada e estruturada' },
      { id: 'anuncios-criados',texto: 'Anúncios criados (mínimo 3 variações)' },
      { id: 'revisao-final',   texto: 'Revisão final de orçamento, locais e palavras-chave' },
      { id: 'campanha-ativa',  texto: '🚀 Campanha ATIVADA' },
    ],
    proximo_estagio:   'ativo',
    proxima_acao_label: 'Campanha no ar → Cliente Ativo',
  },

  ativo: {
    id:                'ativo',
    label:             'Ativo',
    descricao:         'Campanha rodando. Gestão contínua e otimizações.',
    corBadge:          'bg-brand text-white',
    icone:             'TrendingUp',
    instrucao:         'Cliente ativo. Monitore o saldo, verifique as métricas semanalmente e otimize as campanhas. Use #SALDOGOOGLE quando o saldo estiver crítico.',
    whatsapp_templates: ['#SALDOGOOGLE'],
    proximo_estagio:   undefined,
    proxima_acao_label: '',
  },

  congelado: {
    id:                'congelado',
    label:             'Retido',
    descricao:         'Aguardando retorno do cliente. Alerta automático em 48h.',
    corBadge:          'bg-status-orange text-white',
    icone:             'PauseCircle',
    instrucao:         'Este cliente está aguardando sua resposta. O sistema alertará automaticamente em 48h se não houver movimento.',
    whatsapp_templates: [],
    proximo_estagio:   undefined,
    proxima_acao_label: '',
  },

  cancelado: {
    id:                'cancelado',
    label:             'Cancelado',
    descricao:         'Contrato encerrado. Ações de desativação necessárias.',
    corBadge:          'bg-status-red text-white',
    icone:             'XCircle',
    instrucao:         'Cliente cancelado. Remova a Landing Page do ar, delete os assets do Storage e encerre as campanhas no Google Ads.',
    whatsapp_templates: [],
    proximo_estagio:   undefined,
    proxima_acao_label: '',
  },
};

// Ordem linear para a barra de progresso
export const ORDEM_ESTAGIOS = ['recebido','onboarding','setup_trafego','ativo'] as const;

// Templates WhatsApp com mensagens reais da agência
export const WHATSAPP_TEMPLATES: Record<string, { titulo: string; mensagem: string }> = {
  '#BOASVINDAS': {
    titulo: 'Boas-vindas',
    mensagem: `Olá! 👋

Seja muito bem-vindo(a)! 🚀

Estamos super animados em tê-lo(a) como nosso cliente. A partir de agora, estamos juntos para colocar o seu negócio em outro nível no Google!

Nos próximos dias vou entrar em contato para alinharmos os próximos passos do nosso projeto.

Qualquer dúvida que surgir, pode chamar aqui! Estou à disposição.`,
  },

  '#CONVITE': {
    titulo: 'Convite para Call de Alinhamento',
    mensagem: `Oi! 👋

Tudo certo? Vim marcar nossa call inicial para a gente alinhar a estratégia e tirar todas as dúvidas antes de começar.

Tenho disponibilidade nos seguintes horários. Qual funciona melhor para você?

Por favor me informe a melhor opção e te mando o link da chamada. 😊`,
  },

  '#BRIEFINGGA': {
    titulo: 'Briefing Google Ads',
    mensagem: `Oi! 📋

Para montar a sua campanha de Google Ads da forma mais certeira possível, precisamos de algumas informações sobre o seu negócio.

Pode me responder as perguntas abaixo?

✅ Qual o seu principal produto/serviço?
✅ Qual o ticket médio?
✅ Qual a cidade/região de atuação?
✅ Qual o perfil do seu cliente ideal (idade, gênero, situação)?
✅ Quais são seus 3 principais diferenciais?
✅ Já teve experiências com Google Ads antes?

Com isso, já consigo estruturar tudo para você! 🙏`,
  },

  '#SALDOGOOGLE': {
    titulo: 'Alerta de Saldo Google Ads',
    mensagem: `Olá! ⚠️

Passando para avisar que o saldo da sua conta do Google Ads está próximo do limite mínimo.

Para garantir que suas campanhas não parem e você não perca leads, é importante fazer uma recarga o quanto antes.

Qualquer dúvida sobre como fazer a recarga, é só me chamar! 😊`,
  },
};

export function gerarLinkWhatsApp(template: keyof typeof WHATSAPP_TEMPLATES, numero: string): string {
  const t = WHATSAPP_TEMPLATES[template];
  if (!t) return '';
  const numeroLimpo = numero.replace(/\D/g, '');
  const mensagemCodificada = encodeURIComponent(t.mensagem);
  return `https://wa.me/55${numeroLimpo}?text=${mensagemCodificada}`;
}
```

---

## 3. `src/providers/ThemeProvider.tsx`

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme:    Theme;
  setTheme: (t: Theme) => void;
  isDark:   boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme,  setThemeState] = useState<Theme>('dark');
  const [isDark, setIsDark]     = useState(true);

  useEffect(() => {
    const saved = (localStorage.getItem('adsgator-theme') as Theme) ?? 'dark';
    aplicarTema(saved);
  }, []);

  function aplicarTema(t: Theme) {
    setThemeState(t);
    localStorage.setItem('adsgator-theme', t);
    const prefersD = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const ativo = t === 'system' ? prefersD : t === 'dark';
    setIsDark(ativo);
    document.documentElement.classList.toggle('dark', ativo);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: aplicarTema, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme fora do ThemeProvider');
  return ctx;
}
```

---

## 4. `src/components/layout/Sidebar.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, BarChart3, DollarSign,
  Layers, Settings, LogOut, Moon, Sun, Monitor,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { logout } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/clientes',        icon: Users,           label: 'Clientes'   },
  { href: '/relatorios',      icon: BarChart3,        label: 'Relatórios' },
  { href: '/financeiro',      icon: DollarSign,       label: 'Financeiro' },
  { href: '/biblioteca',      icon: Layers,           label: 'Biblioteca' },
  { href: '/configuracoes',   icon: Settings,         label: 'Config'     },
] as const;

export function Sidebar() {
  const pathname          = usePathname();
  const router            = useRouter();
  const { theme, setTheme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  const themeIcons = { dark: Moon, light: Sun, system: Monitor } as const;
  const ThemeIcon  = themeIcons[theme] ?? Moon;

  const nextTheme: Record<string, 'light' | 'system' | 'dark'> = {
    dark: 'light', light: 'system', system: 'dark',
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 flex flex-col
        transition-all duration-200 ease-in-out
        dark:bg-surface-card bg-white
        dark:border-r dark:border-surface-border border-r border-gray-100
        ${expanded ? 'w-[13.5rem]' : 'w-[3.5rem]'}
      `}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className="flex items-center h-[3.5rem] px-[0.875rem] border-b dark:border-surface-border border-gray-100 gap-[0.75rem] overflow-hidden">
        <div className="shrink-0 w-[1.75rem] h-[1.75rem] rounded-[0.375rem] bg-brand flex items-center justify-center">
          <span className="text-white font-bold text-sm leading-none">A</span>
        </div>
        <span className={`
          dark:text-ink-primary text-gray-900 font-semibold text-sm whitespace-nowrap
          transition-opacity duration-150
          ${expanded ? 'opacity-100' : 'opacity-0'}
        `}>
          Adsgator Hub
        </span>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 flex flex-col gap-[0.25rem] p-[0.5rem] overflow-hidden">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const ativo = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`
                relative flex items-center gap-[0.75rem] h-[2.25rem] px-[0.625rem]
                rounded-[0.375rem] transition-colors group overflow-hidden
                ${ativo
                  ? 'dark:bg-brand/15 dark:text-brand bg-green-50 text-green-700'
                  : 'dark:text-ink-secondary text-gray-500 dark:hover:bg-surface-hover dark:hover:text-ink-primary hover:bg-gray-50 hover:text-gray-800'
                }
              `}
            >
              <Icon className="shrink-0 w-[1.125rem] h-[1.125rem]" strokeWidth={ativo ? 2 : 1.5} />
              <span className={`
                text-sm font-medium whitespace-nowrap
                transition-opacity duration-150
                ${expanded ? 'opacity-100' : 'opacity-0'}
              `}>
                {label}
              </span>
              {ativo && (
                <span className="absolute left-0 top-[0.375rem] bottom-[0.375rem] w-[0.1875rem] bg-brand rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé da sidebar */}
      <div className="p-[0.5rem] border-t dark:border-surface-border border-gray-100 flex flex-col gap-[0.25rem] overflow-hidden">
        {/* Toggle de tema */}
        <button
          onClick={() => setTheme(nextTheme[theme])}
          title={`Tema: ${theme}`}
          className="flex items-center gap-[0.75rem] h-[2.25rem] px-[0.625rem] rounded-[0.375rem] dark:text-ink-secondary text-gray-500 dark:hover:bg-surface-hover dark:hover:text-ink-primary hover:bg-gray-50 hover:text-gray-800 transition-colors"
        >
          <ThemeIcon className="shrink-0 w-[1.125rem] h-[1.125rem]" strokeWidth={1.5} />
          <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
            Tema ({theme})
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sair"
          className="flex items-center gap-[0.75rem] h-[2.25rem] px-[0.625rem] rounded-[0.375rem] dark:text-ink-secondary text-gray-500 dark:hover:bg-status-red/10 dark:hover:text-status-red hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="shrink-0 w-[1.125rem] h-[1.125rem]" strokeWidth={1.5} />
          <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
            Sair
          </span>
        </button>
      </div>
    </aside>
  );
}
```

---

## 5. `src/components/layout/MainLayout.tsx`

```typescript
import React from 'react';
import { Sidebar } from './Sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen dark:bg-surface-bg bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-[3.5rem] min-h-screen">
        <div className="max-w-[90rem] mx-auto px-[2rem] py-[2rem]">
          {children}
        </div>
      </main>
    </div>
  );
}
```

---

## 6. `src/components/ui/Badge.tsx`

```typescript
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?:    'sm' | 'md';
}

const variants = {
  default: 'dark:bg-surface-hover dark:text-ink-secondary bg-gray-100 text-gray-600',
  success: 'bg-brand/15 text-brand',
  warning: 'bg-status-orange/15 text-status-orange',
  danger:  'bg-status-red/15 text-status-red',
  info:    'bg-status-blue/15 text-status-blue',
  purple:  'bg-status-purple/15 text-status-purple',
};

const sizes = {
  sm: 'text-2xs px-[0.375rem] py-[0.0625rem] rounded-[0.1875rem]',
  md: 'text-xs  px-[0.5rem]  py-[0.125rem]  rounded-[0.25rem]',
};

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-semibold ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
```

---

## 7. `src/components/clientes/ClienteCard.tsx`

```typescript
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
  recebido:           'bg-status-blue/15 text-status-blue',
  onboarding:         'bg-status-purple/15 text-status-purple',
  setup_trafego:      'bg-status-yellow/15 text-status-yellow',
  ativo:              'bg-brand/15 text-brand',
  congelado:          'bg-status-orange/15 text-status-orange',
  cancelado:          'bg-status-red/15 text-status-red',
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
              href={gerarLinkWhatsApp(tag, cliente.whatsapp)}
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
          href={`https://wa.me/55${cliente.whatsapp.replace(/\D/g, '')}`}
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
```

---

## 8. `src/components/clientes/OnboardChecklist.tsx`

```typescript
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
  const [progresso,  setProgresso]  = useState<Record<string, boolean>>({});
  const [salvando,   setSalvando]   = useState(false);

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
```

---

## 9. `src/app/(app)/dashboard/page.tsx` — Central Operacional

```typescript
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AlertCircle, Users, CheckCircle, PauseCircle } from 'lucide-react';
import type { Cliente, Estagio } from '@/lib/types';
import { listarClientes, obterEstagioAtivo, congelarCliente } from '@/lib/database';
import { ClienteCard } from '@/components/clientes/ClienteCard';
import { MainLayout } from '@/components/layout/MainLayout';

type ClienteComEstagio = { cliente: Cliente; estagio: Estagio | null };

const FILTROS = [
  { key: null,           label: 'Todos'         },
  { key: 'recebido',     label: 'Recebidos'     },
  { key: 'onboarding',   label: 'Onboarding'    },
  { key: 'setup_trafego',label: 'Setup Tráfego' },
  { key: 'ativo',        label: 'Ativos'        },
] as const;

export default function DashboardPage() {
  const [dados,    setDados]    = useState<ClienteComEstagio[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filtro,   setFiltro]   = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const clientes = await listarClientes();
      const comEstagio = await Promise.all(
        clientes.map(async (c) => ({
          cliente: c,
          estagio: await obterEstagioAtivo(c.id).catch(() => null),
        }))
      );
      setDados(comEstagio);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  async function handleCongelar(clienteId: string) {
    await congelarCliente(clienteId).catch(console.error);
    carregarDados();
  }

  // Separar clientes por seção
  const retidos  = dados.filter((d) => d.cliente.status === 'congelado');
  const ativos   = dados.filter((d) => d.cliente.status !== 'congelado' && d.cliente.status !== 'cancelado');
  const filtrados = filtro ? ativos.filter((d) => d.cliente.status === filtro) : ativos;

  // KPIs
  const totalAtivos    = dados.filter((d) => d.cliente.status === 'ativo').length;
  const totalRetidos   = retidos.length;
  const totalRecebidos = dados.filter((d) => d.cliente.status === 'recebido').length;
  const totalGeral     = dados.length;

  // Taxa de retenção (evita divisão por zero)
  const taxaRetencao = totalGeral > 0
    ? Math.round((totalAtivos / totalGeral) * 100)
    : 0;

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-[2rem]">
        <h1 className="dark:text-ink-primary text-gray-900 text-[1.875rem] font-bold tracking-tight mb-[0.25rem]">
          Central Operacional
        </h1>
        <p className="dark:text-ink-secondary text-gray-500 text-sm">
          Cada cliente tem uma ação clara. Siga o fluxo.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1rem] mb-[2rem]">
        {[
          { label: 'Total de Clientes',   valor: totalGeral,     cor: 'dark:text-ink-primary text-gray-900'   },
          { label: 'Ativos',              valor: totalAtivos,    cor: 'text-brand'                             },
          { label: 'Retidos',             valor: totalRetidos,   cor: 'text-status-orange'                     },
          { label: 'Taxa de Retenção',    valor: `${taxaRetencao}%`, cor: 'dark:text-ink-primary text-gray-900' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 px-[1.25rem] py-[1rem]"
          >
            <p className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold mb-[0.375rem]">
              {kpi.label}
            </p>
            <p className={`text-[1.75rem] font-bold leading-none ${kpi.cor}`}>
              {kpi.valor}
            </p>
          </div>
        ))}
      </div>

      {/* Alerta: clientes recebidos precisam de ação imediata */}
      {totalRecebidos > 0 && (
        <div className="mb-[1.5rem] flex items-start gap-[0.75rem] dark:bg-status-blue/8 bg-blue-50 border dark:border-status-blue/20 border-blue-100 rounded-lg px-[1rem] py-[0.875rem]">
          <AlertCircle className="shrink-0 w-[1rem] h-[1rem] text-status-blue mt-[0.0625rem]" strokeWidth={2} />
          <p className="text-sm dark:text-status-blue text-blue-700 font-medium">
            {totalRecebidos} cliente{totalRecebidos > 1 ? 's' : ''} aguardando ação imediata — envie o #BOASVINDAS agora.
          </p>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-[0.375rem] mb-[1.5rem]">
        {FILTROS.map(({ key, label }) => (
          <button
            key={String(key)}
            onClick={() => setFiltro(key)}
            className={`
              text-xs font-semibold px-[0.75rem] h-[1.75rem] rounded-[0.25rem] transition-colors
              ${filtro === key
                ? 'dark:bg-brand/15 dark:text-brand bg-green-100 text-green-700'
                : 'dark:bg-surface-hover dark:text-ink-secondary dark:hover:text-ink-primary bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid de clientes ativos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 h-[14rem] animate-pulse" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[4rem] dark:text-ink-muted text-gray-400">
          <CheckCircle className="w-[3rem] h-[3rem] mb-[1rem]" strokeWidth={1} />
          <p className="text-base font-medium">Nenhum cliente nesta categoria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem] mb-[3rem]">
          {filtrados.map(({ cliente, estagio }) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              estagio={estagio}
              onCongelar={handleCongelar}
            />
          ))}
        </div>
      )}

      {/* Seção: Clientes Retidos */}
      {retidos.length > 0 && (
        <section>
          <div className="flex items-center gap-[0.5rem] mb-[1rem]">
            <PauseCircle className="w-[1rem] h-[1rem] text-status-orange" strokeWidth={2} />
            <h2 className="dark:text-ink-primary text-gray-800 font-semibold text-base">
              Clientes Retidos ({retidos.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
            {retidos.map(({ cliente, estagio }) => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                estagio={estagio}
                onCongelar={handleCongelar}
              />
            ))}
          </div>
        </section>
      )}
    </MainLayout>
  );
}
```

---

## 10. `src/app/(app)/clientes/[id]/page.tsx` — Perfil Completo do Cliente

```typescript
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
  obterAssinaturaCliente, avancarEstagio, descongelarCliente,
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
      // Recarregar dados
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
      {/* Back */}
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
            const etapa = FLUXO_OPERACIONAL[s];
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
                {etapaAtual.instrucao.startsWith('◆') ? etapaAtual.instrucao : `▶ ${etapaAtual.instrucao}`}
              </h2>

              {/* Templates WhatsApp */}
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

              {/* Botão de avanço de estágio */}
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

          {/* Checklist (só para onboarding e setup_trafego) */}
          {['onboarding','setup_trafego'].includes(cliente.status) && (
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
                {/* Linha do tempo */}
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

        {/* Coluna lateral: informações */}
        <div className="flex flex-col gap-[1rem]">
          {/* Dados do cliente */}
          <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.25rem]">
            <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-sm mb-[1rem]">
              Informações
            </h3>
            <div className="flex flex-col gap-[0.875rem]">
              {[
                { label: 'Nicho',    valor: cliente.nicho              },
                { label: 'WhatsApp', valor: cliente.whatsapp           },
                { label: 'Domínio',  valor: cliente.dominio ?? '—'     },
                { label: 'Google Ads ID', valor: cliente.google_ads_customer_id ?? 'Não configurado' },
                { label: 'GA4 ID',        valor: cliente.ga4_property_id          ?? 'Não configurado' },
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

          {/* Assinatura */}
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
```

---

## 11. `src/app/(app)/clientes/novo/page.tsx` — Formulário de Novo Cliente

```typescript
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { criarCliente, criarAssinatura } from '@/lib/database';
import { MainLayout } from '@/components/layout/MainLayout';

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
        nome:     form.nome.trim(),
        email:    form.email.trim().toLowerCase(),
        whatsapp: form.whatsapp.replace(/\D/g, ''),
        dominio:  form.dominio.trim() || null,
        nicho:    form.nicho.trim(),
        status:   'recebido',
        google_ads_customer_id: null,
        ga4_property_id:        null,
        cor_tema:               '#10b981',
        notas_internas:         null,
        metadata:               {},
        data_criacao:           '',
        data_atualizacao:       '',
      } as any);

      if (form.plano_nome && form.valor_mensal) {
        await criarAssinatura({
          cliente_id:  novoCliente.id,
          plano_nome:  form.plano_nome.trim(),
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

  const inputClass = `
    w-full h-[2.5rem] px-[0.75rem] rounded
    dark:bg-surface-input dark:border dark:border-surface-border dark:text-ink-primary dark:placeholder-ink-muted
    bg-white border border-gray-200 text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand
    text-sm transition-colors
  `;

  const labelClass = 'block dark:text-ink-secondary text-gray-700 text-sm font-medium mb-[0.375rem]';

  return (
    <MainLayout>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-[0.375rem] dark:text-ink-muted text-gray-400 hover:dark:text-ink-secondary hover:text-gray-600 text-sm mb-[1.5rem] transition-colors"
      >
        <ArrowLeft className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
        Voltar
      </button>

      <div className="max-w-[40rem]">
        <h1 className="dark:text-ink-primary text-gray-900 text-[1.5rem] font-bold mb-[0.25rem]">Novo Cliente</h1>
        <p className="dark:text-ink-secondary text-gray-500 text-sm mb-[2rem]">
          Preencha os dados básicos. O cliente entrará automaticamente no fluxo operacional.
        </p>

        {erro && (
          <div className="mb-[1.5rem] dark:bg-status-red/10 bg-red-50 border dark:border-status-red/20 border-red-200 rounded px-[1rem] py-[0.75rem]">
            <p className="text-sm dark:text-status-red text-red-700">{erro}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem] flex flex-col gap-[1.25rem]">
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

          <div className="border-t dark:border-surface-border border-gray-100 pt-[1.25rem]">
            <p className="text-xs dark:text-ink-muted text-gray-400 font-semibold uppercase tracking-wide mb-[1rem]">
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
            className="
              flex items-center justify-center gap-[0.5rem]
              dark:bg-brand dark:hover:bg-brand-dark dark:text-white
              bg-green-600 hover:bg-green-700 text-white
              h-[2.5rem] rounded font-semibold text-sm transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
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
```

---

## 12. `src/app/login/page.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginComEmail } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email,   setEmail]   = useState('');
  const [senha,   setSenha]   = useState('');
  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(''); setLoading(true);
    try {
      await loginComEmail(email.trim(), senha);
      router.push('/dashboard');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen dark:bg-surface-bg bg-gray-50 flex items-center justify-center px-[1rem]">
      <div className="w-full max-w-[22rem]">
        <div className="text-center mb-[2.5rem]">
          <div className="w-[3rem] h-[3rem] rounded-[0.625rem] bg-brand flex items-center justify-center mx-auto mb-[1.25rem]">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="dark:text-ink-primary text-gray-900 text-[1.5rem] font-bold">
            Adsgator Hub
          </h1>
          <p className="dark:text-ink-muted text-gray-400 text-sm mt-[0.25rem]">
            Sistema nervoso central da agência
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-[1rem]">
          {erro && (
            <div className="dark:bg-status-red/10 bg-red-50 border dark:border-status-red/20 border-red-200 rounded px-[0.875rem] py-[0.625rem]">
              <p className="text-sm dark:text-status-red text-red-700">{erro}</p>
            </div>
          )}

          {[
            { label: 'E-mail', type: 'email',    value: email,    set: setEmail,    ph: 'admin@adsgator.com' },
            { label: 'Senha',  type: 'password', value: senha,    set: setSenha,    ph: '••••••••'           },
          ].map(({ label, type, value, set, ph }) => (
            <div key={label}>
              <label className="block dark:text-ink-secondary text-gray-700 text-sm font-medium mb-[0.375rem]">
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                required
                placeholder={ph}
                className="
                  w-full h-[2.5rem] px-[0.75rem] rounded
                  dark:bg-surface-input dark:border dark:border-surface-border dark:text-ink-primary dark:placeholder-ink-muted
                  bg-white border border-gray-200 text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand
                  text-sm transition-colors
                "
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="
              h-[2.5rem] rounded font-semibold text-sm
              dark:bg-brand dark:hover:bg-brand-dark dark:text-white
              bg-green-600 hover:bg-green-700 text-white
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-[0.5rem]
            "
          >
            {loading
              ? <><div className="w-[1rem] h-[1rem] border-2 border-white border-t-transparent rounded-full animate-spin" /> Entrando…</>
              : 'Entrar'
            }
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## ✅ Checklist de Implementação do Arquivo 2

- [ ] Instalar dependências: `npm install @supabase/supabase-js lucide-react next`
- [ ] Adicionar fonte Geist ao `layout.tsx`: `import { Geist, Geist_Mono } from 'next/font/google'`
- [ ] Criar `src/providers/ThemeProvider.tsx` e envolver o app no `layout.tsx`
- [ ] Verificar que as classes Tailwind de `brand/`, `surface/`, `ink/`, `status/` estão no `tailwind.config.ts`
- [ ] Criar as rotas `/dashboard`, `/clientes/[id]`, `/clientes/novo`, `/login`
- [ ] Testar o fluxo: Login → Dashboard → Novo Cliente → Card com instrução → Avanço de estágio
