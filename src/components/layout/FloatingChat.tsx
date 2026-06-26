'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Bot, Check, Download, History, Maximize2, Minimize2, Minus,
  Pencil, Plus, Trash2, X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRightSidebarStore } from '@/lib/store/right-sidebar-store'
import { useAssistantStore } from '@/lib/store/assistant-store'
import { useConfirmDialogStore } from '@/lib/hooks/useConfirmDialog'
import { ChatThread } from '@/components/ia/ChatThread'
import { Composer } from '@/components/ia/Composer'
import { ChatControls } from '@/components/ia/ChatControls'

interface ClienteOpcao {
  id:   string
  nome: string
}

// ── Lista de sessões (sidebar no modo expandido / overlay no compacto) ───────
function ListaConversas({ onSelecionar }: { onSelecionar?: () => void }) {
  const conversas       = useAssistantStore((s) => s.conversas)
  const conversaId      = useAssistantStore((s) => s.conversaId)
  const abrirConversa   = useAssistantStore((s) => s.abrirConversa)
  const renomear        = useAssistantStore((s) => s.renomearConversa)
  const excluir         = useAssistantStore((s) => s.excluirConversa)
  const [editando, setEditando] = useState<string | null>(null)
  const [titulo,   setTitulo]   = useState('')

  function confirmarExclusao(id: string) {
    useConfirmDialogStore.getState().openConfirm(
      'Excluir conversa',
      'A conversa e todas as mensagens serão removidas. Continuar?',
      async () => { await excluir(id) },
    )
  }

  if (!conversas.length) {
    return <p className="text-ink-muted text-[0.6875rem] italic text-center py-[1rem] px-[0.5rem]">Nenhuma conversa salva ainda.</p>
  }

  return (
    <div className="flex flex-col gap-[0.125rem] p-[0.375rem] overflow-y-auto">
      {conversas.map((c) => (
        <div
          key={c.id}
          className={`group flex items-center gap-[0.25rem] rounded-lg px-[0.5rem] py-[0.375rem] cursor-pointer transition-colors ${
            c.id === conversaId ? 'bg-ads-500/10 text-ink-primary' : 'hover:bg-surface-hover text-ink-secondary'
          }`}
          onClick={() => {
            if (editando === c.id) return
            void abrirConversa(c.id)
            onSelecionar?.()
          }}
        >
          {editando === c.id ? (
            <>
              <input
                value={titulo}
                autoFocus
                onChange={(e) => setTitulo(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { void renomear(c.id, titulo.trim() || c.titulo); setEditando(null) }
                  if (e.key === 'Escape') setEditando(null)
                }}
                className="flex-1 min-w-0 h-[1.5rem] px-[0.375rem] rounded bg-surface-card border border-ads-500/50 text-[0.75rem] text-ink-primary focus:outline-none"
              />
              <button
                onClick={(e) => { e.stopPropagation(); void renomear(c.id, titulo.trim() || c.titulo); setEditando(null) }}
                className="w-[1.25rem] h-[1.25rem] rounded flex items-center justify-center text-status-green hover:bg-surface-hover shrink-0"
              >
                <Check className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
              </button>
            </>
          ) : (
            <>
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="truncate text-[0.75rem] leading-tight">{c.titulo}</span>
                {!!c.custo_total && c.custo_total > 0 && (
                  <span className="text-[0.625rem] text-ink-muted font-mono leading-tight" title="Custo estimado desta conversa">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 4 }).format(c.custo_total)}
                  </span>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setTitulo(c.titulo); setEditando(c.id) }}
                title="Renomear"
                className="opacity-0 group-hover:opacity-100 w-[1.25rem] h-[1.25rem] rounded flex items-center justify-center text-ink-muted hover:text-ink-primary shrink-0 transition-opacity"
              >
                <Pencil className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); confirmarExclusao(c.id) }}
                title="Excluir"
                className="opacity-0 group-hover:opacity-100 w-[1.25rem] h-[1.25rem] rounded flex items-center justify-center text-ink-muted hover:text-status-red shrink-0 transition-opacity"
              >
                <Trash2 className="w-[0.625rem] h-[0.625rem]" strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Painel do agente — aberto pela RightSidebar ('chat') ou Ctrl+I ───────────
export function FloatingChat() {
  const aberto      = useRightSidebarStore((s) => s.activeDrawer === 'chat')
  const openDrawer  = useRightSidebarStore((s) => s.openDrawer)
  const closeDrawer = useRightSidebarStore((s) => s.closeDrawer)
  const pathname    = usePathname()

  const mensagens   = useAssistantStore((s) => s.mensagens)
  const enviando    = useAssistantStore((s) => s.enviando)
  const anexos      = useAssistantStore((s) => s.anexos)
  const clienteCtx  = useAssistantStore((s) => s.clienteContextoId)
  const ctxTokens   = useAssistantStore((s) => s.contextoTokens)
  const custoConversa = useAssistantStore((s) => s.custoConversa)

  const [minimized,    setMinimized]    = useState(false)
  const [expandido,    setExpandido]    = useState(false)
  const [mostrarLista, setMostrarLista] = useState(false)
  const [clientes,     setClientes]     = useState<ClienteOpcao[]>([])
  const [size,         setSize]         = useState({ w: 384, h: 540 })
  const [gasto,        setGasto]        = useState<{ hoje: number; mes: number } | null>(null)
  const [modelo,       setModelo]       = useState<string>('gemini-2.5-flash')
  const [thinking,     setThinking]     = useState(true)

  // Ctrl+I — abre/fecha o agente em qualquer página
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        openDrawer('chat')
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openDrawer])

  // Ao abrir: carrega sessões e opções de cliente
  useEffect(() => {
    if (!aberto) return
    void useAssistantStore.getState().carregarConversas()
    supabase.from('clientes').select('id, nome').order('nome').limit(100)
      .then(({ data }) => setClientes((data ?? []) as ClienteOpcao[]))
  }, [aberto])

  // Gasto do dia/mês + cérebro atual — recarrega ao abrir e a cada nova resposta
  useEffect(() => {
    if (!aberto) return
    fetch('/api/v1/ia/uso/resumo')
      .then((r) => r.json())
      .then((d: { custo_hoje?: number; custo_mes?: number; cerebro?: { modelo: string; thinking: boolean } }) => {
        if (typeof d.custo_hoje === 'number') setGasto({ hoje: d.custo_hoje, mes: d.custo_mes ?? 0 })
        if (d.cerebro) { setModelo(d.cerebro.modelo); setThinking(d.cerebro.thinking) }
      })
      .catch(() => { /* silencioso — custo é secundário ao chat */ })
  }, [aberto, custoConversa])

  // Troca o cérebro direto do chat (mesma config de Configurações → Uso da IA)
  async function salvarCerebro(novoModelo: string, novoThinking: boolean) {
    setModelo(novoModelo); setThinking(novoThinking)
    await fetch('/api/v1/ia/uso/modelo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelo: novoModelo, thinking: novoThinking }),
    }).catch(() => {})
  }

  // Restaura o tamanho salvo (só no cliente, para não divergir do SSR)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adsgator-chat-size')
      if (saved) {
        const s = JSON.parse(saved) as { w?: number; h?: number }
        if (typeof s.w === 'number' && typeof s.h === 'number') setSize({ w: s.w, h: s.h })
      }
    } catch { /* tamanho padrão */ }
  }, [])

  // Redimensiona arrastando o canto superior esquerdo (janela ancorada embaixo/direita)
  function iniciarResize(e: React.MouseEvent) {
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const { w: startW, h: startH } = size

    function onMove(ev: MouseEvent) {
      const w = Math.min(Math.max(startW + (startX - ev.clientX), 320), window.innerWidth - 120)
      const h = Math.min(Math.max(startH + (startY - ev.clientY), 400), window.innerHeight - 120)
      setSize({ w, h })
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      setSize((s) => {
        localStorage.setItem('adsgator-chat-size', JSON.stringify(s))
        return s
      })
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  function enviar(texto: string) {
    if (minimized) setMinimized(false)
    void useAssistantStore.getState().enviar(texto, pathname ?? undefined)
  }

  if (!aberto) return null

  const store = useAssistantStore.getState()

  const header = (
    <div className="flex items-center justify-between px-[0.875rem] py-[0.625rem] border-b border-surface-border/50 bg-surface-elevated shrink-0">
      <div className="flex items-center gap-[0.5rem] min-w-0">
        <div className="relative w-[1.75rem] h-[1.75rem] rounded-lg bg-ads-500/15 flex items-center justify-center shrink-0">
          <Bot className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={1.75} />
          <span className="absolute -bottom-[0.0625rem] -right-[0.0625rem] w-[0.5rem] h-[0.5rem] rounded-full bg-status-green border-2 border-surface-elevated" />
        </div>
        <div className="min-w-0">
          <p className="text-ink-primary text-[0.8125rem] font-semibold leading-none">Gator</p>
          <p className="text-ink-muted text-[0.6875rem] mt-[0.125rem] truncate">IA do Hub · acesso total</p>
        </div>
      </div>
      <div className="flex items-center gap-[0.125rem] shrink-0">
        {!expandido && (
          <button
            onClick={() => setMostrarLista((v) => !v)}
            title="Conversas"
            className={`w-[1.75rem] h-[1.75rem] rounded-lg flex items-center justify-center transition-colors ${mostrarLista ? 'bg-ads-500/15 text-ads-500' : 'hover:bg-surface-hover text-ink-muted hover:text-ink-primary'}`}
          >
            <History className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
          </button>
        )}
        <button
          onClick={() => { store.novaConversa(); setMostrarLista(false) }}
          title="Nova conversa"
          className="w-[1.75rem] h-[1.75rem] rounded-lg hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
        >
          <Plus className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
        </button>
        {mensagens.length > 0 && (
          <button
            onClick={() => store.exportarMarkdown()}
            title="Exportar conversa (.md)"
            className="w-[1.75rem] h-[1.75rem] rounded-lg hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
          >
            <Download className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
          </button>
        )}
        <button
          onClick={() => { setExpandido((v) => !v); setMinimized(false); setMostrarLista(false) }}
          title={expandido ? 'Janela compacta' : 'Expandir'}
          className="w-[1.75rem] h-[1.75rem] rounded-lg hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
        >
          {expandido
            ? <Minimize2 className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
            : <Maximize2 className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
          }
        </button>
        {!expandido && (
          <button
            onClick={() => setMinimized((v) => !v)}
            title="Minimizar"
            className="w-[1.75rem] h-[1.75rem] rounded-lg hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
          >
            <Minus className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
          </button>
        )}
        <button
          onClick={() => { closeDrawer(); setMinimized(false); setExpandido(false) }}
          title="Fechar (Ctrl+I)"
          className="w-[1.75rem] h-[1.75rem] rounded-lg hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
        >
          <X className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
        </button>
      </div>
    </div>
  )

  const controles = (
    <ChatControls
      modelo={modelo}
      thinking={thinking}
      onModelo={(m) => void salvarCerebro(m, thinking)}
      onThinking={(t) => void salvarCerebro(modelo, t)}
      clienteCtx={clienteCtx}
      clientes={clientes}
      onCliente={(id) => store.setClienteContexto(id)}
      custoConversa={custoConversa}
      gasto={gasto}
      ctxTokens={ctxTokens}
    />
  )

  const corpo = (
    <>
      <ChatThread mensagens={mensagens} enviando={enviando} />
      <Composer
        enviando={enviando}
        anexos={anexos}
        onEnviar={enviar}
        onAddArquivos={(files) => void store.adicionarArquivos(files)}
        onRemoverAnexo={store.removerAnexo}
        autoFocus
      />
    </>
  )

  // ── Modo expandido: overlay central com sidebar de sessões ─────────────────
  if (expandido) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-[2rem] bg-black/40 backdrop-blur-sm animate-fade-scale">
        <div className="w-full max-w-[64rem] h-full max-h-[44rem] rounded-2xl bg-surface-card border border-surface-border shadow-2xl flex flex-col overflow-hidden">
          {header}
          <div className="flex flex-1 min-h-0">
            <aside className="w-[14rem] border-r border-surface-border/40 bg-surface-elevated/50 flex flex-col shrink-0">
              <p className="px-[0.75rem] pt-[0.75rem] pb-[0.375rem] text-[0.625rem] font-semibold uppercase tracking-wider text-ink-muted">Conversas</p>
              <ListaConversas />
            </aside>
            <div className="flex flex-col flex-1 min-w-0">
              {controles}
              {corpo}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Modo compacto: janela flutuante redimensionável ────────────────────────
  return (
    <div
      className="fixed bottom-[3rem] right-[3.5rem] z-40 rounded-2xl bg-surface-card border border-surface-border shadow-2xl flex flex-col overflow-hidden animate-fade-scale"
      style={{ width: size.w, height: minimized ? undefined : size.h }}
    >
      {!minimized && (
        <div
          onMouseDown={iniciarResize}
          title="Redimensionar"
          className="absolute top-0 left-0 w-[1.25rem] h-[1.25rem] cursor-nwse-resize z-10 group"
        >
          <div className="absolute top-[0.3125rem] left-[0.3125rem] w-[0.5rem] h-[0.5rem] border-t-2 border-l-2 border-ink-muted/40 group-hover:border-ads-500 rounded-tl-[0.25rem] transition-colors" />
        </div>
      )}
      {header}
      {!minimized && (
        mostrarLista ? (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ListaConversas onSelecionar={() => setMostrarLista(false)} />
          </div>
        ) : (
          <>
            {controles}
            {corpo}
          </>
        )
      )}
    </div>
  )
}
