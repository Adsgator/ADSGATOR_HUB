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
}

export const useRightSidebarStore = create<RightSidebarStore>((set) => ({
  contextActions: [],
  setContextActions: (actions) => set({ contextActions: actions }),
  clearContextActions: () => set({ contextActions: [] }),
}))
