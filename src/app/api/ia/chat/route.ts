import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import { MODELO_FLASH, criarVertexAI } from '@/lib/vertex-ai'
import type { ChatMensagem }         from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export interface ChatAction {
  type:  'create_task' | 'create_notification'
  data:  Record<string, unknown>
}

interface ChatResponse {
  content: string
  actions?: ChatAction[]
}

const SYSTEM_PROMPT_BASE = `Você é um assistente operacional da agência Adsgator, especializado em Google Ads e gestão de clientes. Responda de forma direta, prática e conversacional.

Você pode executar ações quando o usuário pedir explicitamente. Quando for executar uma ação, responda em JSON puro (sem markdown):
{
  "content": "sua resposta ao usuário",
  "actions": [
    { "type": "create_task", "data": { "titulo": "...", "descricao": "...", "prioridade": "normal|alto|critico", "cliente_id": "..." } },
    { "type": "create_notification", "data": { "titulo": "...", "mensagem": "..." } }
  ]
}

Se NÃO há ação, responda normalmente em texto puro (não em JSON). Máx 4 parágrafos.

Exemplos que requerem ação:
- "crie uma task para ligar para o João" → create_task
- "me lembre de verificar o CPA amanhã" → create_task
- "adiciona uma notificação sobre saldo baixo" → create_notification`

export async function POST(req: NextRequest) {
  const session = await createSessionClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ content: 'Não autorizado' } satisfies ChatResponse, { status: 401 })

  const body = await req.json() as {
    messages:             ChatMensagem[]
    contexto_cliente_id?: string
  }

  const { messages, contexto_cliente_id } = body

  let contextoCliente = ''
  if (contexto_cliente_id) {
    // Verifica propriedade antes de expor dados do cliente
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id, nome, nicho, status, mrr, dias_atraso, user_id')
      .eq('id', contexto_cliente_id)
      .eq('user_id', user.id)
      .single()

    if (cliente) {
      const c = cliente as { id: string; nome: string; nicho?: string; status: string; mrr?: number; dias_atraso?: number }
      contextoCliente = `\n\nCliente em contexto: ${c.nome} (${c.nicho ?? 'sem nicho'}), status: ${c.status}, MRR: R$ ${c.mrr ?? 0}. ID: ${c.id}`
      const { data: memoria } = await supabase
        .from('memoria_clientes')
        .select('conteudo_md')
        .eq('cliente_id', cliente.id)
        .maybeSingle()
      if (memoria?.conteudo_md) {
        contextoCliente += `\nMemória: ${(memoria.conteudo_md as string).slice(0, 500)}`
      }
    }
  }

  const systemPrompt = SYSTEM_PROMPT_BASE + contextoCliente

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
    const texto  = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''

    // Tentar parsear como JSON (resposta com actions)
    if (texto.startsWith('{')) {
      try {
        const parsed = JSON.parse(texto) as ChatResponse
        if (parsed.content) return NextResponse.json(parsed)
      } catch { /* não era JSON válido — tratar como texto */ }
    }

    return NextResponse.json({ content: texto || 'Desculpe, não consegui processar sua mensagem.' } satisfies ChatResponse)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ content: msg } satisfies ChatResponse, { status: 500 })
  }
}
