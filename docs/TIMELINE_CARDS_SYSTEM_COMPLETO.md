# 📋 GUIA COMPLETO — TIMELINE CARDS SYSTEM
**Versão:** 1.0 — Sistema de Timelines Operacionais  
**Scope:** Onboarding, Tarefas Recorrentes, Alertas  
**Complexidade:** High — Múltiplas features integradas  
**Tempo de Implementação:** 15-20 dias para tudo

---

## 🎯 VISÃO GERAL DO SISTEMA

O sistema é composto por **3 Timeline Cards principais**:

```
┌─────────────────────────────────────────────────────┐
│ DASHBOARD / PAINEL CLIENTE                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ │ ONBOARDING   │  │ TAREFAS      │  │ ALERTAS &    │
│ │ TIMELINE     │  │ RECORRENTES  │  │ NOTIFICAÇÕES │
│ │              │  │              │  │              │
│ │ • Novo       │  │ • Manutenção │  │ • Críticos   │
│ │   Cliente    │  │   Quinzenal  │  │ • Avisos     │
│ │ • Setup      │  │ • Otimização │  │ • Confir-    │
│ │   Técnico    │  │   Semanal    │  │   mações     │
│ │ • Go Live    │  │ • Criar      │  │ • Erros      │
│ │              │  │   Tasks      │  │              │
│ └──────────────┘  └──────────────┘  └──────────────┘
│                                                     │
└─────────────────────────────────────────────────────┘
```

Cada card é **expansível**, **editável** e **totalmente personalizável** via **Template Builder**.

---

## PARTE 1 — MODELO DE DADOS (Banco de Dados)

### 1.1 Tabela: timeline_templates

Define os templates reutilizáveis (estrutura base de uma timeline).

```sql
CREATE TABLE timeline_templates (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text NOT NULL,              -- ex: "Onboarding LP", "Manutenção Mensal"
  type            text NOT NULL,              -- enum: 'onboarding' | 'recurring_task' | 'alert'
  description     text,
  scope           text NOT NULL,              -- 'global' | 'per_client' | 'per_niche'
  icon            text,                       -- nome do ícone Lucide: "CheckSquare", "AlertTriangle"
  color           text DEFAULT '#FFA500',     -- hex color
  steps           jsonb,                      -- array de steps (ver structure abaixo)
  config          jsonb,                      -- configurações específicas do tipo
  recurrence      jsonb,                      -- para recurring_tasks: { freq: 'weekly', day: 'monday' }
  is_default      boolean DEFAULT false,      -- é o template padrão?
  created_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  updated_by      uuid REFERENCES auth.users(id)
);
```

**Estrutura de `steps` (jsonb):**
```json
[
  {
    "id": "step_001",
    "order": 1,
    "title": "Definir nicho e público",
    "type": "info",
    "content": "Converse com o cliente sobre...",
    "icon": "Users",
    "duration_days": 1,
    "messages": [
      {
        "id": "msg_001",
        "role": "instruction",
        "text": "Qual é o nicho principal do negócio?",
        "type": "chat"
      },
      {
        "id": "msg_002",
        "role": "user_action",
        "text": "[Enviar no WhatsApp: Qual é o público principal?]",
        "copyable": true,
        "template_tag": "#GANCHO"
      }
    ],
    "input_fields": [
      {
        "id": "input_niche",
        "label": "Nicho identificado",
        "type": "text",
        "required": true,
        "placeholder": "ex: Adestramento canino"
      }
    ],
    "actions": [
      {
        "id": "action_complete",
        "label": "Marcar como feito",
        "type": "complete"
      },
      {
        "id": "action_wait",
        "label": "Aguardando cliente",
        "type": "wait"
      }
    ]
  },
  {
    "id": "step_002",
    "order": 2,
    "title": "Criar conta Google Ads",
    "type": "action",
    "prerequisite": "step_001",  // só aparece se step_001 estiver feito
    "content": "Guia completo aqui...",
    "messages": [...],
    "input_fields": [...]
  }
]
```

### 1.2 Tabela: timeline_instances

Instâncias de templates — quando um template é "ativado" para um cliente ou globalmente.

```sql
CREATE TABLE timeline_instances (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id       uuid REFERENCES timeline_templates(id),
  type              text NOT NULL,              -- 'onboarding' | 'recurring_task' | 'alert'
  client_id         uuid REFERENCES clientes(id),  -- null se global
  status            text DEFAULT 'active',      -- 'active' | 'paused' | 'completed'
  
  -- Campos para tracking
  current_step_id   text,                       -- qual step está ativo
  completed_steps   jsonb DEFAULT '[]'::jsonb,  -- array de step_ids completados
  pending_steps     jsonb DEFAULT '[]'::jsonb,  -- array de step_ids pendentes (aguardando cliente)
  data              jsonb,                      -- dados preenchidos (inputs do usuário)
  
  -- Para tarefas recorrentes
  recurrence_rule   text,                       -- iCal rule: "FREQ=WEEKLY;BYDAY=MO"
  last_run_at       timestamptz,
  next_run_at       timestamptz,
  
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  completed_at      timestamptz
);
```

### 1.3 Tabela: timeline_alerts

Configuração de alertas (o que disparar, quando, para quem).

```sql
CREATE TABLE timeline_alerts (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id         uuid REFERENCES clientes(id),  -- null se global
  
  alert_type        text NOT NULL,              -- ex: 'ads_balance_low', 'cpc_high', 'payment_overdue'
  severity          text DEFAULT 'medium',      -- 'info' | 'warning' | 'critical'
  
  -- Thresholds (o que considera "high" ou "low")
  threshold_config  jsonb,                      -- ex: { "min_balance": 100, "currency": "BRL" }
  
  enabled           boolean DEFAULT true,
  notify_via        text[] DEFAULT '{dashboard,email}',  -- array: dashboard, email, sms, whatsapp
  
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);
```

**Exemplo de `alert_type` com `threshold_config`:**
```json
{
  "alert_type": "ads_balance_low",
  "severity": "critical",
  "threshold_config": {
    "min_balance": 250.00,
    "currency": "BRL"
  }
}
```

### 1.4 Tabela: timeline_alert_history

Histórico de alertas disparados (para não duplicar, e para analytics).

```sql
CREATE TABLE timeline_alert_history (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id          uuid REFERENCES timeline_alerts(id),
  client_id         uuid REFERENCES clientes(id),
  
  alert_type        text,
  severity          text,
  message           text,
  context           jsonb,                      -- dados do alerta (ex: saldo atual)
  
  triggered_at      timestamptz DEFAULT now(),
  acknowledged_at   timestamptz,
  acknowledged_by   uuid REFERENCES auth.users(id),
  
  action_taken      text,                       -- ex: "recarregar", "ignorar", "escalado"
  action_timestamp  timestamptz
);
```

---

## PARTE 2 — COMPONENTES FRONTEND

### 2.1 Component: TimelineCard.tsx

O card principal que wrappa tudo.

```tsx
// src/components/dashboard/TimelineCard.tsx

interface TimelineCardProps {
  title: string
  icon: React.ReactNode
  type: 'onboarding' | 'recurring_task' | 'alert'
  timelineId: string
  expanded?: boolean
  onExpand?: (expanded: boolean) => void
}

export function TimelineCard({
  title,
  icon,
  type,
  timelineId,
  expanded = false,
  onExpand,
}: TimelineCardProps) {
  const [timeline, setTimeline] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadTimeline = async () => {
    setLoading(true)
    const res = await fetch(`/api/v1/timelines/${timelineId}`)
    const data = await res.json()
    setTimeline(data)
    setLoading(false)
  }

  useEffect(() => {
    if (expanded) loadTimeline()
  }, [expanded])

  return (
    <Card
      variant="default"
      className="overflow-hidden"
    >
      {/* Header (sempre visível) */}
      <button
        onClick={() => onExpand?.(!expanded)}
        className="w-full flex items-center justify-between p-[1.5rem] hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-[1rem]">
          <div className="text-ads-500">{icon}</div>
          <div className="text-left">
            <h3 className="text-h3 text-ink-primary">{title}</h3>
            {timeline && (
              <p className="text-[0.75rem] text-ink-muted mt-[0.25rem]">
                {timeline.completed_steps?.length || 0} de {timeline.total_steps} completos
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-[1.25rem] transition-transform ${expanded ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>

      {/* Conteúdo expandido */}
      {expanded && (
        <div className="border-t border-surface-border p-[1.5rem] bg-surface-base">
          {loading ? (
            <SkeletonLine width="100%" height="1rem" count={3} />
          ) : timeline ? (
            <TimelineContent timeline={timeline} type={type} />
          ) : null}
        </div>
      )}
    </Card>
  )
}
```

### 2.2 Component: TimelineContent.tsx

O conteúdo expandido — mostra steps, messages, inputs.

```tsx
// src/components/dashboard/TimelineContent.tsx

interface TimelineContentProps {
  timeline: any
  type: 'onboarding' | 'recurring_task' | 'alert'
}

export function TimelineContent({ timeline, type }: TimelineContentProps) {
  const [currentStepId, setCurrentStepId] = useState(timeline.current_step_id)
  const [formData, setFormData] = useState(timeline.data || {})

  const currentStep = timeline.steps.find((s: any) => s.id === currentStepId)

  if (!currentStep) {
    return <EmptyState icon={<CheckCircle2 />} title="Timeline completa" description="Todos os passos foram concluídos!" />
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldId]: value }))
  }

  const handleCompleteStep = async () => {
    // POST /api/v1/timelines/{id}/step/{stepId}/complete
    const res = await fetch(`/api/v1/timelines/${timeline.id}/step/${currentStepId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ data: formData }),
    })
    const updated = await res.json()
    setCurrentStepId(updated.current_step_id)
    setFormData(updated.data)
  }

  return (
    <div className="space-y-[1.5rem]">
      {/* Progress bar */}
      <div className="space-y-[0.5rem]">
        <div className="flex items-center justify-between">
          <span className="text-[0.75rem] font-medium text-ink-muted uppercase">Progresso</span>
          <span className="text-[0.875rem] font-semibold text-ink-primary">
            {timeline.completed_steps?.length || 0}/{timeline.steps.length}
          </span>
        </div>
        <div className="w-full h-[0.5rem] bg-surface-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-ads-500 transition-all duration-300"
            style={{
              width: `${((timeline.completed_steps?.length || 0) / timeline.steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Step title */}
      <div>
        <h4 className="text-h3 text-ink-primary mb-[0.5rem]">
          {currentStep.order}. {currentStep.title}
        </h4>
        {currentStep.duration_days && (
          <p className="text-[0.75rem] text-ink-muted">
            ⏱️ Duração estimada: {currentStep.duration_days} dia(s)
          </p>
        )}
      </div>

      {/* Messages (WhatsApp-like chat) */}
      <div className="space-y-[0.75rem] max-h-[20rem] overflow-y-auto">
        {currentStep.messages?.map((msg: any) => (
          <TimelineMessage key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input fields */}
      {currentStep.input_fields?.length > 0 && (
        <div className="space-y-[1rem] bg-surface-card rounded-lg p-[1rem] border border-surface-border">
          {currentStep.input_fields.map((field: any) => (
            <InputPremium
              key={field.id}
              label={field.label}
              value={formData[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-[0.75rem]">
        <button
          onClick={handleCompleteStep}
          className="flex-1 h-[2.5rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white font-medium transition-colors"
        >
          ✓ Marcar como feito
        </button>
        <button
          onClick={() => {
            // Marcar como "aguardando cliente"
          }}
          className="px-[1rem] h-[2.5rem] rounded-lg bg-surface-hover border border-surface-border text-ink-secondary hover:text-ink-primary font-medium transition-colors"
        >
          ⏳ Aguardando
        </button>
      </div>
    </div>
  )
}
```

### 2.3 Component: TimelineMessage.tsx

Mensagem no estilo WhatsApp (chat bubbles).

```tsx
// src/components/dashboard/TimelineMessage.tsx

interface TimelineMessageProps {
  message: {
    id: string
    role: 'instruction' | 'user_action' | 'template'
    text: string
    copyable?: boolean
    template_tag?: string
  }
}

export function TimelineMessage({ message }: TimelineMessageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Cores por tipo de mensagem
  const roleConfig = {
    instruction: {
      bg: 'bg-surface-card',
      text: 'text-ink-secondary',
      icon: '💡',
      align: 'flex-start',
    },
    user_action: {
      bg: 'bg-ads-500/10',
      text: 'text-ads-500',
      icon: '📱',
      align: 'flex-end',
    },
    template: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      icon: '✓',
      align: 'flex-end',
    },
  }

  const config = roleConfig[message.role]

  return (
    <div className={`flex ${config.align}`}>
      <div className={`max-w-[80%] ${config.bg} ${config.text} rounded-[1rem] px-[1rem] py-[0.75rem] text-[0.875rem] leading-relaxed relative group`}>
        {message.text}

        {/* Copy button (para templates) */}
        {message.copyable && (
          <button
            onClick={handleCopy}
            className={`absolute -right-[2.5rem] top-0 w-[2rem] h-[2rem] rounded-lg flex items-center justify-center transition-all ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-surface-hover text-ink-muted group-hover:text-ads-500'
            }`}
            title="Copiar para clipboard"
          >
            {copied ? <Check className="w-[1rem]" strokeWidth={2} /> : <Copy className="w-[1rem]" strokeWidth={1.5} />}
          </button>
        )}

        {/* Template tag indicator */}
        {message.template_tag && (
          <div className="text-[0.625rem] opacity-70 mt-[0.25rem]">
            {message.template_tag}
          </div>
        )}
      </div>
    </div>
  )
}
```

### 2.4 Component: TemplateBuilder.tsx

Interface para criar/editar templates.

```tsx
// src/components/timeline/TemplateBuilder.tsx

interface TemplateBuilderProps {
  templateId?: string
  onSave?: (template: any) => void
  onCancel?: () => void
}

export function TemplateBuilder({ templateId, onSave, onCancel }: TemplateBuilderProps) {
  const [template, setTemplate] = useState<any>({
    name: '',
    type: 'onboarding',
    description: '',
    steps: [],
    icon: 'CheckSquare',
    color: '#FFA500',
  })

  const [currentStepEditor, setCurrentStepEditor] = useState<any>(null)
  const [showStepEditor, setShowStepEditor] = useState(false)

  const addStep = () => {
    const newStep = {
      id: `step_${Date.now()}`,
      order: (template.steps?.length || 0) + 1,
      title: 'Novo passo',
      type: 'info',
      content: '',
      messages: [],
      input_fields: [],
      actions: [],
    }
    setTemplate((prev: any) => ({
      ...prev,
      steps: [...(prev.steps || []), newStep],
    }))
  }

  const editStep = (step: any) => {
    setCurrentStepEditor(step)
    setShowStepEditor(true)
  }

  const deleteStep = (stepId: string) => {
    setTemplate((prev: any) => ({
      ...prev,
      steps: (prev.steps || []).filter((s: any) => s.id !== stepId),
    }))
  }

  const saveStep = (updatedStep: any) => {
    setTemplate((prev: any) => ({
      ...prev,
      steps: (prev.steps || []).map((s: any) => (s.id === updatedStep.id ? updatedStep : s)),
    }))
    setShowStepEditor(false)
  }

  const handleSave = async () => {
    // POST /api/v1/timeline-templates
    const res = await fetch('/api/v1/timeline-templates', {
      method: 'POST',
      body: JSON.stringify(template),
    })
    const saved = await res.json()
    onSave?.(saved)
  }

  return (
    <div className="space-y-[2rem]">
      {/* Template metadata */}
      <Card>
        <h3 className="text-h3 text-ink-primary mb-[1rem]">Configurações Básicas</h3>
        <div className="space-y-[1rem]">
          <InputPremium
            label="Nome do Template"
            value={template.name}
            onChange={(e) => setTemplate({ ...template, name: e.target.value })}
            placeholder="ex: Onboarding LP Pro"
          />
          <div className="grid grid-cols-2 gap-[1rem]">
            <div>
              <label className="block text-[0.875rem] font-medium text-ink-primary mb-[0.5rem]">Tipo</label>
              <select
                value={template.type}
                onChange={(e) => setTemplate({ ...template, type: e.target.value })}
                className="w-full h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-card border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:border-ads-500"
              >
                <option value="onboarding">Onboarding</option>
                <option value="recurring_task">Tarefa Recorrente</option>
                <option value="alert">Alerta</option>
              </select>
            </div>
            <div>
              <label className="block text-[0.875rem] font-medium text-ink-primary mb-[0.5rem]">Cor</label>
              <input
                type="color"
                value={template.color}
                onChange={(e) => setTemplate({ ...template, color: e.target.value })}
                className="w-full h-[2.25rem] rounded-lg cursor-pointer"
              />
            </div>
          </div>
          <textarea
            placeholder="Descrição do template..."
            value={template.description}
            onChange={(e) => setTemplate({ ...template, description: e.target.value })}
            className="w-full h-[6rem] px-[1rem] py-[0.75rem] rounded-lg bg-surface-card border border-surface-border text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-ads-500 resize-none text-[0.875rem]"
          />
        </div>
      </Card>

      {/* Steps editor */}
      <Card>
        <div className="flex items-center justify-between mb-[1rem]">
          <h3 className="text-h3 text-ink-primary">Passos</h3>
          <button
            onClick={addStep}
            className="h-[2rem] px-[0.75rem] rounded-lg bg-ads-500/10 hover:bg-ads-500/20 text-ads-500 text-[0.8125rem] font-medium transition-colors flex items-center gap-[0.375rem]"
          >
            <Plus className="w-[1rem]" strokeWidth={2} />
            Adicionar Passo
          </button>
        </div>

        <div className="space-y-[0.75rem]">
          {template.steps?.map((step: any) => (
            <div
              key={step.id}
              className="flex items-center justify-between p-[1rem] rounded-lg bg-surface-hover border border-surface-border hover:border-ads-500/30 transition-colors group"
            >
              <div className="flex items-center gap-[1rem] flex-1">
                <div className="flex items-center justify-center w-[2rem] h-[2rem] rounded-lg bg-surface-border text-ink-muted text-[0.875rem] font-semibold">
                  {step.order}
                </div>
                <div className="flex-1">
                  <p className="text-ink-primary font-medium">{step.title}</p>
                  <p className="text-[0.75rem] text-ink-muted">{step.messages?.length || 0} mensagens, {step.input_fields?.length || 0} inputs</p>
                </div>
              </div>
              <div className="flex gap-[0.5rem] opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => editStep(step)}
                  className="p-[0.5rem] hover:bg-surface-card rounded transition-colors"
                >
                  <Edit2 className="w-[1rem] text-ink-muted hover:text-ads-500" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => deleteStep(step.id)}
                  className="p-[0.5rem] hover:bg-surface-card rounded transition-colors"
                >
                  <Trash2 className="w-[1rem] text-ink-muted hover:text-red-400" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Step editor modal */}
      {showStepEditor && currentStepEditor && (
        <StepEditor
          step={currentStepEditor}
          onSave={saveStep}
          onCancel={() => setShowStepEditor(false)}
        />
      )}

      {/* Save/Cancel */}
      <div className="flex gap-[0.75rem]">
        <button
          onClick={handleSave}
          className="flex-1 h-[2.5rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white font-medium transition-colors"
        >
          Salvar Template
        </button>
        <button
          onClick={onCancel}
          className="px-[2rem] h-[2.5rem] rounded-lg bg-surface-hover border border-surface-border text-ink-secondary hover:text-ink-primary font-medium transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
```

---

## PARTE 3 — API ROUTES

### 3.1 POST /api/v1/timeline-templates

Criar/atualizar um template.

```typescript
// app/api/v1/timeline-templates/route.ts

export async function POST(request: Request) {
  const { name, type, steps, description, color, icon, scope, recurrence } = await request.json()
  const { user } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('timeline_templates')
    .insert({
      name,
      type,
      steps,
      description,
      color,
      icon,
      scope: scope || 'global',
      recurrence,
      created_by: user?.id,
    })
    .select()
    .single()

  if (error) return new Response(JSON.stringify(error), { status: 400 })
  return new Response(JSON.stringify(data), { status: 201 })
}
```

### 3.2 GET /api/v1/timelines/[id]

Buscar uma timeline instance.

```typescript
// app/api/v1/timelines/[id]/route.ts

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('timeline_instances')
    .select(`
      *,
      template:timeline_templates(*)
    `)
    .eq('id', params.id)
    .single()

  if (error) return new Response(JSON.stringify(error), { status: 404 })
  return new Response(JSON.stringify(data))
}
```

### 3.3 POST /api/v1/timelines/[id]/step/[stepId]/complete

Marcar um step como completo.

```typescript
export async function POST(
  request: Request,
  { params }: { params: { id: string; stepId: string } }
) {
  const { data: formData } = await request.json()

  // Buscar timeline
  const { data: timeline, error } = await supabase
    .from('timeline_instances')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return new Response(JSON.stringify(error), { status: 404 })

  // Buscar o template para saber o próximo step
  const template = await supabase
    .from('timeline_templates')
    .select('steps')
    .eq('id', timeline.template_id)
    .single()

  const currentStepIndex = template.data.steps.findIndex((s: any) => s.id === params.stepId)
  const nextStep = template.data.steps[currentStepIndex + 1]

  // Atualizar timeline
  const { data: updated } = await supabase
    .from('timeline_instances')
    .update({
      completed_steps: [...(timeline.completed_steps || []), params.stepId],
      current_step_id: nextStep?.id || null,
      data: { ...timeline.data, ...formData },
      updated_at: new Date().toISOString(),
      completed_at: !nextStep ? new Date().toISOString() : null,
    })
    .eq('id', params.id)
    .select()
    .single()

  return new Response(JSON.stringify(updated))
}
```

---

## PARTE 4 — INTEGRAÇÃO NO DASHBOARD

### 4.1 Layout do Dashboard (3 cards em grid)

```tsx
// app/(app)/dashboard/page.tsx

export default function DashboardPage() {
  // ... código anterior ...

  return (
    <MainLayout>
      {/* Bento Grid existente */}
      <div className="grid gap-[1rem] grid-cols-1 lg:grid-cols-4 mb-[2rem]">
        {/* Cards existentes */}
      </div>

      {/* NOVA SEÇÃO: TIMELINE CARDS */}
      <div className="grid gap-[1rem] grid-cols-1 lg:grid-cols-3 mb-[2rem]">
        <TimelineCard
          title="Onboarding do Cliente"
          icon={<CheckSquare className="w-[1.5rem]" strokeWidth={1.5} />}
          type="onboarding"
          timelineId="onboarding_template"
        />
        <TimelineCard
          title="Tarefas Recorrentes"
          icon={<Clock className="w-[1.5rem]" strokeWidth={1.5} />}
          type="recurring_task"
          timelineId="recurring_template"
        />
        <TimelineCard
          title="Alertas & Notificações"
          icon={<AlertTriangle className="w-[1.5rem]" strokeWidth={1.5} />}
          type="alert"
          timelineId="alerts_template"
        />
      </div>
    </MainLayout>
  )
}
```

---

## PARTE 5 — FEATURES COMPLEMENTARES (Não Óbvias)

### 5.1 Step Dependencies

Um step pode depender de outro — só aparece se o anterior foi feito.

```json
{
  "id": "step_002",
  "prerequisite": "step_001",
  "title": "Configurar Google Ads"
}
```

**Implementação:**
```tsx
const stepUnlocked = !currentStep.prerequisite ||
  timeline.completed_steps?.includes(currentStep.prerequisite)

if (!stepUnlocked) {
  return <p className="text-ink-muted">Conclua o passo anterior para desbloquear.</p>
}
```

### 5.2 Conditional Messages

Mensagens que só aparecem baseado em inputs anteriores.

```json
{
  "id": "msg_004",
  "text": "Encontrei que você trabalha com Adestramento!",
  "condition": { "field": "niche", "equals": "Adestramento" }
}
```

### 5.3 Template Inheritance

Reusar templates com pequenas customizações.

```sql
ALTER TABLE timeline_templates ADD COLUMN parent_template_id uuid;

-- Então você pode fazer:
-- Copiar template base, adicionar 2 steps custom, pronto
```

### 5.4 Bulk Task Creation

Criar tarefas recorrentes para TODOS os clientes de uma vez.

```typescript
// POST /api/v1/timeline-instances/bulk
const { template_id, apply_to } = body  // apply_to: 'all' | 'by_niche' | 'by_plan'

if (apply_to === 'all') {
  const clients = await supabase
    .from('clientes')
    .select('id')
    .eq('status', 'ativo')
  
  const instances = clients.data.map(c => ({
    template_id,
    client_id: c.id,
    type: 'recurring_task',
    status: 'active'
  }))
  
  await supabase.from('timeline_instances').insert(instances)
}
```

### 5.5 Alert Escalation

Se um alerta não é acknowledged por 24h, escalar para crítico.

```typescript
// Edge Function: supabase/functions/alert-escalation

const unacknowledgedAlerts = await supabase
  .from('timeline_alert_history')
  .select('*')
  .is('acknowledged_at', null)
  .lt('triggered_at', dayAgo)

// Incrementar severity
for (const alert of unacknowledgedAlerts) {
  await supabase
    .from('timeline_alert_history')
    .update({ severity: 'critical' })
    .eq('id', alert.id)
}
```

### 5.6 Recurring Task Auto-Creation

Tarefas que se criam automaticamente na próxima ocorrência.

```typescript
// Cron job diário
const recurringTasks = await supabase
  .from('timeline_instances')
  .select('*')
  .eq('type', 'recurring_task')
  .lt('next_run_at', now())

for (const task of recurringTasks) {
  // Marcar como completo
  await supabase
    .from('timeline_instances')
    .update({
      status: 'active',
      current_step_id: task.template.steps[0].id,
      last_run_at: now(),
      next_run_at: calculateNextRun(task.recurrence_rule)
    })
    .eq('id', task.id)
}
```

### 5.7 Statistics & Analytics

Tracking de quanto tempo cada cliente leva em cada passo.

```sql
CREATE TABLE timeline_step_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid,
  step_id text,
  client_id uuid,
  
  started_at timestamptz,
  completed_at timestamptz,
  duration_minutes int,
  
  created_at timestamptz DEFAULT now()
);

-- Dashboard metric:
-- "Onboarding médio: 14 dias"
-- "Passo mais lento: Configuração Google Ads (5 dias)"
```

### 5.8 Templates Marketplace

Reusar templates criados por outros usuários.

```sql
ALTER TABLE timeline_templates ADD COLUMN is_shared boolean DEFAULT false;
ALTER TABLE timeline_templates ADD COLUMN shared_by uuid;

-- Então ter um modal "Usar template da comunidade"
```

---

## PARTE 6 — TOQUES FINAIS (Premium Polish)

### 6.1 Animações

```tsx
// TimelineCard expansão com Framer Motion
<motion.div
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: 'auto' }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>

// Step completion com confetti
import confetti from 'canvas-confetti'

const handleCompleteStep = async () => {
  await markAsComplete()
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  })
}
```

### 6.2 Keyboard Shortcuts

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleCompleteStep()
    }
    if (e.key === 'Escape') {
      setShowStepEditor(false)
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

### 6.3 Notifications

```tsx
// Toast quando step é completo
toast.success(`✓ "${currentStep.title}" completo!`, {
  description: `${nextStep ? 'Próximo passo: ' + nextStep.title : 'Timeline concluída!'}`,
})

// Email notification para alertas críticos
if (alert.severity === 'critical') {
  await sendEmail({
    to: user.email,
    subject: `🚨 Alerta crítico: ${alert.alert_type}`,
    html: generateAlertHtml(alert),
  })
}
```

### 6.4 Dark Mode

Já integrado via CSS vars — nada a fazer aqui. ✅

---

## PARTE 7 — ROADMAP DE IMPLEMENTAÇÃO (15-20 dias)

### **Semana 1 — Fundação (Days 1-5)**
- [ ] Criar schema no Supabase (Part 1)
- [ ] Implementar TimelineCard.tsx, TimelineContent.tsx, TimelineMessage.tsx
- [ ] Implementar API routes básicas
- [ ] Integrar no Dashboard com 1 timeline funcional

### **Semana 2 — Completo (Days 6-10)**
- [ ] TemplateBuilder.tsx completo
- [ ] StepEditor modal
- [ ] Adicionar 3º timeline (Alertas)
- [ ] Testes end-to-end

### **Semana 3 — Features + Polish (Days 11-15)**
- [ ] Tarefas recorrentes (cron jobs)
- [ ] Alert escalation
- [ ] Animações (Framer Motion)
- [ ] Notifications (toast + email)

### **Semana 3+ — Extras (Days 16-20)**
- [ ] Bulk task creation
- [ ] Template inheritance
- [ ] Analytics/statistics
- [ ] Marketplace de templates
- [ ] Testes finais

---

## PARTE 8 — PERGUNTAS RESPONDIDAS (Coisas Que Você Não Pensou)

**P: E se o cliente não responder por muito tempo em um passo?**  
A: Sistema move para "Aguardando Cliente" automaticamente após X dias (configurável). Alerta aparece na timeline.

**P: Como ver histórico de tudo que foi feito?**  
A: Tabela `timeline_alert_history` + dashboard de analytics mostra duração por step, taxas de conclusão, etc.

**P: Posso aplicar um template a múltiplos clientes?**  
A: Sim — bulk create com `apply_to: 'all_active_clients'` ou filtrado por nicho/plano.

**P: E se eu cometer erro no template?**  
A: Você edita o template salvo, e afeta todas as timelines que usam ele (com opção de "não sincronizar").

**P: Como envio mensagens via WhatsApp automaticamente?**  
A: Messages com `template_tag` são copiáveis (botão copy), ou você integra Twilio/Baileys mais tarde para automação.

**P: Posso fazer template público para outros usuários reutilizarem?**  
A: Sim — `is_shared: true` + "Templates da Comunidade" modal (não está no MVP, mas é fácil adicionar).

---

## PARTE 9 — AMBIENTE DE DESENVOLVIMENTO

### Setup Local

```bash
# 1. Criar tabelas no Supabase
cat supabase/migrations/timeline_system.sql | psql

# 2. Instalar dependências
npm install framer-motion canvas-confetti

# 3. Variáveis .env.local (se necessário)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 4. Rodar dev
npm run dev

# 5. Acessar admin de templates
# http://localhost:3000/dashboard/templates
```

---

## PARTE 10 — CHECKLIST FINAL

```
Banco de Dados:
[ ] timeline_templates criada
[ ] timeline_instances criada
[ ] timeline_alerts criada
[ ] timeline_alert_history criada

Componentes:
[ ] TimelineCard.tsx funcional
[ ] TimelineContent.tsx funcional
[ ] TimelineMessage.tsx com copy button
[ ] TemplateBuilder.tsx completo
[ ] StepEditor modal funcional

API:
[ ] POST /api/v1/timeline-templates
[ ] GET /api/v1/timelines/[id]
[ ] POST /api/v1/timelines/[id]/step/[stepId]/complete
[ ] POST /api/v1/timeline-instances/bulk

Integrações:
[ ] 3 timelines no Dashboard
[ ] Dark/Light mode funcionando
[ ] Responsive (mobile)
[ ] Testes manuais completos

Polish:
[ ] Animações (Framer Motion)
[ ] Notificações (Sonner toasts)
[ ] Keyboard shortcuts
[ ] Error handling robusto

Documentação:
[ ] Instruções de uso para operador
[ ] Template de exemplos
[ ] API documentation
```

---

*Esse sistema é self-contained e scale bem. Você vai conseguir gerenciar 100+ clientes com isso funcionando perfeitamente.*  
*Comece pela Semana 1 e vá adicionando features conforme necessário.*

**Próximo passo?** Criar o arquivo de SQL com as migrations para o Supabase?
