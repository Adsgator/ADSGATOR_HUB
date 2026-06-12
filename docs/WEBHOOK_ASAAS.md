# Webhook Asaas — Configuração e Eventos

> Atualizado em 11/06/2026. Fonte de verdade da integração Asaas → Hub.

## Configuração no painel do Asaas

| Campo | Valor |
|-------|-------|
| URL | `https://jymybemmnzgfzmslpmcr.supabase.co/functions/v1/webhook-asaas` |
| Token de autenticação | mesmo valor de `ASAAS_WEBHOOK_KEY` (env local + secret da edge function) |
| Formato | JSON (API v3) |

A edge function é deployada com `--no-verify-jwt` (o Asaas não envia JWT do
Supabase; a autenticação é pelo header `asaas-access-token`, validado na função).

```
npx supabase functions deploy webhook-asaas --no-verify-jwt --project-ref jymybemmnzgfzmslpmcr
```

Secrets necessários na função (`npx supabase secrets list`):
`ASAAS_WEBHOOK_KEY` (auth do webhook) e `ASAAS_API_KEY` (enriquecer dados do
customer ao criar cliente do checkout).

## Fluxo principal: cliente nasce no checkout

O cliente contrata no checkout → assinatura criada no Asaas → 1º pagamento
vence em **D+3** → o onboarding começa **antes** do pagamento. Por isso o
cliente é criado no Hub já no `SUBSCRIPTION_CREATED` (ou `PAYMENT_CREATED`,
o que chegar primeiro), com:

- cliente em status `recebido` (nicho `a_definir`, mrr = valor da assinatura)
- estágio de onboarding com checklist (#BOASVINDAS, coletar infos, call, confirmar 1º pagamento)
- notificação urgente com link de WhatsApp
- dados reais (nome/email/WhatsApp) buscados na API do Asaas

Idempotente por `asaas_subscription_id` — importar pelo modal antes não duplica.

## Compra única (ex: landing page)

O Hub espelha o Asaas por completo: pagamento **sem assinatura** também cria
cliente. No `PAYMENT_CREATED` avulso (cobrança gerada), o cliente nasce em
`recebido` com **MRR 0**, checklist de entrega (boas-vindas, coletar infos,
entregar projeto, **oferecer plano de manutenção**) e lançamento financeiro
`pendente` na categoria `projeto`. No `PAYMENT_RECEIVED` o lançamento vira
`confirmado`. Se o cliente depois assinar a manutenção, o fluxo de assinatura
reaproveita o mesmo cliente (dedupe por email) e o MRR passa a contar.

No **importador** (Configurações → Integrações), as compras únicas aparecem em
seção própria (cards azuis): cliente entra como `ativo` se o último pagamento
foi nos últimos 90 dias (entrega provavelmente em andamento) ou `inativo` se
for antigo (histórico).

## Eventos marcados no painel (e o que cada um faz no Hub)

### Cobranças
| Evento | Ação no Hub |
|--------|-------------|
| `PAYMENT_CREATED` | Garante cliente/assinatura (checkout) ou cliente de compra única + lançamento financeiro `pendente` |
| `PAYMENT_UPDATED` | Atualiza valor/vencimento do lançamento |
| `PAYMENT_CONFIRMED` | Lançamento → `confirmado` + notificação de pagamento confirmado |
| `PAYMENT_RECEIVED` | Zera atraso da assinatura, reativa cliente cancelado por débito; cria cliente se ainda não existir (assinatura ou compra única); confirma lançamento financeiro |
| `PAYMENT_OVERDUE` | Régua de inadimplência D+7/D+15/D+30 (status da assinatura, histórico, estágio de alerta) |
| `PAYMENT_DELETED` | Remove lançamento `pendente` |
| `PAYMENT_ANTICIPATED` | Histórico + notificação de antecipação da cobrança |
| `PAYMENT_BANK_SLIP_VIEWED` | Histórico "abriu o boleto"; se inadimplente, notificação de follow-up |
| `PAYMENT_CHECKOUT_VIEWED` | Histórico "abriu a fatura"; se inadimplente, notificação de follow-up |

### Assinaturas
| Evento | Ação no Hub |
|--------|-------------|
| `SUBSCRIPTION_CREATED` | **Cria cliente + assinatura + onboarding** (fluxo do checkout) |
| `SUBSCRIPTION_UPDATED` | Sincroniza valor da assinatura e MRR do cliente |
| `SUBSCRIPTION_INACTIVATED` | Assinatura → `cancelada` + notificação urgente |
| `SUBSCRIPTION_DELETED` | Assinatura → `deletada` + notificação urgente |

### Transferências
| Evento | Ação no Hub |
|--------|-------------|
| `TRANSFER_DONE` | Lançamento de saída no financeiro |

### Antecipações
| Evento | Ação no Hub |
|--------|-------------|
| `RECEIVABLE_ANTICIPATION_CREDITED` | Notificação de crédito disponível |
| `RECEIVABLE_ANTICIPATION_DENIED` | Notificação de antecipação negada |

### Pix Automático
Marcados no painel mas **sem handler** — a função responde 200 e ignora.
Inofensivo; tratáveis no futuro se o Pix Automático virar meio de cobrança
relevante.

| Evento (sem handler) |
|----------------------|
| `PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CREATED` |
| `PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED` |
| `PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CANCELLED` |
| `PIX_AUTOMATIC_RECURRING_AUTHORIZATION_EXPIRED` |
| `PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REFUSED` |

## Resiliência (12/06/2026)

- **Dedupe de eventos**: cada evento (`evt_...`) é registrado em
  `asaas_webhook_events`; reenvios/retries respondem 200 sem reprocessar.
  Migration: `20260612_webhook_events_dedupe.sql`.
- **Erro não derruba mais**: falha ao processar um evento responde **200**
  (evita espiral de retry → penalização), loga, remove o dedupe (permite
  "Reenviar" manual) e cria notificação urgente in-app para o operador.
- **Saúde do webhook monitorada**: o check do Asaas em `/api/status` também
  consulta `/v3/webhooks` — avisa se o webhook do Hub estiver ausente,
  desabilitado ou **interrompido** (fila pausada por falhas).
- **Estornos**: `PAYMENT_REFUNDED` cancela o lançamento financeiro e notifica.
  ⚠️ Marcar o evento `PAYMENT_REFUNDED` no painel do Asaas.

## Progressão de inadimplência (corrigida em 12/06/2026)

O `PAYMENT_OVERDUE` dispara **uma vez** (no vencimento) — sozinho ele nunca
levaria um cliente a D+7/D+15/D+30. A progressão diária é feita pelo cron de
cobrança (`GET /api/v1/cobranca/run`, 09:00): busca pagamentos `OVERDUE` no
Asaas, calcula dias desde o vencimento mais antigo por assinatura e atualiza
`assinaturas.dias_atraso/status` e `clientes.dias_atraso` (a UI lê do cliente).
Essa etapa roda **sempre**, mesmo com o email de cobrança desligado.

## Pendências relacionadas

- Migration `20260611_assinaturas_status_webhook.sql` precisa rodar no banco
  (adiciona `cancelada`/`deletada` ao CHECK de `assinaturas.status` — sem ela
  os handlers de inativação/deleção falham silenciosamente).
- **Checkout próprio** (página pública de contratação dentro do Hub, criando a
  assinatura via API do Asaas): planejado, discutir quando a integração atual
  estiver validada em produção.
