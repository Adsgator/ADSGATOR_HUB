'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
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
  CheckSquare,
  Megaphone,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
  {
    group: 'MENU',
    items: [
      { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
      { href: '/clientes',     icon: Users,           label: 'Clientes'     },
      { href: '/tarefas',      icon: CheckSquare,     label: 'Tarefas'      },
      { href: '/marketing',    icon: Megaphone,       label: 'Marketing'    },
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
  const [badgeCount, setBadgeCount] = useState(0)

  useEffect(() => {
    const fetchBadges = async () => {
      const hoje = new Date().toISOString().slice(0, 10)
      
      // Tarefas urgentes
      const { count: tarefasCount } = await supabase
        .from('tarefas')
        .select('id', { count: 'exact', head: true })
        .lte('data_prazo', hoje + 'T23:59:59')
        .neq('status', 'feito')
      
      // Alertas críticos
      const { count: alertasCount } = await supabase
        .from('clientes')
        .select('id', { count: 'exact', head: true })
        .gt('dias_atraso', 0)
      
      setBadgeCount((tarefasCount ?? 0) + (alertasCount ?? 0))
    }
    
    fetchBadges()
  }, [pathname])

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <aside
      className={cn(
        'group/sidebar fixed left-0 top-0 h-screen z-40',
        'flex flex-col',
        'bg-surface-card border-r border-surface-border',
        'w-[3.5rem] hover:w-[15rem]',
        'transition-all duration-300 ease-in-out',
      )}
    >
      {/* ── LOGO ────────────────────────────────────── */}
      <div className="flex items-center gap-[0.625rem] h-[3.5rem] px-[0.875rem] border-b border-surface-border shrink-0 overflow-hidden">
        <div className="w-[1.75rem] h-[1.75rem] rounded-[0.375rem] bg-ads-500 flex items-center justify-center shrink-0">
          <Zap className="w-[1rem] h-[1rem] text-white" strokeWidth={2.5} />
        </div>
        <span className="text-ink-primary font-bold text-[1rem] tracking-tight opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto whitespace-nowrap overflow-hidden transition-all duration-200">
          ADSGATOR
        </span>
      </div>

      {/* ── NAVEGAÇÃO ───────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-[1rem] px-[0.5rem] space-y-[1.5rem]">
        {NAV_ITEMS.map((group) => (
          <div key={group.group}>
            <p className="text-ink-muted text-[0.625rem] font-semibold uppercase tracking-[0.08em] px-[0.5rem] mb-[0.375rem] opacity-0 w-0 h-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:h-auto whitespace-nowrap overflow-hidden transition-all duration-200">
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
                        'transition-colors duration-200',
                        isActive
                          ? 'border-l-[3px] border-ads-500 bg-ads-500/10 text-ads-500 rounded-l-none'
                          : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary',
                      )}
                    >
                      <div className="relative shrink-0">
                        <Icon
                          className={cn(
                            'w-[1.25rem] h-[1.25rem]',
                            isActive ? 'text-ads-500' : 'text-ink-muted',
                          )}
                          strokeWidth={isActive ? 2.25 : 1.75}
                        />
                        {href === '/tarefas' && badgeCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[0.875rem] h-[0.875rem] px-[0.125rem] rounded-full bg-status-red text-white text-[0.5rem] font-bold flex items-center justify-center">
                            {badgeCount > 9 ? '9' : badgeCount}
                          </span>
                        )}
                      </div>
                      <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto whitespace-nowrap overflow-hidden transition-all duration-200">
                        {label}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── RODAPÉ — USUÁRIO ───────────────────────── */}
      <div className="shrink-0 border-t border-surface-border p-[0.5rem]">
        <div className="flex items-center gap-[0.625rem] p-[0.5rem] rounded-[0.375rem] hover:bg-surface-hover transition-colors cursor-pointer group/user">
          <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-ads-500/20 border border-ads-500/30 flex items-center justify-center shrink-0">
            <span className="text-ads-500 text-[0.75rem] font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0 opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto whitespace-nowrap overflow-hidden transition-all duration-200">
            <p className="text-ink-primary text-[0.8125rem] font-medium truncate">Admin</p>
            <p className="text-ink-muted text-[0.6875rem] truncate">Adsgator</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto whitespace-nowrap overflow-hidden transition-all duration-200"
          >
            <LogOut
              className="w-[0.875rem] h-[0.875rem] text-ink-muted hover:text-ink-primary transition-colors"
              strokeWidth={1.75}
            />
          </button>
        </div>
      </div>
    </aside>
  )
}
