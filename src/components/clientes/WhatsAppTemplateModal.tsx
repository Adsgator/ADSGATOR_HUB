'use client'

import { useState } from 'react'
import { X, MessageCircle, Send, Copy, CheckCheck } from 'lucide-react'
import type { Cliente } from '@/lib/types'
import { Button } from '@/components/ui/Button'

interface Props {
  cliente: Cliente
  onClose: () => void
}

type TemplateCategoria = 'Onboarding' | 'Google Ads' | 'Financeiro' | 'Entrega' | 'Outro'

const TEMPLATES: { id: string; label: string; categoria: TemplateCategoria; texto: (c: Cliente) => string }[] = [
  // ── Onboarding ───────────────────────────────────────────────
  {
    id: 'BOASVINDAS', label: 'Boas-vindas', categoria: 'Onboarding',
    texto: (c) =>
      `Bom dia, ${c.nome.split(' ')[0]}! Tudo bem?\n\nDeu tudo certo com a assinatura do seu plano, seja bem-vindo à Adsgator! 😊\n\nVou explicar como funciona o processo e o que vou precisar de você para darmos início.`,
  },
  {
    id: 'PROCESSO', label: 'Como funciona', categoria: 'Onboarding',
    texto: () =>
      `📌 *Como funciona o processo?*\n\n1️⃣ *Briefing:* um formulário com as perguntas necessárias sobre a sua marca e o seu negócio.\n\n2️⃣ *Envio dos arquivos:* materiais para garantir a identidade visual do seu negócio.\n\n3️⃣ *Criação e entrega:* prazo de até 7 dias úteis. Enviamos para a sua aprovação antes da publicação final.`,
  },
  {
    id: 'MATERIAIS', label: 'O que preciso', categoria: 'Onboarding',
    texto: () =>
      `📌 *O que eu vou precisar de você?*\n\n1️⃣ Preenchimento do formulário de briefing (link abaixo).\n\n2️⃣ Envio de arquivos:\n▪ Logo (PNG, SVG ou AI)\n▪ Paleta de cores da marca\n▪ Fontes / tipografia\n▪ Manual de marca (se tiver)\n▪ Fotos do negócio / produtos\n▪ Depoimentos de clientes\n\nNão se preocupe, envie apenas o que tiver disponível. 😊`,
  },
  {
    id: 'LINKSONBOARD', label: 'Links onboarding', categoria: 'Onboarding',
    texto: () =>
      `➡ *LINK DO FORMULÁRIO:*\nhttps://forms.adsgator.com.br/briefing-pro/\n\n➡ *LINK PARA ENVIO DOS ARQUIVOS:*\n[link da pasta no Drive]\n\nEssa etapa é fundamental para conhecermos melhor o seu negócio. Qualquer dúvida, é só me chamar! 😊`,
  },
  // ── Google Ads ───────────────────────────────────────────────
  {
    id: 'ONGOOGLE', label: 'Acessos Google', categoria: 'Google Ads',
    texto: () =>
      `Vou te passar o que vou precisar referente ao Google Ads — algumas informações e acessos. Vi que você já tem o Google Meu Negócio, vou precisar do acesso dele também para conectar com o Google Ads.\n\n1️⃣ Como criar sua conta no Google Ads e passar sua ID:\nhttps://ajuda.adsgator.com.br/ajuda/como-criar-uma-conta-no-google-ads/\n\n2️⃣ Envie sua ID para eu mandar o convite de acesso.\n\n3️⃣ Como conceder acesso ao seu Google Meu Negócio:\nhttps://ajuda.adsgator.com.br/ajuda/como-conceder-acesso-do-seu-google-meu-negocio/`,
  },
  {
    id: 'CONVITE', label: 'Convite enviado', categoria: 'Google Ads',
    texto: () =>
      `Obrigado! Mandei o convite de acesso para você. Segue um guia de como aceitar o acesso no Google Ads:\n\nhttps://ajuda.adsgator.com.br/ajuda/como-conceder-acesso-do-google-ads-para-a-adsgator/`,
  },
  {
    id: 'BRIEFINGGA', label: 'Briefing Google Ads', categoria: 'Google Ads',
    texto: () =>
      `Perfeito! Estamos quase acabando. Vou te mandar o link do briefing de Google Ads. São só 7 perguntas rápidas que precisamos para criar sua estratégia:\n\n➡ *LINK DO BRIEFING:*\nhttps://forms.adsgator.com.br/briefing-google-ads/\n\nQualquer dúvida, é só me chamar!`,
  },
  {
    id: 'SALDOGOOGLE', label: 'Saldo Google baixo', categoria: 'Google Ads',
    texto: (c) =>
      `Olá ${c.nome.split(' ')[0]}! ⚠️\n\nO saldo da sua conta Google Ads está baixo. Para evitar a pausa das campanhas, recomendo adicionar crédito o quanto antes. Segue o guia:\n\nhttps://ajuda.adsgator.com.br/ajuda/como-adicionar-saldo-no-google-ads/`,
  },
  // ── Financeiro ───────────────────────────────────────────────
  {
    id: 'CADASTRO', label: 'Cadastro e pagamento', categoria: 'Financeiro',
    texto: () =>
      `Ótimo! Vamos lá.\n\nVou te enviar o link para realizar o cadastro e o pagamento da sua assinatura. É bem simples e rápido. Assim que for confirmado, já seguimos para os próximos passos.\n\n➡ *LINK CADASTRO E PAGAMENTO:*\nhttps://cliente.adsgator.com.br/step/finalizar-contratacao/`,
  },
  {
    id: 'COBRANCA', label: 'Cobrança', categoria: 'Financeiro',
    texto: (c) =>
      `Olá ${c.nome.split(' ')[0]}! Tudo bem?\n\nPassando para avisar que identificamos uma pendência financeira em sua conta. Para manter suas campanhas ativas, peço que regularize o pagamento assim que possível.\n\nEm caso de dúvidas, estou à disposição!`,
  },
  // ── Entrega ──────────────────────────────────────────────────
  {
    id: 'SITEPRONTO', label: 'Site pronto', categoria: 'Entrega',
    texto: () =>
      `Segue o link para você acessar:\n🌐 [link do site]\n\nVou deixar também o link da árvore de links para usar nas suas redes sociais:\n🔗 [link da bio]\n\nSe precisar de algum ajuste, é só me avisar por aqui. Espero que goste!`,
  },
  // ── Outro ────────────────────────────────────────────────────
  {
    id: 'CONVITEREUNIAO', label: 'Convite reunião', categoria: 'Outro',
    texto: (c) =>
      `Olá ${c.nome.split(' ')[0]}! Tudo bem?\n\nGostaria de agendar uma reunião rápida (30 min) para alinharmos os próximos passos das suas campanhas. Qual horário seria melhor para você?`,
  },
  {
    id: 'CUSTOMIZADO', label: 'Personalizado', categoria: 'Outro',
    texto: () => '',
  },
]

const CATEGORIAS: TemplateCategoria[] = ['Onboarding', 'Google Ads', 'Financeiro', 'Entrega', 'Outro']

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
      <div className="relative bg-surface-card dark:border dark:border-surface-border rounded-2xl card-shadow shadow-2xl w-full max-w-[34rem] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-[1.5rem] py-[1rem] border-b border-surface-border">
          <div className="flex items-center gap-[0.625rem]">
            <MessageCircle className="w-[1.125rem] h-[1.125rem] text-status-green" strokeWidth={1.75} />
            <div>
              <p className="text-ink-primary font-semibold text-[0.9375rem]">Enviar WhatsApp</p>
              <p className="text-ink-muted text-[0.75rem]">{cliente.nome}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X className="w-[1rem] h-[1rem]" strokeWidth={2} />} className="w-[2rem] px-0" />
        </div>

        <div className="p-[1.5rem] flex flex-col gap-[1.25rem]">
          {/* Seletor de template — agrupado por categoria */}
          <div className="flex flex-col gap-[0.75rem]">
            {CATEGORIAS.map((cat) => {
              const doCat = TEMPLATES.filter((t) => t.categoria === cat)
              if (doCat.length === 0) return null
              return (
                <div key={cat}>
                  <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.375rem]">{cat}</p>
                  <div className="flex flex-wrap gap-[0.375rem]">
                    {doCat.map((t) => (
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
              )
            })}
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
            <Button
              variant="secondary"
              size="lg"
              onClick={copiarTexto}
              icon={copiado
                ? <CheckCheck className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />
                : <Copy className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
              }
            >
              {copiado ? 'Copiado' : 'Copiar'}
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={enviarWhatsApp}
              disabled={!temNumero || !texto.trim()}
              icon={<Send className="w-[0.875rem] h-[0.875rem]" strokeWidth={2} />}
              className="bg-status-green hover:bg-status-green/90"
            >
              Abrir no WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
