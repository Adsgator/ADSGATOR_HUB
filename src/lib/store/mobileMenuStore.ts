import { create } from 'zustand'

interface MobileMenuStore {
  open: boolean
  toggle: () => void
  close: () => void
}

export const useMobileMenuStore = create<MobileMenuStore>((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  close: () => set({ open: false }),
}))
