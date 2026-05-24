# DEPLOY CHECKLIST — ADSGATOR HUB

**Status: ✅ PRONTO PARA DEPLOY**

Data: 2026-05-24  
Versão: 0.1.0  
Build Status: ✓ Compilado com sucesso (29.8s)

---

## 📋 Pré-requisitos (Vercel/Produação)

- [ ] **Domínio registrado** (apontando para Vercel)
- [ ] **Variáveis de ambiente configuradas** no painel Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` — URL pública do Supabase
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave anônima do Supabase
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` — chave de serviço (privada)
  - [ ] `NEXT_PUBLIC_VERTEX_AI_PROJECT_ID` — ID do projeto Vertex AI
  - [ ] `VERTEX_AI_LOCATION` — região (ex: `us-central1`)
  - [ ] `VERTEX_AI_CREDENTIALS` — caminho para credenciais JSON do Google Cloud
  - [ ] `GOOGLE_ADS_CLIENT_ID` — OAuth client ID para Google Ads
  - [ ] `GOOGLE_ADS_CLIENT_SECRET` — OAuth secret
  - [ ] `GOOGLE_ADS_DEVELOPER_TOKEN` — token de desenvolvedor
  - [ ] `GOOGLE_ADS_REFRESH_TOKEN` — token de atualização (obtido via OAuth)
  - [ ] `GOOGLE_ADS_MANAGER_ID` — ID da conta gerenciadora (opcional)

---

## ✅ Status de Funcionalidades

### Implementado e Pronto
- [x] Shell de layout (TopBar, Sidebar, RightSidebar, StatusBar)
- [x] Tema dark/light com CSS vars
- [x] Autenticação Supabase (login/logout/sessão)
- [x] Módulo Clientes (lista, novo, detalhe `[id]`)
- [x] Módulo Financeiro (DRE, transações, inadimplentes)
- [x] Módulo Relatórios
- [x] Módulo Dashboard (grid, KPIs, morning briefing, chat IA)
- [x] Módulo Tarefas (CRUD, filtros, grouping, adiar)
- [x] Módulo Marketing (calendário, posts, KPIs)
- [x] Módulo Biblioteca (componentes Astro)
- [x] Módulo Configurações (7 abas)
- [x] Módulo Analytics (UI + filtros período)
- [x] Design system (cores, tipografia, animações)
- [x] Seed de dados de teste
- [x] Edge Functions (10+)
- [x] API routes (7 rotas)
- [x] `/api/ia/hashtags` ✓ (estava marcado como faltando)
- [x] `/clientes/[id]` ✓ (estava marcado como faltando)

### Requer Configuração Externa
- ⚠️ **Google Ads API** — credenciais OAuth + tokens
- ⚠️ **Google Analytics 4** — credenciais de serviço
- ⚠️ **Vertex AI** — conta Google Cloud configurada
- ⚠️ **WhatsApp/Twilio** — credenciais de integração (opcional)
- ⚠️ **Email/Resend** — chave de API (opcional)

### Modo de Teste Ativo (Production Ready ⚠️)
- ⚠️ `TEST_MODE = true` no webhook-asaas (não processa pagamentos reais)
- ⚠️ `TEST_MODE = true` na regua-cobranca (não cobra automaticamente)
- **Ação:** Antes de ativar cobranças reais, executar:
  ```bash
  # Em supabase/functions/webhook-asaas/index.ts e regua-cobranca/index.ts
  # Trocar TEST_MODE = true → TEST_MODE = false
  # Validar webhoaks Asaas configurados corretamente
  ```

---

## 🚀 Passos de Deploy (Vercel)

### 1. Commit & Push das Mudanças Locais
```bash
cd c:/PROJETOS/ADSGATOR/ADSGATOR_HUB
git add .
git commit -m "fix: analytics page useEffect — prevent empty clienteSel fetch"
git push origin main
```

### 2. Conectar Repositório ao Vercel
- Ir para https://vercel.com
- Importar repositório GitHub (ou GitLab)
- Selecionar `main` como branch padrão
- Framework: **Next.js 15** (auto-detectado)

### 3. Configurar Variáveis de Ambiente
No painel Vercel → Settings → Environment Variables:

**Essenciais:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxx...
NEXT_PUBLIC_VERTEX_AI_PROJECT_ID=meu-projeto-123456
VERTEX_AI_CREDENTIALS=/app/credentials.json
```

**Integração Google Ads:**
```
GOOGLE_ADS_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=xxx
GOOGLE_ADS_DEVELOPER_TOKEN=xxx
GOOGLE_ADS_REFRESH_TOKEN=xxx (obtido via OAuth)
```

### 4. Configurar Credenciais Google Cloud
Se usar Vertex AI ou Google Ads, é preciso:
1. Criar arquivo `credentials.json` com chave de serviço
2. **Não commitar** no repo (adicionar ao `.gitignore`)
3. Fazer upload como Environment Variable no Vercel (base64 encoded)
   ```bash
   # Opção: usar file base64
   base64 -i credentials.json | pbcopy
   # No Vercel: ENV VAR = GOOGLE_CLOUD_CREDENTIALS_BASE64 = [conteúdo]
   ```

### 5. Deploy Automático
```bash
git push origin main
# Vercel detecta push → inicia build automático
# Monitore em https://vercel.com/deployments
```

Ou manual:
```bash
npm install -g vercel
vercel --prod
```

### 6. Validar Build & Deployment
- [ ] Build completa sem erros (tempo esperado: ~60-90s)
- [ ] Todas as páginas carregam (404s em `/` são normais)
- [ ] Autenticação Supabase funciona
- [ ] Dashboard carrega dados

---

## 🔍 Teste Pré-Deploy (Local)

```bash
# 1. Validar build local
npm run build

# 2. Testar servidor de produção
npm run start

# 3. Verificar com TypeScript
npx tsc --noEmit

# 4. Validar lint
npm run lint
```

---

## 📊 Build Report (29.8s)

✓ **22 páginas geradas com sucesso**

| Métrica | Valor |
|---------|-------|
| Tempo compilação | 29.8s |
| Pages estáticas | 22 |
| Pages dinâmicas | 3 (`/clientes/[id]`, `/api/**`) |
| First Load JS | 102-341 KB |
| Largest bundle | `/analytics` (335 kB) |
| Chunks otimizados | 3 |

---

## 🎯 Checklist Final

### Antes de ir ao ar:
- [ ] Variáveis de ambiente validadas
- [ ] Build local passou sem erros
- [ ] Testes de autenticação OK
- [ ] Dados de teste limpados ou mascarados
- [ ] Limites de rate-limiting configurados (opcional)
- [ ] Analytics/Monitoring configurado (Sentry, LogRocket, etc.)
- [ ] SSL/HTTPS validado (Vercel fornece automaticamente)
- [ ] Domínio apontando para Vercel
- [ ] Backup de banco de dados criado

### Edge Functions (Supabase)
- [ ] Todas as 10 functions deployadas
- [ ] Secrets configurados em `supabase/secrets.json`
- [ ] Webhooks Asaas apontando corretamente
- [ ] Limites de invocação ajustados

### Monitoramento Pós-Deploy
- [ ] Erros de 50x monitorados
- [ ] Performance de p95 < 1s
- [ ] Alertas configurados para erros críticos
- [ ] Backup automático do Supabase ativo

---

## 🌍 URLs Esperadas Após Deploy

```
https://adsgator-hub.vercel.app/              → /dashboard
https://adsgator-hub.vercel.app/login         → Tela de login
https://adsgator-hub.vercel.app/clientes      → Lista de clientes
https://adsgator-hub.vercel.app/dashboard     → Home
https://adsgator-hub.vercel.app/analytics     → Analytics
```

---

## ⚡ Otimizações Recomendadas Pós-Deploy

1. **Performance**
   - Habilitar Image Optimization (Vercel OG)
   - Configurar Cache-Control headers
   - Monitorar Core Web Vitals

2. **Segurança**
   - Adicionar CSP headers
   - Validar CORS no Supabase
   - Ativar 2FA em contas críticas

3. **Observabilidade**
   - Integrar Sentry para error tracking
   - Setup de alertas Slack
   - Dashboard de custom metrics

4. **Escalabilidade**
   - Aumentar limites Supabase conforme volume
   - Configurar CDN para assets estáticos
   - Auto-scaling de Edge Functions

---

## 📞 Suporte & Referências

- **Vercel Deploy:** https://vercel.com/docs/frameworks/nextjs
- **Supabase Production:** https://supabase.com/docs/guides/platform/going-to-prod
- **Next.js Build:** https://nextjs.org/docs/app/building-your-application/deploying
- **Google Cloud Setup:** https://cloud.google.com/docs/authentication/service-accounts

---

**Última atualização:** 2026-05-24  
**Responsável:** AdsGator Chief Engineer
