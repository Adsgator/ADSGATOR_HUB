'use client';

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { loginComEmail } from '@/lib/auth';

export default function LoginPage() {
  const [email,   setEmail]   = useState('');
  const [senha,   setSenha]   = useState('');
  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await loginComEmail(email.trim(), senha);
      window.location.href = '/dashboard';
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-surface-base flex items-center justify-center px-[1rem] overflow-hidden">
      {/* Ambiente — glows de marca */}
      <div className="pointer-events-none absolute -top-[10rem] -left-[8rem] w-[28rem] h-[28rem] rounded-full bg-ads-500/10 blur-[8rem]" />
      <div className="pointer-events-none absolute -bottom-[12rem] -right-[8rem] w-[30rem] h-[30rem] rounded-full bg-ads-500/[0.07] blur-[8rem]" />

      <div className="relative w-full max-w-[24rem] animate-fade-scale">
        {/* Marca */}
        <div className="text-center mb-[2rem]">
          <div className="w-[3.25rem] h-[3.25rem] rounded-[0.875rem] bg-ads-500 flex items-center justify-center mx-auto mb-[1.25rem] glow-amber">
            <span className="text-white font-bold text-[1.375rem] leading-none">A</span>
          </div>
          <h1 className="text-ink-primary text-[1.625rem] font-bold tracking-tight">Adsgator Hub</h1>
          <p className="text-ink-muted text-[0.875rem] mt-[0.375rem]">Sistema operacional da agência</p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-surface-border rounded-2xl card-shadow p-[1.75rem]">
          <form onSubmit={handleLogin} className="flex flex-col gap-[1.125rem]">
            {erro && (
              <div className="bg-status-red/10 border border-status-red/20 rounded-[0.5rem] px-[0.875rem] py-[0.625rem] animate-fade-in">
                <p className="text-[0.8125rem] text-status-red">{erro}</p>
              </div>
            )}

            {([
              { key: 'email', label: 'E-mail', type: 'email',    value: email, set: setEmail, ph: 'voce@adsgator.com.br', Icon: Mail },
              { key: 'senha', label: 'Senha',  type: 'password', value: senha, set: setSenha, ph: '••••••••',             Icon: Lock },
            ] as const).map(({ key, label, type, value, set, ph, Icon }) => (
              <div key={key}>
                <label className="block text-ink-secondary text-[0.8125rem] font-medium mb-[0.5rem]">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-[0.875rem] top-1/2 -translate-y-1/2 w-[1rem] h-[1rem] text-ink-muted" strokeWidth={1.75} />
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    required
                    placeholder={ph}
                    autoComplete={type === 'password' ? 'current-password' : 'email'}
                    className="w-full h-[2.75rem] pl-[2.5rem] pr-[0.875rem] rounded-[0.625rem] bg-surface-hover border border-surface-border text-ink-primary placeholder:text-ink-muted text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-ads-500/30 focus:border-ads-500 transition-colors"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="mt-[0.25rem] h-[2.75rem] rounded-[0.625rem] font-semibold text-[0.875rem] bg-ads-500 hover:bg-ads-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-[0.5rem] focus-ring"
            >
              {loading
                ? <><div className="w-[1rem] h-[1rem] border-2 border-white border-t-transparent rounded-full animate-spin" /> Entrando…</>
                : <>Entrar <ArrowRight className="w-[1rem] h-[1rem]" strokeWidth={2} /></>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-ink-muted text-[0.75rem] mt-[1.5rem]">Acesso restrito · Adsgator</p>
      </div>
    </div>
  );
}
