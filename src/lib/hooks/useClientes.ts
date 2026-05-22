'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Cliente, Estagio } from '@/lib/types'

export type ClienteComEstagio = {
  cliente: Cliente
  estagio: Estagio | null
}

export function useClientes() {
  const [dados,   setDados]   = useState<ClienteComEstagio[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: clientes, error: errClientes } = await supabase
        .from('clientes')
        .select('*')
        .neq('status', 'cancelado')
        .order('data_criacao', { ascending: false })

      if (errClientes) throw new Error(errClientes.message)

      const lista = (clientes ?? []) as Cliente[]

      if (lista.length === 0) {
        setDados([])
        return
      }

      const ids = lista.map((c) => c.id)
      const { data: estagios } = await supabase
        .from('estagios_operacionais')
        .select('*')
        .in('cliente_id', ids)
        .is('data_saida', null)

      const estagiosPorCliente = new Map<string, Estagio>()
      for (const e of (estagios ?? []) as Estagio[]) {
        if (!estagiosPorCliente.has(e.cliente_id)) {
          estagiosPorCliente.set(e.cliente_id, e)
        }
      }

      const comEstagio: ClienteComEstagio[] = lista.map((c) => ({
        cliente: c,
        estagio: estagiosPorCliente.get(c.id) ?? null,
      }))

      setDados(comEstagio)
    } catch (err) {
      console.error('[useClientes]', err)
      setError('Erro ao carregar clientes.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── REALTIME SUBSCRIPTION ────────────────────────────────────────────
  useEffect(() => {
    carregar()

    const channel = supabase
      .channel('clientes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => carregar())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estagios_operacionais' }, () => carregar())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [carregar])

  // ── MÉTRICAS DERIVADAS ───────────────────────────────────────────────
  const metricas = {
    total:        dados.length,
    ativos:       dados.filter((d) => d.cliente.status === 'ativo').length,
    retidos:      dados.filter((d) => d.cliente.status === 'congelado').length,
    recebidos:    dados.filter((d) => d.cliente.status === 'recebido').length,
    onboarding:   dados.filter((d) => d.cliente.status === 'onboarding').length,
    inadimplentes: dados.filter((d) => (d.cliente.dias_atraso ?? 0) > 0).length,
    mrr:          dados.reduce((s, d) => s + (d.cliente.mrr ?? 0), 0),
    taxaRetencao: dados.length > 0
      ? Math.round((dados.filter((d) => d.cliente.status === 'ativo').length / dados.length) * 100)
      : 0,
  }

  return { dados, loading, error, metricas, recarregar: carregar }
}
