import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EMAIL_TEMPLATES, EMAIL_TEMPLATE_META } from '@/lib/email'
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
    .select('id, nome, descricao, subject_override, html_override, atualizado_em, custom')
    .order('nome')

  // Os templates do código interpolam variáveis via ${v.x}. Para o editor
  // mostrar placeholders legíveis ({{x}}) em vez de '—', passamos um proxy que
  // devolve {{chave}} para qualquer variável acessada ao montar o HTML base.
  const placeholderProxy = new Proxy({} as Record<string, string>, {
    get: (_t, prop: string) => `{{${prop}}}`,
  })

  const templates = (rows ?? []).map((row) => {
    const base = EMAIL_TEMPLATES[row.id as EmailTemplateId]
    const meta = EMAIL_TEMPLATE_META[row.id as EmailTemplateId]
    return {
      id: row.id,
      nome: row.nome,
      descricao: row.descricao,
      subject_efetivo: row.subject_override ?? base?.subject ?? '',
      html_efetivo: row.html_override ?? base?.buildHtml(placeholderProxy) ?? '',
      editado: row.subject_override != null || row.html_override != null,
      custom: row.custom === true,
      categoria: meta?.categoria ?? 'outros',
      variaveis: meta?.variaveis ?? [],
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

  if (!id) {
    return NextResponse.json({ error: 'Template inválido' }, { status: 400 })
  }
  if (!EMAIL_TEMPLATES[id]) {
    // Sem base no código só é válido se for um template customizado existente
    const { data: row } = await supabase.from('email_templates').select('custom').eq('id', id).maybeSingle()
    if (!row?.custom) {
      return NextResponse.json({ error: 'Template inválido' }, { status: 400 })
    }
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

/**
 * POST /api/v1/email-templates
 * Cria um template CUSTOMIZADO (id = 'custom-<slug>', conteúdo integral nos
 * campos *_override — sem base no código).
 * Body: { nome, descricao?, subject, html }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json() as { nome?: string; descricao?: string; subject?: string; html?: string }
  if (!body.nome?.trim() || !body.subject?.trim() || !body.html?.trim()) {
    return NextResponse.json({ error: 'nome, subject e html são obrigatórios' }, { status: 400 })
  }

  const slug = body.nome.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  if (!slug) return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
  const id = `custom-${slug}`

  const { data: existente } = await supabase.from('email_templates').select('id').eq('id', id).maybeSingle()
  if (existente) {
    return NextResponse.json({ error: `Já existe um template com o id "${id}" — escolha outro nome.` }, { status: 409 })
  }

  const { error } = await supabase.from('email_templates').insert({
    id,
    nome:             body.nome.trim(),
    descricao:        body.descricao?.trim() || null,
    subject_override: body.subject.trim(),
    html_override:    body.html,
    custom:           true,
    atualizado_em:    new Date().toISOString(),
    atualizado_por:   user.id,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id }, { status: 201 })
}

/**
 * DELETE /api/v1/email-templates?id=custom-<slug>
 * Exclui um template customizado (os 12 fixos do código não podem ser removidos).
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })

  const { data: row } = await supabase.from('email_templates').select('custom').eq('id', id).maybeSingle()
  if (!row) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })
  if (!row.custom) {
    return NextResponse.json({ error: 'Templates fixos não podem ser excluídos — use Restaurar para limpar edições.' }, { status: 400 })
  }

  const { error } = await supabase.from('email_templates').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
