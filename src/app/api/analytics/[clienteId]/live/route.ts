import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  obterDadosCampanhasAds,
  obterTermosPesquisa,
  obterDemografia,
  obterGeografia,
  obterDevice,
  obterHorario,
} from '@/lib/google-ads';
import {
  obterDadosGA4,
  obterPaginasTopPerformance,
  obterFontesTrafego,
  obterGeoGA4,
  obterDeviceGA4,
} from '@/lib/google-analytics';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> },
) {
  const { clienteId } = await params;

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
  
  // Calcular datas baseado no período
  const hoje = new Date();
  let dataInicio: Date;
  
  switch (periodo) {
    case '7d':
      dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      dataInicio = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  const mesAno = `${dataInicio.getFullYear()}-${String(dataInicio.getMonth() + 1).padStart(2, '0')}`;

  try {
    // Buscar dados em paralelo
    const [
      campanhas,
      termosPesquisa,
      demografia,
      geografia,
      deviceAds,
      horario,
      ga4Dados,
      paginasTop,
      fontesTrafego,
      geoGA4,
      deviceGA4,
    ] = await Promise.allSettled([
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterDadosCampanhasAds(cliente.google_ads_customer_id, mesAno)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterTermosPesquisa(cliente.google_ads_customer_id, mesAno)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterDemografia(cliente.google_ads_customer_id, mesAno)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterGeografia(cliente.google_ads_customer_id, mesAno)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterDevice(cliente.google_ads_customer_id, mesAno)
        : Promise.resolve([]),
      cliente.google_ads_enabled && cliente.google_ads_customer_id
        ? obterHorario(cliente.google_ads_customer_id, mesAno)
        : Promise.resolve([]),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterDadosGA4(cliente.ga4_property_id, mesAno)
        : Promise.resolve(null),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterPaginasTopPerformance(cliente.ga4_property_id, mesAno)
        : Promise.resolve([]),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterFontesTrafego(cliente.ga4_property_id, mesAno)
        : Promise.resolve([]),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterGeoGA4(cliente.ga4_property_id, mesAno)
        : Promise.resolve([]),
      cliente.ga4_enabled && cliente.ga4_property_id
        ? obterDeviceGA4(cliente.ga4_property_id, mesAno)
        : Promise.resolve([]),
    ]);

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
      },
      ga4: {
        enabled: cliente.ga4_enabled,
        dados: ga4Dados.status === 'fulfilled' ? ga4Dados.value : null,
        paginasTop: paginasTop.status === 'fulfilled' ? paginasTop.value : [],
        fontesTrafego: fontesTrafego.status === 'fulfilled' ? fontesTrafego.value : [],
        geografia: geoGA4.status === 'fulfilled' ? geoGA4.value : [],
        device: deviceGA4.status === 'fulfilled' ? deviceGA4.value : [],
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
