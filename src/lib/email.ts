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

const BANNER_URL = 'https://adsgator.com.br/wp-content/uploads/2025/11/banner-topo-email-comunicacao-v1.png'

interface WrapOptions {
  /** Tema do corpo. 'light' (padrão, igual aos emails atuais) ou 'dark'. */
  theme?: 'light' | 'dark'
  /** Rodapé enviado automaticamente (vs. somente notificação). */
  envioAutomatico?: boolean
}

/**
 * Wrapper email-safe no visual real da Adsgator (Titan): banner no topo, faixa
 * amarela #FFB100 com o título e corpo claro. Layout table-based + estilos
 * inline para máxima compatibilidade entre clientes de email.
 *
 * `theme: 'dark'` mantém o mesmo esqueleto mas com corpo escuro, para emails
 * que pedem visual dark.
 */
export function wrapEmailHtml(title: string, content: string, opts: WrapOptions = {}): string {
  const theme = opts.theme ?? 'light'
  const dark = theme === 'dark'

  const pageBg    = dark ? '#0a0a0b' : '#f9f9f9'
  const cardBg    = dark ? '#141416' : '#ffffff'
  const bodyBg    = dark ? '#1c1c1f' : '#F1F1F1'
  const bodyText  = dark ? '#a1a1aa' : '#333333'
  const headText  = dark ? '#231f20' : '#231f20' // faixa amarela em ambos
  const footText  = dark ? '#71717a' : '#888888'

  const rodapeNota = opts.envioAutomatico
    ? 'Este e-mail é enviado automaticamente.'
    : 'Este e-mail é somente para notificação.'

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:${pageBg}; font-family: Arial, Helvetica, sans-serif;">
<table width="100%" cellspacing="0" cellpadding="0" style="background-color:${pageBg}; width:100%;" bgcolor="${pageBg}">
  <tbody>
    <tr>
      <td align="center">
        <table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; border-radius:12px; overflow:hidden; box-shadow:rgba(0,0,0,0.05) 0px 2px 8px; background-color:${cardBg}; margin:40px 0;" bgcolor="${cardBg}">
          <tbody>
            <tr>
              <td style="padding:0; background-color:${cardBg};" bgcolor="${cardBg}" align="center"><img src="${BANNER_URL}" alt="Adsgator" width="600" height="130" style="display:block; width:100%; max-width:600px; height:auto; border:0;"></td>
            </tr>
            <tr>
              <td style="background-color:#FFB100; padding:30px 20px; color:#111111;" bgcolor="#FFB100" align="left">
                <h1 style="margin:0; font-size:22px; color:${headText};">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="background-color:${bodyBg}; padding:24px 20px 30px 20px; color:${bodyText}; font-size:16px; line-height:1.5;" bgcolor="${bodyBg}" align="left">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="background-color:${cardBg}; padding:20px; font-size:12px; color:${footText};" bgcolor="${cardBg}" align="left">
                <p style="margin:0;"><a href="https://adsgator.com.br/termos-de-servico/" style="color:${footText};">Termos de Serviço</a> | <a href="https://adsgator.com.br/privacidade" style="color:${footText};">Política de Privacidade</a> | <a href="https://adsgator.com.br/ajuda" style="color:${footText};">Central de Ajuda</a></p>
                <p style="margin-top:10px;">${rodapeNota} Para entrar em contato, envie um e-mail para <a href="mailto:contato@adsgator.com.br" style="color:${footText};">contato@adsgator.com.br</a>.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
</body>
</html>`
}

// ── Componentes reutilizáveis (email-safe, inline) ────────────────────────────

/** Parágrafo padrão do corpo. */
function p(text: string): string {
  return `<p style="font-size:16px; margin:0 0 15px 0;">${text}</p>`
}

/** Botão/CTA amarelo. */
function btn(href: string, label: string): string {
  return `<p style="margin:20px 0;"><a href="${href}" style="display:inline-block; background-color:#FFB100; color:#111111; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:14px;">${label}</a></p>`
}

/** Grade de KPIs (rótulo + valor) em tabela, para os relatórios. */
function kpiGrid(items: Array<{ label: string; value: string }>): string {
  const cells = items.map(
    (k) => `<td width="33%" style="background-color:#ffffff; border-radius:8px; padding:12px; text-align:center; border:4px solid ${'#F1F1F1'};">
      <div style="font-size:18px; font-weight:bold; color:#111111;">${k.value}</div>
      <div style="font-size:11px; color:#888888; margin-top:2px;">${k.label}</div>
    </td>`,
  )
  const rows: string[] = []
  for (let i = 0; i < cells.length; i += 3) {
    rows.push(`<tr>${cells.slice(i, i + 3).join('')}</tr>`)
  }
  return `<table width="100%" cellpadding="0" cellspacing="0" style="width:100%; margin:16px 0; border-collapse:separate;"><tbody>${rows.join('')}</tbody></table>`
}

/** Card de saldo (fundos disponíveis + botão recarregar), usado nos alertas de saldo. */
function saldoCard(saldo: string, statusLabel: string, statusColor: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; width:100%;" bgcolor="#ffffff"><tbody>
    <tr><td style="padding:30px 25px; text-align:left;" align="left">
      <p style="margin:0 0 5px 0; font-size:14px; color:#333;"><strong>Fundos disponíveis</strong></p>
      <p style="margin:0 0 15px 0; font-size:28px; font-weight:bold; color:#007C00;">${saldo}</p>
      <p style="margin:0 0 20px 0; font-size:14px; color:${statusColor};"><strong>${statusLabel}</strong></p>
      <a href="https://ads.google.com/aw/billing/summary" target="_blank" style="display:inline-block; background-color:#d90000; color:#ffffff; padding:12px 20px; border-radius:6px; text-decoration:none; font-size:14px;">&nbsp;Adicionar fundos&nbsp;</a>
    </td></tr>
  </tbody></table>
  <p style="font-size:16px; margin-top:25px;">📘 <strong>Veja o passo a passo para adicionar saldo:</strong><br><a href="https://ajuda.adsgator.com.br/ajuda/como-adicionar-saldo-no-google-ads/" target="_blank" style="color:#2969b0;">&nbsp;https://ajuda.adsgator.com.br/ajuda/como-adicionar-saldo-no-google-ads/&nbsp;</a></p>`
}

// ── Pre-built templates ───────────────────────────────────────────────────────

export const EMAIL_TEMPLATES: Record<EmailTemplateId, { subject: string; buildHtml: (vars: Record<string, string>) => string }> = {
  'report-google-ads': {
    subject: '✅ Relatório de Desempenho Google Ads — {{mes_ano}} | {{nome_cliente}}',
    buildHtml: (v) => wrapEmailHtml(
      `✅ Relatório de Desempenho<br>Google Ads – ${v.mes_ano}`,
      `${p(`Olá, <strong>${v.nome_cliente}</strong>! Segue o <strong>relatório de Google Ads</strong> com os principais resultados das suas campanhas, como impressões, cliques, conversões e custo por resultado — apresentando o desempenho dos anúncios no período.`)}
       ${kpiGrid([
         { label: 'Impressões',    value: v.impressoes ?? '—' },
         { label: 'Cliques',       value: v.cliques ?? '—' },
         { label: 'CTR',           value: v.ctr ?? '—' },
         { label: 'Conversões',    value: v.conversoes ?? '—' },
         { label: 'CPA Médio',     value: v.cpa ?? '—' },
         { label: 'Investimento',  value: v.investimento ?? '—' },
       ])}
       ${p('Caso tenha qualquer dúvida, estamos à disposição para ajudar. 😊')}
       ${btn(`{{dashboard_url}}/clientes/${v.cliente_id}`, 'Ver Dashboard')}`,
    ),
  },
  'report-ga4': {
    subject: '✅ Relatório de Desempenho do Site (Google Analytics) — {{mes_ano}} | {{nome_cliente}}',
    buildHtml: (v) => wrapEmailHtml(
      `✅ Relatório de Desempenho do Site<br>Google Analytics – ${v.mes_ano}`,
      `${p(`Olá, <strong>${v.nome_cliente}</strong>! Segue o <strong>relatório de desempenho do site</strong>, com as principais métricas de acessos, origens de tráfego e comportamento dos visitantes, para você acompanhar a evolução da sua presença digital.`)}
       ${kpiGrid([
         { label: 'Sessões',       value: v.sessoes ?? '—' },
         { label: 'Usuários',      value: v.usuarios ?? '—' },
         { label: 'Visualizações', value: v.visualizacoes ?? '—' },
         { label: 'Engajamento',   value: v.engajamento ?? '—' },
         { label: 'Duração Média', value: v.duracao ?? '—' },
         { label: 'Taxa Rejeição', value: v.rejeicao ?? '—' },
       ])}
       ${p('Caso tenha qualquer dúvida, estamos à disposição para ajudar. 😊')}
       ${btn('{{dashboard_url}}/analytics', 'Ver Analytics')}`,
    ),
  },
  'report-executive': {
    subject: 'Relatório Executivo — {{mes_ano}} | AdsGator',
    buildHtml: (v) => wrapEmailHtml(
      `Relatório Executivo — ${v.mes_ano}`,
      `${p(`Relatório consolidado da agência para <strong>${v.mes_ano}</strong>.`)}
       ${kpiGrid([
         { label: 'Clientes Ativos', value: v.total_clientes ?? '—' },
         { label: 'MRR',             value: v.mrr ?? '—' },
         { label: 'Conversões',      value: v.total_conversoes ?? '—' },
       ])}
       ${v.resumo ? p(v.resumo) : ''}`
    ),
  },
  'welcome': {
    subject: 'Bem-vindo à Adsgator!',
    buildHtml: (v) => wrapEmailHtml(
      'Bem-vindo à Adsgator!',
      `${p(`Olá, <strong>${v.nome_cliente}</strong>, tudo bem?`)}
       ${p('Seja muito bem-vindo à Adsgator! Ficamos felizes em saber que agora somos parceiros no crescimento do seu negócio.')}
       ${p('Recebemos a confirmação da sua assinatura e já estamos com tudo pronto para começar. Para garantir que nossa parceria seja a mais clara e eficiente possível, estou enviando abaixo o link dos nossos <strong>Termos de Serviço</strong>, que você aceitou no momento da contratação:')}
       ${p('🔗 <strong>Acesse aqui:</strong> <a href="https://adsgator.com.br/termos-de-servico/" target="_blank" style="color:#2969b0;">https://adsgator.com.br/termos-de-servico/</a>')}
       ${p('Neste link, você encontra todos os detalhes sobre nossos prazos de entrega, regras de suporte e políticas de cancelamento/reativação.')}
       ${p('<strong>O que acontece agora?</strong>')}
       ${p('Nossa equipe entrará em contato com você via WhatsApp em breve para coletarmos as informações necessárias e iniciarmos o desenvolvimento.')}
       ${p('Se tiver qualquer dúvida inicial, é só responder a este e-mail ou chamar no WhatsApp. Um abraço!')}`,
    ),
  },
  'payment-reminder': {
    subject: 'Lembrete de Pagamento — AdsGator',
    buildHtml: (v) => wrapEmailHtml(
      'Lembrete de Pagamento',
      `${p(`Olá, <strong>${v.nome_cliente}</strong>!`)}
       ${p(`Identificamos que sua mensalidade está pendente há <strong>${v.dias_atraso} dias</strong>.`)}
       ${p('Para manter seus serviços ativos, regularize o pagamento o quanto antes.')}
       ${p(`<strong>Valor:</strong> ${v.valor ?? '—'}`)}
       ${btn('{{pagamento_url}}', 'Realizar Pagamento')}`
    ),
  },
  'alert-saldo-baixo': {
    subject: '⚠️ Seu saldo do Google Ads está acabando!',
    buildHtml: (v) => wrapEmailHtml(
      '⚠️ Seu saldo do Google Ads está acabando!',
      `${p('Olá! Detectamos que o saldo da sua conta do Google Ads está baixo. Quando o saldo chega a zero, o Google pausa automaticamente a exibição dos seus anúncios.')}
       ${p('Para evitar qualquer interrupção, recomendamos adicionar créditos o quanto antes. Assim, suas campanhas continuam rodando normalmente.')}
       ${p('Veja abaixo o saldo atual e o botão para recarregar:')}
       ${saldoCard(v.saldo_atual ?? 'R$ 00', 'Os fundos estão acabando', '#a80000')}
       ${p('Caso tenha dúvidas, estamos a disposição para ajudar! 😊')}`,
      { envioAutomatico: true },
    ),
  },
  'alert-saldo-zerado': {
    subject: '⚠️ Seu saldo do Google Ads acabou!',
    buildHtml: (v) => wrapEmailHtml(
      '⚠️ Seu saldo do Google Ads acabou!',
      `${p('Olá! Detectamos que o saldo da sua conta do Google Ads acabou. Quando o saldo chega a zero, o Google pausa automaticamente a exibição dos seus anúncios.')}
       ${p('Veja abaixo o saldo atual e o botão para recarregar:')}
       ${saldoCard(v.saldo_atual ?? 'R$ 00', 'Os fundos acabaram', '#a80000')}
       ${p('Caso tenha dúvidas, estamos a disposição para ajudar! 😊')}`,
      { envioAutomatico: true },
    ),
  },
  'alert-performance': {
    subject: '⚠️ Alerta de Performance — {{nome_cliente}}',
    buildHtml: (v) => wrapEmailHtml(
      'Alerta de Performance',
      `${p(`Detectamos uma variação de performance nas campanhas de <strong>${v.nome_cliente}</strong>.`)}
       ${p(`<strong>Métrica:</strong> ${v.metrica ?? '—'}`)}
       ${p(`<strong>Valor atual:</strong> <span style="color:#d90000">${v.valor_atual ?? '—'}</span>`)}
       ${p(`<strong>Referência:</strong> ${v.valor_referencia ?? '—'}`)}
       ${btn('{{dashboard_url}}/analytics', 'Ver Analytics')}`
    ),
  },

  'payment-followup': {
    subject: '📢 Seu pagamento ainda está pendente — AdsGator',
    buildHtml: (v) => wrapEmailHtml(
      'Pagamento Pendente',
      `${p(`Olá, <strong>${v.nome_cliente}</strong>!`)}
       ${p(`Identificamos que seu pagamento está pendente há <strong>${v.dias_atraso ?? '—'} dias</strong>.`)}
       ${p('Para evitar a interrupção dos seus serviços, regularize o pagamento o quanto antes.')}
       ${p(`<strong>Valor:</strong> ${v.valor ?? '—'}`)}
       ${p('Se já realizou o pagamento, desconsidere este aviso.')}
       ${btn('{{pagamento_url}}', 'Regularizar Agora')}`
    ),
  },

  'cancelamento-notice': {
    subject: 'Cancelamento do plano por atraso — Adsgator',
    buildHtml: (v) => wrapEmailHtml(
      'Cancelamento do plano por atraso',
      `${p(`Olá, <strong>${v.nome_cliente}</strong>! Estamos entrando em contato para informar que a mensalidade referente ao seu plano da Adsgator, com vencimento em <strong>${v.data_vencimento ?? '[informar data de vencimento]'}</strong>, continua em aberto após vários avisos de cobrança enviados automaticamente pelo sistema e também pelo WhatsApp.`)}
       ${p('Como o pagamento não foi identificado até o momento, o seu plano foi cancelado, conforme previsto em nossos <a href="https://adsgator.com.br/termos-de-servico/" target="_blank" style="color:#2969b0;">Termos de Serviço</a>.')}
       ${p('<strong>Informação importante:</strong>')}
       <ul style="font-size:16px; margin:0 0 15px 0; padding-left:20px;">
         <li style="margin-bottom:8px;">O e-mail profissional (caso utilize) permanecerá ativo até <strong>${v.data_desativacao ?? '[informar data]'}</strong>. Esse prazo serve para que você possa migrar as mensagens ou configurar um novo serviço.</li>
       </ul>
       ${p(`Após a data <strong>${v.data_desativacao ?? '[informar data]'}</strong>, tanto o site quanto o e-mail serão desativados da nossa hospedagem, não sendo mais possível recuperar dados que não forem migrados.`)}
       ${p('<strong>Para evitar o cancelamento:</strong> basta realizar o pagamento que consta em atraso.')}
       ${p('💳 <strong>Link para regularizar:</strong> <a href="{{pagamento_url}}" target="_blank" style="color:#2969b0;">{{pagamento_url}}</a>')}
       ${p('Se você já realizou o pagamento, responda a este e-mail com o comprovante para que possamos normalizar a sua conta o quanto antes.')}
       ${p('Qualquer dúvida, estamos à disposição.')}`,
    ),
  },

  'aviso-indisponibilidade': {
    subject: 'AVISO IMPORTANTE: Suspensão Temporária de Serviços — Adsgator',
    buildHtml: (v) => wrapEmailHtml(
      'AVISO IMPORTANTE: Suspensão Temporária de Serviços',
      `${p(`Informamos que, devido à ausência de pagamento da mensalidade com vencimento em <strong>${v.data_vencimento ?? '[informar data de vencimento]'}</strong>, seu plano na Adsgator foi <strong>temporariamente pausado</strong> a partir de hoje.`)}
       ${p('Conforme nossos <a href="https://adsgator.com.br/termos-de-servico/" target="_blank" style="color:#2969b0;">Termos de Serviço</a>, o atraso superior a 7 dias resulta na suspensão imediata dos seguintes serviços:')}
       <ul style="font-size:16px; margin:0 0 15px 0; padding-left:20px;">
         <li style="margin-bottom:8px;"><strong>Website / Landing Page:</strong> ficarão fora do ar (indisponíveis para acesso).</li>
         <li style="margin-bottom:8px;"><strong>Google Ads:</strong> as campanhas foram interrompidas para evitar gastos sem destino.</li>
         <li style="margin-bottom:8px;"><strong>E-mail Profissional:</strong> o acesso poderá apresentar instabilidade.</li>
       </ul>
       ${p('<strong>Como regularizar e reativar seus serviços?</strong> Para que tudo volte ao normal o quanto antes, basta realizar o pagamento através do link abaixo:')}
       ${p('💳 <strong>Link para pagamento:</strong> <a href="{{pagamento_url}}" target="_blank" style="color:#2969b0;">{{pagamento_url}}</a>')}
       ${p('Assim que o pagamento for identificado, nossa equipe fará a reativação técnica em até <strong>24 horas úteis</strong>.')}
       ${p('<strong>Atenção:</strong> caso o atraso complete 15 dias, o plano será cancelado por inadimplência e a estrutura será removida de nossos servidores. Evite a perda de dados e a interrupção de suas vendas regularizando sua conta hoje mesmo.')}
       ${p('Qualquer dúvida, estamos à disposição.')}`,
    ),
  },

  'encerramento': {
    subject: 'Encerrando parceria — AdsGator',
    buildHtml: (v) => wrapEmailHtml(
      'Encerramento de Parceria',
      `${p(`Olá, <strong>${v.nome_cliente}</strong>!`)}
       ${p('Chegou o momento de encerrar nossa parceria. Foi uma honra trabalhar com você!')}
       ${p('Todas as suas campanhas foram desativadas e os acessos revogados.')}
       ${p('<strong>O que foi feito:</strong>')}
       <ul style="font-size:16px; margin:0 0 15px 0; padding-left:20px;">
         <li style="margin-bottom:8px;">Campanhas Google Ads encerradas</li>
         <li style="margin-bottom:8px;">Landing pages removidas</li>
         <li style="margin-bottom:8px;">Acessos à conta revogados</li>
       </ul>
       ${p('Se precisar de nós no futuro, as portas estão sempre abertas. Muito obrigado! 🙏')}`
    ),
  },

  'reativacao': {
    subject: 'Plano Reativado!',
    buildHtml: (v) => wrapEmailHtml(
      'Plano Reativado!',
      `${p(`Olá, <strong>${v.nome_cliente}</strong>! Recebemos a confirmação do seu pagamento. Muito obrigado por regularizar sua conta!`)}
       ${p('Informamos que o seu plano já foi <strong>reativado</strong> em nosso sistema. Agora, nossa equipe técnica está trabalhando para colocar o seu site e demais serviços de volta ao ar.')}
       ${p('<strong>Informações importantes sobre a reativação:</strong>')}
       <ul style="font-size:16px; margin:0 0 15px 0; padding-left:20px;">
         <li style="margin-bottom:8px;"><strong>Prazo:</strong> o restabelecimento completo dos serviços ocorre em até <strong>24 horas úteis</strong>.</li>
         <li style="margin-bottom:8px;"><strong>Anúncios (Google Ads):</strong> caso você tenha gestão de tráfego conosco, as campanhas serão retomadas assim que o site estiver totalmente online.</li>
         <li style="margin-bottom:8px;"><strong>E-mail Profissional:</strong> se houve alguma instabilidade no acesso, ela será normalizada junto com a hospedagem.</li>
       </ul>
       ${p('Ficamos felizes em continuar essa parceria com você! Se tiver qualquer dúvida ou precisar de algo, estamos à disposição.')}`,
    ),
  },
}
