'use client'

import { useEffect, useState } from 'react'
import { supabase }            from '@/lib/supabase'

export type Papel = 'proprietario' | 'gerenciador' | 'analista' | 'viewer'

export type Acao =
  | 'editar_cliente'
  | 'excluir_cliente'
  | 'ver_financeiro'
  | 'editar_financeiro'
  | 'configurar'
  | 'ver_relatorios'
  | 'criar_tarefa'
  | 'ver_marketing'
  | 'gerenciar_equipe'

const PERMISSOES: Record<Papel, Acao[]> = {
  proprietario: [
    'editar_cliente', 'excluir_cliente',
    'ver_financeiro', 'editar_financeiro',
    'configurar', 'ver_relatorios',
    'criar_tarefa', 'ver_marketing', 'gerenciar_equipe',
  ],
  gerenciador: [
    'editar_cliente',
    'ver_financeiro', 'editar_financeiro',
    'configurar', 'ver_relatorios',
    'criar_tarefa', 'ver_marketing',
  ],
  analista: [
    'editar_cliente',
    'ver_financeiro',
    'ver_relatorios',
    'criar_tarefa',
    'ver_marketing',
  ],
  viewer: [
    'ver_financeiro',
    'ver_relatorios',
  ],
}

export function usePermissoes() {
  const [papel, setPapel] = useState<Papel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase
        .from('equipe_membros')
        .select('papel')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          setPapel((data?.papel as Papel | null) ?? 'proprietario')
          setLoading(false)
        })
    })
  }, [])

  function hasPermission(acao: Acao): boolean {
    if (!papel) return false
    return PERMISSOES[papel].includes(acao)
  }

  return { papel, loading, hasPermission }
}
