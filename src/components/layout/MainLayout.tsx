'use client'

import React, { useEffect, useState } from 'react'
import { useRouter }        from 'next/navigation'
import { Sidebar }              from './Sidebar'
import { TopBar }               from './TopBar'
import { RightSidebar }         from './RightSidebar'
import { StatusBar }            from './StatusBar'
import { FloatingChat }         from './FloatingChat'
import { RightSidebarProvider } from '@/lib/store/right-sidebar-context'
import { ShortcutsOverlay }     from '@/components/ui/ShortcutsOverlay'
import { ConfirmDialog }        from '@/components/ui/ConfirmDialog'

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function MainLayout({ children, title, subtitle, actions }: MainLayoutProps) {
  const router = useRouter()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  useEffect(() => {
    let primeiraLetra: string | null = null
    let timer: ReturnType<typeof setTimeout> | null = null

    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (['input', 'textarea', 'select'].includes(tag)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const k = e.key.toLowerCase()

      if (primeiraLetra === null) {
        if (k === 'g' || k === 'n') {
          primeiraLetra = k
          timer = setTimeout(() => { primeiraLetra = null }, 500)
        }
        return
      }

      if (timer) clearTimeout(timer)
      const first = primeiraLetra
      primeiraLetra = null

      const ROTAS_G: Record<string, string> = {
        d: '/dashboard',
        c: '/clientes',
        f: '/financeiro',
        a: '/analytics',
        t: '/tarefas',
        m: '/marketing',
        b: '/biblioteca',
        s: '/configuracoes',
      }

      if (first === 'g' && ROTAS_G[k]) {
        router.push(ROTAS_G[k])
      } else if (first === 'n' && k === 'c') {
        router.push('/clientes/novo')
      }
    }

    function onShortcut(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (['input', 'textarea', 'select'].includes(tag)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === '?') setShortcutsOpen((v) => !v)
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('keydown', onShortcut)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('keydown', onShortcut)
    }
  }, [router])

  return (
    <RightSidebarProvider>
      <div className="h-screen w-screen overflow-hidden bg-surface-base grid grid-rows-[var(--topbar-h)_1fr_var(--statusbar-h)] md:grid-cols-[var(--sidebar-w)_1fr_var(--right-sidebar-w)] grid-cols-1">
        {/* ── ROW 1: TOP BAR (ocupa todas as colunas) ──────── */}
        <div className="md:col-span-3 col-span-1 z-50">
          <TopBar title={title} subtitle={subtitle} actions={actions} />
        </div>

        {/* ── ROW 2 COL 1: SIDEBAR ESQUERDA (desktop only) ──────────── */}
        <Sidebar />

        {/* ── ROW 2 COL 2: ÁREA DE CONTEÚDO ──────────── */}
        <main className="overflow-y-auto overflow-x-hidden p-[1rem] md:p-[2rem]">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>

        {/* ── ROW 2 COL 3: SIDEBAR DIREITA (desktop only) ───────────── */}
        <RightSidebar />

        {/* ── ROW 3: STATUS BAR (ocupa todas as colunas) ──── */}
        <StatusBar />
      </div>

      {/* ── CHAT FLUTUANTE (todas as páginas) ────── */}
      <FloatingChat />

      {/* ── ATALHOS DE TECLADO ───────────────────── */}
      {shortcutsOpen && <ShortcutsOverlay onClose={() => setShortcutsOpen(false)} />}

      {/* ── CONFIRMAÇÃO CUSTOMIZADA ────────────── */}
      <ConfirmDialog />
    </RightSidebarProvider>
  )
}
