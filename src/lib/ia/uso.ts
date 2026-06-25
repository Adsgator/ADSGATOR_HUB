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
  } catch (err) {
    console.error('[ia/uso] falha ao registrar uso (ignorado):', err)
  }
}
