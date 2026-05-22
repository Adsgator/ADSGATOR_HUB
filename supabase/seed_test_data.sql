-- =============================================================================
-- 🧪 SEED DE DADOS DE TESTE - ADSGATOR HUB
-- EXECUTAR APENAS EM AMBIENTE DE DESENVOLVIMENTO/TESTE
-- =============================================================================
-- ATENÇÃO: Este script cria dados fictícios para testes.
-- NUNCA execute em produção sem verificar o modo de teste.
-- =============================================================================

-- =============================================================================
-- 1. CONFIGURAÇÃO INICIAL
-- =============================================================================

-- Criar user_id de teste (simulando um usuário logado)
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000001';
    agencia_id TEXT := 'adsgator-main';
BEGIN
    
-- =============================================================================
-- 2. LIMPEZA DE DADOS ANTERIORES (OPCIONAL - DESCOMENTE SE NECESSÁRIO)
-- =============================================================================
-- DELETE FROM notificacoes WHERE cliente_id IN (SELECT id FROM clientes WHERE email LIKE '%teste%');
-- DELETE FROM historico_acoes WHERE cliente_id IN (SELECT id FROM clientes WHERE email LIKE '%teste%');
-- DELETE FROM estagios WHERE cliente_id IN (SELECT id FROM clientes WHERE email LIKE '%teste%');
-- DELETE FROM assinaturas WHERE cliente_id IN (SELECT id FROM clientes WHERE email LIKE '%teste%');
-- DELETE FROM financeiro_lancamentos WHERE cliente_id IN (SELECT id FROM clientes WHERE email LIKE '%teste%');
-- DELETE FROM clientes WHERE email LIKE '%teste%' OR nome LIKE '%[TESTE]%';

-- =============================================================================
-- 3. INSERÇÃO DE CLIENTES DE TESTE
-- =============================================================================

-- Cliente 1: Ativo, pagamento em dia
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, dias_atraso, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    test_user_id,
    '[TESTE] Empório Digital',
    'cliente1.teste@exemplo.com',
    '5511987654321',
    'ecommerce',
    'ativo',
    0,
    NOW() - INTERVAL '30 days',
    NOW()
) ON CONFLICT DO NOTHING;

-- Cliente 2: Recebido (novo, onboarding)
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, dias_atraso, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    test_user_id,
    '[TESTE] Construtora Horizonte',
    'cliente2.teste@exemplo.com',
    '5511976543210',
    'construcao',
    'recebido',
    0,
    NOW() - INTERVAL '3 days',
    NOW()
) ON CONFLICT DO NOTHING;

-- Cliente 3: Congelado (sem resposta)
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, dias_atraso, alerta_48h_em, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    test_user_id,
    '[TESTE] Clínica Bem Estar',
    'cliente3.teste@exemplo.com',
    '5511965432109',
    'saude',
    'congelado',
    0,
    NOW() - INTERVAL '2 hours', -- Alerta em breve
    NOW() - INTERVAL '5 days',
    NOW()
) ON CONFLICT DO NOTHING;

-- Cliente 4: Atraso 7 dias (alerta laranja)
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, dias_atraso, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    test_user_id,
    '[TESTE] Restaurante Sabor & Arte',
    'cliente4.teste@exemplo.com',
    '5511954321098',
    'gastronomia',
    'ativo',
    7,
    NOW() - INTERVAL '60 days',
    NOW()
) ON CONFLICT DO NOTHING;

-- Cliente 5: Atraso 15 dias (quebra de contrato)
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, dias_atraso, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    test_user_id,
    '[TESTE] Auto Center Turbo',
    'cliente5.teste@exemplo.com',
    '5511943210987',
    'automotivo',
    'ativo',
    15,
    NOW() - INTERVAL '90 days',
    NOW()
) ON CONFLICT DO NOTHING;

-- Cliente 6: Cancelado por débito
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, dias_atraso, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    test_user_id,
    '[TESTE] Loja de Roupas Fashion',
    'cliente6.teste@exemplo.com',
    '5511932109876',
    'varejo',
    'cancelado_debito',
    35,
    NOW() - INTERVAL '120 days',
    NOW()
) ON CONFLICT DO NOTHING;

-- Cliente 7: Inadimplente (5 dias)
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, dias_atraso, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    test_user_id,
    '[TESTE] Academia Fitness Pro',
    'cliente7.teste@exemplo.com',
    '5511921098765',
    'academia',
    'ativo',
    5,
    NOW() - INTERVAL '45 days',
    NOW()
) ON CONFLICT DO NOTHING;

-- Cliente 8: Standby
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, dias_atraso, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    test_user_id,
    '[TESTE] Agência de Viagens Mundo',
    'cliente8.teste@exemplo.com',
    '5511910987654',
    'turismo',
    'standby',
    0,
    NOW() - INTERVAL '10 days',
    NOW()
) ON CONFLICT DO NOTHING;

-- =============================================================================
-- 4. CRIAÇÃO DE ASSINATURAS PARA CLIENTES DE TESTE
-- =============================================================================

-- Assinaturas para clientes ativos
INSERT INTO assinaturas (id, cliente_id, plano_nome, valor_mensal, status, dias_atraso, data_proxima_cobranca, asaas_subscription_id, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    c.id,
    CASE (ROW_NUMBER() OVER (PARTITION BY c.id)) 
        WHEN 1 THEN 'Plano Starter'
        WHEN 2 THEN 'Plano Growth'
        ELSE 'Plano Enterprise'
    END,
    CASE (ROW_NUMBER() OVER (PARTITION BY c.id))
        WHEN 1 THEN 997.00
        WHEN 2 THEN 1997.00
        ELSE 4997.00
    END,
    CASE 
        WHEN c.dias_atraso >= 30 THEN 'cancelado_debito'
        WHEN c.dias_atraso >= 15 THEN 'atraso_15_dias'
        WHEN c.dias_atraso >= 7 THEN 'atraso_7_dias'
        WHEN c.dias_atraso > 0 THEN 'atraso'
        ELSE 'ativa'
    END,
    c.dias_atraso,
    CASE 
        WHEN c.dias_atraso > 0 THEN (NOW() - (c.dias_atraso || ' days')::INTERVAL)::DATE
        ELSE (NOW() + INTERVAL '30 days')::DATE
    END::TEXT,
    'sub_test_' || substr(md5(random()::text), 1, 10),
    NOW(),
    NOW()
FROM clientes c
WHERE c.nome LIKE '%[TESTE]%'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 5. CRIAÇÃO DE ESTÁGIOS OPERACIONAIS
-- =============================================================================

-- Estágio para cliente recebido
INSERT INTO estagios (id, cliente_id, nome, descricao, acao_label, acao_url, checklist, ativo, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    c.id,
    'recebido',
    'Novo cliente — enviar #BOASVINDAS',
    '#BOASVINDAS',
    'https://wa.me/' || regexp_replace(c.whatsapp, '\D', '', 'g') || '?text=' || encode('Olá! Seja bem-vindo à Adsgator! 🎉', 'escape')::text,
    jsonb_build_array(
        jsonb_build_object('item', 'Enviar mensagem #BOASVINDAS', 'done', false),
        jsonb_build_object('item', 'Criar ficha do cliente', 'done', false),
        jsonb_build_object('item', 'Agendar call de onboarding', 'done', false)
    ),
    true,
    NOW(),
    NOW()
FROM clientes c
WHERE c.nome LIKE '%[TESTE]%' AND c.status = 'recebido'
ON CONFLICT DO NOTHING;

-- Estágio para cliente congelado
INSERT INTO estagios (id, cliente_id, nome, descricao, acao_label, acao_url, checklist, ativo, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    c.id,
    'congelado',
    'Cliente retido — aguardando retorno',
    '#LEMBRETE',
    'https://wa.me/' || regexp_replace(c.whatsapp, '\D', '', 'g') || '?text=' || encode('Olá! Aguardamos seu retorno para continuar.', 'escape')::text,
    jsonb_build_array(
        jsonb_build_object('item', 'Enviar lembrete amigável', 'done', false),
        jsonb_build_object('item', 'Verificar motivo da pausa', 'done', false)
    ),
    true,
    NOW(),
    NOW()
FROM clientes c
WHERE c.nome LIKE '%[TESTE]%' AND c.status = 'congelado'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 6. LANÇAMENTOS FINANCEIROS DE TESTE (últimos 3 meses)
-- =============================================================================

-- Inserir lançamentos financeiros para simular histórico
INSERT INTO financeiro_lancamentos (id, user_id, cliente_id, tipo, categoria, descricao, valor, data, status, created_at)
SELECT 
    gen_random_uuid(),
    test_user_id,
    c.id,
    'receita',
    'mensalidade',
    'Mensalidade — ' || c.nome,
    a.valor_mensal,
    (CURRENT_DATE - (dias || ' days')::INTERVAL)::TEXT,
    CASE WHEN dias <= 0 THEN 'confirmado' ELSE 'pendente' END,
    NOW()
FROM clientes c
JOIN assinaturas a ON a.cliente_id = c.id
CROSS JOIN generate_series(0, 60, 30) AS dias
WHERE c.nome LIKE '%[TESTE]%'
  AND c.status NOT IN ('cancelado', 'cancelado_debito')
  AND dias <= 60
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 7. NOTIFICAÇÕES DE TESTE
-- =============================================================================

-- Notificação de boas-vindas para cliente recebido
INSERT INTO notificacoes (id, user_id, cliente_id, tipo, titulo, mensagem, acao_label, acao_url, lida, created_at)
SELECT 
    gen_random_uuid(),
    test_user_id,
    c.id,
    'urgente',
    '[TESTE] Novo cliente recebido!',
    c.nome || ' aguarda #BOASVINDAS agora.',
    '#BOASVINDAS',
    'https://wa.me/' || regexp_replace(c.whatsapp, '\D', '', 'g') || '?text=Olá!',
    false,
    NOW()
FROM clientes c
WHERE c.nome LIKE '%[TESTE]%' AND c.status = 'recebido'
ON CONFLICT DO NOTHING;

-- Notificação de alerta para cliente com atraso
INSERT INTO notificacoes (id, user_id, cliente_id, tipo, titulo, mensagem, acao_label, acao_url, lida, created_at)
SELECT 
    gen_random_uuid(),
    test_user_id,
    c.id,
    'atencao',
    '[TESTE] ' || c.nome || ' — ' || c.dias_atraso || ' dias em atraso',
    'Campanha em risco de suspensão.',
    '#ALERTA D+' || c.dias_atraso,
    'https://wa.me/' || regexp_replace(c.whatsapp, '\D', '', 'g') || '?text=Olá, sobre seu pagamento...',
    false,
    NOW()
FROM clientes c
WHERE c.nome LIKE '%[TESTE]%' AND c.dias_atraso >= 7 AND c.dias_atraso < 30
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 8. HISTÓRICO DE AÇÕES
-- =============================================================================

INSERT INTO historico_acoes (id, cliente_id, tipo_acao, descricao, valor_impactado, metadata, created_at)
SELECT 
    gen_random_uuid(),
    c.id,
    'onboarding_iniciado',
    'Primeiro contato realizado com ' || c.nome,
    0,
    jsonb_build_object('origem', 'teste'),
    NOW() - INTERVAL '2 days'
FROM clientes c
WHERE c.nome LIKE '%[TESTE]%'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 9. CONFIGURAÇÃO FINANCEIRA DE TESTE
-- =============================================================================

INSERT INTO configuracoes_financeiras (id, agencia_id, custos_fixos_mensais, custos_variaveis_percentual, margem_lucro_minima, saldo_google_ads_limite_alerta, updated_at)
VALUES (
    gen_random_uuid(),
    agencia_id,
    15000.00,    -- Custos fixos mensais
    15.0,        -- 15% custos variáveis
    30.0,        -- Margem mínima de 30%
    500.00,      -- Alerta saldo Google Ads
    NOW()
)
ON CONFLICT (agencia_id) DO UPDATE SET
    custos_fixos_mensais = EXCLUDED.custos_fixos_mensais,
    custos_variaveis_percentual = EXCLUDED.custos_variaveis_percentual,
    margem_lucro_minima = EXCLUDED.margem_lucro_minima,
    saldo_google_ads_limite_alerta = EXCLUDED.saldo_google_ads_limite_alerta,
    updated_at = NOW();

-- =============================================================================
-- 10. RESUMO DOS DADOS CRIADOS
-- =============================================================================

RAISE NOTICE '🧪 DADOS DE TESTE CRIADOS COM SUCESSO!';
RAISE NOTICE '============================================';
RAISE NOTICE 'Clientes criados: %', (SELECT COUNT(*) FROM clientes WHERE nome LIKE '%[TESTE]%');
RAISE NOTICE 'Assinaturas criadas: %', (SELECT COUNT(*) FROM assinaturas a JOIN clientes c ON c.id = a.cliente_id WHERE c.nome LIKE '%[TESTE]%');
RAISE NOTICE 'Notificações criadas: %', (SELECT COUNT(*) FROM notificacoes n JOIN clientes c ON c.id = n.cliente_id WHERE c.nome LIKE '%[TESTE]%');
RAISE NOTICE 'Lançamentos financeiros: %', (SELECT COUNT(*) FROM financeiro_lancamentos f JOIN clientes c ON c.id = f.cliente_id WHERE c.nome LIKE '%[TESTE]%');
RAISE NOTICE '============================================';
RAISE NOTICE 'STATUS DOS CLIENTES:';
RAISE NOTICE 'Ativos: %', (SELECT COUNT(*) FROM clientes WHERE nome LIKE '%[TESTE]%' AND status = 'ativo');
RAISE NOTICE 'Recebidos: %', (SELECT COUNT(*) FROM clientes WHERE nome LIKE '%[TESTE]%' AND status = 'recebido');
RAISE NOTICE 'Congelados: %', (SELECT COUNT(*) FROM clientes WHERE nome LIKE '%[TESTE]%' AND status = 'congelado');
RAISE NOTICE 'Cancelados: %', (SELECT COUNT(*) FROM clientes WHERE nome LIKE '%[TESTE]%' AND status IN ('cancelado', 'cancelado_debito'));
RAISE NOTICE '============================================';

END $$;
