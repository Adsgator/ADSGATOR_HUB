import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TEST_MODE, TEST_CONFIG, logTest, maskSensitive } from '../_shared/test-mode.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const evento  = payload.event as string;
    const pagamento = payload.payment;

    logTest(`Webhook recebido - Evento: ${evento}`);
    if (TEST_MODE) {
      console.log('[🧪 TEST_MODE] Processando em modo de teste - nenhum cliente real será afetado');
    }
    console.log(`[ASAAS WEBHOOK] Evento: ${evento}`);

    // ============================================================
    // PAGAMENTO RECEBIDO → criar/ativar cliente
    // ============================================================
    if (evento === 'PAYMENT_RECEIVED') {
      const subscriptionId = pagamento.subscription;
      const valorPago      = pagamento.value as number;

      // Verificar se já existe assinatura com este subscription_id
      const { data: assinaturaExistente } = await supabase
        .from('assinaturas')
        .select('id, cliente_id, dias_atraso')
        .eq('asaas_subscription_id', subscriptionId)
        .maybeSingle();

      if (assinaturaExistente) {
        // Pagamento de assinatura existente — zerar atraso
        await supabase
          .from('assinaturas')
          .update({
            status:                'ativa',
            dias_atraso:           0,
            data_proxima_cobranca: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at:            new Date().toISOString(),
          })
          .eq('id', assinaturaExistente.id);

        // Se cliente estava cancelado por débito, reativar
        const { data: cliente } = await supabase
          .from('clientes')
          .select('id, status')
          .eq('id', assinaturaExistente.cliente_id)
          .single();

        if (cliente?.status === 'cancelado') {
          await supabase
            .from('clientes')
            .update({ status: 'ativo' })
            .eq('id', cliente.id);
        }

        await supabase.from('historico_acoes').insert({
          cliente_id:      assinaturaExistente.cliente_id,
          tipo_acao:       'pagamento_recebido',
          descricao:       `Pagamento de R$ ${valorPago.toFixed(2)} recebido via Asaas.`,
          valor_impactado: valorPago,
          metadata:        { asaas_subscription_id: subscriptionId, event: evento },
        });

      } else {
        // Primeira vez: criar cliente e assinatura
        const customer = payload.customer ?? {};

        const { data: novoCliente, error: errCliente } = await supabase
          .from('clientes')
          .insert({
            nome:     customer.name       ?? 'Cliente sem nome',
            email:    customer.email      ?? `${subscriptionId}@sem-email.com`,
            whatsapp: customer.mobilePhone ?? '',
            nicho:    'a_definir',
            status:   'recebido',
          })
          .select()
          .single();

        if (errCliente) throw new Error(`Erro ao criar cliente: ${errCliente.message}`);

        // Criar assinatura
        const dataProxima = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await supabase.from('assinaturas').insert({
          cliente_id:              novoCliente.id,
          plano_nome:              'Plano Adsgator',
          valor_mensal:            valorPago,
          status:                  'ativa',
          dias_atraso:             0,
          asaas_subscription_id:   subscriptionId,
          data_proxima_cobranca:   dataProxima.toISOString(),
        });

        // Criar estágio inicial no novo schema
        await supabase.from('estagios').insert({
          cliente_id:  novoCliente.id,
          nome:        'recebido',
          descricao:   'Novo cliente — enviar #BOASVINDAS agora',
          acao_label:  '#BOASVINDAS',
          acao_url:    `https://wa.me/${novoCliente.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Seja bem-vindo(a) à Adsgator! 🎉 Vou entrar em contato em breve para iniciar seu onboarding.')}`,
          checklist: JSON.stringify([
            { item: 'Enviar mensagem #BOASVINDAS no WhatsApp', done: false },
            { item: 'Criar ficha do cliente no sistema', done: false },
            { item: 'Agendar call de onboarding', done: false },
          ]),
          ativo: true,
        });

        // Registrar lançamento financeiro inicial
        await supabase.from('financeiro_lancamentos').insert({
          user_id:          novoCliente.user_id,
          cliente_id:       novoCliente.id,
          tipo:             'receita',
          categoria:        'mensalidade',
          descricao:        `Primeiro pagamento — ${novoCliente.nome}`,
          valor:            valorPago,
          data:             new Date().toISOString().split('T')[0],
          asaas_payment_id: subscriptionId,
          status:           'confirmado',
        });

        // Criar notificação de ação imediata
        // 🧪 Em modo de teste, usa dados de teste
        const notifWhatsApp = TEST_MODE 
          ? TEST_CONFIG.testWhatsApp 
          : novoCliente.whatsapp?.replace(/\D/g, '');
        
        await supabase.from('notificacoes').insert({
          user_id:    novoCliente.user_id,
          cliente_id: novoCliente.id,
          tipo:       'urgente',
          titulo:     TEST_MODE ? `${TEST_CONFIG.testPrefixo} Novo cliente recebido!` : 'Novo cliente recebido!',
          mensagem:   TEST_MODE 
            ? `[TESTE] ${novoCliente.nome} seria notificado. WhatsApp real: ${maskSensitive(novoCliente.whatsapp || 'N/A')}`
            : `${novoCliente.nome} aguarda #BOASVINDAS agora.`,
          acao_label: '#BOASVINDAS',
          acao_url:   `https://wa.me/${notifWhatsApp}?text=${encodeURIComponent('Olá! Seja bem-vindo(a) à Adsgator! 🎉')}`,
        });
      }
    }

    // ============================================================
    // COBRANÇA VENCIDA → régua de cobrança
    // ============================================================
    if (evento === 'PAYMENT_OVERDUE') {
      const subscriptionId = pagamento.subscription;
      const diasAtraso     = pagamento.daysOverdue as number;

      const { data: assinatura } = await supabase
        .from('assinaturas')
        .select('id, cliente_id, dias_atraso, valor_mensal, clientes(nome)')
        .eq('asaas_subscription_id', subscriptionId)
        .maybeSingle();

      if (!assinatura) {
        return new Response(JSON.stringify({ ignored: true }), { status: 200, headers: corsHeaders });
      }

      // Processar apenas se o nível de atraso subiu (evita re-processamento)
      if (diasAtraso >= 7 && diasAtraso < 15 && assinatura.dias_atraso < 7) {
        await supabase.from('assinaturas').update({ dias_atraso: 7, status: 'atraso_7_dias' }).eq('id', assinatura.id);
        await supabase.from('historico_acoes').insert({
          cliente_id:      assinatura.cliente_id,
          tipo_acao:       'alerta_atraso_7_dias',
          descricao:       '⚠️ Pagamento com 7 dias de atraso. Suspensão de campanhas iminente em 8 dias.',
          valor_impactado: assinatura.valor_mensal,
          metadata:        { dias_atraso: 7, marcador: 'laranja' },
        });
        await supabase.from('estagios_operacionais').insert({
          cliente_id:       assinatura.cliente_id,
          estagio:          'alerta_financeiro_7d',
          acao_proxima:     'Contatar cliente via WhatsApp avisando sobre suspensão iminente de campanhas',
          pendente_cliente: true,
        });
      }

      if (diasAtraso >= 15 && diasAtraso < 30 && assinatura.dias_atraso < 15) {
        await supabase.from('assinaturas').update({ dias_atraso: 15, status: 'atraso_15_dias' }).eq('id', assinatura.id);
        await supabase.from('historico_acoes').insert({
          cliente_id:      assinatura.cliente_id,
          tipo_acao:       'notificacao_quebra_contrato',
          descricao:       '🔴 Pagamento com 15 dias de atraso. Contrato quebrado. Aguardando instrução para remover LP.',
          valor_impactado: assinatura.valor_mensal,
          metadata:        { dias_atraso: 15, marcador: 'vermelho' },
        });
      }

      if (diasAtraso >= 30 && assinatura.dias_atraso < 30) {
        await supabase.from('assinaturas').update({ dias_atraso: 30, status: 'cancelado_debito' }).eq('id', assinatura.id);
        await supabase.from('clientes').update({ status: 'cancelado' }).eq('id', assinatura.cliente_id);
        await supabase.from('historico_acoes').insert({
          cliente_id:      assinatura.cliente_id,
          tipo_acao:       'cancelamento_automatico_30_dias',
          descricao:       '❌ Assinatura cancelada. 30+ dias de atraso. Ação necessária: remover LP e assets do Storage.',
          valor_impactado: assinatura.valor_mensal,
          metadata:        { dias_atraso: 30, status_final: 'cancelado_debito' },
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[WEBHOOK ERRO]', msg);
    return new Response(
      JSON.stringify({ error: msg, test_mode: TEST_MODE }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
