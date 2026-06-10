# functions_archive

Edge Functions arquivadas — não são deployadas (pasta fora de `supabase/functions/`).

| Function | Motivo do arquivamento |
|---|---|
| `regua-cobranca` | Duplica `/api/v1/cobranca/run` (Vercel Cron 09:00) |
| `morning-briefing` | Duplica `/api/ia/morning-briefing` (Next.js) |
| `processar-alertas` | Duplica `/api/v1/alertas/notificar` (Vercel Cron 08:00) |
| `sentinela` | Nunca invocada; sem pg_cron ativo |
| `recurring-task-runner` | Nunca invocada; sem pg_cron ativo |
| `gerar-relatorio-md` | Nunca invocada do código; lógica coberta por rotas Next.js |
| `gerar-relatorios-mensais` | Nunca invocada; sem pg_cron ativo |

Verificado em 2026-06-10: nenhum `cron.job` no banco, nenhuma chamada `functions.invoke` no código-fonte.

Para restaurar uma function, mova de volta para `supabase/functions/` e rode `supabase functions deploy <nome>`.
