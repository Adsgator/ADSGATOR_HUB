# ACTION PLAN SEMANAL — Premium SaaS Design
**Objetivo:** chegar em design premium em 5 dias (uma feature por dia)  
**Duração:** 1-2h por dia  
**Ferramenta:** Roo Code + DESIGN_REFINEMENT_GUIDE.md

---

## DIA 1 — PATTERN LIBRARY (2h)

**O que fazer:** Criar componentes reutilizáveis que serão base de tudo.

### Task 1.1 — Criar Card.tsx
```bash
# Copiar o código da Seção 1.1 do DESIGN_REFINEMENT_GUIDE
# Arquivo: src/components/ui/Card.tsx
# Testar: importar em dashboard/page.tsx, usar no Morning Briefing card
```

**Checklist:**
- [ ] Card.tsx criado com 4 variantes (default, interactive, highlight, minimal)
- [ ] Teste em dashboard — Morning Briefing card está com variant="highlight"
- [ ] Teste no seu navegador — dark mode funciona sem `.dark:` classes

### Task 1.2 — Criar KpiCardPremium.tsx
```bash
# Arquivo: src/components/dashboard/KpiCardPremium.tsx
# Copiar da Seção 1.2
# Testar: trocar todos os KPI cards da dashboard por KpiCardPremium
```

**Checklist:**
- [ ] KpiCardPremium.tsx criado
- [ ] Importado em `dashboard/page.tsx`
- [ ] Todos os KPI cards usando KpiCardPremium (MRR, DRE, etc.)
- [ ] Trends (seta verde/vermelha) aparecendo corretamente

### Task 1.3 — Criar StatusBadgePremium.tsx
```bash
# Arquivo: src/components/ui/StatusBadgePremium.tsx
# Copiar da Seção 1.3
# Testar: em clientes/page.tsx, trocar badges por StatusBadgePremium
```

**Checklist:**
- [ ] StatusBadgePremium.tsx criado com 6 estados
- [ ] Importado em `clientes/ClienteCard.tsx`
- [ ] Todos os status badges usando isso
- [ ] Animação `animate-pulse` em status crítico

**Fim do Dia 1:** Você tem a base de 80% dos componentes.

---

## DIA 2 — TIPOGRAFIA + SPACING (2h)

**O que fazer:** Deixar tudo com escala tipográfica profissional.

### Task 2.1 — Adicionar Classes de Tipografia
```bash
# Arquivo: src/app/globals.css
# Copiar estilos da Seção 2 (classes .text-h1, .text-h2, .text-label, .text-metric)
# Adicionar após as variáveis de cor existentes
```

**Checklist:**
- [ ] `.text-h1`, `.text-h2`, `.text-h3` adicionadas
- [ ] `.text-label` adicionada (uppercase + tracking)
- [ ] `.text-metric` adicionada (tabular-nums para KPIs)
- [ ] `.text-code` adicionada (mono)

### Task 2.2 — Refatorar Títulos no Dashboard
```tsx
// ANTES
<h1 className="text-2xl font-bold">Meu Dashboard</h1>
<h2 className="text-xl font-semibold">Seção</h2>

// DEPOIS
<h1 className="text-h1 text-ink-primary">Meu Dashboard</h1>
<h2 className="text-h2 text-ink-primary">Seção</h2>
```

Páginas a refatorar:
- [ ] `/dashboard` — títulos, labels de KPI
- [ ] `/clientes` — título, filtros
- [ ] `/clientes/[id]` — header com nome do cliente
- [ ] `/financeiro` — títulos, labels
- [ ] `/biblioteca` — títulos
- [ ] `/configuracoes` — títulos, labels de input

### Task 2.3 — Audit de Spacing
Verificar que espaçamentos usam `.5rem`, não `.25rem` ou px:
```tsx
// CORRETO
gap-[0.75rem]  mb-[1.5rem]  p-[1rem]

// ERRADO
gap-[0.5rem]   mb-[1rem]    p-[0.875rem]
```

Páginas:
- [ ] Dashboard cards têm `gap-[1rem]` entre items
- [ ] KPI cards têm `p-[1.5rem]`
- [ ] Labels de KPI têm `mb-[1rem]` do valor
- [ ] Cards têm `mb-[1.5rem]` um do outro

**Fim do Dia 2:** Seu projeto tem escala profissional de tipografia e spacing.

---

## DIA 3 — DARK MODE + CORES (1.5h)

**O que fazer:** Garantir dark mode funciona e cores são consistentes.

### Task 3.1 — Verificar Tokens CSS
```bash
# Arquivo: src/app/globals.css
# Procure por :root e .light
# Verifique que todas as cores usam --surface-*, --ink-*, --ads-*
```

**Checklist:**
- [ ] `:root` define `--surface-base`, `--surface-card`, `--surface-border`
- [ ] `:root` define `--ink-primary`, `--ink-secondary`, `--ink-muted`
- [ ] `.light` overrides todas as variáveis acima
- [ ] Nenhuma classe tem `dark:` condicional

### Task 3.2 — Adicionar Status Colors
```css
/* Em globals.css, adicione depois dos tokens principais */
--status-success: 34 197 94;
--status-warning: 217 119 6;
--status-critical: 220 38 38;
--status-info: 59 130 246;
```

### Task 3.3 — Refatorar Cores em Componentes
Procure por `text-white`, `bg-black`, `text-gray-500` — trocar por tokens:

```tsx
// ANTES
<div className="bg-black text-white border border-gray-800">

// DEPOIS
<div className="bg-surface-card text-ink-primary border border-surface-border">
```

Arquivos a verificar:
- [ ] `components/dashboard/*.tsx` — cores em Cards
- [ ] `components/clientes/*.tsx` — badges, status
- [ ] `components/ui/*.tsx` — inputs, buttons
- [ ] `components/layout/*.tsx` — sidebar, topbar

### Task 3.4 — Teste Dark/Light Mode
```bash
# No navegador, abra DevTools console:
document.documentElement.classList.toggle('dark')
# Tudo deve mudar cor sem refresh
```

**Checklist:**
- [ ] Clique em ThemeToggle (canto superior direito)
- [ ] Dark mode funciona
- [ ] Light mode funciona
- [ ] Sem flicker ou FOUC

**Fim do Dia 3:** Dark mode é robusto, cores são consistentes.

---

## DIA 4 — COMPONENTES VISUAIS (2h)

**O que fazer:** Polir componentes chave para premium.

### Task 4.1 — Refatorar KPI Cards
Se o KpiCard antigo tem mock de dados:
```tsx
// Arquivo: src/components/dashboard/page.tsx (ou KpiCard.tsx)
// Substituir hardcoded values por dados reais do useClientes()

const { metricas } = useClientes()

<KpiCardPremium
  label="MRR"
  value={metricas.mrr}
  format="currency"
  change={12}  // calculado vs mês anterior
  trend="up"
  icon={<TrendingUp className="w-[1.25rem]" strokeWidth={1.5} />}
/>
```

**Checklist:**
- [ ] KPI de MRR mostra valor real
- [ ] KPI de ativos mostra contagem real
- [ ] KPI de taxa de retenção calcula corretamente
- [ ] Trend arrows aparecem (seta verde/vermelha)

### Task 4.2 — Adicionar Loading Skeletons
Remover spinners, adicionar skeletons:

```tsx
// ANTES
{loading && <Spinner />}

// DEPOIS
{loading && (
  <div className="space-y-[0.75rem]">
    <SkeletonLine width="100%" height="1rem" />
    <SkeletonLine width="60%" height="2rem" />
  </div>
)}
```

Onde adicionar:
- [ ] `MorningBriefing` — enquanto carrega do Gemini
- [ ] `WeatherClock` — enquanto carrega API
- [ ] `AcoesDoDia` — enquanto carrega clientes
- [ ] `GeminiChat` — enquanto digita resposta

### Task 4.3 — Empty States
Se não há dados, mostrar EmptyState (não página em branco):

```tsx
if (clientes.length === 0) {
  return (
    <EmptyState
      icon={<Users className="w-[1.5rem] text-ink-muted" strokeWidth={1.5} />}
      title="Nenhum cliente ainda"
      description="Comece adicionando seu primeiro prospect para gerenciar campanhas."
      action={{
        label: 'Novo Cliente',
        onClick: () => router.push('/clientes/novo'),
      }}
    />
  )
}
```

Onde adicionar:
- [ ] `/clientes` — se lista vazia
- [ ] `/dashboard` — se nenhum cliente ativo
- [ ] `/financeiro` — se nenhuma transação
- [ ] `/biblioteca` — talvez não precisa

**Fim do Dia 4:** Componentes sentem "premium" — dados reais, sem mocks.

---

## DIA 5 — BENTO GRID + FINAL POLISH (2h)

**O que fazer:** Dashboard com layout grid profissional.

### Task 5.1 — Refatorar Dashboard com CSS Grid

```tsx
// Arquivo: src/app/(app)/dashboard/page.tsx

export default function DashboardPage() {
  return (
    <MainLayout title="Dashboard" subtitle="Visão geral operacional">
      {/* BENTO GRID — 4 colunas desktop, 1 mobile */}
      <div className="grid gap-[1rem] grid-cols-1 lg:grid-cols-4">
        {/* Morning Briefing — 2 colunas */}
        <div className="lg:col-span-2">
          <MorningBriefing />
        </div>

        {/* Relógio — 1 coluna */}
        <div className="lg:col-span-1">
          <WeatherClock />
        </div>

        {/* Clima — 1 coluna */}
        <div className="lg:col-span-1">
          <WeatherCard />
        </div>

        {/* Clientes em Foco — 3 colunas */}
        <div className="lg:col-span-3">
          <AcoesDoDia />
        </div>

        {/* Alerta Ads — 1 coluna */}
        <div className="lg:col-span-1">
          <AlertaSaldoGoogle />
        </div>

        {/* MRR + DRE — 2 colunas */}
        <div className="lg:col-span-2">
          <Card variant="default">
            {/* KPI Cards dentro */}
            <div className="grid grid-cols-2 gap-[1rem]">
              <KpiCardPremium label="MRR" value={mrr} format="currency" />
              <KpiCardPremium label="Lucro Líquido" value={lucro} format="currency" />
            </div>
          </Card>
        </div>

        {/* Chat Gemini — 4 colunas (full width) */}
        <div className="lg:col-span-4">
          <GeminiChat />
        </div>
      </div>
    </MainLayout>
  )
}
```

**Checklist:**
- [ ] Grid em 4 colunas no desktop
- [ ] Responsivo para tablet (2 colunas) e mobile (1 coluna)
- [ ] Cards têm altura mínima: `min-h-[10rem]`
- [ ] Gap consistente: `gap-[1rem]`

### Task 5.2 — Hover States
Adicionar interatividade sutil:

```tsx
<div className="group">
  <Card
    variant="interactive"
    className="group-hover:border-ads-500/30 transition-all"
  >
    {/* content */}
  </Card>
  
  {/* Hidden by default, visible on hover */}
  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-[0.5rem]">
    <button className="text-[0.75rem] text-ads-500">Ver mais</button>
  </div>
</div>
```

### Task 5.3 — Final Polish
Verificar uma última vez:

```bash
# Checklist Final
□ Nenhum spinner — tudo é skeleton ou bot typing
□ Nenhum px em espaçamentos — tudo é rem
□ Nenhuma cor hardcoded — tudo via tokens
□ Dark mode funciona
□ Mobile responsive (teste no DevTools)
□ Tipografia segue hierarchy
□ Emojis substituídos por ícones Lucide com strokeWidth={1.5}
□ Empty states têm personalidade
□ Botões têm hover + active states
□ Cards têm bordas, não sombras pesadas
```

**Fim do Dia 5:** Seu projeto é **Premium SaaS Design** ✅

---

## BÔNUS — Se Terminou Rápido

### Bônus 1: Drag-and-Drop do Bento Grid
```tsx
// npm install @dnd-kit/core @dnd-kit/utilities @dnd-kit/sortable

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

// Implementar drag-and-drop dos cards
```

### Bônus 2: Animação de Contagem (KPIs)
```tsx
// npm install react-countup

import { CountUp } from 'use-count-up'

<CountUp
  isCounting={true}
  start={0}
  end={metricas.mrr}
  duration={1}
  formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
/>
```

### Bônus 3: Animação de Framer Motion
```tsx
// npm install framer-motion

import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

---

## RESUMO DA SEMANA

**Seg:** Pattern Library (Card, KpiCardPremium, StatusBadge)  
**Ter:** Tipografia + Spacing  
**Qua:** Dark Mode + Cores  
**Qui:** Componentes Premium (reais, não mocks)  
**Sex:** Bento Grid + Polish Final  

**Total:** ~10h de desenvolvimento = **design premium completo**

---

*Pronto? Comece por DIA 1, Task 1.1. Não pule tarefas. A consistência é a chave.*
