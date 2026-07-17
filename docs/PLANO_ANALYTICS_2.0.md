# PLANO — Analytics 2.0: trazer os dashboards Looker para dentro do Hub

> Status: **APROVADO em 17/07/2026** — decisões do Lucas registradas abaixo; execução fase a fase.
> Base: inventário dos dashboards atuais em `docs/referencias/DASHBOARDS_LOOKER_ATUAIS.md`.
> Protocolo: executar fase por fase, verificação + commit ao fim de cada uma.
> Custo: **nenhuma env/serviço novo** — GA4 Data API e Google Ads API são gratuitas
> (cotas), BigQuery segue no free tier (queries pequenas). Nada aqui gera cobrança
> nova sem aviso.

## Objetivo

O módulo `/analytics` do Hub passa a entregar o que os 3 dashboards Looker
entregam hoje — por cliente, com comparativo de período — e melhor (cache sem
erro de cota, alertas, Gator consultando os mesmos dados, portal do cliente).
Ao final, o Looker é aposentado.

## O que já temos (não recriar)

- `analytics_snapshots`: agregado mensal + semanal (Ads e GA4) via sync.
- `/api/analytics/[id]/live`: Ads ao vivo (7/30/90d, campanhas top-N).
- BigQuery `google_ads` (Data Transfer MCC): histórico diário por
  campanha/keyword — backfill ~1 ano em carga; `lib/bigquery.ts` consulta.
- Relatório mensal auto-preenchido; relatório semanal por email; portal
  `/portal/[token]`; página `/analytics` com seletor de cliente.

## Lacunas vs Looker (o que o plano constrói)

**Ads:** termos de pesquisa, demografia (idade/gênero), geografia
(cidade/região), dia da semana + horário, impression share 1ª posição,
KPIs com delta vs período anterior, filtro por campanha.
**GA4:** páginas acessadas (normalizadas, sem fbclid), origem/mídia,
dispositivo, novo×recorrente, eventos, hora do dia, scroll até o fim,
SO/resolução, país/cidade — tudo com delta vs período anterior.
**Extra:** gauge "limite mensal de mídia" (gasto do mês vs teto do cliente).

## Fontes por seção

| Corte | Fonte primária | Fallback |
| --- | --- | --- |
| Série diária Ads | BigQuery (`ads_CampaignBasicStats`) | GAQL segments.date |
| Termos de pesquisa | BQ `ads_SearchQueryStats_<CID>` (validar em F0) | GAQL `search_term_view` |
| Demografia idade/gênero | BQ Age/Gender stats (validar) | GAQL `age_range_view` / `gender_view` |
| Geografia | GAQL `geographic_view` | BQ GeoStats se existir |
| Dia da semana / hora | GAQL `segments.day_of_week` / `segments.hour` | BQ HourlyStats se existir |
| Impression share 1ª pos. | GAQL `search_top_impression_share` | — |
| GA4 (todos os cortes) | GA4 Data API `runReport` com dimensões (SEMPRE com `clampFim`) | — |

Regra herdada do plano anterior (não regredir): falha de API **lança** —
nunca devolver zeros como se fosse dado.

## Fases

### F0 — Validar BigQuery ✅ CONCLUÍDA (17/07/2026)
Backfill carregado: 9 contas, histórico desde 07/2025, atualização diária (D-1).
**Descoberta:** as views são sufixadas com o ID do MCC (uma view por relatório
com TODAS as contas; filtro por `customer_id`), não por conta como assumido —
`lib/bigquery.ts` corrigido e validado com query real (campanhas do Ricardo,
incluindo campanhas antigas). Sem duplicação entre partições nas views de
stats; entidades usam `_DATA_DATE = _LATEST_DATE`. Todas as views do plano
existem: SearchQueryStats, AgeRange/Gender, GeoStats, HourlyCampaignStats,
Keyword, Placement.

### F1 — Camada de dados Ads: `lib/ads-detalhes.ts`
Termos, demografia, geo, dia/hora, impression share — GAQL + BQ conforme F0.
Tipos por corte, período flexível, comparativo (2 períodos) computado no server.

### F2 — Camada de dados GA4: `lib/ga4-detalhes.ts`
Páginas (caminho normalizado sem query string), aquisição origem/mídia,
dispositivo, novo×recorrente, eventos, hora do dia, scroll, SO/resolução,
país/cidade. Tudo com `clampFim` e comparativo de período.

### F3 — Cache `analytics_detalhes` + rota
Migration (manual, SQL Editor): tabela `analytics_detalhes` (cliente_id, fonte,
dimensao, periodo_inicio/fim, payload JSONB, atualizado_em; unique por chave).
Rota `GET /api/analytics/[id]/detalhes?fonte=&dimensao=&inicio=&fim=` (sessão):
serve do cache com TTL (~6h) e renova on-demand — mata o "erro de cota" do
Looker e deixa a UI instantânea.

### F4 — UI `/analytics`: dashboard Tráfego (Ads)
Por cliente, aba "Tráfego": KPIs com delta (o layout de tiles do Looker no
design system do Hub), série diária, termos (busca + top), demografia, geo,
dia/hora, dispositivos, filtro por campanha, presets de período (mês atual,
mês passado, 30/90d) com comparativo automático.

### F5 — UI `/analytics`: dashboard Site (GA4)
Aba "Site": KPIs com delta, aquisição, páginas, dispositivos/tech, horários,
engajamento×rejeição, novo×recorrente, geografia.

### F6 — Portal do cliente + limite mensal
Portal ganha os dois dashboards **completos porém didáticos** (decisão 1):
mesmos números, mas cada métrica com explicação em linguagem de leigo
(tooltip/legenda "o que isso significa"), leitura guiada ("neste mês seu
anúncio apareceu X vezes…"). A profundidade analítica crua (tabelas densas,
filtros avançados) fica nos dashs internos. O link do Looker morre.
Gauge "limite de mídia do mês": o limite é **por PLANO** (decisão 2) — campo
no cadastro de plano (Configurações → Planos); o gauge cruza o plano do
cliente × gasto do mês. Os planos ainda serão estruturados pelo Lucas; o
gauge entra quando existirem (não bloqueia o resto da fase).

### F7 — Amarração: relatórios + Gator + aposentar Looker
Relatório mensal ganha termos/demografia; Gator ganha acesso aos novos cortes
(estender `ads_historico`/`analytics_cliente` ou tool nova `analytics_detalhes`);
system-map + changelog; Looker desativado quando o Lucas validar.

## Decisões do Lucas (respondidas em 17/07/2026)

1. **Portal do cliente**: bem completo E didático — mostra tudo (inclusive
   custo), mas explicado para leigo entender; o analítico denso fica nos
   dashs internos da agência.
2. **Limite mensal de mídia**: é **por PLANO** (cada plano tem um limite),
   não por cliente. Os planos ainda serão estruturados — o gauge entra
   quando existirem.
3. **Looker**: será desligado — tudo pelo Hub. Meta de UX: "entrar no
   cliente e ver o dash certinho, com filtros e tudo" → além da página
   /analytics, o dashboard do cliente deve ser acessível a partir do
   DETALHE do cliente (aba Campanhas/Performance aponta para o dash completo).
