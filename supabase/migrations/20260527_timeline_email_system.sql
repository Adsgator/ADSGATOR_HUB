-- MIGRATIONS: Timeline Cards System + Email History + Client fields
-- File: supabase/migrations/20260527_timeline_email_system.sql

-- ============================================================================
-- TABLE 1: timeline_templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS timeline_templates (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  name            text NOT NULL,
  type            text NOT NULL CHECK (type IN ('onboarding', 'recurring_task', 'alert')),
  description     text,
  scope           text NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'per_client', 'per_niche')),

  icon            text DEFAULT 'CheckSquare',
  color           text DEFAULT '#FFA500',

  steps           jsonb NOT NULL DEFAULT '[]'::jsonb,
  config          jsonb DEFAULT '{}'::jsonb,
  recurrence      jsonb,

  is_active       boolean DEFAULT true,
  is_default      boolean DEFAULT false,

  parent_template_id uuid REFERENCES timeline_templates(id) ON DELETE SET NULL,
  is_shared       boolean DEFAULT false,

  created_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  updated_by      uuid REFERENCES auth.users(id),

  CONSTRAINT template_name_unique_per_scope UNIQUE (name, scope)
);

CREATE INDEX IF NOT EXISTS idx_timeline_templates_type ON timeline_templates(type);
CREATE INDEX IF NOT EXISTS idx_timeline_templates_scope ON timeline_templates(scope);
CREATE INDEX IF NOT EXISTS idx_timeline_templates_is_default ON timeline_templates(is_default);

-- ============================================================================
-- TABLE 2: timeline_instances
-- ============================================================================
-- NOTE: Constraint valid_instance removed — recurring tasks CAN have client_id

CREATE TABLE IF NOT EXISTS timeline_instances (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  template_id       uuid NOT NULL REFERENCES timeline_templates(id) ON DELETE CASCADE,

  type              text NOT NULL CHECK (type IN ('onboarding', 'recurring_task', 'alert')),
  client_id         uuid REFERENCES clientes(id) ON DELETE CASCADE,
  niche             text,

  status            text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),

  current_step_id   text,
  completed_steps   jsonb DEFAULT '[]'::jsonb,
  pending_steps     jsonb DEFAULT '[]'::jsonb,
  skipped_steps     jsonb DEFAULT '[]'::jsonb,

  data              jsonb DEFAULT '{}'::jsonb,

  recurrence_rule   text,
  last_run_at       timestamptz,
  next_run_at       timestamptz,
  run_count         int DEFAULT 0,

  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  completed_at      timestamptz,
  paused_at         timestamptz
);

CREATE INDEX IF NOT EXISTS idx_timeline_instances_template_id ON timeline_instances(template_id);
CREATE INDEX IF NOT EXISTS idx_timeline_instances_client_id ON timeline_instances(client_id);
CREATE INDEX IF NOT EXISTS idx_timeline_instances_status ON timeline_instances(status);
CREATE INDEX IF NOT EXISTS idx_timeline_instances_next_run_at ON timeline_instances(next_run_at)
  WHERE type = 'recurring_task' AND status = 'active';

-- ============================================================================
-- TABLE 3: timeline_alerts
-- ============================================================================
-- NOTE: UNIQUE NULLS DISTINCT replaced with partial unique indexes

CREATE TABLE IF NOT EXISTS timeline_alerts (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  client_id         uuid REFERENCES clientes(id) ON DELETE CASCADE,

  alert_type        text NOT NULL,
  severity          text DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),

  threshold_config  jsonb,

  enabled           boolean DEFAULT true,
  notify_via        text[] DEFAULT ARRAY['dashboard', 'email']::text[],

  escalate_after_hours int DEFAULT 24,

  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  created_by        uuid REFERENCES auth.users(id)
);

-- Partial unique indexes to replace UNIQUE NULLS DISTINCT
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_alert_per_client
  ON timeline_alerts(client_id, alert_type)
  WHERE client_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_alert_global
  ON timeline_alerts(alert_type)
  WHERE client_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_timeline_alerts_client_id ON timeline_alerts(client_id);
CREATE INDEX IF NOT EXISTS idx_timeline_alerts_type ON timeline_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_timeline_alerts_severity ON timeline_alerts(severity);

-- ============================================================================
-- TABLE 4: timeline_alert_history
-- ============================================================================

CREATE TABLE IF NOT EXISTS timeline_alert_history (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  alert_id          uuid REFERENCES timeline_alerts(id) ON DELETE SET NULL,
  client_id         uuid REFERENCES clientes(id) ON DELETE CASCADE,

  alert_type        text NOT NULL,
  severity          text NOT NULL,
  message           text,
  context           jsonb,

  triggered_at      timestamptz DEFAULT now(),
  acknowledged_at   timestamptz,
  acknowledged_by   uuid REFERENCES auth.users(id),

  action_taken      text,
  action_timestamp  timestamptz,
  action_metadata   jsonb,

  is_duplicate      boolean DEFAULT false,
  duplicate_of      uuid REFERENCES timeline_alert_history(id),

  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeline_alert_history_client_id ON timeline_alert_history(client_id);
CREATE INDEX IF NOT EXISTS idx_timeline_alert_history_alert_type ON timeline_alert_history(alert_type);
CREATE INDEX IF NOT EXISTS idx_timeline_alert_history_severity ON timeline_alert_history(severity);
CREATE INDEX IF NOT EXISTS idx_timeline_alert_history_triggered_at ON timeline_alert_history(triggered_at);
CREATE INDEX IF NOT EXISTS idx_timeline_alert_history_acknowledged_at ON timeline_alert_history(acknowledged_at);

-- ============================================================================
-- TABLE 5: timeline_step_analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS timeline_step_analytics (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  template_id       uuid NOT NULL REFERENCES timeline_templates(id) ON DELETE CASCADE,
  step_id           text NOT NULL,
  instance_id       uuid NOT NULL REFERENCES timeline_instances(id) ON DELETE CASCADE,
  client_id         uuid REFERENCES clientes(id) ON DELETE CASCADE,

  started_at        timestamptz NOT NULL,
  completed_at      timestamptz,
  duration_seconds  int,

  status            text CHECK (status IN ('completed', 'abandoned', 'skipped')),

  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeline_step_analytics_template_id ON timeline_step_analytics(template_id);
CREATE INDEX IF NOT EXISTS idx_timeline_step_analytics_client_id ON timeline_step_analytics(client_id);
CREATE INDEX IF NOT EXISTS idx_timeline_step_analytics_completed_at ON timeline_step_analytics(completed_at);

-- ============================================================================
-- TABLE 6: timeline_audit_log
-- ============================================================================

CREATE TABLE IF NOT EXISTS timeline_audit_log (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  instance_id       uuid REFERENCES timeline_instances(id) ON DELETE CASCADE,
  action            text NOT NULL,
  details           jsonb,

  changed_by        uuid REFERENCES auth.users(id),
  changed_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeline_audit_log_instance_id ON timeline_audit_log(instance_id);
CREATE INDEX IF NOT EXISTS idx_timeline_audit_log_changed_at ON timeline_audit_log(changed_at);

-- ============================================================================
-- TABLE 7: email_history
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_history (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  user_id       uuid NOT NULL REFERENCES auth.users(id),
  cliente_id    uuid REFERENCES clientes(id) ON DELETE SET NULL,

  template_id   text NOT NULL,
  destinatario  text NOT NULL,
  assunto       text NOT NULL,

  status        text DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced', 'pending')),
  resend_id     text,

  metadata      jsonb DEFAULT '{}'::jsonb,

  enviado_em    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_history_user_id ON email_history(user_id);
CREATE INDEX IF NOT EXISTS idx_email_history_cliente_id ON email_history(cliente_id);
CREATE INDEX IF NOT EXISTS idx_email_history_enviado_em ON email_history(enviado_em DESC);

-- ============================================================================
-- ADD COLUMNS TO clientes (if not exists)
-- ============================================================================

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS email_relatorio text,
  ADD COLUMN IF NOT EXISTS auto_envio_relatorio boolean DEFAULT false;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_timeline_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_timeline_templates_updated ON timeline_templates;
CREATE TRIGGER trigger_timeline_templates_updated
BEFORE UPDATE ON timeline_templates
FOR EACH ROW EXECUTE FUNCTION update_timeline_timestamp();

DROP TRIGGER IF EXISTS trigger_timeline_instances_updated ON timeline_instances;
CREATE TRIGGER trigger_timeline_instances_updated
BEFORE UPDATE ON timeline_instances
FOR EACH ROW EXECUTE FUNCTION update_timeline_timestamp();

CREATE OR REPLACE FUNCTION calculate_step_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::int;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_timeline_step_analytics_duration ON timeline_step_analytics;
CREATE TRIGGER trigger_timeline_step_analytics_duration
BEFORE INSERT OR UPDATE ON timeline_step_analytics
FOR EACH ROW EXECUTE FUNCTION calculate_step_duration();

-- Function for escalation checks (used by sentinela edge function)
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

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE timeline_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_step_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;

-- timeline_templates: readable by all authenticated, writable by creator
DROP POLICY IF EXISTS "Users can view templates" ON timeline_templates;
CREATE POLICY "Users can view templates" ON timeline_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create templates" ON timeline_templates;
CREATE POLICY "Users can create templates" ON timeline_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own templates" ON timeline_templates;
CREATE POLICY "Users can update own templates" ON timeline_templates
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete own templates" ON timeline_templates;
CREATE POLICY "Users can delete own templates" ON timeline_templates
  FOR DELETE USING (auth.uid() = created_by);

-- timeline_instances: scoped to client owner or global
DROP POLICY IF EXISTS "Users can view own timelines" ON timeline_instances;
CREATE POLICY "Users can view own timelines" ON timeline_instances
  FOR SELECT USING (
    client_id IS NULL OR
    auth.uid() = (SELECT user_id FROM clientes WHERE id = client_id LIMIT 1)
  );

DROP POLICY IF EXISTS "Users can create timelines" ON timeline_instances;
CREATE POLICY "Users can create timelines" ON timeline_instances
  FOR INSERT WITH CHECK (
    client_id IS NULL OR
    auth.uid() = (SELECT user_id FROM clientes WHERE id = client_id LIMIT 1)
  );

DROP POLICY IF EXISTS "Users can update own timelines" ON timeline_instances;
CREATE POLICY "Users can update own timelines" ON timeline_instances
  FOR UPDATE USING (
    client_id IS NULL OR
    auth.uid() = (SELECT user_id FROM clientes WHERE id = client_id LIMIT 1)
  );

-- timeline_alerts: scoped to client owner or global
DROP POLICY IF EXISTS "Users can view own alerts" ON timeline_alerts;
CREATE POLICY "Users can view own alerts" ON timeline_alerts
  FOR SELECT USING (
    client_id IS NULL OR
    auth.uid() = (SELECT user_id FROM clientes WHERE id = client_id LIMIT 1)
  );

DROP POLICY IF EXISTS "Users can manage own alerts" ON timeline_alerts;
CREATE POLICY "Users can manage own alerts" ON timeline_alerts
  FOR ALL USING (
    client_id IS NULL OR
    auth.uid() = (SELECT user_id FROM clientes WHERE id = client_id LIMIT 1)
  );

-- timeline_alert_history: scoped to client owner
DROP POLICY IF EXISTS "Users can view own alert history" ON timeline_alert_history;
CREATE POLICY "Users can view own alert history" ON timeline_alert_history
  FOR SELECT USING (
    client_id IS NULL OR
    auth.uid() = (SELECT user_id FROM clientes WHERE id = client_id LIMIT 1)
  );

DROP POLICY IF EXISTS "Users can insert alert history" ON timeline_alert_history;
CREATE POLICY "Users can insert alert history" ON timeline_alert_history
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update alert history" ON timeline_alert_history;
CREATE POLICY "Users can update alert history" ON timeline_alert_history
  FOR UPDATE USING (
    client_id IS NULL OR
    auth.uid() = (SELECT user_id FROM clientes WHERE id = client_id LIMIT 1)
  );

-- timeline_step_analytics: scoped to client owner
DROP POLICY IF EXISTS "Users can view own step analytics" ON timeline_step_analytics;
CREATE POLICY "Users can view own step analytics" ON timeline_step_analytics
  FOR SELECT USING (
    client_id IS NULL OR
    auth.uid() = (SELECT user_id FROM clientes WHERE id = client_id LIMIT 1)
  );

DROP POLICY IF EXISTS "Users can insert step analytics" ON timeline_step_analytics;
CREATE POLICY "Users can insert step analytics" ON timeline_step_analytics
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- timeline_audit_log: readable by authenticated users
DROP POLICY IF EXISTS "Users can view audit log" ON timeline_audit_log;
CREATE POLICY "Users can view audit log" ON timeline_audit_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert audit log" ON timeline_audit_log;
CREATE POLICY "Users can insert audit log" ON timeline_audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- email_history: scoped by user_id
DROP POLICY IF EXISTS "Users can view own email history" ON email_history;
CREATE POLICY "Users can view own email history" ON email_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own email history" ON email_history;
CREATE POLICY "Users can insert own email history" ON email_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

INSERT INTO timeline_templates (
  name, type, description, scope, icon, color, steps, is_default, created_by
) VALUES (
  'Onboarding LP Pro',
  'onboarding',
  'Guia completo de implementação para novos clientes',
  'global',
  'CheckSquare',
  '#FFB100',
  '[
    {
      "id": "step_001",
      "order": 1,
      "title": "Definir nicho e público",
      "type": "info",
      "duration_days": 1,
      "messages": [
        {
          "id": "msg_001",
          "role": "instruction",
          "text": "Qual é o nicho principal do negócio? Converse com o cliente para entender o público-alvo."
        },
        {
          "id": "msg_002",
          "role": "user_action",
          "text": "Enviar no WhatsApp para o cliente: Me conta mais sobre seu negócio — qual o produto/serviço principal e quem é seu cliente ideal?",
          "copyable": true
        }
      ],
      "input_fields": [
        {
          "id": "input_niche",
          "label": "Nicho identificado",
          "type": "text",
          "required": true,
          "placeholder": "ex: Adestramento Canino"
        }
      ]
    },
    {
      "id": "step_002",
      "order": 2,
      "title": "Registrar domínio e acessos",
      "type": "action",
      "prerequisite": "step_001",
      "duration_days": 2,
      "messages": [
        {
          "id": "msg_003",
          "role": "instruction",
          "text": "Registrar o domínio e configurar os acessos necessários."
        }
      ],
      "input_fields": [
        {
          "id": "input_domain",
          "label": "Domínio registrado",
          "type": "text",
          "placeholder": "ex: seudominio.com.br"
        },
        {
          "id": "input_google_ads_id",
          "label": "Google Ads Customer ID",
          "type": "text",
          "placeholder": "xxx-xxx-xxxx"
        }
      ]
    },
    {
      "id": "step_003",
      "order": 3,
      "title": "Criar conta Google Ads",
      "type": "action",
      "prerequisite": "step_002",
      "duration_days": 1,
      "messages": [
        {
          "id": "msg_004",
          "role": "instruction",
          "text": "Criar a conta Google Ads vinculada ao MCC da agência."
        },
        {
          "id": "msg_005",
          "role": "user_action",
          "text": "Template de email de boas-vindas para o cliente após criação da conta:",
          "copyable": true
        },
        {
          "id": "msg_006",
          "role": "template",
          "text": "Olá [NOME]! Sua conta Google Ads foi criada com sucesso. Em breve entraremos em contato para os próximos passos. Qualquer dúvida, estamos à disposição!",
          "copyable": true
        }
      ]
    }
  ]'::jsonb,
  true,
  NULL
) ON CONFLICT ON CONSTRAINT template_name_unique_per_scope DO NOTHING;

INSERT INTO timeline_templates (
  name, type, description, scope, icon, color, recurrence, steps, is_default, created_by
) VALUES (
  'Manutenção Quinzenal',
  'recurring_task',
  'Verificações e otimizações regulares a cada 2 semanas',
  'global',
  'Clock',
  '#0EA5E9',
  '{"freq": "WEEKLY", "byday": ["WE"], "interval": 2}'::jsonb,
  '[
    {
      "id": "step_r01",
      "order": 1,
      "title": "Verificar saldo Google Ads",
      "type": "check",
      "messages": [
        {
          "id": "msg_r01",
          "role": "instruction",
          "text": "Verificar saldo atual de todas as contas. Alertar clientes com saldo abaixo de R$300."
        }
      ]
    },
    {
      "id": "step_r02",
      "order": 2,
      "title": "Revisar palavras-chave negativas",
      "type": "action",
      "messages": [
        {
          "id": "msg_r02",
          "role": "instruction",
          "text": "Analisar termos de pesquisa e adicionar negativos desnecessários."
        }
      ]
    },
    {
      "id": "step_r03",
      "order": 3,
      "title": "Ajustar lances por performance",
      "type": "action",
      "messages": [
        {
          "id": "msg_r03",
          "role": "instruction",
          "text": "Revisar CPC médio e ajustar lances das palavras-chave com CPA acima da meta."
        }
      ]
    }
  ]'::jsonb,
  true,
  NULL
) ON CONFLICT ON CONSTRAINT template_name_unique_per_scope DO NOTHING;

-- ============================================================================
-- END OF MIGRATIONS
-- ============================================================================
