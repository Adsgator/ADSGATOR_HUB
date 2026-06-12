-- Agendamentos configuráveis pela UI.
--
-- cron_settings: horário (America/Sao_Paulo) e liga/desliga de cada job
-- automático. O dispatcher (/api/v1/cron/dispatch, Vercel Cron */30min) lê
-- esta tabela e executa cada job na primeira janela após o horário
-- configurado, no máximo 1x por dia (ultimo_run). Sem a tabela aplicada,
-- o dispatcher faz fallback para o comportamento antigo (roda tudo).

CREATE TABLE IF NOT EXISTS cron_settings (
  tipo        text PRIMARY KEY,          -- 'analytics_sync' | 'briefing' | 'asaas_import' | 'alertas' | 'cobranca'
  nome        text NOT NULL,
  descricao   text,
  ativo       boolean NOT NULL DEFAULT true,
  horario     time NOT NULL,             -- horário desejado em America/Sao_Paulo
  ultimo_run  timestamptz,
  updated_at  timestamptz DEFAULT now()
);

-- RLS: operador único — qualquer usuário autenticado (padrão da tarefa_templates).
ALTER TABLE cron_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users read cron_settings" ON cron_settings;
CREATE POLICY "Auth users read cron_settings" ON cron_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users insert cron_settings" ON cron_settings;
CREATE POLICY "Auth users insert cron_settings" ON cron_settings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users update cron_settings" ON cron_settings;
CREATE POLICY "Auth users update cron_settings" ON cron_settings
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users delete cron_settings" ON cron_settings;
CREATE POLICY "Auth users delete cron_settings" ON cron_settings
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Seed: horários SP equivalentes aos crons antigos do vercel.json (UTC-3).
-- Ponto de partida — o operador ajusta pela UI (Configurações → Automações).
INSERT INTO cron_settings (tipo, nome, descricao, horario) VALUES
  ('analytics_sync', 'Sync de Analytics',   'Sincroniza snapshots de Google Ads + GA4 dos clientes com integração habilitada.',          '03:00'),
  ('briefing',       'Morning Briefing',    'Gera e salva o briefing do dia no dashboard, com notificação quando pronto.',               '03:30'),
  ('asaas_import',   'Import do Asaas',     'Importa clientes e assinaturas novos do Asaas, mantendo o Hub espelhado.',                  '04:00'),
  ('alertas',        'Alertas por email',   'Envia resumo de alertas críticos pendentes ao operador (requer toggle de automação).',     '05:00'),
  ('cobranca',       'Régua de cobrança',   'Sincroniza dias de atraso com o Asaas e dispara emails da régua (D+7/D+15/D+30).',         '06:00')
ON CONFLICT (tipo) DO NOTHING;
