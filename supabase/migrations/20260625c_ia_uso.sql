-- ─── OBSERVABILIDADE DA IA (uso, custo e comportamento da Gator) ──────────────
-- Captura 1 linha por chamada ao Vertex (ou 1 por mensagem no caso do agente,
-- que acumula as iterações do loop). Sustenta as 8 visões do painel de Uso da IA:
-- custo (mês/dia, por conversa, contexto, alerta) + analytics de comportamento
-- (por tipo de uso, ferramentas, tendência, conversas destaque).

CREATE TABLE ia_uso (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id),     -- null = uso da agência
  contexto        text NOT NULL,                        -- agente|chat|hashtags|briefing|copy|relatorio
  modelo          text NOT NULL,
  conversa_id     uuid,                                 -- só para contexto 'agente'
  tokens_entrada  integer NOT NULL DEFAULT 0,
  tokens_saida    integer NOT NULL DEFAULT 0,
  tokens_cache    integer NOT NULL DEFAULT 0,           -- cachedContentTokenCount (v1: tratado como entrada no custo)
  custo_brl       numeric(12,6) NOT NULL DEFAULT 0,     -- 6 casas: chamadas baratas custam frações de centavo
  -- sinais de analytics de comportamento (baratos: já passam pelo registrarUso)
  duracao_ms      integer,                              -- latência da chamada (tendência/picos)
  iteracoes       integer,                              -- nº de passos do loop agêntico (só 'agente')
  ferramentas     text[],                               -- nomes das ferramentas chamadas (só 'agente')
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ia_uso_user_data ON ia_uso (user_id, created_at DESC);  -- resumo/tendência por user
CREATE INDEX idx_ia_uso_conversa  ON ia_uso (conversa_id) WHERE conversa_id IS NOT NULL;  -- custo por conversa

-- RLS owner-scoped (operador único lê o seu; linhas null user_id visíveis a autenticados).
-- Writes só via service-role (cron/rotas) — sem policy de insert para cliente.
ALTER TABLE ia_uso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own usage" ON ia_uso FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);
