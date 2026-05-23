import { NextResponse }         from 'next/server'
import { createClient }         from '@supabase/supabase-js'
import { VertexAI }             from '@google-cloud/vertexai'
import { MODELO_PRO }           from '@/lib/vertex-ai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function criarVertexAI() {
  return new VertexAI({
    project:  process.env.VERTEX_AI_PROJECT_ID!,
    location: process.env.VERTEX_AI_LOCATION ?? 'us-central1',
    googleAuthOptions: { keyFilename: process.env.VERTEX_AI_CREDENTIALS },
  })
}

export async function GET() {
  const hoje = new Date().toISOString().slice(0, 10)

  const [{ data: clientes }, { data: alertas }] = await Promise.all([
    supabase
      .from('clientes')
      .select('nome, status, dias_atraso, mrr')
      .in('status', ['ativo', 'onboarding', 'setup_trafego', 'recebido']),
    supabase
      .from('alertas')
      .select('tipo, mensagem')
      .eq('resolvido', false)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const mrrTotal = (clientes ?? []).reduce((s, c) => s + (c.mrr ?? 0), 0)
  const inadimplentes = (clientes ?? []).filter((c) => (c.dias_atraso ?? 0) > 0)

  const prompt = `Você é o assistente operacional da Adsgator. Gere um briefing matinal CONCISO (máx 5 linhas, sem markdown, sem listas).

Dados de hoje (${hoje}):
- Clientes ativos: ${clientes?.length ?? 0}
- MRR total: R$ ${mrrTotal.toLocaleString('pt-BR')}
- Inadimplentes: ${inadimplentes.length} (${inadimplentes.map((c) => c.nome).join(', ') || 'nenhum'})
- Alertas abertos: ${alertas?.length ?? 0}

Foque em: o que está bem, o que precisa de atenção hoje, 1 sugestão de ação prioritária.`

  try {
    const vertex = criarVertexAI()
    const model  = vertex.preview.getGenerativeModel({ model: MODELO_PRO })
    const result = await model.generateContent(prompt)
    const texto  = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
    return NextResponse.json({ texto, gerado_em: new Date().toISOString() })
  } catch {
    const texto = inadimplentes.length > 0
      ? `${inadimplentes.length} cliente(s) inadimplente(s) requerem atenção hoje. MRR total: R$ ${mrrTotal.toLocaleString('pt-BR')}.`
      : `Bom dia! ${clientes?.length ?? 0} clientes ativos. MRR: R$ ${mrrTotal.toLocaleString('pt-BR')}. Sem alertas críticos.`
    return NextResponse.json({ texto, gerado_em: new Date().toISOString() })
  }
}
