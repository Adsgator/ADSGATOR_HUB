# ⚙️ ESPECIFICAÇÕES TÉCNICAS DETALHADAS
## ADSGATOR Premium - Implementation Guide

---

## 1. DESIGN TOKENS & TAILWIND CONFIG

### 1.1 Colors - Tailwind Extension

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Adsgator Brand
        ads: {
          50: '#FFF8E6',
          100: '#FFF0CD',
          200: '#FFE5A6',
          300: '#FFD67F',
          400: '#FFC857',
          500: '#FFA500',  // Primary
          600: '#E69500',
          700: '#CC8800',
          800: '#B37B00',
          900: '#8C6200',
        },
        
        // Semantic
        success: {
          50: '#F0FDF4',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        error: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        info: {
          50: '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        
        // Neutral - Dark Mode Focus
        neutral: {
          0: '#FFFFFF',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          850: '#15161E',  // Card background (dark)
          900: '#111827',
          950: '#0A0A0A',  // Main background (dark)
        },
      },
      
      // Typography
      fontSize: {
        // Scale em rem (base: 16px = 1rem)
        xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      },
      
      // Spacing - rem based
      spacing: {
        0: '0',
        0.5: '0.125rem',  // 2px
        1: '0.25rem',     // 4px
        2: '0.5rem',      // 8px
        3: '0.75rem',     // 12px
        4: '1rem',        // 16px
        5: '1.25rem',     // 20px
        6: '1.5rem',      // 24px
        8: '2rem',        // 32px
        10: '2.5rem',     // 40px
        12: '3rem',       // 48px
        16: '4rem',       // 64px
        20: '5rem',       // 80px
        24: '6rem',       // 96px
      },
      
      // Shadow Elevation System
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      
      // Border
      borderColor: {
        DEFAULT: 'rgb(var(--border-color) / <alpha-value>)',
      },
      borderWidth: {
        DEFAULT: '1px',
        0: '0',
        2: '2px',
        4: '4px',
      },
      
      // Rounded Corners
      borderRadius: {
        none: '0',
        sm: '0.375rem',   // 6px
        md: '0.5rem',     // 8px
        lg: '0.75rem',    // 12px
        xl: '1rem',       // 16px
        '2xl': '1.5rem',  // 24px
      },
      
      // Transitions
      transitionDuration: {
        DEFAULT: '200ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        ease: 'ease',
      },
    },
  },
  
  // Dark mode
  darkMode: 'class',
}
```

### 1.2 CSS Variables para Dark Mode

```css
/* globals.css */

:root {
  /* Light Mode */
  --color-bg: 255 255 255;
  --color-surface: 249 250 251;
  --color-border: 229 231 235;
  --color-text-primary: 17 24 39;
  --color-text-secondary: 107 114 128;
}

.dark {
  /* Dark Mode */
  --color-bg: 10 10 10;
  --color-surface: 26 26 26;
  --color-border: 51 51 51;
  --color-text-primary: 255 255 255;
  --color-text-secondary: 170 170 170;
}

body {
  @apply bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text-primary))] transition-colors duration-300;
}
```

---

## 2. COMPONENT STRUCTURE

### 2.1 Button Component

```typescript
// components/ui/Button.tsx

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center',
    'font-medium text-sm rounded-lg',
    'px-4 py-2 h-10',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-ads-500 text-white',
          'hover:bg-ads-600',
          'active:bg-ads-700',
          'focus:ring-ads-500',
          'dark:bg-ads-500 dark:hover:bg-ads-600',
        ],
        secondary: [
          'bg-neutral-100 text-neutral-900',
          'border border-neutral-300',
          'hover:bg-neutral-200',
          'dark:bg-neutral-800 dark:text-white',
          'dark:border-neutral-700 dark:hover:bg-neutral-700',
        ],
        ghost: [
          'text-neutral-900',
          'hover:bg-neutral-100',
          'dark:text-white dark:hover:bg-neutral-800',
        ],
        danger: [
          'bg-error-500 text-white',
          'hover:bg-error-600',
          'active:bg-error-700',
          'focus:ring-error-500',
        ],
      },
      size: {
        sm: 'px-3 py-1.5 h-8 text-xs',
        md: 'px-4 py-2 h-10 text-sm',
        lg: 'px-6 py-3 h-12 text-base',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  icon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, fullWidth }),
          className
        )}
        disabled={isLoading || disabled}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin mr-2">⏳</span>
            {children}
          </>
        ) : (
          <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

### 2.2 Card Component

```typescript
// components/ui/Card.tsx

import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'sm' | 'md' | 'lg'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800',
      elevated: 'bg-white dark:bg-neutral-850 shadow-lg',
      outlined: 'bg-transparent border border-neutral-300 dark:border-neutral-700',
    }

    const paddingVariants = {
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg transition-all duration-200',
          variants[variant],
          paddingVariants[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
```

### 2.3 Badge Component

```typescript
// components/ui/Badge.tsx

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        success: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-200',
        warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-200',
        error: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-200',
        info: 'bg-info-100 text-info-700 dark:bg-info-900 dark:text-info-200',
        neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
        ads: 'bg-ads-100 text-ads-700 dark:bg-ads-900 dark:text-ads-200',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, icon, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  )
)

Badge.displayName = 'Badge'
```

---

## 3. LAYOUT COMPONENTS

### 3.1 Bento Grid Component

```typescript
// components/layout/BentoGrid.tsx

import React, { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface BentoGridItemProps {
  className?: string
  gridCol?: 'span-1' | 'span-2' | 'span-3' | 'span-4' | 'span-6' | 'span-12'
  gridRow?: 'span-1' | 'span-2' | 'span-3' | 'span-4'
  children: React.ReactNode
}

const BentoGridItem: React.FC<BentoGridItemProps> = ({
  className,
  gridCol = 'span-1',
  gridRow = 'span-1',
  children,
}) => {
  const colClasses = {
    'span-1': 'col-span-1',
    'span-2': 'col-span-2',
    'span-3': 'col-span-3',
    'span-4': 'col-span-4',
    'span-6': 'col-span-6',
    'span-12': 'col-span-12',
  }

  const rowClasses = {
    'span-1': 'row-span-1',
    'span-2': 'row-span-2',
    'span-3': 'row-span-3',
    'span-4': 'row-span-4',
  }

  return (
    <div
      className={cn(
        colClasses[gridCol],
        rowClasses[gridRow],
        className
      )}
    >
      {children}
    </div>
  )
}

interface BentoGridProps {
  children: React.ReactNode
  columns?: 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  children,
  columns = 12,
  gap = 'md',
  className,
}) => {
  const colClass = `grid-cols-${columns}`
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }

  return (
    <div
      className={cn(
        `grid ${colClass} ${gapClasses[gap]}`,
        'auto-rows-auto',
        'transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  )
}

export const BentoItem = BentoGridItem
```

### 3.2 Container Component

```typescript
// components/layout/Container.tsx

import React from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', children, ...props }, ref) => {
    const sizes = {
      sm: 'max-w-2xl',     // 42rem
      md: 'max-w-4xl',     // 56rem
      lg: 'max-w-6xl',     // 72rem
      xl: 'max-w-7xl',     // 80rem
      full: 'max-w-full',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full',
          'px-4 sm:px-6 md:px-8',
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'
```

---

## 4. DARK MODE SETUP

### 4.1 ThemeProvider

```typescript
// providers/ThemeProvider.tsx

'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ReactNode } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey="ads-theme"
    >
      {children}
    </NextThemesProvider>
  )
}
```

### 4.2 Theme Toggle

```typescript
// components/ThemeToggle.tsx

'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/Button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  )
}
```

---

## 5. STATE MANAGEMENT - ZUSTAND + REALTIME

### 5.1 Dashboard Store

```typescript
// lib/store/dashboard.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Client, ClientStatus } from '@/lib/types'

interface DashboardState {
  clients: Client[]
  loading: boolean
  error: string | null
  notifications: Notification[]
  
  // Actions
  setClients: (clients: Client[]) => void
  updateClient: (id: string, data: Partial<Client>) => void
  addNotification: (notif: Notification) => void
  removeNotification: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useDashboardStore = create<DashboardState>()(
  devtools((set) => ({
    clients: [],
    loading: false,
    error: null,
    notifications: [],

    setClients: (clients) => set({ clients }),

    updateClient: (id, data) =>
      set((state) => ({
        clients: state.clients.map((c) =>
          c.id === id ? { ...c, ...data } : c
        ),
      })),

    addNotification: (notif) =>
      set((state) => ({
        notifications: [...state.notifications, notif],
      })),

    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),

    setLoading: (loading) => set({ loading }),
  }))
)
```

### 5.2 Supabase Realtime Hook

```typescript
// hooks/useRealtimeClients.ts

import { useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useDashboardStore } from '@/lib/store/dashboard'

export function useRealtimeClients() {
  const supabase = useSupabaseClient()
  const { updateClient, addNotification } = useDashboardStore()

  useEffect(() => {
    const subscription = supabase
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clientes',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const newData = payload.new as any
            updateClient(newData.id, newData)

            // Notificar usuário
            addNotification({
              id: `${newData.id}-${Date.now()}`,
              type: 'info',
              title: `${newData.nome} foi atualizado`,
              message: `Status agora é: ${newData.status}`,
              duration: 5000,
            })
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, updateClient, addNotification])
}
```

---

## 6. FORM COMPONENTS

### 6.1 Input Component

```typescript
// components/ui/Input.tsx

import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  fullWidth?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      icon,
      fullWidth,
      ...props
    },
    ref
  ) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2 rounded-lg',
              'border border-neutral-300 dark:border-neutral-700',
              'bg-white dark:bg-neutral-850',
              'text-neutral-900 dark:text-white',
              'placeholder-neutral-400 dark:placeholder-neutral-500',
              'focus:outline-none focus:ring-2 focus:ring-ads-500',
              'transition-colors duration-200',
              icon && 'pl-10',
              error && 'border-error-500 focus:ring-error-500',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-error-600 dark:text-error-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

---

## 7. NOTIFICATION SYSTEM

### 7.1 Toast Component

```typescript
// components/Toast.tsx

import React, { useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const toastStyles = {
  success: {
    bg: 'bg-success-50 dark:bg-success-900',
    border: 'border-success-200 dark:border-success-800',
    text: 'text-success-800 dark:text-success-200',
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  error: {
    bg: 'bg-error-50 dark:bg-error-900',
    border: 'border-error-200 dark:border-error-800',
    text: 'text-error-800 dark:text-error-200',
    icon: <AlertCircle className="w-5 h-5" />,
  },
  info: {
    bg: 'bg-info-50 dark:bg-info-900',
    border: 'border-info-200 dark:border-info-800',
    text: 'text-info-800 dark:text-info-200',
    icon: <Info className="w-5 h-5" />,
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900',
    border: 'border-warning-200 dark:border-warning-800',
    text: 'text-warning-800 dark:text-warning-200',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
}

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const style = toastStyles[type]

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border',
        'shadow-lg animate-in fade-in slide-in-from-bottom-4',
        style.bg,
        style.border,
        style.text
      )}
    >
      {style.icon}
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="opacity-50 hover:opacity-100 transition-opacity"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
```

### 7.2 Toast Container

```typescript
// components/ToastContainer.tsx

'use client'

import { useDashboardStore } from '@/lib/store/dashboard'
import { Toast } from './Toast'

export function ToastContainer() {
  const { notifications, removeNotification } = useDashboardStore()

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notif) => (
        <Toast
          key={notif.id}
          id={notif.id}
          type={notif.type as any}
          title={notif.title}
          message={notif.message}
          duration={notif.duration}
          onClose={removeNotification}
        />
      ))}
    </div>
  )
}
```

---

## 8. DATA TABLE COMPONENT

### 8.1 Table Basics

```typescript
// components/ui/Table.tsx

import React from 'react'
import { cn } from '@/lib/utils'

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
))
Table.displayName = 'Table'

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      'border-b border-neutral-200 dark:border-neutral-800',
      'bg-neutral-50 dark:bg-neutral-900',
      className
    )}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
))
TableBody.displayName = 'TableBody'

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-neutral-200 dark:border-neutral-800',
      'hover:bg-neutral-50 dark:hover:bg-neutral-900',
      'transition-colors duration-150',
      className
    )}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-10 px-4 text-left align-middle font-semibold',
      'text-neutral-700 dark:text-neutral-300',
      'text-xs uppercase tracking-wide',
      className
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-4 py-3 align-middle', className)}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell }
```

---

## 9. RESPONSIVE UTILITIES

### 9.1 useMediaQuery Hook

```typescript
// hooks/useMediaQuery.ts

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// Uso
const isMobile = useMediaQuery('(max-width: 640px)')
const isTablet = useMediaQuery('(max-width: 1024px)')
const isDesktop = useMediaQuery('(min-width: 1025px)')
```

---

## 10. INTEGRAÇÃO SUPABASE - SECURITY

### 10.1 RLS Policies

```sql
-- Clientes Table - Row Level Security
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own clients
CREATE POLICY "Users see their own clients"
  ON clientes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update their own clients
CREATE POLICY "Users update their own clients"
  ON clientes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin can see all
CREATE POLICY "Admin see all clients"
  ON clientes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

### 10.2 Realtime Subscription with Auth

```typescript
// lib/realtime.ts

import { createClient } from '@supabase/supabase-js'

export function subscribeToClientsRealtime(
  callback: (payload: any) => void
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return supabase
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'clientes',
      },
      callback
    )
    .subscribe()
}
```

---

## 11. PERFORMANCE OPTIMIZATION

### 11.1 Image Optimization

```typescript
// components/OptimizedImage.tsx

import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 400,
  priority = false,
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      quality={80}
      placeholder="blur"
      blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23f0f0f0' width='400' height='400'/%3E%3C/svg%3E"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  )
}
```

### 11.2 React Query Setup

```typescript
// lib/queryClient.ts

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,    // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

### 11.3 Lazy Loading Routes

```typescript
// app/layout.tsx

import dynamic from 'next/dynamic'

const Analytics = dynamic(() => import('@/components/Analytics'), {
  loading: () => <div>Carregando...</div>,
  ssr: false,
})
```

---

## 12. TESTING STRUCTURE

### 12.1 Component Test Example

```typescript
// components/__tests__/Button.test.tsx

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../ui/Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('calls onClick handler', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

---

**✅ ESPECIFICAÇÕES TÉCNICAS COMPLETAS PARA GUIAR DESENVOLVIMENTO**

Próximas etapas: Qual fase deseja começar? Validar o roadmap ou começar a implementação?

