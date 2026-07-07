import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  obterDadosCampanhasAds,
  obterTermosPesquisa,
  obterDemografia,
  obterGeografia,
  obterDevice,
  obterHorario,
  obterLeilao,
} from '@/lib/google-ads';
import {
  obterDadosGA4,
  obterPaginasTopPerformance,
  obterFontesTrafego,
  obterGeoGA4,
  obterDeviceGA4,
  obterEventosGA4,
} from '@/lib/google-analytics';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> },
) {
  const { clienteId } = await params;

  const supabase = await createClient();

  // Verificar autenticação via cookie/headers
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // Buscar cliente e suas credenciais
  const { data: cliente } = await supabase
    .from('clientes')
    .select('google_ads_customer_id, ga4_property_id, google_ads_enabled, ga4_enabled')
    .eq('id', clienteId)
    .single();

  if (!cliente) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
  }

  // Extrair período da query (default: último 30 dias)
  const { searchParams } = new URL(request.url);
  const periodo = searchParams.get('periodo') || '30d';
  
  // Intervalo real do período pedido (antes virava o mês da data inicial —
  // no começo do mês mostrava o mês anterior inteiro).
  const dias = periodo === '7d' ? 7 : periodo === '90d' ? 90 : 30;
  const hoje = new Date();
  const fmtData = (d: Date) => d.toISOString().slice(0, 10);
  const dataFim = fmtData(hoje);
  const dataInicio = fmtData(new Date(hoje.getTime() - dias * 24 * 60 * 60 * 1000));

  try {
    // Buscar dados em paralelo
    const nomesFontes = [
      'campanhas', 'termosPesquisa', 'demografia', 'geografia', 'deviceAds',
      'horario', 'ga4Dados', 'paginasTop', 'fontesTrafego', 'geoGA4',
      'deviceGA4', 'leilao', 'eventosGA4',
    ];
    const settled = await Promise.allSettled([
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterDadosCampanhasAds(cliente.google_ads_customer_id, dataInicio, dataFim)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterTermosPesquisa(cliente.google_ads_customer_id, dataInicio, dataFim)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterDemografia(cliente.google_ads_customer_id, dataInicio, dataFim)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterGeografia(cliente.google_ads_customer_id, dataInicio, dataFim)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterDevice(cliente.google_ads_customer_id, dataInicio, dataFim)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterHorario(cliente.google_ads_customer_id, dataInicio, dataFim)
        : Promise.resolve([]),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterDadosGA4(cliente.ga4_property_id, dataInicio, dataFim)
        : Promise.resolve(null),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterPaginasTopPerformance(cliente.ga4_property_id, dataInicio, dataFim)
        : Promise.resolve([]),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterFontesTrafego(cliente.ga4_property_id, dataInicio, dataFim)
        : Promise.resolve([]),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterGeoGA4(cliente.ga4_property_id, dataInicio, dataFim)
        : Promise.resolve([]),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterDeviceGA4(cliente.ga4_property_id, dataInicio, dataFim)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterLeilao(cliente.google_ads_customer_id, dataInicio, dataFim)
        : Promise.resolve([]),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterEventosGA4(cliente.ga4_property_id, dataInicio, dataFim)
        : Promise.resolve([]),
    ]);

    // Falha de uma fonte não derruba a resposta, mas fica registrada no log
    // (antes morria em silêncio e a tela mostrava tudo zerado sem pista).
    settled.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`[analytics/live] ${nomesFontes[i]} falhou:`, r.reason);
      }
    });

    const [
      campanhas, termosPesquisa, demografia, geografia, deviceAds, horario,
      ga4Dados, paginasTop, fontesTrafego, geoGA4, deviceGA4, leilao, eventosGA4,
    ] = settled;

    // Consolidar resultados
    const resultado = {
      googleAds: {
        enabled: cliente.google_ads_enabled,
        campanhas: campanhas.status === 'fulfilled' ? campanhas.value : [],
        termosPesquisa: termosPesquisa.status === 'fulfilled' ? termosPesquisa.value : [],
        demografia: demografia.status === 'fulfilled' ? demografia.value : [],
        geografia: geografia.status === 'fulfilled' ? geografia.value : [],
        device: deviceAds.status === 'fulfilled' ? deviceAds.value : [],
        horario: horario.status === 'fulfilled' ? horario.value : [],
        leilao: leilao.status === 'fulfilled' ? leilao.value : [],
      },
      ga4: {
        enabled: cliente.ga4_enabled,
        dados: ga4Dados.status === 'fulfilled' ? ga4Dados.value : null,
        paginasTop: paginasTop.status === 'fulfilled' ? paginasTop.value : [],
        fontesTrafego: fontesTrafego.status === 'fulfilled' ? fontesTrafego.value : [],
        geografia: geoGA4.status === 'fulfilled' ? geoGA4.value : [],
        device: deviceGA4.status === 'fulfilled' ? deviceGA4.value : [],
        eventos: eventosGA4.status === 'fulfilled' ? eventosGA4.value : [],
      },
      periodo,
      atualizadoEm: new Date().toISOString(),
    };

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar dados de analytics:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados de analytics' },
      { status: 500 }
    );
  }
}
