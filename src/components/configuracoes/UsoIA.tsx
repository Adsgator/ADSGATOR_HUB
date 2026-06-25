'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// ─── PAINEL DE USO DA IA — bloco de CUSTO ─────────────────────────────────────
// Custo estimado hoje / mês / total + série de 30 dias + quebra por tipo de uso
// e por modelo + limite mensal de alerta. Os dados vêm de /api/v1/ia/uso/resumo
// (agrega ia_uso, capturado em toda chamada ao Vertex). Custo é ESTIMADO.

interface Resumo {
  custo_hoje:   number
  custo_mes:    number
  total:        number
  por_contexto: { contexto: string; custo: number; chamadas: number }[]
  por_modelo:   { modelo: string; custo: number; chamadas: number }[]
  serie_30d:    { dia: string; custo: number }[]
  limite:       { valor: number | null; ativo: boolean }
}

const CONTEXTO_LABEL: Record<string, string> = {
  agente:    'Assistente (chat)',
  chat:      'Completion (analytics/memória)',
  hashtags:  'Hashtags',
  briefing:  'Briefing matinal',
  copy:      'Copy de landing',
  relatorio: 'Análise de relatório',
}

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

function Card({ titulo, valor, destaque }: { titulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className={`bg-surface-card border rounded-xl p-[1.25rem] card-shadow ${destaque ? 'border-ads-500/40' : 'border-surface-border'}`}>
      <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.5rem]">{titulo}</p>
      <p className={`font-mono font-semibold ${destaque ? 'text-ads-500 text-[1.75rem]' : 'text-ink-primary text-[1.5rem]'}`}>{valor}</p>
    </div>
  )
}

export function UsoIA() {
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // Limite mensal (formulário)
  const [limiteAtivo, setLimiteAtivo] = useState(false)
  const [limiteValor, setLimiteValor] = useState('')
  const [salvandoLimite, setSalvandoLimite] = useState(false)
  const [salvoLimite, setSalvoLimite] = useState(false)

  useEffect(() => {
    fetch('/api/v1/ia/uso/resumo')
      .then((r) => r.json())
      .then((d: Resumo & { error?: string }) => {
        if (d.error) { setErro(d.error); return }
        setResumo(d)
        setLimiteAtivo(d.limite.ativo)
        setLimiteValor(d.limite.valor != null ? String(d.limite.valor) : '')
      })
      .catch(() => setErro('Falha ao carregar o uso da IA'))
      .finally(() => setCarregando(false))
  }, [])

  async function salvarLimite() {
    setSalvandoLimite(true); setSalvoLimite(false)
    const valor = parseFloat(limiteValor) || null
    await fetch('/api/v1/ia/uso/limite', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor, ativo: limiteAtivo }),
    })
    setSalvandoLimite(false)
    setSalvoLimite(true); setTimeout(() => setSalvoLimite(false), 3000)
  }

  if (carregando) return <div className="text-ink-muted text-[0.875rem]">Carregando uso da IA…</div>
  if (erro) return <div className="text-status-red text-[0.875rem]">{erro}</div>
  if (!resumo) return null

  const totalChamadas = resumo.por_contexto.reduce((s, c) => s + c.chamadas, 0)
  const maxSerie = Math.max(...resumo.serie_30d.map((d) => d.custo), 0)

  return (
    <div className="flex flex-col gap-[2rem] max-w-[48rem]">
      {/* Selo de estimativa */}
      <div className="flex items-start gap-[0.5rem] text-ink-muted text-[0.8125rem] bg-surface-hover/60 border border-surface-border rounded-lg p-[0.75rem]">
        <Info className="w-[0.875rem] h-[0.875rem] shrink-0 mt-[0.125rem]" strokeWidth={2} />
        <span>Custo <strong>estimado</strong> a partir dos tokens de cada chamada (preços jun/2026, câmbio fixo). Pode divergir da fatura real do Google Cloud.</span>
      </div>

      {/* Cards hoje/mês/total */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1rem]">
        <Card titulo="Hoje"  valor={brl(resumo.custo_hoje)} />
        <Card titulo="Este mês" valor={brl(resumo.custo_mes)} destaque />
        <Card titulo="Total acumulado" valor={brl(resumo.total)} />
      </div>

      {/* Série 30 dias */}
      <div>
        <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[0.75rem]">Custo nos últimos 30 dias</h3>
        {maxSerie === 0 ? (
          <p className="text-ink-muted text-[0.875rem]">Sem uso registrado ainda nos últimos 30 dias.</p>
        ) : (
          <div className="h-[12rem] bg-surface-card border border-surface-border rounded-xl p-[1rem] card-shadow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resumo.serie_30d} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <XAxis
                  dataKey="dia"
                  tick={{ fontSize: 10, fill: 'var(--ink-muted)' }}
                  tickFormatter={(d) => String(d).slice(8)}
                  interval={4}
                  axisLine={false} tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => [brl(Number(v)), 'Custo']}
                  labelFormatter={(d) => new Date(String(d)).toLocaleDateString('pt-BR')}
                  contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                />
                <Bar dataKey="custo" fill="var(--ads-500, #FFB100)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Por tipo de uso */}
      <div>
        <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[0.75rem]">Por tipo de uso</h3>
        {resumo.por_contexto.length === 0 ? (
          <p className="text-ink-muted text-[0.875rem]">Nenhum uso registrado.</p>
        ) : (
          <div className="bg-surface-card border border-surface-border rounded-xl card-shadow overflow-hidden">
            <table className="w-full text-[0.875rem]">
              <thead>
                <tr className="text-ink-muted text-[0.75rem] uppercase tracking-wide border-b border-surface-border">
                  <th className="text-left font-semibold px-[1rem] py-[0.625rem]">Tipo</th>
                  <th className="text-right font-semibold px-[1rem] py-[0.625rem]">Chamadas</th>
                  <th className="text-right font-semibold px-[1rem] py-[0.625rem]">Custo</th>
                </tr>
              </thead>
              <tbody>
                {resumo.por_contexto.map((c) => (
                  <tr key={c.contexto} className="border-b border-surface-border/50 last:border-0">
                    <td className="px-[1rem] py-[0.625rem] text-ink-primary">{CONTEXTO_LABEL[c.contexto] ?? c.contexto}</td>
                    <td className="px-[1rem] py-[0.625rem] text-right text-ink-secondary font-mono">{c.chamadas}</td>
                    <td className="px-[1rem] py-[0.625rem] text-right text-ink-primary font-mono">{brl(c.custo)}</td>
                  </tr>
                ))}
                <tr className="bg-surface-hover/40 font-semibold">
                  <td className="px-[1rem] py-[0.625rem] text-ink-primary">Total</td>
                  <td className="px-[1rem] py-[0.625rem] text-right text-ink-secondary font-mono">{totalChamadas}</td>
                  <td className="px-[1rem] py-[0.625rem] text-right text-ads-500 font-mono">{brl(resumo.por_contexto.reduce((s, c) => s + c.custo, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Limite mensal */}
      <div className="border-t border-surface-border/30 pt-[1.5rem]">
        <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[0.25rem]">Limite mensal de gasto</h3>
        <p className="text-ink-muted text-[0.8125rem] mb-[1rem]">
          Dispara <strong>1 notificação in-app</strong> quando o gasto estimado do mês ultrapassa o teto. Apenas alerta — não bloqueia as chamadas.
        </p>
        <div className="flex items-end gap-[1rem] flex-wrap">
          <label className="flex items-center gap-[0.5rem] cursor-pointer">
            <button
              type="button"
              onClick={() => setLimiteAtivo((v) => !v)}
              className={`relative w-[2.75rem] h-[1.5rem] rounded-full transition-colors ${limiteAtivo ? 'bg-ads-500' : 'bg-surface-hover border border-surface-border'}`}
            >
              <span className={`absolute top-[0.1875rem] left-[0.1875rem] w-[1.125rem] h-[1.125rem] rounded-full bg-white shadow transition-transform ${limiteAtivo ? 'translate-x-[1.25rem]' : ''}`} />
            </button>
            <span className="text-ink-secondary text-[0.875rem]">Ativar</span>
          </label>
          <div>
            <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">Teto mensal (R$)</label>
            <input
              type="number" min="0" step="1"
              value={limiteValor}
              disabled={!limiteAtivo}
              onChange={(e) => setLimiteValor(e.target.value)}
              placeholder="Ex: 50"
              className="w-[8rem] h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 disabled:opacity-40"
            />
          </div>
          <Button variant="primary" size="md" onClick={salvarLimite} loading={salvandoLimite}>Salvar limite</Button>
          {salvoLimite && <span className="text-status-green text-[0.8125rem] pb-[0.625rem]">Salvo ✓</span>}
        </div>
      </div>
    </div>
  )
}
