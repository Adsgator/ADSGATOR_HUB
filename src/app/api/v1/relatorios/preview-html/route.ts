import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderTemplate, EMAIL_TEMPLATES } from '@/lib/email'
import type { EmailTemplateId } from '@/lib/types/email'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { template_id, variables = {} } = body as { template_id: EmailTemplateId; variables?: Record<string, string> }

  const template = EMAIL_TEMPLATES[template_id]
  if (!template) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })

  const enrichedVars = {
    dashboard_url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://adsgator.com.br',
    ...variables,
  }

  const html = renderTemplate(template.buildHtml(enrichedVars), enrichedVars)
  const subject = renderTemplate(template.subject, enrichedVars)

  return NextResponse.json({ html, subject })
}
