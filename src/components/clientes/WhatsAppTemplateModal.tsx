'use client'

import { useState } from 'react'
import { X, MessageCircle, Send, Copy, CheckCheck } from 'lucide-react'
import type { Cliente } from '@/lib/types'

interface Props {
  cliente: Cliente
  onClose: () => void
}

const TEMPLATES: { id: string; label: string; texto: (c: Cliente) => string }[] = [
  {
    id:    '#BOASVINDAS',
    label: 'Boas-vindas',
    texto: (c) =>
      `Olá ${c.nome.split(' ')[0]}! 👋 Bem-vindo(a) à Adsgator!\n\nEstamos muito felizes em ter você como cliente. Nos próximos dias entraremos em contato para iniciar o onboarding e configurar suas campanhas.\n\nQualquer dúvida, estou à disposição!`,
  },
  {
    id:    '#CONVITE',
    label: 'Convite Reunião',
    texto: (c) =>
      `Olá ${c.nome.split(' ')[0]}! Tudo bem?\n\nGostaria de agendar uma reunião rápida (30 min) para alinharmos os próximos passos das suas campanhas. Qual horário seria melhor para você?`,
  },
  {
    id:    '#BRIEFINGGA',
    label: 'Briefing Google Ads',
    texto: (c) =>
      `Olá ${c.nome.split(' ')[0]}! 🎯\n\nPara configurarmos suas campanhas no Google Ads com precisão, precisamos de algumas informações:\n\n1. Qual o principal objetivo? (leads, vendas, visitas à loja)\n2. Qual o ticket médio do produto/serviço?\n3. Há alguma promoção ou sazonalidade que devemos considerar?\n\nResponda quando puder!`,
  },
  {
    id:    '#SALDOGOOGLE',
    label: 'Alerta Saldo Google',
    texto: (c) =>
      `Olá ${c.nome.split(' ')[0]}! ⚠️\n\nIdentificamos que o saldo da sua conta Google Ads está baixo. Para evitar a pausa das campanhas, recomendamos adicionar crédito o quanto antes.\n\nPosso te ajudar com o procedimento de recarga se precisar!`,
  },
  {
    id:    'COBRANCA',
    label: 'Cobrança',
    texto: (c) =>
      `Olá ${c.nome.split(' ')[0]}! Tudo bem?\n\nPassando para avisar que identificamos uma pendência financeira em sua conta. Para manter suas campanhas ativas, pedimos que regularize o pagamento assim que possível.\n\nEm caso de dúvidas, estou à disposição!`,
  },
  {
    id:    'CUSTOMIZADO',
    label: 'Personalizado',
    texto: () => '',
  },
]

export function WhatsAppTemplateModal({ cliente, onClose }: Props) {
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id)
  const [texto,      setTexto]      = useState(TEMPLATES[0].texto(cliente))
  const [copiado,    setCopiado]    = useState(false)

  function selecionarTemplate(id: string) {
    setTemplateId(id)
    const tpl = TEMPLATES.find((t) => t.id === id)
    if (tpl) setTexto(tpl.texto(cliente))
  }

  function enviarWhatsApp() {
    const numero = (cliente.whatsapp ?? '').replace(/\D/g, '')
    if (!numero) return
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank')
  }

  async function copiarTexto() {
    await navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  const temNumero = !!(cliente.whatsapp ?? '').replace(/\D/g, '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface-card border border-surface-border rounded-xl shadow-2xl w-full max-w-[34rem] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-[1.5rem] py-[1rem] border-b border-surface-border">
          <div className="flex items-center gap-[0.625rem]">
            <MessageCircle className="w-[1.125rem] h-[1.125rem] text-status-green" strokeWidth={1.75} />
            <div>
              <p className="text-ink-primary font-semibold text-[0.9375rem]">Enviar WhatsApp</p>
              <p className="text-ink-muted text-[0.75rem]">{cliente.nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-[2rem] h-[2rem] flex items-center justify-center rounded hover:bg-surface-hover text-ink-muted transition-colors">
            <X className="w-[1rem] h-[1rem]" strokeWidth={2} />
          </button>
        </div>

        <div className="p-[1.5rem] flex flex-col gap-[1.25rem]">
          {/* Seletor de template */}
          <div>
            <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.625rem]">Template</p>
            <div className="flex flex-wrap gap-[0.375rem]">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selecionarTemplate(t.id)}
                  className={`h-[2rem] px-[0.75rem] rounded text-[0.8125rem] font-medium transition-colors ${
                    templateId === t.id
                      ? 'bg-ads-500 text-white'
                      : 'bg-surface-hover text-ink-secondary hover:text-ink-primary border border-surface-border'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview editável */}
          <div>
            <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.5rem]">Mensagem</p>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={8}
              className="w-full px-[0.875rem] py-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
            <p className="text-ink-muted text-[0.6875rem] text-right mt-[0.25rem]">{texto.length} caracteres</p>
          </div>

          {/* Número */}
          {!temNumero && (
            <div className="bg-status-orange/10 border border-status-orange/30 rounded-lg px-[0.875rem] py-[0.625rem]">
              <p className="text-status-orange text-[0.8125rem]">Este cliente não possui número de WhatsApp cadastrado.</p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-[0.75rem]">
            <button
              onClick={copiarTexto}
              className="flex items-center gap-[0.375rem] h-[2.5rem] px-[1rem] rounded-lg bg-surface-hover border border-surface-border text-ink-secondary text-[0.875rem] font-medium hover:text-ink-primary transition-colors"
            >
              {copiado
                ? <><CheckCheck className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} /> Copiado</>
                : <><Copy className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} /> Copiar</>
              }
            </button>
            <button
              onClick={enviarWhatsApp}
              disabled={!temNumero || !texto.trim()}
              className="flex-1 flex items-center justify-center gap-[0.5rem] h-[2.5rem] rounded-lg bg-status-green text-white text-[0.875rem] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Send className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
              Abrir no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
