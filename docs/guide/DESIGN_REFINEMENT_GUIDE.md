# DESIGN REFINEMENT GUIDE — Adsgator Hub
**Objetivo:** transformar o projeto em Premium SaaS design (nível Linear/Vercel/Raycast)  
**Escopo:** componentes, padrões, tipografia, spacing, cores  
**Status:** guia de implementação — use como checklist

---

## SEÇÃO 1 — PATTERN LIBRARY (Copiar/Colar)

### 1.1 Card Padrão — 4 Variações

```tsx
// components/ui/Card.tsx
import React from 'react'

type CardVariant = 'default' | 'interactive' | 'highlight' | 'minimal'
type CardSize = 'sm' | 'md' | 'lg'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  size?: CardSize
  hover?: boolean
  loading?: boolean
}

export function Card({
  variant = 'default',
  size = 'md',
  hover = false,
  loading = false,
  children,
  className = '',
  ...props
}: CardProps) {
  // Padding por tamanho
  const padding = {
    sm: 'p-[1rem]',
    md: 'p-[1.5rem]',
    lg: 'p-[2rem]',
  }[size]

  // Base comum
  const base = `${padding} rounded-xl transition-all duration-150 border`

  // Variações
  const variants = {
    default: `${base} bg-surface-card border-surface-border ${
      hover ? 'hover:border-surface-border/50 hover:shadow-sm' : ''
    }`,
    interactive: `${base} bg-surface-card border-surface-border cursor-pointer
      hover:border-ads-500/30 hover:shadow-[0_0_0_1px_rgba(255,165,0,0.1)]`,
    highlight: `${base} bg-surface-card border-ads-500/40
      ring-1 ring-ads-500/10 shadow-[0_0_16px_rgba(255,165,0,0.06)]`,
    minimal: `${base} bg-transparent border-surface-border/40
      hover:border-surface-border hover:bg-surface-hover`,
  }

  if (loading) {
    return (
      <div className={variants[variant]}>
        <div className="space-y-[0.75rem]">
          <div className="h-[1rem] w-[60%] bg-surface-hover rounded animate-pulse" />
          <div className="h-[1rem] w-[80%] bg-surface-hover rounded animate-pulse" />
          <div className="h-[1rem] w-[40%] bg-surface-hover rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}
```

### 1.2 KPI Card — Padrão Premium

```tsx
// components/dashboard/KpiCardPremium.tsx
import { ArrowUp, ArrowDown, TrendingFlat } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface KpiCardPremiumProps {
  label: string
  value: number | string
  format?: 'currency' | 'percentage' | 'number' | 'custom'
  change?: number // -5, +12, etc
  metric?: string // 'vs mês anterior', 'vs meta'
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'flat'
  loading?: boolean
}

export function KpiCardPremium({
  label,
  value,
  format = 'currency',
  change,
  metric,
  icon,
  trend,
  loading,
}: KpiCardPremiumProps) {
  const formatValue = (v: number | string) => {
    if (typeof v === 'string') return v
    if (format === 'currency') return `R$ ${v.toLocaleString('pt-BR')}`
    if (format === 'percentage') return `${v.toFixed(1)}%`
    return v.toLocaleString('pt-BR')
  }

  const getTrendColor = () => {
    if (!change) return 'text-ink-muted'
    if (change > 0) return 'text-emerald-400'
    if (change < 0) return 'text-red-400'
    return 'text-ink-muted'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp className="w-[1rem] h-[1rem]" strokeWidth={2} />
    if (trend === 'down') return <ArrowDown className="w-[1rem] h-[1rem]" strokeWidth={2} />
    return <TrendingFlat className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
  }

  return (
    <Card variant="default" size="md" loading={loading}>
      {/* Header com label + icon */}
      <div className="flex items-center justify-between mb-[1rem]">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-muted">
          {label}
        </span>
        {icon && <div className="text-ads-500">{icon}</div>}
      </div>

      {/* Valor grande */}
      <div className="mb-[1rem]">
        <div className="text-[2rem] font-bold text-ink-primary tabular-nums tracking-tight">
          {formatValue(value)}
        </div>
      </div>

      {/* Métrica + trend */}
      {(change !== undefined || metric) && (
        <div className="flex items-center gap-[0.5rem]">
          {change !== undefined && (
            <div className={`flex items-center gap-[0.25rem] ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-[0.75rem] font-medium">
                {Math.abs(change) > 0 ? `${change > 0 ? '+' : ''}${change}%` : 'Sem alteração'}
              </span>
            </div>
          )}
          {metric && <span className="text-[0.75rem] text-ink-muted">{metric}</span>}
        </div>
      )}
    </Card>
  )
}
```

### 1.3 Status Badge — 6 Estados

```tsx
// components/ui/StatusBadgePremium.tsx
type Status = 'ativo' | 'inativo' | 'pendente' | 'critico' | 'sucesso' | 'processando'

interface StatusBadgePremiumProps {
  status: Status
  label: string
  size?: 'sm' | 'md'
}

const statusConfig: Record<Status, { bg: string; text: string; dot: string }> = {
  ativo: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  inativo: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', dot: 'bg-zinc-400' },
  pendente: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  critico: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400 animate-pulse' },
  sucesso: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400' },
  processando: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    dot: 'bg-blue-400 animate-bounce',
  },
}

export function StatusBadgePremium({
  status,
  label,
  size = 'md',
}: StatusBadgePremiumProps) {
  const config = statusConfig[status]
  const sizeClass = size === 'sm' ? 'px-[0.5rem] py-[0.25rem] text-[0.6875rem]' : 'px-[0.75rem] py-[0.375rem] text-[0.75rem]'

  return (
    <span
      className={`inline-flex items-center gap-[0.375rem] font-medium rounded-full ${config.bg} ${config.text} ${sizeClass}`}
    >
      <span className={`w-[0.375rem] h-[0.375rem] rounded-full ${config.dot}`} />
      {label}
    </span>
  )
}
```

### 1.4 Input com Focus Premium

```tsx
// components/ui/InputPremium.tsx
import React from 'react'

interface InputPremiumProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  icon?: React.ReactNode
  error?: string
}

export function InputPremium({
  label,
  hint,
  icon,
  error,
  className = '',
  ...props
}: InputPremiumProps) {
  return (
    <div className="space-y-[0.375rem]">
      {label && (
        <label className="block text-[0.875rem] font-medium text-ink-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-[1rem] top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-[1rem] py-[0.75rem] ${icon ? 'pl-[2.75rem]' : ''} 
            rounded-lg bg-surface-card border border-surface-border text-ink-primary 
            placeholder:text-ink-muted text-[0.875rem]
            transition-all duration-150
            focus:outline-none focus:border-ads-500/50 focus:ring-1 focus:ring-ads-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500/50 focus:ring-red-500/20' : ''}
            ${className}`}
          {...props}
        />
      </div>
      {hint && <p className="text-[0.75rem] text-ink-muted">{hint}</p>}
      {error && <p className="text-[0.75rem] text-red-400">{error}</p>}
    </div>
  )
}
```

### 1.5 Empty State — Padrão Consistente

```tsx
// components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-[3rem] px-[2rem] text-center">
      {/* Ícone em background sutil */}
      <div className="w-[3rem] h-[3rem] rounded-[0.75rem] bg-surface-hover flex items-center justify-center mb-[1rem]">
        {icon}
      </div>

      {/* Texto */}
      <h3 className="text-[0.9375rem] font-medium text-ink-primary mb-[0.375rem]">{title}</h3>
      <p className="text-[0.8125rem] text-ink-muted max-w-[24rem] mb-[1.5rem]">{description}</p>

      {/* CTA opcional */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-[1rem] py-[0.5rem] rounded-lg bg-ads-500/10 text-ads-500 
            text-[0.8125rem] font-medium hover:bg-ads-500/15 transition-colors duration-150"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
```

### 1.6 Skeleton Loading — Nunca Spinner

```tsx
// components/ui/SkeletonLine.tsx
interface SkeletonLineProps {
  width?: string
  height?: string
  count?: number
  gap?: string
}

export function SkeletonLine({
  width = '100%',
  height = '1rem',
  count = 1,
  gap = '0.5rem',
}: SkeletonLineProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{ width, height }}
          className="bg-surface-hover rounded animate-pulse"
        />
      ))}
    </div>
  )
}

// Uso:
// <SkeletonLine width="100%" height="2rem" count={3} />
```

---

## SEÇÃO 2 — TIPOGRAFIA HIERARCHY

### Escala Definida

```css
/* globals.css — adicionar */

/* Título página (H1) */
.text-h1 {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Título seção (H2) */
.text-h2 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
}

/* Título card (H3) */
.text-h3 {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}

/* Corpo padrão (body) */
.text-body {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
}

/* Label / meta */
.text-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Números grandes (KPI) */
.text-metric {
  font-size: 2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

/* Code / monospace */
.text-code {
  font-family: var(--font-geist-mono);
  font-size: 0.8125rem;
  font-weight: 500;
}
```

### Uso em Componentes

```tsx
// CORRETO
<h1 className="text-h1 text-ink-primary">Título da Página</h1>
<h2 className="text-h2 text-ink-primary">Título da Seção</h2>
<span className="text-label text-ink-muted">MÉTRICA</span>
<div className="text-metric text-ink-primary">R$ 12.450</div>

// ERRADO — não fazer
<h1 className="text-4xl font-bold">...</h1>  // font-size hardcoded
<span className="text-xs font-semibold">...</span>  // não usa .text-label
```

---

## SEÇÃO 3 — SPACING GRID (8px base)

Todos os espaçamentos devem ser múltiplos de 0.5rem (8px):

```
0.125rem (2px)   — gap entre elementos muito próximos
0.25rem (4px)    — gap mínimo
0.375rem (6px)   — gaps pequenos
0.5rem (8px)     — gap padrão entre elementos inline
0.75rem (12px)   — gap padrão entre blocos
1rem (16px)      — espaço grande
1.5rem (24px)    — espaço XL
2rem (32px)      — página margins
```

### Checklist de Spacing

```tsx
// Card interno
p-[1.5rem]    // padding padrão

// Gap entre items em um card
gap-[0.75rem]  // entre bullets
gap-[1rem]     // entre seções

// Margin entre cards/seções
mb-[1.5rem]    // entre cards horizontais
mb-[2rem]      // entre seções maiores

// Sidebar padding
p-[1rem]       // sidebar items

// Modal padding
p-[2rem]       // modal content
```

---

## SEÇÃO 4 — CORES DE DESTAQUE (Além de Ads Orange)

```css
/* globals.css — adicionar tokens para status */

/* Status colors */
--status-success: 34 197 94    /* green-500 */
--status-warning: 217 119 6    /* amber-600 */
--status-critical: 220 38 38   /* red-600 */
--status-info: 59 130 246      /* blue-500 */

/* Aliases */
--alert-mild: var(--status-warning)
--alert-critical: var(--status-critical)
--success: var(--status-success)
```

### Uso

```tsx
// Em contexto, sempre cores significativas:
className="text-emerald-400"    // ativo, sucesso
className="text-amber-400"      // pendente, alerta
className="text-red-400"        // erro, crítico
className="text-blue-400"       // info, processando
className="text-ads-500"        // só para CTA e highlights
```

---

## SEÇÃO 5 — SOMBRAS E ELEVAÇÃO

Adsgator usa **bordas, não sombras pesadas**. Sombras são subtis:

```tsx
// Shadow subtil — só em hover de cards interativos
shadow-[0_1px_2px_rgba(0,0,0,0.05)]

// Shadow em modals/popovers
shadow-[0_20px_25px_rgba(0,0,0,0.15)]

// Glow effect — destaque crítico
shadow-[0_0_16px_rgba(255,165,0,0.06)]   // orange glow
shadow-[0_0_12px_rgba(220,38,38,0.08)]   // red glow (crítico)
```

---

## SEÇÃO 6 — TRANSIÇÕES

```tsx
// Transições padrão
transition-colors duration-150        // cor hover
transition-all duration-200           // entrada/saída
transition-opacity duration-100       // fade rápido

// NUNCA usar
transition-all duration-300 ease-in-out  // muito lento
transition-all duration-500            // pesado demais

// Animações
animate-pulse    // loading states
animate-bounce   // ativa, crítico
animate-spin     // processando (sparse, usar com moderação)
```

---

## SEÇÃO 7 — CHECKLIST POR PÁGINA

### `/dashboard`

- [ ] Bento Grid com 4 colunas (desktop), 1 (mobile)
- [ ] Cards com BentoCard padrão (não Card genérico)
- [ ] KPI cards usam KpiCardPremium com trends
- [ ] Sparklines reais, não mock
- [ ] Morning Briefing: texto + bullets, sem box confuso
- [ ] Weather/Clock card com visual limpo
- [ ] GeminiChat com streaming visual
- [ ] AlertaSaldoGoogle: badge piscante se crítico
- [ ] Empty state se nenhum cliente: use EmptyState component
- [ ] Todos os ícones com `strokeWidth={1.5}`
- [ ] Loading: SkeletonLine, não spinner

**Visual esperado:** Limpo, clean, dados em primeiro plano, não componentes.

### `/clientes` (lista)

- [ ] Cards de cliente com ClienteCard padrão
- [ ] Status badge com StatusBadgePremium
- [ ] Busca com ícone (não input nu)
- [ ] Filtros como pills, não selects
- [ ] Hover card revela quick actions (edit, more)
- [ ] Empty state se nenhum cliente
- [ ] Ordenação persistida (próx. implementação)

### `/clientes/[id]` (detalhe)

- [ ] Header sticky com nome + status + quick actions
- [ ] Seção de metadata: domínio, GTM, GA4 em Cards inline
- [ ] Checklist visual com progress bar
- [ ] Timeline de audit com cores: criado (azul), alterado (laranja), resolvido (verde)
- [ ] Botão de ação primária bem visível (no header ou sticky)
- [ ] Modal de WhatsApp templates limpo
- [ ] Performance chart se tem dados

### `/financeiro`

- [ ] KPIs no topo com KpiCardPremium (MRR, DRE, saldo)
- [ ] Tabela de lançamentos com hover subtil
- [ ] Gráfico DRE como area chart, não bar
- [ ] Lista de inadimplentes com Status badge critico
- [ ] Ações inline: botão "Cobrar" gera WA
- [ ] Sem paginação até 100 linhas (depois lazy load)

### `/biblioteca`

- [ ] Grid de componentes: máx 2 colunas (desktop), 1 (mobile)
- [ ] Preview grande do componente selecionado (não thumbnail)
- [ ] Palette picker visual integrado
- [ ] Botão "Exportar Manifesto" em destaque
- [ ] Drag-drop para ordenar componentes (próx.)

### `/configuracoes`

- [ ] Abas para seções (Geral, API, Templates, Webhooks)
- [ ] Inputs com InputPremium
- [ ] Toggles para Dark/Light/System
- [ ] API keys mascaradas com copy button
- [ ] Audit log com filtros e search
- [ ] Botão "Salvar" only enabled se mudou algo

### `/analytics` (por cliente)

- [ ] KPIs no topo: Investimento, Cliques, CTR, Conversões, CPA
- [ ] Gráfico de performance: linha com múltiplas séries
- [ ] Tabela de termos com sorting
- [ ] Alertas de anomalia em banner top
- [ ] Device breakdown como donut chart
- [ ] Geolocalização heatmap (se dados de GA4)

---

## SEÇÃO 8 — MOTION & MICRO-INTERACTIONS

### Button Hover

```tsx
className="bg-ads-500 hover:bg-ads-600 active:scale-95 transition-all duration-150"
```

### Card Hover

```tsx
className="border border-surface-border hover:border-ads-500/30 
           hover:shadow-[0_0_16px_rgba(255,165,0,0.06)]
           transition-all duration-150 cursor-pointer"
```

### Loading State (no button)

```tsx
{loading ? (
  <div className="flex items-center gap-[0.5rem]">
    <div className="w-[1rem] h-[1rem] rounded-full border-2 border-ads-500/20 border-t-ads-500 animate-spin" />
    <span>Carregando...</span>
  </div>
) : (
  'Enviar'
)}
```

### Expandir/Colapsar

```tsx
<motion.div
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: 'auto' }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ duration: 0.2 }}
>
  {children}
</motion.div>
```

---

## SEÇÃO 9 — DARK MODE CHECKLIST

Nunca usar cores hardcoded no componente. **Sempre usar tokens CSS variables.**

```tsx
// CORRETO
className="bg-surface-card text-ink-primary border border-surface-border"

// ERRADO
className="bg-black text-white border border-gray-800"
className="dark:bg-black light:bg-white"  // condicional manual
```

**Teste:** mude a classe `dark` no `<html>` — tudo deve mudar automaticamente.

---

## SEÇÃO 10 — COMPONENTES QUE FALTAM REFINAR

| Componente | Problema Atual | Solução |
|---|---|---|
| MorningBriefing | Pode estar sem formatação | Usar bullets `•`, espaçamento entre parágrafos |
| GeminiChat | Talvez sem streaming visual | Implementar message-by-message apareça, não tudo de uma vez |
| WeatherClock | SVG pode estar estático | Adicionar animação dos ponteiros (real time) |
| KpiCard | Pode estar com valores mock | Implementar dados reais de MRR, DRE |
| AcoesDoDia | Talvez sem ordenação | Ordena por urgência (vermelho, laranja, verde) |
| Alertas | Talvez sem pulsação | Badge critico deve `animate-pulse` |

---

## SEÇÃO 11 — IMPLEMENTAÇÃO RÁPIDA

### Passo 1 — Copiar Pattern Library
1. Crie `components/ui/Card.tsx`, `KpiCardPremium.tsx`, `StatusBadgePremium.tsx`, etc.
2. Use os códigos da Seção 1 acima

### Passo 2 — Adicionar Tipografia
1. Copie o CSS da Seção 2 para `globals.css`
2. Atualize componentes para usar `.text-h1`, `.text-label`, etc.

### Passo 3 — Audit Página por Página
1. Use o checklist da Seção 7
2. Refine um componente por sessão (não tudo de uma vez)

### Passo 4 — Dark Mode
1. Verifique se seu projeto está usando tokens CSS (parece que está ✅)
2. NÃO adicione `dark:` conditionals — tudo sai automaticamente

### Passo 5 — Deploy & Validar
1. Compare seu design com Linear, Vercel, Raycast
2. Se está 90% parecido, está premium ✅

---

## SEÇÃO 12 — FERRAMENTAS DE VALIDAÇÃO

### Checklist Visual Rápido

- [ ] Espaçamento é sempre múltiplo de 0.5rem? ✅
- [ ] Tipografia segue hierarchy? ✅
- [ ] Cores usam apenas tokens CSS variables? ✅
- [ ] Nenhum `px` hardcoded em espaçamentos? ✅
- [ ] Ícones têm `strokeWidth={1.5}`? ✅
- [ ] Loading é skeleton, não spinner? ✅
- [ ] Hover states em cards interativos? ✅
- [ ] Empty states têm personalidade? ✅
- [ ] Dark mode funciona sem `.dark:` classes? ✅

### Se você passou em 8+ de 9, está premium. 🎉

---

*Este guia é iterativo. Conforme refina, capture padrões que funcionam bem e reutilize em novos componentes. Premium design é 80% consistência, 20% criatividade.*
