'use client'

import type { LinhaDiaAds } from '@/lib/ads-detalhes'
import { MiniChartLinha } from './MiniChartLinha'
import { fmtConv, fmtMoeda, fmtNum, fmtPct } from './labels'

// Gráfico de acompanhamento — replica os 2 gráficos do Looker (GADS-2), mas
// cada métrica em eixo único: o Looker força Impressões/Cliques/CPC/Conversões
// (e depois CTR/Taxa conv./Custo) em 2 escalas na mesma linha, o que cria
// correlação visual que não existe nos dados. Mesmo AGRUPAMENTO de métricas,
// small multiples em vez de eixo duplo. CTR e Taxa de conv. são a mesma
// unidade (%) e legitimamente dividem 1 gráfico com 1 eixo.

const CORES = { impressoes: '#ef4444', cliques: '#3B82F6', cpc: '#22c55e', conversoes: '#f59e0b', custo: '#3B82F6' }

export function SerieDiariaCard({ dados }: { dados: LinhaDiaAds[] }) {
  const chartData = dados.map((l) => ({
    dia: `${l.data.slice(8, 10)}/${l.data.slice(5, 7)}`,
    impressoes: l.impressoes,
    cliques: l.cliques,
    cpc: l.cliques > 0 ? l.custo / l.cliques : 0,
    conversoes: l.conversoes,
    custo: l.custo,
    ctr: l.impressoes > 0 ? (l.cliques / l.impressoes) * 100 : 0,
    taxaConv: l.cliques > 0 ? (l.conversoes / l.cliques) * 100 : 0,
  }))

  return (
    <div className="space-y-[0.75rem]">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[0.75rem]">
        <MiniChartLinha titulo="Impressões" dados={chartData} eixoX="dia" formatter={fmtNum}
          series={[{ chave: 'impressoes', cor: CORES.impressoes }]} />
        <MiniChartLinha titulo="Cliques" dados={chartData} eixoX="dia" formatter={fmtNum}
          series={[{ chave: 'cliques', cor: CORES.cliques }]} />
        <MiniChartLinha titulo="CPC médio" dados={chartData} eixoX="dia" formatter={fmtMoeda}
          series={[{ chave: 'cpc', cor: CORES.cpc }]} />
        <MiniChartLinha titulo="Conversões" dados={chartData} eixoX="dia" formatter={fmtConv}
          series={[{ chave: 'conversoes', cor: CORES.conversoes }]} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[0.75rem]">
        <MiniChartLinha titulo="CTR e Taxa de conversão" dados={chartData} eixoX="dia" formatter={fmtPct}
          series={[{ chave: 'ctr', cor: '#22c55e' }, { chave: 'taxaConv', cor: '#f59e0b' }]}
          legenda={{ ctr: 'CTR', taxaConv: 'Taxa conv.' }} />
        <MiniChartLinha titulo="Custo" dados={chartData} eixoX="dia" formatter={fmtMoeda}
          series={[{ chave: 'custo', cor: CORES.custo }]} />
      </div>
    </div>
  )
}
