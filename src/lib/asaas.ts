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

/**
 * Escrita no Asaas (PUT/POST/DELETE). Mesma base/credencial/timeout do GET.
 * Lança em HTTP não-ok com a descrição de erro do Asaas (a rota trata/loga) —
 * nunca assume sucesso cego. Usada pela régua de inadimplência (pausar/reativar
 * assinatura, remover cobrança).
 */
export async function asaasRequest<T>(
  method: 'PUT' | 'POST' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const base = asaasBaseUrl()
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      access_token: process.env.ASAAS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  })
  const texto = await res.text()
  let json: Record<string, unknown> = {}
  try { json = texto ? JSON.parse(texto) as Record<string, unknown> : {} } catch { /* corpo não-JSON */ }
  if (!res.ok) {
    const erros = json.errors as { description?: string }[] | undefined
    throw new Error(`Asaas ${method} ${path} → ${erros?.[0]?.description ?? `HTTP ${res.status}`}`)
  }
  return json as T
}

export interface RemocaoCobrancas {
  /** ids das cobranças efetivamente removidas (Asaas confirmou deleted:true) */
  removidas: string[]
  /** cobranças que o Asaas recusou remover, com o motivo */
  falhas: { id: string; motivo: string }[]
  /** total de cobranças em aberto encontradas (alvo da remoção) */
  total: number
}

/**
 * Remove cobranças em aberto de uma assinatura no Asaas. Cobranças já pagas
 * (RECEIVED / CONFIRMED) são sempre preservadas. Trata o retorno de CADA DELETE:
 * só conta como removida quando o Asaas devolve `deleted:true`; o resto vira
 * falha com motivo (não assume sucesso).
 *
 * `incluirVencidas` controla a etapa da régua:
 *  - false (default): remove só as NÃO-VENCIDAS (PENDING / AWAITING_RISK_ANALYSIS)
 *    — é o caso da SUSPENSÃO D+7, que tira a próxima cobrança que o Asaas
 *    adianta mas PRESERVA a vencida (dívida real, não se apaga);
 *  - true: inclui as OVERDUE — é o caso da EXCLUSÃO D+28, que limpa tudo antes
 *    de deletar a assinatura.
 */
export async function removerCobrancasEmAberto(
  subscriptionId: string,
  { incluirVencidas = false }: { incluirVencidas?: boolean } = {},
): Promise<RemocaoCobrancas> {
  const EM_ABERTO = incluirVencidas
    ? ['PENDING', 'OVERDUE', 'AWAITING_RISK_ANALYSIS']
    : ['PENDING', 'AWAITING_RISK_ANALYSIS']
  const pagamentos = await asaasGetAll<{ id: string; status: string; deleted?: boolean }>(
    `/v3/subscriptions/${subscriptionId}/payments`,
  )
  const alvos = pagamentos.filter((p) => !p.deleted && EM_ABERTO.includes(p.status))

  const removidas: string[] = []
  const falhas: { id: string; motivo: string }[] = []
  for (const p of alvos) {
    try {
      const r = await asaasRequest<{ deleted?: boolean }>('DELETE', `/v3/payments/${p.id}`)
      if (r.deleted) removidas.push(p.id)
      else falhas.push({ id: p.id, motivo: 'Asaas não confirmou a remoção (deleted≠true)' })
    } catch (err) {
      falhas.push({ id: p.id, motivo: err instanceof Error ? err.message : String(err) })
    }
  }
  return { removidas, falhas, total: alvos.length }
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
