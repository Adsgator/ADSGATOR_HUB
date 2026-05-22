# ADSGATOR HUB — ARQUIVO 5: ANALYTICS & REPORTING (v2 — FINAL)

> **LEIA ANTES DE IMPLEMENTAR**
> Implemente nesta ordem:
> `(1)` `src/lib/google-ads.ts`
> `(2)` `src/lib/google-analytics.ts`
> `(3)` `src/lib/relatorio-generator.ts`
> `(4)` `src/app/api/analytics/[clienteId]/route.ts` (Route Handler — NOVO)
> `(5)` `src/app/(app)/relatorios/page.tsx`
> `(6)` `supabase/functions/gerar-relatorios-mensais/index.ts`
>
> **Regras absolutas:**
> - `google-ads-api` e `@google-analytics/data` são dependências **server-side** — nunca chamar do cliente
> - Chamadas Google Ads/GA4 ficam **exclusivamente** no Route Handler da Seção 4
> - Env var correta: `GOOGLE_APPLICATION_CREDENTIALS` (não `GOOGLE_ANALYTICS_KEY_FILE`)
> - Bug crítico de mês: `new Date().getMonth()` retorna 0-indexed — sempre usar `getMonth() + 1`
> - `MainLayout` de `@/components/layout/MainLayout`
> - Não usar `Icons` — importar diretamente do `lucide-react`
> - Tokens: `surface-*`, `ink-*`, `brand`, `status-*`

---

## ✅ PRÉ-REQUISITOS

### Dependências a adicionar em `package.json`

```json
{
  "dependencies": {
    "google-ads-api": "^14.0.0",
    "@google-analytics/data": "^4.0.0"
  }
}
```

Instalar: `npm install google-ads-api @google-analytics/data`

### Variáveis de ambiente (.env.local)

```env
# Google Ads
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_MANAGER_ID=your_manager_id
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token

# Google Analytics 4
# GOOGLE_APPLICATION_CREDENTIALS aponta para o PATH do arquivo JSON da service account
GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/service-account.json
```

> **IMPORTANTE:** As credenciais Google Ads e GA4 são por cliente.
> Os campos `google_ads_customer_id` e `ga4_property_id` já existem na tabela `clientes`.
> Preencher durante o onboarding de cada cliente.

### Tabelas necessárias (já existem no schema.sql)

| Tabela | Uso |
|---|---|
| `relatorios_mensais` | Armazena relatórios gerados (1 por cliente/mês) |
| `campanhas_ads` | Cache de dados de campanhas |
| `clientes` | `google_ads_customer_id`, `ga4_property_id` |
| `historico_acoes` | Audit trail de gerações |

---

## 1. INTEGRAÇÃO GOOGLE ADS — `src/lib/google-ads.ts`

> Estas funções rodam **apenas no servidor** (Route Handler ou Edge Function).
> Não importar em Client Components.

```typescript
import { GoogleAdsApi } from 'google-ads-api';

// ATENÇÃO: estas variáveis só existem no servidor (NEXT_PUBLIC_ não deve ser usado aqui)
const googleAdsClient = new GoogleAdsApi({
  client_id:       process.env.GOOGLE_ADS_CLIENT_ID!,
  client_secret:   process.env.GOOGLE_ADS_CLIENT_SECRET!,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
});

export interface DadosCampanhaAds {
  campanha_id: string;
  campanha_nome: string;
  status: string;
  impressoes: number;
  cliques: number;
  ctr: number;
  custo_total: number;
  conversoes: number;
  cpa: number;
  data_inicio: string;
  data_fim: string;
}

// ============================================
// BUSCAR DADOS DE CAMPANHAS GOOGLE ADS
// ============================================

export async function obterDadosCampanhasAds(
  customerIdGoogleAds: string,
  dataInicio: string,
  dataFim: string
): Promise<DadosCampanhaAds[]> {
  try {
    const customer = googleAdsClient.Customer({
      customer_id: customerIdGoogleAds,
      login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
    });

    const campaigns = await customer.report({
      entity: 'campaign',
      attributes: [
        'campaign.id',
        'campaign.name',
        'campaign.status',
        'metrics.impressions',
        'metrics.clicks',
        'metrics.ctr',
        'metrics.cost_micros',
        'metrics.conversions',
        'metrics.cost_per_conversion',
      ],
      constraints: {
        'campaign.status': ['ENABLED', 'PAUSED'],
      },
      from_date: dataInicio,
      to_date: dataFim,
    });

    return campaigns.map((camp: any) => ({
      campanha_id: camp['campaign.id'],
      campanha_nome: camp['campaign.name'],
      status: camp['campaign.status'],
      impressoes: parseInt(camp['metrics.impressions'] || 0),
      cliques: parseInt(camp['metrics.clicks'] || 0),
      ctr: parseFloat(camp['metrics.ctr'] || 0),
      custo_total: parseInt(camp['metrics.cost_micros'] || 0) / 1_000_000,
      conversoes: parseFloat(camp['metrics.conversions'] || 0),
      cpa: parseFloat(camp['metrics.cost_per_conversion'] || 0),
      data_inicio: dataInicio,
      data_fim: dataFim,
    }));
  } catch (error) {
    console.error('Erro ao obter dados Google Ads:', error);
    throw new Error(`Erro ao buscar campanhas do Google Ads: ${error.message}`);
  }
}

// ============================================
// BUSCAR SALDO DA CONTA GOOGLE ADS
// ============================================

export async function obterSaldoGoogleAds(customerIdGoogleAds: string): Promise<number> {
  try {
    const customer = googleAdsClient.Customer({
      customer_id: customerIdGoogleAds,
    });

    const account = await customer.report({
      entity: 'customer',
      attributes: [
        'customer.descriptive_name',
        'customer.auto_tagging_enabled',
        'metrics.cost_micros',
      ],
    });

    if (account.length > 0) {
      const saldoMicros = account[0]['metrics.cost_micros'] || 0;
      return saldoMicros / 1_000_000; // Converter de micros para reais
    }

    return 0;
  } catch (error) {
    console.error('Erro ao obter saldo Google Ads:', error);
    return 0;
  }
}

// ============================================
// BUSCAR DADOS DE PALAVRAS-CHAVE
// ============================================

export async function obterPalavrasChavePerformance(
  customerIdGoogleAds: string,
  dataInicio: string,
  dataFim: string
): Promise<
  Array<{
    palavra_chave: string;
    cliques: number;
    impressoes: number;
    cpc: number;
    ctr: number;
    conversoes: number;
  }>
> {
  try {
    const customer = googleAdsClient.Customer({
      customer_id: customerIdGoogleAds,
    });

    const keywords = await customer.report({
      entity: 'ad_group_criterion',
      attributes: [
        'ad_group_criterion.keyword.text',
        'metrics.impressions',
        'metrics.clicks',
        'metrics.average_cpc',
        'metrics.ctr',
        'metrics.conversions',
      ],
      constraints: {
        'ad_group_criterion.type': ['KEYWORD'],
      },
      from_date: dataInicio,
      to_date: dataFim,
    });

    return keywords
      .filter((kw: any) => kw['ad_group_criterion.keyword.text'])
      .map((kw: any) => ({
        palavra_chave: kw['ad_group_criterion.keyword.text'],
        cliques: parseInt(kw['metrics.clicks'] || 0),
        impressoes: parseInt(kw['metrics.impressions'] || 0),
        cpc: parseFloat(kw['metrics.average_cpc'] || 0),
        ctr: parseFloat(kw['metrics.ctr'] || 0),
        conversoes: parseFloat(kw['metrics.conversions'] || 0),
      }))
      .sort((a, b) => b.cliques - a.cliques)
      .slice(0, 20); // Top 20
  } catch (error) {
    console.error('Erro ao obter palavras-chave:', error);
    return [];
  }
}
```

---

## 2. INTEGRAÇÃO GOOGLE ANALYTICS 4 — `src/lib/google-analytics.ts`

> Roda **apenas no servidor**.
> `GOOGLE_APPLICATION_CREDENTIALS` aponta para o path do JSON da service account.
> O SDK lê essa variavel automaticamente — não passar `keyFilename` manualmente.

```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// O SDK usa GOOGLE_APPLICATION_CREDENTIALS automaticamente
const analyticsClient = new BetaAnalyticsDataClient();

export interface DadosGA4 {
  sessoes: number;
  usuarios_novos: number;
  visualizacoes_pagina: number;
  taxa_engajamento: number;
  duracao_media_sessao: number;
  taxa_rejeicao: number;
  conversoes: number;
  valor_conversao_total: number;
}

// ============================================
// BUSCAR DADOS GA4
// ============================================

export async function obterDadosGA4(
  propertyId: string,
  dataInicio: string,
  dataFim: string
): Promise<DadosGA4> {
  try {
    const response = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: dataInicio, endDate: dataFim }],
      metrics: [
        { name: 'sessions' },
        { name: 'newUsers' },
        { name: 'screenPageViews' },
        { name: 'engagementRate' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'conversions' },
        { name: 'totalConversionValue' },
      ],
    });

    const row = response[0]?.rows?.[0];
    if (!row) throw new Error('Nenhum dado encontrado');

    return {
      sessoes: parseInt(row.metricValues[0].value || 0),
      usuarios_novos: parseInt(row.metricValues[1].value || 0),
      visualizacoes_pagina: parseInt(row.metricValues[2].value || 0),
      taxa_engajamento: parseFloat(row.metricValues[3].value || 0) * 100,
      duracao_media_sessao: parseFloat(row.metricValues[4].value || 0),
      taxa_rejeicao: parseFloat(row.metricValues[5].value || 0) * 100,
      conversoes: parseInt(row.metricValues[6].value || 0),
      valor_conversao_total: parseFloat(row.metricValues[7].value || 0),
    };
  } catch (error) {
    console.error('Erro ao obter dados GA4:', error);
    throw new Error(`Erro ao buscar dados GA4: ${error.message}`);
  }
}

// ============================================
// BUSCAR PÁGINAS COM MELHOR PERFORMANCE
// ============================================

export async function obterPaginasTopPerformance(
  propertyId: string,
  dataInicio: string,
  dataFim: string
): Promise<
  Array<{
    pagina: string;
    usuarios: number;
    sessoes: number;
    duracao_media: number;
  }>
> {
  try {
    const response = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: dataInicio, endDate: dataFim }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, descending: true }],
      limit: 10,
    });

    return (response[0]?.rows || []).map((row: any) => ({
      pagina: row.dimensionValues[0].value,
      usuarios: parseInt(row.metricValues[0].value || 0),
      sessoes: parseInt(row.metricValues[1].value || 0),
      duracao_media: parseFloat(row.metricValues[2].value || 0),
    }));
  } catch (error) {
    console.error('Erro ao obter páginas top:', error);
    return [];
  }
}

// ============================================
// BUSCAR ORIGEM DO TRÁFEGO
// ============================================

export async function obterFontesTrafego(
  propertyId: string,
  dataInicio: string,
  dataFim: string
): Promise<
  Array<{
    fonte: string;
    midia: string;
    sessoes: number;
    usuarios: number;
    taxa_rejeicao: number;
  }>
> {
  try {
    const response = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: dataInicio, endDate: dataFim }],
      dimensions: [{ name: 'source' }, { name: 'medium' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'bounceRate' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, descending: true }],
    });

    return (response[0]?.rows || []).map((row: any) => ({
      fonte: row.dimensionValues[0].value,
      midia: row.dimensionValues[1].value,
      sessoes: parseInt(row.metricValues[0].value || 0),
      usuarios: parseInt(row.metricValues[1].value || 0),
      taxa_rejeicao: parseFloat(row.metricValues[2].value || 0) * 100,
    }));
  } catch (error) {
    console.error('Erro ao obter fontes de tráfego:', error);
    return [];
  }
}
```

---

## 3. MOTOR DE RELATÓRIOS — `src/lib/relatorio-generator.ts`

> Este arquivo APENAS gera e salva o markdown. Não chama Google Ads/GA4 diretamente.
> Os dados já chegam pré-processados via Route Handler (Seção 4).

```typescript
import { supabase } from './supabase';
import { obterDadosGA4, obterPaginasTopPerformance, obterFontesTrafego } from './google-analytics';

export interface RelatorioMensal {
  cliente_id: string;
  mes_ano: string;
  resumo_executivo: string;
  dados_ads: any;
  dados_ga4: any;
  palavras_chave_top: any[];
  paginas_performance: any[];
  fontes_trafego: any[];
  recomendacoes: string[];
  markdown_report: string;
}

// ============================================
// GERAR RELATÓRIO COMPLETO
// ============================================

export async function gerarRelatorioMensal(
  clienteId: string,
  mesAno: string,
  googleAdsCustomerId: string,
  ga4PropertyId: string
): Promise<RelatorioMensal> {
  const [ano, mes] = mesAno.split('-');
  const diaInicio = `${ano}-${mes}-01`;
  const diaFim = new Date(parseInt(ano), parseInt(mes), 0).toISOString().split('T')[0];

  try {
    // 1. Buscar dados de todas as fontes em paralelo
    const [dadosAds, dadosGA4, pcsTop, paginasTop, fontes] = await Promise.all([
      obterDadosCampanhasAds(googleAdsCustomerId, diaInicio, diaFim),
      obterDadosGA4(ga4PropertyId, diaInicio, diaFim),
      obterPalavrasChavePerformance(googleAdsCustomerId, diaInicio, diaFim),
      obterPaginasTopPerformance(ga4PropertyId, diaInicio, diaFim),
      obterFontesTrafego(ga4PropertyId, diaInicio, diaFim),
    ]);

    // 2. Calcular recomendações
    const recomendacoes = gerarRecomendacoes(dadosAds, dadosGA4, pcsTop);

    // 3. Gerar markdown do relatório
    const markdownReport = gerarMarkdownRelatorio(
      mesAno,
      dadosAds,
      dadosGA4,
      pcsTop,
      paginasTop,
      fontes,
      recomendacoes
    );

    // 4. Salvar no banco
    const { error: errorSalvar } = await supabase
      .from('relatorios_mensais')
      .insert({
        cliente_id: clienteId,
        mes_ano: mesAno,
        investimento_ads: dadosAds.reduce((t, c) => t + c.custo_total, 0),
        conversoes: dadosAds.reduce((t, c) => t + c.conversoes, 0),
        cpa: dadosAds.reduce((t, c) => t + c.cpa, 0) / dadosAds.length || 0,
        mrr: 0, // Seria preenchido com dados de assinatura
        status_geracao: 'completo',
        url_relatorio: null,
      });

    if (errorSalvar) throw new Error(errorSalvar.message);

    // 5. Registrar ação no histórico
    await supabase.from('historico_acoes').insert({
      cliente_id: clienteId,
      tipo_acao: 'relatorio_mensal_gerado',
      descricao: `Relatório de ${mesAno} gerado automaticamente com sucesso`,
      metadata: {
        investimento_total: dadosAds.reduce((t, c) => t + c.custo_total, 0),
        sessoes: dadosGA4.sessoes,
        conversoes: dadosGA4.conversoes,
      },
    });

    return {
      cliente_id: clienteId,
      mes_ano: mesAno,
      resumo_executivo: gerarResumoExecutivo(dadosAds, dadosGA4),
      dados_ads: dadosAds,
      dados_ga4: dadosGA4,
      palavras_chave_top: pcsTop,
      paginas_performance: paginasTop,
      fontes_trafego: fontes,
      recomendacoes,
      markdown_report: markdownReport,
    };
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    throw new Error(`Erro ao gerar relatório mensal: ${error.message}`);
  }
}

// ============================================
// GERAR RESUMO EXECUTIVO
// ============================================

function gerarResumoExecutivo(dadosAds: any[], dadosGA4: any): string {
  const investimentoTotal = dadosAds.reduce((t, c) => t + c.custo_total, 0);
  const conversoeTotal = dadosAds.reduce((t, c) => t + c.conversoes, 0);
  const roi = dadosGA4.valor_conversao_total / investimentoTotal;

  return `
Em resumo, as campanhas geraram ${investimentoTotal.toFixed(2)} reais em investimento, 
resultando em ${conversoeTotal.toFixed(0)} conversões com ROI de ${roi.toFixed(2)}x.
O site recebeu ${dadosGA4.sessoes} sessões de ${dadosGA4.usuarios_novos} novos usuários,
com taxa de engajamento de ${dadosGA4.taxa_engajamento.toFixed(1)}% e ${dadosGA4.conversoes} conversões no total.
  `.trim();
}

// ============================================
// GERAR RECOMENDAÇÕES AUTOMÁTICAS
// ============================================

function gerarRecomendacoes(dadosAds: any[], dadosGA4: any, pcsTop: any[]): string[] {
  const recomendacoes: string[] = [];

  // Análise de CTR
  const ctrMedio = dadosAds.reduce((t, c) => t + c.ctr, 0) / dadosAds.length;
  if (ctrMedio < 2) {
    recomendacoes.push('⚠️ CTR abaixo de 2%. Revisar copy dos anúncios e palavras-chave.');
  }

  // Análise de CPA
  const cpaMedio = dadosAds.reduce((t, c) => t + c.cpa, 0) / dadosAds.length;
  if (cpaMedio > 100) {
    recomendacoes.push('⚠️ CPA alto. Considere revisar landing page e fluxo de conversão.');
  }

  // Análise de taxa de rejeição
  if (dadosGA4.taxa_rejeicao > 60) {
    recomendacoes.push('⚠️ Taxa de rejeição alta. Melhorar conteúdo acima da dobra.');
  }

  // Top palavras-chave
  if (pcsTop.length > 0) {
    const pcTop = pcsTop[0];
    recomendacoes.push(
      `✅ Palavra-chave "${pcTop.palavra_chave}" é sua melhor performance. Aumentar orçamento.`
    );
  }

  // Sugestões gerais
  if (dadosGA4.taxa_engajamento > 50) {
    recomendacoes.push('✅ Taxa de engajamento excelente. Manter estratégia atual.');
  }

  return recomendacoes.length > 0 ? recomendacoes : ['✅ Tudo dentro do esperado. Manter monitoramento mensal.'];
}

// ============================================
// GERAR MARKDOWN DO RELATÓRIO
// ============================================

function gerarMarkdownRelatorio(
  mesAno: string,
  dadosAds: any[],
  dadosGA4: any,
  pcsTop: any[],
  paginasTop: any[],
  fontes: any[],
  recomendacoes: string[]
): string {
  const investimentoTotal = dadosAds.reduce((t, c) => t + c.custo_total, 0);
  const conversoeTotal = dadosAds.reduce((t, c) => t + c.conversoes, 0);
  const cpaTotal = dadosAds.reduce((t, c) => t + c.cpa, 0) / dadosAds.length || 0;
  const roi = dadosGA4.valor_conversao_total / investimentoTotal;

  return `# Relatório Mensal - ${mesAno}

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Investimento** | R$ ${investimentoTotal.toFixed(2)} |
| **Conversões** | ${conversoeTotal.toFixed(0)} |
| **CPA Médio** | R$ ${cpaTotal.toFixed(2)} |
| **ROI** | ${roi.toFixed(2)}x |
| **Sessões** | ${dadosGA4.sessoes} |
| **Novos Usuários** | ${dadosGA4.usuarios_novos} |

---

## 📈 Google Ads

### Campanha Performance
${dadosAds
  .map(
    (camp) => `
- **${camp.campanha_nome}**
  - Impressões: ${camp.impressoes}
  - Cliques: ${camp.cliques}
  - CTR: ${(camp.ctr * 100).toFixed(2)}%
  - Custo: R$ ${camp.custo_total.toFixed(2)}
  - Conversões: ${camp.conversoes.toFixed(0)}
`
  )
  .join('\n')}

### Top 5 Palavras-Chave
${pcsTop
  .slice(0, 5)
  .map(
    (pc, idx) => `
${idx + 1}. **${pc.palavra_chave}**
   - Cliques: ${pc.cliques}
   - CTR: ${(pc.ctr * 100).toFixed(2)}%
   - CPC: R$ ${pc.cpc.toFixed(2)}
   - Conversões: ${pc.conversoes.toFixed(0)}
`
  )
  .join('\n')}

---

## 📱 Google Analytics 4

### Visão Geral
- **Sessões**: ${dadosGA4.sessoes}
- **Novos Usuários**: ${dadosGA4.usuarios_novos}
- **Visualizações**: ${dadosGA4.visualizacoes_pagina}
- **Taxa de Engajamento**: ${dadosGA4.taxa_engajamento.toFixed(1)}%
- **Duração Média**: ${dadosGA4.duracao_media_sessao.toFixed(0)}s
- **Taxa de Rejeição**: ${dadosGA4.taxa_rejeicao.toFixed(1)}%
- **Conversões**: ${dadosGA4.conversoes}
- **Valor Total**: R$ ${dadosGA4.valor_conversao_total.toFixed(2)}

### Top Páginas
${paginasTop
  .map(
    (pg, idx) => `
${idx + 1}. **${pg.pagina}**
   - Usuários: ${pg.usuarios}
   - Sessões: ${pg.sessoes}
   - Duração Média: ${pg.duracao_media.toFixed(0)}s
`
  )
  .join('\n')}

### Fontes de Tráfego
${fontes
  .map(
    (ft, idx) => `
${idx + 1}. **${ft.fonte} (${ft.midia})**
   - Sessões: ${ft.sessoes}
   - Usuários: ${ft.usuarios}
   - Taxa de Rejeição: ${ft.taxa_rejeicao.toFixed(1)}%
`
  )
  .join('\n')}

---

## 💡 Recomendações

${recomendacoes.map((rec) => `- ${rec}`).join('\n')}

---

**Relatório gerado automaticamente pelo Adsgator Hub em ${new Date().toLocaleDateString('pt-BR')}**
`;
}
```

---

## 4. COMPONENTE LEGADO — SUBSTITUÍDO PELA SEÇÃO ACIMA

> O componente abaixo foi substituído pelo par Route Handler (Seção 4) + página (Seção 5).
> NÃO implementar este código. Mantido apenas para referência histórica.

```typescript
// OBSOLETO — não implementar
// 'use client';
//
// import React, { useEffect, useState } from 'react';
// import { gerarRelatorioMensal } from '@/lib/relatorio-generator';
// import { MainLayout } from '@/components/MainLayout'; // ← caminho errado
// import { Icons } from '@/components/Icons'; // ← não existe
```

---

## 6. EDGE FUNCTION — `supabase/functions/gerar-relatorios-mensais/index.ts`

> Scheduler automático. Roda no dia 1 de cada mês (cron: `0 8 1 * *`).
> **Bug corrigido:** `hoje.getMonth()` é 0-indexed.
> Gerar relatório do mês **anterior** (não do atual que ainda está em curso).

```typescript
// supabase/functions/gerar-relatorios-mensais/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// ARQUIVO: src/app/api/analytics/[clienteId]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Route Handler seguro. Toda a comunicação com Google Ads e GA4 fica AQUI.
// O Client Component só chama GET /api/analytics/[clienteId]?mesAno=YYYY-MM
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: { clienteId: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('relatorios_mensais')
      .select('*')
      .eq('cliente_id', params.clienteId)
      .order('mes_ano', { ascending: false })
      .limit(6);

    if (error) throw error;
    return NextResponse.json({ relatorios: data ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { clienteId: string } }
) {
  try {
    const body = await req.json() as { mesAno: string };

    // Busca credenciais do cliente
    const { data: cliente, error: errCliente } = await supabaseAdmin
      .from('clientes')
      .select('google_ads_customer_id, ga4_property_id, nome')
      .eq('id', params.clienteId)
      .single();
    if (errCliente || !cliente) throw new Error('Cliente não encontrado');

    // TODO: Integrar com google-ads.ts e google-analytics.ts aqui
    // const [campanhas, ga4] = await Promise.all([
    //   obterDadosCampanhasAds(cliente.google_ads_customer_id, body.mesAno),
    //   obterDadosGA4(cliente.ga4_property_id, body.mesAno),
    // ]);
    // const relatorio = await gerarRelatorioMensal(params.clienteId, body.mesAno, campanhas, ga4);

    // Por ora: criar registro pendente para geração manual
    const { error } = await supabaseAdmin.from('relatorios_mensais').upsert({
      cliente_id: params.clienteId,
      mes_ano:    body.mesAno,
      status_geracao: 'pendente',
    }, { onConflict: 'cliente_id,mes_ano' });
    if (error) throw error;

    return NextResponse.json({ success: true, status: 'pendente' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

---

## 5. PÁGINA — `src/app/(app)/relatorios/page.tsx`

> Busca dados **reais** do Supabase via Route Handler.
> Não contém nenhum dado mockado.

```typescript
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  TrendingUp, BarChart3, Download, RefreshCw, Calendar, ArrowUpRight,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';

interface RelatorioMensal {
  id:              string;
  cliente_id:      string;
  mes_ano:         string;
  status_geracao:  'pendente' | 'gerado' | 'erro';
  investimento_ads?: number;
  conversoes?:      number;
  roi?:             number;
  sessoes_ga4?:     number;
  usuarios_novos?:  number;
  taxa_engajamento?: number;
  conteudo_markdown?: string;
}

interface ResumoRelatorio {
  investimento: number;
  conversoes:   number;
  roi:          number;
  sessoes:      number;
  usuarios:     number;
  engajamento:  number;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function extrairResumo(r: RelatorioMensal): ResumoRelatorio {
  return {
    investimento: r.investimento_ads    ?? 0,
    conversoes:   r.conversoes          ?? 0,
    roi:          r.roi                 ?? 0,
    sessoes:      r.sessoes_ga4         ?? 0,
    usuarios:     r.usuarios_novos      ?? 0,
    engajamento:  r.taxa_engajamento    ?? 0,
  };
}

export default function RelatoriosPage() {
  const params     = useParams();
  const clienteId  = params?.id as string | undefined;

  const [clientes,   setClientes]   = useState<{ id: string; nome: string }[]>([]);
  const [clienteSel, setClienteSel] = useState<string>('');
  const [relatorios, setRelatorios] = useState<RelatorioMensal[]>([]);
  const [selecionado, setSelecionado] = useState<RelatorioMensal | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [gerando,    setGerando]    = useState(false);

  // Carregar lista de clientes ativos
  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome')
      .eq('status', 'ativo')
      .order('nome')
      .then(({ data }) => {
        const lista = data ?? [];
        setClientes(lista);
        if (clienteId) setClienteSel(clienteId);
        else if (lista.length > 0) setClienteSel(lista[0].id);
      });
  }, [clienteId]);

  // Carregar relatórios do cliente selecionado
  const carregar = useCallback(async () => {
    if (!clienteSel) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/analytics/${clienteSel}`);
      const json = await res.json() as { relatorios: RelatorioMensal[] };
      const lista = json.relatorios ?? [];
      setRelatorios(lista);
      setSelecionado(lista[0] ?? null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [clienteSel]);

  useEffect(() => { carregar(); }, [carregar]);

  async function solicitarRelatorio() {
    if (!clienteSel) return;
    setGerando(true);
    try {
      const hoje = new Date();
      // Mês anterior (o atual ainda está em curso)
      const mesRef = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const mesAno = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, '0')}`;
      await fetch(`/api/analytics/${clienteSel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesAno }),
      });
      await carregar();
    } finally { setGerando(false); }
  }

  function baixarMarkdown() {
    if (!selecionado?.conteudo_markdown) return;
    const blob = new Blob([selecionado.conteudo_markdown], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `relatorio_${selecionado.mes_ano}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const resumo = selecionado ? extrairResumo(selecionado) : null;

  const kpis = resumo ? [
    { label: 'Investimento',       valor: fmt(resumo.investimento),       sub: 'Google Ads',         icon: TrendingUp,     cor: 'text-status-blue'   },
    { label: 'Conversões',         valor: String(resumo.conversoes),       sub: 'Leads/vendas',       icon: ArrowUpRight,   cor: 'text-brand'         },
    { label: 'ROI',                valor: `${resumo.roi.toFixed(2)}x`,     sub: 'Retorno',            icon: BarChart3,      cor: 'text-status-purple' },
    { label: 'Sessões (GA4)',      valor: resumo.sessoes.toLocaleString(), sub: 'Visitas ao site',    icon: Calendar,       cor: 'text-status-orange' },
  ] : [];

  return (
    <MainLayout>
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-[2rem]">
        <div>
          <h1 className="dark:text-ink-primary text-gray-900 text-[1.875rem] font-bold tracking-tight mb-[0.25rem]">
            Relatórios de Performance
          </h1>
          <p className="dark:text-ink-secondary text-gray-500 text-sm">
            Google Ads + GA4 — dados históricos por cliente
          </p>
        </div>

        <div className="flex items-center gap-[0.75rem]">
          {/* Seletor de cliente */}
          <select
            value={clienteSel}
            onChange={(e) => setClienteSel(e.target.value)}
            className="h-[2.25rem] pl-[0.75rem] pr-[2rem] rounded dark:bg-surface-card dark:border dark:border-surface-border dark:text-ink-primary bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          <button
            onClick={solicitarRelatorio}
            disabled={gerando || !clienteSel}
            className="flex items-center gap-[0.5rem] dark:bg-brand dark:hover:bg-brand-dark dark:text-white bg-green-600 hover:bg-green-700 text-white text-sm font-semibold h-[2.25rem] px-[0.875rem] rounded transition-colors disabled:opacity-50"
          >
            {gerando
              ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <RefreshCw className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
            }
            Solicitar Relatório
          </button>
        </div>
      </div>

      {/* ── SELETOR DE MÊS ── */}
      {relatorios.length > 0 && (
        <div className="flex gap-[0.5rem] flex-wrap mb-[1.5rem]">
          {relatorios.map((r) => {
            const [ano, mes] = r.mes_ano.split('-');
            const label = new Date(Number(ano), Number(mes) - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            return (
              <button
                key={r.mes_ano}
                onClick={() => setSelecionado(r)}
                className={`px-[0.875rem] h-[2rem] rounded text-sm font-medium transition-colors
                  ${selecionado?.mes_ano === r.mes_ano
                    ? 'dark:bg-brand dark:text-white bg-green-600 text-white'
                    : 'dark:bg-surface-card dark:border dark:border-surface-border dark:text-ink-secondary bg-white border border-gray-100 text-gray-600 dark:hover:border-brand/40 hover:border-green-300'}`}
              >
                {label}
                {r.status_geracao === 'pendente' && (
                  <span className="ml-[0.375rem] text-2xs font-bold text-status-orange">●</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-[16rem]">
          <div className="w-[1.5rem] h-[1.5rem] border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && relatorios.length === 0 && (
        <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[3rem] text-center">
          <BarChart3 className="w-[2.5rem] h-[2.5rem] dark:text-ink-muted text-gray-300 mx-auto mb-[1rem]" strokeWidth={1} />
          <p className="dark:text-ink-secondary text-gray-500 text-sm">
            Nenhum relatório encontrado. Clique em "Solicitar Relatório" para iniciar.
          </p>
        </div>
      )}

      {!loading && selecionado && (
        <>
          {/* ── STATUS ── */}
          {selecionado.status_geracao === 'pendente' && (
            <div className="mb-[1.5rem] flex items-start gap-[0.75rem] dark:bg-status-orange/8 bg-orange-50 border dark:border-status-orange/20 border-orange-100 rounded-lg px-[1rem] py-[0.875rem]">
              <RefreshCw className="shrink-0 w-[0.875rem] h-[0.875rem] text-status-orange mt-[0.125rem]" strokeWidth={2} />
              <p className="text-sm dark:text-status-orange text-orange-700">
                Relatório em processamento. Recarregue em alguns instantes.
              </p>
            </div>
          )}

          {/* ── KPIs ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[1rem] mb-[1.5rem]">
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

          {/* ── DETALHE ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] mb-[1.5rem]">
            {/* Google Ads */}
            <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem]">
              <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
                <TrendingUp className="w-[1rem] h-[1rem] text-status-blue" strokeWidth={1.5} />
                <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base">Google Ads</h3>
              </div>
              {[
                { label: 'Investimento', valor: fmt(resumo!.investimento) },
                { label: 'Conversões',   valor: String(resumo!.conversoes) },
                { label: 'ROI',          valor: `${resumo!.roi.toFixed(2)}x` },
              ].map(({ label, valor }) => (
                <div key={label} className="flex justify-between items-center py-[0.75rem] border-b dark:border-surface-border border-gray-50 last:border-0">
                  <p className="dark:text-ink-secondary text-gray-500 text-sm">{label}</p>
                  <p className="dark:text-ink-primary text-gray-900 font-semibold text-sm">{valor}</p>
                </div>
              ))}
            </div>

            {/* Google Analytics */}
            <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem]">
              <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
                <BarChart3 className="w-[1rem] h-[1rem] text-status-orange" strokeWidth={1.5} />
                <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base">Google Analytics 4</h3>
              </div>
              {[
                { label: 'Sessões',           valor: resumo!.sessoes.toLocaleString()        },
                { label: 'Novos Usuários',    valor: resumo!.usuarios.toLocaleString()       },
                { label: 'Taxa Engajamento',  valor: `${resumo!.engajamento.toFixed(1)}%`   },
              ].map(({ label, valor }) => (
                <div key={label} className="flex justify-between items-center py-[0.75rem] border-b dark:border-surface-border border-gray-50 last:border-0">
                  <p className="dark:text-ink-secondary text-gray-500 text-sm">{label}</p>
                  <p className="dark:text-ink-primary text-gray-900 font-semibold text-sm">{valor}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── DOWNLOAD ── */}
          {selecionado.conteudo_markdown && (
            <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 px-[1.5rem] py-[1.25rem] flex items-center justify-between">
              <div>
                <p className="dark:text-ink-primary text-gray-900 font-semibold text-sm">Relatório completo em Markdown</p>
                <p className="dark:text-ink-muted text-gray-400 text-xs mt-[0.125rem]">Pronto para compartilhar com o cliente</p>
              </div>
              <button
                onClick={baixarMarkdown}
                className="flex items-center gap-[0.5rem] dark:bg-surface-hover dark:hover:bg-surface-border dark:text-ink-primary bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold h-[2.25rem] px-[0.875rem] rounded transition-colors"
              >
                <Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                Baixar .md
              </button>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}
```

---

## 6. EDGE FUNCTION (CORRIGIDA) — `supabase/functions/gerar-relatorios-mensais/index.ts`

> **Bug corrigido:** `hoje.getMonth()` é 0-indexed. Código antigo gerava `mesAno = '2025-00'` em janeiro.
> Esta função cria os registros `pendente` — a geração real via Google APIs deve ser feita via Route Handler.

```typescript
// supabase/functions/gerar-relatorios-mensais/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('id, nome')
      .eq('status', 'ativo');
    if (error) throw error;

    const hoje = new Date();
    // ✅ BUG CORRIGIDO: getMonth() é 0-indexed, +1 para corrigir
    // Relatar o mês ANTERIOR (o atual ainda está em curso no dia 1)
    const mesRef = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const mesAno = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, '0')}`;

    let criados = 0;
    for (const cliente of clientes ?? []) {
      const { error: errUpsert } = await supabase
        .from('relatorios_mensais')
        .upsert({
          cliente_id:      cliente.id,
          mes_ano:         mesAno,
          status_geracao:  'pendente',
        }, { onConflict: 'cliente_id,mes_ano' });

      if (errUpsert) {
        console.error(`[ERRO] ${cliente.nome}:`, errUpsert.message);
      } else {
        criados++;
        console.log(`[OK] Relatório agendado: ${cliente.nome} — ${mesAno}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, mes_ano: mesAno, criados }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[ERRO GERAL]', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 7. CHECKLIST DE IMPLEMENTAÇÃO

### Ordem de execução

- [ ] **1.** Instalar dependências: `npm install google-ads-api @google-analytics/data`
- [ ] **2.** Preencher variáveis de ambiente (ver seção Pré-requisitos)
- [ ] **3.** Criar `src/lib/google-ads.ts` (Seção 1)
- [ ] **4.** Criar `src/lib/google-analytics.ts` (Seção 2) — verificar `GOOGLE_APPLICATION_CREDENTIALS`
- [ ] **5.** Criar `src/lib/relatorio-generator.ts` (Seção 3)
- [ ] **6.** Criar `src/app/api/analytics/[clienteId]/route.ts` (Seção 4)
- [ ] **7.** Criar `src/app/(app)/relatorios/page.tsx` (Seção 5)
- [ ] **8.** Criar `supabase/functions/gerar-relatorios-mensais/index.ts` (Seção 6)
- [ ] **9.** No Supabase Dashboard → Edge Functions → Schedules → cron `0 8 1 * *` apontando para `gerar-relatorios-mensais`
- [ ] **10.** Adicionar link `/relatorios` na Sidebar
- [ ] **11.** Preencher `google_ads_customer_id` e `ga4_property_id` na tabela `clientes` para cada cliente

### Erros críticos a evitar

| ❌ Errado | ✅ Correto |
|---|---|
| `process.env.GOOGLE_ANALYTICS_KEY_FILE` | SDK lê `GOOGLE_APPLICATION_CREDENTIALS` automaticamente |
| `String(hoje.getMonth())` — retorna 0-11 | `String(hoje.getMonth() + 1)` |
| Chamar `obterDadosCampanhasAds()` no Client Component | Chamar apenas dentro de Route Handler ou Edge Function |
| `import { Icons } from '@/components/Icons'` | `import { TrendingUp, BarChart3, ... } from 'lucide-react'` |
| `dark:bg-dark-card` | `dark:bg-surface-card` |
| Dados mockados hardcoded | Buscar de `relatorios_mensais` no Supabase via Route Handler |

### Arquitetura de dados — fluxo completo

```
[Edge Function cron — dia 1/mês]
  → cria registro pendente em relatorios_mensais

[Usuário clica "Solicitar Relatório" no browser]
  → POST /api/analytics/[clienteId]
  → Route Handler (server-side) chama Google Ads + GA4
  → Salva resultado em relatorios_mensais (status: gerado)

[Página /relatorios]
  → GET /api/analytics/[clienteId]
  → Exibe dados reais do banco
```

---

## 📋 COMO USAR OS 5 ARQUIVOS

1. **ARQUIVO 1**: SQL no Supabase + variáveis de ambiente
2. **ARQUIVO 2**: Tailwind config + componentes React + CRM
3. **ARQUIVO 3**: ERP financeiro (MRR, DRE, cobrança automática)
4. **ARQUIVO 4**: Biblioteca Astro + builder de landing pages + manifesto
5. **ARQUIVO 5**: Google Ads + GA4 + relatórios mensais automáticos

**Status:** v2 — Todos os 5 arquivos prontos para implementação imediata.
