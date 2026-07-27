'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { LinhaOrigemGA4 } from '@/lib/ga4-detalhes'
import { fmtConv, fmtNum, fmtPct } from '../trafego/labels'
import { fmtDuracao } from './labelsGa4'
import { CelulaMetrica, faixaColuna } from '../shared/CelulaMetrica'
import { useOrdenacao, ThOrdenavel, type Acessadores } from '../shared/ordenacao'
import { BotaoCsv, type ColunaCsv } from '../shared/BotaoCsv'

// De onde vem o tráfego (origem/mídia da sessão) — tabela completa (6
// métricas padrão + Conversões/Tx. conversão como extra) + pizza. Cores
// estáveis por posição (top 6 + "outras").

const CORES = ['#FFB100', '#3B82F6', '#10B981', '#8b5cf6', '#06b6d4', '#f59e0b', '#6B7280']

const COLUNAS: Array<{ label: string; chave: string }> = [
  { label: 'Origem / mídia', chave: 'origem' },
  { label: 'Visualiz.', chave: 'visualizacoes' },
  { label: 'Usuários', chave: 'usuarios' },
  { label: 'Novos', chave: 'usuariosNovos' },
  { label: 'Sessões', chave: 'sessoes' },
  { label: 'Engaj.', chave: 'taxaEngajamento' },
  { label: 'Rejeição', chave: 'taxaRejeicao' },
  { label: 'Duração', chave: 'duracaoMediaSessao' },
  { label: 'Conv.', chave: 'conversoes' },
  { label: 'Tx. conv.', chave: 'taxaConversao' },
]

const ACESSADORES: Acessadores<LinhaOrigemGA4> = {
  origem:             (l) => `${l.fonte} / ${l.midia}`,
  visualizacoes:      (l) => l.visualizacoes,
  usuarios:           (l) => l.usuarios,
  usuariosNovos:      (l) => l.usuariosNovos,
  sessoes:            (l) => l.sessoes,
  taxaEngajamento:    (l) => l.taxaEngajamento,
  taxaRejeicao:       (l) => l.taxaRejeicao,
  duracaoMediaSessao: (l) => l.duracaoMediaSessao,
  conversoes:         (l) => l.conversoes,
  taxaConversao:      (l) => l.taxaConversao,
}

const CSV: ColunaCsv<LinhaOrigemGA4>[] = [
  { label: 'Origem / mídia', valor: (l) => `${l.fonte} / ${l.midia}` },
  { label: 'Visualizações', valor: (l) => fmtNum(l.visualizacoes) },
  { label: 'Usuários', valor: (l) => fmtNum(l.usuarios) },
  { label: 'Novos', valor: (l) => fmtNum(l.usuariosNovos) },
  { label: 'Sessões', valor: (l) => fmtNum(l.sessoes) },
  { label: 'Engajamento', valor: (l) => fmtPct(l.taxaEngajamento) },
  { label: 'Rejeição', valor: (l) => fmtPct(l.taxaRejeicao) },
  { label: 'Duração', valor: (l) => fmtDuracao(l.duracaoMediaSessao) },
  { label: 'Conversões', valor: (l) => fmtConv(l.conversoes) },
  { label: 'Tx. conv.', valor: (l) => fmtPct(l.taxaConversao) },
]

export function AquisicaoCard({ dados }: { dados: LinhaOrigemGA4[] }) {
  const totalSessoes = dados.reduce((s, l) => s + l.sessoes, 0)
  const top = dados.slice(0, 6)
  const outras = dados.slice(6).reduce((s, l) => s + l.sessoes, 0)
  const chartData = [
    ...top.map((l, i) => ({ name: `${l.fonte} / ${l.midia}`, value: l.sessoes, cor: CORES[i] })),
    ...(outras > 0 ? [{ name: 'Outras origens', value: outras, cor: CORES[6] }] : []),
  ]

  const total = useMemo(() => dados.reduce((acc, l) => {
    const pesoTotal = acc.sessoes + l.sessoes
    const media = (a: number, b: number) => (pesoTotal > 0 ? (a * acc.sessoes + b * l.sessoes) / pesoTotal : 0)
    return {
      visualizacoes:      acc.visualizacoes + l.visualizacoes,
      usuarios:           acc.usuarios + l.usuarios,
      usuariosNovos:      acc.usuariosNovos + l.usuariosNovos,
      sessoes:            acc.sessoes + l.sessoes,
      conversoes:         acc.conversoes + l.conversoes,
      taxaEngajamento:    media(acc.taxaEngajamento, l.taxaEngajamento),
      taxaRejeicao:       media(acc.taxaRejeicao, l.taxaRejeicao),
      duracaoMediaSessao: media(acc.duracaoMediaSessao, l.duracaoMediaSessao),
    }
  }, { visualizacoes: 0, usuarios: 0, usuariosNovos: 0, sessoes: 0, conversoes: 0, taxaEngajamento: 0, taxaRejeicao: 0, duracaoMediaSessao: 0 }), [dados])

  // Faixas por coluna (heatmap) sobre as linhas visíveis.
  const faixas = useMemo(() => ({
    usuarios:      faixaColuna(dados, (l) => l.usuarios),
    usuariosNovos: faixaColuna(dados, (l) => l.usuariosNovos),
    sessoes:       faixaColuna(dados, (l) => l.sessoes),
    engajamento:   faixaColuna(dados, (l) => l.taxaEngajamento),
    rejeicao:      faixaColuna(dados, (l) => l.taxaRejeicao),
    duracao:       faixaColuna(dados, (l) => l.duracaoMediaSessao),
    conversoes:    faixaColuna(dados, (l) => l.conversoes),
    taxaConversao: faixaColuna(dados, (l) => l.taxaConversao),
  }), [dados])

  const { ordenadas, estado, alternar } = useOrdenacao(dados, ACESSADORES)
  // Cor do ponto = rank ORIGINAL da origem (casa com as fatias da pizza),
  // não a posição após ordenar.
  const rankOriginal = useMemo(
    () => new Map(dados.map((l, i) => [`${l.fonte}/${l.midia}`, i])),
    [dados],
  )

  return (
    <div className="space-y-[1rem]">
      {/* Donut + legenda lado a lado (a tabela completa vem abaixo) — evita o
          donut sozinho com uma faixa vazia à direita. */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-[1.5rem]">
        <div className="h-[10rem] w-[15rem] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={30} outerRadius={62} paddingAngle={2} dataKey="value">
                {chartData.map((entry) => <Cell key={entry.name} fill={entry.cor} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                formatter={(v: unknown, name: unknown) => [
                  `${fmtNum(Number(v))} sessões (${totalSessoes > 0 ? ((Number(v) / totalSessoes) * 100).toFixed(1) : 0}%)`,
                  String(name),
                ] as [string, string]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-[1.5rem] gap-y-[0.5rem] min-w-0 self-center">
          {chartData.map((entry) => {
            const pct = totalSessoes > 0 ? (entry.value / totalSessoes) * 100 : 0
            return (
              <li key={entry.name} className="flex items-center gap-[0.5rem] text-[0.8125rem] min-w-0">
                <span className="w-[0.5rem] h-[0.5rem] rounded-full shrink-0" style={{ backgroundColor: entry.cor }} />
                <span className="text-ink-primary font-medium truncate" title={entry.name}>{entry.name}</span>
                <span className="ml-auto text-ink-secondary tabular-nums shrink-0">
                  {fmtNum(entry.value)}<span className="text-ink-muted"> · {pct.toFixed(1).replace('.', ',')}%</span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="flex justify-end">
        <BotaoCsv nome="aquisicao-origem-midia" colunas={CSV} linhas={ordenadas} />
      </div>
      <div className="overflow-x-auto max-h-[18rem] overflow-y-auto">
        <table className="w-full text-[0.8125rem]">
          <thead className="sticky top-0 bg-surface-card">
            <tr className="border-b border-surface-border">
              {COLUNAS.map((c) => (
                <ThOrdenavel key={c.chave} label={c.label} chave={c.chave} estado={estado} alternar={alternar} />
              ))}
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((l) => (
              <tr key={`${l.fonte}/${l.midia}`} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover/50 transition-colors">
                <td className="py-[0.5rem] pr-[1rem]">
                  <div className="flex items-center gap-[0.375rem] min-w-0">
                    <span className="w-[0.5rem] h-[0.5rem] rounded-full shrink-0" style={{ backgroundColor: CORES[Math.min(rankOriginal.get(`${l.fonte}/${l.midia}`) ?? 6, 6)] }} />
                    <span className="text-ink-primary font-medium truncate max-w-[12rem]" title={`${l.fonte} / ${l.midia}`}>
                      {l.fonte} <span className="text-ink-muted font-normal">/ {l.midia}</span>
                    </span>
                  </div>
                </td>
                <td className="py-[0.5rem] pr-[1rem] text-status-blue font-medium">{fmtNum(l.visualizacoes)}</td>
                <CelulaMetrica valor={l.usuarios} faixa={faixas.usuarios} tom="verde" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.usuarios)}</CelulaMetrica>
                <CelulaMetrica valor={l.usuariosNovos} faixa={faixas.usuariosNovos} tom="verde" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.usuariosNovos)}</CelulaMetrica>
                <CelulaMetrica valor={l.sessoes} faixa={faixas.sessoes} tom="verde" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(l.sessoes)}</CelulaMetrica>
                <CelulaMetrica valor={l.taxaEngajamento} faixa={faixas.engajamento} tom="verde" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtPct(l.taxaEngajamento)}</CelulaMetrica>
                <CelulaMetrica valor={l.taxaRejeicao} faixa={faixas.rejeicao} tom="vermelho" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtPct(l.taxaRejeicao)}</CelulaMetrica>
                <CelulaMetrica valor={l.duracaoMediaSessao} faixa={faixas.duracao} tom="verde" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtDuracao(l.duracaoMediaSessao)}</CelulaMetrica>
                <CelulaMetrica valor={l.conversoes} faixa={faixas.conversoes} tom="verde" className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtConv(l.conversoes)}</CelulaMetrica>
                <CelulaMetrica valor={l.taxaConversao} faixa={faixas.taxaConversao} tom="verde" className="py-[0.5rem] text-ink-secondary">{fmtPct(l.taxaConversao)}</CelulaMetrica>
              </tr>
            ))}
          </tbody>
          {dados.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-surface-border font-semibold">
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">Total geral</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.visualizacoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.usuarios)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.usuariosNovos)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.sessoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtPct(total.taxaEngajamento)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtPct(total.taxaRejeicao)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtDuracao(total.duracaoMediaSessao)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtConv(total.conversoes)}</td>
                <td className="py-[0.5rem] text-ink-primary">{total.sessoes > 0 ? fmtPct((total.conversoes / total.sessoes) * 100) : '—'}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
