-- ─── CONFIGURAÇÃO DO PAINEL DE USO DA IA ──────────────────────────────────────
-- Limite mensal de gasto estimado (BRL) por usuário. null/desligado = sem alerta.
-- Quando o gasto do mês ultrapassa o teto pela 1ª vez, registrarUso gera 1
-- notificação in-app (idempotência via ia_limite_avisado_mes = 'YYYY-MM').

CREATE TABLE configuracoes_ia (
  user_id               uuid PRIMARY KEY REFERENCES auth.users(id),
  limite_mensal_brl     numeric(10,2),            -- null = desligado
  limite_ativo          boolean NOT NULL DEFAULT false,
  limite_avisado_mes    text,                     -- 'YYYY-MM' do último aviso disparado
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE configuracoes_ia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ia config select" ON configuracoes_ia FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "own ia config upsert" ON configuracoes_ia FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own ia config update" ON configuracoes_ia FOR UPDATE
  USING (auth.uid() = user_id);
-- O cron/registrarUso escreve `limite_avisado_mes` via service-role (ignora RLS).
