// ─── STORE GLOBAL DO ASSISTENTE IA ───────────────────────────────────────────
// Estado único do agente compartilhado por toda a UI (painel flutuante,
// widget do dashboard): a conversa ativa segue o usuário entre páginas.
// Leitura de conversas/mensagens via Supabase browser (RLS owner-scoped);
// envio via /api/ia/agent (loop agêntico server-side).

import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export interface AnexoIA {
  tipo:        'imagem' | 'texto'
  nome:        string
  mimeType?:   string
  dataBase64?: string // imagens (sem o prefixo data:)
  conteudo?:   string // arquivos .md/.txt
}

export interface FerramentaExecutada {
  nome:    string
  resumo:  string
  status?: 'rodando' | 'ok' | 'erro' // só ao vivo (streaming); persistido fica sem
}

export interface MensagemIA {
  id:           string
  role:         'user' | 'assistant'
  content:      string
  anexos?:      AnexoIA[] | null
  ferramentas?: FerramentaExecutada[] | null
  custo_brl?:   number | null // custo estimado (R$) da resposta — só em mensagens do agente
  streaming?:   boolean       // true enquanto a resposta está chegando ao vivo
  fase?:        string        // fase atual enquanto streaming (ex.: 'pensando') — só ao vivo
  demorando?:   boolean       // streaming sem evento há muito tempo — possível travamento
  sugestoes?:   string[]      // próximos passos clicáveis (chips) — só ao vivo, não persiste
  modeloUsado?: 'flash' | 'pro' // cérebro que respondeu (modo Auto) — sinal de confiança
  escalouMotivo?: string      // por que subiu pro Pro (ex.: "pergunta de análise")
  created_at:   string
}

export interface ConversaIA {
  id:          string
  titulo:      string
  cliente_id:  string | null
  updated_at:  string
  custo_total?: number // soma de ia_uso por conversa (estimado, R$)
}

const MAX_LADO_IMAGEM = 1280
const ARQUIVOS_TEXTO  = ['.md', '.txt', '.csv', '.json']

// ── Helpers de anexo ──────────────────────────────────────────────────────────

/** Redimensiona imagens grandes via canvas para caber no limite da API. */
async function imagemParaBase64(file: File): Promise<{ dataBase64: string; mimeType: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Falha ao ler imagem'))
    reader.readAsDataURL(file)
  })

  // Pequena o suficiente — envia como está
  if (file.size < 1.5 * 1024 * 1024) {
    const [meta, base64] = dataUrl.split(',')
    const mime = meta.match(/data:(.*?);/)?.[1] ?? file.type ?? 'image/jpeg'
    return { dataBase64: base64, mimeType: mime }
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload  = () => resolve(el)
    el.onerror = () => reject(new Error('Imagem inválida'))
    el.src = dataUrl
  })

  const escala = Math.min(1, MAX_LADO_IMAGEM / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width  = Math.round(img.width * escala)
  canvas.height = Math.round(img.height * escala)
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  const comprimida = canvas.toDataURL('image/jpeg', 0.85)
  return { dataBase64: comprimida.split(',')[1], mimeType: 'image/jpeg' }
}

function ehArquivoTexto(file: File): boolean {
  const nome = file.name.toLowerCase()
  return ARQUIVOS_TEXTO.some((ext) => nome.endsWith(ext)) || file.type.startsWith('text/')
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface AssistantStore {
  conversas:           ConversaIA[]
  conversaId:          string | null
  mensagens:           MensagemIA[]
  carregando:          boolean
  enviando:            boolean
  anexos:              AnexoIA[]
  clienteContextoId:   string
  erro:                string | null
  contextoTokens:      number // promptTokenCount real da última resposta do agente
  custoConversa:       number // custo estimado (R$) acumulado da conversa ativa

  carregarConversas:  () => Promise<void>
  abrirConversa:      (id: string) => Promise<void>
  novaConversa:       () => void
  renomearConversa:   (id: string, titulo: string) => Promise<void>
  excluirConversa:    (id: string) => Promise<void>
  setClienteContexto: (id: string) => void
  adicionarArquivos:  (files: File[]) => Promise<void>
  removerAnexo:       (index: number) => void
  enviar:             (texto: string, pagina?: string) => Promise<void>
  cancelar:           () => void
  exportarMarkdown:   () => void
}

// Controle do stream ativo (1 por vez — o gate `enviando` garante): permite
// cancelar (AbortController) e detectar travamento (watchdog sem eventos).
let streamAbort: AbortController | null = null
let watchdog: ReturnType<typeof setTimeout> | null = null
const WATCHDOG_MS = 20_000 // sem nenhum evento por este tempo → avisa "demorando"

export const useAssistantStore = create<AssistantStore>((set, get) => ({
  conversas:         [],
  conversaId:        null,
  mensagens:         [],
  carregando:        false,
  enviando:          false,
  anexos:            [],
  clienteContextoId: '',
  erro:              null,
  contextoTokens:    0,
  custoConversa:     0,

  carregarConversas: async () => {
    const { data } = await supabase
      .from('ia_conversas')
      .select('id, titulo, cliente_id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(50)
    const conversas = (data ?? []) as ConversaIA[]

    // Custo estimado por conversa: soma de ia_uso (RLS owner-scoped cobre o
    // filtro — as linhas do agente têm user_id). Agregado no client por volume baixo.
    const ids = conversas.map((c) => c.id)
    if (ids.length) {
      const { data: usos } = await supabase
        .from('ia_uso')
        .select('conversa_id, custo_brl')
        .in('conversa_id', ids)
      const porConversa = new Map<string, number>()
      for (const u of usos ?? []) {
        const cid = (u as { conversa_id: string }).conversa_id
        porConversa.set(cid, (porConversa.get(cid) ?? 0) + Number((u as { custo_brl: number }).custo_brl ?? 0))
      }
      for (const c of conversas) c.custo_total = porConversa.get(c.id) ?? 0
    }

    set({ conversas })
  },

  abrirConversa: async (id) => {
    const custoConhecido = get().conversas.find((c) => c.id === id)?.custo_total ?? 0
    set({ conversaId: id, mensagens: [], carregando: true, erro: null, contextoTokens: 0, custoConversa: custoConhecido })
    const { data } = await supabase
      .from('ia_mensagens')
      .select('id, role, content, anexos, ferramentas, custo_brl, created_at')
      .eq('conversa_id', id)
      .order('created_at', { ascending: true })
      .limit(200)
    // Ignora se o usuário trocou de conversa enquanto carregava
    if (get().conversaId !== id) return
    const conversa = get().conversas.find((c) => c.id === id)
    set({
      mensagens:         (data ?? []) as MensagemIA[],
      carregando:        false,
      clienteContextoId: conversa?.cliente_id ?? '',
    })
  },

  novaConversa: () => {
    set({ conversaId: null, mensagens: [], anexos: [], erro: null, contextoTokens: 0, custoConversa: 0 })
  },

  renomearConversa: async (id, titulo) => {
    await supabase.from('ia_conversas').update({ titulo }).eq('id', id)
    set({ conversas: get().conversas.map((c) => (c.id === id ? { ...c, titulo } : c)) })
  },

  excluirConversa: async (id) => {
    await supabase.from('ia_conversas').delete().eq('id', id)
    const restantes = get().conversas.filter((c) => c.id !== id)
    set({ conversas: restantes })
    if (get().conversaId === id) get().novaConversa()
  },

  setClienteContexto: (id) => set({ clienteContextoId: id }),

  adicionarArquivos: async (files) => {
    const novos: AnexoIA[] = []
    for (const file of files) {
      try {
        if (file.type.startsWith('image/')) {
          const { dataBase64, mimeType } = await imagemParaBase64(file)
          novos.push({ tipo: 'imagem', nome: file.name || 'imagem.jpg', mimeType, dataBase64 })
        } else if (ehArquivoTexto(file)) {
          const conteudo = await file.text()
          novos.push({ tipo: 'texto', nome: file.name, conteudo })
        } else {
          set({ erro: `Formato não suportado: ${file.name}. Envie imagens ou .md/.txt/.csv/.json.` })
        }
      } catch {
        set({ erro: `Falha ao processar ${file.name}` })
      }
    }
    if (novos.length) set({ anexos: [...get().anexos, ...novos] })
  },

  removerAnexo: (index) => {
    set({ anexos: get().anexos.filter((_, i) => i !== index) })
  },

  enviar: async (texto, pagina) => {
    const { enviando, anexos, conversaId, clienteContextoId } = get()
    const mensagem = texto.trim()
    if (enviando || (!mensagem && !anexos.length)) return

    const otimista: MensagemIA = {
      id:         `local-${Date.now()}`,
      role:       'user',
      content:    mensagem,
      anexos:     anexos.length ? anexos : null,
      created_at: new Date().toISOString(),
    }
    // Placeholder da resposta que vai sendo preenchido ao vivo pelo stream.
    const assistId = `stream-${Date.now()}`
    const placeholder: MensagemIA = {
      id: assistId, role: 'assistant', content: '', streaming: true, created_at: new Date().toISOString(),
    }
    set({ mensagens: [...get().mensagens, otimista, placeholder], anexos: [], enviando: true, erro: null })

    // Atualiza só a mensagem em streaming, preservando o resto.
    const patch = (fn: (m: MensagemIA) => MensagemIA) =>
      set({ mensagens: get().mensagens.map((m) => (m.id === assistId ? fn(m) : m)) })

    // Cancelamento (botão Parar) + watchdog de travamento (ver topo do arquivo).
    const controller = new AbortController()
    streamAbort = controller
    const pararWatchdog = () => { if (watchdog) { clearTimeout(watchdog); watchdog = null } }
    const armarWatchdog = () => {
      pararWatchdog()
      // Limpa o aviso "demorando" só se estava ligado (evita re-render à toa no streaming).
      if (get().mensagens.find((m) => m.id === assistId)?.demorando) {
        patch((m) => ({ ...m, demorando: false }))
      }
      watchdog = setTimeout(() => patch((m) => ({ ...m, demorando: true })), WATCHDOG_MS)
    }

    try {
      armarWatchdog()
      const res = await fetch('/api/ia/agent', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        signal:  controller.signal,
        body: JSON.stringify({
          conversa_id:         conversaId ?? undefined,
          mensagem,
          anexos:              otimista.anexos ?? undefined,
          pagina,
          cliente_contexto_id: clienteContextoId || undefined,
        }),
      })

      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(j.error ?? `Erro HTTP ${res.status}`)
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let recebeuFim = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const linhas = buffer.split('\n')
        buffer = linhas.pop() ?? '' // guarda a linha parcial pro próximo chunk

        for (const linha of linhas) {
          if (!linha.trim()) continue
          let ev: Record<string, unknown>
          try { ev = JSON.parse(linha) } catch { continue }
          armarWatchdog() // chegou evento → reinicia a contagem de travamento

          if (ev.t === 'texto') {
            const delta = String(ev.v ?? '')
            patch((m) => ({ ...m, content: m.content + delta, fase: undefined }))
          } else if (ev.t === 'fase') {
            // Fase atual da Gator (ex.: 'pensando') — mostra "o que está acontecendo".
            const fase = String(ev.v ?? '')
            patch((m) => ({ ...m, fase }))
          } else if (ev.t === 'acao') {
            const nome = String(ev.nome ?? '')
            const status = ev.status as FerramentaExecutada['status']
            if (status === 'rodando') {
              patch((m) => ({ ...m, fase: undefined, ferramentas: [...(m.ferramentas ?? []), { nome, resumo: '', status: 'rodando' }] }))
            } else {
              // Finaliza a 1ª ferramenta 'rodando' com esse nome.
              patch((m) => {
                const fs = [...(m.ferramentas ?? [])]
                const i = fs.findIndex((f) => f.nome === nome && f.status === 'rodando')
                if (i >= 0) fs[i] = { nome, resumo: String(ev.resumo ?? ''), status }
                return { ...m, ferramentas: fs }
              })
            }
          } else if (ev.t === 'escalou') {
            // Modo Auto subiu pro Pro — sinal de confiança visível na hora.
            const motivo = String(ev.motivo ?? '')
            patch((m) => ({ ...m, modeloUsado: 'pro', escalouMotivo: motivo || m.escalouMotivo }))
          } else if (ev.t === 'fim') {
            pararWatchdog()
            streamAbort = null
            recebeuFim = true
            const finalMsg = ev.mensagem as MensagemIA | undefined
            const custoResp = Number(ev.custo_resposta ?? 0)
            const sugestoes = Array.isArray(ev.sugestoes) ? (ev.sugestoes as string[]) : []
            const modeloUsado = ev.modelo_usado === 'pro' ? 'pro' : ev.modelo_usado === 'flash' ? 'flash' : undefined
            const escalouMotivo = typeof ev.escalou_motivo === 'string' ? ev.escalou_motivo : undefined
            set({
              conversaId:     (ev.conversa_id as string) ?? get().conversaId,
              mensagens:      get().mensagens.map((m) => (m.id === assistId
                ? { ...(finalMsg ?? m), sugestoes, modeloUsado: modeloUsado ?? m.modeloUsado, escalouMotivo: escalouMotivo ?? m.escalouMotivo, streaming: false, fase: undefined, demorando: false }
                : m)),
              enviando:       false,
              contextoTokens: (ev.contexto_tokens as number) ?? get().contextoTokens,
              custoConversa:  get().custoConversa + custoResp,
            })
            void get().carregarConversas()
          } else if (ev.t === 'erro') {
            throw new Error(String(ev.v ?? 'Erro no agente'))
          }
        }
      }

      // Stream terminou sem 'fim' (ex.: queda de conexão) — finaliza o que veio.
      if (!recebeuFim) {
        pararWatchdog()
        streamAbort = null
        patch((m) => ({ ...m, streaming: false, fase: undefined, demorando: false, content: m.content || '⚠️ Conexão interrompida antes de concluir a resposta.' }))
        set({ enviando: false })
      }
    } catch (err) {
      pararWatchdog()
      streamAbort = null
      // Cancelamento pelo usuário (botão Parar) — não é erro.
      if ((err as { name?: string } | null)?.name === 'AbortError') {
        patch((m) => ({
          ...m, streaming: false, fase: undefined, demorando: false,
          content: m.content ? `${m.content}\n\n*(interrompido por você)*` : '*(interrompido por você)*',
        }))
        set({ enviando: false })
        return
      }
      const msg = err instanceof Error ? err.message : 'Sem conexão com o agente'
      patch((m) => ({ ...m, streaming: false, fase: undefined, demorando: false, content: m.content || `⚠️ ${msg}` }))
      set({ enviando: false, erro: msg })
    }
  },

  cancelar: () => {
    streamAbort?.abort()
  },

  exportarMarkdown: () => {
    const { mensagens, conversas, conversaId } = get()
    if (!mensagens.length) return
    const titulo = conversas.find((c) => c.id === conversaId)?.titulo ?? 'Conversa'
    const linhas = [
      `# ${titulo}`,
      `> Exportado do Adsgator Hub em ${new Date().toLocaleString('pt-BR')}`,
      '',
      ...mensagens.flatMap((m) => {
        const autor = m.role === 'user' ? '**Lucas**' : '**IA Adsgator**'
        const anexos = (m.anexos ?? []).map((a) => `_[anexo: ${a.nome}]_`).join(' ')
        const acoes  = (m.ferramentas ?? []).map((f) => `_⚙ ${f.resumo}_`).join(' · ')
        return [`### ${autor} — ${new Date(m.created_at).toLocaleString('pt-BR')}`, anexos, m.content, acoes, ''].filter(Boolean)
      }),
    ]
    const blob = new Blob([linhas.join('\n')], { type: 'text/markdown;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${titulo.replace(/[^\w\sÀ-ú-]/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'conversa'}.md`
    a.click()
    URL.revokeObjectURL(url)
  },
}))
