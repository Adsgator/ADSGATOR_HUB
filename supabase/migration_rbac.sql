-- ──────────────────────────────────────────────────────────────
-- FASE 15: RBAC — Controle de Acesso por Papéis
-- ──────────────────────────────────────────────────────────────


CREATE TABLE IF NOT EXISTS equipe_membros (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agencia_id TEXT NOT NULL DEFAULT 'adsgator-main',
  papel      TEXT NOT NULL DEFAULT 'analista'
             CHECK (papel IN ('proprietario', 'gerenciador', 'analista', 'viewer')),
  nome       TEXT,
  email      TEXT,
  ativo      BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, agencia_id)
);

CREATE INDEX IF NOT EXISTS idx_equipe_membros_user    ON equipe_membros(user_id);
CREATE INDEX IF NOT EXISTS idx_equipe_membros_agencia ON equipe_membros(agencia_id);

ALTER TABLE equipe_membros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_equipe" ON equipe_membros;
CREATE POLICY "owner_equipe" ON equipe_membros
  FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM equipe_membros em
      WHERE em.user_id = auth.uid()
        AND em.papel IN ('proprietario', 'gerenciador')
        AND em.agencia_id = equipe_membros.agencia_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM equipe_membros em
      WHERE em.user_id = auth.uid()
        AND em.papel = 'proprietario'
        AND em.agencia_id = equipe_membros.agencia_id
    )
  );

DROP TRIGGER IF EXISTS update_equipe_membros_updated_at ON equipe_membros;
CREATE TRIGGER update_equipe_membros_updated_at
  BEFORE UPDATE ON equipe_membros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Tabela briefings_diarios para Morning Briefing (Fase 11)
CREATE TABLE IF NOT EXISTS briefings_diarios (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  data       DATE NOT NULL UNIQUE,
  texto      TEXT NOT NULL,
  gerado_em  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_briefings_data ON briefings_diarios(data DESC);

ALTER TABLE briefings_diarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_briefings" ON briefings_diarios;
CREATE POLICY "auth_briefings" ON briefings_diarios FOR SELECT USING (auth.role() = 'authenticated');
