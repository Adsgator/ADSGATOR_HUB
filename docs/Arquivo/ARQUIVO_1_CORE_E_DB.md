# ADSGATOR HUB — ARQUIVO 1: CORE & DATABASE
> **Implementação:** Copie o SQL direto no SQL Editor do Supabase. Os arquivos TypeScript vão em `src/lib/`.

---

## 1. SCHEMA POSTGRESQL — Execute no SQL Editor do Supabase

```sql
-- ============================================================
-- ADSGATOR HUB — SCHEMA COMPLETO v2
-- Execute na ordem abaixo para garantir integridade referencial
-- ============================================================

-- ============================================================
-- TABELA: CLIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                  TEXT NOT NULL,
  email                 TEXT UNIQUE NOT NULL,
  whatsapp              TEXT NOT NULL,
  dominio               TEXT,
  nicho                 TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'recebido'
                        CHECK (status IN (
                          'recebido','onboarding','setup_trafego',
                          'ativo','congelado','cancelado'
                        )),
  -- Credenciais de integração (preenchidas durante o onboarding)
  google_ads_customer_id TEXT,
  ga4_property_id        TEXT,
  -- Metadados opcionais
  cor_tema              TEXT DEFAULT '#10b981',
  notas_internas        TEXT,
  metadata              JSONB DEFAULT '{}'::jsonb,
  data_criacao          TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_status  ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_nicho   ON clientes(nicho);
CREATE INDEX IF NOT EXISTS idx_clientes_email   ON clientes(email);

-- ============================================================
-- TABELA: ASSINATURAS
-- ============================================================
CREATE TABLE IF NOT EXISTS assinaturas (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id              UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  plano_nome              TEXT NOT NULL,
  valor_mensal            NUMERIC(10,2) NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'ativa'
                          CHECK (status IN (
                            'ativa','atraso_7_dias','atraso_15_dias','cancelado_debito'
                          )),
  data_inicio             TIMESTAMPTZ DEFAULT NOW(),
  data_proxima_cobranca   TIMESTAMPTZ,
  asaas_subscription_id   TEXT UNIQUE,
  dias_atraso             INTEGER NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assinaturas_cliente ON assinaturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status  ON assinaturas(status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_atraso  ON assinaturas(dias_atraso) WHERE dias_atraso > 0;

-- ============================================================
-- TABELA: ESTAGIOS OPERACIONAIS
-- Representa o estado atual de cada cliente no fluxo da agência
-- ============================================================
CREATE TABLE IF NOT EXISTS estagios_operacionais (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id       UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  estagio          TEXT NOT NULL,
  acao_proxima     TEXT,
  pendente_cliente BOOLEAN NOT NULL DEFAULT FALSE,
  data_entrada     TIMESTAMPTZ DEFAULT NOW(),
  data_saida       TIMESTAMPTZ,     -- NULL = estágio ativo
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estagios_cliente     ON estagios_operacionais(cliente_id);
CREATE INDEX IF NOT EXISTS idx_estagios_estagio     ON estagios_operacionais(estagio);
CREATE INDEX IF NOT EXISTS idx_estagios_data_saida  ON estagios_operacionais(data_saida) WHERE data_saida IS NULL;

-- ============================================================
-- TABELA: HISTORICO DE ACOES (auditoria imutável)
-- Nenhum registro é deletado. Apenas INSERT.
-- ============================================================
CREATE TABLE IF NOT EXISTS historico_acoes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id       UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_acao        TEXT NOT NULL,
  descricao        TEXT NOT NULL,
  valor_impactado  NUMERIC(10,2),
  usuario_id       UUID,   -- auth.uid() quando disponível
  data_acao        TIMESTAMPTZ DEFAULT NOW(),
  metadata         JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_historico_cliente ON historico_acoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_historico_data    ON historico_acoes(data_acao DESC);
CREATE INDEX IF NOT EXISTS idx_historico_tipo    ON historico_acoes(tipo_acao);

-- ============================================================
-- TABELA: CONFIGURACOES FINANCEIRAS DA AGENCIA
-- ============================================================
CREATE TABLE IF NOT EXISTS configuracoes_financeiras (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agencia_id                      TEXT NOT NULL UNIQUE DEFAULT 'adsgator-main',
  custos_fixos_mensais            NUMERIC(10,2) NOT NULL DEFAULT 0,
  custos_variaveis_percentual     NUMERIC(5,2)  NOT NULL DEFAULT 0,
  margem_lucro_minima             NUMERIC(5,2)  NOT NULL DEFAULT 30,
  saldo_google_ads_limite_alerta  NUMERIC(10,2) NOT NULL DEFAULT 50,
  updated_at                      TIMESTAMPTZ DEFAULT NOW()
);

-- Garante que existe exatamente 1 linha de config
INSERT INTO configuracoes_financeiras (agencia_id)
VALUES ('adsgator-main')
ON CONFLICT (agencia_id) DO NOTHING;

-- ============================================================
-- TABELA: CUSTOS DETALHADOS
-- Itemização dos custos fixos e variáveis
-- ============================================================
CREATE TABLE IF NOT EXISTS custos_detalhados (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         TEXT NOT NULL,
  valor        NUMERIC(10,2) NOT NULL,
  tipo         TEXT NOT NULL CHECK (tipo IN ('fixo','variavel')),
  descricao    TEXT,
  ativo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custos_tipo  ON custos_detalhados(tipo);
CREATE INDEX IF NOT EXISTS idx_custos_ativo ON custos_detalhados(ativo) WHERE ativo = TRUE;

-- ============================================================
-- TABELA: CAMPANHAS GOOGLE ADS
-- ============================================================
CREATE TABLE IF NOT EXISTS campanhas_ads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id        UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  campanha_nome     TEXT NOT NULL,
  google_ads_id     TEXT,
  status            TEXT NOT NULL DEFAULT 'ativa'
                    CHECK (status IN ('ativa','pausada','finalizada')),
  investimento_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  cliques           INTEGER NOT NULL DEFAULT 0,
  conversoes        NUMERIC(10,2) NOT NULL DEFAULT 0,  -- NUMERIC para suportar 0.5 (atribuição)
  cpa               NUMERIC(10,2) NOT NULL DEFAULT 0,
  ctr               NUMERIC(5,2)  NOT NULL DEFAULT 0,
  impressoes        INTEGER NOT NULL DEFAULT 0,
  data_inicio       DATE,
  data_fim          DATE,
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campanhas_cliente ON campanhas_ads(cliente_id);
CREATE INDEX IF NOT EXISTS idx_campanhas_status  ON campanhas_ads(status);

-- ============================================================
-- TABELA: RELATORIOS MENSAIS
-- ============================================================
CREATE TABLE IF NOT EXISTS relatorios_mensais (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id       UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  mes_ano          TEXT NOT NULL,  -- Formato: 'YYYY-MM'
  mrr              NUMERIC(10,2),
  investimento_ads NUMERIC(10,2),
  conversoes       NUMERIC(10,2),  -- NUMERIC para suportar frações
  cpa              NUMERIC(10,2),
  cliques          INTEGER,
  impressoes       INTEGER,
  ctr              NUMERIC(5,2),
  sessoes_ga4      INTEGER,
  novos_usuarios   INTEGER,
  taxa_engajamento NUMERIC(5,2),
  roi              NUMERIC(8,2),
  markdown_content TEXT,           -- Relatório completo em MD
  status_geracao   TEXT NOT NULL DEFAULT 'pendente'
                   CHECK (status_geracao IN ('pendente','processando','completo','erro')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_relatorios_cliente ON relatorios_mensais(cliente_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_mes     ON relatorios_mensais(mes_ano);
CREATE UNIQUE INDEX IF NOT EXISTS idx_relatorios_unique ON relatorios_mensais(cliente_id, mes_ano);

-- ============================================================
-- TABELA: ALERTAS DO SISTEMA
-- Substitui o setTimeout — alertas são registros no banco com
-- prazo de disparo, processados pela Edge Function de cron.
-- ============================================================
CREATE TABLE IF NOT EXISTS alertas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id      UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_alerta     TEXT NOT NULL,  -- 'pendencia_48h', 'saldo_baixo', 'atraso_7d', etc.
  mensagem        TEXT NOT NULL,
  dispara_em      TIMESTAMPTZ NOT NULL,
  disparado       BOOLEAN NOT NULL DEFAULT FALSE,
  data_disparo    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alertas_cliente    ON alertas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_alertas_pendentes  ON alertas(dispara_em) WHERE disparado = FALSE;

-- ============================================================
-- TABELA: ONBOARD PROGRESSO
-- Persiste o estado do checklist de onboarding por cliente
-- ============================================================
CREATE TABLE IF NOT EXISTS onboard_progresso (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE UNIQUE,
  progresso    JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Estrutura do JSONB: { "contrato": true, "pix-setup": false, ... }
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboard_cliente ON onboard_progresso(cliente_id);

-- ============================================================
-- TRIGGERS: auto-updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_assinaturas_updated_at
  BEFORE UPDATE ON assinaturas
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_custos_updated_at
  BEFORE UPDATE ON custos_detalhados
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_campanhas_updated_at
  BEFORE UPDATE ON campanhas_ads
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_onboard_updated_at
  BEFORE UPDATE ON onboard_progresso
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

-- ============================================================
-- RLS: Row Level Security
-- IMPORTANTE: Ative o RLS no painel do Supabase para cada tabela
-- e ajuste as policies para o seu modelo de autenticação.
-- Para um app single-user (agência), a policy mais simples é:
-- service_role acessa tudo; usuário autenticado acessa tudo.
-- ============================================================
ALTER TABLE clientes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinaturas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE estagios_operacionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_acoes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE custos_detalhados     ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanhas_ads         ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_mensais    ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas               ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboard_progresso     ENABLE ROW LEVEL SECURITY;

-- Policy: qualquer usuário autenticado tem acesso total (app interno da agência)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'clientes','assinaturas','estagios_operacionais','historico_acoes',
    'configuracoes_financeiras','custos_detalhados','campanhas_ads',
    'relatorios_mensais','alertas','onboard_progresso'
  ]) LOOP
    EXECUTE format(
      'CREATE POLICY "acesso_autenticado_%s" ON %s FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t, t
    );
  END LOOP;
END;
$$;
```

---

## 2. ARQUIVO: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error('[Adsgator] NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias.');
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Cliente server-side (Edge Functions / API Routes que precisam bypassar RLS)
export function criarClienteServiceRole() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('[Adsgator] SUPABASE_SERVICE_ROLE_KEY não definida.');
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
```

---

## 3. ARQUIVO: `src/lib/auth.ts`

```typescript
import { supabase } from './supabase';

export async function loginComEmail(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function obterSessao() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

export async function obterUsuario() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}
```

---

## 4. ARQUIVO: `src/lib/database.ts`

```typescript
import { supabase } from './supabase';
import type { Cliente, Estagio, HistoricoAcao, Assinatura, OnboardProgresso } from './types';

// ============================================================
// CLIENTES
// ============================================================

export async function criarCliente(dados: Omit<Cliente, 'id' | 'data_criacao' | 'data_atualizacao'>) {
  const { data, error } = await supabase
    .from('clientes')
    .insert([{ ...dados, status: 'recebido' }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar cliente: ${error.message}`);

  // Criar estágio inicial
  await criarEstagio({
    cliente_id: data.id,
    estagio: 'recebido',
    acao_proxima: 'Enviar mensagem de boas-vindas via WhatsApp com template #BOASVINDAS',
    pendente_cliente: false,
  });

  // Registrar no histórico
  await registrarHistorico(data.id, 'cliente_criado', `Cliente ${dados.nome} criado no sistema.`);

  return data as Cliente;
}

export async function obterCliente(clienteId: string): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', clienteId)
    .single();

  if (error) throw new Error(`Erro ao obter cliente: ${error.message}`);
  return data as Cliente;
}

export async function listarClientes(filtro?: { status?: string; nicho?: string }): Promise<Cliente[]> {
  let query = supabase.from('clientes').select('*');

  if (filtro?.status) query = query.eq('status', filtro.status);
  if (filtro?.nicho)  query = query.eq('nicho', filtro.nicho);

  const { data, error } = await query.order('data_criacao', { ascending: false });

  if (error) throw new Error(`Erro ao listar clientes: ${error.message}`);
  return (data ?? []) as Cliente[];
}

export async function atualizarCliente(clienteId: string, dados: Partial<Cliente>) {
  const { error } = await supabase
    .from('clientes')
    .update(dados)
    .eq('id', clienteId);

  if (error) throw new Error(`Erro ao atualizar cliente: ${error.message}`);
}

export async function avancarEstagio(clienteId: string, novoEstagio: string, acaoProxima: string) {
  // Finaliza o estágio atual
  const estagioAtivo = await obterEstagioAtivo(clienteId);
  if (estagioAtivo) {
    await supabase
      .from('estagios_operacionais')
      .update({ data_saida: new Date().toISOString() })
      .eq('id', estagioAtivo.id);
  }

  // Mapeia estágio → status do cliente
  const statusMap: Record<string, string> = {
    recebido:      'recebido',
    onboarding:    'onboarding',
    setup_trafego: 'setup_trafego',
    ativo:         'ativo',
    congelado:     'congelado',
    cancelado:     'cancelado',
  };

  const novoStatus = statusMap[novoEstagio] ?? novoEstagio;
  await atualizarCliente(clienteId, { status: novoStatus as Cliente['status'] });

  // Cria novo estágio
  const novoEsTagioData = await criarEstagio({
    cliente_id:      clienteId,
    estagio:         novoEstagio,
    acao_proxima:    acaoProxima,
    pendente_cliente: false,
  });

  // Registra no histórico
  await registrarHistorico(
    clienteId,
    'avanco_estagio',
    `Cliente avançou para o estágio "${novoEstagio}". Próxima ação: ${acaoProxima}`,
  );

  return novoEsTagioData;
}

// ============================================================
// ESTAGIOS OPERACIONAIS
// ============================================================

export async function criarEstagio(dados: {
  cliente_id:       string;
  estagio:          string;
  acao_proxima:     string;
  pendente_cliente?: boolean;
}): Promise<Estagio> {
  const { data, error } = await supabase
    .from('estagios_operacionais')
    .insert([dados])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar estágio: ${error.message}`);
  return data as Estagio;
}

export async function obterEstagioAtivo(clienteId: string): Promise<Estagio | null> {
  const { data, error } = await supabase
    .from('estagios_operacionais')
    .select('*')
    .eq('cliente_id', clienteId)
    .is('data_saida', null)
    .order('data_entrada', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Erro ao obter estágio: ${error.message}`);
  return data as Estagio | null;
}

export async function congelarCliente(clienteId: string) {
  const estagioAtivo = await obterEstagioAtivo(clienteId);
  const estagioAnterior = estagioAtivo?.estagio ?? 'desconhecido';

  await avancarEstagio(
    clienteId,
    'congelado',
    'Aguardando retorno do cliente. Alerta automático em 48h.',
  );

  // Registrar alerta de 48h na tabela alertas (sem setTimeout — processado por cron)
  const disparaEm = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await supabase.from('alertas').insert({
    cliente_id:   clienteId,
    tipo_alerta:  'pendencia_48h',
    mensagem:     `Cliente sem retorno há 48h. Estava no estágio "${estagioAnterior}". Reativar contato.`,
    dispara_em:   disparaEm.toISOString(),
    disparado:    false,
  });

  await registrarHistorico(
    clienteId,
    'cliente_congelado',
    'Cliente movido para "Retidos". Aguardando resposta. Alerta agendado para 48h.',
  );
}

export async function descongelarCliente(clienteId: string, estagioRetorno: string, acaoProxima: string) {
  // Cancelar alertas pendentes deste cliente
  await supabase
    .from('alertas')
    .update({ disparado: true, data_disparo: new Date().toISOString() })
    .eq('cliente_id', clienteId)
    .eq('tipo_alerta', 'pendencia_48h')
    .eq('disparado', false);

  await avancarEstagio(clienteId, estagioRetorno, acaoProxima);
  await registrarHistorico(clienteId, 'cliente_descongelado', `Cliente descongelado. Retornando ao estágio "${estagioRetorno}".`);
}

// ============================================================
// HISTORICO
// ============================================================

export async function registrarHistorico(
  clienteId:      string,
  tipoAcao:       string,
  descricao:      string,
  valorImpactado?: number,
  metadata?:       Record<string, unknown>,
) {
  const { error } = await supabase.from('historico_acoes').insert({
    cliente_id:      clienteId,
    tipo_acao:       tipoAcao,
    descricao,
    valor_impactado: valorImpactado ?? null,
    metadata:        metadata ?? {},
  });

  if (error) console.error(`[Histórico] Erro ao registrar: ${error.message}`);
}

export async function obterHistoricoCliente(clienteId: string): Promise<HistoricoAcao[]> {
  const { data, error } = await supabase
    .from('historico_acoes')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('data_acao', { ascending: false })
    .limit(50);

  if (error) throw new Error(`Erro ao obter histórico: ${error.message}`);
  return (data ?? []) as HistoricoAcao[];
}

// ============================================================
// ASSINATURAS
// ============================================================

export async function criarAssinatura(dados: {
  cliente_id:              string;
  plano_nome:              string;
  valor_mensal:            number;
  asaas_subscription_id?:  string;
}): Promise<Assinatura> {
  const dataProximaCobranca = new Date();
  dataProximaCobranca.setMonth(dataProximaCobranca.getMonth() + 1);

  const { data, error } = await supabase
    .from('assinaturas')
    .insert([{
      ...dados,
      status: 'ativa',
      dias_atraso: 0,
      data_inicio: new Date().toISOString(),
      data_proxima_cobranca: dataProximaCobranca.toISOString(),
    }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar assinatura: ${error.message}`);

  await registrarHistorico(
    dados.cliente_id,
    'assinatura_criada',
    `Assinatura "${dados.plano_nome}" criada. Valor: R$ ${dados.valor_mensal.toFixed(2)}/mês.`,
    dados.valor_mensal,
  );

  return data as Assinatura;
}

export async function obterAssinaturaCliente(clienteId: string): Promise<Assinatura | null> {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('*')
    .eq('cliente_id', clienteId)
    .maybeSingle();

  if (error) throw new Error(`Erro ao obter assinatura: ${error.message}`);
  return data as Assinatura | null;
}

// ============================================================
// ONBOARD PROGRESSO
// ============================================================

export async function obterProgressoOnboard(clienteId: string): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from('onboard_progresso')
    .select('progresso')
    .eq('cliente_id', clienteId)
    .maybeSingle();

  if (error) throw new Error(`Erro ao obter progresso: ${error.message}`);
  return (data?.progresso ?? {}) as Record<string, boolean>;
}

export async function salvarProgressoOnboard(
  clienteId: string,
  progresso: Record<string, boolean>,
) {
  const { error } = await supabase
    .from('onboard_progresso')
    .upsert({ cliente_id: clienteId, progresso })
    .eq('cliente_id', clienteId);

  if (error) throw new Error(`Erro ao salvar progresso: ${error.message}`);
}

// ============================================================
// ALERTAS
// ============================================================

export async function obterAlertasPendentes(clienteId?: string) {
  let query = supabase
    .from('alertas')
    .select('*, clientes(id, nome, whatsapp)')
    .eq('disparado', false)
    .lte('dispara_em', new Date().toISOString())
    .order('dispara_em', { ascending: true });

  if (clienteId) query = query.eq('cliente_id', clienteId);

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao obter alertas: ${error.message}`);
  return data ?? [];
}
```

---

## 5. ARQUIVO: `src/lib/types.ts`

```typescript
export type ClienteStatus =
  | 'recebido'
  | 'onboarding'
  | 'setup_trafego'
  | 'ativo'
  | 'congelado'
  | 'cancelado';

export type AssinaturaStatus =
  | 'ativa'
  | 'atraso_7_dias'
  | 'atraso_15_dias'
  | 'cancelado_debito';

export interface Cliente {
  id:                    string;
  nome:                  string;
  email:                 string;
  whatsapp:              string;
  dominio:               string | null;
  nicho:                 string;
  status:                ClienteStatus;
  google_ads_customer_id: string | null;
  ga4_property_id:        string | null;
  cor_tema:              string;
  notas_internas:        string | null;
  metadata:              Record<string, unknown>;
  data_criacao:          string;
  data_atualizacao:      string;
}

export interface Estagio {
  id:               string;
  cliente_id:       string;
  estagio:          string;
  acao_proxima:     string;
  pendente_cliente: boolean;
  data_entrada:     string;
  data_saida:       string | null;
  created_at:       string;
}

export interface Assinatura {
  id:                     string;
  cliente_id:             string;
  plano_nome:             string;
  valor_mensal:           number;
  status:                 AssinaturaStatus;
  data_inicio:            string;
  data_proxima_cobranca:  string;
  asaas_subscription_id:  string | null;
  dias_atraso:            number;
  created_at:             string;
  updated_at:             string;
}

export interface HistoricoAcao {
  id:              string;
  cliente_id:      string;
  tipo_acao:       string;
  descricao:       string;
  valor_impactado: number | null;
  usuario_id:      string | null;
  data_acao:       string;
  metadata:        Record<string, unknown>;
}

export interface CustoDetalhe {
  id:        string;
  nome:      string;
  valor:     number;
  tipo:      'fixo' | 'variavel';
  descricao: string | null;
  ativo:     boolean;
}

export interface ConfigFinanceira {
  id:                             string;
  agencia_id:                     string;
  custos_fixos_mensais:           number;
  custos_variaveis_percentual:    number;
  margem_lucro_minima:            number;
  saldo_google_ads_limite_alerta: number;
}

export interface OnboardProgresso {
  cliente_id: string;
  progresso:  Record<string, boolean>;
  updated_at: string;
}

export interface RelatorioMensal {
  id:               string;
  cliente_id:       string;
  mes_ano:          string;
  mrr:              number | null;
  investimento_ads: number | null;
  conversoes:       number | null;
  cpa:              number | null;
  cliques:          number | null;
  impressoes:       number | null;
  ctr:              number | null;
  sessoes_ga4:      number | null;
  novos_usuarios:   number | null;
  taxa_engajamento: number | null;
  roi:              number | null;
  markdown_content: string | null;
  status_geracao:   'pendente' | 'processando' | 'completo' | 'erro';
  created_at:       string;
}
```

---

## 6. EDGE FUNCTION: `supabase/functions/webhook-asaas/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const evento  = payload.event as string;
    const pagamento = payload.payment;

    console.log(`[ASAAS WEBHOOK] Evento: ${evento}`);

    // ============================================================
    // PAGAMENTO RECEBIDO → criar/ativar cliente
    // ============================================================
    if (evento === 'PAYMENT_RECEIVED') {
      const subscriptionId = pagamento.subscription;
      const valorPago      = pagamento.value as number;

      // Verificar se já existe assinatura com este subscription_id
      const { data: assinaturaExistente } = await supabase
        .from('assinaturas')
        .select('id, cliente_id, dias_atraso')
        .eq('asaas_subscription_id', subscriptionId)
        .maybeSingle();

      if (assinaturaExistente) {
        // Pagamento de assinatura existente — zerar atraso
        await supabase
          .from('assinaturas')
          .update({
            status:                'ativa',
            dias_atraso:           0,
            data_proxima_cobranca: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at:            new Date().toISOString(),
          })
          .eq('id', assinaturaExistente.id);

        // Se cliente estava cancelado por débito, reativar
        const { data: cliente } = await supabase
          .from('clientes')
          .select('id, status')
          .eq('id', assinaturaExistente.cliente_id)
          .single();

        if (cliente?.status === 'cancelado') {
          await supabase
            .from('clientes')
            .update({ status: 'ativo' })
            .eq('id', cliente.id);
        }

        await supabase.from('historico_acoes').insert({
          cliente_id:      assinaturaExistente.cliente_id,
          tipo_acao:       'pagamento_recebido',
          descricao:       `Pagamento de R$ ${valorPago.toFixed(2)} recebido via Asaas.`,
          valor_impactado: valorPago,
          metadata:        { asaas_subscription_id: subscriptionId, event: evento },
        });

      } else {
        // Primeira vez: criar cliente e assinatura
        const customer = payload.customer ?? {};

        const { data: novoCliente, error: errCliente } = await supabase
          .from('clientes')
          .insert({
            nome:     customer.name       ?? 'Cliente sem nome',
            email:    customer.email      ?? `${subscriptionId}@sem-email.com`,
            whatsapp: customer.mobilePhone ?? '',
            nicho:    'a_definir',
            status:   'recebido',
          })
          .select()
          .single();

        if (errCliente) throw new Error(`Erro ao criar cliente: ${errCliente.message}`);

        // Criar assinatura
        const dataProxima = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await supabase.from('assinaturas').insert({
          cliente_id:              novoCliente.id,
          plano_nome:              'Plano Adsgator',
          valor_mensal:            valorPago,
          status:                  'ativa',
          dias_atraso:             0,
          asaas_subscription_id:   subscriptionId,
          data_proxima_cobranca:   dataProxima.toISOString(),
        });

        // Criar estágio inicial
        await supabase.from('estagios_operacionais').insert({
          cliente_id:       novoCliente.id,
          estagio:          'recebido',
          acao_proxima:     'Enviar mensagem de boas-vindas via WhatsApp com template #BOASVINDAS',
          pendente_cliente: false,
        });

        // Registrar histórico
        await supabase.from('historico_acoes').insert({
          cliente_id:      novoCliente.id,
          tipo_acao:       'cliente_criado_automaticamente',
          descricao:       `Cliente criado automaticamente via Asaas. Primeiro pagamento: R$ ${valorPago.toFixed(2)}.`,
          valor_impactado: valorPago,
          metadata:        { asaas_subscription_id: subscriptionId, source: 'webhook_asaas' },
        });

        // Criar alerta de ação imediata
        await supabase.from('alertas').insert({
          cliente_id:  novoCliente.id,
          tipo_alerta: 'acao_imediata',
          mensagem:    '🔔 Novo cliente recebido! Enviar #BOASVINDAS agora.',
          dispara_em:  new Date().toISOString(), // imediato
          disparado:   false,
        });
      }
    }

    // ============================================================
    // COBRANÇA VENCIDA → régua de cobrança
    // ============================================================
    if (evento === 'PAYMENT_OVERDUE') {
      const subscriptionId = pagamento.subscription;
      const diasAtraso     = pagamento.daysOverdue as number;

      const { data: assinatura } = await supabase
        .from('assinaturas')
        .select('id, cliente_id, dias_atraso, valor_mensal, clientes(nome)')
        .eq('asaas_subscription_id', subscriptionId)
        .maybeSingle();

      if (!assinatura) {
        return new Response(JSON.stringify({ ignored: true }), { status: 200, headers: corsHeaders });
      }

      // Processar apenas se o nível de atraso subiu (evita re-processamento)
      if (diasAtraso >= 7 && diasAtraso < 15 && assinatura.dias_atraso < 7) {
        await supabase.from('assinaturas').update({ dias_atraso: 7, status: 'atraso_7_dias' }).eq('id', assinatura.id);
        await supabase.from('historico_acoes').insert({
          cliente_id:      assinatura.cliente_id,
          tipo_acao:       'alerta_atraso_7_dias',
          descricao:       '⚠️ Pagamento com 7 dias de atraso. Suspensão de campanhas iminente em 8 dias.',
          valor_impactado: assinatura.valor_mensal,
          metadata:        { dias_atraso: 7, marcador: 'laranja' },
        });
        await supabase.from('estagios_operacionais').insert({
          cliente_id:       assinatura.cliente_id,
          estagio:          'alerta_financeiro_7d',
          acao_proxima:     'Contatar cliente via WhatsApp avisando sobre suspensão iminente de campanhas',
          pendente_cliente: true,
        });
      }

      if (diasAtraso >= 15 && diasAtraso < 30 && assinatura.dias_atraso < 15) {
        await supabase.from('assinaturas').update({ dias_atraso: 15, status: 'atraso_15_dias' }).eq('id', assinatura.id);
        await supabase.from('historico_acoes').insert({
          cliente_id:      assinatura.cliente_id,
          tipo_acao:       'notificacao_quebra_contrato',
          descricao:       '🔴 Pagamento com 15 dias de atraso. Contrato quebrado. Aguardando instrução para remover LP.',
          valor_impactado: assinatura.valor_mensal,
          metadata:        { dias_atraso: 15, marcador: 'vermelho' },
        });
      }

      if (diasAtraso >= 30 && assinatura.dias_atraso < 30) {
        await supabase.from('assinaturas').update({ dias_atraso: 30, status: 'cancelado_debito' }).eq('id', assinatura.id);
        await supabase.from('clientes').update({ status: 'cancelado' }).eq('id', assinatura.cliente_id);
        await supabase.from('historico_acoes').insert({
          cliente_id:      assinatura.cliente_id,
          tipo_acao:       'cancelamento_automatico_30_dias',
          descricao:       '❌ Assinatura cancelada. 30+ dias de atraso. Ação necessária: remover LP e assets do Storage.',
          valor_impactado: assinatura.valor_mensal,
          metadata:        { dias_atraso: 30, status_final: 'cancelado_debito' },
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[WEBHOOK ERRO]', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
```

---

## 7. EDGE FUNCTION: `supabase/functions/processar-alertas/index.ts`
> Substitui o `setTimeout`. Agende esta função via cron no Supabase (a cada hora).

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    // Buscar todos os alertas vencidos e ainda não disparados
    const { data: alertas, error } = await supabase
      .from('alertas')
      .select('*, clientes(id, nome)')
      .eq('disparado', false)
      .lte('dispara_em', new Date().toISOString());

    if (error) throw new Error(error.message);
    if (!alertas || alertas.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhum alerta pendente.' }), { status: 200 });
    }

    for (const alerta of alertas) {
      console.log(`[ALERTA] ${alerta.tipo_alerta} — ${alerta.clientes?.nome}`);

      // Marcar como disparado
      await supabase
        .from('alertas')
        .update({ disparado: true, data_disparo: new Date().toISOString() })
        .eq('id', alerta.id);

      // Registrar no histórico do cliente
      await supabase.from('historico_acoes').insert({
        cliente_id: alerta.cliente_id,
        tipo_acao:  `alerta_${alerta.tipo_alerta}`,
        descricao:  alerta.mensagem,
        metadata:   { alerta_id: alerta.id },
      });
    }

    return new Response(
      JSON.stringify({ success: true, processados: alertas.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
```

---

## 8. ARQUIVO: `.env.local`

```bash
# ─── Supabase ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://[SEU_PROJETO].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUA_CHAVE_ANONIMA]
SUPABASE_SERVICE_ROLE_KEY=[SUA_CHAVE_SERVICE_ROLE]

# ─── Asaas ─────────────────────────────────────────────────
ASAAS_API_KEY=[SUA_CHAVE_API_ASAAS]
ASAAS_WEBHOOK_KEY=[SUA_CHAVE_WEBHOOK_ASAAS]

# ─── Google Ads API ─────────────────────────────────────────
GOOGLE_ADS_CLIENT_ID=[SEU_CLIENT_ID]
GOOGLE_ADS_CLIENT_SECRET=[SEU_CLIENT_SECRET]
GOOGLE_ADS_DEVELOPER_TOKEN=[SEU_DEVELOPER_TOKEN]
GOOGLE_ADS_MANAGER_ID=[SEU_MCC_ID]
GOOGLE_ADS_REFRESH_TOKEN=[SEU_REFRESH_TOKEN]

# ─── Google Analytics 4 ─────────────────────────────────────
# Coloque o JSON da Service Account em: /credentials/ga4-service-account.json
# E aponte a variável para o caminho:
GOOGLE_APPLICATION_CREDENTIALS=./credentials/ga4-service-account.json

# ─── App ────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 9. DIAGRAMA DE FLUXO

```
ASAAS (Pagamento)
       │
       ▼ Edge Function webhook-asaas
┌──────────────────┐
│   CLIENTES       │──── status: recebido → onboarding → setup_trafego → ativo
│   (estado atual) │         └── congelado (pendência)
└──────────────────┘         └── cancelado (30d atraso)
       │
       ├──► ASSINATURAS (valor, dias_atraso, status_financeiro)
       │
       ├──► ESTAGIOS_OPERACIONAIS (ação_proxima = instrução exata da UI)
       │
       ├──► CAMPANHAS_ADS (dados do Google Ads)
       │
       ├──► ONBOARD_PROGRESSO (checklist por cliente)
       │
       ├──► ALERTAS (disparados pela Edge Function de cron)
       │
       └──► HISTORICO_ACOES (auditoria imutável de tudo)
```

---

## ✅ Checklist de Implementação

- [ ] Executar o SQL completo no Supabase SQL Editor
- [ ] Criar projeto no Supabase e copiar as chaves para `.env.local`
- [ ] Deploy da Edge Function `webhook-asaas`
- [ ] Deploy da Edge Function `processar-alertas`
- [ ] Configurar cron no Supabase para `processar-alertas` (a cada 1 hora)
- [ ] Configurar webhook no painel do Asaas apontando para a URL da Edge Function
- [ ] Verificar que RLS está ativo nas tabelas (já habilitado pelo SQL acima)
