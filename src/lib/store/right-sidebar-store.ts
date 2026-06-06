import { create } from 'zustand'
import type { LucideIcon } from 'lucide-react'
import type React from 'react'

export interface RightSidebarAction {
  id: string
  icon: LucideIcon
  label: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

interface RightSidebarStore {
  contextActions: RightSidebarAction[]
  setContextActions: (actions: RightSidebarAction[]) => void
  clearContextActions: () => void
  activeDrawer: string | null
  openDrawer: (id: string) => void
  closeDrawer: () => void
}

export const useRightSidebarStore = create<RightSidebarStore>((set) => ({
  contextActions: [],
  setContextActions: (actions) => set({ contextActions: actions }),
  clearContextActions: () => set({ contextActions: [] }),
  activeDrawer: null,
  openDrawer: (id) => set((s) => ({ activeDrawer: s.activeDrawer === id ? null : id })),
  closeDrawer: () => set({ activeDrawer: null }),
}))
