# 🚀 ROADMAP COMPLETO DE IMPLEMENTAÇÃO
**Objetivo:** Corrigir projeto + Implementar Timeline Cards System  
**Duração Total:** 20 dias (3 semanas)  
**Resultado Final:** Premium SaaS design + Sistema operacional completo

---

## 📅 TIMELINE EXECUTIVA

```
SEMANA 1 (Dias 1-5)  → Audit Fixes + Tipografia + Foundation Timeline
SEMANA 2 (Dias 6-10) → Timeline Cards Completas + Alerts + Automações
SEMANA 3 (Dias 11-20)→ Polish, Testes, Deploy
```

---

## SEMANA 1 — FUNDAÇÃO (Dias 1-5)

### DIA 1 — Tipografia & Spacing Patterns (2-3h)

**Objetivo:** Padronizar toda a escala tipográfica e spacing do projeto.

**Tarefas:**

1. **Adicionar em `src/app/globals.css`:**
```css
/* Typography Scale */
.text-h1 {
  @apply text-[1.75rem] font-bold leading-tight tracking-tight text-ink-primary;
}
.text-h2 {
  @apply text-[1.25rem] font-semibold leading-snug;
}
.text-h3 {
  @apply text-[1rem] font-semibold;
}
.text-label {
  @apply text-[0.6875rem] font-semibold uppercase tracking-[0.06em];
}
.text-metric {
  @apply text-[2rem] font-bold tabular-nums leading-tight;
}
.text-body {
  @apply text-[0.875rem] leading-relaxed;
}

/* Spacing Consistency */
:root {
  --spacing-xs: 0.25rem;    /* 4px */
  --spacing-sm: 0.5rem;     /* 8px */
  --spacing-md: 0.75rem;    /* 12px */
  --spacing-lg: 1rem;       /* 16px */
  --spacing-xl: 1.5rem;     /* 24px */
  --spacing-2xl: 2rem;      /* 32px */
}
```

2. **Refatorar componentes principais:**
- `dashboard/KpiCard.tsx` → usar `.text-metric` para valores
- `dashboard/MorningBriefing.tsx` → usar `.text-h3` para título
- `clientes/ClienteCard.tsx` → usar `.text-label` para badges
- `analytics/AdsOverviewKpis.tsx` → usar `.text-metric` para métricas

3. **Adicionar spacing vars em componentes:**
```tsx
// Antes
<div className="flex items-center justify-between mb-[1.5rem]">

// Depois
<div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-xl)' }}>
```

4. **Checklist:**
- [ ] Todos os títulos usam `.text-h1`, `.text-h2`, `.text-h3`
- [ ] Todos os labels usam `.text-label`
- [ ] Todos os métricos usam `.text-metric`
- [ ] Nenhum `font-size` ou `font-weight` hardcoded em componentes
- [ ] Rodar `npm run lint` — zero warnings

**Tempo:** 2-3h

---

### DIA 2 — System Prompts Optimization (1-2h)

**Objetivo:** Organizar e otimizar os prompts para os 3 agentes Gemini via Vertex AI (que você já usa).

**Tarefas:**

1. **Verificar que vertex-ai.ts está correto:**
- [ ] Usando `@google-cloud/vertexai` ✅
- [ ] Modelos: 'gemini-2.5-flash-lite' (Sentinela), 'gemini-2.5-flash' (Analista), 'gemini-2.5-pro' (Estrategista)
- [ ] GOOGLE_APPLICATION_CREDENTIALS configurado

2. **Criar tabela `system_prompts` no Supabase** (opcional, para versioning):
```sql
CREATE TABLE system_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent text NOT NULL UNIQUE, -- 'lite', 'flash', 'pro'
  content text NOT NULL,
  version int DEFAULT 1,
  updated_at timestamptz DEFAULT now()
);
```

3. **Testar todos os endpoints IA:**
- [ ] Chat endpoint (Flash) retorna respostas corretas
- [ ] Morning briefing (Pro) gera briefing válido
- [ ] Copy generator (Flash) cria anúncios válidos
- [ ] Sem erros de autenticação/rate limiting

**Tempo:** 1-2h

---

### DIA 3 — Database Setup + Migrations (2-3h)

**Objetivo:** Preparar banco de dados para o sistema de timelines.

**Tarefas:**

1. **Aplicar migrations do timeline system:**
```bash
# Copiar MIGRATIONS_TIMELINE_SYSTEM.sql para supabase/migrations/
# Aplicar via:
psql -h db.supabase.co -U postgres -d postgres -f migrations/[timestamp]_timeline_system.sql
# Ou via UI do Supabase SQL Editor
```

2. **Verificar criação das tabelas:**
```sql
\dt timeline_*

-- Deve listar:
-- timeline_templates
-- timeline_instances
-- timeline_alerts
-- timeline_alert_history
-- timeline_step_analytics
-- timeline_audit_log
```

3. **Seed data:**
```bash
# Inserir templates padrão (já em migration)
# Verificar:
SELECT * FROM timeline_templates;
-- Deve ter: "Onboarding LP Pro", "Manutenção Quinzenal", "Sistema de Alertas"
```

4. **Ativar RLS e testar permissões:**
- [ ] RLS está ativo em todas as tabelas
- [ ] Policies criadas corretamente
- [ ] Teste de leitura/escrita sem auth falha
- [ ] Teste com auth válida funciona

**Tempo:** 2-3h

---

### DIA 4 — Componentes de Timeline (3-4h)

**Objetivo:** Implementar componentes UI básicos do timeline system.

**Tarefas:**

1. **Criar `src/components/dashboard/TimelineCard.tsx`** (do doc TIMELINE_CARDS_SYSTEM_COMPLETO, Seção 2.1)
   - [ ] Header com título + ícone + progress
   - [ ] Expansão/colapso com ChevronDown animation
   - [ ] Loading states com skeletons

2. **Criar `src/components/dashboard/TimelineContent.tsx`** (Seção 2.2)
   - [ ] Progress bar visual
   - [ ] Step title + duration estimate
   - [ ] Space para mensagens

3. **Criar `src/components/dashboard/TimelineMessage.tsx`** (Seção 2.3)
   - [ ] WhatsApp-like chat bubbles
   - [ ] Copy button para templates
   - [ ] Três tipos: instruction, user_action, template

4. **Testar no navegador:**
- [ ] TimelineCard expande/colapsa
- [ ] Dados carregam corretamente
- [ ] Mensagens aparecem formatadas
- [ ] Copy button funciona

**Tempo:** 3-4h

---

### DIA 5 — API Routes + Dashboard Integration (3-4h)

**Objetivo:** Conectar componentes aos dados e exibir no dashboard.

**Tarefas:**

1. **Criar API routes:**
- `app/api/v1/timeline-templates/route.ts` — GET/POST templates
- `app/api/v1/timelines/[id]/route.ts` — GET timeline
- `app/api/v1/timelines/[id]/step/[stepId]/complete` — POST marcar completo

2. **Integrar no dashboard:**
```tsx
// app/(app)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <MainLayout>
      {/* Cards existentes */}
      
      {/* NOVA SEÇÃO: TIMELINES */}
      <div className="grid gap-[1rem] grid-cols-1 lg:grid-cols-3 mb-[2rem]">
        <TimelineCard type="onboarding" title="Onboarding do Cliente" ... />
        <TimelineCard type="recurring_task" title="Tarefas Recorrentes" ... />
        <TimelineCard type="alert" title="Alertas & Notificações" ... />
      </div>
    </MainLayout>
  )
}
```

3. **Testes:**
- [ ] Dashboard carrega 3 timeline cards
- [ ] Clique expande/colapsa
- [ ] Dados carregam da API
- [ ] Steps aparecem corretamente

**Tempo:** 3-4h

---

**FIM SEMANA 1 — Status:**
- ✅ Tipografia padronizada
- ✅ Stack de IA correto
- ✅ Banco de dados pronto
- ✅ 3 Timeline Cards básicos funcionando
- ✅ Dashboard integrado

---

## SEMANA 2 — TIMELINE SYSTEM (Dias 6-10)

### DIA 6 — Template Builder (4-5h)

**Objetivo:** Interface para criar/editar templates de timelines.

**Tarefas:**

1. **Criar `src/components/timeline/TemplateBuilder.tsx`** (TIMELINE_CARDS_SYSTEM_COMPLETO, Seção 2.4)
   - [ ] Form para metadata (nome, tipo, descrição, cor, ícone)
   - [ ] Lista de steps com add/edit/delete
   - [ ] Botão para abrir step editor

2. **Criar `src/components/timeline/StepEditor.tsx`**
   - [ ] Editar título, conteúdo, tipo de step
   - [ ] Adicionar/editar mensagens
   - [ ] Adicionar/editar input fields
   - [ ] Configurar prerequisites

3. **Criar rota de admin:**
- `app/(app)/admin/templates/page.tsx`
- Listar templates existentes
- Botão para criar novo
- Botão para editar existente

4. **Testes:**
- [ ] Criar novo template
- [ ] Adicionar steps ao template
- [ ] Salvar e recarregar
- [ ] Editar template existente

**Tempo:** 4-5h

---

### DIA 7 — Recurring Tasks + Auto-Create (3-4h)

**Objetivo:** Implementar tarefas recorrentes e criação automática.

**Tarefas:**

1. **Criar Edge Function: `supabase/functions/recurring-task-runner`**
```typescript
// Roda diariamente (ou via webhook)
// Busca timelines com next_run_at <= now()
// Marca como 'active' novamente
// Calcula próximo run_at baseado em recurrence_rule
```

2. **Criar helper: `src/lib/recurrence.ts`**
```typescript
// parseRecurrenceRule(rule: string): próxima data
// Usar rrule ou similar para parsing iCal
// npm install rrule
```

3. **Testar:**
- [ ] Criar tarefa recorrente "Manutenção Semanal"
- [ ] Verificar se roda na data correta
- [ ] Próximo run_at é calculado corretamente
- [ ] Status volta para 'active'

**Tempo:** 3-4h

---

### DIA 8 — Alert System (3-4h)

**Objetivo:** Implementar sistema de alertas com thresholds.

**Tarefas:**

1. **Criar tipos de alertas em `src/lib/alert-types.ts`:**
```typescript
export const ALERT_TYPES = {
  ads_balance_low: {
    threshold: { min_balance: 250 },
    severity: 'critical',
    message: 'Saldo Google Ads abaixo de R$ {min_balance}',
  },
  cpc_high: {
    threshold: { increase_percentage: 20 },
    severity: 'warning',
  },
  cpa_high: {
    threshold: { max_cpa: 200 },
    severity: 'warning',
  },
  payment_overdue: {
    threshold: { days_overdue: 7 },
    severity: 'critical',
  },
  // ... mais tipos
}
```

2. **Criar sensor Edge Function: `supabase/functions/alert-sensor`**
   - Roda a cada 15 min
   - Busca dados de Google Ads API
   - Verifica cada threshold
   - Insere em timeline_alert_history se violado

3. **Criar UI para configuração de alertas:**
- `app/(app)/admin/alerts/page.tsx`
- Listar tipos de alertas
- Editar thresholds
- Toggle enable/disable por alerta

4. **Testes:**
- [ ] Alerta dispara quando threshold violado
- [ ] Não dispara quando threshold OK
- [ ] Configuração persiste corretamente
- [ ] Toast/notificação aparece

**Tempo:** 3-4h

---

### DIA 9 — Alert Card + Escalation (3-4h)

**Objetivo:** Exibir alertas na timeline e implementar escalação.

**Tarefas:**

1. **Modificar TimelineCard para tipo 'alert':**
   - Exibir alertas em tempo real
   - Badge com contagem (3 alertas críticos)
   - Cada alerta é clickável → abre detalhe

2. **Criar Alert Escalation Function:**
```typescript
// Roda a cada 1h
// Busca alertas não acknowledged há > 24h
// Incrementar severity para 'critical'
// Enviar email/SMS de escalação
```

3. **Criar UI de detalhes do alerta:**
- Qual é o alerta
- Quando disparou
- Threshold configurado vs valor atual
- Botões: Acknowledge, Take Action, Snooze

4. **Testes:**
- [ ] Alertas aparecem no dashboard
- [ ] Escalação funciona
- [ ] Acknowledgment remove do display
- [ ] Snooze oculta por X tempo

**Tempo:** 3-4h

---

### DIA 10 — Integration Tests (2-3h)

**Objetivo:** Testar tudo junto e corrigir bugs.

**Tarefas:**

1. **Teste end-to-end:**
   - [ ] Criar novo cliente
   - [ ] Ativar "Onboarding" timeline
   - [ ] Completar steps um por um
   - [ ] Ver progresso barra
   - [ ] Ver alerta quando saldo baixo
   - [ ] Ver tarefa recorrente criada

2. **Performance:**
   - [ ] Dashboard carrega em < 2s
   - [ ] Expandir timeline < 500ms
   - [ ] API responses < 200ms

3. **Edge cases:**
   - [ ] O que acontece se ativar 2 timelines do mesmo tipo?
   - [ ] O que acontece se cliente for deletado?
   - [ ] O que acontece se template for atualizado mid-timeline?

4. **Bugfixes:**
   - [ ] Corrigir qualquer inconsistência visual
   - [ ] Ajustar spacing/tipografia conforme necessário
   - [ ] Testar dark/light mode

**Tempo:** 2-3h

---

**FIM SEMANA 2 — Status:**
- ✅ Template Builder completo
- ✅ Tarefas recorrentes funcionando
- ✅ Sistema de alertas integrado
- ✅ Tudo testado
- ✅ Pronto para refino

---

## SEMANA 3 — POLISH & DEPLOY (Dias 11-20)

### DIA 11-12 — Animações + Micro-Interações (3-4h)

**Tarefas:**

1. **Instalar Framer Motion:**
```bash
npm install framer-motion
```

2. **Adicionar animações:**
   - [ ] Page enter fade (todos as páginas)
   - [ ] Timeline expand/collapse smooth
   - [ ] Step completion confetti
   - [ ] Alert severity pulse animation
   - [ ] Tooltip fade-in

3. **Adicionar transições:**
   - [ ] Hover states em todos os botões
   - [ ] Active scale (active:scale-95)
   - [ ] Color transitions (duration-150)

---

### DIA 13-14 — Error Handling + Edge Cases (3-4h)

**Tarefas:**

1. **Adicionar try-catch em todas as API calls**
2. **Criar error boundaries:**
```tsx
// ErrorBoundary wrapper para dashboard
// Exibir mensagem de erro clara
// Botão "Recarregar"
```

3. **Testar falhas:**
   - [ ] Sem internet
   - [ ] Servidor retorna 500
   - [ ] Timeout de requisição
   - [ ] Dados corrompidos

---

### DIA 15-16 — Testes de Acessibilidade (2-3h)

**Tarefas:**

1. **Rodar Lighthouse:**
```bash
npm run build
npm run start
# Abrir http://localhost:3000 em Chrome DevTools
# Rodar Lighthouse audit
# Target: Performance > 90, Accessibility > 90
```

2. **Rodar Axe DevTools:**
   - [ ] Zero "Critical" issues
   - [ ] Zero "Serious" issues
   - [ ] Review "Moderate"

3. **Adicionar aria-labels onde faltam:**
```tsx
<button aria-label="Expandir timeline">
  <ChevronDown />
</button>
```

---

### DIA 17-18 — Responsividade Mobile (2-3h)

**Tarefas:**

1. **Testar em dispositivos reais:**
   - [ ] iPhone 12/13/14
   - [ ] Android Samsung/Google
   - [ ] Tablet

2. **Ajustar breakpoints:**
   - [ ] Grid responde corretamente
   - [ ] Touch targets >= 44x44px
   - [ ] Sem horizontal scroll

3. **Otimizações mobile:**
   - [ ] Reduzir tamanho de inputs
   - [ ] Botões maiores
   - [ ] Menos conteúdo por tela

---

### DIA 19 — Documentation + Training (2h)

**Tarefas:**

1. **Documentar para operador:**
   - Como criar timeline template
   - Como ativar para novo cliente
   - Como completar steps
   - Como configurar alertas

2. **Criar guia admin:**
   - Sistema de alertas
   - Tarefas recorrentes
   - Troubleshooting

---

### DIA 20 — Final Deploy (1-2h)

**Tarefas:**

1. **Código final:**
   - [ ] npm run lint — zero warnings
   - [ ] npm run type-check — zero errors
   - [ ] npm run build — sucesso

2. **Deploy:**
```bash
git add .
git commit -m "feat: timeline system complete + audit fixes"
git push
# Vercel auto-deploys
```

3. **Post-deploy:**
   - [ ] Testar em produção
   - [ ] Verificar RLS policies
   - [ ] Rodar Lighthouse em prod
   - [ ] Monitorar Sentry

4. **Go-live:**
   - [ ] Avisar operador que está pronto
   - [ ] Começar a usar com novo cliente real

---

## ✅ CHECKLIST FINAL

### Code Quality
- [ ] TypeScript strict mode
- [ ] Zero console.errors
- [ ] Zero `any` types
- [ ] ESLint passing

### Design
- [ ] Tipografia padronizada
- [ ] Spacing consistente
- [ ] Dark/Light mode
- [ ] Responsivo mobile

### Features
- [ ] 3 Timeline Cards funcionando
- [ ] Template Builder
- [ ] Tarefas recorrentes
- [ ] Alertas com escalation

### Testing
- [ ] Lighthouse > 90
- [ ] Axe DevTools 0 críticos
- [ ] Mobile responsivo
- [ ] E2E testado

### Performance
- [ ] Dashboard < 2s
- [ ] API < 200ms
- [ ] Bundle < 300KB gzip
- [ ] No memory leaks

### Security
- [ ] RLS policies ativas
- [ ] Auth middleware
- [ ] Secrets em .env
- [ ] CORS correto

### Documentation
- [ ] README atualizado
- [ ] API documented
- [ ] Admin guide criado
- [ ] User guide criado

---

## 🎯 RESULTADO FINAL

Quando terminar os 20 dias, você terá:

✅ **Projeto 100% premium design** (tipografia, spacing, animations)  
✅ **Sistema operacional completo** (timelines, templates, alertas)  
✅ **Automações** (tarefas recorrentes, sensor de alertas)  
✅ **Production-ready** (testado, documentado, escalável)  
✅ **Pronto para escalar** (suporta 100+ clientes facilmente)

---

## 📞 SUPORTE DURANTE IMPLEMENTAÇÃO

**Se travar em algo:**

1. Volte ao doc correspondente (AUDITORIA, TIMELINE_CARDS_SYSTEM, etc.)
2. Procure a seção exata
3. Copie/adapte o código
4. Teste localmente

**Se não entender uma feature:**

1. Leia TIMELINE_CARDS_SYSTEM.md Parte 5 (Features Complementares)
2. Ou Parte 8 (Perguntas Respondidas)
3. São as coisas que você provavelmente não pensou

---

*Boa sorte! Esse é um plano sólido que você consegue executar. Comece pelo DIA 1 e avance dia por dia. Não pule nada. O resultado vai ser incrível.*

**Começar agora?**
