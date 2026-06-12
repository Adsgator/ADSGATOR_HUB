-- Templates de tarefa/processo + templates de email customizados.
--
-- tarefa_templates: processos reutilizáveis (checklist como array JSON de
-- strings). Templates com `slug` são "de sistema" — usados pelo provisionamento
-- automático de cliente (lib/cliente-provisioning.ts e Edge Function
-- webhook-asaas): editáveis pela UI, não deletáveis pela API.
--
-- email_templates.custom: além de editar os 12 templates fixos do código,
-- o usuário pode CRIAR templates (id = 'custom-<slug>', custom = true,
-- conteúdo integral em subject_override/html_override — sem base no código).

-- ── Templates de tarefa ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tarefa_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE,                      -- preenchido só em templates de sistema
  nome        text NOT NULL,
  titulo      text NOT NULL,                    -- suporta {cliente} como variável
  descricao   text,
  prioridade  text NOT NULL DEFAULT 'normal',   -- baixo | normal | alto | critico
  prazo_dias  int,                              -- prazo relativo (D+N) ao criar a tarefa
  checklist   jsonb NOT NULL DEFAULT '[]',      -- array de strings (itens do processo)
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- RLS: operador único — qualquer usuário autenticado (padrão da email_templates).
ALTER TABLE tarefa_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users read tarefa_templates" ON tarefa_templates;
CREATE POLICY "Auth users read tarefa_templates" ON tarefa_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users insert tarefa_templates" ON tarefa_templates;
CREATE POLICY "Auth users insert tarefa_templates" ON tarefa_templates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users update tarefa_templates" ON tarefa_templates;
CREATE POLICY "Auth users update tarefa_templates" ON tarefa_templates
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users delete tarefa_templates" ON tarefa_templates;
CREATE POLICY "Auth users delete tarefa_templates" ON tarefa_templates
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Seed dos templates de sistema (editáveis depois pela UI; o conteúdo aqui é
-- só o ponto de partida — por isso ON CONFLICT DO NOTHING).
INSERT INTO tarefa_templates (slug, nome, titulo, descricao, prioridade, prazo_dias, checklist) VALUES
  (
    'setup-cliente',
    'Setup do cliente',
    'Setup do cliente — {cliente}',
    'Provisionamento técnico de cliente novo: conectar integrações Google, saldo e contexto. Criada automaticamente quando um cliente entra (form, importador ou webhook Asaas).',
    'alto',
    5,
    '["Preencher Google Ads customer ID no cliente", "Preencher GA4 property ID no cliente", "Habilitar toggles google_ads_enabled / ga4_enabled", "Registrar saldo Google Ads inicial", "Criar/gerar memória .md do cliente", "Conferir plano e MRR cadastrados"]'::jsonb
  ),
  (
    'onboarding-cliente',
    'Onboarding de cliente',
    'Onboarding — {cliente}',
    'Processo comercial/operacional de boas-vindas de um cliente novo.',
    'alto',
    7,
    '["Enviar mensagem de boas-vindas", "Coletar briefing do cliente", "Agendar reunião de alinhamento", "Configurar Google Ads / GA4", "Criar primeiras campanhas"]'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

-- ── Templates de email customizados ──────────────────────────────────────────
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS custom boolean DEFAULT false;

DROP POLICY IF EXISTS "Auth users insert templates" ON email_templates;
CREATE POLICY "Auth users insert templates" ON email_templates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users delete templates" ON email_templates;
CREATE POLICY "Auth users delete templates" ON email_templates
  FOR DELETE USING (auth.uid() IS NOT NULL);
