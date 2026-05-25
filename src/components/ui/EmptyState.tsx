import React from 'react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-[3rem] px-[2rem] text-center animate-fade-up">
      {/* Ícone em background sutil */}
      <div className="w-[3rem] h-[3rem] rounded-[0.75rem] bg-surface-hover flex items-center justify-center mb-[1rem]">
        {icon}
      </div>

      {/* Texto */}
      <h3 className="text-[0.9375rem] font-medium text-ink-primary mb-[0.375rem]">{title}</h3>
      <p className="text-[0.8125rem] text-ink-muted max-w-[24rem] mb-[1.5rem]">{description}</p>

      {/* CTA opcional */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-[1rem] py-[0.5rem] rounded-lg bg-ads-500/10 text-ads-500
            text-[0.8125rem] font-medium hover:bg-ads-500/15 transition-colors duration-150"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
