-- ─── RACIOCÍNIO (THINKING) DESLIGADO POR PADRÃO ──────────────────────────────
-- Decisão: o "pensar" começa OFF; o Lucas liga quando precisa (mais barato/rápido
-- no dia a dia). A migration anterior criou a coluna com DEFAULT true — corrige o
-- default e zera os registros que herdaram true (ninguém ligou de propósito ainda,
-- o toggle acabou de existir).

ALTER TABLE configuracoes_ia ALTER COLUMN thinking SET DEFAULT false;
UPDATE configuracoes_ia SET thinking = false WHERE thinking IS TRUE;
