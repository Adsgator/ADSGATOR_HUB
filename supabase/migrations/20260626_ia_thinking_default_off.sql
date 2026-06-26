-- ─── CÉREBRO DA GATOR: garante colunas + raciocínio OFF por padrão ───────────
-- Self-sufficient e idempotente: a 20260625f (que adicionava modelo/thinking)
-- pode NÃO ter sido aplicada — então esta migration cria as colunas se faltarem
-- e fixa o raciocínio DESLIGADO por padrão (o Lucas liga quando precisa).
-- Pode rodar com segurança em qualquer estado do banco.

ALTER TABLE configuracoes_ia
  ADD COLUMN IF NOT EXISTS modelo   text    NOT NULL DEFAULT 'gemini-2.5-flash',
  ADD COLUMN IF NOT EXISTS thinking boolean NOT NULL DEFAULT false;

ALTER TABLE configuracoes_ia ALTER COLUMN thinking SET DEFAULT false;
UPDATE configuracoes_ia SET thinking = false WHERE thinking IS TRUE;
