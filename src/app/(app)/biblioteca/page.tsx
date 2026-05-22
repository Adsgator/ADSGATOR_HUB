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
