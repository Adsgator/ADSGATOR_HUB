-- Analytics 2.0 (F6) — limite mensal de mídia POR PLANO (decisão do Lucas:
-- o teto de verba é do plano, não do cliente). Alimenta o medidor de verba
-- no portal do cliente: plano do cliente (assinatura ativa → planos_servico
-- pelo nome) × gasto Google Ads do mês. Nulo = plano sem teto (sem medidor).

alter table public.planos_servico
  add column if not exists limite_midia_mensal numeric;
