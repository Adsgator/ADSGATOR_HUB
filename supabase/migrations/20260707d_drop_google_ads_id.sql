-- Remove a coluna legada clientes.google_ads_id — duplicada de
-- google_ads_customer_id (migration antiga). Verificado em 07/07/2026:
-- zero linhas com valor e nenhuma referência no código.

alter table public.clientes drop column if exists google_ads_id;
