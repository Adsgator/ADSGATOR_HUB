'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error:  Error & { digest?: string }
  reset:  () => void
}) {
  useEffect(() => {
    console.error('[Error boundary]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-[2rem]">
      <div className="text-center animate-fade-up max-w-[28rem]">
        {/* Ícone */}
        <div className="flex justify-center mb-[1.5rem]">
          <div className="w-[5rem] h-[5rem] rounded-2xl bg-status-red/10 border border-status-red/20 flex items-center justify-center">
            <span className="text-[2.5rem]">⚠️</span>
          </div>
        </div>

        <h1 className="text-ink-primary text-[1.5rem] font-bold mb-[0.5rem]">Algo deu errado</h1>
        <p className="text-ink-secondary text-[0.9375rem] mb-[0.75rem] leading-relaxed">
          Ocorreu um erro inesperado. Tente novamente ou volte ao início.
        </p>

        {error.message && (
          <p className="text-ink-muted text-[0.75rem] font-mono bg-surface-hover border border-surface-border/30 rounded-lg px-[0.75rem] py-[0.5rem] mb-[2rem] break-all">
            {error.message}
          </p>
        )}

        <div className="flex items-center justify-center gap-[0.75rem]">
          <button
            onClick={reset}
            className="inline-flex items-center h-[2.5rem] px-[1.25rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white text-[0.875rem] font-medium transition-colors"
          >
            Tentar novamente
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center h-[2.5rem] px-[1.25rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-secondary hover:text-ink-primary text-[0.875rem] font-medium transition-colors"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  )
}
