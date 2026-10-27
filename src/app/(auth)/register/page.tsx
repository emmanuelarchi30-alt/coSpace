'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/I18nContext';
import { UserPlus, User, Lock, Mail, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import ElectricButton from '@/components/ui/ElectricButton';
import { markTabSessionActive, saveUserEmail } from '@/lib/cookieConsent';

export default function RegisterPage(): React.JSX.Element {
  const { t } = useI18n();
  const router = useRouter();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al registrar la cuenta');
        setLoading(false);
        return;
      }

      // Marcar sesión activa en la pestaña y persistir datos
      markTabSessionActive();
      saveUserEmail(email);

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Error al conectar con el servidor.');
      setLoading(false);
    }
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
          {t('auth.registerTitle', 'Crear Cuenta en CoSpace')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('auth.registerSubtitle', 'Empieza a reservar escritorios y salas de coworking por horas')}
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
            {t('form.name', 'Nombre completo')}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              className="w-full liquid-glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {t('form.email', 'Correo electrónico')}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
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
            {t('form.password', 'Contraseña (mínimo 6 caracteres)')}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full liquid-glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="mt-2">
          <ElectricButton
            type="submit"
            disabled={loading}
            color="#8b5cf6"
            borderRadius={12}
            thickness={1.3}
            wrapperClassName="w-full"
            className="w-full liquid-glass-btn py-3 rounded-xl font-bold text-white text-sm border border-purple-500/50 hover:border-purple-300 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creando cuenta...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{t('auth.submitRegister', 'Registrarme')}</span>
              </>
            )}
          </ElectricButton>
        </div>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        <span>{t('auth.hasAccount', '¿Ya tienes una cuenta registrada?')} </span>
        <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
          {t('auth.submitLogin', 'Inicia sesión')}
        </Link>
      </div>
    </div>
  );
}
