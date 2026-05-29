-- Base de conhecimento da agência
create table if not exists knowledge_base (
  id         uuid primary key default gen_random_uuid(),
  titulo     text    not null,
  conteudo   text    not null default '',
  categoria  text    not null default 'Geral',
  tags       text[]  not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table knowledge_base enable row level security;

create policy "autenticado_knowledge_base" on knowledge_base
  for all using (auth.role() = 'authenticated');

create index if not exists idx_knowledge_base_categoria on knowledge_base(categoria);
