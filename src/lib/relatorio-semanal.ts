import type { SupabaseClient } from '@supabase/supabase-js'
import { dispararEmailAutomatico } from '@/lib/email-automation'

/**
 * Relatório semanal (F3) — resumo curto das campanhas ao cliente.
 *
 * Para cada cliente com email, pega os dois snapshots Google Ads mais recentes
 * (atual vs anterior) e monta os KPIs com a variação percentual. Dispara o
 * template `report-weekly-kpi` via toggle `email_relatorio_semanal`.
 *
 * Nota: a granularidade dos snapshots hoje é mensal (o sync roda por mês). Quando
 * existir snapshot semanal, a comparação passa a ser semana vs semana sem mudar
 * este código. Clientes sem ao menos um snapshot Google Ads são PULADOS — não
 * enviamos email sem números.
 */

interface SnapshotAds {
  cliques: number | null
  conversoes: number | null
  investimento: number | null
  periodo_inicio: string
}

interface ClienteRel {
  id: string
  nome: string
  email: string | null
}

export interface ResultadoSemanal {
  ativa: boolean
  enviados: number
  pulados: number
  resultados: Array<{ cliente: string; enviado: boolean; motivo?: string }>
}

const fmtInt = (n: number) => Math.round(n).toLocaleString('pt-BR')
const fmtBRL = (n: number) => `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** Variação percentual atual vs anterior, como '+18%' / '-5%' (ou '' se não dá). */
function variacao(atual: number, anterior: number | null | undefined): string {
  if (anterior == null || anterior === 0) return ''
  const pct = Math.round(((atual - anterior) / anterior) * 100)
  if (pct === 0) return ''
  return `${pct > 0 ? '+' : ''}${pct}%`
}

export async function enviarRelatoriosSemanais(supabase: SupabaseClient): Promise<ResultadoSemanal> {
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome, email')
    .not('email', 'is', null)

  const resultados: ResultadoSemanal['resultados'] = []
  let enviados = 0
  let pulados = 0

  for (const c of (clientes ?? []) as ClienteRel[]) {
    if (!c.email) { pulados++; continue }

    const { data: snaps } = await supabase
      .from('analytics_snapshots')
      .select('cliques, conversoes, investimento, periodo_inicio')
      .eq('cliente_id', c.id)
      .eq('fonte', 'google_ads')
      .order('periodo_inicio', { ascending: false })
      .limit(2)

    const lista = (snaps ?? []) as SnapshotAds[]
    if (lista.length === 0) { pulados++; resultados.push({ cliente: c.nome, enviado: false, motivo: 'sem_dados' }); continue }

    const atual = lista[0]
    const ant = lista[1]

    const r = await dispararEmailAutomatico(supabase, {
      tipo: 'email_relatorio_semanal',
      templateId: 'report-weekly-kpi',
      destinatario: c.email,
      clienteId: c.id,
      variables: {
        nome_cliente:   c.nome,
        cliques:        fmtInt(atual.cliques ?? 0),
        cliques_var:    variacao(atual.cliques ?? 0, ant?.cliques),
        conversoes:     fmtInt(atual.conversoes ?? 0),
        conversoes_var: variacao(atual.conversoes ?? 0, ant?.conversoes),
        investimento:   fmtBRL(atual.investimento ?? 0),
        investimento_var: variacao(atual.investimento ?? 0, ant?.investimento),
      },
    })

    if (r.enviado) enviados++
    else if (r.motivo === 'automacao_desativada') {
      return { ativa: false, enviados: 0, pulados, resultados: [] }
    }
    resultados.push({ cliente: c.nome, enviado: r.enviado, motivo: r.motivo })
  }

  return { ativa: true, enviados, pulados, resultados }
}
