import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Resumo de custo da IA do usuário: hoje / mês / total, quebra por contexto e
// por modelo, série diária dos últimos 30 dias + config de limite mensal.
// Leitura via sessão (RLS owner-scoped em ia_uso cobre o filtro por user_id).

interface Linha {
  contexto:   string
  modelo:     string
  custo_brl:  number
  created_at: string
}

/** YYYY-MM-DD no fuso de São Paulo (chave de agregação diária). */
function diaSP(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const hoje    = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  const mesAtual = hoje.slice(0, 7) // YYYY-MM
  const desde30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Total acumulado (custo) — agregação leve no servidor sobre o histórico.
  const { data: totalRows } = await supabase
    .from('ia_uso')
    .select('custo_brl')
    .eq('user_id', user.id)
  const total = (totalRows ?? []).reduce((s, r) => s + Number(r.custo_brl ?? 0), 0)

  // Detalhe dos últimos 30 dias para hoje/mês/quebras/série.
  const { data: rows } = await supabase
    .from('ia_uso')
    .select('contexto, modelo, custo_brl, created_at')
    .eq('user_id', user.id)
    .gte('created_at', desde30)
    .order('created_at', { ascending: true })

  const linhas = (rows ?? []) as Linha[]

  let custoHoje = 0, custoMes = 0
  const porContexto: Record<string, { custo: number; chamadas: number }> = {}
  const porModelo:   Record<string, { custo: number; chamadas: number }> = {}
  const serieMap:    Record<string, number> = {}

  for (const l of linhas) {
    const c   = Number(l.custo_brl ?? 0)
    const dia = diaSP(l.created_at)
    if (dia === hoje)            custoHoje += c
    if (dia.startsWith(mesAtual)) custoMes += c

    porContexto[l.contexto] ??= { custo: 0, chamadas: 0 }
    porContexto[l.contexto].custo += c
    porContexto[l.contexto].chamadas += 1

    porModelo[l.modelo] ??= { custo: 0, chamadas: 0 }
    porModelo[l.modelo].custo += c
    porModelo[l.modelo].chamadas += 1

    serieMap[dia] = (serieMap[dia] ?? 0) + c
  }

  // Série densa dos últimos 30 dias (preenche dias sem uso com 0).
  const serie: { dia: string; custo: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    serie.push({ dia: d, custo: Number((serieMap[d] ?? 0).toFixed(6)) })
  }

  const { data: cfg } = await supabase
    .from('configuracoes_ia')
    .select('limite_mensal_brl, limite_ativo')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({
    custo_hoje: Number(custoHoje.toFixed(6)),
    custo_mes:  Number(custoMes.toFixed(6)),
    total:      Number(total.toFixed(6)),
    por_contexto: Object.entries(porContexto)
      .map(([contexto, v]) => ({ contexto, custo: Number(v.custo.toFixed(6)), chamadas: v.chamadas }))
      .sort((a, b) => b.custo - a.custo),
    por_modelo: Object.entries(porModelo)
      .map(([modelo, v]) => ({ modelo, custo: Number(v.custo.toFixed(6)), chamadas: v.chamadas }))
      .sort((a, b) => b.custo - a.custo),
    serie_30d: serie,
    limite: {
      valor: cfg?.limite_mensal_brl != null ? Number(cfg.limite_mensal_brl) : null,
      ativo: cfg?.limite_ativo ?? false,
    },
  })
}
