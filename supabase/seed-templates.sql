-- ── Seed: 6 Timeline Templates pré-construídos ─────────────────────────────
-- Execute este seed no Supabase SQL Editor ou via supabase db reset

insert into timeline_templates (id, name, type, description, steps) values

-- 1. Onboarding Completo
(
  gen_random_uuid(),
  'Onboarding Completo',
  'onboarding',
  'Fluxo padrão de onboarding para novos clientes Google Ads',
  '[
    {"id":"contrato",          "title":"Contrato enviado e assinado",            "description":"Enviar contrato via DocuSign ou PDF e aguardar assinatura"},
    {"id":"pix-setup",         "title":"Pix do setup recebido",                  "description":"Confirmar recebimento do pagamento de setup"},
    {"id":"grupo-zap",         "title":"Grupo criado no WhatsApp",               "description":"Criar grupo com o cliente e equipe"},
    {"id":"video-boas-vindas", "title":"Vídeo de boas-vindas enviado",           "description":"Enviar vídeo de boas-vindas personalizado"},
    {"id":"call-alinhamento",  "title":"Call de alinhamento realizada",          "description":"Realizar call para alinhar estratégia e expectativas"},
    {"id":"briefing-recebido", "title":"Briefing do negócio recebido",           "description":"Coletar informações sobre o negócio do cliente"}
  ]'::jsonb
),

-- 2. Setup de Tráfego
(
  gen_random_uuid(),
  'Setup de Tráfego Google Ads',
  'onboarding',
  'Checklist técnico completo para configurar campanhas Google Ads',
  '[
    {"id":"acesso-ads",        "title":"Acesso à conta Google Ads",              "description":"Solicitar/conceder acesso de gestor à conta"},
    {"id":"pagamento-ads",     "title":"Pagamento configurado no Google Ads",    "description":"Configurar método de pagamento e crédito inicial"},
    {"id":"dominio",           "title":"Domínio comprado e configurado",         "description":"Registrar domínio e configurar DNS"},
    {"id":"lp-criada",         "title":"Landing page criada e publicada",        "description":"Criar LP no Astroteca e publicar no domínio"},
    {"id":"tags-instaladas",   "title":"Tags Google instaladas na LP",           "description":"Instalar Tag Manager, tag geral e tag de conversão"},
    {"id":"conversao-criada",  "title":"Conversão de WhatsApp configurada",      "description":"Criar e testar evento de conversão via WhatsApp"},
    {"id":"campanha-criada",   "title":"Campanha criada e estruturada",          "description":"Criar campanha com grupos de anúncios e palavras-chave"},
    {"id":"anuncios-criados",  "title":"Anúncios criados (mín. 3 variações)",    "description":"Criar pelo menos 3 variações de anúncios responsivos"},
    {"id":"revisao-final",     "title":"Revisão final antes de ativar",          "description":"Revisar orçamento, locais, extensões e palavras negativas"},
    {"id":"campanha-ativa",    "title":"🚀 Campanha ATIVADA",                    "description":"Ativar campanha e confirmar que está rodando"}
  ]'::jsonb
),

-- 3. Relatório Mensal
(
  gen_random_uuid(),
  'Relatório Mensal',
  'recurring_task',
  'Processo de geração e envio do relatório mensal para o cliente',
  '[
    {"id":"coletar-dados",     "title":"Coletar dados do mês no Google Ads",     "description":"Exportar métricas: impressões, cliques, conversões, CPA"},
    {"id":"coletar-ga4",       "title":"Coletar dados GA4",                      "description":"Exportar sessões, usuários e conversões do Analytics"},
    {"id":"gerar-relatorio",   "title":"Gerar relatório no Hub",                 "description":"Usar módulo Relatórios para gerar PDF/Markdown"},
    {"id":"revisar",           "title":"Revisar relatório",                      "description":"Verificar dados, análise e recomendações"},
    {"id":"enviar-email",      "title":"Enviar relatório por email",             "description":"Enviar PDF ao cliente com análise e próximos passos"},
    {"id":"followup-zap",      "title":"Follow-up WhatsApp",                     "description":"Enviar mensagem confirmando envio e disponibilidade para dúvidas"}
  ]'::jsonb
),

-- 4. Cancelamento / Offboarding
(
  gen_random_uuid(),
  'Offboarding / Cancelamento',
  'alert',
  'Processo estruturado de encerramento de contrato',
  '[
    {"id":"tentativa-retencao","title":"Tentativa de retenção realizada",        "description":"Entrar em contato para entender o motivo e tentar reverter"},
    {"id":"pausar-campanhas",  "title":"Campanhas pausadas no Google Ads",       "description":"Pausar todas as campanhas antes do encerramento"},
    {"id":"encerrar-ads",      "title":"Campanhas encerradas definitivamente",   "description":"Encerrar campanhas e remover gestor da conta"},
    {"id":"remover-lp",        "title":"Landing page removida do ar",            "description":"Desativar o site/LP do domínio contratado"},
    {"id":"revogar-acesso",    "title":"Acesso à conta Google revogado",         "description":"Remover acesso de gestor da conta do cliente"},
    {"id":"arquivar-assets",   "title":"Assets arquivados no Storage",           "description":"Arquivar criativos, briefing e documentos no Supabase Storage"},
    {"id":"nps",               "title":"NPS/feedback solicitado",                "description":"Enviar pesquisa de satisfação para aprendizado"}
  ]'::jsonb
),

-- 5. Reativação de Cliente
(
  gen_random_uuid(),
  'Reativação de Cliente',
  'onboarding',
  'Retomada de serviços para cliente que estava pausado ou cancelado',
  '[
    {"id":"contato-inicial",   "title":"Contato inicial de reativação",          "description":"Entrar em contato para alinhar condições de retorno"},
    {"id":"proposta-nova",     "title":"Nova proposta enviada (se necessário)",  "description":"Enviar proposta atualizada com valores vigentes"},
    {"id":"pagamento-conf",    "title":"Pagamento de reativação confirmado",     "description":"Confirmar recebimento do pagamento"},
    {"id":"reativar-campanhas","title":"Campanhas reativadas no Google Ads",     "description":"Reativar campanhas e verificar configurações"},
    {"id":"revisar-lp",        "title":"Landing page revisada e atualizada",    "description":"Verificar se a LP está funcionando e atualizar se necessário"},
    {"id":"alinhamento",       "title":"Call de realinhamento com o cliente",    "description":"Alinhar estratégia, novos objetivos e expectativas"}
  ]'::jsonb
),

-- 6. Auditoria de Conta
(
  gen_random_uuid(),
  'Auditoria de Conta Google Ads',
  'recurring_task',
  'Revisão completa de uma conta Google Ads existente',
  '[
    {"id":"estrutura",         "title":"Estrutura de campanhas revisada",        "description":"Verificar organização de campanhas, grupos e anúncios"},
    {"id":"palavras-chave",    "title":"Palavras-chave auditadas",               "description":"Analisar match types, negativas e relevância"},
    {"id":"anuncios",          "title":"Anúncios auditados",                     "description":"Verificar textos, extensões e relevância"},
    {"id":"publico",           "title":"Públicos e segmentações revisados",      "description":"Verificar ajustes de lance por público e localização"},
    {"id":"conversoes",        "title":"Configuração de conversões verificada",  "description":"Confirmar que todas as conversões estão rastreando corretamente"},
    {"id":"relatorio-auditoria","title":"Relatório de auditoria entregue",       "description":"Documentar findings e recomendações de otimização"}
  ]'::jsonb
)

on conflict do nothing;
