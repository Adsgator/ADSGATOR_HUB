'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface RightSidebarAction {
  id: string
  icon: LucideIcon
  label: string
  onClick: () => void
}

interface RightSidebarContextValue {
  contextActions: RightSidebarAction[]
  setContextActions: (actions: RightSidebarAction[]) => void
  clearContextActions: () => void
  activeDrawer: string | null
  openDrawer: (id: string) => void
  closeDrawer: () => void
}

const RightSidebarContext = createContext<RightSidebarContextValue | null>(null)

export function RightSidebarProvider({ children }: { children: ReactNode }) {
  const [contextActions, setContextActionsState] = useState<RightSidebarAction[]>([])
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null)

  const setContextActions = useCallback((actions: RightSidebarAction[]) => {
    setContextActionsState(actions)
  }, [])

  const clearContextActions = useCallback(() => {
    setContextActionsState([])
  }, [])

  const openDrawer = useCallback((id: string) => {
    setActiveDrawer((prev) => (prev === id ? null : id))
  }, [])

  const closeDrawer = useCallback(() => {
    setActiveDrawer(null)
  }, [])

  return (
    <RightSidebarContext.Provider
      value={{ contextActions, setContextActions, clearContextActions, activeDrawer, openDrawer, closeDrawer }}
    >
      {children}
    </RightSidebarContext.Provider>
  )
}

export function useRightSidebar() {
  const ctx = useContext(RightSidebarContext)
  if (!ctx) throw new Error('useRightSidebar must be used within RightSidebarProvider')
  return ctx
}
