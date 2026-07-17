import { BigQuery } from '@google-cloud/bigquery'

// ─── BIGQUERY — histórico granular do Google Ads ─────────────────────────────
// O BigQuery Data Transfer nativo (nível MCC) despeja diariamente os relatórios
// ads_* de TODAS as contas de cliente no dataset `google_ads` — sem código de
// sync nosso. Este módulo só CONSULTA (leitura pura, service account com
// jobUser + dataViewer). Free tier: 1 TB de query/mês; nossas consultas são KB.
//
// ESTRUTURA REAL (validada em 17/07/2026 contra o dataset em produção):
// UMA view por relatório, sufixada com o ID do MCC (não por conta!), contendo
// TODAS as contas — o filtro por cliente é a coluna `customer_id`:
//   ads_Campaign_<MCC>            — atributos de campanha (nome, status)
//   ads_CampaignBasicStats_<MCC>  — métricas diárias por campanha
//   ads_Keyword_<MCC> / ads_KeywordBasicStats_<MCC>
//   (também disponíveis: SearchQueryStats, AgeRange/Gender, GeoStats,
//    HourlyCampaignStats, Placement — usados pelo Analytics 2.0)
// Regras de leitura validadas:
//   - Stats: partição espelha a data do dado (sem duplicação) → somar direto.
//   - Entidades (Campaign/Keyword): usar só o snapshot mais recente
//     (_DATA_DATE = _LATEST_DATE) para nomes/atributos atuais.

// Credencial no padrão dual-mode do projeto (google-analytics.ts/vertex-ai.ts):
// GOOGLE_APPLICATION_CREDENTIALS aceita caminho de arquivo (local) ou o JSON
// inteiro da service account (Vercel, sem filesystem).
function criarClienteBigQuery(): BigQuery {
  const cred = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? ''
  if (cred.trimStart().startsWith('{')) {
    const parsed = JSON.parse(cred) as { project_id?: string }
    return new BigQuery({ credentials: parsed, projectId: parsed.project_id })
  }
  return new BigQuery()
}

const DATASET = process.env.BIGQUERY_DATASET_ADS || 'google_ads'

/** Sufixo das views = ID do MCC (mesma env que o client Google Ads usa). */
function sufixoMcc(): string {
  const mcc = (process.env.GOOGLE_ADS_MANAGER_ID ?? '').replace(/\D/g, '')
  if (!mcc) {
    throw new Error('GOOGLE_ADS_MANAGER_ID não configurado — necessário para as views do BigQuery (ads_*_<MCC>).')
  }
  return mcc
}

/** customer_id numérico ("223-747-4942" → 2237474942) para o filtro das views. */
function cidNumero(customerId: string): number {
  const digitos = customerId.replace(/\D/g, '')
  if (!digitos) throw new Error(`Customer ID inválido: "${customerId}"`)
  return Number(digitos)
}

export type DimensaoHistorico = 'campanha' | 'dia' | 'keyword'

export interface LinhaHistorico {
  chave:       string  // nome da campanha, dia (YYYY-MM-DD) ou texto da keyword
  impressoes:  number
  cliques:     number
  custo:       number
  conversoes:  number
}

export interface TotaisPeriodo {
  impressoes: number
  cliques:    number
  custo:      number
  conversoes: number
}

/** Erro amigável quando o dataset/views do transfer ainda não existem. */
export class HistoricoIndisponivelError extends Error {
  constructor(customerId: string) {
    super(
      `Histórico BigQuery ainda não disponível para a conta ${customerId} — ` +
      'o Data Transfer ainda não criou as views do MCC (ou o dataset está errado).',
    )
    this.name = 'HistoricoIndisponivelError'
  }
}

function ehTabelaInexistente(err: unknown): boolean {
  const msg = (err as Error)?.message ?? String(err)
  return /Not found: (Table|Dataset)|was not found in location/i.test(msg)
}

// ─── HELPERS PARA OUTRAS CAMADAS (ads-detalhes.ts) ───────────────────────────

/** Nome completo da view do transfer (`dataset.ads_<Relatorio>_<MCC>`) para montar SQL. */
export function viewAds(relatorio: string): string {
  return `${DATASET}.ads_${relatorio}_${sufixoMcc()}`
}

/**
 * Executa uma query nas views do transfer com o filtro de conta já resolvido:
 * o param nomeado @cid chega pronto (customer_id numérico). Views inexistentes
 * viram HistoricoIndisponivelError (conta ainda não carregou no transfer).
 */
export async function consultarAds(
  customerId: string,
  sql:        string,
  params:     Record<string, unknown> = {},
): Promise<Array<Record<string, unknown>>> {
  const bq = criarClienteBigQuery()
  try {
    const [rows] = await bq.query({
      query:  sql,
      params: { cid: cidNumero(customerId), ...params },
      location: 'US',
    })
    return rows as Array<Record<string, unknown>>
  } catch (err) {
    if (ehTabelaInexistente(err)) throw new HistoricoIndisponivelError(customerId)
    throw err
  }
}

/**
 * Performance no período agregada pela dimensão pedida.
 *  - campanha: uma linha por campanha (ordena por custo)
 *  - dia:      uma linha por dia (série temporal)
 *  - keyword:  uma linha por keyword (ordena por cliques)
 * Conta sem linhas no período devolve [] (ex.: ainda não carregou no transfer).
 */
export async function desempenhoHistorico(
  customerId: string,
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string,
  dimensao:   DimensaoHistorico,
  limite = 50,
): Promise<LinhaHistorico[]> {
  const bq = criarClienteBigQuery()
  const mcc = sufixoMcc()
  const cid = cidNumero(customerId)

  let sql: string
  if (dimensao === 'keyword') {
    sql = `
      SELECT
        k.ad_group_criterion_keyword_text AS chave,
        SUM(s.metrics_impressions)  AS impressoes,
        SUM(s.metrics_clicks)       AS cliques,
        SUM(s.metrics_cost_micros) / 1e6 AS custo,
        SUM(s.metrics_conversions)  AS conversoes
      FROM \`${DATASET}.ads_KeywordBasicStats_${mcc}\` s
      JOIN (
        SELECT ad_group_criterion_criterion_id, ANY_VALUE(ad_group_criterion_keyword_text) AS ad_group_criterion_keyword_text
        FROM \`${DATASET}.ads_Keyword_${mcc}\`
        WHERE customer_id = @cid AND _DATA_DATE = _LATEST_DATE
        GROUP BY ad_group_criterion_criterion_id
      ) k USING (ad_group_criterion_criterion_id)
      WHERE s.customer_id = @cid AND s.segments_date BETWEEN @inicio AND @fim
      GROUP BY chave
      ORDER BY cliques DESC
      LIMIT @limite
    `
  } else if (dimensao === 'dia') {
    sql = `
      SELECT
        CAST(segments_date AS STRING)   AS chave,
        SUM(metrics_impressions)        AS impressoes,
        SUM(metrics_clicks)             AS cliques,
        SUM(metrics_cost_micros) / 1e6  AS custo,
        SUM(metrics_conversions)        AS conversoes
      FROM \`${DATASET}.ads_CampaignBasicStats_${mcc}\`
      WHERE customer_id = @cid AND segments_date BETWEEN @inicio AND @fim
      GROUP BY chave
      ORDER BY chave
      LIMIT @limite
    `
  } else {
    sql = `
      SELECT
        c.campaign_name                   AS chave,
        SUM(s.metrics_impressions)        AS impressoes,
        SUM(s.metrics_clicks)             AS cliques,
        SUM(s.metrics_cost_micros) / 1e6  AS custo,
        SUM(s.metrics_conversions)        AS conversoes
      FROM \`${DATASET}.ads_CampaignBasicStats_${mcc}\` s
      JOIN (
        SELECT campaign_id, ANY_VALUE(campaign_name) AS campaign_name
        FROM \`${DATASET}.ads_Campaign_${mcc}\`
        WHERE customer_id = @cid AND _DATA_DATE = _LATEST_DATE
        GROUP BY campaign_id
      ) c USING (campaign_id)
      WHERE s.customer_id = @cid AND s.segments_date BETWEEN @inicio AND @fim
      GROUP BY chave
      ORDER BY custo DESC
      LIMIT @limite
    `
  }

  try {
    const [rows] = await bq.query({
      query: sql,
      params: { cid, inicio: dataInicio, fim: dataFim, limite },
      location: 'US',
    })
    return (rows as Array<Record<string, unknown>>).map((r) => ({
      chave:      String(r.chave ?? ''),
      impressoes: Number(r.impressoes ?? 0),
      cliques:    Number(r.cliques ?? 0),
      custo:      Math.round(Number(r.custo ?? 0) * 100) / 100,
      conversoes: Math.round(Number(r.conversoes ?? 0) * 100) / 100,
    }))
  } catch (err) {
    if (ehTabelaInexistente(err)) throw new HistoricoIndisponivelError(customerId)
    throw err
  }
}

/** Totais do período (para comparativos período vs período). */
export async function totaisPeriodo(
  customerId: string,
  dataInicio: string,
  dataFim:    string,
): Promise<TotaisPeriodo> {
  const bq = criarClienteBigQuery()
  const mcc = sufixoMcc()
  const cid = cidNumero(customerId)
  const sql = `
    SELECT
      SUM(metrics_impressions)        AS impressoes,
      SUM(metrics_clicks)             AS cliques,
      SUM(metrics_cost_micros) / 1e6  AS custo,
      SUM(metrics_conversions)        AS conversoes
    FROM \`${DATASET}.ads_CampaignBasicStats_${mcc}\`
    WHERE customer_id = @cid AND segments_date BETWEEN @inicio AND @fim
  `
  try {
    const [rows] = await bq.query({
      query: sql,
      params: { cid, inicio: dataInicio, fim: dataFim },
      location: 'US',
    })
    const r = (rows[0] ?? {}) as Record<string, unknown>
    return {
      impressoes: Number(r.impressoes ?? 0),
      cliques:    Number(r.cliques ?? 0),
      custo:      Math.round(Number(r.custo ?? 0) * 100) / 100,
      conversoes: Math.round(Number(r.conversoes ?? 0) * 100) / 100,
    }
  } catch (err) {
    if (ehTabelaInexistente(err)) throw new HistoricoIndisponivelError(customerId)
    throw err
  }
}

/** Contas (CIDs) com dados carregados no dataset + intervalo — diagnóstico. */
export async function contasDisponiveis(): Promise<string[]> {
  const bq = criarClienteBigQuery()
  const mcc = sufixoMcc()
  const sql = `
    SELECT CAST(customer_id AS STRING) AS cid
    FROM \`${DATASET}.ads_CampaignBasicStats_${mcc}\`
    GROUP BY cid
    ORDER BY cid
  `
  try {
    const [rows] = await bq.query({ query: sql, location: 'US' })
    return (rows as Array<{ cid: string }>).map((r) => r.cid)
  } catch (err) {
    if (ehTabelaInexistente(err)) return []
    throw err
  }
}
