'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'

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
  const [briefing,  setBriefing]  = useState<BriefingData | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [modalAberto, setModalAberto] = useState(false)

  const carregar = useCallback(async (forcar = false) => {
    if (!forcar) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as BriefingData | null
        if (cacheValido(cached)) { setBriefing(cached); return }
      } catch { /* localStorage indisponível */ }
    }
    setLoading(true)
    try {
      const res  = await fetch('/api/ia/morning-briefing')
      const data = await res.json() as BriefingData
      setBriefing(data)
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)) } catch { }
      toast.success('Briefing atualizado!')
    } catch {
      toast.error('Erro ao atualizar briefing')
    }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const linhas = briefing?.texto.split('\n').filter(Boolean) ?? []
  const preview = linhas.slice(0, MAX_LINHAS_PREVIEW)
  const temMais = linhas.length > MAX_LINHAS_PREVIEW

  const formatarHora = (data: string) => {
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <div className="bg-surface-card border border-surface-border border-l-4 border-l-ads-500 rounded-xl rounded-l-none p-[1.25rem] flex flex-col gap-[0.75rem]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[0.5rem]">
            <Sparkles className="w-5 h-5 text-ads-500" strokeWidth={2} />
            <p className="text-ink-primary text-lg font-bold">Morning Briefing</p>
          </div>
          <button
            onClick={() => carregar(true)}
            disabled={loading}
            className="flex items-center gap-[0.375rem] px-[0.625rem] py-[0.375rem] rounded-md hover:bg-surface-hover text-ink-muted hover:text-ink-primary transition-colors disabled:opacity-40 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            <span className="hidden sm:inline">Atualizar briefing</span>
          </button>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="space-y-[0.5rem]">
            {[100, 90, 80, 70, 60].map((w, i) => (
              <div key={i} className={`h-[1rem] rounded bg-surface-hover animate-pulse`} style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : briefing ? (
          <div>
            <div className="space-y-[0.5rem]">
              {preview.map((linha, i) => (
                <p key={i} className="text-ink-secondary text-[0.9375rem] leading-relaxed">{linha}</p>
              ))}
            </div>
            {temMais && (
              <button
                onClick={() => setModalAberto(true)}
                className="mt-[0.75rem] flex items-center gap-[0.25rem] text-ads-500 text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Ver mais
              </button>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-[1rem]">
              <div className="flex items-center gap-[0.5rem]">
                <Sparkles className="w-5 h-5 text-ads-500" strokeWidth={2} />
                <p className="text-ink-primary text-lg font-bold">Morning Briefing</p>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="p-1 rounded hover:bg-surface-hover text-ink-muted hover:text-ink-primary transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
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
