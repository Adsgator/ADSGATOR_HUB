-- ─── CUSTO POR MENSAGEM DA GATOR ──────────────────────────────────────────────
-- Custo estimado (BRL) da resposta do agente, gravado por mensagem para o chip
-- discreto no balão do chat — visível também ao reabrir conversas antigas.
-- A fonte de verdade do uso continua em ia_uso; aqui é só o reflexo por mensagem.

ALTER TABLE ia_mensagens ADD COLUMN IF NOT EXISTS custo_brl numeric(12,6);
