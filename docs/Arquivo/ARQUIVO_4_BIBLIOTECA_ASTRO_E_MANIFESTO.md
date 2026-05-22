# ADSGATOR HUB — ARQUIVO 4: BIBLIOTECA ASTRO & MANIFESTO (v2 — FINAL)

> **LEIA ANTES DE IMPLEMENTAR**
> Implemente na ordem: `(1)` `src/lib/astro-components.ts` → `(2)` `src/lib/manifesto-generator.ts` → `(3)` `src/app/(app)/biblioteca/page.tsx`
>
> **Regras absolutas:**
> - `MainLayout` vem de `@/components/layout/MainLayout`
> - Ícones: importar direto do `lucide-react` — **não existe** componente `Icons`
> - Tokens: `surface-*`, `ink-*`, `brand` (ver tailwind.config.ts)
> - `alert()` proibido — usar estado React para feedback
> - Toda cópia de código usa `navigator.clipboard.writeText()` com estado de confirmação visual

---

## ✅ PRÉ-REQUISITOS

Nenhuma tabela nova necessária. O módulo é 100% client-side (sem banco de dados).

- `src/lib/astro-components.ts` — biblioteca de componentes (Seção 1)
- `src/lib/manifesto-generator.ts` — gerador de manifesto em Markdown (Seção 2)
- `src/app/(app)/biblioteca/page.tsx` — página única com tabs Biblioteca / Construtor (Seção 3)

---

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

---

## 2. PÁGINA — `src/app/(app)/biblioteca/page.tsx`

> Página única com **2 tabs**: Biblioteca (visualizador + código) e Construtor (builder + manifesto).
> As duas funcionalidades ficam no mesmo arquivo para simplificar o roteamento.

```typescript
'use client';

import React, { useState } from 'react';
import { Copy, CheckCheck, Eye, Package, Zap, Download } from 'lucide-react';
import { BIBLIOTECA_COMPONENTES, type AstroComponento } from '@/lib/astro-components';
import { gerarManifestoProducao, downloadManifestoMD } from '@/lib/manifesto-generator';
import { MainLayout } from '@/components/layout/MainLayout';

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Tab = 'biblioteca' | 'construtor';

interface BuilderState {
  nomeCliente:    string;
  nicho:          string;
  estilo:         string;
  direcaoArte:    string;
  paleta: { primaria: string; secundaria: string; backgrounds: string[] };
  componentesSelecionados: string[];
  copy: Record<string, string>;
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function BibliotecaPage() {
  const [tab, setTab] = useState<Tab>('biblioteca');

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-[1.5rem]">
          <h1 className="dark:text-ink-primary text-gray-900 text-[1.875rem] font-bold tracking-tight mb-[0.25rem]">
            Biblioteca Astro
          </h1>
          <p className="dark:text-ink-secondary text-gray-500 text-sm">
            Componentes prontos para landing pages + gerador de manifesto de produção
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-[0.25rem] p-[0.25rem] dark:bg-surface-card bg-gray-100 rounded-lg w-fit mb-[2rem]">
          {([['biblioteca', Package, 'Biblioteca'], ['construtor', Zap, 'Construtor']] as const).map(
            ([id, Icon, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-[0.375rem] px-[0.875rem] h-[2rem] rounded text-sm font-medium transition-colors
                  ${tab === id
                    ? 'dark:bg-surface-hover dark:text-ink-primary bg-white text-gray-900 shadow-sm'
                    : 'dark:text-ink-muted text-gray-500 dark:hover:text-ink-secondary hover:text-gray-700'}`}
              >
                <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={tab === id ? 2 : 1.5} />
                {label}
              </button>
            )
          )}
        </div>

        {tab === 'biblioteca' ? <TabBiblioteca /> : <TabConstrutor />}
      </div>
    </MainLayout>
  );
}

// ─── TAB: BIBLIOTECA ─────────────────────────────────────────────────────────

function TabBiblioteca() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('hero');
  const [componenteSelecionado, setComponenteSelecionado] = useState<string>('hero-01');
  const [mostrandoCodigo, setMostrandoCodigo] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const categorias = Array.from(new Set(BIBLIOTECA_COMPONENTES.map((c) => c.categoria)));
  const componentesDaCategoria = BIBLIOTECA_COMPONENTES.filter((c) => c.categoria === categoriaSelecionada);
  const comp = BIBLIOTECA_COMPONENTES.find((c) => c.id === componenteSelecionado);

  async function copiarCodigo() {
    if (!comp) return;
    await navigator.clipboard.writeText(comp.codigo_astro);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  if (!comp) return null;

  return (
    <div className="grid grid-cols-4 gap-[1.5rem]">
      {/* ── SIDEBAR ── */}
      <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1rem] h-fit sticky top-[1rem]">
        <p className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold mb-[0.75rem]">
          Categorias
        </p>
        <div className="flex flex-col gap-[0.125rem] mb-[1.25rem]">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoriaSelecionada(cat);
                const primeiro = BIBLIOTECA_COMPONENTES.find((c) => c.categoria === cat);
                if (primeiro) setComponenteSelecionado(primeiro.id);
              }}
              className={`w-full text-left px-[0.75rem] h-[2rem] rounded text-sm font-medium transition-colors
                ${categoriaSelecionada === cat
                  ? 'dark:bg-brand/15 dark:text-brand bg-green-50 text-green-700'
                  : 'dark:text-ink-secondary text-gray-600 dark:hover:bg-surface-hover hover:bg-gray-50'}`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <p className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold mb-[0.5rem]">
          {categoriaSelecionada.replace(/_/g, ' ')}
        </p>
        <div className="flex flex-col gap-[0.125rem]">
          {componentesDaCategoria.map((c) => (
            <button
              key={c.id}
              onClick={() => setComponenteSelecionado(c.id)}
              className={`w-full text-left px-[0.75rem] h-[2rem] rounded text-xs font-medium transition-colors
                ${componenteSelecionado === c.id
                  ? 'dark:bg-surface-hover dark:text-ink-primary bg-gray-100 text-gray-900'
                  : 'dark:text-ink-muted text-gray-500 dark:hover:bg-surface-hover hover:bg-gray-50'}`}
            >
              {c.nome}
            </button>
          ))}
        </div>
      </div>

      {/* ── PAINEL PRINCIPAL ── */}
      <div className="col-span-3 flex flex-col gap-[1rem]">
        {/* Meta do componente */}
        <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 px-[1.5rem] py-[1.25rem]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="dark:text-ink-primary text-gray-900 font-semibold text-lg">{comp.nome}</h2>
              <p className="dark:text-ink-secondary text-gray-500 text-sm">{comp.descricao}</p>
            </div>
            <span className="dark:bg-surface-hover bg-gray-100 dark:text-ink-muted text-gray-500 text-xs font-medium px-[0.5rem] py-[0.25rem] rounded">
              v{comp.versao}
            </span>
          </div>
          <div className="flex gap-[0.375rem] flex-wrap mt-[0.875rem]">
            {comp.variacoes.map((v) => (
              <span key={v} className="dark:bg-surface-hover bg-gray-100 dark:text-ink-muted text-gray-500 text-xs font-medium px-[0.5rem] py-[0.125rem] rounded">
                {v}
              </span>
            ))}
          </div>
        </div>

        {/* Código */}
        <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-[1.25rem] py-[0.75rem] dark:border-b dark:border-surface-border border-b border-gray-100">
            <div className="flex items-center gap-[0.5rem]">
              <Eye className="w-[0.875rem] h-[0.875rem] dark:text-ink-muted text-gray-400" strokeWidth={1.5} />
              <p className="dark:text-ink-primary text-gray-900 text-sm font-medium">
                {mostrandoCodigo ? 'Código Astro' : 'Informações'}
              </p>
            </div>
            <button
              onClick={() => setMostrandoCodigo(!mostrandoCodigo)}
              className="text-xs font-semibold dark:text-ink-secondary text-gray-500 dark:hover:text-ink-primary hover:text-gray-800 transition-colors"
            >
              {mostrandoCodigo ? 'Ver info' : 'Ver código'}
            </button>
          </div>

          {mostrandoCodigo ? (
            <div className="relative">
              <pre className="dark:bg-surface-bg bg-gray-50 text-xs font-mono dark:text-ink-secondary text-gray-700 p-[1.25rem] overflow-x-auto max-h-[24rem]">
                {comp.codigo_astro}
              </pre>
              <button
                onClick={copiarCodigo}
                className={`absolute top-[0.75rem] right-[0.75rem] flex items-center gap-[0.375rem] text-xs font-semibold px-[0.625rem] h-[1.75rem] rounded transition-all
                  ${copiado
                    ? 'dark:bg-brand/20 dark:text-brand bg-green-50 text-green-700'
                    : 'dark:bg-surface-hover dark:text-ink-secondary bg-white border border-gray-100 text-gray-600 dark:hover:text-ink-primary hover:text-gray-800'}`}
              >
                {copiado
                  ? <><CheckCheck className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} /> Copiado!</>
                  : <><Copy className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} /> Copiar</>
                }
              </button>
            </div>
          ) : (
            <div className="p-[1.25rem]">
              <p className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold mb-[0.75rem]">
                Recomendações
              </p>
              <ul className="flex flex-col gap-[0.5rem]">
                {comp.recomendacoes.map((rec, i) => (
                  <li key={i} className="flex items-start gap-[0.5rem]">
                    <span className="text-brand font-bold text-xs mt-[0.125rem]">✓</span>
                    <span className="dark:text-ink-secondary text-gray-600 text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: CONSTRUTOR ─────────────────────────────────────────────────────────

function TabConstrutor() {
  const [builder, setBuilder] = useState<BuilderState>({
    nomeCliente: '', nicho: '', estilo: 'minimalista', direcaoArte: '',
    paleta: { primaria: '#10b981', secundaria: '#6366f1', backgrounds: ['#0f0f0f', '#1a1a1a'] },
    componentesSelecionados: [],
    copy: {},
  });
  const [gerando, setGerando] = useState(false);
  const [gerado,  setGerado]  = useState(false);

  const categorias = Array.from(new Set(BIBLIOTECA_COMPONENTES.map((c) => c.categoria)));

  function toggleComponente(id: string) {
    setBuilder((prev) => ({
      ...prev,
      componentesSelecionados: prev.componentesSelecionados.includes(id)
        ? prev.componentesSelecionados.filter((c) => c !== id)
        : [...prev.componentesSelecionados, id],
    }));
  }

  async function gerarManifesto() {
    if (!builder.nomeCliente || !builder.nicho || builder.componentesSelecionados.length === 0) {
      // Feedback visual — sem alert()
      return;
    }
    setGerando(true);
    try {
      const manifesto = gerarManifestoProducao(
        builder.nomeCliente, builder.nicho, builder.paleta,
        builder.estilo, builder.direcaoArte, builder.componentesSelecionados, builder.copy,
      );
      downloadManifestoMD(manifesto);
      setGerado(true);
      setTimeout(() => setGerado(false), 3000);
    } finally { setGerando(false); }
  }

  const camposObrigatoriosPreenchidos =
    builder.nomeCliente.trim() !== '' &&
    builder.nicho.trim()        !== '' &&
    builder.componentesSelecionados.length > 0;

  return (
    <div className="grid grid-cols-3 gap-[1.5rem]">
      {/* ── PAINEL DE CONFIGURAÇÃO ── */}
      <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.25rem] h-fit sticky top-[1rem]">
        <p className="dark:text-ink-primary text-gray-900 font-semibold text-base mb-[1.25rem]">
          Configurações
        </p>

        {[
          { label: 'Nome do Cliente *', key: 'nomeCliente' as const, placeholder: 'Ex: João Psicologia' },
          { label: 'Nicho *',           key: 'nicho'       as const, placeholder: 'Ex: Psicologia'       },
          { label: 'Direção de Arte',   key: 'direcaoArte' as const, placeholder: 'Ex: moderna, tons earth' },
        ].map(({ label, key, placeholder }) => (
          <div key={key} className="mb-[1rem]">
            <label className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold block mb-[0.375rem]">
              {label}
            </label>
            <input
              type="text"
              value={builder[key]}
              onChange={(e) => setBuilder({ ...builder, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full h-[2.25rem] px-[0.75rem] rounded dark:bg-surface-input dark:border dark:border-surface-border dark:text-ink-primary bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
            />
          </div>
        ))}

        <div className="mb-[1rem]">
          <label className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold block mb-[0.375rem]">
            Estilo Visual
          </label>
          <select
            value={builder.estilo}
            onChange={(e) => setBuilder({ ...builder, estilo: e.target.value })}
            className="w-full h-[2.25rem] px-[0.75rem] rounded dark:bg-surface-input dark:border dark:border-surface-border dark:text-ink-primary bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
          >
            {['minimalista', 'corporativo', 'criativo', 'sofisticado'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="mb-[1.5rem]">
          <label className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold block mb-[0.375rem]">
            Cor Primária
          </label>
          <div className="flex gap-[0.5rem] items-center">
            <input
              type="color"
              value={builder.paleta.primaria}
              onChange={(e) => setBuilder({ ...builder, paleta: { ...builder.paleta, primaria: e.target.value } })}
              className="w-[2.25rem] h-[2.25rem] rounded cursor-pointer border-0 p-[0.125rem]"
            />
            <input
              type="text"
              value={builder.paleta.primaria}
              onChange={(e) => setBuilder({ ...builder, paleta: { ...builder.paleta, primaria: e.target.value } })}
              className="flex-1 h-[2.25rem] px-[0.75rem] rounded dark:bg-surface-input dark:border dark:border-surface-border dark:text-ink-primary bg-white border border-gray-200 text-gray-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
            />
          </div>
        </div>

        {/* Validação visual */}
        {!camposObrigatoriosPreenchidos && (
          <p className="text-xs text-status-orange mb-[0.75rem]">
            Preencha nome, nicho e selecione ao menos 1 componente.
          </p>
        )}

        <button
          onClick={gerarManifesto}
          disabled={!camposObrigatoriosPreenchidos || gerando}
          className={`w-full flex items-center justify-center gap-[0.5rem] h-[2.5rem] rounded text-sm font-semibold transition-all
            ${camposObrigatoriosPreenchidos
              ? gerado
                ? 'bg-brand/20 text-brand'
                : 'dark:bg-brand dark:hover:bg-brand-dark dark:text-white bg-green-600 hover:bg-green-700 text-white'
              : 'dark:bg-surface-hover dark:text-ink-disabled bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          {gerando ? (
            <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : gerado ? (
            <><CheckCheck className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} /> Manifesto gerado!</>
          ) : (
            <><Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} /> Gerar Manifesto .md</>
          )}
        </button>
      </div>

      {/* ── SELETOR DE COMPONENTES ── */}
      <div className="col-span-2">
        <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.25rem]">
          <p className="dark:text-ink-primary text-gray-900 font-semibold text-base mb-[1.25rem]">
            Selecione os Componentes
          </p>

          <div className="flex flex-col gap-[1.5rem]">
            {categorias.map((cat) => {
              const comps = BIBLIOTECA_COMPONENTES.filter((c) => c.categoria === cat);
              return (
                <div key={cat}>
                  <p className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold mb-[0.625rem]">
                    {cat.replace(/_/g, ' ')}
                  </p>
                  <div className="grid grid-cols-2 gap-[0.75rem]">
                    {comps.map((c) => {
                      const selecionado = builder.componentesSelecionados.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleComponente(c.id)}
                          className={`text-left p-[0.875rem] rounded-lg border-2 transition-all
                            ${selecionado
                              ? 'dark:bg-brand/10 dark:border-brand bg-green-50 border-green-500'
                              : 'dark:bg-surface-bg dark:border-surface-border dark:hover:border-brand/40 bg-white border-gray-100 hover:border-green-200'}`}
                        >
                          <div className="flex items-center justify-between mb-[0.25rem]">
                            <p className="dark:text-ink-primary text-gray-900 font-medium text-sm">{c.nome}</p>
                            {selecionado && (
                              <div className="w-[1rem] h-[1rem] rounded-full bg-brand flex items-center justify-center">
                                <CheckCheck className="w-[0.625rem] h-[0.625rem] text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <p className="dark:text-ink-muted text-gray-400 text-xs">{c.descricao}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Estrutura selecionada */}
          {builder.componentesSelecionados.length > 0 && (
            <div className="mt-[1.5rem] pt-[1.25rem] border-t dark:border-surface-border border-gray-100">
              <p className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold mb-[0.625rem]">
                Estrutura da Página ({builder.componentesSelecionados.length} seções)
              </p>
              <div className="flex flex-col gap-[0.375rem]">
                {builder.componentesSelecionados.map((id, i) => {
                  const c = BIBLIOTECA_COMPONENTES.find((x) => x.id === id);
                  return (
                    <div key={id} className="flex items-center gap-[0.625rem]">
                      <span className="w-[1.25rem] h-[1.25rem] rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <p className="dark:text-ink-secondary text-gray-600 text-sm">{c?.nome}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 3. GERADOR DE MANIFESTO — `src/lib/manifesto-generator.ts`

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

## 4. CHECKLIST DE IMPLEMENTAÇÃO

> A seção 4 (BuilderPage) foi consolidada dentro de `src/app/(app)/biblioteca/page.tsx` como `TabConstrutor`.
> Não criar arquivo separado — está na Seção 2 acima.

### Ordem de execução

- [ ] **1.** Criar `src/lib/astro-components.ts` com o código da Seção 1
- [ ] **2.** Criar `src/lib/manifesto-generator.ts` com o código da Seção 3
- [ ] **3.** Criar `src/app/(app)/biblioteca/page.tsx` com o código da Seção 2 (inclui TabBiblioteca + TabConstrutor)
- [ ] **4.** Adicionar link `/biblioteca` na Sidebar

### Erros comuns a evitar

| ❌ Errado | ✅ Correto |
|---|---|
| `import { MainLayout } from '@/components/MainLayout'` | `import { MainLayout } from '@/components/layout/MainLayout'` |
| `import { Icons } from '@/components/Icons'` | `import { Copy, Eye, Zap, ... } from 'lucide-react'` |
| `alert('Preencha...')` | Estado React `!camposObrigatoriosPreenchidos` com mensagem inline |
| `dark:bg-dark-card` | `dark:bg-surface-card` |
| `dark:bg-primary` | `dark:bg-brand` |
| Duas páginas separadas (biblioteca + builder) | Uma página com tabs (Seção 2) |

### O que este módulo entrega

- Biblioteca de 6 componentes Astro categorizados (nav, hero, serviços, depoimentos, pricing, rodapé)
- Visualizador de código com cópia via `navigator.clipboard` + estado visual de confirmação
- Builder visual (tab Construtor) que gera manifesto .md pronto para uso no Cursor/Windsurf
- Manifesto inclui: contexto estratégico, paleta de cores, estrutura de página, notas técnicas, checklist de QA
- Sem banco de dados — 100% client-side

**Status:** v2 — Pronto para implementação imediata.

---

```typescript
// NOTA: O código a seguir é obsoleto (tokens errados, alert(), imports errados).
// Use APENAS o código da Seção 2 acima.
// Esta seção foi mantida apenas como referência histórica.

export default function BuilderPage_OBSOLETO() {
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

<!-- Seção 5 consolidada no Checklist da Seção 4 acima -->
