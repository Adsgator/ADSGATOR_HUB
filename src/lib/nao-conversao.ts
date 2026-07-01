// ─── NÃO-CONVERSÃO (fechou no checkout mas não pagou) ────────────────────────
// No checkout-first, o webhook cria o cliente já na geração da cobrança
// (PAYMENT_CREATED), antes do pagamento. Se o cliente NUNCA paga (cobrança vence
// em ~D+3 e é cancelada/abandonada), ele fica no Hub como 'recebido' com as
// tarefas de onboarding — um "zumbi". Aqui, uma varredura diária (chamada pelo
// cron de cobrança) detecta esse caso pelo ESTADO REAL (entrou, não pagou, passou
// do prazo), arquiva como 'nao_convertido' e limpa o onboarding — e reativa quem
// pagar depois. Não depende de qual evento o Asaas dispara ao cancelar a cobrança.
//
// Distingue não-conversão de CHURN: quem já teve um pagamento confirmado nunca é
// marcado não-convertido (é cliente real que saiu — tem receita no DRE/histórico).

import type { SupabaseClient } from '@supabase/supabase-js'
import { asaasGetAll, asaasRequest } from './asaas'
import { provisionarClienteNovo } from './cliente-provisioning'

/** Dias após a criação, sem pagamento, para considerar não-conversão (vencimento D+3 + 1). */
const DIAS_ATE_NAO_CONVERSAO = 4

/** Status "em conversão": entrou, mas ainda não é cliente pagante consolidado. */
const STATUS_EM_CONVERSAO = ['recebido', 'onboarding', 'setup_trafego']

/** Status de assinatura que indicam vínculo VIVO (não é lead perdido). */
const ASSINATURA_VIVA = ['ativa', 'atraso_7_dias', 'atraso_15_dias', 'atraso_30_dias', 'pausada', 'cancelado_admin']

const ASAAS_RECEBIDO = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH']

interface ClienteLead {
  id:         string
  nome:       string
  email:      string | null
  whatsapp?:  string | null
  asaas_id:   string | null
  user_id:    string | null
}

export interface ResultadoNaoConversao {
  ok:          true
  dry_run:     boolean
  arquivados:  { id: string; nome: string }[]
  recuperados: { id: string; nome: string }[]
}

/** Descobre o customer do Asaas ligado ao cliente (asaas_id gravado ou por e-mail). */
async function resolverCustomerId(c: ClienteLead): Promise<string | null> {
  if (c.asaas_id) return c.asaas_id
  const email = (c.email ?? '').trim()
  if (!email) return null
  try {
    const custs = await asaasGetAll<{ id: string; deleted: boolean }>(`/v3/customers?email=${encodeURIComponent(email)}`)
    return custs.find((x) => !x.deleted)?.id ?? null
  } catch {
    return null
  }
}

/**
 * O customer tem ALGUM pagamento recebido no Asaas? (fonte da verdade, anti-engano)
 * LANÇA em erro de rede/credencial — quem chama decide o lado seguro conforme o
 * passo (não arquivar em A; não recuperar em B).
 */
async function asaasTemRecebido(customerId: string): Promise<boolean> {
  for (const status of ASAAS_RECEBIDO) {
    const pays = await asaasGetAll<{ id: string }>(`/v3/payments?customer=${customerId}&status=${status}`)
    if (pays.length > 0) return true
  }
  return false
}

/**
 * Exclui no Asaas as cobranças EM ABERTO do customer (não pagou nada — já
 * confirmado antes de chegar aqui). Só toca em não-pagas; recebida o Asaas nem
 * deixaria apagar. Retorna quantas removeu. Não lança (falha não trava o arquivo).
 */
async function excluirCobrancasAbertas(customerId: string): Promise<number> {
  let removidas = 0
  for (const status of ['PENDING', 'OVERDUE', 'AWAITING_RISK_ANALYSIS']) {
    let pays: { id: string; deleted?: boolean }[]
    try {
      pays = await asaasGetAll<{ id: string; deleted?: boolean }>(`/v3/payments?customer=${customerId}&status=${status}`)
    } catch { continue }
    for (const p of pays) {
      if (p.deleted) continue
      try {
        const r = await asaasRequest<{ deleted?: boolean }>('DELETE', `/v3/payments/${p.id}`)
        if (r.deleted) removidas++
      } catch { /* cobrança que o Asaas recusou apagar — ignora */ }
    }
  }
  return removidas
}

/** Arquiva o lead como não-convertido, exclui a cobrança no Asaas, limpa o onboarding e notifica p/ recuperar. */
async function marcarNaoConvertido(supabase: SupabaseClient, c: ClienteLead, customerId: string | null): Promise<void> {
  // Cancela a cobrança em aberto no Asaas (o Lucas fazia isso na mão).
  const cobrancasRemovidas = customerId ? await excluirCobrancasAbertas(customerId) : 0

  await supabase.from('clientes').update({
    status:            'inativo',
    motivo_inativacao: 'nao_convertido',
    inativado_em:      new Date().toISOString(),
    dias_atraso:       0,
    data_vencimento:   null,
  }).eq('id', c.id)

  // Sem estes dois, o zumbi continuaria aparecendo (a lista de tarefas e o
  // "Ações do Dia" não filtram por status do cliente).
  await supabase.from('estagios').update({ ativo: false }).eq('cliente_id', c.id).eq('ativo', true)
  await supabase.from('tarefas').delete().eq('cliente_id', c.id).ilike('titulo', 'Setup do cliente%')

  await supabase.from('historico_acoes').insert({
    cliente_id: c.id,
    tipo_acao:  'nao_convertido',
    descricao:  `🚫 Fechou no checkout mas não pagou o 1º pagamento — arquivado como não convertido${cobrancasRemovidas > 0 ? ` (${cobrancasRemovidas} cobrança(s) cancelada(s) no Asaas)` : ''}.`,
  })

  const whats = (c.whatsapp ?? '').replace(/\D/g, '')
  await supabase.from('notificacoes').insert({
    user_id:    c.user_id,
    cliente_id: c.id,
    tipo:       'urgente',
    titulo:     `🔔 ${c.nome} fechou mas não pagou`,
    mensagem:   'Não converteu (não pagou o 1º pagamento). Cancelei a cobrança em aberto no Asaas. Lead quente — vale chamar no WhatsApp para recuperar.',
    acao_url:   whats ? `https://wa.me/${whats}` : `/clientes/${c.id}`,
    acao_label: whats ? 'Chamar no WhatsApp' : 'Ver cliente',
  })
}

/** Reativa o lead que pagou depois de ter sido marcado não-convertido. */
async function recuperarCliente(supabase: SupabaseClient, c: ClienteLead): Promise<void> {
  await supabase.from('clientes').update({
    status:            'recebido',
    motivo_inativacao: null,
    inativado_em:      null,
  }).eq('id', c.id)

  await supabase.from('estagios').update({ ativo: true }).eq('cliente_id', c.id).eq('nome', 'recebido')

  if (c.user_id) {
    try {
      await provisionarClienteNovo(supabase, c.user_id, { id: c.id, nome: c.nome }, 'retroativo')
    } catch (err) {
      console.error(`Re-provisionamento falhou para ${c.nome}:`, err)
    }
  }

  await supabase.from('historico_acoes').insert({
    cliente_id: c.id,
    tipo_acao:  'nao_convertido_recuperado',
    descricao:  '✅ Cliente pagou após ser marcado não convertido — reativado.',
  })
  await supabase.from('notificacoes').insert({
    user_id:    c.user_id,
    cliente_id: c.id,
    tipo:       'sucesso',
    titulo:     `✅ ${c.nome} pagou — reativado`,
    mensagem:   'O lead que não tinha convertido pagou e voltou para a operação. Onboarding reativado.',
    acao_url:   `/clientes/${c.id}`,
    acao_label: 'Ver cliente',
  })
}

/**
 * Varredura de não-conversão (chamada pelo cron de cobrança).
 *
 * dryRun=true: só retorna quem SERIA arquivado/recuperado, sem escrever nada
 * (usado na 1ª conferência revisada e em auditorias).
 */
export async function processarNaoConversao(
  supabase: SupabaseClient,
  opts: { dryRun?: boolean } = {},
): Promise<ResultadoNaoConversao> {
  const dryRun = opts.dryRun ?? false
  const arquivados: { id: string; nome: string }[] = []
  const recuperados: { id: string; nome: string }[] = []

  // ── PASSO A: arquivar quem fechou e não pagou ───────────────────────────────
  const cutoff = new Date(Date.now() - DIAS_ATE_NAO_CONVERSAO * 86_400_000).toISOString()
  const { data: candidatos } = await supabase
    .from('clientes')
    .select('id, nome, email, whatsapp, asaas_id, user_id, data_criacao, created_at')
    .in('status', STATUS_EM_CONVERSAO)

  const emConversao = ((candidatos ?? []) as (ClienteLead & { data_criacao: string | null; created_at: string | null })[])
    .filter((c) => {
      const criado = c.data_criacao ?? c.created_at
      return criado != null && criado < cutoff // passou do prazo do checkout
    })

  if (emConversao.length > 0) {
    const ids = emConversao.map((c) => c.id)

    const { data: assinaturas } = await supabase
      .from('assinaturas').select('cliente_id, status').in('cliente_id', ids)
    const comAssinaturaViva = new Set(
      (assinaturas ?? []).filter((a) => ASSINATURA_VIVA.includes(a.status)).map((a) => a.cliente_id),
    )

    const pagou = new Set<string>()
    const { data: lancs } = await supabase
      .from('financeiro_lancamentos').select('cliente_id')
      .eq('tipo', 'receita').eq('status', 'confirmado').in('cliente_id', ids)
    for (const l of lancs ?? []) pagou.add(l.cliente_id as string)
    const { data: hist } = await supabase
      .from('historico_acoes').select('cliente_id')
      .eq('tipo_acao', 'pagamento_recebido').in('cliente_id', ids)
    for (const h of hist ?? []) pagou.add(h.cliente_id as string)

    for (const c of emConversao) {
      if (comAssinaturaViva.has(c.id)) continue // tem plano vivo → não é lead perdido
      if (pagou.has(c.id)) continue             // já pagou (Hub) → churn, não não-conversão
      // Corrobora no Asaas; erro na consulta → NÃO arquiva (lado seguro).
      const customerId = await resolverCustomerId(c)
      if (customerId) {
        let recebeuNoAsaas: boolean
        try { recebeuNoAsaas = await asaasTemRecebido(customerId) } catch { recebeuNoAsaas = true }
        if (recebeuNoAsaas) continue // já pagou (Asaas)
      }

      arquivados.push({ id: c.id, nome: c.nome })
      if (!dryRun) await marcarNaoConvertido(supabase, c, customerId)
    }
  }

  // ── PASSO B: recuperar quem pagou depois ────────────────────────────────────
  const { data: perdidos } = await supabase
    .from('clientes')
    .select('id, nome, email, whatsapp, asaas_id, user_id')
    .eq('status', 'inativo')
    .eq('motivo_inativacao', 'nao_convertido')

  for (const c of (perdidos ?? []) as ClienteLead[]) {
    const { data: lanc } = await supabase
      .from('financeiro_lancamentos').select('id')
      .eq('cliente_id', c.id).eq('tipo', 'receita').eq('status', 'confirmado')
      .limit(1).maybeSingle()
    let pagou = !!lanc
    if (!pagou) {
      // Fallback no Asaas; erro na consulta → NÃO recupera (lado seguro).
      const customerId = await resolverCustomerId(c)
      if (customerId) {
        try { pagou = await asaasTemRecebido(customerId) } catch { pagou = false }
      }
    }
    if (!pagou) continue

    recuperados.push({ id: c.id, nome: c.nome })
    if (!dryRun) await recuperarCliente(supabase, c)
  }

  return { ok: true, dry_run: dryRun, arquivados, recuperados }
}
