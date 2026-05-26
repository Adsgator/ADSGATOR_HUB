'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginComEmail } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email,   setEmail]   = useState('');
  const [senha,   setSenha]   = useState('');
  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      console.log('[Login] Starting login process...');
      const result = await loginComEmail(email.trim(), senha);
      console.log('[Login] Login successful:', result ? '✓' : '✗');

      console.log('[Login] Redirecting to /dashboard...');
      window.location.href = '/dashboard';
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Credenciais inválidas';
      console.error('[Login] Error:', errorMsg);
      setErro(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-[1rem]">
      <div className="w-full max-w-[22rem]">
        <div className="text-center mb-[2.5rem]">
          <div className="w-[3rem] h-[3rem] rounded-[0.625rem] bg-ads-500 flex items-center justify-center mx-auto mb-[1.25rem]">
            <span className="text-white font-bold text-[1.25rem]">A</span>
          </div>
          <h1 className="text-ink-primary text-[1.5rem] font-bold">
            Adsgator Hub
          </h1>
          <p className="text-ink-muted text-[0.875rem] mt-[0.25rem]">
            Sistema nervoso central da agência
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-[1rem]">
          {erro && (
            <div className="bg-status-red/10 border border-status-red/20 rounded-[0.375rem] px-[0.875rem] py-[0.625rem]">
              <p className="text-[0.8125rem] text-status-red">{erro}</p>
            </div>
          )}

          {([
            { label: 'E-mail', type: 'email',    value: email, set: setEmail, ph: 'admin@adsgator.com' },
            { label: 'Senha',  type: 'password', value: senha, set: setSenha, ph: '••••••••'           },
          ] as const).map(({ label, type, value, set, ph }) => (
            <div key={label}>
              <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.375rem]">
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                required
                placeholder={ph}
                className="w-full h-[2.5rem] px-[0.75rem] rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-primary placeholder:text-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="h-[2.5rem] rounded-[0.375rem] font-semibold text-[0.875rem] bg-ads-500 hover:bg-ads-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-[0.5rem]"
          >
            {loading
              ? <><div className="w-[1rem] h-[1rem] border-2 border-white border-t-transparent rounded-full animate-spin" /> Entrando…</>
              : 'Entrar'
            }
          </button>
        </form>
      </div>
    </div>
  );
}
