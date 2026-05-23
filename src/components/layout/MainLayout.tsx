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
    <div className="group/layout min-h-screen bg-surface-base">
      <Sidebar />

      {/* ── CONTEÚDO PRINCIPAL ──────────────────────── */}
      <div className="ml-[3.5rem] group-hover/layout:ml-[15rem] transition-all duration-300 ease-in-out">
        <TopBar title={title} subtitle={subtitle} actions={actions} />

        <main className="p-[2rem] overflow-y-auto">
          {children}
        </main>
      </div>
      <HelpChatButton />
    </div>
  )
}
