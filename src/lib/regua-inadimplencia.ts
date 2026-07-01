import type { SupabaseClient } from '@supabase/supabase-js'
import { asaasRequest, removerCobrancasEmAberto, buscarLinkPagamento, type RemocaoCobrancas } from '@/lib/asaas'
import { enviarEmailManual, automacaoAtiva } from '@/lib/email-automation'
import {
  diasAtrasoCliente,
  estagioInadimplencia,
  carregarLimiaresAtraso,
  type LimiaresAtraso,
} from '@/lib/cobranca'

/**
 * Régua de inadimplência alinhada aos termos da Adsgator (D+7/D+15/D+28).
 *
 * Ações graves NUNCA disparam sozinhas: cada etapa só age com o seu toggle
 * ligado (automation_settings, default off) e o D+7 ainda exige a autorização
 * do Lucas (cria uma pendência em vez de agir). As ações tocam o Asaas de
 * verdade (pausar/remover cobrança/deletar assinatura) e usam os templates de
 * cobrança já existentes para avisar o cliente.
 *
 * - D+7  suspender:     pausa a recorrência (PUT INACTIVE) + remove a próxima
 *                       cobrança NÃO-vencida (a vencida é dívida real, fica) +
 *                       status 'pausada' + email de indisponibilidade.
 * - D+15 cancelar_admin: garante a recorrência pausada + status 'cancelado_admin'
 *                       + email de cancelamento.
 * - D+28 excluir:       remove TODAS as cobranças em aberto + DELETE da
 *                       assinatura + cliente inativo/débito + email + checklist
 *                       manual pro Lucas (remover assets/dados do servidor).
 * - reativar:           PUT ACTIVE + nextDueDate (próximo ciclo) — ao pagar ou
 *                       manualmente.
 */

export type EtapaRegua = 'suspender' | 'cancelar_admin' | 'excluir' | 'reativar'

export interface ResultadoEtapa {
  ok: boolean
  clienteId: string
  etapa: EtapaRegua
  /** idempotência: já estava no estado-alvo, nada a fazer */
  jaEstava?: boolean
  /** motivo quando ok=false (ou aviso quando ok=true mas houve falha parcial) */
  motivo?: string
  asaasPausada?: boolean
  asaasReativada?: boolean
  assinaturaDeletada?: boolean
  cobrancas?: RemocaoCobrancas
  emailEnviado?: boolean
  emailErro?: string
}

interface AssinaturaRow {
  id: string
  cliente_id: string
  status: string
  asaas_subscription_id: string | null
  valor_mensal: number | null
  data_proxima_cobranca: string | null
}
interface ClienteRow {
  id: string
  nome: string
  email: string | null
  dias_atraso: number | null
  data_vencimento: string | null
  status: string
}

/** Status de assinatura já encerrados — a régua não reprocessa. */
const STATUS_TERMINAIS = ['cancelada', 'deletada', 'cancelado_debito']

async function carregar(db: SupabaseClient, clienteId: string): Promise<{ ass: AssinaturaRow | null; cli: ClienteRow | null }> {
  const [{ data: ass }, { data: cli }] = await Promise.all([
    db.from('assinaturas')
      .select('id, cliente_id, status, asaas_subscription_id, valor_mensal, data_proxima_cobranca')
      .eq('cliente_id', clienteId)
      .maybeSingle(),
    db.from('clientes')
      .select('id, nome, email, dias_atraso, data_vencimento, status')
      .eq('id', clienteId)
      .maybeSingle(),
  ])
  return { ass: ass as AssinaturaRow | null, cli: cli as ClienteRow | null }
}

function fmtData(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR')
}

/** Data (YYYY-MM-DD) do próximo ciclo, exigida pelo Asaas ao reativar. */
function proximaCobranca(diasFrente = 30): string {
  const d = new Date()
  d.setDate(d.getDate() + diasFrente)
  return d.toISOString().split('T')[0]
}

/**
 * Envia um email da régua usando os templates de cobrança já existentes.
 * Não checa toggle (a etapa que chama já está atrás do seu toggle); respeita o
 * MODO TESTE e loga em email_logs via enviarEmailManual. Nunca lança.
 */
async function enviarEmailRegua(
  db: SupabaseClient,
  cli: ClienteRow,
  venc: string | null,
  templateId: 'aviso-indisponibilidade' | 'cancelamento-notice' | 'exclusao-notice',
  extraVars: Record<string, string> = {},
): Promise<{ enviado: boolean; erro?: string }> {
  if (!cli.email) return { enviado: false, erro: 'cliente sem email cadastrado' }
  const pagamento_url = await buscarLinkPagamento(db, cli.id, 'overdue').catch(() => '')
  try {
    await enviarEmailManual(db, {
      templateId,
      destinatario: cli.email,
      clienteId: cli.id,
      variables: {
        nome_cliente: cli.nome,
        data_vencimento: fmtData(venc),
        pagamento_url,
        ...extraVars,
      },
    })
    return { enviado: true }
  } catch (err) {
    return { enviado: false, erro: err instanceof Error ? err.message : String(err) }
  }
}

async function historico(db: SupabaseClient, clienteId: string, tipo: string, descricao: string, valor: number | null, metadata: Record<string, unknown>) {
  await db.from('historico_acoes').insert({
    cliente_id: clienteId, tipo_acao: tipo, descricao, valor_impactado: valor, metadata,
  })
}

/**
 * Pausa a recorrência da assinatura no Asaas. Por padrão remove só as cobranças
 * NÃO-vencidas (PRESERVA a vencida — dívida real). Idempotente no Asaas:
 * re-PUT INACTIVE não tem efeito colateral.
 */
async function pausarNoAsaas(subscriptionId: string, incluirVencidas = false): Promise<{ cobrancas: RemocaoCobrancas }> {
  const cobrancas = await removerCobrancasEmAberto(subscriptionId, { incluirVencidas })
  await asaasRequest('PUT', `/v3/subscriptions/${subscriptionId}`, { status: 'INACTIVE' })
  return { cobrancas }
}

/**
 * SUSPENDER (D+7) — também usada como "Pausar" manual. Requer autorização do
 * Lucas quando vem da régua (a pendência é criada antes). `enviarEmail`:
 * dispara o aviso de indisponibilidade (régua) ou não (pausa manual).
 */
export async function suspenderAssinatura(
  db: SupabaseClient,
  clienteId: string,
  opts: { enviarEmail?: boolean; origem?: string } = {},
): Promise<ResultadoEtapa> {
  const r: ResultadoEtapa = { ok: false, clienteId, etapa: 'suspender' }
  const { ass, cli } = await carregar(db, clienteId)
  if (!ass) { r.motivo = 'cliente sem assinatura'; return r }
  if (ass.status === 'pausada') { r.ok = true; r.jaEstava = true; return r }
  if (STATUS_TERMINAIS.includes(ass.status)) { r.motivo = `assinatura ${ass.status}`; return r }
  if (!ass.asaas_subscription_id) { r.motivo = 'assinatura sem id no Asaas'; return r }

  try {
    const { cobrancas } = await pausarNoAsaas(ass.asaas_subscription_id, false)
    r.cobrancas = cobrancas
    r.asaasPausada = true
  } catch (err) {
    r.motivo = `Asaas: ${err instanceof Error ? err.message : String(err)}`
    return r
  }

  await db.from('assinaturas').update({ status: 'pausada', updated_at: new Date().toISOString() }).eq('id', ass.id)

  if (opts.enviarEmail && cli) {
    const venc = cli.data_vencimento ?? ass.data_proxima_cobranca ?? null
    const e = await enviarEmailRegua(db, cli, venc, 'aviso-indisponibilidade')
    r.emailEnviado = e.enviado
    r.emailErro = e.erro
  }

  const nRem = r.cobrancas?.removidas.length ?? 0
  const nFalha = r.cobrancas?.falhas.length ?? 0
  await historico(db, clienteId, 'regua_suspensao_d7',
    `⏸️ Serviços suspensos por inadimplência (D+7). Recorrência pausada no Asaas; ${nRem} cobrança(s) não-vencida(s) removida(s)${nFalha ? `, ${nFalha} falha(s)` : ''}. Cobrança vencida mantida em aberto.`,
    ass.valor_mensal, { origem: opts.origem ?? 'regua', cobrancas: r.cobrancas })
  if (nFalha > 0) r.motivo = `${nFalha} cobrança(s) não removida(s) — conferir no Asaas`
  r.ok = true
  return r
}

/**
 * CANCELAR ADMINISTRATIVAMENTE (D+15) — automático (toggle on). Garante a
 * recorrência pausada no Asaas se o D+7 não tiver sido autorizado (senão o
 * cancelamento administrativo deixaria a cobrança recorrente viva), marca
 * 'cancelado_admin' e avisa o cliente.
 */
export async function cancelarAdminAssinatura(db: SupabaseClient, clienteId: string): Promise<ResultadoEtapa> {
  const r: ResultadoEtapa = { ok: false, clienteId, etapa: 'cancelar_admin' }
  const { ass, cli } = await carregar(db, clienteId)
  if (!ass) { r.motivo = 'cliente sem assinatura'; return r }
  if (ass.status === 'cancelado_admin') { r.ok = true; r.jaEstava = true; return r }
  if (STATUS_TERMINAIS.includes(ass.status)) { r.motivo = `assinatura ${ass.status}`; return r }

  // Se ainda não foi pausada (D+7 não autorizado), pausa agora — cancelamento
  // administrativo tem de parar a cobrança recorrente.
  if (ass.status !== 'pausada' && ass.asaas_subscription_id) {
    try {
      const { cobrancas } = await pausarNoAsaas(ass.asaas_subscription_id, false)
      r.cobrancas = cobrancas
      r.asaasPausada = true
    } catch (err) {
      r.motivo = `Asaas: ${err instanceof Error ? err.message : String(err)}`
      return r
    }
  }

  await db.from('assinaturas').update({ status: 'cancelado_admin', updated_at: new Date().toISOString() }).eq('id', ass.id)

  if (cli) {
    const venc = cli.data_vencimento ?? ass.data_proxima_cobranca ?? null
    const e = await enviarEmailRegua(db, cli, venc, 'cancelamento-notice', { data_desativacao: fmtData(venc) })
    r.emailEnviado = e.enviado
    r.emailErro = e.erro
  }

  await historico(db, clienteId, 'regua_cancelamento_admin',
    '🔴 Cancelamento administrativo do contrato (D+15) por inadimplência. Cliente notificado.',
    ass.valor_mensal, { cobrancas: r.cobrancas ?? null })
  r.ok = true
  return r
}

/**
 * EXCLUIR (D+28) — automático (toggle on), mas exibido pro Lucas com o que foi
 * feito + checklist manual. Remove TODAS as cobranças em aberto (incl. vencida),
 * deleta a assinatura no Asaas, arquiva o cliente (inativo/débito) e notifica.
 */
export async function excluirAssinatura(db: SupabaseClient, clienteId: string): Promise<ResultadoEtapa> {
  const r: ResultadoEtapa = { ok: false, clienteId, etapa: 'excluir' }
  const { ass, cli } = await carregar(db, clienteId)
  if (!ass) { r.motivo = 'cliente sem assinatura'; return r }
  if (ass.status === 'deletada') { r.ok = true; r.jaEstava = true; return r }

  if (ass.asaas_subscription_id) {
    try {
      r.cobrancas = await removerCobrancasEmAberto(ass.asaas_subscription_id, { incluirVencidas: true })
      await asaasRequest('DELETE', `/v3/subscriptions/${ass.asaas_subscription_id}`)
      r.assinaturaDeletada = true
    } catch (err) {
      r.motivo = `Asaas: ${err instanceof Error ? err.message : String(err)}`
      return r
    }
  }

  await db.from('assinaturas').update({ status: 'deletada', updated_at: new Date().toISOString() }).eq('id', ass.id)
  await db.from('clientes').update({
    status: 'inativo', motivo_inativacao: 'debito', inativado_em: new Date().toISOString(),
  }).eq('id', clienteId)

  if (cli) {
    const venc = cli.data_vencimento ?? ass.data_proxima_cobranca ?? null
    const e = await enviarEmailRegua(db, cli, venc, 'exclusao-notice')
    r.emailEnviado = e.enviado
    r.emailErro = e.erro

    // Notificação detalhada pro Lucas: o que foi feito + checklist manual.
    const nRem = r.cobrancas?.removidas.length ?? 0
    const nFalha = r.cobrancas?.falhas.length ?? 0
    const { data: ownerRow } = await db.from('clientes').select('user_id').eq('id', clienteId).maybeSingle()
    await db.from('notificacoes').insert({
      user_id:    (ownerRow as { user_id?: string } | null)?.user_id ?? null,
      cliente_id: clienteId,
      tipo:       'urgente',
      titulo:     `${cli.nome} — exclusão por inadimplência (D+28)`,
      mensagem:   `Feito automaticamente: assinatura deletada no Asaas, ${nRem} cobrança(s) removida(s)${nFalha ? ` (${nFalha} falha — conferir)` : ''}, cliente arquivado. Pendente MANUAL (conforme termos): remover landing page, arquivos e dados do cliente do servidor/Storage e revogar acessos.`,
      acao_url:   `/clientes/${clienteId}`,
      acao_label: 'Ver cliente',
    })
  }

  await historico(db, clienteId, 'regua_exclusao_d28',
    '❌ Exclusão por inadimplência (D+28): assinatura e cobranças removidas no Asaas, cliente arquivado. Pendente remoção manual de assets/dados do servidor.',
    ass.valor_mensal, { cobrancas: r.cobrancas ?? null })
  r.ok = true
  return r
}

/**
 * REATIVAR — PUT ACTIVE + nextDueDate (obrigatório no Asaas). Usada ao pagar
 * (reativação automática) e no botão manual. Religa a assinatura (status 'ativa',
 * atraso zerado) e, se o cliente estava arquivado por débito, reativa o cliente.
 */
export async function reativarAssinatura(
  db: SupabaseClient,
  clienteId: string,
  opts: { origem?: string } = {},
): Promise<ResultadoEtapa> {
  const r: ResultadoEtapa = { ok: false, clienteId, etapa: 'reativar' }
  const { ass, cli } = await carregar(db, clienteId)
  if (!ass) { r.motivo = 'cliente sem assinatura'; return r }
  if (ass.status === 'deletada') { r.motivo = 'assinatura deletada no Asaas — recriar pelo checkout'; return r }
  if (ass.status === 'ativa') { r.ok = true; r.jaEstava = true; return r }

  const nextDueDate = proximaCobranca()
  if (ass.asaas_subscription_id) {
    try {
      await asaasRequest('PUT', `/v3/subscriptions/${ass.asaas_subscription_id}`, { status: 'ACTIVE', nextDueDate })
      r.asaasReativada = true
    } catch (err) {
      r.motivo = `Asaas: ${err instanceof Error ? err.message : String(err)}`
      return r
    }
  }

  await db.from('assinaturas').update({
    status: 'ativa', dias_atraso: 0,
    data_proxima_cobranca: new Date(`${nextDueDate}T12:00:00`).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', ass.id)

  // Religa o cliente: zera atraso/vencimento e desarquiva se estava em débito.
  const updatesCli: Record<string, unknown> = { dias_atraso: 0, data_vencimento: null }
  if (cli && cli.status === 'inativo') {
    updatesCli.status = 'ativo'
    updatesCli.motivo_inativacao = null
    updatesCli.inativado_em = null
  }
  await db.from('clientes').update(updatesCli).eq('id', clienteId)

  await historico(db, clienteId, 'regua_reativacao',
    `▶️ Assinatura reativada (${opts.origem ?? 'manual'}). Próxima cobrança em ${fmtData(nextDueDate)}.`,
    ass.valor_mensal, { origem: opts.origem ?? 'manual', nextDueDate })
  r.ok = true
  return r
}

// ─── Processador da régua (cron/dispatcher) ─────────────────────────────────

const TIPO_PENDENCIA_D7 = 'aprovacao_suspensao_d7'

export interface ResumoRegua {
  ativa: { d7: boolean; d15: boolean; d28: boolean }
  pendencias_d7_criadas: number
  cancelamentos_admin: number
  exclusoes: number
  detalhes: ResultadoEtapa[]
  erros: { clienteId: string; etapa: string; motivo: string }[]
}

/**
 * Cria (idempotente) a pendência de aprovação do D+7 na tabela `alertas`:
 * só insere se não houver uma não-resolvida para o cliente, evitando duplicar
 * a cada run do cron. O Lucas autoriza pelo banner do detalhe / aba Alertas.
 */
async function garantirPendenciaD7(db: SupabaseClient, c: ClienteRow, dias: number): Promise<boolean> {
  // Assinatura já tratada (suspensa/cancelada/deletada) → o D+7 já foi resolvido
  // (pela régua ou manualmente via Pausar) — não pede autorização de novo.
  const { data: ass } = await db.from('assinaturas').select('status').eq('cliente_id', c.id).maybeSingle()
  if (ass && STATUS_TERMINAIS.concat('pausada', 'cancelado_admin').includes((ass as { status: string }).status)) return false

  // Já existe pendência DESTE ciclo de dívida — aberta OU já dispensada/autorizada
  // após o vencimento atual? Não recria (respeita o "Autorizar"/"Dispensar"
  // manual). Se o cliente pagar e voltar a atrasar (vencimento novo), aí sim cria.
  const { data: ult } = await db
    .from('alertas')
    .select('resolvido, created_at')
    .eq('cliente_id', c.id)
    .eq('tipo_alerta', TIPO_PENDENCIA_D7)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (ult) {
    const u = ult as { resolvido: boolean; created_at: string }
    if (!u.resolvido) return false
    if (c.data_vencimento && new Date(u.created_at).getTime() >= new Date(`${c.data_vencimento}T00:00:00`).getTime()) return false
  }

  await db.from('alertas').insert({
    cliente_id:  c.id,
    tipo_alerta: TIPO_PENDENCIA_D7,
    mensagem:    `${c.nome} está há ${dias} dias em atraso (D+7). Autorize a suspensão dos serviços para pausar a cobrança e a entrega.`,
    dispara_em:  new Date().toISOString(),
    disparado:   false,
    resolvido:   false,
  })
  return true
}

/**
 * Processa a régua para todos os clientes em atraso, respeitando os toggles.
 * Roda depois de sincronizarAtrasos (que grava dias_atraso/data_vencimento).
 * D+7 cria pendência de aprovação (não age); D+15 e D+28 agem automaticamente
 * quando o toggle está ligado. Tudo idempotente.
 */
export async function processarReguaInadimplencia(
  db: SupabaseClient,
  limiares?: LimiaresAtraso,
): Promise<ResumoRegua> {
  const lim = limiares ?? await carregarLimiaresAtraso(db)
  const [d7, d15, d28] = await Promise.all([
    automacaoAtiva(db, 'regua_d7'),
    automacaoAtiva(db, 'regua_d15'),
    automacaoAtiva(db, 'regua_d28'),
  ])

  const resumo: ResumoRegua = {
    ativa: { d7, d15, d28 },
    pendencias_d7_criadas: 0, cancelamentos_admin: 0, exclusoes: 0,
    detalhes: [], erros: [],
  }
  if (!d7 && !d15 && !d28) return resumo

  const { data: clientes } = await db
    .from('clientes')
    .select('id, nome, email, dias_atraso, data_vencimento, status')
    .gt('dias_atraso', 0)
    .neq('status', 'inativo')
    .neq('regua_isento', true)   // contratos especiais isentos da régua automática

  for (const c of (clientes ?? []) as ClienteRow[]) {
    const dias = diasAtrasoCliente(c)
    const estagio = estagioInadimplencia(dias, lim)
    try {
      if (estagio === 'critico') {
        if (!d28) continue
        const r = await excluirAssinatura(db, c.id)
        resumo.detalhes.push(r)
        if (r.ok && !r.jaEstava) resumo.exclusoes++
        if (!r.ok) resumo.erros.push({ clienteId: c.id, etapa: 'excluir', motivo: r.motivo ?? '' })
      } else if (estagio === 'grave') {
        if (!d15) continue
        const r = await cancelarAdminAssinatura(db, c.id)
        resumo.detalhes.push(r)
        if (r.ok && !r.jaEstava) resumo.cancelamentos_admin++
        if (!r.ok) resumo.erros.push({ clienteId: c.id, etapa: 'cancelar_admin', motivo: r.motivo ?? '' })
      } else if (estagio === 'suspensao') {
        if (!d7) continue
        if (await garantirPendenciaD7(db, c, dias)) resumo.pendencias_d7_criadas++
      }
    } catch (err) {
      resumo.erros.push({ clienteId: c.id, etapa: estagio, motivo: err instanceof Error ? err.message : String(err) })
    }
  }
  return resumo
}

/**
 * Autoriza a suspensão D+7 de um cliente (chamada pelo botão do Lucas):
 * executa a suspensão COM email e marca a pendência como resolvida.
 */
export async function autorizarSuspensaoD7(db: SupabaseClient, clienteId: string): Promise<ResultadoEtapa> {
  const r = await suspenderAssinatura(db, clienteId, { enviarEmail: true, origem: 'autorizacao_d7' })
  if (r.ok) {
    await db.from('alertas')
      .update({ resolvido: true, disparado: true, data_disparo: new Date().toISOString() })
      .eq('cliente_id', clienteId)
      .eq('tipo_alerta', TIPO_PENDENCIA_D7)
      .eq('resolvido', false)
  }
  return r
}

/**
 * Dispensa a pendência D+7 SEM agir (o Lucas tratou por fora — falou com o
 * cliente, combinou pagamento etc.). Só marca a pendência como resolvida; a
 * régua não recria enquanto esta dívida seguir em aberto (se o cliente pagar e
 * voltar a atrasar, uma nova é criada). Não toca no Asaas nem suspende.
 */
export async function dispensarSuspensaoD7(db: SupabaseClient, clienteId: string): Promise<ResultadoEtapa> {
  const r: ResultadoEtapa = { ok: false, clienteId, etapa: 'suspender' }
  const { data: pend } = await db.from('alertas')
    .update({ resolvido: true, disparado: true, data_disparo: new Date().toISOString() })
    .eq('cliente_id', clienteId)
    .eq('tipo_alerta', TIPO_PENDENCIA_D7)
    .eq('resolvido', false)
    .select('id')
  if (!pend || pend.length === 0) { r.motivo = 'nenhuma pendência D+7 aberta'; return r }
  await historico(db, clienteId, 'regua_d7_dispensada',
    '☑️ Aviso de suspensão (D+7) dispensado manualmente — tratado por fora da régua.', null, {})
  r.ok = true
  r.jaEstava = true
  return r
}
