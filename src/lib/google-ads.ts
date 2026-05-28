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

// ═════════════════════════════════════════════════════════════════════════════
// NOVAS FUNÇÕES PARA ANALYTICS PREMIUM
// ═════════════════════════════════════════════════════════════════════════════

// ─── 1. TERMOS DE PESQUISA ────────────────────────────────────────────────────

export interface TermoPesquisa {
  termo:       string;
  impressoes:  number;
  cliques:     number;
  ctr:         number;
  conversoes:  number;
  custo:       number;
}

export async function obterTermosPesquisa(
  customerId: string,
  mesAno:     string,
): Promise<TermoPesquisa[]> {
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
        search_term_view.search_term,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.conversions,
        metrics.cost_micros
      FROM search_term_view
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
      ORDER BY metrics.clicks DESC
      LIMIT 50
    `);

    return results.map((r: Record<string, any>) => ({
      termo:      String(r.search_term_view?.search_term ?? ''),
      impressoes: r.metrics?.impressions ?? 0,
      cliques:    r.metrics?.clicks       ?? 0,
      ctr:        (r.metrics?.ctr         ?? 0) * 100,
      conversoes: r.metrics?.conversions  ?? 0,
      custo:      (r.metrics?.cost_micros ?? 0) / 1_000_000,
    }));
  } catch (error) {
    console.error('Erro ao obter termos de pesquisa:', error);
    return [];
  }
}

// ─── 2. DEMOGRAFIA (IDADE E GÊNERO) ───────────────────────────────────────────

export interface DemografiaDados {
  faixa_etaria: string;
  genero:       string;
  impressoes:   number;
  cliques:      number;
  conversoes:   number;
  custo:        number;
}

export async function obterDemografia(
  customerId: string,
  mesAno:     string,
): Promise<DemografiaDados[]> {
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
        ad_group_criterion.age_range.type,
        ad_group_criterion.gender.type,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros
      FROM age_range_view
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
    `);

    return results.map((r: Record<string, any>) => ({
      faixa_etaria: String(r.ad_group_criterion?.age_range?.type ?? ''),
      genero:       String(r.ad_group_criterion?.gender?.type ?? ''),
      impressoes:   r.metrics?.impressions ?? 0,
      cliques:      r.metrics?.clicks       ?? 0,
      conversoes:   r.metrics?.conversions  ?? 0,
      custo:        (r.metrics?.cost_micros ?? 0) / 1_000_000,
    }));
  } catch (error) {
    console.error('Erro ao obter demografia:', error);
    return [];
  }
}

// ─── 3. GEOGRAFIA (REGIÕES) ────────────────────────────────────────────────────

export interface GeografiaDados {
  pais:        string;
  estado:      string;
  cidade:      string;
  impressoes:  number;
  cliques:     number;
  conversoes:  number;
  custo:       number;
}

export async function obterGeografia(
  customerId: string,
  mesAno:     string,
): Promise<GeografiaDados[]> {
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
        geographic_view.country_criterion_id,
        geographic_view.location_name,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros
      FROM geographic_view
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
      ORDER BY metrics.clicks DESC
      LIMIT 20
    `);

    return results.map((r: Record<string, any>) => ({
      pais:       'Brasil',
      estado:     String(r.geographic_view?.location_name ?? '').split(',')[0]?.trim() ?? '',
      cidade:     String(r.geographic_view?.location_name ?? '').split(',')[1]?.trim() ?? '',
      impressoes: r.metrics?.impressions ?? 0,
      cliques:    r.metrics?.clicks       ?? 0,
      conversoes: r.metrics?.conversions  ?? 0,
      custo:      (r.metrics?.cost_micros ?? 0) / 1_000_000,
    }));
  } catch (error) {
    console.error('Erro ao obter geografia:', error);
    return [];
  }
}

// ─── 4. DISPOSITIVOS ──────────────────────────────────────────────────────────

export interface DeviceDados {
  device:      string;
  impressoes:  number;
  cliques:     number;
  ctr:         number;
  conversoes:  number;
  custo:       number;
}

export async function obterDevice(
  customerId: string,
  mesAno:     string,
): Promise<DeviceDados[]> {
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
        segments.device,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.conversions,
        metrics.cost_micros
      FROM campaign
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
    `);

    const agrupado = new Map<string, { impressoes: number; cliques: number; conversoes: number; custo: number }>();

    for (const r of results) {
      const device = String(r.segments?.device ?? 'UNKNOWN');
      const atual = agrupado.get(device) ?? { impressoes: 0, cliques: 0, conversoes: 0, custo: 0 };
      agrupado.set(device, {
        impressoes: atual.impressoes + (r.metrics?.impressions ?? 0),
        cliques:    atual.cliques    + (r.metrics?.clicks       ?? 0),
        conversoes: atual.conversoes + (r.metrics?.conversions  ?? 0),
        custo:      atual.custo      + ((r.metrics?.cost_micros ?? 0) / 1_000_000),
      });
    }

    return Array.from(agrupado.entries()).map(([device, dados]) => ({
      device,
      impressoes: dados.impressoes,
      cliques:    dados.cliques,
      ctr:        dados.impressoes > 0 ? (dados.cliques / dados.impressoes) * 100 : 0,
      conversoes: dados.conversoes,
      custo:      dados.custo,
    }));
  } catch (error) {
    console.error('Erro ao obter dispositivos:', error);
    return [];
  }
}

// ─── 5. HORÁRIO/DIA DA SEMANA ─────────────────────────────────────────────────

export interface HorarioDados {
  dia_semana:  string;
  hora:        number;
  impressoes:  number;
  cliques:     number;
  conversoes:  number;
  custo:       number;
}

export async function obterHorario(
  customerId: string,
  mesAno:     string,
): Promise<HorarioDados[]> {
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
        segments.day_of_week,
        segments.hour,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros
      FROM campaign
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
    `);

    const agrupado = new Map<string, { impressoes: number; cliques: number; conversoes: number; custo: number }>();

    for (const r of results) {
      const chave = `${r.segments?.day_of_week ?? ''}-${r.segments?.hour ?? 0}`;
      const atual = agrupado.get(chave) ?? { impressoes: 0, cliques: 0, conversoes: 0, custo: 0 };
      agrupado.set(chave, {
        impressoes: atual.impressoes + (r.metrics?.impressions ?? 0),
        cliques:    atual.cliques    + (r.metrics?.clicks       ?? 0),
        conversoes: atual.conversoes + (r.metrics?.conversions  ?? 0),
        custo:      atual.custo      + ((r.metrics?.cost_micros ?? 0) / 1_000_000),
      });
    }

    return Array.from(agrupado.entries()).map(([chave, dados]) => {
      const [dia, hora] = chave.split('-');
      return {
        dia_semana: dia,
        hora:       parseInt(hora, 10),
        impressoes: dados.impressoes,
        cliques:    dados.cliques,
        conversoes: dados.conversoes,
        custo:      dados.custo,
      };
    });
  } catch (error) {
    console.error('Erro ao obter horário:', error);
    return [];
  }
}

// ─── 6. LEILÃO DE CONCORRENTES (AUCTION INSIGHTS) ────────────────────────────

export interface LeilaoDados {
  dominio:            string;
  parcela_impressao:  number; // impression share %
  posicao_superior:   number; // above rate %
  primeira_posicao:   number; // top of page rate %
  sobreposicao:       number; // overlap rate %
}

export async function obterLeilao(
  customerId: string,
  mesAno:     string,
): Promise<LeilaoDados[]> {
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
        auction_insight.domain,
        metrics.search_impression_share,
        metrics.search_absolute_top_impression_share,
        metrics.search_top_impression_share,
        metrics.search_overlap_rate
      FROM auction_insight
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
      ORDER BY metrics.search_impression_share DESC
      LIMIT 20
    `);

    return results.map((r: Record<string, any>) => ({
      dominio:           String(r.auction_insight?.domain ?? ''),
      parcela_impressao: (r.metrics?.search_impression_share ?? 0) * 100,
      posicao_superior:  (r.metrics?.search_absolute_top_impression_share ?? 0) * 100,
      primeira_posicao:  (r.metrics?.search_top_impression_share ?? 0) * 100,
      sobreposicao:      (r.metrics?.search_overlap_rate ?? 0) * 100,
    }));
  } catch (error) {
    console.error('Erro ao obter leilão:', error);
    return [];
  }
}
