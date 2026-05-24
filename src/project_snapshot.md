# Project Snapshot

**Projeto:** `src`  
**Gerado em:** 2026-05-24 13:37:58  
**Total de arquivos:** 93  
**Raiz:** `C:\PROJETOS\ADSGATOR\ADSGATOR_HUB\src`  

---

## 📁 Estrutura de Arquivos

```
src/
├── 📁 app/
│   ├── 📁 (app)/
│   │   ├── 📁 ajuda/
│   │   │   └── 📄 page.tsx (13.6KB)
│   │   ├── 📁 analytics/
│   │   │   └── 📄 page.tsx (28.0KB)
│   │   ├── 📁 biblioteca/
│   │   │   └── 📄 page.tsx (19.8KB)
│   │   ├── 📁 clientes/
│   │   │   ├── 📁 [id]/
│   │   │   │   └── 📄 page.tsx (17.8KB)
│   │   │   ├── 📁 novo/
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📄 page.tsx (15.2KB)
│   │   ├── 📁 configuracoes/
│   │   │   └── 📄 page.tsx (22.1KB)
│   │   ├── 📁 dashboard/
│   │   │   └── 📄 page.tsx (23.2KB)
│   │   ├── 📁 financeiro/
│   │   │   └── 📄 page.tsx (30.1KB)
│   │   ├── 📁 marketing/
│   │   │   └── 📄 page.tsx (21.7KB)
│   │   ├── 📁 relatorios/
│   │   │   └── 📄 page.tsx (16.3KB)
│   │   └── 📁 tarefas/
│   │       └── 📄 page.tsx (22.4KB)
│   ├── 📁 api/
│   │   ├── 📁 analytics/
│   │   │   └── 📁 [clienteId]/
│   │   │       ├── 📁 live/
│   │   │       │   └── 📄 route.ts
│   │   │       └── 📄 route.ts
│   │   ├── 📁 ia/
│   │   │   ├── 📁 chat/
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 copy/
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 hashtags/
│   │   │   │   └── 📄 route.ts
│   │   │   └── 📁 morning-briefing/
│   │   │       └── 📄 route.ts
│   │   ├── 📁 search/
│   │   │   └── 📄 route.ts
│   │   └── 📁 weather/
│   │       └── 📄 route.ts
│   ├── 📁 login/
│   │   └── 📄 page.tsx
│   ├── 📄 globals.css (11.8KB)
│   ├── 📄 layout.tsx
│   └── 📄 page.tsx
├── 📁 components/
│   ├── 📁 analytics/
│   │   ├── 📄 AdsOverviewKpis.tsx
│   │   ├── 📄 AnalyticsMap.tsx
│   │   ├── 📄 DemographicsCard.tsx
│   │   ├── 📄 DeviceBreakdown.tsx
│   │   ├── 📄 GA4Panel.tsx
│   │   ├── 📄 GeographyBreakdown.tsx
│   │   ├── 📄 SearchTermsTable.tsx
│   │   └── 📄 TrafficSources.tsx
│   ├── 📁 clientes/
│   │   ├── 📄 AcessoRapido.tsx
│   │   ├── 📄 AuditTimeline.tsx
│   │   ├── 📄 ChecklistCard.tsx
│   │   ├── 📄 ClienteCard.tsx
│   │   ├── 📄 ClienteIntegracoes.tsx
│   │   ├── 📄 ClientePerformance.tsx
│   │   ├── 📄 OnboardChecklist.tsx
│   │   └── 📄 WhatsAppTemplateModal.tsx
│   ├── 📁 configuracoes/
│   │   └── 📄 AuditLogViewer.tsx (10.9KB)
│   ├── 📁 dashboard/
│   │   ├── 📄 AcoesDoDia.tsx
│   │   ├── 📄 AlertaSaldoGoogle.tsx
│   │   ├── 📄 AlertasCriticos.tsx
│   │   ├── 📄 BentoCard.tsx
│   │   ├── 📄 ClienteProgressCard.tsx
│   │   ├── 📄 DRESparkline.tsx
│   │   ├── 📄 GeminiChat.tsx
│   │   ├── 📄 KpiCard.tsx
│   │   ├── 📄 KpiCompactCard.tsx
│   │   ├── 📄 MorningBriefing.tsx
│   │   ├── 📄 PortfolioHero.tsx
│   │   ├── 📄 QuickExchange.tsx
│   │   ├── 📄 RecentTransactions.tsx
│   │   ├── 📄 TrendingOnMarket.tsx
│   │   └── 📄 WeatherClock.tsx
│   ├── 📁 layout/
│   │   ├── 📄 MainLayout.tsx
│   │   ├── 📄 NotificationBell.tsx
│   │   ├── 📄 NotificationDrawer.tsx
│   │   ├── 📄 RightSidebar.tsx
│   │   ├── 📄 Sidebar.tsx
│   │   ├── 📄 StatusBar.tsx
│   │   └── 📄 TopBar.tsx
│   └── 📁 ui/
│       ├── 📄 Badge.tsx
│       ├── 📄 ContextMenu.tsx
│       ├── 📄 GlobalSearch.tsx (10.8KB)
│       ├── 📄 HelpChatButton.tsx
│       ├── 📄 StatusBadge.tsx
│       ├── 📄 TaskModal.tsx
│       ├── 📄 ThemeToggle.tsx
│       └── 📄 Tooltip.tsx
├── 📁 lib/
│   ├── 📁 hooks/
│   │   ├── 📄 useClientes.ts
│   │   └── 📄 usePermissoes.ts
│   ├── 📁 store/
│   │   ├── 📄 right-sidebar-context.tsx
│   │   └── 📄 useAppStore.ts
│   ├── 📁 supabase/
│   │   └── 📄 client.ts
│   ├── 📄 astro-components.ts (13.2KB)
│   ├── 📄 audit.ts
│   ├── 📄 auth.ts
│   ├── 📄 city-coords.ts
│   ├── 📄 database.ts
│   ├── 📄 financeiro.ts
│   ├── 📄 fluxo-operacional.ts
│   ├── 📄 google-ads.ts (16.0KB)
│   ├── 📄 google-analytics.ts
│   ├── 📄 manifesto-generator.ts
│   ├── 📄 rbac.ts
│   ├── 📄 relatorio-generator.ts
│   ├── 📄 supabase.ts
│   ├── 📄 types.ts
│   ├── 📄 utils.ts
│   └── 📄 vertex-ai.ts
└── 📁 providers/
    └── 📄 ThemeProvider.tsx
```

---

## 📄 Conteúdo dos Arquivos

### `app\globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── LAYOUT — Editor Shell ──────────────────────────────────────────────── */
:root {
  --topbar-h:         3.5rem;
  --sidebar-w:        3.5rem;
  --sidebar-expanded: 15rem;
  --right-sidebar-w:  3rem;
  --statusbar-h:      1.5rem;
}

/* ─── TEMA CLARO — Light Theme (DEFAULT) ────────────────────────────────── */
:root {
  --surface-base:     218 220 233;  /* #DADCE9 — lavanda mais visível */
  --surface-card:     255 255 255;  /* #FFFFFF — card branco puro */
  --surface-hover:    244 244 248;  /* hover sutil */
  --surface-elevated: 249 249 253;
  --surface-border:   206 208 222;  /* #CED0DE */

  --ink-primary:      17 17 17;     /* #111111 */
  --ink-secondary:    82 82 91;     /* #52525b */
  --ink-muted:        161 161 170;  /* #a1a1aa */

  /* Glow effects */
  --glow-green:  rgba(34, 197, 94, 0.08);
  --glow-amber:  rgba(255, 184, 0, 0.08);
  --glow-cyan:   rgba(6, 182, 212, 0.08);
  --glow-red:    rgba(239, 68, 68, 0.08);
  --glow-blue:   rgba(59, 130, 246, 0.08);
  --glow-purple: rgba(139, 92, 246, 0.08);
}

/* ─── TEMA ESCURO — Dark Theme ───────────────────────────────────────────── */
.dark {
  --surface-base:     10 10 11;     /* #0a0a0b */
  --surface-card:     20 20 22;     /* #141416 */
  --surface-hover:    28 28 31;     /* #1c1c1f */
  --surface-elevated: 36 36 40;    /* #242428 */
  --surface-border:   42 42 46;    /* #2a2a2e */

  --ink-primary:      250 250 250;  /* #fafafa */
  --ink-secondary:    161 161 170;  /* #a1a1aa */
  --ink-muted:        113 113 122;  /* #71717a */

  --glow-green:  rgba(34, 197, 94, 0.12);
  --glow-amber:  rgba(255, 184, 0, 0.12);
  --glow-cyan:   rgba(6, 182, 212, 0.12);
  --glow-red:    rgba(239, 68, 68, 0.12);
  --glow-blue:   rgba(59, 130, 246, 0.12);
  --glow-purple: rgba(139, 92, 246, 0.12);
}

/* ─── BASE STYLES ───────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

/* ─── TRANSIÇÃO DE TEMA — suave e satisfatório ─────────────────────────── */
*,
*::before,
*::after {
  transition-property: background-color, border-color, color, fill, stroke, box-shadow;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  background-color: rgb(var(--surface-base));
  color: rgb(var(--ink-primary));
  font-family: var(--font-geist-sans), 'Geist', system-ui, sans-serif;
  font-feature-settings: 'rlig' 1, 'calt' 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ─── SCROLLBAR CUSTOMIZADA ─────────────────────────────────────────────── */
::-webkit-scrollbar {
  width: 0.375rem;
  height: 0.375rem;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgb(var(--surface-border));
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgb(var(--ink-muted));
}

/* ─── SELEÇÃO DE TEXTO ──────────────────────────────────────────────────── */
::selection {
  background: rgba(255, 165, 0, 0.25);
  color: #FFA500;
}

/* ─── RECHARTS — remover outline no foco ───────────────────────────────── */
.recharts-surface:focus {
  outline: none;
}

/* ─── ANIMAÇÕES DE ENTRADA ──────────────────────────────────────────────── */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(0.5rem); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fade-scale {
  from { opacity: 0; transform: scale(0.98); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes shimmer {
  from { background-position: -200% center; }
  to   { background-position:  200% center; }
}

.animate-fade-up    { animation: fade-up   0.35s cubic-bezier(0.4,0,0.2,1) both; }
.animate-fade-scale { animation: fade-scale 0.25s cubic-bezier(0.4,0,0.2,1) both; }

/* Stagger de filhos com CSS custom property */
.stagger > * { animation: fade-up 0.35s cubic-bezier(0.4,0,0.2,1) both; }
.stagger > *:nth-child(1) { animation-delay:  30ms; }
.stagger > *:nth-child(2) { animation-delay:  60ms; }
.stagger > *:nth-child(3) { animation-delay:  90ms; }
.stagger > *:nth-child(4) { animation-delay: 120ms; }
.stagger > *:nth-child(5) { animation-delay: 150ms; }
.stagger > *:nth-child(6) { animation-delay: 180ms; }
.stagger > *:nth-child(7) { animation-delay: 210ms; }
.stagger > *:nth-child(8) { animation-delay: 240ms; }

/* ─── SHIMMER SKELETON ───────────────────────────────────────────────────── */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    rgb(var(--surface-hover)) 25%,
    rgb(var(--surface-elevated)) 50%,
    rgb(var(--surface-hover)) 75%
  );
  background-size: 200% auto;
  animation: shimmer 1.4s ease-in-out infinite;
}

/* ─── GLOW UTILITY CLASSES ───────────────────────────────────────────────── */
.glow-green  { box-shadow: 0 0 1.5rem var(--glow-green);  }
.glow-amber  { box-shadow: 0 0 1.5rem var(--glow-amber);  }
.glow-cyan   { box-shadow: 0 0 1.5rem var(--glow-cyan);   }
.glow-red    { box-shadow: 0 0 1.5rem var(--glow-red);    }
.glow-blue   { box-shadow: 0 0 1.5rem var(--glow-blue);   }
.glow-purple { box-shadow: 0 0 1.5rem var(--glow-purple); }

/* ─── FOCUS RING PREMIUM ─────────────────────────────────────────────────── */
.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgb(var(--surface-base)), 0 0 0 4px rgba(255,193,87,0.4);
}

/* ─── CARD INTERACTIVE ───────────────────────────────────────────────────── */
.card-interactive {
  transition: transform 200ms cubic-bezier(0.4,0,0.2,1),
              box-shadow 200ms cubic-bezier(0.4,0,0.2,1),
              border-color 200ms cubic-bezier(0.4,0,0.2,1);
}
.card-interactive:hover {
  transform: translateY(-0.0625rem);
}

/* ─── PAGE ENTER — animação de entrada staggered ────────────────────────── */
.page-enter {
  animation: fade-scale 0.25s cubic-bezier(0.4,0,0.2,1) both;
}
.page-enter > * {
  animation: fade-up 0.35s cubic-bezier(0.4,0,0.2,1) both;
}
.page-enter > *:nth-child(1)  { animation-delay:  20ms; }
.page-enter > *:nth-child(2)  { animation-delay:  50ms; }
.page-enter > *:nth-child(3)  { animation-delay:  80ms; }
.page-enter > *:nth-child(4)  { animation-delay: 110ms; }
.page-enter > *:nth-child(5)  { animation-delay: 140ms; }
.page-enter > *:nth-child(6)  { animation-delay: 170ms; }
.page-enter > *:nth-child(7)  { animation-delay: 200ms; }
.page-enter > *:nth-child(8)  { animation-delay: 230ms; }
.page-enter > *:nth-child(9)  { animation-delay: 260ms; }
.page-enter > *:nth-child(10) { animation-delay: 290ms; }

/* ─── SHELL DEFAULTS (light) ────────────────────────────────────────────── */
.sidebar-shell     { background: rgb(var(--surface-card)); }
.topbar-shell      { background: rgb(var(--surface-card)); box-shadow: 0 1px 0 rgba(0,0,0,0.06); }
.rightsidebar-shell { background: rgb(var(--surface-card)); }

/* ─── DARK MODE — shell overrides ────────────────────────────────────────── */
.dark .sidebar-shell     { background: rgb(var(--surface-card)); border-color: rgb(var(--surface-border)); }
.dark .topbar-shell      { background: rgb(var(--surface-card)); border-color: rgb(var(--surface-border)); box-shadow: none; }
.dark .rightsidebar-shell { background: rgb(var(--surface-card)); border-color: rgb(var(--surface-border)); }

/* ─── CARD SHADOW — global (light has shadow, dark uses border) ─────────── */
.card-shadow {
  box-shadow: 0 1px 2px rgba(17,17,40,0.04), 0 4px 16px rgba(17,17,40,0.10);
  transition: box-shadow 200ms ease;
}
.card-shadow:hover {
  box-shadow: 0 4px 20px rgba(17,17,40,0.14), 0 2px 8px rgba(17,17,40,0.07);
}
.dark .card-shadow { box-shadow: none; }
.card-interactive:hover {
  box-shadow: 0 8px 16px rgba(0,0,0,0.08);
}
.dark .card-interactive:hover { box-shadow: none; }

/* ─── PANEL SLIDE-IN — drawers laterais ────────────────────────────────── */
@keyframes panel-slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
.panel-slide-in {
  animation: panel-slide-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
}

/* ─── BENTO DRAGGING ─────────────────────────────────────────────────────── */
.bento-dragging {
  opacity: 0.85;
  transform: scale(1.015);
  box-shadow: 0 1.5rem 3rem rgba(0,0,0,0.4);
  z-index: 999;
}

/* ─── REACT-GRID-LAYOUT OVERRIDES ───────────────────────────────────────── */
.react-grid-item.react-grid-placeholder {
  background: rgba(255,177,0,0.08) !important;
  border: 2px dashed rgba(255,177,0,0.35) !important;
  border-radius: 0.75rem !important;
  opacity: 1 !important;
}
.react-grid-item > .react-resizable-handle {
  opacity: 0;
  transition: opacity 150ms;
}
.react-grid-item:hover > .react-resizable-handle {
  opacity: 0.4;
}
.react-grid-item > .react-resizable-handle::after {
  border-color: rgb(var(--ink-muted)) !important;
}

/* ─── LEAFLET PREMIUM ─────────────────────────────────────────────────────── */
.leaflet-popup-content-wrapper {
  background: rgb(var(--surface-elevated)) !important;
  border: 1px solid rgb(var(--surface-border)) !important;
  border-radius: 0.5rem !important;
  color: rgb(var(--ink-primary)) !important;
  font-size: 0.8125rem !important;
  box-shadow: 0 0.5rem 2rem rgba(0,0,0,0.5) !important;
}
.leaflet-popup-tip { background: rgb(var(--surface-elevated)) !important; }
.leaflet-container { background: rgb(var(--surface-base)) !important; border-radius: 0.75rem !important; }
.leaflet-control-zoom a {
  background: rgb(var(--surface-card)) !important;
  color: rgb(var(--ink-secondary)) !important;
  border-color: rgb(var(--surface-border)) !important;
}
.leaflet-control-zoom a:hover { background: rgb(var(--surface-hover)) !important; }
.dark .leaflet-container { background: #0a0a0b !important; }
@keyframes map-pulse { 0%,100% { opacity: 0.75; } 50% { opacity: 0.35; } }
.map-pulse { animation: map-pulse 2s ease-in-out infinite; }
```

### `app\layout.tsx`

```tsx
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Toaster } from 'sonner';
import './globals.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export const metadata: Metadata = {
  title: 'Adsgator Hub',
  description: 'Sistema operacional interno da agência Adsgator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### `app\page.tsx`

```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
```

### `app\(app)\ajuda\page.tsx`

```tsx
﻿'use client';

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
```

### `app\(app)\analytics\page.tsx`

```tsx
﻿'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  BarChart2, TrendingUp, ArrowUpRight, RefreshCw,
  MousePointerClick, DollarSign, AlertTriangle,
  Users, Globe, Zap, Calendar, ChevronDown,
} from 'lucide-react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  BarChart,
} from 'recharts'
import { MainLayout }  from '@/components/layout/MainLayout'
import { supabase }    from '@/lib/supabase'
import { toast } from 'sonner'
import type { AnalyticsSnapshot, Cliente } from '@/lib/types'

// Novos componentes analytics
import { AdsOverviewKpis } from '@/components/analytics/AdsOverviewKpis'
import { SearchTermsTable } from '@/components/analytics/SearchTermsTable'
import { DemographicsCard } from '@/components/analytics/DemographicsCard'
import { GeographyBreakdown } from '@/components/analytics/GeographyBreakdown'
import { DeviceBreakdown } from '@/components/analytics/DeviceBreakdown'
import { GA4Panel } from '@/components/analytics/GA4Panel'
import { TrafficSources } from '@/components/analytics/TrafficSources'
import { AnalyticsMap } from '@/components/analytics/AnalyticsMap'

const fmt  = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
const fmtN = (v: number) => new Intl.NumberFormat('pt-BR').format(v)

function conv(v: number | null) {
  if (!v) return '0'
  return Number.isInteger(v) ? String(v) : `${v.toFixed(1)}*`
}

interface ClienteSnap {
  cliente:   Cliente
  snapshots: AnalyticsSnapshot[]
  ultimo:    AnalyticsSnapshot | null
}

type Periodo = '7d' | '30d' | '90d'

interface LiveAnalyticsData {
  googleAds: {
    enabled: boolean
    campanhas: Array<{
      campanha_id: string
      campanha_nome: string
      impressoes: number
      cliques: number
      ctr: number
      custo_total: number
      conversoes: number
      cpa: number
      roas: number
    }>
    termosPesquisa: Array<{
      termo: string
      impressoes: number
      cliques: number
      ctr: number
      conversoes: number
      custo: number
    }>
    demografia: Array<{
      faixa_etaria: string
      genero: string
      impressoes: number
      cliques: number
      conversoes: number
      custo: number
    }>
    geografia: Array<{
      pais: string
      estado: string
      cidade: string
      impressoes: number
      cliques: number
      conversoes: number
      custo: number
    }>
    device: Array<{
      device: string
      impressoes: number
      cliques: number
      ctr: number
      conversoes: number
      custo: number
    }>
  }
  ga4: {
    enabled: boolean
    dados: {
      sessoes: number
      usuarios_novos: number
      visualizacoes_pagina: number
      taxa_engajamento: number
      duracao_media_sessao: number
      taxa_rejeicao: number
      conversoes: number
      valor_conversao_total: number
    } | null
    paginasTop: Array<{
      pagina: string
      visualizacoes: number
      usuarios_unicos: number
      taxa_engajamento: number
      tempo_medio_segundos: number
    }>
    fontesTrafego: Array<{
      fonte: string
      midia: string
      sessoes: number
      conversoes: number
      taxa_conversao: number
    }>
    geografia: Array<{
      pais: string
      estado: string
      cidade: string
      sessoes: number
      usuarios: number
      taxa_engajamento: number
    }>
    device: Array<{
      device: string
      sistema_operacional: string
      sessoes: number
      usuarios: number
      taxa_engajamento: number
    }>
  }
}

export default function AnalyticsPage() {
  const [dados,    setDados]    = useState<ClienteSnap[]>([])
  const [loading,  setLoading]  = useState(true)
  const [clienteSel, setClienteSel] = useState<string>('')
  const [alertas,  setAlertas]  = useState<{ id: string; tipo: string; mensagem: string }[]>([])
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [liveData, setLiveData] = useState<LiveAnalyticsData | null>(null)
  const [loadingLive, setLoadingLive] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    const [{ data: clientes }, { data: snaps }, { data: alertasDb }] = await Promise.all([
      supabase.from('clientes').select('*').in('status', ['ativo', 'onboarding', 'setup_trafego']),
      supabase.from('analytics_snapshots').select('*').order('periodo_fim', { ascending: false }).limit(500),
      supabase.from('alertas').select('id, tipo, mensagem').eq('resolvido', false).order('created_at', { ascending: false }).limit(10),
    ])

    const cl    = (clientes ?? []) as Cliente[]
    const snAll = (snaps    ?? []) as AnalyticsSnapshot[]

    const resultado: ClienteSnap[] = cl.map((c) => {
      const csn = snAll.filter((s) => s.cliente_id === c.id).sort((a, b) => b.periodo_fim.localeCompare(a.periodo_fim))
      return { cliente: c, snapshots: csn, ultimo: csn[0] ?? null }
    })

    setDados(resultado)
    setAlertas((alertasDb ?? []) as { id: string; tipo: string; mensagem: string }[])
    if (!clienteSel && resultado.length > 0) setClienteSel(resultado[0].cliente.id)
    setLoading(false)
  }, [clienteSel])

  useEffect(() => { carregar() }, [carregar])

  // Buscar dados live quando cliente ou período mudar
  const carregarLive = useCallback(async () => {
    if (!clienteSel) return
    setLoadingLive(true)
    try {
      const res = await fetch(`/api/analytics/${clienteSel}/live?periodo=${periodo}`)
      if (res.ok) {
        const data = await res.json()
        setLiveData(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados live:', error)
      toast.error('Erro ao carregar dados em tempo real')
    } finally {
      setLoadingLive(false)
    }
  }, [clienteSel, periodo])

  useEffect(() => {
    carregarLive()
  }, [carregarLive])

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(carregarLive, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [carregarLive])

  // ── KPIs agregados ────────────────────────────────────────────────
  const totais = dados.reduce((acc, { ultimo: u }) => {
    if (!u) return acc
    return {
      invest:     acc.invest     + (u.investimento ?? 0),
      cliques:    acc.cliques    + (u.cliques      ?? 0),
      impressoes: acc.impressoes + (u.impressoes   ?? 0),
      conversoes: acc.conversoes + (u.conversoes   ?? 0),
      sessoes:    acc.sessoes    + (u.sessoes      ?? 0),
    }
  }, { invest: 0, cliques: 0, impressoes: 0, conversoes: 0, sessoes: 0 })

  const ctrMedio = totais.impressoes > 0 ? (totais.cliques / totais.impressoes) * 100 : 0
  const cpaMedio = totais.conversoes > 0 ? totais.invest / totais.conversoes : 0

  // ── Cliente selecionado ───────────────────────────────────────────
  const selData    = dados.find((d) => d.cliente.id === clienteSel)
  const chartData  = (selData?.snapshots ?? []).slice(0, 12).reverse().map((s) => ({
    mes:         s.periodo_fim.slice(0, 7),
    invest:      Math.round(s.investimento ?? 0),
    conversoes:  s.conversoes ?? 0,
    sessoes:     s.sessoes ?? 0,
  }))

  // ── GA4 — top tráfego por cliente ────────────────────────────────
  const ga4Data = dados
    .filter((d) => (d.ultimo?.sessoes ?? 0) > 0)
    .map((d) => ({ nome: d.cliente.nome.split(' ')[0], sessoes: d.ultimo?.sessoes ?? 0 }))
    .sort((a, b) => b.sessoes - a.sessoes)
    .slice(0, 6)

  // Agregar dados live para KPIs
  const liveKpiData = liveData?.googleAds?.campanhas?.reduce((acc, c) => ({
    impressoes: acc.impressoes + (c.impressoes || 0),
    cliques: acc.cliques + (c.cliques || 0),
    custo_total: acc.custo_total + (c.custo_total || 0),
    conversoes: acc.conversoes + (c.conversoes || 0),
  }), { impressoes: 0, cliques: 0, custo_total: 0, conversoes: 0 }) || { impressoes: 0, cliques: 0, custo_total: 0, conversoes: 0 }

  const liveCtr = liveKpiData.impressoes > 0 ? (liveKpiData.cliques / liveKpiData.impressoes) * 100 : 0
  const liveCpa = liveKpiData.conversoes > 0 ? liveKpiData.custo_total / liveKpiData.conversoes : 0

  const periodoLabel: Record<Periodo, string> = {
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    '90d': 'Últimos 90 dias',
  }

  return (
    <MainLayout
      title="Analytics"
      subtitle={selData ? `Cliente: ${selData.cliente.nome}` : 'Selecione um cliente para ver detalhes'}
      actions={
        <div className="flex items-center gap-[0.5rem]">
          {/* Pills de período */}
          <div className="flex bg-surface-hover border border-surface-border rounded-[0.5rem] p-[0.1875rem] gap-[0.125rem]">
            {(['7d', '30d', '90d'] as Periodo[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`h-[1.625rem] px-[0.625rem] rounded-[0.3125rem] text-[0.75rem] font-medium transition-all ${
                  periodo === p
                    ? 'bg-surface-card text-ink-primary shadow-sm'
                    : 'text-ink-muted hover:text-ink-secondary'
                }`}
              >
                {p === '7d' ? '7d' : p === '30d' ? '30d' : '90d'}
              </button>
            ))}
          </div>
          <button
            onClick={() => { carregar(); carregarLive(); }}
            disabled={loading || loadingLive}
            className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary hover:text-ink-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-[0.875rem] h-[0.875rem] ${loading || loadingLive ? 'animate-spin' : ''}`} strokeWidth={1.75} />
          </button>
        </div>
      }
    >
      <div className="page-enter">
      {/* ══ SEÇÃO 1 — KPI RESUMO GERAL ════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1rem] mb-[2rem]">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[6rem] rounded-xl skeleton-shimmer dark:border dark:border-surface-border" />)
          : [
              { label: 'Investimento Total', valor: fmt(totais.invest),   icon: DollarSign,       cor: 'text-status-blue'   },
              { label: 'Conversões',         valor: conv(totais.conversoes), icon: ArrowUpRight,  cor: 'text-ads-500',       sub: '* fracionadas' },
              { label: 'CTR Médio',          valor: `${ctrMedio.toFixed(2)}%`, icon: MousePointerClick, cor: 'text-status-purple' },
              { label: 'CPA Médio',          valor: fmt(cpaMedio),         icon: TrendingUp,       cor: 'text-status-orange' },
            ].map(({ label, valor, icon: Icon, cor, sub }) => (
              <div key={label} className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow px-[1.25rem] py-[1rem]">
                <div className="flex items-start justify-between mb-[0.375rem]">
                  <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">{label}</p>
                  <Icon className={`w-[0.875rem] h-[0.875rem] ${cor}`} strokeWidth={1.5} />
                </div>
                <p className={`text-[1.625rem] font-bold leading-none ${cor}`}>{valor}</p>
                {sub && <p className="text-ink-muted text-[0.625rem] mt-[0.25rem]">{sub}</p>}
              </div>
            ))
        }
      </div>

      {/* ══ SEÇÃO 2 — SELETOR DE CLIENTE (pills) ═══════════════════ */}
      {!loading && dados.length > 0 && (
        <div className="flex items-center gap-[0.375rem] flex-wrap mb-[1.5rem]">
          <span className="text-ink-muted text-[0.75rem] font-medium mr-[0.25rem]">Cliente:</span>
          {dados.map(({ cliente: c, ultimo: u }) => {
            const ativo = (u?.investimento ?? 0) > 0
            return (
              <button
                key={c.id}
                onClick={() => setClienteSel(c.id)}
                className={`flex items-center gap-[0.375rem] h-[1.875rem] px-[0.75rem] rounded-full text-[0.8125rem] font-medium transition-all ${
                  clienteSel === c.id
                    ? 'bg-ads-500 text-white shadow-md shadow-ads-500/20'
                    : 'bg-surface-card border border-surface-border text-ink-secondary hover:border-ads-500/40 hover:text-ink-primary'
                }`}
              >
                <span className={`w-[0.375rem] h-[0.375rem] rounded-full shrink-0 ${ativo ? 'bg-status-green' : 'bg-ink-muted'}`} />
                {c.nome.split(' ')[0]}
              </button>
            )
          })}
        </div>
      )}
      {loading && <div className="h-[2rem] mb-[1.5rem] skeleton-shimmer rounded-full w-[60%]" />}

      {/* ══ SEÇÃO 3 — DETALHE POR CAMPANHA ════════════════════════════ */}
      {selData && (
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem] mb-[2rem]">
          <div className="flex items-center justify-between mb-[1.25rem]">
            <div>
              <h2 className="text-ink-primary font-semibold text-[0.9375rem]">
                Evolução — {selData.cliente.nome}
              </h2>
              <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">{periodoLabel[periodo]}</p>
            </div>
            <a
              href={`/clientes/${selData.cliente.id}`}
              className="text-ads-500 text-[0.8125rem] hover:underline"
            >
              Ver cliente →
            </a>
          </div>

          {chartData.length > 1 ? (
            <div className="h-[14rem]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '0.625rem', fontSize: '0.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                    labelStyle={{ color: 'var(--ink-primary)', fontWeight: 600, marginBottom: '0.25rem' }}
                    formatter={(v: unknown, name: unknown) => { const n = name as string; const val = Number(v); return [n === 'invest' ? fmt(val) : fmtN(val), n === 'invest' ? 'Investimento' : 'Conversões'] as [string, string] }}
                  />
                  <Legend formatter={(v) => v === 'invest' ? 'Investimento' : 'Conversões'} wrapperStyle={{ fontSize: '0.75rem' }} />
                  <Bar  yAxisId="left"  dataKey="invest"     fill="#3B82F6" opacity={0.75} radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" dataKey="conversoes" stroke="#FFA500" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#FFA500' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-ink-muted text-[0.875rem] italic text-center py-[2rem]">Snapshots insuficientes para gerar gráfico.</p>
          )}

          {/* Tabela de campanhas live */}
          {liveData?.googleAds.enabled && liveData.googleAds.campanhas.length > 0 && (
            <div className="mt-[1.5rem]">
              <h3 className="text-ink-primary font-semibold text-[0.875rem] mb-[0.75rem]">Campanhas ativas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[0.8125rem]">
                  <thead>
                    <tr className="border-b border-surface-border">
                      {['Campanha', 'Impressões', 'Cliques', 'CTR', 'Custo', 'Conv.', 'CPA'].map((h) => (
                        <th key={h} className="text-left pb-[0.625rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {liveData.googleAds.campanhas.map((c) => (
                      <tr key={c.campanha_id} className="border-b border-surface-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                        <td className="py-[0.625rem] pr-[1rem] text-ink-primary font-medium max-w-[12rem] truncate">{c.campanha_nome}</td>
                        <td className="py-[0.625rem] pr-[1rem] text-ink-secondary">{fmtN(c.impressoes)}</td>
                        <td className="py-[0.625rem] pr-[1rem] text-ink-secondary">{fmtN(c.cliques)}</td>
                        <td className="py-[0.625rem] pr-[1rem]">
                          <span className={`font-semibold ${c.ctr > 5 ? 'text-status-green' : c.ctr > 2 ? 'text-ads-500' : 'text-ink-secondary'}`}>
                            {c.ctr.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-[0.625rem] pr-[1rem] text-status-blue font-medium">{fmt(c.custo_total)}</td>
                        <td className="py-[0.625rem] pr-[1rem] text-ink-secondary">{conv(c.conversoes)}</td>
                        <td className="py-[0.625rem]">
                          <span className={`font-semibold ${c.cpa > 200 ? 'text-status-orange' : 'text-status-green'}`}>
                            {c.conversoes > 0 ? fmt(c.cpa) : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ SEÇÃO 4 — LIVE ANALYTICS PREMIUM ═════════════════════════ */}
      {selData && liveData && (
        <div className="mb-[2rem]">
          <div className="flex items-center justify-between mb-[1rem]">
            <h2 className="text-ink-primary font-bold text-base">
              Dados ao vivo — {periodoLabel[periodo]}
            </h2>
            {loadingLive && (
              <span className="text-xs text-ads-500 animate-pulse">Atualizando...</span>
            )}
          </div>

          {/* Google Ads KPIs */}
          {liveData.googleAds.enabled && (
            <div className="mb-[1rem]">
              <h3 className="text-[0.875rem] font-medium text-ink-muted mb-[0.75rem]">Google Ads</h3>
              <AdsOverviewKpis
                data={{
                  ...liveKpiData,
                  ctr: liveCtr,
                  cpa: liveCpa,
                  roas: liveKpiData.conversoes > 0 ? liveKpiData.custo_total / liveKpiData.conversoes : 0,
                }}
                loading={loadingLive}
              />
            </div>
          )}

          {/* GA4 KPIs */}
          {liveData.ga4.enabled && liveData.ga4.dados && (
            <div className="mb-[1rem]">
              <h3 className="text-[0.875rem] font-medium text-ink-muted mb-[0.75rem]">Google Analytics 4</h3>
              <GA4Panel data={liveData.ga4.dados} loading={loadingLive} />
            </div>
          )}

          {/* Grid de detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1rem]">
            {/* Termos de Pesquisa */}
            {liveData.googleAds.enabled && liveData.googleAds.termosPesquisa.length > 0 && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Termos de Pesquisa</h4>
                <SearchTermsTable data={liveData.googleAds.termosPesquisa} loading={loadingLive} maxRows={5} />
              </div>
            )}

            {/* Demografia */}
            {liveData.googleAds.enabled && liveData.googleAds.demografia.length > 0 && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Demografia</h4>
                <DemographicsCard data={liveData.googleAds.demografia} loading={loadingLive} />
              </div>
            )}

            {/* Geografia — mapa + breakdown */}
            {(liveData.googleAds.geografia.length > 0 || liveData.ga4.geografia.length > 0) && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem] lg:col-span-2">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Geografia</h4>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_14rem] gap-[1rem]">
                  <AnalyticsMap
                    data={liveData.ga4.enabled ? liveData.ga4.geografia : liveData.googleAds.geografia}
                    loading={loadingLive}
                    metric={liveData.ga4.enabled ? 'sessoes' : 'cliques'}
                  />
                  <GeographyBreakdown
                    data={liveData.ga4.enabled ? liveData.ga4.geografia : liveData.googleAds.geografia}
                    loading={loadingLive}
                    title={liveData.ga4.enabled ? 'Top estados' : 'Cliques por estado'}
                  />
                </div>
              </div>
            )}

            {/* Dispositivos */}
            {(liveData.googleAds.device.length > 0 || liveData.ga4.device.length > 0) && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Dispositivos</h4>
                <DeviceBreakdown
                  data={liveData.ga4.enabled ? liveData.ga4.device : liveData.googleAds.device}
                  loading={loadingLive}
                />
              </div>
            )}

            {/* Fontes de Tráfego */}
            {liveData.ga4.enabled && liveData.ga4.fontesTrafego.length > 0 && (
              <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem] lg:col-span-2">
                <h4 className="text-[0.875rem] font-medium text-ink-primary mb-[0.75rem]">Fontes de Tráfego</h4>
                <TrafficSources data={liveData.ga4.fontesTrafego} loading={loadingLive} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ SEÇÃO 5 — GA4 TOP TRÁFEGO ═════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] mb-[2rem]">
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
          <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
            <Globe className="w-[0.875rem] h-[0.875rem] text-status-blue" strokeWidth={1.75} />
            <h3 className="text-ink-primary font-semibold text-[0.9375rem]">GA4 — Sessões por Cliente</h3>
          </div>
          {ga4Data.length > 0 ? (
            <div className="h-[10rem]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ga4Data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="nome" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                    formatter={(v: unknown) => [fmtN(Number(v)), 'Sessões'] as [string, string]}
                  />
                  <Bar dataKey="sessoes" fill="#3B82F6" opacity={0.75} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-ink-muted text-[0.875rem] italic">Sem dados GA4 disponíveis.</p>
          )}
        </div>

        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
          <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
            <Users className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={1.75} />
            <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Métricas GA4</h3>
          </div>
          <div className="flex flex-col gap-[0.625rem]">
            {dados.filter((d) => d.ultimo?.sessoes).slice(0, 5).map(({ cliente: c, ultimo: u }) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-ink-secondary text-[0.8125rem] truncate max-w-[10rem]">{c.nome}</span>
                <div className="flex items-center gap-[1rem] text-[0.75rem]">
                  <span className="text-ink-muted">{fmtN(u?.sessoes ?? 0)} sess.</span>
                  <span className="text-ink-muted">{((u?.taxa_conversao ?? 0) * 100).toFixed(1)}% conv.</span>
                  <span className="text-status-green font-medium">{fmtN(u?.usuarios ?? 0)} usr</span>
                </div>
              </div>
            ))}
            {dados.filter((d) => d.ultimo?.sessoes).length === 0 && (
              <p className="text-ink-muted text-[0.875rem] italic">Sem dados GA4 disponíveis.</p>
            )}
          </div>
        </div>
      </div>

      {/* ══ SEÇÃO 5 — ALERTAS EM TEMPO REAL ═══════════════════════════ */}
      {alertas.length > 0 && (
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
          <div className="flex items-center gap-[0.5rem] mb-[1rem]">
            <AlertTriangle className="w-[0.875rem] h-[0.875rem] text-status-orange" strokeWidth={2} />
            <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Alertas em Tempo Real</h3>
            <span className="ml-auto text-[0.6875rem] font-semibold bg-status-orange/15 text-status-orange px-[0.375rem] py-[0.0625rem] rounded-full">{alertas.length}</span>
          </div>
          <div className="flex flex-col gap-[0.5rem]">
            {alertas.map((a) => (
              <div key={a.id} className="flex items-start gap-[0.625rem] p-[0.625rem] rounded-lg bg-status-orange/10">
                <Zap className="w-[0.75rem] h-[0.75rem] text-status-orange mt-[0.125rem] shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[0.8125rem] font-semibold text-status-orange leading-tight">{a.tipo}</p>
                  <p className="text-[0.75rem] text-ink-secondary">{a.mensagem}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-ink-muted text-[0.625rem] mt-[0.75rem]">* Conversões fracionadas = data-driven attribution do Google Ads</p>
        </div>
      )}

      {dados.length === 0 && !loading && (
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[4rem] text-center">
          <BarChart2 className="w-[3rem] h-[3rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
          <h3 className="text-ink-primary font-semibold text-[1rem] mb-[0.5rem]">Sem dados ainda</h3>
          <p className="text-ink-secondary text-[0.875rem] max-w-[24rem] mx-auto">
            Cadastre clientes e aguarde a sincronização dos snapshots de analytics.
          </p>
        </div>
      )}
      </div>
    </MainLayout>
  )
}
```

### `app\(app)\biblioteca\page.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import { Copy, CheckCheck, Eye, BookOpen, Wrench, Download, Sparkles } from 'lucide-react';
import {
  BIBLIOTECA_COMPONENTES,
  obterCategorias,
  type AstroComponente,
  type CategoriaAstro,
} from '@/lib/astro-components';
import {
  gerarManifestoProducao,
  downloadManifestoMD,
  type PaletaCores,
} from '@/lib/manifesto-generator';
import { MainLayout } from '@/components/layout/MainLayout';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

interface BuilderState {
  nomeCliente:             string;
  nicho:                   string;
  estilo:                  string;
  direcaoArte:             string;
  paleta:                  PaletaCores;
  componentesSelecionados: string[];
  copy:                    Record<string, string>;
}

type Aba = 'biblioteca' | 'construtor';

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function BibliotecaPage() {
  const [aba, setAba] = useState<Aba>('biblioteca');

  return (
    <MainLayout
      title="Biblioteca Astro"
      subtitle="Componentes prontos para landing pages + gerador de manifesto de produção"
    >
      {/* TABS */}
      <div className="flex gap-[0.25rem] mb-[1.5rem] bg-surface-hover p-[0.25rem] rounded-lg w-fit">
        {([
          { id: 'biblioteca' as Aba, label: 'Biblioteca', icon: BookOpen },
          { id: 'construtor' as Aba, label: 'Construtor',  icon: Wrench  },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`flex items-center gap-[0.5rem] px-[1rem] h-[2.25rem] rounded text-[0.875rem] font-medium transition-colors
              ${aba === id
                ? 'bg-surface-card text-ink-primary shadow-sm'
                : 'text-ink-muted hover:text-ink-secondary'}`}
          >
            <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {aba === 'biblioteca' ? <TabBiblioteca /> : <TabConstrutor />}
    </MainLayout>
  );
}

// ─── TAB: BIBLIOTECA ─────────────────────────────────────────────────────────

function TabBiblioteca() {
  const categorias                     = obterCategorias();
  const [categoriaSel, setCategoriaSel] = useState<CategoriaAstro>(categorias[0]);
  const [componenteSel, setComponenteSel] = useState<string>(
    BIBLIOTECA_COMPONENTES.find((c) => c.categoria === categorias[0])?.id ?? ''
  );
  const [mostrandoCodigo, setMostrandoCodigo] = useState(false);
  const [copiado, setCopiado]                 = useState(false);

  const componentesDaCategoria = BIBLIOTECA_COMPONENTES.filter((c) => c.categoria === categoriaSel);
  const comp: AstroComponente | undefined = BIBLIOTECA_COMPONENTES.find((c) => c.id === componenteSel);

  async function copiarCodigo() {
    if (!comp) return;
    await navigator.clipboard.writeText(comp.codigo_astro);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  if (!comp) return null;

  return (
    <div className="grid grid-cols-4 gap-[1.5rem]">
      {/* SIDEBAR */}
      <div className="bg-surface-card rounded-lg border border-surface-border p-[1rem] h-fit sticky top-[1rem]">
        <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.75rem]">
          Categorias
        </p>
        <div className="flex flex-col gap-[0.125rem] mb-[1.25rem]">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoriaSel(cat);
                const primeiro = BIBLIOTECA_COMPONENTES.find((c) => c.categoria === cat);
                if (primeiro) setComponenteSel(primeiro.id);
              }}
              className={`w-full text-left px-[0.75rem] h-[2rem] rounded text-[0.875rem] font-medium transition-colors
                ${categoriaSel === cat
                  ? 'bg-ads-500/15 text-ads-500'
                  : 'text-ink-secondary hover:bg-surface-hover'}`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.5rem]">
          {categoriaSel.replace(/_/g, ' ')}
        </p>
        <div className="flex flex-col gap-[0.125rem]">
          {componentesDaCategoria.map((c) => (
            <button
              key={c.id}
              onClick={() => setComponenteSel(c.id)}
              className={`w-full text-left px-[0.75rem] h-[2rem] rounded text-[0.75rem] font-medium transition-colors
                ${componenteSel === c.id
                  ? 'bg-surface-hover text-ink-primary'
                  : 'text-ink-muted hover:bg-surface-hover'}`}
            >
              {c.nome}
            </button>
          ))}
        </div>
      </div>

      {/* PAINEL PRINCIPAL */}
      <div className="col-span-3 flex flex-col gap-[1rem]">
        {/* Meta */}
        <div className="bg-surface-card rounded-lg border border-surface-border px-[1.5rem] py-[1.25rem]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-ink-primary font-semibold text-[1.125rem]">{comp.nome}</h2>
              <p className="text-ink-secondary text-[0.875rem]">{comp.descricao}</p>
            </div>
            <span className="bg-surface-hover text-ink-muted text-[0.75rem] font-medium px-[0.5rem] py-[0.25rem] rounded">
              v{comp.versao}
            </span>
          </div>
          <div className="flex gap-[0.375rem] flex-wrap mt-[0.875rem]">
            {comp.variacoes.map((v) => (
              <span key={v} className="bg-surface-hover text-ink-muted text-[0.75rem] font-medium px-[0.5rem] py-[0.125rem] rounded">
                {v}
              </span>
            ))}
          </div>
        </div>

        {/* Código / Recomendações */}
        <div className="bg-surface-card rounded-lg border border-surface-border overflow-hidden">
          <div className="flex items-center justify-between px-[1.25rem] py-[0.75rem] border-b border-surface-border">
            <div className="flex items-center gap-[0.5rem]">
              <Eye className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.5} />
              <p className="text-ink-primary text-[0.875rem] font-medium">
                {mostrandoCodigo ? 'Código Astro' : 'Recomendações'}
              </p>
            </div>
            <button
              onClick={() => setMostrandoCodigo(!mostrandoCodigo)}
              className="text-[0.75rem] font-semibold text-ink-secondary hover:text-ink-primary transition-colors"
            >
              {mostrandoCodigo ? 'Ver recomendações' : 'Ver código'}
            </button>
          </div>

          {mostrandoCodigo ? (
            <div className="relative">
              <pre className="bg-surface-base text-[0.75rem] font-mono text-ink-secondary p-[1.25rem] overflow-x-auto max-h-[28rem]">
                {comp.codigo_astro}
              </pre>
              <button
                onClick={copiarCodigo}
                className={`absolute top-[0.75rem] right-[0.75rem] flex items-center gap-[0.375rem] text-xs font-semibold px-[0.625rem] h-[1.75rem] rounded transition-all
                  ${copiado
                    ? 'bg-ads-500/20 text-ads-500'
                    : 'bg-surface-hover text-ink-secondary hover:text-ink-primary border border-surface-border'}`}
              >
                {copiado
                  ? <><CheckCheck className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} /> Copiado!</>
                  : <><Copy className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} /> Copiar</>}
              </button>
            </div>
          ) : (
            <div className="p-[1.25rem]">
              <ul className="flex flex-col gap-[0.5rem]">
                {comp.recomendacoes.map((rec, i) => (
                  <li key={i} className="flex items-start gap-[0.5rem]">
                    <CheckCheck className="w-[0.75rem] h-[0.75rem] text-ads-500 mt-[0.0625rem] shrink-0" strokeWidth={2.5} />
                    <span className="text-ink-secondary text-[0.875rem]">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: CONSTRUTOR ─────────────────────────────────────────────────────────

function TabConstrutor() {
  const [builder, setBuilder] = useState<BuilderState>({
    nomeCliente: '', nicho: '', estilo: 'minimalista', direcaoArte: '',
    paleta: { primaria: '#10b981', secundaria: '#6366f1', backgrounds: ['#0f0f0f', '#1a1a1a'] },
    componentesSelecionados: [],
    copy: {},
  });
  const [gerando,      setGerando]      = useState(false);
  const [gerado,        setGerado]        = useState(false);
  const [gerandoCopy,   setGerandoCopy]   = useState(false);
  const [copyGerada,    setCopyGerada]    = useState<Record<string, string> | null>(null);

  async function gerarCopyIA() {
    if (!builder.nomeCliente || !builder.nicho) return;
    setGerandoCopy(true);
    try {
      const res  = await fetch('/api/ia/copy', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          nomeCliente: builder.nomeCliente,
          nicho:       builder.nicho,
          estilo:      builder.estilo,
          direcaoArte: builder.direcaoArte,
        }),
      });
      const json = await res.json() as { copy?: Record<string, string> };
      if (json.copy) {
        setCopyGerada(json.copy);
        setBuilder((prev) => ({ ...prev, copy: json.copy! }));
      }
    } catch (e) { console.error(e); }
    finally { setGerandoCopy(false); }
  }

  const categorias = obterCategorias();

  function toggleComponente(id: string) {
    setBuilder((prev) => ({
      ...prev,
      componentesSelecionados: prev.componentesSelecionados.includes(id)
        ? prev.componentesSelecionados.filter((c) => c !== id)
        : [...prev.componentesSelecionados, id],
    }));
  }

  async function gerarManifesto() {
    setGerando(true);
    try {
      const manifesto = gerarManifestoProducao(
        builder.nomeCliente, builder.nicho, builder.paleta,
        builder.estilo, builder.direcaoArte,
        builder.componentesSelecionados, builder.copy,
      );
      downloadManifestoMD(manifesto);
      setGerado(true);
      setTimeout(() => setGerado(false), 3000);
    } finally {
      setGerando(false);
    }
  }

  const valido =
    builder.nomeCliente.trim() !== '' &&
    builder.nicho.trim()        !== '' &&
    builder.componentesSelecionados.length > 0;

  return (
    <div className="grid grid-cols-3 gap-[1.5rem]">
      {/* CONFIGURAÇÃO */}
      <div className="bg-surface-card rounded-lg border border-surface-border p-[1.25rem] h-fit sticky top-[1rem]">
        <p className="text-ink-primary font-semibold text-[1rem] mb-[1.25rem]">
          Configurações
        </p>

        {([
          { label: 'Nome do Cliente *', key: 'nomeCliente' as const, placeholder: 'Ex: João Psicologia' },
          { label: 'Nicho *',           key: 'nicho'       as const, placeholder: 'Ex: Psicologia'       },
          { label: 'Direção de Arte',   key: 'direcaoArte' as const, placeholder: 'Ex: moderna, tons earth' },
        ]).map(({ label, key, placeholder }) => (
          <div key={key} className="mb-[1rem]">
            <label className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold block mb-[0.375rem]">
              {label}
            </label>
            <input
              type="text"
              value={builder[key]}
              onChange={(e) => setBuilder({ ...builder, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full h-[2.25rem] px-[0.75rem] rounded bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/40 focus:border-ads-500 transition-colors"
            />
          </div>
        ))}

        <div className="mb-[1rem]">
          <label className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold block mb-[0.375rem]">
            Estilo Visual
          </label>
          <select
            value={builder.estilo}
            onChange={(e) => setBuilder({ ...builder, estilo: e.target.value })}
            className="w-full h-[2.25rem] px-[0.75rem] rounded bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/40 focus:border-ads-500 transition-colors"
          >
            {['minimalista', 'corporativo', 'criativo', 'sofisticado'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="mb-[1.5rem]">
          <label className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold block mb-[0.375rem]">
            Cor Primária
          </label>
          <div className="flex gap-[0.5rem] items-center">
            <input
              type="color"
              value={builder.paleta.primaria}
              onChange={(e) => setBuilder({ ...builder, paleta: { ...builder.paleta, primaria: e.target.value } })}
              className="w-[2.25rem] h-[2.25rem] rounded cursor-pointer border-0 p-[0.125rem]"
            />
            <input
              type="text"
              value={builder.paleta.primaria}
              onChange={(e) => setBuilder({ ...builder, paleta: { ...builder.paleta, primaria: e.target.value } })}
              className="flex-1 h-[2.25rem] px-[0.75rem] rounded bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] font-mono focus:outline-none focus:ring-2 focus:ring-ads-500/40 focus:border-ads-500 transition-colors"
            />
          </div>
        </div>

        {/* BOTÃO GERAR COPY IA */}
        {builder.nomeCliente && builder.nicho && (
          <button
            onClick={gerarCopyIA}
            disabled={gerandoCopy}
            className="w-full flex items-center justify-center gap-[0.5rem] h-[2.25rem] rounded text-[0.875rem] font-medium bg-status-purple/15 text-status-purple hover:opacity-80 transition-opacity disabled:opacity-50 mb-[0.75rem]"
          >
            {gerandoCopy
              ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <Sparkles className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.5} />
            }
            {copyGerada ? 'Regenerar Copy com IA' : 'Gerar Copy com IA'}
          </button>
        )}

        {copyGerada && (
          <div className="bg-surface-hover rounded border border-surface-border p-[0.75rem] mb-[0.75rem] text-[0.75rem]">
            <p className="text-ink-muted font-semibold uppercase tracking-wide mb-[0.5rem]">Copy gerada</p>
            <p className="text-ink-primary font-semibold mb-[0.25rem]">{copyGerada.headline}</p>
            <p className="text-ink-secondary">{copyGerada.subtitulo}</p>
          </div>
        )}

        {!valido && (
          <p className="text-xs text-status-orange mb-[0.75rem]">
            Preencha nome, nicho e selecione ao menos 1 componente.
          </p>
        )}

        <button
          onClick={gerarManifesto}
          disabled={!valido || gerando}
          className={`w-full flex items-center justify-center gap-[0.5rem] h-[2.5rem] rounded text-[0.875rem] font-semibold transition-all
            ${valido
              ? gerado
                ? 'bg-ads-500/20 text-ads-500'
                : 'bg-ads-500 text-white hover:opacity-90'
              : 'bg-surface-hover text-ink-muted cursor-not-allowed'}`}
        >
          {gerando
            ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
            : gerado
              ? <><CheckCheck className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} /> Manifesto gerado!</>
              : <><Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} /> Gerar Manifesto .md</>
          }
        </button>
      </div>

      {/* SELETOR DE COMPONENTES */}
      <div className="col-span-2">
        <div className="bg-surface-card rounded-lg border border-surface-border p-[1.25rem]">
          <p className="text-ink-primary font-semibold text-[1rem] mb-[1.25rem]">
            Selecione os Componentes
          </p>
          <div className="flex flex-col gap-[1.5rem]">
            {categorias.map((cat) => {
              const comps = BIBLIOTECA_COMPONENTES.filter((c) => c.categoria === cat);
              return (
                <div key={cat}>
                  <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.625rem]">
                    {cat.replace(/_/g, ' ')}
                  </p>
                  <div className="grid grid-cols-2 gap-[0.75rem]">
                    {comps.map((c) => {
                      const sel = builder.componentesSelecionados.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleComponente(c.id)}
                          className={`text-left p-[0.875rem] rounded-lg border-2 transition-all
                            ${sel
                              ? 'bg-ads-500/10 border-ads-500'
                              : 'bg-surface-base border-surface-border hover:border-ads-500/40'}`}
                        >
                          <div className="flex items-center justify-between mb-[0.25rem]">
                            <p className="text-ink-primary font-medium text-[0.875rem]">{c.nome}</p>
                            {sel && (
                              <div className="w-[1rem] h-[1rem] rounded-full bg-ads-500 flex items-center justify-center shrink-0">
                                <CheckCheck className="w-[0.625rem] h-[0.625rem] text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <p className="text-ink-muted text-[0.75rem]">{c.descricao}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {builder.componentesSelecionados.length > 0 && (
            <div className="mt-[1.5rem] pt-[1.25rem] border-t border-surface-border">
              <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.625rem]">
                Estrutura ({builder.componentesSelecionados.length} seções)
              </p>
              <div className="flex flex-col gap-[0.375rem]">
                {builder.componentesSelecionados.map((id, i) => {
                  const c = BIBLIOTECA_COMPONENTES.find((x) => x.id === id);
                  return (
                    <div key={id} className="flex items-center gap-[0.625rem]">
                      <span className="w-[1.25rem] h-[1.25rem] rounded-full bg-ads-500 flex items-center justify-center text-white text-[0.75rem] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-ink-secondary text-[0.875rem]">{c?.nome}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### `app\(app)\clientes\page.tsx`

```tsx
﻿'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Plus, Search, Users, AlertTriangle, Snowflake,
  LayoutGrid, List, MessageCircle,
} from 'lucide-react'
import { MainLayout }                from '@/components/layout/MainLayout'
import { ClienteProgressCard }       from '@/components/dashboard/ClienteProgressCard'
import { WhatsAppTemplateModal }     from '@/components/clientes/WhatsAppTemplateModal'
import { useClientes }               from '@/lib/hooks/useClientes'
import { supabase }                  from '@/lib/supabase'
import type { Cliente }              from '@/lib/types'

const STATUS_OPCOES = [
  { value: '',                 label: 'Todos'          },
  { value: 'recebido',         label: 'Recebido'       },
  { value: 'onboarding',       label: 'Onboarding'     },
  { value: 'setup_trafego',    label: 'Setup Tráfego'  },
  { value: 'ativo',            label: 'Ativo'          },
  { value: 'congelado',        label: 'Congelado'      },
  { value: 'cancelado_debito', label: 'Cancelado D.'   },
  { value: 'cancelado',        label: 'Cancelado'      },
  { value: 'inativo',          label: 'Inativo'        },
] as const

const STATUS_LABEL: Record<string, string> = {
  recebido:         'Recebido',
  onboarding:       'Onboarding',
  setup_trafego:    'Setup Tráfego',
  ativo:            'Ativo',
  congelado:        'Congelado',
  cancelado_debito: 'Cancelado D.',
  cancelado:        'Cancelado',
  inativo:          'Inativo',
}

const STATUS_COLOR: Record<string, string> = {
  ativo:            'bg-status-green/15 text-status-green',
  onboarding:       'bg-status-blue/15 text-status-blue',
  setup_trafego:    'bg-ads-500/15 text-ads-500',
  recebido:         'bg-status-purple/15 text-status-purple',
  congelado:        'bg-status-blue/15 text-status-blue',
  cancelado_debito: 'bg-status-orange/15 text-status-orange',
  cancelado:        'bg-status-red/15 text-status-red',
  inativo:          'bg-surface-hover text-ink-muted',
}

export default function ClientesPage() {
  const { dados, loading, metricas, recarregar } = useClientes()
  const [busca,        setBusca]        = useState('')
  const [filtro,       setFiltro]       = useState('')
  const [modoLista,    setModoLista]    = useState(false)
  const [whatsappCliente, setWhatsappCliente] = useState<Cliente | null>(null)

  async function handleCongelar(id: string) {
    await supabase.from('clientes').update({ status: 'congelado' }).eq('id', id)
    recarregar()
  }

  const visiveis = useMemo(() =>
    dados.filter(({ cliente: c }) => {
      const matchStatus = filtro === '' || c.status === filtro
      const q = busca.toLowerCase()
      const matchBusca  = busca === '' ||
        c.nome.toLowerCase().includes(q) ||
        (c.email    ?? '').toLowerCase().includes(q) ||
        (c.whatsapp ?? '').includes(q) ||
        (c.nicho    ?? '').toLowerCase().includes(q)
      return matchStatus && matchBusca
    }),
    [dados, filtro, busca]
  )

  return (
    <MainLayout
      title="Clientes"
      subtitle={loading ? '…' : `${metricas.total} clientes · ${metricas.ativos} ativos · ${metricas.inadimplentes} inadimplentes`}
      actions={
        <Link
          href="/clientes/novo"
          className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors"
        >
          <Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
          <span>Novo Cliente</span>
        </Link>
      }
    >
      <div className="page-enter">
      {/* ── MINI KPIs BENTO ────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[0.75rem] mb-[1.5rem]">
          <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
            <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">Total</p>
            <p className="text-[1.5rem] font-bold text-ink-primary">{metricas.total}</p>
          </div>
          <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
            <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">Ativos</p>
            <p className="text-[1.5rem] font-bold text-status-green">{metricas.ativos}</p>
          </div>
          <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
            <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">MRR</p>
            <p className="text-[1.5rem] font-bold text-ads-500">
              R$ {(metricas.mrr / 1000).toFixed(1)}k
            </p>
          </div>
          <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
            <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">Inadimplentes</p>
            <p className="text-[1.5rem] font-bold text-status-orange">{metricas.inadimplentes}</p>
          </div>
        </div>
      )}

      {/* ── ALERTAS RÁPIDOS ─────────────────────────────────────────── */}
      {metricas.inadimplentes > 0 && !loading && (
        <div className="flex items-center gap-[0.625rem] bg-status-orange/10 border border-status-orange/30 rounded-xl px-[1rem] py-[0.75rem] mb-[1.5rem]">
          <AlertTriangle className="w-[1rem] h-[1rem] text-status-orange shrink-0" strokeWidth={2} />
          <p className="text-status-orange text-[0.875rem] font-medium">
            {metricas.inadimplentes} cliente{metricas.inadimplentes > 1 ? 's' : ''} com pagamento em atraso
          </p>
          <button onClick={() => setFiltro('cancelado_debito')} className="ml-auto text-status-orange text-[0.75rem] underline">
            Filtrar
          </button>
        </div>
      )}

      {metricas.retidos > 0 && !loading && (
        <div className="flex items-center gap-[0.625rem] bg-status-blue/10 border border-status-blue/30 rounded-xl px-[1rem] py-[0.75rem] mb-[1.5rem]">
          <Snowflake className="w-[1rem] h-[1rem] text-status-blue shrink-0" strokeWidth={2} />
          <p className="text-status-blue text-[0.875rem] font-medium">
            {metricas.retidos} cliente{metricas.retidos > 1 ? 's' : ''} congelado{metricas.retidos > 1 ? 's' : ''} aguardando retorno
          </p>
          <button onClick={() => setFiltro('congelado')} className="ml-auto text-status-blue text-[0.75rem] underline">
            Filtrar
          </button>
        </div>
      )}

      {/* ── BARRA DE FILTROS ────────────────────────────────────────── */}
      <div className="flex flex-col gap-[0.75rem] mb-[1.5rem]">
        <div className="flex gap-[0.75rem]">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail, nicho, WhatsApp…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full h-[2.25rem] pl-[2.25rem] pr-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-primary placeholder:text-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
            />
          </div>
          {/* Toggle Grid/Lista */}
          <div className="flex bg-surface-hover border border-surface-border rounded-[0.375rem] overflow-hidden">
            <button
              onClick={() => setModoLista(false)}
              className={`w-[2.25rem] h-[2.25rem] flex items-center justify-center transition-colors ${!modoLista ? 'bg-surface-card text-ink-primary' : 'text-ink-muted hover:text-ink-secondary'}`}
              title="Grade"
            >
              <LayoutGrid className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setModoLista(true)}
              className={`w-[2.25rem] h-[2.25rem] flex items-center justify-center transition-colors ${modoLista ? 'bg-surface-card text-ink-primary' : 'text-ink-muted hover:text-ink-secondary'}`}
              title="Lista"
            >
              <List className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Filtros de status */}
        <div className="flex gap-[0.375rem] flex-wrap">
          {STATUS_OPCOES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFiltro(value)}
              className={`h-[2rem] px-[0.625rem] rounded-[0.375rem] text-[0.8125rem] font-medium transition-colors ${
                filtro === value
                  ? 'bg-ads-500 text-white'
                  : 'bg-surface-hover text-ink-secondary hover:text-ink-primary border border-surface-border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTAGEM ─────────────────────────────────────────────────── */}
      {!loading && (
        <p className="text-ink-muted text-[0.8125rem] mb-[1rem]">
          {visiveis.length} de {dados.length} clientes
        </p>
      )}

      {/* ── CONTEÚDO ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1rem]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[10rem] rounded-xl skeleton-shimmer dark:border dark:border-surface-border" />
          ))}
        </div>
      ) : visiveis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[4rem] gap-[1rem] text-ink-muted">
          <Users className="w-[3rem] h-[3rem]" strokeWidth={1} />
          <p className="text-[0.9375rem]">
            {busca || filtro ? 'Nenhum cliente encontrado com esses filtros.' : 'Nenhum cliente cadastrado ainda.'}
          </p>
          {!busca && !filtro && (
            <Link href="/clientes/novo" className="text-ads-500 hover:underline text-[0.875rem] font-medium">
              Cadastrar primeiro cliente
            </Link>
          )}
        </div>
      ) : modoLista ? (
        /* ── MODO LISTA (tabular) ── */
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow overflow-hidden">
          <table className="w-full text-[0.875rem]">
            <thead>
              <tr className="border-b border-surface-border">
                {['Cliente', 'Nicho', 'Status', 'MRR', 'Atraso', 'Ações'].map((h) => (
                  <th key={h} className="text-left text-ink-muted text-[0.75rem] font-semibold uppercase tracking-wide px-[1rem] py-[0.75rem]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visiveis.map(({ cliente: c, estagio }) => {
                const temAlerta = (c.dias_atraso ?? 0) > 0
                return (
                  <tr key={c.id} className="border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors">
                    <td className="px-[1rem] py-[0.75rem]">
                      <div className="flex items-center gap-[0.5rem]">
                        {temAlerta && <AlertTriangle className="w-[0.75rem] h-[0.75rem] text-status-orange shrink-0" strokeWidth={2} />}
                        <a href={`/clientes/${c.id}`} className="text-ink-primary font-medium hover:text-ads-500 transition-colors">{c.nome}</a>
                      </div>
                    </td>
                    <td className="px-[1rem] py-[0.75rem] text-ink-secondary">{c.nicho ?? '—'}</td>
                    <td className="px-[1rem] py-[0.75rem]">
                      <span className={`text-[0.75rem] font-medium px-[0.5rem] py-[0.125rem] rounded-full ${STATUS_COLOR[c.status] ?? 'bg-surface-hover text-ink-muted'}`}>
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-[1rem] py-[0.75rem] text-ink-secondary">
                      {c.mrr ? `R$ ${c.mrr.toLocaleString('pt-BR')}` : '—'}
                    </td>
                    <td className="px-[1rem] py-[0.75rem]">
                      {(c.dias_atraso ?? 0) > 0
                        ? <span className="text-status-orange font-semibold">D+{c.dias_atraso}</span>
                        : <span className="text-ink-muted">—</span>
                      }
                    </td>
                    <td className="px-[1rem] py-[0.75rem]">
                      <div className="flex items-center gap-[0.375rem]">
                        <a href={`/clientes/${c.id}`} className="h-[1.75rem] px-[0.5rem] rounded bg-surface-hover text-ink-secondary text-[0.75rem] font-medium hover:text-ink-primary border border-surface-border transition-colors flex items-center">
                          Ver
                        </a>
                        {c.whatsapp && (
                          <button
                            onClick={() => setWhatsappCliente(c)}
                            className="w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded bg-status-green/10 text-status-green hover:bg-status-green/20 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── MODO GRID ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1rem]">
          {visiveis.map(({ cliente, estagio }) => (
            <ClienteProgressCard
              key={cliente.id}
              cliente={cliente}
              estagio={estagio}
              onCongelar={handleCongelar}
            />
          ))}
        </div>
      )}

      {/* ── MODAL WHATSAPP ────────────────────────────────────────────── */}
      {whatsappCliente && (
        <WhatsAppTemplateModal
          cliente={whatsappCliente}
          onClose={() => setWhatsappCliente(null)}
        />
      )}
      </div>
    </MainLayout>
  )
}
```

### `app\(app)\clientes\[id]\page.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, User, CheckSquare, BarChart3, History,
  Phone, Mail, Globe, Calendar, DollarSign, AlertCircle,
  MessageCircle, Snowflake, Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MainLayout } from '@/components/layout/MainLayout'
import { ChecklistCard } from '@/components/clientes/ChecklistCard'
import { ClienteIntegracoes } from '@/components/clientes/ClienteIntegracoes'
import { ClientePerformance } from '@/components/clientes/ClientePerformance'
import { AuditTimeline } from '@/components/clientes/AuditTimeline'
import { AcessoRapido } from '@/components/clientes/AcessoRapido'
import { WhatsAppTemplateModal } from '@/components/clientes/WhatsAppTemplateModal'
import {
  obterCliente,
  obterEstagioAtivo,
  obterHistoricoCliente,
  congelarCliente,
  descongelarCliente,
} from '@/lib/database'
import type { Cliente, Estagio, HistoricoAcao } from '@/lib/types'
import { toast } from 'sonner'

type AbaId = 'visao_geral' | 'checklist' | 'campanhas' | 'historico'

const ABAS: { id: AbaId; label: string; icon: typeof User }[] = [
  { id: 'visao_geral', label: 'Visão Geral',  icon: User       },
  { id: 'checklist',   label: 'Checklists',   icon: CheckSquare },
  { id: 'campanhas',   label: 'Campanhas',    icon: BarChart3   },
  { id: 'historico',   label: 'Histórico',    icon: History     },
]

const STATUS_LABELS: Record<string, string> = {
  recebido:         'Recebido',
  onboarding:       'Onboarding',
  setup_trafego:    'Setup Tráfego',
  ativo:            'Ativo',
  congelado:        'Congelado',
  cancelado_debito: 'Cancelado (débito)',
  cancelado:        'Cancelado',
  inativo:          'Inativo',
}

const STATUS_COLORS: Record<string, string> = {
  recebido:         'bg-status-blue/10 text-status-blue',
  onboarding:       'bg-status-purple/10 text-status-purple',
  setup_trafego:    'bg-status-cyan/10 text-status-cyan',
  ativo:            'bg-status-green/10 text-status-green',
  congelado:        'bg-status-blue/10 text-status-blue',
  cancelado_debito: 'bg-status-red/10 text-status-red',
  cancelado:        'bg-status-red/10 text-status-red',
  inativo:          'bg-ink-muted/10 text-ink-muted',
}

export default function ClienteDetalhePage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()

  const [cliente,   setCliente]   = useState<Cliente | null>(null)
  const [estagio,   setEstagio]   = useState<Estagio | null>(null)
  const [historico, setHistorico] = useState<HistoricoAcao[]>([])
  const [abaAtiva,  setAbaAtiva]  = useState<AbaId>('visao_geral')
  const [carregando, setCarregando] = useState(true)
  const [whatsappOpen, setWhatsappOpen] = useState(false)
  const [agindo, setAgindo] = useState(false)

  useEffect(() => {
    if (!id) return
    setCarregando(true)
    Promise.all([
      obterCliente(id),
      obterEstagioAtivo(id),
      obterHistoricoCliente(id),
    ]).then(([c, e, h]) => {
      setCliente(c)
      setEstagio(e)
      setHistorico(h)
    }).catch(() => {
      toast.error('Erro ao carregar cliente')
    }).finally(() => setCarregando(false))
  }, [id])

  async function handleCongelar() {
    if (!cliente) return
    setAgindo(true)
    try {
      await congelarCliente(cliente.id)
      setCliente((prev) => prev ? { ...prev, status: 'congelado' } : prev)
      toast.success('Cliente congelado')
    } catch {
      toast.error('Erro ao congelar cliente')
    } finally {
      setAgindo(false)
    }
  }

  async function handleDescongelar() {
    if (!cliente) return
    setAgindo(true)
    try {
      await descongelarCliente(cliente.id, 'ativo', 'Retomar acompanhamento do cliente')
      const c = await obterCliente(cliente.id)
      setCliente(c)
      toast.success('Cliente descongelado')
    } catch {
      toast.error('Erro ao descongelar cliente')
    } finally {
      setAgindo(false)
    }
  }

  if (carregando) {
    return (
      <MainLayout title="Carregando…">
        <div className="flex items-center justify-center h-[12rem]">
          <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    )
  }

  if (!cliente) {
    return (
      <MainLayout title="Cliente não encontrado">
        <div className="flex flex-col items-center justify-center h-[12rem] gap-[1rem]">
          <AlertCircle className="w-[2rem] h-[2rem] text-ink-muted" strokeWidth={1.5} />
          <p className="text-ink-secondary text-[0.875rem]">Cliente não encontrado.</p>
          <button
            onClick={() => router.push('/clientes')}
            className="flex items-center gap-[0.375rem] text-ads-500 hover:text-ads-600 text-[0.875rem] transition-colors"
          >
            <ArrowLeft className="w-[0.875rem] h-[0.875rem]" />
            Voltar para clientes
          </button>
        </div>
      </MainLayout>
    )
  }

  const actions = (
    <div className="flex items-center gap-[0.5rem]">
      <button
        onClick={() => setWhatsappOpen(true)}
        className="flex items-center gap-[0.375rem] h-[2rem] px-[0.875rem] rounded-lg bg-status-green/10 hover:bg-status-green/20 text-status-green text-[0.8125rem] font-medium transition-colors"
      >
        <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
        WhatsApp
      </button>
      {cliente.status === 'congelado' ? (
        <button
          onClick={handleDescongelar}
          disabled={agindo}
          className="flex items-center gap-[0.375rem] h-[2rem] px-[0.875rem] rounded-lg bg-ads-500/10 hover:bg-ads-500/20 text-ads-600 text-[0.8125rem] font-medium transition-colors disabled:opacity-50"
        >
          <Play className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
          Descongelar
        </button>
      ) : (
        <button
          onClick={handleCongelar}
          disabled={agindo || cliente.status === 'cancelado' || cliente.status === 'inativo'}
          className="flex items-center gap-[0.375rem] h-[2rem] px-[0.875rem] rounded-lg bg-surface-hover hover:bg-surface-border text-ink-secondary text-[0.8125rem] font-medium transition-colors disabled:opacity-40"
        >
          <Snowflake className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
          Congelar
        </button>
      )}
    </div>
  )

  return (
    <MainLayout title={cliente.nome} subtitle={cliente.nicho} actions={actions}>
      <div className="page-enter">

        {/* Voltar */}
        <button
          onClick={() => router.push('/clientes')}
          className="flex items-center gap-[0.375rem] text-ink-muted hover:text-ink-secondary text-[0.875rem] mb-[1.5rem] transition-colors"
        >
          <ArrowLeft className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
          Clientes
        </button>

        {/* Cabeçalho do cliente */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] card-shadow mb-[1.5rem]">
          <div className="flex items-start justify-between gap-[1rem] flex-wrap">
            <div className="flex items-center gap-[1rem]">
              <div className="w-[3rem] h-[3rem] rounded-full bg-ads-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-ads-600 text-[1.25rem] font-bold">
                  {cliente.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-ink-primary text-[1.125rem] font-semibold">{cliente.nome}</h2>
                <div className="flex items-center gap-[0.75rem] mt-[0.25rem] flex-wrap">
                  <span className={cn('px-[0.5rem] py-[0.125rem] rounded-full text-xs font-medium', STATUS_COLORS[cliente.status] ?? 'bg-ink-muted/10 text-ink-muted')}>
                    {STATUS_LABELS[cliente.status] ?? cliente.status}
                  </span>
                  {cliente.nicho && (
                    <span className="text-ink-muted text-[0.8125rem]">{cliente.nicho}</span>
                  )}
                  {estagio && (
                    <span className="text-ink-muted text-[0.8125rem]">Etapa: <span className="text-ink-secondary">{estagio.nome}</span></span>
                  )}
                </div>
              </div>
            </div>

            {/* KPIs rápidos */}
            <div className="flex items-center gap-[1.5rem] flex-wrap">
              {cliente.mrr != null && (
                <div className="text-right">
                  <div className="flex items-center gap-[0.25rem] text-ink-muted text-[0.75rem]">
                    <DollarSign className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                    MRR
                  </div>
                  <div className="text-ink-primary text-[1rem] font-semibold">
                    R$ {cliente.mrr.toLocaleString('pt-BR')}
                  </div>
                </div>
              )}
              {cliente.dias_atraso > 0 && (
                <div className="text-right">
                  <div className="flex items-center gap-[0.25rem] text-status-red text-[0.75rem]">
                    <AlertCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                    Atraso
                  </div>
                  <div className="text-status-red text-[1rem] font-semibold">
                    D+{cliente.dias_atraso}
                  </div>
                </div>
              )}
              {cliente.data_criacao && (
                <div className="text-right">
                  <div className="flex items-center gap-[0.25rem] text-ink-muted text-[0.75rem]">
                    <Calendar className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                    Desde
                  </div>
                  <div className="text-ink-secondary text-[0.875rem]">
                    {new Date(cliente.data_criacao).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contato */}
          <div className="flex items-center gap-[1.25rem] mt-[1rem] flex-wrap">
            {cliente.email && (
              <a href={`mailto:${cliente.email}`} className="flex items-center gap-[0.375rem] text-ink-muted hover:text-ink-secondary text-[0.8125rem] transition-colors">
                <Mail className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.5} />
                {cliente.email}
              </a>
            )}
            {cliente.whatsapp && (
              <a href={`https://wa.me/55${cliente.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-[0.375rem] text-ink-muted hover:text-status-green text-[0.8125rem] transition-colors">
                <Phone className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.5} />
                {cliente.whatsapp}
              </a>
            )}
            {cliente.dominio && (
              <a href={`https://${cliente.dominio}`} target="_blank" rel="noreferrer" className="flex items-center gap-[0.375rem] text-ink-muted hover:text-status-blue text-[0.8125rem] transition-colors">
                <Globe className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.5} />
                {cliente.dominio}
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-[0.25rem] mb-[1.5rem] border-b border-surface-border">
          {ABAS.map((aba) => {
            const Icon = aba.icon
            return (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={cn(
                  'flex items-center gap-[0.375rem] px-[1rem] py-[0.625rem] text-[0.875rem] font-medium border-b-2 -mb-px transition-colors',
                  abaAtiva === aba.id
                    ? 'border-ads-500 text-ads-500'
                    : 'border-transparent text-ink-muted hover:text-ink-secondary',
                )}
              >
                <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                {aba.label}
              </button>
            )
          })}
        </div>

        {/* Conteúdo das tabs */}
        {abaAtiva === 'visao_geral' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-[1.5rem]">
            <div className="space-y-[1.5rem]">
              {estagio && (
                <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow">
                  <h3 className="text-ink-primary text-[0.9375rem] font-semibold mb-[0.75rem]">Etapa Atual</h3>
                  <div className="flex items-start gap-[0.75rem]">
                    <div className="w-[2rem] h-[2rem] rounded-full bg-ads-500/10 flex items-center justify-center flex-shrink-0 mt-[0.125rem]">
                      <CheckSquare className="w-[0.875rem] h-[0.875rem] text-ads-600" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-ink-primary text-[0.875rem] font-medium capitalize">{estagio.nome.replace(/_/g, ' ')}</p>
                      {estagio.acao_label && (
                        <p className="text-ink-secondary text-[0.8125rem] mt-[0.25rem]">{estagio.acao_label}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <ClienteIntegracoes cliente={cliente} onUpdate={setCliente} />
            </div>
            <div className="space-y-[1.5rem]">
              <AcessoRapido links={{
                google_ads_customer_id: cliente.google_ads_customer_id ?? undefined,
                ga4_property_id:        cliente.ga4_property_id ?? undefined,
                gmb_id:                 cliente.gmb_id,
                looker_url:             cliente.looker_url,
                website:                cliente.website,
              }} />
              {historico.length > 0 && (
                <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow">
                  <h3 className="text-ink-primary text-[0.9375rem] font-semibold mb-[0.75rem]">Últimas ações</h3>
                  <div className="space-y-[0.75rem]">
                    {historico.slice(0, 4).map((h) => (
                      <div key={h.id} className="flex items-start gap-[0.75rem]">
                        <div className="w-[0.375rem] h-[0.375rem] rounded-full bg-ads-500 mt-[0.4rem] flex-shrink-0" />
                        <div>
                          <p className="text-ink-secondary text-[0.8125rem]">{h.descricao}</p>
                          <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">
                            {new Date(h.data_acao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {abaAtiva === 'checklist' && (
          <div>
            {estagio?.checklist && estagio.checklist.length > 0 ? (
              <ChecklistCard
                clienteId={cliente.id}
                estagioId={estagio.id}
                items={estagio.checklist}
              />
            ) : (
              <div className="bg-surface-card border border-surface-border rounded-xl p-[2rem] card-shadow text-center">
                <CheckSquare className="w-[2rem] h-[2rem] text-ink-muted mx-auto mb-[0.75rem]" strokeWidth={1.5} />
                <p className="text-ink-secondary text-[0.875rem]">Nenhum checklist ativo para esta etapa.</p>
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'campanhas' && (
          <ClientePerformance
            clienteId={cliente.id}
            googleAdsEnabled={cliente.google_ads_enabled}
            ga4Enabled={cliente.ga4_enabled}
          />
        )}

        {abaAtiva === 'historico' && (
          <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow">
            <h3 className="text-ink-primary text-[0.9375rem] font-semibold mb-[1rem]">Histórico Completo</h3>
            {historico.length === 0 ? (
              <div className="text-center py-[2rem]">
                <History className="w-[2rem] h-[2rem] text-ink-muted mx-auto mb-[0.75rem]" strokeWidth={1.5} />
                <p className="text-ink-secondary text-[0.875rem]">Nenhuma ação registrada ainda.</p>
              </div>
            ) : (
              <div className="space-y-[0.875rem]">
                {historico.map((h) => (
                  <div key={h.id} className="flex items-start gap-[0.875rem] pb-[0.875rem] border-b border-surface-border last:border-0 last:pb-0">
                    <div className="w-[0.5rem] h-[0.5rem] rounded-full bg-ads-500/60 mt-[0.3rem] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-ink-secondary text-[0.875rem]">{h.descricao}</p>
                      <p className="text-ink-muted text-[0.75rem] mt-[0.25rem]">
                        {new Date(h.data_acao).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="text-ink-muted text-[0.75rem] bg-surface-hover px-[0.5rem] py-[0.125rem] rounded-full flex-shrink-0">
                      {h.tipo_acao.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <AuditTimeline clienteId={cliente.id} />
          </div>
        )}

      </div>

      {whatsappOpen && (
        <WhatsAppTemplateModal
          cliente={cliente}
          onClose={() => setWhatsappOpen(false)}
        />
      )}
    </MainLayout>
  )
}
```

### `app\(app)\clientes\novo\page.tsx`

```tsx
﻿'use client';

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
```

### `app\(app)\configuracoes\page.tsx`

```tsx
﻿'use client'

import React, { useEffect, useState } from 'react'
import {
  Save, User, Bell, Plug, DollarSign,
  Palette, Users, Check, History,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { supabase }   from '@/lib/supabase'
import { AuditLogViewer } from '@/components/configuracoes/AuditLogViewer'

type AbaId = 'perfil' | 'notificacoes' | 'integracoes' | 'financeiro' | 'aparencia' | 'equipe' | 'auditoria'

const ABAS: { id: AbaId; label: string; icon: React.ElementType }[] = [
  { id: 'perfil',        label: 'Perfil',         icon: User       },
  { id: 'notificacoes',  label: 'Notificações',    icon: Bell       },
  { id: 'integracoes',   label: 'Integrações',     icon: Plug       },
  { id: 'financeiro',    label: 'Financeiro',      icon: DollarSign },
  { id: 'aparencia',     label: 'Aparência',       icon: Palette    },
  { id: 'equipe',        label: 'Equipe',          icon: Users      },
  { id: 'auditoria',     label: 'Auditoria',       icon: History    },
]

interface ConfigFinanceira {
  custos_fixos_mensais:           number
  custos_variaveis_percentual:    number
  margem_lucro_minima:            number
  saldo_google_ads_limite_alerta: number
}

function FeedbackSalvo({ ok, erro }: { ok: boolean; erro: string }) {
  if (erro) return <p className="text-[0.8125rem] text-status-red">{erro}</p>
  if (ok)   return <p className="text-[0.8125rem] text-status-green flex items-center gap-[0.25rem]"><Check className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} /> Salvo com sucesso</p>
  return null
}

function BtnSalvar({ salvando }: { salvando: boolean }) {
  return (
    <button
      type="submit"
      disabled={salvando}
      className="flex items-center gap-[0.5rem] h-[2.5rem] px-[1.25rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white text-[0.875rem] font-semibold transition-colors disabled:opacity-50"
    >
      {salvando
        ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
        : <Save className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
      }
      {salvando ? 'Salvando…' : 'Salvar'}
    </button>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-ink-secondary text-[0.875rem] font-medium mb-[0.375rem]">{label}</label>
      {children}
    </div>
  )
}

function InputText({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
    />
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-[0.5rem]">
      <span className="text-ink-secondary text-[0.875rem]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-[2.75rem] h-[1.5rem] rounded-full transition-colors ${checked ? 'bg-ads-500' : 'bg-surface-hover border border-surface-border'}`}
      >
        <span className={`absolute top-[0.1875rem] left-[0.1875rem] w-[1.125rem] h-[1.125rem] rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[1.25rem]' : ''}`} />
      </button>
    </label>
  )
}

// ── ABA PERFIL ──────────────────────────────────────────────────────────────
function AbaPerfil() {
  const [nome,     setNome]     = useState('')
  const [email,    setEmail]    = useState('')
  const [telefone, setTelefone] = useState('')
  const [cidade,   setCidade]   = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo,    setSalvo]    = useState(false)
  const [erro,     setErro]     = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      if (u) {
        setEmail(u.email ?? '')
        setNome((u.user_metadata?.full_name ?? '') as string)
        setTelefone((u.user_metadata?.telefone ?? '') as string)
        setCidade((u.user_metadata?.cidade ?? '') as string)
      }
    })
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true); setErro(''); setSalvo(false)
    const { error } = await supabase.auth.updateUser({ data: { full_name: nome, telefone, cidade } })
    if (error) setErro(error.message)
    else { setSalvo(true); setTimeout(() => setSalvo(false), 3000) }
    setSalvando(false)
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-[1.25rem] max-w-[28rem]">
      <Campo label="Nome completo"><InputText value={nome} onChange={setNome} placeholder="Seu nome" /></Campo>
      <Campo label="E-mail"><InputText value={email} onChange={() => {}} type="email" placeholder="email@agencia.com" /></Campo>
      <Campo label="Telefone"><InputText value={telefone} onChange={setTelefone} placeholder="+55 11 9 9999-9999" /></Campo>
      <Campo label="Cidade"><InputText value={cidade} onChange={setCidade} placeholder="São Paulo, SP" /></Campo>
      <div className="flex items-center gap-[1rem]">
        <BtnSalvar salvando={salvando} />
        <FeedbackSalvo ok={salvo} erro={erro} />
      </div>
    </form>
  )
}

// ── ABA NOTIFICAÇÕES ────────────────────────────────────────────────────────
function AbaNotificacoes() {
  const [prefs, setPrefs] = useState({
    email_alertas_criticos:  true,
    email_relatorio_semanal: false,
    email_relatorio_mensal:  true,
    inapp_criticos:          true,
    inapp_conversoes:        false,
    inapp_verbose:           false,
    dnd_ativo:               false,
    dnd_inicio:              '22:00',
    dnd_fim:                 '08:00',
  })
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('configuracoes_usuario').upsert({ user_id: user.id, preferencias: prefs }, { onConflict: 'user_id' })
    }
    setSalvo(true)
    setTimeout(() => setSalvo(false), 3000)
    setSalvando(false)
  }

  function set<K extends keyof typeof prefs>(k: K, v: (typeof prefs)[K]) {
    setPrefs((p) => ({ ...p, [k]: v }))
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-[2rem] max-w-[28rem]">
      <div>
        <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.75rem]">E-mail</p>
        <Toggle checked={prefs.email_alertas_criticos}  onChange={(v) => set('email_alertas_criticos', v)}  label="Alertas críticos por e-mail"     />
        <Toggle checked={prefs.email_relatorio_semanal} onChange={(v) => set('email_relatorio_semanal', v)} label="Resumo semanal (sexta-feira)"     />
        <Toggle checked={prefs.email_relatorio_mensal}  onChange={(v) => set('email_relatorio_mensal', v)}  label="Relatório mensal executivo"        />
      </div>
      <div>
        <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.75rem]">In-app</p>
        <Toggle checked={prefs.inapp_criticos}   onChange={(v) => set('inapp_criticos', v)}   label="Notificações críticas"           />
        <Toggle checked={prefs.inapp_conversoes} onChange={(v) => set('inapp_conversoes', v)} label="Novas conversões"                />
        <Toggle checked={prefs.inapp_verbose}    onChange={(v) => set('inapp_verbose', v)}    label="Todas as notificações (verbose)" />
      </div>
      <div>
        <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.75rem]">Não Perturbe (DND)</p>
        <Toggle checked={prefs.dnd_ativo} onChange={(v) => set('dnd_ativo', v)} label="Ativar silêncio noturno" />
        {prefs.dnd_ativo && (
          <div className="flex gap-[1rem] mt-[0.75rem]">
            <Campo label="Início"><InputText type="time" value={prefs.dnd_inicio} onChange={(v) => set('dnd_inicio', v)} /></Campo>
            <Campo label="Fim"><InputText type="time" value={prefs.dnd_fim} onChange={(v) => set('dnd_fim', v)} /></Campo>
          </div>
        )}
      </div>
      <div className="flex items-center gap-[1rem]">
        <BtnSalvar salvando={salvando} />
        <FeedbackSalvo ok={salvo} erro="" />
      </div>
    </form>
  )
}

// ── ABA INTEGRAÇÕES ─────────────────────────────────────────────────────────
function AbaIntegracoes() {
  const integracoes = [
    { nome: 'Google Ads',   status: !!process.env.NEXT_PUBLIC_GOOGLE_ADS_CONNECTED, detalhe: 'OAuth configurado via variável de ambiente' },
    { nome: 'GA4',          status: !!process.env.NEXT_PUBLIC_GA4_CONNECTED,        detalhe: 'Property ID configurado' },
    { nome: 'Asaas',        status: !!process.env.NEXT_PUBLIC_ASAAS_CONNECTED,      detalhe: 'Webhook ativo' },
    { nome: 'Vertex AI',    status: !!process.env.NEXT_PUBLIC_VERTEX_CONNECTED,     detalhe: 'Gemini 2.0 Flash + 2.5 Pro' },
    { nome: 'WhatsApp',     status: false,                                            detalhe: 'Não configurado' },
  ]

  return (
    <div className="flex flex-col gap-[0.75rem] max-w-[32rem]">
      {integracoes.map((i) => (
        <div key={i.nome} className="flex items-center justify-between bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem]">
          <div>
            <p className="text-ink-primary font-semibold text-[0.9375rem]">{i.nome}</p>
            <p className="text-ink-muted text-[0.75rem]">{i.detalhe}</p>
          </div>
          <div className="flex items-center gap-[0.75rem]">
            <span className={`text-[0.75rem] font-semibold px-[0.5rem] py-[0.125rem] rounded-full ${i.status ? 'bg-status-green/15 text-status-green' : 'bg-surface-hover text-ink-muted'}`}>
              {i.status ? '✓ Conectado' : '— Desconectado'}
            </span>
          </div>
        </div>
      ))}
      <p className="text-ink-muted text-[0.75rem] mt-[0.5rem]">Configure as variáveis de ambiente no painel Supabase ou no arquivo <code className="bg-surface-hover px-[0.25rem] rounded">.env.local</code> para ativar cada integração.</p>
    </div>
  )
}

// ── ABA FINANCEIRO ──────────────────────────────────────────────────────────
function AbaFinanceiro() {
  const [config,   setConfig]   = useState<ConfigFinanceira>({ custos_fixos_mensais: 0, custos_variaveis_percentual: 0, margem_lucro_minima: 30, saldo_google_ads_limite_alerta: 50 })
  const [loading,  setLoading]  = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [salvo,    setSalvo]    = useState(false)
  const [erro,     setErro]     = useState('')

  useEffect(() => {
    supabase.from('configuracoes_financeiras').select('custos_fixos_mensais,custos_variaveis_percentual,margem_lucro_minima,saldo_google_ads_limite_alerta').eq('agencia_id', 'adsgator-main').single()
      .then(({ data }) => { if (data) setConfig(data as ConfigFinanceira); setLoading(false) })
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true); setErro(''); setSalvo(false)
    const { error } = await supabase.from('configuracoes_financeiras').update(config).eq('agencia_id', 'adsgator-main')
    if (error) setErro(error.message)
    else { setSalvo(true); setTimeout(() => setSalvo(false), 3000) }
    setSalvando(false)
  }

  const campos = [
    { key: 'custos_fixos_mensais'          as const, label: 'Custos Fixos Mensais (R$)',    prefix: 'R$', suffix: ''  },
    { key: 'custos_variaveis_percentual'   as const, label: 'Custos Variáveis (%)',          prefix: '',   suffix: '%' },
    { key: 'margem_lucro_minima'           as const, label: 'Margem de Lucro Mínima (%)',    prefix: '',   suffix: '%' },
    { key: 'saldo_google_ads_limite_alerta'as const, label: 'Alerta Saldo Google Ads (R$)', prefix: 'R$', suffix: ''  },
  ]

  if (loading) return <div className="h-[12rem] flex items-center justify-center"><div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <form onSubmit={salvar} className="flex flex-col gap-[1.25rem] max-w-[28rem]">
      {campos.map(({ key, label, prefix, suffix }) => (
        <Campo key={key} label={label}>
          <div className="relative">
            {prefix && <span className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 text-ink-muted text-[0.875rem]">{prefix}</span>}
            <input
              type="number" step="0.01" min="0"
              value={config[key]}
              onChange={(e) => setConfig((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
              className={`w-full h-[2.5rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors ${prefix ? 'pl-[2.5rem]' : 'pl-[0.75rem]'} ${suffix ? 'pr-[2rem]' : 'pr-[0.75rem]'}`}
            />
            {suffix && <span className="absolute right-[0.75rem] top-1/2 -translate-y-1/2 text-ink-muted text-[0.875rem]">{suffix}</span>}
          </div>
        </Campo>
      ))}
      <div className="flex items-center gap-[1rem]">
        <BtnSalvar salvando={salvando} />
        <FeedbackSalvo ok={salvo} erro={erro} />
      </div>
    </form>
  )
}

// ── ABA APARÊNCIA ───────────────────────────────────────────────────────────
function AbaAparencia() {
  const [tema,    setTema]    = useState<'dark' | 'light' | 'system'>('dark')
  const [idioma,  setIdioma]  = useState('pt-BR')
  const [fuso,    setFuso]    = useState('America/Sao_Paulo')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('configuracoes_usuario').upsert({ user_id: user.id, preferencias: { tema, idioma, fuso } }, { onConflict: 'user_id' })
    }
    setSalvo(true)
    setTimeout(() => setSalvo(false), 3000)
    setSalvando(false)
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-[1.5rem] max-w-[28rem]">
      <Campo label="Tema">
        <div className="grid grid-cols-3 gap-[0.5rem]">
          {(['dark', 'light', 'system'] as const).map((t) => (
            <button
              key={t} type="button" onClick={() => setTema(t)}
              className={`h-[2.5rem] rounded-lg border text-[0.875rem] font-medium transition-colors capitalize ${tema === t ? 'border-ads-500 bg-ads-500/10 text-ads-500' : 'border-surface-border bg-surface-hover text-ink-secondary hover:text-ink-primary'}`}
            >
              {t === 'dark' ? 'Escuro' : t === 'light' ? 'Claro' : 'Sistema'}
            </button>
          ))}
        </div>
      </Campo>
      <Campo label="Idioma">
        <select value={idioma} onChange={(e) => setIdioma(e.target.value)} className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30">
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en-US">English (US)</option>
          <option value="es">Español</option>
        </select>
      </Campo>
      <Campo label="Fuso Horário">
        <select value={fuso} onChange={(e) => setFuso(e.target.value)} className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30">
          <option value="America/Sao_Paulo">América/São Paulo (UTC-3)</option>
          <option value="America/Manaus">América/Manaus (UTC-4)</option>
          <option value="America/Belem">América/Belém (UTC-3)</option>
          <option value="America/Fortaleza">América/Fortaleza (UTC-3)</option>
        </select>
      </Campo>
      <div className="flex items-center gap-[1rem]">
        <BtnSalvar salvando={salvando} />
        <FeedbackSalvo ok={salvo} erro="" />
      </div>
    </form>
  )
}

// ── ABA EQUIPE ──────────────────────────────────────────────────────────────
function AbaEquipe() {
  const [email,     setEmail]     = useState('')
  const [papel,     setPapel]     = useState<'gerenciador' | 'analista' | 'viewer'>('analista')
  const [enviando,  setEnviando]  = useState(false)
  const [feedbackI, setFeedbackI] = useState('')

  async function convidar(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setEnviando(true); setFeedbackI('')
    const { error } = await supabase.auth.admin?.inviteUserByEmail
      ? await (supabase.auth as { admin?: { inviteUserByEmail: (email: string) => Promise<{ error: unknown }> } }).admin!.inviteUserByEmail(email)
      : { error: new Error('Admin API não disponível client-side') }
    if (error) setFeedbackI('Use o painel Supabase para convidar membros.')
    else { setFeedbackI(`Convite enviado para ${email}`); setEmail('') }
    setEnviando(false)
  }

  const PAPEIS = [
    { value: 'proprietario', label: 'Proprietário',  desc: 'Acesso total'             },
    { value: 'gerenciador',  label: 'Gerenciador',   desc: 'CRUD completo de clientes' },
    { value: 'analista',     label: 'Analista',      desc: 'Leitura + relatórios'      },
    { value: 'viewer',       label: 'Viewer',        desc: 'Somente leitura'           },
  ]

  return (
    <div className="max-w-[32rem] flex flex-col gap-[2rem]">
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem]">
        <p className="text-ink-primary font-semibold text-[0.9375rem] mb-[1rem]">Papéis disponíveis</p>
        <div className="flex flex-col gap-[0.5rem]">
          {PAPEIS.map((p) => (
            <div key={p.value} className="flex items-center justify-between">
              <span className="text-ink-secondary text-[0.875rem] font-medium">{p.label}</span>
              <span className="text-ink-muted text-[0.75rem]">{p.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={convidar} className="flex flex-col gap-[1rem]">
        <p className="text-ink-primary font-semibold text-[0.9375rem]">Convidar membro</p>
        <Campo label="E-mail"><InputText type="email" value={email} onChange={setEmail} placeholder="membro@agencia.com" /></Campo>
        <Campo label="Papel">
          <select value={papel} onChange={(e) => setPapel(e.target.value as typeof papel)} className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30">
            <option value="gerenciador">Gerenciador</option>
            <option value="analista">Analista</option>
            <option value="viewer">Viewer</option>
          </select>
        </Campo>
        <div className="flex items-center gap-[1rem]">
          <button type="submit" disabled={enviando || !email} className="flex items-center gap-[0.5rem] h-[2.5rem] px-[1.25rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white text-[0.875rem] font-semibold transition-colors disabled:opacity-50">
            {enviando ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Users className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
            Enviar Convite
          </button>
          {feedbackI && <p className="text-ink-muted text-[0.8125rem]">{feedbackI}</p>}
        </div>
        <p className="text-ink-muted text-[0.75rem]">Para convidar via painel, acesse Authentication → Users no Supabase Dashboard.</p>
      </form>
    </div>
  )
}

// ── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function ConfiguracoesPage() {
  const [aba, setAba] = useState<AbaId>('perfil')

  const ABA_CONTENT: Record<AbaId, React.ReactNode> = {
    perfil:       <AbaPerfil />,
    notificacoes: <AbaNotificacoes />,
    integracoes:  <AbaIntegracoes />,
    financeiro:   <AbaFinanceiro />,
    aparencia:    <AbaAparencia />,
    equipe:       <AbaEquipe />,
    auditoria:    <AuditLogViewer />,
  }

  return (
    <MainLayout title="Configurações" subtitle="Personalize a Adsgator conforme sua operação">
      <div className="flex flex-col gap-[2rem]">
        {/* Tabs */}
        <div className="flex gap-[0.25rem] flex-wrap border-b border-surface-border pb-[0.25rem]">
          {ABAS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={`flex items-center gap-[0.375rem] h-[2.25rem] px-[0.875rem] rounded-t-lg text-[0.875rem] font-medium transition-colors ${
                aba === id
                  ? 'text-ads-500 border-b-2 border-ads-500 -mb-[0.3125rem]'
                  : 'text-ink-muted hover:text-ink-secondary'
              }`}
            >
              <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>

        {/* Conteúdo da aba ativa */}
        <div>{ABA_CONTENT[aba]}</div>
      </div>
    </MainLayout>
  )
}
```

### `app\(app)\dashboard\page.tsx`

```tsx
'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const { Responsive: RGLResponsive } = require('react-grid-layout') as { Responsive: React.ComponentType<any> }
import {
  Users,
  DollarSign,
  Percent,
  CreditCard,
  Download,
  RefreshCw,
  RotateCcw,
  MessageCircle,
  ExternalLink,
  PauseCircle,
} from 'lucide-react'
import { MainLayout }            from '@/components/layout/MainLayout'
import { BentoCard }             from '@/components/dashboard/BentoCard'
import { KpiCard }               from '@/components/dashboard/KpiCard'
import { AcoesDoDia }            from '@/components/dashboard/AcoesDoDia'
import { KpiCompactCard }        from '@/components/dashboard/KpiCompactCard'
import { TrendingOnMarket }      from '@/components/dashboard/TrendingOnMarket'
import { RecentTransactions }    from '@/components/dashboard/RecentTransactions'
import { QuickExchange }         from '@/components/dashboard/QuickExchange'
import { MorningBriefing }       from '@/components/dashboard/MorningBriefing'
import { WeatherClock }          from '@/components/dashboard/WeatherClock'
import { DRESparkline }          from '@/components/dashboard/DRESparkline'
import { AlertasCriticos }       from '@/components/dashboard/AlertasCriticos'
import { GeminiChat }            from '@/components/dashboard/GeminiChat'
import { useClientes }           from '@/lib/hooks/useClientes'
import { supabase }              from '@/lib/supabase'
import { toast } from 'sonner'
import type { Cliente, Estagio } from '@/lib/types'

type Urgencia = 'critica' | 'atencao' | 'review'

interface AcaoItem {
  cliente:   Cliente
  estagio:   Estagio | null
  urgencia:  Urgencia
  descricao: string
  acaoLabel: string
  whatsapp?: string
}

const STORAGE_KEY = 'adsgator-bento-layouts-v3'
const BREAKPOINTS = { xl: 1400, lg: 1024, md: 768, sm: 480 }
const COLS        = { xl: 12,   lg: 10,   md: 6,   sm: 2   }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Layouts = Record<string, any[]>

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

const DEFAULT_LAYOUTS: Layouts = {
  xl: [
    // ROW 0-5: Hero (DRE) + Lista (Clientes) — espelho da referência
    { i: 'dre-sparkline',     x: 0,  y: 0,  w: 7,  h: 6, minW: 4, minH: 4 },
    { i: 'clientes-progresso',x: 7,  y: 0,  w: 5,  h: 6, minW: 3, minH: 4 },
    // ROW 6-8: Morning Briefing + Ações + Weather
    { i: 'morning-briefing',  x: 0,  y: 6,  w: 5,  h: 4, minW: 3, minH: 3 },
    { i: 'acoes-dia',         x: 5,  y: 6,  w: 4,  h: 4, minW: 3, minH: 3 },
    { i: 'weather-clock',     x: 9,  y: 6,  w: 3,  h: 4, minW: 2, minH: 3 },
    // ROW 10-11: 4 KPI cards
    { i: 'kpi-ativos',        x: 0,  y: 10, w: 3,  h: 3, minW: 2, minH: 2 },
    { i: 'kpi-mrr',           x: 3,  y: 10, w: 3,  h: 3, minW: 2, minH: 2 },
    { i: 'kpi-retencao',      x: 6,  y: 10, w: 3,  h: 3, minW: 2, minH: 2 },
    { i: 'kpi-saldo',         x: 9,  y: 10, w: 3,  h: 3, minW: 2, minH: 2 },
    // ROW 13-15: Alertas + Gemini
    { i: 'alertas-criticos',  x: 0,  y: 13, w: 6,  h: 4, minW: 4, minH: 2 },
    { i: 'gemini-chat',       x: 6,  y: 13, w: 6,  h: 4, minW: 4, minH: 2 },
  ],
  lg: [
    { i: 'dre-sparkline',     x: 0,  y: 0,  w: 6,  h: 6 },
    { i: 'clientes-progresso',x: 6,  y: 0,  w: 4,  h: 6 },
    { i: 'morning-briefing',  x: 0,  y: 6,  w: 5,  h: 4 },
    { i: 'acoes-dia',         x: 5,  y: 6,  w: 3,  h: 4 },
    { i: 'weather-clock',     x: 8,  y: 6,  w: 2,  h: 4 },
    { i: 'kpi-ativos',        x: 0,  y: 10, w: 3,  h: 3 },
    { i: 'kpi-mrr',           x: 3,  y: 10, w: 3,  h: 3 },
    { i: 'kpi-retencao',      x: 6,  y: 10, w: 2,  h: 3 },
    { i: 'kpi-saldo',         x: 8,  y: 10, w: 2,  h: 3 },
    { i: 'alertas-criticos',  x: 0,  y: 13, w: 5,  h: 4 },
    { i: 'gemini-chat',       x: 5,  y: 13, w: 5,  h: 4 },
  ],
  md: [
    { i: 'dre-sparkline',     x: 0,  y: 0,  w: 6,  h: 5 },
    { i: 'clientes-progresso',x: 0,  y: 5,  w: 6,  h: 5 },
    { i: 'morning-briefing',  x: 0,  y: 10, w: 6,  h: 4 },
    { i: 'acoes-dia',         x: 0,  y: 14, w: 3,  h: 4 },
    { i: 'weather-clock',     x: 3,  y: 14, w: 3,  h: 4 },
    { i: 'kpi-ativos',        x: 0,  y: 18, w: 3,  h: 3 },
    { i: 'kpi-mrr',           x: 3,  y: 18, w: 3,  h: 3 },
    { i: 'kpi-retencao',      x: 0,  y: 21, w: 3,  h: 3 },
    { i: 'kpi-saldo',         x: 3,  y: 21, w: 3,  h: 3 },
    { i: 'alertas-criticos',  x: 0,  y: 24, w: 3,  h: 4 },
    { i: 'gemini-chat',       x: 3,  y: 24, w: 3,  h: 4 },
  ],
  sm: [
    { i: 'dre-sparkline',     x: 0, y: 0,  w: 2, h: 5 },
    { i: 'clientes-progresso',x: 0, y: 5,  w: 2, h: 6 },
    { i: 'morning-briefing',  x: 0, y: 11, w: 2, h: 4 },
    { i: 'acoes-dia',         x: 0, y: 15, w: 2, h: 5 },
    { i: 'weather-clock',     x: 0, y: 20, w: 2, h: 3 },
    { i: 'kpi-ativos',        x: 0, y: 23, w: 2, h: 3 },
    { i: 'kpi-mrr',           x: 0, y: 26, w: 2, h: 3 },
    { i: 'kpi-retencao',      x: 0, y: 29, w: 2, h: 3 },
    { i: 'kpi-saldo',         x: 0, y: 32, w: 2, h: 3 },
    { i: 'alertas-criticos',  x: 0, y: 35, w: 2, h: 4 },
    { i: 'gemini-chat',       x: 0, y: 39, w: 2, h: 4 },
  ],
}

export default function DashboardPage() {
  const { dados, loading, metricas, recarregar } = useClientes()
  const [saldoGoogle, setSaldoGoogle] = useState<number | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [layouts, setLayouts] = useState<Record<string, any[]>>(DEFAULT_LAYOUTS)
  const [containerWidth, setContainerWidth] = useState(1200)
  const containerRef = useRef<HTMLDivElement>(null)

  // Medir largura do container para passar ao RGL
  const measureWidth = useCallback(() => {
    if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth)
  }, [])

  useEffect(() => {
    measureWidth()
    const ro = new ResizeObserver(measureWidth)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [measureWidth])

  // Carregar layout salvo
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setLayouts(JSON.parse(saved) as Layouts)
    } catch {}
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLayoutChange = (_: any[], allLayouts: Record<string, any[]>) => {
    setLayouts(allLayouts)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts)) } catch {}
  }

  const handleReset = () => {
    setLayouts(DEFAULT_LAYOUTS)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    toast.success('Layout resetado')
  }

  useEffect(() => {
    supabase
      .from('clientes')
      .select('saldo_google')
      .eq('status', 'ativo')
      .then(({ data }) => {
        const total = ((data ?? []) as { saldo_google?: number }[]).reduce((s, c) => s + (c.saldo_google ?? 0), 0)
        setSaldoGoogle(total)
      })
  }, [])

  const progresso = dados.filter((d) =>
    d.cliente.status !== 'congelado' && d.cliente.status !== 'cancelado'
  )

  const acoesDoDia = useMemo(() => {
    const acoes: AcaoItem[] = []
    dados.forEach(({ cliente, estagio }) => {
      const dias = cliente.dias_atraso ?? 0
      if (dias >= 15) {
        acoes.push({ cliente, estagio, urgencia: 'critica', descricao: `${dias} dias sem pagamento — envie notificação de rescisão`, acaoLabel: '#COBRANÇA', whatsapp: cliente.whatsapp ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}. Em razão do atraso de ${dias} dias, comunicamos a rescisão contratual.`)}` : undefined })
      } else if (dias >= 7) {
        acoes.push({ cliente, estagio, urgencia: 'atencao', descricao: `${dias} dias em atraso — campanha em risco de suspensão`, acaoLabel: '#ALERTA D+7', whatsapp: cliente.whatsapp ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}! Seu pagamento está em atraso há ${dias} dias.`)}` : undefined })
      } else if (cliente.status === 'recebido') {
        acoes.push({ cliente, estagio, urgencia: 'atencao', descricao: 'Novo cliente — envie o #BOASVINDAS agora', acaoLabel: '#BOASVINDAS', whatsapp: cliente.whatsapp ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent('Olá! Seja bem-vindo(a) à Adsgator!')}` : undefined })
      } else if (cliente.status === 'congelado') {
        acoes.push({ cliente, estagio, urgencia: 'review', descricao: 'Cliente retido — envie lembrete de retorno', acaoLabel: 'Lembrete', whatsapp: cliente.whatsapp ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}! Ainda aguardamos seu retorno.`)}` : undefined })
      }
    })
    const ORDEM: Record<string, number> = { critica: 0, atencao: 1, review: 2 }
    return acoes.sort((a, b) => ORDEM[a.urgencia] - ORDEM[b.urgencia]).slice(0, 5)
  }, [dados])

  async function handleCongelar(clienteId: string) {
    await supabase.from('clientes').update({ status: 'congelado' }).eq('id', clienteId)
    recarregar()
  }

  const topBarActions = (
    <div className="flex items-center gap-[0.5rem]">
      <button
        onClick={handleReset}
        title="Resetar layout"
        className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary hover:text-ink-primary transition-colors"
      >
        <RotateCcw className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
      </button>
      <button
        onClick={recarregar}
        disabled={loading}
        className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary hover:text-ink-primary transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-[0.875rem] h-[0.875rem] ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
      </button>
      <button className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors">
        <Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        <span className="hidden sm:inline">Importar</span>
      </button>
    </div>
  )

  return (
    <MainLayout
      title="Dashboard"
      subtitle={`Semana de ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
      actions={topBarActions}
    >
      <div className="page-enter space-y-[1.5rem]" ref={containerRef}>
        {/* ════════════════════════════════════════════════════════════ */}
        {/* KPIs Compactos (3 cards) — Fixo                             */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1rem]">
          <KpiCompactCard
            label="Total Balance"
            value={fmt(saldoGoogle !== null ? saldoGoogle : 0)}
            delta={saldoGoogle !== null && saldoGoogle > 0 ? '+5.2%' : undefined}
            deltaDir={saldoGoogle !== null && saldoGoogle > 0 ? 'up' : 'down'}
            accentColor="blue"
            icon={<CreditCard className="w-[1.25rem] h-[1.25rem] text-status-blue" strokeWidth={2} />}
          />
          <KpiCompactCard
            label="Profit"
            value={`R$ ${metricas.mrr.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
            delta={metricas.ativos > 0 ? '+12.5%' : undefined}
            deltaDir="up"
            accentColor="green"
            icon={<DollarSign className="w-[1.25rem] h-[1.25rem] text-status-green" strokeWidth={2} />}
          />
          <KpiCompactCard
            label="Clientes Ativos"
            value={metricas.ativos}
            delta={metricas.ativos > 0 ? `${metricas.taxaRetencao}%` : undefined}
            deltaDir="up"
            accentColor="amber"
            icon={<Users className="w-[1.25rem] h-[1.25rem] text-ads-500" strokeWidth={2} />}
          />
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* SEÇÃO 1 — Trending + Quick Exchange (lado a lado)            */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1rem]">
          <TrendingOnMarket />
          <QuickExchange />
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* SEÇÃO 2 — Recent Transactions (full width)                   */}
        {/* ════════════════════════════════════════════════════════════ */}
        <RecentTransactions />

        {/* ════════════════════════════════════════════════════════════ */}
        {/* GRID CUSTOMIZÁVEL — (Rest da Dashboard anterior)            */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div>
          <p className="text-ink-muted text-xs font-medium uppercase tracking-wider mb-[1rem]">Mais widgets</p>
          <RGLResponsive
            className="layout"
            layouts={layouts}
            breakpoints={BREAKPOINTS}
            cols={COLS}
            rowHeight={80}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            draggableHandle=".bento-drag-handle"
            onLayoutChange={handleLayoutChange}
            width={containerWidth}
            useCSSTransforms
            isResizable
            isDraggable
          >
          {/* ── KPIs ─────────────────────────────── */}
          <div key="kpi-ativos">
            <BentoCard noPadding>
              {loading
                ? <div className="h-full rounded-xl skeleton-shimmer" />
                : <KpiCard label="Clientes Ativos" value={metricas.ativos} accentColor="amber" icon={<Users className="w-[1rem] h-[1rem]" strokeWidth={1.75} />} href="/clientes" />
              }
            </BentoCard>
          </div>

          <div key="kpi-mrr">
            <BentoCard noPadding>
              {loading
                ? <div className="h-full rounded-xl skeleton-shimmer" />
                : <KpiCard label="MRR" value={`R$ ${metricas.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} accentColor="green" icon={<DollarSign className="w-[1rem] h-[1rem]" strokeWidth={1.75} />} href="/financeiro" />
              }
            </BentoCard>
          </div>

          <div key="kpi-retencao">
            <BentoCard noPadding>
              {loading
                ? <div className="h-full rounded-xl skeleton-shimmer" />
                : <KpiCard label="Taxa de Retenção" value={`${metricas.taxaRetencao}%`} accentColor="red" icon={<Percent className="w-[1rem] h-[1rem]" strokeWidth={1.75} />} />
              }
            </BentoCard>
          </div>

          <div key="kpi-saldo">
            <BentoCard noPadding>
              {loading
                ? <div className="h-full rounded-xl skeleton-shimmer" />
                : <KpiCard label="Saldo Google" value={saldoGoogle !== null ? `R$ ${saldoGoogle.toLocaleString('pt-BR')}` : '…'} delta={saldoGoogle !== null && saldoGoogle < 200 ? 'Baixo' : undefined} deltaDir={saldoGoogle !== null && saldoGoogle < 200 ? 'down' : undefined} accentColor="blue" alert={saldoGoogle !== null && saldoGoogle < 200} alertLabel="Envie #SALDOGOOGLE" icon={<CreditCard className="w-[1rem] h-[1rem]" strokeWidth={1.75} />} />
              }
            </BentoCard>
          </div>

          {/* ── MORNING BRIEFING ─────────────────── */}
          <div key="morning-briefing">
            <BentoCard noPadding>
              <MorningBriefing />
            </BentoCard>
          </div>

          {/* ── WEATHER CLOCK ────────────────────── */}
          <div key="weather-clock">
            <BentoCard noPadding>
              <WeatherClock />
            </BentoCard>
          </div>

          {/* ── AÇÕES DO DIA ─────────────────────── */}
          <div key="acoes-dia">
            <BentoCard title="Ações do Dia" subtitle="Prioridades de hoje">
              {loading || acoesDoDia.length === 0
                ? <div className="flex items-center justify-center h-full text-ink-muted text-[0.8125rem]">Nenhuma ação pendente</div>
                : <AcoesDoDia items={acoesDoDia} onCongelar={handleCongelar} />
              }
            </BentoCard>
          </div>

          {/* ── CLIENTES EM PROGRESSO ────────────── */}
          <div key="clientes-progresso">
            <BentoCard
              title="Clientes em Progresso"
              subtitle={`${progresso.length} de ${metricas.total} clientes`}
              actions={<a href="/clientes" className="text-ads-500 text-[0.75rem] hover:underline">Ver todos</a>}
            >
              {loading ? (
                <div className="flex flex-col gap-[0.5rem]">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[2.75rem] rounded-lg skeleton-shimmer" />)}
                </div>
              ) : progresso.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-ink-muted gap-[0.5rem]">
                  <Users className="w-[2rem] h-[2rem]" strokeWidth={1} />
                  <p className="text-[0.8125rem]">Nenhum cliente em progresso</p>
                </div>
              ) : (
                <div className="flex flex-col overflow-y-auto h-full">
                  {progresso.slice(0, 10).map(({ cliente }) => {
                    const iniciais = cliente.nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
                    const diasAtraso = cliente.dias_atraso ?? 0
                    const STATUS_DOT: Record<string, string> = {
                      ativo: 'bg-status-green', recebido: 'bg-status-blue',
                      onboarding: 'bg-ads-500',  setup_trafego: 'bg-status-orange',
                      congelado: 'bg-ink-muted',  cancelado: 'bg-status-red',
                    }
                    const STATUS_LABEL: Record<string, string> = {
                      ativo: 'Ativo', recebido: 'Recebido', onboarding: 'Onboarding',
                      setup_trafego: 'Setup Tráfego', congelado: 'Congelado', cancelado: 'Cancelado',
                    }
                    return (
                      <div key={cliente.id} className="flex items-center gap-[0.75rem] py-[0.625rem] border-b border-surface-border/40 last:border-0 group">
                        <div className="w-[2rem] h-[2rem] rounded-full bg-ads-500/15 flex items-center justify-center shrink-0">
                          <span className="text-ads-500 text-[0.6875rem] font-bold">{iniciais}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-ink-primary text-[0.8125rem] font-semibold truncate leading-tight">{cliente.nome}</p>
                          <div className="flex items-center gap-[0.375rem] mt-[0.125rem]">
                            <span className={`w-[0.375rem] h-[0.375rem] rounded-full shrink-0 ${STATUS_DOT[cliente.status] ?? 'bg-ink-muted'}`} />
                            <span className="text-ink-muted text-[0.6875rem]">{STATUS_LABEL[cliente.status] ?? cliente.status}</span>
                            {diasAtraso > 0 && <span className="text-status-red text-[0.6875rem] font-medium">{diasAtraso}d atraso</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-[0.25rem] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {cliente.whatsapp && (
                            <a href={`https://wa.me/${cliente.whatsapp}`} target="_blank" rel="noreferrer"
                              className="w-[1.625rem] h-[1.625rem] flex items-center justify-center rounded-md bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors">
                              <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                            </a>
                          )}
                          <a href={`/clientes/${cliente.id}`}
                            className="w-[1.625rem] h-[1.625rem] flex items-center justify-center rounded-md bg-surface-hover text-ink-secondary hover:text-ink-primary transition-colors">
                            <ExternalLink className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                          </a>
                          <button onClick={() => handleCongelar(cliente.id)}
                            className="w-[1.625rem] h-[1.625rem] flex items-center justify-center rounded-md bg-surface-hover text-ink-secondary hover:text-ink-primary transition-colors">
                            <PauseCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </BentoCard>
          </div>

          {/* ── DRE SPARKLINE ────────────────────── */}
          <div key="dre-sparkline">
            <BentoCard noPadding>
              <DRESparkline />
            </BentoCard>
          </div>

          {/* ── ALERTAS CRÍTICOS ─────────────────── */}
          <div key="alertas-criticos">
            <BentoCard noPadding>
              <AlertasCriticos />
            </BentoCard>
          </div>

          {/* ── GEMINI CHAT ──────────────────────── */}
          <div key="gemini-chat">
            <BentoCard noPadding>
              <GeminiChat />
            </BentoCard>
          </div>
        </RGLResponsive>
        </div>
      </div>
    </MainLayout>
  )
}
```

### `app\(app)\financeiro\page.tsx`

```tsx
﻿'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  TrendingUp, DollarSign, AlertCircle,
  MessageCircle, RefreshCw, Users, Download,
  Target, Clock, Zap,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { MainLayout } from '@/components/layout/MainLayout'
import { supabase }   from '@/lib/supabase'
import type { FinanceiroLancamento, Cliente } from '@/lib/types'

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const pct = (parte: number, total: number) =>
  total > 0 ? ((parte / total) * 100).toFixed(1) : '0.0'

interface DRE {
  mrr:               number
  custos_fixos:      number
  custos_variaveis:  number
  lucro_bruto:       number
  imposto_estimado:  number
  tipo_tributacao:   string
  lucro_liquido:     number
  margem:            number
}

interface SaudeSaaS {
  ltv:           number
  cac:           number
  ltv_cac:       number
  payback_meses: number
  churn_rate:    number
  novos_mes:     number
}

interface SparkMes {
  mes:   string
  mrr:   number
  lucro: number
}

interface ProjecaoMes {
  mes:    string
  mrr:    number
  lucro:  number
}

function gerarCSV(lancamentos: FinanceiroLancamento[]): void {
  const header = ['Data', 'Descrição', 'Tipo', 'Valor', 'Status']
  const rows   = lancamentos.map((l) => [
    new Date(l.data).toLocaleDateString('pt-BR'),
    `"${l.descricao}"`,
    l.tipo,
    l.valor.toFixed(2).replace('.', ','),
    l.status ?? '',
  ])
  const csv  = [header, ...rows].map((r) => r.join(';')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `financeiro_${new Date().toISOString().slice(0, 7)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function FinanceiroPage() {
  const [dre,          setDre]          = useState<DRE | null>(null)
  const [saude,        setSaude]        = useState<SaudeSaaS | null>(null)
  const [lancamentos,  setLancamentos]  = useState<FinanceiroLancamento[]>([])
  const [todosLancs,   setTodosLancs]   = useState<FinanceiroLancamento[]>([])
  const [atrasados,    setAtrasados]    = useState<Cliente[]>([])
  const [sparkData,    setSparkData]    = useState<SparkMes[]>([])
  const [projecao,     setProjecao]     = useState<ProjecaoMes[]>([])
  const [loading,      setLoading]      = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const mesInicio = new Date()
      mesInicio.setDate(1)
      const mesInicioStr = mesInicio.toISOString().split('T')[0]

      const doze = new Date()
      doze.setMonth(doze.getMonth() - 12)
      const dozeStr = doze.toISOString().split('T')[0]

      const [{ data: lancs }, { data: todosL }, { data: atr }, { data: config }, { data: historico }] = await Promise.all([
        supabase.from('financeiro_lancamentos').select('*').gte('data', mesInicioStr).order('data', { ascending: false }),
        supabase.from('financeiro_lancamentos').select('*').gte('data', dozeStr).order('data', { ascending: true }),
        supabase.from('clientes').select('*').gt('dias_atraso', 0).neq('status', 'cancelado'),
        supabase.from('configuracoes_financeiras').select('custos_fixos_mensais,custos_variaveis_percentual,tipo_tributacao,imposto_percentual').eq('agencia_id', 'adsgator-main').single(),
        supabase.from('historico_acoes').select('tipo, created_at').in('tipo', ['cliente_criado', 'cancelado']).order('created_at', { ascending: true }),
      ])

      const lista = (lancs ?? []) as FinanceiroLancamento[]
      const todos = (todosL ?? []) as FinanceiroLancamento[]
      setLancamentos(lista)
      setTodosLancs(todos)
      setAtrasados((atr ?? []) as Cliente[])

      // ── DRE do mês ──────────────────────────────────────────────────
      const mrr       = lista.filter((l) => l.tipo === 'receita' && l.status === 'confirmado').reduce((s, l) => s + l.valor, 0)
      const fixos     = lista.filter((l) => l.tipo === 'custo_fixo').reduce((s, l) => s + l.valor, 0)
      const variav    = lista.filter((l) => l.tipo === 'custo_variavel').reduce((s, l) => s + l.valor, 0)
      const cfgTyped  = config as { custos_fixos_mensais?: number; custos_variaveis_percentual?: number; tipo_tributacao?: string; imposto_percentual?: number } | null
      const impostoP  = cfgTyped?.imposto_percentual ?? 11.0
      const tipoTrib  = cfgTyped?.tipo_tributacao ?? 'MEI'
      const imposto   = mrr * (impostoP / 100)
      const lucroB    = mrr - fixos
      const lucroL    = lucroB - variav - imposto
      setDre({ mrr, custos_fixos: fixos, custos_variaveis: variav, lucro_bruto: lucroB, imposto_estimado: imposto, tipo_tributacao: tipoTrib, lucro_liquido: lucroL, margem: mrr > 0 ? (lucroL / mrr) * 100 : 0 })

      // ── Sparkline 12 meses ──────────────────────────────────────────
      const porMes: Record<string, { receita: number; custo: number }> = {}
      for (const l of todos) {
        const mes = l.data.slice(0, 7)
        if (!porMes[mes]) porMes[mes] = { receita: 0, custo: 0 }
        if (l.tipo === 'receita') porMes[mes].receita += l.valor
        else porMes[mes].custo += l.valor
      }
      const spark = Object.entries(porMes).sort(([a], [b]) => a.localeCompare(b)).map(([mes, v]) => ({
        mes: new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        mrr: Math.round(v.receita),
        lucro: Math.round(v.receita - v.custo),
      }))
      setSparkData(spark)

      // ── Projeção 6 meses ────────────────────────────────────────────
      const ultimos3 = spark.slice(-3)
      const trendMrr = ultimos3.length >= 2
        ? (ultimos3[ultimos3.length - 1].mrr - ultimos3[0].mrr) / Math.max(ultimos3.length - 1, 1)
        : 0
      const mrrBase  = spark[spark.length - 1]?.mrr ?? mrr
      const fixosCfg = cfgTyped?.custos_fixos_mensais ?? fixos
      const varPct   = cfgTyped?.custos_variaveis_percentual ?? 0

      const proj: ProjecaoMes[] = Array.from({ length: 6 }, (_, i) => {
        const d    = new Date()
        d.setMonth(d.getMonth() + i + 1)
        const mrrP = Math.max(0, mrrBase + trendMrr * (i + 1))
        const custP = fixosCfg + mrrP * (varPct / 100)
        return {
          mes:   d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          mrr:   Math.round(mrrP),
          lucro: Math.round(mrrP - custP),
        }
      })
      setProjecao(proj)

      // ── Saúde SaaS ──────────────────────────────────────────────────
      const hist = (historico ?? []) as { tipo: string; created_at: string }[]
      const criados    = hist.filter((h) => h.tipo === 'cliente_criado')
      const cancelados = hist.filter((h) => h.tipo === 'cancelado')

      const vidaMedia = criados.length > 0 && cancelados.length > 0
        ? cancelados.reduce((sum, c) => {
            const criacao = criados.find((cr) => cr.created_at < c.created_at)
            if (!criacao) return sum
            return sum + (new Date(c.created_at).getTime() - new Date(criacao.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
          }, 0) / cancelados.length
        : 24

      const mrrMedio = mrr > 0 && criados.length > 0 ? mrr / criados.length : mrr
      const ltv      = mrrMedio * vidaMedia
      const cac      = fixos > 0 ? fixos * 0.3 : 500
      const novosMs  = criados.filter((c) => c.created_at >= mesInicioStr).length
      const churn    = criados.length > 0 ? (cancelados.filter((c) => c.created_at >= mesInicioStr).length / criados.length) * 100 : 0

      setSaude({
        ltv,
        cac,
        ltv_cac:       cac > 0 ? ltv / cac : 0,
        payback_meses: mrrMedio > 0 ? cac / mrrMedio : 0,
        churn_rate:    churn,
        novos_mes:     novosMs,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (loading || !dre) {
    return (
      <MainLayout title="Financeiro" subtitle="Saúde financeira em tempo real">
        <div className="flex items-center justify-center h-[20rem]">
          <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    )
  }

  const kpis = [
    { label: 'MRR',          valor: fmt(dre.mrr),          sub: 'Receita do mês',  icon: TrendingUp,   cor: 'text-ads-500'     },
    { label: 'Lucro Bruto',  valor: fmt(dre.lucro_bruto),  sub: `${pct(dre.lucro_bruto, dre.mrr)}% da receita`, icon: DollarSign, cor: 'text-status-green' },
    { label: 'Custos',       valor: fmt(dre.custos_fixos + dre.custos_variaveis), sub: 'Fixos + Variáveis', icon: AlertCircle, cor: 'text-status-orange' },
    { label: 'Lucro Líquido', valor: fmt(dre.lucro_liquido), sub: `Margem: ${dre.margem.toFixed(1)}%`, icon: TrendingUp, cor: dre.lucro_liquido >= 0 ? 'text-status-green' : 'text-status-red' },
  ]

  return (
    <MainLayout
      title="Financeiro"
      subtitle="Saúde financeira em tempo real"
      actions={
        <div className="flex items-center gap-[0.5rem]">
          <button
            onClick={() => gerarCSV(todosLancs)}
            disabled={todosLancs.length === 0}
            className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] hover:text-ink-primary transition-colors disabled:opacity-40"
          >
            <Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
            CSV
          </button>
          <button onClick={carregar} className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] hover:text-ink-primary transition-colors">
            <RefreshCw className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
            Atualizar
          </button>
        </div>
      }
    >
      <div className="page-enter">
      {/* ══ KPIs BENTO GRID ═══════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1rem] mb-[2rem]">
        {/* Card principal — MRR */}
        <div className="col-span-2 bg-gradient-to-br from-ads-500/20 to-ads-600/10 border border-ads-500/30 rounded-xl p-[1.25rem]">
          <div className="flex items-start justify-between mb-[0.5rem]">
            <p className="text-ads-400 text-[0.6875rem] uppercase tracking-wide font-semibold">MRR Mensal</p>
            <TrendingUp className="w-[1.25rem] h-[1.25rem] text-ads-500" strokeWidth={2} />
          </div>
          <p className="text-[2.5rem] font-bold leading-none text-ads-400 mb-[0.5rem]">{fmt(dre.mrr)}</p>
          <p className="text-ads-500/70 text-[0.8125rem]">Receita Recorrente Mensal</p>
        </div>
        
        {/* Lucro Bruto */}
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem]">
          <div className="flex items-start justify-between mb-[0.5rem]">
            <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">Lucro Bruto</p>
            <DollarSign className="w-[1rem] h-[1rem] text-status-green" strokeWidth={1.5} />
          </div>
          <p className="text-[1.75rem] font-bold leading-none text-status-green mb-[0.375rem]">{fmt(dre.lucro_bruto)}</p>
          <p className="text-ink-muted text-[0.75rem]">{pct(dre.lucro_bruto, dre.mrr)}% da receita</p>
        </div>
        
        {/* Lucro Líquido */}
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem]">
          <div className="flex items-start justify-between mb-[0.5rem]">
            <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">Lucro Líquido</p>
            <TrendingUp className={`w-[1rem] h-[1rem] ${dre.lucro_liquido >= 0 ? 'text-status-green' : 'text-status-red'}`} strokeWidth={1.5} />
          </div>
          <p className={`text-[1.75rem] font-bold leading-none mb-[0.375rem] ${dre.lucro_liquido >= 0 ? 'text-status-green' : 'text-status-red'}`}>{fmt(dre.lucro_liquido)}</p>
          <p className="text-ink-muted text-[0.75rem]">Margem {dre.margem.toFixed(1)}%</p>
        </div>
      </div>

      {/* ══ SAÚDE SAAS ════════════════════════════════════════════ */}
      {saude && (
        <div className="mb-[2rem]">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1rem]">Métricas de Saúde SaaS</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[0.75rem]">
            {[
              { label: 'LTV',          valor: fmt(saude.ltv),                          icon: DollarSign, cor: 'text-status-green',  tip: 'Valor vitalicio médio' },
              { label: 'CAC',          valor: fmt(saude.cac),                          icon: Target,     cor: 'text-status-orange', tip: 'Custo de aquisição' },
              { label: 'LTV/CAC',      valor: `${saude.ltv_cac.toFixed(1)}x`,          icon: Zap,        cor: saude.ltv_cac >= 30 ? 'text-status-green' : saude.ltv_cac >= 10 ? 'text-ads-500' : 'text-status-red', tip: 'Meta: > 30x' },
              { label: 'Payback',      valor: `${saude.payback_meses.toFixed(1)}m`,    icon: Clock,      cor: saude.payback_meses <= 12 ? 'text-status-green' : 'text-status-orange', tip: 'Meses para recuperar CAC' },
              { label: 'Churn Rate',   valor: `${saude.churn_rate.toFixed(1)}%`,       icon: AlertCircle,cor: saude.churn_rate <= 2 ? 'text-status-green' : 'text-status-red', tip: 'Taxa de cancelamento' },
              { label: 'Novos/Mês',   valor: String(saude.novos_mes),                 icon: Users,      cor: 'text-status-blue', tip: 'Novos clientes este mês' },
            ].map(({ label, valor, icon: Icon, cor, tip }) => (
              <div key={label} className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow px-[1rem] py-[0.875rem]" title={tip}>
                <div className="flex items-center justify-between mb-[0.375rem]">
                  <p className="text-ink-muted text-[0.625rem] uppercase tracking-wide font-semibold">{label}</p>
                  <Icon className={`w-[0.75rem] h-[0.75rem] ${cor}`} strokeWidth={1.5} />
                </div>
                <p className={`text-[1.25rem] font-bold leading-none ${cor}`}>{valor}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ DRE VISUAL — Demonstração de Resultado ══════════════════ */}
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem] mb-[2rem]">
        <div className="flex items-center justify-between mb-[1.25rem]">
          <div>
            <h3 className="text-ink-primary font-semibold text-[0.9375rem]">
              Demonstração do Resultado
            </h3>
            <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className={`text-[0.75rem] font-semibold px-[0.625rem] py-[0.25rem] rounded-full ${
            dre.margem >= 30 ? 'bg-status-green/10 text-status-green'
            : dre.margem >= 15 ? 'bg-ads-500/10 text-ads-400'
            : 'bg-status-red/10 text-status-red'
          }`}>
            Margem {dre.margem.toFixed(1)}%
          </span>
        </div>

        <div className="space-y-[0]">
          {/* Receita */}
          <div className="flex items-center justify-between py-[0.75rem] border-b border-surface-border">
            <div className="flex items-center gap-[0.75rem]">
              <div className="w-[0.1875rem] h-[2rem] rounded-full bg-ads-400" />
              <div>
                <p className="text-ink-primary font-semibold text-[0.9375rem]">Receita Operacional</p>
                <p className="text-ink-muted text-[0.6875rem]">MRR confirmado do período</p>
              </div>
            </div>
            <p className="text-ads-400 font-black text-[1.25rem] font-mono">{fmt(dre.mrr)}</p>
          </div>

          {/* Custos fixos */}
          <div className="flex items-center justify-between py-[0.625rem] pl-[1rem]">
            <div className="flex items-center gap-[0.5rem]">
              <div className="w-[0.125rem] h-[1.5rem] rounded-full bg-status-blue/40" />
              <p className="text-ink-secondary text-[0.875rem]">Custos Fixos</p>
            </div>
            <p className="text-status-blue font-semibold font-mono text-[0.9375rem]">({fmt(dre.custos_fixos)})</p>
          </div>

          {/* Custos variáveis */}
          <div className="flex items-center justify-between py-[0.625rem] pl-[1rem] border-b border-surface-border">
            <div className="flex items-center gap-[0.5rem]">
              <div className="w-[0.125rem] h-[1.5rem] rounded-full bg-status-orange/40" />
              <p className="text-ink-secondary text-[0.875rem]">Custos Variáveis</p>
            </div>
            <p className="text-status-orange font-semibold font-mono text-[0.9375rem]">({fmt(dre.custos_variaveis)})</p>
          </div>

          {/* = Lucro Bruto */}
          <div className="flex items-center justify-between py-[0.75rem] border-b border-surface-border bg-surface-hover/50 px-[0.5rem] rounded-[0.375rem] my-[0.25rem]">
            <div className="flex items-center gap-[0.75rem]">
              <div className="w-[0.1875rem] h-[2rem] rounded-full bg-status-green" />
              <div>
                <p className="text-ink-primary font-semibold text-[0.9375rem]">= Lucro Bruto</p>
                <p className="text-ink-muted text-[0.6875rem]">{pct(dre.lucro_bruto, dre.mrr)}% da receita</p>
              </div>
            </div>
            <p className="text-status-green font-black text-[1.125rem] font-mono">{fmt(dre.lucro_bruto)}</p>
          </div>

          {/* Imposto */}
          <div className="flex items-center justify-between py-[0.625rem] pl-[1rem] border-b border-surface-border">
            <div className="flex items-center gap-[0.5rem]">
              <div className="w-[0.125rem] h-[1.5rem] rounded-full bg-status-purple/40" />
              <p className="text-ink-secondary text-[0.875rem]">
                Imposto ({dre.tipo_tributacao} · {((dre.imposto_estimado / (dre.mrr || 1)) * 100).toFixed(0)}%)
              </p>
            </div>
            <p className="text-status-purple font-semibold font-mono text-[0.9375rem]">({fmt(dre.imposto_estimado)})</p>
          </div>

          {/* = Lucro Líquido */}
          <div className={`flex items-center justify-between py-[0.875rem] px-[0.75rem] rounded-[0.5rem] mt-[0.25rem] ${
            dre.lucro_liquido >= 0 ? 'bg-status-green/5 border border-status-green/20' : 'bg-status-red/5 border border-status-red/20'
          }`}>
            <div className="flex items-center gap-[0.75rem]">
              <div className={`w-[0.25rem] h-[2.5rem] rounded-full ${dre.lucro_liquido >= 0 ? 'bg-status-green' : 'bg-status-red'}`} />
              <div>
                <p className="text-ink-primary font-bold text-[1rem]">= Lucro Líquido</p>
                <p className="text-ink-muted text-[0.6875rem]">Após impostos e todos os custos</p>
              </div>
            </div>
            <p className={`font-black text-[1.5rem] font-mono ${dre.lucro_liquido >= 0 ? 'text-status-green' : 'text-status-red'}`}>
              {fmt(dre.lucro_liquido)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] mb-[2rem]">
        {/* ── DRE DISTRIBUIÇÃO ── */}
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1.25rem]">
            Distribuição da Receita
          </h3>
          {[
            { label: 'Custos Variáveis',                                 valor: dre.custos_variaveis,           cor: 'bg-status-orange' },
            { label: 'Custos Fixos',                                     valor: dre.custos_fixos,               cor: 'bg-status-blue'   },
            { label: `Imposto Est. (${dre.tipo_tributacao} ${((dre.imposto_estimado / (dre.mrr || 1)) * 100).toFixed(0)}%)`, valor: dre.imposto_estimado, cor: 'bg-status-purple' },
            { label: 'Lucro Líquido',                                    valor: Math.max(dre.lucro_liquido, 0), cor: 'bg-ads-500'       },
          ].map(({ label, valor, cor }) => (
            <div key={label} className="mb-[1rem]">
              <div className="flex justify-between items-center mb-[0.375rem]">
                <p className="text-ink-secondary text-[0.875rem]">{label}</p>
                <p className="text-ink-primary text-[0.875rem] font-semibold">
                  {pct(valor, dre.mrr)}% · {fmt(valor)}
                </p>
              </div>
              <div className="h-[0.25rem] bg-surface-hover rounded-full overflow-hidden">
                <div className={`h-full ${cor} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(parseFloat(pct(valor, dre.mrr)), 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── ÚCTIMOS LANÇAMENTOS ── */}
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1.25rem]">
            Últimos lançamentos do mês
          </h3>
          <div className="flex flex-col gap-[0.75rem]">
            {lancamentos.slice(0, 6).map((l) => (
              <div key={l.id} className="flex items-center justify-between">
                <div>
                  <p className="text-ink-secondary text-[0.875rem]">{l.descricao}</p>
                  <p className="text-ink-muted text-[0.6875rem]">{new Date(l.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <p className={`text-[0.9375rem] font-semibold ${
                  l.tipo === 'receita' ? 'text-status-green' : 'text-status-red'
                }`}>
                  {l.tipo === 'receita' ? '+' : '-'}{fmt(l.valor)}
                </p>
              </div>
            ))}
            {lancamentos.length === 0 && (
              <p className="text-ink-muted text-[0.875rem]">Nenhum lançamento este mês.</p>
            )}
          </div>
        </div>
      </div>

      {/* ══ RECHARTS MRR 12 MESES ═══════════════════════════════════ */}
      {sparkData.length > 1 && (
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem] mb-[2rem]">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1.25rem]">
            Evolução MRR — 12 meses
          </h3>
          <div className="h-[14rem]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                  formatter={(v: unknown, name: unknown) => [fmt(Number(v)), (name as string) === 'mrr' ? 'MRR' : 'Lucro'] as [string, string]}
                />
                <ReferenceLine y={0} stroke="var(--status-red)" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="mrr"   stroke="#FFA500" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="lucro" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-[1.5rem] mt-[0.75rem]">
            {[{ cor: '#FFA500', label: 'MRR' }, { cor: '#10B981', label: 'Lucro Líquido' }].map(({ cor, label }) => (
              <div key={label} className="flex items-center gap-[0.375rem]">
                <div className="w-[1.5rem] h-[0.125rem] rounded-full" style={{ background: cor }} />
                <span className="text-ink-muted text-[0.75rem]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ PROJEÇÃO 6 MESES ══════════════════════════════════════ */}
      {projecao.length > 0 && (
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem] mb-[2rem]">
          <div className="flex items-center justify-between mb-[1.25rem]">
            <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Projeção 6 meses</h3>
            <span className="text-ink-muted text-[0.75rem]">
              Baseado no trend dos últimos 3 meses
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.875rem]">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Mês', 'MRR Proj.', 'Lucro Proj.', 'Margem'].map((h) => (
                    <th key={h} className="text-left pb-[0.75rem] text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projecao.map((p) => (
                  <tr key={p.mes} className="border-b border-surface-border last:border-0">
                    <td className="py-[0.75rem] text-ink-secondary font-medium capitalize">{p.mes}</td>
                    <td className="py-[0.75rem] text-ads-500 font-semibold">{fmt(p.mrr)}</td>
                    <td className={`py-[0.75rem] font-semibold ${p.lucro >= 0 ? 'text-status-green' : 'text-status-red'}`}>{fmt(p.lucro)}</td>
                    <td className="py-[0.75rem] text-ink-muted">
                      {p.mrr > 0 ? `${((p.lucro / p.mrr) * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CLIENTES EM ATRASO ── */}
      {atrasados.length > 0 && (
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
          <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
            <Users className="w-[1rem] h-[1rem] text-status-red" strokeWidth={1.75} />
            <h3 className="text-ink-primary font-semibold text-[0.9375rem]">
              Inadimplentes ({atrasados.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Cliente', 'Atraso', 'MRR', 'Ação'].map((h) => (
                    <th key={h} className="text-left pb-[0.75rem] text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {atrasados.map((c) => (
                  <tr key={c.id} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                    <td className="py-[0.875rem]">
                      <p className="text-ink-primary font-medium text-[0.875rem]">{c.nome}</p>
                      <p className="text-ink-muted text-[0.75rem]">{c.email}</p>
                    </td>
                    <td className="py-[0.875rem]">
                      <span className={`inline-flex items-center text-[0.75rem] font-bold px-[0.5rem] py-[0.125rem] rounded ${
                        (c.dias_atraso ?? 0) >= 30 ? 'bg-status-red/15 text-status-red'
                        : (c.dias_atraso ?? 0) >= 15 ? 'bg-status-orange/15 text-status-orange'
                        : 'bg-yellow-500/15 text-yellow-500'
                      }`}>
                        {c.dias_atraso}d
                      </span>
                    </td>
                    <td className="py-[0.875rem] text-ink-primary font-semibold text-[0.875rem]">
                      {fmt(c.mrr ?? 0)}
                    </td>
                    <td className="py-[0.875rem]">
                      {c.whatsapp && (
                        <a
                          href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-[0.375rem] bg-ads-500/10 hover:bg-ads-500/20 text-ads-500 text-[0.75rem] font-semibold px-[0.625rem] h-[1.75rem] rounded transition-colors"
                        >
                          <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.5} />
                          WhatsApp
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </MainLayout>
  )
}
```

### `app\(app)\marketing\page.tsx`

```tsx
﻿'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Megaphone, Plus, Calendar, Edit3, Instagram,
  Facebook, Image, Video, Layers, Film,
  Clock, CheckCircle, AlertCircle, RefreshCw,
  Sparkles, X, Save,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { supabase }   from '@/lib/supabase'

type Rede   = 'instagram' | 'facebook'
type Tipo   = 'foto' | 'video' | 'carrossel' | 'reels'
type Status = 'rascunho' | 'agendado' | 'publicado' | 'falhou'

interface Post {
  id:            string
  cliente_id:    string | null
  rede:          Rede
  tipo:          Tipo
  texto:         string | null
  midia_url:     string | null
  hashtags:      string[] | null
  status:        Status
  agendado_para: string | null
  created_at:    string
}

interface ClienteOpcao { id: string; nome: string }

const REDE_ICON: Record<Rede, React.ElementType> = {
  instagram: Instagram,
  facebook:  Facebook,
}

const REDE_COR: Record<Rede, string> = {
  instagram: 'text-status-purple',
  facebook:  'text-status-blue',
}

const TIPO_ICON: Record<Tipo, React.ElementType> = {
  foto:      Image,
  video:     Video,
  carrossel: Layers,
  reels:     Film,
}

const STATUS_COR: Record<Status, string> = {
  rascunho:  'bg-ink-muted/15 text-ink-muted',
  agendado:  'bg-status-blue/15 text-status-blue',
  publicado: 'bg-status-green/15 text-status-green',
  falhou:    'bg-status-red/15 text-status-red',
}

const STATUS_ICON: Record<Status, React.ElementType> = {
  rascunho:  Edit3,
  agendado:  Clock,
  publicado: CheckCircle,
  falhou:    AlertCircle,
}

// ── MODAL CRIAR/EDITAR POST ─────────────────────────────────────────────────
function PostModal({
  post, clientes, onClose, onSaved,
}: {
  post?: Partial<Post>; clientes: ClienteOpcao[]; onClose: () => void; onSaved: () => void
}) {
  const [rede,          setRede]         = useState<Rede>(post?.rede ?? 'instagram')
  const [tipo,          setTipo]         = useState<Tipo>(post?.tipo ?? 'foto')
  const [texto,         setTexto]        = useState(post?.texto ?? '')
  const [hashtags,      setHashtags]     = useState((post?.hashtags ?? []).join(' '))
  const [clienteId,     setClienteId]    = useState(post?.cliente_id ?? '')
  const [agendadoPara,  setAgendadoPara] = useState(post?.agendado_para?.slice(0, 16) ?? '')
  const [gerandoIA,     setGerandoIA]    = useState(false)
  const [salvando,      setSalvando]     = useState(false)
  const [erro,          setErro]         = useState('')

  async function gerarHashtagsIA() {
    if (!texto.trim()) return
    setGerandoIA(true)
    try {
      const res  = await fetch('/api/ia/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, rede }),
      })
      const data = await res.json() as { hashtags?: string[] }
      if (data.hashtags) setHashtags(data.hashtags.join(' '))
    } catch {
      setHashtags('#marketing #socialmedia #digital')
    } finally {
      setGerandoIA(false)
    }
  }

  async function salvar(statusPost: Status) {
    setSalvando(true); setErro('')
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      user_id:      user?.id,
      rede, tipo,
      texto:        texto  || null,
      hashtags:     hashtags.split(/\s+/).filter(Boolean),
      cliente_id:   clienteId || null,
      agendado_para: agendadoPara || null,
      status:       statusPost,
    }
    const { error } = post?.id
      ? await supabase.from('posts_agendados').update(payload).eq('id', post.id)
      : await supabase.from('posts_agendados').insert(payload)
    if (error) { setErro(error.message); setSalvando(false); return }
    onSaved(); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow shadow-2xl w-full max-w-[32rem] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-[1.5rem] py-[1rem] border-b border-surface-border shrink-0">
          <p className="text-ink-primary font-semibold">{post?.id ? 'Editar Post' : 'Criar Post'}</p>
          <button onClick={onClose} className="text-ink-muted hover:text-ink-primary transition-colors">
            <X className="w-[1rem] h-[1rem]" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-[1.5rem] flex flex-col gap-[1rem]">
          {/* Rede + Tipo */}
          <div className="grid grid-cols-2 gap-[0.75rem]">
            <div>
              <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">Rede Social</label>
              <div className="flex gap-[0.375rem]">
                {(['instagram', 'facebook'] as Rede[]).map((r) => {
                  const Icon = REDE_ICON[r]
                  return (
                    <button key={r} type="button" onClick={() => setRede(r)}
                      className={`flex-1 flex items-center justify-center gap-[0.375rem] h-[2.5rem] rounded-lg border text-[0.8125rem] font-medium transition-colors capitalize ${rede === r ? 'border-ads-500 bg-ads-500/10 text-ads-500' : 'border-surface-border bg-surface-hover text-ink-secondary'}`}
                    >
                      <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as Tipo)}
                className="w-full h-[2.5rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30">
                <option value="foto">Foto</option>
                <option value="video">Vídeo</option>
                <option value="carrossel">Carrossel</option>
                <option value="reels">Reels</option>
              </select>
            </div>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">Cliente</label>
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}
              className="w-full h-[2.5rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30">
              <option value="">Sem cliente</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          {/* Texto */}
          <div>
            <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">Texto / Legenda</label>
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4}
              placeholder="Escreva a legenda do post…"
              className="w-full px-[0.75rem] py-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] resize-none focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
          </div>

          {/* Hashtags */}
          <div>
            <div className="flex items-center justify-between mb-[0.375rem]">
              <label className="text-ink-secondary text-[0.8125rem] font-medium">Hashtags</label>
              <button type="button" onClick={gerarHashtagsIA} disabled={gerandoIA || !texto.trim()}
                className="flex items-center gap-[0.25rem] text-[0.75rem] text-ads-500 hover:text-ads-600 disabled:opacity-40 transition-colors">
                {gerandoIA
                  ? <div className="w-[0.75rem] h-[0.75rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
                  : <Sparkles className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
                }
                Gerar com IA
              </button>
            </div>
            <input type="text" value={hashtags} onChange={(e) => setHashtags(e.target.value)}
              placeholder="#marketing #digital #ads"
              className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
          </div>

          {/* Agendamento */}
          <div>
            <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">
              <Clock className="inline w-[0.75rem] h-[0.75rem] mr-[0.25rem]" strokeWidth={1.75} />Agendar para
            </label>
            <input type="datetime-local" value={agendadoPara} onChange={(e) => setAgendadoPara(e.target.value)}
              className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
          </div>

          {erro && <p className="text-[0.8125rem] text-status-red">{erro}</p>}
        </div>

        <div className="flex gap-[0.5rem] px-[1.5rem] py-[1rem] border-t border-surface-border shrink-0">
          <button onClick={() => salvar('rascunho')} disabled={salvando}
            className="flex items-center gap-[0.375rem] h-[2.25rem] px-[0.875rem] rounded-lg border border-surface-border bg-surface-hover text-ink-secondary text-[0.8125rem] font-medium hover:text-ink-primary transition-colors disabled:opacity-50">
            <Save className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />Rascunho
          </button>
          {agendadoPara && (
            <button onClick={() => salvar('agendado')} disabled={salvando}
              className="flex items-center gap-[0.375rem] h-[2.25rem] px-[0.875rem] rounded-lg border border-ads-500 bg-ads-500/10 text-ads-500 text-[0.8125rem] font-semibold hover:bg-ads-500/20 transition-colors disabled:opacity-50">
              <Clock className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />Agendar
            </button>
          )}
          <button onClick={() => salvar('publicado')} disabled={salvando}
            className="ml-auto flex items-center gap-[0.375rem] h-[2.25rem] px-[1rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white text-[0.8125rem] font-semibold transition-colors disabled:opacity-50">
            {salvando ? <div className="w-[0.75rem] h-[0.75rem] border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Megaphone className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />}
            Publicar Agora
          </button>
        </div>
      </div>
    </div>
  )
}

// ── CALENDÁRIO SEMANAL ──────────────────────────────────────────────────────
function Calendario({ posts, onEdit, onRefresh }: { posts: Post[]; onEdit: (p: Post) => void; onRefresh: () => void }) {
  const hoje      = new Date()
  const inicioSem = new Date(hoje)
  inicioSem.setDate(hoje.getDate() - hoje.getDay())

  const semanas = Array.from({ length: 4 }, (_, si) =>
    Array.from({ length: 7 }, (_, di) => {
      const d = new Date(inicioSem)
      d.setDate(inicioSem.getDate() + si * 7 + di)
      return d
    })
  )

  const postsPorDia = (dia: Date) => {
    const ds = dia.toISOString().slice(0, 10)
    return posts.filter((p) => p.agendado_para?.slice(0, 10) === ds)
  }

  const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div>
      <div className="grid grid-cols-7 gap-[0.25rem] mb-[0.5rem]">
        {DIAS.map((d) => (
          <p key={d} className="text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide text-center py-[0.25rem]">{d}</p>
        ))}
      </div>
      <div className="flex flex-col gap-[0.25rem]">
        {semanas.map((sem, si) => (
          <div key={si} className="grid grid-cols-7 gap-[0.25rem]">
            {sem.map((dia, di) => {
              const diasPosts = postsPorDia(dia)
              const eHoje     = dia.toISOString().slice(0, 10) === hoje.toISOString().slice(0, 10)
              return (
                <div
                  key={di}
                  className={`min-h-[5rem] rounded-lg p-[0.375rem] border transition-colors ${eHoje ? 'border-ads-500/40 bg-ads-500/5' : 'border-surface-border bg-surface-card'}`}
                >
                  <p className={`text-[0.6875rem] font-semibold mb-[0.25rem] ${eHoje ? 'text-ads-500' : 'text-ink-muted'}`}>
                    {dia.getDate()}
                  </p>
                  <div className="flex flex-col gap-[0.125rem]">
                    {diasPosts.map((p) => {
                      const RedeIcon = REDE_ICON[p.rede]
                      return (
                        <button
                          key={p.id} onClick={() => onEdit(p)}
                          className="w-full text-left flex items-center gap-[0.25rem] px-[0.25rem] py-[0.125rem] rounded bg-surface-hover hover:bg-ads-500/10 transition-colors"
                        >
                          <RedeIcon className={`w-[0.625rem] h-[0.625rem] shrink-0 ${REDE_COR[p.rede]}`} strokeWidth={2} />
                          <span className="text-ink-secondary text-[0.625rem] truncate">{p.texto?.slice(0, 15) ?? p.tipo}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      {posts.filter((p) => !p.agendado_para).length > 0 && (
        <div className="mt-[1.5rem]">
          <p className="text-ink-muted text-[0.75rem] font-semibold uppercase tracking-wide mb-[0.5rem]">Sem data</p>
          <div className="flex flex-col gap-[0.375rem]">
            {posts.filter((p) => !p.agendado_para).map((p) => {
              const RedeIcon = REDE_ICON[p.rede]
              const TipoIcon = TIPO_ICON[p.tipo]
              const StIcon   = STATUS_ICON[p.status]
              return (
                <button key={p.id} onClick={() => onEdit(p)}
                  className="flex items-center gap-[0.75rem] bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow px-[1rem] py-[0.625rem] hover:border-ads-500/30 transition-colors text-left">
                  <RedeIcon className={`w-[1rem] h-[1rem] shrink-0 ${REDE_COR[p.rede]}`} strokeWidth={1.75} />
                  <TipoIcon className="w-[0.875rem] h-[0.875rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                  <p className="flex-1 text-ink-primary text-[0.875rem] truncate">{p.texto ?? `(${p.tipo})`}</p>
                  <span className={`text-[0.6875rem] font-semibold px-[0.375rem] py-[0.125rem] rounded-full flex items-center gap-[0.25rem] ${STATUS_COR[p.status]}`}>
                    <StIcon className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                    {p.status}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function MarketingPage() {
  const [aba,       setAba]       = useState<'calendario' | 'criar'>('calendario')
  const [posts,     setPosts]     = useState<Post[]>([])
  const [clientes,  setClientes]  = useState<ClienteOpcao[]>([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [postEdit,  setPostEdit]  = useState<Partial<Post> | undefined>()

  const carregar = useCallback(async () => {
    setLoading(true)
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('posts_agendados').select('*').order('agendado_para', { ascending: true }),
      supabase.from('clientes').select('id, nome').in('status', ['ativo', 'onboarding']).order('nome'),
    ])
    setPosts((p ?? []) as Post[])
    setClientes((c ?? []) as ClienteOpcao[])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function abrirCriar() { setPostEdit(undefined); setModal(true); setAba('criar') }
  function abrirEditar(p: Post) { setPostEdit(p); setModal(true) }

  const agendados  = posts.filter((p) => p.status === 'agendado').length
  const publicados = posts.filter((p) => p.status === 'publicado').length
  const rascunhos  = posts.filter((p) => p.status === 'rascunho').length

  return (
    <MainLayout
      title="Marketing"
      subtitle="Calendário editorial e criação de posts"
      actions={
        <div className="flex items-center gap-[0.5rem]">
          <button onClick={carregar} className="h-[2rem] w-[2rem] flex items-center justify-center rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary hover:text-ink-primary transition-colors">
            <RefreshCw className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          </button>
          <button onClick={abrirCriar}
            className="flex items-center gap-[0.375rem] h-[2rem] px-[0.875rem] rounded-[0.375rem] bg-ads-500 hover:bg-ads-600 text-white text-[0.8125rem] font-semibold transition-colors">
            <Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
            Criar Post
          </button>
        </div>
      }
    >
      {/* KPIs rápidos */}
      <div className="grid grid-cols-3 gap-[1rem] mb-[2rem]">
        {[
          { label: 'Agendados', value: agendados,  cor: 'text-status-blue'  },
          { label: 'Publicados',value: publicados, cor: 'text-status-green' },
          { label: 'Rascunhos', value: rascunhos,  cor: 'text-ink-muted'    },
        ].map(({ label, value, cor }) => (
          <div key={label} className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem] flex items-center gap-[0.75rem]">
            <p className={`text-[1.5rem] font-bold ${cor}`}>{value}</p>
            <p className="text-ink-secondary text-[0.875rem]">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-[0.25rem] border-b border-surface-border mb-[1.5rem]">
        {([
          { id: 'calendario', label: 'Calendário', icon: Calendar },
          { id: 'criar',      label: 'Lista',      icon: Edit3    },
        ] as { id: typeof aba; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setAba(id)}
            className={`flex items-center gap-[0.375rem] h-[2.25rem] px-[0.875rem] text-[0.875rem] font-medium transition-colors ${aba === id ? 'text-ads-500 border-b-2 border-ads-500 -mb-[0.3125rem]' : 'text-ink-muted hover:text-ink-secondary'}`}>
            <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-[0.25rem]">
          {[...Array(28)].map((_, i) => <div key={i} className="h-[5rem] rounded-lg bg-surface-card border border-surface-border animate-pulse" />)}
        </div>
      ) : aba === 'calendario' ? (
        <Calendario posts={posts} onEdit={abrirEditar} onRefresh={carregar} />
      ) : (
        <div className="flex flex-col gap-[0.5rem]">
          {posts.length === 0 ? (
            <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[4rem] text-center">
              <Megaphone className="w-[2.5rem] h-[2.5rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
              <p className="text-ink-primary font-semibold">Nenhum post ainda</p>
              <p className="text-ink-muted text-[0.875rem] mt-[0.25rem]">Crie seu primeiro post para começar.</p>
            </div>
          ) : posts.map((p) => {
            const RedeIcon = REDE_ICON[p.rede]
            const TipoIcon = TIPO_ICON[p.tipo]
            const StIcon   = STATUS_ICON[p.status]
            return (
              <button key={p.id} onClick={() => abrirEditar(p)}
                className="flex items-center gap-[1rem] bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow px-[1.25rem] py-[0.875rem] hover:border-ads-500/30 transition-colors text-left">
                <RedeIcon className={`w-[1.25rem] h-[1.25rem] shrink-0 ${REDE_COR[p.rede]}`} strokeWidth={1.75} />
                <TipoIcon className="w-[1rem] h-[1rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                <p className="flex-1 text-ink-primary text-[0.875rem] truncate">{p.texto ?? `(${p.tipo})`}</p>
                {p.agendado_para && (
                  <span className="text-ink-muted text-[0.75rem] shrink-0">
                    {new Date(p.agendado_para).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                <span className={`text-[0.6875rem] font-semibold px-[0.5rem] py-[0.125rem] rounded-full flex items-center gap-[0.25rem] ${STATUS_COR[p.status]}`}>
                  <StIcon className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                  {p.status}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {modal && (
        <PostModal
          post={postEdit}
          clientes={clientes}
          onClose={() => setModal(false)}
          onSaved={carregar}
        />
      )}
    </MainLayout>
  )
}
```

### `app\(app)\relatorios\page.tsx`

```tsx
﻿'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TrendingUp, BarChart3, Download, RefreshCw, Calendar, ArrowUpRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

interface RelatorioMensal {
  id:                    string;
  cliente_id:            string;
  mes_ano:               string;
  status_geracao:        'pendente' | 'processando' | 'gerado' | 'erro';
  investimento_ads?:     number;
  conversoes?:           number;
  roi?:                  number;
  sessoes_ga4?:          number;
  usuarios_novos?:       number;
  taxa_engajamento?:     number;
  conteudo_markdown?:    string;
  analise_ia?: {
    resumo_executivo: string;
    pontos_positivos: string[];
    pontos_atencao:   string[];
    recomendacoes:    string[];
    proximo_passo:    string;
  };
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtConversoes = (n: number): string =>
  n % 1 !== 0 ? `${n.toFixed(1)}*` : String(n);

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const [clientes,    setClientes]    = useState<{ id: string; nome: string }[]>([]);
  const [clienteSel,  setClienteSel]  = useState<string>('');
  const [relatorios,  setRelatorios]  = useState<RelatorioMensal[]>([]);
  const [selecionado, setSelecionado] = useState<RelatorioMensal | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [gerando,     setGerando]     = useState(false);

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome')
      .eq('status', 'ativo')
      .order('nome')
      .then(({ data }) => {
        const lista = data ?? [];
        setClientes(lista);
        if (lista.length > 0) setClienteSel(lista[0].id);
      });
  }, []);

  const carregar = useCallback(async () => {
    if (!clienteSel) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/analytics/${clienteSel}`);
      const json = await res.json() as { relatorios: RelatorioMensal[] };
      const lista = json.relatorios ?? [];
      setRelatorios(lista);
      setSelecionado(lista[0] ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clienteSel]);

  useEffect(() => { carregar(); }, [carregar]);

  async function solicitarRelatorio() {
    if (!clienteSel) return;
    setGerando(true);
    try {
      const hoje   = new Date();
      const mesRef = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const mesAno = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, '0')}`;
      await fetch(`/api/analytics/${clienteSel}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mesAno }),
      });
      await carregar();
    } finally {
      setGerando(false);
    }
  }

  function baixarMarkdown() {
    if (!selecionado?.conteudo_markdown) return;
    const blob = new Blob([selecionado.conteudo_markdown], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `relatorio_${selecionado.mes_ano}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const kpis = selecionado ? [
    { label: 'Investimento',  valor: fmt(selecionado.investimento_ads ?? 0),             sub: 'Google Ads',     icon: TrendingUp,  cor: 'text-status-blue'   },
    { label: 'Conversões',    valor: fmtConversoes(selecionado.conversoes ?? 0),           sub: 'Leads/vendas',   icon: ArrowUpRight, cor: 'text-ads-500'      },
    { label: 'ROI',           valor: `${(selecionado.roi ?? 0).toFixed(2)}x`,             sub: 'Retorno',        icon: BarChart3,   cor: 'text-status-purple' },
    { label: 'Sessões (GA4)', valor: (selecionado.sessoes_ga4 ?? 0).toLocaleString(),     sub: 'Visitas ao site', icon: Calendar,   cor: 'text-status-orange' },
  ] : [];

  return (
    <MainLayout
      title="Relatórios"
      subtitle="Google Ads + GA4 — histórico por cliente"
      actions={
        <div className="flex items-center gap-[0.625rem]">
          <select
            value={clienteSel}
            onChange={(e) => setClienteSel(e.target.value)}
            className="h-[2rem] pl-[0.625rem] pr-[1.75rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <button
            onClick={solicitarRelatorio}
            disabled={gerando || !clienteSel}
            className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors disabled:opacity-50"
          >
            {gerando
              ? <div className="w-[0.75rem] h-[0.75rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <RefreshCw className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            }
            Solicitar
          </button>
        </div>
      }
    >

      <div className="page-enter">
      {/* SELETOR DE MÊS */}
      {relatorios.length > 0 && (
        <div className="flex gap-[0.5rem] flex-wrap mb-[1.5rem]">
          {relatorios.map((r) => {
            const [ano, mes] = r.mes_ano.split('-')
            const label = new Date(Number(ano), Number(mes) - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
            return (
              <button
                key={r.mes_ano}
                onClick={() => setSelecionado(r)}
                className={`px-[0.875rem] h-[2rem] rounded-[0.375rem] text-[0.8125rem] font-medium transition-colors ${
                  selecionado?.mes_ano === r.mes_ano
                    ? 'bg-ads-500 text-white'
                    : 'bg-surface-card border border-surface-border text-ink-secondary hover:border-ads-500/40'
                }`}
              >
                {label}
                {r.status_geracao === 'pendente' && (
                  <span className="ml-[0.375rem] font-bold text-status-orange">●</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center h-[16rem]">
          <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* EMPTY */}
      {!loading && relatorios.length === 0 && (
        <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[3rem] text-center">
          <BarChart3 className="w-[2.5rem] h-[2.5rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
          <p className="text-ink-secondary text-[0.875rem]">
            Nenhum relatório encontrado. Clique em &quot;Solicitar&quot; para gerar o primeiro.
          </p>
        </div>
      )}

      {!loading && selecionado && (
        <>
          {/* STATUS PENDENTE */}
          {selecionado.status_geracao === 'pendente' && (
            <div className="mb-[1.5rem] flex items-start gap-[0.75rem] bg-status-orange/10 border border-status-orange/20 rounded-xl px-[1rem] py-[0.875rem]">
              <RefreshCw className="shrink-0 w-[0.875rem] h-[0.875rem] text-status-orange mt-[0.125rem]" strokeWidth={2} />
              <p className="text-[0.875rem] text-status-orange">
                Relatório em processamento. Recarregue em alguns instantes.
              </p>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[1rem] mb-[1.5rem]">
            {kpis.map(({ label, valor, sub, icon: Icon, cor }) => (
              <div key={label} className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow px-[1.25rem] py-[1rem]">
                <div className="flex items-start justify-between mb-[0.5rem]">
                  <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">{label}</p>
                  <Icon className={`w-[1rem] h-[1rem] ${cor}`} strokeWidth={1.5} />
                </div>
                <p className={`text-[1.75rem] font-bold leading-none mb-[0.375rem] ${cor}`}>{valor}</p>
                <p className="text-ink-muted text-[0.75rem]">{sub}</p>
              </div>
            ))}
          </div>

          {/* DETALHE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] mb-[1.5rem]">
            <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
              <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
                <TrendingUp className="w-[1rem] h-[1rem] text-status-blue" strokeWidth={1.5} />
                <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Google Ads</h3>
              </div>
              {[
                { label: 'Investimento', valor: fmt(selecionado.investimento_ads ?? 0) },
                { label: 'Conversões',   valor: fmtConversoes(selecionado.conversoes ?? 0) },
                { label: 'ROI',          valor: `${(selecionado.roi ?? 0).toFixed(2)}x` },
              ].map(({ label, valor }) => (
                <div key={label} className="flex justify-between items-center py-[0.75rem] border-b border-surface-border last:border-0">
                  <p className="text-ink-secondary text-[0.875rem]">{label}</p>
                  <p className="text-ink-primary font-semibold text-[0.875rem]">{valor}</p>
                </div>
              ))}
              {(selecionado.conversoes ?? 0) % 1 !== 0 && (
                <p className="text-ink-muted text-[0.6875rem] mt-[0.5rem]">
                  * Conversões data-driven (atribuição fracionada pelo Google)
                </p>
              )}
            </div>

            <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
              <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
                <BarChart3 className="w-[1rem] h-[1rem] text-status-orange" strokeWidth={1.5} />
                <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Google Analytics 4</h3>
              </div>
              {[
                { label: 'Sessões',          valor: (selecionado.sessoes_ga4 ?? 0).toLocaleString()      },
                { label: 'Novos Usuários',   valor: (selecionado.usuarios_novos ?? 0).toLocaleString()   },
                { label: 'Taxa Engajamento', valor: `${(selecionado.taxa_engajamento ?? 0).toFixed(1)}%` },
              ].map(({ label, valor }) => (
                <div key={label} className="flex justify-between items-center py-[0.75rem] border-b border-surface-border last:border-0">
                  <p className="text-ink-secondary text-[0.875rem]">{label}</p>
                  <p className="text-ink-primary font-semibold text-[0.875rem]">{valor}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ANÁLISE IA */}
          {selecionado.analise_ia && (
            <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem] mb-[1.5rem]">
              <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
                <Sparkles className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.5} />
                <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Análise IA — Gemini</h3>
              </div>
              <p className="text-ink-secondary text-[0.875rem] mb-[1.25rem] leading-relaxed">
                {selecionado.analise_ia.resumo_executivo}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem] mb-[1.25rem]">
                {selecionado.analise_ia.pontos_positivos.length > 0 && (
                  <div>
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-status-green mb-[0.5rem]">Pontos Positivos</p>
                    <ul className="flex flex-col gap-[0.375rem]">
                      {selecionado.analise_ia.pontos_positivos.map((p, i) => (
                        <li key={i} className="flex items-start gap-[0.5rem]">
                          <CheckCircle2 className="w-[0.875rem] h-[0.875rem] text-status-green shrink-0 mt-[0.125rem]" strokeWidth={2} />
                          <span className="text-ink-secondary text-[0.875rem]">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selecionado.analise_ia.pontos_atencao.length > 0 && (
                  <div>
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-status-orange mb-[0.5rem]">Pontos de Atenção</p>
                    <ul className="flex flex-col gap-[0.375rem]">
                      {selecionado.analise_ia.pontos_atencao.map((p, i) => (
                        <li key={i} className="flex items-start gap-[0.5rem]">
                          <AlertCircle className="w-[0.875rem] h-[0.875rem] text-status-orange shrink-0 mt-[0.125rem]" strokeWidth={2} />
                          <span className="text-ink-secondary text-[0.875rem]">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {selecionado.analise_ia.recomendacoes.length > 0 && (
                <div className="mb-[1rem]">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted mb-[0.5rem]">Recomendações</p>
                  <ol className="flex flex-col gap-[0.375rem]">
                    {selecionado.analise_ia.recomendacoes.map((r, i) => (
                      <li key={i} className="flex items-start gap-[0.625rem]">
                        <span className="w-[1.25rem] h-[1.25rem] rounded-full bg-ads-500 flex items-center justify-center text-white text-[0.6875rem] font-bold shrink-0">{i + 1}</span>
                        <span className="text-ink-secondary text-[0.875rem]">{r}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {selecionado.analise_ia.proximo_passo && (
                <div className="bg-ads-500/10 border border-ads-500/20 rounded-[0.375rem] px-[0.875rem] py-[0.75rem]">
                  <p className="text-[0.6875rem] font-semibold text-ads-500 uppercase tracking-wide mb-[0.25rem]">Próximo Passo</p>
                  <p className="text-ink-primary text-[0.875rem]">{selecionado.analise_ia.proximo_passo}</p>
                </div>
              )}
            </div>
          )}

          {/* DOWNLOAD */}
          {selecionado.conteudo_markdown && (
            <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow px-[1.5rem] py-[1.25rem] flex items-center justify-between">
              <div>
                <p className="text-ink-primary font-semibold text-[0.875rem]">Relatório completo em Markdown</p>
                <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">Pronto para compartilhar com o cliente</p>
              </div>
              <button
                onClick={baixarMarkdown}
                className="flex items-center gap-[0.5rem] bg-surface-hover border border-surface-border text-ink-primary text-[0.8125rem] font-semibold h-[2rem] px-[0.875rem] rounded-[0.375rem] hover:border-ads-500/40 transition-colors"
              >
                <Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                Baixar .md
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </MainLayout>
  );
}
```

### `app\(app)\tarefas\page.tsx`

```tsx
﻿'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Plus, CheckSquare, Square, Clock, User,
  ChevronDown, Trash2, RefreshCw, AlarmClock,
  Zap, CheckCheck, AlertTriangle, ChevronRight,
  Tag,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { TaskModal }  from '@/components/ui/TaskModal'
import { Tooltip }    from '@/components/ui/Tooltip'
import { ContextMenu } from '@/components/ui/ContextMenu'
import { cn }         from '@/lib/utils'
import { supabase }   from '@/lib/supabase'
import type { Tarefa, TarefaPrioridade } from '@/lib/types'

interface TarefaComCliente extends Tarefa {
  cliente_nome?: string
}

type Filtro = 'todas' | 'hoje' | 'semana' | 'criticas'

const PRIO_CONFIG: Record<TarefaPrioridade, { label: string; color: string; dot: string; border: string }> = {
  baixo:   { label: 'Baixo',   color: 'text-ink-muted',          dot: 'bg-ink-muted',          border: 'border-l-ink-muted'        },
  normal:  { label: 'Normal',  color: 'text-status-blue',        dot: 'bg-status-blue',        border: 'border-l-status-blue'      },
  alto:    { label: 'Alto',    color: 'text-status-orange',      dot: 'bg-status-orange',      border: 'border-l-status-orange'    },
  critico: { label: 'Crítico', color: 'text-status-red',         dot: 'bg-status-red',         border: 'border-l-status-red'       },
}

const GRUPO_CONFIG: Record<string, { icon: typeof Clock; color: string; glow: string }> = {
  'Hoje':            { icon: Zap,          color: 'text-ads-400',        glow: 'bg-ads-500/10'       },
  'Próxima Semana':  { icon: Clock,        color: 'text-status-blue',    glow: 'bg-status-blue/10'   },
  'Mais Tarde':      { icon: AlarmClock,   color: 'text-ink-secondary',  glow: 'bg-surface-hover'    },
  'Sem prazo':       { icon: Tag,          color: 'text-ink-muted',      glow: 'bg-surface-hover'    },
}

function hojeSt() { return new Date().toISOString().slice(0, 10) }
function semanaFim() {
  const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10)
}

function grupar(tarefas: TarefaComCliente[]): Record<string, TarefaComCliente[]> {
  const hoje = hojeSt()
  const semana = semanaFim()
  const grupos: Record<string, TarefaComCliente[]> = {
    'Hoje': [], 'Próxima Semana': [], 'Mais Tarde': [], 'Sem prazo': [],
  }
  for (const t of tarefas) {
    const d = t.data_prazo?.slice(0, 10)
    if (!d)           grupos['Sem prazo'].push(t)
    else if (d <= hoje)   grupos['Hoje'].push(t)
    else if (d <= semana) grupos['Próxima Semana'].push(t)
    else                  grupos['Mais Tarde'].push(t)
  }
  return grupos
}

/* ─── Energy bar ────────────────────────────────────────── */
function EnergyBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-[0.625rem]">
      <span className="text-[0.6875rem] text-ink-muted w-[4.5rem] shrink-0">{label}</span>
      <div className="flex-1 h-[0.25rem] rounded-full bg-surface-hover overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[0.6875rem] text-ink-muted w-[2rem] text-right">{pct}%</span>
    </div>
  )
}

/* ─── Accordion de tarefa ────────────────────────────────── */
function TarefaAccordion({
  t, expanded, onToggle, onConcluir, onAdiar, onDeletar, onEditar,
}: {
  t: TarefaComCliente
  expanded: boolean
  onToggle: () => void
  onConcluir: () => void
  onAdiar: (delta: number, unit: 'h' | 'd' | 'w') => void
  onDeletar: () => void
  onEditar: () => void
}) {
  const prio    = PRIO_CONFIG[t.prioridade]
  const atrasada = (t.data_prazo?.slice(0, 10) ?? '') < hojeSt() && t.status !== 'feito'

  const ctxItems = [
    { label: 'Editar',    icon: <ChevronRight className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />, onClick: onEditar },
    { label: 'Adiar 1h',  icon: <AlarmClock className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,  onClick: () => onAdiar(1, 'h') },
    { label: 'Adiar 1d',  icon: <AlarmClock className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,  onClick: () => onAdiar(1, 'd'), separator: true },
    { label: 'Deletar',   icon: <Trash2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />,       onClick: onDeletar, variant: 'danger' as const },
  ]

  return (
    <ContextMenu items={ctxItems}>
      <div className={cn(
        'bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow overflow-hidden',
        'border-l-[3px]', prio.border,
        'transition-all duration-200',
        expanded ? 'shadow-lg shadow-black/15' : 'hover:border-surface-elevated',
      )}>
        {/* ── HEADER (sempre visível) ── */}
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-[0.875rem] px-[1rem] py-[0.875rem] text-left"
        >
          {/* Checkbox */}
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onConcluir() }}
            className="shrink-0 text-ink-muted hover:text-status-green transition-colors"
          >
            <Square className="w-[1.25rem] h-[1.25rem]" strokeWidth={1.5} />
          </span>

          {/* Título + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[0.5rem] flex-wrap">
              <span className="text-ink-primary font-medium text-[0.9375rem] truncate">{t.titulo}</span>
              <span className={cn(
                'inline-flex items-center gap-[0.1875rem] text-[0.625rem] font-semibold px-[0.375rem] py-[0.0625rem] rounded-full',
                prio.color, 'bg-surface-hover',
              )}>
                <span className={cn('w-[0.3125rem] h-[0.3125rem] rounded-full', prio.dot)} />
                {prio.label}
              </span>
              {atrasada && (
                <span className="inline-flex items-center gap-[0.1875rem] text-[0.625rem] font-semibold px-[0.375rem] py-[0.0625rem] rounded-full bg-status-red/10 text-status-red">
                  <AlertTriangle className="w-[0.5rem] h-[0.5rem]" strokeWidth={2.5} />
                  Atrasada
                </span>
              )}
            </div>
            <div className="flex items-center gap-[0.625rem] mt-[0.1875rem] text-[0.6875rem] text-ink-muted flex-wrap">
              {t.cliente_nome && (
                <span className="flex items-center gap-[0.1875rem]">
                  <User className="w-[0.5625rem] h-[0.5625rem]" strokeWidth={2} />
                  {t.cliente_nome}
                </span>
              )}
              {t.data_prazo && (
                <span className={cn('flex items-center gap-[0.1875rem]', atrasada && 'text-status-red font-semibold')}>
                  <Clock className="w-[0.5625rem] h-[0.5625rem]" strokeWidth={2} />
                  {new Date(t.data_prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          {/* Chevron */}
          <ChevronDown
            className={cn('w-[1rem] h-[1rem] text-ink-muted shrink-0 transition-transform duration-200', expanded && 'rotate-180')}
            strokeWidth={1.75}
          />
        </button>

        {/* ── EXPANDED BODY (accordion) ── */}
        {expanded && (
          <div className="px-[1rem] pb-[1rem] border-t border-surface-border animate-fade-up">
            {/* Descrição */}
            {t.descricao && (
              <div className="mt-[0.75rem] p-[0.75rem] rounded-[0.375rem] bg-surface-hover border-l-[2px] border-ads-500/30">
                <p className="text-[0.8125rem] text-ink-secondary leading-relaxed">{t.descricao}</p>
              </div>
            )}

            {/* Why it's here */}
            <div className="mt-[0.75rem] p-[0.75rem] rounded-[0.375rem] bg-surface-base border border-surface-border">
              <p className="text-[0.625rem] text-ink-muted font-semibold uppercase tracking-wide mb-[0.25rem]">Contexto</p>
              <p className="text-[0.75rem] text-ink-muted leading-relaxed">
                {t.prioridade === 'critico' && 'Tarefa crítica — requer atenção imediata para não afetar a operação do cliente.'}
                {t.prioridade === 'alto'    && 'Alta prioridade — impacta diretamente os resultados esperados.'}
                {t.prioridade === 'normal'  && 'Prioridade normal — parte do fluxo operacional padrão.'}
                {t.prioridade === 'baixo'   && 'Baixa prioridade — pode ser realizada quando houver disponibilidade.'}
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-[0.5rem] mt-[0.875rem]">
              <Tooltip content="Concluir" side="top">
                <button
                  onClick={onConcluir}
                  className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-status-green/10 text-status-green hover:bg-status-green/20 text-[0.8125rem] font-medium transition-colors"
                >
                  <CheckCheck className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                  Concluir
                </button>
              </Tooltip>

              <div className="relative group/adiar">
                <button className="flex items-center gap-[0.25rem] h-[2rem] px-[0.625rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] hover:text-ink-primary transition-colors">
                  <AlarmClock className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                  Adiar
                  <ChevronDown className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                </button>
                <div className="absolute left-0 top-full mt-[0.25rem] bg-surface-elevated border border-surface-border rounded-[0.5rem] shadow-xl z-20 min-w-[8rem] hidden group-hover/adiar:block animate-fade-scale">
                  {[
                    { label: '+1 hora',   delta: 1, unit: 'h' as const },
                    { label: '+1 dia',    delta: 1, unit: 'd' as const },
                    { label: '+1 semana', delta: 1, unit: 'w' as const },
                  ].map(({ label, delta, unit }) => (
                    <button
                      key={label}
                      onClick={() => onAdiar(delta, unit)}
                      className="w-full text-left px-[0.75rem] py-[0.4375rem] text-ink-secondary text-[0.8125rem] hover:bg-surface-hover hover:text-ink-primary transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1" />

              <Tooltip content="Deletar" side="top">
                <button
                  onClick={onDeletar}
                  className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] bg-surface-hover text-ink-muted hover:text-status-red hover:bg-status-red/10 transition-colors"
                >
                  <Trash2 className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                </button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </ContextMenu>
  )
}

/* ─── Page ──────────────────────────────────────────────── */
export default function TarefasPage() {
  const [tarefas,     setTarefas]     = useState<TarefaComCliente[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filtro,      setFiltro]      = useState<Filtro>('todas')
  const [expanded,    setExpanded]    = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [tarefaEdit,  setTarefaEdit]  = useState<Partial<Tarefa> | undefined>()

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('tarefas')
      .select('*, clientes(nome)')
      .neq('status', 'feito')
      .order('data_prazo', { ascending: true, nullsFirst: false })

    const lista = (data ?? []).map((t: Tarefa & { clientes?: { nome: string } }) => ({
      ...t,
      cliente_nome: t.clientes?.nome,
    })) as TarefaComCliente[]
    setTarefas(lista)
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function concluir(t: TarefaComCliente) {
    await supabase.from('tarefas').update({ status: 'feito' }).eq('id', t.id)
    if (t.cliente_id) {
      await supabase.from('historico_acoes').insert({
        cliente_id: t.cliente_id,
        tipo:       'tarefa_concluida',
        descricao:  `Tarefa concluída: ${t.titulo}`,
      })
    }
    setExpanded(null)
    carregar()
  }

  async function adiar(t: TarefaComCliente, delta: number, unit: 'h' | 'd' | 'w') {
    const base = t.data_prazo ? new Date(t.data_prazo) : new Date()
    const ms   = unit === 'h' ? delta * 3600000 : unit === 'd' ? delta * 86400000 : delta * 604800000
    base.setTime(base.getTime() + ms)
    await supabase.from('tarefas').update({ data_prazo: base.toISOString(), status: 'adiado' }).eq('id', t.id)
    carregar()
  }

  async function deletar(id: string) {
    if (!confirm('Deletar esta tarefa?')) return
    await supabase.from('tarefas').delete().eq('id', id)
    if (expanded === id) setExpanded(null)
    carregar()
  }

  const filtradas = tarefas.filter((t) => {
    if (filtro === 'hoje')     return (t.data_prazo?.slice(0, 10) ?? '') <= hojeSt()
    if (filtro === 'semana')   return (t.data_prazo?.slice(0, 10) ?? '9') <= semanaFim()
    if (filtro === 'criticas') return t.prioridade === 'critico' || t.prioridade === 'alto'
    return true
  })

  const grupos = grupar(filtradas)
  const urgentesHoje = tarefas.filter((t) => (t.data_prazo?.slice(0, 10) ?? '') <= hojeSt()).length
  const criticas = tarefas.filter((t) => t.prioridade === 'critico' || t.prioridade === 'alto').length

  /* Energy flow calculado pela distribuição */
  const totalHoje    = grupos['Hoje'].length
  const totalSemana  = grupos['Próxima Semana'].length
  const totalMais    = grupos['Mais Tarde'].length + grupos['Sem prazo'].length
  const totalGeral   = totalHoje + totalSemana + totalMais || 1
  const energyManha  = Math.round(Math.min(100, (totalHoje / totalGeral) * 150))
  const energyTarde  = Math.round(Math.min(100, (totalSemana / totalGeral) * 110))
  const energyNoite  = Math.round(Math.min(100, (totalMais / totalGeral) * 100))

  return (
    <MainLayout
      title="Tarefas"
      subtitle={`${filtradas.length} pendente${filtradas.length !== 1 ? 's' : ''}`}
      actions={
        <div className="flex items-center gap-[0.5rem]">
          <Tooltip content="Atualizar" side="bottom">
            <button
              onClick={carregar}
              className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-muted hover:text-ink-primary transition-colors"
            >
              <RefreshCw className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
            </button>
          </Tooltip>
          <button
            onClick={() => { setTarefaEdit(undefined); setModalAberto(true) }}
            className="flex items-center gap-[0.375rem] h-[2rem] px-[0.875rem] rounded-[0.375rem] bg-ads-500 hover:bg-ads-400 text-white text-[0.8125rem] font-semibold transition-colors shadow-lg shadow-ads-500/20"
          >
            <Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
            Nova Tarefa
          </button>
        </div>
      }
    >
      <div className="page-enter grid grid-cols-1 xl:grid-cols-[1fr_18rem] gap-[1.5rem] items-start">

        {/* ══ COLUNA PRINCIPAL — lista de tarefas ══════════════ */}
        <div className="min-w-0">

          {/* ── FILTROS ──────────────────────────────────────── */}
          <div className="flex items-center gap-[0.375rem] mb-[1.25rem] flex-wrap">
            {([
              { id: 'todas',     label: 'Todas' },
              { id: 'hoje',      label: `Hoje${urgentesHoje > 0 ? ` (${urgentesHoje})` : ''}` },
              { id: 'semana',    label: 'Esta semana' },
              { id: 'criticas',  label: `Críticas${criticas > 0 ? ` (${criticas})` : ''}` },
            ] as { id: Filtro; label: string }[]).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFiltro(id)}
                className={cn(
                  'h-[1.875rem] px-[0.875rem] rounded-full text-[0.8125rem] font-medium transition-colors',
                  filtro === id
                    ? 'bg-ads-500 text-white shadow-md shadow-ads-500/20'
                    : 'bg-surface-card border border-surface-border text-ink-secondary hover:text-ink-primary hover:border-surface-elevated',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── LISTA ──────────────────────────────────────── */}
          {loading ? (
            <div className="flex flex-col gap-[0.625rem]">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-[4.25rem] rounded-xl skeleton-shimmer dark:border dark:border-surface-border" />
              ))}
            </div>
          ) : filtradas.length === 0 ? (
            <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[4rem] text-center">
              <CheckSquare className="w-[2.5rem] h-[2.5rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
              <p className="text-ink-primary font-semibold">Tudo em dia!</p>
              <p className="text-ink-muted text-[0.875rem] mt-[0.25rem]">Nenhuma tarefa pendente com esse filtro.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-[1.5rem]">
              {Object.entries(grupos).map(([grupo, items]) => {
                if (items.length === 0) return null
                const gcfg = GRUPO_CONFIG[grupo]
                const GrupoIcon = gcfg.icon
                return (
                  <div key={grupo}>
                    <div className="flex items-center gap-[0.5rem] mb-[0.625rem]">
                      <div className={cn('w-[1.5rem] h-[1.5rem] rounded-[0.375rem] flex items-center justify-center', gcfg.glow)}>
                        <GrupoIcon className={cn('w-[0.75rem] h-[0.75rem]', gcfg.color)} strokeWidth={2} />
                      </div>
                      <h3 className={cn('font-semibold text-[0.875rem]', gcfg.color)}>{grupo}</h3>
                      <span className="text-[0.6875rem] text-ink-muted bg-surface-hover border border-surface-border px-[0.375rem] py-[0.0625rem] rounded-full">
                        {items.length}
                      </span>
                      <div className="flex-1 h-[1px] bg-surface-border" />
                    </div>
                    <div className="flex flex-col gap-[0.5rem]">
                      {items.map((t) => (
                        <TarefaAccordion
                          key={t.id}
                          t={t}
                          expanded={expanded === t.id}
                          onToggle={() => setExpanded(expanded === t.id ? null : t.id)}
                          onConcluir={() => concluir(t)}
                          onAdiar={(d, u) => adiar(t, d, u)}
                          onDeletar={() => deletar(t.id)}
                          onEditar={() => { setTarefaEdit(t); setModalAberto(true) }}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ══ COLUNA LATERAL — Smart Schedule ═════════════════ */}
        <div className="flex flex-col gap-[1rem] sticky top-[1.5rem]">

          {/* Energy Flow */}
          <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem] card-shadow">
            <div className="flex items-center justify-between mb-[1rem]">
              <div>
                <p className="text-ink-primary font-semibold text-[0.875rem]">Fluxo de Energia</p>
                <p className="text-ink-muted text-[0.6875rem]">Distribuição por período</p>
              </div>
              <Zap className="w-[1.125rem] h-[1.125rem] text-ads-400" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col gap-[0.625rem]">
              <EnergyBar label="Urgente / Hoje"   pct={energyManha} color="bg-ads-400"        />
              <EnergyBar label="Próx. semana"      pct={energyTarde} color="bg-status-blue"    />
              <EnergyBar label="Mais tarde"        pct={energyNoite} color="bg-surface-border" />
            </div>
          </div>

          {/* Mini KPIs */}
          <div className="flex flex-col gap-[0.5rem]">
            {[
              { label: 'Urgentes hoje',    value: urgentesHoje,    color: 'text-ads-400',        icon: Zap           },
              { label: 'Críticas / Altas', value: criticas,        color: 'text-status-orange',  icon: AlertTriangle },
              { label: 'Total pendentes',  value: tarefas.length,  color: 'text-ink-primary',    icon: CheckSquare   },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow px-[1rem] py-[0.75rem] card-shadow">
                <div className="flex items-center gap-[0.5rem]">
                  <Icon className={cn('w-[0.875rem] h-[0.875rem]', color)} strokeWidth={1.75} />
                  <span className="text-ink-secondary text-[0.8125rem]">{label}</span>
                </div>
                <span className={cn('text-[1.125rem] font-black', color)}>{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {modalAberto && (
        <TaskModal
          tarefa={tarefaEdit}
          onClose={() => setModalAberto(false)}
          onSaved={carregar}
        />
      )}
    </MainLayout>
  )
}
```

### `app\api\analytics\[clienteId]\route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ─── GET — lista relatórios do cliente ────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> }
) {
  try {
    const { clienteId } = await params
    const { data, error } = await supabase
      .from('relatorios_mensais')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('mes_ano', { ascending: false })
      .limit(6);

    if (error) throw error;
    return NextResponse.json({ relatorios: data ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ─── POST — solicita geração de relatório ─────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> }
) {
  try {
    const { clienteId } = await params
    const body = await req.json() as { mesAno: string };

    const { data: cliente, error: errCliente } = await supabase
      .from('clientes')
      .select('google_ads_customer_id, ga4_property_id, nome')
      .eq('id', clienteId)
      .single();

    if (errCliente || !cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Se as credenciais estiverem configuradas, gerar com dados reais
    if (cliente.google_ads_customer_id && cliente.ga4_property_id) {
      const [
        { obterDadosCampanhasAds, obterPalavrasChavePerformance },
        { obterDadosGA4, obterPaginasTopPerformance, obterFontesTrafego },
        { gerarRelatorioMensal },
      ] = await Promise.all([
        import('@/lib/google-ads'),
        import('@/lib/google-analytics'),
        import('@/lib/relatorio-generator'),
      ]);

      const [campanhas, keywords, ga4, paginas, fontes] = await Promise.all([
        obterDadosCampanhasAds(cliente.google_ads_customer_id, body.mesAno),
        obterPalavrasChavePerformance(cliente.google_ads_customer_id, body.mesAno),
        obterDadosGA4(cliente.ga4_property_id, body.mesAno),
        obterPaginasTopPerformance(cliente.ga4_property_id, body.mesAno),
        obterFontesTrafego(cliente.ga4_property_id, body.mesAno),
      ]);

      await gerarRelatorioMensal(
        { cliente_id: clienteId, mes_ano: body.mesAno, campanhas, keywords, ga4, paginas, fontes },
        cliente.nome,
      );

      // Análise IA via Vertex — enriquece o relatório com insights automáticos
      try {
        const { analisarRelatorioIA } = await import('@/lib/vertex-ai');
        const custoTotal = campanhas.reduce((s, c) => s + c.custo_total, 0);
        const conversoesAds = campanhas.reduce((s, c) => s + c.conversoes, 0);
        const analise = await analisarRelatorioIA(
          cliente.nome, body.mesAno,
          custoTotal, conversoesAds, ga4.sessoes,
          ga4.taxa_engajamento, ga4.taxa_rejeicao,
          custoTotal > 0 ? conversoesAds / custoTotal : 0,
        );
        await supabase
          .from('relatorios_mensais')
          .update({ analise_ia: analise })
          .eq('cliente_id', clienteId)
          .eq('mes_ano', body.mesAno);
      } catch (iaErr) {
        console.error('Vertex AI (não crítico):', iaErr);
      }

      return NextResponse.json({ success: true, status: 'gerado' });
    }

    // Sem credenciais: criar registro pendente
    const { error } = await supabase
      .from('relatorios_mensais')
      .upsert(
        { cliente_id: clienteId, mes_ano: body.mesAno, status_geracao: 'pendente' },
        { onConflict: 'cliente_id,mes_ano' }
      );
    if (error) throw error;

    return NextResponse.json({ success: true, status: 'pendente' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

### `app\api\analytics\[clienteId]\live\route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  obterDadosCampanhasAds,
  obterTermosPesquisa,
  obterDemografia,
  obterGeografia,
  obterDevice,
  obterHorario,
} from '@/lib/google-ads';
import {
  obterDadosGA4,
  obterPaginasTopPerformance,
  obterFontesTrafego,
  obterGeoGA4,
  obterDeviceGA4,
} from '@/lib/google-analytics';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> },
) {
  const { clienteId } = await params;

  // Verificar autenticação via cookie/headers
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // Buscar cliente e suas credenciais
  const { data: cliente } = await supabase
    .from('clientes')
    .select('google_ads_customer_id, ga4_property_id, google_ads_enabled, ga4_enabled')
    .eq('id', clienteId)
    .single();

  if (!cliente) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
  }

  // Extrair período da query (default: último 30 dias)
  const { searchParams } = new URL(request.url);
  const periodo = searchParams.get('periodo') || '30d';
  
  // Calcular datas baseado no período
  const hoje = new Date();
  let dataInicio: Date;
  
  switch (periodo) {
    case '7d':
      dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      dataInicio = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  const mesAno = `${dataInicio.getFullYear()}-${String(dataInicio.getMonth() + 1).padStart(2, '0')}`;

  try {
    // Buscar dados em paralelo
    const [
      campanhas,
      termosPesquisa,
      demografia,
      geografia,
      deviceAds,
      horario,
      ga4Dados,
      paginasTop,
      fontesTrafego,
      geoGA4,
      deviceGA4,
    ] = await Promise.allSettled([
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterDadosCampanhasAds(cliente.google_ads_customer_id, mesAno)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterTermosPesquisa(cliente.google_ads_customer_id, mesAno)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterDemografia(cliente.google_ads_customer_id, mesAno)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterGeografia(cliente.google_ads_customer_id, mesAno)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterDevice(cliente.google_ads_customer_id, mesAno)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterHorario(cliente.google_ads_customer_id, mesAno)
        : Promise.resolve([]),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterDadosGA4(cliente.ga4_property_id, mesAno)
        : Promise.resolve(null),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterPaginasTopPerformance(cliente.ga4_property_id, mesAno)
        : Promise.resolve([]),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterFontesTrafego(cliente.ga4_property_id, mesAno)
        : Promise.resolve([]),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterGeoGA4(cliente.ga4_property_id, mesAno)
        : Promise.resolve([]),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterDeviceGA4(cliente.ga4_property_id, mesAno)
        : Promise.resolve([]),
    ]);

    // Consolidar resultados
    const resultado = {
      googleAds: {
        enabled: cliente.google_ads_enabled,
        campanhas: campanhas.status === 'fulfilled' ? campanhas.value : [],
        termosPesquisa: termosPesquisa.status === 'fulfilled' ? termosPesquisa.value : [],
        demografia: demografia.status === 'fulfilled' ? demografia.value : [],
        geografia: geografia.status === 'fulfilled' ? geografia.value : [],
        device: deviceAds.status === 'fulfilled' ? deviceAds.value : [],
        horario: horario.status === 'fulfilled' ? horario.value : [],
      },
      ga4: {
        enabled: cliente.ga4_enabled,
        dados: ga4Dados.status === 'fulfilled' ? ga4Dados.value : null,
        paginasTop: paginasTop.status === 'fulfilled' ? paginasTop.value : [],
        fontesTrafego: fontesTrafego.status === 'fulfilled' ? fontesTrafego.value : [],
        geografia: geoGA4.status === 'fulfilled' ? geoGA4.value : [],
        device: deviceGA4.status === 'fulfilled' ? deviceGA4.value : [],
      },
      periodo,
      atualizadoEm: new Date().toISOString(),
    };

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar dados de analytics:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados de analytics' },
      { status: 500 }
    );
  }
}
```

### `app\api\ia\chat\route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { VertexAI }                  from '@google-cloud/vertexai'
import { MODELO_FLASH }              from '@/lib/vertex-ai'
import type { ChatMensagem }         from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function criarVertexAI() {
  return new VertexAI({
    project:  process.env.VERTEX_AI_PROJECT_ID!,
    location: process.env.VERTEX_AI_LOCATION ?? 'us-central1',
    googleAuthOptions: { keyFilename: process.env.VERTEX_AI_CREDENTIALS },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    messages:          ChatMensagem[]
    contexto_cliente_id?: string
  }

  const { messages, contexto_cliente_id } = body

  let contextoCliente = ''
  if (contexto_cliente_id) {
    const [{ data: cliente }, { data: memoria }] = await Promise.all([
      supabase.from('clientes').select('nome, nicho, status, mrr, dias_atraso').eq('id', contexto_cliente_id).single(),
      supabase.from('memoria_clientes').select('conteudo_md').eq('cliente_id', contexto_cliente_id).maybeSingle(),
    ])
    if (cliente) {
      contextoCliente = `\nCliente em contexto: ${cliente.nome} (${cliente.nicho}), status: ${cliente.status}, MRR: R$ ${cliente.mrr ?? 0}`
      if (memoria?.conteudo_md) {
        contextoCliente += `\nMemória: ${memoria.conteudo_md.slice(0, 500)}`
      }
    }
  }

  const systemPrompt = `Você é um assistente operacional da agência Adsgator, especializado em Google Ads e gestão de clientes. Responda de forma direta, prática e conversacional (não robótica). Máx 4 parágrafos.${contextoCliente}`

  const contents = [
    { role: 'user' as const, parts: [{ text: systemPrompt }] },
    ...messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role:  m.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: m.content }],
      })),
  ]

  try {
    const vertex = criarVertexAI()
    const model  = vertex.preview.getGenerativeModel({ model: MODELO_FLASH })
    const result = await model.generateContent({ contents })
    const texto  = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? 'Desculpe, não consegui processar sua mensagem.'
    return NextResponse.json({ content: texto })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
```

### `app\api\ia\copy\route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { gerarCopyLandingPage } from '@/lib/vertex-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      nomeCliente:  string;
      nicho:        string;
      estilo:       string;
      direcaoArte?: string;
      publicoAlvo?: string;
    };

    if (!body.nomeCliente || !body.nicho) {
      return NextResponse.json({ error: 'nomeCliente e nicho são obrigatórios' }, { status: 400 });
    }

    const copy = await gerarCopyLandingPage(
      body.nomeCliente,
      body.nicho,
      body.estilo ?? 'minimalista',
      body.direcaoArte ?? '',
      body.publicoAlvo,
    );

    return NextResponse.json({ copy });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

### `app\api\ia\hashtags\route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { VertexAI }                  from '@google-cloud/vertexai'
import { MODELO_FLASH }              from '@/lib/vertex-ai'

function criarVertexAI() {
  return new VertexAI({
    project:  process.env.VERTEX_AI_PROJECT_ID!,
    location: process.env.VERTEX_AI_LOCATION ?? 'us-central1',
    googleAuthOptions: { keyFilename: process.env.VERTEX_AI_CREDENTIALS },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { texto: string; rede?: string }
  const { texto, rede = 'instagram' } = body

  if (!texto?.trim()) {
    return NextResponse.json({ error: 'texto é obrigatório' }, { status: 400 })
  }

  const prompt = `Gere 10 hashtags relevantes para o seguinte post de ${rede}:

"${texto.slice(0, 500)}"

Retorne APENAS as hashtags separadas por espaço, sem explicações. Exemplo: #marketing #digital #ads`

  try {
    const vertex = criarVertexAI()
    const model  = vertex.preview.getGenerativeModel({ model: MODELO_FLASH })
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    })
    const raw      = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
    const hashtags = raw.match(/#[\w\u00C0-\u024F]+/g) ?? ['#marketing', '#digital', '#ads']
    return NextResponse.json({ hashtags })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
```

### `app\api\ia\morning-briefing\route.ts`

```typescript
import { NextResponse }         from 'next/server'
import { createClient }         from '@supabase/supabase-js'
import { VertexAI }             from '@google-cloud/vertexai'
import { MODELO_PRO }           from '@/lib/vertex-ai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function criarVertexAI() {
  return new VertexAI({
    project:  process.env.VERTEX_AI_PROJECT_ID!,
    location: process.env.VERTEX_AI_LOCATION ?? 'us-central1',
    googleAuthOptions: { keyFilename: process.env.VERTEX_AI_CREDENTIALS },
  })
}

export async function GET() {
  const hoje = new Date().toISOString().slice(0, 10)

  const [{ data: clientes }, { data: alertas }] = await Promise.all([
    supabase
      .from('clientes')
      .select('nome, status, dias_atraso, mrr')
      .in('status', ['ativo', 'onboarding', 'setup_trafego', 'recebido']),
    supabase
      .from('alertas')
      .select('tipo, mensagem')
      .eq('resolvido', false)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const mrrTotal = (clientes ?? []).reduce((s, c) => s + (c.mrr ?? 0), 0)
  const inadimplentes = (clientes ?? []).filter((c) => (c.dias_atraso ?? 0) > 0)

  const prompt = `Você é o assistente operacional da Adsgator. Gere um briefing matinal CONCISO (máx 5 linhas, sem markdown, sem listas).

Dados de hoje (${hoje}):
- Clientes ativos: ${clientes?.length ?? 0}
- MRR total: R$ ${mrrTotal.toLocaleString('pt-BR')}
- Inadimplentes: ${inadimplentes.length} (${inadimplentes.map((c) => c.nome).join(', ') || 'nenhum'})
- Alertas abertos: ${alertas?.length ?? 0}

Foque em: o que está bem, o que precisa de atenção hoje, 1 sugestão de ação prioritária.`

  try {
    const vertex = criarVertexAI()
    const model  = vertex.preview.getGenerativeModel({ model: MODELO_PRO })
    const result = await model.generateContent(prompt)
    const texto  = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
    return NextResponse.json({ texto, gerado_em: new Date().toISOString() })
  } catch {
    const texto = inadimplentes.length > 0
      ? `${inadimplentes.length} cliente(s) inadimplente(s) requerem atenção hoje. MRR total: R$ ${mrrTotal.toLocaleString('pt-BR')}.`
      : `Bom dia! ${clientes?.length ?? 0} clientes ativos. MRR: R$ ${mrrTotal.toLocaleString('pt-BR')}. Sem alertas críticos.`
    return NextResponse.json({ texto, gerado_em: new Date().toISOString() })
  }
}
```

### `app\api\search\route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ clientes: [], tarefas: [], lancamentos: [], historico: [] })

  const like = `%${q}%`

  const [{ data: clientes }, { data: tarefas }, { data: lancamentos }, { data: historico }] = await Promise.all([
    supabase.from('clientes').select('id, nome, email, nicho, status').or(`nome.ilike.${like},email.ilike.${like}`).limit(5),
    supabase.from('tarefas').select('id, titulo, prioridade, data_prazo, status').ilike('titulo', like).neq('status', 'feito').limit(5),
    supabase.from('financeiro_lancamentos').select('id, descricao, valor, tipo, data').ilike('descricao', like).limit(5),
    supabase.from('historico_acoes').select('id, descricao, tipo, created_at, cliente_id').ilike('descricao', like).order('created_at', { ascending: false }).limit(5),
  ])

  return NextResponse.json({
    clientes:    clientes    ?? [],
    tarefas:     tarefas     ?? [],
    lancamentos: lancamentos ?? [],
    historico:   historico   ?? [],
  })
}
```

### `app\api\weather\route.ts`

```typescript
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat') ?? '-23.5505'
  const lon = searchParams.get('lon') ?? '-46.6333'

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,precipitation_probability` +
      `&hourly=precipitation_probability` +
      `&timezone=America%2FSao_Paulo` +
      `&forecast_days=1`

    const res  = await fetch(url, { next: { revalidate: 1800 } })
    const json = await res.json() as {
      current: { temperature_2m: number; precipitation_probability: number }
      hourly:  { precipitation_probability: number[] }
    }

    const chuva2h = Math.round(
      (json.hourly.precipitation_probability.slice(0, 2).reduce((a, b) => a + b, 0)) / 2
    )

    return NextResponse.json({
      temp:   Math.round(json.current.temperature_2m),
      chuva:  json.current.precipitation_probability,
      chuva2h,
    })
  } catch {
    return NextResponse.json({ temp: null, chuva: null, chuva2h: null }, { status: 200 })
  }
}
```

### `app\login\page.tsx`

```tsx
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
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-[1rem]">
      <div className="w-full max-w-[22rem]">
        <div className="text-center mb-[2.5rem]">
          <div className="w-[3rem] h-[3rem] rounded-[0.625rem] bg-ads-500 flex items-center justify-center mx-auto mb-[1.25rem]">
            <span className="text-white font-bold text-[1.25rem]">A</span>
          </div>
          <h1 className="text-ink-primary text-[1.5rem] font-bold">
            Adsgator Hub
          </h1>
          <p className="text-ink-muted text-[0.875rem] mt-[0.25rem]">
            Sistema nervoso central da agência
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-[1rem]">
          {erro && (
            <div className="bg-status-red/10 border border-status-red/20 rounded-[0.375rem] px-[0.875rem] py-[0.625rem]">
              <p className="text-[0.8125rem] text-status-red">{erro}</p>
            </div>
          )}

          {([
            { label: 'E-mail', type: 'email',    value: email, set: setEmail, ph: 'admin@adsgator.com' },
            { label: 'Senha',  type: 'password', value: senha, set: setSenha, ph: '••••••••'           },
          ] as const).map(({ label, type, value, set, ph }) => (
            <div key={label}>
              <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                required
                placeholder={ph}
                className="w-full h-[2.5rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-primary placeholder:text-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="h-[2.5rem] rounded-[0.375rem] font-semibold text-[0.875rem] bg-ads-500 hover:bg-ads-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-[0.5rem]"
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

### `components\analytics\AdsOverviewKpis.tsx`

```tsx
'use client'

import { TrendingUp, MousePointerClick, Eye, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdsKpiData {
  impressoes: number
  cliques: number
  ctr: number
  custo_total: number
  conversoes: number
  cpa: number
  roas: number
}

interface AdsOverviewKpisProps {
  data: AdsKpiData
  loading?: boolean
}

const KpiItem = ({ 
  label, 
  value, 
  icon: Icon, 
  accent = 'amber',
  prefix = '',
  suffix = '',
  decimals = 0
}: { 
  label: string
  value: number
  icon: typeof TrendingUp
  accent?: 'amber' | 'green' | 'blue'
  prefix?: string
  suffix?: string
  decimals?: number
}) => {
  const formatted = decimals > 0 
    ? value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(value).toLocaleString('pt-BR')

  const accentColors = {
    amber: 'bg-ads-500/10 text-ads-500 border-ads-500/20',
    green: 'bg-status-green/10 text-status-green border-status-green/20',
    blue: 'bg-status-blue/10 text-status-blue border-status-blue/20',
  }

  return (
    <div className={cn(
      'flex items-center gap-3 p-4 rounded-xl border',
      accentColors[accent]
    )}>
      <div className="p-2 rounded-lg bg-surface-card">
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
      <div>
        <p className="text-xs font-medium opacity-80">{label}</p>
        <p className="text-xl font-bold">
          {prefix}{formatted}{suffix}
        </p>
      </div>
    </div>
  )
}

export function AdsOverviewKpis({ data, loading }: AdsOverviewKpisProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-surface-hover animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiItem
        label="Impressões"
        value={data.impressoes}
        icon={Eye}
        accent="blue"
      />
      <KpiItem
        label="Cliques"
        value={data.cliques}
        icon={MousePointerClick}
        accent="amber"
      />
      <KpiItem
        label="CTR"
        value={data.ctr}
        icon={TrendingUp}
        accent="green"
        suffix="%"
        decimals={2}
      />
      <KpiItem
        label="Custo Total"
        value={data.custo_total}
        icon={DollarSign}
        accent="amber"
        prefix="R$ "
        decimals={2}
      />
    </div>
  )
}
```

### `components\analytics\AnalyticsMap.tsx`

```tsx
'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { getCityCoords } from '@/lib/city-coords'
import type { GeographyData } from './GeographyBreakdown'

// Leaflet só roda no browser
const MapContainer  = dynamic(() => import('react-leaflet').then((m) => m.MapContainer),  { ssr: false })
const TileLayer     = dynamic(() => import('react-leaflet').then((m) => m.TileLayer),     { ssr: false })
const CircleMarker  = dynamic(() => import('react-leaflet').then((m) => m.CircleMarker),  { ssr: false })
const Tooltip       = dynamic(() => import('react-leaflet').then((m) => m.Tooltip),       { ssr: false })

interface AnalyticsMapProps {
  data: GeographyData[]
  loading?: boolean
  metric?: 'sessoes' | 'cliques' | 'conversoes'
}

interface MapPoint {
  cidade: string
  coords: [number, number]
  value: number
}

export function AnalyticsMap({ data, loading, metric = 'sessoes' }: AnalyticsMapProps) {
  const points = useMemo<MapPoint[]>(() => {
    if (!data.length) return []

    const agg: Record<string, number> = {}
    for (const item of data) {
      const key = item.cidade || item.estado || ''
      if (!key) continue
      const v = metric === 'sessoes'
        ? (item.sessoes ?? 0)
        : metric === 'cliques'
        ? (item.cliques ?? 0)
        : (item.conversoes ?? 0)
      agg[key] = (agg[key] ?? 0) + v
    }

    return Object.entries(agg)
      .map(([cidade, value]) => {
        const coords = getCityCoords(cidade)
        if (!coords) return null
        return { cidade, coords, value }
      })
      .filter(Boolean) as MapPoint[]
  }, [data, metric])

  if (loading) {
    return <div className="h-[14rem] rounded-xl skeleton-shimmer" />
  }

  if (points.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[14rem] text-ink-muted">
        <MapPin className="w-[2rem] h-[2rem] mb-[0.5rem] opacity-40" strokeWidth={1.5} />
        <p className="text-[0.875rem]">Sem dados geográficos para mapear</p>
      </div>
    )
  }

  const maxVal = Math.max(...points.map((p) => p.value), 1)

  return (
    <div className="h-[14rem] rounded-xl overflow-hidden dark:border dark:border-surface-border">
      <MapContainer
        center={[-15.0, -52.0]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />
        {points.map((p) => {
          const radius = 6 + (p.value / maxVal) * 18
          return (
            <CircleMarker
              key={p.cidade}
              center={p.coords}
              radius={radius}
              pathOptions={{
                color: '#FFA500',
                fillColor: '#FFA500',
                fillOpacity: 0.5,
                weight: 1.5,
              }}
            >
              <Tooltip sticky>
                <span className="text-[0.75rem] font-semibold">{p.cidade}</span>
                <br />
                <span className="text-[0.6875rem]">
                  {p.value.toLocaleString('pt-BR')}{' '}
                  {metric === 'sessoes' ? 'sessões' : metric === 'cliques' ? 'cliques' : 'conv.'}
                </span>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
```

### `components\analytics\DemographicsCard.tsx`

```tsx
'use client'

import { Users } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface DemographicsData {
  faixa_etaria: string
  genero: string
  impressoes: number
  cliques: number
  conversoes: number
}

interface DemographicsCardProps {
  data: DemographicsData[]
  loading?: boolean
}

const COLORS = ['#FFB100', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B']

export function DemographicsCard({ data, loading }: DemographicsCardProps) {
  if (loading) {
    return (
      <div className="h-48 rounded-xl bg-surface-hover animate-pulse" />
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-ink-muted">
        <Users className="w-8 h-8 mb-2 opacity-50" strokeWidth={1.5} />
        <p className="text-sm">Sem dados demográficos</p>
      </div>
    )
  }

  // Agrupar por faixa etária
  const porIdade = data.reduce((acc, item) => {
    const chave = item.faixa_etaria.replace('AGE_RANGE_', '').replace('_', '-')
    acc[chave] = (acc[chave] || 0) + item.impressoes
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(porIdade)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#2A3527',
                border: '1px solid #44523F',
                borderRadius: '0.5rem',
              }}
              itemStyle={{ color: '#F0F3EF' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {chartData.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-ink-secondary">{item.name}</span>
            </div>
            <span className="font-medium">{item.value.toLocaleString('pt-BR')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### `components\analytics\DeviceBreakdown.tsx`

```tsx
'use client'

import { Smartphone, Monitor, Tablet } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface DeviceData {
  device: string
  sistema_operacional?: string
  impressoes?: number
  cliques?: number
  sessoes?: number
  usuarios?: number
}

interface DeviceBreakdownProps {
  data: DeviceData[]
  loading?: boolean
}

const DEVICE_ICONS: Record<string, typeof Smartphone> = {
  MOBILE: Smartphone,
  DESKTOP: Monitor,
  TABLET: Tablet,
}

const COLORS = {
  MOBILE: '#FFB100',
  DESKTOP: '#10B981',
  TABLET: '#3B82F6',
  UNKNOWN: '#6B7280',
}

export function DeviceBreakdown({ data, loading }: DeviceBreakdownProps) {
  if (loading) {
    return (
      <div className="h-40 rounded-xl bg-surface-hover animate-pulse" />
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-ink-muted">
        <Smartphone className="w-8 h-8 mb-2 opacity-50" strokeWidth={1.5} />
        <p className="text-sm">Sem dados de dispositivos</p>
      </div>
    )
  }

  // Agrupar por tipo de device
  const agrupado = data.reduce((acc, item) => {
    const tipo = item.device?.toUpperCase() || 'UNKNOWN'
    const valor = item.sessoes || item.cliques || item.impressoes || 0
    acc[tipo] = (acc[tipo] || 0) + valor
    return acc
  }, {} as Record<string, number>)

  const total = Object.values(agrupado).reduce((a, b) => a + b, 0)

  const chartData = Object.entries(agrupado)
    .map(([name, value]) => ({ name, value, percent: total > 0 ? (value / total) * 100 : 0 }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={60}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell 
                  key={entry.name} 
                  fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.UNKNOWN} 
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#2A3527',
                border: '1px solid #44523F',
                borderRadius: '0.5rem',
              }}
              itemStyle={{ color: '#F0F3EF' }}
              formatter={(value, name) => [
                `${Number(value || 0).toLocaleString('pt-BR')} (${(Number(value || 0) / total * 100).toFixed(1)}%)`,
                String(name)
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {chartData.map((item) => {
          const Icon = DEVICE_ICONS[item.name] || Smartphone
          const color = COLORS[item.name as keyof typeof COLORS] || COLORS.UNKNOWN
          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
                </div>
                <span className="text-sm text-ink-secondary capitalize">{item.name.toLowerCase()}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{item.percent.toFixed(1)}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### `components\analytics\GA4Panel.tsx`

```tsx
﻿'use client'

import { Users, Eye, Clock, TrendingUp } from 'lucide-react'

interface GA4Data {
  sessoes: number
  usuarios_novos: number
  visualizacoes_pagina: number
  taxa_engajamento: number
  duracao_media_sessao: number
  taxa_rejeicao: number
  conversoes: number
  valor_conversao_total: number
}

interface GA4PanelProps {
  data: GA4Data | null
  loading?: boolean
}

const formatarTempo = (segundos: number) => {
  const min = Math.floor(segundos / 60)
  const seg = Math.floor(segundos % 60)
  return `${min}m ${seg}s`
}

export function GA4Panel({ data, loading }: GA4PanelProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-surface-hover animate-pulse" />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-ink-muted">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" strokeWidth={1.5} />
        <p className="text-sm">Dados do GA4 não disponíveis</p>
      </div>
    )
  }

  const kpis = [
    { label: 'Sessões', value: data.sessoes.toLocaleString('pt-BR'), icon: Eye },
    { label: 'Usuários', value: data.usuarios_novos.toLocaleString('pt-BR'), icon: Users },
    { label: 'Taxa Engajamento', value: `${data.taxa_engajamento.toFixed(1)}%`, icon: TrendingUp },
    { label: 'Duração Média', value: formatarTempo(data.duracao_media_sessao), icon: Clock },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <kpi.icon className="w-4 h-4 text-ads-500" strokeWidth={2} />
            <span className="text-xs text-ink-muted">{kpi.label}</span>
          </div>
          <p className="text-xl font-bold text-ink-primary">{kpi.value}</p>
        </div>
      ))}
    </div>
  )
}
```

### `components\analytics\GeographyBreakdown.tsx`

```tsx
'use client'

import { MapPin } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export interface GeographyData {
  pais?: string
  estado: string
  cidade: string
  sessoes?: number
  usuarios?: number
  impressoes?: number
  cliques?: number
  conversoes?: number
  custo?: number
  taxa_engajamento?: number
}

interface GeographyBreakdownProps {
  data: GeographyData[]
  loading?: boolean
  title?: string
}

const COLORS = ['#FFB100', '#E6A000', '#CC8E00', '#B37B00', '#8C6200']

export function GeographyBreakdown({ data, loading, title = 'Geografia' }: GeographyBreakdownProps) {
  if (loading) {
    return (
      <div className="h-64 rounded-xl bg-surface-hover animate-pulse" />
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-ink-muted">
        <MapPin className="w-8 h-8 mb-2 opacity-50" strokeWidth={1.5} />
        <p className="text-sm">Sem dados geográficos</p>
      </div>
    )
  }

  // Agrupar por estado e pegar top 5
  const porEstado = data.reduce((acc, item) => {
    if (!item.estado) return acc
    acc[item.estado] = (acc[item.estado] || 0) + (item.sessoes || item.cliques || 0)
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(porEstado)
    .map(([name, value]) => ({ name: name.slice(0, 15), fullName: name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return (
    <div>
      <h4 className="text-sm font-medium text-ink-muted mb-4">{title}</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={70}
              tick={{ fill: '#A3A3A3', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
              }}
              itemStyle={{ color: 'var(--ink-primary)' }}
              labelStyle={{ color: 'var(--ink-secondary)', marginBottom: '0.125rem' }}
              formatter={(value, _name, props) => [
                `${Number(value || 0).toLocaleString('pt-BR')} sessões`,
                (props?.payload as { fullName: string })?.fullName || ''
              ]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

### `components\analytics\SearchTermsTable.tsx`

```tsx
'use client'

import { Search, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchTerm {
  termo: string
  impressoes: number
  cliques: number
  ctr: number
  conversoes: number
  custo: number
}

interface SearchTermsTableProps {
  data: SearchTerm[]
  loading?: boolean
  maxRows?: number
}

export function SearchTermsTable({ data, loading, maxRows = 10 }: SearchTermsTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-surface-hover animate-pulse" />
        ))}
      </div>
    )
  }

  const sorted = [...data]
    .sort((a, b) => b.cliques - a.cliques)
    .slice(0, maxRows)

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-ink-muted">
        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" strokeWidth={1.5} />
        <p className="text-sm">Sem dados de termos de pesquisa</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border text-ink-muted">
            <th className="text-left py-2 px-2 font-medium">Termo de Pesquisa</th>
            <th className="text-right py-2 px-2 font-medium">Cliques</th>
            <th className="text-right py-2 px-2 font-medium">CTR</th>
            <th className="text-right py-2 px-2 font-medium">Conv.</th>
            <th className="text-right py-2 px-2 font-medium">Custo</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((term, i) => (
            <tr key={i} className="border-b border-surface-border/50 hover:bg-surface-hover/50 transition-colors">
              <td className="py-2 px-2">
                <span className="font-medium text-ink-primary truncate max-w-[200px] block" title={term.termo}>
                  {term.termo}
                </span>
              </td>
              <td className="text-right py-2 px-2">{term.cliques.toLocaleString('pt-BR')}</td>
              <td className="text-right py-2 px-2">
                <span className={cn(
                  'inline-flex items-center gap-0.5 text-xs',
                  term.ctr > 2 ? 'text-status-green' : term.ctr > 1 ? 'text-ads-500' : 'text-ink-muted'
                )}>
                  {term.ctr > 2 ? <ArrowUpRight className="w-3 h-3" /> : term.ctr < 1 ? <ArrowDownRight className="w-3 h-3" /> : null}
                  {term.ctr.toFixed(2)}%
                </span>
              </td>
              <td className="text-right py-2 px-2">{term.conversoes}</td>
              <td className="text-right py-2 px-2">R$ {term.custo.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### `components\analytics\TrafficSources.tsx`

```tsx
'use client'

import { Globe, Share2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface TrafficSource {
  fonte: string
  midia: string
  sessoes: number
  conversoes: number
  taxa_conversao: number
}

interface TrafficSourcesProps {
  data: TrafficSource[]
  loading?: boolean
}

const COLORS = ['#FFB100', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B', '#EC4899']

export function TrafficSources({ data, loading }: TrafficSourcesProps) {
  if (loading) {
    return (
      <div className="h-48 rounded-xl bg-surface-hover animate-pulse" />
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-ink-muted">
        <Share2 className="w-8 h-8 mb-2 opacity-50" strokeWidth={1.5} />
        <p className="text-sm">Sem dados de fontes de tráfego</p>
      </div>
    )
  }

  const chartData = data
    .slice(0, 7)
    .map(item => ({
      name: item.fonte.length > 12 ? item.fonte.slice(0, 12) + '...' : item.fonte,
      fullName: item.fonte,
      sessoes: item.sessoes,
      conversoes: item.conversoes,
      taxa: item.taxa_conversao,
    }))

  return (
    <div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 60, right: 20 }}>
            <XAxis dataKey="name" hide />
            <YAxis 
              hide 
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#2A3527',
                border: '1px solid #44523F',
                borderRadius: '0.5rem',
              }}
              itemStyle={{ color: '#F0F3EF' }}
              formatter={(value, _name, props) => {
                const payload = props?.payload as { fullName: string; conversoes: number; taxa: number } | undefined
                return [
                  `${Number(value || 0).toLocaleString('pt-BR')} sessões | ${payload?.conversoes || 0} conv. (${(payload?.taxa || 0).toFixed(2)}%)`,
                  payload?.fullName || ''
                ]
              }}
            />
            <Bar dataKey="sessoes" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {chartData.slice(0, 6).map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-ink-secondary truncate" title={item.fullName}>
              {item.name}
            </span>
            <span className="text-ink-muted ml-auto">{item.sessoes}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### `components\clientes\AcessoRapido.tsx`

```tsx
﻿'use client'

import { ExternalLink, BarChart3, Globe, MapPin, LineChart, FileSpreadsheet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClienteLinks {
  google_ads_customer_id?: string
  ga4_property_id?: string
  gmb_id?: string
  looker_url?: string
  website?: string
}

interface AcessoRapidoProps {
  links: ClienteLinks
}

const LinkButton = ({ 
  href, 
  icon: Icon, 
  label, 
  color = 'blue',
  disabled = false
}: { 
  href: string
  icon: typeof ExternalLink
  label: string
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'red'
  disabled?: boolean
}) => {
  const colors = {
    blue: 'bg-status-blue/10 text-status-blue border-status-blue/20 hover:bg-status-blue/20',
    green: 'bg-status-green/10 text-status-green border-status-green/20 hover:bg-status-green/20',
    amber: 'bg-ads-500/10 text-ads-500 border-ads-500/20 hover:bg-ads-500/20',
    purple: 'bg-status-purple/10 text-status-purple border-status-purple/20 hover:bg-status-purple/20',
    red: 'bg-status-red/10 text-status-red border-status-red/20 hover:bg-status-red/20',
  }

  if (disabled) {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border opacity-50 cursor-not-allowed',
        colors[color]
      )}>
        <Icon className="w-4 h-4" strokeWidth={2} />
        <span className="text-sm font-medium">{label}</span>
      </div>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
        colors[color]
      )}
    >
      <Icon className="w-4 h-4" strokeWidth={2} />
      <span className="text-sm font-medium">{label}</span>
      <ExternalLink className="w-3 h-3 ml-auto opacity-60" strokeWidth={2} />
    </a>
  )
}

export function AcessoRapido({ links }: AcessoRapidoProps) {
  const hasAnyLink = links.google_ads_customer_id || links.ga4_property_id || links.gmb_id || links.looker_url || links.website

  if (!hasAnyLink) {
    return (
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-4">
        <h3 className="text-sm font-semibold text-ink-primary mb-3">Acesso Rápido</h3>
        <p className="text-sm text-ink-muted">Nenhum link externo configurado para este cliente.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-4">
      <h3 className="text-sm font-semibold text-ink-primary mb-3">Acesso Rápido</h3>
      <div className="flex flex-wrap gap-2">
        {links.google_ads_customer_id && (
          <LinkButton
            href={`https://ads.google.com/aw/overview?ocid=${links.google_ads_customer_id}`}
            icon={BarChart3}
            label="Google Ads"
            color="blue"
          />
        )}
        {links.ga4_property_id && (
          <LinkButton
            href={`https://analytics.google.com/analytics/web/?authuser=0#/p${links.ga4_property_id}/reports/intelligenthome`}
            icon={LineChart}
            label="GA4"
            color="amber"
          />
        )}
        {links.gmb_id && (
          <LinkButton
            href={`https://business.google.com/locations/${links.gmb_id}`}
            icon={MapPin}
            label="Google Meu Negócio"
            color="green"
          />
        )}
        {links.looker_url && (
          <LinkButton
            href={links.looker_url}
            icon={FileSpreadsheet}
            label="Looker Studio"
            color="purple"
          />
        )}
        {links.website && (
          <LinkButton
            href={links.website}
            icon={Globe}
            label="Site"
            color="blue"
          />
        )}
      </div>
    </div>
  )
}
```

### `components\clientes\AuditTimeline.tsx`

```tsx
﻿'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AuditLog {
  id:         string
  acao:       string
  descricao?: string
  created_at: string
}

export function AuditTimeline({ clienteId }: { clienteId: string }) {
  const supabase = createClient()
  const [logs, setLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    supabase
      .from('audit_logs')
      .select('id, acao, descricao, created_at')
      .eq('registro_id', clienteId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setLogs(data ?? []))
  }, [clienteId])

  if (logs.length === 0) return null

  return (
    <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem]">
      <div className="flex items-center gap-[0.5rem] mb-[1rem]">
        <Clock className="w-[1rem] h-[1rem] text-ink-muted" strokeWidth={1.75} />
        <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Histórico</h3>
      </div>
      <div className="relative">
        <div className="absolute left-[0.4375rem] top-0 bottom-0 w-px bg-surface-border" />
        <ul className="space-y-[1rem]">
          {logs.map((log) => (
            <li key={log.id} className="flex gap-[1rem] pl-[1.25rem] relative">
              <div className="absolute left-0 top-[0.1875rem] w-[0.875rem] h-[0.875rem] rounded-full bg-surface-card border-2 border-surface-border" />
              <div>
                <p className="text-ink-secondary text-[0.875rem]">
                  {log.descricao ?? log.acao}
                </p>
                <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

### `components\clientes\ChecklistCard.tsx`

```tsx
﻿'use client'

import { useState } from 'react'
import { CheckCircle, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ChecklistItem } from '@/lib/types'

interface ChecklistCardProps {
  clienteId: string
  estagioId: string
  items:     ChecklistItem[]
}

export function ChecklistCard({ clienteId: _clienteId, estagioId, items: itemsInicial }: ChecklistCardProps) {
  const supabase = createClient()
  const [items, setItems] = useState(itemsInicial)

  async function toggleItem(index: number) {
    const novosItems = items.map((it, i) =>
      i === index ? { ...it, done: !it.done } : it
    )
    setItems(novosItems)
    await supabase
      .from('estagios')
      .update({ checklist: novosItems })
      .eq('id', estagioId)
  }

  const total    = items.length
  const feitos   = items.filter((i) => i.done).length
  const progresso = total > 0 ? (feitos / total) * 100 : 0

  return (
    <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem]">
      <div className="flex items-center justify-between mb-[0.75rem]">
        <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Checklist</h3>
        <span className="text-ink-muted text-[0.8125rem]">{feitos}/{total}</span>
      </div>

      <div className="h-[0.25rem] bg-surface-hover rounded-full mb-[1rem] overflow-hidden">
        <div
          className="h-full bg-ads-500 rounded-full transition-all duration-500"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <ul className="space-y-[0.5rem]">
        {items.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => toggleItem(i)}
              className="flex items-start gap-[0.625rem] w-full text-left hover:opacity-80 transition-opacity"
            >
              {item.done ? (
                <CheckCircle className="w-[1rem] h-[1rem] text-status-green shrink-0 mt-[0.125rem]" strokeWidth={2} />
              ) : (
                <Circle className="w-[1rem] h-[1rem] text-ink-muted shrink-0 mt-[0.125rem]" strokeWidth={1.75} />
              )}
              <span className={`text-[0.875rem] ${item.done ? 'text-ink-muted line-through' : 'text-ink-secondary'}`}>
                {item.item}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### `components\clientes\ClienteCard.tsx`

```tsx
﻿'use client';

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
        'bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow overflow-hidden',
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
```

### `components\clientes\ClienteIntegracoes.tsx`

```tsx
﻿'use client'

import { useState } from 'react'
import { ExternalLink, BarChart3, LineChart, MapPin, FileSpreadsheet, Globe, Save, Pencil, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Cliente } from '@/lib/types'

interface ClienteIntegracoesProps {
  cliente: Cliente
  onUpdate: (cliente: Cliente) => void
}

interface LinkItemProps {
  icon: typeof ExternalLink
  label: string
  value?: string | null
  placeholder: string
  color: 'blue' | 'green' | 'amber' | 'purple' | 'slate'
  enabled?: boolean
  onEnabledChange?: (enabled: boolean) => void
  onChange: (value: string) => void
  editing: boolean
}

const LinkItem = ({
  icon: Icon,
  label,
  value,
  placeholder,
  color,
  enabled,
  onEnabledChange,
  onChange,
  editing
}: LinkItemProps) => {
  const colors = {
    blue: 'bg-status-blue/10 text-status-blue border-status-blue/20',
    green: 'bg-status-green/10 text-status-green border-status-green/20',
    amber: 'bg-ads-500/10 text-ads-500 border-ads-500/20',
    purple: 'bg-status-purple/10 text-status-purple border-status-purple/20',
    slate: 'bg-surface-hover text-ink-secondary border-surface-border',
  }

  const hasValue = value && value.trim().length > 0
  const isActive = enabled !== undefined ? enabled : hasValue

  return (
    <div className={cn(
      'rounded-xl border p-3 transition-all',
      isActive ? colors[color] : 'bg-surface-hover/50 border-surface-border/50 opacity-60'
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
        <span className="text-sm font-medium">{label}</span>
        {onEnabledChange && (
          <button
            onClick={() => onEnabledChange(!enabled)}
            className={cn(
              'ml-auto w-8 h-4 rounded-full transition-colors relative',
              enabled ? 'bg-status-green' : 'bg-surface-border'
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all',
              enabled ? 'left-4' : 'left-0.5'
            )} />
          </button>
        )}
      </div>
      
      {editing ? (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-2 py-1.5 text-sm bg-surface-base border border-surface-border rounded-md focus:outline-none focus:border-ads-500 text-ink-primary"
        />
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm truncate flex-1 font-mono">
            {hasValue ? value : <span className="italic opacity-50">{placeholder}</span>}
          </span>
          {hasValue && (
            <a
              href={value || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-white/10 rounded transition-colors shrink-0"
            >
              <ExternalLink className="w-3 h-3" strokeWidth={2} />
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export function ClienteIntegracoes({ cliente, onUpdate }: ClienteIntegracoesProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    google_ads_customer_id: cliente.google_ads_customer_id || '',
    google_ads_enabled: cliente.google_ads_enabled || false,
    ga4_property_id: cliente.ga4_property_id || '',
    ga4_enabled: cliente.ga4_enabled || false,
    gmb_id: cliente.gmb_id || '',
    looker_url: cliente.looker_url || '',
    website: cliente.website || '',
    dominio: cliente.dominio || '',
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({
          google_ads_customer_id: formData.google_ads_customer_id || null,
          google_ads_enabled: formData.google_ads_enabled,
          ga4_property_id: formData.ga4_property_id || null,
          ga4_enabled: formData.ga4_enabled,
          gmb_id: formData.gmb_id || null,
          looker_url: formData.looker_url || null,
          website: formData.website || null,
          dominio: formData.dominio || null,
          data_atualizacao: new Date().toISOString(),
        })
        .eq('id', cliente.id)
        .select()
        .single()

      if (error) throw new Error(`${error.message} (${error.code})`)

      if (data) {
        onUpdate(data as Cliente)
        toast.success('Integrações atualizadas!')
        setEditing(false)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar integrações')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      google_ads_customer_id: cliente.google_ads_customer_id || '',
      google_ads_enabled: cliente.google_ads_enabled || false,
      ga4_property_id: cliente.ga4_property_id || '',
      ga4_enabled: cliente.ga4_enabled || false,
      gmb_id: cliente.gmb_id || '',
      looker_url: cliente.looker_url || '',
      website: cliente.website || '',
      dominio: cliente.dominio || '',
    })
    setEditing(false)
  }

  return (
    <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-ads-500" strokeWidth={2} />
          <h3 className="font-semibold text-ink-primary">Integrações & Links</h3>
        </div>
        
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2} />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-ads-500 hover:bg-ads-600 text-white rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" strokeWidth={2} />
              )}
              Salvar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-hover rounded-md transition-colors"
          >
            <Pencil className="w-4 h-4" strokeWidth={2} />
            Editar
          </button>
        )}
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Google Ads */}
        <LinkItem
          icon={BarChart3}
          label="Google Ads"
          value={formData.google_ads_customer_id}
          enabled={formData.google_ads_enabled}
          onEnabledChange={(enabled) => setFormData({ ...formData, google_ads_enabled: enabled })}
          onChange={(value) => setFormData({ ...formData, google_ads_customer_id: value })}
          placeholder="Customer ID (ex: 123-456-7890)"
          color="blue"
          editing={editing}
        />

        {/* GA4 */}
        <LinkItem
          icon={LineChart}
          label="Google Analytics 4"
          value={formData.ga4_property_id}
          enabled={formData.ga4_enabled}
          onEnabledChange={(enabled) => setFormData({ ...formData, ga4_enabled: enabled })}
          onChange={(value) => setFormData({ ...formData, ga4_property_id: value })}
          placeholder="Property ID (ex: 123456789)"
          color="amber"
          editing={editing}
        />

        {/* GMB */}
        <LinkItem
          icon={MapPin}
          label="Google Meu Negócio"
          value={formData.gmb_id}
          onChange={(value) => setFormData({ ...formData, gmb_id: value })}
          placeholder="Location ID"
          color="green"
          editing={editing}
        />

        {/* Looker */}
        <LinkItem
          icon={FileSpreadsheet}
          label="Looker Studio"
          value={formData.looker_url}
          onChange={(value) => setFormData({ ...formData, looker_url: value })}
          placeholder="URL do relatório"
          color="purple"
          editing={editing}
        />

        {/* Website */}
        <LinkItem
          icon={Globe}
          label="Website"
          value={formData.website}
          onChange={(value) => setFormData({ ...formData, website: value })}
          placeholder="https://..."
          color="slate"
          editing={editing}
        />

        {/* Domínio */}
        <LinkItem
          icon={Check}
          label="Domínio"
          value={formData.dominio}
          onChange={(value) => setFormData({ ...formData, dominio: value })}
          placeholder="exemplo.com.br"
          color="slate"
          editing={editing}
        />
      </div>
    </div>
  )
}
```

### `components\clientes\ClientePerformance.tsx`

```tsx
﻿'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, TrendingUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Lazy imports dos componentes analytics
import { AdsOverviewKpis } from '@/components/analytics/AdsOverviewKpis'
import { SearchTermsTable } from '@/components/analytics/SearchTermsTable'
import { DemographicsCard } from '@/components/analytics/DemographicsCard'
import { GA4Panel } from '@/components/analytics/GA4Panel'
import { GeographyBreakdown } from '@/components/analytics/GeographyBreakdown'
import { DeviceBreakdown } from '@/components/analytics/DeviceBreakdown'
import { TrafficSources } from '@/components/analytics/TrafficSources'

interface ClientePerformanceProps {
  clienteId: string
  googleAdsEnabled?: boolean
  ga4Enabled?: boolean
}

export function ClientePerformance({ 
  clienteId, 
  googleAdsEnabled = false, 
  ga4Enabled = false 
}: ClientePerformanceProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d'>('30d')

  const loadData = useCallback(async () => {
    if (!expanded || data) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/${clienteId}/live?periodo=${periodo}`)
      if (res.ok) {
        const result = await res.json()
        setData(result)
      } else {
        toast.error('Erro ao carregar dados de performance')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [clienteId, expanded, data, periodo])

  const handleToggle = () => {
    const newExpanded = !expanded
    setExpanded(newExpanded)
    if (newExpanded && !data) {
      loadData()
    }
  }

  // Agregar dados para KPIs
  const adsKpiData = data?.googleAds?.campanhas?.reduce((acc: any, c: any) => ({
    impressoes: (acc.impressoes || 0) + (c.impressoes || 0),
    cliques: (acc.cliques || 0) + (c.cliques || 0),
    custo_total: (acc.custo_total || 0) + (c.custo_total || 0),
    conversoes: (acc.conversoes || 0) + (c.conversoes || 0),
    ctr: acc.impressoes > 0 ? (acc.cliques / acc.impressoes) * 100 : 0,
    cpa: acc.conversoes > 0 ? acc.custo_total / acc.conversoes : 0,
    roas: acc.custo_total > 0 ? (acc.conversoes * 50) / acc.custo_total : 0, // valor estimado
  }), { impressoes: 0, cliques: 0, custo_total: 0, conversoes: 0, ctr: 0, cpa: 0, roas: 0 })

  const hasData = googleAdsEnabled || ga4Enabled

  if (!hasData) {
    return (
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-ink-muted" strokeWidth={2} />
            <span className="text-sm font-medium text-ink-secondary">Performance Ads + GA4</span>
          </div>
          <span className="text-xs text-ink-muted">Não configurado</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-ads-500" strokeWidth={2} />
          <span className="text-sm font-semibold text-ink-primary">Performance Ads + GA4</span>
          {googleAdsEnabled && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-status-blue/10 text-status-blue">Ads</span>
          )}
          {ga4Enabled && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-ads-500/10 text-ads-500">GA4</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-ads-500" strokeWidth={2} />}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-ink-muted" strokeWidth={2} />
          ) : (
            <ChevronDown className="w-4 h-4 text-ink-muted" strokeWidth={2} />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-surface-border p-4 space-y-4">
          {/* Seletor de período */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted">Período:</span>
            <div className="flex gap-1">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriodo(p)
                    setData(null)
                    setTimeout(loadData, 0)
                  }}
                  className={cn(
                    'px-2 py-1 text-xs rounded-md transition-colors',
                    periodo === p
                      ? 'bg-ads-500 text-white'
                      : 'bg-surface-hover text-ink-secondary hover:text-ink-primary'
                  )}
                >
                  {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-ads-500 mx-auto mb-2" strokeWidth={2} />
              <p className="text-sm text-ink-muted">Carregando dados...</p>
            </div>
          ) : data ? (
            <div className="space-y-4">
              {/* Google Ads */}
              {data.googleAds?.enabled && adsKpiData && (
                <div>
                  <h4 className="text-xs font-medium text-ink-muted mb-2">Google Ads</h4>
                  <AdsOverviewKpis data={adsKpiData} loading={false} />
                </div>
              )}

              {/* GA4 */}
              {data.ga4?.enabled && data.ga4.dados && (
                <div>
                  <h4 className="text-xs font-medium text-ink-muted mb-2">Google Analytics 4</h4>
                  <GA4Panel data={data.ga4.dados} loading={false} />
                </div>
              )}

              {/* Detalhes em grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {data.googleAds?.termosPesquisa?.length > 0 && (
                  <div className="bg-surface-base rounded-lg p-3">
                    <h5 className="text-xs font-medium text-ink-primary mb-2">Termos de Pesquisa</h5>
                    <SearchTermsTable data={data.googleAds.termosPesquisa} maxRows={5} />
                  </div>
                )}
                {data.googleAds?.demografia?.length > 0 && (
                  <div className="bg-surface-base rounded-lg p-3">
                    <h5 className="text-xs font-medium text-ink-primary mb-2">Demografia</h5>
                    <DemographicsCard data={data.googleAds.demografia} />
                  </div>
                )}
                {(data.ga4?.geografia?.length > 0 || data.googleAds?.geografia?.length > 0) && (
                  <div className="bg-surface-base rounded-lg p-3">
                    <h5 className="text-xs font-medium text-ink-primary mb-2">Geografia</h5>
                    <GeographyBreakdown 
                      data={data.ga4?.geografia || data.googleAds?.geografia} 
                      title={data.ga4?.geografia ? 'Sessões por região' : 'Cliques por região'}
                    />
                  </div>
                )}
                {(data.ga4?.device?.length > 0 || data.googleAds?.device?.length > 0) && (
                  <div className="bg-surface-base rounded-lg p-3">
                    <h5 className="text-xs font-medium text-ink-primary mb-2">Dispositivos</h5>
                    <DeviceBreakdown data={data.ga4?.device || data.googleAds?.device} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-muted text-center py-4">
              Clique para carregar dados de performance
            </p>
          )}
        </div>
      )}
    </div>
  )
}
```

### `components\clientes\OnboardChecklist.tsx`

```tsx
﻿'use client';

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
    <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem]">
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
```

### `components\clientes\WhatsAppTemplateModal.tsx`

```tsx
﻿'use client'

import { useState } from 'react'
import { X, MessageCircle, Send, Copy, CheckCheck } from 'lucide-react'
import type { Cliente } from '@/lib/types'

interface Props {
  cliente: Cliente
  onClose: () => void
}

const TEMPLATES: { id: string; label: string; texto: (c: Cliente) => string }[] = [
  {
    id:    '#BOASVINDAS',
    label: 'Boas-vindas',
    texto: (c) =>
      `Olá ${c.nome.split(' ')[0]}! 👋 Bem-vindo(a) à Adsgator!\n\nEstamos muito felizes em ter você como cliente. Nos próximos dias entraremos em contato para iniciar o onboarding e configurar suas campanhas.\n\nQualquer dúvida, estou à disposição!`,
  },
  {
    id:    '#CONVITE',
    label: 'Convite Reunião',
    texto: (c) =>
      `Olá ${c.nome.split(' ')[0]}! Tudo bem?\n\nGostaria de agendar uma reunião rápida (30 min) para alinharmos os próximos passos das suas campanhas. Qual horário seria melhor para você?`,
  },
  {
    id:    '#BRIEFINGGA',
    label: 'Briefing Google Ads',
    texto: (c) =>
      `Olá ${c.nome.split(' ')[0]}! 🎯\n\nPara configurarmos suas campanhas no Google Ads com precisão, precisamos de algumas informações:\n\n1. Qual o principal objetivo? (leads, vendas, visitas à loja)\n2. Qual o ticket médio do produto/serviço?\n3. Há alguma promoção ou sazonalidade que devemos considerar?\n\nResponda quando puder!`,
  },
  {
    id:    '#SALDOGOOGLE',
    label: 'Alerta Saldo Google',
    texto: (c) =>
      `Olá ${c.nome.split(' ')[0]}! ⚠️\n\nIdentificamos que o saldo da sua conta Google Ads está baixo. Para evitar a pausa das campanhas, recomendamos adicionar crédito o quanto antes.\n\nPosso te ajudar com o procedimento de recarga se precisar!`,
  },
  {
    id:    'COBRANCA',
    label: 'Cobrança',
    texto: (c) =>
      `Olá ${c.nome.split(' ')[0]}! Tudo bem?\n\nPassando para avisar que identificamos uma pendência financeira em sua conta. Para manter suas campanhas ativas, pedimos que regularize o pagamento assim que possível.\n\nEm caso de dúvidas, estou à disposição!`,
  },
  {
    id:    'CUSTOMIZADO',
    label: 'Personalizado',
    texto: () => '',
  },
]

export function WhatsAppTemplateModal({ cliente, onClose }: Props) {
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id)
  const [texto,      setTexto]      = useState(TEMPLATES[0].texto(cliente))
  const [copiado,    setCopiado]    = useState(false)

  function selecionarTemplate(id: string) {
    setTemplateId(id)
    const tpl = TEMPLATES.find((t) => t.id === id)
    if (tpl) setTexto(tpl.texto(cliente))
  }

  function enviarWhatsApp() {
    const numero = (cliente.whatsapp ?? '').replace(/\D/g, '')
    if (!numero) return
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank')
  }

  async function copiarTexto() {
    await navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  const temNumero = !!(cliente.whatsapp ?? '').replace(/\D/g, '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow shadow-2xl w-full max-w-[34rem] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-[1.5rem] py-[1rem] border-b border-surface-border">
          <div className="flex items-center gap-[0.625rem]">
            <MessageCircle className="w-[1.125rem] h-[1.125rem] text-status-green" strokeWidth={1.75} />
            <div>
              <p className="text-ink-primary font-semibold text-[0.9375rem]">Enviar WhatsApp</p>
              <p className="text-ink-muted text-[0.75rem]">{cliente.nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-[2rem] h-[2rem] flex items-center justify-center rounded hover:bg-surface-hover text-ink-muted transition-colors">
            <X className="w-[1rem] h-[1rem]" strokeWidth={2} />
          </button>
        </div>

        <div className="p-[1.5rem] flex flex-col gap-[1.25rem]">
          {/* Seletor de template */}
          <div>
            <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.625rem]">Template</p>
            <div className="flex flex-wrap gap-[0.375rem]">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selecionarTemplate(t.id)}
                  className={`h-[2rem] px-[0.75rem] rounded text-[0.8125rem] font-medium transition-colors ${
                    templateId === t.id
                      ? 'bg-ads-500 text-white'
                      : 'bg-surface-hover text-ink-secondary hover:text-ink-primary border border-surface-border'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview editável */}
          <div>
            <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.5rem]">Mensagem</p>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={8}
              className="w-full px-[0.875rem] py-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
            <p className="text-ink-muted text-[0.6875rem] text-right mt-[0.25rem]">{texto.length} caracteres</p>
          </div>

          {/* Número */}
          {!temNumero && (
            <div className="bg-status-orange/10 border border-status-orange/30 rounded-lg px-[0.875rem] py-[0.625rem]">
              <p className="text-status-orange text-[0.8125rem]">Este cliente não possui número de WhatsApp cadastrado.</p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-[0.75rem]">
            <button
              onClick={copiarTexto}
              className="flex items-center gap-[0.375rem] h-[2.5rem] px-[1rem] rounded-lg bg-surface-hover border border-surface-border text-ink-secondary text-[0.875rem] font-medium hover:text-ink-primary transition-colors"
            >
              {copiado
                ? <><CheckCheck className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} /> Copiado</>
                : <><Copy className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} /> Copiar</>
              }
            </button>
            <button
              onClick={enviarWhatsApp}
              disabled={!temNumero || !texto.trim()}
              className="flex-1 flex items-center justify-center gap-[0.5rem] h-[2.5rem] rounded-lg bg-status-green text-white text-[0.875rem] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Send className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
              Abrir no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### `components\configuracoes\AuditLogViewer.tsx`

```tsx
﻿'use client'

import { useEffect, useState } from 'react'
import { History, User, Building2, Calendar, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchAuditLogs, type AuditLogEntry } from '@/lib/audit'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

type AuditAction = AuditLogEntry['action']

const ACTION_LABELS: Record<AuditAction, { label: string; color: string }> = {
  'cliente_created': { label: 'Cliente Criado', color: 'text-status-green' },
  'cliente_updated': { label: 'Cliente Atualizado', color: 'text-ads-500' },
  'cliente_deleted': { label: 'Cliente Removido', color: 'text-status-red' },
  'cliente_status_changed': { label: 'Status Alterado', color: 'text-status-blue' },
  'estagio_advanced': { label: 'Estágio Avançado', color: 'text-status-purple' },
  'tarefa_created': { label: 'Tarefa Criada', color: 'text-status-green' },
  'tarefa_updated': { label: 'Tarefa Atualizada', color: 'text-ads-500' },
  'tarefa_completed': { label: 'Tarefa Concluída', color: 'text-status-green' },
  'financeiro_lancamento': { label: 'Lançamento Financeiro', color: 'text-status-orange' },
  'config_updated': { label: 'Configuração Alterada', color: 'text-ads-500' },
  'login': { label: 'Login', color: 'text-status-green' },
  'logout': { label: 'Logout', color: 'text-ink-muted' },
  'export_data': { label: 'Exportação de Dados', color: 'text-status-blue' },
  'integration_connected': { label: 'Integração Conectada', color: 'text-status-green' },
  'integration_disconnected': { label: 'Integração Desconectada', color: 'text-status-orange' },
}

interface Filters {
  action?: AuditAction
  clienteId?: string
  startDate?: string
  endDate?: string
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({})
  const [userRole, setUserRole] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const PAGE_SIZE = 20

  useEffect(() => {
    checkPermission()
  }, [])

  useEffect(() => {
    if (userRole && (userRole === 'admin' || userRole === 'manager')) {
      loadLogs()
    }
  }, [userRole, filters, page])

  const checkPermission = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    setUserRole(profile?.role || null)
  }

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await fetchAuditLogs({
        action: filters.action,
        clienteId: filters.clienteId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: PAGE_SIZE + 1,
      })

      setHasMore(data.length > PAGE_SIZE)
      setLogs(data.slice(0, PAGE_SIZE))
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
      toast.error('Erro ao carregar logs de auditoria')
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = ['Data', 'Usuário', 'Ação', 'Tipo', 'ID', 'Detalhes']
    const rows = logs.map(log => [
      new Date(log.created_at!).toLocaleString('pt-BR'),
      log.user_email || log.user_id,
      ACTION_LABELS[log.action]?.label || log.action,
      log.resource_type,
      log.resource_id || '-',
      JSON.stringify(log.details),
    ])

    const csv = [headers, ...rows].map(row => row.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (!userRole || (userRole !== 'admin' && userRole !== 'manager')) {
    return (
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-6">
        <div className="text-center">
          <History className="w-12 h-12 text-ink-muted mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-ink-primary mb-1">Acesso Restrito</h3>
          <p className="text-ink-muted text-sm">
            Apenas administradores e gerentes podem visualizar logs de auditoria.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-ads-500" strokeWidth={2} />
          <h3 className="font-semibold text-ink-primary">Logs de Auditoria</h3>
        </div>
        <button
          onClick={exportCSV}
          disabled={logs.length === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-hover rounded-md transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" strokeWidth={2} />
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="p-4 bg-surface-hover/30 border-b border-surface-border">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-ink-muted" strokeWidth={2} />
          <span className="text-sm text-ink-muted">Filtros</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.action || ''}
            onChange={(e) => setFilters({ ...filters, action: e.target.value as AuditAction || undefined })}
            className="px-3 py-1.5 text-sm bg-surface-base border border-surface-border rounded-md focus:outline-none focus:border-ads-500"
          >
            <option value="">Todas as ações</option>
            {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
            className="px-3 py-1.5 text-sm bg-surface-base border border-surface-border rounded-md focus:outline-none focus:border-ads-500"
            placeholder="Data início"
          />

          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
            className="px-3 py-1.5 text-sm bg-surface-base border border-surface-border rounded-md focus:outline-none focus:border-ads-500"
            placeholder="Data fim"
          />

          <button
            onClick={() => { setFilters({}); setPage(0) }}
            className="px-3 py-1.5 text-sm text-ink-muted hover:text-ink-primary transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Lista de logs */}
      <div className="divide-y divide-surface-border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-ads-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <History className="w-12 h-12 text-ink-muted mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-ink-muted">Nenhum log encontrado</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-surface-hover/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-ink-muted" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-primary">
                      <span className={cn('font-semibold', ACTION_LABELS[log.action]?.color || 'text-ink-primary')}>
                        {ACTION_LABELS[log.action]?.label || log.action}
                      </span>
                      {' '}por{' '}
                      <span className="text-ink-secondary">{log.user_email || log.user_id?.slice(0, 8)}</span>
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {log.resource_type}
                      {log.resource_id && ` · ${log.resource_id.slice(0, 8)}`}
                      {log.cliente_id && ` · Cliente: ${log.cliente_id.slice(0, 8)}`}
                    </p>
                    {Object.keys(log.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-ads-500 cursor-pointer hover:underline">
                          Ver detalhes
                        </summary>
                        <pre className="mt-2 p-2 bg-surface-hover rounded text-xs text-ink-secondary overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-ink-muted shrink-0">
                  <Calendar className="w-3 h-3" strokeWidth={2} />
                  {new Date(log.created_at!).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginação */}
      {!loading && logs.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t border-surface-border">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            Anterior
          </button>
          <span className="text-sm text-ink-muted">
            Página {page + 1}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!hasMore}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary disabled:opacity-50 transition-colors"
          >
            Próxima
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  )
}
```

### `components\dashboard\AcoesDoDia.tsx`

```tsx
'use client'

import {
  AlertTriangle,
  Clock,
  TrendingUp,
  MessageCircle,
  CheckCircle2,
  PauseCircle,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Cliente, Estagio } from '@/lib/types'

type Urgencia = 'critica' | 'atencao' | 'review'

interface AcaoItem {
  cliente:   Cliente
  estagio:   Estagio | null
  urgencia:  Urgencia
  descricao: string
  acaoLabel: string
  whatsapp?: string
}

const urgenciaConfig: Record<Urgencia, {
  label:      string
  icon:       typeof AlertTriangle
  bg:         string
  borderLeft: string
  text:       string
  badge:      string
}> = {
  critica: {
    label:      'URGENTE',
    icon:       AlertTriangle,
    bg:         'bg-status-red/5',
    borderLeft: 'bg-status-red',
    text:       'text-status-red',
    badge:      'bg-status-red/15 text-status-red',
  },
  atencao: {
    label:      'PENDENTE',
    icon:       Clock,
    bg:         'bg-status-orange/5',
    borderLeft: 'bg-ads-500',
    text:       'text-status-orange',
    badge:      'bg-status-orange/15 text-status-orange',
  },
  review: {
    label:      'REVISAR',
    icon:       TrendingUp,
    bg:         'bg-status-blue/5',
    borderLeft: 'bg-status-green',
    text:       'text-status-blue',
    badge:      'bg-status-blue/15 text-status-blue',
  },
}

interface AcoesDoDiaProps {
  items:       AcaoItem[]
  onCongelar:  (id: string) => void
  onFeito?:    (id: string) => void
}

export function AcoesDoDia({ items, onCongelar, onFeito }: AcoesDoDiaProps) {
  if (items.length === 0) return null

  // Ordenação conforme arquivo mestre
  const ordenado = [...items].sort((a, b) => {
    const peso: Record<Urgencia, number> = { critica: 3, atencao: 2, review: 1 }
    return peso[b.urgencia] - peso[a.urgencia]
  })

  return (
    <section className="mb-[2rem]">
      <div className="flex items-center justify-between mb-[0.75rem]">
        <div className="flex items-center gap-[0.5rem]">
          <AlertTriangle className="w-4 h-4 text-status-red" strokeWidth={2} />
          <h2 className="text-ink-primary font-bold text-base">
            Ações do Dia
            <span className="ml-[0.5rem] inline-flex items-center justify-center min-w-[1.25rem] h-[1.25rem] px-1 rounded-full bg-status-red/15 text-status-red text-xs font-bold">
              {items.length}
            </span>
          </h2>
        </div>
      </div>

      <div className="space-y-[0.5rem]">
        {ordenado.map(({ cliente, urgencia, descricao, acaoLabel, whatsapp }) => {
          const cfg  = urgenciaConfig[urgencia]
          const Icon = cfg.icon

          const handleWhatsApp = () => {
            const texto = `Olá ${cliente.nome.split(' ')[0]}, tudo bem? Aqui é da Adsgator. `
            window.open(`https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank')
          }

          const handleFeito = () => {
            toast.success(`Ação marcada como feita para ${cliente.nome.split(' ')[0]}`)
            onFeito?.(cliente.id)
          }

          // Determinar botão de ação principal baseado no tipo
          const getBotaoPrincipal = () => {
            if (whatsapp && urgencia === 'critica') {
              return (
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center gap-[0.375rem] h-[2rem] px-3 rounded-md bg-[#25D366]/10 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/20 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">Cobrar WhatsApp</span>
                </button>
              )
            }
            if (urgencia === 'review') {
              return (
                <a
                  href={`/analytics?cliente=${cliente.id}`}
                  className="flex items-center gap-[0.375rem] h-[2rem] px-3 rounded-md bg-surface-hover text-ink-secondary text-xs font-medium hover:bg-surface-border transition-colors"
                >
                  <BarChart3 className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">Ver Analytics</span>
                </a>
              )
            }
            return (
              <a
                href={`/clientes/${cliente.id}`}
                className="flex items-center gap-[0.375rem] h-[2rem] px-3 rounded-md bg-surface-hover text-ink-secondary text-xs font-medium hover:bg-surface-border transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">Ver checklist</span>
              </a>
            )
          }

          return (
            <div
              key={cliente.id}
              className={cn(
                'flex items-center gap-[1rem]',
                'rounded-xl dark:border dark:border-surface-border px-[1rem] py-[0.875rem]',
                'bg-surface-card card-shadow hover:shadow-md transition-all duration-200',
                'relative overflow-hidden',
              )}
            >
              {/* ── BORDA LATERAL COLORIDA ──────────────── */}
              <div className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-xl', cfg.borderLeft)} />

              {/* ── BADGE URGÊNCIA ────────────────────────── */}
              <div className={cn('shrink-0 flex items-center gap-[0.375rem] rounded-full px-2.5 h-6 text-xs font-bold tracking-wide ml-2', cfg.badge)}>
                <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                {cfg.label}
              </div>

              {/* ── INFO ──────────────────────────────────── */}
              <div className="flex-1 min-w-0">
                <p className="text-ink-primary text-sm font-semibold truncate">
                  {cliente.nome}
                  <span className="ml-2 text-ink-muted font-normal text-xs">
                    ({cliente.nicho})
                  </span>
                </p>
                <p className="text-ink-secondary text-sm mt-0.5 line-clamp-1">
                  {descricao}
                </p>
              </div>

              {/* ── AÇÕES SEMPRE VISÍVEIS ───────────────── */}
              <div className="shrink-0 flex items-center gap-2">
                {getBotaoPrincipal()}

                <button
                  onClick={() => onCongelar(cliente.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-ink-muted hover:bg-surface-hover hover:text-status-orange transition-colors"
                  title="Congelar cliente"
                >
                  <PauseCircle className="w-4 h-4" strokeWidth={2} />
                </button>

                <button
                  onClick={handleFeito}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-ink-muted hover:bg-surface-hover hover:text-status-green transition-colors"
                  title="Marcar como feito"
                >
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

### `components\dashboard\AlertaSaldoGoogle.tsx`

```tsx
﻿'use client'

import { useEffect, useState } from 'react'
import { CreditCard, AlertTriangle, TrendingDown, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface SaldoAlert {
  cliente_id: string
  cliente_nome: string
  google_ads_customer_id: string
  saldo_atual: number
  ultimo_gasto_dia: number
  dias_restantes: number
  status: 'normal' | 'alerta' | 'critico'
  atualizado_em: string
}

interface AlertaSaldoGoogleProps {
  limiteDias?: number
}

export function AlertaSaldoGoogle({ limiteDias = 7 }: AlertaSaldoGoogleProps) {
  const [alertas, setAlertas] = useState<SaldoAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [atualizando, setAtualizando] = useState(false)

  const carregarSaldos = async () => {
    try {
      // Buscar clientes com Google Ads ativado
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('id, nome, google_ads_customer_id, google_ads_enabled, saldo_google')
        .eq('google_ads_enabled', true)
        .not('google_ads_customer_id', 'is', null)

      if (error) throw error

      if (!clientes || clientes.length === 0) {
        setAlertas([])
        setLoading(false)
        return
      }

      // Buscar últimos snapshots para calcular gasto diário
      const alertasCalculados: SaldoAlert[] = await Promise.all(
        clientes.map(async (cliente) => {
          // Buscar últimos 3 snapshots para calcular média de gasto
          const { data: snapshots } = await supabase
            .from('analytics_snapshots')
            .select('investimento, created_at')
            .eq('cliente_id', cliente.id)
            .eq('fonte', 'google_ads')
            .order('created_at', { ascending: false })
            .limit(3)

          const saldoAtual = cliente.saldo_google || 0
          
          // Calcular gasto médio diário baseado nos últimos snapshots
          let gastoMedioDia = 0
          if (snapshots && snapshots.length >= 2) {
            const investimentos = snapshots.map(s => s.investimento || 0)
            const mediaInvestimento = investimentos.reduce((a, b) => a + b, 0) / investimentos.length
            // Assumindo período de 30 dias entre snapshots
            gastoMedioDia = mediaInvestimento / 30
          } else {
            // Fallback: estimativa conservadora de R$ 50/dia
            gastoMedioDia = 50
          }

          const diasRestantes = gastoMedioDia > 0 ? Math.floor(saldoAtual / gastoMedioDia) : 999
          
          let status: 'normal' | 'alerta' | 'critico' = 'normal'
          if (diasRestantes <= 3) status = 'critico'
          else if (diasRestantes <= limiteDias) status = 'alerta'

          return {
            cliente_id: cliente.id,
            cliente_nome: cliente.nome,
            google_ads_customer_id: cliente.google_ads_customer_id!,
            saldo_atual: saldoAtual,
            ultimo_gasto_dia: gastoMedioDia,
            dias_restantes: diasRestantes,
            status,
            atualizado_em: new Date().toISOString(),
          }
        })
      )

      // Filtrar apenas alertas (não mostrar normais)
      const apenasAlertas = alertasCalculados.filter(
        a => a.status === 'alerta' || a.status === 'critico'
      )

      setAlertas(apenasAlertas)
    } catch (error) {
      console.error('Erro ao carregar saldos:', error)
      toast.error('Erro ao verificar saldos Google Ads')
    } finally {
      setLoading(false)
    }
  }

  const atualizarSaldos = async () => {
    setAtualizando(true)
    await carregarSaldos()
    toast.success('Saldos atualizados!')
    setAtualizando(false)
  }

  useEffect(() => {
    carregarSaldos()
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(carregarSaldos, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [limiteDias])

  if (loading) {
    return (
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-surface-hover rounded" />
          <div className="h-4 bg-surface-hover rounded w-32" />
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-surface-hover rounded" />
        </div>
      </div>
    )
  }

  if (alertas.length === 0) {
    return (
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-status-green" strokeWidth={2} />
            <h3 className="font-semibold text-ink-primary">Saldo Google Ads</h3>
          </div>
          <button
            onClick={atualizarSaldos}
            disabled={atualizando}
            className="p-1 hover:bg-surface-hover rounded transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4 text-ink-muted", atualizando && "animate-spin")} strokeWidth={2} />
          </button>
        </div>
        <p className="text-sm text-ink-muted">Todos os saldos estão em dia ✓</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-status-red" strokeWidth={2} />
          <h3 className="font-semibold text-ink-primary">
            Alerta Saldo Google Ads
            <span className="ml-2 text-xs px-2 py-0.5 bg-status-red/10 text-status-red rounded-full">
              {alertas.length} cliente{alertas.length > 1 ? 's' : ''}
            </span>
          </h3>
        </div>
        <button
          onClick={atualizarSaldos}
          disabled={atualizando}
          className="flex items-center gap-1 px-2 py-1 text-xs text-ink-muted hover:text-ink-primary hover:bg-surface-hover rounded transition-colors"
        >
          {atualizando ? (
            <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
          ) : (
            <RefreshCw className="w-3 h-3" strokeWidth={2} />
          )}
          Atualizar
        </button>
      </div>

      <div className="divide-y divide-surface-border">
        {alertas.map((alerta) => (
          <div
            key={alerta.cliente_id}
            className={cn(
              'p-3 flex items-center justify-between',
              alerta.status === 'critico' ? 'bg-status-red/5' : 'bg-status-orange/5'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                alerta.status === 'critico' ? 'bg-status-red/10' : 'bg-status-orange/10'
              )}>
                {alerta.status === 'critico' ? (
                  <TrendingDown className="w-4 h-4 text-status-red" strokeWidth={2} />
                ) : (
                  <CreditCard className="w-4 h-4 text-status-orange" strokeWidth={2} />
                )}
              </div>
              <div>
                <p className="font-medium text-ink-primary text-sm">{alerta.cliente_nome}</p>
                <p className="text-xs text-ink-muted">
                  Customer ID: {alerta.google_ads_customer_id}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className={cn(
                'text-lg font-bold',
                alerta.status === 'critico' ? 'text-status-red' : 'text-status-orange'
              )}>
                {alerta.dias_restantes} dias
              </p>
              <p className="text-xs text-ink-muted">
                R$ {alerta.saldo_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-surface-hover/50 text-center">
        <a
          href="/clientes?filtro=saldo_baixo"
          className="text-xs text-ads-500 hover:text-ads-600 font-medium"
        >
          Ver todos os clientes →
        </a>
      </div>
    </div>
  )
}
```

### `components\dashboard\AlertasCriticos.tsx`

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, Clock, CreditCard, Zap, MessageCircle, ExternalLink, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface AlertaItem {
  id:       string
  tipo:     'inadimplente' | 'saldo' | 'alerta'
  label:    string
  detalhe:  string
  href?:    string
  urgente:  boolean
}

export function AlertasCriticos() {
  const [alertas, setAlertas] = useState<AlertaItem[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    const [{ data: clientes }, { data: alertasDb }, { data: config }] = await Promise.all([
      supabase.from('clientes').select('id, nome, dias_atraso, saldo_google').in('status', ['ativo', 'onboarding', 'setup_trafego']),
      supabase.from('alertas').select('id, tipo, mensagem, cliente_id').eq('resolvido', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('configuracoes_financeiras').select('saldo_google_ads_limite_alerta').eq('agencia_id', 'adsgator-main').single(),
    ])

    const limite = (config as { saldo_google_ads_limite_alerta?: number } | null)?.saldo_google_ads_limite_alerta ?? 50
    const itens: AlertaItem[] = []

    for (const c of (clientes ?? []) as { id: string; nome: string; dias_atraso?: number; saldo_google?: number }[]) {
      if ((c.dias_atraso ?? 0) >= 15) {
        itens.push({ id: `ina-${c.id}`, tipo: 'inadimplente', label: c.nome, detalhe: `${c.dias_atraso}d em atraso — quebra de contrato`, href: `/clientes/${c.id}`, urgente: true })
      } else if ((c.dias_atraso ?? 0) >= 7) {
        itens.push({ id: `ina7-${c.id}`, tipo: 'inadimplente', label: c.nome, detalhe: `${c.dias_atraso}d em atraso — suspensão iminente`, href: `/clientes/${c.id}`, urgente: true })
      }
      if ((c.saldo_google ?? Infinity) < limite) {
        itens.push({ id: `saldo-${c.id}`, tipo: 'saldo', label: c.nome, detalhe: `Saldo Google Ads: R$ ${(c.saldo_google ?? 0).toLocaleString('pt-BR')}`, href: `/clientes/${c.id}`, urgente: false })
      }
    }

    for (const a of (alertasDb ?? []) as { id: string; tipo: string; mensagem: string; cliente_id?: string }[]) {
      itens.push({ id: `alerta-${a.id}`, tipo: 'alerta', label: a.tipo, detalhe: a.mensagem, href: a.cliente_id ? `/clientes/${a.cliente_id}` : undefined, urgente: false })
    }

    setAlertas(itens.slice(0, 5))
    setLoading(false)
  }, [])

  useEffect(() => {
    carregar()
    const ch = supabase.channel('alertas-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alertas' }, carregar)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'clientes' }, carregar)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [carregar])

  const ICONE = {
    inadimplente: <Clock         className="w-4 h-4 shrink-0" strokeWidth={2} />,
    saldo:        <CreditCard    className="w-4 h-4 shrink-0" strokeWidth={2} />,
    alerta:       <Zap           className="w-4 h-4 shrink-0" strokeWidth={2} />,
  }

  const COR_BORDA = {
    urgente:  'border-l-status-red',
    alto:     'border-l-ads-500',
    normal:   'border-l-status-orange',
  }

  const handleCobrar = (nome: string) => {
    toast.success(`Abrindo WhatsApp para cobrar ${nome.split(' ')[0]}...`)
  }

  const handleResolver = (id: string) => {
    toast.success('Alerta marcado como resolvido')
  }

  return (
    <div className="p-[1.25rem] h-full flex flex-col">
      <div className="flex items-center gap-[0.5rem] mb-[1rem]">
        <AlertTriangle className="w-4 h-4 text-status-red" strokeWidth={2} />
        <p className="text-ink-primary font-bold text-base">Alertas Críticos</p>
        {alertas.length > 0 && (
          <span className="ml-auto text-xs font-bold bg-status-red text-white px-2 py-0.5 rounded-full">
            {alertas.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-[0.625rem]">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded bg-surface-hover animate-pulse" />)}
        </div>
      ) : alertas.length === 0 ? (
        <p className="text-ink-muted text-sm italic text-center py-[1rem]">Sem alertas no momento ✓</p>
      ) : (
        <ul className="flex flex-col gap-[0.5rem]">
          {alertas.map((a) => {
            const bordaCor = a.urgente ? COR_BORDA.urgente : a.tipo === 'saldo' ? COR_BORDA.alto : COR_BORDA.normal
            const iconeCor = a.urgente ? 'text-status-red' : a.tipo === 'saldo' ? 'text-ads-500' : 'text-status-orange'

            return (
              <li
                key={a.id}
                className={`flex items-center gap-3 p-3 rounded-lg bg-surface-hover border-l-4 ${bordaCor}`}
              >
                <span className={iconeCor}>{ICONE[a.tipo]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate text-ink-primary">{a.label}</p>
                  <p className="text-xs text-ink-secondary leading-snug">{a.detalhe}</p>
                </div>

                {/* Botões de ação direta — 1 clique */}
                <div className="flex items-center gap-1 shrink-0">
                  {a.tipo === 'inadimplente' && (
                    <button
                      onClick={() => handleCobrar(a.label)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#25D366]/10 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/20 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                      Cobrar
                    </button>
                  )}

                  {a.href && (
                    <a
                      href={a.href}
                      className="flex items-center justify-center w-7 h-7 rounded-md text-ink-muted hover:bg-surface-border hover:text-ink-primary transition-colors"
                      title="Ver cliente"
                    >
                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                    </a>
                  )}

                  <button
                    onClick={() => handleResolver(a.id)}
                    className="flex items-center justify-center w-7 h-7 rounded-md text-ink-muted hover:bg-surface-border hover:text-status-green transition-colors"
                    title="Resolver"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
```

### `components\dashboard\BentoCard.tsx`

```tsx
'use client'

import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BentoCardProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function BentoCard({ title, subtitle, actions, children, className, noPadding }: BentoCardProps) {
  return (
    <div
      className={cn(
        'group relative',
        'bg-surface-card rounded-2xl h-full flex flex-col dark:border dark:border-surface-border',
        'card-shadow card-interactive',
        'overflow-hidden',
        className,
      )}
    >
      {/* Drag handle — visível no hover */}
      <div
        className="bento-drag-handle absolute top-[0.5rem] right-[0.5rem] opacity-0 group-hover:opacity-60 cursor-grab active:cursor-grabbing z-10 p-[0.25rem] rounded-[0.25rem] hover:bg-surface-hover transition-opacity"
        title="Arrastar"
      >
        <GripVertical className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.75} />
      </div>

      {/* Header */}
      {(title || actions) && (
        <div className="flex items-start justify-between px-[1.25rem] pt-[1.125rem] pb-[0.625rem] shrink-0">
          {title && (
            <div className="min-w-0 pr-[1.5rem]">
              <h3 className="text-ink-primary font-semibold text-[0.875rem] leading-snug">{title}</h3>
              {subtitle && <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">{subtitle}</p>}
            </div>
          )}
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}

      {/* Conteúdo */}
      <div className={cn('flex-1 min-h-0', noPadding ? '' : 'px-[1.25rem] pb-[1.25rem]', !title && !actions && !noPadding && 'pt-[1.25rem]')}>
        {children}
      </div>
    </div>
  )
}
```

### `components\dashboard\ClienteProgressCard.tsx`

```tsx
'use client'

import {
  ArrowRight,
  PauseCircle,
  MessageCircle,
  Clock,
  CheckSquare,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Cliente, Estagio } from '@/lib/types'

const STATUS_CONFIG: Record<string, {
  label: string
  dot:   string
  text:  string
}> = {
  recebido:     { label: 'Recebido',     dot: 'bg-status-blue',   text: 'text-status-blue'   },
  onboarding:   { label: 'Onboarding',   dot: 'bg-ads-500',       text: 'text-ads-500'       },
  setup_trafego:{ label: 'Setup Tráfego',dot: 'bg-status-orange', text: 'text-status-orange' },
  ativo:        { label: 'Ativo',        dot: 'bg-status-green',  text: 'text-status-green'  },
  congelado:    { label: 'Congelado',    dot: 'bg-ink-muted',     text: 'text-ink-muted'     },
  cancelado:    { label: 'Cancelado',    dot: 'bg-status-red',    text: 'text-status-red'    },
}

const NICHO_EMOJI: Record<string, string> = {
  adestramento: '🐕',
  nutricao:     '🥗',
  trafego:      '📊',
  psicoterapia: '🧠',
  servicos:     '🔧',
  ecommerce:    '🛒',
}

interface ClienteProgressCardProps {
  cliente:    Cliente & { mrr?: number; dias_atraso?: number; updated_at?: string }
  estagio:    Estagio | null
  onCongelar: (id: string) => void
  isRetido?:  boolean
}

function diasDesde(data?: string): string {
  if (!data) return '—'
  const diff = Math.floor((Date.now() - new Date(data).getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'ontem'
  return `há ${diff} dias`
}

export function ClienteProgressCard({
  cliente,
  estagio,
  onCongelar,
  isRetido = false,
}: ClienteProgressCardProps) {
  const status = STATUS_CONFIG[cliente.status] ?? STATUS_CONFIG['ativo']
  const emoji  = NICHO_EMOJI[cliente.nicho?.toLowerCase() ?? ''] ?? '🏢'

  const iniciais = cliente.nome
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  const mrr = cliente.mrr ?? 0
  const diasAtraso = cliente.dias_atraso ?? 0
  const ultimaInteracao = diasDesde(cliente.updated_at)

  const handleWhatsApp = () => {
    if (!cliente.whatsapp) {
      toast.error('Cliente sem WhatsApp cadastrado')
      return
    }
    const texto = `Olá ${cliente.nome.split(' ')[0]}, tudo bem? Aqui é da Adsgator. `
    window.open(`https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank')
  }

  const handleAdiar = () => {
    toast.success(`Ação adiada para ${cliente.nome.split(' ')[0]}`)
  }

  return (
    <article
      className={cn(
        'relative flex flex-col',
        'bg-surface-card rounded-2xl dark:border dark:border-surface-border card-shadow',
        'p-[1.25rem]',
        'hover:shadow-lg hover:shadow-black/15',
        'transition-all duration-200',
        isRetido && 'opacity-70 hover:opacity-100',
      )}
    >
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-[0.75rem]">
        <div className="flex items-center gap-[0.625rem] min-w-0">
          <div className="w-[2.25rem] h-[2.25rem] rounded-full bg-ads-500/15 border border-ads-500/20 flex items-center justify-center shrink-0">
            <span className="text-ads-500 text-[0.8125rem] font-bold">{iniciais}</span>
          </div>
          <div className="min-w-0">
            <p className="text-ink-primary text-[0.875rem] font-semibold leading-tight truncate">
              {cliente.nome}
            </p>
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full bg-ads-500/10 text-ads-500 text-xs font-medium">
              {emoji} {cliente.nicho}
            </span>
          </div>
        </div>

        {/* MRR badge */}
        {mrr > 0 && (
          <span className="text-status-green text-sm font-bold whitespace-nowrap ml-2">
            R$ {mrr.toLocaleString('pt-BR')}
          </span>
        )}
      </div>

      {/* ── SUB-HEADER: Status + Atraso ───────────────────── */}
      <div className="flex items-center gap-[0.5rem] mb-[0.75rem] flex-wrap">
        <span className={cn('inline-flex items-center gap-[0.375rem] text-xs font-medium px-2 py-0.5 rounded-full bg-surface-hover', status.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
          {status.label}
        </span>
        {diasAtraso > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-status-red/10 text-status-red text-xs font-medium">
            {diasAtraso}d atraso
          </span>
        )}
      </div>

      {/* ── PRÓXIMA AÇÃO ──────────────────────────────────── */}
      <div className="flex-1 mb-[0.75rem]">
        {estagio ? (
          <div className="flex items-start gap-[0.375rem]">
            <ArrowRight className="w-4 h-4 text-ads-500 shrink-0 mt-[0.0625rem]" strokeWidth={2} />
            <p className="text-ink-secondary text-sm leading-snug">
              {estagio.acao_label ?? estagio.nome ?? 'Verificar próxima ação'}
            </p>
          </div>
        ) : (
          <p className="text-ink-muted text-sm italic">
            Sem ação definida
          </p>
        )}
        <p className="text-ink-muted text-xs mt-1">
          Última interação: {ultimaInteracao}
        </p>
      </div>

      {/* ── FOOTER — 4 BOTÕES SEMPRE VISÍVEIS ─────────────── */}
      <div className="flex items-center gap-[0.375rem] pt-[0.75rem] border-t border-surface-border">
        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-[0.375rem] h-[2rem] rounded-md bg-[#25D366]/10 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/20 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">WhatsApp</span>
        </button>

        {/* Ver cliente */}
        <a
          href={`/clientes/${cliente.id}`}
          className="flex-1 flex items-center justify-center gap-[0.375rem] h-[2rem] rounded-md bg-surface-hover text-ink-secondary text-xs font-medium hover:bg-surface-border transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Ver</span>
        </a>

        {/* Adiar ação */}
        <button
          onClick={handleAdiar}
          className="flex-1 flex items-center justify-center gap-[0.375rem] h-[2rem] rounded-md bg-surface-hover text-ink-secondary text-xs font-medium hover:bg-surface-border transition-colors"
        >
          <CheckSquare className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Adiar</span>
        </button>

        {/* Congelar/Reativar */}
        <button
          onClick={() => onCongelar(cliente.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-[0.375rem] h-[2rem] rounded-md text-xs font-medium transition-colors',
            isRetido
              ? 'bg-status-orange/10 text-status-orange hover:bg-status-orange/20'
              : 'bg-surface-hover text-ink-secondary hover:bg-surface-border'
          )}
          title={isRetido ? 'Reativar' : 'Congelar'}
        >
          {isRetido ? (
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
          ) : (
            <PauseCircle className="w-3.5 h-3.5" strokeWidth={2} />
          )}
          <span className="hidden sm:inline">{isRetido ? 'Reativar' : 'Congelar'}</span>
        </button>
      </div>
    </article>
  )
}
```

### `components\dashboard\DRESparkline.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import { supabase } from '@/lib/supabase'

interface DREData {
  mrr:         number
  custos:      number
  lucro:       number
  margem:      number
  spark:       { mes: string; lucro: number }[]
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export function DRESparkline() {
  const [dre,     setDre]     = useState<DREData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const [{ data: clientes }, { data: config }, { data: lancamentos }] = await Promise.all([
        supabase.from('clientes').select('mrr').eq('status', 'ativo'),
        supabase.from('configuracoes_financeiras').select('custos_fixos_mensais,custos_variaveis_percentual').eq('agencia_id', 'adsgator-main').single(),
        supabase.from('financeiro_lancamentos').select('valor, tipo, created_at').order('created_at', { ascending: false }).limit(120),
      ])

      const mrr    = (clientes ?? []).reduce((s, c) => s + (c.mrr ?? 0), 0)
      const fixos  = (config as { custos_fixos_mensais?: number } | null)?.custos_fixos_mensais  ?? 0
      const varPct = (config as { custos_variaveis_percentual?: number } | null)?.custos_variaveis_percentual ?? 0
      const custos = fixos + mrr * (varPct / 100)
      const lucro  = mrr - custos
      const margem = mrr > 0 ? (lucro / mrr) * 100 : 0

      // Agrupar por mês (últimos 6 meses)
      const porMes: Record<string, number> = {}
      for (const l of (lancamentos ?? []) as { valor: number; tipo: string; created_at: string }[]) {
        const mes = l.created_at.slice(0, 7)
        const sinal = l.tipo === 'receita' ? 1 : -1
        porMes[mes] = (porMes[mes] ?? 0) + sinal * l.valor
      }
      const spark = Object.entries(porMes)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([mes, lucro]) => ({ mes, lucro }))

      setDre({ mrr, custos, lucro, margem, spark })
      setLoading(false)
    }
    carregar()
  }, [])

  if (loading) {
    return <div className="p-[1.25rem] h-full animate-pulse bg-surface-hover rounded-xl" />
  }

  if (!dre) return null

  const positivo = dre.lucro >= 0
  const corLinha = positivo ? '#10B981' : '#EF4444'

  return (
    <div className="p-[1.25rem] h-full flex flex-col">
      <div className="flex items-center justify-between mb-[1rem]">
        <p className="text-ink-primary font-bold text-base">DRE Resumo</p>
      </div>

      {/* Árvore DRE com números premium */}
      <div className="flex flex-col gap-[0.5rem] mb-[1.25rem]">
        {/* MRR - destaque principal */}
        <div className="flex items-center justify-between">
          <span className="text-ink-muted text-sm">MRR</span>
          <span className="text-[2rem] font-black text-ink-primary">{fmt(dre.mrr)}</span>
        </div>

        {/* Custos */}
        <div className="flex items-center justify-between">
          <span className="text-ink-muted text-sm">Custos</span>
          <span className="text-lg font-semibold text-status-red">-{fmt(dre.custos)}</span>
        </div>

        {/* Lucro Líquido */}
        <div className="flex items-center justify-between border-t border-surface-border pt-2">
          <span className="text-ink-muted text-sm">Lucro Líquido</span>
          <span className={`text-[1.5rem] font-bold ${positivo ? 'text-status-green' : 'text-status-red'}`}>
            {fmt(dre.lucro)}
          </span>
        </div>

        {/* Margem como badge */}
        <div className="flex items-center justify-end">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${positivo ? 'bg-status-green/10 text-status-green' : 'bg-status-red/10 text-status-red'}`}>
            {positivo
              ? <TrendingUp className="w-3 h-3" strokeWidth={2} />
              : <TrendingDown className="w-3 h-3" strokeWidth={2} />
            }
            Margem {dre.margem.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Sparkline premium */}
      {dre.spark.length > 1 && (
        <div className="h-[3.5rem] mb-[1rem]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dre.spark}>
              <Line
                type="monotone"
                dataKey="lucro"
                stroke={corLinha}
                strokeWidth={2}
                dot={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--surface-elevated))',
                  border: '1px solid rgb(var(--surface-border))',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                }}
                labelStyle={{ color: 'rgb(var(--ink-secondary))', fontSize: '0.75rem', marginBottom: '0.25rem' }}
                itemStyle={{ color: 'rgb(var(--ink-primary))', fontSize: '0.8125rem' }}
                formatter={(value) => [fmt(Number(value) || 0), 'Lucro']}
                labelFormatter={(label) => `Mês: ${label}`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Link rodapé */}
      <a
        href="/financeiro"
        className="group flex items-center justify-center gap-1 text-sm text-ads-500 hover:text-ads-400 transition-colors"
      >
        Ver DRE completo
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
      </a>
    </div>
  )
}
```

### `components\dashboard\GeminiChat.tsx`

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Bot, User, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ChatMensagem } from '@/lib/types'

interface ClienteOpcao {
  id:   string
  nome: string
}

function gerarId() {
  return Math.random().toString(36).slice(2, 10)
}

export function GeminiChat() {
  const [aberto,         setAberto]         = useState(false)
  const [mensagens,      setMensagens]      = useState<ChatMensagem[]>([])
  const [input,          setInput]          = useState('')
  const [enviando,       setEnviando]       = useState(false)
  const [clientes,       setClientes]       = useState<ClienteOpcao[]>([])
  const [clienteSel,     setClienteSel]     = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('clientes').select('id, nome').in('status', ['ativo', 'onboarding']).limit(20)
      .then(({ data }) => setClientes((data ?? []) as ClienteOpcao[]))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  async function enviar() {
    const texto = input.trim()
    if (!texto || enviando) return

    const novaMensagem: ChatMensagem = {
      id: gerarId(), role: 'user', content: texto, created_at: new Date().toISOString(),
    }
    setMensagens((prev) => [...prev, novaMensagem])
    setInput('')
    setEnviando(true)

    try {
      const res  = await fetch('/api/ia/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages:              [...mensagens, novaMensagem],
          contexto_cliente_id:   clienteSel || undefined,
        }),
      })
      const json = await res.json() as { content?: string; error?: string }
      setMensagens((prev) => [
        ...prev,
        { id: gerarId(), role: 'assistant', content: json.content ?? json.error ?? 'Erro ao responder.', created_at: new Date().toISOString() },
      ])
    } catch {
      setMensagens((prev) => [
        ...prev,
        { id: gerarId(), role: 'assistant', content: 'Não foi possível conectar ao assistente.', created_at: new Date().toISOString() },
      ])
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="overflow-hidden h-full flex flex-col">
      {/* Header / toggle */}
      <button
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center justify-between px-[1.25rem] py-[0.875rem] hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-[0.5rem]">
          <Bot className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={1.75} />
          <p className="text-ink-primary font-semibold text-[0.875rem]">Assistente Adsgator</p>
          {mensagens.length > 0 && (
            <span className="text-[0.625rem] font-semibold bg-ads-500/15 text-ads-500 px-[0.375rem] py-[0.0625rem] rounded-full">
              {mensagens.length}
            </span>
          )}
        </div>
        {aberto
          ? <ChevronUp   className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.75} />
          : <ChevronDown className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.75} />
        }
      </button>

      {aberto && (
        <>
          {/* Seletor de contexto */}
          <div className="px-[1.25rem] pb-[0.75rem] border-b border-surface-border">
            <select
              value={clienteSel}
              onChange={(e) => setClienteSel(e.target.value)}
              className="w-full h-[2rem] px-[0.625rem] rounded bg-surface-hover border border-surface-border text-ink-secondary text-[0.75rem] focus:outline-none focus:ring-1 focus:ring-ads-500/40"
            >
              <option value="">Sem contexto de cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* Histórico */}
          <div className="flex flex-col gap-[0.625rem] p-[1rem] max-h-[18rem] overflow-y-auto">
            {mensagens.length === 0 && (
              <p className="text-ink-muted text-[0.8125rem] italic text-center py-[1.5rem]">
                Pergunte sobre clientes, campanhas ou operação.
              </p>
            )}
            {mensagens.map((m) => (
              <div key={m.id} className={`flex gap-[0.5rem] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-[1.5rem] h-[1.5rem] rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-ads-500/20' : 'bg-surface-hover'}`}>
                  {m.role === 'user'
                    ? <User className="w-[0.75rem] h-[0.75rem] text-ads-500" strokeWidth={2} />
                    : <Bot  className="w-[0.75rem] h-[0.75rem] text-ink-muted" strokeWidth={1.75} />
                  }
                </div>
                <div className={`rounded-xl px-[0.75rem] py-[0.5rem] max-w-[80%] text-[0.8125rem] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-ads-500/15 text-ink-primary'
                    : 'bg-surface-hover text-ink-secondary'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {enviando && (
              <div className="flex gap-[0.5rem]">
                <div className="w-[1.5rem] h-[1.5rem] rounded-full bg-surface-hover flex items-center justify-center">
                  <Bot className="w-[0.75rem] h-[0.75rem] text-ink-muted" strokeWidth={1.75} />
                </div>
                <div className="bg-surface-hover rounded-xl px-[0.75rem] py-[0.5rem]">
                  <div className="flex gap-[0.25rem] items-center h-[1rem]">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-[0.375rem] h-[0.375rem] rounded-full bg-ink-muted animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-[1rem] pb-[1rem] flex gap-[0.5rem]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && enviar()}
              placeholder="Digite sua pergunta…"
              disabled={enviando}
              className="flex-1 h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors disabled:opacity-50"
            />
            <button
              onClick={enviar}
              disabled={!input.trim() || enviando}
              className="w-[2.25rem] h-[2.25rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <Send className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
```

### `components\dashboard\KpiCard.tsx`

```tsx
'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { cn } from '@/lib/utils'

type AccentColor = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'cyan'

interface KpiCardProps {
  label:       string
  value:       string | number
  delta?:      string
  deltaDir?:   'up' | 'down' | 'neutral'
  deltaLabel?: string
  sparkData?:  number[]
  accentColor?: AccentColor
  alert?:      boolean
  alertLabel?: string
  icon?:       React.ReactNode
  href?:       string
  description?: string
}

const ACCENT: Record<AccentColor, { hex: string; glow: string; icon: string; border: string }> = {
  green:  { hex: '#22c55e', glow: 'rgba(34,197,94,0.12)',    icon: 'bg-status-green/10 text-status-green',   border: 'border-status-green/25'  },
  amber:  { hex: '#FFB100', glow: 'rgba(255,177,0,0.12)',    icon: 'bg-ads-500/10 text-ads-400',              border: 'border-ads-500/25'        },
  red:    { hex: '#ef4444', glow: 'rgba(239,68,68,0.12)',    icon: 'bg-status-red/10 text-status-red',        border: 'border-status-red/25'     },
  blue:   { hex: '#3b82f6', glow: 'rgba(59,130,246,0.12)',   icon: 'bg-status-blue/10 text-status-blue',      border: 'border-status-blue/25'    },
  purple: { hex: '#8b5cf6', glow: 'rgba(139,92,246,0.12)',   icon: 'bg-status-purple/10 text-status-purple',  border: 'border-status-purple/25'  },
  cyan:   { hex: '#06b6d4', glow: 'rgba(6,182,212,0.12)',    icon: 'bg-status-cyan/10 text-status-cyan',      border: 'border-status-cyan/25'    },
}

const GRADIENT_ID = (label: string) =>
  `kpi-grad-${label.replace(/\s+/g, '-').toLowerCase()}`

export function KpiCard({
  label,
  value,
  delta,
  deltaDir = 'neutral',
  deltaLabel,
  sparkData,
  accentColor = 'amber',
  alert = false,
  alertLabel,
  icon,
  href,
  description,
}: KpiCardProps) {
  const chartData = sparkData?.map((v, i) => ({ i, v })) ?? []
  const acc = ACCENT[accentColor]

  const DeltaIcon = { up: TrendingUp, down: TrendingDown, neutral: Minus }[deltaDir]
  const deltaColor = { up: 'text-status-green', down: 'text-status-red', neutral: 'text-ink-muted' }[deltaDir]

  const cardBase = cn(
    'card-interactive card-shadow group relative flex flex-col',
    'bg-surface-card rounded-2xl overflow-hidden',
    'p-[1.25rem]',
    alert ? 'dark:border dark:border-status-red/40 dark:hover:border-status-red/60' : 'dark:border dark:border-surface-border',
  )

  const content = (
    <>
      {/* Glow de fundo sutil */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 20% 0%, ${alert ? 'rgba(239,68,68,0.06)' : acc.glow} 0%, transparent 70%)` }}
      />

      {/* Linha accent no topo */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: alert ? '#ef4444' : acc.hex }}
      />

      {/* ── HEADER ─────────────────────────────────── */}
      <div className="flex items-start justify-between mb-[1rem]">
        <div>
          <p className="text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-[0.07em]">
            {label}
          </p>
          {description && (
            <p className="text-ink-muted text-[0.625rem] mt-[0.125rem] leading-tight">{description}</p>
          )}
        </div>
        {icon && (
          <div className={cn('w-[2rem] h-[2rem] rounded-[0.5rem] flex items-center justify-center shrink-0', acc.icon)}>
            {icon}
          </div>
        )}
      </div>

      {/* ── VALOR + SPARKLINE ─────────────────────── */}
      <div className="flex items-end justify-between gap-[0.5rem]">
        <div className="min-w-0">
          <p className="text-ink-primary text-[2.5rem] font-black leading-none tracking-tight mb-[0.375rem] truncate">
            {value}
          </p>

          {delta && (
            <div className={cn('flex items-center gap-[0.25rem] text-[0.75rem] font-medium', deltaColor)}>
              <DeltaIcon className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} />
              <span>{delta}</span>
              {deltaLabel && <span className="text-ink-muted font-normal">{deltaLabel}</span>}
            </div>
          )}

          {alert && alertLabel && (
            <p className="text-status-red text-[0.6875rem] font-semibold mt-[0.25rem] flex items-center gap-[0.25rem]">
              <span className="w-[0.375rem] h-[0.375rem] rounded-full bg-status-red animate-pulse-slow inline-block" />
              {alertLabel}
            </p>
          )}
        </div>

        {chartData.length > 1 && (
          <div className="w-[4.5rem] h-[2.25rem] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={GRADIENT_ID(label)} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={acc.hex} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={acc.hex} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={acc.hex}
                  strokeWidth={1.5}
                  fill={`url(#${GRADIENT_ID(label)})`}
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Anel de alerta */}
      {alert && (
        <div className="absolute inset-0 rounded-xl ring-1 ring-status-red/20 pointer-events-none" />
      )}
    </>
  )

  if (href) {
    return <Link href={href} className={cardBase}>{content}</Link>
  }
  return <div className={cardBase}>{content}</div>
}
```

### `components\dashboard\KpiCompactCard.tsx`

```tsx
'use client'

import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'

interface KpiCompactCardProps {
  label: string
  value: string | number
  delta?: string
  deltaDir?: 'up' | 'down'
  accentColor?: 'amber' | 'green' | 'blue' | 'red' | 'purple' | 'cyan'
  icon?: LucideIcon | React.ReactNode
  href?: string
  compact?: boolean
}

const ACCENT_MAP: Record<string, { bg: string; text: string; border: string }> = {
  amber:  { bg: '#FFC857',  text: 'text-[#FFB100]', border: 'border-[#FFB100]/30' },
  green:  { bg: '#10B981',  text: 'text-status-green', border: 'border-status-green/30' },
  blue:   { bg: '#3B82F6',  text: 'text-status-blue', border: 'border-status-blue/30' },
  red:    { bg: '#EF4444',  text: 'text-status-red', border: 'border-status-red/30' },
  purple: { bg: '#8B5CF6',  text: 'text-status-purple', border: 'border-status-purple/30' },
  cyan:   { bg: '#06B6D4',  text: 'text-status-cyan', border: 'border-status-cyan/30' },
}

export function KpiCompactCard({
  label,
  value,
  delta,
  deltaDir,
  accentColor = 'amber',
  icon,
  href,
  compact = false,
}: KpiCompactCardProps) {
  const accent = ACCENT_MAP[accentColor] || ACCENT_MAP.amber
  const isLink = !!href

  const Wrapper = isLink ? 'a' : 'div'

  return (
    <Wrapper
      href={href}
      className={`bg-surface-card border rounded-xl overflow-hidden transition-all ${
        isLink ? 'cursor-pointer hover:border-surface-border hover:shadow-lg' : ''
      } ${accent.border} border`}
    >
      <div className={`p-[1rem] ${compact ? '' : 'min-h-[8rem]'} flex flex-col justify-between`}>
        {/* Header com label e delta */}
        <div className="flex items-start justify-between mb-[0.5rem]">
          <p className="text-ink-muted text-xs font-medium uppercase tracking-wider">{label}</p>
          {delta && (
            <div className={`flex items-center gap-[0.25rem] px-[0.5rem] py-[0.25rem] rounded-full ${accent.text.replace('text-', 'bg-').replace('text-', 'bg-')}/10`}>
              {deltaDir === 'up' ? (
                <TrendingUp className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
              ) : (
                <TrendingDown className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
              )}
              <span className={`text-xs font-semibold ${accent.text}`}>{delta}</span>
            </div>
          )}
        </div>

        {/* Valor grande */}
        <div className="flex items-end justify-between gap-[1rem]">
          <p className="text-ink-primary font-black text-2xl leading-none">{value}</p>

          {/* Icon com acent color */}
          {icon && (
            <div
              className="w-[2.5rem] h-[2.5rem] rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accent.bg}15` }}
            >
              {typeof icon === 'function' ? icon({ className: 'w-[1.25rem] h-[1.25rem]', style: { color: accent.bg } }) : icon}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  )
}
```

### `components\dashboard\MorningBriefing.tsx`

```tsx
﻿'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'

interface BriefingData {
  texto:      string
  gerado_em:  string
}

const CACHE_KEY     = 'adsgator_briefing'
const CACHE_MAX_AGE = 6 * 60 * 60 * 1000
const MAX_LINHAS_PREVIEW = 5

function cacheValido(item: { gerado_em: string } | null): boolean {
  if (!item) return false
  return Date.now() - new Date(item.gerado_em).getTime() < CACHE_MAX_AGE
}

export function MorningBriefing() {
  const [briefing,  setBriefing]  = useState<BriefingData | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [modalAberto, setModalAberto] = useState(false)

  const carregar = useCallback(async (forcar = false) => {
    if (!forcar) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as BriefingData | null
        if (cacheValido(cached)) { setBriefing(cached); return }
      } catch { /* localStorage indisponível */ }
    }
    setLoading(true)
    try {
      const res  = await fetch('/api/ia/morning-briefing')
      const data = await res.json() as BriefingData
      setBriefing(data)
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)) } catch { }
      toast.success('Briefing atualizado!')
    } catch {
      toast.error('Erro ao atualizar briefing')
    }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const linhas = briefing?.texto.split('\n').filter(Boolean) ?? []
  const preview = linhas.slice(0, MAX_LINHAS_PREVIEW)
  const temMais = linhas.length > MAX_LINHAS_PREVIEW

  const formatarHora = (data: string) => {
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <div className="border-l-4 border-l-ads-500 p-[1.25rem] flex flex-col gap-[0.75rem] h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[0.5rem]">
            <Sparkles className="w-5 h-5 text-ads-500" strokeWidth={2} />
            <p className="text-ink-primary text-lg font-bold">Morning Briefing</p>
          </div>
          <button
            onClick={() => carregar(true)}
            disabled={loading}
            className="flex items-center gap-[0.375rem] px-[0.625rem] py-[0.375rem] rounded-md hover:bg-surface-hover text-ink-muted hover:text-ink-primary transition-colors disabled:opacity-40 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            <span className="hidden sm:inline">Atualizar briefing</span>
          </button>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="space-y-[0.5rem]">
            {[100, 90, 80, 70, 60].map((w, i) => (
              <div key={i} className={`h-[1rem] rounded bg-surface-hover animate-pulse`} style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : briefing ? (
          <div>
            <div className="space-y-[0.5rem]">
              {preview.map((linha, i) => (
                <p key={i} className="text-ink-secondary text-[0.9375rem] leading-relaxed">{linha}</p>
              ))}
            </div>
            {temMais && (
              <button
                onClick={() => setModalAberto(true)}
                className="mt-[0.75rem] flex items-center gap-[0.25rem] text-ads-500 text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Ver mais
              </button>
            )}
            {briefing.gerado_em && (
              <div className="mt-[0.75rem]">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-hover text-ink-muted text-xs">
                  Gerado hoje às {formatarHora(briefing.gerado_em)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-ink-muted text-[0.9375rem] italic">Clique em atualizar para gerar o briefing de hoje.</p>
        )}
      </div>

      {/* Modal para texto completo */}
      {modalAberto && briefing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.5rem] max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-[1rem]">
              <div className="flex items-center gap-[0.5rem]">
                <Sparkles className="w-5 h-5 text-ads-500" strokeWidth={2} />
                <p className="text-ink-primary text-lg font-bold">Morning Briefing</p>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="p-1 rounded hover:bg-surface-hover text-ink-muted hover:text-ink-primary transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="space-y-[0.5rem]">
              {linhas.map((linha, i) => (
                <p key={i} className="text-ink-secondary text-[0.9375rem] leading-relaxed">{linha}</p>
              ))}
            </div>
            {briefing.gerado_em && (
              <p className="text-ink-muted text-xs mt-[1rem]">
                Gerado hoje às {formatarHora(briefing.gerado_em)}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
```

### `components\dashboard\PortfolioHero.tsx`

```tsx
'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

// Mock data — últimos 12 meses de MRR
const MOCK_PORTFOLIO_DATA = [
  { mes: 'Jan', mrr: 45000, lucro: 12000 },
  { mes: 'Fev', mrr: 48000, lucro: 14500 },
  { mes: 'Mar', mrr: 52000, lucro: 16800 },
  { mes: 'Abr', mrr: 58000, lucro: 19200 },
  { mes: 'Mai', mrr: 62000, lucro: 21500 },
  { mes: 'Jun', mrr: 59000, lucro: 20100 },
  { mes: 'Jul', mrr: 65000, lucro: 23400 },
  { mes: 'Ago', mrr: 71000, lucro: 26200 },
  { mes: 'Set', mrr: 78000, lucro: 29100 },
  { mes: 'Out', mrr: 82000, lucro: 31800 },
  { mes: 'Nov', mrr: 88000, lucro: 35200 },
  { mes: 'Dez', mrr: 95000, lucro: 39500 },
]

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export function PortfolioHero() {
  const currentMRR = MOCK_PORTFOLIO_DATA[MOCK_PORTFOLIO_DATA.length - 1].mrr
  const previousMRR = MOCK_PORTFOLIO_DATA[MOCK_PORTFOLIO_DATA.length - 2].mrr
  const growth = ((currentMRR - previousMRR) / previousMRR) * 100

  const totalLucro = MOCK_PORTFOLIO_DATA.reduce((s, d) => s + d.lucro, 0)

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden card-shadow">
      {/* Header com título e badges */}
      <div className="p-[1.5rem] border-b border-surface-border/40">
        <div className="flex items-start justify-between mb-[1rem]">
          <div>
            <h2 className="text-ink-primary font-bold text-2xl mb-[0.25rem]">Portfolio Overview</h2>
            <p className="text-ink-muted text-sm">Receita e lucro dos últimos 12 meses</p>
          </div>
          <div className="flex items-center gap-[0.5rem] px-[0.75rem] py-[0.375rem] rounded-full bg-status-green/10">
            <TrendingUp className="w-[0.875rem] h-[0.875rem] text-status-green" strokeWidth={2} />
            <span className="text-status-green text-sm font-semibold">{growth.toFixed(1)}%</span>
          </div>
        </div>

        {/* Valores principais */}
        <div className="grid grid-cols-3 gap-[1rem]">
          <div>
            <p className="text-ink-muted text-xs font-medium uppercase tracking-wider mb-[0.25rem]">MRR Atual</p>
            <p className="text-ink-primary font-black text-2xl">{fmt(currentMRR)}</p>
          </div>
          <div>
            <p className="text-ink-muted text-xs font-medium uppercase tracking-wider mb-[0.25rem]">Lucro (12m)</p>
            <p className="text-ink-primary font-black text-2xl">{fmt(totalLucro)}</p>
          </div>
          <div>
            <p className="text-ink-muted text-xs font-medium uppercase tracking-wider mb-[0.25rem]">Margem Média</p>
            <p className="text-ink-primary font-black text-2xl">{((totalLucro / (MOCK_PORTFOLIO_DATA.length * 70000)) * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="p-[1.5rem] h-[18rem]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_PORTFOLIO_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFB100" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FFB100" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(206 208 222 / 0.4)" vertical={false} />
            <XAxis
              dataKey="mes"
              stroke="rgb(161 161 170)"
              style={{ fontSize: '0.75rem' }}
              tick={{ fill: 'rgb(161 161 170)' }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(249 249 253)',
                border: '1px solid rgb(206 208 222 / 0.4)',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
              labelFormatter={(label: unknown) => `Mês: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="mrr"
              stroke="#FFB100"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMrr)"
              name="MRR"
            />
            <Area
              type="monotone"
              dataKey="lucro"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLucro)"
              name="Lucro"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer com ação */}
      <div className="px-[1.5rem] py-[1rem] border-t border-surface-border/40 flex items-center justify-between">
        <p className="text-ink-muted text-xs">Atualizado em tempo real</p>
        <button className="text-ads-500 text-xs font-semibold hover:text-ads-600 transition-colors">
          Ver detalhes →
        </button>
      </div>
    </div>
  )
}
```

### `components\dashboard\QuickExchange.tsx`

```tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ArrowRightLeft } from 'lucide-react'

// Mock data — próximos pagamentos (mock)
const MOCK_UPCOMING = [
  { id: 1, cliente: 'Tech Startup A', vencimento: '2025-06-05', dias: 12, valor: 15000 },
  { id: 2, cliente: 'E-commerce B', vencimento: '2025-06-10', dias: 17, valor: 12300 },
  { id: 3, cliente: 'SaaS C', vencimento: '2025-06-08', dias: 15, valor: 9850 },
]

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export function QuickExchange() {
  const [fromCurrency, setFromCurrency] = useState('BRL')
  const [toCurrency, setToCurrency] = useState('USD')

  const totalRecebivelBRL = MOCK_UPCOMING.reduce((s, p) => s + p.valor, 0)
  const exchangeRate = 5.25 // Mock
  const totalRecebivelUSD = totalRecebivelBRL / exchangeRate

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl card-shadow overflow-hidden">
      {/* Header */}
      <div className="p-[1.25rem] border-b border-surface-border/40">
        <h3 className="text-ink-primary font-bold text-base">Quick Exchange</h3>
        <p className="text-ink-muted text-xs mt-[0.25rem]">Próximos pagamentos</p>
      </div>

      {/* Body */}
      <div className="p-[1.25rem] space-y-[1rem]">
        {/* Valores e conversão */}
        <div className="space-y-[0.75rem]">
          <div>
            <p className="text-ink-muted text-xs font-medium uppercase tracking-wider mb-[0.375rem]">Total a Receber</p>
            <div className="flex items-baseline gap-[0.5rem]">
              <p className="text-ink-primary font-black text-2xl">{fmt(totalRecebivelBRL)}</p>
              <span className="text-ink-muted text-xs">BRL</span>
            </div>
          </div>

          {/* Conversão */}
          <div className="flex items-center gap-[0.75rem] py-[0.75rem] px-[1rem] rounded-lg bg-surface-hover/50 border border-surface-border/40">
            <div className="flex-1">
              <p className="text-ink-muted text-xs mb-[0.25rem]">BRL → USD</p>
              <p className="text-ink-primary font-semibold">{totalRecebivelUSD.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} USD</p>
            </div>
            <ArrowRightLeft className="w-[1rem] h-[1rem] text-ink-muted shrink-0" strokeWidth={1.5} />
          </div>

          {/* Rate */}
          <p className="text-ink-muted text-xs">Taxa: 1 BRL = {exchangeRate} USD</p>
        </div>

        {/* Separator */}
        <div className="h-px bg-surface-border/40" />

        {/* Próximos pagamentos */}
        <div>
          <p className="text-ink-primary text-xs font-semibold uppercase tracking-wider mb-[0.625rem]">Vencimentos</p>
          <div className="space-y-[0.5rem]">
            {MOCK_UPCOMING.map((pagto) => (
              <div key={pagto.id} className="flex items-center justify-between p-[0.625rem] rounded-lg hover:bg-surface-hover/50 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="text-ink-primary text-xs font-medium truncate">{pagto.cliente}</p>
                  <p className="text-ink-muted text-[0.7rem] mt-[0.125rem]">em {pagto.dias} dias</p>
                </div>
                <p className="text-ink-primary text-xs font-bold shrink-0 ml-[0.5rem]">{fmt(pagto.valor)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-[1.25rem] py-[0.75rem] border-t border-surface-border/40 bg-surface-hover/30">
        <button className="text-ads-500 text-xs font-semibold hover:text-ads-600 transition-colors">
          Ver calendário de pagamentos →
        </button>
      </div>
    </div>
  )
}
```

### `components\dashboard\RecentTransactions.tsx`

```tsx
'use client'

import { ArrowUpRight, ArrowDownLeft, Clock, User, DollarSign } from 'lucide-react'

// Mock data — transações recentes
const MOCK_TRANSACTIONS = [
  { id: 1, cliente: 'Tech Startup A', tipo: 'receita', valor: 15000, data: '2 horas atrás', icon: 'receita' },
  { id: 2, cliente: 'Pagamento Asaas', tipo: 'despesa', valor: 2500, data: '5 horas atrás', icon: 'despesa' },
  { id: 3, cliente: 'E-commerce B', tipo: 'receita', valor: 12300, data: '1 dia atrás', icon: 'receita' },
  { id: 4, cliente: 'Infraestrutura', tipo: 'despesa', valor: 800, data: '2 dias atrás', icon: 'despesa' },
  { id: 5, cliente: 'SaaS C', tipo: 'receita', valor: 9850, data: '3 dias atrás', icon: 'receita' },
  { id: 6, cliente: 'Google Ads', tipo: 'despesa', valor: 3200, data: '4 dias atrás', icon: 'despesa' },
]

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export function RecentTransactions() {
  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl card-shadow overflow-hidden">
      {/* Header */}
      <div className="p-[1.25rem] border-b border-surface-border/40">
        <h3 className="text-ink-primary font-bold text-base">Recent Transaction</h3>
        <p className="text-ink-muted text-xs mt-[0.25rem]">Últimas movimentações</p>
      </div>

      {/* Lista */}
      <div className="divide-y divide-surface-border/40 max-h-[20rem] overflow-y-auto">
        {MOCK_TRANSACTIONS.map((tx) => {
          const isReceita = tx.tipo === 'receita'
          const color = isReceita ? 'text-status-green' : 'text-status-red'
          const bgColor = isReceita ? 'bg-status-green/10' : 'bg-status-red/10'
          const borderColor = isReceita ? 'border-status-green/30' : 'border-status-red/30'

          return (
            <div key={tx.id} className="p-[1rem] flex items-center justify-between hover:bg-surface-hover/50 transition-colors">
              {/* Ícone + Info */}
              <div className="flex items-center gap-[0.75rem] flex-1 min-w-0">
                <div className={`w-[2.5rem] h-[2.5rem] rounded-lg flex items-center justify-center shrink-0 ${bgColor} border ${borderColor}`}>
                  {isReceita ? (
                    <ArrowDownLeft className={`w-[1.25rem] h-[1.25rem] ${color}`} strokeWidth={2} />
                  ) : (
                    <ArrowUpRight className={`w-[1.25rem] h-[1.25rem] ${color}`} strokeWidth={2} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-ink-primary text-sm font-semibold truncate">{tx.cliente}</p>
                  <p className="text-ink-muted text-xs flex items-center gap-[0.375rem] mt-[0.125rem]">
                    <Clock className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
                    {tx.data}
                  </p>
                </div>
              </div>

              {/* Valor */}
              <div className="text-right shrink-0 ml-[0.5rem]">
                <p className={`text-sm font-bold ${color}`}>{isReceita ? '+' : '-'}{fmt(tx.valor)}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-[1.25rem] py-[0.75rem] border-t border-surface-border/40 bg-surface-hover/30">
        <button className="text-ads-500 text-xs font-semibold hover:text-ads-600 transition-colors">
          Ver histórico completo →
        </button>
      </div>
    </div>
  )
}
```

### `components\dashboard\TrendingOnMarket.tsx`

```tsx
'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

// Mock data — "trending" clientes por MRR
const MOCK_TRENDING = [
  { nome: 'Tech Startup A', mrr: 15000, change: 12.5, status: 'up' },
  { nome: 'E-commerce B', mrr: 12300, change: 8.3, status: 'up' },
  { nome: 'SaaS C', mrr: 9850, change: -2.1, status: 'down' },
  { nome: 'Agência D', mrr: 8500, change: 5.7, status: 'up' },
  { nome: 'Retail E', mrr: 7200, change: -3.4, status: 'down' },
]

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export function TrendingOnMarket() {
  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl card-shadow overflow-hidden">
      {/* Header */}
      <div className="p-[1.25rem] border-b border-surface-border/40">
        <h3 className="text-ink-primary font-bold text-base">Trending on Market</h3>
        <p className="text-ink-muted text-xs mt-[0.25rem]">Top clientes por crescimento</p>
      </div>

      {/* Lista */}
      <div className="divide-y divide-surface-border/40">
        {MOCK_TRENDING.map((item, idx) => {
          const isPositive = item.status === 'up'
          const color = isPositive ? 'text-status-green' : 'text-status-red'
          const bgColor = isPositive ? 'bg-status-green/10' : 'bg-status-red/10'

          return (
            <div key={idx} className="p-[1rem] flex items-center justify-between hover:bg-surface-hover/50 transition-colors cursor-pointer group">
              <div className="flex-1 min-w-0">
                <p className="text-ink-primary text-sm font-semibold truncate group-hover:text-ads-500 transition-colors">{item.nome}</p>
                <p className="text-ink-muted text-xs mt-[0.125rem]">MRR: {fmt(item.mrr)}</p>
              </div>

              {/* % Change */}
              <div className={`flex items-center gap-[0.375rem] px-[0.625rem] py-[0.375rem] rounded-lg ${bgColor} shrink-0 ml-[1rem]`}>
                {isPositive ? (
                  <TrendingUp className={`w-[0.875rem] h-[0.875rem] ${color}`} strokeWidth={2} />
                ) : (
                  <TrendingDown className={`w-[0.875rem] h-[0.875rem] ${color}`} strokeWidth={2} />
                )}
                <span className={`text-xs font-bold ${color}`}>{isPositive ? '+' : ''}{item.change}%</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-[1.25rem] py-[0.75rem] border-t border-surface-border/40 bg-surface-hover/30">
        <button className="text-ads-500 text-xs font-semibold hover:text-ads-600 transition-colors">
          Ver todos os clientes →
        </button>
      </div>
    </div>
  )
}
```

### `components\dashboard\WeatherClock.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Thermometer, CloudRain, Circle } from 'lucide-react'

interface WeatherData {
  temp:    number | null
  chuva:   number | null
  chuva2h: number | null
}

interface StatusAPI {
  label:  string
  status: 'ok' | 'warn' | 'error'
}

const API_STATUS: StatusAPI[] = [
  { label: 'Supabase',   status: 'ok'   },
  { label: 'Google Ads', status: 'ok'   },
  { label: 'Asaas',      status: 'warn' },
]

const STATUS_COLOR = {
  ok:    'text-status-green',
  warn:  'text-status-orange',
  error: 'text-status-red',
} as const

export function WeatherClock() {
  const [hora,    setHora]    = useState('')
  const [data,    setData]    = useState('')
  const [weather, setWeather] = useState<WeatherData>({ temp: null, chuva: null, chuva2h: null })

  useEffect(() => {
    function tick() {
      const now = new Date()
      setHora(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
      setData(now.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }))
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetch('/api/weather')
      .then((r) => r.json() as Promise<WeatherData>)
      .then(setWeather)
      .catch(() => {})
  }, [])

  return (
    <div className="p-[1.25rem] flex flex-col gap-[0.75rem] h-full">
      {/* Relógio */}
      <div>
        <p className="text-ink-primary text-[3.5rem] font-black tabular-nums leading-none tracking-tight">{hora}</p>
        <p className="text-ink-secondary text-sm capitalize mt-[0.25rem]">{data}</p>
      </div>

      {/* Separador */}
      <div className="h-px bg-surface-border my-[0.25rem]" />

      {/* Clima */}
      {weather.temp !== null && (
        <div className="flex items-center gap-[1rem]">
          <div className="flex items-center gap-[0.5rem]">
            <Thermometer className="w-5 h-5 text-status-orange" strokeWidth={1.75} />
            <span className="text-ink-primary text-lg font-semibold">{weather.temp}°C</span>
          </div>
          {weather.chuva2h !== null && weather.chuva2h > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-status-blue/10 text-status-blue text-xs font-medium">
              <CloudRain className="w-3 h-3 mr-1" strokeWidth={1.75} />
              {weather.chuva2h}% chuva
            </span>
          )}
        </div>
      )}

      {/* Status das APIs */}
      <div>
        <p className="text-ink-muted text-[0.625rem] uppercase tracking-wide font-semibold mb-[0.5rem]">Status APIs</p>
        <div className="grid grid-cols-3 gap-2">
          {API_STATUS.map(({ label, status }) => (
            <div key={label} className="flex items-center gap-[0.375rem]" title={label}>
              <Circle
                className={`w-2 h-2 fill-current ${STATUS_COLOR[status]}`}
                strokeWidth={0}
              />
              <span className="text-ink-secondary text-[0.6875rem] truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### `components\layout\MainLayout.tsx`

```tsx
'use client'

import React from 'react'
import { Sidebar }         from './Sidebar'
import { TopBar }          from './TopBar'
import { RightSidebar }    from './RightSidebar'
import { StatusBar }       from './StatusBar'
import { RightSidebarProvider } from '@/lib/store/right-sidebar-context'

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function MainLayout({ children, title, subtitle, actions }: MainLayoutProps) {
  return (
    <RightSidebarProvider>
      <div className="h-screen w-screen overflow-hidden bg-surface-base grid grid-rows-[var(--topbar-h)_1fr_var(--statusbar-h)] grid-cols-[var(--sidebar-w)_1fr_var(--right-sidebar-w)]">
        {/* ── ROW 1: TOP BAR (ocupa 3 colunas) ──────── */}
        <div className="col-span-3 z-50">
          <TopBar title={title} subtitle={subtitle} actions={actions} />
        </div>

        {/* ── ROW 2 COL 1: SIDEBAR ESQUERDA ──────────── */}
        <Sidebar />

        {/* ── ROW 2 COL 2: ÁREA DE CONTEÚDO ──────────── */}
        <main className="overflow-y-auto overflow-x-hidden p-[2rem]">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>

        {/* ── ROW 2 COL 3: SIDEBAR DIREITA ───────────── */}
        <RightSidebar />

        {/* ── ROW 3: STATUS BAR (ocupa 3 colunas) ──── */}
        <StatusBar />
      </div>
    </RightSidebarProvider>
  )
}
```

### `components\layout\NotificationBell.tsx`

```tsx
﻿'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, X, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Notificacao } from '@/lib/types'

export function NotificationBell() {
  const supabase    = createClient()
  const ref         = useRef<HTMLDivElement>(null)
  const [notifs,  setNotifs]  = useState<Notificacao[]>([])
  const [aberto,  setAberto]  = useState(false)

  const naoLidas = notifs.filter((n) => !n.lida).length

  useEffect(() => {
    supabase
      .from('notificacoes')
      .select('*')
      .eq('lida', false)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setNotifs((data ?? []) as Notificacao[]))

    const channel = supabase
      .channel('notifs-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificacoes' }, () => {
        supabase
          .from('notificacoes')
          .select('*')
          .eq('lida', false)
          .order('created_at', { ascending: false })
          .limit(20)
          .then(({ data }) => setNotifs((data ?? []) as Notificacao[]))
      })
      .subscribe()

    function handleClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', handleClickFora)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('mousedown', handleClickFora)
    }
  }, [])

  async function marcarLida(id: string) {
    await supabase
      .from('notificacoes')
      .update({ lida: true, lida_em: new Date().toISOString() })
      .eq('id', id)
    setNotifs((prev) => prev.filter((n) => n.id !== id))
  }

  const TIPO_CORES: Record<string, string> = {
    urgente: 'text-status-red   bg-status-red/10',
    atencao: 'text-status-orange bg-status-orange/10',
    info:    'text-status-blue  bg-status-blue/10',
    sucesso: 'text-status-green bg-status-green/10',
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        className="relative w-[2rem] h-[2rem] rounded-[0.375rem] flex items-center justify-center text-ink-secondary hover:bg-surface-hover hover:text-ink-primary transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-[1rem] h-[1rem]" strokeWidth={1.75} />
        {naoLidas > 0 && (
          <span className="absolute top-[0.25rem] right-[0.25rem] min-w-[0.9375rem] h-[0.9375rem] rounded-full bg-status-red flex items-center justify-center text-[0.5625rem] font-bold text-white px-[0.1875rem]">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-[2.5rem] w-[22rem] bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow shadow-2xl shadow-black/40 z-50 overflow-hidden animate-fade-in">
          <div className="px-[1rem] py-[0.75rem] border-b border-surface-border flex items-center justify-between">
            <p className="text-ink-primary font-semibold text-[0.875rem]">Notificações</p>
            {naoLidas > 0 && (
              <button
                onClick={async () => {
                  await supabase.from('notificacoes').update({ lida: true }).eq('lida', false)
                  setNotifs([])
                }}
                className="text-ink-muted text-[0.75rem] hover:text-ink-secondary"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-[2.5rem] text-ink-muted">
                <Bell className="w-[2rem] h-[2rem] mb-[0.5rem]" strokeWidth={1} />
                <p className="text-[0.875rem]">Tudo em dia!</p>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  className={`px-[1rem] py-[0.875rem] border-b border-surface-border hover:bg-surface-hover transition-colors ${TIPO_CORES[n.tipo]?.split(' ')[1] ?? ''}`}
                >
                  <div className="flex items-start justify-between gap-[0.5rem]">
                    <div className="flex-1">
                      <p className={`text-[0.8125rem] font-semibold mb-[0.125rem] ${TIPO_CORES[n.tipo]?.split(' ')[0] ?? 'text-ink-primary'}`}>
                        {n.titulo}
                      </p>
                      {n.mensagem && (
                        <p className="text-ink-secondary text-[0.8125rem] leading-snug">{n.mensagem}</p>
                      )}
                      {n.acao_url && n.acao_label && (
                        <a
                          href={n.acao_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-[0.25rem] text-ads-500 text-[0.75rem] mt-[0.375rem] hover:underline"
                        >
                          {n.acao_label} <ExternalLink className="w-[0.625rem] h-[0.625rem]" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => marcarLida(n.id)}
                      className="text-ink-muted hover:text-ink-primary shrink-0"
                    >
                      <X className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                    </button>
                  </div>
                  <p className="text-ink-muted text-[0.6875rem] mt-[0.375rem]">
                    {new Date(n.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

### `components\layout\NotificationDrawer.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { X, MessageCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface ClienteAlerta {
  id: string
  nome: string
  dias_atraso: number
  whatsapp: string | null
}

interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const [clientes, setClientes] = useState<ClienteAlerta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    supabase
      .from('clientes')
      .select('id, nome, dias_atraso, whatsapp')
      .gt('dias_atraso', 0)
      .order('dias_atraso', { ascending: false })
      .then(({ data }) => {
        setClientes((data ?? []) as ClienteAlerta[])
        setLoading(false)
      })
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'panel-slide-in fixed right-[var(--right-sidebar-w)] top-0 bottom-0 z-60',
          'w-[20rem] flex flex-col',
          'bg-surface-card border-l border-surface-border',
          'shadow-2xl shadow-black/50',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[1.25rem] py-[1rem] border-b border-surface-border shrink-0">
          <div className="flex items-center gap-[0.5rem]">
            <AlertTriangle className="w-[1rem] h-[1rem] text-status-red" strokeWidth={2} />
            <h2 className="text-ink-primary font-semibold text-[0.9375rem]">Alertas</h2>
            {clientes.length > 0 && (
              <span className="min-w-[1.25rem] h-[1.25rem] px-[0.25rem] rounded-full bg-status-red text-white text-[0.6875rem] font-bold flex items-center justify-center">
                {clientes.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
          >
            <X className="w-[1rem] h-[1rem]" strokeWidth={1.75} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-[0.75rem] space-y-[0.375rem]">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[4rem] rounded-[0.5rem] skeleton-shimmer" />
            ))
          ) : clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[4rem] text-ink-muted gap-[0.75rem]">
              <CheckCircle className="w-[2.5rem] h-[2.5rem] text-status-green" strokeWidth={1.5} />
              <p className="text-[0.875rem] font-medium text-ink-secondary">Sem alertas no momento</p>
              <p className="text-[0.75rem] text-center">Todos os clientes estão em dia</p>
            </div>
          ) : (
            clientes.map((c) => {
              const urgencia = c.dias_atraso >= 15 ? 'critica' : c.dias_atraso >= 7 ? 'atencao' : 'leve'
              const corBadge =
                urgencia === 'critica' ? 'bg-status-red/10 text-status-red border-status-red/20' :
                urgencia === 'atencao' ? 'bg-status-orange/10 text-status-orange border-status-orange/20' :
                'bg-status-green/10 text-status-green border-status-green/20'

              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-[0.75rem] rounded-[0.5rem] bg-surface-hover border border-surface-border/50 hover:border-surface-border transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-ink-primary text-[0.8125rem] font-medium truncate">{c.nome}</p>
                    <span className={cn('inline-flex items-center gap-[0.25rem] text-[0.6875rem] font-medium px-[0.375rem] py-[0.125rem] rounded-full border mt-[0.25rem]', corBadge)}>
                      D+{c.dias_atraso}
                    </span>
                  </div>
                  {c.whatsapp && (
                    <a
                      href={`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(`Olá ${c.nome.split(' ')[0]}! Passando para verificar sobre o pagamento em atraso (${c.dias_atraso} dias).`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-[0.5rem] w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] bg-status-green/10 text-status-green hover:bg-status-green/20 transition-colors shrink-0"
                      title="Enviar WhatsApp"
                    >
                      <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                    </a>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-[0.75rem] border-t border-surface-border">
          <a
            href="/clientes"
            className="flex items-center justify-center w-full h-[2rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] hover:text-ink-primary hover:border-ads-500/30 transition-colors"
          >
            Ver todos os clientes
          </a>
        </div>
      </aside>
    </>
  )
}
```

### `components\layout\RightSidebar.tsx`

```tsx
'use client'

import { useState } from 'react'
import { Bell, MessageCircle, HelpCircle, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'
import { useRightSidebar } from '@/lib/store/right-sidebar-context'
import { NotificationDrawer } from './NotificationDrawer'
import { cn } from '@/lib/utils'

interface SidebarIconButtonProps {
  icon: React.ElementType
  label: string
  active?: boolean
  badge?: number
  onClick: () => void
}

function SidebarIconButton({ icon: Icon, label, active, badge, onClick }: SidebarIconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'relative w-[2.25rem] h-[2.25rem] rounded-[0.375rem] flex items-center justify-center',
        'transition-colors duration-150',
        active
          ? 'bg-ads-500/10 text-ads-500'
          : 'text-ink-muted hover:text-ink-secondary hover:bg-surface-hover',
      )}
    >
      <Icon className="w-[1.125rem] h-[1.125rem]" strokeWidth={1.75} />
      {badge != null && badge > 0 && (
        <span className="absolute top-[0.125rem] right-[0.125rem] min-w-[0.875rem] h-[0.875rem] rounded-full bg-status-red flex items-center justify-center text-[0.5rem] font-bold text-white px-[0.125rem]">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}

export function RightSidebar() {
  const { theme, setTheme } = useTheme()
  const { contextActions, activeDrawer, openDrawer } = useRightSidebar()
  const [notifOpen, setNotifOpen] = useState(false)

  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const ThemeIcon = theme === 'dark' ? Sun : Moon

  return (
    <>
    <aside
      className={cn(
        'rightsidebar-shell w-[var(--right-sidebar-w)] h-full',
        'flex flex-col items-center',
        'bg-surface-card border-l border-surface-border',
        'py-[0.75rem]',
      )}
    >
      {/* ── ÍCONES FIXOS (topo) ──────────────────────── */}
      <div className="flex flex-col items-center gap-[0.25rem]">
        <SidebarIconButton
          icon={Bell}
          label="Notificações"
          active={notifOpen || activeDrawer === 'notifications'}
          onClick={() => setNotifOpen((v) => !v)}
        />
        <SidebarIconButton
          icon={MessageCircle}
          label="Chat de Ajuda"
          active={activeDrawer === 'chat'}
          onClick={() => openDrawer('chat')}
        />
        <SidebarIconButton
          icon={HelpCircle}
          label="Ajuda"
          onClick={() => window.open('/ajuda', '_self')}
        />
      </div>

      {/* ── ÍCONES CONTEXTUAIS (injetados por página) ── */}
      {contextActions.length > 0 && (
        <>
          <div className="w-[1.5rem] h-[1px] bg-surface-border my-[0.5rem]" />
          <div className="flex flex-col items-center gap-[0.25rem]">
            {contextActions.map((action) => (
              <SidebarIconButton
                key={action.id}
                icon={action.icon}
                label={action.label}
                onClick={action.onClick}
              />
            ))}
          </div>
        </>
      )}

      {/* ── SPACER ───────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── TEMA (rodapé) ────────────────────────────── */}
      <SidebarIconButton
        icon={ThemeIcon}
        label={nextTheme === 'light' ? 'Tema Claro' : 'Tema Escuro'}
        onClick={() => setTheme(nextTheme)}
      />
    </aside>
    <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  )
}
```

### `components\layout\Sidebar.tsx`

```tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BarChart2,
  DollarSign,
  FileText,
  Layers,
  Settings,
  HelpCircle,
  LogOut,
  CheckSquare,
  Megaphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
  {
    group: 'MENU',
    items: [
      { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
      { href: '/clientes',     icon: Users,           label: 'Clientes'     },
      { href: '/tarefas',      icon: CheckSquare,     label: 'Tarefas'      },
      { href: '/marketing',    icon: Megaphone,       label: 'Marketing'    },
      { href: '/analytics',    icon: BarChart2,       label: 'Analytics'    },
      { href: '/financeiro',   icon: DollarSign,      label: 'Financeiro'   },
      { href: '/relatorios',   icon: FileText,        label: 'Relatórios'   },
      { href: '/biblioteca',   icon: Layers,          label: 'Biblioteca'   },
    ],
  },
  {
    group: 'GERAL',
    items: [
      { href: '/configuracoes', icon: Settings,   label: 'Configurações' },
      { href: '/ajuda',         icon: HelpCircle, label: 'Ajuda'         },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [badgeCount, setBadgeCount] = useState(0)

  useEffect(() => {
    const fetchBadges = async () => {
      const hoje = new Date().toISOString().slice(0, 10)
      
      const { count: tarefasCount } = await supabase
        .from('tarefas')
        .select('id', { count: 'exact', head: true })
        .lte('data_prazo', hoje + 'T23:59:59')
        .neq('status', 'feito')
      
      const { count: alertasCount } = await supabase
        .from('clientes')
        .select('id', { count: 'exact', head: true })
        .gt('dias_atraso', 0)
      
      setBadgeCount((tarefasCount ?? 0) + (alertasCount ?? 0))
    }
    
    fetchBadges()
  }, [pathname])

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <div className="relative w-[var(--sidebar-w)] h-full">
      <aside
        className={cn(
          'sidebar-shell group/sidebar absolute inset-y-0 left-0 z-40',
          'flex flex-col',
          'bg-surface-card dark:border-r dark:border-surface-border',
          'shadow-[1px_0_0_0_rgba(0,0,0,0.08)]',
          'w-[var(--sidebar-w)] hover:w-[var(--sidebar-expanded)]',
          'hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/40',
          'transition-all duration-300',
          'overflow-hidden',
          '[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
        )}
      >
        {/* ── NAVEGAÇÃO ───────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-[0.75rem] px-[0.5rem] space-y-[1.5rem]">
          {NAV_ITEMS.map((group) => (
            <div key={group.group}>
              <p className="text-ink-muted text-[0.625rem] font-semibold uppercase tracking-[0.08em] px-[0.5rem] max-h-0 mb-0 opacity-0 group-hover/sidebar:max-h-[1.5rem] group-hover/sidebar:mb-[0.375rem] group-hover/sidebar:opacity-100 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out">
                {group.group}
              </p>
              <ul className="space-y-[0.125rem]">
                {group.items.map(({ href, icon: Icon, label }) => {
                  const isActive = pathname === href || pathname.startsWith(href + '/')
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          'flex items-center gap-[0.625rem]',
                          'h-[2.25rem] px-[0.625rem] rounded-[0.375rem]',
                          'text-[0.875rem] font-medium',
                          'transition-colors duration-200',
                          isActive
                            ? 'border-l-[3px] border-ads-500 bg-ads-500/10 text-ads-500 rounded-l-none'
                            : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary',
                        )}
                      >
                        <div className="relative shrink-0">
                          <Icon
                            className={cn(
                              'w-[1.25rem] h-[1.25rem]',
                              isActive ? 'text-ads-500' : 'text-ink-muted',
                            )}
                            strokeWidth={isActive ? 2.25 : 1.75}
                            style={isActive ? { filter: 'drop-shadow(0 0 0.375rem rgba(255,177,0,0.4))' } : undefined}
                          />
                          {href === '/tarefas' && badgeCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[0.875rem] h-[0.875rem] px-[0.125rem] rounded-full bg-status-red text-white text-[0.5rem] font-bold flex items-center justify-center">
                              {badgeCount > 9 ? '9' : badgeCount}
                            </span>
                          )}
                        </div>
                        <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto whitespace-nowrap overflow-hidden transition-all duration-200">
                          {label}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── RODAPÉ — USUÁRIO ───────────────────────── */}
        <div className="shrink-0 border-t border-surface-border p-[0.5rem]">
          <div className="flex items-center gap-[0.625rem] p-[0.5rem] rounded-[0.375rem] hover:bg-surface-hover transition-colors cursor-pointer group/user">
            <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-ads-500/20 border border-ads-500/30 flex items-center justify-center shrink-0">
              <span className="text-ads-500 text-[0.75rem] font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0 opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto whitespace-nowrap overflow-hidden transition-all duration-200">
              <p className="text-ink-primary text-[0.8125rem] font-medium truncate">Admin</p>
              <p className="text-ink-muted text-[0.6875rem] truncate">Adsgator</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto whitespace-nowrap overflow-hidden transition-all duration-200"
            >
              <LogOut
                className="w-[0.875rem] h-[0.875rem] text-ink-muted hover:text-ink-primary transition-colors"
                strokeWidth={1.75}
              />
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
```

### `components\layout\StatusBar.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { User, Users, DollarSign, AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface StatusMetrics {
  userName: string
  mrr: number
  clientesAtivos: number
  alertas: number
  online: boolean
}

export function StatusBar() {
  const [metrics, setMetrics] = useState<StatusMetrics>({
    userName: '',
    mrr: 0,
    clientesAtivos: 0,
    alertas: 0,
    online: true,
  })

  useEffect(() => {
    async function fetchAll() {
      const [userRes, clientesRes, alertasRes, mrrRes] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('clientes')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'ativo'),
        supabase
          .from('clientes')
          .select('id', { count: 'exact', head: true })
          .gt('dias_atraso', 0),
        supabase
          .from('assinaturas')
          .select('valor_mensal')
          .eq('status', 'ativa'),
      ])

      const nome =
        userRes.data.user?.user_metadata?.nome ??
        userRes.data.user?.email?.split('@')[0] ??
        'Admin'

      const mrrTotal = (mrrRes.data ?? []).reduce(
        (sum, a) => sum + (a.valor_mensal ?? 0),
        0,
      )

      setMetrics({
        userName: nome,
        mrr: mrrTotal,
        clientesAtivos: clientesRes.count ?? 0,
        alertas: alertasRes.count ?? 0,
        online: true,
      })
    }

    fetchAll()

    function handleOnline() { setMetrics((m) => ({ ...m, online: true })) }
    function handleOffline() { setMetrics((m) => ({ ...m, online: false })) }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const fmtMrr = metrics.mrr.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  })

  return (
    <footer className="col-span-3 h-[var(--statusbar-h)] bg-surface-card border-t border-surface-border flex items-center px-[1rem] gap-[0.75rem] text-[0.6875rem] select-none z-30">
      {/* ── ESQUERDA: Usuário ─────────────────────── */}
      <div className="flex items-center gap-[0.375rem] text-ink-secondary">
        <User className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
        <span>{metrics.userName}</span>
      </div>

      <div className="w-[1px] h-[0.75rem] bg-surface-border" />

      {/* ── CENTRO: Métricas ──────────────────────── */}
      <div className="flex-1 flex items-center justify-center gap-[1.25rem]">
        <div className="flex items-center gap-[0.375rem] text-ink-secondary">
          <DollarSign className="w-[0.75rem] h-[0.75rem] text-status-green" strokeWidth={1.75} />
          <span>MRR <strong className="text-ink-primary">{fmtMrr}</strong></span>
        </div>

        <div className="flex items-center gap-[0.375rem] text-ink-secondary">
          <Users className="w-[0.75rem] h-[0.75rem] text-status-blue" strokeWidth={1.75} />
          <span><strong className="text-ink-primary">{metrics.clientesAtivos}</strong> ativos</span>
        </div>

        {metrics.alertas > 0 && (
          <div className="flex items-center gap-[0.375rem] text-status-red">
            <AlertTriangle className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
            <span><strong>{metrics.alertas}</strong> alerta{metrics.alertas > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="w-[1px] h-[0.75rem] bg-surface-border" />

      {/* ── DIREITA: Status + Versão ──────────────── */}
      <div className="flex items-center gap-[0.75rem]">
        <div className="flex items-center gap-[0.25rem]">
          {metrics.online ? (
            <Wifi className="w-[0.75rem] h-[0.75rem] text-status-green" strokeWidth={1.75} />
          ) : (
            <WifiOff className="w-[0.75rem] h-[0.75rem] text-status-red" strokeWidth={1.75} />
          )}
          <span className={metrics.online ? 'text-status-green' : 'text-status-red'}>
            {metrics.online ? 'Online' : 'Offline'}
          </span>
        </div>
        <span className="text-ink-muted">v0.1.0</span>
      </div>
    </footer>
  )
}
```

### `components\layout\TopBar.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Search, AlertCircle, Sun, Cloud, Moon } from 'lucide-react'
import { GlobalSearch }     from '@/components/ui/GlobalSearch'
import { useTheme } from '@/providers/ThemeProvider'
import { supabase } from '@/lib/supabase'

interface TopBarProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

interface Saudacao {
  texto: string
  icon: React.ReactElement
}

function getSaudacao(nome?: string): Saudacao {
  const hora = new Date().getHours()
  const base = nome ? `, ${nome}` : ''
  if (hora < 12) return { texto: `Bom dia${base}`, icon: <Sun  className="w-[0.875rem] h-[0.875rem] text-ads-400 shrink-0" strokeWidth={1.75} /> }
  if (hora < 18) return { texto: `Boa tarde${base}`, icon: <Cloud className="w-[0.875rem] h-[0.875rem] text-ads-400 shrink-0" strokeWidth={1.75} /> }
  return         { texto: `Boa noite${base}`,  icon: <Moon  className="w-[0.875rem] h-[0.875rem] text-ads-400 shrink-0" strokeWidth={1.75} /> }
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  const { isDark } = useTheme()
  const [searchAberto, setSearchAberto] = useState(false)
  const [alertasCount, setAlertasCount] = useState(0)
  const [userName, setUserName] = useState<string>()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchAberto(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const fetchAlertas = async () => {
      const { count } = await supabase
        .from('clientes')
        .select('id', { count: 'exact', head: true })
        .gt('dias_atraso', 0)
      setAlertasCount(count ?? 0)
    }
    fetchAlertas()

    const channel = supabase
      .channel('alertas-topbar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, fetchAlertas)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const nome = data.user?.user_metadata?.nome ?? data.user?.email?.split('@')[0]
      setUserName(nome)
    })
  }, [])

  const isDashboard = title === 'Dashboard'
  const saudacao = isDashboard ? getSaudacao(userName) : null
  const displayTitle = isDashboard ? saudacao?.texto : title

  return (
    <>
      <header className="topbar-shell h-[var(--topbar-h)] dark:border-b dark:border-surface-border bg-surface-card z-50 flex items-center px-[1.25rem] gap-[1rem]">
        {/* ── LOGO ─────────────────────────────────── */}
        <Image
          src={isDark ? '/logo/logo-dark.svg' : '/logo/logo-light.svg'}
          alt="Adsgator"
          width={120}
          height={28}
          className="shrink-0 h-[1.5rem] w-auto"
          priority
        />

        {/* ── DIVISÓRIA ────────────────────────────── */}
        <div className="w-[1px] h-[1.5rem] bg-surface-border shrink-0" />

        {/* ── TÍTULO ────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {displayTitle && (
            <div>
              <h1 className={`text-ink-primary leading-tight truncate flex items-center gap-[0.375rem] ${isDashboard ? 'font-bold text-[1.25rem]' : 'font-semibold text-[0.9375rem]'}`}>
              {saudacao && saudacao.icon}
              {displayTitle}
            </h1>
              {subtitle && <p className="text-ink-muted text-[0.75rem] truncate">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* ── ALERTAS CRÍTICOS ─────────────────────── */}
        {alertasCount > 0 && (
          <div className="flex items-center gap-[0.5rem] px-[0.625rem] py-[0.25rem] rounded-full bg-status-red/10 border border-status-red/20 shrink-0">
            <AlertCircle className="w-[0.875rem] h-[0.875rem] text-status-red" strokeWidth={2} />
            <span className="text-[0.75rem] font-medium text-status-red">{alertasCount} inadimplente{alertasCount > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* ── AÇÕES CUSTOMIZADAS ─────────────────────── */}
        {actions && <div className="flex items-center gap-[0.5rem] shrink-0">{actions}</div>}

        {/* ── SEARCH ────────────────────────────────── */}
        <button
          onClick={() => setSearchAberto(true)}
          className="flex items-center gap-[0.5rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-muted text-[0.8125rem] hover:border-ads-500/40 hover:text-ink-secondary transition-colors shrink-0"
        >
          <Search className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          <span className="hidden sm:inline">Buscar...</span>
          <kbd className="hidden sm:inline-flex items-center px-[0.25rem] h-[1.125rem] rounded bg-surface-base border border-surface-border text-[0.625rem] text-ink-muted font-mono">
            ⌘K
          </kbd>
        </button>
      </header>

      {searchAberto && <GlobalSearch onClose={() => setSearchAberto(false)} />}
    </>
  )
}
```

### `components\ui\Badge.tsx`

```tsx
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?:    'sm' | 'md';
}

const variants = {
  default: 'bg-surface-hover text-ink-secondary',
  success: 'bg-ads-500/15 text-ads-500',
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

### `components\ui\ContextMenu.tsx`

```tsx
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

export interface ContextMenuItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  separator?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  children: React.ReactNode
}

export function ContextMenu({ items, children }: ContextMenuProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const open = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setPos({ x: e.clientX, y: e.clientY })
  }, [])

  const close = useCallback(() => setPos(null), [])

  useEffect(() => {
    if (!pos) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [pos, close])

  /* Ajuste para não sair da viewport */
  const menuStyle: React.CSSProperties = pos
    ? {
        position: 'fixed',
        top: Math.min(pos.y, window.innerHeight - 200),
        left: Math.min(pos.x, window.innerWidth - 180),
        zIndex: 9999,
      }
    : {}

  return (
    <>
      <div onContextMenu={open} className="contents">
        {children}
      </div>

      {pos && (
        <div
          ref={menuRef}
          style={menuStyle}
          className={cn(
            'min-w-[10rem] rounded-[0.5rem] overflow-hidden',
            'bg-surface-elevated border border-surface-border',
            'shadow-xl shadow-black/40',
            'animate-fade-scale py-[0.25rem]',
          )}
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.separator && i > 0 && (
                <div className="my-[0.25rem] border-t border-surface-border" />
              )}
              <button
                onClick={() => { item.onClick(); close() }}
                className={cn(
                  'w-full flex items-center gap-[0.5rem]',
                  'px-[0.75rem] py-[0.4375rem]',
                  'text-[0.8125rem] font-medium text-left',
                  'transition-colors duration-150',
                  item.variant === 'danger'
                    ? 'text-status-red hover:bg-status-red/10'
                    : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary',
                )}
              >
                {item.icon && (
                  <span className="w-[0.875rem] h-[0.875rem] shrink-0 flex items-center justify-center">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
```

### `components\ui\GlobalSearch.tsx`

```tsx
﻿'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, X, User, CheckSquare,
  DollarSign, Clock, ArrowRight,
} from 'lucide-react'

interface ResultCliente    { id: string; nome: string; email: string; nicho: string; status: string }
interface ResultTarefa     { id: string; titulo: string; prioridade: string; data_prazo: string | null; status: string }
interface ResultLancamento { id: string; descricao: string; valor: number; tipo: string; data: string }
interface ResultHistorico  { id: string; descricao: string; tipo: string; created_at: string; cliente_id: string | null }

interface Resultados {
  clientes:    ResultCliente[]
  tarefas:     ResultTarefa[]
  lancamentos: ResultLancamento[]
  historico:   ResultHistorico[]
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

interface Props {
  onClose: () => void
}

export function GlobalSearch({ onClose }: Props) {
  const router               = useRouter()
  const inputRef             = useRef<HTMLInputElement>(null)
  const [query,    setQuery] = useState('')
  const [results,  setResults]  = useState<Resultados | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [cursor,   setCursor]   = useState(0)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const buscar = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json() as Resultados
      setResults(data)
      setCursor(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => buscar(query), 300)
    return () => clearTimeout(t)
  }, [query, buscar])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const total =
    (results?.clientes.length    ?? 0) +
    (results?.tarefas.length     ?? 0) +
    (results?.lancamentos.length ?? 0) +
    (results?.historico.length   ?? 0)

  function navegar(href: string) {
    router.push(href)
    onClose()
  }

  const temResultados = results && total > 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-[1rem]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow shadow-2xl w-full max-w-[38rem] overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-[0.75rem] px-[1rem] py-[0.875rem] border-b border-surface-border">
          <Search className="w-[1rem] h-[1rem] text-ink-muted shrink-0" strokeWidth={1.75} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar clientes, tarefas, transações…"
            className="flex-1 bg-transparent text-ink-primary text-[0.9375rem] placeholder:text-ink-muted focus:outline-none"
          />
          {loading && (
            <div className="w-[0.875rem] h-[0.875rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          {!loading && query && (
            <button onClick={() => setQuery('')} className="text-ink-muted hover:text-ink-secondary transition-colors">
              <X className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center h-[1.25rem] px-[0.375rem] rounded bg-surface-hover border border-surface-border text-[0.625rem] text-ink-muted font-mono shrink-0">
            ESC
          </kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <p className="text-ink-muted text-[0.8125rem] text-center py-[2.5rem]">
              Digite para buscar em toda a plataforma
            </p>
          )}

          {query.length >= 2 && !loading && !temResultados && (
            <p className="text-ink-muted text-[0.8125rem] text-center py-[2.5rem]">
              Nenhum resultado para <strong className="text-ink-secondary">"{query}"</strong>
            </p>
          )}

          {temResultados && (
            <div className="py-[0.5rem]">

              {/* Clientes */}
              {results.clientes.length > 0 && (
                <div>
                  <p className="text-ink-muted text-[0.625rem] font-semibold uppercase tracking-wide px-[1rem] py-[0.375rem]">Clientes</p>
                  {results.clientes.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navegar(`/clientes/${c.id}`)}
                      className="w-full flex items-center gap-[0.75rem] px-[1rem] py-[0.625rem] hover:bg-surface-hover transition-colors text-left"
                    >
                      <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-ads-500/15 flex items-center justify-center shrink-0">
                        <User className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ink-primary text-[0.875rem] font-medium truncate">{c.nome}</p>
                        <p className="text-ink-muted text-[0.75rem] truncate">{c.nicho} · {c.email}</p>
                      </div>
                      <ArrowRight className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                    </button>
                  ))}
                </div>
              )}

              {/* Tarefas */}
              {results.tarefas.length > 0 && (
                <div>
                  <p className="text-ink-muted text-[0.625rem] font-semibold uppercase tracking-wide px-[1rem] py-[0.375rem] mt-[0.25rem]">Tarefas</p>
                  {results.tarefas.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navegar('/tarefas')}
                      className="w-full flex items-center gap-[0.75rem] px-[1rem] py-[0.625rem] hover:bg-surface-hover transition-colors text-left"
                    >
                      <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-status-blue/15 flex items-center justify-center shrink-0">
                        <CheckSquare className="w-[0.875rem] h-[0.875rem] text-status-blue" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ink-primary text-[0.875rem] font-medium truncate">{t.titulo}</p>
                        <p className="text-ink-muted text-[0.75rem]">
                          {t.prioridade}
                          {t.data_prazo ? ` · ${new Date(t.data_prazo).toLocaleDateString('pt-BR')}` : ''}
                        </p>
                      </div>
                      <ArrowRight className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                    </button>
                  ))}
                </div>
              )}

              {/* Lançamentos */}
              {results.lancamentos.length > 0 && (
                <div>
                  <p className="text-ink-muted text-[0.625rem] font-semibold uppercase tracking-wide px-[1rem] py-[0.375rem] mt-[0.25rem]">Financeiro</p>
                  {results.lancamentos.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => navegar('/financeiro')}
                      className="w-full flex items-center gap-[0.75rem] px-[1rem] py-[0.625rem] hover:bg-surface-hover transition-colors text-left"
                    >
                      <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-status-green/15 flex items-center justify-center shrink-0">
                        <DollarSign className="w-[0.875rem] h-[0.875rem] text-status-green" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ink-primary text-[0.875rem] font-medium truncate">{l.descricao}</p>
                        <p className="text-ink-muted text-[0.75rem]">
                          {fmt(l.valor)} · {new Date(l.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <ArrowRight className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                    </button>
                  ))}
                </div>
              )}

              {/* Histórico */}
              {results.historico.length > 0 && (
                <div>
                  <p className="text-ink-muted text-[0.625rem] font-semibold uppercase tracking-wide px-[1rem] py-[0.375rem] mt-[0.25rem]">Histórico</p>
                  {results.historico.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => navegar(h.cliente_id ? `/clientes/${h.cliente_id}` : '/dashboard')}
                      className="w-full flex items-center gap-[0.75rem] px-[1rem] py-[0.625rem] hover:bg-surface-hover transition-colors text-left"
                    >
                      <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-surface-hover flex items-center justify-center shrink-0">
                        <Clock className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ink-primary text-[0.875rem] truncate">{h.descricao}</p>
                        <p className="text-ink-muted text-[0.75rem]">
                          {h.tipo} · {new Date(h.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <ArrowRight className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {temResultados && (
          <div className="border-t border-surface-border px-[1rem] py-[0.5rem] flex items-center gap-[1rem]">
            <span className="text-ink-muted text-[0.6875rem]">{total} resultado{total !== 1 ? 's' : ''}</span>
            <span className="text-ink-muted text-[0.6875rem] ml-auto">↑↓ navegar · Enter selecionar · Esc fechar</span>
          </div>
        )}
      </div>
    </div>
  )
}
```

### `components\ui\HelpChatButton.tsx`

```tsx
﻿'use client'

import { useEffect, useRef, useState } from 'react'
import { HelpCircle, X, Send, Loader2 } from 'lucide-react'

interface Mensagem {
  role: 'user' | 'assistant'
  text: string
}

export function HelpChatButton() {
  const [aberto,    setAberto]    = useState(false)
  const [msgs,      setMsgs]      = useState<Mensagem[]>([])
  const [input,     setInput]     = useState('')
  const [carregando, setCarregando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aberto && msgs.length === 0) {
      setMsgs([{ role: 'assistant', text: 'Olá! Sou o assistente da Adsgator. Como posso ajudar você a usar o sistema?' }])
    }
  }, [aberto])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function enviar() {
    if (!input.trim() || carregando) return
    const pergunta = input.trim()
    setInput('')
    setMsgs((prev) => [...prev, { role: 'user', text: pergunta }])
    setCarregando(true)
    try {
      const histMessages = msgs.slice(-6).map((m) => ({ role: m.role, content: m.text }))
      histMessages.push({ role: 'user', content: pergunta })
      const res = await fetch('/api/ia/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: histMessages }),
      })
      const data = await res.json()
      setMsgs((prev) => [...prev, { role: 'assistant', text: data.content ?? 'Não foi possível obter resposta.' }])
    } catch {
      setMsgs((prev) => [...prev, { role: 'assistant', text: 'Erro ao conectar com a IA. Tente novamente.' }])
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      {/* Chat overlay */}
      {aberto && (
        <div className="fixed bottom-[5rem] right-[1.5rem] w-[22rem] h-[28rem] bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow shadow-2xl shadow-black/50 z-50 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-[1rem] py-[0.75rem] border-b border-surface-border bg-surface-hover">
            <div className="flex items-center gap-[0.5rem]">
              <HelpCircle className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={2} />
              <p className="text-ink-primary font-semibold text-[0.875rem]">Ajuda — Adsgator IA</p>
            </div>
            <button onClick={() => setAberto(false)} className="text-ink-muted hover:text-ink-primary">
              <X className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-[0.875rem] py-[0.75rem] flex flex-col gap-[0.625rem]">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-[0.75rem] py-[0.5rem] rounded-xl text-[0.8125rem] leading-snug ${
                  m.role === 'user'
                    ? 'bg-ads-500 text-white rounded-br-none'
                    : 'bg-surface-hover text-ink-secondary rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {carregando && (
              <div className="flex justify-start">
                <div className="bg-surface-hover px-[0.75rem] py-[0.5rem] rounded-xl rounded-bl-none">
                  <Loader2 className="w-[0.875rem] h-[0.875rem] text-ink-muted animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-[0.5rem] px-[0.75rem] py-[0.625rem] border-t border-surface-border">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && enviar()}
              placeholder="Pergunte sobre o sistema…"
              className="flex-1 bg-surface-hover border border-surface-border rounded-lg px-[0.625rem] py-[0.375rem] text-ink-primary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500"
            />
            <button
              onClick={enviar}
              disabled={!input.trim() || carregando}
              className="w-[2rem] h-[2rem] rounded-lg bg-ads-500 hover:bg-ads-600 flex items-center justify-center text-white disabled:opacity-40 transition-colors"
            >
              <Send className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(!aberto)}
        className="fixed bottom-[1.5rem] right-[1.5rem] w-[3rem] h-[3rem] rounded-full bg-ads-500 hover:bg-ads-600 text-white shadow-lg shadow-ads-500/30 flex items-center justify-center z-50 transition-all duration-200 hover:scale-110"
        aria-label="Ajuda com IA"
      >
        {aberto
          ? <X className="w-[1.125rem] h-[1.125rem]" strokeWidth={2} />
          : <HelpCircle className="w-[1.125rem] h-[1.125rem]" strokeWidth={2} />
        }
      </button>
    </>
  )
}
```

### `components\ui\StatusBadge.tsx`

```tsx
import { cn } from '@/lib/utils'

type StatusType = 'active' | 'attention' | 'critical' | 'paused' | 'info' | 'purple' | 'neutral'

interface StatusBadgeProps {
  status: StatusType
  label: string
  dot?: boolean
  size?: 'sm' | 'md'
  variant?: 'solid' | 'subtle' | 'outline'
  className?: string
  icon?: React.ReactNode
}

const STATUS_CONFIG: Record<StatusType, { color: string; bg: string; border: string; dot: string }> = {
  active:    { color: 'text-status-green',  bg: 'bg-status-green/10',  border: 'border-status-green/20',  dot: 'bg-status-green'  },
  attention: { color: 'text-status-orange', bg: 'bg-status-orange/10', border: 'border-status-orange/20', dot: 'bg-status-orange' },
  critical:  { color: 'text-status-red',    bg: 'bg-status-red/10',    border: 'border-status-red/20',    dot: 'bg-status-red'    },
  paused:    { color: 'text-status-blue',   bg: 'bg-status-blue/10',   border: 'border-status-blue/20',   dot: 'bg-status-blue'   },
  info:      { color: 'text-status-cyan',   bg: 'bg-status-cyan/10',   border: 'border-status-cyan/20',   dot: 'bg-status-cyan'   },
  purple:    { color: 'text-status-purple', bg: 'bg-status-purple/10', border: 'border-status-purple/20', dot: 'bg-status-purple' },
  neutral:   { color: 'text-ink-muted',     bg: 'bg-surface-hover',    border: 'border-surface-border',   dot: 'bg-ink-muted'     },
}

export function StatusBadge({ status, label, dot = false, size = 'sm', variant = 'subtle', className, icon }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]

  const sizeClasses = {
    sm: 'text-[0.6875rem] px-[0.375rem] py-[0.0625rem] gap-[0.25rem]',
    md: 'text-[0.75rem]  px-[0.5rem]   py-[0.125rem]  gap-[0.3125rem]',
  }

  const variantClasses = {
    solid:   `${cfg.color} ${cfg.bg} border ${cfg.border}`,
    subtle:  `${cfg.color} ${cfg.bg}`,
    outline: `${cfg.color} bg-transparent border ${cfg.border}`,
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {dot && <span className={cn('w-[0.375rem] h-[0.375rem] rounded-full shrink-0', cfg.dot)} />}
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </span>
  )
}
```

### `components\ui\TaskModal.tsx`

```tsx
﻿'use client'

import { useEffect, useState } from 'react'
import { X, Save, Calendar, Flag, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Tarefa, TarefaPrioridade } from '@/lib/types'

interface Props {
  tarefa?:  Partial<Tarefa>
  onClose:  () => void
  onSaved:  () => void
}

interface ClienteOpcao { id: string; nome: string }

const PRIORIDADES: { value: TarefaPrioridade; label: string }[] = [
  { value: 'baixo',   label: 'Baixo'  },
  { value: 'normal',  label: 'Normal' },
  { value: 'alto',    label: 'Alto'   },
  { value: 'critico', label: 'Crítico'},
]

export function TaskModal({ tarefa, onClose, onSaved }: Props) {
  const [titulo,     setTitulo]     = useState(tarefa?.titulo    ?? '')
  const [descricao,  setDescricao]  = useState(tarefa?.descricao ?? '')
  const [clienteId,  setClienteId]  = useState(tarefa?.cliente_id ?? '')
  const [prioridade, setPrioridade] = useState<TarefaPrioridade>(tarefa?.prioridade ?? 'normal')
  const [dataPrazo,  setDataPrazo]  = useState(tarefa?.data_prazo?.slice(0, 16) ?? '')
  const [clientes,   setClientes]   = useState<ClienteOpcao[]>([])
  const [salvando,   setSalvando]   = useState(false)
  const [erro,       setErro]       = useState('')

  useEffect(() => {
    supabase.from('clientes').select('id, nome').in('status', ['ativo', 'onboarding', 'setup_trafego', 'recebido']).order('nome')
      .then(({ data }) => setClientes((data ?? []) as ClienteOpcao[]))
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) { setErro('Título obrigatório.'); return }
    setSalvando(true); setErro('')

    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      titulo,
      descricao:   descricao || null,
      cliente_id:  clienteId  || null,
      prioridade,
      data_prazo:  dataPrazo  || null,
      user_id:     user?.id,
      status:      tarefa?.status ?? 'pendente',
    }

    const { error } = tarefa?.id
      ? await supabase.from('tarefas').update(payload).eq('id', tarefa.id)
      : await supabase.from('tarefas').insert(payload)

    if (error) { setErro(error.message); setSalvando(false); return }
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow shadow-2xl w-full max-w-[28rem]">
        {/* Header */}
        <div className="flex items-center justify-between px-[1.5rem] py-[1rem] border-b border-surface-border">
          <p className="text-ink-primary font-semibold text-[0.9375rem]">
            {tarefa?.id ? 'Editar Tarefa' : 'Nova Tarefa'}
          </p>
          <button onClick={onClose} className="w-[2rem] h-[2rem] flex items-center justify-center rounded hover:bg-surface-hover text-ink-muted transition-colors">
            <X className="w-[1rem] h-[1rem]" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={salvar} className="p-[1.5rem] flex flex-col gap-[1rem]">
          {/* Título */}
          <div>
            <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">Título *</label>
            <input
              type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}
              placeholder="Descreva a tarefa…"
              className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">Detalhes</label>
            <textarea
              value={descricao} onChange={(e) => setDescricao(e.target.value)}
              rows={3} placeholder="Contexto adicional…"
              className="w-full px-[0.75rem] py-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] resize-none focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-[0.75rem]">
            {/* Cliente */}
            <div>
              <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">
                <User className="inline w-[0.75rem] h-[0.75rem] mr-[0.25rem]" strokeWidth={1.75} />Cliente
              </label>
              <select
                value={clienteId} onChange={(e) => setClienteId(e.target.value)}
                className="w-full h-[2.5rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30"
              >
                <option value="">Sem cliente</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">
                <Flag className="inline w-[0.75rem] h-[0.75rem] mr-[0.25rem]" strokeWidth={1.75} />Prioridade
              </label>
              <select
                value={prioridade} onChange={(e) => setPrioridade(e.target.value as TarefaPrioridade)}
                className="w-full h-[2.5rem] px-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30"
              >
                {PRIORIDADES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Data prazo */}
          <div>
            <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">
              <Calendar className="inline w-[0.75rem] h-[0.75rem] mr-[0.25rem]" strokeWidth={1.75} />Data / Hora do prazo
            </label>
            <input
              type="datetime-local" value={dataPrazo} onChange={(e) => setDataPrazo(e.target.value)}
              className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
          </div>

          {erro && <p className="text-[0.8125rem] text-status-red">{erro}</p>}

          <div className="flex gap-[0.75rem] pt-[0.25rem]">
            <button type="button" onClick={onClose} className="flex-1 h-[2.5rem] rounded-lg border border-surface-border bg-surface-hover text-ink-secondary text-[0.875rem] font-medium hover:text-ink-primary transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={salvando} className="flex-1 flex items-center justify-center gap-[0.5rem] h-[2.5rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white text-[0.875rem] font-semibold transition-colors disabled:opacity-50">
              {salvando ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### `components\ui\ThemeToggle.tsx`

```tsx
'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '@/providers/ThemeProvider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const themes = [
    { key: 'dark'   as const, icon: Moon,    label: 'Escuro'  },
    { key: 'light'  as const, icon: Sun,     label: 'Claro'   },
    { key: 'system' as const, icon: Monitor, label: 'Sistema' },
  ]

  return (
    <div className="flex items-center gap-[0.25rem] p-[0.25rem] bg-surface-hover rounded-[0.5rem] border border-surface-border">
      {themes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          title={label}
          className={`
            w-[1.75rem] h-[1.75rem] rounded-[0.375rem] flex items-center justify-center
            transition-all duration-150
            ${theme === key
              ? 'bg-surface-card text-ads-500 shadow-sm'
              : 'text-ink-muted hover:text-ink-secondary'
            }
          `}
        >
          <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  )
}
```

### `components\ui\Tooltip.tsx`

```tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export function Tooltip({ content, children, side = 'top', delay = 400, className }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }, [delay])

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }, [])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const positionClasses = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-[0.375rem]',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-[0.375rem]',
    left:   'right-full top-1/2 -translate-y-1/2 mr-[0.375rem]',
    right:  'left-full top-1/2 -translate-y-1/2 ml-[0.375rem]',
  }

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className={cn(
            'absolute z-[100] pointer-events-none',
            'px-[0.5rem] py-[0.25rem] rounded-[0.25rem]',
            'bg-surface-elevated border border-surface-border',
            'text-ink-primary text-[0.6875rem] font-medium whitespace-nowrap',
            'shadow-lg shadow-black/30',
            'animate-fade-scale',
            positionClasses[side],
            className,
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
```

### `lib\astro-components.ts`

```typescript
// ─── TIPOS ───────────────────────────────────────────────────────────────────

export type CategoriaAstro =
  | 'navegacao'
  | 'hero'
  | 'servicos'
  | 'depoimentos'
  | 'pricing'
  | 'rodape';

export interface AstroComponente {
  id:           string;
  nome:         string;
  categoria:    CategoriaAstro;
  descricao:    string;
  versao:       string;
  variacoes:    string[];
  recomendacoes: string[];
  codigo_astro: string;
}

// ─── BIBLIOTECA ───────────────────────────────────────────────────────────────

export const BIBLIOTECA_COMPONENTES: AstroComponente[] = [
  {
    id:        'nav-minimal',
    nome:      'Navbar Minimalista',
    categoria: 'navegacao',
    descricao: 'Barra de navegação com logo, links e CTA',
    versao:    '1.0',
    variacoes: ['sticky', 'transparente', 'com-blur'],
    recomendacoes: [
      'Usar sticky com backdrop-blur para melhor UX',
      'CTA com cor primária do cliente',
      'Links em font-weight 500',
    ],
    codigo_astro: `---
interface Props {
  nomeMarca: string;
  corPrimaria?: string;
  links?: { label: string; href: string }[];
  cta?: { label: string; href: string };
}

const {
  nomeMarca,
  corPrimaria = '#10b981',
  links = [],
  cta,
} = Astro.props;
---

<nav
  class="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200/50 dark:border-zinc-800/50"
>
  <div class="max-w-6xl mx-auto px-[1.5rem] h-[4rem] flex items-center justify-between">
    <a href="/" class="font-bold text-lg text-zinc-900 dark:text-white">
      {nomeMarca}
    </a>

    <div class="hidden md:flex items-center gap-[2rem]">
      {links.map((link) => (
        <a
          href={link.href}
          class="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          {link.label}
        </a>
      ))}
    </div>

    {cta && (
      <a
        href={cta.href}
        style={{ backgroundColor: corPrimaria }}
        class="text-sm font-semibold text-white px-[1.25rem] h-[2.5rem] rounded-[0.5rem] flex items-center transition-opacity hover:opacity-90"
      >
        {cta.label}
      </a>
    )}
  </div>
</nav>`,
  },

  {
    id:        'hero-cta',
    nome:      'Hero com CTA',
    categoria: 'hero',
    descricao: 'Seção hero com headline, subtítulo e botões de CTA',
    versao:    '1.0',
    variacoes: ['centralizado', 'left-aligned', 'com-imagem'],
    recomendacoes: [
      'Headline em no máximo 8 palavras',
      'Subtítulo explica o benefício, não o serviço',
      'CTA primário com verbo de ação: Agendar, Começar, Falar',
    ],
    codigo_astro: `---
interface Props {
  headline:     string;
  subtitulo:    string;
  ctaPrimario:  { label: string; href: string };
  ctaSecundario?: { label: string; href: string };
  corPrimaria?: string;
}

const {
  headline,
  subtitulo,
  ctaPrimario,
  ctaSecundario,
  corPrimaria = '#10b981',
} = Astro.props;
---

<section class="py-[6rem] px-[1.5rem]">
  <div class="max-w-3xl mx-auto text-center">
    <h1 class="text-[3.5rem] font-bold leading-tight text-zinc-900 dark:text-white mb-[1.5rem]">
      {headline}
    </h1>
    <p class="text-xl text-zinc-500 dark:text-zinc-400 mb-[2.5rem] leading-relaxed">
      {subtitulo}
    </p>
    <div class="flex items-center justify-center gap-[1rem] flex-wrap">
      <a
        href={ctaPrimario.href}
        style={{ backgroundColor: corPrimaria }}
        class="text-base font-semibold text-white px-[2rem] h-[3rem] rounded-[0.625rem] flex items-center transition-opacity hover:opacity-90"
      >
        {ctaPrimario.label}
      </a>
      {ctaSecundario && (
        <a
          href={ctaSecundario.href}
          class="text-base font-medium text-zinc-600 dark:text-zinc-400 px-[2rem] h-[3rem] rounded-[0.625rem] flex items-center border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 transition-colors"
        >
          {ctaSecundario.label}
        </a>
      )}
    </div>
  </div>
</section>`,
  },

  {
    id:        'servicos-grid',
    nome:      'Grid de Serviços',
    categoria: 'servicos',
    descricao: 'Cards de serviços em grid responsivo com ícone, título e descrição',
    versao:    '1.0',
    variacoes: ['3 colunas', '2 colunas', 'lista'],
    recomendacoes: [
      'Máximo 6 serviços para não sobrecarregar o leitor',
      'Ícone SVG, não emoji',
      'Descrição em 1-2 frases objetivas',
    ],
    codigo_astro: `---
interface Servico {
  icone:    string; // SVG inline
  titulo:   string;
  descricao: string;
}

interface Props {
  titulo:     string;
  servicos:   Servico[];
  corPrimaria?: string;
}

const { titulo, servicos, corPrimaria = '#10b981' } = Astro.props;
---

<section class="py-[5rem] px-[1.5rem]">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-[2.25rem] font-bold text-zinc-900 dark:text-white text-center mb-[3.5rem]">
      {titulo}
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-[2rem]">
      {servicos.map((s) => (
        <div class="p-[1.75rem] rounded-[1rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <div
            class="w-[3rem] h-[3rem] rounded-[0.75rem] flex items-center justify-center mb-[1.25rem]"
            style={{ backgroundColor: corPrimaria + '20' }}
          >
            <Fragment set:html={s.icone} />
          </div>
          <h3 class="font-semibold text-zinc-900 dark:text-white text-lg mb-[0.5rem]">
            {s.titulo}
          </h3>
          <p class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
            {s.descricao}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>`,
  },

  {
    id:        'depoimentos-slider',
    nome:      'Depoimentos',
    categoria: 'depoimentos',
    descricao: 'Seção de prova social com depoimentos de clientes',
    versao:    '1.0',
    variacoes: ['grid', 'slider', 'destaque único'],
    recomendacoes: [
      'Usar depoimentos reais com nome completo e foto',
      'Mencionar resultado específico no depoimento',
      'Mínimo 3 depoimentos para credibilidade',
    ],
    codigo_astro: `---
interface Depoimento {
  texto:  string;
  nome:   string;
  cargo?: string;
  avatar?: string;
}

interface Props {
  titulo:      string;
  depoimentos: Depoimento[];
}

const { titulo, depoimentos } = Astro.props;
---

<section class="py-[5rem] px-[1.5rem] bg-zinc-50 dark:bg-zinc-950">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-[2.25rem] font-bold text-zinc-900 dark:text-white text-center mb-[3.5rem]">
      {titulo}
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-[1.5rem]">
      {depoimentos.map((d) => (
        <div class="p-[1.75rem] bg-white dark:bg-zinc-900 rounded-[1rem] border border-zinc-200 dark:border-zinc-800">
          <p class="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed mb-[1.5rem]">
            "{d.texto}"
          </p>
          <div class="flex items-center gap-[0.75rem]">
            {d.avatar
              ? <img src={d.avatar} alt={d.nome} class="w-[2.5rem] h-[2.5rem] rounded-full object-cover" />
              : <div class="w-[2.5rem] h-[2.5rem] rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 font-bold">{d.nome[0]}</div>
            }
            <div>
              <p class="font-semibold text-zinc-900 dark:text-white text-sm">{d.nome}</p>
              {d.cargo && <p class="text-zinc-400 text-xs">{d.cargo}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>`,
  },

  {
    id:        'pricing-simples',
    nome:      'Pricing Simples',
    categoria: 'pricing',
    descricao: 'Tabela de preços com planos e CTA por plano',
    versao:    '1.0',
    variacoes: ['2 planos', '3 planos', 'plano único'],
    recomendacoes: [
      'Destacar visualmente o plano mais popular',
      'Listar até 5 benefícios por plano',
      'Preço com destaque visual, sem centavos se possível',
    ],
    codigo_astro: `---
interface Plano {
  nome:        string;
  preco:       string;
  periodo?:    string;
  beneficios:  string[];
  destaque?:   boolean;
  cta:         { label: string; href: string };
}

interface Props {
  titulo:       string;
  planos:       Plano[];
  corPrimaria?: string;
}

const { titulo, planos, corPrimaria = '#10b981' } = Astro.props;
---

<section class="py-[5rem] px-[1.5rem]">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-[2.25rem] font-bold text-zinc-900 dark:text-white text-center mb-[3.5rem]">
      {titulo}
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-{planos.length} gap-[1.5rem] items-start">
      {planos.map((p) => (
        <div
          class={\`p-[2rem] rounded-[1rem] border-2 \${p.destaque ? 'border-current shadow-lg' : 'border-zinc-200 dark:border-zinc-800'}\`}
          style={p.destaque ? { borderColor: corPrimaria } : {}}
        >
          {p.destaque && (
            <p class="text-xs font-bold uppercase tracking-wide mb-[1rem]" style={{ color: corPrimaria }}>
              Mais Popular
            </p>
          )}
          <p class="text-zinc-900 dark:text-white font-bold text-xl mb-[0.5rem]">{p.nome}</p>
          <p class="text-[2.5rem] font-bold text-zinc-900 dark:text-white leading-none mb-[0.25rem]">
            {p.preco}
          </p>
          {p.periodo && <p class="text-zinc-400 text-xs mb-[1.5rem]">{p.periodo}</p>}
          <ul class="space-y-[0.75rem] mb-[2rem]">
            {p.beneficios.map((b) => (
              <li class="flex items-start gap-[0.5rem] text-sm text-zinc-600 dark:text-zinc-300">
                <span style={{ color: corPrimaria }} class="font-bold mt-[0.125rem]">✓</span>
                {b}
              </li>
            ))}
          </ul>
          <a
            href={p.cta.href}
            class="block w-full text-center font-semibold text-sm h-[3rem] leading-[3rem] rounded-[0.625rem] transition-opacity hover:opacity-90"
            style={p.destaque
              ? { backgroundColor: corPrimaria, color: '#fff' }
              : { border: '1.5px solid currentColor', color: corPrimaria }
            }
          >
            {p.cta.label}
          </a>
        </div>
      ))}
    </div>
  </div>
</section>`,
  },

  {
    id:        'rodape-simples',
    nome:      'Rodapé Simples',
    categoria: 'rodape',
    descricao: 'Footer com logo, links, redes sociais e copyright',
    versao:    '1.0',
    variacoes: ['minimalista', 'colunas', 'com-newsletter'],
    recomendacoes: [
      'Incluir links de política de privacidade e termos',
      'WhatsApp e Instagram são essenciais para nichos locais',
      'Manter copyright atualizado com ano dinâmico',
    ],
    codigo_astro: `---
interface Props {
  nomeMarca:  string;
  descricao?: string;
  links?:     { label: string; href: string }[];
  whatsapp?:  string;
  instagram?: string;
}

const { nomeMarca, descricao, links = [], whatsapp, instagram } = Astro.props;
const ano = new Date().getFullYear();
---

<footer class="border-t border-zinc-200 dark:border-zinc-800 py-[3rem] px-[1.5rem]">
  <div class="max-w-6xl mx-auto">
    <div class="flex flex-col md:flex-row items-start justify-between gap-[2rem] mb-[2rem]">
      <div class="max-w-[16rem]">
        <p class="font-bold text-zinc-900 dark:text-white text-lg mb-[0.5rem]">{nomeMarca}</p>
        {descricao && <p class="text-zinc-400 text-sm">{descricao}</p>}
      </div>
      <div class="flex flex-wrap gap-[1.5rem]">
        {links.map((l) => (
          <a href={l.href} class="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            {l.label}
          </a>
        ))}
        {whatsapp && (
          <a href={\`https://wa.me/55\${whatsapp.replace(/\\D/g, '')}\`} target="_blank" rel="noopener noreferrer" class="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            WhatsApp
          </a>
        )}
        {instagram && (
          <a href={\`https://instagram.com/\${instagram}\`} target="_blank" rel="noopener noreferrer" class="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            @{instagram}
          </a>
        )}
      </div>
    </div>
    <p class="text-zinc-400 text-xs border-t border-zinc-100 dark:border-zinc-800 pt-[1.5rem]">
      © {ano} {nomeMarca}. Todos os direitos reservados.
    </p>
  </div>
</footer>`,
  },
];

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────

export function obterComponentePorId(id: string): AstroComponente | undefined {
  return BIBLIOTECA_COMPONENTES.find((c) => c.id === id);
}

export function obterCategorias(): CategoriaAstro[] {
  return Array.from(new Set(BIBLIOTECA_COMPONENTES.map((c) => c.categoria)));
}

export function obterComponentesPorCategoria(categoria: CategoriaAstro): AstroComponente[] {
  return BIBLIOTECA_COMPONENTES.filter((c) => c.categoria === categoria);
}
```

### `lib\audit.ts`

```typescript
// ─── Audit Logger ─────────────────────────────────────────────────────────

import { supabase } from './supabase'

export type AuditAction =
  | 'cliente_created'
  | 'cliente_updated'
  | 'cliente_deleted'
  | 'cliente_status_changed'
  | 'estagio_advanced'
  | 'tarefa_created'
  | 'tarefa_updated'
  | 'tarefa_completed'
  | 'financeiro_lancamento'
  | 'config_updated'
  | 'login'
  | 'logout'
  | 'export_data'
  | 'integration_connected'
  | 'integration_disconnected'

export interface AuditLogEntry {
  id?: string
  user_id: string
  user_email?: string
  action: AuditAction
  resource_type: string
  resource_id?: string
  cliente_id?: string
  details: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at?: string
}

// Registrar evento de audit
export async function logAudit(entry: Omit<AuditLogEntry, 'id' | 'created_at'>) {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        ...entry,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Erro ao registrar audit:', error)
    }
  } catch (e) {
    console.error('Erro crítico no audit logger:', e)
  }
}

// Helper para log de alteração de cliente
export async function logClienteChange(
  userId: string,
  clienteId: string,
  action: AuditAction,
  changes: Record<string, { old: unknown; new: unknown }>,
  metadata?: Record<string, unknown>
) {
  await logAudit({
    user_id: userId,
    action,
    resource_type: 'cliente',
    resource_id: clienteId,
    cliente_id: clienteId,
    details: {
      changes,
      ...metadata,
    },
  })
}

// Helper para log de estágio
export async function logEstagioChange(
  userId: string,
  clienteId: string,
  estagioAnterior: string,
  estagioNovo: string,
  acaoLabel: string
) {
  await logAudit({
    user_id: userId,
    action: 'estagio_advanced',
    resource_type: 'estagio',
    cliente_id: clienteId,
    details: {
      estagio_anterior: estagioAnterior,
      estagio_novo: estagioNovo,
      acao_label: acaoLabel,
    },
  })
}

// Helper para log financeiro
export async function logFinanceiro(
  userId: string,
  lancamentoId: string,
  tipo: 'receita' | 'custo',
  valor: number,
  clienteId?: string
) {
  await logAudit({
    user_id: userId,
    action: 'financeiro_lancamento',
    resource_type: 'lancamento',
    resource_id: lancamentoId,
    cliente_id: clienteId,
    details: {
      tipo,
      valor,
    },
  })
}

// Buscar logs de audit (com filtros)
export async function fetchAuditLogs(filters?: {
  userId?: string
  clienteId?: string
  action?: AuditAction
  startDate?: string
  endDate?: string
  limit?: number
}) {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.userId) query = query.eq('user_id', filters.userId)
  if (filters?.clienteId) query = query.eq('cliente_id', filters.clienteId)
  if (filters?.action) query = query.eq('action', filters.action)
  if (filters?.startDate) query = query.gte('created_at', filters.startDate)
  if (filters?.endDate) query = query.lte('created_at', filters.endDate)
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query

  if (error) throw error
  return data as AuditLogEntry[]
}
```

### `lib\auth.ts`

```typescript
import { supabase } from './supabase';

export async function loginComEmail(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function obterSessao() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

export async function obterUsuario() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}
```

### `lib\city-coords.ts`

```typescript
// Coordenadas aproximadas das principais cidades brasileiras
export const CITY_COORDS: Record<string, [number, number]> = {
  'São Paulo':          [-23.5505, -46.6333],
  'Rio de Janeiro':     [-22.9068, -43.1729],
  'Belo Horizonte':     [-19.9191, -43.9387],
  'Brasília':           [-15.7801, -47.9292],
  'Salvador':           [-12.9714, -38.5014],
  'Fortaleza':          [-3.7172,  -38.5433],
  'Curitiba':           [-25.4284, -49.2733],
  'Manaus':             [-3.1190,  -60.0217],
  'Recife':             [-8.0476,  -34.8770],
  'Porto Alegre':       [-30.0346, -51.2177],
  'Belém':              [-1.4558,  -48.5044],
  'Goiânia':            [-16.6869, -49.2648],
  'Guarulhos':          [-23.4538, -46.5333],
  'Campinas':           [-22.9056, -47.0608],
  'São Luís':           [-2.5307,  -44.3068],
  'São Gonçalo':        [-22.8268, -43.0539],
  'Maceió':             [-9.6658,  -35.7350],
  'Duque de Caxias':    [-22.7856, -43.3117],
  'Natal':              [-5.7945,  -35.2110],
  'Teresina':           [-5.0892,  -42.8019],
  'Campo Grande':       [-20.4697, -54.6201],
  'Osasco':             [-23.5329, -46.7920],
  'Santo André':        [-23.6639, -46.5383],
  'João Pessoa':        [-7.1195,  -34.8450],
  'Jaboatão dos Guararapes': [-8.1131, -35.0145],
  'Contagem':           [-19.9319, -44.0536],
  'São José dos Campos': [-23.1791, -45.8872],
  'Ribeirão Preto':     [-21.1775, -47.8103],
  'Uberlândia':         [-18.9113, -48.2622],
  'Sorocaba':           [-23.5015, -47.4526],
  'Aracaju':            [-10.9472, -37.0731],
  'Cuiabá':             [-15.5989, -56.0949],
  'Porto Velho':        [-8.7612,  -63.9004],
  'Macapá':             [0.0349,   -51.0694],
  'Rio Branco':         [-9.9754,  -67.8249],
  'Boa Vista':          [2.8235,   -60.6758],
  'Palmas':             [-10.2491, -48.3243],
  'Florianópolis':      [-27.5954, -48.5480],
  'Vitória':            [-20.3155, -40.3128],
  'Niterói':            [-22.8830, -43.1036],
  'Joinville':          [-26.3045, -48.8487],
  'Santos':             [-23.9608, -46.3336],
  'Londrina':           [-23.3045, -51.1696],
  'Caxias do Sul':      [-29.1681, -51.1794],
}

export function getCityCoords(city: string): [number, number] | null {
  const direct = CITY_COORDS[city]
  if (direct) return direct
  // busca parcial
  const key = Object.keys(CITY_COORDS).find(
    (k) => k.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(k.toLowerCase())
  )
  return key ? CITY_COORDS[key] : null
}
```

### `lib\database.ts`

```typescript
import { supabase } from './supabase';
import type { Cliente, Estagio, HistoricoAcao, Assinatura, ChecklistItem } from './types';

// ============================================================
// CLIENTES
// ============================================================

export async function criarCliente(dados: Omit<Cliente, 'id' | 'user_id' | 'dias_atraso' | 'created_at' | 'updated_at' | 'data_criacao' | 'data_atualizacao'>) {
  const { data, error } = await supabase
    .from('clientes')
    .insert([{ ...dados, status: 'recebido' }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar cliente: ${error.message}`);

  // Criar estágio inicial
  await criarEstagio({
    cliente_id: data.id,
    nome:       'recebido',
    acao_label: 'Enviar mensagem de boas-vindas via WhatsApp com template #BOASVINDAS',
  });

  // Registrar no histórico
  await registrarHistorico(data.id, 'cliente_criado', `Cliente ${dados.nome} criado no sistema.`);

  return data as Cliente;
}

export async function obterCliente(clienteId: string): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', clienteId)
    .single();

  if (error) throw new Error(`Erro ao obter cliente: ${error.message}`);
  return data as Cliente;
}

export async function listarClientes(filtro?: { status?: string; nicho?: string }): Promise<Cliente[]> {
  let query = supabase.from('clientes').select('*');

  if (filtro?.status) query = query.eq('status', filtro.status);
  if (filtro?.nicho)  query = query.eq('nicho', filtro.nicho);

  const { data, error } = await query.order('data_criacao', { ascending: false });

  if (error) throw new Error(`Erro ao listar clientes: ${error.message}`);
  return (data ?? []) as Cliente[];
}

export async function atualizarCliente(clienteId: string, dados: Partial<Cliente>) {
  const { error } = await supabase
    .from('clientes')
    .update(dados)
    .eq('id', clienteId);

  if (error) throw new Error(`Erro ao atualizar cliente: ${error.message}`);
}

export async function avancarEstagio(clienteId: string, novoEstagio: string, acaoProxima: string) {
  // Finaliza o estágio atual
  const estagioAtivo = await obterEstagioAtivo(clienteId);
  if (estagioAtivo) {
    await supabase
      .from('estagios')
      .update({ ativo: false, concluido_em: new Date().toISOString() })
      .eq('id', estagioAtivo.id);
  }

  // Mapeia estágio → status do cliente
  const statusMap: Record<string, string> = {
    recebido:      'recebido',
    onboarding:    'onboarding',
    setup_trafego: 'setup_trafego',
    ativo:         'ativo',
    congelado:     'congelado',
    cancelado:     'cancelado',
    inativo:       'inativo',
  };

  const novoStatus = statusMap[novoEstagio] ?? novoEstagio;
  await atualizarCliente(clienteId, { status: novoStatus as Cliente['status'] });

  // Cria novo estágio
  const novoEsTagioData = await criarEstagio({
    cliente_id: clienteId,
    nome:       novoEstagio,
    acao_label: acaoProxima,
  });

  // Registra no histórico
  await registrarHistorico(
    clienteId,
    'avanco_estagio',
    `Cliente avançou para o estágio "${novoEstagio}". Próxima ação: ${acaoProxima}`,
  );

  return novoEsTagioData;
}

// ============================================================
// ESTAGIOS
// ============================================================

export async function criarEstagio(dados: {
  cliente_id:  string;
  nome:        string;
  acao_label?: string;
  descricao?:  string;
  acao_url?:   string;
  checklist?:  ChecklistItem[];
}): Promise<Estagio> {
  const { data, error } = await supabase
    .from('estagios')
    .insert([{ ...dados, ativo: true }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar estágio: ${error.message}`);
  return data as Estagio;
}

export async function obterEstagioAtivo(clienteId: string): Promise<Estagio | null> {
  const { data, error } = await supabase
    .from('estagios')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('ativo', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Erro ao obter estágio: ${error.message}`);
  return data as Estagio | null;
}

export async function congelarCliente(clienteId: string) {
  const estagioAtivo = await obterEstagioAtivo(clienteId);
  const estagioAnterior = estagioAtivo?.nome ?? 'desconhecido';

  await avancarEstagio(
    clienteId,
    'congelado',
    'Aguardando retorno do cliente. Alerta automático em 48h.',
  );

  // Registrar alerta de 48h na tabela alertas (sem setTimeout — processado por cron)
  const disparaEm = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await supabase.from('alertas').insert({
    cliente_id:   clienteId,
    tipo_alerta:  'pendencia_48h',
    mensagem:     `Cliente sem retorno há 48h. Estava no estágio "${estagioAnterior}". Reativar contato.`,
    dispara_em:   disparaEm.toISOString(),
    disparado:    false,
  });

  await registrarHistorico(
    clienteId,
    'cliente_congelado',
    'Cliente movido para "Retidos". Aguardando resposta. Alerta agendado para 48h.',
  );
}

export async function descongelarCliente(clienteId: string, estagioRetorno: string, acaoProxima: string) {
  // Cancelar alertas pendentes deste cliente
  await supabase
    .from('alertas')
    .update({ disparado: true, data_disparo: new Date().toISOString() })
    .eq('cliente_id', clienteId)
    .eq('tipo_alerta', 'pendencia_48h')
    .eq('disparado', false);

  await avancarEstagio(clienteId, estagioRetorno, acaoProxima);
  await registrarHistorico(clienteId, 'cliente_descongelado', `Cliente descongelado. Retornando ao estágio "${estagioRetorno}".`);
}

// ============================================================
// HISTORICO
// ============================================================

export async function registrarHistorico(
  clienteId:      string,
  tipoAcao:       string,
  descricao:      string,
  valorImpactado?: number,
  metadata?:       Record<string, unknown>,
) {
  const { error } = await supabase.from('historico_acoes').insert({
    cliente_id:      clienteId,
    tipo_acao:       tipoAcao,
    descricao,
    valor_impactado: valorImpactado ?? null,
    metadata:        metadata ?? {},
  });

  if (error) console.error(`[Histórico] Erro ao registrar: ${error.message}`);
}

export async function obterHistoricoCliente(clienteId: string): Promise<HistoricoAcao[]> {
  const { data, error } = await supabase
    .from('historico_acoes')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('data_acao', { ascending: false })
    .limit(50);

  if (error) throw new Error(`Erro ao obter histórico: ${error.message}`);
  return (data ?? []) as HistoricoAcao[];
}

// ============================================================
// ASSINATURAS
// ============================================================

export async function criarAssinatura(dados: {
  cliente_id:              string;
  plano_nome:              string;
  valor_mensal:            number;
  asaas_subscription_id?:  string;
}): Promise<Assinatura> {
  const dataProximaCobranca = new Date();
  dataProximaCobranca.setMonth(dataProximaCobranca.getMonth() + 1);

  const { data, error } = await supabase
    .from('assinaturas')
    .insert([{
      ...dados,
      status: 'ativa',
      dias_atraso: 0,
      data_inicio: new Date().toISOString(),
      data_proxima_cobranca: dataProximaCobranca.toISOString(),
    }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar assinatura: ${error.message}`);

  await registrarHistorico(
    dados.cliente_id,
    'assinatura_criada',
    `Assinatura "${dados.plano_nome}" criada. Valor: R$ ${dados.valor_mensal.toFixed(2)}/mês.`,
    dados.valor_mensal,
  );

  return data as Assinatura;
}

export async function obterAssinaturaCliente(clienteId: string): Promise<Assinatura | null> {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('*')
    .eq('cliente_id', clienteId)
    .maybeSingle();

  if (error) throw new Error(`Erro ao obter assinatura: ${error.message}`);
  return data as Assinatura | null;
}

// ============================================================
// ONBOARD PROGRESSO
// ============================================================

export async function obterProgressoOnboard(clienteId: string): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from('onboard_progresso')
    .select('progresso')
    .eq('cliente_id', clienteId)
    .maybeSingle();

  if (error) throw new Error(`Erro ao obter progresso: ${error.message}`);
  return (data?.progresso ?? {}) as Record<string, boolean>;
}

export async function salvarProgressoOnboard(
  clienteId: string,
  progresso: Record<string, boolean>,
) {
  const { error } = await supabase
    .from('onboard_progresso')
    .upsert({ cliente_id: clienteId, progresso })
    .eq('cliente_id', clienteId);

  if (error) throw new Error(`Erro ao salvar progresso: ${error.message}`);
}

// ============================================================
// ALERTAS
// ============================================================

export async function obterAlertasPendentes(clienteId?: string) {
  let query = supabase
    .from('alertas')
    .select('*, clientes(id, nome, whatsapp)')
    .eq('disparado', false)
    .lte('dispara_em', new Date().toISOString())
    .order('dispara_em', { ascending: true });

  if (clienteId) query = query.eq('cliente_id', clienteId);

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao obter alertas: ${error.message}`);
  return data ?? [];
}
```

### `lib\financeiro.ts`

```typescript
import { supabase } from './supabase';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface DREData {
  receita_bruta:              number;
  custos_fixos:               number;
  custos_variaveis:           number;
  lucro_bruto:                number;
  lucro_liquido:              number;
  margem_liquida_percentual:  number;
  mrr:                        number;
}

export interface ConfigFinanceira {
  custos_fixos_mensais:           number;
  custos_variaveis_percentual:    number;
  margem_lucro_minima:            number;
  saldo_google_ads_limite_alerta: number;
}

export interface ClienteAtrasado {
  cliente: {
    id:       string;
    nome:     string;
    email:    string;
    whatsapp: string;
  };
  dias_atraso:           number;
  valor_devido:          number;
  data_proxima_cobranca: string;
  status_assinatura:     string;
}

export interface ProjecaoMensal {
  mes:               string;
  mes_label:         string;
  receita_projetada: number;
  lucro_projetado:   number;
}

export interface ValidacaoMargem {
  margemAtual:  number;
  margemMinima: number;
  estaOk:       boolean;
  alerta:       string | null;
}

// ─── CALCULAR MRR ────────────────────────────────────────────────────────────

export async function calcularMRR(): Promise<number> {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('valor_mensal')
    .eq('status', 'ativa');
  if (error) throw new Error(`Erro ao calcular MRR: ${error.message}`);
  return (data ?? []).reduce((t, a) => t + Number(a.valor_mensal), 0);
}

// ─── OBTER CONFIG FINANCEIRA ──────────────────────────────────────────────────

export async function obterConfigFinanceira(): Promise<ConfigFinanceira> {
  const { data, error } = await supabase
    .from('configuracoes_financeiras')
    .select('custos_fixos_mensais, custos_variaveis_percentual, margem_lucro_minima, saldo_google_ads_limite_alerta')
    .eq('agencia_id', 'adsgator-main')
    .single();
  if (error) throw new Error(`Erro na config financeira: ${error.message}`);
  return {
    custos_fixos_mensais:           Number(data.custos_fixos_mensais           ?? 0),
    custos_variaveis_percentual:    Number(data.custos_variaveis_percentual    ?? 0),
    margem_lucro_minima:            Number(data.margem_lucro_minima            ?? 30),
    saldo_google_ads_limite_alerta: Number(data.saldo_google_ads_limite_alerta ?? 50),
  };
}

// ─── CALCULAR DRE MENSAL ──────────────────────────────────────────────────────

export async function calcularDREMensal(): Promise<DREData> {
  const [mrr, config] = await Promise.all([calcularMRR(), obterConfigFinanceira()]);

  const custosVariaveis = mrr * (config.custos_variaveis_percentual / 100);
  const lucroBruto      = mrr - custosVariaveis;
  const lucroLiquido    = lucroBruto - config.custos_fixos_mensais;
  const margem          = mrr > 0 ? (lucroLiquido / mrr) * 100 : 0;

  return {
    receita_bruta:             mrr,
    custos_fixos:              config.custos_fixos_mensais,
    custos_variaveis:          custosVariaveis,
    lucro_bruto:               lucroBruto,
    lucro_liquido:             lucroLiquido,
    margem_liquida_percentual: margem,
    mrr,
  };
}

// ─── LISTAR CLIENTES ATRASADOS ────────────────────────────────────────────────

export async function listarClientesAtrasados(): Promise<ClienteAtrasado[]> {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('*, clientes(id, nome, email, whatsapp)')
    .gt('dias_atraso', 0)
    .order('dias_atraso', { ascending: false });
  if (error) throw new Error(`Erro ao listar atrasos: ${error.message}`);
  return (data ?? []).map((a) => ({
    cliente:               a.clientes as ClienteAtrasado['cliente'],
    dias_atraso:           Number(a.dias_atraso),
    valor_devido:          Number(a.valor_mensal),
    data_proxima_cobranca: a.data_proxima_cobranca as string,
    status_assinatura:     a.status as string,
  }));
}

// ─── ATUALIZAR CONFIG FINANCEIRA ──────────────────────────────────────────────

export async function atualizarConfigFinanceira(dados: Partial<ConfigFinanceira>): Promise<void> {
  const { error } = await supabase
    .from('configuracoes_financeiras')
    .update(dados)
    .eq('agencia_id', 'adsgator-main');
  if (error) throw new Error(`Erro ao salvar config: ${error.message}`);
}

// ─── PROJEÇÃO 3 MESES (tendência linear) ─────────────────────────────────────

export async function projetarFinanceiro3Meses(): Promise<ProjecaoMensal[]> {
  const dre = await calcularDREMensal();

  const { data: historico } = await supabase
    .from('relatorios_mensais')
    .select('mes_ano, mrr')
    .order('mes_ano', { ascending: false })
    .limit(6);

  let taxaCrescimento = 0;
  if (historico && historico.length >= 2) {
    const crescimentos: number[] = [];
    for (let i = 0; i < historico.length - 1; i++) {
      const atual    = Number(historico[i].mrr     ?? 0);
      const anterior = Number(historico[i + 1].mrr ?? 0);
      if (anterior > 0) crescimentos.push((atual - anterior) / anterior);
    }
    if (crescimentos.length > 0) {
      taxaCrescimento = crescimentos.reduce((s, v) => s + v, 0) / crescimentos.length;
    }
  }
  taxaCrescimento = Math.max(-0.10, Math.min(0.20, taxaCrescimento));

  const hoje = new Date();
  return Array.from({ length: 3 }).map((_, i) => {
    const mes     = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const fator   = Math.pow(1 + taxaCrescimento, i);
    const receita = dre.mrr * fator;
    const custVar = receita * (dre.mrr > 0 ? dre.custos_variaveis / dre.mrr : 0);
    return {
      mes:               `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`,
      mes_label:         mes.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      receita_projetada: receita,
      lucro_projetado:   receita - custVar - dre.custos_fixos,
    };
  });
}

// ─── VALIDAR MARGEM MÍNIMA ────────────────────────────────────────────────────

export async function validarMargemMinima(): Promise<ValidacaoMargem> {
  const [dre, config] = await Promise.all([calcularDREMensal(), obterConfigFinanceira()]);
  const margemAtual = dre.margem_liquida_percentual;
  return {
    margemAtual,
    margemMinima: config.margem_lucro_minima,
    estaOk: margemAtual >= config.margem_lucro_minima,
    alerta: margemAtual < config.margem_lucro_minima
      ? `Margem atual ${margemAtual.toFixed(1)}% está abaixo do mínimo de ${config.margem_lucro_minima}%`
      : null,
  };
}
```

### `lib\fluxo-operacional.ts`

```typescript
export interface EtapaFluxo {
  id:                 string;
  label:              string;
  descricao:          string;
  corBadge:           string;
  icone:              string;
  instrucao:          string;
  whatsapp_templates: string[];
  checklist?:         ChecklistItem[];
  proximo_estagio?:   string;
  proxima_acao_label: string;
}

export interface ChecklistItem {
  id:    string;
  texto: string;
}

export const FLUXO_OPERACIONAL: Record<string, EtapaFluxo> = {

  recebido: {
    id:                 'recebido',
    label:              'Recebido',
    descricao:          'Pagamento confirmado. Cliente aguarda contato inicial.',
    corBadge:           'bg-status-blue text-white',
    icone:              'Bell',
    instrucao:          'Envie a mensagem de boas-vindas agora com o template #BOASVINDAS. O cliente acabou de pagar e está aguardando.',
    whatsapp_templates: ['#BOASVINDAS'],
    proximo_estagio:    'onboarding',
    proxima_acao_label: 'Boas-vindas enviadas → Ir para Onboarding',
  },

  onboarding: {
    id:                 'onboarding',
    label:              'Onboarding',
    descricao:          'Configuração inicial da conta e estrutura do projeto.',
    corBadge:           'bg-status-purple text-white',
    icone:              'ClipboardList',
    instrucao:          'Conclua o checklist de onboarding abaixo. Envie o #CONVITE para call e o #BRIEFINGGA para coletar informações do negócio.',
    whatsapp_templates: ['#CONVITE', '#BRIEFINGGA'],
    checklist: [
      { id: 'contrato',          texto: 'Contrato enviado e assinado' },
      { id: 'pix-setup',         texto: 'Pix do setup recebido' },
      { id: 'grupo-zap',         texto: 'Grupo criado no WhatsApp com o cliente' },
      { id: 'video-boas-vindas', texto: 'Vídeo de boas-vindas enviado' },
    ],
    proximo_estagio:    'setup_trafego',
    proxima_acao_label: 'Onboarding completo → Ir para Setup de Tráfego',
  },

  setup_trafego: {
    id:                 'setup_trafego',
    label:              'Setup de Tráfego',
    descricao:          'Configuração técnica da conta Google Ads, LP e campanhas.',
    corBadge:           'bg-status-yellow text-black',
    icone:              'Settings2',
    instrucao:          'Siga o checklist técnico abaixo. Conclua todos os itens antes de ativar as campanhas.',
    whatsapp_templates: [],
    checklist: [
      { id: 'acesso-ads',       texto: 'Acesso à conta Google Ads solicitado/concedido' },
      { id: 'pagamento-ads',    texto: 'Pagamento configurado na conta Google Ads' },
      { id: 'publico-alvo',     texto: 'Público-alvo criado e configurado' },
      { id: 'palavras-chave',   texto: 'Palavras-chave negativadas (nível de conta)' },
      { id: 'conversao-ads',    texto: 'Tag de conversão (WhatsApp) criada' },
      { id: 'dominio',          texto: 'Domínio comprado e configurado' },
      { id: 'lp-criada',        texto: 'Landing page criada e publicada' },
      { id: 'tag-geral',        texto: 'Tag geral do Google instalada na LP' },
      { id: 'tag-conversao',    texto: 'Tag de conversão instalada na LP' },
      { id: 'teste-fluxo',      texto: 'Fluxo completo (Anúncio → LP → WhatsApp) testado' },
      { id: 'campanha-criada',  texto: 'Campanha criada e estruturada' },
      { id: 'anuncios-criados', texto: 'Anúncios criados (mínimo 3 variações)' },
      { id: 'revisao-final',    texto: 'Revisão final de orçamento, locais e palavras-chave' },
      { id: 'campanha-ativa',   texto: '🚀 Campanha ATIVADA' },
    ],
    proximo_estagio:    'ativo',
    proxima_acao_label: 'Campanha no ar → Cliente Ativo',
  },

  ativo: {
    id:                 'ativo',
    label:              'Ativo',
    descricao:          'Campanha rodando. Gestão contínua e otimizações.',
    corBadge:           'bg-brand text-white',
    icone:              'TrendingUp',
    instrucao:          'Cliente ativo. Monitore o saldo, verifique as métricas semanalmente e otimize as campanhas. Use #SALDOGOOGLE quando o saldo estiver crítico.',
    whatsapp_templates: ['#SALDOGOOGLE'],
    proximo_estagio:    undefined,
    proxima_acao_label: '',
  },

  congelado: {
    id:                 'congelado',
    label:              'Retido',
    descricao:          'Aguardando retorno do cliente. Alerta automático em 48h.',
    corBadge:           'bg-status-orange text-white',
    icone:              'PauseCircle',
    instrucao:          'Este cliente está aguardando sua resposta. O sistema alertará automaticamente em 48h se não houver movimento.',
    whatsapp_templates: [],
    proximo_estagio:    undefined,
    proxima_acao_label: '',
  },

  cancelado: {
    id:                 'cancelado',
    label:              'Cancelado',
    descricao:          'Contrato encerrado. Ações de desativação necessárias.',
    corBadge:           'bg-status-red text-white',
    icone:              'XCircle',
    instrucao:          'Cliente cancelado. Remova a Landing Page do ar, delete os assets do Storage e encerre as campanhas no Google Ads.',
    whatsapp_templates: [],
    proximo_estagio:    undefined,
    proxima_acao_label: '',
  },
};

export const ORDEM_ESTAGIOS = ['recebido', 'onboarding', 'setup_trafego', 'ativo'] as const;

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

### `lib\google-ads.ts`

```typescript
import { GoogleAdsApi } from 'google-ads-api';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface DadosCampanhaAds {
  campanha_id:     string;
  campanha_nome:   string;
  status:          string;
  impressoes:      number;
  cliques:         number;
  ctr:             number;
  custo_total:     number;
  conversoes:      number;
  cpa:             number;
  roas:            number;
}

export interface PalavraChavePerformance {
  keyword:     string;
  impressoes:  number;
  cliques:     number;
  ctr:         number;
  cpc_medio:   number;
  conversoes:  number;
  custo:       number;
}

// ─── CLIENTE GOOGLE ADS ───────────────────────────────────────────────────────

function criarClienteAds() {
  return new GoogleAdsApi({
    client_id:       process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret:   process.env.GOOGLE_ADS_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  });
}

// ─── OBTER DADOS DE CAMPANHAS ─────────────────────────────────────────────────

export async function obterDadosCampanhasAds(
  customerId:  string,
  mesAno:      string,  // formato: YYYY-MM
): Promise<DadosCampanhaAds[]> {
  const [ano, mes] = mesAno.split('-').map(Number);
  const primeiroDia = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia   = new Date(ano, mes, 0);
  const ultimoDiaStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;

  try {
    const client   = criarClienteAds();
    const customer = client.Customer({
      customer_id:   customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
    });

    const results = await customer.query(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.cost_micros,
        metrics.conversions,
        metrics.cost_per_conversion
      FROM campaign
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
        AND campaign.status != 'REMOVED'
    `);

    return results.map((r: Record<string, any>) => {
      const custo      = (r.metrics?.cost_micros ?? 0) / 1_000_000;
      const conversoes = r.metrics?.conversions ?? 0;
      const cliques    = r.metrics?.clicks      ?? 0;
      const impressoes = r.metrics?.impressions  ?? 0;

      return {
        campanha_id:   String(r.campaign?.id ?? ''),
        campanha_nome: String(r.campaign?.name ?? ''),
        status:        String(r.campaign?.status ?? ''),
        impressoes,
        cliques,
        ctr:           impressoes > 0 ? (cliques / impressoes) * 100 : 0,
        custo_total:   custo,
        conversoes,
        cpa:           conversoes > 0 ? custo / conversoes : 0,
        roas:          custo > 0 ? conversoes / custo : 0,
      };
    });
  } catch (error) {
    console.error('Erro ao obter campanhas Google Ads:', error);
    return [];
  }
}

// ─── OBTER PALAVRAS-CHAVE ─────────────────────────────────────────────────────

export async function obterPalavrasChavePerformance(
  customerId: string,
  mesAno:     string,
): Promise<PalavraChavePerformance[]> {
  const [ano, mes] = mesAno.split('-').map(Number);
  const primeiroDia  = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia    = new Date(ano, mes, 0);
  const ultimoDiaStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;

  try {
    const client   = criarClienteAds();
    const customer = client.Customer({
      customer_id:   customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
    });

    const results = await customer.query(`
      SELECT
        ad_group_criterion.keyword.text,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions,
        metrics.cost_micros
      FROM keyword_view
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
        AND ad_group_criterion.status != 'REMOVED'
      ORDER BY metrics.clicks DESC
      LIMIT 20
    `);

    return results.map((r: Record<string, any>) => ({
      keyword:    String(r.ad_group_criterion?.keyword?.text ?? ''),
      impressoes: r.metrics?.impressions    ?? 0,
      cliques:    r.metrics?.clicks         ?? 0,
      ctr:        (r.metrics?.ctr           ?? 0) * 100,
      cpc_medio:  (r.metrics?.average_cpc   ?? 0) / 1_000_000,
      conversoes: r.metrics?.conversions    ?? 0,
      custo:      (r.metrics?.cost_micros   ?? 0) / 1_000_000,
    }));
  } catch (error) {
    console.error('Erro ao obter palavras-chave:', error);
    return [];
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// NOVAS FUNÇÕES PARA ANALYTICS PREMIUM
// ═════════════════════════════════════════════════════════════════════════════

// ─── 1. TERMOS DE PESQUISA ────────────────────────────────────────────────────

export interface TermoPesquisa {
  termo:       string;
  impressoes:  number;
  cliques:     number;
  ctr:         number;
  conversoes:  number;
  custo:       number;
}

export async function obterTermosPesquisa(
  customerId: string,
  mesAno:     string,
): Promise<TermoPesquisa[]> {
  const [ano, mes] = mesAno.split('-').map(Number);
  const primeiroDia  = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia    = new Date(ano, mes, 0);
  const ultimoDiaStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;

  try {
    const client   = criarClienteAds();
    const customer = client.Customer({
      customer_id:   customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
    });

    const results = await customer.query(`
      SELECT
        search_term_view.search_term,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.conversions,
        metrics.cost_micros
      FROM search_term_view
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
      ORDER BY metrics.clicks DESC
      LIMIT 50
    `);

    return results.map((r: Record<string, any>) => ({
      termo:      String(r.search_term_view?.search_term ?? ''),
      impressoes: r.metrics?.impressions ?? 0,
      cliques:    r.metrics?.clicks       ?? 0,
      ctr:        (r.metrics?.ctr         ?? 0) * 100,
      conversoes: r.metrics?.conversions  ?? 0,
      custo:      (r.metrics?.cost_micros ?? 0) / 1_000_000,
    }));
  } catch (error) {
    console.error('Erro ao obter termos de pesquisa:', error);
    return [];
  }
}

// ─── 2. DEMOGRAFIA (IDADE E GÊNERO) ───────────────────────────────────────────

export interface DemografiaDados {
  faixa_etaria: string;
  genero:       string;
  impressoes:   number;
  cliques:      number;
  conversoes:   number;
  custo:        number;
}

export async function obterDemografia(
  customerId: string,
  mesAno:     string,
): Promise<DemografiaDados[]> {
  const [ano, mes] = mesAno.split('-').map(Number);
  const primeiroDia  = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia    = new Date(ano, mes, 0);
  const ultimoDiaStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;

  try {
    const client   = criarClienteAds();
    const customer = client.Customer({
      customer_id:   customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
    });

    const results = await customer.query(`
      SELECT
        ad_group_criterion.age_range.type,
        ad_group_criterion.gender.type,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros
      FROM age_range_view
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
    `);

    return results.map((r: Record<string, any>) => ({
      faixa_etaria: String(r.ad_group_criterion?.age_range?.type ?? ''),
      genero:       String(r.ad_group_criterion?.gender?.type ?? ''),
      impressoes:   r.metrics?.impressions ?? 0,
      cliques:      r.metrics?.clicks       ?? 0,
      conversoes:   r.metrics?.conversions  ?? 0,
      custo:        (r.metrics?.cost_micros ?? 0) / 1_000_000,
    }));
  } catch (error) {
    console.error('Erro ao obter demografia:', error);
    return [];
  }
}

// ─── 3. GEOGRAFIA (REGIÕES) ────────────────────────────────────────────────────

export interface GeografiaDados {
  pais:        string;
  estado:      string;
  cidade:      string;
  impressoes:  number;
  cliques:     number;
  conversoes:  number;
  custo:       number;
}

export async function obterGeografia(
  customerId: string,
  mesAno:     string,
): Promise<GeografiaDados[]> {
  const [ano, mes] = mesAno.split('-').map(Number);
  const primeiroDia  = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia    = new Date(ano, mes, 0);
  const ultimoDiaStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;

  try {
    const client   = criarClienteAds();
    const customer = client.Customer({
      customer_id:   customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
    });

    const results = await customer.query(`
      SELECT
        geographic_view.country_criterion_id,
        geographic_view.location_name,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros
      FROM geographic_view
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
      ORDER BY metrics.clicks DESC
      LIMIT 20
    `);

    return results.map((r: Record<string, any>) => ({
      pais:       'Brasil',
      estado:     String(r.geographic_view?.location_name ?? '').split(',')[0]?.trim() ?? '',
      cidade:     String(r.geographic_view?.location_name ?? '').split(',')[1]?.trim() ?? '',
      impressoes: r.metrics?.impressions ?? 0,
      cliques:    r.metrics?.clicks       ?? 0,
      conversoes: r.metrics?.conversions  ?? 0,
      custo:      (r.metrics?.cost_micros ?? 0) / 1_000_000,
    }));
  } catch (error) {
    console.error('Erro ao obter geografia:', error);
    return [];
  }
}

// ─── 4. DISPOSITIVOS ──────────────────────────────────────────────────────────

export interface DeviceDados {
  device:      string;
  impressoes:  number;
  cliques:     number;
  ctr:         number;
  conversoes:  number;
  custo:       number;
}

export async function obterDevice(
  customerId: string,
  mesAno:     string,
): Promise<DeviceDados[]> {
  const [ano, mes] = mesAno.split('-').map(Number);
  const primeiroDia  = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia    = new Date(ano, mes, 0);
  const ultimoDiaStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;

  try {
    const client   = criarClienteAds();
    const customer = client.Customer({
      customer_id:   customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
    });

    const results = await customer.query(`
      SELECT
        segments.device,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.conversions,
        metrics.cost_micros
      FROM campaign
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
    `);

    const agrupado = new Map<string, { impressoes: number; cliques: number; conversoes: number; custo: number }>();

    for (const r of results) {
      const device = String(r.segments?.device ?? 'UNKNOWN');
      const atual = agrupado.get(device) ?? { impressoes: 0, cliques: 0, conversoes: 0, custo: 0 };
      agrupado.set(device, {
        impressoes: atual.impressoes + (r.metrics?.impressions ?? 0),
        cliques:    atual.cliques    + (r.metrics?.clicks       ?? 0),
        conversoes: atual.conversoes + (r.metrics?.conversions  ?? 0),
        custo:      atual.custo      + ((r.metrics?.cost_micros ?? 0) / 1_000_000),
      });
    }

    return Array.from(agrupado.entries()).map(([device, dados]) => ({
      device,
      impressoes: dados.impressoes,
      cliques:    dados.cliques,
      ctr:        dados.impressoes > 0 ? (dados.cliques / dados.impressoes) * 100 : 0,
      conversoes: dados.conversoes,
      custo:      dados.custo,
    }));
  } catch (error) {
    console.error('Erro ao obter dispositivos:', error);
    return [];
  }
}

// ─── 5. HORÁRIO/DIA DA SEMANA ─────────────────────────────────────────────────

export interface HorarioDados {
  dia_semana:  string;
  hora:        number;
  impressoes:  number;
  cliques:     number;
  conversoes:  number;
  custo:       number;
}

export async function obterHorario(
  customerId: string,
  mesAno:     string,
): Promise<HorarioDados[]> {
  const [ano, mes] = mesAno.split('-').map(Number);
  const primeiroDia  = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia    = new Date(ano, mes, 0);
  const ultimoDiaStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;

  try {
    const client   = criarClienteAds();
    const customer = client.Customer({
      customer_id:   customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
    });

    const results = await customer.query(`
      SELECT
        segments.day_of_week,
        segments.hour,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros
      FROM campaign
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
    `);

    const agrupado = new Map<string, { impressoes: number; cliques: number; conversoes: number; custo: number }>();

    for (const r of results) {
      const chave = `${r.segments?.day_of_week ?? ''}-${r.segments?.hour ?? 0}`;
      const atual = agrupado.get(chave) ?? { impressoes: 0, cliques: 0, conversoes: 0, custo: 0 };
      agrupado.set(chave, {
        impressoes: atual.impressoes + (r.metrics?.impressions ?? 0),
        cliques:    atual.cliques    + (r.metrics?.clicks       ?? 0),
        conversoes: atual.conversoes + (r.metrics?.conversions  ?? 0),
        custo:      atual.custo      + ((r.metrics?.cost_micros ?? 0) / 1_000_000),
      });
    }

    return Array.from(agrupado.entries()).map(([chave, dados]) => {
      const [dia, hora] = chave.split('-');
      return {
        dia_semana: dia,
        hora:       parseInt(hora, 10),
        impressoes: dados.impressoes,
        cliques:    dados.cliques,
        conversoes: dados.conversoes,
        custo:      dados.custo,
      };
    });
  } catch (error) {
    console.error('Erro ao obter horário:', error);
    return [];
  }
}
```

### `lib\google-analytics.ts`

```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface DadosGA4 {
  sessoes:                number;
  usuarios_novos:         number;
  visualizacoes_pagina:   number;
  taxa_engajamento:       number;
  duracao_media_sessao:   number;
  taxa_rejeicao:          number;
  conversoes:             number;
  valor_conversao_total:  number;
}

export interface PaginaPerformance {
  pagina:               string;
  visualizacoes:        number;
  usuarios_unicos:      number;
  taxa_engajamento:     number;
  tempo_medio_segundos: number;
}

export interface FonteTrafego {
  fonte:             string;
  midia:             string;
  sessoes:           number;
  conversoes:        number;
  taxa_conversao:    number;
}

// ─── CLIENTE GA4 ─────────────────────────────────────────────────────────────
// O SDK lê GOOGLE_APPLICATION_CREDENTIALS automaticamente do ambiente.

function criarClienteGA4() {
  return new BetaAnalyticsDataClient();
}

function intervaloMes(mesAno: string): { startDate: string; endDate: string } {
  const [ano, mes] = mesAno.split('-').map(Number);
  const ultimoDia  = new Date(ano, mes, 0).getDate();
  return {
    startDate: `${ano}-${String(mes).padStart(2, '0')}-01`,
    endDate:   `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`,
  };
}

// ─── MÉTRICAS GA4 ────────────────────────────────────────────────────────────

export async function obterDadosGA4(
  propertyId: string,
  mesAno:     string,
): Promise<DadosGA4> {
  const { startDate, endDate } = intervaloMes(mesAno);

  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions'             },
        { name: 'newUsers'             },
        { name: 'screenPageViews'      },
        { name: 'engagementRate'       },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate'           },
        { name: 'conversions'          },
        { name: 'totalRevenue'         },
      ],
    });

    const row = response?.rows?.[0]?.metricValues ?? [];
    const val = (i: number) => parseFloat(row[i]?.value ?? '0');

    return {
      sessoes:               val(0),
      usuarios_novos:        val(1),
      visualizacoes_pagina:  val(2),
      taxa_engajamento:      val(3) * 100,
      duracao_media_sessao:  val(4),
      taxa_rejeicao:         val(5) * 100,
      conversoes:            val(6),
      valor_conversao_total: val(7),
    };
  } catch (error) {
    console.error('Erro ao obter dados GA4:', error);
    return {
      sessoes: 0, usuarios_novos: 0, visualizacoes_pagina: 0,
      taxa_engajamento: 0, duracao_media_sessao: 0,
      taxa_rejeicao: 0, conversoes: 0, valor_conversao_total: 0,
    };
  }
}

// ─── TOP PÁGINAS ─────────────────────────────────────────────────────────────

export async function obterPaginasTopPerformance(
  propertyId: string,
  mesAno:     string,
): Promise<PaginaPerformance[]> {
  const { startDate, endDate } = intervaloMes(mesAno);

  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews'      },
        { name: 'activeUsers'          },
        { name: 'engagementRate'       },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    });

    return (response?.rows ?? []).map((row: Record<string, any>) => ({
      pagina:               row.dimensionValues?.[0]?.value ?? '/',
      visualizacoes:        parseFloat(row.metricValues?.[0]?.value ?? '0'),
      usuarios_unicos:      parseFloat(row.metricValues?.[1]?.value ?? '0'),
      taxa_engajamento:     parseFloat(row.metricValues?.[2]?.value ?? '0') * 100,
      tempo_medio_segundos: parseFloat(row.metricValues?.[3]?.value ?? '0'),
    }));
  } catch (error) {
    console.error('Erro ao obter páginas GA4:', error);
    return [];
  }
}

// ─── FONTES DE TRÁFEGO ────────────────────────────────────────────────────────

export async function obterFontesTrafego(
  propertyId: string,
  mesAno:     string,
): Promise<FonteTrafego[]> {
  const { startDate, endDate } = intervaloMes(mesAno);

  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [
        { name: 'sessions'    },
        { name: 'conversions' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    });

    return (response?.rows ?? []).map((row: Record<string, any>) => {
      const sessoes    = parseFloat(row.metricValues?.[0]?.value ?? '0');
      const conversoes = parseFloat(row.metricValues?.[1]?.value ?? '0');
      return {
        fonte:          row.dimensionValues?.[0]?.value ?? '(direct)',
        midia:          row.dimensionValues?.[1]?.value ?? '(none)',
        sessoes,
        conversoes,
        taxa_conversao: sessoes > 0 ? (conversoes / sessoes) * 100 : 0,
      };
    });
  } catch (error) {
    console.error('Erro ao obter fontes GA4:', error);
    return [];
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// NOVAS FUNÇÕES PARA ANALYTICS PREMIUM
// ═════════════════════════════════════════════════════════════════════════════

// ─── GEOGRAFIA GA4 ───────────────────────────────────────────────────────────

export interface GeoGA4 {
  pais:        string;
  estado:      string;
  cidade:      string;
  sessoes:     number;
  usuarios:    number;
  taxa_engajamento: number;
}

export async function obterGeoGA4(
  propertyId: string,
  mesAno:     string,
): Promise<GeoGA4[]> {
  const { startDate, endDate } = intervaloMes(mesAno);

  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'country'   },
        { name: 'region'    },
        { name: 'city'      },
      ],
      metrics: [
        { name: 'sessions'       },
        { name: 'activeUsers'    },
        { name: 'engagementRate' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 20,
    });

    return (response?.rows ?? []).map((row: Record<string, any>) => ({
      pais:        row.dimensionValues?.[0]?.value ?? '',
      estado:      row.dimensionValues?.[1]?.value ?? '',
      cidade:      row.dimensionValues?.[2]?.value ?? '',
      sessoes:     parseFloat(row.metricValues?.[0]?.value ?? '0'),
      usuarios:    parseFloat(row.metricValues?.[1]?.value ?? '0'),
      taxa_engajamento: parseFloat(row.metricValues?.[2]?.value ?? '0') * 100,
    }));
  } catch (error) {
    console.error('Erro ao obter geo GA4:', error);
    return [];
  }
}

// ─── DISPOSITIVOS GA4 ────────────────────────────────────────────────────────

export interface DeviceGA4 {
  device:           string;
  sistema_operacional: string;
  sessoes:          number;
  usuarios:         number;
  taxa_engajamento: number;
}

export async function obterDeviceGA4(
  propertyId: string,
  mesAno:     string,
): Promise<DeviceGA4[]> {
  const { startDate, endDate } = intervaloMes(mesAno);

  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'deviceCategory' },
        { name: 'operatingSystem' },
      ],
      metrics: [
        { name: 'sessions'       },
        { name: 'activeUsers'    },
        { name: 'engagementRate' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    });

    return (response?.rows ?? []).map((row: Record<string, any>) => ({
      device:           row.dimensionValues?.[0]?.value ?? '',
      sistema_operacional: row.dimensionValues?.[1]?.value ?? '',
      sessoes:          parseFloat(row.metricValues?.[0]?.value ?? '0'),
      usuarios:         parseFloat(row.metricValues?.[1]?.value ?? '0'),
      taxa_engajamento: parseFloat(row.metricValues?.[2]?.value ?? '0') * 100,
    }));
  } catch (error) {
    console.error('Erro ao obter device GA4:', error);
    return [];
  }
}
```

### `lib\manifesto-generator.ts`

```typescript
import { BIBLIOTECA_COMPONENTES } from './astro-components';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface PaletaCores {
  primaria:    string;
  secundaria:  string;
  backgrounds: string[];
}

export interface ManifestoProducao {
  titulo:                   string;
  nicho:                    string;
  paleta_cores:             PaletaCores;
  estilo:                   string;
  direcao_arte:             string;
  estrutura_pagina:         string;
  componentes_selecionados: string[];
  copy_por_secao:           Record<string, string>;
  notas_desenvolvimento:    string[];
  data_geracao:             string;
}

// ─── GERAÇÃO ─────────────────────────────────────────────────────────────────

export function gerarManifestoProducao(
  nomeCliente:       string,
  nicho:             string,
  paletaCores:       PaletaCores,
  estilo:            string,
  direcaoArte:       string,
  componentesIds:    string[],
  copyPorSecao:      Record<string, string>,
): ManifestoProducao {
  const componentes = BIBLIOTECA_COMPONENTES.filter((c) => componentesIds.includes(c.id));
  const estrutura   = componentes.map((c, i) => `${i + 1}. ${c.nome} (${c.id})`).join('\n');

  return {
    titulo:                   nomeCliente,
    nicho,
    paleta_cores:             paletaCores,
    estilo,
    direcao_arte:             direcaoArte,
    estrutura_pagina:         estrutura,
    componentes_selecionados: componentesIds,
    copy_por_secao:           copyPorSecao,
    notas_desenvolvimento: [
      `Landing page para ${nomeCliente} — Nicho: ${nicho}`,
      `Estilo: ${estilo}`,
      `Direção de arte: ${direcaoArte || 'não especificada'}`,
      'OBRIGATORIEDADE: Usar unidade REM em todos os espaçamentos',
      'OBRIGATORIEDADE: Proibido px em qualquer circunstância',
      'Usar apenas ícones SVG inline ou Lucide (vazados)',
      'Borders finas zinc-800 no tema escuro',
      'Suporte a Dark/Light theme obrigatório',
      'Mobile-first: breakpoints sm → md → lg',
    ],
    data_geracao: new Date().toISOString(),
  };
}

// ─── EXPORTAÇÃO MARKDOWN ─────────────────────────────────────────────────────

export function exportarManifestoMarkdown(m: ManifestoProducao): string {
  const data = new Date(m.data_geracao).toLocaleDateString('pt-BR');
  const copySections = Object.entries(m.copy_por_secao)
    .map(([secao, copy]) => `### ${secao}\n\`\`\`\n${copy}\n\`\`\``)
    .join('\n\n');

  return `# Manifesto de Produção: ${m.titulo}

**Data de Geração:** ${data}

---

## 📋 Contexto Estratégico

| Campo | Valor |
|---|---|
| Cliente | ${m.titulo} |
| Nicho | ${m.nicho} |
| Estilo Visual | ${m.estilo} |
| Direção de Arte | ${m.direcao_arte || '—'} |

---

## 🎨 Paleta de Cores

\`\`\`css
:root {
  --color-primary:   ${m.paleta_cores.primaria};
  --color-secondary: ${m.paleta_cores.secundaria};
${m.paleta_cores.backgrounds.map((bg, i) => `  --bg-${i + 1}: ${bg};`).join('\n')}
}
\`\`\`

---

## 📐 Estrutura da Landing Page

\`\`\`
${m.estrutura_pagina}
\`\`\`

---

## ✍️ Copy por Seção

${copySections || '_Nenhuma copy definida._'}

---

## 🔧 Notas de Desenvolvimento

${m.notas_desenvolvimento.map((n) => `- ${n}`).join('\n')}

---

## ✅ Checklist de QA

- [ ] Tema Dark/Light funcionando em todas as seções
- [ ] Todos os espaçamentos em REM (nenhum px)
- [ ] Ícones SVG/Lucide carregando corretamente
- [ ] Responsividade testada (mobile, tablet, desktop)
- [ ] Copy alinhada ao manifesto
- [ ] Performance Lighthouse 90+
- [ ] Acessibilidade WCAG AA
- [ ] Cross-browser (Chrome, Firefox, Safari, Edge)

---

*Gerado automaticamente pelo Adsgator Hub em ${data}*
`;
}

// ─── DOWNLOAD ────────────────────────────────────────────────────────────────

export function downloadManifestoMD(manifesto: ManifestoProducao): void {
  const conteudo = exportarManifestoMarkdown(manifesto);
  const blob     = new Blob([conteudo], { type: 'text/markdown' });
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement('a');
  a.href         = url;
  a.download     = `manifesto_${manifesto.titulo.replace(/\s+/g, '_').toLowerCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
```

### `lib\rbac.ts`

```typescript
// ─── RBAC (Role-Based Access Control) ─────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'analyst' | 'viewer'

export type Permission =
  // Clientes
  | 'clientes:read' | 'clientes:create' | 'clientes:update' | 'clientes:delete'
  // Analytics
  | 'analytics:read' | 'analytics:export'
  // Financeiro
  | 'financeiro:read' | 'financeiro:write' | 'financeiro:admin'
  // Tarefas
  | 'tarefas:read' | 'tarefas:create' | 'tarefas:update' | 'tarefas:delete'
  // Configurações
  | 'config:read' | 'config:write'
  // Usuários (RBAC)
  | 'users:read' | 'users:manage'
  // Audit
  | 'audit:read'

// Mapeamento de papéis para permissões
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'clientes:read', 'clientes:create', 'clientes:update', 'clientes:delete',
    'analytics:read', 'analytics:export',
    'financeiro:read', 'financeiro:write', 'financeiro:admin',
    'tarefas:read', 'tarefas:create', 'tarefas:update', 'tarefas:delete',
    'config:read', 'config:write',
    'users:read', 'users:manage',
    'audit:read',
  ],
  manager: [
    'clientes:read', 'clientes:create', 'clientes:update',
    'analytics:read', 'analytics:export',
    'financeiro:read', 'financeiro:write',
    'tarefas:read', 'tarefas:create', 'tarefas:update', 'tarefas:delete',
    'config:read',
    'users:read',
    'audit:read',
  ],
  analyst: [
    'clientes:read',
    'analytics:read', 'analytics:export',
    'financeiro:read',
    'tarefas:read', 'tarefas:create', 'tarefas:update',
    'config:read',
  ],
  viewer: [
    'clientes:read',
    'analytics:read',
    'tarefas:read',
    'config:read',
  ],
}

// Verificar se usuário tem permissão
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

// Verificar se usuário tem alguma das permissões
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => ROLE_PERMISSIONS[role].includes(p))
}

// Verificar se usuário tem todas as permissões
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => ROLE_PERMISSIONS[role].includes(p))
}

// Obter todas as permissões de um papel
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}

// Labels para papéis (UI)
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  analyst: 'Analista',
  viewer: 'Visualizador',
}

// Descrições para papéis
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Acesso total ao sistema, incluindo gerenciamento de usuários',
  manager: 'Pode gerenciar clientes, tarefas e financeiro',
  analyst: 'Acesso a analytics e tarefas operacionais',
  viewer: 'Somente visualização de dados',
}
```

### `lib\relatorio-generator.ts`

```typescript
import { supabase } from './supabase';
import type { DadosCampanhaAds, PalavraChavePerformance } from './google-ads';
import type { DadosGA4, PaginaPerformance, FonteTrafego } from './google-analytics';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface RelatorioMensalInput {
  cliente_id: string;
  mes_ano:    string;
  campanhas:  DadosCampanhaAds[];
  keywords:   PalavraChavePerformance[];
  ga4:        DadosGA4;
  paginas:    PaginaPerformance[];
  fontes:     FonteTrafego[];
}

export interface RecomendacaoAuto {
  tipo:      'otimizacao' | 'alerta' | 'oportunidade';
  titulo:    string;
  descricao: string;
}

// ─── RECOMENDAÇÕES AUTOMÁTICAS ────────────────────────────────────────────────

export function gerarRecomendacoes(
  campanhas: DadosCampanhaAds[],
  ga4:       DadosGA4,
): RecomendacaoAuto[] {
  const recomendacoes: RecomendacaoAuto[] = [];

  const custoTotal    = campanhas.reduce((s, c) => s + c.custo_total, 0);
  const conversoesAds = campanhas.reduce((s, c) => s + c.conversoes, 0);
  const ctrMedio      = campanhas.length > 0
    ? campanhas.reduce((s, c) => s + c.ctr, 0) / campanhas.length
    : 0;

  if (ctrMedio < 2) {
    recomendacoes.push({
      tipo:      'alerta',
      titulo:    'CTR abaixo do esperado',
      descricao: `CTR médio de ${ctrMedio.toFixed(2)}% está abaixo de 2%. Revisar títulos e descrições dos anúncios.`,
    });
  }

  if (custoTotal > 0 && conversoesAds === 0) {
    recomendacoes.push({
      tipo:      'alerta',
      titulo:    'Sem conversões registradas',
      descricao: 'Verificar configuração de conversão no Google Ads e na landing page.',
    });
  }

  if (ga4.taxa_rejeicao > 70) {
    recomendacoes.push({
      tipo:      'alerta',
      titulo:    `Taxa de rejeição alta: ${ga4.taxa_rejeicao.toFixed(1)}%`,
      descricao: 'Landing page pode estar com carregamento lento ou copy desalinhada com o anúncio.',
    });
  }

  if (ga4.taxa_engajamento > 55) {
    recomendacoes.push({
      tipo:      'oportunidade',
      titulo:    'Alto engajamento no site',
      descricao: `Taxa de engajamento de ${ga4.taxa_engajamento.toFixed(1)}% — considere aumentar orçamento das campanhas de maior CTR.`,
    });
  }

  if (ctrMedio > 5) {
    recomendacoes.push({
      tipo:      'oportunidade',
      titulo:    'CTR excelente',
      descricao: `CTR médio de ${ctrMedio.toFixed(2)}% indica forte relevância. Escalar orçamento pode trazer mais conversões.`,
    });
  }

  return recomendacoes;
}

// ─── GERAR MARKDOWN DO RELATÓRIO ─────────────────────────────────────────────

export function gerarMarkdownRelatorio(
  nomeCliente:  string,
  mesAno:       string,
  campanhas:    DadosCampanhaAds[],
  keywords:     PalavraChavePerformance[],
  ga4:          DadosGA4,
  paginas:      PaginaPerformance[],
  fontes:       FonteTrafego[],
): string {
  const [ano, mes] = mesAno.split('-').map(Number);
  const nomeMes    = new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const recomendacoes = gerarRecomendacoes(campanhas, ga4);

  const custoTotal    = campanhas.reduce((s, c) => s + c.custo_total, 0);
  const conversoesAds = campanhas.reduce((s, c) => s + c.conversoes, 0);
  const cpaGeral      = conversoesAds > 0 ? custoTotal / conversoesAds : 0;
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const tabelaCampanhas = campanhas.length > 0
    ? `| Campanha | Impressões | Cliques | CTR | Custo | Conv. |\n|---|---|---|---|---|---|\n` +
      campanhas.map((c) =>
        `| ${c.campanha_nome} | ${c.impressoes.toLocaleString()} | ${c.cliques.toLocaleString()} | ${c.ctr.toFixed(2)}% | ${fmt(c.custo_total)} | ${c.conversoes} |`
      ).join('\n')
    : '_Nenhuma campanha ativa no período._';

  const tabelaKeywords = keywords.length > 0
    ? `| Palavra-chave | Cliques | CTR | CPC Médio | Conv. |\n|---|---|---|---|---|\n` +
      keywords.slice(0, 10).map((k) =>
        `| ${k.keyword} | ${k.cliques} | ${k.ctr.toFixed(2)}% | ${fmt(k.cpc_medio)} | ${k.conversoes} |`
      ).join('\n')
    : '_Sem dados de palavras-chave._';

  const tabelaPaginas = paginas.length > 0
    ? `| Página | Visualizações | Usuários Únicos | Engajamento |\n|---|---|---|---|\n` +
      paginas.slice(0, 10).map((p) =>
        `| ${p.pagina} | ${p.visualizacoes.toLocaleString()} | ${p.usuarios_unicos.toLocaleString()} | ${p.taxa_engajamento.toFixed(1)}% |`
      ).join('\n')
    : '_Sem dados de páginas._';

  const recomendacoesTexto = recomendacoes.length > 0
    ? recomendacoes.map((r) => `### ${r.tipo === 'alerta' ? '⚠️' : '✅'} ${r.titulo}\n${r.descricao}`).join('\n\n')
    : '_Nenhuma recomendação automática gerada._';

  return `# Relatório de Performance — ${nomeCliente}
**Período:** ${nomeMes}
**Gerado em:** ${new Date().toLocaleDateString('pt-BR')}

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---|---|
| Investimento Google Ads | ${fmt(custoTotal)} |
| Conversões (Ads) | ${conversoesAds} |
| CPA Médio | ${cpaGeral > 0 ? fmt(cpaGeral) : 'N/A'} |
| Sessões (GA4) | ${ga4.sessoes.toLocaleString()} |
| Novos Usuários | ${ga4.usuarios_novos.toLocaleString()} |
| Taxa de Engajamento | ${ga4.taxa_engajamento.toFixed(1)}% |
| Taxa de Rejeição | ${ga4.taxa_rejeicao.toFixed(1)}% |

---

## 🎯 Google Ads — Campanhas

${tabelaCampanhas}

---

## 🔑 Top Palavras-chave

${tabelaKeywords}

---

## 🌐 Google Analytics 4 — Top Páginas

${tabelaPaginas}

---

## 💡 Recomendações Automáticas

${recomendacoesTexto}

---

*Relatório gerado automaticamente pelo Adsgator Hub*
`;
}

// ─── SALVAR RELATÓRIO NO SUPABASE ─────────────────────────────────────────────

export async function gerarRelatorioMensal(
  dados: RelatorioMensalInput,
  nomeCliente: string,
): Promise<void> {
  const markdown = gerarMarkdownRelatorio(
    nomeCliente,
    dados.mes_ano,
    dados.campanhas,
    dados.keywords,
    dados.ga4,
    dados.paginas,
    dados.fontes,
  );

  const campanhaAgregada = dados.campanhas[0];
  const custoTotal       = dados.campanhas.reduce((s, c) => s + c.custo_total, 0);
  const conversoesAds    = dados.campanhas.reduce((s, c) => s + c.conversoes, 0);

  const { error } = await supabase
    .from('relatorios_mensais')
    .upsert({
      cliente_id:          dados.cliente_id,
      mes_ano:             dados.mes_ano,
      status_geracao:      'gerado',
      investimento_ads:    custoTotal,
      conversoes:          conversoesAds,
      roi:                 custoTotal > 0 ? conversoesAds / custoTotal : 0,
      sessoes_ga4:         dados.ga4.sessoes,
      usuarios_novos:      dados.ga4.usuarios_novos,
      taxa_engajamento:    dados.ga4.taxa_engajamento,
      conteudo_markdown:   markdown,
      dados_campanhas:     dados.campanhas,
      dados_ga4:           dados.ga4,
    }, { onConflict: 'cliente_id,mes_ano' });

  if (error) throw new Error(`Erro ao salvar relatório: ${error.message}`);
}
```

### `lib\supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error('[Adsgator] NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias.');
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Cliente server-side (Edge Functions / API Routes que precisam bypassar RLS)
export function criarClienteServiceRole() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('[Adsgator] SUPABASE_SERVICE_ROLE_KEY não definida.');
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
```

### `lib\types.ts`

```typescript
// ─── STATUS TYPES ─────────────────────────────────────────────────────────────

export type ClienteStatus =
  | 'recebido'
  | 'onboarding'
  | 'setup_trafego'
  | 'ativo'
  | 'congelado'
  | 'cancelado_debito'
  | 'cancelado'
  | 'inativo'

export type AssinaturaStatus =
  | 'ativa'
  | 'atraso_7_dias'
  | 'atraso_15_dias'
  | 'cancelado_debito'

// ─── CHECKLIST ────────────────────────────────────────────────────────────────

export interface ChecklistItem {
  item: string
  done: boolean
}

// ─── CLIENTE ──────────────────────────────────────────────────────────────────

export interface Cliente {
  id:              string
  user_id:         string
  nome:            string
  email?:          string
  whatsapp?:       string
  nicho?:          string
  dominio?:        string
  website?:        string
  status:          ClienteStatus
  mrr?:            number
  plano?:          string
  asaas_id?:       string
  dias_atraso:     number
  data_vencimento?: string
  // Google Ads
  google_ads_id?:  string
  google_ads_customer_id?: string | null
  google_ads_enabled?:     boolean
  // GA4
  ga4_property_id?:        string | null
  ga4_enabled?:            boolean
  // Outras integrações
  gmb_id?:          string
  looker_url?:      string
  saldo_google?:    number
  congelado_em?:    string
  data_criacao?:    string
  data_atualizacao?: string
}

// ─── ESTAGIO ──────────────────────────────────────────────────────────────────

export interface Estagio {
  id:           string
  cliente_id:   string
  nome:         string
  descricao?:   string
  acao_label?:  string
  acao_url?:    string
  checklist?:   ChecklistItem[]
  ativo:        boolean
  concluido_em?: string
  created_at?:  string
}

// ─── NOTIFICACAO ──────────────────────────────────────────────────────────────

export interface Notificacao {
  id:           string
  user_id:      string
  cliente_id?:  string
  tipo:         'urgente' | 'atencao' | 'info' | 'sucesso' | 'alerta'
  titulo:       string
  mensagem?:    string
  acao_label?:  string
  acao_url?:    string
  lida:         boolean
  lida_em?:     string
  created_at:   string
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

export interface AnalyticsSnapshot {
  id:             string
  cliente_id:     string
  fonte:          'google_ads' | 'ga4'
  periodo_inicio: string
  periodo_fim:    string
  investimento?:  number
  impressoes?:    number
  cliques?:       number
  ctr?:           number
  conversoes?:    number  // aceita decimais: 0.5, 1.5 — CORRETO por data-driven
  cpa?:           number
  roas?:          number
  cpc_medio?:     number
  usuarios?:      number
  sessoes?:       number
  taxa_conversao?: number
  insight_ia?:    string
  created_at:     string
}

// ─── FINANCEIRO ───────────────────────────────────────────────────────────────

export interface FinanceiroLancamento {
  id:           string
  user_id:      string
  cliente_id?:  string
  tipo:         'receita' | 'custo_fixo' | 'custo_variavel'
  categoria?:   string
  descricao:    string
  valor:        number
  data:         string
  status:       'pendente' | 'confirmado' | 'cancelado'
  asaas_payment_id?: string
  created_at:   string
}

// ─── RELATORIO ────────────────────────────────────────────────────────────────

export interface Relatorio {
  id:          string
  user_id:     string
  cliente_id?: string
  tipo:        string
  titulo:      string
  conteudo_md: string
  created_at:  string
}

// ─── LEGACY TYPES (backward compat — páginas antigas) ─────────────────────────

export interface Assinatura {
  id:                     string
  cliente_id:             string
  plano_nome:             string
  valor_mensal:           number
  status:                 AssinaturaStatus
  data_inicio:            string
  data_proxima_cobranca:  string
  asaas_subscription_id:  string | null
  dias_atraso:            number
  created_at:             string
  updated_at:             string
}

export interface HistoricoAcao {
  id:              string
  cliente_id:      string
  tipo_acao:       string
  descricao:       string
  valor_impactado: number | null
  usuario_id:      string | null
  data_acao:       string
  metadata:        Record<string, unknown>
}

export interface CustoDetalhe {
  id:        string
  nome:      string
  valor:     number
  tipo:      'fixo' | 'variavel'
  descricao: string | null
  ativo:     boolean
}

export interface ConfigFinanceira {
  id:                             string
  agencia_id:                     string
  custos_fixos_mensais:           number
  custos_variaveis_percentual:    number
  margem_lucro_minima:            number
  saldo_google_ads_limite_alerta: number
  tipo_tributacao?:               string
  imposto_percentual?:            number
}

export interface OnboardProgresso {
  cliente_id: string
  progresso:  Record<string, boolean>
  updated_at: string
}

// ─── TAREFA ───────────────────────────────────────────────────────────────────

export type TarefaPrioridade = 'critico' | 'alto' | 'normal' | 'baixo'
export type TarefaStatus     = 'pendente' | 'em_progresso' | 'feito' | 'adiado'

export interface Tarefa {
  id:              string
  user_id:         string
  cliente_id?:     string
  titulo:          string
  descricao?:      string
  prioridade:      TarefaPrioridade
  status:          TarefaStatus
  data_prazo?:     string
  responsavel_id?: string
  checklist?:      ChecklistItem[]
  created_at:      string
  updated_at:      string
}

// ─── MEMÓRIA DE CLIENTES ──────────────────────────────────────────────────────

export interface MemoriaCliente {
  id:          string
  cliente_id:  string
  conteudo_md: string
  versao:      number
  updated_at:  string
}

// ─── CONFIGURAÇÃO DO USUÁRIO ──────────────────────────────────────────────────

export interface ConfiguracaoUsuario {
  id:           string
  user_id:      string
  preferencias: Record<string, unknown>
  notif_config: Record<string, unknown>
  created_at:   string
  updated_at:   string
}

// ─── API KEY ──────────────────────────────────────────────────────────────────

export interface ApiKey {
  id:         string
  user_id:    string
  nome:       string
  chave_hash: string
  ativo:      boolean
  ultimo_uso?: string
  created_at: string
}

// ─── CHAT MENSAGEM (IA Contextual) ────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMensagem {
  id:         string
  role:       ChatRole
  content:    string
  created_at: string
}

// ─────────────────────────────────────────────────────────────────────────────

export interface RelatorioMensal {
  id:               string
  cliente_id:       string
  mes_ano:          string
  mrr:              number | null
  investimento_ads: number | null
  conversoes:       number | null
  cpa:              number | null
  cliques:          number | null
  impressoes:       number | null
  ctr:              number | null
  sessoes_ga4:      number | null
  novos_usuarios:   number | null
  taxa_engajamento: number | null
  roi:              number | null
  markdown_content: string | null
  status_geracao:   'pendente' | 'processando' | 'completo' | 'erro'
  created_at:       string
}
```

### `lib\utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### `lib\vertex-ai.ts`

```typescript
import { VertexAI } from '@google-cloud/vertexai';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface CopyGerada {
  headline:    string;
  subtitulo:   string;
  cta:         string;
  descricao:   string;
  keywords:    string[];
}

export interface AnaliseRelatorio {
  resumo_executivo: string;
  pontos_positivos: string[];
  pontos_atencao:   string[];
  recomendacoes:    string[];
  proximo_passo:    string;
}

// ─── CLIENTE VERTEX AI ────────────────────────────────────────────────────────

function criarVertexAI() {
  return new VertexAI({
    project:  process.env.VERTEX_AI_PROJECT_ID!,
    location: process.env.VERTEX_AI_LOCATION ?? 'us-central1',
    googleAuthOptions: {
      keyFilename: process.env.VERTEX_AI_CREDENTIALS,
    },
  });
}

export const MODELO_PRO   = 'gemini-2.5-pro'
export const MODELO_FLASH = 'gemini-2.5-flash'
export const MODELO_LITE  = 'gemini-2.5-flash-lite'

// ─── GERAR COPY PARA LANDING PAGE ────────────────────────────────────────────

export async function gerarCopyLandingPage(
  nomeCliente:   string,
  nicho:         string,
  estilo:        string,
  direcaoArte:   string,
  publicoAlvo?:  string,
): Promise<CopyGerada> {
  const prompt = `Você é um copywriter especialista em landing pages para pequenas e médias empresas brasileiras.

Gere copy persuasiva para uma landing page com as seguintes informações:
- Cliente: ${nomeCliente}
- Nicho: ${nicho}
- Estilo visual: ${estilo}
- Direção de arte: ${direcaoArte || 'não especificada'}
${publicoAlvo ? `- Público-alvo: ${publicoAlvo}` : ''}

Retorne APENAS um JSON válido com esta estrutura (sem markdown, sem explicações):
{
  "headline": "título principal impactante em até 8 palavras",
  "subtitulo": "frase de apoio que explica o benefício em 1-2 frases",
  "cta": "texto do botão de ação com verbo (ex: Agendar Consulta)",
  "descricao": "parágrafo de 2-3 frases para a seção Sobre",
  "keywords": ["5 palavras-chave relevantes para SEO"]
}`;

  try {
    const vertex  = criarVertexAI();
    const model   = vertex.preview.getGenerativeModel({ model: MODELO_FLASH });
    const result  = await model.generateContent(prompt);
    const text    = result.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    return JSON.parse(text.trim()) as CopyGerada;
  } catch (error) {
    console.error('Erro ao gerar copy:', error);
    return {
      headline:  `${nomeCliente} — ${nicho}`,
      subtitulo: 'Soluções profissionais para o seu negócio.',
      cta:       'Falar com Especialista',
      descricao: `Especialistas em ${nicho} com foco em resultados reais.`,
      keywords:  [nicho, nomeCliente, 'profissional', 'qualidade', 'resultados'],
    };
  }
}

// ─── ANALISAR RELATÓRIO DE PERFORMANCE ───────────────────────────────────────

export async function analisarRelatorioIA(
  nomeCliente:      string,
  mesAno:           string,
  investimento:     number,
  conversoes:       number,
  sessoes:          number,
  taxaEngajamento:  number,
  taxaRejeicao:     number,
  roi:              number,
): Promise<AnaliseRelatorio> {
  const [ano, mes] = mesAno.split('-').map(Number);
  const nomeMes    = new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const fmt        = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const prompt = `Você é um analista de marketing digital sênior especializado em Google Ads e Analytics.

Analise os dados de performance do cliente "${nomeCliente}" referente a ${nomeMes}:

- Investimento Google Ads: ${fmt(investimento)}
- Conversões: ${conversoes}
- ROI: ${roi.toFixed(2)}x
- Sessões no site: ${sessoes.toLocaleString('pt-BR')}
- Taxa de Engajamento: ${taxaEngajamento.toFixed(1)}%
- Taxa de Rejeição: ${taxaRejeicao.toFixed(1)}%

Retorne APENAS um JSON válido (sem markdown, sem explicações):
{
  "resumo_executivo": "parágrafo de 2-3 frases com o resumo do mês",
  "pontos_positivos": ["até 3 pontos positivos"],
  "pontos_atencao": ["até 3 pontos que precisam de atenção"],
  "recomendacoes": ["3 recomendações práticas e específicas"],
  "proximo_passo": "a ação mais importante a tomar no próximo mês"
}`;

  try {
    const vertex  = criarVertexAI();
    const model   = vertex.preview.getGenerativeModel({ model: MODELO_PRO });
    const result  = await model.generateContent(prompt);
    const text    = result.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    return JSON.parse(text.trim()) as AnaliseRelatorio;
  } catch (error) {
    console.error('Erro ao analisar relatório com IA:', error);
    return {
      resumo_executivo: `Análise de ${nomeMes} para ${nomeCliente}.`,
      pontos_positivos: [],
      pontos_atencao:   [],
      recomendacoes:    [],
      proximo_passo:    'Revisar configurações de conversão e copy dos anúncios.',
    };
  }
}
```

### `lib\hooks\useClientes.ts`

```typescript
'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Cliente, Estagio } from '@/lib/types'

export type ClienteComEstagio = {
  cliente: Cliente
  estagio: Estagio | null
}

export function useClientes() {
  const [dados,   setDados]   = useState<ClienteComEstagio[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: clientes, error: errClientes } = await supabase
        .from('clientes')
        .select('*')
        .neq('status', 'cancelado')
        .order('data_criacao', { ascending: false })

      if (errClientes) throw new Error(errClientes.message)

      const lista = (clientes ?? []) as Cliente[]

      if (lista.length === 0) {
        setDados([])
        return
      }

      const ids = lista.map((c) => c.id)
      const { data: estagios } = await supabase
        .from('estagios')
        .select('*')
        .in('cliente_id', ids)
        .eq('ativo', true)

      const estagiosPorCliente = new Map<string, Estagio>()
      for (const e of (estagios ?? []) as Estagio[]) {
        if (!estagiosPorCliente.has(e.cliente_id)) {
          estagiosPorCliente.set(e.cliente_id, e)
        }
      }

      const comEstagio: ClienteComEstagio[] = lista.map((c) => ({
        cliente: c,
        estagio: estagiosPorCliente.get(c.id) ?? null,
      }))

      setDados(comEstagio)
    } catch (err) {
      console.error('[useClientes]', err)
      setError('Erro ao carregar clientes.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── REALTIME SUBSCRIPTION ────────────────────────────────────────────
  useEffect(() => {
    carregar()

    const channel = supabase
      .channel('clientes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => carregar())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estagios' }, () => carregar())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [carregar])

  // ── MÉTRICAS DERIVADAS ───────────────────────────────────────────────
  const metricas = {
    total:        dados.length,
    ativos:       dados.filter((d) => d.cliente.status === 'ativo').length,
    retidos:      dados.filter((d) => d.cliente.status === 'congelado').length,
    recebidos:    dados.filter((d) => d.cliente.status === 'recebido').length,
    onboarding:   dados.filter((d) => d.cliente.status === 'onboarding').length,
    inadimplentes: dados.filter((d) => (d.cliente.dias_atraso ?? 0) > 0).length,
    mrr:          dados.reduce((s, d) => s + (d.cliente.mrr ?? 0), 0),
    taxaRetencao: dados.length > 0
      ? Math.round((dados.filter((d) => d.cliente.status === 'ativo').length / dados.length) * 100)
      : 0,
  }

  return { dados, loading, error, metricas, recarregar: carregar }
}
```

### `lib\hooks\usePermissoes.ts`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase }            from '@/lib/supabase'

export type Papel = 'proprietario' | 'gerenciador' | 'analista' | 'viewer'

export type Acao =
  | 'editar_cliente'
  | 'excluir_cliente'
  | 'ver_financeiro'
  | 'editar_financeiro'
  | 'configurar'
  | 'ver_relatorios'
  | 'criar_tarefa'
  | 'ver_marketing'
  | 'gerenciar_equipe'

const PERMISSOES: Record<Papel, Acao[]> = {
  proprietario: [
    'editar_cliente', 'excluir_cliente',
    'ver_financeiro', 'editar_financeiro',
    'configurar', 'ver_relatorios',
    'criar_tarefa', 'ver_marketing', 'gerenciar_equipe',
  ],
  gerenciador: [
    'editar_cliente',
    'ver_financeiro', 'editar_financeiro',
    'configurar', 'ver_relatorios',
    'criar_tarefa', 'ver_marketing',
  ],
  analista: [
    'editar_cliente',
    'ver_financeiro',
    'ver_relatorios',
    'criar_tarefa',
    'ver_marketing',
  ],
  viewer: [
    'ver_financeiro',
    'ver_relatorios',
  ],
}

export function usePermissoes() {
  const [papel, setPapel] = useState<Papel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase
        .from('equipe_membros')
        .select('papel')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          setPapel((data?.papel as Papel | null) ?? 'proprietario')
          setLoading(false)
        })
    })
  }, [])

  function hasPermission(acao: Acao): boolean {
    if (!papel) return false
    return PERMISSOES[papel].includes(acao)
  }

  return { papel, loading, hasPermission }
}
```

### `lib\store\right-sidebar-context.tsx`

```tsx
'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface RightSidebarAction {
  id: string
  icon: LucideIcon
  label: string
  onClick: () => void
}

interface RightSidebarContextValue {
  contextActions: RightSidebarAction[]
  setContextActions: (actions: RightSidebarAction[]) => void
  clearContextActions: () => void
  activeDrawer: string | null
  openDrawer: (id: string) => void
  closeDrawer: () => void
}

const RightSidebarContext = createContext<RightSidebarContextValue | null>(null)

export function RightSidebarProvider({ children }: { children: ReactNode }) {
  const [contextActions, setContextActionsState] = useState<RightSidebarAction[]>([])
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null)

  const setContextActions = useCallback((actions: RightSidebarAction[]) => {
    setContextActionsState(actions)
  }, [])

  const clearContextActions = useCallback(() => {
    setContextActionsState([])
  }, [])

  const openDrawer = useCallback((id: string) => {
    setActiveDrawer((prev) => (prev === id ? null : id))
  }, [])

  const closeDrawer = useCallback(() => {
    setActiveDrawer(null)
  }, [])

  return (
    <RightSidebarContext.Provider
      value={{ contextActions, setContextActions, clearContextActions, activeDrawer, openDrawer, closeDrawer }}
    >
      {children}
    </RightSidebarContext.Provider>
  )
}

export function useRightSidebar() {
  const ctx = useContext(RightSidebarContext)
  if (!ctx) throw new Error('useRightSidebar must be used within RightSidebarProvider')
  return ctx
}
```

### `lib\store\useAppStore.ts`

```typescript
import { create } from 'zustand'
import type { Notificacao } from '@/lib/types'

interface ConfiguracoesUsuario {
  tema:     'dark' | 'light' | 'system'
  idioma:   string
  timezone: string
}

interface AppStore {
  // ── Notificações ─────────────────────────────────────────────
  notificacoes:          Notificacao[]
  setNotificacoes:       (ns: Notificacao[]) => void
  adicionarNotificacao:  (n: Notificacao)    => void
  marcarLida:            (id: string)        => void
  marcarTodasLidas:      ()                  => void

  // ── Alertas críticos (Dashboard + NotificationBell) ───────────
  alertasCriticos:     string[]
  setAlertasCriticos:  (a: string[]) => void

  // ── Configurações do usuário ──────────────────────────────────
  configuracoes: ConfiguracoesUsuario
  setConfiguracoes: (c: Partial<ConfiguracoesUsuario>) => void
}

export const useAppStore = create<AppStore>((set) => ({
  // Notificações
  notificacoes:    [],
  setNotificacoes: (ns)  => set({ notificacoes: ns }),
  adicionarNotificacao: (n) =>
    set((s) => ({ notificacoes: [n, ...s.notificacoes].slice(0, 50) })),
  marcarLida: (id) =>
    set((s) => ({ notificacoes: s.notificacoes.filter((n) => n.id !== id) })),
  marcarTodasLidas: () => set({ notificacoes: [] }),

  // Alertas críticos
  alertasCriticos:    [],
  setAlertasCriticos: (a) => set({ alertasCriticos: a }),

  // Configurações
  configuracoes: { tema: 'dark', idioma: 'pt-BR', timezone: 'America/Sao_Paulo' },
  setConfiguracoes: (c) =>
    set((s) => ({ configuracoes: { ...s.configuracoes, ...c } })),
}))
```

### `lib\supabase\client.ts`

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true, autoRefreshToken: true } }
  )
}
```

### `providers\ThemeProvider.tsx`

```tsx
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
  const [theme,  setThemeState] = useState<Theme>('light');
  const [isDark, setIsDark]     = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem('adsgator-theme') as Theme) ?? 'light';
    aplicarTema(saved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

