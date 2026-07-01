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

/** Só checa no Asaas quem já pode ter vencido (evita consultar cadastro novo demais). */
const DIAS_MIN_PARA_CHECAR = 3
/** Fallback: cobrança já sumiu do Asaas (apagada) e o lead nunca pagou → abandono. */
const DIAS_ABANDONO = 4

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
 * Situação de pagamento do customer no Asaas (1 consulta). LANÇA em erro de
 * rede/credencial — quem chama decide o lado seguro conforme o passo.
 *  - pagou:       tem cobrança RECEBIDA → nunca marca não-convertido (é churn/real)
 *  - temOverdue:  tem cobrança VENCIDA (o Asaas marca OVERDUE no dia SEGUINTE ao
 *                 vencimento) → é o gatilho preciso do "1 dia após o vencimento"
 *  - temPendente: tem cobrança a vencer (ainda dentro do prazo) → não arquiva
 */
export async function situacaoAsaas(customerId: string): Promise<{ pagou: boolean; temOverdue: boolean; temPendente: boolean }> {
  const pays = await asaasGetAll<{ status: string; deleted?: boolean }>(`/v3/payments?customer=${customerId}`)
  const ativos = pays.filter((p) => !p.deleted)
  return {
    pagou:       ativos.some((p) => ASAAS_RECEBIDO.includes(p.status)),
    temOverdue:  ativos.some((p) => p.status === 'OVERDUE'),
    temPendente: ativos.some((p) => p.status === 'PENDING' || p.status === 'AWAITING_RISK_ANALYSIS'),
  }
}

/**
 * Exclui no Asaas as cobranças EM ABERTO do customer (não pagou nada — já
 * confirmado antes de chegar aqui). Só toca em não-pagas; recebida o Asaas nem
 * deixaria apagar. Retorna quantas removeu. Não lança (falha não trava o arquivo).
 */
export async function excluirCobrancasAbertas(customerId: string): Promise<number> {
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
  opts: { dryRun?: boolean; clienteId?: string } = {},
): Promise<ResultadoNaoConversao> {
  const dryRun = opts.dryRun ?? false
  const soCliente = opts.clienteId ?? null // limita a varredura a 1 cliente (teste/reprocesso)
  const arquivados: { id: string; nome: string }[] = []
  const recuperados: { id: string; nome: string }[] = []

  // ── PASSO A: arquivar quem fechou e não pagou ───────────────────────────────
  // Gatilho preciso: a cobrança está VENCIDA no Asaas (OVERDUE = dia seguinte ao
  // vencimento). Pré-filtra por idade só para não consultar cadastro novo demais.
  const cutoff = new Date(Date.now() - DIAS_MIN_PARA_CHECAR * 86_400_000).toISOString()
  const abandonoCutoff = new Date(Date.now() - DIAS_ABANDONO * 86_400_000).toISOString()
  let queryCandidatos = supabase
    .from('clientes')
    .select('id, nome, email, whatsapp, asaas_id, user_id, data_criacao, created_at')
    .in('status', STATUS_EM_CONVERSAO)
  if (soCliente) queryCandidatos = queryCandidatos.eq('id', soCliente)
  const { data: candidatos } = await queryCandidatos

  const emConversao = ((candidatos ?? []) as (ClienteLead & { data_criacao: string | null; created_at: string | null })[])
    .filter((c) => {
      const criado = c.data_criacao ?? c.created_at
      return criado != null && criado < cutoff // já pode ter vencido
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

      const criado = c.data_criacao ?? c.created_at
      const abandonoHaTempo = criado != null && criado < abandonoCutoff

      const customerId = await resolverCustomerId(c)
      let arquivar: boolean
      if (customerId) {
        // Erro na consulta ao Asaas → NÃO arquiva (lado seguro).
        let sit: { pagou: boolean; temOverdue: boolean; temPendente: boolean }
        try { sit = await situacaoAsaas(customerId) } catch { continue }
        if (sit.pagou) continue                     // já pagou → churn/real
        if (sit.temOverdue) arquivar = true         // venceu e não pagou (D+4) → não convertido
        else if (sit.temPendente) arquivar = false  // ainda dentro do prazo (≤ vencimento)
        else arquivar = abandonoHaTempo             // cobrança sumiu do Asaas → abandono após N dias
      } else {
        // Sem vínculo no Asaas para checar: só o sinal do Hub (nunca pagou) + tempo.
        arquivar = abandonoHaTempo
      }
      if (!arquivar) continue

      arquivados.push({ id: c.id, nome: c.nome })
      if (!dryRun) await marcarNaoConvertido(supabase, c, customerId)
    }
  }

  // ── PASSO B: recuperar quem pagou depois ────────────────────────────────────
  let queryPerdidos = supabase
    .from('clientes')
    .select('id, nome, email, whatsapp, asaas_id, user_id')
    .eq('status', 'inativo')
    .eq('motivo_inativacao', 'nao_convertido')
  if (soCliente) queryPerdidos = queryPerdidos.eq('id', soCliente)
  const { data: perdidos } = await queryPerdidos

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
        try { pagou = (await situacaoAsaas(customerId)).pagou } catch { pagou = false }
      }
    }
    if (!pagou) continue

    recuperados.push({ id: c.id, nome: c.nome })
    if (!dryRun) await recuperarCliente(supabase, c)
  }

  return { ok: true, dry_run: dryRun, arquivados, recuperados }
}
