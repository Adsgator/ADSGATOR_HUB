import { serve }        from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { VertexAI }     from 'https://esm.sh/@google-cloud/vertexai@1'

const GEMINI_LITE = 'gemini-2.5-flash-lite'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

function criarVertexAI() {
  return new VertexAI({
    project:  Deno.env.get('VERTEX_AI_PROJECT_ID')!,
    location: Deno.env.get('VERTEX_AI_LOCATION') ?? 'us-central1',
    googleAuthOptions: { keyFilename: Deno.env.get('VERTEX_AI_CREDENTIALS') },
  })
}

interface ConfigFinanceira { saldo_google_ads_limite_alerta: number }

serve(async () => {
  const alertasCriados: string[] = []

  try {
    const { data: config } = await supabase
      .from('configuracoes_financeiras')
      .select('saldo_google_ads_limite_alerta')
      .eq('agencia_id', 'adsgator-main')
      .single()

    const limiteAlertas = (config as ConfigFinanceira | null)?.saldo_google_ads_limite_alerta ?? 50

    const { data: clientes } = await supabase
      .from('clientes')
      .select('id, nome, status, dias_atraso, saldo_google_ads')
      .in('status', ['ativo', 'onboarding', 'setup_trafego', 'recebido'])

    const problemas: string[] = []

    for (const c of (clientes ?? [])) {
      if ((c.dias_atraso ?? 0) > 0) {
        problemas.push(`${c.nome}: ${c.dias_atraso} dia(s) em atraso`)

        await supabase.from('alertas').upsert({
          tipo:      'inadimplencia',
          mensagem:  `${c.nome} está inadimplente há ${c.dias_atraso} dia(s)`,
          cliente_id: c.id,
          resolvido:  false,
        }, { onConflict: 'tipo,cliente_id', ignoreDuplicates: true })

        await supabase.from('notificacoes').insert({
          user_id:  null,
          tipo:     'alerta',
          titulo:   `Inadimplência — ${c.nome}`,
          mensagem: `${c.nome} está inadimplente há ${c.dias_atraso} dia(s)`,
          lida:     false,
        })

        alertasCriados.push(`inadimplencia:${c.id}`)
      }

      if (c.saldo_google_ads !== null && c.saldo_google_ads < limiteAlertas) {
        problemas.push(`${c.nome}: saldo Google Ads R$ ${c.saldo_google_ads}`)

        await supabase.from('alertas').upsert({
          tipo:      'saldo_google_ads',
          mensagem:  `Saldo Google Ads de ${c.nome} abaixo do limite (R$ ${c.saldo_google_ads})`,
          cliente_id: c.id,
          resolvido:  false,
        }, { onConflict: 'tipo,cliente_id', ignoreDuplicates: true })

        await supabase.from('notificacoes').insert({
          user_id:  null,
          tipo:     'alerta',
          titulo:   `Saldo Baixo — ${c.nome}`,
          mensagem: `Saldo Google Ads: R$ ${c.saldo_google_ads} (limite: R$ ${limiteAlertas})`,
          lida:     false,
        })

        alertasCriados.push(`saldo:${c.id}`)
      }
    }

    if (problemas.length > 0) {
      try {
        const vertex = criarVertexAI()
        const model  = vertex.preview.getGenerativeModel({ model: GEMINI_LITE })
        const prompt = `Você é um sentinela de agência de marketing. Há ${problemas.length} problema(s) detectado(s): ${problemas.join('; ')}. Gere 1 frase de alerta curta e direta (máx 20 palavras) para o gestor.`
        const result = await model.generateContent(prompt)
        const texto  = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
        if (texto) {
          await supabase.from('notificacoes').insert({
            user_id:  null,
            tipo:     'info',
            titulo:   'Resumo Sentinela',
            mensagem: texto,
            lida:     false,
          })
        }
      } catch (iaErr) {
        console.warn('IA sentinela falhou (non-critical):', iaErr)
      }
    }

    return new Response(JSON.stringify({ alertas_criados: alertasCriados.length, detalhes: alertasCriados }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('sentinela error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
