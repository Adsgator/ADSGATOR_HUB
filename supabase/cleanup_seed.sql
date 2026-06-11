-- =============================================================================
-- 🧹 LIMPEZA DOS DADOS DE TESTE (seed_test_data.sql)
-- Rodar no Supabase Dashboard → SQL Editor.
--
-- Remove APENAS os dados criados pelo seed: clientes com nome '[TESTE]...'
-- ou email '*.teste@exemplo.com' e tudo que depende deles.
-- Clientes reais (importados do Asaas ou cadastrados à mão) NÃO são tocados.
-- =============================================================================

BEGIN;

-- Conjunto de clientes de teste
CREATE TEMP TABLE _clientes_teste AS
SELECT id FROM clientes
WHERE nome LIKE '[TESTE]%'
   OR email LIKE '%.teste@exemplo.com'
   OR user_id = '00000000-0000-0000-0000-000000000001';

-- Dependências sem ON DELETE CASCADE (defensivo — algumas já cascateiam)
DELETE FROM notificacoes          WHERE cliente_id IN (SELECT id FROM _clientes_teste);
DELETE FROM historico_acoes       WHERE cliente_id IN (SELECT id FROM _clientes_teste);
DELETE FROM financeiro_lancamentos WHERE cliente_id IN (SELECT id FROM _clientes_teste);
DELETE FROM tarefas               WHERE cliente_id IN (SELECT id FROM _clientes_teste);
DELETE FROM analytics_snapshots   WHERE cliente_id IN (SELECT id FROM _clientes_teste);

-- Clientes (assinaturas, estagios, alertas etc. cascateiam pelo FK)
DELETE FROM clientes WHERE id IN (SELECT id FROM _clientes_teste);

-- Lançamentos financeiros de teste sem cliente (descrições do seed)
DELETE FROM financeiro_lancamentos WHERE descricao LIKE '[TESTE]%';

DROP TABLE _clientes_teste;

COMMIT;

-- Conferência: deve retornar 0
SELECT COUNT(*) AS clientes_teste_restantes
FROM clientes
WHERE nome LIKE '[TESTE]%' OR email LIKE '%.teste@exemplo.com';
