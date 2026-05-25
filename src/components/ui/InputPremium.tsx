'use client'

import React from 'react'

interface InputPremiumProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  icon?: React.ReactNode
  error?: string
}

export function InputPremium({
  label,
  hint,
  icon,
  error,
  className = '',
  ...props
}: InputPremiumProps) {
  return (
    <div className="space-y-[0.375rem]">
      {label && (
        <label className="block text-[0.875rem] font-medium text-ink-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-[1rem] top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-[1rem] py-[0.75rem] ${icon ? 'pl-[2.75rem]' : ''}
            rounded-lg bg-surface-card border border-surface-border/40 text-ink-primary
            placeholder:text-ink-muted text-[0.875rem]
            transition-all duration-150
            focus:outline-none focus:border-ads-500/50 focus:ring-2 focus:ring-ads-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-status-red/50 focus:ring-status-red/20' : ''}
            ${className}`}
          {...props}
        />
      </div>
      {hint && <p className="text-[0.75rem] text-ink-muted">{hint}</p>}
      {error && <p className="text-[0.75rem] text-status-red">{error}</p>}
    </div>
  )
}
