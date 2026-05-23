// supabase/functions/gerar-insight-ia/index.ts
// POST /functions/v1/gerar-insight-ia
// Body: { cliente_id, snapshot_id }

import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { VertexAI }     from 'https://esm.sh/@google-cloud/vertexai@1'
import { TEST_MODE }    from '../_shared/test-mode.ts'

const GEMINI_FLASH = 'gemini-2.5-flash'

function criarVertexAI() {
  return new VertexAI({
    project:  Deno.env.get('VERTEX_AI_PROJECT_ID')!,
    location: Deno.env.get('VERTEX_AI_LOCATION') ?? 'us-central1',
    googleAuthOptions: { keyFilename: Deno.env.get('VERTEX_AI_CREDENTIALS') },
  })
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { cliente_id, snapshot_id } = await req.json()

    if (!cliente_id || !snapshot_id) {
      return new Response(JSON.stringify({ error: 'cliente_id e snapshot_id são obrigatórios' }), { status: 400 })
    }

    // Buscar snapshot com dados do cliente
    const { data: snap, error: snapError } = await supabase
      .from('analytics_snapshots')
      .select('*, clientes(nome, nicho)')
      .eq('id', snapshot_id)
      .single()

    if (snapError || !snap) {
      return new Response(JSON.stringify({ error: 'Snapshot não encontrado' }), { status: 404 })
    }

    // Buscar histórico dos últimos 4 snapshots para comparação
    const { data: historico } = await supabase
      .from('analytics_snapshots')
      .select('cpa, ctr, conversoes, periodo_fim')
      .eq('cliente_id', cliente_id)
      .eq('fonte', 'google_ads')
      .order('periodo_fim', { ascending: false })
      .limit(4)

    const prompt = `
Você é o analista de tráfego pago da agência Adsgator.
Analise os dados de Google Ads abaixo e gere um insight conciso (máximo 3 frases)
em português, identificando o principal problema ou oportunidade.

REGRA CRÍTICA: Conversões fracionadas (ex: 0.5, 1.5) são CORRETAS — são resultado da
atribuição data-driven do Google. Nunca sinalize como erro.

Cliente: ${snap.clientes?.nome} (${snap.clientes?.nicho})
Período: ${snap.periodo_inicio} a ${snap.periodo_fim}

DADOS ATUAIS:
- Investimento: R$ ${snap.investimento}
- Cliques: ${snap.cliques}
- CTR: ${((snap.ctr ?? 0) * 100).toFixed(2)}%
- Conversões: ${snap.conversoes}
- CPA: R$ ${snap.cpa}

HISTÓRICO (últimas semanas):
${(historico ?? []).map((h: { cpa: number; ctr: number; conversoes: number }) => `- CPA: R$ ${h.cpa}, CTR: ${((h.ctr ?? 0) * 100).toFixed(1)}%, Conv: ${h.conversoes}`).join('\n')}

Gere o insight focando em: o que está bom, o que precisa atenção, e qual ação tomar.
`

    // 🧪 Em modo de teste, retorna insight mockado sem consumir API
    if (TEST_MODE) {
      const mockInsight = `[🧪 TESTE] Insight simulado para ${snap.clientes?.nome}: CTR de ${((snap.ctr ?? 0) * 100).toFixed(2)}% e CPA de R$${snap.cpa} registrados. Em produção, o Gemini analisaria os dados históricos e identificaria a principal oportunidade de otimização para o nícho ${snap.clientes?.nicho}.`;
      await supabase.from('analytics_snapshots').update({ insight_ia: mockInsight }).eq('id', snapshot_id);
      return new Response(JSON.stringify({ insight: mockInsight, test_mode: true }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const vertex = criarVertexAI()
    const model  = vertex.preview.getGenerativeModel({
      model: GEMINI_FLASH,
      generationConfig: { maxOutputTokens: 200, temperature: 0.3 },
    })
    const result = await model.generateContent(prompt)
    const insight = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? 'Insight não disponível'

    // Salvar insight no snapshot
    await supabase
      .from('analytics_snapshots')
      .update({ insight_ia: insight })
      .eq('id', snapshot_id)

    return new Response(JSON.stringify({ insight }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[gerar-insight-ia]', error)
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
})
