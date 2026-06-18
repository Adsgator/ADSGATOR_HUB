-- Job automático: arquivar clientes congelados há muito tempo.
--
-- Regra: cliente 'congelado' há mais de N dias (default 60, configurável em
-- Configurações → Automações) vira 'inativo' + motivo 'congelamento_expirado'.
-- Roda no dispatcher diário (mesma mecânica dos demais jobs).
--
-- Depende de 20260615_cron_settings.sql (tabela cron_settings).

-- Parâmetro inteiro genérico por job (ex.: dias para arquivar congelado).
-- Mantém o ajuste na mesma linha que a UI de Agendamentos já edita.
ALTER TABLE cron_settings ADD COLUMN IF NOT EXISTS param_int integer;

COMMENT ON COLUMN cron_settings.param_int IS
  'Parâmetro inteiro do job, quando aplicável. arquivar_congelados: dias de congelamento até virar inativo.';

INSERT INTO cron_settings (tipo, nome, descricao, horario, param_int) VALUES
  ('arquivar_congelados',
   'Arquivar congelados',
   'Move clientes congelados há mais de N dias para inativo (arquivo), mantendo o histórico. Ajuste N abaixo.',
   '02:00',
   60)
ON CONFLICT (tipo) DO NOTHING;
