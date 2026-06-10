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

    // ── Timeline alerts ─────────────────────────────────────────────────────
    try {
      const { data: timelineAlerts } = await supabase
        .from('timeline_alerts')
        .select('*')
        .eq('enabled', true)

      for (const alert of (timelineAlerts ?? [])) {
        const alertType: string = alert.alert_type
        const config: Record<string, number> = alert.config ?? {}
        const clientId: string | null = alert.client_id ?? null

        let violated = false
        let message = ''
        let context: Record<string, unknown> = {}

        if (alertType === 'ads_balance_low') {
          const minBalance: number = config.min_balance ?? 50
          let query = supabase.from('clientes').select('id, nome, saldo_google_ads').not('saldo_google_ads', 'is', null).lt('saldo_google_ads', minBalance)
          if (clientId) query = query.eq('id', clientId)
          const { data: rows } = await query
          if ((rows ?? []).length > 0) {
            violated = true
            const names = (rows ?? []).map((r: { nome: string }) => r.nome).join(', ')
            message = `Saldo Google Ads abaixo do mínimo (R$ ${minBalance}): ${names}`
            context = { clientes: rows, min_balance: minBalance }
          }
        } else if (alertType === 'cpc_high') {
          const maxCpc: number = config.max_cpc ?? 5
          let query = supabase.from('analytics_snapshots').select('cliente_id, investimento, cliques').order('created_at', { ascending: false }).limit(50)
          if (clientId) query = query.eq('cliente_id', clientId)
          const { data: snaps } = await query
          const violators = (snaps ?? []).filter((s: { investimento: number; cliques: number }) => s.cliques > 0 && s.investimento / s.cliques > maxCpc)
          if (violators.length > 0) {
            violated = true
            message = `CPC alto detectado (limite: R$ ${maxCpc})`
            context = { snapshots: violators, max_cpc: maxCpc }
          }
        } else if (alertType === 'payment_overdue') {
          const daysOverdue: number = config.days_overdue ?? 1
          let query = supabase.from('clientes').select('id, nome, dias_atraso').gt('dias_atraso', daysOverdue)
          if (clientId) query = query.eq('id', clientId)
          const { data: rows } = await query
          if ((rows ?? []).length > 0) {
            violated = true
            const names = (rows ?? []).map((r: { nome: string; dias_atraso: number }) => `${r.nome} (D+${r.dias_atraso})`).join(', ')
            message = `Pagamento atrasado > ${daysOverdue} dia(s): ${names}`
            context = { clientes: rows, days_overdue: daysOverdue }
          }
        }

        if (!violated) continue

        // Dedup: check last 24h
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { data: recent } = await supabase
          .from('timeline_alert_history')
          .select('id, triggered_at, acknowledged_at')
          .eq('alert_id', alert.id)
          .gte('triggered_at', since)
          .order('triggered_at', { ascending: false })
          .limit(1)

        if ((recent ?? []).length > 0) {
          // Check escalation: unacknowledged for > escalate_after_hours
          const last = (recent as Array<{ id: string; triggered_at: string; acknowledged_at: string | null }>)[0]
          if (!last.acknowledged_at) {
            const hoursElapsed = (Date.now() - new Date(last.triggered_at).getTime()) / (1000 * 60 * 60)
            if (hoursElapsed > (alert.escalate_after_hours ?? 4)) {
              await supabase.from('timeline_alerts').update({ severity: 'critical' }).eq('id', alert.id)
            }
          }
          // Skip inserting duplicate
          continue
        }

        await supabase.from('timeline_alert_history').insert({
          alert_id:     alert.id,
          client_id:    clientId,
          alert_type:   alertType,
          severity:     alert.severity ?? 'warning',
          message,
          context,
          triggered_at: new Date().toISOString(),
          is_duplicate: false,
        })

        alertasCriados.push(`timeline_alert:${alertType}:${alert.id}`)
      }
    } catch (taErr) {
      console.warn('timeline_alerts check failed (non-critical):', taErr)
    }

    return new Response(JSON.stringify({ alertas_criados: alertasCriados.length, detalhes: alertasCriados }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('sentinela error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
