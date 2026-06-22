import type { Cliente } from './types'

/**
 * Interpolação de variáveis nas mensagens de timeline.
 *
 * As mensagens dos templates de onboarding têm trechos que mudam por cliente
 * (ex.: {{primeiro_nome}}, {{drive_url}}). Aqui resolvemos os placeholders com
 * dados do cliente + valores guardados na instância (instance.data) + extras
 * passados na hora. Mantido puro para ser testável e reusável (UI da timeline,
 * preview de template, etc.).
 *
 * Sintaxe: {{chave}}. Placeholder sem valor vira string vazia, mas é reportado
 * em `faltando` para a UI poder avisar "preencha o link do Drive".
 */

export interface InterpolacaoResultado {
  texto:    string
  /** Chaves que apareceram no texto mas não tinham valor */
  faltando: string[]
}

const PLACEHOLDER_RE = /\{\{\s*([\w.]+)\s*\}\}/g

/** Monta o dicionário de variáveis a partir do cliente + dados da instância. */
export function montarVars(
  cliente: Pick<Cliente, 'nome' | 'email' | 'whatsapp' | 'nicho' | 'dominio'>,
  instanceData?: Record<string, unknown>,
  extra?: Record<string, string>,
): Record<string, string> {
  const primeiroNome = (cliente.nome ?? '').trim().split(/\s+/)[0] ?? ''
  const base: Record<string, string> = {
    nome:          cliente.nome ?? '',
    primeiro_nome: primeiroNome,
    email:         cliente.email ?? '',
    whatsapp:      cliente.whatsapp ?? '',
    nicho:         cliente.nicho ?? '',
    dominio:       cliente.dominio ?? '',
  }
  // instance.data (ex.: drive_url preenchido num step) sobrescreve/complementa
  for (const [k, v] of Object.entries(instanceData ?? {})) {
    if (v != null && typeof v !== 'object') base[k] = String(v)
  }
  return { ...base, ...(extra ?? {}) }
}

/** Substitui {{chave}} pelos valores; reporta as que ficaram sem valor. */
export function interpolar(
  texto: string,
  vars: Record<string, string>,
): InterpolacaoResultado {
  const faltando = new Set<string>()
  const resultado = texto.replace(PLACEHOLDER_RE, (_match, chave: string) => {
    const valor = vars[chave]
    if (valor == null || valor === '') {
      faltando.add(chave)
      return ''
    }
    return valor
  })
  return { texto: resultado, faltando: Array.from(faltando) }
}
