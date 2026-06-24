-- F2 + F3 — Novos templates de email (onboarding + relatório semanal) e os
-- toggles de automação correspondentes.
--
-- Bases em src/lib/email.ts (EMAIL_TEMPLATES). Aqui só registramos as linhas
-- para os templates aparecerem e serem editáveis em Configurações → Emails, e
-- ligamos os toggles de automação (começam DESATIVADOS).

INSERT INTO email_templates (id, nome, descricao) VALUES
  ('report-weekly-kpi',              'Relatório Semanal (KPIs)',        'Resumo curto semanal das campanhas, com comparação à semana anterior.'),
  ('onboarding-briefing-recebido',  'Onboarding: Briefing recebido',   'Confirma o recebimento do briefing e dos materiais do cliente.'),
  ('onboarding-pagina-pronta',      'Onboarding: Página pronta',       'Avisa que a página/landing está pronta para revisão.'),
  ('onboarding-acessos-google',     'Onboarding: Acessos Google',      'Pede os acessos do Google Ads e Google Meu Negócio.')
ON CONFLICT (id) DO NOTHING;

-- Toggles de automação (automation_settings). Começam desativados.
INSERT INTO automation_settings (tipo, ativa, descricao) VALUES
  ('email_onboarding',      false, 'Emails automáticos durante o onboarding (briefing recebido, página pronta, acessos Google).'),
  ('email_relatorio_semanal', false, 'Envia o resumo semanal das campanhas ao cliente.')
ON CONFLICT (tipo) DO NOTHING;

-- Job do dispatcher para o relatório semanal (cron_settings). Roda 1x/semana,
-- no dia_semana configurado (0=domingo..6=sábado; padrão segunda). A coluna
-- dia_semana é adicionada aqui (NULL = job diário, comportamento atual).
ALTER TABLE cron_settings ADD COLUMN IF NOT EXISTS dia_semana smallint;

INSERT INTO cron_settings (tipo, nome, descricao, ativo, horario, dia_semana) VALUES
  ('relatorio_semanal', 'Relatório semanal', 'Envia o resumo semanal das campanhas aos clientes.', false, '08:00:00', 1)
ON CONFLICT (tipo) DO NOTHING;
