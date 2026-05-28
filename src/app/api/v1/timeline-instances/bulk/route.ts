import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

// POST /api/v1/timeline-instances/bulk
// Creates multiple timeline instances (e.g., activate a template for all clients)
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { template_id, client_ids, type } = body as {
    template_id: string
    client_ids?: string[]
    type: string
  }

  // Fetch template
  const { data: template, error: tError } = await supabase
    .from('timeline_templates')
    .select('steps')
    .eq('id', template_id)
    .single()

  if (tError || !template) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })

  const steps = (template.steps ?? []) as Array<{ id: string; order: number }>
  const firstStepId = [...steps].sort((a, b) => a.order - b.order)[0]?.id ?? null

  const targets = client_ids && client_ids.length > 0 ? client_ids : [null]

  const inserts = targets.map(clientId => ({
    template_id,
    client_id: clientId,
    type,
    current_step_id: firstStepId,
    status: 'active',
  }))

  const { data, error } = await supabase
    .from('timeline_instances')
    .insert(inserts)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count: data?.length ?? 0 }, { status: 201 })
}
