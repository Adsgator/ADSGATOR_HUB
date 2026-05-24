'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export function Tooltip({ content, children, side = 'top', delay = 400, className }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }, [delay])

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }, [])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const positionClasses = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-[0.375rem]',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-[0.375rem]',
    left:   'right-full top-1/2 -translate-y-1/2 mr-[0.375rem]',
    right:  'left-full top-1/2 -translate-y-1/2 ml-[0.375rem]',
  }

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className={cn(
            'absolute z-[100] pointer-events-none',
            'px-[0.5rem] py-[0.25rem] rounded-[0.25rem]',
            'bg-surface-elevated border border-surface-border',
            'text-ink-primary text-[0.6875rem] font-medium whitespace-nowrap',
            'shadow-lg shadow-black/30',
            'animate-fade-scale',
            positionClasses[side],
            className,
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
