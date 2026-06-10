-- Formaliza a coluna portal_token que existia apenas via dashboard.
-- Lida exclusivamente server-side com service role — sem policy anon necessária.
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS portal_token text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_portal_token
  ON clientes(portal_token) WHERE portal_token IS NOT NULL;

COMMENT ON COLUMN clientes.portal_token IS
  'Token público do portal do cliente. Lido apenas server-side com service role — sem policy anon.';
