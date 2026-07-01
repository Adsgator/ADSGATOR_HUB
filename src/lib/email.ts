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
  /** Texto de preview na caixa de entrada (preheader oculto). */
  preheader?: string
}

const FONT_STACK = "'Helvetica Neue', Helvetica, Arial, sans-serif"

/**
 * Wrapper email-safe no visual da Adsgator: banner no topo, faixa amarela
 * #FFB100 com o título e corpo claro. Layout table-based + estilos inline para
 * máxima compatibilidade entre clientes de email (Gmail, Outlook, Apple Mail).
 *
 * `theme: 'dark'` mantém o mesmo esqueleto com corpo escuro.
 */
export function wrapEmailHtml(title: string, content: string, opts: WrapOptions = {}): string {
  const theme = opts.theme ?? 'light'
  const dark = theme === 'dark'

  const pageBg    = dark ? '#0a0a0b' : '#eef0f4'
  const cardBg    = dark ? '#141416' : '#ffffff'
  const bodyBg    = dark ? '#16161a' : '#ffffff'
  const bodyText  = dark ? '#c4c4c8' : '#3a3a3a'
  const headText  = '#231f20' // faixa amarela em ambos os temas
  const footBg    = dark ? '#0f0f10' : '#fafafa'
  const footText  = dark ? '#71717a' : '#9a9a9a'
  const footBorder = dark ? '#2a2a2e' : '#ededed'

  const rodapeNota = opts.envioAutomatico
    ? 'Este e-mail é enviado automaticamente.'
    : 'Este e-mail é somente para notificação.'

  const preheader = opts.preheader
    ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">${opts.preheader}</div>`
    : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light dark" />
<title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:${pageBg}; font-family:${FONT_STACK}; -webkit-font-smoothing:antialiased;">
${preheader}
<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="background-color:${pageBg}; width:100%;" bgcolor="${pageBg}">
  <tbody>
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table width="600" cellspacing="0" cellpadding="0" role="presentation" style="max-width:600px; width:100%; border-radius:14px; overflow:hidden; box-shadow:0 4px 24px rgba(17,17,17,0.08); background-color:${cardBg};" bgcolor="${cardBg}">
          <tbody>
            <tr>
              <td style="padding:0; background-color:${cardBg};" bgcolor="${cardBg}" align="center"><img src="${BANNER_URL}" alt="Adsgator" width="600" height="130" style="display:block; width:100%; max-width:600px; height:auto; border:0;"></td>
            </tr>
            <tr>
              <td style="background-color:#FFB100; padding:28px 36px;" bgcolor="#FFB100" align="left">
                <h1 style="margin:0; font-size:24px; line-height:1.3; font-weight:bold; color:${headText};">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="background-color:${bodyBg}; padding:32px 36px; color:${bodyText}; font-size:16px; line-height:1.65;" bgcolor="${bodyBg}" align="left">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="background-color:${footBg}; padding:24px 36px; font-size:12px; line-height:1.6; color:${footText}; border-top:1px solid ${footBorder};" bgcolor="${footBg}" align="center">
                <p style="margin:0 0 10px 0; font-weight:bold; color:${dark ? '#a1a1aa' : '#6b6b6b'}; letter-spacing:0.04em;">ADSGATOR</p>
                <p style="margin:0 0 8px 0;"><a href="https://adsgator.com.br/termos-de-servico/" style="color:${footText}; text-decoration:none;">Termos de Serviço</a> &nbsp;·&nbsp; <a href="https://adsgator.com.br/privacidade" style="color:${footText}; text-decoration:none;">Privacidade</a> &nbsp;·&nbsp; <a href="https://adsgator.com.br/ajuda" style="color:${footText}; text-decoration:none;">Central de Ajuda</a></p>
                <p style="margin:0;">${rodapeNota} Fale com a gente em <a href="mailto:contato@adsgator.com.br" style="color:${footText};">contato@adsgator.com.br</a>.</p>
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
  return `<p style="margin:0 0 16px 0;">${text}</p>`
}

/** Subtítulo de seção (escaneável), com filete amarelo curto embaixo. */
function sectionTitle(text: string): string {
  return `<p style="font-size:13px; font-weight:bold; color:#111111; text-transform:uppercase; letter-spacing:0.06em; margin:28px 0 4px 0;">${text}</p>
  <div style="width:36px; height:3px; background-color:#FFB100; border-radius:2px; margin:0 0 14px 0;"></div>`
}

/** Botão/CTA amarelo com presença. `center` o centraliza. */
function btn(href: string, label: string, center = false): string {
  const wrapStyle = center ? 'text-align:center; margin:24px 0;' : 'margin:24px 0;'
  return `<div style="${wrapStyle}"><a href="${href}" target="_blank" style="display:inline-block; background-color:#FFB100; color:#111111; padding:14px 32px; border-radius:10px; text-decoration:none; font-weight:bold; font-size:15px; box-shadow:0 2px 8px rgba(255,177,0,0.35);">${label}</a></div>`
}

interface KpiItem {
  label: string
  value: string
  /** Variação vs período anterior, ex.: '+18%' ou '-5%'. Vazio = sem comparação. */
  variacao?: string
  /** true quando subir é bom (cliques, conversões); false quando subir é ruim (CPA, rejeição). */
  positivoSeSobe?: boolean
}

/** Renderiza a linha de variação (▲/▼ colorido) abaixo do valor, se houver. */
function variacaoTag(v?: string, positivoSeSobe = true): string {
  if (!v || !v.trim()) return ''
  const sobe = v.trim().startsWith('+')
  const desce = v.trim().startsWith('-')
  // Sem sinal claro: mostra neutro.
  const bom = sobe ? positivoSeSobe : desce ? !positivoSeSobe : null
  const cor = bom === null ? '#9a9a9a' : bom ? '#1a8f3c' : '#c0392b'
  const seta = sobe ? '▲' : desce ? '▼' : ''
  return `<div style="font-size:11px; color:${cor}; margin-top:3px; font-weight:bold;">${seta} ${v.trim().replace(/^[+-]/, '')}</div>`
}

/** Grade de KPIs (rótulo + valor + variação) para os relatórios. */
function kpiGrid(items: KpiItem[]): string {
  const cell = (k: KpiItem) =>
    `<td width="33%" valign="top" style="padding:6px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fafafa; border:1px solid #eee; border-radius:10px;"><tbody><tr><td style="padding:16px 10px; text-align:center;">
        <div style="font-size:20px; font-weight:bold; color:#111111; line-height:1.2;">${k.value}</div>
        <div style="font-size:11px; color:#9a9a9a; margin-top:4px; text-transform:uppercase; letter-spacing:0.04em;">${k.label}</div>
        ${variacaoTag(k.variacao, k.positivoSeSobe ?? true)}
      </td></tr></tbody></table>
    </td>`
  const rows: string[] = []
  for (let i = 0; i < items.length; i += 3) {
    const group = items.slice(i, i + 3)
    while (group.length < 3 && items.length > 3) group.push({ label: '', value: '' })
    rows.push(`<tr>${group.map((k) => (k.label || k.value ? cell(k) : '<td width="33%"></td>')).join('')}</tr>`)
  }
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="width:100%; margin:8px 0 4px 0;"><tbody>${rows.join('')}</tbody></table>`
}

/** Card de saldo (fundos disponíveis + botão recarregar), usado nos alertas de saldo. */
function saldoCard(saldo: string, statusLabel: string, statusColor: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fafafa; border:1px solid #eee; border-radius:12px; width:100%; margin:8px 0;" bgcolor="#fafafa"><tbody>
    <tr><td style="padding:28px 28px; text-align:left;" align="left">
      <p style="margin:0 0 6px 0; font-size:12px; color:#9a9a9a; text-transform:uppercase; letter-spacing:0.05em;">Fundos disponíveis</p>
      <p style="margin:0 0 4px 0; font-size:32px; font-weight:bold; color:#111111; line-height:1;">${saldo}</p>
      <p style="margin:0 0 20px 0; font-size:14px; color:${statusColor};"><strong>${statusLabel}</strong></p>
      <a href="https://ads.google.com/aw/billing/summary" target="_blank" style="display:inline-block; background-color:#d90000; color:#ffffff; padding:12px 24px; border-radius:8px; text-decoration:none; font-size:14px; font-weight:bold;">Adicionar fundos</a>
    </td></tr>
  </tbody></table>
  <p style="margin:18px 0 0 0;">📘 <strong>Passo a passo para adicionar saldo:</strong> <a href="https://ajuda.adsgator.com.br/ajuda/como-adicionar-saldo-no-google-ads/" target="_blank" style="color:#2969b0;">ver tutorial</a></p>`
}

// ── Pre-built templates ───────────────────────────────────────────────────────

export const EMAIL_TEMPLATES: Record<EmailTemplateId, { subject: string; buildHtml: (vars: Record<string, string>) => string }> = {
  'report-google-ads': {
    subject: 'Seu relatório do Google Ads de {{mes_ano}} chegou 📊',
    buildHtml: (v) => wrapEmailHtml(
      `Relatório Google Ads<br>${v.mes_ano}`,
      `${p(`Olá, ${v.nome_cliente}! Continuamos cuidando das suas campanhas e este é o resultado de ${v.mes_ano}. Os números abaixo já mostram a comparação com o mês anterior, então você acompanha a evolução de perto.`)}
       ${kpiGrid([
         { label: 'Impressões',   value: v.impressoes ?? '—',   variacao: v.impressoes_var,  positivoSeSobe: true  },
         { label: 'Cliques',      value: v.cliques ?? '—',      variacao: v.cliques_var,     positivoSeSobe: true  },
         { label: 'CTR',          value: v.ctr ?? '—',          variacao: v.ctr_var,         positivoSeSobe: true  },
         { label: 'Conversões',   value: v.conversoes ?? '—',   variacao: v.conversoes_var,  positivoSeSobe: true  },
         { label: 'CPA Médio',    value: v.cpa ?? '—',          variacao: v.cpa_var,         positivoSeSobe: false },
         { label: 'Investimento', value: v.investimento ?? '—', variacao: v.investimento_var, positivoSeSobe: true  },
       ])}
       ${v.destaque ? `${sectionTitle('Destaque do mês')}${p(v.destaque)}` : ''}
       ${p('Seguimos otimizando tudo nos bastidores para que cada real investido renda mais. No próximo mês trazemos a evolução.')}`,
    ),
  },
  'report-ga4': {
    subject: 'Como anda seu site em {{mes_ano}} 📈',
    buildHtml: (v) => wrapEmailHtml(
      `Relatório do seu site<br>${v.mes_ano}`,
      `${p(`Olá, ${v.nome_cliente}! Veja como anda a presença digital do seu negócio em ${v.mes_ano}. Comparamos com o mês anterior para você enxergar a evolução de acessos e do comportamento dos visitantes.`)}
       ${kpiGrid([
         { label: 'Sessões',       value: v.sessoes ?? '—',       variacao: v.sessoes_var,       positivoSeSobe: true  },
         { label: 'Usuários',      value: v.usuarios ?? '—',      variacao: v.usuarios_var,      positivoSeSobe: true  },
         { label: 'Visualizações', value: v.visualizacoes ?? '—', variacao: v.visualizacoes_var, positivoSeSobe: true  },
         { label: 'Engajamento',   value: v.engajamento ?? '—',   variacao: v.engajamento_var,   positivoSeSobe: true  },
         { label: 'Duração Média', value: v.duracao ?? '—',       variacao: v.duracao_var,       positivoSeSobe: true  },
         { label: 'Taxa Rejeição', value: v.rejeicao ?? '—',      variacao: v.rejeicao_var,      positivoSeSobe: false },
       ])}
       ${v.destaque ? `${sectionTitle('Destaque do mês')}${p(v.destaque)}` : ''}
       ${p('Tudo isso é fruto do trabalho contínuo na sua presença digital. Seguimos acompanhando para o seu site atrair cada vez mais gente certa.')}`,
    ),
  },
  'report-executive': {
    subject: 'Relatório Executivo da Adsgator | {{mes_ano}}',
    buildHtml: (v) => wrapEmailHtml(
      `Relatório Executivo<br>${v.mes_ano}`,
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
      `${p(`Olá, ${v.nome_cliente}! Que bom ter você com a gente.`)}
       ${p('Sua assinatura está confirmada e já começamos a preparar tudo para o seu projeto sair do papel. A partir de agora, somos parceiros no crescimento do seu negócio.')}
       ${sectionTitle('O que acontece agora')}
       ${p('Já estamos organizando tudo internamente. Em breve nossa equipe entra em contato pelo WhatsApp para coletar as primeiras informações e dar o pontapé inicial. Você não precisa fazer nada por enquanto, é só aguardar nosso retorno.')}
       ${p('Para sua referência, deixamos aqui nossos <a href="https://adsgator.com.br/termos-de-servico/" target="_blank" style="color:#2969b0;">Termos de Serviço</a>, que você aceitou na contratação. Neles estão os prazos de entrega, as regras de suporte e as políticas de cancelamento e reativação.')}
       ${p('Estamos felizes em começar essa jornada com você.')}`,
    ),
  },
  'payment-reminder': {
    subject: '{{nome_cliente}}, um lembrete sobre seu pagamento',
    buildHtml: (v) => wrapEmailHtml(
      'Um lembrete sobre seu pagamento',
      `${p(`Olá, ${v.nome_cliente}! Passando para lembrar que sua mensalidade está pendente há ${v.dias_atraso} dias.`)}
       ${p(`Para manter seus serviços rodando normalmente, é só regularizar pelo link abaixo. O valor é ${v.valor ?? '[informar valor]'}.`)}
       ${btn('{{pagamento_url}}', 'Regularizar agora', true)}
       ${p('Se já realizou o pagamento, pode desconsiderar este lembrete.')}`
    ),
  },
  'alert-saldo-baixo': {
    subject: '⚠️ {{nome_cliente}}, seu saldo do Google Ads está acabando',
    buildHtml: (v) => wrapEmailHtml(
      '⚠️ Seu saldo do Google Ads está acabando',
      `${p(`Olá, ${v.nome_cliente}! Estamos de olho na sua conta e percebemos que o saldo do Google Ads está ficando baixo. Quando ele chega a zero, o Google pausa os anúncios automaticamente e suas campanhas saem do ar.`)}
       ${p('Para que tudo continue rodando sem interrupção, é só adicionar créditos quando puder. Deixamos o passo a passo abaixo para facilitar.')}
       ${saldoCard(v.saldo_atual ?? 'R$ 00', 'Os fundos estão acabando', '#a80000')}`,
      { envioAutomatico: true },
    ),
  },
  'alert-saldo-zerado': {
    subject: '🔴 {{nome_cliente}}, seus anúncios foram pausados (saldo zerado)',
    buildHtml: (v) => wrapEmailHtml(
      '🔴 Seu saldo do Google Ads acabou e os anúncios pausaram',
      `${p(`Olá, ${v.nome_cliente}! O saldo da sua conta do Google Ads chegou a zero e, por isso, o Google pausou seus anúncios. A boa notícia é que eles voltam ao ar assim que a conta for recarregada.`)}
       ${p('Quanto antes o saldo for reposto, antes suas campanhas voltam a gerar resultado. O passo a passo está logo abaixo.')}
       ${saldoCard(v.saldo_atual ?? 'R$ 00', 'Os fundos acabaram', '#a80000')}`,
      { envioAutomatico: true },
    ),
  },
  'alert-performance': {
    subject: '{{nome_cliente}}, já estamos ajustando suas campanhas',
    buildHtml: (v) => wrapEmailHtml(
      'Estamos otimizando suas campanhas',
      `${p(`Olá, ${v.nome_cliente}! Nosso acompanhamento identificou uma variação que merece atenção nas suas campanhas, e já estamos cuidando disso.`)}
       ${p(`A métrica <strong>${v.metrica ?? '[métrica]'}</strong> está em ${v.valor_atual ?? '[valor]'}, contra a referência de ${v.valor_referencia ?? '[valor]'}.`)}
       ${p('Você não precisa fazer nada. Nossa equipe já está trabalhando nos ajustes para recolocar tudo no rumo certo, e isso vai se refletir no próximo relatório.')}`
    ),
  },

  'payment-followup': {
    subject: '{{nome_cliente}}, seu pagamento ainda está pendente',
    buildHtml: (v) => wrapEmailHtml(
      'Seu pagamento ainda está pendente',
      `${p(`Olá, ${v.nome_cliente}! Seu pagamento segue pendente há ${v.dias_atraso ?? 'alguns'} dias e queremos evitar que seus serviços sejam interrompidos.`)}
       ${p(`Para deixar tudo em dia, é só regularizar pelo link abaixo. O valor é ${v.valor ?? '[informar valor]'}.`)}
       ${btn('{{pagamento_url}}', 'Regularizar agora', true)}
       ${p('Se já realizou o pagamento, pode desconsiderar este aviso.')}`
    ),
  },

  'cancelamento-notice': {
    subject: '{{nome_cliente}}, seu plano foi cancelado (veja como reverter)',
    buildHtml: (v) => wrapEmailHtml(
      'Seu plano foi cancelado por inadimplência',
      `${p(`Olá, ${v.nome_cliente}. A mensalidade com vencimento em ${v.data_vencimento ?? '[informar data de vencimento]'} seguiu em aberto mesmo após os avisos enviados por e-mail e WhatsApp. Como o pagamento não foi identificado, o seu plano foi cancelado, conforme nossos <a href="https://adsgator.com.br/termos-de-servico/" target="_blank" style="color:#2969b0;">Termos de Serviço</a>.`)}
       ${sectionTitle('Prazo para migrar seus dados')}
       ${p(`Seu e-mail profissional (caso utilize) continua ativo até ${v.data_desativacao ?? '[informar data]'}, para você migrar as mensagens ou configurar outro serviço com calma.`)}
       ${p('Depois dessa data, o site e o e-mail saem da nossa hospedagem, e dados que não forem migrados não poderão ser recuperados.')}
       ${sectionTitle('Ainda dá tempo de reverter')}
       ${p('Se quiser manter tudo no ar, basta quitar o valor em atraso pelo link abaixo.')}
       ${btn('{{pagamento_url}}', 'Regularizar e manter meu plano', true)}
       ${p('Se já realizou o pagamento, responda este e-mail com o comprovante que normalizamos sua conta o quanto antes.')}`,
    ),
  },

  'exclusao-notice': {
    subject: '{{nome_cliente}}, seus dados e sua estrutura foram removidos',
    buildHtml: (v) => wrapEmailHtml(
      'Encerramento definitivo por inadimplência',
      `${p(`Olá, ${v.nome_cliente}. A mensalidade com vencimento em ${v.data_vencimento ?? '[informar data de vencimento]'} permaneceu em aberto mesmo após a pausa dos serviços e o cancelamento do plano. Como o prazo final foi atingido, sua estrutura foi <strong>removida definitivamente</strong> dos nossos servidores, conforme nossos <a href="https://adsgator.com.br/termos-de-servico/" target="_blank" style="color:#2969b0;">Termos de Serviço</a> (atraso acima de 28 dias).`)}
       ${sectionTitle('O que foi removido')}
       <ul style="margin:0 0 16px 0; padding-left:20px;">
         <li style="margin-bottom:8px;"><strong>Site e Landing Page:</strong> removidos da hospedagem.</li>
         <li style="margin-bottom:8px;"><strong>Google Ads:</strong> campanhas encerradas.</li>
         <li style="margin-bottom:8px;"><strong>Arquivos e dados:</strong> excluídos do nosso servidor — não é mais possível recuperá-los.</li>
       </ul>
       ${sectionTitle('A dívida em aberto permanece')}
       ${p('O encerramento dos serviços não quita o valor em atraso. A pendência segue devida e pode ser regularizada pelo link abaixo.')}
       ${btn('{{pagamento_url}}', 'Quitar o valor em aberto', true)}
       ${p('Quer voltar a trabalhar com a gente no futuro? É só chamar — recomeçamos a estrutura do zero quando você quiser.')}`,
    ),
  },

  'aviso-indisponibilidade': {
    subject: '{{nome_cliente}}, seus serviços foram pausados (veja como reativar)',
    buildHtml: (v) => wrapEmailHtml(
      'Seus serviços foram pausados temporariamente',
      `${p(`Olá, ${v.nome_cliente}! Como a mensalidade com vencimento em ${v.data_vencimento ?? '[informar data de vencimento]'} ainda consta em aberto, seu plano foi pausado temporariamente a partir de hoje, conforme nossos <a href="https://adsgator.com.br/termos-de-servico/" target="_blank" style="color:#2969b0;">Termos de Serviço</a> (atraso acima de 7 dias).`)}
       ${sectionTitle('O que está pausado agora')}
       <ul style="margin:0 0 16px 0; padding-left:20px;">
         <li style="margin-bottom:8px;"><strong>Site e Landing Page:</strong> fora do ar enquanto a pendência não é resolvida.</li>
         <li style="margin-bottom:8px;"><strong>Google Ads:</strong> campanhas interrompidas, para não gastar verba sem retorno.</li>
         <li style="margin-bottom:8px;"><strong>E-mail profissional:</strong> o acesso pode ficar instável.</li>
       </ul>
       ${sectionTitle('Como reativar tudo')}
       ${p('É simples. Basta regularizar o pagamento pelo link abaixo. Assim que ele for identificado, reativamos seus serviços em até 24 horas úteis.')}
       ${btn('{{pagamento_url}}', 'Regularizar pagamento', true)}
       ${p('Vale um aviso importante. Se o atraso chegar a 15 dias, o plano é cancelado por inadimplência e a estrutura sai dos nossos servidores. Resolvendo agora, você evita a interrupção das suas vendas e a perda de dados.')}
       ${p('Se já realizou o pagamento, pode desconsiderar este aviso.')}`,
    ),
  },

  'encerramento': {
    subject: 'Obrigado por confiar na Adsgator, {{nome_cliente}}',
    buildHtml: (v) => wrapEmailHtml(
      'Encerramento de parceria',
      `${p(`Olá, ${v.nome_cliente}! Chegou o momento de encerrar nossa parceria, e foi uma honra trabalhar com você.`)}
       ${p('Deixamos tudo organizado do nosso lado. Veja o que já foi finalizado:')}
       <ul style="margin:0 0 16px 0; padding-left:20px;">
         <li style="margin-bottom:8px;">Campanhas Google Ads encerradas</li>
         <li style="margin-bottom:8px;">Landing pages removidas</li>
         <li style="margin-bottom:8px;">Acessos à conta revogados</li>
       </ul>
       ${p('Se um dia precisar da gente de novo, as portas estarão sempre abertas. Obrigado por ter confiado no nosso trabalho.')}`
    ),
  },

  'reativacao': {
    subject: 'Tudo certo, {{nome_cliente}}! Seu plano está reativado 🎉',
    buildHtml: (v) => wrapEmailHtml(
      'Seu plano foi reativado! 🎉',
      `${p(`Olá, ${v.nome_cliente}! Recebemos seu pagamento e seu plano já está reativado. Nossa equipe técnica já está colocando tudo de volta no ar.`)}
       ${sectionTitle('O que esperar agora')}
       <ul style="margin:0 0 16px 0; padding-left:20px;">
         <li style="margin-bottom:8px;"><strong>Prazo:</strong> o restabelecimento completo acontece em até 24 horas úteis.</li>
         <li style="margin-bottom:8px;"><strong>Google Ads:</strong> se você tem gestão de tráfego conosco, as campanhas voltam assim que o site estiver online.</li>
         <li style="margin-bottom:8px;"><strong>E-mail profissional:</strong> qualquer instabilidade se normaliza junto com a hospedagem.</li>
       </ul>
       ${p('Ficamos felizes em continuar essa parceria com você. Seguimos cuidando de tudo por aqui.')}`,
    ),
  },

  'report-weekly-kpi': {
    subject: 'Resumo da semana das suas campanhas 📊',
    buildHtml: (v) => wrapEmailHtml(
      'Resumo da semana',
      `${p(`Olá, ${v.nome_cliente}! Um panorama rápido de como suas campanhas se saíram nos últimos 7 dias. Os números abaixo já trazem a comparação com a semana anterior.`)}
       ${kpiGrid([
         { label: 'Cliques',     value: v.cliques ?? '—',     variacao: v.cliques_var,     positivoSeSobe: true },
         { label: 'Conversões',  value: v.conversoes ?? '—',  variacao: v.conversoes_var,  positivoSeSobe: true },
         { label: 'Investimento', value: v.investimento ?? '—', variacao: v.investimento_var, positivoSeSobe: true },
       ])}
       ${v.destaque ? `${sectionTitle('Destaque da semana')}${p(v.destaque)}` : ''}
       ${p('Seguimos otimizando tudo nos bastidores. No próximo resumo trazemos a evolução.')}`,
    ),
  },

  'onboarding-briefing-recebido': {
    subject: 'Recebemos seu briefing, {{nome_cliente}}! ✅',
    buildHtml: (v) => wrapEmailHtml(
      'Recebemos tudo, podemos começar! ✅',
      `${p(`Olá, ${v.nome_cliente}! Confirmamos o recebimento do seu briefing e dos materiais. Muito obrigado!`)}
       ${p('A partir de agora já começamos a criar a sua página com base em tudo que você nos enviou. Você não precisa fazer nada por enquanto, é só aguardar — assim que tivermos novidades, avisamos.')}
       ${p('Estamos animados para construir algo com a cara do seu negócio.')}`,
    ),
  },

  'onboarding-pagina-pronta': {
    subject: 'Sua página está pronta para você ver, {{nome_cliente}}! 🎉',
    buildHtml: (v) => wrapEmailHtml(
      'Sua página está pronta! 🎉',
      `${p(`Olá, ${v.nome_cliente}! Temos uma ótima notícia: a sua página já está pronta para você conhecer.`)}
       ${p('Em breve enviamos pelo WhatsApp o link para você acessar e revisar com calma. Dá uma olhada em cada detalhe e, se quiser algum ajuste, é só nos dizer por lá.')}
       ${p('Mal podemos esperar para você ver o resultado.')}`,
    ),
  },

  'onboarding-acessos-google': {
    subject: 'Próximo passo: configurar seu Google Ads 🚀',
    buildHtml: (v) => wrapEmailHtml(
      'Vamos preparar suas campanhas 🚀',
      `${p(`Olá, ${v.nome_cliente}! Estamos quase lá. Para colocar suas campanhas no ar, precisamos configurar alguns acessos do Google.`)}
       ${p('Enviamos pelo WhatsApp os guias passo a passo de como criar sua conta no Google Ads e como nos dar acesso ao seu Google Meu Negócio. É tranquilo e te acompanhamos em cada etapa.')}
       ${p('Assim que esses acessos estiverem prontos, iniciamos a criação das suas campanhas.')}`,
    ),
  },
}

// ── Metadados para a UI de gestão ─────────────────────────────────────────────
// Categoria (para agrupar a lista) e variáveis aceitas por cada template (para
// os "chips" de inserção no editor). Fonte única consumida pela tela de Emails.

export type EmailTemplateCategoria = 'relatorios' | 'onboarding' | 'ciclo-vida' | 'cobranca' | 'alertas' | 'outros'

export const CATEGORIA_LABEL: Record<EmailTemplateCategoria, string> = {
  'relatorios':  'Relatórios',
  'onboarding':  'Onboarding',
  'ciclo-vida':  'Ciclo de vida do cliente',
  'cobranca':    'Cobrança',
  'alertas':     'Alertas',
  'outros':      'Outros',
}

/** Variáveis comuns + as específicas de cada template (sem {{ }}). */
export const EMAIL_TEMPLATE_META: Record<EmailTemplateId, { categoria: EmailTemplateCategoria; variaveis: string[] }> = {
  'report-google-ads':       { categoria: 'relatorios', variaveis: ['nome_cliente', 'mes_ano', 'impressoes', 'impressoes_var', 'cliques', 'cliques_var', 'ctr', 'ctr_var', 'conversoes', 'conversoes_var', 'cpa', 'cpa_var', 'investimento', 'investimento_var', 'destaque'] },
  'report-ga4':              { categoria: 'relatorios', variaveis: ['nome_cliente', 'mes_ano', 'sessoes', 'sessoes_var', 'usuarios', 'usuarios_var', 'visualizacoes', 'visualizacoes_var', 'engajamento', 'engajamento_var', 'duracao', 'duracao_var', 'rejeicao', 'rejeicao_var', 'destaque'] },
  'report-executive':        { categoria: 'relatorios', variaveis: ['mes_ano', 'total_clientes', 'mrr', 'total_conversoes', 'resumo'] },
  'report-weekly-kpi':       { categoria: 'relatorios', variaveis: ['nome_cliente', 'cliques', 'cliques_var', 'conversoes', 'conversoes_var', 'investimento', 'investimento_var', 'destaque'] },
  'onboarding-briefing-recebido': { categoria: 'onboarding', variaveis: ['nome_cliente'] },
  'onboarding-pagina-pronta':     { categoria: 'onboarding', variaveis: ['nome_cliente'] },
  'onboarding-acessos-google':    { categoria: 'onboarding', variaveis: ['nome_cliente'] },
  'welcome':                 { categoria: 'ciclo-vida', variaveis: ['nome_cliente'] },
  'reativacao':              { categoria: 'ciclo-vida', variaveis: ['nome_cliente'] },
  'encerramento':            { categoria: 'ciclo-vida', variaveis: ['nome_cliente'] },
  'aviso-indisponibilidade': { categoria: 'cobranca',   variaveis: ['nome_cliente', 'data_vencimento', 'pagamento_url'] },
  'cancelamento-notice':     { categoria: 'cobranca',   variaveis: ['nome_cliente', 'data_vencimento', 'data_desativacao', 'pagamento_url'] },
  'exclusao-notice':         { categoria: 'cobranca',   variaveis: ['nome_cliente', 'data_vencimento', 'pagamento_url'] },
  'payment-reminder':        { categoria: 'cobranca',   variaveis: ['nome_cliente', 'dias_atraso', 'valor', 'pagamento_url'] },
  'payment-followup':        { categoria: 'cobranca',   variaveis: ['nome_cliente', 'dias_atraso', 'valor', 'pagamento_url'] },
  'alert-saldo-baixo':       { categoria: 'alertas',    variaveis: ['nome_cliente', 'saldo_atual'] },
  'alert-saldo-zerado':      { categoria: 'alertas',    variaveis: ['nome_cliente', 'saldo_atual'] },
  'alert-performance':       { categoria: 'alertas',    variaveis: ['nome_cliente', 'metrica', 'valor_atual', 'valor_referencia'] },
}
