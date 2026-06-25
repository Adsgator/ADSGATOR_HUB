'use client'

import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { brl, rotuloContexto } from '@/components/configuracoes/uso-ia-format'
import { useAssistantStore } from '@/lib/store/assistant-store'
import { useRightSidebarStore } from '@/lib/store/right-sidebar-store'

// ─── SEÇÃO ANALYTICS DE COMPORTAMENTO ─────────────────────────────────────────
// Como a Gator é usada: por tipo de uso (pizza), ferramentas + taxa de falha,
// tendência no tempo (linha) + heatmap por hora, e conversas destaque.
// Dados de /api/v1/ia/uso/analytics. Custo é ESTIMADO.

interface Analytics {
  por_contexto: { contexto: string; chamadas: number; tokens: number; custo: number }[]
  ferramentas:  { nome: string; chamadas: number; falhas: number; taxa_falha: number }[]
  serie_30d:    { dia: string; custo: number; chamadas: number }[]
  heatmap:      number[]
  conversas_destaque: {
    mais_caras:  ConversaDestaque[]
    mais_longas: ConversaDestaque[]
    mais_acoes:  ConversaDestaque[]
  }
}

interface ConversaDestaque {
  id: string; titulo: string; custo: number; mensagens: number; acoes: number
}

// Paleta dos status tokens (pizza por contexto)
const CORES = ['#FFB100', '#3b82f6', '#22c55e', '#8b5cf6', '#06b6d4', '#f59e0b']

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[0.75rem]">{titulo}</h3>
      {children}
    </div>
  )
}

export function UsoAnalytics() {
  const [dados, setDados] = useState<Analytics | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [destaque, setDestaque] = useState<'mais_caras' | 'mais_longas' | 'mais_acoes'>('mais_caras')

  const abrirConversa = useAssistantStore((s) => s.abrirConversa)
  const openDrawer    = useRightSidebarStore((s) => s.openDrawer)

  useEffect(() => {
    fetch('/api/v1/ia/uso/analytics')
      .then((r) => r.json())
      .then((d: Analytics & { error?: string }) => {
        if (d.error) { setErro(d.error); return }
        setDados(d)
      })
      .catch(() => setErro('Falha ao carregar os analytics'))
      .finally(() => setCarregando(false))
  }, [])

  function abrir(id: string) {
    if (useRightSidebarStore.getState().activeDrawer !== 'chat') openDrawer('chat')
    void abrirConversa(id)
  }

  if (carregando) return <div className="text-ink-muted text-[0.875rem]">Carregando analytics…</div>
  if (erro) return <div className="text-status-red text-[0.875rem]">{erro}</div>
  if (!dados) return null

  const semDados = dados.por_contexto.length === 0
  if (semDados) {
    return <div className="text-ink-muted text-[0.875rem]">Ainda não há uso registrado para analisar. Use a Gator e volte aqui.</div>
  }

  const pizza = dados.por_contexto.map((c) => ({ nome: rotuloContexto(c.contexto), chamadas: c.chamadas, custo: c.custo }))
  const maxHora = Math.max(...dados.heatmap, 1)
  const listaDestaque = dados.conversas_destaque[destaque]

  return (
    <div className="flex flex-col gap-[2rem] max-w-[48rem]">
      {/* 1. Por tipo de uso (pizza) */}
      <Secao titulo="Por tipo de uso">
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1rem] card-shadow h-[16rem]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pizza} dataKey="chamadas" nameKey="nome" cx="40%" cy="50%" outerRadius={80} innerRadius={45}>
                {pizza.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
              </Pie>
              <Tooltip
                formatter={(v, _n, item) => [`${v} chamadas · ${brl((item?.payload as { custo: number })?.custo ?? 0)}`, (item?.payload as { nome: string })?.nome]}
                contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
              />
              <Legend formatter={(v) => <span className="text-ink-secondary text-[0.75rem]">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Secao>

      {/* 2. Ferramentas + taxa de falha */}
      <Secao titulo="Ferramentas mais usadas">
        {dados.ferramentas.length === 0 ? (
          <p className="text-ink-muted text-[0.875rem]">Nenhuma ferramenta executada ainda.</p>
        ) : (
          <div className="bg-surface-card border border-surface-border rounded-xl card-shadow overflow-hidden">
            <table className="w-full text-[0.875rem]">
              <thead>
                <tr className="text-ink-muted text-[0.75rem] uppercase tracking-wide border-b border-surface-border">
                  <th className="text-left font-semibold px-[1rem] py-[0.625rem]">Ferramenta</th>
                  <th className="text-right font-semibold px-[1rem] py-[0.625rem]">Chamadas</th>
                  <th className="text-right font-semibold px-[1rem] py-[0.625rem]">Falhas</th>
                </tr>
              </thead>
              <tbody>
                {dados.ferramentas.slice(0, 12).map((f) => (
                  <tr key={f.nome} className="border-b border-surface-border/50 last:border-0">
                    <td className="px-[1rem] py-[0.625rem] text-ink-primary font-mono text-[0.8125rem]">{f.nome}</td>
                    <td className="px-[1rem] py-[0.625rem] text-right text-ink-secondary font-mono">{f.chamadas}</td>
                    <td className="px-[1rem] py-[0.625rem] text-right font-mono">
                      {f.falhas > 0 ? (
                        <span className="inline-flex items-center gap-[0.25rem] text-status-red">
                          <AlertTriangle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                          {f.falhas} ({Math.round(f.taxa_falha * 100)}%)
                        </span>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Secao>

      {/* 3. Tendência no tempo + heatmap por hora */}
      <Secao titulo="Tendência (chamadas/dia, últimos 30 dias)">
        <div className="bg-surface-card border border-surface-border rounded-xl p-[1rem] card-shadow h-[12rem]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados.serie_30d} margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
              <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'var(--ink-muted)' }} tickFormatter={(d) => String(d).slice(8)} interval={4} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(v, n) => [n === 'custo' ? brl(Number(v)) : `${v} chamadas`, n === 'custo' ? 'Custo' : 'Chamadas']}
                labelFormatter={(d) => new Date(String(d)).toLocaleDateString('pt-BR')}
                contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
              />
              <Line type="monotone" dataKey="chamadas" stroke="var(--ads-500, #FFB100)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Heatmap de hora do dia */}
        <p className="text-ink-muted text-[0.75rem] mt-[1rem] mb-[0.5rem]">Chamadas por hora do dia (fuso de São Paulo)</p>
        <div className="flex gap-[0.1875rem]">
          {dados.heatmap.map((n, h) => (
            <div key={h} className="flex-1 flex flex-col items-center gap-[0.25rem]" title={`${h}h — ${n} chamada(s)`}>
              <div
                className="w-full rounded-sm bg-ads-500"
                style={{ height: '2rem', opacity: n === 0 ? 0.08 : 0.25 + 0.75 * (n / maxHora) }}
              />
              {h % 3 === 0 && <span className="text-[0.5625rem] text-ink-muted font-mono">{h}h</span>}
            </div>
          ))}
        </div>
      </Secao>

      {/* 4. Conversas destaque */}
      <Secao titulo="Conversas destaque">
        <div className="flex gap-[0.25rem] mb-[0.75rem]">
          {([['mais_caras', 'Mais caras'], ['mais_longas', 'Mais longas'], ['mais_acoes', 'Mais ações']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setDestaque(id)}
              className={`h-[1.875rem] px-[0.75rem] rounded-md text-[0.75rem] font-medium transition-colors ${
                destaque === id ? 'bg-ads-500/10 text-ads-600' : 'text-ink-muted hover:text-ink-secondary hover:bg-surface-hover'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {listaDestaque.length === 0 ? (
          <p className="text-ink-muted text-[0.875rem]">Sem conversas com uso registrado.</p>
        ) : (
          <div className="flex flex-col gap-[0.375rem]">
            {listaDestaque.map((c) => (
              <button
                key={c.id}
                onClick={() => abrir(c.id)}
                className="group flex items-center gap-[1rem] bg-surface-card border border-surface-border rounded-lg px-[1rem] py-[0.625rem] card-shadow hover:border-ads-500/40 transition-colors text-left"
              >
                <span className="flex-1 min-w-0 truncate text-ink-primary text-[0.875rem]">{c.titulo}</span>
                <span className="shrink-0 text-ink-secondary text-[0.75rem] font-mono">{brl(c.custo)}</span>
                <span className="shrink-0 text-ink-muted text-[0.75rem]">{c.mensagens} msg · {c.acoes} ações</span>
                <ExternalLink className="w-[0.875rem] h-[0.875rem] text-ink-muted group-hover:text-ads-500 shrink-0 transition-colors" strokeWidth={2} />
              </button>
            ))}
          </div>
        )}
      </Secao>
    </div>
  )
}
