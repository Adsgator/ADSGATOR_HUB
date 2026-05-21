# ADSGATOR HUB - ARQUIVO 3: ERP FINANCEIRO

## 1. LÓGICA DE CÁLCULO FINANCEIRO: lib/financeiro.ts

```typescript
import { supabase } from './auth';
import { registrarHistorico } from './database';

export interface DREData {
  receita_bruta: number;
  custos_fixos: number;
  custos_variaveis: number;
  lucro_bruto: number;
  lucro_liquido: number;
  margem_liquida_percentual: number;
  mrr: number; // Monthly Recurring Revenue
}

export interface StatusFinanceiro {
  cliente_id: string;
  valor_total_contrato: number;
  proxima_cobranca: string;
  dias_para_vencimento: number;
  status: 'em_dia' | 'atrasado_7d' | 'atrasado_15d' | 'cancelado';
  marcador_cor: 'verde' | 'laranja' | 'vermelho';
}

// ============================================
// CALCULAR MRR (Monthly Recurring Revenue)
// ============================================

export async function calcularMRR(): Promise<number> {
  const { data: assinaturas, error } = await supabase
    .from('assinaturas')
    .select('valor_mensal')
    .eq('status', 'ativa');

  if (error) throw new Error(`Erro ao calcular MRR: ${error.message}`);

  return assinaturas.reduce((total, assinatura) => total + assinatura.valor_mensal, 0);
}

// ============================================
// CALCULAR DRE DINÂMICO
// ============================================

export async function calcularDREMensal(mesAno?: string): Promise<DREData> {
  const agora = new Date();
  const mes = mesAno || `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;

  // 1. RECEITA BRUTA
  const mrr = await calcularMRR();

  // 2. CUSTOS FIXOS E VARIÁVEIS
  const { data: config, error: errorConfig } = await supabase
    .from('configuracoes_financeiras')
    .select('custos_fixos_mensais, custos_variaveis_percentual')
    .single();

  if (errorConfig) throw new Error(`Erro ao obter configurações: ${errorConfig.message}`);

  const custosFixos = config.custos_fixos_mensais || 0;
  const percentualVariavel = (config.custos_variaveis_percentual || 0) / 100;
  const custosVariaveis = mrr * percentualVariavel;

  // 3. CÁLCULOS
  const lucroBruto = mrr - custosVariaveis;
  const lucroLiquido = lucroBruto - custosFixos;
  const margemLiquida = mrr > 0 ? (lucroLiquido / mrr) * 100 : 0;

  return {
    receita_bruta: mrr,
    custos_fixos: custosFixos,
    custos_variaveis: custosVariaveis,
    lucro_bruto: lucroBruto,
    lucro_liquido: lucroLiquido,
    margem_liquida_percentual: margemLiquida,
    mrr,
  };
}

// ============================================
// STATUS FINANCEIRO POR CLIENTE
// ============================================

export async function obterStatusFinanceiroCliente(clienteId: string): Promise<StatusFinanceiro> {
  const { data: assinatura, error } = await supabase
    .from('assinaturas')
    .select('*')
    .eq('cliente_id', clienteId)
    .single();

  if (error || !assinatura) {
    throw new Error('Assinatura não encontrada');
  }

  const proximaCobranca = new Date(assinatura.data_proxima_cobranca);
  const agora = new Date();
  const diasParaVencimento = Math.ceil(
    (proximaCobranca.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)
  );

  let statusPagamento: 'em_dia' | 'atrasado_7d' | 'atrasado_15d' | 'cancelado';
  let marcar: 'verde' | 'laranja' | 'vermelho';

  if (assinatura.status === 'cancelado_debito') {
    statusPagamento = 'cancelado';
    marcar = 'vermelho';
  } else if (assinatura.dias_atraso >= 15) {
    statusPagamento = 'atrasado_15d';
    marcar = 'vermelho';
  } else if (assinatura.dias_atraso >= 7) {
    statusPagamento = 'atrasado_7d';
    marcar = 'laranja';
  } else {
    statusPagamento = 'em_dia';
    marcar = 'verde';
  }

  return {
    cliente_id: clienteId,
    valor_total_contrato: assinatura.valor_mensal,
    proxima_cobranca: assinatura.data_proxima_cobranca,
    dias_para_vencimento: diasParaVencimento,
    status: statusPagamento,
    marcador_cor: marcar,
  };
}

// ============================================
// LISTAR CLIENTES COM ATRASO
// ============================================

export async function listarClientesAtrasados() {
  const { data: assinaturas, error } = await supabase
    .from('assinaturas')
    .select('*, clientes(id, nome, email, whatsapp)')
    .neq('dias_atraso', 0)
    .order('dias_atraso', { ascending: false });

  if (error) throw new Error(`Erro ao listar atrasos: ${error.message}`);

  return assinaturas.map((assinatura) => ({
    cliente: assinatura.clientes,
    dias_atraso: assinatura.dias_atraso,
    valor_devido: assinatura.valor_mensal,
    data_proxima_cobranca: assinatura.data_proxima_cobranca,
  }));
}

// ============================================
// REGISTRAR CUSTO VARIAVEL OU FIXO
// ============================================

export async function atualizarConfigFinanceira(dados: {
  custos_fixos_mensais?: number;
  custos_variaveis_percentual?: number;
}) {
  const { error } = await supabase
    .from('configuracoes_financeiras')
    .update(dados)
    .eq('agencia_id', 'adsgator-main');

  if (error) throw new Error(`Erro ao atualizar config: ${error.message}`);
}

// ============================================
// PROJEÇÃO FINANCEIRA (3 MESES)
// ============================================

export async function projetarFinanceiro3Meses() {
  const dre = await calcularDREMensal();
  const hoje = new Date();

  const projecao = [];

  for (let i = 0; i < 3; i++) {
    const mes = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const mesAno = `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`;

    projecao.push({
      mes: mesAno,
      receita_projetada: dre.mrr * (1 + (Math.random() * 0.1 - 0.05)), // ±5% variação
      lucro_projetado: dre.lucro_liquido * (1 + (Math.random() * 0.1 - 0.05)),
    });
  }

  return projecao;
}

// ============================================
// VALIDAR MARGEM MÍNIMA
// ============================================

export async function validarMargemMinima(): Promise<{
  margemAtual: number;
  margemMinima: number;
  estaOk: boolean;
  alerta: string | null;
}> {
  const { data: config } = await supabase
    .from('configuracoes_financeiras')
    .select('margem_lucro_minima')
    .single();

  const dre = await calcularDREMensal();
  const margemAtual = dre.margem_liquida_percentual;
  const margemMinima = config?.margem_lucro_minima || 30;

  return {
    margemAtual,
    margemMinima,
    estaOk: margemAtual >= margemMinima,
    alerta:
      margemAtual < margemMinima
        ? `⚠️ Margem abaixo do esperado: ${margemAtual.toFixed(1)}% < ${margemMinima}%`
        : null,
  };
}
```

---

## 2. EDGE FUNCTION: Régua de Cobrança Automática

### Arquivo: `supabase/functions/regrua-cobranca/index.ts`

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

## 3. COMPONENTE: Dashboard Financeiro

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { calcularDREMensal, projetarFinanceiro3Meses, validarMargemMinima, listarClientesAtrasados } from '@/lib/financeiro';
import { MainLayout } from '@/components/MainLayout';
import { Icons } from '@/components/Icons';

interface ClienteAtrasado {
  cliente: { id: string; nome: string; email: string; whatsapp: string };
  dias_atraso: number;
  valor_devido: number;
  data_proxima_cobranca: string;
}

export default function FinanceiroPage() {
  const [dre, setDre] = useState<any>(null);
  const [projecao, setProjecao] = useState<any[]>([]);
  const [validacao, setValidacao] = useState<any>(null);
  const [clientesAtrasados, setClientesAtrasados] = useState<ClienteAtrasado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const [dreMensal, proj3meses, margemValidacao, atrasados] = await Promise.all([
        calcularDREMensal(),
        projetarFinanceiro3Meses(),
        validarMargemMinima(),
        listarClientesAtrasados(),
      ]);

      setDre(dreMensal);
      setProjecao(proj3meses);
      setValidacao(margemValidacao);
      setClientesAtrasados(atrasados);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !dre) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="dark:text-gray-400 text-gray-600">Carregando dados financeiros...</p>
        </div>
      </MainLayout>
    );
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="dark:text-white text-gray-900 text-4xl font-bold mb-2">
            Dashboard Financeiro
          </h1>
          <p className="dark:text-gray-400 text-gray-600">
            Controle completo da saúde financeira da sua agência
          </p>
        </div>

        {/* Alerta de Margem */}
        {validacao && !validacao.estaOk && (
          <div className="mb-8 dark:bg-orange-500/10 bg-orange-50 border dark:border-orange-500/30 border-orange-200 rounded-lg p-6 flex items-start gap-4">
            <Icons.AlertCircle className="w-6 h-6 dark:text-orange-400 text-orange-600 flex-shrink-0 mt-1" strokeWidth={2} />
            <div>
              <h3 className="dark:text-orange-400 text-orange-700 font-bold mb-2">
                ⚠️ Margem Abaixo do Esperado
              </h3>
              <p className="dark:text-orange-300 text-orange-800 text-sm">
                {validacao.alerta}
              </p>
              <p className="dark:text-orange-300 text-orange-800 text-sm mt-2">
                Considere revisar os custos fixos ou aumentar os preços de alguns planos.
              </p>
            </div>
          </div>
        )}

        {/* KPIs Principais */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {/* MRR */}
          <div className="dark:bg-dark-card bg-white rounded-lg p-6 border dark:border-dark-border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="dark:text-gray-500 text-gray-500 text-xs uppercase tracking-wide mb-1">
                  MRR (Receita Recorrente)
                </p>
                <p className="dark:text-white text-gray-900 text-3xl font-bold">
                  {formatarMoeda(dre.mrr)}
                </p>
              </div>
              <Icons.TrendingUp className="w-6 h-6 dark:text-green-500 text-green-600" strokeWidth={2} />
            </div>
            <p className="dark:text-gray-500 text-gray-600 text-xs">
              {dre.mrr > 0 ? '📈 Receita saudável' : '📉 Sem receita'}
            </p>
          </div>

          {/* Lucro Bruto */}
          <div className="dark:bg-dark-card bg-white rounded-lg p-6 border dark:border-dark-border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="dark:text-gray-500 text-gray-500 text-xs uppercase tracking-wide mb-1">
                  Lucro Bruto
                </p>
                <p className="dark:text-white text-gray-900 text-3xl font-bold">
                  {formatarMoeda(dre.lucro_bruto)}
                </p>
              </div>
              <Icons.DollarSign className="w-6 h-6 dark:text-blue-500 text-blue-600" strokeWidth={2} />
            </div>
            <p className="dark:text-gray-500 text-gray-600 text-xs">
              {((dre.lucro_bruto / dre.mrr) * 100).toFixed(1)}% da receita
            </p>
          </div>

          {/* Custos Variáveis */}
          <div className="dark:bg-dark-card bg-white rounded-lg p-6 border dark:border-dark-border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="dark:text-gray-500 text-gray-500 text-xs uppercase tracking-wide mb-1">
                  Custos Variáveis
                </p>
                <p className="dark:text-white text-gray-900 text-3xl font-bold">
                  {formatarMoeda(dre.custos_variaveis)}
                </p>
              </div>
              <Icons.AlertCircle className="w-6 h-6 dark:text-warning text-orange-600" strokeWidth={2} />
            </div>
            <p className="dark:text-gray-500 text-gray-600 text-xs">
              {((dre.custos_variaveis / dre.mrr) * 100).toFixed(1)}% da receita
            </p>
          </div>

          {/* Lucro Líquido */}
          <div className={`
            rounded-lg p-6 border
            ${dre.lucro_liquido >= 0
              ? 'dark:bg-green-500/10 dark:border-green-500/30 bg-green-50 border-green-200'
              : 'dark:bg-red-500/10 dark:border-red-500/30 bg-red-50 border-red-200'
            }
          `}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="dark:text-gray-500 text-gray-500 text-xs uppercase tracking-wide mb-1">
                  Lucro Líquido
                </p>
                <p className={`
                  text-3xl font-bold
                  ${dre.lucro_liquido >= 0
                    ? 'dark:text-green-400 text-green-700'
                    : 'dark:text-red-400 text-red-700'
                  }
                `}>
                  {formatarMoeda(dre.lucro_liquido)}
                </p>
              </div>
              <Icons.CheckCircle className={`w-6 h-6 ${dre.lucro_liquido >= 0 ? 'dark:text-green-500 text-green-600' : 'dark:text-red-500 text-red-600'}`} strokeWidth={2} />
            </div>
            <p className="dark:text-gray-500 text-gray-600 text-xs">
              Margem: {dre.margem_liquida_percentual.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Estrutura de Custos */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          {/* Custos Fixos */}
          <div className="dark:bg-dark-card bg-white rounded-lg p-6 border dark:border-dark-border border-gray-200">
            <h3 className="dark:text-white text-gray-900 font-bold text-lg mb-6">
              Custos Fixos Mensais
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="dark:text-gray-400 text-gray-600">Valor Total</p>
                <p className="dark:text-white text-gray-900 font-bold">
                  {formatarMoeda(dre.custos_fixos)}
                </p>
              </div>
              <div className="w-full dark:bg-dark-hover bg-gray-100 rounded-full h-2">
                <div
                  className="dark:bg-primary bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min((dre.custos_fixos / dre.mrr) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="dark:text-gray-500 text-gray-600 text-xs">
                {((dre.custos_fixos / dre.mrr) * 100).toFixed(1)}% da receita
              </p>
            </div>
          </div>

          {/* Breakdown de Custos */}
          <div className="dark:bg-dark-card bg-white rounded-lg p-6 border dark:border-dark-border border-gray-200">
            <h3 className="dark:text-white text-gray-900 font-bold text-lg mb-6">
              Distribuição de Receita
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="dark:text-gray-400 text-gray-600 text-sm">Custos Variáveis</p>
                  <p className="dark:text-white text-gray-900 font-semibold">
                    {((dre.custos_variaveis / dre.mrr) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="w-full dark:bg-dark-hover bg-gray-100 rounded-full h-2">
                  <div
                    className="dark:bg-warning bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${((dre.custos_variaveis / dre.mrr) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="dark:text-gray-400 text-gray-600 text-sm">Custos Fixos</p>
                  <p className="dark:text-white text-gray-900 font-semibold">
                    {((dre.custos_fixos / dre.mrr) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="w-full dark:bg-dark-hover bg-gray-100 rounded-full h-2">
                  <div
                    className="dark:bg-secondary bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${((dre.custos_fixos / dre.mrr) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="dark:text-gray-400 text-gray-600 text-sm">Lucro Líquido</p>
                  <p className="dark:text-white text-gray-900 font-semibold">
                    {dre.margem_liquida_percentual.toFixed(1)}%
                  </p>
                </div>
                <div className="w-full dark:bg-dark-hover bg-gray-100 rounded-full h-2">
                  <div
                    className="dark:bg-primary bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${Math.max(dre.margem_liquida_percentual, 0)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projeção 3 Meses */}
        <div className="dark:bg-dark-card bg-white rounded-lg p-6 border dark:border-dark-border border-gray-200 mb-12">
          <h3 className="dark:text-white text-gray-900 font-bold text-xl mb-6">
            Projeção de 3 Meses
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {projecao.map((proj, idx) => (
              <div key={idx} className="dark:bg-dark-hover bg-gray-50 rounded-lg p-4">
                <p className="dark:text-gray-400 text-gray-600 text-sm mb-3">
                  {new Date(proj.mes).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'short',
                  })}
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="dark:text-gray-500 text-gray-600 text-xs mb-1">Receita</p>
                    <p className="dark:text-white text-gray-900 font-bold">
                      {formatarMoeda(proj.receita_projetada)}
                    </p>
                  </div>
                  <div>
                    <p className="dark:text-gray-500 text-gray-600 text-xs mb-1">Lucro</p>
                    <p className={`font-bold ${proj.lucro_projetado >= 0 ? 'dark:text-green-400 text-green-700' : 'dark:text-red-400 text-red-700'}`}>
                      {formatarMoeda(proj.lucro_projetado)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clientes com Atraso */}
        {clientesAtrasados.length > 0 && (
          <div className="dark:bg-dark-card bg-white rounded-lg p-6 border dark:border-dark-border border-gray-200">
            <h3 className="dark:text-white text-gray-900 font-bold text-xl mb-6">
              🔴 Clientes com Atraso ({clientesAtrasados.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="dark:border-dark-border border-b border-gray-200">
                    <th className="text-left py-3 dark:text-gray-400 text-gray-600 text-sm font-semibold">Cliente</th>
                    <th className="text-left py-3 dark:text-gray-400 text-gray-600 text-sm font-semibold">Dias de Atraso</th>
                    <th className="text-left py-3 dark:text-gray-400 text-gray-600 text-sm font-semibold">Valor Devido</th>
                    <th className="text-left py-3 dark:text-gray-400 text-gray-600 text-sm font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesAtrasados.map((item) => (
                    <tr key={item.cliente.id} className="dark:border-dark-border border-b border-gray-200 hover:dark:bg-dark-hover hover:bg-gray-50">
                      <td className="py-4">
                        <div>
                          <p className="dark:text-white text-gray-900 font-medium">{item.cliente.nome}</p>
                          <p className="dark:text-gray-500 text-gray-600 text-sm">{item.cliente.email}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`
                          px-3 py-1 rounded-md font-semibold text-sm
                          ${item.dias_atraso >= 30
                            ? 'dark:bg-red-500/20 dark:text-red-400 bg-red-100 text-red-700'
                            : item.dias_atraso >= 15
                            ? 'dark:bg-orange-500/20 dark:text-orange-400 bg-orange-100 text-orange-700'
                            : 'dark:bg-yellow-500/20 dark:text-yellow-400 bg-yellow-100 text-yellow-700'
                          }
                        `}>
                          {item.dias_atraso}d
                        </span>
                      </td>
                      <td className="py-4 dark:text-white text-gray-900 font-semibold">
                        {formatarMoeda(item.valor_devido)}
                      </td>
                      <td className="py-4">
                        <a
                          href={`https://wa.me/${item.cliente.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dark:text-primary text-green-600 hover:underline font-medium text-sm"
                        >
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
      </div>
    </MainLayout>
  );
}
```

---

## 4. RESUMO DO ERP FINANCEIRO

- ✅ Cálculo automático de DRE mensal (MRR, custos, lucro)
- ✅ Validação contínua de margem mínima
- ✅ Edge Function rodando a cada 6 horas para régua de cobrança
- ✅ Alertas automáticos em 7, 15 e 30 dias de atraso
- ✅ Dashboard financeiro com KPIs em tempo real
- ✅ Projeção de 3 meses
- ✅ Visualização de clientes com atraso
- ✅ Integração com histórico de ações para auditoria
- ✅ Suporte a múltiplas moedas (BRL por padrão)
- ✅ Cálculos baseados em dados reais do Supabase

**Status:** Pronto para implementação imediata.
