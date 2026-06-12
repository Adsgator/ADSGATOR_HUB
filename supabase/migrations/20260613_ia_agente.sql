-- Migration: IA Agente — conversas persistentes, mensagens e memória de longo prazo
-- O assistente deixa de ser stateless: cada conversa vira uma sessão salva,
-- e a IA acumula memória própria (fatos que o operador ensina) entre sessões.
-- Idempotente — seguro rodar múltiplas vezes.

-- ── Conversas (sessões de chat) ───────────────────────────────────────────────
create table if not exists public.ia_conversas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  titulo     text not null default 'Nova conversa',
  cliente_id uuid references clientes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ia_conversas_user on public.ia_conversas(user_id, updated_at desc);

-- ── Mensagens ─────────────────────────────────────────────────────────────────
-- anexos:      [{ tipo: 'imagem'|'texto', nome, mimeType?, dataBase64?, conteudo? }]
-- ferramentas: [{ nome, resumo }] — ações que o agente executou nesta resposta
create table if not exists public.ia_mensagens (
  id          uuid primary key default gen_random_uuid(),
  conversa_id uuid not null references ia_conversas(id) on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null default '',
  anexos      jsonb,
  ferramentas jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_ia_mensagens_conversa on public.ia_mensagens(conversa_id, created_at);

-- ── Memória de longo prazo do agente ─────────────────────────────────────────
-- Fatos que o operador ensina ("lembre que o cliente X prefere reunião às 9h").
-- Injetada inteira no system prompt de toda conversa.
create table if not exists public.ia_memoria (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  conteudo   text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ia_memoria_user on public.ia_memoria(user_id, created_at);

-- ── RLS owner-scoped (mesmo padrão da 20260610_rls_owner_scoped) ─────────────
alter table public.ia_conversas enable row level security;
alter table public.ia_mensagens enable row level security;
alter table public.ia_memoria   enable row level security;

drop policy if exists "owner_ia_conversas" on public.ia_conversas;
create policy "owner_ia_conversas" on public.ia_conversas
  for all to authenticated
  using  (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "owner_ia_mensagens" on public.ia_mensagens;
create policy "owner_ia_mensagens" on public.ia_mensagens
  for all to authenticated
  using  (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "owner_ia_memoria" on public.ia_memoria;
create policy "owner_ia_memoria" on public.ia_memoria
  for all to authenticated
  using  (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
