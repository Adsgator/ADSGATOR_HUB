import React from 'react'

type CardVariant = 'default' | 'interactive' | 'highlight' | 'minimal'
type CardSize = 'sm' | 'md' | 'lg'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  size?: CardSize
  hover?: boolean
  loading?: boolean
}

export function Card({
  variant = 'default',
  size = 'md',
  hover = false,
  loading = false,
  children,
  className = '',
  ...props
}: CardProps) {
  // Padding por tamanho
  const padding = {
    sm: 'p-[1rem]',
    md: 'p-[1.5rem]',
    lg: 'p-[2rem]',
  }[size]

  // Base comum
  const base = `${padding} rounded-xl transition-all duration-150 border`

  // Variações
  const variants = {
    default: `${base} bg-surface-card border-surface-border ${
      hover ? 'hover:border-surface-border/50 hover:shadow-sm' : ''
    }`,
    interactive: `${base} bg-surface-card border-surface-border cursor-pointer
      hover:border-ads-500/30 hover:shadow-[0_0_0_1px_rgba(255,165,0,0.1)]`,
    highlight: `${base} bg-surface-card border-ads-500/40
      ring-1 ring-ads-500/10 shadow-[0_0_16px_rgba(255,165,0,0.06)]`,
    minimal: `${base} bg-transparent border-surface-border/40
      hover:border-surface-border hover:bg-surface-hover`,
  }

  if (loading) {
    return (
      <div className={variants[variant]}>
        <div className="space-y-[0.75rem]">
          <div className="h-[1rem] w-[60%] bg-surface-hover rounded animate-pulse" />
          <div className="h-[1rem] w-[80%] bg-surface-hover rounded animate-pulse" />
          <div className="h-[1rem] w-[40%] bg-surface-hover rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}
