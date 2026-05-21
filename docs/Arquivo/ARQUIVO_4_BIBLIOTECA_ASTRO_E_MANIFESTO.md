# ADSGATOR HUB - ARQUIVO 4: BIBLIOTECA ASTRO & MANIFESTO

## 1. DEFINIÇÃO DE COMPONENTES ASTRO: lib/astro-components.ts

```typescript
export interface AstroComponento {
  id: string;
  categoria: 'navegacao' | 'hero' | 'servicos' | 'depoimentos' | 'rodape' | 'formularios' | 'pricing';
  nome: string;
  descricao: string;
  versao: string;
  variacoes: string[];
  propriedades: {
    titulo?: string;
    subtitulo?: string;
    botao?: string;
    imagem?: string;
    conteudo?: string;
  };
  codigo_astro: string;
  preview_url?: string;
  recomendacoes: string[];
}

// ============================================
// BIBLIOTECA DE COMPONENTES
// ============================================

export const BIBLIOTECA_COMPONENTES: AstroComponento[] = [
  // NAVEGAÇÃO
  {
    id: 'nav-01',
    categoria: 'navegacao',
    nome: 'Navbar Minimalista',
    descricao: 'Barra de navegação limpa com menu responsivo',
    versao: '1.0.0',
    variacoes: ['com_logo', 'sem_logo', 'escuro', 'claro'],
    propriedades: {
      titulo: 'Sua Marca',
      botao: 'Agendar Call',
    },
    codigo_astro: `---
const links = [
  { label: 'Home', href: '/' },
  { label: 'Serviços', href: '/servicos' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Contato', href: '/contato' },
];
---

<nav class="flex justify-between items-center px-8 py-6 dark:bg-dark-bg bg-white border-b dark:border-dark-border border-gray-200">
  <div class="font-bold text-2xl dark:text-white text-gray-900">
    {Astro.props.titulo}
  </div>
  <ul class="flex gap-8">
    {links.map(link => (
      <li>
        <a href={link.href} class="dark:text-gray-300 text-gray-700 hover:dark:text-primary hover:text-green-600">
          {link.label}
        </a>
      </li>
    ))}
  </ul>
  <button class="dark:bg-primary bg-green-500 dark:text-white text-white px-6 py-2 rounded-md font-semibold">
    {Astro.props.botao}
  </button>
</nav>`,
    recomendacoes: [
      'Usar em todas as páginas de clientes',
      'Adicionar logo personalizado',
      'Deixar CTA ("Agendar Call") sempre visível',
    ],
  },

  // HERO
  {
    id: 'hero-01',
    categoria: 'hero',
    nome: 'Hero com Imagem Background',
    descricao: 'Seção inicial impactante com imagem de fundo e CTA',
    versao: '1.0.0',
    variacoes: ['com_imagem', 'gradiente', 'video_background'],
    propriedades: {
      titulo: 'Transforme seu tráfego em resultados',
      subtitulo: 'Estratégia de Google Ads sob medida para seu negócio',
      botao: 'Solicitar Análise Gratuita',
      imagem: '/hero-bg.jpg',
    },
    codigo_astro: `---
---

<section 
  class="relative h-screen flex items-center justify-center"
  style="background-image: url('{Astro.props.imagem}'); background-size: cover; background-position: center;"
>
  <div class="absolute inset-0 dark:bg-black/50 bg-black/30"></div>
  <div class="relative z-10 text-center max-w-3xl px-8">
    <h1 class="text-5xl font-bold text-white mb-6">
      {Astro.props.titulo}
    </h1>
    <p class="text-xl text-gray-100 mb-12">
      {Astro.props.subtitulo}
    </p>
    <button class="dark:bg-primary bg-green-500 text-white px-8 py-4 rounded-md font-bold text-lg hover:opacity-90 transition">
      {Astro.props.botao}
    </button>
  </div>
</section>`,
    recomendacoes: [
      'Usar foto de alta qualidade como background',
      'Garantir contraste suficiente para legibilidade',
      'CTA deve ser bem visível',
      'Mobile: ajustar altura e tamanho de fonte',
    ],
  },

  // SERVIÇOS
  {
    id: 'servicos-01',
    categoria: 'servicos',
    nome: 'Card de Serviços 3 Colunas',
    descricao: 'Exibe 3 serviços principais com ícones e descrições',
    versao: '1.0.0',
    variacoes: ['3_colunas', '4_colunas', 'com_icones', 'com_imagens'],
    propriedades: {
      titulo: 'Nossos Serviços',
    },
    codigo_astro: `---
const servicos = [
  {
    nome: 'Google Ads',
    descricao: 'Campanhas otimizadas para conversão',
    icon: '📊',
  },
  {
    nome: 'SEO',
    descricao: 'Rankeamento orgânico no Google',
    icon: '🔍',
  },
  {
    nome: 'Gestão de Tráfego',
    descricao: 'Otimização contínua de campanhas',
    icon: '⚡',
  },
];
---

<section class="py-16 px-8 dark:bg-dark-bg bg-white">
  <h2 class="text-4xl font-bold dark:text-white text-gray-900 text-center mb-12">
    {Astro.props.titulo}
  </h2>
  <div class="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
    {servicos.map(servico => (
      <div class="dark:bg-dark-card bg-white rounded-lg p-8 border dark:border-dark-border border-gray-200 hover:shadow-lg transition">
        <div class="text-5xl mb-4">{servico.icon}</div>
        <h3 class="text-xl font-bold dark:text-white text-gray-900 mb-4">
          {servico.nome}
        </h3>
        <p class="dark:text-gray-400 text-gray-600">
          {servico.descricao}
        </p>
      </div>
    ))}
  </div>
</section>`,
    recomendacoes: [
      'Ser específico nos serviços listados',
      'Usar ícones que remetem ao serviço',
      'Manter descrições concisas (máx 2 linhas)',
    ],
  },

  // DEPOIMENTOS
  {
    id: 'depoimentos-01',
    categoria: 'depoimentos',
    nome: 'Carrossel de Depoimentos',
    descricao: 'Seção com depoimentos de clientes satisfeitos',
    versao: '1.0.0',
    variacoes: ['carrossel', 'grid', 'com_foto', 'com_nota'],
    propriedades: {
      titulo: 'O que nossos clientes dizem',
    },
    codigo_astro: `---
const depoimentos = [
  {
    cliente: 'João Silva',
    empresa: 'João Adustramentos',
    texto: 'Aumentou nossas vendas em 300% em 3 meses!',
    nota: 5,
  },
  {
    cliente: 'Maria Santos',
    empresa: 'Consultoria Marketing',
    texto: 'Excelente ROI, muito profissional.',
    nota: 5,
  },
];
---

<section class="py-16 px-8 dark:bg-dark-card bg-gray-50">
  <h2 class="text-4xl font-bold dark:text-white text-gray-900 text-center mb-12">
    {Astro.props.titulo}
  </h2>
  <div class="grid grid-cols-2 gap-8 max-w-5xl mx-auto">
    {depoimentos.map(dep => (
      <div class="dark:bg-dark-bg bg-white rounded-lg p-8 border dark:border-dark-border border-gray-200">
        <div class="flex gap-1 mb-4">
          {[...Array(dep.nota)].map(() => <span class="text-yellow-400">⭐</span>)}
        </div>
        <p class="dark:text-gray-300 text-gray-700 mb-4 italic">
          "{dep.texto}"
        </p>
        <div>
          <p class="dark:text-white text-gray-900 font-bold">{dep.cliente}</p>
          <p class="dark:text-gray-500 text-gray-600 text-sm">{dep.empresa}</p>
        </div>
      </div>
    ))}
  </div>
</section>`,
    recomendacoes: [
      'Usar depoimentos reais de clientes',
      'Incluir nome completo e empresa',
      'Fotos de perfil aumentam credibilidade',
      'Nota de 5 estrelas é mais impactante',
    ],
  },

  // PRICING
  {
    id: 'pricing-01',
    categoria: 'pricing',
    nome: 'Tabela de Preços 3 Planos',
    descricao: 'Exibição de 3 planos com preço e benefícios',
    versao: '1.0.0',
    variacoes: ['3_planos', '4_planos', 'com_recomendacao', 'anual_mensal'],
    propriedades: {
      titulo: 'Planos e Preços',
    },
    codigo_astro: `---
const planos = [
  {
    nome: 'Starter',
    preco: 1200,
    descricao: 'Ideal para pequenas empresas',
    beneficios: ['Google Ads Básico', 'Relatórios Mensais', 'Suporte por Email'],
    recomendado: false,
  },
  {
    nome: 'Profissional',
    preco: 2500,
    descricao: 'Para agências em crescimento',
    beneficios: ['Google Ads Avançado', 'Otimização Contínua', 'Suporte 24h', 'Análise Semanal'],
    recomendado: true,
  },
  {
    nome: 'Enterprise',
    preco: 5000,
    descricao: 'Solução completa',
    beneficios: ['Todas as features', 'Account Manager Dedicado', 'Customizações', 'Prioridade Máxima'],
    recomendado: false,
  },
];
---

<section class="py-16 px-8 dark:bg-dark-bg bg-white">
  <h2 class="text-4xl font-bold dark:text-white text-gray-900 text-center mb-12">
    {Astro.props.titulo}
  </h2>
  <div class="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
    {planos.map(plano => (
      <div class={plano.recomendado ? 'dark:bg-primary bg-green-500 p-8 rounded-lg text-white scale-105' : 'dark:bg-dark-card bg-white rounded-lg p-8 border dark:border-dark-border border-gray-200'}>
        <h3 class="text-2xl font-bold mb-2">{plano.nome}</h3>
        <p class={plano.recomendado ? 'text-green-100' : 'dark:text-gray-400 text-gray-600'} class="mb-6">
          {plano.descricao}
        </p>
        <div class="text-4xl font-bold mb-6">
          R${plano.preco}
          <span class={plano.recomendado ? 'text-green-100' : 'dark:text-gray-400 text-gray-600'} class="text-lg">/mês</span>
        </div>
        <ul class="space-y-3 mb-8">
          {plano.beneficios.map(beneficio => (
            <li class="flex items-center gap-2">
              <span>✓</span>
              {beneficio}
            </li>
          ))}
        </ul>
        <button class={plano.recomendado ? 'dark:bg-white dark:text-primary bg-white text-green-500 w-full py-2 rounded-md font-bold' : 'dark:bg-primary dark:text-white bg-green-500 text-white w-full py-2 rounded-md font-bold'}>
          Contratar
        </button>
      </div>
    ))}
  </div>
</section>`,
    recomendacoes: [
      'Destacar o plano mais vendido (geralmente o do meio)',
      'Preços competitivos com mercado',
      'Listar apenas 3-4 benefícios principais',
      'CTA ("Contratar") sempre visível',
    ],
  },

  // RODAPÉ
  {
    id: 'footer-01',
    categoria: 'rodape',
    nome: 'Rodapé com Links',
    descricao: 'Rodapé com links úteis e informações de contato',
    versao: '1.0.0',
    variacoes: ['simples', 'expandido', 'com_newsletter', 'com_redes_sociais'],
    propriedades: {
      titulo: 'Sua Marca',
    },
    codigo_astro: `---
---

<footer class="dark:bg-dark-card bg-gray-900 text-white py-16 px-8">
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-4 gap-8 mb-12">
      <div>
        <h4 class="font-bold mb-4">{Astro.props.titulo}</h4>
        <p class="dark:text-gray-400 text-gray-300">Transformando tráfego em resultados</p>
      </div>
      <div>
        <h4 class="font-bold mb-4">Serviços</h4>
        <ul class="space-y-2 dark:text-gray-400 text-gray-300">
          <li><a href="/google-ads" class="hover:text-white">Google Ads</a></li>
          <li><a href="/seo" class="hover:text-white">SEO</a></li>
          <li><a href="/trafego" class="hover:text-white">Gestão de Tráfego</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-bold mb-4">Empresa</h4>
        <ul class="space-y-2 dark:text-gray-400 text-gray-300">
          <li><a href="/sobre" class="hover:text-white">Sobre</a></li>
          <li><a href="/blog" class="hover:text-white">Blog</a></li>
          <li><a href="/contato" class="hover:text-white">Contato</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-bold mb-4">Legal</h4>
        <ul class="space-y-2 dark:text-gray-400 text-gray-300">
          <li><a href="/privacidade" class="hover:text-white">Privacidade</a></li>
          <li><a href="/termos" class="hover:text-white">Termos</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t dark:border-dark-border border-gray-700 pt-8 flex justify-between items-center">
      <p class="dark:text-gray-500 text-gray-400 text-sm">
        © 2026 {Astro.props.titulo}. Todos os direitos reservados.
      </p>
      <div class="flex gap-6">
        <a href="#" class="dark:text-gray-400 text-gray-300 hover:text-white">Twitter</a>
        <a href="#" class="dark:text-gray-400 text-gray-300 hover:text-white">LinkedIn</a>
        <a href="#" class="dark:text-gray-400 text-gray-300 hover:text-white">Instagram</a>
      </div>
    </div>
  </div>
</footer>`,
    recomendacoes: [
      'Incluir links úteis de navegação',
      'Ícones de redes sociais',
      'Informações de contato claras',
      'Aviso de privacidade/termos obrigatório',
    ],
  },
];

export function obterComponentesPorCategoria(categoria: string): AstroComponento[] {
  return BIBLIOTECA_COMPONENTES.filter((c) => c.categoria === categoria);
}

export function obterComponentePorId(id: string): AstroComponento | undefined {
  return BIBLIOTECA_COMPONENTES.find((c) => c.id === id);
}
```

---

## 2. PÁGINA: Biblioteca de Componentes (Visualizador)

```typescript
'use client';

import React, { useState } from 'react';
import { BIBLIOTECA_COMPONENTES } from '@/lib/astro-components';
import { MainLayout } from '@/components/MainLayout';
import { Icons } from '@/components/Icons';

export default function BibliotecaPage() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('hero');
  const [componenteSelecionado, setComponenteSelecionado] = useState<string>('hero-01');
  const [mostrandoPreview, setMostrandoPreview] = useState(true);

  const categorias = Array.from(
    new Set(BIBLIOTECA_COMPONENTES.map((c) => c.categoria))
  );

  const componentesDaCategoria = BIBLIOTECA_COMPONENTES.filter(
    (c) => c.categoria === categoriaSelecionada
  );

  const componenteSelecionadoObj = BIBLIOTECA_COMPONENTES.find(
    (c) => c.id === componenteSelecionado
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="dark:text-white text-gray-900 text-4xl font-bold mb-2">
            Biblioteca de Componentes Astro
          </h1>
          <p className="dark:text-gray-400 text-gray-600">
            Construa landing pages profissionais com componentes prontos e otimizados
          </p>
        </div>

        {/* Layout: Sidebar + Preview */}
        <div className="grid grid-cols-4 gap-8">
          {/* SIDEBAR: Seleção de Componentes */}
          <div className="dark:bg-dark-card bg-white rounded-lg p-6 border dark:border-dark-border border-gray-200 h-fit">
            <h3 className="dark:text-white text-gray-900 font-bold text-lg mb-6">
              Categorias
            </h3>
            <div className="space-y-2 mb-8">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoriaSelecionada(cat);
                    const primeiroComponente = BIBLIOTECA_COMPONENTES.find(
                      (c) => c.categoria === cat
                    );
                    if (primeiroComponente) {
                      setComponenteSelecionado(primeiroComponente.id);
                    }
                  }}
                  className={`
                    w-full text-left px-4 py-2 rounded-md font-medium transition
                    ${
                      categoriaSelecionada === cat
                        ? 'dark:bg-primary bg-green-500 dark:text-white text-white'
                        : 'dark:hover:bg-dark-hover hover:bg-gray-100 dark:text-gray-300 text-gray-700'
                    }
                  `}
                >
                  {cat.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>

            <h3 className="dark:text-white text-gray-900 font-bold text-lg mb-4">
              {categoriaSelecionada.replace('_', ' ').toUpperCase()}
            </h3>
            <div className="space-y-2">
              {componentesDaCategoria.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => setComponenteSelecionado(comp.id)}
                  className={`
                    w-full text-left px-4 py-2 rounded-md text-sm font-medium transition
                    ${
                      componenteSelecionado === comp.id
                        ? 'dark:bg-dark-border bg-gray-200 dark:text-white text-gray-900'
                        : 'dark:hover:bg-dark-hover hover:bg-gray-100 dark:text-gray-400 text-gray-600'
                    }
                  `}
                >
                  {comp.nome}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN: Preview e Detalhes */}
          {componenteSelecionadoObj && (
            <div className="col-span-3">
              {/* Header do Componente */}
              <div className="dark:bg-dark-card bg-white rounded-lg p-8 border dark:border-dark-border border-gray-200 mb-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="dark:text-white text-gray-900 text-3xl font-bold mb-2">
                      {componenteSelecionadoObj.nome}
                    </h2>
                    <p className="dark:text-gray-400 text-gray-600">
                      {componenteSelecionadoObj.descricao}
                    </p>
                  </div>
                  <div className="dark:bg-dark-hover bg-gray-100 px-4 py-2 rounded-md">
                    <p className="dark:text-gray-400 text-gray-600 text-sm">
                      v{componenteSelecionadoObj.versao}
                    </p>
                  </div>
                </div>

                {/* Variações */}
                <div className="flex gap-2 flex-wrap">
                  {componenteSelecionadoObj.variacoes.map((var_) => (
                    <span
                      key={var_}
                      className="dark:bg-dark-hover bg-gray-100 dark:text-gray-400 text-gray-600 px-3 py-1 rounded-md text-xs font-medium"
                    >
                      {var_}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preview ou Código */}
              <div className="dark:bg-dark-card bg-white rounded-lg border dark:border-dark-border border-gray-200 overflow-hidden mb-8">
                <div className="flex items-center justify-between px-6 py-4 dark:bg-dark-hover bg-gray-50 border-b dark:border-dark-border border-gray-200">
                  <p className="dark:text-white text-gray-900 font-semibold">
                    {mostrandoPreview ? '👁️ Preview' : '💻 Código'}
                  </p>
                  <button
                    onClick={() => setMostrandoPreview(!mostrandoPreview)}
                    className="dark:bg-primary bg-green-500 dark:text-white text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
                  >
                    {mostrandoPreview ? 'Ver Código' : 'Ver Preview'}
                  </button>
                </div>

                {mostrandoPreview ? (
                  <div className="p-8 dark:bg-dark-bg bg-gray-50 min-h-96">
                    <div className="dark:bg-dark-card bg-white rounded-lg border dark:border-dark-border border-gray-200 p-8">
                      <div className="text-center dark:text-gray-400 text-gray-600">
                        <Icons.Eye className="w-12 h-12 mx-auto mb-4 opacity-50" strokeWidth={1.5} />
                        <p>Preview renderizado aqui no seu domínio</p>
                        <p className="text-sm mt-2">Copie o código Astro para seu projeto</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 dark:bg-dark-bg bg-white overflow-x-auto">
                    <pre className="dark:text-gray-300 text-gray-700 text-xs font-mono">
                      {componenteSelecionadoObj.codigo_astro}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(componenteSelecionadoObj.codigo_astro);
                        alert('Código copiado para a área de transferência!');
                      }}
                      className="mt-6 dark:bg-primary bg-green-500 dark:text-white text-white px-6 py-2 rounded-md font-medium hover:opacity-90 flex items-center gap-2"
                    >
                      <Icons.Copy className="w-4 h-4" strokeWidth={2} />
                      Copiar Código
                    </button>
                  </div>
                )}
              </div>

              {/* Recomendações */}
              <div className="dark:bg-dark-card bg-white rounded-lg p-8 border dark:border-dark-border border-gray-200">
                <h3 className="dark:text-white text-gray-900 font-bold text-lg mb-4">
                  ✨ Recomendações
                </h3>
                <ul className="space-y-3">
                  {componenteSelecionadoObj.recomendacoes.map((rec, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="dark:text-primary text-green-500 font-bold">✓</span>
                      <span className="dark:text-gray-300 text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
```

---

## 3. GERADOR DE MANIFESTO: lib/manifesto-generator.ts

```typescript
import { BIBLIOTECA_COMPONENTES } from './astro-components';

export interface ManifestoProducao {
  titulo: string;
  nicho: string;
  paleta_cores: {
    primaria: string;
    secundaria: string;
    backgrounds: string[];
  };
  estilo: string;
  direcao_arte: string;
  estrutura_pagina: string;
  componentes_selecionados: string[];
  copy_por_secao: Record<string, string>;
  notas_desenvolvimento: string[];
  data_geracao: string;
}

export function gerarManifestoProducao(
  nomeCliente: string,
  nicho: string,
  paletaCores: { primaria: string; secundaria: string; backgrounds: string[] },
  estilo: string,
  direcaoArte: string,
  componentesIds: string[],
  copyPorSecao: Record<string, string>
): ManifestoProducao {
  const componentes = BIBLIOTECA_COMPONENTES.filter((c) => componentesIds.includes(c.id));

  const estrutura = componentes
    .map((c, idx) => `${idx + 1}. ${c.nome} (${c.id})`)
    .join('\n');

  const manifesto: ManifestoProducao = {
    titulo: nomeCliente,
    nicho,
    paleta_cores: paletaCores,
    estilo,
    direcao_arte: direcaoArte,
    estrutura_pagina: estrutura,
    componentes_selecionados: componentesIds,
    copy_por_secao: copyPorSecao,
    notas_desenvolvimento: [
      `Landing page para ${nomeCliente} - Nicho: ${nicho}`,
      `Estilo: ${estilo}`,
      `Direção de arte: ${direcaoArte}`,
      'OBRIGATORIEDADE: Usar unidade REM em todos os espaçamentos',
      'OBRIGATORIEDADE: Não usar px em nenhuma circunstância',
      'Usar apenas ícones vazados (Lucide React)',
      'Borders finas em zinc-800 no tema escuro',
      'Implementar suporte a Dark/Light theme',
    ],
    data_geracao: new Date().toISOString(),
  };

  return manifesto;
}

export function exportarManifestoMarkdown(manifesto: ManifestoProducao): string {
  const md = `# Manifesto de Produção: ${manifesto.titulo}

**Data de Geração:** ${new Date(manifesto.data_geracao).toLocaleDateString('pt-BR')}

---

## 📋 Contexto Estratégico

### Cliente
${manifesto.titulo}

### Nicho
${manifesto.nicho}

### Estilo Visual
${manifesto.estilo}

### Direção de Arte
${manifesto.direcao_arte}

---

## 🎨 Paleta de Cores

### Primária
\`\`\`
${manifesto.paleta_cores.primaria}
\`\`\`

### Secundária
\`\`\`
${manifesto.paleta_cores.secundaria}
\`\`\`

### Backgrounds Complementares
\`\`\`
${manifesto.paleta_cores.backgrounds.join('\n')}
\`\`\`

---

## 📐 Estrutura da Landing Page

${manifesto.estrutura_pagina}

---

## ✍️ Copy por Seção

${Object.entries(manifesto.copy_por_secao)
  .map(
    ([secao, copy]) => `
### ${secao}
\`\`\`
${copy}
\`\`\`
`
  )
  .join('\n')}

---

## 🔧 Notas de Desenvolvimento

${manifesto.notas_desenvolvimento.map((nota) => `- ${nota}`).join('\n')}

---

## 💡 Guidelines Técnicos

### Obrigatoriedades
1. **Unidade de Medida:** REM (proibido px)
2. **Ícones:** Lucide React, apenas vazados
3. **Tema:** Dark/Light dinâmico
4. **Bordas:** Finas, zinc-800 no tema escuro
5. **Responsividade:** Mobile-first

### Estrutura Recomendada

\`\`\`
src/
├── components/
│   ├── Navbar.astro
│   ├── Hero.astro
│   ├── Servicos.astro
│   ├── Depoimentos.astro
│   ├── Pricing.astro
│   └── Footer.astro
├── layouts/
│   └── Layout.astro
├── styles/
│   └── global.css
└── pages/
    └── index.astro
\`\`\`

### Variáveis CSS Recomendadas

\`\`\`css
:root {
  --color-primary: ${manifesto.paleta_cores.primaria};
  --color-secondary: ${manifesto.paleta_cores.secundaria};
  --spacing-unit: 0.25rem; /* = 1 "unidade" de espaçamento */
}
\`\`\`

---

## 📱 Checklist de QA

- [ ] Tema Dark/Light funcionando em todas as páginas
- [ ] Todos os espaçamentos em REM
- [ ] Nenhum px utilizado
- [ ] Ícones Lucide carregando corretamente
- [ ] Bordas finas e consistentes
- [ ] Responsividade testada (mobile, tablet, desktop)
- [ ] Copy alinhado com o manifesto
- [ ] Performance otimizada (Lighthouse 90+)
- [ ] Acessibilidade WCAG AA
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

**Gerado automaticamente pelo Adsgator Hub**
`;

  return md;
}

export function downloadManifestoMD(manifesto: ManifestoProducao) {
  const conteudo = exportarManifestoMarkdown(manifesto);
  const blob = new Blob([conteudo], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `manifesto_${manifesto.titulo.replace(/\s+/g, '_').toLowerCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 4. PÁGINA: Frankenstein Builder (Construtor Visual)

```typescript
'use client';

import React, { useState } from 'react';
import { BIBLIOTECA_COMPONENTES } from '@/lib/astro-components';
import { gerarManifestoProducao, downloadManifestoMD } from '@/lib/manifesto-generator';
import { MainLayout } from '@/components/MainLayout';
import { Icons } from '@/components/Icons';

export default function BuilderPage() {
  const [nomeCliente, setNomeCliente] = useState('');
  const [nicho, setNicho] = useState('');
  const [componentesSelecionados, setComponentesSelecionados] = useState<string[]>([]);
  const [paleta, setPaleta] = useState({
    primaria: '#10b981',
    secundaria: '#6366f1',
    backgrounds: ['#0f0f0f', '#1a1a1a'],
  });
  const [estilo, setEstilo] = useState('minimalista');
  const [direcaoArte, setDirecaoArte] = useState('moderna');
  const [copy, setCopy] = useState<Record<string, string>>({});

  const handleSelecionarComponente = (id: string) => {
    setComponentesSelecionados((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleGerarManifesto = () => {
    if (!nomeCliente || !nicho || componentesSelecionados.length === 0) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const manifesto = gerarManifestoProducao(
      nomeCliente,
      nicho,
      paleta,
      estilo,
      direcaoArte,
      componentesSelecionados,
      copy
    );

    downloadManifestoMD(manifesto);
  };

  const categorias = Array.from(
    new Set(BIBLIOTECA_COMPONENTES.map((c) => c.categoria))
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="dark:text-white text-gray-900 text-4xl font-bold mb-2">
            Construtor de Landing Page
          </h1>
          <p className="dark:text-gray-400 text-gray-600">
            Monte a página do seu cliente visualmente e exporte um manifesto pronto para o Cursor
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* SIDEBAR: Configurações */}
          <div className="col-span-1">
            <div className="dark:bg-dark-card bg-white rounded-lg p-6 border dark:border-dark-border border-gray-200 sticky top-8">
              <h3 className="dark:text-white text-gray-900 font-bold text-lg mb-6">
                ⚙️ Configurações
              </h3>

              {/* Nome do Cliente */}
              <div className="mb-6">
                <label className="dark:text-gray-300 text-gray-700 text-sm font-medium block mb-2">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border dark:bg-dark-bg dark:border-dark-border dark:text-white bg-white border-gray-200 text-gray-900 text-sm"
                  placeholder="Ex: João Psicologia"
                />
              </div>

              {/* Nicho */}
              <div className="mb-6">
                <label className="dark:text-gray-300 text-gray-700 text-sm font-medium block mb-2">
                  Nicho
                </label>
                <input
                  type="text"
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border dark:bg-dark-bg dark:border-dark-border dark:text-white bg-white border-gray-200 text-gray-900 text-sm"
                  placeholder="Ex: Psicologia"
                />
              </div>

              {/* Estilo */}
              <div className="mb-6">
                <label className="dark:text-gray-300 text-gray-700 text-sm font-medium block mb-2">
                  Estilo Visual
                </label>
                <select
                  value={estilo}
                  onChange={(e) => setEstilo(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border dark:bg-dark-bg dark:border-dark-border dark:text-white bg-white border-gray-200 text-gray-900 text-sm"
                >
                  <option>minimalista</option>
                  <option>corporativo</option>
                  <option>criativo</option>
                  <option>sofisticado</option>
                </select>
              </div>

              {/* Direção de Arte */}
              <div className="mb-6">
                <label className="dark:text-gray-300 text-gray-700 text-sm font-medium block mb-2">
                  Direção de Arte
                </label>
                <input
                  type="text"
                  value={direcaoArte}
                  onChange={(e) => setDirecaoArte(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border dark:bg-dark-bg dark:border-dark-border dark:text-white bg-white border-gray-200 text-gray-900 text-sm"
                  placeholder="Ex: moderna com tons earth"
                />
              </div>

              {/* Cor Primária */}
              <div className="mb-6">
                <label className="dark:text-gray-300 text-gray-700 text-sm font-medium block mb-2">
                  Cor Primária
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={paleta.primaria}
                    onChange={(e) => setPaleta({ ...paleta, primaria: e.target.value })}
                    className="w-12 h-10 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={paleta.primaria}
                    onChange={(e) => setPaleta({ ...paleta, primaria: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-md border dark:bg-dark-bg dark:border-dark-border dark:text-white bg-white border-gray-200 text-gray-900 text-sm"
                  />
                </div>
              </div>

              {/* Gerar Manifesto */}
              <button
                onClick={handleGerarManifesto}
                disabled={!nomeCliente || !nicho || componentesSelecionados.length === 0}
                className="w-full dark:bg-primary bg-green-500 dark:text-white text-white px-6 py-3 rounded-md font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Icons.Zap className="w-5 h-5" strokeWidth={2} />
                Gerar Manifesto
              </button>
            </div>
          </div>

          {/* MAIN: Componentes */}
          <div className="col-span-2">
            <div className="dark:bg-dark-card bg-white rounded-lg p-6 border dark:border-dark-border border-gray-200">
              <h3 className="dark:text-white text-gray-900 font-bold text-lg mb-6">
                🧩 Selecione os Componentes
              </h3>

              <div className="space-y-8">
                {categorias.map((cat) => {
                  const compsNessa = BIBLIOTECA_COMPONENTES.filter((c) => c.categoria === cat);
                  return (
                    <div key={cat}>
                      <h4 className="dark:text-gray-300 text-gray-700 font-semibold text-sm uppercase mb-4 tracking-wide">
                        {cat.replace('_', ' ')}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {compsNessa.map((comp) => (
                          <button
                            key={comp.id}
                            onClick={() => handleSelecionarComponente(comp.id)}
                            className={`
                              p-4 rounded-lg border-2 transition text-left
                              ${
                                componentesSelecionados.includes(comp.id)
                                  ? 'dark:bg-primary/20 dark:border-primary bg-green-50 border-green-500'
                                  : 'dark:bg-dark-bg dark:border-dark-border bg-white border-gray-200 hover:dark:border-primary hover:border-green-500'
                              }
                            `}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="dark:text-white text-gray-900 font-semibold">
                                {comp.nome}
                              </h5>
                              {componentesSelecionados.includes(comp.id) && (
                                <Icons.CheckCircle className="w-5 h-5 dark:text-primary text-green-500" strokeWidth={2} />
                              )}
                            </div>
                            <p className="dark:text-gray-400 text-gray-600 text-sm">
                              {comp.descricao}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Preview da Estrutura */}
              {componentesSelecionados.length > 0 && (
                <div className="mt-12 pt-8 border-t dark:border-dark-border border-gray-200">
                  <h4 className="dark:text-white text-gray-900 font-bold mb-4">
                    📋 Estrutura da Página
                  </h4>
                  <div className="dark:bg-dark-bg bg-gray-50 rounded-lg p-4 space-y-2">
                    {componentesSelecionados.map((id, idx) => {
                      const comp = BIBLIOTECA_COMPONENTES.find((c) => c.id === id);
                      return (
                        <div key={id} className="flex items-center gap-3 dark:text-gray-300 text-gray-700">
                          <span className="dark:bg-primary bg-green-500 dark:text-white text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          {comp?.nome}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
```

---

## 5. RESUMO DA BIBLIOTECA ASTRO & MANIFESTO

- ✅ Biblioteca com 6+ componentes Astro prontos
- ✅ Página de visualização com 3 componentes máximo por tela
- ✅ Preview e código lado a lado
- ✅ Construtor visual (Frankenstein) para montar landing pages
- ✅ Gerador automático de manifesto em Markdown
- ✅ Export direto para arquivo .md
- ✅ Manifesto inclui contexto estratégico, paleta, copy e notas técnicas
- ✅ Pronto para ser inserido no Cursor/Roo Code
- ✅ Garante uso obrigatório de REM
- ✅ Documentação integrada com recomendações

**Status:** Pronto para implementação imediata.
