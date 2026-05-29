import { Resend } from 'resend'
import type { EmailTemplateId } from './types/email'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}
const FROM_EMAIL = process.env.EMAIL_FROM ?? 'AdsGator <noreply@adsgator.com.br>'

export interface SendEmailPayload {
  to: string | string[]
  cc?: string[]
  subject: string
  html: string
  text?: string
  tags?: Array<{ name: string; value: string }>
}

export async function sendEmail(payload: SendEmailPayload): Promise<{ id: string }> {
  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: Array.isArray(payload.to) ? payload.to : [payload.to],
    cc: payload.cc,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    tags: payload.tags,
  })

  if (error) throw new Error(`Erro ao enviar email: ${error.message}`)
  return { id: data!.id }
}

export async function sendBatch(emails: SendEmailPayload[]): Promise<void> {
  // Resend batch API — send in parallel with rate limiting awareness
  await Promise.allSettled(emails.map(e => sendEmail(e)))
}

// ── Template rendering ──────────────────────────────────────────────────────

export function renderTemplate(html: string, variables: Record<string, string>): string {
  let result = html
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{{${key}}}`, value)
  }
  return result
}

// ── Base HTML template ────────────────────────────────────────────────────────

export function wrapEmailHtml(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<style>
  body { margin: 0; padding: 0; background: #0a0a0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #fafafa; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
  .header { padding: 24px; background: #141416; border-radius: 12px 12px 0 0; border-bottom: 2px solid #FFB100; text-align: center; }
  .header h1 { margin: 0; font-size: 22px; color: #FFB100; font-weight: 700; }
  .header p { margin: 4px 0 0; font-size: 13px; color: #a1a1aa; }
  .body { background: #141416; padding: 24px; }
  .footer { background: #0f0f10; padding: 16px 24px; border-radius: 0 0 12px 12px; text-align: center; font-size: 11px; color: #52525b; }
  .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 16px 0; }
  .kpi { background: #1c1c1f; border-radius: 8px; padding: 12px; text-align: center; }
  .kpi .value { font-size: 18px; font-weight: 700; color: #fafafa; }
  .kpi .label { font-size: 11px; color: #71717a; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 6px 8px; font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #2a2a2e; }
  td { padding: 6px 8px; border-bottom: 1px solid #1c1c1f; color: #a1a1aa; }
  .section-title { font-size: 15px; font-weight: 600; color: #fafafa; margin: 20px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #FFB100; }
  .highlight { color: #FFB100; font-weight: 600; }
  .btn { display: inline-block; background: #FFB100; color: #000; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px; margin: 16px 0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>⚡ AdsGator</h1>
    <p>${title}</p>
  </div>
  <div class="body">
    ${content}
  </div>
  <div class="footer">
    AdsGator — Gestão de Tráfego Premium<br/>
    <a href="{{dashboard_url}}" style="color: #FFB100;">Acessar Dashboard</a>
  </div>
</div>
</body>
</html>`
}

// ── Pre-built templates ───────────────────────────────────────────────────────

export const EMAIL_TEMPLATES: Record<EmailTemplateId, { subject: string; buildHtml: (vars: Record<string, string>) => string }> = {
  'report-google-ads': {
    subject: 'Relatório Google Ads — {{mes_ano}} | {{nome_cliente}}',
    buildHtml: (v) => wrapEmailHtml(
      `Relatório Google Ads — ${v.mes_ano}`,
      `<p>Olá, <strong>${v.nome_cliente}</strong>!</p>
       <p>Segue o relatório de desempenho das suas campanhas Google Ads referente a <strong>${v.mes_ano}</strong>.</p>
       <p class="section-title">Resumo do Mês</p>
       <div class="kpi-grid">
         <div class="kpi"><div class="value">${v.impressoes ?? '—'}</div><div class="label">Impressões</div></div>
         <div class="kpi"><div class="value">${v.cliques ?? '—'}</div><div class="label">Cliques</div></div>
         <div class="kpi"><div class="value">${v.ctr ?? '—'}</div><div class="label">CTR</div></div>
         <div class="kpi"><div class="value">${v.conversoes ?? '—'}</div><div class="label">Conversões</div></div>
         <div class="kpi"><div class="value">${v.cpa ?? '—'}</div><div class="label">CPA Médio</div></div>
         <div class="kpi"><div class="value highlight">${v.investimento ?? '—'}</div><div class="label">Investimento</div></div>
       </div>
       <p class="section-title">Análise</p>
       <p>${v.analise_texto ?? 'Em anexo você encontra o relatório completo com todas as métricas detalhadas.'}</p>
       <a href="{{dashboard_url}}/clientes/${v.cliente_id}" class="btn">Ver Dashboard</a>`
    ),
  },
  'report-ga4': {
    subject: 'Relatório Google Analytics — {{mes_ano}} | {{nome_cliente}}',
    buildHtml: (v) => wrapEmailHtml(
      `Relatório Analytics — ${v.mes_ano}`,
      `<p>Olá, <strong>${v.nome_cliente}</strong>!</p>
       <p>Relatório de sessões e comportamento do site referente a <strong>${v.mes_ano}</strong>.</p>
       <div class="kpi-grid">
         <div class="kpi"><div class="value">${v.sessoes ?? '—'}</div><div class="label">Sessões</div></div>
         <div class="kpi"><div class="value">${v.usuarios ?? '—'}</div><div class="label">Usuários</div></div>
         <div class="kpi"><div class="value">${v.visualizacoes ?? '—'}</div><div class="label">Visualizações</div></div>
         <div class="kpi"><div class="value">${v.engajamento ?? '—'}</div><div class="label">Engajamento</div></div>
         <div class="kpi"><div class="value">${v.duracao ?? '—'}</div><div class="label">Duração Média</div></div>
         <div class="kpi"><div class="value">${v.rejeicao ?? '—'}</div><div class="label">Taxa Rejeição</div></div>
       </div>
       <a href="{{dashboard_url}}/analytics" class="btn">Ver Analytics</a>`
    ),
  },
  'report-executive': {
    subject: 'Relatório Executivo — {{mes_ano}} | AdsGator',
    buildHtml: (v) => wrapEmailHtml(
      `Relatório Executivo — ${v.mes_ano}`,
      `<p>Relatório consolidado da agência para <strong>${v.mes_ano}</strong>.</p>
       <div class="kpi-grid">
         <div class="kpi"><div class="value">${v.total_clientes ?? '—'}</div><div class="label">Clientes Ativos</div></div>
         <div class="kpi"><div class="value highlight">${v.mrr ?? '—'}</div><div class="label">MRR</div></div>
         <div class="kpi"><div class="value">${v.total_conversoes ?? '—'}</div><div class="label">Conversões</div></div>
       </div>
       <p>${v.resumo ?? ''}</p>`
    ),
  },
  'welcome': {
    subject: 'Bem-vindo ao AdsGator! 🚀',
    buildHtml: (v) => wrapEmailHtml(
      'Bem-vindo ao AdsGator!',
      `<p>Olá, <strong>${v.nome_cliente}</strong>!</p>
       <p>Seja bem-vindo! Sua conta foi criada com sucesso. Estamos prontos para elevar os resultados das suas campanhas.</p>
       <p class="section-title">Próximos Passos</p>
       <p>Em breve nossa equipe entrará em contato para iniciar o processo de onboarding e configuração das suas campanhas.</p>
       <a href="{{dashboard_url}}" class="btn">Acessar Plataforma</a>`
    ),
  },
  'payment-reminder': {
    subject: 'Lembrete de Pagamento — AdsGator',
    buildHtml: (v) => wrapEmailHtml(
      'Lembrete de Pagamento',
      `<p>Olá, <strong>${v.nome_cliente}</strong>!</p>
       <p>Identificamos que sua mensalidade está pendente há <strong class="highlight">${v.dias_atraso} dias</strong>.</p>
       <p>Para manter seus serviços ativos, regularize o pagamento o quanto antes.</p>
       <p><strong>Valor:</strong> <span class="highlight">${v.valor ?? '—'}</span></p>
       <a href="{{pagamento_url}}" class="btn">Realizar Pagamento</a>`
    ),
  },
  'alert-saldo-baixo': {
    subject: '⚠️ Alerta: Saldo Google Ads baixo — {{nome_cliente}}',
    buildHtml: (v) => wrapEmailHtml(
      'Alerta: Saldo Baixo',
      `<p>O saldo da conta Google Ads de <strong>${v.nome_cliente}</strong> está abaixo do mínimo recomendado.</p>
       <div class="kpi-grid">
         <div class="kpi"><div class="value" style="color:#ef4444">${v.saldo_atual ?? '—'}</div><div class="label">Saldo Atual</div></div>
         <div class="kpi"><div class="value">${v.saldo_minimo ?? 'R$250'}</div><div class="label">Mínimo Recomendado</div></div>
       </div>
       <p>Recarregue a conta o quanto antes para evitar interrupção das campanhas.</p>`
    ),
  },
  'alert-performance': {
    subject: '⚠️ Alerta de Performance — {{nome_cliente}}',
    buildHtml: (v) => wrapEmailHtml(
      'Alerta de Performance',
      `<p>Detectamos uma variação de performance nas campanhas de <strong>${v.nome_cliente}</strong>.</p>
       <p><strong>Métrica:</strong> ${v.metrica ?? '—'}</p>
       <p><strong>Valor atual:</strong> <span style="color:#ef4444">${v.valor_atual ?? '—'}</span></p>
       <p><strong>Referência:</strong> ${v.valor_referencia ?? '—'}</p>
       <a href="{{dashboard_url}}/analytics" class="btn">Ver Analytics</a>`
    ),
  },

  'payment-followup': {
    subject: '📢 Seu pagamento ainda está pendente — AdsGator',
    buildHtml: (v) => wrapEmailHtml(
      'Pagamento Pendente',
      `<p>Olá, <strong>${v.nome_cliente}</strong>!</p>
       <p>Identificamos que seu pagamento está pendente há <strong class="highlight">${v.dias_atraso ?? '—'} dias</strong>.</p>
       <p>Para evitar a interrupção dos seus serviços, regularize o pagamento o quanto antes.</p>
       <p><strong>Valor:</strong> <span class="highlight">${v.valor ?? '—'}</span></p>
       <p>Se já realizou o pagamento, desconsidere este aviso.</p>
       <a href="${v.pagamento_url ?? '#'}" class="btn">Regularizar Agora</a>`
    ),
  },

  'cancelamento-notice': {
    subject: '⚠️ Aviso de cancelamento — {{nome_cliente}}',
    buildHtml: (v) => wrapEmailHtml(
      'Aviso de Cancelamento',
      `<p>Olá, <strong>${v.nome_cliente}</strong>!</p>
       <p>Recebemos seu pedido de cancelamento dos serviços AdsGator.</p>
       <p>Nossa equipe entrará em contato em breve para entender o motivo e ver se existe alguma forma de continuar te ajudando.</p>
       <p>Caso queira conversar diretamente, é só responder a este email.</p>
       <a href="{{dashboard_url}}" class="btn">Falar com a Equipe</a>`
    ),
  },

  'aviso-indisponibilidade': {
    subject: '⏸️ Serviços pausados — {{nome_cliente}}',
    buildHtml: (v) => wrapEmailHtml(
      'Serviços Pausados',
      `<p>Olá, <strong>${v.nome_cliente}</strong>!</p>
       <p>Conforme solicitado, seus serviços foram pausados temporariamente.</p>
       <p><strong>Data da pausa:</strong> ${v.data_pausa ?? '—'}</p>
       <p>Suas campanhas no Google Ads estão pausadas. Quando quiser reativar, é só entrar em contato!</p>
       <a href="{{dashboard_url}}" class="btn">Reativar Serviços</a>`
    ),
  },

  'encerramento': {
    subject: 'Encerrando parceria — AdsGator',
    buildHtml: (v) => wrapEmailHtml(
      'Encerramento de Parceria',
      `<p>Olá, <strong>${v.nome_cliente}</strong>!</p>
       <p>Chegou o momento de encerrar nossa parceria. Foi uma honra trabalhar com você!</p>
       <p>Todas as suas campanhas foram desativadas e os acessos revogados.</p>
       <p class="section-title">O que foi feito</p>
       <ul style="color:#a1a1aa;font-size:13px;line-height:1.8">
         <li>Campanhas Google Ads encerradas</li>
         <li>Landing pages removidas</li>
         <li>Acessos à conta revogados</li>
       </ul>
       <p>Se precisar de nós no futuro, as portas estão sempre abertas. Muito obrigado! 🙏</p>`
    ),
  },

  'reativacao': {
    subject: '🎉 Bem-vindo de volta, {{nome_cliente}}!',
    buildHtml: (v) => wrapEmailHtml(
      'Bem-vindo de Volta!',
      `<p>Olá, <strong>${v.nome_cliente}</strong>!</p>
       <p>Que ótima notícia — você está de volta! 🎉</p>
       <p>Suas campanhas serão reativadas em até 24 horas e nossa equipe entrará em contato para alinhar os próximos passos.</p>
       <a href="{{dashboard_url}}" class="btn">Acessar Dashboard</a>`
    ),
  },
}
