'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

type ApiStatus = 'ok' | 'warn' | 'error' | 'not_configured'

interface StatusState {
  supabase: 'ok' | 'error'
  googleAds: ApiStatus
  asaas: ApiStatus
  vertexAI: ApiStatus
  googleAdsMessage: string
  asaasMessage: string
  vertexAIMessage: string
}

// Instruções de ação para cada estado — exibidas no tooltip
const ACTION_HINTS: Record<string, Partial<Record<ApiStatus | 'error', string>>> = {
  supabase: {
    error: 'Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local e reinicie o servidor.',
  },
  googleAds: {
    warn: 'Verifique o refresh token e o developer token. Se expirado, reautentique o OAuth em Configurações → Integrações.',
    error: 'Sem conexão com a API do Google Ads. Verifique sua rede ou o status em ads.google.com.',
    not_configured: 'Configure GOOGLE_ADS_CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, DEVELOPER_TOKEN e MANAGER_ID no .env.local.',
  },
  asaas: {
    warn: 'Chave inválida ou ambiente errado. Confirme ASAAS_API_KEY em Configurações → Integrações.',
    error: 'Sem conexão com o Asaas. Verifique sua rede ou o status em status.asaas.com.',
    not_configured: 'Configure ASAAS_API_KEY no .env.local.',
  },
  vertexAI: {
    warn: 'Verifique se o billing está ativo no Google Cloud, se o arquivo de service account existe e se a API Vertex AI está habilitada no projeto.',
    error: 'Timeout ao contatar o Vertex AI. Verifique sua rede ou o status em status.cloud.google.com.',
    not_configured: 'Configure VERTEX_AI_PROJECT_ID, VERTEX_AI_LOCATION e VERTEX_AI_CREDENTIALS no .env.local.',
  },
}

const STATUS_LABEL: Record<ApiStatus | 'error', string> = {
  ok:             'Online',
  warn:           'Atenção',
  error:          'Erro',
  not_configured: 'Não configurado',
}

const STATUS_COLOR: Record<ApiStatus | 'error', string> = {
  ok:             'text-status-green',
  warn:           'text-status-orange',
  error:          'text-status-red',
  not_configured: 'text-ink-muted',
}

const DOT_COLOR: Record<ApiStatus | 'error', string> = {
  ok:             'bg-status-green',
  warn:           'bg-status-orange',
  error:          'bg-status-red',
  not_configured: 'bg-ink-muted opacity-40',
}

interface TooltipProps {
  label: string
  apiKey: string
  status: ApiStatus | 'error'
  message: string
}

function StatusTooltip({ label, apiKey, status, message }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState<'left' | 'right'>('left')
  const ref = useRef<HTMLDivElement>(null)

  const handleEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      // Se estiver no lado direito da tela, abre para a esquerda
      setPos(rect.left > window.innerWidth / 2 ? 'right' : 'left')
    }
    setVisible(true)
  }

  const action = ACTION_HINTS[apiKey]?.[status]

  return (
    <div
      ref={ref}
      className="relative flex items-center gap-[0.25rem] cursor-default"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setVisible(false)}
    >
      <div className={`w-[0.375rem] h-[0.375rem] rounded-full flex-shrink-0 ${DOT_COLOR[status]}`} />
      <span className="text-[0.6875rem] text-ink-muted">{label}</span>

      {visible && (
        <div
          className={`
            absolute bottom-[calc(100%+0.5rem)] z-50 w-[14rem]
            bg-surface-elevated border border-surface-border rounded-lg
            shadow-lg p-[0.625rem] flex flex-col gap-[0.25rem]
            animate-fade-scale pointer-events-none
            ${pos === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-[0.5rem]">
            <span className="text-[0.6875rem] font-semibold text-ink-primary">{label}</span>
            <span className={`text-[0.625rem] font-medium ${STATUS_COLOR[status]}`}>
              {STATUS_LABEL[status]}
            </span>
          </div>

          {/* Mensagem da API */}
          {message && (
            <p className="text-[0.625rem] text-ink-secondary leading-relaxed border-t border-surface-border pt-[0.25rem] mt-[0.125rem]">
              {message}
            </p>
          )}

          {/* Instrução de ação */}
          {action && (
            <div className={`
              text-[0.625rem] leading-relaxed rounded-md px-[0.5rem] py-[0.375rem] mt-[0.125rem]
              ${status === 'error' ? 'bg-status-red/10 text-status-red' : ''}
              ${status === 'warn' ? 'bg-status-orange/10 text-status-orange' : ''}
              ${status === 'not_configured' ? 'bg-surface-hover text-ink-muted' : ''}
            `}>
              {action}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ApiStatusIndicator() {
  const [status, setStatus] = useState<StatusState>({
    supabase: 'ok',
    googleAds: 'not_configured',
    asaas: 'not_configured',
    vertexAI: 'not_configured',
    googleAdsMessage: 'Verificando...',
    asaasMessage: 'Verificando...',
    vertexAIMessage: 'Verificando...',
  })

  useEffect(() => {
    const checkStatus = async () => {
      // Supabase
      let supabaseStatus: 'ok' | 'error' = 'ok'
      try {
        await supabase.auth.getUser()
      } catch {
        supabaseStatus = 'error'
      }

      let googleAds: ApiStatus = 'not_configured'
      let googleAdsMessage = 'Não configurado'
      let asaas: ApiStatus = 'not_configured'
      let asaasMessage = 'Não configurado'
      let vertexAI: ApiStatus = 'not_configured'
      let vertexAIMessage = 'Não configurado'

      try {
        const res = await fetch('/api/status', { signal: AbortSignal.timeout(12000) })
        if (res.ok) {
          const data = await res.json()
          googleAds = data.googleAds?.status ?? 'error'
          googleAdsMessage = data.googleAds?.message ?? ''
          asaas = data.asaas?.status ?? 'error'
          asaasMessage = data.asaas?.message ?? ''
          vertexAI = data.vertexAI?.status ?? 'error'
          vertexAIMessage = data.vertexAI?.message ?? ''
        } else {
          googleAds = 'error'
          asaas = 'error'
        }
      } catch {
        googleAds = 'error'
        asaas = 'error'
        vertexAI = 'error'
        googleAdsMessage = 'Timeout ao verificar'
        asaasMessage = 'Timeout ao verificar'
        vertexAIMessage = 'Timeout ao verificar'
      }

      setStatus({ supabase: supabaseStatus, googleAds, asaas, vertexAI, googleAdsMessage, asaasMessage, vertexAIMessage })
    }

    checkStatus()
    const interval = setInterval(checkStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-[0.75rem]">
      <StatusTooltip
        label="Supabase"
        apiKey="supabase"
        status={status.supabase}
        message={status.supabase === 'ok' ? 'Autenticação e banco operacionais' : 'Falha na conexão com o Supabase'}
      />
      <StatusTooltip
        label="Google Ads"
        apiKey="googleAds"
        status={status.googleAds}
        message={status.googleAdsMessage}
      />
      <StatusTooltip
        label="Asaas"
        apiKey="asaas"
        status={status.asaas}
        message={status.asaasMessage}
      />
      <StatusTooltip
        label="Gemini"
        apiKey="vertexAI"
        status={status.vertexAI}
        message={status.vertexAIMessage}
      />
    </div>
  )
}
