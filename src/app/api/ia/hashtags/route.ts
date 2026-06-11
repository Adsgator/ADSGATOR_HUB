import { NextRequest, NextResponse } from 'next/server'
import { MODELO_FLASH, criarVertexAI } from '@/lib/vertex-ai'
import { createClient }              from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json() as { texto: string; rede?: string }
  const { texto, rede = 'instagram' } = body

  if (!texto?.trim()) {
    return NextResponse.json({ error: 'texto é obrigatório' }, { status: 400 })
  }

  const prompt = `Gere 10 hashtags relevantes para o seguinte post de ${rede}:

"${texto.slice(0, 500)}"

Retorne APENAS as hashtags separadas por espaço, sem explicações. Exemplo: #marketing #digital #ads`

  try {
    const vertex = criarVertexAI()
    const model  = vertex.preview.getGenerativeModel({ model: MODELO_FLASH })
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    })
    const raw      = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
    const hashtags = raw.match(/#[\w\u00C0-\u024F]+/g) ?? ['#marketing', '#digital', '#ads']
    return NextResponse.json({ hashtags })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
