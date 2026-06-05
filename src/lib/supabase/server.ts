import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente Supabase para uso em Route Handlers (app/api) e Server Components.
 *
 * Diferente do cliente de browser (`@/lib/supabase`, que roda no cliente e NÃO
 * enxerga os cookies no servidor), este helper usa `@supabase/ssr` e lê a sessão
 * a partir dos cookies da requisição — é o que permite `auth.getUser()` funcionar
 * dentro de Route Handlers e Server Components.
 *
 * Uso:
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]),
            )
          } catch {
            // chamado de um Server Component sem permissão de escrita — ignorável
            // quando o middleware já cuida do refresh da sessão.
          }
        },
      },
    },
  )
}
