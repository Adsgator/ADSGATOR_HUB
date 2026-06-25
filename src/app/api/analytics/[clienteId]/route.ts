import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ─── GET — lista relatórios do cliente ────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> }
) {
  try {
    const { clienteId } = await params
    const { data, error } = await supabase
      .from('relatorios_mensais')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('mes_ano', { ascending: false })
      .limit(6);

    if (error) throw error;
    return NextResponse.json({ relatorios: data ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ─── POST — solicita geração de relatório ─────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> }
) {
  try {
    const { clienteId } = await params
    const body = await req.json() as { mesAno: string };

    const { data: cliente, error: errCliente } = await supabase
      .from('clientes')
      .select('google_ads_customer_id, ga4_property_id, nome, email, user_id')
      .eq('id', clienteId)
      .single();

    if (errCliente || !cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Se as credenciais estiverem configuradas, gerar com dados reais
    if (cliente.google_ads_customer_id && cliente.ga4_property_id) {
      const [
        { obterDadosCampanhasAds, obterPalavrasChavePerformance },
        { obterDadosGA4, obterPaginasTopPerformance, obterFontesTrafego },
        { gerarRelatorioMensal },
      ] = await Promise.all([
        import('@/lib/google-ads'),
        import('@/lib/google-analytics'),
        import('@/lib/relatorio-generator'),
      ]);

      const [campanhas, keywords, ga4, paginas, fontes] = await Promise.all([
        obterDadosCampanhasAds(cliente.google_ads_customer_id, body.mesAno),
        obterPalavrasChavePerformance(cliente.google_ads_customer_id, body.mesAno),
        obterDadosGA4(cliente.ga4_property_id, body.mesAno),
        obterPaginasTopPerformance(cliente.ga4_property_id, body.mesAno),
        obterFontesTrafego(cliente.ga4_property_id, body.mesAno),
      ]);

      await gerarRelatorioMensal(
        { cliente_id: clienteId, mes_ano: body.mesAno, campanhas, keywords, ga4, paginas, fontes },
        cliente.nome,
      );

      // Análise IA via Vertex — enriquece o relatório com insights automáticos
      try {
        const { analisarRelatorioIA } = await import('@/lib/vertex-ai');
        const custoTotal = campanhas.reduce((s, c) => s + c.custo_total, 0);
        const conversoesAds = campanhas.reduce((s, c) => s + c.conversoes, 0);
        const analise = await analisarRelatorioIA(
          cliente.nome, body.mesAno,
          custoTotal, conversoesAds, ga4.sessoes,
          ga4.taxa_engajamento, ga4.taxa_rejeicao,
          custoTotal > 0 ? conversoesAds / custoTotal : 0,
          (cliente as { user_id?: string }).user_id,
        );
        await supabase
          .from('relatorios_mensais')
          .update({ analise_ia: analise })
          .eq('cliente_id', clienteId)
          .eq('mes_ano', body.mesAno);
      } catch (iaErr) {
        console.error('Vertex AI (não crítico):', iaErr);
      }

      // Email automático ao cliente (só se a automação estiver ativa).
      try {
        const { dispararEmailAutomatico } = await import('@/lib/email-automation');
        await dispararEmailAutomatico(supabase, {
          tipo: 'email_relatorio_mensal',
          templateId: 'report-google-ads',
          destinatario: (cliente as { email?: string }).email ?? '',
          clienteId,
          variables: { nome_cliente: cliente.nome, mes_ano: body.mesAno },
        });
      } catch (mailErr) {
        console.error('Email de relatório (não crítico):', mailErr);
      }

      return NextResponse.json({ success: true, status: 'gerado' });
    }

    // Sem credenciais: criar registro pendente
    const { error } = await supabase
      .from('relatorios_mensais')
      .upsert(
        { cliente_id: clienteId, mes_ano: body.mesAno, status_geracao: 'pendente' },
        { onConflict: 'cliente_id,mes_ano' }
      );
    if (error) throw error;

    return NextResponse.json({ success: true, status: 'pendente' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
