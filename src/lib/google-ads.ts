import { GoogleAdsApi } from 'google-ads-api';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface DadosCampanhaAds {
  campanha_id:     string;
  campanha_nome:   string;
  status:          string;
  impressoes:      number;
  cliques:         number;
  ctr:             number;
  custo_total:     number;
  conversoes:      number;
  cpa:             number;
  roas:            number;
}

export interface PalavraChavePerformance {
  keyword:     string;
  impressoes:  number;
  cliques:     number;
  ctr:         number;
  cpc_medio:   number;
  conversoes:  number;
  custo:       number;
}

// ─── CLIENTE GOOGLE ADS ───────────────────────────────────────────────────────

function criarClienteAds() {
  return new GoogleAdsApi({
    client_id:       process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret:   process.env.GOOGLE_ADS_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  });
}

// ─── OBTER DADOS DE CAMPANHAS ─────────────────────────────────────────────────

export async function obterDadosCampanhasAds(
  customerId:  string,
  mesAno:      string,  // formato: YYYY-MM
): Promise<DadosCampanhaAds[]> {
  const [ano, mes] = mesAno.split('-').map(Number);
  const primeiroDia = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia   = new Date(ano, mes, 0);
  const ultimoDiaStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;

  try {
    const client   = criarClienteAds();
    const customer = client.Customer({
      customer_id:   customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
    });

    const results = await customer.query(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.cost_micros,
        metrics.conversions,
        metrics.cost_per_conversion
      FROM campaign
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
        AND campaign.status != 'REMOVED'
    `);

    return results.map((r: Record<string, any>) => {
      const custo      = (r.metrics?.cost_micros ?? 0) / 1_000_000;
      const conversoes = r.metrics?.conversions ?? 0;
      const cliques    = r.metrics?.clicks      ?? 0;
      const impressoes = r.metrics?.impressions  ?? 0;

      return {
        campanha_id:   String(r.campaign?.id ?? ''),
        campanha_nome: String(r.campaign?.name ?? ''),
        status:        String(r.campaign?.status ?? ''),
        impressoes,
        cliques,
        ctr:           impressoes > 0 ? (cliques / impressoes) * 100 : 0,
        custo_total:   custo,
        conversoes,
        cpa:           conversoes > 0 ? custo / conversoes : 0,
        roas:          custo > 0 ? conversoes / custo : 0,
      };
    });
  } catch (error) {
    console.error('Erro ao obter campanhas Google Ads:', error);
    return [];
  }
}

// ─── OBTER PALAVRAS-CHAVE ─────────────────────────────────────────────────────

export async function obterPalavrasChavePerformance(
  customerId: string,
  mesAno:     string,
): Promise<PalavraChavePerformance[]> {
  const [ano, mes] = mesAno.split('-').map(Number);
  const primeiroDia  = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia    = new Date(ano, mes, 0);
  const ultimoDiaStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;

  try {
    const client   = criarClienteAds();
    const customer = client.Customer({
      customer_id:   customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
    });

    const results = await customer.query(`
      SELECT
        ad_group_criterion.keyword.text,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions,
        metrics.cost_micros
      FROM keyword_view
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
        AND ad_group_criterion.status != 'REMOVED'
      ORDER BY metrics.clicks DESC
      LIMIT 20
    `);

    return results.map((r: Record<string, any>) => ({
      keyword:    String(r.ad_group_criterion?.keyword?.text ?? ''),
      impressoes: r.metrics?.impressions    ?? 0,
      cliques:    r.metrics?.clicks         ?? 0,
      ctr:        (r.metrics?.ctr           ?? 0) * 100,
      cpc_medio:  (r.metrics?.average_cpc   ?? 0) / 1_000_000,
      conversoes: r.metrics?.conversions    ?? 0,
      custo:      (r.metrics?.cost_micros   ?? 0) / 1_000_000,
    }));
  } catch (error) {
    console.error('Erro ao obter palavras-chave:', error);
    return [];
  }
}
