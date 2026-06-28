import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { MODELO_FLASH, criarGenAI } from '@/lib/vertex-ai'
import { extrairUso, registrarUso }   from '@/lib/ia/uso'
import { createClient }              from '@/lib/supabase/server'

// Service-role para gravar telemetria (ia_uso não tem policy de insert p/ cliente)
const service = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

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
    const ai     = criarGenAI()
    const inicio = Date.now()
    const result = await ai.models.generateContent({
      model:    MODELO_FLASH,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    })
    await registrarUso(service, {
      userId: user.id, modelo: MODELO_FLASH, contexto: 'hashtags',
      duracaoMs: Date.now() - inicio, ...extrairUso(result),
    })
    const raw      = result.text?.trim() ?? ''
    const hashtags = raw.match(/#[\w\u00C0-\u024F]+/g) ?? ['#marketing', '#digital', '#ads']
    return NextResponse.json({ hashtags })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
