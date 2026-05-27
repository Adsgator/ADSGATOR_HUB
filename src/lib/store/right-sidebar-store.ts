import { create } from 'zustand'
import type { LucideIcon } from 'lucide-react'

export interface RightSidebarAction {
  id: string
  icon: LucideIcon
  label: string
  onClick: () => void
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
