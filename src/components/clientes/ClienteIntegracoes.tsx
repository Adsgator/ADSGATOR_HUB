'use client'

import { useState } from 'react'
import { ExternalLink, BarChart3, LineChart, MapPin, FileSpreadsheet, Globe, Save, Pencil, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Cliente } from '@/lib/types'

interface ClienteIntegracoesProps {
  cliente: Cliente
  onUpdate: (cliente: Cliente) => void
}

interface LinkItemProps {
  icon: typeof ExternalLink
  label: string
  value?: string | null
  placeholder: string
  color: 'blue' | 'green' | 'amber' | 'purple' | 'slate'
  enabled?: boolean
  onEnabledChange?: (enabled: boolean) => void
  onChange: (value: string) => void
  editing: boolean
}

const LinkItem = ({
  icon: Icon,
  label,
  value,
  placeholder,
  color,
  enabled,
  onEnabledChange,
  onChange,
  editing
}: LinkItemProps) => {
  const colors = {
    blue: 'bg-status-blue/10 text-status-blue border-status-blue/20',
    green: 'bg-status-green/10 text-status-green border-status-green/20',
    amber: 'bg-ads-500/10 text-ads-500 border-ads-500/20',
    purple: 'bg-status-purple/10 text-status-purple border-status-purple/20',
    slate: 'bg-surface-hover text-ink-secondary border-surface-border',
  }

  const hasValue = value && value.trim().length > 0
  const isActive = enabled !== undefined ? enabled : hasValue

  return (
    <div className={cn(
      'rounded-xl border p-3 transition-all',
      isActive ? colors[color] : 'bg-surface-hover/50 border-surface-border/50 opacity-60'
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
        <span className="text-sm font-medium">{label}</span>
        {onEnabledChange && (
          <button
            onClick={() => onEnabledChange(!enabled)}
            className={cn(
              'ml-auto w-8 h-4 rounded-full transition-colors relative',
              enabled ? 'bg-status-green' : 'bg-surface-border'
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all',
              enabled ? 'left-4' : 'left-0.5'
            )} />
          </button>
        )}
      </div>
      
      {editing ? (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-2 py-1.5 text-sm bg-surface-base border border-surface-border rounded-md focus:outline-none focus:border-ads-500 text-ink-primary"
        />
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm truncate flex-1 font-mono">
            {hasValue ? value : <span className="italic opacity-50">{placeholder}</span>}
          </span>
          {hasValue && (
            <a
              href={value || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-white/10 rounded transition-colors shrink-0"
            >
              <ExternalLink className="w-3 h-3" strokeWidth={2} />
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export function ClienteIntegracoes({ cliente, onUpdate }: ClienteIntegracoesProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    google_ads_customer_id: cliente.google_ads_customer_id || '',
    google_ads_enabled: cliente.google_ads_enabled || false,
    ga4_property_id: cliente.ga4_property_id || '',
    ga4_enabled: cliente.ga4_enabled || false,
    gmb_id: cliente.gmb_id || '',
    looker_url: cliente.looker_url || '',
    website: cliente.website || '',
    dominio: cliente.dominio || '',
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({
          google_ads_customer_id: formData.google_ads_customer_id || null,
          google_ads_enabled: formData.google_ads_enabled,
          ga4_property_id: formData.ga4_property_id || null,
          ga4_enabled: formData.ga4_enabled,
          gmb_id: formData.gmb_id || null,
          looker_url: formData.looker_url || null,
          website: formData.website || null,
          dominio: formData.dominio || null,
          data_atualizacao: new Date().toISOString(),
        })
        .eq('id', cliente.id)
        .select()
        .single()

      if (error) throw new Error(`${error.message} (${error.code})`)

      if (data) {
        onUpdate(data as Cliente)
        toast.success('Integrações atualizadas!')
        setEditing(false)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar integrações')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      google_ads_customer_id: cliente.google_ads_customer_id || '',
      google_ads_enabled: cliente.google_ads_enabled || false,
      ga4_property_id: cliente.ga4_property_id || '',
      ga4_enabled: cliente.ga4_enabled || false,
      gmb_id: cliente.gmb_id || '',
      looker_url: cliente.looker_url || '',
      website: cliente.website || '',
      dominio: cliente.dominio || '',
    })
    setEditing(false)
  }

  return (
    <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-ads-500" strokeWidth={2} />
          <h3 className="font-semibold text-ink-primary">Integrações & Links</h3>
        </div>
        
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2} />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-ads-500 hover:bg-ads-600 text-white rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" strokeWidth={2} />
              )}
              Salvar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-hover rounded-md transition-colors"
          >
            <Pencil className="w-4 h-4" strokeWidth={2} />
            Editar
          </button>
        )}
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Google Ads */}
        <LinkItem
          icon={BarChart3}
          label="Google Ads"
          value={formData.google_ads_customer_id}
          enabled={formData.google_ads_enabled}
          onEnabledChange={(enabled) => setFormData({ ...formData, google_ads_enabled: enabled })}
          onChange={(value) => setFormData({ ...formData, google_ads_customer_id: value })}
          placeholder="Customer ID (ex: 123-456-7890)"
          color="blue"
          editing={editing}
        />

        {/* GA4 */}
        <LinkItem
          icon={LineChart}
          label="Google Analytics 4"
          value={formData.ga4_property_id}
          enabled={formData.ga4_enabled}
          onEnabledChange={(enabled) => setFormData({ ...formData, ga4_enabled: enabled })}
          onChange={(value) => setFormData({ ...formData, ga4_property_id: value })}
          placeholder="Property ID (ex: 123456789)"
          color="amber"
          editing={editing}
        />

        {/* GMB */}
        <LinkItem
          icon={MapPin}
          label="Google Meu Negócio"
          value={formData.gmb_id}
          onChange={(value) => setFormData({ ...formData, gmb_id: value })}
          placeholder="Location ID"
          color="green"
          editing={editing}
        />

        {/* Looker */}
        <LinkItem
          icon={FileSpreadsheet}
          label="Looker Studio"
          value={formData.looker_url}
          onChange={(value) => setFormData({ ...formData, looker_url: value })}
          placeholder="URL do relatório"
          color="purple"
          editing={editing}
        />

        {/* Website */}
        <LinkItem
          icon={Globe}
          label="Website"
          value={formData.website}
          onChange={(value) => setFormData({ ...formData, website: value })}
          placeholder="https://..."
          color="slate"
          editing={editing}
        />

        {/* Domínio */}
        <LinkItem
          icon={Check}
          label="Domínio"
          value={formData.dominio}
          onChange={(value) => setFormData({ ...formData, dominio: value })}
          placeholder="exemplo.com.br"
          color="slate"
          editing={editing}
        />
      </div>
    </div>
  )
}
