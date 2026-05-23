// supabase/functions/regua-cobranca/index.ts
// Cron: todo dia às 09:00 — 0 9 * * *

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TEST_MODE, TEST_CONFIG, logTest, maskSensitive } from '../_shared/test-mode.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async () => {
  try {
    console.log('[REGUA-COBRANCA] Iniciando verificação de atrasos...');
    
    if (TEST_MODE) {
      console.log('[🧪 TEST_MODE] Régua de cobrança em modo de teste - nenhuma mensagem real será enviada');
    }

    // ── 18.5 fix: sincronizar clientes.dias_atraso a partir de assinaturas ─────
    await supabase.rpc('sync_dias_atraso').catch(() => {
      // fallback manual se RPC não existir
    });
    // Fallback manual: UPDATE via query encadeada
    const { data: assAtrasadas } = await supabase
      .from('assinaturas')
      .select('cliente_id, dias_atraso')
      .gt('dias_atraso', 0)
      .neq('status', 'ativa');
    for (const a of assAtrasadas ?? []) {
      await supabase.from('clientes').update({ dias_atraso: a.dias_atraso }).eq('id', a.cliente_id);
    }

    // ── Clientes com dias_atraso > 0 ───────────────────────────────────
    const { data: clientes } = await supabase
      .from('clientes')
      .select('*')
      .gt('dias_atraso', 0)
      .neq('status', 'cancelado')
      .neq('status', 'cancelado_debito');

    for (const cliente of clientes ?? []) {
      const dias = cliente.dias_atraso as number;

      // D+7 — Alerta laranja: suspensão iminente
      if (dias >= 7 && dias < 15) {
        const whatsappDestino = TEST_MODE ? TEST_CONFIG.testWhatsApp : cliente.whatsapp;
        // 18.4 fix: deduplicar — só inserir se não há notificação de hoje
        const hoje = new Date().toISOString().slice(0, 10);
        const { data: notifHoje } = await supabase
          .from('notificacoes')
          .select('id')
          .eq('cliente_id', cliente.id)
          .eq('tipo', 'atencao')
          .gte('created_at', `${hoje}T00:00:00Z`)
          .maybeSingle();
        if (notifHoje) { console.log(`[SKIP D+7] ${cliente.nome} já notificado hoje`); continue; }

        await supabase.from('notificacoes').insert({
          user_id:    cliente.user_id,
          cliente_id: cliente.id,
          tipo:       'atencao',
          titulo:     TEST_MODE 
            ? `${TEST_CONFIG.testPrefixo} ${cliente.nome} — ${dias} dias em atraso` 
            : `${cliente.nome} — ${dias} dias em atraso`,
          mensagem:   TEST_MODE
            ? `[TESTE] Cliente ${cliente.nome} (WhatsApp: ${maskSensitive(cliente.whatsapp || 'N/A')}) receberia alerta de suspensão.`
            : 'Campanha em risco de suspensão. Envie alerta ao cliente.',
          acao_label: '#ALERTA D+7',
          acao_url:   `https://wa.me/${whatsappDestino}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}! Seu pagamento está em atraso há ${dias} dias. As campanhas serão suspensas em breve.`)}`,
        });
        
        if (TEST_MODE) {
          logTest(`Notificação D+7 criada para ${cliente.nome}`, { whatsappReal: cliente.whatsapp, whatsappTeste: TEST_CONFIG.testWhatsApp });
        }
      }

      // D+15 — Alerta vermelho: quebra de contrato
      if (dias >= 15 && dias < 30) {
        const whatsappDestino = TEST_MODE ? TEST_CONFIG.testWhatsApp : cliente.whatsapp;
        // 18.4 fix: deduplicar — só inserir se não há notificação urgente de hoje
        const hoje15 = new Date().toISOString().slice(0, 10);
        const { data: notifHoje15 } = await supabase
          .from('notificacoes')
          .select('id')
          .eq('cliente_id', cliente.id)
          .eq('tipo', 'urgente')
          .gte('created_at', `${hoje15}T00:00:00Z`)
          .maybeSingle();
        if (notifHoje15) { console.log(`[SKIP D+15] ${cliente.nome} já notificado hoje`); continue; }

        await supabase.from('notificacoes').insert({
          user_id:    cliente.user_id,
          cliente_id: cliente.id,
          tipo:       'urgente',
          titulo:     TEST_MODE
            ? `${TEST_CONFIG.testPrefixo} ${cliente.nome} — QUEBRA DE CONTRATO iminente`
            : `${cliente.nome} — QUEBRA DE CONTRATO iminente`,
          mensagem:   TEST_MODE
            ? `[TESTE] Cliente ${cliente.nome} (WhatsApp: ${maskSensitive(cliente.whatsapp || 'N/A')}) receberia notificação formal de rescisão.`
            : `${dias} dias sem pagamento. Envie notificação formal de rescisão.`,
          acao_label: '#QUEBRA CONTRATO',
          acao_url:   `https://wa.me/${whatsappDestino}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}. Em razão do atraso de ${dias} dias, estamos comunicando a rescisão contratual conforme cláusula 8.`)}`,
        });
        
        if (TEST_MODE) {
          logTest(`Notificação D+15 criada para ${cliente.nome}`, { whatsappReal: cliente.whatsapp });
        }
      }

      // D+30 — Cancelamento automático
      if (dias >= 30) {
        await supabase
          .from('clientes')
          .update({ status: 'cancelado_debito' })
          .eq('id', cliente.id);

        await supabase.from('notificacoes').insert({
          user_id:    cliente.user_id,
          cliente_id: cliente.id,
          tipo:       'urgente',
          titulo:     `${cliente.nome} — CANCELADO por débito`,
          mensagem:   'Status alterado para cancelado_debito. Remover landing page e ativos do Storage.',
          acao_label: 'Ver cliente',
          acao_url:   `/clientes/${cliente.id}`,
        });

        await supabase.from('audit_logs').insert({
          user_id:     cliente.user_id,
          acao:        'cancelamento_automatico_debito',
          tabela:      'clientes',
          registro_id: cliente.id,
          descricao:   `Cancelamento automático após ${dias} dias de atraso`,
        });
      }

      console.log(`[PROCESSADO] ${cliente.nome} — ${dias}d de atraso`);
      
      if (TEST_MODE) {
        logTest(`Cliente ${cliente.nome} processado`, { diasAtraso: dias, status: cliente.status });
      }
    }

    // ── 19.4: D+90 — Inativação completa ─────────────────────────────
    const noventaDiasAtras = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: canceladosAntigos } = await supabase
      .from('clientes')
      .select('id, nome, user_id')
      .eq('status', 'cancelado_debito')
      .lt('updated_at', noventaDiasAtras);

    for (const c of canceladosAntigos ?? []) {
      await supabase.from('clientes').update({ status: 'inativo' }).eq('id', c.id);
      await supabase.from('notificacoes').insert({
        user_id:    c.user_id,
        cliente_id: c.id,
        tipo:       'info',
        titulo:     `${c.nome} — Inativado (D+90)`,
        mensagem:   'Cliente removido das listagens ativas. Dados mantidos para relatórios históricos.',
        acao_url:   `/clientes/${c.id}`,
        acao_label: 'Ver cliente',
      });
      console.log(`[D+90 INATIVADO] ${c.nome}`);
    }

    // ── Alerta 48h para clientes congelados ───────────────────────────
    const { data: congelados } = await supabase
      .from('clientes')
      .select('*')
      .eq('status', 'congelado')
      .lte('alerta_48h_em', new Date().toISOString());

    for (const cliente of congelados ?? []) {
      const whatsappDestino = TEST_MODE ? TEST_CONFIG.testWhatsApp : cliente.whatsapp;
      
      await supabase.from('notificacoes').insert({
        user_id:    cliente.user_id,
        cliente_id: cliente.id,
        tipo:       'atencao',
        titulo:     TEST_MODE
          ? `${TEST_CONFIG.testPrefixo} ${cliente.nome} — Congelado há 48h`
          : `${cliente.nome} — Congelado há 48h`,
        mensagem:   TEST_MODE
          ? `[TESTE] Cliente ${cliente.nome} (WhatsApp: ${maskSensitive(cliente.whatsapp || 'N/A')}) receberia lembrete de 48h.`
          : 'Cliente retido sem resposta há 48 horas. Enviar lembrete.',
        acao_label: 'Lembrete WhatsApp',
        acao_url:   `https://wa.me/${whatsappDestino}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}! Ainda aguardamos seu retorno para continuar.`)}`,
      });

      await supabase
        .from('clientes')
        .update({ alerta_48h_em: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() })
        .eq('id', cliente.id);
    }

    return new Response(
      JSON.stringify({ success: true, processados: clientes?.length ?? 0 }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[ERRO]', msg);
    return new Response(
      JSON.stringify({ error: msg, test_mode: TEST_MODE }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
