'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, MessageCircle, ExternalLink,
  Clock, ChevronRight, RefreshCw, BarChart3,
  Brain, Pencil, Save, X,
} from 'lucide-react'
import { MainLayout }      from '@/components/layout/MainLayout'
import { ChecklistCard }   from '@/components/clientes/ChecklistCard'
import { AuditTimeline }   from '@/components/clientes/AuditTimeline'
import { AcessoRapido }    from '@/components/clientes/AcessoRapido'
import { ClientePerformance } from '@/components/clientes/ClientePerformance'
import { ClienteIntegracoes } from '@/components/clientes/ClienteIntegracoes'
import { supabase }        from '@/lib/supabase'
import type { Cliente, Estagio } from '@/lib/types'

const STATUS_LABEL: Record<string, string> = {
  recebido:        'Recebido',
  onboarding:      'Onboarding',
  setup_trafego:   'Setup Tráfego',
  ativo:           'Ativo',
  congelado:       'Congelado',
  cancelado_debito:'Cancelado D.',
  cancelado:       'Cancelado',
}

const FLUXO_PROXIMO: Record<string, string> = {
  recebido:      'onboarding',
  onboarding:    'setup_trafego',
  setup_trafego: 'ativo',
}

export default function ClienteDetalhe() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()

  const [cliente,   setCliente]   = useState<Cliente | null>(null)
  const [estagio,   setEstagio]   = useState<Estagio | null>(null)
  const [estagios,  setEstagios]  = useState<Estagio[]>([])
  const [loading,   setLoading]   = useState(true)
  const [avancando, setAvancando] = useState(false)
  const [memoria,         setMemoria]         = useState<string>('')
  const [memoriaVersao,   setMemoriaVersao]   = useState<number>(0)
  const [memoriaEditando, setMemoriaEditando] = useState(false)
  const [memoriaTexto,    setMemoriaTexto]    = useState<string>('')
  const [memoriaSalvando, setMemoriaSalvando] = useState(false)
  const [memoriaAt,       setMemoriaAt]       = useState<string | null>(null)

  async function carregar() {
    const [{ data: c }, { data: ests }, { data: mem }] = await Promise.all([
      supabase.from('clientes').select('*').eq('id', id).single(),
      supabase.from('estagios').select('*').eq('cliente_id', id).order('created_at', { ascending: false }),
      supabase.from('memoria_clientes').select('conteudo_md, versao, atualizado_em').eq('cliente_id', id).maybeSingle(),
    ])
    setCliente(c as Cliente ?? null)
    const lista = (ests ?? []) as Estagio[]
    setEstagios(lista)
    setEstagio(lista.find((e) => e.ativo) ?? null)
    const md = (mem as { conteudo_md: string; versao: number; atualizado_em: string } | null)
    setMemoria(md?.conteudo_md ?? '')
    setMemoriaVersao(md?.versao ?? 0)
    setMemoriaAt(md?.atualizado_em ?? null)
    setLoading(false)
  }

  async function salvarMemoria() {
    setMemoriaSalvando(true)
    const { data: { user } } = await supabase.auth.getUser()
    const novaVersao = memoriaVersao + 1
    await supabase.from('memoria_clientes').upsert({
      cliente_id:    id,
      conteudo_md:   memoriaTexto,
      versao:        novaVersao,
      atualizado_em: new Date().toISOString(),
      user_id:       user?.id,
    }, { onConflict: 'cliente_id' })
    setMemoria(memoriaTexto)
    setMemoriaVersao(novaVersao)
    setMemoriaAt(new Date().toISOString())
    setMemoriaEditando(false)
    setMemoriaSalvando(false)
  }

  useEffect(() => { if (id) carregar() }, [id])

  async function handleAvancar() {
    if (!cliente) return
    const proximo = FLUXO_PROXIMO[cliente.status]
    if (!proximo) return
    setAvancando(true)
    try {
      await supabase.from('clientes').update({ status: proximo }).eq('id', id)
      if (estagio) {
        await supabase.from('estagios').update({ ativo: false, concluido_em: new Date().toISOString() }).eq('id', estagio.id)
      }
      await supabase.from('estagios').insert({
        cliente_id: id,
        nome:       proximo,
        acao_label: STATUS_LABEL[proximo] ?? proximo,
        ativo:      true,
      })
      await carregar()
    } finally {
      setAvancando(false)
    }
  }

  const ORDEM = ['recebido', 'onboarding', 'setup_trafego', 'ativo']

  if (loading || !cliente) {
    return (
      <MainLayout title="Cliente">
        <div className="flex items-center justify-center h-[20rem]">
          <div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    )
  }

  const indiceAtual = ORDEM.indexOf(cliente.status)
  const proximo     = FLUXO_PROXIMO[cliente.status]

  return (
    <MainLayout
      title={cliente.nome}
      subtitle={cliente.nicho ?? ''}
    >
      <button
        onClick={() => router.back()}
        className="flex items-center gap-[0.375rem] text-ink-muted hover:text-ink-secondary text-[0.875rem] mb-[1.5rem] transition-colors"
      >
        <ArrowLeft className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
        Voltar
      </button>

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between mb-[2rem]">
        <div>
          <div className="flex items-center gap-[0.75rem] mb-[0.25rem]">
            <span className="text-[0.75rem] font-semibold px-[0.5rem] py-[0.125rem] rounded bg-ads-500/15 text-ads-500">
              {STATUS_LABEL[cliente.status] ?? cliente.status}
            </span>
            {(cliente.dias_atraso ?? 0) > 0 && (
              <span className="flex items-center gap-[0.25rem] text-[0.75rem] font-semibold text-status-red bg-status-red/10 px-[0.5rem] py-[0.125rem] rounded">
                <Clock className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                {cliente.dias_atraso}d atraso
              </span>
            )}
          </div>
          <p className="text-ink-secondary text-[0.875rem]">{cliente.email}</p>
          {cliente.dominio && (
            <a
              href={`https://${cliente.dominio}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[0.25rem] text-[0.75rem] text-ads-500 mt-[0.25rem] hover:underline"
            >
              {cliente.dominio}
              <ExternalLink className="w-[0.625rem] h-[0.625rem]" strokeWidth={1.5} />
            </a>
          )}
        </div>

        {/* Stepper de progresso */}
        <div className="hidden md:flex items-center gap-[0.25rem]">
          {ORDEM.map((s, idx) => (
            <div key={s} className="flex items-center gap-[0.25rem]">
              <div className={`
                text-[0.6875rem] font-medium px-[0.5rem] h-[1.5rem] rounded flex items-center
                ${ idx < indiceAtual  ? 'bg-ads-500/15 text-ads-500'
                  : idx === indiceAtual ? 'bg-ads-500 text-white'
                  : 'bg-surface-hover text-ink-muted border border-surface-border'}
              `}>
                {STATUS_LABEL[s]}
              </div>
              {idx < ORDEM.length - 1 && (
                <ChevronRight className="w-[0.625rem] h-[0.625rem] text-ink-muted" strokeWidth={1.5} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1.5rem]">
        {/* ── COLUNA PRINCIPAL ── */}
        <div className="lg:col-span-2 flex flex-col gap-[1.5rem]">

          {/* Ação atual + WhatsApp */}
          {estagio && (
            <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
              <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.5rem]">Ação atual</p>
              <h2 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1rem]">
                {estagio.acao_label ?? estagio.nome}
              </h2>
              <div className="flex flex-wrap gap-[0.625rem]">
                {estagio.acao_url && (
                  <a
                    href={estagio.acao_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-[0.5rem] bg-ads-500/10 hover:bg-ads-500/20 text-ads-500 border border-ads-500/30 text-[0.875rem] font-semibold px-[0.875rem] h-[2.25rem] rounded-[0.375rem] transition-colors"
                  >
                    <MessageCircle className="w-[1rem] h-[1rem]" strokeWidth={1.5} />
                    {estagio.acao_label ?? 'Enviar mensagem'}
                  </a>
                )}
                {proximo && (
                  <button
                    onClick={handleAvancar}
                    disabled={avancando}
                    className="inline-flex items-center gap-[0.5rem] bg-ads-500 hover:bg-ads-600 text-white text-[0.875rem] font-semibold px-[0.875rem] h-[2.25rem] rounded-[0.375rem] transition-colors disabled:opacity-50"
                  >
                    {avancando
                      ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <RefreshCw className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                    }
                    Avançar para {STATUS_LABEL[proximo]}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Checklist do estágio ativo */}
          {estagio?.checklist && estagio.checklist.length > 0 && (
            <ChecklistCard
              clienteId={id}
              estagioId={estagio.id}
              items={estagio.checklist}
            />
          )}

          {/* Analytics rápido */}
          <a
            href={`/relatorios?cliente=${id}`}
            className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] flex items-center justify-between hover:border-ads-500/40 transition-colors group"
          >
            <div className="flex items-center gap-[0.75rem]">
              <BarChart3 className="w-[1.25rem] h-[1.25rem] text-ink-muted group-hover:text-ads-500 transition-colors" strokeWidth={1.5} />
              <div>
                <p className="text-ink-primary text-[0.875rem] font-semibold">Relatórios de Performance</p>
                <p className="text-ink-muted text-[0.75rem]">Google Ads + GA4 — ver histórico</p>
              </div>
            </div>
            <ExternalLink className="w-[0.875rem] h-[0.875rem] text-ink-muted group-hover:text-ads-500 transition-colors" strokeWidth={1.5} />
          </a>

          {/* Acesso Rápido — Links Externos */}
          {cliente && (
            <AcessoRapido
              links={{
                google_ads_customer_id: cliente.google_ads_customer_id || undefined,
                ga4_property_id: cliente.ga4_property_id || undefined,
                gmb_id: cliente.gmb_id || undefined,
                looker_url: cliente.looker_url || undefined,
                website: cliente.website || undefined,
              }}
            />
          )}

          {/* Performance Inline — Ads + GA4 */}
          {cliente && (
            <ClientePerformance
              clienteId={cliente.id}
              googleAdsEnabled={cliente.google_ads_enabled || false}
              ga4Enabled={cliente.ga4_enabled || false}
            />
          )}

          {/* Integrações & Links */}
          {cliente && (
            <ClienteIntegracoes
              cliente={cliente}
              onUpdate={(updated) => setCliente(updated)}
            />
          )}

          {/* Memória do Cliente */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem]">
            <div className="flex items-center justify-between mb-[1rem]">
              <div className="flex items-center gap-[0.5rem]">
                <Brain className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.75} />
                <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Memória do Cliente</h3>
                {memoriaVersao > 0 && (
                  <span className="text-ink-muted text-[0.6875rem] bg-surface-hover px-[0.375rem] py-[0.0625rem] rounded-full">
                    v{memoriaVersao}
                    {memoriaAt ? ` · ${new Date(memoriaAt).toLocaleDateString('pt-BR')}` : ''}
                  </span>
                )}
              </div>
              {!memoriaEditando ? (
                <button
                  onClick={() => { setMemoriaTexto(memoria); setMemoriaEditando(true) }}
                  className="flex items-center gap-[0.25rem] text-ink-muted hover:text-ink-secondary text-[0.8125rem] transition-colors"
                >
                  <Pencil className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
                  Editar
                </button>
              ) : (
                <div className="flex items-center gap-[0.5rem]">
                  <button onClick={() => setMemoriaEditando(false)} className="text-ink-muted hover:text-ink-secondary transition-colors">
                    <X className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                  </button>
                  <button
                    onClick={salvarMemoria}
                    disabled={memoriaSalvando}
                    className="flex items-center gap-[0.25rem] h-[1.875rem] px-[0.75rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white text-[0.8125rem] font-semibold transition-colors disabled:opacity-50"
                  >
                    {memoriaSalvando
                      ? <div className="w-[0.75rem] h-[0.75rem] border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Save className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                    }
                    Salvar
                  </button>
                </div>
              )}
            </div>

            {memoriaEditando ? (
              <textarea
                value={memoriaTexto}
                onChange={(e) => setMemoriaTexto(e.target.value)}
                rows={10}
                placeholder="Escreva notas, contexto, histórico de reuniões, preferências do cliente…"
                className="w-full px-[0.75rem] py-[0.625rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors leading-relaxed"
              />
            ) : memoria ? (
              <pre className="text-ink-secondary text-[0.875rem] leading-relaxed whitespace-pre-wrap break-words font-sans">{memoria}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center py-[2rem] text-center">
                <Brain className="w-[2rem] h-[2rem] text-ink-muted mb-[0.5rem]" strokeWidth={1} />
                <p className="text-ink-muted text-[0.875rem]">Nenhuma memória registrada.</p>
                <button
                  onClick={() => { setMemoriaTexto(''); setMemoriaEditando(true) }}
                  className="mt-[0.75rem] text-ads-500 hover:text-ads-600 text-[0.8125rem] font-medium transition-colors"
                >
                  + Adicionar memória
                </button>
              </div>
            )}
          </div>

          {/* Audit Timeline */}
          <AuditTimeline clienteId={id} />
        </div>

        {/* ── COLUNA LATERAL ── */}
        <div className="flex flex-col gap-[1rem]">
          <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
            <h3 className="text-ink-primary font-semibold text-[0.875rem] mb-[1rem]">Informações</h3>
            <div className="flex flex-col gap-[0.75rem]">
              {([
                { label: 'Nicho',         valor: cliente.nicho },
                { label: 'WhatsApp',      valor: cliente.whatsapp },
                { label: 'Domínio',       valor: cliente.dominio ?? '—' },
                { label: 'Google Ads ID', valor: cliente.google_ads_customer_id ?? 'Não configurado' },
                { label: 'GA4 ID',        valor: cliente.ga4_property_id ?? 'Não configurado' },
              ] as { label: string; valor: string | undefined }[]).map(({ label, valor }) => (
                <div key={label}>
                  <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.125rem]">{label}</p>
                  <p className="text-ink-secondary text-[0.875rem] break-all">{valor ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Financeiro */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
            <h3 className="text-ink-primary font-semibold text-[0.875rem] mb-[1rem]">Financeiro</h3>
            <div className="flex flex-col gap-[0.75rem]">
              <div>
                <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.125rem]">MRR</p>
                <p className="text-ink-primary text-[1.25rem] font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.mrr ?? 0)}
                </p>
              </div>
              {cliente.plano && (
                <div>
                  <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.125rem]">Plano</p>
                  <p className="text-ink-secondary text-[0.875rem]">{cliente.plano}</p>
                </div>
              )}
              {(cliente.dias_atraso ?? 0) > 0 && (
                <div className="flex items-center gap-[0.375rem] bg-status-red/10 text-status-red text-[0.75rem] font-semibold px-[0.625rem] py-[0.375rem] rounded">
                  <Clock className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                  {cliente.dias_atraso} dias de atraso
                </div>
              )}
            </div>
          </div>

          {/* Estágios anteriores */}
          {estagios.filter((e) => !e.ativo).length > 0 && (
            <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem]">
              <h3 className="text-ink-primary font-semibold text-[0.875rem] mb-[0.75rem]">Etapas concluídas</h3>
              <ul className="space-y-[0.5rem]">
                {estagios.filter((e) => !e.ativo).map((e) => (
                  <li key={e.id} className="flex items-center gap-[0.5rem] text-ink-muted text-[0.8125rem]">
                    <div className="w-[0.375rem] h-[0.375rem] rounded-full bg-ads-500/50 shrink-0" />
                    {STATUS_LABEL[e.nome] ?? e.nome}
                    {e.concluido_em && (
                      <span className="ml-auto text-[0.6875rem]">
                        {new Date(e.concluido_em).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
