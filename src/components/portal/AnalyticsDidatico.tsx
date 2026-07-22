import { ArrowDownRight, ArrowUpRight, Gauge } from 'lucide-react'
import type {
  KpisAdsComparativo, LinhaTermoAds, DiasHorariosAds,
  LinhaDispositivoAds, LinhaLocalAds, DemografiaAds,
} from '@/lib/ads-detalhes'
import type {
  KpisGA4Comparativo, LinhaOrigemGA4, LinhaPaginaGA4,
  LinhaDispositivoGA4, LinhaTipoUsuarioGA4, GeografiaGA4,
} from '@/lib/ga4-detalhes'
import type { Periodo } from '@/lib/analytics-periodo'
import { variacaoPercentual } from '@/lib/analytics-periodo'
import {
  DIA_CURTO, DISPOSITIVO_LABEL, FAIXA_LABEL, GENERO_LABEL,
  fmtConv, fmtMoeda, fmtNum, fmtPct, nomeLocal,
} from '@/components/analytics/trafego/labels'
import { DISPOSITIVO_GA4_LABEL, TIPO_USUARIO_LABEL, fmtDuracao } from '@/components/analytics/site/labelsGa4'

// ─── Portal do cliente — dashboards DIDÁTICOS (Analytics 2.0 F6) ─────────────
// Mesmos números dos dashboards internos, mas explicados para leigo: cada
// métrica com "o que isso significa" e leitura guiada. Renderizado 100% no
// servidor (sem JS) — barras em CSS, nada de recharts no portal.

const fmtData = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`

// ── blocos compartilhados ──

function Delta({ atual, anterior, quedaEhBoa }: { atual: number; anterior: number; quedaEhBoa?: boolean }) {
  const delta = variacaoPercentual(atual, anterior)
  if (delta === null) return null
  const melhorou = quedaEhBoa ? delta < 0 : delta > 0
  const Cor = melhorou ? 'text-status-green' : 'text-status-red'
  const Seta = delta >= 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`inline-flex items-center gap-[0.125rem] text-[0.6875rem] font-medium ${Cor}`}>
      <Seta className="w-[0.6875rem] h-[0.6875rem]" strokeWidth={2.25} />
      {Math.abs(delta).toFixed(0)}% {delta >= 0 ? 'a mais' : 'a menos'} que no período anterior
    </span>
  )
}

function KpiDidatico({
  label, valor, explicacao, atual, anterior, quedaEhBoa,
}: {
  label: string; valor: string; explicacao: string
  atual?: number; anterior?: number; quedaEhBoa?: boolean
}) {
  return (
    <div className="bg-surface-base border border-surface-border rounded-lg p-[1rem]">
      <p className="text-xs text-ink-muted mb-[0.25rem]">{label}</p>
      <p className="text-2xl font-bold text-ink-primary leading-none mb-[0.375rem]">{valor}</p>
      {atual !== undefined && anterior !== undefined && (
        <p className="mb-[0.25rem]"><Delta atual={atual} anterior={anterior} quedaEhBoa={quedaEhBoa} /></p>
      )}
      <p className="text-[0.6875rem] text-ink-muted leading-snug">{explicacao}</p>
    </div>
  )
}

function BarraLista({
  linhas,
}: {
  linhas: Array<{ chave: string; label: string; valor: number; detalhe?: string; cor?: string }>
}) {
  const max = Math.max(1, ...linhas.map((l) => l.valor))
  return (
    <div className="space-y-[0.625rem]">
      {linhas.map((l) => (
        <div key={l.chave}>
          <div className="flex items-center justify-between text-[0.8125rem] mb-[0.1875rem] gap-[0.75rem]">
            <span className="text-ink-secondary truncate">{l.label}</span>
            <span className="text-ink-primary font-medium shrink-0">
              {fmtNum(l.valor)}
              {l.detalhe && <span className="text-ink-muted font-normal"> {l.detalhe}</span>}
            </span>
          </div>
          <div className="h-[0.375rem] rounded-full bg-surface-hover overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(l.valor / max) * 100}%`, backgroundColor: l.cor ?? '#FFB100' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function Secao({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] card-shadow">
      <h3 className="font-semibold text-ink-primary mb-[0.25rem]">{titulo}</h3>
      {subtitulo && <p className="text-[0.75rem] text-ink-muted mb-[1rem]">{subtitulo}</p>}
      {!subtitulo && <div className="mb-[0.75rem]" />}
      {children}
    </div>
  )
}

export function SecaoIndisponivel({ titulo }: { titulo: string }) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] card-shadow">
      <h3 className="font-semibold text-ink-primary mb-[0.25rem]">{titulo}</h3>
      <p className="text-[0.8125rem] text-ink-muted">
        Os números desta seção estão temporariamente indisponíveis — volte a acessar em alguns minutos.
      </p>
    </div>
  )
}

// ── medidor de verba (limite por PLANO) ──

export function GaugeMidia({ gastoMes, limite, planoNome }: { gastoMes: number; limite: number; planoNome: string }) {
  const pct = Math.min(100, (gastoMes / limite) * 100)
  const estourou = gastoMes > limite
  const cor = estourou || pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22c55e'
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.5rem] card-shadow">
      <div className="flex items-center gap-[0.5rem] mb-[0.25rem]">
        <Gauge className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={2} />
        <h3 className="font-semibold text-ink-primary">Verba de anúncios do mês</h3>
      </div>
      <p className="text-[0.75rem] text-ink-muted mb-[1rem]">
        Seu plano ({planoNome}) inclui até {fmtMoeda(limite)} de investimento em mídia por mês.
      </p>
      <div className="h-[0.75rem] rounded-full bg-surface-hover overflow-hidden mb-[0.5rem]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cor }} />
      </div>
      <p className="text-[0.8125rem] text-ink-secondary">
        <span className="font-semibold text-ink-primary">{fmtMoeda(gastoMes)}</span> investidos até agora
        ({pct.toFixed(0)}% do limite){estourou && <span className="text-status-red font-medium"> — limite ultrapassado</span>}.
      </p>
    </div>
  )
}

// ── TRÁFEGO (Google Ads) ──

interface TrafegoDidaticoProps {
  periodo:       Periodo
  kpis:          KpisAdsComparativo | null
  termos:        LinhaTermoAds[] | null
  diasHorarios:  DiasHorariosAds | null
  dispositivos:  LinhaDispositivoAds[] | null
  geografia:     LinhaLocalAds[] | null
  demografia:    DemografiaAds | null
}

export function TrafegoDidatico({ periodo, kpis, termos, diasHorarios, dispositivos, geografia, demografia }: TrafegoDidaticoProps) {
  return (
    <section className="space-y-[1rem]">
      <h2 className="text-xl font-semibold text-ink-primary">Seus anúncios no Google</h2>

      {kpis ? (
        <>
          <div className="bg-ads-500/5 border border-ads-500/15 rounded-xl p-[1.25rem]">
            <p className="text-[0.9375rem] text-ink-primary leading-relaxed">
              De <strong>{fmtData(periodo.inicio)}</strong> a <strong>{fmtData(periodo.fim)}</strong>, seu anúncio
              apareceu <strong>{fmtNum(kpis.atual.impressoes)} vezes</strong> no Google,
              recebeu <strong>{fmtNum(kpis.atual.cliques)} cliques</strong> e
              gerou <strong>{fmtConv(kpis.atual.conversoes)} contatos</strong>, com investimento
              de <strong>{fmtMoeda(kpis.atual.custo)}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[0.75rem]">
            <KpiDidatico label="Apareceu no Google" valor={fmtNum(kpis.atual.impressoes)}
              explicacao="Quantas vezes seu anúncio foi exibido nos resultados."
              atual={kpis.atual.impressoes} anterior={kpis.anterior.impressoes} />
            <KpiDidatico label="Cliques" valor={fmtNum(kpis.atual.cliques)}
              explicacao="Pessoas que clicaram no anúncio e chegaram ao seu site."
              atual={kpis.atual.cliques} anterior={kpis.anterior.cliques} />
            <KpiDidatico label="Contatos gerados" valor={fmtConv(kpis.atual.conversoes)}
              explicacao="Ações valiosas: WhatsApp, ligação ou formulário."
              atual={kpis.atual.conversoes} anterior={kpis.anterior.conversoes} />
            <KpiDidatico label="Investimento" valor={fmtMoeda(kpis.atual.custo)}
              explicacao="Quanto foi investido em mídia neste período." />
            <KpiDidatico label="Custo por clique" valor={fmtMoeda(kpis.atual.cpcMedio)}
              explicacao="Valor médio pago por cada visita ao site."
              atual={kpis.atual.cpcMedio} anterior={kpis.anterior.cpcMedio} quedaEhBoa />
            <KpiDidatico label="Custo por contato" valor={kpis.atual.conversoes > 0 ? fmtMoeda(kpis.atual.cpa) : '—'}
              explicacao="Quanto custou, em média, cada contato gerado."
              atual={kpis.atual.cpa} anterior={kpis.anterior.cpa} quedaEhBoa />
            <KpiDidatico label="Taxa de cliques" valor={fmtPct(kpis.atual.ctr)}
              explicacao="De cada 100 pessoas que viram, quantas clicaram."
              atual={kpis.atual.ctr} anterior={kpis.anterior.ctr} />
            <KpiDidatico
              label="Apareceu no topo"
              valor={kpis.atual.impressionShare.parcelaPrimeiraPosicao !== null ? fmtPct(kpis.atual.impressionShare.parcelaPrimeiraPosicao) : '—'}
              explicacao="Presença nas primeiras posições da página de busca."
              atual={kpis.atual.impressionShare.parcelaPrimeiraPosicao ?? undefined}
              anterior={kpis.anterior.impressionShare.parcelaPrimeiraPosicao ?? undefined} />
          </div>
        </>
      ) : (
        <SecaoIndisponivel titulo="Resumo dos anúncios" />
      )}

      {termos && termos.length > 0 && (
        <Secao titulo="O que as pessoas pesquisaram"
          subtitulo="Termos digitados no Google que fizeram seu anúncio aparecer — os 10 com mais cliques.">
          <BarraLista linhas={termos.slice(0, 10).map((t) => ({
            chave: t.termo, label: t.termo, valor: t.cliques,
            detalhe: `cliques · ${fmtConv(t.conversoes)} contatos`,
          }))} />
        </Secao>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1rem]">
        {diasHorarios && (
          <Secao titulo="Dias com mais resultado"
            subtitulo="Cliques nos seus anúncios em cada dia da semana.">
            <BarraLista linhas={diasHorarios.porDiaSemana.map((d) => ({
              chave: d.dia, label: DIA_CURTO[d.dia] ?? d.dia, valor: d.cliques,
              detalhe: `cliques`,
            }))} />
          </Secao>
        )}

        {dispositivos && dispositivos.length > 0 && (
          <Secao titulo="De qual aparelho vieram os cliques"
            subtitulo="Onde as pessoas estavam quando clicaram no anúncio.">
            <BarraLista linhas={dispositivos.map((d) => ({
              chave: d.dispositivo, label: DISPOSITIVO_LABEL[d.dispositivo] ?? d.dispositivo,
              valor: d.cliques, detalhe: 'cliques', cor: '#3B82F6',
            }))} />
          </Secao>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1rem]">
        {geografia && geografia.length > 0 && (
          <Secao titulo="De onde são as pessoas"
            subtitulo="Regiões onde estavam as pessoas que clicaram no anúncio.">
            <BarraLista linhas={geografia.slice(0, 8).map((l, i) => ({
              chave: `${l.local}-${i}`, label: nomeLocal(l.local, l.tipo), valor: l.cliques,
              detalhe: 'cliques', cor: '#10B981',
            }))} />
          </Secao>
        )}

        {demografia && (demografia.faixasEtarias.length > 0 || demografia.generos.length > 0) && (
          <Secao titulo="Perfil de quem clicou"
            subtitulo="Idade e gênero das pessoas alcançadas (quando o Google consegue identificar).">
            <div className="grid grid-cols-2 gap-[1rem]">
              <BarraLista linhas={demografia.faixasEtarias.map((f) => ({
                chave: f.faixa, label: FAIXA_LABEL[f.faixa] ?? f.faixa, valor: f.cliques, detalhe: 'cliques',
              }))} />
              <BarraLista linhas={demografia.generos.map((g) => ({
                chave: g.genero, label: GENERO_LABEL[g.genero] ?? g.genero, valor: g.cliques,
                detalhe: 'cliques', cor: '#8b5cf6',
              }))} />
            </div>
          </Secao>
        )}
      </div>
    </section>
  )
}

// ── SITE (GA4) ──

// Tradução didática de origem/mídia para quem não vive de marketing.
function origemDidatica(fonte: string, midia: string): string {
  const f = fonte.toLowerCase()
  const m = midia.toLowerCase()
  if (f === '(direct)') return 'Acesso direto (digitou o endereço ou salvou o link)'
  if (m === 'cpc' || m === 'ppc' || m === 'paid') return f.includes('google') ? 'Anúncios no Google' : `Anúncios (${fonte})`
  if (m === 'organic') return f.includes('google') ? 'Busca no Google (resultado orgânico)' : `Busca orgânica (${fonte})`
  if (f.includes('instagram') || f === 'ig') return 'Instagram'
  if (f.includes('facebook') || f === 'fb' || f === 'm.facebook.com') return 'Facebook'
  if (f.includes('whatsapp') || f === 'wa') return 'WhatsApp'
  if (m === 'referral') return `Indicação de outro site (${fonte})`
  if (m === 'social') return `Rede social (${fonte})`
  return `${fonte} / ${midia}`
}

interface SiteDidaticoProps {
  periodo:        Periodo
  kpis:           KpisGA4Comparativo | null
  aquisicao:      LinhaOrigemGA4[] | null
  paginas:        LinhaPaginaGA4[] | null
  dispositivos:   LinhaDispositivoGA4[] | null
  novoRecorrente: LinhaTipoUsuarioGA4[] | null
  geografia:      GeografiaGA4 | null
}

export function SiteDidatico({ periodo, kpis, aquisicao, paginas, dispositivos, novoRecorrente, geografia }: SiteDidaticoProps) {
  return (
    <section className="space-y-[1rem]">
      <h2 className="text-xl font-semibold text-ink-primary">Seu site</h2>

      {kpis ? (
        <>
          <div className="bg-status-blue/5 border border-status-blue/15 rounded-xl p-[1.25rem]">
            <p className="text-[0.9375rem] text-ink-primary leading-relaxed">
              De <strong>{fmtData(periodo.inicio)}</strong> a <strong>{fmtData(periodo.fim)}</strong>, seu site
              recebeu <strong>{fmtNum(kpis.atual.sessoes)} visitas</strong> de{' '}
              <strong>{fmtNum(kpis.atual.usuariosAtivos)} pessoas</strong> —{' '}
              <strong>{fmtNum(kpis.atual.usuariosNovos)}</strong> delas conhecendo seu site pela primeira vez.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[0.75rem]">
            <KpiDidatico label="Visitas" valor={fmtNum(kpis.atual.sessoes)}
              explicacao="Cada vez que alguém abriu e navegou no seu site."
              atual={kpis.atual.sessoes} anterior={kpis.anterior.sessoes} />
            <KpiDidatico label="Páginas vistas" valor={fmtNum(kpis.atual.visualizacoes)}
              explicacao="Total de páginas abertas somando todas as visitas."
              atual={kpis.atual.visualizacoes} anterior={kpis.anterior.visualizacoes} />
            <KpiDidatico label="Novos visitantes" valor={fmtNum(kpis.atual.usuariosNovos)}
              explicacao="Pessoas que visitaram seu site pela primeira vez."
              atual={kpis.atual.usuariosNovos} anterior={kpis.anterior.usuariosNovos} />
            <KpiDidatico label="Tempo médio no site" valor={fmtDuracao(kpis.atual.duracaoMediaSessao)}
              explicacao="Quanto tempo cada visita durou, em média."
              atual={kpis.atual.duracaoMediaSessao} anterior={kpis.anterior.duracaoMediaSessao} />
            <KpiDidatico label="Visitas engajadas" valor={fmtPct(kpis.atual.taxaEngajamento)}
              explicacao="Visitas que interagiram de verdade com o conteúdo."
              atual={kpis.atual.taxaEngajamento} anterior={kpis.anterior.taxaEngajamento} />
            <KpiDidatico label="Saíram sem interagir" valor={fmtPct(kpis.atual.taxaRejeicao)}
              explicacao="Visitas que fecharam o site logo ao entrar."
              atual={kpis.atual.taxaRejeicao} anterior={kpis.anterior.taxaRejeicao} quedaEhBoa />
            <KpiDidatico label="Leram até o fim" valor={fmtNum(kpis.atual.usuariosScrollFim)}
              explicacao="Pessoas que rolaram a página até o final."
              atual={kpis.atual.usuariosScrollFim} anterior={kpis.anterior.usuariosScrollFim} />
            <KpiDidatico label="Ações por visita" valor={kpis.atual.eventosPorSessao.toFixed(1).replace('.', ',')}
              explicacao="Quantas interações (cliques, rolagens…) cada visita fez."
              atual={kpis.atual.eventosPorSessao} anterior={kpis.anterior.eventosPorSessao} />
          </div>
        </>
      ) : (
        <SecaoIndisponivel titulo="Resumo do site" />
      )}

      {aquisicao && aquisicao.length > 0 && (
        <Secao titulo="De onde vieram as visitas"
          subtitulo="Como as pessoas chegaram até o seu site.">
          <BarraLista linhas={aquisicao.slice(0, 8).map((a, i) => ({
            chave: `${a.fonte}/${a.midia}-${i}`, label: origemDidatica(a.fonte, a.midia),
            valor: a.sessoes, detalhe: 'visitas', cor: '#3B82F6',
          }))} />
        </Secao>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1rem]">
        {paginas && paginas.length > 0 && (
          <Secao titulo="Páginas mais visitadas"
            subtitulo="O que as pessoas mais abriram no seu site.">
            <BarraLista linhas={paginas.slice(0, 6).map((p) => ({
              chave: p.pagina, label: p.pagina === '/' ? 'Página inicial' : p.pagina,
              valor: p.visualizacoes, detalhe: 'visualizações',
            }))} />
          </Secao>
        )}

        {dispositivos && dispositivos.length > 0 && (
          <Secao titulo="De qual aparelho acessaram"
            subtitulo="Celular, computador ou tablet.">
            <BarraLista linhas={dispositivos.map((d) => ({
              chave: d.dispositivo,
              label: DISPOSITIVO_GA4_LABEL[d.dispositivo.toLowerCase()] ?? d.dispositivo,
              valor: d.sessoes, detalhe: 'visitas', cor: '#10B981',
            }))} />
          </Secao>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1rem]">
        {novoRecorrente && novoRecorrente.length > 0 && (
          <Secao titulo="Visitantes novos × que voltaram"
            subtitulo="Quem veio pela primeira vez e quem já conhecia o site.">
            <BarraLista linhas={novoRecorrente.filter((t) => t.usuarios > 0).map((t) => ({
              chave: t.tipo, label: TIPO_USUARIO_LABEL[t.tipo] ?? t.tipo,
              valor: t.usuarios, detalhe: 'pessoas', cor: '#8b5cf6',
            }))} />
          </Secao>
        )}

        {geografia && geografia.cidades.length > 0 && (
          <Secao titulo="De onde são os visitantes"
            subtitulo="Cidades com mais acessos ao seu site.">
            <BarraLista linhas={geografia.cidades.filter((l) => l.local && l.local !== '(not set)').slice(0, 6).map((l, i) => ({
              chave: `${l.local}-${i}`, label: l.local,
              valor: l.sessoes, detalhe: 'visitas', cor: '#06b6d4',
            }))} />
          </Secao>
        )}
      </div>
    </section>
  )
}
