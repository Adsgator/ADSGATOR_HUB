'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

interface BriefingData {
  texto:      string
  gerado_em:  string
}

const CACHE_KEY     = 'adsgator_briefing'
const CACHE_MAX_AGE = 6 * 60 * 60 * 1000

function cacheValido(item: { gerado_em: string } | null): boolean {
  if (!item) return false
  return Date.now() - new Date(item.gerado_em).getTime() < CACHE_MAX_AGE
}

export function MorningBriefing() {
  const [briefing,  setBriefing]  = useState<BriefingData | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [expandido, setExpandido] = useState(false)

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
    } catch { }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const linhas = briefing?.texto.split('\n').filter(Boolean) ?? []
  const preview = linhas.slice(0, 3)
  const resto   = linhas.slice(3)

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] flex flex-col gap-[0.75rem]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[0.5rem]">
          <Sparkles className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={1.75} />
          <p className="text-ink-primary text-[0.875rem] font-semibold">Morning Briefing</p>
        </div>
        <button
          onClick={() => carregar(true)}
          disabled={loading}
          className="w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded hover:bg-surface-hover text-ink-muted hover:text-ink-primary transition-colors disabled:opacity-40"
          title="Atualizar briefing"
        >
          <RefreshCw className={`w-[0.75rem] h-[0.75rem] ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
        </button>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="space-y-[0.375rem]">
          {[100, 85, 70].map((w) => (
            <div key={w} className={`h-[0.875rem] rounded bg-surface-hover animate-pulse`} style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : briefing ? (
        <div>
          <div className="space-y-[0.375rem]">
            {preview.map((linha, i) => (
              <p key={i} className="text-ink-secondary text-[0.8125rem] leading-relaxed">{linha}</p>
            ))}
          </div>
          {resto.length > 0 && (
            <>
              {expandido && (
                <div className="mt-[0.375rem] space-y-[0.375rem]">
                  {resto.map((linha, i) => (
                    <p key={i} className="text-ink-secondary text-[0.8125rem] leading-relaxed">{linha}</p>
                  ))}
                </div>
              )}
              <button
                onClick={() => setExpandido((v) => !v)}
                className="mt-[0.5rem] flex items-center gap-[0.25rem] text-ads-500 text-[0.75rem] font-medium hover:opacity-80 transition-opacity"
              >
                {expandido ? <ChevronUp className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} /> : <ChevronDown className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />}
                {expandido ? 'Ver menos' : 'Ver mais'}
              </button>
            </>
          )}
          {briefing.gerado_em && (
            <p className="text-ink-muted text-[0.6875rem] mt-[0.5rem]">
              {new Date(briefing.gerado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      ) : (
        <p className="text-ink-muted text-[0.8125rem] italic">Clique em atualizar para gerar o briefing de hoje.</p>
      )}
    </div>
  )
}
