import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { criarClienteServiceRole } from '@/lib/supabase'
import { processarAlertasSaldo } from '@/lib/saldo-ads'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Alerta de saldo Google Ads — roda diariamente (dispatcher, 09:31 SP, job
 * 'saldo_baixo'). Dispara os emails de saldo baixo/zerado e a escalação ao
 * operador (lib/saldo-ads.ts). Pula domingo. Idempotente por dia.
 *
 * Auth: sessão (botão/debug) ou Bearer CRON_SECRET (agendado, GET).
 */

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const supabase = criarClienteServiceRole()
  return NextResponse.json(await processarAlertasSaldo(supabase))
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  // Usa service role para conseguir listar usuários (escalação) e gravar estado.
  return NextResponse.json(await processarAlertasSaldo(criarClienteServiceRole()))
}
