import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { criarClienteServiceRole } from '@/lib/supabase'
import { dispararEmailAutomatico, automacaoAtiva } from '@/lib/email-automation'
import { estagioInadimplencia, carregarLimiaresAtraso, type LimiaresAtraso } from '@/lib/cobranca'
import { processarReguaInadimplencia } from '@/lib/regua-inadimplencia'
import { asaasGetAll, buscarLinkPagamento } from '@/lib/asaas'
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

  // Dias de atraso por assinatura = vencimento mais antigo em aberto.
  // Guardamos também a data desse vencimento, que vira o espelho ao vivo em
  // clientes.data_vencimento (a UI deriva D+N dela — ver diasAtrasoCliente).
  const hoje = Date.now()
  const atrasoPorSub = new Map<string, number>()
  const vencimentoPorSub = new Map<string, string>()
  for (const p of vencidos) {
    if (!p.subscription || p.deleted || !p.dueDate) continue
    const dias = Math.max(0, Math.floor((hoje - new Date(`${p.dueDate}T12:00:00`).getTime()) / 86_400_000))
    if (dias > (atrasoPorSub.get(p.subscription) ?? -1)) {
      atrasoPorSub.set(p.subscription, dias)
      vencimentoPorSub.set(p.subscription, p.dueDate)
    }
  }

  const { data: assinaturas } = await supabase
    .from('assinaturas')
    .select('id, cliente_id, dias_atraso, status, asaas_subscription_id')
    .not('asaas_subscription_id', 'is', null)

  const atrasoPorCliente = new Map<string, number>()
  const vencimentoPorCliente = new Map<string, string | null>()
  let atualizadas = 0

  for (const a of assinaturas ?? []) {
    // Assinaturas encerradas não voltam para a régua (inclui o legado
    // 'cancelado_debito', que o cron não deve ressuscitar para 'atraso_15_dias')
    if (['cancelada', 'deletada', 'cancelado_debito'].includes(a.status)) continue

    const novoAtraso = atrasoPorSub.get(a.asaas_subscription_id) ?? 0
    const novoVencimento = vencimentoPorSub.get(a.asaas_subscription_id) ?? null
    const novoStatus = STATUS_ASSINATURA_POR_ESTAGIO[estagioInadimplencia(novoAtraso, limiares)]

    if (novoAtraso !== (a.dias_atraso ?? 0) || novoStatus !== a.status) {
      await supabase
        .from('assinaturas')
        .update({ dias_atraso: novoAtraso, status: novoStatus, updated_at: new Date().toISOString() })
        .eq('id', a.id)
      atualizadas++
    }
    // Cliente = a assinatura com maior atraso (e a data desse vencimento).
    const atualMax = atrasoPorCliente.get(a.cliente_id)
    if (atualMax === undefined || novoAtraso > atualMax) {
      atrasoPorCliente.set(a.cliente_id, novoAtraso)
      vencimentoPorCliente.set(a.cliente_id, novoVencimento)
    }
  }

  // Reflete no cliente (UI, alertas e esta régua leem clientes.dias_atraso)
  let clientesAtualizados = 0
  for (const [clienteId, dias] of atrasoPorCliente) {
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id, dias_atraso, data_vencimento, status')
      .eq('id', clienteId)
      .maybeSingle()
    if (!cliente) continue

    const venc = vencimentoPorCliente.get(clienteId) ?? null
    const updates: Record<string, unknown> = {}
    if ((cliente.dias_atraso ?? 0) !== dias) updates.dias_atraso = dias
    // Espelho ao vivo do vencimento em aberto; null quando não há mais OVERDUE.
    if ((cliente.data_vencimento ?? null) !== venc) updates.data_vencimento = venc
    // NÃO arquiva mais o cliente sozinho no crítico: ações graves (suspender,
    // cancelar, excluir) são da régua por etapa, atrás de toggle e — no D+7 —
    // com autorização do Lucas. Aqui o cron só sincroniza o atraso.
    if (Object.keys(updates).length > 0) {
      await supabase.from('clientes').update(updates).eq('id', clienteId)
      clientesAtualizados++
    }
  }

  return { ok: true, assinaturas_atualizadas: atualizadas, clientes_atualizados: clientesAtualizados, vencidos_no_asaas: vencidos.length }
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
