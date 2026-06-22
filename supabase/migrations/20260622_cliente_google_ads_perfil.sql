-- Link do perfil Google Ads do cliente (ex.: a URL da conta do cliente que
-- Lucas guarda para acesso rápido). Faz parte da régua de completude do cliente
-- (lib/cliente-completude.ts) — sem ele, o bloco "Integrações Google" não conta
-- como completo.
--
-- Aplicar manualmente no SQL Editor do dashboard Supabase (fluxo do projeto).

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS google_ads_perfil_url text;

COMMENT ON COLUMN clientes.google_ads_perfil_url IS
  'URL do perfil/conta Google Ads do cliente (acesso rápido). Parte da régua de completude.';
