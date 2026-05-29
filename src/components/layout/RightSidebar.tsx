'use client'

import { useState } from 'react'
import { Bell, MessageCircle, HelpCircle, Settings, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'
import { useRightSidebar } from '@/lib/store/right-sidebar-context'
import { useRightSidebarStore } from '@/lib/store/right-sidebar-store'
import { NotificationDrawer } from './NotificationDrawer'
import { cn } from '@/lib/utils'

interface SidebarIconButtonProps {
  icon: React.ElementType
  label: string
  active?: boolean
  badge?: number
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

function SidebarIconButton({ icon: Icon, label, active, badge, onClick }: SidebarIconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'relative w-[2.25rem] h-[2.25rem] rounded-[0.375rem] flex items-center justify-center',
        'transition-colors duration-150',
        active
          ? 'bg-ads-500/10 text-ads-500'
          : 'text-ink-muted hover:text-ink-secondary hover:bg-surface-hover',
      )}
    >
      <Icon className="w-[1.125rem] h-[1.125rem]" strokeWidth={1.75} />
      {badge != null && badge > 0 && (
        <span className="absolute top-[0.125rem] right-[0.125rem] min-w-[0.875rem] h-[0.875rem] rounded-full bg-status-red flex items-center justify-center text-[0.5rem] font-bold text-white px-[0.125rem]">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}

export function RightSidebar() {
  const { theme, setTheme } = useTheme()
  const ctx = useRightSidebar()
  const { contextActions } = useRightSidebarStore()
  const [notifOpen, setNotifOpen] = useState(false)

  const activeDrawer = ctx?.activeDrawer ?? null
  const openDrawer = ctx?.openDrawer ?? (() => {})

  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const ThemeIcon = theme === 'dark' ? Sun : Moon

  return (
    <>
    <aside
      className={cn(
        'rightsidebar-shell hidden md:flex w-[var(--right-sidebar-w)] h-full',
        'flex-col items-center',
        'bg-surface-card border-l border-surface-border',
        'py-[0.75rem]',
      )}
    >
      {/* ── ÍCONES FIXOS (topo) ──────────────────────── */}
      <div className="flex flex-col items-center gap-[0.25rem]">
        <SidebarIconButton
          icon={Bell}
          label="Notificações"
          active={notifOpen || activeDrawer === 'notifications'}
          onClick={() => setNotifOpen((v) => !v)}
        />
        <SidebarIconButton
          icon={MessageCircle}
          label="Chat de Ajuda"
          active={activeDrawer === 'chat'}
          onClick={() => openDrawer('chat')}
        />
      </div>

      {/* ── ÍCONES CONTEXTUAIS (injetados por página) ── */}
      {contextActions.length > 0 && (
        <>
          <div className="w-[1.5rem] h-[1px] bg-surface-border my-[0.5rem]" />
          <div className="flex flex-col items-center gap-[0.25rem]">
            {contextActions.map((action) => (
              <SidebarIconButton
                key={action.id}
                icon={action.icon}
                label={action.label}
                onClick={(e) => action.onClick(e)}
              />
            ))}
          </div>
        </>
      )}

      {/* ── SPACER ───────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── CONFIGURAÇÕES & AJUDA (rodapé) ─────────────── */}
      <div className="flex flex-col items-center gap-[0.25rem] mb-[0.5rem]">
        <SidebarIconButton
          icon={Settings}
          label="Configurações"
          onClick={() => window.open('/configuracoes', '_self')}
        />
        <SidebarIconButton
          icon={HelpCircle}
          label="Ajuda"
          onClick={() => window.open('/ajuda', '_self')}
        />
      </div>

      {/* ── TEMA (rodapé) ────────────────────────────── */}
      <SidebarIconButton
        icon={ThemeIcon}
        label={nextTheme === 'light' ? 'Tema Claro' : 'Tema Escuro'}
        onClick={() => setTheme(nextTheme)}
      />
    </aside>
    <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  )
}
