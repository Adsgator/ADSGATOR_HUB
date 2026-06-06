-- Sync de Analytics: torna o upsert em analytics_snapshots idempotente.
--
-- A função de sync grava uma linha por (cliente, fonte, período). Sem uma
-- constraint UNIQUE, rodar o sync de novo no mesmo período duplicaria registros.
-- Esta constraint permite ON CONFLICT (...) DO UPDATE.

-- Remove duplicatas pré-existentes (se houver), mantendo a mais recente,
-- antes de criar a constraint — senão a criação falha.
DELETE FROM analytics_snapshots a
USING analytics_snapshots b
WHERE a.id < b.id
  AND a.cliente_id     = b.cliente_id
  AND a.fonte          = b.fonte
  AND a.periodo_inicio = b.periodo_inicio
  AND a.periodo_fim    = b.periodo_fim;

ALTER TABLE analytics_snapshots
  ADD CONSTRAINT analytics_snapshots_periodo_unico
  UNIQUE (cliente_id, fonte, periodo_inicio, periodo_fim);
