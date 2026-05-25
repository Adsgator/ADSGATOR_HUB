'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Sparkles, ChevronDown } from 'lucide-react'
import { CHANGELOG, VERSAO_ATUAL } from '@/data/changelog'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'adsgator_changelog_visto'

function getVersaoVista(): string | null {
  if (typeof window === 'undefined') return VERSAO_ATUAL
  try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
}

function marcarVisto() {
  try { localStorage.setItem(STORAGE_KEY, VERSAO_ATUAL) } catch {}
}

export function useChangelogBadge(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(STORAGE_KEY) !== VERSAO_ATUAL
  } catch {
    return false
  }
}

export function ChangelogButton() {
  const ref                   = useRef<HTMLDivElement>(null)
  const [aberto, setAberto]   = useState(false)
  const [temNovo, setTemNovo] = useState(false)
  const [expandido, setExpandido] = useState<string | null>(CHANGELOG[0].versao)

  useEffect(() => {
    setTemNovo(getVersaoVista() !== VERSAO_ATUAL)
  }, [])

  useEffect(() => {
    if (!aberto) return
    marcarVisto()
    setTemNovo(false)

    function onClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('mousedown', onClickFora)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickFora)
      document.removeEventListener('keydown', onKey)
    }
  }, [aberto])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        className="relative flex items-center gap-[0.375rem] h-[2rem] px-[0.625rem] rounded-[0.375rem] text-ink-secondary hover:bg-surface-hover hover:text-ink-primary transition-colors text-[0.75rem] font-medium"
        aria-label="O que há de novo"
      >
        <Sparkles className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        <span className="hidden sm:inline">Novidades</span>
        {temNovo && (
          <span className="absolute top-[0.1875rem] right-[0.1875rem] w-[0.4375rem] h-[0.4375rem] rounded-full bg-ads-500" />
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-[2.5rem] w-[22rem] bg-surface-card border border-surface-border rounded-2xl card-shadow shadow-2xl shadow-black/40 z-50 animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-[1.125rem] py-[0.875rem] border-b border-surface-border">
            <div className="flex items-center gap-[0.5rem]">
              <Sparkles className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={1.75} />
              <p className="text-ink-primary font-semibold text-[0.875rem]">O que há de novo</p>
              <span className="text-[0.625rem] font-bold px-[0.375rem] py-[0.0625rem] rounded-full bg-ads-500/15 text-ads-500 border border-ads-500/20">
                v{VERSAO_ATUAL}
              </span>
            </div>
            <button
              onClick={() => setAberto(false)}
              className="w-[1.5rem] h-[1.5rem] rounded-md flex items-center justify-center text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            </button>
          </div>

          {/* Lista de versões */}
          <div className="max-h-[28rem] overflow-y-auto">
            {CHANGELOG.map((entry, idx) => {
              const isAberto  = expandido === entry.versao
              const isLatest  = idx === 0
              const dataFmt   = new Date(entry.data + 'T12:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'long', year: 'numeric',
              })

              return (
                <div key={entry.versao} className={cn('border-b border-surface-border/50 last:border-0', isLatest && 'bg-ads-500/5')}>
                  <button
                    onClick={() => setExpandido(isAberto ? null : entry.versao)}
                    className="w-full flex items-center justify-between px-[1.125rem] py-[0.75rem] hover:bg-surface-hover transition-colors text-left"
                  >
                    <div className="flex items-center gap-[0.5rem]">
                      <span className={cn(
                        'text-[0.75rem] font-bold px-[0.375rem] py-[0.125rem] rounded-md',
                        isLatest
                          ? 'bg-ads-500 text-white'
                          : 'bg-surface-elevated text-ink-secondary border border-surface-border',
                      )}>
                        v{entry.versao}
                      </span>
                      <span className="text-ink-muted text-[0.75rem]">{dataFmt}</span>
                      {isLatest && (
                        <span className="text-[0.5625rem] font-semibold px-[0.25rem] py-[0.0625rem] rounded-full bg-status-green/15 text-status-green border border-status-green/20">
                          ATUAL
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={cn('w-[0.875rem] h-[0.875rem] text-ink-muted transition-transform', isAberto && 'rotate-180')}
                      strokeWidth={2}
                    />
                  </button>

                  {isAberto && (
                    <ul className="px-[1.125rem] pb-[0.875rem] flex flex-col gap-[0.375rem]">
                      {entry.novidades.map((item, i) => (
                        <li key={i} className="flex items-start gap-[0.5rem]">
                          <span className="w-[0.3125rem] h-[0.3125rem] rounded-full bg-ads-500 shrink-0 mt-[0.4375rem]" />
                          <span className="text-ink-secondary text-[0.8125rem] leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
