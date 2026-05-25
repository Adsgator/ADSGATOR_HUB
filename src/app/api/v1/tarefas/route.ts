import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

/**
 * GET /api/v1/tarefas
 * Retorna lista de tarefas do usuário
 * Query params: status, prioridade, cliente_id, limit, offset
 */
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const prioridade = searchParams.get('prioridade')
  const cliente_id = searchParams.get('cliente_id')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  let query = supabase
    .from('tarefas')
    .select('id,titulo,descricao,status,prioridade,data_prazo,cliente_id,responsavel_id,created_at', { count: 'exact' })
    .eq('user_id', user.id)

  if (status) query = query.eq('status', status)
  if (prioridade) query = query.eq('prioridade', prioridade)
  if (cliente_id) query = query.eq('cliente_id', cliente_id)

  const { data, error, count } = await query
    .order('data_prazo', { ascending: true, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data,
    pagination: {
      offset,
      limit,
      total: count,
    },
  })
}

/**
 * POST /api/v1/tarefas
 * Criar nova tarefa
 */
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { titulo, descricao, prioridade = 'normal', status = 'pendente', data_prazo, cliente_id, responsavel_id } = body

  if (!titulo) {
    return NextResponse.json({ error: 'titulo é obrigatório' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tarefas')
    .insert({
      user_id: user.id,
      titulo,
      descricao,
      prioridade,
      status,
      data_prazo,
      cliente_id,
      responsavel_id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data, { status: 201 })
}
