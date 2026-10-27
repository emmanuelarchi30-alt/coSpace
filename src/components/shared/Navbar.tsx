'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/I18nContext';
import LanguageSelector from '@/components/ui/LanguageSelector';
import ClientLocalClock from '@/components/ui/ClientLocalClock';
import ElectricButton from '@/components/ui/ElectricButton';
import { useAuthModal } from '@/lib/AuthModalContext';
import { isTabSessionActive, clearTabSession } from '@/lib/cookieConsent';
import { Building2, Calendar, LayoutDashboard, LogIn, LogOut, ShieldAlert, Sparkles, Menu, X } from 'lucide-react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export const Navbar: React.FC = () => {
  const { t } = useI18n();
  const { openLoginModal, openRegisterModal } = useAuthModal();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  useEffect(() => {
    setMobileNavOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const fetchSession = async (): Promise<void> => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          // Si el usuario cerró la pestaña previa sin cerrar sesión manualmente,
          // la sesión activa de la pestaña habrá expirado en sessionStorage.
          // En tal caso, se cierra automáticamente la sesión en el servidor
          // cumpliendo con la directriz de seguridad solicitada.
          if (!isTabSessionActive()) {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            clearTabSession();
          } else {
            setUser(data.user);
          }
        } else {
          setUser(null);
          clearTabSession();
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [pathname]);

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      clearTabSession();
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Error logging out:', e);
    }
  };

  const isActive = (path: string): boolean => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full liquid-glass-nav border-b border-white/10 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-white/25 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-linear-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              CoSpace
            </span>
            <span className="text-[10px] tracking-widest uppercase text-cyan-400 font-mono font-medium">
              Liquid Coworking
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <Link
            href="/"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isActive('/')
                ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            href="/spaces"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isActive('/spaces')
                ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {t('nav.spaces')}
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                isActive('/dashboard')
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              {t('nav.dashboard')}
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                isActive('/admin')
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              {t('nav.admin')}
            </Link>
          )}
        </nav>

        {/* Right Side: Hydration Clock, Language Selector & Auth */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Hydration Safe Client Clock */}
          <div className="hidden lg:block">
            <ClientLocalClock />
          </div>

          {/* Language Selector */}
          <LanguageSelector />

          {/* Auth Section */}
          {!loading && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md transition-all text-sm font-medium text-white shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline font-medium text-slate-200">
                      {user.name.split(' ')[0]}
                    </span>
                    {user.role === 'ADMIN' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Admin
                      </span>
                    )}
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl liquid-glass border border-white/20 p-2 shadow-2xl z-50">
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-200 hover:bg-white/10 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                        {t('nav.dashboard')}
                      </Link>

                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-cyan-400" />
                          {t('nav.admin')}
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ElectricButton
                    onClick={openLoginModal}
                    color="#06b6d4"
                    borderRadius={12}
                    thickness={1.2}
                    className="liquid-glass-btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 border border-cyan-500/40 hover:border-cyan-400 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-cyan-300" />
                    <span>{t('nav.login')}</span>
                  </ElectricButton>
                  <ElectricButton
                    onClick={openRegisterModal}
                    color="#8b5cf6"
                    borderRadius={12}
                    thickness={1.3}
                    className="liquid-glass-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 border border-purple-500/50 hover:border-purple-400 shadow-lg shadow-purple-500/30 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>{t('nav.register')}</span>
                  </ElectricButton>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200"
            aria-label="Abrir menú de navegación"
          >
            {mobileNavOpen ? <X className="w-5 h-5 text-cyan-300" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 liquid-glass flex flex-col gap-2">
          <Link
            href="/"
            onClick={() => setMobileNavOpen(false)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-white/15 text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            href="/spaces"
            onClick={() => setMobileNavOpen(false)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive('/spaces')
                ? 'bg-white/15 text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t('nav.spaces')}
          </Link>
          {user && (
            <Link
              href="/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('nav.dashboard')}
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMobileNavOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-amber-300 hover:bg-amber-500/10"
            >
              {t('nav.admin')}
            </Link>
          )}
          {!user && (
            <div className="flex items-center gap-2 pt-2 border-t border-white/10 mt-1">
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  openLoginModal();
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-center text-white liquid-glass-btn-secondary border border-cyan-500/40 cursor-pointer"
              >
                {t('nav.login')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  openRegisterModal();
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-center text-white liquid-glass-btn border border-purple-500/50 cursor-pointer"
              >
                {t('nav.register')}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
