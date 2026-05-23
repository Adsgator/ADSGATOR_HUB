import { create } from 'zustand'
import type { Notificacao } from '@/lib/types'

interface ConfiguracoesUsuario {
  tema:     'dark' | 'light' | 'system'
  idioma:   string
  timezone: string
}

interface AppStore {
  // ── Notificações ─────────────────────────────────────────────
  notificacoes:          Notificacao[]
  setNotificacoes:       (ns: Notificacao[]) => void
  adicionarNotificacao:  (n: Notificacao)    => void
  marcarLida:            (id: string)        => void
  marcarTodasLidas:      ()                  => void

  // ── Alertas críticos (Dashboard + NotificationBell) ───────────
  alertasCriticos:     string[]
  setAlertasCriticos:  (a: string[]) => void

  // ── Configurações do usuário ──────────────────────────────────
  configuracoes: ConfiguracoesUsuario
  setConfiguracoes: (c: Partial<ConfiguracoesUsuario>) => void
}

export const useAppStore = create<AppStore>((set) => ({
  // Notificações
  notificacoes:    [],
  setNotificacoes: (ns)  => set({ notificacoes: ns }),
  adicionarNotificacao: (n) =>
    set((s) => ({ notificacoes: [n, ...s.notificacoes].slice(0, 50) })),
  marcarLida: (id) =>
    set((s) => ({ notificacoes: s.notificacoes.filter((n) => n.id !== id) })),
  marcarTodasLidas: () => set({ notificacoes: [] }),

  // Alertas críticos
  alertasCriticos:    [],
  setAlertasCriticos: (a) => set({ alertasCriticos: a }),

  // Configurações
  configuracoes: { tema: 'dark', idioma: 'pt-BR', timezone: 'America/Sao_Paulo' },
  setConfiguracoes: (c) =>
    set((s) => ({ configuracoes: { ...s.configuracoes, ...c } })),
}))
