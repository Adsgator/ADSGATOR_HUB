// ─── ARQUIVAR CONGELADOS ─────────────────────────────────────────────────────
// Cliente congelado há mais de N dias (configurável em Configurações →
// Automações, default 60) vira 'inativo' + motivo 'congelamento_expirado'.
// Roda no dispatcher diário (/api/v1/cron/dispatch). Ver lib/cliente-status.ts.

import type { SupabaseClient } from '@supabase/supabase-js'

export const DIAS_CONGELAMENTO_PADRAO = 60

export interface ResultadoArquivamento {
  arquivados: number
  ids: string[]
}

/**
 * Move para 'inativo' os clientes congelados há mais de `dias`.
 * Idempotente: só pega quem ainda está 'congelado' com congelado_em vencido.
 */
export async function arquivarCongelados(
  db: SupabaseClient,
  dias: number = DIAS_CONGELAMENTO_PADRAO,
): Promise<ResultadoArquivamento> {
  const limite = new Date()
  limite.setDate(limite.getDate() - dias)
  const limiteISO = limite.toISOString()

  const { data: candidatos, error } = await db
    .from('clientes')
    .select('id, nome')
    .eq('status', 'congelado')
    .not('congelado_em', 'is', null)
    .lte('congelado_em', limiteISO)

  if (error) throw new Error(error.message)
  const lista = candidatos ?? []
  if (lista.length === 0) return { arquivados: 0, ids: [] }

  const ids = lista.map((c) => c.id)
  const agora = new Date().toISOString()

  const { error: errUpdate } = await db
    .from('clientes')
    .update({ status: 'inativo', motivo_inativacao: 'congelamento_expirado', inativado_em: agora })
    .in('id', ids)
  if (errUpdate) throw new Error(errUpdate.message)

  // registra no histórico de cada cliente arquivado
  await db.from('historico_acoes').insert(
    lista.map((c) => ({
      cliente_id: c.id,
      tipo_acao:  'arquivado_congelamento_expirado',
      descricao:  `🗄️ Cliente arquivado automaticamente — congelado há mais de ${dias} dias.`,
    })),
  )

  return { arquivados: lista.length, ids }
}
