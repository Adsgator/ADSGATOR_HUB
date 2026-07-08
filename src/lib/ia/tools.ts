// ─── TOOLBOX DO AGENTE IA ─────────────────────────────────────────────────────
// Ferramentas (function calling Gemini) que dão ao agente acesso real ao Hub:
// ler e escrever clientes, tarefas, financeiro, marketing, prospecção, alertas,
// analytics, memória e status do sistema. Executadas server-side com service
// role — por isso TODA query filtra/verifica por user_id.

import type { SupabaseClient } from '@supabase/supabase-js'
import { Type as T, type FunctionDeclaration } from '@google/genai'
import { estagioInadimplencia, carregarLimiaresAtraso } from '@/lib/cobranca'
import { calcularMRR, STATUS_ASSINATURA_ATIVA } from '@/lib/mrr'
import { ehSnapshotSemanal } from '@/lib/analytics-snapshots'
import { SYSTEM_MAP } from '@/lib/ia/system-map'
import { computarSetupChecklist } from '@/lib/setup-checklist'
import { enviarEmailManual } from '@/lib/email-automation'

export interface ToolCtx {
  db:     SupabaseClient
  userId: string
  /** Para ferramentas que consultam rotas internas (ex.: /api/status) */
  origin: string
  cookie: string
  /** Idempotência por turno: tool de escrita + mesmos args memoiza a promise e
   *  não re-executa na mesma resposta (mata duplicação por re-execução do loop). */
  dedupe?: Map<string, Promise<unknown>>
  /** Gate de confirmação: chaves de ações irreversíveis que pediram confirmação
   *  neste turno — impede a IA de confirmar a si mesma no mesmo turno. */
  confirmacoesPedidas?: Set<string>
}

type Args = Record<string, unknown>

export interface ToolExecutada {
  nome:   string
  resumo: string
}

interface Tool {
  declaration: FunctionDeclaration
  execute:     (args: Args, ctx: ToolCtx) => Promise<unknown>
  /** Rótulo curto exibido como chip na mensagem (ex.: 'Tarefa criada: "Ligar p/ João"') */
  resumo:      (args: Args) => string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

function num(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined
}

/** Boolean tolerante: aceita boolean real ou as strings "true"/"false" do modelo. */
function bool(v: unknown): boolean | undefined {
  if (typeof v === 'boolean') return v
  if (v === 'true')  return true
  if (v === 'false') return false
  return undefined
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Resolve um cliente por ID **ou NOME** e garante que pertence ao usuário; retorna
 *  o registro (sempre com id canônico). Aceita nome de propósito: o modelo às vezes
 *  inventa/decora UUID errado — passar o nome é confiável e não causa dano. */
async function ownCliente(ctx: ToolCtx, idOuNome: string | undefined, campos = 'id, nome') {
  const v = str(idOuNome)
  if (!v) throw new Error('Informe o cliente (nome ou ID).')
  const cols = campos.split(',').map((c) => c.trim())
  const sel  = cols.includes('id') ? campos : ['id', ...cols].join(', ')

  if (UUID_RE.test(v)) {
    const { data, error } = await ctx.db.from('clientes').select(sel)
      .eq('id', v).eq('user_id', ctx.userId).maybeSingle()
    if (error) throw new Error(error.message)
    if (data) return data as unknown as Record<string, unknown>
    throw new Error(`Nenhum cliente com o ID ${v}. Passe o NOME do cliente em vez do ID.`)
  }

  const { data, error } = await ctx.db.from('clientes').select(sel)
    .eq('user_id', ctx.userId).ilike('nome', `%${v}%`).limit(6)
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error(`Cliente "${v}" não encontrado.`)
  if (data.length > 1) {
    const lista = (data as unknown as Array<{ id: string; nome?: string }>).map((c) => `${c.nome ?? '?'} [${c.id}]`).join('; ')
    throw new Error(`Mais de um cliente combina com "${v}": ${lista}. Diga qual usando o nome exato.`)
  }
  return data[0] as unknown as Record<string, unknown>
}

/** Resolve uma entidade por ID **ou** por um campo de texto (título/nome/conteúdo),
 *  garantindo unicidade — o mesmo padrão de ownCliente, generalizado. O modelo às
 *  vezes inventa/decora IDs; passar o nome é confiável e não acerta a linha errada.
 *  idTexto=true para tabelas cujo id NÃO é UUID (ex.: email_templates com slug). */
async function resolverEntidade(
  ctx: ToolCtx,
  tabela: string,
  idOuNome: string | undefined,
  campoTexto: string,
  opts: { scopeUser?: boolean; idTexto?: boolean; campos?: string } = {},
): Promise<Record<string, unknown>> {
  const v = str(idOuNome)
  if (!v) throw new Error(`Informe o ${campoTexto} ou o ID.`)
  const sel   = opts.campos ?? `id, ${campoTexto}`
  const build = () => {
    const base = ctx.db.from(tabela).select(sel)
    return opts.scopeUser ? base.eq('user_id', ctx.userId) : base
  }

  // Por ID: UUID (com gate, p/ não quebrar coluna uuid) ou id-texto (tenta exato).
  if (opts.idTexto || UUID_RE.test(v)) {
    const { data, error } = await build().eq('id', v).maybeSingle()
    if (error) throw new Error(error.message)
    if (data) return data as unknown as Record<string, unknown>
    if (!opts.idTexto) throw new Error(`Nenhum registro com o ID ${v}. Passe o ${campoTexto} em vez do ID.`)
    // idTexto que não casou por id → cai para a busca textual abaixo.
  }

  const { data, error } = await build().ilike(campoTexto, `%${v}%`).limit(6)
  if (error) throw new Error(error.message)
  const rows = (data ?? []) as unknown as Array<Record<string, unknown>>
  if (rows.length === 0) throw new Error(`Nada encontrado para "${v}" (${campoTexto}).`)
  if (rows.length > 1) {
    const lista = rows.map((r) => `${String(r[campoTexto] ?? '?').slice(0, 80)} [${r.id}]`).join('; ')
    throw new Error(`Mais de um combina com "${v}": ${lista}. Especifique qual.`)
  }
  return rows[0]
}

function mesRange(mes?: string): { inicio: string; fim: string; label: string } {
  const base  = mes && /^\d{4}-\d{2}$/.test(mes) ? new Date(`${mes}-01T12:00:00`) : new Date()
  const ano   = base.getFullYear()
  const m     = base.getMonth()
  const pad   = (n: number) => String(n).padStart(2, '0')
  const fimD  = new Date(ano, m + 1, 0).getDate()
  return {
    inicio: `${ano}-${pad(m + 1)}-01`,
    fim:    `${ano}-${pad(m + 1)}-${pad(fimD)}`,
    label:  `${pad(m + 1)}/${ano}`,
  }
}

// ── Compactação de resultados (Fase 5) ─────────────────────────────────────────
// Ferramentas de lista grande devolvem forma ENXUTA (só o essencial) + o total
// real, em vez de despejar o payload cru no contexto do modelo. Os resultados de
// tool só vivem no contexto durante o loop (não são persistidos), então isto é
// ganho direto de tokens/custo. Precedente: ads_ao_vivo (top-N por dimensão).
const MAX_LISTA = 50

/** Mantém só os campos pedidos de cada linha (descarta uuids e colunas pesadas). */
function enxugar<R extends Record<string, unknown>>(rows: R[], campos: (keyof R)[]): Partial<R>[] {
  return rows.map((r) => {
    const o: Partial<R> = {}
    for (const c of campos) { const v = r[c]; if (v !== null && v !== undefined) o[c] = v }
    return o
  })
}

/** Nota de truncamento quando a lista real é maior que o teto exibido. */
function notaTruncada(total: number, max = MAX_LISTA): string | undefined {
  return total > max ? `Mostrando ${max} de ${total} — refine com filtro/busca ou peça o detalhe de um item.` : undefined
}

// ── Registro de ferramentas ───────────────────────────────────────────────────

export const TOOLS: Record<string, Tool> = {

  // ════ CLIENTES ════════════════════════════════════════════════════════════

  listar_clientes: {
    declaration: {
      name: 'listar_clientes',
      description: 'Lista os clientes da agência com dados resumidos (status, MRR, atraso, saldo Google). Use filtros para refinar.',
      parameters: {
        type: T.OBJECT,
        properties: {
          status: { type: T.STRING, description: 'Filtrar por status: recebido, onboarding, setup_trafego, ativo, congelado, inativo (saída — use sempre inativo para cliente que saiu; o motivo vai em outro campo)' },
          busca:  { type: T.STRING, description: 'Busca por nome ou nicho (parcial)' },
        },
      },
    },
    execute: async (args, ctx) => {
      let q = ctx.db
        .from('clientes')
        .select('id, nome, nicho, status, mrr, plano, dias_atraso, saldo_google, email, whatsapp, data_vencimento')
        .eq('user_id', ctx.userId)
        .order('mrr', { ascending: false })
        .limit(100)
      const status = str(args.status)
      const busca  = str(args.busca)
      if (status) q = q.eq('status', status)
      if (busca)  q = q.or(`nome.ilike.%${busca}%,nicho.ilike.%${busca}%`)
      const { data, error } = await q
      if (error) throw new Error(error.message)
      const nota = notaTruncada(data.length)
      return {
        total: data.length,
        clientes: enxugar(data.slice(0, MAX_LISTA),
          ['nome', 'nicho', 'status', 'mrr', 'dias_atraso', 'saldo_google', 'data_vencimento']),
        ...(nota ? { nota } : {}),
      }
    },
    resumo: () => 'Consultou clientes',
  },

  detalhar_cliente: {
    declaration: {
      name: 'detalhar_cliente',
      description: 'Dossiê completo de um cliente: cadastro, assinaturas, estágios/checklist, memória, tarefas abertas, últimos lançamentos financeiros e último snapshot de analytics.',
      parameters: {
        type: T.OBJECT,
        properties: {
          cliente_id: { type: T.STRING, description: 'Nome OU id do cliente — prefira o NOME (ex.: "Beatriz Mattos"); o sistema resolve. Não invente IDs.' },
        },
        required: ['cliente_id'],
      },
    },
    execute: async (args, ctx) => {
      const id = str(args.cliente_id)
      if (!id) throw new Error('cliente_id é obrigatório.')
      const cliente = await ownCliente(ctx, id,
        'id, nome, email, whatsapp, nicho, website, status, mrr, plano, dias_atraso, data_vencimento, saldo_google, google_ads_enabled, ga4_enabled, congelado_em, data_criacao, grupo_id')
      const [assinaturas, estagios, memoria, tarefas, lancamentos, snapshots] = await Promise.all([
        ctx.db.from('assinaturas').select('plano_nome, valor_mensal, status, data_proxima_cobranca, dias_atraso').eq('cliente_id', id),
        ctx.db.from('estagios').select('nome, ativo, concluido_em, checklist').eq('cliente_id', id),
        ctx.db.from('memoria_clientes').select('conteudo_md, updated_at').eq('cliente_id', id).maybeSingle(),
        ctx.db.from('tarefas').select('id, titulo, prioridade, status, data_prazo').eq('cliente_id', id).in('status', ['pendente', 'em_progresso']),
        ctx.db.from('financeiro_lancamentos').select('tipo, descricao, valor, data, status').eq('cliente_id', id).order('data', { ascending: false }).limit(10),
        ctx.db.from('analytics_snapshots').select('fonte, periodo_inicio, periodo_fim, investimento, cliques, conversoes, cpa, sessoes').eq('cliente_id', id).order('periodo_fim', { ascending: false }).limit(4),
      ])
      // Grupo multi-CNPJ: inclui nome do grupo e os outros registros (a visão
      // consolidada é a soma dos membros — use agregar_grupo nas tools de analytics).
      let grupo: Record<string, unknown> | null = null
      if (cliente.grupo_id) {
        const [{ data: g }, { data: membros }] = await Promise.all([
          ctx.db.from('cliente_grupos').select('nome').eq('id', cliente.grupo_id).maybeSingle(),
          ctx.db.from('clientes').select('id, nome, status, mrr').eq('grupo_id', cliente.grupo_id),
        ])
        if (g) grupo = { nome: g.nome, membros: membros ?? [] }
      }

      return {
        cliente,
        grupo,
        inadimplencia: estagioInadimplencia((cliente.dias_atraso as number) ?? 0),
        assinaturas: assinaturas.data ?? [],
        estagios: estagios.data ?? [],
        memoria_md: memoria.data?.conteudo_md ?? null,
        tarefas_abertas: tarefas.data ?? [],
        ultimos_lancamentos: lancamentos.data ?? [],
        analytics_recentes: snapshots.data ?? [],
      }
    },
    resumo: () => 'Consultou dossiê do cliente',
  },

  criar_cliente: {
    declaration: {
      name: 'criar_cliente',
      description: 'Cadastra um novo cliente na agência.',
      parameters: {
        type: T.OBJECT,
        properties: {
          nome:     { type: T.STRING },
          email:    { type: T.STRING },
          whatsapp: { type: T.STRING },
          nicho:    { type: T.STRING },
          mrr:      { type: T.NUMBER, description: 'Mensalidade em R$' },
          plano:    { type: T.STRING },
          status:   { type: T.STRING, description: 'Default: recebido' },
        },
        required: ['nome'],
      },
    },
    execute: async (args, ctx) => {
      const { data, error } = await ctx.db.from('clientes').insert({
        user_id:  ctx.userId,
        nome:     str(args.nome),
        email:    str(args.email),
        whatsapp: str(args.whatsapp),
        nicho:    str(args.nicho),
        mrr:      num(args.mrr),
        plano:    str(args.plano),
        status:   str(args.status) ?? 'recebido',
      }).select('id, nome, status').single()
      if (error) throw new Error(error.message)
      return data
    },
    resumo: (args) => `Cliente criado: "${str(args.nome)}"`,
  },

  atualizar_cliente: {
    declaration: {
      name: 'atualizar_cliente',
      description: 'Atualiza campos do cadastro de um cliente (status, MRR, contato, saldo Google, integrações Google Ads/GA4 etc.). Só envie os campos que mudam. Para CONECTAR analytics, preencha google_ads_customer_id (ID da conta Google Ads) e/ou ga4_property_id e ligue os flags correspondentes — NÃO existe OAuth/login no Hub; a conexão é por ID + credenciais globais da agência.',
      parameters: {
        type: T.OBJECT,
        properties: {
          cliente_id:   { type: T.STRING },
          nome:         { type: T.STRING },
          status:       { type: T.STRING, description: 'recebido, onboarding, setup_trafego, ativo, congelado, inativo (saída — use sempre inativo para cliente que saiu; o motivo vai em outro campo)' },
          mrr:          { type: T.NUMBER },
          nicho:        { type: T.STRING },
          email:        { type: T.STRING },
          whatsapp:     { type: T.STRING },
          saldo_google: { type: T.NUMBER },
          plano:        { type: T.STRING },
          website:      { type: T.STRING },
          google_ads_customer_id: { type: T.STRING,  description: 'ID da conta Google Ads do cliente (ex.: 159-984-5807; o sistema guarda só os dígitos)' },
          ga4_property_id:        { type: T.STRING,  description: 'ID da propriedade GA4 do cliente' },
          google_ads_enabled:     { type: T.BOOLEAN, description: 'Ligar/desligar a integração Google Ads (ligue ao conectar o customer_id)' },
          ga4_enabled:            { type: T.BOOLEAN, description: 'Ligar/desligar a integração GA4 (ligue ao conectar o property_id)' },
        },
        required: ['cliente_id'],
      },
    },
    execute: async (args, ctx) => {
      const id = str(args.cliente_id)
      if (!id) throw new Error('cliente_id é obrigatório.')
      const atual = await ownCliente(ctx, id)
      const campos: Record<string, unknown> = {}
      for (const k of ['nome', 'status', 'nicho', 'email', 'whatsapp', 'plano', 'website', 'ga4_property_id'] as const) {
        if (str(args[k]) !== undefined) campos[k] = str(args[k])
      }
      for (const k of ['mrr', 'saldo_google'] as const) {
        if (num(args[k]) !== undefined) campos[k] = num(args[k])
      }
      for (const k of ['google_ads_enabled', 'ga4_enabled'] as const) {
        if (bool(args[k]) !== undefined) campos[k] = bool(args[k])
      }
      // Google Ads customer_id: a API usa só os 10 dígitos (sem hífens).
      const adsId = str(args.google_ads_customer_id)
      if (adsId !== undefined) campos.google_ads_customer_id = adsId.replace(/\D/g, '')

      if (!Object.keys(campos).length) throw new Error('Nenhum campo para atualizar.')
      const { error } = await ctx.db.from('clientes').update(campos).eq('id', id).eq('user_id', ctx.userId)
      if (error) throw new Error(error.message)
      // Audit log best-effort — não derruba a ação se a tabela divergir
      try {
        await ctx.db.from('historico_acoes').insert({
          cliente_id: id,
          tipo_acao:  'ia_agente',
          descricao:  `IA atualizou: ${Object.keys(campos).join(', ')}`,
          usuario_id: ctx.userId,
          metadata:   campos,
        })
      } catch { /* opcional */ }
      // Se conectou/ligou integração, seja honesta sobre o que falta p/ aparecer dado.
      const mexeuIntegracao = ['google_ads_customer_id', 'ga4_property_id', 'google_ads_enabled', 'ga4_enabled'].some((k) => k in campos)
      const dica = mexeuIntegracao
        ? 'Integração ajustada no cadastro. O dado NÃO aparece na hora: é preciso rodar o sync (botão "Sincronizar" em /analytics ou o cron) e as credenciais Google da agência precisam estar configuradas nas env vars — hoje isso é uma lacuna conhecida, então pode não vir dado real ainda.'
        : undefined
      return { ok: true, cliente: atual.nome, campos_atualizados: campos, ...(dica ? { dica } : {}) }
    },
    resumo: () => 'Cliente atualizado',
  },

  // ════ TAREFAS ═════════════════════════════════════════════════════════════

  listar_tarefas: {
    declaration: {
      name: 'listar_tarefas',
      description: 'Lista tarefas. Sem filtros retorna as abertas (pendente + em_progresso).',
      parameters: {
        type: T.OBJECT,
        properties: {
          status:     { type: T.STRING, description: 'pendente, em_progresso, feito, adiado' },
          cliente_id: { type: T.STRING },
        },
      },
    },
    execute: async (args, ctx) => {
      let q = ctx.db
        .from('tarefas')
        .select('id, titulo, descricao, prioridade, status, data_prazo, cliente_id, checklist')
        .eq('user_id', ctx.userId)
        .order('data_prazo', { ascending: true, nullsFirst: false })
        .limit(50)
      const status = str(args.status)
      if (status) q = q.eq('status', status)
      else        q = q.in('status', ['pendente', 'em_progresso'])
      const cid = str(args.cliente_id)
      if (cid) q = q.eq('cliente_id', cid)
      const { data, error } = await q
      if (error) throw new Error(error.message)
      return { total: data.length, tarefas: data }
    },
    resumo: () => 'Consultou tarefas',
  },

  criar_tarefa: {
    declaration: {
      name: 'criar_tarefa',
      description: 'Cria uma tarefa/lembrete. Para prazos relativos ("amanhã"), calcule a data ISO a partir da data atual informada no contexto.',
      parameters: {
        type: T.OBJECT,
        properties: {
          titulo:     { type: T.STRING },
          descricao:  { type: T.STRING },
          prioridade: { type: T.STRING, description: 'critico, alto, normal ou baixo (default normal)' },
          data_prazo: { type: T.STRING, description: 'Data ISO YYYY-MM-DD' },
          cliente_id: { type: T.STRING, description: 'Vincular a um cliente (opcional)' },
        },
        required: ['titulo'],
      },
    },
    execute: async (args, ctx) => {
      const cid = str(args.cliente_id)
      if (cid) await ownCliente(ctx, cid)
      const { data, error } = await ctx.db.from('tarefas').insert({
        user_id:    ctx.userId,
        titulo:     str(args.titulo),
        descricao:  str(args.descricao) ?? '',
        prioridade: str(args.prioridade) ?? 'normal',
        status:     'pendente',
        data_prazo: str(args.data_prazo),
        cliente_id: cid,
      }).select('id, titulo').single()
      if (error) throw new Error(error.message)
      return data
    },
    resumo: (args) => `Tarefa criada: "${str(args.titulo)}"`,
  },

  listar_templates_tarefa: {
    declaration: {
      name: 'listar_templates_tarefa',
      description: 'Lista os templates de tarefa/processo disponíveis (ex.: setup-cliente, onboarding-cliente) com checklist, prioridade e prazo. Use antes de criar_tarefa_de_template.',
      parameters: { type: T.OBJECT, properties: {} },
    },
    execute: async (_args, ctx) => {
      const { data, error } = await ctx.db
        .from('tarefa_templates')
        .select('id, slug, nome, titulo, descricao, prioridade, prazo_dias, checklist')
        .order('created_at', { ascending: true })
      if (error) throw new Error(error.message)
      return { total: (data ?? []).length, templates: data ?? [] }
    },
    resumo: () => 'Consultou templates de tarefa',
  },

  criar_tarefa_de_template: {
    declaration: {
      name: 'criar_tarefa_de_template',
      description: 'Cria uma tarefa a partir de um template de processo (preenche título, checklist, prioridade e prazo automaticamente). Identifique o template por id ou slug (ex.: "setup-cliente").',
      parameters: {
        type: T.OBJECT,
        properties: {
          template:   { type: T.STRING, description: 'ID ou slug do template (veja listar_templates_tarefa)' },
          cliente_id: { type: T.STRING, description: 'Cliente para substituir {cliente} no título (opcional)' },
        },
        required: ['template'],
      },
    },
    execute: async (args, ctx) => {
      const ref = str(args.template)
      if (!ref) throw new Error('template é obrigatório.')
      const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref)
      const { data: tpl, error: tplErr } = await ctx.db
        .from('tarefa_templates')
        .select('nome, titulo, descricao, prioridade, prazo_dias, checklist')
        .eq(uuidLike ? 'id' : 'slug', ref)
        .maybeSingle()
      if (tplErr) throw new Error(tplErr.message)
      if (!tpl) throw new Error(`Template "${ref}" não encontrado.`)

      const cid = str(args.cliente_id)
      let nomeCliente: string | undefined
      if (cid) {
        const cliente = await ownCliente(ctx, cid)
        nomeCliente = cliente.nome as string
      }

      const prazo = tpl.prazo_dias != null ? new Date() : null
      if (prazo) prazo.setDate(prazo.getDate() + (tpl.prazo_dias as number))

      const checklist = (Array.isArray(tpl.checklist) ? tpl.checklist : []) as string[]
      const { data, error } = await ctx.db.from('tarefas').insert({
        user_id:    ctx.userId,
        titulo:     nomeCliente ? tpl.titulo.replace('{cliente}', nomeCliente) : tpl.titulo,
        descricao:  tpl.descricao ?? '',
        prioridade: tpl.prioridade ?? 'normal',
        status:     'pendente',
        data_prazo: prazo ? prazo.toISOString().slice(0, 10) : null,
        cliente_id: cid,
        checklist:  checklist.map((texto) => ({ id: crypto.randomUUID(), texto, concluido: false })),
      }).select('id, titulo').single()
      if (error) throw new Error(error.message)
      return data
    },
    resumo: (args) => `Tarefa criada do template "${str(args.template)}"`,
  },

  atualizar_tarefa: {
    declaration: {
      name: 'atualizar_tarefa',
      description: 'Edita uma tarefa: concluir (status=feito), adiar, mudar prioridade/prazo/título.',
      parameters: {
        type: T.OBJECT,
        properties: {
          tarefa_id:  { type: T.STRING, description: 'Título OU id da tarefa — prefira o TÍTULO; o sistema resolve. Não invente IDs.' },
          titulo:     { type: T.STRING },
          descricao:  { type: T.STRING },
          status:     { type: T.STRING, description: 'pendente, em_progresso, feito, adiado' },
          prioridade: { type: T.STRING },
          data_prazo: { type: T.STRING, description: 'Data ISO YYYY-MM-DD' },
        },
        required: ['tarefa_id'],
      },
    },
    execute: async (args, ctx) => {
      const tarefa = await resolverEntidade(ctx, 'tarefas', str(args.tarefa_id), 'titulo', { scopeUser: true })
      const id = String(tarefa.id)
      const campos: Record<string, unknown> = {}
      for (const k of ['titulo', 'descricao', 'status', 'prioridade', 'data_prazo'] as const) {
        if (str(args[k]) !== undefined) campos[k] = str(args[k])
      }
      if (!Object.keys(campos).length) throw new Error('Nenhum campo para atualizar.')
      const { data, error } = await ctx.db.from('tarefas').update(campos)
        .eq('id', id).eq('user_id', ctx.userId).select('id, titulo, status').single()
      if (error) throw new Error(error.message)
      return data
    },
    resumo: (args) => str(args.status) === 'feito' ? 'Tarefa concluída' : 'Tarefa atualizada',
  },

  excluir_tarefa: {
    declaration: {
      name: 'excluir_tarefa',
      description: 'Exclui uma tarefa definitivamente. Use apenas com pedido explícito do usuário.',
      parameters: {
        type: T.OBJECT,
        properties: {
          tarefa_id: { type: T.STRING, description: 'Título OU id da tarefa — prefira o TÍTULO; o sistema resolve.' },
          confirmar: { type: T.BOOLEAN, description: 'true SOMENTE depois que o Lucas autorizar explicitamente ESTA exclusão. Sem isso, a chamada só pede confirmação.' },
        },
        required: ['tarefa_id'],
      },
    },
    execute: async (args, ctx) => {
      const tarefa = await resolverEntidade(ctx, 'tarefas', str(args.tarefa_id), 'titulo', { scopeUser: true })
      const { error } = await ctx.db.from('tarefas').delete().eq('id', String(tarefa.id)).eq('user_id', ctx.userId)
      if (error) throw new Error(error.message)
      return { ok: true, excluida: tarefa.titulo }
    },
    resumo: () => 'Tarefa excluída',
  },

  // ════ FINANCEIRO ══════════════════════════════════════════════════════════

  financeiro_resumo: {
    declaration: {
      name: 'financeiro_resumo',
      description: 'DRE resumida de um mês: receitas, custos, lucro, MRR ativo (soma do valor_mensal das assinaturas com cobrança viva — ativa ou em atraso) e lista de inadimplentes com estágio (D+7/D+15/D+30).',
      parameters: {
        type: T.OBJECT,
        properties: {
          mes: { type: T.STRING, description: 'Formato YYYY-MM. Default: mês atual.' },
        },
      },
    },
    execute: async (args, ctx) => {
      const { inicio, fim, label } = mesRange(str(args.mes))
      const [lanc, cli, assin] = await Promise.all([
        ctx.db.from('financeiro_lancamentos')
          .select('tipo, valor, status')
          .eq('user_id', ctx.userId)
          .gte('data', inicio).lte('data', fim)
          .neq('status', 'cancelado'),
        ctx.db.from('clientes')
          .select('nome, mrr, dias_atraso, status')
          .eq('user_id', ctx.userId),
        // MRR vem das assinaturas (fonte de verdade) — ver lib/mrr.ts.
        // assinaturas não tem user_id: isolamento via cliente_id.
        ctx.db.from('assinaturas')
          .select('valor_mensal, status, clientes!inner(user_id)')
          .eq('clientes.user_id', ctx.userId)
          .in('status', STATUS_ASSINATURA_ATIVA),
      ])
      if (lanc.error) throw new Error(lanc.error.message)
      const receitas = (lanc.data ?? []).filter((l) => l.tipo === 'receita').reduce((s, l) => s + (l.valor ?? 0), 0)
      const custos   = (lanc.data ?? []).filter((l) => l.tipo !== 'receita').reduce((s, l) => s + (l.valor ?? 0), 0)
      const clientes = cli.data ?? []
      const inadimplentes = clientes
        .filter((c) => (c.dias_atraso ?? 0) > 0 && c.status !== 'inativo')
        .map((c) => ({ nome: c.nome, dias_atraso: c.dias_atraso, mrr: c.mrr, estagio: estagioInadimplencia(c.dias_atraso) }))
      return {
        mes: label,
        receitas, custos, lucro: receitas - custos,
        mrr_ativo: calcularMRR(assin.data ?? []),
        inadimplentes,
      }
    },
    resumo: () => 'Consultou financeiro',
  },

  listar_lancamentos: {
    declaration: {
      name: 'listar_lancamentos',
      description: 'Lista lançamentos financeiros (receitas e despesas) de um mês.',
      parameters: {
        type: T.OBJECT,
        properties: {
          mes:  { type: T.STRING, description: 'YYYY-MM. Default: mês atual.' },
          tipo: { type: T.STRING, description: 'receita, custo_fixo ou custo_variavel' },
        },
      },
    },
    execute: async (args, ctx) => {
      const { inicio, fim } = mesRange(str(args.mes))
      let q = ctx.db.from('financeiro_lancamentos')
        .select('id, tipo, categoria, descricao, valor, data, status, cliente_id')
        .eq('user_id', ctx.userId)
        .gte('data', inicio).lte('data', fim)
        .order('data', { ascending: false })
        .limit(100)
      const tipo = str(args.tipo)
      if (tipo) q = q.eq('tipo', tipo)
      const { data, error } = await q
      if (error) throw new Error(error.message)
      const totalValor = data.reduce((s: number, l: { valor?: number }) => s + (Number(l.valor) || 0), 0)
      const nota = notaTruncada(data.length)
      return {
        total: data.length,
        total_valor: totalValor,
        lancamentos: enxugar(data.slice(0, MAX_LISTA),
          ['tipo', 'categoria', 'descricao', 'valor', 'data', 'status']),
        ...(nota ? { nota } : {}),
      }
    },
    resumo: () => 'Consultou lançamentos',
  },

  criar_lancamento: {
    declaration: {
      name: 'criar_lancamento',
      description: 'Registra um lançamento financeiro (receita ou despesa).',
      parameters: {
        type: T.OBJECT,
        properties: {
          tipo:       { type: T.STRING, description: 'receita, custo_fixo ou custo_variavel' },
          descricao:  { type: T.STRING },
          valor:      { type: T.NUMBER },
          data:       { type: T.STRING, description: 'YYYY-MM-DD. Default: hoje.' },
          categoria:  { type: T.STRING },
          cliente_id: { type: T.STRING },
        },
        required: ['tipo', 'descricao', 'valor'],
      },
    },
    execute: async (args, ctx) => {
      const cid = str(args.cliente_id)
      if (cid) await ownCliente(ctx, cid)
      const { data, error } = await ctx.db.from('financeiro_lancamentos').insert({
        user_id:    ctx.userId,
        tipo:       str(args.tipo),
        descricao:  str(args.descricao),
        valor:      num(args.valor),
        data:       str(args.data) ?? new Date().toISOString().slice(0, 10),
        categoria:  str(args.categoria),
        cliente_id: cid,
        status:     'confirmado',
      }).select('id, descricao, valor').single()
      if (error) throw new Error(error.message)
      return data
    },
    resumo: (args) => `Lançamento registrado: ${str(args.descricao)} (R$ ${num(args.valor)})`,
  },

  // ════ ALERTAS E NOTIFICAÇÕES ══════════════════════════════════════════════

  listar_alertas: {
    declaration: {
      name: 'listar_alertas',
      description: 'Lista alertas críticos pendentes (saldo Google, inadimplência) e notificações não lidas.',
      parameters: { type: T.OBJECT, properties: {} },
    },
    execute: async (_args, ctx) => {
      const { data: clientes } = await ctx.db.from('clientes').select('id, nome').eq('user_id', ctx.userId)
      const ids = (clientes ?? []).map((c) => c.id)
      const nomes = new Map((clientes ?? []).map((c) => [c.id, c.nome]))
      const [alertas, notifs] = await Promise.all([
        ids.length
          ? ctx.db.from('alertas').select('id, cliente_id, tipo_alerta, mensagem, created_at').in('cliente_id', ids).eq('disparado', false).limit(30)
          : Promise.resolve({ data: [] }),
        ctx.db.from('notificacoes').select('id, tipo, titulo, mensagem, created_at').eq('user_id', ctx.userId).eq('lida', false).limit(30),
      ])
      return {
        alertas: (alertas.data ?? []).map((a) => ({ ...a, cliente: nomes.get(a.cliente_id) ?? null })),
        notificacoes_nao_lidas: notifs.data ?? [],
      }
    },
    resumo: () => 'Consultou alertas',
  },

  criar_notificacao: {
    declaration: {
      name: 'criar_notificacao',
      description: 'Cria uma notificação in-app para o operador (aparece no sino).',
      parameters: {
        type: T.OBJECT,
        properties: {
          titulo:   { type: T.STRING },
          mensagem: { type: T.STRING },
          tipo:     { type: T.STRING, description: 'urgente, atencao, info, sucesso ou alerta (default info)' },
        },
        required: ['titulo'],
      },
    },
    execute: async (args, ctx) => {
      const { data, error } = await ctx.db.from('notificacoes').insert({
        user_id:  ctx.userId,
        titulo:   str(args.titulo),
        mensagem: str(args.mensagem) ?? '',
        tipo:     str(args.tipo) ?? 'info',
        lida:     false,
      }).select('id, titulo').single()
      if (error) throw new Error(error.message)
      return data
    },
    resumo: (args) => `Notificação criada: "${str(args.titulo)}"`,
  },

  panorama_agencia: {
    declaration: {
      name: 'panorama_agencia',
      description: 'Resumo do estado atual da agência: total de clientes e ativos, MRR, e o que pede atenção agora (inadimplentes, saldo Google baixo, tarefas com prazo até hoje). Chame quando a conversa tocar em operação/clientes/finanças, ou quando você quiser ser proativa com base no estado real. NÃO chame para saudações ou papo trivial. Para a lista completa de clientes/tarefas, use listar_clientes/listar_tarefas.',
      parameters: { type: T.OBJECT, properties: {} },
    },
    execute: async (_args, ctx) => {
      const hojeFim = `${new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })}T23:59:59`
      const [clientesRes, tarefasHojeRes, assinRes] = await Promise.all([
        ctx.db.from('clientes')
          .select('id, nome, status, dias_atraso, saldo_google')
          .eq('user_id', ctx.userId)
          .limit(200),
        ctx.db.from('tarefas')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', ctx.userId)
          .in('status', ['pendente', 'em_progresso'])
          .lte('data_prazo', hojeFim),
        // MRR pela FONTE ÚNICA (assinaturas vivas — lib/mrr), não pelo espelho
        // clientes.mrr nem só de status='ativo': receita recorrente inclui quem
        // está em atraso ou ainda em recebido com cobrança viva.
        ctx.db.from('assinaturas')
          .select('valor_mensal, status, clientes!inner(user_id)')
          .eq('clientes.user_id', ctx.userId)
          .in('status', STATUS_ASSINATURA_ATIVA),
      ])
      const clientes = (clientesRes.data ?? []) as Array<{ id: string; nome: string; status: string; dias_atraso: number | null; saldo_google: number | null }>
      const ativos = clientes.filter((c) => c.status === 'ativo')
      const mrrTotal = calcularMRR(assinRes.data ?? [])
      return {
        total_clientes: clientes.length,
        ativos:         ativos.length,
        mrr_total:      mrrTotal,
        inadimplentes:  clientes.filter((c) => (c.dias_atraso ?? 0) > 0)
          .map((c) => ({ id: c.id, nome: c.nome, dias_atraso: c.dias_atraso })),
        saldo_google_baixo: clientes.filter((c) => c.saldo_google != null && c.saldo_google <= 50)
          .map((c) => ({ id: c.id, nome: c.nome, saldo_google: c.saldo_google })),
        tarefas_ate_hoje: tarefasHojeRes.count ?? 0,
      }
    },
    resumo: () => 'Consultou o panorama da agência.',
  },

  panorama_onboarding: {
    declaration: {
      name: 'panorama_onboarding',
      description: 'Panorama dos onboardings em andamento: para cada cliente, a etapa atual, há quanto tempo está nela, e de quem é a vez (cliente ou agência). Use para o usuário saber onde cada cliente parou e qual a próxima ação.',
      parameters: { type: T.OBJECT, properties: {} },
    },
    execute: async (_args, ctx) => {
      // Clientes do usuário (para escopar as instâncias)
      const { data: clientes } = await ctx.db
        .from('clientes')
        .select('id, nome')
        .eq('user_id', ctx.userId)
      const nomePorId = new Map((clientes ?? []).map((c: { id: string; nome: string }) => [c.id, c.nome]))
      const ids = Array.from(nomePorId.keys())
      if (ids.length === 0) return { onboardings: [] }

      const { data: instancias } = await ctx.db
        .from('timeline_instances')
        .select('current_step_id, updated_at, client_id, template:timeline_templates(name, steps)')
        .eq('type', 'onboarding')
        .eq('status', 'active')
        .in('client_id', ids)

      const HORAS_MS = 60 * 60 * 1000
      type TplJoin = { name?: string; steps?: Array<{ id: string; title: string; responsavel?: string }> }
      const onboardings = ((instancias ?? []) as Array<{
        current_step_id: string | null
        updated_at: string | null
        client_id: string | null
        template: TplJoin | TplJoin[] | null
      }>).map((inst) => {
        const tpl = Array.isArray(inst.template) ? inst.template[0] : inst.template
        const steps = tpl?.steps ?? []
        const step = steps.find((s) => s.id === inst.current_step_id)
        const horasParado = inst.updated_at
          ? Math.floor((Date.now() - new Date(inst.updated_at).getTime()) / HORAS_MS)
          : null
        return {
          cliente:       inst.client_id ? nomePorId.get(inst.client_id) ?? '—' : '—',
          modelo:        tpl?.name ?? '—',
          etapa_atual:   step?.title ?? '—',
          responsavel:   step?.responsavel === 'cliente' ? 'cliente' : 'agência',
          horas_parado:  horasParado,
        }
      })
      return { onboardings }
    },
    resumo: () => 'Consultou o panorama de onboardings.',
  },

  // ════ MARKETING ═══════════════════════════════════════════════════════════

  listar_posts_marketing: {
    declaration: {
      name: 'listar_posts_marketing',
      description: 'Lista posts do calendário social (rascunho/agendado/publicado).',
      parameters: {
        type: T.OBJECT,
        properties: {
          status: { type: T.STRING, description: 'rascunho, agendado ou publicado' },
        },
      },
    },
    execute: async (args, ctx) => {
      let q = ctx.db.from('posts_marketing')
        .select('id, titulo, conteudo, plataforma, status, data_agendada, cliente_id')
        .eq('user_id', ctx.userId)
        .order('data_agendada', { ascending: false, nullsFirst: false })
        .limit(50)
      const status = str(args.status)
      if (status) q = q.eq('status', status)
      const { data, error } = await q
      if (error) throw new Error(error.message)
      return { total: data.length, posts: data }
    },
    resumo: () => 'Consultou calendário social',
  },

  criar_post_marketing: {
    declaration: {
      name: 'criar_post_marketing',
      description: 'Cria um post no calendário social. Você pode redigir a legenda/conteúdo quando o usuário pedir.',
      parameters: {
        type: T.OBJECT,
        properties: {
          titulo:        { type: T.STRING },
          conteudo:      { type: T.STRING, description: 'Legenda/copy do post' },
          plataforma:    { type: T.STRING, description: 'instagram, facebook, linkedin, tiktok...' },
          data_agendada: { type: T.STRING, description: 'ISO datetime ou YYYY-MM-DD' },
          status:        { type: T.STRING, description: 'rascunho (default) ou agendado' },
          cliente_id:    { type: T.STRING },
        },
        required: ['titulo'],
      },
    },
    execute: async (args, ctx) => {
      const cid = str(args.cliente_id)
      if (cid) await ownCliente(ctx, cid)
      const { data, error } = await ctx.db.from('posts_marketing').insert({
        user_id:       ctx.userId,
        titulo:        str(args.titulo),
        conteudo:      str(args.conteudo),
        plataforma:    str(args.plataforma),
        data_agendada: str(args.data_agendada),
        status:        str(args.status) ?? 'rascunho',
        cliente_id:    cid,
      }).select('id, titulo, status').single()
      if (error) throw new Error(error.message)
      return data
    },
    resumo: (args) => `Post criado: "${str(args.titulo)}"`,
  },

  // ════ PROSPECÇÃO (CRM) ════════════════════════════════════════════════════

  listar_prospects: {
    declaration: {
      name: 'listar_prospects',
      description: 'Lista prospects do CRM de prospecção.',
      parameters: {
        type: T.OBJECT,
        properties: {
          estagio: { type: T.STRING, description: 'Filtrar por estágio do funil (ex.: prospeccao, contato, proposta, fechado, perdido)' },
        },
      },
    },
    execute: async (args, ctx) => {
      let q = ctx.db.from('prospects')
        .select('id, nome, telefone, email, nicho, cidade, origem, estagio, valor_proposta, observacoes')
        .order('updated_at', { ascending: false })
        .limit(80)
      const estagio = str(args.estagio)
      if (estagio) q = q.eq('estagio', estagio)
      const { data, error } = await q
      if (error) throw new Error(error.message)
      return { total: data.length, prospects: data }
    },
    resumo: () => 'Consultou prospects',
  },

  criar_prospect: {
    declaration: {
      name: 'criar_prospect',
      description: 'Cadastra um prospect no CRM de prospecção.',
      parameters: {
        type: T.OBJECT,
        properties: {
          nome:           { type: T.STRING },
          telefone:       { type: T.STRING },
          email:          { type: T.STRING },
          nicho:          { type: T.STRING },
          cidade:         { type: T.STRING },
          origem:         { type: T.STRING, description: 'indicacao, inbound, outbound ou ads' },
          valor_proposta: { type: T.NUMBER },
          observacoes:    { type: T.STRING },
        },
        required: ['nome'],
      },
    },
    execute: async (args, ctx) => {
      const { data, error } = await ctx.db.from('prospects').insert({
        nome:           str(args.nome),
        telefone:       str(args.telefone),
        email:          str(args.email),
        nicho:          str(args.nicho),
        cidade:         str(args.cidade),
        origem:         str(args.origem) ?? 'indicacao',
        valor_proposta: num(args.valor_proposta),
        observacoes:    str(args.observacoes),
        responsavel_id: ctx.userId,
      }).select('id, nome').single()
      if (error) throw new Error(error.message)
      return data
    },
    resumo: (args) => `Prospect criado: "${str(args.nome)}"`,
  },

  atualizar_prospect: {
    declaration: {
      name: 'atualizar_prospect',
      description: 'Atualiza um prospect (mover de estágio no funil, anotar observações, registrar proposta).',
      parameters: {
        type: T.OBJECT,
        properties: {
          prospect_id:    { type: T.STRING, description: 'Nome OU id do prospect — prefira o NOME; o sistema resolve.' },
          estagio:        { type: T.STRING },
          observacoes:    { type: T.STRING },
          valor_proposta: { type: T.NUMBER },
          telefone:       { type: T.STRING },
          email:          { type: T.STRING },
        },
        required: ['prospect_id'],
      },
    },
    execute: async (args, ctx) => {
      const prospect = await resolverEntidade(ctx, 'prospects', str(args.prospect_id), 'nome')
      const id = String(prospect.id)
      const campos: Record<string, unknown> = {}
      for (const k of ['estagio', 'observacoes', 'telefone', 'email'] as const) {
        if (str(args[k]) !== undefined) campos[k] = str(args[k])
      }
      if (num(args.valor_proposta) !== undefined) campos.valor_proposta = num(args.valor_proposta)
      if (!Object.keys(campos).length) throw new Error('Nenhum campo para atualizar.')
      campos.updated_at = new Date().toISOString()
      const { data, error } = await ctx.db.from('prospects').update(campos).eq('id', id).select('id, nome, estagio').single()
      if (error) throw new Error(error.message)
      return data
    },
    resumo: () => 'Prospect atualizado',
  },

  // ════ ANALYTICS E HISTÓRICO ═══════════════════════════════════════════════

  analytics_cliente: {
    declaration: {
      name: 'analytics_cliente',
      description: 'Snapshots de performance (Google Ads e GA4) de um cliente: investimento, cliques, conversões, CPA, sessões.',
      parameters: {
        type: T.OBJECT,
        properties: {
          cliente_id:    { type: T.STRING },
          fonte:         { type: T.STRING, description: 'google_ads ou ga4' },
          agregar_grupo: { type: T.BOOLEAN, description: 'true = soma os snapshots de todos os CNPJs do grupo do cliente (visão consolidada)' },
        },
        required: ['cliente_id'],
      },
    },
    execute: async (args, ctx) => {
      const id = str(args.cliente_id)
      if (!id) throw new Error('cliente_id é obrigatório.')
      const cliente = await ownCliente(ctx, id, 'id, nome, grupo_id')

      // Visão consolidada do grupo (multi-CNPJ): soma os membros.
      let ids = [cliente.id as string]
      let grupoNome: string | null = null
      if (args.agregar_grupo === true && cliente.grupo_id) {
        const [{ data: g }, { data: membros }] = await Promise.all([
          ctx.db.from('cliente_grupos').select('nome').eq('id', cliente.grupo_id).maybeSingle(),
          ctx.db.from('clientes').select('id').eq('grupo_id', cliente.grupo_id),
        ])
        grupoNome = (g?.nome as string) ?? null
        if (membros?.length) ids = membros.map((m: { id: string }) => m.id)
      }

      let q = ctx.db.from('analytics_snapshots')
        .select('cliente_id, fonte, periodo_inicio, periodo_fim, investimento, impressoes, cliques, ctr, conversoes, cpa, roas, cpc_medio, usuarios, sessoes, taxa_conversao')
        .in('cliente_id', ids)
        .order('periodo_fim', { ascending: false })
        .limit(ids.length > 1 ? 24 : 8)
      const fonte = str(args.fonte)
      if (fonte) q = q.eq('fonte', fonte)
      const { data, error } = await q
      if (error) throw new Error(error.message)
      // Arredonda os floats (ctr, cpa, roas…) p/ 2 casas — menos tokens, mais legível.
      const snapshots = (data ?? []).map((s: Record<string, unknown>) => {
        const o: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(s)) o[k] = typeof v === 'number' ? Math.round(v * 100) / 100 : v
        return o
      })
      return grupoNome
        ? { grupo: grupoNome, membros: ids.length, nota: 'snapshots de todos os CNPJs do grupo — some por período/fonte para o consolidado', total: snapshots.length, snapshots }
        : { total: snapshots.length, snapshots }
    },
    resumo: () => 'Consultou analytics',
  },

  ads_ao_vivo: {
    declaration: {
      name: 'ads_ao_vivo',
      description: 'Dados AO VIVO direto das APIs Google Ads e GA4 de um cliente: campanhas, termos de pesquisa, demografia, geografia, device, horário, leilão, páginas top, fontes de tráfego. Use para análise profunda de performance atual (requer integrações habilitadas no cliente).',
      parameters: {
        type: T.OBJECT,
        properties: {
          cliente_id: { type: T.STRING },
          periodo:    { type: T.STRING, description: '7d, 30d ou 90d (default 30d)' },
        },
        required: ['cliente_id'],
      },
    },
    execute: async (args, ctx) => {
      const id = str(args.cliente_id)
      if (!id) throw new Error('cliente_id é obrigatório.')
      await ownCliente(ctx, id)
      const periodo = str(args.periodo) ?? '30d'
      const res = await fetch(`${ctx.origin}/api/analytics/${id}/live?periodo=${periodo}`, {
        headers: { cookie: ctx.cookie },
        signal:  AbortSignal.timeout(60000),
      })
      if (!res.ok) throw new Error(`Dados ao vivo indisponíveis (HTTP ${res.status}) — verifique se as integrações do cliente estão habilitadas e as credenciais Google configuradas.`)
      const dados = await res.json() as {
        googleAds?: Record<string, unknown>
        ga4?:       Record<string, unknown>
        periodo?:   string
      }
      // Compacta as listas para economizar tokens — top N de cada dimensão
      const top = (v: unknown, n: number) => (Array.isArray(v) ? v.slice(0, n) : [])
      const ads = dados.googleAds ?? {}
      const ga4 = dados.ga4 ?? {}
      return {
        periodo: dados.periodo ?? periodo,
        googleAds: {
          enabled:        ads.enabled ?? false,
          campanhas:      top(ads.campanhas, 15),
          termosPesquisa: top(ads.termosPesquisa, 15),
          demografia:     top(ads.demografia, 8),
          geografia:      top(ads.geografia, 8),
          device:         top(ads.device, 5),
          horario:        top(ads.horario, 8),
          leilao:         top(ads.leilao, 5),
        },
        ga4: {
          enabled:       ga4.enabled ?? false,
          dados:         ga4.dados ?? null,
          paginasTop:    top(ga4.paginasTop, 8),
          fontesTrafego: top(ga4.fontesTrafego, 8),
          device:        top(ga4.device, 5),
          eventos:       top(ga4.eventos, 8),
        },
      }
    },
    resumo: () => 'Consultou Google Ads ao vivo',
  },

  ads_historico: {
    declaration: {
      name: 'ads_historico',
      description: 'HISTÓRICO GRANULAR do Google Ads via BigQuery (base diária alimentada pelo Data Transfer do MCC, com backfill de meses): performance por campanha, por dia (série temporal) ou por keyword em QUALQUER intervalo de datas — inclusive campanhas já removidas. Aceita um segundo período opcional para comparativo (ex.: este mês vs mês passado). Use para análises históricas/comparativas que o ads_ao_vivo (foto atual) não cobre.',
      parameters: {
        type: T.OBJECT,
        properties: {
          cliente_id:    { type: T.STRING },
          data_inicio:   { type: T.STRING, description: 'YYYY-MM-DD' },
          data_fim:      { type: T.STRING, description: 'YYYY-MM-DD' },
          dimensao:      { type: T.STRING, description: 'campanha (default), dia ou keyword' },
          data_inicio2:  { type: T.STRING, description: 'opcional — início do 2º período p/ comparativo' },
          data_fim2:     { type: T.STRING, description: 'opcional — fim do 2º período p/ comparativo' },
          agregar_grupo: { type: T.BOOLEAN, description: 'true = soma as contas Ads de todos os CNPJs do grupo do cliente' },
        },
        required: ['cliente_id', 'data_inicio', 'data_fim'],
      },
    },
    execute: async (args, ctx) => {
      const id = str(args.cliente_id)
      if (!id) throw new Error('cliente_id é obrigatório.')
      const cliente = await ownCliente(ctx, id, 'id, nome, google_ads_customer_id, grupo_id')

      // Contas a consultar: só a do cliente, ou todas as do grupo (multi-CNPJ).
      let customerIds = cliente.google_ads_customer_id ? [cliente.google_ads_customer_id as string] : []
      let grupoNome: string | null = null
      if (args.agregar_grupo === true && cliente.grupo_id) {
        const [{ data: g }, { data: membros }] = await Promise.all([
          ctx.db.from('cliente_grupos').select('nome').eq('id', cliente.grupo_id).maybeSingle(),
          ctx.db.from('clientes').select('google_ads_customer_id').eq('grupo_id', cliente.grupo_id).not('google_ads_customer_id', 'is', null),
        ])
        grupoNome = (g?.nome as string) ?? null
        const doGrupo = (membros ?? []).map((m: { google_ads_customer_id: string }) => m.google_ads_customer_id)
        if (doGrupo.length) customerIds = doGrupo
      }
      if (customerIds.length === 0) throw new Error(`${cliente.nome} não tem Google Ads customer ID configurado.`)

      const inicio = str(args.data_inicio)
      const fim = str(args.data_fim)
      if (!inicio || !fim || !/^\d{4}-\d{2}-\d{2}$/.test(inicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fim)) {
        throw new Error('data_inicio e data_fim são obrigatórias no formato YYYY-MM-DD.')
      }
      const dim = (str(args.dimensao) ?? 'campanha') as 'campanha' | 'dia' | 'keyword'
      const dimensao = ['campanha', 'dia', 'keyword'].includes(dim) ? dim : 'campanha'

      const { desempenhoHistorico, totaisPeriodo } = await import('@/lib/bigquery')

      // Uma conta = direto; grupo = consulta cada conta e soma por chave.
      const porConta = await Promise.all(
        customerIds.map((cid) => desempenhoHistorico(cid, inicio, fim, dimensao, MAX_LISTA)),
      )
      const somadas = new Map<string, { chave: string; impressoes: number; cliques: number; custo: number; conversoes: number }>()
      for (const lista of porConta) {
        for (const l of lista) {
          const atual = somadas.get(l.chave) ?? { chave: l.chave, impressoes: 0, cliques: 0, custo: 0, conversoes: 0 }
          atual.impressoes += l.impressoes
          atual.cliques    += l.cliques
          atual.custo      = Math.round((atual.custo + l.custo) * 100) / 100
          atual.conversoes = Math.round((atual.conversoes + l.conversoes) * 100) / 100
          somadas.set(l.chave, atual)
        }
      }
      const linhas = Array.from(somadas.values())
        .sort((a, b) => (dimensao === 'dia' ? a.chave.localeCompare(b.chave) : b.custo - a.custo))
        .slice(0, MAX_LISTA)

      const resultado: Record<string, unknown> = {
        cliente: cliente.nome,
        ...(grupoNome ? { grupo: grupoNome, contas_somadas: customerIds.length } : {}),
        periodo: { inicio, fim },
        dimensao,
        total_linhas: linhas.length,
        linhas,
      }

      // Comparativo opcional: totais dos dois períodos + variação %.
      const inicio2 = str(args.data_inicio2)
      const fim2 = str(args.data_fim2)
      if (inicio2 && fim2 && /^\d{4}-\d{2}-\d{2}$/.test(inicio2) && /^\d{4}-\d{2}-\d{2}$/.test(fim2)) {
        const somaTotais = async (i: string, f: string) => {
          const ts = await Promise.all(customerIds.map((cid) => totaisPeriodo(cid, i, f)))
          return ts.reduce((acc, t) => ({
            impressoes: acc.impressoes + t.impressoes,
            cliques:    acc.cliques + t.cliques,
            custo:      Math.round((acc.custo + t.custo) * 100) / 100,
            conversoes: Math.round((acc.conversoes + t.conversoes) * 100) / 100,
          }), { impressoes: 0, cliques: 0, custo: 0, conversoes: 0 })
        }
        const [t1, t2] = await Promise.all([
          somaTotais(inicio, fim),
          somaTotais(inicio2, fim2),
        ])
        const varPct = (a: number, b: number) => (b > 0 ? Math.round(((a - b) / b) * 100) : null)
        resultado.comparativo = {
          periodo_1: { inicio, fim, ...t1 },
          periodo_2: { inicio: inicio2, fim: fim2, ...t2 },
          variacao_pct: {
            impressoes: varPct(t1.impressoes, t2.impressoes),
            cliques:    varPct(t1.cliques, t2.cliques),
            custo:      varPct(t1.custo, t2.custo),
            conversoes: varPct(t1.conversoes, t2.conversoes),
          },
        }
      }

      return resultado
    },
    resumo: () => 'Consultou histórico BigQuery do Google Ads',
  },

  historico_cliente: {
    declaration: {
      name: 'historico_cliente',
      description: 'Audit log de um cliente: ações registradas (pagamentos, mudanças de status, ações da IA).',
      parameters: {
        type: T.OBJECT,
        properties: { cliente_id: { type: T.STRING } },
        required: ['cliente_id'],
      },
    },
    execute: async (args, ctx) => {
      const id = str(args.cliente_id)
      if (!id) throw new Error('cliente_id é obrigatório.')
      await ownCliente(ctx, id)
      const { data, error } = await ctx.db.from('historico_acoes')
        .select('tipo_acao, descricao, valor_impactado, created_at')
        .eq('cliente_id', id)
        .order('created_at', { ascending: false })
        .limit(30)
      if (error) throw new Error(error.message)
      return { total: data.length, historico: data }
    },
    resumo: () => 'Consultou histórico',
  },

  // ════ RADAR (APEX — ver o que não se vê) ══════════════════════════════════

  radar: {
    declaration: {
      name: 'radar',
      description: 'RAIO-X PROATIVO da agência: cruza, por cliente, inadimplência (política D+7/D+15/D+30), saldo Google baixo/zerado, tendência de performance (analytics caindo) e onboarding travado — sinais que vivem em telas separadas e ninguém junta. Devolve os clientes em RISCO ordenados por gravidade com os motivos cruzados, o MRR em risco (R$) e o prazo até a próxima consequência. Use quando o Lucas pedir análise/novidade/"o que não estou vendo" ou para embasar um alerta proativo. Só dado real — nunca invente.',
      parameters: { type: T.OBJECT, properties: {} },
    },
    execute: async (_args, ctx) => {
      const limiares = await carregarLimiaresAtraso(ctx.db)
      const [cliRes, cfgRes, assinRes] = await Promise.all([
        ctx.db.from('clientes')
          .select('id, nome, nicho, status, dias_atraso, saldo_google, saldo_minimo_alerta, google_ads_enabled, data_criacao')
          .eq('user_id', ctx.userId)
          .neq('status', 'inativo'),
        ctx.db.from('configuracoes_operacional')
          .select('alerta_saldo_ads_minimo').eq('agencia_id', 'adsgator-main').maybeSingle(),
        ctx.db.from('assinaturas')
          .select('cliente_id, valor_mensal, status, clientes!inner(user_id)')
          .eq('clientes.user_id', ctx.userId)
          .in('status', STATUS_ASSINATURA_ATIVA),
      ])
      if (cliRes.error) throw new Error(cliRes.error.message)
      const clientes = (cliRes.data ?? []) as Array<Record<string, unknown>>
      const minimoGlobal = Number(cfgRes.data?.alerta_saldo_ads_minimo) || 50

      // MRR vivo por cliente (fonte: assinaturas — ver lib/mrr).
      const mrrPorCliente = new Map<string, number>()
      for (const a of (assinRes.data ?? []) as Array<{ cliente_id: string; valor_mensal: number | null }>) {
        mrrPorCliente.set(a.cliente_id, (mrrPorCliente.get(a.cliente_id) ?? 0) + (a.valor_mensal ?? 0))
      }
      // Quem tem cobrança VIVA. Atraso registrado sem assinatura viva = inconsistência
      // (assinatura cancelada/deletada mas dias_atraso não zerou) — não é "suspensão
      // iminente" nem dinheiro em risco; é dado a revisar / provável saída.
      const temAssinaturaViva = new Set(mrrPorCliente.keys())

      // Tendência de performance: compara os 2 snapshots mais recentes por cliente+fonte.
      const ids = clientes.map((c) => c.id as string)
      const tendenciaRuim = new Map<string, string>()
      let temAnalytics = false
      if (ids.length) {
        const { data: snaps } = await ctx.db.from('analytics_snapshots')
          .select('cliente_id, fonte, periodo_inicio, periodo_fim, conversoes, cpa')
          .in('cliente_id', ids)
          .order('periodo_fim', { ascending: false })
          .limit(300)
        const porChave = new Map<string, Array<{ conversoes: number | null; cpa: number | null }>>()
        for (const s of (snaps ?? []) as Array<{ cliente_id: string; fonte: string; periodo_inicio: string; periodo_fim: string; conversoes: number | null; cpa: number | null }>) {
          // Tendência compara mês vs mês — snapshots semanais ficam de fora.
          if (ehSnapshotSemanal(s.periodo_inicio, s.periodo_fim)) continue
          const k = `${s.cliente_id}|${s.fonte}`
          const arr = porChave.get(k) ?? []
          if (arr.length < 2) { arr.push({ conversoes: s.conversoes, cpa: s.cpa }); porChave.set(k, arr) }
        }
        for (const [k, arr] of porChave) {
          if (arr.length < 2) continue
          temAnalytics = true
          const [novo, velho] = arr
          const motivos: string[] = []
          const convNovo = novo.conversoes ?? 0, convVelho = velho.conversoes ?? 0
          if (convVelho > 0 && convNovo < convVelho * 0.85) motivos.push(`conversões -${Math.round((1 - convNovo / convVelho) * 100)}%`)
          const cpaNovo = novo.cpa ?? 0, cpaVelho = velho.cpa ?? 0
          if (cpaVelho > 0 && cpaNovo > cpaVelho * 1.2) motivos.push(`CPA +${Math.round((cpaNovo / cpaVelho - 1) * 100)}%`)
          if (motivos.length) tendenciaRuim.set(k.split('|')[0], `performance caindo (${motivos.join(', ')})`)
        }
      }

      const agora = Date.now()
      const diasDesde = (d: unknown) => (typeof d === 'string' ? Math.floor((agora - new Date(d).getTime()) / 86_400_000) : null)

      type Risco = { nome: string; nicho?: string; nivel: 'alto' | 'medio'; mrr: number; motivos: string[]; prazo?: string }
      const emRisco: Risco[] = []

      for (const c of clientes) {
        const motivos: string[] = []
        let alto = false

        // Inadimplência (política centralizada) + prazo até a próxima consequência.
        const dias = Number(c.dias_atraso) || 0
        const estagio = estagioInadimplencia(dias, limiares)
        let prazo: string | undefined
        if (estagio !== 'em_dia') {
          if (temAssinaturaViva.has(c.id as string)) {
            const rotulo: Record<string, string> = { atencao: 'em atraso', suspensao: 'suspensão iminente (D+7)', grave: 'quebra de contrato (D+15)', critico: 'crítico (D+30)' }
            motivos.push(`inadimplente ${dias}d — ${rotulo[estagio]}`)
            if (estagio !== 'atencao') alto = true
            const prox = dias < limiares.suspensao ? { d: limiares.suspensao, n: 'suspensão' }
              : dias < limiares.grave ? { d: limiares.grave, n: 'quebra de contrato' }
              : dias < limiares.critico ? { d: limiares.critico, n: 'estágio crítico' } : null
            if (prox) prazo = `${prox.d - dias} dia(s) até ${prox.n}`
          } else {
            // Atraso sem cobrança viva: honestidade > alarme falso de "suspensão".
            motivos.push(`atraso de ${dias}d registrado MAS sem assinatura viva (cancelada/deletada) — revisar: provável saída do cliente ou dado defasado, não há cobrança a suspender`)
          }
        }

        // Saldo Google (mín por cliente, fallback global — mesma regra do alerta de saldo).
        const saldo = c.saldo_google == null ? null : Number(c.saldo_google)
        const minimo = Number(c.saldo_minimo_alerta) || minimoGlobal
        if (c.google_ads_enabled && saldo !== null) {
          if (saldo <= 0) { motivos.push('saldo Google ZERADO'); alto = true }
          else if (saldo <= minimo) motivos.push(`saldo Google baixo (R$ ${saldo} / mín R$ ${minimo})`)
        }

        // Tendência de performance.
        const t = tendenciaRuim.get(c.id as string)
        if (t) motivos.push(t)

        // Onboarding travado (gargalo do próprio Lucas).
        const status = String(c.status)
        if (['recebido', 'onboarding', 'setup_trafego'].includes(status)) {
          const d = diasDesde(c.data_criacao)
          if (d !== null && d > 14) motivos.push(`onboarding parado há ${d}d (status ${status})`)
        }

        if (!motivos.length) continue
        const nivel: 'alto' | 'medio' = alto || motivos.length >= 2 ? 'alto' : 'medio'
        emRisco.push({ nome: String(c.nome), nicho: c.nicho ? String(c.nicho) : undefined, nivel, mrr: mrrPorCliente.get(c.id as string) ?? 0, motivos, prazo })
      }

      // Alto antes; dentro do nível, maior MRR em risco primeiro.
      emRisco.sort((a, b) => (a.nivel === b.nivel ? b.mrr - a.mrr : a.nivel === 'alto' ? -1 : 1))
      const mrrRisco     = emRisco.reduce((s, r) => s + r.mrr, 0)
      const mrrRiscoAlto = emRisco.filter((r) => r.nivel === 'alto').reduce((s, r) => s + r.mrr, 0)

      return {
        analisados:     clientes.length,
        em_risco_alto:  emRisco.filter((r) => r.nivel === 'alto').length,
        em_risco_medio: emRisco.filter((r) => r.nivel === 'medio').length,
        mrr_em_risco:       Math.round(mrrRisco),
        mrr_em_risco_alto:  Math.round(mrrRiscoAlto),
        clientes_em_risco:  emRisco.slice(0, 20),
        nota: temAnalytics ? undefined : 'Sem ≥2 snapshots de analytics: tendência de performance não avaliada (faltam dados Google/GA4).',
      }
    },
    resumo: () => 'Cruzou os riscos da agência',
  },

  // ════ MEMÓRIA ═════════════════════════════════════════════════════════════

  salvar_memoria: {
    declaration: {
      name: 'salvar_memoria',
      description: 'Salva um fato GERAL na sua memória de longo prazo — o que vale sempre, sem dono específico: como o Lucas opera, regras e jeito da agência, preferências dele. Entra em TODA conversa, então guarde só o durável. Fato preso a UM cliente NÃO vai aqui — vai em anotar_no_cliente.',
      parameters: {
        type: T.OBJECT,
        properties: {
          conteudo: { type: T.STRING, description: 'O fato geral, autocontido (ex.: "O Lucas prefere cobrar por WhatsApp antes de suspender")' },
        },
        required: ['conteudo'],
      },
    },
    execute: async (args, ctx) => {
      const conteudo = str(args.conteudo)
      if (!conteudo) throw new Error('conteudo é obrigatório.')
      // Idempotente: não duplica um fato idêntico já guardado (protege contra
      // re-execução do loop e salvamentos repetidos do mesmo fato ao longo do tempo).
      const { data: existente } = await ctx.db.from('ia_memoria')
        .select('id').eq('user_id', ctx.userId).eq('conteudo', conteudo).maybeSingle()
      if (existente) return { ok: true, memoria_id: existente.id, ja_existia: true }
      const { data, error } = await ctx.db.from('ia_memoria').insert({
        user_id:  ctx.userId,
        conteudo,
      }).select('id').single()
      if (error) throw new Error(error.message)
      return { ok: true, memoria_id: data.id }
    },
    resumo: () => 'Memória salva',
  },

  esquecer_memoria: {
    declaration: {
      name: 'esquecer_memoria',
      description: 'Remove um fato da sua memória de longo prazo (os IDs estão listados junto à memória no contexto).',
      parameters: {
        type: T.OBJECT,
        properties: {
          memoria_id: { type: T.STRING, description: 'id da memória (estão no contexto) OU um trecho do conteúdo — o sistema resolve e confere antes de apagar.' },
          confirmar:  { type: T.BOOLEAN, description: 'true SOMENTE depois que o Lucas autorizar explicitamente esquecer ISTO. Sem isso, a chamada só pede confirmação.' },
        },
        required: ['memoria_id'],
      },
    },
    execute: async (args, ctx) => {
      const memoria = await resolverEntidade(ctx, 'ia_memoria', str(args.memoria_id), 'conteudo', { scopeUser: true })
      const { error } = await ctx.db.from('ia_memoria').delete().eq('id', String(memoria.id)).eq('user_id', ctx.userId)
      if (error) throw new Error(error.message)
      return { ok: true, removida: String(memoria.conteudo ?? '').slice(0, 80) }
    },
    resumo: () => 'Memória removida',
  },

  atualizar_memoria_cliente: {
    declaration: {
      name: 'atualizar_memoria_cliente',
      description: 'Sobrescreve o arquivo de memória (.md) de um cliente — o dossiê de contexto usado pela IA. Leia o conteúdo atual via detalhar_cliente antes, e reescreva preservando o que ainda vale.',
      parameters: {
        type: T.OBJECT,
        properties: {
          cliente_id:  { type: T.STRING },
          conteudo_md: { type: T.STRING, description: 'Conteúdo markdown completo da memória' },
        },
        required: ['cliente_id', 'conteudo_md'],
      },
    },
    execute: async (args, ctx) => {
      const id = str(args.cliente_id)
      const md = typeof args.conteudo_md === 'string' ? args.conteudo_md : undefined
      if (!id || !md) throw new Error('cliente_id e conteudo_md são obrigatórios.')
      await ownCliente(ctx, id)
      const { data: atual } = await ctx.db.from('memoria_clientes').select('id, versao').eq('cliente_id', id).maybeSingle()
      if (atual) {
        const { error } = await ctx.db.from('memoria_clientes')
          .update({ conteudo_md: md, versao: (atual.versao ?? 1) + 1, updated_at: new Date().toISOString() })
          .eq('id', atual.id)
        if (error) throw new Error(error.message)
      } else {
        const { error } = await ctx.db.from('memoria_clientes').insert({ cliente_id: id, conteudo_md: md })
        if (error) throw new Error(error.message)
      }
      return { ok: true }
    },
    resumo: () => 'Memória do cliente atualizada',
  },

  anotar_no_cliente: {
    declaration: {
      name: 'anotar_no_cliente',
      description: 'Acrescenta UM fato à memória (.md) de um cliente — sem reescrever o resto, barato e seguro. É AQUI que vai todo contexto específico de cliente: preferência, peculiaridade, motivo de atraso, combinado, histórico de interação. Não jogue isso na sua memória de longo prazo. A linha é datada automaticamente.',
      parameters: {
        type: T.OBJECT,
        properties: {
          cliente_id: { type: T.STRING },
          fato:       { type: T.STRING, description: 'O fato em uma linha autocontida (ex.: "Pediu mudar vencimento do dia 23 p/ 08; não dava por estar vencido — plano será pausado e reativado no pagamento")' },
        },
        required: ['cliente_id', 'fato'],
      },
    },
    execute: async (args, ctx) => {
      const id   = str(args.cliente_id)
      const fato = str(args.fato)
      if (!id || !fato) throw new Error('cliente_id e fato são obrigatórios.')
      const cli  = await ownCliente(ctx, id)
      const hoje = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      const linha = `- (${hoje}) ${fato}`
      const { data: atual } = await ctx.db
        .from('memoria_clientes').select('id, conteudo_md, versao').eq('cliente_id', id).maybeSingle()
      const conteudoAtual = String(atual?.conteudo_md ?? '')
      // Idempotente: se o mesmo fato já está na ficha, não duplica (protege contra
      // re-execução do loop ou fatos repetidos vindos da memória global).
      if (conteudoAtual.includes(fato)) {
        return { ok: true, ja_existia: true }
      }
      if (atual) {
        const novo = `${conteudoAtual.trimEnd()}\n${linha}\n`
        const { error } = await ctx.db.from('memoria_clientes')
          .update({ conteudo_md: novo, versao: (atual.versao ?? 1) + 1, updated_at: new Date().toISOString() })
          .eq('id', atual.id)
        if (error) throw new Error(error.message)
      } else {
        const inicial = `# Memória — ${str(cli.nome) ?? 'cliente'}\n\n${linha}\n`
        const { error } = await ctx.db.from('memoria_clientes').insert({ cliente_id: id, conteudo_md: inicial })
        if (error) throw new Error(error.message)
      }
      return { ok: true }
    },
    resumo: () => 'Anotou no cliente',
  },

  // ════ EMAIL ═══════════════════════════════════════════════════════════════

  listar_templates_email: {
    declaration: {
      name: 'listar_templates_email',
      description: 'Lista os templates de email disponíveis (fixos e personalizados) com id, nome e assunto. Use antes de enviar_email para escolher o template certo.',
      parameters: { type: T.OBJECT, properties: {} },
    },
    execute: async (_args, ctx) => {
      const { data, error } = await ctx.db
        .from('email_templates')
        .select('id, nome, descricao, custom')
        .order('nome')
      if (error) throw new Error(error.message)
      return { total: (data ?? []).length, templates: data ?? [] }
    },
    resumo: () => 'Consultou templates de email',
  },

  enviar_email: {
    declaration: {
      name: 'enviar_email',
      description: 'Envia um email REAL a um cliente usando um template (via Resend, registrado em email_logs). AÇÃO EXTERNA E IRREVERSÍVEL: só chame depois que o usuário confirmar explicitamente o envio nesta conversa (template + destinatário). Nunca envie por iniciativa própria.',
      parameters: {
        type: T.OBJECT,
        properties: {
          cliente_id:  { type: T.STRING, description: 'Cliente destinatário (usa o email do cadastro)' },
          template_id: { type: T.STRING, description: 'Nome OU id do template (veja listar_templates_email; aceita personalizados custom-*) — o sistema resolve.' },
          observacao:  { type: T.STRING, description: 'Texto extra disponível como {{observacao}} no template (opcional)' },
          confirmar:   { type: T.BOOLEAN, description: 'true SOMENTE depois que o Lucas autorizar explicitamente ESTE envio. Sem isso, a chamada só pede confirmação.' },
        },
        required: ['cliente_id', 'template_id'],
      },
    },
    execute: async (args, ctx) => {
      const cid = str(args.cliente_id)
      if (!cid) throw new Error('cliente_id é obrigatório.')
      // id de template é texto (slug/custom-*), não UUID → idTexto.
      const tpl = await resolverEntidade(ctx, 'email_templates', str(args.template_id), 'nome', { idTexto: true })
      const templateId = String(tpl.id)
      const cliente = await ownCliente(ctx, cid, 'id, nome, email')
      const email = (cliente.email as string | null)?.trim()
      if (!email) throw new Error(`Cliente ${cliente.nome} não tem email cadastrado.`)

      const { assunto } = await enviarEmailManual(ctx.db, {
        templateId,
        destinatario: email,
        clienteId:    cid,
        variables: {
          nome_cliente: cliente.nome as string,
          nome:         cliente.nome as string,
          observacao:   str(args.observacao) ?? '',
        },
      })
      return { ok: true, destinatario: email, assunto }
    },
    resumo: (args) => `Email enviado (template ${str(args.template_id)})`,
  },

  // ════ SISTEMA ═════════════════════════════════════════════════════════════

  status_sistema: {
    declaration: {
      name: 'status_sistema',
      description: 'Verifica em tempo real o status das integrações do Hub: Google Ads, Asaas, Vertex AI, GA4 e Resend (email). Use quando perguntarem se as APIs estão funcionando.',
      parameters: { type: T.OBJECT, properties: {} },
    },
    execute: async (_args, ctx) => {
      const res = await fetch(`${ctx.origin}/api/status`, {
        headers: { cookie: ctx.cookie },
        signal:  AbortSignal.timeout(45000),
      })
      if (!res.ok) throw new Error(`Status check falhou: HTTP ${res.status}`)
      return await res.json()
    },
    resumo: () => 'Verificou status das APIs',
  },

  prontidao_sistema: {
    declaration: {
      name: 'prontidao_sistema',
      description: 'Checklist de prontidão do Hub: o que falta configurar (credenciais, CRON_SECRET, automações, TEST_MODE, clientes sem IDs Google), com % de completude e passos de como resolver cada item. Use quando perguntarem "o que falta configurar?" ou ao diagnosticar por que algo não funciona.',
      parameters: { type: T.OBJECT, properties: {} },
    },
    execute: async (_args, ctx) => {
      return await computarSetupChecklist(ctx.db, ctx.userId)
    },
    resumo: () => 'Verificou a prontidão do sistema',
  },

  mapa_do_sistema: {
    declaration: {
      name: 'mapa_do_sistema',
      description: 'Autoconhecimento do Hub: o que cada módulo faz, integrações, crons, lacunas conhecidas do produto e o estado real dos toggles de automação. Use para responder "como o sistema funciona", avaliar o que está configurado e embasar sugestões de melhoria ou novas funções.',
      parameters: { type: T.OBJECT, properties: {} },
    },
    execute: async (_args, ctx) => {
      const { data: automacoes } = await ctx.db
        .from('automation_settings')
        .select('tipo, ativa, descricao, ultimo_envio')
        .order('tipo')
      return {
        mapa: SYSTEM_MAP,
        automacoes_toggles: automacoes ?? [],
      }
    },
    resumo: () => 'Consultou o mapa do sistema',
  },

  listar_agendamentos: {
    declaration: {
      name: 'listar_agendamentos',
      description: 'Lista os agendamentos automáticos do Hub (cron_settings): sync de analytics, briefing, import Asaas, alertas, cobrança e arquivar congelados — com horário configurado (fuso de Brasília), ativo/inativo, último run e parâmetro (param_int, ex.: dias de congelamento até arquivar). Use quando perguntarem quando ou se um job automático roda. Configuração: Configurações → Automações → Agendamentos.',
      parameters: { type: T.OBJECT, properties: {} },
    },
    execute: async (_args, ctx) => {
      const { data, error } = await ctx.db
        .from('cron_settings')
        .select('tipo, nome, descricao, ativo, horario, param_int, ultimo_run')
        .order('horario')
      if (error) {
        return { agendamentos: [], aviso: 'Tabela cron_settings ainda não migrada — jobs rodam nos horários padrão.' }
      }
      return { agendamentos: data ?? [] }
    },
    resumo: () => 'Listou os agendamentos automáticos',
  },

  buscar: {
    declaration: {
      name: 'buscar',
      description: 'Busca global por um termo em clientes, tarefas, prospects e posts. Útil para resolver nomes citados pelo usuário.',
      parameters: {
        type: T.OBJECT,
        properties: { termo: { type: T.STRING } },
        required: ['termo'],
      },
    },
    execute: async (args, ctx) => {
      const termo = str(args.termo)
      if (!termo) throw new Error('termo é obrigatório.')
      const like = `%${termo}%`
      const [clientes, tarefas, prospects, posts] = await Promise.all([
        ctx.db.from('clientes').select('id, nome, status, mrr').eq('user_id', ctx.userId).or(`nome.ilike.${like},nicho.ilike.${like},email.ilike.${like}`).limit(10),
        ctx.db.from('tarefas').select('id, titulo, status, prioridade').eq('user_id', ctx.userId).ilike('titulo', like).limit(10),
        ctx.db.from('prospects').select('id, nome, estagio').ilike('nome', like).limit(10),
        ctx.db.from('posts_marketing').select('id, titulo, status').eq('user_id', ctx.userId).ilike('titulo', like).limit(10),
      ])
      return {
        clientes:  clientes.data ?? [],
        tarefas:   tarefas.data ?? [],
        prospects: prospects.data ?? [],
        posts:     posts.data ?? [],
      }
    },
    resumo: (args) => `Buscou "${str(args.termo)}"`,
  },
}

export const FUNCTION_DECLARATIONS: FunctionDeclaration[] =
  Object.values(TOOLS).map((t) => t.declaration)

// ── Robustez do dispatcher (auditoria 26/06) ───────────────────────────────────
// O código não confia cego no que o modelo produz. Dois pontos de estrangulamento:
// (1) idempotência por turno p/ tools de ESCRITA; (2) gate de confirmação p/ ação
// IRREVERSÍVEL. Centralizados aqui em vez de espalhados tool a tool.

/** Tools que escrevem no banco — sujeitas à idempotência por turno. */
const TOOLS_MUTANTES = new Set<string>([
  'criar_cliente', 'atualizar_cliente',
  'criar_tarefa', 'criar_tarefa_de_template', 'atualizar_tarefa', 'excluir_tarefa',
  'criar_lancamento',
  'criar_notificacao',
  'criar_post_marketing',
  'criar_prospect', 'atualizar_prospect',
  'esquecer_memoria', 'atualizar_memoria_cliente',
  'enviar_email',
])

/** Tools IRREVERSÍVEIS — exigem confirmação que NÃO depende só do prompt: o código
 *  recusa executar sem confirmar:true, e recusa a IA confirmar a si mesma no turno. */
const TOOLS_CONFIRMACAO = new Set<string>(['enviar_email', 'excluir_tarefa', 'esquecer_memoria'])

/** Chave estável de uma ação (nome + args ordenados, ignorando 'confirmar'). */
function chaveAcao(nome: string, args: Args): string {
  const limpo: Args = {}
  for (const k of Object.keys(args).sort()) if (k !== 'confirmar') limpo[k] = args[k]
  return `${nome}|${JSON.stringify(limpo)}`
}

/** Executa uma ferramenta com tratamento de erro — o erro volta ao modelo, que decide como reagir. */
export async function executarFerramenta(
  nome: string,
  args: Args,
  ctx: ToolCtx,
): Promise<{ resultado: unknown; meta: ToolExecutada }> {
  const tool = TOOLS[nome]
  if (!tool) {
    return { resultado: { erro: `Ferramenta desconhecida: ${nome}` }, meta: { nome, resumo: `Ferramenta inválida` } }
  }
  try {
    // Canonicaliza cliente_id num ponto só: o modelo às vezes inventa UUID. Aceitamos
    // NOME ou id e resolvemos para o id real aqui — assim um id alucinado não chega
    // às ferramentas (e passar o nome simplesmente funciona, em todas elas).
    if (typeof args?.cliente_id === 'string' && args.cliente_id.trim()) {
      const cli = await ownCliente(ctx, args.cliente_id)
      args = { ...args, cliente_id: String(cli.id) }
    }

    // Gate de confirmação: ação IRREVERSÍVEL não roda sem confirmar:true — e a trava
    // está no CÓDIGO, não só no prompt. A 1ª chamada (sem confirmar) registra o pedido
    // e devolve "requer confirmação"; um confirmar:true para a MESMA ação no mesmo turno
    // é recusado, então a IA não confirma a si mesma — a autorização tem que vir do
    // Lucas num próximo turno. (Pré-autorização dele na própria mensagem → 1 turno.)
    if (TOOLS_CONFIRMACAO.has(nome)) {
      const chave = chaveAcao(nome, args ?? {})
      if (args?.confirmar !== true) {
        ctx.confirmacoesPedidas?.add(chave)
        return {
          resultado: { requer_confirmacao: true, instrucao: `Ação irreversível: ${tool.resumo(args ?? {})}. Anuncie em uma linha e peça o ok do Lucas; só repita com confirmar:true depois que ELE autorizar. Não confirme você mesma.` },
          meta: { nome, resumo: `Aguardando confirmação: ${tool.resumo(args ?? {})}` },
        }
      }
      if (ctx.confirmacoesPedidas?.has(chave)) {
        return {
          resultado: { erro: 'Confirmação inválida: você não pode confirmar a própria ação no mesmo turno. Pergunte ao Lucas e aguarde a resposta dele numa próxima mensagem.' },
          meta: { nome, resumo: `Confirmação negada: ${tool.resumo(args ?? {})}` },
        }
      }
    }

    // Idempotência por turno: tool de escrita com os MESMOS args não roda duas vezes
    // na mesma resposta. Memoiza a PROMISE (reserva síncrona antes do await), então
    // pega também chamadas idênticas no mesmo lote (Promise.all), não só em iterações
    // seguintes. Mata a duplicação por re-execução do loop — inclusive financeira.
    if (TOOLS_MUTANTES.has(nome) && ctx.dedupe) {
      const chave = chaveAcao(nome, args ?? {})
      const emAndamento = ctx.dedupe.get(chave)
      if (emAndamento) {
        const anterior = await emAndamento
        return {
          resultado: { idempotente: true, aviso: 'Ação idêntica já executada neste turno — ignorada para não duplicar.', anterior },
          meta: { nome, resumo: `(já feito) ${tool.resumo(args ?? {})}` },
        }
      }
      const p = tool.execute(args ?? {}, ctx)
      ctx.dedupe.set(chave, p)
      const resultado = await p
      return { resultado, meta: { nome, resumo: tool.resumo(args ?? {}) } }
    }

    const resultado = await tool.execute(args ?? {}, ctx)
    return { resultado, meta: { nome, resumo: tool.resumo(args ?? {}) } }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { resultado: { erro: msg }, meta: { nome, resumo: `Falhou: ${tool.resumo(args ?? {})}` } }
  }
}
