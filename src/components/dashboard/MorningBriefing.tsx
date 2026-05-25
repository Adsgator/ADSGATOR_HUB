'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import { SkeletonLine } from '@/components/ui/SkeletonLine'
import { Button } from '@/components/ui/Button'

type FiltroModo = 'completo' | 'urgencias' | 'resumido'

const FILTROS: { value: FiltroModo; label: string }[] = [
  { value: 'completo',  label: 'Completo'        },
  { value: 'urgencias', label: 'Só urgências'    },
  { value: 'resumido',  label: 'Resumido'         },
]

interface BriefingData {
  texto:      string
  gerado_em:  string
}

const CACHE_KEY     = 'adsgator_briefing'
const CACHE_MAX_AGE = 6 * 60 * 60 * 1000
const MAX_LINHAS_PREVIEW = 5

function cacheValido(item: { gerado_em: string } | null): boolean {
  if (!item) return false
  return Date.now() - new Date(item.gerado_em).getTime() < CACHE_MAX_AGE
}

export function MorningBriefing() {
  const [briefing,    setBriefing]    = useState<BriefingData | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [filtro,      setFiltro]      = useState<FiltroModo>('completo')

  const carregar = useCallback(async (forcar = false, modo?: FiltroModo) => {
    const modoAtual = modo ?? filtro
    const cacheKey  = `${CACHE_KEY}_${modoAtual}`
    if (!forcar) {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) ?? 'null') as BriefingData | null
        if (cacheValido(cached)) { setBriefing(cached); return }
      } catch { /* localStorage indisponível */ }
    }
    setLoading(true)
    try {
      const res  = await fetch(`/api/ia/morning-briefing?filtro=${modoAtual}`)
      const data = await res.json() as BriefingData
      setBriefing(data)
      try { localStorage.setItem(cacheKey, JSON.stringify(data)) } catch { }
      toast.success('Briefing atualizado!')
    } catch {
      toast.error('Erro ao atualizar briefing')
    } finally {
      setLoading(false)
    }
  }, [filtro])

  useEffect(() => { carregar() }, [carregar])

  function handleFiltroChange(novo: FiltroModo) {
    setFiltro(novo)
    setBriefing(null)
    carregar(false, novo)
  }

  const linhas  = briefing?.texto.split('\n').filter(Boolean) ?? []
  const preview = linhas.slice(0, MAX_LINHAS_PREVIEW)
  const temMais = linhas.length > MAX_LINHAS_PREVIEW

  const formatarHora = (data: string) =>
    new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <div className="border-l-4 border-l-ads-500 p-[1.25rem] flex flex-col gap-[0.75rem] h-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-[0.5rem]">
          <div className="flex items-center gap-[0.5rem] shrink-0">
            <Sparkles className="w-5 h-5 text-ads-500" strokeWidth={2} />
            <p className="text-ink-primary text-lg font-bold">Morning Briefing</p>
          </div>

          <div className="flex items-center gap-[0.5rem]">
            {/* Seletor de modo */}
            <select
              value={filtro}
              onChange={(e) => handleFiltroChange(e.target.value as FiltroModo)}
              disabled={loading}
              className="h-[2rem] px-[0.5rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-secondary text-[0.75rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {FILTROS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => carregar(true)}
              disabled={loading}
              icon={<RefreshCw className={`w-[0.875rem] h-[0.875rem] ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />}
            >
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <SkeletonLine width="85%" height="1rem" count={5} gap="0.5rem" />
        ) : briefing ? (
          <div>
            <div className="space-y-[0.5rem]">
              {preview.map((linha, i) => (
                <p key={i} className="text-ink-secondary text-[0.9375rem] leading-relaxed">{linha}</p>
              ))}
            </div>
            {temMais && (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setModalAberto(true)}
                className="mt-[0.75rem]"
              >
                Ver mais
              </Button>
            )}
            {briefing.gerado_em && (
              <div className="mt-[0.75rem]">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-hover text-ink-muted text-xs">
                  Gerado hoje às {formatarHora(briefing.gerado_em)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-ink-muted text-[0.9375rem] italic">Clique em atualizar para gerar o briefing de hoje.</p>
        )}
      </div>

      {/* Modal para texto completo */}
      {modalAberto && briefing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-scale"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="bg-surface-card rounded-2xl card-shadow p-[1.5rem] max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-[1rem]">
              <div className="flex items-center gap-[0.5rem]">
                <Sparkles className="w-5 h-5 text-ads-500" strokeWidth={2} />
                <p className="text-ink-primary text-lg font-bold">Morning Briefing</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalAberto(false)}
                icon={<X className="w-[1rem] h-[1rem]" strokeWidth={1.75} />}
                className="w-[2rem] px-0"
              />
            </div>
            <div className="space-y-[0.5rem]">
              {linhas.map((linha, i) => (
                <p key={i} className="text-ink-secondary text-[0.9375rem] leading-relaxed">{linha}</p>
              ))}
            </div>
            {briefing.gerado_em && (
              <p className="text-ink-muted text-xs mt-[1rem]">
                Gerado hoje às {formatarHora(briefing.gerado_em)}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
