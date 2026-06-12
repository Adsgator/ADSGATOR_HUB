import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const campos: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.nome === 'string' && body.nome.trim())     campos.nome = body.nome.trim()
  if (typeof body.titulo === 'string' && body.titulo.trim()) campos.titulo = body.titulo.trim()
  if ('descricao' in body)  campos.descricao = body.descricao || null
  if (typeof body.prioridade === 'string') campos.prioridade = body.prioridade
  if ('prazo_dias' in body) campos.prazo_dias = typeof body.prazo_dias === 'number' ? body.prazo_dias : null
  if (Array.isArray(body.checklist)) campos.checklist = body.checklist

  const { data, error } = await supabase
    .from('tarefa_templates')
    .update(campos)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  // Templates de sistema (com slug) alimentam o provisionamento automático —
  // podem ser editados, nunca excluídos.
  const { data: tpl } = await supabase.from('tarefa_templates').select('slug').eq('id', id).maybeSingle()
  if (!tpl) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })
  if (tpl.slug) {
    return NextResponse.json({ error: 'Templates de sistema não podem ser excluídos — edite-os.' }, { status: 400 })
  }

  const { error } = await supabase.from('tarefa_templates').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
