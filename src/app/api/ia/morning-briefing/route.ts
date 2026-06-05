import { NextResponse }         from 'next/server'
import { createClient }         from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'
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

type FiltroModo = 'completo' | 'urgencias' | 'resumido'

function buildPrompt(
  hoje: string,
  clientes: { nome: string; status: string; dias_atraso?: number; mrr?: number; nicho?: string }[],
  alertas: { tipo: string; mensagem: string }[],
  filtro: FiltroModo,
): string {
  const mrrTotal     = clientes.reduce((s, c) => s + (c.mrr ?? 0), 0)
  const inadimplentes = clientes.filter((c) => (c.dias_atraso ?? 0) > 0)

  const contexto = `Dados de hoje (${hoje}):
- Clientes ativos: ${clientes.length}
- MRR total: R$ ${mrrTotal.toLocaleString('pt-BR')}
- Inadimplentes: ${inadimplentes.length} (${inadimplentes.map((c) => c.nome).join(', ') || 'nenhum'})
- Alertas abertos: ${alertas.length}`

  if (filtro === 'urgencias') {
    return `Você é o assistente operacional da Adsgator. Gere um briefing APENAS sobre urgências (máx 4 linhas, sem markdown, sem listas).

${contexto}

Liste SOMENTE o que precisa de ação IMEDIATA hoje. Se não houver urgências críticas, diga brevemente que está tudo sob controle.`
  }

  if (filtro === 'resumido') {
    return `Você é o assistente operacional da Adsgator. Gere um resumo em ATÉ 2 LINHAS, sem markdown.

${contexto}

Seja extremamente conciso: 1 linha com o status geral, 1 linha com a ação mais importante.`
  }

  // completo (padrão)
  return `Você é o assistente operacional da Adsgator. Gere um briefing matinal CONCISO (máx 5 linhas, sem markdown, sem listas).

${contexto}

Foque em: o que está bem, o que precisa de atenção hoje, 1 sugestão de ação prioritária.`
}

export async function GET(req: Request) {
  const session = await createSessionClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const filtro = (searchParams.get('filtro') ?? 'completo') as FiltroModo
  const hoje = new Date().toISOString().slice(0, 10)

  const [{ data: clientes }, { data: alertas }] = await Promise.all([
    supabase
      .from('clientes')
      .select('nome, status, dias_atraso, mrr, nicho')
      .in('status', ['ativo', 'onboarding', 'setup_trafego', 'recebido']),
    supabase
      .from('alertas')
      .select('tipo, mensagem')
      .eq('resolvido', false)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const clientesTyped = (clientes ?? []) as { nome: string; status: string; dias_atraso?: number; mrr?: number; nicho?: string }[]
  const alertasTyped  = (alertas ?? []) as { tipo: string; mensagem: string }[]
  const mrrTotal      = clientesTyped.reduce((s, c) => s + (c.mrr ?? 0), 0)
  const inadimplentes = clientesTyped.filter((c) => (c.dias_atraso ?? 0) > 0)

  const prompt = buildPrompt(hoje, clientesTyped, alertasTyped, filtro)

  try {
    const vertex = criarVertexAI()
    const model  = vertex.preview.getGenerativeModel({ model: MODELO_PRO })
    const result = await model.generateContent(prompt)
    const texto  = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
    return NextResponse.json({ texto, gerado_em: new Date().toISOString() })
  } catch {
    const texto = inadimplentes.length > 0
      ? `${inadimplentes.length} cliente(s) inadimplente(s) requerem atenção hoje. MRR total: R$ ${mrrTotal.toLocaleString('pt-BR')}.`
      : `Bom dia! ${clientesTyped.length} clientes ativos. MRR: R$ ${mrrTotal.toLocaleString('pt-BR')}. Sem alertas críticos.`
    return NextResponse.json({ texto, gerado_em: new Date().toISOString() })
  }
}
