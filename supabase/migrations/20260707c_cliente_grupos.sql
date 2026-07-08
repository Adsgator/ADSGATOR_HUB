-- Grupos de cliente — 1 cliente real com vários CNPJs (caso Paulo Alexandre).
-- Decisão de design: AGRUPAR, não fundir. Cada CNPJ mantém registro próprio
-- (cobrança Asaas, IDs Google e saldo são por CNPJ); o grupo consolida a visão
-- (MRR somado, status por CNPJ, métricas agregadas).

create table if not exists public.cliente_grupos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id),
  nome       text not null,
  observacao text,
  created_at timestamptz not null default now()
);

alter table public.clientes
  add column if not exists grupo_id uuid references public.cliente_grupos(id) on delete set null;

create index if not exists idx_clientes_grupo on public.clientes(grupo_id) where grupo_id is not null;

-- RLS owner-scoped (mesmo padrão de 20260610_rls_owner_scoped.sql)
alter table public.cliente_grupos enable row level security;

drop policy if exists "owner_cliente_grupos" on public.cliente_grupos;
create policy "owner_cliente_grupos" on public.cliente_grupos
  for all to authenticated
  using  (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
