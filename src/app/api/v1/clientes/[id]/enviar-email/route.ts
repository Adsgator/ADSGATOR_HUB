import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enviarEmailManual } from '@/lib/email-automation'
import type { EmailTemplateId } from '@/lib/types/email'

/**
 * POST /api/v1/clientes/[id]/enviar-email
 * Envio MANUAL de um template ao cliente (respeita o modo teste, ignora o toggle
 * de automação). Usado pelo botão "enviar email" das etapas do onboarding.
 * Body: { templateId, variables? }
 */

// Por ora, só os emails de onboarding podem ser enviados por esta rota — o
// disparo manual de cobrança/relatório tem fluxos próprios.
const TEMPLATES_PERMITIDOS: EmailTemplateId[] = [
  'onboarding-briefing-recebido',
  'onboarding-pagina-pronta',
  'onboarding-acessos-google',
]

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => ({})) as { templateId?: string; variables?: Record<string, string> }
  const templateId = body.templateId as EmailTemplateId | undefined

  if (!templateId || !TEMPLATES_PERMITIDOS.includes(templateId)) {
    return NextResponse.json({ error: 'Template inválido para envio manual.' }, { status: 400 })
  }

  const { data: cliente } = await supabase
    .from('clientes')
    .select('nome, email')
    .eq('id', id)
    .maybeSingle()

  if (!cliente?.email) {
    return NextResponse.json({ error: 'Cliente sem email cadastrado.' }, { status: 400 })
  }

  try {
    const { assunto } = await enviarEmailManual(supabase, {
      templateId,
      destinatario: cliente.email,
      clienteId: id,
      variables: { nome_cliente: cliente.nome ?? '', ...(body.variables ?? {}) },
    })
    return NextResponse.json({ enviado: true, assunto })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
