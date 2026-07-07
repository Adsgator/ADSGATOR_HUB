// ─── CENTRAL DE PRONTIDÃO DO SISTEMA ─────────────────────────────────────────
// Single source do checklist de setup: computa ao vivo o que falta configurar
// para o Hub operar 100% (credenciais, crons, automações, clientes sem IDs).
// Consumido pela aba Setup em Configurações, pelo banner do dashboard e pela
// tool prontidao_sistema da Gator. Nunca defasa porque nada é persistido.

import type { SupabaseClient } from '@supabase/supabase-js'
import { checkAllIntegrations } from '@/lib/integration-status'

export type SetupItemStatus = 'ok' | 'pendente' | 'manual'

export interface SetupItem {
  id:      string
  label:   string
  status:  SetupItemStatus
  /** Estado atual em uma linha (ex.: mensagem do check da integração) */
  detalhe: string
  /** Como resolver, passo a passo */
  passos:  string[]
  /** Link ou ação sugerida (rota interna ou identificador de ação) */
  acao?:   { label: string; href?: string; tipo?: 'link' | 'provisionar' }
}

export interface SetupChecklistResult {
  itens:    SetupItem[]
  /** % de prontidão — itens `manual` ficam fora do denominador */
  percent:  number
  completo: boolean
  /** Clientes ativos/onboarding/setup sem IDs Google (alimenta a ação de provisionar) */
  clientes_sem_ids: number
}

export async function computarSetupChecklist(
  db: SupabaseClient,
  userId: string,
  opts?: { fresh?: boolean },
): Promise<SetupChecklistResult> {
  const [integracoes, automacoes, clientesPendentes] = await Promise.all([
    checkAllIntegrations({ fresh: opts?.fresh }),
    db.from('automation_settings').select('tipo, ativa'),
    db.from('clientes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['ativo', 'onboarding', 'setup_trafego'])
      // Pendente = falta ID OU o ID existe mas a integração está desligada
      // (toggle off era invisível: o cliente parecia configurado e nunca sincronizava).
      .or('google_ads_customer_id.is.null,ga4_property_id.is.null,google_ads_enabled.not.is.true,ga4_enabled.not.is.true'),
  ])

  const itens: SetupItem[] = []

  // ── Integrações externas (derivadas dos checks ao vivo) ──
  itens.push({
    id:      'google_ads',
    label:   'Google Ads conectado',
    status:  integracoes.googleAds.status === 'ok' ? 'ok' : 'pendente',
    detalhe: integracoes.googleAds.message,
    passos: [
      'Crie credenciais OAuth no Google Cloud Console (client ID + secret)',
      'Gere o refresh token autorizando a conta de gerente (MCC)',
      'Solicite o developer token no Google Ads API Center',
      'Preencha GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_DEVELOPER_TOKEN e GOOGLE_ADS_MANAGER_ID no .env.local (e na Vercel)',
      'Reinicie o servidor e clique em Reverificar',
    ],
    acao: { label: 'Ver integrações', href: '/configuracoes?tab=integracoes', tipo: 'link' },
  })

  itens.push({
    id:      'ga4',
    label:   'GA4 conectado',
    status:  integracoes.ga4.status === 'ok' ? 'ok' : 'pendente',
    detalhe: integracoes.ga4.message,
    passos: [
      'Crie uma service account no Google Cloud e baixe o JSON de credenciais',
      'Aponte GOOGLE_APPLICATION_CREDENTIALS para o arquivo (ou cole o JSON inteiro na env)',
      'No GA4 de cada cliente, adicione o e-mail da service account como Leitor',
      'Reinicie o servidor e clique em Reverificar',
    ],
    acao: { label: 'Ver integrações', href: '/configuracoes?tab=integracoes', tipo: 'link' },
  })

  itens.push({
    id:      'vertex',
    label:   'Vertex AI (Gator e relatórios)',
    status:  integracoes.vertexAI.status === 'ok' ? 'ok' : 'pendente',
    detalhe: integracoes.vertexAI.message,
    passos: [
      'Crie um projeto no Google Cloud com a API Vertex AI habilitada e billing ativo',
      'Crie uma service account com papel "Vertex AI User" e baixe o JSON',
      'Preencha VERTEX_AI_PROJECT_ID e VERTEX_AI_CREDENTIALS no .env.local (e na Vercel)',
      'Reinicie o servidor e clique em Reverificar',
    ],
    acao: { label: 'Ver integrações', href: '/configuracoes?tab=integracoes', tipo: 'link' },
  })

  itens.push({
    id:      'resend',
    label:   'Resend (envio de emails)',
    status:  integracoes.resend.status === 'ok' ? 'ok' : 'pendente',
    detalhe: integracoes.resend.message,
    passos: [
      'Crie uma conta na Resend e gere uma API key',
      'Cadastre e verifique o domínio de envio (registros DNS)',
      'Preencha RESEND_API_KEY, EMAIL_FROM e ALERT_EMAIL no .env.local (e na Vercel)',
      'Reinicie o servidor e clique em Reverificar',
    ],
    acao: { label: 'Ver integrações', href: '/configuracoes?tab=integracoes', tipo: 'link' },
  })

  // ── Infra de automação ──
  itens.push({
    id:      'cron_secret',
    label:   'CRON_SECRET (agendamentos Vercel)',
    status:  process.env.CRON_SECRET ? 'ok' : 'pendente',
    detalhe: process.env.CRON_SECRET
      ? 'Configurado — dispatcher de agendamentos autorizado (sync, briefing, import, alertas, cobrança)'
      : 'Sem CRON_SECRET o dispatcher único (/api/v1/cron/dispatch, a cada 30 min) é recusado e nenhum job automático roda',
    passos: [
      'Gere um segredo aleatório (ex.: openssl rand -hex 32)',
      'Adicione CRON_SECRET no .env.local e nas env vars da Vercel',
      'Redeploy — o dispatcher do vercel.json passa a autenticar',
      'Horários e liga/desliga de cada job: Configurações → Automações → Agendamentos',
    ],
  })

  const listaAutomacoes = automacoes.data ?? []
  const algumaAtiva = listaAutomacoes.some((a) => a.ativa)
  itens.push({
    id:      'automacoes',
    label:   'Automações de email ligadas',
    status:  algumaAtiva ? 'ok' : 'pendente',
    detalhe: algumaAtiva
      ? `${listaAutomacoes.filter((a) => a.ativa).length} de ${listaAutomacoes.length} automações ativas`
      : 'Todas as automações de email estão desligadas — nenhum email sai automaticamente',
    passos: [
      'Garanta o Resend configurado (item acima)',
      'Abra Configurações → Automações',
      'Ligue os fluxos desejados: relatório mensal, régua de cobrança, alertas críticos',
    ],
    acao: { label: 'Abrir Automações', href: '/configuracoes?tab=automacoes', tipo: 'link' },
  })

  // ── Itens não verificáveis em runtime ──
  itens.push({
    id:      'test_mode',
    label:   'TEST_MODE desligado (webhook + régua)',
    status:  'manual',
    detalhe: 'Não verificável em runtime — as Edge Functions webhook-asaas e regua-cobranca têm TEST_MODE hardcoded',
    passos: [
      'Siga o checklist em docs/Arquivo/MODO_TESTE.md',
      'Mude TEST_MODE para false em supabase/functions/webhook-asaas e regua-cobranca',
      'Redeploy das Edge Functions via dashboard ou CLI',
    ],
  })

  // ── Clientes com integração Google pendente (sem ID ou toggle desligado) ──
  const semIds = clientesPendentes.count ?? 0
  itens.push({
    id:      'clientes_pendentes',
    label:   'Clientes com Google Ads/GA4 conectados',
    status:  semIds === 0 ? 'ok' : 'pendente',
    detalhe: semIds === 0
      ? 'Todos os clientes ativos têm IDs preenchidos E integrações ligadas'
      : `${semIds} cliente(s) ativo(s) com integração pendente (ID faltando ou integração desligada) — analytics não sincroniza para eles`,
    passos: [
      'Gere as tarefas de setup para os clientes pendentes (botão ao lado)',
      'Em cada cliente, preencha os IDs na seção Integrações da página de detalhe',
      'LIGUE os toggles das integrações — ID preenchido com toggle desligado não sincroniza',
      'Use o botão Testar conexão para validar o ID antes de ligar',
    ],
    acao: semIds > 0
      ? { label: `Gerar tarefas para ${semIds} cliente(s)`, tipo: 'provisionar' }
      : undefined,
  })

  const verificaveis = itens.filter((i) => i.status !== 'manual')
  const oks = verificaveis.filter((i) => i.status === 'ok').length
  const percent = verificaveis.length ? Math.round((oks / verificaveis.length) * 100) : 100

  return {
    itens,
    percent,
    completo: percent === 100,
    clientes_sem_ids: semIds,
  }
}
