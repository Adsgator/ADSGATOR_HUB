-- Controle de notificação por email dos alertas internos.
--
-- A rota /api/v1/alertas/notificar envia um resumo de alertas pendentes ao
-- operador e marca os notificados aqui, para não reenviar a cada execução.

ALTER TABLE alertas
  ADD COLUMN IF NOT EXISTS email_enviado boolean NOT NULL DEFAULT false;
