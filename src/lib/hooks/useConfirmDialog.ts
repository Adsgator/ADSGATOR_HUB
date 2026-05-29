import { create } from 'zustand'

interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  onConfirm: (() => void) | null
  onCancel: (() => void) | null
  openConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void
  closeConfirm: () => void
  confirm: () => void
  cancel: () => void
}

export const useConfirmDialogStore = create<ConfirmDialogState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: null,
  onCancel: null,
  openConfirm: (title, message, onConfirm, onCancel) =>
    set({ isOpen: true, title, message, onConfirm, onCancel }),
  closeConfirm: () =>
    set({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null }),
  confirm: () => {
    const { onConfirm, closeConfirm } = useConfirmDialogStore.getState()
    if (onConfirm) onConfirm()
    closeConfirm()
  },
  cancel: () => {
    const { onCancel, closeConfirm } = useConfirmDialogStore.getState()
    if (onCancel) onCancel()
    closeConfirm()
  },
}))

export function useConfirm() {
  const openConfirm = useConfirmDialogStore((s) => s.openConfirm)

  return (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      openConfirm(
        title,
        message,
        () => resolve(true),
        () => resolve(false),
      )
    })
  }
}
