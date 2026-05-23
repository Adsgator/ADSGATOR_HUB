'use client'

import React from 'react'
import { Sidebar }         from './Sidebar'
import { TopBar }          from './TopBar'
import { HelpChatButton } from '@/components/ui/HelpChatButton'

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function MainLayout({ children, title, subtitle, actions }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-base [&:has(aside:hover)_.main-content]:ml-[15rem]">
      <Sidebar />

      {/* ── CONTEÚDO PRINCIPAL ──────────────────────── */}
      <div className="main-content ml-[3.5rem] transition-all duration-300 ease-in-out">
        <TopBar title={title} subtitle={subtitle} actions={actions} />

        <main className="p-[2rem] overflow-y-auto">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <HelpChatButton />
    </div>
  )
}
