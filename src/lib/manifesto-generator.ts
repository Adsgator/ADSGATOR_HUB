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
