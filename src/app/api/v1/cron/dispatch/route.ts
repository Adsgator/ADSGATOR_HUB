import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { criarClienteServiceRole } from '@/lib/supabase'
import { CRON_TIPOS, deveRodarAgora, marcarExecucao, type CronTipo } from '@/lib/cron-settings'
import { sincronizarTodos, mesAtual } from '@/lib/analytics-sync'
import { gerarBriefing, salvarBriefing } from '@/lib/briefing'

export const dynamic = 'force-dynamic'
// Pode encadear sync de analytics + Asaas + emails na mesma janela.
export const maxDuration = 300

/**
 * GET /api/v1/cron/dispatch — acionado a cada 30 min pelo GitHub Actions
 * (.github/workflows/cron-dispatch.yml) + fallback diário no vercel.json.
 * Vercel Hobby só permite cron diário — agenda de 30 em 30 min no
 * vercel.json bloqueia o deploy (cron_jobs_limits_reached).
 *
 * Para cada job em `cron_settings`, checa horário configurado (SP) e
 * liga/desliga (lib/cron-settings.ts) e executa na primeira janela após o
 * horário — no máximo 1x por dia. As rotas antigas (/api/v1/analytics/sync,
 * briefing/run, asaas/import, alertas/notificar, cobranca/run) continuam
 * funcionando como acionamento manual/debug.
 *
 * Auth: Bearer CRON_SECRET.
 */

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

/** asaas_import/alertas/cobranca: a lógica vive acoplada aos handlers das
 *  rotas — reuso via fetch interno (mesma origem) com o Bearer do cron. */
async function executarRotaInterna(path: string, cronSecret: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL
  if (!base) throw new Error('NEXT_PUBLIC_APP_URL não configurada')
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  })
  if (!res.ok) throw new Error(`${path} retornou ${res.status}`)
  return res.json()
}

async function executarBriefing(ownerId: string) {
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
  return { fonte: briefing.fonte, novo }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Sem sessão no cron: dono = primeiro usuário do auth (single-operator)
  const { data: lista } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 })
  const ownerId = lista?.users?.[0]?.id
  if (!ownerId) {
    return NextResponse.json({ error: 'Nenhum usuário no auth' }, { status: 500 })
  }

  const db = criarClienteServiceRole()

  const jobs: Record<CronTipo, () => Promise<unknown>> = {
    analytics_sync: () => sincronizarTodos(db, mesAtual()),
    briefing:       () => executarBriefing(ownerId),
    asaas_import:   () => executarRotaInterna('/api/v1/asaas/import', cronSecret),
    alertas:        () => executarRotaInterna('/api/v1/alertas/notificar', cronSecret),
    cobranca:       () => executarRotaInterna('/api/v1/cobranca/run', cronSecret),
  }

  const executados: CronTipo[] = []
  const pulados: Array<{ tipo: CronTipo; motivo: string }> = []
  const falhas: Array<{ tipo: CronTipo; erro: string }> = []

  for (const tipo of CRON_TIPOS) {
    try {
      const { rodar, motivo } = await deveRodarAgora(db, tipo)
      if (!rodar) {
        pulados.push({ tipo, motivo: motivo ?? 'desconhecido' })
        continue
      }
      await jobs[tipo]()
      await marcarExecucao(db, tipo)
      executados.push(tipo)
    } catch (err) {
      falhas.push({ tipo, erro: err instanceof Error ? err.message : String(err) })
    }
  }

  return NextResponse.json({ executados, pulados, falhas })
}
