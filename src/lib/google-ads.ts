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

// A API rejeita IDs com hífen/espaço ("Invalid customer ID '123-456-7890'"),
// então normaliza para só dígitos aqui na borda — aceita o formato que vier.
// Exportado para camadas que montam GAQL próprio (ads-detalhes.ts).
export function criarCustomer(customerId: string) {
  const client = criarClienteAds();
  return client.Customer({
    customer_id:       customerId.replace(/\D/g, ''),
    refresh_token:     process.env.GOOGLE_ADS_REFRESH_TOKEN!,
    login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
  });
}

// ─── OBTER DADOS DE CAMPANHAS ─────────────────────────────────────────────────

export async function obterDadosCampanhasAds(
  customerId:  string,
  dataInicio:  string,  // YYYY-MM-DD
  dataFim:     string,  // YYYY-MM-DD
): Promise<DadosCampanhaAds[]> {
  try {
    const customer = criarCustomer(customerId);

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
      WHERE segments.date BETWEEN '${dataInicio}' AND '${dataFim}'
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
    throw error;
  }
}

// ─── OBTER PALAVRAS-CHAVE ─────────────────────────────────────────────────────

export async function obterPalavrasChavePerformance(
  customerId: string,
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string, // YYYY-MM-DD
): Promise<PalavraChavePerformance[]> {
  try {
    const customer = criarCustomer(customerId);

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
      WHERE segments.date BETWEEN '${dataInicio}' AND '${dataFim}'
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
    throw error;
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
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string, // YYYY-MM-DD
): Promise<TermoPesquisa[]> {
  try {
    const customer = criarCustomer(customerId);

    const results = await customer.query(`
      SELECT
        search_term_view.search_term,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.conversions,
        metrics.cost_micros
      FROM search_term_view
      WHERE segments.date BETWEEN '${dataInicio}' AND '${dataFim}'
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
    throw error;
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
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string, // YYYY-MM-DD
): Promise<DemografiaDados[]> {
  try {
    const customer = criarCustomer(customerId);

    const results = await customer.query(`
      SELECT
        ad_group_criterion.age_range.type,
        ad_group_criterion.gender.type,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros
      FROM age_range_view
      WHERE segments.date BETWEEN '${dataInicio}' AND '${dataFim}'
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
    throw error;
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
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string, // YYYY-MM-DD
): Promise<GeografiaDados[]> {
  try {
    const customer = criarCustomer(customerId);

    const results = await customer.query(`
      SELECT
        geographic_view.country_criterion_id,
        geographic_view.location_name,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros
      FROM geographic_view
      WHERE segments.date BETWEEN '${dataInicio}' AND '${dataFim}'
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
    throw error;
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
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string, // YYYY-MM-DD
): Promise<DeviceDados[]> {
  try {
    const customer = criarCustomer(customerId);

    const results = await customer.query(`
      SELECT
        segments.device,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.conversions,
        metrics.cost_micros
      FROM campaign
      WHERE segments.date BETWEEN '${dataInicio}' AND '${dataFim}'
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
    throw error;
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
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string, // YYYY-MM-DD
): Promise<HorarioDados[]> {
  try {
    const customer = criarCustomer(customerId);

    const results = await customer.query(`
      SELECT
        segments.day_of_week,
        segments.hour,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros
      FROM campaign
      WHERE segments.date BETWEEN '${dataInicio}' AND '${dataFim}'
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
    throw error;
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
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string, // YYYY-MM-DD
): Promise<LeilaoDados[]> {
  try {
    const customer = criarCustomer(customerId);

    const results = await customer.query(`
      SELECT
        auction_insight.domain,
        metrics.search_impression_share,
        metrics.search_absolute_top_impression_share,
        metrics.search_top_impression_share,
        metrics.search_overlap_rate
      FROM auction_insight
      WHERE segments.date BETWEEN '${dataInicio}' AND '${dataFim}'
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
    throw error;
  }
}

// ─── TESTE DE CONEXÃO ────────────────────────────────────────────────────────
// Query mínima só para validar customer ID + acesso via MCC + credenciais.
// Lança com a mensagem crua da API — a rota de teste traduz para o usuário.

export async function testarConexaoAds(customerId: string): Promise<void> {
  const customer = criarCustomer(customerId);
  await customer.query(`SELECT customer.id FROM customer LIMIT 1`);
}

// ─── 7. SALDO DA CONTA (contas pré-pagas / boleto) ───────────────────────────
// Deriva o saldo restante dos orçamentos aprovados da conta (account_budget):
// soma dos limites aprovados menos o total já servido. Contas pós-pagas têm
// orçamento sem limite — não dá para derivar saldo, retorna null e o valor
// passa a ser o campo manual em clientes.saldo_google.

export async function obterSaldoConta(customerId: string): Promise<number | null> {
  const customer = criarCustomer(customerId);

  const results = await customer.query(`
    SELECT
      account_budget.status,
      account_budget.approved_spending_limit_micros,
      account_budget.amount_served_micros
    FROM account_budget
    WHERE account_budget.status = 'APPROVED'
  `);

  let temLimite = false;
  let limite    = 0;
  let servido   = 0;

  for (const r of results as Array<Record<string, any>>) {
    const lim = r.account_budget?.approved_spending_limit_micros;
    if (lim == null) continue; // orçamento ilimitado (conta pós-paga)
    temLimite = true;
    limite  += Number(lim);
    servido += Number(r.account_budget?.amount_served_micros ?? 0);
  }

  if (!temLimite) return null;
  return (limite - servido) / 1_000_000;
}
