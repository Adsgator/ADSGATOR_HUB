'use client'

import { useEffect, useState } from 'react'
import { Brain, Save, RefreshCw, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  clienteId: string
}

export function ClienteMemoria({ clienteId }: Props) {
  const supabase    = createClient()
  const [conteudo,  setConteudo]  = useState('')
  const [original,  setOriginal]  = useState('')
  const [salvando,  setSalvando]  = useState(false)
  const [gerando,   setGerando]   = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [memoriaId, setMemoriaId] = useState<string | null>(null)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      const { data } = await supabase
        .from('memoria_clientes')
        .select('id, conteudo_md')
        .eq('cliente_id', clienteId)
        .maybeSingle()

      if (data) {
        setMemoriaId(data.id as string)
        const texto = (data.conteudo_md as string) ?? ''
        setConteudo(texto)
        setOriginal(texto)
      }
      setCarregando(false)
    }
    carregar()
  }, [clienteId]) // eslint-disable-line react-hooks/exhaustive-deps

  const modificado = conteudo !== original

  async function salvar() {
    setSalvando(true)
    const payload = { cliente_id: clienteId, conteudo_md: conteudo, atualizado_em: new Date().toISOString() }

    const { error } = memoriaId
      ? await supabase.from('memoria_clientes').update(payload).eq('id', memoriaId)
      : await supabase.from('memoria_clientes').insert(payload).select('id').single()
        .then(({ data, error: e }) => {
          if (data) setMemoriaId((data as { id: string }).id)
          return { error: e }
        })

    if (error) {
      toast.error('Erro ao salvar memória.')
    } else {
      setOriginal(conteudo)
      toast.success('Memória salva!')
    }
    setSalvando(false)
  }

  async function gerarComIA() {
    setGerando(true)
    try {
      // Busca dados do cliente para contexto
      const { data: cliente } = await supabase
        .from('clientes')
        .select('nome, nicho, status, mrr, dias_atraso, website')
        .eq('id', clienteId)
        .single()

      const res = await fetch('/api/ia/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            id:         'gen',
            role:       'user',
            content:    `Gere um arquivo de memória .md para o cliente ${(cliente as { nome?: string })?.nome ?? ''} (nicho: ${(cliente as { nicho?: string })?.nicho ?? 'desconhecido'}). Inclua seções: ## Perfil, ## Histórico de campanhas, ## Pontos de atenção, ## Próximos passos. Use dados reais se disponíveis, caso contrário deixe espaço para preenchimento.`,
            created_at: new Date().toISOString(),
          }],
          contexto_cliente_id: clienteId,
        }),
      })
      const json = await res.json() as { content?: string }
      if (json.content) {
        setConteudo(json.content)
        toast.success('Memória gerada pela IA! Revise e salve.')
      }
    } catch {
      toast.error('Erro ao gerar memória com IA.')
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-[1.25rem] card-shadow">
      <div className="flex items-center justify-between mb-[0.875rem]">
        <div className="flex items-center gap-[0.5rem]">
          <div className="w-[1.75rem] h-[1.75rem] rounded-lg bg-ads-500/10 flex items-center justify-center">
            <Brain className="w-[0.875rem] h-[0.875rem] text-ads-500" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-ink-primary text-[0.875rem] font-semibold leading-none">Memória do Cliente</p>
            <p className="text-ink-muted text-[0.6875rem] mt-[0.125rem]">Contexto para análises de IA</p>
          </div>
        </div>
        <div className="flex items-center gap-[0.375rem]">
          <button
            onClick={gerarComIA}
            disabled={gerando || carregando}
            className="inline-flex items-center gap-[0.25rem] h-[1.75rem] px-[0.625rem] rounded-lg bg-ads-500/10 hover:bg-ads-500/20 text-ads-500 text-[0.75rem] font-medium transition-colors disabled:opacity-50"
          >
            {gerando
              ? <RefreshCw className="w-[0.6875rem] h-[0.6875rem] animate-spin" strokeWidth={2} />
              : <Sparkles  className="w-[0.6875rem] h-[0.6875rem]" strokeWidth={2} />
            }
            {gerando ? 'Gerando…' : 'Gerar com IA'}
          </button>
          {modificado && (
            <button
              onClick={salvar}
              disabled={salvando}
              className="inline-flex items-center gap-[0.25rem] h-[1.75rem] px-[0.625rem] rounded-lg bg-ads-500 hover:bg-ads-600 text-white text-[0.75rem] font-medium transition-colors disabled:opacity-50"
            >
              <Save className="w-[0.6875rem] h-[0.6875rem]" strokeWidth={2} />
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          )}
        </div>
      </div>

      {carregando ? (
        <div className="h-[10rem] rounded-lg bg-surface-hover skeleton-shimmer" />
      ) : (
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder={`# Memória — Nome do Cliente\n\n## Perfil\n...\n\n## Histórico de campanhas\n...\n\n## Pontos de atenção\n...\n\n## Próximos passos\n...`}
          rows={14}
          className="w-full px-[0.75rem] py-[0.625rem] rounded-lg bg-surface-hover border border-surface-border/40 text-ink-primary text-[0.8125rem] font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500/50 transition-colors placeholder:text-ink-muted"
        />
      )}

      {modificado && !salvando && (
        <p className="text-ink-muted text-[0.6875rem] mt-[0.375rem]">
          Alterações não salvas — clique em Salvar para persistir.
        </p>
      )}
    </div>
  )
}
