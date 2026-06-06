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
│   │   ├── base-conhecimento/  # Knowledge base interno
│   │   ├── operacional/        # Planos operacionais + fluxos
│   │   ├── portfolio/          # Portfólio de cases da agência
│   │   ├── prospectar/         # CRM de prospecção
│   │   ├── configuracoes/
│   │   └── ajuda/
│   ├── (portal)/         # Portal do cliente (público autenticado)
│   ├── api/              # API routes Next.js
│   ├── login/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/           # Shell: TopBar, Sidebar, RightSidebar, StatusBar, MainLayout
│   ├── ui/               # Componentes primitivos (Button, ContextMenu, TaskModal, ConfirmDialog, etc.)
│   ├── clientes/         # ClienteCard, ChecklistCard, AuditTimeline, etc.
│   ├── analytics/
│   ├── configuracoes/
│   └── dashboard/        # BentoCard, KpiCard, MorningBriefing, NewsContainer, etc.
├── lib/
│   ├── hooks/            # useClientes, useConfirmDialog, usePermissoes, etc.
│   ├── store/            # Zustand stores (right-sidebar, mobileMenu)
│   ├── supabase/         # Cliente Supabase + types
│   ├── motion.ts         # Framer Motion variants (fadeScale, slideInBottom, etc.)
│   ├── utils.ts          # cn() helper
│   ├── auth.ts
│   ├── database.ts       # Queries tipadas
│   ├── cobranca.ts       # Política de inadimplência (D+7/D+15/D+30) — fonte única
│   ├── health-score.ts   # Cálculo de health score do cliente (0–100)
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
4. **Inadimplência via `lib/cobranca.ts`** — nunca recalcular limiares de atraso à
   mão (`dias_atraso > N`). Use `estagioInadimplencia()` / `isInadimplente()` /
   `statusInadimplencia()`. A política é D+7 (suspensão), D+15 (grave), D+30 (crítico).

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
| `NotificationDrawer` | `components/layout/NotificationDrawer.tsx` | Drawer (aberto pela RightSidebar) — abas Alertas (inadimplência, saldo Google baixo, onboarding parado, congelados) + Notificações |

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
| `/dashboard`             | Home / Morning Briefing / Bento Grid |
| `/clientes`              | Lista de clientes |
| `/clientes/novo`         | Formulário novo cliente |
| `/clientes/[id]`         | Detalhe do cliente |
| `/financeiro`            | DRE + transações + inadimplentes |
| `/analytics`             | Google Ads + GA4 |
| `/relatorios`            | Relatórios automáticos |
| `/tarefas`               | Task manager (lista + kanban) |
| `/marketing`             | Calendário social |
| `/biblioteca`            | Componentes Astro + manifestos |
| `/base-conhecimento`     | Knowledge base interno |
| `/operacional`           | Planos operacionais + fluxos |
| `/portfolio`             | Portfólio de cases |
| `/prospectar`            | CRM de prospecção |
| `/configuracoes`         | Perfil, integrações, tema (7 abas) |
| `/ajuda`                 | Help center |
| `/portal/[token]`        | Portal do cliente (público) |

---

## Banco de Dados (Tabelas Principais)

```sql
clientes              — dados do cliente, status, mrr, dias_atraso, saldo_google
assinaturas           — planos de cobrança dos clientes
estagios              — checklist por fase (pre_vendas, onboarding, etc.)
financeiro_lancamentos — receitas e despesas da agência
notificacoes          — alertas e notificações in-app
historico_acoes       — audit log de todas as ações
tarefas               — task manager (checklist JSONB, prioridade, data_prazo)
memoria_cliente       — arquivo .md por cliente (contexto IA)
alertas               — alertas críticos do sistema (saldo, inadimplência)
posts_marketing       — calendário social (rascunho/agendado/publicado)
base_conhecimento     — artigos internos da agência
analytics_snapshots   — snapshots Google Ads + GA4 por cliente
metas                 — metas da agência com progresso
prospects             — CRM de prospecção
projetos              — projetos internos da agência
planos_operacionais   — planos operacionais por cliente
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

### Sync de Analytics

Os clients Google rodam em Node (SDKs `google-ads-api` / `@google-analytics/data`),
que **não funcionam em Deno** — por isso o sync é uma rota Next.js, não Edge Function.

- **Lógica:** `lib/analytics-sync.ts` (`sincronizarCliente`, `sincronizarTodos`) —
  agrega Google Ads + GA4 e faz upsert idempotente em `analytics_snapshots`
  (1 linha por fonte/período; constraint única via migration `20260606_*`).
- **Rota:** `POST /api/v1/analytics/sync` (botão "Sincronizar" na UI, sessão) e
  `GET` (Vercel Cron, header `Authorization: Bearer $CRON_SECRET`).
- **Agendamento:** `vercel.json` → diário às 06:00. Requer env `CRON_SECRET`.

---

## Componentes UI Disponíveis

| Componente        | Arquivo                          | Uso                                             |
|-------------------|----------------------------------|-------------------------------------------------|
| `Button`          | `components/ui/Button.tsx`       | Botão com variantes (primary, secondary, ghost, danger, subtle) |
| `ConfirmDialog`   | `components/ui/ConfirmDialog.tsx`| Dialog de confirmação global (via Zustand)      |
| `ContextMenu`     | `components/ui/ContextMenu.tsx`  | Menu de contexto (right-click ou botão)         |
| `TaskModal`       | `components/ui/TaskModal.tsx`    | Modal criar/editar tarefa                       |
| `DrawerEditor`    | `components/ui/DrawerEditor.tsx` | Drawer lateral com editor de conteúdo           |
| `GlobalSearch`    | `components/ui/GlobalSearch.tsx` | Busca global (Ctrl+K)                           |
| `ShortcutsOverlay`| `components/ui/ShortcutsOverlay.tsx`| Overlay de atalhos (?)                       |
| `Tooltip`         | `components/ui/Tooltip.tsx`      | Tooltip simples                                 |
| `Motion`          | `components/ui/Motion.tsx`       | Wrappers de animação Framer Motion              |

### Padrão de ConfirmDialog (substituiu confirm() nativo)

```typescript
// Em vez de: if (confirm('Deletar?')) { ... }
// Usar:
import { useConfirmDialogStore } from '@/lib/hooks/useConfirmDialog'

function handleDelete(id: string) {
  const openConfirm = useConfirmDialogStore.getState().openConfirm
  openConfirm(
    'Título do Dialog',
    'Mensagem de confirmação.',
    async () => {
      // lógica async aqui
    }
  )
}
```

O `ConfirmDialog` é renderizado globalmente no `MainLayout` — não precisa importar em cada página.

---

## O que Está Implementado

- [x] Shell de layout (TopBar + Sidebar hover-expand + RightSidebar + StatusBar)
- [x] Tema dark/light com CSS vars + ThemeToggle
- [x] Autenticação Supabase (login, logout, sessão)
- [x] Módulo Clientes — lista, novo, detalhe `[id]` com projetos e timeline
- [x] Módulo Financeiro — DRE, transações, inadimplentes
- [x] Módulo Relatórios — solicitação e histórico
- [x] Módulo Dashboard — Bento Grid customizável (react-grid-layout), Morning Briefing, KPIs, Ações do Dia, WeatherClock, DRE Sparkline, Alertas Críticos, Gemini Chat, ActivityFeed, NewsContainer, Timeline, ChurnRisk, TopPerformers, CentralDeComando, GoalsCard
- [x] Módulo Tarefas — lista + kanban, filtros/grouping, criar/editar/concluir/deletar, adiar, TaskModal, context menu
- [x] Módulo Marketing — calendário semanal 4 semanas, criar/editar posts, KPIs, status (rascunho/agendado/publicado)
- [x] Módulo Biblioteca — browse componentes Astro por categoria, construtor visual, gerador manifesto .md
- [x] Módulo Configurações — 7 abas (Perfil, Notificações, Integrações, Financeiro, Aparência, Equipe, Auditoria)
- [x] Módulo Analytics — UI completa, Google Ads + GA4 com dados reais quando credenciais configuradas
- [x] Módulo Base de Conhecimento — artigos internos com busca
- [x] Módulo Operacional — planos operacionais + fluxos por cliente
- [x] Módulo Portfólio — cases da agência
- [x] Módulo Prospectar — CRM de prospecção
- [x] Portal do Cliente — rota pública `/portal/[token]`
- [x] ConfirmDialog global — todos os `confirm()` nativos substituídos por design system
- [x] GlobalSearch — busca Ctrl+K
- [x] ShortcutsOverlay — overlay de atalhos `?`
- [x] Design system completo (tokens, animações, utilitários)
- [x] Seed de dados de teste (8 clientes)
- [x] Migrations Supabase: knowledge_base, metas, prospects, projetos, planos_operacionais, alertas, posts_marketing
- [x] Edge Functions: morning-briefing, gerar-insight-ia, gerar-relatorio-executivo, gerar-relatorio-md, gerar-relatorios-mensais, webhook-asaas, regua-cobranca, memoria-cliente, processar-alertas, sentinela

## O que Está Pendente (Lacunas Reais)

> Atualizado em 30/05/2026 após auditoria. Vários itens antes listados como
> "pendentes" já estavam implementados — a causa real era um bug de autenticação
> nas rotas `/api/v1/*` (ver nota abaixo), agora corrigido.

- [x] ~~`/api/ia/hashtags`~~ — **existe e está conectada** ao botão "Gerar Hashtags" em Marketing.
- [x] ~~Drag/drop persistente em Tarefas~~ — API `/api/v1/tarefas/reorder` existe e **persiste** (destravada com o fix de auth).
- [x] ~~Analytics — integração real~~ — dados ao vivo (`/api/analytics/[id]/live`) e sync histórico prontos. Falta apenas **configurar as credenciais** Google Ads/GA4 nas env vars e marcar `google_ads_enabled`/`ga4_enabled` no cliente.
- [x] ~~analytics_snapshots vazio~~ — sync implementado: `lib/analytics-sync.ts` + `POST/GET /api/v1/analytics/sync`. Roda pelo botão "Sincronizar" na página Analytics (manual) e por Vercel Cron diário (06:00, ver `vercel.json`). Requer env `CRON_SECRET`.
- [ ] Notificações WhatsApp — hoje o envio é via `wa.me` (link manual). Automação de envio fora de escopo por ora.
- [ ] Notificações Email automáticas (Resend wired em `lib/email.ts` — falta `RESEND_API_KEY` + cron)
- [ ] RBAC/RLS por usuário no Supabase (isolamento hoje é por `user_id` na aplicação)
- [ ] Publicação real de posts via Meta API
- [ ] TEST_MODE=false para webhook-asaas e regua-cobranca (requer checklist em docs/Arquivo/MODO_TESTE.md)

### Correções da auditoria (30/05/2026)

- **Auth das rotas de API**: `/api/v1/*` e `analytics/live` usavam um cliente Supabase
  que não lia os cookies no servidor → retornavam sempre 401. Criado `lib/supabase/server.ts`
  (padrão `@supabase/ssr`) e repontadas todas as rotas. Destravou timelines, reorder,
  NewsContainer, e-mail de relatórios e templates.
- **Portal do cliente**: middleware bloqueava `/portal/[token]`; adicionado às rotas públicas.
- **Segurança**: rotas `/api/ia/*` (custo Vertex) e `/api/search` (service-role) agora exigem sessão.
- **Limpeza**: removidos componentes mortos/duplicados, 4 widgets com dados mock e o
  `src/project_snapshot.md`. Clientes Supabase consolidados em `@/lib/supabase` (browser)
  e `@/lib/supabase/server` (servidor).

#### 2ª rodada (mesmo dia)

- **Hidratação (React #418)**: `WeatherClock` iniciava `useState(new Date())` → servidor e
  cliente renderizavam horários diferentes. Agora inicia `null` e só vira `Date` após montar.
  ⚠️ Regra: nunca usar `new Date()` / `Math.random()` em estado inicial ou direto no JSX renderizado no SSR.
- **z-index do drawer de notificação**: usava `z-60` (classe Tailwind inexistente) e ficava
  atrás do overlay. Corrigido para `z-[60]`. ⚠️ Tailwind só tem `z-0/10/20/30/40/50`; acima disso usar `z-[N]`.
- **Drawer de notificações enriquecido**: aba "Alertas" agora unifica inadimplência, saldo
  Google baixo, onboarding/setup parado e congelados (tudo calculado do estado dos clientes).
- **`RecentTransactions`** reconstruído com dados reais de `financeiro_lancamentos` e plugado no dashboard.
- **`AlertaSaldoGoogle`** plugado no dashboard (alerta preditivo de fim de verba).
- **Login** redesenhado no padrão do design system; `NotificationBell` (órfão) removido.
- Biblioteca de WhatsApp do cliente com as 13 mensagens reais (MENSAGENS ATENTIMENTO), por categoria.
