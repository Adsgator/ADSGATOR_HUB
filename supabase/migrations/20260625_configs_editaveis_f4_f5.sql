-- F4 + F5 — Conectar código a configs editáveis + novas configs.
-- Aplicar manualmente no SQL Editor do dashboard Supabase (supabase-migrations-manual).
--
-- Resumo:
--  F4  · limiares de inadimplência editáveis (lib/cobranca.ts passa a ler)
--      · alerta de saldo Google Ads por cliente (mínimo + liga/desliga) e fluxo
--        de disparo (estado por cliente + job de cron 09:31)
--  F5  · regras de health score editáveis (lib/health-score.ts passa a ler)
--      · lista de nichos sugeridos editável

-- ─────────────────────────────────────────────────────────────────────────────
-- F4.1 — Limiares de inadimplência (JSONB em configuracoes_financeiras)
-- Fonte única: lib/cobranca.ts. Os defaults espelham LIMIARES_ATRASO atuais
-- (atenção=1, suspensão=7, grave=15, crítico=30). Fallback no código se NULL.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE configuracoes_financeiras
  ADD COLUMN IF NOT EXISTS limiares_atraso jsonb;

COMMENT ON COLUMN configuracoes_financeiras.limiares_atraso IS
  'Limiares de dias em atraso por estágio: {atencao,suspensao,grave,critico}. NULL = usa os defaults de lib/cobranca.ts.';

-- ─────────────────────────────────────────────────────────────────────────────
-- F4.2 — Alerta de saldo Google Ads POR CLIENTE
--   saldo_minimo_alerta  : valor (R$) abaixo do qual dispara "saldo baixo".
--                          NULL = usa o mínimo global (configuracoes_*).
--   saldo_alertas_ativos : liga/desliga os alertas de saldo para este cliente
--                          (cliente pediu para parar / em cancelamento).
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS saldo_minimo_alerta  numeric,
  ADD COLUMN IF NOT EXISTS saldo_alertas_ativos boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN clientes.saldo_minimo_alerta IS
  'Saldo Google Ads (R$) abaixo do qual dispara o alerta de saldo baixo. NULL = usa o mínimo global.';
COMMENT ON COLUMN clientes.saldo_alertas_ativos IS
  'Se false, não dispara nenhum alerta/email de saldo para este cliente (a pedido / em cancelamento).';

-- ─────────────────────────────────────────────────────────────────────────────
-- F4.3 — Estado do fluxo de alerta de saldo por cliente
-- O fluxo: enquanto o saldo está abaixo do mínimo, manda "saldo baixo" 1x/dia
-- (seg–sáb). Ao 4º dia consecutivo, em vez do email ao cliente, avisa o operador
-- para ligar no WhatsApp. Se o saldo zera, manda "saldo acabou" e repete a cada
-- 3 dias até recarregar. Recarregar (saldo volta acima do mínimo) reseta tudo.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saldo_alerta_estado (
  cliente_id          uuid PRIMARY KEY REFERENCES clientes(id) ON DELETE CASCADE,
  -- 'baixo' (saldo < mínimo, > 0) | 'zerado' (saldo <= 0) | 'ok' (recarregado)
  fase                text NOT NULL DEFAULT 'ok',
  -- nº de avisos "saldo baixo" já enviados ao cliente na sequência atual (0–3)
  avisos_baixo        integer NOT NULL DEFAULT 0,
  -- já avisou o operador (4º dia) nesta sequência de saldo baixo?
  operador_avisado    boolean NOT NULL DEFAULT false,
  -- data (SP, YYYY-MM-DD) do último disparo desta sequência — idempotência diária
  ultimo_disparo_dia  date,
  -- data do último email "saldo acabou" — para repetir a cada 3 dias
  ultimo_zerado_dia   date,
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE saldo_alerta_estado ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "acesso_autenticado_saldo_alerta_estado" ON saldo_alerta_estado
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- F4.4 — Job de cron do alerta de saldo (09:31, seg–sáb) e toggle de automação
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO cron_settings (tipo, nome, descricao, ativo, horario)
VALUES ('saldo_baixo', 'Alerta de saldo Google Ads',
        'Verifica o saldo dos clientes e dispara os emails de saldo baixo/zerado (pula domingo).',
        true, '09:31:00')
ON CONFLICT (tipo) DO NOTHING;

INSERT INTO automation_settings (tipo, ativa, descricao)
VALUES ('email_saldo_ads', false,
        'Emails de saldo Google Ads (baixo/zerado) ao cliente. Dispara pelo job das 09:31 (pula domingo).')
ON CONFLICT (tipo) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- F5.1 — Regras de health score editáveis (JSONB em configuracoes_operacional)
-- Defaults espelham lib/health-score.ts (pesos 30/25/20/15/10, níveis 80/50).
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE configuracoes_operacional
  ADD COLUMN IF NOT EXISTS health_regras jsonb,
  ADD COLUMN IF NOT EXISTS nichos_sugeridos jsonb;

COMMENT ON COLUMN configuracoes_operacional.health_regras IS
  'Pesos e limiares do health score: {peso_pagamento,peso_google,peso_checklist,peso_atualizado,peso_status,nivel_saudavel,nivel_atencao}. NULL = defaults de lib/health-score.ts.';
COMMENT ON COLUMN configuracoes_operacional.nichos_sugeridos IS
  'Lista de nichos sugeridos no formulário de cliente (array de strings). NULL = lista padrão do código.';
