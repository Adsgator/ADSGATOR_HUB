import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { provisionarClienteNovo } from '@/lib/cliente-provisioning'

/**
 * POST /api/v1/clientes/provisionar
 *
 * Retroativo: cria a tarefa "Setup do cliente" para todos os clientes
 * ativos/onboarding/setup_trafego que ainda não têm IDs Google preenchidos.
 * Idempotente — clientes que já têm a tarefa contam em `ja_existiam`.
 * Disparado pelo item clientes_pendentes da aba Setup (Configurações).
 */
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: pendentes, error } = await supabase
    .from('clientes')
    .select('id, nome')
    .eq('user_id', user.id)
    .in('status', ['ativo', 'onboarding', 'setup_trafego'])
    .or('google_ads_customer_id.is.null,ga4_property_id.is.null')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let criadas = 0
  let jaExistiam = 0
  const falhas: { nome: string; erro: string }[] = []

  for (const cliente of pendentes ?? []) {
    try {
      const r = await provisionarClienteNovo(supabase, user.id, cliente, 'retroativo')
      if (r.criada) criadas++
      else jaExistiam++
    } catch (err) {
      falhas.push({ nome: cliente.nome, erro: err instanceof Error ? err.message : String(err) })
    }
  }

  return NextResponse.json({ criadas, ja_existiam: jaExistiam, falhas })
}
