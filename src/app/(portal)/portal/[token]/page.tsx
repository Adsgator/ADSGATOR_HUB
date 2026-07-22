import { criarClienteServiceRole } from '@/lib/supabase'
import type { Cliente, Estagio, RelatorioMensal } from '@/lib/types'
import { diasAtrasoCliente } from '@/lib/cobranca'
import { obterDetalheAnalytics } from '@/lib/analytics-detalhes'
import type {
  KpisAdsComparativo, LinhaTermoAds, DiasHorariosAds,
  LinhaDispositivoAds, LinhaLocalAds, DemografiaAds,
} from '@/lib/ads-detalhes'
import type {
  KpisGA4Comparativo, LinhaOrigemGA4, LinhaPaginaGA4,
  LinhaDispositivoGA4, LinhaTipoUsuarioGA4, GeografiaGA4,
} from '@/lib/ga4-detalhes'
import { TrafegoDidatico, SiteDidatico, GaugeMidia } from '@/components/portal/AnalyticsDidatico'
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

type StatusBadgeColor = 'green' | 'orange' | 'red' | 'blue' | 'gray'

interface PageParams {
  params: Promise<{ token: string }>
}

const statusBadgeColors: Record<string, StatusBadgeColor> = {
  recebido: 'blue',
  onboarding: 'blue',
  setup_trafego: 'orange',
  ativo: 'green',
  congelado: 'orange',
  cancelado_debito: 'red',
  cancelado: 'red',
  inativo: 'gray',
}

function getBadgeStyles(color: StatusBadgeColor) {
  const styles: Record<StatusBadgeColor, { bg: string; text: string }> = {
    green: { bg: 'bg-status-green/10', text: 'text-status-green' },
    orange: { bg: 'bg-status-orange/10', text: 'text-status-orange' },
    red: { bg: 'bg-status-red/10', text: 'text-status-red' },
    blue: { bg: 'bg-status-blue/10', text: 'text-status-blue' },
    gray: { bg: 'bg-surface-hover', text: 'text-ink-secondary' },
  }
  return styles[color]
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    recebido: 'Recebido',
    onboarding: 'Onboarding',
    setup_trafego: 'Setup de Tráfego',
    ativo: 'Ativo',
    congelado: 'Congelado',
    cancelado_debito: 'Cancelado',
    cancelado: 'Cancelado',
    inativo: 'Inativo',
  }
  return labels[status] ?? status
}

export default async function PortalPage({ params }: PageParams) {
  const { token } = await params

  if (!token || token.length < 16) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base px-[1rem]">
        <div className="max-w-[28rem] w-full">
          <div className="bg-surface-card border border-surface-border rounded-xl p-[2rem] text-center card-shadow">
            <AlertCircle className="mx-auto mb-[1rem] text-status-orange" size={48} />
            <h1 className="text-2xl font-semibold text-ink-primary mb-[0.5rem]">Link Inválido</h1>
            <p className="text-ink-secondary mb-[1.5rem]">Este link de acesso expirou ou é inválido. Por favor, solicite um novo link ao seu gerente Adsgator.</p>
            <div className="pt-[1rem] border-t border-surface-border">
              <p className="text-xs text-ink-muted">Powered by Adsgator</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const supabase = criarClienteServiceRole()

  // Buscar cliente pelo portal_token — server-side com service role, sem depender de RLS
  let cliente: Cliente | null = null
  try {
    const { data } = await supabase
      .from('clientes')
      .select('id, user_id, nome, email, whatsapp, dominio, nicho, status, mrr, dias_atraso, data_vencimento, google_ads_customer_id, ga4_property_id, google_ads_enabled, ga4_enabled')
      .eq('portal_token', token)
      .single()

    cliente = data as Cliente
  } catch {
    // Token inválido ou cliente não encontrado
  }

  // Se não encontrou o cliente, mostrar erro
  if (!cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base px-[1rem]">
        <div className="max-w-[28rem] w-full">
          <div className="bg-surface-card border border-surface-border rounded-xl p-[2rem] text-center card-shadow">
            <AlertCircle className="mx-auto mb-[1rem] text-status-orange" size={48} />
            <h1 className="text-2xl font-semibold text-ink-primary mb-[0.5rem]">Link Inválido</h1>
            <p className="text-ink-secondary mb-[1.5rem]">Este link de acesso expirou ou é inválido. Por favor, solicite um novo link ao seu gerente Adsgator.</p>
            <div className="pt-[1rem] border-t border-surface-border">
              <p className="text-xs text-ink-muted">Powered by Adsgator</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Buscar relatórios do cliente
  let relatorios: RelatorioMensal[] = []
  try {
    const { data } = await supabase
      .from('relatorios_mensais')
      .select('id, mes_ano, created_at, status_geracao, investimento_ads, conversoes, cpa, sessoes_ga4, taxa_engajamento')
      .eq('cliente_id', cliente.id)
      .order('created_at', { ascending: false })
      .limit(3)

    relatorios = (data ?? []) as RelatorioMensal[]
  } catch (error) {
    // Tabela pode não existir
  }

  // Buscar estágios/checklist do cliente
  let estagios: Estagio[] = []
  try {
    const { data } = await supabase
      .from('estagios')
      .select('id, nome, descricao, acao_label, ativo, concluido_em, created_at')
      .eq('cliente_id', cliente.id)
      .order('created_at', { ascending: true })

    estagios = (data ?? []) as Estagio[]
  } catch (error) {
    // Erro ao buscar estágios
  }

  // ── Analytics 2.0: dashboards didáticos (mês atual, mesmos números dos
  // dashboards internos, servidos do cache analytics_detalhes) ──
  const hoje = new Date()
  const fmtDia = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const periodoMes = { inicio: fmtDia(new Date(hoje.getFullYear(), hoje.getMonth(), 1)), fim: fmtDia(hoje) }

  const adsOn = Boolean(cliente.google_ads_enabled && cliente.google_ads_customer_id)
  const ga4On = Boolean(cliente.ga4_enabled && cliente.ga4_property_id)

  // Falha de um corte não derruba o portal — a seção mostra "indisponível".
  const detalhe = <T,>(fonte: 'ads' | 'ga4', dimensao: string): Promise<T | null> =>
    obterDetalheAnalytics({
      supabase,
      userId: (cliente as Cliente & { user_id: string }).user_id,
      clienteId: cliente.id,
      contaAds: cliente.google_ads_customer_id,
      propriedadeGa4: cliente.ga4_property_id,
      fonte, dimensao, periodo: periodoMes,
    })
      .then((r) => r.payload as T)
      .catch((err) => {
        console.warn(`[portal] ${fonte}/${dimensao} indisponível:`, err instanceof Error ? err.message : err)
        return null
      })

  const nulo = Promise.resolve(null)
  const [
    adsKpis, adsTermos, adsDias, adsDispositivos, adsGeografia, adsDemografia,
    ga4Kpis, ga4Aquisicao, ga4Paginas, ga4Dispositivos, ga4NovoRecorrente, ga4Geografia,
  ] = await Promise.all([
    adsOn ? detalhe<KpisAdsComparativo>('ads', 'kpis') : nulo,
    adsOn ? detalhe<LinhaTermoAds[]>('ads', 'termos') : nulo,
    adsOn ? detalhe<DiasHorariosAds>('ads', 'dias_horarios') : nulo,
    adsOn ? detalhe<LinhaDispositivoAds[]>('ads', 'dispositivos') : nulo,
    adsOn ? detalhe<LinhaLocalAds[]>('ads', 'geografia') : nulo,
    adsOn ? detalhe<DemografiaAds>('ads', 'demografia') : nulo,
    ga4On ? detalhe<KpisGA4Comparativo>('ga4', 'kpis') : nulo,
    ga4On ? detalhe<LinhaOrigemGA4[]>('ga4', 'aquisicao') : nulo,
    ga4On ? detalhe<LinhaPaginaGA4[]>('ga4', 'paginas') : nulo,
    ga4On ? detalhe<LinhaDispositivoGA4[]>('ga4', 'dispositivos') : nulo,
    ga4On ? detalhe<LinhaTipoUsuarioGA4[]>('ga4', 'novo_recorrente') : nulo,
    ga4On ? detalhe<GeografiaGA4>('ga4', 'geografia') : nulo,
  ])

  // Medidor de verba: limite de mídia é do PLANO (assinatura ativa → plano
  // pelo nome). Sem plano com limite definido, o medidor simplesmente não
  // aparece — entra sozinho quando o Lucas estruturar os planos.
  let gaugeMidia: { limite: number; planoNome: string } | null = null
  if (adsKpis) {
    try {
      const { data: assinatura } = await supabase
        .from('assinaturas')
        .select('plano_nome')
        .eq('cliente_id', cliente.id)
        .in('status', ['ativa', 'atraso'])
        .limit(1)
        .maybeSingle()
      if (assinatura?.plano_nome) {
        const { data: plano } = await supabase
          .from('planos_servico')
          .select('nome, limite_midia_mensal')
          .ilike('nome', assinatura.plano_nome)
          .maybeSingle()
        if (plano?.limite_midia_mensal && Number(plano.limite_midia_mensal) > 0) {
          gaugeMidia = { limite: Number(plano.limite_midia_mensal), planoNome: plano.nome }
        }
      }
    } catch (err) {
      // coluna/limite ainda não existe (migration pendente) — sem medidor
      console.warn('[portal] medidor de verba indisponível:', err instanceof Error ? err.message : err)
    }
  }

  const statusColor = statusBadgeColors[cliente.status as string] ?? 'gray'
  const statusStyles = getBadgeStyles(statusColor)

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="border-b border-surface-border bg-surface-card">
        <div className="max-w-[80rem] mx-auto px-[1.5rem] py-[2rem]">
          <div className="flex items-center justify-between mb-[1.5rem]">
            <div>
              <h1 className="text-3xl font-bold text-ink-primary mb-[0.5rem]">{cliente.nome}</h1>
              <p className="text-ink-secondary">Portal de acompanhamento da Adsgator</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-ink-muted mb-[0.5rem]">Status atual</p>
              <span className={`inline-block px-[0.75rem] py-[0.375rem] rounded-full text-sm font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                {getStatusLabel(cliente.status)}
              </span>
            </div>
          </div>

          {/* KPIs Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1rem]">
            <div className="bg-surface-base border border-surface-border rounded-lg p-[1rem]">
              <p className="text-xs text-ink-muted mb-[0.25rem]">MRR Atual</p>
              <p className="text-2xl font-bold text-ink-primary">
                {cliente.mrr ? `R$ ${cliente.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
              </p>
            </div>
            <div className="bg-surface-base border border-surface-border rounded-lg p-[1rem]">
              <p className="text-xs text-ink-muted mb-[0.25rem]">Dias em Atraso</p>
              <p className="text-2xl font-bold text-ink-primary">{diasAtrasoCliente(cliente)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[80rem] mx-auto px-[1.5rem] py-[2rem]">
        {/* Dashboards didáticos (Analytics 2.0) */}
        {(adsOn || ga4On) && (
          <div className="space-y-[2.5rem] mb-[2.5rem]">
            {gaugeMidia && adsKpis && (
              <GaugeMidia gastoMes={adsKpis.atual.custo} limite={gaugeMidia.limite} planoNome={gaugeMidia.planoNome} />
            )}
            {adsOn && (
              <TrafegoDidatico
                periodo={periodoMes}
                kpis={adsKpis}
                termos={adsTermos}
                diasHorarios={adsDias}
                dispositivos={adsDispositivos}
                geografia={adsGeografia}
                demografia={adsDemografia}
              />
            )}
            {ga4On && (
              <SiteDidatico
                periodo={periodoMes}
                kpis={ga4Kpis}
                aquisicao={ga4Aquisicao}
                paginas={ga4Paginas}
                dispositivos={ga4Dispositivos}
                novoRecorrente={ga4NovoRecorrente}
                geografia={ga4Geografia}
              />
            )}
          </div>
        )}

        {/* Relatórios Recentes */}
        {relatorios.length > 0 && (
          <section className="mb-[2.5rem]">
            <h2 className="text-xl font-semibold text-ink-primary mb-[1rem]">Últimos Relatórios</h2>
            <div className="grid grid-cols-1 gap-[1rem]">
              {relatorios.map((relatorio) => (
                <div
                  key={relatorio.id}
                  className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow hover:border-ads-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-[0.75rem]">
                    <div className="flex-1">
                      <div className="flex items-center gap-[0.5rem] mb-[0.25rem]">
                        <Calendar size={16} className="text-ink-secondary" />
                        <p className="text-sm font-medium text-ink-secondary">Relatório {relatorio.mes_ano}</p>
                      </div>
                      <p className="text-xs text-ink-muted">
                        {relatorio.created_at ? new Date(relatorio.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-[0.5rem] py-[0.25rem] rounded-full ${
                      relatorio.status_geracao === 'gerado' ? 'bg-status-green/10 text-status-green' : 'bg-status-orange/10 text-status-orange'
                    }`}>
                      {relatorio.status_geracao === 'gerado' ? 'Completo' : 'Processando'}
                    </span>
                  </div>

                  {/* Resumo de Métricas */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-[1rem] pt-[1rem] border-t border-surface-border">
                    {relatorio.investimento_ads !== null && (
                      <div>
                        <p className="text-xs text-ink-muted mb-[0.25rem]">Investimento</p>
                        <p className="font-semibold text-ink-primary">
                          R$ {relatorio.investimento_ads.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                    {relatorio.conversoes !== null && (
                      <div>
                        <p className="text-xs text-ink-muted mb-[0.25rem]">Conversões</p>
                        <p className="font-semibold text-ink-primary">{relatorio.conversoes.toFixed(1)}</p>
                      </div>
                    )}
                    {relatorio.cpa !== null && (
                      <div>
                        <p className="text-xs text-ink-muted mb-[0.25rem]">CPA</p>
                        <p className="font-semibold text-ink-primary">
                          R$ {relatorio.cpa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                    {relatorio.sessoes_ga4 !== null && (
                      <div>
                        <p className="text-xs text-ink-muted mb-[0.25rem]">Sessões</p>
                        <p className="font-semibold text-ink-primary">{relatorio.sessoes_ga4.toLocaleString('pt-BR')}</p>
                      </div>
                    )}
                    {relatorio.taxa_engajamento !== null && (
                      <div>
                        <p className="text-xs text-ink-muted mb-[0.25rem]">Engajamento</p>
                        <p className="font-semibold text-ink-primary">{(relatorio.taxa_engajamento * 100).toFixed(1)}%</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Checklist de Onboarding */}
        {estagios.length > 0 && (
          <section className="mb-[2.5rem]">
            <h2 className="text-xl font-semibold text-ink-primary mb-[1rem]">Progresso do Onboarding</h2>
            <div className="space-y-[0.75rem]">
              {estagios.map((estagio) => {
                const isAtivo = estagio.ativo
                const isConcluido = estagio.concluido_em !== null && estagio.concluido_em !== undefined

                return (
                  <div
                    key={estagio.id}
                    className="bg-surface-card border border-surface-border rounded-lg p-[1rem] flex items-start gap-[1rem]"
                  >
                    <div className="flex-shrink-0 mt-[0.25rem]">
                      {isConcluido ? (
                        <CheckCircle2 size={20} className="text-status-green" />
                      ) : isAtivo ? (
                        <Clock size={20} className="text-status-orange animate-pulse-slow" />
                      ) : (
                        <div className="w-[1.25rem] h-[1.25rem] rounded-full border border-surface-border" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-ink-primary capitalize">
                        {estagio.nome?.replace(/_/g, ' ') ?? 'Sem título'}
                      </p>
                      {estagio.descricao && (
                        <p className="text-sm text-ink-secondary mt-[0.25rem]">{estagio.descricao}</p>
                      )}
                      {estagio.acao_label && (
                        <p className="text-xs text-ink-muted mt-[0.5rem] italic">Próxima ação: {estagio.acao_label}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Informações de Contato */}
        <section className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] card-shadow">
          <h3 className="font-semibold text-ink-primary mb-[1rem]">Informações da Conta</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.5rem]">
            {cliente.email && (
              <div>
                <p className="text-xs text-ink-muted mb-[0.25rem]">Email</p>
                <p className="text-ink-primary">{cliente.email}</p>
              </div>
            )}
            {cliente.whatsapp && (
              <div>
                <p className="text-xs text-ink-muted mb-[0.25rem]">WhatsApp</p>
                <p className="text-ink-primary">{cliente.whatsapp}</p>
              </div>
            )}
            {cliente.dominio && (
              <div>
                <p className="text-xs text-ink-muted mb-[0.25rem]">Domínio</p>
                <p className="text-ink-primary">{cliente.dominio}</p>
              </div>
            )}
            {cliente.nicho && (
              <div>
                <p className="text-xs text-ink-muted mb-[0.25rem]">Nicho</p>
                <p className="text-ink-primary capitalize">{cliente.nicho}</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="border-t border-surface-border bg-surface-card mt-[3rem]">
        <div className="max-w-[80rem] mx-auto px-[1.5rem] py-[2rem] text-center">
          <p className="text-xs text-ink-muted">
            Powered by <span className="font-semibold text-ads-500">Adsgator</span> • Portal Seguro do Cliente
          </p>
        </div>
      </div>
    </div>
  )
}
