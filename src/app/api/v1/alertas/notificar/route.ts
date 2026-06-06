import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { criarClienteServiceRole } from '@/lib/supabase'
import { dispararEmailAutomatico, automacaoAtiva } from '@/lib/email-automation'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Alertas internos por email (para o OPERADOR, não para o cliente).
 *
 * Pega alertas não resolvidos ainda não notificados por email e envia um resumo
 * ao operador. Só envia se a automação 'email_alerta_critico' estiver ativa.
 *
 * Destinatário: env ALERT_EMAIL (ou, no modo sessão, o email do usuário logado).
 *
 * Auth: sessão (botão) ou Bearer CRON_SECRET (agendado, GET).
 */

async function executar(
  supabase: Parameters<typeof dispararEmailAutomatico>[0],
  destinatarioFallback?: string,
) {
  if (!(await automacaoAtiva(supabase, 'email_alerta_critico'))) {
    return { ativa: false, enviado: false }
  }

  const destinatario = process.env.ALERT_EMAIL || destinatarioFallback || ''
  if (!destinatario) {
    return { ativa: true, enviado: false, motivo: 'sem_destinatario' }
  }

  // Alertas críticos não resolvidos e ainda não notificados por email.
  const { data: alertas } = await supabase
    .from('alertas')
    .select('id, tipo, mensagem, cliente_id')
    .eq('resolvido', false)
    .eq('email_enviado', false)
    .limit(50)

  if (!alertas || alertas.length === 0) {
    return { ativa: true, enviado: false, motivo: 'sem_alertas' }
  }

  const linhas = alertas
    .map((a) => `<li><strong>${a.tipo}</strong>: ${a.mensagem}</li>`)
    .join('')

  const r = await dispararEmailAutomatico(supabase, {
    tipo: 'email_alerta_critico',
    templateId: 'alert-performance',
    destinatario,
    variables: {
      nome_cliente: 'Operação AdsGator',
      metrica: `${alertas.length} alerta(s) pendente(s)`,
      valor_atual: '',
      valor_referencia: `<ul>${linhas}</ul>`,
    },
  })

  // Marca como notificados para não reenviar.
  if (r.enviado) {
    await supabase
      .from('alertas')
      .update({ email_enviado: true })
      .in('id', alertas.map((a) => a.id))
  }

  return { ativa: true, enviado: r.enviado, total: alertas.length, motivo: r.motivo }
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
  return NextResponse.json(await executar(supabase, user.email))
}
