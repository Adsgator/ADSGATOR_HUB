import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    // Buscar todos os alertas vencidos e ainda não disparados
    const { data: alertas, error } = await supabase
      .from('alertas')
      .select('*, clientes(id, nome)')
      .eq('disparado', false)
      .lte('dispara_em', new Date().toISOString());

    if (error) throw new Error(error.message);
    if (!alertas || alertas.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhum alerta pendente.' }), { status: 200 });
    }

    for (const alerta of alertas) {
      console.log(`[ALERTA] ${alerta.tipo_alerta} — ${alerta.clientes?.nome}`);

      // Marcar como disparado
      await supabase
        .from('alertas')
        .update({ disparado: true, data_disparo: new Date().toISOString() })
        .eq('id', alerta.id);

      // Registrar no histórico do cliente
      await supabase.from('historico_acoes').insert({
        cliente_id: alerta.cliente_id,
        tipo_acao:  `alerta_${alerta.tipo_alerta}`,
        descricao:  alerta.mensagem,
        metadata:   { alerta_id: alerta.id },
      });

      // 18.6 fix: criar notificação para o NotificationBell
      await supabase.from('notificacoes').insert({
        user_id:    alerta.clientes?.user_id ?? null,
        cliente_id: alerta.cliente_id,
        tipo:       alerta.tipo_alerta === 'urgente' ? 'urgente' : 'atencao',
        titulo:     alerta.mensagem?.slice(0, 80) ?? `Alerta: ${alerta.tipo_alerta}`,
        mensagem:   alerta.mensagem,
        acao_url:   `/clientes/${alerta.cliente_id}`,
        acao_label: 'Ver cliente',
        lida:       false,
      });
    }

    return new Response(
      JSON.stringify({ success: true, processados: alertas.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
