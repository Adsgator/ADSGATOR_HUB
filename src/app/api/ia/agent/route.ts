// ─── AGENTE IA DO HUB ─────────────────────────────────────────────────────────
// Loop agêntico com function calling: o Gemini recebe o toolbox completo do Hub
// (lib/ia/tools.ts), decide quais ferramentas chamar, recebe os resultados e
// itera até produzir a resposta final. Conversas e mensagens são persistidas
// em ia_conversas / ia_mensagens; a memória de longo prazo (ia_memoria) e o
// panorama da agência são injetados no system prompt de toda chamada.

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import { MODELO_FLASH, criarVertexAI } from '@/lib/vertex-ai'
import {
  FUNCTION_DECLARATIONS,
  executarFerramenta,
  type ToolCtx,
  type ToolExecutada,
} from '@/lib/ia/tools'
import type { Content, Part } from '@google-cloud/vertexai'
import { extrairUso, registrarUso, custoBRL } from '@/lib/ia/uso'

// O loop pode encadear várias chamadas ao modelo + ferramentas
export const maxDuration = 120

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const MAX_ITERACOES      = 10
const MAX_ANEXO_BASE64   = 4 * 1024 * 1024 // ~3MB de imagem real
const MAX_ARQUIVO_CHARS  = 30_000
const HISTORICO_MENSAGENS = 40
const MENSAGENS_COM_IMAGEM = 8 // só as N últimas mensagens reenviam imagens ao modelo

export interface AnexoIA {
  tipo:        'imagem' | 'texto'
  nome:        string
  mimeType?:   string
  dataBase64?: string // imagens
  conteudo?:   string // arquivos .md/.txt
}

interface AgentRequest {
  conversa_id?:         string
  mensagem:             string
  anexos?:              AnexoIA[]
  pagina?:              string
  cliente_contexto_id?: string
}

// ── System prompt ─────────────────────────────────────────────────────────────

const IDENTIDADE = `Você é a Gator — a IA do Adsgator Hub, o sistema operacional inteligente da agência Adsgator (gestão de tráfego Google Ads). Você não é um chatbot limitado: você É o sistema. Tem acesso total de leitura e escrita a tudo via ferramentas: clientes, tarefas, financeiro, marketing, prospecção, alertas, analytics (snapshots e ao vivo), memória e status das integrações.

Quem fala com você é o Lucas, operador único da agência. Você é a sócia-operadora dele.

PERSONALIDADE:
- Direta e resolutiva: energia de quem tira coisa do papel, não de quem explica processo. Zero corporativês ("estou à disposição", "como posso ajudar" — nunca).
- Tom de sócia: opina de verdade, discorda quando os dados discordam, comemora vitória real (cliente novo, inadimplente que pagou) sem exagero.
- Humor seco e pontual quando couber — nunca forçado, nunca em situação grave (cliente cancelando, dinheiro em risco).
- Obsessão por resultado: pensa em MRR, CPA e prazo antes de pensar em estética.

REGRAS DE OPERAÇÃO:
0. CALIBRE O ESFORÇO. Nem toda mensagem precisa de ferramenta. Saudação, agradecimento, papo trivial, ajuda pontual de escrita, ou algo que você já respondeu nesta conversa → responda DIRETO, em 1 passo, sem chamar ferramenta nenhuma. Você NÃO recebe o estado da agência pré-carregado: quando a resposta depender dele (clientes, MRR, inadimplência, tarefas) chame panorama_agencia; quando depender de um dado específico (campanha, cliente) chame a ferramenta certa. Um "oi" se responde com um "oi" — sem consultar nada. Ferramenta à toa é desperdício; bom agente sabe quando NÃO agir e quando buscar.
1. NUNCA invente dados. Se a resposta depende do estado do sistema, consulte a ferramenta antes de responder (estado geral → panorama_agencia; "as APIs estão funcionando?" → status_sistema; "como tá a campanha?" → ads_ao_vivo ou analytics_cliente). Se o dado já apareceu nesta conversa e não deve ter mudado, reuse — não re-consulte por consultar.
2. Encadeie ferramentas livremente: busque o cliente pelo nome, pegue o ID, execute a ação. Não peça ao usuário um ID que você mesma pode descobrir.
3. Execute o que for pedido sem pedir confirmação — exceto exclusões e mudanças financeiras grandes, que merecem um "confirma?" antes.
4. Seja proativa com bom senso: quando o assunto for operacional e você já tiver chamado panorama_agencia, aponte o que for relevante (inadimplência, saldo baixo, tarefa do dia) e ofereça-se para agir. Se a conversa é operacional mas você ainda não olhou o estado, vale chamar panorama_agencia para embasar. Não force em "oi"/papo trivial — proatividade é no momento certo, não em toda mensagem.
5. MEMÓRIA DE MÃO DUPLA — não espere o "lembre que...". Quando o Lucas relatar no chat um fato operacional que muda o estado das coisas ("já cobrei o Alfa", "combinei a entrega da página com o Beta pra sexta", "o Gama pediu pra pausar", "fechei com fulano"), salve com salvar_memoria por conta própria, em uma frase autocontida e datada quando fizer sentido — sem pedir permissão e sem interromper a resposta. Salve também preferências e regras da agência. Não salve trivialidades nem o que já está na sua memória (listada abaixo) ou no panorama. Quando algo registrado deixar de valer (cobrança quitada, entrega feita), use esquecer_memoria. Esses fatos alimentam o briefing matinal — registrá-los é o que mantém o sistema ciente do que você já fez.
6. Datas relativas ("amanhã", "sexta") — calcule a partir da data atual informada abaixo.
7. VOCÊ ENXERGA IMAGENS NATIVAMENTE — não precisa de ferramenta nenhuma pra isso. Quando receber uma imagem (print de campanha, métrica, criativo, logo, foto), olhe e descreva o que VÊ de verdade, e conecte com os dados do Hub quando fizer sentido. NUNCA diga que "não consegue ver imagens", que "processa só texto" ou que "falta uma ferramenta" pra isso — é falso e quebra a confiança. Se a imagem vier ilegível ou faltar contexto, peça o que precisa; não negue a capacidade.
8. AUTOCONHECIMENTO HONESTO: não invente limitações suas. Você vê imagens, opera o sistema via ferramentas, tem memória de longo prazo, lê/escreve dados. Antes de dizer "não consigo X", confira se é verdade — afirmar uma incapacidade falsa, com confiança, é tão grave quanto inventar um dado. Se de fato não puder algo, diga o que pode fazer no lugar.
9. Você também é consultora do PRODUTO: conhece o Hub por dentro via mapa_do_sistema (módulos, integrações, lacunas, toggles). Quando o Lucas pedir opinião sobre o sistema — ou você notar fricção no uso — sugira melhorias concretas ancoradas no que existe. Ideia aprovada vira tarefa: escreva a spec (o quê, por quê, onde encaixa) e crie com criar_tarefa para o engenheiro implementar.

ECONOMIA — RESPOSTAS E FERRAMENTAS:
- Resposta padrão: curta, 2 a 6 linhas. Só alongue quando pedirem análise profunda, relatório ou plano.
- Não despeje listas inteiras de ferramenta na resposta: destaque o que importa (top 3, o crítico, o total) e diga que o resto existe.
- Não re-consulte uma ferramenta se o dado já apareceu nesta conversa e não deve ter mudado.
- Markdown enxuto: negrito para valores e nomes, listas curtas, sem cabeçalhos desnecessários. Valores em R$.`

async function montarSystemPrompt(
  userId: string,
  pagina?: string,
  clienteContextoId?: string,
): Promise<string> {
  const agora = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo', dateStyle: 'full', timeStyle: 'short',
  })

  const { data: memoriaData } = await supabase
    .from('ia_memoria').select('id, conteudo').eq('user_id', userId).order('created_at').limit(100)

  const memorias = memoriaData ?? []
  const blocoMemoria = memorias.length
    ? `══ SUA MEMÓRIA DE LONGO PRAZO (id entre colchetes — use esquecer_memoria para remover) ══\n${memorias.map((m) => `- [${m.id}] ${m.conteudo}`).join('\n')}`
    : '══ SUA MEMÓRIA DE LONGO PRAZO ══\n(vazia — salve fatos relevantes com salvar_memoria)'

  let blocoCliente = ''
  if (clienteContextoId) {
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id, nome, nicho, status, mrr, dias_atraso')
      .eq('id', clienteContextoId)
      .eq('user_id', userId)
      .maybeSingle()
    if (cliente) {
      blocoCliente = `\n\nCLIENTE EM CONTEXTO NESTA CONVERSA: ${cliente.nome} (${cliente.nicho ?? 'sem nicho'}), status ${cliente.status}, MRR R$ ${cliente.mrr ?? 0} [${cliente.id}]. Ações sem cliente explícito referem-se a ele.`
      const { data: memoria } = await supabase
        .from('memoria_clientes')
        .select('conteudo_md')
        .eq('cliente_id', cliente.id)
        .maybeSingle()
      if (memoria?.conteudo_md) {
        blocoCliente += `\nMemória do cliente:\n${(memoria.conteudo_md as string).slice(0, 1500)}`
      }
    }
  }

  return [
    IDENTIDADE,
    `Data e hora atual (America/Sao_Paulo): ${agora}.`,
    pagina ? `O usuário está agora na página ${pagina} do Hub.` : '',
    `ESTADO DA AGÊNCIA: você NÃO recebe o estado pré-carregado. Quando a conversa tocar em operação/clientes/finanças — ou quando quiser ser proativa — chame panorama_agencia para o resumo (clientes, MRR, inadimplência, saldo baixo). Não chame em saudações/papo trivial. Para listas completas, listar_clientes/listar_tarefas.`,
    blocoMemoria,
    blocoCliente,
  ].filter(Boolean).join('\n\n')
}

// ── Histórico → contents do Gemini ────────────────────────────────────────────

interface MensagemDb {
  id:         string
  role:       'user' | 'assistant'
  content:    string
  anexos:     AnexoIA[] | null
  created_at: string
}

function mensagemParaContent(m: MensagemDb, incluirImagens: boolean): Content {
  if (m.role === 'assistant') {
    return { role: 'model', parts: [{ text: m.content || '…' }] }
  }
  const parts: Part[] = []
  if (m.content) parts.push({ text: m.content })
  for (const anexo of m.anexos ?? []) {
    if (anexo.tipo === 'imagem' && anexo.dataBase64) {
      if (incluirImagens) {
        parts.push({ inlineData: { mimeType: anexo.mimeType ?? 'image/jpeg', data: anexo.dataBase64 } })
      } else {
        parts.push({ text: `[imagem enviada anteriormente: ${anexo.nome}]` })
      }
    } else if (anexo.tipo === 'texto' && anexo.conteudo) {
      parts.push({ text: `\n--- Conteúdo do arquivo "${anexo.nome}" ---\n${anexo.conteudo.slice(0, MAX_ARQUIVO_CHARS)}\n--- fim do arquivo ---` })
    }
  }
  if (!parts.length) parts.push({ text: '…' })
  return { role: 'user', parts }
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await createSessionClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json() as AgentRequest
  const mensagem = (body.mensagem ?? '').trim()
  const anexos   = (body.anexos ?? []).filter((a) =>
    a && (a.tipo === 'imagem' ? !!a.dataBase64 : !!a.conteudo)
  )

  if (!mensagem && !anexos.length) {
    return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 })
  }
  for (const a of anexos) {
    if (a.dataBase64 && a.dataBase64.length > MAX_ANEXO_BASE64) {
      return NextResponse.json({ error: `Imagem "${a.nome}" muito grande (máx ~3MB)` }, { status: 400 })
    }
    if (a.conteudo) a.conteudo = a.conteudo.slice(0, MAX_ARQUIVO_CHARS)
  }

  // 1. Resolve/cria a conversa
  let conversaId = body.conversa_id
  if (conversaId) {
    const { data } = await supabase.from('ia_conversas').select('id').eq('id', conversaId).eq('user_id', user.id).maybeSingle()
    if (!data) return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
  } else {
    const titulo = (mensagem || anexos[0]?.nome || 'Nova conversa').slice(0, 60)
    const { data, error } = await supabase.from('ia_conversas').insert({
      user_id:    user.id,
      titulo,
      cliente_id: body.cliente_contexto_id || null,
    }).select('id').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    conversaId = data.id as string
  }

  // 2. Persiste a mensagem do usuário
  const { error: insertErr } = await supabase.from('ia_mensagens').insert({
    conversa_id: conversaId,
    user_id:     user.id,
    role:        'user',
    content:     mensagem,
    anexos:      anexos.length ? anexos : null,
  })
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  // 3. Monta histórico + system prompt
  const { data: historicoDb } = await supabase
    .from('ia_mensagens')
    .select('id, role, content, anexos, created_at')
    .eq('conversa_id', conversaId)
    .order('created_at', { ascending: false })
    .limit(HISTORICO_MENSAGENS)

  const mensagens = ((historicoDb ?? []) as MensagemDb[]).reverse()
  const corte     = Math.max(0, mensagens.length - MENSAGENS_COM_IMAGEM)
  const contents: Content[] = mensagens.map((m, i) => mensagemParaContent(m, i >= corte))

  const systemPrompt = await montarSystemPrompt(user.id, body.pagina, body.cliente_contexto_id)

  const toolCtx: ToolCtx = {
    db:     supabase,
    userId: user.id,
    origin: req.nextUrl.origin,
    cookie: req.headers.get('cookie') ?? '',
  }

  // 4. Loop agêntico
  try {
    const vertex = criarVertexAI()
    const model  = vertex.preview.getGenerativeModel({
      model:             MODELO_FLASH,
      systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
      tools:             [{ functionDeclarations: FUNCTION_DECLARATIONS }],
      generationConfig:  { maxOutputTokens: 8192, temperature: 0.7 },
    })

    const executadas: ToolExecutada[] = []
    let conversaAtual: Content[] = contents
    let respostaFinal = ''

    // Acumuladores de uso (1 linha de telemetria por mensagem, somando o loop)
    const inicio = Date.now()
    let tokensEntrada = 0, tokensSaida = 0, tokensCache = 0, iteracoes = 0
    let contextoTokens = 0 // promptTokenCount da última chamada = "leveza" da conversa
    const ferramentasUsadas: string[] = []

    for (let i = 0; i < MAX_ITERACOES; i++) {
      const result = await model.generateContent({ contents: conversaAtual })
      const uso    = extrairUso(result)
      // 1ª iteração = histórico + system prompt, antes das ferramentas inflarem
      if (i === 0) contextoTokens = uso.tokensEntrada
      tokensEntrada += uso.tokensEntrada
      tokensSaida   += uso.tokensSaida
      tokensCache   += uso.tokensCache
      iteracoes++
      const parts  = result.response?.candidates?.[0]?.content?.parts ?? []
      const calls  = parts.filter((p) => p.functionCall).map((p) => p.functionCall!)
      const texto  = parts.filter((p) => p.text).map((p) => p.text).join('').trim()

      if (!calls.length) {
        respostaFinal = texto
        break
      }

      // Executa as ferramentas pedidas e devolve os resultados ao modelo
      const respostas: Part[] = []
      for (const fc of calls) {
        const { resultado, meta } = await executarFerramenta(
          fc.name,
          (fc.args ?? {}) as Record<string, unknown>,
          toolCtx,
        )
        executadas.push(meta)
        ferramentasUsadas.push(fc.name)
        respostas.push({ functionResponse: { name: fc.name, response: { resultado } } })
      }

      conversaAtual = [
        ...conversaAtual,
        { role: 'model', parts },
        { role: 'user',  parts: respostas },
      ]
    }

    if (!respostaFinal) {
      respostaFinal = executadas.length
        ? 'Executei as ações, mas atingi o limite de passos antes de formular a resposta completa. Veja as ações executadas abaixo.'
        : 'Não consegui processar sua mensagem. Tente reformular.'
    }

    const custoResposta = custoBRL(MODELO_FLASH, { tokensEntrada, tokensSaida, tokensCache })

    // 5. Persiste a resposta (com o custo estimado) e atualiza a conversa
    const { data: msgIa } = await supabase.from('ia_mensagens').insert({
      conversa_id: conversaId,
      user_id:     user.id,
      role:        'assistant',
      content:     respostaFinal,
      ferramentas: executadas.length ? executadas : null,
      custo_brl:   custoResposta,
    }).select('id, role, content, ferramentas, custo_brl, created_at').single()

    await supabase.from('ia_conversas')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversaId)

    // 6. Telemetria de uso — 1 linha por mensagem, somando todas as iterações
    await registrarUso(supabase, {
      userId:        user.id,
      modelo:        MODELO_FLASH,
      contexto:      'agente',
      conversaId,
      tokensEntrada, tokensSaida, tokensCache,
      duracaoMs:     Date.now() - inicio,
      iteracoes,
      ferramentas:   ferramentasUsadas,
    })

    return NextResponse.json({
      conversa_id: conversaId,
      contexto_tokens: contextoTokens,
      custo_resposta: custoResposta,
      mensagem: msgIa ?? {
        id: crypto.randomUUID(), role: 'assistant', content: respostaFinal,
        ferramentas: executadas.length ? executadas : null, custo_brl: custoResposta,
        created_at: new Date().toISOString(),
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
