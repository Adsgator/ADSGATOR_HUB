'use client'

// Gráfico de barra horizontal de UMA métrica só — usado em Demografia (4
// gráficos por dimensão, um por métrica, como no Looker) em vez de juntar
// várias métricas de escalas diferentes num gráfico só.

interface Linha { chave: string; label: string; valor: number }

export function MetricaBarraUnica({
  titulo, linhas, formatter, cor = '#FFB100',
}: {
  titulo:    string
  linhas:    Linha[]
  formatter: (v: number) => string
  cor?:      string
}) {
  const max = Math.max(1, ...linhas.map((l) => l.valor))
  return (
    <div>
      <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.5rem]">{titulo}</p>
      <div className="space-y-[0.375rem]">
        {linhas.map((l) => (
          <div key={l.chave} className="flex items-center gap-[0.5rem]">
            <span className="text-ink-secondary text-[0.6875rem] w-[3.5rem] shrink-0 truncate" title={l.label}>{l.label}</span>
            <div className="flex-1 h-[0.75rem] rounded bg-surface-hover overflow-hidden relative">
              <div className="h-full rounded" style={{ width: `${(l.valor / max) * 100}%`, backgroundColor: cor }} />
            </div>
            <span className="text-ink-primary text-[0.6875rem] font-medium w-[3rem] text-right shrink-0">{formatter(l.valor)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
