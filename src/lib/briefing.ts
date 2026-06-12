// ─── MORNING BRIEFING ────────────────────────────────────────────────────────
// Geração e persistência do briefing matinal. DB-first: o cron das 06:30
// (/api/v1/briefing/run) gera e salva em `briefings`; o dashboard lê o do dia
// instantâneo via /api/ia/morning-briefing; "Atualizar" regenera (upsert).

import type { SupabaseClient } from '@supabase/supabase-js'
import { MODELO_PRO, criarVertexAI } from '@/lib/vertex-ai'

export type FiltroModo = 'completo' | 'urgencias' | 'resumido'

export interface Briefing {
  texto:     string
  fonte:     'ia' | 'fallback'
  gerado_em: string
}

/** Data de hoje (YYYY-MM-DD) no fuso de São Paulo — chave do upsert diário. */
export function hojeSP(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

function buildPrompt(
  hoje: string,
  contexto: string,
  filtro: FiltroModo,
): string {
  if (filtro === 'urgencias') {
    return `Você é o assistente operacional da Adsgator. Gere um briefing APENAS sobre urgências (máx 4 linhas, sem markdown, sem listas).

${contexto}

Liste SOMENTE o que precisa de ação IMEDIATA hoje. Se não houver urgências críticas, diga brevemente que está tudo sob controle.`
  }

  if (filtro === 'resumido') {
    return `Você é o assistente operacional da Adsgator. Gere um resumo em ATÉ 2 LINHAS, sem markdown.

${contexto}

Seja extremamente conciso: 1 linha com o status geral, 1 linha com a ação mais importante.`
  }

  // completo (padrão)
  return `Você é o assistente operacional da Adsgator. Gere um briefing matinal CONCISO (máx 5 linhas, sem markdown, sem listas).

${contexto}

Foque em: o que está bem, o que precisa de atenção hoje, 1 sugestão de ação prioritária.`
}

/** Coleta o panorama do dia e gera o texto (Gemini Pro, fallback determinístico). */
export async function gerarBriefing(
  db: SupabaseClient,
  userId: string,
  filtro: FiltroModo,
): Promise<Briefing> {
  const hoje = hojeSP()

  const { data: clientesData } = await db
    .from('clientes')
    .select('id, nome, status, dias_atraso, mrr, nicho, saldo_google, google_ads_enabled')
    .eq('user_id', userId)
    .in('status', ['ativo', 'onboarding', 'setup_trafego', 'recebido'])

  const clientes   = clientesData ?? []
  const clienteIds = clientes.map((c) => c.id)

  const [alertasRes, tarefasRes, configRes] = await Promise.all([
    clienteIds.length > 0
      ? db.from('alertas')
          .select('tipo, mensagem')
          .in('cliente_id', clienteIds)
          .eq('resolvido', false)
          .order('created_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
    db.from('tarefas')
      .select('titulo, prioridade')
      .eq('user_id', userId)
      .in('status', ['pendente', 'em_progresso'])
      .gte('data_prazo', `${hoje}T00:00:00`)
      .lte('data_prazo', `${hoje}T23:59:59`)
      .limit(10),
    db.from('configuracoes_financeiras')
      .select('saldo_google_ads_limite_alerta')
      .eq('agencia_id', 'adsgator-main')
      .maybeSingle(),
  ])

  const alertas     = (alertasRes.data ?? []) as { tipo: string; mensagem: string }[]
  const tarefasHoje = (tarefasRes.data ?? []) as { titulo: string; prioridade: string }[]
  const limiteSaldo = configRes.data?.saldo_google_ads_limite_alerta ?? 50

  const mrrTotal      = clientes.reduce((s, c) => s + (c.mrr ?? 0), 0)
  const inadimplentes = clientes.filter((c) => (c.dias_atraso ?? 0) > 0)
  const saldoBaixo    = clientes.filter(
    (c) => c.google_ads_enabled && (c.saldo_google ?? 0) > 0 && (c.saldo_google ?? 0) <= limiteSaldo,
  )

  const contexto = `Dados de hoje (${hoje}):
- Clientes ativos: ${clientes.length}
- MRR total: R$ ${mrrTotal.toLocaleString('pt-BR')}
- Inadimplentes: ${inadimplentes.length} (${inadimplentes.map((c) => c.nome).join(', ') || 'nenhum'})
- Alertas abertos: ${alertas.length}
- Tarefas com prazo HOJE: ${tarefasHoje.length}${tarefasHoje.length ? ` (${tarefasHoje.map((t) => t.titulo).slice(0, 5).join('; ')})` : ''}
- Clientes com saldo Google baixo (≤ R$ ${limiteSaldo}): ${saldoBaixo.length}${saldoBaixo.length ? ` (${saldoBaixo.map((c) => c.nome).join(', ')})` : ''}`

  const prompt = buildPrompt(hoje, contexto, filtro)

  try {
    const vertex = criarVertexAI()
    const model  = vertex.preview.getGenerativeModel({ model: MODELO_PRO })
    const result = await model.generateContent(prompt)
    const texto  = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
    if (!texto) throw new Error('Resposta vazia do modelo')
    return { texto, fonte: 'ia', gerado_em: new Date().toISOString() }
  } catch {
    // Fallback sem IA (Vertex ausente/indisponível) — `fonte` sinaliza ao card
    const partes: string[] = []
    if (inadimplentes.length > 0) partes.push(`${inadimplentes.length} cliente(s) inadimplente(s) requerem atenção hoje.`)
    if (tarefasHoje.length > 0)   partes.push(`${tarefasHoje.length} tarefa(s) com prazo hoje.`)
    if (saldoBaixo.length > 0)    partes.push(`Saldo Google baixo: ${saldoBaixo.map((c) => c.nome).join(', ')}.`)
    const texto = partes.length > 0
      ? `${partes.join(' ')} MRR total: R$ ${mrrTotal.toLocaleString('pt-BR')}.`
      : `Bom dia! ${clientes.length} clientes ativos. MRR: R$ ${mrrTotal.toLocaleString('pt-BR')}. Sem alertas críticos.`
    return { texto, fonte: 'fallback', gerado_em: new Date().toISOString() }
  }
}

/** Upsert do briefing do dia (1 linha por user/dia/filtro). Retorna se criou linha nova. */
export async function salvarBriefing(
  db: SupabaseClient,
  userId: string,
  filtro: FiltroModo,
  briefing: Briefing,
): Promise<{ novo: boolean }> {
  const dia = hojeSP()
  const { data: existente } = await db
    .from('briefings')
    .select('id')
    .eq('user_id', userId)
    .eq('data', dia)
    .eq('filtro', filtro)
    .maybeSingle()

  const { error } = await db.from('briefings').upsert(
    {
      user_id:   userId,
      data:      dia,
      filtro,
      texto:     briefing.texto,
      fonte:     briefing.fonte,
      gerado_em: briefing.gerado_em,
    },
    { onConflict: 'user_id,data,filtro' },
  )
  if (error) throw new Error(`Falha ao salvar briefing: ${error.message}`)
  return { novo: !existente }
}

/** Briefing do dia salvo no banco (null se ainda não gerado). */
export async function briefingDoDia(
  db: SupabaseClient,
  userId: string,
  filtro: FiltroModo,
): Promise<Briefing | null> {
  const { data } = await db
    .from('briefings')
    .select('texto, fonte, gerado_em')
    .eq('user_id', userId)
    .eq('data', hojeSP())
    .eq('filtro', filtro)
    .maybeSingle()
  return data ? (data as Briefing) : null
}
