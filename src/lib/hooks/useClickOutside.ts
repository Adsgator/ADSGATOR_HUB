import { useEffect, useRef } from 'react'

/**
 * Fecha um popover/menu ao clicar fora ou apertar Esc.
 * Retorna a ref que deve envolver o conteúdo cujo clique externo dispara `onClose`.
 */
export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  ativo: boolean,
  onClose: () => void,
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ativo) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [ativo, onClose])

  return ref
}
