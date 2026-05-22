# 🧪 MODO DE TESTE - ADSGATOR HUB

**Status:** ATIVO desde 22/05/2026  
**Responsável:** Sistema configurado para testes seguros

---

## ⚠️ CONFIGURAÇÃO ATUAL

O sistema está em **MODO DE TESTE**. Todas as integrações externas estão protegidas contra envios reais.

### O que está protegido:
- ✅ **WhatsApp:** Links de notificação apontam para número de teste
- ✅ **Emails:** Redirecionados para email de teste
- ✅ **Asaas Webhook:** Processa mas marca como teste
- ✅ **Régua de Cobrança:** Notificações marcadas como `[TESTE]`

---

## 🛠️ ARQUIVOS MODIFICADOS

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/webhook-asaas/index.ts` | `TEST_MODE = true` |
| `supabase/functions/regua-cobranca/index.ts` | `TEST_MODE = true` |
| `supabase/functions/_shared/test-mode.ts` | Configuração central |
| `supabase/seed_test_data.sql` | Dados de teste |

---

## 📝 PASSOS PARA CONFIGURAR SEUS DADOS DE TESTE

### 1. Configurar seu email e WhatsApp

Edite os arquivos das Edge Functions:

```typescript
// Em webhook-asaas/index.ts e regua-cobranca/index.ts
const TEST_CONFIG = {
  testEmail: 'SEU-EMAIL@gmail.com',      // ← ALTERAR
  testWhatsApp: '5511SEUNUMERO',          // ← ALTERAR COM DDD
  testPrefixo: '[TESTE]',
  verboseLogging: true,
};
```

### 2. Popular dados de teste no Supabase

Execute no SQL Editor do Supabase Dashboard:

```sql
-- Executar o arquivo seed_test_data.sql
\i supabase/seed_test_data.sql
```

Ou copie o conteúdo de `supabase/seed_test_data.sql` e execute.

### 3. Verificar dados criados

Após executar o seed, você terá:

| Tipo | Quantidade |
|------|------------|
| Clientes de teste | 8 |
| Assinaturas | 8 |
| Notificações | 3+ |
| Lançamentos financeiros | ~15 |

---

## 🔄 TESTANDO INTEGRAÇÕES

### Testar Webhook Asaas (modo sandbox)

1. No dashboard do Asaas, vá em **Desenvolvedor → Webhooks**
2. Configure a URL do webhook Supabase (veja abaixo)
3. Use o modo **Sandbox** do Asaas
4. Crie um pagamento de teste
5. Verifique os logs no Supabase (Edge Functions → Logs)

**URL do Webhook:**
```
https://[SEU_PROJETO].supabase.co/functions/v1/webhook-asaas
```

### Testar Régua de Cobrança

1. Execute manualmente via Supabase Dashboard:
   - Edge Functions → regua-cobranca → Invoke
2. Ou configure o cron (já configurado para 09:00 diário)
3. Verifique as notificações criadas no banco

### Testar Notificações WhatsApp

1. Clique em qualquer botão de ação WhatsApp
2. O link abrirá com seu número de teste
3. Envie a mensagem para si mesmo para validar o texto

---

## 📊 CLIENTES DE TESTE CRIADOS

| Nome | Status | Dias Atraso | Cenário de Teste |
|------|--------|-------------|------------------|
| [TESTE] Empório Digital | ativo | 0 | Cliente ideal, pagamento em dia |
| [TESTE] Construtora Horizonte | recebido | 0 | Novo cliente, onboarding |
| [TESTE] Clínica Bem Estar | congelado | 0 | Sem resposta há 48h |
| [TESTE] Restaurante Sabor & Arte | ativo | 7 | Alerta laranja D+7 |
| [TESTE] Auto Center Turbo | ativo | 15 | Quebra de contrato D+15 |
| [TESTE] Loja de Roupas Fashion | cancelado_debito | 35 | Cancelado por débito |
| [TESTE] Academia Fitness Pro | ativo | 5 | Inadimplente leve |
| [TESTE] Agência de Viagens Mundo | standby | 0 | Pausado/standby |

---

## 🔴 PARA VOLTAR AO MODO PRODUÇÃO

**ATENÇÃO:** Só execute quando estiver pronto para envios reais!

### Passo 1: Desativar modo de teste nas Edge Functions

```typescript
// webhook-asaas/index.ts
const TEST_MODE = false; // ← ALTERAR DE true PARA false

// regua-cobranca/index.ts  
const TEST_MODE = false; // ← ALTERAR DE true PARA false
```

### Passo 2: Deploy das Edge Functions

```bash
cd supabase/functions
supabase functions deploy webhook-asaas
supabase functions deploy regua-cobranca
```

### Passo 3: Limpar dados de teste (opcional)

```sql
-- CUIDADO: Isso remove todos os dados de teste
DELETE FROM notificacoes WHERE cliente_id IN (SELECT id FROM clientes WHERE nome LIKE '%[TESTE]%');
DELETE FROM historico_acoes WHERE cliente_id IN (SELECT id FROM clientes WHERE nome LIKE '%[TESTE]%');
DELETE FROM estagios WHERE cliente_id IN (SELECT id FROM clientes WHERE nome LIKE '%[TESTE]%');
DELETE FROM assinaturas WHERE cliente_id IN (SELECT id FROM clientes WHERE nome LIKE '%[TESTE]%');
DELETE FROM financeiro_lancamentos WHERE cliente_id IN (SELECT id FROM clientes WHERE nome LIKE '%[TESTE]%');
DELETE FROM clientes WHERE nome LIKE '%[TESTE]%';
```

### Passo 4: Configurar Asaas Produção

1. No dashboard Asaas, desative o modo Sandbox
2. Atualize a chave API no `.env.local` para produção
3. Verifique se o webhook está apontando para produção

---

## 🐛 DEBUGGING

### Ver logs das Edge Functions

No Supabase Dashboard:
1. Edge Functions → Selecione a function
2. Logs → Ver execuções recentes

### Ver notificações criadas

```sql
SELECT * FROM notificacoes 
WHERE titulo LIKE '%[TESTE]%' 
ORDER BY created_at DESC;
```

### Ver histórico de ações

```sql
SELECT * FROM historico_acoes 
WHERE cliente_id IN (SELECT id FROM clientes WHERE nome LIKE '%[TESTE]%')
ORDER BY created_at DESC;
```

---

## ✅ CHECKLIST ANTES DE IR PARA PRODUÇÃO

- [ ] `TEST_MODE = false` em todas as Edge Functions
- [ ] Edge Functions deployadas
- [ ] Dados de teste removidos (ou mantidos apenas para demo)
- [ ] Asaas em modo produção (não sandbox)
- [ ] Webhook Asaas configurado com URL de produção
- [ ] Chaves API atualizadas para produção
- [ ] Email de teste removido das configurações
- [ ] WhatsApp de teste removido das configurações
- [ ] Teste de pagamento realizado com cartão de teste
- [ ] Notificação de teste enviada e recebida

---

## 📞 SUPORTE

Se encontrar problemas no modo de teste:
1. Verifique os logs das Edge Functions
2. Confirme que `TEST_MODE = true` está ativo
3. Valide que os dados de teste foram criados
4. Verifique se o email/WhatsApp de teste estão configurados

---

**Documento criado em:** 22/05/2026  
**Última atualização:** 22/05/2026  
**Próxima revisão:** Antes de migração para produção
