-- F1.5 — Rede de segurança dos emails: modo teste + log mais robusto.
--
-- 1) email_config: singleton com a flag de MODO TESTE. Quando ativo, todo email
--    automático é redirecionado para email_teste (ou env ALERT_EMAIL) e o assunto
--    ganha o prefixo [TESTE]. Rede de segurança para a virada de produção.
-- 2) email_logs: cliente_id passa a aceitar NULL (alertas ao operador não têm
--    cliente) e ganha a coluna modo_teste para distinguir os envios de teste.

CREATE TABLE IF NOT EXISTS email_config (
  id          boolean PRIMARY KEY DEFAULT true,   -- singleton: sempre 1 linha (id=true)
  modo_teste  boolean NOT NULL DEFAULT true,      -- começa LIGADO: segurança na virada
  email_teste text,                               -- destino do teste; NULL = usa env ALERT_EMAIL
  atualizado_em  timestamptz DEFAULT now(),
  atualizado_por uuid REFERENCES auth.users(id),
  CONSTRAINT email_config_singleton CHECK (id = true)
);

INSERT INTO email_config (id, modo_teste) VALUES (true, true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE email_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users read email_config" ON email_config;
CREATE POLICY "Auth users read email_config" ON email_config
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users update email_config" ON email_config;
CREATE POLICY "Auth users update email_config" ON email_config
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- email_logs: cliente_id nullable (logs sem cliente, ex.: alerta ao operador).
ALTER TABLE email_logs ALTER COLUMN cliente_id DROP NOT NULL;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS modo_teste boolean NOT NULL DEFAULT false;
