-- Isenção da régua de inadimplência por cliente. Quando true, a régua
-- AUTOMÁTICA (D+7/D+15/D+28, processarReguaInadimplencia no cron) nunca age
-- neste cliente — útil para contratos especiais / acordos por fora. As ações
-- MANUAIS (Pausar/Reativar na tela) continuam disponíveis. Default false.
-- Aplicar manual no SQL Editor (regra do projeto).

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS regua_isento boolean NOT NULL DEFAULT false;
