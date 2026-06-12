'use client'

import React from 'react'

// Renderizador de Markdown leve para as respostas da IA — sem dependências.
// Cobre o que o agente realmente produz: negrito, itálico, código inline,
// blocos de código, títulos, listas (ul/ol), links e parágrafos.

function renderInline(texto: string): React.ReactNode[] {
  const tokens = texto.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g)
  return tokens.map((t, i) => {
    if (!t) return null
    if (t.startsWith('**') && t.endsWith('**')) {
      return <strong key={i} className="font-semibold text-ink-primary">{t.slice(2, -2)}</strong>
    }
    if (t.startsWith('*') && t.endsWith('*') && t.length > 2) {
      return <em key={i}>{t.slice(1, -1)}</em>
    }
    if (t.startsWith('`') && t.endsWith('`')) {
      return (
        <code key={i} className="px-[0.25rem] py-[0.0625rem] rounded bg-surface-elevated text-ads-600 font-mono text-[0.875em]">
          {t.slice(1, -1)}
        </code>
      )
    }
    const link = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      return (
        <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-ads-600 underline underline-offset-2 hover:text-ads-500">
          {link[1]}
        </a>
      )
    }
    return <React.Fragment key={i}>{t}</React.Fragment>
  })
}

export function Markdown({ texto }: { texto: string }) {
  const blocos: React.ReactNode[] = []
  const segmentos = texto.split(/```(?:\w+)?\n?/)

  segmentos.forEach((seg, si) => {
    // Segmentos ímpares são conteúdo de blocos de código
    if (si % 2 === 1) {
      blocos.push(
        <pre key={`code-${si}`} className="my-[0.375rem] p-[0.625rem] rounded-lg bg-surface-elevated border border-surface-border/40 overflow-x-auto">
          <code className="font-mono text-[0.75rem] text-ink-primary whitespace-pre">{seg.replace(/\n$/, '')}</code>
        </pre>
      )
      return
    }

    const linhas = seg.split('\n')
    let lista: { tipo: 'ul' | 'ol'; itens: React.ReactNode[] } | null = null

    const fecharLista = (key: string) => {
      if (!lista) return
      const cls = 'my-[0.25rem] pl-[1.125rem] space-y-[0.125rem]'
      blocos.push(
        lista.tipo === 'ul'
          ? <ul key={key} className={`${cls} list-disc`}>{lista.itens}</ul>
          : <ol key={key} className={`${cls} list-decimal`}>{lista.itens}</ol>
      )
      lista = null
    }

    linhas.forEach((linha, li) => {
      const key = `${si}-${li}`
      const ul = linha.match(/^\s*[-*]\s+(.*)/)
      const ol = linha.match(/^\s*\d+[.)]\s+(.*)/)

      if (ul || ol) {
        const tipo = ul ? 'ul' : 'ol'
        if (lista && lista.tipo !== tipo) fecharLista(`l-${key}`)
        if (!lista) lista = { tipo, itens: [] }
        lista.itens.push(<li key={key}>{renderInline((ul ?? ol)![1])}</li>)
        return
      }
      fecharLista(`l-${key}`)

      const titulo = linha.match(/^(#{1,4})\s+(.*)/)
      if (titulo) {
        const nivel = titulo[1].length
        const cls = nivel <= 2 ? 'text-[0.9375rem]' : 'text-[0.875rem]'
        blocos.push(
          <p key={key} className={`${cls} font-semibold text-ink-primary mt-[0.5rem] mb-[0.25rem]`}>
            {renderInline(titulo[2])}
          </p>
        )
        return
      }

      if (linha.trim() === '') return
      blocos.push(<p key={key} className="my-[0.25rem]">{renderInline(linha)}</p>)
    })

    fecharLista(`l-${si}-fim`)
  })

  return <div className="leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{blocos}</div>
}
