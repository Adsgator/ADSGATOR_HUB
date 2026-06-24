import type { SupabaseClient } from '@supabase/supabase-js'
import { sendEmail, renderTemplate, EMAIL_TEMPLATES } from '@/lib/email'
import type { EmailTemplateId } from '@/lib/types/email'

/**
 * Disparo de emails AUTOMÁTICOS, controlado por toggles.
 *
 * Toda automação é DESATIVADA por padrão (automation_settings.ativa = false).
 * O envio só acontece se o toggle do tipo estiver ligado — assim nenhum email
 * sai sem o operador ter habilitado explicitamente.
 *
 * Tipos de automação (automation_settings.tipo):
 *  - email_relatorio_mensal  → relatório pronto vira email ao cliente
 *  - email_cobranca_vencida  → régua de cobrança por email ao cliente
 *  - email_alerta_critico    → alertas internos por email ao operador
 */

export type TipoAutomacao =
  | 'email_relatorio_mensal'
  | 'email_cobranca_vencida'
  | 'email_alerta_critico'

interface DispararParams {
  tipo: TipoAutomacao
  templateId: EmailTemplateId
  destinatario: string
  clienteId?: string
  variables?: Record<string, string>
  assuntoOverride?: string
}

export interface ResultadoDisparo {
  enviado: boolean
  motivo?: 'automacao_desativada' | 'sem_destinatario' | 'erro'
  erro?: string
}

/**
 * MODO TESTE — rede de segurança. Quando ligado (email_config.modo_teste),
 * todo email é redirecionado para o operador (email_teste ou env ALERT_EMAIL)
 * e o assunto ganha o prefixo [TESTE], para nada sair para o cliente real por
 * engano. Começa ligado por padrão (ver migration).
 */
async function lerModoTeste(
  supabase: SupabaseClient,
): Promise<{ ativo: boolean; destino: string }> {
  const { data, error } = await supabase
    .from('email_config')
    .select('modo_teste, email_teste')
    .eq('id', true)
    .maybeSingle()
  const destino = data?.email_teste || process.env.ALERT_EMAIL || ''
  // Fail-safe: se a config não existe ou houve erro de leitura, assume modo
  // teste LIGADO — nunca arrisca enviar para o cliente real por engano.
  if (error || !data) return { ativo: true, destino }
  return { ativo: data.modo_teste === true, destino }
}

/**
 * Envia (já com renderização feita) aplicando o modo teste e registra em
 * email_logs. Centraliza o que era duplicado entre envio manual e automático.
 * Lança em caso de erro de envio (após logar a falha) — o chamador decide.
 */
async function enviarComLog(
  supabase: SupabaseClient,
  params: { templateId: string; destinatario: string; clienteId?: string; subject: string; html: string },
): Promise<{ assunto: string; modoTeste: boolean }> {
  const { templateId, destinatario, clienteId, html } = params
  const teste = await lerModoTeste(supabase)

  // Modo teste sem destino configurado: NÃO envia para o cliente real. Registra
  // a falha explicativa e aborta — o operador precisa definir o email de teste.
  if (teste.ativo && !teste.destino) {
    const msg = 'Modo teste ligado, mas sem email de teste configurado (defina em Configurações → Comunicação ou a env ALERT_EMAIL).'
    try {
      await supabase.from('email_logs').insert({
        cliente_id: clienteId ?? null, destinatario, template_tipo: templateId,
        assunto: `[TESTE] ${params.subject}`, status: 'falha', mensagem_erro: msg, modo_teste: true,
      })
    } catch { /* best-effort */ }
    throw new Error(msg)
  }

  // No modo teste, redireciona o destino para o operador e marca o assunto.
  const destinoFinal = teste.ativo ? teste.destino : destinatario
  const subject = teste.ativo ? `[TESTE] ${params.subject}` : params.subject

  try {
    await sendEmail({ to: destinoFinal, subject, html })
    await supabase.from('email_logs').insert({
      cliente_id:    clienteId ?? null,
      destinatario:  destinoFinal,
      template_tipo: templateId,
      assunto:       subject,
      status:        'enviado',
      modo_teste:    teste.ativo,
    })
    return { assunto: subject, modoTeste: teste.ativo }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    try {
      await supabase.from('email_logs').insert({
        cliente_id:    clienteId ?? null,
        destinatario:  destinoFinal,
        template_tipo: templateId,
        assunto:       subject,
        status:        'falha',
        mensagem_erro: msg,
        modo_teste:    teste.ativo,
      })
    } catch { /* log de falha é best-effort */ }
    throw new Error(msg)
  }
}

/**
 * Resolve o conteúdo efetivo de um template: override do banco > base do código.
 * Aceita ids customizados (custom-<slug>, criados pela UI): sem base no código,
 * o conteúdo integral vem de subject_override/html_override.
 */
export async function resolverTemplateEmail(
  supabase: SupabaseClient,
  templateId: string,
): Promise<{ subject: string; html: string }> {
  const base = EMAIL_TEMPLATES[templateId as EmailTemplateId]

  const { data: row } = await supabase
    .from('email_templates')
    .select('subject_override, html_override')
    .eq('id', templateId)
    .maybeSingle()

  if (!base && !row) {
    throw new Error(`Template de email "${templateId}" não existe.`)
  }

  const subject = row?.subject_override ?? base?.subject
  const html    = row?.html_override ?? (base ? base.buildHtml(new Proxy({} as Record<string, string>, {
    get: (_t, prop: string) => `{{${prop}}}`,
  })) : undefined)

  if (!subject || !html) {
    throw new Error(`Template "${templateId}" está sem assunto ou corpo — edite-o em Configurações → Templates de Email.`)
  }
  return { subject, html }
}

/**
 * Envio MANUAL por template (sem checagem de toggle — usado pela Gator com
 * confirmação explícita do usuário). Resolve override/custom, envia e loga.
 */
export async function enviarEmailManual(
  supabase: SupabaseClient,
  params: { templateId: string; destinatario: string; clienteId?: string; variables?: Record<string, string> },
): Promise<{ assunto: string }> {
  const { templateId, destinatario, clienteId, variables = {} } = params
  const resolved = await resolverTemplateEmail(supabase, templateId)

  const enrichedVars = {
    dashboard_url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://adsgator.com.br',
    ...variables,
  }
  const subject = renderTemplate(resolved.subject, enrichedVars)
  const html    = renderTemplate(resolved.html, enrichedVars)

  try {
    const { assunto } = await enviarComLog(supabase, { templateId, destinatario, clienteId, subject, html })
    return { assunto }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Falha no envio: ${msg}`)
  }
}

/** Uma automação está ligada? */
export async function automacaoAtiva(
  supabase: SupabaseClient,
  tipo: TipoAutomacao,
): Promise<boolean> {
  const { data } = await supabase
    .from('automation_settings')
    .select('ativa')
    .eq('tipo', tipo)
    .maybeSingle()
  return data?.ativa === true
}

/**
 * Dispara um email automático SE a automação correspondente estiver ativa.
 * Resolve override do template (banco) com fallback no código, envia via Resend
 * e registra em email_logs. Nunca lança — retorna o resultado.
 */
export async function dispararEmailAutomatico(
  supabase: SupabaseClient,
  params: DispararParams,
): Promise<ResultadoDisparo> {
  const { tipo, templateId, destinatario, clienteId, variables = {}, assuntoOverride } = params

  if (!(await automacaoAtiva(supabase, tipo))) {
    return { enviado: false, motivo: 'automacao_desativada' }
  }
  if (!destinatario) {
    return { enviado: false, motivo: 'sem_destinatario' }
  }

  const template = EMAIL_TEMPLATES[templateId]
  if (!template) {
    return { enviado: false, motivo: 'erro', erro: 'Template não encontrado' }
  }

  const enrichedVars = {
    dashboard_url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://adsgator.com.br',
    ...variables,
  }

  // Override editado pelo usuário tem prioridade.
  const { data: override } = await supabase
    .from('email_templates')
    .select('subject_override, html_override')
    .eq('id', templateId)
    .maybeSingle()

  const html = renderTemplate(override?.html_override ?? template.buildHtml(enrichedVars), enrichedVars)
  const subject = renderTemplate(assuntoOverride ?? override?.subject_override ?? template.subject, enrichedVars)

  try {
    await enviarComLog(supabase, { templateId, destinatario, clienteId, subject, html })

    // Marca o último envio da automação.
    await supabase
      .from('automation_settings')
      .update({ ultimo_envio: new Date().toISOString() })
      .eq('tipo', tipo)

    return { enviado: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { enviado: false, motivo: 'erro', erro: msg }
  }
}
