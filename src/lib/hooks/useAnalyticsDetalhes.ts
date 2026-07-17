import { useCallback, useEffect, useRef, useState } from 'react'
import type { Periodo } from '@/lib/analytics-periodo'

// ─── Hook dos cortes do Analytics 2.0 ────────────────────────────────────────
// Busca UMA dimensão em GET /api/analytics/[id]/detalhes (cache no servidor,
// TTL na rota). Cada card do dashboard usa uma instância — carregamento e erro
// são por seção, então uma fonte fora do ar não derruba o resto da tela.

export interface MetaDetalhe {
  atualizadoEm: string
  cache: 'hit' | 'renovado' | 'desatualizado'
  erro?: string // presente quando 'desatualizado' (renovação falhou)
}

interface Params {
  clienteId:   string
  fonte:       'ads' | 'ga4'
  dimensao:    string
  periodo:     Periodo
  campanhaId?: string
  /** Incrementar força renovação (bypass do cache) em todas as seções. */
  renovarTick?: number
  /** false pausa o fetch (ex.: integração desligada). */
  ativo?: boolean
}

export function useDetalheAnalytics<T>(p: Params) {
  const [dados, setDados]           = useState<T | null>(null)
  const [meta, setMeta]             = useState<MetaDetalhe | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro]             = useState<string | null>(null)
  const seq = useRef(0) // descarta resposta atrasada de um fetch anterior

  const { clienteId, fonte, dimensao, campanhaId, ativo } = p
  const { inicio, fim } = p.periodo

  const carregar = useCallback(async (renovar: boolean) => {
    const id = ++seq.current
    setCarregando(true)
    setErro(null)
    try {
      const qs = new URLSearchParams({ fonte, dimensao, inicio, fim })
      if (campanhaId) qs.set('campanha', campanhaId)
      if (renovar) qs.set('renovar', '1')
      const res = await fetch(`/api/analytics/${clienteId}/detalhes?${qs.toString()}`)
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      if (id !== seq.current) return
      setDados(json.payload as T)
      setMeta({ atualizadoEm: json.atualizadoEm, cache: json.cache, erro: json.erro })
    } catch (e) {
      if (id !== seq.current) return
      setErro(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      if (id === seq.current) setCarregando(false)
    }
  }, [clienteId, fonte, dimensao, inicio, fim, campanhaId])

  useEffect(() => {
    if (ativo === false || !clienteId) return
    carregar(false)
  }, [carregar, ativo, clienteId])

  // renovarTick só dispara quando MUDA (não no mount nem na troca de período)
  const tickAnterior = useRef(p.renovarTick ?? 0)
  const renovarTick = p.renovarTick ?? 0
  useEffect(() => {
    if (renovarTick !== tickAnterior.current) {
      tickAnterior.current = renovarTick
      carregar(true)
    }
  }, [renovarTick, carregar])

  return { dados, meta, carregando, erro, recarregar: () => carregar(true) }
}
