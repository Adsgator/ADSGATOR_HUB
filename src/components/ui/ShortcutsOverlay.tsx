'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const GROUPS: { title: string; shortcuts: { keys: string[]; label: string }[] }[] = [
  {
    title: 'Navegação',
    shortcuts: [
      { keys: ['Ctrl', 'K'],   label: 'Busca global / Ações rápidas' },
      { keys: ['Ctrl', 'I'],   label: 'Abrir IA Adsgator (agente)'   },
      { keys: ['?'],           label: 'Mostrar atalhos'              },
      { keys: ['Esc'],         label: 'Fechar painel / modal'        },
    ],
  },
  {
    title: 'Tarefas',
    shortcuts: [
      { keys: ['N'],           label: 'Nova tarefa (na página Tarefas)' },
      { keys: ['Enter'],       label: 'Abrir tarefa selecionada'        },
    ],
  },
  {
    title: 'Formulários',
    shortcuts: [
      { keys: ['Ctrl', 'S'],   label: 'Salvar formulário / drawer'   },
      { keys: ['Esc'],         label: 'Cancelar edição'              },
    ],
  },
  {
    title: 'Menu de contexto',
    shortcuts: [
      { keys: ['Clique direito'], label: 'Abrir menu de contexto em qualquer item' },
      { keys: ['↑', '↓'],         label: 'Navegar itens do menu'                  },
      { keys: ['Enter'],           label: 'Selecionar item'                        },
    ],
  },
]

interface Props {
  onClose: () => void
}

export function ShortcutsOverlay({ onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const overlay = (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-[1rem]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-card border border-surface-border rounded-2xl shadow-2xl w-full max-w-[36rem] p-[1.5rem] animate-fade-scale">
        <div className="flex items-center justify-between mb-[1.25rem]">
          <h2 className="text-ink-primary text-[1rem] font-semibold">Atalhos de teclado</h2>
          <button onClick={onClose}
            className="w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded-lg text-ink-muted hover:text-ink-secondary hover:bg-surface-hover transition-colors">
            <X className="w-[1rem] h-[1rem]" strokeWidth={2} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-[1.5rem]">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="text-ink-muted text-[0.625rem] font-semibold uppercase tracking-wide mb-[0.625rem]">{g.title}</p>
              <div className="flex flex-col gap-[0.5rem]">
                {g.shortcuts.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-[0.75rem]">
                    <span className="text-ink-secondary text-[0.8125rem]">{s.label}</span>
                    <div className="flex items-center gap-[0.25rem] shrink-0">
                      {s.keys.map((k) => (
                        <kbd key={k}
                          className="flex items-center h-[1.375rem] px-[0.375rem] rounded-md bg-surface-hover border border-surface-border text-[0.6875rem] text-ink-muted font-mono whitespace-nowrap">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-ink-muted text-[0.75rem] text-center mt-[1.25rem]">
          Pressione <kbd className="px-[0.375rem] py-[0.125rem] rounded bg-surface-hover border border-surface-border text-[0.6875rem] font-mono">?</kbd> ou <kbd className="px-[0.375rem] py-[0.125rem] rounded bg-surface-hover border border-surface-border text-[0.6875rem] font-mono">Esc</kbd> para fechar
        </p>
      </div>
    </div>
  )

  if (typeof window === 'undefined') return null
  return createPortal(overlay, document.body)
}
