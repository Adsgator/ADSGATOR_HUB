'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { ThemeToggle }      from '@/components/ui/ThemeToggle'
import { GlobalSearch }     from '@/components/ui/GlobalSearch'

interface TopBarProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  const [searchAberto, setSearchAberto] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchAberto(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header className="h-[3.5rem] border-b border-surface-border bg-surface-card/80 backdrop-blur-sm sticky top-0 z-30 flex items-center px-[2rem] gap-[1rem]">
        {/* ── TÍTULO ────────────────────────────────── */}
        <div className="flex-1">
          {title && (
            <div>
              <h1 className="text-ink-primary font-bold text-[1.125rem] leading-tight">{title}</h1>
              {subtitle && <p className="text-ink-muted text-[0.75rem]">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* ── AÇÕES CUSTOMIZADAS ─────────────────────── */}
        {actions && <div className="flex items-center gap-[0.5rem]">{actions}</div>}

        {/* ── SEARCH ────────────────────────────────── */}
        <button
          onClick={() => setSearchAberto(true)}
          className="flex items-center gap-[0.5rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-muted text-[0.8125rem] hover:border-ads-500/40 hover:text-ink-secondary transition-colors"
        >
          <Search className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          <span className="hidden sm:inline">Buscar...</span>
          <kbd className="hidden sm:inline-flex items-center px-[0.25rem] h-[1.125rem] rounded bg-surface-base border border-surface-border text-[0.625rem] text-ink-muted font-mono">
            ⌘K
          </kbd>
        </button>

        {/* ── THEME TOGGLE ──────────────────────────── */}
        <ThemeToggle />

        {/* ── NOTIFICAÇÕES ──────────────────────────── */}
        <NotificationBell />
      </header>

      {searchAberto && <GlobalSearch onClose={() => setSearchAberto(false)} />}
    </>
  )
}
