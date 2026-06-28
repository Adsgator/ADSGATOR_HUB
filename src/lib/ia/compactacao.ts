// ─── COMPACTAÇÃO DE CONVERSA LONGA (Fase 3b) ─────────────────────────────────
// Antes o agente carregava só as N mensagens mais recentes da conversa e
// DESCARTAVA o início — em conversa longa a Gator esquecia o começo. Aqui o
// trecho que sai da janela recente é RESUMIDO (1 chamada barata ao Flash) em
// vez de cortado. O resumo é cumulativo e mora em ia_conversas.resumo_contexto;
// resumido_ate marca a última mensagem coberta.
//
// INVARIANTE: o resumo cobre tudo com created_at <= resumido_ate; a janela
// verbatim é tudo com created_at > resumido_ate. Somados, resumo + janela =
// a conversa inteira, sem buraco e sem duplicata.

import type { SupabaseClient } from '@supabase/supabase-js'
import { MODELO_FLASH, criarGenAI } from '@/lib/vertex-ai'
import { extrairUso, registrarUso } from '@/lib/ia/uso'

export interface AnexoIA {
  tipo:        'imagem' | 'texto'
  nome:        string
  mimeType?:   string
  dataBase64?: string // imagens
  conteudo?:   string // arquivos .md/.txt
}

export interface MensagemDb {
  id:         string
  role:       'user' | 'assistant'
  content:    string
  anexos:     AnexoIA[] | null
  created_at: string
}

// Para o resumo precisamos também das ações que a Gator executou em cada turno,
// para o resumo registrar o que JÁ foi feito (e ela não repetir).
interface MensagemResumo extends MensagemDb {
  ferramentas: { nome: string; resumo: string }[] | null
}

const JANELA_VERBATIM   = 30   // últimas N mensagens sempre enviadas na íntegra
const GATILHO_RESUMO    = 44   // acima disto, absorve o excedente mais antigo no resumo
const MAX_RESUMO_TOKENS = 1024

const SELECT_MSG        = 'id, role, content, anexos, created_at'
const SELECT_MSG_RESUMO = 'id, role, content, anexos, ferramentas, created_at'

export interface HistoricoCompactado {
  mensagens: MensagemDb[]  // janela verbatim (ascendente) — vira os contents do modelo
  resumo:    string | null // resumo das msgs antigas, p/ injetar no system prompt
}

/**
 * Devolve a janela de mensagens recentes (na íntegra) + o resumo do trecho
 * antigo. Caminho comum: 1 query. Quando a conversa cresce além do gatilho,
 * resume o excedente mais antigo (Flash, medido em ia_uso) e persiste — esse
 * caminho mais caro só ocorre a cada ~14 mensagens novas.
 */
export async function montarHistoricoCompactado(
  db: SupabaseClient,
  conversaId: string,
  userId: string,
): Promise<HistoricoCompactado> {
  // 1. Resumo atual da conversa.
  const { data: conversa } = await db
    .from('ia_conversas')
    .select('resumo_contexto, resumido_ate')
    .eq('id', conversaId)
    .maybeSingle()
  const resumo      = (conversa?.resumo_contexto as string | null) ?? null
  const resumidoAte = (conversa?.resumido_ate    as string | null) ?? null

  // 2. Janela não-resumida, da mais nova p/ a mais velha, com teto para detectar
  //    overflow (se vier GATILHO_RESUMO+1, há mais antigas que o teto → resumir).
  let q = db
    .from('ia_mensagens')
    .select(SELECT_MSG)
    .eq('conversa_id', conversaId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(GATILHO_RESUMO + 1)
  if (resumidoAte) q = q.gt('created_at', resumidoAte)
  const { data: recentesDesc } = await q
  const recentes = ((recentesDesc ?? []) as MensagemDb[]).reverse() // ascendente

  // 3. Cabe na janela? Caminho comum — encerra aqui.
  if (recentes.length <= GATILHO_RESUMO) {
    return { mensagens: recentes, resumo }
  }

  // 4. Overflow: precisa resumir. Carrega TODAS as não-resumidas e absorve o
  //    excedente mais antigo, deixando JANELA_VERBATIM na íntegra.
  try {
    let qFull = db
      .from('ia_mensagens')
      .select(SELECT_MSG_RESUMO)
      .eq('conversa_id', conversaId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (resumidoAte) qFull = qFull.gt('created_at', resumidoAte)
    const { data: todasData } = await qFull
    const todas = (todasData ?? []) as MensagemResumo[]

    if (todas.length <= JANELA_VERBATIM) {
      // Corrida improvável (mensagens sumiram entre as duas queries) — usa o que veio.
      return { mensagens: todas as MensagemDb[], resumo }
    }

    const aAbsorver = todas.slice(0, todas.length - JANELA_VERBATIM)
    const janela    = todas.slice(todas.length - JANELA_VERBATIM)

    const novoResumo      = await gerarResumo(db, resumo, aAbsorver, userId, conversaId)
    const novoResumidoAte = aAbsorver[aAbsorver.length - 1].created_at

    await db.from('ia_conversas')
      .update({ resumo_contexto: novoResumo, resumido_ate: novoResumidoAte })
      .eq('id', conversaId)

    return { mensagens: janela as MensagemDb[], resumo: novoResumo }
  } catch (err) {
    // Degradação segura: NÃO avança resumido_ate, NÃO corrompe nada. Cai no
    // comportamento de antes (manda as mais recentes na íntegra) e tenta no
    // próximo turno. Nunca pior que o truncamento original.
    console.error('[ia/compactacao] falha ao resumir (mantém comportamento de truncar):', err)
    return { mensagens: recentes.slice(-JANELA_VERBATIM), resumo }
  }
}

/** Resume o trecho antigo num bloco cumulativo. Flash, baixo custo, medido. */
async function gerarResumo(
  db: SupabaseClient,
  resumoAnterior: string | null,
  mensagens: MensagemResumo[],
  userId: string,
  conversaId: string,
): Promise<string> {
  const transcricao = mensagens.map((m) => {
    const autor  = m.role === 'user' ? 'Lucas' : 'Gator'
    const anexos = (m.anexos ?? []).map((a) => `[anexo: ${a.nome}]`).join(' ')
    const acoes  = (m.ferramentas ?? []).map((f) => f.resumo).filter(Boolean).join('; ')
    let linha = `${autor}: ${[m.content, anexos].filter(Boolean).join(' ') || '(sem texto)'}`
    if (acoes) linha += `\n  [ações: ${acoes}]`
    return linha
  }).join('\n')

  const prompt = `Você condensa o histórico de uma conversa entre o Lucas (operador único da agência de tráfego Adsgator) e a Gator (a IA que opera o sistema). O objetivo é preservar o CONTEXTO para a Gator continuar a conversa sem precisar reler tudo.
${resumoAnterior ? `\nRESUMO ATÉ AGORA:\n${resumoAnterior}\n` : ''}
NOVAS MENSAGENS A INCORPORAR:
${transcricao}

Produza um ÚNICO resumo atualizado em português, que SUBSTITUI o anterior, preservando:
- decisões tomadas e combinados;
- fatos sobre clientes, valores (R$), prazos e números citados;
- ações que a Gator já executou (para ela não repetir);
- preferências e instruções do Lucas;
- assuntos em aberto / próximos passos pendentes.
Seja conciso (bullets curtos), factual e NÃO invente nada que não esteja nas mensagens. Sem saudação nem preâmbulo — devolva só o resumo.`

  const ai     = criarGenAI()
  const inicio = Date.now()
  const result = await ai.models.generateContent({
    model:    MODELO_FLASH,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      maxOutputTokens: MAX_RESUMO_TOKENS,
      temperature:     0.3,
      thinkingConfig:  { thinkingBudget: 0 }, // resumo não precisa raciocinar — mais barato
    },
  })
  await registrarUso(db, {
    userId, modelo: MODELO_FLASH, contexto: 'resumo', conversaId,
    duracaoMs: Date.now() - inicio, ...extrairUso(result),
  })

  const texto = (result.text ?? '').trim()
  if (!texto) throw new Error('resumo vazio')
  return texto
}
