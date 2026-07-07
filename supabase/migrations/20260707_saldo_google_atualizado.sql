-- Carimbo de quando clientes.saldo_google foi atualizado pela última vez
-- (sync automático via account_budget ou edição manual em Integrações).
-- Sem isso o card AlertaSaldoGoogle não tem como mostrar a idade do dado.

alter table public.clientes
  add column if not exists saldo_google_atualizado_em timestamptz;

comment on column public.clientes.saldo_google_atualizado_em is
  'Última atualização do saldo_google (sync diário ou manual). Null = nunca atualizado.';
