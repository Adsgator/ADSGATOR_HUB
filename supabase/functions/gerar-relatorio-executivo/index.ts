// supabase/functions/gerar-relatorio-executivo/index.ts
// Cron: 0 10 1 * * (1º dia de cada mês às 10h)
// Gera relatório executivo consolidado da agência

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface MetricasCliente {
  id: string;
  nome: string;
  mrr: number;
  dias_atraso: number;
  investimento_ads: number;
  conversoes: number;
  cpa: number;
  ctr: number;
  status_assinatura: string;
}

interface RelatorioExecutivo {
  mes_ano: string;
  mrr_total: number;
  mrr_mes_anterior: number;
  crescimento_mrr: number;
  churn_rate: number;
  clientes_churnados: number;
  lucro: number;
  margem: number;
  ltv_cac: number;
  top_performers: Array<{
    nome: string;
    mrr: number;
    destaque: string;
  }>;
  clientes_risco: Array<{
    nome: string;
    problema: string;
    severidade: 'alta' | 'media';
  }>;
  proximos_passos: string[];
  previsao_proximo_mes: {
    tendencia: 'crescimento' | 'estavel' | 'queda';
    percentual: number;
    mrr_esperado: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const hoje = new Date();
    // 18.9 fix: relatório é sempre do mês ANTERIOR (dia 1 do mês corrente fecha o mês passado)
    const mesAnterior    = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const mesAnteriorStr = `${mesAnterior.getFullYear()}-${String(mesAnterior.getMonth() + 1).padStart(2, '0')}`;
    const mesAtual       = mesAnteriorStr; // renomear para não quebrar código abaixo
    const nomeMes        = mesAnterior.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
    // Ref ao mês anterior ao relatório (para comparativo)
    const mesRef    = new Date(mesAnterior.getFullYear(), mesAnterior.getMonth() - 1, 1);
    const mesRefStr = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, '0')}`;

    // Buscar dados de assinaturas e clientes
    const { data: assinaturas } = await supabase
      .from('assinaturas')
      .select(`
        id,
        cliente_id,
        valor_mensal,
        status,
        dias_atraso,
        clientes!inner(id, nome)
      `);

    // Buscar métricas de campanhas
    const { data: campanhas } = await supabase
      .from('campanhas_ads')
      .select('*');

    // Buscar configurações financeiras
    const { data: config } = await supabase
      .from('configuracoes_financeiras')
      .select('*')
      .eq('agencia_id', 'adsgator-main')
      .single();

    // Buscar custos detalhados
    const { data: custos } = await supabase
      .from('custos_detalhados')
      .select('*')
      .eq('ativo', true);

    // Buscar relatório do mês de referência para comparativo
    const { data: relatorioAnterior } = await supabase
      .from('relatorios_executivos')
      .select('mrr_total, conteudo_markdown')
      .eq('mes_ano', mesRefStr)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 18.8 fix: buscar CAC real de lançamentos de aquisição
    const { data: lancamentosAquisicao } = await supabase
      .from('financeiro_lancamentos')
      .select('valor')
      .eq('categoria', 'aquisicao')
      .eq('tipo', 'despesa')
      .gte('data', `${mesAnterior.getFullYear()}-${String(mesAnterior.getMonth() + 1).padStart(2, '0')}-01`);
    const cacReal = (lancamentosAquisicao ?? []).reduce((s: number, l: { valor: number }) => s + (l.valor ?? 0), 0);

    // Calcular métricas
    const assinaturasAtivas = assinaturas?.filter(a => a.status === 'ativa') || [];
    const assinaturasCanceladas = assinaturas?.filter(a => a.status === 'cancelado_debito') || [];
    const assinaturasAtraso = assinaturas?.filter(a => a.dias_atraso > 0) || [];

    const mrrTotal = assinaturasAtivas.reduce((sum, a) => sum + (a.valor_mensal || 0), 0);
    const mrrMesAnterior = relatorioAnterior?.mrr_total || mrrTotal;
    const crescimentoMRR = mrrMesAnterior > 0 ? ((mrrTotal - mrrMesAnterior) / mrrMesAnterior) * 100 : 0;

    const totalClientes = new Set(assinaturas?.map(a => a.cliente_id)).size;
    const churnRate = totalClientes > 0 ? (assinaturasCanceladas.length / totalClientes) * 100 : 0;

    // Calcular custos
    const custosFixos = custos?.filter(c => c.tipo === 'fixo').reduce((sum, c) => sum + (c.valor || 0), 0) || 0;
    const custosVariaveis = (mrrTotal * (config?.custos_variaveis_percentual || 0)) / 100;
    const custosTotais = custosFixos + custosVariaveis;
    const lucro = mrrTotal - custosTotais;
    const margem = mrrTotal > 0 ? (lucro / mrrTotal) * 100 : 0;

    // 18.8 fix: LTV/CAC com dados reais (null se sem dados)
    const ltvCac = cacReal > 0 ? (mrrTotal * 12) / cacReal : 0;

    // Agregar métricas por cliente
    const metricasPorCliente: Record<string, MetricasCliente> = {};
    
    for (const a of assinaturas || []) {
      const clienteNome = (a.clientes as any)?.nome || 'Desconhecido';
      metricasPorCliente[a.cliente_id] = {
        id: a.cliente_id,
        nome: clienteNome,
        mrr: a.valor_mensal || 0,
        dias_atraso: a.dias_atraso || 0,
        investimento_ads: 0,
        conversoes: 0,
        cpa: 0,
        ctr: 0,
        status_assinatura: a.status
      };
    }

    // Adicionar métricas de campanhas
    for (const c of campanhas || []) {
      if (metricasPorCliente[c.cliente_id]) {
        metricasPorCliente[c.cliente_id].investimento_ads += c.investimento_total || 0;
        metricasPorCliente[c.cliente_id].conversoes += c.conversoes || 0;
        metricasPorCliente[c.cliente_id].cpa = c.cpa || 0;
        metricasPorCliente[c.cliente_id].ctr = c.ctr || 0;
      }
    }

    const clientesArray = Object.values(metricasPorCliente);

    // Top performers (maiores MRR com CPA em queda ou boa performance)
    const topPerformers = clientesArray
      .filter(c => c.mrr > 0 && c.status_assinatura === 'ativa')
      .sort((a, b) => b.mrr - a.mrr)
      .slice(0, 3)
      .map(c => ({
        nome: c.nome,
        mrr: c.mrr,
        destaque: c.cpa > 0 && c.cpa < 100 ? 'CPA em queda' : 'MRR em alta'
      }));

    // Clientes em risco
    const clientesRisco: Array<{ nome: string; problema: string; severidade: 'alta' | 'media' }> = [];
    
    for (const c of clientesArray) {
      if (c.dias_atraso >= 15) {
        clientesRisco.push({
          nome: c.nome,
          problema: `${c.dias_atraso} dias de atraso`,
          severidade: c.dias_atraso >= 30 ? 'alta' : 'media'
        });
      }
      // Campanhas com problemas (CPA alto ou CTR baixo)
      if (c.investimento_ads > 100 && (c.cpa > 200 || c.ctr < 0.01)) {
        clientesRisco.push({
          nome: c.nome,
          problema: c.cpa > 200 ? 'CPA elevado' : 'CTR abaixo do ideal',
          severidade: 'media'
        });
      }
    }

    // Próximos passos baseados nos dados
    const proximosPassos: string[] = [];
    if (clientesRisco.length > 0) {
      proximosPassos.push(`Resolver atraso de ${clientesRisco[0]?.nome}`);
    }
    if (assinaturasAtraso.length > 0) {
      proximosPassos.push(`Cobrança da régua para ${assinaturasAtraso.length} clientes`);
    }
    proximosPassos.push('Análise de otimização de campanhas com CPA > R$ 150');
    if (topPerformers.length > 0) {
      proximosPassos.push(`Case study de ${topPerformers[0]?.nome}`);
    }

    // Previsão para próximo mês
    const tendencia = crescimentoMRR > 5 ? 'crescimento' : crescimentoMRR < -5 ? 'queda' : 'estavel';
    const percentualPrevisto = Math.abs(crescimentoMRR) * (tendencia === 'crescimento' ? 1.1 : 0.9);
    const mrrEsperado = mrrTotal * (1 + (tendencia === 'crescimento' ? 0.15 : tendencia === 'queda' ? -0.05 : 0.02));

    // Gerar conteúdo markdown
    const conteudoMarkdown = gerarMarkdownRelatorio({
      nomeMes,
      mrrTotal,
      crescimentoMRR,
      churnRate,
      clientesChurnados: assinaturasCanceladas.length,
      lucro,
      margem,
      ltvCac,
      topPerformers,
      clientesRisco,
      proximosPassos,
      previsao: {
        tendencia,
        percentual: percentualPrevisto,
        mrrEsperado
      }
    });

    // 18.7 fix: UPSERT em vez de INSERT — idempotente (não falha no 2º run)
    const { data: relatorio, error } = await supabase
      .from('relatorios_executivos')
      .upsert({
        mes_ano: mesAtual,
        mrr_total: mrrTotal,
        churn_rate: churnRate,
        lucro: lucro,
        margem: margem,
        ltv_cac: ltvCac,
        top_performers: topPerformers,
        clientes_risco: clientesRisco,
        proximos_passos: proximosPassos,
        previsao_proximo_mes: {
          tendencia,
          percentual: percentualPrevisto,
          mrr_esperado: mrrEsperado
        },
        conteudo_markdown: conteudoMarkdown,
        enviado_email: false,
        visualizado: false
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        mes_ano: mesAtual,
        relatorio_id: relatorio.id,
        resumo: {
          mrr: mrrTotal,
          churn: `${churnRate.toFixed(1)}%`,
          lucro,
          margem: `${margem.toFixed(1)}%`,
          ltv_cac: ltvCac.toFixed(1)
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[gerar-relatorio-executivo]', err);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function gerarMarkdownRelatorio(data: {
  nomeMes: string;
  mrrTotal: number;
  crescimentoMRR: number;
  churnRate: number;
  clientesChurnados: number;
  lucro: number;
  margem: number;
  ltvCac: number;
  topPerformers: Array<{ nome: string; mrr: number; destaque: string }>;
  clientesRisco: Array<{ nome: string; problema: string; severidade: string }>;
  proximosPassos: string[];
  previsao: { tendencia: string; percentual: number; mrrEsperado: number };
}): string {
  const arrow = data.crescimentoMRR >= 0 ? '↗' : '↘';
  const arrowPrevisao = data.previsao.tendencia === 'crescimento' ? '↗' : data.previsao.tendencia === 'queda' ? '↘' : '→';
  
  return `MÊS: ${data.nomeMes}

PERFORMANCE
MRR: R$ ${data.mrrTotal.toLocaleString('pt-BR')} ${arrow} ${Math.abs(data.crescimentoMRR).toFixed(1)}% | Churn: ${data.churnRate.toFixed(1)}% (${data.clientesChurnados} cliente${data.clientesChurnados !== 1 ? 's' : ''})
Lucro: R$ ${data.lucro.toLocaleString('pt-BR')} | Margem: ${data.margem.toFixed(0)}%
LTV/CAC: ${data.ltvCac.toFixed(1)}x (${data.ltvCac > 20 ? 'Excelente' : data.ltvCac > 10 ? 'Bom' : 'Atenção'})

TOP PERFORMERS
${data.topPerformers.map((p, i) => `${i + 1}. ${p.nome} — R$ ${p.mrr.toLocaleString('pt-BR')} MRR, ${p.destaque}`).join('\n') || 'Nenhum dado disponível'}

CLIENTES EM RISCO
${data.clientesRisco.map((c, i) => `${i + 1}. ${c.nome} — ${c.problema}`).join('\n') || 'Nenhum cliente em risco identificado'}

PRÓXIMOS PASSOS
${data.proximosPassos.map((p, i) => `${i + 1}. ${p}`).join('\n')}

PREVISÃO ${new Date().toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()}
Tendência: ${arrowPrevisao} ${data.previsao.percentual.toFixed(0)}% de ${data.previsao.tendencia === 'crescimento' ? 'crescimento' : data.previsao.tendencia === 'queda' ? 'queda' : 'estabilidade'} ${data.previsao.tendencia === 'crescimento' ? '(se churn se normaliza)' : ''}
Expectativa: R$ ${data.previsao.mrrEsperado.toLocaleString('pt-BR')} de MRR

---
Gerado automaticamente pela Adsgator em ${new Date().toLocaleString('pt-BR')}`;
}
