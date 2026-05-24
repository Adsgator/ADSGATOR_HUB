'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Search, AlertCircle, Sun, Cloud, Moon } from 'lucide-react'
import { GlobalSearch }     from '@/components/ui/GlobalSearch'
import { useTheme } from '@/providers/ThemeProvider'
import { supabase } from '@/lib/supabase'

interface TopBarProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

interface Saudacao {
  texto: string
  icon: React.ReactElement
}

function getSaudacao(nome?: string): Saudacao {
  const hora = new Date().getHours()
  const base = nome ? `, ${nome}` : ''
  if (hora < 12) return { texto: `Bom dia${base}`, icon: <Sun  className="w-[0.875rem] h-[0.875rem] text-ads-400 shrink-0" strokeWidth={1.75} /> }
  if (hora < 18) return { texto: `Boa tarde${base}`, icon: <Cloud className="w-[0.875rem] h-[0.875rem] text-ads-400 shrink-0" strokeWidth={1.75} /> }
  return         { texto: `Boa noite${base}`,  icon: <Moon  className="w-[0.875rem] h-[0.875rem] text-ads-400 shrink-0" strokeWidth={1.75} /> }
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  const { isDark } = useTheme()
  const [searchAberto, setSearchAberto] = useState(false)
  const [alertasCount, setAlertasCount] = useState(0)
  const [userName, setUserName] = useState<string>()

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

  useEffect(() => {
    const fetchAlertas = async () => {
      const { count } = await supabase
        .from('clientes')
        .select('id', { count: 'exact', head: true })
        .gt('dias_atraso', 0)
      setAlertasCount(count ?? 0)
    }
    fetchAlertas()

    const channel = supabase
      .channel('alertas-topbar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, fetchAlertas)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const nome = data.user?.user_metadata?.nome ?? data.user?.email?.split('@')[0]
      setUserName(nome)
    })
  }, [])

  const isDashboard = title === 'Dashboard'
  const saudacao = isDashboard ? getSaudacao(userName) : null
  const displayTitle = isDashboard ? saudacao?.texto : title

  return (
    <>
      <header className="topbar-shell h-[var(--topbar-h)] border-b border-surface-border bg-surface-card/80 backdrop-blur-sm z-50 flex items-center px-[1.25rem] gap-[1rem]">
        {/* ── LOGO ─────────────────────────────────── */}
        <Image
          src={isDark ? '/logo/logo-dark.svg' : '/logo/logo-light.svg'}
          alt="Adsgator"
          width={120}
          height={28}
          className="shrink-0 h-[1.5rem] w-auto"
          priority
        />

        {/* ── DIVISÓRIA ────────────────────────────── */}
        <div className="w-[1px] h-[1.5rem] bg-surface-border shrink-0" />

        {/* ── TÍTULO ────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {displayTitle && (
            <div>
              <h1 className="text-ink-primary font-semibold text-[0.9375rem] leading-tight truncate flex items-center gap-[0.375rem]">
              {saudacao && saudacao.icon}
              {displayTitle}
            </h1>
              {subtitle && <p className="text-ink-muted text-[0.75rem] truncate">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* ── ALERTAS CRÍTICOS ─────────────────────── */}
        {alertasCount > 0 && (
          <div className="flex items-center gap-[0.5rem] px-[0.625rem] py-[0.25rem] rounded-full bg-status-red/10 border border-status-red/20 shrink-0">
            <AlertCircle className="w-[0.875rem] h-[0.875rem] text-status-red" strokeWidth={2} />
            <span className="text-[0.75rem] font-medium text-status-red">{alertasCount} inadimplente{alertasCount > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* ── AÇÕES CUSTOMIZADAS ─────────────────────── */}
        {actions && <div className="flex items-center gap-[0.5rem] shrink-0">{actions}</div>}

        {/* ── SEARCH ────────────────────────────────── */}
        <button
          onClick={() => setSearchAberto(true)}
          className="flex items-center gap-[0.5rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-muted text-[0.8125rem] hover:border-ads-500/40 hover:text-ink-secondary transition-colors shrink-0"
        >
          <Search className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
          <span className="hidden sm:inline">Buscar...</span>
          <kbd className="hidden sm:inline-flex items-center px-[0.25rem] h-[1.125rem] rounded bg-surface-base border border-surface-border text-[0.625rem] text-ink-muted font-mono">
            ⌘K
          </kbd>
        </button>
      </header>

      {searchAberto && <GlobalSearch onClose={() => setSearchAberto(false)} />}
    </>
  )
}
