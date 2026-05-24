'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme:    Theme;
  setTheme: (t: Theme) => void;
  isDark:   boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme,  setThemeState] = useState<Theme>('light');
  const [isDark, setIsDark]     = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem('adsgator-theme') as Theme) ?? 'light';
    aplicarTema(saved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function aplicarTema(t: Theme) {
    setThemeState(t);
    localStorage.setItem('adsgator-theme', t);
    const prefersD = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const ativo = t === 'system' ? prefersD : t === 'dark';
    setIsDark(ativo);
    document.documentElement.classList.toggle('dark', ativo);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: aplicarTema, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme fora do ThemeProvider');
  return ctx;
}
