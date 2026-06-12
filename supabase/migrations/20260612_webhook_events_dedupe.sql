-- Dedupe de eventos do webhook Asaas: o Asaas reenvia eventos (retries,
-- "Reenviar" manual). Registrar o id de cada evento processado torna o
-- webhook idempotente de verdade.

CREATE TABLE IF NOT EXISTS asaas_webhook_events (
  id           TEXT PRIMARY KEY,        -- evt_... do Asaas
  event        TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sem policies: acesso apenas via service-role (edge function)
ALTER TABLE asaas_webhook_events ENABLE ROW LEVEL SECURITY;
