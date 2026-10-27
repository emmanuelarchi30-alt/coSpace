'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n/I18nContext';
import { LogIn, Lock, Mail, AlertCircle, Loader2, KeyRound } from 'lucide-react';

function LoginFormContent(): React.JSX.Element {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

      // Check role to redirect appropriately
      if (data.user?.role === 'ADMIN' && !from) {
        router.push('/admin');
      } else if (from) {
        router.push(from);
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch {
      setError('Error al conectar con el servidor.');
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail: string, userPass: string): void => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="liquid-glass p-8 rounded-3xl border border-white/20 shadow-2xl relative">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-white tracking-tight">
          {t('auth.loginTitle')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {t('form.email')}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full liquid-glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {t('form.password')}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full liquid-glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full liquid-glass-btn py-3 rounded-xl font-bold text-white text-sm shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando credenciales...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>{t('auth.submitLogin')}</span>
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick Fill */}
      <div className="mt-6 pt-5 border-t border-white/10 text-center">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono block mb-2 flex items-center justify-center gap-1.5">
          <KeyRound className="w-3 h-3 text-cyan-400" />
          Credenciales de Prueba del Seed:
        </span>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={() => fillCredentials('admin@cospace.com', 'AdminPassword123!')}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-semibold text-amber-300 transition-colors"
          >
            Admin (admin@cospace.com)
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('demo@cospace.com', 'UserPassword123!')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[11px] font-semibold text-cyan-300 transition-colors"
          >
            Usuario (demo@cospace.com)
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-400">
        <span>{t('auth.noAccount')} </span>
        <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
          {t('auth.submitRegister')}
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="text-center text-slate-400 text-xs">Cargando formulario...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
