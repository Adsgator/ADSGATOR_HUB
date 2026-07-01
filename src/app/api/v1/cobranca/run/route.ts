import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { criarClienteServiceRole } from '@/lib/supabase'
import { dispararEmailAutomatico, automacaoAtiva } from '@/lib/email-automation'
import { estagioInadimplencia, carregarLimiaresAtraso, type LimiaresAtraso } from '@/lib/cobranca'
import { processarReguaInadimplencia } from '@/lib/regua-inadimplencia'
import { asaasGet, asaasGetAll, buscarLinkPagamento } from '@/lib/asaas'
import type { EmailTemplateId } from '@/lib/types/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Régua de cobrança — roda diariamente (Vercel Cron 09:00).
 *
 * ETAPA 1 (sempre roda): sincroniza dias_atraso com o Asaas.
 *   O PAYMENT_OVERDUE do webhook dispara UMA vez (no vencimento), então a
 *   progressão diária do atraso é responsabilidade deste cron: busca os
 *   pagamentos OVERDUE no Asaas, calcula dias desde o vencimento mais antigo
 *   por assinatura e atualiza assinaturas.dias_atraso/status e
 *   clientes.dias_atraso (a UI e os alertas leem do cliente). Também zera
 *   quem não tem mais cobrança vencida.
 *
 * ETAPA 2 (só com toggle 'email_cobranca_vencida' ativo): dispara o email
 * do estágio (lib/cobranca.ts): suspensao→reminder, grave/critico→followup.
 *
 * Auth: sessão (botão) ou Bearer CRON_SECRET (agendado, GET).
 */

interface AsaasOverduePayment {
  subscription: string | null
  customer:     string | null
  dueDate:      string | null
  deleted:      boolean
}

// O cron só sincroniza o NÍVEL de atraso da assinatura; ele não cancela. Por
// isso o crítico (D+28) também para em 'atraso_15_dias' — quem marca os status
// terminais (pausada/cancelado_admin/deletada) é a régua por etapa, com toggle.
const STATUS_ASSINATURA_POR_ESTAGIO: Record<string, string> = {
  em_dia:    'ativa',
  atencao:   'ativa',
  suspensao: 'atraso_7_dias',
  grave:     'atraso_15_dias',
  critico:   'atraso_15_dias',
}

interface AtrasoInfo { dias: number; venc: string }

async function sincronizarAtrasos(
  supabase: Parameters<typeof dispararEmailAutomatico>[0],
  limiares: LimiaresAtraso,
) {
  if (!process.env.ASAAS_API_KEY) {
    return { ok: false, motivo: 'ASAAS_API_KEY ausente' }
  }

  let vencidos: AsaasOverduePayment[]
  try {
    vencidos = await asaasGetAll<AsaasOverduePayment>('/v3/payments?status=OVERDUE')
  } catch (err) {
    return { ok: false, motivo: err instanceof Error ? err.message : String(err) }
  }

  // Atraso (dias desde o vencimento mais antigo em aberto + a data desse
  // vencimento) indexado por assinatura E por customer do Asaas. A data vira o
  // espelho ao vivo em clientes.data_vencimento (a UI deriva D+N — ver
  // diasAtrasoCliente). Duas chaves porque nem todo cliente tem assinatura
  // gravada: histórico criado à mão liga ao Asaas só pelo customer/e-mail.
  const hoje = Date.now()
  const diasDe = (due: string) => Math.max(0, Math.floor((hoje - new Date(`${due}T12:00:00`).getTime()) / 86_400_000))
  const bump = (m: Map<string, AtrasoInfo>, k: string, dias: number, venc: string) => {
    const cur = m.get(k)
    if (!cur || dias > cur.dias) m.set(k, { dias, venc })
  }
  const atrasoPorSub = new Map<string, AtrasoInfo>()
  const atrasoPorCust = new Map<string, AtrasoInfo>()
  for (const p of vencidos) {
    if (p.deleted || !p.dueDate) continue
    const dias = diasDe(p.dueDate)
    if (p.subscription) bump(atrasoPorSub, p.subscription, dias, p.dueDate)
    if (p.customer) bump(atrasoPorCust, p.customer, dias, p.dueDate)
  }

  // Resolve o e-mail dos customers com atraso, para casar clientes que ainda
  // não têm asaas_id gravado (nasceram fora do webhook). Poucos customers em
  // atraso → poucas chamadas extras.
  const emailToCust = new Map<string, string>()
  for (const custId of atrasoPorCust.keys()) {
    try {
      const cu = await asaasGet<{ email?: string | null }>(`/v3/customers/${custId}`)
      const em = (cu.email ?? '').toLowerCase().trim()
      if (em) emailToCust.set(em, custId)
    } catch { /* customer inacessível: ignora, cliente fica não-verificável */ }
  }

  // Caminho oficial: assinaturas com asaas_subscription_id (import do Asaas).
  // O fallback por customer/e-mail abaixo cobre só clientes SEM assinatura
  // (ex.: compra única) que por algum motivo tenham cobrança avulsa vencida.
  const { data: assinaturas } = await supabase
    .from('assinaturas')
    .select('id, cliente_id, dias_atraso, status, asaas_subscription_id')
    .not('asaas_subscription_id', 'is', null)

  let atualizadas = 0
  const atrasoDeSubPorCliente = new Map<string, AtrasoInfo>()
  // Todo cliente com assinatura ligada ao Asaas é VERIFICÁVEL: sabemos consultar
  // o atraso real dele (0 se a assinatura não tem cobrança vencida). É o que
  // permite zerar quem pagou (assinatura viva, sem OVERDUE) sem chute.
  const clientesComAssinatura = new Set<string>()
  for (const a of assinaturas ?? []) {
    clientesComAssinatura.add(a.cliente_id)
    const info = atrasoPorSub.get(a.asaas_subscription_id) ?? null
    const dias = info?.dias ?? 0
    const terminal = ['cancelada', 'deletada', 'cancelado_debito'].includes(a.status)
    // Atualiza o NÍVEL/STATUS só de assinaturas vivas — não ressuscita terminais
    // para 'atraso_15_dias' (quem marca status terminal é a régua por etapa).
    if (!terminal) {
      const novoStatus = STATUS_ASSINATURA_POR_ESTAGIO[estagioInadimplencia(dias, limiares)]
      if (dias !== (a.dias_atraso ?? 0) || novoStatus !== a.status) {
        await supabase
          .from('assinaturas')
          .update({ dias_atraso: dias, status: novoStatus, updated_at: new Date().toISOString() })
          .eq('id', a.id)
        atualizadas++
      }
    }
    // A dívida conta para o cliente mesmo em assinatura terminal: cancelar a
    // recorrência não apaga a fatura já vencida no Asaas.
    if (info) {
      const cur = atrasoDeSubPorCliente.get(a.cliente_id)
      if (!cur || info.dias > cur.dias) atrasoDeSubPorCliente.set(a.cliente_id, info)
    }
  }

  // Reconcilia os CLIENTES. Vínculo, em ordem: assinatura → asaas_id → e-mail do
  // customer (com backfill do asaas_id quando casa por e-mail). Só zeramos quem é
  // VERIFICÁVEL (tem vínculo com o Asaas e está sem cobrança vencida). Cliente
  // sem vínculo algum NÃO é tocado — não dá para afirmar que está em dia, e zerar
  // às cegas apagaria dívida real (foi o bug do "fantasma").
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, email, asaas_id, dias_atraso, data_vencimento')

  let clientesAtualizados = 0
  let backfills = 0
  let fantasmasZerados = 0
  for (const c of (clientes ?? []) as Array<{ id: string; email: string | null; asaas_id: string | null; dias_atraso: number | null; data_vencimento: string | null }>) {
    const email = (c.email ?? '').toLowerCase().trim()
    let custId: string | null = c.asaas_id ?? null
    let matchedByEmail = false
    if (!custId && email && emailToCust.has(email)) {
      custId = emailToCust.get(email)!
      matchedByEmail = true
    }

    const info =
      atrasoDeSubPorCliente.get(c.id) ??
      (custId ? atrasoPorCust.get(custId) ?? null : null)
    const verificavel = clientesComAssinatura.has(c.id) || !!custId

    const updates: Record<string, unknown> = {}
    if (info) {
      if ((c.dias_atraso ?? 0) !== info.dias) updates.dias_atraso = info.dias
      if ((c.data_vencimento ?? null) !== info.venc) updates.data_vencimento = info.venc
    } else if (verificavel) {
      // Ligado ao Asaas e SEM cobrança vencida → em dia. Zera resíduo.
      if ((c.dias_atraso ?? 0) !== 0) { updates.dias_atraso = 0; fantasmasZerados++ }
      if (c.data_vencimento != null) updates.data_vencimento = null
    }
    // Grava o vínculo descoberto por e-mail, para o webhook/cron futuros.
    if (matchedByEmail && custId) { updates.asaas_id = custId; backfills++ }

    if (Object.keys(updates).length > 0) {
      await supabase.from('clientes').update(updates).eq('id', c.id)
      if ('dias_atraso' in updates || 'data_vencimento' in updates) clientesAtualizados++
    }
  }

  return { ok: true, assinaturas_atualizadas: atualizadas, clientes_atualizados: clientesAtualizados, asaas_id_backfills: backfills, fantasmas_zerados: fantasmasZerados, vencidos_no_asaas: vencidos.length }
}

const TEMPLATE_POR_ESTAGIO: Record<string, EmailTemplateId | null> = {
  em_dia: null,
  atencao: null,
  suspensao: 'payment-reminder',
  grave: 'payment-followup',
  critico: 'payment-followup',
}

interface ClienteCobranca {
  id: string
  nome: string
  email: string
  dias_atraso: number | null
  mrr: number | null
}

async function executar(supabase: Parameters<typeof dispararEmailAutomatico>[0]) {
  // Limiares editáveis (Configurações → Financeiro), com fallback nos defaults.
  const limiares = await carregarLimiaresAtraso(supabase)

  // Etapa 1: sincroniza dias_atraso com o Asaas — roda SEMPRE, mesmo com
  // email desligado, senão a inadimplência congela.
  const sync = await sincronizarAtrasos(supabase, limiares)

  // Etapa 1b: régua de inadimplência (D+7 suspender / D+15 cancelar / D+28
  // excluir) — cada etapa atrás do seu toggle (default off); o D+7 só cria a
  // pendência de aprovação. Independe do toggle de email de lembrete.
  const regua = await processarReguaInadimplencia(supabase, limiares)

  // Etapa 2: emails de lembrete — curto-circuito se a automação está desligada.
  if (!(await automacaoAtiva(supabase, 'email_cobranca_vencida'))) {
    return { ativa: false, enviados: 0, resultados: [], sync_atrasos: sync, regua }
  }

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome, email, dias_atraso, mrr')
    .gt('dias_atraso', 0)

  const resultados: Array<{ cliente: string; estagio: string; enviado: boolean; motivo?: string }> = []
  let enviados = 0

  for (const c of (clientes ?? []) as ClienteCobranca[]) {
    const estagio = estagioInadimplencia(c.dias_atraso, limiares)
    const templateId = TEMPLATE_POR_ESTAGIO[estagio]
    if (!templateId) continue

    // Cobrança por atraso → link da cobrança VENCIDA (invoiceUrl do Asaas).
    const pagamento_url = await buscarLinkPagamento(supabase, c.id, 'overdue')

    const r = await dispararEmailAutomatico(supabase, {
      tipo: 'email_cobranca_vencida',
      templateId,
      destinatario: c.email,
      clienteId: c.id,
      variables: {
        nome_cliente: c.nome,
        dias_atraso: String(c.dias_atraso ?? 0),
        valor: c.mrr != null ? `R$ ${c.mrr.toLocaleString('pt-BR')}` : '—',
        pagamento_url,
      },
    })
    if (r.enviado) enviados++
    resultados.push({ cliente: c.nome, estagio, enviado: r.enviado, motivo: r.motivo })
  }

  return { ativa: true, enviados, resultados, sync_atrasos: sync, regua }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const supabase = criarClienteServiceRole()
  return NextResponse.json(await executar(supabase))
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  return NextResponse.json(await executar(supabase))
}
