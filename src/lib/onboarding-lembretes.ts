// ─── MOTOR DE LEMBRETES DE ONBOARDING ────────────────────────────────────────
// Varre as timelines de onboarding ativas e detecta clientes "parados" numa
// etapa cuja bola está com o cliente (responsavel === 'cliente') além do limite
// definido no step (lembrete_horas, ex.: [24, 72]). Para cada limite cruzado e
// ainda não notificado, gera uma notificação no Hub com a mensagem de lembrete
// pronta — tira Lucas do escuro sem depender de WhatsApp automático.
//
// Roda pelo dispatcher (/api/v1/cron/dispatch, job 'onboarding_lembretes').
// Idempotente: cada (instância, step, limite_horas) notifica no máximo uma vez,
// controlado por marcadores em timeline_instances.data._lembretes.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { TimelineStep } from '@/lib/types/timeline'
import { interpolar, montarVars } from '@/lib/timeline-vars'

interface ClienteMin {
  id: string
  nome: string
  email?: string | null
  whatsapp?: string | null
  nicho?: string | null
  dominio?: string | null
  user_id: string
}

interface InstanceRow {
  id: string
  current_step_id: string | null
  updated_at: string | null
  data: Record<string, unknown> | null
  client_id: string | null
  template: { steps: TimelineStep[] } | null
}

export interface LembreteGerado {
  cliente: string
  step: string
  horas: number
}

const HORAS_MS = 60 * 60 * 1000

/** Marcador único de um lembrete já disparado: "<stepId>:<horas>". */
function chaveLembrete(stepId: string, horas: number): string {
  return `${stepId}:${horas}`
}

export async function processarLembretesOnboarding(
  db: SupabaseClient,
  agora: Date = new Date(),
): Promise<{ gerados: LembreteGerado[] }> {
  // Onboardings ativos com cliente associado
  const { data: instancias } = await db
    .from('timeline_instances')
    .select('id, current_step_id, updated_at, data, client_id, template:timeline_templates(steps)')
    .eq('type', 'onboarding')
    .eq('status', 'active')
    .not('client_id', 'is', null)

  const lista = (instancias ?? []) as unknown as InstanceRow[]
  if (lista.length === 0) return { gerados: [] }

  // Carrega os clientes envolvidos de uma vez
  const clienteIds = Array.from(new Set(lista.map((i) => i.client_id).filter(Boolean))) as string[]
  const { data: clientesData } = await db
    .from('clientes')
    .select('id, nome, email, whatsapp, nicho, dominio, user_id')
    .in('id', clienteIds)
  const clientePorId = new Map((clientesData ?? []).map((c) => [c.id, c as ClienteMin]))

  const gerados: LembreteGerado[] = []

  for (const inst of lista) {
    const cliente = inst.client_id ? clientePorId.get(inst.client_id) : undefined
    if (!cliente || !inst.current_step_id || !inst.updated_at) continue

    const steps = inst.template?.steps ?? []
    const step = steps.find((s) => s.id === inst.current_step_id)
    if (!step) continue

    // Só lembramos quando a bola está com o cliente e há limites definidos
    if ((step.responsavel ?? 'agencia') !== 'cliente') continue
    const limites = (step.lembrete_horas ?? []).filter((h) => h > 0).sort((a, b) => a - b)
    if (limites.length === 0) continue

    const paradoHoras = (agora.getTime() - new Date(inst.updated_at).getTime()) / HORAS_MS

    // Marcadores já disparados
    const data = (inst.data ?? {}) as Record<string, unknown>
    const jaNotificados: string[] = Array.isArray(data._lembretes) ? (data._lembretes as string[]) : []

    // Maior limite cruzado e ainda não notificado (1 notificação por varredura)
    const aDisparar = limites
      .filter((h) => paradoHoras >= h && !jaNotificados.includes(chaveLembrete(step.id, h)))
      .pop()
    if (aDisparar == null) continue

    // Monta a mensagem pronta (mesmo motor da UI)
    const vars = montarVars(cliente, inst.data ?? undefined)
    const textoBase = step.lembrete_mensagem ?? `Lembrete: ${cliente.nome} está parado na etapa "${step.title}".`
    const { texto } = interpolar(textoBase, vars)

    await db.from('notificacoes').insert({
      user_id:  cliente.user_id,
      tipo:     'alerta',
      titulo:   `⏰ ${cliente.nome} parado há ${Math.floor(paradoHoras)}h — ${step.title}`,
      mensagem: `Aguardando o cliente nesta etapa do onboarding. Mensagem de lembrete pronta:\n\n${texto}`,
      lida:     false,
    })

    // Marca como notificado (persiste em data._lembretes)
    const novosMarcadores = [...jaNotificados, chaveLembrete(step.id, aDisparar)]
    await db
      .from('timeline_instances')
      .update({ data: { ...data, _lembretes: novosMarcadores } })
      .eq('id', inst.id)

    gerados.push({ cliente: cliente.nome, step: step.title, horas: aDisparar })
  }

  return { gerados }
}
