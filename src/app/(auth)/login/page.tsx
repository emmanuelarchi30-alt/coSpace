'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n/I18nContext';
import { LogIn, Lock, Mail, AlertCircle, Loader2, KeyRound, ArrowLeft, ShieldAlert, User } from 'lucide-react';
import ElectricButton from '@/components/ui/ElectricButton';

function LoginFormContent(): React.JSX.Element {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const performLogin = async (loginEmail: string, loginPass: string): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const fillCredentials = (userEmail: string, userPass: string): void => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="liquid-glass p-8 rounded-3xl border border-white/20 shadow-2xl relative">
      {/* Botón de regreso al inicio */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>{t('detail.back', 'Volver al Inicio')}</span>
        </Link>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-white tracking-tight">
          {t('auth.loginTitle', 'Iniciar Sesión')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('auth.loginSubtitle', 'Accede a tu cuenta de CoSpace para gestionar tus reservas')}
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
            {t('form.email', 'Correo electrónico')}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
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
            {t('form.password', 'Contraseña')}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
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

        <div className="mt-2">
          <ElectricButton
            type="submit"
            disabled={loading}
            color="#06b6d4"
            borderRadius={12}
            thickness={1.3}
            wrapperClassName="w-full"
            className="w-full liquid-glass-btn py-3 rounded-xl font-bold text-white text-sm border border-cyan-500/40 hover:border-cyan-300 shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t('auth.submitLogin', 'Ingresar a CoSpace')}</span>
              </>
            )}
          </ElectricButton>
        </div>
      </form>

      {/* Demo Credentials Quick Fill con marco de botón y animación de rayo */}
      <div className="mt-6 pt-5 border-t border-white/10 text-center">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center justify-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
          Credenciales de Prueba del Seed:
        </span>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-3">
          <ElectricButton
            type="button"
            color="#f59e0b"
            borderRadius={12}
            thickness={1.3}
            speed={1}
            glow={0.8}
            arcs={1}
            onClick={() => fillCredentials('admin@cospace.com', 'AdminPassword123!')}
            wrapperClassName="w-full sm:w-auto"
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/50 text-amber-300 font-semibold text-xs shadow-md shadow-amber-500/10 transition-all hover:bg-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin (admin@cospace.com)</span>
          </ElectricButton>
          <ElectricButton
            type="button"
            color="#06b6d4"
            borderRadius={12}
            thickness={1.3}
            speed={1}
            glow={0.8}
            arcs={1}
            onClick={() => fillCredentials('demo@cospace.com', 'UserPassword123!')}
            wrapperClassName="w-full sm:w-auto"
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/50 text-cyan-300 font-semibold text-xs shadow-md shadow-cyan-500/10 transition-all hover:bg-cyan-500/20 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>Usuario (demo@cospace.com)</span>
          </ElectricButton>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-400">
        <span>{t('auth.noAccount', '¿No tienes una cuenta aún?')} </span>
        <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
          {t('auth.submitRegister', 'Regístrate aquí')}
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
