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

Você recebe abaixo um PANORAMA atualizado da agência (clientes, tarefas, alertas). Use esses dados para responder perguntas sobre o estado do negócio — cite nomes, valores e prazos reais. Se perguntarem algo fora do panorama, diga o que você não tem acesso.

Você pode executar ações quando o usuário pedir explicitamente. Quando for executar uma ação, responda em JSON puro (sem markdown):
{
  "content": "sua resposta ao usuário",
  "actions": [
    { "type": "create_task", "data": { "titulo": "...", "descricao": "...", "prioridade": "normal|alto|critico", "cliente_id": "..." } },
    { "type": "create_notification", "data": { "titulo": "...", "mensagem": "..." } }
  ]
}
Para vincular uma task a um cliente, use o ID entre colchetes listado no panorama.

Se NÃO há ação, responda normalmente em texto puro (não em JSON). Máx 4 parágrafos.

Exemplos que requerem ação:
- "crie uma task para ligar para o João" → create_task
- "me lembre de verificar o CPA amanhã" → create_task
- "adiciona uma notificação sobre saldo baixo" → create_notification`

// ── Panorama operacional ──────────────────────────────────────────────────────
// Snapshot compacto do estado da agência injetado em toda conversa, para a IA
// responder com dados reais. Usa service-role, então TODO filtro é por user_id.
async function montarPanorama(userId: string): Promise<string> {
  const [clientesRes, tarefasRes] = await Promise.all([
    supabase
      .from('clientes')
      .select('id, nome, nicho, status, mrr, dias_atraso, saldo_google')
      .eq('user_id', userId)
      .order('mrr', { ascending: false })
      .limit(50),
    supabase
      .from('tarefas')
      .select('titulo, prioridade, status, data_prazo, cliente_id')
      .eq('user_id', userId)
      .in('status', ['pendente', 'em_progresso'])
      .order('data_prazo', { ascending: true, nullsFirst: false })
      .limit(20),
  ])

  const clientes = clientesRes.data ?? []
  const tarefas  = tarefasRes.data ?? []

  const clienteIds  = clientes.map((c) => c.id)
  const nomePorId   = new Map(clientes.map((c) => [c.id, c.nome]))

  const { data: alertas } = clienteIds.length
    ? await supabase
        .from('alertas')
        .select('cliente_id, tipo_alerta, mensagem')
        .in('cliente_id', clienteIds)
        .eq('disparado', false)
        .limit(10)
    : { data: [] }

  const hoje        = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const ativos      = clientes.filter((c) => c.status === 'ativo')
  const mrrTotal    = ativos.reduce((s, c) => s + (c.mrr ?? 0), 0)
  const inadimplentes = clientes.filter((c) => (c.dias_atraso ?? 0) > 0)

  const linhasClientes = clientes.map((c) => {
    const extras = [
      c.nicho,
      `status: ${c.status}`,
      c.mrr ? `MRR R$ ${c.mrr}` : null,
      (c.dias_atraso ?? 0) > 0 ? `ATRASO ${c.dias_atraso}d` : null,
      c.saldo_google != null ? `saldo Google R$ ${c.saldo_google}` : null,
    ].filter(Boolean).join(', ')
    return `- ${c.nome} (${extras}) [${c.id}]`
  })

  const linhasTarefas = tarefas.map((t) => {
    const cliente = t.cliente_id ? nomePorId.get(t.cliente_id) : null
    const prazo   = t.data_prazo ? ` — prazo ${new Date(t.data_prazo).toLocaleDateString('pt-BR')}` : ''
    return `- [${t.prioridade}] ${t.titulo}${cliente ? ` (${cliente})` : ''}${prazo}`
  })

  const linhasAlertas = (alertas ?? []).map((a) =>
    `- ${a.tipo_alerta}: ${a.mensagem}${nomePorId.get(a.cliente_id) ? ` (${nomePorId.get(a.cliente_id)})` : ''}`
  )

  return [
    `\n\n══ PANORAMA DA AGÊNCIA — ${hoje} ══`,
    `Resumo: ${clientes.length} clientes (${ativos.length} ativos), MRR total R$ ${mrrTotal}, ${inadimplentes.length} inadimplente(s).`,
    linhasClientes.length ? `\nCLIENTES:\n${linhasClientes.join('\n')}` : '',
    linhasTarefas.length  ? `\nTAREFAS ABERTAS:\n${linhasTarefas.join('\n')}` : '\nTAREFAS ABERTAS: nenhuma.',
    linhasAlertas.length  ? `\nALERTAS PENDENTES:\n${linhasAlertas.join('\n')}` : '',
  ].filter(Boolean).join('\n')
}

export async function POST(req: NextRequest) {
  const session = await createSessionClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ content: 'Não autorizado' } satisfies ChatResponse, { status: 401 })

  const body = await req.json() as {
    messages:             ChatMensagem[]
    contexto_cliente_id?: string
  }

  const { messages, contexto_cliente_id } = body

  const panorama = await montarPanorama(user.id)

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

  const systemPrompt = SYSTEM_PROMPT_BASE + panorama + contextoCliente

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
