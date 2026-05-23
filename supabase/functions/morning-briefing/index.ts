import { serve }         from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient }  from 'https://esm.sh/@supabase/supabase-js@2'
import { VertexAI }      from 'https://esm.sh/@google-cloud/vertexai@1'

const GEMINI_PRO = 'gemini-2.5-pro'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

function criarVertexAI() {
  return new VertexAI({
    project:  Deno.env.get('VERTEX_AI_PROJECT_ID')!,
    location: Deno.env.get('VERTEX_AI_LOCATION') ?? 'us-central1',
    googleAuthOptions: { keyFilename: Deno.env.get('VERTEX_AI_CREDENTIALS') },
  })
}

serve(async () => {
  try {
    const hoje = new Date().toISOString().slice(0, 10)

    const [{ data: clientes }, { data: alertas }, { data: memorias }] = await Promise.all([
      supabase.from('clientes').select('nome, status, dias_atraso, mrr').in('status', ['ativo', 'onboarding', 'setup_trafego', 'recebido']),
      supabase.from('alertas').select('tipo, mensagem').eq('resolvido', false).order('created_at', { ascending: false }).limit(10),
      supabase.from('memoria_clientes').select('cliente_id, conteudo_md').limit(20),
    ])

    const mrrTotal     = (clientes ?? []).reduce((s: number, c: { mrr?: number }) => s + (c.mrr ?? 0), 0)
    const inadimplentes = (clientes ?? []).filter((c: { dias_atraso?: number }) => (c.dias_atraso ?? 0) > 0)
    const resumoMemorias = (memorias ?? []).slice(0, 5)
      .map((m: { conteudo_md: string }) => m.conteudo_md?.slice(0, 200))
      .filter(Boolean)
      .join('\n---\n')

    const prompt = `Você é o assistente estratégico da agência Adsgator. Gere um briefing matinal CONCISO (máx 6 linhas, sem markdown, sem listas com asterisco).

Dados de hoje (${hoje}):
- Clientes ativos: ${clientes?.length ?? 0}
- MRR total: R$ ${mrrTotal.toLocaleString('pt-BR')}
- Inadimplentes: ${inadimplentes.length}${inadimplentes.length > 0 ? ` (${inadimplentes.map((c: { nome: string }) => c.nome).join(', ')})` : ''}
- Alertas abertos: ${alertas?.length ?? 0}
${alertas?.length ? `- Alertas: ${alertas.slice(0, 3).map((a: { mensagem: string }) => a.mensagem).join(' | ')}` : ''}
${resumoMemorias ? `\nContexto recente:\n${resumoMemorias}` : ''}

Foque em: o que precisa de atenção urgente hoje, 1 ação prioritária clara.`

    const vertex = criarVertexAI()
    const model  = vertex.preview.getGenerativeModel({ model: GEMINI_PRO })
    const result = await model.generateContent(prompt)
    const texto  = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''

    const { error } = await supabase.from('briefings_diarios').upsert({
      data: hoje,
      texto,
      gerado_em: new Date().toISOString(),
    }, { onConflict: 'data' })

    if (error) console.error('Erro ao salvar briefing:', error)

    return new Response(JSON.stringify({ texto, gerado_em: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('morning-briefing error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
