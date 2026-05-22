// scripts/seed-test.mjs
// Uso: npm run db:seed
// Popula o banco com dados de teste — seguro, nunca afeta clientes reais.

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
const supabaseUrl      = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceRoleKey   = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

// ─── Buscar user_id real do primeiro usuário ───────────────────────────────────
async function getTestUserId() {
  const { data, error } = await supabase.from('clientes').select('user_id').limit(1).maybeSingle();
  if (data?.user_id) return data.user_id;

  // fallback: buscar via auth admin API
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1`, {
    headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey }
  });
  const json = await res.json();
  const userId = json?.users?.[0]?.id;
  if (userId) return userId;

  console.warn('⚠️  Nenhum usuário encontrado. Usando UUID placeholder — altere manualmente se necessário.');
  return '00000000-0000-0000-0000-000000000001';
}

// ─── Dados de teste ────────────────────────────────────────────────────────────
const clientes = [
  { nome: '[TESTE] Empório Digital',         email: 'cliente1.teste@exemplo.com', whatsapp: '5511987654321', nicho: 'ecommerce',   status: 'ativo',           dias_atraso: 0  },
  { nome: '[TESTE] Construtora Horizonte',   email: 'cliente2.teste@exemplo.com', whatsapp: '5511976543210', nicho: 'construcao',  status: 'recebido',        dias_atraso: 0  },
  { nome: '[TESTE] Clínica Bem Estar',       email: 'cliente3.teste@exemplo.com', whatsapp: '5511965432109', nicho: 'saude',       status: 'congelado',       dias_atraso: 0  },
  { nome: '[TESTE] Restaurante Sabor & Arte',email: 'cliente4.teste@exemplo.com', whatsapp: '5511954321098', nicho: 'gastronomia', status: 'ativo',           dias_atraso: 7  },
  { nome: '[TESTE] Auto Center Turbo',       email: 'cliente5.teste@exemplo.com', whatsapp: '5511943210987', nicho: 'automotivo',  status: 'ativo',           dias_atraso: 15 },
  { nome: '[TESTE] Loja de Roupas Fashion',  email: 'cliente6.teste@exemplo.com', whatsapp: '5511932109876', nicho: 'varejo',      status: 'cancelado_debito',dias_atraso: 35 },
  { nome: '[TESTE] Academia Fitness Pro',    email: 'cliente7.teste@exemplo.com', whatsapp: '5511921098765', nicho: 'academia',    status: 'ativo',           dias_atraso: 5  },
  { nome: '[TESTE] Agência de Viagens Mundo',email: 'cliente8.teste@exemplo.com', whatsapp: '5511910987654', nicho: 'turismo',     status: 'setup_trafego',   dias_atraso: 0  },
];

function daysFromNow(n) {
  return new Date(Date.now() + n * 86400000).toISOString();
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🧪 ADSGATOR — Seed de Dados de Teste');
  console.log('======================================');

  const userId = await getTestUserId();
  console.log(`✅ user_id: ${userId}`);

  let clientesCriados = 0;
  const clienteIds = {};

  for (const c of clientes) {
    // Verificar se já existe para não duplicar
    const { data: existe } = await supabase
      .from('clientes')
      .select('id')
      .eq('email', c.email)
      .maybeSingle();

    if (existe) {
      console.log(`⏭  Já existe: ${c.nome}`);
      clienteIds[c.email] = existe.id;
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

  // ─── Assinaturas ──────────────────────────────────────────────────────────────
  console.log('\n📋 Criando assinaturas...');
  const planos = [997, 1997, 997, 1497, 997, 1997, 1497, 997];

  for (const [i, c] of clientes.entries()) {
    const clienteId = clienteIds[c.email];
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
      c.dias_atraso >= 7  ? 'atraso_7_dias' :
      c.dias_atraso > 0   ? 'atraso' : 'ativa';

    await supabase.from('assinaturas').insert({
      cliente_id:            clienteId,
      plano_nome:            i % 3 === 0 ? 'Plano Starter' : i % 3 === 1 ? 'Plano Growth' : 'Plano Enterprise',
      valor_mensal:          planos[i],
      status:                statusAssinatura,
      dias_atraso:           c.dias_atraso,
      data_proxima_cobranca: c.dias_atraso > 0 ? new Date(Date.now() - c.dias_atraso * 86400000).toISOString() : daysFromNow(30),
      asaas_subscription_id: `sub_test_${Math.random().toString(36).slice(2, 10)}`,
    });
  }
  console.log('✅ Assinaturas criadas');

  // ─── Notificações ─────────────────────────────────────────────────────────────
  console.log('\n🔔 Criando notificações...');

  for (const c of clientes) {
    const clienteId = clienteIds[c.email];
    if (!clienteId) continue;

    if (c.status === 'recebido') {
      await supabase.from('notificacoes').insert({
        user_id: userId, cliente_id: clienteId,
        tipo: 'urgente',
        titulo: `[TESTE] Novo cliente recebido!`,
        mensagem: `${c.nome} aguarda #BOASVINDAS agora.`,
        acao_label: '#BOASVINDAS',
        acao_url: `https://wa.me/${c.whatsapp}?text=Olá!`,
        lida: false,
      });
    }

    if (c.dias_atraso >= 7 && c.dias_atraso < 30) {
      await supabase.from('notificacoes').insert({
        user_id: userId, cliente_id: clienteId,
        tipo: 'atencao',
        titulo: `[TESTE] ${c.nome} — ${c.dias_atraso} dias em atraso`,
        mensagem: `Campanha em risco de suspensão. D+${c.dias_atraso}`,
        acao_label: `#ALERTA D+${c.dias_atraso}`,
        acao_url: `https://wa.me/${c.whatsapp}?text=Olá, sobre seu pagamento...`,
        lida: false,
      });
    }
  }
  console.log('✅ Notificações criadas');

  // ─── Config financeira ────────────────────────────────────────────────────────
  console.log('\n💰 Configurando dados financeiros...');
  await supabase.from('configuracoes_financeiras').upsert({
    agencia_id:                    'adsgator-main',
    custos_fixos_mensais:          15000,
    custos_variaveis_percentual:   15,
    margem_lucro_minima:           30,
    saldo_google_ads_limite_alerta: 500,
  }, { onConflict: 'agencia_id' });
  console.log('✅ Config financeira salva');

  // ─── Resumo ───────────────────────────────────────────────────────────────────
  console.log('\n======================================');
  console.log(`🎉 Seed concluído!`);
  console.log(`   Clientes criados:  ${clientesCriados}`);
  console.log(`   Já existiam:       ${clientes.length - clientesCriados}`);
  console.log('   Para limpar: npm run db:seed-clean');
  console.log('======================================\n');
}

main().catch(err => {
  console.error('❌ Erro fatal:', err.message);
  process.exit(1);
});
