# Project Snapshot

**Projeto:** `src`  
**Gerado em:** 2026-05-22 11:26:28  
**Total de arquivos:** 45  
**Raiz:** `C:\PROJETOS\ADSGATOR\ADSGATOR_HUB\src`  

---

## 📁 Estrutura de Arquivos

```
src/
├── 📁 app/
│   ├── 📁 (app)/
│   │   ├── 📁 ajuda/
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 analytics/
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 biblioteca/
│   │   │   └── 📄 page.tsx (21.3KB)
│   │   ├── 📁 clientes/
│   │   │   ├── 📁 [id]/
│   │   │   │   └── 📄 page.tsx (12.5KB)
│   │   │   ├── 📁 novo/
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 configuracoes/
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 dashboard/
│   │   │   └── 📄 page.tsx (11.5KB)
│   │   ├── 📁 financeiro/
│   │   │   └── 📄 page.tsx (10.3KB)
│   │   └── 📁 relatorios/
│   │       └── 📄 page.tsx (15.7KB)
│   ├── 📁 api/
│   │   ├── 📁 analytics/
│   │   │   └── 📁 [clienteId]/
│   │   │       └── 📄 route.ts
│   │   └── 📁 ia/
│   │       └── 📁 copy/
│   │           └── 📄 route.ts
│   ├── 📁 login/
│   │   └── 📄 page.tsx
│   ├── 📄 globals.css
│   ├── 📄 layout.tsx
│   └── 📄 page.tsx
├── 📁 components/
│   ├── 📁 clientes/
│   │   ├── 📄 AuditTimeline.tsx
│   │   ├── 📄 ChecklistCard.tsx
│   │   ├── 📄 ClienteCard.tsx
│   │   └── 📄 OnboardChecklist.tsx
│   ├── 📁 dashboard/
│   │   ├── 📄 AcoesDoDia.tsx
│   │   ├── 📄 ClienteProgressCard.tsx
│   │   └── 📄 KpiCard.tsx
│   ├── 📁 layout/
│   │   ├── 📄 MainLayout.tsx
│   │   ├── 📄 NotificationBell.tsx
│   │   ├── 📄 Sidebar.tsx
│   │   └── 📄 TopBar.tsx
│   └── 📁 ui/
│       ├── 📄 Badge.tsx
│       └── 📄 ThemeToggle.tsx
├── 📁 lib/
│   ├── 📁 hooks/
│   │   └── 📄 useClientes.ts
│   ├── 📁 supabase/
│   │   └── 📄 client.ts
│   ├── 📄 astro-components.ts (13.2KB)
│   ├── 📄 auth.ts
│   ├── 📄 database.ts
│   ├── 📄 financeiro.ts
│   ├── 📄 fluxo-operacional.ts
│   ├── 📄 google-ads.ts
│   ├── 📄 google-analytics.ts
│   ├── 📄 manifesto-generator.ts
│   ├── 📄 relatorio-generator.ts
│   ├── 📄 supabase.ts
│   ├── 📄 types.ts
│   ├── 📄 utils.ts
│   └── 📄 vertex-ai.ts
└── 📁 providers/
    └── 📄 ThemeProvider.tsx
```

---

## 📄 Conteúdo dos Arquivos

### `app\globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── TEMA ESCURO (padrão Adsgator) ────────────────────────────────────── */
:root {
  --surface-base:   10 10 10;
  --surface-card:   21 21 21;
  --surface-hover:  30 30 30;
  --surface-border: 45 45 45;

  --ink-primary:    255 255 255;
  --ink-secondary:  160 160 160;
  --ink-muted:      90 90 90;
}

/* ─── TEMA CLARO ────────────────────────────────────────────────────────── */
.light {
  --surface-base:   249 250 251;
  --surface-card:   255 255 255;
  --surface-hover:  243 244 246;
  --surface-border: 229 231 235;

  --ink-primary:    17 24 39;
  --ink-secondary:  107 114 128;
  --ink-muted:      156 163 175;
}

/* ─── BASE STYLES ───────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  background-color: rgb(var(--surface-base));
  color: rgb(var(--ink-primary));
  font-family: var(--font-geist-sans), 'Geist', system-ui, sans-serif;
  font-feature-settings: 'rlig' 1, 'calt' 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ─── SCROLLBAR CUSTOMIZADA ─────────────────────────────────────────────── */
::-webkit-scrollbar {
  width: 0.375rem;
  height: 0.375rem;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgb(var(--surface-border));
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgb(var(--ink-muted));
}

/* ─── SELEÇÃO DE TEXTO ──────────────────────────────────────────────────── */
::selection {
  background: rgba(255, 165, 0, 0.25);
  color: #FFA500;
}

/* ─── RECHARTS — remover outline no foco ───────────────────────────────── */
.recharts-surface:focus {
  outline: none;
}
```

### `app\layout.tsx`

```tsx
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@/providers/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Adsgator Hub',
  description: 'Sistema operacional interno da agência Adsgator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable} dark`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### `app\page.tsx`

```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
```

### `app\(app)\ajuda\page.tsx`

```tsx
'use client';

import { HelpCircle, BookOpen, MessageCircle, ExternalLink, Mail, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

// ─── PÁGINA DE AJUDA ──────────────────────────────────────────────────────────

export default function AjudaPage() {
  const recursos = [
    {
      icon: BookOpen,
      title: 'Documentação',
      description: 'Guia completo de uso da plataforma',
      href: '#',
    },
    {
      icon: MessageCircle,
      title: 'Suporte',
      description: 'Entre em contato com nossa equipe',
      href: '#',
    },
    {
      icon: FileText,
      title: 'FAQ',
      description: 'Perguntas frequentes respondidas',
      href: '#',
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'suporte@adsgator.com.br',
      href: 'mailto:suporte@adsgator.com.br',
    },
  ];

  return (
    <MainLayout
      title="Ajuda"
      subtitle="Central de suporte e recursos"
    >
      {/* HEADER INFO */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] mb-[1.5rem]">
        <div className="flex items-start gap-[1rem]">
          <div className="w-[2.5rem] h-[2.5rem] rounded-[0.5rem] bg-ads-500/10 flex items-center justify-center shrink-0">
            <HelpCircle className="w-[1.25rem] h-[1.25rem] text-ads-500" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-ink-primary font-semibold text-[1rem] mb-[0.25rem]">Como podemos ajudar?</h3>
            <p className="text-ink-secondary text-[0.875rem]">
              Encontre respostas, documentação e suporte para utilizar o ADSGATOR HUB.
            </p>
          </div>
        </div>
      </div>

      {/* RECURSOS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem]">
        {recursos.map(({ icon: Icon, title, description, href }) => (
          <a
            key={title}
            href={href}
            className="flex items-start gap-[1rem] bg-surface-card border border-surface-border rounded-xl p-[1.25rem] hover:border-ads-500/40 transition-colors group"
          >
            <div className="w-[2.25rem] h-[2.25rem] rounded-[0.375rem] bg-surface-hover flex items-center justify-center shrink-0 group-hover:bg-ads-500/10 transition-colors">
              <Icon className="w-[1.125rem] h-[1.125rem] text-ink-secondary group-hover:text-ads-500 transition-colors" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[0.375rem] mb-[0.25rem]">
                <h4 className="text-ink-primary font-medium text-[0.9375rem]">{title}</h4>
                <ExternalLink className="w-[0.75rem] h-[0.75rem] text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
              </div>
              <p className="text-ink-secondary text-[0.8125rem]">{description}</p>
            </div>
          </a>
        ))}
      </div>

      {/* VERSÃO */}
      <div className="mt-[2rem] pt-[1.5rem] border-t border-surface-border text-center">
        <p className="text-ink-muted text-[0.75rem]">
          ADSGATOR HUB v1.0.0
        </p>
      </div>
    </MainLayout>
  );
}
```

### `app\(app)\analytics\page.tsx`

```tsx
'use client';

import { BarChart2, TrendingUp, ArrowUpRight, Calendar, Filter, RefreshCw } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

// ─── PLACEHOLDER ──────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  return (
    <MainLayout
      title="Analytics"
      subtitle="Visão geral de métricas e performance"
      actions={
        <div className="flex items-center gap-[0.625rem]">
          <button className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] font-medium hover:border-ads-500/40 transition-colors">
            <Calendar className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            Últimos 30 dias
          </button>
          <button className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] font-medium hover:border-ads-500/40 transition-colors">
            <Filter className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            Filtrar
          </button>
          <button className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors">
            <RefreshCw className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            Atualizar
          </button>
        </div>
      }
    >
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1rem] mb-[1.5rem]">
        {[
          { label: 'Investimento Total', valor: 'R$ 0,00', sub: 'Este mês', icon: TrendingUp, cor: 'text-status-blue' },
          { label: 'Conversões', valor: '0', sub: 'Leads/vendas', icon: ArrowUpRight, cor: 'text-brand' },
          { label: 'CTR Médio', valor: '0%', sub: 'Click-through rate', icon: BarChart2, cor: 'text-status-purple' },
          { label: 'CPA Médio', valor: 'R$ 0,00', sub: 'Custo por aquisição', icon: Calendar, cor: 'text-status-orange' },
        ].map(({ label, valor, sub, icon: Icon, cor }) => (
          <div key={label} className="bg-surface-card border border-surface-border rounded-xl px-[1.25rem] py-[1rem]">
            <div className="flex items-start justify-between mb-[0.5rem]">
              <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">{label}</p>
              <Icon className={`w-[1rem] h-[1rem] ${cor}`} strokeWidth={1.5} />
            </div>
            <p className={`text-[1.75rem] font-bold leading-none mb-[0.375rem] ${cor}`}>{valor}</p>
            <p className="text-ink-muted text-[0.75rem]">{sub}</p>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-[4rem] text-center">
        <BarChart2 className="w-[3rem] h-[3rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
        <h3 className="text-ink-primary font-semibold text-[1rem] mb-[0.5rem]">Analytics em desenvolvimento</h3>
        <p className="text-ink-secondary text-[0.875rem] max-w-[24rem] mx-auto">
          Esta página está sendo construída. Em breve você terá acesso a dashboards completos com dados de Google Ads e GA4.
        </p>
      </div>
    </MainLayout>
  );
}
```

### `app\(app)\biblioteca\page.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import { Copy, CheckCheck, Eye, BookOpen, Wrench, Download, Sparkles } from 'lucide-react';
import {
  BIBLIOTECA_COMPONENTES,
  obterCategorias,
  type AstroComponente,
  type CategoriaAstro,
} from '@/lib/astro-components';
import {
  gerarManifestoProducao,
  downloadManifestoMD,
  type PaletaCores,
} from '@/lib/manifesto-generator';
import { MainLayout } from '@/components/layout/MainLayout';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

interface BuilderState {
  nomeCliente:             string;
  nicho:                   string;
  estilo:                  string;
  direcaoArte:             string;
  paleta:                  PaletaCores;
  componentesSelecionados: string[];
  copy:                    Record<string, string>;
}

type Aba = 'biblioteca' | 'construtor';

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function BibliotecaPage() {
  const [aba, setAba] = useState<Aba>('biblioteca');

  return (
    <MainLayout>
      {/* HEADER */}
      <div className="mb-[2rem]">
        <h1 className="dark:text-ink-primary text-gray-900 text-[1.875rem] font-bold tracking-tight mb-[0.25rem]">
          Biblioteca Astro & Construtor
        </h1>
        <p className="dark:text-ink-secondary text-gray-500 text-sm">
          Componentes prontos para landing pages + gerador de manifesto de produção
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-[0.25rem] mb-[1.5rem] dark:bg-surface-hover bg-gray-100 p-[0.25rem] rounded-lg w-fit">
        {([
          { id: 'biblioteca' as Aba, label: 'Biblioteca', icon: BookOpen },
          { id: 'construtor' as Aba, label: 'Construtor',  icon: Wrench  },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`flex items-center gap-[0.5rem] px-[1rem] h-[2.25rem] rounded text-sm font-medium transition-colors
              ${aba === id
                ? 'dark:bg-surface-card dark:text-ink-primary bg-white text-gray-900 shadow-sm'
                : 'dark:text-ink-muted text-gray-500 dark:hover:text-ink-secondary hover:text-gray-700'}`}
          >
            <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {aba === 'biblioteca' ? <TabBiblioteca /> : <TabConstrutor />}
    </MainLayout>
  );
}

// ─── TAB: BIBLIOTECA ─────────────────────────────────────────────────────────

function TabBiblioteca() {
  const categorias                     = obterCategorias();
  const [categoriaSel, setCategoriaSel] = useState<CategoriaAstro>(categorias[0]);
  const [componenteSel, setComponenteSel] = useState<string>(
    BIBLIOTECA_COMPONENTES.find((c) => c.categoria === categorias[0])?.id ?? ''
  );
  const [mostrandoCodigo, setMostrandoCodigo] = useState(false);
  const [copiado, setCopiado]                 = useState(false);

  const componentesDaCategoria = BIBLIOTECA_COMPONENTES.filter((c) => c.categoria === categoriaSel);
  const comp: AstroComponente | undefined = BIBLIOTECA_COMPONENTES.find((c) => c.id === componenteSel);

  async function copiarCodigo() {
    if (!comp) return;
    await navigator.clipboard.writeText(comp.codigo_astro);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  if (!comp) return null;

  return (
    <div className="grid grid-cols-4 gap-[1.5rem]">
      {/* SIDEBAR */}
      <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1rem] h-fit sticky top-[1rem]">
        <p className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold mb-[0.75rem]">
          Categorias
        </p>
        <div className="flex flex-col gap-[0.125rem] mb-[1.25rem]">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoriaSel(cat);
                const primeiro = BIBLIOTECA_COMPONENTES.find((c) => c.categoria === cat);
                if (primeiro) setComponenteSel(primeiro.id);
              }}
              className={`w-full text-left px-[0.75rem] h-[2rem] rounded text-sm font-medium transition-colors
                ${categoriaSel === cat
                  ? 'dark:bg-brand/15 dark:text-brand bg-green-50 text-green-700'
                  : 'dark:text-ink-secondary text-gray-600 dark:hover:bg-surface-hover hover:bg-gray-50'}`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <p className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold mb-[0.5rem]">
          {categoriaSel.replace(/_/g, ' ')}
        </p>
        <div className="flex flex-col gap-[0.125rem]">
          {componentesDaCategoria.map((c) => (
            <button
              key={c.id}
              onClick={() => setComponenteSel(c.id)}
              className={`w-full text-left px-[0.75rem] h-[2rem] rounded text-xs font-medium transition-colors
                ${componenteSel === c.id
                  ? 'dark:bg-surface-hover dark:text-ink-primary bg-gray-100 text-gray-900'
                  : 'dark:text-ink-muted text-gray-500 dark:hover:bg-surface-hover hover:bg-gray-50'}`}
            >
              {c.nome}
            </button>
          ))}
        </div>
      </div>

      {/* PAINEL PRINCIPAL */}
      <div className="col-span-3 flex flex-col gap-[1rem]">
        {/* Meta */}
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

        {/* Código / Recomendações */}
        <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-[1.25rem] py-[0.75rem] border-b dark:border-surface-border border-gray-100">
            <div className="flex items-center gap-[0.5rem]">
              <Eye className="w-[0.875rem] h-[0.875rem] dark:text-ink-muted text-gray-400" strokeWidth={1.5} />
              <p className="dark:text-ink-primary text-gray-900 text-sm font-medium">
                {mostrandoCodigo ? 'Código Astro' : 'Recomendações'}
              </p>
            </div>
            <button
              onClick={() => setMostrandoCodigo(!mostrandoCodigo)}
              className="text-xs font-semibold dark:text-ink-secondary text-gray-500 dark:hover:text-ink-primary hover:text-gray-800 transition-colors"
            >
              {mostrandoCodigo ? 'Ver recomendações' : 'Ver código'}
            </button>
          </div>

          {mostrandoCodigo ? (
            <div className="relative">
              <pre className="dark:bg-surface-bg bg-gray-50 text-xs font-mono dark:text-ink-secondary text-gray-700 p-[1.25rem] overflow-x-auto max-h-[28rem]">
                {comp.codigo_astro}
              </pre>
              <button
                onClick={copiarCodigo}
                className={`absolute top-[0.75rem] right-[0.75rem] flex items-center gap-[0.375rem] text-xs font-semibold px-[0.625rem] h-[1.75rem] rounded transition-all
                  ${copiado
                    ? 'dark:bg-brand/20 dark:text-brand bg-green-50 text-green-700'
                    : 'dark:bg-surface-hover dark:text-ink-secondary bg-white border border-gray-100 text-gray-600 hover:text-gray-800'}`}
              >
                {copiado
                  ? <><CheckCheck className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} /> Copiado!</>
                  : <><Copy className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} /> Copiar</>}
              </button>
            </div>
          ) : (
            <div className="p-[1.25rem]">
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
  const [gerando,      setGerando]      = useState(false);
  const [gerado,        setGerado]        = useState(false);
  const [gerandoCopy,   setGerandoCopy]   = useState(false);
  const [copyGerada,    setCopyGerada]    = useState<Record<string, string> | null>(null);

  async function gerarCopyIA() {
    if (!builder.nomeCliente || !builder.nicho) return;
    setGerandoCopy(true);
    try {
      const res  = await fetch('/api/ia/copy', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          nomeCliente: builder.nomeCliente,
          nicho:       builder.nicho,
          estilo:      builder.estilo,
          direcaoArte: builder.direcaoArte,
        }),
      });
      const json = await res.json() as { copy?: Record<string, string> };
      if (json.copy) {
        setCopyGerada(json.copy);
        setBuilder((prev) => ({ ...prev, copy: json.copy! }));
      }
    } catch (e) { console.error(e); }
    finally { setGerandoCopy(false); }
  }

  const categorias = obterCategorias();

  function toggleComponente(id: string) {
    setBuilder((prev) => ({
      ...prev,
      componentesSelecionados: prev.componentesSelecionados.includes(id)
        ? prev.componentesSelecionados.filter((c) => c !== id)
        : [...prev.componentesSelecionados, id],
    }));
  }

  async function gerarManifesto() {
    setGerando(true);
    try {
      const manifesto = gerarManifestoProducao(
        builder.nomeCliente, builder.nicho, builder.paleta,
        builder.estilo, builder.direcaoArte,
        builder.componentesSelecionados, builder.copy,
      );
      downloadManifestoMD(manifesto);
      setGerado(true);
      setTimeout(() => setGerado(false), 3000);
    } finally {
      setGerando(false);
    }
  }

  const valido =
    builder.nomeCliente.trim() !== '' &&
    builder.nicho.trim()        !== '' &&
    builder.componentesSelecionados.length > 0;

  return (
    <div className="grid grid-cols-3 gap-[1.5rem]">
      {/* CONFIGURAÇÃO */}
      <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.25rem] h-fit sticky top-[1rem]">
        <p className="dark:text-ink-primary text-gray-900 font-semibold text-base mb-[1.25rem]">
          Configurações
        </p>

        {([
          { label: 'Nome do Cliente *', key: 'nomeCliente' as const, placeholder: 'Ex: João Psicologia' },
          { label: 'Nicho *',           key: 'nicho'       as const, placeholder: 'Ex: Psicologia'       },
          { label: 'Direção de Arte',   key: 'direcaoArte' as const, placeholder: 'Ex: moderna, tons earth' },
        ]).map(({ label, key, placeholder }) => (
          <div key={key} className="mb-[1rem]">
            <label className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold block mb-[0.375rem]">
              {label}
            </label>
            <input
              type="text"
              value={builder[key]}
              onChange={(e) => setBuilder({ ...builder, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full h-[2.25rem] px-[0.75rem] rounded dark:bg-surface-hover dark:border dark:border-surface-border dark:text-ink-primary bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
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
            className="w-full h-[2.25rem] px-[0.75rem] rounded dark:bg-surface-hover dark:border dark:border-surface-border dark:text-ink-primary bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
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
              className="flex-1 h-[2.25rem] px-[0.75rem] rounded dark:bg-surface-hover dark:border dark:border-surface-border dark:text-ink-primary bg-white border border-gray-200 text-gray-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
            />
          </div>
        </div>

        {/* BOTÃO GERAR COPY IA */}
        {builder.nomeCliente && builder.nicho && (
          <button
            onClick={gerarCopyIA}
            disabled={gerandoCopy}
            className="w-full flex items-center justify-center gap-[0.5rem] h-[2.25rem] rounded text-sm font-medium dark:bg-status-purple/15 dark:text-status-purple bg-purple-50 text-purple-700 hover:opacity-80 transition-opacity disabled:opacity-50 mb-[0.75rem]"
          >
            {gerandoCopy
              ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <Sparkles className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.5} />
            }
            {copyGerada ? 'Regenerar Copy com IA' : 'Gerar Copy com IA'}
          </button>
        )}

        {copyGerada && (
          <div className="dark:bg-surface-hover bg-gray-50 rounded border dark:border-surface-border border-gray-100 p-[0.75rem] mb-[0.75rem] text-xs">
            <p className="dark:text-ink-muted text-gray-400 font-semibold uppercase tracking-wide mb-[0.5rem]">Copy gerada</p>
            <p className="dark:text-ink-primary text-gray-900 font-semibold mb-[0.25rem]">{copyGerada.headline}</p>
            <p className="dark:text-ink-secondary text-gray-600">{copyGerada.subtitulo}</p>
          </div>
        )}

        {!valido && (
          <p className="text-xs text-status-orange mb-[0.75rem]">
            Preencha nome, nicho e selecione ao menos 1 componente.
          </p>
        )}

        <button
          onClick={gerarManifesto}
          disabled={!valido || gerando}
          className={`w-full flex items-center justify-center gap-[0.5rem] h-[2.5rem] rounded text-sm font-semibold transition-all
            ${valido
              ? gerado
                ? 'bg-brand/20 text-brand'
                : 'dark:bg-brand dark:text-white bg-green-600 text-white hover:opacity-90'
              : 'dark:bg-surface-hover dark:text-ink-disabled bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          {gerando
            ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
            : gerado
              ? <><CheckCheck className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} /> Manifesto gerado!</>
              : <><Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} /> Gerar Manifesto .md</>
          }
        </button>
      </div>

      {/* SELETOR DE COMPONENTES */}
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
                      const sel = builder.componentesSelecionados.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleComponente(c.id)}
                          className={`text-left p-[0.875rem] rounded-lg border-2 transition-all
                            ${sel
                              ? 'dark:bg-brand/10 dark:border-brand bg-green-50 border-green-500'
                              : 'dark:bg-surface-bg dark:border-surface-border dark:hover:border-brand/40 bg-white border-gray-100 hover:border-green-200'}`}
                        >
                          <div className="flex items-center justify-between mb-[0.25rem]">
                            <p className="dark:text-ink-primary text-gray-900 font-medium text-sm">{c.nome}</p>
                            {sel && (
                              <div className="w-[1rem] h-[1rem] rounded-full bg-brand flex items-center justify-center shrink-0">
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

          {builder.componentesSelecionados.length > 0 && (
            <div className="mt-[1.5rem] pt-[1.25rem] border-t dark:border-surface-border border-gray-100">
              <p className="dark:text-ink-muted text-gray-400 text-xs uppercase tracking-wide font-semibold mb-[0.625rem]">
                Estrutura ({builder.componentesSelecionados.length} seções)
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

### `app\(app)\clientes\page.tsx`

```tsx
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Users, AlertTriangle, Snowflake } from 'lucide-react'
import { MainLayout }          from '@/components/layout/MainLayout'
import { ClienteProgressCard } from '@/components/dashboard/ClienteProgressCard'
import { useClientes }         from '@/lib/hooks/useClientes'
import { supabase }            from '@/lib/supabase'

const STATUS_OPCOES = [
  { value: '',                label: 'Todos'          },
  { value: 'recebido',        label: 'Recebido'       },
  { value: 'onboarding',      label: 'Onboarding'     },
  { value: 'setup_trafego',   label: 'Setup Tráfego'  },
  { value: 'ativo',           label: 'Ativo'          },
  { value: 'congelado',       label: 'Congelado'      },
  { value: 'cancelado_debito',label: 'Cancelado D.'   },
  { value: 'cancelado',       label: 'Cancelado'      },
] as const

export default function ClientesPage() {
  const { dados, loading, metricas, recarregar } = useClientes()
  const [busca,  setBusca]  = useState('')
  const [filtro, setFiltro] = useState('')

  async function handleCongelar(id: string) {
    await supabase.from('clientes').update({ status: 'congelado' }).eq('id', id)
    recarregar()
  }

  const visiveis = useMemo(() =>
    dados.filter(({ cliente: c }) => {
      const matchStatus = filtro === '' || c.status === filtro
      const matchBusca  = busca  === '' ||
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (c.email ?? '').toLowerCase().includes(busca.toLowerCase())
      return matchStatus && matchBusca
    }),
    [dados, filtro, busca]
  )

  return (
    <MainLayout
      title="Clientes"
      subtitle={loading ? '...' : `${metricas.total} clientes · ${metricas.ativos} ativos · ${metricas.inadimplentes} inadimplentes`}
      actions={
        <Link
          href="/clientes/novo"
          className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors"
        >
          <Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
          <span>Novo Cliente</span>
        </Link>
      }
    >

      {/* ── ALERTAS RÁPIDOS ─────────────────────────────────────────── */}
      {metricas.inadimplentes > 0 && !loading && (
        <div className="flex items-center gap-[0.625rem] bg-status-orange/10 border border-status-orange/30 rounded-xl px-[1rem] py-[0.75rem] mb-[1.5rem]">
          <AlertTriangle className="w-[1rem] h-[1rem] text-status-orange shrink-0" strokeWidth={2} />
          <p className="text-status-orange text-[0.875rem] font-medium">
            {metricas.inadimplentes} cliente{metricas.inadimplentes > 1 ? 's' : ''} com pagamento em atraso
          </p>
          <button onClick={() => setFiltro('cancelado_debito')} className="ml-auto text-status-orange text-[0.75rem] underline">
            Filtrar
          </button>
        </div>
      )}

      {metricas.retidos > 0 && !loading && (
        <div className="flex items-center gap-[0.625rem] bg-status-blue/10 border border-status-blue/30 rounded-xl px-[1rem] py-[0.75rem] mb-[1.5rem]">
          <Snowflake className="w-[1rem] h-[1rem] text-status-blue shrink-0" strokeWidth={2} />
          <p className="text-status-blue text-[0.875rem] font-medium">
            {metricas.retidos} cliente{metricas.retidos > 1 ? 's' : ''} congelado{metricas.retidos > 1 ? 's' : ''} aguardando retorno
          </p>
          <button onClick={() => setFiltro('congelado')} className="ml-auto text-status-blue text-[0.75rem] underline">
            Filtrar
          </button>
        </div>
      )}

      {/* ── FILTROS ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-[0.75rem] mb-[1.5rem]">
        <div className="relative flex-1">
          <Search className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full h-[2.25rem] pl-[2.25rem] pr-[0.75rem] rounded-[0.375rem] bg-surface-input border border-surface-border text-ink-primary placeholder-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
          />
        </div>
        <div className="flex gap-[0.375rem] flex-wrap">
          {STATUS_OPCOES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFiltro(value)}
              className={`h-[2.25rem] px-[0.75rem] rounded-[0.375rem] text-[0.8125rem] font-medium transition-colors ${
                filtro === value
                  ? 'bg-ads-500 text-white'
                  : 'bg-surface-hover text-ink-secondary hover:text-ink-primary border border-surface-border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1rem]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[10rem] rounded-xl bg-surface-card border border-surface-border animate-pulse" />
          ))}
        </div>
      ) : visiveis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[4rem] gap-[1rem] text-ink-muted">
          <Users className="w-[3rem] h-[3rem]" strokeWidth={1} />
          <p className="text-[0.9375rem]">
            {busca || filtro ? 'Nenhum cliente encontrado com esses filtros.' : 'Nenhum cliente cadastrado ainda.'}
          </p>
          {!busca && !filtro && (
            <Link href="/clientes/novo" className="text-ads-500 hover:underline text-[0.875rem] font-medium">
              Cadastrar primeiro cliente
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1rem]">
          {visiveis.map(({ cliente, estagio }) => (
            <ClienteProgressCard
              key={cliente.id}
              cliente={cliente}
              estagio={estagio}
              onCongelar={handleCongelar}
            />
          ))}
        </div>
      )}
    </MainLayout>
  )
}
```

### `app\(app)\clientes\[id]\page.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, MessageCircle, ExternalLink,
  Clock, ChevronRight, RefreshCw, BarChart3,
} from 'lucide-react'
import { MainLayout }      from '@/components/layout/MainLayout'
import { ChecklistCard }   from '@/components/clientes/ChecklistCard'
import { AuditTimeline }   from '@/components/clientes/AuditTimeline'
import { supabase }        from '@/lib/supabase'
import type { Cliente, Estagio } from '@/lib/types'

const STATUS_LABEL: Record<string, string> = {
  recebido:        'Recebido',
  onboarding:      'Onboarding',
  setup_trafego:   'Setup Tráfego',
  ativo:           'Ativo',
  congelado:       'Congelado',
  cancelado_debito:'Cancelado D.',
  cancelado:       'Cancelado',
}

const FLUXO_PROXIMO: Record<string, string> = {
  recebido:      'onboarding',
  onboarding:    'setup_trafego',
  setup_trafego: 'ativo',
}

export default function ClienteDetalhe() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()

  const [cliente,   setCliente]   = useState<Cliente | null>(null)
  const [estagio,   setEstagio]   = useState<Estagio | null>(null)
  const [estagios,  setEstagios]  = useState<Estagio[]>([])
  const [loading,   setLoading]   = useState(true)
  const [avancando, setAvancando] = useState(false)

  async function carregar() {
    const [{ data: c }, { data: ests }] = await Promise.all([
      supabase.from('clientes').select('*').eq('id', id).single(),
      supabase.from('estagios_operacionais').select('*').eq('cliente_id', id).order('data_entrada', { ascending: false }),
    ])
    setCliente(c as Cliente ?? null)
    const lista = (ests ?? []) as Estagio[]
    setEstagios(lista)
    setEstagio(lista.find((e) => e.data_saida === null || e.data_saida === undefined) ?? null)
    setLoading(false)
  }

  useEffect(() => { if (id) carregar() }, [id])

  async function handleAvancar() {
    if (!cliente) return
    const proximo = FLUXO_PROXIMO[cliente.status]
    if (!proximo) return
    setAvancando(true)
    try {
      await supabase.from('clientes').update({ status: proximo }).eq('id', id)
      if (estagio) {
        await supabase.from('estagios_operacionais').update({ data_saida: new Date().toISOString() }).eq('id', estagio.id)
      }
      await supabase.from('estagios_operacionais').insert({
        cliente_id:   id,
        estagio:      proximo,
        acao_proxima: STATUS_LABEL[proximo] ?? proximo,
      })
      await carregar()
    } finally {
      setAvancando(false)
    }
  }

  const ORDEM = ['recebido', 'onboarding', 'setup_trafego', 'ativo']

  if (loading || !cliente) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[20rem]">
          <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    )
  }

  const indiceAtual = ORDEM.indexOf(cliente.status)
  const proximo     = FLUXO_PROXIMO[cliente.status]

  return (
    <MainLayout
      title={cliente.nome}
      subtitle={cliente.nicho ?? ''}
    >
      <button
        onClick={() => router.back()}
        className="flex items-center gap-[0.375rem] text-ink-muted hover:text-ink-secondary text-[0.875rem] mb-[1.5rem] transition-colors"
      >
        <ArrowLeft className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
        Voltar
      </button>

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between mb-[2rem]">
        <div>
          <div className="flex items-center gap-[0.75rem] mb-[0.25rem]">
            <span className="text-[0.75rem] font-semibold px-[0.5rem] py-[0.125rem] rounded bg-ads-500/15 text-ads-500">
              {STATUS_LABEL[cliente.status] ?? cliente.status}
            </span>
            {(cliente.dias_atraso ?? 0) > 0 && (
              <span className="flex items-center gap-[0.25rem] text-[0.75rem] font-semibold text-status-red bg-status-red/10 px-[0.5rem] py-[0.125rem] rounded">
                <Clock className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                {cliente.dias_atraso}d atraso
              </span>
            )}
          </div>
          <p className="text-ink-secondary text-[0.875rem]">{cliente.email}</p>
          {cliente.dominio && (
            <a
              href={`https://${cliente.dominio}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[0.25rem] text-[0.75rem] text-ads-500 mt-[0.25rem] hover:underline"
            >
              {cliente.dominio}
              <ExternalLink className="w-[0.625rem] h-[0.625rem]" strokeWidth={1.5} />
            </a>
          )}
        </div>

        {/* Stepper de progresso */}
        <div className="hidden md:flex items-center gap-[0.25rem]">
          {ORDEM.map((s, idx) => (
            <div key={s} className="flex items-center gap-[0.25rem]">
              <div className={`
                text-[0.6875rem] font-medium px-[0.5rem] h-[1.5rem] rounded flex items-center
                ${ idx < indiceAtual  ? 'bg-ads-500/15 text-ads-500'
                  : idx === indiceAtual ? 'bg-ads-500 text-white'
                  : 'bg-surface-hover text-ink-muted border border-surface-border'}
              `}>
                {STATUS_LABEL[s]}
              </div>
              {idx < ORDEM.length - 1 && (
                <ChevronRight className="w-[0.625rem] h-[0.625rem] text-ink-muted" strokeWidth={1.5} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1.5rem]">
        {/* ── COLUNA PRINCIPAL ── */}
        <div className="lg:col-span-2 flex flex-col gap-[1.5rem]">

          {/* Ação atual + WhatsApp */}
          {estagio && (
            <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
              <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.5rem]">Ação atual</p>
              <h2 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1rem]">
                {estagio.acao_proxima ?? estagio.estagio}
              </h2>
              <div className="flex flex-wrap gap-[0.625rem]">
                {estagio.acao_url && (
                  <a
                    href={estagio.acao_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-[0.5rem] bg-ads-500/10 hover:bg-ads-500/20 text-ads-500 border border-ads-500/30 text-[0.875rem] font-semibold px-[0.875rem] h-[2.25rem] rounded-[0.375rem] transition-colors"
                  >
                    <MessageCircle className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
                    {estagio.acao_label ?? 'Enviar mensagem'}
                  </a>
                )}
                {proximo && (
                  <button
                    onClick={handleAvancar}
                    disabled={avancando}
                    className="inline-flex items-center gap-[0.5rem] bg-ads-500 hover:bg-ads-600 text-white text-[0.875rem] font-semibold px-[0.875rem] h-[2.25rem] rounded-[0.375rem] transition-colors disabled:opacity-50"
                  >
                    {avancando
                      ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <RefreshCw className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                    }
                    Avançar para {STATUS_LABEL[proximo]}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Checklist do estágio ativo */}
          {estagio?.checklist && estagio.checklist.length > 0 && (
            <ChecklistCard
              clienteId={id}
              estagioId={estagio.id}
              items={estagio.checklist}
            />
          )}

          {/* Analytics rápido */}
          <a
            href={`/relatorios?cliente=${id}`}
            className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] flex items-center justify-between hover:border-ads-500/40 transition-colors group"
          >
            <div className="flex items-center gap-[0.75rem]">
              <BarChart3 className="w-[1.25rem] h-[1.25rem] text-ink-muted group-hover:text-ads-500 transition-colors" strokeWidth={1.5} />
              <div>
                <p className="text-ink-primary text-[0.875rem] font-semibold">Relatórios de Performance</p>
                <p className="text-ink-muted text-[0.75rem]">Google Ads + GA4 — ver histórico</p>
              </div>
            </div>
            <ExternalLink className="w-[0.875rem] h-[0.875rem] text-ink-muted group-hover:text-ads-500 transition-colors" strokeWidth={1.5} />
          </a>

          {/* Audit Timeline */}
          <AuditTimeline clienteId={id} />
        </div>

        {/* ── COLUNA LATERAL ── */}
        <div className="flex flex-col gap-[1rem]">
          <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
            <h3 className="text-ink-primary font-semibold text-[0.875rem] mb-[1rem]">Informações</h3>
            <div className="flex flex-col gap-[0.75rem]">
              {([
                { label: 'Nicho',         valor: cliente.nicho },
                { label: 'WhatsApp',      valor: cliente.whatsapp },
                { label: 'Domínio',       valor: cliente.dominio ?? '—' },
                { label: 'Google Ads ID', valor: cliente.google_ads_customer_id ?? 'Não configurado' },
                { label: 'GA4 ID',        valor: cliente.ga4_property_id ?? 'Não configurado' },
              ] as { label: string; valor: string | undefined }[]).map(({ label, valor }) => (
                <div key={label}>
                  <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.125rem]">{label}</p>
                  <p className="text-ink-secondary text-[0.875rem] break-all">{valor ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Financeiro */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
            <h3 className="text-ink-primary font-semibold text-[0.875rem] mb-[1rem]">Financeiro</h3>
            <div className="flex flex-col gap-[0.75rem]">
              <div>
                <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.125rem]">MRR</p>
                <p className="text-ink-primary text-[1.25rem] font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.mrr ?? 0)}
                </p>
              </div>
              {cliente.plano && (
                <div>
                  <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.125rem]">Plano</p>
                  <p className="text-ink-secondary text-[0.875rem]">{cliente.plano}</p>
                </div>
              )}
              {(cliente.dias_atraso ?? 0) > 0 && (
                <div className="flex items-center gap-[0.375rem] bg-status-red/10 text-status-red text-[0.75rem] font-semibold px-[0.625rem] py-[0.375rem] rounded">
                  <Clock className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                  {cliente.dias_atraso} dias de atraso
                </div>
              )}
            </div>
          </div>

          {/* Estágios anteriores */}
          {estagios.filter((e) => e.data_saida).length > 0 && (
            <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
              <h3 className="text-ink-primary font-semibold text-[0.875rem] mb-[0.75rem]">Etapas concluídas</h3>
              <ul className="space-y-[0.5rem]">
                {estagios.filter((e) => e.data_saida).map((e) => (
                  <li key={e.id} className="flex items-center gap-[0.5rem] text-ink-muted text-[0.8125rem]">
                    <div className="w-[0.375rem] h-[0.375rem] rounded-full bg-ads-500/50 shrink-0" />
                    {STATUS_LABEL[e.estagio] ?? e.estagio}
                    {e.data_saida && (
                      <span className="ml-auto text-[0.6875rem]">
                        {new Date(e.data_saida).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
```

### `app\(app)\clientes\novo\page.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { criarCliente, criarAssinatura } from '@/lib/database';
import { MainLayout } from '@/components/layout/MainLayout';
import type { ClienteStatus } from '@/lib/types';

const NICHOS_SUGERIDOS = [
  'Psicologia', 'Odontologia', 'Estética', 'Advocacia', 'Medicina',
  'Fisioterapia', 'Nutrição', 'Academia', 'Imóveis', 'Adestramento',
  'Educação', 'Contabilidade', 'Engenharia', 'Outro',
];

export default function NovoClientePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: '', email: '', whatsapp: '',
    dominio: '', nicho: '', plano_nome: '', valor_mensal: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro,     setErro]     = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      const novoCliente = await criarCliente({
        nome:                   form.nome.trim(),
        email:                  form.email.trim().toLowerCase(),
        whatsapp:               form.whatsapp.replace(/\D/g, ''),
        dominio:                form.dominio.trim() || undefined,
        nicho:                  form.nicho.trim(),
        status:                 'recebido' as ClienteStatus,
        google_ads_customer_id: undefined,
        ga4_property_id:        undefined,
      });

      if (form.plano_nome && form.valor_mensal) {
        await criarAssinatura({
          cliente_id:   novoCliente.id,
          plano_nome:   form.plano_nome.trim(),
          valor_mensal: parseFloat(form.valor_mensal),
        });
      }

      router.push('/dashboard');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar cliente');
    } finally {
      setSalvando(false);
    }
  }

  const inputClass = `
    w-full h-[2.5rem] px-[0.75rem] rounded
    dark:bg-surface-input dark:border dark:border-surface-border dark:text-ink-primary dark:placeholder-ink-muted
    bg-white border border-gray-200 text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand
    text-sm transition-colors
  `;

  const labelClass = 'block dark:text-ink-secondary text-gray-700 text-sm font-medium mb-[0.375rem]';

  return (
    <MainLayout>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-[0.375rem] dark:text-ink-muted text-gray-400 hover:dark:text-ink-secondary hover:text-gray-600 text-sm mb-[1.5rem] transition-colors"
      >
        <ArrowLeft className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
        Voltar
      </button>

      <div className="max-w-[40rem]">
        <h1 className="dark:text-ink-primary text-gray-900 text-[1.5rem] font-bold mb-[0.25rem]">Novo Cliente</h1>
        <p className="dark:text-ink-secondary text-gray-500 text-sm mb-[2rem]">
          Preencha os dados básicos. O cliente entrará automaticamente no fluxo operacional.
        </p>

        {erro && (
          <div className="mb-[1.5rem] dark:bg-status-red/10 bg-red-50 border dark:border-status-red/20 border-red-200 rounded px-[1rem] py-[0.75rem]">
            <p className="text-sm dark:text-status-red text-red-700">{erro}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem] flex flex-col gap-[1.25rem]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.25rem]">
            <div>
              <label className={labelClass}>Nome completo *</label>
              <input name="nome" value={form.nome} onChange={handleChange} required className={inputClass} placeholder="Ex.: Ana Paula Santos" />
            </div>
            <div>
              <label className={labelClass}>WhatsApp *</label>
              <input name="whatsapp" value={form.whatsapp} onChange={handleChange} required className={inputClass} placeholder="11999998888" />
            </div>
          </div>

          <div>
            <label className={labelClass}>E-mail *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="cliente@email.com" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.25rem]">
            <div>
              <label className={labelClass}>Nicho *</label>
              <select name="nicho" value={form.nicho} onChange={handleChange} required className={inputClass + ' cursor-pointer'}>
                <option value="">Selecione…</option>
                {NICHOS_SUGERIDOS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Domínio</label>
              <input name="dominio" value={form.dominio} onChange={handleChange} className={inputClass} placeholder="meusite.com.br" />
            </div>
          </div>

          <div className="border-t dark:border-surface-border border-gray-100 pt-[1.25rem]">
            <p className="text-xs dark:text-ink-muted text-gray-400 font-semibold uppercase tracking-wide mb-[1rem]">
              Assinatura (opcional)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.25rem]">
              <div>
                <label className={labelClass}>Nome do Plano</label>
                <input name="plano_nome" value={form.plano_nome} onChange={handleChange} className={inputClass} placeholder="Ex.: Plano Starter" />
              </div>
              <div>
                <label className={labelClass}>Valor Mensal (R$)</label>
                <input name="valor_mensal" type="number" min="0" step="0.01" value={form.valor_mensal} onChange={handleChange} className={inputClass} placeholder="0,00" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="
              flex items-center justify-center gap-[0.5rem]
              dark:bg-brand dark:hover:bg-brand-dark dark:text-white
              bg-green-600 hover:bg-green-700 text-white
              h-[2.5rem] rounded font-semibold text-sm transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {salvando
              ? <><div className="w-[1rem] h-[1rem] border-2 border-white border-t-transparent rounded-full animate-spin" /> Criando…</>
              : 'Criar Cliente'
            }
          </button>
        </form>
      </div>
    </MainLayout>
  );
}
```

### `app\(app)\configuracoes\page.tsx`

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Save, Settings } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';

interface ConfigFinanceira {
  custos_fixos_mensais:           number;
  custos_variaveis_percentual:    number;
  margem_lucro_minima:            number;
  saldo_google_ads_limite_alerta: number;
}

export default function ConfiguracoesPage() {
  const [config,   setConfig]   = useState<ConfigFinanceira>({
    custos_fixos_mensais:           0,
    custos_variaveis_percentual:    0,
    margem_lucro_minima:            30,
    saldo_google_ads_limite_alerta: 50,
  });
  const [loading,  setLoading]  = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo,    setSalvo]    = useState(false);
  const [erro,     setErro]     = useState('');

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('configuracoes_financeiras')
        .select('custos_fixos_mensais,custos_variaveis_percentual,margem_lucro_minima,saldo_google_ads_limite_alerta')
        .eq('agencia_id', 'adsgator-main')
        .single();
      if (data) setConfig(data as ConfigFinanceira);
      setLoading(false);
    }
    carregar();
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true); setErro(''); setSalvo(false);
    try {
      const { error } = await supabase
        .from('configuracoes_financeiras')
        .update(config)
        .eq('agencia_id', 'adsgator-main');
      if (error) throw error;
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  }

  const campos = [
    { key: 'custos_fixos_mensais',           label: 'Custos Fixos Mensais (R$)',       tipo: 'moeda'      },
    { key: 'custos_variaveis_percentual',     label: 'Custos Variáveis (%)',            tipo: 'percentual' },
    { key: 'margem_lucro_minima',             label: 'Margem de Lucro Mínima (%)',      tipo: 'percentual' },
    { key: 'saldo_google_ads_limite_alerta',  label: 'Alerta Saldo Google Ads (R$)',    tipo: 'moeda'      },
  ] as const;

  return (
    <MainLayout>
      <div className="mb-[2rem] flex items-center gap-[0.75rem]">
        <Settings className="w-[1.5rem] h-[1.5rem] dark:text-ink-muted text-gray-400" strokeWidth={1.5} />
        <div>
          <h1 className="dark:text-ink-primary text-gray-900 text-[1.875rem] font-bold tracking-tight">
            Configurações
          </h1>
          <p className="dark:text-ink-secondary text-gray-500 text-sm">Parâmetros financeiros da agência</p>
        </div>
      </div>

      <div className="max-w-[32rem]">
        <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem]">
          <h2 className="dark:text-ink-primary text-gray-900 font-semibold text-base mb-[1.25rem]">
            Parâmetros Financeiros
          </h2>

          {loading ? (
            <div className="flex flex-col gap-[1rem]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[4rem] rounded dark:bg-surface-hover bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <form onSubmit={salvar} className="flex flex-col gap-[1rem]">
              {campos.map(({ key, label, tipo }) => (
                <div key={key}>
                  <label className="block dark:text-ink-secondary text-gray-700 text-sm font-medium mb-[0.375rem]">
                    {label}
                  </label>
                  <div className="relative">
                    {tipo === 'moeda' && (
                      <span className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 dark:text-ink-muted text-gray-400 text-sm">R$</span>
                    )}
                    <input
                      type="number"
                      step={tipo === 'percentual' ? '0.1' : '0.01'}
                      min="0"
                      value={config[key]}
                      onChange={(e) => setConfig((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                      className={`w-full h-[2.5rem] pr-[0.75rem] rounded dark:bg-surface-input dark:border dark:border-surface-border dark:text-ink-primary bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors ${tipo === 'moeda' ? 'pl-[2.25rem]' : 'pl-[0.75rem]'}`}
                    />
                    {tipo === 'percentual' && (
                      <span className="absolute right-[0.75rem] top-1/2 -translate-y-1/2 dark:text-ink-muted text-gray-400 text-sm">%</span>
                    )}
                  </div>
                </div>
              ))}

              {erro && (
                <p className="text-sm dark:text-status-red text-red-600">{erro}</p>
              )}
              {salvo && (
                <p className="text-sm text-brand">Configurações salvas com sucesso.</p>
              )}

              <button
                type="submit"
                disabled={salvando}
                className="flex items-center justify-center gap-[0.5rem] h-[2.5rem] rounded bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-colors disabled:opacity-50 mt-[0.5rem]"
              >
                {salvando
                  ? <div className="w-[1rem] h-[1rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Save className="w-[1rem] h-[1rem]" strokeWidth={2} />
                }
                {salvando ? 'Salvando…' : 'Salvar Configurações'}
              </button>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
```

### `app\(app)\dashboard\page.tsx`

```tsx
'use client'

import { useMemo } from 'react'
import {
  Users,
  DollarSign,
  Percent,
  CreditCard,
  Download,
  RefreshCw,
} from 'lucide-react'
import { MainLayout }            from '@/components/layout/MainLayout'
import { KpiCard }               from '@/components/dashboard/KpiCard'
import { AcoesDoDia }            from '@/components/dashboard/AcoesDoDia'
import { ClienteProgressCard }   from '@/components/dashboard/ClienteProgressCard'
import { useClientes }           from '@/lib/hooks/useClientes'
import { supabase }              from '@/lib/supabase'
import type { Cliente, Estagio } from '@/lib/types'

type Urgencia = 'critica' | 'atencao' | 'review'

interface AcaoItem {
  cliente:   Cliente
  estagio:   Estagio | null
  urgencia:  Urgencia
  descricao: string
  acaoLabel: string
  whatsapp?: string
}

// ── DADOS MOCK DE SPARKLINE (substitua com dados reais do Supabase) ────
const SPARK_ATIVOS   = [18, 20, 19, 21, 22, 21, 24]
const SPARK_MRR      = [38200, 39400, 41000, 42300, 43100, 44600, 45200]
const SPARK_RETENCAO = [88, 86, 85, 84, 83, 82, 82]
const SPARK_SALDO    = [2100, 1800, 2400, 1950, 1400, 1600, 1250]

export default function DashboardPage() {
  const { dados, loading, metricas, recarregar } = useClientes()

  // ── SEPARAÇÕES ──────────────────────────────────────────────────────
  const retidos   = dados.filter((d) => d.cliente.status === 'congelado')
  const progresso = dados.filter((d) =>
    d.cliente.status !== 'congelado' && d.cliente.status !== 'cancelado'
  )

  // ── AÇÕES DO DIA ─────────────────────────────────────────────────────
  const acoesDoDia = useMemo(() => {
    const acoes: AcaoItem[] = []

    dados.forEach(({ cliente, estagio }) => {
      const dias = cliente.dias_atraso ?? 0

      // D+15 CRÍTICO: quebra de contrato
      if (dias >= 15) {
        acoes.push({
          cliente, estagio,
          urgencia:  'critica',
          descricao: `${dias} dias sem pagamento — envie notificação de rescisão`,
          acaoLabel: '#COBRANÇA',
          whatsapp:  cliente.whatsapp
            ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}. Em razão do atraso de ${dias} dias, comunicamos a rescisão contratual.`)}`
            : undefined,
        })
      // D+7 ATENÇÃO: suspensão iminente
      } else if (dias >= 7) {
        acoes.push({
          cliente, estagio,
          urgencia:  'atencao',
          descricao: `${dias} dias em atraso — campanha em risco de suspensão`,
          acaoLabel: '#ALERTA D+7',
          whatsapp:  cliente.whatsapp
            ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}! Seu pagamento está em atraso há ${dias} dias.`)}`
            : undefined,
        })
      // Novo cliente recebido
      } else if (cliente.status === 'recebido') {
        acoes.push({
          cliente, estagio,
          urgencia:  'atencao',
          descricao: 'Novo cliente — envie o #BOASVINDAS agora',
          acaoLabel: '#BOASVINDAS',
          whatsapp:  cliente.whatsapp
            ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent('Olá! Seja bem-vindo(a) à Adsgator! 🎉')}`
            : undefined,
        })
      // Congelado sem resposta
      } else if (cliente.status === 'congelado') {
        acoes.push({
          cliente, estagio,
          urgencia:  'review',
          descricao: 'Cliente retido — envie lembrete de retorno',
          acaoLabel: 'Lembrete',
          whatsapp:  cliente.whatsapp
            ? `https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(`Olá ${cliente.nome.split(' ')[0]}! Ainda aguardamos seu retorno.`)}`
            : undefined,
        })
      }
    })

    // Ordenar: critica > atencao > review
    const ORDEM: Record<string, number> = { critica: 0, atencao: 1, review: 2 }
    return acoes.sort((a, b) => ORDEM[a.urgencia] - ORDEM[b.urgencia]).slice(0, 5)
  }, [dados])

  async function handleCongelar(clienteId: string) {
    await supabase
      .from('clientes')
      .update({ status: 'congelado' })
      .eq('id', clienteId)
    recarregar()
  }

  // ── ACTIONS DA TOPBAR ────────────────────────────────────────────────
  const topBarActions = (
    <div className="flex items-center gap-[0.5rem]">
      <button
        onClick={recarregar}
        disabled={loading}
        className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] hover:text-ink-primary transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-[0.875rem] h-[0.875rem] ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
        <span className="hidden sm:inline">Atualizar</span>
      </button>
      <button className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors">
        <Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        <span className="hidden sm:inline">Importar</span>
      </button>
    </div>
  )

  return (
    <MainLayout
      title="Central Operacional"
      subtitle={`Semana de ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
      actions={topBarActions}
    >

      {/* ════════════════════════════════════════════════
          BLOCO 1 — KPI CARDS (BENTO ROW)
      ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[1rem] mb-[2rem]">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[8rem] rounded-xl bg-surface-card border border-surface-border animate-pulse" />
          ))
        ) : (
          <>
            <KpiCard
              label="Clientes Ativos"
              value={metricas.ativos}
              delta="+3 esta semana"
              deltaDir="up"
              sparkData={SPARK_ATIVOS}
              accentColor="#FFA500"
              icon={<Users className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
            />
            <KpiCard
              label="MRR"
              value={`R$ ${metricas.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
              delta="+12%"
              deltaDir="up"
              deltaLabel="vs mês passado"
              sparkData={SPARK_MRR}
              accentColor="#10B981"
              icon={<DollarSign className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
            />
            <KpiCard
              label="Taxa de Retenção"
              value={`${metricas.taxaRetencao}%`}
              delta="-5%"
              deltaDir="down"
              deltaLabel="vs semana"
              sparkData={SPARK_RETENCAO}
              accentColor="#EF4444"
              icon={<Percent className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
            />
            <KpiCard
              label="Saldo Google"
              value="R$ 1.250"
              delta="⚠️ Baixo"
              deltaDir="down"
              sparkData={SPARK_SALDO}
              accentColor="#F59E0B"
              alert={true}
              alertLabel="Envie #SALDOGOOGLE"
              icon={<CreditCard className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
            />
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════
          BLOCO 2 — AÇÕES DO DIA
      ════════════════════════════════════════════════ */}
      {!loading && acoesDoDia.length > 0 && (
        <AcoesDoDia
          items={acoesDoDia}
          onCongelar={handleCongelar}
        />
      )}

      {/* ════════════════════════════════════════════════
          BLOCO 3 — GRID DE PROGRESSO
      ════════════════════════════════════════════════ */}
      <section className="mb-[2rem]">
        <div className="flex items-center justify-between mb-[0.75rem]">
          <h2 className="text-ink-primary font-semibold text-[0.9375rem]">
            Clientes em Progresso
            <span className="ml-[0.5rem] text-ink-muted text-[0.8125rem] font-normal">
              ({progresso.length}/{metricas.total})
            </span>
          </h2>
          <a href="/clientes" className="text-ads-500 text-[0.8125rem] hover:underline">
            Ver todos →
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[12rem] rounded-xl bg-surface-card border border-surface-border animate-pulse" />
            ))}
          </div>
        ) : progresso.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[4rem] text-ink-muted">
            <Users className="w-[3rem] h-[3rem] mb-[1rem]" strokeWidth={1} />
            <p className="text-[0.9375rem] font-medium">Nenhum cliente em progresso</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
            {progresso.slice(0, 6).map(({ cliente, estagio }) => (
              <ClienteProgressCard
                key={cliente.id}
                cliente={cliente}
                estagio={estagio}
                onCongelar={handleCongelar}
              />
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════
          BLOCO 4 — CLIENTES RETIDOS
      ════════════════════════════════════════════════ */}
      {retidos.length > 0 && (
        <section>
          <div className="flex items-center gap-[0.5rem] mb-[0.75rem]">
            <div className="w-[0.5rem] h-[0.5rem] rounded-full bg-status-orange animate-pulse-slow" />
            <h2 className="text-ink-primary font-semibold text-[0.9375rem]">
              Clientes Retidos
              <span className="ml-[0.5rem] text-ink-muted text-[0.8125rem] font-normal">
                ({retidos.length})
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
            {retidos.map(({ cliente, estagio }) => (
              <ClienteProgressCard
                key={cliente.id}
                cliente={cliente}
                estagio={estagio}
                onCongelar={handleCongelar}
                isRetido
              />
            ))}
          </div>
        </section>
      )}
    </MainLayout>
  )
}
```

### `app\(app)\financeiro\page.tsx`

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  TrendingUp, DollarSign, AlertCircle,
  MessageCircle, RefreshCw, Users,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { supabase }   from '@/lib/supabase'
import type { FinanceiroLancamento, Cliente } from '@/lib/types'

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const pct = (parte: number, total: number) =>
  total > 0 ? ((parte / total) * 100).toFixed(1) : '0.0'

interface DRE {
  mrr:               number
  custos_fixos:      number
  custos_variaveis:  number
  lucro_bruto:       number
  lucro_liquido:     number
  margem:            number
}

export default function FinanceiroPage() {
  const [dre,       setDre]       = useState<DRE | null>(null)
  const [lancamentos, setLancamentos] = useState<FinanceiroLancamento[]>([])
  const [atrasados, setAtrasados] = useState<Cliente[]>([])
  const [loading,   setLoading]   = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const mesInicio = new Date()
      mesInicio.setDate(1)
      const mesInicioStr = mesInicio.toISOString().split('T')[0]

      const [{ data: lancs }, { data: atr }] = await Promise.all([
        supabase
          .from('financeiro_lancamentos')
          .select('*')
          .gte('data', mesInicioStr)
          .order('data', { ascending: false }),
        supabase
          .from('clientes')
          .select('*')
          .gt('dias_atraso', 0)
          .neq('status', 'cancelado'),
      ])

      const lista = (lancs ?? []) as FinanceiroLancamento[]
      setLancamentos(lista)
      setAtrasados((atr ?? []) as Cliente[])

      const mrr     = lista.filter((l) => l.tipo === 'receita' && l.status === 'confirmado').reduce((s, l) => s + l.valor, 0)
      const fixos   = lista.filter((l) => l.tipo === 'custo_fixo').reduce((s, l) => s + l.valor, 0)
      const variav  = lista.filter((l) => l.tipo === 'custo_variavel').reduce((s, l) => s + l.valor, 0)
      const lucroB  = mrr - fixos
      const lucroL  = lucroB - variav
      setDre({ mrr, custos_fixos: fixos, custos_variaveis: variav, lucro_bruto: lucroB, lucro_liquido: lucroL, margem: mrr > 0 ? (lucroL / mrr) * 100 : 0 })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (loading || !dre) {
    return (
      <MainLayout title="Financeiro" subtitle="Saúde financeira em tempo real">
        <div className="flex items-center justify-center h-[20rem]">
          <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    )
  }

  const kpis = [
    { label: 'MRR',          valor: fmt(dre.mrr),          sub: 'Receita do mês',  icon: TrendingUp,   cor: 'text-ads-500'     },
    { label: 'Lucro Bruto',  valor: fmt(dre.lucro_bruto),  sub: `${pct(dre.lucro_bruto, dre.mrr)}% da receita`, icon: DollarSign, cor: 'text-status-green' },
    { label: 'Custos',       valor: fmt(dre.custos_fixos + dre.custos_variaveis), sub: 'Fixos + Variáveis', icon: AlertCircle, cor: 'text-status-orange' },
    { label: 'Lucro Líquido', valor: fmt(dre.lucro_liquido), sub: `Margem: ${dre.margem.toFixed(1)}%`, icon: TrendingUp, cor: dre.lucro_liquido >= 0 ? 'text-status-green' : 'text-status-red' },
  ]

  return (
    <MainLayout
      title="Financeiro"
      subtitle="Saúde financeira em tempo real"
      actions={
        <button onClick={carregar} className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] hover:text-ink-primary transition-colors">
          <RefreshCw className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          Atualizar
        </button>
      }
    >
      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1rem] mb-[2rem]">
        {kpis.map(({ label, valor, sub, icon: Icon, cor }) => (
          <div key={label} className="bg-surface-card border border-surface-border rounded-xl px-[1.25rem] py-[1rem]">
            <div className="flex items-start justify-between mb-[0.5rem]">
              <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">{label}</p>
              <Icon className={`w-[1rem] h-[1rem] ${cor}`} strokeWidth={1.5} />
            </div>
            <p className={`text-[1.75rem] font-bold leading-none mb-[0.375rem] ${cor}`}>{valor}</p>
            <p className="text-ink-muted text-[0.75rem]">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] mb-[2rem]">
        {/* ── DRE DISTRIBUIÇÃO ── */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1.25rem]">
            Distribuição da Receita
          </h3>
          {[
            { label: 'Custos Variáveis', valor: dre.custos_variaveis,           cor: 'bg-status-orange' },
            { label: 'Custos Fixos',     valor: dre.custos_fixos,               cor: 'bg-status-blue'   },
            { label: 'Lucro Líquido',    valor: Math.max(dre.lucro_liquido, 0), cor: 'bg-ads-500'       },
          ].map(({ label, valor, cor }) => (
            <div key={label} className="mb-[1rem]">
              <div className="flex justify-between items-center mb-[0.375rem]">
                <p className="text-ink-secondary text-[0.875rem]">{label}</p>
                <p className="text-ink-primary text-[0.875rem] font-semibold">
                  {pct(valor, dre.mrr)}% · {fmt(valor)}
                </p>
              </div>
              <div className="h-[0.25rem] bg-surface-hover rounded-full overflow-hidden">
                <div className={`h-full ${cor} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(parseFloat(pct(valor, dre.mrr)), 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── ÚMTIMOS LANÇAMENTOS ── */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1.25rem]">
            Últimos lançamentos do mês
          </h3>
          <div className="flex flex-col gap-[0.75rem]">
            {lancamentos.slice(0, 6).map((l) => (
              <div key={l.id} className="flex items-center justify-between">
                <div>
                  <p className="text-ink-secondary text-[0.875rem]">{l.descricao}</p>
                  <p className="text-ink-muted text-[0.6875rem]">{new Date(l.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <p className={`text-[0.9375rem] font-semibold ${
                  l.tipo === 'receita' ? 'text-status-green' : 'text-status-red'
                }`}>
                  {l.tipo === 'receita' ? '+' : '-'}{fmt(l.valor)}
                </p>
              </div>
            ))}
            {lancamentos.length === 0 && (
              <p className="text-ink-muted text-[0.875rem]">Nenhum lançamento este mês.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── CLIENTES EM ATRASO ── */}
      {atrasados.length > 0 && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
          <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
            <Users className="w-[1rem] h-[1rem] text-status-red" strokeWidth={1.75} />
            <h3 className="text-ink-primary font-semibold text-[0.9375rem]">
              Inadimplentes ({atrasados.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Cliente', 'Atraso', 'MRR', 'Ação'].map((h) => (
                    <th key={h} className="text-left pb-[0.75rem] text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {atrasados.map((c) => (
                  <tr key={c.id} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                    <td className="py-[0.875rem]">
                      <p className="text-ink-primary font-medium text-[0.875rem]">{c.nome}</p>
                      <p className="text-ink-muted text-[0.75rem]">{c.email}</p>
                    </td>
                    <td className="py-[0.875rem]">
                      <span className={`inline-flex items-center text-[0.75rem] font-bold px-[0.5rem] py-[0.125rem] rounded ${
                        (c.dias_atraso ?? 0) >= 30 ? 'bg-status-red/15 text-status-red'
                        : (c.dias_atraso ?? 0) >= 15 ? 'bg-status-orange/15 text-status-orange'
                        : 'bg-yellow-500/15 text-yellow-500'
                      }`}>
                        {c.dias_atraso}d
                      </span>
                    </td>
                    <td className="py-[0.875rem] text-ink-primary font-semibold text-[0.875rem]">
                      {fmt(c.mrr ?? 0)}
                    </td>
                    <td className="py-[0.875rem]">
                      {c.whatsapp && (
                        <a
                          href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-[0.375rem] bg-ads-500/10 hover:bg-ads-500/20 text-ads-500 text-[0.75rem] font-semibold px-[0.625rem] h-[1.75rem] rounded transition-colors"
                        >
                          <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.5} />
                          WhatsApp
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
```

### `app\(app)\relatorios\page.tsx`

```tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TrendingUp, BarChart3, Download, RefreshCw, Calendar, ArrowUpRight, Sparkles } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

interface RelatorioMensal {
  id:                    string;
  cliente_id:            string;
  mes_ano:               string;
  status_geracao:        'pendente' | 'gerado' | 'erro';
  investimento_ads?:     number;
  conversoes?:           number;
  roi?:                  number;
  sessoes_ga4?:          number;
  usuarios_novos?:       number;
  taxa_engajamento?:     number;
  conteudo_markdown?:    string;
  analise_ia?: {
    resumo_executivo: string;
    pontos_positivos: string[];
    pontos_atencao:   string[];
    recomendacoes:    string[];
    proximo_passo:    string;
  };
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const [clientes,    setClientes]    = useState<{ id: string; nome: string }[]>([]);
  const [clienteSel,  setClienteSel]  = useState<string>('');
  const [relatorios,  setRelatorios]  = useState<RelatorioMensal[]>([]);
  const [selecionado, setSelecionado] = useState<RelatorioMensal | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [gerando,     setGerando]     = useState(false);

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome')
      .eq('status', 'ativo')
      .order('nome')
      .then(({ data }) => {
        const lista = data ?? [];
        setClientes(lista);
        if (lista.length > 0) setClienteSel(lista[0].id);
      });
  }, []);

  const carregar = useCallback(async () => {
    if (!clienteSel) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/analytics/${clienteSel}`);
      const json = await res.json() as { relatorios: RelatorioMensal[] };
      const lista = json.relatorios ?? [];
      setRelatorios(lista);
      setSelecionado(lista[0] ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clienteSel]);

  useEffect(() => { carregar(); }, [carregar]);

  async function solicitarRelatorio() {
    if (!clienteSel) return;
    setGerando(true);
    try {
      const hoje   = new Date();
      const mesRef = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const mesAno = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, '0')}`;
      await fetch(`/api/analytics/${clienteSel}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mesAno }),
      });
      await carregar();
    } finally {
      setGerando(false);
    }
  }

  function baixarMarkdown() {
    if (!selecionado?.conteudo_markdown) return;
    const blob = new Blob([selecionado.conteudo_markdown], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `relatorio_${selecionado.mes_ano}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const kpis = selecionado ? [
    { label: 'Investimento',  valor: fmt(selecionado.investimento_ads ?? 0),             sub: 'Google Ads',     icon: TrendingUp,  cor: 'text-status-blue'   },
    { label: 'Conversões',    valor: String(selecionado.conversoes ?? 0),                 sub: 'Leads/vendas',   icon: ArrowUpRight, cor: 'text-brand'        },
    { label: 'ROI',           valor: `${(selecionado.roi ?? 0).toFixed(2)}x`,             sub: 'Retorno',        icon: BarChart3,   cor: 'text-status-purple' },
    { label: 'Sessões (GA4)', valor: (selecionado.sessoes_ga4 ?? 0).toLocaleString(),     sub: 'Visitas ao site', icon: Calendar,   cor: 'text-status-orange' },
  ] : [];

  return (
    <MainLayout
      title="Relatórios"
      subtitle="Google Ads + GA4 — histórico por cliente"
      actions={
        <div className="flex items-center gap-[0.625rem]">
          <select
            value={clienteSel}
            onChange={(e) => setClienteSel(e.target.value)}
            className="h-[2rem] pl-[0.625rem] pr-[1.75rem] rounded-[0.375rem] bg-surface-card border border-surface-border text-ink-primary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/40 transition-colors"
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <button
            onClick={solicitarRelatorio}
            disabled={gerando || !clienteSel}
            className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors disabled:opacity-50"
          >
            {gerando
              ? <div className="w-[0.75rem] h-[0.75rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <RefreshCw className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            }
            Solicitar
          </button>
        </div>
      }
    >

      {/* SELETOR DE MÊS */}
      {relatorios.length > 0 && (
        <div className="flex gap-[0.5rem] flex-wrap mb-[1.5rem]">
          {relatorios.map((r) => {
            const [ano, mes] = r.mes_ano.split('-')
            const label = new Date(Number(ano), Number(mes) - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
            return (
              <button
                key={r.mes_ano}
                onClick={() => setSelecionado(r)}
                className={`px-[0.875rem] h-[2rem] rounded-[0.375rem] text-[0.8125rem] font-medium transition-colors ${
                  selecionado?.mes_ano === r.mes_ano
                    ? 'bg-ads-500 text-white'
                    : 'bg-surface-card border border-surface-border text-ink-secondary hover:border-ads-500/40'
                }`}
              >
                {label}
                {r.status_geracao === 'pendente' && (
                  <span className="ml-[0.375rem] font-bold text-status-orange">●</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center h-[16rem]">
          <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* EMPTY */}
      {!loading && relatorios.length === 0 && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-[3rem] text-center">
          <BarChart3 className="w-[2.5rem] h-[2.5rem] text-ink-muted mx-auto mb-[1rem]" strokeWidth={1} />
          <p className="text-ink-secondary text-[0.875rem]">
            Nenhum relatório encontrado. Clique em &quot;Solicitar&quot; para gerar o primeiro.
          </p>
        </div>
      )}

      {!loading && selecionado && (
        <>
          {/* STATUS PENDENTE */}
          {selecionado.status_geracao === 'pendente' && (
            <div className="mb-[1.5rem] flex items-start gap-[0.75rem] bg-status-orange/10 border border-status-orange/20 rounded-xl px-[1rem] py-[0.875rem]">
              <RefreshCw className="shrink-0 w-[0.875rem] h-[0.875rem] text-status-orange mt-[0.125rem]" strokeWidth={2} />
              <p className="text-[0.875rem] text-status-orange">
                Relatório em processamento. Recarregue em alguns instantes.
              </p>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[1rem] mb-[1.5rem]">
            {kpis.map(({ label, valor, sub, icon: Icon, cor }) => (
              <div key={label} className="bg-surface-card border border-surface-border rounded-xl px-[1.25rem] py-[1rem]">
                <div className="flex items-start justify-between mb-[0.5rem]">
                  <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold">{label}</p>
                  <Icon className={`w-[1rem] h-[1rem] ${cor}`} strokeWidth={1.5} />
                </div>
                <p className={`text-[1.75rem] font-bold leading-none mb-[0.375rem] ${cor}`}>{valor}</p>
                <p className="text-ink-muted text-[0.75rem]">{sub}</p>
              </div>
            ))}
          </div>

          {/* DETALHE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] mb-[1.5rem]">
            <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
              <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
                <TrendingUp className="w-[1rem] h-[1rem] text-status-blue" strokeWidth={1.5} />
                <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Google Ads</h3>
              </div>
              {[
                { label: 'Investimento', valor: fmt(selecionado.investimento_ads ?? 0) },
                { label: 'Conversões',   valor: String(selecionado.conversoes ?? 0)   },
                { label: 'ROI',          valor: `${(selecionado.roi ?? 0).toFixed(2)}x` },
              ].map(({ label, valor }) => (
                <div key={label} className="flex justify-between items-center py-[0.75rem] border-b border-surface-border last:border-0">
                  <p className="text-ink-secondary text-[0.875rem]">{label}</p>
                  <p className="text-ink-primary font-semibold text-[0.875rem]">{valor}</p>
                </div>
              ))}
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
              <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
                <BarChart3 className="w-[1rem] h-[1rem] text-status-orange" strokeWidth={1.5} />
                <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Google Analytics 4</h3>
              </div>
              {[
                { label: 'Sessões',          valor: (selecionado.sessoes_ga4 ?? 0).toLocaleString()      },
                { label: 'Novos Usuários',   valor: (selecionado.usuarios_novos ?? 0).toLocaleString()   },
                { label: 'Taxa Engajamento', valor: `${(selecionado.taxa_engajamento ?? 0).toFixed(1)}%` },
              ].map(({ label, valor }) => (
                <div key={label} className="flex justify-between items-center py-[0.75rem] border-b border-surface-border last:border-0">
                  <p className="text-ink-secondary text-[0.875rem]">{label}</p>
                  <p className="text-ink-primary font-semibold text-[0.875rem]">{valor}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ANÁLISE IA */}
          {selecionado.analise_ia && (
            <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] mb-[1.5rem]">
              <div className="flex items-center gap-[0.5rem] mb-[1.25rem]">
                <Sparkles className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.5} />
                <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Análise IA — Gemini</h3>
              </div>
              <p className="text-ink-secondary text-[0.875rem] mb-[1.25rem] leading-relaxed">
                {selecionado.analise_ia.resumo_executivo}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem] mb-[1.25rem]">
                {selecionado.analise_ia.pontos_positivos.length > 0 && (
                  <div>
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-status-green mb-[0.5rem]">Pontos Positivos</p>
                    <ul className="flex flex-col gap-[0.375rem]">
                      {selecionado.analise_ia.pontos_positivos.map((p, i) => (
                        <li key={i} className="flex items-start gap-[0.5rem]">
                          <span className="text-status-green font-bold text-[0.75rem] mt-[0.125rem]">✓</span>
                          <span className="text-ink-secondary text-[0.875rem]">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selecionado.analise_ia.pontos_atencao.length > 0 && (
                  <div>
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-status-orange mb-[0.5rem]">Pontos de Atenção</p>
                    <ul className="flex flex-col gap-[0.375rem]">
                      {selecionado.analise_ia.pontos_atencao.map((p, i) => (
                        <li key={i} className="flex items-start gap-[0.5rem]">
                          <span className="text-status-orange font-bold text-[0.75rem] mt-[0.125rem]">!</span>
                          <span className="text-ink-secondary text-[0.875rem]">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {selecionado.analise_ia.recomendacoes.length > 0 && (
                <div className="mb-[1rem]">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted mb-[0.5rem]">Recomendações</p>
                  <ol className="flex flex-col gap-[0.375rem]">
                    {selecionado.analise_ia.recomendacoes.map((r, i) => (
                      <li key={i} className="flex items-start gap-[0.625rem]">
                        <span className="w-[1.25rem] h-[1.25rem] rounded-full bg-ads-500 flex items-center justify-center text-white text-[0.6875rem] font-bold shrink-0">{i + 1}</span>
                        <span className="text-ink-secondary text-[0.875rem]">{r}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {selecionado.analise_ia.proximo_passo && (
                <div className="bg-ads-500/10 border border-ads-500/20 rounded-[0.375rem] px-[0.875rem] py-[0.75rem]">
                  <p className="text-[0.6875rem] font-semibold text-ads-500 uppercase tracking-wide mb-[0.25rem]">Próximo Passo</p>
                  <p className="text-ink-primary text-[0.875rem]">{selecionado.analise_ia.proximo_passo}</p>
                </div>
              )}
            </div>
          )}

          {/* DOWNLOAD */}
          {selecionado.conteudo_markdown && (
            <div className="bg-surface-card border border-surface-border rounded-xl px-[1.5rem] py-[1.25rem] flex items-center justify-between">
              <div>
                <p className="text-ink-primary font-semibold text-[0.875rem]">Relatório completo em Markdown</p>
                <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">Pronto para compartilhar com o cliente</p>
              </div>
              <button
                onClick={baixarMarkdown}
                className="flex items-center gap-[0.5rem] bg-surface-hover border border-surface-border text-ink-primary text-[0.8125rem] font-semibold h-[2rem] px-[0.875rem] rounded-[0.375rem] hover:border-ads-500/40 transition-colors"
              >
                <Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                Baixar .md
              </button>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}
```

### `app\api\analytics\[clienteId]\route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ─── GET — lista relatórios do cliente ────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> }
) {
  try {
    const { clienteId } = await params
    const { data, error } = await supabase
      .from('relatorios_mensais')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('mes_ano', { ascending: false })
      .limit(6);

    if (error) throw error;
    return NextResponse.json({ relatorios: data ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ─── POST — solicita geração de relatório ─────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> }
) {
  try {
    const { clienteId } = await params
    const body = await req.json() as { mesAno: string };

    const { data: cliente, error: errCliente } = await supabase
      .from('clientes')
      .select('google_ads_customer_id, ga4_property_id, nome')
      .eq('id', clienteId)
      .single();

    if (errCliente || !cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Se as credenciais estiverem configuradas, gerar com dados reais
    if (cliente.google_ads_customer_id && cliente.ga4_property_id) {
      const [
        { obterDadosCampanhasAds, obterPalavrasChavePerformance },
        { obterDadosGA4, obterPaginasTopPerformance, obterFontesTrafego },
        { gerarRelatorioMensal },
      ] = await Promise.all([
        import('@/lib/google-ads'),
        import('@/lib/google-analytics'),
        import('@/lib/relatorio-generator'),
      ]);

      const [campanhas, keywords, ga4, paginas, fontes] = await Promise.all([
        obterDadosCampanhasAds(cliente.google_ads_customer_id, body.mesAno),
        obterPalavrasChavePerformance(cliente.google_ads_customer_id, body.mesAno),
        obterDadosGA4(cliente.ga4_property_id, body.mesAno),
        obterPaginasTopPerformance(cliente.ga4_property_id, body.mesAno),
        obterFontesTrafego(cliente.ga4_property_id, body.mesAno),
      ]);

      await gerarRelatorioMensal(
        { cliente_id: clienteId, mes_ano: body.mesAno, campanhas, keywords, ga4, paginas, fontes },
        cliente.nome,
      );

      // Análise IA via Vertex — enriquece o relatório com insights automáticos
      try {
        const { analisarRelatorioIA } = await import('@/lib/vertex-ai');
        const custoTotal = campanhas.reduce((s, c) => s + c.custo_total, 0);
        const conversoesAds = campanhas.reduce((s, c) => s + c.conversoes, 0);
        const analise = await analisarRelatorioIA(
          cliente.nome, body.mesAno,
          custoTotal, conversoesAds, ga4.sessoes,
          ga4.taxa_engajamento, ga4.taxa_rejeicao,
          custoTotal > 0 ? conversoesAds / custoTotal : 0,
        );
        await supabase
          .from('relatorios_mensais')
          .update({ analise_ia: analise })
          .eq('cliente_id', clienteId)
          .eq('mes_ano', body.mesAno);
      } catch (iaErr) {
        console.error('Vertex AI (não crítico):', iaErr);
      }

      return NextResponse.json({ success: true, status: 'gerado' });
    }

    // Sem credenciais: criar registro pendente
    const { error } = await supabase
      .from('relatorios_mensais')
      .upsert(
        { cliente_id: clienteId, mes_ano: body.mesAno, status_geracao: 'pendente' },
        { onConflict: 'cliente_id,mes_ano' }
      );
    if (error) throw error;

    return NextResponse.json({ success: true, status: 'pendente' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

### `app\api\ia\copy\route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { gerarCopyLandingPage } from '@/lib/vertex-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      nomeCliente:  string;
      nicho:        string;
      estilo:       string;
      direcaoArte?: string;
      publicoAlvo?: string;
    };

    if (!body.nomeCliente || !body.nicho) {
      return NextResponse.json({ error: 'nomeCliente e nicho são obrigatórios' }, { status: 400 });
    }

    const copy = await gerarCopyLandingPage(
      body.nomeCliente,
      body.nicho,
      body.estilo ?? 'minimalista',
      body.direcaoArte ?? '',
      body.publicoAlvo,
    );

    return NextResponse.json({ copy });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

### `app\login\page.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginComEmail } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email,   setEmail]   = useState('');
  const [senha,   setSenha]   = useState('');
  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(''); setLoading(true);
    try {
      await loginComEmail(email.trim(), senha);
      router.push('/dashboard');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen dark:bg-surface-bg bg-gray-50 flex items-center justify-center px-[1rem]">
      <div className="w-full max-w-[22rem]">
        <div className="text-center mb-[2.5rem]">
          <div className="w-[3rem] h-[3rem] rounded-[0.625rem] bg-brand flex items-center justify-center mx-auto mb-[1.25rem]">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="dark:text-ink-primary text-gray-900 text-[1.5rem] font-bold">
            Adsgator Hub
          </h1>
          <p className="dark:text-ink-muted text-gray-400 text-sm mt-[0.25rem]">
            Sistema nervoso central da agência
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-[1rem]">
          {erro && (
            <div className="dark:bg-status-red/10 bg-red-50 border dark:border-status-red/20 border-red-200 rounded px-[0.875rem] py-[0.625rem]">
              <p className="text-sm dark:text-status-red text-red-700">{erro}</p>
            </div>
          )}

          {([
            { label: 'E-mail', type: 'email',    value: email, set: setEmail, ph: 'admin@adsgator.com' },
            { label: 'Senha',  type: 'password', value: senha, set: setSenha, ph: '••••••••'           },
          ] as const).map(({ label, type, value, set, ph }) => (
            <div key={label}>
              <label className="block dark:text-ink-secondary text-gray-700 text-sm font-medium mb-[0.375rem]">
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                required
                placeholder={ph}
                className="
                  w-full h-[2.5rem] px-[0.75rem] rounded
                  dark:bg-surface-input dark:border dark:border-surface-border dark:text-ink-primary dark:placeholder-ink-muted
                  bg-white border border-gray-200 text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand
                  text-sm transition-colors
                "
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="
              h-[2.5rem] rounded font-semibold text-sm
              dark:bg-brand dark:hover:bg-brand-dark dark:text-white
              bg-green-600 hover:bg-green-700 text-white
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-[0.5rem]
            "
          >
            {loading
              ? <><div className="w-[1rem] h-[1rem] border-2 border-white border-t-transparent rounded-full animate-spin" /> Entrando…</>
              : 'Entrar'
            }
          </button>
        </form>
      </div>
    </div>
  );
}
```

### `components\clientes\AuditTimeline.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AuditLog {
  id:         string
  acao:       string
  descricao?: string
  created_at: string
}

export function AuditTimeline({ clienteId }: { clienteId: string }) {
  const supabase = createClient()
  const [logs, setLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    supabase
      .from('audit_logs')
      .select('id, acao, descricao, created_at')
      .eq('registro_id', clienteId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setLogs(data ?? []))
  }, [clienteId])

  if (logs.length === 0) return null

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
      <div className="flex items-center gap-[0.5rem] mb-[1rem]">
        <Clock className="w-[1rem] h-[1rem] text-ink-muted" strokeWidth={1.75} />
        <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Histórico</h3>
      </div>
      <div className="relative">
        <div className="absolute left-[0.4375rem] top-0 bottom-0 w-px bg-surface-border" />
        <ul className="space-y-[1rem]">
          {logs.map((log) => (
            <li key={log.id} className="flex gap-[1rem] pl-[1.25rem] relative">
              <div className="absolute left-0 top-[0.1875rem] w-[0.875rem] h-[0.875rem] rounded-full bg-surface-card border-2 border-surface-border" />
              <div>
                <p className="text-ink-secondary text-[0.875rem]">
                  {log.descricao ?? log.acao}
                </p>
                <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

### `components\clientes\ChecklistCard.tsx`

```tsx
'use client'

import { useState } from 'react'
import { CheckCircle, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ChecklistItem } from '@/lib/types'

interface ChecklistCardProps {
  clienteId: string
  estagioId: string
  items:     ChecklistItem[]
}

export function ChecklistCard({ clienteId: _clienteId, estagioId, items: itemsInicial }: ChecklistCardProps) {
  const supabase = createClient()
  const [items, setItems] = useState(itemsInicial)

  async function toggleItem(index: number) {
    const novosItems = items.map((it, i) =>
      i === index ? { ...it, done: !it.done } : it
    )
    setItems(novosItems)
    await supabase
      .from('estagios')
      .update({ checklist: novosItems })
      .eq('id', estagioId)
  }

  const total    = items.length
  const feitos   = items.filter((i) => i.done).length
  const progresso = total > 0 ? (feitos / total) * 100 : 0

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
      <div className="flex items-center justify-between mb-[0.75rem]">
        <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Checklist</h3>
        <span className="text-ink-muted text-[0.8125rem]">{feitos}/{total}</span>
      </div>

      <div className="h-[0.25rem] bg-surface-hover rounded-full mb-[1rem] overflow-hidden">
        <div
          className="h-full bg-ads-500 rounded-full transition-all duration-500"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <ul className="space-y-[0.5rem]">
        {items.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => toggleItem(i)}
              className="flex items-start gap-[0.625rem] w-full text-left hover:opacity-80 transition-opacity"
            >
              {item.done ? (
                <CheckCircle className="w-[1rem] h-[1rem] text-status-green shrink-0 mt-[0.125rem]" strokeWidth={2} />
              ) : (
                <Circle className="w-[1rem] h-[1rem] text-ink-muted shrink-0 mt-[0.125rem]" strokeWidth={1.75} />
              )}
              <span className={`text-[0.875rem] ${item.done ? 'text-ink-muted line-through' : 'text-ink-secondary'}`}>
                {item.item}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### `components\clientes\ClienteCard.tsx`

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageCircle, PauseCircle, ChevronRight,
  Bell, ClipboardList, Settings2, TrendingUp, XCircle,
} from 'lucide-react';
import type { Cliente, Estagio } from '@/lib/types';
import { FLUXO_OPERACIONAL, gerarLinkWhatsApp, WHATSAPP_TEMPLATES } from '@/lib/fluxo-operacional';

interface ClienteCardProps {
  cliente:    Cliente;
  estagio:    Estagio | null;
  onCongelar: (clienteId: string) => void;
}

const ICONES_ESTAGIO = {
  recebido:      Bell,
  onboarding:    ClipboardList,
  setup_trafego: Settings2,
  ativo:         TrendingUp,
  congelado:     PauseCircle,
  cancelado:     XCircle,
} as const;

const BADGE_CORES: Record<string, string> = {
  recebido:              'bg-status-blue/15 text-status-blue',
  onboarding:            'bg-status-purple/15 text-status-purple',
  setup_trafego:         'bg-status-yellow/15 text-status-yellow',
  ativo:                 'bg-brand/15 text-brand',
  congelado:             'bg-status-orange/15 text-status-orange',
  cancelado:             'bg-status-red/15 text-status-red',
  alerta_financeiro_7d:  'bg-status-orange/15 text-status-orange',
};

export function ClienteCard({ cliente, estagio, onCongelar }: ClienteCardProps) {
  const fluxoEtapa  = FLUXO_OPERACIONAL[cliente.status] ?? FLUXO_OPERACIONAL['ativo'];
  const IconeStatus = ICONES_ESTAGIO[cliente.status as keyof typeof ICONES_ESTAGIO] ?? TrendingUp;
  const badgeCor    = BADGE_CORES[cliente.status] ?? 'bg-surface-hover text-ink-secondary';

  const templatesDisponiveis = fluxoEtapa.whatsapp_templates ?? [];

  return (
    <div className="
      dark:bg-surface-card bg-white rounded-lg
      dark:border dark:border-surface-border border border-gray-100
      hover:dark:border-surface-border/70 hover:dark:bg-surface-hover
      hover:border-gray-200 hover:shadow-sm
      transition-all duration-150 flex flex-col
      animate-fade-in
    ">
      {/* Header */}
      <div className="flex items-start justify-between p-[1.25rem] pb-[0.875rem]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[0.5rem] mb-[0.25rem]">
            <span className={`inline-flex items-center gap-[0.25rem] text-2xs font-semibold px-[0.375rem] py-[0.0625rem] rounded-[0.1875rem] ${badgeCor}`}>
              <IconeStatus className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
              {fluxoEtapa.label}
            </span>
          </div>
          <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base truncate">
            {cliente.nome}
          </h3>
          <p className="dark:text-ink-muted text-gray-400 text-xs truncate">
            {cliente.nicho}
          </p>
        </div>
        <Link
          href={`/clientes/${cliente.id}`}
          className="shrink-0 w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded dark:hover:bg-surface-hover hover:bg-gray-100 dark:text-ink-muted text-gray-400 transition-colors"
        >
          <ChevronRight className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
        </Link>
      </div>

      {/* Instrução / Próxima Ação */}
      <div className="mx-[1.25rem] mb-[0.875rem] px-[0.75rem] py-[0.625rem] rounded dark:bg-brand/5 bg-green-50 border-l-2 border-brand">
        <p className="text-2xs dark:text-ink-muted text-gray-500 font-semibold uppercase tracking-wide mb-[0.25rem]">
          Próxima ação
        </p>
        <p className="text-xs dark:text-ink-secondary text-gray-700 leading-snug">
          {estagio?.acao_proxima ?? fluxoEtapa.instrucao}
        </p>
      </div>

      {/* Botões WhatsApp */}
      {templatesDisponiveis.length > 0 && (
        <div className="px-[1.25rem] pb-[0.875rem] flex flex-wrap gap-[0.5rem]">
          {templatesDisponiveis.map((tag) => (
            <a
              key={tag}
              href={gerarLinkWhatsApp(tag, cliente.whatsapp ?? '')}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-[0.375rem]
                dark:bg-brand/10 dark:hover:bg-brand/20 dark:text-brand
                bg-green-50 hover:bg-green-100 text-green-700
                text-xs font-semibold px-[0.625rem] py-[0.375rem] rounded
                transition-colors
              "
            >
              <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.5} />
              {WHATSAPP_TEMPLATES[tag]?.titulo ?? tag}
            </a>
          ))}
        </div>
      )}

      {/* Rodapé: ações secundárias */}
      <div className="px-[1.25rem] pb-[1rem] pt-[0.25rem] flex items-center gap-[0.5rem] border-t dark:border-surface-border border-gray-50 mt-auto">
        <a
          href={`https://wa.me/55${(cliente.whatsapp ?? '').replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex-1 flex items-center justify-center gap-[0.375rem]
            dark:bg-surface-hover dark:hover:bg-surface-border dark:text-ink-secondary
            bg-gray-50 hover:bg-gray-100 text-gray-600
            text-xs font-medium h-[2rem] rounded transition-colors
          "
        >
          <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.5} />
          WhatsApp
        </a>

        {cliente.status !== 'congelado' && cliente.status !== 'cancelado' && (
          <button
            onClick={() => onCongelar(cliente.id)}
            className="
              flex items-center justify-center gap-[0.375rem]
              dark:bg-status-orange/10 dark:hover:bg-status-orange/20 dark:text-status-orange
              bg-orange-50 hover:bg-orange-100 text-orange-600
              text-xs font-medium h-[2rem] px-[0.75rem] rounded transition-colors
            "
            title="Mover para Retidos"
          >
            <PauseCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.5} />
            Reter
          </button>
        )}
      </div>
    </div>
  );
}
```

### `components\clientes\OnboardChecklist.tsx`

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { FLUXO_OPERACIONAL } from '@/lib/fluxo-operacional';
import { obterProgressoOnboard, salvarProgressoOnboard } from '@/lib/database';

interface OnboardChecklistProps {
  clienteId: string;
  estagio:   string;
}

export function OnboardChecklist({ clienteId, estagio }: OnboardChecklistProps) {
  const [progresso, setProgresso] = useState<Record<string, boolean>>({});
  const [salvando,  setSalvando]  = useState(false);

  const etapa = FLUXO_OPERACIONAL[estagio];
  const itens = etapa?.checklist ?? [];

  useEffect(() => {
    obterProgressoOnboard(clienteId).then(setProgresso).catch(console.error);
  }, [clienteId]);

  async function toggleItem(itemId: string) {
    const novoProgresso = { ...progresso, [itemId]: !progresso[itemId] };
    setProgresso(novoProgresso);
    setSalvando(true);
    try {
      await salvarProgressoOnboard(clienteId, novoProgresso);
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  if (itens.length === 0) return null;

  const concluidos = itens.filter((i) => progresso[i.id]).length;
  const percentual = Math.round((concluidos / itens.length) * 100);

  return (
    <div className="dark:bg-surface-card bg-white rounded-lg dark:border dark:border-surface-border border border-gray-100 p-[1.5rem]">
      <div className="flex items-center justify-between mb-[1rem]">
        <h3 className="dark:text-ink-primary text-gray-900 font-semibold text-base">
          Checklist de {etapa?.label}
        </h3>
        <div className="flex items-center gap-[0.5rem]">
          {salvando && (
            <span className="text-2xs dark:text-ink-muted text-gray-400">Salvando…</span>
          )}
          <span className="text-xs dark:text-ink-secondary text-gray-600 font-medium">
            {concluidos}/{itens.length}
          </span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-[0.25rem] dark:bg-surface-hover bg-gray-100 rounded-full mb-[1rem] overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-300"
          style={{ width: `${percentual}%` }}
        />
      </div>

      {/* Itens */}
      <div className="flex flex-col gap-[0.375rem]">
        {itens.map((item) => {
          const feito = progresso[item.id] ?? false;
          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`
                flex items-start gap-[0.75rem] p-[0.75rem] rounded text-left
                transition-colors
                ${feito
                  ? 'dark:bg-brand/8 bg-green-50 dark:border dark:border-brand/20 border border-green-100'
                  : 'dark:hover:bg-surface-hover hover:bg-gray-50 dark:border dark:border-surface-border border border-gray-50'
                }
              `}
            >
              <div className={`
                shrink-0 w-[1.125rem] h-[1.125rem] rounded-[0.25rem] border flex items-center justify-center mt-[0.0625rem]
                transition-all
                ${feito
                  ? 'bg-brand border-brand'
                  : 'dark:border-surface-border border-gray-300 dark:bg-surface-hover bg-white'
                }
              `}>
                {feito && <Check className="w-[0.625rem] h-[0.625rem] text-white" strokeWidth={3} />}
              </div>
              <span className={`text-sm leading-snug ${feito ? 'dark:text-ink-muted text-gray-400 line-through' : 'dark:text-ink-secondary text-gray-700'}`}>
                {item.texto}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

### `components\dashboard\AcoesDoDia.tsx`

```tsx
'use client'

import {
  AlertTriangle,
  Clock,
  TrendingUp,
  MessageCircle,
  Mail,
  PauseCircle,
  Archive,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Cliente, Estagio } from '@/lib/types'

type Urgencia = 'critica' | 'atencao' | 'review'

interface AcaoItem {
  cliente:   Cliente
  estagio:   Estagio | null
  urgencia:  Urgencia
  descricao: string
  acaoLabel: string
  whatsapp?: string
}

const urgenciaConfig: Record<Urgencia, {
  label:  string
  icon:   typeof AlertTriangle
  bg:     string
  border: string
  text:   string
  badge:  string
}> = {
  critica: {
    label:  'URGENTE',
    icon:   AlertTriangle,
    bg:     'bg-status-red/5',
    border: 'border-status-red/25',
    text:   'text-status-red',
    badge:  'bg-status-red/15 text-status-red',
  },
  atencao: {
    label:  'PENDENTE',
    icon:   Clock,
    bg:     'bg-status-orange/5',
    border: 'border-status-orange/25',
    text:   'text-status-orange',
    badge:  'bg-status-orange/15 text-status-orange',
  },
  review: {
    label:  'REVISAR',
    icon:   TrendingUp,
    bg:     'bg-status-blue/5',
    border: 'border-status-blue/25',
    text:   'text-status-blue',
    badge:  'bg-status-blue/15 text-status-blue',
  },
}

interface AcoesDoDiaProps {
  items:       AcaoItem[]
  onCongelar:  (id: string) => void
  onArquivar?: (id: string) => void
}

export function AcoesDoDia({ items, onCongelar, onArquivar }: AcoesDoDiaProps) {
  if (items.length === 0) return null

  return (
    <section className="mb-[2rem]">
      <div className="flex items-center justify-between mb-[0.75rem]">
        <div className="flex items-center gap-[0.5rem]">
          <AlertTriangle className="w-[1rem] h-[1rem] text-status-red" strokeWidth={2} />
          <h2 className="text-ink-primary font-semibold text-[0.9375rem]">
            Ações do Dia
            <span className="ml-[0.5rem] inline-flex items-center justify-center w-[1.25rem] h-[1.25rem] rounded-full bg-status-red/15 text-status-red text-[0.6875rem] font-bold">
              {items.length}
            </span>
          </h2>
        </div>
      </div>

      <div className="space-y-[0.5rem]">
        {items.map(({ cliente, urgencia, descricao, acaoLabel, whatsapp }) => {
          const cfg  = urgenciaConfig[urgencia]
          const Icon = cfg.icon

          return (
            <div
              key={cliente.id}
              className={cn(
                'flex items-center gap-[1rem]',
                'rounded-xl border px-[1.25rem] py-[1rem]',
                'transition-all duration-150 hover:brightness-110',
                cfg.bg,
                cfg.border,
              )}
            >
              {/* ── BADGE URGÊNCIA ────────────────────────── */}
              <div className={cn('shrink-0 flex items-center gap-[0.375rem] rounded-full px-[0.625rem] h-[1.5rem] text-[0.6875rem] font-bold tracking-wide', cfg.badge)}>
                <Icon className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} />
                {cfg.label}
              </div>

              {/* ── INFO ──────────────────────────────────── */}
              <div className="flex-1 min-w-0">
                <p className="text-ink-primary text-[0.875rem] font-semibold truncate">
                  {cliente.nome}
                  <span className="ml-[0.375rem] text-ink-muted font-normal text-[0.8125rem]">
                    ({cliente.nicho})
                  </span>
                </p>
                <p className="text-ink-secondary text-[0.8125rem] mt-[0.0625rem] line-clamp-1">
                  {descricao}
                </p>
              </div>

              {/* ── AÇÕES ─────────────────────────────────── */}
              <div className="shrink-0 flex items-center gap-[0.375rem]">
                {whatsapp && (
                  <a
                    href={`https://wa.me/${cliente.whatsapp}?text=${encodeURIComponent(whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-[0.375rem] h-[1.875rem] px-[0.75rem] rounded-[0.375rem] bg-[#25D366]/10 text-[#25D366] text-[0.8125rem] font-medium hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/20"
                  >
                    <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                    <span className="hidden sm:inline">{acaoLabel}</span>
                  </a>
                )}

                <button className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-ink-primary transition-colors">
                  <Mail className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                </button>

                <button
                  onClick={() => onCongelar(cliente.id)}
                  className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-status-orange transition-colors"
                >
                  <PauseCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                </button>

                {onArquivar && (
                  <button
                    onClick={() => onArquivar(cliente.id)}
                    className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-ink-primary transition-colors"
                  >
                    <Archive className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

### `components\dashboard\ClienteProgressCard.tsx`

```tsx
'use client'

import {
  ArrowRight,
  PauseCircle,
  MessageCircle,
  MoreHorizontal,
  Clock,
} from 'lucide-react'
import { cn }       from '@/lib/utils'
import type { Cliente, Estagio } from '@/lib/types'

const STATUS_CONFIG: Record<string, {
  label: string
  dot:   string
  text:  string
}> = {
  recebido:     { label: 'Recebido',     dot: 'bg-status-blue',   text: 'text-status-blue'   },
  onboarding:   { label: 'Onboarding',   dot: 'bg-ads-500',       text: 'text-ads-500'       },
  setup_trafego:{ label: 'Setup Tráfego',dot: 'bg-status-orange', text: 'text-status-orange' },
  ativo:        { label: 'Ativo',        dot: 'bg-status-green',  text: 'text-status-green'  },
  congelado:    { label: 'Congelado',    dot: 'bg-ink-muted',     text: 'text-ink-muted'     },
  cancelado:    { label: 'Cancelado',    dot: 'bg-status-red',    text: 'text-status-red'    },
}

const NICHO_EMOJI: Record<string, string> = {
  adestramento: '🐕',
  nutricao:     '🥗',
  trafego:      '📊',
  psicoterapia: '🧠',
  servicos:     '🔧',
  ecommerce:    '🛒',
}

interface ClienteProgressCardProps {
  cliente:    Cliente
  estagio:    Estagio | null
  onCongelar: (id: string) => void
  isRetido?:  boolean
}

export function ClienteProgressCard({
  cliente,
  estagio,
  onCongelar,
  isRetido = false,
}: ClienteProgressCardProps) {
  const status = STATUS_CONFIG[cliente.status] ?? STATUS_CONFIG['ativo']
  const emoji  = NICHO_EMOJI[cliente.nicho?.toLowerCase() ?? ''] ?? '🏢'

  const iniciais = cliente.nome
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  return (
    <article
      className={cn(
        'group relative flex flex-col',
        'bg-surface-card rounded-xl border border-surface-border',
        'p-[1.25rem]',
        'hover:border-surface-border/60 hover:shadow-lg hover:shadow-black/20',
        'transition-all duration-200',
        isRetido && 'opacity-70 hover:opacity-100',
      )}
    >
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-[1rem]">
        <div className="flex items-center gap-[0.625rem]">
          <div className="w-[2.25rem] h-[2.25rem] rounded-full bg-ads-500/15 border border-ads-500/20 flex items-center justify-center shrink-0">
            <span className="text-ads-500 text-[0.8125rem] font-bold">{iniciais}</span>
          </div>
          <div>
            <p className="text-ink-primary text-[0.875rem] font-semibold leading-tight">
              {cliente.nome}
            </p>
            <p className="text-ink-muted text-[0.75rem]">
              {emoji} {cliente.nicho}
            </p>
          </div>
        </div>

        <button className="w-[1.75rem] h-[1.75rem] rounded-[0.25rem] flex items-center justify-center text-ink-muted opacity-0 group-hover:opacity-100 hover:bg-surface-hover transition-all">
          <MoreHorizontal className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        </button>
      </div>

      {/* ── STATUS BADGE ──────────────────────────────────── */}
      <div className="flex items-center gap-[0.375rem] mb-[0.875rem]">
        <span className={cn('w-[0.4375rem] h-[0.4375rem] rounded-full shrink-0', status.dot)} />
        <span className={cn('text-[0.75rem] font-medium', status.text)}>{status.label}</span>
      </div>

      {/* ── PRÓXIMA AÇÃO ──────────────────────────────────── */}
      <div className="flex-1 mb-[1rem]">
        {estagio ? (
          <div className="flex items-start gap-[0.375rem]">
            <ArrowRight className="w-[0.875rem] h-[0.875rem] text-ads-500 shrink-0 mt-[0.0625rem]" strokeWidth={2} />
            <p className="text-ink-secondary text-[0.8125rem] leading-snug">
              {estagio.acao_proxima ?? estagio.estagio ?? 'Verificar próxima ação'}
            </p>
          </div>
        ) : (
          <p className="text-ink-muted text-[0.8125rem] italic">
            Sem ação definida
          </p>
        )}
      </div>

      {/* ── FOOTER — BOTÕES ───────────────────────────────── */}
      <div className="flex items-center gap-[0.375rem] pt-[0.875rem] border-t border-surface-border">
        <a
          href={`/clientes/${cliente.id}`}
          className="flex-1 flex items-center justify-center gap-[0.375rem] h-[1.875rem] rounded-[0.375rem] bg-ads-500/10 text-ads-500 text-[0.8125rem] font-medium hover:bg-ads-500/20 transition-colors"
        >
          Abrir
          <ArrowRight className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
        </a>

        {cliente.whatsapp && (
          <a
            href={`https://wa.me/${cliente.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-[#25D366] transition-colors"
          >
            <MessageCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          </a>
        )}

        <button
          onClick={() => onCongelar(cliente.id)}
          className="w-[1.875rem] h-[1.875rem] rounded-[0.375rem] flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-status-orange transition-colors"
          title={isRetido ? 'Reativar' : 'Congelar'}
        >
          {isRetido ? (
            <Clock className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          ) : (
            <PauseCircle className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </article>
  )
}
```

### `components\dashboard\KpiCard.tsx`

```tsx
'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label:       string
  value:       string | number
  delta?:      string
  deltaDir?:   'up' | 'down' | 'neutral'
  deltaLabel?: string
  sparkData?:  number[]
  accentColor?: string
  alert?:      boolean
  alertLabel?: string
  icon?:       React.ReactNode
}

const GRADIENT_ID = (label: string) =>
  `spark-gradient-${label.replace(/\s+/g, '-').toLowerCase()}`

export function KpiCard({
  label,
  value,
  delta,
  deltaDir = 'neutral',
  deltaLabel,
  sparkData,
  accentColor = '#FFA500',
  alert = false,
  alertLabel,
  icon,
}: KpiCardProps) {
  const chartData = sparkData?.map((v, i) => ({ i, v })) ?? []

  const deltaColors = {
    up:      'text-status-green',
    down:    'text-status-red',
    neutral: 'text-ink-muted',
  }

  const DeltaIcon = {
    up:      TrendingUp,
    down:    TrendingDown,
    neutral: Minus,
  }[deltaDir]

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between',
        'bg-surface-card rounded-xl border',
        'p-[1.25rem] overflow-hidden',
        'hover:border-surface-border/80 transition-all duration-200',
        alert
          ? 'border-status-red/40 hover:border-status-red/60'
          : 'border-surface-border',
      )}
    >
      {/* ── LABEL ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-[0.75rem]">
        <p className="text-ink-muted text-[0.75rem] font-semibold uppercase tracking-wide">
          {label}
        </p>
        {icon && (
          <div className="text-ink-muted">
            {icon}
          </div>
        )}
      </div>

      {/* ── VALOR PRINCIPAL ───────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-ink-primary text-[2rem] font-bold leading-none tracking-tight mb-[0.375rem]">
            {value}
          </p>

          {delta && (
            <div className={cn('flex items-center gap-[0.25rem] text-[0.75rem] font-medium', deltaColors[deltaDir])}>
              <DeltaIcon className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} />
              <span>{delta}</span>
              {deltaLabel && (
                <span className="text-ink-muted font-normal">{deltaLabel}</span>
              )}
            </div>
          )}

          {alert && alertLabel && (
            <p className="text-status-red text-[0.75rem] font-medium mt-[0.25rem]">
              {alertLabel}
            </p>
          )}
        </div>

        {/* ── SPARKLINE ───────────────────────────────────── */}
        {chartData.length > 1 && (
          <div className="w-[5rem] h-[2.5rem] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={GRADIENT_ID(label)} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={accentColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={accentColor}
                  strokeWidth={1.5}
                  fill={`url(#${GRADIENT_ID(label)})`}
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── BORDA DE ALERTA (glow sutil) ─────────────────── */}
      {alert && (
        <div className="absolute inset-0 rounded-xl ring-1 ring-status-red/20 pointer-events-none" />
      )}
    </div>
  )
}
```

### `components\layout\MainLayout.tsx`

```tsx
'use client'

import React from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function MainLayout({ children, title, subtitle, actions }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-base">
      <Sidebar />

      {/* ── CONTEÚDO PRINCIPAL ──────────────────────── */}
      <div className="ml-sidebar">
        <TopBar title={title} subtitle={subtitle} actions={actions} />

        <main className="p-[2rem]">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### `components\layout\NotificationBell.tsx`

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, X, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Notificacao } from '@/lib/types'

export function NotificationBell() {
  const supabase    = createClient()
  const ref         = useRef<HTMLDivElement>(null)
  const [notifs,  setNotifs]  = useState<Notificacao[]>([])
  const [aberto,  setAberto]  = useState(false)

  const naoLidas = notifs.filter((n) => !n.lida).length

  useEffect(() => {
    supabase
      .from('notificacoes')
      .select('*')
      .eq('lida', false)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setNotifs((data ?? []) as Notificacao[]))

    const channel = supabase
      .channel('notifs-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificacoes' }, () => {
        supabase
          .from('notificacoes')
          .select('*')
          .eq('lida', false)
          .order('created_at', { ascending: false })
          .limit(20)
          .then(({ data }) => setNotifs((data ?? []) as Notificacao[]))
      })
      .subscribe()

    function handleClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', handleClickFora)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('mousedown', handleClickFora)
    }
  }, [])

  async function marcarLida(id: string) {
    await supabase
      .from('notificacoes')
      .update({ lida: true, lida_em: new Date().toISOString() })
      .eq('id', id)
    setNotifs((prev) => prev.filter((n) => n.id !== id))
  }

  const TIPO_CORES: Record<string, string> = {
    urgente: 'text-status-red   bg-status-red/10',
    atencao: 'text-status-orange bg-status-orange/10',
    info:    'text-status-blue  bg-status-blue/10',
    sucesso: 'text-status-green bg-status-green/10',
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        className="relative w-[2rem] h-[2rem] rounded-[0.375rem] flex items-center justify-center text-ink-secondary hover:bg-surface-hover hover:text-ink-primary transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-[1rem] h-[1rem]" strokeWidth={1.75} />
        {naoLidas > 0 && (
          <span className="absolute top-[0.25rem] right-[0.25rem] min-w-[0.9375rem] h-[0.9375rem] rounded-full bg-status-red flex items-center justify-center text-[0.5625rem] font-bold text-white px-[0.1875rem]">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-[2.5rem] w-[22rem] bg-surface-card border border-surface-border rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden animate-fade-in">
          <div className="px-[1rem] py-[0.75rem] border-b border-surface-border flex items-center justify-between">
            <p className="text-ink-primary font-semibold text-[0.875rem]">Notificações</p>
            {naoLidas > 0 && (
              <button
                onClick={async () => {
                  await supabase.from('notificacoes').update({ lida: true }).eq('lida', false)
                  setNotifs([])
                }}
                className="text-ink-muted text-[0.75rem] hover:text-ink-secondary"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-[2.5rem] text-ink-muted">
                <Bell className="w-[2rem] h-[2rem] mb-[0.5rem]" strokeWidth={1} />
                <p className="text-[0.875rem]">Tudo em dia!</p>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  className={`px-[1rem] py-[0.875rem] border-b border-surface-border hover:bg-surface-hover transition-colors ${TIPO_CORES[n.tipo]?.split(' ')[1] ?? ''}`}
                >
                  <div className="flex items-start justify-between gap-[0.5rem]">
                    <div className="flex-1">
                      <p className={`text-[0.8125rem] font-semibold mb-[0.125rem] ${TIPO_CORES[n.tipo]?.split(' ')[0] ?? 'text-ink-primary'}`}>
                        {n.titulo}
                      </p>
                      {n.mensagem && (
                        <p className="text-ink-secondary text-[0.8125rem] leading-snug">{n.mensagem}</p>
                      )}
                      {n.acao_url && n.acao_label && (
                        <a
                          href={n.acao_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-[0.25rem] text-ads-500 text-[0.75rem] mt-[0.375rem] hover:underline"
                        >
                          {n.acao_label} <ExternalLink className="w-[0.625rem] h-[0.625rem]" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => marcarLida(n.id)}
                      className="text-ink-muted hover:text-ink-primary shrink-0"
                    >
                      <X className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                    </button>
                  </div>
                  <p className="text-ink-muted text-[0.6875rem] mt-[0.375rem]">
                    {new Date(n.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

### `components\layout\Sidebar.tsx`

```tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BarChart2,
  DollarSign,
  FileText,
  Layers,
  Settings,
  HelpCircle,
  LogOut,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/auth'

const NAV_ITEMS = [
  {
    group: 'MENU',
    items: [
      { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
      { href: '/clientes',     icon: Users,           label: 'Clientes'     },
      { href: '/analytics',    icon: BarChart2,       label: 'Analytics'    },
      { href: '/financeiro',   icon: DollarSign,      label: 'Financeiro'   },
      { href: '/relatorios',   icon: FileText,        label: 'Relatórios'   },
      { href: '/biblioteca',   icon: Layers,          label: 'Biblioteca'   },
    ],
  },
  {
    group: 'GERAL',
    items: [
      { href: '/configuracoes', icon: Settings,   label: 'Configurações' },
      { href: '/ajuda',         icon: HelpCircle, label: 'Ajuda'         },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen w-sidebar z-40',
        'flex flex-col',
        'bg-surface-card border-r border-surface-border',
        'transition-all duration-300',
      )}
    >
      {/* ── LOGO ────────────────────────────────────── */}
      <div className="flex items-center gap-[0.625rem] h-[3.5rem] px-[1.25rem] border-b border-surface-border shrink-0">
        <div className="w-[1.75rem] h-[1.75rem] rounded-[0.375rem] bg-ads-500 flex items-center justify-center">
          <Zap className="w-[1rem] h-[1rem] text-white" strokeWidth={2.5} />
        </div>
        <span className="text-ink-primary font-bold text-[1rem] tracking-tight">
          ADSGATOR
        </span>
      </div>

      {/* ── NAVEGAÇÃO ───────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-[1rem] px-[0.75rem] space-y-[1.5rem]">
        {NAV_ITEMS.map((group) => (
          <div key={group.group}>
            <p className="text-ink-muted text-[0.625rem] font-semibold uppercase tracking-[0.08em] px-[0.5rem] mb-[0.375rem]">
              {group.group}
            </p>
            <ul className="space-y-[0.125rem]">
              {group.items.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center gap-[0.625rem]',
                        'h-[2.25rem] px-[0.625rem] rounded-[0.375rem]',
                        'text-[0.875rem] font-medium',
                        'transition-all duration-150',
                        isActive
                          ? 'bg-ads-500/10 text-ads-500'
                          : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary',
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-[1rem] h-[1rem] shrink-0',
                          isActive ? 'text-ads-500' : 'text-ink-muted',
                        )}
                        strokeWidth={isActive ? 2.5 : 1.75}
                      />
                      <span>{label}</span>

                      {isActive && (
                        <span className="ml-auto w-[0.1875rem] h-[1rem] rounded-full bg-ads-500" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── RODAPÉ — USUÁRIO ───────────────────────── */}
      <div className="shrink-0 border-t border-surface-border p-[0.75rem]">
        <div className="flex items-center gap-[0.625rem] p-[0.5rem] rounded-[0.375rem] hover:bg-surface-hover transition-colors cursor-pointer group">
          <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-ads-500/20 border border-ads-500/30 flex items-center justify-center shrink-0">
            <span className="text-ads-500 text-[0.75rem] font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ink-primary text-[0.8125rem] font-medium truncate">Admin</p>
            <p className="text-ink-muted text-[0.6875rem] truncate">Adsgator</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
          >
            <LogOut
              className="w-[0.875rem] h-[0.875rem] text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              strokeWidth={1.75}
            />
          </button>
        </div>
      </div>
    </aside>
  )
}
```

### `components\layout\TopBar.tsx`

```tsx
'use client'

import { Search } from 'lucide-react'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { ThemeToggle }      from '@/components/ui/ThemeToggle'

interface TopBarProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header className="h-[3.5rem] border-b border-surface-border bg-surface-card/80 backdrop-blur-sm sticky top-0 z-30 flex items-center px-[2rem] gap-[1rem]">
      {/* ── TÍTULO ────────────────────────────────── */}
      <div className="flex-1">
        {title && (
          <div>
            <h1 className="text-ink-primary font-bold text-[1.125rem] leading-tight">{title}</h1>
            {subtitle && <p className="text-ink-muted text-[0.75rem]">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* ── AÇÕES CUSTOMIZADAS ─────────────────────── */}
      {actions && <div className="flex items-center gap-[0.5rem]">{actions}</div>}

      {/* ── SEARCH ────────────────────────────────── */}
      <button className="flex items-center gap-[0.5rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-muted text-[0.8125rem] hover:border-surface-border/80 transition-colors">
        <Search className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        <span>Buscar...</span>
        <kbd className="hidden sm:inline-flex items-center gap-[0.125rem] px-[0.25rem] h-[1.125rem] rounded bg-surface-base border border-surface-border text-[0.625rem] text-ink-muted font-mono">
          ⌘K
        </kbd>
      </button>

      {/* ── THEME TOGGLE ──────────────────────────── */}
      <ThemeToggle />

      {/* ── NOTIFICAÇÕES ──────────────────────────── */}
      <NotificationBell />
    </header>
  )
}
```

### `components\ui\Badge.tsx`

```tsx
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?:    'sm' | 'md';
}

const variants = {
  default: 'dark:bg-surface-hover dark:text-ink-secondary bg-gray-100 text-gray-600',
  success: 'bg-brand/15 text-brand',
  warning: 'bg-status-orange/15 text-status-orange',
  danger:  'bg-status-red/15 text-status-red',
  info:    'bg-status-blue/15 text-status-blue',
  purple:  'bg-status-purple/15 text-status-purple',
};

const sizes = {
  sm: 'text-2xs px-[0.375rem] py-[0.0625rem] rounded-[0.1875rem]',
  md: 'text-xs  px-[0.5rem]  py-[0.125rem]  rounded-[0.25rem]',
};

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-semibold ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
```

### `components\ui\ThemeToggle.tsx`

```tsx
'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '@/providers/ThemeProvider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const themes = [
    { key: 'dark'   as const, icon: Moon,    label: 'Escuro'  },
    { key: 'light'  as const, icon: Sun,     label: 'Claro'   },
    { key: 'system' as const, icon: Monitor, label: 'Sistema' },
  ]

  return (
    <div className="flex items-center gap-[0.25rem] p-[0.25rem] bg-surface-hover rounded-[0.5rem] border border-surface-border">
      {themes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          title={label}
          className={`
            w-[1.75rem] h-[1.75rem] rounded-[0.375rem] flex items-center justify-center
            transition-all duration-150
            ${theme === key
              ? 'bg-surface-card text-ads-500 shadow-sm'
              : 'text-ink-muted hover:text-ink-secondary'
            }
          `}
        >
          <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  )
}
```

### `lib\astro-components.ts`

```typescript
// ─── TIPOS ───────────────────────────────────────────────────────────────────

export type CategoriaAstro =
  | 'navegacao'
  | 'hero'
  | 'servicos'
  | 'depoimentos'
  | 'pricing'
  | 'rodape';

export interface AstroComponente {
  id:           string;
  nome:         string;
  categoria:    CategoriaAstro;
  descricao:    string;
  versao:       string;
  variacoes:    string[];
  recomendacoes: string[];
  codigo_astro: string;
}

// ─── BIBLIOTECA ───────────────────────────────────────────────────────────────

export const BIBLIOTECA_COMPONENTES: AstroComponente[] = [
  {
    id:        'nav-minimal',
    nome:      'Navbar Minimalista',
    categoria: 'navegacao',
    descricao: 'Barra de navegação com logo, links e CTA',
    versao:    '1.0',
    variacoes: ['sticky', 'transparente', 'com-blur'],
    recomendacoes: [
      'Usar sticky com backdrop-blur para melhor UX',
      'CTA com cor primária do cliente',
      'Links em font-weight 500',
    ],
    codigo_astro: `---
interface Props {
  nomeMarca: string;
  corPrimaria?: string;
  links?: { label: string; href: string }[];
  cta?: { label: string; href: string };
}

const {
  nomeMarca,
  corPrimaria = '#10b981',
  links = [],
  cta,
} = Astro.props;
---

<nav
  class="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200/50 dark:border-zinc-800/50"
>
  <div class="max-w-6xl mx-auto px-[1.5rem] h-[4rem] flex items-center justify-between">
    <a href="/" class="font-bold text-lg text-zinc-900 dark:text-white">
      {nomeMarca}
    </a>

    <div class="hidden md:flex items-center gap-[2rem]">
      {links.map((link) => (
        <a
          href={link.href}
          class="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          {link.label}
        </a>
      ))}
    </div>

    {cta && (
      <a
        href={cta.href}
        style={{ backgroundColor: corPrimaria }}
        class="text-sm font-semibold text-white px-[1.25rem] h-[2.5rem] rounded-[0.5rem] flex items-center transition-opacity hover:opacity-90"
      >
        {cta.label}
      </a>
    )}
  </div>
</nav>`,
  },

  {
    id:        'hero-cta',
    nome:      'Hero com CTA',
    categoria: 'hero',
    descricao: 'Seção hero com headline, subtítulo e botões de CTA',
    versao:    '1.0',
    variacoes: ['centralizado', 'left-aligned', 'com-imagem'],
    recomendacoes: [
      'Headline em no máximo 8 palavras',
      'Subtítulo explica o benefício, não o serviço',
      'CTA primário com verbo de ação: Agendar, Começar, Falar',
    ],
    codigo_astro: `---
interface Props {
  headline:     string;
  subtitulo:    string;
  ctaPrimario:  { label: string; href: string };
  ctaSecundario?: { label: string; href: string };
  corPrimaria?: string;
}

const {
  headline,
  subtitulo,
  ctaPrimario,
  ctaSecundario,
  corPrimaria = '#10b981',
} = Astro.props;
---

<section class="py-[6rem] px-[1.5rem]">
  <div class="max-w-3xl mx-auto text-center">
    <h1 class="text-[3.5rem] font-bold leading-tight text-zinc-900 dark:text-white mb-[1.5rem]">
      {headline}
    </h1>
    <p class="text-xl text-zinc-500 dark:text-zinc-400 mb-[2.5rem] leading-relaxed">
      {subtitulo}
    </p>
    <div class="flex items-center justify-center gap-[1rem] flex-wrap">
      <a
        href={ctaPrimario.href}
        style={{ backgroundColor: corPrimaria }}
        class="text-base font-semibold text-white px-[2rem] h-[3rem] rounded-[0.625rem] flex items-center transition-opacity hover:opacity-90"
      >
        {ctaPrimario.label}
      </a>
      {ctaSecundario && (
        <a
          href={ctaSecundario.href}
          class="text-base font-medium text-zinc-600 dark:text-zinc-400 px-[2rem] h-[3rem] rounded-[0.625rem] flex items-center border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 transition-colors"
        >
          {ctaSecundario.label}
        </a>
      )}
    </div>
  </div>
</section>`,
  },

  {
    id:        'servicos-grid',
    nome:      'Grid de Serviços',
    categoria: 'servicos',
    descricao: 'Cards de serviços em grid responsivo com ícone, título e descrição',
    versao:    '1.0',
    variacoes: ['3 colunas', '2 colunas', 'lista'],
    recomendacoes: [
      'Máximo 6 serviços para não sobrecarregar o leitor',
      'Ícone SVG, não emoji',
      'Descrição em 1-2 frases objetivas',
    ],
    codigo_astro: `---
interface Servico {
  icone:    string; // SVG inline
  titulo:   string;
  descricao: string;
}

interface Props {
  titulo:     string;
  servicos:   Servico[];
  corPrimaria?: string;
}

const { titulo, servicos, corPrimaria = '#10b981' } = Astro.props;
---

<section class="py-[5rem] px-[1.5rem]">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-[2.25rem] font-bold text-zinc-900 dark:text-white text-center mb-[3.5rem]">
      {titulo}
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-[2rem]">
      {servicos.map((s) => (
        <div class="p-[1.75rem] rounded-[1rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <div
            class="w-[3rem] h-[3rem] rounded-[0.75rem] flex items-center justify-center mb-[1.25rem]"
            style={{ backgroundColor: corPrimaria + '20' }}
          >
            <Fragment set:html={s.icone} />
          </div>
          <h3 class="font-semibold text-zinc-900 dark:text-white text-lg mb-[0.5rem]">
            {s.titulo}
          </h3>
          <p class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
            {s.descricao}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>`,
  },

  {
    id:        'depoimentos-slider',
    nome:      'Depoimentos',
    categoria: 'depoimentos',
    descricao: 'Seção de prova social com depoimentos de clientes',
    versao:    '1.0',
    variacoes: ['grid', 'slider', 'destaque único'],
    recomendacoes: [
      'Usar depoimentos reais com nome completo e foto',
      'Mencionar resultado específico no depoimento',
      'Mínimo 3 depoimentos para credibilidade',
    ],
    codigo_astro: `---
interface Depoimento {
  texto:  string;
  nome:   string;
  cargo?: string;
  avatar?: string;
}

interface Props {
  titulo:      string;
  depoimentos: Depoimento[];
}

const { titulo, depoimentos } = Astro.props;
---

<section class="py-[5rem] px-[1.5rem] bg-zinc-50 dark:bg-zinc-950">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-[2.25rem] font-bold text-zinc-900 dark:text-white text-center mb-[3.5rem]">
      {titulo}
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-[1.5rem]">
      {depoimentos.map((d) => (
        <div class="p-[1.75rem] bg-white dark:bg-zinc-900 rounded-[1rem] border border-zinc-200 dark:border-zinc-800">
          <p class="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed mb-[1.5rem]">
            "{d.texto}"
          </p>
          <div class="flex items-center gap-[0.75rem]">
            {d.avatar
              ? <img src={d.avatar} alt={d.nome} class="w-[2.5rem] h-[2.5rem] rounded-full object-cover" />
              : <div class="w-[2.5rem] h-[2.5rem] rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 font-bold">{d.nome[0]}</div>
            }
            <div>
              <p class="font-semibold text-zinc-900 dark:text-white text-sm">{d.nome}</p>
              {d.cargo && <p class="text-zinc-400 text-xs">{d.cargo}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>`,
  },

  {
    id:        'pricing-simples',
    nome:      'Pricing Simples',
    categoria: 'pricing',
    descricao: 'Tabela de preços com planos e CTA por plano',
    versao:    '1.0',
    variacoes: ['2 planos', '3 planos', 'plano único'],
    recomendacoes: [
      'Destacar visualmente o plano mais popular',
      'Listar até 5 benefícios por plano',
      'Preço com destaque visual, sem centavos se possível',
    ],
    codigo_astro: `---
interface Plano {
  nome:        string;
  preco:       string;
  periodo?:    string;
  beneficios:  string[];
  destaque?:   boolean;
  cta:         { label: string; href: string };
}

interface Props {
  titulo:       string;
  planos:       Plano[];
  corPrimaria?: string;
}

const { titulo, planos, corPrimaria = '#10b981' } = Astro.props;
---

<section class="py-[5rem] px-[1.5rem]">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-[2.25rem] font-bold text-zinc-900 dark:text-white text-center mb-[3.5rem]">
      {titulo}
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-{planos.length} gap-[1.5rem] items-start">
      {planos.map((p) => (
        <div
          class={\`p-[2rem] rounded-[1rem] border-2 \${p.destaque ? 'border-current shadow-lg' : 'border-zinc-200 dark:border-zinc-800'}\`}
          style={p.destaque ? { borderColor: corPrimaria } : {}}
        >
          {p.destaque && (
            <p class="text-xs font-bold uppercase tracking-wide mb-[1rem]" style={{ color: corPrimaria }}>
              Mais Popular
            </p>
          )}
          <p class="text-zinc-900 dark:text-white font-bold text-xl mb-[0.5rem]">{p.nome}</p>
          <p class="text-[2.5rem] font-bold text-zinc-900 dark:text-white leading-none mb-[0.25rem]">
            {p.preco}
          </p>
          {p.periodo && <p class="text-zinc-400 text-xs mb-[1.5rem]">{p.periodo}</p>}
          <ul class="space-y-[0.75rem] mb-[2rem]">
            {p.beneficios.map((b) => (
              <li class="flex items-start gap-[0.5rem] text-sm text-zinc-600 dark:text-zinc-300">
                <span style={{ color: corPrimaria }} class="font-bold mt-[0.125rem]">✓</span>
                {b}
              </li>
            ))}
          </ul>
          <a
            href={p.cta.href}
            class="block w-full text-center font-semibold text-sm h-[3rem] leading-[3rem] rounded-[0.625rem] transition-opacity hover:opacity-90"
            style={p.destaque
              ? { backgroundColor: corPrimaria, color: '#fff' }
              : { border: '1.5px solid currentColor', color: corPrimaria }
            }
          >
            {p.cta.label}
          </a>
        </div>
      ))}
    </div>
  </div>
</section>`,
  },

  {
    id:        'rodape-simples',
    nome:      'Rodapé Simples',
    categoria: 'rodape',
    descricao: 'Footer com logo, links, redes sociais e copyright',
    versao:    '1.0',
    variacoes: ['minimalista', 'colunas', 'com-newsletter'],
    recomendacoes: [
      'Incluir links de política de privacidade e termos',
      'WhatsApp e Instagram são essenciais para nichos locais',
      'Manter copyright atualizado com ano dinâmico',
    ],
    codigo_astro: `---
interface Props {
  nomeMarca:  string;
  descricao?: string;
  links?:     { label: string; href: string }[];
  whatsapp?:  string;
  instagram?: string;
}

const { nomeMarca, descricao, links = [], whatsapp, instagram } = Astro.props;
const ano = new Date().getFullYear();
---

<footer class="border-t border-zinc-200 dark:border-zinc-800 py-[3rem] px-[1.5rem]">
  <div class="max-w-6xl mx-auto">
    <div class="flex flex-col md:flex-row items-start justify-between gap-[2rem] mb-[2rem]">
      <div class="max-w-[16rem]">
        <p class="font-bold text-zinc-900 dark:text-white text-lg mb-[0.5rem]">{nomeMarca}</p>
        {descricao && <p class="text-zinc-400 text-sm">{descricao}</p>}
      </div>
      <div class="flex flex-wrap gap-[1.5rem]">
        {links.map((l) => (
          <a href={l.href} class="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            {l.label}
          </a>
        ))}
        {whatsapp && (
          <a href={\`https://wa.me/55\${whatsapp.replace(/\\D/g, '')}\`} target="_blank" rel="noopener noreferrer" class="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            WhatsApp
          </a>
        )}
        {instagram && (
          <a href={\`https://instagram.com/\${instagram}\`} target="_blank" rel="noopener noreferrer" class="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            @{instagram}
          </a>
        )}
      </div>
    </div>
    <p class="text-zinc-400 text-xs border-t border-zinc-100 dark:border-zinc-800 pt-[1.5rem]">
      © {ano} {nomeMarca}. Todos os direitos reservados.
    </p>
  </div>
</footer>`,
  },
];

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────

export function obterComponentePorId(id: string): AstroComponente | undefined {
  return BIBLIOTECA_COMPONENTES.find((c) => c.id === id);
}

export function obterCategorias(): CategoriaAstro[] {
  return Array.from(new Set(BIBLIOTECA_COMPONENTES.map((c) => c.categoria)));
}

export function obterComponentesPorCategoria(categoria: CategoriaAstro): AstroComponente[] {
  return BIBLIOTECA_COMPONENTES.filter((c) => c.categoria === categoria);
}
```

### `lib\auth.ts`

```typescript
import { supabase } from './supabase';

export async function loginComEmail(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function obterSessao() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

export async function obterUsuario() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}
```

### `lib\database.ts`

```typescript
import { supabase } from './supabase';
import type { Cliente, Estagio, HistoricoAcao, Assinatura } from './types';

// ============================================================
// CLIENTES
// ============================================================

export async function criarCliente(dados: Omit<Cliente, 'id' | 'user_id' | 'dias_atraso' | 'created_at' | 'updated_at' | 'data_criacao' | 'data_atualizacao'>) {
  const { data, error } = await supabase
    .from('clientes')
    .insert([{ ...dados, status: 'recebido' }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar cliente: ${error.message}`);

  // Criar estágio inicial
  await criarEstagio({
    cliente_id: data.id,
    estagio: 'recebido',
    acao_proxima: 'Enviar mensagem de boas-vindas via WhatsApp com template #BOASVINDAS',
    pendente_cliente: false,
  });

  // Registrar no histórico
  await registrarHistorico(data.id, 'cliente_criado', `Cliente ${dados.nome} criado no sistema.`);

  return data as Cliente;
}

export async function obterCliente(clienteId: string): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', clienteId)
    .single();

  if (error) throw new Error(`Erro ao obter cliente: ${error.message}`);
  return data as Cliente;
}

export async function listarClientes(filtro?: { status?: string; nicho?: string }): Promise<Cliente[]> {
  let query = supabase.from('clientes').select('*');

  if (filtro?.status) query = query.eq('status', filtro.status);
  if (filtro?.nicho)  query = query.eq('nicho', filtro.nicho);

  const { data, error } = await query.order('data_criacao', { ascending: false });

  if (error) throw new Error(`Erro ao listar clientes: ${error.message}`);
  return (data ?? []) as Cliente[];
}

export async function atualizarCliente(clienteId: string, dados: Partial<Cliente>) {
  const { error } = await supabase
    .from('clientes')
    .update(dados)
    .eq('id', clienteId);

  if (error) throw new Error(`Erro ao atualizar cliente: ${error.message}`);
}

export async function avancarEstagio(clienteId: string, novoEstagio: string, acaoProxima: string) {
  // Finaliza o estágio atual
  const estagioAtivo = await obterEstagioAtivo(clienteId);
  if (estagioAtivo) {
    await supabase
      .from('estagios_operacionais')
      .update({ data_saida: new Date().toISOString() })
      .eq('id', estagioAtivo.id);
  }

  // Mapeia estágio → status do cliente
  const statusMap: Record<string, string> = {
    recebido:      'recebido',
    onboarding:    'onboarding',
    setup_trafego: 'setup_trafego',
    ativo:         'ativo',
    congelado:     'congelado',
    cancelado:     'cancelado',
  };

  const novoStatus = statusMap[novoEstagio] ?? novoEstagio;
  await atualizarCliente(clienteId, { status: novoStatus as Cliente['status'] });

  // Cria novo estágio
  const novoEsTagioData = await criarEstagio({
    cliente_id:      clienteId,
    estagio:         novoEstagio,
    acao_proxima:    acaoProxima,
    pendente_cliente: false,
  });

  // Registra no histórico
  await registrarHistorico(
    clienteId,
    'avanco_estagio',
    `Cliente avançou para o estágio "${novoEstagio}". Próxima ação: ${acaoProxima}`,
  );

  return novoEsTagioData;
}

// ============================================================
// ESTAGIOS OPERACIONAIS
// ============================================================

export async function criarEstagio(dados: {
  cliente_id:       string;
  estagio:          string;
  acao_proxima:     string;
  pendente_cliente?: boolean;
}): Promise<Estagio> {
  const { data, error } = await supabase
    .from('estagios_operacionais')
    .insert([dados])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar estágio: ${error.message}`);
  return data as Estagio;
}

export async function obterEstagioAtivo(clienteId: string): Promise<Estagio | null> {
  const { data, error } = await supabase
    .from('estagios_operacionais')
    .select('*')
    .eq('cliente_id', clienteId)
    .is('data_saida', null)
    .order('data_entrada', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Erro ao obter estágio: ${error.message}`);
  return data as Estagio | null;
}

export async function congelarCliente(clienteId: string) {
  const estagioAtivo = await obterEstagioAtivo(clienteId);
  const estagioAnterior = estagioAtivo?.estagio ?? 'desconhecido';

  await avancarEstagio(
    clienteId,
    'congelado',
    'Aguardando retorno do cliente. Alerta automático em 48h.',
  );

  // Registrar alerta de 48h na tabela alertas (sem setTimeout — processado por cron)
  const disparaEm = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await supabase.from('alertas').insert({
    cliente_id:   clienteId,
    tipo_alerta:  'pendencia_48h',
    mensagem:     `Cliente sem retorno há 48h. Estava no estágio "${estagioAnterior}". Reativar contato.`,
    dispara_em:   disparaEm.toISOString(),
    disparado:    false,
  });

  await registrarHistorico(
    clienteId,
    'cliente_congelado',
    'Cliente movido para "Retidos". Aguardando resposta. Alerta agendado para 48h.',
  );
}

export async function descongelarCliente(clienteId: string, estagioRetorno: string, acaoProxima: string) {
  // Cancelar alertas pendentes deste cliente
  await supabase
    .from('alertas')
    .update({ disparado: true, data_disparo: new Date().toISOString() })
    .eq('cliente_id', clienteId)
    .eq('tipo_alerta', 'pendencia_48h')
    .eq('disparado', false);

  await avancarEstagio(clienteId, estagioRetorno, acaoProxima);
  await registrarHistorico(clienteId, 'cliente_descongelado', `Cliente descongelado. Retornando ao estágio "${estagioRetorno}".`);
}

// ============================================================
// HISTORICO
// ============================================================

export async function registrarHistorico(
  clienteId:      string,
  tipoAcao:       string,
  descricao:      string,
  valorImpactado?: number,
  metadata?:       Record<string, unknown>,
) {
  const { error } = await supabase.from('historico_acoes').insert({
    cliente_id:      clienteId,
    tipo_acao:       tipoAcao,
    descricao,
    valor_impactado: valorImpactado ?? null,
    metadata:        metadata ?? {},
  });

  if (error) console.error(`[Histórico] Erro ao registrar: ${error.message}`);
}

export async function obterHistoricoCliente(clienteId: string): Promise<HistoricoAcao[]> {
  const { data, error } = await supabase
    .from('historico_acoes')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('data_acao', { ascending: false })
    .limit(50);

  if (error) throw new Error(`Erro ao obter histórico: ${error.message}`);
  return (data ?? []) as HistoricoAcao[];
}

// ============================================================
// ASSINATURAS
// ============================================================

export async function criarAssinatura(dados: {
  cliente_id:              string;
  plano_nome:              string;
  valor_mensal:            number;
  asaas_subscription_id?:  string;
}): Promise<Assinatura> {
  const dataProximaCobranca = new Date();
  dataProximaCobranca.setMonth(dataProximaCobranca.getMonth() + 1);

  const { data, error } = await supabase
    .from('assinaturas')
    .insert([{
      ...dados,
      status: 'ativa',
      dias_atraso: 0,
      data_inicio: new Date().toISOString(),
      data_proxima_cobranca: dataProximaCobranca.toISOString(),
    }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar assinatura: ${error.message}`);

  await registrarHistorico(
    dados.cliente_id,
    'assinatura_criada',
    `Assinatura "${dados.plano_nome}" criada. Valor: R$ ${dados.valor_mensal.toFixed(2)}/mês.`,
    dados.valor_mensal,
  );

  return data as Assinatura;
}

export async function obterAssinaturaCliente(clienteId: string): Promise<Assinatura | null> {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('*')
    .eq('cliente_id', clienteId)
    .maybeSingle();

  if (error) throw new Error(`Erro ao obter assinatura: ${error.message}`);
  return data as Assinatura | null;
}

// ============================================================
// ONBOARD PROGRESSO
// ============================================================

export async function obterProgressoOnboard(clienteId: string): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from('onboard_progresso')
    .select('progresso')
    .eq('cliente_id', clienteId)
    .maybeSingle();

  if (error) throw new Error(`Erro ao obter progresso: ${error.message}`);
  return (data?.progresso ?? {}) as Record<string, boolean>;
}

export async function salvarProgressoOnboard(
  clienteId: string,
  progresso: Record<string, boolean>,
) {
  const { error } = await supabase
    .from('onboard_progresso')
    .upsert({ cliente_id: clienteId, progresso })
    .eq('cliente_id', clienteId);

  if (error) throw new Error(`Erro ao salvar progresso: ${error.message}`);
}

// ============================================================
// ALERTAS
// ============================================================

export async function obterAlertasPendentes(clienteId?: string) {
  let query = supabase
    .from('alertas')
    .select('*, clientes(id, nome, whatsapp)')
    .eq('disparado', false)
    .lte('dispara_em', new Date().toISOString())
    .order('dispara_em', { ascending: true });

  if (clienteId) query = query.eq('cliente_id', clienteId);

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao obter alertas: ${error.message}`);
  return data ?? [];
}
```

### `lib\financeiro.ts`

```typescript
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
```

### `lib\fluxo-operacional.ts`

```typescript
export interface EtapaFluxo {
  id:                 string;
  label:              string;
  descricao:          string;
  corBadge:           string;
  icone:              string;
  instrucao:          string;
  whatsapp_templates: string[];
  checklist?:         ChecklistItem[];
  proximo_estagio?:   string;
  proxima_acao_label: string;
}

export interface ChecklistItem {
  id:    string;
  texto: string;
}

export const FLUXO_OPERACIONAL: Record<string, EtapaFluxo> = {

  recebido: {
    id:                 'recebido',
    label:              'Recebido',
    descricao:          'Pagamento confirmado. Cliente aguarda contato inicial.',
    corBadge:           'bg-status-blue text-white',
    icone:              'Bell',
    instrucao:          'Envie a mensagem de boas-vindas agora com o template #BOASVINDAS. O cliente acabou de pagar e está aguardando.',
    whatsapp_templates: ['#BOASVINDAS'],
    proximo_estagio:    'onboarding',
    proxima_acao_label: 'Boas-vindas enviadas → Ir para Onboarding',
  },

  onboarding: {
    id:                 'onboarding',
    label:              'Onboarding',
    descricao:          'Configuração inicial da conta e estrutura do projeto.',
    corBadge:           'bg-status-purple text-white',
    icone:              'ClipboardList',
    instrucao:          'Conclua o checklist de onboarding abaixo. Envie o #CONVITE para call e o #BRIEFINGGA para coletar informações do negócio.',
    whatsapp_templates: ['#CONVITE', '#BRIEFINGGA'],
    checklist: [
      { id: 'contrato',          texto: 'Contrato enviado e assinado' },
      { id: 'pix-setup',         texto: 'Pix do setup recebido' },
      { id: 'grupo-zap',         texto: 'Grupo criado no WhatsApp com o cliente' },
      { id: 'video-boas-vindas', texto: 'Vídeo de boas-vindas enviado' },
    ],
    proximo_estagio:    'setup_trafego',
    proxima_acao_label: 'Onboarding completo → Ir para Setup de Tráfego',
  },

  setup_trafego: {
    id:                 'setup_trafego',
    label:              'Setup de Tráfego',
    descricao:          'Configuração técnica da conta Google Ads, LP e campanhas.',
    corBadge:           'bg-status-yellow text-black',
    icone:              'Settings2',
    instrucao:          'Siga o checklist técnico abaixo. Conclua todos os itens antes de ativar as campanhas.',
    whatsapp_templates: [],
    checklist: [
      { id: 'acesso-ads',       texto: 'Acesso à conta Google Ads solicitado/concedido' },
      { id: 'pagamento-ads',    texto: 'Pagamento configurado na conta Google Ads' },
      { id: 'publico-alvo',     texto: 'Público-alvo criado e configurado' },
      { id: 'palavras-chave',   texto: 'Palavras-chave negativadas (nível de conta)' },
      { id: 'conversao-ads',    texto: 'Tag de conversão (WhatsApp) criada' },
      { id: 'dominio',          texto: 'Domínio comprado e configurado' },
      { id: 'lp-criada',        texto: 'Landing page criada e publicada' },
      { id: 'tag-geral',        texto: 'Tag geral do Google instalada na LP' },
      { id: 'tag-conversao',    texto: 'Tag de conversão instalada na LP' },
      { id: 'teste-fluxo',      texto: 'Fluxo completo (Anúncio → LP → WhatsApp) testado' },
      { id: 'campanha-criada',  texto: 'Campanha criada e estruturada' },
      { id: 'anuncios-criados', texto: 'Anúncios criados (mínimo 3 variações)' },
      { id: 'revisao-final',    texto: 'Revisão final de orçamento, locais e palavras-chave' },
      { id: 'campanha-ativa',   texto: '🚀 Campanha ATIVADA' },
    ],
    proximo_estagio:    'ativo',
    proxima_acao_label: 'Campanha no ar → Cliente Ativo',
  },

  ativo: {
    id:                 'ativo',
    label:              'Ativo',
    descricao:          'Campanha rodando. Gestão contínua e otimizações.',
    corBadge:           'bg-brand text-white',
    icone:              'TrendingUp',
    instrucao:          'Cliente ativo. Monitore o saldo, verifique as métricas semanalmente e otimize as campanhas. Use #SALDOGOOGLE quando o saldo estiver crítico.',
    whatsapp_templates: ['#SALDOGOOGLE'],
    proximo_estagio:    undefined,
    proxima_acao_label: '',
  },

  congelado: {
    id:                 'congelado',
    label:              'Retido',
    descricao:          'Aguardando retorno do cliente. Alerta automático em 48h.',
    corBadge:           'bg-status-orange text-white',
    icone:              'PauseCircle',
    instrucao:          'Este cliente está aguardando sua resposta. O sistema alertará automaticamente em 48h se não houver movimento.',
    whatsapp_templates: [],
    proximo_estagio:    undefined,
    proxima_acao_label: '',
  },

  cancelado: {
    id:                 'cancelado',
    label:              'Cancelado',
    descricao:          'Contrato encerrado. Ações de desativação necessárias.',
    corBadge:           'bg-status-red text-white',
    icone:              'XCircle',
    instrucao:          'Cliente cancelado. Remova a Landing Page do ar, delete os assets do Storage e encerre as campanhas no Google Ads.',
    whatsapp_templates: [],
    proximo_estagio:    undefined,
    proxima_acao_label: '',
  },
};

export const ORDEM_ESTAGIOS = ['recebido', 'onboarding', 'setup_trafego', 'ativo'] as const;

export const WHATSAPP_TEMPLATES: Record<string, { titulo: string; mensagem: string }> = {
  '#BOASVINDAS': {
    titulo: 'Boas-vindas',
    mensagem: `Olá! 👋

Seja muito bem-vindo(a)! 🚀

Estamos super animados em tê-lo(a) como nosso cliente. A partir de agora, estamos juntos para colocar o seu negócio em outro nível no Google!

Nos próximos dias vou entrar em contato para alinharmos os próximos passos do nosso projeto.

Qualquer dúvida que surgir, pode chamar aqui! Estou à disposição.`,
  },

  '#CONVITE': {
    titulo: 'Convite para Call de Alinhamento',
    mensagem: `Oi! 👋

Tudo certo? Vim marcar nossa call inicial para a gente alinhar a estratégia e tirar todas as dúvidas antes de começar.

Tenho disponibilidade nos seguintes horários. Qual funciona melhor para você?

Por favor me informe a melhor opção e te mando o link da chamada. 😊`,
  },

  '#BRIEFINGGA': {
    titulo: 'Briefing Google Ads',
    mensagem: `Oi! 📋

Para montar a sua campanha de Google Ads da forma mais certeira possível, precisamos de algumas informações sobre o seu negócio.

Pode me responder as perguntas abaixo?

✅ Qual o seu principal produto/serviço?
✅ Qual o ticket médio?
✅ Qual a cidade/região de atuação?
✅ Qual o perfil do seu cliente ideal (idade, gênero, situação)?
✅ Quais são seus 3 principais diferenciais?
✅ Já teve experiências com Google Ads antes?

Com isso, já consigo estruturar tudo para você! 🙏`,
  },

  '#SALDOGOOGLE': {
    titulo: 'Alerta de Saldo Google Ads',
    mensagem: `Olá! ⚠️

Passando para avisar que o saldo da sua conta do Google Ads está próximo do limite mínimo.

Para garantir que suas campanhas não parem e você não perca leads, é importante fazer uma recarga o quanto antes.

Qualquer dúvida sobre como fazer a recarga, é só me chamar! 😊`,
  },
};

export function gerarLinkWhatsApp(template: keyof typeof WHATSAPP_TEMPLATES, numero: string): string {
  const t = WHATSAPP_TEMPLATES[template];
  if (!t) return '';
  const numeroLimpo = numero.replace(/\D/g, '');
  const mensagemCodificada = encodeURIComponent(t.mensagem);
  return `https://wa.me/55${numeroLimpo}?text=${mensagemCodificada}`;
}
```

### `lib\google-ads.ts`

```typescript
import { GoogleAdsApi } from 'google-ads-api';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface DadosCampanhaAds {
  campanha_id:     string;
  campanha_nome:   string;
  status:          string;
  impressoes:      number;
  cliques:         number;
  ctr:             number;
  custo_total:     number;
  conversoes:      number;
  cpa:             number;
  roas:            number;
}

export interface PalavraChavePerformance {
  keyword:     string;
  impressoes:  number;
  cliques:     number;
  ctr:         number;
  cpc_medio:   number;
  conversoes:  number;
  custo:       number;
}

// ─── CLIENTE GOOGLE ADS ───────────────────────────────────────────────────────

function criarClienteAds() {
  return new GoogleAdsApi({
    client_id:       process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret:   process.env.GOOGLE_ADS_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  });
}

// ─── OBTER DADOS DE CAMPANHAS ─────────────────────────────────────────────────

export async function obterDadosCampanhasAds(
  customerId:  string,
  mesAno:      string,  // formato: YYYY-MM
): Promise<DadosCampanhaAds[]> {
  const [ano, mes] = mesAno.split('-').map(Number);
  const primeiroDia = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia   = new Date(ano, mes, 0);
  const ultimoDiaStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;

  try {
    const client   = criarClienteAds();
    const customer = client.Customer({
      customer_id:   customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
    });

    const results = await customer.query(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.cost_micros,
        metrics.conversions,
        metrics.cost_per_conversion
      FROM campaign
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
        AND campaign.status != 'REMOVED'
    `);

    return results.map((r: Record<string, any>) => {
      const custo      = (r.metrics?.cost_micros ?? 0) / 1_000_000;
      const conversoes = r.metrics?.conversions ?? 0;
      const cliques    = r.metrics?.clicks      ?? 0;
      const impressoes = r.metrics?.impressions  ?? 0;

      return {
        campanha_id:   String(r.campaign?.id ?? ''),
        campanha_nome: String(r.campaign?.name ?? ''),
        status:        String(r.campaign?.status ?? ''),
        impressoes,
        cliques,
        ctr:           impressoes > 0 ? (cliques / impressoes) * 100 : 0,
        custo_total:   custo,
        conversoes,
        cpa:           conversoes > 0 ? custo / conversoes : 0,
        roas:          custo > 0 ? conversoes / custo : 0,
      };
    });
  } catch (error) {
    console.error('Erro ao obter campanhas Google Ads:', error);
    return [];
  }
}

// ─── OBTER PALAVRAS-CHAVE ─────────────────────────────────────────────────────

export async function obterPalavrasChavePerformance(
  customerId: string,
  mesAno:     string,
): Promise<PalavraChavePerformance[]> {
  const [ano, mes] = mesAno.split('-').map(Number);
  const primeiroDia  = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia    = new Date(ano, mes, 0);
  const ultimoDiaStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;

  try {
    const client   = criarClienteAds();
    const customer = client.Customer({
      customer_id:   customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
    });

    const results = await customer.query(`
      SELECT
        ad_group_criterion.keyword.text,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions,
        metrics.cost_micros
      FROM keyword_view
      WHERE segments.date BETWEEN '${primeiroDia}' AND '${ultimoDiaStr}'
        AND ad_group_criterion.status != 'REMOVED'
      ORDER BY metrics.clicks DESC
      LIMIT 20
    `);

    return results.map((r: Record<string, any>) => ({
      keyword:    String(r.ad_group_criterion?.keyword?.text ?? ''),
      impressoes: r.metrics?.impressions    ?? 0,
      cliques:    r.metrics?.clicks         ?? 0,
      ctr:        (r.metrics?.ctr           ?? 0) * 100,
      cpc_medio:  (r.metrics?.average_cpc   ?? 0) / 1_000_000,
      conversoes: r.metrics?.conversions    ?? 0,
      custo:      (r.metrics?.cost_micros   ?? 0) / 1_000_000,
    }));
  } catch (error) {
    console.error('Erro ao obter palavras-chave:', error);
    return [];
  }
}
```

### `lib\google-analytics.ts`

```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface DadosGA4 {
  sessoes:                number;
  usuarios_novos:         number;
  visualizacoes_pagina:   number;
  taxa_engajamento:       number;
  duracao_media_sessao:   number;
  taxa_rejeicao:          number;
  conversoes:             number;
  valor_conversao_total:  number;
}

export interface PaginaPerformance {
  pagina:               string;
  visualizacoes:        number;
  usuarios_unicos:      number;
  taxa_engajamento:     number;
  tempo_medio_segundos: number;
}

export interface FonteTrafego {
  fonte:             string;
  midia:             string;
  sessoes:           number;
  conversoes:        number;
  taxa_conversao:    number;
}

// ─── CLIENTE GA4 ─────────────────────────────────────────────────────────────
// O SDK lê GOOGLE_APPLICATION_CREDENTIALS automaticamente do ambiente.

function criarClienteGA4() {
  return new BetaAnalyticsDataClient();
}

function intervaloMes(mesAno: string): { startDate: string; endDate: string } {
  const [ano, mes] = mesAno.split('-').map(Number);
  const ultimoDia  = new Date(ano, mes, 0).getDate();
  return {
    startDate: `${ano}-${String(mes).padStart(2, '0')}-01`,
    endDate:   `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`,
  };
}

// ─── MÉTRICAS GA4 ────────────────────────────────────────────────────────────

export async function obterDadosGA4(
  propertyId: string,
  mesAno:     string,
): Promise<DadosGA4> {
  const { startDate, endDate } = intervaloMes(mesAno);

  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions'             },
        { name: 'newUsers'             },
        { name: 'screenPageViews'      },
        { name: 'engagementRate'       },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate'           },
        { name: 'conversions'          },
        { name: 'totalRevenue'         },
      ],
    });

    const row = response?.rows?.[0]?.metricValues ?? [];
    const val = (i: number) => parseFloat(row[i]?.value ?? '0');

    return {
      sessoes:               val(0),
      usuarios_novos:        val(1),
      visualizacoes_pagina:  val(2),
      taxa_engajamento:      val(3) * 100,
      duracao_media_sessao:  val(4),
      taxa_rejeicao:         val(5) * 100,
      conversoes:            val(6),
      valor_conversao_total: val(7),
    };
  } catch (error) {
    console.error('Erro ao obter dados GA4:', error);
    return {
      sessoes: 0, usuarios_novos: 0, visualizacoes_pagina: 0,
      taxa_engajamento: 0, duracao_media_sessao: 0,
      taxa_rejeicao: 0, conversoes: 0, valor_conversao_total: 0,
    };
  }
}

// ─── TOP PÁGINAS ─────────────────────────────────────────────────────────────

export async function obterPaginasTopPerformance(
  propertyId: string,
  mesAno:     string,
): Promise<PaginaPerformance[]> {
  const { startDate, endDate } = intervaloMes(mesAno);

  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews'      },
        { name: 'activeUsers'          },
        { name: 'engagementRate'       },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    });

    return (response?.rows ?? []).map((row: Record<string, any>) => ({
      pagina:               row.dimensionValues?.[0]?.value ?? '/',
      visualizacoes:        parseFloat(row.metricValues?.[0]?.value ?? '0'),
      usuarios_unicos:      parseFloat(row.metricValues?.[1]?.value ?? '0'),
      taxa_engajamento:     parseFloat(row.metricValues?.[2]?.value ?? '0') * 100,
      tempo_medio_segundos: parseFloat(row.metricValues?.[3]?.value ?? '0'),
    }));
  } catch (error) {
    console.error('Erro ao obter páginas GA4:', error);
    return [];
  }
}

// ─── FONTES DE TRÁFEGO ────────────────────────────────────────────────────────

export async function obterFontesTrafego(
  propertyId: string,
  mesAno:     string,
): Promise<FonteTrafego[]> {
  const { startDate, endDate } = intervaloMes(mesAno);

  try {
    const client = criarClienteGA4();
    const [response] = await client.runReport({
      property:   `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [
        { name: 'sessions'    },
        { name: 'conversions' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    });

    return (response?.rows ?? []).map((row: Record<string, any>) => {
      const sessoes    = parseFloat(row.metricValues?.[0]?.value ?? '0');
      const conversoes = parseFloat(row.metricValues?.[1]?.value ?? '0');
      return {
        fonte:          row.dimensionValues?.[0]?.value ?? '(direct)',
        midia:          row.dimensionValues?.[1]?.value ?? '(none)',
        sessoes,
        conversoes,
        taxa_conversao: sessoes > 0 ? (conversoes / sessoes) * 100 : 0,
      };
    });
  } catch (error) {
    console.error('Erro ao obter fontes GA4:', error);
    return [];
  }
}
```

### `lib\manifesto-generator.ts`

```typescript
import { BIBLIOTECA_COMPONENTES } from './astro-components';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface PaletaCores {
  primaria:    string;
  secundaria:  string;
  backgrounds: string[];
}

export interface ManifestoProducao {
  titulo:                   string;
  nicho:                    string;
  paleta_cores:             PaletaCores;
  estilo:                   string;
  direcao_arte:             string;
  estrutura_pagina:         string;
  componentes_selecionados: string[];
  copy_por_secao:           Record<string, string>;
  notas_desenvolvimento:    string[];
  data_geracao:             string;
}

// ─── GERAÇÃO ─────────────────────────────────────────────────────────────────

export function gerarManifestoProducao(
  nomeCliente:       string,
  nicho:             string,
  paletaCores:       PaletaCores,
  estilo:            string,
  direcaoArte:       string,
  componentesIds:    string[],
  copyPorSecao:      Record<string, string>,
): ManifestoProducao {
  const componentes = BIBLIOTECA_COMPONENTES.filter((c) => componentesIds.includes(c.id));
  const estrutura   = componentes.map((c, i) => `${i + 1}. ${c.nome} (${c.id})`).join('\n');

  return {
    titulo:                   nomeCliente,
    nicho,
    paleta_cores:             paletaCores,
    estilo,
    direcao_arte:             direcaoArte,
    estrutura_pagina:         estrutura,
    componentes_selecionados: componentesIds,
    copy_por_secao:           copyPorSecao,
    notas_desenvolvimento: [
      `Landing page para ${nomeCliente} — Nicho: ${nicho}`,
      `Estilo: ${estilo}`,
      `Direção de arte: ${direcaoArte || 'não especificada'}`,
      'OBRIGATORIEDADE: Usar unidade REM em todos os espaçamentos',
      'OBRIGATORIEDADE: Proibido px em qualquer circunstância',
      'Usar apenas ícones SVG inline ou Lucide (vazados)',
      'Borders finas zinc-800 no tema escuro',
      'Suporte a Dark/Light theme obrigatório',
      'Mobile-first: breakpoints sm → md → lg',
    ],
    data_geracao: new Date().toISOString(),
  };
}

// ─── EXPORTAÇÃO MARKDOWN ─────────────────────────────────────────────────────

export function exportarManifestoMarkdown(m: ManifestoProducao): string {
  const data = new Date(m.data_geracao).toLocaleDateString('pt-BR');
  const copySections = Object.entries(m.copy_por_secao)
    .map(([secao, copy]) => `### ${secao}\n\`\`\`\n${copy}\n\`\`\``)
    .join('\n\n');

  return `# Manifesto de Produção: ${m.titulo}

**Data de Geração:** ${data}

---

## 📋 Contexto Estratégico

| Campo | Valor |
|---|---|
| Cliente | ${m.titulo} |
| Nicho | ${m.nicho} |
| Estilo Visual | ${m.estilo} |
| Direção de Arte | ${m.direcao_arte || '—'} |

---

## 🎨 Paleta de Cores

\`\`\`css
:root {
  --color-primary:   ${m.paleta_cores.primaria};
  --color-secondary: ${m.paleta_cores.secundaria};
${m.paleta_cores.backgrounds.map((bg, i) => `  --bg-${i + 1}: ${bg};`).join('\n')}
}
\`\`\`

---

## 📐 Estrutura da Landing Page

\`\`\`
${m.estrutura_pagina}
\`\`\`

---

## ✍️ Copy por Seção

${copySections || '_Nenhuma copy definida._'}

---

## 🔧 Notas de Desenvolvimento

${m.notas_desenvolvimento.map((n) => `- ${n}`).join('\n')}

---

## ✅ Checklist de QA

- [ ] Tema Dark/Light funcionando em todas as seções
- [ ] Todos os espaçamentos em REM (nenhum px)
- [ ] Ícones SVG/Lucide carregando corretamente
- [ ] Responsividade testada (mobile, tablet, desktop)
- [ ] Copy alinhada ao manifesto
- [ ] Performance Lighthouse 90+
- [ ] Acessibilidade WCAG AA
- [ ] Cross-browser (Chrome, Firefox, Safari, Edge)

---

*Gerado automaticamente pelo Adsgator Hub em ${data}*
`;
}

// ─── DOWNLOAD ────────────────────────────────────────────────────────────────

export function downloadManifestoMD(manifesto: ManifestoProducao): void {
  const conteudo = exportarManifestoMarkdown(manifesto);
  const blob     = new Blob([conteudo], { type: 'text/markdown' });
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement('a');
  a.href         = url;
  a.download     = `manifesto_${manifesto.titulo.replace(/\s+/g, '_').toLowerCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
```

### `lib\relatorio-generator.ts`

```typescript
import { supabase } from './supabase';
import type { DadosCampanhaAds, PalavraChavePerformance } from './google-ads';
import type { DadosGA4, PaginaPerformance, FonteTrafego } from './google-analytics';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface RelatorioMensalInput {
  cliente_id: string;
  mes_ano:    string;
  campanhas:  DadosCampanhaAds[];
  keywords:   PalavraChavePerformance[];
  ga4:        DadosGA4;
  paginas:    PaginaPerformance[];
  fontes:     FonteTrafego[];
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

export function gerarMarkdownRelatorio(
  nomeCliente:  string,
  mesAno:       string,
  campanhas:    DadosCampanhaAds[],
  keywords:     PalavraChavePerformance[],
  ga4:          DadosGA4,
  paginas:      PaginaPerformance[],
  fontes:       FonteTrafego[],
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
```

### `lib\supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error('[Adsgator] NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias.');
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Cliente server-side (Edge Functions / API Routes que precisam bypassar RLS)
export function criarClienteServiceRole() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('[Adsgator] SUPABASE_SERVICE_ROLE_KEY não definida.');
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
```

### `lib\types.ts`

```typescript
// ─── STATUS TYPES ─────────────────────────────────────────────────────────────

export type ClienteStatus =
  | 'recebido'
  | 'onboarding'
  | 'setup_trafego'
  | 'ativo'
  | 'congelado'
  | 'cancelado_debito'
  | 'cancelado'

export type AssinaturaStatus =
  | 'ativa'
  | 'atraso_7_dias'
  | 'atraso_15_dias'
  | 'cancelado_debito'

// ─── CHECKLIST ────────────────────────────────────────────────────────────────

export interface ChecklistItem {
  item: string
  done: boolean
}

// ─── CLIENTE ──────────────────────────────────────────────────────────────────

export interface Cliente {
  id:              string
  user_id:         string
  nome:            string
  email?:          string
  whatsapp?:       string
  nicho?:          string
  dominio?:        string
  status:          ClienteStatus
  mrr?:            number
  plano?:          string
  asaas_id?:       string
  dias_atraso:     number
  data_vencimento?: string
  google_ads_id?:  string
  google_ads_customer_id?: string | null
  ga4_property_id?:        string | null
  saldo_google?:   number
  congelado_em?:    string
  data_criacao?:    string
  data_atualizacao?: string
}

// ─── ESTAGIO ──────────────────────────────────────────────────────────────────

export interface Estagio {
  id:               string
  cliente_id:       string
  estagio:          string
  acao_proxima?:    string
  pendente_cliente?: boolean
  data_entrada?:    string
  data_saida?:      string | null
  created_at?:      string
  // campos extras usados pela UI (não persistidos no schema básico)
  nome?:            string
  descricao?:       string
  acao_label?:      string
  acao_url?:        string
  checklist?:       ChecklistItem[]
  ativo?:           boolean
  concluido_em?:    string
}

// ─── NOTIFICACAO ──────────────────────────────────────────────────────────────

export interface Notificacao {
  id:           string
  user_id:      string
  cliente_id?:  string
  tipo:         'urgente' | 'atencao' | 'info' | 'sucesso'
  titulo:       string
  mensagem?:    string
  acao_label?:  string
  acao_url?:    string
  lida:         boolean
  lida_em?:     string
  created_at:   string
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

export interface AnalyticsSnapshot {
  id:             string
  cliente_id:     string
  fonte:          'google_ads' | 'ga4'
  periodo_inicio: string
  periodo_fim:    string
  investimento?:  number
  impressoes?:    number
  cliques?:       number
  ctr?:           number
  conversoes?:    number  // aceita decimais: 0.5, 1.5 — CORRETO por data-driven
  cpa?:           number
  roas?:          number
  usuarios?:      number
  sessoes?:       number
  taxa_conversao?: number
  insight_ia?:    string
  created_at:     string
}

// ─── FINANCEIRO ───────────────────────────────────────────────────────────────

export interface FinanceiroLancamento {
  id:           string
  user_id:      string
  cliente_id?:  string
  tipo:         'receita' | 'custo_fixo' | 'custo_variavel'
  categoria?:   string
  descricao:    string
  valor:        number
  data:         string
  status:       'pendente' | 'confirmado' | 'cancelado'
  asaas_payment_id?: string
  created_at:   string
}

// ─── RELATORIO ────────────────────────────────────────────────────────────────

export interface Relatorio {
  id:          string
  user_id:     string
  cliente_id?: string
  tipo:        string
  titulo:      string
  conteudo_md: string
  created_at:  string
}

// ─── LEGACY TYPES (backward compat — páginas antigas) ─────────────────────────

export interface Assinatura {
  id:                     string
  cliente_id:             string
  plano_nome:             string
  valor_mensal:           number
  status:                 AssinaturaStatus
  data_inicio:            string
  data_proxima_cobranca:  string
  asaas_subscription_id:  string | null
  dias_atraso:            number
  created_at:             string
  updated_at:             string
}

export interface HistoricoAcao {
  id:              string
  cliente_id:      string
  tipo_acao:       string
  descricao:       string
  valor_impactado: number | null
  usuario_id:      string | null
  data_acao:       string
  metadata:        Record<string, unknown>
}

export interface CustoDetalhe {
  id:        string
  nome:      string
  valor:     number
  tipo:      'fixo' | 'variavel'
  descricao: string | null
  ativo:     boolean
}

export interface ConfigFinanceira {
  id:                             string
  agencia_id:                     string
  custos_fixos_mensais:           number
  custos_variaveis_percentual:    number
  margem_lucro_minima:            number
  saldo_google_ads_limite_alerta: number
}

export interface OnboardProgresso {
  cliente_id: string
  progresso:  Record<string, boolean>
  updated_at: string
}

export interface RelatorioMensal {
  id:               string
  cliente_id:       string
  mes_ano:          string
  mrr:              number | null
  investimento_ads: number | null
  conversoes:       number | null
  cpa:              number | null
  cliques:          number | null
  impressoes:       number | null
  ctr:              number | null
  sessoes_ga4:      number | null
  novos_usuarios:   number | null
  taxa_engajamento: number | null
  roi:              number | null
  markdown_content: string | null
  status_geracao:   'pendente' | 'processando' | 'completo' | 'erro'
  created_at:       string
}
```

### `lib\utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### `lib\vertex-ai.ts`

```typescript
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

const MODELO = 'gemini-1.5-pro';

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
    const model   = vertex.preview.getGenerativeModel({ model: MODELO });
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
    const model   = vertex.preview.getGenerativeModel({ model: MODELO });
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
```

### `lib\hooks\useClientes.ts`

```typescript
'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Cliente, Estagio } from '@/lib/types'

export type ClienteComEstagio = {
  cliente: Cliente
  estagio: Estagio | null
}

export function useClientes() {
  const [dados,   setDados]   = useState<ClienteComEstagio[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: clientes, error: errClientes } = await supabase
        .from('clientes')
        .select('*')
        .neq('status', 'cancelado')
        .order('data_criacao', { ascending: false })

      if (errClientes) throw new Error(errClientes.message)

      const lista = (clientes ?? []) as Cliente[]

      if (lista.length === 0) {
        setDados([])
        return
      }

      const ids = lista.map((c) => c.id)
      const { data: estagios } = await supabase
        .from('estagios_operacionais')
        .select('*')
        .in('cliente_id', ids)
        .is('data_saida', null)

      const estagiosPorCliente = new Map<string, Estagio>()
      for (const e of (estagios ?? []) as Estagio[]) {
        if (!estagiosPorCliente.has(e.cliente_id)) {
          estagiosPorCliente.set(e.cliente_id, e)
        }
      }

      const comEstagio: ClienteComEstagio[] = lista.map((c) => ({
        cliente: c,
        estagio: estagiosPorCliente.get(c.id) ?? null,
      }))

      setDados(comEstagio)
    } catch (err) {
      console.error('[useClientes]', err)
      setError('Erro ao carregar clientes.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── REALTIME SUBSCRIPTION ────────────────────────────────────────────
  useEffect(() => {
    carregar()

    const channel = supabase
      .channel('clientes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => carregar())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estagios_operacionais' }, () => carregar())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [carregar])

  // ── MÉTRICAS DERIVADAS ───────────────────────────────────────────────
  const metricas = {
    total:        dados.length,
    ativos:       dados.filter((d) => d.cliente.status === 'ativo').length,
    retidos:      dados.filter((d) => d.cliente.status === 'congelado').length,
    recebidos:    dados.filter((d) => d.cliente.status === 'recebido').length,
    onboarding:   dados.filter((d) => d.cliente.status === 'onboarding').length,
    inadimplentes: dados.filter((d) => (d.cliente.dias_atraso ?? 0) > 0).length,
    mrr:          dados.reduce((s, d) => s + (d.cliente.mrr ?? 0), 0),
    taxaRetencao: dados.length > 0
      ? Math.round((dados.filter((d) => d.cliente.status === 'ativo').length / dados.length) * 100)
      : 0,
  }

  return { dados, loading, error, metricas, recarregar: carregar }
}
```

### `lib\supabase\client.ts`

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true, autoRefreshToken: true } }
  )
}
```

### `providers\ThemeProvider.tsx`

```tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme:    Theme;
  setTheme: (t: Theme) => void;
  isDark:   boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme,  setThemeState] = useState<Theme>('dark');
  const [isDark, setIsDark]     = useState(true);

  useEffect(() => {
    const saved = (localStorage.getItem('adsgator-theme') as Theme) ?? 'dark';
    aplicarTema(saved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function aplicarTema(t: Theme) {
    setThemeState(t);
    localStorage.setItem('adsgator-theme', t);
    const prefersD = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const ativo = t === 'system' ? prefersD : t === 'dark';
    setIsDark(ativo);
    document.documentElement.classList.toggle('dark', ativo);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: aplicarTema, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme fora do ThemeProvider');
  return ctx;
}
```

