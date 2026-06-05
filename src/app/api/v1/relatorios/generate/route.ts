import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { gerarRelatorioMensal, type RelatorioMensalInput } from '@/lib/relatorio-generator'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { cliente_id, mes_ano } = body as { cliente_id: string; mes_ano: string }

  if (!cliente_id || !mes_ano) {
    return NextResponse.json({ error: 'cliente_id e mes_ano são obrigatórios' }, { status: 400 })
  }

  // Verify client belongs to user
  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, nome')
    .eq('id', cliente_id)
    .eq('user_id', user.id)
    .single()

  if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  try {
    // Build minimal input — actual data can be passed from body or fetched separately
    const input: RelatorioMensalInput = {
      cliente_id,
      mes_ano,
      campanhas: body.campanhas ?? [],
      keywords: body.keywords ?? [],
      ga4: body.ga4 ?? { usuarios: 0, sessoes: 0, visualizacoes_pagina: 0, taxa_rejeicao: 0, duracao_media_sessao: 0, novos_usuarios: 0 },
      paginas: body.paginas ?? [],
      fontes: body.fontes ?? [],
    }
    const relatorio = await gerarRelatorioMensal(input, cliente.nome)
    return NextResponse.json({ data: relatorio })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
