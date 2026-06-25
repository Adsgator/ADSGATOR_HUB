'use client'

import { useEffect, useState, useMemo } from 'react'
import { X, MessageCircle, Send, Copy, CheckCheck, Save, Loader2 } from 'lucide-react'
import type { Cliente } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { resolverVariaveis, gerarLinkWhatsApp, CATEGORIA_LABEL, CATEGORIA_ORDEM } from '@/lib/whatsapp'
import { toast } from 'sonner'

interface Props {
  cliente: Cliente
  onClose: () => void
}

interface Snippet {
  id: string
  titulo: string
  mensagem: string
  categoria: string
}

export function WhatsAppTemplateModal({ cliente, onClose }: Props) {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading]   = useState(true)
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [texto, setTexto]       = useState('')
  const [copiado, setCopiado]   = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    fetch('/api/v1/whatsapp-snippets')
      .then((r) => r.json())
      .then((data) => {
        const lista: Snippet[] = data.snippets ?? []
        setSnippets(lista)
        if (lista[0]) {
          setSelecionado(lista[0].id)
          setTexto(resolverVariaveis(lista[0].mensagem, cliente))
        }
      })
      .catch(() => toast.error('Erro ao carregar mensagens'))
      .finally(() => setLoading(false))
  }, [cliente])

  function selecionar(s: Snippet) {
    setSelecionado(s.id)
    setTexto(resolverVariaveis(s.mensagem, cliente))
  }

  // Detecta se o texto foi alterado em relação ao snippet selecionado (resolvido).
  const editadoNaHora = useMemo(() => {
    const s = snippets.find((x) => x.id === selecionado)
    return !s || resolverVariaveis(s.mensagem, cliente) !== texto
  }, [snippets, selecionado, texto, cliente])

  const grupos = useMemo(() => {
    const porCat = new Map<string, Snippet[]>()
    for (const s of snippets) {
      const cat = CATEGORIA_LABEL[s.categoria] ? s.categoria : 'outros'
      if (!porCat.has(cat)) porCat.set(cat, [])
      porCat.get(cat)!.push(s)
    }
    return CATEGORIA_ORDEM.filter((c) => porCat.has(c)).map((c) => ({ label: CATEGORIA_LABEL[c], items: porCat.get(c)! }))
  }, [snippets])

  function enviarWhatsApp() {
    const numero = (cliente.whatsapp ?? '').replace(/\D/g, '')
    if (!numero) return
    window.open(gerarLinkWhatsApp(texto, numero), '_blank')
  }

  async function copiarTexto() {
    await navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  // Salva o texto atual como nova mensagem na biblioteca (captura na hora do atendimento).
  async function salvarNaBiblioteca() {
    const titulo = window.prompt('Título da nova mensagem na biblioteca:')
    if (!titulo?.trim()) return
    setSalvando(true)
    try {
      const res = await fetch('/api/v1/whatsapp-snippets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, mensagem: texto }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Mensagem salva na biblioteca')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  const temNumero = !!(cliente.whatsapp ?? '').replace(/\D/g, '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

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
          {/* Seletor de mensagem — agrupado por categoria */}
          {loading ? (
            <div className="flex items-center justify-center py-[1.5rem]">
              <Loader2 className="w-[1.25rem] h-[1.25rem] text-status-green animate-spin" strokeWidth={2} />
            </div>
          ) : (
            <div className="flex flex-col gap-[0.75rem]">
              {grupos.map((g) => (
                <div key={g.label}>
                  <p className="text-ink-muted text-[0.6875rem] uppercase tracking-wide font-semibold mb-[0.375rem]">{g.label}</p>
                  <div className="flex flex-wrap gap-[0.375rem]">
                    {g.items.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => selecionar(s)}
                        className={`h-[2rem] px-[0.75rem] rounded text-[0.8125rem] font-medium transition-colors ${
                          selecionado === s.id
                            ? 'bg-ads-500 text-white'
                            : 'bg-surface-hover text-ink-secondary hover:text-ink-primary border border-surface-border'
                        }`}
                      >
                        {s.titulo}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Preview editável */}
          <div>
            <p className="text-ink-muted text-[0.75rem] uppercase tracking-wide font-semibold mb-[0.5rem]">Mensagem</p>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={8}
              className="w-full px-[0.875rem] py-[0.75rem] rounded-lg bg-surface-hover border border-surface-border text-ink-primary text-[0.875rem] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
            />
            <div className="flex items-center justify-between mt-[0.25rem]">
              {editadoNaHora && texto.trim() ? (
                <button
                  onClick={salvarNaBiblioteca}
                  disabled={salvando}
                  className="flex items-center gap-[0.25rem] text-ink-muted text-[0.6875rem] hover:text-ads-500 transition-colors disabled:opacity-50"
                >
                  <Save className="w-[0.6875rem] h-[0.6875rem]" strokeWidth={2} />
                  Salvar na biblioteca
                </button>
              ) : <span />}
              <p className="text-ink-muted text-[0.6875rem]">{texto.length} caracteres</p>
            </div>
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
