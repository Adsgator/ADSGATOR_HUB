'use client'

import React from 'react'
import { Sidebar }         from './Sidebar'
import { TopBar }          from './TopBar'
import { RightSidebar }    from './RightSidebar'
import { StatusBar }       from './StatusBar'
import { RightSidebarProvider } from '@/lib/store/right-sidebar-context'

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function MainLayout({ children, title, subtitle, actions }: MainLayoutProps) {
  return (
    <RightSidebarProvider>
      <div className="h-screen w-screen overflow-hidden bg-surface-base grid grid-rows-[var(--topbar-h)_1fr_var(--statusbar-h)] grid-cols-[var(--sidebar-w)_1fr_var(--right-sidebar-w)]">
        {/* ── ROW 1: TOP BAR (ocupa 3 colunas) ──────── */}
        <div className="col-span-3 z-50">
          <TopBar title={title} subtitle={subtitle} actions={actions} />
        </div>

        {/* ── ROW 2 COL 1: SIDEBAR ESQUERDA ──────────── */}
        <Sidebar />

        {/* ── ROW 2 COL 2: ÁREA DE CONTEÚDO ──────────── */}
        <main className="overflow-y-auto overflow-x-hidden p-[2rem]">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>

        {/* ── ROW 2 COL 3: SIDEBAR DIREITA ───────────── */}
        <RightSidebar />

        {/* ── ROW 3: STATUS BAR (ocupa 3 colunas) ──── */}
        <StatusBar />
      </div>
    </RightSidebarProvider>
  )
}
