-- ============================================================
-- ADSGATOR HUB — SCHEMA COMPLETO v2
-- Execute na ordem abaixo para garantir integridade referencial
-- ============================================================

-- ============================================================
-- TABELA: CLIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                  TEXT NOT NULL,
  email                 TEXT UNIQUE NOT NULL,
  whatsapp              TEXT NOT NULL,
  dominio               TEXT,
  nicho                 TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'recebido'
                        CHECK (status IN (
                          'recebido','onboarding','setup_trafego',
                          'ativo','congelado','cancelado'
                        )),
  -- Credenciais de integração (preenchidas durante o onboarding)
  google_ads_customer_id TEXT,
  ga4_property_id        TEXT,
  -- Metadados opcionais
  cor_tema              TEXT DEFAULT '#10b981',
  notas_internas        TEXT,
  metadata              JSONB DEFAULT '{}'::jsonb,
  data_criacao          TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_status  ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_nicho   ON clientes(nicho);
CREATE INDEX IF NOT EXISTS idx_clientes_email   ON clientes(email);

-- ============================================================
-- TABELA: ASSINATURAS
-- ============================================================
CREATE TABLE IF NOT EXISTS assinaturas (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id              UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  plano_nome              TEXT NOT NULL,
  valor_mensal            NUMERIC(10,2) NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'ativa'
                          CHECK (status IN (
                            'ativa','atraso_7_dias','atraso_15_dias','cancelado_debito'
                          )),
  data_inicio             TIMESTAMPTZ DEFAULT NOW(),
  data_proxima_cobranca   TIMESTAMPTZ,
  asaas_subscription_id   TEXT UNIQUE,
  dias_atraso             INTEGER NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assinaturas_cliente ON assinaturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status  ON assinaturas(status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_atraso  ON assinaturas(dias_atraso) WHERE dias_atraso > 0;

-- ============================================================
-- TABELA: ESTAGIOS OPERACIONAIS
-- Representa o estado atual de cada cliente no fluxo da agência
-- ============================================================
CREATE TABLE IF NOT EXISTS estagios_operacionais (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id       UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  estagio          TEXT NOT NULL,
  acao_proxima     TEXT,
  pendente_cliente BOOLEAN NOT NULL DEFAULT FALSE,
  data_entrada     TIMESTAMPTZ DEFAULT NOW(),
  data_saida       TIMESTAMPTZ,     -- NULL = estágio ativo
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estagios_cliente     ON estagios_operacionais(cliente_id);
CREATE INDEX IF NOT EXISTS idx_estagios_estagio     ON estagios_operacionais(estagio);
CREATE INDEX IF NOT EXISTS idx_estagios_data_saida  ON estagios_operacionais(data_saida) WHERE data_saida IS NULL;

-- ============================================================
-- TABELA: HISTORICO DE ACOES (auditoria imutável)
-- Nenhum registro é deletado. Apenas INSERT.
-- ============================================================
CREATE TABLE IF NOT EXISTS historico_acoes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id       UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_acao        TEXT NOT NULL,
  descricao        TEXT NOT NULL,
  valor_impactado  NUMERIC(10,2),
  usuario_id       UUID,   -- auth.uid() quando disponível
  data_acao        TIMESTAMPTZ DEFAULT NOW(),
  metadata         JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_historico_cliente ON historico_acoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_historico_data    ON historico_acoes(data_acao DESC);
CREATE INDEX IF NOT EXISTS idx_historico_tipo    ON historico_acoes(tipo_acao);

-- ============================================================
-- TABELA: CONFIGURACOES FINANCEIRAS DA AGENCIA
-- ============================================================
CREATE TABLE IF NOT EXISTS configuracoes_financeiras (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agencia_id                      TEXT NOT NULL UNIQUE DEFAULT 'adsgator-main',
  custos_fixos_mensais            NUMERIC(10,2) NOT NULL DEFAULT 0,
  custos_variaveis_percentual     NUMERIC(5,2)  NOT NULL DEFAULT 0,
  margem_lucro_minima             NUMERIC(5,2)  NOT NULL DEFAULT 30,
  saldo_google_ads_limite_alerta  NUMERIC(10,2) NOT NULL DEFAULT 50,
  updated_at                      TIMESTAMPTZ DEFAULT NOW()
);

-- Garante que existe exatamente 1 linha de config
INSERT INTO configuracoes_financeiras (agencia_id)
VALUES ('adsgator-main')
ON CONFLICT (agencia_id) DO NOTHING;

-- ============================================================
-- TABELA: CUSTOS DETALHADOS
-- Itemização dos custos fixos e variáveis
-- ============================================================
CREATE TABLE IF NOT EXISTS custos_detalhados (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         TEXT NOT NULL,
  valor        NUMERIC(10,2) NOT NULL,
  tipo         TEXT NOT NULL CHECK (tipo IN ('fixo','variavel')),
  descricao    TEXT,
  ativo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custos_tipo  ON custos_detalhados(tipo);
CREATE INDEX IF NOT EXISTS idx_custos_ativo ON custos_detalhados(ativo) WHERE ativo = TRUE;

-- ============================================================
-- TABELA: CAMPANHAS GOOGLE ADS
-- ============================================================
CREATE TABLE IF NOT EXISTS campanhas_ads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id        UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  campanha_nome     TEXT NOT NULL,
  google_ads_id     TEXT,
  status            TEXT NOT NULL DEFAULT 'ativa'
                    CHECK (status IN ('ativa','pausada','finalizada')),
  investimento_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  cliques           INTEGER NOT NULL DEFAULT 0,
  conversoes        NUMERIC(10,2) NOT NULL DEFAULT 0,
  cpa               NUMERIC(10,2) NOT NULL DEFAULT 0,
  ctr               NUMERIC(5,2)  NOT NULL DEFAULT 0,
  impressoes        INTEGER NOT NULL DEFAULT 0,
  data_inicio       DATE,
  data_fim          DATE,
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campanhas_cliente ON campanhas_ads(cliente_id);
CREATE INDEX IF NOT EXISTS idx_campanhas_status  ON campanhas_ads(status);

-- ============================================================
-- TABELA: RELATORIOS MENSAIS
-- ============================================================
CREATE TABLE IF NOT EXISTS relatorios_mensais (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id       UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  mes_ano          TEXT NOT NULL,  -- Formato: 'YYYY-MM'
  mrr              NUMERIC(10,2),
  investimento_ads NUMERIC(10,2),
  conversoes       NUMERIC(10,2),
  cpa              NUMERIC(10,2),
  cliques          INTEGER,
  impressoes       INTEGER,
  ctr              NUMERIC(5,2),
  sessoes_ga4      INTEGER,
  usuarios_novos   INTEGER,
  taxa_engajamento NUMERIC(5,2),
  roi              NUMERIC(8,2),
  conteudo_markdown TEXT,
  analise_ia        JSONB,
  status_geracao    TEXT NOT NULL DEFAULT 'pendente'
                    CHECK (status_geracao IN ('pendente','processando','gerado','erro')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_relatorios_cliente ON relatorios_mensais(cliente_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_mes     ON relatorios_mensais(mes_ano);
CREATE UNIQUE INDEX IF NOT EXISTS idx_relatorios_unique ON relatorios_mensais(cliente_id, mes_ano);

-- ============================================================
-- TABELA: ALERTAS DO SISTEMA
-- ============================================================
CREATE TABLE IF NOT EXISTS alertas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id      UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_alerta     TEXT NOT NULL,
  mensagem        TEXT NOT NULL,
  dispara_em      TIMESTAMPTZ NOT NULL,
  disparado       BOOLEAN NOT NULL DEFAULT FALSE,
  data_disparo    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alertas_cliente    ON alertas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_alertas_pendentes  ON alertas(dispara_em) WHERE disparado = FALSE;

-- ============================================================
-- TABELA: ONBOARD PROGRESSO
-- ============================================================
CREATE TABLE IF NOT EXISTS onboard_progresso (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE UNIQUE,
  progresso    JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboard_cliente ON onboard_progresso(cliente_id);

-- ============================================================
-- TRIGGERS: auto-updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_assinaturas_updated_at
  BEFORE UPDATE ON assinaturas
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_custos_updated_at
  BEFORE UPDATE ON custos_detalhados
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_campanhas_updated_at
  BEFORE UPDATE ON campanhas_ads
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_onboard_updated_at
  BEFORE UPDATE ON onboard_progresso
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

-- ============================================================
-- RLS: Row Level Security
-- ============================================================
ALTER TABLE clientes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinaturas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE estagios_operacionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_acoes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE custos_detalhados     ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanhas_ads         ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_mensais    ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas               ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboard_progresso     ENABLE ROW LEVEL SECURITY;

-- Policy: qualquer usuário autenticado tem acesso total (app interno da agência)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'clientes','assinaturas','estagios_operacionais','historico_acoes',
    'configuracoes_financeiras','custos_detalhados','campanhas_ads',
    'relatorios_mensais','alertas','onboard_progresso'
  ]) LOOP
    EXECUTE format(
      'CREATE POLICY "acesso_autenticado_%s" ON %s FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t, t
    );
  END LOOP;
END;
$$;
