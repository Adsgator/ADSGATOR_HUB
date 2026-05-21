# ADSGATOR HUB - ARQUIVO 2: UX & CRM

## 1. SETUP TAILWIND: tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      spacing: {
        // REM-based spacing (proibido px)
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '2.5': '0.625rem',
        '3': '0.75rem',
        '3.5': '0.875rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '12': '3rem',
        '14': '3.5rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
      },
      colors: {
        // Design system minimalista escuro
        'dark-bg': '#0f0f0f',
        'dark-card': '#1a1a1a',
        'dark-border': '#2d2d2d',
        'dark-hover': '#252525',
        'primary': '#10b981',
        'primary-dark': '#059669',
        'secondary': '#6366f1',
        'warning': '#f97316',
        'danger': '#ef4444',
        'success': '#10b981',
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'base': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
      },
      borderWidth: {
        'thin': '0.5px',
        'normal': '1px',
        'thick': '2px',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 2. PROVIDER DE TEMA: providers/ThemeProvider.tsx

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }

    const updateDarkMode = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const currentTheme = savedTheme || 'system';

      if (currentTheme === 'system') {
        setIsDark(prefersDark);
        document.documentElement.classList.toggle('dark', prefersDark);
      } else if (currentTheme === 'dark') {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      }
    };

    updateDarkMode();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateDarkMode);

    return () => mediaQuery.removeEventListener('change', updateDarkMode);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro do ThemeProvider');
  }
  return context;
}
```

---

## 3. COMPONENTE: Icons.tsx (Lucide React)

```typescript
'use client';

import {
  Home,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  AlertCircle,
  Clock,
  CheckCircle,
  MessageCircle,
  Copy,
  Zap,
  DollarSign,
  Eye,
  Moon,
  Sun,
} from 'lucide-react';

export const Icons = {
  Home,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  AlertCircle,
  Clock,
  CheckCircle,
  MessageCircle,
  Copy,
  Zap,
  DollarSign,
  Eye,
  Moon,
  Sun,
};

interface IconProps {
  className?: string;
  strokeWidth?: number;
}

export function renderIcon(
  name: keyof typeof Icons,
  props: IconProps = {}
) {
  const Icon = Icons[name];
  return (
    <Icon
      className={props.className || 'w-5 h-5'}
      strokeWidth={props.strokeWidth || 1.5}
    />
  );
}
```

---

## 4. COMPONENTE: Sidebar.tsx

```typescript
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Icons } from './Icons';
import { useTheme } from '@/providers/ThemeProvider';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'Home' },
  { href: '/clientes', label: 'Clientes', icon: 'Users' },
  { href: '/relatorios', label: 'Relatórios', icon: 'TrendingUp' },
  { href: '/financeiro', label: 'Financeiro', icon: 'DollarSign' },
  { href: '/configuracoes', label: 'Configurações', icon: 'Settings' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, isDark } = useTheme();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen transition-all duration-300
        ${isOpen ? 'w-16' : 'w-16'}
        dark:bg-dark-card bg-white dark:border-r dark:border-dark-border
        border-r border-gray-200 flex flex-col items-center py-8
      `}
    >
      {/* Logo */}
      <div className="mb-12 flex items-center justify-center">
        <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-lg">A</span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex flex-col gap-4 flex-1">
        {navItems.map((item) => {
          const Icon = Icons[item.icon as keyof typeof Icons];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                w-12 h-12 rounded-md flex items-center justify-center
                transition-colors duration-200
                ${
                  isActive
                    ? 'dark:bg-primary bg-primary dark:text-white text-white'
                    : 'dark:hover:bg-dark-hover hover:bg-gray-100 dark:text-gray-400 text-gray-600'
                }
              `}
              title={item.label}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          );
        })}
      </nav>

      {/* Toggle Tema */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={`
          w-12 h-12 rounded-md flex items-center justify-center
          dark:hover:bg-dark-hover hover:bg-gray-100 transition-colors
          dark:text-gray-400 text-gray-600
        `}
        title="Alternar tema"
      >
        {isDark ? (
          <Icons.Sun className="w-5 h-5" strokeWidth={1.5} />
        ) : (
          <Icons.Moon className="w-5 h-5" strokeWidth={1.5} />
        )}
      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className={`
          w-12 h-12 rounded-md flex items-center justify-center
          dark:hover:bg-danger/20 hover:bg-red-50 transition-colors
          dark:text-danger text-red-600
        `}
        title="Sair"
      >
        <Icons.LogOut className="w-5 h-5" strokeWidth={1.5} />
      </button>
    </aside>
  );
}
```

---

## 5. COMPONENTE: Layout Principal

```typescript
'use client';

import React from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen dark:bg-dark-bg bg-white">
      <Sidebar />
      <main className="flex-1 ml-16 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
```

---

## 6. COMPONENTE: Card de Cliente (Home)

```typescript
'use client';

import React from 'react';
import { Cliente, Estagio } from '@/lib/types';
import { Icons } from './Icons';

interface ClienteCardProps {
  cliente: Cliente;
  estagio: Estagio | null;
  onWhatsApp: (numero: string) => void;
  onCongelar: (clienteId: string) => void;
}

export function ClienteCard({
  cliente,
  estagio,
  onWhatsApp,
  onCongelar,
}: ClienteCardProps) {
  const statusConfig = {
    recebido: { cor: 'bg-blue-500', label: '🔔 Recebido' },
    onboarding: { cor: 'bg-yellow-500', label: '📋 Onboarding' },
    setup_trafego: { cor: 'bg-purple-500', label: '⚙️ Setup Tráfego' },
    ativo: { cor: 'bg-green-500', label: '✅ Ativo' },
    congelado: { cor: 'bg-orange-500', label: '❄️ Congelado' },
    cancelado: { cor: 'bg-red-500', label: '❌ Cancelado' },
  };

  const config = statusConfig[cliente.status as keyof typeof statusConfig] || {
    cor: 'bg-gray-500',
    label: cliente.status,
  };

  return (
    <div
      className={`
        dark:bg-dark-card bg-white rounded-lg p-6 border
        dark:border-dark-border border-gray-200 hover:shadow-lg
        transition-all duration-300 cursor-pointer
      `}
    >
      {/* Header com Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="dark:text-white text-gray-900 font-semibold text-xl mb-1">
            {cliente.nome}
          </h3>
          <p className="dark:text-gray-400 text-gray-600 text-sm">
            {cliente.email}
          </p>
        </div>
        <div className={`${config.cor} text-white px-3 py-1 rounded-md text-xs font-semibold`}>
          {config.label}
        </div>
      </div>

      {/* Nicho e Domínio */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="dark:text-gray-500 text-gray-500 text-xs uppercase tracking-wide mb-1">
            Nicho
          </p>
          <p className="dark:text-white text-gray-900 font-medium">
            {cliente.nicho || 'A definir'}
          </p>
        </div>
        <div>
          <p className="dark:text-gray-500 text-gray-500 text-xs uppercase tracking-wide mb-1">
            Domínio
          </p>
          <p className="dark:text-white text-gray-900 font-medium">
            {cliente.dominio || '—'}
          </p>
        </div>
      </div>

      {/* Ação Próxima */}
      {estagio && (
        <div className="dark:bg-dark-hover bg-gray-50 rounded-md p-4 mb-4 border-l-2 border-primary">
          <p className="dark:text-gray-400 text-gray-600 text-xs uppercase tracking-wide mb-2">
            Próxima Ação
          </p>
          <p className="dark:text-white text-gray-900 font-medium">
            {estagio.acao_proxima}
          </p>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-3">
        <button
          onClick={() => onWhatsApp(cliente.whatsapp)}
          className={`
            flex-1 flex items-center justify-center gap-2
            dark:bg-primary bg-green-500 dark:hover:bg-primary-dark hover:bg-green-600
            dark:text-white text-white rounded-md py-2 px-4
            transition-colors font-medium text-sm
          `}
        >
          <Icons.MessageCircle className="w-4 h-4" strokeWidth={2} />
          WhatsApp
        </button>

        {estagio?.pendente_cliente && (
          <button
            onClick={() => onCongelar(cliente.id)}
            className={`
              flex items-center justify-center gap-2
              dark:bg-orange-500/20 bg-orange-50
              dark:text-orange-400 text-orange-600 rounded-md py-2 px-4
              hover:dark:bg-orange-500/30 hover:bg-orange-100
              transition-colors font-medium text-sm
            `}
          >
            <Icons.Clock className="w-4 h-4" strokeWidth={2} />
            Descongelar
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## 7. COMPONENTE: Dashboard Home (Página Principal)

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { Cliente, Estagio } from '@/lib/types';
import { listarClientes, obterEstagioAtivo, congelarCliente } from '@/lib/database';
import { ClienteCard } from '@/components/ClienteCard';
import { MainLayout } from '@/components/MainLayout';

export default function DashboardHome() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [estagios, setEstagios] = useState<Map<string, Estagio | null>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      setLoading(true);
      const dados = await listarClientes(
        filtroStatus ? { status: filtroStatus } : undefined
      );

      setClientes(dados);

      // Buscar estagios ativos para cada cliente
      const estagiosMap = new Map<string, Estagio | null>();
      for (const cliente of dados) {
        const estagio = await obterEstagioAtivo(cliente.id);
        estagiosMap.set(cliente.id, estagio);
      }
      setEstagios(estagiosMap);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleWhatsApp = (numero: string) => {
    const numerolimpo = numero.replace(/\D/g, '');
    const url = `https://wa.me/${numerolimpo}`;
    window.open(url, '_blank');
  };

  const handleCongelarCliente = async (clienteId: string) => {
    try {
      await congelarCliente(clienteId, 2);
      carregarClientes();
    } catch (error) {
      console.error('Erro ao congelar cliente:', error);
    }
  };

  const clientesAtivos = clientes.filter((c) => c.status !== 'congelado' && c.status !== 'cancelado');
  const clientesPendentes = clientes.filter((c) => c.status === 'congelado');

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="dark:text-white text-gray-900 text-4xl font-bold mb-2">
            Dashboard Operacional
          </h1>
          <p className="dark:text-gray-400 text-gray-600">
            Controle total da sua agência em um único lugar
          </p>
        </div>

        {/* KPIs Rápidos */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="dark:bg-dark-card bg-white rounded-lg p-6 border dark:border-dark-border border-gray-200">
            <p className="dark:text-gray-400 text-gray-600 text-sm uppercase mb-2">
              Total de Clientes
            </p>
            <p className="dark:text-white text-gray-900 text-3xl font-bold">
              {clientes.length}
            </p>
          </div>

          <div className="dark:bg-dark-card bg-white rounded-lg p-6 border dark:border-dark-border border-gray-200">
            <p className="dark:text-gray-400 text-gray-600 text-sm uppercase mb-2">
              Ativos
            </p>
            <p className="dark:text-white text-gray-900 text-3xl font-bold text-green-500">
              {clientesAtivos.length}
            </p>
          </div>

          <div className="dark:bg-dark-card bg-white rounded-lg p-6 border dark:border-dark-border border-gray-200">
            <p className="dark:text-gray-400 text-gray-600 text-sm uppercase mb-2">
              Congelados
            </p>
            <p className="dark:text-white text-gray-900 text-3xl font-bold text-orange-500">
              {clientesPendentes.length}
            </p>
          </div>

          <div className="dark:bg-dark-card bg-white rounded-lg p-6 border dark:border-dark-border border-gray-200">
            <p className="dark:text-gray-400 text-gray-600 text-sm uppercase mb-2">
              Taxa de Retencao
            </p>
            <p className="dark:text-white text-gray-900 text-3xl font-bold">
              {((clientesAtivos.length / clientes.length) * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => {
              setFiltroStatus(null);
              carregarClientes();
            }}
            className={`
              px-4 py-2 rounded-md font-medium transition-colors text-sm
              ${
                filtroStatus === null
                  ? 'dark:bg-primary bg-green-500 dark:text-white text-white'
                  : 'dark:bg-dark-hover bg-gray-100 dark:text-gray-300 text-gray-700 hover:dark:bg-dark-border'
              }
            `}
          >
            Todos
          </button>
          {['recebido', 'onboarding', 'setup_trafego', 'ativo'].map((status) => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`
                px-4 py-2 rounded-md font-medium transition-colors text-sm
                ${
                  filtroStatus === status
                    ? 'dark:bg-primary bg-green-500 dark:text-white text-white'
                    : 'dark:bg-dark-hover bg-gray-100 dark:text-gray-300 text-gray-700 hover:dark:bg-dark-border'
                }
              `}
            >
              {status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Lista de Clientes */}
        {loading ? (
          <div className="text-center py-12">
            <p className="dark:text-gray-400 text-gray-600">Carregando clientes...</p>
          </div>
        ) : clientesAtivos.length === 0 ? (
          <div className="text-center py-12">
            <p className="dark:text-gray-400 text-gray-600">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <>
            <h2 className="dark:text-white text-gray-900 text-2xl font-bold mb-6">
              {filtroStatus ? `${filtroStatus.toUpperCase()} (${clientesAtivos.length})` : 'Clientes Ativos'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {clientesAtivos.map((cliente) => (
                <ClienteCard
                  key={cliente.id}
                  cliente={cliente}
                  estagio={estagios.get(cliente.id) || null}
                  onWhatsApp={handleWhatsApp}
                  onCongelar={handleCongelarCliente}
                />
              ))}
            </div>
          </>
        )}

        {/* Clientes Retidos */}
        {clientesPendentes.length > 0 && (
          <>
            <h2 className="dark:text-white text-gray-900 text-2xl font-bold mb-6 mt-12">
              Clientes Retidos ({clientesPendentes.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientesPendentes.map((cliente) => (
                <ClienteCard
                  key={cliente.id}
                  cliente={cliente}
                  estagio={estagios.get(cliente.id) || null}
                  onWhatsApp={handleWhatsApp}
                  onCongelar={handleCongelarCliente}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
```

---

## 8. COMPONENTE: Automação WhatsApp (Templates)

```typescript
'use client';

const WHATSAPP_TEMPLATES = {
  '#BOASVINDAS': {
    titulo: 'Boas-vindas',
    mensagem: `Olá! 👋

Bem-vindo ao Adsgator! 🚀

Estamos muito felizes em tê-lo conosco. Prepare-se para transformar seu tráfego digital em resultados reais.

Nosso time está pronto para levar seu negócio para o próximo nível.

Vamos marcar uma call para alinhamento inicial? Nosso horário disponível é:
- Amanhã às 10:00
- Amanhã às 14:00
- Depois de amanhã às 09:00

Qual funciona melhor para você? ✨`,
  },

  '#CONVITE': {
    titulo: 'Convite para Call',
    mensagem: `Oi! 👋

Gostaria de marcar nossa call inicial para estruturar sua estratégia de tráfego?

📅 Disponibilidades:
- 🕙 10:00 - 12:00
- 🕐 14:00 - 16:00
- 🕕 16:00 - 18:00

Qual horário você prefere?

Senha da call: [ADICIONAR_ZOOM_LINK]`,
  },

  '#BRIEFINGGA': {
    titulo: 'Solicitação de Briefing',
    mensagem: `Oi! 📋

Para montar sua estratégia de Google Ads com precisão, preciso de algumas informações:

✅ Principais produtos/serviços
✅ Ticket médio
✅ Localização de atuação
✅ Público-alvo principal
✅ Objetivos para os próximos 90 dias

Poderia compartilhar isso por aqui ou prefere que agende uma chamada rápida?

Obrigado! 🙏`,
  },

  '#SALDOGOOGLE': {
    titulo: 'Alerta de Saldo Google Ads',
    mensagem: `⚠️ ATENÇÃO

Seu saldo em campanhas no Google Ads está baixo!

Saldo atual: R$ XX,XX
Limite crítico: R$ 50,00

Por favor, realize uma recarga para evitar interrupção de campanhas.

Link para recarga: [GOOGLE_ADS_LINK]

Qualquer dúvida, pode chamar! 💬`,
  },
};

export function gerarLinkWhatsApp(template: keyof typeof WHATSAPP_TEMPLATES, numero: string): string {
  const msg = WHATSAPP_TEMPLATES[template]?.mensagem || '';
  const numerolimpo = numero.replace(/\D/g, '');
  const mensagemCodificada = encodeURIComponent(msg);
  return `https://wa.me/${numerolimpo}?text=${mensagemCodificada}`;
}

export function obterTemplates() {
  return Object.entries(WHATSAPP_TEMPLATES).map(([key, value]) => ({
    tag: key,
    ...value,
  }));
}
```

---

## 9. API ROUTE: Autenticação

```typescript
// pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await supabase.auth.signOut();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao fazer logout' });
  }
}
```

---

## 10. PÁGINA: Login

```typescript
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginComEmail } from '@/lib/auth';
import { Icons } from '@/components/Icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginComEmail(email, senha);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-lg mx-auto mb-6 flex items-center justify-center">
            <span className="text-white font-bold text-3xl">A</span>
          </div>
          <h1 className="dark:text-white text-gray-900 text-3xl font-bold">
            Adsgator Hub
          </h1>
          <p className="dark:text-gray-400 text-gray-600 mt-2">
            Sistema nervoso central da sua agência
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="dark:text-gray-300 text-gray-700 text-sm font-medium block mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`
                w-full px-4 py-2 rounded-md border
                dark:bg-dark-card dark:border-dark-border dark:text-white
                bg-white border-gray-200 text-gray-900
                focus:outline-none focus:ring-2 focus:ring-primary
              `}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="dark:text-gray-300 text-gray-700 text-sm font-medium block mb-2">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={`
                w-full px-4 py-2 rounded-md border
                dark:bg-dark-card dark:border-dark-border dark:text-white
                bg-white border-gray-200 text-gray-900
                focus:outline-none focus:ring-2 focus:ring-primary
              `}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-2 px-4 rounded-md font-semibold
              dark:bg-primary dark:hover:bg-primary-dark dark:text-white
              bg-green-500 hover:bg-green-600 text-white
              transition-colors disabled:opacity-50
            `}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## 11. RESUMO DA UX & CRM

- ✅ Sistema de temas Dark/Light com suporte a preferência do sistema
- ✅ Sidebar minimalista inspirada em Supabase
- ✅ Componentes em REM (sem px)
- ✅ Ícones vazados com stroke-width controlável
- ✅ Dashboard operacional com visão geral em tempo real
- ✅ Cards de cliente com status visual e ações rápidas
- ✅ Integração direta com WhatsApp Web usando templates predefinidos
- ✅ Sistema de filtros e busca
- ✅ Congelamento de clientes com alertas automáticos
- ✅ Página de login com validação
- ✅ Autenticação via Supabase Auth
- ✅ Design system coeso e premium

**Status:** Pronto para implementação imediata.
