import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ReorderItem {
  id:       string
  posicao:  number
}

export async function POST(req: Request) {
  try {
    const body: { items: ReorderItem[] } = await req.json()
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'items inválidos' }, { status: 400 })
    }

    const supabase = await createClient()

    // Batch update usando Promise.all — cada item atualiza sua própria posição
    await Promise.all(
      body.items.map(({ id, posicao }) =>
        supabase.from('tarefas').update({ posicao }).eq('id', id)
      )
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[tarefas/reorder]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
