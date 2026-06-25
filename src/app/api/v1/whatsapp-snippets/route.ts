import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WHATSAPP_SNIPPETS_SEED } from '@/lib/whatsapp'

/**
 * GET /api/v1/whatsapp-snippets
 * Lista a biblioteca de mensagens de WhatsApp (tabela whatsapp_snippets).
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('whatsapp_snippets')
    .select('id, titulo, mensagem, categoria, ordem, seed, atualizado_em')
    .order('ordem')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Marca quais snippets-seed foram editados em relação ao código (permite "restaurar").
  const seedMap = new Map(WHATSAPP_SNIPPETS_SEED.map((s) => [s.id, s]))
  const snippets = (data ?? []).map((row) => ({
    ...row,
    editado: row.seed && seedMap.get(row.id)?.mensagem !== row.mensagem,
  }))

  return NextResponse.json({ snippets })
}

/**
 * POST /api/v1/whatsapp-snippets
 * Cria uma mensagem personalizada (seed=false).
 * Body: { titulo, mensagem, categoria? }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json() as { titulo?: string; mensagem?: string; categoria?: string }
  if (!body.titulo?.trim() || !body.mensagem?.trim()) {
    return NextResponse.json({ error: 'titulo e mensagem são obrigatórios' }, { status: 400 })
  }

  const slug = body.titulo.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  if (!slug) return NextResponse.json({ error: 'Título inválido' }, { status: 400 })

  const { data: existente } = await supabase.from('whatsapp_snippets').select('id').eq('id', slug).maybeSingle()
  if (existente) {
    return NextResponse.json({ error: `Já existe uma mensagem com esse título — escolha outro.` }, { status: 409 })
  }

  // Coloca novos snippets ao final da ordenação.
  const { data: maxRow } = await supabase
    .from('whatsapp_snippets').select('ordem').order('ordem', { ascending: false }).limit(1).maybeSingle()
  const ordem = (maxRow?.ordem ?? 0) + 10

  const { error } = await supabase.from('whatsapp_snippets').insert({
    id:             slug,
    titulo:         body.titulo.trim(),
    mensagem:       body.mensagem,
    categoria:      body.categoria?.trim() || 'outros',
    ordem,
    seed:           false,
    atualizado_em:  new Date().toISOString(),
    atualizado_por: user.id,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: slug }, { status: 201 })
}

/**
 * PATCH /api/v1/whatsapp-snippets
 * Edita uma mensagem, ou restaura um snippet-seed ao padrão do código.
 * Body: { id, titulo?, mensagem?, categoria? }  |  { id, restaurar: true }
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json() as {
    id?: string; titulo?: string; mensagem?: string; categoria?: string; restaurar?: boolean
  }
  if (!body.id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })

  const update: Record<string, unknown> = {
    atualizado_em: new Date().toISOString(),
    atualizado_por: user.id,
  }

  if (body.restaurar) {
    const seed = WHATSAPP_SNIPPETS_SEED.find((s) => s.id === body.id)
    if (!seed) return NextResponse.json({ error: 'Mensagem sem padrão para restaurar' }, { status: 400 })
    update.titulo = seed.titulo
    update.mensagem = seed.mensagem
    update.categoria = seed.categoria
  } else {
    if (body.titulo !== undefined)    update.titulo = body.titulo.trim()
    if (body.mensagem !== undefined)  update.mensagem = body.mensagem
    if (body.categoria !== undefined) update.categoria = body.categoria.trim() || 'outros'
  }

  const { error } = await supabase.from('whatsapp_snippets').update(update).eq('id', body.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

/**
 * DELETE /api/v1/whatsapp-snippets?id=<slug>
 * Exclui uma mensagem. Snippets-seed (do código) não podem ser removidos —
 * use Restaurar para desfazer edições.
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })

  const { data: row } = await supabase.from('whatsapp_snippets').select('seed').eq('id', id).maybeSingle()
  if (!row) return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 })
  if (row.seed) {
    return NextResponse.json({ error: 'Mensagens padrão não podem ser excluídas — use Restaurar.' }, { status: 400 })
  }

  const { error } = await supabase.from('whatsapp_snippets').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
