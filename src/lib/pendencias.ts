// ─── PENDÊNCIAS POR CLIENTE ───────────────────────────────────────────────────
// Fonte única do "o que falta fazer neste cliente": integração sem ID, toggle
// desligado, erro no último sync, saldo não informado. O sistema JOGA isso na
// cara do operador em vez de esperar que ele descubra — consumido pelo modal
// do dashboard (PendenciasModal) e pelo banner do detalhe do cliente
// (PendenciasCliente). A regra de negócio mora aqui; os componentes só exibem.
//
// Complementa (não substitui) lib/setup-checklist.ts, que cuida das pendências
// de INFRA (credenciais, crons, automações). Aqui é o nível cliente-a-cliente.

import type { Cliente } from '@/lib/types'

export type PendenciaTipo =
  | 'sync_erro'
  | 'ads_sem_id'
  | 'ads_desligada'
  | 'ga4_sem_id'
  | 'ga4_desligada'
  | 'aguardando_sync'
  | 'saldo_nao_informado'

export type PendenciaSeveridade = 'erro' | 'pendente' | 'info'

export interface Pendencia {
  /** Chave estável (clienteId:tipo) — usada para "ignorar por 7 dias" */
  id: string
  tipo: PendenciaTipo
  severidade: PendenciaSeveridade
  clienteId: string
  clienteNome: string
  titulo: string
  /** O que significa e qual o impacto — em linguagem direta */
  explicacao: string
  /** Como resolver, passo a passo, do início ao fim */
  passos: string[]
  /** Rota que leva direto ao lugar de resolver */
  href: string
}

/** Clientes nestes status têm operação de tráfego/site — cobramos integração. */
export const STATUS_COM_PENDENCIAS = ['ativo', 'onboarding', 'setup_trafego'] as const

type ClientePendencias = Pick<
  Cliente,
  | 'id' | 'nome' | 'status'
  | 'google_ads_customer_id' | 'ga4_property_id'
  | 'google_ads_enabled' | 'ga4_enabled'
  | 'ultimo_sync_at' | 'ultimo_sync_status' | 'ultimo_sync_erro'
  | 'saldo_google'
>

/** Campos que qualquer consumidor precisa selecionar para computar pendências. */
export const CAMPOS_PENDENCIAS =
  'id, nome, status, google_ads_customer_id, ga4_property_id, google_ads_enabled, ga4_enabled, ultimo_sync_at, ultimo_sync_status, ultimo_sync_erro, saldo_google'

export function pendenciasDoCliente(c: ClientePendencias): Pendencia[] {
  if (!STATUS_COM_PENDENCIAS.includes(c.status as (typeof STATUS_COM_PENDENCIAS)[number])) {
    return []
  }

  const lista: Pendencia[] = []
  const hrefIntegracoes = `/clientes/${c.id}?foco=integracoes`
  const base = { clienteId: c.id, clienteNome: c.nome }
  const add = (p: Omit<Pendencia, 'id' | 'clienteId' | 'clienteNome'>) =>
    lista.push({ ...base, ...p, id: `${c.id}:${p.tipo}` })

  // ── Erro no último sync vem primeiro: dado existente pode estar defasado ──
  if (c.ultimo_sync_status === 'erro' || c.ultimo_sync_status === 'parcial') {
    add({
      tipo: 'sync_erro',
      severidade: 'erro',
      titulo: c.ultimo_sync_status === 'erro' ? 'Última sincronização falhou' : 'Sincronização parcial — uma das fontes falhou',
      explicacao: `O sync mais recente ${c.ultimo_sync_status === 'erro' ? 'falhou' : 'não completou'}${c.ultimo_sync_erro ? `: "${c.ultimo_sync_erro}"` : ''}. Enquanto isso, os números exibidos nos cards e relatórios podem estar desatualizados.`,
      passos: [
        'Abra a seção Integrações do cliente — a linha "última sincronização" mostra o erro completo',
        'Clique em "Testar conexão" para identificar qual integração está com problema (ID errado, acesso revogado, etc.)',
        'Corrija o ID ou o acesso apontado no erro',
        'Sincronize de novo em Analytics → Sincronizar e confira se o status volta a OK',
      ],
      href: hrefIntegracoes,
    })
  }

  const adsSemId = !c.google_ads_customer_id
  const adsDesligada = !!c.google_ads_customer_id && !c.google_ads_enabled
  const ga4SemId = !c.ga4_property_id
  const ga4Desligada = !!c.ga4_property_id && !c.ga4_enabled

  if (adsSemId) {
    add({
      tipo: 'ads_sem_id',
      severidade: 'pendente',
      titulo: 'Google Ads sem Customer ID',
      explicacao: 'Sem o Customer ID o Hub não acompanha as campanhas deste cliente: o card de Tráfego fica vazio, os alertas de verba não funcionam e o relatório mensal não sai preenchido.',
      passos: [
        'Abra a conta do cliente no Google Ads e copie o Customer ID do canto superior direito (formato 123-456-7890)',
        'Cole no campo Google Ads da seção Integrações — o Hub remove os hífens sozinho',
        'Ligue o toggle do Google Ads (ID preenchido com toggle desligado não sincroniza)',
        'Clique em "Testar conexão" para validar antes de sair',
        'Sincronize em Analytics → Sincronizar, ou aguarde a rotina automática (a cada 30 min)',
      ],
      href: hrefIntegracoes,
    })
  } else if (adsDesligada) {
    add({
      tipo: 'ads_desligada',
      severidade: 'pendente',
      titulo: 'Google Ads com ID salvo, mas DESLIGADO',
      explicacao: 'O Customer ID já está preenchido, só que o toggle está desligado — o Hub não sincroniza nada. Esse era exatamente o problema invisível que deixava os dados zerados.',
      passos: [
        'Na seção Integrações, ligue o toggle do Google Ads',
        'Clique em "Testar conexão" para confirmar que o ID continua válido',
        'Sincronize em Analytics para puxar os primeiros dados',
      ],
      href: hrefIntegracoes,
    })
  }

  if (ga4SemId) {
    add({
      tipo: 'ga4_sem_id',
      severidade: 'pendente',
      titulo: 'GA4 sem ID da propriedade',
      explicacao: 'Sem o ID da propriedade GA4 o Hub não mede o site deste cliente: sessões, usuários e conversões ficam de fora dos cards e relatórios. Se o cliente não tem serviço de site/GA4, ignore esta pendência.',
      passos: [
        'No GA4 do cliente: Administrador → Configurações da propriedade → copie o "ID da propriedade" (só números)',
        'Garanta que a service account do Hub tem acesso de Leitor na propriedade',
        'Cole o ID no campo GA4 da seção Integrações e ligue o toggle',
        'Valide com "Testar conexão" e sincronize',
      ],
      href: hrefIntegracoes,
    })
  } else if (ga4Desligada) {
    add({
      tipo: 'ga4_desligada',
      severidade: 'pendente',
      titulo: 'GA4 com ID salvo, mas DESLIGADO',
      explicacao: 'O ID da propriedade já está preenchido, só que o toggle está desligado — nada do site é sincronizado.',
      passos: [
        'Na seção Integrações, ligue o toggle do GA4',
        'Clique em "Testar conexão" para confirmar o acesso',
        'Sincronize em Analytics para puxar os primeiros dados',
      ],
      href: hrefIntegracoes,
    })
  }

  const algumaLigada = !!c.google_ads_enabled || !!c.ga4_enabled

  if (algumaLigada && !c.ultimo_sync_at && lista.length === 0) {
    add({
      tipo: 'aguardando_sync',
      severidade: 'info',
      titulo: 'Conectado — falta a primeira sincronização',
      explicacao: 'Integrações configuradas e ligadas. Só falta a primeira sincronização para os dados aparecerem nos cards.',
      passos: [
        'Abra Analytics e clique em Sincronizar — ou aguarde a rotina automática (roda a cada 30 min)',
      ],
      href: '/analytics',
    })
  }

  // Só cobra o saldo depois do 1º sync: pré-pagas são preenchidas pelo sync;
  // se sincronizou e continua null, é pós-paga (Google não expõe) → manual.
  if (c.google_ads_enabled && c.ultimo_sync_at && c.saldo_google == null) {
    add({
      tipo: 'saldo_nao_informado',
      severidade: 'info',
      titulo: 'Saldo Google não informado (conta pós-paga?)',
      explicacao: 'O Google Ads está conectado, mas sem saldo o alerta preditivo de fim de verba não consegue avisar quando o dinheiro está acabando. Em contas pós-pagas (fatura mensal) o Google não expõe o saldo pela API — informe manualmente.',
      passos: [
        'Confira no Google Ads (Faturamento) o saldo ou limite disponível do cliente',
        'Preencha o campo "Saldo" na seção Integrações do cliente — a data de atualização fica registrada',
      ],
      href: hrefIntegracoes,
    })
  }

  return lista
}

/** Pendências de vários clientes, ordenadas por gravidade (erro → pendente → info). */
export function pendenciasDaCarteira(clientes: ClientePendencias[]): Pendencia[] {
  const ordem: Record<PendenciaSeveridade, number> = { erro: 0, pendente: 1, info: 2 }
  return clientes
    .flatMap(pendenciasDoCliente)
    .sort((a, b) => ordem[a.severidade] - ordem[b.severidade] || a.clienteNome.localeCompare(b.clienteNome))
}

// ─── Ignorar por 7 dias (localStorage) ───────────────────────────────────────
// O "ignorar" é uma soneca, não um arquivamento: a pendência volta sozinha
// depois do prazo, porque pendência esquecida vira dado errado em produção.

const SNOOZE_KEY = 'adsgator-pendencias-ignoradas-v1'

function lerSnoozes(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(SNOOZE_KEY) ?? '{}') as Record<string, number>
  } catch {
    return {}
  }
}

export function ignorarPendencia(id: string, dias = 7): void {
  const snoozes = lerSnoozes()
  snoozes[id] = Date.now() + dias * 86_400_000
  try { localStorage.setItem(SNOOZE_KEY, JSON.stringify(snoozes)) } catch {}
}

/** Remove as pendências ignoradas que ainda estão dentro do prazo da soneca. */
export function filtrarIgnoradas(pendencias: Pendencia[]): Pendencia[] {
  const snoozes = lerSnoozes()
  const agora = Date.now()
  return pendencias.filter((p) => !(snoozes[p.id] && snoozes[p.id] > agora))
}
