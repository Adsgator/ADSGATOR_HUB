import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Templates de tarefa/processo (tabela tarefa_templates).
// Templates com `slug` são de sistema (ex.: setup-cliente) — editáveis, não deletáveis.

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('tarefa_templates')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  if (!body?.nome?.trim() || !body?.titulo?.trim()) {
    return NextResponse.json({ error: 'nome e titulo são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tarefa_templates')
    .insert({
      nome:       body.nome.trim(),
      titulo:     body.titulo.trim(),
      descricao:  body.descricao || null,
      prioridade: body.prioridade || 'normal',
      prazo_dias: typeof body.prazo_dias === 'number' ? body.prazo_dias : null,
      checklist:  Array.isArray(body.checklist) ? body.checklist : [],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
