'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BarChart2,
  DollarSign,
  FileText,
  Layers,
  Settings,
  HelpCircle,
  LogOut,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/auth'

const NAV_ITEMS = [
  {
    group: 'MENU',
    items: [
      { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
      { href: '/clientes',     icon: Users,           label: 'Clientes'     },
      { href: '/analytics',    icon: BarChart2,       label: 'Analytics'    },
      { href: '/financeiro',   icon: DollarSign,      label: 'Financeiro'   },
      { href: '/relatorios',   icon: FileText,        label: 'Relatórios'   },
      { href: '/biblioteca',   icon: Layers,          label: 'Biblioteca'   },
    ],
  },
  {
    group: 'GERAL',
    items: [
      { href: '/configuracoes', icon: Settings,   label: 'Configurações' },
      { href: '/ajuda',         icon: HelpCircle, label: 'Ajuda'         },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen w-sidebar z-40',
        'flex flex-col',
        'bg-surface-card border-r border-surface-border',
        'transition-all duration-300',
      )}
    >
      {/* ── LOGO ────────────────────────────────────── */}
      <div className="flex items-center gap-[0.625rem] h-[3.5rem] px-[1.25rem] border-b border-surface-border shrink-0">
        <div className="w-[1.75rem] h-[1.75rem] rounded-[0.375rem] bg-ads-500 flex items-center justify-center">
          <Zap className="w-[1rem] h-[1rem] text-white" strokeWidth={2.5} />
        </div>
        <span className="text-ink-primary font-bold text-[1rem] tracking-tight">
          ADSGATOR
        </span>
      </div>

      {/* ── NAVEGAÇÃO ───────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-[1rem] px-[0.75rem] space-y-[1.5rem]">
        {NAV_ITEMS.map((group) => (
          <div key={group.group}>
            <p className="text-ink-muted text-[0.625rem] font-semibold uppercase tracking-[0.08em] px-[0.5rem] mb-[0.375rem]">
              {group.group}
            </p>
            <ul className="space-y-[0.125rem]">
              {group.items.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center gap-[0.625rem]',
                        'h-[2.25rem] px-[0.625rem] rounded-[0.375rem]',
                        'text-[0.875rem] font-medium',
                        'transition-all duration-150',
                        isActive
                          ? 'bg-ads-500/10 text-ads-500'
                          : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary',
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-[1rem] h-[1rem] shrink-0',
                          isActive ? 'text-ads-500' : 'text-ink-muted',
                        )}
                        strokeWidth={isActive ? 2.5 : 1.75}
                      />
                      <span>{label}</span>

                      {isActive && (
                        <span className="ml-auto w-[0.1875rem] h-[1rem] rounded-full bg-ads-500" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── RODAPÉ — USUÁRIO ───────────────────────── */}
      <div className="shrink-0 border-t border-surface-border p-[0.75rem]">
        <div className="flex items-center gap-[0.625rem] p-[0.5rem] rounded-[0.375rem] hover:bg-surface-hover transition-colors cursor-pointer group">
          <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-ads-500/20 border border-ads-500/30 flex items-center justify-center shrink-0">
            <span className="text-ads-500 text-[0.75rem] font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ink-primary text-[0.8125rem] font-medium truncate">Admin</p>
            <p className="text-ink-muted text-[0.6875rem] truncate">Adsgator</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
          >
            <LogOut
              className="w-[0.875rem] h-[0.875rem] text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              strokeWidth={1.75}
            />
          </button>
        </div>
      </div>
    </aside>
  )
}
