// ─── MAPA DO SISTEMA — autoconhecimento do agente ────────────────────────────
// Descrição compacta do que o Adsgator Hub É: módulos, fluxos, automações e
// lacunas conhecidas. Versionado junto com o código — ao mudar o produto,
// atualize aqui para a Gator continuar sugerindo melhorias com base na
// realidade. Consumido pela ferramenta mapa_do_sistema (lib/ia/tools.ts).

export const SYSTEM_MAP = `
ADSGATOR HUB — sistema operacional da agência (Next.js 15 + Supabase + Vertex AI, deploy Vercel).

MÓDULOS (rota → o que faz):
- /dashboard — Bento grid customizável: Morning Briefing, KPIs, ações do dia, DRE sparkline, alertas, chat Gator, feed, notícias, churn risk, top performers, metas.
- /clientes — lista, cadastro, detalhe com projetos, estágios/checklist (pré-vendas→onboarding→ativo), timeline de auditoria, memória .md por cliente, health score 0-100.
- /financeiro — DRE, lançamentos (receita/custo fixo/variável), inadimplentes (política D+7 suspensão, D+15 grave, D+30 crítico — centralizada em lib/cobranca.ts).
- /analytics — Google Ads + GA4: snapshots históricos (sync diário 06:00 via cron) + dados ao vivo por cliente.
- /relatorios — relatórios executivos gerados com Gemini Pro, envio por email ao cliente.
- /tarefas — lista + kanban, prioridades, prazos, checklist, drag-drop persistente.
- /marketing — calendário social 4 semanas (rascunho/agendado/publicado), gerador de hashtags IA.
- /prospectar — CRM de prospecção (funil com estágios, valor de proposta).
- /operacional — planos operacionais e fluxos por cliente.
- /base-conhecimento, /portfolio, /biblioteca (componentes Astro p/ landing pages).
- /configuracoes — 7 abas: perfil, notificações, integrações, financeiro, aparência, equipe, auditoria; toggles de automação de email; templates de email editáveis.
- /portal/[token] — portal público do cliente.

INTEGRAÇÕES:
- Asaas (cobrança): webhook cria cliente no SUBSCRIPTION_CREATED (checkout-first), processa pagamentos, sync diário de inadimplência. Edge Functions com TEST_MODE=true ainda.
- Google Ads + GA4: sync de snapshots (cron 06:00) e consultas ao vivo. Depende de credenciais nas env vars.
- Resend (email): 3 fluxos automáticos com toggle individual (relatório mensal→cliente, cobrança vencida→cliente, alerta crítico→operador). Desativados por padrão.
- Vertex AI Gemini: agente Gator (Flash), relatórios executivos (Pro), insights, copy, hashtags.
- WhatsApp: manual via links wa.me com biblioteca de 13 mensagens prontas — SEM automação (decisão de escopo).

CRONS (vercel.json): sync analytics 06:00, alertas 08:00, cobrança 09:00.

LACUNAS CONHECIDAS (pendências reais — sugestões nessas áreas são bem-vindas):
- Credenciais Google Ads/GA4 não configuradas nas env vars → analytics sem dados reais ainda.
- TEST_MODE=true nas Edge Functions webhook-asaas e regua-cobranca (checklist em docs antes de virar).
- RBAC/RLS por usuário é parcial (isolamento por user_id na aplicação; usePermissoes existe mas não está ligado).
- Publicação real de posts via Meta API não existe (calendário é organizacional).
- Emails automáticos prontos porém toggles desligados.

COMO PROPOR MUDANÇA: você não lê nem altera o código-fonte. Quando uma ideia for aprovada pelo Lucas, escreva a spec (o quê, por quê, onde encaixa no Hub) e crie uma tarefa com criar_tarefa — o engenheiro (Claude) implementa a partir dela.
`.trim()
