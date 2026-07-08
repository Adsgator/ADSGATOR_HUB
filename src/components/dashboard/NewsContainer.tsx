'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, BarChart3 } from 'lucide-react'
import { NewsClienteCard } from './NewsClienteCard'
import { EmptyStateConfig } from './EmptyStateConfig'
import { cn } from '@/lib/utils'
import type { NewsCardData } from '@/lib/types/news'

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[17rem] bg-surface-card border border-surface-border rounded-xl p-[0.875rem] scroll-snap-align-start">
      <div className="flex items-center gap-[0.5rem] mb-[0.625rem]">
        <div className="w-[0.5rem] h-[0.5rem] rounded-full bg-surface-hover skeleton-shimmer" />
        <div className="h-[0.875rem] w-[7rem] rounded bg-surface-hover skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-3 gap-[0.25rem] mb-[0.5rem]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-[0.125rem]">
            <div className="h-[0.5rem] w-[2rem] rounded bg-surface-hover skeleton-shimmer" />
            <div className="h-[0.75rem] w-[3rem] rounded bg-surface-hover skeleton-shimmer" />
          </div>
        ))}
      </div>
      <div className="pt-[0.5rem] border-t border-surface-border">
        <div className="h-[0.25rem] w-full rounded-full bg-surface-hover skeleton-shimmer" />
      </div>
    </div>
  )
}

export function NewsContainer() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [cards, setCards] = useState<NewsCardData[]>([])
  const [loading, setLoading] = useState(true)
  // 'conectados' (default) = só quem tem integração ligada; 'todos' inclui
  // os não conectados como CTA de conexão.
  const [filtro, setFiltro] = useState<'conectados' | 'todos'>('conectados')
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/news?filtro=${filtro}`)
      if (!res.ok) {
        setLoading(false)
        return
      }
      const json = await res.json()
      setCards(json.data ?? [])
    } catch (err) {
      console.error('NewsContainer fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [filtro])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
  }, [updateScrollState, cards])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = 17 * 16 + 12 // card width + gap
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  // Vazio = nenhum cliente conectado ainda: explica em vez de sumir
  if (!loading && cards.length === 0) {
    return (
      <div className="mb-[1rem] bg-surface-card border border-surface-border rounded-xl card-shadow animate-fade-up">
        <EmptyStateConfig
          icon={BarChart3}
          titulo="Monitoramento sem clientes conectados"
          motivo="Nenhum cliente com Google Ads ou GA4 ligado — preencha os IDs na página do cliente, ligue os toggles e valide com o botão Testar conexão."
          compacto
        />
      </div>
    )
  }

  return (
    <div className="relative mb-[1rem] animate-fade-up">
      {/* Left fade + button */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-[3rem] z-10 pointer-events-none
          bg-gradient-to-r from-[var(--color-surface-base)] to-transparent" />
      )}
      <button
        onClick={() => scroll('left')}
        className={cn(
          'absolute left-[0.5rem] top-1/2 -translate-y-1/2 z-20',
          'w-[1.75rem] h-[1.75rem] rounded-full bg-surface-elevated border border-surface-border',
          'flex items-center justify-center text-ink-muted hover:text-ink-primary hover:border-ads-500/40',
          'transition-all shadow-sm active:scale-95',
          !canScrollLeft && 'opacity-0 pointer-events-none'
        )}
      >
        <ChevronLeft className="w-[0.875rem] h-[0.875rem]" />
      </button>

      {/* Scrollable area */}
      <div
        ref={scrollRef}
        className="flex gap-[0.75rem] overflow-x-auto pb-[0.25rem]"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`.news-scroll::-webkit-scrollbar { display: none; }`}</style>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map(c => <NewsClienteCard key={`${c.cliente_id}-${c.tipo}`} cliente={c} />)
        }
      </div>

      {/* Right fade + button */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-[3rem] z-10 pointer-events-none
          bg-gradient-to-l from-[var(--color-surface-base)] to-transparent" />
      )}
      <button
        onClick={() => scroll('right')}
        className={cn(
          'absolute right-[0.5rem] top-1/2 -translate-y-1/2 z-20',
          'w-[1.75rem] h-[1.75rem] rounded-full bg-surface-elevated border border-surface-border',
          'flex items-center justify-center text-ink-muted hover:text-ink-primary hover:border-ads-500/40',
          'transition-all shadow-sm active:scale-95',
          !canScrollRight && 'opacity-0 pointer-events-none'
        )}
      >
        <ChevronRight className="w-[0.875rem] h-[0.875rem]" />
      </button>

      {/* Filtro + refresh — top right */}
      <div className="absolute -top-[1.75rem] right-0 flex items-center gap-[0.75rem]">
        <div className="flex items-center gap-[0.125rem] text-[0.625rem]">
          {(['conectados', 'todos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={cn(
                'px-[0.5rem] py-[0.125rem] rounded-full transition-colors',
                filtro === f
                  ? 'bg-ads-500/15 text-ads-500 font-semibold'
                  : 'text-ink-muted hover:text-ink-primary'
              )}
            >
              {f === 'conectados' ? 'Conectados' : 'Todos'}
            </button>
          ))}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-[0.25rem] text-[0.625rem] text-ink-muted hover:text-ink-primary transition-colors"
        >
          <RefreshCw className={cn('w-[0.625rem] h-[0.625rem]', loading && 'animate-spin')} />
          Monitoramento
        </button>
      </div>
    </div>
  )
}
