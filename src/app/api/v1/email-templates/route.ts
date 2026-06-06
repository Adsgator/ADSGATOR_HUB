import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EMAIL_TEMPLATES } from '@/lib/email'
import type { EmailTemplateId } from '@/lib/types/email'

/**
 * GET /api/v1/email-templates
 * Lista os templates com o conteúdo efetivo (override do banco ou base do código).
 * Útil para preencher o editor: o usuário vê o HTML atual e pode editá-lo.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: rows } = await supabase
    .from('email_templates')
    .select('id, nome, descricao, subject_override, html_override, atualizado_em')
    .order('nome')

  // Os templates do código interpolam variáveis via ${v.x}. Para o editor
  // mostrar placeholders legíveis ({{x}}) em vez de '—', passamos um proxy que
  // devolve {{chave}} para qualquer variável acessada ao montar o HTML base.
  const placeholderProxy = new Proxy({} as Record<string, string>, {
    get: (_t, prop: string) => `{{${prop}}}`,
  })

  const templates = (rows ?? []).map((row) => {
    const base = EMAIL_TEMPLATES[row.id as EmailTemplateId]
    return {
      id: row.id,
      nome: row.nome,
      descricao: row.descricao,
      subject_efetivo: row.subject_override ?? base?.subject ?? '',
      html_efetivo: row.html_override ?? base?.buildHtml(placeholderProxy) ?? '',
      editado: row.subject_override != null || row.html_override != null,
      atualizado_em: row.atualizado_em,
    }
  })

  return NextResponse.json({ templates })
}

/**
 * PATCH /api/v1/email-templates
 * Salva (ou limpa) o override de um template.
 * Body: { id, subject_override?, html_override? }
 * Passar null em um campo restaura o default do código para aquele campo.
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { id, subject_override, html_override } = body as {
    id: EmailTemplateId
    subject_override?: string | null
    html_override?: string | null
  }

  if (!id || !EMAIL_TEMPLATES[id]) {
    return NextResponse.json({ error: 'Template inválido' }, { status: 400 })
  }

  const update: Record<string, unknown> = {
    atualizado_em: new Date().toISOString(),
    atualizado_por: user.id,
  }
  if (subject_override !== undefined) update.subject_override = subject_override
  if (html_override !== undefined) update.html_override = html_override

  const { error } = await supabase.from('email_templates').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
