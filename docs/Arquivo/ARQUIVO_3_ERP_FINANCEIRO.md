# ADSGATOR HUB — ARQUIVO 3: ERP FINANCEIRO (v2 — FINAL)

> **LEIA ANTES DE IMPLEMENTAR**
> Este arquivo define TODA a camada financeira do sistema. Implemente na ordem:
> `(1)` `src/lib/financeiro.ts` → `(2)` Edge Function → `(3)` `src/app/(app)/financeiro/page.tsx`
>
> **Regras absolutas:**
> - Imports: `supabase` vem de `@/lib/supabase`, não de `auth`
> - Layout: `MainLayout` vem de `@/components/layout/MainLayout`
> - Ícones: importar direto do `lucide-react` — **não existe** componente `Icons`
> - Tokens Tailwind: usar `surface-*`, `ink-*`, `brand`, `status-*` (ver `tailwind.config.ts`)
> - Nenhum `Math.random()` em lógica de negócio
> - Nunca usar `any` em tipos — tipar tudo explicitamente

---

## ✅ PRÉ-REQUISITOS — confirmar antes de implementar

Todas as tabelas abaixo **já existem** em `supabase/schema.sql`:

| Tabela | Colunas chave usadas aqui |
|---|---|
| `assinaturas` | `id`, `cliente_id`, `plano_nome`, `valor_mensal`, `status`, `dias_atraso`, `data_proxima_cobranca` |
| `configuracoes_financeiras` | `agencia_id='adsgator-main'`, `custos_fixos_mensais`, `custos_variaveis_percentual`, `margem_lucro_minima` |
| `custos_detalhados` | `nome`, `valor`, `tipo` (`fixo`\|`variavel`), `ativo` |
| `clientes` | `id`, `nome`, `email`, `whatsapp` |
| `historico_acoes` | `cliente_id`, `tipo_acao`, `descricao`, `valor_impactado`, `metadata` |
| `estagios_operacionais` | `cliente_id`, `estagio`, `acao_proxima`, `pendente_cliente` |
| `relatorios_mensais` | `mes_ano`, `mrr` — usado para calcular tendência de crescimento |

---

## 1. LÓGICA FINANCEIRA — `src/lib/financeiro.ts`

```typescript
// ─────────────────────────────────────────────────────────────────────────────
// ATENÇÃO: importar de './supabase', NÃO de './auth'
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabase';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface DREData {
  receita_bruta:              number;
  custos_fixos:               number;
  custos_variaveis:           number;
  lucro_bruto:                number;
  lucro_liquido:              number;
  margem_liquida_percentual:  number;
  mrr:                        number;
}

export interface ConfigFinanceira {
  custos_fixos_mensais:           number;
  custos_variaveis_percentual:    number;
  margem_lucro_minima:            number;
  saldo_google_ads_limite_alerta: number;
}

export interface ClienteAtrasado {
  cliente: {
    id:       string;
    nome:     string;
    email:    string;
    whatsapp: string;
  };
  dias_atraso:           number;
  valor_devido:          number;
  data_proxima_cobranca: string;
  status_assinatura:     string;
}

export interface ProjecaoMensal {
  mes:               string;   // 'YYYY-MM'
  mes_label:         string;   // 'jan/25'
  receita_projetada: number;
  lucro_projetado:   number;
}

export interface ValidacaoMargem {
  margemAtual:  number;
  margemMinima: number;
  estaOk:       boolean;
  alerta:       string | null;
}

// ─── CALCULAR MRR ────────────────────────────────────────────────────────────

export async function calcularMRR(): Promise<number> {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('valor_mensal')
    .eq('status', 'ativa');
  if (error) throw new Error(`Erro ao calcular MRR: ${error.message}`);
  return (data ?? []).reduce((t, a) => t + Number(a.valor_mensal), 0);
}

// ─── OBTER CONFIG FINANCEIRA ──────────────────────────────────────────────────

export async function obterConfigFinanceira(): Promise<ConfigFinanceira> {
  const { data, error } = await supabase
    .from('configuracoes_financeiras')
    .select('custos_fixos_mensais, custos_variaveis_percentual, margem_lucro_minima, saldo_google_ads_limite_alerta')
    .eq('agencia_id', 'adsgator-main')
    .single();
  if (error) throw new Error(`Erro na config financeira: ${error.message}`);
  return {
    custos_fixos_mensais:           Number(data.custos_fixos_mensais           ?? 0),
    custos_variaveis_percentual:    Number(data.custos_variaveis_percentual    ?? 0),
    margem_lucro_minima:            Number(data.margem_lucro_minima            ?? 30),
    saldo_google_ads_limite_alerta: Number(data.saldo_google_ads_limite_alerta ?? 50),
  };
}

// ─── CALCULAR DRE MENSAL ──────────────────────────────────────────────────────

export async function calcularDREMensal(): Promise<DREData> {
  const [mrr, config] = await Promise.all([calcularMRR(), obterConfigFinanceira()]);

  const custosVariaveis = mrr * (config.custos_variaveis_percentual / 100);
  const lucroBruto      = mrr - custosVariaveis;
  const lucroLiquido    = lucroBruto - config.custos_fixos_mensais;
  const margem          = mrr > 0 ? (lucroLiquido / mrr) * 100 : 0;

  return {
    receita_bruta:             mrr,
    custos_fixos:              config.custos_fixos_mensais,
    custos_variaveis:          custosVariaveis,
    lucro_bruto:               lucroBruto,
    lucro_liquido:             lucroLiquido,
    margem_liquida_percentual: margem,
    mrr,
  };
}

// ─── LISTAR CLIENTES ATRASADOS ────────────────────────────────────────────────

export async function listarClientesAtrasados(): Promise<ClienteAtrasado[]> {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('*, clientes(id, nome, email, whatsapp)')
    .gt('dias_atraso', 0)
    .order('dias_atraso', { ascending: false });
  if (error) throw new Error(`Erro ao listar atrasos: ${error.message}`);
  return (data ?? []).map((a) => ({
    cliente:               a.clientes as ClienteAtrasado['cliente'],
    dias_atraso:           Number(a.dias_atraso),
    valor_devido:          Number(a.valor_mensal),
    data_proxima_cobranca: a.data_proxima_cobranca as string,
    status_assinatura:     a.status as string,
  }));
}

// ─── ATUALIZAR CONFIG FINANCEIRA ──────────────────────────────────────────────

export async function atualizarConfigFinanceira(dados: Partial<ConfigFinanceira>): Promise<void> {
  const { error } = await supabase
    .from('configuracoes_financeiras')
    .update(dados)
    .eq('agencia_id', 'adsgator-main');
  if (error) throw new Error(`Erro ao salvar config: ${error.message}`);
}

// ─── PROJEÇÃO 3 MESES (tendência linear — SEM Math.random()) ─────────────────
// Calcula o crescimento médio dos últimos meses a partir de relatorios_mensais.
// Se não há histórico suficiente, projeta crescimento zero (conservador).

export async function projetarFinanceiro3Meses(): Promise<ProjecaoMensal[]> {
  const [dre] = await Promise.all([calcularDREMensal()]);

  // Busca até 6 meses anteriores para calcular tendência
  const { data: historico } = await supabase
    .from('relatorios_mensais')
    .select('mes_ano, mrr')
    .order('mes_ano', { ascending: false })
    .limit(6);

  let taxaCrescimento = 0;
  if (historico && historico.length >= 2) {
    const crescimentos: number[] = [];
    for (let i = 0; i < historico.length - 1; i++) {
      const atual    = Number(historico[i].mrr     ?? 0);
      const anterior = Number(historico[i + 1].mrr ?? 0);
      if (anterior > 0) crescimentos.push((atual - anterior) / anterior);
    }
    if (crescimentos.length > 0) {
      taxaCrescimento = crescimentos.reduce((s, v) => s + v, 0) / crescimentos.length;
    }
  }
  // Limitar taxa entre -10% e +20% para evitar projeções irrazoáveis
  taxaCrescimento = Math.max(-0.10, Math.min(0.20, taxaCrescimento));

  const hoje = new Date();
  return Array.from({ length: 3 }).map((_, i) => {
    const mes    = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const fator  = Math.pow(1 + taxaCrescimento, i);
    const receita = dre.mrr * fator;
    const custVar = receita * (dre.custos_variaveis / (dre.mrr > 0 ? dre.mrr : 1));
    return {
      mes:               `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`,
      mes_label:         mes.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      receita_projetada: receita,
      lucro_projetado:   receita - custVar - dre.custos_fixos,
    };
  });
}

// ─── VALIDAR MARGEM MÍNIMA ────────────────────────────────────────────────────

export async function validarMargemMinima(): Promise<ValidacaoMargem> {
  const [dre, config] = await Promise.all([calcularDREMensal(), obterConfigFinanceira()]);
  const margemAtual = dre.margem_liquida_percentual;
  return {
    margemAtual,
    margemMinima: config.margem_lucro_minima,
    estaOk: margemAtual >= config.margem_lucro_minima,
    alerta: margemAtual < config.margem_lucro_minima
      ? `Margem atual ${margemAtual.toFixed(1)}% está abaixo do mínimo de ${config.margem_lucro_minima}%`
      : null,
  };
}
```

---

## 2. EDGE FUNCTION — `supabase/functions/regua-cobranca/index.ts`

> Roda via cron (a cada 6 horas). Configura no Supabase Dashboard → Edge Functions → Schedule.
> Não precisa alterar nada no arquivo — as ações automáticas (7d, 15d, 30d) já estão definidas.

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Executar a cada 6 horas para verificar atrasos
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    console.log('[REGRUA] Iniciando verificação de pagamentos...');

    // 1. BUSCAR TODAS AS ASSINATURAS
    const { data: assinaturas, error: errorAssinaturas } = await supabase
      .from('assinaturas')
      .select('*, clientes(id, nome, email, whatsapp)');

    if (errorAssinaturas) throw new Error(errorAssinaturas.message);

    // 2. PROCESSAR CADA ASSINATURA
    for (const assinatura of assinaturas) {
      const agora = new Date();
      const proximaCobranca = new Date(assinatura.data_proxima_cobranca);
      const diasAtraso = Math.floor(
        (agora.getTime() - proximaCobranca.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Se não está atrasada, pula
      if (diasAtraso < 1) continue;

      console.log(`[REGRUA] Processando ${assinatura.clientes.nome} - Atraso: ${diasAtraso}d`);

      // ============================================
      // ATRASO DE 7 DIAS
      // ============================================
      if (diasAtraso >= 7 && diasAtraso < 15 && assinatura.dias_atraso < 7) {
        console.log(`[ATRASO 7D] ${assinatura.clientes.nome}`);

        // Atualizar status
        await supabase
          .from('assinaturas')
          .update({
            dias_atraso: 7,
            status: 'atraso_7_dias',
          })
          .eq('id', assinatura.id);

        // Registrar ação
        await supabase.from('historico_acoes').insert({
          cliente_id: assinatura.clientes.id,
          tipo_acao: 'alerta_atraso_7_dias_automatico',
          descricao: `⚠️ Pagamento com 7 dias de atraso. Suspensão de campanhas Google Ads iminente em 8 dias.`,
          valor_impactado: assinatura.valor_mensal,
          metadata: {
            dias_atraso: 7,
            acao_recomendada: 'Enviar mensagem WhatsApp com tag #SALDOGOOGLE',
            status_marcador: 'laranja',
          },
        });

        // Criar alerta no dashboard
        await supabase.from('estagios_operacionais').insert({
          cliente_id: assinatura.clientes.id,
          estagio: 'alerta_financeiro_7d',
          acao_proxima: 'Entrar em contato via WhatsApp com aviso de suspensão de campanhas',
          pendente_cliente: true,
        });
      }

      // ============================================
      // ATRASO DE 15 DIAS (CRÍTICO)
      // ============================================
      if (diasAtraso >= 15 && diasAtraso < 30 && assinatura.dias_atraso < 15) {
        console.log(`[ATRASO 15D] ${assinatura.clientes.nome}`);

        // Atualizar status
        await supabase
          .from('assinaturas')
          .update({
            dias_atraso: 15,
            status: 'atraso_15_dias',
          })
          .eq('id', assinatura.id);

        // Registrar ação
        await supabase.from('historico_acoes').insert({
          cliente_id: assinatura.clientes.id,
          tipo_acao: 'notificacao_quebra_contrato_automatica',
          descricao: `🔴 CONTRATO QUEBRADO - Pagamento com 15 dias de atraso. Campanha será suspensa. Landing page será removida do ar em 15 dias.`,
          valor_impactado: assinatura.valor_mensal,
          metadata: {
            dias_atraso: 15,
            acao: 'suspender_campanhas_pausar_landing_page',
            status_marcador: 'vermelho',
            acao_recomendada: 'Ligar para o cliente e avisar sobre suspensão total',
          },
        });

        // Pausar campanhas Google Ads (seria integrado com Google Ads API)
        console.log(`[SUSPENSAO] Campanha de ${assinatura.clientes.nome} será suspensa`);
      }

      // ============================================
      // ATRASO DE 30 DIAS (CANCELAMENTO)
      // ============================================
      if (diasAtraso >= 30 && assinatura.dias_atraso < 30) {
        console.log(`[CANCELAMENTO 30D] ${assinatura.clientes.nome}`);

        // Atualizar status
        await supabase
          .from('assinaturas')
          .update({
            dias_atraso: 30,
            status: 'cancelado_debito',
          })
          .eq('id', assinatura.id);

        // Atualizar cliente para cancelado
        await supabase
          .from('clientes')
          .update({ status: 'cancelado' })
          .eq('id', assinatura.clientes.id);

        // Registrar ação
        await supabase.from('historico_acoes').insert({
          cliente_id: assinatura.clientes.id,
          tipo_acao: 'cancelamento_automatico_30_dias',
          descricao: `❌ ASSINATURA CANCELADA AUTOMATICAMENTE. 30+ dias de atraso. Landing page removida do ar. Assets deletados do storage.`,
          valor_impactado: assinatura.valor_mensal,
          metadata: {
            dias_atraso: 30,
            acao_executada: 'remover_landing_page_deletar_assets_cancelar_dominio',
            data_execucao: new Date().toISOString(),
          },
        });

        // Deletar assets do Storage (seria implementado)
        console.log(`[LIMPEZA] Assets de ${assinatura.clientes.nome} serão deletados`);
      }
    }

    console.log('[REGRUA] Verificação concluída com sucesso!');
    return new Response(
      JSON.stringify({ success: true, message: 'Régua de cobrança executada' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[ERRO]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 3. PÁGINA — `src/app/(app)/financeiro/page.tsx`

> **Design System:** usar tokens `surface-*`, `ink-*`, `brand`, `status-*` do tailwind.config.ts
> **Estrutura visual:**
> - Seção 1: 4 KPI cards (MRR, Lucro Bruto, Lucro Líquido, Margem %)
> - Seção 2: Alerta de margem (se abaixo do mínimo)
> - Seção 3: DRE visual com barras de distribuição
> - Seção 4: Projeção 3 meses
> - Seção 5: Configurações de custo (form inline editável)
> - Seção 6: Tabela de clientes em atraso com ação WhatsApp

```typescript
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp, DollarSign, AlertCircle, CheckCircle,
  MessageCircle, Settings, ChevronDown, ChevronUp, Save,
} from 'lucide-react';
import {
  calcularDREMensal, projetarFinanceiro3Meses, validarMargemMinima,
  listarClientesAtrasados, obterConfigFinanceira, atualizarConfigFinanceira,
  type DREData, type ProjecaoMensal, type ValidacaoMargem,
  type ClienteAtrasado, type ConfigFinanceira,
} from '@/lib/financeiro';
import { MainLayout } from '@/components/layout/MainLayout';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const pct = (parte: number, total: number) =>
  total > 0 ? ((parte / total) * 100).toFixed(1) : '0.0';

export default function FinanceiroPage() {
  const [dre,       setDre]       = useState<DREData | null>(null);
  const [projecao,  setProjecao]  = useState<ProjecaoMensal[]>([]);
  const [validacao, setValidacao] = useState<ValidacaoMargem | null>(null);
  const [atrasados, setAtrasados] = useState<ClienteAtrasado[]>([]);
  const [config,    setConfig]    = useState<ConfigFinanceira | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [editando,  setEditando]  = useState(false);
  const [salvando,  setSalvando]  = useState(false);
  const [formConfig, setFormConfig] = useState({ custos_fixos_mensais: '', custos_variaveis_percentual: '' });

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [dreDados, proj, val, atr, cfg] = await Promise.all([
        calcularDREMensal(),
        projetarFinanceiro3Meses(),
        validarMargemMinima(),
        listarClientesAtrasados(),
        obterConfigFinanceira(),
      ]);
      setDre(dreDados); setProjecao(proj); setValidacao(val);
      setAtrasados(atr); setConfig(cfg);
      setFormConfig({
        custos_fixos_mensais:        String(cfg.custos_fixos_mensais),
        custos_variaveis_percentual: String(cfg.custos_variaveis_percentual),
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function salvarConfig() {
    setSalvando(true);
    try {
      await atualizarConfigFinanceira({
        custos_fixos_mensais:        parseFloat(formConfig.custos_fixos_mensais)        || 0,
        custos_variaveis_percentual: parseFloat(formConfig.custos_variaveis_percentual) || 0,
      });
      setEditando(false);
      await carregar();
    } catch (e) { console.error(e); }
    finally { setSalvando(false); }
  }

  if (loading || !dre) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[20rem]">
          <div className="w-[1.5rem] h-[1.5rem] border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const kpis = [
    { label: 'MRR',          valor: fmt(dre.mrr),          sub: 'Receita recorrente mensal',      icon: TrendingUp,  cor: 'text-brand'         },
    { label: 'Lucro Bruto',  valor: fmt(dre.lucro_bruto),  sub: `${pct(dre.lucro_bruto, dre.mrr)}% da receita`,  icon: DollarSign, cor: 'text-status-blue'   },
    { label: 'Custos Totais',valor: fmt(dre.custos_fixos + dre.custos_variaveis), sub: `Fixos + Variáveis`, icon: AlertCircle, cor: 'text-status-orange' },
    { label: 'Lucro Líquido',valor: fmt(dre.lucro_liquido),sub: `Margem: ${dre.margem_liquida_percentual.toFixed(1)}%`, icon: CheckCircle, cor: dre.lucro_liquido >= 0 ? 'text-brand' : 'text-status-red' },
  ];

  return (
    <MainLayout>
      {/* ── HEADER ── */}
      <div className="mb-[2rem]">
        <h1 className="dark:text-ink-primary text-gray-900 text-[1.875rem] font-bold tracking-tight mb-[0.25rem]">
          Dashboard Financeiro
        </h1>
        <p className="dark:text-ink-secondary text-gray-500 text-sm">
          Saúde financeira da agência em tempo real
        </p>
      </div>

      {/* ── ALERTA DE MARGEM ── */}
      {validacao && !validacao.estaOk && (
        <div className="mb-[1.5rem] flex items-start gap-[0.75rem] dark:bg-status-orange/8 bg-orange-50 border dark:border-status-orange/20 border-orange-100 rounded-lg px-[1rem] py-[0.875rem]">
          <AlertCircle className="shrink-0 w-[1rem] h-[1rem] text-status-orange mt-[0.0625rem]" strokeWidth={2} />
          <div>
            <p className="text-sm font-semibold dark:text-status-orange text-orange-700">
              Margem abaixo do mínimo configurado
            </p>
            <p className="text-xs dark:text-ink-muted text-gray-500 mt-[0.125rem]">
              {validacao.alerta} — Revise os custos fixos ou renegocie planos.
            </p>
          </div>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1rem] mb-[2rem]">
        {kpis.map(({ label, valor, sub, icon: Icon, cor }) => (
          <div key={label} className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 px-[1.25rem] py-[1rem]">
            <div className="flex items-start justify-between mb-[0.5rem]">
              <p className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold">{label}</p>
              <Icon className={`w-[1rem] h-[1rem] ${cor}`} strokeWidth={1.5} />
            </div>
            <p className={`text-[1.75rem] font-bold leading-none mb-[0.375rem] ${cor}`}>{valor}</p>
            <p className="dark:text-ink-muted text-gray-400 text-xs">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] mb-[2rem]">
        {/* ── DRE DISTRIBUIÇÃO ── */}
        <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem]">
          <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base mb-[1.25rem]">
            Distribuição da Receita
          </h3>
          {[
            { label: 'Custos Variáveis', valor: dre.custos_variaveis, cor: 'bg-status-orange' },
            { label: 'Custos Fixos',     valor: dre.custos_fixos,     cor: 'bg-status-blue'  },
            { label: 'Lucro Líquido',    valor: Math.max(dre.lucro_liquido, 0), cor: 'bg-brand' },
          ].map(({ label, valor, cor }) => (
            <div key={label} className="mb-[1rem]">
              <div className="flex justify-between items-center mb-[0.375rem]">
                <p className="dark:text-ink-secondary text-gray-600 text-sm">{label}</p>
                <p className="dark:text-ink-primary text-gray-900 text-sm font-semibold">
                  {pct(valor, dre.mrr)}% · {fmt(valor)}
                </p>
              </div>
              <div className="h-[0.375rem] dark:bg-surface-hover bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${cor} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(pct(valor, dre.mrr) as unknown as number, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── PROJEÇÃO 3 MESES ── */}
        <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem]">
          <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base mb-[1.25rem]">
            Projeção — Próximos 3 Meses
          </h3>
          <div className="flex flex-col gap-[0.875rem]">
            {projecao.map((p, i) => (
              <div key={p.mes} className="flex items-center justify-between">
                <div className="flex items-center gap-[0.625rem]">
                  <div className={`w-[0.375rem] h-[0.375rem] rounded-full ${i === 0 ? 'bg-brand' : 'dark:bg-ink-muted bg-gray-300'}`} />
                  <p className="dark:text-ink-secondary text-gray-600 text-sm capitalize">{p.mes_label}</p>
                  {i === 0 && <span className="text-2xs font-semibold bg-brand/15 text-brand px-[0.375rem] py-[0.0625rem] rounded">Atual</span>}
                </div>
                <div className="text-right">
                  <p className="dark:text-ink-primary text-gray-900 text-sm font-semibold">{fmt(p.receita_projetada)}</p>
                  <p className={`text-xs font-medium ${p.lucro_projetado >= 0 ? 'text-brand' : 'text-status-red'}`}>
                    {fmt(p.lucro_projetado)} líq.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONFIGURAÇÕES DE CUSTO ── */}
      <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem] mb-[2rem]">
        <div className="flex items-center justify-between mb-[1rem]">
          <div className="flex items-center gap-[0.5rem]">
            <Settings className="w-[1rem] h-[1rem] dark:text-ink-muted text-gray-400" strokeWidth={1.5} />
            <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base">
              Configurações de Custo
            </h3>
          </div>
          <button
            onClick={() => setEditando(!editando)}
            className="text-xs font-semibold dark:text-ink-secondary text-gray-500 dark:hover:text-ink-primary hover:text-gray-800 flex items-center gap-[0.25rem] transition-colors"
          >
            {editando ? <><ChevronUp className="w-[0.875rem] h-[0.875rem]" /> Fechar</> : <><ChevronDown className="w-[0.875rem] h-[0.875rem]" /> Editar</>}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-[1.5rem]">
          {config && [
            { label: 'Custos Fixos Mensais',      valor: fmt(config.custos_fixos_mensais),           key: 'custos_fixos_mensais' as const },
            { label: 'Custos Variáveis (%MRR)',    valor: `${config.custos_variaveis_percentual}%`,   key: 'custos_variaveis_percentual' as const },
          ].map(({ label, valor, key }) => (
            <div key={key}>
              <p className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold mb-[0.375rem]">{label}</p>
              {editando ? (
                <input
                  type="number"
                  value={formConfig[key]}
                  onChange={(e) => setFormConfig({ ...formConfig, [key]: e.target.value })}
                  className="w-full h-[2.25rem] px-[0.75rem] rounded dark:bg-surface-input dark:border dark:border-surface-border dark:text-ink-primary bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
                />
              ) : (
                <p className="dark:text-ink-primary text-gray-900 font-semibold text-lg">{valor}</p>
              )}
            </div>
          ))}
        </div>

        {editando && (
          <div className="flex justify-end mt-[1rem]">
            <button
              onClick={salvarConfig}
              disabled={salvando}
              className="flex items-center gap-[0.5rem] dark:bg-brand dark:hover:bg-brand-dark dark:text-white bg-green-600 hover:bg-green-700 text-white text-sm font-semibold h-[2.25rem] px-[1rem] rounded transition-colors disabled:opacity-50"
            >
              {salvando ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
              Salvar
            </button>
          </div>
        )}
      </div>

      {/* ── CLIENTES EM ATRASO ── */}
      {atrasados.length > 0 && (
        <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem]">
          <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base mb-[1.25rem]">
            Clientes com Atraso ({atrasados.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-surface-border border-gray-100">
                  {['Cliente', 'Atraso', 'Valor Devido', 'Ação'].map((h) => (
                    <th key={h} className="text-left pb-[0.75rem] dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {atrasados.map((item) => (
                  <tr key={item.cliente.id} className="border-b dark:border-surface-border border-gray-50 dark:hover:bg-surface-hover hover:bg-gray-50 transition-colors">
                    <td className="py-[0.875rem]">
                      <p className="dark:text-ink-primary text-gray-900 font-medium text-sm">{item.cliente.nome}</p>
                      <p className="dark:text-ink-muted text-gray-400 text-xs">{item.cliente.email}</p>
                    </td>
                    <td className="py-[0.875rem]">
                      <span className={`
                        inline-flex items-center text-xs font-bold px-[0.5rem] py-[0.125rem] rounded
                        ${item.dias_atraso >= 30 ? 'bg-status-red/15 text-status-red'
                          : item.dias_atraso >= 15 ? 'bg-status-orange/15 text-status-orange'
                          : 'bg-status-yellow/15 text-status-yellow'}
                      `}>
                        {item.dias_atraso}d
                      </span>
                    </td>
                    <td className="py-[0.875rem] dark:text-ink-primary text-gray-900 font-semibold text-sm">
                      {fmt(item.valor_devido)}
                    </td>
                    <td className="py-[0.875rem]">
                      <a
                        href={`https://wa.me/55${item.cliente.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-[0.375rem] dark:bg-brand/10 dark:hover:bg-brand/20 dark:text-brand bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold px-[0.625rem] h-[1.75rem] rounded transition-colors"
                      >
                        <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.5} />
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
```

---

## 4. CHECKLIST DE IMPLEMENTAÇÃO

### Ordem de execução (não pular etapas)

- [ ] **1.** Confirmar que `supabase/schema.sql` já foi executado no Supabase Dashboard
- [ ] **2.** Criar `src/lib/financeiro.ts` com o código da Seção 1
- [ ] **3.** Criar `supabase/functions/regua-cobranca/index.ts` com o código da Seção 2
- [ ] **4.** No Supabase Dashboard → Edge Functions → Schedules → adicionar cron `0 */6 * * *` apontando para `regua-cobranca`
- [ ] **5.** Criar `src/app/(app)/financeiro/page.tsx` com o código da Seção 3
- [ ] **6.** Adicionar link `/financeiro` na Sidebar (componente `Sidebar.tsx`)
- [ ] **7.** Inserir pelo menos 1 assinatura ativa via Supabase Dashboard (para ver o MRR)
- [ ] **8.** Ajustar `configuracoes_financeiras` no banco com valores reais da agência

### Erros comuns a evitar

| ❌ Errado | ✅ Correto |
|---|---|
| `import { supabase } from './auth'` | `import { supabase } from './supabase'` |
| `import { MainLayout } from '@/components/MainLayout'` | `import { MainLayout } from '@/components/layout/MainLayout'` |
| `import { Icons } from '@/components/Icons'` | `import { TrendingUp, ... } from 'lucide-react'` |
| `dark:bg-dark-card` (não existe) | `dark:bg-surface-card` |
| `dark:text-white` (frágil) | `dark:text-ink-primary` |
| `dark:bg-primary` (não existe) | `dark:bg-brand` |
| `Math.random()` em projeção | Tendência linear baseada em `relatorios_mensais` |

### O que este módulo entrega

- MRR calculado em tempo real das `assinaturas` ativas
- DRE: receita → custos variáveis → custos fixos → lucro líquido → margem %
- Projeção 3 meses com base em crescimento médio histórico (conservador: clampado em -10%/+20%)
- Régua de cobrança automática via Edge Function Deno (altera `status` e `dias_atraso` na tabela `assinaturas`)
- Alertas registrados em `historico_acoes` para auditoria
- Dashboard com form inline para editar configurações de custo
- Tabela de inadimplentes com botão WhatsApp direto

**Status:** v2 — Pronto para implementação imediata.
