'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bot, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react'
import { useAssistantStore } from '@/lib/store/assistant-store'
import { useRightSidebarStore } from '@/lib/store/right-sidebar-store'
import { ChatThread } from '@/components/ia/ChatThread'
import { Composer } from '@/components/ia/Composer'

// Widget do dashboard plugado no mesmo motor/conversa do painel global (Ctrl+I):
// a sessão ativa segue o usuário entre o bento grid e o painel flutuante.
export function GeminiChat() {
  const [aberto, setAberto] = useState(false)
  const pathname  = usePathname()
  const mensagens = useAssistantStore((s) => s.mensagens)
  const enviando  = useAssistantStore((s) => s.enviando)
  const anexos    = useAssistantStore((s) => s.anexos)

  useEffect(() => {
    if (aberto) void useAssistantStore.getState().carregarConversas()
  }, [aberto])

  return (
    <div className="overflow-hidden h-full flex flex-col">
      {/* Header / toggle */}
      <div className="w-full flex items-center justify-between pr-[0.75rem] hover:bg-surface-hover transition-colors">
        <button
          onClick={() => setAberto((v) => !v)}
          className="flex-1 flex items-center justify-between px-[1.25rem] py-[0.875rem]"
        >
          <div className="flex items-center gap-[0.5rem]">
            <Bot className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={1.75} />
            <p className="text-ink-primary font-semibold text-[0.875rem]">Gator</p>
            {mensagens.length > 0 && (
              <span className="text-[0.625rem] font-semibold bg-ads-500/15 text-ads-500 px-[0.375rem] py-[0.0625rem] rounded-full">
                {mensagens.length}
              </span>
            )}
          </div>
          {aberto
            ? <ChevronUp   className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.75} />
            : <ChevronDown className="w-[0.875rem] h-[0.875rem] text-ink-muted" strokeWidth={1.75} />
          }
        </button>
        <button
          onClick={() => useRightSidebarStore.getState().openDrawer('chat')}
          title="Abrir painel completo (Ctrl+I)"
          className="w-[1.75rem] h-[1.75rem] rounded-lg hover:bg-surface-elevated flex items-center justify-center text-ink-muted hover:text-ads-500 transition-colors shrink-0"
        >
          <Maximize2 className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
        </button>
      </div>

      {aberto && (
        <div className="flex flex-col h-[22rem] border-t border-surface-border/30">
          <ChatThread
            mensagens={mensagens}
            enviando={enviando}
            onSugestao={(texto) => void useAssistantStore.getState().enviar(texto, pathname ?? undefined)}
            vazio={
              <p className="text-ink-muted text-[0.8125rem] italic leading-relaxed">
                Pergunte qualquer coisa sobre a agência.<br />
                <span className="text-[0.75rem] not-italic">Vejo e opero tudo: clientes, tarefas, financeiro, APIs.</span>
              </p>
            }
          />
          <Composer
            enviando={enviando}
            anexos={anexos}
            onEnviar={(texto) => void useAssistantStore.getState().enviar(texto, pathname ?? undefined)}
            onAddArquivos={(files) => void useAssistantStore.getState().adicionarArquivos(files)}
            onRemoverAnexo={useAssistantStore.getState().removerAnexo}
          />
        </div>
      )}
    </div>
  )
}
