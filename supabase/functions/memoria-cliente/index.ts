import { serve }        from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  const url       = new URL(req.url)
  const clienteId = url.searchParams.get('cliente_id')

  if (!clienteId) {
    return new Response(JSON.stringify({ error: 'cliente_id obrigatório' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }

  // ── GET: lê memória ──────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('memoria_clientes')
      .select('*')
      .eq('cliente_id', clienteId)
      .maybeSingle()

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
    return new Response(JSON.stringify(data ?? { conteudo_md: '', versao: 0 }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
  }

  // ── POST: atualiza memória + backup no Storage ───────────────────────────
  if (req.method === 'POST') {
    const body = await req.json() as { conteudo_md: string; user_id?: string }

    const { data: atual } = await supabase
      .from('memoria_clientes')
      .select('versao')
      .eq('cliente_id', clienteId)
      .maybeSingle()

    const novaVersao = ((atual?.versao as number | null) ?? 0) + 1

    const { error: upsertErr } = await supabase
      .from('memoria_clientes')
      .upsert({
        cliente_id:  clienteId,
        conteudo_md: body.conteudo_md,
        versao:      novaVersao,
        atualizado_em: new Date().toISOString(),
      }, { onConflict: 'cliente_id' })

    if (upsertErr) return new Response(JSON.stringify({ error: upsertErr.message }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })

    try {
      const backupPath = `memorias/${clienteId}_v${novaVersao}.md`
      await supabase.storage.from('memorias').upload(backupPath, body.conteudo_md, {
        contentType: 'text/markdown; charset=utf-8',
        upsert: false,
      })
    } catch (storageErr) {
      console.warn('Backup Storage falhou (non-critical):', storageErr)
    }

    return new Response(JSON.stringify({ ok: true, versao: novaVersao }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
  }

  return new Response(JSON.stringify({ error: 'Método não suportado' }), { status: 405, headers: { ...CORS, 'Content-Type': 'application/json' } })
})
