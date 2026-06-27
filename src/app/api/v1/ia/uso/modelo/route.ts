import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MODELO_FLASH, MODELO_PRO, MODELO_AUTO } from '@/lib/vertex-ai'

const MODELOS_VALIDOS = new Set([MODELO_FLASH, MODELO_PRO, MODELO_AUTO])

// Salva o cérebro da Gator escolhido pelo Lucas: modelo (Flash/Pro) + thinking.
export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json() as { modelo?: string; thinking?: boolean }
  const modelo = typeof body.modelo === 'string' && MODELOS_VALIDOS.has(body.modelo) ? body.modelo : MODELO_AUTO
  const thinking = !!body.thinking

  const { error } = await supabase
    .from('configuracoes_ia')
    .upsert(
      { user_id: user.id, modelo, thinking, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ modelo, thinking })
}
