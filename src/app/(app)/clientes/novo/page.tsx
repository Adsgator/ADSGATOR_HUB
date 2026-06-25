'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, CheckSquare, ArrowRight, X } from 'lucide-react'
import { criarCliente, criarAssinatura } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import { provisionarClienteNovo } from '@/lib/cliente-provisioning'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import type { ClienteStatus, Cliente } from '@/lib/types'
import { toast } from 'sonner'
import { carregarNichosSugeridos, NICHOS_SUGERIDOS_PADRAO } from '@/lib/listas'

const MSG_BOASVINDAS = (nome: string) =>
  `Olá ${nome.split(' ')[0]}! 👋 Bem-vindo(a) à Adsgator!\n\nEstamos muito felizes em ter você como cliente. Nos próximos dias entraremos em contato para iniciar o onboarding e configurar suas campanhas.\n\nQualquer dúvida, estou à disposição!`

// ── Modal de onboarding pós-criação ─────────────────────────────────────────
function OnboardingModal({ cliente, setupCriado, onClose, onConcluir }: {
  cliente:     Cliente
  setupCriado: boolean
  onClose:     () => void
  onConcluir:  () => void
}) {
  function abrirWhatsApp() {
    const num = cliente.whatsapp?.replace(/\D/g, '')
    if (!num) { toast.error('WhatsApp não cadastrado.'); return }
    const msg = encodeURIComponent(MSG_BOASVINDAS(cliente.nome))
    window.open(`https://wa.me/55${num}?text=${msg}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-surface-card border border-surface-border rounded-2xl card-shadow shadow-2xl w-full max-w-[26rem] animate-fade-scale">
        {/* Header */}
        <div className="flex items-center justify-between px-[1.5rem] py-[1.125rem] border-b border-surface-border">
          <div className="flex items-center gap-[0.5rem]">
            <div className="w-[2rem] h-[2rem] rounded-full bg-status-green/10 flex items-center justify-center">
              <span className="text-[1rem]">🎉</span>
            </div>
            <div>
              <p className="text-ink-primary text-[0.9375rem] font-semibold leading-none">Cliente criado!</p>
              <p className="text-ink-muted text-[0.6875rem] mt-[0.125rem]">{cliente.nome}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[1.75rem] h-[1.75rem] rounded-lg hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
          >
            <X className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
          </button>
        </div>

        {/* Ações */}
        <div className="p-[1.5rem] flex flex-col gap-[0.75rem]">
          <p className="text-ink-secondary text-[0.8125rem] mb-[0.25rem]">
            Próximos passos recomendados:
          </p>

          {/* WhatsApp */}
          <button
            onClick={abrirWhatsApp}
            className="w-full flex items-center gap-[0.75rem] p-[0.875rem] rounded-xl bg-status-green/5 border border-status-green/20 hover:bg-status-green/10 transition-colors group text-left"
          >
            <div className="w-[2.25rem] h-[2.25rem] rounded-lg bg-status-green/15 flex items-center justify-center shrink-0">
              <MessageCircle className="w-[1rem] h-[1rem] text-status-green" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ink-primary text-[0.875rem] font-medium">Enviar boas-vindas</p>
              <p className="text-ink-muted text-[0.75rem]">Abrir WhatsApp com mensagem de boas-vindas</p>
            </div>
            <ArrowRight className="w-[0.875rem] h-[0.875rem] text-ink-muted group-hover:text-status-green shrink-0 transition-colors" strokeWidth={1.75} />
          </button>

          {/* Tarefa de setup — criada automaticamente junto com o cliente */}
          <div className={`w-full flex items-center gap-[0.75rem] p-[0.875rem] rounded-xl border ${
            setupCriado ? 'bg-ads-500/5 border-ads-500/20' : 'bg-status-orange/5 border-status-orange/20'
          }`}>
            <div className={`w-[2.25rem] h-[2.25rem] rounded-lg flex items-center justify-center shrink-0 ${setupCriado ? 'bg-ads-500/15' : 'bg-status-orange/15'}`}>
              <CheckSquare className={`w-[1rem] h-[1rem] ${setupCriado ? 'text-ads-500' : 'text-status-orange'}`} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ink-primary text-[0.875rem] font-medium">
                {setupCriado ? 'Tarefa de setup criada ✓' : 'Tarefa de setup não criada'}
              </p>
              <p className="text-ink-muted text-[0.75rem]">
                {setupCriado
                  ? 'Checklist de integrações e contexto já está em /tarefas'
                  : 'Crie manualmente em Tarefas usando o template "Setup do cliente"'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-[1.5rem] pb-[1.25rem]">
          <button
            onClick={onClose}
            className="text-ink-muted text-[0.8125rem] hover:text-ink-primary transition-colors"
          >
            Fazer depois
          </button>
          <Button variant="primary" size="md" onClick={onConcluir}>
            Ir para o cliente
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function NovoClientePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nome: '', email: '', whatsapp: '',
    dominio: '', nicho: '', plano_nome: '', valor_mensal: '',
  })
  const [salvando,         setSalvando]         = useState(false)
  const [erro,             setErro]             = useState('')
  const [clienteCriado,    setClienteCriado]    = useState<Cliente | null>(null)
  const [setupCriado,      setSetupCriado]      = useState(false)
  const [nichos,           setNichos]           = useState<string[]>(NICHOS_SUGERIDOS_PADRAO)

  React.useEffect(() => {
    carregarNichosSugeridos(supabase).then(setNichos)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      const novoCliente = await criarCliente({
        nome:                   form.nome.trim(),
        email:                  form.email.trim().toLowerCase(),
        whatsapp:               form.whatsapp.replace(/\D/g, ''),
        dominio:                form.dominio.trim() || undefined,
        nicho:                  form.nicho.trim(),
        status:                 'recebido' as ClienteStatus,
        google_ads_customer_id: undefined,
        ga4_property_id:        undefined,
      })

      if (form.plano_nome && form.valor_mensal) {
        await criarAssinatura({
          cliente_id:   novoCliente.id,
          plano_nome:   form.plano_nome.trim(),
          valor_mensal: parseFloat(form.valor_mensal),
        })
      }

      // Tarefa de setup automática — falha não bloqueia a criação do cliente
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await provisionarClienteNovo(supabase, user.id, { id: novoCliente.id, nome: novoCliente.nome }, 'form')
          setSetupCriado(true)
        }
      } catch (provErr) {
        console.error('Provisionamento falhou:', provErr)
      }

      setClienteCriado(novoCliente)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar cliente')
    } finally {
      setSalvando(false)
    }
  }

  const inputClass = 'w-full h-[2.5rem] px-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary placeholder:text-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors'
  const labelClass = 'block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]'

  return (
    <MainLayout title="Novo Cliente" subtitle="Preencha os dados básicos">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        icon={<ArrowLeft className="w-[1rem] h-[1rem]" strokeWidth={1.5} />}
        className="mb-[1.5rem]"
      >
        Voltar
      </Button>

      <div className="max-w-[40rem]">
        {erro && (
          <div className="mb-[1.5rem] bg-status-red/10 border border-status-red/20 rounded-lg px-[1rem] py-[0.75rem]">
            <p className="text-[0.8125rem] text-status-red">{erro}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-surface-card border border-surface-border rounded-2xl card-shadow p-[1.5rem] flex flex-col gap-[1.25rem]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.25rem]">
            <div>
              <label className={labelClass}>Nome completo *</label>
              <input name="nome" value={form.nome} onChange={handleChange} required className={inputClass} placeholder="Ex.: Ana Paula Santos" />
            </div>
            <div>
              <label className={labelClass}>WhatsApp *</label>
              <input name="whatsapp" value={form.whatsapp} onChange={handleChange} required className={inputClass} placeholder="11999998888" />
            </div>
          </div>

          <div>
            <label className={labelClass}>E-mail *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="cliente@email.com" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.25rem]">
            <div>
              <label className={labelClass}>Nicho *</label>
              <select name="nicho" value={form.nicho} onChange={handleChange} required className={inputClass + ' cursor-pointer'}>
                <option value="">Selecione…</option>
                {nichos.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Domínio</label>
              <input name="dominio" value={form.dominio} onChange={handleChange} className={inputClass} placeholder="meusite.com.br" />
            </div>
          </div>

          <div className="border-t border-surface-border pt-[1.25rem]">
            <p className="text-[0.6875rem] text-ink-muted font-semibold uppercase tracking-wide mb-[1rem]">
              Assinatura (opcional)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.25rem]">
              <div>
                <label className={labelClass}>Nome do Plano</label>
                <input name="plano_nome" value={form.plano_nome} onChange={handleChange} className={inputClass} placeholder="Ex.: Plano Starter" />
              </div>
              <div>
                <label className={labelClass}>Valor Mensal (R$)</label>
                <input name="valor_mensal" type="number" min="0" step="0.01" value={form.valor_mensal} onChange={handleChange} className={inputClass} placeholder="0,00" />
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={salvando}>
            {salvando ? 'Criando…' : 'Criar Cliente'}
          </Button>
        </form>
      </div>

      {/* Modal de onboarding pós-criação */}
      {clienteCriado && (
        <OnboardingModal
          cliente={clienteCriado}
          setupCriado={setupCriado}
          onClose={() => router.push(`/clientes/${clienteCriado.id}`)}
          onConcluir={() => router.push(`/clientes/${clienteCriado.id}`)}
        />
      )}
    </MainLayout>
  )
}
