type Status = 'ativo' | 'inativo' | 'pendente' | 'critico' | 'sucesso' | 'processando'

interface StatusBadgePremiumProps {
  status: Status
  label: string
  size?: 'sm' | 'md'
}

const statusConfig: Record<Status, { bg: string; text: string; dot: string }> = {
  ativo: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  inativo: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', dot: 'bg-zinc-400' },
  pendente: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  critico: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400 animate-pulse' },
  sucesso: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400' },
  processando: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    dot: 'bg-blue-400 animate-bounce',
  },
}

export function StatusBadgePremium({
  status,
  label,
  size = 'md',
}: StatusBadgePremiumProps) {
  const config = statusConfig[status]
  const sizeClass = size === 'sm' ? 'px-[0.5rem] py-[0.25rem] text-[0.6875rem]' : 'px-[0.75rem] py-[0.375rem] text-[0.75rem]'

  return (
    <span
      className={`inline-flex items-center gap-[0.375rem] font-medium rounded-full ${config.bg} ${config.text} ${sizeClass}`}
    >
      <span className={`w-[0.375rem] h-[0.375rem] rounded-full ${config.dot}`} />
      {label}
    </span>
  )
}
