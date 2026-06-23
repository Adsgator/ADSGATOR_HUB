-- Novo template de email: "Saldo Google Ads Acabou" (saldo zerado).
--
-- O alerta de saldo baixo (alert-saldo-baixo) cobre o saldo "acabando"; este
-- cobre o saldo já zerado, com texto e selo próprios. A base vive em
-- src/lib/email.ts (EMAIL_TEMPLATES['alert-saldo-zerado']); aqui só registramos
-- a linha para o template aparecer e ser editável em Configurações → Templates.

INSERT INTO email_templates (id, nome, descricao) VALUES
  ('alert-saldo-zerado', 'Alerta: Saldo Google Ads Zerado', 'Saldo da conta Google Ads chegou a zero — anúncios pausados pelo Google.')
ON CONFLICT (id) DO NOTHING;
