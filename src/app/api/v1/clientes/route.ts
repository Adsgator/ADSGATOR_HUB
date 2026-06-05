import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/v1/clientes
 * Retorna lista de clientes do usuário autenticado
 * Query params: status, nicho, limit, offset
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient()

  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parâmetros de query
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const nicho = searchParams.get('nicho')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  let query = supabase
    .from('clientes')
    .select('id,nome,email,whatsapp,nicho,status,mrr,dias_atraso,data_criacao', { count: 'exact' })
    .eq('user_id', user.id)

  if (status) query = query.eq('status', status)
  if (nicho) query = query.eq('nicho', nicho)

  const { data, error, count } = await query
    .order('data_criacao', { ascending: false })
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
 * POST /api/v1/clientes
 * Criar novo cliente
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { nome, email, whatsapp, nicho, status } = body

  if (!nome || !email) {
    return NextResponse.json({ error: 'nome e email são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('clientes')
    .insert({
      user_id: user.id,
      nome,
      email: email.toLowerCase(),
      whatsapp: whatsapp?.replace(/\D/g, ''),
      nicho,
      status: status ?? 'recebido',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data, { status: 201 })
}
