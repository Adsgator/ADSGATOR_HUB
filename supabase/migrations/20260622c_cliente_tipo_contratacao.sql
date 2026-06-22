-- Tipo de contratação do cliente: define qual caminho de onboarding roda
-- (combo = LP + tráfego | trafego = só tráfego | lp = só landing page).
--
-- Hoje Lucas escolhe na mão ao iniciar o onboarding; futuramente o checkout
-- próprio da Adsgator enviará esse valor direto ao Hub (ver memory
-- asaas-integration / checkout-first). Preparar o campo agora evita refação.
--
-- Aplicar manualmente no SQL Editor do dashboard Supabase.

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS tipo_contratacao text
  CHECK (tipo_contratacao IN ('combo', 'trafego', 'lp'));

COMMENT ON COLUMN clientes.tipo_contratacao IS
  'Tipo de contratação (combo|trafego|lp) — seleciona o template de onboarding. Origem futura: checkout próprio.';
