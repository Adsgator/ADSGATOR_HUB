import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const clienteId = searchParams.get('clienteId')
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  let query = supabase
    .from('email_history')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('enviado_em', { ascending: false })
    .range(offset, offset + limit - 1)

  if (clienteId) query = query.eq('cliente_id', clienteId)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: data ?? [], pagination: { offset, limit, total: count ?? 0 } })
}
