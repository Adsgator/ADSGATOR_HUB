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
// O SDK lê GOOGLE_APPLICATION_CREDENTIALS automaticamente do ambiente.

function criarClienteGA4() {
  return new BetaAnalyticsDataClient();
}

function intervaloMes(mesAno: string): { startDate: string; endDate: string } {
  const [ano, mes] = mesAno.split('-').map(Number);
  const ultimoDia  = new Date(ano, mes, 0).getDate();
  return {
    startDate: `${ano}-${String(mes).padStart(2, '0')}-01`,
    endDate:   `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`,
  };
}

// ─── MÉTRICAS GA4 ────────────────────────────────────────────────────────────

export async function obterDadosGA4(
  propertyId: string,
  mesAno:     string,
): Promise<DadosGA4> {
  const { startDate, endDate } = intervaloMes(mesAno);

  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
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
    return {
      sessoes: 0, usuarios_novos: 0, visualizacoes_pagina: 0,
      taxa_engajamento: 0, duracao_media_sessao: 0,
      taxa_rejeicao: 0, conversoes: 0, valor_conversao_total: 0,
    };
  }
}

// ─── TOP PÁGINAS ─────────────────────────────────────────────────────────────

export async function obterPaginasTopPerformance(
  propertyId: string,
  mesAno:     string,
): Promise<PaginaPerformance[]> {
  const { startDate, endDate } = intervaloMes(mesAno);

  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
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
    return [];
  }
}

// ─── FONTES DE TRÁFEGO ────────────────────────────────────────────────────────

export async function obterFontesTrafego(
  propertyId: string,
  mesAno:     string,
): Promise<FonteTrafego[]> {
  const { startDate, endDate } = intervaloMes(mesAno);

  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
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
    return [];
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
  mesAno:     string,
): Promise<GeoGA4[]> {
  const { startDate, endDate } = intervaloMes(mesAno);

  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
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
    return [];
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
  mesAno:     string,
): Promise<DeviceGA4[]> {
  const { startDate, endDate } = intervaloMes(mesAno);

  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
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
    return [];
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
  mesAno:     string,
): Promise<EventoGA4[]> {
  const { startDate, endDate } = intervaloMes(mesAno);

  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
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
    return [];
  }
}

