import { supabase } from './supabase';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface DREData {
  receita_bruta:              number;
  custos_fixos:               number;
  custos_variaveis:           number;
  lucro_bruto:                number;
  lucro_liquido:              number;
  margem_liquida_percentual:  number;
  mrr:                        number;
}

export interface ConfigFinanceira {
  custos_fixos_mensais:           number;
  custos_variaveis_percentual:    number;
  margem_lucro_minima:            number;
  saldo_google_ads_limite_alerta: number;
}

export interface ClienteAtrasado {
  cliente: {
    id:       string;
    nome:     string;
    email:    string;
    whatsapp: string;
  };
  dias_atraso:           number;
  valor_devido:          number;
  data_proxima_cobranca: string;
  status_assinatura:     string;
}

export interface ProjecaoMensal {
  mes:               string;
  mes_label:         string;
  receita_projetada: number;
  lucro_projetado:   number;
}

export interface ValidacaoMargem {
  margemAtual:  number;
  margemMinima: number;
  estaOk:       boolean;
  alerta:       string | null;
}

// ─── CALCULAR MRR ────────────────────────────────────────────────────────────

export async function calcularMRR(): Promise<number> {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('valor_mensal')
    .eq('status', 'ativa');
  if (error) throw new Error(`Erro ao calcular MRR: ${error.message}`);
  return (data ?? []).reduce((t, a) => t + Number(a.valor_mensal), 0);
}

// ─── OBTER CONFIG FINANCEIRA ──────────────────────────────────────────────────

export async function obterConfigFinanceira(): Promise<ConfigFinanceira> {
  const { data, error } = await supabase
    .from('configuracoes_financeiras')
    .select('custos_fixos_mensais, custos_variaveis_percentual, margem_lucro_minima, saldo_google_ads_limite_alerta')
    .eq('agencia_id', 'adsgator-main')
    .single();
  if (error) throw new Error(`Erro na config financeira: ${error.message}`);
  return {
    custos_fixos_mensais:           Number(data.custos_fixos_mensais           ?? 0),
    custos_variaveis_percentual:    Number(data.custos_variaveis_percentual    ?? 0),
    margem_lucro_minima:            Number(data.margem_lucro_minima            ?? 30),
    saldo_google_ads_limite_alerta: Number(data.saldo_google_ads_limite_alerta ?? 50),
  };
}

// ─── CALCULAR DRE MENSAL ──────────────────────────────────────────────────────

export async function calcularDREMensal(): Promise<DREData> {
  const [mrr, config] = await Promise.all([calcularMRR(), obterConfigFinanceira()]);

  const custosVariaveis = mrr * (config.custos_variaveis_percentual / 100);
  const lucroBruto      = mrr - custosVariaveis;
  const lucroLiquido    = lucroBruto - config.custos_fixos_mensais;
  const margem          = mrr > 0 ? (lucroLiquido / mrr) * 100 : 0;

  return {
    receita_bruta:             mrr,
    custos_fixos:              config.custos_fixos_mensais,
    custos_variaveis:          custosVariaveis,
    lucro_bruto:               lucroBruto,
    lucro_liquido:             lucroLiquido,
    margem_liquida_percentual: margem,
    mrr,
  };
}

// ─── LISTAR CLIENTES ATRASADOS ────────────────────────────────────────────────

export async function listarClientesAtrasados(): Promise<ClienteAtrasado[]> {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('*, clientes(id, nome, email, whatsapp)')
    .gt('dias_atraso', 0)
    .order('dias_atraso', { ascending: false });
  if (error) throw new Error(`Erro ao listar atrasos: ${error.message}`);
  return (data ?? []).map((a) => ({
    cliente:               a.clientes as ClienteAtrasado['cliente'],
    dias_atraso:           Number(a.dias_atraso),
    valor_devido:          Number(a.valor_mensal),
    data_proxima_cobranca: a.data_proxima_cobranca as string,
    status_assinatura:     a.status as string,
  }));
}

// ─── ATUALIZAR CONFIG FINANCEIRA ──────────────────────────────────────────────

export async function atualizarConfigFinanceira(dados: Partial<ConfigFinanceira>): Promise<void> {
  const { error } = await supabase
    .from('configuracoes_financeiras')
    .update(dados)
    .eq('agencia_id', 'adsgator-main');
  if (error) throw new Error(`Erro ao salvar config: ${error.message}`);
}

// ─── PROJEÇÃO 3 MESES (tendência linear) ─────────────────────────────────────

export async function projetarFinanceiro3Meses(): Promise<ProjecaoMensal[]> {
  const dre = await calcularDREMensal();

  const { data: historico } = await supabase
    .from('relatorios_mensais')
    .select('mes_ano, mrr')
    .order('mes_ano', { ascending: false })
    .limit(6);

  let taxaCrescimento = 0;
  if (historico && historico.length >= 2) {
    const crescimentos: number[] = [];
    for (let i = 0; i < historico.length - 1; i++) {
      const atual    = Number(historico[i].mrr     ?? 0);
      const anterior = Number(historico[i + 1].mrr ?? 0);
      if (anterior > 0) crescimentos.push((atual - anterior) / anterior);
    }
    if (crescimentos.length > 0) {
      taxaCrescimento = crescimentos.reduce((s, v) => s + v, 0) / crescimentos.length;
    }
  }
  taxaCrescimento = Math.max(-0.10, Math.min(0.20, taxaCrescimento));

  const hoje = new Date();
  return Array.from({ length: 3 }).map((_, i) => {
    const mes     = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const fator   = Math.pow(1 + taxaCrescimento, i);
    const receita = dre.mrr * fator;
    const custVar = receita * (dre.mrr > 0 ? dre.custos_variaveis / dre.mrr : 0);
    return {
      mes:               `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`,
      mes_label:         mes.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      receita_projetada: receita,
      lucro_projetado:   receita - custVar - dre.custos_fixos,
    };
  });
}

// ─── VALIDAR MARGEM MÍNIMA ────────────────────────────────────────────────────

export async function validarMargemMinima(): Promise<ValidacaoMargem> {
  const [dre, config] = await Promise.all([calcularDREMensal(), obterConfigFinanceira()]);
  const margemAtual = dre.margem_liquida_percentual;
  return {
    margemAtual,
    margemMinima: config.margem_lucro_minima,
    estaOk: margemAtual >= config.margem_lucro_minima,
    alerta: margemAtual < config.margem_lucro_minima
      ? `Margem atual ${margemAtual.toFixed(1)}% está abaixo do mínimo de ${config.margem_lucro_minima}%`
      : null,
  };
}
