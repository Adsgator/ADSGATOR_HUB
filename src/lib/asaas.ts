/**
 * Helpers do Asaas (lado Node). Detecta produção/sandbox pelo prefixo da chave.
 */

export function asaasBaseUrl(): string {
  const key = process.env.ASAAS_API_KEY ?? ''
  return key.startsWith('$aact_prod_') ? 'https://api.asaas.com' : 'https://sandbox.asaas.com'
}

/** GET paginado — percorre todas as páginas de uma listagem. */
export async function asaasGetAll<T>(path: string): Promise<T[]> {
  const base = asaasBaseUrl()
  const out: T[] = []
  let offset = 0
  for (;;) {
    const res = await fetch(`${base}${path}${path.includes('?') ? '&' : '?'}limit=100&offset=${offset}`, {
      headers: { access_token: process.env.ASAAS_API_KEY! },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`Asaas ${path} respondeu HTTP ${res.status}`)
    const body = await res.json() as { data: T[]; hasMore: boolean }
    out.push(...(body.data ?? []))
    if (!body.hasMore) break
    offset += 100
  }
  return out
}
