// ─── TOOLBOX DO AGENTE IA ─────────────────────────────────────────────────────
// Ferramentas (function calling Gemini) que dão ao agente acesso real ao Hub:
// ler e escrever clientes, tarefas, financeiro, marketing, prospecção, alertas,
// analytics, memória e status do sistema. Executadas server-side com service
// role — por isso TODA query filtra/verifica por user_id.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { FunctionDeclaration } from '@google-cloud/vertexai'
import { FunctionDeclarationSchemaType as T } from '@google-cloud/vertexai'
import { estagioInadimplencia } from '@/lib/cobranca'
import { SYSTEM_MAP } from '@/lib/ia/system-map'
import { computarSetupChecklist } from '@/lib/setup-checklist'
import { enviarEmailManual } from '@/lib/email-automation'

export interface ToolCtx {
  db:     SupabaseClient
  userId: string
  /** Para ferramentas que consultam rotas internas (ex.: /api/status) */
  origin: string
  cookie: string
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

/** Garante que o cliente pertence ao usuário; retorna o registro ou lança erro. */
async function ownCliente(ctx: ToolCtx, clienteId: string, campos = 'id, nome') {
  const { data, error } = await ctx.db
    .from('clientes')
    .select(campos)
    .eq('id', clienteId)
    .eq('user_id', ctx.userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error(`Cliente ${clienteId} não encontrado.`)
  return data as unknown as Record<string, unknown>
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
          status: { type: T.STRING, description: 'Filtrar por status: recebido, onboarding, setup_trafego, ativo, congelado, cancelado_debito, cancelado, inativo' },
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
      return { total: data.length, clientes: data }
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
          cliente_id: { type: T.STRING, description: 'ID do cliente (obtenha via listar_clientes ou buscar)' },
        },
        required: ['cliente_id'],
      },
    },
    execute: async (args, ctx) => {
      const id = str(args.cliente_id)
      if (!id) throw new Error('cliente_id é obrigatório.')
      const cliente = await ownCliente(ctx, id,
        'id, nome, email, whatsapp, nicho, website, status, mrr, plano, dias_atraso, data_vencimento, saldo_google, google_ads_enabled, ga4_enabled, congelado_em, data_criacao')
      const [assinaturas, estagios, memoria, tarefas, lancamentos, snapshots] = await Promise.all([
        ctx.db.from('assinaturas').select('plano_nome, valor_mensal, status, data_proxima_cobranca, dias_atraso').eq('cliente_id', id),
        ctx.db.from('estagios').select('nome, ativo, concluido_em, checklist').eq('cliente_id', id),
        ctx.db.from('memoria_clientes').select('conteudo_md, updated_at').eq('cliente_id', id).maybeSingle(),
        ctx.db.from('tarefas').select('id, titulo, prioridade, status, data_prazo').eq('cliente_id', id).in('status', ['pendente', 'em_progresso']),
        ctx.db.from('financeiro_lancamentos').select('tipo, descricao, valor, data, status').eq('cliente_id', id).order('data', { ascending: false }).limit(10),
        ctx.db.from('analytics_snapshots').select('fonte, periodo_inicio, periodo_fim, investimento, cliques, conversoes, cpa, sessoes').eq('cliente_id', id).order('periodo_fim', { ascending: false }).limit(4),
      ])
      return {
        cliente,
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
      description: 'Atualiza campos do cadastro de um cliente (status, MRR, contato, saldo Google etc.). Só envie os campos que mudam.',
      parameters: {
        type: T.OBJECT,
        properties: {
          cliente_id:   { type: T.STRING },
          nome:         { type: T.STRING },
          status:       { type: T.STRING, description: 'recebido, onboarding, setup_trafego, ativo, congelado, cancelado_debito, cancelado, inativo' },
          mrr:          { type: T.NUMBER },
          nicho:        { type: T.STRING },
          email:        { type: T.STRING },
          whatsapp:     { type: T.STRING },
          saldo_google: { type: T.NUMBER },
          plano:        { type: T.STRING },
          website:      { type: T.STRING },
        },
        required: ['cliente_id'],
      },
    },
    execute: async (args, ctx) => {
      const id = str(args.cliente_id)
      if (!id) throw new Error('cliente_id é obrigatório.')
      const atual = await ownCliente(ctx, id)
      const campos: Record<string, unknown> = {}
      for (const k of ['nome', 'status', 'nicho', 'email', 'whatsapp', 'plano', 'website'] as const) {
        if (str(args[k]) !== undefined) campos[k] = str(args[k])
      }
      for (const k of ['mrr', 'saldo_google'] as const) {
        if (num(args[k]) !== undefined) campos[k] = num(args[k])
      }
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
      return { ok: true, cliente: atual.nome, campos_atualizados: campos }
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
          tarefa_id:  { type: T.STRING },
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
      const id = str(args.tarefa_id)
      if (!id) throw new Error('tarefa_id é obrigatório.')
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
        properties: { tarefa_id: { type: T.STRING } },
        required: ['tarefa_id'],
      },
    },
    execute: async (args, ctx) => {
      const id = str(args.tarefa_id)
      if (!id) throw new Error('tarefa_id é obrigatório.')
      const { error } = await ctx.db.from('tarefas').delete().eq('id', id).eq('user_id', ctx.userId)
      if (error) throw new Error(error.message)
      return { ok: true }
    },
    resumo: () => 'Tarefa excluída',
  },

  // ════ FINANCEIRO ══════════════════════════════════════════════════════════

  financeiro_resumo: {
    declaration: {
      name: 'financeiro_resumo',
      description: 'DRE resumida de um mês: receitas, custos, lucro, MRR ativo e lista de inadimplentes com estágio (D+7/D+15/D+30).',
      parameters: {
        type: T.OBJECT,
        properties: {
          mes: { type: T.STRING, description: 'Formato YYYY-MM. Default: mês atual.' },
        },
      },
    },
    execute: async (args, ctx) => {
      const { inicio, fim, label } = mesRange(str(args.mes))
      const [lanc, cli] = await Promise.all([
        ctx.db.from('financeiro_lancamentos')
          .select('tipo, valor, status')
          .eq('user_id', ctx.userId)
          .gte('data', inicio).lte('data', fim)
          .neq('status', 'cancelado'),
        ctx.db.from('clientes')
          .select('nome, mrr, dias_atraso, status')
          .eq('user_id', ctx.userId),
      ])
      if (lanc.error) throw new Error(lanc.error.message)
      const receitas = (lanc.data ?? []).filter((l) => l.tipo === 'receita').reduce((s, l) => s + (l.valor ?? 0), 0)
      const custos   = (lanc.data ?? []).filter((l) => l.tipo !== 'receita').reduce((s, l) => s + (l.valor ?? 0), 0)
      const clientes = cli.data ?? []
      const inadimplentes = clientes
        .filter((c) => (c.dias_atraso ?? 0) > 0)
        .map((c) => ({ nome: c.nome, dias_atraso: c.dias_atraso, mrr: c.mrr, estagio: estagioInadimplencia(c.dias_atraso) }))
      return {
        mes: label,
        receitas, custos, lucro: receitas - custos,
        mrr_ativo: clientes.filter((c) => c.status === 'ativo').reduce((s, c) => s + (c.mrr ?? 0), 0),
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
      return { total: data.length, lancamentos: data }
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
          prospect_id:    { type: T.STRING },
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
      const id = str(args.prospect_id)
      if (!id) throw new Error('prospect_id é obrigatório.')
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
          cliente_id: { type: T.STRING },
          fonte:      { type: T.STRING, description: 'google_ads ou ga4' },
        },
        required: ['cliente_id'],
      },
    },
    execute: async (args, ctx) => {
      const id = str(args.cliente_id)
      if (!id) throw new Error('cliente_id é obrigatório.')
      await ownCliente(ctx, id)
      let q = ctx.db.from('analytics_snapshots')
        .select('fonte, periodo_inicio, periodo_fim, investimento, impressoes, cliques, ctr, conversoes, cpa, roas, cpc_medio, usuarios, sessoes, taxa_conversao')
        .eq('cliente_id', id)
        .order('periodo_fim', { ascending: false })
        .limit(12)
      const fonte = str(args.fonte)
      if (fonte) q = q.eq('fonte', fonte)
      const { data, error } = await q
      if (error) throw new Error(error.message)
      return { total: data.length, snapshots: data }
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

  // ════ MEMÓRIA ═════════════════════════════════════════════════════════════

  salvar_memoria: {
    declaration: {
      name: 'salvar_memoria',
      description: 'Salva um fato na SUA memória de longo prazo (persiste entre conversas). Use quando o usuário ensinar algo que deve ser lembrado sempre: preferências, regras da agência, contexto de clientes.',
      parameters: {
        type: T.OBJECT,
        properties: {
          conteudo: { type: T.STRING, description: 'O fato, escrito de forma autocontida (ex.: "Cliente Alfa prefere reuniões às 9h")' },
        },
        required: ['conteudo'],
      },
    },
    execute: async (args, ctx) => {
      const conteudo = str(args.conteudo)
      if (!conteudo) throw new Error('conteudo é obrigatório.')
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
        properties: { memoria_id: { type: T.STRING } },
        required: ['memoria_id'],
      },
    },
    execute: async (args, ctx) => {
      const id = str(args.memoria_id)
      if (!id) throw new Error('memoria_id é obrigatório.')
      const { error } = await ctx.db.from('ia_memoria').delete().eq('id', id).eq('user_id', ctx.userId)
      if (error) throw new Error(error.message)
      return { ok: true }
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
          template_id: { type: T.STRING, description: 'ID do template (veja listar_templates_email; aceita personalizados custom-*)' },
          observacao:  { type: T.STRING, description: 'Texto extra disponível como {{observacao}} no template (opcional)' },
        },
        required: ['cliente_id', 'template_id'],
      },
    },
    execute: async (args, ctx) => {
      const cid = str(args.cliente_id)
      const templateId = str(args.template_id)
      if (!cid || !templateId) throw new Error('cliente_id e template_id são obrigatórios.')
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
      description: 'Lista os agendamentos automáticos do Hub (cron_settings): sync de analytics, briefing, import Asaas, alertas e cobrança — com horário configurado (fuso de Brasília), ativo/inativo e último run. Use quando perguntarem quando ou se um job automático roda. Configuração: Configurações → Automações → Agendamentos.',
      parameters: { type: T.OBJECT, properties: {} },
    },
    execute: async (_args, ctx) => {
      const { data, error } = await ctx.db
        .from('cron_settings')
        .select('tipo, nome, descricao, ativo, horario, ultimo_run')
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
    const resultado = await tool.execute(args ?? {}, ctx)
    return { resultado, meta: { nome, resumo: tool.resumo(args ?? {}) } }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { resultado: { erro: msg }, meta: { nome, resumo: `Falhou: ${tool.resumo(args ?? {})}` } }
  }
}
