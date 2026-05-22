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
    setErro(''); setLoading(true);
    try {
      await loginComEmail(email.trim(), senha);
      router.push('/dashboard');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen dark:bg-surface-bg bg-gray-50 flex items-center justify-center px-[1rem]">
      <div className="w-full max-w-[22rem]">
        <div className="text-center mb-[2.5rem]">
          <div className="w-[3rem] h-[3rem] rounded-[0.625rem] bg-brand flex items-center justify-center mx-auto mb-[1.25rem]">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="dark:text-ink-primary text-gray-900 text-[1.5rem] font-bold">
            Adsgator Hub
          </h1>
          <p className="dark:text-ink-muted text-gray-400 text-sm mt-[0.25rem]">
            Sistema nervoso central da agência
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-[1rem]">
          {erro && (
            <div className="dark:bg-status-red/10 bg-red-50 border dark:border-status-red/20 border-red-200 rounded px-[0.875rem] py-[0.625rem]">
              <p className="text-sm dark:text-status-red text-red-700">{erro}</p>
            </div>
          )}

          {([
            { label: 'E-mail', type: 'email',    value: email, set: setEmail, ph: 'admin@adsgator.com' },
            { label: 'Senha',  type: 'password', value: senha, set: setSenha, ph: '••••••••'           },
          ] as const).map(({ label, type, value, set, ph }) => (
            <div key={label}>
              <label className="block dark:text-ink-secondary text-gray-700 text-sm font-medium mb-[0.375rem]">
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                required
                placeholder={ph}
                className="
                  w-full h-[2.5rem] px-[0.75rem] rounded
                  dark:bg-surface-input dark:border dark:border-surface-border dark:text-ink-primary dark:placeholder-ink-muted
                  bg-white border border-gray-200 text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand
                  text-sm transition-colors
                "
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="
              h-[2.5rem] rounded font-semibold text-sm
              dark:bg-brand dark:hover:bg-brand-dark dark:text-white
              bg-green-600 hover:bg-green-700 text-white
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-[0.5rem]
            "
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
