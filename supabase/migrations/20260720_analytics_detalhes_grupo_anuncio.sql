-- Dashboard Ads (rebuild) — cache de analytics_detalhes ganha o filtro de
-- Grupo de Anúncios como coluna própria da chave (senão um corte filtrado por
-- grupo colidiria no cache com o mesmo corte sem filtro ou filtrado só por
-- campanha). Encontra o nome real da constraint unique existente (evita
-- assumir o nome auto-gerado pelo Postgres) e recria incluindo a nova coluna.

alter table public.analytics_detalhes
  add column if not exists grupo_anuncio_id text not null default '';

do $$
declare
  nome_constraint text;
begin
  select tc.constraint_name into nome_constraint
  from information_schema.table_constraints tc
  where tc.table_schema = 'public'
    and tc.table_name = 'analytics_detalhes'
    and tc.constraint_type = 'UNIQUE';
  if nome_constraint is not null then
    execute format('alter table public.analytics_detalhes drop constraint %I', nome_constraint);
  end if;
end $$;

alter table public.analytics_detalhes
  add constraint analytics_detalhes_chave_unica
  unique (cliente_id, fonte, dimensao, periodo_inicio, periodo_fim, campanha_id, grupo_anuncio_id);
