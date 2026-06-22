import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const clienteId = searchParams.get('clienteId')

  let query = supabase
    .from('timeline_instances')
    .select('*, template:timeline_templates(*)')
    .neq('status', 'archived')

  if (type) query = query.eq('type', type)
  if (clienteId) {
    query = query.eq('client_id', clienteId)
  } else {
    // Return instances belonging to the current user's clients
    const { data: clienteIds } = await supabase
      .from('clientes')
      .select('id')
      .eq('user_id', user.id)

    const ids = (clienteIds ?? []).map((c: { id: string }) => c.id)
    if (ids.length > 0) {
      query = query.or(`client_id.in.(${ids.join(',')}),client_id.is.null`)
    } else {
      query = query.is('client_id', null)
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { template_id, client_id, type } = body

  // Fetch template to get first step + type (instance.type é NOT NULL e segue o
  // do template; não depende do chamador enviar)
  const { data: template, error: tError } = await supabase
    .from('timeline_templates')
    .select('steps, type')
    .eq('id', template_id)
    .single()

  if (tError || !template) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })

  const steps = (template.steps ?? []) as Array<{ id: string; order: number }>
  const sorted = [...steps].sort((a, b) => a.order - b.order)
  const firstStep = sorted[0]

  const { data, error } = await supabase
    .from('timeline_instances')
    .insert([{
      template_id,
      client_id: client_id ?? null,
      type: type ?? template.type,
      current_step_id: firstStep?.id ?? null,
      status: 'active',
    }])
    .select('*, template:timeline_templates(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
