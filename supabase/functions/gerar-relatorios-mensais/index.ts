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
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('id, nome')
      .eq('status', 'ativo');
    if (error) throw error;

    const hoje   = new Date();
    const mesRef = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    // getMonth() retorna 0-indexed, +1 para o mês correto
    const mesAno = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, '0')}`;

    let criados = 0;
    for (const cliente of clientes ?? []) {
      const { error: errUpsert } = await supabase
        .from('relatorios_mensais')
        .upsert(
          { cliente_id: cliente.id, mes_ano: mesAno, status_geracao: 'pendente' },
          { onConflict: 'cliente_id,mes_ano' }
        );

      if (errUpsert) {
        console.error(`[ERRO] ${cliente.nome}:`, errUpsert.message);
      } else {
        criados++;
        console.log(`[OK] Agendado: ${cliente.nome} — ${mesAno}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, mes_ano: mesAno, criados }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[ERRO GERAL]', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
