-- ════════════════════════════════════════════════════════════════
-- ADSGATOR — MIGRATION: SISTEMA FINAL COMPLETO
-- Execute no Supabase SQL Editor (Dashboard → SQL Editor)
-- ════════════════════════════════════════════════════════════════

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- MIGRAR tabela clientes: adicionar colunas do novo schema
-- ──────────────────────────────────────────────────────────────
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS mrr             DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS plano           TEXT,
  ADD COLUMN IF NOT EXISTS asaas_id        TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS dias_atraso     INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS data_vencimento DATE,
  ADD COLUMN IF NOT EXISTS google_ads_id   TEXT,
  ADD COLUMN IF NOT EXISTS saldo_google    DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS congelado_em    TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS alerta_48h_em   TIMESTAMP WITH TIME ZONE;

-- Atualizar CHECK de status para incluir cancelado_debito
ALTER TABLE clientes
  DROP CONSTRAINT IF EXISTS clientes_status_check;

ALTER TABLE clientes
  ADD CONSTRAINT clientes_status_check CHECK (status IN (
    'recebido', 'onboarding', 'setup_trafego',
    'ativo', 'congelado', 'cancelado_debito', 'cancelado'
  ));

-- ──────────────────────────────────────────────────────────────
-- TABELA: estagios (novo schema — substitui estagios_operacionais)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS estagios (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id      UUID REFERENCES clientes(id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,
  descricao       TEXT,
  acao_label      TEXT,
  acao_url        TEXT,
  checklist       JSONB,
  ativo           BOOLEAN DEFAULT true,
  concluido_em    TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: financeiro_lancamentos
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS financeiro_lancamentos (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id       UUID REFERENCES clientes(id) ON DELETE SET NULL,
  tipo             TEXT NOT NULL CHECK (tipo IN ('receita', 'custo_fixo', 'custo_variavel')),
  categoria        TEXT,
  descricao        TEXT NOT NULL,
  valor            DECIMAL(10,2) NOT NULL,
  data             DATE NOT NULL,
  asaas_payment_id TEXT UNIQUE,
  status           TEXT DEFAULT 'confirmado' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: analytics_snapshots
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id      UUID REFERENCES clientes(id) ON DELETE CASCADE,
  fonte           TEXT NOT NULL CHECK (fonte IN ('google_ads', 'ga4')),
  periodo_inicio  DATE NOT NULL,
  periodo_fim     DATE NOT NULL,
  investimento    DECIMAL(10,2),
  impressoes      INTEGER,
  cliques         INTEGER,
  ctr             DECIMAL(5,4),
  conversoes      DECIMAL(10,2),
  cpa             DECIMAL(10,2),
  roas            DECIMAL(10,4),
  usuarios        INTEGER,
  sessoes         INTEGER,
  taxa_conversao  DECIMAL(5,4),
  insight_ia      TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: audit_logs
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id),
  acao         TEXT NOT NULL,
  tabela       TEXT,
  registro_id  UUID,
  dados_antes  JSONB,
  dados_depois JSONB,
  descricao    TEXT,
  ip_address   INET,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: notificacoes
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notificacoes (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id   UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo         TEXT NOT NULL CHECK (tipo IN ('urgente', 'atencao', 'info', 'sucesso')),
  titulo       TEXT NOT NULL,
  mensagem     TEXT,
  acao_label   TEXT,
  acao_url     TEXT,
  lida         BOOLEAN DEFAULT false,
  lida_em      TIMESTAMP WITH TIME ZONE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: relatorios
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS relatorios (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id  UUID REFERENCES clientes(id) ON DELETE SET NULL,
  tipo        TEXT NOT NULL,
  titulo      TEXT NOT NULL,
  conteudo_md TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: componentes_biblioteca
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS componentes_biblioteca (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria    TEXT NOT NULL,
  nome         TEXT NOT NULL,
  descricao    TEXT,
  preview_url  TEXT,
  codigo_astro TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- ÍNDICES
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_clientes_status        ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id       ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_dias_atraso   ON clientes(dias_atraso);
CREATE INDEX IF NOT EXISTS idx_estagios_cliente_id    ON estagios(cliente_id);
CREATE INDEX IF NOT EXISTS idx_estagios_ativo         ON estagios(ativo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_lida ON notificacoes(user_id, lida);
CREATE INDEX IF NOT EXISTS idx_audit_logs_registro    ON audit_logs(registro_id);
CREATE INDEX IF NOT EXISTS idx_analytics_cliente_data ON analytics_snapshots(cliente_id, periodo_fim);
CREATE INDEX IF NOT EXISTS idx_financeiro_data        ON financeiro_lancamentos(data);

-- ──────────────────────────────────────────────────────────────
-- TRIGGERS
-- ──────────────────────────────────────────────────────────────

-- updated_at automático em clientes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clientes_updated_at ON clientes;
CREATE TRIGGER trg_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Audit log automático em clientes
CREATE OR REPLACE FUNCTION log_cliente_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, acao, tabela, registro_id, dados_antes, dados_depois, descricao)
  VALUES (
    auth.uid(),
    CASE TG_OP
      WHEN 'INSERT' THEN 'criou_cliente'
      WHEN 'UPDATE' THEN 'alterou_cliente'
      WHEN 'DELETE' THEN 'deletou_cliente'
    END,
    'clientes',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'Cliente criado: ' || NEW.nome
      WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status
        THEN 'Status alterado de ' || OLD.status || ' para ' || NEW.status
      ELSE 'Cliente atualizado: ' || NEW.nome
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_clientes ON clientes;
CREATE TRIGGER trg_audit_clientes
  AFTER INSERT OR UPDATE OR DELETE ON clientes
  FOR EACH ROW EXECUTE FUNCTION log_cliente_change();

-- Alerta 48h quando congelado
CREATE OR REPLACE FUNCTION set_alerta_congelamento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'congelado' AND OLD.status != 'congelado' THEN
    NEW.congelado_em   = NOW();
    NEW.alerta_48h_em  = NOW() + INTERVAL '48 hours';
  END IF;
  IF NEW.status != 'congelado' AND OLD.status = 'congelado' THEN
    NEW.congelado_em   = NULL;
    NEW.alerta_48h_em  = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_congelamento ON clientes;
CREATE TRIGGER trg_congelamento
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION set_alerta_congelamento();

-- Notificação automática quando novo cliente chega
CREATE OR REPLACE FUNCTION notificar_novo_cliente()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL THEN
    INSERT INTO notificacoes (user_id, cliente_id, tipo, titulo, mensagem, acao_label, acao_url)
    VALUES (
      NEW.user_id,
      NEW.id,
      'urgente',
      'Novo cliente recebido!',
      NEW.nome || ' (' || COALESCE(NEW.nicho, 'sem nicho') || ') aguarda ação imediata.',
      'Enviar #BOASVINDAS',
      'https://wa.me/' || COALESCE(NEW.whatsapp, '') || '?text=Ol%C3%A1%21%20Seja%20bem-vindo(a)%20%C3%A0%20Adsgator%21%20%F0%9F%8E%89'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notificar_novo_cliente ON clientes;
CREATE TRIGGER trg_notificar_novo_cliente
  AFTER INSERT ON clientes
  FOR EACH ROW EXECUTE FUNCTION notificar_novo_cliente();

-- ──────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────────
ALTER TABLE estagios               ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios             ENABLE ROW LEVEL SECURITY;
ALTER TABLE componentes_biblioteca ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_lancamentos"       ON financeiro_lancamentos;
DROP POLICY IF EXISTS "owner_notificacoes"      ON notificacoes;
DROP POLICY IF EXISTS "owner_relatorios"        ON relatorios;
DROP POLICY IF EXISTS "owner_biblioteca"        ON componentes_biblioteca;
DROP POLICY IF EXISTS "owner_audit"             ON audit_logs;
DROP POLICY IF EXISTS "owner_estagios"          ON estagios;
DROP POLICY IF EXISTS "owner_analytics"         ON analytics_snapshots;

CREATE POLICY "owner_lancamentos"       ON financeiro_lancamentos  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "owner_notificacoes"      ON notificacoes            USING (user_id = auth.uid());
CREATE POLICY "owner_relatorios"        ON relatorios              USING (user_id = auth.uid());
CREATE POLICY "owner_biblioteca"        ON componentes_biblioteca  USING (user_id = auth.uid());
CREATE POLICY "owner_audit"             ON audit_logs              USING (user_id = auth.uid());
CREATE POLICY "owner_estagios"          ON estagios                USING (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));
CREATE POLICY "owner_analytics"         ON analytics_snapshots     USING (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));

-- View MRR (somente leitura)
CREATE OR REPLACE VIEW mrr_atual AS
SELECT
  user_id,
  SUM(valor) as mrr,
  COUNT(DISTINCT cliente_id) as clientes_pagantes,
  AVG(valor) as ticket_medio
FROM financeiro_lancamentos
WHERE
  tipo = 'receita'
  AND status = 'confirmado'
  AND data >= date_trunc('month', CURRENT_DATE)
  AND data < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY user_id;
