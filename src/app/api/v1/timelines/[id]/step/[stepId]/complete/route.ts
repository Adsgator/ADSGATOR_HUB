import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id, stepId } = await params
  const body = await request.json().catch(() => ({}))
  const formData: Record<string, unknown> = body.data ?? {}

  // Fetch instance + template
  const { data: instance, error: instError } = await supabase
    .from('timeline_instances')
    .select('*, template:timeline_templates(*)')
    .eq('id', id)
    .single()

  if (instError || !instance) return NextResponse.json({ error: 'Instância não encontrada' }, { status: 404 })

  const steps = (instance.template?.steps ?? []) as Array<{ id: string; order: number; prerequisite?: string }>
  const sorted = [...steps].sort((a, b) => a.order - b.order)

  const currentIdx = sorted.findIndex(s => s.id === stepId)
  if (currentIdx === -1) return NextResponse.json({ error: 'Step não encontrado' }, { status: 404 })

  const completedSteps: string[] = instance.completed_steps ?? []
  if (completedSteps.includes(stepId)) {
    return NextResponse.json({ error: 'Step já concluído' }, { status: 400 })
  }

  // Find next step (skip already completed, respect prerequisites)
  let nextStepId: string | null = null
  for (let i = currentIdx + 1; i < sorted.length; i++) {
    const s = sorted[i]
    if (completedSteps.includes(s.id)) continue
    if (s.prerequisite && !completedSteps.includes(s.prerequisite) && s.prerequisite !== stepId) continue
    nextStepId = s.id
    break
  }

  const newCompleted = [...completedSteps, stepId]
  const isFinished = nextStepId === null

  const updateData: Record<string, unknown> = {
    completed_steps: newCompleted,
    current_step_id: nextStepId,
    data: { ...(instance.data ?? {}), ...formData },
    updated_at: new Date().toISOString(),
  }
  if (isFinished) updateData.completed_at = new Date().toISOString()

  const { data: updated, error: updateError } = await supabase
    .from('timeline_instances')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Audit log
  await supabase.from('timeline_audit_log').insert([{
    instance_id: id,
    action: 'step_completed',
    details: { step_id: stepId, next_step_id: nextStepId, completed: isFinished },
    changed_by: user.id,
  }])

  // Step analytics
  await supabase.from('timeline_step_analytics').insert([{
    template_id: instance.template_id,
    step_id: stepId,
    instance_id: id,
    client_id: instance.client_id,
    started_at: instance.updated_at ?? new Date().toISOString(),
    completed_at: new Date().toISOString(),
    status: 'completed',
  }])

  return NextResponse.json({
    data: updated,
    completed: isFinished,
    next_step_id: nextStepId,
  })
}
