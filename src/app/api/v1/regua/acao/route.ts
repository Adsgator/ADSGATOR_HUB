import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { criarClienteServiceRole } from '@/lib/supabase'
import {
  autorizarSuspensaoD7,
  dispensarSuspensaoD7,
  suspenderAssinatura,
  reativarAssinatura,
  type ResultadoEtapa,
} from '@/lib/regua-inadimplencia'

export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/regua/acao — ações manuais da régua de inadimplência, acionadas
 * pela tela do cliente. Sessão obrigatória + verificação de posse (user_id).
 * Executa com service role (igual ao cron) após confirmar o dono.
 *
 * body: { clienteId, acao: 'autorizar_suspensao' | 'pausar' | 'reativar' }
 *  - autorizar_suspensao: executa a suspensão D+7 (com email) e resolve a pendência.
 *  - pausar:   suspende a recorrência manualmente (sem email automático).
 *  - reativar: religa a assinatura (PUT ACTIVE + próxima cobrança).
 */
export async function POST(req: NextRequest) {
  const session = await createClient()
  const { data: { user }, error } = await session.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { clienteId, acao } = (await req.json().catch(() => ({}))) as { clienteId?: string; acao?: string }
  if (!clienteId || !acao) {
    return NextResponse.json({ error: 'clienteId e acao são obrigatórios' }, { status: 400 })
  }

  // Isolamento por user_id: só age sobre cliente do próprio operador.
  const { data: cli } = await session
    .from('clientes')
    .select('id')
    .eq('id', clienteId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!cli) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const db = criarClienteServiceRole()
  let resultado: ResultadoEtapa
  switch (acao) {
    case 'autorizar_suspensao':
      resultado = await autorizarSuspensaoD7(db, clienteId)
      break
    case 'dispensar_suspensao':
      resultado = await dispensarSuspensaoD7(db, clienteId)
      break
    case 'pausar':
      resultado = await suspenderAssinatura(db, clienteId, { enviarEmail: false, origem: 'manual' })
      break
    case 'reativar':
      resultado = await reativarAssinatura(db, clienteId, { origem: 'manual' })
      break
    default:
      return NextResponse.json({ error: `Ação inválida: ${acao}` }, { status: 400 })
  }

  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.motivo ?? 'Falha na ação', resultado }, { status: 502 })
  }
  return NextResponse.json({ ok: true, resultado })
}
