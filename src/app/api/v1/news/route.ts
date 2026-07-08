import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { NewsCardData } from '@/lib/types/news'
import { ehSnapshotSemanal } from '@/lib/analytics-snapshots'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/news?filtro=conectados|todos
 *
 * Cards do monitoramento do dashboard — um card POR SERVIÇO:
 * tráfego (Google Ads) e site (GA4); cliente com os dois aparece nos dois.
 *
 * Filtros:
 *  - conectados (default): só clientes com alguma integração LIGADA — sem
 *    cards zerados de quem nunca foi conectado.
 *  - todos: todos os clientes em operação; quem não está conectado aparece
 *    com CTA de conexão (aponta o que falta em vez de mostrar zeros).
 */

interface ClienteRow {
  id: string
  nome: string
  status: string
  nicho?: string
  saldo_google: number | null
  saldo_google_atualizado_em: string | null
  dominio?: string
  website?: string
  dias_atraso: number | null
  data_vencimento: string | null
  mrr: number | null
  google_ads_enabled: boolean | null
  ga4_enabled: boolean | null
}

interface SnapshotRow {
  cliente_id: string
  fonte: string
  periodo_inicio: string
  periodo_fim: string
  investimento: number | null
  impressoes: number | null
  cliques: number | null
  ctr: number | null
  conversoes: number | null
  cpa: number | null
  sessoes: number | null
  usuarios: number | null
  taxa_conversao: number | null
  created_at: string
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const filtro = req.nextUrl.searchParams.get('filtro') === 'todos' ? 'todos' : 'conectados'

  let query = supabase
    .from('clientes')
    .select('id, nome, status, nicho, saldo_google, saldo_google_atualizado_em, dominio, website, dias_atraso, data_vencimento, mrr, google_ads_enabled, ga4_enabled')
    .eq('user_id', user.id)
    .in('status', ['ativo', 'onboarding', 'setup_trafego', 'recebido'])
    .order('mrr', { ascending: false })
    .limit(30)

  if (filtro === 'conectados') {
    query = query.or('google_ads_enabled.eq.true,ga4_enabled.eq.true')
  }

  const { data: clientes, error: clientesError } = await query
  if (clientesError) {
    return NextResponse.json({ error: clientesError.message }, { status: 500 })
  }
  if (!clientes || clientes.length === 0) {
    return NextResponse.json({ data: [] })
  }

  const clienteIds = clientes.map((c) => c.id)

  const { data: snapshots } = await supabase
    .from('analytics_snapshots')
    .select('cliente_id, fonte, periodo_inicio, periodo_fim, investimento, impressoes, cliques, ctr, conversoes, cpa, sessoes, usuarios, taxa_conversao, created_at')
    .in('cliente_id', clienteIds)
    .order('periodo_fim', { ascending: false })

  // Snapshot MENSAL mais recente por cliente+fonte (semanais são do relatório)
  const latest = new Map<string, SnapshotRow>()
  for (const snap of (snapshots ?? []) as SnapshotRow[]) {
    if (ehSnapshotSemanal(snap.periodo_inicio, snap.periodo_fim)) continue
    const chave = `${snap.cliente_id}|${snap.fonte}`
    if (!latest.has(chave)) latest.set(chave, snap)
  }

  const cards: NewsCardData[] = []

  for (const cliente of clientes as ClienteRow[]) {
    const base = {
      cliente_id: cliente.id,
      nome: cliente.nome,
      status: cliente.status,
      nicho: cliente.nicho,
      dominio: cliente.dominio,
      website: cliente.website,
      dias_atraso: cliente.dias_atraso ?? 0,
      data_vencimento: cliente.data_vencimento ?? null,
      mrr: cliente.mrr ?? 0,
    }

    const snapAds = latest.get(`${cliente.id}|google_ads`)
    const snapGa4 = latest.get(`${cliente.id}|ga4`)

    if (cliente.google_ads_enabled) {
      const investimento = snapAds?.investimento ?? 0
      const cliques = snapAds?.cliques ?? 0
      cards.push({
        ...base,
        tipo: 'trafego',
        conectado: true,
        tem_dados: !!snapAds,
        investimento,
        impressoes: snapAds?.impressoes ?? 0,
        cliques,
        cpc_medio: cliques > 0 ? investimento / cliques : 0,
        conversoes: snapAds?.conversoes ?? 0,
        ctr: snapAds?.ctr ?? 0,
        cpa: snapAds?.cpa ?? 0,
        saldo_google: cliente.saldo_google,
        saldo_atualizado_em: cliente.saldo_google_atualizado_em,
        ultima_atualizacao: snapAds?.created_at,
      })
    }

    if (cliente.ga4_enabled) {
      cards.push({
        ...base,
        tipo: 'site',
        conectado: true,
        tem_dados: !!snapGa4,
        sessoes: snapGa4?.sessoes ?? 0,
        usuarios: snapGa4?.usuarios ?? 0,
        conversoes: snapGa4?.conversoes ?? 0,
        taxa_conversao: snapGa4?.taxa_conversao ?? 0,
        ultima_atualizacao: snapGa4?.created_at,
      })
    }

    // Modo "todos": quem não tem nada conectado vira CTA de conexão
    if (!cliente.google_ads_enabled && !cliente.ga4_enabled && filtro === 'todos') {
      cards.push({ ...base, tipo: 'trafego', conectado: false, tem_dados: false })
    }
  }

  return NextResponse.json({ data: cards, filtro })
}
