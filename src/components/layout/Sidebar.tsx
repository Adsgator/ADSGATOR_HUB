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
  LogOut,
  CheckSquare,
  Megaphone,
  GitMerge,
  Search,
  BookOpen,
  Globe,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useMobileMenuStore } from '@/lib/store/mobileMenuStore'

const NAV_ITEMS = [
  { href: '/dashboard',         icon: LayoutDashboard, label: 'Dashboard'        },
  { href: '/clientes',          icon: Users,           label: 'Clientes'         },
  { href: '/prospectar',        icon: Search,          label: 'Prospectar'       },
  { href: '/tarefas',           icon: CheckSquare,     label: 'Tarefas'          },
  { href: '/operacional',       icon: GitMerge,        label: 'Operacional'      },
  { href: '/marketing',         icon: Megaphone,       label: 'Marketing'        },
  { href: '/analytics',         icon: BarChart2,       label: 'Analytics'        },
  { href: '/financeiro',        icon: DollarSign,      label: 'Financeiro'       },
  { href: '/relatorios',        icon: FileText,        label: 'Relatórios'       },
  { href: '/base-conhecimento', icon: BookOpen,        label: 'Base Conhecimento'},
  { href: '/portfolio',         icon: Globe,           label: 'Portfolio'        },
  { href: '/biblioteca',        icon: Layers,          label: 'Biblioteca'       },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [badgeCount, setBadgeCount] = useState(0)
  const { open, close } = useMobileMenuStore()

  useEffect(() => {
    const fetchBadges = async () => {
      const hoje = new Date().toISOString().slice(0, 10)
      
      const { count: tarefasCount } = await supabase
        .from('tarefas')
        .select('id', { count: 'exact', head: true })
        .lte('data_prazo', hoje + 'T23:59:59')
        .neq('status', 'feito')
      
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
    <>
      {/* ── SIDEBAR DESKTOP (oculto no mobile) ──────────── */}
      <div className="hidden md:flex md:h-full hover:w-[var(--sidebar-expanded)] md:w-[var(--sidebar-w)]">
        <aside
          className={cn(
            'sidebar-shell group/sidebar relative h-full z-40',
            'flex flex-col',
            'bg-surface-card border-r border-surface-border/15',
            'shadow-[1px_0_0_0_rgba(0,0,0,0.08)]',
            'w-[var(--sidebar-w)] hover:w-[var(--sidebar-expanded)]',
            'hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/40',
            'transition-all duration-300',
            'overflow-hidden',
            '[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
          )}
        >
        {/* ── NAVEGAÇÃO ───────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-[0.75rem] px-[0.5rem]">
          <ul className="space-y-[0.125rem]">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
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
                        style={isActive ? { filter: 'drop-shadow(0 0 0.375rem rgba(255,177,0,0.4))' } : undefined}
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
      </div>

      {/* ── DRAWER MOBILE (menu lateral no mobile) ────── */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={close}
          />

          {/* Painel */}
          <nav className="fixed inset-y-0 left-0 z-50 w-[15rem] bg-surface-card border-r border-surface-border flex flex-col md:hidden panel-slide-in">
            {/* Botão fechar */}
            <div className="flex items-center justify-between p-[1rem] border-b border-surface-border">
              <h2 className="text-ink-primary font-semibold text-[0.9375rem]">Menu</h2>
              <button
                onClick={close}
                className="p-[0.25rem] text-ink-muted hover:text-ink-primary transition-colors"
                title="Fechar"
              >
                <X className="w-[1.25rem] h-[1.25rem]" strokeWidth={2} />
              </button>
            </div>

            {/* Navegação */}
            <ul className="flex-1 overflow-y-auto py-[0.75rem] px-[0.5rem] space-y-[0.125rem]">
              {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={close}
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
                      <Icon className="w-[1.25rem] h-[1.25rem] shrink-0" strokeWidth={1.75} />
                      <span>{label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Rodapé — Usuário */}
            <div className="shrink-0 border-t border-surface-border p-[0.5rem]">
              <div className="flex items-center gap-[0.625rem] p-[0.5rem] rounded-[0.375rem] hover:bg-surface-hover transition-colors cursor-pointer">
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
                  className="p-[0.25rem]"
                >
                  <LogOut
                    className="w-[0.875rem] h-[0.875rem] text-ink-muted hover:text-ink-primary transition-colors"
                    strokeWidth={1.75}
                  />
                </button>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  )
}
