import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Salva o limite mensal de gasto estimado da IA (alerta, não bloqueia).
export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json() as { valor?: number | null; ativo?: boolean }
  const valor = typeof body.valor === 'number' && body.valor > 0 ? body.valor : null
  const ativo = !!body.ativo && valor != null

  const { error } = await supabase
    .from('configuracoes_ia')
    .upsert(
      { user_id: user.id, limite_mensal_brl: valor, limite_ativo: ativo, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ valor, ativo })
}
