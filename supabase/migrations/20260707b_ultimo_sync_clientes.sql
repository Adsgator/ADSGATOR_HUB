-- Status da última sincronização de analytics por cliente — visibilidade
-- permanente de falha (antes o resultado morria no JSON da rota de sync).
-- Gravado por sincronizarCliente (lib/analytics-sync.ts); exibido em
-- /analytics e no card de Integrações do cliente.

alter table public.clientes
  add column if not exists ultimo_sync_at timestamptz,
  add column if not exists ultimo_sync_status text,
  add column if not exists ultimo_sync_erro text;

comment on column public.clientes.ultimo_sync_status is
  'Resultado do último sync de analytics: ok | parcial | erro. Null = nunca sincronizou.';
comment on column public.clientes.ultimo_sync_erro is
  'Mensagem do erro do último sync (null quando ok).';
