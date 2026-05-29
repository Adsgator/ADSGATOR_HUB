-- Metas da agência
create table if not exists metas (
  id           uuid primary key default gen_random_uuid(),
  titulo       text    not null,
  descricao    text,
  tipo         text    not null default 'mrr',  -- mrr, clientes, conversoes, lucro
  valor_alvo   numeric not null,
  valor_atual  numeric not null default 0,
  periodo      text    not null default 'mensal',  -- mensal, trimestral, anual
  data_inicio  date    not null default current_date,
  data_fim     date,
  ativa        boolean not null default true,
  created_at   timestamptz default now()
);

-- Views salvas (filtros de listas)
create table if not exists saved_views (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  modulo      text    not null,  -- clientes, tarefas, financeiro
  nome        text    not null,
  filtros     jsonb   not null default '{}',
  is_default  boolean not null default false,
  created_at  timestamptz default now()
);

alter table metas        enable row level security;
alter table saved_views  enable row level security;

create policy "autenticado_metas"       on metas        for all using (auth.role() = 'authenticated');
create policy "proprio_saved_views"     on saved_views  for all using (auth.uid() = user_id);

create index if not exists idx_saved_views_user_modulo on saved_views(user_id, modulo);
