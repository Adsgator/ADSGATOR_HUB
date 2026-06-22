-- Templates de onboarding (3 caminhos: combo, só tráfego, só LP).
-- Cada template é uma timeline (type 'onboarding', scope 'per_client') com steps
-- que carregam as mensagens prontas (padrão de voz do Lucas), variáveis
-- {{primeiro_nome}} / {{drive_url}} e campos preenchíveis (input_fields).
--
-- Idempotente: ON CONFLICT (name, scope) não recria. Para reescrever os steps de
-- um template já existente, edite via UI ou rode um UPDATE manual.
--
-- Aplicar manualmente no SQL Editor do dashboard Supabase (fluxo do projeto).
-- As mensagens usam \n para quebra de linha — o JSONB preserva.

-- ── Caminho 1: COMBO (Landing Page + Tráfego) ───────────────────────────────
INSERT INTO timeline_templates (name, type, description, scope, icon, color, is_active, is_default, steps)
VALUES (
  'Onboarding — Combo (LP + Tráfego)',
  'onboarding',
  'Cliente que contratou landing page e gestão de tráfego. Fluxo completo: briefing → desenvolvimento → acessos Google → publicação.',
  'per_client',
  'Rocket',
  '#FFB100',
  true,
  false,
  $steps$[
    {
      "id": "boasvindas",
      "order": 1,
      "title": "Boas-vindas",
      "type": "action",
      "content": "Confirme o cadastro, dê as boas-vindas no WhatsApp e tire dúvidas iniciais.",
      "messages": [
        { "id": "m1", "role": "instruction", "text": "Confira os dados do cadastro antes de enviar. Personalize se precisar." },
        { "id": "m2", "role": "template", "copyable": true, "text": "Bom dia, {{primeiro_nome}}! Tudo bem?\n\nDeu tudo certo com a assinatura do seu plano, seja muito bem-vindo(a) à Adsgator! 😊\n\nVou te explicar como funciona o processo e o que vou precisar de você para darmos início." }
      ]
    },
    {
      "id": "briefing",
      "order": 2,
      "title": "Briefing + Assets",
      "type": "action",
      "duration_days": 3,
      "content": "Envie o formulário de briefing e o link da pasta do Drive (própria do cliente). Acompanhe o preenchimento.",
      "messages": [
        { "id": "m1", "role": "template", "copyable": true, "text": "Próximo passo: vou te enviar 2 links para você usar agora 👇" },
        { "id": "m2", "role": "template", "copyable": true, "text": "📋 *O FORMULÁRIO*\nEste é o briefing da sua marca. Ele nos ajuda a entender seu negócio e criar algo que combine 100% com você.\n\nLink do briefing:\nhttps://forms.adsgator.com.br/briefing-pro/\n\n📁 *OS ARQUIVOS*\nPreparei uma pasta no Google Drive para você enviar os arquivos. Basta enviar o que tiver disponível.\n\nSeguem alguns exemplos:\n- Logo, cores, fontes\n- Fotos do seu negócio/produtos\n- Depoimentos de clientes\n- Qualquer coisa que represente sua marca\n\nLink do Google Drive:\n{{drive_url}}" },
        { "id": "m3", "role": "template", "copyable": true, "text": "⏰ *CRONOGRAMA*\n\nApós você enviar tudo, nosso processo é:\n✓ Recebo e confirmo aqui\n✓ Analiso o briefing e os arquivos, para entender sua marca\n✓ Crio a estrutura e o layout da página\n✓ Reviso, ajusto detalhes e te envio para aprovação\n✓ Você avalia e aprova (ou pede ajustes)\n✓ Realizamos os ajustes e finalizamos\n✓ Publicamos sua página no ar!\n\nTempo total de desenvolvimento após a entrega dos materiais: até 7 dias úteis." },
        { "id": "m4", "role": "template", "copyable": true, "text": "Se precisar de alguma coisa ou tiver alguma dúvida, é só me chamar! 😊" }
      ],
      "input_fields": [
        { "id": "drive_url", "label": "Link da pasta do Drive deste cliente", "type": "url", "required": true, "placeholder": "https://drive.google.com/drive/folders/..." }
      ]
    },
    {
      "id": "desenvolvimento",
      "order": 3,
      "title": "Desenvolvimento da LP (interno)",
      "type": "check",
      "duration_days": 7,
      "content": "Trabalho interno: ler briefing, conferir assets, criar a LP no Astroteca, comprar domínio, configurar DNS. Cliente não participa até a aprovação.",
      "messages": [
        { "id": "m1", "role": "instruction", "text": "Etapa interna — sem mensagem ao cliente. Avance quando a página estiver pronta para aprovação." }
      ]
    },
    {
      "id": "aprovacao",
      "order": 4,
      "title": "Aprovação da LP",
      "type": "action",
      "content": "Envie a página pronta para o cliente aprovar.",
      "messages": [
        { "id": "m1", "role": "template", "copyable": true, "text": "{{primeiro_nome}}, sua página está pronta! 🎉\n\nSegue o link para você acessar e revisar:\n🌐 [cole o link do site]\n\nDá uma olhada com calma. Se precisar de algum ajuste, é só me avisar por aqui. Espero que goste! 😊" }
      ]
    },
    {
      "id": "acessos_google",
      "order": 5,
      "title": "Acessos Google (Ads + GMN)",
      "type": "action",
      "content": "Peça a criação da conta Google Ads (ID) e o acesso ao Google Meu Negócio.",
      "messages": [
        { "id": "m1", "role": "template", "copyable": true, "text": "Próximo passo: vou te enviar os guias para configurar tudo no Google Ads.\n\nVou precisar de duas coisas de você:\n1️⃣ Criar sua conta no Google Ads e me passar a ID dela\n2️⃣ Dar acesso ao seu Google Meu Negócio para eu conectar com o Google Ads\n\nSegue as informações abaixo! 👇" },
        { "id": "m2", "role": "template", "copyable": true, "text": "📊 *GOOGLE ADS*\nAqui você cria sua conta e pega a ID para que eu te mande o convite de acesso.\n\nLink do guia:\nhttps://ajuda.adsgator.com.br/ajuda/como-criar-uma-conta-no-google-ads/\n\nAssim que criar, me envia a ID por aqui!\n\n🏢 *GOOGLE MEU NEGÓCIO*\nUse este guia para nos dar acesso ao seu perfil.\n\nLink do guia:\nhttps://ajuda.adsgator.com.br/ajuda/como-conceder-acesso-do-seu-google-meu-negocio/" },
        { "id": "m3", "role": "template", "copyable": true, "text": "Qualquer dúvida, é só me falar! 😊" }
      ],
      "input_fields": [
        { "id": "google_ads_customer_id", "label": "ID da conta Google Ads (enviada pelo cliente)", "type": "text", "placeholder": "000-000-0000" }
      ]
    },
    {
      "id": "convite_acesso",
      "order": 6,
      "title": "Convite de acesso enviado",
      "type": "action",
      "content": "Após receber a ID, envie o convite no Google Ads e o guia de aceite.",
      "messages": [
        { "id": "m1", "role": "template", "copyable": true, "text": "Mandei o convite de acesso para você no Google Ads!\n\nAgora é só você aceitar o acesso usando este guia:\nhttps://ajuda.adsgator.com.br/ajuda/como-conceder-acesso-do-google-ads-para-a-adsgator/" }
      ]
    },
    {
      "id": "finalizacao",
      "order": 7,
      "title": "Conferência final",
      "type": "check",
      "content": "Confirme acesso GMN, número verificado no Google Ads e que está tudo certo para iniciar o tráfego.",
      "messages": [
        { "id": "m1", "role": "instruction", "text": "Confirme: acesso ao GMN, número verificado no Ads, conta pronta. Onboarding concluído — cliente entra na operação." }
      ]
    }
  ]$steps$::jsonb
)
ON CONFLICT (name, scope) DO NOTHING;

-- ── Caminho 2: SÓ TRÁFEGO (cliente já tem site) ─────────────────────────────
INSERT INTO timeline_templates (name, type, description, scope, icon, color, is_active, is_default, steps)
VALUES (
  'Onboarding — Só Tráfego',
  'onboarding',
  'Cliente que já tem site e contratou apenas gestão de tráfego. Pula briefing/desenvolvimento, vai direto aos acessos Google.',
  'per_client',
  'TrendingUp',
  '#3b82f6',
  true,
  false,
  $steps$[
    {
      "id": "boasvindas",
      "order": 1,
      "title": "Boas-vindas",
      "type": "action",
      "content": "Confirme o cadastro, dê as boas-vindas e explique que vamos direto para os acessos.",
      "messages": [
        { "id": "m1", "role": "instruction", "text": "Confira os dados do cadastro antes de enviar." },
        { "id": "m2", "role": "template", "copyable": true, "text": "Bom dia, {{primeiro_nome}}! Tudo bem?\n\nDeu tudo certo com a assinatura do seu plano, seja muito bem-vindo(a) à Adsgator! 😊\n\nComo você já tem o site, vamos direto configurar o Google Ads para iniciar suas campanhas. Já te explico o que vou precisar." }
      ]
    },
    {
      "id": "acessos_google",
      "order": 2,
      "title": "Acessos Google (Ads + GMN)",
      "type": "action",
      "content": "Peça a criação/ID da conta Google Ads e o acesso ao Google Meu Negócio.",
      "messages": [
        { "id": "m1", "role": "template", "copyable": true, "text": "Próximo passo: vou te enviar os guias para configurar tudo no Google Ads.\n\nVou precisar de duas coisas de você:\n1️⃣ Criar sua conta no Google Ads e me passar a ID dela\n2️⃣ Dar acesso ao seu Google Meu Negócio para eu conectar com o Google Ads\n\nSegue as informações abaixo! 👇" },
        { "id": "m2", "role": "template", "copyable": true, "text": "📊 *GOOGLE ADS*\nAqui você cria sua conta e pega a ID para que eu te mande o convite de acesso.\n\nLink do guia:\nhttps://ajuda.adsgator.com.br/ajuda/como-criar-uma-conta-no-google-ads/\n\nAssim que criar, me envia a ID por aqui!\n\n🏢 *GOOGLE MEU NEGÓCIO*\nUse este guia para nos dar acesso ao seu perfil.\n\nLink do guia:\nhttps://ajuda.adsgator.com.br/ajuda/como-conceder-acesso-do-seu-google-meu-negocio/" },
        { "id": "m3", "role": "template", "copyable": true, "text": "Qualquer dúvida, é só me falar! 😊" }
      ],
      "input_fields": [
        { "id": "google_ads_customer_id", "label": "ID da conta Google Ads (enviada pelo cliente)", "type": "text", "placeholder": "000-000-0000" }
      ]
    },
    {
      "id": "convite_acesso",
      "order": 3,
      "title": "Convite de acesso enviado",
      "type": "action",
      "content": "Após receber a ID, envie o convite no Google Ads e o guia de aceite.",
      "messages": [
        { "id": "m1", "role": "template", "copyable": true, "text": "Mandei o convite de acesso para você no Google Ads!\n\nAgora é só você aceitar o acesso usando este guia:\nhttps://ajuda.adsgator.com.br/ajuda/como-conceder-acesso-do-google-ads-para-a-adsgator/" }
      ]
    },
    {
      "id": "briefing_ga",
      "order": 4,
      "title": "Briefing Google Ads",
      "type": "action",
      "content": "Envie o briefing de Google Ads para montar a estratégia.",
      "messages": [
        { "id": "m1", "role": "template", "copyable": true, "text": "Perfeito! Estamos quase lá. Vou te mandar o briefing de Google Ads — são só algumas perguntas rápidas que preciso para criar sua estratégia:\n\n➡ *LINK DO BRIEFING:*\nhttps://forms.adsgator.com.br/briefing-google-ads/\n\nQualquer dúvida, é só me chamar! 😊" }
      ]
    },
    {
      "id": "finalizacao",
      "order": 5,
      "title": "Conferência final",
      "type": "check",
      "content": "Confirme acesso GMN, número verificado e tudo pronto para iniciar o tráfego.",
      "messages": [
        { "id": "m1", "role": "instruction", "text": "Confirme: acesso ao GMN, número verificado no Ads, conta pronta. Onboarding concluído." }
      ]
    }
  ]$steps$::jsonb
)
ON CONFLICT (name, scope) DO NOTHING;

-- ── Caminho 3: SÓ LANDING PAGE (compra única, sem tráfego) ──────────────────
INSERT INTO timeline_templates (name, type, description, scope, icon, color, is_active, is_default, steps)
VALUES (
  'Onboarding — Só Landing Page',
  'onboarding',
  'Cliente que contratou apenas a landing page (sem tráfego). Briefing → desenvolvimento → entrega. Sem acessos Google.',
  'per_client',
  'Layout',
  '#8b5cf6',
  true,
  false,
  $steps$[
    {
      "id": "boasvindas",
      "order": 1,
      "title": "Boas-vindas",
      "type": "action",
      "content": "Confirme o cadastro e dê as boas-vindas.",
      "messages": [
        { "id": "m1", "role": "instruction", "text": "Confira os dados do cadastro antes de enviar." },
        { "id": "m2", "role": "template", "copyable": true, "text": "Bom dia, {{primeiro_nome}}! Tudo bem?\n\nDeu tudo certo com a contratação, seja muito bem-vindo(a) à Adsgator! 😊\n\nVou te explicar como funciona o processo de criação da sua página e o que vou precisar de você para começarmos." }
      ]
    },
    {
      "id": "briefing",
      "order": 2,
      "title": "Briefing + Assets",
      "type": "action",
      "duration_days": 3,
      "content": "Envie o formulário de briefing e o link da pasta do Drive (própria do cliente).",
      "messages": [
        { "id": "m1", "role": "template", "copyable": true, "text": "Próximo passo: vou te enviar 2 links para você usar agora 👇" },
        { "id": "m2", "role": "template", "copyable": true, "text": "📋 *O FORMULÁRIO*\nEste é o briefing da sua marca. Ele nos ajuda a entender seu negócio e criar algo que combine 100% com você.\n\nLink do briefing:\nhttps://forms.adsgator.com.br/briefing-pro/\n\n📁 *OS ARQUIVOS*\nPreparei uma pasta no Google Drive para você enviar os arquivos. Basta enviar o que tiver disponível.\n\nSeguem alguns exemplos:\n- Logo, cores, fontes\n- Fotos do seu negócio/produtos\n- Depoimentos de clientes\n- Qualquer coisa que represente sua marca\n\nLink do Google Drive:\n{{drive_url}}" },
        { "id": "m3", "role": "template", "copyable": true, "text": "⏰ *CRONOGRAMA*\n\nApós você enviar tudo, nosso processo é:\n✓ Recebo e confirmo aqui\n✓ Analiso o briefing e os arquivos, para entender sua marca\n✓ Crio a estrutura e o layout da página\n✓ Reviso, ajusto detalhes e te envio para aprovação\n✓ Você avalia e aprova (ou pede ajustes)\n✓ Realizamos os ajustes e finalizamos\n✓ Publicamos sua página no ar!\n\nTempo total de desenvolvimento após a entrega dos materiais: até 7 dias úteis." },
        { "id": "m4", "role": "template", "copyable": true, "text": "Se precisar de alguma coisa ou tiver alguma dúvida, é só me chamar! 😊" }
      ],
      "input_fields": [
        { "id": "drive_url", "label": "Link da pasta do Drive deste cliente", "type": "url", "required": true, "placeholder": "https://drive.google.com/drive/folders/..." }
      ]
    },
    {
      "id": "desenvolvimento",
      "order": 3,
      "title": "Desenvolvimento da LP (interno)",
      "type": "check",
      "duration_days": 7,
      "content": "Trabalho interno: ler briefing, conferir assets, criar a LP no Astroteca, comprar domínio, configurar DNS.",
      "messages": [
        { "id": "m1", "role": "instruction", "text": "Etapa interna — sem mensagem ao cliente. Avance quando a página estiver pronta para aprovação." }
      ]
    },
    {
      "id": "entrega",
      "order": 4,
      "title": "Entrega e aprovação",
      "type": "action",
      "content": "Envie a página pronta para o cliente.",
      "messages": [
        { "id": "m1", "role": "template", "copyable": true, "text": "{{primeiro_nome}}, sua página está pronta! 🎉\n\nSegue o link para você acessar:\n🌐 [cole o link do site]\n\nVou deixar também o link da árvore de links para usar nas suas redes sociais:\n🔗 [cole o link da bio]\n\nSe precisar de algum ajuste, é só me avisar por aqui. Espero que goste! 😊" }
      ]
    }
  ]$steps$::jsonb
)
ON CONFLICT (name, scope) DO NOTHING;
