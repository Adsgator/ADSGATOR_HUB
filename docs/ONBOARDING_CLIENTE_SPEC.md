# Onboarding de Cliente — Spec do Fluxo Guiado

> Briefing extraído de Lucas em 22/06/2026. Fonte de verdade do fluxo de
> onboarding que será implementado como **template de Timeline** (a estrutura
> `TimelineStep` em `lib/types/timeline.ts` já suporta `messages` copiáveis,
> `input_fields` e dependências). Este doc descreve o COMPORTAMENTO desejado;
> ainda **não implementado** — serve para alinhar o plano em pedaços.

## Princípio

O Hub deve ser **proativo**: a cada fase, mostrar a mensagem pronta (com links/
variáveis preenchidos) para Lucas copiar e enviar no WhatsApp, pedir os dados
que faltam, e cutucar quando o cliente trava. Lucas não deve precisar lembrar de
nada nem caçar campo vazio.

## Decisões de design (alinhadas)

- **Envio de mensagens:** sempre **WhatsApp manual** (wa.me). O sistema mostra a
  mensagem pronta com links/variáveis já preenchidos; Lucas clica, abre o
  WhatsApp e envia. Sem automação de envio (fora de escopo — ver memory
  whatsapp-no-twilio).
- **Lembretes (cliente parado):** **notificação no Hub + mensagem de lembrete
  pronta** para Lucas enviar. O sistema avisa "Cliente X parado há 24h na fase
  Briefing" e oferece o texto; Lucas decide quando mandar.
- **Links nas mensagens:** briefing e guias são **fixos** (iguais para todos);
  a **pasta do Google Drive muda por cliente** → é uma variável preenchível por
  instância (`{{drive_url}}`).

---

## Três caminhos de onboarding (cliente novo)

O fluxo NÃO é único — depende do que o cliente contratou:

| Caminho | Briefing+Assets | Desenvolvimento (Astroteca) | Acessos Google | Tráfego |
| --- | --- | --- | --- | --- |
| **Combo (LP + tráfego)** | ✓ | ✓ | ✓ | ✓ |
| **Só tráfego** (já tem site) | ✗ | ✗ | ✓ | ✓ |
| **Só LP** (compra única) | ✓ | ✓ | ✗ | ✗ |

O tipo de contratação deve ser detectado/definido na entrada (idealmente do
plano Asaas; senão Lucas escolhe) e seleciona qual template/caminho roda.

## Fase de Desenvolvimento (trabalho interno + Astroteca)

Esta fase **não é guiada por mensagens ao cliente** — é trabalho interno de
Lucas. O sistema deve mostrar **status** e servir de **ponte para o Astroteca**:

- Ler o briefing preenchido + conferir os assets do Drive → decidir o que usar.
- Planejar e desenvolver a landing page no **Astroteca** (extrai infos do
  briefing, segue o fluxo de criação). Ver [[Adsgator ecosystem overview]].
- Tarefas técnicas: comprar domínio, alterar DNS, criar o projeto/repo.
- O **cliente só reaparece no fim**, para **aprovar** — recebe a página pronta
  já alinhada com o briefing. Aí voltam mensagens guiadas (envio p/ aprovação,
  ajustes, publicação).

Status sugeridos: `em_desenvolvimento` → `em_aprovacao` → `ajustes` →
`publicado`. Integração Hub↔Astroteca a detalhar (extração do briefing,
criação do projeto a partir do template).

## Visão "tirar do escuro" (Lucas quer as 4)

A tela dedicada de onboarding deve entregar:
1. **Onde cada cliente parou** — fase atual + há quanto tempo, de todos em onboarding.
2. **O que falta preencher** — completude por cliente (nicho, domínio, IDs, GMN).
3. **Próxima ação agora** — lista priorizada de ações concretas ("cliente X
   parado 24h → mande lembrete", "cliente Y mandou ID → envie convite").
4. **Histórico por cliente** — o que já foi enviado/feito (já parcialmente coberto
   por `historico_acoes`).

## Régua de completude do cliente (define o que o sistema cobra)

Um cliente é "completo" (para gestão) quando tem TODOS os blocos abaixo. O
indicador de completude e os avisos "falta X" se baseiam nesta régua. Aplica-se
inclusive aos **clientes já importados do Asaas** (que só precisam completar
dados — não passam por onboarding).

- **Marca/negócio:** nicho, domínio, site/LP no ar, briefing recebido, assets coletados.
- **Integrações Google:** Google Ads customer ID, **link do perfil Google Ads do
  cliente**, GA4 property ID, acesso GMN confirmado, número verificado, toggles
  `google_ads_enabled`/`ga4_enabled` habilitados.
- **Financeiro/contrato:** plano e MRR cadastrados, assinatura Asaas vinculada,
  tipo de contratação (combo/tráfego/LP) definido.
- **Contexto p/ operação:** memória .md preenchida, portal gerado, email de
  relatório definido, health score.

> ⚠️ Verificar se a coluna do "link do perfil Google Ads" já existe em `clientes`
> (há `google_ads_customer_id` e `looker_url`; o link do perfil pode ser campo
> novo). Confirmar no schema antes de implementar.

## Detecção do tipo de contratação

- **Hoje:** o plano Asaas não permite inferir combo/tráfego/LP → **Lucas escolhe
  na entrada** (seletor de 3 opções ao criar/abrir o cliente).
- **Futuro:** o **checkout próprio** (a ser construído pela Adsgator) enviará o
  tipo direto ao Hub. Ver memory [[asaas-integration]] — o checkout-first já é
  previsto; este é mais um campo a incluir nele.

## Estrutura do fluxo (fases-base, combinadas conforme o caminho)

Cada FASE = um step da timeline (`type`, `messages`, `input_fields`, regra de
follow-up). Fases dependem do cliente (tempo de resposta dele), por isso o motor
de lembrete é essencial.

### FASE 0 — Cliente entra (checkout → Asaas → Hub)

- **Gatilho:** cliente contrata no checkout → criado no Asaas → cai no Hub.
- **Avisar Lucas:** **email + notificação no sistema** ("novo cliente: {nome}").
- **Ação de Lucas:** conferir/validar cadastro → chamar no WhatsApp p/ boas-vindas
  e tirar dúvidas.
- **Conclui quando:** Lucas confirma que falou com o cliente e o cadastro está ok.

### FASE 1 — Briefing + Assets

- **Tipo:** action (depende do cliente).
- **Mensagens (template, copyable) — 4 blocos, na ordem:**
  1. Intro ("vou te enviar 2 links para usar agora")
  2. Formulário + Drive (links)
  3. Cronograma (7 passos do processo + prazo "até 7 dias úteis")
  4. Fechamento ("qualquer dúvida me chama")
- **Variáveis:** `{{primeiro_nome}}`, `{{drive_url}}` (pasta própria do cliente).
- **Links fixos:** briefing `https://forms.adsgator.com.br/briefing-pro/`.
- **Follow-up:** sem movimento em **24h** → lembrete; **72h** desde o 1º envio →
  2º lembrete.
- **Conclui quando:** Lucas marca "briefing + assets recebidos" → confirma com
  cliente ("recebi, vou iniciar o desenvolvimento").

### FASE 2 — Acessos Google (CONDICIONAL: só se cliente tem Google Ads)

- **Tipo:** action condicional.
- **Mensagens (template, copyable):**
  1. Intro pedindo 2 coisas: (1) criar conta Google Ads + passar ID, (2) dar
     acesso ao Google Meu Negócio.
  2. Guias: Google Ads (criar conta) + Google Meu Negócio (conceder acesso).
  3. Fechamento.
- **Links fixos:**
  - Guia criar conta: `https://ajuda.adsgator.com.br/ajuda/como-criar-uma-conta-no-google-ads/`
  - Guia acesso GMN: `https://ajuda.adsgator.com.br/ajuda/como-conceder-acesso-do-seu-google-meu-negocio/`
  - Guia aceitar convite Ads: `https://ajuda.adsgator.com.br/ajuda/como-conceder-acesso-do-google-ads-para-a-adsgator/`
- **Input fields:** `google_ads_customer_id` (ID que o cliente envia).
- **Sub-fluxos (ramificações):**
  - Cliente envia ID → Lucas manda convite de acesso + guia de aceite.
  - Cliente não tem GMN → Lucas cria o GMN e devolve acesso de proprietário.
- **Follow-up:** **24h** sem resposta → lembrete.
- **Conclui quando:** ID preenchida + acesso GMN confirmado + número verificado
  no Google Ads.

### FASE 3 — Desenvolvimento interno

- **Não depende do cliente.** Fora do fluxo de mensagens; entra depois.
- (A detalhar em briefing futuro — não é o foco agora.)

---

## Recursos extras (aprovados — facilitam o dia a dia / profissionalismo)

Adições além do fluxo base, todas alinhadas ao objetivo "menos carga mental,
mais organização":

1. **SLA / tempo na fase.** O sistema conta o prazo prometido ao cliente (ex.:
   "até 7 dias úteis") e avisa ANTES de estourar — não só "parado há 24h".
   Protege contra quebra de promessa.
2. **Bola com o cliente vs. bola comigo.** Cada fase/pendência marca de quem é a
   vez. "Esperando o cliente" (cobrar ele) ≠ "tarefa minha pendente" (comprar
   domínio, criar GMN). Muda quem é cobrado e evita cobrar cliente por algo seu.
3. **Tipo de contratação gera tarefas internas automáticas.** Combo/tráfego/LP
   não só seleciona o caminho de mensagens — já cria as tarefas internas certas
   (LP, campanha, etc.) via provisionamento. Lucas não decide na mão.
4. **Gator narra o estado.** A IA (já existente) resume no briefing matinal quem
   está parado, quem estoura prazo, qual a próxima ação — a voz do "tirar do
   escuro". Reusa o agente em `/api/ia/agent` + tools.
5. **Biblioteca de respostas rápidas.** Snippets copiáveis para dúvidas soltas do
   dia a dia, evoluindo a base que JÁ existe (ver abaixo). Lucas adiciona novas
   conforme precisa.

## Padrão de voz das mensagens (canônico)

As mensagens dos templates devem seguir o tom REAL de Lucas (extraído das
mensagens de onboarding que ele usa hoje, 22/06/2026):
- Caloroso mas objetivo; trata por "você".
- Emojis como marcadores de seção: 📋 formulário, 📁 arquivos, ⏰ cronograma,
  📊 Google Ads, 🏢 GMN, 1️⃣2️⃣ passos.
- Listas com ✓ para o cronograma/processo.
- Sempre abre anunciando o próximo passo e fecha com "qualquer dúvida, é só me
  chamar/falar!".
Qualquer mensagem nova proposta deve imitar esse padrão.

## O que já existe no código (não construir do zero)

- **Biblioteca de mensagens** (`components/clientes/WhatsAppTemplateModal.tsx`) —
  já categorizada por Onboarding / Google Ads / Entrega / Financeiro / Outro,
  com templates por cliente (BOASVINDAS, LINKSONBOARD, ONGOOGLE, CONVITE,
  SITEPRONTO, COBRANCA…). A "biblioteca de respostas rápidas" EVOLUI esta, não
  começa do zero. ⚠️ **Os textos atuais nesse arquivo são ANTIGOS** — Lucas
  confirmou (22/06/2026) que as mensagens novas que ele forneceu são o "padrão
  ouro". Na implementação, **substituir/atualizar** os textos antigos pelos
  novos; reusa-se a ESTRUTURA (categorias, modal, copiável), não o conteúdo.

- `lib/types/timeline.ts` — `TimelineStep` já tem `messages` (role template,
  copyable, template_tag), `input_fields`, `type`, `prerequisite`, e
  `TimelineTemplate.scope` suporta `per_niche`.
- Aba **Timeline** no detalhe do cliente (`clientes/[id]`) — cria instância a
  partir de template, mostra progresso. **Falta:** UI consumir `messages` e
  `input_fields` (hoje mostra só % de progresso).
- `lib/cliente-provisioning.ts` — todo cliente novo já ganha tarefa "Setup do
  cliente" com checklist (form/import/webhook).
- `lib/setup-checklist.ts` — já computa ao vivo "clientes sem IDs Google".
- APIs `/api/v1/timelines` e `/api/v1/timeline-templates` já existem.

## Lacunas a fechar (candidatos a tarefas do plano)

1. **Template de onboarding preenchido** com as fases/mensagens reais acima.
2. **UI da aba Timeline** mostrar mensagens copiáveis + campos preenchíveis +
   botão "abrir no WhatsApp" (wa.me) por mensagem.
3. **Motor de lembrete** (24h/72h parado) → notificação no Hub + mensagem pronta.
4. **Aviso de cliente novo** (email + notificação) na FASE 0.
5. **Variáveis por instância** (`{{primeiro_nome}}`, `{{drive_url}}`).
6. **Ramificações condicionais** (tem Google Ads? tem GMN?).

> Próximo passo: priorizar quais dessas lacunas entram primeiro — alinhar com
> Lucas, um pedaço por vez. NÃO implementar antes de fechar prioridade.
