// ─── MAPA DO SISTEMA — autoconhecimento do agente ────────────────────────────
// Descrição compacta do que o Adsgator Hub É: módulos, fluxos, automações e
// lacunas conhecidas. Versionado junto com o código — ao mudar o produto,
// atualize aqui para a Gator continuar sugerindo melhorias com base na
// realidade. Consumido pela ferramenta mapa_do_sistema (lib/ia/tools.ts).

export const SYSTEM_MAP = `
ADSGATOR HUB — sistema operacional da agência (Next.js 15 + Supabase + Vertex AI, deploy Vercel).

MÓDULOS (rota → o que faz):
- /dashboard — Bento grid customizável: Morning Briefing, KPIs, ações do dia, DRE sparkline, alertas, chat Gator, feed, notícias, churn risk, top performers, metas.
- /clientes — lista, cadastro, detalhe com projetos, estágios/checklist (pré-vendas→onboarding→ativo), timeline de auditoria, memória .md por cliente, health score 0-100. Ciclo de vida: operação = recebido/onboarding/setup_trafego/ativo/congelado; saída = status único 'inativo' + motivo_inativacao (debito | cancelado | congelamento_expirado), centralizado em lib/cliente-status.ts. Inativos somem das telas de gestão. Congelado há mais de N dias (config em Automações, default 60) vira inativo automaticamente. Completude do cadastro (lib/cliente-completude.ts): régua única do que falta preencher por cliente em 4 blocos (marca/negócio, integrações Google incl. link do perfil Google Ads, financeiro/contrato, contexto) — exibida no detalhe (card com %) e sinalizada na lista (selo laranja quando incompleto). Aplica-se inclusive aos importados do Asaas. Onboarding guiado: a aba Timeline do cliente conduz o processo por steps (mensagens prontas no padrão de voz da agência, com {{primeiro_nome}}/{{drive_url}} interpolados, botão WhatsApp e campos para anotar dados do cliente; avanço persistido). 3 templates por tipo de contratação: Combo (LP+Tráfego), Só Tráfego (já tem site), Só LP — cada um só com as fases que importam. A aba é uma tela passo-a-passo vertical (todas as fases visíveis, atual em destaque); cada fase indica responsável ('cliente' = esperando ele | 'agencia' = tarefa do Lucas) e, quando a bola é do cliente, oferece lembrete pronto (régua 24h/72h). Inclui confirmação de recebimento do briefing e sub-fluxo 'cliente sem GMN'. Onboarding integrado: concluir etapa grava dados no cliente (IDs Google etc.) e o status acompanha (recebido→onboarding→ativo). Campo cliente.tipo_contratacao (combo|trafego|lp) seleciona o template e habilita iniciar onboarding em 1 clique (origem futura: checkout próprio). Variáveis (drive_url, ID) editáveis a qualquer momento; etapas reabríveis. Lembretes automáticos: job 'onboarding_lembretes' (dispatcher, lib/onboarding-lembretes.ts) varre onboardings ativos e, quando o cliente trava numa etapa "com o cliente" além de lembrete_horas (24h/72h), gera notificação no Hub com a mensagem pronta (1x por limite). Aviso de cliente novo: provisionarClienteNovo notifica o operador ao entrar cliente (form/import/webhook). Gator tem a tool panorama_onboarding (onde cada cliente parou, tempo na etapa, responsável).
- /financeiro — DRE, lançamentos (receita/custo fixo/variável), inadimplentes (política D+7 suspensão, D+15 grave, D+30 crítico — centralizada em lib/cobranca.ts). Distinção: "Receita do Mês" = entradas confirmadas no caixa (financeiro_lancamentos); "MRR" = receita recorrente das assinaturas com cobrança viva (ativa/atraso), fonte única em lib/mrr.ts — todas as telas usam o mesmo cálculo.
- /analytics — Google Ads + GA4: snapshots históricos (sync diário via dispatcher de agendamentos) + dados ao vivo por cliente.
- /relatorios — relatórios executivos gerados com Gemini Pro, envio por email ao cliente.
- /tarefas — lista + kanban, prioridades, prazos, checklist, drag-drop persistente. Templates de processo (tarefa_templates, editáveis em Configurações → Templates) geram tarefas com checklist pronto — os de sistema (setup-cliente, onboarding-cliente) alimentam o provisionamento automático.
- /marketing — calendário social 4 semanas (rascunho/agendado/publicado), gerador de hashtags IA.
- /prospectar — CRM de prospecção (funil com estágios, valor de proposta).
- /operacional — planos operacionais e fluxos por cliente.
- /base-conhecimento, /portfolio, /biblioteca (componentes Astro p/ landing pages).
- /configuracoes — navegação por categorias no menu lateral, cada uma com sub-abas: Geral (Setup, Perfil, Aparência), Comunicação (Emails — templates editáveis —, Automações — toggles de email + agendamentos —, Notificações), Cobrança (Financeiro, Planos), Operação (Operacional, Integrações), Conta (Equipe, Auditoria), Sistema (Backup). Setup é a central de prontidão (checklist vivo do que falta configurar, com % e passos; deep-link ?tab=setup; demais deep-links ?tab= continuam válidos). Dashboard mostra banner "Sistema pronto: X%" enquanto o setup não está completo (use prontidao_sistema para o detalhe).
- /portal/[token] — portal público do cliente.

INTEGRAÇÕES:
- Asaas (cobrança): webhook cria cliente no SUBSCRIPTION_CREATED (checkout-first), processa pagamentos, sync diário de inadimplência. Edge Functions em PRODUÇÃO (TEST_MODE=false desde 10/06/2026).
- Provisionamento automático: todo cliente novo (form, importador ou webhook Asaas) gera tarefa "Setup do cliente" com checklist do template setup-cliente (idempotente). Retroativo disponível na aba Setup para clientes sem IDs Google.
- Google Ads + GA4: sync de snapshots (diário, via dispatcher) e consultas ao vivo. Depende de credenciais nas env vars.
- Resend (email): 3 fluxos automáticos com toggle individual (relatório mensal→cliente, cobrança vencida→cliente, alerta crítico→operador). Desativados por padrão. Templates editáveis e CRIÁVEIS (personalizados custom-*) em /configuracoes/emails; envio manual por template via tool enviar_email (sempre com confirmação explícita do usuário). Templates no visual real da agência (banner + faixa amarela + rodapé Termos/Privacidade/Ajuda); textos reais em boas-vindas, suspensão, reativação, cancelamento, relatórios GA4/Google Ads, saldo baixo e saldo zerado. Emails de suspensão/cancelamento usam {{pagamento_url}} (link Asaas — preenchimento automático ainda pendente).
- Vertex AI Gemini: agente Gator (Flash), relatórios executivos (Pro), insights, copy, hashtags.
- WhatsApp: manual via links wa.me com biblioteca de 13 mensagens prontas — SEM automação (decisão de escopo).

CRONS: dispatcher único (GitHub Actions a cada 30 min + fallback diário no vercel.json às 12:00 UTC — plano Hobby da Vercel só permite cron diário) lê a tabela cron_settings e executa cada job — sync analytics, briefing matinal (gera e salva na tabela briefings, dashboard lê do banco), import Asaas, alertas, cobrança, arquivar congelados (move congelado há +N dias para inativo) — na primeira janela após o horário configurado, no máximo 1x por dia. Horários (fuso de Brasília) e liga/desliga configuráveis em Configurações → Automações → Agendamentos; a tool listar_agendamentos consulta o estado atual.

LACUNAS CONHECIDAS (pendências reais — sugestões nessas áreas são bem-vindas):
- Credenciais Google Ads/GA4 não configuradas nas env vars → analytics sem dados reais ainda.
- RBAC/RLS por usuário é parcial (isolamento por user_id na aplicação; usePermissoes existe mas não está ligado).
- Publicação real de posts via Meta API não existe (calendário é organizacional).
- Emails automáticos prontos porém toggles desligados.

COMO PROPOR MUDANÇA: você não lê nem altera o código-fonte. Quando uma ideia for aprovada pelo Lucas, escreva a spec (o quê, por quê, onde encaixa no Hub) e crie uma tarefa com criar_tarefa — o engenheiro (Claude) implementa a partir dela.
`.trim()
