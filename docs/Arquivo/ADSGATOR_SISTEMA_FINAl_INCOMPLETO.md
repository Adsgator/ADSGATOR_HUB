# ADSGATOR — SISTEMA COMPLETO FINAL
## Implementação 100% do MVP ao SaaS Premium Operacional

**Data:** 21 de maio de 2026  
**Objetivo:** Sistema nervoso central da Adsgator — você abre, o sistema manda, você executa  
**Cobertura:** Banco → Edge Functions → Páginas → Componentes → Deploy

---

> **COMO USAR ESTE DOCUMENTO**
> Leia na ordem. Cada parte depende da anterior.  
> Copie cada bloco de código no arquivo indicado.  
> Siga o checklist ao final de cada parte antes de avançar.  
> **Não pule etapas. A ordem é cirúrgica.**

---

# PARTE 1 — BANCO DE DADOS COMPLETO (Supabase SQL)

Execute todo este SQL no **SQL Editor do Supabase**, na sequência exata.

## 1.1 — SCHEMA PRINCIPAL

```sql
-- ════════════════════════════════════════════════════════════════
-- ADSGATOR — DATABASE SCHEMA COMPLETO
-- Execute no Supabase SQL Editor
-- ════════════════════════════════════════════════════════════════

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ──────────────────────────────────────────────────────────────
-- TABELA: clientes
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados básicos
  nome            TEXT NOT NULL,
  email           TEXT,
  whatsapp        TEXT,           -- formato: 5531999999999
  nicho           TEXT,           -- adestramento | nutricao | trafego | etc
  dominio         TEXT,           -- URL do site
  
  -- Status operacional
  status          TEXT NOT NULL DEFAULT 'recebido'
                  CHECK (status IN (
                    'recebido',
                    'onboarding',
                    'setup_trafego',
                    'ativo',
                    'congelado',
                    'cancelado_debito',
                    'cancelado'
                  )),
  
  -- Financeiro
  mrr             DECIMAL(10,2) DEFAULT 0,
  plano           TEXT,           -- basico | profissional | premium
  asaas_id        TEXT UNIQUE,    -- ID do cliente no Asaas
  dias_atraso     INTEGER DEFAULT 0,
  data_vencimento DATE,
  
  -- Google Ads
  google_ads_id   TEXT,
  saldo_google    DECIMAL(10,2),
  
  -- Controle
  congelado_em    TIMESTAMP WITH TIME ZONE,
  alerta_48h_em   TIMESTAMP WITH TIME ZONE,  -- quando disparar alerta de congelamento
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: estagios
-- Guia a ÚNICA ação prioritária de cada cliente
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS estagios (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id      UUID REFERENCES clientes(id) ON DELETE CASCADE,
  
  nome            TEXT NOT NULL,  -- recebido | onboarding | setup_trafego | ativo
  descricao       TEXT,           -- "Enviar #BOASVINDAS agora"
  acao_label      TEXT,           -- texto do botão de ação
  acao_url        TEXT,           -- URL pré-preenchida (WhatsApp, etc)
  checklist       JSONB,          -- [{"item": "Criar conta GA4", "done": false}]
  
  ativo           BOOLEAN DEFAULT true,
  concluido_em    TIMESTAMP WITH TIME ZONE,
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: financeiro_lancamentos
-- DRE + Cash Flow
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS financeiro_lancamentos (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id      UUID REFERENCES clientes(id) ON DELETE SET NULL,
  
  tipo            TEXT NOT NULL CHECK (tipo IN ('receita', 'custo_fixo', 'custo_variavel')),
  categoria       TEXT,           -- software | salario | ads | infraestrutura
  descricao       TEXT NOT NULL,
  valor           DECIMAL(10,2) NOT NULL,
  data            DATE NOT NULL,
  
  -- Asaas
  asaas_payment_id TEXT UNIQUE,
  status          TEXT DEFAULT 'confirmado' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: analytics_snapshots
-- Cache dos dados do Google Ads + GA4
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id      UUID REFERENCES clientes(id) ON DELETE CASCADE,
  
  fonte           TEXT NOT NULL CHECK (fonte IN ('google_ads', 'ga4')),
  periodo_inicio  DATE NOT NULL,
  periodo_fim     DATE NOT NULL,
  
  -- Métricas Google Ads
  investimento    DECIMAL(10,2),
  impressoes      INTEGER,
  cliques         INTEGER,
  ctr             DECIMAL(5,4),   -- ex: 0.0320 = 3.2%
  conversoes      DECIMAL(10,2),  -- aceita 0.5 (atribuição data-driven)
  cpa             DECIMAL(10,2),
  roas            DECIMAL(10,4),
  
  -- Métricas GA4
  usuarios        INTEGER,
  sessoes         INTEGER,
  taxa_conversao  DECIMAL(5,4),
  
  -- IA Insights (gerado pelo Vertex AI)
  insight_ia      TEXT,
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: audit_logs
-- Histórico imutável de todas as ações
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id),
  
  acao            TEXT NOT NULL,  -- criou_cliente | alterou_status | congelou | etc
  tabela          TEXT,
  registro_id     UUID,
  dados_antes     JSONB,
  dados_depois    JSONB,
  descricao       TEXT,           -- "Status alterado de recebido para onboarding"
  
  ip_address      INET,
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: notificacoes
-- Central de notificações in-app
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notificacoes (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id      UUID REFERENCES clientes(id) ON DELETE CASCADE,
  
  tipo            TEXT NOT NULL CHECK (tipo IN ('urgente', 'atencao', 'info', 'sucesso')),
  titulo          TEXT NOT NULL,
  mensagem        TEXT,
  acao_label      TEXT,
  acao_url        TEXT,
  
  lida            BOOLEAN DEFAULT false,
  lida_em         TIMESTAMP WITH TIME ZONE,
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: relatorios
-- Relatórios gerados (export .md)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS relatorios (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id      UUID REFERENCES clientes(id) ON DELETE SET NULL,
  
  tipo            TEXT NOT NULL,  -- analytics | financeiro | manifesto_landing
  titulo          TEXT NOT NULL,
  conteudo_md     TEXT,           -- markdown completo do relatório
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABELA: componentes_biblioteca
-- Biblioteca de componentes Astro
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS componentes_biblioteca (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  categoria       TEXT NOT NULL,  -- navegacao | hero | servicos | depoimentos | rodape
  nome            TEXT NOT NULL,  -- Hero_01 | Beneficios_02 | etc
  descricao       TEXT,
  preview_url     TEXT,
  codigo_astro    TEXT,           -- código do componente .astro
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 1.2 — ÍNDICES (Performance)

```sql
-- Índices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_clientes_status        ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id       ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_dias_atraso   ON clientes(dias_atraso);
CREATE INDEX IF NOT EXISTS idx_estagios_cliente_id    ON estagios(cliente_id);
CREATE INDEX IF NOT EXISTS idx_estagios_ativo         ON estagios(ativo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_lida ON notificacoes(user_id, lida);
CREATE INDEX IF NOT EXISTS idx_audit_logs_registro    ON audit_logs(registro_id);
CREATE INDEX IF NOT EXISTS idx_analytics_cliente_data ON analytics_snapshots(cliente_id, periodo_fim);
CREATE INDEX IF NOT EXISTS idx_financeiro_data        ON financeiro_lancamentos(data);
```

## 1.3 — TRIGGERS (Automação)

```sql
-- ── Atualiza updated_at automaticamente ──────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Audit log automático nos clientes ────────────────────────
CREATE OR REPLACE FUNCTION log_cliente_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, acao, tabela, registro_id, dados_antes, dados_depois, descricao)
  VALUES (
    auth.uid(),
    CASE TG_OP
      WHEN 'INSERT' THEN 'criou_cliente'
      WHEN 'UPDATE' THEN 'alterou_cliente'
      WHEN 'DELETE' THEN 'deletou_cliente'
    END,
    'clientes',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'Cliente criado: ' || NEW.nome
      WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status
        THEN 'Status alterado de ' || OLD.status || ' para ' || NEW.status
      ELSE 'Cliente atualizado: ' || NEW.nome
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_audit_clientes
  AFTER INSERT OR UPDATE OR DELETE ON clientes
  FOR EACH ROW EXECUTE FUNCTION log_cliente_change();

-- ── Alerta 48h quando congelado ──────────────────────────────
CREATE OR REPLACE FUNCTION set_alerta_congelamento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'congelado' AND OLD.status != 'congelado' THEN
    NEW.congelado_em     = NOW();
    NEW.alerta_48h_em    = NOW() + INTERVAL '48 hours';
  END IF;
  IF NEW.status != 'congelado' AND OLD.status = 'congelado' THEN
    NEW.congelado_em     = NULL;
    NEW.alerta_48h_em    = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_congelamento
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION set_alerta_congelamento();

-- ── Notificação automática quando novo cliente chega ─────────
CREATE OR REPLACE FUNCTION notificar_novo_cliente()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notificacoes (user_id, cliente_id, tipo, titulo, mensagem, acao_label, acao_url)
    VALUES (
      NEW.user_id,
      NEW.id,
      'urgente',
      'Novo cliente recebido!',
      NEW.nome || ' (' || COALESCE(NEW.nicho, 'sem nicho') || ') aguarda ação imediata.',
      'Enviar #BOASVINDAS',
      'https://wa.me/' || COALESCE(NEW.whatsapp, '') || '?text=' || encode('Olá! Seja bem-vindo(a) à Adsgator! 🎉', 'escape')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notificar_novo_cliente
  AFTER INSERT ON clientes
  FOR EACH ROW EXECUTE FUNCTION notificar_novo_cliente();
```

## 1.4 — ROW LEVEL SECURITY

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE clientes                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE estagios                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_lancamentos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios                ENABLE ROW LEVEL SECURITY;
ALTER TABLE componentes_biblioteca    ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário só vê seus próprios dados
CREATE POLICY "owner_clientes"             ON clientes                USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "owner_lancamentos"          ON financeiro_lancamentos  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "owner_notificacoes"         ON notificacoes            USING (user_id = auth.uid());
CREATE POLICY "owner_relatorios"           ON relatorios              USING (user_id = auth.uid());
CREATE POLICY "owner_biblioteca"           ON componentes_biblioteca  USING (user_id = auth.uid());
CREATE POLICY "owner_audit"               ON audit_logs              USING (user_id = auth.uid());

-- Estagios via cliente
CREATE POLICY "owner_estagios" ON estagios
  USING (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));

-- Analytics via cliente
CREATE POLICY "owner_analytics" ON analytics_snapshots
  USING (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));

-- View computada para MRR (somente leitura)
CREATE OR REPLACE VIEW mrr_atual AS
SELECT
  user_id,
  SUM(valor) as mrr,
  COUNT(DISTINCT cliente_id) as clientes_pagantes,
  AVG(valor) as ticket_medio
FROM financeiro_lancamentos
WHERE
  tipo = 'receita'
  AND status = 'confirmado'
  AND data >= date_trunc('month', CURRENT_DATE)
  AND data < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY user_id;
```

## 1.5 — DADOS DE EXEMPLO (Seed para desenvolvimento)

```sql
-- Rode apenas em ambiente de DEV para testar o sistema
-- Substitua 'SEU_USER_ID' pelo UUID do seu usuário Supabase (auth.users)

DO $$
DECLARE
  uid UUID := 'SEU_USER_ID'; -- Troque pelo seu auth.uid()
  c1  UUID; c2 UUID; c3 UUID; c4 UUID; c5 UUID;
BEGIN

INSERT INTO clientes (user_id, nome, email, whatsapp, nicho, status, mrr, dias_atraso, plano)
VALUES
  (uid, 'Beatriz Alves',     'bea@email.com',   '5531911111111', 'adestramento',  'congelado',    1500.00, 0,  'profissional'),
  (uid, 'Ana Julia',         'ana@email.com',   '5531922222222', 'nutricao',      'ativo',         2800.00, 15, 'premium'),
  (uid, 'Gabriel Costa',     'gab@email.com',   '5531933333333', 'trafego',       'ativo',         1800.00, 0,  'profissional'),
  (uid, 'Paulo Bernard',     'pau@email.com',   '5531944444444', 'adestramento',  'onboarding',   1500.00, 0,  'basico'),
  (uid, 'Julia Martins',     'jul@email.com',   '5531955555555', 'adestramento',  'recebido',     0,       0,  NULL)
RETURNING id INTO c1;

-- Buscar IDs criados
SELECT id INTO c1 FROM clientes WHERE nome = 'Beatriz Alves'  AND user_id = uid;
SELECT id INTO c2 FROM clientes WHERE nome = 'Ana Julia'      AND user_id = uid;
SELECT id INTO c3 FROM clientes WHERE nome = 'Gabriel Costa'  AND user_id = uid;
SELECT id INTO c4 FROM clientes WHERE nome = 'Paulo Bernard'  AND user_id = uid;
SELECT id INTO c5 FROM clientes WHERE nome = 'Julia Martins'  AND user_id = uid;

-- Estágios
INSERT INTO estagios (cliente_id, nome, descricao, acao_label, acao_url)
VALUES
  (c1, 'congelado',     'Aguardando fotos de produto — 4 dias', 'Lembrete WhatsApp', 'https://wa.me/5531911111111?text=Oi+Beatriz%2C+precisamos+das+suas+fotos+para+continuar+o+setup!'),
  (c2, 'ativo',         'Pagamento atrasado 15 dias — Enviar notificação de quebra', '#COBRANÇA', 'https://wa.me/5531922222222?text=Ana+Julia%2C+seu+pagamento+está+em+atraso.'),
  (c3, 'ativo',         'CPA subiu 23% — Revisar keywords e bids', 'Ver Analytics', '/analytics'),
  (c4, 'onboarding',   'Setup GA4 pendente — Enviar convite', '#CONVITE', 'https://wa.me/5531944444444?text=Paulo%2C+seu+GA4+precisa+ser+configurado.'),
  (c5, 'recebido',     'Novo cliente — Enviar boas-vindas agora', '#BOASVINDAS', 'https://wa.me/5531955555555?text=Olá+Julia%21+Seja+bem-vinda+à+Adsgator+%F0%9F%8E%89');

-- Lançamentos financeiros
INSERT INTO financeiro_lancamentos (user_id, cliente_id, tipo, categoria, descricao, valor, data, status)
VALUES
  (uid, c1, 'receita',        'mensalidade',  'Mensalidade Beatriz',       1500.00, CURRENT_DATE - 5,  'confirmado'),
  (uid, c2, 'receita',        'mensalidade',  'Mensalidade Ana Julia',      2800.00, CURRENT_DATE - 12, 'confirmado'),
  (uid, c3, 'receita',        'mensalidade',  'Mensalidade Gabriel',        1800.00, CURRENT_DATE - 3,  'confirmado'),
  (uid, NULL,'custo_fixo',   'software',     'Supabase Pro',               -120.00, CURRENT_DATE - 1,  'confirmado'),
  (uid, NULL,'custo_fixo',   'software',     'Google Workspace',           -80.00,  CURRENT_DATE - 1,  'confirmado'),
  (uid, NULL,'custo_variavel','infraestrutura','VPS & CDN',                -200.00, CURRENT_DATE - 1,  'confirmado');

END $$;
```

**Checklist Parte 1:**
```
[ ] SQL executado sem erros no Supabase
[ ] Tabelas visíveis no Table Editor
[ ] RLS habilitado (ícone de cadeado nas tabelas)
[ ] Dados seed inseridos (verificar em clientes)
```

---

# PARTE 2 — EDGE FUNCTIONS (Automação e Webhooks)

Crie cada função no Supabase Dashboard → Edge Functions → New Function.

## 2.1 — Webhook Asaas (Pagamentos)

```typescript
// supabase/functions/webhook-asaas/index.ts
// Endpoint: POST /functions/v1/webhook-asaas

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  const payload = await req.json()
  const { event, payment } = payload

  // Pagamento confirmado → criar/atualizar cliente
  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    const { customer, value, dueDate, id: asaasPaymentId } = payment

    // Verificar se cliente já existe
    const { data: clienteExistente } = await supabase
      .from('clientes')
      .select('id, status, user_id')
      .eq('asaas_id', customer.id)
      .single()

    if (clienteExistente) {
      // Atualizar: zerar atraso, atualizar MRR
      await supabase
        .from('clientes')
        .update({ dias_atraso: 0, mrr: value, data_vencimento: dueDate })
        .eq('id', clienteExistente.id)

      // Registrar lançamento
      await supabase.from('financeiro_lancamentos').insert({
        user_id:          clienteExistente.user_id,
        cliente_id:       clienteExistente.id,
        tipo:             'receita',
        categoria:        'mensalidade',
        descricao:        `Pagamento confirmado — ${customer.name}`,
        valor:            value,
        data:             new Date().toISOString().split('T')[0],
        asaas_payment_id: asaasPaymentId,
        status:           'confirmado',
      })
    } else {
      // NOVO CLIENTE — criar automaticamente com status recebido
      // Buscar user_id do admin (sistema mono-tenant por ora)
      const { data: adminUser } = await supabase
        .from('auth.users')
        .select('id')
        .limit(1)
        .single()

      const { data: novoCliente } = await supabase
        .from('clientes')
        .insert({
          user_id:         adminUser?.id,
          nome:            customer.name,
          email:           customer.email,
          whatsapp:        customer.mobilePhone?.replace(/\D/g, ''),
          asaas_id:        customer.id,
          status:          'recebido',
          mrr:             value,
          data_vencimento: dueDate,
        })
        .select()
        .single()

      // Criar estágio inicial
      if (novoCliente) {
        await supabase.from('estagios').insert({
          cliente_id:  novoCliente.id,
          nome:        'recebido',
          descricao:   'Novo cliente — enviar #BOASVINDAS agora',
          acao_label:  '#BOASVINDAS',
          acao_url:    `https://wa.me/${novoCliente.whatsapp?.replace(/\D/g,'')}?text=${encodeURIComponent('Olá! Seja bem-vindo(a) à Adsgator! 🎉 Vou entrar em contato em breve para iniciar seu onboarding.')}`,
          checklist: JSON.stringify([
            { item: 'Enviar mensagem #BOASVINDAS no WhatsApp', done: false },
            { item: 'Criar ficha do cliente no sistema', done: false },
            { item: 'Agendar call de onboarding', done: false },
          ])
        })
      }
    }
  }

  // Pagamento atrasado
  if (event === 'PAYMENT_OVERDUE') {
    const { customer, daysOverdue } = payment

    await supabase
      .from('clientes')
      .update({ dias_atraso: daysOverdue })
      .eq('asaas_id', customer.id)
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

## 2.2 — Cron: Régua de Cobrança (D+7, D+15, D+30)

```typescript
// supabase/functions/regua-cobranca/index.ts
// Agendar no Supabase: todo dia às 09:00
// cron: '0 9 * * *'

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async () => {
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*, estagios(*)')
    .gt('dias_atraso', 0)
    .neq('status', 'cancelado')
    .neq('status', 'cancelado_debito')

  for (const cliente of clientes ?? []) {
    const dias = cliente.dias_atraso

    // D+7 — Alerta laranja: suspensão iminente
    if (dias >= 7 && dias < 15) {
      await supabase.from('notificacoes').insert({
        user_id:    cliente.user_id,
        cliente_id: cliente.id,
        tipo:       'atencao',
        titulo:     `${cliente.nome} — ${dias} dias em atraso`,
        mensagem:   'Campanha em risco de suspensão. Envie alerta ao cliente.',
        acao_label: '#ALERTA D+7',
        acao_url:   `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}! Seu pagamento está em atraso há ${dias} dias. As campanhas serão suspensas em breve.`)}`,
      })
    }

    // D+15 — Alerta vermelho: quebra de contrato
    if (dias >= 15 && dias < 30) {
      await supabase.from('notificacoes').insert({
        user_id:    cliente.user_id,
        cliente_id: cliente.id,
        tipo:       'urgente',
        titulo:     `${cliente.nome} — QUEBRA DE CONTRATO iminente`,
        mensagem:   `${dias} dias sem pagamento. Envie notificação formal de rescisão.`,
        acao_label: '#QUEBRA CONTRATO',
        acao_url:   `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}. Em razão do atraso de ${dias} dias, estamos comunicando a rescisão contratual conforme cláusula 8.`)}`,
      })
    }

    // D+30 — Cancelamento automático
    if (dias >= 30) {
      await supabase
        .from('clientes')
        .update({ status: 'cancelado_debito' })
        .eq('id', cliente.id)

      await supabase.from('notificacoes').insert({
        user_id:    cliente.user_id,
        cliente_id: cliente.id,
        tipo:       'urgente',
        titulo:     `${cliente.nome} — CANCELADO por débito`,
        mensagem:   'Status alterado para cancelado_debito. Remover landing page e ativos do Storage.',
        acao_label: 'Ver cliente',
        acao_url:   `/clientes/${cliente.id}`,
      })

      await supabase.from('audit_logs').insert({
        user_id:      cliente.user_id,
        acao:         'cancelamento_automatico_debito',
        tabela:       'clientes',
        registro_id:  cliente.id,
        descricao:    `Cancelamento automático após ${dias} dias de atraso`,
      })
    }
  }

  // Alerta 48h para clientes congelados
  const { data: congelados } = await supabase
    .from('clientes')
    .select('*')
    .eq('status', 'congelado')
    .lte('alerta_48h_em', new Date().toISOString())

  for (const cliente of congelados ?? []) {
    await supabase.from('notificacoes').insert({
      user_id:    cliente.user_id,
      cliente_id: cliente.id,
      tipo:       'atencao',
      titulo:     `${cliente.nome} — Congelado há 48h`,
      mensagem:   'Cliente retido sem resposta há 48 horas. Enviar lembrete.',
      acao_label: 'Lembrete WhatsApp',
      acao_url:   `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}! Ainda aguardamos seu retorno para continuar.`)}`,
    })

    // Resetar timer para não disparar novamente até próximas 48h
    await supabase
      .from('clientes')
      .update({ alerta_48h_em: new Date(Date.now() + 48*60*60*1000).toISOString() })
      .eq('id', cliente.id)
  }

  return new Response(JSON.stringify({ ok: true, processados: clientes?.length ?? 0 }))
})
```

## 2.3 — Gerador de Insight IA (Vertex AI / Gemini)

```typescript
// supabase/functions/gerar-insight-ia/index.ts
// POST /functions/v1/gerar-insight-ia
// Body: { cliente_id, snapshot_id }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  const { cliente_id, snapshot_id } = await req.json()

  // Buscar dados do snapshot
  const { data: snap } = await supabase
    .from('analytics_snapshots')
    .select('*, clientes(nome, nicho)')
    .eq('id', snapshot_id)
    .single()

  if (!snap) return new Response('Snapshot não encontrado', { status: 404 })

  // Buscar histórico dos últimos 4 snapshots para comparação
  const { data: historico } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('cliente_id', cliente_id)
    .order('periodo_fim', { ascending: false })
    .limit(4)

  // Prompt para Gemini / Vertex AI
  const prompt = `
Você é o analista de tráfego pago da agência Adsgator.
Analise os dados de Google Ads abaixo e gere um insight conciso (máximo 3 frases) 
em português, identificando o principal problema ou oportunidade.

REGRA CRÍTICA: Conversões fracionadas (ex: 0.5, 1.5) são CORRETAS — são resultado da 
atribuição data-driven do Google. Nunca sinalize como erro.

Cliente: ${snap.clientes?.nome} (${snap.clientes?.nicho})
Período: ${snap.periodo_inicio} a ${snap.periodo_fim}

DADOS ATUAIS:
- Investimento: R$ ${snap.investimento}
- Cliques: ${snap.cliques}
- CTR: ${(snap.ctr * 100).toFixed(2)}%
- Conversões: ${snap.conversoes}
- CPA: R$ ${snap.cpa}

HISTÓRICO (últimas semanas):
${historico?.map(h => `- CPA: R$ ${h.cpa}, CTR: ${(h.ctr*100).toFixed(1)}%, Conv: ${h.conversoes}`).join('\n')}

Gere o insight focando em: o que está bom, o que precisa atenção, e qual ação tomar.
`

  // Chamar Vertex AI (Gemini 1.5 Pro)
  const vertexResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 200, temperature: 0.3 },
      })
    }
  )

  const vertexData = await vertexResponse.json()
  const insight = vertexData?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Insight não disponível'

  // Salvar no snapshot
  await supabase
    .from('analytics_snapshots')
    .update({ insight_ia: insight })
    .eq('id', snapshot_id)

  return new Response(JSON.stringify({ insight }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

## 2.4 — Gerador de Relatório Markdown

```typescript
// supabase/functions/gerar-relatorio-md/index.ts
// POST /functions/v1/gerar-relatorio-md
// Body: { cliente_id, tipo: 'analytics' | 'manifesto_landing', dados }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  const { cliente_id, tipo, dados, user_id } = await req.json()

  const { data: cliente } = await supabase
    .from('clientes').select('*').eq('id', cliente_id).single()

  let conteudo = ''

  if (tipo === 'analytics') {
    const snap = dados
    conteudo = `# Relatório de Performance — ${cliente?.nome}
**Período:** ${snap.periodo_inicio} a ${snap.periodo_fim}
**Gerado em:** ${new Date().toLocaleDateString('pt-BR')}
**Nicho:** ${cliente?.nicho}

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Investimento | R$ ${snap.investimento?.toLocaleString('pt-BR')} |
| Cliques | ${snap.cliques?.toLocaleString('pt-BR')} |
| CTR | ${(snap.ctr * 100).toFixed(2)}% |
| Conversões | ${snap.conversoes} |
| CPA | R$ ${snap.cpa?.toFixed(2)} |

## Insight da IA

${snap.insight_ia ?? 'Execute a análise de IA para gerar insights.'}

## Ações Recomendadas

- [ ] Revisar palavras-chave com CPC acima da média
- [ ] Verificar qualidade dos anúncios (CTR < 2% = rever copy)
- [ ] Confirmar rastreamento de conversões no GA4

---
*Relatório gerado automaticamente pela Adsgator*`
  }

  if (tipo === 'manifesto_landing') {
    const { nicho, paleta, blocos, copy_estrategico } = dados
    conteudo = `# Manifesto de Produção — Landing Page
**Cliente:** ${cliente?.nome}
**Nicho:** ${nicho}
**Gerado em:** ${new Date().toLocaleDateString('pt-BR')}

---

## Contexto Estratégico

- **Nicho:** ${nicho}
- **Paleta de cores:** ${paleta?.join(', ')}
- **Estilo visual:** Minimalista premium, inspirado em marcas de autoridade
- **Tom de voz:** Direto, sem rodeios, focado em resultado

---

## Estrutura de Blocos Astro

\`\`\`
${blocos?.map((b: string, i: number) => `${i + 1}. ${b}`).join('\n')}
\`\`\`

---

## Copy por Bloco

${copy_estrategico ?? 'Copy a ser definido com base no briefing.'}

---

## Instruções para o Cursor/Roo Code

- Use SOMENTE rem para espaçamentos e tamanhos. Nunca px.
- Ícones: Lucide React, stroke-width 1.5, sempre vazados.
- Bordas: finas, zinc-800 no dark.
- Respeite a estrutura de blocos na ordem exata acima.
- Cor de destaque: ${paleta?.[0] ?? '#FFA500'}

---
*Manifesto gerado pela Adsgator. Insira este arquivo como contexto no Cursor.*`
  }

  // Salvar relatório
  const { data: relatorio } = await supabase
    .from('relatorios')
    .insert({
      user_id,
      cliente_id,
      tipo,
      titulo: `${tipo === 'analytics' ? 'Relatório Analytics' : 'Manifesto Landing'} — ${cliente?.nome}`,
      conteudo_md: conteudo,
    })
    .select()
    .single()

  return new Response(JSON.stringify({ relatorio, conteudo }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Checklist Parte 2:**
```
[ ] Função webhook-asaas criada e URL configurada no painel Asaas
[ ] Função regua-cobranca criada e cron configurado (09:00 diário)
[ ] Função gerar-insight-ia criada com GEMINI_API_KEY no env
[ ] Função gerar-relatorio-md criada
[ ] Variáveis de ambiente configuradas no Supabase
```

---

# PARTE 3 — TIPOS TYPESCRIPT (lib/types.ts)

```typescript
// lib/types.ts
export type ClienteStatus =
  | 'recebido'
  | 'onboarding'
  | 'setup_trafego'
  | 'ativo'
  | 'congelado'
  | 'cancelado_debito'
  | 'cancelado'

export interface Cliente {
  id:              string
  user_id:         string
  nome:            string
  email?:          string
  whatsapp?:       string
  nicho?:          string
  dominio?:        string
  status:          ClienteStatus
  mrr?:            number
  plano?:          string
  asaas_id?:       string
  dias_atraso:     number
  data_vencimento?: string
  google_ads_id?:  string
  saldo_google?:   number
  congelado_em?:   string
  created_at:      string
  updated_at:      string
}

export interface Estagio {
  id:           string
  cliente_id:   string
  nome:         string
  descricao?:   string
  acao_label?:  string
  acao_url?:    string
  checklist?:   ChecklistItem[]
  ativo:        boolean
  concluido_em?: string
  created_at:   string
}

export interface ChecklistItem {
  item: string
  done: boolean
}

export interface Notificacao {
  id:           string
  user_id:      string
  cliente_id?:  string
  tipo:         'urgente' | 'atencao' | 'info' | 'sucesso'
  titulo:       string
  mensagem?:    string
  acao_label?:  string
  acao_url?:    string
  lida:         boolean
  lida_em?:     string
  created_at:   string
}

export interface AnalyticsSnapshot {
  id:             string
  cliente_id:     string
  fonte:          'google_ads' | 'ga4'
  periodo_inicio: string
  periodo_fim:    string
  investimento?:  number
  impressoes?:    number
  cliques?:       number
  ctr?:           number
  conversoes?:    number  // aceita decimais: 0.5, 1.5 — CORRETO por data-driven
  cpa?:           number
  roas?:          number
  usuarios?:      number
  sessoes?:       number
  taxa_conversao?: number
  insight_ia?:    string
  created_at:     string
}

export interface FinanceiroLancamento {
  id:           string
  user_id:      string
  cliente_id?:  string
  tipo:         'receita' | 'custo_fixo' | 'custo_variavel'
  categoria?:   string
  descricao:    string
  valor:        number
  data:         string
  status:       'pendente' | 'confirmado' | 'cancelado'
  created_at:   string
}

export interface Relatorio {
  id:          string
  user_id:     string
  cliente_id?: string
  tipo:        string
  titulo:      string
  conteudo_md: string
  created_at:  string
}
```

---

# PARTE 4 — PÁGINAS COMPLETAS

## 4.1 — Página de Clientes (app/clientes/page.tsx)

```tsx
// app/clientes/page.tsx
'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { MainLayout }       from '@/components/layout/MainLayout'
import { ClienteProgressCard } from '@/components/dashboard/ClienteProgressCard'
import { useClientes }      from '@/lib/hooks/useClientes'
import { congelarCliente }  from '@/lib/database'

const STATUS_FILTROS = [
  { key: null,              label: 'Todos'       },
  { key: 'recebido',        label: 'Recebidos'   },
  { key: 'onboarding',      label: 'Onboarding'  },
  { key: 'setup_trafego',   label: 'Setup'       },
  { key: 'ativo',           label: 'Ativos'      },
  { key: 'congelado',       label: 'Retidos'     },
  { key: 'cancelado_debito',label: 'Inadimplente'},
]

export default function ClientesPage() {
  const { dados, loading, metricas, recarregar } = useClientes()
  const [filtro, setFiltro]   = useState<string | null>(null)
  const [busca,  setBusca]    = useState('')

  const filtrados = useMemo(() => {
    return dados.filter(({ cliente }) => {
      const matchFiltro = filtro ? cliente.status === filtro : true
      const matchBusca  = busca
        ? cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
          (cliente.nicho ?? '').toLowerCase().includes(busca.toLowerCase())
        : true
      return matchFiltro && matchBusca
    })
  }, [dados, filtro, busca])

  async function handleCongelar(id: string) {
    await congelarCliente(id).catch(console.error)
    recarregar()
  }

  const topBarActions = (
    <a
      href="/clientes/novo"
      className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors"
    >
      <Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
      Novo Cliente
    </a>
  )

  return (
    <MainLayout title="Clientes" subtitle={`${metricas.total} clientes`} actions={topBarActions}>

      {/* ── BUSCA + FILTROS ──────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-[0.75rem] mb-[1.5rem]">
        <div className="relative flex-1">
          <Search className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por nome ou nicho..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full h-[2.25rem] pl-[2.25rem] pr-[0.75rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-primary text-[0.875rem] placeholder:text-ink-muted focus:outline-none focus:border-ads-500/50 transition-colors"
          />
        </div>

        <div className="flex gap-[0.25rem] flex-wrap">
          {STATUS_FILTROS.map(({ key, label }) => (
            <button
              key={String(key)}
              onClick={() => setFiltro(key)}
              className={`
                h-[2.25rem] px-[0.75rem] rounded-[0.375rem] text-[0.8125rem] font-medium transition-colors
                ${filtro === key
                  ? 'bg-ads-500/15 text-ads-500 border border-ads-500/30'
                  : 'bg-surface-hover text-ink-secondary border border-surface-border hover:text-ink-primary'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID ─────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[12rem] rounded-xl bg-surface-card border border-surface-border animate-pulse" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[6rem] text-ink-muted">
          <Filter className="w-[3rem] h-[3rem] mb-[1rem]" strokeWidth={1} />
          <p className="font-medium text-[0.9375rem]">Nenhum cliente encontrado</p>
          <p className="text-[0.8125rem] mt-[0.25rem]">Tente ajustar os filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
          {filtrados.map(({ cliente, estagio }) => (
            <ClienteProgressCard
              key={cliente.id}
              cliente={cliente}
              estagio={estagio}
              onCongelar={handleCongelar}
              isRetido={cliente.status === 'congelado'}
            />
          ))}
        </div>
      )}
    </MainLayout>
  )
}
```

## 4.2 — Detalhe do Cliente (app/clientes/[id]/page.tsx)

```tsx
// app/clientes/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams }          from 'next/navigation'
import {
  MessageCircle, ExternalLink, Clock, CheckCircle,
  AlertTriangle, TrendingUp, DollarSign, Activity
} from 'lucide-react'
import { MainLayout }    from '@/components/layout/MainLayout'
import { ChecklistCard } from '@/components/clientes/ChecklistCard'
import { AuditTimeline } from '@/components/clientes/AuditTimeline'
import { createClient }  from '@/lib/supabase/client'
import type { Cliente, Estagio, AnalyticsSnapshot } from '@/lib/types'

const WHATSAPP_TEMPLATES: Record<string, { label: string; texto: string }> = {
  BOASVINDAS:  { label: '#BOASVINDAS',  texto: 'Olá {nome}! Seja bem-vindo(a) à Adsgator! 🎉 Vou entrar em contato em breve para iniciar seu onboarding.' },
  CONVITE:     { label: '#CONVITE',     texto: 'Olá {nome}! Preciso de acesso ao seu Google Analytics 4. Vou te enviar o link de convite agora.' },
  BRIEFINGGA:  { label: '#BRIEFINGGA',  texto: 'Olá {nome}! Para montar sua estratégia de tráfego, preciso que preencha este briefing: [link]' },
  SALDOGOOGLE: { label: '#SALDOGOOGLE', texto: 'Olá {nome}! Seu saldo do Google Ads está baixo. Precisa recarregar para manter as campanhas rodando.' },
}

export default function ClienteDetalhe() {
  const { id }          = useParams() as { id: string }
  const supabase        = createClient()
  const [cliente,   setCliente]   = useState<Cliente | null>(null)
  const [estagios,  setEstagios]  = useState<Estagio[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function carregar() {
      const [{ data: c }, { data: e }, { data: a }] = await Promise.all([
        supabase.from('clientes').select('*').eq('id', id).single(),
        supabase.from('estagios').select('*').eq('cliente_id', id).eq('ativo', true).order('created_at'),
        supabase.from('analytics_snapshots').select('*').eq('cliente_id', id).order('periodo_fim', { ascending: false }).limit(1).single(),
      ])
      setCliente(c)
      setEstagios(e ?? [])
      setAnalytics(a)
      setLoading(false)
    }
    carregar()
  }, [id])

  function gerarWhatsApp(template: string) {
    if (!cliente?.whatsapp) return '#'
    const texto = WHATSAPP_TEMPLATES[template]?.texto.replace('{nome}', cliente.nome.split(' ')[0]) ?? ''
    return `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(texto)}`
  }

  if (loading || !cliente) {
    return (
      <MainLayout title="Carregando...">
        <div className="h-[20rem] rounded-xl bg-surface-card border border-surface-border animate-pulse" />
      </MainLayout>
    )
  }

  const estagio = estagios[0]

  return (
    <MainLayout
      title={cliente.nome}
      subtitle={`${cliente.nicho ?? 'sem nicho'} · ${cliente.status}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1.5rem]">

        {/* ── COLUNA ESQUERDA (2/3) ─────────────────── */}
        <div className="lg:col-span-2 space-y-[1.5rem]">

          {/* Próxima ação — destacada */}
          {estagio && (
            <div className="bg-ads-500/8 border border-ads-500/25 rounded-xl p-[1.5rem]">
              <p className="text-ads-500 text-[0.75rem] font-bold uppercase tracking-wide mb-[0.5rem]">
                ▶ PRÓXIMA AÇÃO
              </p>
              <p className="text-ink-primary text-[1.125rem] font-semibold mb-[1rem]">
                {estagio.descricao}
              </p>
              {estagio.acao_url && (
                <a
                  href={estagio.acao_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-[0.375rem] h-[2.25rem] px-[1rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.875rem] font-medium hover:bg-ads-600 transition-colors"
                >
                  <MessageCircle className="w-[1rem] h-[1rem]" strokeWidth={1.75} />
                  {estagio.acao_label ?? 'Executar ação'}
                  <ExternalLink className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                </a>
              )}
            </div>
          )}

          {/* Checklist do estágio */}
          {estagio?.checklist && (
            <ChecklistCard
              clienteId={id}
              estagioId={estagio.id}
              items={estagio.checklist}
            />
          )}

          {/* Analytics rápido */}
          {analytics && (
            <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
              <div className="flex items-center justify-between mb-[1rem]">
                <h3 className="text-ink-primary font-semibold text-[0.9375rem]">
                  Performance Google Ads
                </h3>
                <a href={`/analytics?cliente=${id}`} className="text-ads-500 text-[0.8125rem] hover:underline">
                  Ver completo →
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-[0.75rem] mb-[1rem]">
                {[
                  { label: 'Investimento', value: `R$ ${analytics.investimento?.toLocaleString('pt-BR') ?? '—'}` },
                  { label: 'Conversões',   value: analytics.conversoes ?? '—' },
                  { label: 'CPA',          value: `R$ ${analytics.cpa?.toFixed(2) ?? '—'}` },
                  { label: 'CTR',          value: `${((analytics.ctr ?? 0) * 100).toFixed(1)}%` },
                ].map((m) => (
                  <div key={m.label} className="bg-surface-hover rounded-[0.375rem] px-[0.75rem] py-[0.625rem]">
                    <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide mb-[0.25rem]">{m.label}</p>
                    <p className="text-ink-primary font-bold text-[1.125rem]">{m.value}</p>
                  </div>
                ))}
              </div>

              {analytics.insight_ia && (
                <div className="bg-status-blue/5 border border-status-blue/20 rounded-[0.375rem] p-[0.75rem]">
                  <p className="text-status-blue text-[0.75rem] font-semibold mb-[0.25rem]">💡 Insight da IA</p>
                  <p className="text-ink-secondary text-[0.8125rem] leading-relaxed">{analytics.insight_ia}</p>
                </div>
              )}
            </div>
          )}

          {/* Timeline de ações */}
          <AuditTimeline clienteId={id} />
        </div>

        {/* ── COLUNA DIREITA (1/3) ──────────────────── */}
        <div className="space-y-[1rem]">

          {/* Dados do cliente */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
            <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1rem]">Dados</h3>
            <dl className="space-y-[0.625rem]">
              {[
                { label: 'Email',     value: cliente.email   },
                { label: 'WhatsApp',  value: cliente.whatsapp },
                { label: 'Nicho',     value: cliente.nicho   },
                { label: 'Plano',     value: cliente.plano   },
                { label: 'MRR',       value: cliente.mrr ? `R$ ${cliente.mrr.toLocaleString('pt-BR')}` : '—' },
                { label: 'Atraso',    value: cliente.dias_atraso > 0 ? `${cliente.dias_atraso} dias` : 'Em dia' },
              ].filter(({ value }) => value).map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-ink-muted text-[0.8125rem]">{label}</dt>
                  <dd className="text-ink-secondary text-[0.8125rem] font-medium truncate max-w-[10rem]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Templates WhatsApp */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
            <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[0.75rem]">
              Mensagens Rápidas
            </h3>
            <div className="space-y-[0.375rem]">
              {Object.entries(WHATSAPP_TEMPLATES).map(([key, { label }]) => (
                <a
                  key={key}
                  href={gerarWhatsApp(key)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-[0.5rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover text-ink-secondary text-[0.8125rem] hover:bg-[#25D366]/10 hover:text-[#25D366] transition-colors w-full"
                >
                  <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
```

## 4.3 — Analytics (app/analytics/page.tsx)

```tsx
// app/analytics/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { TrendingUp, AlertTriangle, Download } from 'lucide-react'
import { MainLayout }  from '@/components/layout/MainLayout'
import { createClient } from '@/lib/supabase/client'
import type { Cliente, AnalyticsSnapshot } from '@/lib/types'

export default function AnalyticsPage() {
  const supabase     = createClient()
  const [clientes,   setClientes]   = useState<Cliente[]>([])
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [snapshots,  setSnapshots]  = useState<AnalyticsSnapshot[]>([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    supabase.from('clientes').select('id, nome, nicho, saldo_google, google_ads_id')
      .neq('status', 'cancelado').order('nome')
      .then(({ data }) => {
        setClientes(data ?? [])
        if (data?.[0]) setSelecionado(data[0].id)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!selecionado) return
    supabase.from('analytics_snapshots')
      .select('*')
      .eq('cliente_id', selecionado)
      .eq('fonte', 'google_ads')
      .order('periodo_fim', { ascending: true })
      .limit(12)
      .then(({ data }) => setSnapshots(data ?? []))
  }, [selecionado])

  const clienteAtual = clientes.find((c) => c.id === selecionado)
  const ultimoSnap   = snapshots[snapshots.length - 1]
  const snapAnterior = snapshots[snapshots.length - 2]

  const deltaCPA = ultimoSnap && snapAnterior && snapAnterior.cpa
    ? ((ultimoSnap.cpa! - snapAnterior.cpa!) / snapAnterior.cpa!) * 100
    : null

  const chartData = snapshots.map((s) => ({
    periodo:     s.periodo_fim,
    investimento: s.investimento ?? 0,
    conversoes:  s.conversoes ?? 0,
    cpa:         s.cpa ?? 0,
    ctr:         ((s.ctr ?? 0) * 100),
  }))

  const TOOLTIP_STYLE = {
    backgroundColor: 'rgb(21,21,21)',
    border:          '1px solid rgb(45,45,45)',
    borderRadius:    '0.375rem',
    color:           '#fff',
    fontSize:        '0.8125rem',
  }

  return (
    <MainLayout title="Analytics" subtitle="Google Ads · Performance de Campanhas">

      {/* ── SELETOR DE CLIENTE ───────────────────── */}
      <div className="flex gap-[0.375rem] flex-wrap mb-[1.5rem]">
        {clientes.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelecionado(c.id)}
            className={`
              h-[2rem] px-[0.875rem] rounded-full text-[0.8125rem] font-medium transition-colors border
              ${selecionado === c.id
                ? 'bg-ads-500 text-white border-ads-500'
                : 'bg-surface-hover text-ink-secondary border-surface-border hover:text-ink-primary'
              }
            `}
          >
            {c.nome}
          </button>
        ))}
      </div>

      {/* ── ALERTAS ──────────────────────────────── */}
      {clienteAtual?.saldo_google !== undefined && clienteAtual.saldo_google < 500 && (
        <div className="mb-[1.5rem] flex items-center gap-[0.75rem] bg-status-orange/8 border border-status-orange/25 rounded-xl px-[1rem] py-[0.875rem]">
          <AlertTriangle className="w-[1rem] h-[1rem] text-status-orange shrink-0" strokeWidth={2} />
          <div className="flex-1">
            <p className="text-status-orange text-[0.875rem] font-semibold">
              Saldo Google baixo — R$ {clienteAtual.saldo_google?.toFixed(2)}
            </p>
            <p className="text-ink-secondary text-[0.8125rem]">Envie a mensagem #SALDOGOOGLE para {clienteAtual.nome}</p>
          </div>
          <a
            href={`https://wa.me/${clienteAtual && clientes.find(c=>c.id===selecionado)?.['whatsapp' as any]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 h-[1.875rem] px-[0.75rem] rounded-[0.375rem] bg-status-orange/15 text-status-orange text-[0.8125rem] font-medium hover:bg-status-orange/25 transition-colors"
          >
            #SALDOGOOGLE
          </a>
        </div>
      )}

      {/* ── KPIs ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-[1rem] mb-[1.5rem]">
        {[
          { label: 'Investimento', value: `R$ ${ultimoSnap?.investimento?.toLocaleString('pt-BR') ?? '—'}`, cor: '' },
          { label: 'Cliques',     value: ultimoSnap?.cliques?.toLocaleString('pt-BR') ?? '—',              cor: '' },
          { label: 'CTR',         value: `${((ultimoSnap?.ctr ?? 0) * 100).toFixed(2)}%`,                  cor: '' },
          { label: 'Conversões',  value: ultimoSnap?.conversoes ?? '—', cor: '' },
          {
            label: 'CPA',
            value: `R$ ${ultimoSnap?.cpa?.toFixed(2) ?? '—'}`,
            cor: deltaCPA && deltaCPA > 20 ? 'text-status-red' : deltaCPA && deltaCPA < 0 ? 'text-status-green' : ''
          },
        ].map((m) => (
          <div key={m.label} className="bg-surface-card border border-surface-border rounded-xl p-[1rem]">
            <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide mb-[0.375rem]">{m.label}</p>
            <p className={`text-[1.5rem] font-bold leading-none ${m.cor || 'text-ink-primary'}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* ── CHARTS ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] mb-[1.5rem]">
        {/* Investimento x Conversões */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
          <p className="text-ink-primary font-semibold text-[0.9375rem] mb-[1rem]">Investimento vs Conversões</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FFA500" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFA500" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(45,45,45)" />
              <XAxis dataKey="periodo" tick={{ fill: '#5a5a5a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5a5a5a', fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="investimento" stroke="#FFA500" fill="url(#gInv)" strokeWidth={2} name="Investimento (R$)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* CPA trend */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
          <p className="text-ink-primary font-semibold text-[0.9375rem] mb-[1rem]">
            CPA ao longo do tempo
            {deltaCPA !== null && (
              <span className={`ml-[0.5rem] text-[0.8125rem] font-normal ${deltaCPA > 0 ? 'text-status-red' : 'text-status-green'}`}>
                {deltaCPA > 0 ? '↑' : '↓'} {Math.abs(deltaCPA).toFixed(1)}% vs anterior
              </span>
            )}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(45,45,45)" />
              <XAxis dataKey="periodo" tick={{ fill: '#5a5a5a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5a5a5a', fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`R$ ${Number(v).toFixed(2)}`, 'CPA']} />
              <Line type="monotone" dataKey="cpa" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 3 }} name="CPA (R$)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── INSIGHT IA ───────────────────────────── */}
      {ultimoSnap?.insight_ia && (
        <div className="bg-status-blue/5 border border-status-blue/20 rounded-xl p-[1.25rem] mb-[1.5rem]">
          <div className="flex items-center gap-[0.5rem] mb-[0.5rem]">
            <TrendingUp className="w-[1rem] h-[1rem] text-status-blue" strokeWidth={2} />
            <p className="text-status-blue font-semibold text-[0.875rem]">Análise da IA (Gemini)</p>
          </div>
          <p className="text-ink-secondary text-[0.875rem] leading-relaxed">{ultimoSnap.insight_ia}</p>
        </div>
      )}

      {/* ── EXPORTAR RELATÓRIO ───────────────────── */}
      <button
        onClick={async () => {
          if (!selecionado || !ultimoSnap) return
          const res = await fetch('/api/relatorios', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              cliente_id: selecionado,
              tipo:       'analytics',
              dados:      ultimoSnap,
            }),
          })
          const { conteudo } = await res.json()
          const blob = new Blob([conteudo], { type: 'text/markdown' })
          const url  = URL.createObjectURL(blob)
          const a    = document.createElement('a')
          a.href     = url
          a.download = `relatorio-${clienteAtual?.nome}-${new Date().toISOString().split('T')[0]}.md`
          a.click()
        }}
        className="flex items-center gap-[0.375rem] h-[2.25rem] px-[1rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.875rem] hover:text-ink-primary transition-colors"
      >
        <Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        Exportar .md
      </button>
    </MainLayout>
  )
}
```

## 4.4 — Financeiro (app/financeiro/page.tsx)

```tsx
// app/financeiro/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'
import { TrendingUp, DollarSign, Minus, Plus } from 'lucide-react'
import { MainLayout }  from '@/components/layout/MainLayout'
import { createClient } from '@/lib/supabase/client'
import type { FinanceiroLancamento } from '@/lib/types'

export default function FinanceiroPage() {
  const supabase       = createClient()
  const [lancamentos,  setLancamentos]  = useState<FinanceiroLancamento[]>([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    supabase.from('financeiro_lancamentos')
      .select('*, clientes(nome)')
      .eq('status', 'confirmado')
      .order('data', { ascending: false })
      .limit(100)
      .then(({ data }) => { setLancamentos(data ?? []); setLoading(false) })
  }, [])

  const mes = lancamentos.filter((l) => {
    const d = new Date(l.data)
    const h = new Date()
    return d.getMonth() === h.getMonth() && d.getFullYear() === h.getFullYear()
  })

  const mrr           = mes.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
  const custos        = mes.filter((l) => l.tipo !== 'receita').reduce((s, l) => s + Math.abs(l.valor), 0)
  const lucroLiquido  = mrr - custos
  const margem        = mrr > 0 ? (lucroLiquido / mrr) * 100 : 0

  // DRE agrupado por mês (últimos 6)
  const dreData = Array.from({ length: 6 }, (_, i) => {
    const data = new Date()
    data.setMonth(data.getMonth() - (5 - i))
    const m = data.getMonth()
    const a = data.getFullYear()
    const doMes = lancamentos.filter((l) => {
      const d = new Date(l.data)
      return d.getMonth() === m && d.getFullYear() === a
    })
    const receita = doMes.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
    const custo   = doMes.filter((l) => l.tipo !== 'receita').reduce((s, l) => s + Math.abs(l.valor), 0)
    return {
      mes:    data.toLocaleDateString('pt-BR', { month: 'short' }),
      receita, custo,
      lucro:  receita - custo,
    }
  })

  const TOOLTIP_STYLE = {
    backgroundColor: 'rgb(21,21,21)',
    border: '1px solid rgb(45,45,45)',
    borderRadius: '0.375rem',
    color: '#fff',
    fontSize: '0.8125rem',
  }

  return (
    <MainLayout title="Financeiro" subtitle="DRE · MRR · Fluxo de Caixa">

      {/* ── KPIs ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1rem] mb-[2rem]">
        {[
          { label: 'MRR',           value: `R$ ${mrr.toLocaleString('pt-BR', {minimumFractionDigits:2})}`,       icon: DollarSign,  cor: 'text-ads-500'       },
          { label: 'Custos Totais', value: `R$ ${custos.toLocaleString('pt-BR', {minimumFractionDigits:2})}`,    icon: Minus,       cor: 'text-status-red'    },
          { label: 'Lucro Líquido', value: `R$ ${lucroLiquido.toLocaleString('pt-BR', {minimumFractionDigits:2})}`, icon: TrendingUp, cor: lucroLiquido > 0 ? 'text-status-green' : 'text-status-red' },
          { label: 'Margem',        value: `${margem.toFixed(1)}%`,                                              icon: TrendingUp,  cor: margem > 50 ? 'text-status-green' : 'text-status-orange' },
        ].map(({ label, value, icon: Icon, cor }) => (
          <div key={label} className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
            <div className="flex items-center justify-between mb-[0.75rem]">
              <p className="text-ink-muted text-[0.75rem] font-semibold uppercase tracking-wide">{label}</p>
              <Icon className={`w-[1rem] h-[1rem] ${cor}`} strokeWidth={1.75} />
            </div>
            <p className={`text-[1.875rem] font-bold leading-none ${cor}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── DRE CHART ────────────────────────────── */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] mb-[1.5rem]">
        <p className="text-ink-primary font-semibold text-[0.9375rem] mb-[1rem]">DRE Simplificado — Últimos 6 meses</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={dreData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(45,45,45)" vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: '#5a5a5a', fontSize: 11 }} />
            <YAxis tick={{ fill: '#5a5a5a', fontSize: 11 }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`R$ ${v.toLocaleString('pt-BR')}`, '']} />
            <Bar dataKey="receita" fill="#FFA500" radius={[4,4,0,0]} name="Receita"       />
            <Bar dataKey="custo"   fill="#EF4444" radius={[4,4,0,0]} name="Custos"        opacity={0.7} />
            <Bar dataKey="lucro"   fill="#10B981" radius={[4,4,0,0]} name="Lucro Líquido" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── ÚLTIMAS TRANSAÇÕES ───────────────────── */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="px-[1.25rem] py-[1rem] border-b border-surface-border flex items-center justify-between">
          <p className="text-ink-primary font-semibold text-[0.9375rem]">Últimas Transações</p>
        </div>
        <div className="divide-y divide-surface-border">
          {lancamentos.slice(0, 15).map((l) => (
            <div key={l.id} className="flex items-center gap-[1rem] px-[1.25rem] py-[0.875rem] hover:bg-surface-hover transition-colors">
              <div className={`w-[0.5rem] h-[0.5rem] rounded-full shrink-0 ${l.tipo === 'receita' ? 'bg-status-green' : 'bg-status-red'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-ink-primary text-[0.875rem] truncate">{l.descricao}</p>
                <p className="text-ink-muted text-[0.75rem]">{l.categoria} · {new Date(l.data).toLocaleDateString('pt-BR')}</p>
              </div>
              <p className={`text-[0.9375rem] font-semibold shrink-0 ${l.tipo === 'receita' ? 'text-status-green' : 'text-status-red'}`}>
                {l.tipo === 'receita' ? '+' : '-'}R$ {Math.abs(l.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
```

**Checklist Parte 4:**
```
[ ] Página /clientes funcionando com filtros e busca
[ ] Página /clientes/[id] abre com checklist e templates WhatsApp
[ ] Página /analytics mostra charts com dados
[ ] Página /financeiro mostra DRE e transações
```

---

# PARTE 5 — COMPONENTES AUXILIARES

## 5.1 — Checklist Card (components/clientes/ChecklistCard.tsx)

```tsx
// components/clientes/ChecklistCard.tsx
'use client'

import { useState } from 'react'
import { CheckCircle, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ChecklistItem } from '@/lib/types'

interface ChecklistCardProps {
  clienteId: string
  estagioId: string
  items:     ChecklistItem[]
}

export function ChecklistCard({ clienteId, estagioId, items: itemsInicial }: ChecklistCardProps) {
  const supabase = createClient()
  const [items, setItems] = useState(itemsInicial)

  async function toggleItem(index: number) {
    const novosItems = items.map((it, i) =>
      i === index ? { ...it, done: !it.done } : it
    )
    setItems(novosItems)
    await supabase
      .from('estagios')
      .update({ checklist: novosItems })
      .eq('id', estagioId)
  }

  const total    = items.length
  const feitos   = items.filter((i) => i.done).length
  const progresso = total > 0 ? (feitos / total) * 100 : 0

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
      <div className="flex items-center justify-between mb-[0.75rem]">
        <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Checklist</h3>
        <span className="text-ink-muted text-[0.8125rem]">{feitos}/{total}</span>
      </div>

      {/* Barra de progresso */}
      <div className="h-[0.25rem] bg-surface-hover rounded-full mb-[1rem] overflow-hidden">
        <div
          className="h-full bg-ads-500 rounded-full transition-all duration-500"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <ul className="space-y-[0.5rem]">
        {items.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => toggleItem(i)}
              className="flex items-start gap-[0.625rem] w-full text-left hover:opacity-80 transition-opacity"
            >
              {item.done ? (
                <CheckCircle className="w-[1rem] h-[1rem] text-status-green shrink-0 mt-[0.125rem]" strokeWidth={2} />
              ) : (
                <Circle className="w-[1rem] h-[1rem] text-ink-muted shrink-0 mt-[0.125rem]" strokeWidth={1.75} />
              )}
              <span className={`text-[0.875rem] ${item.done ? 'text-ink-muted line-through' : 'text-ink-secondary'}`}>
                {item.item}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## 5.2 — Audit Timeline (components/clientes/AuditTimeline.tsx)

```tsx
// components/clientes/AuditTimeline.tsx
'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AuditLog {
  id:          string
  acao:        string
  descricao?:  string
  created_at:  string
}

export function AuditTimeline({ clienteId }: { clienteId: string }) {
  const supabase = createClient()
  const [logs, setLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    supabase.from('audit_logs')
      .select('*')
      .eq('registro_id', clienteId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setLogs(data ?? []))
  }, [clienteId])

  if (logs.length === 0) return null

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
      <div className="flex items-center gap-[0.5rem] mb-[1rem]">
        <Clock className="w-[1rem] h-[1rem] text-ink-muted" strokeWidth={1.75} />
        <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Histórico</h3>
      </div>
      <div className="relative">
        <div className="absolute left-[0.4375rem] top-0 bottom-0 w-px bg-surface-border" />
        <ul className="space-y-[1rem]">
          {logs.map((log) => (
            <li key={log.id} className="flex gap-[1rem] pl-[1.25rem] relative">
              <div className="absolute left-0 top-[0.1875rem] w-[0.875rem] h-[0.875rem] rounded-full bg-surface-card border-2 border-surface-border" />
              <div>
                <p className="text-ink-secondary text-[0.875rem]">
                  {log.descricao ?? log.acao}
                </p>
                <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

## 5.3 — Notification Bell (components/layout/NotificationBell.tsx)

```tsx
// components/layout/NotificationBell.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, X, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Notificacao } from '@/lib/types'

export function NotificationBell() {
  const supabase     = createClient()
  const ref          = useRef<HTMLDivElement>(null)
  const [notifs,    setNotifs]  = useState<Notificacao[]>([])
  const [aberto,    setAberto]  = useState(false)

  const naoLidas = notifs.filter((n) => !n.lida).length

  useEffect(() => {
    // Carregar notificações
    supabase.from('notificacoes')
      .select('*').eq('lida', false)
      .order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => setNotifs(data ?? []))

    // Realtime de novas notificações
    const channel = supabase
      .channel('notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificacoes' }, () => {
        supabase.from('notificacoes').select('*').eq('lida', false)
          .order('created_at', { ascending: false }).limit(20)
          .then(({ data }) => setNotifs(data ?? []))
      })
      .subscribe()

    // Click fora fecha
    function handleClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('mousedown', handleClickFora)
    }
  }, [])

  async function marcarLida(id: string) {
    await supabase.from('notificacoes').update({ lida: true, lida_em: new Date().toISOString() }).eq('id', id)
    setNotifs((prev) => prev.filter((n) => n.id !== id))
  }

  const TIPO_CORES: Record<string, string> = {
    urgente: 'text-status-red  bg-status-red/10',
    atencao: 'text-status-orange bg-status-orange/10',
    info:    'text-status-blue bg-status-blue/10',
    sucesso: 'text-status-green bg-status-green/10',
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        className="relative w-[2rem] h-[2rem] rounded-[0.375rem] flex items-center justify-center text-ink-secondary hover:bg-surface-hover hover:text-ink-primary transition-colors"
      >
        <Bell className="w-[1rem] h-[1rem]" strokeWidth={1.75} />
        {naoLidas > 0 && (
          <span className="absolute top-[0.25rem] right-[0.25rem] min-w-[0.9375rem] h-[0.9375rem] rounded-full bg-status-red flex items-center justify-center text-[0.5625rem] font-bold text-white px-[0.1875rem]">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-[2.5rem] w-[22rem] bg-surface-card border border-surface-border rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden animate-fade-in">
          <div className="px-[1rem] py-[0.75rem] border-b border-surface-border flex items-center justify-between">
            <p className="text-ink-primary font-semibold text-[0.875rem]">Notificações</p>
            {naoLidas > 0 && (
              <button
                onClick={async () => {
                  await supabase.from('notificacoes').update({ lida: true }).eq('lida', false)
                  setNotifs([])
                }}
                className="text-ink-muted text-[0.75rem] hover:text-ink-secondary"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-[2.5rem] text-ink-muted">
                <Bell className="w-[2rem] h-[2rem] mb-[0.5rem]" strokeWidth={1} />
                <p className="text-[0.875rem]">Tudo em dia!</p>
              </div>
            ) : (
              notifs.map((n) => (
                <div key={n.id} className={`px-[1rem] py-[0.875rem] border-b border-surface-border hover:bg-surface-hover transition-colors ${TIPO_CORES[n.tipo]?.split(' ')[1] ?? ''}`}>
                  <div className="flex items-start justify-between gap-[0.5rem]">
                    <div className="flex-1">
                      <p className={`text-[0.8125rem] font-semibold mb-[0.125rem] ${TIPO_CORES[n.tipo]?.split(' ')[0] ?? 'text-ink-primary'}`}>
                        {n.titulo}
                      </p>
                      {n.mensagem && (
                        <p className="text-ink-secondary text-[0.8125rem] leading-snug">{n.mensagem}</p>
                      )}
                      {n.acao_url && n.acao_label && (
                        <a href={n.acao_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-[0.25rem] text-ads-500 text-[0.75rem] mt-[0.375rem] hover:underline"
                        >
                          {n.acao_label} <ExternalLink className="w-[0.625rem] h-[0.625rem]" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => marcarLida(n.id)}
                      className="text-ink-muted hover:text-ink-primary shrink-0"
                    >
                      <X className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                    </button>
                  </div>
                  <p className="text-ink-muted text-[0.6875rem] mt-[0.375rem]">
                    {new Date(n.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

---

# PARTE 6 — VARIÁVEIS DE AMBIENTE

```bash
# .env.local (na raiz do projeto)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role (apenas Edge Functions — NUNCA no frontend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google AI (Gemini / Vertex)
GEMINI_API_KEY=AIzaSy...

# Edge Functions (variáveis configuradas no painel Supabase)
# Dashboard → Edge Functions → Secrets:
# SUPABASE_URL=...
# SUPABASE_SERVICE_ROLE_KEY=...
# GEMINI_API_KEY=...
```

---

# PARTE 7 — CHECKLIST FINAL DE DEPLOY

## Execute nesta ordem. Cada passo é uma entrega verificável.

```
══════════════════════════════════════════════════════════
FASE 0 — SETUP INICIAL
══════════════════════════════════════════════════════════
[ ] npm install recharts class-variance-authority next-themes date-fns

══════════════════════════════════════════════════════════
FASE 1 — BANCO DE DADOS
══════════════════════════════════════════════════════════
[ ] Executar SQL da Parte 1.1 (tabelas) — sem erros
[ ] Executar SQL da Parte 1.2 (índices)
[ ] Executar SQL da Parte 1.3 (triggers)
[ ] Executar SQL da Parte 1.4 (RLS)
[ ] Executar SQL da Parte 1.5 (seed de exemplo)
[ ] Verificar: 8 tabelas criadas no Table Editor
[ ] Verificar: dados de exemplo aparecem em 'clientes'

══════════════════════════════════════════════════════════
FASE 2 — EDGE FUNCTIONS
══════════════════════════════════════════════════════════
[ ] Criar função: webhook-asaas
[ ] Criar função: regua-cobranca
[ ] Criar função: gerar-insight-ia
[ ] Criar função: gerar-relatorio-md
[ ] Configurar secrets no Supabase (GEMINI_API_KEY)
[ ] Configurar URL do webhook no painel Asaas
[ ] Testar webhook-asaas com payload fake

══════════════════════════════════════════════════════════
FASE 3 — DESIGN SYSTEM
══════════════════════════════════════════════════════════
[ ] Substituir tailwind.config.ts (do doc anterior)
[ ] Substituir globals.css (do doc anterior)
[ ] Criar ThemeProvider
[ ] Atualizar app/layout.tsx com ThemeProvider

══════════════════════════════════════════════════════════
FASE 4 — LAYOUT + COMPONENTES BASE
══════════════════════════════════════════════════════════
[ ] Criar lib/types.ts (Parte 3)
[ ] Criar components/layout/Sidebar.tsx
[ ] Criar components/layout/TopBar.tsx
[ ] Criar components/layout/MainLayout.tsx
[ ] Criar lib/hooks/useClientes.ts
[ ] npm run dev — verificar sidebar com labels visível

══════════════════════════════════════════════════════════
FASE 5 — DASHBOARD
══════════════════════════════════════════════════════════
[ ] Criar components/dashboard/KpiCard.tsx
[ ] Criar components/dashboard/AcoesDoDia.tsx
[ ] Criar components/dashboard/ClienteProgressCard.tsx
[ ] Substituir app/(dashboard)/page.tsx
[ ] Verificar: 4 KPI cards com sparklines aparecem
[ ] Verificar: Ações do Dia mostram clientes urgentes
[ ] Verificar: Grid de progresso carrega clientes

══════════════════════════════════════════════════════════
FASE 6 — PÁGINAS
══════════════════════════════════════════════════════════
[ ] Criar app/clientes/page.tsx
[ ] Criar app/clientes/[id]/page.tsx
[ ] Criar components/clientes/ChecklistCard.tsx
[ ] Criar components/clientes/AuditTimeline.tsx
[ ] Criar app/analytics/page.tsx
[ ] Criar app/financeiro/page.tsx
[ ] Verificar navegação entre todas as páginas

══════════════════════════════════════════════════════════
FASE 7 — NOTIFICAÇÕES REALTIME
══════════════════════════════════════════════════════════
[ ] Criar components/layout/NotificationBell.tsx
[ ] Adicionar NotificationBell na TopBar
[ ] Teste realtime: alterar status de um cliente no Supabase
[ ] Verificar: dashboard atualiza sem refresh manual
[ ] Verificar: badge de notificações incrementa

══════════════════════════════════════════════════════════
FASE 8 — VERIFICAÇÃO VISUAL FINAL
══════════════════════════════════════════════════════════
[ ] Dark mode ativado por padrão
[ ] Toggle dark/light funcionando
[ ] Sidebar: ícone + texto visíveis (igual referências)
[ ] KPI cards: sparkline no canto direito
[ ] Ações do Dia: ordenadas por urgência (vermelho → laranja → azul)
[ ] WhatsApp: botões abrem link pré-preenchido
[ ] Analytics: gráficos com dados reais ou seed
[ ] Financeiro: DRE com barras de receita/custo/lucro
[ ] Mobile: sidebar vira hamburguer em <md
[ ] Responsive: testado em 375px, 768px, 1280px

══════════════════════════════════════════════════════════
FASE 9 — RÉGUA DE COBRANÇA
══════════════════════════════════════════════════════════
[ ] Testar: alterar dias_atraso de um cliente para 7 via SQL
[ ] Rodar manualmente a função regua-cobranca
[ ] Verificar: notificação aparece no bell
[ ] Testar com 15 dias: badge vermelho + notificação urgente
[ ] Testar com 30 dias: status muda para cancelado_debito

══════════════════════════════════════════════════════════
✅ SISTEMA OPERACIONAL — VOCÊ ABRE E O SISTEMA MANDA
══════════════════════════════════════════════════════════
```

---

# REFERÊNCIA RÁPIDA — WHATSAPP TEMPLATES

| Código       | Quando usar                         | Dispara em                        |
|-------------|--------------------------------------|-----------------------------------|
| #BOASVINDAS | Novo cliente (status: recebido)      | Automático — estágio inicial      |
| #CONVITE    | Setup GA4 pendente                   | Estágio onboarding                |
| #BRIEFINGGA | Antes de criar campanhas             | Estágio setup_trafego             |
| #SALDOGOOGLE| Saldo Google abaixo de R$ 500        | Alerta automático no analytics    |
| #ALERTA     | Pagamento atrasado D+7               | Cron diário 09:00                 |
| #COBRANÇA   | Pagamento atrasado D+15              | Cron diário 09:00                 |

---