'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, X, User, CheckSquare,
  DollarSign, Clock, ArrowRight,
} from 'lucide-react'

interface ResultCliente    { id: string; nome: string; email: string; nicho: string; status: string }
interface ResultTarefa     { id: string; titulo: string; prioridade: string; data_prazo: string | null; status: string }
interface ResultLancamento { id: string; descricao: string; valor: number; tipo: string; data: string }
interface ResultHistorico  { id: string; descricao: string; tipo: string; created_at: string; cliente_id: string | null }

interface Resultados {
  clientes:    ResultCliente[]
  tarefas:     ResultTarefa[]
  lancamentos: ResultLancamento[]
  historico:   ResultHistorico[]
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

interface Props {
  onClose: () => void
}

export function GlobalSearch({ onClose }: Props) {
  const router               = useRouter()
  const inputRef             = useRef<HTMLInputElement>(null)
  const [query,    setQuery] = useState('')
  const [results,  setResults]  = useState<Resultados | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [cursor,   setCursor]   = useState(0)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const buscar = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json() as Resultados
      setResults(data)
      setCursor(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => buscar(query), 300)
    return () => clearTimeout(t)
  }, [query, buscar])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const total =
    (results?.clientes.length    ?? 0) +
    (results?.tarefas.length     ?? 0) +
    (results?.lancamentos.length ?? 0) +
    (results?.historico.length   ?? 0)

  function navegar(href: string) {
    router.push(href)
    onClose()
  }

  const temResultados = results && total > 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-[1rem]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface-card border border-surface-border rounded-xl shadow-2xl w-full max-w-[38rem] overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-[0.75rem] px-[1rem] py-[0.875rem] border-b border-surface-border">
          <Search className="w-[1rem] h-[1rem] text-ink-muted shrink-0" strokeWidth={1.75} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar clientes, tarefas, transações…"
            className="flex-1 bg-transparent text-ink-primary text-[0.9375rem] placeholder:text-ink-muted focus:outline-none"
          />
          {loading && (
            <div className="w-[0.875rem] h-[0.875rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          {!loading && query && (
            <button onClick={() => setQuery('')} className="text-ink-muted hover:text-ink-secondary transition-colors">
              <X className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center h-[1.25rem] px-[0.375rem] rounded bg-surface-hover border border-surface-border text-[0.625rem] text-ink-muted font-mono shrink-0">
            ESC
          </kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <p className="text-ink-muted text-[0.8125rem] text-center py-[2.5rem]">
              Digite para buscar em toda a plataforma
            </p>
          )}

          {query.length >= 2 && !loading && !temResultados && (
            <p className="text-ink-muted text-[0.8125rem] text-center py-[2.5rem]">
              Nenhum resultado para <strong className="text-ink-secondary">"{query}"</strong>
            </p>
          )}

          {temResultados && (
            <div className="py-[0.5rem]">

              {/* Clientes */}
              {results.clientes.length > 0 && (
                <div>
                  <p className="text-ink-muted text-[0.625rem] font-semibold uppercase tracking-wide px-[1rem] py-[0.375rem]">Clientes</p>
                  {results.clientes.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navegar(`/clientes/${c.id}`)}
                      className="w-full flex items-center gap-[0.75rem] px-[1rem] py-[0.625rem] hover:bg-surface-hover transition-colors text-left"
                    >
                      <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-ads-500/15 flex items-center justify-center shrink-0">
                        <User className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ink-primary text-[0.875rem] font-medium truncate">{c.nome}</p>
                        <p className="text-ink-muted text-[0.75rem] truncate">{c.nicho} · {c.email}</p>
                      </div>
                      <ArrowRight className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                    </button>
                  ))}
                </div>
              )}

              {/* Tarefas */}
              {results.tarefas.length > 0 && (
                <div>
                  <p className="text-ink-muted text-[0.625rem] font-semibold uppercase tracking-wide px-[1rem] py-[0.375rem] mt-[0.25rem]">Tarefas</p>
                  {results.tarefas.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navegar('/tarefas')}
                      className="w-full flex items-center gap-[0.75rem] px-[1rem] py-[0.625rem] hover:bg-surface-hover transition-colors text-left"
                    >
                      <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-status-blue/15 flex items-center justify-center shrink-0">
                        <CheckSquare className="w-[0.875rem] h-[0.875rem] text-status-blue" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ink-primary text-[0.875rem] font-medium truncate">{t.titulo}</p>
                        <p className="text-ink-muted text-[0.75rem]">
                          {t.prioridade}
                          {t.data_prazo ? ` · ${new Date(t.data_prazo).toLocaleDateString('pt-BR')}` : ''}
                        </p>
                      </div>
                      <ArrowRight className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                    </button>
                  ))}
                </div>
              )}

              {/* Lançamentos */}
              {results.lancamentos.length > 0 && (
                <div>
                  <p className="text-ink-muted text-[0.625rem] font-semibold uppercase tracking-wide px-[1rem] py-[0.375rem] mt-[0.25rem]">Financeiro</p>
                  {results.lancamentos.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => navegar('/financeiro')}
                      className="w-full flex items-center gap-[0.75rem] px-[1rem] py-[0.625rem] hover:bg-surface-hover transition-colors text-left"
                    >
                      <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-status-green/15 flex items-center justify-center shrink-0">
                        <DollarSign className="w-[0.875rem] h-[0.875rem] text-status-green" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ink-primary text-[0.875rem] font-medium truncate">{l.descricao}</p>
                        <p className="text-ink-muted text-[0.75rem]">
                          {fmt(l.valor)} · {new Date(l.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <ArrowRight className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                    </button>
                  ))}
                </div>
              )}

              {/* Histórico */}
              {results.historico.length > 0 && (
                <div>
                  <p className="text-ink-muted text-[0.625rem] font-semibold uppercase tracking-wide px-[1rem] py-[0.375rem] mt-[0.25rem]">Histórico</p>
                  {results.historico.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => navegar(h.cliente_id ? `/clientes/${h.cliente_id}` : '/dashboard')}
                      className="w-full flex items-center gap-[0.75rem] px-[1rem] py-[0.625rem] hover:bg-surface-hover transition-colors text-left"
                    >
                      <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-surface-hover flex items-center justify-center shrink-0">
                        <Clock className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ink-primary text-[0.875rem] truncate">{h.descricao}</p>
                        <p className="text-ink-muted text-[0.75rem]">
                          {h.tipo} · {new Date(h.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <ArrowRight className="w-[0.75rem] h-[0.75rem] text-ink-muted shrink-0" strokeWidth={1.75} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {temResultados && (
          <div className="border-t border-surface-border px-[1rem] py-[0.5rem] flex items-center gap-[1rem]">
            <span className="text-ink-muted text-[0.6875rem]">{total} resultado{total !== 1 ? 's' : ''}</span>
            <span className="text-ink-muted text-[0.6875rem] ml-auto">↑↓ navegar · Enter selecionar · Esc fechar</span>
          </div>
        )}
      </div>
    </div>
  )
}
