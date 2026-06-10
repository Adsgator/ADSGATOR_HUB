import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { criarClienteServiceRole } from '@/lib/supabase'
import { sincronizarTodos, sincronizarCliente, mesAtual } from '@/lib/analytics-sync'

export const dynamic = 'force-dynamic'
// Sync pode demorar (várias chamadas Google API em sequência).
export const maxDuration = 300

/**
 * POST /api/v1/analytics/sync
 *
 * Popula analytics_snapshots com dados de Google Ads + GA4.
 *
 * Dois modos de autenticação:
 *  - Sessão de usuário (botão "Sincronizar agora" na UI) — sincroniza os
 *    clientes do próprio usuário.
 *  - Cron (header `Authorization: Bearer <CRON_SECRET>`) — usa service-role e
 *    sincroniza todos os clientes com integração habilitada.
 *
 * Body opcional: { clienteId?: string, mesAno?: string (YYYY-MM) }
 */
/**
 * GET — usado pelo Vercel Cron (que sempre faz GET e envia
 * `Authorization: Bearer $CRON_SECRET`). Sincroniza todos os clientes.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const supabase = criarClienteServiceRole()
  const resultados = await sincronizarTodos(supabase, mesAtual())
  return NextResponse.json({ modo: 'cron', mesAno: mesAtual(), total: resultados.length, resultados })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => { console.warn('[analytics/sync] body JSON inválido — usando vazio'); return {} }) as { clienteId?: string; mesAno?: string }
  const mesAno = body.mesAno || mesAtual()

  // ── Modo cron (POST com Bearer) ──────────────────────────────
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    const supabase = criarClienteServiceRole()
    const resultados = await sincronizarTodos(supabase, mesAno)
    return NextResponse.json({ modo: 'cron', mesAno, total: resultados.length, resultados })
  }

  // ── Modo usuário (sessão) ────────────────────────────────────
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Sincronizar um cliente específico (validando posse) ou todos do usuário.
  if (body.clienteId) {
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id, nome, google_ads_customer_id, ga4_property_id, google_ads_enabled, ga4_enabled')
      .eq('id', body.clienteId)
      .eq('user_id', user.id)
      .single()

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const resultado = await sincronizarCliente(supabase, cliente, mesAno)
    return NextResponse.json({ modo: 'usuario', mesAno, resultados: [resultado] })
  }

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome, google_ads_customer_id, ga4_property_id, google_ads_enabled, ga4_enabled')
    .eq('user_id', user.id)
    .or('google_ads_enabled.eq.true,ga4_enabled.eq.true')

  const resultados = []
  for (const cliente of clientes ?? []) {
    resultados.push(await sincronizarCliente(supabase, cliente, mesAno))
  }

  return NextResponse.json({ modo: 'usuario', mesAno, total: resultados.length, resultados })
}
