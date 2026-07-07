import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { testarConexaoAds } from '@/lib/google-ads'
import { testarConexaoGA4 } from '@/lib/google-analytics'

export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/clientes/[id]/testar-integracao
 *
 * Valida na hora as integrações Google do cliente (query GAQL mínima +
 * runReport mínimo) e devolve ok/erro com mensagem acionável. Elimina o
 * cenário "ID errado aceito em silêncio": o Lucas cola o ID, clica em
 * Testar conexão e sabe se aquilo realmente conecta antes do sync diário.
 */

interface ResultadoTeste {
  status:   'ok' | 'erro' | 'nao_configurado'
  mensagem: string
}

function extrairMensagem(err: unknown): string {
  // google-ads-api lança um objeto com .errors[]; GA4 lança Error comum.
  const e = err as { errors?: Array<{ message?: string }>; message?: string }
  return e?.errors?.[0]?.message ?? e?.message ?? String(err)
}

function traduzirErroAds(msg: string): string {
  if (/invalid customer id/i.test(msg)) {
    return 'Customer ID inválido — confira o número (10 dígitos, com ou sem hífens).'
  }
  if (/USER_PERMISSION_DENIED|CUSTOMER_NOT_FOUND|not associated/i.test(msg)) {
    return 'Sem acesso a esta conta pelo MCC da agência — confirme que a conta do cliente está vinculada ao MCC.'
  }
  if (/AUTHENTICATION|invalid_grant|unauthorized/i.test(msg)) {
    return 'Credenciais Google Ads da agência com problema (token expirado/revogado) — verifique as env vars.'
  }
  return `Erro do Google Ads: ${msg}`
}

function traduzirErroGA4(msg: string): string {
  if (/PERMISSION_DENIED|does not have sufficient permissions|403/i.test(msg)) {
    return 'A service account da agência não tem permissão nesta property — adicione-a como Leitor em Admin → Gerenciamento de acesso à propriedade.'
  }
  if (/NOT_FOUND|INVALID_ARGUMENT|could not be found|Invalid property/i.test(msg)) {
    return 'Property ID não encontrado — confira o número em Admin → Configurações da propriedade.'
  }
  if (/UNAUTHENTICATED|invalid_grant|credential/i.test(msg)) {
    return 'Credencial GA4 da agência com problema — verifique GOOGLE_APPLICATION_CREDENTIALS.'
  }
  return `Erro do GA4: ${msg}`
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, nome, google_ads_customer_id, ga4_property_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cliente) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  const google_ads: ResultadoTeste = { status: 'nao_configurado', mensagem: 'Customer ID não preenchido.' }
  const ga4: ResultadoTeste = { status: 'nao_configurado', mensagem: 'Property ID não preenchido.' }

  if (cliente.google_ads_customer_id) {
    try {
      await testarConexaoAds(cliente.google_ads_customer_id)
      google_ads.status = 'ok'
      google_ads.mensagem = 'Conexão OK — conta acessível pelo MCC da agência.'
    } catch (err) {
      google_ads.status = 'erro'
      google_ads.mensagem = traduzirErroAds(extrairMensagem(err))
    }
  }

  if (cliente.ga4_property_id) {
    try {
      await testarConexaoGA4(cliente.ga4_property_id)
      ga4.status = 'ok'
      ga4.mensagem = 'Conexão OK — property acessível pela service account.'
    } catch (err) {
      ga4.status = 'erro'
      ga4.mensagem = traduzirErroGA4(extrairMensagem(err))
    }
  }

  return NextResponse.json({ google_ads, ga4 })
}
