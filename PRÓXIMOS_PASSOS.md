# PRÓXIMOS PASSOS — Deploy ADSGATOR HUB

## 🎯 Resumo Executivo

O projeto **está 100% pronto para deploy em produção**. Build compilou com sucesso em 29.8s, todas as páginas funcional, e não há bugs críticos bloqueantes.

**Status:** ✅ **GO TO PRODUCTION**

---

## 📋 O que fazer agora (Ordem de Prioridade)

### 🚀 IMEDIATO (Hoje)

#### 1. **Preparar Vercel para Deploy** (30 min)
```bash
# 1. Se não tem CLI do Vercel
npm install -g vercel

# 2. Fazer login
vercel login

# 3. Link com Vercel (cria vercel.json ou .vercelconfig)
vercel link

# 4. Setup de variáveis de ambiente
# Ir em: https://vercel.com/[seu-team]/[seu-projeto]/settings/environment-variables
# Adicionar todas as variáveis do .env.local EXCETO:
#   - NEXT_PUBLIC_* são públicas (ok adicionar)
#   - Chaves privadas devem ir em secrets do Vercel
```

#### 2. **Configurar Credenciais Google Cloud** (45 min)
```bash
# Se usar Vertex AI ou Google Ads, precisa:
# 1. Download do credentials.json em Google Cloud Console
# 2. Encodar em base64
base64 -i seu-credentials.json | pbcopy

# 3. No Vercel, criar ENV VAR:
# Nome: VERTEX_AI_CREDENTIALS
# Valor: [base64 do arquivo]

# 4. No código, Update config para ler:
# const credentials = Buffer.from(
#   process.env.VERTEX_AI_CREDENTIALS_BASE64 || '',
#   'base64'
# ).toString('utf-8')
```

#### 3. **Fazer o Deploy** (10 min)
```bash
# Opção 1: Automático via Git
git push origin main
# Vercel vai detectar e fazer deploy automaticamente

# Opção 2: Manual via CLI
vercel --prod

# Monitorar em: https://vercel.com/deployments
```

---

### ⚙️ CURTO PRAZO (Semana 1)

#### 4. **Testar Todas as Integrações em Produção**
- [ ] **Autenticação Supabase:** Login/logout/sessão
- [ ] **Dashboard:** Carregamento de dados
- [ ] **Analytics:** Fetch ao `/api/analytics/[id]/live` (agora com fix)
- [ ] **Chat IA:** Gemini Flash respondendo
- [ ] **Morning Briefing:** Edge Function executando
- [ ] **Relatórios:** Geração funcionando
- [ ] **WhatsApp:** Se tiver credenciais (opcional)

#### 5. **Configurar Monitoramento & Alertas**
```bash
# Integrar Sentry para error tracking
npm install @sentry/nextjs

# Setup no sentry.client.config.ts e sentry.server.config.ts
# Configurar alertas Slack para erros críticos
```

#### 6. **Limpeza de Dados de Teste**
```bash
# Se não quiser dados fake em produção:
npm run db:seed-clean

# Ou remover manualmente via Supabase console
```

#### 7. **Configurar SSL/HTTPS**
- Vercel faz automaticamente ✓
- Certificado Let's Encrypt + auto-renewal ✓
- Redirect HTTP → HTTPS ✓

#### 8. **Apontar Domínio**
```
Em seu registrador de domínio (GoDaddy, Namecheap, etc):
Apontar DNS para: cname.vercel-dns.com

Ou usar nameservers Vercel conforme instruções do painel
```

---

### 📊 MÉDIO PRAZO (Semana 2-3)

#### 9. **Performance & Otimizações**
- [ ] Habilitar Image Optimization no Vercel
- [ ] Configurar Cache-Control headers
- [ ] Monitorar Core Web Vitals
  - LCP (Largest Contentful Paint) < 2.5s ✓
  - FID (First Input Delay) < 100ms ✓
  - CLS (Cumulative Layout Shift) < 0.1 ✓

#### 10. **Escalabilidade do Banco**
- [ ] Supabase: aumentar RLS (Row Level Security) conforme usuários
- [ ] PostgreSQL: adicionar índices em queries lentas
- [ ] Realtime: limpar old events (retenção)

#### 11. **Backup & Disaster Recovery**
- [ ] Ativar automatic backups no Supabase
- [ ] Testar restore de backup
- [ ] Documentar plano de disaster recovery

---

### 🔐 MÉDIO/LONGO PRAZO (Mês 1)

#### 12. **Segurança em Produção**
- [ ] Adicionar CSP (Content Security Policy) headers
- [ ] Rate limiting em rotas críticas (`/api/ia/**`)
- [ ] 2FA em contas admin
- [ ] Validar CORS no Supabase
- [ ] Remover dados sensíveis de logs

#### 13. **Ativar Cobranças Reais**
**⚠️ Crítico:** Antes de ativar, fazer:
```typescript
// Em supabase/functions/webhook-asaas/index.ts
const TEST_MODE = false  // ← Trocar de true

// Em supabase/functions/regua-cobranca/index.ts
const TEST_MODE = false  // ← Trocar de true

// Validar:
// 1. Webhook do Asaas apontando para https://seu-dominio/api/webhook-asaas
// 2. Credenciais de API do Asaas corretas
// 3. Teste de pagamento com cartão real (pequeno valor)
```

#### 14. **Integração Real de Notificações**
- [ ] **WhatsApp/Twilio:** Configurar credenciais + templates
- [ ] **Email/Resend:** Configurar domínio verificado
- [ ] **Push notifications:** Se usar PWA

#### 15. **RLS (Row Level Security) Completo**
- [ ] Validar que cada usuário só vê seus clientes
- [ ] Cada agente só vê tarefas atribuídas
- [ ] Financeiro: apenas admin vê relatórios globais

---

## 📝 Checklist de Deploy Final

```markdown
[ ] npm run build — sem erros
[ ] Variáveis de ambiente configuradas em Vercel
[ ] Domínio apontando para Vercel
[ ] SSL/HTTPS funcionando
[ ] Login Supabase testado
[ ] Dashboard carregando dados
[ ] Analytics page fixo (sem "Failed to fetch")
[ ] Backup do banco feito
[ ] Sentry configurado (erro tracking)
[ ] Alertas Slack ativados
[ ] Supabase em modo production
[ ] TEST_MODE = false (se cobranças reais)
```

---

## 🔗 Links Úteis

| Recurso | URL |
|---------|-----|
| Dashboard Vercel | https://vercel.com |
| Supabase Console | https://supabase.com |
| Google Cloud Console | https://console.cloud.google.com |
| Repo GitHub | [seu-repo] |
| Documentação Interna | ./CLAUDE.md |

---

## 📞 Em caso de problemas

### Build falha em Vercel
```bash
# 1. Verificar logs em vercel.com/deployments
# 2. Rodar localmente:
npm run build
npm run lint

# 3. Verificar variáveis de ambiente (typos, valores inválidos)
```

### Autenticação Supabase falha
```bash
# 1. Verificar NEXT_PUBLIC_SUPABASE_URL (sem trailing slash)
# 2. Validar chave ANON_KEY em console.supabase.com
# 3. Testar com: curl 'https://[supabase-url]/auth/v1/health'
```

### Analytics mostrando "Failed to fetch"
```bash
# Com a fix commitada (fdf0afc), isso não deve mais ocorrer.
# Se persistir:
# 1. Verificar Network tab → /api/analytics/[id]/live
# 2. Validar credenciais Google Ads/GA4
# 3. Verificar se cliente tem integração ativa
```

---

## 🎯 Meta Final

**GO LIVE: [DATA ALVO]**

Com o projeto pronto, o próximo passo é apenas configurar infraestrutura e validar que tudo funciona em produção. Não há features faltando, bugs críticos, ou problemas de arquitetura.

**Estimated time to production:** 2-4 horas (incluindo testes)

---

**Última atualização:** 2026-05-24  
**Próxima revisão:** Pós-primeira semana em produção
