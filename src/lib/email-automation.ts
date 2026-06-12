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
    await sendEmail({ to: destinatario, subject, html })
    await supabase.from('email_logs').insert({
      cliente_id:    clienteId ?? null,
      destinatario,
      template_tipo: templateId,
      assunto:       subject,
      status:        'enviado',
    })
    return { assunto: subject }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    try {
      await supabase.from('email_logs').insert({
        cliente_id:    clienteId ?? null,
        destinatario,
        template_tipo: templateId,
        assunto:       subject,
        status:        'falha',
        mensagem_erro: msg,
      })
    } catch { /* log de falha é best-effort */ }
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
    await sendEmail({ to: destinatario, subject, html })

    await supabase.from('email_logs').insert({
      cliente_id: clienteId ?? null,
      destinatario,
      template_tipo: templateId,
      assunto: subject,
      status: 'enviado',
    })

    // Marca o último envio da automação.
    await supabase
      .from('automation_settings')
      .update({ ultimo_envio: new Date().toISOString() })
      .eq('tipo', tipo)

    return { enviado: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    try {
      await supabase.from('email_logs').insert({
        cliente_id: clienteId ?? null,
        destinatario,
        template_tipo: templateId,
        assunto: subject,
        status: 'falha',
        mensagem_erro: msg,
      })
    } catch { /* log de falha é best-effort */ }
    return { enviado: false, motivo: 'erro', erro: msg }
  }
}
