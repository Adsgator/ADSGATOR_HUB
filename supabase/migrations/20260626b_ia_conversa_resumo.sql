-- ─── FASE 3b · COMPACTAÇÃO DE CONVERSA LONGA ──────────────────────────────────
-- Antes a Gator carregava só as N mensagens mais recentes da conversa e DESCARTAVA
-- o início — em conversa longa ela esquecia o começo. Agora o trecho antigo é
-- RESUMIDO (1 chamada barata ao Flash) em vez de cortado.
--
--   resumo_contexto — resumo cumulativo das mensagens já fora da janela recente,
--                     injetado no system prompt como contexto (não como mensagem).
--   resumido_ate    — created_at da última mensagem coberta pelo resumo. A janela
--                     verbatim é tudo com created_at > resumido_ate. Invariante:
--                     resumo + janela = a conversa inteira, sem buraco.
--
-- Idempotente — seguro rodar múltiplas vezes.

alter table public.ia_conversas
  add column if not exists resumo_contexto text,
  add column if not exists resumido_ate    timestamptz;
