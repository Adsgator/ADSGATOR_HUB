import { criarCustomer, obterDadosCampanhasAds } from './google-ads'
import { consultarAds, viewAds } from './bigquery'

// ─── ANALYTICS 2.0 (F1) — cortes detalhados do Google Ads ────────────────────
// Camada de dados dos dashboards internos e do portal: termos de pesquisa,
// demografia, geografia, dia/hora, dispositivos, série diária, KPIs e
// impression share — por cliente, período flexível e filtro opcional de
// campanha, com comparativo de período computado no server.
//
// Fontes (decidido na F0 do plano Analytics 2.0):
//   - Primária: views do BigQuery Data Transfer (histórico desde 07/2025,
//     inclusive campanhas removidas; sem custo de cota da API).
//   - Fallback: GAQL ao vivo, para conta que ainda não carregou no transfer —
//     mesmo shape de retorno nas duas fontes (enums crus da API).
//   - Impression share é GAQL-only (não vem no transfer).
// Regra herdada (não regredir): falha nas DUAS fontes LANÇA — nunca devolver
// zeros como se fossem dado.

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface PeriodoAds {
  inicio: string // YYYY-MM-DD
  fim:    string // YYYY-MM-DD
}

export interface FiltroAds {
  campanhaId?: string
}

export interface MetricasAds {
  impressoes: number
  cliques:    number
  custo:      number
  conversoes: number
}

export interface LinhaDiaAds extends MetricasAds { data: string }
export interface LinhaTermoAds extends MetricasAds { termo: string }
export interface LinhaFaixaEtariaAds extends MetricasAds { faixa: string }   // enum AGE_RANGE_*
export interface LinhaGeneroAds extends MetricasAds { genero: string }       // MALE | FEMALE | UNDETERMINED
export interface LinhaLocalAds extends MetricasAds {
  local:  string // nome resolvido (cidade, região…)
  regiao: string // unidade acima (estado, quando o local é cidade)
  tipo:   string // target_type do geo constant (City, State…)
}
export interface LinhaDiaSemanaAds extends MetricasAds { dia: string }       // enum MONDAY..SUNDAY
export interface LinhaHoraAds extends MetricasAds { hora: number }           // 0–23
export interface LinhaDispositivoAds extends MetricasAds { dispositivo: string } // enum MOBILE, DESKTOP…
export interface CampanhaPeriodoAds extends MetricasAds { id: string; nome: string }

export interface DemografiaAds {
  faixasEtarias: LinhaFaixaEtariaAds[]
  generos:       LinhaGeneroAds[]
}

export interface DiasHorariosAds {
  porDiaSemana: LinhaDiaSemanaAds[] // 7 linhas, segunda→domingo
  porHora:      LinhaHoraAds[]      // 24 linhas, 0→23
}

export interface ImpressionShareAds {
  parcelaImpressao:      number | null // search_impression_share %
  parcelaPrimeiraPosicao: number | null // search_top_impression_share %
  parcelaTopoAbsoluto:   number | null // search_absolute_top_impression_share %
}

export interface KpisAds extends MetricasAds {
  ctr:            number // %
  cpcMedio:       number
  cpa:            number
  taxaConversao:  number // %
  impressionShare: ImpressionShareAds
}

export interface KpisAdsComparativo {
  periodo:          PeriodoAds
  periodoAnterior:  PeriodoAds
  atual:            KpisAds
  anterior:         KpisAds
}

// ─── PERÍODO E COMPARATIVO ───────────────────────────────────────────────────

const RE_DATA = /^\d{4}-\d{2}-\d{2}$/

function validarPeriodo(p: PeriodoAds): void {
  if (!RE_DATA.test(p.inicio) || !RE_DATA.test(p.fim)) {
    throw new Error(`Período inválido: "${p.inicio}"–"${p.fim}" (esperado YYYY-MM-DD)`)
  }
  if (p.fim < p.inicio) throw new Error(`Período inválido: fim ${p.fim} antes do início ${p.inicio}`)
}

const DIA_MS = 86_400_000

function diaUtc(data: string): number {
  const [ano, mes, dia] = data.split('-').map(Number)
  return Date.UTC(ano, mes - 1, dia)
}

function formatarDia(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

/** Período imediatamente anterior com a mesma duração (para o comparativo). */
export function periodoAnterior(p: PeriodoAds): PeriodoAds {
  validarPeriodo(p)
  const dias = (diaUtc(p.fim) - diaUtc(p.inicio)) / DIA_MS + 1
  const fim = diaUtc(p.inicio) - DIA_MS
  return { inicio: formatarDia(fim - (dias - 1) * DIA_MS), fim: formatarDia(fim) }
}

/** Variação % entre períodos; null quando não há base de comparação. */
export function variacaoPercentual(atual: number, anterior: number): number | null {
  if (!anterior) return null
  return r2(((atual - anterior) / anterior) * 100)
}

// ─── HELPERS INTERNOS ────────────────────────────────────────────────────────

const r2 = (n: number) => Math.round(n * 100) / 100

const SOMA_METRICAS_BQ = `
      SUM(metrics_impressions)        AS impressoes,
      SUM(metrics_clicks)             AS cliques,
      SUM(metrics_cost_micros) / 1e6  AS custo,
      SUM(metrics_conversions)        AS conversoes`

const METRICAS_GAQL = 'metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions'

function metricasDeLinhaBq(r: Record<string, unknown>): MetricasAds {
  return {
    impressoes: Number(r.impressoes ?? 0),
    cliques:    Number(r.cliques ?? 0),
    custo:      r2(Number(r.custo ?? 0)),
    conversoes: r2(Number(r.conversoes ?? 0)),
  }
}

function campanhaIdNumero(filtro?: FiltroAds): number | null {
  if (!filtro?.campanhaId) return null
  const id = Number(String(filtro.campanhaId).replace(/\D/g, ''))
  if (!Number.isFinite(id) || id <= 0) throw new Error(`campanhaId inválido: "${filtro.campanhaId}"`)
  return id
}

/** Cláusula extra + params para o filtro de campanha nas queries BQ. */
function filtroBq(filtro?: FiltroAds): { sql: string; params: Record<string, unknown> } {
  const id = campanhaIdNumero(filtro)
  if (id === null) return { sql: '', params: {} }
  return { sql: ' AND campaign_id = @campanha', params: { campanha: id } }
}

/** WHERE compartilhado das queries GAQL (datas já validadas na borda). */
function gaqlWhere(p: PeriodoAds, filtro?: FiltroAds): string {
  const id = campanhaIdNumero(filtro)
  const campanha = id === null ? '' : ` AND campaign.id = ${id}`
  return `segments.date BETWEEN '${p.inicio}' AND '${p.fim}'${campanha}`
}

type LinhaGaql = Record<string, any>

function metricasDeLinhaGaql(r: LinhaGaql): MetricasAds {
  return {
    impressoes: r.metrics?.impressions ?? 0,
    cliques:    r.metrics?.clicks ?? 0,
    custo:      (r.metrics?.cost_micros ?? 0) / 1_000_000,
    conversoes: r.metrics?.conversions ?? 0,
  }
}

// A lib google-ads-api devolve enums como o NÚMERO do protobuf (device 2 =
// MOBILE, day_of_week 2 = MONDAY…) — normaliza para o nome, que é o formato
// das views do BigQuery, para as duas fontes retornarem o mesmo shape.
function nomeEnum(valor: unknown, porNumero: Record<number, string>, padrao: string): string {
  if (typeof valor === 'number') return porNumero[valor] ?? padrao
  return String(valor ?? '') || padrao
}

const DISPOSITIVO_POR_ENUM: Record<number, string> = {
  2: 'MOBILE', 3: 'TABLET', 4: 'DESKTOP', 5: 'CONNECTED_TV', 6: 'OTHER',
}

const DIA_POR_ENUM: Record<number, string> = {
  2: 'MONDAY', 3: 'TUESDAY', 4: 'WEDNESDAY', 5: 'THURSDAY',
  6: 'FRIDAY', 7: 'SATURDAY', 8: 'SUNDAY',
}

/** Acumula métricas por chave (as agregações em JS dos dois lados usam isto). */
function acumular<K>(mapa: Map<K, MetricasAds>, chave: K, m: MetricasAds): void {
  const atual = mapa.get(chave)
  if (!atual) {
    mapa.set(chave, { ...m })
    return
  }
  atual.impressoes += m.impressoes
  atual.cliques    += m.cliques
  atual.custo      += m.custo
  atual.conversoes += m.conversoes
}

function arredondar(m: MetricasAds): MetricasAds {
  return { ...m, custo: r2(m.custo), conversoes: r2(m.conversoes) }
}

/** BQ primeiro; qualquer falha (conta fora do transfer, BQ fora) cai no GAQL. */
async function comFallback<T>(rotulo: string, bigquery: () => Promise<T>, gaql: () => Promise<T>): Promise<T> {
  try {
    return await bigquery()
  } catch (err) {
    console.warn(
      `[ads-detalhes] BigQuery indisponível (${rotulo}) — fallback GAQL:`,
      err instanceof Error ? err.message : err,
    )
    return gaql()
  }
}

// ─── SÉRIE DIÁRIA ────────────────────────────────────────────────────────────

export async function serieDiariaAds(
  customerId: string,
  periodo:    PeriodoAds,
  filtro?:    FiltroAds,
): Promise<LinhaDiaAds[]> {
  validarPeriodo(periodo)
  const extra = filtroBq(filtro)

  return comFallback('série diária', async () => {
    const rows = await consultarAds(customerId, `
      SELECT CAST(segments_date AS STRING) AS data, ${SOMA_METRICAS_BQ}
      FROM \`${viewAds('CampaignBasicStats')}\`
      WHERE customer_id = @cid AND segments_date BETWEEN @inicio AND @fim${extra.sql}
      GROUP BY data
      ORDER BY data
    `, { inicio: periodo.inicio, fim: periodo.fim, ...extra.params })
    return rows.map((r) => ({ data: String(r.data ?? ''), ...metricasDeLinhaBq(r) }))
  }, async () => {
    const customer = criarCustomer(customerId)
    const recurso = filtro?.campanhaId ? 'campaign' : 'customer'
    const rows: LinhaGaql[] = await customer.query(`
      SELECT segments.date, ${METRICAS_GAQL}
      FROM ${recurso}
      WHERE ${gaqlWhere(periodo, filtro)}
    `)
    const mapa = new Map<string, MetricasAds>()
    for (const r of rows) acumular(mapa, String(r.segments?.date ?? ''), metricasDeLinhaGaql(r))
    return Array.from(mapa.entries())
      .map(([data, m]) => ({ data, ...arredondar(m) }))
      .sort((a, b) => a.data.localeCompare(b.data))
  })
}

// ─── TERMOS DE PESQUISA ──────────────────────────────────────────────────────

export async function termosPesquisaAds(
  customerId: string,
  periodo:    PeriodoAds,
  filtro?:    FiltroAds,
  limite = 100,
): Promise<LinhaTermoAds[]> {
  validarPeriodo(periodo)
  const extra = filtroBq(filtro)

  return comFallback('termos de pesquisa', async () => {
    const rows = await consultarAds(customerId, `
      SELECT search_term_view_search_term AS termo, ${SOMA_METRICAS_BQ}
      FROM \`${viewAds('SearchQueryStats')}\`
      WHERE customer_id = @cid AND segments_date BETWEEN @inicio AND @fim${extra.sql}
      GROUP BY termo
      ORDER BY cliques DESC, impressoes DESC
      LIMIT @limite
    `, { inicio: periodo.inicio, fim: periodo.fim, limite, ...extra.params })
    return rows.map((r) => ({ termo: String(r.termo ?? ''), ...metricasDeLinhaBq(r) }))
  }, async () => {
    const customer = criarCustomer(customerId)
    const rows: LinhaGaql[] = await customer.query(`
      SELECT search_term_view.search_term, ${METRICAS_GAQL}
      FROM search_term_view
      WHERE ${gaqlWhere(periodo, filtro)}
      ORDER BY metrics.clicks DESC
      LIMIT ${limite}
    `)
    const mapa = new Map<string, MetricasAds>()
    for (const r of rows) acumular(mapa, String(r.search_term_view?.search_term ?? ''), metricasDeLinhaGaql(r))
    return Array.from(mapa.entries())
      .map(([termo, m]) => ({ termo, ...arredondar(m) }))
      .sort((a, b) => b.cliques - a.cliques)
  })
}

// ─── DEMOGRAFIA (IDADE + GÊNERO) ─────────────────────────────────────────────
// No transfer, as views de stats trazem só o criterion_id; os IDs de faixa
// etária e gênero são constantes globais do Google Ads — mapear direto evita
// join com a view de entidade (que perde critérios de campanhas removidas).

const FAIXA_POR_CRITERIO: Record<number, string> = {
  503001: 'AGE_RANGE_18_24',
  503002: 'AGE_RANGE_25_34',
  503003: 'AGE_RANGE_35_44',
  503004: 'AGE_RANGE_45_54',
  503005: 'AGE_RANGE_55_64',
  503006: 'AGE_RANGE_65_UP',
  503999: 'AGE_RANGE_UNDETERMINED',
}

const GENERO_POR_CRITERIO: Record<number, string> = {
  10: 'MALE',
  11: 'FEMALE',
  20: 'UNDETERMINED',
}

const ORDEM_FAIXAS = [
  'AGE_RANGE_18_24', 'AGE_RANGE_25_34', 'AGE_RANGE_35_44', 'AGE_RANGE_45_54',
  'AGE_RANGE_55_64', 'AGE_RANGE_65_UP', 'AGE_RANGE_UNDETERMINED',
]
const ORDEM_GENEROS = ['MALE', 'FEMALE', 'UNDETERMINED']

function ordenarPor(ordem: string[], chave: string): number {
  const i = ordem.indexOf(chave)
  return i === -1 ? ordem.length : i
}

export async function demografiaAds(
  customerId: string,
  periodo:    PeriodoAds,
  filtro?:    FiltroAds,
): Promise<DemografiaAds> {
  validarPeriodo(periodo)
  const extra = filtroBq(filtro)

  const porCriterio = async (view: string, mapaCriterio: Record<number, string>) => {
    const rows = await consultarAds(customerId, `
      SELECT ad_group_criterion_criterion_id AS criterio, ${SOMA_METRICAS_BQ}
      FROM \`${viewAds(view)}\`
      WHERE customer_id = @cid AND segments_date BETWEEN @inicio AND @fim${extra.sql}
      GROUP BY criterio
    `, { inicio: periodo.inicio, fim: periodo.fim, ...extra.params })
    const mapa = new Map<string, MetricasAds>()
    for (const r of rows) {
      acumular(mapa, mapaCriterio[Number(r.criterio)] ?? String(r.criterio), metricasDeLinhaBq(r))
    }
    return mapa
  }

  // No proto, os enums de idade/gênero têm o MESMO número do criterion id —
  // o mapa serve para as duas fontes.
  const porGaql = async (recurso: string, campoTipo: string, porNumero: Record<number, string>, padrao: string) => {
    const customer = criarCustomer(customerId)
    const rows: LinhaGaql[] = await customer.query(`
      SELECT ${campoTipo}, ${METRICAS_GAQL}
      FROM ${recurso}
      WHERE ${gaqlWhere(periodo, filtro)}
    `)
    const mapa = new Map<string, MetricasAds>()
    for (const r of rows) {
      let valor: any = r
      for (const p of campoTipo.split('.')) valor = valor?.[p]
      acumular(mapa, nomeEnum(valor, porNumero, padrao), metricasDeLinhaGaql(r))
    }
    return mapa
  }

  const [faixas, generos] = await comFallback('demografia', async () => {
    return Promise.all([
      porCriterio('AgeRangeBasicStats', FAIXA_POR_CRITERIO),
      porCriterio('GenderBasicStats', GENERO_POR_CRITERIO),
    ])
  }, async () => {
    return Promise.all([
      porGaql('age_range_view', 'ad_group_criterion.age_range.type', FAIXA_POR_CRITERIO, 'AGE_RANGE_UNDETERMINED'),
      porGaql('gender_view', 'ad_group_criterion.gender.type', GENERO_POR_CRITERIO, 'UNDETERMINED'),
    ])
  })

  return {
    faixasEtarias: Array.from(faixas.entries())
      .map(([faixa, m]) => ({ faixa, ...arredondar(m) }))
      .sort((a, b) => ordenarPor(ORDEM_FAIXAS, a.faixa) - ordenarPor(ORDEM_FAIXAS, b.faixa)),
    generos: Array.from(generos.entries())
      .map(([genero, m]) => ({ genero, ...arredondar(m) }))
      .sort((a, b) => ordenarPor(ORDEM_GENEROS, a.genero) - ordenarPor(ORDEM_GENEROS, b.genero)),
  }
}

// ─── GEOGRAFIA ───────────────────────────────────────────────────────────────
// As duas fontes devolvem só o ID do geo target ("geoTargetConstants/NNN");
// o nome é resolvido em lote via geo_target_constant na API Ads. Filtramos
// LOCATION_OF_PRESENCE (onde o usuário estava) — somar presença + interesse
// duplicaria as métricas.

async function resolverLocais(
  customerId: string,
  porLocal:   Map<number, MetricasAds>,
  limite:     number,
): Promise<LinhaLocalAds[]> {
  const ids = Array.from(porLocal.keys()).filter((id) => id > 0)
  if (ids.length === 0) return []

  const customer = criarCustomer(customerId)
  const rows: LinhaGaql[] = await customer.query(`
    SELECT geo_target_constant.id, geo_target_constant.name,
           geo_target_constant.canonical_name, geo_target_constant.target_type
    FROM geo_target_constant
    WHERE geo_target_constant.id IN (${ids.join(', ')})
  `)
  const nomes = new Map<number, { nome: string; canonico: string; tipo: string }>()
  for (const r of rows) {
    nomes.set(Number(r.geo_target_constant?.id), {
      nome:     String(r.geo_target_constant?.name ?? ''),
      canonico: String(r.geo_target_constant?.canonical_name ?? ''),
      tipo:     String(r.geo_target_constant?.target_type ?? ''),
    })
  }

  return Array.from(porLocal.entries())
    .map(([id, m]) => {
      const info = nomes.get(id)
      // canonical_name = "Cidade,Região,País" → a região é a penúltima parte
      const partes = (info?.canonico ?? '').split(',')
      return {
        local:  info?.nome || `#${id}`,
        regiao: partes.length >= 3 ? partes[partes.length - 2].trim() : '',
        tipo:   info?.tipo ?? '',
        ...arredondar(m),
      }
    })
    .sort((a, b) => b.cliques - a.cliques)
    .slice(0, limite)
}

function idGeoTarget(recurso: unknown): number {
  return Number(String(recurso ?? '').replace(/\D/g, '')) || 0
}

export async function geografiaAds(
  customerId: string,
  periodo:    PeriodoAds,
  filtro?:    FiltroAds,
  limite = 50,
): Promise<LinhaLocalAds[]> {
  validarPeriodo(periodo)
  const extra = filtroBq(filtro)

  const porLocal = await comFallback('geografia', async () => {
    const rows = await consultarAds(customerId, `
      SELECT segments_geo_target_most_specific_location AS local_id, ${SOMA_METRICAS_BQ}
      FROM \`${viewAds('GeoStats')}\`
      WHERE customer_id = @cid AND segments_date BETWEEN @inicio AND @fim
        AND geographic_view_location_type = 'LOCATION_OF_PRESENCE'${extra.sql}
      GROUP BY local_id
      ORDER BY cliques DESC
      LIMIT @limite
    `, { inicio: periodo.inicio, fim: periodo.fim, limite, ...extra.params })
    const mapa = new Map<number, MetricasAds>()
    for (const r of rows) mapa.set(idGeoTarget(r.local_id), metricasDeLinhaBq(r))
    return mapa
  }, async () => {
    const customer = criarCustomer(customerId)
    const rows: LinhaGaql[] = await customer.query(`
      SELECT segments.geo_target_most_specific_location, ${METRICAS_GAQL}
      FROM geographic_view
      WHERE ${gaqlWhere(periodo, filtro)}
        AND geographic_view.location_type = 'LOCATION_OF_PRESENCE'
    `)
    const mapa = new Map<number, MetricasAds>()
    for (const r of rows) {
      acumular(mapa, idGeoTarget(r.segments?.geo_target_most_specific_location), metricasDeLinhaGaql(r))
    }
    return mapa
  })

  return resolverLocais(customerId, porLocal, limite)
}

// ─── DIA DA SEMANA + HORA ────────────────────────────────────────────────────
// ⚠️ ads_HourlyCampaignStats do transfer é segmentado por click_type, o que
// DUPLICA impressões ao somar (validado com dado real: a linha URL_CLICKS
// sozinha já repete o total da conta). Por isso o dia da semana sai do
// CampaignBasicStats (EXTRACT do dia da data) e a hora sai da API ao vivo
// (GAQL), que não segmenta por click_type.

const DIAS_SEMANA = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

// EXTRACT(DAYOFWEEK) do BigQuery: 1 = domingo … 7 = sábado
const DIA_POR_NUM_BQ: Record<number, string> = {
  1: 'SUNDAY', 2: 'MONDAY', 3: 'TUESDAY', 4: 'WEDNESDAY',
  5: 'THURSDAY', 6: 'FRIDAY', 7: 'SATURDAY',
}

const metricasVazias = (): MetricasAds => ({ impressoes: 0, cliques: 0, custo: 0, conversoes: 0 })

export async function diasHorariosAds(
  customerId: string,
  periodo:    PeriodoAds,
  filtro?:    FiltroAds,
): Promise<DiasHorariosAds> {
  validarPeriodo(periodo)
  const extra = filtroBq(filtro)

  const porDiaPromise = comFallback('dia da semana', async () => {
    const rows = await consultarAds(customerId, `
      SELECT EXTRACT(DAYOFWEEK FROM segments_date) AS dia_num, ${SOMA_METRICAS_BQ}
      FROM \`${viewAds('CampaignBasicStats')}\`
      WHERE customer_id = @cid AND segments_date BETWEEN @inicio AND @fim${extra.sql}
      GROUP BY dia_num
    `, { inicio: periodo.inicio, fim: periodo.fim, ...extra.params })
    const mapa = new Map<string, MetricasAds>()
    for (const r of rows) mapa.set(DIA_POR_NUM_BQ[Number(r.dia_num)] ?? '', metricasDeLinhaBq(r))
    return mapa
  }, async () => {
    const customer = criarCustomer(customerId)
    const rows: LinhaGaql[] = await customer.query(`
      SELECT segments.day_of_week, ${METRICAS_GAQL}
      FROM campaign
      WHERE ${gaqlWhere(periodo, filtro)}
    `)
    const mapa = new Map<string, MetricasAds>()
    for (const r of rows) acumular(mapa, nomeEnum(r.segments?.day_of_week, DIA_POR_ENUM, ''), metricasDeLinhaGaql(r))
    return mapa
  })

  const porHoraPromise = (async () => {
    const customer = criarCustomer(customerId)
    const rows: LinhaGaql[] = await customer.query(`
      SELECT segments.hour, ${METRICAS_GAQL}
      FROM campaign
      WHERE ${gaqlWhere(periodo, filtro)}
    `)
    const mapa = new Map<number, MetricasAds>()
    for (const r of rows) acumular(mapa, Number(r.segments?.hour ?? 0), metricasDeLinhaGaql(r))
    return mapa
  })()

  const [porDia, porHora] = await Promise.all([porDiaPromise, porHoraPromise])
  return {
    porDiaSemana: DIAS_SEMANA.map((dia) => ({ dia, ...arredondar(porDia.get(dia) ?? metricasVazias()) })),
    porHora: Array.from({ length: 24 }, (_, hora) => ({ hora, ...arredondar(porHora.get(hora) ?? metricasVazias()) })),
  }
}

// ─── DISPOSITIVOS ────────────────────────────────────────────────────────────

export async function dispositivosAds(
  customerId: string,
  periodo:    PeriodoAds,
  filtro?:    FiltroAds,
): Promise<LinhaDispositivoAds[]> {
  validarPeriodo(periodo)
  const extra = filtroBq(filtro)

  return comFallback('dispositivos', async () => {
    const rows = await consultarAds(customerId, `
      SELECT segments_device AS dispositivo, ${SOMA_METRICAS_BQ}
      FROM \`${viewAds('CampaignBasicStats')}\`
      WHERE customer_id = @cid AND segments_date BETWEEN @inicio AND @fim${extra.sql}
      GROUP BY dispositivo
      ORDER BY cliques DESC
    `, { inicio: periodo.inicio, fim: periodo.fim, ...extra.params })
    return rows.map((r) => ({ dispositivo: String(r.dispositivo ?? 'UNKNOWN'), ...metricasDeLinhaBq(r) }))
  }, async () => {
    const customer = criarCustomer(customerId)
    const rows: LinhaGaql[] = await customer.query(`
      SELECT segments.device, ${METRICAS_GAQL}
      FROM campaign
      WHERE ${gaqlWhere(periodo, filtro)}
    `)
    const mapa = new Map<string, MetricasAds>()
    for (const r of rows) acumular(mapa, nomeEnum(r.segments?.device, DISPOSITIVO_POR_ENUM, 'UNKNOWN'), metricasDeLinhaGaql(r))
    return Array.from(mapa.entries())
      .map(([dispositivo, m]) => ({ dispositivo, ...arredondar(m) }))
      .sort((a, b) => b.cliques - a.cliques)
  })
}

// ─── CAMPANHAS DO PERÍODO (para o filtro da UI) ──────────────────────────────

export async function campanhasDoPeriodoAds(
  customerId: string,
  periodo:    PeriodoAds,
): Promise<CampanhaPeriodoAds[]> {
  validarPeriodo(periodo)

  return comFallback('campanhas do período', async () => {
    const rows = await consultarAds(customerId, `
      SELECT CAST(s.campaign_id AS STRING) AS id, c.campaign_name AS nome, ${SOMA_METRICAS_BQ}
      FROM \`${viewAds('CampaignBasicStats')}\` s
      JOIN (
        SELECT campaign_id, ANY_VALUE(campaign_name) AS campaign_name
        FROM \`${viewAds('Campaign')}\`
        WHERE customer_id = @cid AND _DATA_DATE = _LATEST_DATE
        GROUP BY campaign_id
      ) c USING (campaign_id)
      WHERE s.customer_id = @cid AND s.segments_date BETWEEN @inicio AND @fim
      GROUP BY id, nome
      ORDER BY custo DESC
    `, { inicio: periodo.inicio, fim: periodo.fim })
    return rows.map((r) => ({ id: String(r.id ?? ''), nome: String(r.nome ?? ''), ...metricasDeLinhaBq(r) }))
  }, async () => {
    const campanhas = await obterDadosCampanhasAds(customerId, periodo.inicio, periodo.fim)
    return campanhas
      .map((c) => ({
        id: c.campanha_id, nome: c.campanha_nome,
        impressoes: c.impressoes, cliques: c.cliques,
        custo: r2(c.custo_total), conversoes: r2(c.conversoes),
      }))
      .sort((a, b) => b.custo - a.custo)
  })
}

// ─── IMPRESSION SHARE (GAQL-only — não vem no transfer) ──────────────────────

// A API não expõe os shares agregados no recurso customer (rejeita os de
// topo) — deriva do nível de campanha: elegíveis = impressões / share, e o
// agregado = Σ impressões / Σ elegíveis, exato pela definição das métricas.
export async function impressionShareAds(
  customerId: string,
  periodo:    PeriodoAds,
  filtro?:    FiltroAds,
): Promise<ImpressionShareAds> {
  validarPeriodo(periodo)
  const customer = criarCustomer(customerId)
  const rows: LinhaGaql[] = await customer.query(`
    SELECT metrics.impressions, metrics.search_impression_share,
           metrics.search_top_impression_share, metrics.search_absolute_top_impression_share,
           metrics.top_impression_percentage, metrics.absolute_top_impression_percentage
    FROM campaign
    WHERE ${gaqlWhere(periodo, filtro)}
  `)

  let impr = 0, elegiveis = 0
  let imprTopo = 0, elegiveisTopo = 0
  let imprAbsoluto = 0, elegiveisAbsoluto = 0
  for (const r of rows) {
    const m = r.metrics ?? {}
    const impressoes = m.impressions ?? 0
    if (impressoes <= 0) continue
    if (m.search_impression_share) {
      impr      += impressoes
      elegiveis += impressoes / m.search_impression_share
    }
    if (m.search_top_impression_share && m.top_impression_percentage != null) {
      const topo = impressoes * m.top_impression_percentage
      imprTopo      += topo
      elegiveisTopo += topo / m.search_top_impression_share
    }
    if (m.search_absolute_top_impression_share && m.absolute_top_impression_percentage != null) {
      const absoluto = impressoes * m.absolute_top_impression_percentage
      imprAbsoluto      += absoluto
      elegiveisAbsoluto += absoluto / m.search_absolute_top_impression_share
    }
  }

  const share = (num: number, den: number) => (den > 0 ? r2((num / den) * 100) : null)
  return {
    parcelaImpressao:       share(impr, elegiveis),
    parcelaPrimeiraPosicao: share(imprTopo, elegiveisTopo),
    parcelaTopoAbsoluto:    share(imprAbsoluto, elegiveisAbsoluto),
  }
}

// ─── KPIs + COMPARATIVO ──────────────────────────────────────────────────────

async function totaisAds(customerId: string, periodo: PeriodoAds, filtro?: FiltroAds): Promise<MetricasAds> {
  const extra = filtroBq(filtro)

  return comFallback('KPIs', async () => {
    const rows = await consultarAds(customerId, `
      SELECT ${SOMA_METRICAS_BQ}
      FROM \`${viewAds('CampaignBasicStats')}\`
      WHERE customer_id = @cid AND segments_date BETWEEN @inicio AND @fim${extra.sql}
    `, { inicio: periodo.inicio, fim: periodo.fim, ...extra.params })
    return metricasDeLinhaBq(rows[0] ?? {})
  }, async () => {
    const customer = criarCustomer(customerId)
    const recurso = filtro?.campanhaId ? 'campaign' : 'customer'
    const rows: LinhaGaql[] = await customer.query(`
      SELECT ${METRICAS_GAQL}
      FROM ${recurso}
      WHERE ${gaqlWhere(periodo, filtro)}
    `)
    const mapa = new Map<string, MetricasAds>()
    for (const r of rows) acumular(mapa, 'total', metricasDeLinhaGaql(r))
    return arredondar(mapa.get('total') ?? metricasVazias())
  })
}

export async function kpisAds(
  customerId: string,
  periodo:    PeriodoAds,
  filtro?:    FiltroAds,
): Promise<KpisAds> {
  validarPeriodo(periodo)
  const [totais, impressionShare] = await Promise.all([
    totaisAds(customerId, periodo, filtro),
    impressionShareAds(customerId, periodo, filtro),
  ])
  return {
    ...totais,
    ctr:           totais.impressoes > 0 ? r2((totais.cliques / totais.impressoes) * 100) : 0,
    cpcMedio:      totais.cliques > 0 ? r2(totais.custo / totais.cliques) : 0,
    cpa:           totais.conversoes > 0 ? r2(totais.custo / totais.conversoes) : 0,
    taxaConversao: totais.cliques > 0 ? r2((totais.conversoes / totais.cliques) * 100) : 0,
    impressionShare,
  }
}

/** KPIs do período + do período imediatamente anterior (delta na UI). */
export async function kpisAdsComparativo(
  customerId: string,
  periodo:    PeriodoAds,
  filtro?:    FiltroAds,
): Promise<KpisAdsComparativo> {
  const anterior = periodoAnterior(periodo)
  const [kpisAtual, kpisAnterior] = await Promise.all([
    kpisAds(customerId, periodo, filtro),
    kpisAds(customerId, anterior, filtro),
  ])
  return { periodo, periodoAnterior: anterior, atual: kpisAtual, anterior: kpisAnterior }
}
