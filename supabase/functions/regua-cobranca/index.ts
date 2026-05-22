import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    console.log('[REGUA-COBRANCA] Iniciando verificação de atrasos...');

    const hoje = new Date();
    const { data: assinaturas, error } = await supabase
      .from('assinaturas')
      .select('*, clientes(id, nome, email, whatsapp)')
      .eq('status', 'ativa')
      .not('data_proxima_cobranca', 'is', null);

    if (error) throw new Error(error.message);

    let processadas = 0;

    for (const assinatura of assinaturas ?? []) {
      const dataCobranca = new Date(assinatura.data_proxima_cobranca);
      const diasAtraso   = Math.floor(
        (hoje.getTime() - dataCobranca.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diasAtraso <= 0) continue;

      let novoStatus = assinatura.status;

      if (diasAtraso >= 30) {
        novoStatus = 'cancelado_debito';
      } else if (diasAtraso >= 15) {
        novoStatus = 'atrasado_grave';
      } else if (diasAtraso >= 7) {
        novoStatus = 'atrasado';
      }

      await supabase
        .from('assinaturas')
        .update({ dias_atraso: diasAtraso, status: novoStatus })
        .eq('id', assinatura.id);

      if ([7, 15, 30].includes(diasAtraso)) {
        await supabase.from('historico_acoes').insert({
          cliente_id:     assinatura.cliente_id,
          tipo_acao:      'alerta_financeiro',
          descricao:      `Pagamento em atraso há ${diasAtraso} dias. Valor: R$ ${assinatura.valor_mensal}`,
          valor_impactado: assinatura.valor_mensal,
          metadata:       { dias_atraso: diasAtraso, status: novoStatus },
        });

        await supabase.from('alertas').insert({
          cliente_id: assinatura.cliente_id,
          tipo:       'pagamento_atrasado',
          mensagem:   `Pagamento em atraso há ${diasAtraso} dias`,
          lido:       false,
        });

        console.log(`[ALERTA] ${assinatura.clientes?.nome} — ${diasAtraso}d de atraso`);
      }

      processadas++;
    }

    return new Response(
      JSON.stringify({ success: true, processadas }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[ERRO]', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
