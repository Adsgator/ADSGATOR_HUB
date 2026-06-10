-- Migration: RLS owner-scoped
-- Substitui as policies permissivas (USING (true)) por políticas de propriedade.
-- Totalmente idempotente — seguro rodar múltiplas vezes.
-- Aplicar APÓS a migration 20260610_portal_token.sql.

-- ============================================================
-- 1. BACKFILL — preenche user_id NULL com o operador da agência
-- ============================================================
DO $$
DECLARE
  operator_id uuid;
BEGIN
  SELECT id INTO operator_id FROM auth.users
  WHERE email = 'lucas@adsgator.com.br' LIMIT 1;

  IF operator_id IS NULL THEN
    RAISE EXCEPTION 'Operador agenciaadsgator@gmail.com não encontrado em auth.users';
  END IF;

  UPDATE clientes            SET user_id = operator_id WHERE user_id IS NULL;
  UPDATE financeiro_lancamentos SET user_id = operator_id WHERE user_id IS NULL;
  UPDATE notificacoes        SET user_id = operator_id WHERE user_id IS NULL;
  UPDATE posts_agendados     SET user_id = operator_id WHERE user_id IS NULL;
END $$;

-- ============================================================
-- 2. DEFAULTS — inserts do browser continuam sem passar user_id explicitamente
-- ============================================================
ALTER TABLE clientes               ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE financeiro_lancamentos ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE notificacoes           ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE posts_agendados        ALTER COLUMN user_id SET DEFAULT auth.uid();

-- ============================================================
-- 3. DROP das policies permissivas herdadas de schema.sql
-- ============================================================
DROP POLICY IF EXISTS "acesso_autenticado_clientes"                ON clientes;
DROP POLICY IF EXISTS "acesso_autenticado_assinaturas"             ON assinaturas;
DROP POLICY IF EXISTS "acesso_autenticado_campanhas_ads"           ON campanhas_ads;
DROP POLICY IF EXISTS "acesso_autenticado_estagios_operacionais"   ON estagios_operacionais;
DROP POLICY IF EXISTS "acesso_autenticado_configuracoes_financeiras" ON configuracoes_financeiras;
DROP POLICY IF EXISTS "acesso_autenticado_custos_detalhados"       ON custos_detalhados;
DROP POLICY IF EXISTS "acesso_autenticado_relatorios_mensais"      ON relatorios_mensais;
DROP POLICY IF EXISTS "acesso_autenticado_onboard_progresso"       ON onboard_progresso;
DROP POLICY IF EXISTS "acesso_autenticado_historico_acoes"         ON historico_acoes;

-- Policies genéricas de authenticated em tabelas que precisam de owner-scope
DROP POLICY IF EXISTS "Enable read for authenticated users"  ON historico_acoes;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON historico_acoes;
DROP POLICY IF EXISTS "Enable read for authenticated users"  ON memoria_clientes;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON memoria_clientes;
DROP POLICY IF EXISTS "Enable read for authenticated users"  ON posts_marketing;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON posts_marketing;
DROP POLICY IF EXISTS "Enable read for authenticated users"  ON alertas;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON alertas;

-- ============================================================
-- 4. ENABLE RLS em tabelas que possam estar sem ele
-- ============================================================
ALTER TABLE alertas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_acoes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE memoria_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts_marketing  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. POLICIES OWNER-SCOPED
-- Usa (SELECT auth.uid()) em vez de auth.uid() direto —
-- Postgres cacheia o initplan, evita avaliação por linha.
-- ============================================================

-- ── Grupo 1: user_id direto ─────────────────────────────────

-- clientes (pedra angular — todas as subqueries de cliente_id dependem desta)
DROP POLICY IF EXISTS "owner_clientes" ON clientes;
CREATE POLICY "owner_clientes" ON clientes
  FOR ALL TO authenticated
  USING  (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- posts_marketing (antes: authenticated genérico)
DROP POLICY IF EXISTS "owner_posts_marketing" ON posts_marketing;
CREATE POLICY "owner_posts_marketing" ON posts_marketing
  FOR ALL TO authenticated
  USING  (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Re-assert determinístico das demais (já existiam, mas agora são a fonte única)
DROP POLICY IF EXISTS "owner_lancamentos"    ON financeiro_lancamentos;
CREATE POLICY "owner_lancamentos" ON financeiro_lancamentos
  FOR ALL TO authenticated
  USING  (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "owner_notificacoes"   ON notificacoes;
CREATE POLICY "owner_notificacoes" ON notificacoes
  FOR ALL TO authenticated
  USING  (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "owner_tarefas"        ON tarefas;
CREATE POLICY "owner_tarefas" ON tarefas
  FOR ALL TO authenticated
  USING  (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "owner_posts"          ON posts_agendados;
CREATE POLICY "owner_posts" ON posts_agendados
  FOR ALL TO authenticated
  USING  (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "owner_relatorios"     ON relatorios;
CREATE POLICY "owner_relatorios" ON relatorios
  FOR ALL TO authenticated
  USING  (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "owner_biblioteca"     ON componentes_biblioteca;
CREATE POLICY "owner_biblioteca" ON componentes_biblioteca
  FOR ALL TO authenticated
  USING  (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "proprio_saved_views"  ON saved_views;
CREATE POLICY "proprio_saved_views" ON saved_views
  FOR ALL TO authenticated
  USING  (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "owner_config_usuario" ON configuracoes_usuario;
CREATE POLICY "owner_config_usuario" ON configuracoes_usuario
  FOR ALL TO authenticated
  USING  (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "owner_api_keys"       ON api_keys;
CREATE POLICY "owner_api_keys" ON api_keys
  FOR ALL TO authenticated
  USING  (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ── Grupo 2: cliente_id — roteado via clientes.user_id ──────

DROP POLICY IF EXISTS "owner_assinaturas"    ON assinaturas;
CREATE POLICY "owner_assinaturas" ON assinaturas
  FOR ALL TO authenticated
  USING  (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "owner_estagios"       ON estagios;
CREATE POLICY "owner_estagios" ON estagios
  FOR ALL TO authenticated
  USING  (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "owner_historico"      ON historico_acoes;
CREATE POLICY "owner_historico" ON historico_acoes
  FOR ALL TO authenticated
  USING  (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "owner_memoria"        ON memoria_clientes;
CREATE POLICY "owner_memoria" ON memoria_clientes
  FOR ALL TO authenticated
  USING  (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "owner_analytics"      ON analytics_snapshots;
CREATE POLICY "owner_analytics" ON analytics_snapshots
  FOR ALL TO authenticated
  USING  (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "owner_relatorios_mensais" ON relatorios_mensais;
CREATE POLICY "owner_relatorios_mensais" ON relatorios_mensais
  FOR ALL TO authenticated
  USING  (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "owner_alertas"        ON alertas;
CREATE POLICY "owner_alertas" ON alertas
  FOR ALL TO authenticated
  USING  (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "owner_onboard"        ON onboard_progresso;
CREATE POLICY "owner_onboard" ON onboard_progresso
  FOR ALL TO authenticated
  USING  (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())));

-- estagios_operacionais e campanhas_ads: guarded (podem não existir com cliente_id)
DO $$
BEGIN
  IF to_regclass('public.estagios_operacionais') IS NOT NULL THEN
    EXECUTE $p$
      DROP POLICY IF EXISTS "owner_estagios_operacionais" ON estagios_operacionais;
      CREATE POLICY "owner_estagios_operacionais" ON estagios_operacionais
        FOR ALL TO authenticated
        USING  (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())))
        WITH CHECK (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())));
    $p$;
  END IF;

  IF to_regclass('public.campanhas_ads') IS NOT NULL THEN
    EXECUTE $p$
      DROP POLICY IF EXISTS "owner_campanhas_ads" ON campanhas_ads;
      CREATE POLICY "owner_campanhas_ads" ON campanhas_ads
        FOR ALL TO authenticated
        USING  (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())))
        WITH CHECK (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())));
    $p$;
  END IF;
END $$;

-- projetos_web: tightened (tinha auth.role()='authenticated' genérico)
DROP POLICY IF EXISTS "autenticado_projetos_web"  ON projetos_web;
DROP POLICY IF EXISTS "owner_projetos_web"         ON projetos_web;
CREATE POLICY "owner_projetos_web" ON projetos_web
  FOR ALL TO authenticated
  USING  (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (cliente_id IN (SELECT id FROM clientes WHERE user_id = (SELECT auth.uid())));

-- ── Grupo 3: singletons de agência (sem user_id) ────────────
-- Qualquer usuário autenticado acessa (agência single-operator hoje).
-- Mais restrito que USING(true) — exige sessão válida.

DROP POLICY IF EXISTS "acesso_autenticado_configuracoes_financeiras" ON configuracoes_financeiras;
DROP POLICY IF EXISTS "owner_configuracoes_financeiras"              ON configuracoes_financeiras;
CREATE POLICY "owner_configuracoes_financeiras" ON configuracoes_financeiras
  FOR ALL TO authenticated
  USING  ((SELECT auth.uid()) IS NOT NULL)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "acesso_autenticado_custos_detalhados" ON custos_detalhados;
DROP POLICY IF EXISTS "owner_custos_detalhados"              ON custos_detalhados;
CREATE POLICY "owner_custos_detalhados" ON custos_detalhados
  FOR ALL TO authenticated
  USING  ((SELECT auth.uid()) IS NOT NULL)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
