---
title: DOCUMENTAÇÃO MESTRE DE ENGENHARIA ADSGATOR
date: 2026-05-21 17:27
---

# DOCUMENTAÇÃO MESTRE DE ENGENHARIA ADSGATOR

# DOCUMENTAÇÃO MESTRE DE ENGENHARIA ADSGATOR

# SISTEMA OPERACIONAL E ERP

## OBJETIVO DO PROJETO

Criar o sistema nervoso central da agência Adsgator para zerar a carga mental da operação diária

O sistema deve ter uma arquitetura modular plug and play e uma interface mão com açúcar que diz exatamente o que deve ser feito em cada etapa

Toda a infraestrutura será centralizada exclusivamente no Supabase para garantir velocidade e integração nativa

## DIRETRIZES DE DESIGN E UX

A interface precisa ser estritamente minimalista com visual premium inspirado no console do Supabase

A aplicação deve suportar troca dinâmica de tema Dark e Light

O uso da unidade rem é obrigatório absoluto e você nunca deve usar px para espaçamentos ou tamanhos em nenhuma tela

Use apenas ícones vazados da biblioteca Lucide React controlando a espessura da linha pelo Tailwind para manter o visual leve

As bordas devem ser finas usando tons como border zinc 800 no tema escuro

## REGRAS DE NEGÓCIO GERAIS

O processo de vendas da agência usa um fluxo rápido de 2 passos no WhatsApp indo direto para a call de fechamento

O sistema nunca deve sugerir ou gerar scripts burocráticos de atendimento

Nos relatórios de tráfego do Google Ads trate as conversões parciais de 0,5 como resultado correto da lógica de atribuição baseada em dados

Para simular cenários de teste use dados reais da agência como a cliente Beatriz do nicho de adestramento Ana do nicho de nutrição e Gabriel da gestão de tráfego

## PARTE 1 CORE ARQUITETURAL E BANCO DE DADOS

### 1 STACK TÉCNICA

Frontend estruturado em Next JS com Tailwind CSS para garantir interatividade nas telas de gerenciamento

Backend Banco de Dados Autenticação e Storage totalmente centralizados no Supabase

Hospedagem nativa do código via Supabase Edge Functions eliminando dependência externa

### 2 MODELAGEM POSTGRESQL

Crie o schema relacional contemplando as seguintes entidades principais

Tabela de Clientes com dados de contato domínio e nicho

Tabela de Planos e Assinaturas espelhando o financeiro do Asaas

Tabela de Estagios Operacionais para guiar as ações da agência ditando a próxima tarefa visível na Home

### 3 WEBHOOK DE ENTRADA

Estruture a Edge Function que escuta a aprovação de pagamentos

Após a confirmação financeira o cliente é criado automaticamente no banco

O status do cliente recém criado vai para Recebido acionando um alerta de ação imediata na interface principal

---

## PARTE 2: A UX "MÃO COM AÇÚCAR" & CENTRAL DE ONBOARDING

### 1. INTERFACE E COMPONENTES (NEXT.JS + TAILWIND)

Implemente a interface garantindo que o design system respeite o padrão estético escuro e minimalista (inspirado no console do Supabase).

A troca de tema (Dark/Light/System) deve ser nativa usando as classes `dark:` do Tailwind CSS.

É estritamente proibido o uso da unidade `px`. Todas as margens, espaçamentos, tamanhos de fonte e bordas devem ser implementados utilizando a unidade `rem` para garantir proporções perfeitas em qualquer ecrã.

Utilize a biblioteca Lucide React (ou Phosphor Icons) para todos os ícones. Os ícones devem ser estritamente vazados (sem preenchimento interno) e a espessura da linha (stroke-width) deve ser padronizada globalmente para garantir consistência visual de alta gama.

### 2. SISTEMA DE ESTADOS E ACIONAMENTOS RÁPIDOS

O painel principal (Home) não é uma lista de tarefas estática, mas um gestor dinâmico de estados operacionais.

Cada cliente possui um estado em tempo real (ex: Recebido, Onboarding, Setup de Tráfego) que dita qual é a única ação prioritária a ser tomada.

Integre atalhos diretos para o WhatsApp Web ou Desktop baseados no fluxo rápido de 2 passos da agência.

Quando o cliente entrar na fase de configuração, o sistema deve exibir os botões de ação que preenchem automaticamente o link do WhatsApp com os modelos de mensagem oficiais: `#BOASVINDAS`, `#CONVITE` e `#BRIEFINGGA`. Nunca crie ou sugira guiões de vendas burocráticos.

### 3. GESTÃO DE PENDÊNCIAS

Implemente a funcionalidade de "Congelamento de Estado". Se o fluxo depender do cliente (ex: envio de fotografias), o utilizador aciona o botão de pendência. O cliente sai do ecrã de foco diário e vai para a secção de "Clientes Retidos", recebendo um alerta automático após 48 horas de inatividade.

---

## PARTE 3: O ERP FINANCEIRO PROPRIETÁRIO E RÉGUA DE COBRANÇA

### 1. DASHBOARD FINANCEIRO E FLUXO DE CAIXA

Crie o módulo financeiro integrado nativamente à base de dados Supabase e sincronizado com os webhooks do Asaas.

O painel deve calcular o MRR (Monthly Recurring Revenue) em tempo real.

Desenvolva uma interface para inserção de custos fixos e variáveis da agência. O sistema deve cruzar automaticamente as entradas do Asaas com estes custos para exibir o lucro líquido (DRE simplificado).

### 2. RÉGUA IMPLACÁVEL DE AUTOMATIZAÇÃO (ASAAS)

Implemente a lógica de monitorização de pagamentos com ações severas programadas nas Edge Functions baseadas nos dias de atraso:

- Atraso de 7 dias: Disparo de notificação automática de alerta sobre a suspensão iminente das campanhas. O cliente recebe um marcador laranja no dashboard.

- Atraso de 15 dias: Disparo de notificação de quebra de contrato. O marcador no painel passa a vermelho.

- Atraso de 30 dias: O status da assinatura muda para `cancelado_debito`. O sistema altera a vista do cliente e prepara as instruções/scripts para a remoção da Landing Page do ar e eliminação dos ativos do Storage.

### 3. LOG E HISTÓRICO DE AÇÕES

Todas as movimentações cruciais (alteração de orçamentos de Ads, suspensão financeira, mudanças de plano) devem ser registadas de forma imutável numa linha do tempo no perfil do cliente, permitindo o cruzamento de dados de faturação com o histórico de performance no tráfego.

---

## PARTE 4: A VITRINE DE COMPONENTES ASTRO E CONSTRUTOR DE MANIFESTO (.MD)

### 1. ÁREA DA BIBLIOTECA DE COMPONENTES (UI VISUAL)

Crie um módulo isolado dentro do painel que sirva como montra da biblioteca de componentes Astro da agência.

A interface nunca deve exibir os componentes em caixas minúsculas. O layout deve organizar-se para mostrar no máximo 3 componentes por ecrã, garantindo uma visualização ampla do design, da tipografia e do espaçamento (estritamente codificado em `rem`).

O utilizador deve conseguir navegar por categorias (Navegação, Hero, Serviços, Depoimentos, Rodapé) e selecionar visualmente os blocos que deseja compor para a Landing Page (o "Frankenstein").

### 2. GERAÇÃO DO MANIFESTO DE PRODUÇÃO (.MD)

Ao finalizar a seleção visual das secções, o sistema não deve gerar o código HTML final da página.

Em vez disso, o sistema compila e exporta um ficheiro Markdown (`.md`) estruturado, designado "Manifesto de Produção".

Este ficheiro deve conter:

- O contexto estratégico (Nicho, paleta de cores exata, estilo e direção de arte).

- A estrutura sequencial exata dos blocos Astro selecionados (ex: `Hero_02` > `Beneficios_01`).

- A estrutura de *copy* (textos, títulos, ganchos) desenvolvida para cada secção específica.

O objetivo deste ficheiro `.md` é ser inserido como contexto no Cursor/Roo Code para orientar o desenvolvimento final de forma cirúrgica, forçando a IA local a manter-se fiel à unidade de medida `rem` e não desviar das opções visuais.

---

## PARTE 5: O CÉREBRO ANALISTA E MONITOR DE ATIVOS (GOOGLE ADS E GA4)

### 1. REGRAS DE LEITURA E MÉTRICAS

Este módulo é responsável por exibir os dados extraídos das campanhas do Google Ads e GA4.

Regra Absoluta de Análise: O sistema e qualquer lógica associada devem tratar as conversões fracionadas (ex: valores como 0,5 de conversão) como um comportamento normal, correto e decorrente da lógica dos modelos de atribuição baseados em dados (data-driven). Nunca devem ser sinalizadas como erro de dados ou falha de *tracking*.

O ecrã de análise deve apresentar as métricas focadas (Investimento, Cliques, CTR, Conversões Fracionadas e CPA) num formato limpo e livre de gráficos sobrecarregados.

### 2. ALERTAS TÉCNICOS E OTIMIZAÇÃO (O MODO "MÃO COM AÇÚCAR")

Configure alertas proativos no ecrã principal. Se o saldo de uma conta baixar de um limite crítico, o painel exibe o alerta automático para o utilizador disparar a mensagem com a tag `#SALDOGOOGLE`.

Para análises estratégicas (ex: avaliação de variações de CPC ou comportamento de palavras-chave), o sistema deve gerar e exportar um relatório consolidado em formato `.md`.

Este ficheiro servirá como base de inteligência pura para que o administrador possa consultar e isolar variáveis, garantindo decisões rápidas e orientadas a resultados nas otimizações diárias.