// ─── REGISTRADOR DE USO DA IA ─────────────────────────────────────────────────
// Toda chamada ao Vertex devolve usageMetadata (tokens de entrada/saída/cache) e
// até hoje o Hub descartava. Aqui centralizamos a captura: extrai os tokens da
// resposta, estima o custo em BRL e grava 1 linha em `ia_uso`. É telemetria —
// NUNCA pode lançar e derrubar a feature que está medindo (try/catch interno).

import type { SupabaseClient } from '@supabase/supabase-js'
import type { GenerateContentResult } from '@google-cloud/vertexai'

// ── Preços (USD por 1M tokens) ────────────────────────────────────────────────
// Estimativa jun/2026 — o painel rotula o custo como "estimado". Ajustar aqui
// quando o preço Vertex mudar. Cache do v1 é cobrado como entrada (lado seguro).
const PRECOS: Record<string, { in: number; out: number }> = {
  'gemini-2.5-pro':        { in: 1.25, out: 10.00 },
  'gemini-2.5-flash':      { in: 0.30, out: 2.50 },
  'gemini-2.5-flash-lite': { in: 0.10, out: 0.40 },
}
const PRECO_PADRAO = { in: 0.30, out: 2.50 } // fallback = flash
const USD_BRL = 5.5 // estimativa; câmbio real varia

export type ContextoUso = 'agente' | 'chat' | 'hashtags' | 'briefing' | 'copy' | 'relatorio'

export interface Uso {
  tokensEntrada: number
  tokensSaida:   number
  tokensCache:   number
}

/** Lê usageMetadata da resposta do SDK, à prova de resposta sem metadata. */
export function extrairUso(result: GenerateContentResult): Uso {
  const m = result?.response?.usageMetadata
  return {
    tokensEntrada: m?.promptTokenCount     ?? 0,
    tokensSaida:   m?.candidatesTokenCount  ?? 0,
    tokensCache:   m?.cachedContentTokenCount ?? 0,
  }
}

/** Custo estimado em BRL. Cache tratado como entrada normal no v1 (superestima de leve). */
export function custoBRL(modelo: string, uso: Uso): number {
  const preco = PRECOS[modelo] ?? PRECO_PADRAO
  const usd =
    ((uso.tokensEntrada + uso.tokensCache) / 1_000_000) * preco.in +
    (uso.tokensSaida / 1_000_000) * preco.out
  return usd * USD_BRL
}

interface RegistrarUso extends Uso {
  userId:      string | null
  modelo:      string
  contexto:    ContextoUso
  conversaId?: string | null
  duracaoMs?:  number
  iteracoes?:  number
  ferramentas?: string[]
}

/**
 * Grava o uso em `ia_uso`. Recebe um client service-role (já disponível nos
 * call-sites). Engole qualquer erro: telemetria não derruba a feature.
 */
export async function registrarUso(db: SupabaseClient, u: RegistrarUso): Promise<void> {
  try {
    await db.from('ia_uso').insert({
      user_id:        u.userId,
      contexto:       u.contexto,
      modelo:         u.modelo,
      conversa_id:    u.conversaId ?? null,
      tokens_entrada: u.tokensEntrada,
      tokens_saida:   u.tokensSaida,
      tokens_cache:   u.tokensCache,
      custo_brl:      custoBRL(u.modelo, u),
      duracao_ms:     u.duracaoMs ?? null,
      iteracoes:      u.iteracoes ?? null,
      ferramentas:    u.ferramentas?.length ? u.ferramentas : null,
    })
    if (u.userId) await checarLimiteMensal(db, u.userId)
  } catch (err) {
    console.error('[ia/uso] falha ao registrar uso (ignorado):', err)
  }
}

/**
 * Se o gasto do mês ultrapassou o limite configurado pela 1ª vez no mês, gera
 * 1 notificação in-app (idempotente via configuracoes_ia.limite_avisado_mes).
 * Recebe service-role db (escreve em configuracoes_ia/notificacoes).
 */
async function checarLimiteMensal(db: SupabaseClient, userId: string): Promise<void> {
  const { data: cfg } = await db
    .from('configuracoes_ia')
    .select('limite_mensal_brl, limite_ativo, limite_avisado_mes')
    .eq('user_id', userId)
    .maybeSingle()

  const limite = cfg?.limite_mensal_brl as number | null | undefined
  if (!cfg?.limite_ativo || !limite || limite <= 0) return

  const mesAtual = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }).slice(0, 7)
  if (cfg.limite_avisado_mes === mesAtual) return // já avisou neste mês

  // Soma do mês corrente
  const inicioMes = `${mesAtual}-01T00:00:00`
  const { data: rows } = await db
    .from('ia_uso')
    .select('custo_brl')
    .eq('user_id', userId)
    .gte('created_at', inicioMes)
  const gastoMes = (rows ?? []).reduce((s, r) => s + Number(r.custo_brl ?? 0), 0)
  if (gastoMes < limite) return

  // Marca antes de notificar (evita corrida disparar 2x)
  await db.from('configuracoes_ia')
    .update({ limite_avisado_mes: mesAtual })
    .eq('user_id', userId)

  await db.from('notificacoes').insert({
    user_id:  userId,
    titulo:   'Limite mensal da IA atingido',
    mensagem: `O gasto estimado da IA neste mês (R$ ${gastoMes.toFixed(2)}) ultrapassou seu limite de R$ ${limite.toFixed(2)}. As chamadas continuam funcionando — isto é só um alerta.`,
    tipo:     'alerta',
    lida:     false,
  })
}
