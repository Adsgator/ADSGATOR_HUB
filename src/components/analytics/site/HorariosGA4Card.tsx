'use client'

import type { LinhaHoraGA4 } from '@/lib/ga4-detalhes'
import { fmtNum } from '../trafego/labels'
import { MiniChartLinha } from '../trafego/MiniChartLinha'
import { fmtDuracao } from './labelsGa4'

// Acompanhamento por hora do dia (00–23) — 3 gráficos de eixo único,
// replicando o agrupamento do Looker (GA4-1/GA4-2). ⚠️ Antes era 1 gráfico
// só com 2 eixos (Sessões em contagem + Engajamento/Rejeição em %) — mesmo
// erro de eixo duplo já corrigido no dashboard de Ads (cria correlação visual
// que não existe nos dados).

export function HorariosGA4Card({ dados }: { dados: LinhaHoraGA4[] }) {
  const chartData = dados.map((h) => ({ ...h, rotulo: `${h.hora}h` }))

  return (
    // "Acessos" (3 séries) ocupa a largura toda; duração e engajamento dividem a
    // linha de baixo — evita o 3º gráfico sozinho deixando metade da linha vazia.
    <div className="space-y-[0.875rem]">
      <MiniChartLinha
        titulo="Acompanhamento de acessos"
        dados={chartData}
        eixoX="rotulo"
        formatter={fmtNum}
        series={[
          { chave: 'visualizacoes', cor: '#3B82F6' },
          { chave: 'usuariosNovos', cor: '#8b5cf6' },
          { chave: 'sessoes', cor: '#FFB100' },
        ]}
        legenda={{ visualizacoes: 'Visualizações', usuariosNovos: 'Novos usuários', sessoes: 'Sessões' }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[0.875rem]">
        <MiniChartLinha
          titulo="Acompanhamento de duração média"
          dados={chartData}
          eixoX="rotulo"
          formatter={fmtDuracao}
          series={[{ chave: 'duracaoMediaSessao', cor: '#06b6d4' }]}
        />
        <MiniChartLinha
          titulo="Acompanhamento de engajamento"
          dados={chartData}
          eixoX="rotulo"
          formatter={(v) => `${v.toFixed(1).replace('.', ',')}%`}
          series={[
            { chave: 'taxaEngajamento', cor: '#22c55e' },
            { chave: 'taxaRejeicao', cor: '#ef4444' },
          ]}
          legenda={{ taxaEngajamento: 'Engajamento', taxaRejeicao: 'Rejeição' }}
        />
      </div>
    </div>
  )
}
