import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { NewsClienteData } from '@/lib/types/news'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Buscar clientes ativos do user (sem limit, mostra todos que qualificam)
  const { data: clientes, error: clientesError } = await supabase
    .from('clientes')
    .select('id, nome, status, nicho, saldo_google, dominio, website, dias_atraso, mrr')
    .eq('user_id', user.id)
    .in('status', ['ativo', 'onboarding', 'setup_trafego', 'recebido'])
    .order('mrr', { ascending: false })
    .limit(20)

  if (clientesError) {
    return NextResponse.json({ error: clientesError.message }, { status: 500 })
  }

  if (!clientes || clientes.length === 0) {
    console.log('[/api/v1/news] Nenhum cliente ativo encontrado')
    return NextResponse.json({ data: [] })
  }

  console.log(`[/api/v1/news] ${clientes.length} clientes encontrados`)

  // Para cada cliente, buscar o último snapshot de analytics
  const clienteIds = clientes.map(c => c.id)

  const { data: snapshots } = await supabase
    .from('analytics_snapshots')
    .select('cliente_id, investimento, impressoes, cliques, ctr, conversoes, cpa, roas, sessoes, usuarios, created_at')
    .in('cliente_id', clienteIds)
    .order('created_at', { ascending: false })

  // Agrupar: pegar apenas o snapshot mais recente por cliente
  type SnapshotRow = { cliente_id: string; investimento: number; impressoes: number; cliques: number; ctr: number; conversoes: number; cpa: number; roas: number; sessoes: number; usuarios: number; created_at: string }
  const latestByCliente = new Map<string, SnapshotRow>()
  if (snapshots) {
    for (const snap of snapshots) {
      if (!latestByCliente.has(snap.cliente_id)) {
        latestByCliente.set(snap.cliente_id, snap)
      }
    }
  }

  const newsData: NewsClienteData[] = clientes.map(cliente => {
    const snap = latestByCliente.get(cliente.id)

    // Se há snapshot, usa dados reais; senão usa defaults (0)
    const investimento = snap?.investimento ?? 0
    const cliques = snap?.cliques ?? 0
    const impressoes = snap?.impressoes ?? 0
    const conversoes = snap?.conversoes ?? 0
    const cpa = snap?.cpa ?? 0
    const ctr = snap?.ctr ?? 0
    const sessoes = snap?.sessoes ?? 0

    const cpc_medio = cliques > 0 ? investimento / cliques : 0
    const visualizacoes_pagina = Math.round(sessoes * 1.5)

    return {
      cliente_id: cliente.id,
      nome: cliente.nome,
      status: cliente.status,
      nicho: cliente.nicho,
      investimento,
      impressoes,
      cliques,
      cpc_medio,
      conversoes,
      ctr,
      cpa,
      saldo_google: cliente.saldo_google ?? 0,
      sessoes,
      visualizacoes_pagina,
      dominio: cliente.dominio,
      website: cliente.website,
      dias_atraso: cliente.dias_atraso ?? 0,
      mrr: cliente.mrr ?? 0,
      ultima_atualizacao: snap?.created_at,
    }
  })

  // Retorna sempre com dados — mesmo que vazio, para não desaparecer
  return NextResponse.json({ data: newsData })
}
