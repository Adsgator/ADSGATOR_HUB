'use client'

import { CalendarRange } from 'lucide-react'
import type { Periodo } from '@/lib/analytics-periodo'

// ─── Filtro de período compartilhado (Ads + Site) ───────────────────────────
// O Looker tem intervalo livre ("6 de jul – 19 de jul") além de presets; aqui
// os presets viram pills e "Personalizado" abre dois <input type="date">.
// O período efetivo é sempre {inicio, fim} — periodoAnterior() funciona com
// qualquer intervalo, então nada muda na camada de dados (só UI + estado).

export type PresetPeriodo =
  | 'mes_atual' | 'mes_passado' | '7d' | '30d' | '90d' | 'este_ano'

export const PRESETS: ReadonlyArray<{ id: PresetPeriodo; label: string }> = [
  { id: 'mes_atual',   label: 'Mês atual' },
  { id: 'mes_passado', label: 'Mês passado' },
  { id: '7d',          label: '7 dias' },
  { id: '30d',         label: '30 dias' },
  { id: '90d',         label: '90 dias' },
  { id: 'este_ano',    label: 'Este ano' },
]

/** Data local (não UTC) em YYYY-MM-DD — evita virar o dia por fuso. */
export const fmtDataISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function periodoDoPreset(preset: PresetPeriodo): Periodo {
  const hoje = new Date()
  switch (preset) {
    case 'mes_atual':
      return { inicio: fmtDataISO(new Date(hoje.getFullYear(), hoje.getMonth(), 1)), fim: fmtDataISO(hoje) }
    case 'mes_passado':
      return {
        inicio: fmtDataISO(new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)),
        fim:    fmtDataISO(new Date(hoje.getFullYear(), hoje.getMonth(), 0)),
      }
    case '7d':
      return { inicio: fmtDataISO(new Date(hoje.getTime() - 6 * 86_400_000)), fim: fmtDataISO(hoje) }
    case '30d':
      return { inicio: fmtDataISO(new Date(hoje.getTime() - 29 * 86_400_000)), fim: fmtDataISO(hoje) }
    case '90d':
      return { inicio: fmtDataISO(new Date(hoje.getTime() - 89 * 86_400_000)), fim: fmtDataISO(hoje) }
    case 'este_ano':
      return { inicio: fmtDataISO(new Date(hoje.getFullYear(), 0, 1)), fim: fmtDataISO(hoje) }
  }
}

export interface EstadoPeriodo {
  modo:   'preset' | 'custom'
  preset: PresetPeriodo   // usado quando modo === 'preset'
  inicio: string          // usado quando modo === 'custom'
  fim:    string          // usado quando modo === 'custom'
}

export const estadoPeriodoPadrao = (): EstadoPeriodo => ({
  modo: 'preset', preset: 'mes_atual', inicio: '', fim: '',
})

export function periodoEfetivo(e: EstadoPeriodo): Periodo {
  return e.modo === 'custom' && e.inicio && e.fim
    ? { inicio: e.inicio, fim: e.fim }
    : periodoDoPreset(e.preset)
}

export const ehPeriodoPadrao = (e: EstadoPeriodo) =>
  e.modo === 'preset' && e.preset === 'mes_atual'

/** Nº de dias do intervalo (base do rótulo "de N dias anteriores"). */
export function diasDoPeriodo(p: Periodo): number {
  const [a0, m0, d0] = p.inicio.split('-').map(Number)
  const [a1, m1, d1] = p.fim.split('-').map(Number)
  const ms = Date.UTC(a1, m1 - 1, d1) - Date.UTC(a0, m0 - 1, d0)
  return Math.round(ms / 86_400_000) + 1
}

/** "6 de jul. de 2026" — mesmo estilo do seletor de período do Looker. */
export function fmtDataExtensa(iso: string): string {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Serialização para a URL (compartilhável / persistente) ──────────────────
const RE_CUSTOM = /^(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})$/
const RE_DATA = /^\d{4}-\d{2}-\d{2}$/

/** null quando é o padrão (para manter a URL limpa). */
export function serializarPeriodo(e: EstadoPeriodo): string | null {
  if (ehPeriodoPadrao(e)) return null
  if (e.modo === 'custom' && e.inicio && e.fim) return `${e.inicio}..${e.fim}`
  return e.preset
}

/** Lê um query param na montagem (client-only). Os dashboards nunca são SSR —
 *  só renderizam depois que os clientes carregam no client —, então é seguro
 *  ler `window` no inicializador de estado (sem risco de mismatch de hidratação). */
export function paramInicial(nome: string): string {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get(nome) ?? ''
}

export function parsePeriodo(param: string | null): EstadoPeriodo | null {
  if (!param) return null
  const custom = param.match(RE_CUSTOM)
  if (custom) {
    const [, inicio, fim] = custom
    if (fim < inicio) return null
    return { modo: 'custom', preset: 'mes_atual', inicio, fim }
  }
  if (PRESETS.some((p) => p.id === param)) {
    return { modo: 'preset', preset: param as PresetPeriodo, inicio: '', fim: '' }
  }
  return null
}

interface FiltroPeriodoProps {
  estado:   EstadoPeriodo
  onChange: (e: EstadoPeriodo) => void
}

export function FiltroPeriodo({ estado, onChange }: FiltroPeriodoProps) {
  const hoje = fmtDataISO(new Date())
  const atual = periodoEfetivo(estado)
  const custom = estado.modo === 'custom'

  function abrirCustom() {
    // inicia os inputs no período efetivo atual (não em branco)
    onChange({ modo: 'custom', preset: estado.preset, inicio: atual.inicio, fim: atual.fim })
  }

  function mudarData(campo: 'inicio' | 'fim', valor: string) {
    if (!RE_DATA.test(valor)) return
    let inicio = campo === 'inicio' ? valor : estado.inicio
    let fim    = campo === 'fim' ? valor : estado.fim
    if (fim > hoje) fim = hoje              // GA4 rejeita fim no futuro (clampFim reforça)
    if (fim < inicio) {                     // mantém início ≤ fim
      if (campo === 'inicio') fim = inicio
      else inicio = fim
    }
    onChange({ modo: 'custom', preset: estado.preset, inicio, fim })
  }

  return (
    <div className="flex items-center gap-[0.625rem] flex-wrap">
      <div className="flex bg-surface-hover border border-surface-border rounded-[0.5rem] p-[0.1875rem] gap-[0.125rem] flex-wrap">
        {PRESETS.map((p) => {
          const on = !custom && estado.preset === p.id
          return (
            <button
              key={p.id}
              onClick={() => onChange({ modo: 'preset', preset: p.id, inicio: '', fim: '' })}
              className={`h-[1.75rem] px-[0.625rem] rounded-[0.3125rem] text-[0.75rem] font-medium transition-all ${
                on ? 'bg-surface-card text-ink-primary shadow-sm' : 'text-ink-muted hover:text-ink-secondary'
              }`}
            >
              {p.label}
            </button>
          )
        })}
        <button
          onClick={abrirCustom}
          className={`inline-flex items-center gap-[0.25rem] h-[1.75rem] px-[0.625rem] rounded-[0.3125rem] text-[0.75rem] font-medium transition-all ${
            custom ? 'bg-surface-card text-ink-primary shadow-sm' : 'text-ink-muted hover:text-ink-secondary'
          }`}
        >
          <CalendarRange className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
          Personalizado
        </button>
      </div>

      {custom && (
        <div className="flex items-center gap-[0.375rem]">
          <input
            type="date"
            value={estado.inicio}
            max={estado.fim || hoje}
            onChange={(e) => mudarData('inicio', e.target.value)}
            className="h-[2.125rem] px-[0.5rem] rounded-lg bg-surface-card border border-surface-border text-[0.8125rem] text-ink-primary focus-ring"
          />
          <span className="text-ink-muted text-[0.75rem]">até</span>
          <input
            type="date"
            value={estado.fim}
            min={estado.inicio}
            max={hoje}
            onChange={(e) => mudarData('fim', e.target.value)}
            className="h-[2.125rem] px-[0.5rem] rounded-lg bg-surface-card border border-surface-border text-[0.8125rem] text-ink-primary focus-ring"
          />
        </div>
      )}
    </div>
  )
}
