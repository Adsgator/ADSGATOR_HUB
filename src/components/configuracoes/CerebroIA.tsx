'use client'

import { useEffect, useState } from 'react'
import { Zap, Brain, Sparkles, Check } from 'lucide-react'

// ─── CÉREBRO DA GATOR ─────────────────────────────────────────────────────────
// O Lucas escolhe o modelo (Flash rápido/barato vs Pro mais inteligente) e
// liga/desliga o "pensar" (raciocínio antes de responder). Salvo em
// configuracoes_ia, lido pelo agente a cada chamada. Custo aparece no painel ao lado.

const MODELOS = [
  {
    id: 'gemini-2.5-flash',
    nome: 'Flash',
    icone: Zap,
    desc: 'Rápido e econômico. Ótimo para o dia a dia — perguntas, ações, consultas.',
    custo: 'Custo baixo',
  },
  {
    id: 'gemini-2.5-pro',
    nome: 'Pro',
    icone: Brain,
    desc: 'Mais inteligente: raciocina melhor, erra e confabula menos. Para análises e decisões finas.',
    custo: '~4x o Flash',
  },
] as const

export function CerebroIA() {
  const [modelo, setModelo] = useState<string>('gemini-2.5-flash')
  const [thinking, setThinking] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    fetch('/api/v1/ia/uso/resumo')
      .then((r) => r.json())
      .then((d: { cerebro?: { modelo: string; thinking: boolean } }) => {
        if (d.cerebro) { setModelo(d.cerebro.modelo); setThinking(d.cerebro.thinking) }
      })
      .catch(() => { /* mantém defaults */ })
      .finally(() => setCarregando(false))
  }, [])

  async function salvar(novoModelo: string, novoThinking: boolean) {
    setModelo(novoModelo); setThinking(novoThinking)
    setSalvando(true); setSalvo(false)
    await fetch('/api/v1/ia/uso/modelo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelo: novoModelo, thinking: novoThinking }),
    }).catch(() => {})
    setSalvando(false)
    setSalvo(true); setTimeout(() => setSalvo(false), 2500)
  }

  if (carregando) return null

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow">
      <div className="flex items-center justify-between mb-[1rem]">
        <div className="flex items-center gap-[0.5rem]">
          <Sparkles className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={2} />
          <h3 className="text-ink-primary font-semibold text-[0.9375rem]">Cérebro da Gator</h3>
        </div>
        {salvando ? (
          <span className="text-ink-muted text-[0.75rem]">Salvando…</span>
        ) : salvo ? (
          <span className="text-status-green text-[0.75rem] flex items-center gap-[0.25rem]">
            <Check className="w-[0.75rem] h-[0.75rem]" strokeWidth={2.5} /> Salvo
          </span>
        ) : null}
      </div>

      {/* Seletor de modelo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[0.75rem]">
        {MODELOS.map((m) => {
          const Icone = m.icone
          const ativo = modelo === m.id
          return (
            <button
              key={m.id}
              onClick={() => salvar(m.id, thinking)}
              className={`text-left rounded-lg border p-[1rem] transition-colors ${
                ativo
                  ? 'border-ads-500 bg-ads-500/5'
                  : 'border-surface-border bg-surface-hover/40 hover:border-surface-border hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center justify-between mb-[0.5rem]">
                <div className="flex items-center gap-[0.5rem]">
                  <Icone className={`w-[1rem] h-[1rem] ${ativo ? 'text-ads-500' : 'text-ink-muted'}`} strokeWidth={2} />
                  <span className="text-ink-primary font-semibold text-[0.875rem]">{m.nome}</span>
                </div>
                <span className={`text-[0.6875rem] font-medium px-[0.5rem] py-[0.125rem] rounded-full ${ativo ? 'bg-ads-500/15 text-ads-600' : 'bg-surface-hover text-ink-muted'}`}>
                  {m.custo}
                </span>
              </div>
              <p className="text-ink-secondary text-[0.8125rem] leading-relaxed">{m.desc}</p>
            </button>
          )
        })}
      </div>

      {/* Toggle raciocínio */}
      <label className="flex items-center justify-between cursor-pointer mt-[1rem] pt-[1rem] border-t border-surface-border/40">
        <div>
          <p className="text-ink-primary text-[0.875rem] font-medium">Raciocínio (pensar antes de responder)</p>
          <p className="text-ink-muted text-[0.75rem] mt-[0.125rem]">
            Liga o &quot;thinking&quot; do modelo: respostas melhores em coisas complexas, um pouco mais lentas e caras. O Pro sempre raciocina.
          </p>
        </div>
        <button
          type="button"
          onClick={() => salvar(modelo, !thinking)}
          className={`relative w-[2.75rem] h-[1.5rem] rounded-full transition-colors shrink-0 ml-[1rem] ${thinking ? 'bg-ads-500' : 'bg-surface-hover border border-surface-border'}`}
        >
          <span className={`absolute top-[0.1875rem] left-[0.1875rem] w-[1.125rem] h-[1.125rem] rounded-full bg-white shadow transition-transform ${thinking ? 'translate-x-[1.25rem]' : ''}`} />
        </button>
      </label>
    </div>
  )
}
