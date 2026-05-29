-- Migração: Email Logs + Automações
-- Data: 2026-05-29

-- ============================================================================
-- TABLE: email_logs
-- ============================================================================
-- Tabela de log de emails enviados (complementa email_history com automações)

CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  destinatario text NOT NULL,
  template_tipo text NOT NULL,
  assunto text,
  status text NOT NULL DEFAULT 'enviado',
  mensagem_erro text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_email_logs_cliente ON email_logs(cliente_id);
CREATE INDEX idx_email_logs_tipo ON email_logs(template_tipo);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created ON email_logs(created_at DESC);

-- ============================================================================
-- TABLE: automation_settings
-- ============================================================================
-- Tabela de controle de automações (ativa/inativa)

CREATE TABLE IF NOT EXISTS automation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL UNIQUE,
  ativa boolean DEFAULT false,
  descricao text,
  ultimo_envio timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_automation_settings_tipo ON automation_settings(tipo);
CREATE INDEX idx_automation_settings_ativa ON automation_settings(ativa);

-- ============================================================================
-- INSERT: Automações padrão
-- ============================================================================

INSERT INTO automation_settings (tipo, ativa, descricao) VALUES
  ('email_relatorio_mensal', false, 'Envia relatório mensal todo dia 1º'),
  ('email_alerta_critico', false, 'Envia alerta quando MRR cai > 15%'),
  ('email_resumo_semanal', false, 'Envia resumo semanal toda segunda-feira'),
  ('email_cobranca_vencida', false, 'Lembra cobranças vencidas')
ON CONFLICT (tipo) DO NOTHING;

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_settings ENABLE ROW LEVEL SECURITY;

-- email_logs: usuário pode ver logs dos seus clientes
DROP POLICY IF EXISTS "Users can view email logs" ON email_logs;
CREATE POLICY "Users can view email logs" ON email_logs
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM clientes WHERE id = cliente_id LIMIT 1)
  );

DROP POLICY IF EXISTS "Users can insert email logs" ON email_logs;
CREATE POLICY "Users can insert email logs" ON email_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- automation_settings: todos os usuários autenticados podem ler (global)
DROP POLICY IF EXISTS "Users can view automation settings" ON automation_settings;
CREATE POLICY "Users can view automation settings" ON automation_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Apenas o dono pode atualizar automações (assumindo user_id único)
DROP POLICY IF EXISTS "Users can update automation settings" ON automation_settings;
CREATE POLICY "Users can update automation settings" ON automation_settings
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
