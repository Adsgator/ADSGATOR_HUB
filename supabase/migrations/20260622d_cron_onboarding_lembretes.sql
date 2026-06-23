-- Registra o job 'onboarding_lembretes' no dispatcher de agendamentos.
-- Varre onboardings ativos e notifica no Hub quando um cliente está parado numa
-- etapa "com o cliente" além do limite do step (lembrete_horas: 24h/72h), com a
-- mensagem de lembrete pronta. Ver lib/onboarding-lembretes.ts.
--
-- Horário 08:00 (SP): a varredura roda 1x/dia; como conta horas-paradas reais,
-- cobre os limites 24h/72h sem precisar rodar de hora em hora. Liga/desliga e
-- horário em Configurações → Automações → Agendamentos.
--
-- Aplicar manualmente no SQL Editor do dashboard Supabase.

INSERT INTO cron_settings (tipo, nome, descricao, horario) VALUES
  ('onboarding_lembretes', 'Lembretes de onboarding',
   'Avisa quando um cliente trava numa etapa do onboarding que depende dele (24h/72h), com a mensagem de lembrete pronta.',
   '08:00')
ON CONFLICT (tipo) DO NOTHING;
