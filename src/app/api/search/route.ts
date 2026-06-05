import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(req: NextRequest) {
  const session = await createSessionClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ clientes: [], tarefas: [], lancamentos: [], historico: [] })

  const like = `%${q}%`

  const [{ data: clientes }, { data: tarefas }, { data: lancamentos }, { data: historico }] = await Promise.all([
    supabase.from('clientes').select('id, nome, email, nicho, status').or(`nome.ilike.${like},email.ilike.${like}`).limit(5),
    supabase.from('tarefas').select('id, titulo, prioridade, data_prazo, status').ilike('titulo', like).neq('status', 'feito').limit(5),
    supabase.from('financeiro_lancamentos').select('id, descricao, valor, tipo, data').ilike('descricao', like).limit(5),
    supabase.from('historico_acoes').select('id, descricao, tipo, created_at, cliente_id').ilike('descricao', like).order('created_at', { ascending: false }).limit(5),
  ])

  return NextResponse.json({
    clientes:    clientes    ?? [],
    tarefas:     tarefas     ?? [],
    lancamentos: lancamentos ?? [],
    historico:   historico   ?? [],
  })
}
