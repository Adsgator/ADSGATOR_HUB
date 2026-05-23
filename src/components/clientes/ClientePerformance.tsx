'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, TrendingUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Lazy imports dos componentes analytics
import { AdsOverviewKpis } from '@/components/analytics/AdsOverviewKpis'
import { SearchTermsTable } from '@/components/analytics/SearchTermsTable'
import { DemographicsCard } from '@/components/analytics/DemographicsCard'
import { GA4Panel } from '@/components/analytics/GA4Panel'
import { GeographyBreakdown } from '@/components/analytics/GeographyBreakdown'
import { DeviceBreakdown } from '@/components/analytics/DeviceBreakdown'
import { TrafficSources } from '@/components/analytics/TrafficSources'

interface ClientePerformanceProps {
  clienteId: string
  googleAdsEnabled?: boolean
  ga4Enabled?: boolean
}

export function ClientePerformance({ 
  clienteId, 
  googleAdsEnabled = false, 
  ga4Enabled = false 
}: ClientePerformanceProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d'>('30d')

  const loadData = useCallback(async () => {
    if (!expanded || data) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/${clienteId}/live?periodo=${periodo}`)
      if (res.ok) {
        const result = await res.json()
        setData(result)
      } else {
        toast.error('Erro ao carregar dados de performance')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [clienteId, expanded, data, periodo])

  const handleToggle = () => {
    const newExpanded = !expanded
    setExpanded(newExpanded)
    if (newExpanded && !data) {
      loadData()
    }
  }

  // Agregar dados para KPIs
  const adsKpiData = data?.googleAds?.campanhas?.reduce((acc: any, c: any) => ({
    impressoes: (acc.impressoes || 0) + (c.impressoes || 0),
    cliques: (acc.cliques || 0) + (c.cliques || 0),
    custo_total: (acc.custo_total || 0) + (c.custo_total || 0),
    conversoes: (acc.conversoes || 0) + (c.conversoes || 0),
    ctr: acc.impressoes > 0 ? (acc.cliques / acc.impressoes) * 100 : 0,
    cpa: acc.conversoes > 0 ? acc.custo_total / acc.conversoes : 0,
    roas: acc.custo_total > 0 ? (acc.conversoes * 50) / acc.custo_total : 0, // valor estimado
  }), { impressoes: 0, cliques: 0, custo_total: 0, conversoes: 0, ctr: 0, cpa: 0, roas: 0 })

  const hasData = googleAdsEnabled || ga4Enabled

  if (!hasData) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-ink-muted" strokeWidth={2} />
            <span className="text-sm font-medium text-ink-secondary">Performance Ads + GA4</span>
          </div>
          <span className="text-xs text-ink-muted">Não configurado</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-ads-500" strokeWidth={2} />
          <span className="text-sm font-semibold text-ink-primary">Performance Ads + GA4</span>
          {googleAdsEnabled && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-status-blue/10 text-status-blue">Ads</span>
          )}
          {ga4Enabled && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-ads-500/10 text-ads-500">GA4</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-ads-500" strokeWidth={2} />}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-ink-muted" strokeWidth={2} />
          ) : (
            <ChevronDown className="w-4 h-4 text-ink-muted" strokeWidth={2} />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-surface-border p-4 space-y-4">
          {/* Seletor de período */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted">Período:</span>
            <div className="flex gap-1">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriodo(p)
                    setData(null)
                    setTimeout(loadData, 0)
                  }}
                  className={cn(
                    'px-2 py-1 text-xs rounded-md transition-colors',
                    periodo === p
                      ? 'bg-ads-500 text-white'
                      : 'bg-surface-hover text-ink-secondary hover:text-ink-primary'
                  )}
                >
                  {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-ads-500 mx-auto mb-2" strokeWidth={2} />
              <p className="text-sm text-ink-muted">Carregando dados...</p>
            </div>
          ) : data ? (
            <div className="space-y-4">
              {/* Google Ads */}
              {data.googleAds?.enabled && adsKpiData && (
                <div>
                  <h4 className="text-xs font-medium text-ink-muted mb-2">Google Ads</h4>
                  <AdsOverviewKpis data={adsKpiData} loading={false} />
                </div>
              )}

              {/* GA4 */}
              {data.ga4?.enabled && data.ga4.dados && (
                <div>
                  <h4 className="text-xs font-medium text-ink-muted mb-2">Google Analytics 4</h4>
                  <GA4Panel data={data.ga4.dados} loading={false} />
                </div>
              )}

              {/* Detalhes em grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {data.googleAds?.termosPesquisa?.length > 0 && (
                  <div className="bg-surface-base rounded-lg p-3">
                    <h5 className="text-xs font-medium text-ink-primary mb-2">Termos de Pesquisa</h5>
                    <SearchTermsTable data={data.googleAds.termosPesquisa} maxRows={5} />
                  </div>
                )}
                {data.googleAds?.demografia?.length > 0 && (
                  <div className="bg-surface-base rounded-lg p-3">
                    <h5 className="text-xs font-medium text-ink-primary mb-2">Demografia</h5>
                    <DemographicsCard data={data.googleAds.demografia} />
                  </div>
                )}
                {(data.ga4?.geografia?.length > 0 || data.googleAds?.geografia?.length > 0) && (
                  <div className="bg-surface-base rounded-lg p-3">
                    <h5 className="text-xs font-medium text-ink-primary mb-2">Geografia</h5>
                    <GeographyBreakdown 
                      data={data.ga4?.geografia || data.googleAds?.geografia} 
                      title={data.ga4?.geografia ? 'Sessões por região' : 'Cliques por região'}
                    />
                  </div>
                )}
                {(data.ga4?.device?.length > 0 || data.googleAds?.device?.length > 0) && (
                  <div className="bg-surface-base rounded-lg p-3">
                    <h5 className="text-xs font-medium text-ink-primary mb-2">Dispositivos</h5>
                    <DeviceBreakdown data={data.ga4?.device || data.googleAds?.device} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-muted text-center py-4">
              Clique para carregar dados de performance
            </p>
          )}
        </div>
      )}
    </div>
  )
}
