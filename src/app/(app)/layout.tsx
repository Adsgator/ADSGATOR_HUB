'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase-client'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    // Checa sessão atual primeiro
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AppLayout] Initial session:', session ? '✓' : '✗', session?.user?.email)
      if (session) {
        setIsAuthenticated(true)
        setIsLoading(false)
      } else {
        console.log('[AppLayout] No session found, will redirect in 3s...')
        setTimeout(() => {
          router.push('/login')
          setIsLoading(false)
        }, 3000)
      }
    })

    // Escuta mudanças de auth state (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AppLayout] Auth state changed:', event, session ? '✓' : '✗')
      if (session) {
        setIsAuthenticated(true)
        setIsLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-[1rem]">
          <div className="w-[2rem] h-[2rem] border-2 border-ads-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-ink-secondary text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? children : null
}
