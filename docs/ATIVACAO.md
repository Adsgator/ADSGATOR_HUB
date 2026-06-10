# Checklist de Ativação — AdsGator Hub

Cada seção lista o que configurar, onde e como verificar. Marque cada item quando concluído.

---

## 1. Pós-RLS — sanity check obrigatório (fazer primeiro)

Após aplicar `supabase/migrations/20260610_rls_owner_scoped.sql` no SQL Editor do Supabase:

- [ ] Curl anon retorna vazio: `curl "https://jymybemmnzgfzmslpmcr.supabase.co/rest/v1/clientes?select=id" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bXliZW1tbnpnZnptc2xwbWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzY5MzYsImV4cCI6MjA5NDk1MjkzNn0.BieTfTe0vJ8KEdhj_w2nDN-uOLKVflmHvW0Zj0FA0JE"` → `[]`
- [ ] Login no app → /clientes lista todos os clientes (prova que backfill funcionou)
- [ ] Criar novo cliente via /clientes/novo → aparece na lista (prova DEFAULT auth.uid())
- [ ] Adicionar lançamento em /financeiro → salva sem erro
- [ ] NotificationDrawer abre e exibe alertas normalmente
- [ ] Portal do cliente: `/portal/<token>` sem login → renderiza (usa service-role, independe de RLS)
- [ ] `/portal/token-invalido-curto` → tela "Link Inválido"

---

## 2. Google Ads + GA4

**Onde:** Vercel → Settings → Environment Variables

| Variável | Descrição |
|---|---|
| `GOOGLE_ADS_CLIENT_ID` | OAuth app client ID |
| `GOOGLE_ADS_CLIENT_SECRET` | OAuth app client secret |
| `GOOGLE_ADS_REFRESH_TOKEN` | OAuth refresh token |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Token de desenvolvedor da Google Ads API |
| `GOOGLE_ADS_MANAGER_ID` | MCC account ID (formato `123-456-7890`) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Caminho para o JSON da service account (GA4) |

**Por cliente** (SQL ou via UI se houver campo — verificar /clientes/[id]):
```sql
UPDATE clientes SET
  google_ads_customer_id = '123-456-7890',
  google_ads_enabled = true,
  ga4_property_id = '123456789',
  ga4_enabled = true
WHERE id = '<uuid>';
```

**Verificar:** Botão "Sincronizar" em /analytics → sem erro; tabela `analytics_snapshots` ganha linhas.

---

## 3. Email (Resend)

**Onde:** Vercel → Settings → Environment Variables

| Variável | Descrição |
|---|---|
| `RESEND_API_KEY` | API key do Resend (re_...) |
| `EMAIL_FROM` | Ex: `AdsGator <noreply@adsgator.com.br>` |
| `ALERT_EMAIL` | Email do operador para alertas críticos |

**Ligar automações** — Configurações → aba de automação (toggles em `automation_settings`):
- [ ] `email_relatorio_mensal` — email ao cliente quando relatório é gerado
- [ ] `email_cobranca_vencida` — régua D+7/D+15/D+30 ao cliente
- [ ] `email_alerta_critico` — resumo de alertas ao operador

**Verificar:** Gerar um relatório de teste → checar `email_logs` no banco (status = 'sent').

---

## 4. Crons Vercel

**Onde:** Vercel → Settings → Environment Variables

| Variável | Valor |
|---|---|
| `CRON_SECRET` | String secreta forte (mín. 32 chars) |

**Crons configurados** em `vercel.json`:
| Horário | Rota | Função |
|---|---|---|
| 06:00 diário | `/api/v1/analytics/sync` | Sync Google Ads + GA4 |
| 08:00 diário | `/api/v1/alertas/notificar` | Alertas críticos ao operador |
| 09:00 diário | `/api/v1/cobranca/run` | Régua de cobrança (emails D+7/15/30) |

**Verificar:** Vercel → Crons → ver execuções com status 200 no dia seguinte ao deploy.

---

## 5. Asaas — Produção e TEST_MODE=false

> ⚠️ Só fazer depois que todos os itens anteriores estiverem OK.

**Pré-requisitos:**
- [ ] Conta Asaas em modo produção (não Sandbox)
- [ ] `ASAAS_API_KEY` de produção em mãos
- [ ] Token de webhook gerado no painel Asaas

**Passos:**

1. **Supabase secrets** (via CLI ou Dashboard → Edge Functions → Secrets):
   ```bash
   supabase secrets set ASAAS_WEBHOOK_KEY=<token-do-painel-asaas> --project-ref jymybemmnzgfzmslpmcr
   ```

2. **Vercel env vars:**
   - `ASAAS_API_KEY` = chave de produção

3. **Painel Asaas** → Integrações → Webhooks:
   - URL: `https://<proj>.supabase.co/functions/v1/webhook-asaas`
   - Auth token: o mesmo valor de `ASAAS_WEBHOOK_KEY`
   - Eventos: `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `PAYMENT_DELETED`, `SUBSCRIPTION_*`

4. **Flip TEST_MODE:**
   - Editar `supabase/functions/_shared/test-mode.ts`: `TEST_MODE = false`
   - Deploy: `supabase functions deploy webhook-asaas --project-ref jymybemmnzgfzmslpmcr`

5. Seguir checklist completo em `docs/Arquivo/MODO_TESTE.md`.

6. **Verificar:** Enviar pagamento de teste via Asaas → confirmar que webhook chegou (sem `[🧪 TEST_MODE]` nos logs) e que `historico_acoes` registrou o evento.

---

## 6. Vertex AI (Chat + Morning Briefing)

**Onde:** Vercel → Settings → Environment Variables

| Variável | Descrição |
|---|---|
| `VERTEX_AI_PROJECT_ID` | ID do projeto GCP |
| `VERTEX_AI_LOCATION` | Ex: `us-central1` (padrão) |
| `VERTEX_AI_CREDENTIALS` | Caminho para JSON da service account GCP |

**Verificar:** Morning Briefing no dashboard carrega texto gerado; chat (/ia) responde.

---

## 7. Variáveis opcionais

| Variável | Padrão | Descrição |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://adsgator.com.br` | URL base para links nos emails |

---

## Referência rápida — todas as env vars

```
# Supabase (obrigatórias)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Ads
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_MANAGER_ID=

# Google Analytics 4
GOOGLE_APPLICATION_CREDENTIALS=

# Vertex AI
VERTEX_AI_PROJECT_ID=
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_CREDENTIALS=

# Asaas
ASAAS_API_KEY=
# ASAAS_WEBHOOK_KEY vai em Supabase secrets (Edge Function), não na Vercel

# Email
RESEND_API_KEY=
EMAIL_FROM=AdsGator <noreply@adsgator.com.br>
ALERT_EMAIL=

# Crons
CRON_SECRET=

# Opcional
NEXT_PUBLIC_APP_URL=https://adsgator.com.br
```
