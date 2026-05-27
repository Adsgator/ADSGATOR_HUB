'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ApiStatus {
  supabase: 'ok' | 'error'
  googleAds: 'ok' | 'configured' | 'not_configured'
  asaas: 'ok' | 'configured' | 'not_configured'
}

export function ApiStatusIndicator() {
  const [status, setStatus] = useState<ApiStatus>({
    supabase: 'ok',
    googleAds: 'not_configured',
    asaas: 'not_configured',
  })

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Verificar Supabase (ping simples)
        let supabaseStatus: 'ok' | 'error' = 'ok'
        try {
          await supabase.auth.getUser()
        } catch {
          supabaseStatus = 'error'
        }

        // Verificar Google Ads (check se existe pelo menos um cliente com integração habilitada)
        let googleAdsStatus: 'ok' | 'configured' | 'not_configured' = 'not_configured'
        try {
          const { error: googleError, count } = await supabase
            .from('clientes')
            .select('id', { count: 'exact', head: true })
            .eq('google_ads_enabled', true)
          if (!googleError && count !== null && count > 0) {
            googleAdsStatus = 'configured'
          }
        } catch {
          googleAdsStatus = 'not_configured'
        }

        // Verificar Asaas (check se existe integração configurada)
        let asaasStatus: 'ok' | 'configured' | 'not_configured' = 'not_configured'
        try {
          const { error: asaasError, count } = await supabase
            .from('clientes')
            .select('id', { count: 'exact', head: true })
            .not('asaas_id', 'is', null)
          if (!asaasError && count !== null && count > 0) {
            asaasStatus = 'configured'
          }
        } catch {
          asaasStatus = 'not_configured'
        }

        setStatus({
          supabase: supabaseStatus,
          googleAds: googleAdsStatus,
          asaas: asaasStatus,
        })
      } catch {
        setStatus({
          supabase: 'error',
          googleAds: 'not_configured',
          asaas: 'not_configured',
        })
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check a cada 30s
    return () => clearInterval(interval)
  }, [])

  const getColor = (apiStatus: string) => {
    if (apiStatus === 'ok') return 'bg-status-green'
    if (apiStatus === 'configured') return 'bg-status-green'
    if (apiStatus === 'error') return 'bg-status-red'
    return 'bg-status-orange' // not_configured
  }

  const getTitle = (api: string, apiStatus: string) => {
    if (apiStatus === 'ok') return `${api}: Online`
    if (apiStatus === 'configured') return `${api}: Configurado`
    if (apiStatus === 'error') return `${api}: Erro`
    return `${api}: Não configurado`
  }

  return (
    <div className="flex items-center gap-[0.75rem]">
      {/* Supabase */}
      <div className="flex items-center gap-[0.25rem]" title={getTitle('Supabase', status.supabase)}>
        <div className={`w-[0.375rem] h-[0.375rem] rounded-full ${getColor(status.supabase)}`} />
        <span className="text-[0.6875rem] text-ink-muted">Supabase</span>
      </div>

      {/* Google Ads */}
      <div className="flex items-center gap-[0.25rem]" title={getTitle('Google Ads', status.googleAds)}>
        <div className={`w-[0.375rem] h-[0.375rem] rounded-full ${getColor(status.googleAds)}`} />
        <span className="text-[0.6875rem] text-ink-muted">Google Ads</span>
      </div>

      {/* Asaas */}
      <div className="flex items-center gap-[0.25rem]" title={getTitle('Asaas', status.asaas)}>
        <div className={`w-[0.375rem] h-[0.375rem] rounded-full ${getColor(status.asaas)}`} />
        <span className="text-[0.6875rem] text-ink-muted">Asaas</span>
      </div>
    </div>
  )
}
