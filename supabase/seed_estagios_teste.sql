-- =============================================================================
-- SEED: Clientes de Teste em Estágios Variados
-- Execute no Supabase SQL Editor enquanto logado com seu usuário.
-- Substitui automaticamente pelo auth.uid() do usuário autenticado.
-- =============================================================================

DO $$
DECLARE
  uid          UUID := '6eef3dfd-2608-449f-a83f-4ba4a6122496';
  c1 UUID; c2 UUID; c3 UUID; c4 UUID; c5 UUID;
  c6 UUID; c7 UUID; c8 UUID; c9 UUID; c10 UUID;
BEGIN

-- ── Limpar dados de teste anteriores ────────────────────────────────────────
DELETE FROM estagios         WHERE cliente_id IN (SELECT id FROM clientes WHERE email LIKE '%@seed.teste%');
DELETE FROM assinaturas      WHERE cliente_id IN (SELECT id FROM clientes WHERE email LIKE '%@seed.teste%');
DELETE FROM historico_acoes  WHERE cliente_id IN (SELECT id FROM clientes WHERE email LIKE '%@seed.teste%');
DELETE FROM notificacoes     WHERE cliente_id IN (SELECT id FROM clientes WHERE email LIKE '%@seed.teste%');
DELETE FROM financeiro_lancamentos WHERE cliente_id IN (SELECT id FROM clientes WHERE email LIKE '%@seed.teste%');
DELETE FROM clientes         WHERE email LIKE '%@seed.teste%';

-- =============================================================================
-- CLIENTES
-- =============================================================================

-- 1. Recém recebido — aguardando #BOASVINDAS
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, mrr, dias_atraso, notas_internas)
VALUES (gen_random_uuid(), uid, 'Studio Bloom Fotografia', 'bloom@seed.teste', '5511991110001', 'fotografia', 'recebido', 0, 0,
  'Fechou pelo Instagram. Quer anunciar ensaios newborn e casamentos. Budget R$ 1.500/mês.')
RETURNING id INTO c1;

-- 2. Onboarding em andamento — acesso ao Google Ads solicitado
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, mrr, dias_atraso, notas_internas)
VALUES (gen_random_uuid(), uid, 'Clínica Ortho & Saúde', 'ortho@seed.teste', '5511991110002', 'saude', 'onboarding', 1997, 0,
  'Clínica odontológica em SP. 3 unidades. Precisa de campanhas separadas por unidade.')
RETURNING id INTO c2;

-- 3. Setup de tráfego — configurando campanhas pela primeira vez
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, mrr, dias_atraso, notas_internas)
VALUES (gen_random_uuid(), uid, 'Construtora Vale Verde', 'valeverde@seed.teste', '5511991110003', 'construcao', 'setup_trafego', 2997, 0,
  'Construtora de médio porte. Foco em leads qualificados para imóveis de R$ 400k+.')
RETURNING id INTO c3;

-- 4. Ativo — pagamento em dia, tudo certo
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, mrr, dias_atraso, saldo_google, notas_internas)
VALUES (gen_random_uuid(), uid, 'PetShop Patinhas & Cia', 'patinhas@seed.teste', '5511991110004', 'petshop', 'ativo', 997, 0, 450.00,
  'Cliente fidelizado há 8 meses. Performance estável. Expandindo para gatos.')
RETURNING id INTO c4;

-- 5. Ativo — saldo Google baixo (alerta)
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, mrr, dias_atraso, saldo_google, notas_internas)
VALUES (gen_random_uuid(), uid, 'Óptica VisionMax', 'visionmax@seed.teste', '5511991110005', 'otica', 'ativo', 1497, 0, 85.00,
  'Rede com 2 lojas. Saldo Google baixo — precisa de recarga urgente esta semana.')
RETURNING id INTO c5;

-- 6. Ativo — 5 dias de atraso (monitorar)
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, mrr, dias_atraso, notas_internas)
VALUES (gen_random_uuid(), uid, 'Academia Iron Fit', 'ironfit@seed.teste', '5511991110006', 'academia', 'ativo', 1197, 5,
  'Academia de musculação. Atraso recorrente nos primeiros dias do mês. Paga sempre até dia 10.')
RETURNING id INTO c6;

-- 7. Ativo — 10 dias de atraso (alerta laranja)
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, mrr, dias_atraso, notas_internas)
VALUES (gen_random_uuid(), uid, 'Buffet Sabor & Festa', 'saborfesta@seed.teste', '5511991110007', 'gastronomia', 'ativo', 1797, 10,
  'Buffet de eventos corporativos. Alegou problema com banco. Prometeu pagar até quinta.')
RETURNING id INTO c7;

-- 8. Ativo — 16 dias de atraso (rescisão iminente)
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, mrr, dias_atraso, notas_internas)
VALUES (gen_random_uuid(), uid, 'Auto Elétrica Turbocar', 'turbocar@seed.teste', '5511991110008', 'automotivo', 'ativo', 897, 16,
  'Sem resposta desde o último contato. Campanha pausada automaticamente ontem.')
RETURNING id INTO c8;

-- 9. Congelado — cliente pausou temporariamente
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, mrr, dias_atraso, notas_internas)
VALUES (gen_random_uuid(), uid, 'Escola de Idiomas LinguaPlus', 'linguaplus@seed.teste', '5511991110009', 'educacao', 'congelado', 0, 0,
  'Pausa de 60 dias. Proprietário viajando. Retorno previsto para julho.')
RETURNING id INTO c9;

-- 10. Cancelado — encerrou contrato
INSERT INTO clientes (id, user_id, nome, email, whatsapp, nicho, status, mrr, dias_atraso, notas_internas)
VALUES (gen_random_uuid(), uid, 'Loja de Móveis Espaço Casa', 'espacocasa@seed.teste', '5511991110010', 'moveis', 'cancelado', 0, 0,
  'Cancelou por corte de custos. Saiu bem. Porta aberta para retorno.')
RETURNING id INTO c10;

-- =============================================================================
-- ASSINATURAS
-- =============================================================================

INSERT INTO assinaturas (cliente_id, plano_nome, valor_mensal, status, dias_atraso, data_proxima_cobranca)
VALUES
  (c2, 'Plano Growth',      1997, 'ativa',          0,  (NOW() + INTERVAL '25 days')::DATE),
  (c3, 'Plano Growth',      2997, 'ativa',          0,  (NOW() + INTERVAL '20 days')::DATE),
  (c4, 'Plano Starter',      997, 'ativa',          0,  (NOW() + INTERVAL '18 days')::DATE),
  (c5, 'Plano Starter',     1497, 'ativa',          0,  (NOW() + INTERVAL '15 days')::DATE),
  (c6, 'Plano Starter',     1197, 'atraso_7_dias',  5,  (NOW() - INTERVAL '5 days')::DATE),
  (c7, 'Plano Growth',      1797, 'atraso_7_dias', 10,  (NOW() - INTERVAL '10 days')::DATE),
  (c8, 'Plano Starter',      897, 'atraso_15_dias',16,  (NOW() - INTERVAL '16 days')::DATE);

-- =============================================================================
-- ESTÁGIOS OPERACIONAIS
-- =============================================================================

-- c1: Recebido — aguardando onboarding
INSERT INTO estagios (cliente_id, nome, descricao, acao_label, acao_url, checklist, ativo)
VALUES (c1, 'recebido', 'Novo cliente — enviar boas-vindas e agendar call de onboarding', '#BOASVINDAS',
  'https://wa.me/5511991110001?text=Olá%20Studio%20Bloom!%20Seja%20bem-vindo(a)%20à%20Adsgator!%20🎉',
  '[
    {"item": "Enviar mensagem #BOASVINDAS", "done": false},
    {"item": "Criar ficha completa do cliente", "done": false},
    {"item": "Agendar call de kick-off (30min)", "done": false},
    {"item": "Solicitar acesso ao Google Ads", "done": false}
  ]'::jsonb, true);

-- c2: Onboarding — acesso solicitado, aguardando aprovação
INSERT INTO estagios (cliente_id, nome, descricao, acao_label, acao_url, checklist, ativo)
VALUES (c2, 'onboarding', 'Coletando acessos e configurando conta no sistema', 'Ver checklist',
  NULL,
  '[
    {"item": "Enviar #BOASVINDAS", "done": true},
    {"item": "Call de kick-off realizada", "done": true},
    {"item": "Solicitar acesso Google Ads", "done": true},
    {"item": "Acesso Google Ads aprovado", "done": false},
    {"item": "Vincular GA4 ao painel", "done": false},
    {"item": "Preencher briefing de campanhas", "done": false},
    {"item": "Definir budget por unidade", "done": false}
  ]'::jsonb, true);

-- c3: Setup de tráfego — configurando campanhas
INSERT INTO estagios (cliente_id, nome, descricao, acao_label, acao_url, checklist, ativo)
VALUES (c3, 'setup_trafego', 'Estruturando campanhas no Google Ads — fase de aprendizado', 'Ver campanhas',
  NULL,
  '[
    {"item": "Briefing aprovado pelo cliente", "done": true},
    {"item": "Estrutura de campanhas criada", "done": true},
    {"item": "Palavras-chave revisadas", "done": true},
    {"item": "Anúncios de texto criados (RSA)", "done": true},
    {"item": "Conversões configuradas no GA4", "done": false},
    {"item": "Campanha ativa — período de aprendizado", "done": false},
    {"item": "Primeiro relatório de 7 dias enviado", "done": false}
  ]'::jsonb, true);

-- c4: Ativo — em dia
INSERT INTO estagios (cliente_id, nome, descricao, acao_label, acao_url, checklist, ativo)
VALUES (c4, 'ativo', 'Cliente ativo e saudável — acompanhamento semanal em dia', 'Ver relatório', NULL,
  '[
    {"item": "Relatório mensal de maio enviado", "done": true},
    {"item": "Otimização semanal realizada", "done": true},
    {"item": "Budget de junho confirmado", "done": false}
  ]'::jsonb, true);

-- c5: Ativo — saldo crítico
INSERT INTO estagios (cliente_id, nome, descricao, acao_label, acao_url, checklist, ativo)
VALUES (c5, 'ativo', 'Cliente ativo — ATENÇÃO: saldo Google Ads criticamente baixo', '#SALDOGOOGLE',
  'https://wa.me/5511991110005?text=Olá%20VisionMax!%20Seu%20saldo%20Google%20Ads%20está%20em%20R%24%2085%20e%20pode%20pausar%20as%20campanhas.%20Quando%20consegue%20fazer%20a%20recarga%3F',
  '[
    {"item": "Enviar alerta de saldo baixo", "done": false},
    {"item": "Confirmar recarga com cliente", "done": false},
    {"item": "Monitorar campanhas até recarga", "done": false}
  ]'::jsonb, true);

-- c6: Ativo com atraso leve
INSERT INTO estagios (cliente_id, nome, descricao, acao_label, acao_url, checklist, ativo)
VALUES (c6, 'ativo', '5 dias em atraso — histórico de pagamento até dia 10, monitorar', 'Monitorar', NULL,
  '[
    {"item": "Verificar extrato de pagamento", "done": false},
    {"item": "Contato amigável se não pagar até dia 10", "done": false}
  ]'::jsonb, true);

-- c7: Ativo com atraso médio
INSERT INTO estagios (cliente_id, nome, descricao, acao_label, acao_url, checklist, ativo)
VALUES (c7, 'ativo', '10 dias em atraso — prometeu pagar até quinta-feira', '#ALERTA D+10',
  'https://wa.me/5511991110007?text=Olá!%20Passando%20para%20confirmar%20o%20pagamento%20que%20estava%20previsto%20para%20hoje.%20Conseguiu%20resolver%3F',
  '[
    {"item": "Primeiro contato realizado (D+7)", "done": true},
    {"item": "Aguardando pagamento confirmado para quinta", "done": false},
    {"item": "Se não pagar: enviar #ALERTA D+15", "done": false}
  ]'::jsonb, true);

-- c8: Ativo com atraso crítico
INSERT INTO estagios (cliente_id, nome, descricao, acao_label, acao_url, checklist, ativo)
VALUES (c8, 'ativo', '16 dias em atraso — sem resposta, campanha pausada, enviar rescisão', '#COBRANÇA',
  'https://wa.me/5511991110008?text=Prezado(a)%20Turbocar.%20Em%20razão%20do%20atraso%20de%2016%20dias%2C%20comunicamos%20formalmente%20a%20rescisão%20do%20contrato%20de%20prestação%20de%20serviços.',
  '[
    {"item": "Contato D+7 realizado", "done": true},
    {"item": "Contato D+10 realizado", "done": true},
    {"item": "Campanha pausada", "done": true},
    {"item": "Enviar notificação formal de rescisão", "done": false},
    {"item": "Registrar ocorrência no histórico", "done": false}
  ]'::jsonb, true);

-- c9: Congelado
INSERT INTO estagios (cliente_id, nome, descricao, acao_label, acao_url, checklist, ativo)
VALUES (c9, 'congelado', 'Pausa voluntária de 60 dias — retorno previsto julho/2026', 'Lembrete',
  'https://wa.me/5511991110009?text=Olá%20LinguaPlus!%20Estamos%20aguardando%20seu%20retorno.%20Qualquer%20coisa%20é%20só%20nos%20chamar!',
  '[
    {"item": "Confirmar data de retorno", "done": false},
    {"item": "Lembrete 2 semanas antes do retorno", "done": false}
  ]'::jsonb, true);

-- =============================================================================
-- HISTÓRICO DE AÇÕES
-- =============================================================================

INSERT INTO historico_acoes (cliente_id, tipo_acao, descricao, valor_impactado)
VALUES
  (c1, 'cliente_criado',       'Novo cliente cadastrado via seed de testes', 0),
  (c2, 'onboarding_iniciado',  'Call de kick-off realizada — acessos solicitados', 1997),
  (c3, 'campanha_ativada',     'Estrutura de campanhas no Google Ads publicada', 2997),
  (c4, 'relatorio_enviado',    'Relatório mensal de maio enviado e aprovado pelo cliente', 997),
  (c5, 'alerta_saldo',         'Saldo Google Ads caiu abaixo de R$ 100 — alerta ativado', 0),
  (c6, 'cobranca_pendente',    'Assinatura vencida há 5 dias — monitorando', 1197),
  (c7, 'contato_cobranca',     'Contato D+7 realizado — cliente prometeu pagar até quinta', 1797),
  (c8, 'campanha_pausada',     'Campanha pausada automaticamente por 16 dias de atraso', 0),
  (c8, 'rescisao_iniciada',    'Notificação de rescisão contratual enviada por WhatsApp', 0),
  (c9, 'cliente_congelado',    'Cliente solicitou pausa de 60 dias — retorno previsto julho/2026', 0),
  (c10,'cliente_cancelado',    'Contrato encerrado por corte de custos do cliente', 0);

-- =============================================================================
-- NOTIFICAÇÕES
-- =============================================================================

INSERT INTO notificacoes (user_id, cliente_id, tipo, titulo, mensagem, acao_label, acao_url, lida)
VALUES
  (uid, c1, 'info',    'Novo cliente: Studio Bloom Fotografia', 'Recebido agora — envie o #BOASVINDAS', '#BOASVINDAS',
   'https://wa.me/5511991110001?text=Olá%20Studio%20Bloom!%20Seja%20bem-vindo(a)%20à%20Adsgator!%20🎉', false),

  (uid, c5, 'urgente', 'Saldo crítico: ÓpticaVisionMax', 'Saldo Google Ads em R$ 85 — campanhas podem pausar hoje', '#SALDOGOOGLE',
   'https://wa.me/5511991110005?text=Seu%20saldo%20Google%20Ads%20está%20crítico!', false),

  (uid, c7, 'atencao', 'Atraso D+10: Buffet Sabor & Festa', '10 dias em atraso — contato realizado, aguardando pagamento', '#ALERTA',
   'https://wa.me/5511991110007', false),

  (uid, c8, 'urgente', 'Rescisão iminente: Auto Elétrica Turbocar', '16 dias sem pagamento e sem resposta — campanha pausada', '#RESCISÃO',
   'https://wa.me/5511991110008', false);

-- =============================================================================
-- LANÇAMENTOS FINANCEIROS (histórico 3 meses)
-- =============================================================================

INSERT INTO financeiro_lancamentos (user_id, cliente_id, tipo, categoria, descricao, valor, data, status)
SELECT uid, cl.id, 'receita', 'mensalidade',
  'Mensalidade — ' || cl.nome,
  a.valor_mensal,
  (CURRENT_DATE - (s.offset_days || ' days')::INTERVAL)::DATE,
  CASE WHEN s.offset_days <= 0 THEN 'confirmado' ELSE 'pendente' END
FROM (VALUES (c2),(c3),(c4),(c5),(c6),(c7),(c8)) AS ids(id)
JOIN clientes cl ON cl.id = ids.id
JOIN assinaturas a ON a.cliente_id = cl.id
CROSS JOIN (VALUES (0),(30),(60)) AS s(offset_days)
WHERE cl.status NOT IN ('cancelado', 'recebido');

-- =============================================================================
RAISE NOTICE '✅ Seed concluído!';
RAISE NOTICE '   Clientes criados: 10';
RAISE NOTICE '   Estágios: recebido(1), onboarding(1), setup_trafego(1), ativo(5), congelado(1), cancelado(1)';
RAISE NOTICE '   Atenção: saldo baixo(VisionMax), atraso 5d(IronFit), 10d(Buffet), 16d(Turbocar)';

END $$;
