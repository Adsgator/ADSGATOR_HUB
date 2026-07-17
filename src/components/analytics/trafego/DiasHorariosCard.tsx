'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DiasHorariosAds } from '@/lib/ads-detalhes'
import { DIA_CURTO, fmtConv, fmtMoeda, fmtNum } from './labels'

// Dias da semana + horários (Looker: tabelas "Resultados pelo horário" e
// "Dias da semana") como barras de cliques com tooltip completo.

interface Ponto {
  rotulo:     string
  impressoes: number
  cliques:    number
  custo:      number
  conversoes: number
}

function GraficoBarras({ pontos, titulo }: { pontos: Ponto[]; titulo: string }) {
  return (
    <div>
      <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.5rem]">{titulo}</p>
      <div className="h-[10rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pontos} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
            <XAxis dataKey="rotulo" tick={{ fontSize: 10, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} interval={pontos.length > 12 ? 2 : 0} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'var(--surface-hover)' }}
              contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
              formatter={(v: unknown) => [`${fmtNum(Number(v))}`, 'Cliques'] as [string, string]}
              labelFormatter={(rotulo) => {
                const p = pontos.find((x) => x.rotulo === String(rotulo))
                return p
                  ? `${p.rotulo} — ${fmtNum(p.impressoes)} impr. · ${fmtMoeda(p.custo)} · ${fmtConv(p.conversoes)} conv.`
                  : String(rotulo ?? '')
              }}
            />
            <Bar dataKey="cliques" fill="#FFB100" opacity={0.85} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function DiasHorariosCard({ dados }: { dados: DiasHorariosAds }) {
  const dias: Ponto[] = dados.porDiaSemana.map((d) => ({
    rotulo: DIA_CURTO[d.dia] ?? d.dia,
    impressoes: d.impressoes, cliques: d.cliques, custo: d.custo, conversoes: d.conversoes,
  }))
  const horas: Ponto[] = dados.porHora.map((h) => ({
    rotulo: `${h.hora}h`,
    impressoes: h.impressoes, cliques: h.cliques, custo: h.custo, conversoes: h.conversoes,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.25rem]">
      <GraficoBarras pontos={dias} titulo="Dias da semana" />
      <GraficoBarras pontos={horas} titulo="Horários" />
    </div>
  )
}
