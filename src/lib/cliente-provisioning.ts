// ─── PROVISIONAMENTO DE CLIENTE NOVO ─────────────────────────────────────────
// Cria automaticamente a tarefa "Setup do cliente — {nome}" quando um cliente
// entra no Hub, por qualquer um dos 3 caminhos: form manual, importador Asaas
// e webhook Asaas (este último replica o insert em Deno — ver comentário
// cruzado em supabase/functions/webhook-asaas/index.ts).
//
// O checklist/prioridade/prazo vêm do template `setup-cliente` em
// tarefa_templates (editável em Configurações → Templates); o hardcoded abaixo
// é só fallback caso a migration ainda não tenha sido aplicada.

import type { SupabaseClient } from '@supabase/supabase-js'

// ⚠️ Fallback espelhado na Edge Function webhook-asaas (Deno não importa libs
// Next). Ambos leem o template do banco primeiro — só o fallback é duplicado.
const FALLBACK_SETUP = {
  titulo:     'Setup do cliente — {cliente}',
  descricao:  'Provisionamento técnico de cliente novo: conectar integrações Google, saldo e contexto.',
  prioridade: 'alto',
  prazo_dias: 5,
  checklist: [
    'Preencher Google Ads customer ID no cliente',
    'Preencher GA4 property ID no cliente',
    'Habilitar toggles google_ads_enabled / ga4_enabled',
    'Registrar saldo Google Ads inicial',
    'Criar/gerar memória .md do cliente',
    'Conferir plano e MRR cadastrados',
  ],
}

export type OrigemProvisionamento = 'form' | 'import' | 'retroativo'

export interface ResultadoProvisionamento {
  criada:     boolean
  tarefa_id?: string
  motivo?:    string
}

export async function provisionarClienteNovo(
  db: SupabaseClient,
  userId: string,
  cliente: { id: string; nome: string },
  origem: OrigemProvisionamento,
): Promise<ResultadoProvisionamento> {
  // Idempotência: uma tarefa de setup por cliente (prefixo cobre títulos
  // gerados antes de eventuais edições do template).
  const { data: existente } = await db
    .from('tarefas')
    .select('id')
    .eq('cliente_id', cliente.id)
    .ilike('titulo', 'Setup do cliente%')
    .limit(1)
    .maybeSingle()
  if (existente) {
    return { criada: false, motivo: 'Tarefa de setup já existe para este cliente.' }
  }

  // Template editável > fallback hardcoded
  const { data: tpl } = await db
    .from('tarefa_templates')
    .select('titulo, descricao, prioridade, prazo_dias, checklist')
    .eq('slug', 'setup-cliente')
    .maybeSingle()

  const titulo     = (tpl?.titulo ?? FALLBACK_SETUP.titulo).replace('{cliente}', cliente.nome)
  const descricao  = tpl?.descricao ?? FALLBACK_SETUP.descricao
  const prioridade = tpl?.prioridade ?? FALLBACK_SETUP.prioridade
  const prazoDias  = tpl?.prazo_dias ?? FALLBACK_SETUP.prazo_dias
  const itens      = (Array.isArray(tpl?.checklist) && tpl.checklist.length > 0
    ? tpl.checklist
    : FALLBACK_SETUP.checklist) as string[]

  const prazo = new Date()
  prazo.setDate(prazo.getDate() + (prazoDias ?? 5))

  const { data, error } = await db.from('tarefas').insert({
    user_id:    userId,
    titulo,
    descricao:  `${descricao}\n\n(criada automaticamente — origem: ${origem})`,
    prioridade,
    status:     'pendente',
    cliente_id: cliente.id,
    data_prazo: prazo.toISOString(),
    checklist:  itens.map((texto) => ({ id: crypto.randomUUID(), texto, concluido: false })),
  }).select('id').single()

  if (error) throw new Error(`Falha ao criar tarefa de setup: ${error.message}`)

  // Aviso de cliente novo — Lucas não descobre cliente novo por acaso. Sai junto
  // com a criação da tarefa (só chega aqui quando o cliente é realmente novo, pelo
  // guard de idempotência acima). Falha aqui não derruba o provisionamento.
  const ORIGEM_LABEL: Record<OrigemProvisionamento, string> = {
    form:       'cadastro manual',
    import:     'importação do Asaas',
    retroativo: 'provisionamento retroativo',
  }
  try {
    await db.from('notificacoes').insert({
      user_id:  userId,
      tipo:     'info',
      titulo:   `🎉 Novo cliente: ${cliente.nome}`,
      mensagem: `Entrou via ${ORIGEM_LABEL[origem]}. Confira o cadastro e inicie o onboarding na página do cliente.`,
      lida:     false,
    })
  } catch (notifErr) {
    console.error('Falha ao notificar cliente novo:', notifErr)
  }

  return { criada: true, tarefa_id: data.id }
}
