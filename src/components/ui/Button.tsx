import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  fullWidth?: boolean
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'bg-ads-500 hover:bg-ads-600 text-white font-medium',
  secondary: 'bg-surface-hover border border-surface-border/40 text-ink-secondary hover:text-ink-primary hover:bg-surface-elevated',
  ghost:     'bg-transparent hover:bg-surface-hover text-ink-secondary hover:text-ink-primary',
  danger:    'bg-status-red/10 text-status-red hover:bg-status-red/15 border border-status-red/20',
  subtle:    'bg-ads-500/10 text-ads-500 hover:bg-ads-500/15',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-[2rem] px-[0.75rem] text-[0.75rem] rounded-lg gap-[0.375rem]',
  md: 'h-[2.25rem] px-[1rem] text-[0.8125rem] rounded-lg gap-[0.375rem]',
  lg: 'h-[2.5rem] px-[1.25rem] text-[0.875rem] rounded-lg gap-[0.5rem]',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center shrink-0',
        'transition-all duration-150',
        'active:scale-[0.97]',
        'focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500/50',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="w-[0.875rem] h-[0.875rem] animate-spin shrink-0" />}
      {!loading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children}
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  )
}
