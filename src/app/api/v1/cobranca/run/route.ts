import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { criarClienteServiceRole } from '@/lib/supabase'
import { dispararEmailAutomatico, automacaoAtiva } from '@/lib/email-automation'
import { estagioInadimplencia } from '@/lib/cobranca'
import type { EmailTemplateId } from '@/lib/types/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Régua de cobrança por email.
 *
 * Percorre clientes inadimplentes e dispara o email correspondente ao estágio
 * de atraso (lib/cobranca.ts). Só envia se a automação 'email_cobranca_vencida'
 * estiver ativa — caso contrário, não faz nada.
 *
 * Mapa estágio → template:
 *  - suspensao (D+7)  → payment-reminder
 *  - grave (D+15)     → payment-followup
 *  - critico (D+30)   → payment-followup
 *  (atencao D+1..6 não dispara email — muito cedo)
 *
 * Auth: sessão (botão) ou Bearer CRON_SECRET (agendado, GET).
 */

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
  // Curto-circuito: se a automação está desligada, nem busca clientes.
  if (!(await automacaoAtiva(supabase, 'email_cobranca_vencida'))) {
    return { ativa: false, enviados: 0, resultados: [] }
  }

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome, email, dias_atraso, mrr')
    .gt('dias_atraso', 0)

  const resultados: Array<{ cliente: string; estagio: string; enviado: boolean; motivo?: string }> = []
  let enviados = 0

  for (const c of (clientes ?? []) as ClienteCobranca[]) {
    const estagio = estagioInadimplencia(c.dias_atraso)
    const templateId = TEMPLATE_POR_ESTAGIO[estagio]
    if (!templateId) continue

    const r = await dispararEmailAutomatico(supabase, {
      tipo: 'email_cobranca_vencida',
      templateId,
      destinatario: c.email,
      clienteId: c.id,
      variables: {
        nome_cliente: c.nome,
        dias_atraso: String(c.dias_atraso ?? 0),
        valor: c.mrr != null ? `R$ ${c.mrr.toLocaleString('pt-BR')}` : '—',
      },
    })
    if (r.enviado) enviados++
    resultados.push({ cliente: c.nome, estagio, enviado: r.enviado, motivo: r.motivo })
  }

  return { ativa: true, enviados, resultados }
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
