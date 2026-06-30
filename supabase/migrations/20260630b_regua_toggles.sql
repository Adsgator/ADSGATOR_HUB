-- Toggles da régua de inadimplência (D+7/D+15/D+28) — mesmo mecanismo dos
-- emails (automation_settings.ativa). Default OFF: nenhuma etapa age até o Lucas
-- ligar. Aplicar manual no SQL Editor (regra do projeto).
--   regua_d7  → D+7: cria pendência de aprovação (Lucas autoriza a suspensão);
--   regua_d15 → D+15: cancelamento administrativo automático;
--   regua_d28 → D+28: exclusão automática (deleta assinatura/cobranças no Asaas).

INSERT INTO automation_settings (tipo, ativa, descricao) VALUES
  ('regua_d7',  false, 'Régua D+7: pede sua autorização para suspender os serviços do cliente inadimplente'),
  ('regua_d15', false, 'Régua D+15: cancelamento administrativo automático do contrato'),
  ('regua_d28', false, 'Régua D+28: exclusão automática (remove cobranças e assinatura no Asaas, arquiva o cliente)')
ON CONFLICT (tipo) DO NOTHING;
