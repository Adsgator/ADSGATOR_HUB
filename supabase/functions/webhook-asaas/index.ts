import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TEST_MODE, TEST_CONFIG, logTest, maskSensitive } from '../_shared/test-mode.ts';
import { LIMIARES_ATRASO } from '../_shared/cobranca.ts';

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

  // Valida token de autenticação do Asaas (configurado em Webhooks → Auth token)
  const expectedToken = Deno.env.get('ASAAS_WEBHOOK_KEY');
  const receivedToken = req.headers.get('asaas-access-token');
  if (!expectedToken || !receivedToken || receivedToken !== expectedToken) {
    console.error('[ASAAS WEBHOOK] Token inválido ou ausente');
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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

        // Buscar user_id do proprietário buscando o primeiro cliente com user_id (18.3 fix)
        const { data: ownerRow } = await supabase
          .from('clientes')
          .select('user_id')
          .not('user_id', 'is', null)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();
        const ownerUserId = ownerRow?.user_id ?? null;

        // Atualizar cliente com user_id do proprietário
        if (ownerUserId) {
          await supabase.from('clientes').update({ user_id: ownerUserId }).eq('id', novoCliente.id);
        }

        // Registrar lançamento financeiro inicial
        await supabase.from('financeiro_lancamentos').insert({
          user_id:          ownerUserId,
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
          user_id:    ownerUserId,
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
      if (diasAtraso >= LIMIARES_ATRASO.suspensao && diasAtraso < LIMIARES_ATRASO.grave && assinatura.dias_atraso < LIMIARES_ATRASO.suspensao) {
        await supabase.from('assinaturas').update({ dias_atraso: LIMIARES_ATRASO.suspensao, status: 'atraso_7_dias' }).eq('id', assinatura.id);
        await supabase.from('historico_acoes').insert({
          cliente_id:      assinatura.cliente_id,
          tipo_acao:       'alerta_atraso_7_dias',
          descricao:       '⚠️ Pagamento com 7 dias de atraso. Suspensão de campanhas iminente em 8 dias.',
          valor_impactado: assinatura.valor_mensal,
          metadata:        { dias_atraso: LIMIARES_ATRASO.suspensao, marcador: 'laranja' },
        });
        await supabase.from('estagios').insert({
          cliente_id: assinatura.cliente_id,
          nome:       'alerta_financeiro_7d',
          acao_label: 'Contatar cliente via WhatsApp avisando sobre suspensão iminente de campanhas',
          ativo:      true,
        });
      }

      if (diasAtraso >= LIMIARES_ATRASO.grave && diasAtraso < LIMIARES_ATRASO.critico && assinatura.dias_atraso < LIMIARES_ATRASO.grave) {
        await supabase.from('assinaturas').update({ dias_atraso: LIMIARES_ATRASO.grave, status: 'atraso_15_dias' }).eq('id', assinatura.id);
        await supabase.from('historico_acoes').insert({
          cliente_id:      assinatura.cliente_id,
          tipo_acao:       'notificacao_quebra_contrato',
          descricao:       '🔴 Pagamento com 15 dias de atraso. Contrato quebrado. Aguardando instrução para remover LP.',
          valor_impactado: assinatura.valor_mensal,
          metadata:        { dias_atraso: LIMIARES_ATRASO.grave, marcador: 'vermelho' },
        });
      }

      if (diasAtraso >= LIMIARES_ATRASO.critico && assinatura.dias_atraso < LIMIARES_ATRASO.critico) {
        await supabase.from('assinaturas').update({ dias_atraso: LIMIARES_ATRASO.critico, status: 'cancelado_debito' }).eq('id', assinatura.id);
        await supabase.from('clientes').update({ status: 'cancelado_debito' }).eq('id', assinatura.cliente_id);
        await supabase.from('historico_acoes').insert({
          cliente_id:      assinatura.cliente_id,
          tipo_acao:       'cancelamento_automatico_30_dias',
          descricao:       '❌ Assinatura cancelada. 30+ dias de atraso. Ação necessária: remover LP e assets do Storage.',
          valor_impactado: assinatura.valor_mensal,
          metadata:        { dias_atraso: LIMIARES_ATRASO.critico, status_final: 'cancelado_debito' },
        });
      }
    }

    // ============================================================
    // PAYMENT_CREATED → cobrança gerada, registrar como pendente
    // ============================================================
    if (evento === 'PAYMENT_CREATED') {
      const valor      = pagamento.value       as number
      const vencimento = pagamento.dueDate     as string
      const subId      = pagamento.subscription as string | undefined
      const { data: ass } = subId
        ? await supabase.from('assinaturas').select('id, cliente_id, clientes(nome, user_id)').eq('asaas_subscription_id', subId).maybeSingle()
        : { data: null }
      if (ass) {
        const cli = ass.clientes as { nome: string; user_id: string } | null
        const { data: existing } = await supabase.from('financeiro_lancamentos').select('id').eq('asaas_payment_id', pagamento.id as string).maybeSingle()
        if (!existing) {
          await supabase.from('financeiro_lancamentos').insert({
            user_id:          cli?.user_id,
            cliente_id:       ass.cliente_id,
            tipo:             'receita',
            categoria:        'mensalidade',
            descricao:        `Cobrança gerada — ${cli?.nome}`,
            valor,
            data:             vencimento,
            asaas_payment_id: pagamento.id as string,
            status:           'pendente',
          })
        }
        await supabase.from('historico_acoes').insert({
          cliente_id: ass.cliente_id,
          tipo_acao:  'cobranca_gerada',
          descricao:  `🧾 Cobrança de R$ ${valor.toFixed(2)} gerada — vencimento ${vencimento}.`,
          valor_impactado: valor,
          metadata:   { event: evento, asaas_payment_id: pagamento.id },
        })
      }
    }

    // ============================================================
    // PAYMENT_CONFIRMED → saldo confirmado, aguardando disponibilização
    // ============================================================
    if (evento === 'PAYMENT_CONFIRMED') {
      const valor = pagamento.value as number
      const subId = pagamento.subscription as string | undefined
      await supabase.from('financeiro_lancamentos').update({ status: 'confirmado' }).eq('asaas_payment_id', pagamento.id as string)
      const { data: ass } = subId
        ? await supabase.from('assinaturas').select('id, cliente_id, clientes(nome, user_id)').eq('asaas_subscription_id', subId).maybeSingle()
        : { data: null }
      if (ass) {
        const cli = ass.clientes as { nome: string; user_id: string } | null
        await supabase.from('notificacoes').insert({
          user_id:    cli?.user_id,
          cliente_id: ass.cliente_id,
          tipo:       'sucesso',
          titulo:     `${cli?.nome} — Pagamento confirmado`,
          mensagem:   `R$ ${valor.toFixed(2)} confirmado. Saldo em processamento, disponível em breve.`,
          acao_url:   `/clientes/${ass.cliente_id}`,
          acao_label: 'Ver cliente',
        })
      }
    }

    // ============================================================
    // PAYMENT_UPDATED → atualizar valor/vencimento no financeiro
    // ============================================================
    if (evento === 'PAYMENT_UPDATED') {
      const valor      = pagamento.value   as number
      const vencimento = pagamento.dueDate as string
      await supabase.from('financeiro_lancamentos').update({ valor, data: vencimento }).eq('asaas_payment_id', pagamento.id as string)
      console.log(`[PAYMENT_UPDATED] ${pagamento.id} → R$ ${valor}, venc. ${vencimento}`)
    }

    // ============================================================
    // PAYMENT_DELETED → remover lançamento pendente (nunca confirmados)
    // ============================================================
    if (evento === 'PAYMENT_DELETED') {
      await supabase.from('financeiro_lancamentos').delete().eq('asaas_payment_id', pagamento.id as string).eq('status', 'pendente')
      console.log(`[PAYMENT_DELETED] Lançamento pendente ${pagamento.id} removido`)
    }

    // ============================================================
    // PAYMENT_ANTICIPATED → cobrança antecipada via recebíveis Asaas
    // ============================================================
    if (evento === 'PAYMENT_ANTICIPATED') {
      const valor = pagamento.value as number
      const subId = pagamento.subscription as string | undefined
      const { data: ass } = subId
        ? await supabase.from('assinaturas').select('id, cliente_id, clientes(nome, user_id)').eq('asaas_subscription_id', subId).maybeSingle()
        : { data: null }
      if (ass) {
        const cli = ass.clientes as { nome: string; user_id: string } | null
        await supabase.from('historico_acoes').insert({
          cliente_id:      ass.cliente_id,
          tipo_acao:       'pagamento_antecipado',
          descricao:       `⚡ Cobrança de R$ ${valor.toFixed(2)} antecipada via recebíveis Asaas.`,
          valor_impactado: valor,
          metadata:        { event: evento },
        })
        await supabase.from('notificacoes').insert({
          user_id:    cli?.user_id,
          cliente_id: ass.cliente_id,
          tipo:       'sucesso',
          titulo:     `${cli?.nome} — Cobrança antecipada`,
          mensagem:   `R$ ${valor.toFixed(2)} recebido via antecipação de recebíveis.`,
          acao_url:   `/clientes/${ass.cliente_id}`,
          acao_label: 'Ver cliente',
        })
      }
    }

    // ============================================================
    // PAYMENT_BANK_SLIP_VIEWED → boleto visualizado pelo cliente
    // ============================================================
    if (evento === 'PAYMENT_BANK_SLIP_VIEWED') {
      const subId = pagamento.subscription as string | undefined
      const { data: ass } = subId
        ? await supabase.from('assinaturas').select('id, cliente_id, clientes(nome, user_id, dias_atraso)').eq('asaas_subscription_id', subId).maybeSingle()
        : { data: null }
      if (ass) {
        const cli = ass.clientes as { nome: string; user_id: string; dias_atraso: number } | null
        const diasAtraso = cli?.dias_atraso ?? 0
        await supabase.from('historico_acoes').insert({
          cliente_id: ass.cliente_id,
          tipo_acao:  'boleto_visualizado',
          descricao:  `👀 ${cli?.nome} abriu o boleto.${diasAtraso > 0 ? ` (${diasAtraso}d em atraso)` : ''}`,
          metadata:   { event: evento, dias_atraso: diasAtraso },
        })
        if (diasAtraso > 0) {
          await supabase.from('notificacoes').insert({
            user_id:    cli?.user_id,
            cliente_id: ass.cliente_id,
            tipo:       'atencao',
            titulo:     `${cli?.nome} — Abriu o boleto agora`,
            mensagem:   `Cliente com ${diasAtraso}d de atraso está vendo o boleto. Momento ideal para fazer follow-up.`,
            acao_url:   `/clientes/${ass.cliente_id}`,
            acao_label: 'Contatar agora',
          })
        }
      }
    }

    // ============================================================
    // PAYMENT_CHECKOUT_VIEWED → fatura visualizada pelo cliente
    // ============================================================
    if (evento === 'PAYMENT_CHECKOUT_VIEWED') {
      const subId = pagamento.subscription as string | undefined
      const { data: ass } = subId
        ? await supabase.from('assinaturas').select('id, cliente_id, clientes(nome, user_id, dias_atraso)').eq('asaas_subscription_id', subId).maybeSingle()
        : { data: null }
      if (ass) {
        const cli = ass.clientes as { nome: string; user_id: string; dias_atraso: number } | null
        const diasAtraso = cli?.dias_atraso ?? 0
        await supabase.from('historico_acoes').insert({
          cliente_id: ass.cliente_id,
          tipo_acao:  'checkout_visualizado',
          descricao:  `👀 ${cli?.nome} abriu a fatura.${diasAtraso > 0 ? ` (${diasAtraso}d em atraso)` : ''}`,
          metadata:   { event: evento, dias_atraso: diasAtraso },
        })
        if (diasAtraso > 0) {
          await supabase.from('notificacoes').insert({
            user_id:    cli?.user_id,
            cliente_id: ass.cliente_id,
            tipo:       'atencao',
            titulo:     `${cli?.nome} — Abriu a fatura agora`,
            mensagem:   `Cliente com ${diasAtraso}d de atraso está vendo a fatura. Momento ideal para fazer follow-up.`,
            acao_url:   `/clientes/${ass.cliente_id}`,
            acao_label: 'Contatar agora',
          })
        }
      }
    }

    // ============================================================
    // SUBSCRIPTION_CREATED → log (cliente criado via PAYMENT_RECEIVED)
    // ============================================================
    if (evento === 'SUBSCRIPTION_CREATED') {
      console.log(`[SUBSCRIPTION_CREATED] Nova assinatura: ${payload.subscription?.id ?? pagamento?.subscription ?? 'sem id'}`)
    }

    // ============================================================
    // SUBSCRIPTION_UPDATED → sincronizar valor da assinatura e mrr
    // ============================================================
    if (evento === 'SUBSCRIPTION_UPDATED') {
      const sub      = payload.subscription ?? {}
      const subId    = sub.id    as string | undefined
      const novoValor = sub.value as number | undefined
      if (subId) {
        const { data: ass } = await supabase
          .from('assinaturas')
          .select('id, cliente_id, valor_mensal, clientes(nome, user_id)')
          .eq('asaas_subscription_id', subId)
          .maybeSingle()
        if (ass) {
          const cli = ass.clientes as { nome: string; user_id: string } | null
          const updates: Record<string, unknown> = {}
          if (novoValor && novoValor !== ass.valor_mensal) updates.valor_mensal = novoValor
          if (Object.keys(updates).length > 0) {
            await supabase.from('assinaturas').update(updates).eq('id', ass.id)
            if (novoValor) await supabase.from('clientes').update({ mrr: novoValor }).eq('id', ass.cliente_id)
            await supabase.from('historico_acoes').insert({
              cliente_id:      ass.cliente_id,
              tipo_acao:       'assinatura_atualizada',
              descricao:       `📝 Valor da assinatura alterado: R$ ${ass.valor_mensal?.toFixed(2)} → R$ ${novoValor?.toFixed(2)}.`,
              valor_impactado: novoValor,
              metadata:        { valor_anterior: ass.valor_mensal, valor_novo: novoValor },
            })
            await supabase.from('notificacoes').insert({
              user_id:    cli?.user_id,
              cliente_id: ass.cliente_id,
              tipo:       'info',
              titulo:     `${cli?.nome} — Assinatura atualizada`,
              mensagem:   `Novo valor: R$ ${novoValor?.toFixed(2)}/mês (antes: R$ ${ass.valor_mensal?.toFixed(2)}).`,
              acao_url:   `/clientes/${ass.cliente_id}`,
              acao_label: 'Ver cliente',
            })
          }
        }
      }
    }

    // ============================================================
    // SUBSCRIPTION_INACTIVATED → assinatura inativada no Asaas
    // ============================================================
    if (evento === 'SUBSCRIPTION_INACTIVATED') {
      const subId = payload.subscription?.id as string | undefined
      if (subId) {
        const { data: ass } = await supabase
          .from('assinaturas')
          .select('id, cliente_id, clientes(nome, user_id)')
          .eq('asaas_subscription_id', subId)
          .maybeSingle()
        if (ass) {
          const cli = ass.clientes as { nome: string; user_id: string } | null
          await supabase.from('assinaturas').update({ status: 'cancelada' }).eq('id', ass.id)
          await supabase.from('historico_acoes').insert({
            cliente_id: ass.cliente_id,
            tipo_acao:  'assinatura_inativada',
            descricao:  '🚫 Assinatura inativada no Asaas.',
            metadata:   { event: evento },
          })
          await supabase.from('notificacoes').insert({
            user_id:    cli?.user_id,
            cliente_id: ass.cliente_id,
            tipo:       'urgente',
            titulo:     `${cli?.nome} — Assinatura inativada`,
            mensagem:   'Assinatura inativada no Asaas. Verifique a situação do cliente.',
            acao_url:   `/clientes/${ass.cliente_id}`,
            acao_label: 'Ver cliente',
          })
        }
      }
    }

    // ============================================================
    // SUBSCRIPTION_DELETED → assinatura removida definitivamente
    // ============================================================
    if (evento === 'SUBSCRIPTION_DELETED') {
      const subId = payload.subscription?.id as string | undefined
      if (subId) {
        const { data: ass } = await supabase
          .from('assinaturas')
          .select('id, cliente_id, clientes(nome, user_id)')
          .eq('asaas_subscription_id', subId)
          .maybeSingle()
        if (ass) {
          const cli = ass.clientes as { nome: string; user_id: string } | null
          await supabase.from('assinaturas').update({ status: 'deletada' }).eq('id', ass.id)
          await supabase.from('historico_acoes').insert({
            cliente_id: ass.cliente_id,
            tipo_acao:  'assinatura_deletada',
            descricao:  '❌ Assinatura removida definitivamente no Asaas.',
            metadata:   { event: evento },
          })
          await supabase.from('notificacoes').insert({
            user_id:    cli?.user_id,
            cliente_id: ass.cliente_id,
            tipo:       'urgente',
            titulo:     `${cli?.nome} — Assinatura deletada`,
            mensagem:   'Assinatura removida definitivamente no Asaas. Ação necessária.',
            acao_url:   `/clientes/${ass.cliente_id}`,
            acao_label: 'Ver cliente',
          })
        }
      }
    }

    // ============================================================
    // TRANSFER_DONE → registrar saída no financeiro
    // ============================================================
    if (evento === 'TRANSFER_DONE') {
      const transfer = payload.transfer ?? {}
      const valor    = (transfer.value ?? 0) as number
      const { data: ownerRow } = await supabase
        .from('clientes').select('user_id').not('user_id', 'is', null)
        .order('created_at', { ascending: true }).limit(1).maybeSingle()
      if (valor > 0) {
        await supabase.from('financeiro_lancamentos').insert({
          user_id:   ownerRow?.user_id,
          tipo:      'custo_variavel',
          categoria: 'transferencia',
          descricao: `Transferência realizada via Asaas — R$ ${valor.toFixed(2)}`,
          valor,
          data:      new Date().toISOString().split('T')[0],
          status:    'confirmado',
        })
        console.log(`[TRANSFER_DONE] R$ ${valor} registrado no financeiro`)
      }
    }

    // ============================================================
    // RECEIVABLE_ANTICIPATION_CREDITED → antecipação aprovada e creditada
    // ============================================================
    if (evento === 'RECEIVABLE_ANTICIPATION_CREDITED') {
      const anticipation = payload.anticipation ?? {}
      const valor = ((anticipation.netValue ?? anticipation.value ?? 0)) as number
      const { data: ownerRow } = await supabase
        .from('clientes').select('user_id').not('user_id', 'is', null)
        .order('created_at', { ascending: true }).limit(1).maybeSingle()
      await supabase.from('notificacoes').insert({
        user_id:    ownerRow?.user_id,
        tipo:       'sucesso',
        titulo:     '💰 Antecipação creditada',
        mensagem:   `R$ ${valor.toFixed(2)} disponíveis na conta via antecipação de recebíveis.`,
        acao_url:   '/financeiro',
        acao_label: 'Ver financeiro',
      })
    }

    // ============================================================
    // RECEIVABLE_ANTICIPATION_DENIED → solicitação de antecipação negada
    // ============================================================
    if (evento === 'RECEIVABLE_ANTICIPATION_DENIED') {
      const { data: ownerRow } = await supabase
        .from('clientes').select('user_id').not('user_id', 'is', null)
        .order('created_at', { ascending: true }).limit(1).maybeSingle()
      await supabase.from('notificacoes').insert({
        user_id:    ownerRow?.user_id,
        tipo:       'atencao',
        titulo:     '⚠️ Antecipação de recebíveis negada',
        mensagem:   'Sua solicitação de antecipação foi negada pelo Asaas. Verifique os critérios.',
        acao_url:   '/financeiro',
        acao_label: 'Ver financeiro',
      })
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
