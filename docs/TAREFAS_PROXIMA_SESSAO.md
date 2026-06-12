# Tarefas — próxima sessão (agendamentos configuráveis pela UI)

> Contexto: o Hub tem 5 crons fixos no `vercel.json` (horários em **UTC**, só mudam
> com deploy). O Lucas quer horário e liga/desliga configuráveis pela UI, como
> qualquer outra configuração. Este arquivo é a spec completa — siga na ordem.

## Regras do repo (obrigatórias)

- Ler `CLAUDE.md` antes de começar. Sempre `rem`, nunca `dark:` (tokens CSS já são theme-aware).
- **Feature entregue = mesma entrega registra** `src/data/changelog.ts` (nova versão `0.11.0` no topo) **e** `src/lib/ia/system-map.ts` (linha CRONS).
- Migrations: criar o arquivo em `supabase/migrations/` e **entregar ao Lucas para aplicar no SQL Editor** (nunca `supabase db push`). Idempotentes (`if not exists`, `on conflict do nothing`).
- Antes de `npm run build`: garantir que `npm run dev` NÃO está rodando (corrompe `.next`).
- Validar com `npm run typecheck; echo EXIT=$?` (o pipe pra `tail` engole o exit code — não usar).
- Coluna de isolamento é `user_id`. Rotas de sessão usam `createClient` de `@/lib/supabase/server`; crons usam service role + `Bearer CRON_SECRET` (padrão em `src/app/api/v1/briefing/run/route.ts`).

## Estado atual (commits já feitos, não refazer)

- v0.10.0 entregue: Central de Prontidão (aba Setup), templates de tarefa/email,
  provisionamento automático de cliente, empty states, briefing proativo (cron 06:30 UTC).
- Crons hoje no `vercel.json` (UTC): sync 06:00, briefing 06:30, import Asaas 07:00,
  alertas 08:00, cobrança 09:00.
- Pendências manuais do Lucas (não são suas): aplicar `20260614_templates.sql` e
  `20260614_briefings.sql` no SQL Editor; redeploy da Edge Function `webhook-asaas`.

---

## T1 — Migration `cron_settings`

Arquivo: `supabase/migrations/20260615_cron_settings.sql`

```sql
create table if not exists public.cron_settings (
  tipo        text primary key,          -- 'analytics_sync' | 'briefing' | 'asaas_import' | 'alertas' | 'cobranca'
  nome        text not null,
  descricao   text,
  ativo       boolean not null default true,
  horario     time not null,             -- horário desejado em America/Sao_Paulo
  ultimo_run  timestamptz,
  updated_at  timestamptz default now()
);
```

- RLS: padrão "authenticated all ops" (copiar de `tarefa_templates` em `20260614_templates.sql`).
- Seed dos 5 jobs com os horários SP equivalentes aos atuais (UTC-3): sync 03:00,
  briefing 03:30, import 04:00, alertas 05:00, cobrança 06:00 — `on conflict (tipo) do nothing`.
  (Manter o comportamento atual como ponto de partida; o Lucas ajusta pela UI depois.)

## T2 — `src/lib/cron-settings.ts` (gate dos jobs)

Exportar:

- `deveRodarAgora(db, tipo): Promise<{ rodar: boolean; motivo?: string }>`
  - Lê `cron_settings` do tipo. Se a tabela não existir ainda (erro), retornar
    `{ rodar: true }` — **fallback é o comportamento atual**, nada quebra sem migration.
  - `ativo = false` → `{ rodar: false, motivo: 'desativado' }`.
  - Janela de horário: converter "agora" para SP (padrão `hojeSP()` em `src/lib/briefing.ts`,
    usar `toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })` para hora/minuto).
    Roda se `agora >= horario` configurado **e** `ultimo_run` não é de hoje (data SP).
    Isso dá idempotência diária — crítico para cobrança (emails) e notificação do briefing.
- `marcarExecucao(db, tipo)` — update `ultimo_run = now()`.

## T3 — Dispatcher no `vercel.json`

Trocar os 5 crons por **um** dispatcher de meia em meia hora:

```json
{ "crons": [ { "path": "/api/v1/cron/dispatch", "schedule": "*/30 * * * *" } ] }
```

Nova rota `src/app/api/v1/cron/dispatch/route.ts` (GET, `Bearer CRON_SECRET`):
- Para cada um dos 5 tipos, chama `deveRodarAgora`; se sim, executa o job e `marcarExecucao`.
- **Não** chamar as rotas via fetch — importar e chamar a lógica:
  - `analytics_sync` → `sincronizarTodos` de `@/lib/analytics-sync` (conferir assinatura no arquivo).
  - `briefing` → `gerarBriefing` + `salvarBriefing` de `@/lib/briefing` + notificação se `novo`
    (copiar o miolo de `src/app/api/v1/briefing/run/route.ts`).
  - `asaas_import`, `alertas`, `cobranca` → o miolo dessas rotas está acoplado aos handlers;
    se extrair for invasivo, exceção: fazer `fetch` interno à própria rota GET com o header
    `Authorization: Bearer CRON_SECRET` (mesma origem via env `NEXT_PUBLIC_APP_URL`).
- Cada job em try/catch isolado — um falhar não derruba os outros. Resposta:
  `{ executados: [...], pulados: [{tipo, motivo}], falhas: [...] }`.
- Owner: primeiro usuário do auth via `listUsers` (padrão já usado em briefing/run e asaas/import).
- **Manter as 5 rotas antigas funcionando** (não deletar) — viram acionamento manual/debug.

## T4 — API de configuração

`src/app/api/v1/cron-settings/route.ts`:
- GET (sessão): lista os 5 registros.
- PATCH (sessão): body `{ tipo, ativo?, horario? }` — validar `tipo` contra a lista fixa
  e `horario` formato `HH:mm`. Atualizar `updated_at`.

## T5 — UI em Configurações

Nova seção **"Agendamentos"** dentro da aba **Automações** (componente
`src/components/configuracoes/AutomacaoEmail.tsx` — adicionar seção abaixo, ou criar
`Agendamentos.tsx` ao lado e renderizar junto). Não criar aba nova (já são 12).

Por job: nome, descrição, toggle ativo (padrão `Toggle` da página de configurações),
input `type="time"` (horário SP — deixar explícito no label "horário de Brasília"),
"último run" formatado (`toLocaleString('pt-BR')`) e badge ativo/inativo.
Salvar via PATCH com toast (`sonner`). Nota no rodapé: "O dispatcher verifica a cada
30 min — o job roda na primeira janela após o horário configurado."

## T6 — Integração com o resto

- **Aba Setup** (`src/lib/setup-checklist.ts`): atualizar o `detalhe`/`passos` do item
  `cron_secret` para citar o dispatcher único (não mais "sync 06:00, alertas 08:00...").
- **Gator**: em `src/lib/ia/tools.ts`, estender a tool `mapa_do_sistema` ou criar
  `listar_agendamentos` (preferir estender `prontidao_sistema`? não — criar tool simples
  `listar_agendamentos` que lê `cron_settings`, segue o padrão das tools de leitura).
- **system-map.ts**: linha CRONS vira "dispatcher */30min lê cron_settings (horários
  configuráveis em Configurações → Automações → Agendamentos)". Cuidado: `SYSTEM_MAP` é
  template literal — **não usar crase** dentro do texto.
- **changelog.ts**: nova entrada `0.11.0` no topo.

## T7 — Verificação

1. `npm run typecheck; echo EXIT=$?` → EXIT=0.
2. Dev parado → `npm run build` → exit 0.
3. Sem a migration aplicada: `curl` no dispatch com Bearer → todos os jobs rodam (fallback).
4. Entregar ao Lucas: migration `20260615_cron_settings.sql` para o SQL Editor.
5. Commit único: `feat: agendamentos configuraveis pela UI — dispatcher + cron_settings`
   terminando com `Co-Authored-By` do modelo.

---

## Backlog opcional (só se sobrar fôlego — itens independentes)

1. **Mensagem de boas-vindas configurável**: `MSG_BOASVINDAS` hardcoded em
   `src/app/(app)/clientes/novo/page.tsx` e texto similar no webhook-asaas. Já existe a
   biblioteca de mensagens WhatsApp do cliente — avaliar reusar de lá em vez de criar config nova.
2. **Filtro do briefing do cron**: hoje fixo em 'completo' — virar coluna em `cron_settings`
   ou preferência do usuário.
3. **Nichos sugeridos** (`NICHOS_SUGERIDOS` no form de cliente) → editável em Configurações → Operacional.
