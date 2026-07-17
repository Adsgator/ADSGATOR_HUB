# Dashboards Looker Studio atuais (referência para o Analytics 2.0)

> Inventário dos 3 dashboards que o Lucas usa hoje para analisar clientes
> (PDFs de exemplo recebidos em 17/07/2026; originais no Desktop do Lucas:
> EXEMPLO_SITE-dash.pdf, EXEMPLO_GADS-Dash.pdf, EXEMPLO-Dados_Cliente.pdf).
> Este é o "contrato" do que o módulo Analytics do Hub precisa cobrir para
> aposentar o Looker. Não commitamos os PDFs (contêm dados pessoais de cliente).

## 1. Dashboard SITE (GA4) — 1 por cliente/domínio

Período selecionável (exemplo era trimestral) com comparativo vs período anterior
em TODOS os KPIs (% verde/vermelho).

**KPIs (Informações gerais + Desempenho):**
- Visualizações, Novos usuários, Sessões, Duração média da sessão
- Eventos por sessão, "Rolaram a tela até o fim" (scroll depth)
- Taxa de engajamento, Taxa de rejeição

**Seções:**
| Seção | Conteúdo |
| --- | --- |
| Por dispositivo | barras Mobile/Desktop/Outro × (visualizações, novos usuários, sessões) |
| De onde vem o tráfego | tabela + pizza origem/mídia da sessão (google/cpc, organic, direct, ig/social, referral…) |
| Eventos disparados | page_view, click, scroll, first_visit, session_start, user_engagement |
| Acompanhamento de acessos | série por HORA do dia (00–23) |
| Acompanhamento de duração média | série por hora |
| Acompanhamento de engajamento | engajamento vs rejeição por hora |
| Quais páginas são acessadas | caminho da página × métricas; segunda tabela com query string (fbclid polui — normalizar no Hub) |
| Cidade, Estado e País | ⚠️ no Looker aparece "Erro de cota" (GA4 API) — motivo forte p/ cache no Hub |
| Origem, Nome do evento e Tipo de usuário | novo × recorrente |
| Informações técnicas | SO + versão, resolução de tela |

## 2. Dashboard GOOGLE ADS — 1 por cliente

Período mensal com delta vs mês anterior; filtros de Campanha e Grupo de anúncios.

**KPIs (interações):** Impressões, Cliques, CPC médio, Conversões, Custo,
Custo/conv., Visitas no site.
**KPIs (%):** CTR, Taxa de conversão, Cliques p/ conversão, Impressões 1ª posição
(top impression share).

**Seções:**
| Seção | Conteúdo |
| --- | --- |
| Gráfico de acompanhamento | série DIÁRIA: impressões/cliques/CPC/conversões + CTR/taxa conv./custo |
| Termos de pesquisa | Top 50 + tabela completa (impr., cliques, CPC, CTR, conv., custo/conv., custo, visitas) com busca |
| Resultados pelo horário | tabela horário × impressões/cliques |
| Métricas de Cidade e Estado | cidade e região × métricas completas |
| Dados demográficos | idade e gênero × (impressões, cliques, conversões, custo) — tabelas + barras |
| Dias da semana / Horário / Dispositivos | tabelas + pizzas por dispositivo (impr., cliques, visitas, conversões) |

Observações: conversões fracionadas (atribuição data-driven, ex. 11,6);
"Visitas no site" é métrica do Ads (cliques que chegaram), não sessões GA4.

## 3. Dashboard DADOS DO CLIENTE

Cadastro (nome, contato, empresa, endereço), mensalidade + vencimentos,
assinaturas (planos) e histórico de pagamentos — **já 100% coberto pelo detalhe
do cliente no Hub**. Única ideia a absorver: **gauge "Limite mensal"** (gasto de
mídia do mês vs teto definido do cliente).

## Dores do setup Looker que o Hub resolve

1. Erro de cota GA4 (Looker consulta a API a cada visualização) → Hub cacheia.
2. Dados não são tempo real e não geram alerta → Hub tem sync + alertas + Gator.
3. Caminhos de página poluídos por fbclid/gclid → normalizar agregação.
4. Cadastro duplicado (Looker × Hub) → morre com o dash 3.
5. Um dashboard POR cliente para manter → no Hub é um seletor.
