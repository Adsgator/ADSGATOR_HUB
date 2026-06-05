import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/v1/financeiro
 * Retorna lançamentos financeiros do usuário
 * Query params: tipo, cliente_id, data_inicio, data_fim, limit, offset
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') // receita, despesa
  const cliente_id = searchParams.get('cliente_id')
  const data_inicio = searchParams.get('data_inicio')
  const data_fim = searchParams.get('data_fim')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  let query = supabase
    .from('financeiro_lancamentos')
    .select('id,descricao,tipo,valor,data,cliente_id,categoria,created_at', { count: 'exact' })
    .eq('user_id', user.id)

  if (tipo) query = query.eq('tipo', tipo)
  if (cliente_id) query = query.eq('cliente_id', cliente_id)
  if (data_inicio) query = query.gte('data', data_inicio)
  if (data_fim) query = query.lte('data', data_fim)

  const { data, error, count } = await query
    .order('data', { ascending: false })
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
 * POST /api/v1/financeiro
 * Criar novo lançamento
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { descricao, tipo, valor, data, cliente_id, categoria } = body

  if (!descricao || !tipo || !valor || !data) {
    return NextResponse.json({ error: 'descricao, tipo, valor e data são obrigatórios' }, { status: 400 })
  }

  const { data: result, error } = await supabase
    .from('financeiro_lancamentos')
    .insert({
      user_id: user.id,
      descricao,
      tipo,
      valor: parseFloat(valor),
      data,
      cliente_id,
      categoria,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(result, { status: 201 })
}
