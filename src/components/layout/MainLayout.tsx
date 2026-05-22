'use client'

import React from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function MainLayout({ children, title, subtitle, actions }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-base">
      <Sidebar />

      {/* ── CONTEÚDO PRINCIPAL ──────────────────────── */}
      <div className="ml-sidebar">
        <TopBar title={title} subtitle={subtitle} actions={actions} />

        <main className="p-[2rem]">
          {children}
        </main>
      </div>
    </div>
  )
}
