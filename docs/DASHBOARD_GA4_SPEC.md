# Spec — Dashboard Site / GA4 (substituto do Looker)

> Status: em construção — fonte única de verdade das decisões do dashboard de
> Site. Mesmo método do Ads (ver `docs/DASHBOARD_GADS_SPEC.md`): replicar 1:1
> o Looker primeiro, refinar depois — exceto onde o Looker está estruturalmente
> errado (eixo duplo), que já corrige na largada. Estrutura similar ao Ads,
> não idêntica (cada um tem sua lógica).

## Origem: 8 prints do Looker (`C:\Users\lucas\Desktop\MEUS DASH LOOKER\GA4`)

### GA4-1 — Visão Geral (topo)
- Domínio do cliente, filtro de Período, botão "Limpar filtros".
- Painel **"Informações gerais"** (6 tiles): Visualizações, Novos usuários,
  Sessões, Duração média da sessão, Eventos por sessão, Rolaram a tela até o
  fim. Delta "X% de N dias anteriores".
- Painel **"Desempenho"**: Taxa de engajamento, Taxa de rejeição + gráfico de
  barras horizontais **Por dispositivo** (Visualizações/Novos usuários/
  Sessões × Mobile/Desktop) — mesmo padrão do painel Desempenho do Ads.
- **Acompanhamento de acessos**: gráfico de linha por hora do dia (Visualizações,
  Novos usuários, Sessões — mesma unidade, 1 eixo, ok no Looker).
- **De onde vem o tráfego** (prévia compacta: Origem/mídia → Visualizações).

### GA4-2 — Mais acompanhamento + eventos
- **Acompanhamento de duração média** (linha, métrica única).
- **Acompanhamento de engajamento** (Taxa de engajamento + Taxa de rejeição —
  mesma unidade %, 1 eixo compartilhado, legítimo).
- Donut de Origem/mídia (mesmos dados da tabela compacta da GA4-1).
- **Eventos disparados** (prévia compacta: Nome do evento → Visualizações).
  ⚠️ **DECISÃO**: no Looker essa coluna é `screenPageViews` segmentada por
  evento — só `page_view` tem valor, os outros ficam 0 (métrica mal aplicada,
  mesma classe de problema do eixo duplo). Já implementado corretamente com
  `eventCount` (mostra volume real de click/scroll/etc.) — mantém, não
  regride pra métrica errada só pra bater com o print.

### GA4-3 — Páginas (tabela completa)
- **Caminho da página** (normalizado, sem query string): Visualizações,
  Novos usuários, Sessões, %Engajamento, %Rejeição, Duração média + Total
  geral + paginação.
- **Caminho da página + string** (com query string/fbclid): mesmas colunas,
  granularidade mais fina — útil pra ver de qual link/campanha exata veio.

### GA4-4 — Cidade e Estado
- Tabela **Cidade** (6 métricas padrão + Total geral).
- Tabela **Estado** (mesmas colunas).

### GA4-5 — País + Origem
- Tabela **País** (mesmas colunas).
- Tabela **Origem/mídia da sessão** completa (mesmas 6 colunas padrão —
  diferente da prévia compacta da GA4-1 que só tem Visualizações).

### GA4-6 — Evento + Tipo de usuário
- Tabela **Nome do evento** completa (mesmas 6 colunas — mesma ressalva da
  GA4-2 sobre a métrica "Visualizações" aplicada a evento).
- Tabela **Tipo de usuário** (Novo/Recorrente/Indefinido, mesmas 6 colunas).

### GA4-7 — Dispositivos técnicos
- Tabela **Dispositivo + Modelo + Marca** (Dispositivo, Modelo do dispositivo
  móvel, Marca: Visualizações, Novos usuários, Sessões, Duração média — SEM
  %Engajamento/%Rejeição aqui, é a única tabela do Looker com esse subset).
- Tabela **Navegador** (6 colunas padrão).

### GA4-8 — SO e resolução
- Tabela **Sistema operacional com a versão** (6 colunas padrão).
- Tabela **Resolução da tela** (6 colunas padrão).
- Rodapé: "dados não são em tempo real, fuso horário de Brasília" — nota de
  UX a considerar (mostrar no rodapé do dashboard).

## Padrão observado: as 6 métricas padrão

Quase toda tabela do Looker (Página, Cidade, Estado, País, Origem/mídia,
Evento, Tipo de usuário) usa o MESMO conjunto de 6 colunas: **Visualizações,
Novos usuários, Sessões, % Engajamento, % Rejeição, Duração média**. A
implementação atual (F5) tinha conjuntos diferentes por dimensão (ex.:
Origem tinha Conversões/Tx. conversão mas não tinha Visualizações/Rejeição/
Duração; Tipo de usuário igual). ⚠️ **DECISÃO**: padronizar as 6 métricas em
TODAS as tabelas de quebra, mantendo Conversões/Taxa de conversão como
colunas EXTRAS em Origem e Tipo de usuário (métrica de negócio real, já
implementada e útil — mesmo precedente do Ads com CPC médio/Cliques por
conversão, que também não estavam no Looker original).

## Geografia — 3 tabelas separadas (mesma decisão do Ads)

O Looker mistura Cidade/Estado/País numa lógica de tabela por tabela, mas a
implementação F5 tinha uma ÚNICA tabela com as 3 colunas juntas por sessão
(cidade+estado+país da mesma linha) — mistura granularidade, mesmo erro já
corrigido no Ads. Nova versão: 3 queries independentes (dimensão `city`,
`region`, `country` isoladas), cada uma com as 6 métricas padrão + Total
geral — confirmado com dado real que as 3 dimensões funcionam isoladas.

## Gráfico "Acompanhamento por hora do dia" — eixo duplo (bug herdado da F5)

`HorariosGA4Card` atual junta Sessões (eixo de contagem) com Taxa de
engajamento/rejeição (eixo %) no MESMO gráfico com 2 eixos Y — o mesmo
problema já corrigido no Ads (`SerieDiariaCard`), aqui ainda não tinha sido
pego. **DECISÃO**: dividir em 3 gráficos de eixo único, replicando o
agrupamento do Looker:
- Acompanhamento de acessos: Visualizações, Novos usuários, Sessões (1 eixo,
  mesma unidade) — `horariosGA4` precisa ganhar `usuariosNovos` (confirmado
  compatível com dado real).
- Acompanhamento de duração média: métrica única.
- Acompanhamento de engajamento: Taxa de engajamento + Taxa de rejeição
  (1 eixo % compartilhado, legítimo — mesma unidade).

## Painel de KPIs — regroup em 2 painéis (mesma lógica do Ads)

Dois painéis: **"Informações gerais"** (6 tiles = grade 3×2 limpa, 1:1 com o
Looker: Visualizações, Novos usuários, Sessões, Duração média, Eventos/sessão,
Rolaram até o fim) + **"Desempenho"** (Taxa de engajamento, Taxa de rejeição +
gráfico Por dispositivo com 3 métricas), igual à estrutura Interações/Desempenho
do Ads. ⚠️ **Revisão 27/07**: "Usuários ativos" foi REMOVIDO do painel — como 7º
tile ele quebrava o grid em 3+3+1 (dois slots vazios, o "espaço em branco" que o
Lucas apontou) e não existe na referência. O valor segue no tipo `KpisGA4` se
precisar voltar. O gráfico "Por dispositivo" subiu de `h-11rem` → `h-14rem` (Ads
e Site) pra a coluna direita alcançar a altura da esquerda, como no Looker.

## Dispositivos — duas camadas (categoria vs técnico)

- `dispositivosGA4` (categoria: mobile/desktop/tablet) — já existe, ganha as
  6 métricas padrão + Total geral + donuts (mesmo padrão do
  `DispositivosAdsCard`). Usado também no gráfico "Por dispositivo" do painel
  Desempenho.
- `tecnologiaGA4` ganha DOIS novos cortes (confirmados com dado real):
  dispositivo+modelo+marca (`mobileDeviceModel`/`mobileDeviceBranding`, só
  Visualizações/Novos usuários/Sessões/Duração — sem %engaj./%rejeição,
  réplica exata do Looker) e **Navegador** (`browser`, 6 métricas padrão —
  tabela que a F5 nunca teve).

## Status — rebuild em andamento

### Feito e validado com dado real (verificação de campos)
- [x] Confirmado GAQL... (não aplica, é GA4) — confirmado via `runReport` real
      (conta Ana Ester, property 537989251): `mobileDeviceModel`/
      `mobileDeviceBranding`, `browser`, `pagePathPlusQueryString`, `region`/
      `country`/`city` isolados, `hour`+`newUsers`, `sessionSource`+`sessionMedium`
      com o conjunto padrão completo, `newVsReturning` com o conjunto padrão
      completo — todos retornam dado real, nenhum incompatível.

### Feito e validado com dado real (22/07)
- [x] Data layer (`ga4-detalhes.ts`): 6 métricas padrão em Origem/
      Dispositivo/Tipo usuário, geografia dividida em 3 (`GeografiaGA4`
      com `cidades`/`estados`/`paises`, cada uma sua própria agregação),
      `usuariosNovos` em horários, `tecnologiaGA4` estendida (navegador +
      dispositivo/modelo/marca), `paginasRawGA4` (`pagePathPlusQueryString`).
      Validado com dado real (conta Ana Ester, jun–jul/2026): soma de
      visualizações por Páginas/Dispositivo/Horário e soma de sessões por
      Aquisição/País batem EXATAS com o KPI agregado — sem duplicação.
- [x] UI: `KpiTilesGA4` em 2 painéis (Informações gerais + Desempenho com
      gráfico por dispositivo), `HorariosGA4Card` em 3 gráficos de eixo único
      (Acessos/Duração média/Engajamento, reusa `MiniChartLinha` do Ads —
      corrige o mesmo bug de eixo duplo achado no Ads), `GeografiaGA4Card` em
      3 tabelas com Total geral, `DispositivosGA4Card` com tabela completa +
      3 donuts, `TecnologiaCard` com 4 sub-tabelas (SO/resolução/navegador/
      device técnico), `AquisicaoCard`/`NovoRecorrenteCard`/`PaginasCard` com
      as 6 métricas padrão + Total geral. `PaginasCard` ganhou a 2ª tabela
      (caminho + query string).
- [x] Portal do cliente (`AnalyticsDidatico.tsx`) e rota pública ajustados
      pro novo formato de `geografiaGA4` (objeto com 3 arrays em vez de
      array único misturado).
- [x] Typecheck limpo, build de produção ok.

### Pendências reais (deliberadas, ver decisões acima)
- [x] **Rodapé de fuso (rodada 2026-07-24)** — "Os dados não são em tempo real.
      Fuso: (GMT-03:00) Horário de Brasília." adicionado ao rodapé do Site.
- [x] **Refino 1:1 (rodada 2026-07-24)** — mesmos recursos do Ads no Site:
      período personalizado + estado na URL, heatmap por coluna, ordenação por
      cabeçalho, baixar CSV, delta "de N dias anteriores", gráfico "Por
      dispositivo" menos espremido. Nova série diária GA4 (`serieDiariaGA4`,
      dimensão `serie`) alimenta a mini-tendência do Site na Visão geral.
- [ ] "Nome do evento" não ganhou as 6 métricas padrão — a métrica
      "Visualizações" do Looker aplicada a evento é mal definida (só
      `page_view` tem valor); mantido com `eventCount`, mais correto.
- [ ] **Prévias compactas do Site** — o Looker GA4-1/GA4-2 tem previews
      compactas ("De onde vem o tráfego", eventos) ao lado dos gráficos que o
      Site do Hub ainda não replica (só as tabelas completas). Avaliar na
      passada print-a-print.
- [ ] **Passada print-a-print + gate do Lucas** — Site desbloqueado pra revisão
      (o único cliente com GA4, a Ana Ester, estava escondido — o toggle
      "Incluir inativos" resolveu). Falta o Lucas fotografar o render e aprovar
      os deltas finos; não dá pra fazer sem browser aqui.
