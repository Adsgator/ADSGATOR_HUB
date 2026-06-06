-- Templates de email editáveis.
--
-- Os 13 templates vivem hardcoded em src/lib/email.ts como base. Esta tabela
-- guarda OVERRIDES editados pelo usuário: enquanto subject_override /
-- html_override forem NULL, o envio usa o template do código. Ao editar, salva
-- o override aqui. Assim a UI permite editar sem duplicar (e arriscar divergir)
-- todo o HTML base no banco.

CREATE TABLE IF NOT EXISTS email_templates (
  id               text PRIMARY KEY,           -- EmailTemplateId (ex.: 'welcome')
  nome             text NOT NULL,
  descricao        text,
  subject_override text,                        -- NULL = usa o subject do código
  html_override    text,                        -- NULL = usa o HTML do código
  atualizado_em    timestamptz DEFAULT now(),
  atualizado_por   uuid REFERENCES auth.users(id)
);

-- Seed: registra os templates conhecidos (sem override — usa o código).
INSERT INTO email_templates (id, nome, descricao) VALUES
  ('report-google-ads',       'Relatório Google Ads',          'Resumo mensal das campanhas Google Ads do cliente.'),
  ('report-ga4',              'Relatório Google Analytics 4',  'Resumo de sessões, usuários e comportamento do site.'),
  ('report-executive',        'Relatório Executivo',           'Consolidado da agência — MRR, clientes, conversões.'),
  ('welcome',                 'Boas-vindas',                   'Enviado ao cadastrar um novo cliente.'),
  ('payment-reminder',        'Lembrete de Pagamento',         'Lembrete de inadimplência após X dias de atraso.'),
  ('alert-saldo-baixo',       'Alerta: Saldo Google Ads Baixo','Saldo da conta abaixo do mínimo recomendado.'),
  ('alert-performance',       'Alerta de Performance',         'Métrica fora do threshold (CPC alto, CTR baixo, etc.).'),
  ('payment-followup',        'Cobrança — Follow-up',          'Reforço de cobrança para pagamento ainda pendente.'),
  ('cancelamento-notice',     'Aviso de Cancelamento',         'Confirmação de pedido de cancelamento.'),
  ('aviso-indisponibilidade', 'Serviços Pausados',             'Aviso de pausa temporária dos serviços.'),
  ('encerramento',            'Encerramento de Parceria',      'Mensagem de encerramento e resumo do que foi feito.'),
  ('reativacao',              'Reativação',                    'Boas-vindas de volta ao reativar um cliente.')
ON CONFLICT (id) DO NOTHING;

-- RLS: operador único — qualquer usuário autenticado lê e edita.
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users read templates" ON email_templates;
CREATE POLICY "Auth users read templates" ON email_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users update templates" ON email_templates;
CREATE POLICY "Auth users update templates" ON email_templates
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
