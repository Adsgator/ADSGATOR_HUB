import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Analytics de COMPORTAMENTO da Gator (4 blocos): por tipo de uso, ferramentas
// (ranking + taxa de falha via ia_mensagens.ferramentas), tendência no tempo
// (série diária + heatmap por hora) e conversas destaque (mais caras/longas/ações).
// Leitura via sessão; RLS owner-scoped em ia_uso/ia_mensagens/ia_conversas cobre.

interface UsoRow {
  contexto:    string
  custo_brl:   number
  tokens_entrada: number
  tokens_saida:   number
  conversa_id: string | null
  iteracoes:   number | null
  created_at:  string
}

interface FerramentaMsg { nome: string; resumo: string }

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const desde = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: usoData }, { data: msgsData }, { data: convData }] = await Promise.all([
    supabase
      .from('ia_uso')
      .select('contexto, custo_brl, tokens_entrada, tokens_saida, conversa_id, iteracoes, created_at')
      .eq('user_id', user.id)
      .gte('created_at', desde),
    supabase
      .from('ia_mensagens')
      .select('ferramentas')
      .eq('user_id', user.id)
      .eq('role', 'assistant')
      .not('ferramentas', 'is', null)
      .gte('created_at', desde),
    supabase
      .from('ia_conversas')
      .select('id, titulo')
      .eq('user_id', user.id),
  ])

  const uso = (usoData ?? []) as UsoRow[]
  const tituloPorConversa = new Map<string, string>(
    (convData ?? []).map((c) => [c.id as string, c.titulo as string]),
  )

  // ── 1. Por tipo de uso ──────────────────────────────────────────────────────
  const porContexto: Record<string, { chamadas: number; tokens: number; custo: number }> = {}
  for (const u of uso) {
    porContexto[u.contexto] ??= { chamadas: 0, tokens: 0, custo: 0 }
    porContexto[u.contexto].chamadas += 1
    porContexto[u.contexto].tokens   += (u.tokens_entrada ?? 0) + (u.tokens_saida ?? 0)
    porContexto[u.contexto].custo    += Number(u.custo_brl ?? 0)
  }

  // ── 2. Ferramentas (ranking + taxa de falha) — de ia_mensagens.ferramentas ──
  // O resumo iniciado por "Falhou:" sinaliza erro (lib/ia/tools.ts).
  const ferramentas: Record<string, { chamadas: number; falhas: number }> = {}
  for (const m of msgsData ?? []) {
    for (const f of (m.ferramentas ?? []) as FerramentaMsg[]) {
      ferramentas[f.nome] ??= { chamadas: 0, falhas: 0 }
      ferramentas[f.nome].chamadas += 1
      if (f.resumo?.startsWith('Falhou:')) ferramentas[f.nome].falhas += 1
    }
  }

  // ── 3. Tendência (série diária 30d + heatmap por hora) ──────────────────────
  const serieMap: Record<string, { custo: number; chamadas: number }> = {}
  const heatmap = Array.from({ length: 24 }, () => 0) // chamadas por hora do dia (SP)
  for (const u of uso) {
    const data = new Date(u.created_at)
    const dia = data.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    serieMap[dia] ??= { custo: 0, chamadas: 0 }
    serieMap[dia].custo += Number(u.custo_brl ?? 0)
    serieMap[dia].chamadas += 1
    const hora = Number(data.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }))
    if (hora >= 0 && hora < 24) heatmap[hora] += 1
  }
  const serie: { dia: string; custo: number; chamadas: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    const v = serieMap[d] ?? { custo: 0, chamadas: 0 }
    serie.push({ dia: d, custo: Number(v.custo.toFixed(6)), chamadas: v.chamadas })
  }

  // ── 4. Conversas destaque (agrupa ia_uso por conversa_id) ───────────────────
  const porConversa: Record<string, { custo: number; mensagens: number; acoes: number }> = {}
  for (const u of uso) {
    if (!u.conversa_id) continue
    porConversa[u.conversa_id] ??= { custo: 0, mensagens: 0, acoes: 0 }
    porConversa[u.conversa_id].custo     += Number(u.custo_brl ?? 0)
    porConversa[u.conversa_id].mensagens += 1 // 1 linha de uso = 1 mensagem do agente
    porConversa[u.conversa_id].acoes     += u.iteracoes ?? 0
  }
  const conversas = Object.entries(porConversa).map(([id, v]) => ({
    id,
    titulo:    tituloPorConversa.get(id) ?? 'Conversa',
    custo:     Number(v.custo.toFixed(6)),
    mensagens: v.mensagens,
    acoes:     v.acoes,
  }))

  return NextResponse.json({
    por_contexto: Object.entries(porContexto)
      .map(([contexto, v]) => ({ contexto, ...v, custo: Number(v.custo.toFixed(6)) }))
      .sort((a, b) => b.custo - a.custo),
    ferramentas: Object.entries(ferramentas)
      .map(([nome, v]) => ({ nome, ...v, taxa_falha: v.chamadas ? v.falhas / v.chamadas : 0 }))
      .sort((a, b) => b.chamadas - a.chamadas),
    serie_30d: serie,
    heatmap, // 24 posições (0..23h), nº de chamadas
    conversas_destaque: {
      mais_caras:  [...conversas].sort((a, b) => b.custo - a.custo).slice(0, 5),
      mais_longas: [...conversas].sort((a, b) => b.mensagens - a.mensagens).slice(0, 5),
      mais_acoes:  [...conversas].sort((a, b) => b.acoes - a.acoes).slice(0, 5),
    },
  })
}
