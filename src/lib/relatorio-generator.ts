import { supabase } from './supabase';
import type { DadosCampanhaAds, PalavraChavePerformance } from './google-ads';
import type { DadosGA4, PaginaPerformance, FonteTrafego } from './google-analytics';
import type { LinhaTermoAds, DemografiaAds } from './ads-detalhes';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface RelatorioMensalInput {
  cliente_id: string;
  mes_ano:    string;
  campanhas:  DadosCampanhaAds[];
  keywords:   PalavraChavePerformance[];
  ga4:        DadosGA4;
  paginas:    PaginaPerformance[];
  fontes:     FonteTrafego[];
  // Analytics 2.0: cortes extras do relatório (null = falhou ao buscar,
  // [] / vazio = sem dados reais no período, undefined = não solicitado)
  termos?:     LinhaTermoAds[] | null;
  demografia?: DemografiaAds | null;
}

export interface RecomendacaoAuto {
  tipo:      'otimizacao' | 'alerta' | 'oportunidade';
  titulo:    string;
  descricao: string;
}

// ─── RECOMENDAÇÕES AUTOMÁTICAS ────────────────────────────────────────────────

export function gerarRecomendacoes(
  campanhas: DadosCampanhaAds[],
  ga4:       DadosGA4,
): RecomendacaoAuto[] {
  const recomendacoes: RecomendacaoAuto[] = [];

  const custoTotal    = campanhas.reduce((s, c) => s + c.custo_total, 0);
  const conversoesAds = campanhas.reduce((s, c) => s + c.conversoes, 0);
  const ctrMedio      = campanhas.length > 0
    ? campanhas.reduce((s, c) => s + c.ctr, 0) / campanhas.length
    : 0;

  if (ctrMedio < 2) {
    recomendacoes.push({
      tipo:      'alerta',
      titulo:    'CTR abaixo do esperado',
      descricao: `CTR médio de ${ctrMedio.toFixed(2)}% está abaixo de 2%. Revisar títulos e descrições dos anúncios.`,
    });
  }

  if (custoTotal > 0 && conversoesAds === 0) {
    recomendacoes.push({
      tipo:      'alerta',
      titulo:    'Sem conversões registradas',
      descricao: 'Verificar configuração de conversão no Google Ads e na landing page.',
    });
  }

  if (ga4.taxa_rejeicao > 70) {
    recomendacoes.push({
      tipo:      'alerta',
      titulo:    `Taxa de rejeição alta: ${ga4.taxa_rejeicao.toFixed(1)}%`,
      descricao: 'Landing page pode estar com carregamento lento ou copy desalinhada com o anúncio.',
    });
  }

  if (ga4.taxa_engajamento > 55) {
    recomendacoes.push({
      tipo:      'oportunidade',
      titulo:    'Alto engajamento no site',
      descricao: `Taxa de engajamento de ${ga4.taxa_engajamento.toFixed(1)}% — considere aumentar orçamento das campanhas de maior CTR.`,
    });
  }

  if (ctrMedio > 5) {
    recomendacoes.push({
      tipo:      'oportunidade',
      titulo:    'CTR excelente',
      descricao: `CTR médio de ${ctrMedio.toFixed(2)}% indica forte relevância. Escalar orçamento pode trazer mais conversões.`,
    });
  }

  return recomendacoes;
}

// ─── GERAR MARKDOWN DO RELATÓRIO ─────────────────────────────────────────────

// Rótulos pt-BR dos enums de demografia (mesma convenção da UI)
const FAIXA_MD: Record<string, string> = {
  AGE_RANGE_18_24: '18–24', AGE_RANGE_25_34: '25–34', AGE_RANGE_35_44: '35–44',
  AGE_RANGE_45_54: '45–54', AGE_RANGE_55_64: '55–64', AGE_RANGE_65_UP: '65+',
  AGE_RANGE_UNDETERMINED: 'Indeterminado',
};
const GENERO_MD: Record<string, string> = {
  MALE: 'Masculino', FEMALE: 'Feminino', UNDETERMINED: 'Indeterminado',
};

export function gerarMarkdownRelatorio(
  nomeCliente:  string,
  mesAno:       string,
  campanhas:    DadosCampanhaAds[],
  keywords:     PalavraChavePerformance[],
  ga4:          DadosGA4,
  paginas:      PaginaPerformance[],
  fontes:       FonteTrafego[],
  termos?:      LinhaTermoAds[] | null,
  demografia?:  DemografiaAds | null,
): string {
  const [ano, mes] = mesAno.split('-').map(Number);
  const nomeMes    = new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const recomendacoes = gerarRecomendacoes(campanhas, ga4);

  const custoTotal    = campanhas.reduce((s, c) => s + c.custo_total, 0);
  const conversoesAds = campanhas.reduce((s, c) => s + c.conversoes, 0);
  const cpaGeral      = conversoesAds > 0 ? custoTotal / conversoesAds : 0;
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const tabelaCampanhas = campanhas.length > 0
    ? `| Campanha | Impressões | Cliques | CTR | Custo | Conv. |\n|---|---|---|---|---|---|\n` +
      campanhas.map((c) =>
        `| ${c.campanha_nome} | ${c.impressoes.toLocaleString()} | ${c.cliques.toLocaleString()} | ${c.ctr.toFixed(2)}% | ${fmt(c.custo_total)} | ${c.conversoes} |`
      ).join('\n')
    : '_Nenhuma campanha ativa no período._';

  const tabelaKeywords = keywords.length > 0
    ? `| Palavra-chave | Cliques | CTR | CPC Médio | Conv. |\n|---|---|---|---|---|\n` +
      keywords.slice(0, 10).map((k) =>
        `| ${k.keyword} | ${k.cliques} | ${k.ctr.toFixed(2)}% | ${fmt(k.cpc_medio)} | ${k.conversoes} |`
      ).join('\n')
    : '_Sem dados de palavras-chave._';

  const tabelaPaginas = paginas.length > 0
    ? `| Página | Visualizações | Usuários Únicos | Engajamento |\n|---|---|---|---|\n` +
      paginas.slice(0, 10).map((p) =>
        `| ${p.pagina} | ${p.visualizacoes.toLocaleString()} | ${p.usuarios_unicos.toLocaleString()} | ${p.taxa_engajamento.toFixed(1)}% |`
      ).join('\n')
    : '_Sem dados de páginas._';

  const recomendacoesTexto = recomendacoes.length > 0
    ? recomendacoes.map((r) => `### ${r.tipo === 'alerta' ? '⚠️' : '✅'} ${r.titulo}\n${r.descricao}`).join('\n\n')
    : '_Nenhuma recomendação automática gerada._';

  // ── Seções Analytics 2.0 (termos + demografia) — só entram se solicitadas ──
  let secaoTermos = '';
  if (termos !== undefined) {
    const corpo = termos === null
      ? '_Indisponível no momento da geração — tente gerar novamente._'
      : termos.length === 0
        ? '_Sem termos de pesquisa no período._'
        : `| Termo de pesquisa | Impressões | Cliques | Custo | Conv. |\n|---|---|---|---|---|\n` +
          termos.slice(0, 15).map((t) =>
            `| ${t.termo} | ${t.impressoes.toLocaleString()} | ${t.cliques.toLocaleString()} | ${fmt(t.custo)} | ${t.conversoes} |`
          ).join('\n');
    secaoTermos = `\n---\n\n## 🔎 O que as pessoas pesquisaram\n\n${corpo}\n`;
  }

  let secaoDemografia = '';
  if (demografia !== undefined) {
    let corpo: string;
    if (demografia === null) {
      corpo = '_Indisponível no momento da geração — tente gerar novamente._';
    } else if (demografia.faixasEtarias.length === 0 && demografia.generos.length === 0) {
      corpo = '_Sem dados demográficos no período._';
    } else {
      const faixas = demografia.faixasEtarias.map((f) =>
        `| ${FAIXA_MD[f.faixa] ?? f.faixa} | ${f.impressoes.toLocaleString()} | ${f.cliques.toLocaleString()} | ${f.conversoes} |`
      ).join('\n');
      const generos = demografia.generos.map((g) =>
        `| ${GENERO_MD[g.genero] ?? g.genero} | ${g.impressoes.toLocaleString()} | ${g.cliques.toLocaleString()} | ${g.conversoes} |`
      ).join('\n');
      corpo =
        `**Por idade**\n\n| Faixa | Impressões | Cliques | Conv. |\n|---|---|---|---|\n${faixas}\n\n` +
        `**Por gênero**\n\n| Gênero | Impressões | Cliques | Conv. |\n|---|---|---|---|\n${generos}`;
    }
    secaoDemografia = `\n---\n\n## 👥 Perfil de quem viu os anúncios\n\n${corpo}\n`;
  }

  return `# Relatório de Performance — ${nomeCliente}
**Período:** ${nomeMes}
**Gerado em:** ${new Date().toLocaleDateString('pt-BR')}

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---|---|
| Investimento Google Ads | ${fmt(custoTotal)} |
| Conversões (Ads) | ${conversoesAds} |
| CPA Médio | ${cpaGeral > 0 ? fmt(cpaGeral) : 'N/A'} |
| Sessões (GA4) | ${ga4.sessoes.toLocaleString()} |
| Novos Usuários | ${ga4.usuarios_novos.toLocaleString()} |
| Taxa de Engajamento | ${ga4.taxa_engajamento.toFixed(1)}% |
| Taxa de Rejeição | ${ga4.taxa_rejeicao.toFixed(1)}% |

---

## 🎯 Google Ads — Campanhas

${tabelaCampanhas}

---

## 🔑 Top Palavras-chave

${tabelaKeywords}
${secaoTermos}${secaoDemografia}
---

## 🌐 Google Analytics 4 — Top Páginas

${tabelaPaginas}

---

## 💡 Recomendações Automáticas

${recomendacoesTexto}

---

*Relatório gerado automaticamente pelo Adsgator Hub*
`;
}

// ─── SALVAR RELATÓRIO NO SUPABASE ─────────────────────────────────────────────

export async function gerarRelatorioMensal(
  dados: RelatorioMensalInput,
  nomeCliente: string,
): Promise<void> {
  const markdown = gerarMarkdownRelatorio(
    nomeCliente,
    dados.mes_ano,
    dados.campanhas,
    dados.keywords,
    dados.ga4,
    dados.paginas,
    dados.fontes,
    dados.termos,
    dados.demografia,
  );

  const campanhaAgregada = dados.campanhas[0];
  const custoTotal       = dados.campanhas.reduce((s, c) => s + c.custo_total, 0);
  const conversoesAds    = dados.campanhas.reduce((s, c) => s + c.conversoes, 0);

  const { error } = await supabase
    .from('relatorios_mensais')
    .upsert({
      cliente_id:          dados.cliente_id,
      mes_ano:             dados.mes_ano,
      status_geracao:      'gerado',
      investimento_ads:    custoTotal,
      conversoes:          conversoesAds,
      roi:                 custoTotal > 0 ? conversoesAds / custoTotal : 0,
      sessoes_ga4:         dados.ga4.sessoes,
      usuarios_novos:      dados.ga4.usuarios_novos,
      taxa_engajamento:    dados.ga4.taxa_engajamento,
      conteudo_markdown:   markdown,
      dados_campanhas:     dados.campanhas,
      dados_ga4:           dados.ga4,
    }, { onConflict: 'cliente_id,mes_ano' });

  if (error) throw new Error(`Erro ao salvar relatório: ${error.message}`);
}
