'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts'
import type { LinhaDispositivoGA4, TecnologiaGA4 } from '@/lib/ga4-detalhes'
import { fmtNum, fmtPct } from '../trafego/labels'
import { DISPOSITIVO_GA4_LABEL, fmtDuracao } from './labelsGa4'

// Por dispositivo — réplica do Looker (GA4-1): tabela completa + donuts de
// participação, mesmo padrão do dashboard de Ads.

const CORES: Record<string, string> = {
  mobile: '#FFB100', desktop: '#10B981', tablet: '#3B82F6', 'smart tv': '#8b5cf6',
}

const COLUNAS = ['Visualiz.', 'Usuários', 'Novos', 'Sessões', 'Engaj.', 'Rejeição', 'Duração']

function Donut({ titulo, dados, metrica, formatter }: {
  titulo: string
  dados: LinhaDispositivoGA4[]
  metrica: 'visualizacoes' | 'sessoes' | 'usuariosNovos'
  formatter: (v: number) => string
}) {
  const total = dados.reduce((s, d) => s + d[metrica], 0)
  const dominante = [...dados].sort((a, b) => b[metrica] - a[metrica])[0]
  const pctDominante = total > 0 && dominante ? (dominante[metrica] / total) * 100 : 0
  const chave = (d: LinhaDispositivoGA4) => d.dispositivo.toLowerCase()

  return (
    <div className="text-center">
      <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.25rem]">{titulo}</p>
      <div className="h-[5.5rem]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dados} dataKey={metrica} nameKey="dispositivo"
              cx="50%" cy="50%" innerRadius={28} outerRadius={40} paddingAngle={2}
            >
              {dados.map((d) => <Cell key={d.dispositivo} fill={CORES[chave(d)] ?? '#6B7280'} />)}
              <Label
                position="center"
                content={() => (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-ink-primary text-[0.75rem] font-bold">
                    {pctDominante.toFixed(1)}%
                  </text>
                )}
              />
            </Pie>
            <Tooltip
              contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
              formatter={(v: unknown, nome: unknown) => [formatter(Number(v)), DISPOSITIVO_GA4_LABEL[String(nome).toLowerCase()] ?? String(nome)] as [string, string]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-ink-muted text-[0.6875rem]">{DISPOSITIVO_GA4_LABEL[chave(dominante ?? { dispositivo: '' } as LinhaDispositivoGA4)] ?? '—'}</p>
    </div>
  )
}

export function DispositivosGA4Card({ dados }: { dados: LinhaDispositivoGA4[] }) {
  const total = useMemo(() => dados.reduce((acc, d) => {
    const pesoTotal = acc.sessoes + d.sessoes
    const media = (a: number, b: number) => (pesoTotal > 0 ? (a * acc.sessoes + b * d.sessoes) / pesoTotal : 0)
    return {
      visualizacoes:      acc.visualizacoes + d.visualizacoes,
      usuarios:           acc.usuarios + d.usuarios,
      usuariosNovos:      acc.usuariosNovos + d.usuariosNovos,
      sessoes:            acc.sessoes + d.sessoes,
      taxaEngajamento:    media(acc.taxaEngajamento, d.taxaEngajamento),
      taxaRejeicao:       media(acc.taxaRejeicao, d.taxaRejeicao),
      duracaoMediaSessao: media(acc.duracaoMediaSessao, d.duracaoMediaSessao),
    }
  }, { visualizacoes: 0, usuarios: 0, usuariosNovos: 0, sessoes: 0, taxaEngajamento: 0, taxaRejeicao: 0, duracaoMediaSessao: 0 }), [dados])

  return (
    <div>
      <div className="overflow-x-auto mb-[1.25rem]">
        <table className="w-full text-[0.8125rem]">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left pb-[0.5rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem]">Dispositivo</th>
              {COLUNAS.map((h) => (
                <th key={h} className="text-left pb-[0.5rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.map((d) => (
              <tr key={d.dispositivo} className="border-b border-surface-border/60 last:border-0">
                <td className="py-[0.5rem] pr-[1rem] text-ink-primary font-medium">{DISPOSITIVO_GA4_LABEL[d.dispositivo.toLowerCase()] ?? d.dispositivo}</td>
                <td className="py-[0.5rem] pr-[1rem] text-status-blue font-medium">{fmtNum(d.visualizacoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(d.usuarios)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(d.usuariosNovos)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(d.sessoes)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-status-green">{fmtPct(d.taxaEngajamento)}</td>
                <td className="py-[0.5rem] pr-[1rem] text-status-orange">{fmtPct(d.taxaRejeicao)}</td>
                <td className="py-[0.5rem] text-ink-secondary">{fmtDuracao(d.duracaoMediaSessao)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-surface-border font-semibold">
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">Total geral</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.visualizacoes)}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.usuarios)}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.usuariosNovos)}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtNum(total.sessoes)}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtPct(total.taxaEngajamento)}</td>
              <td className="py-[0.5rem] pr-[1rem] text-ink-primary">{fmtPct(total.taxaRejeicao)}</td>
              <td className="py-[0.5rem] text-ink-primary">{fmtDuracao(total.duracaoMediaSessao)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-[0.75rem]">
        <Donut titulo="Visualizações" dados={dados} metrica="visualizacoes" formatter={fmtNum} />
        <Donut titulo="Novos usuários" dados={dados} metrica="usuariosNovos" formatter={fmtNum} />
        <Donut titulo="Sessões" dados={dados} metrica="sessoes" formatter={fmtNum} />
      </div>
    </div>
  )
}

// ─── Tecnologia: SO, Resolução, Navegador, Dispositivo detalhado ────────────

function TabelaSimples<T>({ titulo, linhas, coluna, campo, cor }: {
  titulo: string
  linhas: T[]
  coluna: (l: T) => string
  campo:  (l: T) => { sessoes: number; usuarios: number }
  cor:    string
}) {
  return (
    <div>
      <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.5rem]">{titulo}</p>
      <div className="space-y-[0.375rem] max-h-[14rem] overflow-y-auto pr-[0.25rem]">
        {linhas.slice(0, 10).map((l, i) => {
          const m = campo(l)
          return (
            <div key={i} className="flex items-center justify-between text-[0.8125rem]">
              <span className="text-ink-secondary truncate max-w-[10rem]" title={coluna(l)}>{coluna(l)}</span>
              <span className="font-medium shrink-0" style={{ color: cor }}>{fmtNum(m.sessoes)} sessões</span>
            </div>
          )
        })}
        {linhas.length === 0 && <p className="text-ink-muted text-[0.75rem] italic">Sem dados no período.</p>}
      </div>
    </div>
  )
}

export function TecnologiaCard({ dados }: { dados: TecnologiaGA4 }) {
  return (
    <div className="space-y-[1.25rem]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.25rem]">
        <TabelaSimples
          titulo="Sistema operacional"
          linhas={dados.sistemas}
          coluna={(s) => `${s.sistema} ${s.versao}`}
          campo={(s) => s}
          cor="#3B82F6"
        />
        <TabelaSimples
          titulo="Resolução de tela"
          linhas={dados.resolucoes}
          coluna={(r) => r.resolucao}
          campo={(r) => r}
          cor="#10B981"
        />
      </div>

      <div>
        <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.5rem]">Navegador</p>
        <div className="overflow-x-auto max-h-[16rem] overflow-y-auto">
          <table className="w-full text-[0.8125rem]">
            <thead className="sticky top-0 bg-surface-card">
              <tr className="border-b border-surface-border">
                <th className="text-left pb-[0.5rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem]">Navegador</th>
                {['Visualiz.', 'Usuários', 'Novos', 'Sessões', 'Engaj.', 'Rejeição', 'Duração'].map((h) => (
                  <th key={h} className="text-left pb-[0.5rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dados.navegadores.map((n) => (
                <tr key={n.navegador} className="border-b border-surface-border/60 last:border-0">
                  <td className="py-[0.5rem] pr-[1rem] text-ink-primary font-medium">{n.navegador}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-status-blue font-medium">{fmtNum(n.visualizacoes)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(n.usuarios)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(n.usuariosNovos)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(n.sessoes)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-status-green">{fmtPct(n.taxaEngajamento)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-status-orange">{fmtPct(n.taxaRejeicao)}</td>
                  <td className="py-[0.5rem] text-ink-secondary">{fmtDuracao(n.duracaoMediaSessao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {dados.navegadores.length === 0 && <p className="text-ink-muted text-[0.75rem] italic py-[0.75rem]">Sem dados no período.</p>}
        </div>
      </div>

      <div>
        <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.5rem]">Dispositivo, modelo e marca</p>
        <div className="overflow-x-auto max-h-[16rem] overflow-y-auto">
          <table className="w-full text-[0.8125rem]">
            <thead className="sticky top-0 bg-surface-card">
              <tr className="border-b border-surface-border">
                {['Dispositivo', 'Modelo', 'Marca', 'Visualiz.', 'Novos', 'Sessões', 'Duração'].map((h) => (
                  <th key={h} className="text-left pb-[0.5rem] text-ink-muted text-[0.6875rem] font-semibold uppercase tracking-wide pr-[1rem] last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dados.dispositivosDetalhe.map((d, i) => (
                <tr key={i} className="border-b border-surface-border/60 last:border-0">
                  <td className="py-[0.5rem] pr-[1rem] text-ink-primary font-medium">{DISPOSITIVO_GA4_LABEL[d.dispositivo.toLowerCase()] ?? d.dispositivo}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{d.modelo || '(não informado)'}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{d.marca || '(não informado)'}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-status-blue font-medium">{fmtNum(d.visualizacoes)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(d.usuariosNovos)}</td>
                  <td className="py-[0.5rem] pr-[1rem] text-ink-secondary">{fmtNum(d.sessoes)}</td>
                  <td className="py-[0.5rem] text-ink-secondary">{fmtDuracao(d.duracaoMediaSessao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {dados.dispositivosDetalhe.length === 0 && <p className="text-ink-muted text-[0.75rem] italic py-[0.75rem]">Sem dados no período.</p>}
        </div>
      </div>
    </div>
  )
}
