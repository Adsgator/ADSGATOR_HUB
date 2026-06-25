// Biblioteca de mensagens de WhatsApp — fonte única (F6).
//
// Os textos vivem editáveis na tabela `whatsapp_snippets` (migration
// 20260625b). Este módulo guarda a SEMENTE do código (espelho do seed da
// migration) para permitir "Restaurar padrão" e ter um fallback de leitura,
// além das funções de variáveis e de geração de link wa.me usadas pela UI.

import type { Cliente } from '@/lib/types'

export type WhatsAppCategoria =
  | 'onboarding'
  | 'google-ads'
  | 'financeiro'
  | 'entrega'
  | 'prospeccao'
  | 'ciclo-vida'
  | 'outros'

export interface WhatsAppSnippet {
  id:        string
  titulo:    string
  mensagem:  string
  categoria: string
  ordem:     number
  seed:      boolean
}

export const CATEGORIA_LABEL: Record<string, string> = {
  'onboarding':  'Onboarding',
  'google-ads':  'Google Ads',
  'financeiro':  'Financeiro',
  'entrega':     'Entrega',
  'prospeccao':  'Prospecção',
  'ciclo-vida':  'Ciclo de vida',
  'outros':      'Outros',
}

export const CATEGORIA_ORDEM: string[] = [
  'onboarding', 'google-ads', 'financeiro', 'entrega', 'prospeccao', 'ciclo-vida', 'outros',
]

// Variáveis dinâmicas disponíveis nos snippets — espelhadas como chips na UI.
export const WHATSAPP_VARIAVEIS = ['primeiro_nome', 'nome'] as const

/**
 * Substitui {{placeholder}} pelo dado do cliente. Placeholders desconhecidos
 * são preservados como estão (ex.: [link do site] é marcador manual, não toca).
 */
export function resolverVariaveis(texto: string, cliente?: Pick<Cliente, 'nome'> | null): string {
  const nome = cliente?.nome?.trim() ?? ''
  const primeiro = nome.split(' ')[0] ?? ''
  const mapa: Record<string, string> = {
    primeiro_nome: primeiro,
    nome,
  }
  return texto.replace(/\{\{\s*(\w+)\s*\}\}/g, (full, chave: string) =>
    chave in mapa ? mapa[chave] : full,
  )
}

/**
 * Gera o link wa.me. `mensagem` já deve vir com as variáveis resolvidas.
 * Número vazio → link sem texto (usado pelo botão de contato rápido do card).
 */
export function gerarLinkWhatsApp(mensagem: string, numero?: string): string {
  const numeroLimpo = (numero ?? '').replace(/\D/g, '')
  const base = `https://wa.me/${numeroLimpo ? `55${numeroLimpo}` : ''}`
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base
}

// Semente — espelho do seed da migration. Mantém-se sincronizada com ela.
export const WHATSAPP_SNIPPETS_SEED: WhatsAppSnippet[] = [
  { id: 'boas-vindas', titulo: 'Boas-vindas', categoria: 'onboarding', ordem: 10, seed: true,
    mensagem: 'Oi {{primeiro_nome}}, tudo bem? 😊\n\nDeu tudo certo com a assinatura do seu plano, seja muito bem-vindo à Adsgator!\n\nA partir de agora estamos juntos pra colocar o seu negócio em outro nível no Google. Vou te explicar como funciona o processo e o que vou precisar de você pra começarmos.\n\nQualquer dúvida me chama por aqui.' },
  { id: 'como-funciona', titulo: 'Como funciona o processo', categoria: 'onboarding', ordem: 20, seed: true,
    mensagem: '📌 *Como funciona o processo*\n\n1️⃣ *Briefing:* um formulário com as perguntas necessárias sobre a sua marca e o seu negócio.\n\n2️⃣ *Envio dos arquivos:* materiais pra garantir a identidade visual do seu negócio.\n\n3️⃣ *Criação e entrega:* prazo de até 7 dias úteis. Enviamos pra sua aprovação antes da publicação final.' },
  { id: 'o-que-preciso', titulo: 'O que preciso de você', categoria: 'onboarding', ordem: 30, seed: true,
    mensagem: '📌 *O que eu vou precisar de você*\n\n1️⃣ Preenchimento do formulário de briefing (link abaixo).\n\n2️⃣ Envio de arquivos:\n▪ Logo (PNG, SVG ou AI)\n▪ Paleta de cores da marca\n▪ Fontes / tipografia\n▪ Manual de marca (se tiver)\n▪ Fotos do negócio / produtos\n▪ Depoimentos de clientes\n\nNão se preocupe, envie só o que tiver disponível. 😊' },
  { id: 'links-onboarding', titulo: 'Links de onboarding', categoria: 'onboarding', ordem: 40, seed: true,
    mensagem: '➡ *LINK DO FORMULÁRIO:*\nhttps://forms.adsgator.com.br/briefing-pro/\n\n➡ *LINK PARA ENVIO DOS ARQUIVOS:*\n[link da pasta no Drive]\n\nEssa etapa é fundamental pra conhecermos melhor o seu negócio. Qualquer dúvida me chama. 😊' },
  { id: 'convite-call', titulo: 'Convite para call de alinhamento', categoria: 'onboarding', ordem: 50, seed: true,
    mensagem: 'Oi {{primeiro_nome}}, tudo bem?\n\nVim marcar nossa call inicial pra alinharmos a estratégia e tirar todas as dúvidas antes de começar.\n\nTenho disponibilidade nos seguintes horários. Qual funciona melhor pra você? Me confirma a melhor opção que eu te mando o link da chamada. 😊' },
  { id: 'acessos-google', titulo: 'Acessos Google Ads', categoria: 'google-ads', ordem: 60, seed: true,
    mensagem: 'Vou te passar o que vou precisar referente ao Google Ads — algumas informações e acessos. Vi que você já tem o Google Meu Negócio, vou precisar do acesso dele também pra conectar com o Google Ads.\n\n1️⃣ Como criar sua conta no Google Ads e passar sua ID:\nhttps://ajuda.adsgator.com.br/ajuda/como-criar-uma-conta-no-google-ads/\n\n2️⃣ Envie sua ID pra eu mandar o convite de acesso.\n\n3️⃣ Como conceder acesso ao seu Google Meu Negócio:\nhttps://ajuda.adsgator.com.br/ajuda/como-conceder-acesso-do-seu-google-meu-negocio/' },
  { id: 'convite-enviado', titulo: 'Convite de acesso enviado', categoria: 'google-ads', ordem: 70, seed: true,
    mensagem: 'Obrigado! Mandei o convite de acesso pra você. Segue um guia de como aceitar o acesso no Google Ads:\n\nhttps://ajuda.adsgator.com.br/ajuda/como-conceder-acesso-do-google-ads-para-a-adsgator/' },
  { id: 'briefing-google-ads', titulo: 'Briefing Google Ads', categoria: 'google-ads', ordem: 80, seed: true,
    mensagem: 'Perfeito! Estamos quase acabando. Vou te mandar o link do briefing de Google Ads. São só 7 perguntas rápidas que precisamos pra criar sua estratégia:\n\n➡ *LINK DO BRIEFING:*\nhttps://forms.adsgator.com.br/briefing-google-ads/\n\nQualquer dúvida me chama!' },
  { id: 'saldo-baixo', titulo: 'Saldo Google Ads baixo', categoria: 'google-ads', ordem: 90, seed: true,
    mensagem: 'Oi {{primeiro_nome}}! ⚠️\n\nPassando pra avisar que o saldo da sua conta do Google Ads está baixo. Pra garantir que suas campanhas não parem e você não perca leads, recomendo fazer uma recarga o quanto antes. Segue o guia:\n\nhttps://ajuda.adsgator.com.br/ajuda/como-adicionar-saldo-no-google-ads/\n\nQualquer dúvida sobre a recarga, me chama. 😊' },
  { id: 'cadastro-pagamento', titulo: 'Cadastro e pagamento', categoria: 'financeiro', ordem: 100, seed: true,
    mensagem: 'Ótimo, vamos lá!\n\nVou te enviar o link pra realizar o cadastro e o pagamento da sua assinatura. É bem simples e rápido. Assim que for confirmado, já seguimos pros próximos passos.\n\n➡ *LINK CADASTRO E PAGAMENTO:*\nhttps://cliente.adsgator.com.br/step/finalizar-contratacao/' },
  { id: 'cobranca', titulo: 'Lembrete de pagamento', categoria: 'financeiro', ordem: 110, seed: true,
    mensagem: 'Oi {{primeiro_nome}}, tudo bem?\n\nPassando pra avisar que identificamos uma pendência financeira na sua conta. Pra manter suas campanhas ativas, peço que regularize o pagamento assim que possível.\n\nQualquer dúvida estou à disposição.' },
  { id: 'proposta', titulo: 'Envio de proposta', categoria: 'prospeccao', ordem: 120, seed: true,
    mensagem: 'Oi {{primeiro_nome}}! 📄\n\nCom base no nosso diagnóstico, preparei uma proposta personalizada pro seu negócio.\n\nSegue com todos os detalhes: o que está incluído, o investimento e os próximos passos.\n\nSe quiser, podemos marcar uma call rápida pra eu te apresentar ao vivo. Qualquer dúvida me chama. 😊' },
  { id: 'qualificacao', titulo: 'Qualificação de lead', categoria: 'prospeccao', ordem: 130, seed: true,
    mensagem: 'Oi {{primeiro_nome}}, tudo bem?\n\nVi seu interesse em anunciar no Google e queria entender melhor o seu negócio pra ver como posso te ajudar. Pode me responder rapidinho?\n\n✅ Qual é o seu negócio e o principal serviço/produto?\n✅ Qual cidade/região atende?\n✅ Já investe ou investiu em Google Ads antes?\n✅ Qual seria seu orçamento mensal pra anúncios?\n\nCom isso já consigo entender como te ajudar. 🙌' },
  { id: 'followup-proposta', titulo: 'Follow-up de proposta', categoria: 'prospeccao', ordem: 140, seed: true,
    mensagem: 'Oi {{primeiro_nome}}, tudo bem?\n\nPassando pra saber se você teve a oportunidade de analisar a proposta que enviei.\n\nEstou à disposição pra tirar qualquer dúvida ou ajustar algum detalhe conforme a sua necessidade. Me avisa quando puder. 🙏' },
  { id: 'fechamento', titulo: 'Fechamento', categoria: 'prospeccao', ordem: 150, seed: true,
    mensagem: 'Que notícia incrível! 🎉\n\nMuito feliz em ter você como cliente, {{primeiro_nome}}. Vamos colocar seu negócio em outro nível!\n\nSegue o link pra efetuar o pagamento e já dar início ao nosso projeto. Assim que confirmar, entro em contato pra alinharmos os primeiros passos.\n\nQualquer dúvida estou aqui. 😊' },
  { id: 'site-pronto', titulo: 'Site pronto', categoria: 'entrega', ordem: 160, seed: true,
    mensagem: 'Oi {{primeiro_nome}}! Seu site ficou pronto. 🚀\n\nSegue o link pra você acessar:\n🌐 [link do site]\n\nVou deixar também o link da árvore de links pra usar nas suas redes sociais:\n🔗 [link da bio]\n\nSe precisar de algum ajuste é só me avisar por aqui. Espero que goste!' },
  { id: 'reuniao', titulo: 'Convite para reunião', categoria: 'outros', ordem: 170, seed: true,
    mensagem: 'Oi {{primeiro_nome}}, tudo bem?\n\nGostaria de agendar uma reunião rápida (30 min) pra alinharmos os próximos passos das suas campanhas. Qual horário seria melhor pra você?' },
  { id: 'retencao', titulo: 'Retenção de cancelamento', categoria: 'ciclo-vida', ordem: 180, seed: true,
    mensagem: 'Oi {{primeiro_nome}}! 💛\n\nSoube que você está pensando em cancelar e quero entender melhor o que aconteceu.\n\nFique à vontade pra me contar: houve algum problema com os resultados, atendimento ou expectativas?\n\nQuero muito encontrar uma solução pra continuar te ajudando, e se precisar ajustamos o que for necessário. Podemos conversar? 🙏' },
  { id: 'indisponibilidade', titulo: 'Aviso de pausa', categoria: 'ciclo-vida', ordem: 190, seed: true,
    mensagem: 'Oi {{primeiro_nome}}! ⏸️\n\nConforme combinado, suas campanhas foram pausadas temporariamente.\n\nQuando você estiver pronto pra reativar é só me avisar que ativamos tudo de volta em menos de 24h. Qualquer dúvida estou aqui. 😊' },
  { id: 'encerramento', titulo: 'Encerramento de parceria', categoria: 'ciclo-vida', ordem: 200, seed: true,
    mensagem: 'Oi {{primeiro_nome}}! 🤝\n\nFoi um prazer trabalhar com você. Já estou finalizando os processos de encerramento do nosso projeto.\n\nGostaria muito de saber a sua opinião sobre o trabalho realizado. Se puder dedicar 2 minutinhos pra um feedback, seria de grande ajuda. Obrigado por confiar no meu trabalho, e sucesso! 🙌' },
]
