import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabase
    .from('timeline_instances')
    .select('*, template:timeline_templates(*)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  // Apenas campos seguros podem ser atualizados via PATCH (evita sobrescrever
  // template_id, completed_steps etc. por engano). data = variáveis da timeline
  // (drive_url…); current_step_id = reabrir/navegar etapa; status = pausar/ativar.
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.data && typeof body.data === 'object') patch.data = body.data
  if (typeof body.current_step_id === 'string' || body.current_step_id === null) patch.current_step_id = body.current_step_id
  if (typeof body.status === 'string') patch.status = body.status

  const { data, error } = await supabase
    .from('timeline_instances')
    .update(patch)
    .eq('id', id)
    .select('*, template:timeline_templates(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
