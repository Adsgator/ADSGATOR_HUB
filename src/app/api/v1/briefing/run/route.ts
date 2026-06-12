import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { gerarBriefing, salvarBriefing } from '@/lib/briefing'

/**
 * GET /api/v1/briefing/run — Vercel Cron (06:30, ver vercel.json).
 *
 * Gera o briefing `completo` do dia e salva em `briefings` antes do operador
 * acordar; o dashboard só lê do banco. Notifica "☀️ Briefing do dia pronto"
 * apenas quando cria linha nova (reexecução não duplica).
 * Auth: Bearer CRON_SECRET (padrão dos demais crons).
 */

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Sem sessão no cron: dono = primeiro usuário do auth (single-operator,
  // mesmo padrão do asaas/import)
  const { data: lista } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 })
  const ownerId = lista?.users?.[0]?.id
  if (!ownerId) {
    return NextResponse.json({ error: 'Nenhum usuário no auth' }, { status: 500 })
  }

  const briefing = await gerarBriefing(supabaseAdmin, ownerId, 'completo')
  const { novo } = await salvarBriefing(supabaseAdmin, ownerId, 'completo', briefing)

  if (novo) {
    await supabaseAdmin.from('notificacoes').insert({
      user_id:  ownerId,
      tipo:     'info',
      titulo:   '☀️ Briefing do dia pronto',
      mensagem: 'O Morning Briefing de hoje já está no dashboard.',
      lida:     false,
    })
  }

  return NextResponse.json({ ok: true, fonte: briefing.fonte, novo })
}

export const POST = GET
