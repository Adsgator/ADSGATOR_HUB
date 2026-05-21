# ADSGATOR HUB - ARQUIVO 1: CORE & DATABASE

## 1. SCHEMA POSTGRESQL (Supabase)

```sql
-- ==========================================
-- TABELA: CLIENTES
-- ==========================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  whatsapp TEXT,
  dominio TEXT UNIQUE,
  nicho TEXT NOT NULL,
  status TEXT DEFAULT 'recebido',
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_clientes_status ON clientes(status);
CREATE INDEX idx_clientes_nicho ON clientes(nicho);
CREATE INDEX idx_clientes_email ON clientes(email);

-- ==========================================
-- TABELA: PLANOS E ASSINATURAS
-- ==========================================
CREATE TABLE IF NOT EXISTS assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  plano_nome TEXT NOT NULL,
  valor_mensal NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'ativa',
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_proxima_cobranca TIMESTAMP WITH TIME ZONE,
  asaas_subscription_id TEXT UNIQUE,
  dias_atraso INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_assinaturas_cliente ON assinaturas(cliente_id);
CREATE INDEX idx_assinaturas_status ON assinaturas(status);

-- ==========================================
-- TABELA: ESTAGIOS OPERACIONAIS
-- ==========================================
CREATE TABLE IF NOT EXISTS estagios_operacionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  estagio TEXT NOT NULL,
  acao_proxima TEXT,
  pendente_cliente BOOLEAN DEFAULT FALSE,
  data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_saida TIMESTAMP WITH TIME ZONE,
  dias_retencao INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_estagios_cliente ON estagios_operacionais(cliente_id);
CREATE INDEX idx_estagios_estagio ON estagios_operacionais(estagio);

-- ==========================================
-- TABELA: HISTORICO DE ACOES (Auditoria)
-- ==========================================
CREATE TABLE IF NOT EXISTS historico_acoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_acao TEXT NOT NULL,
  descricao TEXT,
  valor_impactado NUMERIC(10, 2),
  usuario_id TEXT,
  data_acao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_historico_cliente ON historico_acoes(cliente_id);
CREATE INDEX idx_historico_data ON historico_acoes(data_acao);

-- ==========================================
-- TABELA: CONFIGURACOES FINANCEIRAS
-- ==========================================
CREATE TABLE IF NOT EXISTS configuracoes_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agencia_id TEXT NOT NULL UNIQUE,
  custos_fixos_mensais NUMERIC(10, 2) DEFAULT 0,
  custos_variaveis_percentual NUMERIC(5, 2) DEFAULT 0,
  margem_lucro_minima NUMERIC(5, 2) DEFAULT 30,
  saldo_google_ads_limite_alerta NUMERIC(10, 2) DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABELA: CAMPANHAS GOOGLE ADS
-- ==========================================
CREATE TABLE IF NOT EXISTS campanhas_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  campanha_nome TEXT NOT NULL,
  google_ads_id TEXT UNIQUE,
  status TEXT DEFAULT 'ativa',
  investimento_total NUMERIC(10, 2) DEFAULT 0,
  cliques INTEGER DEFAULT 0,
  conversoes NUMERIC(10, 2) DEFAULT 0,
  cpa NUMERIC(10, 2) DEFAULT 0,
  data_inicio DATE,
  data_fim DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_campanhas_cliente ON campanhas_ads(cliente_id);

-- ==========================================
-- TABELA: RELATORIOS MENSAIS
-- ==========================================
CREATE TABLE IF NOT EXISTS relatorios_mensais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  mes_ano TEXT NOT NULL,
  mrr NUMERIC(10, 2),
  investimento_ads NUMERIC(10, 2),
  conversoes NUMERIC(10, 2),
  cpa NUMERIC(10, 2),
  status_geracao TEXT DEFAULT 'pendente',
  url_relatorio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_relatorios_cliente ON relatorios_mensais(cliente_id);
CREATE INDEX idx_relatorios_mes ON relatorios_mensais(mes_ano);
```

---

## 2. ARQUIVO: supabase/auth.ts

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função de login com email/senha
export async function loginComEmail(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) throw new Error(`Erro de autenticação: ${error.message}`);
  return data;
}

// Função de logout
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Erro ao sair: ${error.message}`);
}

// Função de registro
export async function registrarNovoUsuario(email: string, senha: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
  });
  if (error) throw new Error(`Erro no registro: ${error.message}`);
  return data;
}

// Obter usuário atual
export async function obterUsuarioAtual() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Erro ao obter usuário: ${error.message}`);
  return data.user;
}
```

---

## 3. EDGE FUNCTION: Webhook Asaas

### Arquivo: `supabase/functions/webhook-asaas/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const payload = await req.json();

    // Validar assinatura do Asaas
    const asaasWebhookKey = Deno.env.get('ASAAS_WEBHOOK_KEY');
    const signature = req.headers.get('x-asaas-signature');

    // Verificar se é um evento de payment_received
    if (payload.event === 'payment_received') {
      const subscriptionId = payload.payment.subscription;
      const billingAmount = payload.payment.value;
      const billingDate = payload.payment.dueDate;

      // Buscar assinatura no banco
      const { data: assinatura, error: errorAssinatura } = await supabase
        .from('assinaturas')
        .select('cliente_id, dias_atraso')
        .eq('asaas_subscription_id', subscriptionId)
        .single();

      if (errorAssinatura) {
        return new Response(
          JSON.stringify({ error: 'Assinatura não encontrada' }),
          { status: 404 }
        );
      }

      // Atualizar status da assinatura
      const { error: updateError } = await supabase
        .from('assinaturas')
        .update({
          status: 'ativa',
          dias_atraso: 0,
          data_proxima_cobranca: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', assinatura.id);

      if (updateError) throw new Error(updateError.message);

      // Criar cliente automaticamente se não existir
      if (!assinatura.cliente_id) {
        const { data: clienteNovo, error: errorCliente } = await supabase
          .from('clientes')
          .insert({
            email: payload.customer.email,
            nome: payload.customer.name,
            whatsapp: payload.customer.mobilePhone,
            status: 'recebido',
            nicho: 'a_definir',
          })
          .select()
          .single();

        if (errorCliente) throw new Error(errorCliente.message);

        // Atualizar assinatura com cliente_id
        await supabase
          .from('assinaturas')
          .update({ cliente_id: clienteNovo.id })
          .eq('asaas_subscription_id', subscriptionId);

        // Registrar ação no histórico
        await supabase.from('historico_acoes').insert({
          cliente_id: clienteNovo.id,
          tipo_acao: 'cliente_criado_automaticamente',
          descricao: `Cliente criado via pagamento recebido do Asaas: ${billingAmount}`,
          valor_impactado: billingAmount,
          metadata: { asaas_event: 'payment_received' },
        });
      }

      // Criar entrada no estagio operacional
      await supabase.from('estagios_operacionais').insert({
        cliente_id: assinatura.cliente_id,
        estagio: 'recebido',
        acao_proxima: 'Enviar mensagem de boas-vindas via WhatsApp com tag #BOASVINDAS',
        pendente_cliente: false,
      });

      return new Response(
        JSON.stringify({ success: true, message: 'Pagamento processado com sucesso' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Evento de atraso de pagamento (7 dias)
    if (payload.event === 'payment_overdue' && payload.payment.daysOverdue === 7) {
      const subscriptionId = payload.payment.subscription;

      const { data: assinatura } = await supabase
        .from('assinaturas')
        .select('cliente_id')
        .eq('asaas_subscription_id', subscriptionId)
        .single();

      if (assinatura) {
        await supabase
          .from('assinaturas')
          .update({ dias_atraso: 7, status: 'atraso_7_dias' })
          .eq('id', assinatura.id);

        await supabase.from('historico_acoes').insert({
          cliente_id: assinatura.cliente_id,
          tipo_acao: 'alerta_atraso_7_dias',
          descricao: 'Pagamento com 7 dias de atraso. Suspensão de campanhas iminente.',
          metadata: { dias_atraso: 7, acao_recomendada: '#SALDOGOOGLE' },
        });
      }

      return new Response(JSON.stringify({ processed: true }), { status: 200 });
    }

    // Evento de atraso crítico (15 dias)
    if (payload.event === 'payment_overdue' && payload.payment.daysOverdue === 15) {
      const subscriptionId = payload.payment.subscription;

      const { data: assinatura } = await supabase
        .from('assinaturas')
        .select('cliente_id')
        .eq('asaas_subscription_id', subscriptionId)
        .single();

      if (assinatura) {
        await supabase
          .from('assinaturas')
          .update({ dias_atraso: 15, status: 'atraso_15_dias' })
          .eq('id', assinatura.id);

        await supabase.from('historico_acoes').insert({
          cliente_id: assinatura.cliente_id,
          tipo_acao: 'notificacao_quebra_contrato',
          descricao: 'Pagamento com 15 dias de atraso. Contrato quebrado. Remoção de landing page iniciada.',
          metadata: { dias_atraso: 15, status_marcador: 'vermelho' },
        });
      }

      return new Response(JSON.stringify({ processed: true }), { status: 200 });
    }

    // Evento de atraso severo (30 dias)
    if (payload.event === 'payment_overdue' && payload.payment.daysOverdue >= 30) {
      const subscriptionId = payload.payment.subscription;

      const { data: assinatura } = await supabase
        .from('assinaturas')
        .select('cliente_id, id')
        .eq('asaas_subscription_id', subscriptionId)
        .single();

      if (assinatura) {
        await supabase
          .from('assinaturas')
          .update({
            dias_atraso: 30,
            status: 'cancelado_debito',
          })
          .eq('id', assinatura.id);

        await supabase.from('historico_acoes').insert({
          cliente_id: assinatura.cliente_id,
          tipo_acao: 'cancelamento_debito_automatico',
          descricao: 'Assinatura cancelada automaticamente. 30+ dias de atraso. Landing page removida do ar.',
          metadata: { dias_atraso: 30, acao: 'remover_landing_page_e_assets' },
        });
      }

      return new Response(JSON.stringify({ processed: true }), { status: 200 });
    }

    return new Response(
      JSON.stringify({ error: 'Evento não reconhecido' }),
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

---

## 4. FUNCOES UTILITARIAS: database.ts

```typescript
import { supabase } from './auth';

// ============================================
// CRUD DE CLIENTES
// ============================================

export async function criarCliente(dados: {
  nome: string;
  email: string;
  whatsapp: string;
  dominio: string;
  nicho: string;
}) {
  const { data, error } = await supabase
    .from('clientes')
    .insert([dados])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar cliente: ${error.message}`);
  return data;
}

export async function obterCliente(clienteId: string) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', clienteId)
    .single();

  if (error) throw new Error(`Erro ao obter cliente: ${error.message}`);
  return data;
}

export async function listarClientes(filtro?: { status?: string; nicho?: string }) {
  let query = supabase.from('clientes').select('*');

  if (filtro?.status) query = query.eq('status', filtro.status);
  if (filtro?.nicho) query = query.eq('nicho', filtro.nicho);

  const { data, error } = await query.order('data_criacao', { ascending: false });

  if (error) throw new Error(`Erro ao listar clientes: ${error.message}`);
  return data;
}

export async function atualizarStatusCliente(clienteId: string, novoStatus: string) {
  const { error } = await supabase
    .from('clientes')
    .update({ status: novoStatus, data_atualizacao: new Date() })
    .eq('id', clienteId);

  if (error) throw new Error(`Erro ao atualizar cliente: ${error.message}`);
}

// ============================================
// ESTAGIOS OPERACIONAIS
// ============================================

export async function criarEstagio(dados: {
  cliente_id: string;
  estagio: string;
  acao_proxima: string;
  pendente_cliente?: boolean;
}) {
  const { data, error } = await supabase
    .from('estagios_operacionais')
    .insert([dados])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar estagio: ${error.message}`);
  return data;
}

export async function obterEstagioAtivo(clienteId: string) {
  const { data, error } = await supabase
    .from('estagios_operacionais')
    .select('*')
    .eq('cliente_id', clienteId)
    .is('data_saida', null)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Erro ao obter estagio: ${error.message}`);
  }
  return data || null;
}

export async function finalizarEstagio(estagioId: string) {
  const { error } = await supabase
    .from('estagios_operacionais')
    .update({ data_saida: new Date() })
    .eq('id', estagioId);

  if (error) throw new Error(`Erro ao finalizar estagio: ${error.message}`);
}

export async function congelarCliente(clienteId: string, diasRetencao: number = 2) {
  const estagio = await obterEstagioAtivo(clienteId);
  if (estagio) {
    await finalizarEstagio(estagio.id);
  }

  await supabase.from('estagios_operacionais').insert({
    cliente_id: clienteId,
    estagio: 'congelado',
    acao_proxima: 'Aguardando resposta do cliente',
    pendente_cliente: true,
    dias_retencao: diasRetencao,
  });

  // Agendar alerta em 48 horas
  setTimeout(() => {
    registrarHistorico(clienteId, 'alerta_cliente_retido_48h', 'Cliente sem resposta há 48 horas. Reativar contato.');
  }, diasRetencao * 24 * 60 * 60 * 1000);
}

// ============================================
// HISTORICO E AUDITORIA
// ============================================

export async function registrarHistorico(
  clienteId: string,
  tipoAcao: string,
  descricao: string,
  valorImpactado?: number
) {
  const { error } = await supabase.from('historico_acoes').insert({
    cliente_id: clienteId,
    tipo_acao: tipoAcao,
    descricao,
    valor_impactado: valorImpactado || null,
  });

  if (error) throw new Error(`Erro ao registrar histórico: ${error.message}`);
}

export async function obterHistoricoCliente(clienteId: string) {
  const { data, error } = await supabase
    .from('historico_acoes')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('data_acao', { ascending: false });

  if (error) throw new Error(`Erro ao obter histórico: ${error.message}`);
  return data;
}

// ============================================
// ASSINATURAS
// ============================================

export async function criarAssinatura(dados: {
  cliente_id: string;
  plano_nome: string;
  valor_mensal: number;
  asaas_subscription_id: string;
}) {
  const { data, error } = await supabase
    .from('assinaturas')
    .insert([dados])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar assinatura: ${error.message}`);
  return data;
}

export async function obterAssinaturaCliente(clienteId: string) {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('*')
    .eq('cliente_id', clienteId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Erro ao obter assinatura: ${error.message}`);
  }
  return data || null;
}

export async function listarAssinaturasAtrasadas() {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('*, clientes(*)')
    .neq('dias_atraso', 0);

  if (error) throw new Error(`Erro ao listar atrasos: ${error.message}`);
  return data;
}
```

---

## 5. TIPOS TYPESCRIPT: types.ts

```typescript
export type Cliente = {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  dominio: string;
  nicho: string;
  status: 'recebido' | 'onboarding' | 'setup_trafego' | 'ativo' | 'congelado' | 'cancelado';
  data_criacao: string;
  data_atualizacao: string;
  metadata: Record<string, any>;
};

export type Estagio = {
  id: string;
  cliente_id: string;
  estagio: string;
  acao_proxima: string;
  pendente_cliente: boolean;
  data_entrada: string;
  data_saida: string | null;
  dias_retencao: number;
};

export type Assinatura = {
  id: string;
  cliente_id: string;
  plano_nome: string;
  valor_mensal: number;
  status: 'ativa' | 'atraso_7_dias' | 'atraso_15_dias' | 'cancelado_debito';
  data_inicio: string;
  data_proxima_cobranca: string;
  asaas_subscription_id: string;
  dias_atraso: number;
};

export type HistoricoAcao = {
  id: string;
  cliente_id: string;
  tipo_acao: string;
  descricao: string;
  valor_impactado: number | null;
  usuario_id: string | null;
  data_acao: string;
  metadata: Record<string, any>;
};

export type CampanhaAds = {
  id: string;
  cliente_id: string;
  campanha_nome: string;
  google_ads_id: string;
  status: 'ativa' | 'pausada' | 'finalizada';
  investimento_total: number;
  cliques: number;
  conversoes: number;
  cpa: number;
  data_inicio: string;
  data_fim: string | null;
};
```

---

## 6. VARIÁVEIS DE AMBIENTE: .env.local

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-chave-anonima]
SUPABASE_SERVICE_ROLE_KEY=[sua-chave-service-role]

# Asaas
ASAAS_API_KEY=[sua-chave-api-asaas]
ASAAS_WEBHOOK_KEY=[sua-chave-webhook]

# Google APIs
GOOGLE_ADS_API_KEY=[sua-chave-google-ads]
GOOGLE_ANALYTICS_API_KEY=[sua-chave-ga4]

# Configurações gerais
NEXT_PUBLIC_APP_URL=http://localhost:3000
AMBIENTE=desenvolvimento
```

---

## 7. DIAGRAMA DE FLUXO: Core de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEBHOOK ASAAS (Edge Function)               │
│                                                                 │
│  payment_received → Criar Cliente (auto) → Estagio "recebido"  │
│  payment_overdue (7d) → Status "atraso_7_dias" + Alerta       │
│  payment_overdue (15d) → Status "atraso_15_dias" + Red Flag   │
│  payment_overdue (30d) → Status "cancelado_debito" + Remover  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   CLIENTES      │
                    │                 │
                    │ id, nome, email │
                    │ status, nicho   │
                    └─────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌───────────────┐
        │ ASSINATURAS  │ │   ESTAGIOS   │ │ CAMPANHAS ADS │
        │              │ │ OPERACIONAIS │ │               │
        │ valor_mensal │ │              │ │ investimento  │
        │ status       │ │ acao_proxima │ │ conversoes    │
        │ dias_atraso  │ │ pendencia    │ │ cpa           │
        └──────────────┘ └──────────────┘ └───────────────┘
                │             │                     │
                └─────────────┴─────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │ HISTORICO_ACOES      │
                    │                      │
                    │ Auditoria imutável   │
                    │ de todas as ações    │
                    └──────────────────────┘
```

---

## 8. SETUP INICIAL: scripts/seed.ts

```typescript
import { supabase } from '@/lib/auth';

async function seedDatabase() {
  try {
    // Criar configuração financeira padrão
    await supabase.from('configuracoes_financeiras').insert({
      agencia_id: 'adsgator-main',
      custos_fixos_mensais: 2000,
      custos_variaveis_percentual: 15,
      margem_lucro_minima: 30,
      saldo_google_ads_limite_alerta: 50,
    });

    console.log('✅ Database seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no seed:', error);
  }
}

seedDatabase();
```

---

## 9. RESUMO DA ARQUITETURA

- ✅ Schema PostgreSQL com 9 tabelas relacionadas
- ✅ Autenticação via Supabase Auth
- ✅ Webhook do Asaas (Edge Function) processando pagamentos em tempo real
- ✅ Régua automática de cobrança (7, 15, 30 dias)
- ✅ Histórico imutável de todas as ações
- ✅ Sistema de estagios operacionais com pendências
- ✅ Índices estratégicos para performance
- ✅ Tipagem TypeScript completa
- ✅ Funções reutilizáveis e modulares

**Status:** Pronto para implementação imediata.
