'use client'

import { ExternalLink, BarChart3, Globe, MapPin, LineChart, FileSpreadsheet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClienteLinks {
  google_ads_customer_id?: string
  ga4_property_id?: string
  gmb_id?: string
  looker_url?: string
  website?: string
}

interface AcessoRapidoProps {
  links: ClienteLinks
}

const LinkButton = ({ 
  href, 
  icon: Icon, 
  label, 
  color = 'blue',
  disabled = false
}: { 
  href: string
  icon: typeof ExternalLink
  label: string
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'red'
  disabled?: boolean
}) => {
  const colors = {
    blue: 'bg-status-blue/10 text-status-blue border-status-blue/20 hover:bg-status-blue/20',
    green: 'bg-status-green/10 text-status-green border-status-green/20 hover:bg-status-green/20',
    amber: 'bg-ads-500/10 text-ads-500 border-ads-500/20 hover:bg-ads-500/20',
    purple: 'bg-status-purple/10 text-status-purple border-status-purple/20 hover:bg-status-purple/20',
    red: 'bg-status-red/10 text-status-red border-status-red/20 hover:bg-status-red/20',
  }

  if (disabled) {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border opacity-50 cursor-not-allowed',
        colors[color]
      )}>
        <Icon className="w-4 h-4" strokeWidth={2} />
        <span className="text-sm font-medium">{label}</span>
      </div>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
        colors[color]
      )}
    >
      <Icon className="w-4 h-4" strokeWidth={2} />
      <span className="text-sm font-medium">{label}</span>
      <ExternalLink className="w-3 h-3 ml-auto opacity-60" strokeWidth={2} />
    </a>
  )
}

export function AcessoRapido({ links }: AcessoRapidoProps) {
  const hasAnyLink = links.google_ads_customer_id || links.ga4_property_id || links.gmb_id || links.looker_url || links.website

  if (!hasAnyLink) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-ink-primary mb-3">Acesso Rápido</h3>
        <p className="text-sm text-ink-muted">Nenhum link externo configurado para este cliente.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-ink-primary mb-3">Acesso Rápido</h3>
      <div className="flex flex-wrap gap-2">
        {links.google_ads_customer_id && (
          <LinkButton
            href={`https://ads.google.com/aw/overview?ocid=${links.google_ads_customer_id}`}
            icon={BarChart3}
            label="Google Ads"
            color="blue"
          />
        )}
        {links.ga4_property_id && (
          <LinkButton
            href={`https://analytics.google.com/analytics/web/?authuser=0#/p${links.ga4_property_id}/reports/intelligenthome`}
            icon={LineChart}
            label="GA4"
            color="amber"
          />
        )}
        {links.gmb_id && (
          <LinkButton
            href={`https://business.google.com/locations/${links.gmb_id}`}
            icon={MapPin}
            label="Google Meu Negócio"
            color="green"
          />
        )}
        {links.looker_url && (
          <LinkButton
            href={links.looker_url}
            icon={FileSpreadsheet}
            label="Looker Studio"
            color="purple"
          />
        )}
        {links.website && (
          <LinkButton
            href={links.website}
            icon={Globe}
            label="Site"
            color="blue"
          />
        )}
      </div>
    </div>
  )
}
