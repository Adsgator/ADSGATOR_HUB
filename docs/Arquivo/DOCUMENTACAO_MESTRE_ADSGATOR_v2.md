# DOCUMENTAÇÃO MESTRE DE ENGENHARIA — ADSGATOR OS
**Versão:** 2.0 — Sistema Nervoso Central da Agência  
**Atualizado:** 2026-05-22  
**Status:** Documento vivo — base de contexto para IA local (Cursor/Roo Code)

---

## VISÃO GERAL DO PROJETO

O Adsgator OS é o sistema operacional interno da agência Adsgator. Seu único objetivo é **zerar a carga mental da operação diária** — fazendo com que o operador abra o sistema, veja exatamente o que precisa ser feito, execute com um clique e avance.

O sistema tem consciência de todos os clientes, seus estados operacionais, pendências, saúde financeira, performance de campanhas e próximas ações. Ele não é um painel passivo: é um copiloto ativo que pensa, alerta, resume e age.

A interface combina a severidade visual do **console Supabase/Firebase** com a fluidez e modularidade de um **Bento Grid** — onde cada card tem um propósito, uma hierarquia e pode ser reorganizado conforme a prioridade do dia.

---

## PARTE 0 — FILOSOFIA DO SISTEMA

### 0.1 Princípios Inegociáveis

- **Ação clara, zero ambiguidade.** O sistema sempre mostra qual é a próxima ação para cada cliente. Nunca um estado vago.
- **Burocracia zero.** Nenhum script longo, nenhum formulário desnecessário. Mensagens são geradas e enviadas em um clique.
- **Tudo registrado.** Toda ação relevante (mudança de plano, orçamento de ads, suspensão, aprovação) é logada de forma imutável no perfil do cliente.
- **IA como parceira, não como substituta.** O operador refina e aprova. A IA gera o grosso.
- **Unidade `rem` absoluta.** Nenhum valor `px` em espaçamentos, fontes ou bordas. Sem exceção.
- **Ícones Lucide React, vazados, stroke padronizado** globalmente.

### 0.2 Regras de Negócio Gerais

- O processo de vendas é **100% por texto no WhatsApp**, sem call. São 5 partes sequenciais: Gancho → Conexão → Solução Visual → Investimento → Fechamento. Detalhado na Parte 4.1.
- Conversões fracionadas (ex: `0.5`) em Google Ads são **corretas e esperadas** — atribuição baseada em dados. Nunca sinalizar como erro.
- Clientes de referência para simulação: **Beatriz** (adestramento), **Ana** (nutrição), **Gabriel** (gestão de tráfego).

---

## PARTE 1 — STACK TÉCNICA E ARQUITETURA

### 1.1 Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 (App Router) + Tailwind CSS v4 |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Edge Functions | Supabase Edge Functions (Deno) |
| IA Principal | Google Gemini API (3 modelos com papéis distintos) |
| IA Auxiliar | Anthropic Claude (via API — análises pontuais e geração de documentos) |
| Pagamentos | Asaas (webhooks de entrada) |
| Hospedagem LP Clientes | Vercel |
| Email Clientes | Hostgator (configuração via DNS + registros MX) |
| Tag Manager | Google Tag Manager (por cliente) |
| Analytics | Google Analytics 4 (por cliente) |
| Domínios | Registro.br / Hostgator |

### 1.2 Modelagem do Banco de Dados (PostgreSQL / Supabase)

#### Tabela: `clients`
```sql
id uuid PRIMARY KEY
name text NOT NULL
company_name text
phone text
email text
niche text -- ex: adestramento, nutrição, tráfego
plan_id uuid REFERENCES plans(id)
operational_stage text -- enum: ver seção 3.1
status text -- ativo | congelado | cancelado_debito | encerrado
created_at timestamptz
updated_at timestamptz
asaas_customer_id text
notes text
```

#### Tabela: `plans`
```sql
id uuid PRIMARY KEY
name text -- LP Pro | Ads Start | Ads Boost | Ads Power
monthly_price numeric
max_ad_budget numeric -- só para planos Ads
description text
```

#### Tabela: `subscriptions`
```sql
id uuid PRIMARY KEY
client_id uuid REFERENCES clients(id)
plan_id uuid REFERENCES plans(id)
status text -- ativo | suspenso | cancelado | inadimplente
asaas_subscription_id text
next_due_date date
overdue_days int DEFAULT 0
payment_method text
started_at timestamptz
ended_at timestamptz
```

#### Tabela: `client_assets`
```sql
id uuid PRIMARY KEY
client_id uuid REFERENCES clients(id)
domain text
vercel_project_id text
vercel_domain_configured bool DEFAULT false
hostgator_email_configured bool DEFAULT false
dns_configured bool DEFAULT false
ssl_active bool DEFAULT false
gtm_container_id text
ga4_measurement_id text
ads_account_id text
gmb_connected bool DEFAULT false
landing_page_url text
linktree_url text
drive_folder_url text
```

#### Tabela: `operational_stages` (log de mudanças de estágio)
```sql
id uuid PRIMARY KEY
client_id uuid REFERENCES clients(id)
from_stage text
to_stage text
changed_by text
changed_at timestamptz
note text
```

#### Tabela: `financial_entries`
```sql
id uuid PRIMARY KEY
type text -- receita | custo_fixo | custo_variavel
description text
amount numeric
reference_month date
client_id uuid REFERENCES clients(id) -- null para custos da agência
category text
created_at timestamptz
```

#### Tabela: `action_log` (imutável)
```sql
id uuid PRIMARY KEY
client_id uuid REFERENCES clients(id)
action_type text -- budget_change | suspension | plan_change | approval | note
description text
metadata jsonb
performed_at timestamptz
performed_by text
```

#### Tabela: `ads_reports`
```sql
id uuid PRIMARY KEY
client_id uuid REFERENCES clients(id)
report_date date
investment numeric
clicks int
impressions int
ctr numeric
conversions numeric -- aceita decimais ex: 0.5, 1.5
cpa numeric
quality_score numeric
campaign_name text
keywords_snapshot jsonb
raw_data jsonb
```

#### Tabela: `pending_items`
```sql
id uuid PRIMARY KEY
client_id uuid REFERENCES clients(id)
reason text
frozen_at timestamptz
alert_sent_at timestamptz -- alerta automático 48h
resolved_at timestamptz
```

#### Tabela: `lp_manifests`
```sql
id uuid PRIMARY KEY
client_id uuid REFERENCES clients(id)
niche text
color_palette jsonb -- { primary, secondary, accent, bg, text }
art_direction text
selected_components jsonb -- array de componentes ex: ["Hero_02", "Beneficios_01"]
copy_structure jsonb -- { hero: { title, subtitle, cta }, beneficios: [...] }
status text -- rascunho | aprovado | em_desenvolvimento | publicado
created_at timestamptz
exported_at timestamptz
```

---

## PARTE 2 — INTERFACE: BENTO GRID HOME

### 2.1 Filosofia Visual

A Home do Adsgator OS é um **Bento Grid** de alta densidade e hierarquia clara, inspirado no Firebase Console com toque de produto premium.

- **Tema Dark por padrão** com alternância Dark/Light/System via classes `dark:` do Tailwind
- **Grid responsivo** com breakpoints `sm`, `md`, `lg` — o grid colapsa de 4 colunas para 1 coluna
- **Cards rearranháveis** — o operador pode fixar ou mover blocos (drag and drop via `@dnd-kit`)
- **Sem px em nenhum lugar** — tudo em `rem`
- **Bordas finas**: `border border-zinc-800` (dark) / `border border-zinc-200` (light)
- **Radius sutil**: `rounded-xl` (0.75rem) nos cards
- **Background**: `bg-zinc-950` (dark) / `bg-zinc-50` (light)

### 2.2 Anatomia do Bento Grid (Layout Padrão)

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (fixo, 14rem)  │  CONTEÚDO PRINCIPAL               │
│  Logo Adsgator          │                                    │
│  ─────────────────      │  ┌──────────┬──────┬──────────┐  │
│  Home                   │  │ MORNING  │RELÓG.│  CLIMA   │  │
│  Clientes               │  │ BRIEFING │PONT. │ + CHUVA  │  │
│  Financeiro             │  │ (2x1)    │(1x1) │  (1x1)   │  │
│  Campanhas              │  ├──────────┴──────┴──────────┤  │
│  Biblioteca LP          │  │ CLIENTES EM FOCO (3x1)     │  │
│  Configurações          │  │ Cards de ação imediata      │  │
│  ─────────────────      │  ├────────────┬───────────────┤  │
│  Status Gemini          │  │ MRR / DRE  │ ALERTA ADS    │  │
│  ● Lite (ativo)         │  │ FINANCEIRO │ SALDO BAIXO   │  │
│  ● Flash (standby)      │  │ (2x1)      │ (1x1)         │  │
│  ○ Pro (on demand)      │  ├────────────┴───────────────┤  │
└─────────────────────────┘  │ ASSISTENTE GEMINI (chat)   │  │
                             │ (full width, collapsível)   │  │
                             └────────────────────────────┘  │
```

### 2.3 Cards do Bento Grid

#### Card: Morning Briefing (2×1 — destaque)
- Gerado automaticamente ao abrir o sistema (chamada ao **Gemini Pro**)
- Conteúdo: resumo do dia anterior, clientes com pendências, alertas financeiros, performance geral das campanhas
- Tom: direto, sem rodeios, máximo 5 bullets
- Atualiza uma vez ao dia (primeira abertura após 6h da manhã)
- Botão: "Regenerar briefing" → nova chamada ao Pro

#### Card: Relógio de Ponteiro (1×1)
- SVG animado com ponteiros hora, minuto, segundo
- Hora local do operador
- Sem números, estilo minimalista
- Background sutil com grade milimétrica

#### Card: Clima + Probabilidade de Chuva (1×1)
- API: Open-Meteo (gratuita, sem chave)
- Exibe: temperatura atual, ícone de condição, probabilidade de chuva em %
- Localização: detectada automaticamente ou configurada manualmente
- Atualizado a cada 30 min pelo **Gemini Lite**

#### Card: Clientes em Foco (3×1 — zona de ação)
- Lista filtrada dos clientes com ação imediata necessária
- Cada cliente exibe: nome, estágio atual, **botão de ação primária** com o texto exato do que fazer
- Clientes congelados (pendentes) não aparecem aqui
- Ordenados por urgência (vermelho → laranja → verde)

#### Card: MRR / DRE Simplificado (2×1)
- MRR em tempo real (soma de assinaturas ativas)
- Receita do mês vs. custos fixos + variáveis = **Lucro Líquido**
- Mini sparkline dos últimos 6 meses
- Atualiza via Supabase Realtime

#### Card: Alertas de Ads (1×1)
- Mostra clientes com **saldo de Google Ads abaixo do crítico**
- Botão de ação: gera e abre WhatsApp com a mensagem `#SALDOGOOGLE` automaticamente
- Badge vermelho piscante quando há alertas ativos

#### Card: Assistente Gemini (largura total, collapsível)
- Chat persistente na Home
- O modelo usado depende da complexidade detectada (ver Parte 3)
- Contexto injetado automaticamente: clientes ativos, estágio, financeiro atual, últimos alertas
- Histórico da sessão salvo no Supabase

---

## PARTE 3 — ARQUITETURA DE IA: OS TRÊS AGENTES GEMINI

### 3.1 Hierarquia de Modelos

| Modelo | Papel | Frequência | Gatilho |
|---|---|---|---|
| `gemini-2.5-flash-lite` | **Sentinela** — rotinas, notificações, alertas, clima | Alta (loop a cada 15min) | Automático |
| `gemini-2.5-flash` | **Analista** — análises rápidas, relatórios, copy de anúncios, revisões | Média (sob demanda leve) | Ação do operador |
| `gemini-2.5-pro` | **Estrategista** — briefings matinais, estratégia de campanha, diagnósticos complexos, geração de manifesto LP | Baixa (on demand) | Operador solicita ou gatilho crítico |

### 3.2 Gemini Lite — O Sentinela

**Responsabilidades:**
- Loop de monitoramento a cada 15 minutos via Supabase Edge Function agendada
- Verificar clientes com `pending_items` congelados há mais de 48h → disparar alerta no dashboard
- Verificar saldo de contas Google Ads → acionar card de alerta se abaixo de 3× o orçamento diário
- Verificar assinaturas com `overdue_days` de 7, 15 ou 30 dias → acionar régua de cobrança
- Atualizar card de clima (Open-Meteo a cada 30 min)
- Monitorar se domínios de clientes estão no ar (ping simples a cada 1h)
- Retornar sempre JSON estruturado — nunca texto livre

> **Prompt completo:** ver `PROMPTS_AGENTES_GEMINI.md` — Seção "AGENTE 1 — SENTINELA"

### 3.3 Gemini Flash — O Analista

**Responsabilidades:**
- Analisar relatórios de Google Ads e gerar sumário em `.md`
- Gerar copy de anúncios (10+ títulos, 4+ descrições, extensões) com base no briefing
- Diagnóstico de variação de CPC, CTR ou CPA
- Relatório semanal automático (toda segunda-feira) para cada cliente ativo
- Responder perguntas do operador no chat da Home sobre clientes específicos
- Lê a memória do cliente antes de qualquer análise
- Gera blocos `---MEMORY_UPDATE---` ao final de interações relevantes

> **Prompt completo:** ver `PROMPTS_AGENTES_GEMINI.md` — Seção "AGENTE 2 — ANALISTA"

### 3.4 Gemini Pro — O Estrategista

**Responsabilidades:**
- Geração do **Morning Briefing** diário (todo dia às 6h)
- Criação da **estratégia completa de campanha** (grupos, palavras-chave, anúncios, extensões, plano 4 semanas)
- Geração completa do **Manifesto de Produção LP** (nicho, paleta, copy por seção, sequência de componentes)
- Diagnósticos complexos de performance multicausal
- Chat estratégico principal — é o agente com quem o operador conversa para questões que exigem raciocínio profundo
- Lê a memória do cliente antes de qualquer análise
- Gera blocos `---MEMORY_UPDATE---` ao final de interações relevantes

> **Prompt completo:** ver `PROMPTS_AGENTES_GEMINI.md` — Seção "AGENTE 3 — ESTRATEGISTA"

---

## PARTE 3.5 — SISTEMA DE MEMÓRIA DE CLIENTE

### Como Funciona

Cada cliente possui um arquivo `memory.md` armazenado no **Supabase Storage** em `client-memories/{client_id}/memory.md`. Este arquivo é a identidade viva do cliente no sistema.

**O arquivo de memória é:**
- Pequeno (máx ~100 linhas) e altamente curado
- Lido automaticamente por Flash e Pro antes de qualquer análise ou ação envolvendo aquele cliente
- Atualizado automaticamente pelos agentes ao final de interações relevantes
- A fonte de verdade sobre o cliente — tem precedência sobre dados genéricos

**O que a memória contém:**
1. Quem é (empresa, nicho, plano, status)
2. Contexto do negócio (3-5 linhas sobre como opera e o que diferencia)
3. Infraestrutura técnica (domínio, GTM, GA4, Ads ID)
4. Campanha atual (orçamento, estratégia, KWs principais, negativas críticas)
5. Histórico relevante (máx 10 eventos — substituir os mais antigos)
6. Perfil de relacionamento (tom, preferências, sensibilidades)
7. Performance de referência (melhor CPA, CTR médio, meta)
8. Pendências abertas
9. Notas livres da IA

**Template:** ver `MEMORIA_CLIENTE_TEMPLATE.md`

### Ciclo de Atualização

```
Operador abre cliente no sistema
        ↓
Sistema lê memory.md do Storage
        ↓
Injeta no contexto do agente chamado
        ↓
Agente executa a tarefa com contexto completo
        ↓
Agente gera blocos ---MEMORY_UPDATE--- se relevante
        ↓
Sistema intercepta os blocos e aplica ao arquivo
        ↓
Arquivo versionado (campo "Versão: N" incrementado)
```

### Quando a IA Atualiza a Memória

A IA **sempre** avalia no final da interação se algo deve ser registrado. Ela registra quando:
- Uma otimização foi aplicada e produziu resultado mensurável
- O cliente demonstrou preferência ou comportamento padrão notável
- Uma palavra-chave negativa crítica foi identificada
- O orçamento foi alterado
- Houve problema de rastreamento ou técnico relevante
- A performance atingiu um novo patamar (melhor ou pior)
- O cliente pediu algo específico que pode se repetir

A IA **não registra** eventos triviais, conversas rotineiras ou dados que já estão no banco principal.

---

## PARTE 4 — FLUXO OPERACIONAL COMPLETO DE ENTRADA DE CLIENTE

### 4.1 Mapa de Estágios Operacionais

Cada cliente tem exatamente um estágio ativo. O estágio dita **qual botão aparece na Home**.

```
PROSPECÇÃO
  └─ 01_PROSPECTADO          → Botão: "Enviar apresentação" (gera link WA com #p0)
  └─ 02_FOLLOWUP             → Botão: "Enviar follow-up" (gera link WA com #FOLLOWUP)
  └─ 03_NEGOCIANDO           → Botão: "Ir para call" / "Enviar proposta de plano"

COMERCIAL
  └─ 04_AGUARDANDO_PAGAMENTO → Botão: "Enviar link de cadastro" (gera link WA com #CADASTRO01)
  └─ 05_RECEBIDO             → 🔴 Alerta: "PAGAMENTO CONFIRMADO — Iniciar onboarding agora"

ONBOARDING LP
  └─ 06_ONBOARDING_ENVIADO   → Botão: "Enviar mensagens de boas-vindas" (sequência #01ONBOARD → #04ONBOARD)
  └─ 07_AGUARDANDO_BRIEFING  → ⏳ Pendência: aguardando briefing + assets do cliente
  └─ 08_BRIEFING_RECEBIDO    → Botão: "Iniciar setup técnico"

SETUP TÉCNICO
  └─ 09_DOMINIO_EM_VERIFICACAO → Input manual: registrar domínio escolhido
  └─ 10_DNS_CONFIGURADO        → Checklist: Vercel + Hostgator + MX records
  └─ 11_EMAIL_CONFIGURADO      → Input: registrar IDs GTM e GA4
  └─ 12_GTM_GA4_CONFIGURADO    → Botão: "Iniciar produção LP"

PRODUÇÃO LP
  └─ 13_BRIEFING_ANALISADO     → IA lê briefing e separa assets utilizáveis
  └─ 14_MANIFESTO_GERADO       → Operador aprova copy, paleta, direção de arte, sequência de componentes
  └─ 15_MANIFESTO_APROVADO     → Exportar `.md` → enviar para IA local implementar
  └─ 16_LP_EM_DESENVOLVIMENTO  → Aguardando implementação técnica
  └─ 17_BATERIA_DE_TESTES      → Checklist de QA (links, formulários, mobile, velocidade)
  └─ 18_LP_APROVADA_INTERNA    → Botão: "Enviar para aprovação do cliente" (#SITEPRONTO)
  └─ 19_AGUARDANDO_APROVACAO_CLIENTE → ⏳ Pendência

GOOGLE ADS
  └─ 20_LP_APROVADA_CLIENTE    → Botão: "Iniciar setup Google Ads"
  └─ 21_ACESSO_ADS_SOLICITADO  → Enviar #ONGOOGLE01 + #ONGOOGLE02
  └─ 22_AGUARDANDO_ACESSO_ADS  → ⏳ Pendência: aguardando cliente aceitar convite
  └─ 23_ACESSO_ADS_CONCEDIDO   → Enviar #CONVITE → aguardar aceitação
  └─ 24_CONFIGURANDO_CONVERSOES → Checklist: Tags GTM + Conversões no Ads (contato_wpp + view_content)
  └─ 25_BRIEFING_ADS_ENVIADO   → Enviar #BRIEFINGGA → aguardar preenchimento
  └─ 26_ESTRATEGIA_GERADA      → Pro gera estratégia completa → operador refina e aprova
  └─ 27_CAMPANHA_CONFIGURADA   → Campanha criada, em revisão no Google
  └─ 28_CAMPANHA_ATIVA         → 🟢 Cliente ATIVO — entra no monitoramento contínuo

MONITORAMENTO
  └─ 29_MONITORAMENTO_REGULAR  → Relatório semanal automático, alertas de saldo e performance
  └─ 30_OTIMIZACAO_PENDENTE    → Flash identifica oportunidade → operador aplica

FINANCEIRO
  └─ INADIMPLENTE_7D           → 🟠 Alerta laranja — notificação automática de suspensão iminente
  └─ INADIMPLENTE_15D          → 🔴 Alerta vermelho — notificação de quebra de contrato
  └─ CANCELADO_DEBITO          → Instruções de remoção de LP + assets
```

### 4.2 Fluxo Detalhado: Prospecção (Roteiro em 5 Partes — 100% WhatsApp)

O roteiro de prospecção é baseado em conversação natural por texto. Sem call. Sem apresentação formal. Sem script burocrático. O prospect vai sendo guiado pelas 5 partes, e só avança quando reage.

**Dados necessários antes de iniciar:**
- Nome da empresa, nicho, cidade, nota do Google Meu Negócio, número de buscas mensais do nicho na cidade

**Parte 1 — Gancho (estágio `01_PROSPECTADO`)**
- Msg 1: saudação simples
- Msg 2: se apresenta como Lucas, menciona que estava pesquisando o nicho na cidade, parabeniza pela nota e faz uma pergunta genuína sobre área de atendimento
- Objetivo: gerar resposta. Se respondeu, é sinal verde.
- Se não respondeu → encerrar (não era o prospect certo)

**Parte 2 — Conexão + Oportunidade (estágio `02_FOLLOWUP` se sumiu)**
- Revela o dado de buscas mensais no nicho/cidade
- Aponta que a empresa não aparece nessas buscas — leads vão para os concorrentes
- Objetivo: criar urgência de oportunidade, não de venda
- Se sumiu após essa parte → follow-up em ~24h: "Posso te mostrar como fica na prática resolver isso?"
- Não respondeu ao follow-up → encerrar

**Parte 3 — Solução Visual**
- Explica como funciona o bloco de anúncios do Google (clique → WhatsApp direto)
- Envia imagem personalizada com nome, logo e cores da empresa mostrando o fluxo
- Fecha com: "Dá uma olhada e me diz se faz sentido pra você aparecer pra essas oportunidades."
- Se sumiu → follow-up em ~24h: "Oi boa tarde! Só passando pra saber se você chegou a ver o exemplo que mandei."
- Não respondeu ao follow-up → encerrar

**Parte 4 — Abrindo Caminho para o Investimento**
- Reforça a escolha do prospect (nota, reputação, cidade)
- Pede permissão para apresentar o investimento antes de falar os valores
- Só avança quando o prospect confirmar interesse

**Parte 5 — Investimento + Fechamento (estágio `03_NEGOCIANDO`)**
- Apresenta os dois custos **separados**:
  1. Google (pré-pago, recomendado R$20/dia = ~R$600/mês, 100% vai pro Google)
  2. Agência: R$267/mês, sem fidelidade
- Fecha com: "Me fala o que acha, e se topar eu já te conto como a gente começa."
- Se fechou → `04_AGUARDANDO_PAGAMENTO`
- Se objeção → sistema exibe card de objeções para o operador consultar

**Objeções cadastradas no sistema (com contra-argumentos):**

| Objeção | Contra-argumento |
|---|---|
| "Já tenho Instagram" | Google captura intenção de compra — pessoa já decidiu contratar. São canais complementares. |
| "Tô sem verba agora" | Separar os custos: pode começar com R$10/dia. A ideia é que o canal se pague com os primeiros fechamentos. |
| "Deixa eu pensar" | Perguntar o que precisaria avaliar → descobrir a objeção real |
| "R$600 pro Google é muito" | Vai 100% pro Google, não passa pela agência. Controle total, pode pausar quando quiser. |
| "Já tentei e não funcionou" | Perguntar qual foi a experiência. Quase sempre é problema de configuração, não do Google. |

### 4.3 Fluxo Detalhado: Onboarding LP

**Estágio entrada:** `05_RECEBIDO`  
**Estágio saída:** `12_GTM_GA4_CONFIGURADO`

**Passo 1 — Boas-vindas (estágio `06_ONBOARDING_ENVIADO`)**
- Home exibe botão "Enviar Onboarding"
- Sistema gera sequência de 4 links de WhatsApp pré-preenchidos com `#01ONBOARD` a `#04ONBOARD`
- Operador clica e envia cada um em sequência
- Sistema avança para `07_AGUARDANDO_BRIEFING`
- Timer de 48h inicia — se não houver resposta, Lite notifica operador

**Passo 2 — Recebimento de Briefing e Assets (estágio `08_BRIEFING_RECEBIDO`)**
- Operador confirma recebimento no sistema
- Gemini Flash lê o formulário de briefing (URL salva no perfil) e:
  - Identifica: nicho, público-alvo, tom de voz, diferenciais, CTA principal
  - Verifica assets enviados no Drive: logo ✓/✗, paleta ✓/✗, fotos ✓/✗, depoimentos ✓/✗
  - Gera sumário com o que está disponível e o que precisa ser substituído por stock

**Passo 3 — Setup Técnico (estágios `09` a `12`)**

Input manual com checklist visual — baseado nas fases do onboard:

```
FASE 2 — INFRAESTRUTURA TÉCNICA
[ ] Domínio adquirido / apontamento DNS configurado → Hostgator
[ ] WordPress instalado na hospedagem Hostgator
[ ] Tema Astra instalado + tema filho criado
[ ] Tailwind CSS configurado no tema filho (CDN play ou build)
[ ] SSL ativo (HTTPS funcionando)
[ ] GTM instalado → ID: GTM-________
[ ] Tag do Google Ads configurada no GTM
[ ] GA4 configurado (opcional mas recomendado) → ID: G-________
```

### 4.4 Fluxo Detalhado: Produção da Landing Page

**Estágio entrada:** `13_BRIEFING_ANALISADO`  
**Estágio saída:** `19_AGUARDANDO_APROVACAO_CLIENTE`

**Passo 1 — Geração do Manifesto (Gemini Pro)**

O operador clica em "Gerar Manifesto". O Pro recebe como contexto:
- Briefing completo do cliente
- Assets disponíveis (lista do Drive)
- Nicho e público-alvo
- Biblioteca de componentes disponíveis (Astro)

O Pro gera:

```markdown
# MANIFESTO DE PRODUÇÃO — [NOME CLIENTE]

## Contexto Estratégico
- Nicho: [nicho]
- Público: [ICP detalhado]
- Tom de Voz: [ex: autoridade acolhedora, direto e técnico]
- Paleta de Cores: { primary: #hex, secondary: #hex, accent: #hex, bg: #hex, text: #hex }
- Tipografia: [ex: DM Serif Display / DM Sans]
- Direção de Arte: [ex: fotografia real + espaço negativo generoso + badge de prova social]

## Estrutura da Página
1. Hero_02 — Gancho: "[texto exato do título]" | CTA: "[texto do botão]"
2. Beneficios_01 — 3 cards: [benefício 1], [benefício 2], [benefício 3]
3. Processo_01 — 3 passos: [passo 1], [passo 2], [passo 3]
4. Depoimentos_02 — Depoimentos: [depoimento 1], [depoimento 2]
5. CTA_Final_01 — Gancho: "[texto]" | CTA: "[texto]"
6. Footer_01

## Copy por Seção
### Hero
- Título: [título]
- Subtítulo: [subtítulo]
- CTA Principal: [texto do botão]
- CTA Secundário: [texto ou omitir]

### [cada seção com copy completo]

## Instruções para IA Local (Cursor/Roo Code)
- NUNCA usar px. Toda medida em rem.
- Usar componentes Astro da pasta /src/components/[categoria]
- Paleta via CSS variables no :root
- Mobile-first obrigatório
- Formulário de contato: submit via WhatsApp API (link tel)
```

**Passo 2 — Aprovação pelo Operador**

Interface de aprovação com 3 abas:
1. **Copy** — exibe textos editáveis por seção. Operador edita direto no sistema.
2. **Paleta + Arte** — preview visual da paleta, tipografia e direção de arte
3. **Estrutura** — ordem dos componentes com drag-and-drop para reordenar

Botão "Aprovar e Exportar Manifesto" → gera arquivo `.md` para download e registra no Supabase.

**Passo 3 — Desenvolvimento**

Operador envia o `.md` para a IA local (Cursor/Roo Code). Sistema avança para `16_LP_EM_DESENVOLVIMENTO`.

**Passo 4 — Bateria de Testes (estágio `17_BATERIA_DE_TESTES`)**

Checklist baseado no onboard real da agência:

```
FASE 3 — LANDING PAGE (QA)
[ ] Estrutura completa: hero, diferenciais, fotos, depoimentos, CTA, rodapé
[ ] Hero: headline com palavra-chave do nicho + cidade
[ ] Botão WhatsApp flutuante implementado (fixo em todas as telas)
[ ] Versão mobile revisada e aprovada
[ ] PageSpeed Insights > 70 no mobile
[ ] Página revisada e aprovada pelo cliente

FASE 4 — GOOGLE ADS
[ ] Conta Google Ads criada ou acesso de gerente via MCC concedido
[ ] Faturamento configurado (cartão do cliente cadastrado)
[ ] Conversão de clique no WhatsApp configurada via GTM (contato_wpp)
[ ] Conversão view_content configurada (se aplicável)
[ ] Teste de conversão realizado e confirmado no painel
```

**Passo 5 — Envio ao Cliente**

Ao completar o checklist → botão "Enviar para cliente" → gera link WA com mensagem `#SITEPRONTO` preenchida com as URLs. Estágio vai para `19_AGUARDANDO_APROVACAO_CLIENTE`.

### 4.5 Fluxo Detalhado: Setup Google Ads + Conversões

**Estágio entrada:** `20_LP_APROVADA_CLIENTE`  
**Estágio saída:** `28_CAMPANHA_ATIVA`

**Passo 1 — Solicitação de Acesso (estágios `21` a `23`)**
- Botão gera WA com `#ONGOOGLE01` + `#ONGOOGLE02`
- Operador registra o ID da conta Ads no perfil do cliente
- Sistema envia convite via Google Ads API (ou instrução manual)
- Ao confirmar acesso → `23_ACESSO_ADS_CONCEDIDO`

**Passo 2 — Configuração de Conversões (estágio `24_CONFIGURANDO_CONVERSOES`)**

Checklist no perfil do cliente:

```
[ ] Tag de conversão criada no GTM: contato_wpp
     └─ Trigger: clique no botão de WhatsApp (classe ou ID específico)
     └─ Tag: Google Ads Conversion — ID: [ID da conta]
[ ] Tag de conversão criada no GTM: view_content
     └─ Trigger: Page View (todas as páginas) ou scroll 50%
     └─ Tag: Google Ads Conversion — ID: [ID da conta]
[ ] Conversões importadas no Google Ads (via GA4 Link ou tag direta)
[ ] Janela de conversão: 30 dias para contato_wpp, 7 dias para view_content
[ ] Modelo de atribuição: Baseado em dados (data-driven)
[ ] Conversão principal definida: contato_wpp
[ ] Teste de conversão confirmado (Google Tag Assistant)
[ ] GA4: eventos configurados e validados no DebugView
```

**Passo 3 — Briefing de Google Ads (estágio `25_BRIEFING_ADS_ENVIADO`)**
- Botão gera WA com `#BRIEFINGGA`
- Link do formulário preenchido automaticamente
- Timer de 48h para resposta

**Passo 4 — Geração de Estratégia (estágio `26_ESTRATEGIA_GERADA` — Gemini Pro)**

O Pro recebe:
- Briefing de Google Ads (respostas do formulário)
- Nicho, localização geográfica, orçamento mensal, plano contratado
- Dados do GMB (se disponíveis)
- Histórico de conversões (se conta não é nova)

O Pro gera o **Documento de Estratégia de Campanha**:

```markdown
# ESTRATÉGIA DE CAMPANHA — [NOME CLIENTE]

## Estrutura da Conta
- Campanha: [nome] | Tipo: Pesquisa | Orçamento diário: R$ [valor]
- Lance: Maximizar conversões (início) → Meta CPA de R$[valor] após 30 conversões

## Grupos de Anúncios
### Grupo 1: [Serviço Principal]
- Palavras-chave (exata + frase): [lista]
- Palavras-chave negativas: [lista]

### Grupo 2: [Intenção Concorrente]
- ...

## Anúncios Responsivos (3 variações por grupo)
### Títulos (máximo 30 char):
1. [título 1]
2. [título 2]
... (mínimo 8 títulos)

### Descrições (máximo 90 char):
1. [descrição 1]
2. [descrição 2]
... (mínimo 4 descrições)

### Extensões
- Sitelinks: [lista]
- Frases de destaque: [lista]
- Snippets estruturados: [lista]

## Palavras-Chave Negativas Globais
[lista de negativas para evitar cliques irrelevantes]

## Plano de Otimização (Semana 1-4)
- Semana 1: Observação. Não alterar lances.
- Semana 2: Pausar termos de busca irrelevantes. Adicionar negativas.
- Semana 3: Avaliar performance por grupo. Redistribuir orçamento.
- Semana 4: Ajustar lance ou migrar para Meta CPA se > 10 conversões.
```

O operador refina e aprova via interface de aprovação (igual ao manifesto LP).

**Estratégia de lances:** Maximizar cliques (início) → Meta CPA após 30 conversões  
**Segmentação:** cidade + raio ou bairros específicos  
**Extensões obrigatórias:** chamada, local, sitelinks com página  
**Negativação inicial:** empregos, cursos, DIY, concorrentes  
**Relatório D+7:** primeiro relatório enviado ao cliente  
**Semana 2:** ajuste de lances e negativações  
**D+30:** reunião de alinhamento mensal agendada

---

## PARTE 5 — MÓDULO FINANCEIRO (ERP PROPRIETÁRIO)

### 5.1 Dashboard Financeiro

- **MRR em tempo real**: soma de todas as `subscriptions` com status `ativo`
- **DRE Simplificado:**
  ```
  (+) Receita do mês (MRR + avulsos)
  (-) Custos Fixos (servidor, ferramentas, softwares)
  (-) Custos Variáveis (freelancers, ads próprios, etc.)
  (=) Lucro Líquido
  ```
- **Projeção do próximo mês** (Gemini Flash): com base na tendência dos últimos 3 meses
- **Gráfico de evolução do MRR**: sparkline dos últimos 12 meses

### 5.2 Régua de Cobrança Automática (Gemini Lite + Edge Functions)

| Dias de Atraso | Ação Automática | Marcador Visual |
|---|---|---|
| 7 dias | Notificação de suspensão iminente via WA | 🟠 Laranja |
| 15 dias | Notificação de quebra de contrato via WA | 🔴 Vermelho |
| 30 dias | Status → `cancelado_debito` + instruções de remoção de LP | ⚫ Cinza escuro |

**Mensagens geradas automaticamente pelo sistema** (baseadas nos templates do arquivo MENSAGENS):
- Adaptadas ao tom da agência
- Link de pagamento Asaas incluído automaticamente
- Log imutável registrado no `action_log`

### 5.3 Inputs de Custo

Interface para registrar:
- **Custos fixos**: nome, valor mensal, categoria, data de início
- **Custos variáveis**: nome, valor, mês de referência, cliente associado (opcional)
- **Exportar DRE** em `.md` ou `.csv`

---

## PARTE 6 — MÓDULO DE MONITORAMENTO DE CAMPANHAS

### 6.1 Visão por Cliente

Cada cliente com campanha ativa tem uma tela de detalhamento com:

- **Métricas Principais** (período selecionável: 7d / 30d / mês atual):
  - Investimento total
  - Cliques
  - Impressões
  - CTR
  - Conversões (exibidas com decimais — `0.5` é válido e esperado)
  - CPA
  - ROAS (se e-commerce)

- **Qualidade do anúncio** (Quality Score médio)
- **Termos de busca recentes** (top 10 por custo)
- **Palavras negativas adicionadas** (histórico)

### 6.2 Alertas Proativos (Gemini Lite — loop 15min)

| Condição | Alerta |
|---|---|
| Saldo da conta Ads < 20% do orçamento diário × 3 | Card de alerta + botão `#SALDOGOOGLE` |
| CTR caiu > 30% vs. semana anterior | Notificação Flash para análise |
| CPA subiu > 40% vs. meta definida | Notificação Flash + alerta no perfil |
| Campanha pausada inesperadamente | Alerta crítico imediato |
| 0 conversões em 72h (com investimento) | Alerta de diagnóstico — chamar Pro |

### 6.3 Relatório Semanal Automático (Gemini Flash)

Todo domingo às 20h, o Flash gera automaticamente para cada cliente ativo:

```markdown
# Relatório Semanal — [NOME CLIENTE] — [DATA]

## Resumo Executivo
[3 frases sobre a semana]

## Métricas
| Métrica | Esta Semana | Semana Anterior | Variação |
|---|---|---|---|
| Investimento | R$ | R$ | % |
| Cliques | | | |
| CTR | | | |
| Conversões | | | |
| CPA | R$ | R$ | % |

## Destaques
- [insight 1]
- [insight 2]

## Recomendações
- [ação 1 para próxima semana]
- [ação 2]
```

Relatório salvo no Supabase Storage e disponível no perfil do cliente.

---

## PARTE 7 — BIBLIOTECA DE COMPONENTES E MANIFESTO

### 7.1 Estrutura da Biblioteca

Componentes Astro organizados por categoria:
- **Navegação**: Nav_01, Nav_02, Nav_Sticky_01
- **Hero**: Hero_01 (full bg), Hero_02 (split layout), Hero_03 (minimalista)
- **Benefícios**: Beneficios_01 (3 cards), Beneficios_02 (lista), Beneficios_03 (ícones grandes)
- **Processo**: Processo_01 (3 passos horizontal), Processo_02 (timeline vertical)
- **Depoimentos**: Depoimentos_01 (cards), Depoimentos_02 (carrossel), Depoimentos_03 (foto + quote)
- **CTA**: CTA_01 (simples), CTA_02 (com background), CTA_Final_01
- **FAQ**: FAQ_01 (accordion)
- **Rodapé**: Footer_01 (completo), Footer_02 (minimalista)

### 7.2 Regras de Visualização da Biblioteca

- **Máximo 3 componentes por tela** — visualização ampla com preview real
- Layout de preview com `iframe` ou render isolado
- Seleção visual com checkbox sobre o componente
- Drag-and-drop para ordenar a sequência
- Paleta de cores aplicada ao preview em tempo real
- Exportação do `.md` com sequência + copy + direção de arte

---

## PARTE 8 — WEBHOOKS E INTEGRAÇÕES

### 8.1 Webhook Asaas → Supabase Edge Function

**Endpoint:** `POST /functions/v1/asaas-webhook`

```typescript
// Eventos tratados:
// payment.received → criar/ativar cliente
// payment.overdue → incrementar overdue_days
// subscription.cancelled → status cancelado

export async function handler(req: Request) {
  const payload = await req.json()
  
  if (payload.event === 'PAYMENT_RECEIVED') {
    await supabase
      .from('clients')
      .update({ 
        operational_stage: '05_RECEBIDO',
        status: 'ativo'
      })
      .eq('asaas_customer_id', payload.payment.customer)
    
    // Disparar alerta no dashboard via Supabase Realtime
    await supabase
      .channel('alerts')
      .send({ type: 'NEW_CLIENT', clientId: '...' })
  }
  
  if (payload.event === 'PAYMENT_OVERDUE') {
    // Calcular dias de atraso e acionar régua
  }
}
```

### 8.2 Supabase Realtime

Tabelas com Realtime habilitado:
- `clients` (mudanças de estágio aparecem imediatamente na Home)
- `subscriptions` (atualizações de status financeiro)
- `pending_items` (alertas de 48h)
- `ads_reports` (novos relatórios aparecem no dashboard)

---

## PARTE 9 — CONFIGURAÇÕES E PERFIL DO OPERADOR

### 9.1 Configurações Globais

- **Tema:** Dark / Light / System
- **Localização:** cidade para o card de clima
- **Limites de Alerta:**
  - Saldo mínimo Ads (% do orçamento diário)
  - Prazo de resposta de cliente antes de notificar (padrão: 48h)
- **Chaves de API:**
  - Google Ads API
  - GTM API
  - Gemini API Key
  - Asaas API Key (modo produção/sandbox)
- **Modelos Padrão de Mensagem** (editar templates #BOASVINDAS etc.)

### 9.2 Tabela de Mensagens (Templates)

Todos os templates do arquivo `MENSAGENS_ATENDIMENTO.md` são armazenados no Supabase na tabela `message_templates`:

```sql
id uuid PRIMARY KEY
tag text UNIQUE -- ex: p0, FOLLOWUP, 01ONBOARD
label text -- descrição legível
content text -- corpo da mensagem com variáveis {NOME}, {EMPRESA}
category text -- prospecção | onboarding | google_ads | financeiro | lp
```

A interface permite editar os templates diretamente no sistema. Ao clicar em qualquer botão de ação que gera mensagem, o sistema:
1. Busca o template pelo `tag`
2. Substitui variáveis `{NOME}`, `{EMPRESA}`, `{LINK}` com dados do cliente
3. Encode a mensagem para URL
4. Abre `https://wa.me/{telefone}?text={mensagem}` em nova aba

---

## PARTE 10 — FLUXO DE DADOS DA IA E CONTEXTO INJETADO

### 10.1 Contexto Global da IA

Em toda chamada a qualquer modelo Gemini, o seguinte contexto é injetado:

```json
{
  "agency": {
    "name": "Adsgator",
    "operator": "Lucas",
    "currentDate": "ISO Date",
    "mrr": 0000,
    "activeClients": 0,
    "pendingItems": 0
  },
  "clients": [
    {
      "id": "uuid",
      "name": "...",
      "niche": "...",
      "stage": "...",
      "plan": "...",
      "overdueDays": 0,
      "lastAction": "...",
      "campaignHealth": "ok | warning | critical"
    }
  ]
}
```

### 10.2 Prompt de Sistema Global

```
Você é o copiloto da Adsgator, uma agência digital especializada em Google Ads e Landing Pages.
Seu operador é Lucas. 
Nunca use linguagem burocrática. Seja direto, cirúrgico e acionável.
Conversões fracionadas (0.5, 1.5) são comportamento CORRETO do modelo de atribuição — nunca as sinalize como erro.
Unidade de medida em código: sempre rem. Nunca px.
O fluxo de vendas é 100% por texto no WhatsApp em 5 partes (Gancho → Conexão → Solução Visual → Investimento → Fechamento). Nunca sugira call de fechamento. Nunca gere scripts longos.
Quando não souber algo, diga explicitamente em vez de inventar.
```

---

## APÊNDICE A — MENSAGENS DE ATENDIMENTO (REFERÊNCIA RÁPIDA)

| Tag | Uso | Estágio |
|---|---|---|
| `#PDIA` / `#PTARDE` | Início de prospecção | 01_PROSPECTADO |
| `#p0` | Apresentação do serviço LP Pro | 01_PROSPECTADO |
| `#FOLLOWUP` | Follow-up de prospecção | 02_FOLLOWUP |
| `#adsstart` / `#adsboost` / `#adspower` | Apresentação de planos Ads | 03_NEGOCIANDO |
| `#FUNCIONASIM01` a `#03` | Como funciona LP Pro | 03_NEGOCIANDO |
| `#CADASTRO01` / `#02` | Envio de link de pagamento | 04_AGUARDANDO_PAGAMENTO |
| `#01ONBOARD` a `#04ONBOARD` | Onboarding completo LP | 06_ONBOARDING_ENVIADO |
| `#ONGOOGLE01` / `#02` | Solicitação de acesso Ads + GMB | 21_ACESSO_ADS_SOLICITADO |
| `#CONVITE` | Guia de aceite do convite Ads | 23_ACESSO_ADS_CONCEDIDO |
| `#BRIEFINGGA` | Link do briefing Google Ads | 25_BRIEFING_ADS_ENVIADO |
| `#SALDOGOOGLE` | Alerta de saldo baixo | Monitoramento |
| `#SITEPRONTO` | Envio do site finalizado | 18_LP_APROVADA_INTERNA |
| `#BLZ` | Encerramento sem venda | Qualquer |

---

## APÊNDICE B — CHECKLIST DE SETUP COMPLETO POR CLIENTE

```
COMERCIAL
[ ] Prospect registrado no sistema
[ ] Plano definido
[ ] Pagamento confirmado (webhook Asaas)

ONBOARDING
[ ] Sequência de boas-vindas enviada
[ ] Briefing recebido e validado
[ ] Assets recebidos no Drive

TÉCNICO
[ ] Domínio registrado: ________________
[ ] DNS configurado para Vercel
[ ] Vercel: projeto criado + domínio adicionado
[ ] Hostgator: email configurado
[ ] MX + SPF + DKIM configurados
[ ] SSL ativo
[ ] GTM: container criado (ID: _________)
[ ] GA4: property criada (ID: _________)
[ ] Google Ads: conta criada (ID: _________)
[ ] GMB: acesso concedido

PRODUÇÃO LP
[ ] Manifesto gerado
[ ] Manifesto aprovado pelo operador
[ ] LP desenvolvida (Cursor/Roo Code)
[ ] Bateria de testes completa
[ ] LP aprovada pelo cliente

GOOGLE ADS
[ ] Conversão contato_wpp configurada no GTM + Ads
[ ] Conversão view_content configurada no GTM + Ads
[ ] Conversões testadas e validadas
[ ] Briefing de Ads preenchido pelo cliente
[ ] Estratégia gerada e aprovada
[ ] Campanha criada e ativa

MONITORAMENTO
[ ] Relatório semanal automático ativo
[ ] Alertas de saldo configurados
[ ] Meta de CPA definida: R$ ________
```

---

*Este documento é o contexto-mestre do Adsgator OS. Qualquer IA que receba este arquivo deve tratá-lo como a fonte de verdade operacional da agência e nunca contradizê-lo ou sugerir processos diferentes dos aqui descritos.*
