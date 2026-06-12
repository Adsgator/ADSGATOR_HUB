-- Briefings persistidos — o Morning Briefing passa a ser DB-first:
-- o cron das 06:30 (/api/v1/briefing/run) gera e salva o briefing do dia;
-- o dashboard carrega instantâneo do banco; "Atualizar" regenera (upsert).

create table if not exists public.briefings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  data       date not null,
  filtro     text not null default 'completo',   -- completo | urgencias | resumido
  texto      text not null,
  fonte      text not null default 'ia',         -- ia | fallback
  gerado_em  timestamptz not null default now()
);

-- 1 briefing por dia/filtro/usuário — regenerar faz upsert
create unique index if not exists uq_briefings_user_data_filtro
  on public.briefings(user_id, data, filtro);

-- ── RLS owner-scoped (mesmo padrão da 20260613_ia_agente) ────────────────────
alter table public.briefings enable row level security;

drop policy if exists "owner_briefings" on public.briefings;
create policy "owner_briefings" on public.briefings
  for all to authenticated
  using  (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
