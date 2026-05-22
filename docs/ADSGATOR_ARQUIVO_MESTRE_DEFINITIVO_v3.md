# 📘 ARQUIVO MESTRE ADSGATOR
## Visão Definitiva e Completa do Sistema

**Versão:** 3.0 Final  
**Data:** 21 de maio de 2026  
**Status:** Documento Guia Supremo + Checklist de Implementação  
**Propósito:** Zero Carga Mental da Operação Diária + Gestão Completa da Agência

---

## 🎯 PRINCÍPIOS FUNDACIONAIS

O sistema ADSGATOR é um **copiloto operacional** que deve fazer uma única coisa extraordinariamente bem:

> **Remover toda fricção mental do operador. Qualquer pessoa, em qualquer momento, sabe exatamente o que fazer, onde fazer, e como fazer — sem pensar.**

### Três Pilares

1. **Clareza Radical** — cada tela diz uma coisa, cada ação tem um resultado óbvio
2. **Velocidade Brutal** — tudo que importa está a 3 cliques ou menos
3. **Liberdade Total** — customizável, editável, flexível, seu jeito

---

## 📐 ARQUITETURA DO SISTEMA

### Stack Técnico

```
Frontend: Next.js 14 + React 18 + TypeScript
Styling: Tailwind CSS com Design System próprio (rem-based)
State: Zustand (local) + Supabase Realtime (sync)
Backend: Supabase (PostgreSQL + Auth + Realtime)
IA: Gemini 2.5 via Vertex AI (3 modelos: Lite, Flash, Pro)
APIs: Google Ads, Google Analytics 4, Asaas, Open-Meteo
Editor: Markdown para manifestos (Astro + componentes)
Storage: Supabase Storage (imagens, memórias, manifestos)
```

### Fluxo de Dados

```
Usuario → Interface (React) 
   ↓
Zustand Store + Realtime Subscription
   ↓
Supabase (Auth, DB, RLS)
   ↓
Edge Functions (Webhooks, Processamento, IA)
   ↓
APIs Externas (Google, Asaas, Gemini)
   ↓
Notifications → Toast + Email + WhatsApp
   ↓
Memória do Cliente + Audit Logs + Analytics
```

---

## 🏠 MÓDULO HOME (Dashboard Principal)

### O Que Você Vê Ao Entrar

Você abre o ADSGATOR e **imediatamente sabe o que fazer hoje**. Tudo em uma única tela, organizado por urgência e contexto.

### Layout Bento Grid (12 colunas, responsivo)

#### Seção 1: BRIEFING & CLIMA (Topo)
```
[Morning Briefing (Gemini Pro)]  [Relógio + Clima]
```

**Morning Briefing** (1x ao dia, 9h com posibilidade de procurar novamente, procurar novamente não muda tudo só atualiza as informações)
- Uma IA (Gemini 2.5 Pro) lê a memória de todos os clientes
- Lê notificações do dia anterior
- Lê alertas de campanhas Google Ads
- Gera um parágrafo: "Hoje você tem X urgências, Y a revisar, Z para comunicar. Comece por..."
- Não é um relatório — é um resumo completo de 5 linhas que guia o dia. (Se tiver que ser maior que 5 linhas de a opção de clicar para abrir maior em uma modal).
- Customizável: "Resumir por linguagem", "Por nicho", "Apenas urgências"

**Relógio + Clima** 
- Relógio de ponteiro mostrando hora atual (customizável)
- Clima da cidade do responsável (ou customizável)
- Status API (🟢 verde / 🟡 atenção / 🔴 crítico) 
- Probabilidade de chuva próximas 2h (Open-Meteo API)
- Temperatura atual

#### Seção 2: KPIs RÁPIDOS (Visão da Agência)
```
[Clientes Ativos]  [MRR]  [Lucro]  [Saldo Google]
```

Cada card mostra:
- Número grande (métrica)
- Variação (↑ +5% vs semana anterior)
- Status (🟢 verde / 🟡 atenção / 🔴 crítico)
- Clicável para ir para a página detalhada

Valores são **sempre reais**, calculados do banco de dados em tempo real:
- **Clientes Ativos**: COUNT de clientes com status = 'ativo' ou 'em_progresso'
- **MRR**: SUM de assinatura.valor onde status != 'cancelada' 
- **Lucro**: MRR - custos_fixos - custos_variáveis
- **Saldo Google**: query Google Ads API para cada conta, mostra o total

#### Seção 3: AÇÕES DO DIA (Prioridades)
```
[Ações Ordenadas por Urgência]
```

Uma lista que responde: **"O que preciso fazer AGORA?"**

Cada item mostra:
- **Ícone de prioridade**: 🔴 Urgente | 🟡 Hoje | 🟢 Esta semana
- **Cliente**: nome + nicho (ex: "Julia Martins / Adestramento")
- **Ação**: "Agendar call", "Enviar GA4 brief", "Revisar CPA alto", "Lembrar pagamento", "Manutenção preventiva", "Outro"
- **Tempo**: quando foi criada ou deadline
- **Botão de ação rápida**: clica e já abre WhatsApp pre-preenchido, ou email, ou task

A ordem é determinada por:
1. Clientes com pagamento atrasado (dias_atraso DESC)
2. Clientes com status "pendente_cliente" há mais de 48h
3. Clientes com alerta de campanha (CPA alto, saldo baixo, CPC caro, Sem impressões, Sem conversão)
4. Novos clientes criados na semana (warm onboarding)
5. Clientes com checklist incompleto

Cada ação é **editável**. Você pode marcar como "feita", "adiar para amanhã", "delegar", "transformar em task".

#### Seção 4: CLIENTES EM FOCO (Próxima Ação)
```
[3-5 Cards de Clientes que Precisam de Ação]
```

Cada card mostra:
- **Logo + Nome do cliente** (customizável com imagem)
- **Nicho** (badge com cor por nicho)
- **Status** (Pre-sales / Onboarding / Setup Tráfego / Ativo / Congelado)
- **Próxima ação**: "Agendar call em 27/mai" ou "Setup GA4" ou "Revisar CPA"
- **Tempo desde última interação**: "5 dias atrás"
- **Botões rápidos**:
  - 💬 Abrir WhatsApp com template pré-preenchido
  - 📱 Chamar (Twilio para VOIP)
  - 📋 Ir para página do cliente
  - ⏳ Adiar ação para amanhã
  - 🔒 Congelar cliente (se aguardando dele)

#### Seção 5: FINANCEIRO & LUCRO (Real-time)
```
[DRE Simplificada com Sparkline de 12 meses]
```

Estrutura:
```
MRR: R$ 45.200
├─ Custos Fixos: R$ 18.000
├─ Custos Variáveis: R$ 3.200  
└─ Lucro Líquido: R$ 24.000

Taxa de Lucro: 53%  ↑ +2% (vs mês anterior)
Projeção 6 meses: R$ 144.000
```

Gráfico sparkline abaixo mostrando MRR dos últimos 12 meses (linha suave, não barras ruidosas).

Customizações de usuário:
- Mostrar/ocultar projeção
- Mostrar apenas lucro depois de impostos (input em Configurações)
- Converter para outras moedas (USD, EUR)

Clicável → vai para página Financeiro (detalhada).

#### Seção 6: ALERTAS CRÍTICOS (Google Ads + Asaas)
```
[3-4 Alertas em Tempo Real]
```

Cada alerta tem um ícone e cor:
- 🔴 **Pagamento atrasado**: "Ana Julia — atraso de 15 dias — [Ver] [Cobrar]"
- 🟠 **Saldo Google Ads baixo**: "Paulo Bernard — saldo R$120 — [Recarregar]"
- 🟡 **CPA alto**: "Gabriel — CPA R$350 (↑ +23% vs média) — [Revisar]"
- 🔵 **Campanha pausada**: "Julia Martins — campanha "Google_Search" pausada — [Retomar]"

Cada alerta:
- Identifica o cliente e o problema
- Oferece a ação direta (um clique)
- Mostra contexto (há quanto tempo, qual o impacto)

Atualiza em **tempo real** (Supabase Realtime).

#### Seção 7: ASSISTENTE GEMINI (Chat)
```
[Chat Persistente com IA]
```

Um chat completo que entende tudo sobre a agência e o sistema (tipo Claude Chat) onde você conversa com a IA sobre:
- "Qual é o CPA médio do Gabriel?"
- "Que cliente não ativa há mais tempo?"
- "Gerar copy para novo nicho X"
- "Qual é a previsão de MRR para dezembro?"
- E sobre o sistema em geral, ajudando com dicas, orientações, onde está as coisas...

A IA (Gemini 2.5 Flash) lê:
- Contexto do cliente (se perguntado sobre um específico)
- Dados da agência (MRR, custos, alertas)
- Memória do cliente (se relevante)
- Histórico de conversas (session)
- Consegue entender em tempo real e ler a tela que o usuario está visualizando e oferecer orientações (se perguntado sobre isso)

Respostas são **conversacionais, não robóticas**. Exemplo:

> **Você:** O que está impedindo os anuncios do Gabriel Amaparo funcionar? (Pode ter como adicionar o cliente no contexto para saber exatamente a qual cliente está se refindo)
> **IA:** Gabriel (adestramento em SP) está com CPC máximo muito baixo R$3.40. E como o CPC dos ultimos 3 dias está em R$3.33 é indicativo para aumentar, eu recomendaria trazer pra R$4.00 para ter margem e avaliar dentro de 3 dias. Quer que eu analise mais a fundo?

O chat pode gerar tasks, criar notificações, buscar na memória, etc.

---

## 👥 MÓDULO CLIENTES

### Lista de Clientes (Busca + Filtros)

**Visualização:**
- Grid de cards (como você já tem) OU Lista tabular (depende da preferência do usuário)
- Cada card/linha mostra:
  - Logo/imagem (customizável)
  - Nome
  - Nicho
  - Status (badge com cor)
  - MRR (se ativo)
  - Última interação (ex: "5 dias atrás")
  - Ícone de alerta (se tem pendência)

**Busca:**
- Busca por nome, domínio, email, cidade
- Busca fuzzy (digitou "julia" encontra "Julia Martins")
- Busca por nicho (filter por categoria)

**Filtros (todos customizáveis):**
- Por Status: Todos / Ativos / Em Progresso / Congelados / Cancelados
- Por Nicho: Seleção múltipla
- Por Data: Clientes novos desta semana / mês / ano
- Por Pagamento: Adimplentes / Inadimplentes / Próximos a vencer
- Por Tipo de Alerta: Com alerta / Sem alerta
- Salvar filtros: Você cria "Meus favoritos" e salva um combo de filtros para uso rápido

**Ações em batch:**
- Selecionar múltiplos clientes
- Enviar mensagem (WhatsApp, email)
- Exportar (CSV, PDF)
- Mudar status em lote
- Aplicar tag em lote

---

### Detalhe do Cliente (Página Completa)

Ao clicar em um cliente, você entra na página dele. A página tem **4 abas principais**:

#### Aba 1: VISÃO GERAL

```
┌─ CABEÇALHO ─────────────────────────────────────┐
│ Logo | Nome | Nicho | Status (🟢 Ativo)         │
│ Desde: 15/mai | Contato: +55 11 99999-9999      │
│ [Editar] [Mais ações ▼] [X Fechar]              │
└─────────────────────────────────────────────────┘

┌─ KPIs DO CLIENTE ───────────────────────────────┐
│ MRR: R$ 2.500 | Status Pago: ✅ OK             │
│ Dias de Cliente: 45 | Próxima Fatura: 27/jun    │
└─────────────────────────────────────────────────┘

┌─ PRÓXIMA AÇÃO ──────────────────────────────────┐
│ Otimizar campanha Google Ads!                   │
│ [🔗 Acessar Google Ads] [📋 Task] [⏰ Adiar]               │
└─────────────────────────────────────────────────┘

┌─ STEPPER DE PROGRESSO ──────────────────────────┐
│ [✅ Pré-vendas] → [⏳ Onboarding] → [Setup] → ... │
│ Andamento: 35% — Próx: Setup GA4                │
└─────────────────────────────────────────────────┘

┌─ DADOS DE CAMPANHA ────────────────────────────┐
│ Domínio: {...}   | GTM: {...}   | GA4: {...}   │
│ Ads: {...}       | GMB: {...}   | Email: {...} │
└─────────────────────────────────────────────────┘

┌─ ÚLTIMAS 5 INTERAÇÕES ─────────────────────────┐
│ 21/mai 14:30 | Você editou status para "Online" │
│ 20/mai 10:15 | Criado via webhook (Asaas)      │
│ 19/mai 22:45 | Pagamento recebido: R$ 2.500    │
└─────────────────────────────────────────────────┘
```

Tudo aqui é:
- **Editável inline** (clica no campo e edita)
- **Linkável** (clica no domínio, abre em nova aba)
- **Customizável** (você escolhe quais campos mostrar)

#### Aba 2: CHECKLISTS & PROGRESSO

O cliente passa por **6 macrofases**, cada uma com checklist:

```
1️⃣ PRÉ-VENDAS
   ☐ Call agendada
   ☐ Briefing recebido
   ☐ Proposta enviada
   ☐ Proposta aprovada

2️⃣ ONBOARDING (Em andamento)
   ☑ Dados cadastrados
   ☑ Acesso GA4 criado
   ☐ Google Ads conta criada
   ☐ GTM container ativado
   ☐ Email profissional configurado

3️⃣ SETUP TRÁFEGO
   ☐ Palavras-chave pesquisadas
   ☐ Campanhas criadas
   ☐ Primeiros 7 dias monitorando

4️⃣ TRÁFEGO ATIVO
   ☐ Campanhas rodando 30 dias
   ☐ +30 conversões (meta CPA ativa)
   ☐ Relatório semanal automatizado

5️⃣ OTIMIZAÇÃO CONTÍNUA
   ☐ Análise mensal agendada
   ☐ Ajustes implementados

6️⃣ EXPANSÃO (Opcional)
   ☐ Outras plataformas discutidas
   ☐ Novo nicho explorado
```

Cada checklist é:
- **Editável** (você marca/desmarca)
- **Comentável** (clica e deixa nota: "Aguardando resposta até amanhã")
- **Notificável** (você seta um lembrete: "Lembrar em 2 dias")
- **Responsável** (você atribui para si ou outro membro)

Quando um checklist completa, sistema marca a macrofase como concluída e oferece próxima ação automaticamente.

#### Aba 3: CAMPANHAS & ANALYTICS

```
┌─ GOOGLE ADS ──────────────────────────────────┐
│ Contas: 1 (paulobernardoadestrador.com.br)     │
│                                                │
│ Últimos 7 dias:                                │
│ Investimento: R$ 210  | Cliques: 21           │
│ Impressões: 850       | CTR: 2.5%             │
│ Conversões: 1.5*      | CPA: R$ 140           │
│ ROAS: 3.2x            | Saldo: R$ 2.100       │
│                                                │
│ [Ver Campanha Completa] [Otimizações]          │
└─────────────────────────────────────────────────┘

┌─ GOOGLE ANALYTICS 4 ──────────────────────────┐
│ Últimos 7 dias:                                │
│ Usuários: 450  | Sessões: 520  | Taxa bounce: 42%  │
│ Conversão do site: 0.3% (1.5 conversões)      │
│ Tempo médio: 2m 15s                           │
│                                                │
│ Top 3 páginas:                                │
│ 1. Home — 280 sessões                        │
│ 2. Serviços — 150 sessões                    │
│ 3. Contato — 90 sessões                      │
│                                                │
│ [Ver GA4 Completo] [Eventos Rastreados]       │
└─────────────────────────────────────────────────┘

┌─ GRÁFICOS DE PERFORMANCE ──────────────────────┐
│ [Escolher período: Últimos 7d / 30d / Ano]     │
│                                                │
│ CPA vs Investimento (últimos 30 dias)         │
│ [gráfico de linha dual]                       │
│                                                │
│ Taxa de Conversão por Campanha                │
│ [gráfico de barras]                           │
│                                                │
│ Termos de Busca com Melhor ROAS               │
│ [tabela: termo | impressões | conversões]     │
└─────────────────────────────────────────────────┘
```

Todos os dados são **reais** (APIs Google Ads e GA4, não mocks).
Botões diretos para:
- Abrir no Google Ads (acesso delegado)
- Abrir no GA4
- Abrir no Tag Manager
- Criar relatório PDF
- Criar documento .md
- Gerar recomendações com IA

#### Aba 4: HISTÓRICO COMPLETO

Timeline visual mostrando:
- Mudanças de status
- Transações financeiras (pagamentos, reembolsos)
- Atualizações de dados (quando você editou algo)
- Mensagens enviadas (template usado)
- Alertas disparados (que tipo)
- Notas (que você deixou)

Cada item mostra:
- Data/hora exata
- Tipo (ícone)
- Descrição clara
- Quem fez (você, sistema, webhook)

Customizável: filtrar por tipo de evento.

---

### Criar Novo Cliente (Modal ou Página)

Quando você clica em "+ Novo Cliente":

```
┌─ CADASTRO RÁPIDO ──────────────────────────────┐
│                                                │
│ Nome da Empresa *                              │
│ [_________________________________]            │
│                                                │
│ Nicho *                                        │
│ [Selecionar ▼] (Adestramento, Nutrição, ...)  │
│                                                │
│ Contato (Nome)                                │
│ [_________________________________]            │
│                                                │
│ WhatsApp / Telefone                           │
│ [_________________________________]            │
│                                                │
│ Email                                         │
│ [_________________________________]            │
│                                                │
│ Valor do Plano (MRR)                          │
│ [R$ __________]                               │
│                                                │
│ Período de Cobrança                           │
│ [Mensal ▼]                                    │
│                                                │
│ Data de Início                                │
│ [data picker]                                 │
│                                                │
│ [Cancelar] [Criar Cliente]                    │
└─────────────────────────────────────────────────┘
```

Após criar:
- Sistema cria cliente em status "Pré-vendas"
- Abre página do cliente para continuar cadastro
- Oferece template de WhatsApp inicial (#BOASVINDAS)
- Cria primeira task de onboarding

---

## 💰 MÓDULO FINANCEIRO

### Dashboard Financeiro (Visão da Agência)

```
┌─ RESUMO MENSAL ────────────────────────────────┐
│ Período: Maio 2026                             │
│                                                │
│ MRR: R$ 45.200                  ↑ +12% (vs mês anterior)
│ Churn: 2 clientes cancelados                  │
│ Taxa Churn: 4.2%                              │
│                                                │
│ Receita Operacional: R$ 44.000  (descontos)   │
│ Custos Fixos: R$ 18.000                       │
│ Custos Variáveis: R$ 3.200                    │
│ ──────────────────────────────────            │
│ Lucro Líquido: R$ 22.800        Margem: 53%  │
└─────────────────────────────────────────────────┘

┌─ MÉTRICAS SAÚDE ──────────────────────────────┐
│ LTV (Lifetime Value): R$ 8.450   ↑ +15%      │
│ CAC (Cust. Acquisition Cost): R$ 280  ↓ -8%  │
│ LTV / CAC: 30.2x  (Excelente — >30x)         │
│                                                │
│ Magic Number: 45%  (>30% é bom)               │
│ Payback Period: 1.2 meses                     │
└─────────────────────────────────────────────────┘

┌─ PROJEÇÃO PRÓXIMOS 6 MESES ────────────────────┐
│ Jun: R$ 47.100  | Jul: R$ 49.000              │
│ Ago: R$ 50.800  | Set: R$ 51.500              │
│ Out: R$ 52.200  | Nov: R$ 52.800              │
│                                                │
│ Tendência: ↗ +15% crescimento                 │
│ Impacto churn: -R$ 2.100 (se continuar 4.2%)  │
└─────────────────────────────────────────────────┘

┌─ CLIENTES INADIMPLENTES ──────────────────────┐
│ 🔴 Ana Julia — 15 dias — R$ 2.800             │
│    Próx. ação: Quebra de contrato (D+30)      │
│    [Enviar notif] [Ligar] [Suspender]         │
│                                                │
│ 🟡 Cliente Y — 7 dias — R$ 1.500              │
│    Próx. ação: Alerta automático (D+15)       │
│    [Enviar notif] [Ligar]                     │
└─────────────────────────────────────────────────┘
```

Tudo aqui é **customizável**:
- Período (mensal, semanal, ano)
- Moeda (BRL, USD, EUR)
- Incluir/excluir clientes
- Incluir/excluir tipos de custo
- Marcar como cancelado ou pausado

### Gestão de Custos (Configuração)

Você define em **Configurações > Financeiro**:

```
┌─ CUSTOS FIXOS MENSAIS ─────────────────────────┐
│                                                │
│ Software (Supabase, etc): R$ 2.000             │
│ Salários/Honorários: R$ 10.000                 │
│ Infraestrutura (servidor, domínio): R$ 500    │
│ Outros: R$ 5.500                              │
│ ──────────────────────────────────────        │
│ Total Custos Fixos: R$ 18.000                  │
└─────────────────────────────────────────────────┘

┌─ CUSTOS VARIÁVEIS ─────────────────────────────┐
│                                                │
│ % da Receita aplicado como custo              │
│ (Processamento de pagamento, APIs, etc)       │
│                                                │
│ Taxa: 7% da receita bruta                     │
│                                                │
│ Com MRR de R$ 45.200:                         │
│ Custo Variável = R$ 3.164                     │
└─────────────────────────────────────────────────┘

┌─ IMPOSTO ESTIMADO ─────────────────────────────┐
│ Tipo: MEI / PJ / Outro                        │
│ Alíquota: 11%                                 │
│ Cálculo automático na DRE                     │
└─────────────────────────────────────────────────┘
```

### Transações (Log de Movimentações)

Tabela que mostra **cada transação** da agência:

```
┌─ TODAS AS TRANSAÇÕES ──────────────────────────┐
│ [Filtro: Receita / Despesa / Todas] [Período] │
│                                                │
│ Data      | Tipo      | Cliente    | Valor    │
├───────────┼───────────┼────────────┼──────────┤
│ 21/mai    | Receita   | Ana Julia  | +2.800   │
│ 20/mai    | Despesa   | Salário    | -3.500   │
│ 20/mai    | Receita   | Paulo B.   | +1.500   │
│ 19/mai    | Despesa   | Software   | -500     │
│ 15/mai    | Receita   | Julia M.   | +1.200   │
│ ...                                           │
│                                                │
│ [Exportar CSV] [Criar Lançamento Manual]      │
└─────────────────────────────────────────────────┘
```

Cada transação mostra:
- Origem (cliente, despesa manual, webhook)
- Data e hora
- Descrição customizável
- Categoria (Receita / Despesa / Reembolso)
- Status (Pago / Pendente / Cancelado)
- Quem registrou

Botões:
- Editar (se foi manual)
- Duplicar (criar similar)
- Deletar (com confirmação)

### Cobranças Automáticas (Régua Asaas)

Sistema que monitora atrasos:

```
┌─ DIAS DE ATRASO ──────────────────────────────┐
│                                                │
│ D+0: Vence hoje                               │
│ D+7: ⚠️ Alerta (notif automática no app)       │
│      WhatsApp: "Notei que atraso de 7 dias"  │
│      Email: "Sua conta está vencida"          │
│      ↓                                         │
│ D+15: 🔴 Quebra de contrato                    │
│       WhatsApp + Email: "Suspenderemos..."    │
│       Marca cliente como "Em risco"           │
│       Reduz prioridade nas ações do dia       │
│       ↓                                        │
│ D+30: 🔴 Cancelamento                         │
│       Status = "Cancelado"                    │
│       Inativa todas as campanhas Google Ads   │
│       Move para arquivo histórico              │
│       Envia email de "até logo"               │
│       ↓                                        │
│ D+90: 🟤 Inativação completa                  │
│       Remove de listagens                     │
│       Mantém dados para relatórios            │
└─────────────────────────────────────────────────┘
```

Cada etapa é **customizável**:
- Dias de trigger
- Mensagens (editar templates)
- Ações (notificar, pausar, cancelar)
- Exceções (clientes com contrato especial)

O sistema é **automático** mas você pode:
- Pausar cobranças para um cliente (férias, negociação)
- Marcar como "resolvido" manualmente
- Gerar relatório de inadimplência

---

## 📊 MÓDULO ANALYTICS & MONITORAMENTO

### Google Ads (Visão Integrada)

```
┌─ RESUMO GERAL (TODAS AS CONTAS) ──────────────┐
│                                                │
│ Investimento Total: R$ 4.230      ↑ +8%      │
│ Impressões: 12.450   | Cliques: 398           │
│ CTR Médio: 3.2%      ↑ +1.1%                 │
│                                                │
│ Conversões (fracionadas): 12.5*               │
│ CPA Médio: R$ 245    ↓ -3%                   │
│ CPC Médio: 2.8x     ↑ +4%                   │
│ Saldo Total: R$ 1.250  ⚠️ ALERTA             │
└─────────────────────────────────────────────────┘

┌─ POR CLIENTE ──────────────────────────────────┐
│                                                │
│ 🟢 Paulo Bernard (paulobernardoadestrador)    │
│   Investimento: R$ 2.100 | Cliques: 210      │
│   CTR: 3.8% | Conversões: 8.5* | CPA: R$ 247│
│   Status: Saudável                            │
│   [Ver detalhes] [Otimizações IA]             │
│                                                │
│ 🟡 Natu Espaço Canino (natuespacocanino)      │
│   Investimento: R$ 1.050 | Cliques: 125      │
│   CTR: 2.1% | Conversões: 3* | CPA: R$ 350  │
│   Status: CPA Alto ↑ +23%                     │
│   [Revisar keywords] [IA análise]             │
│                                                │
│ 🔴 Julia Martins (juliamartinsadestradora)   │
│   Investimento: R$ 1.080 | Cliques: 63       │
│   CTR: 1.2% | Conversões: 1* | CPA: R$ 1.080│
│   Status: CRÍTICO — Saldo R$ 32              │
│   [#SALDOGOOGLE] [Pausar] [Otimizar]         │
└─────────────────────────────────────────────────┘
```

Cada conta tem um card individual. Clicando:

```
┌─ DETALHES CAMPANHA (PAULO BERNARD) ────────────┐
│ Período: Últimos 7 dias                        │
│                                                │
│ Investimento vs Conversões (gráfico)          │
│ ├─ Investimento (linha azul)                 │
│ └─ Conversões (barras verdes)                │
│                                                │
│ Top 5 Termos de Busca:                        │
│ Termo | Impressões | Cliques | Conversões   │
│ ─────────────────────────────────────────────│
│ "aula de ... SP" | 450 | 42 | 3.5* | R$ 157  │
│ "professor de ..." | 320 | 28 | 2* | R$ 420 │
│ ...                                           │
│                                                │
│ Palavras-Chave com Melhor Performance        │
│ [Buscar todos os termos] [Negativar termos]   │
│                                                │
│ Quality Score por Campanha                    │
│ Campaign A: 8/10  | Campaign B: 6/10          │
│                                                │
│ [Gerar Recomendações com IA]                  │
│ [Exportar Relatório] [Editar Campanhas]       │
└─────────────────────────────────────────────────┘
```

Alertas em Tempo Real:
- **Saldo baixo** (< limite configurável)
- **CPA acima de X%** vs média
- **CTR abaixo de Y%**
- **CPC muito alto de Z%**
- **Campanha pausada inesperadamente**
- **Qualidade score caindo**

Cada alerta tem um botão de ação rápida:
- 📧 Enviar email com detalhes
- 💬 Avisar cliente (WhatsApp)
- 🤖 Gerar análise com IA
- 📋 Criar task para revisar

### Google Analytics 4 (Visão de Site)

```
┌─ RESUMO SITE (ÚLTIMOS 7 DIAS) ─────────────────┐
│                                                │
│ Usuários: 450  | Novo: 380 (84%)              │
│ Sessões: 520   | Duração média: 2m 15s        │
│ Taxa Rejeição: 42%                            │
│                                                │
│ Eventos Rastreados:                           │
│ Visualização página: 1.200                    │
│ Clique WhatsApp: 45 (conversão)               │
│ Preenchimento form: 12                        │
│ Visualização vídeo: 230                       │
│                                                │
│ Taxa de Conversão (WhatsApp): 0.37%           │
│ Tempo médio até conversão: 4 min 20s          │
└─────────────────────────────────────────────────┘

┌─ TOP 5 FONTES DE TRÁFEGO ──────────────────────┐
│ Google Organic: 280 sessões (54%)             │
│ Google Ads: 150 sessões (29%)                 │
│ Direct: 60 sessões (12%)                      │
│ Referência: 20 sessões (4%)                   │
│ Social: 10 sessões (2%)                       │
└─────────────────────────────────────────────────┘

┌─ TOP 5 PÁGINAS ────────────────────────────────┐
│ /home — 280 sessões | Taxa conversão: 0.5%   │
│ /servicos — 150 sessões | Taxa: 0.3%         │
│ /contato — 90 sessões | Taxa: 10%  ✅        │
│ /blog/artigo-1 — 70 sessões | Taxa: 0.1%     │
│ /precos — 60 sessões | Taxa: 0.2%            │
└─────────────────────────────────────────────────┘

┌─ INSIGHTS IA (ANÁLISE AUTOMÁTICA) ─────────────┐
│ 🟡 Taxa de rejeição acima da média (42% vs 35%)│
│    → Possível: Headlines confuso ou CTR baixo │
│    → Ação: Revisar primeiro parágrafo          │
│                                                │
│ 🟢 Google Organic com taxa 2.1x melhor        │
│    → Possível: SEO está funcionando bem       │
│    → Oportunidade: Aumentar orçamento SEM     │
│                                                │
│ ⚠️ Mobile tem taxa 30% maior que Desktop      │
│    → Possível: Site responsivo está OK       │
│    → Verificar: Performance no mobile        │
└─────────────────────────────────────────────────┘
```

Clicando em cada cliente (aba de Analytics no detalhe), mostra os dados GA4 dele.

### Relatórios Automáticos (Semanal + Mensal)

A IA (Gemini 2.5 Flash) gera **automaticamente**:

**Toda segunda 9h:** Relatório Semanal
```
Semana de 21-27 de maio

RESUMO EXÉCUTIVO
Agência: Status verde. Sem alertas críticos. 
MRR: R$ 45.200 (+12%). Lucro: R$ 22.800.

CLIENTES — O que mudou
1. Paulo Bernard — CPA estável (R$ 247), conversões em alta
2. Ana Julia — ⚠️ Pagamento atrasado 15 dias, alerta enviado
3. Beatriz — ⏳ Aguardando fotos (4 dias), próx lembrete 48h

CAMPANHAS — Alerts
1. Julia Martins (Saldo R$ 32) — Pedir recarregamento hoje
2. Natu (CPA ↑ 23%) — Recomendação: revisar termos, aumentar negativas

FINANCEIRO
MRR: R$ 45.200 | Custos: R$ 21.200 | Lucro: R$ 24.000
Projeção (mês inteiro): R$ 27.000 de lucro

RECOMENDAÇÕES
1. Recarregar Google Ads de Julia — hoje
2. Call com Paulo — revisar estratégia (tá ótimo)
3. Análise de termos de Natu — 2 horas

Próx. ação: Conferir avisos do dia. Começar por Julia.
```

**Dia 1º de cada mês 10h:** Relatório Mensal
```
MÊS: MAIO 2026

PERFORMANCE
MRR: R$ 45.200 | Churn: 4.2% (2 clientes)
Lucro: R$ 22.800 | Margem: 53%
LTV/CAC: 30.2x (Excelente)

TOP PERFORMERS
1. Paulo Bernard — R$ 3.200 MRR, CPA em queda
2. Adsgator (seu próprio) — R$ 2.500 MRR

CLIENTES EM RISCO
1. Ana Julia — 15 dias de atraso
2. Julia Martins — Campanha com problemas de saldo

PRÓXIMOS PASSOS
1. Resolver atraso de Ana Julia
2. Análise detalhada de Natu
3. Onboarding de 2 clientes novos

PREVISÃO JUNHO
Tendência: ↗ +15% de crescimento (se churn se normaliza)
Expectativa: R$ 47.100 de MRR
```

Relatórios são:
- Enviados por **email** automaticamente
- Salvos em **histórico** (acessível a qualquer tempo)
- **Editáveis** (você pode reescrever antes de enviar para cliente)
- **Exportáveis** (PDF, Word, Google Docs)

---

## 🤖 MÓDULO INTELIGÊNCIA ARTIFICIAL

### Arquitetura de 3 Agentes Gemini

O sistema usa **3 modelos diferentes**, cada um com papel específico:

#### 1️⃣ GEMINI 2.5 LITE (Sentinela Rápido)

**Função:** Loop de monitoramento a cada 15 minutos
**Responsabilidades:**
- Checar alertas de Google Ads (saldo, CPA alto, campanha pausada)
- Verificar inadimplência (dias de atraso)
- Criar notificações (toast + badge)
- Gerenciar fila de tarefas rápidas

**Execução:**
- Edge Function disparada a cada 15 min (cron job)
- Lê alertas do banco
- Se houver alerta: notifica usuário (toast) + atualiza badge
- Mantém cache de clima (atualiza a cada 4 hora)
- Resposta < 2 segundos

**Exemplo:**
```
15:00 — Sentinela verifica:
  ✓ Google Ads: OK
  ✓ Pagamentos: 1 alerta (Ana Julia — 15 dias)
  ✓ Campanhas: 1 alerta (Julia — saldo R$ 32)
  
Ação: Notifica usuário com badge "2 alertas críticos"
Toast: "Julia Martins precisa recarregar Google Ads"
```

#### 2️⃣ GEMINI 2.5 FLASH (Analista Relatórios)

**Função:** Análise e geração de relatórios, cópia, diagnósticos
**Responsabilidades:**
- Gerar relatórios semanais/mensais (automático)
- Analisar dados de campanha (CPA, CTR, termos)
- Gerar recomendações de otimização
- Criar copy para cliente (propostas, emails)
- Responder chat do usuário (no dashboard)
- Gerar insights automáticos (por que CPA subiu?)

**Execução:**
- Acionada por eventos (gerar relatório, chat, análise)
- Lê dados de Google Ads + GA4
- Lê memória do cliente (contexto)
- Gera resposta estruturada
- Resposta 3-5 segundos

**Exemplo:**
```
Usuário pergunta no chat: "Por que o CPA de Paulo subiu?"

Flash lê:
- Últimos 30 dias de dados de Paulo
- Memória: "Paulo faz adestramento, público SP"
- Histórico: "CPA era R$ 200, agora R$ 247"

Resposta:
"Paulo teve +23% em CPA. Analisando: 
- Cliques caíram 8% (posição média desceu)
- CTR caiu de 4% para 3.8%
- Top termo 'adestrador sp' teve CPC +15%

Provável: Concorrência aumentou. 
Recomendação: Revisar termos de baixo desempenho, 
aumentar bid em termos top-performers, testar negativações."
```

#### 3️⃣ GEMINI 2.5 PRO (Estrategista Morning)

**Função:** Morning Briefing, decisões estratégicas, manifestos
**Responsabilidades:**
- Gerar Morning Briefing diariamente (9h)
- Análise estratégica completa (lê TODAS as memórias)
- Gerar copy premium (manifestos, propostas)
- Decisões complexas (dev, expansão, novos nichos)
- Previsões de longo prazo

**Execução:**
- Edge Function diária (9h)
- Lê memória de TODOS os clientes (não só um)
- Lê dados consolidados da agência
- Gera brief estruturado (3 parágrafos)
- Resposta 5-10 segundos

**Exemplo:**
```
9h da manhã:

Pro lê:
- Memórias de 24 clientes
- Alertas do dia
- MRR, trends, performance
- Histórico de 90 dias

Gera Morning Briefing:
"Bom dia Lucas! 

Hoje você tem 2 urgências (Ana atrasada 15d, Julia 
precisa recarregar). 3 clientes novos no onboarding, 
Paulo tá com CPA alto (revisar). Agência em alta 
(+12% MRR). Recomendo: morning call com Ana (resolver), 
quick sync com Paulo (30 min), depois onboarding flow.

Clima: 28°, Nublado com 60% chance chuva 16h-18h"
```

### Sistema de Memória do Cliente

Cada cliente tem um arquivo `memory.md` no Supabase Storage:

```
# MEMÓRIA — Paula Bernard

**ID:** uuid-12345
**Atualizado:** 21/mai/2026 14:30
**Versão:** 23

---

## QUEM É

Empresa: Paulo Bernard Adestramento
Contato: Paulo (+55 11 98765-4321)
Nicho: Adestramento Canino
Cidade: São Paulo, SP
Plano: Pro Plus — R$ 3.200/mês
Cliente desde: 10/abr/2026
Status: Ativo

---

## CONTEXTO DO NEGÓCIO

Paulo é adestrador de cães em SP capital. 
Oferece aulas particulares (R$ 200-500 cada) e 
grupos (R$ 80-120). Cliente ideal: donos de 
cães agressivos ou novatos. Diferencial: 
técnica positiva, sem aversão.

---

## INFRAESTRUTURA

| Item | Valor | Status |
|---|---|---|
| Domínio | paulobernardoadestrador.com.br | ✓ Ativo |
| LP | paulobernardoadestrador.com.br/aulas | ✓ No ar |
| GTM | GTM-K9X2M5 | ✓ Instalado |
| GA4 | G-4K8JH2L9 | ✓ Ativo |
| Google Ads | 123-456-7890 | ✓ Gerenciado |

---

## CAMPANHA ATUAL

Nome: "Aula de Adestramento SP"
Orçamento: R$ 210/dia (R$ 6.300/mês)
Estratégia: Target CPA R$ 150
Conversão: Clique em WhatsApp
Palavras-chave: "aula adestramento sp", "professor cão sp", 
"cão agressivo aula"
Negativações: "adestrador grátis", "remédio cão", "pet shop"
Geolocalização: Raio 25km de São Paulo

---

## HISTÓRICO RELEVANTE

- **20/mai** — CPA subiu de R$ 230 para R$ 247 (clientes 
  apontam: "termo novo gerando clique de concorrência")
- **10/mai** — Paulo pediu para pausar campanhas em fins 
  de semana (sábados e domingos) por volume de aulas
- **25/abr** — Orçamento elevado de R$ 150 para R$ 210/dia 
  após bons resultados (20 conversões em 2 semanas)
- **15/abr** — LP aprovada pelo Paulo sem ajustes (rápido, 
  direto, confiante)

---

## PERFIL DE RELACIONAMENTO

Como ta o relacionamento do cliente com a agencia, baseando nas requisições do sistema para ele, são boas, são ruins, ta na média? O quanto de tarefas que são uma solução, melhoria, problema que eu trago como tarefa externa. Tudo isso cria o perfil de relacionamento dele, não é para ser nada complexo não é só para ter um parametro de satisfação.

---

## PERFORMANCE REFERÊNCIA

| Métrica | Melhor | Média | Meta |
|---|---|---|---|
| CPA | R$ 140 | R$ 247 | R$ 200 |
| CTR | 4.2% | 3.9% | > 3.5% |
| Conv/mês | 42 | 32 | 40+ |
| Investimento | R$ 7.000 | R$ 6.300 | R$ 6.300 |

---

## PENDÊNCIAS

- [ ] Revisar termos geradores de CPA alto (concorrência)
- [ ] Testar negativações novas
- [ ] Aumentar bid em termos top-performers

---

## NOTAS LIVRES

Paulo é cliente ideal: paga pontualmente, confia em nós, 
quer crescimento. Oportunidade: oferecer expansão para 
Google Organic + YouTube. Próximo mês: propor trio de 
serviços (Ads + SEO + Video).

Comportamento: Toda mudança quer validação de dados. 
Toda recomendação quer "por quê". Paciência e dados = 
sucesso.

---

*Arquivo lido automaticamente antes de qualquer análise de Paulo. 
Precedência total sobre dados genéricos. Atualizar sempre.*
```

**Quando é lida:**
- Antes de gerar qualquer análise
- Antes de responder chat sobre cliente específico
- Antes de criar relatório individual
- Antes de recomendação de ação

**Como é atualizada:**
- Após cada interação relevante (IA marca o ponto)
- Você pode editar manualmente a qualquer hora
- Sistema faz backup a cada mudança (versioning)

---

## 📱 MÓDULO NOTIFICAÇÕES

Notificações em 3 canais:

### 1. IN-APP (Toast + Badge)

```
Ao abrir o ADSGATOR você vê:

[Notif Bell: "3 alertas"]

Se clicar no bell:
┌─────────────────────────────────────┐
│ NOTIFICAÇÕES (21/mai)               │
├─────────────────────────────────────┤
│                                     │
│ 🔴 CRÍTICO (Agora)                  │
│ "Julia Martins — saldo Google R$ 32"│
│ [Recarregar] [Adiar]                │
│                                     │
│ 🟡 IMPORTANTE (20 min atrás)         │
│ "Ana Julia — atrasado 15 dias"      │
│ [Cobrar] [Contato] [Adiar]          │
│                                     │
│ 🟢 INFO (2 horas atrás)              │
│ "Novo cliente criado: Beatriz"      │
│ [Ver] [Arquivar]                    │
│                                     │
│ [Marcar tudo como lido]             │
└─────────────────────────────────────┘

Notificações desaparecem após 8 horas 
(ou você arquiva), menos as críticas
```

### 2. EMAIL

**Alerts críticos:** enviado na hora
```
Assunto: [ALERTA] Julia Martins — Saldo Google Ads Baixo

Oi Lucas,

Julia Martins (juliamartinsadestradora.com.br) 
precisa recarregar Google Ads.

Saldo atual: R$ 32
Investimento diário: R$ 36

Ação sugerida: Recarregar hoje antes que a 
campanha pause.

[Enviar e-mail de saldo baixo] [Ver Campanha]

—
ADSGATOR
```

**Relatórios:** enviados em cronograma
```
Toda segunda 9h: Relatório semanal
Dia 1º do mês 10h: Relatório mensal
Toda sexta 17h: Resumo da semana
```

### 3. WHATSAPP (Twilio)

Para clientes seus (não automático para você, apenas se ativar):
```
Você pode enviar template pré-preenchidos:

Ao clicar [💬 WhatsApp] no card de cliente:
┌─────────────────────────────────────┐
│ Enviar para: Julia Martins           │
│ +55 11 9 XXXX-XXXX                  │
│                                     │
│ Template:                           │
│ [Selecionar ▼]                      │
│ • #BOASVINDAS                       │
│ • #CONVITE                          │
│ • #BRIEFINGGA                       │
│ • #SALDOGOOGLE                      │
│ • Mensagem customizada              │
│                                     │
│ Preview:                            │
│ "Oi Julia, tudo bem? 👋             │
│  Notei que seu saldo Google caiu... │
│                                     │
│ [Enviar] [Editar] [Cancelar]        │
└─────────────────────────────────────┘
```

Sistema **nunca envia automaticamente** para cliente via WhatsApp (restrição de privacidade + controle). Mas oferece 1-click para você disparar.

---

## ⚙️ MÓDULO CONFIGURAÇÕES

Tudo que você precisa customizar está aqui:

### Aba 1: PERFIL

```
┌─ SEUS DADOS ───────────────────────────────────┐
│ Foto:  [Imagem] [Trocar]                       │
│ Nome: [Lucas Simões]                           │
│ Email: [lucas@adsgator.com.br]                 │
│ Telefone: [+55 11 98765-4321]                  │
│ Cidade: [São Paulo, SP]                        │
└─────────────────────────────────────────────────┘

┌─ SENHAS & SEGURANÇA ────────────────────────────┐
│ [Alterar Senha]                                │
│ [Ativar 2FA]                                   │
│ [Sessões Ativas] — 2 (web, mobile)             │
│ [Remover Sessão] (botão em cada sessão)        │
└─────────────────────────────────────────────────┘
```

### Aba 2: NOTIFICAÇÕES

```
┌─ EMAIL ────────────────────────────────────────┐
│ ☑ Alertas críticos (saldo baixo, atrasado)    │
│ ☑ Relatório semanal (segunda 9h)              │
│ ☑ Relatório mensal (1º 10h)                   │
│ ☐ Resumo Friday (sexta 17h)                   │
│ ☐ Promoções / Tips                            │
└─────────────────────────────────────────────────┘

┌─ TOAST (IN-APP) ───────────────────────────────┐
│ ☑ Alertas críticos                             │
│ ☑ Novas conversões (ações do cliente)          │
│ ☐ Todas as atualizações (verbose)              │
│                                                │
│ Tempo de exibição:                             │
│ [4 segundos ▼]                                 │
└─────────────────────────────────────────────────┘

┌─ HORAS SILENCIOSAS (Do Not Disturb) ───────────┐
│ Ativar: ☑                                      │
│ De: [22:00] Até: [08:00]                       │
│ (Excepto alertas críticos)                     │
└─────────────────────────────────────────────────┘
```

### Aba 3: INTEGRAÇÕES

```
┌─ GOOGLE ACCOUNTS ──────────────────────────────┐
│ Google Ads:                                    │
│ Status: ✓ Conectado (paulobernardoad@...)      │
│ Contas: 3 (Paulo Bernard, Natu, Julia)        │
│ [Reconectar] [Desconectar]                    │
│                                                │
│ Google Analytics 4:                            │
│ Status: ✓ Conectado                            │
│ Properties: 5                                  │
│ [Reconectar] [Desconectar]                    │
│                                                │
│ Google Workspace (Email):                     │
│ Status: ✓ Conectado                            │
│ [Reconectar] [Desconectar]                    │
└─────────────────────────────────────────────────┘

┌─ ASAAS (PAGAMENTOS) ───────────────────────────┐
│ Status: ✓ Conectado                            │
│ API Key: ***************************** (oculta)│
│ Webhook Configurado: ✓                        │
│ [Testar Webhook] [Gerar Nova Key]             │
└─────────────────────────────────────────────────┘

┌─ WHATSAPP (TWILIO) ────────────────────────────┐
│ Status: ✓ Conectado                            │
│ Número: +55 11 9 XXXX-XXXX                    │
│ [Desconectar]                                 │
└─────────────────────────────────────────────────┘

┌─ GEMINI (IA) ──────────────────────────────────┐
│ Status: ✓ Conectado (Vertex AI)                │
│ Modelos: Flash, Pro ativados                  │
│ [Testar Conexão] [API Key]                    │
└─────────────────────────────────────────────────┘
```

### Aba 4: FINANCEIRO

```
┌─ CUSTOS MENSAIS ───────────────────────────────┐
│ Custos Fixos Totais: R$ 18.000                 │
│ [Edit ✏️]                                      │
│                                                │
│ Custos Variáveis: 7% da receita               │
│ [Edit ✏️]                                      │
│                                                │
│ Imposto (MEI 11%): Aplicar na DRE ☑           │
│ [Edit ✏️]                                      │
└─────────────────────────────────────────────────┘

┌─ ALERTAS FINANCEIROS ──────────────────────────┐
│ Saldo Google Ads (Limite): R$ 500 [Edit]      │
│ Dias Atraso (Alerta): 7 [Edit]                │
│ Dias Atraso (Quebra): 15 [Edit]               │
│ Dias Atraso (Cancelamento): 30 [Edit]         │
└─────────────────────────────────────────────────┘

┌─ RÉGUA DE COBRANÇA (TEMPLATES) ────────────────┐
│ Mensagem D+7:                                 │
│ [Edit] "Notei que atraso de 7 dias..."        │
│                                                │
│ Mensagem D+15:                                │
│ [Edit] "Seu contrato será rescindido..."      │
│                                                │
│ Mensagem D+30:                                │
│ [Edit] "Campanha será suspensa..."            │
└─────────────────────────────────────────────────┘
```

### Aba 5: APARÊNCIA

```
┌─ TEMA ─────────────────────────────────────────┐
│ ◉ Dark Mode (Padrão)                           │
│ ○ Light Mode                                  │
│ ○ System (segue configuração do SO)            │
└─────────────────────────────────────────────────┘

┌─ DASHBOARD ────────────────────────────────────┐
│ Mostrar Morning Briefing: ☑                    │
│ Mostrar Clima: ☑                              │
│ Mostrar KPIs: ☑                               │
│ Mostrar Alertas: ☑                            │
│ Mostrar Assistente IA: ☑                      │
│                                                │
│ Ordem dos cards: [Drag & Drop para reordenar]  │
│                                                │
│ [Restaurar padrão]                            │
└─────────────────────────────────────────────────┘

┌─ PREFERÊNCIAS ─────────────────────────────────┐
│ Idioma: [Português BR ▼]                       │
│ Fuso Horário: [America/Sao_Paulo ▼]           │
│ Moeda: [BRL ▼]                                │
│ Formato de Data: [DD/MM/YYYY ▼]               │
└─────────────────────────────────────────────────┘
```

### Aba 6: EQUIPE & PERMISSÕES

```
┌─ MEMBROS DA EQUIPE ────────────────────────────┐
│                                                │
│ Você (Proprietário)                           │
│ lucas@adsgator.com.br                         │
│ Todas as permissões                           │
│                                                │
│ Maria Silva                                   │
│ maria@adsgator.com.br                         │
│ Permissões: ◯ Gerenciador ◯ Analista ◯ Viewer │
│ [Editar] [Remover]                            │
│                                                │
│ João Santos                                   │
│ joao@adsgator.com.br                          │
│ Permissões: ◯ Gerenciador ◉ Analista ◯ Viewer │
│ [Editar] [Remover]                            │
│                                                │
│ [+ Convidar Novo Membro]                      │
└─────────────────────────────────────────────────┘

┌─ PERMISSÕES ───────────────────────────────────┐
│ Gerenciador:                                  │
│ ✓ Editar clientes                             │
│ ✓ Editar configurações                        │
│ ✓ Convidar membros                            │
│ ✓ Ver financeiro completo                     │
│                                                │
│ Analista:                                     │
│ ✓ Ver clientes e dados                        │
│ ✓ Criar tarefas                               │
│ ✗ Editar configurações                        │
│ ✓ Ver financeiro (resumido)                   │
│                                                │
│ Viewer (Consultante):                        │
│ ✓ Ver dados (leitura)                         │
│ ✗ Criar ou editar                             │
│ ✗ Ver financeiro                              │
└─────────────────────────────────────────────────┘
```

---

## 📚 MÓDULO BIBLIOTECA & MANIFESTO

### Seleção de Componentes (Astro)

Você escolhe **até 10 componentes** pré-desenhados:

```
CATEGORIA: NAVEGAÇÃO
┌─────────────────────┐  ┌─────────────────────┐
│ Navbar Simples      │  │ Navbar com Logo     │
│ [Preview]           │  │ [Preview]           │
│ [Selecionar]        │  │ [Selecionar]        │
└─────────────────────┘  └─────────────────────┘

CATEGORIA: HERO
┌─────────────────────┐  ┌─────────────────────┐
│ Hero 01 — Texto     │  │ Hero 02 — com Video │
│ (Simples, bold)     │  │ (Dinâmico, lux)     │
│ [Preview]           │  │ [Preview]           │
│ [Selecionar]        │  │ [Selecionar]        │
└─────────────────────┘  └─────────────────────┘

CATEGORIA: BENEFÍCIOS
┌─────────────────────┐  ┌─────────────────────┐
│ 3 Cards             │  │ 4 Cards com ícones  │
│ [Preview]           │  │ [Preview]           │
│ [Selecionar]        │  │ [Selecionar]        │
└─────────────────────┘  └─────────────────────┘

CATEGORIA: CTA (Call-to-Action)
┌─────────────────────┐
│ CTA Fixo ao scroll  │
│ [Preview]           │
│ [Selecionar]        │
└─────────────────────┘

[Próximos Componentes]
```

Cada componente mostra:
- Nome
- Descrição (o que é, quando usar)
- Preview interativo
- Botão "Selecionar" ou "Ver mais"

### Construtor Visual

Depois que você seleciona componentes:

```
┌─ ORDEM DOS COMPONENTES ────────────────────────┐
│                                                │
│ 1. [Hero 01 — Texto] ↕ (Drag para reordenar)   │
│ 2. [Benefícios — 3 Cards] ↕                    │
│ 3. [Depoimentos] ↕                             │
│ 4. [CTA Fixo] ↕                                │
│                                                │
│ [Adicionar outro] [Remover último]             │
│                                                │
│ [← Voltar] [Preview] [Gerar Manifesto]         │
└─────────────────────────────────────────────────┘
```

Clicando em "Preview", mostra a LP inteira renderizada.

Clicando em "Gerar Manifesto", cria um arquivo `.md`:

```
# MANIFESTO — Beatriz Adestramento

**Data Criação:** 21/mai/2026
**Cliente:** Beatriz
**Nicho:** Adestramento Canino

---

## ESTRATÉGIA

Nicho: Adestramento de cães em SP
Paleta: Verde + Amarelo + Branco
Direção: Confiança, profissionalismo, calidez
Público: Donos de cães agressivos, educação positiva

---

## ESTRUTURA DE BLOCOS

1. Hero 01 (Texto)
   - Headline: "Seu cão vai ser Feliz"
   - Subheading: "Adestramento com método positivo"
   - CTA: "Agendar Aula Grátis"

2. Benefícios (3 Cards)
   - Sem punição, com reforço positivo
   - Resultado em 4 semanas
   - Aulas personalizadas

3. Depoimentos (Social Proof)
   - Cliente 1: "Meu dog era agressivo, agora..."
   - Cliente 2: "Processo rápido e eficaz"
   - Cliente 3: "Recomendo muito!"

4. CTA Fixo (Rodapé)
   - Botão verde: "Chamar no WhatsApp"
   - Email: beatriz@...

---

## COPY POR SEÇÃO

[Detalhes de cada seção com texto, CTAs, etc]

---

*Use este manifesto para briefar o desenvolvedor.
Ele contém: estrutura visual, copy, estratégia, paleta.*
```

O manifesto é **editável**. Você pode:
- Trocar textos
- Mudar ordem de componentes
- Adicionar novas seções
- Exportar para HTML (pronto para dev)

---

## 📋 MÓDULO DE TAREFAS & TIMELINE

Cada ação rápida pode virar uma **task persistent**:

```
┌─ MINHAS TASKS ─────────────────────────────────┐
│                                                │
│ Filtro: [Tudo ▼]  [Por Cliente ▼]             │
│                                                │
│ HOJE (3 tasks)                                 │
│ ☐ Recarregar Google Ads de Julia              │
│   [Crítico] — Julia Martins                   │
│   [+15 min] [Feito] [Adiar] [Deletar]         │
│                                                │
│ ☑ Call com Paulo                              │
│   [Normal] — Paulo Bernard — 15:00            │
│   [Feito ✓] [Editar] [Deletar]                │
│                                                │
│ ☐ Onboarding: Beatriz — Setup GA4             │
│   [Normal] — Beatriz                          │
│   [+2h] [Feito] [Adiar] [Deletar]             │
│                                                │
│ PRÓXIMA SEMANA (5 tasks)                       │
│ ☐ Revisão mensal de Ana Julia                 │
│   [Data: 27/mai]                              │
│   [+1 dia] [Feito] [Adiar] [Deletar]          │
│                                                │
│ ... (mais 4)                                   │
│                                                │
│ [+ Nova Task]                                 │
└─────────────────────────────────────────────────┘
```

Cada task tem:
- **Descrição** (editável)
- **Cliente** (linkado)
- **Prioridade** (crítico / alto / normal / baixo)
- **Data/hora** (com lembretes)
- **Responsável** (você ou outro membro)
- **Checklist** (se complexa)

Ao marcar "Feito", registra no histórico do cliente automaticamente.

---

## 🎨 MÓDULO MARKETING & REDES SOCIAIS

Aqui você planeja e publica nas redes:

```
┌─ CALENDÁRIO SOCIAL (PRÓXIMAS 4 SEMANAS) ───────┐
│                                                │
│ Seg 21  Ter 22  Qua 23  Qui 24  Sex 25  ...   │
│                                                │
│  [Post]  [Post]  [...]   [...]   [...]       │
│ Instagram Instagram                           │
│ "Foto do  "Dica de                            │
│  dia com  adestramento"                       │
│  cliente"                                      │
│                                                │
│ [Editar] [Publicar agora] [Agendar]           │
│                                                │
│ Próx. post sugerido (IA):                     │
│ "Sexta seria bom publicar case de sucesso"    │
└─────────────────────────────────────────────────┘

┌─ CRIAR NOVO POST ──────────────────────────────┐
│ Rede: [Instagram ▼]                           │
│ Tipo: [Foto] [Vídeo] [Carrossel] [Reels]      │
│                                                │
│ Texto:                                        │
│ [________________________________              │
│  ________________________________              │
│  ________________________________]             │
│                                                │
│ Mídia: [Upload] [Galeria] [Template IA]       │
│                                                │
│ Hashtags:                                     │
│ [Gerar automático] [Manual]                   │
│ #adestramento #cão #sp #positivo ...          │
│                                                │
│ Agendar para: [Data picker] [Hora picker]     │
│                                                │
│ [Preview] [Agendar] [Publicar Agora]          │
└─────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Calendar visual (ver posts agendados)
- Templates pré-prontos (por nicho)
- IA gera sugestões de post (Gemini Flash)
- Agendamento automático (Meta + Instagram API)
- Analytics básico (likes, comentários, reach)

---

## 🔍 BUSCA GLOBAL

Qualquer tela tem uma **busca global** no topo:

```
[🔍 Buscar em tudo...]

Você digita "Julia" e aparece:
┌─────────────────────────────────────┐
│ CLIENTES                            │
│ • Julia Martins (Adestramento)      │
│ • Juliana Santos (Nutrição)         │
│                                     │
│ TASKS                               │
│ • Call com Julia (para hoje)        │
│                                     │
│ TRANSAÇÕES                          │
│ • Pagamento Julia Martins — R$ 1.2k │
│                                     │
│ HISTÓRICO                           │
│ • Alerta: Julia — saldo baixo (ontem)│
│                                     │
│ DOCUMENTOS                          │
│ • Manifesto Julia Martins.md        │
│                                     │
│ [Ver mais resultados]               │
└─────────────────────────────────────┘
```

Busca é **fuzzy** (tolera typos) e busca em:
- Nomes de clientes
- Tasks
- Transações
- Histórico
- Documentos
- Anotações

---

## 📊 DASHBOARD DE ANÁLISE (Power BI Style)

Página única mostrando **toda a saúde do negócio**:

```
┌─ VISÃO COMPLETA DA AGÊNCIA ────────────────────┐
│                                                │
│ MRR: R$ 45.200  Lucro: R$ 22.800             │
│ Churn: 2 clientes (4.2%)                     │
│ Novos: 4 clientes (chegam neste mês)         │
│                                                │
│ [Período: Últimos 30 dias ▼]                  │
│                                                │
│ ┌────────────────┐  ┌────────────────┐        │
│ │ MRR Trend      │  │ Lucro Trend    │        │
│ │ (linha 12m)    │  │ (linha 12m)    │        │
│ │                │  │                │        │
│ └────────────────┘  └────────────────┘        │
│                                                │
│ ┌────────────────┐  ┌────────────────┐        │
│ │ Clientes       │  │ LTV/CAC Ratio  │        │
│ │ Por Status     │  │ (gauge)        │        │
│ │ (pie chart)    │  │                │        │
│ └────────────────┘  └────────────────┘        │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │ Top 5 Clientes por MRR                   │  │
│ │ Paulo Bernard — R$ 3.200                 │  │
│ │ Beatriz — R$ 2.200                       │  │
│ │ Julia Martins — R$ 1.800                 │  │
│ │ Ana Julia — R$ 1.700                     │  │
│ │ Adsgator (seu próprio) — R$ 1.500        │  │
│ └──────────────────────────────────────────┘  │
│                                                │
│ [Exportar Dashboard] [Detalhes]               │
└─────────────────────────────────────────────────┘
```

Dashboard é **customizável**:
- Escolher métricas mostradas
- Adicionar/remover gráficos
- Exportar em PDF ou data
- Compartilhar com equipe

---

## 🔒 SEGURANÇA & AUDIT

Tudo é rastreado:

### Audit Log

```
┌─ HISTÓRICO DE AÇÕES (ÚLTIMOS 7 DIAS) ──────────┐
│                                                │
│ 21/mai 14:30 | Você editou "Julia Martins"    │
│ Status: "Pré-sales" → "Onboarding"            │
│ IP: 189.45.XX.XX                              │
│                                                │
│ 20/mai 10:15 | Sistema criou "Beatriz"        │
│ Trigger: Webhook Asaas                        │
│ ID: webhook_12345                             │
│                                                │
│ 19/mai 22:45 | Você criou task "Revisar CPA"  │
│ Cliente: Paulo Bernard                        │
│ IP: 189.45.XX.XX                              │
│                                                │
│ ... (mais entradas)                           │
│                                                │
│ [Filtrar por tipo] [Exportar]                 │
└─────────────────────────────────────────────────┘
```

Cada ação log mostra:
- Data/hora exata
- Tipo (create, update, delete)
- Campos alterados (before/after)
- Quem fez (user ID)
- IP de origem

### Backup & Restore

```
┌─ BACKUP ───────────────────────────────────────┐
│ Último backup: 21/mai 14:30 UTC                │
│ Frequência: Diária (automático)                │
│                                                │
│ Histórico de Backups:                          │
│ • 21/mai (2 horas atrás)                      │
│ • 20/mai (1 dia atrás)                        │
│ • 19/mai (2 dias atrás)                       │
│                                                │
│ [Download Backup] [Restaurar] [Automático?]   │
└─────────────────────────────────────────────────┘
```

---

## 🌐 API PÚBLICA (Para Parceiros)

Se você quer integrar ADSGATOR com outro sistema:

```
GET  /api/clientes                    — Listar clientes
POST /api/clientes                    — Criar cliente
GET  /api/clientes/{id}               — Detalhes
PATCH /api/clientes/{id}              — Atualizar
DELETE /api/clientes/{id}             — Deletar

GET  /api/financeiro/mrr              — MRR atual
GET  /api/financeiro/dre              — DRE simplificada
GET  /api/financeiro/transacoes       — Todas transações

POST /api/webhook/custom              — Receber eventos customizados

GET  /api/analytics/{cliente_id}      — Dados Google Ads
GET  /api/ga4/{client_id}             — Dados GA4

POST /api/notificacao                 — Disparar notificação

GET  /api/relatorio/{id}              — Gerar relatório
```

Documentação: `/api-docs` (Swagger automático)

Token via: Configurações > API Keys

---

## 📱 RESPONSIVIDADE

Sistema funciona perfeitamente em:
- **Desktop** (1920px+): Layout completo, 12 colunas
- **Tablet** (768px-1024px): Layout 6 colunas, drawer lateral
- **Mobile** (320px-767px): Layout 1 coluna, botões grandes, gestos

Nenhuma funcionalidade é perdida no mobile. Tudo é adaptado.

---

## ⚡ PERFORMANCE

- **First Paint**: < 1s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

Implementado via:
- Code splitting por rota
- Image optimization (Next.js)
- CSS-in-JS otimizado (Tailwind)
- Realtime batching (Supabase)
- Caching estratégico (React Query)
- CDN global (Vercel)

---

## 🚀 DEPLOYMENT & INFRAESTRUTURA

```
Frontend: Vercel (Auto-deploy em push)
Backend: Supabase (Postgres + Auth + Realtime)
Edge Functions: Supabase (auto-deploy)
CDN: Vercel / Cloudflare
Storage: Supabase Storage
IA: Google Vertex AI
APIs: Google Cloud (Ads, Analytics, Maps)
Pagamentos: Asaas (webhook)
Email: Resend ou SendGrid
Analytics da Plataforma: PostHog
```

CI/CD:
- Push para main → Testes automáticos → Deploy automático
- Staging automático em preview branches
- Rollback com 1 clique

---

## 📖 DOCUMENTAÇÃO & HELP

Sistema tem 3 níveis de ajuda:

### 1. Inline Help (Tooltips)

Hover em qualquer ícone `(ⓘ)` e aparece explicação.

### 2. Help Center

Link em Configurações > Ajuda que abre:
- Guia de início rápido (10 min)
- FAQs
- Tutoriais em vídeo (opcionais)
- Contact support (email)

### 3. Chat com IA

Clique no "?" flutuante e converse com IA (gemini-2.5-flash-lite) sobre como usar.

---

## 🎯 PROPÓSITO FINAL

O ADSGATOR é um **operador digital pessoal** que:

✅ **Zera a carga mental** — você sempre sabe o que fazer  
✅ **Acelera operações** — tudo a 3 cliques no máximo  
✅ **Profissionaliza entregas** — relatórios automáticos, templates  
✅ **Escala sem atrito** — mais clientes, sem mais trabalho mental  
✅ **Liberdade total** — customizável, editável, seu jeito  

**Qualquer pessoa** seguindo este sistema consegue:
- Gerenciar clientes (onboarding até pós-venda)
- Monitorar campanhas em tempo real
- Manter saúde financeira (MRR, custos, lucro)
- Comunicar eficientemente (WhatsApp, email)
- Gerar relatórios profissionais
- Tomar decisões rápidas com dados reais
- Apoiar a agência (portfolio, redes, marketing)

Sem pensar. Só seguindo o sistema.

---

**Este documento é a bíblia do ADSGATOR. Use como referência absoluta.**

**Última atualização: 21/mai/2026**

