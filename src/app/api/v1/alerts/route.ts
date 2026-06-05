import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const clienteId = searchParams.get('clienteId')
  const includeHistory = searchParams.get('history') === 'true'

  // Fetch configured alerts
  let alertsQuery = supabase.from('timeline_alerts').select('*').eq('enabled', true)
  if (clienteId) {
    alertsQuery = alertsQuery.or(`client_id.eq.${clienteId},client_id.is.null`)
  }
  const { data: alerts, error: alertsError } = await alertsQuery.order('created_at', { ascending: false })
  if (alertsError) return NextResponse.json({ error: alertsError.message }, { status: 500 })

  let history = null
  if (includeHistory) {
    let histQuery = supabase
      .from('timeline_alert_history')
      .select('*')
      .order('triggered_at', { ascending: false })
      .limit(50)

    if (clienteId) histQuery = histQuery.eq('client_id', clienteId)
    const { data } = await histQuery
    history = data
  }

  return NextResponse.json({ data: alerts ?? [], history })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('timeline_alerts')
    .insert([{ ...body, created_by: user.id }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
