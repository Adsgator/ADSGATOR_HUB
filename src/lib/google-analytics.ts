import { BetaAnalyticsDataClient } from '@google-analytics/data';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface DadosGA4 {
  sessoes:                number;
  usuarios_novos:         number;
  visualizacoes_pagina:   number;
  taxa_engajamento:       number;
  duracao_media_sessao:   number;
  taxa_rejeicao:          number;
  conversoes:             number;
  valor_conversao_total:  number;
}

export interface PaginaPerformance {
  pagina:               string;
  visualizacoes:        number;
  usuarios_unicos:      number;
  novas_sessoes:        number;
  sessoes:              number;
  taxa_engajamento:     number;
  taxa_rejeicao:        number;
  tempo_medio_segundos: number;
}

export interface FonteTrafego {
  fonte:             string;
  midia:             string;
  sessoes:           number;
  conversoes:        number;
  taxa_conversao:    number;
}

// ─── CLIENTE GA4 ─────────────────────────────────────────────────────────────
// GOOGLE_APPLICATION_CREDENTIALS aceita caminho de arquivo (local, o SDK lê
// sozinho) ou o JSON inteiro da service account (Vercel, sem filesystem).

// Exportado para camadas que montam relatórios próprios (ga4-detalhes.ts).
export function criarClienteGA4() {
  const cred = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? '';
  if (cred.trimStart().startsWith('{')) {
    return new BetaAnalyticsDataClient({ credentials: JSON.parse(cred) });
  }
  return new BetaAnalyticsDataClient();
}

// O GA4 rejeita intervalo com fim no FUTURO quando a query tem conversão de
// moeda (totalRevenue): "Future currency exchange rate not exist". Como não
// existe dado futuro, pedir até hoje é equivalente — o fim canônico do
// período (ex.: último dia do mês) fica só na chave do snapshot.
export function clampFim(dataFim: string): string {
  const hoje = new Date().toISOString().slice(0, 10);
  return dataFim > hoje ? hoje : dataFim;
}

// ─── TESTE DE CONEXÃO ────────────────────────────────────────────────────────
// runReport mínimo só para validar property ID + permissão da service account.

export async function testarConexaoGA4(propertyId: string): Promise<void> {
  const client = criarClienteGA4();
  await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: 'yesterday', endDate: 'yesterday' }],
    metrics: [{ name: 'sessions' }],
    limit: 1,
  });
}

// ─── MÉTRICAS GA4 ────────────────────────────────────────────────────────────

export async function obterDadosGA4(
  propertyId: string,
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string, // YYYY-MM-DD
): Promise<DadosGA4> {
  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: dataInicio, endDate: clampFim(dataFim) }],
      metrics: [
        { name: 'sessions'             },
        { name: 'newUsers'             },
        { name: 'screenPageViews'      },
        { name: 'engagementRate'       },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate'           },
        { name: 'conversions'          },
        { name: 'totalRevenue'         },
      ],
    });

    const row = response?.rows?.[0]?.metricValues ?? [];
    const val = (i: number) => parseFloat(row[i]?.value ?? '0');

    return {
      sessoes:               val(0),
      usuarios_novos:        val(1),
      visualizacoes_pagina:  val(2),
      taxa_engajamento:      val(3) * 100,
      duracao_media_sessao:  val(4),
      taxa_rejeicao:         val(5) * 100,
      conversoes:            val(6),
      valor_conversao_total: val(7),
    };
  } catch (error) {
    console.error('Erro ao obter dados GA4:', error);
    throw error;
  }
}

// ─── TOP PÁGINAS ─────────────────────────────────────────────────────────────

export async function obterPaginasTopPerformance(
  propertyId: string,
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string, // YYYY-MM-DD
): Promise<PaginaPerformance[]> {
  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate: dataInicio, endDate: clampFim(dataFim) }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews'        },
        { name: 'activeUsers'            },
        { name: 'newUsers'               },
        { name: 'sessions'               },
        { name: 'engagementRate'         },
        { name: 'bounceRate'             },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 50,
    });

    return (response?.rows ?? []).map((row: Record<string, any>) => ({
      pagina:               row.dimensionValues?.[0]?.value ?? '/',
      visualizacoes:        parseFloat(row.metricValues?.[0]?.value ?? '0'),
      usuarios_unicos:      parseFloat(row.metricValues?.[1]?.value ?? '0'),
      novas_sessoes:        parseFloat(row.metricValues?.[2]?.value ?? '0'),
      sessoes:              parseFloat(row.metricValues?.[3]?.value ?? '0'),
      taxa_engajamento:     parseFloat(row.metricValues?.[4]?.value ?? '0') * 100,
      taxa_rejeicao:        parseFloat(row.metricValues?.[5]?.value ?? '0') * 100,
      tempo_medio_segundos: parseFloat(row.metricValues?.[6]?.value ?? '0'),
    }));
  } catch (error) {
    console.error('Erro ao obter páginas GA4:', error);
    throw error;
  }
}

// ─── FONTES DE TRÁFEGO ────────────────────────────────────────────────────────

export async function obterFontesTrafego(
  propertyId: string,
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string, // YYYY-MM-DD
): Promise<FonteTrafego[]> {
  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate: dataInicio, endDate: clampFim(dataFim) }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [
        { name: 'sessions'    },
        { name: 'conversions' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    });

    return (response?.rows ?? []).map((row: Record<string, any>) => {
      const sessoes    = parseFloat(row.metricValues?.[0]?.value ?? '0');
      const conversoes = parseFloat(row.metricValues?.[1]?.value ?? '0');
      return {
        fonte:          row.dimensionValues?.[0]?.value ?? '(direct)',
        midia:          row.dimensionValues?.[1]?.value ?? '(none)',
        sessoes,
        conversoes,
        taxa_conversao: sessoes > 0 ? (conversoes / sessoes) * 100 : 0,
      };
    });
  } catch (error) {
    console.error('Erro ao obter fontes GA4:', error);
    throw error;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// NOVAS FUNÇÕES PARA ANALYTICS PREMIUM
// ═════════════════════════════════════════════════════════════════════════════

// ─── GEOGRAFIA GA4 ───────────────────────────────────────────────────────────

export interface GeoGA4 {
  pais:        string;
  estado:      string;
  cidade:      string;
  sessoes:     number;
  usuarios:    number;
  taxa_engajamento: number;
}

export async function obterGeoGA4(
  propertyId: string,
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string, // YYYY-MM-DD
): Promise<GeoGA4[]> {
  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate: dataInicio, endDate: clampFim(dataFim) }],
      dimensions: [
        { name: 'country'   },
        { name: 'region'    },
        { name: 'city'      },
      ],
      metrics: [
        { name: 'sessions'       },
        { name: 'activeUsers'    },
        { name: 'engagementRate' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 20,
    });

    return (response?.rows ?? []).map((row: Record<string, any>) => ({
      pais:        row.dimensionValues?.[0]?.value ?? '',
      estado:      row.dimensionValues?.[1]?.value ?? '',
      cidade:      row.dimensionValues?.[2]?.value ?? '',
      sessoes:     parseFloat(row.metricValues?.[0]?.value ?? '0'),
      usuarios:    parseFloat(row.metricValues?.[1]?.value ?? '0'),
      taxa_engajamento: parseFloat(row.metricValues?.[2]?.value ?? '0') * 100,
    }));
  } catch (error) {
    console.error('Erro ao obter geo GA4:', error);
    throw error;
  }
}

// ─── DISPOSITIVOS GA4 ────────────────────────────────────────────────────────

export interface DeviceGA4 {
  device:           string;
  sistema_operacional: string;
  sessoes:          number;
  usuarios:         number;
  taxa_engajamento: number;
}

export async function obterDeviceGA4(
  propertyId: string,
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string, // YYYY-MM-DD
): Promise<DeviceGA4[]> {
  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate: dataInicio, endDate: clampFim(dataFim) }],
      dimensions: [
        { name: 'deviceCategory' },
        { name: 'operatingSystem' },
      ],
      metrics: [
        { name: 'sessions'       },
        { name: 'activeUsers'    },
        { name: 'engagementRate' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    });

    return (response?.rows ?? []).map((row: Record<string, any>) => ({
      device:           row.dimensionValues?.[0]?.value ?? '',
      sistema_operacional: row.dimensionValues?.[1]?.value ?? '',
      sessoes:          parseFloat(row.metricValues?.[0]?.value ?? '0'),
      usuarios:         parseFloat(row.metricValues?.[1]?.value ?? '0'),
      taxa_engajamento: parseFloat(row.metricValues?.[2]?.value ?? '0') * 100,
    }));
  } catch (error) {
    console.error('Erro ao obter device GA4:', error);
    throw error;
  }
}

// ─── EVENTOS GA4 ─────────────────────────────────────────────────────────────

export interface EventoGA4 {
  evento:      string;
  contagem:    number;
  usuarios:    number;
}

export async function obterEventosGA4(
  propertyId: string,
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string, // YYYY-MM-DD
): Promise<EventoGA4[]> {
  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate: dataInicio, endDate: clampFim(dataFim) }],
      dimensions: [{ name: 'eventName' }],
      metrics: [
        { name: 'eventCount'  },
        { name: 'activeUsers' },
      ],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 30,
    });

    return (response?.rows ?? []).map((row: Record<string, any>) => ({
      evento:   row.dimensionValues?.[0]?.value ?? '',
      contagem: parseFloat(row.metricValues?.[0]?.value ?? '0'),
      usuarios: parseFloat(row.metricValues?.[1]?.value ?? '0'),
    }));
  } catch (error) {
    console.error('Erro ao obter eventos GA4:', error);
    throw error;
  }
}

