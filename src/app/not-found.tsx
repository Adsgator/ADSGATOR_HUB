import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-[2rem]">
      <div className="text-center animate-fade-up max-w-[28rem]">
        {/* Número 404 */}
        <div className="relative mb-[2rem]">
          <p className="text-[8rem] font-black text-surface-border leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[4rem] h-[4rem] rounded-2xl bg-ads-500/10 border border-ads-500/20 flex items-center justify-center glow-amber">
              <span className="text-[2rem]">🔍</span>
            </div>
          </div>
        </div>

        <h1 className="text-ink-primary text-[1.5rem] font-bold mb-[0.5rem]">Página não encontrada</h1>
        <p className="text-ink-secondary text-[0.9375rem] mb-[2rem] leading-relaxed">
          A página que você está procurando não existe ou foi movida.
        </p>

        <div className="flex items-center justify-center gap-[0.75rem]">
          <Link
            href="/dashboard"
            className="inline-flex items-center h-[2.5rem] px-[1.25rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white text-[0.875rem] font-medium transition-colors"
          >
            Ir para o Dashboard
          </Link>
          <Link
            href="/clientes"
            className="inline-flex items-center h-[2.5rem] px-[1.25rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-secondary hover:text-ink-primary text-[0.875rem] font-medium transition-colors"
          >
            Ver Clientes
          </Link>
        </div>
      </div>
    </div>
  )
}
