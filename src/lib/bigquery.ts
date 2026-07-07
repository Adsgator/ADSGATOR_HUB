import { BigQuery } from '@google-cloud/bigquery'

// ─── BIGQUERY — histórico granular do Google Ads ─────────────────────────────
// O BigQuery Data Transfer nativo (nível MCC) despeja diariamente as tabelas
// ads_* de TODAS as contas de cliente no dataset `google_ads` — sem código de
// sync nosso. Este módulo só CONSULTA (leitura pura, service account com
// jobUser + dataViewer). Free tier: 1 TB de query/mês; nossas consultas são KB.
//
// Tabelas por conta (sufixo = customer ID sem hífens):
//   ads_Campaign_<CID>            — atributos de campanha (nome, status)
//   ads_CampaignBasicStats_<CID>  — métricas diárias por campanha
//   ads_Keyword_<CID>             — atributos de keyword
//   ads_KeywordBasicStats_<CID>   — métricas diárias por keyword

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

/** Sufixo de tabela: customer ID só dígitos ("223-747-4942" → "2237474942"). */
function cid(customerId: string): string {
  return customerId.replace(/\D/g, '')
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

/** Erro amigável quando a tabela da conta ainda não existe no dataset. */
export class HistoricoIndisponivelError extends Error {
  constructor(customerId: string) {
    super(
      `Histórico BigQuery ainda não disponível para a conta ${customerId} — ` +
      'a transferência diária ainda não carregou essa conta (ou o backfill está em andamento).',
    )
    this.name = 'HistoricoIndisponivelError'
  }
}

function ehTabelaInexistente(err: unknown): boolean {
  const msg = (err as Error)?.message ?? String(err)
  return /Not found: Table|was not found in location/i.test(msg)
}

/**
 * Performance no período agregada pela dimensão pedida.
 *  - campanha: uma linha por campanha (ordena por custo)
 *  - dia:      uma linha por dia (série temporal)
 *  - keyword:  uma linha por keyword (ordena por cliques)
 */
export async function desempenhoHistorico(
  customerId: string,
  dataInicio: string, // YYYY-MM-DD
  dataFim:    string,
  dimensao:   DimensaoHistorico,
  limite = 50,
): Promise<LinhaHistorico[]> {
  const bq = criarClienteBigQuery()
  const sufixo = cid(customerId)

  let sql: string
  if (dimensao === 'keyword') {
    sql = `
      SELECT
        k.ad_group_criterion_keyword_text AS chave,
        SUM(s.metrics_impressions)  AS impressoes,
        SUM(s.metrics_clicks)       AS cliques,
        SUM(s.metrics_cost_micros) / 1e6 AS custo,
        SUM(s.metrics_conversions)  AS conversoes
      FROM \`${DATASET}.ads_KeywordBasicStats_${sufixo}\` s
      JOIN (
        SELECT ad_group_criterion_criterion_id, ANY_VALUE(ad_group_criterion_keyword_text) AS ad_group_criterion_keyword_text
        FROM \`${DATASET}.ads_Keyword_${sufixo}\`
        GROUP BY ad_group_criterion_criterion_id
      ) k USING (ad_group_criterion_criterion_id)
      WHERE s.segments_date BETWEEN @inicio AND @fim
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
      FROM \`${DATASET}.ads_CampaignBasicStats_${sufixo}\`
      WHERE segments_date BETWEEN @inicio AND @fim
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
      FROM \`${DATASET}.ads_CampaignBasicStats_${sufixo}\` s
      JOIN (
        SELECT campaign_id, ANY_VALUE(campaign_name) AS campaign_name
        FROM \`${DATASET}.ads_Campaign_${sufixo}\`
        GROUP BY campaign_id
      ) c USING (campaign_id)
      WHERE s.segments_date BETWEEN @inicio AND @fim
      GROUP BY chave
      ORDER BY custo DESC
      LIMIT @limite
    `
  }

  try {
    const [rows] = await bq.query({
      query: sql,
      params: { inicio: dataInicio, fim: dataFim, limite },
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
  const sufixo = cid(customerId)
  const sql = `
    SELECT
      SUM(metrics_impressions)        AS impressoes,
      SUM(metrics_clicks)             AS cliques,
      SUM(metrics_cost_micros) / 1e6  AS custo,
      SUM(metrics_conversions)        AS conversoes
    FROM \`${DATASET}.ads_CampaignBasicStats_${sufixo}\`
    WHERE segments_date BETWEEN @inicio AND @fim
  `
  try {
    const [rows] = await bq.query({
      query: sql,
      params: { inicio: dataInicio, fim: dataFim },
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

/** Lista as contas (CIDs) que já têm tabelas no dataset — diagnóstico. */
export async function contasDisponiveis(): Promise<string[]> {
  const bq = criarClienteBigQuery()
  const [tables] = await bq.dataset(DATASET).getTables()
  const cids = new Set<string>()
  for (const t of tables) {
    const m = /^ads_CampaignBasicStats_(\d+)$/.exec(t.id ?? '')
    if (m) cids.add(m[1])
  }
  return Array.from(cids)
}
