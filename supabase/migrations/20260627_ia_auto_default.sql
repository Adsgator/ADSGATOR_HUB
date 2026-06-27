-- ─── CÉREBRO "AUTO" VIRA O PADRÃO ─────────────────────────────────────────────
-- O modo Auto (Flash no dia a dia + sobe pro Pro sozinho quando precisa) passa a
-- ser o cérebro padrão da Gator.
--
--   1) novas linhas nascem em 'auto';
--   2) quem está no antigo default 'gemini-2.5-flash' (que era o default da coluna,
--      NÃO uma escolha consciente) migra para 'auto'. Quem escolheu Pro de propósito
--      fica no Pro; quem quiser Flash puro de novo é só reselecionar no chat.
--
-- Idempotente — seguro rodar múltiplas vezes.

ALTER TABLE configuracoes_ia ALTER COLUMN modelo SET DEFAULT 'auto';

UPDATE configuracoes_ia SET modelo = 'auto' WHERE modelo = 'gemini-2.5-flash';
