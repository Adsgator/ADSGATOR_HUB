import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import { briefingDoDia, gerarBriefing, salvarBriefing, type FiltroModo } from '@/lib/briefing'

// DB-first: sem ?refresh=1 devolve o briefing do dia salvo (instantâneo — o
// cron das 06:30 já gerou). Com refresh, ou sem briefing salvo, gera + upsert.
// Lógica em lib/briefing.ts (compartilhada com /api/v1/briefing/run).

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(req: Request) {
  const session = await createSessionClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const filtro  = (searchParams.get('filtro') ?? 'completo') as FiltroModo
  const refresh = searchParams.get('refresh') === '1'

  if (!refresh) {
    const salvo = await briefingDoDia(supabase, user.id, filtro)
    if (salvo) return NextResponse.json(salvo)
  }

  const briefing = await gerarBriefing(supabase, user.id, filtro)
  try {
    await salvarBriefing(supabase, user.id, filtro, briefing)
  } catch {
    // tabela briefings ainda sem migration — o briefing volta mesmo assim
  }
  return NextResponse.json(briefing)
}
