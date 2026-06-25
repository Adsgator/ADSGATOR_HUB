-- ─── MODELO E RACIOCÍNIO DA GATOR (configurável pela tela) ────────────────────
-- O Lucas escolhe o cérebro da IA: Flash (rápido/barato) ou Pro (mais inteligente),
-- e liga/desliga o "pensar" (thinking) do modelo. Lido pelo agente a cada chamada.

ALTER TABLE configuracoes_ia
  ADD COLUMN IF NOT EXISTS modelo   text    NOT NULL DEFAULT 'gemini-2.5-flash',
  ADD COLUMN IF NOT EXISTS thinking boolean NOT NULL DEFAULT true;
