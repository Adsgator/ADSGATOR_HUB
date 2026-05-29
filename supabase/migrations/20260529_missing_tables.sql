-- ─── Tabelas faltantes para erros de 400/404 ────────────────────────────────

-- 1. ALERTAS — para Edge Function processar-alertas
create table if not exists public.alertas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null,
  tipo_alerta text not null,
  mensagem text,
  disparado boolean default false,
  dispara_em timestamp with time zone,
  data_disparo timestamp with time zone,
  resolvido boolean default false,
  created_at timestamp with time zone default now()
);

create index if not exists idx_alertas_cliente_id on public.alertas(cliente_id);
create index if not exists idx_alertas_disparado on public.alertas(disparado);
create index if not exists idx_alertas_dispara_em on public.alertas(dispara_em);

-- 2. HISTORICO_ACOES — para audit log
create table if not exists public.historico_acoes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null,
  tipo_acao text not null,
  descricao text,
  valor_impactado numeric,
  usuario_id uuid,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists idx_historico_acoes_cliente_id on public.historico_acoes(cliente_id);
create index if not exists idx_historico_acoes_tipo_acao on public.historico_acoes(tipo_acao);
create index if not exists idx_historico_acoes_created_at on public.historico_acoes(created_at);

-- 3. POSTS_MARKETING — para Dashboard CentralDeComando
create table if not exists public.posts_marketing (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  cliente_id uuid,
  titulo text not null,
  conteudo text,
  plataforma text,
  status text default 'rascunho',
  data_agendada timestamp with time zone,
  url_publicada text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_posts_marketing_user_id on public.posts_marketing(user_id);
create index if not exists idx_posts_marketing_plataforma on public.posts_marketing(plataforma);
create index if not exists idx_posts_marketing_status on public.posts_marketing(status);

-- 4. MEMORIA_CLIENTES — para contexto de IA
create table if not exists public.memoria_clientes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null,
  conteudo_md text,
  versao integer default 1,
  updated_at timestamp with time zone default now()
);

create index if not exists idx_memoria_clientes_cliente_id on public.memoria_clientes(cliente_id);
