-- MIGRATIONS: Timeline Cards System
-- File: supabase/migrations/[timestamp]_timeline_system.sql
-- Apply with: psql < migrations/[timestamp]_timeline_system.sql

-- ============================================================================
-- TABLE 1: timeline_templates
-- ============================================================================
-- Defines reusable timeline templates (structure base for onboarding/tasks/alerts)

CREATE TABLE IF NOT EXISTS timeline_templates (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic info
  name            text NOT NULL,              -- ex: "Onboarding LP", "Manutenção Mensal"
  type            text NOT NULL CHECK (type IN ('onboarding', 'recurring_task', 'alert')),
  description     text,
  scope           text NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'per_client', 'per_niche')),
  
  -- Visual
  icon            text DEFAULT 'CheckSquare', -- lucide-react icon name
  color           text DEFAULT '#FFA500',     -- hex color
  
  -- Content
  steps           jsonb NOT NULL DEFAULT '[]'::jsonb,  -- array of step objects
  config          jsonb DEFAULT '{}'::jsonb,           -- type-specific config
  recurrence      jsonb,                      -- for recurring_task: { "freq": "WEEKLY", "byday": "MO" }
  
  -- Status
  is_active       boolean DEFAULT true,
  is_default      boolean DEFAULT false,
  
  -- Metadata
  parent_template_id uuid REFERENCES timeline_templates(id) ON DELETE SET NULL,
  is_shared       boolean DEFAULT false,
  
  created_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  updated_by      uuid REFERENCES auth.users(id),
  
  CONSTRAINT template_name_unique_per_scope UNIQUE (name, scope)
);

CREATE INDEX idx_timeline_templates_type ON timeline_templates(type);
CREATE INDEX idx_timeline_templates_scope ON timeline_templates(scope);
CREATE INDEX idx_timeline_templates_is_default ON timeline_templates(is_default);

-- ============================================================================
-- TABLE 2: timeline_instances
-- ============================================================================
-- Instances of templates - when a template is activated for a client or globally

CREATE TABLE IF NOT EXISTS timeline_instances (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Template reference
  template_id       uuid NOT NULL REFERENCES timeline_templates(id) ON DELETE CASCADE,
  
  -- Scope
  type              text NOT NULL CHECK (type IN ('onboarding', 'recurring_task', 'alert')),
  client_id         uuid REFERENCES clientes(id) ON DELETE CASCADE,  -- null if global/shared
  niche             text,                       -- optional niching (ex: "Adestramento")
  
  -- Status tracking
  status            text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  
  -- Step tracking
  current_step_id   text,                       -- which step is active now
  completed_steps   jsonb DEFAULT '[]'::jsonb,  -- array of step_ids completed
  pending_steps     jsonb DEFAULT '[]'::jsonb,  -- array of step_ids awaiting client
  skipped_steps     jsonb DEFAULT '[]'::jsonb,  -- array of step_ids skipped
  
  -- User-submitted data
  data              jsonb DEFAULT '{}'::jsonb,  -- form inputs from user
  
  -- For recurring tasks
  recurrence_rule   text,                       -- iCal format: "FREQ=WEEKLY;BYDAY=MO,WE,FR"
  last_run_at       timestamptz,
  next_run_at       timestamptz,
  run_count         int DEFAULT 0,
  
  -- Timeline metadata
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  completed_at      timestamptz,
  paused_at         timestamptz,
  
  CONSTRAINT valid_instance CHECK (
    (client_id IS NOT NULL AND type != 'recurring_task') OR
    (client_id IS NULL AND type = 'recurring_task')
  )
);

CREATE INDEX idx_timeline_instances_template_id ON timeline_instances(template_id);
CREATE INDEX idx_timeline_instances_client_id ON timeline_instances(client_id);
CREATE INDEX idx_timeline_instances_status ON timeline_instances(status);
CREATE INDEX idx_timeline_instances_next_run_at ON timeline_instances(next_run_at) 
  WHERE type = 'recurring_task' AND status = 'active';

-- ============================================================================
-- TABLE 3: timeline_alerts
-- ============================================================================
-- Alert configuration: what to trigger, when, for whom

CREATE TABLE IF NOT EXISTS timeline_alerts (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Scope
  client_id         uuid REFERENCES clientes(id) ON DELETE CASCADE,  -- null if global
  
  -- Alert definition
  alert_type        text NOT NULL,              -- ex: 'ads_balance_low', 'cpc_high', 'payment_overdue'
  severity          text DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  
  -- Thresholds
  threshold_config  jsonb,                      -- alert-specific thresholds
                                                 -- ex: { "min_balance": 250.0, "currency": "BRL" }
                                                 --     { "max_cpc": 5.0, "percentage_increase": 20 }
  
  -- Notification settings
  enabled           boolean DEFAULT true,
  notify_via        text[] DEFAULT ARRAY['dashboard', 'email']::text[],  -- dashboard|email|sms|whatsapp
  
  -- Escalation
  escalate_after_hours int DEFAULT 24,  -- escalate to critical if not acknowledged after X hours
  
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  created_by        uuid REFERENCES auth.users(id),
  
  CONSTRAINT unique_alert_per_client UNIQUE NULLS DISTINCT (client_id, alert_type)
);

CREATE INDEX idx_timeline_alerts_client_id ON timeline_alerts(client_id);
CREATE INDEX idx_timeline_alerts_type ON timeline_alerts(alert_type);
CREATE INDEX idx_timeline_alerts_severity ON timeline_alerts(severity);

-- ============================================================================
-- TABLE 4: timeline_alert_history
-- ============================================================================
-- History of triggered alerts (prevent duplicates, analytics)

CREATE TABLE IF NOT EXISTS timeline_alert_history (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Reference
  alert_id          uuid REFERENCES timeline_alerts(id) ON DELETE SET NULL,
  client_id         uuid REFERENCES clientes(id) ON DELETE CASCADE,
  
  -- Alert details
  alert_type        text NOT NULL,              -- denormalized for analytics
  severity          text NOT NULL,
  message           text,                       -- human-readable message
  context           jsonb,                      -- alert data (ex: current_balance, current_cpc)
  
  -- Lifecycle
  triggered_at      timestamptz DEFAULT now(),
  acknowledged_at   timestamptz,
  acknowledged_by   uuid REFERENCES auth.users(id),
  
  -- Resolution
  action_taken      text,                       -- ex: "recharged", "ignored", "escalated", "resolved"
  action_timestamp  timestamptz,
  action_metadata   jsonb,                      -- ex: { "recharge_amount": 500.0 }
  
  -- Tracking
  is_duplicate      boolean DEFAULT false,      -- was this a duplicate of recent alert?
  duplicate_of      uuid REFERENCES timeline_alert_history(id),
  
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX idx_timeline_alert_history_client_id ON timeline_alert_history(client_id);
CREATE INDEX idx_timeline_alert_history_alert_type ON timeline_alert_history(alert_type);
CREATE INDEX idx_timeline_alert_history_severity ON timeline_alert_history(severity);
CREATE INDEX idx_timeline_alert_history_triggered_at ON timeline_alert_history(triggered_at);
CREATE INDEX idx_timeline_alert_history_acknowledged_at ON timeline_alert_history(acknowledged_at);

-- ============================================================================
-- TABLE 5: timeline_step_analytics
-- ============================================================================
-- Analytics: how long each step takes, completion rates, etc.

CREATE TABLE IF NOT EXISTS timeline_step_analytics (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- References
  template_id       uuid NOT NULL REFERENCES timeline_templates(id) ON DELETE CASCADE,
  step_id           text NOT NULL,
  instance_id       uuid NOT NULL REFERENCES timeline_instances(id) ON DELETE CASCADE,
  client_id         uuid REFERENCES clientes(id) ON DELETE CASCADE,
  
  -- Timeline
  started_at        timestamptz NOT NULL,
  completed_at      timestamptz,
  duration_seconds  int,                        -- calculated
  
  -- Status
  status            text CHECK (status IN ('completed', 'abandoned', 'skipped')),
  
  -- Metadata
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX idx_timeline_step_analytics_template_id ON timeline_step_analytics(template_id);
CREATE INDEX idx_timeline_step_analytics_client_id ON timeline_step_analytics(client_id);
CREATE INDEX idx_timeline_step_analytics_completed_at ON timeline_step_analytics(completed_at);

-- ============================================================================
-- TABLE 6: timeline_audit_log
-- ============================================================================
-- Every change to timelines is logged

CREATE TABLE IF NOT EXISTS timeline_audit_log (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- What changed
  instance_id       uuid REFERENCES timeline_instances(id) ON DELETE CASCADE,
  action            text NOT NULL,              -- 'step_completed', 'step_skipped', 'awaiting_client', 'resumed'
  details           jsonb,
  
  -- Who changed it
  changed_by        uuid REFERENCES auth.users(id),
  changed_at        timestamptz DEFAULT now()
);

CREATE INDEX idx_timeline_audit_log_instance_id ON timeline_audit_log(instance_id);
CREATE INDEX idx_timeline_audit_log_changed_at ON timeline_audit_log(changed_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Mark step as completed
CREATE OR REPLACE FUNCTION mark_timeline_step_complete(
  p_instance_id uuid,
  p_step_id text,
  p_user_data jsonb
)
RETURNS jsonb AS $$
DECLARE
  v_instance record;
  v_template record;
  v_current_index int;
  v_next_step record;
  v_result jsonb;
BEGIN
  -- Get instance
  SELECT * INTO v_instance FROM timeline_instances WHERE id = p_instance_id;
  IF v_instance IS NULL THEN
    RAISE EXCEPTION 'Timeline instance not found: %', p_instance_id;
  END IF;

  -- Get template
  SELECT * INTO v_template FROM timeline_templates WHERE id = v_instance.template_id;

  -- Find current step index
  SELECT position(p_step_id IN (steps->>'id'))
  INTO v_current_index
  FROM (SELECT steps FROM jsonb_array_elements(v_template.steps) AS steps) s;

  -- Get next step
  SELECT value INTO v_next_step FROM jsonb_array_elements(v_template.steps) s(value)
  WHERE (value->>'order')::int = ((v_template.steps @> jsonb_build_array(jsonb_build_object('id', p_step_id))->0->>'order')::int) + 1
  LIMIT 1;

  -- Update instance
  UPDATE timeline_instances
  SET
    completed_steps = completed_steps || jsonb_build_array(p_step_id),
    current_step_id = CASE WHEN v_next_step IS NULL THEN NULL ELSE v_next_step->>'id' END,
    data = data || p_user_data,
    completed_at = CASE WHEN v_next_step IS NULL THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = p_instance_id
  RETURNING * INTO v_instance;

  -- Log action
  INSERT INTO timeline_audit_log (instance_id, action, changed_by, details)
  VALUES (p_instance_id, 'step_completed', auth.uid(), jsonb_build_object('step_id', p_step_id));

  -- Return updated instance
  SELECT jsonb_build_object(
    'id', v_instance.id,
    'current_step_id', v_instance.current_step_id,
    'completed_steps', v_instance.completed_steps,
    'data', v_instance.data,
    'status', CASE WHEN v_instance.completed_at IS NOT NULL THEN 'completed' ELSE v_instance.status END
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get unacknowledged alerts for escalation
CREATE OR REPLACE FUNCTION get_alerts_for_escalation()
RETURNS TABLE(id uuid, client_id uuid, alert_type text, severity text, triggered_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lah.id,
    lah.client_id,
    lah.alert_type,
    lah.severity,
    lah.triggered_at
  FROM timeline_alert_history lah
  JOIN timeline_alerts ta ON ta.id = lah.alert_id
  WHERE lah.acknowledged_at IS NULL
    AND lah.action_taken IS NULL
    AND (now() - lah.triggered_at) > (ta.escalate_after_hours || ' hours')::interval;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at on timeline_templates
CREATE OR REPLACE FUNCTION update_timeline_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_timeline_templates_updated
BEFORE UPDATE ON timeline_templates
FOR EACH ROW
EXECUTE FUNCTION update_timeline_template_timestamp();

-- Trigger: Update updated_at on timeline_instances
CREATE TRIGGER trigger_timeline_instances_updated
BEFORE UPDATE ON timeline_instances
FOR EACH ROW
EXECUTE FUNCTION update_timeline_template_timestamp();

-- Trigger: Auto-calculate duration on timeline_step_analytics
CREATE OR REPLACE FUNCTION calculate_step_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::int;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_timeline_step_analytics_duration
BEFORE INSERT OR UPDATE ON timeline_step_analytics
FOR EACH ROW
EXECUTE FUNCTION calculate_step_duration();

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

-- Enable RLS
ALTER TABLE timeline_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_step_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies: timeline_templates (public for reading, auth for writing)
CREATE POLICY "Users can view templates" ON timeline_templates
  FOR SELECT USING (true);

CREATE POLICY "Users can create templates" ON timeline_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates" ON timeline_templates
  FOR UPDATE USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = updated_by);

-- Policies: timeline_instances (users can view/edit own client's timelines)
CREATE POLICY "Users can view own timelines" ON timeline_instances
  FOR SELECT USING (
    auth.uid() = ANY(
      SELECT user_id FROM clientes WHERE id = timeline_instances.client_id
    ) OR
    client_id IS NULL  -- global timelines
  );

CREATE POLICY "Users can create timelines for their clients" ON timeline_instances
  FOR INSERT WITH CHECK (
    client_id IS NULL OR
    auth.uid() = (SELECT user_id FROM clientes WHERE id = client_id LIMIT 1)
  );

CREATE POLICY "Users can update own timelines" ON timeline_instances
  FOR UPDATE USING (
    client_id IS NULL OR
    auth.uid() = (SELECT user_id FROM clientes WHERE id = client_id LIMIT 1)
  );

-- Policies: timeline_alerts (similar to instances)
CREATE POLICY "Users can view own alerts" ON timeline_alerts
  FOR SELECT USING (
    client_id IS NULL OR
    auth.uid() = (SELECT user_id FROM clientes WHERE id = client_id LIMIT 1)
  );

CREATE POLICY "Users can manage own alerts" ON timeline_alerts
  FOR ALL USING (
    client_id IS NULL OR
    auth.uid() = (SELECT user_id FROM clientes WHERE id = client_id LIMIT 1)
  );

-- ============================================================================
-- SAMPLE DATA (Templates)
-- ============================================================================

-- Default Onboarding Template
INSERT INTO timeline_templates (
  name, type, description, scope, icon, color, steps, is_default, created_by
) VALUES (
  'Onboarding LP Pro',
  'onboarding',
  'Guia completo de implementação para novos clientes',
  'global',
  'CheckSquare',
  '#FFA500',
  '[
    {
      "id": "step_001",
      "order": 1,
      "title": "Definir nicho e público",
      "type": "info",
      "duration_days": 1,
      "content": "Converse com o cliente sobre o negócio dele.",
      "messages": [
        {
          "id": "msg_001",
          "role": "instruction",
          "text": "Qual é o nicho principal do negócio?"
        },
        {
          "id": "msg_002",
          "role": "user_action",
          "text": "Enviar no WhatsApp: #GANCHO",
          "copyable": true,
          "template_tag": "#GANCHO"
        }
      ],
      "input_fields": [
        {
          "id": "input_niche",
          "label": "Nicho identificado",
          "type": "text",
          "required": true
        }
      ]
    },
    {
      "id": "step_002",
      "order": 2,
      "title": "Registrar domínio",
      "type": "action",
      "prerequisite": "step_001",
      "duration_days": 2,
      "content": "Escolher e registrar o domínio do cliente.",
      "input_fields": [
        {
          "id": "input_domain",
          "label": "Domínio registrado",
          "type": "text",
          "placeholder": "ex: seudominio.com.br"
        }
      ]
    }
  ]'::jsonb,
  true,
  NULL
) ON CONFLICT DO NOTHING;

-- Default Recurring Task Template
INSERT INTO timeline_templates (
  name, type, description, scope, icon, color, recurrence, is_default, created_by
) VALUES (
  'Manutenção Quinzenal',
  'recurring_task',
  'Verificações e otimizações regulares',
  'global',
  'Clock',
  '#0EA5E9',
  '{
    "freq": "WEEKLY",
    "byday": ["WE"],
    "interval": 2
  }'::jsonb,
  true,
  NULL
) ON CONFLICT DO NOTHING;

-- Default Alert Template
INSERT INTO timeline_templates (
  name, type, description, scope, icon, color, is_default, created_by
) VALUES (
  'Sistema de Alertas Operacionais',
  'alert',
  'Alertas e notificações do sistema',
  'global',
  'AlertTriangle',
  '#EF4444',
  true,
  NULL
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- END OF MIGRATIONS
-- ============================================================================
