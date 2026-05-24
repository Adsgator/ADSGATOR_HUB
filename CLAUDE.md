# ADSGATOR HUB — Contexto para Claude

Este arquivo define as convenções, arquitetura e regras do projeto.
Leia antes de qualquer alteração.

---

## Stack

```
Frontend:  Next.js 15 + React 19 + TypeScript
Styling:   Tailwind CSS 3 com design system customizado (rem-based)
State:     Zustand 5 + Supabase Realtime
Backend:   Supabase (PostgreSQL + Auth + Realtime + Storage)
IA:        Vertex AI Gemini (Flash, Pro) via @google-cloud/vertexai
APIs:      Google Ads API, Google Analytics Data API, Asaas webhook
Fontes:    Geist Sans + Geist Mono (via `geist` package)
Icons:     lucide-react
Toasts:    sonner
Charts:    recharts
DnD:       @hello-pangea/dnd | react-grid-layout
```

---

## Estrutura de Diretórios

```
src/
├── app/
│   ├── (app)/            # Rotas autenticadas
│   │   ├── dashboard/
│   │   ├── clientes/
│   │   │   ├── page.tsx  # lista
│   │   │   ├── novo/     # formulário
│   │   │   └── [id]/     # detalhe
│   │   ├── financeiro/
│   │   ├── analytics/
│   │   ├── relatorios/
│   │   ├── tarefas/
│   │   ├── marketing/
│   │   ├── biblioteca/
│   │   ├── configuracoes/
│   │   └── ajuda/
│   ├── api/              # API routes Next.js
│   ├── login/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/           # Shell: TopBar, Sidebar, RightSidebar, StatusBar, MainLayout
│   ├── ui/               # Componentes primitivos (ThemeToggle, etc.)
│   ├── clientes/         # ClienteCard, ChecklistCard, AuditTimeline, etc.
│   ├── analytics/
│   ├── configuracoes/
│   └── dashboard/
├── lib/
│   ├── hooks/            # useClientes, useRealtime, etc.
│   ├── store/            # Zustand stores
│   ├── supabase/         # Cliente Supabase + types
│   ├── utils.ts          # cn() helper
│   ├── auth.ts
│   ├── database.ts       # Queries tipadas
│   └── *.ts
└── providers/
    └── ThemeProvider.tsx
```

---

## Layout Shell (Editor-Style)

O layout segue o conceito IDE (VS Code / Figma): moldura fixa + área de conteúdo central.

```
┌─ TopBar (3.5rem) ────────────────────────────────────────────────────────────┐
│  Logo | Título da página | Search (Ctrl+K) | Alertas | Notificações | Tema  │
├──────────┬──────────────────────────────────────────────────┬────────────────┤
│ Sidebar  │                                                  │ RightSidebar   │
│ 3.5rem   │         ÁREA DE CONTEÚDO (scroll)               │   3rem         │
│ hover→   │                                                  │   (ações       │
│ 15rem    │                                                  │   contextuais) │
├──────────┴──────────────────────────────────────────────────┴────────────────┤
│ StatusBar (1.5rem) — status APIs, modo, info contextual                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

**CSS Variables de layout:**
```css
--topbar-h:         3.5rem
--sidebar-w:        3.5rem   /* colapsado */
--sidebar-expanded: 15rem    /* hover */
--right-sidebar-w:  3rem
--statusbar-h:      1.5rem
```

---

## Design System

### Cores Brand (Amarelo Adsgator)

```
ads-50:  #FFF8E6   ads-100: #FFF0CD   ads-200: #FFE5A6
ads-300: #FFD67F   ads-400: #FFC857   ads-500: #FFB100  ← principal
ads-600: #E6A000   ads-700: #CC8E00   ads-800: #B37B00   ads-900: #8C6200
```

### Superfícies (CSS Vars — dark/light aware)

| Token                  | Light          | Dark           |
|------------------------|----------------|----------------|
| `surface-base`         | #DADCE9        | #0a0a0b        |
| `surface-card`         | #FFFFFF         | #141416        |
| `surface-hover`        | #F4F4F8        | #1c1c1f        |
| `surface-elevated`     | #F9F9FD        | #242428        |
| `surface-border`       | #CED0DE        | #2a2a2e        |

### Texto (CSS Vars)

| Token             | Light      | Dark       |
|-------------------|------------|------------|
| `ink-primary`     | #111111    | #fafafa    |
| `ink-secondary`   | #52525b    | #a1a1aa    |
| `ink-muted`       | #a1a1aa    | #71717a    |

### Status

```
status-green:  #22c55e
status-orange: #f59e0b
status-red:    #ef4444
status-blue:   #3b82f6
status-purple: #8b5cf6
status-cyan:   #06b6d4
status-yellow: #eab308
```

### Glow Effects (CSS Vars)

```css
--glow-green | --glow-amber | --glow-cyan
--glow-red   | --glow-blue  | --glow-purple
```

Classes: `.glow-green`, `.glow-amber`, `.glow-cyan`, `.glow-red`, `.glow-blue`, `.glow-purple`

---

## Tipografia

Fonte: **Geist Sans** (sans) + **Geist Mono** (mono)

Escala de tamanhos (rem):
```
2xs: 0.625rem  |  xs: 0.75rem  |  sm: 0.875rem  |  base: 1rem
lg: 1.125rem   |  xl: 1.25rem  |  2xl: 1.5rem   |  3xl: 1.875rem  |  4xl: 2.25rem
```

---

## Animações Disponíveis

```
animate-fade-in       — 0.25s, fade + translateY(0.25rem)
animate-fade-up       — 0.35s, fade + translateY(0.5rem)
animate-fade-scale    — 0.25s, fade + scale(0.97→1)
animate-slide-in-left — 0.25s, fade + translateX(-0.5rem→0)
animate-slide-in-right — 0.25s, fade + translateX(0.5rem→0)
animate-pulse-slow    — pulse 2s infinite
animate-accordion-down / animate-accordion-up
```

Classes CSS utilitárias:
```
.animate-fade-up     — entrada padrão de elementos
.animate-fade-scale  — entrada de modais/cards
.stagger > *         — filhos com delay crescente (30ms, 60ms, ... 240ms)
.page-enter          — animação de entrada de página inteira
.skeleton-shimmer    — skeleton loading effect
.card-shadow         — sombra em light, borda em dark
.card-interactive    — hover lift + sombra
.panel-slide-in      — drawer lateral com spring
.focus-ring          — outline premium com glow amarelo
```

---

## Convenções de Código

### Regras absolutas

1. **Sempre rem** — nunca px para tamanhos/espaçamentos
2. **Nunca `dark:` prefix** — os tokens CSS vars já são dark/light aware
3. **Tema via `.dark` class** — controlado pelo `ThemeProvider`

### Imports obrigatórios

```typescript
import { cn }       from '@/lib/utils'          // cn() helper
import { supabase } from '@/lib/supabase'        // cliente Supabase
import { MainLayout } from '@/components/layout/MainLayout'
import { NomeDoIcone } from 'lucide-react'       // ícones — import direto
```

### Padrão de componente de página

```tsx
'use client'

import { MainLayout } from '@/components/layout/MainLayout'

export default function NomeDaPagina() {
  return (
    <MainLayout title="Título" subtitle="Subtítulo opcional">
      <div className="page-enter">
        {/* conteúdo */}
      </div>
    </MainLayout>
  )
}
```

### Padrão de card

```tsx
<div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow card-interactive">
  {/* conteúdo */}
</div>
```

### Padrão de badge de status

```tsx
<span className="px-[0.5rem] py-[0.125rem] rounded-full text-xs font-medium bg-status-green/10 text-status-green">
  Ativo
</span>
```

---

## Componentes de Layout Disponíveis

| Componente         | Arquivo                              | Uso                                           |
|--------------------|--------------------------------------|-----------------------------------------------|
| `MainLayout`       | `components/layout/MainLayout.tsx`   | Wrapper de página com title/subtitle/actions  |
| `TopBar`           | `components/layout/TopBar.tsx`       | Barra superior (logo, busca, notif, tema)      |
| `Sidebar`          | `components/layout/Sidebar.tsx`      | Nav lateral slim (hover expande)               |
| `RightSidebar`     | `components/layout/RightSidebar.tsx` | Barra direita (ações contextuais)             |
| `StatusBar`        | `components/layout/StatusBar.tsx`    | Barra inferior (status, info)                  |
| `NotificationBell` | `components/layout/NotificationBell.tsx` | Badge + drawer de notificações           |
| `NotificationDrawer` | `components/layout/NotificationDrawer.tsx` | Panel de notificações              |

### Props do MainLayout

```typescript
interface MainLayoutProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode  // botões no TopBar
  children: React.ReactNode
}
```

---

## Rotas da Aplicação

| Rota                     | Módulo            |
|--------------------------|-------------------|
| `/dashboard`             | Home / Morning Briefing |
| `/clientes`              | Lista de clientes |
| `/clientes/novo`         | Formulário novo cliente |
| `/clientes/[id]`         | Detalhe do cliente |
| `/financeiro`            | DRE + transações + inadimplentes |
| `/analytics`             | Google Ads + GA4 |
| `/relatorios`            | Relatórios automáticos |
| `/tarefas`               | Task manager |
| `/marketing`             | Calendário social |
| `/biblioteca`            | Componentes Astro + manifestos |
| `/configuracoes`         | Perfil, integrações, tema |
| `/ajuda`                 | Help center |

---

## Banco de Dados (Tabelas Principais)

```sql
clientes           — dados do cliente, status, mrr, dias_atraso
assinaturas        — planos de cobrança dos clientes
estagios           — checklist por fase (pre_vendas, onboarding, etc.)
financeiro_lancamentos — receitas e despesas da agência
notificacoes       — alertas e notificações in-app
historico_acoes    — audit log de todas as ações
tarefas            — task manager
memoria_cliente    — arquivo .md por cliente (contexto IA)
```

---

## Edge Functions (Supabase Deno)

```
supabase/functions/
├── gerar-insight-ia/       — análise de campanha com Gemini Flash
├── gerar-relatorio-executivo/ — relatório semanal/mensal com Gemini Pro
├── webhook-asaas/          — processa pagamentos (TEST_MODE = true)
├── regua-cobranca/         — cobranças automáticas (TEST_MODE = true)
└── _shared/                — utils compartilhados
```

⚠️ **MODO DE TESTE ATIVO** — `TEST_MODE = true` nas Edge Functions webhook-asaas e regua-cobranca.

---

## O que Está Implementado

- [x] Shell de layout (TopBar + Sidebar + RightSidebar + StatusBar)
- [x] Tema dark/light com CSS vars + ThemeToggle
- [x] Autenticação Supabase (login, logout, sessão)
- [x] Módulo Clientes — lista, novo (página de detalhe `[id]` tem bug — ver Pendente)
- [x] Módulo Financeiro — DRE, transações, inadimplentes
- [x] Módulo Relatórios — solicitação e histórico
- [x] Módulo Dashboard — Bento Grid (react-grid-layout), Morning Briefing, KPIs, Ações do Dia, WeatherClock, DRE Sparkline, Alertas Críticos, Gemini Chat
- [x] Módulo Tarefas — lista com filtros/grouping, criar/editar/concluir/deletar, adiar, TaskModal, context menu
- [x] Módulo Marketing — calendário semanal 4 semanas, criar/editar posts, KPIs, status (rascunho/agendado/publicado)
- [x] Módulo Biblioteca — browse componentes Astro por categoria, construtor visual, gerador manifesto .md
- [x] Módulo Configurações — 7 abas (Perfil, Notificações, Integrações, Financeiro, Aparência, Equipe, Auditoria)
- [x] Módulo Analytics — UI completa, Google Ads + GA4 com dados reais quando credenciais configuradas
- [x] Design system completo (tokens, animações, utilitários)
- [x] Seed de dados de teste (8 clientes)
- [x] Edge Functions: morning-briefing, gerar-insight-ia, gerar-relatorio-executivo, gerar-relatorio-md, gerar-relatorios-mensais, webhook-asaas, regua-cobranca, memoria-cliente, processar-alertas, sentinela

## O que Está Pendente (Lacunas Reais)

- [ ] **BUG:** `clientes/[id]/page.tsx` tem conteúdo de `clientes/novo/page.tsx` — página de detalhe do cliente não existe
- [ ] `/api/ia/hashtags` — rota ausente (botão "Gerar Hashtags" em Marketing não funciona)
- [ ] Analytics — integração real Google Ads + GA4 (UI pronta, falta configurar credenciais e data binding)
- [ ] Notificações WhatsApp via Twilio (templates existem, envio real pendente)
- [ ] Notificações Email automáticas (Resend SDK — cron + templates)
- [ ] RBAC completo — regras RLS no Supabase para múltiplos usuários
- [ ] Drag/drop persistente em Tarefas (reorder salvo no Supabase)
- [ ] Publicação real de posts via Meta API
- [ ] TEST_MODE=false para webhook-asaas e regua-cobranca (requer checklist em docs/MODO_TESTE.md)
