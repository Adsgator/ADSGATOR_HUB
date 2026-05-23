-- ════════════════════════════════════════════════════════════════
-- ADSGATOR — MIGRATION: Tarefas, Memória, Configurações e Complementos
-- Execute no Supabase SQL Editor APÓS migration_sistema_final.sql
-- ════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- TABELA: tarefas
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tarefas (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cliente_id     UUID REFERENCES clientes(id) ON DELETE SET NULL,
  titulo         TEXT NOT NULL,
  descricao      TEXT,
  prioridade     TEXT DEFAULT 'normal' CHECK (prioridade IN ('critico', 'alto', 'normal', 'baixo')),
  status         TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_progresso', 'feito', 'adiado')),
  data_prazo     TIMESTAMP WITH TIME ZONE,
  responsavel_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  checklist      JSONB,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: memoria_clientes
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memoria_clientes (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id  UUID REFERENCES clientes(id) ON DELETE CASCADE UNIQUE NOT NULL,
  conteudo_md TEXT NOT NULL DEFAULT '',
  versao      INTEGER DEFAULT 1,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: configuracoes_usuario
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS configuracoes_usuario (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  preferencias JSONB DEFAULT '{}',
  notif_config JSONB DEFAULT '{}',
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: api_keys (Phase 19.12 — API pública para parceiros)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome       TEXT NOT NULL,
  chave_hash TEXT NOT NULL UNIQUE,
  ativo      BOOLEAN DEFAULT true,
  ultimo_uso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- ALTERAR: clientes — adicionar status 'inativo' (Phase 19.4 — D+90)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE clientes
  DROP CONSTRAINT IF EXISTS clientes_status_check;

ALTER TABLE clientes
  ADD CONSTRAINT clientes_status_check CHECK (status IN (
    'recebido', 'onboarding', 'setup_trafego',
    'ativo', 'congelado', 'cancelado_debito', 'cancelado', 'inativo'
  ));

-- ──────────────────────────────────────────────────────────────
-- ALTERAR: configuracoes_financeiras — campos imposto (Phase 19.5)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE configuracoes_financeiras
  ADD COLUMN IF NOT EXISTS tipo_tributacao    TEXT DEFAULT 'MEI',
  ADD COLUMN IF NOT EXISTS imposto_percentual DECIMAL(5,2) DEFAULT 11.0;

-- ──────────────────────────────────────────────────────────────
-- ALTERAR: analytics_snapshots — campo cpc_medio (Phase 19.6)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE analytics_snapshots
  ADD COLUMN IF NOT EXISTS cpc_medio DECIMAL(10,4);

-- ──────────────────────────────────────────────────────────────
-- ÍNDICES
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tarefas_user_id    ON tarefas(user_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_cliente_id ON tarefas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status     ON tarefas(status, data_prazo);
CREATE INDEX IF NOT EXISTS idx_memoria_cliente    ON memoria_clientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id   ON api_keys(user_id);

-- ──────────────────────────────────────────────────────────────
-- TRIGGERS updated_at
-- (reusa a função update_updated_at() criada em migration_sistema_final.sql)
-- ──────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_tarefas_updated_at ON tarefas;
CREATE TRIGGER trg_tarefas_updated_at
  BEFORE UPDATE ON tarefas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_config_usuario_updated_at ON configuracoes_usuario;
CREATE TRIGGER trg_config_usuario_updated_at
  BEFORE UPDATE ON configuracoes_usuario
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────────
ALTER TABLE tarefas               ENABLE ROW LEVEL SECURITY;
ALTER TABLE memoria_clientes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys              ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_tarefas"        ON tarefas;
DROP POLICY IF EXISTS "owner_memoria"        ON memoria_clientes;
DROP POLICY IF EXISTS "owner_config_usuario" ON configuracoes_usuario;
DROP POLICY IF EXISTS "owner_api_keys"       ON api_keys;

CREATE POLICY "owner_tarefas"
  ON tarefas
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner_memoria"
  ON memoria_clientes
  USING (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));

CREATE POLICY "owner_config_usuario"
  ON configuracoes_usuario
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner_api_keys"
  ON api_keys
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
