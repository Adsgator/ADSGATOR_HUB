export interface ChangelogEntry {
  versao:   string
  data:     string  // YYYY-MM-DD
  novidades: string[]
}

// ⚠️ Mantenha em dia: toda feature visível ao usuário entra aqui no mesmo
// commit em que é entregue (nova entrada no topo; VERSAO_ATUAL deriva dela).
export const CHANGELOG: ChangelogEntry[] = [
  {
    versao: '0.36.0',
    data:   '2026-06-26',
    novidades: [
      'A Gator ficou mais eficiente (e barata) por dentro: quando ela consulta listas grandes — clientes, lançamentos do mês, analytics — agora recebe só o essencial de cada item mais o total, em vez do dado cru inteiro. Isso libera "espaço de pensamento" pra raciocinar sobre mais coisas na mesma resposta e reduz o custo por consulta, sem você notar diferença no que ela te entrega',
      'Em lista de lançamentos ela já recebe a soma do período junto, e os números de analytics vêm arredondados — respostas mais diretas, menos ruído',
    ],
  },
  {
    versao: '0.35.0',
    data:   '2026-06-26',
    novidades: [
      'A Gator não desiste mais no meio de uma tarefa complexa: o teto de passos por resposta subiu de 10 para 25, então tarefas que exigem encadear muitas ações (varrer vários clientes, cruzar dados, executar uma sequência longa) agora chegam ao fim em vez de parar na metade',
      'Quando ela realmente bate o limite de uma resposta (passos OU um teto de custo de R$ 0,50 por resposta, pra nenhuma resposta sozinha sair cara demais), ela não some com uma mensagem genérica: a própria Gator escreve um fechamento honesto — o que já fez, o que ainda falta — e te oferece continuar de onde parou. É só dizer "continua"',
    ],
  },
  {
    versao: '0.34.0',
    data:   '2026-06-26',
    novidades: [
      'A Gator não esquece mais o começo de uma conversa longa: antes, ao passar de ~40 mensagens, o início era simplesmente jogado fora e ela perdia o fio (combinados, decisões, o que já tinha feito). Agora o trecho antigo é RESUMIDO automaticamente — um resumo cumulativo que ela carrega junto com as mensagens recentes. Conversa pode esticar à vontade que ela continua sabendo do que foi falado lá atrás',
      'O resumo é gerado pelo modelo rápido (Flash) só quando a conversa cresce de verdade, e cada chamada é medida no painel de Uso da IA (tipo "resumo") — nada de custo invisível',
    ],
  },
  {
    versao: '0.33.2',
    data:   '2026-06-26',
    novidades: [
      'A Gator parou de errar o cliente "de primeira": agora você (e ela) pode se referir ao cliente pelo NOME em qualquer ação — o sistema resolve o id certo sozinho, num ponto único por onde toda ferramenta passa. Antes o modelo às vezes inventava um id (um código aleatório de 36 caracteres que LLM nenhum decora bem) e a ação falhava, ou pior, acertava o cliente errado. Se o nome casar com mais de um cliente, ela pergunta qual em vez de chutar',
    ],
  },
  {
    versao: '0.33.1',
    data:   '2026-06-26',
    novidades: [
      'Memória à prova de repetição: anotar um fato (no cliente ou na memória de longo prazo) virou idempotente — se aquilo já está guardado, não duplica. Antes, se a Gator se confundia numa tarefa longa e mandava o mesmo fato duas vezes, a ficha do cliente ganhava linhas repetidas. Agora a ferramenta ignora a repetição em vez de obedecer cegamente',
    ],
  },
  {
    versao: '0.33.0',
    data:   '2026-06-26',
    novidades: [
      'Memória da Gator ficou inteligente: ela agora guarda cada fato no lugar certo. Coisa de UM cliente (motivo de um atraso, uma preferência, um combinado) vai pra memória DAQUELE cliente e só reaparece quando ele está em pauta; o que é geral da agência (como você opera, suas regras) fica na memória de longo prazo dela. Antes ia tudo no mesmo balde — o que enchia toda conversa de contexto de cliente que nem vinha ao caso, encarecia e não escalava',
      'Anotar no cliente virou leve: a Gator acrescenta um fato à ficha do cliente sem reescrever o resto (datado automaticamente), em vez de ter que reler e regravar o dossiê inteiro',
      'A Gator agora PEDE o que falta: quando esbarra num limite — um dado que não alcança, um acesso que não tem, uma ferramenta que ainda não existe pra aquilo — ela faz o que dá e te aponta a lacuna em uma linha, em vez de improvisar ou travar calada. É o sistema te mostrando onde precisa crescer',
    ],
  },
  {
    versao: '0.32.0',
    data:   '2026-06-26',
    novidades: [
      'A Gator agora responde AO VIVO: o texto aparece sendo escrito na hora (token a token), com um cursor piscando, em vez de você esperar a resposta inteira ficar pronta. A sensação é a de uma IA de ponta de verdade',
      'Você vê a Gator trabalhando: quando ela precisa consultar ou executar algo, a ação aparece na hora com um indicador girando ("panorama agencia…") e vira ✓ quando conclui (ou fica vermelha se falhar). Acabou a caixa-preta — dá pra acompanhar o que ela está fazendo',
      'Quando ela faz várias consultas de uma vez, agora rodam em paralelo (mais rápido), e um erro no meio não derruba mais a conversa inteira',
    ],
  },
  {
    versao: '0.31.0',
    data:   '2026-06-26',
    novidades: [
      'Raciocínio da Gator agora começa DESLIGADO — mais rápido e barato no dia a dia; você liga no menu do cérebro quando precisar de uma análise mais fina',
      'Corrigido um erro que derrubaria a Gator: o modelo Pro não aceita ter o raciocínio "desligado" (ele sempre pensa), e isso quebrava a resposta com erro. Agora a troca Flash↔Pro e o liga/desliga do raciocínio foram testados de ponta a ponta contra a API e funcionam nas quatro combinações',
    ],
  },
  {
    versao: '0.30.0',
    data:   '2026-06-25',
    novidades: [
      'Cabeçalho do chat da Gator repensado: as duas barrinhas de controle viraram uma faixa só e mais limpa, pra conversa ganhar espaço (que é o que importa). O cérebro (Flash/Pro + raciocínio) agora abre num menu que explica o trade-off de cada modelo e mostra o selo de custo — escolha guiada, não dois botões mudos',
      'Custo saiu da frente: em vez de uma faixa fixa de números, agora é um chip discreto com o gasto da conversa que, clicado, abre o detalhe (hoje, mês e o "peso" da conversa em tokens, explicado). Informação quando você quer, sem ruído o tempo todo',
    ],
  },
  {
    versao: '0.29.0',
    data:   '2026-06-25',
    novidades: [
      'A Gator deixou de ser guiada por uma lista de regras específicas e passou a operar por princípios — como uma IA de ponta de verdade. Na prática: ela julga cada situação e deduz a ação certa, em vez de seguir receita. Some "regra pra cada caso", entra inteligência que generaliza para situações que ninguém previu',
      'Ela agora te CONDUZ, não só responde: em assunto operacional, aponta o que é crítico (não a lista toda), diz o próximo passo e se oferece pra fazer, e explica o porquê em uma linha quando ajuda. É a diferença entre uma ferramenta que responde e uma sócia que te guia',
      'Honestidade reforçada como princípio central: ela nunca inventa um dado, uma capacidade nem uma limitação. O caso de "não consigo ver imagem" deixou de ser um remendo e virou consequência natural do princípio — ela é honesta sobre o que é e o que vê',
      'Trocar o cérebro da Gator (Flash/Pro) agora dá pra fazer direto no chat, num botãozinho ao lado do seletor de cliente — sem ter que ir até as Configurações. Vale na próxima mensagem',
    ],
  },
  {
    versao: '0.28.0',
    data:   '2026-06-25',
    novidades: [
      'Você agora escolhe o cérebro da Gator (Configurações → Sistema → Uso da IA): Flash (rápido e econômico, ótimo pro dia a dia) ou Pro (mais inteligente, raciocina melhor e confabula menos, pra análises e decisões finas). É só clicar no modelo — vale na próxima mensagem',
      'Toggle de Raciocínio: liga/desliga o "pensar antes de responder" do modelo. Ligado, ela acerta mais em coisas complexas (um pouco mais lento e caro); desligado, fica mais rápida e barata. O Pro sempre raciocina. O custo de cada escolha aparece no mesmo painel, em tempo real',
      'O cálculo de custo passou a contar os tokens de raciocínio (thinking), pra estimativa não te enganar quando o "pensar" está ligado',
    ],
  },
  {
    versao: '0.27.0',
    data:   '2026-06-25',
    novidades: [
      'Gator ficou de fato mais inteligente com o contexto: ela deixou de receber o estado da agência (clientes, inadimplência, MRR) empurrado em TODA conversa. Agora ela mesma decide buscar esse resumo só quando a conversa pede — exatamente como um bom assistente faz. Um "oi" não carrega mais a lista de inadimplentes junto; quando você pergunta algo operacional, ela puxa o panorama na hora. Resultado: conversas triviais ficam bem mais leves e baratas, sem a IA perder nada da capacidade de te dar o estado real quando importa',
    ],
  },
  {
    versao: '0.26.0',
    data:   '2026-06-25',
    novidades: [
      'Cada resposta da Gator agora mostra no próprio balão quanto custou (valorzinho discreto ao lado das ações), inclusive ao reabrir conversas antigas. Assim dá para comparar de relance o que pesou — um "oi" custa quase nada, uma análise custa um pouco mais',
      'A barra de custo no topo do chat ficou mais enxuta: mostra o total da conversa atual e o gasto de hoje/mês (o custo da última resposta saiu de lá porque agora vive no balão dela)',
    ],
  },
  {
    versao: '0.25.0',
    data:   '2026-06-25',
    novidades: [
      'Custo da IA agora aparece dentro do chat da Gator (Ctrl+I): uma barra discreta mostra quanto a conversa atual já gastou, quanto custou a última resposta e o gasto estimado de hoje e do mês — sem precisar abrir o painel de Uso da IA. Tudo estimado, na mesma base do painel',
    ],
  },
  {
    versao: '0.24.0',
    data:   '2026-06-25',
    novidades: [
      'Gator mais eficiente e mais barata: a IA passou a calibrar o esforço de cada mensagem. Um "oi" agora é respondido na hora, sem disparar consultas ao sistema — ela só aciona ferramentas quando a resposta de fato depende de um dado que não tem ou há uma ação a executar. Saudação e papo trivial deixaram de custar como uma consulta completa',
      'Contexto enxuto por mensagem: em vez de reenviar a lista inteira de clientes e tarefas em toda interação, a Gator agora carrega só um resumo (contadores + o que é crítico, como inadimplência e saldo baixo) e puxa a lista completa sob demanda. Isso derrubou bastante o custo por mensagem sem ela perder noção do que está acontecendo',
      'Cálculo de custo da IA corrigido: tokens servidos do cache do modelo (prefixo repetido) deixaram de ser cobrados em dobro e a preço cheio — agora contam pelo valor real (~1/4 do preço de entrada). O painel de Uso da IA passou a refletir o custo verdadeiro, mais baixo',
    ],
  },
  {
    versao: '0.23.0',
    data:   '2026-06-25',
    novidades: [
      'Aba Analytics no painel de Uso da IA (Configurações → Sistema → Uso da IA): além do custo, agora dá para ver COMO a Gator é usada. Um gráfico de pizza mostra a distribuição das chamadas por tipo de uso (assistente, briefing, relatórios, hashtags, copy)',
      'Ranking de ferramentas da Gator: a tabela lista as ferramentas que ela mais aciona (criar tarefa, buscar cliente, consultar analytics etc.) com a quantidade de chamadas e a taxa de falha de cada uma — útil para enxergar o que está quebrando',
      'Tendência e horários de pico: um gráfico de linha com as chamadas por dia nos últimos 30 dias e um mapa de calor por hora do dia, para você ver quando usa mais a IA',
      'Conversas destaque: lista das conversas mais caras, mais longas e com mais ações, com link direto para reabrir cada uma no painel da Gator',
    ],
  },
  {
    versao: '0.22.0',
    data:   '2026-06-25',
    novidades: [
      'Painel de Uso da IA (Configurações → Sistema → Uso da IA): agora dá para ver quanto a Gator custa. Cada chamada à IA passou a ser medida e o painel mostra o gasto estimado de hoje, do mês e o total acumulado, um gráfico dos últimos 30 dias e a quebra por tipo de uso (assistente, briefing, relatórios, hashtags, copy). O custo é estimado a partir dos tokens — pode divergir um pouco da fatura real do Google Cloud',
      'Limite mensal de gasto da IA: defina um teto em reais e, quando o gasto estimado do mês passar dele, você recebe uma notificação in-app (uma por mês). É só um alerta — as chamadas continuam funcionando normalmente, nada trava no meio do mês',
      'Custo por conversa no painel da Gator (Ctrl+I): a lista de conversas agora mostra um valorzinho discreto com o custo estimado de cada uma, para você saber quais sessões pesaram mais',
      'Indicador de contexto no chat da Gator: ao lado do seletor de cliente aparece o tamanho real do contexto da conversa em tokens (ex.: "~12k tokens"), ficando laranja quando a conversa cresce muito — assim você sabe quando vale começar uma sessão nova',
    ],
  },
  {
    versao: '0.21.0',
    data:   '2026-06-25',
    novidades: [
      'A Gator passou a anotar sozinha o que você conta no chat: ao dizer coisas como "já cobrei o cliente X", "combinei a entrega da página pra sexta" ou "fulano pediu pra pausar", ela registra na memória dela na hora, sem você precisar pedir "salva isso". E quando algo deixa de valer (a cobrança foi paga, a entrega saiu), ela também esquece',
      'O briefing matinal agora reflete o que você já fez: ele lê a memória da Gator e o estado real dos onboardings parados (quem está aguardando o cliente e há quantos dias), então para de cobrar de você o que já está resolvido e te lembra do que de fato está travado',
    ],
  },
  {
    versao: '0.20.0',
    data:   '2026-06-25',
    novidades: [
      'Biblioteca de mensagens de WhatsApp editável: as respostas rápidas que você envia aos clientes (boas-vindas, onboarding, acessos Google, cobrança, proposta, retenção e por aí) saíram do código e agora são gerenciáveis pela tela em Configurações → Comunicação → Mensagens. Dá para editar o texto, criar mensagens novas, organizar por categoria, excluir as suas e restaurar as padrão ao original',
      'Personalização automática nas mensagens: use {{primeiro_nome}} ou {{nome}} no texto e o sistema preenche com o nome do cliente na hora de enviar. Os chips de variável estão ali no editor, é só clicar para inserir',
      'No modal de "Enviar WhatsApp" do cliente, ao ajustar um texto na hora você pode salvá-lo direto na biblioteca para reaproveitar depois, sem ir até as Configurações',
    ],
  },
  {
    versao: '0.19.0',
    data:   '2026-06-25',
    novidades: [
      'Alerta de saldo do Google Ads agora é por cliente e automático: você define o saldo mínimo de cada cliente no detalhe dele (Integrações → Alerta de saldo) e pode desligar os alertas para quem está em cancelamento ou pediu para parar. Todo dia às 9h31 (pula domingo), quem estiver abaixo do mínimo recebe o email de "saldo baixo" por 3 dias. No 4º dia, em vez do cliente, quem é avisado é você — para chamar no WhatsApp. Se o saldo zera, sai o email de "saldo acabou" e ele se repete a cada 3 dias até recarregar. Liga pelo toggle "email saldo ads" em Configurações → Comunicação (começa desligado)',
      'Estágios de inadimplência viraram editáveis: em Configurações → Cobrança → Financeiro você define a partir de quantos dias de atraso entra cada consequência (atenção, suspensão, grave, crítico). Vale para todo o sistema — alertas, cobrança e status do cliente',
      'Regras de saúde do cliente editáveis: em Configurações → Operação → Saúde & Listas você ajusta o peso de cada critério do health score (pagamento, integração, checklist, atualização, status) e os limiares de "saudável" e "atenção"',
      'Lista de nichos sugeridos editável: adicione ou remova os nichos que aparecem no cadastro de cliente, sem precisar mexer no código',
    ],
  },
  {
    versao: '0.18.0',
    data:   '2026-06-24',
    novidades: [
      'Emails de onboarding automáticos: ao concluir as etapas "Confirmar recebimento" (briefing), "Aprovação/Entrega" (página pronta) e "Acessos Google", o cliente recebe um email no padrão da agência. Liga/desliga pelo toggle "email onboarding" em Configurações → Comunicação (começa desligado)',
      'Botão "Enviar email" em cada etapa do onboarding para mandar na hora, manualmente. Ele fica desabilitado quando o envio automático está ligado (aí o email já sai sozinho ao concluir a etapa)',
      'Relatório semanal: novo email curto com os KPIs essenciais da semana (cliques, conversões, investimento) e a comparação com a semana anterior. Roda automaticamente no dia e horário que você escolher em Configurações → Automações → Agendamentos (começa desligado). Clientes sem dados ainda são pulados, para não enviar email vazio',
      'Agendamentos agora suportam jobs semanais: o relatório semanal tem um seletor de dia da semana, além do horário',
    ],
  },
  {
    versao: '0.17.0',
    data:   '2026-06-24',
    novidades: [
      'Modo teste de email (rede de segurança): com ele ligado, nenhum email automático vai para o cliente. Tudo é redirecionado para o seu email de teste, com [TESTE] no assunto. Liga/desliga em Configurações → Comunicação → Automações, com selo bem visível quando ativo. Já começa ligado, e se faltar o email de teste o envio é bloqueado em vez de ir pro cliente por engano',
      'Link de pagamento real nos emails de cobrança: o {{pagamento_url}} agora é preenchido com o link da cobrança do Asaas (a vencida, nos avisos de atraso; a pendente, em lembretes de vencimento). Os emails de suspensão e cobrança já saem com o botão de pagamento certo',
      'Histórico de emails por cliente: nova aba "Emails" no detalhe do cliente mostrando tudo que ele recebeu (assunto, tipo, data, status e selo de teste). O log global em Configurações também ganhou o selo de teste e passou a mostrar envios ao operador',
    ],
  },
  {
    versao: '0.16.0',
    data:   '2026-06-23',
    novidades: [
      'Configurações reorganizadas: a barra de abas (que já estava enorme) virou um menu lateral por categorias — Geral, Comunicação, Cobrança, Operação, Conta e Sistema. Cada categoria abre suas sub-abas, escala bem e fica fácil achar as coisas',
      'Templates de Email agora moram dentro de Configurações → Comunicação (ao lado das Automações de email), em vez de uma página solta — toggles e modelos de email no mesmo lugar',
      'Emails no visual real da Adsgator: todos os modelos de email passaram a usar o layout dos emails atuais da agência — banner no topo, faixa amarela com o título, corpo claro e rodapé com Termos/Privacidade/Ajuda. O que sai para o cliente fica igual ao que você já manda hoje',
      'Emails repensados para mostrar valor ao cliente, não para puxar resposta: escrita natural e sem travessões, com a mensagem de que o trabalho está sendo feito e os resultados aparecendo. Os pedidos de "qualquer dúvida me chama" saíram dos emails informativos',
      'Relatórios (Google Ads e Analytics) agora são proativos: cada KPI tem espaço para a comparação com o mês anterior (seta ▲/▼ verde/vermelha) e um "Destaque do mês", para o cliente enxergar evolução e avanços. Quando o dado de comparação ainda não vier preenchido, mostra só o número atual',
      'Botões só onde o cliente precisa agir (pagar uma cobrança, recarregar saldo). Relatórios e avisos viraram puramente informativos, sem CTA',
      'Design dos emails repaginado: tipografia e espaçamentos mais respiráveis, subtítulos de seção com destaque, KPIs em cards mais elegantes, botões de ação com mais presença e rodapé refinado. Mantém o banner e a identidade Adsgator, e segue compatível com Gmail/Outlook',
      'Tela de gestão de emails melhorada: templates agrupados por categoria (Ciclo de vida, Cobrança, Alertas, Relatórios, Personalizados), busca no topo e, no editor, atalhos das variáveis disponíveis (clique para inserir {{nome_cliente}}, {{pagamento_url}} etc. no lugar do cursor)',
      'Novo email "Saldo do Google Ads acabou" (saldo zerado), separado do alerta de saldo baixo, deixando claro que os anúncios foram pausados',
      'Os emails de suspensão e cancelamento já trazem o lugar do link de pagamento ({{pagamento_url}}); o preenchimento automático do link do Asaas vem na próxima etapa',
    ],
  },
  {
    versao: '0.15.0',
    data:   '2026-06-23',
    novidades: [
      'Lembretes de onboarding automáticos: quando um cliente trava numa etapa que depende dele (24h/72h, conforme o modelo), o Hub avisa sozinho com uma notificação que já traz a mensagem de lembrete pronta para você enviar. Roda 1x/dia pelo agendador (liga/desliga e horário em Configurações → Automações). Cada limite avisa só uma vez',
      'Aviso de cliente novo: ao entrar um cliente (cadastro, importação do Asaas ou checkout), você recebe uma notificação no sino para conferir o cadastro e iniciar o onboarding — não descobre cliente novo por acaso',
      'A Gator passa a enxergar os onboardings: pergunte "como estão os onboardings?" e ela responde onde cada cliente parou, há quanto tempo e de quem é a vez (cliente ou agência)',
    ],
  },
  {
    versao: '0.14.0',
    data:   '2026-06-22',
    novidades: [
      'Onboarding guiado por timeline: a aba Timeline do cliente vira uma tela de condução passo-a-passo — todas as etapas visíveis numa linha do tempo vertical (concluídas marcadas, a atual em destaque com as mensagens, campos e ações). Cada etapa indica de quem é a vez: "Com o cliente" (esperando ele) ou "Comigo" (tarefa interna), para você saber quem cobrar',
      'Mensagens prontas em cada etapa, já com o nome do cliente preenchido, botão para abrir direto no WhatsApp e campos para anotar dados (ex.: ID do Google Ads). O avanço de cada etapa é salvo',
      'Lembretes prontos: quando a bola está com o cliente e ele trava, a etapa oferece uma mensagem de lembrete pronta (com a régua 24h/72h) para você enviar — sem precisar escrever na hora',
      'Três modelos de onboarding, um por tipo de contratação: Combo (LP + Tráfego), Só Tráfego (já tem site) e Só Landing Page. Inclui confirmação de recebimento do briefing e o caminho de "cliente sem Google Meu Negócio" (você cria e devolve o acesso). Mensagens no padrão de comunicação da agência',
      'Informações da timeline editáveis a qualquer momento: preencha o link do Drive ou o ID do Google Ads num bloco no topo e as mensagens já refletem o valor na hora. Qualquer etapa pode ser aberta para consultar/reenviar mensagens, e etapas concluídas podem ser reabertas',
      'O onboarding alimenta o cadastro: ao concluir uma etapa, o que você anotou (ex.: ID do Google Ads) é salvo no cliente e reflete na completude. O status do cliente acompanha o fluxo sozinho — vira "onboarding" ao iniciar e "ativo" ao concluir',
      'Iniciar onboarding em 1 clique: a aba sugere o modelo certo conforme o tipo de contratação do cliente (Combo, Só Tráfego ou Só Landing Page). Novo campo "tipo de contratação" — definível na hora e pronto para ser preenchido automaticamente pelo checkout próprio no futuro',
    ],
  },
  {
    versao: '0.13.0',
    data:   '2026-06-22',
    novidades: [
      'Completude do cliente: o detalhe de cada cliente agora mostra, de forma proativa, o quão completo está o cadastro e exatamente o que falta preencher — organizado em Marca/negócio, Integrações Google, Financeiro/contrato e Contexto. Resolve o "ficar no escuro" com clientes importados do Asaas, que entram só com nome/e-mail/valor',
      'Lista de clientes: cada card sinaliza com um selo laranja (%) quando o cadastro está incompleto, para identificar de relance quem precisa de atenção sem abrir um por um',
      'Novo campo "link do perfil Google Ads" no cliente, parte da régua de completude',
    ],
  },
  {
    versao: '0.12.0',
    data:   '2026-06-18',
    novidades: [
      'Ciclo de vida do cliente unificado: quem sai vira "inativo" (arquivo) com o motivo registrado — por inadimplência, a pedido ou por congelamento expirado. Antes "cancelado", "cancelado (débito)" e "inativo" eram status soltos que poluíam métricas e listas',
      'Arquivamento automático: cliente congelado há mais de N dias (padrão 60, configurável em Configurações → Automações) vai para inativo sozinho, mantendo o histórico',
      'Inativos somem das telas de gestão (dashboard, churn, cobrança, métricas) e ficam só no histórico — o sistema mostra só quem está na operação',
      'Detalhe do cliente mostra o motivo da inativação no lugar do status genérico',
    ],
  },
  {
    versao: '0.11.4',
    data:   '2026-06-18',
    novidades: [
      'Correção: o MRR aparecia com valores diferentes em cada tela (Morning Briefing, StatusBar, Financeiro e a Gator divergiam) — agora há uma fonte única (lib/mrr.ts): MRR = soma das assinaturas com cobrança viva (ativa ou em atraso D+7/D+15)',
      'Financeiro: o card "MRR Mensal" passou a se chamar "Receita do Mês" (entradas confirmadas no caixa) e ganhou o MRR recorrente real das assinaturas ao lado — duas métricas distintas, sem ambiguidade',
    ],
  },
  {
    versao: '0.11.3',
    data:   '2026-06-12',
    novidades: [
      'Correção: mais consultas ao histórico com coluna errada (tipo/acao em vez de tipo_acao) — timeline de auditoria do cliente, gráfico de churn no Financeiro e busca global voltaram a funcionar',
      'Correção: concluir tarefa vinculada a cliente agora registra no histórico (o insert falhava silencioso pela mesma coluna errada)',
    ],
  },
  {
    versao: '0.11.2',
    data:   '2026-06-12',
    novidades: [
      'Correção: detalhe do cliente não abria — o histórico era ordenado por uma coluna que não existe (data_acao); corrigido para created_at na página, na Gator e na API',
    ],
  },
  {
    versao: '0.11.1',
    data:   '2026-06-12',
    novidades: [
      'Correção: página Clientes quebrava ("checklist.filter is not a function") com clientes vindos do checkout Asaas — o webhook gravava o checklist do estágio como texto em vez de lista; corrigido o webhook, os registros existentes e a leitura agora tolera dados malformados',
    ],
  },
  {
    versao: '0.11.0',
    data:   '2026-06-12',
    novidades: [
      'Agendamentos configuráveis: horário (fuso de Brasília) e liga/desliga de cada job automático (sync analytics, briefing, import Asaas, alertas, cobrança) em Configurações → Automações → Agendamentos',
      'Dispatcher único de crons: roda a cada 30 min, executa cada job na primeira janela após o horário configurado, no máximo 1x por dia — sem precisar de deploy para mudar horário',
      'Gator sabe os horários: nova ferramenta listar_agendamentos responde quando e se cada job automático roda',
    ],
  },
  {
    versao: '0.10.0',
    data:   '2026-06-12',
    novidades: [
      'Central de Prontidão: aba Setup em Configurações mostra o que falta configurar (credenciais, crons, automações) com passo a passo e % de completude',
      'Banner "Sistema pronto: X%" no dashboard com atalho para completar o setup',
      'Gator sabe o que falta: nova ferramenta prontidao_sistema responde "o que falta configurar?" com o checklist ao vivo',
      'Templates de Tarefas e Processos: crie checklists reutilizáveis com prioridade e prazo em Configurações → Templates (setup-cliente e onboarding-cliente já vêm prontos e editáveis)',
      'Nova Tarefa a partir de template: dropdown no modal preenche título, checklist e prazo ({cliente} vira o nome do cliente)',
      'Gator cria tarefas de processo: ferramentas listar_templates_tarefa e criar_tarefa_de_template',
      'Provisionamento automático: cliente novo gera tarefa "Setup do cliente" com checklist de integrações nos 3 caminhos (formulário, importador e checkout Asaas)',
      'Retroativo: botão na aba Setup cria as tarefas de setup para clientes existentes sem IDs Google (idempotente)',
      'Empty states que guiam: widgets vazios por falta de configuração (Monitoramento, Saldo Google Ads, Timelines) agora explicam o motivo e linkam para o Setup',
      'Morning Briefing transparente: aviso discreto quando o texto vem do fallback por Vertex AI não configurado',
      'Briefing proativo: cron diário às 06:30 gera e salva o briefing antes de você acordar — o dashboard carrega instantâneo, com notificação "☀️ Briefing do dia pronto"',
      'Briefing mais rico: agora considera tarefas com prazo hoje e clientes com saldo Google baixo',
      'Templates de email personalizados: crie do zero (não só editar os 12 fixos), com preview e exclusão',
      'Gator envia emails: ferramentas listar_templates_email e enviar_email (com confirmação explícita), registradas em email_logs',
    ],
  },
  {
    versao: '0.9.0',
    data:   '2026-06-12',
    novidades: [
      'Gator: agente IA com acesso total — consulta e opera clientes, tarefas, financeiro, marketing e APIs por conversa (Ctrl+I em qualquer página)',
      'Conversas salvas: sessões com renomear, excluir e exportar .md',
      'Memória de longo prazo: ensine fatos ("lembre que…") e ela lembra para sempre',
      'Multimodal: envie prints e arquivos .md, dite por voz e ouça as respostas',
      'Autoconhecimento: a Gator conhece o próprio Hub, sugere melhorias e transforma ideias aprovadas em tasks',
    ],
  },
  {
    versao: '0.8.0',
    data:   '2026-06-11',
    novidades: [
      'Integração Asaas completa: cliente nasce automaticamente no checkout (assinatura ou compra única)',
      'Importador de clientes do Asaas com seleção individual',
      'Blindagem: verificação diária de inadimplência, webhook resiliente e monitoramento de eventos',
      'Auditoria de segurança e virada para produção: RLS owner-scoped e portal do cliente',
      'Status real das integrações: checks de Google Ads, Asaas, Vertex AI, GA4 e Resend',
    ],
  },
  {
    versao: '0.7.0',
    data:   '2026-06-06',
    novidades: [
      'Automações de email: relatório mensal, régua de cobrança e alertas críticos (toggles em Configurações)',
      'Templates de email editáveis',
      'Sync de Analytics: snapshots Google Ads + GA4 com cron diário às 06:00',
      'Política de inadimplência centralizada (D+7 / D+15 / D+30) em todo o sistema',
      'Auditoria geral: APIs destravadas, dados reais nos widgets e limpeza de código morto',
    ],
  },
  {
    versao: '0.6.0',
    data:   '2026-05-29',
    novidades: [
      'Dashboard com edit mode: arraste, redimensione e salve seu layout',
      'Novos módulos: Base de Conhecimento, Operacional, Portfólio e Prospectar (CRM)',
      'Autenticação SSR robusta com proteção automática de rotas',
      'AuditTimeline com filtros por tipo e ícones coloridos',
      'Design system unificado em todos os módulos',
    ],
  },
  {
    versao: '0.5.0',
    data:   '2026-05-25',
    novidades: [
      'Activity Feed: veja o que aconteceu nas últimas 24h no dashboard',
      'Health Score por cliente: score 0–100 visível nos cards',
      'Onboarding Wizard: guia de primeiro uso ao entrar no sistema',
      'Recomendações IA na Analytics: botão "Gerar Recomendações" por cliente',
      'Ações do Dia: botão "Criar Task" direto a partir das ações pendentes',
    ],
  },
  {
    versao: '0.4.0',
    data:   '2026-05-24',
    novidades: [
      'Memória do Cliente: arquivo .md editável com geração por IA',
      'FloatingChat: chat IA disponível em todas as páginas',
      'Middleware de autenticação: proteção automática de rotas',
      'TaskModal: sub-tasks com checklist e responsável por tarefa',
      'Modal de onboarding pós-criação de cliente com task automática',
    ],
  },
  {
    versao: '0.3.0',
    data:   '2026-05-20',
    novidades: [
      'ChecklistCard: comentários e lembretes por item de checklist',
      'Filtros avançados em Clientes: nicho, pagamento, batch select',
      'Financeiro: editar, duplicar e deletar lançamentos por linha',
      'Régua de cobrança: UI de configuração de triggers e templates',
      'Morning Briefing: filtros por modo (completo, urgências, resumido)',
    ],
  },
]

export const VERSAO_ATUAL = CHANGELOG[0].versao
