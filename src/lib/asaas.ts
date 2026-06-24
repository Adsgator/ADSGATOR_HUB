/**
 * Helpers do Asaas (lado Node). Detecta produção/sandbox pelo prefixo da chave.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export function asaasBaseUrl(): string {
  const key = process.env.ASAAS_API_KEY ?? ''
  return key.startsWith('$aact_prod_') ? 'https://api.asaas.com' : 'https://sandbox.asaas.com'
}

interface AsaasPayment {
  invoiceUrl: string | null
  bankSlipUrl: string | null
  dueDate: string | null
  status: string
  deleted?: boolean
}

/**
 * Busca o link de pagamento (invoiceUrl) da cobrança vigente de um cliente no
 * Asaas, para usar como {{pagamento_url}} nos emails.
 *
 * `preferencia`:
 *  - 'overdue' (atraso/suspensão): prioriza a cobrança VENCIDA mais antiga;
 *  - 'pending' (lembrete de vencimento): prioriza a PENDENTE a vencer mais próxima.
 * Se a preferida não existir, cai para a outra. Retorna '' quando não há
 * customer/cobrança (o template degrada para um link vazio).
 *
 * Requer ASAAS_API_KEY e o asaas_customer_id do cliente (vem do import, fica
 * em `assinaturas`). Nunca lança: erro de rede/credencial vira ''.
 */
export async function buscarLinkPagamento(
  supabase: SupabaseClient,
  clienteId: string,
  preferencia: 'overdue' | 'pending' = 'overdue',
): Promise<string> {
  if (!process.env.ASAAS_API_KEY) return ''

  const { data: assinaturas } = await supabase
    .from('assinaturas')
    .select('asaas_customer_id')
    .eq('cliente_id', clienteId)
    .not('asaas_customer_id', 'is', null)
    .limit(1)

  const customerId = assinaturas?.[0]?.asaas_customer_id
  if (!customerId) return ''

  async function buscar(status: 'OVERDUE' | 'PENDING'): Promise<AsaasPayment | null> {
    try {
      const pagamentos = await asaasGetAll<AsaasPayment>(`/v3/payments?customer=${customerId}&status=${status}`)
      const validos = pagamentos.filter((p) => !p.deleted && p.invoiceUrl)
      if (validos.length === 0) return null
      // OVERDUE: vencida mais antiga. PENDING: a vencer mais próxima (asc também).
      validos.sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
      return validos[0]
    } catch {
      return null
    }
  }

  const ordem: Array<'OVERDUE' | 'PENDING'> =
    preferencia === 'overdue' ? ['OVERDUE', 'PENDING'] : ['PENDING', 'OVERDUE']

  for (const status of ordem) {
    const p = await buscar(status)
    if (p?.invoiceUrl) return p.invoiceUrl
  }
  return ''
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
