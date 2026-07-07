'use client'

import { useState } from 'react'
import { ExternalLink, BarChart3, LineChart, MapPin, FileSpreadsheet, Globe, Save, Pencil, X, Check, Wallet, PlugZap, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
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

interface ResultadoTeste {
  status:   'ok' | 'erro' | 'nao_configurado'
  mensagem: string
}

export function ClienteIntegracoes({ cliente, onUpdate }: ClienteIntegracoesProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testando, setTestando] = useState(false)
  const [teste, setTeste] = useState<{ google_ads: ResultadoTeste; ga4: ResultadoTeste } | null>(null)
  const [formData, setFormData] = useState({
    google_ads_customer_id: cliente.google_ads_customer_id || '',
    google_ads_enabled: cliente.google_ads_enabled || false,
    ga4_property_id: cliente.ga4_property_id || '',
    ga4_enabled: cliente.ga4_enabled || false,
    gmb_id: cliente.gmb_id || '',
    looker_url: cliente.looker_url || '',
    website: cliente.website || '',
    dominio: cliente.dominio || '',
    saldo_minimo_alerta: cliente.saldo_minimo_alerta != null ? String(cliente.saldo_minimo_alerta) : '',
    saldo_alertas_ativos: cliente.saldo_alertas_ativos ?? true,
    saldo_google: cliente.saldo_google != null ? String(cliente.saldo_google) : '',
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      // Saldo manual: só grava (com carimbo de data) se o valor realmente mudou —
      // fallback para contas pós-pagas, onde o sync não consegue derivar o saldo.
      const saldoTexto = formData.saldo_google.trim()
      const saldoNovo = saldoTexto ? parseFloat(saldoTexto) : null
      const saldoMudou = saldoNovo != null && saldoNovo !== (cliente.saldo_google ?? null)

      const { data, error } = await supabase
        .from('clientes')
        .update({
          // IDs do Google chegam colados com espaço/hífen — normaliza aqui.
          google_ads_customer_id: formData.google_ads_customer_id.replace(/\D/g, '') || null,
          google_ads_enabled: formData.google_ads_enabled,
          ga4_property_id: formData.ga4_property_id.trim() || null,
          ga4_enabled: formData.ga4_enabled,
          gmb_id: formData.gmb_id.trim() || null,
          looker_url: formData.looker_url.trim() || null,
          website: formData.website.trim() || null,
          dominio: formData.dominio.trim() || null,
          saldo_minimo_alerta: formData.saldo_minimo_alerta.trim() ? parseFloat(formData.saldo_minimo_alerta) : null,
          saldo_alertas_ativos: formData.saldo_alertas_ativos,
          ...(saldoMudou ? { saldo_google: saldoNovo, saldo_google_atualizado_em: new Date().toISOString() } : {}),
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

  const handleTestar = async () => {
    setTestando(true)
    setTeste(null)
    try {
      const res = await fetch(`/api/v1/clientes/${cliente.id}/testar-integracao`, { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { google_ads: ResultadoTeste; ga4: ResultadoTeste }
      setTeste(data)
      if (data.google_ads.status === 'erro' || data.ga4.status === 'erro') {
        toast.error('Alguma integração falhou — detalhes no card')
      } else {
        toast.success('Teste de conexão concluído')
      }
    } catch (error) {
      console.error('Erro ao testar integrações:', error)
      toast.error('Não consegui rodar o teste de conexão')
    } finally {
      setTestando(false)
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
      saldo_minimo_alerta: cliente.saldo_minimo_alerta != null ? String(cliente.saldo_minimo_alerta) : '',
      saldo_alertas_ativos: cliente.saldo_alertas_ativos ?? true,
      saldo_google: cliente.saldo_google != null ? String(cliente.saldo_google) : '',
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
          <div className="flex items-center gap-1">
            <button
              onClick={handleTestar}
              disabled={testando}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-hover rounded-md transition-colors disabled:opacity-50"
            >
              {testando ? (
                <div className="w-4 h-4 border-2 border-ink-muted border-t-transparent rounded-full animate-spin" />
              ) : (
                <PlugZap className="w-4 h-4" strokeWidth={2} />
              )}
              Testar conexão
            </button>
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-hover rounded-md transition-colors"
            >
              <Pencil className="w-4 h-4" strokeWidth={2} />
              Editar
            </button>
          </div>
        )}
      </div>

      {/* Última sincronização — status gravado pelo sync diário */}
      {(cliente.google_ads_enabled || cliente.ga4_enabled) && (
        <div className="px-4 pt-3 text-xs">
          {cliente.ultimo_sync_at ? (
            <span className={cn(
              cliente.ultimo_sync_status === 'ok' ? 'text-status-green'
                : cliente.ultimo_sync_status === 'parcial' ? 'text-status-orange'
                : 'text-status-red'
            )}>
              Última sincronização: {new Date(cliente.ultimo_sync_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}{' '}
              {new Date(cliente.ultimo_sync_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              {' — '}
              {cliente.ultimo_sync_status === 'ok' ? 'OK'
                : cliente.ultimo_sync_status === 'parcial' ? `PARCIAL: ${cliente.ultimo_sync_erro ?? 'uma das fontes falhou'}`
                : `ERRO: ${cliente.ultimo_sync_erro ?? 'falha desconhecida'}`}
            </span>
          ) : (
            <span className="text-ink-muted">
              Ainda não sincronizou — roda no ciclo diário ou dispare em Analytics → Sincronizar
            </span>
          )}
        </div>
      )}

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

      {/* Aviso: ID preenchido mas integração desligada — não sincroniza */}
      {!editing && ((formData.google_ads_customer_id.trim() && !formData.google_ads_enabled) ||
        (formData.ga4_property_id.trim() && !formData.ga4_enabled)) && (
        <div className="px-4 pb-3">
          <div className="flex items-start gap-2 rounded-xl border border-status-orange/20 bg-status-orange/10 text-status-orange p-3 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
            <span>
              {formData.google_ads_customer_id.trim() && !formData.google_ads_enabled && 'Google Ads tem ID preenchido mas está DESLIGADO. '}
              {formData.ga4_property_id.trim() && !formData.ga4_enabled && 'GA4 tem ID preenchido mas está DESLIGADO. '}
              Integração desligada não sincroniza — clique em Editar, ligue o toggle e salve.
            </span>
          </div>
        </div>
      )}

      {/* Resultado do teste de conexão */}
      {teste && (
        <div className="px-4 pb-3 space-y-2">
          {([['Google Ads', teste.google_ads], ['GA4', teste.ga4]] as const).map(([nome, r]) => (
            <div
              key={nome}
              className={cn(
                'flex items-start gap-2 rounded-xl border p-3 text-sm',
                r.status === 'ok' ? 'border-status-green/20 bg-status-green/10 text-status-green'
                  : r.status === 'erro' ? 'border-status-red/20 bg-status-red/10 text-status-red'
                  : 'border-surface-border bg-surface-hover/50 text-ink-muted'
              )}
            >
              {r.status === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
              ) : r.status === 'erro' ? (
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
              )}
              <span><strong>{nome}:</strong> {r.mensagem}</span>
            </div>
          ))}
        </div>
      )}

      {/* Alerta de saldo Google Ads */}
      <div className="px-4 pb-4">
        <div className={cn(
          'rounded-xl border p-3 transition-all',
          formData.saldo_alertas_ativos
            ? 'bg-status-blue/10 text-status-blue border-status-blue/20'
            : 'bg-surface-hover/50 border-surface-border/50 opacity-70'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span className="text-sm font-medium">Alerta de saldo Google Ads</span>
            <button
              onClick={() => editing && setFormData({ ...formData, saldo_alertas_ativos: !formData.saldo_alertas_ativos })}
              disabled={!editing}
              className={cn(
                'ml-auto w-8 h-4 rounded-full transition-colors relative disabled:cursor-default',
                formData.saldo_alertas_ativos ? 'bg-status-green' : 'bg-surface-border'
              )}
            >
              <span className={cn(
                'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all',
                formData.saldo_alertas_ativos ? 'left-4' : 'left-0.5'
              )} />
            </button>
          </div>
          {editing ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <label className="flex items-center gap-2">
                <span className="text-sm text-ink-secondary shrink-0">Saldo atual R$</span>
                <input
                  type="number" min="0" step="0.01"
                  value={formData.saldo_google}
                  onChange={(e) => setFormData({ ...formData, saldo_google: e.target.value })}
                  placeholder="0,00"
                  className="w-28 px-2 py-1.5 text-sm bg-surface-base border border-surface-border rounded-md focus:outline-none focus:border-ads-500 text-ink-primary"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm text-ink-secondary shrink-0">Avisar abaixo de R$</span>
                <input
                  type="number" min="0" step="1"
                  value={formData.saldo_minimo_alerta}
                  onChange={(e) => setFormData({ ...formData, saldo_minimo_alerta: e.target.value })}
                  placeholder="mínimo global"
                  className="w-28 px-2 py-1.5 text-sm bg-surface-base border border-surface-border rounded-md focus:outline-none focus:border-ads-500 text-ink-primary"
                />
              </label>
              <p className="w-full text-xs opacity-70">
                Contas pré-pagas (boleto) têm o saldo buscado automaticamente no sync diário;
                em contas pós-pagas, informe o saldo aqui quando recarregar.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm">
                {cliente.saldo_google != null ? (
                  <>
                    Saldo atual: <strong>R$ {Number(cliente.saldo_google).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    {cliente.saldo_google_atualizado_em
                      ? ` — atualizado em ${new Date(cliente.saldo_google_atualizado_em).toLocaleDateString('pt-BR')}`
                      : ''}
                  </>
                ) : (
                  'Saldo ainda não informado — o sync busca automaticamente em contas pré-pagas'
                )}
              </p>
              <p className="text-sm">
                {formData.saldo_alertas_ativos
                  ? formData.saldo_minimo_alerta.trim()
                    ? `Avisa quando o saldo cair abaixo de R$ ${formData.saldo_minimo_alerta}`
                    : 'Avisa pelo mínimo global (Configurações → Operacional)'
                  : 'Alertas de saldo desativados para este cliente'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
