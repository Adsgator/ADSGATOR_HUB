// ─── CRON SETTINGS ───────────────────────────────────────────────────────────
// Gate dos jobs automáticos. O dispatcher (/api/v1/cron/dispatch) roda a cada
// 30 min e pergunta aqui se cada job deve executar: ativo, já passou do
// horário configurado (America/Sao_Paulo) e ainda não rodou hoje.
// Sem a migration `20260615_cron_settings.sql` aplicada, o fallback é rodar
// sempre (comportamento dos crons antigos) — nada quebra.

import type { SupabaseClient } from '@supabase/supabase-js'
import { hojeSP } from '@/lib/briefing'

export const CRON_TIPOS = [
  'analytics_sync',
  'briefing',
  'asaas_import',
  'alertas',
  'cobranca',
  'arquivar_congelados',
  'onboarding_lembretes',
  'relatorio_semanal',
] as const

export type CronTipo = (typeof CRON_TIPOS)[number]

export interface CronSetting {
  tipo:       CronTipo
  nome:       string
  descricao:  string | null
  ativo:      boolean
  horario:    string          // 'HH:mm:ss' (time do Postgres), fuso SP
  param_int:  number | null   // parâmetro do job (ex.: dias p/ arquivar congelado)
  ultimo_run: string | null
  updated_at: string | null
}

/** Hora e minuto de agora em America/Sao_Paulo. */
function agoraSP(): { hora: number; minuto: number } {
  const sp = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  return { hora: sp.getHours(), minuto: sp.getMinutes() }
}

/** Dia da semana em SP (0=domingo … 6=sábado). */
function diaSemanaSP(): number {
  const sp = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  return sp.getDay()
}

export async function deveRodarAgora(
  db: SupabaseClient,
  tipo: CronTipo,
): Promise<{ rodar: boolean; motivo?: string }> {
  const { data, error } = await db
    .from('cron_settings')
    .select('ativo, horario, ultimo_run, dia_semana')
    .eq('tipo', tipo)
    .maybeSingle()

  // Tabela inexistente (migration não aplicada) ou registro ausente:
  // fallback é o comportamento antigo — roda.
  if (error || !data) return { rodar: true }

  if (!data.ativo) return { rodar: false, motivo: 'desativado' }

  const [h, m] = String(data.horario).split(':').map(Number)
  const agora = agoraSP()
  if (agora.hora < h || (agora.hora === h && agora.minuto < m)) {
    return { rodar: false, motivo: 'antes_do_horario' }
  }

  // Job SEMANAL: dia_semana preenchido (0-6). Só roda no dia certo e a
  // idempotência é semanal (não rodou nos últimos 6 dias).
  const diaSemana = (data as { dia_semana?: number | null }).dia_semana
  if (diaSemana !== null && diaSemana !== undefined) {
    if (diaSemanaSP() !== diaSemana) return { rodar: false, motivo: 'outro_dia_da_semana' }
    if (data.ultimo_run) {
      const diasDesde = (Date.now() - new Date(data.ultimo_run).getTime()) / 86_400_000
      if (diasDesde < 6) return { rodar: false, motivo: 'ja_rodou_esta_semana' }
    }
    return { rodar: true }
  }

  // Job DIÁRIO: idempotência diária — já rodou hoje (data SP)?
  if (data.ultimo_run) {
    const ultimoDiaSP = new Date(data.ultimo_run)
      .toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    if (ultimoDiaSP === hojeSP()) return { rodar: false, motivo: 'ja_rodou_hoje' }
  }

  return { rodar: true }
}

export async function marcarExecucao(db: SupabaseClient, tipo: CronTipo): Promise<void> {
  await db
    .from('cron_settings')
    .update({ ultimo_run: new Date().toISOString() })
    .eq('tipo', tipo)
}
