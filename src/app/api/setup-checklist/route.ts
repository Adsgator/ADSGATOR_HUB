import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computarSetupChecklist } from '@/lib/setup-checklist'

// Central de prontidão — checklist computado ao vivo do que falta configurar.
// `?fresh=1` ignora o cache de 60s dos checks de integração (botão Reverificar).
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const fresh = new URL(request.url).searchParams.get('fresh') === '1'
  const checklist = await computarSetupChecklist(supabase, user.id, { fresh })
  return NextResponse.json(checklist)
}
