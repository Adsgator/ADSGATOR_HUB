'use client'

interface EventoGA4 {
  evento: string
  contagem: number
  usuarios: number
}

interface GA4EventsTableProps {
  data: EventoGA4[]
  loading?: boolean
}

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Visualização de Página',
  click: 'Clique',
  scroll: 'Scroll',
  first_visit: 'Primeira Visita',
  session_start: 'Início de Sessão',
  user_engagement: 'Engajamento',
  purchase: 'Compra',
  form_submit: 'Envio de Formulário',
}

export function GA4EventsTable({ data, loading }: GA4EventsTableProps) {
  if (loading) return <div className="h-[8rem] rounded-xl bg-surface-hover animate-pulse" />

  const maxCount = Math.max(...data.map(d => d.contagem), 1)

  return (
    <div className="flex flex-col gap-[0.25rem]">
      {data.slice(0, 15).map((row, i) => {
        const pct = (row.contagem / maxCount) * 100
        return (
          <div key={i} className="flex items-center gap-[0.5rem]">
            <span className="text-[0.75rem] text-ink-secondary w-[10rem] flex-shrink-0 truncate" title={row.evento}>
              {EVENT_LABELS[row.evento] ?? row.evento}
            </span>
            <div className="flex-1 h-[0.375rem] bg-surface-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-ads-500/60 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[0.75rem] text-ink-primary font-semibold w-[4rem] text-right flex-shrink-0">
              {row.contagem.toLocaleString('pt-BR')}
            </span>
          </div>
        )
      })}
    </div>
  )
}
