# QUICK REFERENCE — Copy/Paste Patterns
**Use enquanto codifica.** Ctrl+F para encontrar rápido.

---

## CARDS

### Card Padrão (leitura)
```tsx
<Card variant="default" size="md">
  <h3 className="text-h3 text-ink-primary mb-[1rem]">Título</h3>
  <p className="text-body text-ink-secondary">Conteúdo</p>
</Card>
```

### Card Interativo (clicável)
```tsx
<Card
  variant="interactive"
  onClick={() => router.push(`/clientes/${id}`)}
>
  {/* Content */}
</Card>
```

### Card Destaque (crítico, sucesso)
```tsx
<Card variant="highlight">
  <div className="flex items-center gap-[1rem]">
    <AlertCircle className="w-[1.5rem] text-red-400" strokeWidth={1.5} />
    <div>
      <p className="font-medium text-ink-primary">Alerta Crítico</p>
      <p className="text-sm text-ink-secondary">Descrição</p>
    </div>
  </div>
</Card>
```

---

## KPI CARDS

### KPI com Trend
```tsx
<KpiCardPremium
  label="MRR"
  value={12450}
  format="currency"
  change={+8}
  trend="up"
  metric="vs mês anterior"
  icon={<TrendingUp className="w-[1.25rem]" strokeWidth={1.5} />}
/>
```

### KPI Simples
```tsx
<KpiCardPremium
  label="Clientes Ativos"
  value={24}
  format="number"
/>
```

---

## STATUS BADGES

### Ativo
```tsx
<StatusBadgePremium status="ativo" label="Ativo" />
```

### Pendente com Alerta
```tsx
<StatusBadgePremium status="pendente" label="Pendente" size="sm" />
```

### Crítico com Pulsação
```tsx
<StatusBadgePremium status="critico" label="Inadimplente" />
{/* Animação automática: animate-pulse */}
```

---

## INPUTS

### Input Padrão
```tsx
<InputPremium
  label="Nome da Empresa"
  placeholder="Digite o nome"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Input com Ícone
```tsx
<InputPremium
  label="Email"
  icon={<Mail className="w-[1rem]" strokeWidth={1.5} />}
  type="email"
  placeholder="seu@email.com"
/>
```

### Input com Erro
```tsx
<InputPremium
  label="CPF"
  value={cpf}
  error="CPF inválido"
  onChange={(e) => setCpf(e.target.value)}
/>
```

---

## EMPTY STATES

### Sem Clientes
```tsx
<EmptyState
  icon={<Users className="w-[1.5rem] text-ink-muted" strokeWidth={1.5} />}
  title="Nenhum cliente cadastrado"
  description="Crie seu primeiro cliente para começar a gerenciar campanhas."
  action={{
    label: 'Novo Cliente',
    onClick: () => router.push('/clientes/novo'),
  }}
/>
```

### Sem Transações
```tsx
<EmptyState
  icon={<FileText className="w-[1.5rem] text-ink-muted" strokeWidth={1.5} />}
  title="Sem transações este mês"
  description="As transações aparecerão aqui quando houver movimento."
/>
```

---

## LOADING STATES

### Skeleton Line Padrão
```tsx
{loading ? (
  <div className="space-y-[0.75rem]">
    <SkeletonLine width="100%" height="1rem" />
    <SkeletonLine width="100%" height="2rem" />
    <SkeletonLine width="80%" height="1rem" />
  </div>
) : (
  {/* conteúdo */}
)}
```

### Skeleton Card
```tsx
{loading ? (
  <Card variant="default">
    <SkeletonLine width="60%" height="1.125rem" count={1} gap="0.75rem" />
    <div className="mt-[1rem]">
      <SkeletonLine width="100%" height="2rem" count={1} />
    </div>
  </Card>
) : (
  {/* conteúdo */}
)}
```

### Button Loading
```tsx
<button disabled={saving} className="flex items-center gap-[0.5rem]">
  {saving ? (
    <>
      <div className="w-[1rem] h-[1rem] border-2 border-ads-500/20 border-t-ads-500 rounded-full animate-spin" />
      Salvando...
    </>
  ) : (
    'Salvar'
  )}
</button>
```

---

## BUTTONS

### Button Primário
```tsx
<button className="px-[1rem] py-[0.75rem] rounded-lg bg-ads-500 text-ink-primary 
                   font-medium text-[0.875rem]
                   hover:bg-ads-600 active:scale-95 
                   transition-all duration-150
                   disabled:opacity-50 disabled:cursor-not-allowed">
  Ação Primária
</button>
```

### Button Secundário
```tsx
<button className="px-[1rem] py-[0.75rem] rounded-lg bg-surface-hover text-ink-primary 
                   font-medium text-[0.875rem]
                   hover:bg-surface-border
                   transition-colors duration-150">
  Ação Secundária
</button>
```

### Button Mínimo (texto)
```tsx
<button className="px-[0.5rem] py-[0.25rem] rounded text-[0.8125rem] text-ads-500 
                   hover:bg-ads-500/10
                   transition-colors duration-150">
  Mais Opções
</button>
```

---

## LISTAS

### Linha de Lista (com hover)
```tsx
<div className="border-b border-surface-border last:border-b-0">
  <div className="px-[1.5rem] py-[1rem] 
                  hover:bg-surface-hover 
                  transition-colors duration-150 cursor-pointer
                  flex items-center justify-between">
    <div>
      <p className="text-ink-primary font-medium">Nome do Item</p>
      <p className="text-[0.75rem] text-ink-muted">Metadados</p>
    </div>
    <span className="text-ads-500">→</span>
  </div>
</div>
```

### Lista com Avatar
```tsx
<div className="flex items-center gap-[1rem] p-[1rem]">
  {/* Avatar */}
  <div className="w-[2.5rem] h-[2.5rem] rounded-lg bg-ads-500/20 
                  flex items-center justify-center shrink-0">
    <span className="text-[0.875rem] font-bold text-ads-500">JD</span>
  </div>
  
  {/* Info */}
  <div className="min-w-0 flex-1">
    <p className="text-ink-primary font-medium truncate">John Doe</p>
    <p className="text-[0.75rem] text-ink-muted">john@example.com</p>
  </div>
  
  {/* Action */}
  <ChevronRight className="w-[1.25rem] text-ink-muted" strokeWidth={1.5} />
</div>
```

---

## TABELAS

### Tabela Simples
```tsx
<div className="border border-surface-border rounded-xl overflow-hidden">
  {/* Header */}
  <div className="grid grid-cols-4 bg-surface-hover border-b border-surface-border">
    <div className="px-[1.5rem] py-[0.75rem]">
      <p className="text-label text-ink-muted">Coluna 1</p>
    </div>
    <div className="px-[1.5rem] py-[0.75rem]">
      <p className="text-label text-ink-muted">Coluna 2</p>
    </div>
    {/* ... mais colunas */}
  </div>
  
  {/* Rows */}
  {data.map((item) => (
    <div key={item.id} className="grid grid-cols-4 border-b border-surface-border 
                                  hover:bg-surface-hover transition-colors duration-150">
      <div className="px-[1.5rem] py-[1rem] text-ink-primary">{item.name}</div>
      <div className="px-[1.5rem] py-[1rem] text-ink-secondary">{item.value}</div>
      {/* ... */}
    </div>
  ))}
</div>
```

---

## TIPOGRAFIA

### Título Página
```tsx
<h1 className="text-h1 text-ink-primary">Página de Clientes</h1>
```

### Título Seção
```tsx
<h2 className="text-h2 text-ink-primary mt-[2rem] mb-[1rem]">Últimas Campanhas</h2>
```

### Label (Metadata)
```tsx
<span className="text-label text-ink-muted">MÉTRICA DO CARD</span>
```

### Número Grande (KPI)
```tsx
<div className="text-metric text-ink-primary">R$ 12.450</div>
```

### Corpo de Texto
```tsx
<p className="text-body text-ink-secondary">
  Descrição ou conteúdo que precisa de leitura.
</p>
```

---

## SPACING (não use outros valores!)

### Gaps Padrão
```
gap-[0.75rem]    // entre items em card
gap-[1rem]       // entre seções maiores
gap-[1.5rem]     // entre módulos
```

### Paddings Padrão
```
p-[1rem]         // sidebar, cards pequenos
p-[1.5rem]       // cards padrão
p-[2rem]         // modais, páginas
```

### Margins Padrão
```
mb-[0.75rem]     // entre elementos próximos
mb-[1rem]        // entre subsecções
mb-[1.5rem]      // entre cards
mb-[2rem]        // entre seções
```

---

## ÍCONES LUCIDE (com strokeWidth={1.5})

### Ícone em Card
```tsx
<div className="w-[2.5rem] h-[2.5rem] rounded-lg bg-ads-500/10 
                flex items-center justify-center">
  <TrendingUp className="w-[1.25rem] text-ads-500" strokeWidth={1.5} />
</div>
```

### Ícone em Button
```tsx
<button className="flex items-center gap-[0.5rem]">
  <Plus className="w-[1rem]" strokeWidth={1.5} />
  Novo Cliente
</button>
```

### Ícone em Status Badge
```tsx
<div className="flex items-center gap-[0.375rem]">
  <AlertCircle className="w-[1rem]" strokeWidth={1.5} />
  <span>Crítico</span>
</div>
```

---

## CORES (SÓ TOKENS!)

### Usar Sempre
```tsx
className="bg-surface-card text-ink-primary border border-surface-border"
```

### Status
```tsx
className="text-emerald-400"    // sucesso, ativo
className="text-amber-400"      // alerta, pendente
className="text-red-400"        // erro, crítico
className="text-blue-400"       // info, processando
```

### Destaque
```tsx
className="text-ads-500"        // orange, CTAs
className="bg-ads-500/10"       // fundo laranja fraco
```

---

## DARK MODE

### Teste rápido
```js
// No console:
document.documentElement.classList.toggle('dark')
// Tudo muda, zero flickering
```

### Nunca Use
```tsx
// ❌ ERRADO
className="dark:bg-black light:bg-white"
className="text-white dark:text-black"

// ✅ CORRETO
className="bg-surface-card text-ink-primary"
```

---

## COMPONENTES COMUNS (Já Existem)

```tsx
// Import
import { Card } from '@/components/ui/Card'
import { KpiCardPremium } from '@/components/dashboard/KpiCardPremium'
import { StatusBadgePremium } from '@/components/ui/StatusBadgePremium'
import { InputPremium } from '@/components/ui/InputPremium'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonLine } from '@/components/ui/SkeletonLine'
import { MainLayout } from '@/components/layout/MainLayout'
```

---

## BENTO GRID (Dashboard)

```tsx
<div className="grid gap-[1rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  <div className="lg:col-span-2">Card 1 (2 colunas)</div>
  <div className="lg:col-span-1">Card 2 (1 coluna)</div>
  <div className="lg:col-span-1">Card 3 (1 coluna)</div>
  <div className="lg:col-span-3">Card 4 (3 colunas)</div>
  <div className="lg:col-span-4">Card 5 (full width)</div>
</div>
```

---

## TROUBLESHOOTING

### "Espaçamento está errado"
```
Verificar: todos os valores em [X.XXXrem]?
Converter: px → rem (px ÷ 16)
Exemplo: 8px = 0.5rem, 12px = 0.75rem, 16px = 1rem
```

### "Dark mode não funciona"
```
Verificar: 
1. Estou usando tokens (--surface-*, --ink-*)?
2. O CSS tem :root e .light?
3. Tem algum hard-coded 'white'/'black' no código?
4. ThemeProvider está no layout.tsx?
```

### "Ícone parece pesado"
```
Trocar: <Icon strokeWidth={2} /> para <Icon strokeWidth={1.5} />
Remover: fill, apenas outline
```

### "Cores não combinam"
```
Checklist:
✓ Estou em dark ou light mode?
✓ Cores são tokens CSS (surface-*, ink-*)?
✓ Testei no outro tema?
```

---

*Imprima ou abra em aba separada. Ctrl+F é seu amigo.*
