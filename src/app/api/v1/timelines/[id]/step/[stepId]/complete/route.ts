import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dispararEmailAutomatico } from '@/lib/email-automation'
import type { EmailTemplateId } from '@/lib/types/email'

// Etapas do onboarding que disparam email ao cliente (mesmos stepId nos 3
// modelos: combo, só-tráfego, só-LP). Controlado pelo toggle email_onboarding.
const STEP_PARA_EMAIL: Record<string, EmailTemplateId> = {
  confirma_briefing: 'onboarding-briefing-recebido',
  aprovacao:         'onboarding-pagina-pronta',
  entrega:           'onboarding-pagina-pronta',
  acessos_google:    'onboarding-acessos-google',
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id, stepId } = await params
  const body = await request.json().catch(() => { console.warn('[timelines/step/complete] body JSON inválido — usando vazio'); return {} })
  const formData: Record<string, unknown> = body.data ?? {}

  // Fetch instance + template
  const { data: instance, error: instError } = await supabase
    .from('timeline_instances')
    .select('*, template:timeline_templates(*)')
    .eq('id', id)
    .single()

  if (instError || !instance) return NextResponse.json({ error: 'Instância não encontrada' }, { status: 404 })

  const steps = (instance.template?.steps ?? []) as Array<{ id: string; order: number; prerequisite?: string }>
  const sorted = [...steps].sort((a, b) => a.order - b.order)

  const currentIdx = sorted.findIndex(s => s.id === stepId)
  if (currentIdx === -1) return NextResponse.json({ error: 'Step não encontrado' }, { status: 404 })

  const completedSteps: string[] = instance.completed_steps ?? []
  if (completedSteps.includes(stepId)) {
    return NextResponse.json({ error: 'Step já concluído' }, { status: 400 })
  }

  // Find next step (skip already completed, respect prerequisites)
  let nextStepId: string | null = null
  for (let i = currentIdx + 1; i < sorted.length; i++) {
    const s = sorted[i]
    if (completedSteps.includes(s.id)) continue
    if (s.prerequisite && !completedSteps.includes(s.prerequisite) && s.prerequisite !== stepId) continue
    nextStepId = s.id
    break
  }

  const newCompleted = [...completedSteps, stepId]
  const isFinished = nextStepId === null

  const updateData: Record<string, unknown> = {
    completed_steps: newCompleted,
    current_step_id: nextStepId,
    data: { ...(instance.data ?? {}), ...formData },
    updated_at: new Date().toISOString(),
  }
  if (isFinished) updateData.completed_at = new Date().toISOString()

  const { data: updated, error: updateError } = await supabase
    .from('timeline_instances')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Integração com o cliente: campos do onboarding que correspondem a colunas de
  // `clientes` são gravados no cadastro (alimenta a completude). O onboarding não
  // fica isolado — o que você anota numa etapa atualiza o cliente.
  if (instance.client_id) {
    const CAMPO_PARA_CLIENTE: Record<string, string> = {
      google_ads_customer_id: 'google_ads_customer_id',
      ga4_property_id:        'ga4_property_id',
      google_ads_perfil_url:  'google_ads_perfil_url',
      dominio:                'dominio',
      website:                'website',
    }
    const patchCliente: Record<string, unknown> = {}
    for (const [campoForm, valor] of Object.entries(formData)) {
      const col = CAMPO_PARA_CLIENTE[campoForm]
      if (col && typeof valor === 'string' && valor.trim()) patchCliente[col] = valor.trim()
    }
    // Onboarding concluído → cliente entra na operação (ativo)
    if (isFinished && instance.type === 'onboarding') {
      patchCliente.status = 'ativo'
    }
    if (Object.keys(patchCliente).length > 0) {
      await supabase.from('clientes').update(patchCliente).eq('id', instance.client_id)
    }
  }

  // Audit log
  await supabase.from('timeline_audit_log').insert([{
    instance_id: id,
    action: 'step_completed',
    details: { step_id: stepId, next_step_id: nextStepId, completed: isFinished },
    changed_by: user.id,
  }])

  // Step analytics
  await supabase.from('timeline_step_analytics').insert([{
    template_id: instance.template_id,
    step_id: stepId,
    instance_id: id,
    client_id: instance.client_id,
    started_at: instance.updated_at ?? new Date().toISOString(),
    completed_at: new Date().toISOString(),
    status: 'completed',
  }])

  // F2: email automático de onboarding ao concluir a etapa correspondente.
  // Só dispara se o toggle email_onboarding estiver ativo (dispararEmailAutomatico
  // checa) e o cliente tiver email. Não bloqueia a resposta em caso de falha.
  let emailDisparado = false
  const templateOnboarding = STEP_PARA_EMAIL[stepId]
  if (templateOnboarding && instance.client_id) {
    try {
      const { data: cli } = await supabase
        .from('clientes')
        .select('nome, email')
        .eq('id', instance.client_id)
        .maybeSingle()
      if (cli?.email) {
        const r = await dispararEmailAutomatico(supabase, {
          tipo: 'email_onboarding',
          templateId: templateOnboarding,
          destinatario: cli.email,
          clienteId: instance.client_id,
          variables: { nome_cliente: cli.nome ?? '' },
        })
        emailDisparado = r.enviado
      }
    } catch (err) {
      console.error('[onboarding email] falha não crítica:', err)
    }
  }

  return NextResponse.json({
    data: updated,
    completed: isFinished,
    next_step_id: nextStepId,
    email_disparado: emailDisparado,
  })
}
