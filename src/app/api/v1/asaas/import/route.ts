import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import { asaasGetAll } from '@/lib/asaas'
import { provisionarClienteNovo } from '@/lib/cliente-provisioning'

/**
 * POST /api/v1/asaas/import
 *
 * Importa clientes e assinaturas do Asaas para o Hub.
 *
 * Body: { confirmar?: boolean, ids?: string[] }
 *  - confirmar ausente/false → DRY-RUN: retorna o plano (o que seria criado/pulado)
 *    sem gravar NADA no banco.
 *  - confirmar: true → executa o plano e grava. Se `ids` (asaas_subscription_id)
 *    vier preenchido, importa apenas os selecionados.
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

interface AsaasPayment {
  id:           string
  customer:     string
  subscription: string | null
  value:        number
  status:       string
  dueDate:      string | null
  paymentDate:  string | null
  description:  string | null
  deleted:      boolean
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

interface AvulsoItem {
  nome:              string
  email:             string
  whatsapp:          string
  valor:             number
  descricao:         string
  asaas_customer_id: string
  ultimo_pagamento:  string | null
}

/** Importação manual (modal): sessão obrigatória, seleção explícita. */
export async function POST(req: NextRequest) {
  const session = await createSessionClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json().catch(() => ({})) as {
    confirmar?:    boolean
    ids?:          string[]   // asaas_subscription_id (assinaturas)
    customer_ids?: string[]   // asaas customer id (compras únicas)
  }

  return executarImportacao({
    userId:                user.id,
    confirmar:             body.confirmar === true,
    idsSelecionados:       Array.isArray(body.ids) ? new Set(body.ids) : null,
    customersSelecionados: Array.isArray(body.customer_ids) ? new Set(body.customer_ids) : null,
    importarTudo:          false,
  })
}

/**
 * Sync automático (Vercel Cron, diário): importa TUDO que for novo no Asaas
 * (assinaturas ativas e compras únicas), mantendo o Hub sempre espelhado.
 * Idempotente — o que já existe é pulado. Auth: Bearer CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Sem sessão no cron: dono = primeiro usuário do auth (single-operator)
  const { data: lista } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 })
  const ownerId = lista?.users?.[0]?.id
  if (!ownerId) {
    return NextResponse.json({ error: 'Nenhum usuário no auth para atribuir como dono' }, { status: 500 })
  }

  return executarImportacao({
    userId:                ownerId,
    confirmar:             true,
    idsSelecionados:       null,
    customersSelecionados: null,
    importarTudo:          true,
  })
}

interface OpcoesImportacao {
  userId:                string
  confirmar:             boolean
  idsSelecionados:       Set<string> | null
  customersSelecionados: Set<string> | null
  /** true (cron): importa todas as assinaturas E compras únicas novas */
  importarTudo:          boolean
}

async function executarImportacao(opts: OpcoesImportacao) {
  const { userId, confirmar, idsSelecionados, customersSelecionados, importarTudo } = opts

  if (!process.env.ASAAS_API_KEY) {
    return NextResponse.json({ error: 'ASAAS_API_KEY não configurada' }, { status: 500 })
  }

  // ── 1. Buscar tudo do Asaas ────────────────────────────────────────────────
  let customers: AsaasCustomer[]
  let subscriptions: AsaasSubscription[]
  let payments: AsaasPayment[]
  try {
    ;[customers, subscriptions, payments] = await Promise.all([
      asaasGetAll<AsaasCustomer>('/v3/customers'),
      asaasGetAll<AsaasSubscription>('/v3/subscriptions'),
      asaasGetAll<AsaasPayment>('/v3/payments'),
    ])
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Falha ao consultar o Asaas: ${msg}` }, { status: 502 })
  }

  customers     = customers.filter((c) => !c.deleted)
  subscriptions = subscriptions.filter((s) => !s.deleted)
  payments      = payments.filter((p) => !p.deleted)

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

  // ── 3b. Compras únicas: customers com pagamento mas sem assinatura ───────
  // O Hub é o espelho completo do Asaas — cliente de compra única (ex: landing
  // page) também entra, sem assinatura e com MRR 0.
  const customersComAssinatura = new Set(subscriptions.map((s) => s.customer))
  const avulsosPorCustomer = new Map<string, AsaasPayment>()
  for (const p of payments) {
    if (p.subscription || customersComAssinatura.has(p.customer)) continue
    const atual = avulsosPorCustomer.get(p.customer)
    const dataP = p.paymentDate ?? p.dueDate ?? ''
    const dataA = atual ? (atual.paymentDate ?? atual.dueDate ?? '') : ''
    if (!atual || dataP > dataA) avulsosPorCustomer.set(p.customer, p)
  }

  const criarAvulsos: AvulsoItem[] = []
  for (const [customerId, ultimoPag] of avulsosPorCustomer) {
    const customer = customerPorId.get(customerId)
    if (!customer) continue
    const email = (customer.email ?? '').toLowerCase()
    if (email && clientePorEmail.has(email)) {
      pular.push({ motivo: 'cliente_ja_existe', nome: customer.name, detalhe: customerId })
      continue
    }
    criarAvulsos.push({
      nome:              customer.name,
      email:             customer.email ?? `${customerId}@sem-email.com`,
      whatsapp:          customer.mobilePhone ?? customer.phone ?? '',
      valor:             ultimoPag.value,
      descricao:         ultimoPag.description || 'Compra única',
      asaas_customer_id: customerId,
      ultimo_pagamento:  ultimoPag.paymentDate ?? ultimoPag.dueDate,
    })
  }

  const inativas = subscriptions.length - ativas.length

  const resumo = {
    asaas: {
      customers:             customers.length,
      assinaturas_ativas:    ativas.length,
      assinaturas_inativas:  inativas,
      pagamentos:            payments.length,
    },
    plano: {
      criar:         criar.length,
      criar_avulsos: criarAvulsos.length,
      pular:         pular.length,
    },
    detalhes: { criar, criar_avulsos: criarAvulsos, pular },
  }

  // ── 4. Dry-run: devolve o plano sem tocar no banco ────────────────────────
  if (!confirmar) {
    return NextResponse.json({ dry_run: true, ...resumo })
  }

  // ── 5. Execução ───────────────────────────────────────────────────────────
  const aImportar = idsSelecionados
    ? criar.filter((i) => idsSelecionados.has(i.asaas_subscription_id))
    : criar

  const resultados: { nome: string; ok: boolean; erro?: string }[] = []

  for (const item of aImportar) {
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
            user_id:  userId,
          })
          .select('id')
          .single()
        if (errCliente) throw new Error(errCliente.message)
        clienteId = novo.id as string
        clientePorEmail.set(item.email.toLowerCase(), clienteId)

        // Tarefa de setup automática — falha não derruba a importação
        try {
          await provisionarClienteNovo(supabaseAdmin, userId, { id: clienteId, nome: item.nome }, 'import')
        } catch (provErr) {
          console.error(`Provisionamento falhou para ${item.nome}:`, provErr)
        }
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

  // ── 5b. Compras únicas selecionadas ───────────────────────────────────────
  const aImportarAvulsos = customersSelecionados
    ? criarAvulsos.filter((i) => customersSelecionados.has(i.asaas_customer_id))
    : importarTudo ? criarAvulsos : []

  const noventaDiasAtras = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  for (const item of aImportarAvulsos) {
    try {
      if (clientePorEmail.has(item.email.toLowerCase())) {
        resultados.push({ nome: item.nome, ok: true })
        continue
      }
      // Compra recente (90d) = entrega provavelmente em andamento → ativo;
      // antiga = cliente passado sem recorrência → inativo
      const recente = (item.ultimo_pagamento ?? '') >= noventaDiasAtras
      const { data: novo, error: errCliente } = await supabaseAdmin
        .from('clientes')
        .insert({
          nome:     item.nome,
          email:    item.email,
          whatsapp: item.whatsapp,
          nicho:    'a_definir',
          status:   recente ? 'ativo' : 'inativo',
          mrr:      0,
          user_id:  userId,
        })
        .select('id')
        .single()
      if (errCliente) throw new Error(errCliente.message)
      clientePorEmail.set(item.email.toLowerCase(), novo.id as string)

      // Setup só para avulso ativo (entrega em andamento) — inativo é histórico
      if (recente) {
        try {
          await provisionarClienteNovo(supabaseAdmin, userId, { id: novo.id as string, nome: item.nome }, 'import')
        } catch (provErr) {
          console.error(`Provisionamento falhou para ${item.nome}:`, provErr)
        }
      }

      await supabaseAdmin.from('historico_acoes').insert({
        cliente_id:      novo.id,
        tipo_acao:       'importacao_asaas',
        descricao:       `Cliente de compra única importado do Asaas (${item.descricao}, R$ ${item.valor}${item.ultimo_pagamento ? `, último pagamento ${item.ultimo_pagamento}` : ''}).`,
        valor_impactado: item.valor,
        metadata:        { asaas_customer_id: item.asaas_customer_id, compra_unica: true },
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
