# ADSGATOR HUB — Contexto para Claude

Este arquivo define as convenções, arquitetura e regras do projeto.
Leia antes de qualquer alteração.

---

## ⏸️ PROJETO PAUSADO (desde 02/09/2026)

Desenvolvimento e operação parados por tempo indeterminado — clientes ativos
seguem existindo, mas deixaram de ser gerenciados por este Hub. Antes de
retomar qualquer trabalho aqui, reative manualmente (nenhum destes é
automático):

- **GitHub Actions** `Cron dispatch` — desabilitado via `gh workflow disable`
  (estava disparando `/api/v1/cron/dispatch` a cada 30 min). Reativar com
  `gh workflow enable "Cron dispatch"`.
- **`vercel.json`** — cron diário removido (`crons: []`). Restaurar o schedule
  se o dispatcher voltar a ser necessário.
- **Deploy na Vercel / projeto Supabase** — decisão pendente do Lucas (pausar
  ou despublicar manualmente pelo dashboard); a CLI local não tinha sessão
  autenticada para fazer isso automaticamente.
- **BigQuery Data Transfer** (nível MCC, Google Cloud Console) — fora deste
  repo; pausar manualmente se aplicável, senão segue ingerindo dado sozinho.

---

## Stack

```
Frontend:  Next.js 15 + React 19 + TypeScript
Styling:   Tailwind CSS 3 com design system customizado (rem-based)
State:     Zustand 5 + Supabase Realtime
Backend:   Supabase (PostgreSQL + Auth + Realtime + Storage)
IA:        Vertex AI Gemini 2.5 (Flash, Pro) via @google/genai
APIs:      Google Ads API, Google Analytics Data API, Asaas webhook
Dados:     BigQuery — Data Transfer nativo do Google Ads no MCC → dataset google_ads (US, free tier)
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
│   ├── bigquery.ts       # Histórico Google Ads no BigQuery (tool ads_historico + relatório mensal)
│   ├── analytics-snapshots.ts # Helpers puros de snapshots (ehSnapshotSemanal)
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

```
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

| Token              | Light   | Dark    |
| ------------------ | ------- | ------- |
| `surface-base`     | #DADCE9 | #0a0a0b |
| `surface-card`     | #FFFFFF | #141416 |
| `surface-hover`    | #F4F4F8 | #1c1c1f |
| `surface-elevated` | #F9F9FD | #242428 |
| `surface-border`   | #CED0DE | #2a2a2e |

### Texto (CSS Vars)

| Token           | Light   | Dark    |
| --------------- | ------- | ------- |
| `ink-primary`   | #111111 | #fafafa |
| `ink-secondary` | #52525b | #a1a1aa |
| `ink-muted`     | #a1a1aa | #71717a |

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
5. **Feature entregue = registro no mesmo commit** — toda feature visível ao
   usuário entra em `src/data/changelog.ts` (nova versão no topo), e mudanças
   de produto (módulo, integração, lacuna fechada) atualizam
   `lib/ia/system-map.ts` (autoconhecimento da Gator). Nada de entregar e
   deixar o changelog/mapa para depois.

### Imports obrigatórios

```typescript
import { cn } from "@/lib/utils"; // cn() helper
import { supabase } from "@/lib/supabase"; // cliente Supabase
import { MainLayout } from "@/components/layout/MainLayout";
import { NomeDoIcone } from "lucide-react"; // ícones — import direto
```

### Padrão de componente de página

```tsx
"use client";

import { MainLayout } from "@/components/layout/MainLayout";

export default function NomeDaPagina() {
  return (
    <MainLayout title="Título" subtitle="Subtítulo opcional">
      <div className="page-enter">{/* conteúdo */}</div>
    </MainLayout>
  );
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

| Componente           | Arquivo                                    | Uso                                                                                                                                |
| -------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `MainLayout`         | `components/layout/MainLayout.tsx`         | Wrapper de página com title/subtitle/actions                                                                                       |
| `TopBar`             | `components/layout/TopBar.tsx`             | Barra superior (logo, busca, notif, tema)                                                                                          |
| `Sidebar`            | `components/layout/Sidebar.tsx`            | Nav lateral slim (hover expande)                                                                                                   |
| `RightSidebar`       | `components/layout/RightSidebar.tsx`       | Barra direita (ações contextuais)                                                                                                  |
| `StatusBar`          | `components/layout/StatusBar.tsx`          | Barra inferior (status, info)                                                                                                      |
| `NotificationDrawer` | `components/layout/NotificationDrawer.tsx` | Drawer (aberto pela RightSidebar) — abas Alertas (inadimplência, saldo Google baixo, onboarding parado, congelados) + Notificações |

### Props do MainLayout

```typescript
interface MainLayoutProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode; // botões no TopBar
  children: React.ReactNode;
}
```

---

## Rotas da Aplicação

| Rota                 | Módulo                               |
| -------------------- | ------------------------------------ |
| `/dashboard`         | Home / Morning Briefing / Bento Grid |
| `/clientes`          | Lista de clientes                    |
| `/clientes/novo`     | Formulário novo cliente              |
| `/clientes/[id]`     | Detalhe do cliente                   |
| `/financeiro`        | DRE + transações + inadimplentes     |
| `/analytics`         | Google Ads + GA4                     |
| `/relatorios`        | Relatórios automáticos               |
| `/tarefas`           | Task manager (lista + kanban)        |
| `/marketing`         | Calendário social                    |
| `/biblioteca`        | Componentes Astro + manifestos       |
| `/base-conhecimento` | Knowledge base interno               |
| `/operacional`       | Planos operacionais + fluxos         |
| `/portfolio`         | Portfólio de cases                   |
| `/prospectar`        | CRM de prospecção                    |
| `/configuracoes`     | Perfil, integrações, tema (7 abas)   |
| `/ajuda`             | Help center                          |
| `/portal/[token]`    | Portal do cliente (público)          |

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
├── webhook-asaas/          — processa pagamentos
├── regua-cobranca/         — cobranças automáticas
└── _shared/                — utils compartilhados (inclui test-mode.ts)
```

✅ **MODO PRODUÇÃO** — `TEST_MODE = false` em `_shared/test-mode.ts` desde 10/06/2026
(commit "virada para produção"). Para voltar ao modo de teste, ver docs/Arquivo/MODO_TESTE.md.

### Sync de Analytics

Os clients Google rodam em Node (SDKs `google-ads-api` / `@google-analytics/data`),
que **não funcionam em Deno** — por isso o sync é uma rota Next.js, não Edge Function.

- **Lógica:** `lib/analytics-sync.ts` (`sincronizarCliente`, `sincronizarTodos`) —
  agrega Google Ads + GA4 e faz upsert idempotente em `analytics_snapshots`
  (1 linha por fonte/período; constraint única via migration `20260606_*`).
  Grava DOIS períodos por fonte: mês corrente + última semana fechada seg–dom
  (base do relatório semanal). Leitores separam com `ehSnapshotSemanal`
  (`lib/analytics-snapshots.ts`) — nunca comparar mês vs semana. O sync também
  atualiza `clientes.saldo_google` (pré-pagas, GAQL `account_budget`) e o status
  `clientes.ultimo_sync_at/status/erro` (exibido na UI).
- **Regras que já quebraram produção (não regredir):**
  - Customer ID vai **sem hífen** para a API (`google-ads.ts` normaliza na
    borda; a API rejeita `123-456-7890`).
  - GA4 **nunca** recebe fim de período no futuro (`clampFim` em
    `google-analytics.ts` — com `totalRevenue`, o Google falha com
    "Future currency exchange rate not exist").
  - Falha de API **lança** exceção e o sync marca `erro` — retornar `[]`/zeros
    no catch mascarou semanas de snapshots vazios.
- **Histórico granular (BigQuery):** Data Transfer nativo do Google Ads no
  nível do MCC → dataset `google_ads` (tabelas `ads_*_<CID>`, diário + backfill;
  conta nova no MCC entra sozinha). `lib/bigquery.ts` consulta
  (campanha/dia/keyword, comparativos) — usado pela tool `ads_historico` da
  Gator e pelo relatório mensal auto-preenchido (`/api/v1/relatorios/generate`,
  fallback na API ao vivo enquanto a conta não carrega no BQ).
- **Analytics 2.0 (dashboards que substituem o Looker):** camadas de dados
  `lib/ads-detalhes.ts` (BigQuery primário + fallback GAQL com MESMO shape;
  hora do dia é GAQL-only — `HourlyCampaignStats` segmenta por click_type e
  duplica impressões; impression share agregado derivado do nível de campanha)
  e `lib/ga4-detalhes.ts` (sempre `clampFim`; KPIs comparam 2 períodos em 1
  runReport). Cache `analytics_detalhes` (TTL 6h/7d) via `lib/analytics-detalhes.ts`
  + rota `GET /api/analytics/[id]/detalhes` — cache indisponível nunca bloqueia;
  renovação que falha serve o dado antigo marcado `desatualizado`. UI: abas
  Tráfego/Site em `/analytics` (componentes em `components/analytics/trafego|site/`),
  portal didático server-rendered (`components/portal/AnalyticsDidatico.tsx`),
  gauge de verba por PLANO (`planos_servico.limite_midia_mensal`). Gator: tool
  `analytics_detalhes`. Período/comparativo compartilhados em `lib/analytics-periodo.ts`.
- **Rota:** `POST /api/v1/analytics/sync` (botão "Sincronizar" na UI, sessão) e
  `GET` (Vercel Cron, header `Authorization: Bearer $CRON_SECRET`).
- **Agendamento:** dispatcher `/api/v1/cron/dispatch` (GitHub Actions a cada 30 min + fallback diário no `vercel.json`), horário configurável em Configurações → Automações. Requer env `CRON_SECRET`.

### Automação de Email

Emails automáticos são **desativados por padrão** e ligados individualmente
em Configurações (toggles em `automation_settings`). Nenhum email sai sem o
toggle correspondente estar ativo.

- **Templates:** editáveis em Configurações → Templates de Email. Base em
  `lib/email.ts`; overrides em `email_templates` (ver seção de migrations).
- **Helper:** `lib/email-automation.ts` (`dispararEmailAutomatico`) checa o
  toggle, resolve template (override→código), envia via Resend e loga em
  `email_logs`. Roda no lado Node (SDK Resend não roda em Deno).
- **Fluxos (toggle → trigger):**
  - `email_relatorio_mensal` → ao gerar relatório (`POST /api/analytics/[id]`), email ao cliente.
  - `email_cobranca_vencida` → `GET/POST /api/v1/cobranca/run`, por estágio de [lib/cobranca.ts] (D+7 reminder, D+15/D+30 follow-up).
  - `email_alerta_critico` → `GET/POST /api/v1/alertas/notificar`, resumo ao operador (env `ALERT_EMAIL`).
- **Crons:** dispatcher de agendamentos (cobrança e alertas com horários configuráveis em Configurações → Automações). Requerem `CRON_SECRET`.
- **Env necessárias:** `RESEND_API_KEY`, `EMAIL_FROM`, `ALERT_EMAIL`.

### Agente IA "Gator" (chat global com acesso total)

A IA do Hub é um **agente com function calling** (Gemini Flash via Vertex), não
um chat de texto: ela consulta e opera o sistema de verdade. Persona: **Gator**,
sócia-operadora — direta, proativa, respostas curtas por padrão (economia de
tokens definida no system prompt).

- **Backend:** `POST /api/ia/agent` — loop agêntico (máx 10 passos). Toolbox em
  `lib/ia/tools.ts` (~25 ferramentas): CRUD de clientes/tarefas/financeiro/
  posts/prospects, alertas, notificações, analytics (snapshots e `ads_ao_vivo`
  via `/api/analytics/[id]/live`, payload compactado), histórico, busca global,
  memória de cliente, memória própria, `status_sistema` (checa `/api/status`) e
  `mapa_do_sistema` (autoconhecimento do produto + toggles de automação).
  Tudo roda com service role e **toda query filtra/verifica `user_id`**.
- ⚠️ **Ao mudar o produto** (módulo novo, integração, lacuna fechada), atualize
  `lib/ia/system-map.ts` — é o autoconhecimento da Gator para sugerir melhorias.
- **Persistência:** `ia_conversas`, `ia_mensagens`, `ia_memoria` (migration
  `20260613_ia_agente.sql`, RLS owner-scoped). A memória de longo prazo
  (`ia_memoria`) é injetada no system prompt de toda conversa; o agente salva
  fatos com `salvar_memoria` quando o usuário ensina algo.
- **UI:** painel global em todas as páginas (**Ctrl+I** ou botão "Assistente IA"
  da RightSidebar) com modo expandido + lista de sessões (renomear/excluir/
  exportar .md). Widget do dashboard (`GeminiChat`) usa o **mesmo motor e mesma
  conversa ativa** via `lib/store/assistant-store.ts`. Componentes em
  `components/ia/` (`ChatThread`, `Composer`, `Markdown`).
- **Multimodal:** envio de imagens (upload ou colar print — comprimidas no
  client), arquivos `.md/.txt/.csv/.json`, ditado por voz (Web Speech API
  pt-BR), leitura da resposta em voz alta (speechSynthesis) e export da
  conversa em `.md`.
- **Contexto:** o agente recebe data/hora SP, página atual, panorama da agência,
  cliente em contexto (seletor no painel) e memória do cliente.
- `/api/ia/chat` permanece apenas como **completion one-shot** (recomendações
  em Analytics, gerar memória de cliente) — sem actions, sem sessão.

---

## Componentes UI Disponíveis

| Componente         | Arquivo                              | Uso                                                             |
| ------------------ | ------------------------------------ | --------------------------------------------------------------- |
| `Button`           | `components/ui/Button.tsx`           | Botão com variantes (primary, secondary, ghost, danger, subtle) |
| `ConfirmDialog`    | `components/ui/ConfirmDialog.tsx`    | Dialog de confirmação global (via Zustand)                      |
| `ContextMenu`      | `components/ui/ContextMenu.tsx`      | Menu de contexto (right-click ou botão)                         |
| `TaskModal`        | `components/ui/TaskModal.tsx`        | Modal criar/editar tarefa                                       |
| `DrawerEditor`     | `components/ui/DrawerEditor.tsx`     | Drawer lateral com editor de conteúdo                           |
| `GlobalSearch`     | `components/ui/GlobalSearch.tsx`     | Busca global (Ctrl+K)                                           |
| `ShortcutsOverlay` | `components/ui/ShortcutsOverlay.tsx` | Overlay de atalhos (?)                                          |
| `Tooltip`          | `components/ui/Tooltip.tsx`          | Tooltip simples                                                 |
| `Motion`           | `components/ui/Motion.tsx`           | Wrappers de animação Framer Motion                              |

### Padrão de ConfirmDialog (substituiu confirm() nativo)

```typescript
// Em vez de: if (confirm('Deletar?')) { ... }
// Usar:
import { useConfirmDialogStore } from "@/lib/hooks/useConfirmDialog";

function handleDelete(id: string) {
  const openConfirm = useConfirmDialogStore.getState().openConfirm;
  openConfirm("Título do Dialog", "Mensagem de confirmação.", async () => {
    // lógica async aqui
  });
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
- [x] Agente IA global — function calling com toolbox completo, sessões persistentes, memória de longo prazo, multimodal (imagem/voz/.md), Ctrl+I em qualquer página
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
- [x] ~~Analytics — integração real~~ — **EM PRODUÇÃO com dados reais desde 07/07/2026** (credenciais OK local e Vercel). Conectar cliente novo = preencher IDs + ligar toggles + validar com o botão "Testar conexão" no detalhe do cliente.
- [x] ~~analytics_snapshots vazio~~ — sync implementado: `lib/analytics-sync.ts` + `POST/GET /api/v1/analytics/sync`. Roda pelo botão "Sincronizar" na página Analytics (manual) e pelo dispatcher de agendamentos (GitHub Actions a cada 30 min + fallback diário no `vercel.json`; horário configurável em Configurações → Automações). Requer env `CRON_SECRET`.
- [ ] Notificações WhatsApp — hoje o envio é via `wa.me` (link manual). Automação de envio fora de escopo por ora.
- [x] ~~Notificações Email automáticas~~ — implementadas e **desativadas por padrão** (toggles em Configurações → automação). Templates editáveis em Configurações → Templates de Email. 3 fluxos: relatório pronto→cliente, régua de cobrança→cliente, alertas→operador. Falta só `RESEND_API_KEY` + ligar os toggles. Ver seção "Automação de Email" abaixo.
- [ ] RBAC/RLS por usuário no Supabase (isolamento hoje é por `user_id` na aplicação)
- [ ] Publicação real de posts via Meta API
- [x] ~~TEST_MODE=false para webhook-asaas e regua-cobranca~~ — em produção desde 10/06/2026 (`_shared/test-mode.ts`)

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
