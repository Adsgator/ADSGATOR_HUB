import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CRON_TIPOS, type CronTipo } from '@/lib/cron-settings'

export const dynamic = 'force-dynamic'

/**
 * Configuração dos agendamentos (Configurações → Automações → Agendamentos).
 *
 * GET  — lista os 5 jobs de `cron_settings`.
 * PATCH — body { tipo, ativo?, horario? } atualiza um job. Auth: sessão.
 */

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('cron_settings')
    .select('*')
    .order('horario', { ascending: true })

  if (error) {
    // Tabela ainda não migrada — a UI mostra o aviso de migration pendente.
    return NextResponse.json({ settings: [], migration_pendente: true })
  }
  return NextResponse.json({ settings: data ?? [] })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json().catch(() => null) as
    { tipo?: string; ativo?: boolean; horario?: string } | null

  if (!body?.tipo || !CRON_TIPOS.includes(body.tipo as CronTipo)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }
  if (body.horario !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.horario)) {
    return NextResponse.json({ error: 'Horário inválido — use HH:mm' }, { status: 400 })
  }
  if (body.ativo === undefined && body.horario === undefined) {
    return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 })
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.ativo !== undefined) updates.ativo = body.ativo
  if (body.horario !== undefined) updates.horario = body.horario

  const { data, error } = await supabase
    .from('cron_settings')
    .update(updates)
    .eq('tipo', body.tipo)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ setting: data })
}
