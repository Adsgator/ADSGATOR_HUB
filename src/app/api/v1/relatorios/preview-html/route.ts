import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderTemplate, EMAIL_TEMPLATES } from '@/lib/email'
import type { EmailTemplateId } from '@/lib/types/email'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  // Aceita template_id e templateId (a UI usa camelCase).
  const template_id = (body.template_id ?? body.templateId) as EmailTemplateId
  const variables = (body.variables ?? {}) as Record<string, string>
  // html_override permite pré-visualizar a edição ao vivo (antes de salvar).
  const htmlOverrideBody = body.html_override as string | undefined
  const subjectOverrideBody = body.subject_override as string | undefined

  const template = EMAIL_TEMPLATES[template_id]
  if (!template) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })

  const enrichedVars = {
    dashboard_url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://adsgator.com.br',
    ...variables,
  }

  // Prioridade: override do body (edição ao vivo) > override salvo no banco > código.
  let htmlBase = htmlOverrideBody
  let subjectBase = subjectOverrideBody
  if (htmlBase === undefined || subjectBase === undefined) {
    const { data: saved } = await supabase
      .from('email_templates')
      .select('subject_override, html_override')
      .eq('id', template_id)
      .maybeSingle()
    htmlBase = htmlBase ?? saved?.html_override ?? template.buildHtml(enrichedVars)
    subjectBase = subjectBase ?? saved?.subject_override ?? template.subject
  }

  const html = renderTemplate(htmlBase ?? template.buildHtml(enrichedVars), enrichedVars)
  const subject = renderTemplate(subjectBase ?? template.subject, enrichedVars)

  return NextResponse.json({ html, subject })
}
