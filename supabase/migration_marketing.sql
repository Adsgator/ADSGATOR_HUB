-- ──────────────────────────────────────────────────────────────
-- FASE 10: Tabela posts_agendados
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS posts_agendados (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id    UUID REFERENCES clientes(id) ON DELETE SET NULL,
  rede          TEXT NOT NULL CHECK (rede IN ('instagram', 'facebook')),
  tipo          TEXT NOT NULL CHECK (tipo IN ('foto', 'video', 'carrossel', 'reels')),
  texto         TEXT,
  midia_url     TEXT,
  hashtags      TEXT[],
  status        TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'agendado', 'publicado', 'falhou')),
  agendado_para TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_agendados_user    ON posts_agendados(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_agendados_data    ON posts_agendados(agendado_para);
CREATE INDEX IF NOT EXISTS idx_posts_agendados_cliente ON posts_agendados(cliente_id);

ALTER TABLE posts_agendados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_posts" ON posts_agendados;
CREATE POLICY "owner_posts" ON posts_agendados
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_posts_agendados_updated_at
  BEFORE UPDATE ON posts_agendados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
