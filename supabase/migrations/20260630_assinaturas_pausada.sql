-- Régua de inadimplência alinhada aos termos (D+7/D+15/D+28): a régua passa a
-- marcar status próprios na assinatura, distintos do cancelamento por débito:
--   'pausada'         → suspensão D+7 (recorrência pausada no Asaas via PUT INACTIVE);
--   'cancelado_admin' → cancelamento administrativo D+15 (decisão da agência).
-- Sem isso os updates da régua falhariam silenciosamente no CHECK.
-- Ambos NÃO contam MRR (fora de STATUS_ASSINATURA_ATIVA em lib/mrr.ts).

ALTER TABLE assinaturas DROP CONSTRAINT IF EXISTS assinaturas_status_check;
ALTER TABLE assinaturas ADD CONSTRAINT assinaturas_status_check
  CHECK (status IN (
    'ativa',
    'atraso_7_dias',
    'atraso_15_dias',
    'cancelado_debito',
    'cancelada',          -- SUBSCRIPTION_INACTIVATED no Asaas
    'deletada',           -- SUBSCRIPTION_DELETED no Asaas
    'pausada',            -- régua D+7: suspensão dos serviços (recorrência pausada)
    'cancelado_admin'     -- régua D+15: cancelamento administrativo do contrato
  ));
