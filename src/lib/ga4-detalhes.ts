import { criarClienteGA4, clampFim } from './google-analytics'
import { Periodo, validarPeriodo, periodoAnterior } from './analytics-periodo'

// ─── ANALYTICS 2.0 (F2) — cortes detalhados do GA4 ───────────────────────────
// Camada de dados do dashboard Site (interno e portal): KPIs com comparativo,
// páginas, aquisição origem/mídia, dispositivos, novo×recorrente, eventos,
// hora do dia, SO/resolução e geografia — por propriedade e período flexível.
//
// Regras herdadas (não regredir):
//   - TODA dateRange passa por clampFim (fim no futuro quebra com
//     "Future currency exchange rate not exist" quando há conversão de moeda).
//   - Falha de API LANÇA — nunca devolver zeros como se fossem dado.
// O cache/TTL fica na fase F3 (tabela analytics_detalhes) — aqui é só leitura,
// uma chamada runReport por corte (KPIs comparam 2 períodos em UMA chamada).

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface KpisGA4 {
  visualizacoes:      number
  usuariosNovos:      number
  usuariosAtivos:     number
  sessoes:            number
  duracaoMediaSessao: number // segundos
  eventosPorSessao:   number
  usuariosScrollFim:  number // usuários que rolaram ≥90% da página
  taxaEngajamento:    number // %
  taxaRejeicao:       number // %
}

export interface KpisGA4Comparativo {
  periodo:         Periodo
  periodoAnterior: Periodo
  atual:           KpisGA4
  anterior:        KpisGA4
}

export interface LinhaDiaGA4 { data: string; sessoes: number; usuarios: number }

export interface LinhaPaginaGA4 {
  pagina:             string
  visualizacoes:      number
  usuarios:           number
  usuariosNovos:      number
  sessoes:            number
  taxaEngajamento:    number // %
  taxaRejeicao:       number // %
  duracaoMediaSessao: number // segundos
}

export interface LinhaOrigemGA4 {
  fonte:              string
  midia:              string
  visualizacoes:      number
  usuarios:           number
  usuariosNovos:      number
  sessoes:            number
  taxaEngajamento:    number // %
  taxaRejeicao:       number // %
  duracaoMediaSessao: number // segundos
  /** Extras não presentes no Looker — métrica de negócio real, mantida
   *  (mesmo precedente do Ads com CPC médio/Cliques por conversão). */
  conversoes:         number
  taxaConversao:      number // %
}

export interface LinhaDispositivoGA4 {
  dispositivo:        string // mobile | desktop | tablet…
  visualizacoes:      number
  usuarios:           number
  usuariosNovos:      number
  sessoes:            number
  taxaEngajamento:    number // %
  taxaRejeicao:       number // %
  duracaoMediaSessao: number // segundos
}

export interface LinhaTipoUsuarioGA4 {
  tipo:               string // new | returning | (not set)
  visualizacoes:      number
  usuarios:           number
  usuariosNovos:      number
  sessoes:            number
  taxaEngajamento:    number // %
  taxaRejeicao:       number // %
  duracaoMediaSessao: number // segundos
  conversoes:         number
}

export interface LinhaEventoGA4 {
  evento:   string
  contagem: number
  usuarios: number
}

export interface LinhaHoraGA4 {
  hora:               number // 0–23
  visualizacoes:      number
  usuariosNovos:      number
  sessoes:            number
  duracaoMediaSessao: number // segundos
  taxaEngajamento:    number // %
  taxaRejeicao:       number // %
}

export interface LinhaSistemaGA4 {
  sistema:  string
  versao:   string
  sessoes:  number
  usuarios: number
}

export interface LinhaResolucaoGA4 {
  resolucao: string
  sessoes:   number
  usuarios:  number
}

export interface LinhaNavegadorGA4 {
  navegador:          string
  visualizacoes:      number
  usuarios:           number
  usuariosNovos:      number
  sessoes:            number
  taxaEngajamento:    number // %
  taxaRejeicao:       number // %
  duracaoMediaSessao: number // segundos
}

/** Dispositivo + modelo + marca — só as 4 métricas que o Looker mostra aqui
 *  (sem %engajamento/%rejeição, diferente das outras quebras). */
export interface LinhaDispositivoDetalhadoGA4 {
  dispositivo:        string
  modelo:             string
  marca:              string
  visualizacoes:      number
  usuariosNovos:      number
  sessoes:            number
  duracaoMediaSessao: number // segundos
}

export interface TecnologiaGA4 {
  sistemas:            LinhaSistemaGA4[]
  resolucoes:          LinhaResolucaoGA4[]
  navegadores:         LinhaNavegadorGA4[]
  dispositivosDetalhe: LinhaDispositivoDetalhadoGA4[]
}

/** Uma linha genérica de quebra geográfica (Cidade OU Estado OU País —
 *  nunca misturados, ver docs/DASHBOARD_GA4_SPEC.md). */
export interface LinhaGeoGA4 {
  local:              string
  visualizacoes:      number
  usuarios:           number
  usuariosNovos:      number
  sessoes:            number
  taxaEngajamento:    number // %
  taxaRejeicao:       number // %
  duracaoMediaSessao: number // segundos
}

export interface GeografiaGA4 {
  cidades: LinhaGeoGA4[]
  estados: LinhaGeoGA4[]
  paises:  LinhaGeoGA4[]
}

// ─── HELPERS INTERNOS ────────────────────────────────────────────────────────

const r2 = (n: number) => Math.round(n * 100) / 100
const num = (v?: string | null) => parseFloat(v ?? '0') || 0
const pct = (v?: string | null) => r2(num(v) * 100)

interface LinhaRelatorio {
  dimensionValues?: Array<{ value?: string | null }>
  metricValues?:    Array<{ value?: string | null }>
}

/** runReport com clampFim aplicado a todo período. Erros LANÇAM. */
async function rodarRelatorio(
  propertyId: string,
  periodos:   Periodo[],
  dimensoes:  string[],
  metricas:   string[],
  opcoes?:    { limite?: number; ordenarPor?: string },
): Promise<LinhaRelatorio[]> {
  const client = criarClienteGA4()
  const [response] = await client.runReport({
    property:   `properties/${propertyId}`,
    dateRanges: periodos.map((p, i) => ({ startDate: p.inicio, endDate: clampFim(p.fim), name: `p${i}` })),
    dimensions: dimensoes.map((name) => ({ name })),
    metrics:    metricas.map((name) => ({ name })),
    ...(opcoes?.ordenarPor ? { orderBys: [{ metric: { metricName: opcoes.ordenarPor }, desc: true }] } : {}),
    ...(opcoes?.limite ? { limit: opcoes.limite } : {}),
  })
  return (response?.rows ?? []) as LinhaRelatorio[]
}

const dim = (r: LinhaRelatorio, i: number) => r.dimensionValues?.[i]?.value ?? ''
const met = (r: LinhaRelatorio, i: number) => num(r.metricValues?.[i]?.value)
const metPct = (r: LinhaRelatorio, i: number) => pct(r.metricValues?.[i]?.value)

// ─── KPIs + COMPARATIVO ──────────────────────────────────────────────────────

const METRICAS_KPI = [
  'screenPageViews', 'newUsers', 'activeUsers', 'sessions', 'averageSessionDuration',
  'eventsPerSession', 'scrolledUsers', 'engagementRate', 'bounceRate',
]

function kpisDeLinha(r?: LinhaRelatorio): KpisGA4 {
  const v = (i: number) => (r ? met(r, i) : 0)
  return {
    visualizacoes:      v(0),
    usuariosNovos:      v(1),
    usuariosAtivos:     v(2),
    sessoes:            v(3),
    duracaoMediaSessao: r2(v(4)),
    eventosPorSessao:   r2(v(5)),
    usuariosScrollFim:  v(6),
    taxaEngajamento:    r2(v(7) * 100),
    taxaRejeicao:       r2(v(8) * 100),
  }
}

/** KPIs do período + anterior em UMA chamada (duas dateRanges no runReport). */
export async function kpisGA4Comparativo(
  propertyId: string,
  periodo:    Periodo,
): Promise<KpisGA4Comparativo> {
  validarPeriodo(periodo)
  const anterior = periodoAnterior(periodo)
  const rows = await rodarRelatorio(propertyId, [periodo, anterior], [], METRICAS_KPI)
  // Com 2 períodos a API adiciona a dimensão dateRange (valor = name passado)
  const porPeriodo = new Map(rows.map((r) => [dim(r, 0), r]))
  return {
    periodo,
    periodoAnterior: anterior,
    atual:    kpisDeLinha(porPeriodo.get('p0')),
    anterior: kpisDeLinha(porPeriodo.get('p1')),
  }
}

/** Série diária (sessões + usuários ativos) — mini-tendência da Visão geral. */
export async function serieDiariaGA4(
  propertyId: string,
  periodo:    Periodo,
): Promise<LinhaDiaGA4[]> {
  validarPeriodo(periodo)
  const rows = await rodarRelatorio(propertyId, [periodo], ['date'], ['sessions', 'activeUsers'])
  return rows
    .map((r) => {
      const d = dim(r, 0) // GA4 devolve YYYYMMDD
      const data = /^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d
      return { data, sessoes: met(r, 0), usuarios: met(r, 1) }
    })
    .sort((a, b) => a.data.localeCompare(b.data))
}

// ─── PÁGINAS ─────────────────────────────────────────────────────────────────
// pagePath já vem SEM query string (o fbclid que poluía o Looker fica de fora);
// normalizamos também a barra final para não duplicar /contato e /contato/.
// Taxas e duração são médias — ao fundir caminhos, pondera por sessões.

function normalizarCaminho(caminho: string): string {
  const semSufixo = caminho.split(/[?#]/)[0] || '/'
  if (semSufixo.length > 1 && semSufixo.endsWith('/')) return semSufixo.slice(0, -1)
  return semSufixo
}

export async function paginasGA4(
  propertyId: string,
  periodo:    Periodo,
  limite = 50,
): Promise<LinhaPaginaGA4[]> {
  validarPeriodo(periodo)
  const rows = await rodarRelatorio(
    propertyId, [periodo], ['pagePath'],
    ['screenPageViews', 'activeUsers', 'newUsers', 'sessions', 'engagementRate', 'bounceRate', 'averageSessionDuration'],
    { ordenarPor: 'screenPageViews', limite: limite * 2 }, // margem p/ fusão pós-normalização
  )

  const mapa = new Map<string, LinhaPaginaGA4>()
  for (const r of rows) {
    const pagina = normalizarCaminho(dim(r, 0))
    const linha: LinhaPaginaGA4 = {
      pagina,
      visualizacoes:      met(r, 0),
      usuarios:           met(r, 1),
      usuariosNovos:      met(r, 2),
      sessoes:            met(r, 3),
      taxaEngajamento:    metPct(r, 4),
      taxaRejeicao:       metPct(r, 5),
      duracaoMediaSessao: r2(met(r, 6)),
    }
    const atual = mapa.get(pagina)
    if (!atual) {
      mapa.set(pagina, linha)
      continue
    }
    const pesoTotal = atual.sessoes + linha.sessoes
    const media = (a: number, b: number) =>
      pesoTotal > 0 ? r2((a * atual.sessoes + b * linha.sessoes) / pesoTotal) : 0
    atual.taxaEngajamento    = media(atual.taxaEngajamento, linha.taxaEngajamento)
    atual.taxaRejeicao       = media(atual.taxaRejeicao, linha.taxaRejeicao)
    atual.duracaoMediaSessao = media(atual.duracaoMediaSessao, linha.duracaoMediaSessao)
    atual.visualizacoes += linha.visualizacoes
    atual.usuarios      += linha.usuarios
    atual.usuariosNovos += linha.usuariosNovos
    atual.sessoes       += linha.sessoes
  }

  return Array.from(mapa.values())
    .sort((a, b) => b.visualizacoes - a.visualizacoes)
    .slice(0, limite)
}

/** Caminho + query string (fbclid/UTM etc.), SEM normalizar nem fundir —
 *  granularidade mais fina que `paginasGA4`, útil pra rastrear link exato. */
export async function paginasRawGA4(
  propertyId: string,
  periodo:    Periodo,
  limite = 50,
): Promise<LinhaPaginaGA4[]> {
  validarPeriodo(periodo)
  const rows = await rodarRelatorio(
    propertyId, [periodo], ['pagePathPlusQueryString'],
    ['screenPageViews', 'activeUsers', 'newUsers', 'sessions', 'engagementRate', 'bounceRate', 'averageSessionDuration'],
    { ordenarPor: 'screenPageViews', limite },
  )
  return rows.map((r) => ({
    pagina:             dim(r, 0) || '/',
    visualizacoes:      met(r, 0),
    usuarios:           met(r, 1),
    usuariosNovos:      met(r, 2),
    sessoes:            met(r, 3),
    taxaEngajamento:    metPct(r, 4),
    taxaRejeicao:       metPct(r, 5),
    duracaoMediaSessao: r2(met(r, 6)),
  }))
}

// ─── AQUISIÇÃO (ORIGEM / MÍDIA) ──────────────────────────────────────────────
// 6 métricas padrão (ver spec) + conversões/taxa de conversão como extra.

export async function aquisicaoGA4(
  propertyId: string,
  periodo:    Periodo,
  limite = 20,
): Promise<LinhaOrigemGA4[]> {
  validarPeriodo(periodo)
  const rows = await rodarRelatorio(
    propertyId, [periodo], ['sessionSource', 'sessionMedium'],
    ['screenPageViews', 'activeUsers', 'newUsers', 'sessions', 'conversions', 'engagementRate', 'bounceRate', 'averageSessionDuration'],
    { ordenarPor: 'sessions', limite },
  )
  return rows.map((r) => {
    const sessoes = met(r, 3)
    const conversoes = met(r, 4)
    return {
      fonte:              dim(r, 0) || '(direct)',
      midia:              dim(r, 1) || '(none)',
      visualizacoes:      met(r, 0),
      usuarios:           met(r, 1),
      usuariosNovos:      met(r, 2),
      sessoes,
      taxaEngajamento:    metPct(r, 5),
      taxaRejeicao:       metPct(r, 6),
      duracaoMediaSessao: r2(met(r, 7)),
      conversoes:         r2(conversoes),
      taxaConversao:      sessoes > 0 ? r2((conversoes / sessoes) * 100) : 0,
    }
  })
}

// ─── DISPOSITIVOS ────────────────────────────────────────────────────────────

export async function dispositivosGA4(
  propertyId: string,
  periodo:    Periodo,
): Promise<LinhaDispositivoGA4[]> {
  validarPeriodo(periodo)
  const rows = await rodarRelatorio(
    propertyId, [periodo], ['deviceCategory'],
    ['screenPageViews', 'activeUsers', 'newUsers', 'sessions', 'engagementRate', 'bounceRate', 'averageSessionDuration'],
    { ordenarPor: 'sessions' },
  )
  return rows.map((r) => ({
    dispositivo:        dim(r, 0),
    visualizacoes:      met(r, 0),
    usuarios:           met(r, 1),
    usuariosNovos:      met(r, 2),
    sessoes:            met(r, 3),
    taxaEngajamento:    metPct(r, 4),
    taxaRejeicao:       metPct(r, 5),
    duracaoMediaSessao: r2(met(r, 6)),
  }))
}

// ─── NOVO × RECORRENTE ───────────────────────────────────────────────────────

export async function novoVsRecorrenteGA4(
  propertyId: string,
  periodo:    Periodo,
): Promise<LinhaTipoUsuarioGA4[]> {
  validarPeriodo(periodo)
  const rows = await rodarRelatorio(
    propertyId, [periodo], ['newVsReturning'],
    ['screenPageViews', 'activeUsers', 'newUsers', 'sessions', 'conversions', 'engagementRate', 'bounceRate', 'averageSessionDuration'],
    { ordenarPor: 'activeUsers' },
  )
  return rows.map((r) => ({
    tipo:               dim(r, 0) || '(not set)',
    visualizacoes:      met(r, 0),
    usuarios:           met(r, 1),
    usuariosNovos:      met(r, 2),
    sessoes:            met(r, 3),
    taxaEngajamento:    metPct(r, 5),
    taxaRejeicao:       metPct(r, 6),
    duracaoMediaSessao: r2(met(r, 7)),
    conversoes:         r2(met(r, 4)),
  }))
}

// ─── EVENTOS ─────────────────────────────────────────────────────────────────

export async function eventosGA4(
  propertyId: string,
  periodo:    Periodo,
  limite = 30,
): Promise<LinhaEventoGA4[]> {
  validarPeriodo(periodo)
  const rows = await rodarRelatorio(
    propertyId, [periodo], ['eventName'],
    ['eventCount', 'activeUsers'],
    { ordenarPor: 'eventCount', limite },
  )
  return rows.map((r) => ({
    evento:   dim(r, 0),
    contagem: met(r, 0),
    usuarios: met(r, 1),
  }))
}

// ─── HORA DO DIA ─────────────────────────────────────────────────────────────
// Cobre as três séries por hora do Looker (acessos, duração média,
// engajamento × rejeição) em uma chamada. Sempre 24 linhas (0–23).

export async function horariosGA4(
  propertyId: string,
  periodo:    Periodo,
): Promise<LinhaHoraGA4[]> {
  validarPeriodo(periodo)
  const rows = await rodarRelatorio(
    propertyId, [periodo], ['hour'],
    ['sessions', 'screenPageViews', 'newUsers', 'averageSessionDuration', 'engagementRate', 'bounceRate'],
  )
  const porHora = new Map<number, LinhaHoraGA4>()
  for (const r of rows) {
    const valor = dim(r, 0)
    if (!/^\d+$/.test(valor)) continue // "(not set)"
    const hora = Number(valor)
    porHora.set(hora, {
      hora,
      visualizacoes:      met(r, 1),
      usuariosNovos:      met(r, 2),
      sessoes:            met(r, 0),
      duracaoMediaSessao: r2(met(r, 3)),
      taxaEngajamento:    metPct(r, 4),
      taxaRejeicao:       metPct(r, 5),
    })
  }
  return Array.from({ length: 24 }, (_, hora) => porHora.get(hora) ?? {
    hora, visualizacoes: 0, usuariosNovos: 0, sessoes: 0, duracaoMediaSessao: 0, taxaEngajamento: 0, taxaRejeicao: 0,
  })
}

// ─── TECNOLOGIA (SO + RESOLUÇÃO + NAVEGADOR + DISPOSITIVO DETALHADO) ─────────

export async function tecnologiaGA4(
  propertyId: string,
  periodo:    Periodo,
  limite = 20,
): Promise<TecnologiaGA4> {
  validarPeriodo(periodo)
  const [sistemas, resolucoes, navegadores, dispositivosDetalhe] = await Promise.all([
    rodarRelatorio(
      propertyId, [periodo], ['operatingSystem', 'operatingSystemVersion'],
      ['sessions', 'activeUsers'],
      { ordenarPor: 'sessions', limite },
    ),
    rodarRelatorio(
      propertyId, [periodo], ['screenResolution'],
      ['sessions', 'activeUsers'],
      { ordenarPor: 'sessions', limite },
    ),
    rodarRelatorio(
      propertyId, [periodo], ['browser'],
      ['screenPageViews', 'activeUsers', 'newUsers', 'sessions', 'engagementRate', 'bounceRate', 'averageSessionDuration'],
      { ordenarPor: 'sessions', limite },
    ),
    rodarRelatorio(
      propertyId, [periodo], ['deviceCategory', 'mobileDeviceModel', 'mobileDeviceBranding'],
      ['screenPageViews', 'newUsers', 'sessions', 'averageSessionDuration'],
      { ordenarPor: 'sessions', limite },
    ),
  ])
  return {
    sistemas: sistemas.map((r) => ({
      sistema:  dim(r, 0),
      versao:   dim(r, 1),
      sessoes:  met(r, 0),
      usuarios: met(r, 1),
    })),
    resolucoes: resolucoes.map((r) => ({
      resolucao: dim(r, 0),
      sessoes:   met(r, 0),
      usuarios:  met(r, 1),
    })),
    navegadores: navegadores.map((r) => ({
      navegador:          dim(r, 0),
      visualizacoes:      met(r, 0),
      usuarios:           met(r, 1),
      usuariosNovos:      met(r, 2),
      sessoes:            met(r, 3),
      taxaEngajamento:    metPct(r, 4),
      taxaRejeicao:       metPct(r, 5),
      duracaoMediaSessao: r2(met(r, 6)),
    })),
    dispositivosDetalhe: dispositivosDetalhe.map((r) => ({
      dispositivo:        dim(r, 0),
      modelo:             dim(r, 1),
      marca:              dim(r, 2),
      visualizacoes:      met(r, 0),
      usuariosNovos:      met(r, 1),
      sessoes:            met(r, 2),
      duracaoMediaSessao: r2(met(r, 3)),
    })),
  }
}

// ─── GEOGRAFIA (CIDADE / ESTADO / PAÍS — 3 tabelas separadas) ────────────────
// No Looker esta seção vivia dando "erro de cota" — aqui são 3 chamadas em
// paralelo, cacheadas na F3. Nunca misturar granularidade numa linha só
// (mesma decisão do dashboard de Ads) — cada dimensão isolada tem sua
// própria contagem de sessões/usuários (não são a mesma população cortada
// 3 vezes: são 3 agregações independentes).

async function quebraGeoGA4(propertyId: string, periodo: Periodo, dimensao: string, limite: number): Promise<LinhaGeoGA4[]> {
  const rows = await rodarRelatorio(
    propertyId, [periodo], [dimensao],
    ['screenPageViews', 'activeUsers', 'newUsers', 'sessions', 'engagementRate', 'bounceRate', 'averageSessionDuration'],
    { ordenarPor: 'sessions', limite },
  )
  return rows.map((r) => ({
    local:              dim(r, 0) || '(não informado)',
    visualizacoes:      met(r, 0),
    usuarios:           met(r, 1),
    usuariosNovos:      met(r, 2),
    sessoes:            met(r, 3),
    taxaEngajamento:    metPct(r, 4),
    taxaRejeicao:       metPct(r, 5),
    duracaoMediaSessao: r2(met(r, 6)),
  }))
}

export async function geografiaGA4(
  propertyId: string,
  periodo:    Periodo,
  limite = 50,
): Promise<GeografiaGA4> {
  validarPeriodo(periodo)
  const [cidades, estados, paises] = await Promise.all([
    quebraGeoGA4(propertyId, periodo, 'city', limite),
    quebraGeoGA4(propertyId, periodo, 'region', limite),
    quebraGeoGA4(propertyId, periodo, 'country', limite),
  ])
  return { cidades, estados, paises }
}
