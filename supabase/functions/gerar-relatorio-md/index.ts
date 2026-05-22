// supabase/functions/gerar-relatorio-md/index.ts
// POST /functions/v1/gerar-relatorio-md
// Body: { cliente_id, tipo: 'analytics' | 'manifesto_landing', dados, user_id }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { cliente_id, tipo, dados, user_id } = await req.json()

    const { data: cliente } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', cliente_id)
      .single()

    let conteudo = ''

    if (tipo === 'analytics') {
      const snap = dados
      conteudo = `# Relatório de Performance — ${cliente?.nome}
**Período:** ${snap.periodo_inicio} a ${snap.periodo_fim}
**Gerado em:** ${new Date().toLocaleDateString('pt-BR')}
**Nicho:** ${cliente?.nicho}

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Investimento | R$ ${Number(snap.investimento ?? 0).toLocaleString('pt-BR')} |
| Cliques | ${Number(snap.cliques ?? 0).toLocaleString('pt-BR')} |
| CTR | ${((snap.ctr ?? 0) * 100).toFixed(2)}% |
| Conversões | ${snap.conversoes} |
| CPA | R$ ${Number(snap.cpa ?? 0).toFixed(2)} |

## Insight da IA

${snap.insight_ia ?? 'Execute a análise de IA para gerar insights.'}

## Ações Recomendadas

- [ ] Revisar palavras-chave com CPC acima da média
- [ ] Verificar qualidade dos anúncios (CTR < 2% = rever copy)
- [ ] Confirmar rastreamento de conversões no GA4

---
*Relatório gerado automaticamente pela Adsgator*`
    }

    if (tipo === 'manifesto_landing') {
      const { nicho, paleta, blocos, copy_estrategico } = dados
      conteudo = `# Manifesto de Produção — Landing Page
**Cliente:** ${cliente?.nome}
**Nicho:** ${nicho}
**Gerado em:** ${new Date().toLocaleDateString('pt-BR')}

---

## Contexto Estratégico

- **Nicho:** ${nicho}
- **Paleta de cores:** ${(paleta ?? []).join(', ')}
- **Estilo visual:** Minimalista premium, inspirado em marcas de autoridade
- **Tom de voz:** Direto, sem rodeios, focado em resultado

---

## Estrutura de Blocos Astro

\`\`\`
${(blocos ?? []).map((b: string, i: number) => `${i + 1}. ${b}`).join('\n')}
\`\`\`

---

## Copy por Bloco

${copy_estrategico ?? 'Copy a ser definido com base no briefing.'}

---

## Instruções para o Cursor/Roo Code

- Use SOMENTE rem para espaçamentos e tamanhos. Nunca px.
- Ícones: Lucide React, stroke-width 1.5, sempre vazados.
- Bordas: finas, zinc-800 no dark.
- Respeite a estrutura de blocos na ordem exata acima.
- Cor de destaque: ${paleta?.[0] ?? '#FFA500'}

---
*Manifesto gerado pela Adsgator. Insira este arquivo como contexto no Cursor.*`
    }

    // Salvar relatório
    const { data: relatorio, error: relError } = await supabase
      .from('relatorios')
      .insert({
        user_id,
        cliente_id,
        tipo,
        titulo: `${tipo === 'analytics' ? 'Relatório Analytics' : 'Manifesto Landing'} — ${cliente?.nome}`,
        conteudo_md: conteudo,
      })
      .select()
      .single()

    if (relError) throw relError

    return new Response(JSON.stringify({ relatorio, conteudo }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (error) {
    console.error('[gerar-relatorio-md]', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
