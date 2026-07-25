// ─── Export CSV (helper puro) ────────────────────────────────────────────────
// Usado pelos botões "Baixar CSV" dos dashboards. Separador ';' + BOM UTF-8 pra
// o Excel pt-BR abrir com acentos e colunas certas (vírgula é decimal aqui).

const BOM = String.fromCharCode(0xfeff)

function escapar(v: string | number): string {
  const s = String(v ?? '')
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Monta o conteúdo CSV a partir de cabeçalhos + matriz de linhas. */
export function linhasParaCsv(cabecalhos: string[], linhas: Array<Array<string | number>>): string {
  const sep = ';'
  const corpo = [cabecalhos, ...linhas].map((linha) => linha.map(escapar).join(sep))
  return BOM + corpo.join('\r\n')
}
