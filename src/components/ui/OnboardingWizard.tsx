'use client'

import { useState } from 'react'
import { ChevronRight, X, CheckCircle2, User, Link2, DollarSign, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const STORAGE_KEY = 'adsgator_onboarding_done'

const PASSOS = [
  {
    id:       'perfil',
    icone:    User,
    titulo:   'Bem-vindo ao Adsgator Hub!',
    desc:     'Vamos configurar sua conta em 4 passos rápidos.',
    cor:      'text-ads-500',
    corBg:    'bg-ads-500/10',
  },
  {
    id:       'integracoes',
    icone:    Link2,
    titulo:   'Configure as integrações',
    desc:     'Conecte o Google Ads, GA4 e Asaas para ter dados em tempo real.',
    cor:      'text-status-blue',
    corBg:    'bg-status-blue/10',
  },
  {
    id:       'financeiro',
    icone:    DollarSign,
    titulo:   'Defina seus custos',
    desc:     'Informe seus custos fixos para calcular o DRE e a margem de lucro.',
    cor:      'text-status-green',
    corBg:    'bg-status-green/10',
  },
  {
    id:       'cliente',
    icone:    UserPlus,
    titulo:   'Adicione seu primeiro cliente',
    desc:     'Cadastre um cliente para começar a acompanhar suas campanhas.',
    cor:      'text-status-purple',
    corBg:    'bg-status-purple/10',
  },
]

export function OnboardingWizard({ onConcluir }: { onConcluir: () => void }) {
  const [passo, setPasso] = useState(0)

  function concluir() {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
    onConcluir()
  }

  function pular() {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
    onConcluir()
  }

  async function avancar() {
    if (passo === PASSOS.length - 1) {
      concluir()
      return
    }
    setPasso((p) => p + 1)
  }

  function getCta() {
    const { id } = PASSOS[passo]
    if (id === 'integracoes') return { label: 'Ir para Integrações →', href: '/configuracoes?tab=integracoes' }
    if (id === 'financeiro')  return { label: 'Configurar Custos →',  href: '/configuracoes?tab=financeiro'  }
    if (id === 'cliente')     return { label: 'Cadastrar Cliente →',  href: '/clientes/novo'                 }
    return null
  }

  const passoAtual = PASSOS[passo]
  const Icon       = passoAtual.icone
  const cta        = getCta()
  const progresso  = ((passo + 1) / PASSOS.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-surface-card border border-surface-border rounded-2xl card-shadow shadow-2xl w-full max-w-[28rem] animate-fade-scale">
        {/* Header */}
        <div className="flex items-center justify-between px-[1.5rem] py-[1.125rem] border-b border-surface-border/30">
          <div className="flex items-center gap-[0.375rem]">
            {PASSOS.map((_, i) => (
              <div
                key={i}
                className={`h-[0.25rem] rounded-full transition-all duration-300 ${
                  i <= passo ? 'bg-ads-500' : 'bg-surface-hover'
                } ${i === passo ? 'w-[2rem]' : 'w-[0.75rem]'}`}
              />
            ))}
          </div>
          <button
            onClick={pular}
            className="w-[1.75rem] h-[1.75rem] rounded-lg hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
          >
            <X className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="p-[1.5rem] flex flex-col items-center text-center gap-[1rem]">
          <div className={`w-[3.5rem] h-[3.5rem] rounded-2xl ${passoAtual.corBg} flex items-center justify-center`}>
            <Icon className={`w-[1.5rem] h-[1.5rem] ${passoAtual.cor}`} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-ink-primary text-[1.0625rem] font-bold mb-[0.375rem]">{passoAtual.titulo}</h2>
            <p className="text-ink-secondary text-[0.875rem] leading-relaxed">{passoAtual.desc}</p>
          </div>

          {/* Checklist de features do passo */}
          {passo === 0 && (
            <div className="w-full bg-surface-hover rounded-xl p-[1rem] text-left flex flex-col gap-[0.5rem]">
              {['Dashboard com IA', 'Gestão de clientes', 'Financeiro automático', 'Analytics em tempo real'].map((item) => (
                <div key={item} className="flex items-center gap-[0.5rem]">
                  <CheckCircle2 className="w-[0.875rem] h-[0.875rem] text-status-green shrink-0" strokeWidth={2} />
                  <span className="text-ink-secondary text-[0.8125rem]">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-[0.75rem] px-[1.5rem] pb-[1.25rem]">
          {passo > 0 && (
            <button
              onClick={() => setPasso((p) => p - 1)}
              className="h-[2.5rem] px-[1rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-secondary hover:text-ink-primary text-[0.875rem] font-medium transition-colors"
            >
              Voltar
            </button>
          )}
          {cta ? (
            <a
              href={cta.href}
              onClick={concluir}
              className="flex-1 inline-flex items-center justify-center h-[2.5rem] px-[1.25rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-secondary hover:text-ink-primary text-[0.875rem] font-medium transition-colors"
            >
              {cta.label}
            </a>
          ) : null}
          <button
            onClick={avancar}
            className="flex-1 inline-flex items-center justify-center gap-[0.375rem] h-[2.5rem] px-[1.25rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white text-[0.875rem] font-medium transition-colors"
          >
            {passo === PASSOS.length - 1 ? 'Começar a usar' : 'Próximo'}
            {passo < PASSOS.length - 1 && <ChevronRight className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export function useOnboardingPendente(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return !localStorage.getItem(STORAGE_KEY)
  } catch {
    return false
  }
}
