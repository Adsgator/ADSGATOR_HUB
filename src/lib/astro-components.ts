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
