import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'

/**
 * POST /api/v1/asaas/import
 *
 * Importa clientes e assinaturas do Asaas para o Hub.
 *
 * Body: { confirmar?: boolean }
 *  - confirmar ausente/false → DRY-RUN: retorna o plano (o que seria criado/pulado)
 *    sem gravar NADA no banco.
 *  - confirmar: true → executa o plano e grava.
 *
 * Não dispara nenhum email, cobrança ou mensagem — apenas espelha dados
 * do Asaas nas tabelas clientes/assinaturas. Auth: sessão obrigatória.
 */

const supabaseAdmin = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface AsaasCustomer {
  id:           string
  name:         string
  email:        string | null
  mobilePhone:  string | null
  phone:        string | null
  deleted:      boolean
}

interface AsaasSubscription {
  id:          string
  customer:    string   // id do customer
  value:       number
  status:      'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  nextDueDate: string | null
  description: string | null
  deleted:     boolean
}

interface PlanoItem {
  nome:                  string
  email:                 string
  whatsapp:              string
  valor_mensal:          number
  plano_nome:            string
  asaas_subscription_id: string
  data_proxima_cobranca: string | null
}

function asaasBaseUrl(): string {
  const key = process.env.ASAAS_API_KEY ?? ''
  return key.startsWith('$aact_prod_') ? 'https://api.asaas.com' : 'https://sandbox.asaas.com'
}

async function asaasGetAll<T>(path: string): Promise<T[]> {
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

export async function POST(req: NextRequest) {
  const session = await createSessionClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  if (!process.env.ASAAS_API_KEY) {
    return NextResponse.json({ error: 'ASAAS_API_KEY não configurada' }, { status: 500 })
  }

  const body = await req.json().catch(() => ({})) as { confirmar?: boolean }
  const confirmar = body.confirmar === true

  // ── 1. Buscar tudo do Asaas ────────────────────────────────────────────────
  let customers: AsaasCustomer[]
  let subscriptions: AsaasSubscription[]
  try {
    ;[customers, subscriptions] = await Promise.all([
      asaasGetAll<AsaasCustomer>('/v3/customers'),
      asaasGetAll<AsaasSubscription>('/v3/subscriptions'),
    ])
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Falha ao consultar o Asaas: ${msg}` }, { status: 502 })
  }

  customers     = customers.filter((c) => !c.deleted)
  subscriptions = subscriptions.filter((s) => !s.deleted)

  const customerPorId = new Map(customers.map((c) => [c.id, c]))
  const ativas        = subscriptions.filter((s) => s.status === 'ACTIVE')

  // ── 2. O que já existe no Hub ─────────────────────────────────────────────
  const { data: assinaturasExistentes } = await supabaseAdmin
    .from('assinaturas')
    .select('asaas_subscription_id')
    .not('asaas_subscription_id', 'is', null)
  const idsJaImportados = new Set((assinaturasExistentes ?? []).map((a) => a.asaas_subscription_id))

  const { data: clientesExistentes } = await supabaseAdmin
    .from('clientes')
    .select('id, email')
  const clientePorEmail = new Map((clientesExistentes ?? []).map((c) => [c.email?.toLowerCase(), c.id]))

  // ── 3. Montar o plano ─────────────────────────────────────────────────────
  const criar:  PlanoItem[] = []
  const pular:  { motivo: string; nome: string; detalhe?: string }[] = []

  for (const sub of ativas) {
    const customer = customerPorId.get(sub.customer)
    if (!customer) {
      pular.push({ motivo: 'customer_nao_encontrado', nome: sub.customer, detalhe: sub.id })
      continue
    }
    if (idsJaImportados.has(sub.id)) {
      pular.push({ motivo: 'assinatura_ja_importada', nome: customer.name, detalhe: sub.id })
      continue
    }
    criar.push({
      nome:                  customer.name,
      email:                 customer.email ?? `${sub.id}@sem-email.com`,
      whatsapp:              customer.mobilePhone ?? customer.phone ?? '',
      valor_mensal:          sub.value,
      plano_nome:            sub.description || 'Plano Adsgator',
      asaas_subscription_id: sub.id,
      data_proxima_cobranca: sub.nextDueDate,
    })
  }

  const inativas = subscriptions.length - ativas.length

  const resumo = {
    asaas: {
      customers:             customers.length,
      assinaturas_ativas:    ativas.length,
      assinaturas_inativas:  inativas,
    },
    plano: {
      criar:  criar.length,
      pular:  pular.length,
    },
    detalhes: { criar, pular },
  }

  // ── 4. Dry-run: devolve o plano sem tocar no banco ────────────────────────
  if (!confirmar) {
    return NextResponse.json({ dry_run: true, ...resumo })
  }

  // ── 5. Execução ───────────────────────────────────────────────────────────
  const resultados: { nome: string; ok: boolean; erro?: string }[] = []

  for (const item of criar) {
    try {
      // Reusa cliente existente com mesmo email; senão cria
      let clienteId = clientePorEmail.get(item.email.toLowerCase())

      if (!clienteId) {
        const { data: novo, error: errCliente } = await supabaseAdmin
          .from('clientes')
          .insert({
            nome:     item.nome,
            email:    item.email,
            whatsapp: item.whatsapp,
            nicho:    'a_definir',
            status:   'ativo',
            mrr:      item.valor_mensal,
            user_id:  user.id,
          })
          .select('id')
          .single()
        if (errCliente) throw new Error(errCliente.message)
        clienteId = novo.id as string
        clientePorEmail.set(item.email.toLowerCase(), clienteId)
      }

      const { error: errAssinatura } = await supabaseAdmin.from('assinaturas').insert({
        cliente_id:            clienteId,
        plano_nome:            item.plano_nome,
        valor_mensal:          item.valor_mensal,
        status:                'ativa',
        dias_atraso:           0,
        asaas_subscription_id: item.asaas_subscription_id,
        data_proxima_cobranca: item.data_proxima_cobranca,
      })
      if (errAssinatura) throw new Error(errAssinatura.message)

      await supabaseAdmin.from('historico_acoes').insert({
        cliente_id: clienteId,
        tipo_acao:  'importacao_asaas',
        descricao:  `Cliente importado do Asaas (assinatura ${item.asaas_subscription_id}, R$ ${item.valor_mensal}/mês).`,
        metadata:   { asaas_subscription_id: item.asaas_subscription_id },
      })

      resultados.push({ nome: item.nome, ok: true })
    } catch (err) {
      resultados.push({ nome: item.nome, ok: false, erro: err instanceof Error ? err.message : String(err) })
    }
  }

  return NextResponse.json({
    dry_run: false,
    importados: resultados.filter((r) => r.ok).length,
    falhas:     resultados.filter((r) => !r.ok),
    pulados:    pular.length,
  })
}
