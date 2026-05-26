const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jymybemmnzgfzmslpmcr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bXliZW1tbnpnZnptc2xwbWNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM3NjkzNiwiZXhwIjoyMDk0OTUyOTM2fQ.BKA6RYFoWEuI7mRZOzJDqaC6D-7eGpIDyC9_FEsUh88'
);

const ESTAGIOS_FUNIL = [
  'lead', 'qualificado', 'proposta', 'negociacao', 'fechado', 'onboarding', 'ativo', 'churn'
];

const SEGMENTOS = ['E-commerce', 'SaaS', 'Educação', 'Saúde', 'Imobiliário', 'Food & Beverage'];
const ORIGENS = ['indicacao', 'site', 'ads', 'evento', 'linkedin', 'cold_call'];
const RESPONSIVEIS = ['Admin', 'Lucas', 'Mariana', 'João'];

const NOMES_CLIENTES = {
  lead: ['Loja do Futuro', 'TechStart BR', 'Moda Express', 'Suplementos Pro', 'Beleza Natural'],
  qualificado: ['Construtora Silva', 'Escola Inovadora', 'Clínica Saúde+', 'Restaurante Sabor'],
  proposta: ['E-commerce Mega', 'Software House LTDA', 'Farmácia Popular', 'Academia Fitness'],
  negociacao: ['Supermercado Popular', 'Auto Peças Brasil', 'Turismo Aventura', 'Pet Shop Amigo'],
  fechado: ['Joalheria Luxo', 'Móveis Planejados', 'Segurança Patrimonial', 'Logística Rápida'],
  onboarding: ['Ótica Visão', 'Lavanderia Clean', 'Estética Bella', 'Consultoria Estratégica'],
  ativo: ['Imobiliária Prime', 'Educação Online', 'Clínica Estética', 'Distribuidora Total', 'Restaurante Gourmet', 'Loja de Esportes'],
  churn: ['Agência Digital (cancelado)', 'Comércio Local (pausado)', 'Indústria Pequena (finalizado)']
};

async function limparDadosAntigos() {
  console.log('🧹 Limpando dados de teste anteriores...');
  
  const { data: clientesAntigos } = await supabase
    .from('clientes')
    .select('id')
    .like('nome', '%[TESTE]%');
  
  if (clientesAntigos && clientesAntigos.length > 0) {
    const ids = clientesAntigos.map(c => c.id);
    
    await supabase.from('notificacoes').delete().in('cliente_id', ids);
    await supabase.from('historico_acoes').delete().in('cliente_id', ids);
    await supabase.from('estagios').delete().in('cliente_id', ids);
    await supabase.from('assinaturas').delete().in('cliente_id', ids);
    await supabase.from('financeiro_lancamentos').delete().in('cliente_id', ids);
    await supabase.from('tarefas').delete().in('cliente_id', ids);
    await supabase.from('clientes').delete().in('id', ids);
    
    console.log(`🗑️  ${clientesAntigos.length} clientes de teste removidos`);
  }
}

async function criarClienteCompleto(nome, estagio, index) {
  const email = `contato${index}@${nome.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com.br`;
  const whatsapp = `55119${Math.floor(10000000 + Math.random() * 89999999)}`;
  const segmento = SEGMENTOS[Math.floor(Math.random() * SEGMENTOS.length)];
  const origem = ORIGENS[Math.floor(Math.random() * ORIGENS.length)];
  const responsavel = RESPONSIVEIS[Math.floor(Math.random() * RESPONSIVEIS.length)];
  
  const diasAtraso = estagio === 'churn' ? Math.floor(Math.random() * 30) + 1 : 0;
  const valorMrr = estagio === 'ativo' || estagio === 'onboarding' || estagio === 'fechado' 
    ? Math.floor(Math.random() * 5000) + 1500 
    : 0;

  // Criar cliente
  const { data: cliente, error } = await supabase
    .from('clientes')
    .insert({
      nome: `${nome} [TESTE-${estagio.toUpperCase()}]`,
      email,
      whatsapp,
      instagram: `@${nome.toLowerCase().replace(/\s+/g, '_')}`,
      site: `https://${nome.toLowerCase().replace(/\s+/g, '')}.com.br`,
      segmento,
      origem,
      responsavel,
      estagio_atual: estagio,
      status: estagio === 'churn' ? 'inativo' : 'ativo',
      mrr: valorMrr,
      dias_atraso: diasAtraso,
      proximo_contato: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      descricao: `Cliente de teste no estágio ${estagio}. Dados fictícios para teste do sistema.`,
      user_id: (await supabase.auth.admin.listUsers()).data.users[0]?.id || null
    })
    .select()
    .single();

  if (error) {
    console.error(`❌ Erro ao criar ${nome}:`, error.message);
    return null;
  }

  console.log(`✅ ${nome} [${estagio}]`);

  // Criar estágio no histórico
  await supabase.from('estagios').insert({
    cliente_id: cliente.id,
    nome: estagio,
    data_entrada: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    observacao: `Entrada no estágio ${estagio}`
  });

  // Criar tarefas baseadas no estágio
  const tarefas = gerarTarefasPorEstagio(estagio, cliente.id);
  for (const tarefa of tarefas) {
    await supabase.from('tarefas').insert(tarefa);
  }

  // Criar lançamentos financeiros para clientes pagantes
  if (valorMrr > 0) {
    const lancamentos = gerarLancamentosFinanceiros(cliente.id, valorMrr, estagio);
    for (const lanc of lancamentos) {
      await supabase.from('financeiro_lancamentos').insert(lanc);
    }
  }

  // Criar notificações
  const notificacoes = gerarNotificacoes(cliente.id, estagio, diasAtraso);
  for (const notif of notificacoes) {
    await supabase.from('notificacoes').insert(notif);
  }

  // Criar histórico de ações
  await supabase.from('historico_acoes').insert({
    cliente_id: cliente.id,
    tipo: 'criacao',
    descricao: `Cliente criado no estágio ${estagio}`,
    data: new Date().toISOString()
  });

  return cliente;
}

function gerarTarefasPorEstagio(estagio, clienteId) {
  const hoje = new Date();
  const tarefas = [];
  
  const tarefasPorEstagio = {
    lead: [
      { titulo: 'Ligar para qualificar', prioridade: 'alta' },
      { titulo: 'Enviar apresentação', prioridade: 'media' },
      { titulo: 'Agendar reunião', prioridade: 'media' }
    ],
    qualificado: [
      { titulo: 'Preparar proposta', prioridade: 'alta' },
      { titulo: 'Analisar concorrência', prioridade: 'media' },
      { titulo: 'Reunião de diagnóstico', prioridade: 'alta' }
    ],
    proposta: [
      { titulo: 'Enviar proposta comercial', prioridade: 'alta' },
      { titulo: 'Follow-up da proposta', prioridade: 'alta' },
      { titulo: 'Ajustar escopo', prioridade: 'media' }
    ],
    negociacao: [
      { titulo: 'Negociar valores', prioridade: 'alta' },
      { titulo: 'Revisão contratual', prioridade: 'media' },
      { titulo: 'Aprovação interna', prioridade: 'media' }
    ],
    fechado: [
      { titulo: 'Kickoff do projeto', prioridade: 'alta' },
      { titulo: 'Integração GA4', prioridade: 'media' },
      { titulo: 'Setup campanhas', prioridade: 'media' }
    ],
    onboarding: [
      { titulo: 'Treinamento equipe', prioridade: 'alta' },
      { titulo: 'Configurar pixels', prioridade: 'alta' },
      { titulo: 'Primeiras campanhas', prioridade: 'media' }
    ],
    ativo: [
      { titulo: 'Reunião mensal', prioridade: 'media' },
      { titulo: 'Otimizar campanhas', prioridade: 'alta' },
      { titulo: 'Relatório mensal', prioridade: 'media' },
      { titulo: 'Revisão de ROI', prioridade: 'media' }
    ],
    churn: [
      { titulo: 'Tentativa de retenção', prioridade: 'alta' },
      { titulo: 'Feedback de saída', prioridade: 'media' }
    ]
  };

  const tarefasDoEstagio = tarefasPorEstagio[estagio] || [];
  
  tarefasDoEstagio.forEach((t, i) => {
    const prazo = new Date(hoje);
    prazo.setDate(prazo.getDate() + Math.floor(Math.random() * 14) - 3);
    
    tarefas.push({
      cliente_id: clienteId,
      titulo: t.titulo,
      descricao: `Tarefa automática: ${t.titulo}`,
      status: Math.random() > 0.6 ? 'pendente' : (Math.random() > 0.5 ? 'em_andamento' : 'feito'),
      prioridade: t.prioridade,
      data_prazo: prazo.toISOString(),
      responsavel: RESPONSIVEIS[Math.floor(Math.random() * RESPONSIVEIS.length)]
    });
  });

  return tarefas;
}

function gerarLancamentosFinanceiros(clienteId, mrr, estagio) {
  const lancamentos = [];
  const hoje = new Date();
  
  // Receitas (3 meses de recorrência)
  for (let i = 0; i < 3; i++) {
    const data = new Date(hoje);
    data.setMonth(data.getMonth() - i);
    
    lancamentos.push({
      cliente_id: clienteId,
      tipo: 'receita',
      categoria: 'recorrencia',
      descricao: `MRR - ${data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      valor: mrr,
      data_vencimento: data.toISOString().split('T')[0],
      status: i === 0 ? (Math.random() > 0.3 ? 'pago' : 'pendente') : 'pago',
      metodo_pagamento: 'transferencia'
    });
  }

  // Gastos com ads (estimativa)
  const gastoAds = mrr * 0.4;
  lancamentos.push({
    cliente_id: clienteId,
    tipo: 'despesa',
    categoria: 'ads',
    descricao: 'Gasto Google Ads',
    valor: gastoAds,
    data_vencimento: hoje.toISOString().split('T')[0],
    status: 'pago',
    metodo_pagamento: 'cartao'
  });

  return lancamentos;
}

function gerarNotificacoes(clienteId, estagio, diasAtraso) {
  const notificacoes = [];
  const tipos = ['tarefa', 'vencimento', 'alerta', 'oportunidade'];
  
  if (diasAtraso > 0) {
    notificacoes.push({
      cliente_id: clienteId,
      tipo: 'alerta',
      titulo: 'Cliente em atraso',
      mensagem: `Cliente está com ${diasAtraso} dias de atraso no pagamento`,
      lida: false,
      data: new Date().toISOString()
    });
  }

  if (estagio === 'lead' || estagio === 'qualificado') {
    notificacoes.push({
      cliente_id: clienteId,
      tipo: 'oportunidade',
      titulo: 'Lead quente',
      mensagem: 'Lead demonstrou alto interesse na última interação',
      lida: Math.random() > 0.5,
      data: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return notificacoes;
}

async function seed() {
  console.log('🌱 Iniciando seed completo de teste...\n');
  
  await limparDadosAntigos();
  
  console.log('\n📊 Criando clientes em todos os estágios:\n');
  
  let totalClientes = 0;
  
  for (const estagio of ESTAGIOS_FUNIL) {
    const nomes = NOMES_CLIENTES[estagio] || ['Cliente Teste'];
    console.log(`\n🎯 Estágio: ${estagio.toUpperCase()}`);
    
    for (let i = 0; i < nomes.length; i++) {
      await criarClienteCompleto(nomes[i], estagio, totalClientes + i + 1);
    }
    
    totalClientes += nomes.length;
  }
  
  console.log(`\n✅ Seed completo! ${totalClientes} clientes criados`);
  console.log('\n📈 Resumo:');
  console.log('   • Clientes em todos os estágios do funil');
  console.log('   • Tarefas distribuídas por prioridade');
  console.log('   • Lançamentos financeiros (receitas/despesas)');
  console.log('   • Notificações e alertas ativos');
  console.log('   • Histórico de ações completo');
  console.log('\n🎮 Pronto para testar: Dashboard, Analytics, Financeiro, Tarefas');
}

seed().catch(err => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
