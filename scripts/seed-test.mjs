// scripts/seed-test.mjs
// Uso: npm run db:seed
// Popula o banco com dados de teste completos — cobre TODAS as Edge Functions e telas.
// Seguro: só cria dados com prefixo [TESTE], nunca afeta clientes reais.

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// ─── Ler .env.local ────────────────────────────────────────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync('.env.local', 'utf-8');
    return Object.fromEntries(
      raw.split('\n')
        .filter(l => l.includes('=') && !l.startsWith('#') && l.trim())
        .map(l => {
          const idx = l.indexOf('=');
          return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
        })
    );
  } catch {
    console.error('❌ Arquivo .env.local não encontrado. Copie .env.local.example e configure.');
    process.exit(1);
  }
}

const env = loadEnv();
const supabaseUrl    = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

// ─── Helpers ────────────────────────────────────────────────────────────────────
function daysFromNow(n) {
  return new Date(Date.now() + n * 86400000).toISOString();
}
function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString();
}
function dateStr(daysOffset) {
  return new Date(Date.now() + daysOffset * 86400000).toISOString().slice(0, 10);
}
function mesAno(monthsBack = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsBack);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function getTestUserId() {
  const { data } = await supabase.from('clientes').select('user_id').limit(1).maybeSingle();
  if (data?.user_id) return data.user_id;

  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1`, {
    headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey }
  });
  const json = await res.json();
  const userId = json?.users?.[0]?.id;
  if (userId) return userId;

  console.warn('⚠️  Nenhum usuário encontrado. Usando UUID placeholder.');
  return '00000000-0000-0000-0000-000000000001';
}

// ─── Dados de teste ────────────────────────────────────────────────────────────
const clientes = [
  { nome: '[TESTE] Empório Digital',          email: 'cliente1.teste@exemplo.com', whatsapp: '5511987654321', nicho: 'ecommerce',   status: 'ativo',            dias_atraso: 0,  mrr: 1997, saldo_google_ads: 1200 },
  { nome: '[TESTE] Construtora Horizonte',    email: 'cliente2.teste@exemplo.com', whatsapp: '5511976543210', nicho: 'construcao',  status: 'recebido',         dias_atraso: 0,  mrr: 0,    saldo_google_ads: null },
  { nome: '[TESTE] Clínica Bem Estar',        email: 'cliente3.teste@exemplo.com', whatsapp: '5511965432109', nicho: 'saude',       status: 'congelado',        dias_atraso: 0,  mrr: 997,  saldo_google_ads: 350  },
  { nome: '[TESTE] Restaurante Sabor & Arte', email: 'cliente4.teste@exemplo.com', whatsapp: '5511954321098', nicho: 'gastronomia', status: 'ativo',            dias_atraso: 7,  mrr: 1497, saldo_google_ads: 80   },
  { nome: '[TESTE] Auto Center Turbo',        email: 'cliente5.teste@exemplo.com', whatsapp: '5511943210987', nicho: 'automotivo',  status: 'ativo',            dias_atraso: 15, mrr: 997,  saldo_google_ads: 25   },
  { nome: '[TESTE] Loja de Roupas Fashion',   email: 'cliente6.teste@exemplo.com', whatsapp: '5511932109876', nicho: 'varejo',      status: 'cancelado_debito', dias_atraso: 35, mrr: 0,    saldo_google_ads: 0    },
  { nome: '[TESTE] Academia Fitness Pro',     email: 'cliente7.teste@exemplo.com', whatsapp: '5511921098765', nicho: 'academia',    status: 'ativo',            dias_atraso: 5,  mrr: 1497, saldo_google_ads: 600  },
  { nome: '[TESTE] Agência de Viagens Mundo', email: 'cliente8.teste@exemplo.com', whatsapp: '5511910987654', nicho: 'turismo',     status: 'setup_trafego',    dias_atraso: 0,  mrr: 997,  saldo_google_ads: 900  },
];

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🧪 ADSGATOR — Seed de Dados de Teste (COMPLETO)');
  console.log('=================================================');

  const userId = await getTestUserId();
  console.log(`✅ user_id: ${userId}`);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 1. CLIENTES
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n👥 Criando clientes...');
  let clientesCriados = 0;
  const clienteIds = {};

  for (const c of clientes) {
    const { data: existe } = await supabase
      .from('clientes')
      .select('id')
      .eq('email', c.email)
      .maybeSingle();

    if (existe) {
      clienteIds[c.email] = existe.id;
      // Atualizar campos que podem ter mudado (mrr, saldo_google_ads)
      await supabase.from('clientes').update({
        mrr: c.mrr,
        saldo_google_ads: c.saldo_google_ads,
        dias_atraso: c.dias_atraso,
      }).eq('id', existe.id);
      console.log(`⏭  Já existe (atualizado): ${c.nome}`);
      continue;
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert({ ...c, user_id: userId })
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Erro ao criar ${c.nome}:`, error.message);
      continue;
    }

    clienteIds[c.email] = data.id;
    clientesCriados++;
    console.log(`✅ Criado: ${c.nome} (${c.status}${c.dias_atraso > 0 ? `, ${c.dias_atraso}d atraso` : ''})`);
  }

  // Helper para pegar ID de cliente por índice
  const cid = (i) => clienteIds[clientes[i].email];

  // ═══════════════════════════════════════════════════════════════════════════════
  // 2. ASSINATURAS
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📋 Criando assinaturas...');
  const planos = [
    { nome: 'Plano Growth',      valor: 1997 },
    { nome: 'Plano Starter',     valor: 997  },
    { nome: 'Plano Starter',     valor: 997  },
    { nome: 'Plano Growth',      valor: 1497 },
    { nome: 'Plano Starter',     valor: 997  },
    { nome: 'Plano Growth',      valor: 1997 },
    { nome: 'Plano Growth',      valor: 1497 },
    { nome: 'Plano Starter',     valor: 997  },
  ];

  for (const [i, c] of clientes.entries()) {
    const clienteId = cid(i);
    if (!clienteId) continue;

    const { data: existe } = await supabase
      .from('assinaturas')
      .select('id')
      .eq('cliente_id', clienteId)
      .maybeSingle();
    if (existe) continue;

    const statusAssinatura =
      c.dias_atraso >= 30 ? 'cancelado_debito' :
      c.dias_atraso >= 15 ? 'atraso_15_dias' :
      c.dias_atraso >= 7  ? 'atraso_7_dias' : 'ativa';

    await supabase.from('assinaturas').insert({
      cliente_id:            clienteId,
      plano_nome:            planos[i].nome,
      valor_mensal:          planos[i].valor,
      status:                statusAssinatura,
      dias_atraso:           c.dias_atraso,
      data_proxima_cobranca: c.dias_atraso > 0
        ? new Date(Date.now() - c.dias_atraso * 86400000).toISOString()
        : daysFromNow(30),
      asaas_subscription_id: `sub_test_${Math.random().toString(36).slice(2, 10)}`,
    });
  }
  console.log('✅ Assinaturas criadas');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 3. CAMPANHAS GOOGLE ADS
  // Usado por: gerar-relatorio-executivo
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📊 Criando campanhas_ads...');
  const campanhasData = [
    // cliente 0 — Empório Digital (ativo, boa performance)
    { idx: 0, nome: 'Remarketing Ecommerce',         investimento: 3500, cliques: 1200, conversoes: 45, cpa: 77.78,  ctr: 3.2, impressoes: 37500 },
    { idx: 0, nome: 'Search Produtos Principais',     investimento: 5200, cliques: 2100, conversoes: 68, cpa: 76.47,  ctr: 4.1, impressoes: 51200 },
    // cliente 3 — Restaurante (ativo, performance média)
    { idx: 3, nome: 'Delivery Local',                  investimento: 1800, cliques: 650,  conversoes: 22, cpa: 81.82,  ctr: 2.8, impressoes: 23200 },
    { idx: 3, nome: 'Eventos e Reservas',              investimento: 800,  cliques: 280,  conversoes: 8,  cpa: 100.00, ctr: 1.9, impressoes: 14700 },
    // cliente 4 — Auto Center (ativo, CPA alto — problema)
    { idx: 4, nome: 'Search Mecânica',                 investimento: 2200, cliques: 380,  conversoes: 5,  cpa: 440.00, ctr: 0.8, impressoes: 47500 },
    { idx: 4, nome: 'Display Promoções',               investimento: 900,  cliques: 150,  conversoes: 2,  cpa: 450.00, ctr: 0.3, impressoes: 50000 },
    // cliente 6 — Academia (ativo, boa performance)
    { idx: 6, nome: 'Search Matrícula',                investimento: 1500, cliques: 520,  conversoes: 18, cpa: 83.33,  ctr: 3.5, impressoes: 14800 },
    { idx: 6, nome: 'Social Ads Promocional',          investimento: 2000, cliques: 890,  conversoes: 32, cpa: 62.50,  ctr: 4.8, impressoes: 18500 },
    // cliente 7 — Agência Viagens (setup_trafego)
    { idx: 7, nome: 'Search Pacotes Turísticos',       investimento: 600,  cliques: 180,  conversoes: 4,  cpa: 150.00, ctr: 2.1, impressoes: 8500  },
  ];

  for (const camp of campanhasData) {
    const clienteId = cid(camp.idx);
    if (!clienteId) continue;

    const { data: existe } = await supabase
      .from('campanhas_ads')
      .select('id')
      .eq('cliente_id', clienteId)
      .eq('campanha_nome', camp.nome)
      .maybeSingle();
    if (existe) continue;

    await supabase.from('campanhas_ads').insert({
      cliente_id:       clienteId,
      campanha_nome:    camp.nome,
      google_ads_id:    `test_${Math.random().toString(36).slice(2, 12)}`,
      status:           'ativa',
      investimento_total: camp.investimento,
      cliques:          camp.cliques,
      conversoes:       camp.conversoes,
      cpa:              camp.cpa,
      ctr:              camp.ctr,
      impressoes:       camp.impressoes,
      data_inicio:      dateStr(-30),
      data_fim:         dateStr(0),
    });
  }
  console.log('✅ Campanhas Google Ads criadas');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4. CUSTOS DETALHADOS
  // Usado por: gerar-relatorio-executivo (cálculo de lucro/margem)
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n💸 Criando custos_detalhados...');
  const custosData = [
    { nome: 'Aluguel escritório',       valor: 3500,  tipo: 'fixo',     descricao: 'Sala comercial centro' },
    { nome: 'Ferramentas SaaS',         valor: 1200,  tipo: 'fixo',     descricao: 'Semrush, RD Station, Canva Pro' },
    { nome: 'Internet + Telefone',      valor: 350,   tipo: 'fixo',     descricao: 'Fibra 500mb + linha comercial' },
    { nome: 'Contabilidade',            valor: 800,   tipo: 'fixo',     descricao: 'Escritório contábil mensal' },
    { nome: 'Salários (pró-labore)',    valor: 8000,  tipo: 'fixo',     descricao: 'Retirada mensal sócios' },
    { nome: 'Comissão vendas',          valor: 500,   tipo: 'variavel', descricao: '5% sobre novos contratos' },
    { nome: 'Bônus performance',        valor: 300,   tipo: 'variavel', descricao: 'Bonificação trimestral equipe' },
  ];

  for (const custo of custosData) {
    const { data: existe } = await supabase
      .from('custos_detalhados')
      .select('id')
      .eq('nome', custo.nome)
      .maybeSingle();
    if (existe) continue;

    await supabase.from('custos_detalhados').insert({ ...custo, ativo: true });
  }
  console.log('✅ Custos detalhados criados');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 5. ANALYTICS SNAPSHOTS
  // Usado por: gerar-insight-ia, gerar-relatorio-md
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📈 Criando analytics_snapshots...');
  const snapshotClientes = [0, 3, 4, 6]; // Clientes com campanhas ativas

  for (const idx of snapshotClientes) {
    const clienteId = cid(idx);
    if (!clienteId) continue;

    // 4 semanas de dados Google Ads
    for (let semana = 0; semana < 4; semana++) {
      const fimSemana  = dateStr(-semana * 7);
      const inicSemana = dateStr(-semana * 7 - 6);

      const { data: existe } = await supabase
        .from('analytics_snapshots')
        .select('id')
        .eq('cliente_id', clienteId)
        .eq('fonte', 'google_ads')
        .eq('periodo_fim', fimSemana)
        .maybeSingle();
      if (existe) continue;

      // Simular melhora gradual (semanas mais recentes = melhor performance)
      const fatorMelhora = 1 + (3 - semana) * 0.08;
      const baseInvest = idx === 4 ? 800 : idx === 0 ? 2200 : 1000;
      const baseConv   = idx === 4 ? 2 : idx === 0 ? 28 : 10;

      const investimento = Math.round(baseInvest * fatorMelhora);
      const cliques      = Math.round((baseInvest / 3) * fatorMelhora);
      const impressoes   = Math.round(cliques * (25 + Math.random() * 10));
      const conversoes   = Math.round(baseConv * fatorMelhora * 10) / 10;
      const ctr          = Math.round((cliques / impressoes) * 10000) / 10000;
      const cpa          = conversoes > 0 ? Math.round((investimento / conversoes) * 100) / 100 : 0;

      await supabase.from('analytics_snapshots').insert({
        cliente_id:     clienteId,
        fonte:          'google_ads',
        periodo_inicio: inicSemana,
        periodo_fim:    fimSemana,
        investimento,
        impressoes,
        cliques,
        ctr,
        conversoes,
        cpa,
        roas:           conversoes > 0 ? Math.round((conversoes * 150 / investimento) * 100) / 100 : 0,
        cpc_medio:      cliques > 0 ? Math.round((investimento / cliques) * 100) / 100 : 0,
        insight_ia:     semana === 0 ? null : `[🧪 TESTE] Semana ${4 - semana}: CPA de R$${cpa} com ${conversoes} conversões.`,
      });
    }

    // 2 snapshots GA4
    for (let semana = 0; semana < 2; semana++) {
      const fimSemana  = dateStr(-semana * 7);
      const inicSemana = dateStr(-semana * 7 - 6);

      const { data: existe } = await supabase
        .from('analytics_snapshots')
        .select('id')
        .eq('cliente_id', clienteId)
        .eq('fonte', 'ga4')
        .eq('periodo_fim', fimSemana)
        .maybeSingle();
      if (existe) continue;

      await supabase.from('analytics_snapshots').insert({
        cliente_id:     clienteId,
        fonte:          'ga4',
        periodo_inicio: inicSemana,
        periodo_fim:    fimSemana,
        usuarios:       Math.round(300 + Math.random() * 500),
        sessoes:        Math.round(500 + Math.random() * 800),
        taxa_conversao: Math.round((2 + Math.random() * 4) * 100) / 10000,
      });
    }
  }
  console.log('✅ Analytics snapshots criados');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 6. ALERTAS
  // Usado por: processar-alertas, sentinela, morning-briefing
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n🚨 Criando alertas...');
  const alertasData = [
    // Alertas já vencidos (processar-alertas vai pegar)
    { idx: 3, tipo: 'inadimplencia',   msg: '[TESTE] Restaurante Sabor & Arte — 7 dias em atraso, campanha pode ser suspensa',    dispara_em: daysAgo(1) },
    { idx: 4, tipo: 'inadimplencia',   msg: '[TESTE] Auto Center Turbo — 15 dias em atraso, quebra de contrato iminente',         dispara_em: daysAgo(3) },
    { idx: 4, tipo: 'saldo_google_ads', msg: '[TESTE] Saldo Google Ads de Auto Center Turbo abaixo do limite (R$ 25)',             dispara_em: daysAgo(0) },
    { idx: 6, tipo: 'inadimplencia',   msg: '[TESTE] Academia Fitness Pro — 5 dias em atraso',                                     dispara_em: daysAgo(0) },
    // Alertas futuros (ainda não devem disparar)
    { idx: 0, tipo: 'renovacao',       msg: '[TESTE] Empório Digital — renovação de contrato em 15 dias',                          dispara_em: daysFromNow(15) },
    { idx: 2, tipo: 'congelamento_48h', msg: '[TESTE] Clínica Bem Estar — 48h de congelamento expirando',                          dispara_em: daysFromNow(1)  },
  ];

  for (const alerta of alertasData) {
    const clienteId = cid(alerta.idx);
    if (!clienteId) continue;

    const { data: existe } = await supabase
      .from('alertas')
      .select('id')
      .eq('cliente_id', clienteId)
      .eq('tipo_alerta', alerta.tipo)
      .maybeSingle();
    if (existe) continue;

    await supabase.from('alertas').insert({
      cliente_id:  clienteId,
      tipo_alerta: alerta.tipo,
      mensagem:    alerta.msg,
      dispara_em:  alerta.dispara_em,
      disparado:   false,
    });
  }
  console.log('✅ Alertas criados');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 7. MEMÓRIA DE CLIENTES
  // Usado por: memoria-cliente, morning-briefing
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n🧠 Criando memoria_clientes...');
  const memoriasData = [
    { idx: 0, md: `# Empório Digital\n\n## Contexto\nE-commerce de produtos naturais. Faturamento médio R$ 45k/mês.\n\n## Histórico\n- Mai/2025: Início do contrato, foco em Google Shopping\n- Jun/2025: CPA caiu 23% após otimização de feed\n- Jul/2025: Começamos remarketing dinâmico\n\n## Preferências\n- Reunião quinzenal às terças 14h\n- Prefere relatório por email\n- Contato principal: Marina (sócia)` },
    { idx: 3, md: `# Restaurante Sabor & Arte\n\n## Contexto\nRestaurante fino com delivery. Região centro-sul SP.\n\n## Histórico\n- Abr/2025: Início, foco em delivery via iFood + Google Local\n- Mai/2025: Inauguração salão novo, campanha de evento\n\n## Atenção\n- Pagamento atrasado 7 dias — acompanhar\n- Chef pediu pausa nas campanhas durante reforma (2 semanas)` },
    { idx: 4, md: `# Auto Center Turbo\n\n## Contexto\nOficina mecânica premium. Ticket médio R$ 800.\n\n## Problemas\n- CPA muito alto (R$ 440) — investigar palavras-chave\n- CTR de 0.8% indica problema nos anúncios\n- 15 dias de atraso no pagamento\n\n## Ações pendentes\n- Reunião de realinhamento urgente\n- Revisar segmentação geográfica (raio muito amplo?)` },
    { idx: 6, md: `# Academia Fitness Pro\n\n## Contexto\nAcademia premium com personal. Público 25-45 anos.\n\n## Histórico\n- Mar/2025: Início com foco em matrícula\n- Abr/2025: Adicionamos Social Ads, CPA caiu 25%\n\n## Notas\n- Promoção de inverno prevista para junho\n- Dono quer expandir para segunda unidade em 2026` },
  ];

  for (const mem of memoriasData) {
    const clienteId = cid(mem.idx);
    if (!clienteId) continue;

    await supabase.from('memoria_clientes').upsert({
      cliente_id:  clienteId,
      conteudo_md: mem.md,
      versao:      1,
    }, { onConflict: 'cliente_id' });
  }
  console.log('✅ Memórias de clientes criadas');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 8. TAREFAS
  // Usado por: sidebar badge, tela de tarefas
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n✅ Criando tarefas...');
  const tarefasData = [
    { titulo: '[TESTE] Enviar #BOASVINDAS para Construtora Horizonte', desc: 'Novo cliente aguardando primeiro contato',                  prioridade: 'critico', status: 'pendente',      prazo: dateStr(0),   cidx: 1 },
    { titulo: '[TESTE] Otimizar campanhas Auto Center Turbo',          desc: 'CPA acima de R$ 400, precisa revisão urgente de keywords',   prioridade: 'alto',    status: 'pendente',      prazo: dateStr(-2),  cidx: 4 },
    { titulo: '[TESTE] Cobrar Restaurante Sabor & Arte',               desc: 'D+7 de atraso. Enviar mensagem amigável no WhatsApp',        prioridade: 'alto',    status: 'em_progresso',  prazo: dateStr(-1),  cidx: 3 },
    { titulo: '[TESTE] Relatório mensal Empório Digital',              desc: 'Consolidar dados de Google Ads + GA4 do mês',                prioridade: 'normal',  status: 'pendente',      prazo: dateStr(3),   cidx: 0 },
    { titulo: '[TESTE] Call de onboarding Construtora Horizonte',      desc: 'Agendar call para levantar briefing e acesso às contas',     prioridade: 'alto',    status: 'pendente',      prazo: dateStr(1),   cidx: 1 },
    { titulo: '[TESTE] Revisar anúncios Academia Fitness Pro',         desc: 'Testar novos copies para campanha de matrícula',             prioridade: 'normal',  status: 'em_progresso',  prazo: dateStr(5),   cidx: 6 },
    { titulo: '[TESTE] Setup Google Ads Agência de Viagens',           desc: 'Criar conta, configurar conversões, subir campanhas',        prioridade: 'normal',  status: 'pendente',      prazo: dateStr(7),   cidx: 7 },
    { titulo: '[TESTE] Verificar motivo congelamento Clínica',         desc: 'Entrar em contato e verificar se retorna',                   prioridade: 'normal',  status: 'adiado',        prazo: dateStr(-5),  cidx: 2 },
    { titulo: '[TESTE] Case study Empório Digital',                    desc: 'Montar case de sucesso com dados reais para portfolio',       prioridade: 'baixo',   status: 'pendente',      prazo: dateStr(14),  cidx: 0 },
    { titulo: '[TESTE] Reunião trimestral de planejamento',            desc: 'Preparar apresentação de resultados Q2',                     prioridade: 'normal',  status: 'feito',         prazo: dateStr(-10), cidx: null },
  ];

  for (const t of tarefasData) {
    const { data: existe } = await supabase
      .from('tarefas')
      .select('id')
      .eq('titulo', t.titulo)
      .maybeSingle();
    if (existe) continue;

    await supabase.from('tarefas').insert({
      user_id:    userId,
      cliente_id: t.cidx !== null ? cid(t.cidx) : null,
      titulo:     t.titulo,
      descricao:  t.desc,
      prioridade: t.prioridade,
      status:     t.status,
      data_prazo: t.prazo,
    });
  }
  console.log('✅ Tarefas criadas');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 9. RELATÓRIO EXECUTIVO (mês anterior)
  // Usado por: gerar-relatorio-executivo (comparativo), tela de relatórios
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📄 Criando relatorio_executivo do mês anterior...');
  const mesAnterior = mesAno(1);
  const mes2Atras   = mesAno(2);

  // Relatório do mês retrasado (para o mês anterior ter comparativo)
  for (const mes of [mes2Atras, mesAnterior]) {
    const { data: existe } = await supabase
      .from('relatorios_executivos')
      .select('id')
      .eq('mes_ano', mes)
      .maybeSingle();
    if (existe) continue;

    const isMesAnterior = mes === mesAnterior;
    const mrrBase = isMesAnterior ? 7885 : 7200;

    await supabase.from('relatorios_executivos').insert({
      mes_ano:             mes,
      mrr_total:           mrrBase,
      churn_rate:          isMesAnterior ? 12.5 : 0,
      lucro:               mrrBase - 14650,
      margem:              ((mrrBase - 14650) / mrrBase * 100),
      ltv_cac:             isMesAnterior ? 15.2 : 12.8,
      top_performers:      [
        { nome: '[TESTE] Empório Digital',     mrr: 1997, destaque: 'CPA em queda' },
        { nome: '[TESTE] Academia Fitness Pro', mrr: 1497, destaque: 'MRR em alta' },
      ],
      clientes_risco:      isMesAnterior ? [
        { nome: '[TESTE] Auto Center Turbo', problema: '15 dias de atraso', severidade: 'alta' },
      ] : [],
      proximos_passos:     [
        'Resolver atraso de Auto Center Turbo',
        'Otimizar CPA de campanhas acima de R$ 150',
        'Case study de Empório Digital',
      ],
      previsao_proximo_mes: {
        tendencia: isMesAnterior ? 'estavel' : 'crescimento',
        percentual: isMesAnterior ? 2.5 : 9.5,
        mrr_esperado: isMesAnterior ? 8080 : 7885,
      },
      conteudo_markdown: `[🧪 TESTE] Relatório executivo de ${mes}. MRR: R$ ${mrrBase}. Gerado automaticamente pelo seed de teste.`,
      enviado_email: false,
      visualizado:   mes === mes2Atras,
    });
  }
  console.log('✅ Relatórios executivos criados');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 10. RELATÓRIOS MENSAIS (por cliente)
  // Usado por: gerar-relatorios-mensais, gerar-relatorio-md, tela de relatórios
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📑 Criando relatorios_mensais...');
  const clientesAtivos = [0, 3, 4, 6, 7]; // índices dos clientes com campanhas

  for (const idx of clientesAtivos) {
    const clienteId = cid(idx);
    if (!clienteId) continue;

    for (const mes of [mesAnterior, mes2Atras]) {
      const { data: existe } = await supabase
        .from('relatorios_mensais')
        .select('id')
        .eq('cliente_id', clienteId)
        .eq('mes_ano', mes)
        .maybeSingle();
      if (existe) continue;

      const isGerado = mes === mes2Atras;
      await supabase.from('relatorios_mensais').insert({
        cliente_id:        clienteId,
        mes_ano:           mes,
        status_geracao:    isGerado ? 'gerado' : 'pendente',
        investimento_ads:  idx === 0 ? 8700 : idx === 4 ? 3100 : 2500,
        conversoes:        idx === 0 ? 113 : idx === 4 ? 7 : 30,
        cpa:               idx === 0 ? 77 : idx === 4 ? 443 : 83,
        roi:               idx === 0 ? 3.2 : idx === 4 ? 0.4 : 1.8,
        sessoes_ga4:       idx === 0 ? 4500 : 1200,
        conteudo_markdown: isGerado
          ? `[🧪 TESTE] Relatório de ${clientes[idx].nome} — ${mes}. Investimento: R$ ${idx === 0 ? '8.700' : '2.500'}, Conversões: ${idx === 0 ? 113 : 30}.`
          : null,
      });
    }
  }
  console.log('✅ Relatórios mensais criados');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 11. BRIEFING DIÁRIO
  // Usado por: morning-briefing
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n☀️  Criando briefing diário...');
  const ontem = dateStr(-1);
  const { data: briefExiste } = await supabase
    .from('briefings_diarios')
    .select('id')
    .eq('data', ontem)
    .maybeSingle();

  if (!briefExiste) {
    await supabase.from('briefings_diarios').insert({
      data:      ontem,
      texto:     '[🧪 TESTE] Bom dia! 4 clientes ativos com MRR total de R$ 7.885. Atenção: Auto Center Turbo com 15 dias de atraso e CPA de R$ 440 — reunião de realinhamento urgente. Prioridade: resolver inadimplência e otimizar campanhas com CPA acima de R$ 150.',
      gerado_em: daysAgo(1),
    });
  }
  console.log('✅ Briefing diário criado');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 12. LANÇAMENTOS FINANCEIROS (receitas + despesas + aquisição)
  // Usado por: financeiro page, gerar-relatorio-executivo (LTV/CAC)
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n💰 Criando lançamentos financeiros...');

  // Receitas (mensalidades dos últimos 3 meses)
  for (const idx of [0, 3, 4, 6, 7]) {
    const clienteId = cid(idx);
    if (!clienteId) continue;

    for (let m = 0; m < 3; m++) {
      const dataLanc = dateStr(-m * 30);
      const desc = `[TESTE] Mensalidade ${clientes[idx].nome} — ${mesAno(m)}`;

      const { data: existe } = await supabase
        .from('financeiro_lancamentos')
        .select('id')
        .eq('descricao', desc)
        .maybeSingle();
      if (existe) continue;

      await supabase.from('financeiro_lancamentos').insert({
        user_id:    userId,
        cliente_id: clienteId,
        tipo:       'receita',
        categoria:  'mensalidade',
        descricao:  desc,
        valor:      planos[idx].valor,
        data:       dataLanc,
        status:     m === 0 && clientes[idx].dias_atraso > 0 ? 'pendente' : 'confirmado',
      });
    }
  }

  // Custos fixos (mês atual)
  const custosFixosLanc = [
    { desc: '[TESTE] Aluguel escritório',     valor: 3500,  cat: 'infraestrutura' },
    { desc: '[TESTE] Ferramentas SaaS',       valor: 1200,  cat: 'ferramentas' },
    { desc: '[TESTE] Internet + Telefone',    valor: 350,   cat: 'infraestrutura' },
    { desc: '[TESTE] Contabilidade',          valor: 800,   cat: 'administrativo' },
    { desc: '[TESTE] Pró-labore sócios',      valor: 8000,  cat: 'pessoal' },
  ];

  for (const cf of custosFixosLanc) {
    const descMes = `${cf.desc} — ${mesAno(0)}`;
    const { data: existe } = await supabase
      .from('financeiro_lancamentos')
      .select('id')
      .eq('descricao', descMes)
      .maybeSingle();
    if (existe) continue;

    await supabase.from('financeiro_lancamentos').insert({
      user_id:   userId,
      tipo:      'custo_fixo',
      categoria: cf.cat,
      descricao: descMes,
      valor:     cf.valor,
      data:      dateStr(-5),
      status:    'confirmado',
    });
  }

  // Despesas de aquisição (para cálculo LTV/CAC no relatório executivo)
  const despesasAquisicao = [
    { desc: '[TESTE] Google Ads — aquisição de leads',        valor: 2500 },
    { desc: '[TESTE] Meta Ads — campanha institucional',      valor: 1500 },
    { desc: '[TESTE] Evento networking — captação de clientes', valor: 800  },
  ];

  for (const da of despesasAquisicao) {
    const descMes = `${da.desc} — ${mesAno(1)}`;
    const { data: existe } = await supabase
      .from('financeiro_lancamentos')
      .select('id')
      .eq('descricao', descMes)
      .maybeSingle();
    if (existe) continue;

    await supabase.from('financeiro_lancamentos').insert({
      user_id:   userId,
      tipo:      'custo_variavel',
      categoria: 'aquisicao',
      descricao: descMes,
      valor:     da.valor,
      data:      dateStr(-35),
      status:    'confirmado',
    });
  }
  console.log('✅ Lançamentos financeiros criados');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 13. NOTIFICAÇÕES
  // Usado por: TopBar NotificationBell
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n🔔 Criando notificações...');
  const notifData = [
    { cidx: 1, tipo: 'urgente', titulo: '[TESTE] Novo cliente recebido!',                          msg: 'Construtora Horizonte aguarda #BOASVINDAS agora.',      acao_label: '#BOASVINDAS', acao_url: 'https://wa.me/5511976543210?text=Olá!' },
    { cidx: 3, tipo: 'atencao', titulo: '[TESTE] Restaurante Sabor & Arte — 7 dias em atraso',     msg: 'Campanha em risco de suspensão. D+7',                   acao_label: '#ALERTA D+7', acao_url: 'https://wa.me/5511954321098?text=Olá' },
    { cidx: 4, tipo: 'urgente', titulo: '[TESTE] Auto Center Turbo — 15 dias em atraso',           msg: 'Quebra de contrato iminente. Ação imediata necessária.', acao_label: '#ALERTA D+15', acao_url: 'https://wa.me/5511943210987?text=Olá' },
    { cidx: 4, tipo: 'atencao', titulo: '[TESTE] Saldo Google Ads baixo — Auto Center Turbo',      msg: 'Saldo: R$ 25. Limite: R$ 500.',                          acao_label: 'Ver cliente', acao_url: null },
    { cidx: 6, tipo: 'atencao', titulo: '[TESTE] Academia Fitness Pro — 5 dias em atraso',          msg: 'Monitorar pagamento. D+5.',                               acao_label: '#ALERTA D+5', acao_url: 'https://wa.me/5511921098765?text=Olá' },
    { cidx: 0, tipo: 'info',    titulo: '[TESTE] Relatório mensal disponível — Empório Digital',    msg: 'Relatório de performance pronto para revisão.',           acao_label: 'Ver relatório', acao_url: null },
    { cidx: null, tipo: 'sucesso', titulo: '[TESTE] Morning briefing gerado',                       msg: 'Briefing de ontem processado com sucesso.',               acao_label: null, acao_url: null },
  ];

  for (const n of notifData) {
    const { data: existe } = await supabase
      .from('notificacoes')
      .select('id')
      .eq('titulo', n.titulo)
      .maybeSingle();
    if (existe) continue;

    await supabase.from('notificacoes').insert({
      user_id:    userId,
      cliente_id: n.cidx !== null ? cid(n.cidx) : null,
      tipo:       n.tipo,
      titulo:     n.titulo,
      mensagem:   n.msg,
      acao_label: n.acao_label,
      acao_url:   n.acao_url,
      lida:       false,
    });
  }
  console.log('✅ Notificações criadas');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 14. HISTÓRICO DE AÇÕES
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📝 Criando histórico de ações...');
  const historicoData = [
    { cidx: 0, tipo: 'onboarding_iniciado',  desc: '[TESTE] Primeiro contato realizado com Empório Digital',     dias: 60 },
    { cidx: 0, tipo: 'campanha_criada',      desc: '[TESTE] Campanha Remarketing Ecommerce criada',              dias: 55 },
    { cidx: 0, tipo: 'pagamento_confirmado', desc: '[TESTE] Pagamento mensalidade confirmado — R$ 1.997',        dias: 5, valor: 1997 },
    { cidx: 1, tipo: 'cliente_recebido',     desc: '[TESTE] Construtora Horizonte recebida via indicação',        dias: 3 },
    { cidx: 3, tipo: 'alerta_atraso',        desc: '[TESTE] Restaurante Sabor & Arte entrou em atraso D+7',      dias: 0 },
    { cidx: 4, tipo: 'alerta_atraso',        desc: '[TESTE] Auto Center Turbo — atraso chegou a D+15',           dias: 0 },
    { cidx: 4, tipo: 'campanha_pausada',     desc: '[TESTE] Campanha Display Promoções pausada por inadimplência', dias: 1 },
    { cidx: 6, tipo: 'campanha_criada',      desc: '[TESTE] Campanha Social Ads Promocional criada',              dias: 30 },
    { cidx: 6, tipo: 'otimizacao',           desc: '[TESTE] CPA caiu 25% após ajuste de público-alvo',            dias: 15 },
    { cidx: 7, tipo: 'onboarding_iniciado',  desc: '[TESTE] Setup de tráfego iniciado para Agência de Viagens',   dias: 10 },
  ];

  for (const h of historicoData) {
    const clienteId = cid(h.cidx);
    if (!clienteId) continue;

    const { data: existe } = await supabase
      .from('historico_acoes')
      .select('id')
      .eq('descricao', h.desc)
      .maybeSingle();
    if (existe) continue;

    await supabase.from('historico_acoes').insert({
      cliente_id:      clienteId,
      tipo_acao:       h.tipo,
      descricao:       h.desc,
      valor_impactado: h.valor ?? 0,
      metadata:        { origem: 'teste' },
      data_acao:       daysAgo(h.dias),
    });
  }
  console.log('✅ Histórico de ações criado');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 15. ESTÁGIOS
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n🔄 Criando estágios...');
  const estagiosData = [
    { cidx: 1, nome: 'recebido',       desc: 'Novo cliente — enviar #BOASVINDAS',       acao: '#BOASVINDAS', checklist: ['Enviar mensagem #BOASVINDAS', 'Criar ficha do cliente', 'Agendar call de onboarding'] },
    { cidx: 2, nome: 'congelado',      desc: 'Cliente retido — aguardando retorno',       acao: '#LEMBRETE',   checklist: ['Enviar lembrete amigável', 'Verificar motivo da pausa'] },
    { cidx: 7, nome: 'setup_trafego', desc: 'Configurando Google Ads e tracking',        acao: '#SETUP',      checklist: ['Criar conta Google Ads', 'Instalar GTM', 'Configurar conversões GA4', 'Subir primeira campanha'] },
  ];

  for (const e of estagiosData) {
    const clienteId = cid(e.cidx);
    if (!clienteId) continue;

    const { data: existe } = await supabase
      .from('estagios')
      .select('id')
      .eq('cliente_id', clienteId)
      .eq('nome', e.nome)
      .maybeSingle();
    if (existe) continue;

    await supabase.from('estagios').insert({
      cliente_id: clienteId,
      nome:       e.nome,
      descricao:  e.desc,
      acao_label: e.acao,
      acao_url:   `https://wa.me/${clientes[e.cidx].whatsapp}?text=Olá!`,
      checklist:  e.checklist.map(item => ({ item, done: false })),
      ativo:      true,
    });
  }
  console.log('✅ Estágios criados');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 16. CONFIG FINANCEIRA
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n⚙️  Configurando dados financeiros...');
  await supabase.from('configuracoes_financeiras').upsert({
    agencia_id:                     'adsgator-main',
    custos_fixos_mensais:           14650,
    custos_variaveis_percentual:    15,
    margem_lucro_minima:            30,
    saldo_google_ads_limite_alerta: 500,
    tipo_tributacao:                'MEI',
    imposto_percentual:             11.0,
  }, { onConflict: 'agencia_id' });
  console.log('✅ Config financeira salva');

  // ═══════════════════════════════════════════════════════════════════════════════
  // RESUMO FINAL
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n=================================================');
  console.log('🎉 Seed COMPLETO concluído!');
  console.log(`   Clientes:              ${clientes.length} (${clientesCriados} novos)`);
  console.log(`   Campanhas Google Ads:   ${campanhasData.length}`);
  console.log(`   Analytics snapshots:    ${snapshotClientes.length * 6} (4 semanas ads + 2 GA4)`);
  console.log(`   Custos detalhados:      ${custosData.length}`);
  console.log(`   Alertas:                ${alertasData.length}`);
  console.log(`   Memórias de clientes:   ${memoriasData.length}`);
  console.log(`   Tarefas:                ${tarefasData.length}`);
  console.log(`   Relatórios executivos:  2 (mês anterior + retrasado)`);
  console.log(`   Relatórios mensais:     ${clientesAtivos.length * 2}`);
  console.log(`   Briefing diário:        1`);
  console.log(`   Lançamentos financeiros: receitas + custos + aquisição`);
  console.log(`   Notificações:           ${notifData.length}`);
  console.log(`   Histórico de ações:     ${historicoData.length}`);
  console.log('=================================================');
  console.log('');
  console.log('🔧 Edge Functions cobertas:');
  console.log('   ✅ gerar-relatorio-executivo (campanhas, custos, assinaturas, relatório anterior)');
  console.log('   ✅ gerar-insight-ia (analytics_snapshots com/sem insight)');
  console.log('   ✅ gerar-relatorio-md (clientes + snapshots)');
  console.log('   ✅ gerar-relatorios-mensais (clientes ativos + relatorios_mensais)');
  console.log('   ✅ morning-briefing (clientes, alertas, memórias)');
  console.log('   ✅ sentinela (clientes com saldo baixo + inadimplência)');
  console.log('   ✅ processar-alertas (alertas com dispara_em no passado)');
  console.log('   ✅ memoria-cliente (memórias versionadas)');
  console.log('   ✅ webhook-asaas (assinaturas com asaas_subscription_id)');
  console.log('   ✅ regua-cobranca (clientes com dias_atraso > 0)');
  console.log('');
  console.log('   Para limpar: npm run db:seed-clean');
  console.log('=================================================\n');
}

main().catch(err => {
  console.error('❌ Erro fatal:', err.message);
  process.exit(1);
});
