'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, BarChart3, DollarSign,
  Layers, Settings, LogOut, Moon, Sun, Monitor,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { logout } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/clientes',      icon: Users,           label: 'Clientes'   },
  { href: '/relatorios',    icon: BarChart3,        label: 'Relatórios' },
  { href: '/financeiro',    icon: DollarSign,       label: 'Financeiro' },
  { href: '/biblioteca',    icon: Layers,           label: 'Biblioteca' },
  { href: '/configuracoes', icon: Settings,         label: 'Config'     },
] as const;

export function Sidebar() {
  const pathname              = usePathname();
  const router                = useRouter();
  const { theme, setTheme }   = useTheme();
  const [expanded, setExpanded] = useState(false);

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  const themeIcons = { dark: Moon, light: Sun, system: Monitor } as const;
  const ThemeIcon  = themeIcons[theme] ?? Moon;

  const nextTheme: Record<string, 'light' | 'system' | 'dark'> = {
    dark: 'light', light: 'system', system: 'dark',
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 flex flex-col
        transition-all duration-200 ease-in-out
        dark:bg-surface-card bg-white
        dark:border-r dark:border-surface-border border-r border-gray-100
        ${expanded ? 'w-[13.5rem]' : 'w-[3.5rem]'}
      `}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className="flex items-center h-[3.5rem] px-[0.875rem] border-b dark:border-surface-border border-gray-100 gap-[0.75rem] overflow-hidden">
        <div className="shrink-0 w-[1.75rem] h-[1.75rem] rounded-[0.375rem] bg-brand flex items-center justify-center">
          <span className="text-white font-bold text-sm leading-none">A</span>
        </div>
        <span className={`
          dark:text-ink-primary text-gray-900 font-semibold text-sm whitespace-nowrap
          transition-opacity duration-150
          ${expanded ? 'opacity-100' : 'opacity-0'}
        `}>
          Adsgator Hub
        </span>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 flex flex-col gap-[0.25rem] p-[0.5rem] overflow-hidden">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const ativo = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`
                relative flex items-center gap-[0.75rem] h-[2.25rem] px-[0.625rem]
                rounded-[0.375rem] transition-colors group overflow-hidden
                ${ativo
                  ? 'dark:bg-brand/15 dark:text-brand bg-green-50 text-green-700'
                  : 'dark:text-ink-secondary text-gray-500 dark:hover:bg-surface-hover dark:hover:text-ink-primary hover:bg-gray-50 hover:text-gray-800'
                }
              `}
            >
              <Icon className="shrink-0 w-[1.125rem] h-[1.125rem]" strokeWidth={ativo ? 2 : 1.5} />
              <span className={`
                text-sm font-medium whitespace-nowrap
                transition-opacity duration-150
                ${expanded ? 'opacity-100' : 'opacity-0'}
              `}>
                {label}
              </span>
              {ativo && (
                <span className="absolute left-0 top-[0.375rem] bottom-[0.375rem] w-[0.1875rem] bg-brand rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé da sidebar */}
      <div className="p-[0.5rem] border-t dark:border-surface-border border-gray-100 flex flex-col gap-[0.25rem] overflow-hidden">
        <button
          onClick={() => setTheme(nextTheme[theme])}
          title={`Tema: ${theme}`}
          className="flex items-center gap-[0.75rem] h-[2.25rem] px-[0.625rem] rounded-[0.375rem] dark:text-ink-secondary text-gray-500 dark:hover:bg-surface-hover dark:hover:text-ink-primary hover:bg-gray-50 hover:text-gray-800 transition-colors"
        >
          <ThemeIcon className="shrink-0 w-[1.125rem] h-[1.125rem]" strokeWidth={1.5} />
          <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
            Tema ({theme})
          </span>
        </button>

        <button
          onClick={handleLogout}
          title="Sair"
          className="flex items-center gap-[0.75rem] h-[2.25rem] px-[0.625rem] rounded-[0.375rem] dark:text-ink-secondary text-gray-500 dark:hover:bg-status-red/10 dark:hover:text-status-red hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="shrink-0 w-[1.125rem] h-[1.125rem]" strokeWidth={1.5} />
          <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
            Sair
          </span>
        </button>
      </div>
    </aside>
  );
}
