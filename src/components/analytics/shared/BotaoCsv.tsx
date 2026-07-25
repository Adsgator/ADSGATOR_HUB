'use client'

import { Download } from 'lucide-react'
import { linhasParaCsv } from '@/lib/csv'

// Botão discreto "Baixar CSV" no cabeçalho da tabela — o Lucas usa pra analisar
// e mandar pro cliente. Cada tabela passa suas colunas (label + valor
// formatado, o mesmo que aparece na tela) e as linhas visíveis.

export interface ColunaCsv<T> {
  label: string
  valor: (l: T) => string | number
}

interface BotaoCsvProps<T> {
  nome:    string          // nome do arquivo (sem .csv)
  colunas: ColunaCsv<T>[]
  linhas:  T[]
}

export function BotaoCsv<T>({ nome, colunas, linhas }: BotaoCsvProps<T>) {
  const baixar = () => {
    if (linhas.length === 0) return
    const conteudo = linhasParaCsv(
      colunas.map((c) => c.label),
      linhas.map((l) => colunas.map((c) => c.valor(l))),
    )
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${nome}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={baixar}
      disabled={linhas.length === 0}
      title="Baixar CSV"
      className="inline-flex items-center gap-[0.3125rem] h-[1.75rem] px-[0.5rem] rounded-lg text-[0.6875rem] font-medium text-ink-muted hover:text-ink-primary hover:bg-surface-hover border border-surface-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
    >
      <Download className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
      CSV
    </button>
  )
}
