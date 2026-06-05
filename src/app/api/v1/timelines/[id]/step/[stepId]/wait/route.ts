import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id, stepId } = await params

  const { data: instance } = await supabase
    .from('timeline_instances')
    .select('pending_steps')
    .eq('id', id)
    .single()

  if (!instance) return NextResponse.json({ error: 'Instância não encontrada' }, { status: 404 })

  const pending: string[] = instance.pending_steps ?? []
  if (!pending.includes(stepId)) {
    const { error } = await supabase
      .from('timeline_instances')
      .update({ pending_steps: [...pending, stepId] })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from('timeline_audit_log').insert([{
    instance_id: id,
    action: 'awaiting_client',
    details: { step_id: stepId },
    changed_by: user.id,
  }])

  return NextResponse.json({ success: true })
}
