-- Modelo único de saída de cliente.
--
-- Antes: 'cancelado', 'cancelado_debito' e 'inativo' eram status soltos, e cada
-- tela inventava seu filtro (useClientes escondia só 'cancelado', deixando
-- 'cancelado_debito'/'inativo' poluírem métricas). Agora a saída é um estado
-- único — 'inativo' — com o MOTIVO guardado à parte, para análise de churn.
--
-- Regra de negócio:
--   operação  = recebido, onboarding, setup_trafego, ativo, congelado
--   arquivado = inativo  (motivo: debito | cancelado | congelamento_expirado)
-- Centralizado em lib/cliente-status.ts.

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS motivo_inativacao text;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS inativado_em      timestamptz;

COMMENT ON COLUMN clientes.motivo_inativacao IS
  'Por que o cliente foi arquivado: debito (D+30 automático) | cancelado (encerramento a pedido) | congelamento_expirado (60+ dias congelado). NULL = cliente na operação.';

-- ── BACKFILL: status de saída antigos → inativo + motivo ──────────────────────
-- cancelado_debito (cliente perdido por inadimplência) → inativo + 'debito'
UPDATE clientes
   SET status            = 'inativo',
       motivo_inativacao = 'debito',
       inativado_em      = COALESCE(inativado_em, now())
 WHERE status = 'cancelado_debito';

-- cancelado (encerramento a pedido) → inativo + 'cancelado'
UPDATE clientes
   SET status            = 'inativo',
       motivo_inativacao = 'cancelado',
       inativado_em      = COALESCE(inativado_em, now())
 WHERE status = 'cancelado';

-- inativos pré-existentes sem motivo: marca como 'cancelado' (saída genérica)
UPDATE clientes
   SET motivo_inativacao = 'cancelado',
       inativado_em      = COALESCE(inativado_em, now())
 WHERE status = 'inativo' AND motivo_inativacao IS NULL;

-- Nota: AssinaturaStatus.cancelado_debito (tabela assinaturas) NÃO muda — o
-- webhook do Asaas depende dele. Só o STATUS DO CLIENTE foi consolidado.
