-- JÁ APLICADA em produção via CLI em 12/06/2026 (registro para histórico).
--
-- A tabela clientes nasceu com data_criacao/data_atualizacao, mas um trigger
-- (update_updated_at) e várias queries usam created_at/updated_at — updates
-- em clientes falhavam com 42703 e a descoberta de owner retornava null
-- (clientes nasciam com user_id nulo, invisíveis pelo RLS).

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
