-- Configurações operacionais da agência
create table if not exists configuracoes_operacional (
  agencia_id                  text primary key default 'adsgator-main',
  sla_onboarding_dias         integer not null default 7,
  sla_setup_trafego_dias      integer not null default 14,
  sla_ativo_dias              integer not null default 30,
  horario_inicio              text    not null default '08:00',
  horario_fim                 text    not null default '18:00',
  alerta_inadimplencia_dias   integer not null default 3,
  alerta_saldo_ads_minimo     numeric not null default 50,
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);

-- Row com defaults para a agência principal
insert into configuracoes_operacional (agencia_id)
values ('adsgator-main')
on conflict (agencia_id) do nothing;

-- Planos de serviço oferecidos pela agência
create table if not exists planos_servico (
  id         uuid primary key default gen_random_uuid(),
  nome       text    not null,
  valor      numeric not null default 0,
  cor        text    not null default '#FFB100',
  features   jsonb   not null default '[]',
  ativo      boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: apenas usuários autenticados da agência
alter table configuracoes_operacional enable row level security;
alter table planos_servico enable row level security;

create policy "autenticado_operacional" on configuracoes_operacional
  for all using (auth.role() = 'authenticated');

create policy "autenticado_planos" on planos_servico
  for all using (auth.role() = 'authenticated');
