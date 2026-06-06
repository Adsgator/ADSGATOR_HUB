# ADSGATOR HUB — Arquitetura Completa

**Última atualização:** 26 de maio de 2026  
**Versão:** 0.6.0  
**Status:** Produção com mode de teste ativo

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estrutura de Diretórios](#estrutura-de-diretórios)
4. [Arquitetura de Camadas](#arquitetura-de-camadas)
5. [Banco de Dados](#banco-de-dados)
6. [Fluxos de Dados](#fluxos-de-dados)
7. [Módulos Funcionais](#módulos-funcionais)
8. [Sistema de Autenticação](#sistema-de-autenticação)
9. [Design System](#design-system)
10. [Edge Functions (Backend)](#edge-functions-backend)
11. [APIs Internas](#apis-internas)
12. [Estado Global (Zustand)](#estado-global-zustand)
13. [Padrões e Convenções](#padrões-e-convenções)
14. [Segurança e RBAC](#segurança-e-rbac)
15. [Performance e Otimizações](#performance-e-otimizações)
16. [Lacunas Conhecidas](#lacunas-conhecidas)

---

## Visão Geral

**ADSGATOR HUB** é um sistema operacional interno para agências de marketing digital, construído como **SPA (Single Page Application)** com React/Next.js, com backend em **PostgreSQL via Supabase** e **IA via Vertex AI**.

### Funcionalidades Principais

- **Gestão de Clientes** — Onboarding, checklist, auditoria, performance
- **Financeiro** — DRE, receitas/despesas, inadimplentes, regra de cobrança automática
- **Analytics** — Google Ads, GA4, mapa geográfico, relatórios
- **Tarefas** — Task manager com drag-drop, grouping, filtros, adiamento
- **Marketing** — Calendário de posts, KPIs, status (rascunho/agendado/publicado)
- **Relatórios** — Solicitação e geração com IA (Gemini)
- **Biblioteca** — Componentes Astro + gerador de manifesto
- **Dashboard** — Morning Briefing, KPIs, alertas, gráficos, Gemini Chat
- **Integrações** — Supabase Auth, Google APIs, Asaas (webhooks), Vertex AI
- **Configurações** — Perfil, notificações, integrações, financeiro, tema, equipe, auditoria

---

## Stack Tecnológico

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (Client-Side Rendering + SSR)                │
├─────────────────────────────────────────────────────────┤
│ Framework:      Next.js 15 (App Router)                 │
│ UI Library:     React 19                                │
│ Language:       TypeScript 5                            │
│ Styling:        Tailwind CSS 3 + CSS Variables          │
│ State Mgmt:     Zustand 5                               │
│ Charts:         Recharts 3.8                            │
│ Drag-Drop:      @hello-pangea/dnd 18.0 + GridLayout    │
│ Icons:          lucide-react 0.441                      │
│ Fonts:          Geist Sans + Geist Mono                 │
│ Notifications:  sonner 2.0                              │
│ Maps:           react-leaflet 5 + leaflet 1.9           │
│ Analytics:      @google-analytics/data 6.0              │
│ Google Ads:     google-ads-api 23.0                     │
│ Vertex AI:      @google-cloud/vertexai 1.12             │
│ HTTP:           Supabase.js + fetch API                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  BACKEND (Edge Functions + PostgreSQL)                  │
├─────────────────────────────────────────────────────────┤
│ Platform:       Supabase (Google Cloud)                 │
│ Database:       PostgreSQL 15+ com PostGIS             │
│ Auth:           Supabase Auth (JWT, OAuth2 ready)       │
│ Realtime:       Supabase Realtime (WebSocket)           │
│ Storage:        Supabase Storage (S3-compatible)        │
│ Edge FN:        Deno Runtime + TypeScript               │
│ IA:             Vertex AI (Gemini Flash/Pro)            │
│ Webhooks:       Asaas (pagamentos)                      │
│ Crons:          Realtime Scheduler (cron-like)          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  DEPLOYMENT                                             │
├─────────────────────────────────────────────────────────┤
│ Frontend:       Vercel (Next.js)                        │
│ Backend:        Supabase (Google Cloud + Deno)          │
│ Database:       Supabase PostgreSQL Managed             │
│ Storage:        Google Cloud Storage via Supabase       │
│ Secrets:        Environment variables (.env.local)      │
└─────────────────────────────────────────────────────────┘
```

---

## Estrutura de Diretórios

```
adsgator-hub/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (app)/                    # Rotas autenticadas (RLS)
│   │   │   ├── dashboard/            # Página inicial (Morning Briefing, KPIs, Ações)
│   │   │   ├── clientes/             # Lista de clientes + detalhes + novo
│   │   │   │   ├── page.tsx          # Lista com filtros/busca
│   │   │   │   ├── novo/page.tsx     # Form novo cliente
│   │   │   │   ├── [id]/page.tsx     # Detalhe do cliente (checklist, timeline, integrações)
│   │   │   │   └── [id]/layout.tsx   # Layout específico
│   │   │   ├── financeiro/
│   │   │   │   ├── page.tsx          # DRE + transações + inadimplentes
│   │   │   │   ├── layout.tsx
│   │   │   │   └── componentes (modais, tabelas)
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx          # Overview Google Ads + GA4
│   │   │   │   ├── layout.tsx
│   │   │   │   └── [clienteId]/ (detalhe por cliente)
│   │   │   ├── relatorios/
│   │   │   │   ├── page.tsx          # Solicitação + histórico
│   │   │   │   └── layout.tsx
│   │   │   ├── tarefas/
│   │   │   │   ├── page.tsx          # Lista com drag-drop, filtros, grouping
│   │   │   │   ├── layout.tsx
│   │   │   │   └── modals/
│   │   │   ├── marketing/
│   │   │   │   ├── page.tsx          # Calendário 4 semanas
│   │   │   │   ├── layout.tsx
│   │   │   │   └── modals/
│   │   │   ├── biblioteca/
│   │   │   │   ├── page.tsx          # Browse componentes Astro
│   │   │   │   └── layout.tsx
│   │   │   ├── configuracoes/
│   │   │   │   ├── page.tsx          # 7 abas (perfil, notif, integ, fin, aparência, equipe, auditoria)
│   │   │   │   ├── layout.tsx
│   │   │   │   └── componentes/
│   │   │   ├── ajuda/
│   │   │   │   ├── page.tsx          # Help center
│   │   │   │   └── layout.tsx
│   │   │   └── layout.tsx            # Layout principal com Sidebar/TopBar/RightSidebar/StatusBar
│   │   ├── api/                      # API routes (Next.js)
│   │   │   ├── ia/
│   │   │   │   ├── copy/route.ts     # Gerar copy de anúncio
│   │   │   │   ├── hashtags/route.ts # Gerar hashtags (⚠️ NOT IMPLEMENTED)
│   │   │   │   ├── chat/route.ts     # Chat com Gemini
│   │   │   │   ├── morning-briefing/route.ts # Briefing IA
│   │   │   ├── analytics/
│   │   │   │   ├── [clienteId]/route.ts      # Overview Google Ads + GA4
│   │   │   │   └── [clienteId]/live/route.ts # Live data polling
│   │   │   ├── search/route.ts       # Global search
│   │   │   └── weather/route.ts      # Weather (WeatherClock)
│   │   ├── login/                    # Página de login (redirecionada por middleware)
│   │   ├── layout.tsx                # Root layout (fonts, tema, Toaster)
│   │   ├── page.tsx                  # Redirect / → /dashboard
│   │   ├── not-found.tsx             # 404
│   │   ├── error.tsx                 # Error boundary
│   │   └── globals.css               # CSS vars, animações, utilities
│   │
│   ├── components/
│   │   ├── layout/                   # Shell components
│   │   │   ├── MainLayout.tsx        # Wrapper para páginas (title, subtitle, actions)
│   │   │   ├── TopBar.tsx            # Barra superior
│   │   │   ├── Sidebar.tsx           # Nav lateral slim
│   │   │   ├── RightSidebar.tsx      # Barra direita (ações contextuais)
│   │   │   ├── StatusBar.tsx         # Barra inferior (status)
│   │   │   ├── NotificationBell.tsx  # Bell icon + drawer
│   │   │   ├── NotificationDrawer.tsx
│   │   │   ├── FloatingChat.tsx      # Chat flutuante (Gemini)
│   │   │   └── ChangelogDrawer.tsx   # Changelog
│   │   │
│   │   ├── ui/                       # Componentes primitivos
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── ContextMenu.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── GlobalSearch.tsx
│   │   │   ├── HelpChatButton.tsx
│   │   │   ├── InputPremium.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── SkeletonLine.tsx
│   │   │   ├── KpiCardPremium.tsx
│   │   │   └── OnboardingWizard.tsx
│   │   │
│   │   ├── clientes/
│   │   │   ├── ClienteCard.tsx       # Card de cliente com mini-infos
│   │   │   ├── ChecklistCard.tsx     # Checklist de onboarding
│   │   │   ├── AuditTimeline.tsx     # Timeline de ações
│   │   │   ├── ClientePerformance.tsx # Gráficos de performance
│   │   │   ├── ClienteIntegracoes.tsx # Google Ads, GA4, Asaas
│   │   │   ├── ClienteMemoria.tsx    # Arquivo .md de contexto IA
│   │   │   ├── AcessoRapido.tsx
│   │   │   └── WhatsAppTemplateModal.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── BentoCard.tsx         # Card responsivo (Bento Grid)
│   │   │   ├── MorningBriefing.tsx   # Chamada à Edge Fn
│   │   │   ├── AcoesDoDia.tsx        # Tarefas de hoje
│   │   │   ├── AlertasCriticos.tsx   # Alertas (inadimplentes, etc)
│   │   │   ├── KpiCard.tsx           # Card de KPI
│   │   │   ├── KpiCompactCard.tsx
│   │   │   ├── DRESparkline.tsx      # Mini DRE com gráfico
│   │   │   ├── WeatherClock.tsx      # Clock + Weather
│   │   │   ├── PortfolioHero.tsx     # Hero do dashboard
│   │   │   ├── RecentTransactions.tsx # Últimas transações
│   │   │   ├── ActivityFeed.tsx      # Feed de atividades
│   │   │   ├── TrendingOnMarket.tsx  # Tendências de mercado
│   │   │   ├── QuickExchange.tsx     # Cotações
│   │   │   ├── ClienteProgressCard.tsx
│   │   │   ├── AlertaSaldoGoogle.tsx
│   │   │   └── GeminiChat.tsx        # Chat flutuante
│   │   │
│   │   ├── analytics/
│   │   │   ├── GA4Panel.tsx          # Google Analytics 4 UI
│   │   │   ├── AdsOverviewKpis.tsx   # Google Ads KPIs
│   │   │   ├── SearchTermsTable.tsx  # Termos de busca
│   │   │   ├── DemographicsCard.tsx  # Dados demográficos
│   │   │   ├── DeviceBreakdown.tsx   # Breakdown de dispositivos
│   │   │   ├── TrafficSources.tsx    # Fontes de tráfego
│   │   │   ├── GeographyBreakdown.tsx # Por país/região
│   │   │   ├── AnalyticsMap.tsx      # Mapa interativo (Leaflet)
│   │   │   └── (componentes específicos)
│   │   │
│   │   ├── configuracoes/
│   │   │   ├── AuditLogViewer.tsx    # Visualizador de auditoria
│   │   │   └── (componentes de abas)
│   │   │
│   │   └── (outros diretórios por módulo)
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Cliente Supabase (browser)
│   │   │   └── server.ts (se houver) # Cliente Supabase (server-side)
│   │   ├── hooks/
│   │   │   ├── useClientes.ts        # Hook customizado para clientes
│   │   │   └── usePermissoes.ts      # Hook para RBAC
│   │   ├── store/
│   │   │   ├── useAppStore.ts        # Zustand store global
│   │   │   └── right-sidebar-context.tsx # Context para RightSidebar
│   │   ├── supabase.ts               # Exportações principais Supabase
│   │   ├── auth.ts                   # Funções de autenticação
│   │   ├── database.ts               # Queries tipadas (database layer)
│   │   ├── utils.ts                  # cn() e utilidades gerais
│   │   ├── vertex-ai.ts              # Integração Vertex AI (Gemini)
│   │   ├── google-ads.ts             # Google Ads API client
│   │   ├── google-analytics.ts       # GA4 API client
│   │   ├── rbac.ts                   # Role-Based Access Control
│   │   ├── audit.ts                  # Audit logging
│   │   ├── health-score.ts           # Cálculo de health score do cliente
│   │   ├── fluxo-operacional.ts      # Estados e transições de estágios
│   │   ├── financeiro.ts             # Cálculos financeiros
│   │   ├── relatorio-generator.ts    # Gerador de relatórios
│   │   ├── manifesto-generator.ts    # Gerador de manifesto de componente
│   │   ├── astro-components.ts       # Componentes Astro
│   │   └── city-coords.ts            # Coordenadas de cidades (para mapa)
│   │
│   ├── providers/
│   │   └── ThemeProvider.tsx         # Context de tema (dark/light)
│   │
│   └── data/
│       └── changelog.ts              # Histórico de versões
│
├── supabase/
│   ├── schema.sql                    # DDL completo das tabelas
│   ├── seed_test_data.sql            # Seed com 8 clientes de teste
│   ├── functions/
│   │   ├── deno.json                 # Config Deno para funções
│   │   ├── _shared/
│   │   │   └── test-mode.ts          # Helper TEST_MODE
│   │   ├── morning-briefing/
│   │   │   └── index.ts              # Morning Briefing IA (Gemini Pro)
│   │   ├── gerar-insight-ia/
│   │   │   └── index.ts              # Análise de campanha (Gemini Flash)
│   │   ├── gerar-relatorio-executivo/
│   │   │   └── index.ts              # Relatório executivo (Gemini Pro)
│   │   ├── gerar-relatorio-md/
│   │   │   └── index.ts              # Gerar .md para cliente
│   │   ├── gerar-relatorios-mensais/
│   │   │   └── index.ts              # Cron para gerar relatórios mensais
│   │   ├── webhook-asaas/
│   │   │   └── index.ts              # Webhook de pagamentos (TEST_MODE: true)
│   │   ├── regua-cobranca/
│   │   │   └── index.ts              # Regra de cobrança automática (TEST_MODE: true)
│   │   ├── memoria-cliente/
│   │   │   └── index.ts              # Armazenar memória do cliente
│   │   ├── processar-alertas/
│   │   │   └── index.ts              # Processar alertas periódicos
│   │   └── sentinela/
│   │       └── index.ts              # Monitor de saúde da aplicação
│   │
│   ├── migrations/
│   │   ├── 20240523_add_integracoes_clientes.sql
│   │   ├── 20240523_add_rbac_audit.sql
│   │   └── 20260525_add_posicao_tarefas.sql
│   │
│   └── (arquivos de gerenciamento local)
│
├── docs/
│   ├── ARQUITETURA.md                # Este arquivo
│   ├── GUIA_DESENVOLVIMENTO.md       # Setup, convenções, debug
│   ├── API_ENDPOINTS.md              # Documentação de rotas
│   ├── DATABASE.md                   # Schema comentado
│   ├── MODO_TESTE.md                 # Configuração TEST_MODE
│   └── CHANGELOG.md                  # Histórico de versões
│
├── public/
│   ├── favicon.ico
│   └── (assets estáticos)
│
├── .env.local                        # Variáveis de ambiente (GITIGNORE)
├── .env.example                      # Template de .env.local
├── .gitignore
├── package.json                      # Dependências npm
├── tsconfig.json                     # Configuração TypeScript
├── tailwind.config.js                # Configuração Tailwind (tokens CSS)
├── postcss.config.js                 # PostCSS plugins
├── next.config.js                    # Configuração Next.js
├── CLAUDE.md                         # Instruções do projeto
└── README.md                         # Overview público
```

---

## Arquitetura de Camadas

### 1. **Camada de Apresentação (Frontend)**

```
┌──────────────────────────────────────────────────────────┐
│                    PÁGINAS (*.tsx)                       │
│  dashboard | clientes | financeiro | analytics | ...    │
└────────────────┬─────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────┐
│               LAYOUT SHELL (MainLayout)                  │
│  TopBar | Sidebar | RightSidebar | StatusBar            │
└────────────────┬─────────────────────────────────────────┘
                 │
┌────────────────▼──────────────────────────────────────────┐
│           COMPONENTES DE NEGÓCIO                         │
│  ClienteCard | ChecklistCard | KpiCard | BentoCard ...  │
└────────────────┬──────────────────────────────────────────┘
                 │
┌────────────────▼──────────────────────────────────────────┐
│        COMPONENTES PRIMITIVOS (UI)                       │
│  Button | Card | Badge | Input | Modal | ...            │
└────────────────┬──────────────────────────────────────────┘
                 │
┌────────────────▼──────────────────────────────────────────┐
│         DESIGN SYSTEM (CSS Variables + Tailwind)         │
│  Cores | Tipografia | Espaçamento | Animações           │
└──────────────────────────────────────────────────────────┘
```

### 2. **Camada de Estado e Lógica**

```
┌──────────────────────────────────────────────────────────┐
│           ESTADO GLOBAL (Zustand)                        │
│  useAppStore — tema, usuário, notificações              │
└────────────────┬─────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────┐
│         HOOKS CUSTOMIZADOS                              │
│  useClientes | usePermissoes | useRealtime (Supabase)   │
└────────────────┬─────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────┐
│        CONTEXTOS (React Context API)                    │
│  ThemeProvider | RightSidebarContext                    │
└────────────────┬─────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────┐
│         CAMADA DE DADOS (Data Layer)                    │
│  database.ts | supabase/client.ts | API routes          │
└──────────────────────────────────────────────────────────┘
```

### 3. **Camada de API (Backend)**

```
┌──────────────────────────────────────────────────────────┐
│            NEXT.JS API ROUTES (src/app/api/)            │
│ /ia/* | /analytics/* | /search/* | /weather/*           │
└────────────────┬─────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────┐
│      EDGE FUNCTIONS (Supabase Deno Runtime)              │
│  morning-briefing | gerar-relatorio | webhook-asaas ... │
└────────────────┬─────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────┐
│       INTEGRAÇÕES EXTERNAS                              │
│  Google APIs | Vertex AI | Asaas                        │
└──────────────────────────────────────────────────────────┘
```

### 4. **Camada de Persistência**

```
┌──────────────────────────────────────────────────────────┐
│        SUPABASE POSTGRESQL DATABASE                      │
│  clientes | assinaturas | estagios_operacionais ...     │
│  historico_acoes | notificacoes | tarefas ...           │
└────────────────┬─────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────┐
│      SUPABASE REALTIME (WebSocket subscriptions)        │
│  Sync em tempo real de mudanças no DB                   │
└────────────────┬─────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────┐
│      SUPABASE STORAGE (Google Cloud Storage)            │
│  Arquivos de clientes, PDFs, imagens                    │
└──────────────────────────────────────────────────────────┘
```

---

## Banco de Dados

### Estrutura Principal

```sql
-- CORE
clientes
├── PK: id (UUID)
├── email (UNIQUE)
├── nome, whatsapp, dominio, nicho
├── status (recebido|onboarding|setup_trafego|ativo|congelado|cancelado)
├── google_ads_customer_id, ga4_property_id
├── cor_tema, metadata (JSONB)
└── data_criacao, data_atualizacao

-- ASSINATURAS & PAGAMENTOS
assinaturas
├── PK: id (UUID)
├── FK: cliente_id
├── plano_nome, valor_mensal
├── status (ativa|atraso_7_dias|atraso_15_dias|cancelado_debito)
├── data_proxima_cobranca, dias_atraso
├── asaas_subscription_id (integração)
└── created_at, updated_at

-- OPERACIONAL
estagios_operacionais
├── PK: id (UUID)
├── FK: cliente_id
├── estagio (pre_vendas|onboarding|setup_trafego|ativo|...)
├── acao_proxima, pendente_cliente
├── data_entrada, data_saida (NULL = estágio ativo)
└── created_at

-- AUDITORIA (immutable append-only log)
historico_acoes
├── PK: id (UUID)
├── FK: cliente_id
├── tipo_acao (acao_descritiva)
├── descricao, valor_impactado
├── usuario_id, data_acao
└── metadata (JSONB)

-- FINANCEIRO
financeiro_lancamentos
├── PK: id (UUID)
├── FK: cliente_id (opcional)
├── tipo (receita|despesa|antecipacao|...)
├── categoria, descricao
├── valor, data_lancamento
├── status (pendente|pago|cancelado)
└── metadata (JSONB)

-- TAREFAS
tarefas
├── PK: id (UUID)
├── FK: cliente_id (opcional)
├── titulo, descricao, status
├── prioridade (baixa|média|alta)
├── data_vencimento, data_conclusao
├── responsavel_id, posicao (para drag-drop)
└── metadata (JSONB)

-- NOTIFICAÇÕES
notificacoes
├── PK: id (UUID)
├── FK: usuario_id
├── tipo (alerta|info|sucesso|aviso)
├── titulo, mensagem, acao_url
├── lida, data_leitura
└── created_at

-- MARKETING
marketing_posts
├── PK: id (UUID)
├── FK: cliente_id
├── titulo, conteudo, image_url
├── status (rascunho|agendado|publicado)
├── canais (JSONB: instagram, facebook, linkedin, tiktok)
├── data_publicacao_agendada
├── metricas (likes, shares, comments)
└── created_at, updated_at

-- BIBLIOTECA
biblioteca_componentes
├── PK: id (UUID)
├── categoria, nome, slug
├── descricao, html, css, js
├── compatibilidade (astro|react|...)
├── stars, visualizacoes
└── metadata (JSONB)

-- MEMÓRIA IA
memoria_cliente
├── PK: id (UUID)
├── FK: cliente_id
├── conteudo (texto .md)
├── atualizado_em
└── versao
```

### Índices Principais

```sql
idx_clientes_status       — Filtrar por status
idx_clientes_email        — Buscar por email
idx_assinaturas_cliente   — Listar assinaturas do cliente
idx_assinaturas_status    — Filtrar por status de pagamento
idx_assinaturas_atraso    — Identificar inadimplentes
idx_historico_cliente     — Timeline de ações
idx_historico_data        — Ordenar por data
idx_tarefas_cliente       — Listar tarefas do cliente
idx_tarefas_status        — Filtrar por status
idx_notificacoes_usuario  — Listar notificações não lidas
```

### Políticas RLS (Row-Level Security)

```typescript
-- Authenticated users podem ver seus próprios dados
CREATE POLICY "Users can see own clients"
  ON clientes FOR SELECT
  USING (auth.uid() = owner_id);

-- Service role (Edge Functions) pode ver tudo
-- (bypass automático em Edge Functions)
```

---

## Fluxos de Dados

### Fluxo 1: Autenticação e Sessão

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuário faz login (email + senha) em /login           │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Supabase Auth gera JWT (access_token + refresh_token)│
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Token armazenado em cookies (SSR via @supabase/ssr)  │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Middleware valida sessão em todas as rotas (app)/*   │
│   → Redirect para /login se inválido                    │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 5. useAppStore salva usuário em Zustand (client-side)   │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 6. RLS automático filtra dados por owner_id             │
└─────────────────────────────────────────────────────────┘
```

### Fluxo 2: Carregamento de Dados (Cliente)

```
┌──────────────────────────────────────────────────────────┐
│ Página React monta → useEffect([])                       │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ Hook customizado (useClientes) chama database.ts        │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ database.ts envia Query Supabase:                        │
│  supabase.from('clientes').select('*')                   │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ Supabase filtra por RLS (owner_id = auth.uid())         │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ Dados retornam ao hook → setState()                      │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ Componentes renderizam com dados (+ skeleton loading)   │
└──────────────────────────────────────────────────────────┘
```

### Fluxo 3: Ação do Usuário (Criar Cliente)

```
┌──────────────────────────────────────────────────────────┐
│ 1. Usuário clica "Novo Cliente" → Form Modal abre       │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 2. Preenche: nome, email, whatsapp, nicho, domínio       │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 3. Clica Salvar → handleSubmit() valida form             │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 4. database.createCliente() envia INSERT:                │
│   supabase.from('clientes').insert({...})                │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 5. Edge Function webhook dispara:                        │
│   - Inserir em estagios_operacionais (pré-vendas)       │
│   - Registrar em historico_acoes (auditoria)            │
│   - Criar entrada em memoria_cliente                    │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 6. Realtime Supabase notifica subscribers               │
│   → Hook useEffect(Realtime) dispara                    │
│   → Estado local atualiza (nova linha em lista)         │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 7. Toast de sucesso exibido (sonner)                    │
│   → Modal fecha                                          │
│   → Usuário vê novo cliente na lista                    │
└──────────────────────────────────────────────────────────┘
```

### Fluxo 4: Processamento de Webhook (Pagamento)

```
┌──────────────────────────────────────────────────────────┐
│ 1. Asaas envia webhook: POST /functions/webhook-asaas    │
│    (evento: payment_confirmed, payment_overdue, etc)    │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 2. Edge Function valida assinatura (HMAC)               │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 3. Se TEST_MODE=true, apenas loga (não modifica DB)     │
│   Se TEST_MODE=false, atualiza status                   │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 4. Se pagamento confirmado:                              │
│   - UPDATE assinaturas SET dias_atraso=0                 │
│   - INSERT historico_acoes (log de cobrança)             │
│   - Criar notificação (Supabase → UI)                   │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 5. UI recebe notificação via Realtime                   │
│   → Toast e alerta em tempo real                        │
└──────────────────────────────────────────────────────────┘
```

### Fluxo 5: Geração de Relatório com IA

```
┌──────────────────────────────────────────────────────────┐
│ 1. Usuário clica "Gerar Relatório" → Modal abre         │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 2. Seleciona período (semanal/mensal) e clica Gerar     │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 3. POST /api/ia/... chama Edge Function:                 │
│   gerar-relatorio-executivo (Gemini Pro)                │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 4. Edge Function:                                        │
│   a) Busca dados do cliente (KPIs, receitas, etc)       │
│   b) Coleta contexto de memoria_cliente                 │
│   c) Monta prompt para Gemini Pro                       │
│   d) Chamada Vertex AI.generateContent()                │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 5. Gemini gera markdown + insights (3-5 min)            │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 6. Edge Function salva em:                               │
│   - relatorios (registro)                                │
│   - Supabase Storage (arquivo .md)                       │
│   - historico_acoes (auditoria)                          │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 7. Resposta retorna ao cliente                           │
│   → Estado atualiza (nova linha em histórico)           │
│   → Toast de sucesso                                    │
│   → Link para download do .md                           │
└──────────────────────────────────────────────────────────┘
```

---

## Módulos Funcionais

### 1. Dashboard

**Objetivo:** Home operacional — KPIs, tarefas, alertas, IA insights

**Componentes:**
- `PortfolioHero` — Hero com saudação e data
- `BentoCard` + `react-grid-layout` — Cards redimensionáveis
- `MorningBriefing` — Chamada a `/api/ia/morning-briefing`
- `AcoesDoDia` — Tarefas para hoje
- `AlertasCriticos` — Inadimplentes, vencimentos próximos
- `KpiCard` — Revenue, clientes, taxa de sucesso
- `DRESparkline` — Mini gráfico de fluxo
- `WeatherClock` — Relógio + clima
- `GeminiChat` — Chat flutuante (IA)
- `RecentTransactions`, `ActivityFeed`, `TrendingOnMarket`

**Data Source:**
- `clientes` (COUNT, status)
- `assinaturas` (valor_mensal SUM, dias_atraso)
- `financeiro_lancamentos` (receita/despesa)
- `tarefas` (status = 'aberta' AND data_vencimento = TODAY)
- `historico_acoes` (últimas ações)

**Realtime:** Sim (Supabase Realtime subscriptions)

---

### 2. Clientes

**Objetivo:** Gestão completa de clientes — onboarding, performance, auditoria

#### 2.1 Lista (/clientes)

**Componentes:**
- `ClienteCard` — Card com status, MRR, dias atraso, ações rápidas
- Filtros: status, nicho, performance
- Busca por nome/email
- Bulk actions (change status, delete)

**Dados:**
- Lista de clientes com relatório JOIN assinaturas

#### 2.2 Novo (/clientes/novo)

**Componentes:**
- Form com validação
- Campos: nome, email, whatsapp, nicho, domínio, cor_tema

**Ações:**
- INSERT clientes
- INSERT estagios_operacionais (pré-vendas)
- INSERT memoria_cliente (vazio, preenchido depois)

#### 2.3 Detalhe (/clientes/[id])

**Componentes:**
- `ChecklistCard` — Checklist por estágio
- `AuditTimeline` — Timeline de historico_acoes
- `ClientePerformance` — Gráficos (Google Ads, GA4)
- `ClienteIntegracoes` — Status de integrações (Google Ads ID, GA4 ID, Asaas)
- `ClienteMemoria` — Arquivo .md de contexto IA (edit inline)
- `AcessoRapido` — Botões para ações comuns

**Dados:**
- cliente (detalhes)
- assinaturas (histórico de cobranças)
- estagios_operacionais (estágio atual)
- historico_acoes (timeline)
- memoria_cliente (contexto IA)
- analytics (Google Ads, GA4)

---

### 3. Financeiro

**Objetivo:** DRE, transações, inadimplentes, regra de cobrança

**Componentes:**
- DRE table (receita - despesa = saldo)
- Gráfico de receita/mês
- Tabela de lancamentos com filtros
- Lista de inadimplentes (dias_atraso > 0)
- Ações: pagar manualmente, adiar cobrança, cancelar

**Dados:**
- `financeiro_lancamentos` (receitas e despesas)
- `assinaturas` (dias_atraso > 0)

**Realtime:** Sim (para atualizar DRE em tempo real)

**Webhook:** `regua-cobranca` (cron → automático)

---

### 4. Analytics

**Objetivo:** Google Ads + GA4 integrados

**Componentes:**
- `AdsOverviewKpis` — Impressions, Clicks, Cost, Conv, ROAS
- `GA4Panel` — Sessões, usuários, bounce rate, conversões
- `SearchTermsTable` — Top search queries
- `DemographicsCard` — Age, gender, interests
- `DeviceBreakdown` — Mobile vs Desktop
- `TrafficSources` — Organic, Paid, Direct, etc
- `GeographyBreakdown` — Por país/região
- `AnalyticsMap` — Mapa interativo (Leaflet)

**Data Source:**
- Google Ads API (via `/api/analytics/[clienteId]`)
- Google Analytics Data API (via `/api/analytics/[clienteId]`)

**Status:** UI pronta, credenciais não configuradas (pendente)

---

### 5. Tarefas

**Objetivo:** Task manager com drag-drop, filtros, grouping

**Componentes:**
- Lista com `@hello-pangea/dnd` + react-grid-layout
- Filtros: status, prioridade, responsável, cliente
- Grouping: por status, prioridade, data
- TaskModal: criar/editar tarefa
- Context menu: concluir, adiá, deletar
- Posição salva no DB (reorder persistente)

**Dados:**
- `tarefas` (titulo, descricao, status, prioridade, data_vencimento, posicao)

**Realtime:** Sim

---

### 6. Marketing

**Objetivo:** Calendário de posts com KPIs

**Componentes:**
- Calendário semanal (4 semanas à frente)
- Card de post por dia (status: rascunho/agendado/publicado)
- Modal: criar/editar post
- Seleção de canais (Instagram, Facebook, LinkedIn, TikTok)
- KPIs por canal (reach, engagement, clicks)

**Dados:**
- `marketing_posts` (titulo, conteudo, status, canais, data_publicacao)

**Integração:** Meta API (pendente)

---

### 7. Biblioteca

**Objetivo:** Componentes Astro + gerador de manifesto

**Componentes:**
- Browse por categoria
- Visualizador de código (syntax highlighting)
- Construtor visual (live preview)
- Gerador de manifesto .md
- Stars/rating

**Dados:**
- `biblioteca_componentes` (categoria, html, css, js, compat)

---

### 8. Configurações

**Objetivo:** 7 abas de configuração

**Abas:**
1. **Perfil** — Nome, email, foto, bio
2. **Notificações** — Preferências (email, SMS, WhatsApp, push)
3. **Integrações** — Google Ads, GA4, Asaas
4. **Financeiro** — Dados bancários, margem de lucro, taxa de desconto
5. **Aparência** — Tema (dark/light), fonte, zoom
6. **Equipe** — Usuários, roles (admin/manager/view-only), permissões
7. **Auditoria** — AuditLogViewer (filtros por tipo, data, usuário)

**Dados:**
- `auth.users` (perfil)
- `usuarios` (roles, permissions)
- `historico_acoes` (auditoria)
- JSONB em perfil (preferências)

---

### 9. Ajuda

**Objetivo:** Help center + FAQ + contato suporte

**Componentes:**
- FAQ (acordeão)
- Vídeos tutoriais
- Chat com suporte (FloatingChat)
- Versão do app (changelog)

---

## Sistema de Autenticação

### Flow: Supabase Auth + Next.js SSR

```typescript
// 1. Login (POST /api/auth/login)
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
// Retorna: access_token, refresh_token, expires_in

// 2. Cookie Storage (via @supabase/ssr)
// Automático na resposta — cookies httpOnly

// 3. Middleware Validation (src/middleware.ts)
const session = await supabase.auth.getSession();
if (!session) redirect('/login');

// 4. RLS Automático
// Todas as queries herdam auth.uid()
// Exemplo: SELECT * FROM clientes WHERE owner_id = auth.uid()

// 5. Refresh Token (automático)
// @supabase/ssr renova token antes da expiração
```

### Segurança

- **JWTs** — Assinados com chave privada Supabase
- **Cookies HttpOnly** — Inacessíveis ao JavaScript
- **CSRF** — Proteção automática via SameSite
- **RLS** — Filtragem no nível do banco
- **Rate Limiting** — Edge Functions com limite de chamadas

---

## Design System

### Cores

**Brand (Amarelo Adsgator):**
```
ads-50:  #FFF8E6   ads-100: #FFF0CD   ads-200: #FFE5A6
ads-300: #FFD67F   ads-400: #FFC857   ads-500: #FFB100 (principal)
ads-600: #E6A000   ads-700: #CC8E00   ads-800: #B37B00   ads-900: #8C6200
```

**Superfícies (CSS Vars — dark/light aware):**
```css
--surface-base:      #DADCE9 (light), #0a0a0b (dark)
--surface-card:      #FFFFFF (light), #141416 (dark)
--surface-hover:     #F4F4F8 (light), #1c1c1f (dark)
--surface-elevated:  #F9F9FD (light), #242428 (dark)
--surface-border:    #CED0DE (light), #2a2a2e (dark)
```

**Status:**
```
green:  #22c55e    orange: #f59e0b    red: #ef4444
blue:   #3b82f6    purple: #8b5cf6    cyan: #06b6d4
```

### Tipografia

**Fonte:** Geist Sans (sans) + Geist Mono (mono)

**Escala:**
```
2xs: 0.625rem  xs: 0.75rem  sm: 0.875rem  base: 1rem
lg: 1.125rem   xl: 1.25rem  2xl: 1.5rem   3xl: 1.875rem  4xl: 2.25rem
```

### Animações

```css
animate-fade-in       — 0.25s, fade + translateY
animate-fade-up       — 0.35s, fade + translateY (padrão)
animate-fade-scale    — 0.25s, fade + scale (modais/cards)
animate-slide-in-left — 0.25s, fade + translateX
animate-pulse-slow    — pulse 2s infinite

.stagger > *          — Filhos com delay crescente (30ms, 60ms, ...)
.page-enter           — Animação de entrada de página
.card-shadow          — Sombra em light, borda em dark
.card-interactive     — Hover lift + sombra
.focus-ring           — Outline premium com glow
```

---

## Edge Functions (Backend)

### 1. **morning-briefing** ⭐

Gera resumo diário com IA (Gemini Pro)

```
POST /functions/morning-briefing
Body: { cliente_id?, userId }
Returns: { briefing: string, gerado_em: ISO8601 }

Dados coletados:
- Clientes com status: ativo (COUNT)
- Assinaturas vencendo hoje
- Tarefas de hoje por prioridade
- Receita/despesa do mês (até hoje)
- Alertas críticos
- Último relatório gerado

Prompt: "Gere um resumo executivo matinal para agência de marketing..."
```

### 2. **gerar-insight-ia** 💡

Análise de campanha específica (Gemini Flash)

```
POST /functions/gerar-insight-ia
Body: { cliente_id, periodo: "semanal|mensal", tipo: "ads|analytics" }
Returns: { insight: string, metricas: {} }

Dados coletados:
- Google Ads data (ROAS, CPC, impressões)
- GA4 data (usuários, conversões, bounce rate)
- Histórico de performance (últimas 4 semanas)

Prompt: "Analise esta campanha e sugira otimizações..."
```

### 3. **gerar-relatorio-executivo** 📊

Relatório executivo semanal/mensal (Gemini Pro)

```
POST /functions/gerar-relatorio-executivo
Body: { cliente_id, periodo: "semanal|mensal" }
Returns: { relatorio: string, arquivo_url: string }

Dados coletados:
- KPIs de performance
- Análise de gastos
- Recomendações de otimização
- Próximas ações

Salva em: supabase/storage e relatorios tabela
```

### 4. **gerar-relatorio-md** 📝

Relatório para cliente em markdown

```
POST /functions/gerar-relatorio-md
Body: { cliente_id, data_inicio, data_fim }
Returns: { md: string, arquivo: url }

Formato markdown com:
- Capa (cliente, período, logo)
- Índice
- KPIs (tabela)
- Gráficos (descrições)
- Recomendações
- Assinatura
```

### 5. **gerar-relatorios-mensais** 🕐

Cron: Gera relatórios para todos os clientes no 1º dia do mês

```
Trigger: Cron (1º dia, 08:00)
Itera: todos os clientes com status = 'ativo'
Chama: gerar-relatorio-executivo para cada um
Salva: Em relatorios tabela + storage
Notifica: Cliente via notificacao tabela
```

### 6. **webhook-asaas** 💰

Processa webhooks de pagamento (Asaas)

```
POST /functions/webhook-asaas
Headers: X-Asaas-Webhook-Token (HMAC validation)
Body: { event, subscription, ... }

TEST_MODE = true:  Apenas loga (não modifica DB)
TEST_MODE = false: Atualiza assinaturas status

Eventos processados:
- PAYMENT_CONFIRMED      → dias_atraso = 0
- PAYMENT_OVERDUE        → dias_atraso += 7
- SUBSCRIPTION_CANCELLED → status = cancelado
```

### 7. **regua-cobranca** 🔔

Cron: Cobranças automáticas por escalonamento

```
Trigger: Cron (diário, 09:00)

Regras:
1. dias_atraso = 0 → nada
2. dias_atraso = 7 → notificação via WhatsApp
3. dias_atraso = 15 → e-mail + WhatsApp
4. dias_atraso > 30 → contato via call (escalação)

TEST_MODE = true:  Apenas cria notificações (sem enviar)
TEST_MODE = false: Envia e-mail, etc

Integra: Resend (e-mail). WhatsApp hoje via wa.me (link manual).
```

### 8. **memoria-cliente** 🧠

Armazena contexto IA do cliente (arquivo .md)

```
POST /functions/memoria-cliente
Body: { cliente_id, conteudo: string }

Atualiza:
- memoria_cliente tabela
- Supabase Storage (backup)

Chamado por:
- Novo cliente (template vazio)
- Usuário edita memo (save)
- Edge Fn (append novo contexto)
```

### 9. **processar-alertas** 🚨

Cron: Verifica alertas e cria notificações

```
Trigger: Cron (a cada 2 horas)

Verifica:
- Assinaturas vencendo em 3 dias
- Clientes com atraso
- Tarefas vencidas
- Marcos importantes

Cria: notificacoes tabela (notifica via Realtime)
Envia: Pushes (se habilitado no usuário)
```

### 10. **sentinela** 👁️

Cron: Monitor de saúde da aplicação

```
Trigger: Cron (a cada 30 min)

Monitora:
- Saúde de conexões DB
- Quota de API (Google)
- Erro rates
- Performance de Edge Fn

Armazena: Em tabela de logs
Alerta: Se alguma métrica vermelha
```

---

## APIs Internas

### 1. `/api/ia/copy` — Gerar Copy

```
POST /api/ia/copy
Body: { clienteId, tipo: "ad|email|social", contexto: string }
Returns: { copy: string }

Modelo: Gemini Flash
Latência: ~2-3s
```

### 2. `/api/ia/hashtags` — Gerar Hashtags

```
POST /api/ia/hashtags
Body: { tema: string, plataforma: "instagram|tiktok|twitter" }
Returns: { hashtags: string[] }

⚠️ NÃO IMPLEMENTADO (botão existe em Marketing, mas rota falta)
```

### 3. `/api/ia/chat` — Gemini Chat

```
POST /api/ia/chat
Body: { messages: { role, content }[] }
Returns: { response: string }

Modelo: Gemini Flash
Contexto: usuário + cliente (se houver)
Latência: ~2-3s
```

### 4. `/api/ia/morning-briefing` — Morning Briefing

```
GET /api/ia/morning-briefing?userId=...
Returns: { briefing: string }

Chama Edge Fn morning-briefing
Armazena em cache (1h)
```

### 5. `/api/analytics/[clienteId]` — Dados Agregados

```
GET /api/analytics/[clienteId]?periodo=7d
Returns: {
  ads: { impressions, clicks, cost, conversions, roas },
  ga4: { users, sessions, bounce_rate, conversions },
  comparacao: { vs_semana_anterior }
}

Integra: Google Ads API + GA4 Data API
Status: UI pronta, credenciais não configuradas
```

### 6. `/api/analytics/[clienteId]/live` — Dados em Tempo Real

```
GET /api/analytics/[clienteId]/live
Returns: { ads: {}, ga4: {} }

Polling rápido (5-10s)
Sem cache
```

### 7. `/api/search` — Busca Global

```
GET /api/search?q=termo
Returns: [
  { tipo: "cliente", nome, id },
  { tipo: "tarefa", titulo, id },
  { tipo: "relatorio", data, id }
]

Busca em: clientes, tarefas, relatorios, memoria_cliente
Filtro: RLS automático (só dados do usuário)
```

### 8. `/api/weather` — Clima e Hora

```
GET /api/weather?lat=...&lon=...
Returns: { temp, condition, icon, hora }

Chama: OpenWeatherMap (ou similar)
Cache: 30min
```

---

## Estado Global (Zustand)

### `useAppStore`

```typescript
interface AppStore {
  // Usuário
  user: User | null
  setUser: (user: User) => void
  logout: () => void

  // Tema
  isDark: boolean
  toggleTheme: () => void

  // Notificações
  notificacoes: Notificacao[]
  addNotificacao: (n: Notificacao) => void
  removeNotificacao: (id: string) => void

  // UI State
  sidebarExpanded: boolean
  toggleSidebar: () => void
  rightSidebarOpen: boolean
  setRightSidebarOpen: (open: boolean) => void

  // Cliente Selecionado
  clienteId: string | null
  setClienteId: (id: string) => void

  // Filtros
  filtros: {
    status?: string
    nicho?: string
    periodo?: string
  }
  setFiltros: (filtros: Partial<Filtros>) => void
}
```

**Persistência:** Zustand + localStorage (tema, sidebar state)

---

## Padrões e Convenções

### 1. Componentes

```typescript
// Página
'use client'
import { MainLayout } from '@/components/layout/MainLayout'

export default function NomeDaPagina() {
  return (
    <MainLayout title="Título" subtitle="Subtítulo">
      <div className="page-enter">
        {/* conteúdo */}
      </div>
    </MainLayout>
  )
}

// Componente de Negócio
interface Props {
  cliente: Cliente
  onAction?: (tipo: string) => void
}

export function ClienteCard({ cliente, onAction }: Props) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow card-interactive">
      {/* conteúdo */}
    </div>
  )
}

// Componente Primitivo
import { cn } from '@/lib/utils'

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn('px-[0.75rem] py-[0.5rem] rounded-lg bg-ads-500 text-white', className)} {...props} />
  )
}
```

### 2. Queries

```typescript
// src/lib/database.ts
export async function fetchClientes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*, assinaturas(*)')
    .eq('owner_id', user.id)
    .order('data_criacao', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data as Cliente[]
}

// Uso em componente
const clientes = await fetchClientes()
```

### 3. Modais

```typescript
'use client'

interface ClienteModalProps {
  open: boolean
  cliente?: Cliente
  onClose: () => void
  onSave: (cliente: ClienteFormData) => Promise<void>
}

export function ClienteModal({ open, cliente, onClose, onSave }: ClienteModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(cliente || {})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(form)
      toast.success('Salvo com sucesso')
      onClose()
    } catch (err) {
      toast.error('Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center animate-fade-scale">
      <form onSubmit={handleSubmit} className="bg-surface-card rounded-xl p-[2rem] w-full max-w-[28rem]">
        {/* campos do form */}
        <div className="flex gap-2 justify-end mt-[1.5rem]">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={loading}>Salvar</Button>
        </div>
      </form>
    </div>
  )
}
```

### 4. Hooks

```typescript
// src/lib/hooks/useClientes.ts
import { useEffect, useState } from 'react'
import { fetchClientes } from '@/lib/database'

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchClientes()
      .then(setClientes)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { clientes, loading, error }
}

// Uso
const { clientes, loading } = useClientes()
```

### 5. CSS Classes

```typescript
// NUNCA use dark: prefix
// Os CSS vars já são dark/light aware

// ✅ Correto
<div className="bg-surface-card text-ink-primary border border-surface-border">

// ❌ Errado
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">

// Animações
<div className="animate-fade-up">
<div className="stagger">
  {items.map(item => <div>{item}</div>)}
</div>

// Sombras
<div className="card-shadow">
<div className="card-interactive">  // hover lift
```

---

## Segurança e RBAC

### Row-Level Security (RLS)

Todas as tabelas têm políticas RLS que garantem:
- **Usuários autenticados** veem apenas seus dados
- **Service Role** (Edge Functions) pode ver tudo
- **Público** não tem acesso

```sql
CREATE POLICY "Users can only see own clientes"
  ON clientes FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can see all clientes"
  ON clientes FOR SELECT
  USING (is_admin(auth.uid()));
```

### Role-Based Access Control (RBAC)

Implementado em `src/lib/rbac.ts`:

```typescript
enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  VIEWER = 'viewer'
}

export function canCreateCliente(role: Role): boolean {
  return role === Role.ADMIN || role === Role.MANAGER
}

export function canDeleteCliente(role: Role, ownerId: string, currentUserId: string): boolean {
  return (role === Role.ADMIN) || (role === Role.MANAGER && ownerId === currentUserId)
}
```

### Auditoria

Todas as ações importantes são registradas em `historico_acoes`:

```sql
INSERT INTO historico_acoes (cliente_id, tipo_acao, descricao, usuario_id, metadata)
VALUES (cliente_id, 'CRIAR_CLIENTE', 'Novo cliente: João Silva', auth.uid(), '{"nicho": "SaaS"}')
```

Visualizável em Configurações → Auditoria

---

## Performance e Otimizações

### Frontend

1. **Code Splitting** — Next.js App Router automático
2. **Image Optimization** — next/image
3. **Lazy Loading** — `dynamic()` para componentes pesados
4. **Memoization** — `useMemo`, `useCallback` em componentes expensive
5. **State Management** — Zustand (menos bundle que Redux)
6. **CSS-in-JS** — Tailwind (purge automático)

### Backend

1. **Índices** — Criados para queries frequentes
2. **Query Optimization** — `select()` com colunas específicas
3. **Caching** — Edge Functions com cache de 1h para dados estáticos
4. **Realtime Efficient** — Subscribers em canais específicos, não wildcard
5. **Batch Operations** — Inserções em lote quando possível

### Database

1. **Índices** — status, cliente_id, data, email
2. **Particionamento** — (não implementado, pendente para escala)
3. **Vacuum** — Automático no Supabase PostgreSQL
4. **Connection Pooling** — Supabase + PgBouncer

---

## Lacunas Conhecidas

| Lacuna | Descrição | Impacto | Prioridade |
|--------|-----------|--------|-----------|
| `/api/ia/hashtags` | Rota não implementada | Botão em Marketing não funciona | Alta |
| Analytics Credenciais | Google Ads + GA4 sem credenciais configuradas | Dados vazios em Analytics | Alta |
| Notificações WhatsApp | Envio via wa.me (link manual); automação fora de escopo | Cobranças notificadas manualmente | Baixa |
| Notificações Email | Resend SDK falta implementar | Relatórios não enviam por email | Média |
| RBAC Completo | Apenas owner_id, sem roles/permissions | Acesso não granular | Média |
| Drag-drop Persistente | Tarefas arrastra mas não salva ordem | UX confusa | Média |
| Meta API | Publicação real de posts | Posts não publicam em rede | Média |
| TEST_MODE Documentação | Sem documentação de como desativar | Difícil passar para produção | Baixa |
| Particionamento DB | Sem partição de tabelas grandes | Lentidão em escala (1M+ registros) | Baixa |
| CI/CD | Sem pipeline de testes | Risco de regressão | Baixa |

---

## Roadmap de Conclusão

**v0.6.0** (Atual) — Core funcional
- ✅ Clientes, Financeiro, Tarefas, Marketing, Biblioteca
- ✅ Dashboard com IA (Morning Briefing)
- ✅ Autenticação + RLS
- ✅ Analytics UI (sem dados)

**v0.7.0** (Próxima)
- [ ] Implementar `/api/ia/hashtags`
- [ ] Configurar Google Ads + GA4 credenciais
- [ ] WhatsApp + Email notifications (live)
- [ ] Publicação real Meta API

**v1.0.0** (Production)
- [ ] RBAC completo com roles/permissions
- [ ] Drag-drop persistente (tarefas)
- [ ] Performance optimization (índices, cache)
- [ ] Documentação de TEST_MODE → PRODUCTION
- [ ] CI/CD pipeline
- [ ] SLA monitoring + alertas

---

## Conclusão

O **ADSGATOR HUB** é uma aplicação fullstack moderna, bem estruturada, com separação clara de responsabilidades:

- **Frontend:** React 19 + Next.js 15 com design system profissional
- **Backend:** Supabase + Edge Functions (Deno) com IA integrada
- **Database:** PostgreSQL com RLS e auditoria completa
- **IA:** Vertex AI (Gemini Flash/Pro) para insights e geração de conteúdo

A arquitetura suporta escalabilidade horizontalmente (Vercel + Supabase) e é fácil de manter através de padrões claros e convenções bem documentadas.

---

**Mantido por:** AdsGator Chief Engineer  
**Última atualização:** 26/05/2026 às 14:30 UTC
