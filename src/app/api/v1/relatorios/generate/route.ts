import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { gerarRelatorioMensal, type RelatorioMensalInput } from '@/lib/relatorio-generator'
import { intervaloMes } from '@/lib/analytics-sync'
import type { DadosCampanhaAds, PalavraChavePerformance } from '@/lib/google-ads'
import type { DadosGA4 } from '@/lib/google-analytics'

// Sequência de chamadas Google (BQ/Ads/GA4) pode passar do limite default.
export const maxDuration = 120

const GA4_VAZIO: DadosGA4 = {
  sessoes: 0, usuarios_novos: 0, visualizacoes_pagina: 0,
  taxa_engajamento: 0, duracao_media_sessao: 0,
  taxa_rejeicao: 0, conversoes: 0, valor_conversao_total: 0,
}

/**
 * POST /api/v1/relatorios/generate — body: { cliente_id, mes_ano }
 *
 * Monta o RelatorioMensalInput NO SERVIDOR: campanhas e keywords vêm do
 * BigQuery (histórico exato do mês, inclusive campanhas já removidas) com
 * fallback na API ao vivo do Google Ads enquanto o Data Transfer não carrega
 * a conta; GA4 vem da Data API. Antes, quem chamava precisava mandar tudo no
 * body — e sem isso saía relatório vazio. O body ainda pode sobrescrever
 * qualquer bloco (uso externo).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { cliente_id, mes_ano } = body as { cliente_id: string; mes_ano: string }

  if (!cliente_id || !mes_ano || !/^\d{4}-\d{2}$/.test(mes_ano)) {
    return NextResponse.json({ error: 'cliente_id e mes_ano (YYYY-MM) são obrigatórios' }, { status: 400 })
  }

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, nome, google_ads_customer_id, ga4_property_id')
    .eq('id', cliente_id)
    .eq('user_id', user.id)
    .single()

  if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const { inicio, fim } = intervaloMes(mes_ano)
  const fontesUsadas: Record<string, string> = {}

  try {
    // ── Google Ads: BigQuery primeiro, API ao vivo como fallback ──
    let campanhas: DadosCampanhaAds[] = body.campanhas ?? []
    let keywords: PalavraChavePerformance[] = body.keywords ?? []

    if (!body.campanhas && cliente.google_ads_customer_id) {
      try {
        const { desempenhoHistorico } = await import('@/lib/bigquery')
        const [linhasCampanha, linhasKeyword] = await Promise.all([
          desempenhoHistorico(cliente.google_ads_customer_id, inicio, fim, 'campanha'),
          desempenhoHistorico(cliente.google_ads_customer_id, inicio, fim, 'keyword'),
        ])
        campanhas = linhasCampanha.map((l) => ({
          campanha_id: '', campanha_nome: l.chave, status: '',
          impressoes: l.impressoes, cliques: l.cliques,
          ctr: l.impressoes > 0 ? (l.cliques / l.impressoes) * 100 : 0,
          custo_total: l.custo, conversoes: l.conversoes,
          cpa: l.conversoes > 0 ? l.custo / l.conversoes : 0,
          roas: l.custo > 0 ? l.conversoes / l.custo : 0,
        }))
        keywords = linhasKeyword.map((l) => ({
          keyword: l.chave, impressoes: l.impressoes, cliques: l.cliques,
          ctr: l.impressoes > 0 ? (l.cliques / l.impressoes) * 100 : 0,
          cpc_medio: l.cliques > 0 ? l.custo / l.cliques : 0,
          conversoes: l.conversoes, custo: l.custo,
        }))
        fontesUsadas.google_ads = 'bigquery'
      } catch (bqErr) {
        // Conta ainda sem tabelas no BQ (transfer pendente) ou BQ indisponível
        // → busca ao vivo na API do Google Ads, mesmo intervalo.
        console.warn(`[relatorios/generate] BigQuery indisponível p/ ${cliente.nome} — fallback API ao vivo:`,
          bqErr instanceof Error ? bqErr.message : bqErr)
        const { obterDadosCampanhasAds, obterPalavrasChavePerformance } = await import('@/lib/google-ads')
        ;[campanhas, keywords] = await Promise.all([
          obterDadosCampanhasAds(cliente.google_ads_customer_id, inicio, fim),
          obterPalavrasChavePerformance(cliente.google_ads_customer_id, inicio, fim),
        ])
        fontesUsadas.google_ads = 'api_ao_vivo'
      }
    }

    // ── GA4: Data API (o clamp interno evita fim no futuro) ──
    let ga4: DadosGA4 = body.ga4 ?? GA4_VAZIO
    let paginas = body.paginas ?? []
    let fontes = body.fontes ?? []

    if (!body.ga4 && cliente.ga4_property_id) {
      const { obterDadosGA4, obterPaginasTopPerformance, obterFontesTrafego } = await import('@/lib/google-analytics')
      ;[ga4, paginas, fontes] = await Promise.all([
        obterDadosGA4(cliente.ga4_property_id, inicio, fim),
        obterPaginasTopPerformance(cliente.ga4_property_id, inicio, fim),
        obterFontesTrafego(cliente.ga4_property_id, inicio, fim),
      ])
      fontesUsadas.ga4 = 'data_api'
    }

    const input: RelatorioMensalInput = { cliente_id, mes_ano, campanhas, keywords, ga4, paginas, fontes }
    const relatorio = await gerarRelatorioMensal(input, cliente.nome)
    return NextResponse.json({ data: relatorio, fontes: fontesUsadas })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
