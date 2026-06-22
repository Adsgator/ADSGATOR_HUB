export type TimelineType = 'onboarding' | 'recurring_task' | 'alert'
export type TimelineStatus = 'active' | 'paused' | 'completed' | 'archived'
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type StepActionType = 'complete' | 'wait' | 'skip'
export type MessageRole = 'instruction' | 'user_action' | 'template'

export interface TimelineInputField {
  id: string
  label: string
  type: 'text' | 'number' | 'url' | 'email' | 'textarea' | 'select'
  required?: boolean
  placeholder?: string
  options?: string[] // for select type
}

export interface TimelineMessage {
  id: string
  role: MessageRole
  text: string
  copyable?: boolean
  template_tag?: string
}

export interface TimelineStep {
  id: string
  order: number
  title: string
  type: 'info' | 'action' | 'check' | 'wait'
  duration_days?: number
  prerequisite?: string // step_id
  content?: string
  messages: TimelineMessage[]
  input_fields?: TimelineInputField[]
  /**
   * De quem é a vez nesta etapa: 'cliente' = esperando algo do cliente (cobrar
   * ele), 'agencia' = tarefa interna do Lucas (cobrar a si mesmo). Define os
   * lembretes e o "no escuro". Default 'agencia' quando ausente.
   */
  responsavel?: 'cliente' | 'agencia'
  /**
   * Lembretes (em horas desde a entrada na etapa) quando a bola está com o
   * cliente e ele não se move. Ex.: [24, 72]. Vazio/ausente = sem lembrete.
   */
  lembrete_horas?: number[]
  /** Texto de lembrete pronto (padrão de voz) para Lucas enviar quando travar. */
  lembrete_mensagem?: string
}

export interface TimelineTemplate {
  id: string
  name: string
  type: TimelineType
  description?: string
  scope: 'global' | 'per_client' | 'per_niche'
  icon: string
  color: string
  steps: TimelineStep[]
  config?: Record<string, unknown>
  recurrence?: {
    freq: 'DAILY' | 'WEEKLY' | 'BIWEEKLY'
    byday?: string[]
    interval?: number
  }
  is_active: boolean
  is_default: boolean
  parent_template_id?: string
  is_shared: boolean
  created_by?: string
  created_at: string
  updated_at: string
  updated_by?: string
}

export interface TimelineInstance {
  id: string
  template_id: string
  type: TimelineType
  client_id?: string
  niche?: string
  status: TimelineStatus
  current_step_id?: string
  completed_steps: string[]
  pending_steps: string[]
  skipped_steps: string[]
  data: Record<string, unknown>
  recurrence_rule?: string
  last_run_at?: string
  next_run_at?: string
  run_count: number
  created_at: string
  updated_at: string
  completed_at?: string
  paused_at?: string
  // Joined
  template?: TimelineTemplate
}

export interface TimelineAlert {
  id: string
  client_id?: string
  alert_type: string
  severity: AlertSeverity
  threshold_config?: Record<string, unknown>
  enabled: boolean
  notify_via: string[]
  escalate_after_hours: number
  created_at: string
  updated_at: string
  created_by?: string
}

export interface TimelineAlertHistory {
  id: string
  alert_id?: string
  client_id?: string
  alert_type: string
  severity: AlertSeverity
  message?: string
  context?: Record<string, unknown>
  triggered_at: string
  acknowledged_at?: string
  acknowledged_by?: string
  action_taken?: string
  action_timestamp?: string
  action_metadata?: Record<string, unknown>
  is_duplicate: boolean
  duplicate_of?: string
  created_at: string
}

export interface TimelineStepAnalytics {
  id: string
  template_id: string
  step_id: string
  instance_id: string
  client_id?: string
  started_at: string
  completed_at?: string
  duration_seconds?: number
  status?: 'completed' | 'abandoned' | 'skipped'
  created_at: string
}

export interface TimelineAuditLog {
  id: string
  instance_id?: string
  action: string
  details?: Record<string, unknown>
  changed_by?: string
  changed_at: string
}

// Derived types for UI
export interface TimelineProgress {
  total: number
  completed: number
  percentage: number
  currentStep?: TimelineStep
}
