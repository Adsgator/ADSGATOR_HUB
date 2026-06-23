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

/** Subtítulo de seção (escaneável), com filete amarelo embaixo. */
function sectionTitle(text: string): string {
  return `<p style="font-size:15px; font-weight:bold; color:#111111; margin:24px 0 10px 0; padding-bottom:6px; border-bottom:2px solid #FFB100;">${text}</p>`
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
    subject: 'Seu relatório do Google Ads de {{mes_ano}} chegou 📊',
    buildHtml: (v) => wrapEmailHtml(
      `Relatório Google Ads<br>${v.mes_ano}`,
      `${p(`Olá, <strong>${v.nome_cliente}</strong>! Aqui está como suas campanhas no Google Ads se saíram em <strong>${v.mes_ano}</strong>. Um resumo dos números que mais importam:`)}
       ${kpiGrid([
         { label: 'Impressões',    value: v.impressoes ?? '—' },
         { label: 'Cliques',       value: v.cliques ?? '—' },
         { label: 'CTR',           value: v.ctr ?? '—' },
         { label: 'Conversões',    value: v.conversoes ?? '—' },
         { label: 'CPA Médio',     value: v.cpa ?? '—' },
         { label: 'Investimento',  value: v.investimento ?? '—' },
       ])}
       ${p('Quer entender o que está por trás desses números ou ajustar a estratégia? É só responder este e-mail — vamos adorar conversar. 😊')}
       ${btn(`{{dashboard_url}}/clientes/${v.cliente_id}`, 'Ver no painel')}`,
    ),
  },
  'report-ga4': {
    subject: 'Como anda seu site — relatório de {{mes_ano}} 📈',
    buildHtml: (v) => wrapEmailHtml(
      `Relatório do seu site<br>${v.mes_ano}`,
      `${p(`Olá, <strong>${v.nome_cliente}</strong>! Veja como anda a presença digital do seu negócio em <strong>${v.mes_ano}</strong> — acessos, comportamento dos visitantes e os principais indicadores do site:`)}
       ${kpiGrid([
         { label: 'Sessões',       value: v.sessoes ?? '—' },
         { label: 'Usuários',      value: v.usuarios ?? '—' },
         { label: 'Visualizações', value: v.visualizacoes ?? '—' },
         { label: 'Engajamento',   value: v.engajamento ?? '—' },
         { label: 'Duração Média', value: v.duracao ?? '—' },
         { label: 'Taxa Rejeição', value: v.rejeicao ?? '—' },
       ])}
       ${p('Tem alguma dúvida sobre os dados ou quer ideias para crescer ainda mais? Responda este e-mail que a gente te ajuda. 😊')}
       ${btn('{{dashboard_url}}/analytics', 'Ver no painel')}`,
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
    subject: 'Bem-vindo à Adsgator, {{nome_cliente}}! 🎉',
    buildHtml: (v) => wrapEmailHtml(
      'Bem-vindo à Adsgator! 🎉',
      `${p(`Olá, <strong>${v.nome_cliente}</strong>! Que bom ter você com a gente.`)}
       ${p('Sua assinatura está confirmada e já começamos a preparar tudo para o seu projeto sair do papel. A partir de agora, somos parceiros no crescimento do seu negócio.')}
       ${sectionTitle('O que acontece agora')}
       ${p('Em até <strong>1 dia útil</strong>, nossa equipe entra em contato pelo WhatsApp para coletar as primeiras informações e dar o pontapé inicial.')}
       ${p('Enquanto isso, vale guardar nossos <a href="https://adsgator.com.br/termos-de-servico/" target="_blank" style="color:#2969b0;">Termos de Serviço</a> (que você aceitou na contratação) — lá estão os prazos de entrega, as regras de suporte e as políticas de cancelamento e reativação.')}
       ${p('Qualquer dúvida, é só responder este e-mail ou chamar no WhatsApp. Vamos juntos! 🤝')}`,
    ),
  },
  'payment-reminder': {
    subject: '{{nome_cliente}}, um lembrete sobre seu pagamento',
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
    subject: '⚠️ {{nome_cliente}}, seu saldo do Google Ads está acabando',
    buildHtml: (v) => wrapEmailHtml(
      '⚠️ Seu saldo do Google Ads está acabando',
      `${p(`Olá, <strong>${v.nome_cliente}</strong>! O saldo da sua conta do Google Ads está baixo. Quando ele zera, o Google pausa seus anúncios automaticamente — e suas campanhas saem do ar.`)}
       ${p('Para não correr esse risco, recomendamos adicionar créditos o quanto antes. Assim tudo segue rodando sem interrupção.')}
       ${saldoCard(v.saldo_atual ?? 'R$ 00', 'Os fundos estão acabando', '#a80000')}
       ${p('Qualquer dúvida no processo, é só responder este e-mail. 😊')}`,
      { envioAutomatico: true },
    ),
  },
  'alert-saldo-zerado': {
    subject: '🔴 {{nome_cliente}}, seus anúncios foram pausados (saldo zerado)',
    buildHtml: (v) => wrapEmailHtml(
      '🔴 Seu saldo do Google Ads acabou — anúncios pausados',
      `${p(`Olá, <strong>${v.nome_cliente}</strong>! O saldo da sua conta do Google Ads chegou a zero e, com isso, o Google <strong>pausou seus anúncios</strong>. Eles voltam ao ar assim que você recarregar.`)}
       ${p('Quanto antes adicionar saldo, antes suas campanhas voltam a gerar resultado:')}
       ${saldoCard(v.saldo_atual ?? 'R$ 00', 'Os fundos acabaram', '#a80000')}
       ${p('Precisa de ajuda para recarregar? Responda este e-mail que a gente orienta. 😊')}`,
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
    subject: '{{nome_cliente}}, seu pagamento ainda está pendente',
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
    subject: '{{nome_cliente}}, seu plano foi cancelado — veja como reverter',
    buildHtml: (v) => wrapEmailHtml(
      'Seu plano foi cancelado por inadimplência',
      `${p(`Olá, <strong>${v.nome_cliente}</strong>. A mensalidade com vencimento em <strong>${v.data_vencimento ?? '[informar data de vencimento]'}</strong> seguiu em aberto mesmo após os avisos enviados por e-mail e WhatsApp. Como o pagamento não foi identificado, o seu plano foi <strong>cancelado</strong>, conforme nossos <a href="https://adsgator.com.br/termos-de-servico/" target="_blank" style="color:#2969b0;">Termos de Serviço</a>.`)}
       ${sectionTitle('Prazo para migrar seus dados')}
       ${p(`Seu e-mail profissional (caso utilize) continua ativo até <strong>${v.data_desativacao ?? '[informar data]'}</strong>, para você migrar as mensagens ou configurar outro serviço com calma.`)}
       ${p(`Depois dessa data, o site e o e-mail saem da nossa hospedagem — e dados não migrados não poderão ser recuperados.`)}
       ${sectionTitle('Ainda dá tempo de reverter')}
       ${p('Se quiser manter tudo no ar, basta quitar o valor em atraso pelo link abaixo:')}
       ${btn('{{pagamento_url}}', 'Regularizar e manter meu plano')}
       ${p('Já pagou? Responda este e-mail com o comprovante que normalizamos sua conta o quanto antes. Qualquer dúvida, estamos à disposição.')}`,
    ),
  },

  'aviso-indisponibilidade': {
    subject: '{{nome_cliente}}, seus serviços foram pausados — veja como reativar',
    buildHtml: (v) => wrapEmailHtml(
      'Seus serviços foram pausados temporariamente',
      `${p(`Olá, <strong>${v.nome_cliente}</strong>! Como a mensalidade com vencimento em <strong>${v.data_vencimento ?? '[informar data de vencimento]'}</strong> ainda consta em aberto, seu plano foi <strong>pausado temporariamente</strong> a partir de hoje — conforme nossos <a href="https://adsgator.com.br/termos-de-servico/" target="_blank" style="color:#2969b0;">Termos de Serviço</a> (atraso acima de 7 dias).`)}
       ${sectionTitle('O que está pausado agora')}
       <ul style="font-size:16px; margin:0 0 15px 0; padding-left:20px;">
         <li style="margin-bottom:8px;"><strong>Site / Landing Page:</strong> fora do ar enquanto a pendência não é resolvida.</li>
         <li style="margin-bottom:8px;"><strong>Google Ads:</strong> campanhas interrompidas, para não gastar verba sem retorno.</li>
         <li style="margin-bottom:8px;"><strong>E-mail profissional:</strong> o acesso pode ficar instável.</li>
       </ul>
       ${sectionTitle('Como reativar tudo')}
       ${p('É simples: basta regularizar o pagamento pelo link abaixo. Assim que ele for identificado, reativamos seus serviços em até <strong>24 horas úteis</strong>.')}
       ${btn('{{pagamento_url}}', 'Regularizar pagamento')}
       ${p('Só um aviso importante: se o atraso chegar a <strong>15 dias</strong>, o plano é cancelado por inadimplência e a estrutura sai dos nossos servidores. Resolvendo agora, você evita a interrupção das suas vendas e a perda de dados.')}
       ${p('Se já pagou ou quiser conversar, é só responder este e-mail — estamos por aqui.')}`,
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
    subject: 'Tudo certo, {{nome_cliente}} — seu plano está reativado! 🎉',
    buildHtml: (v) => wrapEmailHtml(
      'Tudo certo, seu plano foi reativado! 🎉',
      `${p(`Olá, <strong>${v.nome_cliente}</strong>! Recebemos seu pagamento — obrigado por regularizar. Seu plano já está <strong>reativado</strong> e nossa equipe técnica já está colocando tudo de volta no ar.`)}
       ${sectionTitle('O que esperar agora')}
       <ul style="font-size:16px; margin:0 0 15px 0; padding-left:20px;">
         <li style="margin-bottom:8px;"><strong>Prazo:</strong> o restabelecimento completo acontece em até <strong>24 horas úteis</strong>.</li>
         <li style="margin-bottom:8px;"><strong>Google Ads:</strong> se você tem gestão de tráfego conosco, as campanhas voltam assim que o site estiver online.</li>
         <li style="margin-bottom:8px;"><strong>E-mail profissional:</strong> qualquer instabilidade se normaliza junto com a hospedagem.</li>
       </ul>
       ${p('Que bom seguir com você nessa parceria! Precisando de qualquer coisa, é só chamar. 🤝')}`,
    ),
  },
}
