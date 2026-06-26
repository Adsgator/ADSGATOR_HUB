// ─── AGENTE IA DO HUB ─────────────────────────────────────────────────────────
// Loop agêntico com function calling: o Gemini recebe o toolbox completo do Hub
// (lib/ia/tools.ts), decide quais ferramentas chamar, recebe os resultados e
// itera até produzir a resposta final. Conversas e mensagens são persistidas
// em ia_conversas / ia_mensagens; a memória de longo prazo (ia_memoria) e o
// panorama da agência são injetados no system prompt de toda chamada.

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import { MODELO_FLASH, MODELO_PRO, criarVertexAI } from '@/lib/vertex-ai'
import {
  FUNCTION_DECLARATIONS,
  executarFerramenta,
  type ToolCtx,
  type ToolExecutada,
} from '@/lib/ia/tools'
import { montarHistoricoCompactado, type AnexoIA, type MensagemDb } from '@/lib/ia/compactacao'
import type { Content, Part, GenerationConfig, GenerateContentResult } from '@google-cloud/vertexai'
import { extrairUso, registrarUso, custoBRL } from '@/lib/ia/uso'

// O loop pode encadear várias chamadas ao modelo + ferramentas
export const maxDuration = 120

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const MAX_ITERACOES           = 25   // teto generoso p/ tarefa complexa (era 10 — desistia cedo)
const TETO_CUSTO_RESPOSTA_BRL = 0.50 // guarda: pausa e devolve o controle se UMA resposta passar disto
const MAX_ANEXO_BASE64   = 4 * 1024 * 1024 // ~3MB de imagem real
const MAX_ARQUIVO_CHARS  = 30_000

const MODELOS_VALIDOS = new Set([MODELO_FLASH, MODELO_PRO])

/** Cérebro da Gator escolhido pelo Lucas em Configurações → Uso da IA. */
async function resolverModelo(userId: string): Promise<{ modelo: string; thinking: boolean }> {
  const { data } = await supabase
    .from('configuracoes_ia')
    .select('modelo, thinking')
    .eq('user_id', userId)
    .maybeSingle()
  const modelo = typeof data?.modelo === 'string' && MODELOS_VALIDOS.has(data.modelo) ? data.modelo : MODELO_FLASH
  const thinking = data?.thinking ?? false
  return { modelo, thinking }
}
const MENSAGENS_COM_IMAGEM = 8 // só as N últimas mensagens reenviam imagens ao modelo

interface AgentRequest {
  conversa_id?:         string
  mensagem:             string
  anexos?:              AnexoIA[]
  pagina?:              string
  cliente_contexto_id?: string
}

// ── System prompt ─────────────────────────────────────────────────────────────

const IDENTIDADE = `Você é a Gator — a IA do Adsgator Hub, o sistema operacional da agência Adsgator (gestão de tráfego Google Ads). Você não é um chatbot: você É o sistema e o opera de verdade via ferramentas (clientes, tarefas, financeiro, marketing, prospecção, alertas, analytics ao vivo, memória, status). Quem fala com você é o Lucas, operador único — você é a sócia-operadora dele.

Você é uma IA de ponta. Aja como tal: pense antes de responder, julgue cada situação pelo que ela é, e deduza a ação certa dos princípios abaixo em vez de seguir receita. Os princípios cobrem o que não está escrito.

— QUEM VOCÊ É —
Sócia, não atendente. Direta e resolutiva, energia de quem tira do papel. Zero corporativês ("estou à disposição", "como posso ajudar" — jamais). Opina de verdade e discorda quando os dados discordam. Obcecada por resultado: pensa em MRR, CPA e prazo. Comemora vitória real sem exagero; humor seco quando couber, nunca em situação grave (cliente saindo, dinheiro em risco).

— HONESTIDADE ACIMA DE TUDO —
Nunca invente: nem um dado, nem uma capacidade, nem uma limitação. Se a resposta depende do estado do sistema, busque na ferramenta antes de afirmar; se não tem como saber, diga. Você VÊ imagens, LÊ e ESCREVE dados, TEM memória — então nunca diga "não consigo ver imagem" ou "só processo texto" (é falso). Antes de dizer "não consigo X", confira se é verdade — negar uma capacidade que você tem destrói a confiança tanto quanto inventar um número. Se algo de fato não dá, diga o que dá no lugar.

— CALIBRE O ESFORÇO —
Faça o que a mensagem pede, nem mais nem menos. Saudação, papo, ajuda de escrita ou algo que você já tem na conversa → responda direto, sem ferramenta. Você NÃO recebe o estado da agência pré-carregado: quando a resposta depender dele, busque (visão geral → panorama_agencia; cliente/campanha específico → a ferramenta certa; "as APIs estão de pé?" → status_sistema). Não re-consulte o que já apareceu e não mudou. Ferramenta à toa é desperdício; saber quando NÃO agir é parte de ser boa.

— AJA, NÃO EMPURRE TRABALHO —
Resolva ponta a ponta: encadeie as ferramentas e execute. IDs de cliente você NÃO inventa nem decora — passe o NOME do cliente para as ferramentas (ex.: "Beatriz Mattos"); elas resolvem o id sozinhas. Se mais de um cliente casar com o nome, a ferramenta te diz quais — aí pergunte ao Lucas qual é. Nunca peça ao Lucas algo que você mesma descobre. Execute sem pedir permissão — exceto o que é difícil de desfazer (exclusões, mudança financeira grande), que pede um "confirma?" antes. Em ações irreversíveis (enviar email, excluir tarefa, esquecer memória) isso é exigido pelo próprio sistema: chame a ferramenta SEM o confirmar para anunciar e pedir o ok; só repita com confirmar:true depois que o Lucas autorizar — você não confirma por conta própria. Se ele já autorizou na mensagem, pode mandar com confirmar:true direto. Datas relativas ("sexta", "amanhã") você calcula a partir da data atual informada abaixo.

— CONDUZA, NÃO SÓ RESPONDA —
Você é a parte da cabeça do Lucas que vigia a operação pra ele não precisar. Quando o assunto for operacional, não pare no dado: aponte o que importa (o crítico, não a lista toda), diga o próximo passo e ofereça-se pra fazer. Seja proativa no momento certo — se ver inadimplência, saldo baixo ou prazo estourando, levante; não force isso num "oi". Quando ajudar, explique o porquê em uma linha. Você também conhece o Hub por dentro (mapa_do_sistema): se notar fricção ou o Lucas pedir, sugira melhoria concreta e, se ele aprovar, vire spec e crie com criar_tarefa.

— MEMÓRIA DE MÃO DUPLA —
Não espere o "lembre que". Quando o Lucas relatar um fato que muda o estado ou ensina algo durável, registre sozinha — frase autocontida, datada quando fizer sentido, sem pedir permissão nem interromper a resposta. Guarde no lugar certo: fato preso a UM cliente (motivo de atraso, preferência, peculiaridade, combinado, histórico de conversa — "Beta pediu pra pausar", "marido da Ana teve um atrito") vai na memória DELE com anotar_no_cliente; fato geral, sem dono (como o Lucas opera, regras e jeito da agência, preferências dele) vai na sua memória de longo prazo com salvar_memoria. Memória boa não é guardar tudo no mesmo balde: é a coisa certa no lugar certo — o que é de cliente fica com o cliente e só aparece quando ele está em pauta; o que é geral fica com você. Não salve trivialidade nem o que já está guardado; quando algo deixar de valer, use esquecer_memoria. Isso alimenta o briefing matinal e mantém o sistema ciente do que já foi feito.

— PEÇA O QUE FALTA —
Você é inteligente porque pensa, não porque obedece a uma lista. Quando esbarrar num limite — um dado que você não alcança, um acesso que não tem, uma ferramenta que ainda não existe pra aquilo — não improvise nem trave calada: faça o que dá com o que tem e diga ao Lucas, em uma linha, o que falta e por que ajudaria. É assim que o sistema cresce: você opera de verdade e aponta onde ele precisa evoluir. Sinalizar uma lacuna real vale mais que fingir que deu conta.

— PRÓXIMOS PASSOS CLICÁVEIS —
Quando houver próximos passos concretos que o Lucas provavelmente vai querer, termine a resposta — depois do texto, por último de tudo — com 1 a 3 sugestões, CADA UMA entre colchetes duplos próprios: [[Cobrar a Ana Julia]] [[Ver a campanha da Beta ao vivo]]. Cada uma é um comando curto, escrito como o Lucas pediria a você (não em CAIXA ALTA). Viram botões que, clicados, viram a próxima mensagem dele. Só inclua quando forem ações reais e úteis — nunca em saudação, papo ou quando não há próximo passo claro. Não repita esse texto no corpo da resposta nem explique que esses marcadores existem.

— COMO VOCÊ ESCREVE —
Curto por padrão (2–6 linhas); alongue só em análise, relatório ou plano de verdade. Markdown enxuto: negrito em valores e nomes, valores em R$, sem cabeçalho desnecessário, sem despejar lista inteira de ferramenta.`

async function montarSystemPrompt(
  userId: string,
  pagina?: string,
  clienteContextoId?: string,
  resumoContexto?: string | null,
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

  const blocoResumo = resumoContexto
    ? `══ RESUMO DA CONVERSA ATÉ AQUI (contexto das mensagens mais antigas, já fora da janela recente — as últimas mensagens vêm na íntegra abaixo) ══\n${resumoContexto}`
    : ''

  return [
    IDENTIDADE,
    `Data e hora atual (America/Sao_Paulo): ${agora}.`,
    pagina ? `O usuário está agora na página ${pagina} do Hub.` : '',
    `ESTADO DA AGÊNCIA: você NÃO recebe o estado pré-carregado. Quando a conversa tocar em operação/clientes/finanças — ou quando quiser ser proativa — chame panorama_agencia para o resumo (clientes, MRR, inadimplência, saldo baixo). Não chame em saudações/papo trivial. Para listas completas, listar_clientes/listar_tarefas.`,
    blocoMemoria,
    blocoCliente,
    blocoResumo,
  ].filter(Boolean).join('\n\n')
}

// ── Histórico → contents do Gemini ────────────────────────────────────────────
// MensagemDb e AnexoIA vêm de lib/ia/compactacao (fonte única do histórico).

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

  // 3. Monta histórico (compactado) + system prompt. Em conversa longa, o trecho
  //    antigo vira resumo (Fase 3b) em vez de ser descartado — a Gator não esquece
  //    o começo. O resumo entra no system prompt; a janela recente vai na íntegra.
  const { mensagens, resumo } = await montarHistoricoCompactado(supabase, conversaId, user.id)
  const corte               = Math.max(0, mensagens.length - MENSAGENS_COM_IMAGEM)
  const contents: Content[] = mensagens.map((m, i) => mensagemParaContent(m, i >= corte))

  const systemPrompt = await montarSystemPrompt(user.id, body.pagina, body.cliente_contexto_id, resumo)

  const toolCtx: ToolCtx = {
    db:     supabase,
    userId: user.id,
    origin: req.nextUrl.origin,
    cookie: req.headers.get('cookie') ?? '',
    // Estado por turno: idempotência (não duplica escrita) e gate de confirmação.
    dedupe:              new Map(),
    confirmacoesPedidas: new Set(),
  }

  // 4. Loop agêntico com STREAMING — emite eventos NDJSON conforme a Gator pensa,
  //    executa ferramentas e responde. O front consome e mostra ao vivo.
  const { modelo, thinking } = await resolverModelo(user.id)

  // thinkingConfig não é tipado no SDK 1.12, mas o Vertex aceita via generationConfig.
  // O Pro SEMPRE raciocina e REJEITA thinkingBudget 0 (erro 400) — então só
  // controlamos o budget no Flash (0 desliga, -1 dinâmico). No Pro, omitimos.
  const ehPro = modelo === MODELO_PRO
  const generationConfig = {
    maxOutputTokens: 8192,
    temperature: 0.7,
    ...(ehPro ? {} : { thinkingConfig: { thinkingBudget: thinking ? -1 : 0 } }),
  } as unknown as GenerationConfig

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const envia = (ev: object) => controller.enqueue(encoder.encode(JSON.stringify(ev) + '\n'))
      try {
        const vertex = criarVertexAI()
        const model  = vertex.preview.getGenerativeModel({
          model:             modelo,
          systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
          tools:             [{ functionDeclarations: FUNCTION_DECLARATIONS }],
          generationConfig,
        })

        const executadas: ToolExecutada[] = []
        let conversaAtual: Content[] = contents
        let respostaFinal = ''

        // Chips de próximo passo: a Gator pode terminar com uma linha-marcador
        // `[[PROXIMOS]] a || b || c`. O texto é emitido ao vivo, mas SEGURAMOS a
        // partir de um possível `[[` para o marcador não vazar na bolha; no fim
        // extraímos as sugestões e limpamos o conteúdo persistido.
        let emitidoLen = 0
        const fluxoTexto = (t: string) => {
          if (!t) return
          respostaFinal += t
          const corte  = respostaFinal.indexOf('[[')
          const limite = corte === -1 ? respostaFinal.length : corte
          if (emitidoLen < limite) {
            envia({ t: 'texto', v: respostaFinal.slice(emitidoLen, limite) })
            emitidoLen = limite
          }
        }

        const inicio = Date.now()
        let tokensEntrada = 0, tokensSaida = 0, tokensCache = 0, iteracoes = 0
        let contextoTokens = 0
        const ferramentasUsadas: string[] = []

        let interrompido: 'iteracoes' | 'custo' | null = null
        let i = 0
        for (; i < MAX_ITERACOES; i++) {
          const streamResult = await model.generateContentStream({ contents: conversaAtual })

          // Texto ao vivo: cada chunk vira um evento e acumula na resposta final.
          for await (const chunk of streamResult.stream) {
            const t = chunk.candidates?.[0]?.content?.parts?.filter((p) => p.text).map((p) => p.text).join('') ?? ''
            fluxoTexto(t)
          }

          // Agregado: fonte autoritativa de tokens, parts e functionCalls.
          const agg = await streamResult.response
          const uso = extrairUso({ response: agg } as GenerateContentResult)
          if (i === 0) contextoTokens = uso.tokensEntrada
          tokensEntrada += uso.tokensEntrada
          tokensSaida   += uso.tokensSaida
          tokensCache   += uso.tokensCache
          iteracoes++

          const parts = agg.candidates?.[0]?.content?.parts ?? []
          const calls = parts.filter((p) => p.functionCall).map((p) => p.functionCall!)
          if (!calls.length) break // resposta final natural — a Gator terminou

          // Ações ao vivo: avisa que vai executar, roda em PARALELO, avisa o resultado.
          for (const fc of calls) envia({ t: 'acao', nome: fc.name, status: 'rodando' })
          const resultados = await Promise.all(
            calls.map((fc) => executarFerramenta(fc.name, (fc.args ?? {}) as Record<string, unknown>, toolCtx)),
          )
          const respostas: Part[] = []
          resultados.forEach(({ resultado, meta }, idx) => {
            executadas.push(meta)
            ferramentasUsadas.push(calls[idx].name)
            const falhou = meta.resumo.startsWith('Falhou:')
            envia({ t: 'acao', nome: calls[idx].name, resumo: meta.resumo, status: falhou ? 'erro' : 'ok' })
            respostas.push({ functionResponse: { name: calls[idx].name, response: { resultado } } })
          })

          conversaAtual = [...conversaAtual, { role: 'model', parts }, { role: 'user', parts: respostas }]

          // Guarda de custo: numa tarefa longa, se UMA resposta já gastou demais,
          // pausa antes de mais uma rodada cara e devolve o controle ao Lucas.
          if (custoBRL(modelo, { tokensEntrada, tokensSaida, tokensCache }) >= TETO_CUSTO_RESPOSTA_BRL) {
            interrompido = 'custo'
            break
          }
        }
        if (i >= MAX_ITERACOES) interrompido = 'iteracoes'

        // Parou no meio de uma tarefa (estourou passos ou custo) sem fechar a
        // resposta: em vez de uma mensagem genérica, a própria Gator faz um
        // fechamento honesto — o que já fez, o que falta e oferece continuar.
        if (interrompido) {
          try {
            const modelFechamento = vertex.preview.getGenerativeModel({
              model:             modelo,
              systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
              generationConfig, // sem tools: esta chamada é só para escrever o fechamento
            })
            const instrucao = interrompido === 'custo'
              ? 'Esta tarefa já consumiu bastante processamento numa única resposta. NÃO chame mais ferramentas. Em português e em poucas linhas, diga o que você JÁ executou até aqui, o que ainda falta, e pergunte ao Lucas se quer que você continue de onde parou.'
              : 'Você atingiu o limite de passos para uma única resposta. NÃO chame mais ferramentas. Em português e em poucas linhas, diga o que você JÁ executou até aqui, o que ainda falta, e ofereça continuar de onde parou.'

            // A instrução tem que cair num turno 'user' que sucede um 'model'
            // (alternância válida) — anexa ao último turno do usuário, que aqui
            // são as respostas de ferramenta.
            const fechamento = [...conversaAtual]
            const ultimo = fechamento[fechamento.length - 1]
            const instrPart: Part = { text: `[${instrucao}]` }
            if (ultimo?.role === 'user') {
              fechamento[fechamento.length - 1] = { role: 'user', parts: [...(ultimo.parts ?? []), instrPart] }
            } else {
              fechamento.push({ role: 'user', parts: [instrPart] })
            }

            if (respostaFinal.trim()) fluxoTexto('\n\n')
            const closeStream = await modelFechamento.generateContentStream({ contents: fechamento })
            for await (const chunk of closeStream.stream) {
              const t = chunk.candidates?.[0]?.content?.parts?.filter((p) => p.text).map((p) => p.text).join('') ?? ''
              fluxoTexto(t)
            }
            const usoClose = extrairUso({ response: await closeStream.response } as GenerateContentResult)
            tokensEntrada += usoClose.tokensEntrada
            tokensSaida   += usoClose.tokensSaida
            tokensCache   += usoClose.tokensCache
            iteracoes++
          } catch (err) {
            console.error('[ia/agent] falha no fechamento de limite:', err)
          }
        }

        // Extrai os chips de próximo passo da zona de marcadores no fim do texto e
        // limpa o conteúdo (exibido e persistido). Tolerante ao que o Flash produz:
        // cada sugestão em [[...]] (formato atual) ou o legado [[PROXIMOS]] a || b.
        // Se o `[[` retido NÃO era zona de chips (texto de sobra = falso positivo),
        // libera o restante que o hold-back segurou — nada vaza.
        let sugestoes: string[] = []
        const idxMarcador = respostaFinal.indexOf('[[')
        if (idxMarcador !== -1) {
          const zona = respostaFinal.slice(idxMarcador).trim()
          let casou = false
          const legado = zona.match(/^\[\[\s*pr[oó]ximos?\s*\]\]\s*([\s\S]+)$/i)
          if (legado) {
            sugestoes = legado[1].split('||').map((s) => s.trim()).filter(Boolean).slice(0, 3)
            casou = true
          } else {
            const matches = [...zona.matchAll(/\[\[\s*([^[\]]+?)\s*\]\]/g)]
            const sobra   = zona.replace(/\[\[\s*[^[\]]+?\s*\]\]/g, '').replace(/[\s|]+/g, '')
            if (matches.length && sobra.length === 0) {
              sugestoes = matches.map((m) => m[1].trim())
                .filter((s) => s && !/^pr[oó]ximos?$/i.test(s)).slice(0, 3)
              casou = true
            }
          }
          if (casou) respostaFinal = respostaFinal.slice(0, idxMarcador).trimEnd()
        }
        if (!sugestoes.length && emitidoLen < respostaFinal.length) {
          envia({ t: 'texto', v: respostaFinal.slice(emitidoLen) })
          emitidoLen = respostaFinal.length
        }

        if (!respostaFinal.trim()) {
          respostaFinal = executadas.length
            ? 'Trabalhei na tarefa, mas atingi o limite desta resposta antes de fechar. Me peça pra continuar que eu retomo de onde parei.'
            : 'Não consegui processar sua mensagem. Tente reformular.'
          envia({ t: 'texto', v: respostaFinal })
        }

        const custoResposta = custoBRL(modelo, { tokensEntrada, tokensSaida, tokensCache })

        // Persiste a resposta + telemetria (igual antes; agora ao fim do stream).
        const { data: msgIa } = await supabase.from('ia_mensagens').insert({
          conversa_id: conversaId,
          user_id:     user.id,
          role:        'assistant',
          content:     respostaFinal,
          ferramentas: executadas.length ? executadas : null,
          custo_brl:   custoResposta,
        }).select('id, role, content, ferramentas, custo_brl, created_at').single()

        await supabase.from('ia_conversas').update({ updated_at: new Date().toISOString() }).eq('id', conversaId)

        await registrarUso(supabase, {
          userId: user.id, modelo, contexto: 'agente', conversaId,
          tokensEntrada, tokensSaida, tokensCache,
          duracaoMs: Date.now() - inicio, iteracoes, ferramentas: ferramentasUsadas,
        })

        envia({
          t: 'fim',
          conversa_id:     conversaId,
          contexto_tokens: contextoTokens,
          custo_resposta:  custoResposta,
          sugestoes,
          mensagem: msgIa ?? {
            id: crypto.randomUUID(), role: 'assistant', content: respostaFinal,
            ferramentas: executadas.length ? executadas : null, custo_brl: custoResposta,
            created_at: new Date().toISOString(),
          },
        })
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido'
        try { controller.enqueue(encoder.encode(JSON.stringify({ t: 'erro', v: msg }) + '\n')) } catch { /* já fechado */ }
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':      'application/x-ndjson; charset=utf-8',
      'Cache-Control':     'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
