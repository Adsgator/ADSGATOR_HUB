'use client'

import React, { useEffect, useState } from 'react'
import { CalendarClock, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CronSetting {
  tipo:       string
  nome:       string
  descricao:  string | null
  ativo:      boolean
  horario:    string          // 'HH:mm:ss' (time do Postgres)
  ultimo_run: string | null
}

export function Agendamentos() {
  const [settings, setSettings] = useState<CronSetting[]>([])
  const [migrationPendente, setMigrationPendente] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState<string | null>(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    try {
      const res = await fetch('/api/v1/cron-settings')
      const json = await res.json()
      setSettings(json.settings ?? [])
      setMigrationPendente(json.migration_pendente === true || (json.settings ?? []).length === 0)
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err)
    } finally {
      setCarregando(false)
    }
  }

  async function salvar(tipo: string, patch: { ativo?: boolean; horario?: string }) {
    setAtualizando(tipo)
    try {
      const res = await fetch('/api/v1/cron-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, ...patch }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao salvar')

      setSettings((prev) => prev.map((s) => (s.tipo === tipo ? { ...s, ...json.setting } : s)))
      toast.success('Agendamento atualizado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar agendamento')
    } finally {
      setAtualizando(null)
    }
  }

  function formatarData(data: string | null): string {
    if (!data) return 'Nunca'
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    })
  }

  if (carregando) return null

  return (
    <div>
      <h3 className="text-ink-primary text-[1rem] font-semibold mb-[1rem] flex items-center gap-[0.5rem]">
        <CalendarClock className="w-[1.125rem] h-[1.125rem]" strokeWidth={2} />
        Agendamentos
      </h3>

      {migrationPendente ? (
        <p className="text-ink-secondary text-[0.875rem] p-[1rem] bg-surface-card border border-surface-border rounded-lg">
          A tabela de agendamentos ainda não existe — aplique a migration{' '}
          <span className="font-medium">20260615_cron_settings.sql</span> no SQL Editor do
          Supabase. Até lá, os jobs rodam nos horários padrão.
        </p>
      ) : (
        <div className="space-y-[0.75rem]">
          {settings.map((s) => (
            <div
              key={s.tipo}
              className="flex items-start justify-between gap-[1rem] p-[1rem] bg-surface-card border border-surface-border rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[0.5rem]">
                  <p className="text-ink-primary text-[0.875rem] font-medium">{s.nome}</p>
                  <span
                    className={cn(
                      'px-[0.5rem] py-[0.125rem] rounded-full text-[0.625rem] font-medium',
                      s.ativo
                        ? 'bg-status-green/10 text-status-green'
                        : 'bg-status-red/10 text-status-red'
                    )}
                  >
                    {s.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {s.descricao && (
                  <p className="text-ink-secondary text-[0.75rem] mt-[0.25rem]">{s.descricao}</p>
                )}
                <p className="text-ink-muted text-[0.75rem] mt-[0.5rem] flex items-center gap-[0.25rem]">
                  <Clock className="w-[0.625rem] h-[0.625rem]" />
                  Último run: {formatarData(s.ultimo_run)}
                </p>
              </div>

              <div className="flex items-center gap-[0.75rem] flex-shrink-0">
                <label className="flex flex-col items-end gap-[0.25rem]">
                  <span className="text-ink-muted text-[0.625rem]">Horário de Brasília</span>
                  <input
                    type="time"
                    defaultValue={String(s.horario).slice(0, 5)}
                    disabled={atualizando === s.tipo}
                    onBlur={(e) => {
                      const novo = e.target.value
                      if (novo && novo !== String(s.horario).slice(0, 5)) {
                        salvar(s.tipo, { horario: novo })
                      }
                    }}
                    className="bg-surface-elevated border border-surface-border rounded-md px-[0.5rem] py-[0.25rem] text-[0.875rem] text-ink-primary focus-ring"
                  />
                </label>
                <button
                  onClick={() => salvar(s.tipo, { ativo: !s.ativo })}
                  disabled={atualizando === s.tipo}
                  className={cn(
                    'relative w-[2.75rem] h-[1.5rem] rounded-full transition-colors flex-shrink-0',
                    s.ativo ? 'bg-ads-500' : 'bg-surface-hover border border-surface-border',
                    atualizando === s.tipo && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-[0.1875rem] left-[0.1875rem] w-[1.125rem] h-[1.125rem] rounded-full bg-white shadow transition-transform',
                      s.ativo && 'translate-x-[1.25rem]'
                    )}
                  />
                </button>
              </div>
            </div>
          ))}
          <p className="text-ink-muted text-[0.75rem]">
            O dispatcher verifica a cada 30 min — o job roda na primeira janela após o horário
            configurado.
          </p>
        </div>
      )}
    </div>
  )
}
