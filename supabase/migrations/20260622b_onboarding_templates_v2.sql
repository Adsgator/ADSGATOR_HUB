-- Onboarding templates v2 — completa o conteúdo dos 3 caminhos.
-- Acrescenta o que faltou do fluxo descrito pelo Lucas:
--   - responsavel por etapa ('cliente' = cobrar ele | 'agencia' = tarefa minha)
--   - lembretes 24h/72h (lembrete_horas) + mensagem de lembrete pronta
--   - confirmação de recebimento do briefing antes de seguir
--   - sub-fluxo "cliente não tem GMN → eu crio e devolvo acesso"
--
-- Faz UPDATE (não INSERT) — os templates já existem da migration anterior.
-- Idempotente: reescreve os steps pelo name+scope. Não toca em instâncias já
-- criadas (elas guardam o próprio current_step_id; ao recriar uma instância, ela
-- pega os steps novos).
--
-- Aplicar manualmente no SQL Editor do dashboard Supabase.

-- ── COMBO (LP + Tráfego) ────────────────────────────────────────────────────
UPDATE timeline_templates SET steps = $steps$[
  {
    "id": "boasvindas",
    "order": 1,
    "title": "Boas-vindas",
    "type": "action",
    "responsavel": "agencia",
    "content": "Confira o cadastro, dê as boas-vindas no WhatsApp e tire dúvidas iniciais antes de seguir.",
    "messages": [
      { "id": "m1", "role": "instruction", "text": "Confira os dados do cadastro (nome, WhatsApp, e-mail, plano). Personalize a mensagem se precisar." },
      { "id": "m2", "role": "template", "copyable": true, "text": "Bom dia, {{primeiro_nome}}! Tudo bem?\n\nDeu tudo certo com a assinatura do seu plano, seja muito bem-vindo(a) à Adsgator! 😊\n\nVou te explicar como funciona o processo e o que vou precisar de você para darmos início." }
    ]
  },
  {
    "id": "briefing",
    "order": 2,
    "title": "Briefing + Assets",
    "type": "action",
    "responsavel": "cliente",
    "duration_days": 3,
    "lembrete_horas": [24, 72],
    "lembrete_mensagem": "Oi, {{primeiro_nome}}! Tudo bem? 😊\n\nPassando para lembrar do preenchimento do briefing e do envio dos materiais na pasta do Drive. Assim que você enviar, já consigo dar início à criação da sua página!\n\nQualquer dúvida, é só me chamar.",
    "content": "Envie os links de briefing e Drive (pasta própria do cliente). A bola fica com o cliente — lembretes em 24h e 72h se não houver movimento.",
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
    "id": "confirma_briefing",
    "order": 3,
    "title": "Confirmar recebimento",
    "type": "action",
    "responsavel": "agencia",
    "content": "Recebeu briefing e assets? Confirme com o cliente que vai iniciar o desenvolvimento.",
    "messages": [
      { "id": "m1", "role": "template", "copyable": true, "text": "Recebi tudo certinho, {{primeiro_nome}}! ✅\n\nMuito obrigado. A partir de agora já inicio a criação da sua página com base no seu briefing e nos materiais que você enviou.\n\nQualquer novidade eu te aviso por aqui! 😊" }
    ]
  },
  {
    "id": "desenvolvimento",
    "order": 4,
    "title": "Desenvolvimento da LP (interno)",
    "type": "check",
    "responsavel": "agencia",
    "duration_days": 7,
    "content": "Trabalho interno: ler briefing, conferir assets, criar a LP no Astroteca, comprar domínio, configurar DNS. Cliente não participa até a aprovação.",
    "messages": [
      { "id": "m1", "role": "instruction", "text": "Etapa interna — sem mensagem ao cliente. Checklist: ler briefing • conferir assets • criar projeto no Astroteca • comprar domínio • configurar DNS. Avance quando a página estiver pronta para aprovação." }
    ]
  },
  {
    "id": "aprovacao",
    "order": 5,
    "title": "Aprovação da LP",
    "type": "action",
    "responsavel": "cliente",
    "lembrete_horas": [48],
    "lembrete_mensagem": "Oi, {{primeiro_nome}}! Conseguiu dar uma olhada na sua página? 😊\n\nFico no aguardo do seu retorno para seguirmos com os ajustes finais (se houver) e a publicação.",
    "content": "Envie a página pronta para o cliente aprovar. Bola com o cliente — lembrete em 48h.",
    "messages": [
      { "id": "m1", "role": "template", "copyable": true, "text": "{{primeiro_nome}}, sua página está pronta! 🎉\n\nSegue o link para você acessar e revisar:\n🌐 [cole o link do site]\n\nDá uma olhada com calma. Se precisar de algum ajuste, é só me avisar por aqui. Espero que goste! 😊" }
    ]
  },
  {
    "id": "acessos_google",
    "order": 6,
    "title": "Acessos Google (Ads + GMN)",
    "type": "action",
    "responsavel": "cliente",
    "lembrete_horas": [24],
    "lembrete_mensagem": "Oi, {{primeiro_nome}}! 😊\n\nPassando para lembrar dos acessos do Google Ads e do Google Meu Negócio. Assim que você criar a conta e me enviar a ID, já sigo com a configuração das suas campanhas!",
    "content": "Peça a criação da conta Google Ads (ID) e o acesso ao Google Meu Negócio. Anote a ID no campo abaixo quando o cliente enviar.",
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
    "id": "sem_gmn",
    "order": 7,
    "title": "Cliente não tem GMN (opcional)",
    "type": "action",
    "responsavel": "agencia",
    "content": "Use esta etapa SÓ se o cliente não tiver Google Meu Negócio. Você cria o perfil e devolve o acesso de proprietário. Se ele já tem GMN, marque como feito e siga.",
    "messages": [
      { "id": "m1", "role": "template", "copyable": true, "text": "Sem problema, {{primeiro_nome}}! Eu crio o seu Google Meu Negócio então. 😊\n\nAssim que estiver pronto, te envio o acesso de proprietário do perfil. Qualquer informação que eu precisar do seu negócio, te chamo por aqui." }
    ]
  },
  {
    "id": "convite_acesso",
    "order": 8,
    "title": "Convite de acesso enviado",
    "type": "action",
    "responsavel": "cliente",
    "content": "Após receber a ID, envie o convite no Google Ads e o guia de aceite.",
    "messages": [
      { "id": "m1", "role": "template", "copyable": true, "text": "Mandei o convite de acesso para você no Google Ads!\n\nAgora é só você aceitar o acesso usando este guia:\nhttps://ajuda.adsgator.com.br/ajuda/como-conceder-acesso-do-google-ads-para-a-adsgator/" }
    ]
  },
  {
    "id": "finalizacao",
    "order": 9,
    "title": "Conferência final",
    "type": "check",
    "responsavel": "agencia",
    "content": "Confirme: acesso ao GMN, número verificado no Google Ads, conta pronta. Onboarding concluído — cliente entra na operação.",
    "messages": [
      { "id": "m1", "role": "instruction", "text": "Checklist final: acesso ao GMN confirmado • número verificado no Ads • conta pronta para iniciar campanhas. Ao concluir, o cliente entra na operação." }
    ]
  }
]$steps$::jsonb
WHERE name = 'Onboarding — Combo (LP + Tráfego)' AND scope = 'per_client';

-- ── SÓ TRÁFEGO ──────────────────────────────────────────────────────────────
UPDATE timeline_templates SET steps = $steps$[
  {
    "id": "boasvindas",
    "order": 1,
    "title": "Boas-vindas",
    "type": "action",
    "responsavel": "agencia",
    "content": "Confira o cadastro, dê as boas-vindas e explique que vamos direto aos acessos.",
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
    "responsavel": "cliente",
    "lembrete_horas": [24],
    "lembrete_mensagem": "Oi, {{primeiro_nome}}! 😊\n\nPassando para lembrar dos acessos do Google Ads e do Google Meu Negócio. Assim que criar a conta e me enviar a ID, já sigo com a configuração!",
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
    "id": "sem_gmn",
    "order": 3,
    "title": "Cliente não tem GMN (opcional)",
    "type": "action",
    "responsavel": "agencia",
    "content": "Use SÓ se o cliente não tiver Google Meu Negócio. Você cria e devolve o acesso. Caso ele já tenha, marque como feito e siga.",
    "messages": [
      { "id": "m1", "role": "template", "copyable": true, "text": "Sem problema, {{primeiro_nome}}! Eu crio o seu Google Meu Negócio então. 😊\n\nAssim que estiver pronto, te envio o acesso de proprietário do perfil." }
    ]
  },
  {
    "id": "convite_acesso",
    "order": 4,
    "title": "Convite de acesso enviado",
    "type": "action",
    "responsavel": "cliente",
    "content": "Após receber a ID, envie o convite no Google Ads e o guia de aceite.",
    "messages": [
      { "id": "m1", "role": "template", "copyable": true, "text": "Mandei o convite de acesso para você no Google Ads!\n\nAgora é só você aceitar o acesso usando este guia:\nhttps://ajuda.adsgator.com.br/ajuda/como-conceder-acesso-do-google-ads-para-a-adsgator/" }
    ]
  },
  {
    "id": "briefing_ga",
    "order": 5,
    "title": "Briefing Google Ads",
    "type": "action",
    "responsavel": "cliente",
    "lembrete_horas": [48],
    "lembrete_mensagem": "Oi, {{primeiro_nome}}! 😊 Passando para lembrar do briefing de Google Ads — é rápido e me ajuda a montar sua estratégia. Qualquer dúvida, me chama!",
    "content": "Envie o briefing de Google Ads para montar a estratégia.",
    "messages": [
      { "id": "m1", "role": "template", "copyable": true, "text": "Perfeito! Estamos quase lá. Vou te mandar o briefing de Google Ads — são só algumas perguntas rápidas que preciso para criar sua estratégia:\n\n➡ *LINK DO BRIEFING:*\nhttps://forms.adsgator.com.br/briefing-google-ads/\n\nQualquer dúvida, é só me chamar! 😊" }
    ]
  },
  {
    "id": "finalizacao",
    "order": 6,
    "title": "Conferência final",
    "type": "check",
    "responsavel": "agencia",
    "content": "Confirme acesso GMN, número verificado e tudo pronto para iniciar o tráfego.",
    "messages": [
      { "id": "m1", "role": "instruction", "text": "Checklist final: acesso ao GMN • número verificado no Ads • conta pronta. Onboarding concluído." }
    ]
  }
]$steps$::jsonb
WHERE name = 'Onboarding — Só Tráfego' AND scope = 'per_client';

-- ── SÓ LANDING PAGE ─────────────────────────────────────────────────────────
UPDATE timeline_templates SET steps = $steps$[
  {
    "id": "boasvindas",
    "order": 1,
    "title": "Boas-vindas",
    "type": "action",
    "responsavel": "agencia",
    "content": "Confira o cadastro e dê as boas-vindas.",
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
    "responsavel": "cliente",
    "duration_days": 3,
    "lembrete_horas": [24, 72],
    "lembrete_mensagem": "Oi, {{primeiro_nome}}! Tudo bem? 😊\n\nPassando para lembrar do preenchimento do briefing e do envio dos materiais na pasta do Drive. Assim que você enviar, já consigo dar início à criação da sua página!\n\nQualquer dúvida, é só me chamar.",
    "content": "Envie os links de briefing e Drive (pasta própria do cliente). Lembretes em 24h e 72h.",
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
    "id": "confirma_briefing",
    "order": 3,
    "title": "Confirmar recebimento",
    "type": "action",
    "responsavel": "agencia",
    "content": "Recebeu briefing e assets? Confirme com o cliente que vai iniciar.",
    "messages": [
      { "id": "m1", "role": "template", "copyable": true, "text": "Recebi tudo certinho, {{primeiro_nome}}! ✅\n\nMuito obrigado. A partir de agora já inicio a criação da sua página com base no seu briefing e nos materiais que você enviou.\n\nQualquer novidade eu te aviso por aqui! 😊" }
    ]
  },
  {
    "id": "desenvolvimento",
    "order": 4,
    "title": "Desenvolvimento da LP (interno)",
    "type": "check",
    "responsavel": "agencia",
    "duration_days": 7,
    "content": "Trabalho interno: ler briefing, conferir assets, criar a LP no Astroteca, comprar domínio, configurar DNS.",
    "messages": [
      { "id": "m1", "role": "instruction", "text": "Etapa interna — sem mensagem ao cliente. Checklist: ler briefing • conferir assets • criar projeto no Astroteca • comprar domínio • configurar DNS. Avance quando a página estiver pronta." }
    ]
  },
  {
    "id": "entrega",
    "order": 5,
    "title": "Entrega e aprovação",
    "type": "action",
    "responsavel": "cliente",
    "lembrete_horas": [48],
    "lembrete_mensagem": "Oi, {{primeiro_nome}}! Conseguiu dar uma olhada na sua página? 😊 Fico no aguardo do seu retorno para finalizarmos!",
    "content": "Envie a página pronta para o cliente.",
    "messages": [
      { "id": "m1", "role": "template", "copyable": true, "text": "{{primeiro_nome}}, sua página está pronta! 🎉\n\nSegue o link para você acessar:\n🌐 [cole o link do site]\n\nVou deixar também o link da árvore de links para usar nas suas redes sociais:\n🔗 [cole o link da bio]\n\nSe precisar de algum ajuste, é só me avisar por aqui. Espero que goste! 😊" }
    ]
  }
]$steps$::jsonb
WHERE name = 'Onboarding — Só Landing Page' AND scope = 'per_client';
