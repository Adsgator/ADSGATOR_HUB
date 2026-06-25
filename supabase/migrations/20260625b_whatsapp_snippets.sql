-- Biblioteca de mensagens de WhatsApp editável (F6).
--
-- Antes os textos viviam hardcoded em dois lugares: o array TEMPLATES dentro de
-- WhatsAppTemplateModal.tsx (envio ao cliente) e WHATSAPP_TEMPLATES em
-- src/lib/fluxo-operacional.ts (prospecção/card). Esta tabela unifica os dois
-- numa fonte editável pela tela — o Lucas adiciona/edita/remove sem mexer em
-- código. Diferente dos email_templates (override sobre um HTML base complexo),
-- aqui o texto é simples e vive INTEIRO no banco; o código guarda apenas a
-- semente (lib/whatsapp.ts) para permitir "Restaurar padrão" nos snippets seed.
--
-- Variáveis dinâmicas usam {{placeholder}} — resolvidas no envio:
--   {{primeiro_nome}}  → primeiro nome do cliente
--   {{nome}}           → nome completo do cliente

CREATE TABLE IF NOT EXISTS whatsapp_snippets (
  id            text PRIMARY KEY,           -- slug (ex.: 'boas-vindas')
  titulo        text NOT NULL,
  mensagem      text NOT NULL,
  categoria     text NOT NULL DEFAULT 'outros',
  ordem         integer NOT NULL DEFAULT 0,
  seed          boolean NOT NULL DEFAULT false,  -- true = veio do código (permite restaurar)
  atualizado_em timestamptz DEFAULT now(),
  atualizado_por uuid REFERENCES auth.users(id)
);

-- Seed unificado dos dois conjuntos antigos, sem duplicatas, na voz da agência.
-- categoria ∈ onboarding | google-ads | financeiro | entrega | prospeccao | ciclo-vida | outros
INSERT INTO whatsapp_snippets (id, titulo, mensagem, categoria, ordem, seed) VALUES
  ('boas-vindas', 'Boas-vindas',
   E'Oi {{primeiro_nome}}, tudo bem? 😊\n\nDeu tudo certo com a assinatura do seu plano, seja muito bem-vindo à Adsgator!\n\nA partir de agora estamos juntos pra colocar o seu negócio em outro nível no Google. Vou te explicar como funciona o processo e o que vou precisar de você pra começarmos.\n\nQualquer dúvida me chama por aqui.',
   'onboarding', 10, true),

  ('como-funciona', 'Como funciona o processo',
   E'📌 *Como funciona o processo*\n\n1️⃣ *Briefing:* um formulário com as perguntas necessárias sobre a sua marca e o seu negócio.\n\n2️⃣ *Envio dos arquivos:* materiais pra garantir a identidade visual do seu negócio.\n\n3️⃣ *Criação e entrega:* prazo de até 7 dias úteis. Enviamos pra sua aprovação antes da publicação final.',
   'onboarding', 20, true),

  ('o-que-preciso', 'O que preciso de você',
   E'📌 *O que eu vou precisar de você*\n\n1️⃣ Preenchimento do formulário de briefing (link abaixo).\n\n2️⃣ Envio de arquivos:\n▪ Logo (PNG, SVG ou AI)\n▪ Paleta de cores da marca\n▪ Fontes / tipografia\n▪ Manual de marca (se tiver)\n▪ Fotos do negócio / produtos\n▪ Depoimentos de clientes\n\nNão se preocupe, envie só o que tiver disponível. 😊',
   'onboarding', 30, true),

  ('links-onboarding', 'Links de onboarding',
   E'➡ *LINK DO FORMULÁRIO:*\nhttps://forms.adsgator.com.br/briefing-pro/\n\n➡ *LINK PARA ENVIO DOS ARQUIVOS:*\n[link da pasta no Drive]\n\nEssa etapa é fundamental pra conhecermos melhor o seu negócio. Qualquer dúvida me chama. 😊',
   'onboarding', 40, true),

  ('convite-call', 'Convite para call de alinhamento',
   E'Oi {{primeiro_nome}}, tudo bem?\n\nVim marcar nossa call inicial pra alinharmos a estratégia e tirar todas as dúvidas antes de começar.\n\nTenho disponibilidade nos seguintes horários. Qual funciona melhor pra você? Me confirma a melhor opção que eu te mando o link da chamada. 😊',
   'onboarding', 50, true),

  ('acessos-google', 'Acessos Google Ads',
   E'Vou te passar o que vou precisar referente ao Google Ads — algumas informações e acessos. Vi que você já tem o Google Meu Negócio, vou precisar do acesso dele também pra conectar com o Google Ads.\n\n1️⃣ Como criar sua conta no Google Ads e passar sua ID:\nhttps://ajuda.adsgator.com.br/ajuda/como-criar-uma-conta-no-google-ads/\n\n2️⃣ Envie sua ID pra eu mandar o convite de acesso.\n\n3️⃣ Como conceder acesso ao seu Google Meu Negócio:\nhttps://ajuda.adsgator.com.br/ajuda/como-conceder-acesso-do-seu-google-meu-negocio/',
   'google-ads', 60, true),

  ('convite-enviado', 'Convite de acesso enviado',
   E'Obrigado! Mandei o convite de acesso pra você. Segue um guia de como aceitar o acesso no Google Ads:\n\nhttps://ajuda.adsgator.com.br/ajuda/como-conceder-acesso-do-google-ads-para-a-adsgator/',
   'google-ads', 70, true),

  ('briefing-google-ads', 'Briefing Google Ads',
   E'Perfeito! Estamos quase acabando. Vou te mandar o link do briefing de Google Ads. São só 7 perguntas rápidas que precisamos pra criar sua estratégia:\n\n➡ *LINK DO BRIEFING:*\nhttps://forms.adsgator.com.br/briefing-google-ads/\n\nQualquer dúvida me chama!',
   'google-ads', 80, true),

  ('saldo-baixo', 'Saldo Google Ads baixo',
   E'Oi {{primeiro_nome}}! ⚠️\n\nPassando pra avisar que o saldo da sua conta do Google Ads está baixo. Pra garantir que suas campanhas não parem e você não perca leads, recomendo fazer uma recarga o quanto antes. Segue o guia:\n\nhttps://ajuda.adsgator.com.br/ajuda/como-adicionar-saldo-no-google-ads/\n\nQualquer dúvida sobre a recarga, me chama. 😊',
   'google-ads', 90, true),

  ('cadastro-pagamento', 'Cadastro e pagamento',
   E'Ótimo, vamos lá!\n\nVou te enviar o link pra realizar o cadastro e o pagamento da sua assinatura. É bem simples e rápido. Assim que for confirmado, já seguimos pros próximos passos.\n\n➡ *LINK CADASTRO E PAGAMENTO:*\nhttps://cliente.adsgator.com.br/step/finalizar-contratacao/',
   'financeiro', 100, true),

  ('cobranca', 'Lembrete de pagamento',
   E'Oi {{primeiro_nome}}, tudo bem?\n\nPassando pra avisar que identificamos uma pendência financeira na sua conta. Pra manter suas campanhas ativas, peço que regularize o pagamento assim que possível.\n\nQualquer dúvida estou à disposição.',
   'financeiro', 110, true),

  ('proposta', 'Envio de proposta',
   E'Oi {{primeiro_nome}}! 📄\n\nCom base no nosso diagnóstico, preparei uma proposta personalizada pro seu negócio.\n\nSegue com todos os detalhes: o que está incluído, o investimento e os próximos passos.\n\nSe quiser, podemos marcar uma call rápida pra eu te apresentar ao vivo. Qualquer dúvida me chama. 😊',
   'prospeccao', 120, true),

  ('qualificacao', 'Qualificação de lead',
   E'Oi {{primeiro_nome}}, tudo bem?\n\nVi seu interesse em anunciar no Google e queria entender melhor o seu negócio pra ver como posso te ajudar. Pode me responder rapidinho?\n\n✅ Qual é o seu negócio e o principal serviço/produto?\n✅ Qual cidade/região atende?\n✅ Já investe ou investiu em Google Ads antes?\n✅ Qual seria seu orçamento mensal pra anúncios?\n\nCom isso já consigo entender como te ajudar. 🙌',
   'prospeccao', 130, true),

  ('followup-proposta', 'Follow-up de proposta',
   E'Oi {{primeiro_nome}}, tudo bem?\n\nPassando pra saber se você teve a oportunidade de analisar a proposta que enviei.\n\nEstou à disposição pra tirar qualquer dúvida ou ajustar algum detalhe conforme a sua necessidade. Me avisa quando puder. 🙏',
   'prospeccao', 140, true),

  ('fechamento', 'Fechamento',
   E'Que notícia incrível! 🎉\n\nMuito feliz em ter você como cliente, {{primeiro_nome}}. Vamos colocar seu negócio em outro nível!\n\nSegue o link pra efetuar o pagamento e já dar início ao nosso projeto. Assim que confirmar, entro em contato pra alinharmos os primeiros passos.\n\nQualquer dúvida estou aqui. 😊',
   'prospeccao', 150, true),

  ('site-pronto', 'Site pronto',
   E'Oi {{primeiro_nome}}! Seu site ficou pronto. 🚀\n\nSegue o link pra você acessar:\n🌐 [link do site]\n\nVou deixar também o link da árvore de links pra usar nas suas redes sociais:\n🔗 [link da bio]\n\nSe precisar de algum ajuste é só me avisar por aqui. Espero que goste!',
   'entrega', 160, true),

  ('reuniao', 'Convite para reunião',
   E'Oi {{primeiro_nome}}, tudo bem?\n\nGostaria de agendar uma reunião rápida (30 min) pra alinharmos os próximos passos das suas campanhas. Qual horário seria melhor pra você?',
   'outros', 170, true),

  ('retencao', 'Retenção de cancelamento',
   E'Oi {{primeiro_nome}}! 💛\n\nSoube que você está pensando em cancelar e quero entender melhor o que aconteceu.\n\nFique à vontade pra me contar: houve algum problema com os resultados, atendimento ou expectativas?\n\nQuero muito encontrar uma solução pra continuar te ajudando, e se precisar ajustamos o que for necessário. Podemos conversar? 🙏',
   'ciclo-vida', 180, true),

  ('indisponibilidade', 'Aviso de pausa',
   E'Oi {{primeiro_nome}}! ⏸️\n\nConforme combinado, suas campanhas foram pausadas temporariamente.\n\nQuando você estiver pronto pra reativar é só me avisar que ativamos tudo de volta em menos de 24h. Qualquer dúvida estou aqui. 😊',
   'ciclo-vida', 190, true),

  ('encerramento', 'Encerramento de parceria',
   E'Oi {{primeiro_nome}}! 🤝\n\nFoi um prazer trabalhar com você. Já estou finalizando os processos de encerramento do nosso projeto.\n\nGostaria muito de saber a sua opinião sobre o trabalho realizado. Se puder dedicar 2 minutinhos pra um feedback, seria de grande ajuda. Obrigado por confiar no meu trabalho, e sucesso! 🙌',
   'ciclo-vida', 200, true)
ON CONFLICT (id) DO NOTHING;

-- RLS: operador único — qualquer usuário autenticado lê e edita.
ALTER TABLE whatsapp_snippets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users read snippets" ON whatsapp_snippets;
CREATE POLICY "Auth users read snippets" ON whatsapp_snippets
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users write snippets" ON whatsapp_snippets;
CREATE POLICY "Auth users write snippets" ON whatsapp_snippets
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
