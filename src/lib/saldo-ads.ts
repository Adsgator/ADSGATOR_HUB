// ─── MOTOR DE ALERTA DE SALDO GOOGLE ADS ─────────────────────────────────────
// Varre os clientes com Google Ads e dispara os emails de saldo conforme a
// regra do Lucas:
//
//   • Saldo abaixo do mínimo (mas > 0): manda "saldo baixo" ao cliente 1x/dia,
//     pulando domingo. Faz isso por 3 dias. No 4º dia consecutivo, em vez do
//     email ao cliente, avisa o OPERADOR (notificação + email) para chamar o
//     cliente no WhatsApp — e não manda mais "saldo baixo" nesta sequência.
//   • Saldo zerado (<= 0): manda "saldo acabou" ao cliente e repete a cada 3
//     dias até recarregar (também pula domingo).
//   • Recarregou (saldo >= mínimo): reseta o estado — a próxima queda recomeça
//     a contagem do zero.
//
// O mínimo é por cliente (clientes.saldo_minimo_alerta) com fallback no mínimo
// global (configuracoes_operacional.alerta_saldo_ads_minimo). Clientes com
// saldo_alertas_ativos = false são ignorados (a pedido / em cancelamento).
//
// Roda pelo dispatcher (/api/v1/cron/dispatch, job 'saldo_baixo', 09:31 SP).
// Idempotente por dia (saldo_alerta_estado.ultimo_disparo_dia).

import type { SupabaseClient } from '@supabase/supabase-js'
import { dispararEmailAutomatico } from '@/lib/email-automation'

/** Quantos avisos de "saldo baixo" ao cliente antes de escalar para o operador. */
const MAX_AVISOS_BAIXO = 3
/** Intervalo (dias) entre repetições do email de "saldo acabou". */
const INTERVALO_ZERADO_DIAS = 3

interface ClienteSaldo {
  id: string
  nome: string
  email: string | null
  whatsapp: string | null
  saldo_google: number | null
  saldo_minimo_alerta: number | null
  saldo_alertas_ativos: boolean | null
}

interface EstadoSaldo {
  cliente_id: string
  fase: 'ok' | 'baixo' | 'zerado'
  avisos_baixo: number
  operador_avisado: boolean
  ultimo_disparo_dia: string | null
  ultimo_zerado_dia: string | null
}

export interface ResultadoSaldo {
  cliente: string
  acao: 'saldo_baixo' | 'escalou_operador' | 'saldo_zerado' | 'reset' | 'nada'
  enviado?: boolean
  motivo?: string
}

/** Data de hoje em America/Sao_Paulo (YYYY-MM-DD). */
function hojeSP(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

/** É domingo em America/Sao_Paulo? */
function ehDomingoSP(): boolean {
  const sp = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  return sp.getDay() === 0
}

/** Dias inteiros entre duas datas YYYY-MM-DD. */
function diasEntre(a: string, b: string): number {
  return Math.round((new Date(`${b}T12:00:00`).getTime() - new Date(`${a}T12:00:00`).getTime()) / 86_400_000)
}

export async function processarAlertasSaldo(
  db: SupabaseClient,
): Promise<{ resultados: ResultadoSaldo[]; pulado?: string }> {
  // Domingo: não dispara nada (a regra pula domingo). O dia volta a contar na
  // segunda — não incrementa avisos nem repete o zerado.
  if (ehDomingoSP()) return { resultados: [], pulado: 'domingo' }

  const hoje = hojeSP()

  // Mínimo global como fallback.
  const { data: cfg } = await db
    .from('configuracoes_operacional')
    .select('alerta_saldo_ads_minimo')
    .eq('agencia_id', 'adsgator-main')
    .maybeSingle()
  const minimoGlobal = Number(cfg?.alerta_saldo_ads_minimo) || 50

  // Clientes elegíveis: Google Ads ligado e alertas de saldo não desativados.
  const { data: clientesRaw } = await db
    .from('clientes')
    .select('id, nome, email, whatsapp, saldo_google, saldo_minimo_alerta, saldo_alertas_ativos')
    .eq('google_ads_enabled', true)
    .not('google_ads_customer_id', 'is', null)

  const clientes = (clientesRaw ?? []).filter(
    (c) => (c as ClienteSaldo).saldo_alertas_ativos !== false,
  ) as ClienteSaldo[]
  if (clientes.length === 0) return { resultados: [] }

  // Estado atual de cada cliente.
  const { data: estadosRaw } = await db
    .from('saldo_alerta_estado')
    .select('*')
    .in('cliente_id', clientes.map((c) => c.id))
  const estadoPorId = new Map<string, EstadoSaldo>(
    (estadosRaw ?? []).map((e) => [e.cliente_id as string, e as EstadoSaldo]),
  )

  const resultados: ResultadoSaldo[] = []

  for (const c of clientes) {
    const saldo = c.saldo_google ?? 0
    const minimo = c.saldo_minimo_alerta != null ? Number(c.saldo_minimo_alerta) : minimoGlobal
    const estado: EstadoSaldo = estadoPorId.get(c.id) ?? {
      cliente_id: c.id, fase: 'ok', avisos_baixo: 0,
      operador_avisado: false, ultimo_disparo_dia: null, ultimo_zerado_dia: null,
    }

    // ── Recarregou: saldo de volta acima do mínimo → reseta ──
    if (saldo >= minimo) {
      if (estado.fase !== 'ok') {
        await salvarEstado(db, { ...estado, fase: 'ok', avisos_baixo: 0, operador_avisado: false, ultimo_disparo_dia: null, ultimo_zerado_dia: null })
        resultados.push({ cliente: c.nome, acao: 'reset' })
      }
      continue
    }

    // Já disparamos hoje para este cliente? (idempotência diária)
    if (estado.ultimo_disparo_dia === hoje) {
      resultados.push({ cliente: c.nome, acao: 'nada', motivo: 'ja_rodou_hoje' })
      continue
    }

    // ── Saldo zerado: email "acabou" e repete a cada N dias ──
    if (saldo <= 0) {
      const podeRepetir = !estado.ultimo_zerado_dia || diasEntre(estado.ultimo_zerado_dia, hoje) >= INTERVALO_ZERADO_DIAS
      if (!podeRepetir) {
        resultados.push({ cliente: c.nome, acao: 'nada', motivo: 'zerado_aguardando_intervalo' })
        continue
      }
      const r = await dispararEmailAutomatico(db, {
        tipo: 'email_saldo_ads',
        templateId: 'alert-saldo-zerado',
        destinatario: c.email ?? '',
        clienteId: c.id,
        variables: { nome_cliente: c.nome, saldo_atual: `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
      })
      await salvarEstado(db, { ...estado, fase: 'zerado', ultimo_disparo_dia: hoje, ultimo_zerado_dia: hoje })
      resultados.push({ cliente: c.nome, acao: 'saldo_zerado', enviado: r.enviado, motivo: r.motivo })
      continue
    }

    // ── Saldo baixo (0 < saldo < mínimo) ──
    // Mudança de sequência: se vinha de zerado/ok, recomeça a contagem.
    const avisos = estado.fase === 'baixo' ? estado.avisos_baixo : 0

    if (avisos >= MAX_AVISOS_BAIXO) {
      // Já mandou os 3 avisos. Escala para o operador uma única vez.
      if (!estado.operador_avisado) {
        await avisarOperador(db, c, saldo, minimo)
        await salvarEstado(db, { ...estado, fase: 'baixo', operador_avisado: true, ultimo_disparo_dia: hoje })
        resultados.push({ cliente: c.nome, acao: 'escalou_operador' })
      } else {
        resultados.push({ cliente: c.nome, acao: 'nada', motivo: 'operador_ja_avisado' })
      }
      continue
    }

    // Aviso de "saldo baixo" ao cliente (conta um a mais).
    const r = await dispararEmailAutomatico(db, {
      tipo: 'email_saldo_ads',
      templateId: 'alert-saldo-baixo',
      destinatario: c.email ?? '',
      clienteId: c.id,
      variables: { nome_cliente: c.nome, saldo_atual: `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    })
    await salvarEstado(db, { ...estado, fase: 'baixo', avisos_baixo: avisos + 1, operador_avisado: false, ultimo_disparo_dia: hoje, ultimo_zerado_dia: null })
    resultados.push({ cliente: c.nome, acao: 'saldo_baixo', enviado: r.enviado, motivo: r.motivo })
  }

  return { resultados }
}

async function salvarEstado(db: SupabaseClient, estado: EstadoSaldo): Promise<void> {
  await db.from('saldo_alerta_estado').upsert(
    { ...estado, updated_at: new Date().toISOString() },
    { onConflict: 'cliente_id' },
  )
}

/** 4º dia de saldo baixo: avisa o OPERADOR (notificação in-app + email direto)
 *  para chamar o cliente no WhatsApp. É um aviso interno, não um template de
 *  cliente — vai por email simples ao ALERT_EMAIL, sem passar por toggle. */
async function avisarOperador(
  db: SupabaseClient,
  cliente: ClienteSaldo,
  saldo: number,
  minimo: number,
): Promise<void> {
  const saldoFmt = `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  const minimoFmt = `R$ ${minimo.toLocaleString('pt-BR')}`
  const wppNum = cliente.whatsapp?.replace(/\D/g, '')
  const wppLink = wppNum ? `https://wa.me/55${wppNum}` : null

  // Notificação in-app — dono = primeiro usuário (single-operator).
  const { data: lista } = await db.auth.admin.listUsers({ page: 1, perPage: 1 })
  const ownerId = lista?.users?.[0]?.id
  if (ownerId) {
    await db.from('notificacoes').insert({
      user_id: ownerId,
      tipo: 'alerta',
      titulo: `💸 ${cliente.nome} — 3 avisos de saldo baixo sem reação`,
      mensagem: `Já enviei 3 emails de saldo baixo para ${cliente.nome} e o saldo segue em ${saldoFmt} (mínimo ${minimoFmt}). Hora de chamar no WhatsApp.${wppLink ? `\n\n${wppLink}` : ''}`,
      lida: false,
    })
  }

  // Email direto ao operador (não é template de cliente — não usa toggle).
  const destinoOperador = process.env.ALERT_EMAIL
  if (destinoOperador) {
    try {
      const { sendEmail } = await import('@/lib/email')
      await sendEmail({
        to: destinoOperador,
        subject: `Saldo baixo persistente — ${cliente.nome}`,
        html: `<p>Já enviei 3 emails de saldo baixo para <strong>${cliente.nome}</strong> e o saldo segue em <strong>${saldoFmt}</strong> (mínimo ${minimoFmt}).</p><p>Hora de chamar no WhatsApp${wppLink ? `: <a href="${wppLink}">${wppLink}</a>` : '.'}</p>`,
      })
    } catch (err) {
      console.error('Falha ao avisar operador sobre saldo baixo:', err)
    }
  }
}
