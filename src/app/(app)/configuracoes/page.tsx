'use client'

import React, { useEffect, useState } from 'react'
import {
  Save, User, Bell, Plug, DollarSign,
  Palette, Users, Check, History, Download, Upload,
  Layers, Tag, Plus, Trash2, Pencil, Mail, Zap,
  Settings, MessageSquare, MessageCircle, Briefcase, ShieldCheck, Server, HeartPulse, Sparkles,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button }     from '@/components/ui/Button'
import { supabase }   from '@/lib/supabase'
import { useConfirmDialogStore } from '@/lib/hooks/useConfirmDialog'
import { useTheme } from '@/providers/ThemeProvider'
import { AuditLogViewer } from '@/components/configuracoes/AuditLogViewer'
import { AutomacaoEmail } from '@/components/configuracoes/AutomacaoEmail'
import { Agendamentos } from '@/components/configuracoes/Agendamentos'
import { ImportAsaasModal } from '@/components/configuracoes/ImportAsaasModal'
import { SetupChecklist } from '@/components/configuracoes/SetupChecklist'
import { TemplatesEmail } from '@/components/configuracoes/TemplatesEmail'
import { BibliotecaWhatsApp } from '@/components/configuracoes/BibliotecaWhatsApp'
import { UsoIA } from '@/components/configuracoes/UsoIA'
import type { LimiaresAtraso } from '@/lib/cobranca'
import { HEALTH_REGRAS_PADRAO, type HealthRegras } from '@/lib/health-score'
import { NICHOS_SUGERIDOS_PADRAO } from '@/lib/listas'

type AbaId = 'setup' | 'perfil' | 'notificacoes' | 'integracoes' | 'financeiro' | 'aparencia' | 'equipe' | 'operacional' | 'saude' | 'planos' | 'automacoes' | 'emails' | 'mensagens' | 'uso_ia' | 'backup' | 'auditoria'

const ABAS: Record<AbaId, { label: string; icon: React.ElementType }> = {
  setup:        { label: 'Setup',          icon: Zap        },
  perfil:       { label: 'Perfil',         icon: User       },
  notificacoes: { label: 'Notificações',    icon: Bell       },
  integracoes:  { label: 'Integrações',     icon: Plug       },
  financeiro:   { label: 'Financeiro',      icon: DollarSign },
  aparencia:    { label: 'Aparência',       icon: Palette    },
  equipe:       { label: 'Equipe',          icon: Users      },
  operacional:  { label: 'Operacional',     icon: Layers     },
  saude:        { label: 'Saúde & Listas',  icon: HeartPulse },
  planos:       { label: 'Planos',          icon: Tag        },
  automacoes:   { label: 'Automações',      icon: Settings   },
  emails:       { label: 'Emails',          icon: Mail          },
  mensagens:    { label: 'Mensagens',       icon: MessageCircle },
  uso_ia:       { label: 'Uso da IA',       icon: Sparkles   },
  backup:       { label: 'Backup',          icon: Download   },
  auditoria:    { label: 'Auditoria',       icon: History    },
}

// Categorias do menu lateral. Cada uma agrupa abas relacionadas; quando a
// categoria tem mais de uma aba, elas viram sub-abas no topo do conteúdo.
type CategoriaId = 'geral' | 'comunicacao' | 'cobranca' | 'operacao' | 'conta' | 'sistema'

const CATEGORIAS: { id: CategoriaId; label: string; icon: React.ElementType; abas: AbaId[] }[] = [
  { id: 'geral',       label: 'Geral',        icon: Settings,     abas: ['setup', 'perfil', 'aparencia'] },
  { id: 'comunicacao', label: 'Comunicação',  icon: MessageSquare, abas: ['emails', 'mensagens', 'automacoes', 'notificacoes'] },
  { id: 'cobranca',    label: 'Cobrança',     icon: DollarSign,    abas: ['financeiro', 'planos'] },
  { id: 'operacao',    label: 'Operação',     icon: Briefcase,     abas: ['operacional', 'saude', 'integracoes'] },
  { id: 'conta',       label: 'Conta',        icon: ShieldCheck,   abas: ['equipe', 'auditoria'] },
  { id: 'sistema',     label: 'Sistema',      icon: Server,        abas: ['uso_ia', 'backup'] },
]

interface ConfigFinanceira {
  custos_fixos_mensais:           number
  custos_variaveis_percentual:    number
  margem_lucro_minima:            number
  saldo_google_ads_limite_alerta: number
}

function FeedbackSalvo({ ok, erro }: { ok: boolean; erro: string }) {
  if (erro) return <p className="text-[0.8125rem] text-status-red">{erro}</p>
  if (ok)   return <p className="text-[0.8125rem] text-status-green flex items-center gap-[0.25rem]"><Check className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} /> Salvo com sucesso</p>
  return null
}

function BtnSalvar({ salvando }: { salvando: boolean }) {
  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      loading={salvando}
      icon={<Save className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
    >
      {salvando ? 'Salvando…' : 'Salvar'}
    </Button>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-ink-secondary text-[0.875rem] font-medium mb-[0.375rem]">{label}</label>
      {children}
    </div>
  )
}

function InputText({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
    />
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-[0.5rem]">
      <span className="text-ink-secondary text-[0.875rem]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-[2.75rem] h-[1.5rem] rounded-full transition-colors ${checked ? 'bg-ads-500' : 'bg-surface-hover border border-surface-border'}`}
      >
        <span className={`absolute top-[0.1875rem] left-[0.1875rem] w-[1.125rem] h-[1.125rem] rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[1.25rem]' : ''}`} />
      </button>
    </label>
  )
}

// ── ABA PERFIL ──────────────────────────────────────────────────────────────
function AbaPerfil() {
  const [nome,     setNome]     = useState('')
  const [email,    setEmail]    = useState('')
  const [telefone, setTelefone] = useState('')
  const [cidade,   setCidade]   = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo,    setSalvo]    = useState(false)
  const [erro,     setErro]     = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      if (u) {
        setEmail(u.email ?? '')
        setNome((u.user_metadata?.full_name ?? '') as string)
        setTelefone((u.user_metadata?.telefone ?? '') as string)
        setCidade((u.user_metadata?.cidade ?? '') as string)
      }
    })
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true); setErro(''); setSalvo(false)
    const { error } = await supabase.auth.updateUser({ data: { full_name: nome, telefone, cidade } })
    if (error) setErro(error.message)
    else { setSalvo(true); setTimeout(() => setSalvo(false), 3000) }
    setSalvando(false)
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-[1.25rem] max-w-[28rem]">
      <Campo label="Nome completo"><InputText value={nome} onChange={setNome} placeholder="Seu nome" /></Campo>
      <Campo label="E-mail"><InputText value={email} onChange={() => {}} type="email" placeholder="email@agencia.com" /></Campo>
      <Campo label="Telefone"><InputText value={telefone} onChange={setTelefone} placeholder="+55 11 9 9999-9999" /></Campo>
      <Campo label="Cidade"><InputText value={cidade} onChange={setCidade} placeholder="São Paulo, SP" /></Campo>
      <div className="flex items-center gap-[1rem]">
        <BtnSalvar salvando={salvando} />
        <FeedbackSalvo ok={salvo} erro={erro} />
      </div>
    </form>
  )
}

// ── PREFERÊNCIAS DO USUÁRIO (JSONB compartilhado entre abas) ────────────────
// A coluna `preferencias` guarda chaves de Notificações E Aparência.
// Sempre fazer merge com o que já existe — upsert direto apaga as chaves da outra aba.
async function salvarPreferencias(parcial: Record<string, unknown>): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Sessão expirada — faça login novamente'
  const { data } = await supabase
    .from('configuracoes_usuario')
    .select('preferencias')
    .eq('user_id', user.id)
    .maybeSingle()
  const atual = (data?.preferencias ?? {}) as Record<string, unknown>
  const { error } = await supabase
    .from('configuracoes_usuario')
    .upsert({ user_id: user.id, preferencias: { ...atual, ...parcial } }, { onConflict: 'user_id' })
  return error ? error.message : null
}

async function carregarPreferencias(): Promise<Record<string, unknown> | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('configuracoes_usuario')
    .select('preferencias')
    .eq('user_id', user.id)
    .maybeSingle()
  return (data?.preferencias as Record<string, unknown>) ?? null
}

// ── ABA NOTIFICAÇÕES ────────────────────────────────────────────────────────
const PREFS_DEFAULT = {
  email_alertas_criticos:  true,
  email_relatorio_semanal: false,
  email_relatorio_mensal:  true,
  inapp_criticos:          true,
  inapp_conversoes:        false,
  inapp_verbose:           false,
  dnd_ativo:               false,
  dnd_inicio:              '22:00',
  dnd_fim:                 '08:00',
}

function AbaNotificacoes() {
  const [prefs, setPrefs] = useState(PREFS_DEFAULT)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarPreferencias().then((salvas) => {
      if (salvas) {
        setPrefs((p) => {
          const next = { ...p }
          for (const k of Object.keys(PREFS_DEFAULT) as (keyof typeof PREFS_DEFAULT)[]) {
            if (k in salvas) (next as Record<string, unknown>)[k] = salvas[k]
          }
          return next
        })
      }
      setCarregando(false)
    })
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true); setErro(''); setSalvo(false)
    const msgErro = await salvarPreferencias(prefs)
    if (msgErro) setErro(msgErro)
    else { setSalvo(true); setTimeout(() => setSalvo(false), 3000) }
    setSalvando(false)
  }

  function set<K extends keyof typeof prefs>(k: K, v: (typeof prefs)[K]) {
    setPrefs((p) => ({ ...p, [k]: v }))
  }

  if (carregando) return <div className="text-ink-muted text-[0.875rem]">Carregando preferências…</div>

  return (
    <form onSubmit={salvar} className="flex flex-col gap-[2rem] max-w-[28rem]">
      <div>
        <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.75rem]">E-mail</p>
        <Toggle checked={prefs.email_alertas_criticos}  onChange={(v) => set('email_alertas_criticos', v)}  label="Alertas críticos por e-mail"     />
        <Toggle checked={prefs.email_relatorio_semanal} onChange={(v) => set('email_relatorio_semanal', v)} label="Resumo semanal (sexta-feira)"     />
        <Toggle checked={prefs.email_relatorio_mensal}  onChange={(v) => set('email_relatorio_mensal', v)}  label="Relatório mensal executivo"        />
      </div>
      <div>
        <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.75rem]">In-app</p>
        <Toggle checked={prefs.inapp_criticos}   onChange={(v) => set('inapp_criticos', v)}   label="Notificações críticas"           />
        <Toggle checked={prefs.inapp_conversoes} onChange={(v) => set('inapp_conversoes', v)} label="Novas conversões"                />
        <Toggle checked={prefs.inapp_verbose}    onChange={(v) => set('inapp_verbose', v)}    label="Todas as notificações (verbose)" />
      </div>
      <div>
        <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.75rem]">Não Perturbe (DND)</p>
        <Toggle checked={prefs.dnd_ativo} onChange={(v) => set('dnd_ativo', v)} label="Ativar silêncio noturno" />
        {prefs.dnd_ativo && (
          <div className="flex gap-[1rem] mt-[0.75rem]">
            <Campo label="Início"><InputText type="time" value={prefs.dnd_inicio} onChange={(v) => set('dnd_inicio', v)} /></Campo>
            <Campo label="Fim"><InputText type="time" value={prefs.dnd_fim} onChange={(v) => set('dnd_fim', v)} /></Campo>
          </div>
        )}
      </div>
      <div className="flex items-center gap-[1rem]">
        <BtnSalvar salvando={salvando} />
        <FeedbackSalvo ok={salvo} erro={erro} />
      </div>
    </form>
  )
}

// ── ABA INTEGRAÇÕES ─────────────────────────────────────────────────────────
type IntegracaoStatus = 'ok' | 'warn' | 'error' | 'not_configured' | 'loading'

interface IntegracaoInfo {
  nome: string
  status: IntegracaoStatus
  mensagem: string
  variaveis: string[]
}

function BadgeStatus({ status, mensagem }: { status: IntegracaoStatus; mensagem: string }) {
  const map: Record<IntegracaoStatus, { cls: string; label: string }> = {
    ok:             { cls: 'bg-status-green/15 text-status-green',   label: '✓ Conectado'       },
    warn:           { cls: 'bg-status-orange/15 text-status-orange', label: '⚠ Atenção'          },
    error:          { cls: 'bg-status-red/15 text-status-red',       label: '✗ Erro'             },
    not_configured: { cls: 'bg-surface-hover text-ink-muted',        label: '— Não configurado'  },
    loading:        { cls: 'bg-surface-hover text-ink-muted',        label: 'Verificando…'       },
  }
  const { cls, label } = map[status]
  return (
    <span className={`text-[0.75rem] font-semibold px-[0.5rem] py-[0.125rem] rounded-full ${cls}`} title={mensagem}>
      {label}
    </span>
  )
}

function AbaIntegracoes() {
  const [importModalAberto, setImportModalAberto] = useState(false)
  const [integracoes, setIntegracoes] = useState<IntegracaoInfo[]>([
    { nome: 'Google Ads', status: 'loading', mensagem: '', variaveis: ['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_ADS_REFRESH_TOKEN', 'GOOGLE_ADS_DEVELOPER_TOKEN', 'GOOGLE_ADS_MANAGER_ID'] },
    { nome: 'Asaas',      status: 'loading', mensagem: '', variaveis: ['ASAAS_API_KEY', 'ASAAS_WEBHOOK_KEY'] },
    { nome: 'Vertex AI',  status: 'loading', mensagem: '', variaveis: ['VERTEX_AI_PROJECT_ID', 'VERTEX_AI_LOCATION', 'VERTEX_AI_CREDENTIALS'] },
    { nome: 'GA4',        status: 'loading', mensagem: '', variaveis: ['GOOGLE_APPLICATION_CREDENTIALS'] },
    { nome: 'Resend',     status: 'loading', mensagem: '', variaveis: ['RESEND_API_KEY', 'EMAIL_FROM', 'ALERT_EMAIL'] },
  ])

  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((data) => {
        setIntegracoes((prev) => prev.map((i) => {
          if (i.nome === 'Google Ads') return { ...i, status: data.googleAds?.status ?? 'error', mensagem: data.googleAds?.message ?? '' }
          if (i.nome === 'Asaas')      return { ...i, status: data.asaas?.status    ?? 'error', mensagem: data.asaas?.message    ?? '' }
          if (i.nome === 'Vertex AI')  return { ...i, status: data.vertexAI?.status ?? 'error', mensagem: data.vertexAI?.message  ?? '' }
          if (i.nome === 'GA4')        return { ...i, status: data.ga4?.status      ?? 'error', mensagem: data.ga4?.message       ?? '' }
          if (i.nome === 'Resend')     return { ...i, status: data.resend?.status   ?? 'error', mensagem: data.resend?.message    ?? '' }
          return i
        }))
      })
      .catch(() => {
        setIntegracoes((prev) => prev.map((i) =>
          i.status === 'loading' ? { ...i, status: 'error', mensagem: 'Falha ao verificar status' } : i
        ))
      })
  }, [])

  return (
    <div className="flex flex-col gap-[0.75rem] max-w-[36rem]">
      {importModalAberto && (
        <ImportAsaasModal
          onClose={() => setImportModalAberto(false)}
          onImported={() => { /* listas de clientes recarregam ao navegar */ }}
        />
      )}
      {integracoes.map((i) => (
        <div key={i.nome} className="flex items-start justify-between bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1rem] gap-[1rem]">
          <div className="flex flex-col gap-[0.375rem] min-w-0">
            <p className="text-ink-primary font-semibold text-[0.9375rem]">{i.nome}</p>
            {i.mensagem && (
              <p className="text-ink-muted text-[0.75rem]">{i.mensagem}</p>
            )}
            <div className="flex flex-wrap gap-[0.25rem] mt-[0.125rem]">
              {i.variaveis.map((v) => (
                <code key={v} className="text-[0.6875rem] bg-surface-hover px-[0.375rem] py-[0.0625rem] rounded text-ink-muted font-mono">
                  {v}
                </code>
              ))}
            </div>
            {i.nome === 'Asaas' && i.status === 'ok' && (
              <div className="mt-[0.5rem]">
                <Button variant="secondary" size="sm" onClick={() => setImportModalAberto(true)}>
                  Importar clientes do Asaas
                </Button>
              </div>
            )}
          </div>
          <div className="shrink-0 pt-[0.125rem]">
            <BadgeStatus status={i.status} mensagem={i.mensagem} />
          </div>
        </div>
      ))}
      <p className="text-ink-muted text-[0.75rem] mt-[0.5rem]">
        Configure as variáveis no arquivo{' '}
        <code className="bg-surface-hover px-[0.25rem] rounded">.env.local</code>{' '}
        e reinicie o servidor para aplicar.
      </p>
    </div>
  )
}

// ── ABA FINANCEIRO ──────────────────────────────────────────────────────────
interface EtapaRegua {
  dias:      number
  ativo:     boolean
  template:  string
}

// Limiares de inadimplência (consequências por estágio). As "etapas" abaixo são
// as MENSAGENS da régua; estes são os DIAS em que cada consequência entra em
// vigor (lib/cobranca.ts). Mantidos separados de propósito.
const LIMIARES_PADRAO: LimiaresAtraso = { atencao: 1, suspensao: 7, grave: 15, critico: 30 }

const LIMIARES_CAMPOS: { key: keyof LimiaresAtraso; label: string; hint: string }[] = [
  { key: 'atencao',   label: 'Atenção',        hint: 'lembrete amigável' },
  { key: 'suspensao', label: 'Suspensão',      hint: 'risco de pausar campanhas' },
  { key: 'grave',     label: 'Grave',          hint: 'quebra de contrato' },
  { key: 'critico',   label: 'Crítico',        hint: 'risco de cancelamento' },
]

const ETAPAS_PADRAO: EtapaRegua[] = [
  { dias: 3,  ativo: true,  template: 'Olá {nome}, sua fatura está próxima do vencimento (D+3). Podemos resolver isso juntos?' },
  { dias: 7,  ativo: true,  template: 'Oi {nome}, identificamos que sua mensalidade está em atraso há {dias} dias. Precisamos regularizar para manter suas campanhas ativas.' },
  { dias: 15, ativo: true,  template: '{nome}, seus serviços estão em risco de suspensão por atraso de {dias} dias. Entre em contato imediatamente.' },
  { dias: 30, ativo: false, template: '{nome}, em razão do atraso de {dias} dias, iniciamos processo de cancelamento conforme contrato.' },
]

function AbaFinanceiro() {
  const [config,   setConfig]   = useState<ConfigFinanceira>({ custos_fixos_mensais: 0, custos_variaveis_percentual: 0, margem_lucro_minima: 30, saldo_google_ads_limite_alerta: 50 })
  const [loading,  setLoading]  = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [salvo,    setSalvo]    = useState(false)
  const [erro,     setErro]     = useState('')
  const [etapas,   setEtapas]   = useState<EtapaRegua[]>(ETAPAS_PADRAO)
  const [salvandoRegua, setSalvandoRegua] = useState(false)
  const [salvoRegua,    setSalvoRegua]    = useState(false)
  const [limiares, setLimiares] = useState<LimiaresAtraso>(LIMIARES_PADRAO)
  const [salvandoLimiares, setSalvandoLimiares] = useState(false)
  const [salvoLimiares,    setSalvoLimiares]    = useState(false)

  useEffect(() => {
    supabase.from('configuracoes_financeiras')
      .select('custos_fixos_mensais,custos_variaveis_percentual,margem_lucro_minima,saldo_google_ads_limite_alerta,regua_cobranca,limiares_atraso')
      .eq('agencia_id', 'adsgator-main').single()
      .then(({ data }) => {
        if (data) {
          const d = data as ConfigFinanceira & { regua_cobranca?: EtapaRegua[]; limiares_atraso?: Partial<LimiaresAtraso> }
          setConfig({ custos_fixos_mensais: d.custos_fixos_mensais, custos_variaveis_percentual: d.custos_variaveis_percentual, margem_lucro_minima: d.margem_lucro_minima, saldo_google_ads_limite_alerta: d.saldo_google_ads_limite_alerta })
          if (d.regua_cobranca?.length) setEtapas(d.regua_cobranca)
          if (d.limiares_atraso) setLimiares({ ...LIMIARES_PADRAO, ...d.limiares_atraso })
        }
        setLoading(false)
      })
  }, [])

  async function salvarLimiares(e: React.FormEvent) {
    e.preventDefault()
    setSalvandoLimiares(true)
    await supabase.from('configuracoes_financeiras')
      .update({ limiares_atraso: limiares } as Record<string, unknown>)
      .eq('agencia_id', 'adsgator-main')
    setSalvandoLimiares(false)
    setSalvoLimiares(true)
    setTimeout(() => setSalvoLimiares(false), 3000)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true); setErro(''); setSalvo(false)
    const { error } = await supabase.from('configuracoes_financeiras').update(config).eq('agencia_id', 'adsgator-main')
    if (error) setErro(error.message)
    else { setSalvo(true); setTimeout(() => setSalvo(false), 3000) }
    setSalvando(false)
  }

  async function salvarRegua(e: React.FormEvent) {
    e.preventDefault()
    setSalvandoRegua(true)
    await supabase.from('configuracoes_financeiras')
      .update({ regua_cobranca: etapas } as Record<string, unknown>)
      .eq('agencia_id', 'adsgator-main')
    setSalvandoRegua(false)
    setSalvoRegua(true)
    setTimeout(() => setSalvoRegua(false), 3000)
  }

  function updateEtapa(i: number, field: keyof EtapaRegua, value: unknown) {
    setEtapas((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  }

  const campos = [
    { key: 'custos_fixos_mensais'          as const, label: 'Custos Fixos Mensais (R$)',    prefix: 'R$', suffix: ''  },
    { key: 'custos_variaveis_percentual'   as const, label: 'Custos Variáveis (%)',          prefix: '',   suffix: '%' },
    { key: 'margem_lucro_minima'           as const, label: 'Margem de Lucro Mínima (%)',    prefix: '',   suffix: '%' },
    { key: 'saldo_google_ads_limite_alerta'as const, label: 'Alerta Saldo Google Ads (R$)', prefix: 'R$', suffix: ''  },
  ]

  if (loading) return <div className="h-[12rem] flex items-center justify-center"><div className="w-[1.5rem] h-[1.5rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="flex flex-col gap-[2rem]">
      {/* ── Custos e alertas ── */}
      <form onSubmit={salvar} className="flex flex-col gap-[1.25rem] max-w-[28rem]">
        <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Custos e Alertas</h3>
        {campos.map(({ key, label, prefix, suffix }) => (
          <Campo key={key} label={label}>
            <div className="relative">
              {prefix && <span className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 text-ink-muted text-[0.875rem]">{prefix}</span>}
              <input
                type="number" step="0.01" min="0"
                value={config[key]}
                onChange={(e) => setConfig((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                className={`w-full h-[2.5rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors ${prefix ? 'pl-[2.5rem]' : 'pl-[0.75rem]'} ${suffix ? 'pr-[2rem]' : 'pr-[0.75rem]'}`}
              />
              {suffix && <span className="absolute right-[0.75rem] top-1/2 -translate-y-1/2 text-ink-muted text-[0.875rem]">{suffix}</span>}
            </div>
          </Campo>
        ))}
        <div className="flex items-center gap-[1rem]">
          <BtnSalvar salvando={salvando} />
          <FeedbackSalvo ok={salvo} erro={erro} />
        </div>
      </form>

      {/* ── Estágios de inadimplência (limiares em dias) ── */}
      <form onSubmit={salvarLimiares} className="flex flex-col gap-[1.25rem]">
        <div className="border-t border-surface-border/30 pt-[1.5rem]">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[0.25rem]">Estágios de Inadimplência</h3>
          <p className="text-ink-muted text-[0.8125rem] mb-[1.25rem]">
            A partir de quantos dias de atraso cada consequência entra em vigor. Vale para todo o sistema (alertas, cobrança, status do cliente).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-[1rem] max-w-[36rem]">
            {LIMIARES_CAMPOS.map(({ key, label, hint }) => (
              <div key={key}>
                <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">{label}</label>
                <div className="flex items-center gap-[0.375rem]">
                  <span className="text-ink-muted text-[0.8125rem]">D+</span>
                  <input
                    type="number" min="1" max="365"
                    value={limiares[key]}
                    onChange={(e) => setLimiares((p) => ({ ...p, [key]: parseInt(e.target.value) || 1 }))}
                    className="w-[4.5rem] h-[2.25rem] px-[0.5rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 text-center"
                  />
                </div>
                <p className="text-ink-muted text-[0.6875rem] mt-[0.25rem]">{hint}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-[1rem]">
          <BtnSalvar salvando={salvandoLimiares} />
          <FeedbackSalvo ok={salvoLimiares} erro="" />
        </div>
      </form>

      {/* ── Régua de cobrança ── */}
      <form onSubmit={salvarRegua} className="flex flex-col gap-[1.25rem]">
        <div className="border-t border-surface-border/30 pt-[1.5rem]">
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[0.25rem]">Régua de Cobrança</h3>
          <p className="text-ink-muted text-[0.8125rem] mb-[1.25rem]">
            Configure os triggers automáticos. Use <code className="bg-surface-hover px-1 rounded text-ads-500">{'{nome}'}</code> e <code className="bg-surface-hover px-1 rounded text-ads-500">{'{dias}'}</code> nos templates.
          </p>

          <div className="flex flex-col gap-[1rem]">
            {etapas.map((etapa, i) => (
              <div
                key={i}
                className={`rounded-xl border p-[1rem] flex flex-col gap-[0.75rem] transition-colors ${etapa.ativo ? 'border-ads-500/30 bg-ads-500/5' : 'border-surface-border/30 bg-surface-hover/50'}`}
              >
                <div className="flex items-center justify-between gap-[1rem]">
                  <div className="flex items-center gap-[0.75rem]">
                    <span className={`text-[0.75rem] font-bold px-[0.5rem] py-[0.125rem] rounded-full ${etapa.ativo ? 'bg-ads-500/15 text-ads-500' : 'bg-surface-hover text-ink-muted'}`}>
                      D+{etapa.dias}
                    </span>
                    <div className="flex items-center gap-[0.375rem]">
                      <label className="text-ink-secondary text-[0.8125rem]">Dias de atraso:</label>
                      <input
                        type="number" min="1" max="180"
                        value={etapa.dias}
                        onChange={(e) => updateEtapa(i, 'dias', parseInt(e.target.value) || 1)}
                        className="w-[4rem] h-[2rem] px-[0.5rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.8125rem] focus:outline-none focus:ring-1 focus:ring-ads-500/30 text-center"
                      />
                    </div>
                  </div>

                  {/* Toggle ativo */}
                  <button
                    type="button"
                    onClick={() => updateEtapa(i, 'ativo', !etapa.ativo)}
                    className={`relative w-[2.5rem] h-[1.375rem] rounded-full transition-colors shrink-0 ${etapa.ativo ? 'bg-ads-500' : 'bg-surface-hover border border-surface-border'}`}
                  >
                    <span className={`absolute top-[0.1875rem] w-[1rem] h-[1rem] rounded-full bg-white transition-transform shadow-sm ${etapa.ativo ? 'translate-x-[1.3125rem]' : 'translate-x-[0.1875rem]'}`} />
                  </button>
                </div>

                <textarea
                  value={etapa.template}
                  onChange={(e) => updateEtapa(i, 'template', e.target.value)}
                  disabled={!etapa.ativo}
                  rows={2}
                  className="w-full px-[0.75rem] py-[0.5rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.8125rem] resize-none focus:outline-none focus:ring-2 focus:ring-ads-500/20 focus:border-ads-500/50 transition-colors disabled:opacity-40"
                  placeholder="Template da mensagem…"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-[1rem]">
          <BtnSalvar salvando={salvandoRegua} />
          <FeedbackSalvo ok={salvoRegua} erro="" />
        </div>
      </form>
    </div>
  )
}

// ── ABA APARÊNCIA ───────────────────────────────────────────────────────────
function AbaAparencia() {
  // O tema vem do ThemeProvider (fonte de verdade, persiste em localStorage)
  // e é aplicado na hora ao clicar. O save persiste tudo no banco.
  const { theme: tema, setTheme: setTema } = useTheme()
  const [idioma,  setIdioma]  = useState('pt-BR')
  const [fuso,    setFuso]    = useState('America/Sao_Paulo')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregarPreferencias().then((salvas) => {
      if (!salvas) return
      if (typeof salvas.idioma === 'string') setIdioma(salvas.idioma)
      if (typeof salvas.fuso === 'string')   setFuso(salvas.fuso)
    })
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true); setErro(''); setSalvo(false)
    const msgErro = await salvarPreferencias({ tema, idioma, fuso })
    if (msgErro) setErro(msgErro)
    else { setSalvo(true); setTimeout(() => setSalvo(false), 3000) }
    setSalvando(false)
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-[1.5rem] max-w-[28rem]">
      <Campo label="Tema">
        <div className="grid grid-cols-3 gap-[0.5rem]">
          {(['dark', 'light', 'system'] as const).map((t) => (
            <button
              key={t} type="button" onClick={() => setTema(t)}
              className={`h-[2.5rem] rounded-lg border text-[0.875rem] font-medium transition-colors capitalize ${tema === t ? 'border-ads-500 bg-ads-500/10 text-ads-500' : 'border-surface-border bg-surface-hover text-ink-secondary hover:text-ink-primary'}`}
            >
              {t === 'dark' ? 'Escuro' : t === 'light' ? 'Claro' : 'Sistema'}
            </button>
          ))}
        </div>
      </Campo>
      <Campo label="Idioma">
        <select value={idioma} onChange={(e) => setIdioma(e.target.value)} className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30">
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en-US">English (US)</option>
          <option value="es">Español</option>
        </select>
      </Campo>
      <Campo label="Fuso Horário">
        <select value={fuso} onChange={(e) => setFuso(e.target.value)} className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30">
          <option value="America/Sao_Paulo">América/São Paulo (UTC-3)</option>
          <option value="America/Manaus">América/Manaus (UTC-4)</option>
          <option value="America/Belem">América/Belém (UTC-3)</option>
          <option value="America/Fortaleza">América/Fortaleza (UTC-3)</option>
        </select>
      </Campo>
      <div className="flex items-center gap-[1rem]">
        <BtnSalvar salvando={salvando} />
        <FeedbackSalvo ok={salvo} erro={erro} />
      </div>
    </form>
  )
}

// ── ABA EQUIPE ──────────────────────────────────────────────────────────────
function AbaEquipe() {
  const [email,     setEmail]     = useState('')
  const [papel,     setPapel]     = useState<'gerenciador' | 'analista' | 'viewer'>('analista')
  const [enviando,  setEnviando]  = useState(false)
  const [feedbackI, setFeedbackI] = useState('')

  async function convidar(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setEnviando(true); setFeedbackI('')
    const { error } = await supabase.auth.admin?.inviteUserByEmail
      ? await (supabase.auth as { admin?: { inviteUserByEmail: (email: string) => Promise<{ error: unknown }> } }).admin!.inviteUserByEmail(email)
      : { error: new Error('Admin API não disponível client-side') }
    if (error) setFeedbackI('Use o painel Supabase para convidar membros.')
    else { setFeedbackI(`Convite enviado para ${email}`); setEmail('') }
    setEnviando(false)
  }

  const PAPEIS = [
    { value: 'proprietario', label: 'Proprietário',  desc: 'Acesso total'             },
    { value: 'gerenciador',  label: 'Gerenciador',   desc: 'CRUD completo de clientes' },
    { value: 'analista',     label: 'Analista',      desc: 'Leitura + relatórios'      },
    { value: 'viewer',       label: 'Viewer',        desc: 'Somente leitura'           },
  ]

  return (
    <div className="max-w-[32rem] flex flex-col gap-[2rem]">
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem]">
        <p className="text-ink-primary font-semibold text-[0.9375rem] mb-[1rem]">Papéis disponíveis</p>
        <div className="flex flex-col gap-[0.5rem]">
          {PAPEIS.map((p) => (
            <div key={p.value} className="flex items-center justify-between">
              <span className="text-ink-secondary text-[0.875rem] font-medium">{p.label}</span>
              <span className="text-ink-muted text-[0.75rem]">{p.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={convidar} className="flex flex-col gap-[1rem]">
        <p className="text-ink-primary font-semibold text-[0.9375rem]">Convidar membro</p>
        <Campo label="E-mail"><InputText type="email" value={email} onChange={setEmail} placeholder="membro@agencia.com" /></Campo>
        <Campo label="Papel">
          <select value={papel} onChange={(e) => setPapel(e.target.value as typeof papel)} className="w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30">
            <option value="gerenciador">Gerenciador</option>
            <option value="analista">Analista</option>
            <option value="viewer">Viewer</option>
          </select>
        </Campo>
        <div className="flex items-center gap-[1rem]">
          <button type="submit" disabled={enviando || !email} className="flex items-center gap-[0.5rem] h-[2.5rem] px-[1.25rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white text-[0.875rem] font-semibold transition-colors disabled:opacity-50">
            {enviando ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Users className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
            Enviar Convite
          </button>
          {feedbackI && <p className="text-ink-muted text-[0.8125rem]">{feedbackI}</p>}
        </div>
        <p className="text-ink-muted text-[0.75rem]">Para convidar via painel, acesse Authentication → Users no Supabase Dashboard.</p>
      </form>
    </div>
  )
}

// ── ABA BACKUP ──────────────────────────────────────────────────────────────
function AbaBackup() {
  const [exportando, setExportando] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function exportarDados() {
    setExportando(true)
    setFeedback('')
    try {
      const [clientes, tarefas, lancamentos] = await Promise.all([
        supabase.from('clientes').select('*'),
        supabase.from('tarefas').select('*'),
        supabase.from('financeiro_lancamentos').select('*'),
      ])

      const backup = {
        timestamp: new Date().toISOString(),
        versao: '1.0',
        dados: {
          clientes: clientes.data ?? [],
          tarefas: tarefas.data ?? [],
          lancamentos: lancamentos.data ?? [],
        },
      }

      const json = JSON.stringify(backup, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-adsgator-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)

      setFeedback('✓ Backup exportado com sucesso!')
    } catch {
      setFeedback('✗ Erro ao exportar backup. Tente novamente.')
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="max-w-[32rem] flex flex-col gap-[2rem]">
      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem]">
        <div className="flex items-start justify-between mb-[1rem]">
          <div>
            <p className="text-ink-primary font-semibold text-[0.9375rem]">Exportar Dados</p>
            <p className="text-ink-muted text-[0.75rem] mt-[0.25rem]">Baixe um arquivo JSON com todos os seus dados</p>
          </div>
          <Download className="w-[1.25rem] h-[1.25rem] text-ads-500 shrink-0" strokeWidth={1.75} />
        </div>
        <p className="text-ink-secondary text-[0.8125rem] leading-relaxed mb-[1rem]">
          Inclui: clientes, tarefas, histórico financeiro e configurações. Use para backup pessoal ou migração.
        </p>
        <button
          onClick={exportarDados}
          disabled={exportando}
          className="flex items-center gap-[0.5rem] h-[2.5rem] px-[1.25rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white text-[0.875rem] font-semibold transition-colors disabled:opacity-50"
        >
          {exportando ? <div className="w-[0.875rem] h-[0.875rem] border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
          {exportando ? 'Exportando…' : 'Exportar Dados'}
        </button>
        {feedback && <p className={`text-[0.8125rem] mt-[0.75rem] ${feedback.startsWith('✓') ? 'text-status-green' : 'text-status-red'}`}>{feedback}</p>}
      </div>

      <div className="bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow p-[1.25rem] opacity-50">
        <div className="flex items-start justify-between mb-[1rem]">
          <div>
            <p className="text-ink-primary font-semibold text-[0.9375rem]">Importar Dados</p>
            <p className="text-ink-muted text-[0.75rem] mt-[0.25rem]">Restaurar de um arquivo JSON anterior</p>
          </div>
          <Upload className="w-[1.25rem] h-[1.25rem] text-ink-muted shrink-0" strokeWidth={1.75} />
        </div>
        <p className="text-ink-secondary text-[0.8125rem] leading-relaxed mb-[1rem]">
          Funcionalidade disponível em breve. Use o painel Supabase para restaurar dados manualmente.
        </p>
        <button
          disabled
          className="flex items-center gap-[0.5rem] h-[2.5rem] px-[1.25rem] rounded-lg bg-surface-elevated text-ink-muted text-[0.875rem] font-semibold transition-colors cursor-not-allowed"
        >
          <Upload className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
          Importar Dados (em breve)
        </button>
      </div>

      <div className="bg-status-blue/10 border border-status-blue/20 rounded-lg p-[1rem]">
        <p className="text-status-blue text-[0.8125rem] leading-relaxed">
          <strong>Dica:</strong> Realize backups regularmente. Para restaurações em massa, acesse o painel Supabase Dashboard e use a seção de Backups & Recovery.
        </p>
      </div>
    </div>
  )
}

// ── ABA SAÚDE & LISTAS ───────────────────────────────────────────────────────
const HEALTH_CAMPOS_PESO: { key: keyof HealthRegras; label: string }[] = [
  { key: 'peso_pagamento',  label: 'Pagamento em dia' },
  { key: 'peso_google',     label: 'Integração Google ativa' },
  { key: 'peso_checklist',  label: 'Checklist > 50%' },
  { key: 'peso_atualizado', label: 'Atualizado nos últimos 7 dias' },
  { key: 'peso_status',     label: 'Status positivo (ativo/onboarding)' },
]

function AbaSaude() {
  const [regras, setRegras] = useState<HealthRegras>(HEALTH_REGRAS_PADRAO)
  const [nichos, setNichos] = useState<string[]>(NICHOS_SUGERIDOS_PADRAO)
  const [novoNicho, setNovoNicho] = useState('')
  const [salvandoSaude, setSalvandoSaude] = useState(false)
  const [okSaude, setOkSaude] = useState(false)
  const [salvandoNichos, setSalvandoNichos] = useState(false)
  const [okNichos, setOkNichos] = useState(false)

  useEffect(() => {
    supabase.from('configuracoes_operacional')
      .select('health_regras, nichos_sugeridos')
      .eq('agencia_id', 'adsgator-main').maybeSingle()
      .then(({ data }) => {
        if (data?.health_regras) setRegras({ ...HEALTH_REGRAS_PADRAO, ...data.health_regras })
        if (Array.isArray(data?.nichos_sugeridos) && data.nichos_sugeridos.length) setNichos(data.nichos_sugeridos)
      })
  }, [])

  const somaPesos = HEALTH_CAMPOS_PESO.reduce((acc, { key }) => acc + (regras[key] || 0), 0)

  async function salvarSaude(e: React.FormEvent) {
    e.preventDefault()
    setSalvandoSaude(true)
    await supabase.from('configuracoes_operacional')
      .upsert({ agencia_id: 'adsgator-main', health_regras: regras } as Record<string, unknown>, { onConflict: 'agencia_id' })
    setSalvandoSaude(false)
    setOkSaude(true); setTimeout(() => setOkSaude(false), 3000)
  }

  async function salvarNichos() {
    setSalvandoNichos(true)
    await supabase.from('configuracoes_operacional')
      .upsert({ agencia_id: 'adsgator-main', nichos_sugeridos: nichos } as Record<string, unknown>, { onConflict: 'agencia_id' })
    setSalvandoNichos(false)
    setOkNichos(true); setTimeout(() => setOkNichos(false), 3000)
  }

  function addNicho() {
    const n = novoNicho.trim()
    if (!n || nichos.includes(n)) { setNovoNicho(''); return }
    setNichos((p) => [...p, n]); setNovoNicho('')
  }

  return (
    <div className="flex flex-col gap-[2.5rem] max-w-[40rem]">
      {/* Regras de health score */}
      <form onSubmit={salvarSaude} className="flex flex-col gap-[1.25rem]">
        <div>
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[0.25rem]">Regras de Saúde do Cliente</h3>
          <p className="text-ink-muted text-[0.8125rem]">
            Pesos de cada critério do health score (0–100). Soma atual:{' '}
            <strong className={somaPesos === 100 ? 'text-status-green' : 'text-status-orange'}>{somaPesos}</strong>
            {somaPesos !== 100 && ' (o ideal é somar 100)'}.
          </p>
        </div>
        <div className="flex flex-col gap-[0.75rem]">
          {HEALTH_CAMPOS_PESO.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-[1rem]">
              <label className="text-ink-secondary text-[0.875rem]">{label}</label>
              <div className="flex items-center gap-[0.375rem]">
                <span className="text-ink-muted text-[0.8125rem]">+</span>
                <input
                  type="number" min="0" max="100"
                  value={regras[key]}
                  onChange={(e) => setRegras((p) => ({ ...p, [key]: parseInt(e.target.value) || 0 }))}
                  className="w-[4.5rem] h-[2.25rem] px-[0.5rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] text-center focus:outline-none focus:ring-2 focus:ring-ads-500/20"
                />
              </div>
            </div>
          ))}
          <div className="border-t border-surface-border/30 pt-[0.75rem] mt-[0.25rem] flex flex-col gap-[0.75rem]">
            {([['nivel_saudavel', 'Saudável a partir de'], ['nivel_atencao', 'Atenção a partir de']] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-[1rem]">
                <label className="text-ink-secondary text-[0.875rem]">{label}</label>
                <div className="flex items-center gap-[0.375rem]">
                  <input
                    type="number" min="0" max="100"
                    value={regras[key]}
                    onChange={(e) => setRegras((p) => ({ ...p, [key]: parseInt(e.target.value) || 0 }))}
                    className="w-[4.5rem] h-[2.25rem] px-[0.5rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] text-center focus:outline-none focus:ring-2 focus:ring-ads-500/20"
                  />
                  <span className="text-ink-muted text-[0.8125rem]">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-[1rem]">
          <BtnSalvar salvando={salvandoSaude} />
          <FeedbackSalvo ok={okSaude} erro="" />
        </div>
      </form>

      {/* Lista de nichos sugeridos */}
      <div className="flex flex-col gap-[1rem] border-t border-surface-border/30 pt-[1.5rem]">
        <div>
          <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[0.25rem]">Nichos Sugeridos</h3>
          <p className="text-ink-muted text-[0.8125rem]">Aparecem no formulário de novo cliente.</p>
        </div>
        <div className="flex flex-wrap gap-[0.5rem]">
          {nichos.map((n) => (
            <span key={n} className="inline-flex items-center gap-[0.375rem] px-[0.625rem] py-[0.25rem] rounded-full bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.8125rem]">
              {n}
              <button type="button" onClick={() => setNichos((p) => p.filter((x) => x !== n))} className="text-ink-muted hover:text-status-red transition-colors">
                <Trash2 className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-[0.5rem]">
          <input
            value={novoNicho}
            onChange={(e) => setNovoNicho(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNicho() } }}
            placeholder="Adicionar nicho…"
            className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/20 w-[14rem]"
          />
          <Button type="button" variant="secondary" size="sm" onClick={addNicho}>
            <Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} /> Adicionar
          </Button>
        </div>
        <div className="flex items-center gap-[1rem]">
          <Button type="button" variant="primary" size="md" onClick={salvarNichos} disabled={salvandoNichos}>
            {salvandoNichos ? 'Salvando…' : 'Salvar nichos'}
          </Button>
          <FeedbackSalvo ok={okNichos} erro="" />
        </div>
      </div>
    </div>
  )
}

// ── ABA OPERACIONAL ──────────────────────────────────────────────────────────
interface ConfigOperacional {
  sla_onboarding_dias:     number
  sla_setup_trafego_dias:  number
  sla_ativo_dias:          number
  horario_inicio:          string
  horario_fim:             string
  alerta_inadimplencia_dias: number
  alerta_saldo_ads_minimo: number
}

function AbaOperacional() {
  const [cfg, setCfg] = useState<ConfigOperacional>({
    sla_onboarding_dias:       7,
    sla_setup_trafego_dias:    14,
    sla_ativo_dias:            30,
    horario_inicio:            '08:00',
    horario_fim:               '18:00',
    alerta_inadimplencia_dias: 3,
    alerta_saldo_ads_minimo:   50,
  })
  const [salvando, setSalvando] = useState(false)
  const [ok,       setOk]       = useState(false)
  const [erro,     setErro]     = useState('')

  useEffect(() => {
    supabase.from('configuracoes_operacional').select('*').eq('agencia_id', 'adsgator-main').single()
      .then(({ data }) => { if (data) setCfg(data as ConfigOperacional) })
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true); setOk(false); setErro('')
    const { error } = await supabase.from('configuracoes_operacional')
      .upsert({ ...cfg, agencia_id: 'adsgator-main' }, { onConflict: 'agencia_id' })
    setSalvando(false)
    if (error) { setErro(error.message); return }
    setOk(true)
    setTimeout(() => setOk(false), 3000)
  }

  const field = (label: string, key: keyof ConfigOperacional, type: string = 'number', suffix?: string) => (
    <div>
      <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">{label}</label>
      <div className="flex items-center gap-[0.5rem]">
        <input
          type={type}
          value={cfg[key] as string | number}
          onChange={(e) => setCfg((c) => ({ ...c, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          className="h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 w-[10rem]"
        />
        {suffix && <span className="text-ink-muted text-[0.8125rem]">{suffix}</span>}
      </div>
    </div>
  )

  return (
    <form onSubmit={salvar} className="flex flex-col gap-[2rem] max-w-[36rem]">
      <div>
        <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1rem]">SLA por estágio</h3>
        <div className="flex flex-col gap-[1rem]">
          {field('Onboarding — prazo máximo', 'sla_onboarding_dias', 'number', 'dias')}
          {field('Setup de tráfego — prazo máximo', 'sla_setup_trafego_dias', 'number', 'dias')}
          {field('Revisão periódica de clientes ativos', 'sla_ativo_dias', 'number', 'dias')}
        </div>
      </div>
      <div>
        <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1rem]">Horário de trabalho</h3>
        <div className="flex gap-[1.5rem]">
          {field('Início', 'horario_inicio', 'time')}
          {field('Fim', 'horario_fim', 'time')}
        </div>
      </div>
      <div>
        <h3 className="text-ink-primary font-semibold text-[0.9375rem] mb-[1rem]">Alertas automáticos</h3>
        <div className="flex flex-col gap-[1rem]">
          {field('Alertar inadimplência após', 'alerta_inadimplencia_dias', 'number', 'dias de atraso')}
          {field('Alertar saldo Google Ads abaixo de', 'alerta_saldo_ads_minimo', 'number', 'R$')}
        </div>
      </div>
      <div className="flex items-center gap-[1rem]">
        <BtnSalvar salvando={salvando} />
        <FeedbackSalvo ok={ok} erro={erro} />
      </div>
    </form>
  )
}

// ── ABA PLANOS ───────────────────────────────────────────────────────────────
interface PlanoServico {
  id:         string
  nome:       string
  valor:      number
  cor:        string
  features:   string[]
  ativo:      boolean
}

const CORES_PLANO = ['#FFB100', '#22c55e', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4']

function AbaPlanos() {
  const [planos,    setPlanos]   = useState<PlanoServico[]>([])
  const [loading,   setLoading]  = useState(true)
  const [editando,  setEditando] = useState<PlanoServico | null>(null)
  const [novo,      setNovo]     = useState(false)

  const carregar = async () => {
    setLoading(true)
    const { data } = await supabase.from('planos_servico').select('*').order('valor')
    setPlanos((data ?? []) as PlanoServico[])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function salvarPlano(p: Partial<PlanoServico> & { nome: string; valor: number }) {
    if (p.id) {
      await supabase.from('planos_servico').update(p).eq('id', p.id)
    } else {
      await supabase.from('planos_servico').insert({ ...p, ativo: true, features: p.features ?? [] })
    }
    setEditando(null); setNovo(false); carregar()
  }

  function deletarPlano(id: string) {
    const openConfirm = useConfirmDialogStore.getState().openConfirm
    openConfirm(
      'Deletar Plano',
      'Este plano será removido permanentemente. Esta ação não pode ser desfeita.',
      async () => {
        await supabase.from('planos_servico').delete().eq('id', id)
        carregar()
      }
    )
  }

  return (
    <div className="flex flex-col gap-[1.5rem] max-w-[42rem]">
      <div className="flex items-center justify-between">
        <p className="text-ink-muted text-[0.875rem]">Configure os planos oferecidos pela sua agência.</p>
        <Button variant="primary" size="sm" icon={<Plus className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
          onClick={() => { setNovo(true); setEditando({ id: '', nome: '', valor: 0, cor: CORES_PLANO[0], features: [], ativo: true }) }}>
          Novo plano
        </Button>
      </div>

      {loading ? (
        <p className="text-ink-muted text-[0.875rem]">Carregando…</p>
      ) : planos.length === 0 && !novo ? (
        <div className="bg-surface-hover border border-surface-border rounded-xl p-[2rem] text-center">
          <Tag className="w-[2rem] h-[2rem] text-ink-muted mx-auto mb-[0.75rem]" strokeWidth={1} />
          <p className="text-ink-secondary text-[0.875rem]">Nenhum plano cadastrado ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-[0.75rem]">
          {planos.map((p) => (
            editando?.id === p.id ? (
              <PlanoForm key={p.id} plano={editando} onSave={salvarPlano} onCancel={() => setEditando(null)} />
            ) : (
              <div key={p.id} className="flex items-center gap-[1rem] bg-surface-card border border-surface-border rounded-xl px-[1.25rem] py-[0.875rem]">
                <div className="w-[0.625rem] h-[0.625rem] rounded-full shrink-0" style={{ background: p.cor }} />
                <div className="flex-1 min-w-0">
                  <p className="text-ink-primary text-[0.875rem] font-semibold">{p.nome}</p>
                  <p className="text-ink-muted text-[0.75rem]">{p.features.length} feature{p.features.length !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-ink-primary font-semibold text-[0.9375rem] shrink-0">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}<span className="text-ink-muted text-[0.75rem] font-normal">/mês</span>
                </p>
                <div className="flex items-center gap-[0.25rem]">
                  <Button variant="ghost" size="sm" className="w-[2rem] px-0" onClick={() => setEditando(p)}>
                    <Pencil className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-[2rem] px-0 text-status-red hover:text-status-red hover:bg-status-red/10" onClick={() => deletarPlano(p.id)}>
                    <Trash2 className="w-[0.75rem] h-[0.75rem]" strokeWidth={1.75} />
                  </Button>
                </div>
              </div>
            )
          ))}
          {novo && editando && !editando.id && (
            <PlanoForm plano={editando} onSave={salvarPlano} onCancel={() => { setNovo(false); setEditando(null) }} />
          )}
        </div>
      )}
    </div>
  )
}

function PlanoForm({ plano, onSave, onCancel }: { plano: PlanoServico; onSave: (p: PlanoServico) => void; onCancel: () => void }) {
  const [form, setForm] = useState<PlanoServico>(plano)
  const [featInput, setFeatInput] = useState('')

  function addFeature() {
    const v = featInput.trim()
    if (!v) return
    setForm((f) => ({ ...f, features: [...f.features, v] }))
    setFeatInput('')
  }

  return (
    <div className="bg-surface-elevated border border-ads-500/30 rounded-xl p-[1.25rem] flex flex-col gap-[1rem]">
      <div className="grid grid-cols-2 gap-[0.75rem]">
        <div>
          <label className="block text-ink-secondary text-[0.75rem] font-medium mb-[0.25rem]">Nome</label>
          <input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            className="w-full h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30" placeholder="Ex: Starter" />
        </div>
        <div>
          <label className="block text-ink-secondary text-[0.75rem] font-medium mb-[0.25rem]">Valor mensal (R$)</label>
          <input type="number" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: Number(e.target.value) }))}
            className="w-full h-[2.25rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30" />
        </div>
      </div>
      <div>
        <label className="block text-ink-secondary text-[0.75rem] font-medium mb-[0.375rem]">Cor</label>
        <div className="flex gap-[0.5rem]">
          {CORES_PLANO.map((c) => (
            <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, cor: c }))}
              className={`w-[1.5rem] h-[1.5rem] rounded-full transition-all ${form.cor === c ? 'ring-2 ring-offset-2 ring-ads-500' : ''}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-ink-secondary text-[0.75rem] font-medium mb-[0.375rem]">Features incluídas</label>
        <div className="flex gap-[0.5rem] mb-[0.5rem]">
          <input value={featInput} onChange={(e) => setFeatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature() } }}
            placeholder="Adicionar feature…"
            className="flex-1 h-[2rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30" />
          <Button variant="secondary" size="sm" onClick={addFeature}>Adicionar</Button>
        </div>
        <div className="flex flex-wrap gap-[0.375rem]">
          {form.features.map((f, i) => (
            <span key={i} className="flex items-center gap-[0.25rem] px-[0.5rem] py-[0.125rem] bg-surface-hover border border-surface-border rounded-full text-[0.75rem] text-ink-secondary">
              {f}
              <button type="button" onClick={() => setForm((f2) => ({ ...f2, features: f2.features.filter((_, j) => j !== i) }))}
                className="text-ink-muted hover:text-status-red transition-colors">×</button>
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-[0.75rem] pt-[0.25rem]">
        <Button variant="primary" size="sm" onClick={() => onSave(form)} disabled={!form.nome.trim()}>Salvar plano</Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  )
}

// ── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
function categoriaDaAba(aba: AbaId): CategoriaId {
  return CATEGORIAS.find((c) => c.abas.includes(aba))?.id ?? 'geral'
}

export default function ConfiguracoesPage() {
  const [aba, setAba] = useState<AbaId>('setup')
  const [categoria, setCategoria] = useState<CategoriaId>('geral')

  // Deep-link ?tab=<aba> lido via window.location (useSearchParams exigiria
  // Suspense boundary no Next 15 — desnecessário para um parâmetro estático).
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab')
    if (tab && tab in ABAS) {
      setAba(tab as AbaId)
      setCategoria(categoriaDaAba(tab as AbaId))
    }
  }, [])

  function abrirAba(a: AbaId) {
    setAba(a)
    setCategoria(categoriaDaAba(a))
  }

  function selecionarCategoria(c: CategoriaId) {
    setCategoria(c)
    // Ao trocar de categoria, ativa a primeira aba dela (se a atual não pertence).
    const cat = CATEGORIAS.find((x) => x.id === c)
    if (cat && !cat.abas.includes(aba)) setAba(cat.abas[0])
  }

  const ABA_CONTENT: Record<AbaId, React.ReactNode> = {
    setup:         <SetupChecklist onAbrirAba={(a) => { if (a in ABAS) abrirAba(a as AbaId) }} />,
    perfil:        <AbaPerfil />,
    notificacoes:  <AbaNotificacoes />,
    integracoes:   <AbaIntegracoes />,
    financeiro:    <AbaFinanceiro />,
    aparencia:     <AbaAparencia />,
    equipe:        <AbaEquipe />,
    operacional:   <AbaOperacional />,
    saude:         <AbaSaude />,
    planos:        <AbaPlanos />,
    automacoes:    (
      <div className="flex flex-col gap-[2rem]">
        <AutomacaoEmail />
        <Agendamentos />
      </div>
    ),
    emails:        <TemplatesEmail />,
    mensagens:     <BibliotecaWhatsApp />,
    uso_ia:        <UsoIA />,
    backup:        <AbaBackup />,
    auditoria:     <AuditLogViewer />,
  }

  const catAtual = CATEGORIAS.find((c) => c.id === categoria) ?? CATEGORIAS[0]
  const subAbas  = catAtual.abas

  return (
    <MainLayout title="Configurações" subtitle="Personalize a Adsgator conforme sua operação">
      <div className="flex gap-[1.5rem] items-start">
        {/* Menu lateral — categorias */}
        <nav className="w-[12rem] shrink-0 flex flex-col gap-[0.25rem] sticky top-[1rem]">
          {CATEGORIAS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => selecionarCategoria(id)}
              className={`flex items-center gap-[0.625rem] h-[2.375rem] px-[0.75rem] rounded-lg text-[0.875rem] font-medium transition-colors text-left ${
                categoria === id
                  ? 'bg-ads-500/10 text-ads-600'
                  : 'text-ink-muted hover:text-ink-secondary hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-[1rem] h-[1rem] shrink-0" strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </nav>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0 flex flex-col gap-[1.5rem]">
          {/* Sub-abas (só quando a categoria tem mais de uma) */}
          {subAbas.length > 1 && (
            <div className="flex gap-[0.25rem] flex-wrap border-b border-surface-border pb-[0.25rem]">
              {subAbas.map((id) => {
                const { label, icon: Icon } = ABAS[id]
                return (
                  <button
                    key={id}
                    onClick={() => setAba(id)}
                    className={`flex items-center gap-[0.375rem] h-[2.25rem] px-[0.875rem] rounded-t-lg text-[0.875rem] font-medium transition-colors ${
                      aba === id
                        ? 'text-ads-500 border-b-2 border-ads-500 -mb-[0.3125rem]'
                        : 'text-ink-muted hover:text-ink-secondary'
                    }`}
                  >
                    <Icon className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
                    {label}
                  </button>
                )
              })}
            </div>
          )}

          <div>{ABA_CONTENT[aba]}</div>
        </div>
      </div>
    </MainLayout>
  )
}
