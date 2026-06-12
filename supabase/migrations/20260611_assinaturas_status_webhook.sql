-- Os handlers SUBSCRIPTION_INACTIVATED / SUBSCRIPTION_DELETED do webhook-asaas
-- gravam 'cancelada' / 'deletada', mas o CHECK original só aceitava os 4 status
-- de cobrança — os updates falhavam silenciosamente.

ALTER TABLE assinaturas DROP CONSTRAINT IF EXISTS assinaturas_status_check;
ALTER TABLE assinaturas ADD CONSTRAINT assinaturas_status_check
  CHECK (status IN (
    'ativa',
    'atraso_7_dias',
    'atraso_15_dias',
    'cancelado_debito',
    'cancelada',   -- SUBSCRIPTION_INACTIVATED no Asaas
    'deletada'     -- SUBSCRIPTION_DELETED no Asaas
  ));
