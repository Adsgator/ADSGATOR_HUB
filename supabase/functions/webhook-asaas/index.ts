import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TEST_MODE, logTest } from '../_shared/test-mode.ts';
import { LIMIARES_ATRASO } from '../_shared/cobranca.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// ── Cliente nasce no checkout ─────────────────────────────────────────────────
// O fluxo da agência: cliente contrata no checkout → assinatura criada no Asaas
// → 1º pagamento vence em D+3 → onboarding começa ANTES do pagamento.
// Por isso o cliente precisa existir no Hub já no SUBSCRIPTION_CREATED /
// PAYMENT_CREATED, não apenas no PAYMENT_RECEIVED.

const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY') ?? '';
const ASAAS_BASE = ASAAS_API_KEY.startsWith('$aact_prod_')
  ? 'https://api.asaas.com'
  : 'https://sandbox.asaas.com';

async function asaasGet(path: string) {
  const res = await fetch(`${ASAAS_BASE}${path}`, { headers: { access_token: ASAAS_API_KEY } });
  if (!res.ok) throw new Error(`Asaas GET ${path} → HTTP ${res.status}`);
  return res.json();
}

async function buscarOwnerUserId(): Promise<string | null> {
  const { data } = await supabase
    .from('clientes')
    .select('user_id')
    .not('user_id', 'is', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.user_id ?? null;
}

interface AsaasCustomerData {
  name?:        string
  email?:       string
  mobilePhone?: string
  phone?:       string
}

/**
 * Busca cliente por email ou cria um novo em 'recebido' com estágio de
 * onboarding e notificação. Núcleo comum de assinatura e compra única.
 */
async function obterOuCriarCliente(
  customer: AsaasCustomerData,
  opts: { mrr: number; valorContrato: number; origem: 'assinatura' | 'compra_unica'; fallbackEmailId: string },
): Promise<{ clienteId: string; criado: boolean }> {
  const owner = await buscarOwnerUserId();

  if (customer.email) {
    const { data: porEmail } = await supabase
      .from('clientes')
      .select('id')
      .eq('email', customer.email)
      .maybeSingle();
    if (porEmail) return { clienteId: porEmail.id, criado: false };
  }

  const whatsapp = (customer.mobilePhone ?? customer.phone ?? '') as string;
  const { data: novo, error: errCliente } = await supabase
    .from('clientes')
    .insert({
      nome:     customer.name ?? 'Cliente sem nome',
      email:    customer.email ?? `${opts.fallbackEmailId}@sem-email.com`,
      whatsapp,
      nicho:    'a_definir',
      status:   'recebido',
      mrr:      opts.mrr,
      user_id:  owner,
    })
    .select('id, nome')
    .single();
  if (errCliente) throw new Error(`Erro ao criar cliente (${opts.origem}): ${errCliente.message}`);
  const clienteId = novo.id as string;

  const ehAssinatura = opts.origem === 'assinatura';
  await supabase.from('estagios').insert({
    cliente_id:  clienteId,
    nome:        'recebido',
    descricao:   ehAssinatura
      ? 'Novo cliente via checkout — iniciar onboarding antes do 1º pagamento (vence em D+3)'
      : 'Nova compra única (ex: landing page) — iniciar onboarding e entrega',
    acao_label:  '#BOASVINDAS',
    acao_url:    `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Seja bem-vindo(a) à Adsgator! 🎉 Vou entrar em contato em breve para iniciar seu onboarding.')}`,
    checklist: JSON.stringify(ehAssinatura
      ? [
          { item: 'Enviar mensagem #BOASVINDAS no WhatsApp', done: false },
          { item: 'Coletar informações de onboarding', done: false },
          { item: 'Agendar call de onboarding', done: false },
          { item: 'Confirmar 1º pagamento (D+3)', done: false },
        ]
      : [
          { item: 'Enviar mensagem #BOASVINDAS no WhatsApp', done: false },
          { item: 'Coletar informações para a entrega', done: false },
          { item: 'Entregar o projeto', done: false },
          { item: 'Oferecer plano de manutenção', done: false },
        ]),
    ativo: true,
  });

  await supabase.from('notificacoes').insert({
    user_id:    owner,
    cliente_id: clienteId,
    tipo:       'urgente',
    titulo:     ehAssinatura ? '🛒 Novo cliente do checkout!' : '🛒 Nova compra única!',
    mensagem:   ehAssinatura
      ? `${novo.nome} contratou (R$ ${opts.valorContrato.toFixed(2)}/mês). Iniciar onboarding — 1º pagamento vence em D+3.`
      : `${novo.nome} comprou (R$ ${opts.valorContrato.toFixed(2)}, pagamento único). Iniciar onboarding e entrega.`,
    acao_label: '#BOASVINDAS',
    acao_url:   `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Seja bem-vindo(a) à Adsgator! 🎉')}`,
  });

  return { clienteId, criado: true };
}

/**
 * Garante que cliente + assinatura existem para uma subscription do Asaas.
 * Se não existem, busca os dados na API do Asaas e cria tudo. Idempotente.
 */
async function garantirClienteDaAssinatura(
  subscriptionId: string,
): Promise<{ clienteId: string; criado: boolean } | null> {
  const { data: existente } = await supabase
    .from('assinaturas')
    .select('id, cliente_id')
    .eq('asaas_subscription_id', subscriptionId)
    .maybeSingle();
  if (existente) return { clienteId: existente.cliente_id, criado: false };

  if (!ASAAS_API_KEY) {
    console.error('[CHECKOUT] ASAAS_API_KEY ausente — impossível criar cliente da assinatura');
    return null;
  }

  const sub      = await asaasGet(`/v3/subscriptions/${subscriptionId}`);
  const customer = await asaasGet(`/v3/customers/${sub.customer}`);
  const valor    = (sub.value ?? 0) as number;

  const { clienteId, criado } = await obterOuCriarCliente(customer, {
    mrr: valor, valorContrato: valor, origem: 'assinatura', fallbackEmailId: subscriptionId,
  });

  await supabase.from('assinaturas').insert({
    cliente_id:            clienteId,
    plano_nome:            sub.description || 'Plano Adsgator',
    valor_mensal:          valor,
    status:                'ativa',
    dias_atraso:           0,
    asaas_subscription_id: subscriptionId,
    data_proxima_cobranca: sub.nextDueDate ?? null,
  });

  await supabase.from('historico_acoes').insert({
    cliente_id:      clienteId,
    tipo_acao:       'cliente_criado_checkout',
    descricao:       `🛒 Assinatura criada no Asaas (R$ ${valor.toFixed(2)}/mês) — cliente criado antes do 1º pagamento.`,
    valor_impactado: valor,
    metadata:        { asaas_subscription_id: subscriptionId },
  });

  console.log(`[CHECKOUT] Cliente ${clienteId} criado/vinculado para assinatura ${subscriptionId}`);
  return { clienteId, criado };
}

/**
 * Compra única (pagamento sem assinatura, ex: landing page): garante que o
 * cliente existe a partir do customer do pagamento. MRR fica 0 — não é
 * receita recorrente. Idempotente por email.
 */
async function garantirClienteDoPagamentoAvulso(
  customerId: string,
  valor: number,
): Promise<{ clienteId: string; criado: boolean } | null> {
  if (!ASAAS_API_KEY) {
    console.error('[COMPRA ÚNICA] ASAAS_API_KEY ausente — impossível criar cliente do pagamento');
    return null;
  }
  const customer = await asaasGet(`/v3/customers/${customerId}`);
  const resultado = await obterOuCriarCliente(customer, {
    mrr: 0, valorContrato: valor, origem: 'compra_unica', fallbackEmailId: customerId,
  });
  if (resultado.criado) {
    await supabase.from('historico_acoes').insert({
      cliente_id:      resultado.clienteId,
      tipo_acao:       'cliente_criado_compra_unica',
      descricao:       `🛒 Compra única no Asaas (R$ ${valor.toFixed(2)}) — cliente criado para onboarding e entrega.`,
      valor_impactado: valor,
      metadata:        { asaas_customer_id: customerId },
    });
    console.log(`[COMPRA ÚNICA] Cliente ${resultado.clienteId} criado para customer ${customerId}`);
  }
  return resultado;
}

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

  // Parse fora do try principal: payload/eventId precisam estar visíveis no catch
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const evento    = payload.event as string;
  // deno-lint-ignore no-explicit-any
  const pagamento = payload.payment as any;
  const eventId   = payload.id as string | undefined;

  // Dedupe: o Asaas reenvia eventos (retry/Reenviar). Se já processamos este
  // id, responde 200 sem reprocessar. Falha no insert por outro motivo
  // (ex: tabela ausente) não bloqueia — só loga.
  if (eventId) {
    const { error: dupErr } = await supabase
      .from('asaas_webhook_events')
      .insert({ id: eventId, event: evento });
    if (dupErr) {
      if (dupErr.code === '23505') {
        console.log(`[DEDUPE] Evento ${eventId} já processado — ignorando`);
        return new Response(JSON.stringify({ ignored: true, motivo: 'evento_duplicado' }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.error(`[DEDUPE] Falha ao registrar evento ${eventId}: ${dupErr.message}`);
    }
  }

  try {
    logTest(`Webhook recebido - Evento: ${evento}`);
    if (TEST_MODE) {
      console.log('[🧪 TEST_MODE] Processando em modo de teste - nenhum cliente real será afetado');
    }
    console.log(`[ASAAS WEBHOOK] Evento: ${evento}`);

    // ============================================================
    // PAGAMENTO RECEBIDO → zerar atraso/reativar (cria cliente se preciso)
    // ============================================================
    if (evento === 'PAYMENT_RECEIVED') {
      const subscriptionId = pagamento?.subscription as string | undefined;
      const valorPago      = (pagamento?.value ?? 0) as number;
      const paymentId      = pagamento?.id as string | undefined;

      // Compra única (sem assinatura, ex: landing page): cria o cliente a
      // partir do customer do pagamento e registra a receita. MRR não muda.
      const garantia = subscriptionId
        ? await garantirClienteDaAssinatura(subscriptionId)
        : pagamento?.customer
          ? await garantirClienteDoPagamentoAvulso(pagamento.customer as string, valorPago)
          : null;

      if (!garantia) {
        console.log(`[PAYMENT_RECEIVED] Pagamento ${paymentId ?? 'sem id'} sem subscription/customer — ignorado`);
        return new Response(JSON.stringify({ ignored: true, motivo: 'sem_vinculo' }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (subscriptionId) {
        // Zerar atraso e reativar assinatura
        await supabase
          .from('assinaturas')
          .update({
            status:                'ativa',
            dias_atraso:           0,
            data_proxima_cobranca: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at:            new Date().toISOString(),
          })
          .eq('asaas_subscription_id', subscriptionId);

        // Reativar cliente cancelado e zerar atraso
        const { data: cliente } = await supabase
          .from('clientes')
          .select('id, status, dias_atraso')
          .eq('id', garantia.clienteId)
          .single();
        if (cliente) {
          const updates: Record<string, unknown> = {};
          if (['cancelado', 'cancelado_debito'].includes(cliente.status)) updates.status = 'ativo';
          if ((cliente.dias_atraso ?? 0) > 0) updates.dias_atraso = 0;
          if (Object.keys(updates).length > 0) {
            await supabase.from('clientes').update(updates).eq('id', cliente.id);
          }
        }
      }

      await supabase.from('historico_acoes').insert({
        cliente_id:      garantia.clienteId,
        tipo_acao:       'pagamento_recebido',
        descricao:       subscriptionId
          ? `Pagamento de R$ ${valorPago.toFixed(2)} recebido via Asaas.`
          : `Pagamento único de R$ ${valorPago.toFixed(2)} recebido via Asaas (compra avulsa).`,
        valor_impactado: valorPago,
        metadata:        { asaas_subscription_id: subscriptionId ?? null, asaas_payment_id: paymentId, event: evento },
      });

      // Lançamento financeiro: confirma o pendente (criado no PAYMENT_CREATED) ou cria
      if (paymentId) {
        const { data: lancamento } = await supabase
          .from('financeiro_lancamentos')
          .select('id')
          .eq('asaas_payment_id', paymentId)
          .maybeSingle();
        if (lancamento) {
          await supabase.from('financeiro_lancamentos').update({ status: 'confirmado' }).eq('id', lancamento.id);
        } else {
          await supabase.from('financeiro_lancamentos').insert({
            user_id:          await buscarOwnerUserId(),
            cliente_id:       garantia.clienteId,
            tipo:             'receita',
            categoria:        'mensalidade',
            descricao:        `Pagamento recebido via Asaas — R$ ${valorPago.toFixed(2)}`,
            valor:            valorPago,
            data:             new Date().toISOString().split('T')[0],
            asaas_payment_id: paymentId,
            status:           'confirmado',
          });
        }
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
    // PAYMENT_CREATED → cobrança gerada, registrar como pendente.
    // Se a assinatura ainda não existe no Hub (checkout sem evento de
    // subscription), cria cliente + assinatura aqui — o onboarding começa
    // antes do 1º pagamento (vencimento D+3).
    // ============================================================
    if (evento === 'PAYMENT_CREATED') {
      const valor      = pagamento.value       as number
      const vencimento = pagamento.dueDate     as string
      const subId      = pagamento.subscription as string | undefined
      if (subId) {
        await garantirClienteDaAssinatura(subId)
      } else if (pagamento.customer) {
        // Compra única: cliente nasce quando a cobrança é gerada — onboarding
        // e entrega podem começar antes do pagamento
        const garantia = await garantirClienteDoPagamentoAvulso(pagamento.customer as string, valor)
        if (garantia) {
          const { data: existing } = await supabase.from('financeiro_lancamentos').select('id').eq('asaas_payment_id', pagamento.id as string).maybeSingle()
          if (!existing) {
            await supabase.from('financeiro_lancamentos').insert({
              user_id:          await buscarOwnerUserId(),
              cliente_id:       garantia.clienteId,
              tipo:             'receita',
              categoria:        'projeto',
              descricao:        `Cobrança única gerada — ${pagamento.description ?? 'compra avulsa'}`,
              valor,
              data:             vencimento,
              asaas_payment_id: pagamento.id as string,
              status:           'pendente',
            })
          }
        }
      }
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
    // PAYMENT_REFUNDED → estorno: cancela lançamento e avisa o operador
    // ============================================================
    if (evento === 'PAYMENT_REFUNDED') {
      const paymentId = pagamento?.id as string | undefined
      const valor     = (pagamento?.value ?? 0) as number
      if (paymentId) {
        const { data: lancamento } = await supabase
          .from('financeiro_lancamentos')
          .select('id, cliente_id')
          .eq('asaas_payment_id', paymentId)
          .maybeSingle()
        await supabase.from('financeiro_lancamentos').update({ status: 'cancelado' }).eq('asaas_payment_id', paymentId)
        if (lancamento?.cliente_id) {
          const { data: cli } = await supabase.from('clientes').select('nome, user_id').eq('id', lancamento.cliente_id).maybeSingle()
          await supabase.from('historico_acoes').insert({
            cliente_id:      lancamento.cliente_id,
            tipo_acao:       'pagamento_estornado',
            descricao:       `↩️ Pagamento de R$ ${valor.toFixed(2)} estornado no Asaas.`,
            valor_impactado: valor,
            metadata:        { event: evento, asaas_payment_id: paymentId },
          })
          await supabase.from('notificacoes').insert({
            user_id:    cli?.user_id,
            cliente_id: lancamento.cliente_id,
            tipo:       'urgente',
            titulo:     `${cli?.nome ?? 'Cliente'} — Pagamento estornado`,
            mensagem:   `Estorno de R$ ${valor.toFixed(2)} processado no Asaas. Verifique a situação do cliente.`,
            acao_url:   `/clientes/${lancamento.cliente_id}`,
            acao_label: 'Ver cliente',
          })
        }
      }
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
    // SUBSCRIPTION_CREATED → cliente nasce no checkout, antes do 1º pagamento
    // ============================================================
    if (evento === 'SUBSCRIPTION_CREATED') {
      const subId = (payload.subscription?.id ?? pagamento?.subscription) as string | undefined
      console.log(`[SUBSCRIPTION_CREATED] Nova assinatura: ${subId ?? 'sem id'}`)
      if (subId) {
        await garantirClienteDaAssinatura(subId)
      }
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
    console.error(`[WEBHOOK ERRO] evento=${evento} id=${eventId ?? 'sem id'}: ${msg}`);

    // Responde 200 para não entrar em espiral de retry → penalização do Asaas.
    // O evento fica registrado no histórico do Asaas (Reenviar manual) e o
    // operador é notificado in-app. Remove o dedupe para permitir reprocesso.
    if (eventId) {
      await supabase.from('asaas_webhook_events').delete().eq('id', eventId);
    }
    try {
      const owner = await buscarOwnerUserId();
      await supabase.from('notificacoes').insert({
        user_id:    owner,
        tipo:       'urgente',
        titulo:     '⚠️ Webhook Asaas falhou ao processar evento',
        mensagem:   `Evento ${evento} (${eventId ?? 'sem id'}) falhou: ${msg}. Use "Reenviar" no painel do Asaas após corrigir.`,
        acao_url:   '/configuracoes',
        acao_label: 'Ver integrações',
      });
    } catch { /* notificação é best-effort */ }

    return new Response(
      JSON.stringify({ success: false, error_logged: true, error: msg }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
