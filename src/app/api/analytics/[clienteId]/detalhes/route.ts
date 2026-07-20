import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  obterDetalheAnalytics, DIMENSOES_DETALHE, FonteDetalhe,
} from '@/lib/analytics-detalhes'

export const dynamic = 'force-dynamic'

/**
 * GET /api/analytics/[clienteId]/detalhes
 *   ?fonte=ads|ga4 & dimensao=<corte> & inicio=YYYY-MM-DD & fim=YYYY-MM-DD
 *   [&campanha=<id do Google Ads>] [&grupo=<id do grupo de anúncios>] [&renovar=1]
 *
 * Serve os cortes do Analytics 2.0 a partir do cache analytics_detalhes
 * (TTL ~6h; período fechado 7d) e renova on-demand — a resposta indica
 * cache: hit | renovado | desatualizado (renovação falhou, dado antigo).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> },
) {
  const { clienteId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const fonte = searchParams.get('fonte') as FonteDetalhe | null
  const dimensao = searchParams.get('dimensao') ?? ''
  const inicio = searchParams.get('inicio') ?? ''
  const fim = searchParams.get('fim') ?? ''

  if (fonte !== 'ads' && fonte !== 'ga4') {
    return NextResponse.json({ error: 'Parâmetro fonte deve ser "ads" ou "ga4"' }, { status: 400 })
  }
  if (!DIMENSOES_DETALHE[fonte].includes(dimensao)) {
    return NextResponse.json(
      { error: `Dimensão inválida para ${fonte}: "${dimensao}" (aceitas: ${DIMENSOES_DETALHE[fonte].join(', ')})` },
      { status: 400 },
    )
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(inicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fim) || fim < inicio) {
    return NextResponse.json({ error: 'Período inválido: use inicio/fim YYYY-MM-DD com fim ≥ início' }, { status: 400 })
  }

  const { data: cliente } = await supabase
    .from('clientes')
    .select('google_ads_customer_id, ga4_property_id, google_ads_enabled, ga4_enabled')
    .eq('id', clienteId)
    .eq('user_id', user.id)
    .single()
  if (!cliente) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  if (fonte === 'ads' && (!cliente.google_ads_enabled || !cliente.google_ads_customer_id)) {
    return NextResponse.json(
      { error: 'Google Ads não conectado neste cliente — preencha o customer ID e ligue o toggle em Integrações' },
      { status: 400 },
    )
  }
  if (fonte === 'ga4' && (!cliente.ga4_enabled || !cliente.ga4_property_id)) {
    return NextResponse.json(
      { error: 'GA4 não conectado neste cliente — preencha o property ID e ligue o toggle em Integrações' },
      { status: 400 },
    )
  }

  try {
    const detalhe = await obterDetalheAnalytics({
      supabase,
      userId:         user.id,
      clienteId,
      contaAds:       cliente.google_ads_customer_id,
      propriedadeGa4: cliente.ga4_property_id,
      fonte,
      dimensao,
      periodo:        { inicio, fim },
      campanhaId:     searchParams.get('campanha') ?? undefined,
      grupoAnuncioId: searchParams.get('grupo') ?? undefined,
      renovar:        searchParams.get('renovar') === '1',
    })
    return NextResponse.json(detalhe)
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : 'Erro ao buscar detalhes'
    console.error(`[analytics/detalhes] ${fonte}/${dimensao} falhou:`, error)
    return NextResponse.json({ error: mensagem }, { status: 502 })
  }
}
