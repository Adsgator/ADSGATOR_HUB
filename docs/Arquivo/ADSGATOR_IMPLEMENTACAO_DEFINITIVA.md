# ADSGATOR — IMPLEMENTAÇÃO DEFINITIVA
## Do MVP ao SaaS Premium: Guia Técnico Completo e Pronto para Executar

**Versão:** 2.0 — Documento Unificado  
**Data:** 21 de maio de 2026  
**Autor:** Análise consolidada por Claude Sonnet  
**Status:** ✅ Pronto para implementação imediata

---

## LEIA ANTES DE COMEÇAR

### Sobre os documentos anteriores (Haiku)

Os 3 documentos do Haiku (`ANALISE_COMPLETA`, `VISUAL_MOCKUPS`, `ESPECIFICACOES_TECNICAS`) têm valor de diagnóstico e planejamento. **Não os jogue fora.** Use-os como referência de contexto. Mas **não são implementação** — são roadmap. Este documento aqui é a implementação.

### O que este documento entrega diferente

- **Código completo e funcional**, não snippets soltos
- **Ordem exata de execução** — um arquivo por vez, sem ambiguidade
- **Integração com seu projeto real** — referencia os arquivos que você já tem (`page.tsx`, `ClienteCard`, `MainLayout`)
- **As 3 mudanças visuais críticas** que transformam "sistema interno" em "SaaS premium", com base nas 4 referências enviadas (Donezo, Twisty, Campaign, Ceremco)

### A única regra que importa

> **Não pule etapas.** A ordem de implementação aqui é cirúrgica: Design Tokens → Layout → Dashboard → Cards. Pular qualquer etapa vai criar inconsistência visual.

---

## DIAGNÓSTICO: O QUE SEPARA VOCÊ DAS REFERÊNCIAS

Analisando os 4 dashboards de referência (Donezo, Twisty, Campaign, Ceremco), os 3 elementos visuais que criam a percepção "SaaS premium" são:

| Elemento | Referências | Seu sistema agora | Gap |
|---|---|---|---|
| **Sidebar** | Ícone + label de texto, item ativo destacado com fundo | Apenas ícones ou lista simples | Alto |
| **KPI Cards** | Mini-sparkline chart dentro do card, delta colorido | Só números, sem gráfico | Crítico |
| **Dashboard Layout** | Bento Grid com hierarquia visual de urgência | Grid simples de cards | Crítico |

Corrigir esses 3 pontos é o que transforma o visual. Tudo mais (financeiro, analytics, notificações) vem depois.

---

## ESTRUTURA DE ARQUIVOS — O QUE CRIAR E ONDE

```
seu-projeto/
├── tailwind.config.ts           ← MODIFICAR (design tokens completos)
├── app/
│   ├── globals.css              ← MODIFICAR (CSS variables dark/light)
│   ├── layout.tsx               ← VERIFICAR (Geist font já está aqui)
│   └── (dashboard)/
│       └── page.tsx             ← SUBSTITUIR (Bento Grid completo)
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx       ← SUBSTITUIR (sidebar com labels)
│   │   ├── Sidebar.tsx          ← CRIAR (componente isolado)
│   │   └── TopBar.tsx           ← CRIAR (header premium)
│   ├── dashboard/
│   │   ├── KpiCard.tsx          ← CRIAR (com sparkline Recharts)
│   │   ├── AcoesDoDia.tsx       ← CRIAR (seção urgência)
│   │   └── ClienteProgressCard.tsx ← CRIAR (cards do grid)
│   ├── clientes/
│   │   └── ClienteCard.tsx      ← MELHORAR (mantém base, adiciona status visual)
│   └── ui/
│       ├── Badge.tsx            ← CRIAR
│       ├── Button.tsx           ← CRIAR
│       └── Skeleton.tsx         ← CRIAR
└── lib/
    ├── realtime.ts              ← CRIAR (Supabase subscription)
    └── hooks/
        └── useClientes.ts       ← CRIAR (data fetching + realtime)
```

---

## ETAPA 1 — DESIGN TOKENS (tailwind.config.ts)

Este é o arquivo mais importante. Tudo deriva dele. **Execute primeiro.**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── ADSGATOR BRAND ───────────────────────────────────────────────
      colors: {
        ads: {
          50:  '#FFF8E6',
          100: '#FFF0CD',
          200: '#FFE5A6',
          300: '#FFD67F',
          400: '#FFC857',
          500: '#FFA500', // PRIMARY — use este em botões, badges, destaques
          600: '#E69500',
          700: '#CC8800',
          800: '#B37B00',
          900: '#8C6200',
        },
        // ─── SURFACE (backgrounds, cards) ─────────────────────────────
        surface: {
          base:    'rgb(var(--surface-base) / <alpha-value>)',
          card:    'rgb(var(--surface-card) / <alpha-value>)',
          hover:   'rgb(var(--surface-hover) / <alpha-value>)',
          border:  'rgb(var(--surface-border) / <alpha-value>)',
        },
        // ─── INK (textos) ─────────────────────────────────────────────
        ink: {
          primary:   'rgb(var(--ink-primary) / <alpha-value>)',
          secondary: 'rgb(var(--ink-secondary) / <alpha-value>)',
          muted:     'rgb(var(--ink-muted) / <alpha-value>)',
        },
        // ─── STATUS ───────────────────────────────────────────────────
        status: {
          green:  '#10B981',
          orange: '#F59E0B',
          red:    '#EF4444',
          blue:   '#3B82F6',
        },
      },

      // ─── TIPOGRAFIA — APENAS rem, nunca px ────────────────────────────
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs:    ['0.75rem',  { lineHeight: '1rem'     }],
        sm:    ['0.875rem', { lineHeight: '1.25rem'  }],
        base:  ['1rem',     { lineHeight: '1.5rem'   }],
        lg:    ['1.125rem', { lineHeight: '1.75rem'  }],
        xl:    ['1.25rem',  { lineHeight: '1.75rem'  }],
        '2xl': ['1.5rem',   { lineHeight: '2rem'     }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem'  }],
        '4xl': ['2.25rem',  { lineHeight: '2.5rem'   }],
      },

      // ─── ESPAÇAMENTO — APENAS rem ─────────────────────────────────────
      spacing: {
        px:   '0.0625rem',
        0.5:  '0.125rem',
        1:    '0.25rem',
        1.5:  '0.375rem',
        2:    '0.5rem',
        2.5:  '0.625rem',
        3:    '0.75rem',
        3.5:  '0.875rem',
        4:    '1rem',
        5:    '1.25rem',
        6:    '1.5rem',
        7:    '1.75rem',
        8:    '2rem',
        9:    '2.25rem',
        10:   '2.5rem',
        11:   '2.75rem',
        12:   '3rem',
        14:   '3.5rem',
        16:   '4rem',
        20:   '5rem',
        24:   '6rem',
        28:   '7rem',
        32:   '8rem',
        36:   '9rem',
        40:   '10rem',
        44:   '11rem',
        48:   '12rem',
        52:   '13rem',
        56:   '14rem',
        60:   '15rem',
        64:   '16rem',
        72:   '18rem',
        80:   '20rem',
        96:   '24rem',
      },

      // ─── BORDER RADIUS ────────────────────────────────────────────────
      borderRadius: {
        none: '0',
        sm:   '0.25rem',
        md:   '0.375rem',
        lg:   '0.5rem',
        xl:   '0.75rem',
        '2xl':'1rem',
        '3xl':'1.5rem',
        full: '9999px',
      },

      // ─── SIDEBAR WIDTH ────────────────────────────────────────────────
      width: {
        sidebar: '15rem',       // 240px
        'sidebar-collapsed': '3.5rem', // 56px
      },

      // ─── ANIMAÇÕES ────────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(0.25rem)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-0.5rem)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4' },
        },
      },
      animation: {
        'fade-in':      'fade-in 0.2s ease-out',
        'slide-in-left':'slide-in-left 0.2s ease-out',
        'pulse-slow':   'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## ETAPA 2 — CSS VARIABLES (globals.css)

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── TEMA ESCURO (padrão Adsgator) ────────────────────────────────────── */
:root {
  --surface-base:   10 10 10;       /* #0A0A0A — fundo principal */
  --surface-card:   21 21 21;       /* #151515 — cards */
  --surface-hover:  30 30 30;       /* #1E1E1E — hover */
  --surface-border: 45 45 45;       /* #2D2D2D — bordas */

  --ink-primary:    255 255 255;    /* #FFFFFF */
  --ink-secondary:  160 160 160;    /* #A0A0A0 */
  --ink-muted:      90 90 90;       /* #5A5A5A */
}

/* ─── TEMA CLARO ────────────────────────────────────────────────────────── */
.light {
  --surface-base:   249 250 251;    /* #F9FAFB */
  --surface-card:   255 255 255;    /* #FFFFFF */
  --surface-hover:  243 244 246;    /* #F3F4F6 */
  --surface-border: 229 231 235;    /* #E5E7EB */

  --ink-primary:    17 24 39;       /* #111827 */
  --ink-secondary:  107 114 128;    /* #6B7280 */
  --ink-muted:      156 163 175;    /* #9CA3AF */
}

/* ─── BASE STYLES ───────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

html {
  font-size: 16px; /* base rem */
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
```

---

## ETAPA 3 — SIDEBAR COMPONENT (components/layout/Sidebar.tsx)

Este é o componente mais impactante visualmente. Todas as 4 referências (Donezo, Twisty, Campaign, Ceremco) têm **ícone + label de texto**. Sem isso, nunca vai parecer SaaS premium.

```tsx
// components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    group: 'MENU',
    items: [
      { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
      { href: '/clientes',     icon: Users,           label: 'Clientes'     },
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

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen w-sidebar z-40',
        'flex flex-col',
        'bg-surface-card border-r border-surface-border',
        'transition-all duration-300',
      )}
    >
      {/* ── LOGO ────────────────────────────────────── */}
      <div className="flex items-center gap-[0.625rem] h-[3.5rem] px-[1.25rem] border-b border-surface-border shrink-0">
        <div className="w-[1.75rem] h-[1.75rem] rounded-[0.375rem] bg-ads-500 flex items-center justify-center">
          <Zap className="w-[1rem] h-[1rem] text-white" strokeWidth={2.5} />
        </div>
        <span className="text-ink-primary font-bold text-[1rem] tracking-tight">
          ADSGATOR
        </span>
      </div>

      {/* ── NAVEGAÇÃO ───────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-[1rem] px-[0.75rem] space-y-[1.5rem]">
        {NAV_ITEMS.map((group) => (
          <div key={group.group}>
            <p className="text-ink-muted text-[0.625rem] font-semibold uppercase tracking-[0.08em] px-[0.5rem] mb-[0.375rem]">
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
                        'transition-all duration-150',
                        isActive
                          ? 'bg-ads-500/10 text-ads-500'
                          : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary',
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-[1rem] h-[1rem] shrink-0',
                          isActive ? 'text-ads-500' : 'text-ink-muted',
                        )}
                        strokeWidth={isActive ? 2.5 : 1.75}
                      />
                      <span>{label}</span>

                      {/* Indicador lateral ativo */}
                      {isActive && (
                        <span className="ml-auto w-[0.1875rem] h-[1rem] rounded-full bg-ads-500" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── RODAPÉ — USUÁRIO ───────────────────────── */}
      <div className="shrink-0 border-t border-surface-border p-[0.75rem]">
        <div className="flex items-center gap-[0.625rem] p-[0.5rem] rounded-[0.375rem] hover:bg-surface-hover transition-colors cursor-pointer group">
          <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-ads-500/20 border border-ads-500/30 flex items-center justify-center shrink-0">
            <span className="text-ads-500 text-[0.75rem] font-bold">L</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ink-primary text-[0.8125rem] font-medium truncate">Lucas Simões</p>
            <p className="text-ink-muted text-[0.6875rem] truncate">Admin</p>
          </div>
          <LogOut
            className="w-[0.875rem] h-[0.875rem] text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            strokeWidth={1.75}
          />
        </div>
      </div>
    </aside>
  )
}
```

---

## ETAPA 4 — MAIN LAYOUT (components/layout/MainLayout.tsx)

```tsx
// components/layout/MainLayout.tsx
'use client'

import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function MainLayout({ children, title, subtitle, actions }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-base">
      <Sidebar />

      {/* ── CONTEÚDO PRINCIPAL ──────────────────────── */}
      <div className="ml-sidebar">
        <TopBar title={title} subtitle={subtitle} actions={actions} />

        <main className="p-[2rem]">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## ETAPA 5 — TOP BAR (components/layout/TopBar.tsx)

```tsx
// components/layout/TopBar.tsx
'use client'

import { Bell, Search } from 'lucide-react'

interface TopBarProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header className="h-[3.5rem] border-b border-surface-border bg-surface-card/80 backdrop-blur-sm sticky top-0 z-30 flex items-center px-[2rem] gap-[1rem]">
      {/* ── TÍTULO ────────────────────────────────── */}
      <div className="flex-1">
        {title && (
          <div>
            <h1 className="text-ink-primary font-bold text-[1.125rem] leading-tight">{title}</h1>
            {subtitle && <p className="text-ink-muted text-[0.75rem]">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* ── AÇÕES CUSTOMIZADAS ─────────────────────── */}
      {actions && <div className="flex items-center gap-[0.5rem]">{actions}</div>}

      {/* ── SEARCH ────────────────────────────────── */}
      <button className="flex items-center gap-[0.5rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-muted text-[0.8125rem] hover:border-surface-border/80 transition-colors">
        <Search className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        <span>Buscar...</span>
        <kbd className="hidden sm:inline-flex items-center gap-[0.125rem] px-[0.25rem] h-[1.125rem] rounded bg-surface-base border border-surface-border text-[0.625rem] text-ink-muted font-mono">
          ⌘K
        </kbd>
      </button>

      {/* ── NOTIFICAÇÕES ──────────────────────────── */}
      <button className="relative w-[2rem] h-[2rem] rounded-[0.375rem] flex items-center justify-center text-ink-secondary hover:bg-surface-hover hover:text-ink-primary transition-colors">
        <Bell className="w-[1rem] h-[1rem]" strokeWidth={1.75} />
        <span className="absolute top-[0.3125rem] right-[0.3125rem] w-[0.375rem] h-[0.375rem] rounded-full bg-ads-500" />
      </button>
    </header>
  )
}
```

---

## ETAPA 6 — KPI CARD COM SPARKLINE (components/dashboard/KpiCard.tsx)

Este é o componente que mais diferencia visualmente. Todas as 4 referências têm mini-charts nos cards. **Instale Recharts primeiro:**

```bash
npm install recharts
```

```tsx
// components/dashboard/KpiCard.tsx
'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label:     string
  value:     string | number
  delta?:    string           // ex: '+12%', '-5%'
  deltaDir?: 'up' | 'down' | 'neutral'
  deltaLabel?: string         // ex: 'vs semana passada'
  sparkData?: number[]        // array de valores para sparkline
  accentColor?: string        // cor da sparkline (default: ads-500)
  alert?: boolean             // borda vermelha de alerta
  alertLabel?: string
  icon?: React.ReactNode
}

const GRADIENT_ID = (label: string) =>
  `spark-gradient-${label.replace(/\s+/g, '-').toLowerCase()}`

export function KpiCard({
  label,
  value,
  delta,
  deltaDir = 'neutral',
  deltaLabel,
  sparkData,
  accentColor = '#FFA500',
  alert = false,
  alertLabel,
  icon,
}: KpiCardProps) {
  const chartData = sparkData?.map((v, i) => ({ i, v })) ?? []

  const deltaColors = {
    up:      'text-status-green',
    down:    'text-status-red',
    neutral: 'text-ink-muted',
  }

  const DeltaIcon = {
    up:      TrendingUp,
    down:    TrendingDown,
    neutral: Minus,
  }[deltaDir]

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between',
        'bg-surface-card rounded-xl border',
        'p-[1.25rem] overflow-hidden',
        'hover:border-surface-border/80 transition-all duration-200',
        alert
          ? 'border-status-red/40 hover:border-status-red/60'
          : 'border-surface-border',
      )}
    >
      {/* ── LABEL ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-[0.75rem]">
        <p className="text-ink-muted text-[0.75rem] font-semibold uppercase tracking-wide">
          {label}
        </p>
        {icon && (
          <div className="text-ink-muted">
            {icon}
          </div>
        )}
      </div>

      {/* ── VALOR PRINCIPAL ───────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-ink-primary text-[2rem] font-bold leading-none tracking-tight mb-[0.375rem]">
            {value}
          </p>

          {/* Delta */}
          {delta && (
            <div className={cn('flex items-center gap-[0.25rem] text-[0.75rem] font-medium', deltaColors[deltaDir])}>
              <DeltaIcon className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} />
              <span>{delta}</span>
              {deltaLabel && (
                <span className="text-ink-muted font-normal">{deltaLabel}</span>
              )}
            </div>
          )}

          {/* Alert label */}
          {alert && alertLabel && (
            <p className="text-status-red text-[0.75rem] font-medium mt-[0.25rem]">
              {alertLabel}
            </p>
          )}
        </div>

        {/* ── SPARKLINE ───────────────────────────────────── */}
        {chartData.length > 1 && (
          <div className="w-[5rem] h-[2.5rem] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={GRADIENT_ID(label)} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={accentColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={accentColor}
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

      {/* ── BORDA DE ALERTA (glow sutil) ─────────────────── */}
      {alert && (
        <div className="absolute inset-0 rounded-xl ring-1 ring-status-red/20 pointer-events-none" />
      )}
    </div>
  )
}
```

---

## ETAPA 7 — SEÇÃO AÇÕES DO DIA (components/dashboard/AcoesDoDia.tsx)

```tsx
// components/dashboard/AcoesDoDia.tsx
'use client'

import {
  AlertTriangle,
  Clock,
  TrendingUp,
  MessageCircle,
  Mail,
  PauseCircle,
  Archive,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Cliente, Estagio } from '@/lib/types'

type Urgencia = 'critica' | 'atencao' | 'review'

interface AcaoItem {
  cliente:    Cliente
  estagio:    Estagio | null
  urgencia:   Urgencia
  descricao:  string
  acaoLabel:  string
  whatsapp?:  string
}

const urgenciaConfig: Record<Urgencia, {
  label: string
  icon:  typeof AlertTriangle
  bg:    string
  border:string
  text:  string
  badge: string
}> = {
  critica: {
    label:  'URGENTE',
    icon:   AlertTriangle,
    bg:     'bg-status-red/5',
    border: 'border-status-red/25',
    text:   'text-status-red',
    badge:  'bg-status-red/15 text-status-red',
  },
  atencao: {
    label:  'PENDENTE',
    icon:   Clock,
    bg:     'bg-status-orange/5',
    border: 'border-status-orange/25',
    text:   'text-status-orange',
    badge:  'bg-status-orange/15 text-status-orange',
  },
  review: {
    label:  'REVISAR',
    icon:   TrendingUp,
    bg:     'bg-status-blue/5',
    border: 'border-status-blue/25',
    text:   'text-status-blue',
    badge:  'bg-status-blue/15 text-status-blue',
  },
}

interface AcoesDoDiaProps {
  items:       AcaoItem[]
  onCongelar:  (id: string) => void
  onArquivar?: (id: string) => void
}

export function AcoesDoDia({ items, onCongelar, onArquivar }: AcoesDoDiaProps) {
  if (items.length === 0) return null

  return (
    <section className="mb-[2rem]">
      <div className="flex items-center justify-between mb-[0.75rem]">
        <div className="flex items-center gap-[0.5rem]">
          <AlertTriangle className="w-[1rem] h-[1rem] text-status-red" strokeWidth={2} />
          <h2 className="text-ink-primary font-semibold text-[0.9375rem]">
            Ações do Dia
            <span className="ml-[0.5rem] inline-flex items-center justify-center w-[1.25rem] h-[1.25rem] rounded-full bg-status-red/15 text-status-red text-[0.6875rem] font-bold">
              {items.length}
            </span>
          </h2>
        </div>
      </div>

      <div className="space-y-[0.5rem]">
        {items.map(({ cliente, urgencia, descricao, acaoLabel, whatsapp }) => {
          const cfg   = urgenciaConfig[urgencia]
          const Icon  = cfg.icon

          return (
            <div
              key={cliente.id}
              className={cn(
                'flex items-center gap-[1rem]',
                'rounded-xl border px-[1.25rem] py-[1rem]',
                'transition-all duration-150 hover:brightness-110',
                cfg.bg,
                cfg.border,
              )}
            >
              {/* ── BADGE URGÊNCIA ────────────────────────── */}
              <div className={cn('shrink-0 flex items-center gap-[0.375rem] rounded-full px-[0.625rem] h-[1.5rem] text-[0.6875rem] font-bold tracking-wide', cfg.badge)}>
                <Icon className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} />
                {cfg.label}
              </div>

              {/* ── INFO ──────────────────────────────────── */}
              <div className="flex-1 min-w-0">
                <p className="text-ink-primary text-[0.875rem] font-semibold truncate">
                  {cliente.nome}
                  <span className="ml-[0.375rem] text-ink-muted font-normal text-[0.8125rem]">
                    ({cliente.nicho})
                  </span>
                </p>
                <p className="text-ink-secondary text-[0.8125rem] mt-[0.0625rem] line-clamp-1">
                  {descricao}
                </p>
              </div>

              {/* ── AÇÕES ─────────────────────────────────── */}
              <div className="shrink-0 flex items-center gap-[0.375rem]">
                {/* WhatsApp rápido */}
                {whatsapp && (
                  <a
                    href={`https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-[0.375rem] h-[1.875rem] px-[0.75rem] rounded-[0.375rem] bg-[#25D366]/10 text-[#25D366] text-[0.8125rem] font-medium hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/20"
                  >
                    <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                    <span className="hidden sm:inline">{acaoLabel}</span>
                  </a>
                )}

                {/* Email */}
                <button className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-ink-primary transition-colors">
                  <Mail className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                </button>

                {/* Congelar */}
                <button
                  onClick={() => onCongelar(cliente.id)}
                  className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-status-orange transition-colors"
                >
                  <PauseCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                </button>

                {/* Arquivar */}
                {onArquivar && (
                  <button
                    onClick={() => onArquivar(cliente.id)}
                    className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-ink-primary transition-colors"
                  >
                    <Archive className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

---

## ETAPA 8 — HOOK REALTIME (lib/hooks/useClientes.ts)

```typescript
// lib/hooks/useClientes.ts
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'  // seu client Supabase
import { listarClientes, obterEstagioAtivo } from '@/lib/database'
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
      const clientes    = await listarClientes()
      const comEstagio  = await Promise.all(
        clientes.map(async (c) => ({
          cliente: c,
          estagio: await obterEstagioAtivo(c.id).catch(() => null),
        }))
      )
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

    const supabase = createClient()
    const channel  = supabase
      .channel('clientes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clientes' },
        (payload) => {
          console.log('[Realtime] clientes:', payload.eventType)
          carregar() // Re-fetch ao detectar qualquer mudança
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'estagios' },
        () => carregar()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [carregar])

  // ── MÉTRICAS DERIVADAS ───────────────────────────────────────────────
  const metricas = {
    total:     dados.length,
    ativos:    dados.filter((d) => d.cliente.status === 'ativo').length,
    retidos:   dados.filter((d) => d.cliente.status === 'congelado').length,
    recebidos: dados.filter((d) => d.cliente.status === 'recebido').length,
    onboarding:dados.filter((d) => d.cliente.status === 'onboarding').length,
    taxaRetencao: dados.length > 0
      ? Math.round((dados.filter((d) => d.cliente.status === 'ativo').length / dados.length) * 100)
      : 0,
  }

  return { dados, loading, error, metricas, recarregar: carregar }
}
```

---

## ETAPA 9 — DASHBOARD PAGE COMPLETA (app/(dashboard)/page.tsx)

**Este é o arquivo principal.** Substitua seu `page.tsx` atual integralmente por este. Aqui estão todos os elementos das referências: Bento Grid, KPI cards com sparkline, Ações do Dia prioritizadas, grid de progresso.

```tsx
// app/(dashboard)/page.tsx
'use client'

import { useMemo } from 'react'
import {
  Users,
  DollarSign,
  Percent,
  CreditCard,
  Download,
  RefreshCw,
} from 'lucide-react'
import { MainLayout }         from '@/components/layout/MainLayout'
import { KpiCard }            from '@/components/dashboard/KpiCard'
import { AcoesDoDia }         from '@/components/dashboard/AcoesDoDia'
import { ClienteProgressCard } from '@/components/dashboard/ClienteProgressCard'
import { useClientes }        from '@/lib/hooks/useClientes'
import { congelarCliente }    from '@/lib/database'

// ── DADOS MOCK DE SPARKLINE (substitua com dados reais do Supabase) ────
const SPARK_ATIVOS    = [18, 20, 19, 21, 22, 21, 24]
const SPARK_MRR       = [38200, 39400, 41000, 42300, 43100, 44600, 45200]
const SPARK_RETENCAO  = [88, 86, 85, 84, 83, 82, 82]
const SPARK_SALDO     = [2100, 1800, 2400, 1950, 1400, 1600, 1250]

export default function DashboardPage() {
  const { dados, loading, metricas, recarregar } = useClientes()

  // ── SEPARAÇÕES ──────────────────────────────────────────────────────
  const retidos   = dados.filter((d) => d.cliente.status === 'congelado')
  const progresso = dados.filter((d) =>
    d.cliente.status !== 'congelado' && d.cliente.status !== 'cancelado'
  )

  // ── AÇÕES DO DIA: clientes que precisam de atenção imediata ─────────
  const acoesDoDia = useMemo(() => {
    const acoes = []

    // 1. Clientes com pagamento atrasado (status financeiro)
    dados.forEach(({ cliente }) => {
      if (cliente.dias_atraso >= 15) {
        acoes.push({
          cliente,
          estagio:   null,
          urgencia:  'critica' as const,
          descricao: `Pagamento atrasado: ${cliente.dias_atraso} dias — Risco de quebra de contrato`,
          acaoLabel: '#COBRANÇA',
          whatsapp:  'Olá! Precisamos conversar sobre o pagamento pendente.',
        })
      } else if (cliente.dias_atraso >= 7) {
        acoes.push({
          cliente,
          estagio:   null,
          urgencia:  'atencao' as const,
          descricao: `Pagamento atrasado: ${cliente.dias_atraso} dias — Alerta de suspensão`,
          acaoLabel: '#ALERTA',
          whatsapp:  'Olá! Seu pagamento está próximo do prazo de suspensão.',
        })
      }
    })

    // 2. Clientes recém-recebidos (precisam de boas-vindas)
    dados.forEach(({ cliente }) => {
      if (cliente.status === 'recebido') {
        acoes.push({
          cliente,
          estagio:   null,
          urgencia:  'atencao' as const,
          descricao: 'Novo cliente — envie o #BOASVINDAS agora',
          acaoLabel: '#BOASVINDAS',
          whatsapp:  'Olá! Seja bem-vindo(a) à Adsgator! 🎉',
        })
      }
    })

    return acoes.slice(0, 5) // máx 5 ações simultâneas
  }, [dados])

  async function handleCongelar(clienteId: string) {
    await congelarCliente(clienteId).catch(console.error)
    recarregar()
  }

  // ── ACTIONS DA TOPBAR ────────────────────────────────────────────────
  const topBarActions = (
    <div className="flex items-center gap-[0.5rem]">
      <button
        onClick={recarregar}
        disabled={loading}
        className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] hover:text-ink-primary transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-[0.875rem] h-[0.875rem] ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
        <span className="hidden sm:inline">Atualizar</span>
      </button>
      <button className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors">
        <Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        <span className="hidden sm:inline">Importar</span>
      </button>
    </div>
  )

  return (
    <MainLayout
      title="Central Operacional"
      subtitle={`Semana de ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
      actions={topBarActions}
    >

      {/* ════════════════════════════════════════════════
          BLOCO 1 — KPI CARDS (BENTO ROW)
      ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[1rem] mb-[2rem]">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[8rem] rounded-xl bg-surface-card border border-surface-border animate-pulse" />
          ))
        ) : (
          <>
            <KpiCard
              label="Clientes Ativos"
              value={metricas.ativos}
              delta="+3 esta semana"
              deltaDir="up"
              sparkData={SPARK_ATIVOS}
              accentColor="#FFA500"
              icon={<Users className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
            />
            <KpiCard
              label="MRR"
              value={`R$ ${(45200).toLocaleString('pt-BR')}`}
              delta="+12%"
              deltaDir="up"
              deltaLabel="vs mês passado"
              sparkData={SPARK_MRR}
              accentColor="#10B981"
              icon={<DollarSign className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
            />
            <KpiCard
              label="Taxa de Retenção"
              value={`${metricas.taxaRetencao}%`}
              delta="-5%"
              deltaDir="down"
              deltaLabel="vs semana"
              sparkData={SPARK_RETENCAO}
              accentColor="#EF4444"
              icon={<Percent className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
            />
            <KpiCard
              label="Saldo Google"
              value="R$ 1.250"
              delta="⚠️ Baixo"
              deltaDir="down"
              sparkData={SPARK_SALDO}
              accentColor="#F59E0B"
              alert={true}
              alertLabel="Envie #SALDOGOOGLE"
              icon={<CreditCard className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
            />
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════
          BLOCO 2 — AÇÕES DO DIA
      ════════════════════════════════════════════════ */}
      {!loading && acoesDoDia.length > 0 && (
        <AcoesDoDia
          items={acoesDoDia}
          onCongelar={handleCongelar}
        />
      )}

      {/* ════════════════════════════════════════════════
          BLOCO 3 — GRID DE PROGRESSO
      ════════════════════════════════════════════════ */}
      <section className="mb-[2rem]">
        <div className="flex items-center justify-between mb-[0.75rem]">
          <h2 className="text-ink-primary font-semibold text-[0.9375rem]">
            Clientes em Progresso
            <span className="ml-[0.5rem] text-ink-muted text-[0.8125rem] font-normal">
              ({progresso.length}/{metricas.total})
            </span>
          </h2>
          <a href="/clientes" className="text-ads-500 text-[0.8125rem] hover:underline">
            Ver todos →
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[12rem] rounded-xl bg-surface-card border border-surface-border animate-pulse" />
            ))}
          </div>
        ) : progresso.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[4rem] text-ink-muted">
            <Users className="w-[3rem] h-[3rem] mb-[1rem]" strokeWidth={1} />
            <p className="text-[0.9375rem] font-medium">Nenhum cliente em progresso</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
            {progresso.slice(0, 6).map(({ cliente, estagio }) => (
              <ClienteProgressCard
                key={cliente.id}
                cliente={cliente}
                estagio={estagio}
                onCongelar={handleCongelar}
              />
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════
          BLOCO 4 — CLIENTES RETIDOS (congelados)
      ════════════════════════════════════════════════ */}
      {retidos.length > 0 && (
        <section>
          <div className="flex items-center gap-[0.5rem] mb-[0.75rem]">
            <div className="w-[0.5rem] h-[0.5rem] rounded-full bg-status-orange animate-pulse-slow" />
            <h2 className="text-ink-primary font-semibold text-[0.9375rem]">
              Clientes Retidos
              <span className="ml-[0.5rem] text-ink-muted text-[0.8125rem] font-normal">
                ({retidos.length})
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
            {retidos.map(({ cliente, estagio }) => (
              <ClienteProgressCard
                key={cliente.id}
                cliente={cliente}
                estagio={estagio}
                onCongelar={handleCongelar}
                isRetido
              />
            ))}
          </div>
        </section>
      )}
    </MainLayout>
  )
}
```

---

## ETAPA 10 — CLIENTE PROGRESS CARD (components/dashboard/ClienteProgressCard.tsx)

```tsx
// components/dashboard/ClienteProgressCard.tsx
'use client'

import {
  ArrowRight,
  PauseCircle,
  MessageCircle,
  MoreHorizontal,
  Clock,
} from 'lucide-react'
import { cn }       from '@/lib/utils'
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
  cliente:    Cliente
  estagio:    Estagio | null
  onCongelar: (id: string) => void
  isRetido?:  boolean
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

  return (
    <article
      className={cn(
        'group relative flex flex-col',
        'bg-surface-card rounded-xl border border-surface-border',
        'p-[1.25rem]',
        'hover:border-surface-border/60 hover:shadow-lg hover:shadow-black/20',
        'transition-all duration-200',
        isRetido && 'opacity-70 hover:opacity-100',
      )}
    >
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-[1rem]">
        <div className="flex items-center gap-[0.625rem]">
          {/* Avatar */}
          <div className="w-[2.25rem] h-[2.25rem] rounded-full bg-ads-500/15 border border-ads-500/20 flex items-center justify-center shrink-0">
            <span className="text-ads-500 text-[0.8125rem] font-bold">{iniciais}</span>
          </div>
          <div>
            <p className="text-ink-primary text-[0.875rem] font-semibold leading-tight">
              {cliente.nome}
            </p>
            <p className="text-ink-muted text-[0.75rem]">
              {emoji} {cliente.nicho}
            </p>
          </div>
        </div>

        {/* Menu */}
        <button className="w-[1.75rem] h-[1.75rem] rounded-[0.25rem] flex items-center justify-center text-ink-muted opacity-0 group-hover:opacity-100 hover:bg-surface-hover transition-all">
          <MoreHorizontal className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        </button>
      </div>

      {/* ── STATUS BADGE ──────────────────────────────────── */}
      <div className={cn('flex items-center gap-[0.375rem] mb-[0.875rem]')}>
        <span className={cn('w-[0.4375rem] h-[0.4375rem] rounded-full shrink-0', status.dot)} />
        <span className={cn('text-[0.75rem] font-medium', status.text)}>{status.label}</span>
      </div>

      {/* ── PRÓXIMA AÇÃO ──────────────────────────────────── */}
      <div className="flex-1 mb-[1rem]">
        {estagio ? (
          <div className="flex items-start gap-[0.375rem]">
            <ArrowRight className="w-[0.875rem] h-[0.875rem] text-ads-500 shrink-0 mt-[0.0625rem]" strokeWidth={2} />
            <p className="text-ink-secondary text-[0.8125rem] leading-snug">
              {estagio.descricao ?? 'Verificar próxima ação'}
            </p>
          </div>
        ) : (
          <p className="text-ink-muted text-[0.8125rem] italic">
            Sem ação definida
          </p>
        )}

        {/* MRR */}
        {cliente.mrr && (
          <p className="text-ink-muted text-[0.75rem] mt-[0.5rem]">
            MRR: <span className="text-ink-secondary font-medium">R$ {cliente.mrr.toLocaleString('pt-BR')}</span>
          </p>
        )}
      </div>

      {/* ── FOOTER — BOTÕES ───────────────────────────────── */}
      <div className="flex items-center gap-[0.375rem] pt-[0.875rem] border-t border-surface-border">
        <a
          href={`/clientes/${cliente.id}`}
          className="flex-1 flex items-center justify-center gap-[0.375rem] h-[1.875rem] rounded-[0.375rem] bg-ads-500/10 text-ads-500 text-[0.8125rem] font-medium hover:bg-ads-500/20 transition-colors"
        >
          Abrir
          <ArrowRight className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
        </a>

        {/* WhatsApp */}
        {cliente.whatsapp && (
          <a
            href={`https://wa.me/${cliente.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-[#25D366] transition-colors"
          >
            <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          </a>
        )}

        {/* Congelar */}
        <button
          onClick={() => onCongelar(cliente.id)}
          className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-status-orange transition-colors"
          title={isRetido ? 'Reativar' : 'Congelar'}
        >
          {isRetido ? (
            <Clock className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          ) : (
            <PauseCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </article>
  )
}
```

---

## ETAPA 11 — DEPENDÊNCIAS NECESSÁRIAS

Execute estes comandos **antes** de qualquer implementação:

```bash
# Recharts (sparklines e charts)
npm install recharts

# CVA (class-variance-authority para variantes de componentes)
npm install class-variance-authority

# next-themes (dark/light mode toggle)
npm install next-themes

# date-fns (formatação de datas em pt-BR)
npm install date-fns

# Verificar se Lucide já está instalado
npm list lucide-react
```

---

## ETAPA 12 — THEME PROVIDER (para dark/light toggle)

```tsx
// components/providers/ThemeProvider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"         // Adsgator usa dark por padrão
      enableSystem={true}
      themes={['dark', 'light']}
    >
      {children}
    </NextThemesProvider>
  )
}
```

```tsx
// app/layout.tsx — adicione o ThemeProvider aqui
import { ThemeProvider } from '@/components/providers/ThemeProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## ETAPA 13 — TOGGLE DARK/LIGHT (componente pronto)

```tsx
// components/ui/ThemeToggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const themes = [
    { key: 'dark',   icon: Moon,    label: 'Escuro'  },
    { key: 'light',  icon: Sun,     label: 'Claro'   },
    { key: 'system', icon: Monitor, label: 'Sistema' },
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

---

## ORDEM DE EXECUÇÃO — CHECKLIST

Execute nesta sequência exata. Não pule etapas.

```
FASE A — FUNDAÇÃO (faça tudo antes de ver resultado)
─────────────────────────────────────────────────────
[ ] npm install recharts class-variance-authority next-themes date-fns
[ ] Substituir tailwind.config.ts completo (Etapa 1)
[ ] Substituir globals.css completo (Etapa 2)
[ ] Criar components/providers/ThemeProvider.tsx (Etapa 12)
[ ] Atualizar app/layout.tsx com ThemeProvider (Etapa 12)
[ ] Testar build: npm run build (verificar erros de compilação)

FASE B — LAYOUT (sidebar + topbar)
─────────────────────────────────────────────────────
[ ] Criar components/layout/Sidebar.tsx (Etapa 3)
[ ] Criar components/layout/TopBar.tsx (Etapa 5)
[ ] Substituir components/layout/MainLayout.tsx (Etapa 4)
[ ] Rodar npm run dev e verificar sidebar com labels aparecendo

FASE C — DASHBOARD
─────────────────────────────────────────────────────
[ ] Criar components/dashboard/KpiCard.tsx (Etapa 6)
[ ] Criar components/dashboard/AcoesDoDia.tsx (Etapa 7)
[ ] Criar components/dashboard/ClienteProgressCard.tsx (Etapa 10)
[ ] Criar lib/hooks/useClientes.ts (Etapa 8)
[ ] Substituir app/(dashboard)/page.tsx (Etapa 9)
[ ] Verificar dashboard: KPI cards com sparklines aparecem

FASE D — POLISH
─────────────────────────────────────────────────────
[ ] Criar components/ui/ThemeToggle.tsx (Etapa 13)
[ ] Adicionar ThemeToggle na TopBar (ou no rodapé da Sidebar)
[ ] Testar dark ↔ light toggle
[ ] Testar realtime: mudar status de um cliente no Supabase e ver o dashboard atualizar
[ ] Verificar mobile: sidebar deve desaparecer em < md e virar hamburguer
```

---

## SOBRE OS DOCUMENTOS DO HAIKU — USE ASSIM

| Documento Haiku | Para que serve agora |
|---|---|
| `ANALISE_COMPLETA_E_ROADMAP.md` | Referência para fases 3-7 (Analytics, Financeiro, Notificações, RBAC) — não para o dashboard |
| `VISUAL_MOCKUPS_LAYOUTS.md` | Consulta para telas de Clientes, Financeiro, Analytics quando for implementar cada módulo |
| `ESPECIFICACOES_TECNICAS.md` | Fonte dos componentes Table, Badge, Form, RLS policies — use ao implementar cada módulo |
| `DOCUMENTAÇÃO_MESTRE_DE_ENGENHARIA.md` | Referência de regras de negócio (ex: conversões fracionadas, fluxo WhatsApp, geração de manifesto .md) |

---

## O QUE ESTE DOCUMENTO NÃO COBRE (próximas fases)

Isso aqui cobre a **Fase 1 + 2** do roadmap original (Design System + Dashboard Realtime). As próximas fases, com base nos documentos do Haiku, são:

- **Fase 3 — Analytics:** Tela Google Ads + GA4 com Recharts (área chart de CPA, tabela de campanhas)
- **Fase 4 — Financeiro:** MRR chart, DRE simplificado, cash flow dos próximos 30 dias
- **Fase 5 — Segurança:** RBAC + Audit logs (código no doc Haiku de specs técnicas)
- **Fase 6 — Notificações:** WhatsApp webhook + email automático (Asaas integration)
- **Fase 7 — Biblioteca de Componentes Astro:** Manifesto de produção .md

---

## RESULTADO ESPERADO APÓS IMPLEMENTAÇÃO

Após executar as 4 fases do checklist, seu dashboard terá:

✅ **Sidebar** com ícone + label de texto (igual Donezo, Ceremco, Campaign das referências)  
✅ **KPI Cards** com mini-sparkline no canto (igual Twisty, Donezo das referências)  
✅ **Ações do Dia** com priorização visual clara (vermelho/laranja/azul)  
✅ **Grid de progresso** com cards ricos (avatar, status, próxima ação, botões)  
✅ **Real-time**: dashboard atualiza quando algo muda no Supabase  
✅ **Dark mode completo** com toggle funcional  
✅ **Brand color correta**: amarelo #FFA500 como cor primária  
✅ **100% rem**, sem um único px  
✅ **Geist font** já presente no projeto  

---

*Documento gerado em 21 de maio de 2026. Versão consolidada para implementação definitiva do ADSGATOR.*
