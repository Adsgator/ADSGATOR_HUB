# AdsGator Hub — Destravar dados de Ads/GA4 + Base histórica BigQuery + Tool de IA

> **Como executar:** implementação em chat novo aberto em `C:\PROJETOS\ADSGATOR\ADSGATOR_HUB`, modelo recomendado `claude-fable-5[1m]`. Fase por fase, na ordem. Cada fase é independente, termina verificável e com commit próprio. Fases marcadas com 👤 têm passo que depende do Lucas (detalhado na seção "O que depende do Lucas" no fim).
>
> **Instruções para o chat de execução:**
> 1. Copiar este plano para `docs/PLANO_DADOS_BIGQUERY.md` no repositório (versionado junto do código).
> 2. Revisar o plano inteiro contra o código atual antes de começar — confirmar que arquivos/linhas citados ainda batem; avisar o Lucas se algo mudou.
> 3. Executar fase por fase; ao fim de cada uma: rodar a verificação descrita, mostrar o resultado ao Lucas, commitar antes de seguir.
> 4. Regras permanentes: nunca executar nada que possa gerar custo sem avisar antes; nos passos 👤, explicar ao Lucas exatamente o que fazer; relatório semanal permanece desligado até decisão dele; nada de e-mail para clientes reais sem confirmação explícita.

## Contexto

O AdsGator Hub (Next.js 15 + Supabase, `C:\PROJETOS\ADSGATOR\ADSGATOR_HUB`) integra Google Ads e GA4, mas **nenhum dado aparece nas telas**. Diagnóstico confirmado com testes reais nesta sessão:

- ✅ **Credenciais Google Ads funcionam** — query GAQL na conta do Ricardo (403-661-9050) retornou campanhas reais.
- ✅ **GA4 funciona** — property da Ana Ester (537989251) retornou 38 sessões/30d.
- ✅ **Cron ativo** — job `analytics_sync` roda diariamente via GitHub Actions → `/api/v1/cron/dispatch` (último run 02/07 08:58 UTC).
- ❌ **Causa raiz: todos os clientes com `google_ads_enabled=false` / `ga4_enabled=false`** → `sincronizarCliente` (src/lib/analytics-sync.ts:69,101) pula todo mundo → `analytics_snapshots` vazia desde sempre.
- 🐛 Customer ID da Ana Ester salvo com espaço à frente (`" 223-747-4942"`).
- 🐛 Erros engolidos: `google-ads.ts` retorna `[]` no catch (linhas 92-95 e demais funções); `google-analytics.ts` retorna objeto **zerado** no catch (94-99). Consequência: falha de API vira snapshot de zeros gravado como "ok".
- 🐛 Rota "ao vivo" (`/api/analytics/[clienteId]/live/route.ts:56-70`): períodos 7d/30d/90d viram `mesAno` da data inicial → no começo do mês mostra o mês anterior inteiro.
- 🕳️ `clientes.saldo_google` alimenta alertas sofisticados mas **não tem nenhuma fonte** (nem UI nem sync) — sempre 0.

Decisões do usuário: ativar integrações por mim (Ricardo + Ana Ester); backfill máximo; região BigQuery a mais barata (US, free tier); relatório semanal por e-mail permanece desligado por ora.

Objetivo final: dados fluindo no Hub + histórico granular diário no BigQuery (via Data Transfer nativo do Google Ads, sem código de sync próprio) + nova tool do agente IA interno para consultas históricas + Data Agent Kit instalado para desenvolvimento.

---

## Fase 0 — Destravar os dados (produção, sem deploy)

1. **Ativar integrações via Supabase REST (service-role, mesmo efeito do botão Salvar):**
   - Ricardo de Souza Júnior: `google_ads_enabled=true`.
   - Ana Ester: `google_ads_customer_id='223-747-4942'` (trim) + `google_ads_enabled=true` + `ga4_enabled=true`.
2. **Disparar o primeiro sync em produção:** `GET https://app.adsgator.com.br/api/v1/analytics/sync` com `Authorization: Bearer $CRON_SECRET` (rota já existente, src/app/api/v1/analytics/sync/route.ts:27-36). Isso também valida que as envs Google estão na Vercel.
   - Se falhar em produção → rodar sync localmente (envs locais OK) e listar quais envs colar na Vercel.
3. **Verificar:** `analytics_snapshots` com linhas de `google_ads` (Ricardo, Ana Ester) e `ga4` (Ana Ester). Nota: campanhas do Ricardo aparentam estar pausadas — investimento baixo/zero no mês é dado real, não bug.

## Fase 1 — Consertos de código (repo)

1. **Trim/normalização ao salvar** em `src/components/clientes/ClienteIntegracoes.tsx` (handleSave, linhas 118-153): `.trim()` em `google_ads_customer_id`, `ga4_property_id` e demais campos texto.
2. **Bug do período no "ao vivo":** mudar `src/lib/google-ads.ts` e `src/lib/google-analytics.ts` para aceitar intervalo real (`dataInicio`/`dataFim`) em vez de `mesAno`; `live/route.ts` passa o intervalo calculado. `analytics-sync.ts` continua usando mês fechado (comportamento correto para snapshot mensal) — adaptar chamada com o range do mês.
3. **Parar de engolir erros:** funções de `google-ads.ts`/`google-analytics.ts` passam a **lançar** exceção. `sincronizarCliente` já tem catch que marca `'erro'` (analytics-sync.ts:94-97) — passa a funcionar de verdade, sem gravar zeros como "ok". A rota `/live` já usa `Promise.allSettled` (route.ts:130-153) — segue resiliente; adicionar `console.error` nos rejected.
4. **Saldo Google Ads com fonte de verdade:** o motor de alertas (saldo-ads.ts) está completo mas `clientes.saldo_google` nunca é escrito. Implementar: (a) busca automática no sync diário via GAQL `account_budget` (funciona para contas pré-pagas/boleto — padrão em agência BR); (b) campo "Saldo atual" editável em `ClienteIntegracoes.tsx` como fallback para contas pós-pagas; (c) `saldo_google_atualizado_em` para o card mostrar a idade do dado.
5. **Snapshots semanais além dos mensais** em `analytics-sync.ts`: gravar também o período semana (seg–dom) — a constraint UNIQUE já suporta. Sem isso, o relatório semanal (quando for ligado) compararia mês corrente parcial vs mês passado inteiro e mostraria variações absurdas ao cliente. `relatorio-semanal.ts` passa a filtrar snapshots de período semanal.
6. `npm run build` + lint. Commit por fase.

## Fase 1B — Visibilidade permanente ("nunca mais no escuro")

Garante que, para QUALQUER cliente atual ou futuro, toda pendência e toda falha fique visível no Hub:

1. **Botão "Testar conexão" por cliente** em `ClienteIntegracoes.tsx` + nova rota `POST /api/v1/clientes/[id]/testar-integracao`: faz query GAQL mínima no customer ID e `runReport` mínimo na property GA4, devolvendo ok/erro com mensagem clara ("ID não existe", "sem acesso via MCC", "service account sem permissão no GA4"). Elimina o cenário "ID errado aceito em silêncio".
2. **Pendência de toggle desligado:** ajustar o item `clientes_pendentes` de `src/lib/setup-checklist.ts` (query linhas 41-45) para também contar clientes com ID preenchido mas `google_ads_enabled=false`/`ga4_enabled=false` — hoje esse caso (o caso do Ricardo) não aparece em lugar nenhum do checklist global. Aviso equivalente inline em `ClienteIntegracoes.tsx` quando ID preenchido + toggle off.
3. **Status de sincronização por cliente:** `sincronizarCliente` grava resultado em colunas novas `clientes.ultimo_sync_at` / `ultimo_sync_status` / `ultimo_sync_erro` (migration pequena). Exibir na página `/analytics` e no detalhe do cliente ("Última sincronização: 03/07 06:00 — OK" / "ERRO: token expirado").
4. **Notificação de falha para QUALQUER job do robô (não só analytics):** o dispatch (`src/app/api/v1/cron/dispatch/route.ts:105-118`) roda 9 jobs — analytics, briefing, importação Asaas, alertas, cobrança, arquivar congelados, lembretes onboarding, relatório semanal, saldo baixo — e hoje TODA falha morre no JSON de resposta que ninguém lê. Passa a: criar notificação in-app na falha de qualquer job (infra já existe — padrão de `provisionarClienteNovo`, cliente-provisioning.ts:96-106). Cobre o sistema inteiro: se a cobrança do Asaas falhar, você fica sabendo no sino do mesmo jeito.
5. **Fluxo de cliente novo continua coberto:** provisionamento já cria tarefa de setup com checklist (IDs, toggles, saldo); com 1B.1 e 1B.2, o que faltar aparece no checklist global, no card de completude do cliente e agora com teste de conexão de 1 clique.
6. **Widget "Saúde do Sistema" no dashboard** (novo BentoCard em `src/components/dashboard/`, padrão dos existentes), duas seções: (a) **Integrações por cliente** — N sincronizando OK, N com pendência de setup, N com erro; (b) **Rotinas do robô** — os 9 jobs do cron com último run e status (dados já existem em `cron_settings.ultimo_run`). Resposta permanente ao "o que está acontecendo e o que está pendente" no sistema geral, sem caçar em três telas.

## Fase 2 — BigQuery Data Transfer (GCP, sem código no repo)

1. **Dataset:** `bq mk --dataset --location=US <projeto>:google_ads` (projeto ativo do gcloud; free tier: 10 GB storage + 1 TB query/mês).
2. **Transfer config Google Ads** apontando pro MCC (valor de `GOOGLE_ADS_MANAGER_ID` do .env.local, sem hífens) — puxa todas as contas filhas diariamente: `bq mk --transfer_config --data_source=google_ads --target_dataset=google_ads --display_name="AdsGator MCC" --params='{"customer_id":"<MCC>"}'`. **Passo interativo do Lucas:** autorizar OAuth no navegador (passo o link). **Garantia estrutural:** por ser no nível do MCC, toda conta nova de cliente vinculada ao MCC entra automaticamente na transferência — sem passo manual por cliente.
3. **Backfill máximo:** agendar backfill retroativo pelo período máximo que o transfer aceitar (em janelas, via `bq mk --transfer_run --start_time ... --end_time ...`).
4. **Alerta de falha da transferência:** ativar a notificação por e-mail nativa do Data Transfer Service (falha de auth/execução chega no seu e-mail — sem isso, dados envelheceriam em silêncio e a tool de IA responderia com dado velho).
5. **Verificar:** tabelas `ads_Campaign*` criadas por customer; `SELECT` de contagem na `ads_CampaignBasicStats_<CID>`.
6. *(Opcional futuro, registrado no backlog docs/TAREFAS_PROXIMA_SESSAO.md: export nativo GA4 → BigQuery por property — gratuito, mas exige configuração manual no admin do GA4 de cada cliente.)*
5. **Permissões para o produto:** conceder à service account existente (a mesma do Vertex) os papéis `roles/bigquery.jobUser` (projeto) e `roles/bigquery.dataViewer` (dataset) via gcloud.

## Fase 3 — Tool `ads_historico` no agente IA (repo)

1. `npm i @google-cloud/bigquery`.
2. **Novo `src/lib/bigquery.ts`:** `criarClienteBigQuery()` copiando o padrão dual-mode "path-ou-JSON" de `google-analytics.ts:39-45` / `vertex-ai.ts:42-56` (env aceita caminho local ou JSON inteiro — compatível com Vercel). Funções de consulta parametrizadas: performance diária por campanha, keywords, comparativo entre dois períodos — tabela resolvida pelo `google_ads_customer_id` do cliente (sem hífens → sufixo `_<CID>`).
3. **Nova entrada em `TOOLS`** (`src/lib/ia/tools.ts`), molde de `analytics_cliente`/`ads_ao_vivo` (linhas 970-1060): declaration `ads_historico` (cliente_id, data_inicio, data_fim, dimensão campanha|dia|keyword), execute com `ownCliente(ctx, ...)` + query BQ + compactação (`MAX_LISTA`), resumo. Leitura pura → fora de `TOOLS_MUTANTES`/`TOOLS_CONFIRMACAO`; `FUNCTION_DECLARATIONS` coleta automaticamente — sem mudança no route do agente.
4. **Envs Vercel:** credencial BQ como JSON-em-env (padrão já suportado pelo dual-mode).

## Fase 4 — Data Agent Kit (ferramenta de desenvolvimento)

1. Passar ao Lucas os comandos para o Claude Code: `/plugin marketplace add GoogleCloudPlatform/data-agent-kit` e instalação do plugin BigQuery — usado para explorar o schema real do dataset e testar as queries da Fase 3 durante o desenvolvimento.

## Fase 5 — Grupos de cliente (caso Paulo Alexandre: 1 cliente, 3 CNPJs) 👤

Decisão de design: **agrupar, não fundir.** Cada CNPJ mantém registro próprio (cobrança Asaas, IDs Google e saldo são por CNPJ), mas ganham um "grupo" que consolida a visão. Fundir registros quebraria financeiro e integrações.

1. **Migration `cliente_grupos`:** tabela `cliente_grupos (id, user_id, nome, observacao, created_at)` + coluna `clientes.grupo_id uuid NULL REFERENCES cliente_grupos(id) ON DELETE SET NULL` + RLS owner-scoped (mesmo padrão de `20260610_rls_owner_scoped.sql`).
2. **UI lista de clientes** (`src/app/(app)/clientes/page.tsx`): membros do mesmo grupo aparecem agrupados com badge do nome do grupo; criação/edição de grupo no detalhe do cliente.
3. **Visão consolidada do grupo:** no detalhe do cliente com grupo, painel com MRR somado, status de cada CNPJ e métricas agregadas (soma dos snapshots dos membros).
4. **IA:** `detalhar_cliente` passa a incluir o grupo; `analytics_cliente` e a nova `ads_historico` ganham parâmetro opcional para agregar por grupo ("como está o Paulo Alexandre como um todo?").
5. **Dados:** criar grupo "Paulo Alexandre" e vincular os 3 registros. 👤 Lucas confirma qual registro corresponde a qual CNPJ (e se os 2 "INATIVO" são mesmo CNPJs distintos ou um é duplicata a excluir).

## Fase 6 — Export GA4 → BigQuery (histórico granular de site/conversão) 👤

O GA4 tem export nativo, diário e gratuito para BigQuery — complementa o histórico de Ads com comportamento no site.

1. 👤 **Acesso necessário — duas opções:**
   - **Opção A (você clica):** sua conta Google precisa de papel **Editor ou Administrador** em cada property GA4 (como agência, você provavelmente já tem). Caminho: Admin → Vínculos de produto → Vínculos do BigQuery → criar vínculo → escolher o projeto → export **diário** (não usar streaming, que é pago). Forneço passo-a-passo; ~2 min por cliente.
   - **Opção B (eu automatizo):** elevar a service account existente (a mesma já adicionada como Leitor no GA4 da Ana Ester) de **Leitor → Editor** em cada property — mesma tela onde ela foi adicionada — e eu crio os vínculos via Admin API do GA4, sem você clicar nada. Nota: o Editor é necessário **só no momento de criar o vínculo**; depois pode rebaixar de volta a Leitor — o export continua rodando sozinho para sempre. E adicionar a service account no GA4 do cliente **já faz parte do checklist de onboarding** do sistema (setup-checklist), então não é passo novo — é o mesmo passo de sempre, com papel Editor em vez de Leitor na hora do setup.
2. Verificar datasets `analytics_<property_id>` chegando no BigQuery.
3. Estender `ads_historico` (ou tool irmã `site_historico`) para consultar eventos/conversões do export GA4.

## Fase 7 — Relatório mensal auto-preenchido

Hoje `POST /api/v1/relatorios/generate` recebe os dados prontos no body (quem chama precisa montar tudo; se não montar, gera relatório vazio).

1. Refatorar a rota para montar o `RelatorioMensalInput` no servidor: campanhas e keywords do BigQuery (histórico exato do mês, inclusive campanhas já removidas), GA4 via API atual.
2. A página de relatórios passa a pedir só `cliente_id` + `mes_ano` — 1 clique gera relatório completo.

## Fase 8 — Acabamento e proteção

1. **Alerta de custo GCP:** budget alert na billing account (aviso por e-mail a partir de R$ 10/mês) — proteção contra surpresa, já que o esperado é R$ 0. Ver seção "Custos" abaixo.
2. **Documentação:** atualizar `docs/ARQUITETURA.md` e `CLAUDE.md` do projeto (nova lib bigquery.ts, tool ads_historico, fluxo de dados) e registrar backlog em `docs/TAREFAS_PROXIMA_SESSAO.md`.
3. **Limpeza de dívida:** coluna legada `clientes.google_ads_id` (duplicada de `google_ads_customer_id`, de migration antiga) — confirmar uso zero e remover.
4. **Backlog registrado (não implementar agora):** página de performance no Portal do Cliente (o portal já existe; os snapshots/BQ alimentariam gráficos para o cliente final ver os resultados — potencial diferencial comercial da agência); integração Meta Ads no mesmo molde.

---

## O que depende do Lucas (consolidado)

| Quando | O quê | Esforço |
|---|---|---|
| Fase 2 | Autorizar o OAuth da transferência BigQuery no navegador (link que eu passo) | 2 min, uma vez |
| Fase 0.2 | Se o teste de produção acusar env faltando na Vercel, colar as que eu indicar | 5 min, uma vez |
| Fase 5 | Confirmar o mapeamento dos 3 CNPJs do Paulo Alexandre | 2 min |
| Fase 6 | Criar o vínculo BigQuery no admin GA4 de cada cliente (passo-a-passo fornecido) | 2 min por cliente |
| Sempre (cliente novo) | Colar Customer ID / Property ID e clicar "Testar conexão" | 1 min por cliente novo |
| Futuro (quando quiser) | Ligar o relatório semanal nas Configurações após validar os dados | 1 clique |

---

## Verificação end-to-end

- **Fase 0:** `analytics_snapshots` populada; página `/analytics` do Hub mostrando KPIs; cards do dashboard com números.
- **Fase 1:** no início de mês, `/live?periodo=7d` retorna dados do período correto; sync com credencial inválida marca `'erro'` (não grava zeros); campo de saldo salva e o card AlertaSaldoGoogle reflete.
- **Fase 1B:** botão "Testar conexão" com ID errado mostra erro claro; cliente com ID + toggle off aparece no checklist de setup; após sync, "Última sincronização" visível; sync forçado a falhar gera notificação no sino.
- **Fase 2:** `bq ls google_ads` lista tabelas; contagem > 0 na CampaignBasicStats do Ricardo.
- **Fase 3:** perguntar ao agente Gator no Hub: *"compara o desempenho das campanhas do Ricardo neste mês vs mês passado"* → tool `ads_historico` chamada, resposta com dados do BigQuery.
- **Fase 5:** grupo "Paulo Alexandre" criado com os registros vinculados; lista de clientes agrupada; pergunta "como está o Paulo Alexandre no total?" à IA responde agregado.
- **Fase 6:** datasets `analytics_*` presentes no BigQuery com eventos do dia anterior.
- **Fase 7:** gerar relatório mensal só com cliente + mês → markdown com campanhas/keywords reais.
- `npm run build` verde ao final de cada fase de código.

## Custos — garantia de zero surpresa

Compromisso de execução: **nenhum passo que possa gerar custo é executado sem aviso explícito antes.**

| Item | Custo |
|---|---|
| BigQuery Data Transfer (Google Ads) | **R$ 0** — o serviço de transferência é gratuito |
| BigQuery armazenamento | **R$ 0** até 10 GB (volume da agência: MB, não GB) |
| BigQuery consultas | **R$ 0** até 1 TB processado/mês (uso esperado: << 1%) |
| Export GA4 → BigQuery (diário) | **R$ 0** — export diário é gratuito (streaming seria pago; NÃO será usado) |
| Data Agent Kit | **R$ 0** — open source |
| Vertex AI (Gemini do agente) | custo que **já existe hoje**, monitorado pelo próprio Hub (`ia_uso`); este plano não o aumenta estruturalmente |
| Vercel / GitHub Actions / Supabase | inalterados |
| **Proteção ativa (Fase 8.1)** | alerta de orçamento no GCP com aviso por e-mail a partir de **R$ 10/mês** — se qualquer coisa fugir do esperado, você sabe antes de virar problema |

## Riscos / observações

- Envs de produção (Vercel) não verificáveis daqui — a Fase 0.2 os valida na prática.
- Transfer do Google Ads cria ~70+ tabelas por conta; custo esperado R$ 0 no volume atual.
- Relatório semanal (`cron_settings.relatorio_semanal`) permanece `ativo=false` por decisão do usuário; ao ligar, já contará com snapshots semanais (Fase 1.5).
- Busca automática de saldo (`account_budget`) depende do tipo de pagamento da conta do cliente; contas pós-pagas caem no fallback manual — comportamento documentado na UI.
- Clientes de teste ("Lucas Teste", "Vitória Carvalho TESTE") permanecem — decisão do usuário, estão em uso para testes do sistema.
- Caso Paulo Alexandre (3 CNPJs) resolvido pela Fase 5 (grupos), sem fusão de registros.
