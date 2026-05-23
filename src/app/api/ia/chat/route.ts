import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { VertexAI }                  from '@google-cloud/vertexai'
import { MODELO_FLASH }              from '@/lib/vertex-ai'
import type { ChatMensagem }         from '@/lib/types'

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

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    messages:          ChatMensagem[]
    contexto_cliente_id?: string
  }

  const { messages, contexto_cliente_id } = body

  let contextoCliente = ''
  if (contexto_cliente_id) {
    const [{ data: cliente }, { data: memoria }] = await Promise.all([
      supabase.from('clientes').select('nome, nicho, status, mrr, dias_atraso').eq('id', contexto_cliente_id).single(),
      supabase.from('memoria_clientes').select('conteudo_md').eq('cliente_id', contexto_cliente_id).maybeSingle(),
    ])
    if (cliente) {
      contextoCliente = `\nCliente em contexto: ${cliente.nome} (${cliente.nicho}), status: ${cliente.status}, MRR: R$ ${cliente.mrr ?? 0}`
      if (memoria?.conteudo_md) {
        contextoCliente += `\nMemória: ${memoria.conteudo_md.slice(0, 500)}`
      }
    }
  }

  const systemPrompt = `Você é um assistente operacional da agência Adsgator, especializado em Google Ads e gestão de clientes. Responda de forma direta, prática e conversacional (não robótica). Máx 4 parágrafos.${contextoCliente}`

  const contents = [
    { role: 'user' as const, parts: [{ text: systemPrompt }] },
    ...messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role:  m.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: m.content }],
      })),
  ]

  try {
    const vertex = criarVertexAI()
    const model  = vertex.preview.getGenerativeModel({ model: MODELO_FLASH })
    const result = await model.generateContent({ contents })
    const texto  = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? 'Desculpe, não consegui processar sua mensagem.'
    return NextResponse.json({ content: texto })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
