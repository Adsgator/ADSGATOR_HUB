import { getSupabaseBrowserClient } from './supabase-client';

function getSupabaseClient() {
  return getSupabaseBrowserClient();
}

export async function loginComEmail(email: string, senha: string) {
  try {
    console.log('[Auth] Attempting login for:', email, 'senha length:', senha.length);
    const supabase = getSupabaseClient();
    console.log('[Auth] Client initialized, calling signInWithPassword...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });

    console.log('[Auth] Login response:', { error: error?.message, data: data ? '✓' : '✗' });

    if (error) {
      console.error('[Auth] Login error details:', error);
      throw new Error(error.message);
    }

    // Aguarda mais tempo para garantir que a sessão foi completamente salva
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verifica se a sessão foi realmente salva
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('[Auth] Session verification:', {
      hasSesion: !!session,
      sessionError: sessionError?.message,
      userId: session?.user?.id
    });

    if (!session) {
      throw new Error('Session not persisted after login');
    }

    return data;
  } catch (err) {
    console.error('[Auth] Login exception:', err);
    throw err;
  }
}

export async function logout() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function obterSessao() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

export async function obterUsuario() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}
