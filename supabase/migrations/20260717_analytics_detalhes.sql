-- Analytics 2.0 (F3) — cache dos cortes detalhados (Ads + GA4).
-- O Looker consultava a API do Google a cada visualização e vivia dando
-- "erro de cota"; aqui a UI lê deste cache e a rota
-- GET /api/analytics/[id]/detalhes renova on-demand quando o TTL vence
-- (~6h para período recente, 7 dias para período encerrado).
-- payload = resultado pronto da camada de dados (lib/ads-detalhes.ts /
-- lib/ga4-detalhes.ts); campanha_id = filtro de campanha do Ads ('' = sem filtro).

create table if not exists public.analytics_detalhes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users(id),
  cliente_id     uuid not null references public.clientes(id) on delete cascade,
  fonte          text not null check (fonte in ('ads', 'ga4')),
  dimensao       text not null,
  periodo_inicio date not null,
  periodo_fim    date not null,
  campanha_id    text not null default '',
  payload        jsonb not null,
  atualizado_em  timestamptz not null default now(),
  unique (cliente_id, fonte, dimensao, periodo_inicio, periodo_fim, campanha_id)
);

create index if not exists idx_analytics_detalhes_cliente
  on public.analytics_detalhes(cliente_id, fonte, dimensao);

-- RLS owner-scoped (mesmo padrão de 20260610_rls_owner_scoped.sql)
alter table public.analytics_detalhes enable row level security;

drop policy if exists "owner_analytics_detalhes" on public.analytics_detalhes;
create policy "owner_analytics_detalhes" on public.analytics_detalhes
  for all to authenticated
  using  (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
