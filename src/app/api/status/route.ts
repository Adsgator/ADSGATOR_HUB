import { NextResponse } from 'next/server'
import { readFile }     from 'fs/promises'
import path             from 'path'

type StatusResult = { status: 'ok' | 'warn' | 'error' | 'not_configured'; message: string }

export async function GET() {
  const results = await Promise.allSettled([
    checkGoogleAds(),
    checkAsaas(),
    checkVertexAI(),
    checkGA4(),
  ])

  const [googleAds, asaas, vertexAI, ga4] = results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : { status: 'error', message: String((r as PromiseRejectedResult).reason) }
  )

  return NextResponse.json({ googleAds, asaas, vertexAI, ga4 })
}

// ── Google Ads ────────────────────────────────────────────────────────────────
// Valida o refresh token via OAuth e depois confirma acesso à API do Google Ads
// com o developer token. Um token OAuth válido sozinho não garante acesso ao Ads.
async function checkGoogleAds(): Promise<{ status: 'ok' | 'warn' | 'error' | 'not_configured'; message: string }> {
  const clientId      = process.env.GOOGLE_ADS_CLIENT_ID
  const clientSecret  = process.env.GOOGLE_ADS_CLIENT_SECRET
  const refreshToken  = process.env.GOOGLE_ADS_REFRESH_TOKEN
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  const managerId    = process.env.GOOGLE_ADS_MANAGER_ID

  const missing = [
    !clientId      && 'GOOGLE_ADS_CLIENT_ID',
    !clientSecret  && 'GOOGLE_ADS_CLIENT_SECRET',
    !refreshToken  && 'GOOGLE_ADS_REFRESH_TOKEN',
    !developerToken && 'GOOGLE_ADS_DEVELOPER_TOKEN',
    !managerId     && 'GOOGLE_ADS_MANAGER_ID',
  ].filter(Boolean)

  if (missing.length > 0) {
    return { status: 'not_configured', message: `Variáveis ausentes: ${missing.join(', ')}` }
  }

  // Passo 1: obter access token
  let accessToken: string
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     clientId!,
        client_secret: clientSecret!,
        refresh_token: refreshToken!,
        grant_type:    'refresh_token',
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!tokenRes.ok) {
      const body = await tokenRes.json().catch(() => ({}))
      const detail = body?.error_description || body?.error || tokenRes.statusText
      // 400 invalid_grant = refresh token revogado ou expirado
      if (tokenRes.status === 400 && body?.error === 'invalid_grant') {
        return { status: 'warn', message: 'Refresh token revogado — reautentique o OAuth' }
      }
      return { status: 'warn', message: `OAuth falhou: ${detail}` }
    }

    const tokenBody = await tokenRes.json()
    accessToken = tokenBody.access_token
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('timeout') || msg.includes('abort')) {
      return { status: 'error', message: 'Timeout ao contatar OAuth Google' }
    }
    return { status: 'error', message: `Sem conexão com Google: ${msg}` }
  }

  // Passo 2: confirmar acesso real à API do Google Ads com o developer token.
  // Query GAQL mínima via googleAds:search — valida developer token, permissão
  // na conta e versão da API de uma vez (listAccessibleCustomers retorna 200
  // mesmo com developer token básico/inválido).
  try {
    const adsRes = await fetch(
      `https://googleads.googleapis.com/v19/customers/${managerId!.replace(/-/g, '')}/googleAds:search`,
      {
        method: 'POST',
        headers: {
          Authorization:       `Bearer ${accessToken}`,
          'developer-token':   developerToken!,
          'login-customer-id': managerId!.replace(/-/g, ''),
          'Content-Type':      'application/json',
        },
        body: JSON.stringify({ query: 'SELECT customer.id FROM customer LIMIT 1' }),
        signal: AbortSignal.timeout(8000),
      }
    )

    if (adsRes.ok) {
      return { status: 'ok', message: 'Google Ads autenticado — developer token e acesso confirmados' }
    }

    const body = await adsRes.json().catch(() => ({}))
    // Erros da Google Ads API ficam em body.error.details[].errors[].errorCode
    const detail =
      body?.error?.details?.[0]?.errors?.[0]?.message ||
      body?.error?.message ||
      body?.error?.status ||
      adsRes.statusText

    if (adsRes.status === 401) {
      return { status: 'warn', message: 'Access token sem permissão para o Google Ads' }
    }
    if (adsRes.status === 403) {
      // 403 pode ser developer token não aprovado ou sem permissão na conta
      const isDeveloperToken = detail.toLowerCase().includes('developer token')
      return {
        status: 'warn',
        message: isDeveloperToken
          ? `Developer token sem permissão de produção: ${detail}`
          : `Acesso negado ao Google Ads: ${detail}`,
      }
    }
    if (adsRes.status === 429) {
      return { status: 'warn', message: 'Rate limit Google Ads — tente novamente em instantes' }
    }
    if (adsRes.status >= 500) {
      return { status: 'warn', message: `Google Ads com instabilidade (HTTP ${adsRes.status})` }
    }

    return { status: 'warn', message: `Resposta inesperada: HTTP ${adsRes.status} — ${detail}` }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('timeout') || msg.includes('abort')) {
      return { status: 'error', message: 'Timeout ao contatar API do Google Ads' }
    }
    return { status: 'error', message: `Sem conexão com Google Ads: ${msg}` }
  }
}

// ── Asaas ─────────────────────────────────────────────────────────────────────
// Detecta automaticamente ambiente prod vs sandbox pela chave e bate no endpoint correto.
async function checkAsaas(): Promise<{ status: 'ok' | 'warn' | 'error' | 'not_configured'; message: string }> {
  const apiKey = process.env.ASAAS_API_KEY

  if (!apiKey) {
    return { status: 'not_configured', message: 'Variável ASAAS_API_KEY ausente' }
  }

  // Chaves de produção começam com $aact_prod_, sandbox com $aact_test_ ou $aact_YT_
  const isSandbox = !apiKey.startsWith('$aact_prod_')
  const baseUrl = isSandbox ? 'https://sandbox.asaas.com' : 'https://api.asaas.com'
  const env = isSandbox ? 'sandbox' : 'produção'

  try {
    const res = await fetch(`${baseUrl}/v3/customers?limit=1`, {
      headers: { access_token: apiKey },
      signal: AbortSignal.timeout(8000),
    })

    if (res.ok) {
      return { status: 'ok', message: `API Asaas (${env}) respondendo normalmente` }
    }

    if (res.status === 401 || res.status === 403) {
      return { status: 'warn', message: `Chave inválida ou sem permissão (${env})` }
    }
    if (res.status === 429) {
      return { status: 'warn', message: 'Rate limit Asaas — aguarde alguns segundos' }
    }
    if (res.status >= 500) {
      return { status: 'warn', message: `Asaas com instabilidade (HTTP ${res.status}) — problema no lado deles` }
    }

    return { status: 'warn', message: `Asaas respondeu HTTP ${res.status}` }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('timeout') || msg.includes('abort')) {
      return { status: 'error', message: `Timeout ao contatar Asaas (${env})` }
    }
    return { status: 'error', message: `Sem conexão com Asaas: ${msg}` }
  }
}

// ── Helper: troca service account JSON por access token OAuth2 ────────────────
interface ServiceAccount {
  client_email: string
  private_key:  string
  token_uri?:   string
}

async function getServiceAccountToken(credPathOrJson: string, scope: string): Promise<string> {
  let raw: string
  if (credPathOrJson.trimStart().startsWith('{')) {
    raw = credPathOrJson
  } else {
    const absPath = path.resolve(process.cwd(), credPathOrJson)
    raw = await readFile(absPath, 'utf-8')
  }
  const sa: ServiceAccount = JSON.parse(raw)

  const now = Math.floor(Date.now() / 1000)
  const header  = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: sa.client_email,
    scope,
    aud: sa.token_uri ?? 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url')

  const unsigned = `${encode(header)}.${encode(payload)}`

  // Importar chave RSA e assinar
  const keyData = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')

  const binaryKey = Buffer.from(keyData, 'base64')
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    Buffer.from(unsigned),
  )

  const jwt = `${unsigned}.${Buffer.from(signature).toString('base64url')}`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  jwt,
    }),
    signal: AbortSignal.timeout(8000),
  })

  if (!tokenRes.ok) {
    const body = await tokenRes.json().catch(() => ({}))
    throw new Error(body?.error_description || body?.error || `HTTP ${tokenRes.status}`)
  }

  const tokenBody = await tokenRes.json()
  return tokenBody.access_token as string
}

// ── Vertex AI ────────────────────────────────────────────────────────────────
// Autentica via service account e faz uma chamada mínima ao modelo Flash
// para confirmar que o projeto, as permissões e o modelo estão acessíveis.
async function checkVertexAI(): Promise<StatusResult> {
  const credPath  = process.env.VERTEX_AI_CREDENTIALS
  const projectId = process.env.VERTEX_AI_PROJECT_ID
  const location  = process.env.VERTEX_AI_LOCATION ?? 'us-central1'

  const missing = [
    !credPath   && 'VERTEX_AI_CREDENTIALS',
    !projectId  && 'VERTEX_AI_PROJECT_ID',
  ].filter(Boolean)

  if (missing.length > 0) {
    return { status: 'not_configured', message: `Variáveis ausentes: ${missing.join(', ')}` }
  }

  let accessToken: string
  try {
    accessToken = await getServiceAccountToken(
      credPath!,
      'https://www.googleapis.com/auth/cloud-platform',
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('ENOENT') || msg.includes('no such file')) {
      return { status: 'warn', message: `Arquivo de credenciais não encontrado: ${credPath}` }
    }
    if (msg.includes('timeout') || msg.includes('abort')) {
      return { status: 'error', message: 'Timeout ao autenticar service account Vertex AI' }
    }
    return { status: 'warn', message: `Falha na autenticação: ${msg}` }
  }

  // Usamos generateContent (não countTokens) pois countTokens retorna 200 mesmo
  // com projeto suspenso ou billing desativado — o erro de billing só aparece aqui.
  // Prompt de 1 token para minimizar latência e custo.
  try {
    const model = 'gemini-2.5-flash'
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: '0' }] }],
        generationConfig: { maxOutputTokens: 1 },
      }),
      signal: AbortSignal.timeout(12000),
    })

    if (res.ok) {
      return { status: 'ok', message: 'Vertex AI (Gemini Flash) autenticado, billing ativo e modelo acessível' }
    }

    const body = await res.json().catch(() => ({}))
    const detail = body?.error?.message || body?.error?.status || res.statusText

    if (res.status === 401 || res.status === 403) {
      return { status: 'warn', message: `Sem permissão no Vertex AI: ${detail}` }
    }
    if (res.status === 404) {
      return { status: 'warn', message: `Projeto ou modelo não encontrado: ${detail}` }
    }
    if (res.status === 429) {
      return { status: 'warn', message: 'Rate limit Vertex AI — quota atingida' }
    }
    // 400 pode indicar billing desativado ou projeto suspenso
    if (res.status === 400) {
      const isBilling = detail.toLowerCase().includes('billing') || detail.toLowerCase().includes('quota')
      return {
        status: 'warn',
        message: isBilling ? `Billing ou quota inativa: ${detail}` : `Requisição inválida: ${detail}`,
      }
    }
    if (res.status >= 500) {
      return { status: 'warn', message: `Vertex AI com instabilidade (HTTP ${res.status})` }
    }

    return { status: 'warn', message: `Resposta inesperada: HTTP ${res.status} — ${detail}` }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('timeout') || msg.includes('abort')) {
      return { status: 'error', message: 'Timeout ao contatar Vertex AI' }
    }
    return { status: 'error', message: `Sem conexão com Vertex AI: ${msg}` }
  }
}

// ── GA4 ───────────────────────────────────────────────────────────────────────
// Autentica via service account e valida acesso à Data API.
// Não aparece no status bar, só na aba de Integrações.
async function checkGA4(): Promise<StatusResult> {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS

  if (!credPath) {
    return { status: 'not_configured', message: 'Variável GOOGLE_APPLICATION_CREDENTIALS ausente' }
  }

  let accessToken: string
  try {
    accessToken = await getServiceAccountToken(
      credPath,
      'https://www.googleapis.com/auth/analytics.readonly',
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('ENOENT') || msg.includes('no such file')) {
      return { status: 'warn', message: `Arquivo de credenciais não encontrado: ${credPath}` }
    }
    if (msg.includes('timeout') || msg.includes('abort')) {
      return { status: 'error', message: 'Timeout ao autenticar service account GA4' }
    }
    return { status: 'warn', message: `Falha na autenticação GA4: ${msg}` }
  }

  // Listar properties acessíveis pela service account
  try {
    const res = await fetch(
      'https://analyticsadmin.googleapis.com/v1beta/properties?pageSize=1',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(8000),
      }
    )

    if (res.ok) {
      const data = await res.json().catch(() => ({}))
      // Lista vazia = service account autenticada mas sem acesso a nenhuma property
      if (Array.isArray(data?.properties) && data.properties.length === 0) {
        return { status: 'warn', message: 'Autenticado, mas a service account não tem acesso a nenhuma GA4 property — adicione-a como usuário no GA4' }
      }
      return { status: 'ok', message: 'GA4 autenticado e com acesso a properties' }
    }

    const body = await res.json().catch(() => ({}))
    const detail = body?.error?.message || body?.error?.status || res.statusText

    if (res.status === 401 || res.status === 403) {
      return { status: 'warn', message: `Sem permissão no GA4: ${detail}` }
    }
    if (res.status === 429) {
      return { status: 'warn', message: 'Rate limit GA4 — quota atingida' }
    }
    if (res.status >= 500) {
      return { status: 'warn', message: `GA4 com instabilidade (HTTP ${res.status})` }
    }

    return { status: 'warn', message: `GA4 respondeu HTTP ${res.status} — ${detail}` }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('timeout') || msg.includes('abort')) {
      return { status: 'error', message: 'Timeout ao contatar GA4' }
    }
    return { status: 'error', message: `Sem conexão com GA4: ${msg}` }
  }
}
