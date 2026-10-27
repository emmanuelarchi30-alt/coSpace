'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/I18nContext';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  KeyRound,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import ElectricButton from './ElectricButton';

export interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onSuccess,
}) => {
  const { t } = useI18n();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Estados del formulario de inicio de sesión
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Estados del formulario de registro
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regLoading, setRegLoading] = useState<boolean>(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Estado de éxito
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sincronizar pestaña activa con la prop initialTab al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setLoginError(null);
      setRegError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Manejo de envío de inicio de sesión
  const handleLoginSubmit = async (e?: React.FormEvent, customEmail?: string, customPass?: string): Promise<void> => {
    if (e) e.preventDefault();
    setLoginError(null);
    setSuccessMsg(null);
    setLoginLoading(true);

    const emailToSend = customEmail ?? loginEmail;
    const passToSend = customPass ?? loginPassword;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSend, password: passToSend }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Credenciales inválidas');
        setLoginLoading(false);
        return;
      }

      setSuccessMsg(`¡Bienvenido, ${data.user?.name || 'Usuario'}!`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        router.refresh();
      }, 700);
    } catch {
      setLoginError('Error de red al conectar con el servidor.');
      setLoginLoading(false);
    }
  };

  // Manejo de envío de registro de cuenta
  const handleRegisterSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setRegError(null);
    setSuccessMsg(null);
    setRegLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegError(data.error || 'Error al crear la cuenta');
        setRegLoading(false);
        return;
      }

      setSuccessMsg('¡Cuenta creada exitosamente! Iniciando sesión...');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        router.refresh();
      }, 700);
    } catch {
      setRegError('Error de conexión con el servidor.');
      setRegLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="liquid-glass p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl w-full max-w-md relative animate-in zoom-in-95 duration-200">
        {/* Botón de cierre */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pestañas de Navegación Modal */}
        <div className="flex rounded-2xl bg-white/5 p-1 mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError(null);
              setRegError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t('nav.login', 'Iniciar Sesión')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setLoginError(null);
              setRegError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'register'
                ? 'bg-linear-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t('nav.register', 'Registrarse')}</span>
          </button>
        </div>

        {/* Alerta de éxito */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ===================== TAB: INICIAR SESIÓN ===================== */}
        {activeTab === 'login' && (
          <div>
            <div className="text-center mb-5">
              <h2 className="text-xl font-black text-white tracking-tight">
                {t('auth.loginTitle', 'Bienvenido de nuevo')}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {t('auth.loginSubtitle', 'Accede a tu cuenta de CoSpace para gestionar tus reservas.')}
              </p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('form.email', 'Correo electrónico')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full liquid-glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('form.password', 'Contraseña')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full liquid-glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <ElectricButton
                type="submit"
                disabled={loginLoading}
                color="#06b6d4"
                borderRadius={12}
                thickness={1.3}
                wrapperClassName="w-full mt-2"
                className="w-full liquid-glass-btn py-3 rounded-xl font-bold text-white text-sm border border-cyan-500/40 hover:border-cyan-300 shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{t('auth.submitLogin', 'Ingresar a CoSpace')}</span>
                  </>
                )}
              </ElectricButton>
            </form>

            {/* Credenciales de Prueba del Seed con marco de botón y animación de rayo */}
            <div className="mt-5 pt-4 border-t border-white/10 text-center">
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
                  onClick={() => {
                    setLoginEmail('admin@cospace.com');
                    setLoginPassword('AdminPassword123!');
                    setLoginError(null);
                  }}
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
                  onClick={() => {
                    setLoginEmail('demo@cospace.com');
                    setLoginPassword('UserPassword123!');
                    setLoginError(null);
                  }}
                  wrapperClassName="w-full sm:w-auto"
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/50 text-cyan-300 font-semibold text-xs shadow-md shadow-cyan-500/10 transition-all hover:bg-cyan-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Usuario (demo@cospace.com)</span>
                </ElectricButton>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-slate-400">
              <span>{t('auth.noAccount', '¿No tienes una cuenta aún?')} </span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setLoginError(null);
                  setRegError(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
              >
                {t('auth.submitRegister', 'Regístrate aquí')}
              </button>
            </div>
          </div>
        )}

        {/* ===================== TAB: CREAR CUENTA ===================== */}
        {activeTab === 'register' && (
          <div>
            <div className="text-center mb-5">
              <h2 className="text-xl font-black text-white tracking-tight">
                {t('auth.registerTitle', 'Crear Cuenta en CoSpace')}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {t('auth.registerSubtitle', 'Empieza a reservar escritorios y salas por horas.')}
              </p>
            </div>

            {regError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('form.name', 'Nombre completo')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Juan Pérez"
                    className="w-full liquid-glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('form.email', 'Correo electrónico')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full liquid-glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('form.password', 'Contraseña (mínimo 6 caracteres)')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full liquid-glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <ElectricButton
                type="submit"
                disabled={regLoading}
                color="#8b5cf6"
                borderRadius={12}
                thickness={1.3}
                wrapperClassName="w-full mt-2"
                className="w-full liquid-glass-btn py-3 rounded-xl font-bold text-white text-sm border border-purple-500/50 hover:border-purple-300 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {regLoading ? (
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
            </form>

            <div className="mt-4 text-center text-xs text-slate-400">
              <span>{t('auth.hasAccount', '¿Ya tienes una cuenta registrada?')} </span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setLoginError(null);
                  setRegError(null);
                }}
                className="text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer"
              >
                {t('auth.submitLogin', 'Inicia sesión aquí')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
