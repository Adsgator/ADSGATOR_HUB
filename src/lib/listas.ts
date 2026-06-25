// ─── LISTAS EDITÁVEIS ────────────────────────────────────────────────────────
// Listas de domínio que antes viviam hardcoded e agora são editáveis pela tela
// (Configurações → Saúde & Listas), salvas em configuracoes_operacional.
// O código usa os defaults abaixo como fallback.

import type { SupabaseClient } from '@supabase/supabase-js'

/** Nichos sugeridos no formulário de cliente. */
export const NICHOS_SUGERIDOS_PADRAO = [
  'Psicologia', 'Odontologia', 'Estética', 'Advocacia', 'Medicina',
  'Fisioterapia', 'Nutrição', 'Academia', 'Imóveis', 'Adestramento',
  'Educação', 'Contabilidade', 'Engenharia', 'Outro',
]

/** Carrega os nichos sugeridos editáveis, com fallback no padrão. */
export async function carregarNichosSugeridos(db: SupabaseClient): Promise<string[]> {
  try {
    const { data } = await db
      .from('configuracoes_operacional')
      .select('nichos_sugeridos')
      .eq('agencia_id', 'adsgator-main')
      .maybeSingle()
    const lista = data?.nichos_sugeridos
    if (Array.isArray(lista) && lista.length > 0) {
      return lista.filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
    }
    return [...NICHOS_SUGERIDOS_PADRAO]
  } catch {
    return [...NICHOS_SUGERIDOS_PADRAO]
  }
}
