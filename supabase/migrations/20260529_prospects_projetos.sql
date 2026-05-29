-- ── Prospects (leads pré-venda) ──────────────────────────────────────────────
create table if not exists prospects (
  id           uuid primary key default gen_random_uuid(),
  nome         text    not null,
  telefone     text,
  email        text,
  nicho        text,
  cidade       text,
  origem       text    default 'indicacao',  -- indicacao, inbound, outbound, ads
  estagio      text    not null default 'prospeccao',
  valor_proposta numeric,
  observacoes  text,
  responsavel_id uuid references auth.users(id),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── Projetos web (sites de clientes) ─────────────────────────────────────────
create table if not exists projetos_web (
  id           uuid primary key default gen_random_uuid(),
  cliente_id   uuid not null references clientes(id) on delete cascade,
  nome         text not null,
  url          text,
  plataforma   text default 'astro',  -- astro, wordpress, webflow, outro
  status       text default 'ativo',  -- ativo, pausado, encerrado
  data_entrega date,
  observacoes  text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- RLS
alter table prospects     enable row level security;
alter table projetos_web  enable row level security;

create policy "autenticado_prospects"    on prospects    for all using (auth.role() = 'authenticated');
create policy "autenticado_projetos_web" on projetos_web for all using (auth.role() = 'authenticated');

-- Indexes
create index if not exists idx_prospects_estagio    on prospects(estagio);
create index if not exists idx_projetos_web_cliente on projetos_web(cliente_id);
