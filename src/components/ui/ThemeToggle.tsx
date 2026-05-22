'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '@/providers/ThemeProvider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const themes = [
    { key: 'dark'   as const, icon: Moon,    label: 'Escuro'  },
    { key: 'light'  as const, icon: Sun,     label: 'Claro'   },
    { key: 'system' as const, icon: Monitor, label: 'Sistema' },
  ]

  return (
    <div className="flex items-center gap-[0.25rem] p-[0.25rem] bg-surface-hover rounded-[0.5rem] border border-surface-border">
      {themes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          title={label}
          className={`
            w-[1.75rem] h-[1.75rem] rounded-[0.375rem] flex items-center justify-center
            transition-all duration-150
            ${theme === key
              ? 'bg-surface-card text-ads-500 shadow-sm'
              : 'text-ink-muted hover:text-ink-secondary'
            }
          `}
        >
          <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  )
}
