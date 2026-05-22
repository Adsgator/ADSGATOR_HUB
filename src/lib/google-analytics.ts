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
  taxa_engajamento:     number;
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
        { name: 'screenPageViews'      },
        { name: 'activeUsers'          },
        { name: 'engagementRate'       },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    });

    return (response?.rows ?? []).map((row: Record<string, any>) => ({
      pagina:               row.dimensionValues?.[0]?.value ?? '/',
      visualizacoes:        parseFloat(row.metricValues?.[0]?.value ?? '0'),
      usuarios_unicos:      parseFloat(row.metricValues?.[1]?.value ?? '0'),
      taxa_engajamento:     parseFloat(row.metricValues?.[2]?.value ?? '0') * 100,
      tempo_medio_segundos: parseFloat(row.metricValues?.[3]?.value ?? '0'),
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
