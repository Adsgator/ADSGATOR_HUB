import { VertexAI } from '@google-cloud/vertexai';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface CopyGerada {
  headline:    string;
  subtitulo:   string;
  cta:         string;
  descricao:   string;
  keywords:    string[];
}

export interface AnaliseRelatorio {
  resumo_executivo: string;
  pontos_positivos: string[];
  pontos_atencao:   string[];
  recomendacoes:    string[];
  proximo_passo:    string;
}

// ─── CLIENTE VERTEX AI ────────────────────────────────────────────────────────

function criarVertexAI() {
  return new VertexAI({
    project:  process.env.VERTEX_AI_PROJECT_ID!,
    location: process.env.VERTEX_AI_LOCATION ?? 'us-central1',
    googleAuthOptions: {
      keyFilename: process.env.VERTEX_AI_CREDENTIALS,
    },
  });
}

export const MODELO_PRO   = 'gemini-2.5-pro'
export const MODELO_FLASH = 'gemini-2.5-flash'
export const MODELO_LITE  = 'gemini-2.5-flash-lite'

// ─── GERAR COPY PARA LANDING PAGE ────────────────────────────────────────────

export async function gerarCopyLandingPage(
  nomeCliente:   string,
  nicho:         string,
  estilo:        string,
  direcaoArte:   string,
  publicoAlvo?:  string,
): Promise<CopyGerada> {
  const prompt = `Você é um copywriter especialista em landing pages para pequenas e médias empresas brasileiras.

Gere copy persuasiva para uma landing page com as seguintes informações:
- Cliente: ${nomeCliente}
- Nicho: ${nicho}
- Estilo visual: ${estilo}
- Direção de arte: ${direcaoArte || 'não especificada'}
${publicoAlvo ? `- Público-alvo: ${publicoAlvo}` : ''}

Retorne APENAS um JSON válido com esta estrutura (sem markdown, sem explicações):
{
  "headline": "título principal impactante em até 8 palavras",
  "subtitulo": "frase de apoio que explica o benefício em 1-2 frases",
  "cta": "texto do botão de ação com verbo (ex: Agendar Consulta)",
  "descricao": "parágrafo de 2-3 frases para a seção Sobre",
  "keywords": ["5 palavras-chave relevantes para SEO"]
}`;

  try {
    const vertex  = criarVertexAI();
    const model   = vertex.preview.getGenerativeModel({ model: MODELO_FLASH });
    const result  = await model.generateContent(prompt);
    const text    = result.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    return JSON.parse(text.trim()) as CopyGerada;
  } catch (error) {
    console.error('Erro ao gerar copy:', error);
    return {
      headline:  `${nomeCliente} — ${nicho}`,
      subtitulo: 'Soluções profissionais para o seu negócio.',
      cta:       'Falar com Especialista',
      descricao: `Especialistas em ${nicho} com foco em resultados reais.`,
      keywords:  [nicho, nomeCliente, 'profissional', 'qualidade', 'resultados'],
    };
  }
}

// ─── ANALISAR RELATÓRIO DE PERFORMANCE ───────────────────────────────────────

export async function analisarRelatorioIA(
  nomeCliente:      string,
  mesAno:           string,
  investimento:     number,
  conversoes:       number,
  sessoes:          number,
  taxaEngajamento:  number,
  taxaRejeicao:     number,
  roi:              number,
): Promise<AnaliseRelatorio> {
  const [ano, mes] = mesAno.split('-').map(Number);
  const nomeMes    = new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const fmt        = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const prompt = `Você é um analista de marketing digital sênior especializado em Google Ads e Analytics.

Analise os dados de performance do cliente "${nomeCliente}" referente a ${nomeMes}:

- Investimento Google Ads: ${fmt(investimento)}
- Conversões: ${conversoes}
- ROI: ${roi.toFixed(2)}x
- Sessões no site: ${sessoes.toLocaleString('pt-BR')}
- Taxa de Engajamento: ${taxaEngajamento.toFixed(1)}%
- Taxa de Rejeição: ${taxaRejeicao.toFixed(1)}%

Retorne APENAS um JSON válido (sem markdown, sem explicações):
{
  "resumo_executivo": "parágrafo de 2-3 frases com o resumo do mês",
  "pontos_positivos": ["até 3 pontos positivos"],
  "pontos_atencao": ["até 3 pontos que precisam de atenção"],
  "recomendacoes": ["3 recomendações práticas e específicas"],
  "proximo_passo": "a ação mais importante a tomar no próximo mês"
}`;

  try {
    const vertex  = criarVertexAI();
    const model   = vertex.preview.getGenerativeModel({ model: MODELO_PRO });
    const result  = await model.generateContent(prompt);
    const text    = result.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    return JSON.parse(text.trim()) as AnaliseRelatorio;
  } catch (error) {
    console.error('Erro ao analisar relatório com IA:', error);
    return {
      resumo_executivo: `Análise de ${nomeMes} para ${nomeCliente}.`,
      pontos_positivos: [],
      pontos_atencao:   [],
      recomendacoes:    [],
      proximo_passo:    'Revisar configurações de conversão e copy dos anúncios.',
    };
  }
}
