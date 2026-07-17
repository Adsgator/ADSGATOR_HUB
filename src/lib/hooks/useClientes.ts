'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { isInadimplente } from '@/lib/cobranca'
import { calcularMRR, STATUS_ASSINATURA_ATIVA } from '@/lib/mrr'
import { STATUS_OCULTOS, isArquivado } from '@/lib/cliente-status'
import { normalizarChecklistEstagio } from '@/lib/database'
import type { Cliente, Estagio } from '@/lib/types'

export type ClienteComEstagio = {
  cliente: Cliente
  estagio: Estagio | null
}

export function useClientes(opts?: { incluirArquivados?: boolean }) {
  const incluirArquivados = opts?.incluirArquivados === true
  const [dados,   setDados]   = useState<ClienteComEstagio[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  // MRR vem das assinaturas (fonte de verdade), não de clientes.mrr — ver lib/mrr.ts
  const [mrr,     setMrr]     = useState(0)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Por padrão esconde arquivados (inativo) — clientes da operação só
      // (lib/cliente-status.ts). incluirArquivados: a lista de clientes usa
      // para o filtro "Inativo" funcionar; as métricas seguem só da operação.
      let query = supabase
        .from('clientes')
        .select('*')
        .order('data_criacao', { ascending: false })
      if (!incluirArquivados) {
        query = query.not('status', 'in', `(${STATUS_OCULTOS.join(',')})`)
      }
      const { data: clientes, error: errClientes } = await query

      if (errClientes) throw new Error(errClientes.message)

      const lista = (clientes ?? []) as Cliente[]

      if (lista.length === 0) {
        setDados([])
        setMrr(0)
        return
      }

      const ids = lista.map((c) => c.id)
      const [{ data: estagios }, { data: assinaturas }] = await Promise.all([
        supabase
          .from('estagios')
          .select('*')
          .in('cliente_id', ids)
          .eq('ativo', true),
        supabase
          .from('assinaturas')
          .select('valor_mensal, status')
          .in('status', STATUS_ASSINATURA_ATIVA),
      ])

      setMrr(calcularMRR(assinaturas ?? []))

      const estagiosPorCliente = new Map<string, Estagio>()
      for (const e of (estagios ?? []) as Estagio[]) {
        if (!estagiosPorCliente.has(e.cliente_id)) {
          estagiosPorCliente.set(e.cliente_id, normalizarChecklistEstagio(e) as Estagio)
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
  }, [incluirArquivados])

  // ── REALTIME SUBSCRIPTION ────────────────────────────────────────────
  useEffect(() => {
    carregar()

    const channel = supabase
      .channel('clientes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => carregar())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estagios' }, () => carregar())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assinaturas' }, () => carregar())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [carregar])

  // ── MÉTRICAS DERIVADAS ───────────────────────────────────────────────
  // Sempre da OPERAÇÃO: arquivado não conta em total/retenção mesmo quando
  // incluirArquivados traz eles para a listagem.
  const operacionais = dados.filter((d) => !isArquivado(d.cliente))
  const metricas = {
    total:        operacionais.length,
    ativos:       operacionais.filter((d) => d.cliente.status === 'ativo').length,
    retidos:      operacionais.filter((d) => d.cliente.status === 'congelado').length,
    recebidos:    operacionais.filter((d) => d.cliente.status === 'recebido').length,
    onboarding:   operacionais.filter((d) => d.cliente.status === 'onboarding').length,
    inadimplentes: operacionais.filter((d) => isInadimplente(d.cliente)).length,
    mrr,
    taxaRetencao: operacionais.length > 0
      ? Math.round((operacionais.filter((d) => d.cliente.status === 'ativo').length / operacionais.length) * 100)
      : 0,
  }

  return { dados, loading, error, metricas, recarregar: carregar }
}
