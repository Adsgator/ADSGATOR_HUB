# Spec — Dashboard Google Ads (substituto do Looker)

> Status: em construção — este documento é a fonte única de verdade das decisões
> tomadas com o Lucas sobre o dashboard de Google Ads. Atualizar aqui SEMPRE que
> uma decisão nova for tomada na conversa, antes de esquecer.
> Ordem de trabalho: fechar Google Ads 100% e aprovado → só depois ir para o
> dashboard de Site (GA4), seguindo os mesmos princípios de estrutura (não o
> mesmo layout 1:1).
> Método: replicar 1:1 o que existe no Looker primeiro, refinar depois — exceto
> onde o Looker está estruturalmente errado (eixo duplo), que já corrige na largada.

## Por que existe

O Lucas usa o Looker Studio hoje pra analisar campanha e otimizar clientes, mas
sente falta de estabilidade (erro de cota, etc.) e quer um sistema próprio,
mais completo, que ele realmente usa no dia a dia — depois disso, o mesmo
dashboard (versão didática) vai pro portal do cliente.

**Regra de ouro do usuário**: cada dashboard (Ads, Site) tem que deixar bater o
olho e já saber como está o desempenho — comparado com ontem, com a semana
passada, com o mês passado. Ads e Site ficam SEPARADOS (perguntas diferentes,
não misturar num resumo único). Dentro de CADA um, tudo que hoje está espalhado
em vários lugares do Google Ads/GA4 nativo (campanha aqui, termos ali, geo
noutro lugar) fica consolidado numa página só, sem precisar abrir várias abas.

## Origem: 6 prints do Looker (`C:\Users\lucas\Desktop\MEUS DASH LOOKER\GADS`)

### GADS-1 — Visão Geral (topo)
- Filtros: Campanha, Grupo de anúncios, Período (ex.: "6 de jul – 19 de jul de
  2026"), botão "Limpar filtros".
- Painel **"Google Ads interações"** (6 tiles, 2 colunas x 3 linhas): Impressões,
  Cliques, CPC médio, Conversões, Custo/conv., Custo.
- Painel **"Desempenho"** (ao lado): Visitas no site, Impressões 1ª posição — e
  abaixo um gráfico de barras horizontais **por dispositivo** com 3 métricas
  (Cliques, Visitas no site, Conversões) lado a lado por dispositivo.
- Painel **"Google Ads %"** (abaixo do primeiro): Clique p/ Conversão, Taxa
  conv., CTR.
- Todo tile tem delta "X% de N dias anteriores" — N = tamanho do período
  selecionado (comparativo = período imediatamente anterior de mesmo tamanho).
  Isso já bate com `periodoAnterior()` que já existe em `lib/analytics-periodo.ts`.

### GADS-2 — Gráfico de acompanhamento + tabelas compactas
- **Gráfico de acompanhamento**: 2 gráficos empilhados no Looker, cada um com
  MÚLTIPLAS métricas em eixo duplo (ex.: Impressões numa escala, Cliques/CPC
  médio/Conversões noutra). ⚠️ **DECISÃO**: manter o mesmo AGRUPAMENTO de
  métricas (quais aparecem juntas), mas cada gráfico com eixo único — eixo duplo
  cria correlação visual que não existe nos dados (confirmado com o Lucas, não é
  questão de gosto). Agrupamento a replicar:
  - Gráfico A: Impressões, Cliques, CPC médio, Conversões
  - Gráfico B: CTR, Taxa de conversão, Custo
- **Top 50 Pesquisas** (tabela compacta ao lado): Termo de pesquisa, Impressões,
  Cliques — heatmap de cor por coluna.
- **Resultados pelo horário** (tabela compacta): Horário do dia, Impressões,
  Cliques.

### GADS-3 — Tabela completa de termos de pesquisa
"Principais termos e palavras nas pesquisas que mostraram seus anúncios" —
tabela completa com busca: Termo, Impressões, Cliques, CPC médio, CTR,
Conversões, Custo/conv., Custo, **Visitas site**. Heatmap por coluna, linha
"Total geral", paginação. É a versão aprofundada da tabela compacta da GADS-2.

### GADS-4 — Cidade e Estado
DUAS tabelas separadas (não misturar granularidade):
- **Cidade**: Cidade, Impressões, Cliques, CPC médio, CTR, Conversões, Custo,
  Custo/conv., Visitas site.
- **Região/Estado**: mesmas colunas, no nível de estado.

⚠️ **DECISÃO (drill-down)**: o Looker só mostra nível de Cidade porque era o que
dava pra fazer nele. O ideal, que o Lucas quer agora: mostrar a Cidade como
linha principal e, ao clicar, expandir/mostrar o detalhe mais fino que existe
por baixo dela (bairro, CEP — que é o que a `geo_target_most_specific_location`
já resolve hoje). Adicionar também tabela de **País** (hoje não existe no
Looker — serve pra flagar clique estrangeiro/anômalo que mereça investigação).

### GADS-5 — Dados demográficos
Idade e Gênero, cada um com:
- 1 tabela (métricas completas: Impressões, Cliques, Conversões, Custo).
- **4 gráficos de barra SEPARADOS**, um por métrica (Impressões, Cliques,
  Conversões, Custo) — não um gráfico com várias métricas juntas (já é single-
  metric, não precisa correção de eixo aqui).

### GADS-6 — Dias da semana, Horário, Dispositivos
- Tabela Dia da semana (Dia, Impressões, Cliques, Conversões, Custo).
- Tabela Horário do dia (mesmas colunas — conversões fracionadas, ex. "0.5", é
  esperado — atribuição data-driven).
- Tabela Dispositivo (Dispositivo, Impressões, Cliques, CPC médio, CTR,
  Conversões, Custo, Custo/conv., Visitas site).
- 4 donuts de participação por dispositivo (um por métrica: Impressões,
  Cliques, Visitas no site, Conversões).

## "Visitas no site" — mecanismo real (não é alias de Cliques)

O Lucas configura em TODO cliente (padrão fixo, sempre os mesmos nomes) duas
ações de conversão no Google Ads:
- **`contato_wpp`** — primária, conta pra métrica `conversions`. É o lead real
  (clique no botão do WhatsApp).
- **`view_content`** — secundária (não conta em `conversions`, só em
  `all_conversions`). Marca que a pessoa realmente chegou no site — cross-check
  contra clique inválido/perdido.

No Looker ele não conseguia puxar a ação específica, então calculava
`Visitas no site = Todas as conversões − Conversões` (subtração pra isolar a
secundária). **Descoberta**: dá pra pegar direto, sem subtração — confirmado
com dado real na conta do Ricardo (8335983333, jun–jul/2026):
```
contato_wpp:  conversions=36  all_conversions=36   (primária, bate nos dois)
view_content: conversions=0   all_conversions=208  (secundária, só aparece em all_conversions)
```
Query: GAQL `metrics.all_conversions` segmentado por
`segments.conversion_action_name`, filtrando (case-insensitive, em JS — GAQL
não tem LOWER()) por `view_content` (visitas) e `contato_wpp` (principal).
Nomes variantes achados em contas antigas (`contato_wpp_fibra`,
`contato-wpp-internet-1001`, `contato_natu`, `contato_wpp_nio`) são
**legado** — prática antiga de criar ação por LP específica que o Lucas não
usa mais (hoje reaproveita a mesma ação `contato_wpp` pra LPs diferentes,
porque a campanha já atribui certo sozinha). Não vale suportar esses nomes —
hardcode `contato_wpp`/`view_content` como convenção fixa da agência.

⚠️ **Limitação técnica**: `all_conversions` por ação **não existe no BigQuery
Data Transfer** (as views `*ConversionStats` só trazem `conversions`, a
primária). "Visitas no site" é GAQL-only (API ao vivo), sempre — mesmo com
conta carregada no BQ. Isso é esperado, não é bug; só significa que essa
métrica específica não usa o caminho rápido do histórico.

## Grupo de anúncios (filtro)

Viável — existe `ads_AdGroupBasicStats_<MCC>` no BigQuery com o mesmo shape de
`CampaignBasicStats` (clicks/conversions/cost/impressions por
dia/dispositivo), mais `ads_AdGroup_<MCC>` pra nome. `FiltroAds.grupoAnuncioId`
tem prioridade sobre `campanhaId` quando presente (grupo já pertence a uma
campanha só). Impression share NÃO existe no nível de grupo de anúncios (é
métrica de leilão, só campanha/conta) — quando o filtro é por grupo, os 3
campos de `ImpressionShareAds` voltam `null` em vez de tentar uma query que
falharia.

## Status — 1ª rodada montada (réplica 1:1), aguardando revisão do Lucas

### Feito e validado com dado real
- [x] `visitasSiteAds` em `lib/ads-detalhes.ts` (GAQL-only, `contato_wpp`/
      `view_content` case-insensitive, hardcoded), somado em `KpisAds`.
- [x] Filtro de Grupo de Anúncios em TODAS as funções de `ads-detalhes.ts`
      (série, KPIs, dias/horário, dispositivos, termos/demografia/geografia
      "de graça" via `ad_group_id` já presente nas views; impression share
      retorna null nesse nível). `gruposAnuncioDoPeriodoAds` pro seletor da UI.
      Migration `20260720_analytics_detalhes_grupo_anuncio.sql` (cache por
      grupo) — PENDENTE Lucas rodar no SQL Editor; sem ela funciona igual, só
      sem cache pros cortes filtrados por grupo (confirmado: degrada com aviso
      no log, não quebra).
- [x] Gráficos de eixo duplo corrigidos: série diária virou small multiples
      (Impressões/Cliques/CPC médio/Conversões cada um seu gráfico; CTR+Taxa
      conv. dividem 1 eixo % porque são a mesma unidade; Custo separado).
- [x] Painel de KPIs em 3 grupos (Interações, Desempenho + gráfico por
      dispositivo, %) — "Clique p/ Conversão" (ambíguo no print) virou
      "Cliques por conversão" (cliques ÷ conversões, métrica bem definida).
- [x] Termos: tabela completa com CPC médio, busca, linha "Total geral" +
      prévia compacta (Top pesquisas, 2 colunas) reaproveitando o mesmo fetch.
- [x] Geografia: 3 tabelas (Cidade/Estado/País) com todas as métricas +
      "Total geral" + prévia compacta de horário.
- [x] Demografia: tabela completa + 4 gráficos de barra por métrica (Idade,
      Gênero) — small multiples, já era single-metric no Looker.
- [x] Dia da semana / Horário: viraram TABELAS (não gráfico — o Looker usa
      tabela aqui, o gráfico de barras da versão anterior era engano meu).
- [x] Dispositivo: tabela completa + donuts de participação (Impressões,
      Cliques, Conversões).
- [x] Typecheck limpo, build de produção ok.

### Pendências reais (não travam a 1ª rodada, mas não estão prontas)
- [ ] **"Visitas site" por linha** (termos/geografia/dispositivo) — hoje só
      existe como KPI agregado. Detalhar por dimensão exige uma query extra
      por seção (segmentada por `conversion_action_name`, SEM misturar com
      impressões/cliques na mesma query — duplicaria, mesmo erro do
      click_type) + merge por chave. Não implementado ainda.
  - [ ] Mesma pendência no gráfico "Por dispositivo" do painel Desempenho
        (hoje só Cliques + Conversões) e nos 4 donuts de dispositivo (hoje só
        Impressões/Cliques/Conversões, Looker tinha Visitas site também).
- [ ] **Drill-down de Cidade → bairro/CEP** — a tabela Cidade hoje só mostra
      linhas que resolveram EXATAMENTE em nível de cidade (`tipo === 'City'`);
      bairro/CEP não aparecem em lugar nenhum desta seção (entram nos totais
      gerais, só não no detalhe). Exige mapear canonical_name pra saber a
      qual cidade cada bairro/CEP pertence — não validado com dado real ainda.
- [ ] Heatmap de cor por célula (o Looker colore cada coluna com gradiente) —
      cortado desta rodada, fica pro refino visual.
- [ ] Onde o dashboard vive na tela — ainda em `/analytics` aba Tráfego (não
      movido pro perfil do cliente; essa decisão ficou em aberto quando o
      foco virou o conteúdo do Ads primeiro).
- [ ] Ao concluir Ads (Lucas aprovar): repetir o processo (prints do Looker de
      Site) antes de construir a versão de GA4.
