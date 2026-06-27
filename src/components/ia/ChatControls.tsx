'use client'

import { useState, useCallback } from 'react'
import { Zap, Brain, Sparkles, ChevronDown, Check, Coins } from 'lucide-react'
import { useClickOutside } from '@/lib/hooks/useClickOutside'

// ─── CONTROLES DO CHAT DA GATOR ───────────────────────────────────────────────
// Uma faixa enxuta abaixo do header: Cérebro (modelo + raciocínio, em popover
// guiado) · Contexto de cliente · Custo (gasto vivo, detalhe em popover). A
// conversa é a estrela; controles secundários ficam discretos e sob demanda.

interface ClienteOpcao { id: string; nome: string }

const MODELOS = [
  { id: 'auto',             nome: 'Auto',  icone: Sparkles, custo: 'esperto', hint: 'Flash no dia a dia; sobe pro Pro sozinho quando precisa (análise, ou se ele travar). Melhor custo×confiança. Recomendado.' },
  { id: 'gemini-2.5-flash', nome: 'Flash', icone: Zap,      custo: 'barato',  hint: 'Rápido e econômico. Sempre Flash, sem subir pro Pro.' },
  { id: 'gemini-2.5-pro',   nome: 'Pro',   icone: Brain,    custo: '~4x',     hint: 'Mais inteligente, confabula menos. Sempre Pro — pra análise e decisão fina.' },
] as const

const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: v < 0.1 ? 4 : 2 }).format(v)

interface ChatControlsProps {
  modelo:    string
  thinking:  boolean
  onModelo:  (modelo: string) => void
  onThinking: (thinking: boolean) => void
  clienteCtx: string
  clientes:   ClienteOpcao[]
  onCliente:  (id: string) => void
  custoConversa: number
  gasto:      { hoje: number; mes: number } | null
  ctxTokens:  number
}

export function ChatControls(p: ChatControlsProps) {
  const [cerebroAberto, setCerebroAberto] = useState(false)
  const [custoAberto,   setCustoAberto]   = useState(false)

  const refCerebro = useClickOutside<HTMLDivElement>(cerebroAberto, useCallback(() => setCerebroAberto(false), []))
  const refCusto   = useClickOutside<HTMLDivElement>(custoAberto,   useCallback(() => setCustoAberto(false), []))

  const modeloAtual = MODELOS.find((m) => m.id === p.modelo) ?? MODELOS[0]
  const IconeModelo = modeloAtual.icone

  return (
    <div className="px-[0.875rem] py-[0.5rem] border-b border-surface-border/30 shrink-0 flex items-center gap-[0.5rem]">
      {/* ── Cérebro ── */}
      <div className="relative shrink-0" ref={refCerebro}>
        <button
          onClick={() => { setCerebroAberto((v) => !v); setCustoAberto(false) }}
          title="Cérebro da Gator — modelo e raciocínio"
          className={`flex items-center gap-[0.25rem] h-[1.75rem] px-[0.5rem] rounded-lg border text-[0.6875rem] font-semibold transition-colors ${
            cerebroAberto ? 'border-ads-500 bg-ads-500/5 text-ads-600' : 'border-surface-border/40 bg-surface-hover text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <IconeModelo className="w-[0.75rem] h-[0.75rem] text-ads-500" strokeWidth={2} />
          {modeloAtual.nome}
          {p.thinking && <span className="text-ink-muted font-normal">· raciocínio</span>}
          <ChevronDown className="w-[0.625rem] h-[0.625rem]" strokeWidth={2.5} />
        </button>

        {cerebroAberto && (
          <div className="absolute top-[2.125rem] left-0 z-30 w-[16rem] bg-surface-card border border-surface-border rounded-xl card-shadow p-[0.5rem] animate-fade-scale">
            <p className="text-ink-muted text-[0.625rem] uppercase tracking-wide font-semibold px-[0.375rem] pt-[0.25rem] pb-[0.375rem]">Cérebro da Gator</p>
            {MODELOS.map((m) => {
              const Icone = m.icone
              const ativo = p.modelo === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => { p.onModelo(m.id); setCerebroAberto(false) }}
                  className={`w-full text-left rounded-lg p-[0.5rem] flex items-start gap-[0.5rem] transition-colors ${ativo ? 'bg-ads-500/10' : 'hover:bg-surface-hover'}`}
                >
                  <Icone className={`w-[0.875rem] h-[0.875rem] mt-[0.125rem] shrink-0 ${ativo ? 'text-ads-500' : 'text-ink-muted'}`} strokeWidth={2} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-[0.375rem]">
                      <span className="text-ink-primary text-[0.8125rem] font-semibold">{m.nome}</span>
                      <span className={`text-[0.5625rem] px-[0.3125rem] py-[0.0625rem] rounded-full font-medium ${ativo ? 'bg-ads-500/15 text-ads-600' : 'bg-surface-hover text-ink-muted'}`}>{m.custo}</span>
                      {ativo && <Check className="w-[0.75rem] h-[0.75rem] text-ads-500 ml-auto" strokeWidth={2.5} />}
                    </div>
                    <p className="text-ink-muted text-[0.6875rem] leading-snug mt-[0.0625rem]">{m.hint}</p>
                  </div>
                </button>
              )
            })}
            <label className="flex items-center justify-between gap-[0.5rem] mt-[0.25rem] pt-[0.5rem] px-[0.375rem] border-t border-surface-border/40 cursor-pointer">
              <span className="text-ink-secondary text-[0.6875rem] leading-snug">
                Raciocínio <span className="text-ink-muted">(pensa antes — melhor e um pouco mais caro; Pro sempre pensa)</span>
              </span>
              <button
                type="button"
                onClick={() => p.onThinking(!p.thinking)}
                className={`relative w-[2rem] h-[1.125rem] rounded-full transition-colors shrink-0 ${p.thinking ? 'bg-ads-500' : 'bg-surface-hover border border-surface-border'}`}
              >
                <span className={`absolute top-[0.125rem] left-[0.125rem] w-[0.8125rem] h-[0.8125rem] rounded-full bg-white shadow transition-transform ${p.thinking ? 'translate-x-[0.875rem]' : ''}`} />
              </button>
            </label>
          </div>
        )}
      </div>

      {/* ── Contexto de cliente (muda o comportamento → fica visível) ── */}
      <select
        value={p.clienteCtx}
        onChange={(e) => p.onCliente(e.target.value)}
        className="flex-1 min-w-0 h-[1.75rem] px-[0.5rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-secondary text-[0.6875rem] focus:outline-none focus:ring-1 focus:ring-ads-500/30"
      >
        <option value="">Conversa geral (sem cliente fixo)</option>
        {p.clientes.map((c) => (
          <option key={c.id} value={c.id}>Foco: {c.nome}</option>
        ))}
      </select>

      {/* ── Custo (sob demanda) ── */}
      {(p.custoConversa > 0 || p.gasto) && (
        <div className="relative shrink-0" ref={refCusto}>
          <button
            onClick={() => { setCustoAberto((v) => !v); setCerebroAberto(false) }}
            title="Custo estimado da IA"
            className={`flex items-center gap-[0.25rem] h-[1.75rem] px-[0.5rem] rounded-lg border text-[0.6875rem] font-mono transition-colors ${
              custoAberto ? 'border-ads-500 bg-ads-500/5 text-ads-600' : 'border-surface-border/40 bg-surface-hover text-ink-muted hover:text-ink-secondary'
            }`}
          >
            <Coins className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            {fmtBRL(p.custoConversa)}
          </button>

          {custoAberto && (
            <div className="absolute top-[2.125rem] right-0 z-30 w-[14rem] bg-surface-card border border-surface-border rounded-xl card-shadow p-[0.75rem] animate-fade-scale">
              <p className="text-ink-muted text-[0.625rem] uppercase tracking-wide font-semibold mb-[0.5rem]">Custo estimado da IA</p>
              <div className="flex flex-col gap-[0.375rem] text-[0.75rem]">
                <Linha rotulo="Esta conversa" valor={fmtBRL(p.custoConversa)} forte />
                {p.gasto && <Linha rotulo="Hoje" valor={fmtBRL(p.gasto.hoje)} />}
                {p.gasto && <Linha rotulo="Este mês" valor={fmtBRL(p.gasto.mes)} />}
                {p.ctxTokens > 0 && (
                  <div className="flex items-center justify-between pt-[0.375rem] mt-[0.125rem] border-t border-surface-border/40">
                    <span className="text-ink-secondary">Peso da conversa</span>
                    <span className={`font-mono ${p.ctxTokens >= 32000 ? 'text-status-orange' : 'text-ink-muted'}`}>
                      {p.ctxTokens >= 1000 ? `~${(p.ctxTokens / 1000).toFixed(1)}k` : p.ctxTokens} tokens
                    </span>
                  </div>
                )}
              </div>
              <p className="text-ink-muted text-[0.625rem] leading-snug mt-[0.5rem]">
                Estimado — pode divergir da fatura real. Conversa muito longa pesa mais; vale começar uma nova.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Linha({ rotulo, valor, forte }: { rotulo: string; valor: string; forte?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-secondary">{rotulo}</span>
      <span className={`font-mono ${forte ? 'text-ink-primary font-semibold' : 'text-ink-secondary'}`}>{valor}</span>
    </div>
  )
}
