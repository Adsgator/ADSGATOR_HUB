import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { sendEmail, renderTemplate, EMAIL_TEMPLATES } from '@/lib/email'
import { registrarEmailHistory } from '@/lib/database'
import type { EmailTemplateId } from '@/lib/types/email'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const {
    cliente_id,
    template_id,
    destinatario,
    assunto_override,
    variables = {},
    cc,
  } = body as {
    cliente_id?: string
    template_id: EmailTemplateId
    destinatario: string
    assunto_override?: string
    variables?: Record<string, string>
    cc?: string[]
  }

  const template = EMAIL_TEMPLATES[template_id]
  if (!template) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })

  // Add dashboard URL to variables
  const enrichedVars = {
    dashboard_url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://adsgator.com.br',
    ...variables,
  }

  const html = renderTemplate(template.buildHtml(enrichedVars), enrichedVars)
  const subject = renderTemplate(assunto_override ?? template.subject, enrichedVars)

  try {
    const { id: resendId } = await sendEmail({ to: destinatario, cc, subject, html })

    // Record in email_history
    await registrarEmailHistory({
      user_id: user.id,
      cliente_id: cliente_id ?? undefined,
      template_id,
      destinatario,
      assunto: subject,
      status: 'sent',
      resend_id: resendId,
      metadata: { variables: enrichedVars },
    })

    return NextResponse.json({ success: true, resend_id: resendId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao enviar'

    // Record failure
    await registrarEmailHistory({
      user_id: user.id,
      cliente_id: cliente_id ?? undefined,
      template_id,
      destinatario,
      assunto: subject,
      status: 'failed',
      metadata: { error: msg },
    }).catch(() => {})

    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
